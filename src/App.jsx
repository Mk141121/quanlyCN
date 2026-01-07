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
    setView('general-dashboard')
    setSelectedDocument(null)
  }

  const handleSuccess = () => {
    setView('general-dashboard')
    setSelectedDocument(null)
  }

  // Gom đơn hàng
  if (view === 'grouper') {
    return (
      <div className="app">
        <OrderGrouper 
          type={currentType}
          onBack={handleBack}
          onSuccess={() => {
            setView('general-dashboard')
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
