1. 🔄 LUỒNG NGHIỆP VỤ ĐỐI XỨNG (MIRROR FLOW)
1.1. Công nợ Nhà cung cấp (Accounts Payable - AP)
Nguồn: Các Đơn mua hàng (PO) ở trạng thái ĐÃ ĐỐI CHIẾU.

Thực thể: PaymentProposal (Đề xuất thanh toán).

Trạng thái: MOI -> CHO_THANH_TOAN (Sau khi duyệt) -> DA_THANH_TOAN.

1.2. Công nợ Khách hàng (Accounts Receivable - AR)
Nguồn: Các Đơn bán hàng (SO) ở trạng thái DA_DOI_CHIEU.

Thực thể: ARDocument (Chứng từ công nợ khách hàng).

Trạng thái: MOI -> CHO_THU_TIEN -> DA_THU_TIEN.

2. 🧮 QUY TẮC KHỚP NỐI VỚI PHIẾU THU - CHI
Để đảm bảo dữ liệu khớp 100%, hệ thống áp dụng các ràng buộc sau:

2.1. Ràng buộc về số tiền
Tổng tiền Chứng từ = Tổng tiền của tất cả các Đơn hàng (PO/SO) thành viên bên trong.

Số tiền trên Phiếu Thu/Chi phải khớp chính xác với Tổng tiền trên Chứng từ Công nợ tương ứng.

2.2. Khóa dữ liệu (Data Locking)
Khi một Đơn hàng đã được đưa vào Chứng từ Công nợ (AP/AR Document), trạng thái đơn hàng chuyển sang CHO_THANH_TOAN hoặc CHO_THU_TIEN.

Tuyệt đối khóa: Không cho phép sửa giá, số lượng hoặc xóa Đơn hàng khi nó đang nằm trong một Chứng từ công nợ.

3. 🧪 MOCK DATA ĐỂ CHẠY DEMO (MATCHING FLOW)
3.1. Kịch bản Mua hàng (AP -> CHI)
Bước 1: Tạo Chứng từ Công nợ (Payment Proposal)

JSON

{
  "maDeXuat": "DXTT-2026-001",
  "supplier": "NCC Rau Sạch Đà Lạt",
  "listPO": ["PO-001", "PO-002"],
  "tongTien": 10000000,
  "status": "CHO_THANH_TOAN"
}
Bước 2: Khớp với Phiếu Chi

Phiếu Chi sẽ gọi refId: "DXTT-2026-001".

Khi Phiếu Chi xác nhận DA_THANH_TOAN, hệ thống Cascade Update quét ngược lại đổi trạng thái DXTT-2026-001 và PO-001, PO-002 thành DA_THANH_TOAN.

3.2. Kịch bản Bán hàng (AR -> THU)
Bước 1: Tạo Chứng từ Công nợ (AR Document)

JSON

{
  "maChungTu": "AR-2026-005",
  "customer": "Hệ thống Siêu thị WinMart",
  "listSO": ["SO-100", "SO-101", "SO-102"],
  "tongTien": 25000000,
  "status": "CHO_THU_TIEN"
}
Bước 2: Khớp với Phiếu Thu

Phiếu Thu sẽ gọi refId: "AR-2026-005".

Tương tự, khi hoàn tất, toàn bộ SO thành viên sẽ được chốt trạng thái và trừ nợ khách hàng.

4. 🛠 HƯỚNG DẪN TRIỂN KHAI CÔNG NỢ TẬP TRUNG
Để Claude Dev thực hiện chính xác, hãy yêu cầu:

Giao diện gom đơn: Cho phép chọn nhiều Đơn hàng của cùng một đối tượng để "Đóng gói" thành 1 Chứng từ công nợ.

Logic kiểm tra: Chỉ những đơn hàng đã qua bước doiChieu() (chốt số thực tế) mới hiện ra để gom.

Tự động hóa: Khi tạo Phiếu Thu/Chi, hãy tự động điền (Auto-fill) số tiền từ Chứng từ công nợ sang để tránh sai sót nhập liệu tay.