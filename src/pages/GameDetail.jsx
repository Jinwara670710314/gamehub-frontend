
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

function GameDetail() {
  const { id } = useParams();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFavorite, setIsFavorite] = useState(() => {
    const savedGames = JSON.parse(
      localStorage.getItem("gamehubWishlist") || "[]"
    );

    return savedGames.includes(Number(id));
  });

  useEffect(() => {
    async function loadGame() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/games/${id}/detail`
        );

        if (!response.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลเกมได้");
        }

        const result = await response.json();

        if (!result.data?.game) {
          throw new Error("ไม่พบข้อมูลเกม");
        }

        setGame(result.data.game);
      } catch (err) {
        console.error("Load game error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadGame();
  }, [id]);

  useEffect(() => {
    const savedGames = JSON.parse(
      localStorage.getItem("gamehubWishlist") || "[]"
    );

    setIsFavorite(savedGames.includes(Number(id)));
  }, [id]);

  function toggleWishlist() {
    if (!game) return;

    const savedGames = JSON.parse(
      localStorage.getItem("gamehubWishlist") || "[]"
    );

    let updatedGames;

    if (savedGames.includes(game.id)) {
      updatedGames = savedGames.filter(
        (gameId) => gameId !== game.id
      );
      setIsFavorite(false);
    } else {
      updatedGames = [...savedGames, game.id];
      setIsFavorite(true);
    }

    localStorage.setItem(
      "gamehubWishlist",
      JSON.stringify(updatedGames)
    );
  }

  if (loading) {
    return (
      <main className="detail-page">
        <p>กำลังโหลดข้อมูลเกม...</p>
      </main>
    );
  }

  if (error || !game) {
    return (
      <main className="detail-page">
        <h2>{error || "ไม่พบข้อมูลเกม"}</h2>
        <Link to="/games" className="detail-back">
          ← กลับไปหน้าเกมทั้งหมด
        </Link>
      </main>
    );
  }

  return (
    <main className="detail-page">
      <Link to="/games" className="detail-back">
        ← กลับไปหน้าเกมทั้งหมด
      </Link>

      <section className="detail-container">
        <div className="detail-image-wrapper">
          <img
            src={game.image}
            alt={game.name}
            className="detail-image"
          />
        </div>

        <div className="detail-content">
          <span className="detail-label">GAME DETAILS</span>

          <h1>{game.name}</h1>

          <div className="detail-tags">
            <span>{game.genre}</span>
            <span>Released {game.year}</span>
          </div>

          <div className="detail-divider"></div>

          <h3>เกี่ยวกับเกมนี้</h3>

          <p className="detail-description">
            {game.description}
          </p>

          <button
            className="wishlist-button"
            onClick={toggleWishlist}
          >
            {isFavorite
              ? "♥ อยู่ใน Wishlist แล้ว"
              : "♡ เพิ่มใน Wishlist"}
          </button>

          <Link to="/games" className="detail-button">
            สำรวจเกมอื่น ๆ →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default GameDetail;
