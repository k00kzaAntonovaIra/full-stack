import { useState } from 'react';
import { authAPI, tokenManager } from '../utils/api';
import type { User } from '../utils/api';
import './LoginPage.css';

interface Props {
  onSwitchToLogin: () => void;
  onRegisterSuccess?: (user: User) => void;
}

export default function RegisterPage({ onSwitchToLogin, onRegisterSuccess }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (password.length > 72) {
      setError('Пароль не должен быть длиннее 72 символов');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name,
        email,
        password,
      });

      tokenManager.setTokens(response.access_token, response.refresh_token);

      onRegisterSuccess?.(response.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка регистрации. Попробуйте еще раз.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-frame register-mode">
        <h1 className="welcome register-title">Регистрация в Plan & Go</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister} className="register-form">

          <div className="register-field register-email-field">
            <label className="register-label">Электронная почта</label>
            <input
              type="email"
              className="register-input"
              placeholder="Введите электронную почту"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="register-field register-password-field">
            <label className="register-label">Пароль</label>
            <input
              type="password"
              className="register-input"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={72}
              disabled={loading}
            />
          </div>

          <div className="register-field register-confirm-field">
            <input
              type="password"
              className="register-input register-confirm-input"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              maxLength={72}
              disabled={loading}
            />
          </div>

          <button type="submit" className="register-submit-button button-base" disabled={loading}>
            {loading ? 'Регистрация...' : 'Продолжить'}
          </button>
        </form>

        <button className="register-btn button-base" onClick={onSwitchToLogin} disabled={loading}>
          Уже есть аккаунт
        </button>
      </div>
    </div>
  );
}

