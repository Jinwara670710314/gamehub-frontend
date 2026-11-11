
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
    <main className="admin-page">
      <div className="admin-container">

        {/* Dashboard Header */}
        <div className="admin-heading">
          <div>
            <span>GAMEHUB MANAGEMENT</span>
            <h1>Admin Dashboard<span>.</span></h1>
            <p>ยินดีต้อนรับผู้ดูแลระบบ จัดการแพลตฟอร์ม GameHub ของคุณ</p>
          </div>

          <span className="admin-role">ADMIN PANEL</span>
        </div>

        {/* Welcome Section */}
        <section className="admin-welcome">
          <div>
            <span>CONTROL CENTER</span>
            <h2>Manage your gaming world.</h2>
            <p>
              ดูแลระบบเกม สมาชิก และจัดการข้อมูลทั้งหมดได้จากที่นี่
            </p>
          </div>

          <div className="admin-welcome-icon">🎮</div>
        </section>

        {/* Statistics */}
        <section className="admin-stats">

          <div className="admin-stat-card">
            <div className="admin-stat-icon">🎮</div>
            <span>Total Games</span>
            <h2>
              {loading ? "..." : totalGames ?? "-"}
            </h2>
            <p>จำนวนเกมทั้งหมดในระบบ</p>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">👥</div>
            <span>Total Members</span>
            <h2>
              {loading ? "..." : totalMembers ?? "-"}
            </h2>
            <p>จำนวนสมาชิกที่ลงทะเบียน</p>
          </div>

        </section>

        {error && (
          <p role="alert" style={{ color: "#ef4444", margin: "12px 0" }}>
            {error}
          </p>
        )}

        {/* Management */}
        <section className="admin-management">
          <div className="admin-section-heading">
            <div>
              <span>ADMIN TOOLS</span>
              <h2>Management</h2>
              <p>เลือกส่วนที่คุณต้องการจัดการ</p>
            </div>
          </div>

          <div className="admin-management-grid">

            <Link to="/admin/games" className="admin-menu-card">
              <div className="admin-menu-icon">🎮</div>
              <h3>Manage Games</h3>
              <p>
                เพิ่ม แก้ไข ลบ และจัดระเบียบข้อมูลเกม
              </p>
              <span>Manage Games →</span>
            </Link>

            <Link to="/admin/members" className="admin-menu-card">
              <div className="admin-menu-icon">👥</div>
              <h3>Manage Members</h3>
              <p>
                ดูข้อมูลสมาชิกและจัดการสถานะบัญชี
              </p>
              <span>Manage Members →</span>
            </Link>

          </div>
        </section>

      </div>
    </main>
  );
}

export default Admin;
