
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGames } from "../api/gameApi";

function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGames() {
      try {
        const data = await getGames();
        setGames(data);
      } catch (err) {
        console.error("Load games error:", err);
        setError("ไม่สามารถโหลดข้อมูลเกมได้");
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">YOUR GAMING WORLD</span>

          <h1>
            DISCOVER YOUR
            <br />
            NEXT <span>ADVENTURE.</span>
          </h1>

          <p>
            ค้นพบเกมที่ใช่ สำรวจเกมใหม่ ๆ
            และเลือกเกมโปรดในแบบของคุณ
          </p>

          <Link to="/games" className="btn-primary">
            สำรวจเกมทั้งหมด →
          </Link>
        </div>
      </section>

      <section className="featured" id="featured">
        <div className="section-heading">
          <div>
            <span className="hero-tag">GAME COLLECTION</span>
            <h2>เกมยอดนิยม</h2>
          </div>

          <p>ค้นพบเกมที่น่าสนใจ</p>
        </div>

        {loading && <p>กำลังโหลดข้อมูลเกม...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && (
          <div className="feature-grid">
            {games.map((game) => (
              <Link
                to={`/games/${game.id}`}
                className="feature-card"
                key={game.id}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
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
            ))}
          </div>
        )}

        {!loading && !error && games.length === 0 && (
          <p>ยังไม่มีข้อมูลเกม</p>
        )}
      </section>
    </div>
  );
}

export default Home;
