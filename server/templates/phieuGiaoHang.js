/**
 * Template: Phiếu Giao Hàng
 * Mẫu in phiếu giao hàng
 */

import { formatCurrency, formatDate } from './index.js'

export function phieuGiaoHangTemplate(data, config) {
  const {
    soPhieu = '',
    ngayGiao = new Date(),
    maKH = '',
    tenKH = '',
    diaChiGiao = '',
    soDienThoai = '',
    nguoiGiao = '',
    nguoiNhan = '',
    ghiChu = '',
    items = [] // Chi tiết hàng hóa: { maSP, tenSP, donVi, soLuong, donGia, thanhTien }
  } = data

  const {
    company_name = 'CÔNG TY TNHH ABC',
    company_address = '123 Đường ABC, Quận XYZ, TP.HCM',
    company_phone = '(028) 1234 5678',
    company_tax_code = '0123456789',
    company_logo = '',
    signatures_phieu = [
      { title: 'Người giao hàng', name: '' },
      { title: 'Người nhận hàng', name: '' }
    ]
  } = config

  // Calculate total
  const tongTien = items.reduce((sum, item) => sum + (item.thanhTien || item.soLuong * item.donGia || 0), 0)

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
      <div class="document-title">PHIẾU GIAO HÀNG</div>
      <div class="document-number">Số: ${soPhieu}</div>
      <div class="document-subtitle">${formatDate(ngayGiao, 'full')}</div>

      <!-- Info Section -->
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Khách hàng:</span>
          <span class="info-value">${tenKH}</span>
        </div>
        ${maKH ? `
        <div class="info-row">
          <span class="info-label">Mã khách hàng:</span>
          <span class="info-value">${maKH}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Địa chỉ giao:</span>
          <span class="info-value">${diaChiGiao}</span>
        </div>
        ${soDienThoai ? `
        <div class="info-row">
          <span class="info-label">Điện thoại:</span>
          <span class="info-value">${soDienThoai}</span>
        </div>
        ` : ''}
        ${nguoiGiao ? `
        <div class="info-row">
          <span class="info-label">Người giao:</span>
          <span class="info-value">${nguoiGiao}</span>
        </div>
        ` : ''}
      </div>

      <!-- Items Table -->
      <table class="data-table items-table">
        <thead>
          <tr>
            <th style="width: 35px;">STT</th>
            <th style="width: 80px;">Mã SP</th>
            <th>Tên sản phẩm</th>
            <th style="width: 60px;">ĐVT</th>
            <th class="number" style="width: 70px;">Số lượng</th>
            <th class="number" style="width: 100px;">Đơn giá</th>
            <th class="number" style="width: 110px;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, idx) => `
            <tr>
              <td class="center">${idx + 1}</td>
              <td>${item.maSP || ''}</td>
              <td>${item.tenSP || ''}</td>
              <td class="center">${item.donVi || ''}</td>
              <td class="number">${formatCurrency(item.soLuong || 0)}</td>
              <td class="number">${formatCurrency(item.donGia || 0)}</td>
              <td class="number">${formatCurrency(item.thanhTien || (item.soLuong * item.donGia) || 0)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="6" class="text-right text-bold">Tổng cộng:</td>
            <td class="number text-bold">${formatCurrency(tongTien)}</td>
          </tr>
        </tfoot>
      </table>

      ${ghiChu ? `
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Ghi chú:</span>
          <span class="info-value">${ghiChu}</span>
        </div>
      </div>
      ` : ''}

      <!-- Signatures -->
      <div class="signatures two-column">
        <div class="signature-block">
          <div class="signature-title">NGƯỜI GIAO HÀNG</div>
          <div class="signature-hint">(Ký, ghi rõ họ tên)</div>
          <div class="signature-name">${nguoiGiao || ''}</div>
        </div>
        <div class="signature-block">
          <div class="signature-title">NGƯỜI NHẬN HÀNG</div>
          <div class="signature-hint">(Ký, ghi rõ họ tên)</div>
          <div class="signature-name">${nguoiNhan || ''}</div>
        </div>
      </div>
    </div>
  `

  const styles = `
    .items-table {
      font-size: 10pt;
    }
    
    .signatures.two-column {
      display: flex;
      justify-content: space-around;
    }
    
    .signatures.two-column .signature-block {
      width: 40%;
    }
    
    .signature-hint {
      font-size: 10pt;
      font-style: italic;
      color: #666;
    }
  `

  return { html, styles }
}
