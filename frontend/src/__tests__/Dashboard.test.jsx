import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn(), handlers: [] } },
    defaults: { baseURL: 'http://127.0.0.1:8000/api/' },
  },
}));

const studentUser = { id: 1, username: 'student1', role: 'student' };
const techUser = { id: 2, username: 'tech1', role: 'technician' };

const mockTickets = [
  {
    id: 1,
    equipment_id: 'PC-01',
    location: 'Lab A',
    description: 'Monitor no enciende correctamente en el equipo del laboratorio',
    status: 'OPEN',
    created_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 2,
    equipment_id: 'PC-02',
    location: 'Lab B',
    description: 'Teclado dañado, varias teclas no responden al presionarlas',
    status: 'IN_PROGRESS',
    created_at: '2026-06-02T12:00:00Z',
  },
];

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

describe('Dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('vista de estudiante', () => {
    beforeEach(() => {
      localStorage.setItem('user', JSON.stringify(studentUser));
      api.get.mockResolvedValue({ data: mockTickets.slice(0, 1) });
    });

    it('muestra el formulario para reportar nueva incidencia', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('Reportar Nueva Incidencia')).toBeInTheDocument();
      });
    });

    it('muestra el saludo con nombre y rol del usuario', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText(/Hola, student1/i)).toBeInTheDocument();
        expect(screen.getByText(/Estudiante/i)).toBeInTheDocument();
      });
    });

    it('muestra los tickets del estudiante', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText(/PC-01/)).toBeInTheDocument();
        expect(screen.getByText(/Lab A/)).toBeInTheDocument();
      });
    });

    it('muestra "Tus Tickets Reportados" como título', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('Tus Tickets Reportados')).toBeInTheDocument();
      });
    });

    it('crea un ticket nuevo al enviar el formulario', async () => {
      api.post.mockResolvedValueOnce({ data: {} });
      api.get.mockResolvedValue({ data: [] });

      const { container } = renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('Reportar Nueva Incidencia')).toBeInTheDocument();
      });

      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'Lab C' } });
      fireEvent.change(inputs[1], { target: { value: 'PC-05' } });
      fireEvent.change(container.querySelector('textarea'), { target: { value: 'El mouse no funciona' } });
      fireEvent.submit(screen.getByRole('button', { name: /crear ticket/i }));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('tickets/', {
          location: 'Lab C',
          equipment_id: 'PC-05',
          description: 'El mouse no funciona',
        });
      });
    });

    it('muestra "No hay tickets registrados" cuando no hay tickets', async () => {
      api.get.mockResolvedValue({ data: [] });
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('No hay tickets registrados.')).toBeInTheDocument();
      });
    });
  });

  describe('vista de técnico', () => {
    beforeEach(() => {
      localStorage.setItem('user', JSON.stringify(techUser));
      api.get.mockResolvedValue({ data: mockTickets });
    });

    it('NO muestra el formulario de nuevo ticket', async () => {
      renderDashboard();
      await waitFor(() => { expect(api.get).toHaveBeenCalled(); });
      expect(screen.queryByText('Reportar Nueva Incidencia')).not.toBeInTheDocument();
    });

    it('muestra "Todos los Tickets" como título', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('Todos los Tickets')).toBeInTheDocument();
      });
    });

    it('muestra el saludo con rol Técnico', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText(/Hola, tech1/i)).toBeInTheDocument();
        expect(screen.getByText(/Técnico/i)).toBeInTheDocument();
      });
    });

    it('muestra todos los tickets disponibles', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText(/PC-01/)).toBeInTheDocument();
        expect(screen.getByText(/PC-02/)).toBeInTheDocument();
      });
    });
  });

  describe('etiquetas de estado', () => {
    beforeEach(() => {
      localStorage.setItem('user', JSON.stringify(techUser));
      api.get.mockResolvedValue({ data: mockTickets });
    });

    it('muestra "Abierto" para tickets OPEN', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('Abierto')).toBeInTheDocument();
      });
    });

    it('muestra "En Progreso" para tickets IN_PROGRESS', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('En Progreso')).toBeInTheDocument();
      });
    });

    it('muestra enlace "Ver Detalles" para cada ticket', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getAllByText('Ver Detalles')).toHaveLength(2);
      });
    });
  });
});
