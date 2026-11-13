
import { useEffect, useState } from "react";
import { getGames } from "../api/gameApi";
import GameCard from "../components/GameCard";

function Games() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("ทั้งหมด");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGames() {
      try {
        const data = await getGames(100);
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

  // สร้างตัวเลือกประเภทเกมจากข้อมูลจริงใน Backend
  const genres = [
    "ทั้งหมด",
    ...new Set(
      games
        .map((game) => game.genre)
        .filter(Boolean)
    ),
  ];

  // ค้นหาและกรองประเภทเกม
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
    <main className="max-w-[1500px] mx-auto py-[65px] px-[7%] max-[1000px]:py-[55px] max-[1000px]:px-[6%] max-[600px]:py-[45px] max-[600px]:px-[5%]">
      {/* Page Heading */}
      <div className="flex justify-between items-end gap-5 mb-[25px] max-[600px]:flex-col max-[600px]:items-start">
        <div>
          <span className="text-[#a78bfa] text-[13px] font-bold tracking-[3px]">
            EXPLORE COLLECTION
          </span>

          <h2 className="text-[30px] mt-3">
            All Games
          </h2>
        </div>

        <p className="text-[#9ca7bd] text-[15px]">
          ค้นหาเกมที่คุณชื่นชอบ
        </p>
      </div>

      {/* Search and Genre Filter */}
      <div className="flex gap-4 mb-7 max-[600px]:flex-col">
        <input
          type="text"
          placeholder="ค้นหาชื่อเกม..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="flex-1 min-w-0 px-4 py-3 bg-[#171d2b] border border-[#2b3449] rounded-lg text-white outline-none focus:border-[#8b5cf6]"
        />

        <select
          value={selectedGenre}
          onChange={(event) => setSelectedGenre(event.target.value)}
          className="min-w-[180px] px-4 py-3 bg-[#171d2b] border border-[#2b3449] rounded-lg text-white outline-none focus:border-[#8b5cf6]"
        >
          {genres.map((genre) => (
            <option value={genre} key={genre}>
              {genre === "ทั้งหมด" ? "All Genres" : genre}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-[#aab3ca]">
          กำลังโหลดข้อมูลเกม...
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400">
          {error}
        </p>
      )}

      {/* Games List */}
      {!loading && !error && (
        <>
          <p className="text-[#aab3ca] text-sm mb-5">
            พบเกมทั้งหมด {filteredGames.length} เกม
          </p>

          <div className="grid grid-cols-4 gap-[22px] max-[1000px]:grid-cols-2 max-[600px]:grid-cols-1">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
              />
            ))}
          </div>

          {filteredGames.length === 0 && (
            <p className="text-[#aab3ca] text-center py-10">
              ไม่พบเกมที่ค้นหา ลองค้นหาด้วยคำอื่น
            </p>
          )}
        </>
      )}
    </main>
  );
}

export default Games;
