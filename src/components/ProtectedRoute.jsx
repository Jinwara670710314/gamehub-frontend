
import { Navigate, useLocation } from "react-router-dom";

// ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้วหรือยัง
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();

  // ยังไม่ได้เข้าสู่ระบบ ให้ไปหน้า Login
  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // เข้าสู่ระบบแล้ว อนุญาตให้ผ่าน
  return children;
}

export default ProtectedRoute;
