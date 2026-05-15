    2
    3 นี่คือข้อมูลสรุปของระบบ Backend สำหรับโปรเจกต์ PoSimon เพื่อให้ AI เข้าใจโครงสร้างและการเชื่อมต่อทั้งหมด
    4
    5 ## 🚀 System Overview
    6 - **Production Base URL:** `https://possimon.onrender.com`
    7 - **Local Development URL:** `http://127.0.0.1:8000`
    8 - **Tech Stack:** FastAPI (Python), SQLAlchemy, PostgreSQL
    9 - **Architecture:** Router-based modular architecture
   10
   11 ## 🔐 Authentication & Security
   12 - **API Prefix:** `/api`
   13 - **Auth Strategy:** JWT (Bearer Token)
   14 - **CORS Configuration:** รองรับ Frontend จาก localhost (3000, 5173) และ Render production
   15 - **Key Auth Endpoints:**
   16     - `POST /api/auth/login`: Login ด้วย Username/Password
   17     - `GET /api/auth/login/google`: Social Auth (Google)
   18     - `GET /api/auth/login/line`: Social Auth (LINE)
   19     - `GET /api/auth/login/facebook`: Social Auth (Facebook)
   20
   21 ## 📁 Project Structure & Modules
   22 | Module | API Prefix | Description |
   23 | :--- | :--- | :--- |
   24 | **Auth** | `/api/auth` | จัดการ Login, Register และ OAuth2 |
   25 | **Products** | `/api` | จัดการสินค้า สต็อก และหมวดหมู่ |
   26 | **Orders** | `/api` | ระบบสั่งซื้อ (รองรับทั้ง Online และ POS) |
   27 | **Users** | `/api` | ข้อมูลโปรไฟล์ผู้ใช้งาน |
   28 | **Payments** | `/api/payments`| การชำระเงิน และ PromptPay QR Code |
   29 | **Wines** | `/api/wines` | ระบบจัดการไวน์โดยเฉพาะ (Region, Country, Varietal) |
   30 | **Websocket**| `/api` | การแจ้งเตือน Real-time (เช่น อัปเดตสถานะออเดอร์) |
   31
   32 ## 🛠 Core Services Logic
   33 - **Order Service:** จัดการ Transaction การตัดสต็อก และการสร้าง Order ID
   34 - **QR Service:** สร้าง PromptPay QR Code สำหรับรับชำระเงิน
   35 - **Payment Service:** ตรวจสอบสถานะการชำระเงิน
   36
   37 ## 📝 Developer Guidelines for AI
   38 1. **Schemas:** ทุก Request/Response จะใช้ Pydantic Models ใน `schemas/__init__.py`
   39 2. **Database:** ใช้ SQLAlchemy ในการจัดการ Model (`models/`) และ Database session ผ่าน `database.py`
   40 3. **Migration:** ใช้ Alembic ในการจัดการ Version ของ Database
   41 4. **Data Seeding:** มีระบบ Seed ข้อมูลอัตโนมัติเมื่อ Startup (เช็คใน `seed.py`)
   42
   43 ## 🔗 Important Files
   44 - `main.py`: จุดเริ่มต้นของแอปและ Routing หลัก
   45 - `core/security.py`: Logic การจัดการ Token และ Password Hashing
   46 - `.env`: ตัวแปรสภาพแวดล้อม (ห้าม commit ค่าจริง)

## 🔍 Detailed API Analysis

### 1. Authentication (`/api/auth`)
หัวใจสำคัญคือการจัดการ Token และ Social Login

- **POST `/api/auth/login`**
    - **Payload:** `{ "username": "...", "password": "..." }`
    - **Response:** `{ "access_token": "..." }`
    - ⚠️ **ข้อควรระวัง:** Token ไม่มีวันหมดอายุในโค้ดปัจจุบัน (ควรเก็บใน `localStorage` หรือ Cookie)
