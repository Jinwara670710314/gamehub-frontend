
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { message: responseText };
      }

      if (!response.ok) {
        throw new Error(result.message || "สมัครสมาชิกไม่สำเร็จ");
      }

      navigate("/login");
    } catch (error) {
      console.error("Register error:", error);
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

          <span className="auth-label">CREATE YOUR ACCOUNT</span>
          <h1>Join GameHub</h1>

          <p className="auth-description">
            Create your account and start exploring your next adventure.
          </p>

          <form onSubmit={handleSubmit}>
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
            />

            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
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
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
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
            ENTER THE
            <br />
            WORLD OF GAMING.
          </h2>

          <p>
            Discover new worlds. Find your favorite games.
            Build your own collection.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;
