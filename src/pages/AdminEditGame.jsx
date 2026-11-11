
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

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

function AdminEditGame() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);

  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // โหลดข้อมูลเกมจาก Backend
  useEffect(() => {
    let isMounted = true;

    const fetchGame = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/games/${id}`
        );

        const result = await readResponse(response);

        if (!result.data) {
          throw new Error("ไม่พบข้อมูลเกม");
        }

        if (isMounted) {
          const gameData = result.data;

          setGame(gameData);
          setName(gameData.name || "");
          setGenre(gameData.genre || "");
          setYear(gameData.year ?? "");
          setImage(gameData.image || "");
          setDescription(gameData.description || "");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "ไม่สามารถโหลดข้อมูลเกมได้");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchGame();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // บันทึกข้อมูลเกมลงฐานข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/games/${id}`,
        {
          method: "PUT",
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
            rawg_id: game.rawg_id ?? null,
          }),
        }
      );

      const result = await readResponse(response);

      if (result.data) {
        setGame(result.data);
      }

      setNotification("Game updated successfully!");

      setTimeout(() => {
        navigate("/admin/games");
      }, 1500);

    } catch (err) {
      setError(err.message || "ไม่สามารถบันทึกข้อมูลเกมได้");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="edit-game-page">
        <div className="edit-game-container">
          <h2>Loading Game...</h2>
          <p>กำลังโหลดข้อมูลเกมจากฐานข้อมูล</p>
        </div>
      </main>
    );
  }

  if (error && !game) {
    return (
      <main className="edit-game-page">
        <div className="edit-game-container">
          <h2>Unable to Load Game</h2>
          <p>{error}</p>
          <Link to="/admin/games" className="edit-back-btn">
            ← Back to Games
          </Link>
        </div>
      </main>
    );
  }

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

  return (
    <main className="edit-game-page">
      <div className="edit-game-container">

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

            {error && (
              <p role="alert" style={{ color: "#ef4444" }}>
                {error}
              </p>
            )}

            <div className="edit-form-actions">
              <Link to="/admin/games" className="edit-cancel-btn">
                Cancel
              </Link>

              <button
                type="submit"
                className="edit-save-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes →"}
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
                <img
                  src={image}
                  alt={name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
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
