# 🍷 PoSimon Frontend - Cashier & Management System

นี่คือเอกสารสรุปความสามารถของระบบ Frontend (PoSimon) เพื่อให้ทีมพัฒนาและ AI เข้าใจฟังก์ชันการทำงานทั้งหมดอย่างละเอียด

## 🌟 Core Features (ความสามารถหลัก)

### 1. 🔐 Authentication System (ระบบสมาชิกและสิทธิ์)
- **Multi-Role Support:** แบ่งสิทธิ์การใช้งานเป็น 4 ระดับ (Admin, Manager, Cashier, Customer)
- **Google Login (New Flow):** รองรับการ Login ผ่าน Google โดยใช้ระบบ Redirect และ HttpOnly Cookies (ปลอดภัยสูงสุด)
- **Traditional Login:** รองรับการเข้าสู่ระบบด้วย Username/Password สำหรับพนักงาน
- **Session Management:** มีระบบตรวจสอบ Session อัตโนมัติเมื่อ Refresh หน้าจอ (ผ่าน `useAuthStore`)
- **Protected Routes:** ระบบป้องกันการเข้าถึงหน้าที่ไม่ได้รับอนุญาตตาม Role ของผู้ใช้

### 2. 🛒 POS Terminal (จุดขายหน้าร้าน)
- **Product Catalog:** แสดงรายการสินค้าพร้อมรูปภาพ แยกตามหมวดหมู่ (สินค้าทั่วไป และ ไวน์)
- **Advanced Search:** ค้นหาสินค้าได้รวดเร็วตามชื่อ หรือสแกน Barcode (ในอนาคต)
- **Real-time Cart:** ระบบตะกร้าสินค้าที่คำนวณราคารวม ภาษี และส่วนลดแบบเรียลไทม์
- **Checkout Workflow:** 
    - รองรับการชำระเงินหลายรูปแบบ (Cash, PromptPay QR Code, Credit Card)
    - ระบบสร้าง PromptPay QR Code อัตโนมัติจากยอดเงินจริง
    - ตรวจสอบสถานะการชำระเงินก่อนยืนยันออเดอร์
- **Shift Management:** ระบบเปิด-ปิดกะสำหรับพนักงานเพื่อควบคุมยอดเงินสด

### 3. 📦 Inventory Management (ระบบสต็อกสินค้า)
- **Stock Dashboard:** ดูรายการสินค้าทั้งหมด พร้อมสถานะจำนวนสต็อก
- **Low Stock Alerts:** แสดงสัญลักษณ์เตือน (สีส้ม/แดง) เมื่อสินค้าใกล้หมดตามเกณฑ์ `low_stock_alert`
- **Fast Refill:** ระบบเติมสต็อกแบบเร่งด่วน (Input จำนวนแล้วบวกเข้าสต็อกทันที)
- **Product Detail Editing:** แก้ไขข้อมูลสินค้า ราคา และรายละเอียดเชิงลึกของไวน์ (Region, Vintage, Winery)

### 4. 📊 Order History (ประวัติการสั่งซื้อ)
- **Order Tracking:** ดูรายการคำสั่งซื้อทั้งหมด แบ่งตามสถานะ (Pending, Paid, Completed)
- **Real-time Updates:** รับการแจ้งเตือนเมื่อมีการอัปเดตสถานะออเดอร์ผ่าน WebSocket
- **Filter & Search:** ค้นหาออเดอร์ตามเลขที่ หรือกรองตามวันที่และประเภท (POS/Online)

### 5. 👥 Customer Management (การจัดการลูกค้า)
- **Customer Directory:** รายชื่อลูกค้าทั้งหมดในระบบ พร้อมประวัติการติดต่อ
- **Membership Status:** แสดงระดับสมาชิก (ถ้ามี) เพื่อใช้ในการคำนวณส่วนลด

### 6. 👑 Admin Dashboard (ระบบหลังบ้านสำหรับผู้บริหาร)
- **Business Overview:** กราฟและข้อมูลสรุปยอดขาย (Daily/Monthly)
- **Employee Management:** เพิ่ม/ลบ/แก้ไข ข้อมูลพนักงานและสิทธิ์การใช้งาน

---

## 🛠 Tech Stack (เทคโนโลยีที่ใช้)

- **Framework:** React 18 (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Dark Theme focus)
- **State Management:** Zustand
- **API Client:** Axios (with Interceptors for Auth)
- **Icons:** Lucide React
- **Deployment:** Vercel

---

## 📁 Project Structure (โครงสร้างไฟล์ที่สำคัญ)

- `/src/components/pos`: ส่วนประกอบหลักของหน้าขาย (Cart, ProductCard, Search)
- `/src/pages`: หน้าจอหลักทั้งหมด (POS, Inventory, Orders, Login)
- `/src/store`: ระบบจัดการ State (Auth, Cart)
- `/src/services`: การเชื่อมต่อ API (แบ่งตาม Module)
- `/src/types`: TypeScript Interfaces สำหรับข้อมูลทั้งหมด

---

## 📝 Developer Guidelines

1. **Theming:** ใช้โทนสี Dark Mode (`#070606`) และสีทอง (`#d6b66b`) เป็นหลักเพื่อให้ดู Luxury
2. **API Calls:** เรียกผ่าน `api.ts` เสมอ และต้องตั้งค่า `withCredentials: true` เพื่อส่ง Cookie
3. **Responsiveness:** หน้า POS ต้องรองรับการใช้งานผ่าน Tablet และ Desktop เป็นหลัก
4. **Security:** ห้ามเก็บ Password หรือ Sensitive Data ลงใน LocalStorage โดยเด็ดขาด
