import React, { useState } from 'react'
import OrderGrouper from './components/OrderGrouper'
import DocumentSelector from './components/DocumentSelector'
import PhieuThuChiForm from './components/PhieuThuChiForm'
import ARDashboard from './components/ARDashboard'
import APDashboard from './components/APDashboard'
import GeneralDashboard from './components/GeneralDashboard'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  const [view, setView] = useState('general-dashboard') // general-dashboard, grouper-ap, grouper-ar, selector-ap, selector-ar, payment
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [currentType, setCurrentType] = useState(null) // AP or AR
  const [darkMode, setDarkMode] = useState(true) // Mặc định dark mode
  const [sidebarOpen, setSidebarOpen] = useState(false) // Mobile sidebar toggle

  const handleSelectDocument = (doc) => {
    setSelectedDocument(doc)
    setView('payment')
  }

  const handleBack = () => {
    setView('general-dashboard')
    setSelectedDocument(null)
  }

  const handleSuccess = () => {
    setView('general-dashboard')
    setSelectedDocument(null)
  }

  const handleNavigate = (targetView, type) => {
    if (type) setCurrentType(type)
    setView(targetView)
    setSelectedDocument(null) // Clear any selected document when navigating
  }

  const renderMainContent = () => {
    // Gom đơn hàng
    if (view === 'grouper') {
      return (
        <OrderGrouper 
          type={currentType}
          onBack={handleBack}
          onSuccess={() => {
            setView('general-dashboard')
          }}
        />
      )
    }

    // Chọn chứng từ thanh toán
    if (view === 'selector') {
      return (
        <DocumentSelector 
          type={currentType}
          onSelect={handleSelectDocument}
          onBack={handleBack}
        />
      )
    }

    // Form thanh toán
    if (view === 'payment' && selectedDocument) {
      return (
        <PhieuThuChiForm
          refId={selectedDocument.refId}
          refType={selectedDocument.refType}
          onBack={() => setView('selector')}
          onSuccess={handleSuccess}
        />
      )
    }

    // AR Dashboard
    if (view === 'ar-dashboard') {
      return <ARDashboard onBack={handleBack} />
    }

    // AP Dashboard
    if (view === 'ap-dashboard') {
      return <APDashboard onBack={handleBack} />
    }

    // General Dashboard - Tổng hợp (Trang chủ)
    if (view === 'general-dashboard') {
      return (
        <GeneralDashboard 
          onNavigate={handleNavigate}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
      )
    }

    return null
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="app-layout">
        <div className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar 
            onNavigate={(targetView, type) => {
              handleNavigate(targetView, type)
              setSidebarOpen(false) // Close sidebar after navigation on mobile
            }}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            currentView={view}
          />
        </div>
        <div className="app-main">
          {renderMainContent()}
        </div>
      </div>
    </div>
  )
}

export default App
