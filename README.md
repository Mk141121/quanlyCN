# 📋 Phiếu Thu Chi - ERP System (Theo SPEC 100%)

> ⚠️ **Được xây dựng theo TECHNICAL SPEC: FORM THU - CHI ERP (AR/AP CORE).md**  
> **KHÔNG TỰ SUY DIỄN - TUÂN THỦ 100% SPEC**

## 🏗 CẤU TRÚC THEO SPEC

### Thiết kế Master-Detail
Form được thiết kế để kiểm soát chứng từ gốc (Payment Proposal hoặc AR Document).

#### Màu sắc trạng thái (theo spec):
- **CHO_THANH_TOAN**: Màu **Vàng** (Cảnh báo/Chờ đợi)
- **DA_THANH_TOAN**: Màu **Xanh** (Hoàn tất/An toàn)

#### Thành phần Form:
1. **Header**: Thông tin đối tượng (NCC/Khách hàng), Mã chứng từ gốc (PP-ID hoặc AR-ID)
2. **Body**: Danh sách các Đơn hàng (PO/SO) nằm trong chứng từ để đối soát
3. **Footer**: Phương thức thanh toán, Upload Bill, Tổng tiền, Nút xác nhận

---

## ⚙️ LOGIC XỬ LÝ (CORE LOGIC)

### 2.1. Quy tắc bắt buộc (Hard Rules)

#### ✅ Validation
- Nếu `phuongThuc == 'CHUYEN_KHOAN'`, field `billImage` là **BẮT BUỘC**
- Hệ thống chặn lưu và báo lỗi nếu trống

#### 🔒 Locking
- Khi Phiếu chi/thu được tạo, các đơn hàng (Dathang/Donhang) liên quan bị **KHÓA HOÀN TOÀN**
- Không cho phép sửa/xóa

### 2.2. Cơ chế Cascade Update (Transaction)

Khi bấm **XÁC NHẬN THANH TOÁN**, hệ thống thực hiện các bước sau trong một Transaction:

1. ✅ Cập nhật `PhieuThuChi` → `DA_THANH_TOAN`
2. ✅ Cập nhật Chứng từ gốc (`PaymentProposal` hoặc `ARDocument`) → `DA_THANH_TOAN`
3. ✅ Cập nhật toàn bộ Đơn hàng liên quan (`poStatus` hoặc `soStatus`) → `DA_THANH_TOAN`
4. ✅ Khấu trừ số dư công nợ trực tiếp của Nhà cung cấp/Khách hàng

---

## 🧪 MOCK DATA (THEO SPEC)

### 3.1. Đề xuất thanh toán (Nhánh Mua - AP)
```json
{
  "id": "pp-001",
  "maDeXuat": "DXTT-2026-001",
  "doiTuong": "Công ty Phân bón Xanh",
  "totalAmount": 50000000,
  "status": "CHO_THANH_TOAN",
  "items": [
    { "id": "po-001", "maDon": "PO-888", "amount": 20000000 },
    { "id": "po-002", "maDon": "PO-889", "amount": 30000000 }
  ]
}
```

### 3.2. Chứng từ công nợ (Nhánh Bán - AR)
```json
{
  "id": "ar-001",
  "maChungTu": "AR-2026-999",
  "doiTuong": "Cửa hàng Thực phẩm Sạch A",
  "totalAmount": 15000000,
  "status": "CHO_THU_TIEN",
  "items": [
    { "id": "so-001", "maDon": "SO-111", "amount": 15000000 }
  ]
}
```

### 3.3. Phiếu Thu/Chi (Model chuẩn)
```json
{
  "id": "pv-001",
  "loaiPhieu": "CHI",
  "ngayLap": "2026-01-07",
  "phuongThuc": "CHUYEN_KHOAN",
  "soTien": 50000000,
  "billImage": "https://example.com/bill-001.jpg",
  "status": "DA_THANH_TOAN",
  "refId": "pp-001"
}
```

