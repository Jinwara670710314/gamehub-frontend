
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGames } from "../api/gameApi";
import GameCard from "../components/GameCard";

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex items-center min-h-[470px] px-[8%] py-20 overflow-hidden bg-[radial-gradient(circle_at_75%_50%,#38236b_0%,transparent_38%),linear-gradient(110deg,#151b2e,#0b0e17)] max-[1000px]:px-[6%] max-[1000px]:py-[70px] max-[600px]:min-h-[430px] max-[600px]:py-[55px]">
        {/* Hero Background Image */}
        <div
          className="absolute top-[10%] right-[5%] w-[48%] h-[80%] rounded-[18px] opacity-80 shadow-[0_15px_50px_#00000066] max-[600px]:right-[-15%] max-[600px]:w-[75%] max-[600px]:opacity-[0.25]"
          style={{
            backgroundImage: `
              linear-gradient(90deg, #151b2e 0%, transparent 45%),
              url("https://images.openai.com/static-rsc-4/ixkaO-WyKR4Rtg6UJmnL68JRLmpsDokrWYZsx-uAzgO28cR4RfHXR0NCAhgDIEf7uBGhRE5ZfCWJ-7_fnDaqLO8YNxA_SxN7WHZYCP6Jmwwj77ESUGorF0uS7GjK9JyJ8bhsESGUriUvwVqbavNRfAMn4MKifd7lO89H4WGFBc1WALb0wIy3yD6sNNAeq8wd?purpose=fullsize")
            `,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="relative z-[1] max-w-[600px]">
          <span className="text-[#a78bfa] text-[13px] font-bold tracking-[3px]">
            YOUR GAMING WORLD
          </span>

          <h1 className="text-[clamp(38px,5vw,64px)] leading-[1.15] my-[22px] font-black max-[600px]:text-[38px]">
            DISCOVER YOUR
            <br />
            NEXT <span className="text-[#a78bfa]">ADVENTURE.</span>
          </h1>

          <p className="text-[#b4bdd0] text-[17px] leading-[1.8] max-w-[470px]">
            ค้นพบเกมที่ใช่ สำรวจเกมใหม่ ๆ
            และเลือกเกมโปรดในแบบของคุณ
          </p>

          <Link
            to="/games"
            className="inline-flex items-center mt-7 px-[25px] py-[14px] bg-[#7c3aed] text-white rounded-lg text-[15px] font-bold transition-all duration-300 hover:bg-[#6d28d9] hover:-translate-y-0.5"
          >
            สำรวจเกมทั้งหมด →
          </Link>
        </div>
      </section>

      {/* Featured Games */}
      <section
        id="featured"
        className="max-w-[1500px] mx-auto py-[65px] px-[7%] max-[1000px]:py-[55px] max-[1000px]:px-[6%] max-[600px]:py-[45px] max-[600px]:px-[5%]"
      >
        <div className="flex justify-between items-end gap-5 mb-[25px] max-[600px]:flex-col max-[600px]:items-start">
          <div>
            <span className="text-[#a78bfa] text-[13px] font-bold tracking-[3px]">
              GAME COLLECTION
            </span>

            <h2 className="text-[30px] mt-3">
              Popular Games
            </h2>
          </div>

          <p className="text-[#9ca7bd] text-[15px]">
            ค้นพบเกมที่น่าสนใจ
          </p>
        </div>

        {loading && (
          <p className="text-[#aab3ca]">
            กำลังโหลดข้อมูลเกม...
          </p>
        )}

        {error && (
          <p className="text-red-400">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-4 gap-[22px] max-[1000px]:grid-cols-2 max-[600px]:grid-cols-1">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
              />
            ))}
          </div>
        )}

        {!loading && !error && games.length === 0 && (
          <p className="text-[#aab3ca]">
            ยังไม่มีข้อมูลเกม
          </p>
        )}
      </section>
    </div>
  );
}

export default Home;
