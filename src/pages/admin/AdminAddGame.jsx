
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

function AdminAddGame() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // เพิ่มเกมใหม่ลงฐานข้อมูล
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/games`,
        {
          method: "POST",
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
          }),
        }
      );

      await readResponse(response);

      setNotification("Game added successfully!");

      setTimeout(() => {
        navigate("/admin/games");
      }, 1500);

    } catch (err) {
      setError(err.message || "ไม่สามารถเพิ่มเกมได้");
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen box-border px-[5%] py-[55px] text-white bg-[radial-gradient(circle_at_80%_10%,#34245c55,transparent_35%),#0b1020] max-[550px]:py-[35px]">
      <div className="max-w-[1250px] mx-auto">

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
        <div className="flex items-center justify-between gap-5 mb-[35px] max-[550px]:items-start max-[550px]:flex-col">
          <div>
            <span className="text-[#a78bfa] text-xs font-bold tracking-[2px]">
              GAMEHUB MANAGEMENT
            </span>

            <h1 className="my-[10px] text-[38px] font-extrabold max-[550px]:text-[29px]">
              Add New Game
            </h1>

            <p className="text-[#9ca3af] m-0">
              เพิ่มเกมใหม่เข้าสู่คลังเกมของ GameHub
            </p>
          </div>

          <Link
            to="/admin/games"
            className="px-5 py-3 text-[#d5dbea] no-underline bg-[#1c2438] border border-[#34415c] rounded-[10px] transition duration-300 hover:bg-[#303b55] hover:text-white hover:-translate-y-0.5"
          >
            ← Back to Games
          </Link>
        </div>

        {/* Form and Preview */}
        <div className="grid grid-cols-[1.3fr_0.9fr] gap-[25px] items-start max-[850px]:grid-cols-1">

          {/* Add Game Form */}
          <form
            className="min-w-0 p-[30px] bg-gradient-to-br from-[#192239] to-[#121a2d] border border-[#303b55] rounded-[18px] shadow-[0_15px_40px_#00000030] max-[550px]:p-5"
            onSubmit={handleSubmit}
          >
            <div className="mb-[25px]">
              <h2 className="text-[21px] mb-2">
                Game Information
              </h2>

              <p className="text-[#9ca3af] text-[13px] m-0">
                กรอกข้อมูลเกมที่ต้องการเพิ่ม
              </p>
            </div>

            <div className="flex flex-col gap-[10px] mb-[22px] min-w-0">
              <label className="text-[#dbe2f0] text-sm font-semibold">
                Game Name
              </label>

              <input
                type="text"
                placeholder="เช่น Elden Ring"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="box-border w-full px-4 py-[14px] text-white bg-[#0d1425] border border-[#35415b] rounded-[10px] outline-none text-sm transition duration-200 focus:border-[#9875ff] focus:shadow-[0_0_0_3px_#8057ff22] placeholder:text-[#68748b]"
              />
            </div>

            <div className="grid grid-cols-2 gap-[15px] max-[550px]:grid-cols-1 max-[550px]:gap-0">
              <div className="flex flex-col gap-[10px] mb-[22px] min-w-0">
                <label className="text-[#dbe2f0] text-sm font-semibold">
                  Genre
                </label>

                <input
                  type="text"
                  placeholder="เช่น Action RPG"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  required
                  className="box-border w-full px-4 py-[14px] text-white bg-[#0d1425] border border-[#35415b] rounded-[10px] outline-none text-sm transition duration-200 focus:border-[#9875ff] focus:shadow-[0_0_0_3px_#8057ff22] placeholder:text-[#68748b]"
                />
              </div>

              <div className="flex flex-col gap-[10px] mb-[22px] min-w-0">
                <label className="text-[#dbe2f0] text-sm font-semibold">
                  Release Year
                </label>

                <input
                  type="number"
                  placeholder="2025"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  className="box-border w-full px-4 py-[14px] text-white bg-[#0d1425] border border-[#35415b] rounded-[10px] outline-none text-sm transition duration-200 focus:border-[#9875ff] focus:shadow-[0_0_0_3px_#8057ff22] placeholder:text-[#68748b]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-[10px] mb-[22px] min-w-0">
              <label className="text-[#dbe2f0] text-sm font-semibold">
                Cover Image URL
              </label>

              <input
                type="url"
                placeholder="https://example.com/game-image.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
                className="box-border w-full px-4 py-[14px] text-white bg-[#0d1425] border border-[#35415b] rounded-[10px] outline-none text-sm transition duration-200 focus:border-[#9875ff] focus:shadow-[0_0_0_3px_#8057ff22] placeholder:text-[#68748b]"
              />
            </div>

            <div className="flex flex-col gap-[10px] mb-[22px] min-w-0">
              <label className="text-[#dbe2f0] text-sm font-semibold">
                Description
              </label>

              <textarea
                placeholder="เขียนรายละเอียดเกี่ยวกับเกม..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="box-border w-full min-h-[125px] resize-y px-4 py-[14px] text-white bg-[#0d1425] border border-[#35415b] rounded-[10px] outline-none text-sm transition duration-200 focus:border-[#9875ff] focus:shadow-[0_0_0_3px_#8057ff22] placeholder:text-[#68748b]"
              />
            </div>

            {error && (
              <p role="alert" className="text-[#ef4444]">
                {error}
              </p>
            )}

            <div className="flex gap-3 mt-[30px]">
              <button
                type="submit"
                className="flex-1 p-[14px] text-white bg-gradient-to-br from-[#906bff] to-[#6840e8] border-0 rounded-[10px] text-[15px] font-bold cursor-pointer transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_#8057ff55] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? "Adding..." : "+ Add Game"}
              </button>

              <Link
                to="/admin/games"
                className="flex items-center justify-center px-[22px] text-[#d5dbea] bg-[#29334a] border border-[#3a4660] rounded-[10px] no-underline transition duration-300 hover:bg-[#3a4660]"
              >
                Cancel
              </Link>
            </div>
          </form>

          {/* Game Preview */}
          <div className="min-w-0 p-[30px] bg-gradient-to-br from-[#192239] to-[#121a2d] border border-[#303b55] rounded-[18px] shadow-[0_15px_40px_#00000030] max-[550px]:p-5">
            <div className="mb-[25px]">
              <h2 className="text-[21px] mb-2">
                Game Preview
              </h2>

              <p className="text-[#9ca3af] text-[13px] m-0">
                ตัวอย่างหน้าตาของเกม
              </p>
            </div>

            <div className="overflow-hidden bg-[#0d1425] border border-[#35415b] rounded-[14px]">
              {image ? (
                <img
                  src={image}
                  alt="Game Preview"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="block w-full aspect-video object-cover"
                />
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-[#29204b] to-[#111a30] text-[#9ca3af]">
                  <span className="text-[45px]">🎮</span>
                  <p className="text-[13px]">
                    Game Cover Preview
                  </p>
                </div>
              )}

              <div className="p-5">
                <span className="inline-block px-[10px] py-[6px] text-[#c4b5fd] bg-[#8057ff22] rounded-md text-[11px] font-bold">
                  {genre || "GAME GENRE"}
                </span>

                <h3 className="text-[23px] mt-[14px] mb-2 [overflow-wrap:anywhere]">
                  {name || "Your Game Name"}
                </h3>

                <p className="text-[#9ca3af] text-[13px] leading-[1.7]">
                  {year || "Release Year"}
                </p>

                <p className="text-[#9ca3af] text-[13px] leading-[1.7] [overflow-wrap:anywhere]">
                  {description || "รายละเอียดเกมจะแสดงตรงนี้"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default AdminAddGame;
