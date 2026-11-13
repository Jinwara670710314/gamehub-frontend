
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

// อ่านผลลัพธ์จาก Backend
async function readResponse(response) {
  const responseText = await response.text();

  let result;

  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    result = { message: responseText };
  }

  if (!response.ok) {
    throw new Error(
      result.message || "เกิดข้อผิดพลาด กรุณาลองใหม่"
    );
  }

  return result;
}

function Profile() {
  const { token, updateUser } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // โหลดข้อมูลสมาชิก
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          throw new Error("กรุณาเข้าสู่ระบบก่อน");
        }

        const response = await fetch(`${API_BASE_URL}/api/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await readResponse(response);

        setUser(result);
        setUsername(result.username || "");
        setEmail(result.email || "");
      } catch (err) {
        console.error("Load profile error:", err);
        setError(err.message || "ไม่สามารถโหลดข้อมูลสมาชิกได้");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token]);

  // แก้ไขข้อมูลโปรไฟล์
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setSavingProfile(true);

      const response = await fetch(`${API_BASE_URL}/api/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
        }),
      });

      const result = await readResponse(response);

      setUser(result);

      // อัปเดตข้อมูลผู้ใช้ใน AuthContext
      updateUser({
        id: result.id,
        username: result.username,
        email: result.email,
        role: result.role,
      });

      setUsername(result.username);
      setEmail(result.email);

      setEditingProfile(false);
      setSuccess("แก้ไขข้อมูลโปรไฟล์สำเร็จ");
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.message || "ไม่สามารถแก้ไขข้อมูลได้");
    } finally {
      setSavingProfile(false);
    }
  };

  // เปลี่ยนรหัสผ่าน
  const handleChangePassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (oldPassword === newPassword) {
      setError("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม");
      return;
    }

    try {
      setSavingPassword(true);

      const response = await fetch(
        `${API_BASE_URL}/api/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
          }),
        }
      );

      const result = await readResponse(response);

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setChangingPassword(false);
      setSuccess(result.message || "เปลี่ยนรหัสผ่านสำเร็จ");
    } catch (err) {
      console.error("Change password error:", err);
      setError(err.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
    } finally {
      setSavingPassword(false);
    }
  };

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

  if (error && !user) {
    return (
      <main className="min-h-screen px-[7%] py-[65px] max-[600px]:px-[5%]">
        <div className="max-w-[850px] mx-auto text-center">
          <h2 className="text-xl text-white mb-5">
            {error}
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
            จัดการบัญชีผู้ใช้และคลังเกมของคุณ
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-4 rounded-lg border border-green-500/40 bg-green-500/10 text-green-400 text-sm">
            {success}
          </div>
        )}

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

          <div className="flex justify-between items-center flex-wrap gap-3 mb-5">
            <h3 className="text-white text-lg font-semibold">
              Account Information
            </h3>

            {!editingProfile && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setEditingProfile(true);
                }}
                className="px-4 py-2 rounded-lg border border-[#8b5cf6] text-[#c4b5fd] hover:bg-[#8b5cf6]/10 transition-colors"
              >
                แก้ไขข้อมูล
              </button>
            )}
          </div>

          {editingProfile ? (
            <form
              onSubmit={handleUpdateProfile}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-[#9ca7bd] text-sm mb-2">
                  Username
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full h-[46px] px-[14px] bg-[#0b0e17] border border-[#30394f] rounded-lg text-white outline-none focus:border-[#8b5cf6]"
                />
              </div>

              <div>
                <label className="block text-[#9ca7bd] text-sm mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-[46px] px-[14px] bg-[#0b0e17] border border-[#30394f] rounded-lg text-white outline-none focus:border-[#8b5cf6]"
                />
              </div>

              <div className="flex flex-wrap gap-3 mt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-3 rounded-lg bg-[#8b5cf6] text-white font-semibold hover:bg-[#7c3aed] disabled:opacity-50"
                >
                  {savingProfile ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUsername(user.username || "");
                    setEmail(user.email || "");
                    setEditingProfile(false);
                    setError("");
                  }}
                  className="px-5 py-3 rounded-lg border border-[#46516b] text-[#d5dbea] hover:bg-[#252d40]"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          ) : (
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
          )}

          <div className="border-t border-[#2b3449] my-7"></div>

          <div className="flex justify-between items-center flex-wrap gap-3 mb-5">
            <h3 className="text-white text-lg font-semibold">
              Change Password
            </h3>

            {!changingPassword && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setChangingPassword(true);
                }}
                className="px-4 py-2 rounded-lg border border-[#8b5cf6] text-[#c4b5fd] hover:bg-[#8b5cf6]/10 transition-colors"
              >
                เปลี่ยนรหัสผ่าน
              </button>
            )}
          </div>

          {changingPassword && (
            <form
              onSubmit={handleChangePassword}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-[#9ca7bd] text-sm mb-2">
                  รหัสผ่านเดิม
                </label>

                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full h-[46px] px-[14px] bg-[#0b0e17] border border-[#30394f] rounded-lg text-white outline-none focus:border-[#8b5cf6]"
                />
              </div>

              <div>
                <label className="block text-[#9ca7bd] text-sm mb-2">
                  รหัสผ่านใหม่
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                  className="w-full h-[46px] px-[14px] bg-[#0b0e17] border border-[#30394f] rounded-lg text-white outline-none focus:border-[#8b5cf6]"
                />
              </div>

              <div>
                <label className="block text-[#9ca7bd] text-sm mb-2">
                  ยืนยันรหัสผ่านใหม่
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                  className="w-full h-[46px] px-[14px] bg-[#0b0e17] border border-[#30394f] rounded-lg text-white outline-none focus:border-[#8b5cf6]"
                />
              </div>

              <div className="flex flex-wrap gap-3 mt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-3 rounded-lg bg-[#8b5cf6] text-white font-semibold hover:bg-[#7c3aed] disabled:opacity-50"
                >
                  {savingPassword ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setChangingPassword(false);
                    setError("");
                  }}
                  className="px-5 py-3 rounded-lg border border-[#46516b] text-[#d5dbea] hover:bg-[#252d40]"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          )}

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
