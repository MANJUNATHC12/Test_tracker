import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface TestItem {
  id: number;
  testId: string;
  module: string;
  subModule: string;
  issue: string;
  description: string;
  testedBy: string;
  priority: string;
  status: string;
  owner: string;
  createdDate: string;
  targetDate: string | null;
  actualCompletion: string | null;
  issueId: string;
  remarks: string;
}

export default function TestItemsTracker() {
  const [items, setItems] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await api.get('TestItemsTracker');
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch test items', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('pass') || s.includes('close') || s.includes('done') || s.includes('complet') || s.includes('fixed')) return 'var(--accent-emerald)';
    if (s.includes('fail')) return 'var(--accent-rose)';
    if (s.includes('progress')) return 'var(--accent-blue)';
    return 'var(--accent-amber)';
  };

  const getPriorityStyle = (priority: string) => {
    const p = priority.toLowerCase();
    if (p === 'high' || p === 'critical') return { bg: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)' };
    if (p === 'medium') return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' };
    return { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' };
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading test items...</div>;
  }

  return (
    <div>
      <div className="content-header">
        <div>
          <h1>Test Items Tracker</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Tracking {items.length} imported test items
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--table-stripe)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>TEST ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>MODULE</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>SUB MODULE</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>ISSUE</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>DESCRIPTION</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>TESTED BY</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>PRIORITY</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>OWNER</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const prioStyle = getPriorityStyle(item.priority);
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--table-stripe)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{item.testId}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.module}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.subModule}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)', maxWidth: '200px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.issue}>
                        {item.issue}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)', maxWidth: '200px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.description}>
                        {item.description}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.testedBy}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: prioStyle.bg, color: prioStyle.color
                      }}>
                        {item.priority}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: getStatusColor(item.status) }}>
                        {item.status.toLowerCase().includes('pass') || item.status.toLowerCase().includes('close') || item.status.toLowerCase().includes('done')
                          ? <CheckCircle2 size={16} />
                          : <Clock size={16} />}
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.owner}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', maxWidth: '150px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.remarks}>
                        {item.remarks}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
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
      </div>
    </div>
  );
}
