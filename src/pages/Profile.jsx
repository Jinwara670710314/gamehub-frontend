
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("กรุณาเข้าสู่ระบบก่อน");
        }

        const response = await fetch(`${API_BASE_URL}/api/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const responseText = await response.text();

        let result;

        try {
          result = JSON.parse(responseText);
        } catch {
          result = { message: responseText };
        }

        if (!response.ok) {
          throw new Error(
            result.message || "ไม่สามารถโหลดข้อมูลสมาชิกได้"
          );
        }

        setUser(result);
      } catch (err) {
        console.error("Load profile error:", err);
        setError(err.message || "ไม่สามารถเชื่อมต่อระบบได้");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen px-[7%] py-[65px] max-[600px]:px-[5%]">
        <div className="max-w-[850px] mx-auto">
          <p className="text-[#aab3ca] text-center">
            กำลังโหลดข้อมูลสมาชิก...
          </p>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen px-[7%] py-[65px] max-[600px]:px-[5%]">
        <div className="max-w-[850px] mx-auto text-center">
          <h2 className="text-xl text-white mb-5">
            {error || "ไม่พบข้อมูลสมาชิก"}
          </h2>

          <Link
            to="/login"
            className="inline-block px-6 py-3 rounded-lg bg-[#8b5cf6] text-white no-underline transition-colors hover:bg-[#7c3aed]"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </main>
    );
  }

  const accountType =
    user.role === "admin" ? "Administrator" : "Member";

  return (
    <main className="min-h-screen px-[7%] py-[65px] max-[600px]:px-[5%] max-[600px]:py-[45px]">
      <div className="max-w-[850px] mx-auto">

        <div className="mb-8">
          <span className="text-[#a78bfa] text-xs font-bold tracking-[3px]">
            GAMEHUB ACCOUNT
          </span>

          <h1 className="text-white text-[36px] font-bold mt-3 mb-2 max-[600px]:text-[30px]">
            My Profile
          </h1>

          <p className="text-[#9ca7bd] text-[15px]">
            Manage your account and gaming collection.
          </p>
        </div>

        <section className="bg-[#171d2b] border border-[#2b3449] rounded-2xl p-8 max-[600px]:p-5">

          <div className="flex items-center gap-5">
            <div className="w-[70px] h-[70px] shrink-0 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white text-[28px] font-bold">
              {user.username?.charAt(0).toUpperCase() || "G"}
            </div>

            <div className="min-w-0">
              <h2 className="text-white text-2xl font-bold break-words">
                {user.username}
              </h2>

              <p className="text-[#aab3ca] mt-1">
                GameHub {accountType}
              </p>
            </div>
          </div>

          <div className="border-t border-[#2b3449] my-7"></div>

          <h3 className="text-white text-lg font-semibold mb-5">
            Account Information
          </h3>

          <div className="grid grid-cols-2 gap-6 max-[600px]:grid-cols-1">
            <div>
              <span className="text-[#9ca7bd] text-sm">
                Username
              </span>

              <p className="text-white mt-2 break-words">
                {user.username}
              </p>
            </div>

            <div>
              <span className="text-[#9ca7bd] text-sm">
                Email Address
              </span>

              <p className="text-white mt-2 break-words">
                {user.email}
              </p>
            </div>

            <div>
              <span className="text-[#9ca7bd] text-sm">
                Account Type
              </span>

              <p className="text-white mt-2">
                {accountType}
              </p>
            </div>
          </div>

          <div className="border-t border-[#2b3449] my-7"></div>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/wishlist"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#8b5cf6] border border-[#8b5cf6] text-white no-underline font-semibold transition-colors hover:bg-[#7c3aed] hover:border-[#7c3aed]"
            >
              My Wishlist →
            </Link>

            <Link
              to="/games"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-transparent border border-[#46516b] text-[#d5dbea] no-underline font-semibold transition-colors hover:bg-[#252d40] hover:border-[#8b5cf6]"
            >
              Explore Games
            </Link>
          </div>

        </section>
      </div>
    </main>
  );
}

export default Profile;
