import { useState } from 'react';
import '../styles/CreateProfile.css';
import { useNavigate } from 'react-router-dom';


interface Props {
  onProfileCreated?: () => void;
}

export default function CreateProfile({ onProfileCreated }: Props) {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<File | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [telegram, setTelegram] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);



const handleSubmit = async (e: React.FormEvent) => {
  
  e.preventDefault();
  setLoading(true);

  const accessToken = localStorage.getItem("access_token");

  const fullName = `${firstName} ${lastName}`.trim();

  const response = await fetch("http://127.0.0.1:8000/auth/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      name: fullName,
      bio: about,
      avatar_url: null
    })
  });

  setLoading(false);

  if (response.ok) {
    navigate('/home');
  } else {
    console.error("Profile update failed");
  }
};




  const handlePhotoChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  return (
    <div className="create-profile-container">
      <form className="profile-form" onSubmit={handleSubmit}>
        <h1 className="profile-title">Создание профиля</h1>

        {/* Фото */}
        <label className="photo-label">
          {photo ? (
            <img
              src={URL.createObjectURL(photo)}
              alt="profile"
              className="profile-photo"
            />
          ) : (
            '+'
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
        </label>

        {/* Имя */}
        <label>Имя</label>
        <input
          type="text"
          placeholder="Введите Ваше имя"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={loading}
        />

        {/* Фамилия */}
        <label>Фамилия</label>
        <input
          type="text"
          placeholder="Введите Вашу фамилию"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={loading}
        />

        {/* Telegram */}
        <label>Telegram</label>
        <input
          type="text"
          placeholder="Введите ваш Telegram"
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
          disabled={loading}
        />

        {/* Дата рождения */}
        <label>Дата рождения</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          disabled={loading}
        />

        {/* Расскажите о себе */}
        <label>Расскажите немного о себе</label>
        <textarea
          placeholder="Введите информацию о себе"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          disabled={loading}
        />

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Сохраняем...' : 'Продолжить'}
        </button>
      </form>
    </div>
  );
}