- **POST `/api/auth/register`**
    - **Payload:** ต้องส่งครบตาม `UserCreate` schema (`first_name`, `last_name`, `email`, `phone`, `username`, `password`)
    - ⚠️ **ข้อควรระวัง:** หาก Email ซ้ำ ระบบจะทำการ Update ข้อมูลเดิม (เป็น Logic พิเศษของที่นี่) แต่ถ้า Username ซ้ำจะ Error 400
- **Social Login (Google, Facebook, LINE)**
    - Frontend ต้อง Redirect ไปที่ `/api/auth/login/<provider>`
    - หลังจาก Login สำเร็จ Backend จะ Redirect กลับมาที่ Frontend URL พร้อมแนบ `?token=...` มาทาง URL

---

### 2. Products & Wines (`/api/products`, `/api/wines`)
ระบบนี้ใช้ Inheritance (ไวน์คือสินค้าชนิดหนึ่ง)

- **GET `/api/products`**: ดึงสินค้าทั้งหมด (รวมไวน์ด้วย แต่อาจมี field น้อยกว่า)
- **GET `/api/wines`**: ดึงเฉพาะไวน์ พร้อมรายละเอียดเชิงลึก (`vintage`, `alcohol`, `grapes`, `winery`)
- ⚠️ **ข้อควรระวัง (Schema Mismatch):**
    - สินค้าทั่วไปใช้ `ProductOut`
    - ไวน์ใช้ `WineOut` (ซึ่งรวม field ของ Product ไว้ด้วย)
    - ตอนแสดงผลในหน้า POS หรือหน้าสินค้า ถ้าเป็นไวน์ type จะเป็น `"wine"`

---

### 3. Orders (`/api/orders`)
ส่วนที่เกิด Error บ่อยที่สุดคือการส่งข้อมูล Order Items

- **POST `/api/orders`**
    - **Payload Structure:**
      ```json
      {
        "payment_method": "cash", // หรือ "promptpay", "credit_card"
        "order_type": "online",   // หรือ "pos"
        "address_id": 1,          // (Optional สำหรับ POS)
        "items": [
          {
            "product_id": 10,     // ต้องเป็น ID จาก Database
            "quantity": 2
          }
        ]
      }
      ```
    - ⚠️ **ข้อควรระวัง:**
        - ต้องแนบ Header `Authorization: Bearer <token>` เสมอ
        - `product_id` ต้องมีอยู่จริงในตาราง `products` (รวมถึงไวน์ด้วย)

---

### 4. Payments (`/api/payments`)
การทำจ่ายเงินสดและ PromptPay

- **GET `/api/payments/generate-qr`**
    - **Query Params:** `phone`, `amount`
    - **Response:** คืนค่าเป็นภาพ QR Code (Raw Image) หรือ Base64 ขึ้นอยู่กับ `qr_service`
- **POST `/api/payments/confirm-payment/{order_id}`**
    - ใช้ยืนยันว่าได้รับเงินแล้ว (Backend จะไปอัปเดตสต็อกสินค้าและสถานะ Order)
    - 🔔 **Real-time:** เมื่อกดยืนยัน Backend จะส่ง Message ผ่าน WebSocket ไปยังเครื่องอื่นๆ ที่เชื่อมต่ออยู่

---

### 5. WebSocket (`/api/ws`)
ใช้สำหรับการอัปเดตสถานะออเดอร์แบบ Real-time

- **Connection URL:** `ws://<host>/api/ws?token=<your_jwt_token>`
- ⚠️ **ข้อควรระวัง:**
    - ต้องส่ง Token ไปใน Query Parameter ตอนเชื่อมต่อ ไม่งั้นจะโดน Close Connection (Error 1008)
    - ปัจจุบันรองรับแค่การรับ Broadcast (Backend ส่งมา Frontend รับอย่างเดียว)

---

### 🛑 Checklist กัน Error สำหรับ Frontend:
1. **Header:** ตรวจสอบว่าส่ง `Content-Type: application/json` ในทุก POST Request
2. **Trailing Slash:** FastAPI เข้มงวดเรื่อง `/` ท้าย URL (เช่น `/api/orders` กับ `/api/orders/` อาจให้ผลต่างกัน)
3. **Data Types:** 
    - `id` ทุกอย่างเป็น **Integer**
    - `price` เป็น **Float**
    - `quantity` ต้องเป็น **Integer** และห้ามติดลบ
