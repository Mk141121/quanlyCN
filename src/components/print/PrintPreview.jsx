import React, { useRef, useState, useEffect } from 'react'
import { Modal, Button, Space, message } from 'antd'
import { PrinterOutlined, DownloadOutlined, CloseOutlined } from '@ant-design/icons'
import { 
  printDocument, 
  formatCurrency, 
  formatDate, 
  numberToWords,
  getCompanyConfig,
  DEFAULT_COMPANY_CONFIG
} from '../../utils/printUtils'
import './PrintPreview.css'

const PrintPreview = ({ template, visible, onClose, customData = null }) => {
  const printRef = useRef()
  const [companyConfig, setCompanyConfig] = useState(DEFAULT_COMPANY_CONFIG)

  // Get paper dimensions based on settings
  const getPaperDimensions = () => {
    const ps = template?.printSettings || companyConfig?.printSettings || {
      paperSize: 'A4',
      orientation: 'portrait',
      fontSize: 13
    }
    
    const sizes = {
      'A4': { width: 210, height: 297 },
      'A5': { width: 148, height: 210 },
      'Letter': { width: 216, height: 279 },
      'Legal': { width: 216, height: 356 },
      'B5': { width: 176, height: 250 }
    }
    
    const size = sizes[ps.paperSize] || sizes['A4']
    
    if (ps.orientation === 'landscape') {
      return { width: size.height, height: size.width, fontSize: ps.fontSize }
    }
    return { width: size.width, height: size.height, fontSize: ps.fontSize }
  }

  useEffect(() => {
    // Load company config when modal opens or template changes
    if (visible) {
      const config = getCompanyConfig()
      setCompanyConfig(config)
    }
  }, [visible, template])

  if (!template) return null

  const data = customData || template.documentData || {}

  // Render field value based on type
  const renderValue = (field, value) => {
    if (value === undefined || value === null || value === '') {
      return '......................................'
    }

    switch (field.type) {
      case 'currency':
        return formatCurrency(value)
      case 'date':
        return formatDate(value)
      default:
        return value
    }
  }

  // Get total amount for amount in words
  const getTotalAmount = () => {
    const amountFields = ['soTien', 'tongTien', 'amount', 'totalAmount']
    for (const key of amountFields) {
      if (data[key]) {
        return parseFloat(data[key]) || 0
      }
    }
    return 0
  }

  const handlePrint = () => {
    // Clone content and open in new window for reliable printing
    const printContent = document.getElementById('print-content')
    if (!printContent) return
    
    const ps = template?.printSettings || companyConfig?.printSettings || {
      paperSize: 'A4',
      orientation: 'portrait',
      fontSize: 13,
      marginTop: 15,
      marginRight: 15, 
      marginBottom: 15,
      marginLeft: 15
    }
    
    // Open new window
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      message.error('Không thể mở cửa sổ in. Vui lòng cho phép popup.')
      return
    }
    
    // Write content with styles
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${template.name || 'In phiếu'}</title>
        <style>
          @page {
            size: ${ps.paperSize} ${ps.orientation};
            margin: ${ps.marginTop}mm ${ps.marginRight}mm ${ps.marginBottom}mm ${ps.marginLeft}mm;
          }
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: ${ps.fontSize}pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
            padding: 0;
          }
          
          .print-content-wrapper {
            width: 100% !important;
            min-height: auto !important;
            box-shadow: none !important;
          }
          
          .print-container {
            padding: 0;
            font-size: ${ps.fontSize}pt;
          }
          
          .print-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
          }
          
          .company-info {
            text-align: left;
            max-width: 55%;
          }
          
          .company-name {
            font-weight: bold;
            font-size: 14pt;
            text-transform: uppercase;
          }
          
          .company-address, .company-address-item {
            font-size: 10pt;
          }
          
          .company-contact {
            font-size: 10pt;
            font-style: italic;
          }
          
          .doc-info {
            text-align: center;
            max-width: 45%;
          }
          
          .doc-form {
            font-size: 11pt;
          }
          
          .doc-decision {
            font-size: 9pt;
            font-style: italic;
          }
          
          .print-title {
            text-align: center;
            font-size: 20pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 15px 0 5px;
          }
          
          .print-date {
            text-align: center;
            font-style: italic;
            margin-bottom: 5px;
          }
          
          .print-subtitle {
            text-align: center;
            font-style: italic;
            margin-bottom: 5px;
          }
          
          .print-doc-number {
            text-align: center;
            margin-bottom: 15px;
          }
          
          .print-body {
            margin: 15px 0;
          }
          
          .print-row {
            display: flex;
            margin-bottom: 8px;
            align-items: baseline;
          }
          
          .print-label {
            font-weight: bold;
            min-width: 170px;
            flex-shrink: 0;
          }
          
          .print-value {
            flex: 1;
          }
          
          .print-underline {
            border-bottom: 1px dotted #666;
            padding-bottom: 2px;
          }
          
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
          }
          
          .signature-name {
            font-weight: bold;
          }
          
          .print-footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px dashed #999;
          }
          
          .footer-note {
            font-size: 10pt;
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `)
    
    printWindow.document.close()
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
    }
    
    // Fallback if onload doesn't fire
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 500)
  }

  const handleDownloadPDF = () => {
    message.info('Tính năng tải PDF đang được phát triển')
  }

  // Get font sizes from config - merge template and company config
  const getFontSizes = () => {
    // Company config font sizes (user configured)
    const companyPs = companyConfig?.printSettings || {}
    // Template specific settings (may not have font sizes)
    const templatePs = template?.printSettings || {}
    
    // Merge: template overrides company, but use company defaults for font sizes
    return {
      companyName: templatePs.fontSizeCompanyName || companyPs.fontSizeCompanyName || 14,
      address: templatePs.fontSizeAddress || companyPs.fontSizeAddress || 10,
      signature: templatePs.fontSizeSignature || companyPs.fontSizeSignature || 12
    }
  }

  // Render addresses list
  const renderAddresses = () => {
    const addresses = companyConfig.addresses || []
    const fontSizes = getFontSizes()
    
    if (addresses.length === 0) {
      // Fallback to old single address if exists
      if (companyConfig.companyAddress) {
        return <div className="company-address" style={{ fontSize: `${fontSizes.address}pt` }}>{companyConfig.companyAddress}</div>
      }
      return null
    }
    
    return (
      <div className="company-addresses" style={{ fontSize: `${fontSizes.address}pt` }}>
        {addresses.map((addr, index) => (
          <div key={index} className="company-address-item">
            {addr.label && <span className="address-label">{addr.label}: </span>}
            <span className="address-value">{addr.value}</span>
          </div>
        ))}
      </div>
    )
  }

  // Render contact info line
  const renderContactInfo = () => {
    const fontSizes = getFontSizes()
    const parts = []
    if (companyConfig.companyWebsite) {
      parts.push(`Website: ${companyConfig.companyWebsite}`)
    }
    if (companyConfig.companyHotline) {
      parts.push(`Hotline: ${companyConfig.companyHotline}`)
    } else if (companyConfig.companyTel) {
      parts.push(`ĐT: ${companyConfig.companyTel}`)
    }
    if (parts.length === 0) return null
    return <div className="company-contact" style={{ fontSize: `${fontSizes.address}pt` }}>{parts.join(' - ')}</div>
  }

  // Render company header with logo
  const renderCompanyHeader = (showDocForm = true, isPhieuThu = false) => {
    const fontSizes = getFontSizes()
    
    return (
      <div className="print-header">
        <div className="company-info">
          {companyConfig.companyLogo && (
            <img 
              src={companyConfig.companyLogo} 
              alt="Logo" 
              className="company-logo"
              style={{ maxWidth: 120, maxHeight: 60, marginBottom: 8 }}
            />
          )}
          <div className="company-name" style={{ fontSize: `${fontSizes.companyName}pt` }}>{companyConfig.companyName}</div>
          {renderAddresses()}
          {renderContactInfo()}
        </div>
        <div className="doc-info">
          {showDocForm ? (
            <>
              <div className="doc-form">
                Mẫu số: {isPhieuThu ? companyConfig.docFormPhieuThu : companyConfig.docFormPhieuChi}
              </div>
              <div className="doc-decision">({companyConfig.docDecision})</div>
            </>
          ) : (
            <>
              <div className="doc-form">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="doc-decision" style={{ fontWeight: 'bold' }}>Độc lập - Tự do - Hạnh phúc</div>
              <div className="doc-line">─────────────────</div>
            </>
          )}
        </div>
      </div>
    )
  }

  // Render signatures for Phieu Thu/Chi
  const renderSignaturesPhieu = (isPhieuThu = false) => {
    const signatures = companyConfig.signatures_phieu || DEFAULT_COMPANY_CONFIG.signatures_phieu
    const fontSizes = getFontSizes()
    
    // Replace dynamic title for người nộp/nhận
    const processedSignatures = signatures.map(sig => {
      if (sig.title === 'Người nhận/nộp tiền' || sig.title.includes('nộp') || sig.title.includes('nhận')) {
        return {
          ...sig,
          title: isPhieuThu ? 'Người nộp tiền' : 'Người nhận tiền'
        }
      }
      return sig
    })

    return (
      <div className="print-signatures" style={{ fontSize: `${fontSizes.signature}pt` }}>
        {processedSignatures.map((sig, index) => (
          <div key={index} className="signature-block">
            <div className="signature-title">{sig.title}</div>
            <div className="signature-note">{sig.note}</div>
            <div className="signature-space"></div>
            {sig.name && <div className="signature-name">{sig.name}</div>}
          </div>
        ))}
      </div>
    )
  }

  // Render signatures for De Xuat
  const renderSignaturesDeXuat = () => {
    const signatures = companyConfig.signatures_dexuat || DEFAULT_COMPANY_CONFIG.signatures_dexuat
    const fontSizes = getFontSizes()
    
    return (
      <div className="print-signatures" style={{ fontSize: `${fontSizes.signature}pt` }}>
        {signatures.map((sig, index) => (
          <div key={index} className="signature-block">
            <div className="signature-title">{sig.title}</div>
            <div className="signature-note">{sig.note}</div>
            <div className="signature-space"></div>
            {sig.name && <div className="signature-name">{sig.name}</div>}
          </div>
        ))}
      </div>
    )
  }

  // Render date location
  const renderDateLocation = (date) => {
    const d = date || new Date()
    return (
      <div className="print-date-location">
        <p>{companyConfig.location}, ngày {formatDate(d, 'DD')} tháng {formatDate(d, 'MM')} năm {formatDate(d, 'YYYY')}</p>
      </div>
    )
  }

  // Get dynamic wrapper and container styles based on printSettings
  const getPreviewStyles = () => {
    const paperDims = getPaperDimensions()
    
    const wrapperStyle = {
      width: `${paperDims.width}mm`,
      minHeight: `${Math.min(paperDims.height * 0.6, 200)}mm`,
      margin: '0 auto',
      boxSizing: 'border-box'
    }
    
    const containerStyle = {
      fontSize: `${paperDims.fontSize || 13}pt`
    }
    
    return { wrapperStyle, containerStyle }
  }

  // Render based on template type
  const renderPhieuThuChi = () => {
    const isPhieuThu = template.id === 'PHIEU_THU' || template.name?.includes('Thu')
    const totalAmount = getTotalAmount()
    const { wrapperStyle, containerStyle } = getPreviewStyles()

    return (
      <div className="print-content-wrapper" id="print-content" ref={printRef} style={wrapperStyle}>
        <div className="print-container" style={containerStyle}>
          {/* Header */}
          {renderCompanyHeader(true, isPhieuThu)}

          {/* Title */}
          <div className="print-title">
            {isPhieuThu ? 'PHIẾU THU' : 'PHIẾU CHI'}
          </div>
          <div className="print-subtitle">
            Ngày {formatDate(data.ngayLap || new Date(), 'DD')} tháng {formatDate(data.ngayLap || new Date(), 'MM')} năm {formatDate(data.ngayLap || new Date(), 'YYYY')}
          </div>
          <div className="print-doc-number">
            Số: <strong>{data.maPhieu || '..................'}</strong>
          </div>

          {/* Content */}
          <div className="print-body">
            <div className="print-row">
              <span className="print-label">{isPhieuThu ? 'Họ tên người nộp tiền:' : 'Họ tên người nhận tiền:'}</span>
              <span className="print-value print-underline">
                {(isPhieuThu ? (data.nguoiNop || data.nguoiNhan) : (data.nguoiNhan || data.nguoiNop)) || '......................................'}
              </span>
            </div>

            <div className="print-row">
              <span className="print-label">Địa chỉ:</span>
              <span className="print-value print-underline">
                {data.diaChi || data.diaChiNguoiNhan || '......................................'}
              </span>
            </div>

            <div className="print-row">
              <span className="print-label">Lý do {isPhieuThu ? 'thu' : 'chi'}:</span>
              <span className="print-value print-underline">
                {data.lyDo || '......................................'}
              </span>
            </div>

            <div className="print-row">
              <span className="print-label">Số tiền:</span>
              <span className="print-value print-underline" style={{ fontWeight: 'bold' }}>
                {totalAmount > 0 ? formatCurrency(totalAmount) + ' VNĐ' : '......................................'}
              </span>
            </div>

            <div className="print-row">
              <span className="print-label">Bằng chữ:</span>
              <span className="print-value print-underline" style={{ fontStyle: 'italic' }}>
                {totalAmount > 0 ? numberToWords(totalAmount) : '......................................'}
              </span>
            </div>

            <div className="print-row">
              <span className="print-label">Hình thức thanh toán:</span>
              <span className="print-value">
                {data.hinhThuc || 'Tiền mặt'}
              </span>
            </div>

            <div className="print-row">
              <span className="print-label">Kèm theo:</span>
              <span className="print-value">
                {data.kemTheo ? `${data.kemTheo} chứng từ gốc` : '........ chứng từ gốc'}
              </span>
            </div>

            {data.ghiChu && (
              <div className="print-row">
                <span className="print-label">Ghi chú:</span>
                <span className="print-value">{data.ghiChu}</span>
              </div>
            )}
          </div>

          {/* Signatures */}
          {renderSignaturesPhieu(isPhieuThu)}

          <div className="print-footer">
            <div className="footer-note">
              Đã {isPhieuThu ? 'nhận đủ số tiền (viết bằng chữ)' : 'nhận đủ số tiền (viết bằng chữ)'}: 
              <span style={{ fontStyle: 'italic', marginLeft: 8 }}>
                {totalAmount > 0 ? numberToWords(totalAmount) : '......................................'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderDeXuatChi = () => {
    const totalAmount = getTotalAmount()
    const { wrapperStyle, containerStyle } = getPreviewStyles()
    const fields = template.fields || []

    // Helper to check if a field exists
    const hasField = (key) => fields.some(f => f.key === key)
    
    // Helper to render a field row
    const renderFieldRow = (key, label) => {
      if (!hasField(key)) return null
      const value = data[key]
      
      // Special handling for currency fields
      const field = fields.find(f => f.key === key)
      if (field?.type === 'currency') {
        return (
          <div className="print-row" key={key}>
            <span className="print-label">{label}:</span>
            <span className="print-value" style={{ fontWeight: 'bold' }}>
              {value ? formatCurrency(Number(value)) + ' VNĐ' : '......................................'}
            </span>
          </div>
        )
      }
      
      return (
        <div className="print-row" key={key}>
          <span className="print-label">{label}:</span>
          <span className="print-value print-underline">
            {value || '......................................'}
          </span>
        </div>
      )
    }

    return (
      <div className="print-content-wrapper" id="print-content" ref={printRef} style={wrapperStyle}>
        <div className="print-container" style={containerStyle}>
          {/* Header */}
          {renderCompanyHeader(false)}

          {/* Title */}
          <div className="print-title">{template.name || 'ĐỀ XUẤT CHI'}</div>
          <div className="print-date">{formatDate(data.ngayLap || new Date())}</div>
          <div className="print-subtitle">
            Số: {data.maPhieu || data.maDeXuat || '..................'}
          </div>

          {/* Content */}
          <div className="print-body">
            <div className="print-section">
              <div className="print-row">
                <span className="print-label">Kính gửi:</span>
                <span className="print-value">Ban Giám đốc {companyConfig.companyName}</span>
              </div>
            </div>

            <div className="print-section">
              {renderFieldRow('nguoiDeXuat', 'Người đề xuất')}
              {renderFieldRow('nguoiNhan', 'Người nhận tiền')}
              {renderFieldRow('phongBan', 'Phòng ban')}
              {renderFieldRow('diaChi', 'Địa chỉ')}
            </div>

            {hasField('noiDung') && (
              <div className="print-section">
                <div className="print-row-full">
                  <span className="print-label">Nội dung đề xuất:</span>
                  <div className="print-value-block">
                    {data.noiDung || '......................................'}
                  </div>
                </div>
              </div>
            )}

            <div className="print-section">
              {renderFieldRow('lyDo', 'Lý do chi')}
              {hasField('soTien') && (
                <>
                  <div className="print-row">
                    <span className="print-label">Số tiền đề xuất:</span>
                    <span className="print-value" style={{ fontWeight: 'bold' }}>
                      {totalAmount > 0 ? formatCurrency(totalAmount) + ' VNĐ' : '......................................'}
                    </span>
                  </div>
                  <div className="print-row">
                    <span className="print-label">Bằng chữ:</span>
                    <span className="print-value" style={{ fontStyle: 'italic' }}>
                      {totalAmount > 0 ? numberToWords(totalAmount) : '......................................'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {data.ghiChu && hasField('ghiChu') && (
              <div className="print-section">
                <div className="print-row">
                  <span className="print-label">Ghi chú:</span>
                  <span className="print-value">{data.ghiChu}</span>
                </div>
              </div>
            )}

            <div className="print-section">
              <p style={{ fontStyle: 'italic' }}>
                Kính đề nghị Ban Giám đốc xem xét và phê duyệt.
              </p>
            </div>
          </div>

          {/* Signatures */}
          {renderSignaturesDeXuat()}

          {renderDateLocation(data.ngayLap)}
        </div>
      </div>
    )
  }

  const renderDeXuatThanhToan = () => {
    const { wrapperStyle, containerStyle } = getPreviewStyles()
    const supplierGroups = data.supplierGroups || []
    const totalAmount = supplierGroups.reduce((sum, g) => sum + (g.amount || 0), 0)
    const totalLastPayment = supplierGroups.reduce((sum, g) => sum + (g.lastPaymentAmount || 0), 0)
    const fontSizes = getFontSizes()

    // Format date as "Ngày XX tháng XX năm XXXX"
    const createdDate = data.createdAt ? new Date(data.createdAt) : new Date()
    const formattedDate = `Ngày ${createdDate.getDate().toString().padStart(2, '0')} tháng ${(createdDate.getMonth() + 1).toString().padStart(2, '0')} năm ${createdDate.getFullYear()}`

    return (
      <div className="print-content-wrapper" id="print-content" ref={printRef} style={wrapperStyle}>
        <div className="print-container" style={containerStyle}>
          {/* Header from system */}
          <div className="print-header" style={{ marginBottom: 20 }}>
            <div className="company-info" style={{ textAlign: 'left' }}>
              {companyConfig.companyLogo && (
                <img 
                  src={companyConfig.companyLogo} 
                  alt="Logo" 
                  className="company-logo"
                  style={{ maxWidth: 100, maxHeight: 50, marginBottom: 5 }}
                />
              )}
              <div className="company-name" style={{ fontSize: `${fontSizes.companyName}pt`, fontWeight: 'bold' }}>
                {companyConfig.companyName}
              </div>
              {renderAddresses()}
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: '18pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
              ĐỀ XUẤT THANH TOÁN NCC
            </h2>
            <div style={{ marginTop: 8, fontStyle: 'italic', textDecoration: 'underline' }}>
              {formattedDate}
            </div>
          </div>

          {/* To and From info */}
          <div style={{ marginBottom: 15, lineHeight: 1.8 }}>
            <div><strong>Kính gửi:</strong> Ban Giám Đốc {companyConfig.companyName}</div>
            <div>
              <strong>Người đề xuất thanh toán:</strong> {data.createdBy || '..................'} 
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <strong>Bộ Phận:</strong> Kế toán
            </div>
            <div><strong>Nội dung đề xuất:</strong></div>
          </div>

          {/* Table */}
          <table className="print-table" style={{ fontSize: '10pt', width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#ffff00' }}>
                <th style={{ width: '35px', padding: '6px', border: '1px solid #000', textAlign: 'center' }}>STT</th>
                <th style={{ padding: '6px', border: '1px solid #000', textAlign: 'center' }}>Nội dung thanh toán</th>
                <th style={{ padding: '6px', border: '1px solid #000', textAlign: 'center' }}>Tên NCC</th>
                <th style={{ width: '80px', padding: '6px', border: '1px solid #000', textAlign: 'center' }}>Ngày TT gần nhất</th>
                <th style={{ width: '100px', padding: '6px', border: '1px solid #000', textAlign: 'center' }}>Số tiền TT gần nhất</th>
                <th style={{ width: '100px', padding: '6px', border: '1px solid #000', textAlign: 'center' }}>Số tiền đề xuất</th>
                <th style={{ padding: '6px', border: '1px solid #000', textAlign: 'center' }}>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {supplierGroups.map((group, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'center', padding: '5px', border: '1px solid #000' }}>{index + 1}</td>
                  <td style={{ padding: '5px', border: '1px solid #000' }}>{group.noiDungThanhToan || `TT ${group.poIds?.length || 0} đơn hàng`}</td>
                  <td style={{ padding: '5px', border: '1px solid #000' }}>{group.supplierName}</td>
                  <td style={{ textAlign: 'center', padding: '5px', border: '1px solid #000' }}>{group.lastPaymentDate || ''}</td>
                  <td style={{ textAlign: 'right', padding: '5px', border: '1px solid #000' }}>{group.lastPaymentAmount ? formatCurrency(group.lastPaymentAmount) : ''}</td>
                  <td style={{ textAlign: 'right', padding: '5px', border: '1px solid #000' }}>{formatCurrency(group.amount)}</td>
                  <td style={{ padding: '5px', border: '1px solid #000' }}>{group.ghiChu || ''}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#ffff00' }}>
                <td colSpan={4} style={{ textAlign: 'center', fontWeight: 'bold', padding: '6px', border: '1px solid #000' }}>Tổng cộng</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', padding: '6px', border: '1px solid #000' }}>{formatCurrency(totalLastPayment)}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', padding: '6px', border: '1px solid #000' }}>{formatCurrency(totalAmount)}</td>
                <td style={{ border: '1px solid #000' }}></td>
              </tr>
            </tfoot>
          </table>

          {/* Signatures - 3 columns */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, textAlign: 'center' }}>
            <div style={{ width: '30%' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 60 }}>Người lập</div>
              <div>{data.createdBy || companyConfig.signatures_phieu?.[3]?.name || ''}</div>
            </div>
            <div style={{ width: '30%' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 60 }}>Thủ quỹ</div>
              <div>{companyConfig.signatures_phieu?.[2]?.name || ''}</div>
            </div>
            <div style={{ width: '30%' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 60 }}>CTHĐTV</div>
              <div>{companyConfig.signatures_phieu?.[0]?.name || ''}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderGenericTemplate = () => {
    const totalAmount = getTotalAmount()
    const { wrapperStyle, containerStyle } = getPreviewStyles()

    return (
      <div className="print-content-wrapper" id="print-content" ref={printRef} style={wrapperStyle}>
        <div className="print-container" style={containerStyle}>
          {/* Header */}
          {renderCompanyHeader(false)}

          {/* Title */}
          <div className="print-title">{template.name?.toUpperCase() || 'PHIẾU'}</div>
          
          {/* Content - render all fields */}
          <div className="print-body">
            {template.fields?.map(field => (
              <div key={field.key} className="print-row">
                <span className="print-label">{field.label}:</span>
                <span className="print-value print-underline">
                  {renderValue(field, data[field.key])}
                </span>
              </div>
            ))}

            {totalAmount > 0 && (
              <div className="print-row">
                <span className="print-label">Bằng chữ:</span>
                <span className="print-value" style={{ fontStyle: 'italic' }}>
                  {numberToWords(totalAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Signatures - use de xuat signatures for generic */}
          {renderSignaturesDeXuat()}

          {renderDateLocation()}
        </div>
      </div>
    )
  }

  // Choose render method based on layoutType (priority) or template id (fallback)
  const renderContent = () => {
    const layoutType = template.layoutType || ''
    
    // First check layoutType
    switch (layoutType) {
      case 'phieu_thu_chi':
        return renderPhieuThuChi()
      case 'de_xuat':
        return renderDeXuatChi()
      case 'de_xuat_thanh_toan':
        return renderDeXuatThanhToan()
    }
    
    // Fallback to template.id for backward compatibility
    switch (template.id) {
      case 'PHIEU_THU':
      case 'PHIEU_CHI':
        return renderPhieuThuChi()
      case 'DE_XUAT_CHI':
        return renderDeXuatChi()
      case 'DE_XUAT_THANH_TOAN':
        return renderDeXuatThanhToan()
      default:
        return renderGenericTemplate()
    }
  }

  // Get paper info for display
  const getPaperInfo = () => {
    const ps = template?.printSettings || {}
    const paperSize = ps.paperSize || 'A4'
    const orientation = ps.orientation === 'landscape' ? 'Ngang' : 'Dọc'
    const fontSize = ps.fontSize || 13
    return `${paperSize} - ${orientation} - ${fontSize}pt`
  }

  // Calculate modal width based on paper orientation
  const getModalWidth = () => {
    const paperDims = getPaperDimensions()
    const ps = template?.printSettings || {}
    // For landscape, need wider modal
    if (ps.orientation === 'landscape') {
      return Math.min(1100, paperDims.width * 3.8 + 100)
    }
    return Math.min(900, paperDims.width * 3.5 + 80)
  }

  return (
    <Modal
      title={
        <Space>
          <PrinterOutlined />
          <span>Xem trước: {template.name}</span>
          <span style={{ fontSize: 12, color: '#999', fontWeight: 'normal' }}>
            ({getPaperInfo()})
          </span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={getModalWidth()}
      footer={
        <Space>
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Đóng
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadPDF}>
            Tải PDF
          </Button>
          <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
            In phiếu
          </Button>
        </Space>
      }
      className="print-preview-modal"
      destroyOnClose
    >
      <div className="print-preview-container">
        {renderContent()}
      </div>
    </Modal>
  )
}

export default PrintPreview
