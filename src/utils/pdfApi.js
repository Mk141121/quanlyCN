/**
 * PDF API Service - Gọi Puppeteer PDF Server
 */

const PDF_SERVER_URL = import.meta.env?.VITE_PDF_SERVER_URL || 'http://localhost:3001'

/**
 * Tạo PDF từ template và data
 * @param {string} documentType - Loại chứng từ (PHIEU_CHI, PHIEU_THU, DE_XUAT_THANH_TOAN, ...)
 * @param {object} data - Dữ liệu chứng từ
 * @param {object} config - Company config
 * @param {boolean} openInNewTab - Mở trong tab mới (true) hoặc download (false)
 * @param {object} printSettings - Cài đặt in (paperSize, orientation, margins, ...)
 * @returns {Promise<void>}
 */
export async function generatePDF(documentType, data, config = {}, openInNewTab = true, printSettings = null) {
  try {
    console.log('[PDF API] Generating:', documentType, printSettings ? `(${printSettings.orientation})` : '')

    const response = await fetch(`${PDF_SERVER_URL}/api/print`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentType,
        data,
        config,
        printSettings // ← Gửi cài đặt in lên server
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Server error: ${response.status}`)
    }

    const pdfBlob = await response.blob()
    const pdfUrl = URL.createObjectURL(pdfBlob)

    if (openInNewTab) {
      window.open(pdfUrl, '_blank')
    } else {
      const filename = `${documentType}_${data.soPhieu || data.proposalCode || 'document'}_${Date.now()}.pdf`
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000)
    return true

  } catch (error) {
    console.error('[PDF API] Error:', error)
    throw error
  }
}

/**
 * Preview HTML (không tạo PDF)
 * @param {string} documentType 
 * @param {object} data 
 * @param {object} config 
 * @returns {Promise<void>}
 */
export async function previewHTML(documentType, data, config = {}) {
  try {
    const response = await fetch(`${PDF_SERVER_URL}/api/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentType,
        data,
        config
      })
    })

    if (!response.ok) {
      throw new Error('Preview failed')
    }

    const html = await response.text()
    const previewWindow = window.open('', '_blank')
    previewWindow.document.write(html)
    previewWindow.document.close()

    return true

  } catch (error) {
    console.error('[PDF API] Preview error:', error)
    throw error
  }
}

/**
 * Lấy danh sách templates có sẵn từ server
 * @returns {Promise<Array>}
 */
export async function getServerTemplates() {
  try {
    const response = await fetch(`${PDF_SERVER_URL}/api/templates`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch templates')
    }

    const result = await response.json()
    return result.templates || []

  } catch (error) {
    console.error('[PDF API] Get templates error:', error)
    return []
  }
}

/**
 * Kiểm tra PDF server có hoạt động không
 * @returns {Promise<boolean>}
 */
export async function checkServerHealth() {
  try {
    const response = await fetch(`${PDF_SERVER_URL}/api/health`)
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * Map template ID từ PrintTemplateManager sang server documentType
 * @param {string} templateId 
 * @returns {string}
 */
export function mapTemplateToDocumentType(templateId) {
  const mapping = {
    'PHIEU_THU': 'PHIEU_THU',
    'PHIEU_CHI': 'PHIEU_CHI',
    'DE_XUAT_CHI': 'DE_XUAT_THANH_TOAN', // Legacy mapping
    'DE_XUAT_THANH_TOAN': 'DE_XUAT_THANH_TOAN',
    'XAC_NHAN_CONG_NO': 'XAC_NHAN_CONG_NO',
    'PHIEU_GIAO_HANG': 'PHIEU_GIAO_HANG'
  }
  return mapping[templateId] || templateId
}

/**
 * Map data từ form fields sang format template cần
 * @param {string} templateId 
 * @param {object} formData 
 * @returns {object}
 */
export function mapFormDataToTemplateData(templateId, formData) {
  // Đối với Phiếu Thu/Chi
  if (templateId === 'PHIEU_THU' || templateId === 'PHIEU_CHI') {
    return {
      soPhieu: formData.maPhieu || formData.soPhieu || '',
      ngayLap: formData.ngayLap || new Date().toISOString(),
      nguoiNhan: formData.nguoiNhan || formData.doiTac || '',
      nguoiNop: formData.nguoiNop || formData.doiTac || '',
      diaChi: formData.diaChi || '',
      lyDo: formData.lyDo || formData.noiDung || '',
      soTien: formData.soTien || 0,
      phuongThuc: formData.phuongThuc || formData.hinhThuc || 'TIEN_MAT',
      ghiChu: formData.ghiChu || ''
    }
  }

  // Đối với Đề xuất Thanh toán
  if (templateId === 'DE_XUAT_THANH_TOAN' || templateId === 'DE_XUAT_CHI') {
    return {
      proposalCode: formData.maDeXuat || formData.proposalCode || '',
      createdAt: formData.ngayLap || new Date().toISOString(),
      nguoiDeXuat: formData.nguoiDeXuat || '',
      boPhan: formData.boPhan || '',
      supplierGroups: formData.supplierGroups || formData.items || [],
      totalPayment: formData.tongTien || formData.totalPayment || 0,
      ghiChu: formData.ghiChu || ''
    }
  }

  // Đối với Xác nhận Công nợ
  if (templateId === 'XAC_NHAN_CONG_NO') {
    return {
      soPhieu: formData.maPhieu || '',
      ngayLap: formData.ngayLap || new Date().toISOString(),
      loaiCongNo: formData.loaiCongNo || 'PHAI_THU',
      maDoiTuong: formData.maDoiTuong || '',
      tenDoiTuong: formData.tenDoiTuong || formData.doiTac || '',
      diaChi: formData.diaChi || '',
      congNoDauKy: formData.congNoDauKy || 0,
      phatSinhTang: formData.phatSinhTang || 0,
      phatSinhGiam: formData.phatSinhGiam || 0,
      congNoCuoiKy: formData.congNoCuoiKy || 0,
      tuNgay: formData.tuNgay || '',
      denNgay: formData.denNgay || '',
      ghiChu: formData.ghiChu || ''
    }
  }

  // Đối với Phiếu Giao Hàng
  if (templateId === 'PHIEU_GIAO_HANG') {
    return {
      soPhieu: formData.maPhieu || '',
      ngayGiao: formData.ngayGiao || new Date().toISOString(),
      tenKH: formData.tenKH || formData.khachHang || '',
      maKH: formData.maKH || '',
      diaChiGiao: formData.diaChiGiao || formData.diaChi || '',
      soDienThoai: formData.soDienThoai || '',
      nguoiGiao: formData.nguoiGiao || '',
      items: formData.items || [],
      ghiChu: formData.ghiChu || ''
    }
  }

  // Default: return as-is
  return formData
}

export default {
  generatePDF,
  previewHTML,
  getServerTemplates,
  checkServerHealth,
  mapTemplateToDocumentType,
  mapFormDataToTemplateData
}
