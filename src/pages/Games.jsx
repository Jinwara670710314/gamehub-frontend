
import { useState } from "react";
import { Link } from "react-router-dom";
import games from "../data/games";

function Games() {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("ทั้งหมด");

  const filteredGames = games.filter((game) => {
    const matchName = game.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchGenre =
      selectedGenre === "ทั้งหมด" ||
      game.genre === selectedGenre;

    return matchName && matchGenre;
  });

  return (
    <main className="featured games-page">
      <div className="section-heading">
        <div>
          <span className="hero-tag">EXPLORE COLLECTION</span>
          <h2>เกมทั้งหมด</h2>
        </div>

        <p>ค้นหาเกมที่คุณชื่นชอบ</p>
      </div>

      <div className="games-toolbar">
        <input
          type="text"
          placeholder="ค้นหาชื่อเกม..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={selectedGenre}
          onChange={(event) => setSelectedGenre(event.target.value)}
        >
          <option value="ทั้งหมด">ทุกประเภท</option>
          <option value="Action">Action</option>
          <option value="Action RPG">Action RPG</option>
          <option value="Adventure">Adventure</option>
        </select>
      </div>

      <p className="games-count">
        พบเกมทั้งหมด {filteredGames.length} เกม
      </p>

      <div className="feature-grid">
        {filteredGames.map((game) => (
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

      {filteredGames.length === 0 && (
        <p className="no-games">
          ไม่พบเกมที่ค้นหา ลองค้นหาด้วยคำอื่น
        </p>
      )}
    </main>
  );
}

export default Games;
