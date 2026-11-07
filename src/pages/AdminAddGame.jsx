import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import games from "../data/games";

function AdminAddGame() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const newGame = {
      id: Math.max(...games.map((game) => game.id), 0) + 1,
      name,
      genre,
      year: Number(year),
      image,
      description,
    };

    games.push(newGame);

    alert("เพิ่มเกมเรียบร้อยแล้ว!");
    navigate("/admin/games");
  }

  return (
    <main className="add-game-page">
      <div className="add-game-container">

        <div className="add-game-header">
          <div>
            <span className="add-game-label">GAMEHUB MANAGEMENT</span>
            <h1>Add New Game</h1>
            <p>เพิ่มเกมใหม่เข้าสู่คลังเกมของ GameHub</p>
          </div>

          <Link to="/admin/games" className="add-game-back">
            ← Back to Games
          </Link>
        </div>

        <div className="add-game-layout">

          <form className="add-game-form" onSubmit={handleSubmit}>
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

            <div className="add-game-actions">
              <button type="submit" className="add-game-submit">
                + Add Game
              </button>

              <Link to="/admin/games" className="add-game-cancel">
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
                <img src={image} alt="Game Preview" />
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