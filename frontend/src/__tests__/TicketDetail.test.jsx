import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TicketDetail from '../pages/TicketDetail';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    interceptors: { request: { use: vi.fn(), handlers: [] } },
    defaults: { baseURL: 'http://127.0.0.1:8000/api/' },
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockTicket = {
  id: 1,
  equipment_id: 'PC-01',
  location: 'Laboratorio de Redes',
  description: 'El monitor no enciende al pulsar el botón de encendido.',
  status: 'OPEN',
  resolution_comment: null,
  created_at: '2026-06-01T10:00:00Z',
  reporter_name: 'student1',
};

const renderTicketDetail = () =>
  render(
    <MemoryRouter initialEntries={['/ticket/1']}>
      <Routes>
        <Route path="/ticket/:id" element={<TicketDetail />} />
      </Routes>
    </MemoryRouter>
  );

describe('TicketDetail', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('carga del ticket', () => {
    it('muestra "Cargando..." mientras se obtiene el ticket', () => {
      api.get.mockReturnValue(new Promise(() => {}));
      localStorage.setItem('user', JSON.stringify({ role: 'student' }));
      renderTicketDetail();
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('muestra los datos del ticket tras la carga', async () => {
      api.get.mockResolvedValueOnce({ data: mockTicket });
      localStorage.setItem('user', JSON.stringify({ role: 'technician' }));
      renderTicketDetail();
      await waitFor(() => {
        expect(screen.getByText(/Ticket #1 - PC-01/)).toBeInTheDocument();
        expect(screen.getByText('Laboratorio de Redes')).toBeInTheDocument();
        expect(screen.getByText('student1')).toBeInTheDocument();
      });
    });

    it('redirige al dashboard si falla la carga', async () => {
      api.get.mockRejectedValueOnce(new Error('Not Found'));
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      localStorage.setItem('user', JSON.stringify({ role: 'student' }));
      renderTicketDetail();
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('vista de técnico', () => {
    beforeEach(() => {
      localStorage.setItem('user', JSON.stringify({ role: 'technician' }));
      api.get.mockResolvedValue({ data: mockTicket });
    });

    it('muestra el formulario de gestión', async () => {
      renderTicketDetail();
      await waitFor(() => {
        expect(screen.getByText('Gestión del Ticket (Técnico)')).toBeInTheDocument();
      });
    });

    it('muestra el selector con los tres estados', async () => {
      renderTicketDetail();
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Abierto' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'En Progreso' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Resuelto' })).toBeInTheDocument();
      });
    });

    it('envía patch con el estado y comentario actualizados', async () => {
      api.patch.mockResolvedValueOnce({ data: mockTicket });
      api.get.mockResolvedValue({ data: mockTicket });
      renderTicketDetail();

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'IN_PROGRESS' } });
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Revisando el equipo ahora' } });
      fireEvent.submit(screen.getByRole('button', { name: /actualizar ticket/i }));

      await waitFor(() => {
        expect(api.patch).toHaveBeenCalledWith('tickets/1/', {
          status: 'IN_PROGRESS',
          resolution_comment: 'Revisando el equipo ahora',
        });
      });
    });

    it('muestra alerta de éxito al actualizar', async () => {
      api.patch.mockResolvedValueOnce({ data: mockTicket });
      api.get.mockResolvedValue({ data: mockTicket });
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      renderTicketDetail();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /actualizar ticket/i })).toBeInTheDocument();
      });
      fireEvent.submit(screen.getByRole('button', { name: /actualizar ticket/i }));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Ticket actualizado correctamente');
      });
      alertSpy.mockRestore();
    });

    it('muestra alerta de error si la actualización falla', async () => {
      api.patch.mockRejectedValueOnce(new Error('Error'));
      api.get.mockResolvedValue({ data: mockTicket });
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      renderTicketDetail();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /actualizar ticket/i })).toBeInTheDocument();
      });
      fireEvent.submit(screen.getByRole('button', { name: /actualizar ticket/i }));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error al actualizar el ticket');
      });
      alertSpy.mockRestore();
    });
  });

  describe('vista de estudiante', () => {
    beforeEach(() => {
      localStorage.setItem('user', JSON.stringify({ role: 'student' }));
    });

    it('NO muestra el formulario de gestión', async () => {
      api.get.mockResolvedValueOnce({ data: mockTicket });
      renderTicketDetail();
      await waitFor(() => {
        expect(screen.getByText(/Ticket #1/)).toBeInTheDocument();
      });
      expect(screen.queryByText('Gestión del Ticket (Técnico)')).not.toBeInTheDocument();
    });

    it('muestra el comentario de resolución cuando existe', async () => {
      api.get.mockResolvedValueOnce({
        data: { ...mockTicket, status: 'RESOLVED', resolution_comment: 'Monitor reemplazado correctamente.' },
      });
      renderTicketDetail();
      await waitFor(() => {
        expect(screen.getByText('Monitor reemplazado correctamente.')).toBeInTheDocument();
      });
    });

    it('no muestra sección de resolución si no hay comentario', async () => {
      api.get.mockResolvedValueOnce({ data: mockTicket });
      renderTicketDetail();
      await waitFor(() => {
        expect(screen.getByText(/PC-01/)).toBeInTheDocument();
      });
      expect(screen.queryByText('Comentario de Resolución:')).not.toBeInTheDocument();
    });
  });

  describe('navegación', () => {
    it('muestra botón para volver al tablero', async () => {
      api.get.mockResolvedValueOnce({ data: mockTicket });
      localStorage.setItem('user', JSON.stringify({ role: 'student' }));
      renderTicketDetail();
      await waitFor(() => {
        expect(screen.getByText(/Volver al Tablero/)).toBeInTheDocument();
      });
    });

    it('navega al dashboard al hacer click en Volver', async () => {
      api.get.mockResolvedValueOnce({ data: mockTicket });
      localStorage.setItem('user', JSON.stringify({ role: 'student' }));
      renderTicketDetail();
      await waitFor(() => {
        expect(screen.getByText(/Volver al Tablero/)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText(/Volver al Tablero/));
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
