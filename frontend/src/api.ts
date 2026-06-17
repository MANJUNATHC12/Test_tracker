const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5115';

export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_URL}/api/${endpoint}`, { headers: getHeaders() });
    if (res.status === 401) {
      localStorage.clear();
      window.location.reload();
    }
    if (!res.ok) {
      const text = await res.text();
      let msg = `HTTP ${res.status}`;
      try {
        const errObj = JSON.parse(text);
        msg = errObj.message || msg;
      } catch {
        msg = text || msg;
      }
      throw new Error(msg);
    }
    return res.json();
  },
  post: async (endpoint: string, body?: any) => {
    const res = await fetch(`${API_URL}/api/${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    if (res.status === 401) {
      localStorage.clear();
      window.location.reload();
    }
    if (!res.ok) {
      const text = await res.text();
      let msg = `HTTP ${res.status}`;
      try {
        const errObj = JSON.parse(text);
        msg = errObj.message || msg;
      } catch {
        msg = text || msg;
      }
      throw new Error(msg);
    }
    return res.json();
  },
  put: async (endpoint: string, body: any) => {
    const res = await fetch(`${API_URL}/api/${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    if (res.status === 401) {
      localStorage.clear();
      window.location.reload();
    }
    if (!res.ok) {
      if (res.status === 204) return null;
      const text = await res.text();
      let msg = `HTTP ${res.status}`;
      try {
        const errObj = JSON.parse(text);
        msg = errObj.message || msg;
      } catch {
        msg = text || msg;
      }
      throw new Error(msg);
    }
    return res.status === 204 ? null : res.json();
  },
  delete: async (endpoint: string) => {
    const res = await fetch(`${API_URL}/api/${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (res.status === 401) {
      localStorage.clear();
      window.location.reload();
    }
    if (!res.ok) {
      if (res.status === 204) return null;
      const text = await res.text();
      let msg = `HTTP ${res.status}`;
      try {
        const errObj = JSON.parse(text);
        msg = errObj.message || msg;
      } catch {
        msg = text || msg;
      }
      throw new Error(msg);
    }
    return res.status === 204 ? null : res.json();
  }
};
