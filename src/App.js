
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Wishlist from "./pages/Wishlist";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

import Admin from "./pages/Admin";
import AdminGames from "./pages/AdminGames";
import AdminAddGame from "./pages/AdminAddGame";
import AdminEditGame from "./pages/AdminEditGame";
import AdminMembers from "./pages/AdminMembers";

import Navbar from "./components/Navbar";

import "./App.css";

// ตรวจสอบสิทธิ์ก่อนเข้าใช้งานหน้า Admin
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ยังไม่ได้เข้าสู่ระบบ
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // เข้าสู่ระบบแล้ว แต่ไม่ใช่ Admin
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // เป็น Admin สามารถเข้าใช้งานได้
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:id" element={<GameDetail />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin Pages */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/games"
          element={
            <AdminRoute>
              <AdminGames />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/games/new"
          element={
            <AdminRoute>
              <AdminAddGame />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/games/edit/:id"
          element={
            <AdminRoute>
              <AdminEditGame />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/members"
          element={
            <AdminRoute>
              <AdminMembers />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
