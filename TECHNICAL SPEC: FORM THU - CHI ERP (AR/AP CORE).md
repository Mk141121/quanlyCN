1. 🏗 CẤU TRÚC GIAO DIỆN (UI/UX)
Thiết kế theo dạng Master-Detail để kiểm soát chứng từ gốc.

Màu sắc trạng thái:

CHO_THANH_TOAN: Màu Vàng (Cảnh báo/Chờ đợi).

DA_THANH_TOAN: Màu Xanh (Hoàn tất/An toàn).

Thành phần Form:

Header: Thông tin đối tượng (NCC/Khách hàng), Mã chứng từ gốc (PP-ID hoặc AR-ID).

Body: Danh sách các Đơn hàng (PO/SO) nằm trong chứng từ đó để đối soát.

Footer: Phương thức thanh toán, Nút Upload Bill, Tổng tiền và Nút xác nhận.

2. ⚙️ LOGIC XỬ LÝ (CORE LOGIC)
2.1. Quy tắc bắt buộc (Hard Rules)
Validation: Nếu phuongThuc == 'CHUYEN_KHOAN', field billImage là bắt buộc. Hệ thống chặn lưu và báo lỗi 400 nếu trống.

Locking: Khi Phiếu chi/thu được tạo, các đơn hàng (Dathang/Donhang) liên quan bị khóa hoàn toàn, không cho phép sửa/xóa.

2.2. Cơ chế Cascade Update (Transaction)
Khi bấm XÁC NHẬN THANH TOÁN, hệ thống thực hiện các bước sau trong một Transaction:

Cập nhật PhieuThuChi -> DA_THANH_TOAN.

Cập nhật Chứng từ gốc (PaymentProposal hoặc ARDocument) -> DA_THANH_TOAN.

Cập nhật toàn bộ Đơn hàng liên quan (soStatus hoặc poStatus) -> DA_THANH_TOAN.

Khấu trừ số dư công nợ trực tiếp của Nhà cung cấp/Khách hàng.

3. 🧪 MOCK DATA ĐỂ CHẠY DEMO
Dưới đây là bộ dữ liệu mẫu dùng để render giao diện và test logic Cascade.

3.1. Dữ liệu Đề xuất thanh toán (Nhánh Mua - AP)
JSON

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
3.2. Dữ liệu Chứng từ công nợ (Nhánh Bán - AR)
JSON

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
3.3. Dữ liệu Phiếu Thu/Chi (Model chuẩn)
JSON

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
4. 🛠 HƯỚNG DẪN TRIỂN KHAI CHO CLAUDE DEV
Step 1: Đọc prisma.schema để xác định quan hệ giữa PhieuThuChi và PaymentProposal/ARDocument.

Step 2: Xây dựng UI Form sử dụng dữ liệu từ 3.1 và 3.2 để hiển thị danh sách đơn hàng đối chiếu.

Step 3: Viết API endpoint xử lý thanhToan() với logic Transaction cập nhật 4 tầng dữ liệu như mục 2.2.

Step 4: Thêm Validate phía Client/Server cho việc upload ảnh Bill.