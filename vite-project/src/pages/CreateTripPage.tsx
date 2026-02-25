import { useState } from "react";
import "../styles/pages.css";

export default function CreateTripPage() {

  const [image, setImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="page-container">
      <div className="glass-card create-trip-card">

        <h2>Создание поездки</h2>

        <div className="create-grid">

          {/* Левая часть */}
          <div className="form-side">

            <input placeholder="Название / Направление" />

            <textarea placeholder="Описание" />

            <div className="row">
              <input type="date" />
              <input type="date" />
            </div>

            <input type="number" placeholder="Бюджет до ($)" />

            <div className="row">
              <input type="number" placeholder="Человек от" />
              <input type="number" placeholder="Человек до" />
            </div>

            <button className="green-btn">
              Создать новую поездку
            </button>

          </div>

          {/* Правая часть */}
          <div className="photo-side">
            <label className="photo-upload">
              {image ? (
                <img src={image} alt="preview" className="photo-preview" />
              ) : (
                "Добавить фотографию"
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </label>
          </div>

        </div>
      </div>
    </div>
  );
}