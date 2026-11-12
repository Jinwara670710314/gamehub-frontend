# GameHub API Documentation

เอกสารอธิบาย API ของระบบ GameHub สำหรับใช้เป็นข้อมูลอ้างอิงร่วมกันระหว่าง Frontend และ Backend โดยอ้างอิงจาก Routes และ Handler ใน Repository ปัจจุบัน

Repository: https://github.com/Jinwara670710314/gamehub-backend

---

## 1. Overview

GameHub Backend เป็น REST API ที่พัฒนาด้วยภาษา Go และเชื่อมต่อกับ PostgreSQL ผ่านฐานข้อมูล Supabase

API รองรับการทำงานหลัก ได้แก่

- ตรวจสอบสถานะ Backend และ Database
- สมัครสมาชิกและเข้าสู่ระบบ
- จัดการข้อมูลโปรไฟล์และรหัสผ่าน
- จัดการคลังเกมส่วนตัว (Game Library)
- ดูรายการเกมและรายละเอียดเกม
- จัดการเกมสำหรับ Admin
- จัดการสมาชิกสำหรับ Admin
- เขียน แก้ไข และลบรีวิว
- ให้คะแนนเกมและดูสรุปคะแนน

### 1.1 Base URL

ใช้ Base URL ตามสภาพแวดล้อมที่กำลังใช้งาน

| Environment | Base URL |
|---|---|
| Local | `http://localhost:8080` |
| Production | URL ของ Backend ที่ Deploy บน Render |

ตัวอย่างการเรียก API:

`GET http://localhost:8080/api/games`

### 1.2 Response Format

ข้อมูลส่วนใหญ่ส่งและรับในรูปแบบ JSON โดยใช้ Header:

`Content-Type: application/json`

รูปแบบ Response ทั่วไป:

```json
{
  "status": "success",
  "message": "ดำเนินการสำเร็จ",
  "data": {}
}
```

รูปแบบ Error ที่ใช้ในบาง Handler:

```json
{
  "status": "error",
  "message": "เกิดข้อผิดพลาด"
}
```

หมายเหตุ: บาง Handler ใช้ `http.Error` ซึ่งอาจส่ง Error เป็นข้อความธรรมดา ไม่ใช่ JSON ดังนั้น Frontend ควรรองรับทั้ง JSON และข้อความธรรมดา

---

## 2. Authentication และ Authorization

ระบบใช้ JSON Web Token (JWT) สำหรับตรวจสอบตัวตนผู้ใช้

### 2.1 การเข้าสู่ระบบ

เมื่อเข้าสู่ระบบสำเร็จ Backend จะส่ง JWT Token กลับมาให้ Frontend

Token มีข้อมูลสำคัญ ได้แก่

- `user_id` : รหัสผู้ใช้
- `username` : ชื่อผู้ใช้
- `role` : สิทธิ์ของผู้ใช้
- `iat` : เวลาออก Token
- `exp` : เวลาหมดอายุ Token

รายละเอียดการกำหนด Token:

- ใช้ Algorithm `HS256`
- กำหนดอายุ Token 24 ชั่วโมง
- ใช้ Environment Variable `JWT_SECRET` สำหรับลงลายเซ็น Token

### 2.2 การส่ง Token

API ที่ต้องเข้าสู่ระบบต้องส่ง Token ผ่าน Header:

```http
Authorization: Bearer <JWT_TOKEN>
```

ตัวอย่าง:

