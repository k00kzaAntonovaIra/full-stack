import { useState, useEffect, useCallback, useRef } from "react"; // Добавили useRef
import { authAPI, tokenManager } from "./api";
import type { User } from "./api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false); // Флаг для предотвращения двойного запуска

  const fetchUser = useCallback(async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      // Ошибку в консоль выводим, но не чистим всё подряд, 
      // если это не критическая ошибка авторизации
      console.error("Auth failed:", err);
      setUser(null);
      tokenManager.clearTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  // Остальные методы (login, logout) без изменений...
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await authAPI.login(email, password);
      tokenManager.setTokens(data.access_token, data.refresh_token);
      await fetchUser();
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUser]);

  const logout = useCallback(() => {
    const refresh = tokenManager.getRefreshToken();
    if (refresh) authAPI.logout(refresh).catch(() => {});
    tokenManager.clearTokens();
    setUser(null);
  }, []);

  useEffect(() => {
    // Если уже инициализируемся — выходим
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
      const refresh = tokenManager.getRefreshToken();
      if (!refresh) {
        setLoading(false);
        return;
      }
      await fetchUser();
    };

    initAuth();
  }, [fetchUser]);

  return { user, loading, login, logout, fetchUser };
}