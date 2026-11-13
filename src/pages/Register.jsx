
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
            CREATE YOUR ACCOUNT
          </span>

          <h1 className="text-white text-[32px] font-bold mb-[10px]">
            Join GameHub
          </h1>

          <p className="text-[#aab3ca] text-[14px] leading-[1.7] mb-7">
            สมัครสมาชิกเพื่อค้นพบเกมใหม่ ๆ และออกผจญภัยไปกับ GameHub
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <label className="text-[#e2e8f0] text-[13px] mb-2">
              Username
            </label>

            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-[46px] px-[14px] mb-[17px] bg-[#171d2b] border border-[#30394f] rounded-lg text-white text-[14px] outline-none focus:border-[#8b5cf6]"
            />

            <label className="text-[#e2e8f0] text-[13px] mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-[46px] px-[14px] mb-[17px] bg-[#171d2b] border border-[#30394f] rounded-lg text-white text-[14px] outline-none focus:border-[#8b5cf6]"
            />

            <label className="text-[#e2e8f0] text-[13px] mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
              className="h-[46px] px-[14px] mb-[17px] bg-[#171d2b] border border-[#30394f] rounded-lg text-white text-[14px] outline-none focus:border-[#8b5cf6]"
            />

            <label className="text-[#e2e8f0] text-[13px] mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
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
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-[#aab3ca] text-center text-[13px] mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#a78bfa] no-underline font-semibold"
            >
              Sign in
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
            ENTER THE
            <br />
            WORLD OF GAMING.
          </h2>

          <p className="text-[#d1d5db] text-[14px] leading-[1.8] max-w-[400px]">
            ค้นพบโลกใหม่ ๆ ค้นหาเกมโปรด และสร้างคลังเกมในแบบของคุณ
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;
