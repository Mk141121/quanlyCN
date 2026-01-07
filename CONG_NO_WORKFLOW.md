# 📋 QUY TRÌNH QUẢN LÝ CÔNG NỢ - HOÀN CHỈNH

> Implement theo: **QUY TRÌNH QUẢN LÝ CÔNG NỢ.md** + **TECHNICAL SPEC: FORM THU - CHI ERP (AR/AP CORE).md**

---

## 🔄 LUỒNG NGHIỆP VỤ ĐỐI XỨNG (MIRROR FLOW)

### 1.1. Công nợ Nhà cung cấp (AP - Accounts Payable)

```
PO (Đơn mua) → DA_DOI_CHIEU
    ↓
[GOM ĐƠN] → Tạo Payment Proposal
    ↓
PP: MOI → CHO_THANH_TOAN (sau duyệt)
    ↓
[THANH TOÁN] → Tạo Phiếu Chi
    ↓
PP: DA_THANH_TOAN + PO: DA_THANH_TOAN + Trừ công nợ NCC
```

### 1.2. Công nợ Khách hàng (AR - Accounts Receivable)

```
SO (Đơn bán) → DA_DOI_CHIEU
    ↓
[GOM ĐƠN] → Tạo AR Document
    ↓
AR: MOI → CHO_THU_TIEN (sau duyệt)
    ↓
[THANH TOÁN] → Tạo Phiếu Thu
    ↓
AR: DA_THU_TIEN + SO: DA_THU_TIEN + Trừ công nợ KH
```

---

## 🧮 QUY TẮC KHỚP NỐI

### 2.1. Ràng buộc về số tiền

✅ **Tổng tiền Chứng từ = Tổng tiền các PO/SO**
```javascript
// Validation trong mockAPICongNo.js
const totalPO = data.poIds.reduce((sum, poId) => {
  const po = mockPurchaseOrders.find(p => p.id === poId)
  return sum + (po?.amount || 0)
}, 0)

if (totalPO !== data.totalAmount) {
  throw new Error('Tổng tiền không khớp!')
}
```

✅ **Số tiền Phiếu Thu/Chi = Số tiền Chứng từ**
```javascript
// Validation khi tạo phiếu
if (data.soTien !== documentAmount) {
  throw new Error('Số tiền không khớp!')
}
```

### 2.2. Khóa dữ liệu (Data Locking)

✅ **Khi PO/SO đã gom vào PP/AR → KHÓA**
- Không cho sửa giá, số lượng
- Không cho xóa
- Status → CHO_THANH_TOAN / CHO_THU_TIEN

```javascript
// Trong OrderGrouper - chỉ hiển thị đơn DA_DOI_CHIEU
mockPurchaseOrders.filter(po => 
  po.status === 'DA_DOI_CHIEU' && !po.paymentProposalId
)
```

---

## 🎮 HƯỚNG DẪN SỬ DỤNG

### BƯỚC 1: GOM ĐƠN HÀNG

#### 1.1. Gom PO → Tạo Payment Proposal (AP)

1. Click **"📦 Gom đơn hàng"**
2. Chọn **"🛒 Đơn mua (PO) → Payment Proposal"**
3. Chọn Nhà cung cấp: VD "NCC Rau Sạch Đà Lạt"
4. Hệ thống hiển thị các PO có status **DA_DOI_CHIEU**
5. Chọn nhiều PO (VD: PO-001, PO-002)
6. Xem tổng tiền tự động tính: 10,000,000 VND
7. Click **"✅ Tạo Payment Proposal"**
8. Kết quả: 
   - ✅ PP mới: `DXTT-2026-002`
   - ✅ PO-001, PO-002 → CHO_THANH_TOAN
   - 🔒 PO bị KHÓA

#### 1.2. Gom SO → Tạo AR Document (AR)

1. Click **"📦 Gom đơn hàng"**
2. Chọn **"💼 Đơn bán (SO) → AR Document"**
3. Chọn Khách hàng: VD "Hệ thống Siêu thị WinMart"
4. Chọn SO: SO-100, SO-101, SO-102
5. Tổng tiền: 25,000,000 VND
6. Click **"✅ Tạo AR Document"**
7. Kết quả:
   - ✅ AR mới: `AR-2026-002`
   - ✅ SO → CHO_THU_TIEN
   - 🔒 SO bị KHÓA

---

### BƯỚC 2: THANH TOÁN

#### 2.1. Tạo Phiếu Chi (từ PP)

1. Click **"💰 Thanh toán"**
2. Chọn **"💳 Phiếu Chi (AP)"**
3. Chọn PP vừa tạo: `DXTT-2026-002`
4. Xem chi tiết:
   - Đối tượng: NCC Rau Sạch Đà Lạt
   - Danh sách PO: PO-001 (5M), PO-002 (5M)
   - Tổng: 10,000,000 VND
