
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname === path ||
      location.pathname.startsWith(`${path}/`);
  };

  const linkStyle = (path) =>
    `relative flex items-center h-[42px] px-3 text-[14px] font-semibold no-underline rounded-lg transition-all duration-200
    ${
      isActive(path)
        ? "text-white bg-[#8b5cf6]/15 shadow-[inset_0_0_0_1px_rgba(167,139,250,0.18)]"
        : "text-[#aab3c8] hover:text-white hover:bg-white/[0.06]"
    }`;

  const buttonStyle =
    "h-[40px] px-5 rounded-lg text-[14px] font-bold transition-all duration-200 cursor-pointer";

  return (
    <nav className="sticky top-0 z-50 w-full min-h-[76px] px-[7%] bg-[#0d1220]/95 backdrop-blur-xl border-b border-[#252d42] shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex justify-between items-center max-[600px]:py-4 max-[600px]:px-[5%] max-[600px]:flex-wrap max-[600px]:gap-4">

      {/* Brand */}
      <Link
        to="/"
        className="group relative flex items-center no-underline whitespace-nowrap"
      >
        <span className="absolute -inset-2 rounded-xl bg-[#8b5cf6]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <span className="relative text-[29px] font-black italic tracking-[-1.8px] transition-transform duration-200 group-hover:scale-[1.04]">
          <span className="text-white">GAME</span>
          <span className="bg-gradient-to-r from-[#c4b5fd] via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(139,92,246,0.35)]">
            HUB
          </span>
          <span className="text-[#8b5cf6] text-[11px] ml-[4px] not-italic align-top">
            ●
          </span>
        </span>
      </Link>

      {/* Navigation */}
      <div className="flex items-center gap-2 max-[600px]:w-full max-[600px]:gap-1 max-[600px]:flex-wrap">

        <Link to="/" className={linkStyle("/")}>
          Home
        </Link>

        <Link to="/games" className={linkStyle("/games")}>
          Games
        </Link>

        <Link to="/wishlist" className={linkStyle("/wishlist")}>
          <span className="mr-1 text-[15px]">♥</span>
          Wishlist
        </Link>

        {user && (
          <Link to="/profile" className={linkStyle("/profile")}>
            Profile
          </Link>
        )}

        {user?.role === "admin" && (
          <Link to="/admin" className={linkStyle("/admin")}>
            Admin
          </Link>
        )}

        <div className="w-px h-7 bg-[#30394e] mx-2 max-[600px]:hidden" />

        {!user ? (
          <>
            <Link
              to="/login"
              className={`${buttonStyle} flex items-center justify-center text-[#c4b5fd] border border-[#8b5cf6]/40 bg-[#8b5cf6]/[0.08] hover:bg-[#8b5cf6]/20 hover:border-[#a78bfa] no-underline`}
            >
              Login
            </Link>

            <Link
              to="/register"
              className={`${buttonStyle} flex items-center justify-center text-white bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#8b5cf6] hover:to-[#818cf8] hover:shadow-[0_0_18px_rgba(139,92,246,0.3)] hover:-translate-y-[1px] no-underline`}
            >
              Register
            </Link>
          </>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className={`${buttonStyle} text-[#aab3c8] border border-[#30394e] bg-[#171e2e] hover:text-white hover:border-[#8b5cf6]/60 hover:bg-[#8b5cf6]/10`}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
