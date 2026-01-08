// Mock data theo QUY TRÌNH QUẢN LÝ CÔNG NỢ.md
// Bao gồm: PO/SO độc lập → Payment Proposal → AR Document

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ============= PURCHASE ORDERS (Đơn mua hàng) =============
export const mockPurchaseOrders = [
  // Đơn chưa gom
  { 
    id: "po-001", 
    maDon: "PO-001", 
    supplier: "NCC Rau Sạch Đà Lạt",
    supplierId: "sup-001",
    amount: 5000000, 
    status: "DA_DOI_CHIEU",  // Đã đối chiếu, sẵn sàng gom
    paymentProposalId: null
  },
  { 
    id: "po-002", 
    maDon: "PO-002", 
    supplier: "NCC Rau Sạch Đà Lạt",
    supplierId: "sup-001",
    amount: 5000000, 
    status: "DA_DOI_CHIEU",
    paymentProposalId: null
  },
  { 
    id: "po-003", 
    maDon: "PO-003", 
    supplier: "Nhà cung cấp Vật tư Y tế",
    supplierId: "sup-002",
    amount: 8000000, 
    status: "DA_DOI_CHIEU",
    paymentProposalId: null
  },
  { 
    id: "po-004", 
    maDon: "PO-004", 
    supplier: "Nhà cung cấp Vật tư Y tế",
    supplierId: "sup-002",
    amount: 7000000, 
    status: "DA_DOI_CHIEU",
    paymentProposalId: null
  },
  // Đơn chưa đối chiếu - KHÔNG hiện trong gom đơn
  { 
    id: "po-999", 
    maDon: "PO-999", 
    supplier: "NCC Test",
    supplierId: "sup-999",
    amount: 1000000, 
    status: "MOI",  // Chưa đối chiếu
    paymentProposalId: null
  },
  // Đơn đã gom vào PP
  { 
    id: "po-888", 
    maDon: "PO-888", 
    supplier: "Công ty Phân bón Xanh",
    supplierId: "sup-003",
    amount: 20000000, 
    status: "CHO_THANH_TOAN",
    paymentProposalId: "pp-001"  // Đã gom vào PP-001
  },
  { 
    id: "po-889", 
    maDon: "PO-889", 
    supplier: "Công ty Phân bón Xanh",
    supplierId: "sup-003",
    amount: 30000000, 
    status: "CHO_THANH_TOAN",
    paymentProposalId: "pp-001"
  }
]

// ============= SALES ORDERS (Đơn bán hàng) =============
export const mockSalesOrders = [
  // Đơn chưa gom
  { 
    id: "so-100", 
    maDon: "SO-100", 
    customer: "Hệ thống Siêu thị WinMart",
    customerId: "cus-001",
    amount: 8000000, 
    status: "DA_DOI_CHIEU",
    arDocumentId: null
  },
  { 
    id: "so-101", 
    maDon: "SO-101", 
    customer: "Hệ thống Siêu thị WinMart",
    customerId: "cus-001",
    amount: 9000000, 
    status: "DA_DOI_CHIEU",
    arDocumentId: null
  },
  { 
    id: "so-102", 
    maDon: "SO-102", 
    customer: "Hệ thống Siêu thị WinMart",
    customerId: "cus-001",
    amount: 8000000, 
    status: "DA_DOI_CHIEU",
    arDocumentId: null
  },
  { 
    id: "so-200", 
    maDon: "SO-200", 
    customer: "Cửa hàng Thực phẩm Sạch B",
    customerId: "cus-002",
    amount: 6000000, 
    status: "DA_DOI_CHIEU",
    arDocumentId: null
  },
  { 
    id: "so-201", 
    maDon: "SO-201", 
    customer: "Cửa hàng Thực phẩm Sạch B",
    customerId: "cus-002",
    amount: 4000000, 
    status: "DA_DOI_CHIEU",
    arDocumentId: null
  },
  // Đơn đã gom vào AR
  { 
    id: "so-111", 
    maDon: "SO-111", 
    customer: "Cửa hàng Thực phẩm Sạch A",
    customerId: "cus-003",
    amount: 15000000, 
    status: "CHO_THU_TIEN",
    arDocumentId: "ar-001"
  }
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
  // Lấy PO chưa gom (DA_DOI_CHIEU và chưa có PP)
  getAvailablePurchaseOrders: async (supplierId = null) => {
    await delay(300)
    let pos = mockPurchaseOrders.filter(po => 
      po.status === 'DA_DOI_CHIEU' && !po.paymentProposalId
    )
    if (supplierId) {
      pos = pos.filter(po => po.supplierId === supplierId)
    }
    return pos
  },

  // Lấy SO chưa gom (DA_DOI_CHIEU và chưa có AR)
  getAvailableSalesOrders: async (customerId = null) => {
    await delay(300)
    let sos = mockSalesOrders.filter(so => 
      so.status === 'DA_DOI_CHIEU' && !so.arDocumentId
    )
    if (customerId) {
      sos = sos.filter(so => so.customerId === customerId)
    }
    return sos
  },

  // Lấy danh sách suppliers có PO
  getSuppliers: async () => {
    await delay(200)
    const suppliers = [...new Set(mockPurchaseOrders.map(po => po.supplierId))]
    return suppliers.map(id => {
      const po = mockPurchaseOrders.find(p => p.supplierId === id)
      return { id, name: po.supplier }
    })
  },

  // Lấy danh sách customers có SO
  getCustomers: async () => {
    await delay(200)
    const customers = [...new Set(mockSalesOrders.map(so => so.customerId))]
    return customers.map(id => {
      const so = mockSalesOrders.find(s => s.customerId === id)
      return { id, name: so.customer }
    })
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

    return {
      customer_ar: {
        sales: salesTotal,
        received: arReceived,
        pending: arPending,
        receivedPercent: salesTotal > 0 ? Math.round((arReceived / salesTotal) * 100) : 0
      },
      supplier_ap: {
        purchases: purchasesTotal,
        paid: apPaid,
        pending: apPending,
        paidPercent: purchasesTotal > 0 ? Math.round((apPaid / purchasesTotal) * 100) : 0
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