5. Chọn phương thức: Tiền mặt / Chuyển khoản
6. Nếu CK → Upload Bill (bắt buộc)
7. Click **"✅ XÁC NHẬN THANH TOÁN"**
8. **CASCADE UPDATE 4 tầng**:
   ```
   ✅ 1. PhieuChi → DA_THANH_TOAN
   ✅ 2. PP → DA_THANH_TOAN
   ✅ 3. PO-001, PO-002 → DA_THANH_TOAN
   ✅ 4. Trừ công nợ NCC
   ```

#### 2.2. Tạo Phiếu Thu (từ AR)

Tương tự, nhưng chọn AR Document

---

## 🧪 MOCK DATA

### PO chưa gom (Sẵn sàng gom)
```
✅ PO-001: NCC Rau Sạch - 5M - DA_DOI_CHIEU
✅ PO-002: NCC Rau Sạch - 5M - DA_DOI_CHIEU
✅ PO-003: NCC Vật tư Y tế - 8M - DA_DOI_CHIEU
✅ PO-004: NCC Vật tư Y tế - 7M - DA_DOI_CHIEU
❌ PO-999: NCC Test - 1M - MOI (chưa đối chiếu - KHÔNG hiện)
```

### SO chưa gom (Sẵn sàng gom)
```
✅ SO-100: WinMart - 8M - DA_DOI_CHIEU
✅ SO-101: WinMart - 9M - DA_DOI_CHIEU
✅ SO-102: WinMart - 8M - DA_DOI_CHIEU
✅ SO-200: Cửa hàng B - 6M - DA_DOI_CHIEU
✅ SO-201: Cửa hàng B - 4M - DA_DOI_CHIEU
```

### PP đã gom
```
✅ DXTT-2026-001: Công ty Phân bón - 50M (PO-888, PO-889) - CHO_THANH_TOAN
```

### AR đã gom
```
✅ AR-2026-999: Cửa hàng A - 15M (SO-111) - CHO_THU_TIEN
```

---

## 🔍 VALIDATION RULES

### ✅ Gom đơn
- Chỉ PO/SO ở trạng thái **DA_DOI_CHIEU**
- Cùng 1 Supplier/Customer
- Tổng tiền tự động tính, không cho sửa tay
- Sau gom → PO/SO bị khóa

### ✅ Thanh toán
- Số tiền Phiếu = Số tiền Chứng từ (auto-fill, readonly)
- Upload Bill bắt buộc nếu chuyển khoản
- Cascade Update 4 tầng
- Sau thanh toán → Tất cả locked

---

## 📊 KIẾN TRÚC HOÀN CHỈNH

```
┌─────────────────────────────────────────────────────┐
│              HOME MENU                              │
│  📦 Gom đơn hàng    |    💰 Thanh toán            │
└───────────┬──────────────────────┬──────────────────┘
            │                      │
    ┌───────▼───────┐      ┌───────▼──────────┐
    │ OrderGrouper  │      │ DocumentSelector │
    │               │      │                  │
    │ • Chọn AP/AR  │      │ • Chọn PP/AR    │
    │ • Chọn Partner│      │ • Status filter │
    │ • Multi-select│      │                 │
    │ • Create PP/AR│      └────────┬─────────┘
    └───────────────┘               │
                              ┌─────▼──────────┐
                              │ PhieuThuChiForm│
                              │                │
                              │ • Master-Detail│
                              │ • Upload Bill  │
                              │ • Cascade 4 tầng│
                              └────────────────┘
```

---

## 🔐 LOCKING MECHANISM

### Trạng thái đơn hàng:

| Status | Có thể sửa? | Có thể gom? | Có thể thanh toán? |
|--------|-------------|-------------|-------------------|
| MOI | ✅ Có | ❌ Không | ❌ Không |
| DA_DOI_CHIEU | ✅ Có | ✅ Có | ❌ Không |
| CHO_THANH_TOAN | 🔒 KHÓA | ❌ Không | ✅ Có (qua PP/AR) |
| DA_THANH_TOAN | 🔒 KHÓA | ❌ Không | ❌ Không |

---

## 📝 FILES IMPLEMENTATION

### Core
- `src/utils/mockAPICongNo.js` - Mock data + API với PO/SO độc lập
- `src/components/OrderGrouper.jsx` - Gom đơn hàng
- `src/components/DocumentSelector.jsx` - Chọn PP/AR thanh toán
- `src/components/PhieuThuChiForm.jsx` - Form thanh toán
- `src/App.jsx` - Router với home menu

### Docs
- `QUY TRÌNH QUẢN LÝ CÔNG NỢ.md` - Spec gốc
- `CONG_NO_WORKFLOW.md` - File này

---

## ✅ COMPLIANCE CHECKLIST

- ✅ Luồng đối xứng AP/AR
- ✅ PO/SO độc lập với trạng thái
- ✅ Gom đơn → Tạo PP/AR
- ✅ Chỉ gom đơn DA_DOI_CHIEU
- ✅ Validation số tiền khớp
- ✅ Khóa dữ liệu sau gom
- ✅ Auto-fill số tiền vào phiếu
- ✅ Cascade Update 4 tầng
- ✅ Không cho sửa/xóa đơn đã khóa

---

**🎉 QUY TRÌNH HOÀN CHỈNH - SẴN SÀNG DEMO!**
