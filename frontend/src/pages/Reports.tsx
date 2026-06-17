import { useEffect, useState, useMemo } from 'react';
import { api } from '../api';
import {
  FileText, Plus, Calendar, Trash2, X, AlertCircle, Award,
  BarChart3, PieChart, TrendingUp, Clock, CheckCircle2, XCircle,
  Layers, Activity, ChevronDown, ChevronUp, Eye, Download,
  Package, ShoppingCart, Users, Cpu, Bug, Shield, Zap
} from 'lucide-react';

interface Report {
  id: number;
  name: string;
  content?: string;
  generatedOn: string;
}

interface ParsedContent {
  TotalTestCases: number;
  TotalTasks: number;
  CompletedTasks: number;
  PendingTasks: number;
  TotalHoursSpent: number;
  GeneratedAt: string;
  ModuleBreakdown?: Record<string, number>;
  StatusBreakdown?: Record<string, number>;
  TasksByModule?: Record<string, { total: number; completed: number }>;
  DailyActivity?: Array<{ date: string; description: string; hours: number }>;
}

// Modern color palette
const CHART_COLORS = [
  '#06b6d4', '#a855f7', '#10b981', '#f59e0b',
  '#ef4444', '#3b82f6', '#ec4899', '#14b8a6',
  '#8b5cf6', '#f97316', '#22d3ee', '#84cc16'
];

const MODULE_ICONS: Record<string, any> = {
  'Inventory': Package,
  'Sales & Distribution': ShoppingCart,
  'HR management': Users,
  'procurement': Cpu,
  'Other': Layers,
};

function getModuleIcon(mod: string) {
  for (const key in MODULE_ICONS) {
    if (mod.toLowerCase().includes(key.toLowerCase())) {
      return MODULE_ICONS[key];
    }
  }
  return Layers;
}

