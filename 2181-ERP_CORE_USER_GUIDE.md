# HƯỚNG DẪN VẬN HÀNH QUY TRÌNH ERP LÕI TRÊN HỆ THỐNG RAUSACH V3

Tài liệu này hướng dẫn chi tiết từng bước (Step-by-step) để thực hiện quy trình nghiệp vụ Mua hàng (AP) và Bán hàng (AR) theo tiêu chuẩn ERP 3 lớp: **Kinh doanh - Kế toán - Thủ quỹ**.

---

## 🟦 QUY TRÌNH 1: BÁN HÀNG & THU TIỀN KHÁCH HÀNG (AR)

Dành cho bộ phận Kinh doanh và Kế toán Phải thu.

### Bước 1: Khởi tạo Đơn hàng (Sales Order - SO)
- **Vị trí**: `Bán hàng` -> `Danh sách đơn hàng`.
- **Thực hiện**: Tạo đơn hàng mới cho khách hàng. Trạng thái mặc định là `cho_xac_nhan` hoặc `da_xac_nhan`.
- **Lưu ý**: Đây là lớp **Kinh doanh**, ghi nhận nhu cầu của khách hàng.

### Bước 2: Xác nhận Giao hàng Thực tế
- **Vị trí**: Chi tiết đơn hàng.
- **Thực hiện**: Sau khi kho hoặc shipper giao hàng, kế toán/kinh doanh cập nhật số lượng giao thực tế bằng nút **"Xác nhận giao thực tế"**.
- **Kết quả**: Đơn hàng chuyển sang trạng thái `dang_giao` và ghi nhận `slnhan` thực tế.

### Bước 3: Đối chiếu Kế toán (Reconciliation)
- **Vị trí**: Chi tiết đơn hàng -> Tab **"Đối chiếu"**.
- **Thực hiện**: Kế toán kiểm tra lại số thực giao và giá bán cuối cùng. Nhấn nút **"Chốt đối chiếu"**.
- **Kết quả**: Đơn hàng chuyển sang trạng thái `doi_chieu`. Lúc này dữ liệu đơn hàng sẽ bị **khóa chặt**, không thể sửa đổi trái phép.

### Bước 4: Khởi tạo Chứng từ công nợ (AR Document)
- **Vị trí**: `Kế toán` -> `Chứng từ công nợ (AR)`.
- **Thực hiện**: Chọn khách hàng và các đơn hàng đã `doi_chieu` để gom vào một chứng từ.
- **Mục đích**: Chuyển số liệu từ lớp Kinh doanh sang lớp **Kế toán**. Một AR Document có thể gộp nhiều đơn hàng để thu tiền một lần.

### Bước 5: Lập Phiếu Thu
- **Vị trí**: Tại AR Document đã phê duyệt -> Nhấn nút **"Thu tiền"**.
- **Thực hiện**: Hệ thống tự động đẩy dữ liệu sang `Phiếu Thu`. Chọn phương thức thanh toán (Tiền mặt/Chuyển khoản) và nhấn **"Lưu & Kế toán xác nhận"**.
- **Kết quả (Cascade Update)**: 
  - Hệ thống tự động cập nhật số tiền đã thu vào AR Document.
  - Tự động cập nhật trạng thái các đơn hàng liên quan thành `hoan_thanh`.
  - Ghi nhận vào **Báo cáo dòng tiền**.

---

## 🟧 QUY TRÌNH 2: MUA HÀNG & THANH TOÁN NHÀ CUNG CẤP (AP)

Dành cho bộ phận Thu mua và Kế toán Phải trả.

### Bước 1: Tạo Đơn đặt hàng (Purchase Order - PO)
- **Vị trí**: `Mua hàng` -> `Đặt hàng NCC`.
- **Thực hiện**: Lập lệnh mua hàng gửi Nhà cung cấp.

### Bước 2: Nhập kho & Đối chiếu
- **Vị trí**: `Kho` -> `Nhập kho`.
- **Thực hiện**: Xác nhận số lượng hàng thực tế nhập vào kho từ NCC.
- **Kết quả**: Trạng thái đơn đặt hàng chuyển sang `danhan`.

### Bước 3: Đề xuất Thanh toán (Payment Proposal - AP Doc)
- **Vị trí**: `Kế toán` -> `Đề xuất thanh toán (AP)`.
- **Thực hiện**: Kế toán lập đề xuất thanh toán cho các đơn hàng đã nhập kho thành công.
- **Phê duyệt**: Quản lý nhấn **"Phê duyệt"** đề xuất này.

### Bước 4: Lập Phiếu Chi
- **Vị trí**: Tại Đề xuất thanh toán đã duyệt -> Nhấn nút **"Thanh toán"**.
- **Thực hiện**: Hệ thống đẩy dữ liệu sang `Phiếu Chi`. Thủ quỹ thực hiện chi tiền và xác nhận.
- **Kết quả (Cascade Update)**: 
  - Đề xuất thanh toán chuyển trạng thái `DA_THANH_TOAN`.
  - Các đơn hàng NCC liên quan tự động cập nhật trạng thái thanh toán.

---

## 📑 QUY TẮC VÀNG VỀ TÍNH TUÂN THỦ (COMPLIANCE)

1.  **Tính Bất biến**: Dữ liệu sau khi **Đối chiếu** (Recon) sẽ không được sửa đổi. Mọi sai sót sau đối chiếu phải xử lý bằng nghiệp vụ điều chỉnh (Adjustment) hoặc hủy làm lại.
2.  **Tính Tách bạch**: 
    - Nhân viên kinh doanh chỉ thao tác trên Đơn hàng.
    - Kế toán thao tác trên AR/AP Document.
    - Thủ quỹ/Kế toán thanh toán thao tác trên Phiếu Thu/Chi.
3.  **Hóa đơn điện tử**: Chỉ được xuất dựa trên dữ liệu đã qua **AR Document** (số liệu đã đối soát xong với khách hàng).
4.  **Dòng tiền Real-time**: Báo cáo dòng tiền chỉ ghi nhận khi Phiếu Thu/Chi ở trạng thái **"Đã xác nhận"**.

---
*Tài liệu hướng dẫn dựa trên hệ thống Rausach V3 - Phiên bản ERP Core 2026.*
