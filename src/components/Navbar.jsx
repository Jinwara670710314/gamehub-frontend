
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

  const linkStyle =
    "text-[#b7bfd1] text-[15px] no-underline transition-colors duration-200 hover:text-[#a78bfa]";

  return (
    <nav className="w-full min-h-[76px] px-[7%] bg-[#111522] border-b border-[#252b3b] flex justify-between items-center max-[600px]:py-[18px] max-[600px]:px-[5%] max-[600px]:flex-wrap max-[600px]:gap-[18px]">
      <Link
        to="/"
        className="text-white text-[25px] font-extrabold no-underline whitespace-nowrap"
      >
        🎮 GameHub
      </Link>

      <div className="flex items-center gap-8 max-[600px]:w-full max-[600px]:gap-[18px] max-[600px]:flex-wrap">
        <Link to="/" className={linkStyle}>
          หน้าแรก
        </Link>

        <Link to="/games" className={linkStyle}>
          เกมทั้งหมด
        </Link>

        <Link to="/wishlist" className={linkStyle}>
          ♥ Wishlist
        </Link>

        {user && (
          <Link to="/profile" className={linkStyle}>
            Profile
          </Link>
        )}

        {user?.role === "admin" && (
          <Link to="/admin" className={linkStyle}>
            Admin
          </Link>
        )}

        {!user ? (
          <>
            <Link to="/login" className={linkStyle}>
              เข้าสู่ระบบ
            </Link>

            <Link to="/register" className={linkStyle}>
              สมัครสมาชิก
            </Link>
          </>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="bg-transparent border-0 text-[#b7bfd1] text-[15px] font-[inherit] cursor-pointer p-0 transition-colors duration-200 hover:text-[#a78bfa]"
          >
            ออกจากระบบ
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
