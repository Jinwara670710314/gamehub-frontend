
import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("กำลังรอเชื่อมต่อระบบ Login");
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
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Sign In</button>
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
