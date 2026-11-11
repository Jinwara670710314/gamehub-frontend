
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

// อ่านผลลัพธ์จาก Backend
async function readResponse(response) {
  const responseText = await response.text();

  let result;

  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    result = {
      message: responseText,
    };
  }

  if (!response.ok) {
    throw new Error(
      result.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ Backend"
    );
  }

  return result;
}

function AdminAddGame() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // เพิ่มเกมใหม่ลงฐานข้อมูล
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/games`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            genre: genre.trim(),
            year: Number(year),
            image: image.trim(),
            description: description.trim(),
          }),
        }
      );

      await readResponse(response);

      setNotification("Game added successfully!");

      setTimeout(() => {
        navigate("/admin/games");
      }, 1500);

    } catch (err) {
      setError(err.message || "ไม่สามารถเพิ่มเกมได้");
      setSaving(false);
    }
  }

  return (
    <main className="add-game-page">
      <div className="add-game-container">

        {notification && (
          <div
            role="status"
            style={{
              position: "fixed",
              top: "24px",
              right: "24px",
              zIndex: 9999,
              background: "#166534",
              color: "#ffffff",
              padding: "16px 24px",
              borderRadius: "10px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              fontWeight: "600",
            }}
          >
            ✓ {notification}
          </div>
        )}

        <div className="add-game-header">
          <div>
            <span className="add-game-label">
              GAMEHUB MANAGEMENT
            </span>
            <h1>Add New Game</h1>
            <p>เพิ่มเกมใหม่เข้าสู่คลังเกมของ GameHub</p>
          </div>

          <Link to="/admin/games" className="add-game-back">
            ← Back to Games
          </Link>
        </div>

        <div className="add-game-layout">

          <form
            className="add-game-form"
            onSubmit={handleSubmit}
          >
            <div className="add-game-section-title">
              <h2>Game Information</h2>
              <p>กรอกข้อมูลเกมที่ต้องการเพิ่ม</p>
            </div>

            <div className="add-game-field">
              <label>Game Name</label>
              <input
                type="text"
                placeholder="เช่น Elden Ring"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="add-game-row">
              <div className="add-game-field">
                <label>Genre</label>
                <input
                  type="text"
                  placeholder="เช่น Action RPG"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  required
                />
              </div>

              <div className="add-game-field">
                <label>Release Year</label>
                <input
                  type="number"
                  placeholder="2025"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="add-game-field">
              <label>Cover Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/game-image.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
              />
            </div>

            <div className="add-game-field">
              <label>Description</label>
              <textarea
                placeholder="เขียนรายละเอียดเกี่ยวกับเกม..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {error && (
              <p role="alert" style={{ color: "#ef4444" }}>
                {error}
              </p>
            )}

            <div className="add-game-actions">
              <button
                type="submit"
                className="add-game-submit"
                disabled={saving}
              >
                {saving ? "Adding..." : "+ Add Game"}
              </button>

              <Link
                to="/admin/games"
                className="add-game-cancel"
              >
                Cancel
              </Link>
            </div>
          </form>

          <div className="add-game-preview">
            <div className="add-game-section-title">
              <h2>Game Preview</h2>
              <p>ตัวอย่างหน้าตาของเกม</p>
            </div>

            <div className="add-game-preview-card">
              {image ? (
                <img
                  src={image}
                  alt="Game Preview"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="add-game-image-placeholder">
                  <span>🎮</span>
                  <p>Game Cover Preview</p>
                </div>
              )}

              <div className="add-game-preview-info">
                <span>{genre || "GAME GENRE"}</span>
                <h3>{name || "Your Game Name"}</h3>
                <p>{year || "Release Year"}</p>
                <p className="add-game-preview-description">
                  {description || "รายละเอียดเกมจะแสดงตรงนี้"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default AdminAddGame;
