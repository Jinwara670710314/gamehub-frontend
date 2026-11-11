
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

  // เก็บเกมที่กำลังรอยืนยันการลบ
  const [confirmDelete, setConfirmDelete] = useState(null);

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

  // เริ่มแสดงข้อความยืนยันการลบในหน้าเว็บ
  const handleDelete = (id, name) => {
    setConfirmDelete({ id, name });
    setError("");
  };

  // ยืนยันลบเกมในฐานข้อมูล
  const confirmDeleteGame = async (id) => {
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

      setConfirmDelete(null);
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
    <main className="min-h-screen px-6 pt-[65px] pb-[100px] text-white bg-[radial-gradient(ellipse_at_85%_5%,rgba(124,58,237,0.13),transparent_35%),#09090f] max-[600px]:px-4 max-[600px]:pt-10 max-[600px]:pb-[70px]">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center gap-[25px] mb-[38px] max-[600px]:flex-col max-[600px]:items-stretch">
          <div>
            <span className="text-[#a78bfa] text-xs font-extrabold tracking-[3px]">
              GAMEHUB MANAGEMENT
            </span>

            <h1 className="text-[clamp(34px,5vw,48px)] my-3 font-extrabold tracking-[-1px]">
              Manage Games
              <span className="text-[#a78bfa]">.</span>
            </h1>

            <p className="text-[#9995a8] text-sm">
              จัดการข้อมูลเกมทั้งหมดภายในระบบ GameHub
            </p>
          </div>

          <div className="flex gap-3 flex-wrap max-[600px]:w-full">
            <Link
              to="/admin"
              className="px-[19px] py-[13px] rounded-[10px] text-[13px] font-bold no-underline text-[#d6d1e2] bg-[#171521] border border-[#302a40] transition duration-300 hover:border-[#8b5cf6] hover:text-white max-[600px]:flex-1 max-[600px]:text-center"
            >
              ← Dashboard
            </Link>

            <Link
              to="/admin/games/new"
              className="px-[19px] py-[13px] rounded-[10px] text-[13px] font-bold no-underline text-white bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] shadow-[0_5px_20px_rgba(124,58,237,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(124,58,237,0.4)] max-[600px]:flex-1 max-[600px]:text-center"
            >
              + Add New Game
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-5 mb-[45px] max-[600px]:grid-cols-1">
          <div className="flex items-center gap-5 p-[25px] bg-gradient-to-br from-[#191624] to-[#111019] border border-[#2c263a] rounded-[15px]">
            <div className="w-[55px] h-[55px] shrink-0 grid place-items-center rounded-[13px] bg-[#2b1e45] text-[25px]">
              🎮
            </div>

            <div>
              <span className="text-[#a78bfa] text-[11px] font-extrabold tracking-[1.5px]">
                ACTIVE GAMES
              </span>

              <h2 className="text-[29px] my-[5px]">
                {activeGames.length}
              </h2>

              <p className="text-[#898497] text-xs m-0">
                เกมที่แสดงในระบบ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-[25px] bg-gradient-to-br from-[#191624] to-[#111019] border border-[#2c263a] rounded-[15px]">
            <div className="w-[55px] h-[55px] shrink-0 grid place-items-center rounded-[13px] bg-[#2b1e45] text-[25px]">
              🗑️
            </div>

            <div>
              <span className="text-[#a78bfa] text-[11px] font-extrabold tracking-[1.5px]">
                DELETED GAMES
              </span>

              <h2 className="text-[29px] my-[5px]">
                {deletedGames.length}
              </h2>

              <p className="text-[#898497] text-xs m-0">
                เกมที่ถูกลบและกู้คืนได้
              </p>
            </div>
          </div>
        </div>

        {/* List Header */}
        <div className="flex justify-between items-center gap-5 mb-[23px] max-[600px]:flex-col max-[600px]:items-stretch">
          <div>
            <h2 className="text-[23px] mb-[7px]">
              {showDeleted ? "Deleted Games" : "Game Library"}
            </h2>

            <p className="text-[#9995a8] text-sm m-0">
              {showDeleted
                ? "รายการเกมที่ถูกลบ สามารถกู้คืนได้"
                : "รายการเกมทั้งหมดที่อยู่ในระบบ"}
            </p>
          </div>

          <div className="flex items-center gap-[10px] w-[280px] px-[15px] bg-[#15131e] border border-[#302a40] rounded-[10px] focus-within:border-[#8b5cf6] max-[600px]:w-auto">
            <span className="text-[#a78bfa] text-[25px]">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-[13px] bg-transparent border-0 outline-none text-white text-[13px] placeholder:text-[#777184]"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-[10px] mb-[25px]">
          <button
            type="button"
            className={`px-[17px] py-[10px] text-xs font-bold rounded-lg border transition duration-300 ${
              !showDeleted
                ? "text-white bg-[#39245d] border-[#8b5cf6]"
                : "text-[#aaa4ba] bg-[#15131e] border-[#302a40] hover:text-white hover:bg-[#39245d] hover:border-[#8b5cf6]"
            }`}
            onClick={() => {
              setShowDeleted(false);
              setConfirmDelete(null);
            }}
          >
            All Active ({activeGames.length})
          </button>

          <button
            type="button"
            className={`px-[17px] py-[10px] text-xs font-bold rounded-lg border transition duration-300 ${
              showDeleted
                ? "text-white bg-[#39245d] border-[#8b5cf6]"
                : "text-[#aaa4ba] bg-[#15131e] border-[#302a40] hover:text-white hover:bg-[#39245d] hover:border-[#8b5cf6]"
            }`}
            onClick={() => {
              setShowDeleted(true);
              setConfirmDelete(null);
            }}
          >
            Deleted ({deletedGames.length})
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="text-[#ef4444] my-3"
          >
            {error}
          </p>
        )}

        {/* Game List */}
        {loading ? (
          <div className="text-center py-[70px] px-5 border border-dashed border-[#393047] rounded-[15px] text-[#9995a8]">
            <span className="text-[40px]">🎮</span>
            <h3 className="text-white">Loading Games...</h3>
            <p>กำลังโหลดข้อมูลเกมจากฐานข้อมูล</p>
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-3 gap-[22px] max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
            {filteredGames.map((game) => (
              <div
                className="group overflow-hidden bg-[#15131e] border border-[#2a2536] rounded-[15px] transition duration-300 hover:-translate-y-[5px] hover:border-[#7650c9] hover:shadow-[0_12px_35px_rgba(91,55,160,0.18)]"
                key={game.id}
              >
                <div className="relative h-[175px] overflow-hidden bg-[#0b0a11]">
                  <img
                    src={game.image || "/game-placeholder.png"}
                    alt={game.name || "Game"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/game-placeholder.png";
                    }}
                    className="block w-full h-full object-cover transition duration-[400ms] group-hover:scale-105"
                  />

                  <span className="absolute top-3 left-3 px-[10px] py-[6px] bg-[rgba(10,9,16,0.85)] border border-[rgba(255,255,255,0.15)] rounded-md text-[#c4aaff] text-[10px] font-extrabold">
                    GAME #{game.id}
                  </span>
                </div>

                <div className="p-[18px]">
                  <div className="flex justify-between gap-[10px] text-[#a78bfa] text-[11px] font-bold">
                    <span>{game.genre || "-"}</span>
                    <span>{game.year ?? "-"}</span>
                  </div>

                  <h3 className="text-lg mt-3 mb-5 whitespace-nowrap overflow-hidden text-ellipsis">
                    {game.name}
                  </h3>

                  <p className="text-[#9995a8] text-sm mb-4">
                    {game.description || "ยังไม่มีรายละเอียดเกม"}
                  </p>

                  <div className="flex gap-[9px]">
                    {game.isDeleted ? (
                      <button
                        type="button"
                        className="flex-1 px-2 py-[11px] text-xs font-bold text-[#86efac] bg-[#14271e] border border-[#285c3c] rounded-lg cursor-pointer transition duration-300 hover:bg-[#1c3d2b] hover:border-[#4ade80] disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleRestore(game.id)}
                        disabled={actionLoading === game.id}
                      >
                        {actionLoading === game.id
                          ? "Processing..."
                          : "↶ Restore"}
                      </button>
                    ) : confirmDelete?.id === game.id ? (
                      <div className="w-full p-4 rounded-lg border border-[#75404a] bg-[#382333]">
                        <p className="text-[#fda4af] text-sm mb-3">
                          คุณต้องการลบเกม {game.name} ใช่หรือไม่?
                        </p>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="px-4 py-2 rounded-md bg-[#dc3545] text-white text-sm font-semibold hover:bg-[#bb2d3b] disabled:opacity-50"
                            onClick={() => confirmDeleteGame(game.id)}
                            disabled={actionLoading === game.id}
                          >
                            {actionLoading === game.id
                              ? "Processing..."
                              : "ยืนยันลบ"}
                          </button>

                          <button
                            type="button"
                            className="px-4 py-2 rounded-md bg-[#30394f] text-white text-sm font-semibold hover:bg-[#414d67] disabled:opacity-50"
                            onClick={() => setConfirmDelete(null)}
                            disabled={actionLoading === game.id}
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Link
                          to={`/admin/games/edit/${game.id}`}
                          className="flex flex-1 min-w-0 items-center justify-center px-2 py-[11px] rounded-lg text-xs font-bold no-underline text-white bg-[#6538b5] border border-[#8153d7] transition duration-300 hover:bg-[#8051d6]"
                        >
                          ✎ Edit Game
                        </Link>

                        <button
                          type="button"
                          className="flex flex-1 min-w-0 items-center justify-center px-2 py-[11px] rounded-lg text-xs font-bold text-[#ff9999] bg-[#29171d] border border-[#51252f] cursor-pointer transition duration-300 hover:bg-[#48202a] disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="text-center py-[70px] px-5 border border-dashed border-[#393047] rounded-[15px] text-[#9995a8]">
            <span className="text-[40px]">🎮</span>
            <h3 className="text-white">No Games Found</h3>
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
