# 🎮 GameHub

**GameHub** คือเว็บแอปพลิเคชันสำหรับค้นหาและจัดการคลังเกม ผู้ใช้สามารถเลือกดูรายละเอียดเกม ค้นหาเกมที่สนใจ และจัดการรายการเกมส่วนตัวได้ โดยแบ่งสิทธิ์การใช้งานออกเป็น Guest, Member และ Admin

## ✨ Features

### Guest
- ดูรายการเกมทั้งหมด
- ค้นหาเกม
- ดูรายละเอียดเกม
- สมัครสมาชิกและเข้าสู่ระบบ

### Member
- ใช้งานฟังก์ชันของ Guest ได้ทั้งหมด
- จัดการข้อมูลโปรไฟล์
- เปลี่ยนรหัสผ่าน
- เพิ่มเกมลงใน Wishlist
- จัดการสถานะเกมในคลังส่วนตัว
- ให้คะแนนและเขียนรีวิวเกม
- แก้ไขและลบรีวิวของตนเอง

### Admin
- จัดการข้อมูลเกม เพิ่ม แก้ไข และลบเกม
- กู้คืนเกมที่ถูกลบ
- ดูรายการสมาชิก
- จัดการสถานะบัญชีสมาชิก

## 🛠️ Technologies

### Frontend
- React 19
- React Router DOM 6
- Tailwind CSS 3
- JavaScript
- HTML / CSS

### Backend
- Go (Golang)
- REST API
- JWT Authentication
- bcrypt

### Database
- PostgreSQL
- Supabase

### Deployment
- Frontend: Vercel
- Backend: Render

## 📁 Project Structure

```text
gamehub-frontend/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── data/
│   ├── App.js
│   └── index.js
├── docs/
│   ├── api.md
│   └── db-schema.md
├── package.json
└── README.md
```

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/Jinwara670710314/gamehub-frontend.git
```

เข้าไปยังโฟลเดอร์โปรเจกต์

```bash
cd gamehub-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์หลักของ Frontend และกำหนด URL ของ Backend

```env
REACT_APP_API_URL=http://localhost:8080
```

หากใช้งาน Backend ที่ Deploy บน Render ให้เปลี่ยนค่าเป็น URL ของ Backend ที่ใช้งานจริง

### 4. Run Frontend

```bash
npm start
```

เปิดเว็บไซต์ผ่าน

```text
http://localhost:3000
```

**หมายเหตุ:** การใช้งานระบบที่เชื่อมต่อข้อมูลจริงจำเป็นต้องเปิด Backend และตั้งค่าการเชื่อมต่อฐานข้อมูลให้เรียบร้อยก่อน

## 🔗 Backend Repository

[GameHub Backend](https://github.com/Jinwara670710314/gamehub-backend)

Backend พัฒนาด้วย Go ทำหน้าที่จัดการ API การยืนยันตัวตน การจัดการเกม สมาชิก คลังเกม รีวิว และคะแนน โดยเชื่อมต่อกับฐานข้อมูล PostgreSQL บน Supabase

## 📚 Documentation

เอกสารประกอบการพัฒนาโปรเจกต์

- **API Documentation:** [`docs/api.md`](docs/api.md) — รายละเอียด API endpoints และการรับส่งข้อมูลระหว่าง Frontend กับ Backend
- **Database Schema:** [`docs/db-schema.md`](docs/db-schema.md) — โครงสร้างฐานข้อมูล ตาราง และความสัมพันธ์ของข้อมูล

## ☁️ Deployment

โปรเจกต์แบ่งการ Deploy ออกเป็น 2 ส่วน

- **Frontend:** Deploy บน Vercel
- **Backend:** Deploy บน Render และเชื่อมต่อฐานข้อมูล PostgreSQL บน Supabase

สำหรับการใช้งานบน Production ต้องกำหนด Environment Variables ให้ตรงกับระบบที่ Deploy และอนุญาต Frontend URL ในการตั้งค่า CORS ของ Backend

---

**GameHub — Your Game Collection, All in One Place.** 🎮