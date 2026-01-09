/**
 * Template: Phiếu Chi
 * Mẫu in phiếu chi tiền mặt
 */

import { formatCurrency, numberToWords, formatDate } from './index.js'

export function phieuChiTemplate(data, config) {
  const {
    soPhieu = '',
    ngayLap = new Date(),
    nguoiNhan = '',
    diaChi = '',
    lyDo = '',
    soTien = 0,
    phuongThuc = 'TIEN_MAT',
    ghiChu = '',
    maNCC = '',
    tenNCC = '',
    items = [] // Chi tiết các đơn hàng nếu có
  } = data

  const {
    company_name = 'CÔNG TY TNHH ABC',
    company_address = '123 Đường ABC, Quận XYZ, TP.HCM',
    company_phone = '(028) 1234 5678',
    company_tax_code = '0123456789',
    company_logo = '',
    signatures_phieu = [
      { title: 'Người lập phiếu', name: '' },
      { title: 'Kế toán trưởng', name: '' },
      { title: 'Giám đốc', name: '' }
    ]
  } = config

  const phuongThucText = {
    'TIEN_MAT': 'Tiền mặt',
    'CHUYEN_KHOAN': 'Chuyển khoản'
  }

  const html = `
    <div class="page">
      <!-- Company Header -->
      <div class="company-header">
        ${company_logo ? `<img src="${company_logo}" class="company-logo" alt="Logo" />` : ''}
        <div class="company-info">
          <div class="company-name">${company_name}</div>
          <div class="company-address">Địa chỉ: ${company_address}</div>
          <div class="company-phone">Điện thoại: ${company_phone}</div>
          <div class="company-taxcode">Mã số thuế: ${company_tax_code}</div>
        </div>
      </div>

      <!-- Title -->
      <div class="document-title">PHIẾU CHI</div>
      <div class="document-number">Số: ${soPhieu}</div>
      <div class="document-subtitle">${formatDate(ngayLap, 'full')}</div>

      <!-- Info Section -->
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Họ và tên người nhận:</span>
          <span class="info-value">${nguoiNhan || tenNCC || ''}</span>
        </div>
        ${maNCC ? `
        <div class="info-row">
          <span class="info-label">Mã NCC:</span>
          <span class="info-value">${maNCC}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Địa chỉ:</span>
          <span class="info-value">${diaChi}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Lý do chi:</span>
          <span class="info-value">${lyDo}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phương thức:</span>
          <span class="info-value">${phuongThucText[phuongThuc] || phuongThuc}</span>
        </div>
      </div>

      ${items && items.length > 0 ? `
      <!-- Detail Table -->
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 40px;">STT</th>
            <th>Mã đơn hàng</th>
            <th>Diễn giải</th>
            <th class="number" style="width: 150px;">Số tiền</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, idx) => `
            <tr>
              <td class="center">${idx + 1}</td>
              <td>${item.orderCode || item.maPhieu || ''}</td>
              <td>${item.description || item.dienGiai || ''}</td>
              <td class="number">${formatCurrency(item.amount || item.soTien || 0)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="text-right text-bold">Tổng cộng:</td>
            <td class="number text-bold">${formatCurrency(soTien)}</td>
          </tr>
        </tfoot>
      </table>
      ` : `
      <!-- Simple Amount -->
      <div class="info-section">
        <div class="info-row">
          <span class="info-label text-bold">Số tiền:</span>
          <span class="info-value text-bold">${formatCurrency(soTien)} VNĐ</span>
        </div>
      </div>
      `}

      <!-- Amount in words -->
      <div class="amount-words">
        <span class="label">Bằng chữ:</span> ${numberToWords(soTien)}
      </div>

      ${ghiChu ? `
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Ghi chú:</span>
          <span class="info-value">${ghiChu}</span>
        </div>
      </div>
      ` : ''}

      <!-- Signatures -->
      <div class="signatures">
        ${signatures_phieu.map(sig => `
          <div class="signature-block">
            <div class="signature-title">${sig.title}</div>
            <div class="signature-hint">(Ký, họ tên)</div>
            <div class="signature-name">${sig.name || ''}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `

  const styles = `
    .signature-hint {
      font-size: 10pt;
      font-style: italic;
      color: #666;
    }
  `

  return { html, styles }
}
