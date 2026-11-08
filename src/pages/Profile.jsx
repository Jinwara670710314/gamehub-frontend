
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
      <main className="profile-page">
        <div className="profile-container">
          <p>กำลังโหลดข้อมูลสมาชิก...</p>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <h2>{error || "ไม่พบข้อมูลสมาชิก"}</h2>
          <Link to="/login">เข้าสู่ระบบ</Link>
        </div>
      </main>
    );
  }

  const accountType =
    user.role === "admin" ? "Administrator" : "Member";

  return (
    <main className="profile-page">
      <div className="profile-container">

        <div className="profile-heading">
          <span>GAMEHUB ACCOUNT</span>
          <h1>My Profile</h1>
          <p>Manage your account and gaming collection.</p>
        </div>

        <section className="profile-card">

          <div className="profile-user">
            <div className="profile-avatar">
              <span>
                {user.username?.charAt(0).toUpperCase() || "G"}
              </span>
            </div>

            <div>
              <h2>{user.username}</h2>
              <p>GameHub {accountType}</p>
            </div>
          </div>

          <div className="profile-divider"></div>

          <h3>Account Information</h3>

          <div className="profile-info">
            <div>
              <span>Username</span>
              <p>{user.username}</p>
            </div>

            <div>
              <span>Email Address</span>
              <p>{user.email}</p>
            </div>

            <div>
              <span>Account Type</span>
              <p>{accountType}</p>
            </div>
          </div>

          <div className="profile-divider"></div>

          <div className="profile-actions">
            <Link to="/wishlist" className="profile-wishlist-btn">
              My Wishlist →
            </Link>

            <Link to="/games" className="profile-games-btn">
              Explore Games
            </Link>
          </div>

        </section>
      </div>
    </main>
  );
}

export default Profile;
