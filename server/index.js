/**
 * PDF Print Server - Express + Puppeteer
 * Server-side PDF generation cho các chứng từ ERP
 */

import express from 'express'
import cors from 'cors'
import { generatePDF, generatePDFFromHTML } from './pdfGenerator.js'
import { getTemplate, renderTemplate } from './templates/index.js'

const app = express()
const PORT = process.env.PDF_SERVER_PORT || 3001

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

/**
 * Main PDF generation endpoint
 * POST /api/print
 * Body: {
 *   documentType: 'PHIEU_CHI' | 'PHIEU_THU' | 'DE_XUAT_THANH_TOAN' | 'XAC_NHAN_CONG_NO' | 'PHIEU_GIAO_HANG',
 *   data: object,  // Dữ liệu cần in
 *   config: object, // Company config (logo, tên công ty, ...)
 *   printSettings: object // Cài đặt in (paperSize, orientation, margins, ...)
 * }
 */
app.post('/api/print', async (req, res) => {
  try {
    const { documentType, data, config, printSettings } = req.body

    if (!documentType || !data) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: documentType, data' 
      })
    }

    console.log(`[PDF] Generating ${documentType}...`, printSettings ? `(${printSettings.orientation})` : '')

    // Get template for document type
    const template = getTemplate(documentType)
    if (!template) {
      return res.status(400).json({ 
        success: false, 
        error: `Unknown document type: ${documentType}` 
      })
    }

    // Render HTML from template
    const html = renderTemplate(template, data, config || {})

    // Lấy cài đặt in từ request hoặc dùng mặc định
    const ps = printSettings || {}
    const pdfOptions = {
      format: ps.paperSize || 'A4',
      landscape: ps.orientation === 'landscape', // ← Quan trọng: Khổ ngang
      scale: ps.scale || 1, // ← Scale để fit 1 trang (0.1 - 2.0)
      printBackground: true,
      margin: {
        top: `${ps.marginTop || 10}mm`,
        right: `${ps.marginRight || 10}mm`,
        bottom: `${ps.marginBottom || 10}mm`,
        left: `${ps.marginLeft || 10}mm`
      }
    }

    console.log(`[PDF] Options:`, pdfOptions)

    // Generate PDF với settings từ template
    const pdfBuffer = await generatePDFFromHTML(html, pdfOptions)

    // Set response headers
    const filename = `${documentType}_${data.soPhieu || data.proposalCode || 'document'}_${Date.now()}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
    res.setHeader('Content-Length', pdfBuffer.length)

    // Send PDF
    res.send(pdfBuffer)

    console.log(`[PDF] Generated successfully: ${filename}`)

  } catch (error) {
    console.error('[PDF] Generation error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

/**
 * Preview HTML endpoint (for debugging)
 * POST /api/preview
 */
app.post('/api/preview', async (req, res) => {
  try {
    const { documentType, data, config } = req.body

    if (!documentType || !data) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: documentType, data' 
      })
    }

    const template = getTemplate(documentType)
    if (!template) {
      return res.status(400).json({ 
        success: false, 
        error: `Unknown document type: ${documentType}` 
      })
    }

    const html = renderTemplate(template, data, config || {})
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)

  } catch (error) {
    console.error('[Preview] Error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

/**
 * Batch PDF generation endpoint
 * POST /api/print/batch
 * Body: {
 *   documents: [{ documentType, data, config }, ...]
 * }
 */
app.post('/api/print/batch', async (req, res) => {
  try {
    const { documents } = req.body

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing or invalid documents array' 
      })
    }

    console.log(`[PDF Batch] Processing ${documents.length} documents...`)

    const results = []
    for (const doc of documents) {
      try {
        const template = getTemplate(doc.documentType)
        if (!template) {
          results.push({ success: false, error: `Unknown type: ${doc.documentType}` })
          continue
        }

        const html = renderTemplate(template, doc.data, doc.config || {})
        const pdfBuffer = await generatePDFFromHTML(html)
        
        results.push({ 
          success: true, 
          documentType: doc.documentType,
          pdf: pdfBuffer.toString('base64')
        })
      } catch (err) {
        results.push({ success: false, error: err.message })
      }
    }

    res.json({ success: true, results })

  } catch (error) {
    console.error('[PDF Batch] Error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

/**
 * Get available template types
 * GET /api/templates
 */
app.get('/api/templates', (req, res) => {
  const templates = [
    { 
      id: 'PHIEU_CHI', 
      name: 'Phiếu Chi', 
      description: 'Phiếu chi tiền mặt/chuyển khoản',
      category: 'Kế toán',
      fields: ['soPhieu', 'ngayLap', 'nguoiNhan', 'lyDo', 'soTien', 'phuongThuc', 'ghiChu']
    },
    { 
      id: 'PHIEU_THU', 
      name: 'Phiếu Thu', 
      description: 'Phiếu thu tiền mặt/chuyển khoản',
      category: 'Kế toán',
      fields: ['soPhieu', 'ngayLap', 'nguoiNop', 'lyDo', 'soTien', 'phuongThuc', 'ghiChu']
    },
    { 
      id: 'DE_XUAT_THANH_TOAN', 
      name: 'Đề xuất Thanh toán NCC', 
      description: 'Đề xuất thanh toán cho nhà cung cấp',
      category: 'Thanh toán',
      fields: ['proposalCode', 'createdAt', 'supplierGroups', 'totalPayment', 'ghiChu'],
      tableColumns: [
        { key: 'stt', label: 'STT', width: 35 },
        { key: 'noiDungThanhToan', label: 'Nội dung thanh toán', width: 180 },
        { key: 'supplierName', label: 'Tên NCC', width: 'auto' },
        { key: 'lastPaymentDate', label: 'Ngày TT gần nhất', width: 95 },
        { key: 'lastPaymentAmount', label: 'Số tiền TT gần nhất', width: 110 },
        { key: 'paymentAmount', label: 'Số tiền đề xuất', width: 110 },
        { key: 'ghiChu', label: 'Ghi chú', width: 100 }
      ]
    },
    { 
      id: 'XAC_NHAN_CONG_NO', 
      name: 'Xác nhận Công nợ', 
      description: 'Biên bản xác nhận công nợ',
      category: 'Công nợ',
      fields: ['soPhieu', 'ngayLap', 'loaiCongNo', 'maDoiTuong', 'tenDoiTuong', 'congNoDauKy', 'phatSinhTang', 'phatSinhGiam', 'congNoCuoiKy']
    },
    { 
      id: 'PHIEU_GIAO_HANG', 
      name: 'Phiếu Giao Hàng', 
      description: 'Phiếu giao hàng cho khách',
      category: 'Kho vận',
      fields: ['soPhieu', 'ngayGiao', 'tenKH', 'diaChiGiao', 'items', 'ghiChu']
    }
  ]
  
  res.json({ success: true, templates })
})

/**
 * Get template detail
 * GET /api/templates/:id
 */
app.get('/api/templates/:id', (req, res) => {
  const { id } = req.params
  const template = getTemplate(id)
  
  if (!template) {
    return res.status(404).json({ 
      success: false, 
      error: `Template not found: ${id}` 
    })
  }
  
  res.json({ 
    success: true, 
    template: { id, exists: true } 
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`\n🖨️  PDF Print Server running at http://localhost:${PORT}`)
  console.log(`   - POST /api/print       - Generate PDF`)
  console.log(`   - POST /api/preview     - Preview HTML`)
  console.log(`   - POST /api/print/batch - Batch PDF generation`)
  console.log(`   - GET  /api/templates   - List templates`)
  console.log(`   - GET  /api/health      - Health check\n`)
})