---

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js >= 16
- npm hoặc yarn

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Chạy development server
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

---

## 📁 Cấu trúc dự án

```
form-thu-chi/
├── src/
│   ├── components/
│   │   ├── DocumentSelector.jsx      # Chọn chứng từ (PP/AR)
│   │   ├── PhieuThuChiForm.jsx       # Form Master-Detail
│   │   └── *.css
│   ├── utils/
│   │   └── mockAPISpec.js            # Mock data theo SPEC 100%
│   ├── App.jsx
│   └── main.jsx
├── TECHNICAL SPEC: FORM THU - CHI ERP (AR/AP CORE).md  ⭐
└── package.json
```

---

## 🎯 Luồng sử dụng

### Bước 1: Chọn loại phiếu
- **💳 Phiếu Chi (AP)**: Hiển thị danh sách Payment Proposals
- **💰 Phiếu Thu (AR)**: Hiển thị danh sách AR Documents

### Bước 2: Chọn chứng từ
- Click "Chọn" trên chứng từ có status `CHO_THANH_TOAN` (màu vàng)
- Chứng từ `DA_THANH_TOAN` (màu xanh) bị disable

### Bước 3: Xem chi tiết & đối soát
- **Header**: Thông tin đối tượng, mã chứng từ, tổng tiền
- **Body**: Danh sách đơn hàng (PO/SO) với số tiền chi tiết
- **Footer**: Chọn phương thức thanh toán

### Bước 4: Upload Bill (nếu chuyển khoản)
- Nếu chọn "Chuyển khoản" → **BẮT BUỘC** upload ảnh Bill
- Nếu không upload → Báo lỗi, không cho xác nhận

### Bước 5: Xác nhận thanh toán
- Click "✅ XÁC NHẬN THANH TOÁN"
- **CASCADE UPDATE** tự động:
  - Phiếu thu chi → `DA_THANH_TOAN`
  - Chứng từ gốc → `DA_THANH_TOAN`
  - Tất cả PO/SO → `DA_THANH_TOAN`
  - Trừ công nợ

---

## 🧪 Test Scenarios

### ✅ Scenario 1: Phiếu chi - Tiền mặt
1. Chọn "Phiếu Chi (AP)"
2. Chọn chứng từ `DXTT-2026-001` (50M)
3. Chọn "Tiền mặt"
4. Click "Xác nhận thanh toán"
5. **Kết quả**: SUCCESS - Cascade update 4 tầng

### ⚠️ Scenario 2: Phiếu chi - Chuyển khoản KHÔNG upload
1. Chọn "Phiếu Chi (AP)"
2. Chọn chứng từ `DXTT-2026-002` (35M)
3. Chọn "Chuyển khoản"
4. **KHÔNG** upload Bill
5. Click "Xác nhận thanh toán"
6. **Kết quả**: ❌ ERROR - "Thanh toán chuyển khoản bắt buộc phải upload Bill!"

### ✅ Scenario 3: Phiếu thu - Chuyển khoán CÓ upload
1. Chọn "Phiếu Thu (AR)"
2. Chọn chứng từ `AR-2026-999` (15M)
3. Chọn "Chuyển khoản"
4. Upload ảnh Bill
5. Click "Xác nhận thanh toán"
6. **Kết quả**: SUCCESS - Cascade update 4 tầng

---

## 🔌 Backend Integration

### API Endpoints cần có:

```javascript
// 1. Lấy Payment Proposals
GET /api/payment-proposals?status=CHO_THANH_TOAN

// 2. Lấy AR Documents
GET /api/ar-documents?status=CHO_THU_TIEN

// 3. Lấy chi tiết 1 Payment Proposal
GET /api/payment-proposals/:id

// 4. Lấy chi tiết 1 AR Document
GET /api/ar-documents/:id

// 5. Tạo Phiếu Thu Chi + Cascade Update
POST /api/phieu-thu-chi
{
  "loaiPhieu": "CHI",
  "phuongThuc": "CHUYEN_KHOAN",
  "soTien": 50000000,
  "billImage": "base64...",
  "refId": "pp-001",
  "refType": "PaymentProposal"
}
```

