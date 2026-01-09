/**
 * Base CSS Styles - Shared styles for all document templates
 * Vietnamese Unicode support với các font phổ biến
 */

export const baseStyles = `
/* Reset & Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* @page size is controlled by Puppeteer options (format, landscape) */

body {
  font-family: 'Times New Roman', 'Noto Serif', 'DejaVu Serif', serif;
  font-size: 12pt;
  line-height: 1.4;
  color: #000;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Page container */
.page {
  width: 100%;
  min-height: 100%;
  padding: 0;
  background: #fff;
  page-break-after: always;
}

.page:last-child {
  page-break-after: auto;
}

/* Company Header */
.company-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  border-bottom: 1px solid #000;
  padding-bottom: 10px;
}

.company-logo {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  object-fit: contain;
}

.company-info {
  flex: 1;
}

.company-name {
  font-weight: bold;
  font-size: 14pt;
  text-transform: uppercase;
  color: #000;
}

.company-address,
.company-phone,
.company-taxcode {
  font-size: 10pt;
  margin-top: 2px;
}

/* Document Title */
.document-title {
  text-align: center;
  font-size: 18pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 20px 0 10px;
  color: #000;
}

.document-subtitle {
  text-align: center;
  font-size: 11pt;
  margin-bottom: 15px;
}

.document-number {
  text-align: center;
  font-size: 11pt;
  margin-bottom: 15px;
  font-style: italic;
}

/* Info rows */
.info-section {
  margin: 15px 0;
}

.info-row {
  display: flex;
  margin: 5px 0;
  line-height: 1.6;
}

.info-label {
  width: 150px;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  border-bottom: 1px dotted #000;
  padding-left: 5px;
}

.info-value.no-border {
  border-bottom: none;
}

/* Tables */
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
  font-size: 11pt;
}

.data-table th,
.data-table td {
  border: 1px solid #000;
  padding: 6px 8px;
  text-align: left;
  vertical-align: top;
}

.data-table th {
  background-color: #f0f0f0;
  font-weight: bold;
  text-align: center;
}

.data-table td.number,
.data-table th.number {
  text-align: right;
}

.data-table td.center,
.data-table th.center {
  text-align: center;
}

.data-table tfoot td {
  font-weight: bold;
  background-color: #f9f9f9;
}

/* Amount in words */
.amount-words {
  margin: 15px 0;
  font-style: italic;
}

.amount-words .label {
  font-weight: bold;
  font-style: normal;
}

/* Signatures */
.signatures {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  text-align: center;
}

.signature-block {
  width: 30%;
  text-align: center;
}

.signature-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.signature-name {
  font-weight: bold;
  padding-top: 5px;
  margin-top: 5px;
}

.signature-position {
  font-size: 10pt;
  font-style: italic;
}

/* Date location */
.date-location {
  text-align: right;
  margin: 15px 0;
  font-style: italic;
}

/* Page break helpers */
.page-break {
  page-break-before: always;
}

.no-break {
  page-break-inside: avoid;
}

/* Print specific */
@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .page {
    margin: 0;
    padding: 0;
  }
  
  .no-print {
    display: none !important;
  }
}

/* Utility classes */
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-left { text-align: left; }
.text-bold { font-weight: bold; }
.text-italic { font-style: italic; }
.text-underline { text-decoration: underline; }

.mt-10 { margin-top: 10px; }
.mt-20 { margin-top: 20px; }
.mb-10 { margin-bottom: 10px; }
.mb-20 { margin-bottom: 20px; }
`
