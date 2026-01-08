// Mock data theo QUY TRÌNH QUẢN LÝ CÔNG NỢ.md
// Bao gồm: PO/SO độc lập → Payment Proposal → AR Document

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ============= CUSTOMER GROUPS (Nhóm khách hàng) =============
export const mockCustomerGroups = [
  { id: "cg-001", name: "Tập đoàn WinCommerce", description: "Hệ thống siêu thị WinMart" },
  { id: "cg-002", name: "Tập đoàn Saigon Co.op", description: "Hệ thống Co.opMart" },
  { id: "cg-003", name: "Tập đoàn AEON", description: "Hệ thống AEON Mall" }
]

// ============= SUPPLIER GROUPS (Nhóm nhà cung cấp) =============
export const mockSupplierGroups = [
  { id: "sg-001", name: "Tập đoàn Nông nghiệp Đà Lạt", description: "NCC rau sạch, hoa" },
  { id: "sg-002", name: "Tập đoàn Hóa chất Central", description: "NCC phân bón, thuốc trừ sâu" },
  { id: "sg-003", name: "Tập đoàn Thép Hòa Phát", description: "NCC vật liệu xây dựng" }
]

// ============= CUSTOMERS (Khách hàng - 13 total) =============
export const mockCustomers = [
  // Nhóm WinCommerce (3 chi nhánh)
  { id: "cus-001", name: "WinMart - Chi nhánh Quận 1", groupId: "cg-001", groupName: "Tập đoàn WinCommerce" },
  { id: "cus-002", name: "WinMart - Chi nhánh Quận 3", groupId: "cg-001", groupName: "Tập đoàn WinCommerce" },
  { id: "cus-003", name: "WinMart - Chi nhánh Bình Thạnh", groupId: "cg-001", groupName: "Tập đoàn WinCommerce" },
  
  // Nhóm Saigon Co.op (3 chi nhánh)
  { id: "cus-004", name: "Co.opMart - Chi nhánh Tân Bình", groupId: "cg-002", groupName: "Tập đoàn Saigon Co.op" },
  { id: "cus-005", name: "Co.opMart - Chi nhánh Gò Vấp", groupId: "cg-002", groupName: "Tập đoàn Saigon Co.op" },
  { id: "cus-006", name: "Co.opMart - Chi nhánh Thủ Đức", groupId: "cg-002", groupName: "Tập đoàn Saigon Co.op" },
  
  // Nhóm AEON (3 chi nhánh)
  { id: "cus-007", name: "AEON Mall Tân Phú", groupId: "cg-003", groupName: "Tập đoàn AEON" },
  { id: "cus-008", name: "AEON Mall Bình Tân", groupId: "cg-003", groupName: "Tập đoàn AEON" },
  { id: "cus-009", name: "AEON Mall Canary", groupId: "cg-003", groupName: "Tập đoàn AEON" },
  
  // Khách hàng độc lập (10 KH không thuộc nhóm)
  { id: "cus-010", name: "Cửa hàng Thực phẩm Sạch An Nhiên", groupId: null, groupName: null },
  { id: "cus-011", name: "Siêu thị Mini Bách Hóa Xanh", groupId: null, groupName: null },
  { id: "cus-012", name: "Nhà hàng Món Ngon Quê Hương", groupId: null, groupName: null },
  { id: "cus-013", name: "Khách sạn Sunrise Palace", groupId: null, groupName: null },
  { id: "cus-014", name: "Trường MN Hoa Mai", groupId: null, groupName: null },
  { id: "cus-015", name: "Bệnh viện Đa khoa Tâm Đức", groupId: null, groupName: null },
  { id: "cus-016", name: "Công ty TNHH Thương mại Phát Đạt", groupId: null, groupName: null },
  { id: "cus-017", name: "Quán Cafe The Coffee House", groupId: null, groupName: null },
  { id: "cus-018", name: "Cửa hàng Tiện lợi GS25", groupId: null, groupName: null },
  { id: "cus-019", name: "Nhà hàng Lẩu Hải Sản Biển Đông", groupId: null, groupName: null }
]

