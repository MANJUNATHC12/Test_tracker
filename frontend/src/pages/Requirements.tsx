import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Requirement {
  id: number;
  reqId: string;
  module: string;
  description: string;
  requestor: string;
  priority: string;
  status: string;
  owner: string;
  createdDate: string;
  targetDate: string | null;
  actualCompletion: string | null;
  remarks: string;
}

export default function Requirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const data = await api.getRequirements();
      setRequirements(data);
    } catch (err) {
      console.error('Failed to fetch requirements', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('close') || s.includes('done') || s.includes('complet')) return 'var(--accent-emerald)';
    if (s.includes('progress')) return 'var(--accent-blue)';
    return 'var(--accent-amber)';
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading requirements...</div>;
  }

  return (
    <div>
      <div className="content-header">
        <div>
          <h1>Requirements Tracker</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Tracking {requirements.length} imported requirements
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--table-stripe)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>REQ ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>MODULE</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>DESCRIPTION</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>PRIORITY</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>OWNER</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((req, idx) => (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--table-stripe)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{req.reqId}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{req.module}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)', maxWidth: '300px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.description}>
                      {req.description}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: req.priority.toLowerCase() === 'high' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                      color: req.priority.toLowerCase() === 'high' ? 'var(--accent-rose)' : 'var(--text-secondary)'
                    }}>
                      {req.priority}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: getStatusColor(req.status) }}>
                      {req.status.toLowerCase().includes('close') ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{req.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{req.owner}</td>
                </tr>
              ))}
              {requirements.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    No requirements imported yet. Upload an Excel file to see them here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
