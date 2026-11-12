
import { getGames } from "./gameApi";

describe("Game API Tests", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Test 1: ดึงข้อมูลเกมสำเร็จ
  test("should fetch games successfully", async () => {
    const mockGames = [
      {
        id: 1,
        name: "Elden Ring",
        genre: "RPG",
        year: 2022,
      },
      {
        id: 2,
        name: "Cyberpunk 2077",
        genre: "RPG",
        year: 2020,
      },
    ];

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockGames,
      }),
    });

    const result = await getGames();

    expect(result).toEqual(mockGames);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/games?limit=200")
    );
  });

  // Test 2: ไม่มีข้อมูลเกม
  test("should return an empty array when no games are found", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
      }),
    });

    const result = await getGames();

    expect(result).toEqual([]);
  });

  // Test 3: Backend ตอบกลับ Error
  test("should throw an error when backend response is not successful", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
    });

    await expect(getGames()).rejects.toThrow(
      "ไม่สามารถโหลดข้อมูลเกมได้"
    );
  });

  // Test 4: ไม่สามารถเชื่อมต่อ Backend
  test("should throw an error when network request fails", async () => {
    global.fetch.mockRejectedValue(
      new Error("Network Error")
    );

    await expect(getGames()).rejects.toThrow(
      "Network Error"
    );
  });
});
