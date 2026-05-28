import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('auth/login/', { username, password });
      localStorage.setItem('token', res.data.access);
      
      const userRes = await api.get('auth/me/');
      localStorage.setItem('user', JSON.stringify(userRes.data));
      
      window.location.href = '/dashboard';
    } catch (error) {
      alert('Error al iniciar sesión. Revisa tus credenciales.');
    }
  };

  return (
    <div className="auth-container card">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Usuario</label>
          <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Entrar</button>
      </form>
      <p style={{marginTop: '1rem', textAlign: 'center'}}>
        ¿No tienes cuenta? <Link to="/register" style={{color: 'var(--primary-color)'}}>Regístrate</Link>
      </p>
    </div>
  );
}

export default Login;
