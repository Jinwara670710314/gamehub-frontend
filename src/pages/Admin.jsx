
import { Link } from "react-router-dom";

function Admin() {
  return (
    <main className="admin-page">
      <div className="admin-container">

        <div className="admin-heading">
          <div>
            <span>GAMEHUB MANAGEMENT</span>
            <h1>Admin Dashboard</h1>
            <p>Manage your games and members.</p>
          </div>

          <span className="admin-role">ADMIN</span>
        </div>

        <section className="admin-stats">

          <div className="admin-stat-card">
            <div className="admin-stat-icon">🎮</div>
            <span>Total Games</span>
            <h2>100</h2>
            <p>Games in GameHub</p>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">👥</div>
            <span>Total Members</span>
            <h2>250</h2>
            <p>Registered members</p>
          </div>

        </section>

        <section className="admin-management">
          <h2>Management</h2>
          <p>Choose what you want to manage.</p>

          <div className="admin-management-grid">

            <Link to="/admin/games" className="admin-menu-card">
              <div className="admin-menu-icon">🎮</div>
              <h3>Manage Games</h3>
              <p>Add, edit and delete games.</p>
              <span>Manage Games →</span>
            </Link>

            <Link to="/admin/members" className="admin-menu-card">
              <div className="admin-menu-icon">👥</div>
              <h3>Manage Members</h3>
              <p>View and manage member accounts.</p>
              <span>Manage Members →</span>
            </Link>

          </div>
        </section>

      </div>
    </main>
  );
}

export default Admin;
