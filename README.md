# Mini Task API (RESTful API ด้วย Express + MySQL)

โปรเจกต์นี้เป็นงานกลุ่มรายวิชา **88734065 – Mini Task API**  
เป็นระบบจัดการงาน (Task Management System) ที่พัฒนาโดยใช้ **Node.js (Express.js)** และ **ฐานข้อมูล MySQL**

---

## ภาพรวมโปรเจกต์

Mini Task API มีหน้าที่จัดการผู้ใช้ (Users) และงาน (Tasks) พร้อมระบบควบคุมสิทธิ์การเข้าถึง (RBAC/ABAC)  
รองรับการทำงานของระบบ API อย่างครบถ้วน เช่น Authentication, Authorization, Rate Limiting, Idempotency และ Error Handling

---

## เทคโนโลยีที่ใช้

- **Node.js** + **Express.js** – สำหรับสร้าง RESTful API  
- **MySQL** – สำหรับเก็บข้อมูลผู้ใช้และงาน  
- **JWT (JSON Web Token)** – สำหรับระบบล็อกอินและยืนยันตัวตน  
- **bcrypt.js** – สำหรับเข้ารหัสรหัสผ่าน  
- **express-rate-limit** – จำกัดจำนวนคำขอของแต่ละผู้ใช้  
- **dotenv** – จัดการค่า environment variables  

---

## โครงสร้างโปรเจกต์

```
        src
        │   app.js
        │   server.js
        │
        ├───config
        │       db.js
        │
        ├───controllers
        │       auth.controller.js
        │       task.controller.js
        │       user.controller.js
        │
        ├───middlewares
        │       authenticate.js
        │       authorize.js
        │       checkTaskAccess.js
        │       errorHandler.js
        │       idempotency.js
        │       rateLimit.js
        │
        ├───models
        │       idempotency.model.js
        │       task.model.js
        │       user.model.js
        │
        ├───routes
        │       auth.routes.js
        │       task.v1.routes.js
        │       task.v2.routes.js
        │       test.routes.js
        │       user.routes.js
        │
        └───utils
                jwt.js
                validation.js
```

---

## ขั้นตอนการรันโปรเจกต์ด้วย Docker compose

1. ตรวจสอบว่ามี Docker และ Docker Compose แล้ว
- Docker Desktop (Windows / macOS)

ตรวจสอบด้วยคำสั่ง:

docker -v
docker compose version

---

2. รันระบบด้วย Docker Compose

docker compose up -d

เมื่อระบบเริ่มทำงานเสร็จ:
- API: http://localhost:3000/api/v1/tasks  
- Database: localhost:3306 (user: taskuser, pass: taskpass)

---

3. หยุดระบบ

docker compose down

หากต้องการลบข้อมูลฐานข้อมูลทั้งหมด:

docker compose down -v

---

4. ตรวจสอบสถานะ container
bash
docker compose ps

## ขั้นตอนการติดตั้ง (Installation)

1. **โคลนโปรเจกต์จาก GitHub**
   ```bash
   git clone https://github.com/Fluxseafood/mini-task-api.git
   cd mini-task-api
   ```

2. **ติดตั้ง dependencies**
   ```bash
   npm install
   ```

3. **ตั้งค่าฐานข้อมูล MySQL**
   - สร้างฐานข้อมูลใหม่ เช่น `mini_task_db`
   - สร้างไฟล์ `.env`
   - แก้ค่าตามเครื่องของคุณ เช่น
     ```
    PORT=3000
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=taskuser
    DB_PASSWORD=taskpass
    DB_NAME=taskdb

    JWT_ACCESS_SECRET=replace_with_access_secret
    JWT_REFRESH_SECRET=replace_with_refresh_secret
    ACCESS_TOKEN_EXPIRES_IN=900
    REFRESH_TOKEN_EXPIRES_IN=604800
     ```

4. **รันโปรเจกต์**
   ```bash
   npm start
   ```

5. **เปิดใช้งานในเบราว์เซอร์หรือ Postman**
   ```
   http://localhost:3000/api/v1/tasks
   ```

---


## ฟีเจอร์หลักของระบบ

### 1. Authentication (JWT)
- ลงทะเบียนผู้ใช้ใหม่  
- เข้าสู่ระบบและรับ access/refresh token  
- ต่ออายุ token (refresh token)  
- ออกจากระบบ (logout)

### 2. Authorization (RBAC + ABAC)
- **RBAC**: role แบ่งเป็น `user`, `premium`, `admin`  
- **ABAC**: ตรวจสอบสิทธิ์จากคุณสมบัติ เช่น owner, assignee, isPublic  

### 3. Task Management (CRUD)
- สร้าง / อ่าน / แก้ไข / ลบ งาน  
- รองรับการกรอง (`status`, `priority`, `isPublic`, `assignedTo`)  
- รองรับ **Versioning**: `/api/v1/tasks` และ `/api/v2/tasks`

### 4. Rate Limiting
- จำกัดจำนวนการเรียก API ต่อ 15 นาที  
  - Anonymous: 20  
  - User: 100  
  - Premium: 500  

### 5. Idempotency
- สำหรับ `POST /tasks` เพื่อป้องกันการสร้างซ้ำ  
- ตรวจสอบ header `Idempotency-Key`  

### 6. Error Handling
- รูปแบบการตอบกลับมาตรฐาน  
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid input data"
    }
  }
  ```

---

## ตัวอย่างการใช้งาน API

### สมัครสมาชิก
```
POST /api/v1/auth/register
{
  "email": "user@test.com",
  "password": "password123",
  "name": "Test User"
}
```

### เข้าสู่ระบบ
```
POST /api/v1/auth/login
{
  "email": "user@test.com",
  "password": "password123"
}
```

### ดูรายการงานทั้งหมด
```
GET /api/v1/tasks
Headers: { "Authorization": "Bearer ACCESS_TOKEN" }
```

### สร้างงานใหม่
```
POST /api/v1/tasks
Headers: { "Authorization": "Bearer ACCESS_TOKEN", "Idempotency-Key": "uuid-v4" }
Body:
{
  "title": "Fix bug",
  "description": "resolve login issue",
  "priority": "high"
}
```