// ============= SUPPLIERS (Nhà cung cấp - 13 total) =============
export const mockSuppliers = [
  // Nhóm Nông nghiệp Đà Lạt (3 NCC)
  { id: "sup-001", name: "NCC Rau Sạch Đà Lạt - Chi nhánh HCM", groupId: "sg-001", groupName: "Tập đoàn Nông nghiệp Đà Lạt" },
  { id: "sup-002", name: "NCC Hoa Tươi Đà Lạt - Chi nhánh HCM", groupId: "sg-001", groupName: "Tập đoàn Nông nghiệp Đà Lạt" },
  { id: "sup-003", name: "NCC Trái cây Đà Lạt - Chi nhánh HCM", groupId: "sg-001", groupName: "Tập đoàn Nông nghiệp Đà Lạt" },
  
  // Nhóm Hóa chất Central (3 NCC)
  { id: "sup-004", name: "NCC Phân bón Central - Miền Nam", groupId: "sg-002", groupName: "Tập đoàn Hóa chất Central" },
  { id: "sup-005", name: "NCC Thuốc BVTV Central - Miền Nam", groupId: "sg-002", groupName: "Tập đoàn Hóa chất Central" },
  { id: "sup-006", name: "NCC Hóa chất Central - Miền Nam", groupId: "sg-002", groupName: "Tập đoàn Hóa chất Central" },
  
  // Nhóm Thép Hòa Phát (3 NCC)
  { id: "sup-007", name: "NCC Thép Hòa Phát - Khu vực HCM", groupId: "sg-003", groupName: "Tập đoàn Thép Hòa Phát" },
  { id: "sup-008", name: "NCC Xi măng Hòa Phát - Khu vực HCM", groupId: "sg-003", groupName: "Tập đoàn Thép Hòa Phát" },
  { id: "sup-009", name: "NCC Vật liệu Hòa Phát - Khu vực HCM", groupId: "sg-003", groupName: "Tập đoàn Thép Hòa Phát" },
  
  // NCC độc lập (10 NCC)
  { id: "sup-010", name: "Công ty TNHH Vật tư Y tế Hà Thành", groupId: null, groupName: null },
  { id: "sup-011", name: "NCC Thiết bị điện Phương Nam", groupId: null, groupName: null },
  { id: "sup-012", name: "Công ty CP Văn phòng phẩm Thiên Long", groupId: null, groupName: null },
  { id: "sup-013", name: "NCC Dụng cụ nhà bếp Inox Đại Thành", groupId: null, groupName: null },
  { id: "sup-014", name: "Công ty TNHH Đồ uống Sài Gòn", groupId: null, groupName: null },
  { id: "sup-015", name: "NCC Bao bì nhựa Tân Tiến", groupId: null, groupName: null },
  { id: "sup-016", name: "Công ty CP Dầu thực vật Cái Lân", groupId: null, groupName: null },
  { id: "sup-017", name: "NCC Thực phẩm đông lạnh Hải Âu", groupId: null, groupName: null },
  { id: "sup-018", name: "Công ty TNHH Gia vị Việt Nam", groupId: null, groupName: null },
  { id: "sup-019", name: "NCC Nước giải khát Coca-Cola VN", groupId: null, groupName: null }
]

