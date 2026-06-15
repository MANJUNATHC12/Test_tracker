import React, { useEffect, useState } from 'react';

interface DailyLog {
  id: number;
  date: string;
  description: string;
  hoursSpent: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5115'; // default .NET dev URL

export default function App() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_URL}/api/DailyLogs`, {
        headers: {
          // JWT token would go here if you have auth set up
        },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setLogs(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Testing Tracker – Daily Logs</h1>
      {loading && <p>Loading logs...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      <ul className="list-disc pl-5">
        {logs.map((log) => (
          <li key={log.id} className="mb-2">
            <strong>{new Date(log.date).toLocaleDateString()}</strong>: {log.description} ({log.hoursSpent}h)
          </li>
        ))}
      </ul>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={fetchLogs}
      >
        Refresh
      </button>
    </div>
  );
}
