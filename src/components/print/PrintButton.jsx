import React, { useState } from 'react'
import { Button, Tooltip, message, Spin } from 'antd'
import { PrinterOutlined, LoadingOutlined } from '@ant-design/icons'
import { getTemplates } from '../../utils/printUtils'

// API endpoint for PDF server
const PDF_SERVER_URL = import.meta.env.VITE_PDF_SERVER_URL || 'http://localhost:3001'

/**
 * Lấy printSettings từ localStorage theo templateId
 * @param {string} templateId 
 * @returns {object|null}
 */
const getTemplatePrintSettings = (templateId) => {
  try {
    const templates = getTemplates()
    const template = templates.find(t => t.id === templateId)
    return template?.printSettings || null
  } catch (e) {
    console.error('[PrintButton] Error getting template settings:', e)
    return null
  }
}

/**
 * Component nút In - Sử dụng Puppeteer PDF Server
 * Sử dụng: <PrintButton templateId="PHIEU_CHI" data={...} />
 * printSettings sẽ tự động được lấy từ localStorage dựa trên templateId
 */
const PrintButton = ({ 
  templateId = 'PHIEU_CHI', 
  templateName = 'Phiếu',
  data = {},
  config = {}, // Company config
  printSettings = null, // Cài đặt in (nếu null sẽ tự lấy từ localStorage)
  buttonText = 'In phiếu',
  buttonType = 'default',
  buttonSize = 'middle',
  showIcon = true,
  disabled = false,
  style = {},
  openInNewTab = true // true = mở PDF trong tab mới, false = download
}) => {
  const [loading, setLoading] = useState(false)

  /**
   * Gọi API server để tạo PDF
   */
  const handlePrint = async () => {
    if (!data || Object.keys(data).length === 0) {
      message.warning('Không có dữ liệu để in')
      return
    }

    setLoading(true)

    try {
      // Lấy printSettings từ props hoặc tự động từ localStorage
      const settings = printSettings || getTemplatePrintSettings(templateId)

      const response = await fetch(`${PDF_SERVER_URL}/api/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: templateId,
          data: data,
          config: config,
          printSettings: settings // ← Gửi cài đặt in lên server
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      // Get PDF blob
      const pdfBlob = await response.blob()
      const pdfUrl = URL.createObjectURL(pdfBlob)

      if (openInNewTab) {
        // Mở PDF trong tab mới
        window.open(pdfUrl, '_blank')
      } else {
        // Download PDF
        const filename = `${templateId}_${data.soPhieu || data.proposalCode || 'document'}_${Date.now()}.pdf`
        const link = document.createElement('a')
        link.href = pdfUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      // Cleanup URL sau một khoảng thời gian
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000)

    } catch (error) {
      console.error('[PrintButton] Error generating PDF:', error)
      
      if (error.message.includes('Failed to fetch')) {
        message.error('Không thể kết nối đến PDF Server. Vui lòng chạy: npm run server')
      } else {
        message.error(`Lỗi tạo PDF: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Preview HTML (for debugging)
   */
  const handlePreview = async () => {
    try {
      const response = await fetch(`${PDF_SERVER_URL}/api/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: templateId,
          data: data,
          config: config
        })
      })

      if (!response.ok) {
        throw new Error('Preview failed')
      }

      const html = await response.text()
      const previewWindow = window.open('', '_blank')
      previewWindow.document.write(html)
      previewWindow.document.close()

    } catch (error) {
      console.error('[PrintButton] Preview error:', error)
      message.error('Lỗi xem trước')
    }
  }

  return (
    <Tooltip title={loading ? 'Đang tạo PDF...' : `In ${templateName}`}>
      <Button
        type={buttonType}
        size={buttonSize}
        icon={loading ? <LoadingOutlined spin /> : (showIcon ? <PrinterOutlined /> : null)}
        onClick={handlePrint}
        disabled={disabled || loading}
        style={style}
      >
        {loading ? 'Đang tạo...' : buttonText}
      </Button>
    </Tooltip>
  )
}

export default PrintButton