### Transaction Backend (Prisma example):
```javascript
const result = await prisma.$transaction(async (tx) => {
  // 1. Create PhieuThuChi
  const phieu = await tx.phieuThuChi.create({ data })
  
  // 2. Update PaymentProposal/ARDocument
  await tx.paymentProposal.update({
    where: { id: refId },
    data: { status: 'DA_THANH_TOAN' }
  })
  
  // 3. Update all PO items
  await tx.purchaseOrder.updateMany({
    where: { paymentProposalId: refId },
    data: { poStatus: 'DA_THANH_TOAN' }
  })
  
  // 4. Deduct debt
  await tx.supplier.update({
    where: { id: supplierId },
    data: { debt: { decrement: amount } }
  })
  
  return phieu
})
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 🔴 KHÔNG dùng độc lập
Giao diện này **PHẢI** tích hợp với backend ERP để:
- Load danh sách Payment Proposal / AR Document thực tế
- Thực hiện Cascade Update Transaction
- Lock đơn hàng sau khi thanh toán

### 🔴 Hard Rules
1. **Validate upload Bill**: Server PHẢI kiểm tra lại
2. **Transaction Atomicity**: 4 bước phải thành công hoặc rollback toàn bộ
3. **Locking mechanism**: Đơn hàng đã thanh toán KHÔNG được sửa/xóa

---

## 📄 License

MIT License

---

**⚡ Xây dựng theo TECHNICAL SPEC - Không tự suy diễn**

## ✨ Tính năng chính

### 1️⃣ Form nhập phiếu thu/chi
- ✅ Toggle giữa Phiếu thu / Phiếu chi
- ✅ Nhập số tiền với format VND
- ✅ Chọn đối tượng: Khách hàng / Nhà cung cấp
- ✅ Tìm kiếm đối tác với autocomplete
- ✅ Phương thức thanh toán: Tiền mặt / Chuyển khoản
- ✅ Đánh dấu có hóa đơn
- ✅ Nhập lý do và ghi chú

### 2️⃣ Tích hợp công nợ AR/AP (ERP Core)
- ✅ **Auto load công nợ** khi chọn khách hàng/NCC
- ✅ **Popup chọn chứng từ** AR (Chờ thu) / AP (Chờ chi)
- ✅ Hiển thị danh sách chứng từ đang chờ xử lý
- ✅ Chọn nhiều chứng từ để thanh toán
- ✅ Hiển thị tổng công nợ còn lại

### 3️⃣ Validation & Business Rules
- ⚠️ **Không cho vượt công nợ**: Disable nút submit nếu số tiền > số dư công nợ
- ⚠️ **Bắt buộc upload**: Nếu chuyển khoản phải upload chứng từ
- ⚠️ **Cảnh báo trực quan**: Alert hiển thị các lỗi/cảnh báo realtime
- ⚠️ **Disable submit**: Nút "Tạo mới" bị disable khi có lỗi

### 4️⃣ Upload chứng từ
- 📎 Upload file chứng từ chuyển khoản (bắt buộc khi thanh toán chuyển khoản)
- 📎 Giới hạn kích thước file < 10MB
- 📎 Preview danh sách file đã upload

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js >= 16
- npm hoặc yarn

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Chạy development server
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

### Bước 3: Build production
```bash
npm run build
```

## 📁 Cấu trúc dự án

```
form-thu-chi/
├── src/
│   ├── components/
│   │   ├── ReceiptPaymentForm.jsx    # Form chính
│   │   ├── ReceiptPaymentForm.css
│   │   ├── ARAPModal.jsx              # Modal chọn AR/AP documents
│   │   └── ARAPModal.css
│   ├── utils/
│   │   └── mockAPI.js                 # Mock API (thay bằng real API)
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

