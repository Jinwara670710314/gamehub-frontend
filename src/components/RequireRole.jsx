
import { Link, Navigate, useLocation } from "react-router-dom";

// ตรวจสอบสิทธิ์ตามบทบาทของผู้ใช้
function RequireRole({ role, children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();

  // ยังไม่ได้เข้าสู่ระบบ
  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // เข้าสู่ระบบแล้ว แต่ไม่มีสิทธิ์ตามที่กำหนด
  if (user.role !== role) {
    return (
      <div className="px-4 py-24 text-center">
        <p className="text-5xl font-semibold text-slate-300">
          403
        </p>

        <p className="mt-2 text-slate-500">
          หน้านี้สำหรับ {role === "admin" ? "Admin" : role} เท่านั้น
          บัญชีของคุณเป็น {user.role || "Member"}
        </p>

        <p className="mt-1 text-sm text-slate-400">
          ถ้าเพิ่งได้รับสิทธิ์ ให้ออกจากระบบแล้วเข้าใหม่
          เพราะข้อมูลบทบาทใน Token หรือบัญชีที่บันทึกไว้อาจยังเป็นข้อมูลเก่า
        </p>

        <Link
          to="/"
          className="mt-4 inline-block text-sm text-emerald-600 hover:underline"
        >
          กลับหน้าแรก
        </Link>
      </div>
    );
  }

  // มีสิทธิ์เข้าใช้งาน
  return children;
}

export default RequireRole;
