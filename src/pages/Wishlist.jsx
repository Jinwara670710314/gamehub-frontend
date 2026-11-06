
import { Link } from "react-router-dom";
import { useState } from "react";
import games from "../data/games";

function Wishlist() {
  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(
      localStorage.getItem("gamehubWishlist") || "[]"
    );
  });

  const favoriteGames = games.filter((game) =>
    wishlist.includes(game.id)
  );

  function removeGame(id) {
    const updatedWishlist = wishlist.filter(
      (gameId) => gameId !== id
    );

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "gamehubWishlist",
      JSON.stringify(updatedWishlist)
    );
  }

  return (
    <main className="featured wishlist-page">
      <div className="section-heading">
        <div>
          <span className="hero-tag">YOUR COLLECTION</span>
          <h2>เกมโปรดของฉัน ♥</h2>
        </div>

        <p>เกมที่คุณบันทึกไว้</p>
      </div>

      <p className="games-count">
        มีเกมใน Wishlist ทั้งหมด {favoriteGames.length} เกม
      </p>

      {favoriteGames.length === 0 ? (
        <div className="wishlist-empty">
          <h3>ยังไม่มีเกมใน Wishlist</h3>
          <p>ลองเลือกเกมที่คุณชื่นชอบแล้วเพิ่มไว้ที่นี่</p>
          <Link to="/games" className="detail-button">
            ไปเลือกเกม →
          </Link>
        </div>
      ) : (
        <div className="feature-grid">
          {favoriteGames.map((game) => (
            <div className="feature-card" key={game.id}>
              <Link
                to={`/games/${game.id}`}
                className="wishlist-card-link"
              >
                <img
                  src={game.image}
                  alt={game.name}
                  className="game-image"
                />

                <div className="game-info">
                  <h3>{game.name}</h3>
                  <p>{game.genre} · {game.year}</p>
                </div>
              </Link>

              <button
                className="wishlist-remove"
                onClick={() => removeGame(game.id)}
              >
                ♥ ลบออกจาก Wishlist
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Wishlist;
