/**
 * Print Utilities - Tiện ích in ấn cho Form Hành chính
 */

// Số chuyển chữ
const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi']

const readThreeDigits = (num) => {
  const hundred = Math.floor(num / 100)
  const ten = Math.floor((num % 100) / 10)
  const one = num % 10

  let result = ''
  if (hundred > 0) {
    result += ones[hundred] + ' trăm '
    if (ten === 0 && one > 0) result += 'lẻ '
  }
  if (ten > 0) {
    result += tens[ten] + ' '
    if (one === 1) result += 'mốt '
    else if (one === 5) result += 'lăm '
    else result += ones[one]
  } else if (one > 0) {
    result += ones[one]
  }
  return result.trim()
}

export const numberToWords = (num) => {
  if (num === 0) return 'không'
  if (!num || isNaN(num)) return ''

  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ']
  let result = ''
  let unitIndex = 0

  while (num > 0) {
    const threeDigits = num % 1000
    if (threeDigits > 0) {
      const words = readThreeDigits(threeDigits)
      result = words + ' ' + units[unitIndex] + ' ' + result
    }
    num = Math.floor(num / 1000)
    unitIndex++
  }

  result = result.trim()
  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng'
}

// Format ngày tháng
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return ''
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year)
}

// Format tiền tệ
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0'
  return new Intl.NumberFormat('vi-VN').format(amount)
}

// Get paper size dimensions
const getPaperDimensions = (paperSize, orientation) => {
  const sizes = {
    'A4': { width: 210, height: 297 },
    'A5': { width: 148, height: 210 },
    'Letter': { width: 216, height: 279 },
    'Legal': { width: 216, height: 356 },
    'B5': { width: 176, height: 250 }
  }
  
  const size = sizes[paperSize] || sizes['A4']
  
  if (orientation === 'landscape') {
    return { width: size.height, height: size.width }
  }
  return size
}

// Print document
export const printDocument = (elementId, title = 'In phiếu', styles = '', customPrintSettings = null) => {
  const printContent = document.getElementById(elementId)
  if (!printContent) {
    console.error('Element not found:', elementId)
    return
  }

  // Get print settings from config or use custom
  const config = getCompanyConfig()
  const ps = customPrintSettings || config.printSettings || DEFAULT_COMPANY_CONFIG.printSettings
  const paperDims = getPaperDimensions(ps.paperSize, ps.orientation)
  
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @page {
          size: ${ps.paperSize} ${ps.orientation};
          margin: ${ps.marginTop}mm ${ps.marginRight}mm ${ps.marginBottom}mm ${ps.marginLeft}mm;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: ${ps.fontSize}pt;
          line-height: 1.4;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 20px;
        }
        
        .print-container {
          max-width: ${paperDims.width}mm;
          margin: 0 auto;
        }
        
        /* Header styles */
        .print-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .company-info {
          text-align: left;
        }
        
        .company-name {
          font-weight: bold;
          font-size: 14pt;
        }
        
        .doc-info {
          text-align: right;
        }
        
        /* Title */
        .print-title {
          text-align: center;
          font-size: 18pt;
          font-weight: bold;
          text-transform: uppercase;
          margin: 20px 0;
        }
        
        .print-subtitle {
          text-align: center;
          font-style: italic;
          margin-bottom: 20px;
        }
        
        /* Content rows */
        .print-row {
          display: flex;
          margin-bottom: 8px;
        }
        
        .print-label {
          font-weight: bold;
          min-width: 150px;
        }
        
        .print-value {
          flex: 1;
        }
        
        /* Table styles */
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        
        .print-table th,
        .print-table td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        
        .print-table th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
        }
        
        .print-table td.text-right {
          text-align: right;
        }
        
        .print-table td.text-center {
          text-align: center;
        }
        
        .print-table tfoot td {
          font-weight: bold;
          background-color: #f9f9f9;
        }
        
        /* Amount in words */
        .amount-words {
          font-style: italic;
          margin: 15px 0;
        }
        
        /* Signatures */
        .print-signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
          text-align: center;
        }
        
        .signature-block {
          flex: 1;
          min-width: 100px;
        }
        
        .signature-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .signature-note {
          font-size: 9pt;
          font-style: italic;
          color: #666;
        }
        
        .signature-space {
          height: 70px;
          min-height: 70px;
        }
        
        .signature-name {
          font-weight: bold;
        }
        
        /* Notes */
        .print-notes {
          margin-top: 20px;
          padding: 10px;
          border: 1px dashed #999;
          font-style: italic;
        }
        
        /* Custom styles */
        ${styles}
        
        @media print {
          body {
            padding: 0;
          }
          
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      ${printContent.innerHTML}
    </body>
    </html>
  `)
  
  printWindow.document.close()
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
    // Don't auto close - let user decide
  }
}

// Generate unique document number
export const generateDocNumber = (prefix = 'PC', date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}${year}${month}${day}-${random}`
}

