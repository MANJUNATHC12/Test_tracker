import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Search, Edit2, Trash2, X, FileText, AlertCircle } from 'lucide-react';

interface TestCase {
  id: number;
  title: string;
  description?: string;
  steps?: string;
  expectedResult?: string;
  testId?: string;
  module?: string;
  subModule?: string;
  issue?: string;
  testedBy?: string;
  priority?: string;
  status?: string;
  owner?: string;
  createdDate: string;
  targetDate?: string | null;
  actualCompletion?: string | null;
  issueId?: string;
  remarks?: string;
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

  const getStatusColor = (status?: string) => {
    if (!status) return 'var(--text-secondary)';
    const s = status.toLowerCase();
    if (s.includes('close') || s.includes('done') || s.includes('complet') || s.includes('fixed')) return 'var(--accent-emerald)';
    if (s.includes('progress')) return 'var(--accent-blue)';
    return 'var(--accent-amber)';
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
    const query = searchQuery.toLowerCase();
    return (
      (tc.testId?.toLowerCase().includes(query)) ||
      (tc.module?.toLowerCase().includes(query)) ||
      (tc.subModule?.toLowerCase().includes(query)) ||
      (tc.issue?.toLowerCase().includes(query)) ||
      (tc.description?.toLowerCase().includes(query)) ||
      (tc.testedBy?.toLowerCase().includes(query)) ||
      (tc.status?.toLowerCase().includes(query)) ||
      (tc.owner?.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      <div className="content-header">
        <div>
          <h1>Test Items Tracker</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Track all test items, execution status, and assignments.</p>
        </div>
        <button id="add-testcase-btn" className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> New Test Item
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
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>TEST ID</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>MODULE</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>SUB MODULE</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>ISSUE / SUMMARY</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>TESTED BY</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>PRIORITY</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>OWNER</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>REMARKS</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTestCases.map((tc, idx) => (
                  <tr key={tc.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--table-stripe)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{tc.testId}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{tc.module}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{tc.subModule}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)', maxWidth: '250px' }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tc.issue}>
                        {tc.issue}
                      </div>
                      {tc.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tc.description}>
                          {tc.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{tc.testedBy}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: tc.priority?.toLowerCase() === 'high' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                        color: tc.priority?.toLowerCase() === 'high' ? 'var(--accent-rose)' : 'var(--text-secondary)'
                      }}>
                        {tc.priority}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ color: getStatusColor(tc.status), fontWeight: 600, fontSize: '0.85rem' }}>
                        {tc.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{tc.owner}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tc.remarks}>{tc.remarks}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                        <button className="btn-icon-only" onClick={() => openEditModal(tc)} title="Edit Test Item">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon-only danger" onClick={() => handleDelete(tc.id)} title="Delete Test Item">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTestCases.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <AlertCircle size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      No test items imported yet. Upload an Excel file to see them here.
                    </td>
                  </tr>
                )}
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
              <h3 className="modal-title">{currentTestCase.id ? 'Edit Test Item' : 'New Test Item'}</h3>
              <button className="btn-icon-only" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            
            {modalError && <div className="auth-error">{modalError}</div>}

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Test ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. TC001"
                    value={currentTestCase.testId || ''}
                    onChange={(e) => setCurrentTestCase({ ...currentTestCase, testId: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Module</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Login"
                    value={currentTestCase.module || ''}
                    onChange={(e) => setCurrentTestCase({ ...currentTestCase, module: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Sub Module</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. OAuth"
                    value={currentTestCase.subModule || ''}
                    onChange={(e) => setCurrentTestCase({ ...currentTestCase, subModule: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tested By</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Manjunath"
                    value={currentTestCase.testedBy || ''}
                    onChange={(e) => setCurrentTestCase({ ...currentTestCase, testedBy: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Issue Summary</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Verify registration with valid data"
                  value={currentTestCase.issue || ''}
                  onChange={(e) => setCurrentTestCase({ ...currentTestCase, issue: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Details</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '60px', resize: 'vertical' }}
                  placeholder="TestCase Details"
                  value={currentTestCase.description || ''}
                  onChange={(e) => setCurrentTestCase({ ...currentTestCase, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. High"
                    value={currentTestCase.priority || ''}
                    onChange={(e) => setCurrentTestCase({ ...currentTestCase, priority: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Pass"
                    value={currentTestCase.status || ''}
                    onChange={(e) => setCurrentTestCase({ ...currentTestCase, status: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Owner</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. DevTeam"
                    value={currentTestCase.owner || ''}
                    onChange={(e) => setCurrentTestCase({ ...currentTestCase, owner: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Remarks</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Additional notes"
                  value={currentTestCase.remarks || ''}
                  onChange={(e) => setCurrentTestCase({ ...currentTestCase, remarks: e.target.value })}
                />
              </div>

              <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={modalLoading}>
                  Cancel
                </button>
                <button id="modal-save-btn" type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : 'Save Test Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
