import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Clock, Calendar, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

interface DailyLog {
  id: number;
  date: string;
  description: string;
  hoursSpent: number;
}

export default function DailyLogs() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState<Partial<DailyLog> | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('DailyLogs');
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch daily logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const openAddModal = () => {
    setCurrentLog({
      date: new Date().toISOString().split('T')[0],
      description: '',
      hoursSpent: 1
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (log: DailyLog) => {
    const formattedDate = new Date(log.date || (log as any).Date).toISOString().split('T')[0];
    setCurrentLog({
      ...log,
      date: formattedDate,
      hoursSpent: log.hoursSpent || (log as any).HoursSpent,
      description: log.description || (log as any).Description
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentLog(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLog || !currentLog.description?.trim()) {
      setModalError('Description is required');
      return;
    }
    const hours = Number(currentLog.hoursSpent);
    if (isNaN(hours) || hours <= 0) {
      setModalError('Hours spent must be a positive number');
      return;
    }

    setModalLoading(true);
    setModalError(null);

    // Prepare payload
    const logPayload = {
      ...currentLog,
      hoursSpent: hours,
      date: new Date(currentLog.date || '').toISOString()
    };

    try {
      if (currentLog.id) {
        // Edit Mode
        await api.put(`DailyLogs/${currentLog.id}`, logPayload);
      } else {
        // Add Mode
        await api.post('DailyLogs', logPayload);
      }
      fetchLogs();
      closeModal();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save daily log.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    try {
      await api.delete(`DailyLogs/${id}`);
      setLogs(logs.filter(l => l.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete daily log.');
    }
  };

  const totalHours = logs.reduce((sum, log) => sum + (log.hoursSpent || (log as any).HoursSpent || 0), 0);

  return (
    <div>
      <div className="content-header">
        <div>
          <h1>Daily Activity Logs</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Document hours spent on manual testing, script writing, and debugging.</p>
        </div>
        <button id="add-log-btn" className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Log Hours
        </button>
      </div>

      {/* Metrics mini card */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TOTAL WORK TIME logged</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalHours} Hours</div>
          </div>
        </div>
        <span className="badge badge-cyan" style={{ padding: '0.5rem 1rem' }}>Active Tracker</span>
      </div>

      <div className="glass-card">
        <div className="glass-card-title">
          <span>Logged Sessions</span>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Loading daily logs...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--accent-rose)' }}>
            <AlertCircle size={36} style={{ marginBottom: '0.5rem' }} />
            <p>{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>No activity logs recorded yet. Log your first session today!</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Date</th>
                  <th style={{ width: '60%' }}>Description</th>
                  <th style={{ width: '15%' }}>Hours Spent</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const dateVal = log.date || (log as any).Date;
                  const hoursVal = log.hoursSpent || (log as any).HoursSpent;
                  const descVal = log.description || (log as any).Description;

                  return (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={14} style={{ color: 'var(--accent-cyan)' }} />
                          {new Date(dateVal).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-primary)' }}>{descVal}</td>
                      <td>
                        <span className="badge badge-purple" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {hoursVal} hrs
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                          <button className="btn-icon-only" onClick={() => openEditModal(log)} title="Edit Log">
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-icon-only danger" onClick={() => handleDelete(log.id)} title="Delete Log">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && currentLog && (
        <div className="modal-overlay">
          <div className="modal-content animate-slideUp">
            <div className="modal-header">
              <h3 className="modal-title">{currentLog.id ? 'Edit Log Entry' : 'Log Daily Work'}</h3>
              <button className="btn-icon-only" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            
            {modalError && <div className="auth-error">{modalError}</div>}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={currentLog.date || ''}
                  onChange={(e) => setCurrentLog({ ...currentLog, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hours Spent</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="24"
                  placeholder="Number of hours spent"
                  value={currentLog.hoursSpent || ''}
                  onChange={(e) => setCurrentLog({ ...currentLog, hoursSpent: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Activity Description</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Documented testing activities (e.g. Conducted integration tests on API auth, logged 3 bugs, verified UI overlays)"
                  value={currentLog.description || ''}
                  onChange={(e) => setCurrentLog({ ...currentLog, description: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={modalLoading}>
                  Cancel
                </button>
                <button id="log-modal-save-btn" type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : 'Save Log Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
