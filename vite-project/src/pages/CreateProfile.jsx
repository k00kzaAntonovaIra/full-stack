import { useState, useRef } from 'react';
import './CreateProfile.css';
import { usersAPI, authAPI } from '../utils/api';

export default function CreateProfile({ userId, onComplete, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    telegram: '',
    birthday: '',
    about: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер изображения не должен превышать 5MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Пожалуйста, выберите изображение');
        return;
      }
      setProfileImage(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare profile data
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      const profileData = {
        name: name || undefined,
        bio: formData.about || undefined,
      };

      // If there's additional info (telegram, birthday), add to bio
      const additionalInfo = [];
      if (formData.telegram) {
        additionalInfo.push(`Telegram: ${formData.telegram}`);
      }
      if (formData.birthday) {
        additionalInfo.push(`День рождения: ${formData.birthday}`);
      }
      if (additionalInfo.length > 0 && formData.about) {
        profileData.bio = `${formData.about}\n\n${additionalInfo.join('\n')}`;
      } else if (additionalInfo.length > 0) {
        profileData.bio = additionalInfo.join('\n');
      }

      // Update profile
      if (userId) {
        const updatedUser = await usersAPI.updateProfile(userId, profileData);
        
        // Handle image upload if provided
        // Note: For now, we'll skip image upload as backend might need special endpoint
        // You can add image upload logic here if backend supports it
        
        if (onComplete) {
          onComplete(updatedUser);
        }
      } else {
        setError('ID пользователя не найден');
      }
    } catch (err) {
      setError(err.message || 'Ошибка при сохранении профиля. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-profile-page">
      <div className="create-profile-frame">
        <h1 className="create-profile-title">Создание профиля</h1>
        
        {error && <div className="create-profile-error">{error}</div>}
        
        <div className="profile-image-container">
          <div 
            className="profile-image-circle"
            onClick={handleImageClick}
            style={{ cursor: 'pointer' }}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="profile-image" />
            ) : (
              <span className="profile-image-placeholder">Загрузить фото</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            disabled={loading}
          />
        </div>

        <form onSubmit={handleSubmit} className="create-profile-form">
          <div className="form-field">
            <label className="form-label">Имя</label>
            <input
              type="text"
              name="firstName"
              className="form-input"
              placeholder="Введите имя"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Фамилия</label>
            <input
              type="text"
              name="lastName"
              className="form-input"
              placeholder="Введите фамилию"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Telegram</label>
            <input
              type="text"
              name="telegram"
              className="form-input"
              placeholder="@username"
              value={formData.telegram}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label className="form-label">День рождения</label>
            <input
              type="date"
              name="birthday"
              className="form-input"
              value={formData.birthday}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Расскажите немного о себе</label>
            <textarea
              name="about"
              className="form-textarea"
              placeholder="Напишите о себе"
              value={formData.about}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="create-profile-submit-button"
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Продолжить'}
          </button>
          
          {onCancel && (
            <button 
              type="button" 
              className="create-profile-cancel-button"
              onClick={onCancel}
              disabled={loading}
            >
              Отмена
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
