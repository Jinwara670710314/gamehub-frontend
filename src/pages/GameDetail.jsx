
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import games from "../data/games";

function GameDetail() {
  const { id } = useParams();

  const game = games.find((item) => item.id === Number(id));

  const [isFavorite, setIsFavorite] = useState(() => {
    const savedGames = JSON.parse(
      localStorage.getItem("gamehubWishlist") || "[]"
    );

    return savedGames.includes(Number(id));
  });

  function toggleWishlist() {
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

  if (!game) {
    return (
      <main className="detail-page">
        <h2>ไม่พบข้อมูลเกม</h2>
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
            {isFavorite ? "♥ อยู่ใน Wishlist แล้ว" : "♡ เพิ่มใน Wishlist"}
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
