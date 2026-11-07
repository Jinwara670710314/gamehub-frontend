
import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import games from "../data/games";

function AdminEditGame() {
  const { id } = useParams();
  const navigate = useNavigate();

  const game = games.find((item) => item.id === Number(id));

  const [name, setName] = useState(game?.name || "");
  const [genre, setGenre] = useState(game?.genre || "");
  const [year, setYear] = useState(game?.year || "");
  const [image, setImage] = useState(game?.image || "");
  const [description, setDescription] = useState(
    game?.description || ""
  );

  if (!game) {
    return (
      <main className="edit-game-page">
        <div className="edit-game-container">
          <h2>Game Not Found</h2>
          <p>ไม่พบข้อมูลเกมที่ต้องการแก้ไข</p>
          <Link to="/admin/games" className="edit-back-btn">
            ← Back to Games
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    game.name = name;
    game.genre = genre;
    game.year = Number(year);
    game.image = image;
    game.description = description;

    alert("Game updated successfully!");
    navigate("/admin/games");
  };

  return (
    <main className="edit-game-page">
      <div className="edit-game-container">

        <div className="edit-game-header">
          <div>
            <span className="edit-game-eyebrow">
              GAMEHUB MANAGEMENT
            </span>
            <h1>Edit Game</h1>
            <p>แก้ไขรายละเอียดเกมและจัดการข้อมูลภายในระบบ</p>
          </div>

          <Link to="/admin/games" className="edit-back-btn">
            ← Back to Games
          </Link>
        </div>

        <div className="edit-game-content">

          <form className="edit-game-form" onSubmit={handleSubmit}>
            <div className="edit-section-heading">
              <span>01</span>
              <div>
                <h2>Game Information</h2>
                <p>รายละเอียดพื้นฐานของเกม</p>
              </div>
            </div>

            <div className="edit-field">
              <label>Game Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter game name"
                required
              />
            </div>

            <div className="edit-field-row">
              <div className="edit-field">
                <label>Genre</label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Action RPG"
                  required
                />
              </div>

              <div className="edit-field">
                <label>Release Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2025"
                  required
                />
              </div>
            </div>

            <div className="edit-field">
              <label>Cover Image URL</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/game-image.jpg"
                required
              />
            </div>

            <div className="edit-field">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write something about this game..."
                rows="5"
              />
            </div>

            <div className="edit-form-actions">
              <Link to="/admin/games" className="edit-cancel-btn">
                Cancel
              </Link>

              <button type="submit" className="edit-save-btn">
                Save Changes →
              </button>
            </div>
          </form>

          <aside className="edit-game-preview">
            <div className="edit-preview-heading">
              <span>02 / PREVIEW</span>
              <span className="edit-live-status">
                <i /> LIVE PREVIEW
              </span>
            </div>

            <div className="edit-preview-image">
              {image ? (
                <img src={image} alt={name} />
              ) : (
                <div className="edit-image-placeholder">
                  GAME COVER
                </div>
              )}
            </div>

            <div className="edit-preview-info">
              <span className="edit-preview-tag">
                {genre || "GAME GENRE"}
              </span>

              <h2>{name || "Game Name"}</h2>

              <p className="edit-preview-year">
                RELEASE YEAR · {year || "----"}
              </p>

              <p className="edit-preview-description">
                {description || "Game description will appear here..."}
              </p>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}

export default AdminEditGame;
