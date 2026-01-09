/**
 * Template Registry - Quản lý các HTML templates cho chứng từ
 */

import { phieuChiTemplate } from './phieuChi.js'
import { phieuThuTemplate } from './phieuThu.js'
import { deXuatThanhToanTemplate } from './deXuatThanhToan.js'
import { xacNhanCongNoTemplate } from './xacNhanCongNo.js'
import { phieuGiaoHangTemplate } from './phieuGiaoHang.js'
import { baseStyles } from './baseStyles.js'

// Document type mapping
const TEMPLATES = {
  'PHIEU_CHI': phieuChiTemplate,
  'PHIEU_THU': phieuThuTemplate,
  'DE_XUAT_THANH_TOAN': deXuatThanhToanTemplate,
  'XAC_NHAN_CONG_NO': xacNhanCongNoTemplate,
  'PHIEU_GIAO_HANG': phieuGiaoHangTemplate
}

/**
 * Get template function by document type
 * @param {string} documentType 
 * @returns {function|null}
 */
export function getTemplate(documentType) {
  return TEMPLATES[documentType] || null
}

/**
 * Normalize config từ camelCase sang snake_case để template đọc được
 * @param {object} config - Config từ client (camelCase)
 * @returns {object} Config đã chuẩn hóa (snake_case)
 */
export function normalizeConfig(config = {}) {
  // Lấy địa chỉ đầu tiên từ mảng addresses nếu có
  const firstAddress = config.addresses && config.addresses.length > 0
    ? config.addresses[0].value
    : config.company_address || ''

  return {
    // Company info - hỗ trợ cả 2 format
    company_name: config.company_name || config.companyName || 'CÔNG TY TNHH ABC',
    company_address: config.company_address || firstAddress || '123 Đường ABC, TP.HCM',
    company_phone: config.company_phone || config.companyTel || config.companyHotline || '',
    company_tax_code: config.company_tax_code || config.companyTaxCode || '',
    company_logo: config.company_logo || config.companyLogo || '',
    company_fax: config.company_fax || config.companyFax || '',
    company_email: config.company_email || config.companyEmail || '',
    company_website: config.company_website || config.companyWebsite || '',
    
    // Addresses array (for multiple locations)
    addresses: config.addresses || [],
    
    // Signatures - giữ nguyên
    signatures_phieu: config.signatures_phieu || [
      { title: 'Giám đốc', name: '' },
      { title: 'Kế toán trưởng', name: '' },
      { title: 'Thủ quỹ', name: '' },
      { title: 'Người nhận/nộp tiền', name: '' }
    ],
    signatures_dexuat: config.signatures_dexuat || [
      { title: 'Người đề xuất', name: '' },
      { title: 'Kế toán trưởng', name: '' },
      { title: 'Giám đốc', name: '' }
    ],
    
    // Document form info
    docFormPhieuThu: config.docFormPhieuThu || '01-TT',
    docFormPhieuChi: config.docFormPhieuChi || '02-TT',
    docDecision: config.docDecision || '',
    location: config.location || 'TP.HCM',
    
    // Print settings
    printSettings: config.printSettings || {}
  }
}

/**
 * Render template with data
 * @param {function} templateFn - Template function
 * @param {object} data - Document data
 * @param {object} config - Company config
 * @returns {string} Full HTML document
 */
export function renderTemplate(templateFn, data, config) {
  // Chuẩn hóa config trước khi render
  const normalizedConfig = normalizeConfig(config)
  const content = templateFn(data, normalizedConfig)
  
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Print Document</title>
  <style>
    ${baseStyles}
    ${content.styles || ''}
  </style>
</head>
<body>
  ${content.html}
</body>
</html>`
}

/**
 * Format số tiền thành chuỗi có dấu phẩy
 * @param {number} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '0'
  return Number(amount).toLocaleString('vi-VN')
}

/**
 * Chuyển số thành chữ tiếng Việt
 * @param {number} number 
 * @returns {string}
 */
export function numberToWords(number) {
  if (number === 0) return 'Không đồng'
  if (!number || isNaN(number)) return ''

  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
  const positions = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ']

  function readThreeDigits(num, hasHundreds = true) {
    let result = ''
    const hundreds = Math.floor(num / 100)
    const tens = Math.floor((num % 100) / 10)
    const ones = num % 10

    if (hundreds > 0 || hasHundreds) {
      result += units[hundreds] + ' trăm '
    }

    if (tens === 0 && ones > 0 && (hundreds > 0 || hasHundreds)) {
      result += 'linh '
    } else if (tens === 1) {
      result += 'mười '
    } else if (tens > 1) {
      result += units[tens] + ' mươi '
    }

    if (ones === 1 && tens > 1) {
      result += 'mốt '
    } else if (ones === 5 && tens > 0) {
      result += 'lăm '
    } else if (ones > 0 && !(ones === 1 && tens === 0 && hundreds === 0 && !hasHundreds)) {
      result += units[ones] + ' '
    }

    return result.trim()
  }

  let result = ''
  let positionIndex = 0
  let remaining = Math.abs(Math.round(number))

  while (remaining > 0) {
    const threeDigits = remaining % 1000
    if (threeDigits > 0) {
      const part = readThreeDigits(threeDigits, positionIndex > 0 || remaining >= 100)
      result = part + ' ' + positions[positionIndex] + ' ' + result
    }
    remaining = Math.floor(remaining / 1000)
    positionIndex++
  }

  result = result.trim()
  result = result.charAt(0).toUpperCase() + result.slice(1) + ' đồng'
  return result
}

/**
 * Format ngày tháng
 * @param {string|Date} date 
 * @param {string} format - 'full' | 'short' | 'day-month-year'
 * @returns {string}
 */
export function formatDate(date, format = 'full') {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()

  switch (format) {
    case 'full':
      return `Ngày ${day} tháng ${month} năm ${year}`
    case 'short':
      return `${day}/${month}/${year}`
    case 'day-month-year':
      return `${day}/${month}/${year}`
    default:
      return `${day}/${month}/${year}`
  }
}
