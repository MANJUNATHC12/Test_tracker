import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Search, Edit2, Trash2, X, FileText, AlertCircle } from 'lucide-react';

interface TestCase {
  id: number;
  title: string;
  description?: string;
  steps?: string;
  expectedResult?: string;
  createdDate: string;
}

export default function TestCases() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTestCase, setCurrentTestCase] = useState<Partial<TestCase> | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchTestCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('TestCases');
      setTestCases(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch test cases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestCases();
  }, []);

  const openAddModal = () => {
    setCurrentTestCase({
      title: '',
      description: '',
      steps: '',
      expectedResult: ''
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tc: TestCase) => {
    setCurrentTestCase({ ...tc });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTestCase(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTestCase || !currentTestCase.title?.trim()) {
      setModalError('Title is required');
      return;
    }

    setModalLoading(true);
    setModalError(null);

    try {
      if (currentTestCase.id) {
        // Edit Mode
        await api.put(`TestCases/${currentTestCase.id}`, currentTestCase);
      } else {
        // Add Mode
        await api.post('TestCases', currentTestCase);
      }
      fetchTestCases();
      closeModal();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save test case.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this test case?')) return;
    try {
      await api.delete(`TestCases/${id}`);
      setTestCases(testCases.filter(tc => tc.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete test case.');
    }
  };

  // Filter test cases based on search
  const filteredTestCases = testCases.filter(tc => {
    const titleMatch = tc.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = tc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || descMatch;
  });

  return (
    <div>
      <div className="content-header">
        <div>
          <h1>Test Cases Repository</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Create, manage, and execute functional test cases.</p>
        </div>
        <button id="add-testcase-btn" className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> New Test Case
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
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Loading test cases...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--accent-rose)' }}>
            <AlertCircle size={36} style={{ marginBottom: '0.5rem' }} />
            <p>{error}</p>
          </div>
        ) : filteredTestCases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>{searchQuery ? 'No matching test cases found.' : 'Your test repository is empty. Click "New Test Case" to get started!'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Title</th>
                  <th style={{ width: '30%' }}>Description</th>
                  <th style={{ width: '20%' }}>Steps</th>
                  <th style={{ width: '20%' }}>Expected Result</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTestCases.map((tc) => (
                  <tr key={tc.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{tc.title}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{tc.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{tc.steps || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{tc.expectedResult || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                        <button className="btn-icon-only" onClick={() => openEditModal(tc)} title="Edit Test Case">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon-only danger" onClick={() => handleDelete(tc.id)} title="Delete Test Case">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && currentTestCase && (
        <div className="modal-overlay">
          <div className="modal-content animate-slideUp">
            <div className="modal-header">
              <h3 className="modal-title">{currentTestCase.id ? 'Edit Test Case' : 'New Test Case'}</h3>
              <button className="btn-icon-only" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            
            {modalError && <div className="auth-error">{modalError}</div>}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="TestCase Title (e.g. User Registration)"
                  value={currentTestCase.title || ''}
                  onChange={(e) => setCurrentTestCase({ ...currentTestCase, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Summary of what is tested"
                  value={currentTestCase.description || ''}
                  onChange={(e) => setCurrentTestCase({ ...currentTestCase, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Test Steps</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  placeholder="1. Navigate to login&#10;2. Input credentials&#10;3. Click submit"
                  value={currentTestCase.steps || ''}
                  onChange={(e) => setCurrentTestCase({ ...currentTestCase, steps: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Result</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Successful authorization and token generation"
                  value={currentTestCase.expectedResult || ''}
                  onChange={(e) => setCurrentTestCase({ ...currentTestCase, expectedResult: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={modalLoading}>
                  Cancel
                </button>
                <button id="modal-save-btn" type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : 'Save Test Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
