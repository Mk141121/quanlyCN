# HƯỚNG DẪN XÂY DỰNG MODULE CÔNG NỢ KHÁCH HÀNG & CÔNG NỢ NHÀ CUNG CẤP
## (AR Dashboard & AP Dashboard – Chuẩn ERP Core)

> Tài liệu hướng dẫn triển khai **02 module bắt buộc** để hoàn thiện ERP:  
> **Công nợ Khách hàng (Bán hàng)** và **Công nợ Nhà cung cấp (Mua hàng)**

---

# PHẦN A – MODULE CÔNG NỢ KHÁCH HÀNG (AR DASHBOARD)

## I. MỤC TIÊU MODULE AR

Module **Công nợ Khách hàng** dùng để:
- Theo dõi **doanh số – công nợ – thanh toán** theo từng Khách hàng
- Trả lời nhanh các câu hỏi thực tế:
  - KH A từ ngày 01–15 doanh số bao nhiêu?
  - Đã thanh toán bao nhiêu?
  - Còn phải thu bao nhiêu?
- Drill-down đến **từng đơn bán** và **phiếu thu liên quan**

> ⚠️ Module này **KHÔNG phát sinh công nợ**, chỉ **tổng hợp & hiển thị** từ dữ liệu gốc

---

## II. KHÁI NIỆM CÔNG NỢ AR (CHỐT NGHIỆP VỤ)

### 1️⃣ Công nợ TẠM (Operational AR)
- Phát sinh khi:
```
SalesOrder.status >= DA_GIAO_THUC_TE
```
- Phản ánh **doanh số đã giao thực tế**
- Dùng cho Sale / Admin
- ❌ Không dùng để thu tiền

---

### 2️⃣ Công nợ CHÍNH THỨC (Accounting AR)
- Phát sinh khi:
```
SalesOrder.status >= DA_DOI_CHIEU
```
- Là **số tiền phải thu hợp pháp**
- Là căn cứ tạo **AR Document** và Phiếu thu

---

## III. MÀN HÌNH TỔNG HỢP (LEVEL 1 – AR SUMMARY)

### Bộ lọc bắt buộc
- Khách hàng
- Khoảng ngày (từ ngày – đến ngày)
- Trạng thái đơn hàng

### Bảng tổng hợp theo KH

| Chỉ tiêu | Công thức |
|---|---|
| Tổng doanh số (CN tạm) | SUM đơn >= DA_GIAO_THUC_TE |
| Công nợ cần thu | SUM đơn >= DA_DOI_CHIEU |
| Đã thanh toán | SUM Phiếu thu = DA_THU_TIEN |
| Còn lại | CN chính thức – Đã thanh toán |

---

## IV. CHI TIẾT KHÁCH HÀNG (LEVEL 2 – AR DETAIL)

### Danh sách đơn bán của KH trong kỳ

| Mã đơn | Ngày | Giá trị | Trạng thái |
|---|---|---|---|
| SO-001 | 01/01 | 100tr | ĐÃ NHẬN |
| SO-002 | 05/01 | 150tr | ĐÃ ĐỐI CHIẾU |
| SO-003 | 10/01 | 170tr | ĐÃ THU TIỀN |

### Mapping trạng thái hiển thị

| Hiển thị | Backend Status |
|---|---|
| ĐÃ NHẬN | DA_GIAO_THUC_TE |
| ĐÃ ĐỐI CHIẾU | DA_DOI_CHIEU |
| ĐÃ THU TIỀN | DA_THU_TIEN |

---

## V. NGUYÊN TẮC KỸ THUẬT (AR)

- ❌ Không tạo bảng `customer_debt`
- ✅ Công nợ là **VIEW / QUERY / MATERIALIZED VIEW**
- Nguồn dữ liệu duy nhất:
  - `sales_order`
  - `ar_document`
  - `receipt`

---

# PHẦN B – MODULE CÔNG NỢ NHÀ CUNG CẤP (AP DASHBOARD)

## I. MỤC TIÊU MODULE AP

Module **Công nợ Nhà cung cấp** dùng để:
- Theo dõi **giá trị mua – công nợ – thanh toán** theo từng NCC
- Trả lời nhanh:
  - NCC B từ ngày 01–15 đã mua bao nhiêu?
  - Đã thanh toán bao nhiêu?
  - Còn phải trả bao nhiêu?

---

## II. KHÁI NIỆM CÔNG NỢ AP

### 1️⃣ Công nợ TẠM (Operational AP)
- Phát sinh khi:
```
PurchaseOrder.status >= DA_DOI_CHIEU
```
- Phản ánh giá trị hàng đã nhận & đối chiếu

---

### 2️⃣ Công nợ CHÍNH THỨC (Accounting AP)
- Phát sinh khi:
```
PurchaseOrder.status >= DA_DOI_CHIEU
```
- Là căn cứ tạo **AP Document** và Phiếu chi

---

## III. MÀN HÌNH TỔNG HỢP (LEVEL 1 – AP SUMMARY)

### Bộ lọc
- Nhà cung cấp
- Khoảng ngày
- Trạng thái đơn mua

### Bảng tổng hợp theo NCC

| Chỉ tiêu | Công thức |
|---|---|
| Tổng giá trị mua | SUM đơn >= DA_DOI_CHIEU |
| Công nợ phải trả | SUM AP Document |
| Đã thanh toán | SUM Phiếu chi = DA_THANH_TOAN |
| Còn lại | Công nợ – Đã thanh toán |

---

## IV. CHI TIẾT NCC (LEVEL 2 – AP DETAIL)

### Danh sách đơn mua của NCC

| Mã đơn | Ngày | Giá trị | Trạng thái |
|---|---|---|---|
| PO-001 | 02/01 | 80tr | ĐÃ ĐỐI CHIẾU |
| PO-002 | 08/01 | 120tr | CHỜ THANH TOÁN |
| PO-003 | 12/01 | 150tr | ĐÃ THANH TOÁN |

---

## V. NGUYÊN TẮC KỸ THUẬT (AP)

- ❌ Không tạo bảng `supplier_debt`
- ✅ Công nợ là VIEW / QUERY
- Nguồn dữ liệu:
  - `purchase_order`
  - `ap_document`
  - `payment`

---

# VI. QUYỀN & KIỂM SOÁT

| Vai trò | AR | AP |
|---|---|---|
| Sale | CN tạm | ❌ |
| Admin | Xem | Xem |
| Kế toán | Xem + xử lý | Xem + xử lý |
| Thủ quỹ | Chỉ xem số | Chỉ xem số |

---

# VII. KẾT LUẬN

✔ Hai module AR/AP là **trục kiểm soát tài chính của ERP**
✔ Không phát sinh công nợ – chỉ tổng hợp từ nguồn gốc
✔ Thiết kế đối xứng giúp:
- Dev dễ làm
- Kế toán dễ dùng
- Audit rõ ràng

📌 Khuyến nghị: triển khai **AR Dashboard trước**, sau đó clone logic sang **AP Dashboard**

