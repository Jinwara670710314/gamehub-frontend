
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

// ดึงรายการเกมทั้งหมดจาก Backend
export async function getGames() {
  const response = await fetch(`${API_BASE_URL}/api/games`);

  if (!response.ok) {
    throw new Error("ไม่สามารถโหลดข้อมูลเกมได้");
  }

  const result = await response.json();

  return result.data || [];
}
