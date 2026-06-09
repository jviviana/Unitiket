import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: { request: { use: vi.fn(), handlers: [] } },
    defaults: { baseURL: 'http://127.0.0.1:8000/api/' },
  },
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    delete window.location;
    window.location = { href: '' };
  });

  it('renderiza el formulario de inicio de sesión', () => {
    renderLogin();
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('muestra los campos de usuario y contraseña', () => {
    const { container } = renderLogin();
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument();
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it('muestra enlace a la página de registro', () => {
    renderLogin();
    expect(screen.getByText('Regístrate')).toBeInTheDocument();
  });

  it('guarda token y usuario en localStorage tras login exitoso', async () => {
    api.post.mockResolvedValueOnce({ data: { access: 'access-token-abc' } });
    api.get.mockResolvedValueOnce({ data: { username: 'testuser', role: 'student' } });

    const { container } = renderLogin();
    fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: 'testuser' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'password123' } });
    fireEvent.submit(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('access-token-abc');
      expect(JSON.parse(localStorage.getItem('user'))).toEqual({ username: 'testuser', role: 'student' });
    });
  });

  it('llama al endpoint correcto con las credenciales', async () => {
    api.post.mockResolvedValueOnce({ data: { access: 'token' } });
    api.get.mockResolvedValueOnce({ data: { username: 'u', role: 'student' } });

    const { container } = renderLogin();
    fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: 'usuario' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'clave' } });
    fireEvent.submit(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('auth/login/', { username: 'usuario', password: 'clave' });
      expect(api.get).toHaveBeenCalledWith('auth/me/');
    });
  });

  it('muestra alerta cuando las credenciales son inválidas', async () => {
    api.post.mockRejectedValueOnce(new Error('Unauthorized'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { container } = renderLogin();
    fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: 'user' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'wrong' } });
    fireEvent.submit(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error al iniciar sesión. Revisa tus credenciales.');
    });

    alertSpy.mockRestore();
  });

  it('no guarda nada en localStorage si el login falla', async () => {
    api.post.mockRejectedValueOnce(new Error('Unauthorized'));
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { container } = renderLogin();
    fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: 'user' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'wrong' } });
    fireEvent.submit(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});