// Default print templates
export const DEFAULT_TEMPLATES = {
  PHIEU_THU: {
    id: 'PHIEU_THU',
    name: 'Phiếu Thu',
    prefix: 'PT',
    layoutType: 'phieu_thu_chi', // Layout: phieu_thu_chi, de_xuat, de_xuat_thanh_toan, generic
    description: 'Mẫu phiếu thu tiền mặt/chuyển khoản',
    printSettings: {
      paperSize: 'A4',
      orientation: 'portrait',
      fontSize: 13,
      marginTop: 15,
      marginRight: 15,
      marginBottom: 15,
      marginLeft: 15
    },
    fields: [
      { key: 'maPhieu', label: 'Số phiếu', required: true },
      { key: 'ngayLap', label: 'Ngày lập', type: 'date', required: true },
      { key: 'nguoiNop', label: 'Người nộp tiền', required: true },
      { key: 'diaChi', label: 'Địa chỉ', required: false },
      { key: 'lyDo', label: 'Lý do thu', required: true },
      { key: 'soTien', label: 'Số tiền', type: 'currency', required: true },
      { key: 'hinhThuc', label: 'Hình thức', type: 'select', options: ['Tiền mặt', 'Chuyển khoản'], required: true },
      { key: 'ghiChu', label: 'Ghi chú', required: false }
    ]
  },
  PHIEU_CHI: {
    id: 'PHIEU_CHI',
    name: 'Phiếu Chi',
    prefix: 'PC',
    layoutType: 'phieu_thu_chi',
    description: 'Mẫu phiếu chi tiền mặt/chuyển khoản',
    printSettings: {
      paperSize: 'A4',
      orientation: 'portrait',
      fontSize: 13,
      marginTop: 15,
      marginRight: 15,
      marginBottom: 15,
      marginLeft: 15
    },
    fields: [
      { key: 'maPhieu', label: 'Số phiếu', required: true },
      { key: 'ngayLap', label: 'Ngày lập', type: 'date', required: true },
      { key: 'nguoiNhan', label: 'Người nhận tiền', required: true },
      { key: 'diaChi', label: 'Địa chỉ', required: false },
      { key: 'lyDo', label: 'Lý do chi', required: true },
      { key: 'soTien', label: 'Số tiền', type: 'currency', required: true },
      { key: 'hinhThuc', label: 'Hình thức', type: 'select', options: ['Tiền mặt', 'Chuyển khoản'], required: true },
      { key: 'ghiChu', label: 'Ghi chú', required: false }
    ]
  },
  DE_XUAT_CHI: {
    id: 'DE_XUAT_CHI',
    name: 'Đề xuất Chi',
    prefix: 'DXC',
    layoutType: 'de_xuat',
    description: 'Mẫu đề xuất chi phí nội bộ',
    printSettings: {
      paperSize: 'A4',
      orientation: 'portrait',
      fontSize: 13,
      marginTop: 15,
      marginRight: 15,
      marginBottom: 15,
      marginLeft: 15
    },
    fields: [
      { key: 'maDeXuat', label: 'Số đề xuất', required: true },
      { key: 'ngayLap', label: 'Ngày lập', type: 'date', required: true },
      { key: 'nguoiDeXuat', label: 'Người đề xuất', required: true },
      { key: 'phongBan', label: 'Phòng ban', required: true },
      { key: 'noiDung', label: 'Nội dung đề xuất', type: 'textarea', required: true },
      { key: 'soTien', label: 'Số tiền', type: 'currency', required: true },
      { key: 'lyDo', label: 'Lý do', required: true },
      { key: 'ghiChu', label: 'Ghi chú', required: false }
    ]
  },
  DE_XUAT_THANH_TOAN: {
    id: 'DE_XUAT_THANH_TOAN',
    name: 'Đề xuất Thanh toán',
    prefix: 'DXTT',
    layoutType: 'de_xuat_thanh_toan',
    description: 'Mẫu đề xuất thanh toán cho nhà cung cấp',
    printSettings: {
      paperSize: 'A4',
      orientation: 'landscape',
      fontSize: 12,
      marginTop: 8,
      marginRight: 8,
      marginBottom: 8,
      marginLeft: 8,
      scale: 0.85 // Scale xuống để fit 1 trang
    },
    fields: [
      { key: 'maDeXuat', label: 'Số đề xuất', required: true },
      { key: 'ngayLap', label: 'Ngày lập', type: 'date', required: true },
      { key: 'nguoiDeXuat', label: 'Người đề xuất', required: true },
      { key: 'nhaCungCap', label: 'Nhà cung cấp', required: true },
      { key: 'danhSachDon', label: 'Danh sách đơn hàng', type: 'table', required: true },
      { key: 'tongTien', label: 'Tổng tiền', type: 'currency', required: true },
      { key: 'hanThanhToan', label: 'Hạn thanh toán', type: 'date', required: false },
      { key: 'ghiChu', label: 'Ghi chú', required: false }
    ]
  }
}

// Save template to localStorage
export const saveTemplate = (template) => {
  const templates = getTemplates()
  const existingIndex = templates.findIndex(t => t.id === template.id)
  
  if (existingIndex >= 0) {
    templates[existingIndex] = template
  } else {
    templates.push(template)
  }
  
  localStorage.setItem('print_templates', JSON.stringify(templates))
  return templates
}

