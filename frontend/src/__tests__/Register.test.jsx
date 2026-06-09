import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/Register';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
    interceptors: { request: { use: vi.fn(), handlers: [] } },
    defaults: { baseURL: 'http://127.0.0.1:8000/api/' },
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el formulario de registro', () => {
    renderRegister();
    expect(screen.getByText('Registro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
  });

  it('muestra todos los campos del formulario', () => {
    const { container } = renderRegister();
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument();
    expect(container.querySelector('input[type="email"]')).toBeInTheDocument();
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
    expect(container.querySelector('select')).toBeInTheDocument();
  });

  it('tiene "Estudiante / Docente" como rol por defecto', () => {
    renderRegister();
    expect(screen.getByRole('combobox').value).toBe('student');
  });

  it('permite seleccionar el rol de Técnico', () => {
    renderRegister();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'technician' } });
    expect(screen.getByRole('combobox').value).toBe('technician');
  });

  it('muestra enlace a login', () => {
    renderRegister();
    expect(screen.getByText('Inicia Sesión')).toBeInTheDocument();
  });

  it('llama al endpoint correcto con los datos del formulario', async () => {
    api.post.mockResolvedValueOnce({ data: {} });
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { container } = renderRegister();
    fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: 'nuevousuario' } });
    fireEvent.change(container.querySelector('input[type="email"]'), { target: { value: 'nuevo@test.com' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'SecurePass123!' } });
    fireEvent.submit(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('auth/register/', {
        username: 'nuevousuario',
        email: 'nuevo@test.com',
        password: 'SecurePass123!',
        role: 'student',
      });
    });
  });

  it('redirige a /login tras registro exitoso', async () => {
    api.post.mockResolvedValueOnce({ data: {} });
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { container } = renderRegister();
    fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: 'user' } });
    fireEvent.change(container.querySelector('input[type="email"]'), { target: { value: 'user@test.com' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('muestra alerta de éxito tras registro exitoso', async () => {
    api.post.mockResolvedValueOnce({ data: {} });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { container } = renderRegister();
    fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: 'user' } });
    fireEvent.change(container.querySelector('input[type="email"]'), { target: { value: 'user@test.com' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Registro exitoso. Ahora puedes iniciar sesión.');
    });

    alertSpy.mockRestore();
  });

  it('muestra alerta de error si el registro falla', async () => {
    api.post.mockRejectedValueOnce(new Error('Bad Request'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { container } = renderRegister();
    fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: 'user' } });
    fireEvent.change(container.querySelector('input[type="email"]'), { target: { value: 'user@test.com' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error al registrar. Intenta con otro usuario.');
    });

    alertSpy.mockRestore();
  });
});
