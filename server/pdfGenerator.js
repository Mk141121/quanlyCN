/**
 * PDF Generator using Puppeteer
 * Server-side PDF rendering with Vietnamese Unicode support
 */

import puppeteer from 'puppeteer'

// Singleton browser instance for better performance
let browserInstance = null

/**
 * Get or create browser instance
 */
async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--font-render-hinting=none'
      ]
    })

    // Handle browser disconnection
    browserInstance.on('disconnected', () => {
      browserInstance = null
    })
  }
  return browserInstance
}

/**
 * Generate PDF from HTML string
 * @param {string} html - Full HTML document string
 * @param {object} options - PDF options
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generatePDFFromHTML(html, options = {}) {
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    // Set content with Vietnamese font support
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    })

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready')

    // Generate PDF with landscape support
    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      landscape: options.landscape || false, // ← Hỗ trợ khổ ngang
      scale: options.scale || 1, // ← Scale content (0.1 - 2.0)
      printBackground: options.printBackground !== false,
      margin: options.margin || {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      preferCSSPageSize: options.preferCSSPageSize || false,
      displayHeaderFooter: options.displayHeaderFooter || false,
      headerTemplate: options.headerTemplate || '',
      footerTemplate: options.footerTemplate || '',
      pageRanges: options.pageRanges || ''
    })

    return Buffer.from(pdfBuffer)

  } finally {
    await page.close()
  }
}

/**
 * Generate PDF from URL
 * @param {string} url - Page URL to render
 * @param {object} options - PDF options
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generatePDFFromURL(url, options = {}) {
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    })

    await page.evaluateHandle('document.fonts.ready')

    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      printBackground: options.printBackground !== false,
      margin: options.margin || {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    })

    return Buffer.from(pdfBuffer)

  } finally {
    await page.close()
  }
}

/**
 * Cleanup - close browser instance
 */
export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
  }
}

// Handle process exit
process.on('exit', closeBrowser)
process.on('SIGINT', async () => {
  await closeBrowser()
  process.exit(0)
})
process.on('SIGTERM', async () => {
  await closeBrowser()
  process.exit(0)
})

// Legacy export for compatibility
export const generatePDF = generatePDFFromHTML
