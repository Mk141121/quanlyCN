// Mock data theo ĐÚNG SPEC - KHÔNG TỰ SUY DIỄN
// Theo file: TECHNICAL SPEC: FORM THU - CHI ERP (AR/AP CORE).md

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ============= AP: ĐỀ XUẤT THANH TOÁN (Payment Proposal) =============
export const mockPaymentProposals = [
  {
    id: "pp-001",
    maDeXuat: "DXTT-2026-001",
    doiTuong: "Công ty Phân bón Xanh",
    totalAmount: 50000000,
    status: "CHO_THANH_TOAN",
    items: [
      { id: "po-001", maDon: "PO-888", amount: 20000000, poStatus: "CHO_THANH_TOAN" },
      { id: "po-002", maDon: "PO-889", amount: 30000000, poStatus: "CHO_THANH_TOAN" }
    ]
  },
  {
    id: "pp-002",
    maDeXuat: "DXTT-2026-002",
    doiTuong: "Nhà cung cấp Vật tư Y tế",
    totalAmount: 35000000,
    status: "CHO_THANH_TOAN",
    items: [
      { id: "po-003", maDon: "PO-890", amount: 35000000, poStatus: "CHO_THANH_TOAN" }
    ]
  },
  {
    id: "pp-003",
    maDeXuat: "DXTT-2026-003",
    doiTuong: "Công ty Điện tử ABC",
    totalAmount: 80000000,
    status: "DA_THANH_TOAN",
    items: [
      { id: "po-004", maDon: "PO-891", amount: 45000000, poStatus: "DA_THANH_TOAN" },
      { id: "po-005", maDon: "PO-892", amount: 35000000, poStatus: "DA_THANH_TOAN" }
    ]
  }
]

// ============= AR: CHỨNG TỪ CÔNG NỢ (AR Document) =============
export const mockARDocuments = [
  {
    id: "ar-001",
    maChungTu: "AR-2026-999",
    doiTuong: "Cửa hàng Thực phẩm Sạch A",
    totalAmount: 15000000,
    status: "CHO_THU_TIEN",
    items: [
      { id: "so-001", maDon: "SO-111", amount: 15000000, soStatus: "CHO_THU_TIEN" }
    ]
  },
  {
    id: "ar-002",
    maChungTu: "AR-2026-998",
    doiTuong: "Siêu thị Mini XYZ",
    totalAmount: 45000000,
    status: "CHO_THU_TIEN",
    items: [
      { id: "so-002", maDon: "SO-112", amount: 25000000, soStatus: "CHO_THU_TIEN" },
      { id: "so-003", maDon: "SO-113", amount: 20000000, soStatus: "CHO_THU_TIEN" }
    ]
  },
  {
    id: "ar-003",
    maChungTu: "AR-2026-997",
    doiTuong: "Nhà hàng Hải Sản B",
    totalAmount: 30000000,
    status: "DA_THANH_TOAN",
    items: [
      { id: "so-004", maDon: "SO-114", amount: 30000000, soStatus: "DA_THANH_TOAN" }
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
  },
  {
    id: "pv-002",
    loaiPhieu: "THU",
    ngayLap: "2026-01-06",
    phuongThuc: "TIEN_MAT",
    soTien: 15000000,
    billImage: null,
    status: "DA_THANH_TOAN",
    refId: "ar-001",
    refType: "ARDocument"
  }
]

// ============= API MOCK =============
export const mockAPI = {
  // Lấy danh sách Payment Proposals (AP - Phiếu chi)
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

  // Lấy danh sách AR Documents (AR - Phiếu thu)
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

    // TRANSACTION: 4 tầng cập nhật
    console.log('🔄 Starting CASCADE UPDATE Transaction...')

    // 1. Tạo Phiếu Thu/Chi
    const phieuThuChi = {
      id: `pv-${Date.now()}`,
      ...data,
      ngayLap: new Date().toISOString().split('T')[0],
      status: 'DA_THANH_TOAN'
    }
    console.log('✅ 1. Created PhieuThuChi:', phieuThuChi.id)

    // 2. Cập nhật chứng từ gốc (Payment Proposal hoặc AR Document)
    if (data.refType === 'PaymentProposal') {
      const pp = mockPaymentProposals.find(p => p.id === data.refId)
      if (pp) {
        pp.status = 'DA_THANH_TOAN'
        console.log('✅ 2. Updated PaymentProposal:', pp.maDeXuat, '→ DA_THANH_TOAN')

        // 3. Cập nhật toàn bộ PO items
        pp.items.forEach(item => {
          item.poStatus = 'DA_THANH_TOAN'
          console.log('✅ 3. Updated PO:', item.maDon, '→ DA_THANH_TOAN')
        })
      }
    } else if (data.refType === 'ARDocument') {
      const ar = mockARDocuments.find(a => a.id === data.refId)
      if (ar) {
        ar.status = 'DA_THANH_TOAN'
        console.log('✅ 2. Updated ARDocument:', ar.maChungTu, '→ DA_THANH_TOAN')

        // 3. Cập nhật toàn bộ SO items
        ar.items.forEach(item => {
          item.soStatus = 'DA_THANH_TOAN'
          console.log('✅ 3. Updated SO:', item.maDon, '→ DA_THANH_TOAN')
        })
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
  }
}
