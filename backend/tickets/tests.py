from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User, Ticket


class RegisterViewTest(APITestCase):

    def test_register_student(self):
        data = {'username': 'student1', 'email': 'student1@test.com', 'password': 'TestPass123!', 'role': 'student'}
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.get().role, 'student')

    def test_register_technician(self):
        data = {'username': 'tech1', 'email': 'tech1@test.com', 'password': 'TestPass123!', 'role': 'technician'}
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.get().role, 'technician')

    def test_register_default_role_is_student(self):
        data = {'username': 'user1', 'email': 'user1@test.com', 'password': 'TestPass123!'}
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.get().role, 'student')

    def test_register_duplicate_username_fails(self):
        User.objects.create_user(username='existing', password='pass123', email='e@test.com')
        data = {'username': 'existing', 'email': 'new@test.com', 'password': 'TestPass123!'}
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_not_returned(self):
        data = {'username': 'user1', 'email': 'user1@test.com', 'password': 'TestPass123!'}
        response = self.client.post('/api/auth/register/', data)
        self.assertNotIn('password', response.data)


class AuthLoginTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='TestPass123!', email='test@test.com', role='student'
        )

    def test_login_returns_access_and_refresh_tokens(self):
        response = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'TestPass123!'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid_password_fails(self):
        response = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'wrongpassword'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_user_fails(self):
        response = self.client.post('/api/auth/login/', {'username': 'nobody', 'password': 'TestPass123!'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class MeViewTest(APITestCase):

    def setUp(self):
        self.student = User.objects.create_user(
            username='meuser', password='TestPass123!', email='me@test.com', role='student'
        )
        self.technician = User.objects.create_user(
            username='tech1', password='TestPass123!', email='tech@test.com', role='technician'
        )

    def test_get_me_returns_current_user(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'meuser')
        self.assertEqual(response.data['role'], 'student')

    def test_get_me_returns_correct_role_for_technician(self):
        self.client.force_authenticate(user=self.technician)
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.data['role'], 'technician')

    def test_get_me_unauthenticated_returns_401(self):
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_me_does_not_expose_password(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/auth/me/')
        self.assertNotIn('password', response.data)


class TicketListCreateViewTest(APITestCase):

    def setUp(self):
        self.student = User.objects.create_user(
            username='student1', password='TestPass123!', email='s1@test.com', role='student'
        )
        self.student2 = User.objects.create_user(
            username='student2', password='TestPass123!', email='s2@test.com', role='student'
        )
        self.technician = User.objects.create_user(
            username='tech1', password='TestPass123!', email='t1@test.com', role='technician'
        )
        Ticket.objects.create(
            reporter=self.student, location='Lab A', equipment_id='PC-01', description='Monitor no enciende'
        )
        Ticket.objects.create(
            reporter=self.student2, location='Lab B', equipment_id='PC-02', description='Teclado dañado'
        )

    def test_student_sees_only_own_tickets(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/tickets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['equipment_id'], 'PC-01')

    def test_technician_sees_all_tickets(self):
        self.client.force_authenticate(user=self.technician)
        response = self.client.get('/api/tickets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_ticket_sets_reporter_and_status_open(self):
        self.client.force_authenticate(user=self.student)
        data = {'location': 'Lab C', 'equipment_id': 'PC-03', 'description': 'Sin internet'}
        response = self.client.post('/api/tickets/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['reporter'], self.student.id)
        self.assertEqual(response.data['status'], 'OPEN')

    def test_create_ticket_reporter_name_field(self):
        self.client.force_authenticate(user=self.student)
        data = {'location': 'Lab C', 'equipment_id': 'PC-03', 'description': 'Sin internet'}
        response = self.client.post('/api/tickets/', data)
        self.assertEqual(response.data['reporter_name'], 'student1')

    def test_unauthenticated_cannot_list_tickets(self):
        response = self.client.get('/api/tickets/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_cannot_create_ticket(self):
        data = {'location': 'Lab D', 'equipment_id': 'PC-04', 'description': 'Sin internet'}
        response = self.client.post('/api/tickets/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TicketDetailViewTest(APITestCase):

    def setUp(self):
        self.student = User.objects.create_user(
            username='student1', password='TestPass123!', email='s1@test.com', role='student'
        )
        self.student2 = User.objects.create_user(
            username='student2', password='TestPass123!', email='s2@test.com', role='student'
        )
        self.technician = User.objects.create_user(
            username='tech1', password='TestPass123!', email='t1@test.com', role='technician'
        )
        self.ticket = Ticket.objects.create(
            reporter=self.student, location='Lab A', equipment_id='PC-01', description='Monitor no enciende'
        )

    def test_student_can_view_own_ticket(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(f'/api/tickets/{self.ticket.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['equipment_id'], 'PC-01')
        self.assertEqual(response.data['reporter_name'], 'student1')

    def test_student_cannot_view_another_students_ticket(self):
        self.client.force_authenticate(user=self.student2)
        response = self.client.get(f'/api/tickets/{self.ticket.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_technician_can_view_any_ticket(self):
        self.client.force_authenticate(user=self.technician)
        response = self.client.get(f'/api/tickets/{self.ticket.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_technician_can_update_status_to_in_progress(self):
        self.client.force_authenticate(user=self.technician)
        response = self.client.patch(f'/api/tickets/{self.ticket.id}/', {
            'status': 'IN_PROGRESS', 'resolution_comment': 'Revisando el equipo'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, 'IN_PROGRESS')
        self.assertEqual(self.ticket.resolution_comment, 'Revisando el equipo')

    def test_technician_can_resolve_ticket(self):
        self.client.force_authenticate(user=self.technician)
        self.client.patch(f'/api/tickets/{self.ticket.id}/', {
            'status': 'RESOLVED', 'resolution_comment': 'Monitor reemplazado'
        })
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, 'RESOLVED')

    def test_student_cannot_update_ticket(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.patch(f'/api/tickets/{self.ticket.id}/', {'status': 'RESOLVED'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_view_ticket(self):
        response = self.client.get(f'/api/tickets/{self.ticket.id}/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TicketModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username='u', password='pass', email='u@test.com', role='student'
        )

    def test_default_status_is_open(self):
        ticket = Ticket.objects.create(
            reporter=self.user, location='Lab A', equipment_id='PC-01', description='Falla'
        )
        self.assertEqual(ticket.status, 'OPEN')

    def test_str_representation(self):
        ticket = Ticket.objects.create(
            reporter=self.user, location='Lab A', equipment_id='PC-01', description='Falla'
        )
        self.assertEqual(str(ticket), 'PC-01 - OPEN')

    def test_resolution_comment_is_optional(self):
        ticket = Ticket.objects.create(
            reporter=self.user, location='Lab A', equipment_id='PC-01', description='Falla'
        )
        self.assertIsNone(ticket.resolution_comment)

    def test_ticket_belongs_to_reporter(self):
        ticket = Ticket.objects.create(
            reporter=self.user, location='Lab A', equipment_id='PC-01', description='Falla'
        )
        self.assertEqual(ticket.reporter, self.user)
        self.assertEqual(self.user.tickets.count(), 1)
