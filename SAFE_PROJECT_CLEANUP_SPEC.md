# 🧹 SAFE PROJECT OPTIMIZATION & CLEANUP SPEC
## Clean Code – Zero Regression – Production Safe

---

## 1. MỤC TIÊU

Tối ưu toàn bộ dự án hiện tại:
- Dọn dẹp file rác
- Dọn dẹp code chết / code không dùng
- Chuẩn hóa cấu trúc
- Cải thiện readability & maintainability

⚠️ **TUYỆT ĐỐI KHÔNG gây lỗi**
⚠️ **TUYỆT ĐỐI KHÔNG xóa bừa**

---

## 2. VAI TRÒ CỦA CLAUDE

Bạn là **Senior Software Engineer / Tech Lead**.  
Ưu tiên:
1. An toàn
2. Ổn định
3. Dễ maintain
4. Cuối cùng mới là gọn đẹp

---

## 3. NGUYÊN TẮC BẤT DI BẤT DỊCH

❌ KHÔNG được:
- Rewrite dự án
- Đổi logic nghiệp vụ
- Đổi API contract
- Đổi behavior user-facing
- Xóa file khi **chưa chứng minh 100% không dùng**
- Gộp code khi chưa chắc chắn

✅ ĐƯỢC:
- Xóa file **chắc chắn không import**
- Xóa code **commented / dead**
- Chuẩn hóa naming
- Tách helper nếu an toàn
- Thêm comment giải thích

---

## 4. CHIẾN LƯỢC DỌN DẸP (BẮT BUỘC THEO THỨ TỰ)

### PHASE 1 — AUDIT (KHÔNG XÓA GÌ)

Claude PHẢI:
- Quét toàn bộ project
- Liệt kê:
  - File không import ở đâu
  - Component không được render
  - Function không được gọi
  - Variable không dùng
  - Dependency khả nghi

📌 **CHỈ BÁO CÁO – CHƯA XÓA**

---

### PHASE 2 — CONFIRM SAFE DELETE

Chỉ được xóa khi:
- Không import ở bất kỳ file nào
- Không dynamic import
- Không dùng qua reflection / string
- Không nằm trong public / config

Mỗi file/code xóa PHẢI:
- Ghi rõ lý do
- Ghi rõ bằng chứng

---

### PHASE 3 — CLEAN & REFACTOR NHẸ

- Xóa code dead
- Xóa console.log dư thừa
- Gộp duplicate helper (nếu chắc chắn)
- Chuẩn hóa format
- Giữ nguyên behavior

---

## 5. QUY TẮC XÓA FILE (CỰC KỲ NGHIÊM NGẶT)

❌ KHÔNG xóa:
- File config
- File env
- File mock (trừ khi chứng minh không dùng)
- File type / interface
- File dùng cho future feature (nếu chưa rõ)

Nếu **không chắc** → **GIỮ LẠI**

---

## 6. DEPENDENCY CLEANUP

Claude PHẢI:
- Liệt kê dependency:
  - Đang dùng
  - Có thể bỏ
- KHÔNG tự remove package
- Chỉ đề xuất remove, không thực hiện nếu chưa chắc

---

## 7. FORMAT TRẢ LỜI BẮT BUỘC

Claude PHẢI trả lời theo format sau:

### 🧭 PHASE 1 — AUDIT REPORT
- Danh sách file nghi rác
- Danh sách code chết
- Dependency dư

### 🧹 PHASE 2 — SAFE DELETE PLAN
- File/code đề xuất xóa
- Lý do
- Bằng chứng không dùng

### 🛠️ PHASE 3 — CLEANUP RESULT
- Những gì đã xóa
- Những gì đã refactor
- Những gì giữ lại vì rủi ro

### ✅ SAFETY CHECKLIST
- Không đổi logic
- Không đổi API
- Không lỗi build
- Không lỗi runtime

---

## 8. TEST SAU KHI CLEANUP (BẮT BUỘC)

Claude PHẢI:
- Build project
- Run app
- Kiểm tra page chính
- Kiểm tra các flow quan trọng

Nếu không chắc → rollback.

---

## 9. MỆNH LỆNH CUỐI

> Đây là cleanup **production-safe**.  
> Nếu phải chọn: **GIỮ LẠI > XÓA NHẦM**.  
> Mọi xóa bỏ phải có lý do rõ ràng.

---

## 10. TIÊU CHÍ HOÀN THÀNH

- Code gọn hơn
- Không bug
- Không behavior change
- Dễ đọc hơn
- Không rủi ro tiềm ẩn

---
