
import { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน");
      return;
    }

    alert("สมัครสมาชิกเรียบร้อย (รอเชื่อมต่อ Backend)");
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
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit">Create Account</button>
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
