// API client for EquiTrack (Lab 02 SRS & Lab 03 REST API Documentation)
const API_BASE = '/api';

export const getStoredToken = () => localStorage.getItem('equitrack_token');
export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem('equitrack_token', token);
  } else {
    localStorage.removeItem('equitrack_token');
  }
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 12000);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const isWeak = response.status === 504 || data.isWeakConnection;
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const error = new Error(isWeak ? 'Weak Connection: Live Angel One feed is unreachable or timed out' : errorMsg);
      error.status = response.status;
      error.isWeakConnection = isWeak;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError' || !navigator.onLine) {
      const weakErr = new Error('Weak Connection: Network request timed out. Please check your internet connection.');
      weakErr.status = 504;
      weakErr.isWeakConnection = true;
      throw weakErr;
    }
    throw err;
  }
};

// ================= USER MANAGEMENT API (R.1 / Lab 03) =================

export const loginApi = async (email, password) => {
  try {
    return await apiFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    if (err.status === 404) {
      return await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    }
    throw err;
  }
};

export const registerApi = async (name, email, password) => {
  try {
    return await apiFetch('/users/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  } catch (err) {
    if (err.status === 404) {
      return await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
    }
    throw err;
  }
};

export const getProfileApi = async () => {
  try {
    return await apiFetch('/users/profile');
  } catch (err) {
    if (err.status === 404) {
      return await apiFetch('/auth/profile');
    }
    throw err;
  }
};

export const updateProfileApi = async (name, password) => {
  const body = {};
  if (name) body.name = name;
  if (password) body.password = password;

  try {
    return await apiFetch('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (err.status === 404) {
      return await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    }
    throw err;
  }
};

// ================= DASHBOARD & STOCKS API (R.2 & R.3 / Lab 03) =================

export const getDashboardDataApi = async () => {
  return await apiFetch('/dashboard');
};

export const searchStocksApi = async (query = '') => {
  return await apiFetch(`/market/search?q=${encodeURIComponent(query)}`);
};

export const getCompanyDetailsApi = async (symbol, duration = '1d') => {
  return await apiFetch(`/stocks/${encodeURIComponent(symbol)}?duration=${encodeURIComponent(duration)}`);
};

// ================= WATCHLIST API (R.3.2, R.3.3 / Lab 03) =================

export const getWatchlistApi = async () => {
  return await apiFetch('/watchlist');
};

export const addToWatchlistApi = async (symbol, companyName, exchange = 'NSE') => {
  return await apiFetch('/watchlist', {
    method: 'POST',
    body: JSON.stringify({ symbol, companyName, exchange }),
  });
};

export const removeFromWatchlistApi = async (symbol) => {
  return await apiFetch(`/watchlist/${encodeURIComponent(symbol)}`, {
    method: 'DELETE',
  });
};
