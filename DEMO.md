# 🎯 DEMO - Test theo SPEC 100%

> **Tuân thủ: TECHNICAL SPEC: FORM THU - CHI ERP (AR/AP CORE).md**

---

## 📊 Mock Data có sẵn

### Payment Proposals (AP - Phiếu Chi)
```
✅ DXTT-2026-001: Công ty Phân bón Xanh - 50M (2 PO) - CHO_THANH_TOAN
✅ DXTT-2026-002: Nhà cung cấp Vật tư Y tế - 35M (1 PO) - CHO_THANH_TOAN
❌ DXTT-2026-003: Công ty Điện tử ABC - 80M (2 PO) - DA_THANH_TOAN (Locked)
```

### AR Documents (AR - Phiếu Thu)
```
✅ AR-2026-999: Cửa hàng Thực phẩm Sạch A - 15M (1 SO) - CHO_THU_TIEN
✅ AR-2026-998: Siêu thị Mini XYZ - 45M (2 SO) - CHO_THU_TIEN
❌ AR-2026-997: Nhà hàng Hải Sản B - 30M (1 SO) - DA_THANH_TOAN (Locked)
```

---

## 🧪 Test Cases theo SPEC

### ✅ TEST 1: Phiếu Chi - Tiền mặt (SUCCESS)

**Mục đích**: Kiểm tra cascade update 4 tầng

**Steps:**
1. Mở app → Chọn "💳 Phiếu Chi (AP)"
2. Click "Chọn" trên `DXTT-2026-001` (màu vàng - CHO_THANH_TOAN)
3. Xem:
   - Header: "Công ty Phân bón Xanh", Tổng tiền: 50,000,000 VND
   - Body: 2 đơn hàng (PO-888: 20M, PO-889: 30M)
4. Chọn phương thức: "💵 Tiền mặt"
5. Click "✅ XÁC NHẬN THANH TOÁN"

**Expected:**
- ✅ Message: "Xác nhận thanh toán thành công"
- ✅ Console log hiển thị 4 bước CASCADE UPDATE:
  ```
  ✅ 1. Created PhieuThuChi: pv-xxx
  ✅ 2. Updated PaymentProposal: DXTT-2026-001 → DA_THANH_TOAN
  ✅ 3. Updated PO: PO-888 → DA_THANH_TOAN
  ✅ 3. Updated PO: PO-889 → DA_THANH_TOAN
  ✅ 4. Deducted debt: 50,000,000 VND
  ```
- ✅ Status chuyển sang màu xanh (DA_THANH_TOAN)
- ✅ Form bị khóa: "Đã thanh toán - Chứng từ đã bị khóa"

---

### ❌ TEST 2: Phiếu Chi - Chuyển khoản KHÔNG upload (VALIDATION ERROR)

**Mục đích**: Kiểm tra Hard Rule - Upload Bill bắt buộc

**Steps:**
1. Chọn "💳 Phiếu Chi (AP)"
2. Click "Chọn" trên `DXTT-2026-002`
3. Chọn phương thức: "🏦 Chuyển khoản"
4. **KHÔNG** upload ảnh Bill
5. Click "✅ XÁC NHẬN THANH TOÁN"

**Expected:**
- ❌ Error message (màu đỏ): "Thanh toán chuyển khoản bắt buộc phải upload Bill!"
- ❌ KHÔNG tạo phiếu
- ❌ KHÔNG cascade update
- ❌ Status vẫn là CHO_THANH_TOAN (màu vàng)

---

### ✅ TEST 3: Phiếu Chi - Chuyển khoản CÓ upload (SUCCESS)

**Mục đích**: Kiểm tra upload Bill + cascade update

**Steps:**
1. Chọn "💳 Phiếu Chi (AP)"
2. Click "Chọn" trên `DXTT-2026-002`
3. Chọn phương thức: "🏦 Chuyển khoản"
4. Click "Chọn ảnh" → Upload file ảnh
5. Xem preview ảnh hiển thị
6. Click "✅ XÁC NHẬN THANH TOÁN"

