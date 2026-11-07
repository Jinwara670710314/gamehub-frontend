
import { Link } from "react-router-dom";

function Admin() {
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
            <h2>100</h2>
            <p>จำนวนเกมทั้งหมดในระบบ</p>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">👥</div>
            <span>Total Members</span>
            <h2>250</h2>
            <p>จำนวนสมาชิกที่ลงทะเบียน</p>
          </div>

        </section>

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
