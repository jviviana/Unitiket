import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [user, setUser] = useState(null);
  
  // Form state
  const [location, setLocation] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('tickets/');
      setTickets(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('tickets/', { location, equipment_id: equipmentId, description });
      setLocation('');
      setEquipmentId('');
      setDescription('');
      fetchTickets();
    } catch (error) {
      alert('Error al crear el ticket');
    }
  };

  const statusLabel = {
    'OPEN': 'Abierto',
    'IN_PROGRESS': 'En Progreso',
    'RESOLVED': 'Resuelto'
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h2>Tablero de Control</h2>
        <span style={{color: 'var(--text-secondary)'}}>Hola, {user?.username} ({user?.role === 'technician' ? 'Técnico' : user?.role === 'teacher' ? 'Docente' : 'Estudiante'})</span>
      </div>

      {user?.role !== 'technician' && (
        <div className="card">
          <h3>Reportar Nueva Incidencia</h3>
          <form onSubmit={handleCreateTicket}>
            <div className="form-group">
              <label>Ubicación (ej. Laboratorio de Redes)</label>
              <input type="text" className="form-control" value={location} onChange={e => setLocation(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Identificador del Equipo (ej. PC-05)</label>
              <input type="text" className="form-control" value={equipmentId} onChange={e => setEquipmentId(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Descripción Detallada</label>
              <textarea className="form-control" rows="3" value={description} onChange={e => setDescription(e.target.value)} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Crear Ticket</button>
          </form>
        </div>
      )}

      <h3>{user?.role === 'technician' ? 'Todos los Tickets' : 'Tus Tickets Reportados'}</h3>
      <div className="ticket-grid">
        {tickets.map(ticket => (
          <div key={ticket.id} className="card">
            <div className="ticket-header">
              <span className={`status-badge status-${ticket.status}`}>{statusLabel[ticket.status]}</span>
              <span className="ticket-meta">{new Date(ticket.created_at).toLocaleDateString()}</span>
            </div>
            <h4 style={{margin: '0.5rem 0'}}>{ticket.equipment_id} en {ticket.location}</h4>
            <p style={{fontSize: '0.9rem', marginBottom: '1rem'}}>{ticket.description.substring(0, 80)}...</p>
            
            <Link to={`/ticket/${ticket.id}`} className="btn btn-outline" style={{width: '100%', display: 'block', boxSizing: 'border-box'}}>
              Ver Detalles
            </Link>
          </div>
        ))}
        {tickets.length === 0 && <p>No hay tickets registrados.</p>}
      </div>
    </div>
  );
}

export default Dashboard;
