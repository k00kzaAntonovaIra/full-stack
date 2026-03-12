import { useState } from "react";
import "../styles/pages.css";

export default function CreateTripPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");

  const handleCreate = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Вы не авторизованы");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/trips/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          destination,
          start_date: startDate,
          end_date: endDate,
          budget_total: Number(budget),
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка создания поездки");
      }

      const data = await response.json();
      console.log("Создано:", data);
      alert("Поездка создана!");

    } catch (error) {
      console.error(error);
      alert("Ошибка при создании");
    }
  };

  return (
    <div className="page-container">
      <div className="glass-card create-trip-card">
        <h2>Создание поездки</h2>

        <div className="create-grid">
          <div className="form-side">

            <input
              placeholder="Название"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              placeholder="Направление"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />

            <textarea
              placeholder="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="row">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <input
              type="number"
              placeholder="Бюджет"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />

            <button className="green-btn" onClick={handleCreate}>
              Создать новую поездку
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}