/**
 * Template: Đề xuất Thanh toán NCC
 * Mẫu in đề xuất thanh toán nhà cung cấp
 * Các cột: STT - Nội dung thanh toán - Tên NCC - Ngày TT gần nhất - Số tiền TT gần nhất - Số tiền đề xuất - Ghi chú
 */

import { formatCurrency, numberToWords, formatDate } from './index.js'

export function deXuatThanhToanTemplate(data, config) {
  const {
    proposalCode = '',
    createdAt = new Date(),
    supplierGroups = [], // Array of { supplierCode, supplierName, noiDungThanhToan, lastPaymentDate, lastPaymentAmount, paymentAmount, ghiChu }
    totalAmount = 0,
    totalPayment = 0,
    ghiChu = '',
    nguoiDeXuat = '',
    boPhan = ''
  } = data

  const {
    company_name = 'CÔNG TY TNHH ABC',
    company_address = '123 Đường ABC, Quận XYZ, TP.HCM',
    company_phone = '(028) 1234 5678',
    company_tax_code = '0123456789',
    company_logo = '',
    signatures_dexuat = [
      { title: 'Người đề xuất', name: '' },
      { title: 'Kế toán trưởng', name: '' },
      { title: 'Giám đốc', name: '' }
    ]
  } = config

  // Calculate totals if not provided
  const calculatedPayment = totalPayment || supplierGroups.reduce((sum, g) => sum + (g.paymentAmount || g.amount || 0), 0)

  // Build table rows - one row per supplier with new columns
  const tableRows = supplierGroups.map((group, idx) => {
    // Nội dung thanh toán: có thể là text hoặc tự generate từ orders
    const noiDung = group.noiDungThanhToan || 
      (group.orders && group.orders.length > 0 
        ? `Thanh toán ${group.orders.length} đơn hàng` 
        : 'Thanh toán công nợ')
    
    return `
      <tr>
        <td class="center">${idx + 1}</td>
        <td>${noiDung}</td>
        <td>${group.supplierName || ''}</td>
        <td class="center">${group.lastPaymentDate ? formatDate(group.lastPaymentDate, 'short') : '-'}</td>
        <td class="number">${group.lastPaymentAmount ? formatCurrency(group.lastPaymentAmount) : '-'}</td>
        <td class="number">${formatCurrency(group.paymentAmount || group.amount || 0)}</td>
        <td>${group.ghiChu || ''}</td>
      </tr>
    `
  }).join('')

  const html = `
    <div class="page">
      <!-- Company Header - no border -->
      <div class="company-header" style="border-bottom: none;">
        ${company_logo ? `<img src="${company_logo}" class="company-logo" alt="Logo" />` : ''}
        <div class="company-info">
          <div class="company-name">${company_name}</div>
          <div class="company-address">Địa chỉ: ${company_address}</div>
          <div class="company-phone">Điện thoại: ${company_phone}</div>
          <div class="company-taxcode">Mã số thuế: ${company_tax_code}</div>
        </div>
      </div>

      <!-- Title -->
      <div class="document-title">ĐỀ XUẤT THANH TOÁN NHÀ CUNG CẤP</div>
      <div class="document-number">Số: ${proposalCode}</div>
      <div class="document-subtitle">${formatDate(createdAt, 'full')}</div>

      <!-- Info Section -->
      <div class="info-section">
        ${nguoiDeXuat ? `
        <div class="info-row">
          <span class="info-label">Người đề xuất:</span>
          <span class="info-value">${nguoiDeXuat}</span>
        </div>
        ` : ''}
        ${boPhan ? `
        <div class="info-row">
          <span class="info-label">Bộ phận:</span>
          <span class="info-value">${boPhan}</span>
        </div>
        ` : ''}
      </div>

      <!-- Data Table với các cột mới -->
      <table class="data-table proposal-table">
        <thead>
          <tr>
            <th class="col-stt">STT</th>
            <th class="col-noidung">Nội dung thanh toán</th>
            <th class="col-tenncc">Tên NCC</th>
            <th class="center col-ngaytt">Ngày TT gần nhất</th>
            <th class="number col-sotientt">Số tiền TT gần nhất</th>
            <th class="number col-sotiendx">Số tiền đề xuất</th>
            <th class="col-ghichu">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" class="text-right text-bold">Tổng cộng:</td>
            <td class="number text-bold">${formatCurrency(calculatedPayment)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <!-- Amount in words -->
      <div class="amount-words">
        <span class="label">Bằng chữ:</span> ${numberToWords(calculatedPayment)}
      </div>

      ${ghiChu ? `
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Ghi chú:</span>
          <span class="info-value">${ghiChu}</span>
        </div>
      </div>
      ` : ''}

      <!-- Signatures - inline style để override -->
      <div class="signatures" style="display: flex; justify-content: space-between; margin-top: 15px; page-break-inside: avoid;">
        ${signatures_dexuat.map(sig => `
          <div class="signature-block" style="width: 24%; text-align: center;">
            <div style="font-weight: bold; margin-bottom: 2px;">${sig.title}</div>
            <div style="font-size: 9pt; font-style: italic; color: #666;">(Ký, họ tên)</div>
            <div style="height: 40px;"></div>
            <div style="font-weight: bold;">${sig.name || ''}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `

  const styles = `
    /* Force fit content to 1 page */
    @page {
      size: A4 landscape;
      margin: 8mm;
    }
    
    .page {
      width: 100%;
      max-height: 100vh;
      overflow: hidden;
    }
    
    .proposal-table {
      font-size: 9pt;
      width: 100%;
      table-layout: fixed;
    }
    
    .proposal-table th,
    .proposal-table td {
      padding: 4px 5px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    /* Định nghĩa width cố định cho từng cột */
    .proposal-table .col-stt { width: 25px; }
    .proposal-table .col-noidung { width: 140px; }
    .proposal-table .col-tenncc { width: 200px; }
    .proposal-table .col-ngaytt { width: 70px; }
    .proposal-table .col-sotientt { width: 90px; }
    .proposal-table .col-sotiendx { width: 90px; }
    .proposal-table .col-ghichu { width: auto; } /* Chiếm không gian còn lại */
    .proposal-table .col-ngaytt { width: 75px; }
    .proposal-table .col-sotientt { width: 90px; }
    .proposal-table .col-sotiendx { width: 90px; }
    
    .document-title {
      font-size: 16pt;
      margin: 10px 0 5px;
    }
    
    .document-number,
    .document-subtitle {
      margin-bottom: 8px;
    }
    
    .company-header {
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: none;
    }
    
    .company-name {
      font-size: 12pt;
    }
    
    .company-address,
    .company-phone,
    .company-taxcode {
      font-size: 9pt;
    }
    
    .amount-words {
      margin: 8px 0;
      font-size: 10pt;
    }
    
    .signatures {
      margin-top: 15px;
    }
    
    .signature-block {
      text-align: center;
    }
    
    .signature-title {
      font-weight: bold;
      margin-bottom: 0 !important;
    }
    
    .signature-hint {
      font-size: 9pt;
      font-style: italic;
      color: #666;
      margin-top: 2px;
    }
    
    .signature-space {
      height: 50px;
    }
    
    .signature-name {
      font-weight: bold;
      margin-top: 0;
      border-top: none !important;
      padding-top: 0 !important;
    }
  `

  return { html, styles }
}