```http
GET /api/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 2.3 User Roles

| Role | รายละเอียด |
|---|---|
| Guest | ผู้ใช้ที่ยังไม่ได้เข้าสู่ระบบ |
| Member | สมาชิกทั่วไป |
| Admin | ผู้ดูแลระบบ |

### 2.4 Middleware

Backend ใช้ Middleware สำหรับตรวจสอบสิทธิ์ดังนี้

| Middleware | หน้าที่ |
|---|---|
| `Auth` | ตรวจสอบ JWT Token |
| `Active` | ตรวจสอบว่าบัญชีผู้ใช้ยังใช้งานได้ |
| `Admin` | ตรวจสอบว่าผู้ใช้เป็น Admin และบัญชียัง Active |

หมายเหตุ: API ที่ใช้ `Auth` และ `Admin` จะตรวจสอบสถานะบัญชีและสิทธิ์ Admin ภายใน Admin Middleware ด้วย

---

## 3. API Endpoint Summary

ระบบมี API ทั้งหมด 26 Endpoints แบ่งตามหมวดหมู่ดังนี้

| หมวดหมู่ | จำนวน |
|---|---:|
| Health Check | 1 |
| Authentication | 3 |
| User Profile | 2 |
| User Game Library | 4 |
| Public Games | 3 |
| Admin Games | 5 |
| Admin Members | 2 |
| Game Reviews | 4 |
| Game Rating | 2 |
| **รวม** | **26** |

### 3.1 Health Check

| Method | Endpoint | Permission |
|---|---|---|
| GET | `/api/health` | Public |

### 3.2 Authentication

| Method | Endpoint | Permission |
|---|---|---|
| POST | `/api/register` | Public |
| POST | `/api/login` | Public |
| POST | `/api/change-password` | Member / Admin |

### 3.3 User Profile

| Method | Endpoint | Permission |
|---|---|---|
| GET | `/api/me` | Member / Admin |
| PUT | `/api/me` | Member / Admin |

### 3.4 User Game Library

| Method | Endpoint | Permission |
|---|---|---|
| POST | `/api/library` | Member / Admin |
| GET | `/api/library` | Member / Admin |
| PUT | `/api/library/{id}` | Member / Admin |
| DELETE | `/api/library/{id}` | Member / Admin |

### 3.5 Public Games

| Method | Endpoint | Permission |
|---|---|---|
| GET | `/api/games` | Public |
| GET | `/api/games/{id}` | Public |
| GET | `/api/games/{id}/detail` | Public |

### 3.6 Admin Games

| Method | Endpoint | Permission |
|---|---|---|
| GET | `/api/admin/games` | Admin |
| POST | `/api/games` | Admin |
| PUT | `/api/games/{id}` | Admin |
| DELETE | `/api/games/{id}` | Admin |
| PATCH | `/api/games/{id}/restore` | Admin |

### 3.7 Admin Members

| Method | Endpoint | Permission |
|---|---|---|
| GET | `/api/admin/members` | Admin |
| PATCH | `/api/admin/members/{id}/status` | Admin |

### 3.8 Game Reviews

| Method | Endpoint | Permission |
|---|---|---|
| POST | `/api/games/{id}/reviews` | Member / Admin |
| GET | `/api/games/{id}/reviews` | Public |
| PUT | `/api/reviews/{id}` | Member / Admin |
| DELETE | `/api/reviews/{id}` | Member / Admin |

### 3.9 Game Rating

| Method | Endpoint | Permission |
|---|---|---|
| POST | `/api/games/{id}/rating` | Member / Admin |
| GET | `/api/games/{id}/rating-summary` | Public |

---

## 4. Health Check API

### GET `/api/health`

ใช้ตรวจสอบว่า Backend และ Database สามารถทำงานได้หรือไม่

**Permission:** Public

**Response 200 OK**

```json
{
  "status": "success",
  "message": "GameHub Backend is running!",
  "database": "connected"
}
```

**Response 500 Internal Server Error**

เมื่อไม่สามารถเชื่อมต่อ Database ได้

---

## 5. Authentication API

### 5.1 POST `/api/register`

ใช้สมัครสมาชิกใหม่

**Permission:** Public

**Request Body**

```json
{
  "username": "gameuser",
  "email": "gameuser@example.com",
  "password": "password123"
}
```

**Validation**

- ต้องกรอก Username, Email และ Password
- Password ต้องมีอย่างน้อย 8 ตัวอักษร
- ตัดช่องว่างด้านหน้าและด้านหลังของ Username
- แปลง Email เป็นตัวพิมพ์เล็ก
- Username หรือ Email ต้องไม่ซ้ำกับสมาชิกเดิม

**Response 201 Created**

```json
{
  "status": "success",
  "message": "สมัครสมาชิกสำเร็จ",
  "id": 1,
  "username": "gameuser",
  "email": "gameuser@example.com",
  "role": "member"
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | ข้อมูลไม่ถูกต้อง หรือกรอกข้อมูลไม่ครบ |
| 409 | Username หรือ Email ถูกใช้งานแล้ว |
| 500 | ไม่สามารถสมัครสมาชิกได้ |

### 5.2 POST `/api/login`

ใช้เข้าสู่ระบบด้วย Email และ Password

**Permission:** Public

**Request Body**

```json
{
  "email": "gameuser@example.com",
  "password": "password123"
}
```

**Validation**

- ต้องกรอก Email และ Password
- Email ถูกแปลงเป็นตัวพิมพ์เล็ก
- ตรวจสอบ Password ด้วย bcrypt
- บัญชีต้องมีสถานะ `active`
- ต้องมีการตั้งค่า `JWT_SECRET`

**Response 200 OK**

```json
{
  "status": "success",
  "message": "เข้าสู่ระบบสำเร็จ",
  "token": "<JWT_TOKEN>",
  "id": 1,
  "username": "gameuser",
  "email": "gameuser@example.com",
  "role": "member"
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | ข้อมูลไม่ถูกต้อง หรือไม่ได้กรอกข้อมูล |
| 401 | Email หรือ Password ไม่ถูกต้อง |
| 403 | บัญชีไม่สามารถใช้งานได้ |
| 500 | ระบบไม่สามารถเข้าสู่ระบบหรือสร้าง Token ได้ |

### 5.3 POST `/api/change-password`

ใช้เปลี่ยนรหัสผ่านของผู้ใช้ที่เข้าสู่ระบบแล้ว

**Permission:** Member / Admin ที่บัญชี Active

**Headers**

```http
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**

```json
{
  "old_password": "password123",
  "new_password": "newpassword123"
}
```

**Validation**

- ต้องกรอกรหัสผ่านเดิมและรหัสผ่านใหม่
- รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร
- รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม
- ต้องตรวจสอบรหัสผ่านเดิมให้ถูกต้องก่อนเปลี่ยน

**Response 200 OK**

```json
{
  "status": "success",
  "message": "เปลี่ยนรหัสผ่านสำเร็จ"
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | ข้อมูลไม่ถูกต้อง หรือรหัสผ่านใหม่ไม่ผ่านเงื่อนไข |
| 401 | ไม่ได้เข้าสู่ระบบ หรือรหัสผ่านเดิมไม่ถูกต้อง |
| 403 | บัญชีถูกระงับ |
| 500 | ไม่สามารถเปลี่ยนรหัสผ่านได้ |

---

## 6. User Profile API

### 6.1 GET `/api/me`

ใช้ดึงข้อมูลโปรไฟล์ของผู้ใช้ที่เข้าสู่ระบบ

**Permission:** Member / Admin ที่บัญชี Active

**Headers**

```http
Authorization: Bearer <JWT_TOKEN>
```

**Response 200 OK**

```json
{
  "status": "success",
  "message": "ดึงข้อมูลผู้ใช้สำเร็จ",
  "id": 1,
  "username": "gameuser",
  "email": "gameuser@example.com",
  "role": "member"
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 401 | ไม่พบ Token หรือไม่พบบัญชีผู้ใช้ |
| 403 | บัญชีถูกระงับ |
| 500 | เกิดข้อผิดพลาดจาก Database |

### 6.2 PUT `/api/me`

ใช้แก้ไข Username และ Email ของผู้ใช้ที่เข้าสู่ระบบ

**Permission:** Member / Admin ที่บัญชี Active

**Headers**

```http
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**

```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

**Validation**

- ต้องกรอก Username และ Email
- Email ต้องมีเครื่องหมาย `@`
- Username ต้องไม่ซ้ำกับสมาชิกคนอื่น
- Email ต้องไม่ซ้ำกับสมาชิกคนอื่น

**Response 200 OK**

```json
{
  "status": "success",
  "message": "แก้ไขข้อมูลโปรไฟล์สำเร็จ",
  "id": 1,
  "username": "newusername",
  "email": "newemail@example.com",
  "role": "member"
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | ข้อมูลไม่ถูกต้อง |
| 401 | ไม่ได้เข้าสู่ระบบ หรือไม่พบบัญชี |
| 403 | บัญชีถูกระงับ |
| 409 | Username หรือ Email ซ้ำ |
| 500 | ไม่สามารถแก้ไขข้อมูลได้ |

---

## 7. User Game Library API

ระบบ Library ใช้จัดเก็บเกมที่สมาชิกต้องการเล่นหรือกำลังเล่น โดยสมาชิกแต่ละคนสามารถจัดการคลังเกมของตนเองได้

สถานะเกมที่รองรับ:

| Status | ความหมาย |
|---|---|
| `want_to_play` | ต้องการเล่น |
| `playing` | กำลังเล่น |
| `completed` | เล่นจบแล้ว |
| `dropped` | เลิกเล่น |

ทุก Endpoint ในหมวดนี้ต้องส่ง JWT Token และบัญชีต้อง Active

### 7.1 POST `/api/library`

เพิ่มเกมเข้าสู่คลังส่วนตัว

**Request Body**

```json
{
  "game_id": 1,
  "status": "want_to_play"
}
```

หากไม่ส่ง `status` ระบบกำหนดค่าเริ่มต้นเป็น `want_to_play`

**Response 200 OK**

```json
{
  "status": "success",
  "message": "เพิ่มเกมเข้าคลังสำเร็จ",
  "library_id": 1,
  "game_id": 1,
  "game_status": "want_to_play"
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | Game ID หรือสถานะไม่ถูกต้อง |
| 401 | ไม่ได้เข้าสู่ระบบ |
| 403 | บัญชีถูกระงับ |
| 404 | ไม่พบเกม |
| 409 | เกมอยู่ในคลังแล้ว |
| 500 | ไม่สามารถเพิ่มเกมได้ |

### 7.2 GET `/api/library`

ดึงรายการเกมในคลังส่วนตัวของผู้ใช้

**Response 200 OK**

```json
{
  "status": "success",
  "count": 1,
  "data": [
    {
      "id": 1,
      "game_id": 1,
      "name": "Elden Ring",
      "genre": "RPG",
      "year": 2022,
      "image": "https://example.com/game.jpg",
      "description": "Game description",
      "status": "want_to_play"
    }
  ]
}
```

หมายเหตุ:

- แสดงเฉพาะเกมของผู้ใช้ที่เข้าสู่ระบบ
- ไม่แสดงเกมที่ถูก Soft Delete
- เรียงตามวันที่เพิ่มเกมเข้าคลังจากใหม่ไปเก่า

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 401 | ไม่ได้เข้าสู่ระบบ |
| 403 | บัญชีถูกระงับ |
| 500 | ไม่สามารถดึงข้อมูลคลังเกมได้ |

### 7.3 PUT `/api/library/{id}`

เปลี่ยนสถานะเกมในคลังส่วนตัว

ตัวอย่าง:

`PUT /api/library/1`

**Request Body**

```json
{
  "status": "playing"
}
```

**Response 200 OK**

```json
{
  "status": "success",
  "message": "เปลี่ยนสถานะเกมสำเร็จ",
  "id": 1,
  "game_status": "playing"
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | Library ID หรือสถานะไม่ถูกต้อง |
| 401 | ไม่ได้เข้าสู่ระบบ |
| 403 | บัญชีถูกระงับ |
| 404 | ไม่พบเกมในคลังของผู้ใช้ |
| 500 | ไม่สามารถเปลี่ยนสถานะได้ |

### 7.4 DELETE `/api/library/{id}`

นำเกมออกจากคลังส่วนตัว

ตัวอย่าง:

`DELETE /api/library/1`

**Response 200 OK**

```json
{
  "status": "success",
  "message": "นำเกมออกจากคลังสำเร็จ",
  "id": 1
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | Library ID ไม่ถูกต้อง |
| 401 | ไม่ได้เข้าสู่ระบบ |
| 403 | บัญชีถูกระงับ |
| 404 | ไม่พบเกมในคลังของผู้ใช้ |
| 500 | ไม่สามารถนำเกมออกจากคลังได้ |

---

## 8. Public Games API

API สำหรับดึงข้อมูลเกมที่ยังไม่ถูกลบออกจากระบบ

### 8.1 GET `/api/games`

ดึงรายการเกมทั้งหมดที่ยังใช้งานอยู่ รองรับการค้นหาและแบ่งหน้า

**Query Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `q` | string | ว่าง | ค้นหาจากชื่อเกม |
| `limit` | integer | 20 | จำนวนเกมต่อหน้า รับได้ 1–200 |
| `offset` | integer | 0 | จำนวนรายการที่ข้าม ต้องไม่น้อยกว่า 0 |

**ตัวอย่าง**

`GET /api/games?q=Elden&limit=10&offset=0`

การค้นหาใช้ `ILIKE` จึงไม่แยกตัวพิมพ์เล็กและตัวพิมพ์ใหญ่

**Response 200 OK**

```json
{
  "status": "success",
  "total": 1,
  "count": 1,
  "limit": 10,
  "offset": 0,
  "data": [
    {
      "id": 1,
      "name": "Elden Ring",
      "genre": "RPG",
      "year": 2022,
      "image": "https://example.com/game.jpg",
      "description": "Game description",
      "igdb_id": 12345
    }
  ]
}
```

หมายเหตุ:

- `total` คือจำนวนเกมทั้งหมดที่ตรงกับเงื่อนไขค้นหา
- `count` คือจำนวนเกมที่ส่งกลับมาในครั้งนั้น
- ไม่แสดงเกมที่ `is_deleted = TRUE`
- ฟิลด์ `genre`, `year`, `image`, `description` และ `igdb_id` อาจเป็น `null`

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | limit หรือ offset ไม่ถูกต้อง |
| 500 | ไม่สามารถดึงข้อมูลเกมได้ |

### 8.2 GET `/api/games/{id}`

ดึงรายละเอียดเกมตาม ID

ตัวอย่าง:

`GET /api/games/1`

**Response 200 OK**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Elden Ring",
    "genre": "RPG",
    "year": 2022,
    "image": "https://example.com/game.jpg",
    "description": "Game description",
    "igdb_id": 12345
  }
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | รหัสเกมไม่ถูกต้อง |
| 404 | ไม่พบเกมที่ต้องการ |
| 500 | ไม่สามารถดึงรายละเอียดเกมได้ |

### 8.3 GET `/api/games/{id}/detail`

ดึงรายละเอียดเกมพร้อมคะแนนและรายการรีวิวใน API เดียว

ตัวอย่าง:

`GET /api/games/1/detail`

**Response 200 OK**

```json
{
  "status": "success",
  "data": {
    "game": {
      "id": 1,
      "name": "Elden Ring",
      "genre": "RPG",
      "year": 2022,
      "image": "https://example.com/game.jpg",
      "description": "Game description",
      "igdb_id": 12345
    },
    "rating_summary": {
      "game_id": 1,
      "average_rating": 4.5,
      "total_ratings": 10,
      "total_reviews": 8
    },
    "reviews": [
      {
        "id": 1,
        "user_id": 2,
        "username": "gameuser",
        "game_id": 1,
        "content": "Great game!",
        "rating": 5,
        "status": "visible",
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z"
      }
    ]
  }
}
```

หมายเหตุ:

- ส่งข้อมูลเกม คะแนนเฉลี่ย จำนวนผู้ให้คะแนน จำนวนรีวิว และรายการรีวิวที่แสดงได้
- แสดงเฉพาะรีวิวที่มีสถานะ `visible`
- รายการรีวิวเรียงจากใหม่ไปเก่า
- หากยังไม่มีคะแนน ค่าเฉลี่ยและจำนวนคะแนนเป็น 0

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | รหัสเกมไม่ถูกต้อง |
| 404 | ไม่พบเกม |
| 500 | ไม่สามารถดึงข้อมูลรายละเอียดเกมได้ |

---

## 9. Admin Games API

API สำหรับ Admin จัดการข้อมูลเกม โดยทุก Endpoint ต้องมี JWT Token และสิทธิ์ `admin` พร้อมสถานะบัญชี `active`

### 9.1 GET `/api/admin/games`

ดึงข้อมูลเกมทั้งหมด รวมถึงเกมที่ถูก Soft Delete

**Response 200 OK**

```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "Elden Ring",
      "genre": "RPG",
      "year": 2022,
      "image": "https://example.com/game.jpg",
      "description": "Game description",
      "igdb_id": 12345,
      "isDeleted": false
    }
  ]
}
```

หมายเหตุ: ฟิลด์ `isDeleted` ใช้ตัวพิมพ์เล็กและตัวพิมพ์ใหญ่ตาม JSON Tag ใน Backend

### 9.2 POST `/api/games`

เพิ่มเกมใหม่

**Request Body**

```json
{
  "name": "New Game",
  "genre": "Action",
  "year": 2026,
  "image": "https://example.com/game.jpg",
  "description": "Game description",
  "igdb_id": 12345
}
```

**Validation**

- ต้องระบุชื่อเกม
- ชื่อเกมต้องไม่เป็นค่าว่างหลังตัดช่องว่าง

**Response 201 Created**

```json
{
  "status": "success",
  "message": "เพิ่มเกมสำเร็จ",
  "data": {
    "id": 10,
    "name": "New Game",
    "genre": "Action",
    "year": 2026,
    "image": "https://example.com/game.jpg",
    "description": "Game description",
    "igdb_id": 12345
  }
}
```

ระบบกำหนด `is_deleted = FALSE` เมื่อเพิ่มเกมใหม่

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | JSON ไม่ถูกต้อง หรือไม่ได้ระบุชื่อเกม |
| 401 | ไม่ได้เข้าสู่ระบบหรือ Token ไม่ถูกต้อง |
| 403 | ไม่มีสิทธิ์ Admin หรือบัญชีถูกระงับ |
| 500 | ไม่สามารถเพิ่มเกมได้ |

### 9.3 PUT `/api/games/{id}`

แก้ไขข้อมูลเกมตาม ID

ตัวอย่าง:

`PUT /api/games/10`

**Request Body**

```json
{
  "name": "Updated Game",
  "genre": "RPG",
  "year": 2026,
  "image": "https://example.com/updated.jpg",
  "description": "Updated description",
  "igdb_id": 12345
}
```

**Validation**

- ต้องระบุชื่อเกม
- ชื่อเกมต้องไม่เป็นค่าว่าง
- เกมที่ถูก Soft Delete แล้วจะไม่สามารถแก้ไขผ่าน Endpoint นี้ได้

**Response 200 OK**

```json
{
  "status": "success",
  "message": "แก้ไขเกมสำเร็จ",
  "data": {
    "id": 10,
    "name": "Updated Game",
    "genre": "RPG",
    "year": 2026,
    "image": "https://example.com/updated.jpg",
    "description": "Updated description",
    "igdb_id": 12345
  }
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | ID หรือ JSON ไม่ถูกต้อง หรือชื่อเกมว่าง |
| 401 | ไม่ได้เข้าสู่ระบบหรือ Token ไม่ถูกต้อง |
| 403 | ไม่มีสิทธิ์ Admin หรือบัญชีถูกระงับ |
| 404 | ไม่พบเกมหรือเกมถูกลบแล้ว |
| 500 | ไม่สามารถแก้ไขข้อมูลเกมได้ |

### 9.4 DELETE `/api/games/{id}`

ลบเกมด้วยวิธี Soft Delete

ตัวอย่าง:

`DELETE /api/games/10`

ระบบเปลี่ยนค่า `is_deleted` เป็น `TRUE` และอัปเดต `updated_at` โดยไม่ลบข้อมูลออกจากฐานข้อมูลจริง

**Response 200 OK**

```json
{
  "status": "success",
  "message": "ลบเกมสำเร็จ",
  "id": 10
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | รหัสเกมไม่ถูกต้อง |
| 401 | ไม่ได้เข้าสู่ระบบหรือ Token ไม่ถูกต้อง |
| 403 | ไม่มีสิทธิ์ Admin หรือบัญชีถูกระงับ |
| 404 | ไม่พบเกมหรือเกมถูกลบไปแล้ว |
| 500 | ไม่สามารถลบเกมได้ |

### 9.5 PATCH `/api/games/{id}/restore`

กู้คืนเกมที่ถูก Soft Delete

ตัวอย่าง:

`PATCH /api/games/10/restore`

ระบบเปลี่ยนค่า `is_deleted` กลับเป็น `FALSE`

**Response 200 OK**

```json
{
  "status": "success",
  "message": "กู้คืนเกมสำเร็จ",
  "id": 10
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | รหัสเกมไม่ถูกต้อง |
| 401 | ไม่ได้เข้าสู่ระบบหรือ Token ไม่ถูกต้อง |
| 403 | ไม่มีสิทธิ์ Admin หรือบัญชีถูกระงับ |
| 404 | ไม่พบเกมที่ถูกลบ หรือเกมยังไม่ได้ถูกลบ |
| 500 | ไม่สามารถกู้คืนเกมได้ |

---

## 10. Admin Members API

API สำหรับ Admin ดูรายชื่อสมาชิกและจัดการสถานะบัญชี

### 10.1 GET `/api/admin/members`

ดึงรายชื่อสมาชิกทั้งหมดในระบบ

**Response 200 OK**

```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": 1,
      "username": "gameuser",
      "email": "gameuser@example.com",
      "role": "member",
      "status": "active"
    },
    {
      "id": 2,
      "username": "anotheruser",
      "email": "another@example.com",
      "role": "member",
      "status": "suspended"
    }
  ]
}
```

หมายเหตุ: API นี้ดึงข้อมูลสมาชิกทั้งหมดตามลำดับ ID จากน้อยไปมาก

### 10.2 PATCH `/api/admin/members/{id}/status`

เปลี่ยนสถานะบัญชีสมาชิก

ตัวอย่าง:

`PATCH /api/admin/members/2/status`

**Request Body**

เปิดใช้งานบัญชี:

```json
{
  "status": "active"
}
```

ระงับบัญชี:

```json
{
  "status": "suspended"
}
```

**Validation**

- รองรับเฉพาะ `active` และ `suspended`
- ไม่อนุญาตให้ Admin ระงับบัญชีของตนเอง
- ไม่อนุญาตให้เปลี่ยนสถานะบัญชี Admin
- ใช้สำหรับบัญชีที่มี Role เป็น `member` เท่านั้น

**Response 200 OK**

```json
{
  "status": "success",
  "message": "ระงับบัญชีสมาชิกสำเร็จ",
  "data": {
    "id": 2,
    "username": "anotheruser",
    "email": "another@example.com",
    "role": "member",
    "status": "suspended"
  }
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | ID หรือสถานะไม่ถูกต้อง |
| 401 | ไม่ได้เข้าสู่ระบบหรือไม่พบบัญชี |
| 403 | ไม่มีสิทธิ์ Admin, บัญชีถูกระงับ หรือพยายามระงับบัญชีตนเอง |
| 404 | ไม่พบสมาชิก |
| 500 | ไม่สามารถเปลี่ยนสถานะได้ |

---

## 11. Game Reviews API

ระบบรีวิวรองรับการเพิ่ม แก้ไข ลบ และดูรีวิวเกม

เงื่อนไขของรีวิว:

- ข้อความรีวิวต้องมีความยาว 1–5000 ตัวอักษร
- คะแนนต้องอยู่ระหว่าง 1–5
- ผู้ใช้หนึ่งคนสามารถมีรีวิวต่อเกมหนึ่งเกมได้หนึ่งรายการ
- ผู้ใช้สามารถแก้ไขและลบรีวิวของตนเองได้
- แสดงเฉพาะรีวิวที่มีสถานะ `visible`

### 11.1 POST `/api/games/{id}/reviews`

สร้างรีวิวและให้คะแนนเกม

**Permission:** Member / Admin ที่บัญชี Active

ตัวอย่าง:

`POST /api/games/1/reviews`

**Request Body**

```json
{
  "content": "This game is amazing!",
  "rating": 5
}
```

**การทำงาน**

1. ตรวจสอบรหัสเกม
2. ตรวจสอบว่าเกมมีอยู่และยังไม่ถูกลบ
3. ตรวจสอบข้อความรีวิวและคะแนน
4. บันทึกรีวิวลง `game_reviews`
5. บันทึกหรืออัปเดตคะแนนใน `game_ratings`
6. ใช้ Database Transaction เพื่อให้การบันทึกทั้งสองส่วนสำเร็จหรือยกเลิกพร้อมกัน

**Response 201 Created**

```json
{
  "status": "success",
  "message": "บันทึกรีวิวและคะแนนสำเร็จ",
  "review_id": 1,
  "game_id": 1,
  "rating": 5
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | รหัสเกมหรือข้อมูลรีวิวไม่ถูกต้อง |
| 401 | ไม่ได้เข้าสู่ระบบ |
| 403 | บัญชีถูกระงับ |
| 404 | ไม่พบเกม |
| 409 | เคยรีวิวเกมนี้แล้ว หรือไม่สามารถบันทึกรีวิวได้ |
| 500 | ไม่สามารถบันทึกรีวิวหรือคะแนนได้ |

### 11.2 GET `/api/games/{id}/reviews`

ดึงรายการรีวิวของเกม

**Permission:** Public

ตัวอย่าง:

`GET /api/games/1/reviews`

**Response 200 OK**

```json
{
  "status": "success",
  "count": 1,
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "username": "gameuser",
      "game_id": 1,
      "content": "This game is amazing!",
      "rating": 5,
      "status": "visible",
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-01T10:00:00Z"
    }
  ]
}
```

หมายเหตุ:

- แสดงเฉพาะรีวิวที่มีสถานะ `visible`
- เรียงตามวันที่สร้างรีวิวจากใหม่ไปเก่า
- หากไม่มีคะแนนที่เชื่อมโยงกับรีวิว ค่า `rating` ที่ส่งกลับจะเป็น 0

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | รหัสเกมไม่ถูกต้อง |
| 500 | ไม่สามารถดึงข้อมูลรีวิวได้ |

### 11.3 PUT `/api/reviews/{id}`

แก้ไขรีวิวและคะแนนของตนเอง

**Permission:** Member / Admin ที่บัญชี Active

ตัวอย่าง:

`PUT /api/reviews/1`

**Request Body**

```json
{
  "content": "Updated review content",
  "rating": 4
}
```

**การทำงาน**

- ตรวจสอบว่ารีวิวเป็นของผู้ใช้ที่เข้าสู่ระบบ
- แก้ไขข้อความรีวิว
- อัปเดตคะแนนเกม
- ใช้ Transaction ในการบันทึกข้อมูล

**Response 200 OK**

```json
{
  "status": "success",
  "message": "แก้ไขรีวิวและคะแนนสำเร็จ",
  "review_id": 1,
  "game_id": 1,
  "rating": 4
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | รหัสรีวิวหรือข้อมูลไม่ถูกต้อง |
| 401 | ไม่ได้เข้าสู่ระบบ |
| 403 | บัญชีถูกระงับ |
| 404 | ไม่พบรีวิวของผู้ใช้ |
| 500 | ไม่สามารถแก้ไขรีวิวหรือคะแนนได้ |

### 11.4 DELETE `/api/reviews/{id}`

ลบรีวิวและคะแนนของตนเอง

**Permission:** Member / Admin ที่บัญชี Active

ตัวอย่าง:

`DELETE /api/reviews/1`

**การทำงาน**

- ตรวจสอบว่ารีวิวเป็นของผู้ใช้ที่เข้าสู่ระบบ
- ลบข้อมูลรีวิวจาก `game_reviews`
- ลบคะแนนที่เชื่อมโยงกันจาก `game_ratings`
- ใช้ Transaction ในการลบข้อมูล

**Response 200 OK**

```json
{
  "status": "success",
  "message": "ลบรีวิวและคะแนนสำเร็จ",
  "review_id": 1
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | รหัสรีวิวไม่ถูกต้อง |
| 401 | ไม่ได้เข้าสู่ระบบ |
| 403 | บัญชีถูกระงับ |
| 404 | ไม่พบรีวิวของผู้ใช้ |
| 500 | ไม่สามารถลบรีวิวหรือคะแนนได้ |

---

## 12. Game Rating API

ระบบคะแนนเกมรองรับการให้คะแนนและดูคะแนนสรุปของเกม

### 12.1 POST `/api/games/{id}/rating`

ให้คะแนนเกมหรือแก้ไขคะแนนเดิม

**Permission:** Member / Admin ที่บัญชี Active

ตัวอย่าง:

`POST /api/games/1/rating`

**Request Body**

```json
{
  "rating": 5
}
```

**Validation**

- คะแนนต้องเป็นจำนวนเต็มระหว่าง 1–5
- เกมต้องมีอยู่และยังไม่ถูกลบ
- หากผู้ใช้เคยให้คะแนนเกมนี้แล้ว ระบบจะอัปเดตคะแนนเดิมแทนการเพิ่มรายการใหม่

**Response 200 OK**

```json
{
  "status": "success",
  "message": "บันทึกคะแนนสำเร็จ",
  "game_id": 1,
  "rating": 5
}
```

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | รหัสเกมหรือคะแนนไม่ถูกต้อง |
| 401 | ไม่ได้เข้าสู่ระบบ |
| 403 | บัญชีถูกระงับ |
| 404 | ไม่พบเกม |
| 500 | ไม่สามารถบันทึกคะแนนได้ |

### 12.2 GET `/api/games/{id}/rating-summary`

ดึงข้อมูลสรุปคะแนนของเกม

**Permission:** Public

ตัวอย่าง:

`GET /api/games/1/rating-summary`

**Response 200 OK**

```json
{
  "status": "success",
  "data": {
    "game_id": 1,
    "average_rating": 4.5,
    "total_ratings": 10,
    "total_reviews": 8
  }
}
```

ความหมายของข้อมูล:

| Field | Description |
|---|---|
| `game_id` | รหัสเกม |
| `average_rating` | คะแนนเฉลี่ย ปัดทศนิยม 2 ตำแหน่ง |
| `total_ratings` | จำนวนรายการคะแนน |
| `total_reviews` | จำนวนรีวิวที่มีสถานะ `visible` |

หากไม่มีคะแนน ค่า `average_rating` จะเป็น 0

**Error Responses**

| Status Code | รายละเอียด |
|---|---|
| 400 | รหัสเกมไม่ถูกต้อง |
| 404 | ไม่พบเกม |
| 500 | ไม่สามารถดึงข้อมูลสรุปคะแนนได้ |

---

## 13. HTTP Status Code Summary

| Status Code | Meaning | การใช้งานในระบบ |
|---|---|---|
| 200 | OK | ดึงข้อมูลหรือดำเนินการสำเร็จ |
| 201 | Created | สมัครสมาชิกหรือเพิ่มข้อมูลสำเร็จ |
| 400 | Bad Request | ข้อมูลที่ส่งมาไม่ถูกต้อง |
| 401 | Unauthorized | ไม่ได้เข้าสู่ระบบ หรือ Token ไม่ถูกต้อง |
| 403 | Forbidden | ไม่มีสิทธิ์ หรือบัญชีถูกระงับ |
| 404 | Not Found | ไม่พบข้อมูลที่ต้องการ |
| 409 | Conflict | ข้อมูลซ้ำหรือมีข้อขัดแย้ง |
| 500 | Internal Server Error | เกิดข้อผิดพลาดภายใน Backend หรือ Database |

หมายเหตุ: ตารางนี้เป็นภาพรวม ไม่ได้หมายความว่า Endpoint ทุกตัวจะส่งทุก Status Code

---

## 14. Frontend Integration Guidelines

แนวทางการเชื่อมต่อ Frontend กับ Backend

### 14.1 API Base URL

Frontend ควรกำหนด Base URL ผ่าน Environment Variable

ตัวอย่าง:

```env
REACT_APP_API_URL=http://localhost:8080
```

เมื่อ Deploy ให้เปลี่ยนเป็น URL ของ Backend บน Render

### 14.2 การเรียก API ที่ต้องใช้ Token

ตัวอย่าง JavaScript:

```javascript
const token = localStorage.getItem("token");

const response = await fetch(
  `${process.env.REACT_APP_API_URL}/api/me`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
```

### 14.3 การจัดการ Response

Frontend ควรตรวจสอบ `response.ok` ก่อนนำข้อมูลไปใช้งาน และรองรับกรณีที่ Backend ส่ง Error เป็นข้อความธรรมดา

### 14.4 การจัดการ Authentication

- เมื่อ Login สำเร็จ ให้เก็บ JWT Token
- ส่ง Token ไปกับ API ที่ต้องเข้าสู่ระบบ
- เมื่อ Token หมดอายุหรือไม่ถูกต้อง ให้จัดการสถานะการเข้าสู่ระบบ
- ตรวจสอบ Role เพื่อแสดงเมนูและหน้าที่เหมาะสม
- ไม่ควรถือว่าการซ่อนเมนูเป็นการป้องกันสิทธิ์ เพราะ Backend เป็นผู้ตรวจสอบสิทธิ์จริง

### 14.5 การจัดการ CORS

Backend รองรับ CORS ผ่าน Environment Variable:

`ALLOWED_ORIGINS`

สามารถกำหนดหลาย Origin โดยคั่นด้วยเครื่องหมายจุลภาค

ตัวอย่าง:

```env
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

เมื่อ Deploy ต้องกำหนด Origin ของ Frontend ให้ตรงกับ URL ที่ใช้งานจริง

---

## 15. Environment Variables

ตัวแปรแวดล้อมที่เกี่ยวข้องกับการทำงานของ API

| Variable | Description |
|---|---|
| `DATABASE_URL` | Connection String สำหรับเชื่อมต่อ PostgreSQL |
| `JWT_SECRET` | Secret สำหรับลงลายเซ็นและตรวจสอบ JWT |
| `ALLOWED_ORIGINS` | รายการ Origin ที่อนุญาตให้เรียก Backend |

หมายเหตุ: ห้ามเปิดเผยค่าจริงของ Environment Variables หรือ Commit ไฟล์ `.env` ขึ้น Repository

---

## 16. API Design Notes และข้อควรระวัง

1. เกมใช้ Soft Delete ผ่านฟิลด์ `is_deleted` เพื่อให้สามารถกู้คืนเกมได้
2. API เกมทั่วไปจะไม่แสดงเกมที่ถูกลบแล้ว แต่ Admin สามารถดูเกมทั้งหมดได้
3. Library เป็นข้อมูลส่วนตัว ผู้ใช้สามารถจัดการเฉพาะรายการของตนเอง
4. Review และ Rating มีความสัมพันธ์กัน โดยการสร้าง แก้ไข และลบรีวิวจะจัดการคะแนนที่เกี่ยวข้องด้วย
5. การให้คะแนนผ่าน Rating API สามารถเพิ่มหรือแก้ไขคะแนนได้โดยไม่จำเป็นต้องสร้างรีวิว
6. Review ที่มีสถานะ `hidden` จะไม่แสดงใน API สำหรับผู้ใช้ทั่วไป
7. Admin สามารถจัดการสถานะสมาชิกได้เฉพาะบัญชีที่มี Role เป็น `member`
8. การระงับบัญชีจะทำให้ไม่สามารถใช้ API ที่ต้องมีสถานะ Active ได้
9. API ที่เป็น Public ไม่จำเป็นต้องส่ง JWT Token
10. Request และ Response ต้องยึดตาม JSON Field ที่ Backend กำหนด ไม่ควรตั้งชื่อ Field เองโดยไม่ตรวจสอบ

---

## 17. Summary

เอกสารนี้ใช้เป็นข้อตกลงกลางระหว่าง Frontend และ Backend สำหรับการพัฒนา GameHub

Frontend ใช้ API ตาม Endpoint และ Request/Response ที่ระบุไว้ ส่วน Backend รับผิดชอบการตรวจสอบข้อมูล การยืนยันตัวตน การกำหนดสิทธิ์ และการติดต่อฐานข้อมูล

หากมีการเปลี่ยนแปลง Endpoint, JSON Field, Validation หรือรูปแบบ Response ต้องปรับปรุงเอกสารนี้ให้ตรงกับ Backend เวอร์ชันล่าสุดด้วย

**เอกสารอ้างอิง:** GameHub Backend Repository  
https://github.com/Jinwara670710314/gamehub-backend
