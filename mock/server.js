
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const initialData = require("./games.json");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(
    `[${new Date().toLocaleString("th-TH")}] ${req.method} ${req.originalUrl}`
  );
  next();
});

// ======================================================
// In-memory Mock Database
// ไม่เชื่อมต่อ Go Backend หรือ Supabase
// ======================================================

let games = initialData.data.map((game) => ({
  ...game,
  is_deleted: false,
}));

let deletedGameIds = new Set();

let users = [
  {
    id: 1,
    username: "GameHub Admin",
    email: "admin@gamehub.test",
    password: "Admin1234",
    role: "admin",
    status: "active",
  },
  {
    id: 2,
    username: "GameHub Member",
    email: "member@gamehub.test",
    password: "Member1234",
    role: "member",
    status: "active",
  },
];

let tokens = new Map();

let library = [
  {
    id: 1,
    user_id: 2,
    game_id: 1,
    status: "playing",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let reviews = [
  {
    id: 1,
    user_id: 2,
    username: "GameHub Member",
    game_id: 1,
    content: "เป็นเกมที่มีโลกกว้างและระบบการต่อสู้สนุกมาก",
    status: "visible",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let ratings = [
  {
    id: 1,
    user_id: 2,
    game_id: 1,
    rating: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let nextGameId =
  Math.max(0, ...games.map((game) => Number(game.id))) + 1;
let nextUserId = 3;
let nextLibraryId = 2;
let nextReviewId = 2;
let nextRatingId = 2;

// ======================================================
// Response Helpers
// ======================================================

function sendSuccess(res, data, message, statusCode = 200) {
  const response = { status: "success" };

  if (message) response.message = message;
  if (data !== undefined) response.data = data;

  return res.status(statusCode).json(response);
}

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({
    status: "error",
    message,
  });
}

function sendPlainError(res, statusCode, message) {
  return res.status(statusCode).send(message);
}

function getId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function getPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

function getGame(id, includeDeleted = false) {
  return games.find(
    (game) =>
      Number(game.id) === Number(id) &&
      (includeDeleted || !deletedGameIds.has(Number(id)))
  );
}

function getUserById(id) {
  return users.find((user) => user.id === Number(id));
}

function getVisibleReviews(gameId) {
  return reviews
    .filter(
      (review) =>
        review.game_id === Number(gameId) &&
        review.status === "visible"
    )
    .sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    )
    .map((review) => {
      const rating = ratings.find(
        (item) =>
          item.user_id === review.user_id &&
          item.game_id === review.game_id
      );

      return {
        ...review,
        rating: rating ? rating.rating : 0,
      };
    });
}

function getRatingSummary(gameId) {
  const gameRatings = ratings.filter(
    (item) => item.game_id === Number(gameId)
  );

  const total = gameRatings.length;
  const average =
    total === 0
      ? 0
      : Math.round(
          (gameRatings.reduce(
            (sum, item) => sum + item.rating,
            0
          ) /
            total) *
            100
        ) / 100;

  const totalReviews = reviews.filter(
    (item) =>
      item.game_id === Number(gameId) &&
      item.status === "visible"
  ).length;

  return {
    game_id: Number(gameId),
    average_rating: average,
    total_ratings: total,
    total_reviews: totalReviews,
  };
}

// ======================================================
// Authentication Middleware
// ======================================================

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return sendError(res, 401, "กรุณาเข้าสู่ระบบก่อน");
  }

  const parts = authHeader.trim().split(/\s+/);

  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return sendError(res, 401, "รูปแบบ Token ไม่ถูกต้อง");
  }

  const userId = tokens.get(parts[1]);

  if (!userId) {
    return sendError(res, 401, "Token ไม่ถูกต้องหรือหมดอายุ");
  }

  const user = getUserById(userId);

  if (!user) {
    return sendError(res, 401, "ไม่พบบัญชีผู้ใช้");
  }

  req.user = user;
  next();
}

function requireActive(req, res, next) {
  if (req.user.status !== "active") {
    return sendError(
      res,
      403,
      "บัญชีนี้ถูกระงับการใช้งาน"
    );
  }

  next();
}

function requireAdmin(req, res, next) {
  if (req.user.status !== "active") {
    return sendError(
      res,
      403,
      "บัญชีนี้ไม่สามารถใช้งานได้"
    );
  }

  if (req.user.role !== "admin") {
    return sendError(
      res,
      403,
      "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้"
    );
  }

  next();
}

function activeAuth(req, res, next) {
  requireAuth(req, res, (error) => {
    if (error) return next(error);
    requireActive(req, res, next);
  });
}

function adminAuth(req, res, next) {
  requireAuth(req, res, (error) => {
    if (error) return next(error);
    requireAdmin(req, res, next);
  });
}

// ======================================================
// Health Check
// ======================================================

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "GameHub Mock Backend is running",
    database: "mock",
  });
});

