
const BASE_URL = "http://localhost:4000";

let adminToken = "";
let memberToken = "";
let passed = 0;
let failed = 0;

async function request(method, path, body, token) {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();

  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { status: response.status, data };
}

function findToken(data) {
  if (!data || typeof data !== "object") return null;

  if (typeof data.token === "string") return data.token;

  for (const value of Object.values(data)) {
    const found = findToken(value);
    if (found) return found;
  }

  return null;
}

async function test(name, method, path, options = {}) {
  try {
    const result = await request(
      method,
      path,
      options.body,
      options.token
    );

    const expected = Array.isArray(options.expected)
      ? options.expected
      : [options.expected ?? 200];

    const ok = expected.includes(result.status);

    if (ok) {
      passed++;
      console.log(`✅ PASS ${name} (${result.status})`);
    } else {
      failed++;
      console.log(
        `❌ FAIL ${name} | Expected ${expected.join("/")} | Got ${result.status}`
      );
      console.log(result.data);
    }

    if (options.saveToken && ok) {
      const token = findToken(result.data);

      if (token) {
        if (options.saveToken === "admin") adminToken = token;
        if (options.saveToken === "member") memberToken = token;
      } else {
        failed++;
        console.log(`❌ FAIL ${name}: ไม่พบ token ในผลลัพธ์`);
      }
    }

    return result;
  } catch (error) {
    failed++;
    console.log(`❌ FAIL ${name}: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log("\n🎮 GAMEHUB MOCK API TEST");
  console.log("----------------------------------------");

  // Health
  await test("Health Check", "GET", "/api/health");

  // Login
  await test("Admin Login", "POST", "/api/login", {
    body: {
      email: "admin@gamehub.test",
      password: "Admin1234",
    },
    expected: 200,
    saveToken: "admin",
  });

  await test("Member Login", "POST", "/api/login", {
    body: {
      email: "member@gamehub.test",
      password: "Member1234",
    },
    expected: 200,
    saveToken: "member",
  });

  await test("Login ด้วยรหัสผ่านผิด", "POST", "/api/login", {
    body: {
      email: "member@gamehub.test",
      password: "wrong-password",
    },
    expected: 401,
  });

  // Profile
  await test("Get Member Profile", "GET", "/api/me", {
    token: memberToken,
  });

  await test("Get Profile ไม่ Login", "GET", "/api/me", {
    expected: 401,
  });

  // Games
  await test("Get Games", "GET", "/api/games");
  await test("Get Game Detail", "GET", "/api/games/1");
  await test("Get Game Full Detail", "GET", "/api/games/1/detail");

  // Admin
  await test("Get Admin Games", "GET", "/api/admin/games", {
    token: adminToken,
  });

  await test("Get Admin Members", "GET", "/api/admin/members", {
    token: adminToken,
  });

  await test("Member เข้า Admin Games ไม่ได้", "GET", "/api/admin/games", {
    token: memberToken,
    expected: 403,
  });

  // Library
  await test("Get Member Library", "GET", "/api/library", {
    token: memberToken,
  });

  await test("Get Library ไม่ Login", "GET", "/api/library", {
    expected: 401,
  });

  // Reviews
  await test("Get Game Reviews", "GET", "/api/games/1/reviews");

  // Rating
  await test(
    "Get Rating Summary",
    "GET",
    "/api/games/1/rating-summary"
  );

  console.log("----------------------------------------");
  console.log(`📊 ผลทดสอบ: ${passed} ผ่าน / ${failed} ไม่ผ่าน`);
  console.log("----------------------------------------");

  if (failed > 0) {
    process.exitCode = 1;
  } else {
    console.log("🎉 API Smoke Test ผ่านทั้งหมด!");
  }
}

runTests();
