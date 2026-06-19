import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TestCases from './pages/TestCases';
import Tasks from './pages/Tasks';
import DailyLogs from './pages/DailyLogs';
import Reports from './pages/Reports';
import DataImport from './pages/DataImport';
import { LayoutDashboard, FolderGit2, CheckSquare, Clock, BarChart3, UploadCloud, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  // Apply theme to body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Check if token exists on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('username');
    const savedRole = localStorage.getItem('role');
    if (savedToken) {
      setToken(savedToken);
      setUsername(savedUser);
      setRole(savedRole);
    }
  }, []);

  const handleLoginSuccess = (newToken: string, newUser: string, newRole: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUser);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setUsername(newUser);
    setRole(newRole);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUsername(null);
    setRole(null);
  };

  // If not logged in, render Login page
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Render correct page view
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'testcases':
        return <TestCases />;
      case 'tasks':
        return <Tasks />;
      case 'logs':
        return <DailyLogs />;
      case 'reports':
        return <Reports />;
      case 'import':
        return <DataImport />;
      default:
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">T</div>
          <span className="brand-name">Testing Tracker</span>
        </div>

        <nav className="sidebar-nav">
          <a
            href="#"
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </a>
          <a
            href="#"
            className={`nav-link ${activeTab === 'testcases' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('testcases'); }}
          >
            <FolderGit2 size={18} />
            Test Cases
          </a>
          <a
            href="#"
            className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('tasks'); }}
          >
            <CheckSquare size={18} />
            Tasks Checklist
          </a>
          <a
            href="#"
            className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('logs'); }}
          >
            <Clock size={18} />
            Daily Logs
          </a>
          <a
            href="#"
            className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('reports'); }}
          >
            <BarChart3 size={18} />
            Reports Engine
          </a>
          <a
            href="#"
            className={`nav-link ${activeTab === 'import' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('import'); }}
          >
            <UploadCloud size={18} />
            Data Import
          </a>
        </nav>

        {/* Profile Card at Sidebar Bottom */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(168,85,247,0.1)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={16} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{username}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{role}</div>
            </div>
          </div>

          <div className="sidebar-footer" style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="logout-button" style={{ flex: 1, justifyContent: 'center' }} onClick={handleLogout}>
              <LogOut size={16} />
              Sign Out
            </button>
            <button 
              className="btn-icon-only" 
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}
