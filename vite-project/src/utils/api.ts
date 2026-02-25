export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
  bio?: string | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

type FetchOptions = RequestInit & { attemptRefresh?: boolean };

const API_BASE_URL = 'http://localhost:8000';


// Simple token storage helpers
export const tokenManager = {
  setTokens: (accessToken: string, refreshToken?: string | null) => {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  },
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  isAuthenticated: () => !!localStorage.getItem('access_token'),
};

async function withAuthFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {},
  attemptRefresh = true,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const accessToken = tokenManager.getAccessToken();

  const { attemptRefresh: _, ...restOptions } = options;
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  // Merge provided headers
  if (options.headers) {
    const provided = new Headers(options.headers);
    provided.forEach((value, key) => headers.set(key, value));
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(url, {
    ...restOptions,
    headers,
  });

  // If unauthorized and we have refresh token, try to refresh once
  if (response.status === 401 && attemptRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return withAuthFetch<T>(endpoint, options, false);
    }
  }

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(buildErrorMessage(data));
  }
  return data as T;
}

async function safeParseJson(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function buildErrorMessage(data: unknown): string {
  // FastAPI detail string
  if (data && typeof data === 'object' && 'detail' in data) {
    const detail = (data as { detail: unknown }).detail;
    if (typeof detail === 'string') return detail;
    // detail can be list of errors
    if (Array.isArray(detail)) {
      const first = detail[0];
      if (first && typeof first === 'object' && 'msg' in first) {
        return String((first as { msg: unknown }).msg);
      }
      return detail.map(String).join(', ');
    }
    return String(detail);
  }

  if (typeof data === 'string') return data;
  return 'Произошла ошибка';
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) return false;
  try {
    const data = await authAPI.refreshToken(refreshToken, false);
    tokenManager.setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    tokenManager.clearTokens();
    return false;
  }
}

// Auth API
export const authAPI = {
  register: async (userData: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.detail || 'Registration failed');
    }

    return data;
    },


  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.detail || 'Login failed');
    }

    return data;
  },

  refreshToken: (refreshToken: string, allowRetry = true) =>
    withAuthFetch<TokenResponse>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
      allowRetry,
    ),

  logout: (refreshToken: string) =>
    withAuthFetch<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  getCurrentUser: () => withAuthFetch<User>('/auth/me'),
};

// Users API
export const usersAPI = {
  me: () => withAuthFetch<User>('/users/me'),
  updateMe: (userData: Partial<Omit<User, 'id' | 'email'>>) =>
    withAuthFetch<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  deleteMe: () =>
    withAuthFetch<null>('/users/me', {
      method: 'DELETE',
    }),
};

// Trips API
export const tripsAPI = {
  list: (params: Record<string, string | number> = {}) => {
    const search = new URLSearchParams(params as Record<string, string>).toString();
    return withAuthFetch<unknown[]>(`/trips${search ? `?${search}` : ''}`);
  },
  create: (tripData: Record<string, unknown>) =>
    withAuthFetch<unknown>('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    }),
  get: (tripId: number | string) => withAuthFetch<unknown>(`/trips/${tripId}`),
  update: (tripId: number | string, tripData: Record<string, unknown>) =>
    withAuthFetch<unknown>(`/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    }),
  remove: (tripId: number | string) =>
    withAuthFetch<null>(`/trips/${tripId}`, {
      method: 'DELETE',
    }),
};

// Trip members API
export const tripMembersAPI = {
  join: (tripId: number | string, joinData: Record<string, unknown>) =>
    withAuthFetch<unknown>(`/trips/${tripId}/join`, {
      method: 'POST',
      body: JSON.stringify(joinData),
    }),
  members: (tripId: number | string) => withAuthFetch<unknown[]>(`/trips/${tripId}/members`),
  updateRole: (tripId: number | string, memberId: number | string, newRole: string) =>
    withAuthFetch<unknown>(`/trips/${tripId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify({ newRole }),
    }),
  remove: (tripId: number | string, memberId: number | string) =>
    withAuthFetch<null>(`/trips/${tripId}/members/${memberId}`, {
      method: 'DELETE',
    }),
};

// Messages API
export const messagesAPI = {
  list: (tripId: number | string, { skip = 0, limit = 100 } = {}) => {
    const search = new URLSearchParams({ skip: String(skip), limit: String(limit) }).toString();
    return withAuthFetch<unknown[]>(`/trips/${tripId}/messages?${search}`);
  },
  send: (tripId: number | string, messageData: Record<string, unknown>) =>
    withAuthFetch<unknown>(`/trips/${tripId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),
};

// Comments API
export const commentsAPI = {
  list: (tripId: number | string, { skip = 0, limit = 100 } = {}) => {
    const search = new URLSearchParams({ skip: String(skip), limit: String(limit) }).toString();
    return withAuthFetch<unknown[]>(`/trips/${tripId}/comments?${search}`);
  },
  add: (tripId: number | string, commentData: Record<string, unknown>) =>
    withAuthFetch<unknown>(`/trips/${tripId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    }),
  remove: (commentId: number | string) =>
    withAuthFetch<null>(`/trips/comments/${commentId}`, {
      method: 'DELETE',
    }),
};
