import { useEffect, useState } from 'react';
import { api } from '../api';
import { FolderGit2, CheckSquare, Clock, BarChart3, AlertCircle, RefreshCw, FileText, AlertTriangle } from 'lucide-react';

interface TestCase {
  id: number;
  title: string;
}

interface TaskItem {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
}

interface DailyLog {
  id: number;
  date: string;
  hoursSpent: number;
  description: string;
}

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [requirementsCount, setRequirementsCount] = useState(0);
  const [testItemsCount, setTestItemsCount] = useState(0);
  const [issuesCount, setIssuesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tcData, taskData, logData, reqData, issueData, testItemData] = await Promise.all([
        api.get('TestCases'),
        api.get('TaskItems'),
        api.get('DailyLogs'),
        api.get('Requirements'),
        api.get('Issues'),
        api.get('TestItemsTracker')
      ]);
      setTestCases(tcData);
      setTasks(taskData);
      setLogs(logData);
      setRequirementsCount(reqData.length || 0);
      setIssuesCount(issueData.length || 0);
      setTestItemsCount(testItemData.length || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ borderColor: 'var(--accent-rose)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-rose)' }}>
          <AlertCircle size={24} />
          <h3>Error Loading Dashboard</h3>
        </div>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{error}</p>
        <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={fetchDashboardData}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  // Calculate metrics
  const totalTestCases = testCases.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const totalHoursSpent = logs.reduce((sum, log) => sum + (log.hoursSpent || 0), 0);

  // Group daily logs by date (last 7 days containing logs)
  const groupedLogs: { [key: string]: number } = {};
  logs.forEach(log => {
    const dateStr = new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const hours = log.hoursSpent || 0;
    groupedLogs[dateStr] = (groupedLogs[dateStr] || 0) + hours;
  });

  const chartData = Object.entries(groupedLogs)
    .map(([date, hours]) => ({ date, hours }))
    .slice(-7); // take last 7 items

  const maxHours = Math.max(...chartData.map(d => d.hours), 4); // default base height indicator

  return (
    <div>
      <div className="content-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Welcome back to your QA and Testing Command Center.</p>
        </div>
        <button id="dashboard-refresh-btn" className="btn btn-secondary" onClick={fetchDashboardData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card cyan" onClick={() => onNavigate('requirements')} style={{ cursor: 'pointer' }}>
          <div className="metric-icon">
            <FileText size={24} />
          </div>
          <div className="metric-info">
            <h3>Requirements</h3>
            <div className="metric-value">{requirementsCount}</div>
          </div>
        </div>

        <div className="metric-card purple" onClick={() => onNavigate('testitems')} style={{ cursor: 'pointer' }}>
          <div className="metric-icon">
            <FolderGit2 size={24} />
          </div>
          <div className="metric-info">
            <h3>Test Items</h3>
            <div className="metric-value">{testItemsCount}</div>
          </div>
        </div>

        <div className="metric-card amber" onClick={() => onNavigate('issues')} style={{ cursor: 'pointer' }}>
          <div className="metric-icon" style={{ backgroundColor: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="metric-info">
            <h3>Issues</h3>
            <div className="metric-value">{issuesCount}</div>
          </div>
        </div>

        <div className="metric-card emerald" onClick={() => onNavigate('tasks')} style={{ cursor: 'pointer' }}>
          <div className="metric-icon">
            <CheckSquare size={24} />
          </div>
          <div className="metric-info">
            <h3>Tasks Completed</h3>
            <div className="metric-value">{completionRate}% <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({completedTasks}/{totalTasks})</span></div>
          </div>
        </div>
      </div>

      {/* Lower Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* Graph Card */}
        <div className="glass-card">
          <div className="glass-card-title">
            <span>Work Hours Graph (Last 7 Sessions)</span>
            <BarChart3 size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          {chartData.length === 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No log sessions found. Log your daily work hours to generate statistics!
            </div>
          ) : (
            <div className="chart-container">
              {chartData.map((data, idx) => {
                const heightPercentage = Math.round((data.hours / maxHours) * 85); // cap height at 85%
                return (
                  <div key={idx} className="chart-bar-wrapper">
                    <div 
                      className="chart-bar" 
                      style={{ height: `${Math.max(heightPercentage, 8)}%` }}
                    >
                      <div className="chart-tooltip">{data.hours} hrs</div>
                    </div>
                    <div className="chart-label">{data.date}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Task Summary Card */}
        <div className="glass-card">
          <div className="glass-card-title">
            <span>Pending Tasks ({pendingTasks})</span>
            <CheckSquare size={18} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasks.filter(t => !t.isCompleted).slice(0, 4).map(task => (
              <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{task.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {task.description || task.dueDate ? `Due: ${new Date(task.dueDate || '').toLocaleDateString()}` : 'No due date'}
                  </div>
                </div>
                <span className="badge badge-rose">Pending</span>
              </div>
            ))}
            {tasks.filter(t => !t.isCompleted).length === 0 && (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                All caught up! No pending tasks.
              </div>
            )}
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} onClick={() => onNavigate('tasks')}>
              Manage Tasks
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
