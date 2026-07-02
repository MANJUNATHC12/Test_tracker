import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { CheckCircle2, Clock, AlertCircle, AlertTriangle } from 'lucide-react';

interface Issue {
  id: number;
  issueId: string;
  module: string;
  description: string;
  severity: string;
  reportedBy: string;
  owner: string;
  status: string;
  createdDate: string;
  targetDate: string | null;
  daysOpen: number;
  actualCompletion: string | null;
  resolution: string;
  testId: string;
}

export default function Issues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await api.get('Issues');
      setIssues(data);
    } catch (err) {
      console.error('Failed to fetch issues', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityStyle = (severity: string) => {
    const s = severity.toLowerCase();
    if (s.includes('critical') || s.includes('blocker')) return { bg: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)' };
    if (s.includes('high')) return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' };
    if (s.includes('medium')) return { bg: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)' };
    return { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' };
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('close') || s.includes('resolve') || s.includes('fixed')) return 'var(--accent-emerald)';
    if (s.includes('progress')) return 'var(--accent-blue)';
    return 'var(--accent-rose)';
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading issues...</div>;
  }

  return (
    <div>
      <div className="content-header">
        <div>
          <h1>Issue Tracker</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Tracking {issues.length} imported issues
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--table-stripe)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>ISSUE ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>MODULE</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>DESCRIPTION</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>REPORTED BY</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>SEVERITY</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>OWNER</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>DAYS OPEN</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, idx) => {
                const sevStyle = getSeverityStyle(issue.severity);
                return (
                  <tr key={issue.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--table-stripe)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{issue.issueId}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{issue.module}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)', maxWidth: '300px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={issue.description}>
                        {issue.description}
                      </div>
                      {issue.resolution && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                          ✓ {issue.resolution}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{issue.reportedBy}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: sevStyle.bg, color: sevStyle.color
                      }}>
                        {issue.severity}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: getStatusColor(issue.status) }}>
                        {issue.status.toLowerCase().includes('close') || issue.status.toLowerCase().includes('resolve') || issue.status.toLowerCase().includes('fixed')
                          ? <CheckCircle2 size={16} />
                          : <AlertTriangle size={16} />}
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{issue.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{issue.owner}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontWeight: 600, fontSize: '0.85rem',
                        color: issue.daysOpen > 7 ? 'var(--accent-rose)' : issue.daysOpen > 3 ? 'var(--accent-amber)' : 'var(--text-secondary)'
                      }}>
                        {issue.daysOpen}d
                      </span>
                    </td>
                  </tr>
                );
              })}
              {issues.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    No issues imported yet. Upload an Excel file to see them here.
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
