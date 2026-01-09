/**
 * Template: Xác nhận Công nợ
 * Mẫu in xác nhận công nợ với khách hàng/NCC
 */

import { formatCurrency, numberToWords, formatDate } from './index.js'

export function xacNhanCongNoTemplate(data, config) {
  const {
    soPhieu = '',
    ngayLap = new Date(),
    loaiCongNo = 'PHAI_THU', // PHAI_THU | PHAI_TRA
    maDoiTuong = '',
    tenDoiTuong = '',
    diaChi = '',
    soDienThoai = '',
    congNoDauKy = 0,
    phatSinhTang = 0,
    phatSinhGiam = 0,
    congNoCuoiKy = 0,
    chiTiet = [], // Chi tiết các giao dịch
    ghiChu = '',
    tuNgay = '',
    denNgay = ''
  } = data

  const {
    company_name = 'CÔNG TY TNHH ABC',
    company_address = '123 Đường ABC, Quận XYZ, TP.HCM',
    company_phone = '(028) 1234 5678',
    company_tax_code = '0123456789',
    company_logo = '',
    signatures_phieu = [
      { title: 'Người lập', name: '' },
      { title: 'Kế toán', name: '' },
      { title: 'Đại diện đối tác', name: '' }
    ]
  } = config

  const loaiText = loaiCongNo === 'PHAI_THU' ? 'khách hàng' : 'nhà cung cấp'
  const doiTuongLabel = loaiCongNo === 'PHAI_THU' ? 'Khách hàng' : 'Nhà cung cấp'

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
      <div class="document-title">BIÊN BẢN XÁC NHẬN CÔNG NỢ</div>
      <div class="document-number">Số: ${soPhieu}</div>
      ${tuNgay && denNgay ? `
        <div class="document-subtitle">Kỳ: Từ ${formatDate(tuNgay, 'short')} đến ${formatDate(denNgay, 'short')}</div>
      ` : ''}

      <!-- Intro -->
      <div class="intro-text">
        <p>Hôm nay, ${formatDate(ngayLap, 'full')}, chúng tôi gồm:</p>
        <p><strong>Bên A:</strong> ${company_name}</p>
        <p>Địa chỉ: ${company_address}</p>
        <p><strong>Bên B (${doiTuongLabel}):</strong> ${tenDoiTuong}</p>
        <p>Mã ${loaiText}: ${maDoiTuong}</p>
        <p>Địa chỉ: ${diaChi}</p>
        ${soDienThoai ? `<p>Điện thoại: ${soDienThoai}</p>` : ''}
        <p class="mt-10">Cùng xác nhận công nợ như sau:</p>
      </div>

      <!-- Summary Table -->
      <table class="data-table summary-table">
        <thead>
          <tr>
            <th>Nội dung</th>
            <th class="number" style="width: 180px;">Số tiền (VNĐ)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Công nợ đầu kỳ</td>
            <td class="number">${formatCurrency(congNoDauKy)}</td>
          </tr>
          <tr>
            <td>Phát sinh tăng trong kỳ</td>
            <td class="number">${formatCurrency(phatSinhTang)}</td>
          </tr>
          <tr>
            <td>Phát sinh giảm trong kỳ</td>
            <td class="number">${formatCurrency(phatSinhGiam)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td class="text-bold">Công nợ cuối kỳ</td>
            <td class="number text-bold">${formatCurrency(congNoCuoiKy)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Amount in words -->
      <div class="amount-words">
        <span class="label">Bằng chữ:</span> ${numberToWords(Math.abs(congNoCuoiKy))}
      </div>

      ${chiTiet && chiTiet.length > 0 ? `
      <!-- Detail Table -->
      <div class="detail-section">
        <div class="section-title">Chi tiết giao dịch:</div>
        <table class="data-table detail-table">
          <thead>
            <tr>
              <th style="width: 35px;">STT</th>
              <th style="width: 90px;">Ngày</th>
              <th style="width: 100px;">Số chứng từ</th>
              <th>Diễn giải</th>
              <th class="number" style="width: 110px;">Phát sinh tăng</th>
              <th class="number" style="width: 110px;">Phát sinh giảm</th>
            </tr>
          </thead>
          <tbody>
            ${chiTiet.map((item, idx) => `
              <tr>
                <td class="center">${idx + 1}</td>
                <td class="center">${formatDate(item.ngay, 'short')}</td>
                <td>${item.soChungTu || ''}</td>
                <td>${item.dienGiai || ''}</td>
                <td class="number">${formatCurrency(item.phatSinhTang || 0)}</td>
                <td class="number">${formatCurrency(item.phatSinhGiam || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${ghiChu ? `
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Ghi chú:</span>
          <span class="info-value">${ghiChu}</span>
        </div>
      </div>
      ` : ''}

      <div class="confirm-text mt-20">
        <p>Hai bên cùng xác nhận số liệu trên là đúng.</p>
        <p>Biên bản được lập thành 02 bản có giá trị như nhau, mỗi bên giữ 01 bản.</p>
      </div>

      <!-- Signatures -->
      <div class="signatures two-column">
        <div class="signature-block">
          <div class="signature-title">ĐẠI DIỆN BÊN A</div>
          <div class="signature-hint">(Ký, ghi rõ họ tên)</div>
          <div class="signature-name">${signatures_phieu[1]?.name || ''}</div>
        </div>
        <div class="signature-block">
          <div class="signature-title">ĐẠI DIỆN BÊN B</div>
          <div class="signature-hint">(Ký, ghi rõ họ tên)</div>
          <div class="signature-name"></div>
        </div>
      </div>
    </div>
  `

  const styles = `
    .intro-text {
      margin: 15px 0;
      line-height: 1.8;
    }
    
    .intro-text p {
      margin: 3px 0;
    }
    
    .summary-table {
      width: 60%;
      margin: 15px auto;
    }
    
    .section-title {
      font-weight: bold;
      margin: 15px 0 10px;
    }
    
    .detail-table {
      font-size: 10pt;
    }
    
    .confirm-text {
      line-height: 1.6;
    }
    
    .confirm-text p {
      margin: 5px 0;
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
