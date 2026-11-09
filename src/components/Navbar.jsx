
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  // ตรวจสอบสถานะ Login เมื่อเปลี่ยนหน้า
  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    } catch {
      setUser(null);
    }
  }, [location.pathname]);

  // ออกจากระบบ
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        🎮 GameHub
      </Link>

      <div className="nav-links">
        <Link to="/">หน้าแรก</Link>

        <Link to="/games">เกมทั้งหมด</Link>

        <Link to="/wishlist">♥ Wishlist</Link>

        {user && (
          <Link to="/profile">Profile</Link>
        )}

        {user?.role === "admin" && (
          <Link to="/admin">Admin</Link>
        )}

        {!user ? (
          <>
            <Link to="/login">เข้าสู่ระบบ</Link>

            <Link to="/register">สมัครสมาชิก</Link>
          </>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              font: "inherit",
              cursor: "pointer",
              padding: 0,
            }}
          >
            ออกจากระบบ
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
