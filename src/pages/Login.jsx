
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

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

      // บันทึกข้อมูลเข้าสู่ระบบผ่าน AuthContext
      login(result.token, {
        id: result.id,
        username: result.username,
        email: result.email,
        role: result.role,
      });

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
    <main className="min-h-[calc(100vh-75px)] grid grid-cols-2 bg-[#0b0e17] max-[850px]:grid-cols-1">
      <section className="flex justify-center items-center py-[45px] px-[30px] max-[850px]:py-[40px] max-[850px]:px-[25px]">
        <div className="w-full max-w-[420px]">
          <Link
            to="/"
            className="inline-block text-white text-[23px] font-extrabold no-underline mb-[45px] max-[850px]:mb-[30px]"
          >
            GAMEHUB
          </Link>

          <span className="block text-[#a78bfa] text-[11px] font-bold tracking-[3px] mb-3">
            WELCOME BACK
          </span>

          <h1 className="text-white text-[32px] font-bold mb-[10px]">
            Sign In
          </h1>

          <p className="text-[#aab3ca] text-[14px] leading-[1.7] mb-7">
            Welcome back! Sign in to continue your gaming adventure.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <label className="text-[#e2e8f0] text-[13px] mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
              className="h-[46px] px-[14px] mb-[17px] bg-[#171d2b] border border-[#30394f] rounded-lg text-white text-[14px] outline-none focus:border-[#8b5cf6]"
            />

            <label className="text-[#e2e8f0] text-[13px] mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
              className="h-[46px] px-[14px] mb-[17px] bg-[#171d2b] border border-[#30394f] rounded-lg text-white text-[14px] outline-none focus:border-[#8b5cf6]"
            />

            {error && (
              <p className="text-[#ef4444] text-[13px] mt-2 mb-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-[#aab3ca] text-center text-[13px] mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#a78bfa] no-underline font-semibold"
            >
              Create account
            </Link>
          </p>
        </div>
      </section>

      <section className="relative min-h-[700px] overflow-hidden max-[850px]:min-h-[350px] max-[850px]:row-start-1">
        <video
          className="absolute inset-0 w-full h-full object-cover object-[center_5%]"
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

        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,8,18,0.95),rgba(5,8,18,0.15))]"></div>

        <div className="absolute bottom-[70px] left-[50px] right-[35px] text-white max-[850px]:left-[30px] max-[850px]:bottom-[30px]">
          <span className="text-[#c4b5fd] text-[11px] font-bold tracking-[3px]">
            YOUR NEXT ADVENTURE STARTS HERE
          </span>

          <h2 className="text-[clamp(30px,4vw,48px)] leading-[1.15] font-bold my-[18px]">
            WELCOME BACK
            <br />
            TO GAMEHUB.
          </h2>

          <p className="text-[#d1d5db] text-[14px] leading-[1.8] max-w-[400px]">
            Your favorite games are waiting.
            Continue your adventure with GameHub.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
