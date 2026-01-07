📊 DASHBOARD KẾ TOÁN TỔNG HỢP (ERP V3)
Tài liệu này mô tả giao diện Dashboard tập trung, giúp quản lý có cái nhìn tổng thể về dòng tiền và công nợ dựa trên dữ liệu từ các chứng từ ARDocument và PaymentProposal.

1. 📈 KHỐI BÁO CÁO CÔNG NỢ TỔNG HỢP
Mục tiêu: Hiển thị hiệu quả kinh doanh và khả năng thu hồi vốn.

1.1. Công nợ Khách hàng (Accounts Receivable)
Doanh số (Gross Sales): Tổng giá trị tất cả các Đơn bán hàng (Donhang) đã ở trạng thái DA_DOI_CHIEU trở lên.

Đã thu: Tổng giá trị các ARDocument đã gắn với Phiếu thu trạng thái DA_THANH_TOAN.

Chưa thu: Hiệu số giữa Doanh số và Đã thu (Công nợ hiện hành).

1.2. Công nợ Nhà cung cấp (Accounts Payable)
Doanh số (Purchases): Tổng giá trị các Đơn mua hàng (Dathang) đã ở trạng thái DA_DOI_CHIEU.

Đã chi: Tổng giá trị các PaymentProposal đã gắn với Phiếu chi trạng thái DA_THANH_TOAN.

Chưa chi: Hiệu số giữa Doanh số và Đã chi (Số tiền nợ NCC).

2. 📑 KHỐI XÁC NHẬN CÔNG NỢ (AR/AP DOCUMENTS)
Mục tiêu: Quản lý các bộ chứng từ đang trong quá trình đối soát hoặc chờ dòng tiền.

2.1. Xác nhận Công nợ Khách hàng (AR Documents)
Danh sách Đã thu: Các ARDocument đã hoàn tất luồng.

Danh sách Chưa thu: Các ARDocument đang ở trạng thái MOI hoặc CHO_THU_TIEN.

Hành động: Cho phép kế toán bấm vào để xem chi tiết các Donhang thành viên đã được đối chiếu số liệu.

2.2. Xác nhận Công nợ Nhà cung cấp (Payment Proposals)
Danh sách Đã chi: Các đề xuất thanh toán đã hoàn tất.

Danh sách Chưa chi: Các đề xuất đang ở trạng thái MOI hoặc CHO_THANH_TOAN.

Hành động: Hiển thị nút "Duyệt" nhanh cho Giám đốc đối với các đề xuất đang chờ.

3. 💳 KHỐI QUẢN LÝ PHIẾU THU / CHI
Mục tiêu: Theo dõi dòng tiền thực tế theo thời gian.

3.1. Danh sách Phiếu Thu (Receipt Vouchers)
Hiển thị: Lọc theo tháng hoặc khoảng ngày.

Trạng thái: Hiển thị nhãn màu Xanh (DA_THANH_TOAN) kèm theo ảnh chứng từ Bill nếu có.

3.2. Danh sách Phiếu Chi (Payment Vouchers)
Hiển thị: Theo dõi các khoản chi thực tế từ quỹ hoặc tài khoản.

Ràng buộc: Hiển thị icon cảnh báo nếu Phiếu chi hình thức Chuyển khoản mà chưa được upload ảnh Bill.

🧪 MOCK DATA CHO DASHBOARD DEMO
JSON

{
  "summary_reports": {
    "customer_ar": { "sales": 500000000, "received": 350000000, "pending": 150000000 },
    "supplier_ap": { "purchases": 300000000, "paid": 200000000, "pending": 100000000 }
  },
  "confirmations": {
    "ar_docs": [
      { "id": "AR-001", "customer": "WinMart", "amount": 50000000, "status": "CHO_THU_TIEN" }
    ],
    "ap_docs": [
      { "id": "DX-001", "supplier": "Đà Lạt Farm", "amount": 30000000, "status": "CHO_THANH_TOAN" }
    ]
  },
  "vouchers": {
    "recent_receipts": [{ "id": "PT-01", "amount": 50000000, "status": "DA_THANH_TOAN" }],
    "recent_payments": [{ "id": "PC-01", "amount": 30000000, "status": "CHO_THANH_TOAN" }]
  }
}
Hướng dẫn cho Claude Dev:

Sử dụng các biểu đồ (Charts) để minh họa phần 1/ BÁO CÁO.

Sử dụng Data Table có lọc (Filter) cho phần 2/ XÁC NHẬN CÔNG NỢ.

Áp dụng màu sắc (Vàng/Xanh) đồng bộ theo trạng thái hệ thống đã quy định.