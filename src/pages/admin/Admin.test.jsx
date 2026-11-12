
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { AuthProvider } from "../../auth/AuthContext";
import AdminAddGame from "./AdminAddGame";
import AdminGames from "./AdminGames";

function mockResponse(data, ok = true) {
  return {
    ok,
    text: async () => JSON.stringify(data),
  };
}

function setupAdmin() {
  localStorage.setItem("token", "admin-test-token");
  localStorage.setItem(
    "user",
    JSON.stringify({ id: 1, role: "admin" })
  );
}

function renderWithProviders(ui) {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
}

describe("Admin Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("should add a new game successfully", async () => {
    setupAdmin();

    global.fetch = jest.fn().mockResolvedValue(
      mockResponse({
        message: "Game added successfully!",
      })
    );

    renderWithProviders(
      <MemoryRouter>
        <AdminAddGame />
      </MemoryRouter>
    );

    await userEvent.type(
      screen.getByPlaceholderText("เช่น Elden Ring"),
      "Black Myth: Wukong"
    );

    await userEvent.type(
      screen.getByPlaceholderText("เช่น Action RPG"),
      "Action RPG"
    );

    await userEvent.type(
      screen.getByPlaceholderText("2025"),
      "2024"
    );

    await userEvent.type(
      screen.getByPlaceholderText(
        "https://example.com/game-image.jpg"
      ),
      "https://example.com/wukong.jpg"
    );

    await userEvent.type(
      screen.getByPlaceholderText(
        "เขียนรายละเอียดเกี่ยวกับเกม..."
      ),
      "An action role-playing game."
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "+ Add Game",
      })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/games",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer admin-test-token",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            name: "Black Myth: Wukong",
            genre: "Action RPG",
            year: 2024,
            image: "https://example.com/wukong.jpg",
            description: "An action role-playing game.",
          }),
        })
      );
    });

    expect(
      await screen.findByText(/Game added successfully!/)
    ).toBeInTheDocument();
  });

  test("should soft delete a game after confirmation", async () => {
    setupAdmin();

    global.fetch = jest.fn()
      .mockResolvedValueOnce(
        mockResponse({
          data: [
            {
              id: 1,
              name: "Elden Ring",
              genre: "Action RPG",
              year: 2022,
              image: "elden-ring.jpg",
              description: "An action RPG.",
              isDeleted: false,
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        mockResponse({
          message: "ลบเกมสำเร็จ",
        })
      );

    renderWithProviders(
      <MemoryRouter>
        <AdminGames />
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Elden Ring")
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      })
    );

    expect(
      screen.getByText(
        "คุณต้องการลบเกม Elden Ring ใช่หรือไม่?"
      )
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", {
        name: "ยืนยันลบ",
      })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        "http://localhost:8080/api/games/1",
        expect.objectContaining({
          method: "DELETE",
          headers: {
            Authorization: "Bearer admin-test-token",
          },
        })
      );
    });

    await userEvent.click(
      screen.getByRole("button", {
        name: /Deleted/,
      })
    );

    expect(
      await screen.findByText("Elden Ring")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Deleted Games")
    ).toBeInTheDocument();
  });
});