## 🔌 Tích hợp Backend

### API Endpoints cần có:

#### 1. Lấy danh sách đối tác
```javascript
GET /api/partners?type=KHACH_HANG
GET /api/partners?type=NHA_CUNG_CAP

Response: [
  { id: "KH001", code: "KH001", name: "Công ty ABC", type: "KHACH_HANG" }
]
```

#### 2. Lấy thông tin công nợ
```javascript
GET /api/partners/:id/debt

Response: {
  partnerId: "KH001",
  balance: 50000000,
  currency: "VND"
}
```

#### 3. Lấy AR/AP documents
```javascript
GET /api/ar-ap/:partnerId?status=CHO_THU
GET /api/ar-ap/:partnerId?status=CHO_CHI

Response: [
  {
    id: "AR001",
    code: "HD-2024-001",
    date: "2024-01-15",
    documentType: "INVOICE",
    totalAmount: 50000000,
    paidAmount: 0,
    remainingAmount: 50000000,
    status: "CHO_THU"
  }
]
```

#### 4. Tạo phiếu thu/chi
```javascript
POST /api/receipt-payment

Body: {
  type: "THU",
  amount: 50000000,
  objectType: "KHACH_HANG",
  partnerId: "KH001",
  paymentMethod: "CHUYEN_KHOAN",
  hasInvoice: true,
  reason: "Thu tiền hóa đơn",
  note: "Ghi chú",
  documents: ["AR001"],
  attachments: ["file1.pdf"]
}

Response: {
  id: "PT-2024-001",
  status: "PENDING_APPROVAL",
  createdAt: "2024-01-07T10:00:00Z"
}
```

### Thay thế Mock API

File `src/utils/mockAPI.js` chứa mock data. Thay thế bằng real API:

```javascript
// Trước (Mock):
import { mockAPI } from '../utils/mockAPI'
const partners = await mockAPI.getPartnerList('KHACH_HANG')

// Sau (Real API):
import axios from 'axios'
const { data: partners } = await axios.get('/api/partners?type=KHACH_HANG')
```

## ⚠️ LƯU Ý ERP Core

### Không dùng độc lập
Giao diện này PHẢI tích hợp với backend ERP để:
- Load danh sách AR/AP documents thực tế
- Validate business rules từ backend
- Cập nhật trạng thái công nợ sau khi thanh toán

### Business Rules (Backend phải xử lý)
1. **Disable tạo mới nếu:**
   - Vượt số dư công nợ
   - Chuyển khoản nhưng chưa upload chứng từ

2. **Sau submit:**
   - Không cho sửa phiếu (set readonly)
   - Backend set trạng thái: PENDING_APPROVAL → APPROVED → COMPLETED
   - Tự động trừ công nợ khi phê duyệt

3. **Workflow approval:**
   - Người tạo → Kế toán review → Giám đốc approve
   - Email notification ở mỗi bước

## 🎨 UI/UX

- **Framework**: React 18 + Vite
- **UI Library**: Ant Design 5
- **Icons**: @ant-design/icons
- **Date**: dayjs
- **Locale**: Tiếng Việt

## 📝 Changelog

### Version 1.0.0 (Jan 2024)
- ✅ Form nhập phiếu thu/chi với validation đầy đủ
- ✅ Tích hợp AR/AP document selection
- ✅ Upload chứng từ chuyển khoản
- ✅ Mock API cho development
- ✅ Responsive design

## 🤝 Contributing

Để đóng góp:
1. Fork repo
2. Tạo branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Tạo Pull Request

## 📄 License

MIT License - tự do sử dụng cho dự án cá nhân và thương mại.

## 📧 Liên hệ

Mọi thắc mắc vui lòng tạo issue trên GitHub.

---

**⚡ Powered by React + Ant Design + ERP Best Practices**
