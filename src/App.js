
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Wishlist from "./pages/Wishlist";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

import Admin from "./pages/admin/Admin";
import AdminGames from "./pages/admin/AdminGames";
import AdminAddGame from "./pages/admin/AdminAddGame";
import AdminEditGame from "./pages/admin/AdminEditGame";
import AdminMembers from "./pages/admin/AdminMembers";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireRole from "./components/RequireRole";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:id" element={<GameDetail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Member Pages */}
        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin Pages */}
        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <Admin />
            </RequireRole>
          }
        />

        <Route
          path="/admin/games"
          element={
            <RequireRole role="admin">
              <AdminGames />
            </RequireRole>
          }
        />

        <Route
          path="/admin/games/new"
          element={
            <RequireRole role="admin">
              <AdminAddGame />
            </RequireRole>
          }
        />

        <Route
          path="/admin/games/edit/:id"
          element={
            <RequireRole role="admin">
              <AdminEditGame />
            </RequireRole>
          }
        />

        <Route
          path="/admin/members"
          element={
            <RequireRole role="admin">
              <AdminMembers />
            </RequireRole>
          }
        />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