// ─── Donut Chart (SVG) ───
function DonutChart({ data, size = 180 }: { data: Record<string, number>; size?: number }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data</div>;

  const cx = size / 2, cy = size / 2, r = size * 0.36, stroke = size * 0.14;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {entries.map(([label, val], i) => {
        const pct = val / total;
        const dashLen = pct * circumference;
        const dashOffset = -offset;
        offset += dashLen;
        return (
          <circle
            key={label}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={stroke}
            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease' }}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-primary)" fontSize="1.5rem" fontWeight="700">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-muted)" fontSize="0.7rem">TOTAL</text>
    </svg>
  );
}

// ─── Horizontal Bar ───
function HBar({ label, value, max, color, icon }: { label: string; value: number; max: number; color: string; icon?: React.ReactNode }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
      {icon && <div style={{ color, flexShrink: 0, opacity: 0.8 }}>{icon}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
          <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0, marginLeft: '0.5rem' }}>{value}</span>
        </div>
        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%', borderRadius: '3px',
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            transition: 'width 1s ease'
          }} />
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ───
function StatCard({ label, value, icon, color, subtext }: { label: string; value: string | number; icon: React.ReactNode; color: string; subtext?: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${color}15`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      <div style={{
        position: 'absolute', top: '-12px', right: '-12px', width: '64px', height: '64px',
        borderRadius: '50%', background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ color, opacity: 0.4 }}>{icon}</div>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {subtext && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{subtext}</div>}
    </div>
  );
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [parsedData, setParsedData] = useState<ParsedContent | null>(null);
  const [generating, setGenerating] = useState(false);
  const [expandedReport, setExpandedReport] = useState<number | null>(null);

  // Live metrics from the latest report
  const [liveMetrics, setLiveMetrics] = useState<ParsedContent | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('Reports');
      setReports(data);

      // Parse the latest report for the live dashboard
      if (data.length > 0) {
        const latest = data[data.length - 1];
        const content = latest.content || (latest as any).Content;
        if (content) {
          try {
            setLiveMetrics(JSON.parse(content));
          } catch { /* ignore */ }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('Reports');
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Failed to generate metrics report.');
    } finally {
      setGenerating(false);
    }
  };

  const handleView = (report: Report) => {
    setActiveReport(report);
    const content = report.content || (report as any).Content;
    if (content) {
      try {
        setParsedData(JSON.parse(content));
      } catch {
        setParsedData(null);
      }
    } else {
      setParsedData(null);
    }
  };

  const handleClose = () => {
    setActiveReport(null);
    setParsedData(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.delete(`Reports/${id}`);
      setReports(reports.filter(r => r.id !== id));
      if (activeReport?.id === id) handleClose();
      // Re-fetch to update live metrics
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Failed to delete report.');
    }
  };

  // ─── Aggregate module breakdown from raw keys ───
  const moduleData = useMemo(() => {
    if (!liveMetrics?.ModuleBreakdown) return null;
    const agg: Record<string, number> = {};
    for (const [key, val] of Object.entries(liveMetrics.ModuleBreakdown)) {
      let mod = 'Other';
      const kl = key.toLowerCase();
      if (kl.includes('procurement') || kl.startsWith('pr-api')) mod = 'Procurement';
      else if (kl.includes('inv-') || kl.includes('inventory')) mod = 'Inventory';
      else if (kl.includes('so-') || kl.includes('sales')) mod = 'Sales & Distribution';
      else if (kl.includes('hr-') || kl.includes('hr ')) mod = 'HR Management';
      else if (kl.includes('production') || kl.includes('master')) mod = 'Production & Masters';
      else mod = 'Other';
      agg[mod] = (agg[mod] || 0) + val;
    }
    return agg;
  }, [liveMetrics]);

  // ─── Task progress by module ───
  const taskModules = useMemo(() => {
    if (!liveMetrics?.TasksByModule) return [];
    return Object.entries(liveMetrics.TasksByModule).map(([mod, d]) => ({
      name: mod.charAt(0).toUpperCase() + mod.slice(1),
      total: d.total,
      completed: d.completed,
      pct: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);
  }, [liveMetrics]);

  // ─── Status breakdown ───
  const statusData = liveMetrics?.StatusBreakdown || null;
  const statusTotal = statusData ? Object.values(statusData).reduce((a, b) => a + b, 0) : 0;

  // ─── Completion rate ───
  const completionRate = liveMetrics
    ? liveMetrics.TotalTasks > 0 ? Math.round((liveMetrics.CompletedTasks / liveMetrics.TotalTasks) * 100) : 0
    : 0;

  return (
    <div>
      {/* ───── Header ───── */}
      <div className="content-header">
        <div>
          <h1>QA Metrics & Reports</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Comprehensive analytics dashboard — module breakdown, status tracking, and activity reports.
          </p>
        </div>
        <button id="generate-report-btn" className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
          <Plus size={16} /> {generating ? 'Compiling...' : 'Generate Report'}
        </button>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading QA metrics...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--accent-rose)' }}>
          <AlertCircle size={36} style={{ marginBottom: '0.5rem' }} />
          <p>{error}</p>
        </div>
      ) : !liveMetrics ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          <BarChart3 size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>No reports generated yet. Click "Generate Report" to compile your QA metrics!</p>
        </div>
      ) : (
        <>
          {/* ───── Summary Stats Row ───── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <StatCard
              label="Test Cases"
              value={liveMetrics.TotalTestCases}
              icon={<Bug size={28} />}
              color="#06b6d4"
              subtext="Total test scenarios tracked"
            />
            <StatCard
              label="Tasks"
              value={liveMetrics.TotalTasks}
              icon={<CheckCircle2 size={28} />}
              color="#a855f7"
              subtext={`${liveMetrics.CompletedTasks} completed · ${liveMetrics.PendingTasks} pending`}
            />
            <StatCard
              label="Completion Rate"
              value={`${completionRate}%`}
              icon={<TrendingUp size={28} />}
              color={completionRate >= 80 ? '#10b981' : completionRate >= 50 ? '#f59e0b' : '#ef4444'}
              subtext={completionRate >= 80 ? 'Excellent progress' : completionRate >= 50 ? 'Good progress' : 'Needs attention'}
            />
            <StatCard
              label="QA Hours Logged"
              value={liveMetrics.TotalHoursSpent}
              icon={<Clock size={28} />}
              color="#f59e0b"
              subtext="Total effort invested"
            />
          </div>

          {/* ───── Charts Row: Module Breakdown + Status Distribution ───── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Module Breakdown Donut */}
            {moduleData && (
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div className="glass-card-title">
                  <span>Test Cases by Module</span>
                  <PieChart size={18} style={{ color: 'var(--accent-cyan)' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                  <DonutChart data={moduleData} size={160} />
                  <div style={{ flex: 1 }}>
                    {Object.entries(moduleData).map(([mod, count], i) => (
                      <div key={mod} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <div style={{
                          width: '10px', height: '10px', borderRadius: '2px', flexShrink: 0,
                          backgroundColor: CHART_COLORS[i % CHART_COLORS.length]
                        }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Status Distribution */}
            {statusData && (
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div className="glass-card-title">
                  <span>Issue Status Distribution</span>
                  <BarChart3 size={18} style={{ color: 'var(--accent-purple)' }} />
                </div>
                <div style={{ marginTop: '1.25rem' }}>
                  {/* Visual bar chart */}
                  <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                    {Object.entries(statusData).filter(([, v]) => v > 0).map(([status], i) => {
                      const pct = (statusData[status] / statusTotal) * 100;
                      const colors: Record<string, string> = { Fixed: '#10b981', Closed: '#06b6d4', Open: '#ef4444', Other: '#6b7280' };
                      return <div key={status} style={{ width: `${pct}%`, background: colors[status] || CHART_COLORS[i], transition: 'width 0.8s ease' }} />;
                    })}
                  </div>

                  {/* Status cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                      { key: 'Fixed', label: 'Fixed', icon: <Shield size={18} />, color: '#10b981' },
                      { key: 'Closed', label: 'Closed', icon: <CheckCircle2 size={18} />, color: '#06b6d4' },
                      { key: 'Open', label: 'Open', icon: <XCircle size={18} />, color: '#ef4444' },
                      { key: 'Other', label: 'Other', icon: <Layers size={18} />, color: '#6b7280' },
                    ].filter(s => (statusData[s.key] || 0) > 0).map(s => (
                      <div key={s.key} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem', backgroundColor: 'var(--bg-input)',
                        borderRadius: '8px', border: '1px solid var(--border-color)',
                      }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '8px',
                          background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color
                        }}>
                          {s.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: s.color }}>{statusData[s.key] || 0}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label} ({statusTotal > 0 ? Math.round(((statusData[s.key] || 0) / statusTotal) * 100) : 0}%)</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ───── Task Progress by Module ───── */}
          {taskModules.length > 0 && (
            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="glass-card-title">
                <span>Task Progress by Module</span>
                <Activity size={18} style={{ color: 'var(--accent-emerald)' }} />
              </div>
              <div style={{ marginTop: '1rem' }}>
                {taskModules.map((tm, i) => {
                  const Icon = getModuleIcon(tm.name);
                  return (
                    <div key={tm.name} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '0.85rem', backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                      borderRadius: '8px', marginBottom: '0.25rem'
                    }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                        background: `${CHART_COLORS[i % CHART_COLORS.length]}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: CHART_COLORS[i % CHART_COLORS.length]
                      }}>
                        <Icon size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{tm.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tm.completed}/{tm.total} tasks</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${tm.pct}%`, height: '100%', borderRadius: '3px',
                            background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[i % CHART_COLORS.length]}aa)`,
                            transition: 'width 1s ease'
                          }} />
                        </div>
                      </div>
                      <div style={{
                        fontSize: '0.85rem', fontWeight: 700, color: CHART_COLORS[i % CHART_COLORS.length],
                        minWidth: '40px', textAlign: 'right'
                      }}>
                        {tm.pct}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ───── Daily Activity Timeline ───── */}
          {liveMetrics.DailyActivity && liveMetrics.DailyActivity.length > 0 && (
            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="glass-card-title">
                <span>Daily Activity Timeline</span>
                <Calendar size={18} style={{ color: 'var(--accent-amber, #f59e0b)' }} />
              </div>
              <div style={{ marginTop: '1rem' }}>
                {liveMetrics.DailyActivity.map((entry, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '1rem', padding: '0.85rem 0',
                    borderBottom: i < (liveMetrics.DailyActivity?.length || 0) - 1 ? '1px solid var(--border-color)' : 'none'
                  }}>
                    {/* Timeline dot */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', paddingTop: '4px' }}>
                      <div style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: `linear-gradient(135deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[(i + 1) % CHART_COLORS.length]})`,
                        boxShadow: `0 0 8px ${CHART_COLORS[i % CHART_COLORS.length]}40`
                      }} />
                      {i < (liveMetrics.DailyActivity?.length || 0) - 1 && (
                        <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--border-color)', marginTop: '4px' }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                          borderRadius: '12px', backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}15`,
                          color: CHART_COLORS[i % CHART_COLORS.length]
                        }}>
                          {entry.hours} hrs
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                        {entry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ───── Reports History Table ───── */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div className="glass-card-title">
              <span>Generated Reports History</span>
              <FileText size={18} style={{ color: 'var(--accent-cyan)' }} />
            </div>

            {reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p>No historical reports found.</p>
              </div>
            ) : (
              <div className="table-container" style={{ marginTop: '0.75rem' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50%' }}>Report Name</th>
                      <th style={{ width: '30%' }}>Date Compiled</th>
                      <th style={{ width: '20%', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => {
                      const nameVal = report.name || (report as any).Name;
                      const dateVal = report.generatedOn || (report as any).GeneratedOn;
                      return (
                        <tr key={report.id}>
                          <td
                            style={{ fontWeight: 600, color: 'var(--accent-cyan)', cursor: 'pointer' }}
                            onClick={() => handleView(report)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FileText size={16} />
                              {nameVal}
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Calendar size={14} />
                              {new Date(dateVal).toLocaleString()}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                              <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleView(report)}>
                                <Eye size={14} style={{ marginRight: '0.25rem' }} /> View
                              </button>
                              <button className="btn-icon-only danger" onClick={() => handleDelete(report.id)} title="Delete Report">
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
        </>
      )}

      {/* ───── Detail Modal ───── */}
      {activeReport && (
        <div className="modal-overlay">
          <div className="modal-content animate-slideUp" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{activeReport.name || (activeReport as any).Name}</h3>
              <button className="btn-icon-only" onClick={handleClose}>
                <X size={18} />
              </button>
            </div>

            {parsedData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '70vh', overflowY: 'auto', padding: '0.25rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Award size={24} color="white" />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>QA Metrics Report</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Generated {parsedData.GeneratedAt ? new Date(parsedData.GeneratedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* KPI Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {[
                    { label: 'Test Cases', val: parsedData.TotalTestCases, color: '#06b6d4' },
                    { label: 'Tasks', val: `${parsedData.CompletedTasks}/${parsedData.TotalTasks}`, color: '#a855f7' },
                    { label: 'QA Hours', val: `${parsedData.TotalHoursSpent}h`, color: '#f59e0b' },
                  ].map(k => (
                    <div key={k.label} style={{
                      padding: '0.85rem', backgroundColor: 'var(--bg-input)', borderRadius: '8px',
                      border: '1px solid var(--border-color)', textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: k.color }}>{k.val}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>{k.label}</div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div style={{ backgroundColor: 'var(--bg-input)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Task Completion</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {parsedData.TotalTasks > 0 ? Math.round((parsedData.CompletedTasks / parsedData.TotalTasks) * 100) : 0}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${parsedData.TotalTasks > 0 ? Math.round((parsedData.CompletedTasks / parsedData.TotalTasks) * 100) : 0}%`,
                      height: '100%', borderRadius: '4px',
                      background: 'linear-gradient(90deg, #06b6d4, #a855f7)',
                      transition: 'width 0.8s ease'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    <span>Pending: {parsedData.PendingTasks}</span>
                    <span>Completed: {parsedData.CompletedTasks}</span>
                  </div>
                </div>

                {/* Module breakdown in modal */}
                {parsedData.TasksByModule && (
                  <div style={{ backgroundColor: 'var(--bg-input)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Module Breakdown</div>
                    {Object.entries(parsedData.TasksByModule).map(([mod, d], i) => {
                      const pct = d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0;
                      return (
                        <HBar
                          key={mod}
                          label={`${mod} (${d.completed}/${d.total})`}
                          value={pct}
                          max={100}
                          color={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Status in modal */}
                {parsedData.StatusBreakdown && (
                  <div style={{ backgroundColor: 'var(--bg-input)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Status Summary</div>
                    {Object.entries(parsedData.StatusBreakdown).filter(([, v]) => v > 0).map(([status, count], i) => {
                      const colors: Record<string, string> = { Fixed: '#10b981', Closed: '#06b6d4', Open: '#ef4444', Other: '#6b7280' };
                      return <HBar key={status} label={status} value={count} max={Math.max(...Object.values(parsedData.StatusBreakdown!))} color={colors[status] || CHART_COLORS[i]} />;
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                <AlertCircle size={36} style={{ marginBottom: '0.5rem', color: 'var(--accent-rose)' }} />
                <p>Failed to parse report content.</p>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleClose}>
                Close
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(activeReport.id)}>
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
