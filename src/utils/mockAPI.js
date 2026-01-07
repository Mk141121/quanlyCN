// Mock API để simulate backend ERP
// Trong production, thay thế bằng API thực

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Mock data
const mockPartners = {
  KHACH_HANG: [
    { id: 'KH001', code: 'KH001', name: 'Công ty TNHH ABC', type: 'KHACH_HANG' },
    { id: 'KH002', code: 'KH002', name: 'Công ty CP XYZ', type: 'KHACH_HANG' },
    { id: 'KH003', code: 'KH003', name: 'Doanh nghiệp tư nhân DEF', type: 'KHACH_HANG' },
    { id: 'KH004', code: 'KH004', name: 'Công ty TNHH GHI', type: 'KHACH_HANG' },
  ],
  NHA_CUNG_CAP: [
    { id: 'NCC001', code: 'NCC001', name: 'Nhà cung cấp Vật liệu A', type: 'NHA_CUNG_CAP' },
    { id: 'NCC002', code: 'NCC002', name: 'Nhà cung cấp Thiết bị B', type: 'NHA_CUNG_CAP' },
    { id: 'NCC003', code: 'NCC003', name: 'Nhà cung cấp Dịch vụ C', type: 'NHA_CUNG_CAP' },
  ]
}

const mockDebts = {
  'KH001': { partnerId: 'KH001', balance: 50000000, currency: 'VND' },
  'KH002': { partnerId: 'KH002', balance: 120000000, currency: 'VND' },
  'KH003': { partnerId: 'KH003', balance: 30000000, currency: 'VND' },
  'KH004': { partnerId: 'KH004', balance: 0, currency: 'VND' },
  'NCC001': { partnerId: 'NCC001', balance: 80000000, currency: 'VND' },
  'NCC002': { partnerId: 'NCC002', balance: 45000000, currency: 'VND' },
  'NCC003': { partnerId: 'NCC003', balance: 60000000, currency: 'VND' },
}

const mockARAPDocuments = {
  'KH001': [
    {
      id: 'AR001',
      code: 'HD-2024-001',
      partnerId: 'KH001',
      date: '2024-01-15',
      documentType: 'INVOICE',
      totalAmount: 50000000,
      paidAmount: 0,
      remainingAmount: 50000000,
      status: 'CHO_THU',
      dueDate: '2024-02-15'
    },
  ],
  'KH002': [
    {
      id: 'AR002',
      code: 'HD-2024-002',
      partnerId: 'KH002',
      date: '2024-01-10',
      documentType: 'INVOICE',
      totalAmount: 80000000,
      paidAmount: 0,
      remainingAmount: 80000000,
      status: 'CHO_THU',
      dueDate: '2024-02-10'
    },
    {
      id: 'AR003',
      code: 'HD-2024-003',
      partnerId: 'KH002',
      date: '2024-01-20',
      documentType: 'ORDER',
      totalAmount: 40000000,
      paidAmount: 0,
      remainingAmount: 40000000,
      status: 'CHO_THU',
      dueDate: '2024-02-20'
    },
  ],
  'KH003': [
    {
      id: 'AR004',
      code: 'HD-2024-004',
      partnerId: 'KH003',
      date: '2024-01-05',
      documentType: 'CONTRACT',
      totalAmount: 30000000,
      paidAmount: 0,
      remainingAmount: 30000000,
      status: 'CHO_THU',
      dueDate: '2024-02-05'
    },
  ],
  'NCC001': [
    {
      id: 'AP001',
      code: 'PO-2024-001',
      partnerId: 'NCC001',
      date: '2024-01-12',
      documentType: 'INVOICE',
      totalAmount: 80000000,
      paidAmount: 0,
      remainingAmount: 80000000,
      status: 'CHO_CHI',
      dueDate: '2024-02-12'
    },
  ],
  'NCC002': [
    {
      id: 'AP002',
      code: 'PO-2024-002',
      partnerId: 'NCC002',
      date: '2024-01-08',
      documentType: 'ORDER',
      totalAmount: 45000000,
      paidAmount: 0,
      remainingAmount: 45000000,
      status: 'CHO_CHI',
      dueDate: '2024-02-08'
    },
  ],
  'NCC003': [
    {
      id: 'AP003',
      code: 'PO-2024-003',
      partnerId: 'NCC003',
      date: '2024-01-18',
      documentType: 'INVOICE',
      totalAmount: 60000000,
      paidAmount: 0,
      remainingAmount: 60000000,
      status: 'CHO_CHI',
      dueDate: '2024-02-18'
    },
  ],
}

export const mockAPI = {
  // Lấy danh sách đối tác
  getPartnerList: (type) => {
    return mockPartners[type] || []
  },

  // Lấy thông tin đối tác
  getPartnerById: async (id, type) => {
    await delay(300)
    const partners = mockPartners[type] || []
    const partner = partners.find(p => p.id === id)
    if (!partner) {
      throw new Error('Không tìm thấy đối tác')
    }
    return partner
  },

  // Lấy thông tin công nợ
  getPartnerDebt: async (partnerId, type) => {
    await delay(300)
    const debt = mockDebts[partnerId]
    if (!debt) {
      return { partnerId, balance: 0, currency: 'VND' }
    }
    return debt
  },

  // Lấy danh sách AR/AP documents
  getARAPDocuments: async (partnerId, status) => {
    await delay(500)
    const documents = mockARAPDocuments[partnerId] || []
    return documents.filter(doc => doc.status === status)
  },

  // Tạo phiếu thu/chi
  createReceiptPayment: async (payload) => {
    await delay(1000)
    
    // Validate logic
    if (!payload.amount || payload.amount <= 0) {
      throw new Error('Số tiền không hợp lệ')
    }

    if (payload.paymentMethod === 'CHUYEN_KHOAN' && (!payload.attachments || payload.attachments.length === 0)) {
      throw new Error('Thanh toán chuyển khoản cần upload chứng từ')
    }

    // Giả lập tạo mới thành công
    const newReceipt = {
      id: `${payload.type}-${Date.now()}`,
      ...payload,
      status: 'PENDING_APPROVAL', // Backend sẽ set trạng thái
      createdAt: new Date().toISOString(),
      createdBy: 'user001'
    }

    console.log('✅ Created receipt/payment:', newReceipt)
    
    return newReceipt
  },

  // Validate có thể tạo phiếu không
  validateReceiptPayment: async (payload) => {
    await delay(200)
    
    const errors = []

    // Check 1: Vượt công nợ
    if (payload.partnerId) {
      const debt = mockDebts[payload.partnerId]
      if (debt && payload.amount > debt.balance) {
        errors.push({
          field: 'amount',
          message: `Số tiền vượt công nợ (${debt.balance.toLocaleString()} VND)`
        })
      }
    }

    // Check 2: Chuyển khoản chưa upload
    if (payload.paymentMethod === 'CHUYEN_KHOAN' && !payload.attachments?.length) {
      errors.push({
        field: 'attachments',
        message: 'Cần upload chứng từ chuyển khoản'
      })
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export cho testing
export const resetMockData = () => {
  // Function để reset mock data nếu cần
  console.log('Mock data reset')
}
