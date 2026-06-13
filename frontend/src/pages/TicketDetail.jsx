import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState('');
  const [resolutionComment, setResolutionComment] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`tickets/${id}/`);
      setTicket(res.data);
      setStatus(res.data.status);
      setResolutionComment(res.data.resolution_comment || '');
    } catch (error) {
      console.error(error);
      alert('Error al cargar el ticket');
      navigate('/dashboard');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`tickets/${id}/`, { status, resolution_comment: resolutionComment });
      alert('Ticket actualizado correctamente');
      fetchTicket();
    } catch (error) {
      alert('Error al actualizar el ticket');
    }
  };

  const statusLabel = {
    'OPEN': 'Abierto',
    'IN_PROGRESS': 'En Progreso',
    'RESOLVED': 'Resuelto'
  };

  if (!ticket) return <div>Cargando...</div>;

  return (
    <div className="card" style={{maxWidth: '800px', margin: '0 auto'}}>
      <button className="btn btn-outline" onClick={() => navigate('/dashboard')} style={{marginBottom: '1rem'}}>
        &larr; Volver al Tablero
      </button>

      <div className="ticket-header">
        <h2 style={{margin: 0}}>Ticket #{ticket.id} - {ticket.equipment_id}</h2>
        <span className={`status-badge status-${ticket.status}`}>{statusLabel[ticket.status]}</span>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.5rem 0'}}>
        <div>
          <strong>Ubicación:</strong> <br/>{ticket.location}
        </div>
        <div>
          <strong>Reportado por:</strong> <br/>{ticket.reporter_name}
        </div>
        <div>
          <strong>Fecha:</strong> <br/>{new Date(ticket.created_at).toLocaleString()}
        </div>
      </div>

      <div style={{backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '2rem'}}>
        <strong>Descripción del Problema:</strong>
        <p>{ticket.description}</p>
      </div>

      {user?.role !== 'technician' && ticket.resolution_comment && (
        <div style={{backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '8px', border: '1px solid var(--success-color)'}}>
          <strong>Comentario de Resolución:</strong>
          <p>{ticket.resolution_comment}</p>
        </div>
      )}

      {user?.role === 'technician' && (
        <form onSubmit={handleUpdate} style={{borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem'}}>
          <h3>Gestión del Ticket (Técnico)</h3>
          <div className="form-group">
            <label>Estado</label>
            <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="OPEN">Abierto</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="RESOLVED">Resuelto</option>
            </select>
          </div>
          <div className="form-group">
            <label>Comentario de Resolución</label>
            <textarea 
              className="form-control" 
              rows="4" 
              value={resolutionComment} 
              onChange={e => setResolutionComment(e.target.value)}
              placeholder="Escribe aquí los detalles de la solución o notas..."
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary">Actualizar Ticket</button>
        </form>
      )}
    </div>
  );
}

export default TicketDetail;