// ======================================================
// Authentication
// ======================================================

// POST /api/register
app.post("/api/register", (req, res) => {
  const username =
    typeof req.body.username === "string"
      ? req.body.username.trim()
      : "";

  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  const password =
    typeof req.body.password === "string"
      ? req.body.password
      : "";

  if (!username || !email || !password.trim()) {
    return sendPlainError(
      res,
      400,
      "กรุณากรอกข้อมูลให้ครบ"
    );
  }

  if (password.length < 8) {
    return sendPlainError(
      res,
      400,
      "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
    );
  }

  const exists = users.some(
    (user) =>
      user.username.toLowerCase() === username.toLowerCase() ||
      user.email.toLowerCase() === email
  );

  if (exists) {
    return sendPlainError(
      res,
      409,
      "ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว"
    );
  }

  const user = {
    id: nextUserId++,
    username,
    email,
    password,
    role: "member",
    status: "active",
  };

  users.push(user);

  return res.status(201).json({
    status: "success",
    message: "สมัครสมาชิกสำเร็จ",
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
});

// POST /api/login
app.post("/api/login", (req, res) => {
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  const password =
    typeof req.body.password === "string"
      ? req.body.password
      : "";

  if (!email || !password) {
    return sendPlainError(
      res,
      400,
      "กรุณากรอกอีเมลและรหัสผ่าน"
    );
  }

  const user = users.find(
    (item) => item.email.toLowerCase() === email
  );

  if (!user || user.password !== password) {
    return sendPlainError(
      res,
      401,
      "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
    );
  }

  if (user.status !== "active") {
    return sendPlainError(
      res,
      403,
      "บัญชีนี้ไม่สามารถใช้งานได้"
    );
  }

  const token = `mock-${crypto.randomBytes(24).toString("hex")}`;
  tokens.set(token, user.id);

  return res.json({
    status: "success",
    message: "เข้าสู่ระบบสำเร็จ",
    token,
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
});

// ======================================================
// User Profile
// ======================================================

// GET /api/me
app.get("/api/me", activeAuth, (req, res) => {
  return res.json({
    status: "success",
    message: "ดึงข้อมูลผู้ใช้สำเร็จ",
    ...getPublicUser(req.user),
  });
});

// PUT /api/me
app.put("/api/me", activeAuth, (req, res) => {
  const username =
    typeof req.body.username === "string"
      ? req.body.username.trim()
      : "";

  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim()
      : "";

  if (!username || !email) {
    return sendError(
      res,
      400,
      "กรุณากรอก Username และ Email"
    );
  }

  if (!email.includes("@")) {
    return sendError(
      res,
      400,
      "รูปแบบ Email ไม่ถูกต้อง"
    );
  }

  const usernameExists = users.some(
    (user) =>
      user.id !== req.user.id &&
      user.username.toLowerCase() === username.toLowerCase()
  );

  if (usernameExists) {
    return sendError(
      res,
      409,
      "Username นี้ถูกใช้งานแล้ว"
    );
  }

  const emailExists = users.some(
    (user) =>
      user.id !== req.user.id &&
      user.email.toLowerCase() === email.toLowerCase()
  );

  if (emailExists) {
    return sendError(
      res,
      409,
      "Email นี้ถูกใช้งานแล้ว"
    );
  }

  req.user.username = username;
  req.user.email = email;

  return res.json({
    status: "success",
    message: "แก้ไขข้อมูลโปรไฟล์สำเร็จ",
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
  });
});

// POST /api/change-password
app.post("/api/change-password", activeAuth, (req, res) => {
  const { old_password, new_password } = req.body;

  if (!old_password || !new_password) {
    return sendError(
      res,
      400,
      "กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่"
    );
  }

  if (new_password.length < 8) {
    return sendError(
      res,
      400,
      "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร"
    );
  }

  if (old_password === new_password) {
    return sendError(
      res,
      400,
      "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม"
    );
  }

  if (req.user.password !== old_password) {
    return sendError(
      res,
      401,
      "รหัสผ่านเดิมไม่ถูกต้อง"
    );
  }

  req.user.password = new_password;

  return res.json({
    status: "success",
    message: "เปลี่ยนรหัสผ่านสำเร็จ",
  });
});

// ======================================================
// Public Game APIs
// ======================================================

// GET /api/games
app.get("/api/games", (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();
  const limit =
    req.query.limit === undefined ? 20 : Number(req.query.limit);
  const offset =
    req.query.offset === undefined ? 0 : Number(req.query.offset);

  if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
    return sendPlainError(
      res,
      400,
      "limit ต้องอยู่ระหว่าง 1 ถึง 200"
    );
  }

  if (!Number.isInteger(offset) || offset < 0) {
    return sendPlainError(
      res,
      400,
      "offset ต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป"
    );
  }

  let result = games.filter(
    (game) => !deletedGameIds.has(Number(game.id))
  );

  if (q) {
    result = result.filter((game) =>
      (game.name || "").toLowerCase().includes(q)
    );
  }

  result.sort((a, b) => Number(a.id) - Number(b.id));

  const total = result.length;
  const data = result.slice(offset, offset + limit);

  return res.json({
    status: "success",
    total,
    count: data.length,
    limit,
    offset,
    data,
  });
});

// GET /api/games/:id
app.get("/api/games/:id", (req, res) => {
  const id = getId(req.params.id);

  if (!id) {
    return sendPlainError(res, 400, "รหัสเกมไม่ถูกต้อง");
  }

  const game = getGame(id);

  if (!game) {
    return sendPlainError(
      res,
      404,
      "ไม่พบเกมที่ต้องการ"
    );
  }

  return res.json({
    status: "success",
    data: game,
  });
});

// GET /api/games/:id/detail
app.get("/api/games/:id/detail", (req, res) => {
  const id = getId(req.params.id);

  if (!id) {
    return sendError(res, 400, "รหัสเกมไม่ถูกต้อง");
  }

  const game = getGame(id);

  if (!game) {
    return sendError(res, 404, "ไม่พบเกมนี้");
  }

  const summary = getRatingSummary(id);
  const visibleReviews = getVisibleReviews(id);

  return res.json({
    status: "success",
    data: {
      game,
      rating_summary: summary,
      reviews: visibleReviews,
    },
  });
});

// ======================================================
// Admin Game APIs
// ======================================================

// GET /api/admin/games
app.get("/api/admin/games", adminAuth, (req, res) => {
  const data = [...games].sort(
    (a, b) => Number(a.id) - Number(b.id)
  );

  return res.json({
    status: "success",
    total: data.length,
    count: data.length,
    limit: data.length,
    offset: 0,
    data,
  });
});

// POST /api/games
app.post("/api/games", adminAuth, (req, res) => {
  const { name, genre, year, image, description, igdb_id } =
    req.body;

  if (typeof name !== "string" || !name.trim()) {
    return sendPlainError(
      res,
      400,
      "กรุณาระบุชื่อเกม"
    );
  }

  const newGame = {
    id: nextGameId++,
    name: name.trim(),
    genre: genre ?? null,
    year: year ?? null,
    image: image ?? null,
    description: description ?? null,
    igdb_id: igdb_id ?? null,
    is_deleted: false,
  };

  games.push(newGame);

  return res.status(201).json({
    status: "success",
    message: "เพิ่มเกมสำเร็จ",
    data: newGame,
  });
});

// PUT /api/games/:id
app.put("/api/games/:id", adminAuth, (req, res) => {
  const id = getId(req.params.id);

  if (!id) {
    return sendPlainError(res, 400, "รหัสเกมไม่ถูกต้อง");
  }

  const game = getGame(id);

  if (!game) {
    return sendPlainError(
      res,
      404,
      "ไม่พบเกมที่ต้องการแก้ไข"
    );
  }

  const { name, genre, year, image, description, igdb_id } =
    req.body;

  if (typeof name !== "string" || !name.trim()) {
    return sendPlainError(
      res,
      400,
      "กรุณาระบุชื่อเกม"
    );
  }

  Object.assign(game, {
    name: name.trim(),
    genre: genre ?? null,
    year: year ?? null,
    image: image ?? null,
    description: description ?? null,
    igdb_id: igdb_id ?? null,
  });

  return res.json({
    status: "success",
    message: "แก้ไขเกมสำเร็จ",
    data: game,
  });
});

// DELETE /api/games/:id
app.delete("/api/games/:id", adminAuth, (req, res) => {
  const id = getId(req.params.id);

  if (!id) {
    return sendPlainError(res, 400, "รหัสเกมไม่ถูกต้อง");
  }

  const game = getGame(id);

  if (!game) {
    return sendPlainError(
      res,
      404,
      "ไม่พบเกมที่ต้องการลบ"
    );
  }

  deletedGameIds.add(id);
  game.is_deleted = true;

  return res.json({
    status: "success",
    message: "ลบเกมสำเร็จ",
    id,
  });
});

// PATCH /api/games/:id/restore
app.patch(
  "/api/games/:id/restore",
  adminAuth,
  (req, res) => {
    const id = getId(req.params.id);

    if (!id) {
      return sendPlainError(
        res,
        400,
        "รหัสเกมไม่ถูกต้อง"
      );
    }

    const game = getGame(id, true);

    if (!game || !deletedGameIds.has(id)) {
      return sendPlainError(
        res,
        404,
        "ไม่พบเกมที่ถูกลบหรือเกมนี้ยังไม่ได้ถูกลบ"
      );
    }

    deletedGameIds.delete(id);
    game.is_deleted = false;

    return res.json({
      status: "success",
      message: "กู้คืนเกมสำเร็จ",
      id,
    });
  }
);

// ======================================================
// Admin Member APIs
// ======================================================

// GET /api/admin/members
app.get("/api/admin/members", adminAuth, (req, res) => {
  const data = users
    .slice()
    .sort((a, b) => a.id - b.id)
    .map(getPublicUser);

  return res.json({
    status: "success",
    count: data.length,
    data,
  });
});

// PATCH /api/admin/members/:id/status
app.patch(
  "/api/admin/members/:id/status",
  adminAuth,
  (req, res) => {
    const id = getId(req.params.id);
    const status =
      typeof req.body.status === "string"
        ? req.body.status.trim().toLowerCase()
        : "";

    if (!id) {
      return sendPlainError(
        res,
        400,
        "รหัสสมาชิกไม่ถูกต้อง"
      );
    }

    if (status !== "active" && status !== "suspended") {
      return sendPlainError(
        res,
        400,
        "สถานะต้องเป็น active หรือ suspended เท่านั้น"
      );
    }

    if (req.user.id === id && status === "suspended") {
      return sendPlainError(
        res,
        403,
        "ไม่สามารถระงับบัญชีของตนเองได้"
      );
    }

    const member = getUserById(id);

    if (!member) {
      return sendPlainError(
        res,
        404,
        "ไม่พบสมาชิกที่ต้องการ"
      );
    }

    if (member.role !== "member") {
      return sendPlainError(
        res,
        403,
        "ไม่อนุญาตให้เปลี่ยนสถานะบัญชี Admin"
      );
    }

    member.status = status;

    const message =
      status === "suspended"
        ? "ระงับบัญชีสมาชิกสำเร็จ"
        : "เปิดใช้งานบัญชีสมาชิกสำเร็จ";

    return res.json({
      status: "success",
      message,
      data: getPublicUser(member),
    });
  }
);

// ======================================================
// User Game Library
// ======================================================

const validLibraryStatuses = [
  "want_to_play",
  "playing",
  "completed",
  "dropped",
];

// POST /api/library
app.post("/api/library", activeAuth, (req, res) => {
  const gameId = getId(req.body.game_id);
  const status = req.body.status || "want_to_play";

  if (!gameId) {
    return sendError(res, 400, "Game ID ไม่ถูกต้อง");
  }

  if (!validLibraryStatuses.includes(status)) {
    return sendError(
      res,
      400,
      "สถานะเกมไม่ถูกต้อง"
    );
  }

  const game = getGame(gameId, true);

  if (!game) {
    return sendError(
      res,
      404,
      "ไม่พบเกมนี้ในระบบ"
    );
  }

  const exists = library.some(
    (item) =>
      item.user_id === req.user.id &&
      item.game_id === gameId
  );

  if (exists) {
    return sendError(
      res,
      409,
      "เกมนี้อยู่ในคลังของคุณแล้ว"
    );
  }

  const now = new Date().toISOString();

  const item = {
    id: nextLibraryId++,
    user_id: req.user.id,
    game_id: gameId,
    status,
    created_at: now,
    updated_at: now,
  };

  library.push(item);

  return res.json({
    status: "success",
    message: "เพิ่มเกมเข้าคลังสำเร็จ",
    library_id: item.id,
    game_id: gameId,
    game_status: status,
  });
});

// GET /api/library
app.get("/api/library", activeAuth, (req, res) => {
  const data = library
    .filter((item) => item.user_id === req.user.id)
    .sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    )
    .map((item) => {
      const game = getGame(item.game_id);

      if (!game) return null;

      return {
        id: item.id,
        game_id: game.id,
        name: game.name,
        genre: game.genre ?? null,
        year: game.year ?? null,
        image: game.image ?? null,
        description: game.description ?? null,
        status: item.status,
      };
    })
    .filter(Boolean);

  return res.json({
    status: "success",
    count: data.length,
    data,
  });
});

// PUT /api/library/:id
app.put("/api/library/:id", activeAuth, (req, res) => {
  const id = getId(req.params.id);
  const status = req.body.status;

  if (!id) {
    return sendError(
      res,
      400,
      "Library ID ไม่ถูกต้อง"
    );
  }

  if (!validLibraryStatuses.includes(status)) {
    return sendError(
      res,
      400,
      "สถานะเกมไม่ถูกต้อง"
    );
  }

  const item = library.find(
    (entry) =>
      entry.id === id &&
      entry.user_id === req.user.id
  );

  if (!item) {
    return sendError(
      res,
      404,
      "ไม่พบเกมในคลังของคุณ"
    );
  }

  item.status = status;
  item.updated_at = new Date().toISOString();

  return res.json({
    status: "success",
    message: "เปลี่ยนสถานะเกมสำเร็จ",
    id,
    game_status: status,
  });
});

// DELETE /api/library/:id
app.delete("/api/library/:id", activeAuth, (req, res) => {
  const id = getId(req.params.id);

  if (!id) {
    return sendError(
      res,
      400,
      "Library ID ไม่ถูกต้อง"
    );
  }

  const index = library.findIndex(
    (item) =>
      item.id === id &&
      item.user_id === req.user.id
  );

  if (index === -1) {
    return sendError(
      res,
      404,
      "ไม่พบเกมในคลังของคุณ"
    );
  }

  library.splice(index, 1);

  return res.json({
    status: "success",
    message: "นำเกมออกจากคลังสำเร็จ",
    id,
  });
});

// ======================================================
// Game Reviews
// ======================================================

function validReview(content, rating) {
  const trimmed = String(content || "").trim();
  const length = [...trimmed].length;

  return (
    length >= 1 &&
    length <= 5000 &&
    Number.isInteger(rating) &&
    rating >= 1 &&
    rating <= 5
  );
}

// POST /api/games/:id/reviews
app.post(
  "/api/games/:id/reviews",
  activeAuth,
  (req, res) => {
    const gameId = getId(req.params.id);
    const { content, rating } = req.body;

    if (!gameId) {
      return sendError(
        res,
        400,
        "รหัสเกมไม่ถูกต้อง"
      );
    }

    if (!validReview(content, rating)) {
      return sendError(
        res,
        400,
        "รีวิวต้องมีข้อความ 1-5000 ตัวอักษร และคะแนนต้องอยู่ระหว่าง 1-5"
      );
    }

    if (!getGame(gameId)) {
      return sendError(res, 404, "ไม่พบเกมนี้");
    }

    const alreadyReviewed = reviews.some(
      (item) =>
        item.user_id === req.user.id &&
        item.game_id === gameId
    );

    if (alreadyReviewed) {
      return sendError(
        res,
        409,
        "คุณเคยรีวิวเกมนี้แล้ว หรือไม่สามารถบันทึกรีวิวได้"
      );
    }

    const now = new Date().toISOString();

    const review = {
      id: nextReviewId++,
      user_id: req.user.id,
      username: req.user.username,
      game_id: gameId,
      content: String(content).trim(),
      status: "visible",
      created_at: now,
      updated_at: now,
    };

    reviews.push(review);

    ratings.push({
      id: nextRatingId++,
      user_id: req.user.id,
      game_id: gameId,
      rating,
      created_at: now,
      updated_at: now,
    });

    return res.status(201).json({
      status: "success",
      message: "บันทึกรีวิวและคะแนนสำเร็จ",
      review_id: review.id,
      game_id: gameId,
      rating,
    });
  }
);

// GET /api/games/:id/reviews
app.get("/api/games/:id/reviews", (req, res) => {
  const gameId = getId(req.params.id);

  if (!gameId) {
    return sendError(
      res,
      400,
      "รหัสเกมไม่ถูกต้อง"
    );
  }

  const data = getVisibleReviews(gameId);

  return res.json({
    status: "success",
    count: data.length,
    data,
  });
});

// PUT /api/reviews/:id
app.put("/api/reviews/:id", activeAuth, (req, res) => {
  const id = getId(req.params.id);
  const { content, rating } = req.body;

  if (!id) {
    return sendError(
      res,
      400,
      "รหัสรีวิวไม่ถูกต้อง"
    );
  }

  if (!validReview(content, rating)) {
    return sendError(
      res,
      400,
      "รีวิวต้องมีข้อความ 1-5000 ตัวอักษร และคะแนนต้องอยู่ระหว่าง 1-5"
    );
  }

  const review = reviews.find(
    (item) =>
      item.id === id &&
      item.user_id === req.user.id
  );

  if (!review) {
    return sendError(
      res,
      404,
      "ไม่พบรีวิวของคุณ"
    );
  }

  review.content = String(content).trim();
  review.updated_at = new Date().toISOString();

  let userRating = ratings.find(
    (item) =>
      item.user_id === req.user.id &&
      item.game_id === review.game_id
  );

  if (userRating) {
    userRating.rating = rating;
    userRating.updated_at = new Date().toISOString();
  } else {
    ratings.push({
      id: nextRatingId++,
      user_id: req.user.id,
      game_id: review.game_id,
      rating,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return res.json({
    status: "success",
    message: "แก้ไขรีวิวและคะแนนสำเร็จ",
    review_id: id,
    game_id: review.game_id,
    rating,
  });
});

// DELETE /api/reviews/:id
app.delete("/api/reviews/:id", activeAuth, (req, res) => {
  const id = getId(req.params.id);

  if (!id) {
    return sendError(
      res,
      400,
      "รหัสรีวิวไม่ถูกต้อง"
    );
  }

  const index = reviews.findIndex(
    (item) =>
      item.id === id &&
      item.user_id === req.user.id
  );

  if (index === -1) {
    return sendError(
      res,
      404,
      "ไม่พบรีวิวของคุณ"
    );
  }

  const review = reviews[index];

  reviews.splice(index, 1);

  // ลบคะแนนของผู้ใช้ในเกมนั้นด้วย
  ratings = ratings.filter(
    (item) =>
      !(
        item.user_id === req.user.id &&
        item.game_id === review.game_id
      )
  );

  return res.json({
    status: "success",
    message: "ลบรีวิวและคะแนนสำเร็จ",
    review_id: id,
  });
});

// ======================================================
// Game Rating
// ======================================================

// POST /api/games/:id/rating
app.post("/api/games/:id/rating", activeAuth, (req, res) => {
  const gameId = getId(req.params.id);
  const rating = req.body.rating;

  if (!gameId) {
    return sendError(
      res,
      400,
      "รหัสเกมไม่ถูกต้อง"
    );
  }

  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return sendError(
      res,
      400,
      "คะแนนต้องอยู่ระหว่าง 1-5"
    );
  }

  if (!getGame(gameId)) {
    return sendError(res, 404, "ไม่พบเกมนี้");
  }

  let existing = ratings.find(
    (item) =>
      item.user_id === req.user.id &&
      item.game_id === gameId
  );

  if (existing) {
    existing.rating = rating;
    existing.updated_at = new Date().toISOString();
  } else {
    const now = new Date().toISOString();

    ratings.push({
      id: nextRatingId++,
      user_id: req.user.id,
      game_id: gameId,
      rating,
      created_at: now,
      updated_at: now,
    });
  }

  return res.json({
    status: "success",
    message: "บันทึกคะแนนสำเร็จ",
    game_id: gameId,
    rating,
  });
});

// GET /api/games/:id/rating-summary
app.get("/api/games/:id/rating-summary", (req, res) => {
  const gameId = getId(req.params.id);

  if (!gameId) {
    return sendError(
      res,
      400,
      "รหัสเกมไม่ถูกต้อง"
    );
  }

  if (!getGame(gameId)) {
    return sendError(res, 404, "ไม่พบเกมนี้");
  }

  return res.json({
    status: "success",
    data: getRatingSummary(gameId),
  });
});

// ======================================================
// 404 Handler
// ======================================================

app.use("/api", (req, res) => {
  return sendError(
    res,
    404,
    "ไม่พบ API ที่ต้องการ"
  );
});

// JSON Error Handler
app.use((err, req, res, next) => {
  console.error("Mock Backend Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  return sendError(
    res,
    500,
    "เกิดข้อผิดพลาดภายใน Mock Backend"
  );
});

// ======================================================
// Start Mock Backend
// ======================================================

app.listen(PORT, () => {
  console.log("----------------------------------------");
  console.log("🎮 GameHub Mock Backend is running");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("----------------------------------------");
  console.log("Mock accounts:");
  console.log("Admin  : admin@gamehub.test / Admin1234");
  console.log("Member : member@gamehub.test / Member1234");
  console.log("----------------------------------------");
});
