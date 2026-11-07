
import { useState } from "react";
import { Link } from "react-router-dom";
import games from "../data/games";

function AdminGames() {
  const [allGames, setAllGames] = useState(
    games.map((game) => ({
      ...game,
      isDeleted: game.isDeleted || false,
    }))
  );

  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const activeGames = allGames.filter((game) => !game.isDeleted);
  const deletedGames = allGames.filter((game) => game.isDeleted);

  const filteredGames = allGames.filter((game) => {
    const matchesSearch = game.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus = showDeleted
      ? game.isDeleted
      : !game.isDeleted;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id, name) => {
    const confirmed = window.confirm(
      `คุณต้องการลบเกม ${name} ใช่หรือไม่?`
    );

    if (!confirmed) return;

    setAllGames((previousGames) =>
      previousGames.map((game) =>
        game.id === id
          ? { ...game, isDeleted: true }
          : game
      )
    );
  };

  const handleRestore = (id) => {
    setAllGames((previousGames) =>
      previousGames.map((game) =>
        game.id === id
          ? { ...game, isDeleted: false }
          : game
      )
    );
  };

  return (
    <main className="manage-games-page">
      <div className="manage-games-container">

        <div className="manage-games-header">
          <div>
            <span className="manage-eyebrow">
              GAMEHUB MANAGEMENT
            </span>
            <h1>Manage Games<span>.</span></h1>
            <p>จัดการข้อมูลเกมทั้งหมดภายในระบบ GameHub</p>
          </div>

          <div className="manage-header-actions">
            <Link to="/admin" className="manage-back-btn">
              ← Dashboard
            </Link>

            <Link to="/admin/games/new" className="manage-add-btn">
              + Add New Game
            </Link>
          </div>
        </div>

        <div className="manage-stats">
          <div className="manage-stat-card">
            <div className="manage-stat-icon">🎮</div>
            <div>
              <span>ACTIVE GAMES</span>
              <h2>{activeGames.length}</h2>
              <p>เกมที่แสดงในระบบ</p>
            </div>
          </div>

          <div className="manage-stat-card">
            <div className="manage-stat-icon">🗑️</div>
            <div>
              <span>DELETED GAMES</span>
              <h2>{deletedGames.length}</h2>
              <p>เกมที่ถูกลบและกู้คืนได้</p>
            </div>
          </div>
        </div>

        <div className="manage-list-header">
          <div>
            <h2>
              {showDeleted ? "Deleted Games" : "Game Library"}
            </h2>
            <p>
              {showDeleted
                ? "รายการเกมที่ถูกลบ สามารถกู้คืนได้"
                : "รายการเกมทั้งหมดที่อยู่ในระบบ"}
            </p>
          </div>

          <div className="manage-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="manage-filter-actions">
          <button
            className={!showDeleted ? "active" : ""}
            onClick={() => setShowDeleted(false)}
          >
            All Active ({activeGames.length})
          </button>

          <button
            className={showDeleted ? "active" : ""}
            onClick={() => setShowDeleted(true)}
          >
            Deleted ({deletedGames.length})
          </button>
        </div>

        {filteredGames.length > 0 ? (
          <div className="manage-game-grid">
            {filteredGames.map((game) => (
              <div className="manage-game-card" key={game.id}>
                <div className="manage-game-image">
                  <img src={game.image} alt={game.name} />

                  <span className="manage-game-number">
                    GAME #{game.id}
                  </span>
                </div>

                <div className="manage-game-details">
                  <div className="manage-game-meta">
                    <span>{game.genre}</span>
                    <span>{game.year}</span>
                  </div>

                  <h3>{game.name}</h3>

                  <div className="manage-game-actions">
                    {game.isDeleted ? (
                      <button
                        className="manage-restore-btn"
                        onClick={() => handleRestore(game.id)}
                      >
                        ↶ Restore
                      </button>
                    ) : (
                      <>
                        <Link
                          to={`/admin/games/edit/${game.id}`}
                          className="manage-edit-btn"
                        >
                          ✎ Edit Game
                        </Link>

                        <button
                          className="manage-delete-btn"
                          onClick={() =>
                            handleDelete(game.id, game.name)
                          }
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="manage-empty">
            <span>🎮</span>
            <h3>No Games Found</h3>
            <p>ไม่พบเกมในรายการนี้</p>
          </div>
        )}

      </div>
    </main>
  );
}

export default AdminGames;