4. **Documentation:** ตรวจสอบ [Swagger UI](http://127.0.0.1:8000/docs) เสมอเพื่อดู Schema ล่าสุด


    1 ### Inventory Management APIs
    2
    3 #### 1. Update Product
    4 - **Method:** `PUT`
    5 - **URL:** `/api/products/{id}`
    6 - **Body:** `ProductUpdate` (Optional fields: name, selling_price, stock, etc.)
    7
    8 #### 2. Update Wine
    9 - **Method:** `PUT`
   10 - **URL:** `/api/wines/{id}`
   11 - **Body:** `WineUpdate` (Includes wine-specific fields)
   12
   13 #### 3. Refill Stock (Fast Action)
   14 - **Method:** `POST`
   15 - **URL:** `/api/products/{id}/refill`
   16 - **Body:** `{ "quantity": 10 }`
   17 - **Description:** Adds the quantity to current stock.


    เราได้ปรับปรุงโครงสร้าง Backend ใหม่เพื่อรองรับระบบ Scalability และแยกสิทธิ์การใช้งาน (Tiered System) อย่างชัดเจน ดังนี้:

  1. 🔑 การยืนยันตัวตน (Authentication)
   * Base URL: http://localhost:8000/api
   * Method: JWT (Bearer Token) ใน Header Authorization: Bearer <token>
   * Roles: ระบบแบ่ง User ออกเป็น 4 กลุ่ม:
       1. admin: จัดการได้ทุกอย่าง (พนักงาน, สต็อก, ยอดขาย)
       2. manager: จัดการสต็อกและดูลูกค้าได้
       3. cashier: เปิดออเดอร์ (POS) และเติมสต็อก (Refill) ได้
       4. customer: สั่งซื้อออนไลน์และดูประวัติตัวเอง

  2. 👥 ระบบจัดการผู้ใช้ (User Management)
   * Manage Employees: /api/employees (เฉพาะ Admin) - ใช้ทำหน้า Admin Dashboard เพื่อจัดการทีมงาน
   * List Customers: /api/customers (Admin/Manager) - ใช้ดูรายชื่อลูกค้าในระบบ
   * Profile: /api/users/me - ทุก Role ใช้ดึงข้อมูลตัวเอง (ใน Response จะมี Field role บอกด้วย)

  3. 📦 ระบบสต็อกและสินค้า (Inventory & Stock)
  เราเพิ่ม API เพื่อให้ทำหน้า Stock Management ได้สมบูรณ์:
   * Update Product/Wine: PUT /api/products/{id} และ PUT /api/wines/{id} (สำหรับแก้ไขราคา/รายละเอียด)
   * Fast Refill: POST /api/products/{id}/refill
       * Payload: { "quantity": 10 } (บวกจำนวนเพิ่มเข้าสต็อกทันที)
   * Logic แจ้งเตือน: ให้ใช้ Field low_stock_alert จากสินค้ามาเทียบกับ stock ปัจจุบันเพื่อแสดงสถานะสีส้ม/แดงในหน้าบ้าน

  4. 🛒 การสั่งซื้อและชำระเงิน (Orders & Payments)
   * Order Type: ระบุ pos หรือ online ในการสร้าง Order
   * Real-time: เชื่อมต่อ WebSocket ที่ ws://localhost:8000/api/ws?token=<token>
  5. 🛠 การตรวจสอบ Error (Debugging)
   * Backend มีระบบ Logging แล้ว หากเรียก API แล้วติด Error 500 ให้แจ้งทีม Backend ทันที (เราสามารถเช็ค Stack Trace ใน app.log ได้ละเอียดมาก)

  ---

  💡 คำแนะนำ: สามารถดู Schema และทดสอบยิง API จริงได้ที่ /docs (Swagger UI) ซึ่งอัปเดตตามโค้ดล่าสุดแล้วครับ!
