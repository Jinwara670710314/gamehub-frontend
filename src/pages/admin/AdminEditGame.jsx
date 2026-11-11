
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

// อ่านผลลัพธ์จาก Backend
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

function AdminEditGame() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);

  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // โหลดข้อมูลเกมจาก Backend
  useEffect(() => {
    let isMounted = true;

    const fetchGame = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/games/${id}`
        );

        const result = await readResponse(response);

        if (!result.data) {
          throw new Error("ไม่พบข้อมูลเกม");
        }

        if (isMounted) {
          const gameData = result.data;

          setGame(gameData);
          setName(gameData.name || "");
          setGenre(gameData.genre || "");
          setYear(gameData.year ?? "");
          setImage(gameData.image || "");
          setDescription(gameData.description || "");
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

    fetchGame();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // บันทึกข้อมูลเกมลงฐานข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/games/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            genre: genre.trim(),
            year: Number(year),
            image: image.trim(),
            description: description.trim(),
            rawg_id: game.rawg_id ?? null,
          }),
        }
      );

      const result = await readResponse(response);

      if (result.data) {
        setGame(result.data);
      }

      setNotification("Game updated successfully!");

      setTimeout(() => {
        navigate("/admin/games");
      }, 1500);

    } catch (err) {
      setError(err.message || "ไม่สามารถบันทึกข้อมูลเกมได้");
    } finally {
      setSaving(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen box-border px-6 pt-[65px] pb-[100px] text-white bg-[radial-gradient(ellipse_at_85%_10%,rgba(124,58,237,0.13),transparent_35%),#09090f] max-[550px]:px-4 max-[550px]:pt-10 max-[550px]:pb-[70px]">
        <div className="max-w-[1200px] mx-auto">
          <h2>Loading Game...</h2>
          <p>กำลังโหลดข้อมูลเกมจากฐานข้อมูล</p>
        </div>
      </main>
    );
  }

  // Error
  if (error && !game) {
    return (
      <main className="min-h-screen box-border px-6 pt-[65px] pb-[100px] text-white bg-[radial-gradient(ellipse_at_85%_10%,rgba(124,58,237,0.13),transparent_35%),#09090f] max-[550px]:px-4 max-[550px]:pt-10 max-[550px]:pb-[70px]">
        <div className="max-w-[1200px] mx-auto">
          <h2>Unable to Load Game</h2>
          <p>{error}</p>

          <Link
            to="/admin/games"
            className="inline-block text-[#d5d0e5] bg-[#15131e] border border-[#302a40] px-[19px] py-3 rounded-[10px] font-semibold no-underline transition duration-300 hover:border-[#8b5cf6] hover:text-white hover:bg-[#211832]"
          >
            ← Back to Games
          </Link>
        </div>
      </main>
    );
  }

  // Game Not Found
  if (!game) {
    return (
      <main className="min-h-screen box-border px-6 pt-[65px] pb-[100px] text-white bg-[radial-gradient(ellipse_at_85%_10%,rgba(124,58,237,0.13),transparent_35%),#09090f] max-[550px]:px-4 max-[550px]:pt-10 max-[550px]:pb-[70px]">
        <div className="max-w-[1200px] mx-auto">
          <h2>Game Not Found</h2>
          <p>ไม่พบข้อมูลเกมที่ต้องการแก้ไข</p>

          <Link
            to="/admin/games"
            className="inline-block text-[#d5d0e5] bg-[#15131e] border border-[#302a40] px-[19px] py-3 rounded-[10px] font-semibold no-underline transition duration-300 hover:border-[#8b5cf6] hover:text-white hover:bg-[#211832]"
          >
            ← Back to Games
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen box-border px-6 pt-[65px] pb-[100px] text-white bg-[radial-gradient(ellipse_at_85%_10%,rgba(124,58,237,0.13),transparent_35%),#09090f] max-[550px]:px-4 max-[550px]:pt-10 max-[550px]:pb-[70px]">
      <div className="max-w-[1200px] mx-auto">

        {/* Notification */}
        {notification && (
          <div
            role="status"
            className="fixed top-6 right-6 z-[9999] bg-[#166534] text-white px-6 py-4 rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.2)] font-semibold"
          >
            ✓ {notification}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center gap-6 mb-[42px] max-[550px]:items-start max-[550px]:flex-col">
          <div>
            <span className="text-[#a78bfa] text-xs font-extrabold tracking-[3px]">
              GAMEHUB MANAGEMENT
            </span>

            <h1 className="text-[clamp(34px,5vw,48px)] my-3 font-extrabold tracking-[-1px]">
              Edit Game
            </h1>

            <p className="text-[#9996aa] text-[15px]">
              แก้ไขรายละเอียดเกมและจัดการข้อมูลภายในระบบ
            </p>
          </div>

          <Link
            to="/admin/games"
            className="whitespace-nowrap no-underline text-[#d5d0e5] border border-[#302a40] bg-[#15131e] px-[19px] py-3 rounded-[10px] font-semibold transition duration-300 hover:border-[#8b5cf6] hover:text-white hover:bg-[#211832]"
          >
            ← Back to Games
          </Link>
        </div>

        {/* Form and Preview */}
        <div className="grid grid-cols-[1.15fr_0.85fr] gap-7 items-start max-[850px]:grid-cols-1">

          {/* Edit Form */}
          <form
            className="min-w-0 box-border p-[30px] bg-[linear-gradient(145deg,#171521,#100f17)] border border-[#292438] rounded-[18px] shadow-[0_15px_45px_rgba(0,0,0,0.22)] max-[550px]:p-[21px]"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center gap-[15px] mb-[30px]">
              <span className="text-[#a78bfa] text-sm font-extrabold bg-[#2b1e48] px-[14px] py-3 rounded-[10px]">
                01
              </span>

              <div>
                <h2 className="text-[21px] mb-[5px]">
                  Game Information
                </h2>

                <p className="text-[#888398] text-[13px] m-0">
                  รายละเอียดพื้นฐานของเกม
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-[10px] mb-[23px] min-w-0">
              <label className="text-[#dcd7e9] text-[13px] font-bold">
                Game Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter game name"
                required
                className="box-border w-full bg-[#0d0c14] border border-[#302b3e] rounded-[10px] text-white px-4 py-[14px] text-sm outline-none transition duration-300 focus:border-[#9565f5] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.13)] placeholder:text-[#666174]"
              />
            </div>

            <div className="grid grid-cols-2 gap-[18px] max-[550px]:grid-cols-1 max-[550px]:gap-0">
              <div className="flex flex-col gap-[10px] mb-[23px] min-w-0">
                <label className="text-[#dcd7e9] text-[13px] font-bold">
                  Genre
                </label>

                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Action RPG"
                  required
                  className="box-border w-full bg-[#0d0c14] border border-[#302b3e] rounded-[10px] text-white px-4 py-[14px] text-sm outline-none transition duration-300 focus:border-[#9565f5] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.13)] placeholder:text-[#666174]"
                />
              </div>

              <div className="flex flex-col gap-[10px] mb-[23px] min-w-0">
                <label className="text-[#dcd7e9] text-[13px] font-bold">
                  Release Year
                </label>

                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2025"
                  required
                  className="box-border w-full bg-[#0d0c14] border border-[#302b3e] rounded-[10px] text-white px-4 py-[14px] text-sm outline-none transition duration-300 focus:border-[#9565f5] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.13)] placeholder:text-[#666174]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-[10px] mb-[23px] min-w-0">
              <label className="text-[#dcd7e9] text-[13px] font-bold">
                Cover Image URL
              </label>

              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/game-image.jpg"
                required
                className="box-border w-full bg-[#0d0c14] border border-[#302b3e] rounded-[10px] text-white px-4 py-[14px] text-sm outline-none transition duration-300 focus:border-[#9565f5] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.13)] placeholder:text-[#666174]"
              />
            </div>

            <div className="flex flex-col gap-[10px] mb-[23px] min-w-0">
              <label className="text-[#dcd7e9] text-[13px] font-bold">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write something about this game..."
                rows="5"
                className="box-border w-full resize-y leading-[1.7] bg-[#0d0c14] border border-[#302b3e] rounded-[10px] text-white px-4 py-[14px] text-sm outline-none transition duration-300 focus:border-[#9565f5] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.13)] placeholder:text-[#666174]"
              />
            </div>

            {error && (
              <p role="alert" className="text-[#ef4444]">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[#2b2736] max-[550px]:flex-col-reverse">
              <Link
                to="/admin/games"
                className="inline-block text-center no-underline text-[#d5d0e5] border border-[#302a40] bg-[#15131e] px-[19px] py-3 rounded-[10px] font-semibold transition duration-300 hover:border-[#8b5cf6] hover:text-white hover:bg-[#211832] max-[550px]:w-full max-[550px]:box-border"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="border-0 rounded-[10px] px-[23px] py-[13px] text-white text-sm font-bold cursor-pointer bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] shadow-[0_5px_20px_rgba(124,58,237,0.25)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(124,58,237,0.4)] disabled:opacity-60 disabled:cursor-not-allowed max-[550px]:w-full max-[550px]:box-border"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes →"}
              </button>
            </div>
          </form>

          {/* Live Preview */}
          <aside className="min-w-0 box-border p-[30px] bg-[linear-gradient(145deg,#171521,#100f17)] border border-[#292438] rounded-[18px] shadow-[0_15px_45px_rgba(0,0,0,0.22)] sticky top-[30px] max-[850px]:static max-[550px]:p-[21px]">
            <div className="flex justify-between items-center gap-[10px] mb-[22px] text-[#a78bfa] text-[11px] font-extrabold tracking-[1.5px]">
              <span>02 / PREVIEW</span>

              <span className="flex items-center gap-[7px] text-[#79dca9] tracking-[0.5px]">
                <i className="w-[7px] h-[7px] rounded-full bg-[#4ade80] shadow-[0_0_10px_#4ade80]" />
                LIVE PREVIEW
              </span>
            </div>

            <div className="w-full aspect-[16/10] overflow-hidden rounded-xl bg-[#0b0a11] border border-[#302a40]">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="block w-full h-full object-cover"
                />
              ) : (
                <div className="h-full grid place-items-center text-[#625b73] text-sm tracking-[3px]">
                  GAME COVER
                </div>
              )}
            </div>

            <div className="pt-[22px]">
              <span className="inline-block bg-[#2a1d43] text-[#b99bff] px-[11px] py-[6px] rounded-md text-[11px] font-bold">
                {genre || "GAME GENRE"}
              </span>

              <h2 className="text-[27px] mt-[14px] mb-2 [overflow-wrap:anywhere]">
                {name || "Game Name"}
              </h2>

              <p className="text-[#a78bfa] text-[11px] tracking-[1.5px] font-bold">
                RELEASE YEAR · {year || "----"}
              </p>

              <p className="text-[#9691a2] leading-[1.8] text-sm mt-[17px] [overflow-wrap:anywhere]">
                {description || "Game description will appear here..."}
              </p>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}

export default AdminEditGame;
