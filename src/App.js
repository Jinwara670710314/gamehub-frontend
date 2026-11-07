
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/games" element={<AdminGames />} />
        <Route path="/admin/games/new" element={<AdminAddGame />} />
        <Route path="/admin/games/edit/:id" element={<AdminEditGame />} />
        <Route path="/admin/members" element={<AdminMembers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
