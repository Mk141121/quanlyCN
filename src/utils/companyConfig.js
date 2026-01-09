/**
 * Company Config - Cấu hình công ty cho in ấn
 * Có thể load từ localStorage hoặc API
 */

// Default company config
const DEFAULT_CONFIG = {
  company_name: 'CÔNG TY TNHH ABC',
  company_address: '123 Đường ABC, Quận XYZ, TP.HCM',
  company_phone: '(028) 1234 5678',
  company_tax_code: '0123456789',
  company_logo: '', // Base64 hoặc URL
  
  // Chữ ký cho Phiếu Thu/Chi
  signatures_phieu: [
    { title: 'Người lập phiếu', name: '' },
    { title: 'Kế toán trưởng', name: '' },
    { title: 'Giám đốc', name: '' }
  ],
  
  // Chữ ký cho Đề xuất thanh toán
  signatures_dexuat: [
    { title: 'Người đề xuất', name: '' },
    { title: 'Kế toán trưởng', name: '' },
    { title: 'Giám đốc', name: '' }
  ]
}

const STORAGE_KEY = 'erp_company_config'

/**
 * Lấy cấu hình công ty
 * @returns {object} Company config
 */
export function getCompanyConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_CONFIG, ...parsed }
    }
  } catch (error) {
    console.error('[CompanyConfig] Error loading config:', error)
  }
  return { ...DEFAULT_CONFIG }
}

/**
 * Lưu cấu hình công ty
 * @param {object} config - Config to save
 */
export function saveCompanyConfig(config) {
  try {
    const toSave = { ...DEFAULT_CONFIG, ...config }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    return true
  } catch (error) {
    console.error('[CompanyConfig] Error saving config:', error)
    return false
  }
}

/**
 * Reset về cấu hình mặc định
 */
export function resetCompanyConfig() {
  localStorage.removeItem(STORAGE_KEY)
  return { ...DEFAULT_CONFIG }
}

export default {
  getCompanyConfig,
  saveCompanyConfig,
  resetCompanyConfig,
  DEFAULT_CONFIG
}
