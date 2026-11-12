
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Games from "./Games";
import { getGames } from "../api/gameApi";

jest.mock("../api/gameApi", () => ({
  getGames: jest.fn(),
}));

jest.mock("../components/GameCard", () => {
  return function MockGameCard({ game }) {
    return <div>{game.name}</div>;
  };
});

describe("Games Page Tests", () => {
  const mockGames = [
    { id: 1, name: "Elden Ring", genre: "RPG" },
    { id: 2, name: "Cyberpunk 2077", genre: "RPG" },
    { id: 3, name: "FIFA 23", genre: "Sports" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    getGames.mockResolvedValue(mockGames);
  });

  test("should search games by name", async () => {
    render(<Games />);

    await waitFor(() => {
      expect(screen.getByText("Elden Ring")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("ค้นหาชื่อเกม...");

    fireEvent.change(searchInput, {
      target: { value: "Elden" },
    });

    expect(screen.getByText("Elden Ring")).toBeInTheDocument();
    expect(screen.queryByText("Cyberpunk 2077")).not.toBeInTheDocument();
    expect(screen.queryByText("FIFA 23")).not.toBeInTheDocument();
  });

  test("should filter games by genre", async () => {
    render(<Games />);

    await waitFor(() => {
      expect(screen.getByText("Elden Ring")).toBeInTheDocument();
    });

    const genreSelect = screen.getByRole("combobox");

    fireEvent.change(genreSelect, {
      target: { value: "RPG" },
    });

    expect(screen.getByText("Elden Ring")).toBeInTheDocument();
    expect(screen.getByText("Cyberpunk 2077")).toBeInTheDocument();
    expect(screen.queryByText("FIFA 23")).not.toBeInTheDocument();
  });
});
