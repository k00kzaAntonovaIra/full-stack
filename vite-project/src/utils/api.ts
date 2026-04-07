import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
  bio?: string | null;
  role: string;
  created_at?: string;
}

export interface WeatherInfo {
  temp: number;
  description: string;
  icon: string;
}

export interface Trip {
  id: number;
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget_total: number;
  creator_id: number;
  image_url?: string;
  weather?: WeatherInfo;
}

export const tokenManager = {
  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
  },
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenManager.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Если 401 и это НЕ запрос на логин или рефреш
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        const refreshToken = tokenManager.getRefreshToken();
        //console.log("DEBUG: Отправляем рефреш-токен:", refreshToken);

        // Попробуем явно указать заголовки и формат
        const res = await axios({
          method: 'post',
          url: `${API_BASE_URL}/auth/refresh`,
          data: { refresh_token: refreshToken },
          headers: { 'Content-Type': 'application/json' }
        });

        //console.log("DEBUG: Ответ сервера на рефреш:", res.data);

        const { access_token, refresh_token } = res.data;
        tokenManager.setTokens(access_token, refresh_token);
        
        processQueue(null, access_token);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return api(originalRequest);
      } catch (refreshError: any) {
        //console.error("DEBUG: Детали ошибки рефреша:", refreshError.response?.data); // ВОТ ЭТО ОЧЕНЬ ВАЖНО
        processQueue(refreshError, null);
        tokenManager.clearTokens();
        return Promise.reject(refreshError);
      } 
      // catch (refreshError) {
      //   console.error(" Рефреш упал:", refreshError);
      //   processQueue(refreshError, null);
      //   tokenManager.clearTokens();
      //   return Promise.reject(refreshError);
      // } finally {
      //   isRefreshing = false;
      // }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData).then(r => r.data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }).then(r => r.data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refresh_token: refreshToken }).then(r => r.data),
  getCurrentUser: () => api.get<User>('/auth/me').then(r => r.data),
  refreshToken: (token: string) => api.post('/auth/refresh', { refresh_token: token }).then(r => r.data),
};

export const tripsAPI = {
  list: (params?: { 
    search?: string; 
    min_budget?: number; 
    max_budget?: number; 
    start_date?: string; 
    end_date?: string; 
    creator_id?: number;
    skip?: number; 
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }) => api.get<Trip[]>('/trips/', { params }).then(res => res.data),
  create: (data: Partial<Trip>) => api.post<Trip>('/trips/', data).then(r => r.data),
  delete: (id: number) => api.delete(`/trips/${id}`).then(r => r.data),
};