**Expected:**
- ✅ Message: "Xác nhận thanh toán thành công"
- ✅ Cascade update 4 tầng
- ✅ billImage được lưu (base64)
- ✅ Status → DA_THANH_TOAN (màu xanh)

---

### ✅ TEST 4: Phiếu Thu - Tiền mặt (SUCCESS)

**Mục đích**: Kiểm tra nhánh AR (Bán hàng)

**Steps:**
1. Chọn "💰 Phiếu Thu (AR)"
2. Click "Chọn" trên `AR-2026-999`
3. Xem:
   - Header: "Cửa hàng Thực phẩm Sạch A", 15M
   - Body: 1 đơn hàng (SO-111: 15M)
4. Chọn "💵 Tiền mặt"
5. Click "✅ XÁC NHẬN THANH TOÁN"

**Expected:**
- ✅ Cascade update:
  ```
  ✅ 1. Created PhieuThuChi: pv-xxx (loaiPhieu: THU)
  ✅ 2. Updated ARDocument: AR-2026-999 → DA_THANH_TOAN
  ✅ 3. Updated SO: SO-111 → DA_THANH_TOAN
  ✅ 4. Deducted debt: 15,000,000 VND
  ```

---

### ❌ TEST 5: Chọn chứng từ đã thanh toán (LOCKED)

**Mục đích**: Kiểm tra Locking mechanism

**Steps:**
1. Chọn "💳 Phiếu Chi (AP)"
2. Tìm chứng từ có status DA_THANH_TOAN (màu xanh)
3. Thử click "Chọn"

**Expected:**
- ❌ Button "Chọn" bị **DISABLE**
- ❌ Không thể click
- ⚠️ Hiển thị tooltip: "Chứng từ đã được thanh toán"

---

### ✅ TEST 6: Màu sắc trạng thái theo SPEC

**Mục đích**: Kiểm tra UI theo đúng spec

**Verification:**
- CHO_THANH_TOAN / CHO_THU_TIEN: **Màu VÀNG** (gold)
- DA_THANH_TOAN: **Màu XANH** (green)

**Check locations:**
1. Bảng danh sách chứng từ
2. Header form chi tiết
3. Status của từng đơn hàng (PO/SO)

---

## 🔍 Kiểm tra Console Log

Mở Console (F12) khi test để xem CASCADE UPDATE:

```
🔄 Starting CASCADE UPDATE Transaction...
✅ 1. Created PhieuThuChi: pv-1736234567890
✅ 2. Updated PaymentProposal: DXTT-2026-001 → DA_THANH_TOAN
✅ 3. Updated PO: PO-888 → DA_THANH_TOAN
✅ 3. Updated PO: PO-889 → DA_THANH_TOAN
✅ 4. Deducted debt: 50,000,000 VND
✨ CASCADE UPDATE completed successfully!
```

---

## 📋 Checklist Test đầy đủ

### UI/UX
- [ ] Master-Detail form structure
- [ ] Header: Đối tượng, mã chứng từ, tổng tiền
- [ ] Body: Bảng PO/SO với summary row
- [ ] Footer: Radio phương thức, Upload Bill, Nút xác nhận
- [ ] Màu vàng: CHO_THANH_TOAN
- [ ] Màu xanh: DA_THANH_TOAN

### Validation (Hard Rules)
- [ ] Upload Bill bắt buộc khi chuyển khoản
- [ ] Báo lỗi nếu không upload
- [ ] Không cho submit khi thiếu Bill

### Locking
- [ ] Chứng từ DA_THANH_TOAN không thể chọn
- [ ] Form hiển thị "Đã bị khóa" sau thanh toán
- [ ] Không thể sửa/xóa sau khi xác nhận

### Cascade Update (Transaction)
- [ ] Tầng 1: PhieuThuChi → DA_THANH_TOAN
- [ ] Tầng 2: PaymentProposal/AR → DA_THANH_TOAN
- [ ] Tầng 3: PO/SO items → DA_THANH_TOAN
- [ ] Tầng 4: Deduct debt
- [ ] Console log hiển thị đầy đủ 4 bước

