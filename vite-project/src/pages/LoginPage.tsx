import { useState } from 'react';
import { authAPI, tokenManager } from '../utils/api';
import type { User } from '../utils/api';
import './LoginPage.css';

interface Props {
  onSwitchToRegister: () => void;
  onLoginSuccess?: (user: User) => void;
}

export default function LoginPage({ onSwitchToRegister, onLoginSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);

      tokenManager.setTokens(response.access_token, response.refresh_token);

      onLoginSuccess?.(response.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка входа. Проверьте email и пароль.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-frame">
        <h1 className="welcome">Добро пожаловать в Plan & Go</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="email-container">
            <label className="label-email">Электронная почта</label>
            <input
              type="email"
              className="input-email"
              placeholder="Введите электронную почту"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="password-container">
            <label className="label-password">Пароль</label>
            <input
              type="password"
              className="input-password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            maxLength={72}
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-btn button-base" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <button className="register-btn button-base" onClick={onSwitchToRegister} disabled={loading}>
          Создать аккаунт
        </button>
      </div>
    </div>
  );
}

