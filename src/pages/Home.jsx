
import { Link } from "react-router-dom";
import games from "../data/games";

function Home() {
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
                <p>{game.genre} · {game.year}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
