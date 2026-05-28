import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('auth/register/', { username, email, password, role });
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (error) {
      alert('Error al registrar. Intenta con otro usuario.');
    }
  };

  return (
    <div className="auth-container card">
      <h2>Registro</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Usuario</label>
          <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Rol</label>
          <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
            <option value="student">Estudiante / Docente</option>
            <option value="technician">Técnico</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Registrarse</button>
      </form>
      <p style={{marginTop: '1rem', textAlign: 'center'}}>
        ¿Ya tienes cuenta? <Link to="/login" style={{color: 'var(--primary-color)'}}>Inicia Sesión</Link>
      </p>
    </div>
  );
}

export default Register;
