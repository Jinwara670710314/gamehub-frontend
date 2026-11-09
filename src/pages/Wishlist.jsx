
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const token = localStorage.getItem("token");

  const loadWishlist = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/library`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();

      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        result = { message: responseText };
      }

      if (!response.ok) {
        throw new Error(
          result.message || "ไม่สามารถโหลด Wishlist ได้"
        );
      }

      const games = result.data || [];

      const favoriteGames = games.filter(
        (game) => game.status === "want_to_play"
      );

      setWishlist(favoriteGames);
    } catch (err) {
      console.error("Load wishlist error:", err);
      setError(err.message || "ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  async function removeGame(libraryId) {
    try {
      setRemovingId(libraryId);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/library/${libraryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText = await response.text();

      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        result = { message: responseText };
      }

      if (!response.ok) {
        throw new Error(
          result.message || "นำเกมออกจาก Wishlist ไม่สำเร็จ"
        );
      }

      setWishlist((currentWishlist) =>
        currentWishlist.filter((game) => game.id !== libraryId)
      );
    } catch (err) {
      console.error("Remove wishlist error:", err);
      setError(err.message || "ไม่สามารถลบเกมได้");
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return (
      <main className="featured wishlist-page">
        <p>กำลังโหลด Wishlist...</p>
      </main>
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

      {!token ? (
        <div className="wishlist-empty">
          <h3>กรุณาเข้าสู่ระบบก่อนดู Wishlist</h3>
          <p>เข้าสู่ระบบเพื่อดูเกมที่คุณบันทึกไว้</p>

          <Link to="/login" className="detail-button">
            เข้าสู่ระบบ →
          </Link>
        </div>
      ) : error ? (
        <p
          style={{
            color: "#ef4444",
            fontSize: "14px",
            margin: "12px 0",
          }}
        >
          {error}
        </p>
      ) : wishlist.length === 0 ? (
        <>
          <p className="games-count">
            มีเกมใน Wishlist ทั้งหมด 0 เกม
          </p>

          <div className="wishlist-empty">
            <h3>ยังไม่มีเกมใน Wishlist</h3>
            <p>ลองเลือกเกมที่คุณชื่นชอบแล้วเพิ่มไว้ที่นี่</p>

            <Link to="/games" className="detail-button">
              ไปเลือกเกม →
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="games-count">
            มีเกมใน Wishlist ทั้งหมด {wishlist.length} เกม
          </p>

          <div className="feature-grid">
            {wishlist.map((game) => (
              <div className="feature-card" key={game.id}>
                <Link
                  to={`/games/${game.game_id}`}
                  className="wishlist-card-link"
                >
                  <img
                    src={game.image}
                    alt={game.name}
                    className="game-image"
                  />

                  <div className="game-info">
                    <h3>{game.name}</h3>
                    <p>
                      {game.genre} · {game.year}
                    </p>
                  </div>
                </Link>

                <button
                  className="wishlist-remove"
                  onClick={() => removeGame(game.id)}
                  disabled={removingId === game.id}
                >
                  {removingId === game.id
                    ? "กำลังลบ..."
                    : "♥ ลบออกจาก Wishlist"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default Wishlist;
