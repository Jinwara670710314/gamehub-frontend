
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้วหรือยัง
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // ยังไม่ได้เข้าสู่ระบบ ให้ไปหน้า Login
  if (!isAuthenticated) {
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