### Data Flow
- [ ] Chọn loại phiếu (CHI/THU)
- [ ] Load đúng danh sách (PP/AR)
- [ ] Hiển thị đúng items (PO/SO)
- [ ] Tính tổng tiền chính xác
- [ ] Lưu refId và refType đúng

---

## 🎯 Expected Behavior Summary

| Scenario | Phương thức | Upload Bill | Result |
|----------|-------------|-------------|--------|
| Phiếu Chi | Tiền mặt | Không cần | ✅ SUCCESS |
| Phiếu Chi | Chuyển khoản | Không có | ❌ ERROR |
| Phiếu Chi | Chuyển khoản | Có | ✅ SUCCESS |
| Phiếu Thu | Tiền mặt | Không cần | ✅ SUCCESS |
| Phiếu Thu | Chuyển khoản | Không có | ❌ ERROR |
| Phiếu Thu | Chuyển khoản | Có | ✅ SUCCESS |
| Chứng từ đã thanh toán | - | - | 🔒 LOCKED |

---

**✅ Tất cả test cases đều tuân thủ 100% SPEC**

### ✅ Scenario 1: Tạo phiếu thu thành công (Happy Path)

**Bước thực hiện:**
1. Chọn "Phiếu thu"
2. Nhập số tiền: 30,000,000 VND
3. Chọn đối tượng: "Khách hàng"
4. Tìm và chọn: "KH003 - Doanh nghiệp tư nhân DEF" (công nợ 30M)
5. Click "Chọn chứng từ" → Chọn chứng từ HD-2024-004
6. Phương thức: "Tiền mặt"
7. Nhập lý do: "Thu tiền hóa đơn tháng 1"
8. Click "Tạo mới"

**Kết quả mong đợi:**
- ✅ Không có cảnh báo
- ✅ Nút "Tạo mới" active (màu xanh)
- ✅ Submit thành công với message success

---

### ⚠️ Scenario 2: Cảnh báo vượt công nợ (Validation)

**Bước thực hiện:**
1. Chọn "Phiếu thu"
2. Nhập số tiền: **100,000,000 VND** (vượt quá công nợ)
3. Chọn "KH001 - Công ty TNHH ABC" (công nợ chỉ 50M)

**Kết quả mong đợi:**
- ❌ Alert đỏ: "Số tiền vượt công nợ hiện tại (50,000,000 VND)"
- ❌ Nút "Tạo mới" bị **disable**
- ❌ Không thể submit

---

### ⚠️ Scenario 3: Chuyển khoản chưa upload (Warning)

**Bước thực hiện:**
1. Chọn "Phiếu chi"
2. Nhập số tiền: 40,000,000 VND
3. Chọn "Nhà cung cấp" → "NCC002 - Nhà cung cấp Thiết bị B"
4. Phương thức: **"Chuyển khoản"**
5. KHÔNG upload file

**Kết quả mong đợi:**
- ⚠️ Alert vàng: "Thanh toán chuyển khoản cần upload chứng từ"
- ❌ Nút "Tạo mới" bị **disable**
- 📎 Input upload file hiển thị với tag đỏ "Bắt buộc"

---

### ✅ Scenario 4: Chuyển khoản có upload (Pass)

**Bước thực hiện:**
1. Làm theo Scenario 3
2. Upload file chứng từ (bất kỳ file < 10MB)

**Kết quả mong đợi:**
- ✅ Cảnh báo biến mất
- ✅ Nút "Tạo mới" active
- ✅ Submit thành công

---

### 🔍 Scenario 5: Popup chọn AR/AP Documents

**Bước thực hiện:**
1. Chọn "Phiếu thu"
2. Chọn "KH002 - Công ty CP XYZ"
3. Click nút "Chọn chứng từ (0)"

**Kết quả mong đợi:**
- ✅ Modal hiển thị với title "Chọn chứng từ công nợ phải thu (AR)"
- ✅ Hiển thị 2 chứng từ:
  - HD-2024-002: 80,000,000 VND
  - HD-2024-003: 40,000,000 VND
