from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, Ticket
from .serializers import UserSerializer, TicketSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer


class MeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class TicketListCreateView(generics.ListCreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'technician':
            return Ticket.objects.all().order_by('-created_at')
        return Ticket.objects.filter(reporter=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)


class TicketDetailView(generics.RetrieveUpdateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'technician':
            return Ticket.objects.all()
        return Ticket.objects.filter(reporter=user)

    def update(self, request, *args, **kwargs):
        if request.user.role != 'technician':
            return Response({'detail': 'Not authorized to update tickets.'}, status=403)

        instance = self.get_object()
        instance.status = request.data.get('status', instance.status)
        instance.resolution_comment = request.data.get('resolution_comment', instance.resolution_comment)
        instance.save()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)
