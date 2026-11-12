
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RequireRole from "./RequireRole";
import { AuthProvider } from "../auth/AuthContext";

function renderWithRouter(initialPath, component) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/profile" element={component} />
          <Route path="/admin" element={component} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("Protected Route Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("should redirect Guest to Login page", () => {
    renderWithRouter(
      "/profile",
      <ProtectedRoute>
        <div>Profile Page</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Profile Page")).not.toBeInTheDocument();
  });

  test("should deny Member access to Admin page", () => {
    localStorage.setItem("token", "member-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 1,
        username: "testmember",
        role: "member",
      })
    );

    renderWithRouter(
      "/admin",
      <RequireRole role="admin">
        <div>Admin Dashboard</div>
      </RequireRole>
    );

    expect(screen.getByText("403")).toBeInTheDocument();
    expect(
      screen.getByText(/หน้านี้สำหรับ Admin เท่านั้น/)
    ).toBeInTheDocument();
    expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();
  });

  test("should allow Admin to access Admin page", () => {
    localStorage.setItem("token", "admin-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 2,
        username: "testadmin",
        role: "admin",
      })
    );

    renderWithRouter(
      "/admin",
      <RequireRole role="admin">
        <div>Admin Dashboard</div>
      </RequireRole>
    );

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });
});