- ✅ Statistics hiển thị:
  - Đối tượng: Công ty CP XYZ
  - Số chứng từ: 2
- ✅ Có thể chọn nhiều chứng từ
- ✅ Tổng còn lại cập nhật khi chọn

---

### 🔍 Scenario 6: Popup chọn AP (Phiếu chi)

**Bước thực hiện:**
1. Chọn "Phiếu chi"
2. Chọn "Nhà cung cấp" → "NCC003 - Nhà cung cấp Dịch vụ C"
3. Click "Chọn chứng từ"

**Kết quả mong đợi:**
- ✅ Modal hiển thị với title "Chọn chứng từ công nợ phải chi (AP)"
- ✅ Hiển thị chứng từ PO-2024-003: 60,000,000 VND
- ✅ Status: "Chờ chi" (màu cam)

---

## 🎨 Demo Mock Data

### Khách hàng (AR - Phải Thu)
```
KH001 - Công ty TNHH ABC: 50M (1 chứng từ)
KH002 - Công ty CP XYZ: 120M (2 chứng từ)
KH003 - Doanh nghiệp DEF: 30M (1 chứng từ)
KH004 - Công ty TNHH GHI: 0M (không có công nợ)
```

### Nhà cung cấp (AP - Phải Chi)
```
NCC001 - Nhà cung cấp Vật liệu A: 80M
NCC002 - Nhà cung cấp Thiết bị B: 45M
NCC003 - Nhà cung cấp Dịch vụ C: 60M
```

---

## 🧪 Test Checklist

### UI Components
- [ ] Toggle Phiếu thu/chi hoạt động
- [ ] InputNumber format VND đúng (có dấu phẩy)
- [ ] Select tìm kiếm đối tác hoạt động
- [ ] Checkbox "Có hóa đơn" toggle được
- [ ] Upload file < 10MB
- [ ] Upload file > 10MB bị reject
- [ ] Textarea ghi chú resize được

### Validation
- [ ] Số tiền = 0 → Lỗi "phải lớn hơn 0"
- [ ] Vượt công nợ → Alert đỏ + disable submit
- [ ] Chuyển khoản chưa upload → Alert vàng + disable
- [ ] Chưa chọn chứng từ → Alert xanh (info only)

### AR/AP Modal
- [ ] Modal mở/đóng đúng
- [ ] Load đúng danh sách AR (Phiếu thu)
- [ ] Load đúng danh sách AP (Phiếu chi)
- [ ] Chọn nhiều chứng từ được
- [ ] Statistics cập nhật realtime
- [ ] Chứng từ "Đã thanh toán" bị disable

### API Integration
- [ ] Load partner list
- [ ] Load debt info
- [ ] Load AR/AP documents
- [ ] Submit form success
- [ ] Error handling

### Responsive
- [ ] Desktop (> 768px): 2 columns
- [ ] Mobile (< 768px): 1 column
- [ ] Modal responsive

---

## 🐛 Known Limitations (Mock)

1. **Không có workflow approval**: Backend thật cần thêm
2. **Không update công nợ**: Sau submit không trừ công nợ (backend xử lý)
3. **Không validate duplicate**: Có thể submit nhiều lần (cần idempotency key)
4. **Upload chỉ validate size**: Không check file type (nên check PDF/Image only)
5. **Không có history**: Không lưu lịch sử các phiếu đã tạo

---

## 🚀 Next Steps

### Backend cần implement:
1. ✅ REST API cho CRUD phiếu thu/chi
2. ✅ WebSocket realtime update công nợ
3. ✅ Workflow approval system
4. ✅ Email notification
5. ✅ Report & Analytics
6. ✅ Export Excel/PDF
7. ✅ Audit log

### Frontend enhancements:
1. ✅ React Query cho caching
2. ✅ Redux/Zustand cho state management
3. ✅ React Hook Form cho form validation
4. ✅ i18n cho đa ngôn ngữ
5. ✅ Dark mode
6. ✅ Print layout
7. ✅ Keyboard shortcuts

---

**🎉 Happy Testing!**