// ============= PURCHASE ORDERS (Đơn mua hàng - 25 đơn) =============
export const mockPurchaseOrders = [
  // Nhóm Nông nghiệp Đà Lạt (8 đơn)
  { id: "po-001", maDon: "PO-001", supplier: "NCC Rau Sạch Đà Lạt - Chi nhánh HCM", supplierId: "sup-001", amount: 5000000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-01" },
  { id: "po-002", maDon: "PO-002", supplier: "NCC Rau Sạch Đà Lạt - Chi nhánh HCM", supplierId: "sup-001", amount: 6500000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-03" },
  { id: "po-003", maDon: "PO-003", supplier: "NCC Hoa Tươi Đà Lạt - Chi nhánh HCM", supplierId: "sup-002", amount: 8000000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-02" },
  { id: "po-004", maDon: "PO-004", supplier: "NCC Hoa Tươi Đà Lạt - Chi nhánh HCM", supplierId: "sup-002", amount: 7000000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-05" },
  { id: "po-005", maDon: "PO-005", supplier: "NCC Trái cây Đà Lạt - Chi nhánh HCM", supplierId: "sup-003", amount: 12000000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2025-12-28" },
  { id: "po-006", maDon: "PO-006", supplier: "NCC Trái cây Đà Lạt - Chi nhánh HCM", supplierId: "sup-003", amount: 9500000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-04" },
  { id: "po-007", maDon: "PO-007", supplier: "NCC Rau Sạch Đà Lạt - Chi nhánh HCM", supplierId: "sup-001", amount: 5500000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2025-12-30" },
  { id: "po-008", maDon: "PO-008", supplier: "NCC Hoa Tươi Đà Lạt - Chi nhánh HCM", supplierId: "sup-002", amount: 8500000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-06" },
  
  // Nhóm Hóa chất Central (6 đơn)
  { id: "po-009", maDon: "PO-009", supplier: "NCC Phân bón Central - Miền Nam", supplierId: "sup-004", amount: 15000000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2025-12-29" },
  { id: "po-010", maDon: "PO-010", supplier: "NCC Thuốc BVTV Central - Miền Nam", supplierId: "sup-005", amount: 11000000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-02" },
  { id: "po-011", maDon: "PO-011", supplier: "NCC Hóa chất Central - Miền Nam", supplierId: "sup-006", amount: 13500000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-04" },
  { id: "po-012", maDon: "PO-012", supplier: "NCC Phân bón Central - Miền Nam", supplierId: "sup-004", amount: 16000000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-07" },
  { id: "po-013", maDon: "PO-013", supplier: "NCC Thuốc BVTV Central - Miền Nam", supplierId: "sup-005", amount: 10500000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2025-12-31" },
  { id: "po-014", maDon: "PO-014", supplier: "NCC Hóa chất Central - Miền Nam", supplierId: "sup-006", amount: 14000000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-05" },
  
  // NCC độc lập (11 đơn)
  { id: "po-015", maDon: "PO-015", supplier: "Công ty TNHH Vật tư Y tế Hà Thành", supplierId: "sup-010", amount: 18000000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-01" },
  { id: "po-016", maDon: "PO-016", supplier: "NCC Thiết bị điện Phương Nam", supplierId: "sup-011", amount: 9000000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-03" },
  { id: "po-017", maDon: "PO-017", supplier: "Công ty CP Văn phòng phẩm Thiên Long", supplierId: "sup-012", amount: 4500000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2025-12-28" },
  { id: "po-018", maDon: "PO-018", supplier: "NCC Dụng cụ nhà bếp Inox Đại Thành", supplierId: "sup-013", amount: 7200000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-02" },
  { id: "po-019", maDon: "PO-019", supplier: "Công ty TNHH Đồ uống Sài Gòn", supplierId: "sup-014", amount: 22000000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-06" },
  { id: "po-020", maDon: "PO-020", supplier: "NCC Bao bì nhựa Tân Tiến", supplierId: "sup-015", amount: 6800000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-04" },
  { id: "po-021", maDon: "PO-021", supplier: "Công ty CP Dầu thực vật Cái Lân", supplierId: "sup-016", amount: 25000000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2025-12-30" },
  { id: "po-022", maDon: "PO-022", supplier: "NCC Thực phẩm đông lạnh Hải Âu", supplierId: "sup-017", amount: 19500000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-05" },
  { id: "po-023", maDon: "PO-023", supplier: "Công ty TNHH Gia vị Việt Nam", supplierId: "sup-018", amount: 8900000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-07" },
  { id: "po-024", maDon: "PO-024", supplier: "NCC Nước giải khát Coca-Cola VN", supplierId: "sup-019", amount: 35000000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-01" },
  { id: "po-025", maDon: "PO-025", supplier: "Công ty TNHH Vật tư Y tế Hà Thành", supplierId: "sup-010", amount: 17000000, status: "DA_DOI_CHIEU", paymentProposalId: null, createdDate: "2026-01-08" },
  
  // Đơn chưa đối chiếu
  { id: "po-999", maDon: "PO-999", supplier: "NCC Test", supplierId: "sup-999", amount: 1000000, status: "MOI", paymentProposalId: null, createdDate: "2026-01-08" },
  
  // Đơn đã gom vào PP
  { id: "po-888", maDon: "PO-888", supplier: "NCC Thép Hòa Phát - Khu vực HCM", supplierId: "sup-007", amount: 20000000, status: "CHO_THANH_TOAN", paymentProposalId: "pp-001", createdDate: "2025-12-25" },
  { id: "po-889", maDon: "PO-889", supplier: "NCC Thép Hòa Phát - Khu vực HCM", supplierId: "sup-007", amount: 30000000, status: "CHO_THANH_TOAN", paymentProposalId: "pp-001", createdDate: "2025-12-26" }
]

// ============= SALES ORDERS (Đơn bán hàng - 25 đơn) =============
export const mockSalesOrders = [
  // Nhóm WinCommerce (9 đơn)
  { id: "so-001", maDon: "SO-001", customer: "WinMart - Chi nhánh Quận 1", customerId: "cus-001", amount: 8000000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-01" },
  { id: "so-002", maDon: "SO-002", customer: "WinMart - Chi nhánh Quận 1", customerId: "cus-001", amount: 9500000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-03" },
  { id: "so-003", maDon: "SO-003", customer: "WinMart - Chi nhánh Quận 3", customerId: "cus-002", amount: 7200000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-02" },
  { id: "so-004", maDon: "SO-004", customer: "WinMart - Chi nhánh Quận 3", customerId: "cus-002", amount: 8800000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-05" },
  { id: "so-005", maDon: "SO-005", customer: "WinMart - Chi nhánh Bình Thạnh", customerId: "cus-003", amount: 10000000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2025-12-28" },
  { id: "so-006", maDon: "SO-006", customer: "WinMart - Chi nhánh Quận 1", customerId: "cus-001", amount: 8500000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-04" },
  { id: "so-007", maDon: "SO-007", customer: "WinMart - Chi nhánh Quận 3", customerId: "cus-002", amount: 9000000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2025-12-30" },
  { id: "so-008", maDon: "SO-008", customer: "WinMart - Chi nhánh Bình Thạnh", customerId: "cus-003", amount: 11000000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-06" },
  { id: "so-009", maDon: "SO-009", customer: "WinMart - Chi nhánh Quận 1", customerId: "cus-001", amount: 7800000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-07" },
  
  // Nhóm Saigon Co.op (6 đơn)
  { id: "so-010", maDon: "SO-010", customer: "Co.opMart - Chi nhánh Tân Bình", customerId: "cus-004", amount: 12000000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2025-12-29" },
  { id: "so-011", maDon: "SO-011", customer: "Co.opMart - Chi nhánh Gò Vấp", customerId: "cus-005", amount: 9800000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-02" },
  { id: "so-012", maDon: "SO-012", customer: "Co.opMart - Chi nhánh Thủ Đức", customerId: "cus-006", amount: 13500000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-04" },
  { id: "so-013", maDon: "SO-013", customer: "Co.opMart - Chi nhánh Tân Bình", customerId: "cus-004", amount: 11500000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-07" },
  { id: "so-014", maDon: "SO-014", customer: "Co.opMart - Chi nhánh Gò Vấp", customerId: "cus-005", amount: 10200000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2025-12-31" },
  { id: "so-015", maDon: "SO-015", customer: "Co.opMart - Chi nhánh Thủ Đức", customerId: "cus-006", amount: 14000000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-05" },
  
  // Khách hàng độc lập (10 đơn)
  { id: "so-016", maDon: "SO-016", customer: "Cửa hàng Thực phẩm Sạch An Nhiên", customerId: "cus-010", amount: 6000000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-01" },
  { id: "so-017", maDon: "SO-017", customer: "Siêu thị Mini Bách Hóa Xanh", customerId: "cus-011", amount: 4500000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-03" },
  { id: "so-018", maDon: "SO-018", customer: "Nhà hàng Món Ngon Quê Hương", customerId: "cus-012", amount: 7800000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2025-12-28" },
  { id: "so-019", maDon: "SO-019", customer: "Khách sạn Sunrise Palace", customerId: "cus-013", amount: 15000000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-02" },
  { id: "so-020", maDon: "SO-020", customer: "Trường MN Hoa Mai", customerId: "cus-014", amount: 3200000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-06" },
  { id: "so-021", maDon: "SO-021", customer: "Bệnh viện Đa khoa Tâm Đức", customerId: "cus-015", amount: 25000000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-04" },
  { id: "so-022", maDon: "SO-022", customer: "Công ty TNHH Thương mại Phát Đạt", customerId: "cus-016", amount: 18000000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2025-12-30" },
  { id: "so-023", maDon: "SO-023", customer: "Quán Cafe The Coffee House", customerId: "cus-017", amount: 5500000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-05" },
  { id: "so-024", maDon: "SO-024", customer: "Cửa hàng Tiện lợi GS25", customerId: "cus-018", amount: 6800000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-07" },
  { id: "so-025", maDon: "SO-025", customer: "Nhà hàng Lẩu Hải Sản Biển Đông", customerId: "cus-019", amount: 12500000, status: "DA_DOI_CHIEU", arDocumentId: null, createdDate: "2026-01-01" },
  
  // Đơn đã gom vào AR (Nhóm AEON)
  { id: "so-111", maDon: "SO-111", customer: "AEON Mall Tân Phú", customerId: "cus-007", amount: 15000000, status: "CHO_THU_TIEN", arDocumentId: "ar-001", createdDate: "2025-12-25" }
]

// ============= PAYMENT PROPOSALS (Đề xuất thanh toán) =============
export const mockPaymentProposals = [
  {
    id: "pp-001",
    maDeXuat: "DXTT-2026-001",
    supplier: "Công ty Phân bón Xanh",
    supplierId: "sup-003",
    totalAmount: 50000000,
    paidAmount: 0,  // Số tiền đã thanh toán
    status: "CHO_THANH_TOAN",
    createdAt: "2026-01-06T10:30:00",
    items: [
      { id: "po-888", maDon: "PO-888", amount: 20000000, poStatus: "CHO_THANH_TOAN" },
      { id: "po-889", maDon: "PO-889", amount: 30000000, poStatus: "CHO_THANH_TOAN" }
    ]
  }
]

// ============= AR DOCUMENTS (Chứng từ công nợ khách hàng) =============
export const mockARDocuments = [
  {
    id: "ar-001",
    maChungTu: "AR-2026-999",
    customer: "Cửa hàng Thực phẩm Sạch A",
    customerId: "cus-003",
    totalAmount: 15000000,
    paidAmount: 0,  // Số tiền đã thu
    status: "CHO_THU_TIEN",
    createdAt: "2026-01-05T14:20:00",
    items: [
      { id: "so-111", maDon: "SO-111", amount: 15000000, soStatus: "CHO_THU_TIEN" }
    ]
  }
]

// ============= PHIẾU THU/CHI =============
export const mockPhieuThuChi = [
  {
    id: "pv-001",
    loaiPhieu: "CHI",
    ngayLap: "2026-01-07",
    phuongThuc: "CHUYEN_KHOAN",
    soTien: 50000000,
    billImage: "https://example.com/bill-001.jpg",
    status: "DA_THANH_TOAN",
    refId: "pp-001",
    refType: "PaymentProposal"
  }
]

// ============= API MOCK =============
export const mockAPI = {
  // Lấy danh sách nhóm khách hàng
  getCustomerGroups: async () => {
    await delay(200)
    return mockCustomerGroups
  },

  // Lấy danh sách nhóm nhà cung cấp
  getSupplierGroups: async () => {
    await delay(200)
    return mockSupplierGroups
  },

  // Lấy PO chưa gom (DA_DOI_CHIEU và chưa có PP)
  getAvailablePurchaseOrders: async (supplierId = null, fromDate = null, toDate = null, groupId = null) => {
    await delay(300)
    let pos = mockPurchaseOrders.filter(po => 
      po.status === 'DA_DOI_CHIEU' && !po.paymentProposalId
    )
    
    // Filter by supplier
    if (supplierId) {
      pos = pos.filter(po => po.supplierId === supplierId)
    }
    
    // Filter by group
    if (groupId) {
      const supplierIdsInGroup = mockSuppliers
        .filter(s => s.groupId === groupId)
        .map(s => s.id)
      pos = pos.filter(po => supplierIdsInGroup.includes(po.supplierId))
    }
    
    // Filter by date range
    if (fromDate && toDate) {
      pos = pos.filter(po => {
        const poDate = new Date(po.createdDate)
        const from = new Date(fromDate)
        const to = new Date(toDate)
        return poDate >= from && poDate <= to
      })
    }
    
    return pos
  },

  // Lấy SO chưa gom (DA_DOI_CHIEU và chưa có AR)
  getAvailableSalesOrders: async (customerId = null, fromDate = null, toDate = null, groupId = null) => {
    await delay(300)
    let sos = mockSalesOrders.filter(so => 
      so.status === 'DA_DOI_CHIEU' && !so.arDocumentId
    )
    
    // Filter by customer
    if (customerId) {
      sos = sos.filter(so => so.customerId === customerId)
    }
    
    // Filter by group
    if (groupId) {
      const customerIdsInGroup = mockCustomers
        .filter(c => c.groupId === groupId)
        .map(c => c.id)
      sos = sos.filter(so => customerIdsInGroup.includes(so.customerId))
    }
    
    // Filter by date range
    if (fromDate && toDate) {
      sos = sos.filter(so => {
        const soDate = new Date(so.createdDate)
        const from = new Date(fromDate)
        const to = new Date(toDate)
        return soDate >= from && soDate <= to
      })
    }
    
    return sos
  },

  // Lấy danh sách suppliers có PO
  getSuppliers: async () => {
    await delay(200)
    return mockSuppliers
  },

  // Lấy danh sách customers có SO
  getCustomers: async () => {
    await delay(200)
    return mockCustomers
  },

  // Tạo Payment Proposal (Gom PO)
  createPaymentProposal: async (data) => {
    await delay(500)

    // Validation: Kiểm tra tổng tiền khớp
    const totalPO = data.poIds.reduce((sum, poId) => {
      const po = mockPurchaseOrders.find(p => p.id === poId)
      return sum + (po?.amount || 0)
    }, 0)

    if (totalPO !== data.totalAmount) {
      throw new Error(`Tổng tiền không khớp! PO: ${totalPO}, Input: ${data.totalAmount}`)
    }

    // Tạo PP mới
    const newPP = {
      id: `pp-${Date.now()}`,
      maDeXuat: `DXTT-2026-${String(mockPaymentProposals.length + 1).padStart(3, '0')}`,
      supplier: data.supplier,
      supplierId: data.supplierId,
      totalAmount: data.totalAmount,
      paidAmount: 0,  // Chưa thanh toán
      status: 'CHO_THANH_TOAN',
      createdAt: new Date().toISOString(),
      items: data.poIds.map(poId => {
        const po = mockPurchaseOrders.find(p => p.id === poId)
        return {
          id: poId,
          maDon: po.maDon,
          amount: po.amount,
          poStatus: 'CHO_THANH_TOAN'
        }
      })
    }

    // Cập nhật PO
    data.poIds.forEach(poId => {
      const po = mockPurchaseOrders.find(p => p.id === poId)
      if (po) {
        po.status = 'CHO_THANH_TOAN'
        po.paymentProposalId = newPP.id
      }
    })

    mockPaymentProposals.push(newPP)
    console.log('✅ Created Payment Proposal:', newPP.maDeXuat)
    return newPP
  },

  // Tạo AR Document (Gom SO)
  createARDocument: async (data) => {
    await delay(500)

    // Validation: Kiểm tra tổng tiền khớp
    const totalSO = data.soIds.reduce((sum, soId) => {
      const so = mockSalesOrders.find(s => s.id === soId)
      return sum + (so?.amount || 0)
    }, 0)

    if (totalSO !== data.totalAmount) {
      throw new Error(`Tổng tiền không khớp! SO: ${totalSO}, Input: ${data.totalAmount}`)
    }

    // Tạo AR mới
    const newAR = {
      id: `ar-${Date.now()}`,
      maChungTu: `AR-2026-${String(mockARDocuments.length + 1).padStart(3, '0')}`,
      customer: data.customer,
      customerId: data.customerId,
      totalAmount: data.totalAmount,
      paidAmount: 0,  // Chưa thu tiền
      status: 'CHO_THU_TIEN',
      createdAt: new Date().toISOString(),
      items: data.soIds.map(soId => {
        const so = mockSalesOrders.find(s => s.id === soId)
        return {
          id: soId,
          maDon: so.maDon,
          amount: so.amount,
          soStatus: 'CHO_THU_TIEN'
        }
      })
    }

    // Cập nhật SO
    data.soIds.forEach(soId => {
      const so = mockSalesOrders.find(s => s.id === soId)
      if (so) {
        so.status = 'CHO_THU_TIEN'
        so.arDocumentId = newAR.id
      }
    })

    mockARDocuments.push(newAR)
    console.log('✅ Created AR Document:', newAR.maChungTu)
    return newAR
  },

  // Lấy danh sách Payment Proposals
  getPaymentProposals: async (status = null) => {
    await delay(300)
    if (status) {
      return mockPaymentProposals.filter(pp => pp.status === status)
    }
    return mockPaymentProposals
  },

  // Lấy 1 Payment Proposal theo ID
  getPaymentProposalById: async (id) => {
    await delay(300)
    const pp = mockPaymentProposals.find(p => p.id === id)
    if (!pp) throw new Error('Không tìm thấy đề xuất thanh toán')
    return pp
  },

  // Lấy danh sách AR Documents
  getARDocuments: async (status = null) => {
    await delay(300)
    if (status) {
      return mockARDocuments.filter(ar => ar.status === status)
    }
    return mockARDocuments
  },

  // Lấy 1 AR Document theo ID
  getARDocumentById: async (id) => {
    await delay(300)
    const ar = mockARDocuments.find(a => a.id === id)
    if (!ar) throw new Error('Không tìm thấy chứng từ công nợ')
    return ar
  },

  // Tạo Phiếu Thu/Chi và Cascade Update
  createPhieuThuChi: async (data) => {
    await delay(1000)

    // VALIDATION: Bắt buộc upload Bill khi chuyển khoản
    if (data.phuongThuc === 'CHUYEN_KHOAN' && !data.billImage) {
      throw new Error('Thanh toán chuyển khoản bắt buộc phải upload Bill')
    }

    // VALIDATION: Số tiền phải > 0
    if (!data.soTien || data.soTien <= 0) {
      throw new Error('Số tiền thanh toán phải lớn hơn 0')
    }

    // VALIDATION: Kiểm tra số tiền không vượt quá remaining
    if (data.refType === 'PaymentProposal') {
      const pp = mockPaymentProposals.find(p => p.id === data.refId)
      if (pp) {
        const remaining = pp.totalAmount - (pp.paidAmount || 0)
        if (data.soTien > remaining) {
          throw new Error(`Số tiền vượt quá số tiền còn nợ (${remaining.toLocaleString()} VND)`)
        }
      }
    } else if (data.refType === 'ARDocument') {
      const ar = mockARDocuments.find(a => a.id === data.refId)
      if (ar) {
        const remaining = ar.totalAmount - (ar.paidAmount || 0)
        if (data.soTien > remaining) {
          throw new Error(`Số tiền vượt quá số tiền còn nợ (${remaining.toLocaleString()} VND)`)
        }
      }
    }

    // TRANSACTION: 4 tầng cập nhật (hỗ trợ thanh toán 1 phần)
    console.log('🔄 Starting CASCADE UPDATE Transaction...')

    // 1. Tạo Phiếu Thu/Chi
    const phieuThuChi = {
      id: `pv-${Date.now()}`,
      ...data,
      ngayLap: new Date().toISOString().split('T')[0],
      status: 'DA_THANH_TOAN',
      createdAt: new Date().toISOString()
    }
    console.log('✅ 1. Created PhieuThuChi:', phieuThuChi.id)

    // 2. Cập nhật chứng từ gốc (Payment Proposal hoặc AR Document)
    if (data.refType === 'PaymentProposal') {
      const pp = mockPaymentProposals.find(p => p.id === data.refId)
      if (pp) {
        // Cộng dồn số tiền đã thanh toán
        pp.paidAmount = (pp.paidAmount || 0) + data.soTien
        
        // Nếu đã thanh toán đủ → chuyển status
        if (pp.paidAmount >= pp.totalAmount) {
          pp.status = 'DA_THANH_TOAN'
          console.log('✅ 2. Updated PaymentProposal:', pp.maDeXuat, '→ DA_THANH_TOAN (FULL)')

          // 3. Cập nhật toàn bộ PO items (chỉ khi thanh toán FULL)
          pp.items.forEach(item => {
            item.poStatus = 'DA_THANH_TOAN'
            
            // Cập nhật trong mockPurchaseOrders
            const po = mockPurchaseOrders.find(p => p.id === item.id)
            if (po) {
              po.status = 'DA_THANH_TOAN'
            }
            
            console.log('✅ 3. Updated PO:', item.maDon, '→ DA_THANH_TOAN')
          })
        } else {
          console.log(`✅ 2. Updated PaymentProposal: ${pp.maDeXuat} → PARTIAL (${pp.paidAmount}/${pp.totalAmount})`)
          console.log('⚠️ 3. PO items remain CHO_THANH_TOAN (partial payment)')
        }
      }
    } else if (data.refType === 'ARDocument') {
      const ar = mockARDocuments.find(a => a.id === data.refId)
      if (ar) {
        // Cộng dồn số tiền đã thu
        ar.paidAmount = (ar.paidAmount || 0) + data.soTien
        
        // Nếu đã thu đủ → chuyển status
        if (ar.paidAmount >= ar.totalAmount) {
          ar.status = 'DA_THU_TIEN'
          console.log('✅ 2. Updated ARDocument:', ar.maChungTu, '→ DA_THU_TIEN (FULL)')

          // 3. Cập nhật toàn bộ SO items (chỉ khi thu FULL)
          ar.items.forEach(item => {
            item.soStatus = 'DA_THU_TIEN'
            
            // Cập nhật trong mockSalesOrders
            const so = mockSalesOrders.find(s => s.id === item.id)
            if (so) {
              so.status = 'DA_THU_TIEN'
            }
            
            console.log('✅ 3. Updated SO:', item.maDon, '→ DA_THU_TIEN')
          })
        } else {
          console.log(`✅ 2. Updated ARDocument: ${ar.maChungTu} → PARTIAL (${ar.paidAmount}/${ar.totalAmount})`)
          console.log('⚠️ 3. SO items remain CHO_THU_TIEN (partial payment)')
        }
      }
    }

    // 4. Khấu trừ công nợ (giả lập)
    console.log('✅ 4. Deducted debt:', data.soTien.toLocaleString(), 'VND')

    console.log('✨ CASCADE UPDATE completed successfully!')

    mockPhieuThuChi.push(phieuThuChi)
    return phieuThuChi
  },

  // Lấy danh sách phiếu thu chi
  getPhieuThuChi: async () => {
    await delay(300)
    return mockPhieuThuChi
  },

  // ============= AR DASHBOARD APIs =============
  
  // Lấy tổng hợp công nợ khách hàng
  getARSummary: async (params) => {
    await delay(500)
    const { fromDate, toDate, customerId } = params
    
    // Lọc SO theo ngày và customer
    let filteredSO = mockSalesOrders.filter(so => {
      // Giả lập filter theo ngày (thực tế cần so sánh với createdDate của SO)
      if (customerId && so.customerId !== customerId) return false
      return true
    })

    // Group by customer
    const customerGroups = {}
    filteredSO.forEach(so => {
      if (!customerGroups[so.customerId]) {
        customerGroups[so.customerId] = {
          customerId: so.customerId,
          customerName: so.customer,
          orders: []
        }
      }
      customerGroups[so.customerId].orders.push(so)
    })

    // Tính toán cho từng customer
    const summary = Object.values(customerGroups).map(group => {
      // Công nợ tạm: >= DA_GIAO_THUC_TE (giả lập - trong thực tế cần status này)
      const totalSales = group.orders
        .filter(so => ['DA_DOI_CHIEU', 'CHO_THU_TIEN', 'DA_THU_TIEN'].includes(so.status))
        .reduce((sum, so) => sum + so.amount, 0)

      // Công nợ chính thức: >= DA_DOI_CHIEU
      const accountingAR = group.orders
        .filter(so => ['DA_DOI_CHIEU', 'CHO_THU_TIEN', 'DA_THU_TIEN'].includes(so.status))
        .reduce((sum, so) => sum + so.amount, 0)

      // Đã thanh toán: DA_THU_TIEN
      const paid = group.orders
        .filter(so => so.status === 'DA_THU_TIEN')
        .reduce((sum, so) => sum + so.amount, 0)

      // Còn lại
      const remaining = accountingAR - paid

      return {
        customerId: group.customerId,
        customerName: group.customerName,
        totalSales,
        accountingAR,
        paid,
        remaining
      }
    })

    return summary
  },

  // Lấy chi tiết đơn hàng của khách hàng
  getCustomerOrders: async (params) => {
    await delay(300)
    const { customerId, fromDate, toDate } = params
    
    const orders = mockSalesOrders
      .filter(so => so.customerId === customerId)
      .map(so => ({
        id: so.id,
        maDon: so.maDon,
        ngay: '01/01/2026', // Giả lập
        amount: so.amount,
        status: so.status,
        statusDisplay: so.status === 'DA_DOI_CHIEU' ? 'ĐÃ ĐỐI CHIẾU' 
          : so.status === 'CHO_THU_TIEN' ? 'ĐÃ ĐỐI CHIẾU'
          : so.status === 'DA_THU_TIEN' ? 'ĐÃ THU TIỀN'
          : 'ĐÃ NHẬN'
      }))

    return orders
  },

  // ============= AP DASHBOARD APIs =============
  
  // Lấy tổng hợp công nợ nhà cung cấp
  getAPSummary: async (params) => {
    await delay(500)
    const { fromDate, toDate, supplierId } = params
    
    // Lọc PO theo ngày và supplier
    let filteredPO = mockPurchaseOrders.filter(po => {
      if (supplierId && po.supplierId !== supplierId) return false
      return true
    })

    // Group by supplier
    const supplierGroups = {}
    filteredPO.forEach(po => {
      if (!supplierGroups[po.supplierId]) {
        supplierGroups[po.supplierId] = {
          supplierId: po.supplierId,
          supplierName: po.supplier,
          orders: []
        }
      }
      supplierGroups[po.supplierId].orders.push(po)
    })

    // Tính toán cho từng supplier
    const summary = Object.values(supplierGroups).map(group => {
      // Công nợ tạm: >= DA_DOI_CHIEU
      const totalPurchase = group.orders
        .filter(po => ['DA_DOI_CHIEU', 'CHO_THANH_TOAN', 'DA_THANH_TOAN'].includes(po.status))
        .reduce((sum, po) => sum + po.amount, 0)

      // Công nợ chính thức: >= DA_DOI_CHIEU  
      const accountingAP = group.orders
        .filter(po => ['DA_DOI_CHIEU', 'CHO_THANH_TOAN', 'DA_THANH_TOAN'].includes(po.status))
        .reduce((sum, po) => sum + po.amount, 0)

      // Đã thanh toán: DA_THANH_TOAN
      const paid = group.orders
        .filter(po => po.status === 'DA_THANH_TOAN')
        .reduce((sum, po) => sum + po.amount, 0)

      // Còn lại
      const remaining = accountingAP - paid

      return {
        supplierId: group.supplierId,
        supplierName: group.supplierName,
        totalPurchase,
        accountingAP,
        paid,
        remaining
      }
    })

    return summary
  },

  // Lấy chi tiết đơn hàng của nhà cung cấp
  getSupplierOrders: async (params) => {
    await delay(300)
    const { supplierId, fromDate, toDate } = params
    
    const orders = mockPurchaseOrders
      .filter(po => po.supplierId === supplierId)
      .map(po => ({
        id: po.id,
        maDon: po.maDon,
        ngay: '01/01/2026', // Giả lập
        amount: po.amount,
        status: po.status,
        statusDisplay: po.status === 'DA_DOI_CHIEU' ? 'ĐÃ ĐỐI CHIẾU'
          : po.status === 'CHO_THANH_TOAN' ? 'CHỜ THANH TOÁN'
          : po.status === 'DA_THANH_TOAN' ? 'ĐÃ THANH TOÁN'
          : 'MỚI'
      }))

    return orders
  },

  // ============= DASHBOARD TỔNG HỢP APIs =============
  
  // Lấy báo cáo tổng hợp (Summary Reports)
  getSummaryReports: async () => {
    await delay(300)
    
    // Tính Công nợ Khách hàng (AR)
    // Doanh số: tổng của SO đã đối chiếu trở lên
    const salesTotal = mockSalesOrders
      .filter(so => ['DA_DOI_CHIEU', 'CHO_THU_TIEN', 'DA_THU_TIEN'].includes(so.status))
      .reduce((sum, so) => sum + so.amount, 0)
    
    // Đã thu: tổng paidAmount của AR Documents
    const arReceived = mockARDocuments
      .reduce((sum, ar) => sum + (ar.paidAmount || 0), 0)
    
    // Chưa thu: doanh số - đã thu
    const arPending = salesTotal - arReceived

    // Đếm số lượng AR documents theo trạng thái
    const arStatusCounts = mockARDocuments.reduce((counts, ar) => {
      const totalAmount = ar.totalAmount || 0
      const paidAmount = ar.paidAmount || 0
      const paymentPercent = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
      
      if (ar.status === 'DA_THU_TIEN' || paymentPercent >= 100) {
        counts.completed++
      } else if (paymentPercent > 0) {
        counts.partial++
      } else if (ar.status === 'CHO_THU_TIEN') {
        counts.pending++
      } else {
        counts.new++
      }
      return counts
    }, { new: 0, pending: 0, partial: 0, completed: 0 })

    // Tính Công nợ Nhà cung cấp (AP)
    // Giá trị mua: tổng của PO đã đối chiếu trở lên
    const purchasesTotal = mockPurchaseOrders
      .filter(po => ['DA_DOI_CHIEU', 'CHO_THANH_TOAN', 'DA_THANH_TOAN'].includes(po.status))
      .reduce((sum, po) => sum + po.amount, 0)
    
    // Đã chi: tổng paidAmount của Payment Proposals
    const apPaid = mockPaymentProposals
      .reduce((sum, pp) => sum + (pp.paidAmount || 0), 0)
    
    // Chưa chi: giá trị mua - đã chi
    const apPending = purchasesTotal - apPaid

    // Đếm số lượng AP documents theo trạng thái
    const apStatusCounts = mockPaymentProposals.reduce((counts, pp) => {
      const totalAmount = pp.totalAmount || 0
      const paidAmount = pp.paidAmount || 0
      const paymentPercent = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
      
      if (pp.status === 'DA_THANH_TOAN' || paymentPercent >= 100) {
        counts.completed++
      } else if (paymentPercent > 0) {
        counts.partial++
      } else if (pp.status === 'CHO_THANH_TOAN') {
        counts.pending++
      } else {
        counts.new++
      }
      return counts
    }, { new: 0, pending: 0, partial: 0, completed: 0 })

    return {
      customer_ar: {
        sales: salesTotal,
        received: arReceived,
        pending: arPending,
        receivedPercent: salesTotal > 0 ? Math.round((arReceived / salesTotal) * 100) : 0,
        statusCounts: arStatusCounts
      },
      supplier_ap: {
        purchases: purchasesTotal,
        paid: apPaid,
        pending: apPending,
        paidPercent: purchasesTotal > 0 ? Math.round((apPaid / purchasesTotal) * 100) : 0,
        statusCounts: apStatusCounts
      }
    }
  },

  // Lấy danh sách AR Documents để xác nhận
  getARConfirmations: async () => {
    await delay(300)
    
    return mockARDocuments.map(ar => {
      const relatedOrders = mockSalesOrders.filter(so => so.arDocumentId === ar.id)
      const totalAmount = ar.totalAmount || 0
      const paidAmount = ar.paidAmount || 0
      return {
        ...ar,
        maAR: ar.maChungTu,
        amount: totalAmount,
        customer: relatedOrders[0]?.customer || 'N/A',
        orderCount: relatedOrders.length,
        paidAmount: paidAmount,
        remainingAmount: totalAmount - paidAmount,
        paymentPercent: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0,
        createdAt: ar.createdAt || '2026-01-01T10:00:00',
        statusDisplay: ar.status === 'MOI' ? 'MỚI'
          : ar.status === 'CHO_THU_TIEN' ? 'CHỜ THU TIỀN'
          : ar.status === 'PARTIAL' ? `ĐÃ THU ${Math.round((paidAmount / totalAmount) * 100)}%`
          : 'ĐÃ THANH TOÁN'
      }
    })
  },

  // Lấy danh sách Payment Proposals để xác nhận
  getAPConfirmations: async () => {
    await delay(300)
    
    return mockPaymentProposals.map(pp => {
      const relatedOrders = mockPurchaseOrders.filter(po => po.paymentProposalId === pp.id)
      const totalAmount = pp.totalAmount || 0
      const paidAmount = pp.paidAmount || 0
      return {
        ...pp,
        maPP: pp.maDeXuat,
        amount: totalAmount,
        supplier: relatedOrders[0]?.supplier || 'N/A',
        orderCount: relatedOrders.length,
        paidAmount: paidAmount,
        remainingAmount: totalAmount - paidAmount,
        paymentPercent: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0,
        createdAt: pp.createdAt || '2026-01-01T10:00:00',
        statusDisplay: pp.status === 'MOI' ? 'MỚI'
          : pp.status === 'CHO_THANH_TOAN' ? 'CHỜ THANH TOÁN'
          : pp.status === 'PARTIAL' ? `ĐÃ CHI ${Math.round((paidAmount / totalAmount) * 100)}%`
          : 'ĐÃ THANH TOÁN'
      }
    })
  },

  // Lấy danh sách Phiếu Thu gần đây
  getRecentReceipts: async (params = {}) => {
    await delay(300)
    const { limit = 10, fromDate, toDate } = params
    
    return mockPhieuThuChi
      .filter(p => p.loaiPhieu === 'THU')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .map(p => ({
        ...p,
        statusDisplay: p.status === 'DA_THANH_TOAN' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN',
        hasImage: !!p.billImage
      }))
  },

  // Lấy danh sách Phiếu Chi gần đây
  getRecentPayments: async (params = {}) => {
    await delay(300)
    const { limit = 10, fromDate, toDate } = params
    
    return mockPhieuThuChi
      .filter(p => p.loaiPhieu === 'CHI')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .map(p => ({
        ...p,
        statusDisplay: p.status === 'DA_THANH_TOAN' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN',
        hasImage: !!p.billImage,
        needsImage: p.phuongThuc === 'CHUYEN_KHOAN' && !p.billImage
      }))
  }
}
