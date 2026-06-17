import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Search, Calendar, Edit2, Trash2, X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface TaskItem {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
  createdDate: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<TaskItem> | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('TaskItems');
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openAddModal = () => {
    setCurrentTask({
      title: '',
      description: '',
      isCompleted: false,
      dueDate: ''
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    // format date for input type="date" (YYYY-MM-DD)
    let formattedDate = '';
    if (task.dueDate) {
      formattedDate = new Date(task.dueDate).toISOString().split('T')[0];
    }
    
    setCurrentTask({
      ...task,
      dueDate: formattedDate
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask || !currentTask.title?.trim()) {
      setModalError('Title is required');
      return;
    }

    setModalLoading(true);
    setModalError(null);

    // Prepare body
    const taskBody = {
      ...currentTask,
      // Ensure dueDate is null instead of empty string if not set
      dueDate: currentTask.dueDate ? new Date(currentTask.dueDate).toISOString() : null
    };

    try {
      if (currentTask.id) {
        // Edit Mode
        await api.put(`TaskItems/${currentTask.id}`, taskBody);
      } else {
        // Add Mode
        await api.post('TaskItems', taskBody);
      }
      fetchTasks();
      closeModal();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save task.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleComplete = async (task: TaskItem) => {
    const updatedTask = {
      ...task,
      // Map properties with casing matching backend Models or let it fall back
      title: task.title || (task as any).Title,
      description: task.description || (task as any).Description,
      isCompleted: !task.isCompleted,
      dueDate: task.dueDate || (task as any).DueDate,
      createdDate: task.createdDate || (task as any).CreatedDate
    };

    // Optimistically update frontend UI
    setTasks(tasks.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t));

    try {
      await api.put(`TaskItems/${task.id}`, updatedTask);
    } catch (err: any) {
      // Revert if API fails
      setTasks(tasks.map(t => t.id === task.id ? task : t));
      alert(err.message || 'Failed to update task state.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`TaskItems/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete task.');
    }
  };

  // Filters logic
  const filteredTasks = tasks.filter(task => {
    const title = task.title || (task as any).Title || '';
    const desc = task.description || (task as any).Description || '';
    const isComp = task.isCompleted !== undefined ? task.isCompleted : (task as any).IsCompleted;

    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          desc.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterMode === 'pending') return !isComp;
    if (filterMode === 'completed') return isComp;
    return true;
  });

  return (
    <div>
      <div className="content-header">
        <div>
          <h1>QA Tasks Checklist</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Track pending testing phases, bugs, and deployment tasks.</p>
        </div>
        <button id="add-task-btn" className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      <div className="glass-card">
        {/* Actions bar */}
        <div className="search-bar">
          <div className="search-input-container">
            <Search className="search-input-icon" size={18} />
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filter tabs */}
          <div style={{ display: 'inline-flex', gap: '0.5rem', backgroundColor: 'var(--bg-input)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button 
              className="btn" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: filterMode === 'all' ? 'var(--bg-card-hover)' : 'transparent', border: 'none', color: filterMode === 'all' ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}
              onClick={() => setFilterMode('all')}
            >
              All
            </button>
            <button 
              className="btn" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: filterMode === 'pending' ? 'var(--bg-card-hover)' : 'transparent', border: 'none', color: filterMode === 'pending' ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}
              onClick={() => setFilterMode('pending')}
            >
              Pending
            </button>
            <button 
              className="btn" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: filterMode === 'completed' ? 'var(--bg-card-hover)' : 'transparent', border: 'none', color: filterMode === 'completed' ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}
              onClick={() => setFilterMode('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Loading task items...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--accent-rose)' }}>
            <AlertCircle size={36} style={{ marginBottom: '0.5rem' }} />
            <p>{error}</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <CheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>{searchQuery ? 'No matching tasks found.' : 'No tasks in this list. Clean slate!'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredTasks.map((task) => {
              const title = task.title || (task as any).Title;
              const desc = task.description || (task as any).Description;
              const isComp = task.isCompleted !== undefined ? task.isCompleted : (task as any).IsCompleted;
              const dueDate = task.dueDate || (task as any).DueDate;
              
              const isOverdue = dueDate && !isComp && new Date(dueDate) < new Date();

              return (
                <div key={task.id} className="task-row">
                  <div className="task-left">
                    <label className="task-checkbox-container" onClick={(e) => { e.preventDefault(); handleToggleComplete(task); }}>
                      <input
                        type="checkbox"
                        className="task-checkbox"
                        checked={isComp}
                        readOnly
                      />
                    </label>
                    <div className="task-details">
                      <div className={`task-title ${isComp ? 'completed' : ''}`}>
                        {title}
                      </div>
                      {desc && <div className="task-description">{desc}</div>}
                      {dueDate && (
                        <div className={`task-due ${isOverdue ? 'overdue' : ''}`}>
                          <Calendar size={12} />
                          {isOverdue && <AlertTriangle size={12} style={{ color: 'var(--accent-rose)' }} />}
                          Due: {new Date(dueDate).toLocaleDateString()} {isOverdue ? '(Overdue)' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                    <button className="btn-icon-only" onClick={() => openEditModal(task)} title="Edit Task">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon-only danger" onClick={() => handleDelete(task.id)} title="Delete Task">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && currentTask && (
        <div className="modal-overlay">
          <div className="modal-content animate-slideUp">
            <div className="modal-header">
              <h3 className="modal-title">{currentTask.id ? 'Edit Task' : 'Add Task'}</h3>
              <button className="btn-icon-only" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            
            {modalError && <div className="auth-error">{modalError}</div>}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Task Name (e.g. Test Login Component)"
                  value={currentTask.title || ''}
                  onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Details of what task includes"
                  value={currentTask.description || ''}
                  onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={currentTask.dueDate || ''}
                  onChange={(e) => setCurrentTask({ ...currentTask, dueDate: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={modalLoading}>
                  Cancel
                </button>
                <button id="task-modal-save-btn" type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
