
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

function Wishlist() {
  const { token } = useAuth();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

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
      <main className="max-w-[1500px] mx-auto py-[65px] px-[7%] max-[1000px]:py-[55px] max-[1000px]:px-[6%] max-[600px]:py-[45px] max-[600px]:px-[5%]">
        <p className="text-[#aab3ca]">
          กำลังโหลด Wishlist...
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-[1500px] mx-auto py-[65px] px-[7%] max-[1000px]:py-[55px] max-[1000px]:px-[6%] max-[600px]:py-[45px] max-[600px]:px-[5%]">
      <div className="flex justify-between items-end gap-5 mb-[25px] max-[600px]:flex-col max-[600px]:items-start">
        <div>
          <span className="text-[#a78bfa] text-[13px] font-bold tracking-[3px]">
            YOUR COLLECTION
          </span>

          <h2 className="text-[30px] mt-3 text-white">
            เกมโปรดของฉัน ♥
          </h2>
        </div>

        <p className="text-[#9ca7bd] text-[15px]">
          เกมที่คุณบันทึกไว้
        </p>
      </div>

      {!token ? (
        <div className="bg-[#171d2b] border border-[#2b3449] rounded-xl text-center px-6 py-12">
          <h3 className="text-white text-xl font-semibold mb-3">
            กรุณาเข้าสู่ระบบก่อนดู Wishlist
          </h3>

          <p className="text-[#aab3ca] mb-6">
            เข้าสู่ระบบเพื่อดูเกมที่คุณบันทึกไว้
          </p>

          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#8b5cf6] border border-[#8b5cf6] text-white no-underline font-semibold transition-colors hover:bg-[#7c3aed]"
          >
            เข้าสู่ระบบ →
          </Link>
        </div>
      ) : error ? (
        <p className="text-red-400 text-sm my-3">
          {error}
        </p>
      ) : wishlist.length === 0 ? (
        <>
          <p className="text-[#aab3ca] text-sm mb-5">
            มีเกมใน Wishlist ทั้งหมด 0 เกม
          </p>

          <div className="bg-[#171d2b] border border-[#2b3449] rounded-xl text-center px-6 py-12">
            <h3 className="text-white text-xl font-semibold mb-3">
              ยังไม่มีเกมใน Wishlist
            </h3>

            <p className="text-[#aab3ca] mb-6">
              ลองเลือกเกมที่คุณชื่นชอบแล้วเพิ่มไว้ที่นี่
            </p>

            <Link
              to="/games"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#8b5cf6] border border-[#8b5cf6] text-white no-underline font-semibold transition-colors hover:bg-[#7c3aed]"
            >
              ไปเลือกเกม →
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="text-[#aab3ca] text-sm mb-5">
            มีเกมใน Wishlist ทั้งหมด {wishlist.length} เกม
          </p>

          <div className="grid grid-cols-4 gap-[22px] max-[1000px]:grid-cols-2 max-[600px]:grid-cols-1">
            {wishlist.map((game) => (
              <div
                className="min-w-0 overflow-hidden bg-[#171d2b] border border-[#2b3449] rounded-xl"
                key={game.id}
              >
                <Link
                  to={`/games/${game.game_id}`}
                  className="block no-underline text-inherit"
                >
                  <img
                    src={game.image}
                    alt={game.name}
                    className="block w-full aspect-video object-cover bg-[#20283a]"
                  />

                  <div className="p-[18px]">
                    <h3 className="text-white text-[17px] mb-[9px]">
                      {game.name}
                    </h3>

                    <p className="text-[#aab3ca] text-[14px]">
                      {game.genre} · {game.year}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  className="w-full p-3 bg-[#252b3d] text-[#fca5a5] border-0 border-t border-[#30394f] cursor-pointer text-sm hover:bg-[#45212c] disabled:opacity-50 disabled:cursor-not-allowed"
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
