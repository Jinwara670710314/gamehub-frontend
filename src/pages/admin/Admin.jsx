
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

// อ่านข้อมูลจาก Backend
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

function Admin() {
  const [totalGames, setTotalGames] = useState(null);
  const [totalMembers, setTotalMembers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // โหลดจำนวนเกมและสมาชิกจาก Backend
  useEffect(() => {
    let isMounted = true;

    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
        }

        // เรียก API เกมและสมาชิกพร้อมกัน
        const [gamesResponse, membersResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/api/games?limit=100`),

            fetch(`${API_BASE_URL}/api/admin/members`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        const [gamesResult, membersResult] =
          await Promise.all([
            readResponse(gamesResponse),
            readResponse(membersResponse),
          ]);

        if (!Array.isArray(gamesResult.data)) {
          throw new Error("รูปแบบข้อมูลเกมไม่ถูกต้อง");
        }

        if (!Array.isArray(membersResult.data)) {
          throw new Error("รูปแบบข้อมูลสมาชิกไม่ถูกต้อง");
        }

        if (isMounted) {
          setTotalGames(
            gamesResult.total ?? gamesResult.data.length
          );

          setTotalMembers(
            membersResult.count ?? membersResult.data.length
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message || "ไม่สามารถโหลดข้อมูลสถิติได้"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStatistics();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#151b2e] text-white px-[8%] py-[60px] max-[650px]:px-[5%] max-[650px]:py-[40px]">
      <div className="max-w-[1150px] mx-auto">

        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-10 max-[650px]:items-start max-[650px]:gap-4">
          <div>
            <span className="text-[#8b9bbd] text-xs tracking-[3px] font-semibold">
              GAMEHUB MANAGEMENT
            </span>

            <h1 className="text-[38px] mt-3 mb-3 max-[650px]:text-[28px]">
              Admin Dashboard
              <span className="text-[#8b5cf6]">.</span>
            </h1>

            <p className="text-[#9da9c2]">
              ยินดีต้อนรับผู้ดูแลระบบ จัดการแพลตฟอร์ม GameHub ของคุณ
            </p>
          </div>

          <span className="bg-[#6579ff] text-white px-[18px] py-[9px] rounded-full text-xs font-bold whitespace-nowrap">
            ADMIN PANEL
          </span>
        </div>

        {/* Welcome Section */}
        <section className="flex items-center justify-between gap-[25px] px-10 py-[35px] mb-[30px] border border-[#392b58] rounded-[18px] bg-[linear-gradient(120deg,#211632,#15131f_70%)] overflow-hidden max-[768px]:p-[25px] max-[650px]:flex-wrap">
          <div>
            <span className="text-[#a78bfa] text-[11px] tracking-[2px] font-bold">
              CONTROL CENTER
            </span>

            <h2 className="text-white text-[27px] mt-3 mb-3 max-[768px]:text-[21px]">
              Manage your gaming world.
            </h2>

            <p className="text-[#aaa] text-sm">
              ดูแลระบบเกม สมาชิก และจัดการข้อมูลทั้งหมดได้จากที่นี่
            </p>
          </div>

          <div className="text-[75px] [filter:drop-shadow(0_0_20px_#8b5cf655)] max-[768px]:text-[48px]">
            🎮
          </div>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-2 gap-[22px] mb-[50px] max-[650px]:grid-cols-1">

          <div className="bg-[#202941] border border-[#35415c] rounded-2xl p-7 transition duration-200 hover:-translate-y-1 hover:border-[#6579ff]">
            <div className="text-[30px] mb-[15px]">🎮</div>

            <span className="text-[#9da9c2] text-sm">
              Total Games
            </span>

            <h2 className="text-4xl mt-[10px] mb-[10px]">
              {loading ? "..." : totalGames ?? "-"}
            </h2>

            <p className="text-[#7786a5] text-[13px]">
              จำนวนเกมทั้งหมดในระบบ
            </p>
          </div>

          <div className="bg-[#202941] border border-[#35415c] rounded-2xl p-7 transition duration-200 hover:-translate-y-1 hover:border-[#6579ff]">
            <div className="text-[30px] mb-[15px]">👥</div>

            <span className="text-[#9da9c2] text-sm">
              Total Members
            </span>

            <h2 className="text-4xl mt-[10px] mb-[10px]">
              {loading ? "..." : totalMembers ?? "-"}
            </h2>

            <p className="text-[#7786a5] text-[13px]">
              จำนวนสมาชิกที่ลงทะเบียน
            </p>
          </div>

        </section>

        {error && (
          <p
            role="alert"
            className="text-[#ef4444] my-3"
          >
            {error}
          </p>
        )}

        {/* Management */}
        <section>
          <div className="mb-[22px]">
            <div>
              <span className="text-[#a78bfa] text-[11px] tracking-[2px] font-bold">
                ADMIN TOOLS
              </span>

              <h2 className="text-white text-[25px] mt-2 mb-2">
                Management
              </h2>

              <p className="text-[#999] text-sm">
                เลือกส่วนที่คุณต้องการจัดการ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[22px] max-[650px]:grid-cols-1">

            <Link
              to="/admin/games"
              className="block bg-[#202941] border border-[#35415c] rounded-2xl p-7 no-underline text-white transition-[transform,border-color,background] duration-[250ms] hover:-translate-y-1.5 hover:border-[#8b5cf6] hover:bg-[#201a30]"
            >
              <div className="text-[35px] mb-[18px]">🎮</div>

              <h3 className="mb-[10px]">
                Manage Games
              </h3>

              <p className="text-[#9da9c2] text-sm mb-[22px]">
                เพิ่ม แก้ไข ลบ และจัดระเบียบข้อมูลเกม
              </p>

              <span className="text-[#8da4ff] text-sm font-semibold">
                Manage Games →
              </span>
            </Link>

            <Link
              to="/admin/members"
              className="block bg-[#202941] border border-[#35415c] rounded-2xl p-7 no-underline text-white transition-[transform,border-color,background] duration-[250ms] hover:-translate-y-1.5 hover:border-[#8b5cf6] hover:bg-[#201a30]"
            >
              <div className="text-[35px] mb-[18px]">👥</div>

              <h3 className="mb-[10px]">
                Manage Members
              </h3>

              <p className="text-[#9da9c2] text-sm mb-[22px]">
                ดูข้อมูลสมาชิกและจัดการสถานะบัญชี
              </p>

              <span className="text-[#8da4ff] text-sm font-semibold">
                Manage Members →
              </span>
            </Link>

          </div>
        </section>

      </div>
    </main>
  );
}

export default Admin;
