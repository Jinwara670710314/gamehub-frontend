
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "../auth/AuthContext";
import Wishlist from "./Wishlist";
import GameDetail from "./GameDetail";

jest.mock("../components/RatingStars", () => {
  return function MockRatingStars() {
    return <span>Rating Stars</span>;
  };
});

jest.mock("../components/ReviewCard", () => {
  return function MockReviewCard() {
    return <div>Review Card</div>;
  };
});

const mockGame = {
  id: 1,
  name: "Elden Ring",
  genre: "Action RPG",
  year: 2022,
  image: "elden-ring.jpg",
  description: "An action role-playing game.",
};

function mockResponse(data, ok = true) {
  return {
    ok,
    text: async () => JSON.stringify(data),
  };
}

function setupMember() {
  localStorage.setItem("token", "test-token");
  localStorage.setItem("user", JSON.stringify({ id: 1 }));
}

function renderWithProviders(ui) {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
}

function renderGameDetail() {
  return renderWithProviders(
    <MemoryRouter initialEntries={["/games/1"]}>
      <Routes>
        <Route path="/games/:id" element={<GameDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

function mockGameDetailAPI() {
  global.fetch = jest.fn(async (url, options = {}) => {
    if (url.includes("/api/games/1/detail")) {
      return mockResponse({
        data: { game: mockGame },
      });
    }

    if (url.includes("/api/library")) {
      return mockResponse({ data: [] });
    }

    if (url.includes("/api/games/1/rating-summary")) {
      return mockResponse({
        data: {
          average_rating: 4,
          total_ratings: 1,
          total_reviews: 1,
        },
      });
    }

    if (
      url.includes("/api/games/1/reviews") &&
      options.method === "POST"
    ) {
      return mockResponse({
        message: "บันทึกรีวิวสำเร็จ",
      });
    }

    if (url.includes("/api/games/1/reviews")) {
      return mockResponse({ data: [] });
    }

    return mockResponse({ data: [] });
  });
}

describe("Member Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("should display only games in Wishlist", async () => {
    setupMember();

    global.fetch = jest.fn().mockResolvedValue(
      mockResponse({
        data: [
          {
            id: 1,
            game_id: 1,
            name: "Elden Ring",
            genre: "Action RPG",
            year: 2022,
            image: "elden-ring.jpg",
            status: "want_to_play",
          },
          {
            id: 2,
            game_id: 2,
            name: "Cyberpunk 2077",
            genre: "RPG",
            year: 2020,
            image: "cyberpunk.jpg",
            status: "completed",
          },
        ],
      })
    );

    renderWithProviders(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Elden Ring")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Cyberpunk 2077")
    ).not.toBeInTheDocument();
  });

  test("should remove a game from Wishlist", async () => {
    setupMember();

    global.fetch = jest.fn()
      .mockResolvedValueOnce(
        mockResponse({
          data: [
            {
              id: 1,
              game_id: 1,
              name: "Elden Ring",
              genre: "Action RPG",
              year: 2022,
              image: "elden-ring.jpg",
              status: "want_to_play",
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        mockResponse({ message: "ลบเกมสำเร็จ" })
      );

    renderWithProviders(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await screen.findByText("Elden Ring");

    await userEvent.click(
      screen.getByRole("button", {
        name: "♥ ลบออกจาก Wishlist",
      })
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Elden Ring")
      ).not.toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenLastCalledWith(
      "http://localhost:8080/api/library/1",
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });

  test("should add a game to Wishlist", async () => {
    setupMember();
    mockGameDetailAPI();

    renderGameDetail();

    await screen.findByText("Elden Ring");

    await userEvent.click(
      screen.getByRole("button", {
        name: "♡ เพิ่มใน Wishlist",
      })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/library",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            game_id: 1,
            status: "want_to_play",
          }),
        })
      );
    });

    expect(
      await screen.findByText("♥ อยู่ใน Wishlist แล้ว")
    ).toBeInTheDocument();
  });

  test("should validate rating before submitting a review", async () => {
    setupMember();
    mockGameDetailAPI();

    renderGameDetail();

    await screen.findByText("Elden Ring");

    const reviewInput = screen.getByPlaceholderText(
      "แบ่งปันความคิดเห็นเกี่ยวกับเกมนี้..."
    );

    await userEvent.type(
      reviewInput,
      "เกมสนุกมาก"
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "ส่งรีวิว",
      })
    );

    expect(
      await screen.findByText("กรุณาเลือกคะแนน 1-5 ดาว")
    ).toBeInTheDocument();

    expect(
      global.fetch
    ).not.toHaveBeenCalledWith(
      expect.stringContaining("/api/games/1/reviews"),
      expect.objectContaining({
        method: "POST",
      })
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "ให้คะแนน 5 ดาว",
      })
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "ส่งรีวิว",
      })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/games/1/reviews",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            content: "เกมสนุกมาก",
            rating: 5,
          }),
        })
      );
    });

    expect(
      await screen.findByText("บันทึกรีวิวสำเร็จ")
    ).toBeInTheDocument();
  });
});
