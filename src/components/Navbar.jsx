
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        🎮 GameHub
      </Link>

      <div className="nav-links">
        <Link to="/">หน้าแรก</Link>

        <Link to="/games">เกมทั้งหมด</Link>

        <Link to="/wishlist">♥ Wishlist</Link>

        <Link to="/profile">Profile</Link>

        <Link to="/admin">Admin</Link>

        <Link to="/login">เข้าสู่ระบบ</Link>

        <Link to="/register">สมัครสมาชิก</Link>
      </div>
    </nav>
  );
}

export default Navbar;
