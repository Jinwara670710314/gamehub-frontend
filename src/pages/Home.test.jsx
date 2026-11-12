
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";
import { getGames } from "../api/gameApi";

jest.mock("../api/gameApi");

jest.mock("../components/GameCard", () => {
  return function MockGameCard({ game }) {
    return <div>{game.name}</div>;
  };
});

describe("Home Page Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should display games when data is loaded successfully", async () => {
    getGames.mockResolvedValue([
      {
        id: 1,
        name: "Elden Ring",
      },
      {
        id: 2,
        name: "Cyberpunk 2077",
      },
    ]);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(await screen.findByText("Elden Ring")).toBeInTheDocument();
    expect(screen.getByText("Cyberpunk 2077")).toBeInTheDocument();
    expect(
      screen.queryByText("กำลังโหลดข้อมูลเกม...")
    ).not.toBeInTheDocument();
  });

  test("should display loading message while games are being fetched", () => {
    getGames.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText("กำลังโหลดข้อมูลเกม...")).toBeInTheDocument();
  });
});
