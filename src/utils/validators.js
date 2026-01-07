// Validation utilities cho form
import { message } from 'antd'

export const validators = {
  // Validate số tiền
  amount: {
    required: true,
    message: 'Vui lòng nhập số tiền',
    validator: (_, value) => {
      if (!value || value <= 0) {
        return Promise.reject('Số tiền phải lớn hơn 0')
      }
      if (value > 999999999999) {
        return Promise.reject('Số tiền quá lớn')
      }
      return Promise.resolve()
    }
  },

  // Validate file upload
  file: (file) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']

    if (file.size > maxSize) {
      message.error('File phải nhỏ hơn 10MB')
      return false
    }

    if (!allowedTypes.includes(file.type)) {
      message.error('Chỉ chấp nhận file JPG, PNG, PDF')
      return false
    }

    return true
  },

  // Validate partner selection
  partner: {
    required: true,
    message: 'Vui lòng chọn đối tác'
  },

  // Validate reason
  reason: {
    max: 500,
    message: 'Lý do không được quá 500 ký tự'
  },

  // Validate note
  note: {
    max: 1000,
    message: 'Ghi chú không được quá 1000 ký tự'
  }
}

// Business validation
export const businessValidators = {
  // Kiểm tra vượt công nợ
  checkDebtLimit: (amount, debt) => {
    if (!debt) return { valid: true }
    
    if (amount > debt.balance) {
      return {
        valid: false,
        message: `Số tiền vượt công nợ hiện tại (${debt.balance.toLocaleString()} VND)`,
        severity: 'error'
      }
    }
    return { valid: true }
  },

  // Kiểm tra chuyển khoản phải có chứng từ
  checkBankTransferAttachment: (paymentMethod, attachments) => {
    if (paymentMethod === 'CHUYEN_KHOAN' && (!attachments || attachments.length === 0)) {
      return {
        valid: false,
        message: 'Thanh toán chuyển khoản cần upload chứng từ',
        severity: 'error'
      }
    }
    return { valid: true }
  },

  // Kiểm tra có chọn chứng từ công nợ chưa
  checkDocumentSelection: (partner, documents) => {
    if (partner && documents.length === 0) {
      return {
        valid: true, // Không block, chỉ warning
        message: 'Chưa chọn chứng từ công nợ (AR/AP)',
        severity: 'info'
      }
    }
    return { valid: true }
  },

  // Kiểm tra số tiền phân bổ
  checkAllocationAmount: (amount, documents) => {
    const totalAllocated = documents.reduce((sum, doc) => sum + (doc.allocatedAmount || 0), 0)
    
    if (totalAllocated > amount) {
      return {
        valid: false,
        message: 'Tổng phân bổ vượt số tiền thanh toán',
        severity: 'error'
      }
    }

    if (totalAllocated < amount) {
      return {
        valid: true,
        message: `Còn ${(amount - totalAllocated).toLocaleString()} VND chưa phân bổ`,
        severity: 'warning'
      }
    }

    return { valid: true }
  },

  // Validate toàn bộ form
  validateAll: (formData) => {
    const errors = []

    // Check debt limit
    const debtCheck = businessValidators.checkDebtLimit(formData.amount, formData.debt)
    if (!debtCheck.valid) errors.push(debtCheck)

    // Check bank transfer
    const bankCheck = businessValidators.checkBankTransferAttachment(
      formData.paymentMethod,
      formData.attachments
    )
    if (!bankCheck.valid) errors.push(bankCheck)

    // Check document selection
    const docCheck = businessValidators.checkDocumentSelection(
      formData.partner,
      formData.documents
    )
    if (!docCheck.valid) errors.push(docCheck)

    // Check allocation
    if (formData.documents.length > 0) {
      const allocCheck = businessValidators.checkAllocationAmount(
        formData.amount,
        formData.documents
      )
      if (!allocCheck.valid) errors.push(allocCheck)
    }

    return {
      valid: !errors.some(e => e.severity === 'error'),
      errors
    }
  }
}

// Format helpers
export const formatters = {
  // Format số tiền VND
  currency: (amount) => {
    if (!amount) return '0 VND'
    return `${amount.toLocaleString('vi-VN')} VND`
  },

  // Format ngày
  date: (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('vi-VN')
  },

  // Format datetime
  datetime: (date) => {
    if (!date) return ''
    return new Date(date).toLocaleString('vi-VN')
  },

  // Format file size
  fileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }
}

// Constants
export const CONSTANTS = {
  RECEIPT_TYPE: {
    THU: { label: 'Phiếu thu', color: 'blue', icon: '⬇' },
    CHI: { label: 'Phiếu chi', color: 'red', icon: '⬆' }
  },

  OBJECT_TYPE: {
    KHACH_HANG: { label: 'Khách hàng' },
    NHA_CUNG_CAP: { label: 'Nhà cung cấp' }
  },

  PAYMENT_METHOD: {
    TIEN_MAT: { label: 'Tiền mặt', icon: '💵' },
    CHUYEN_KHOAN: { label: 'Chuyển khoản', icon: '🏦' }
  },

  STATUS: {
    PENDING_APPROVAL: { label: 'Chờ duyệt', color: 'orange' },
    APPROVED: { label: 'Đã duyệt', color: 'green' },
    REJECTED: { label: 'Từ chối', color: 'red' },
    COMPLETED: { label: 'Hoàn thành', color: 'blue' }
  },

  AR_AP_STATUS: {
    CHO_THU: { label: 'Chờ thu', color: 'orange' },
    CHO_CHI: { label: 'Chờ chi', color: 'orange' },
    DA_THANH_TOAN: { label: 'Đã thanh toán', color: 'green' },
    QUA_HAN: { label: 'Quá hạn', color: 'red' }
  },

  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf']
}
