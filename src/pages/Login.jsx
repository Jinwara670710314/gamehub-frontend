
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const responseText = await response.text();

      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        result = {
          message: responseText,
        };
      }

      if (!response.ok) {
        throw new Error(
          result.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
        );
      }

      if (!result.token) {
        throw new Error("ไม่พบ Token จากระบบ กรุณาลองใหม่");
      }

      // บันทึก Token สำหรับเรียก API ที่ต้องเข้าสู่ระบบ
      localStorage.setItem("token", result.token);

      // บันทึกข้อมูลผู้ใช้
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: result.id,
          username: result.username,
          email: result.email,
          role: result.role,
        })
      );

      // เข้าสู่ระบบสำเร็จ กลับไปหน้าแรก
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-form-side">
        <div className="register-form-container">
          <Link to="/" className="register-logo">
            GAMEHUB
          </Link>

          <span className="auth-label">WELCOME BACK</span>

          <h1>Sign In</h1>

          <p className="auth-description">
            Welcome back! Sign in to continue your gaming adventure.
          </p>

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
            />

            {error && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "13px",
                  marginTop: "8px",
                  marginBottom: "8px",
                }}
              >
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register">Create account</Link>
          </p>
        </div>
      </section>

      <section className="register-image-side">
        <video
          className="register-background-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source
            src="https://cdn.artstation.com/p/video_sources/001/657/282/asset.mp4"
            type="video/mp4"
          />
        </video>

        <div className="register-image-overlay"></div>

        <div className="register-image-text">
          <span>YOUR NEXT ADVENTURE STARTS HERE</span>
          <h2>
            WELCOME BACK
            <br />
            TO GAMEHUB.
          </h2>
          <p>
            Your favorite games are waiting.
            Continue your adventure with GameHub.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