// Get all templates from localStorage (merge with defaults to get latest settings)
export const getTemplates = () => {
  const defaults = Object.values(DEFAULT_TEMPLATES)
  try {
    const saved = localStorage.getItem('print_templates')
    if (saved) {
      const savedTemplates = JSON.parse(saved)
      // Merge saved templates with defaults to ensure latest printSettings are applied
      return defaults.map(defaultTemplate => {
        const savedTemplate = savedTemplates.find(t => t.id === defaultTemplate.id)
        if (savedTemplate) {
          // Merge: keep saved data but ensure printSettings from defaults
          return {
            ...defaultTemplate,
            ...savedTemplate,
            printSettings: {
              ...defaultTemplate.printSettings,
              ...savedTemplate.printSettings
            }
          }
        }
        return defaultTemplate
      })
    }
  } catch (e) {
    console.error('Error loading templates:', e)
  }
  return defaults
}

// Delete template
export const deleteTemplate = (templateId) => {
  const templates = getTemplates().filter(t => t.id !== templateId)
  localStorage.setItem('print_templates', JSON.stringify(templates))
  return templates
}

// Reset to default templates
export const resetTemplates = () => {
  localStorage.removeItem('print_templates')
  return Object.values(DEFAULT_TEMPLATES)
}

// ========== COMPANY CONFIG (Header/Footer) ==========

// Default company config
export const DEFAULT_COMPANY_CONFIG = {
  // Header info
  companyName: 'CÔNG TY TNHH NÔNG SẢN THỰC PHẨM TRẦN GIA',
  companyLogo: '', // Base64 or URL
  
  // Multiple addresses/branches
  addresses: [
    { label: 'Hợp tác xã', value: 'Ấp Lộc Tiền, Xã Mỹ Lộc, Huyện Cần Giuộc, Tỉnh Long An' },
    { label: 'Văn phòng', value: 'Tòa nhà An Phú Plaza, 117-119 Lý Chính Thắng, P.7, Q.3, TP.HCM' },
    { label: 'Kho sơ chế', value: '30 Kha Vạn Cân, P. Hiệp Bình Chánh, TP. Thủ Đức, TP.HCM' }
  ],
  
  // Contact info
  companyTel: '090.245.8081',
  companyHotline: '090.245.8081',
  companyFax: '',
  companyEmail: '',
  companyWebsite: 'http://rausachtrangia.com',
  companyTaxCode: '',
  
  // Document info
  docFormPhieuThu: '01-TT',
  docFormPhieuChi: '02-TT',
  docDecision: 'Ban hành theo QĐ số 48/2006/QĐ-BTC',
  
  // Location for date
  location: 'TP.HCM',
  
  // Signature positions - Phiếu Thu/Chi
  signatures_phieu: [
    { title: 'Giám đốc', note: '(Ký, họ tên, đóng dấu)', name: '' },
    { title: 'Kế toán trưởng', note: '(Ký, họ tên)', name: '' },
    { title: 'Thủ quỹ', note: '(Ký, họ tên)', name: '' },
    { title: 'Người nhận/nộp tiền', note: '(Ký, họ tên)', name: '' }
  ],
  
  // Signature positions - Đề xuất
  signatures_dexuat: [
    { title: 'Người đề xuất', note: '(Ký, họ tên)', name: '' },
    { title: 'Trưởng phòng', note: '(Ký, họ tên)', name: '' },
    { title: 'Kế toán trưởng', note: '(Ký, họ tên)', name: '' },
    { title: 'Giám đốc', note: '(Ký, họ tên, đóng dấu)', name: '' }
  ],
  
  // Print settings
  printSettings: {
    paperSize: 'A4',           // A4, A5, Letter, Legal
    orientation: 'portrait',   // portrait, landscape
    fontSize: 13,              // pt - font chính
    fontSizeCompanyName: 14,   // pt - tên công ty
    fontSizeAddress: 10,       // pt - địa chỉ, liên hệ
    fontSizeSignature: 12,     // pt - chữ ký
    lineHeight: 1.3,           // khoảng cách dòng (1.0 - 2.0)
    marginTop: 15,             // mm
    marginRight: 15,           // mm
    marginBottom: 15,          // mm
    marginLeft: 15             // mm
  }
}

// Get company config from localStorage
export const getCompanyConfig = () => {
  try {
    const saved = localStorage.getItem('company_config')
    if (saved) {
      return { ...DEFAULT_COMPANY_CONFIG, ...JSON.parse(saved) }
    }
  } catch (e) {
    console.error('Error loading company config:', e)
  }
  return DEFAULT_COMPANY_CONFIG
}

// Save company config to localStorage
export const saveCompanyConfig = (config) => {
  const newConfig = { ...getCompanyConfig(), ...config }
  localStorage.setItem('company_config', JSON.stringify(newConfig))
  return newConfig
}

// Reset company config to default
export const resetCompanyConfig = () => {
  localStorage.removeItem('company_config')
  return DEFAULT_COMPANY_CONFIG
}
