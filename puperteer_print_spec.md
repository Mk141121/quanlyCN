# 🖨️ SAFE PUPPETEER INTEGRATION SPEC
## HTML → PDF for Official Documents (Production Ready)

---

## 1. MỤC TIÊU

Tích hợp chức năng **xuất & in chứng từ PDF** cho webapp hiện tại bằng **Puppeteer** theo hướng:

- Chuẩn A4
- Unicode tiếng Việt
- Layout ổn định
- Phù hợp chứng từ tài chính / thuế
- Không ảnh hưởng UI hiện tại

⚠️ KHÔNG:
- Render PDF bằng canvas
- Dùng jsPDF / pdf-lib
- Tự code engine PDF

---

## 2. NGUYÊN TẮC BẮT BUỘC

❌ Không tạo project mới  
❌ Không tách app  
❌ Không thay đổi logic nghiệp vụ  
❌ Không render từ client  

✅ Chỉ render PDF **server-side**

---

## 3. KIẾN TRÚC ĐÚNG

UI (React / Next.js)
↓
API Route (Server)
↓
Puppeteer (Headless Chrome)
↓
PDF A4

yaml
Copy code

UI chỉ gửi:
- Loại chứng từ
- Dữ liệu đã tính sẵn

---

## 4. VỊ TRÍ TÍCH HỢP (NEXT.JS)

- Dùng **API Route / Server Action**
- KHÔNG chạy Puppeteer ở client

Ví dụ:
/app/api/print/route.ts

yaml
Copy code

---

## 5. CHUẨN TEMPLATE CHỨNG TỪ (CỰC KỲ QUAN TRỌNG)

### 5.1 Format
- HTML + CSS thuần
- Không dùng UI framework
- Không Tailwind
- Không JS động

### 5.2 Style
- Dạng **text / bảng**
- Giống sao kê ngân hàng
- Không gradient
- Không chart
- Không dark mode

### 5.3 Font
- Inter / Roboto / Noto Sans
- Phải embed hoặc load local

---

## 6. CHUẨN A4

```ts
format: 'A4'
margin: {
  top: '20mm',
  bottom: '20mm',
  left: '15mm',
  right: '15mm'
}
printBackground: true
7. PAGE BREAK (RẤT QUAN TRỌNG)
Claude PHẢI:

Dùng CSS:

css
Copy code
.page-break {
  page-break-before: always;
}
Không rely vào auto break

8. BẢO MẬT & AN TOÀN
8.1 Data Handling
Không log dữ liệu thuế

Không cache PDF lâu dài

Xóa file tạm sau khi response

8.2 Puppeteer Config
Headless mode

Disable unnecessary features

Timeout rõ ràng

9. FLOW TRIỂN KHAI
STEP 1
Nhận payload từ UI

Validate dữ liệu

STEP 2
Map data → HTML template

STEP 3
Puppeteer render → PDF buffer

STEP 4
Stream PDF về client

Set header download

10. HTTP HEADER CHUẨN
http
Copy code
Content-Type: application/pdf
Content-Disposition: inline; filename="chung-tu-thue.pdf"
11. XỬ LÝ LỖI
Claude PHẢI handle:

Puppeteer launch fail

Render timeout

Invalid data

Không để crash server.

12. TEST BẮT BUỘC
Claude PHẢI test:

1 trang

Nhiều trang

Unicode tiếng Việt

Số lớn

In trên Chrome / Edge

13. TIÊU CHÍ HOÀN THÀNH
PDF đúng layout

Không lệch chữ

Không mất font

In đẹp

Code dễ maintain

14. MỆNH LỆNH CUỐI
Đây là tích hợp Puppeteer cho chứng từ tài chính.
Ưu tiên ổn định, chính xác, an toàn.
Không sáng tạo ngoài phạm vi này.









