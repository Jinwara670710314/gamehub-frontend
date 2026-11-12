
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";

import { AuthProvider } from "../auth/AuthContext";
import Login from "./Login";
import Register from "./Register";

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
}

function renderWithRouter(component) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/"]}>
        {component}
        <LocationDisplay />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("Authentication Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test("should login successfully", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          token: "test-token",
          id: 1,
          username: "testuser",
          email: "test@example.com",
          role: "member",
        }),
    });

    renderWithRouter(<Login />);

    await userEvent.type(
      screen.getByPlaceholderText("Enter your email"),
      "test@example.com"
    );

    await userEvent.type(
      screen.getByPlaceholderText("Enter your password"),
      "password123"
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Sign In" })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/login"),
        expect.objectContaining({
          method: "POST",
        })
      );

      expect(localStorage.getItem("token")).toBe("test-token");
      expect(JSON.parse(localStorage.getItem("user")).username).toBe(
        "testuser"
      );
      expect(screen.getByTestId("current-location")).toHaveTextContent("/");
    });
  });

  test("should show error when login fails", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      text: async () =>
        JSON.stringify({
          message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        }),
    });

    renderWithRouter(<Login />);

    await userEvent.type(
      screen.getByPlaceholderText("Enter your email"),
      "wrong@example.com"
    );

    await userEvent.type(
      screen.getByPlaceholderText("Enter your password"),
      "wrongpassword"
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Sign In" })
    );

    expect(
      await screen.findByText("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
    ).toBeInTheDocument();

    expect(localStorage.getItem("token")).toBeNull();
  });

  test("should register successfully", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          message: "สมัครสมาชิกสำเร็จ",
        }),
    });

    renderWithRouter(<Register />);

    await userEvent.type(
      screen.getByPlaceholderText("Enter your username"),
      "newmember"
    );

    await userEvent.type(
      screen.getByPlaceholderText("Enter your email"),
      "newmember@example.com"
    );

    await userEvent.type(
      screen.getByPlaceholderText("Create a password"),
      "password123"
    );

    await userEvent.type(
      screen.getByPlaceholderText("Confirm your password"),
      "password123"
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/register"),
        expect.objectContaining({
          method: "POST",
        })
      );

      expect(screen.getByTestId("current-location")).toHaveTextContent(
        "/login"
      );
    });
  });
});
