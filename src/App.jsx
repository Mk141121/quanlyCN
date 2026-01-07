import React, { useState } from 'react'
import OrderGrouper from './components/OrderGrouper'
import DocumentSelector from './components/DocumentSelector'
import PhieuThuChiForm from './components/PhieuThuChiForm'
import ARDashboard from './components/ARDashboard'
import APDashboard from './components/APDashboard'
import GeneralDashboard from './components/GeneralDashboard'
import './App.css'

function App() {
  const [view, setView] = useState('general-dashboard') // general-dashboard, grouper-ap, grouper-ar, selector-ap, selector-ar, payment
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [currentType, setCurrentType] = useState(null) // AP or AR
  const [darkMode, setDarkMode] = useState(true) // Mặc định dark mode

  const handleSelectDocument = (doc) => {
    setSelectedDocument(doc)
    setView('payment')
  }

  const handleBack = () => {
    setView('home')
    setSelectedDocument(null)
  }

  const handleSuccess = () => {
    setView('home')
    setSelectedDocument(null)
  }

  // Home - Menu chính
  if (view === 'home') {
    return (
      <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="home-container">
          {/* Header */}
          <div className="home-header">
            <div className="header-content">
              <h1 className="main-title">
                🏦 Hệ thống Quản lý Công nợ
              </h1>
              <Space>
                <Button
                  type="primary"
                  size="large"
                  icon={<DashboardOutlined />}
                  onClick={() => setView('general-dashboard')}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    border: 'none',
                    fontWeight: 600
                  }}
                >
                  📊 Dashboard Tổng hợp
                </Button>
                <button 
                  className="theme-toggle"
                  onClick={() => setDarkMode(!darkMode)}
                  title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
              </Space>
            </div>
          </div>

          {/* Main Content */}
          <div className="home-content">
            {/* Column 1: KHÁCH HÀNG (AR) */}
            <div className="column ar-column">
              <div className="column-header ar-header">
                <h2>💼 KHÁCH HÀNG</h2>
                <span className="subtitle">Accounts Receivable</span>
              </div>

              {/* Xác nhận công nợ AR */}
              <div className="card card-ar">
                <div className="card-header">
                  <FileAddOutlined className="card-icon" />
                  <h3>Xác nhận Công nợ</h3>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<FileAddOutlined />}
                  onClick={() => {
                    setCurrentType('AR')
                    setView('grouper')
                  }}
                  block
                  className="action-btn ar-btn"
                >
                  💼 Công nợ khách hàng
                  <span className="btn-subtitle">SO → AR Document</span>
                </Button>
              </div>

              {/* Lập phiếu thu AR */}
              <div className="card card-ar">
                <div className="card-header">
                  <FileTextOutlined className="card-icon" />
                  <h3>Lập Phiếu Thu</h3>
                </div>
                <Button
                  size="large"
                  icon={<FileTextOutlined />}
                  onClick={() => {
                    setCurrentType('AR')
                    setView('selector')
                  }}
                  block
                  className="action-btn ar-btn-secondary"
                >
                  💵 Phiếu Thu
                  <span className="btn-subtitle">Thanh toán AR Document</span>
                </Button>
              </div>

              {/* Dashboard AR */}
              <div className="card card-ar">
                <div className="card-header">
                  <FileTextOutlined className="card-icon" />
                  <h3>Báo cáo</h3>
                </div>
                <Button
                  size="large"
                  icon={<FileTextOutlined />}
                  onClick={() => setView('ar-dashboard')}
                  block
                  className="action-btn ar-btn-outline"
                >
                  📈 AR Dashboard
                  <span className="btn-subtitle">Tổng hợp công nợ KH</span>
                </Button>
              </div>
            </div>

            {/* Column 2: NHÀ CUNG CẤP (AP) */}
            <div className="column ap-column">
              <div className="column-header ap-header">
                <h2>🛒 NHÀ CUNG CẤP</h2>
                <span className="subtitle">Accounts Payable</span>
              </div>

              {/* Xác nhận công nợ AP */}
              <div className="card card-ap">
                <div className="card-header">
                  <FileAddOutlined className="card-icon" />
                  <h3>Xác nhận Công nợ</h3>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<FileAddOutlined />}
                  onClick={() => {
                    setCurrentType('AP')
                    setView('grouper')
                  }}
                  block
                  className="action-btn ap-btn"
                >
                  🛒 Công nợ NCC
                  <span className="btn-subtitle">PO → Payment Proposal</span>
                </Button>
              </div>

              {/* Lập phiếu chi AP */}
              <div className="card card-ap">
                <div className="card-header">
                  <FileTextOutlined className="card-icon" />
                  <h3>Lập Phiếu Chi</h3>
                </div>
                <Button
                  size="large"
                  icon={<FileTextOutlined />}
                  onClick={() => {
                    setCurrentType('AP')
                    setView('selector')
                  }}
                  block
                  className="action-btn ap-btn-secondary"
                >
                  💳 Phiếu Chi
                  <span className="btn-subtitle">Thanh toán Payment Proposal</span>
                </Button>
              </div>

              {/* Dashboard AP */}
              <div className="card card-ap">
                <div className="card-header">
                  <FileTextOutlined className="card-icon" />
                  <h3>Báo cáo</h3>
                </div>
                <Button
                  size="large"
                  icon={<FileTextOutlined />}
                  onClick={() => setView('ap-dashboard')}
                  block
                  className="action-btn ap-btn-outline"
                >
                  📉 AP Dashboard
                  <span className="btn-subtitle">Tổng hợp công nợ NCC</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Gom đơn hàng
  if (view === 'grouper') {
    return (
      <div className="app">
        <OrderGrouper 
          type={currentType}
          onBack={handleBack}
          onSuccess={() => {
            setView('home')
          }}
        />
      </div>
    )
  }

  // Chọn chứng từ thanh toán
  if (view === 'selector') {
    return (
      <div className="app">
        <DocumentSelector 
          type={currentType}
          onSelect={handleSelectDocument}
          onBack={handleBack}
        />
      </div>
    )
  }

  // Form thanh toán
  if (view === 'payment' && selectedDocument) {
    return (
      <div className="app">
        <PhieuThuChiForm
          refId={selectedDocument.refId}
          refType={selectedDocument.refType}
          onBack={() => setView('selector')}
          onSuccess={handleSuccess}
        />
      </div>
    )
  }

  // AR Dashboard
  if (view === 'ar-dashboard') {
    return (
      <div className="app">
        <ARDashboard onBack={handleBack} />
      </div>
    )
  }

  // AP Dashboard
  if (view === 'ap-dashboard') {
    return (
      <div className="app">
        <APDashboard onBack={handleBack} />
      </div>
    )
  }

  // General Dashboard - Tổng hợp (Trang chủ)
  if (view === 'general-dashboard') {
    return (
      <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <GeneralDashboard 
          onNavigate={(targetView, type) => {
            if (type) setCurrentType(type)
            setView(targetView)
          }}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
      </div>
    )
  }

  return null
}

export default App
