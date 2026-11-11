
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

// อ่านผลลัพธ์จาก Backend ทั้งกรณี JSON และข้อความ Error
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

function AdminGames() {
  const [allGames, setAllGames] = useState([]);
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // โหลดเกมทั้งหมดจาก Backend
  useEffect(() => {
    let isMounted = true;

    const fetchAdminGames = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/admin/games`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await readResponse(response);

        if (!Array.isArray(result.data)) {
          throw new Error("รูปแบบข้อมูลเกมจาก Backend ไม่ถูกต้อง");
        }

        if (isMounted) {
          setAllGames(result.data);
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

    fetchAdminGames();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeGames = allGames.filter(
    (game) => !game.isDeleted
  );

  const deletedGames = allGames.filter(
    (game) => game.isDeleted
  );

  const filteredGames = allGames.filter((game) => {
    const gameName = (game.name || "").toLowerCase();

    const matchesSearch = gameName.includes(
      search.toLowerCase()
    );

    const matchesStatus = showDeleted
      ? game.isDeleted
      : !game.isDeleted;

    return matchesSearch && matchesStatus;
  });

  // ลบเกมในฐานข้อมูล
  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `คุณต้องการลบเกม ${name} ใช่หรือไม่?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/games/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await readResponse(response);

      setAllGames((previousGames) =>
        previousGames.map((game) =>
          game.id === id
            ? { ...game, isDeleted: true }
            : game
        )
      );
    } catch (err) {
      setError(err.message || "ไม่สามารถลบเกมได้");
    } finally {
      setActionLoading(null);
    }
  };

  // กู้คืนเกมในฐานข้อมูล
  const handleRestore = async (id) => {
    try {
      setActionLoading(id);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/games/${id}/restore`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await readResponse(response);

      setAllGames((previousGames) =>
        previousGames.map((game) =>
          game.id === id
            ? { ...game, isDeleted: false }
            : game
        )
      );
    } catch (err) {
      setError(err.message || "ไม่สามารถกู้คืนเกมได้");
    } finally {
      setActionLoading(null);
    }
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

        {error && (
          <p role="alert" style={{ color: "#ef4444", margin: "12px 0" }}>
            {error}
          </p>
        )}

        {loading ? (
          <div className="manage-empty">
            <span>🎮</span>
            <h3>Loading Games...</h3>
            <p>กำลังโหลดข้อมูลเกมจากฐานข้อมูล</p>
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="manage-game-grid">
            {filteredGames.map((game) => (
              <div className="manage-game-card" key={game.id}>
                <div className="manage-game-image">
                  <img
                    src={game.image || "/game-placeholder.png"}
                    alt={game.name || "Game"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/game-placeholder.png";
                    }}
                  />

                  <span className="manage-game-number">
                    GAME #{game.id}
                  </span>
                </div>

                <div className="manage-game-details">
                  <div className="manage-game-meta">
                    <span>{game.genre || "-"}</span>
                    <span>{game.year ?? "-"}</span>
                  </div>

                  <h3>{game.name}</h3>

                  <p className="manage-game-description">
                    {game.description || "ยังไม่มีรายละเอียดเกม"}
                  </p>

                  <div className="manage-game-actions">
                    {game.isDeleted ? (
                      <button
                        className="manage-restore-btn"
                        onClick={() => handleRestore(game.id)}
                        disabled={actionLoading === game.id}
                      >
                        {actionLoading === game.id
                          ? "Processing..."
                          : "↶ Restore"}
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
                          disabled={actionLoading === game.id}
                        >
                          {actionLoading === game.id
                            ? "Processing..."
                            : "Delete"}
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
            <p>
              {error
                ? "ไม่สามารถแสดงข้อมูลเกมได้"
                : "ไม่พบเกมในรายการนี้"}
            </p>
          </div>
        )}

      </div>
    </main>
  );
}

export default AdminGames;
