import React, { useState } from 'react'
import OrderGrouper from './components/OrderGrouper'
import DocumentSelector from './components/DocumentSelector'
import PhieuThuChiForm from './components/PhieuThuChiForm'
import ARDashboard from './components/ARDashboard'
import APDashboard from './components/APDashboard'
import GeneralDashboard from './components/GeneralDashboard'
import Sidebar from './components/Sidebar'
import PaymentProposalCreator from './components/PaymentProposalCreator'
import ProposalApprovalList from './components/ProposalApprovalList'
import ProposalApprovalDetail from './components/ProposalApprovalDetail'
import PrintTemplateManager from './components/print/PrintTemplateManager'
import './App.css'

function App() {
  const [view, setView] = useState('general-dashboard') // general-dashboard, grouper, selector, payment, payment-proposal-creator, proposal-approval-list, proposal-approval-detail
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [viewOnlyProposal, setViewOnlyProposal] = useState(false) // true khi xem từ tab "Đã đề xuất" (chỉ xem, không duyệt)
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
    setSelectedProposal(null)
  }

  const handleSuccess = () => {
    setView('general-dashboard')
    setSelectedDocument(null)
    setSelectedProposal(null)
  }

  const handleNavigate = (targetView, type) => {
    if (type) setCurrentType(type)
    setView(targetView)
    setSelectedDocument(null)
    setSelectedProposal(null)
  }

  const handleSelectProposal = (proposalId) => {
    setSelectedProposal(proposalId)
    setView('proposal-approval-detail')
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
          loaiPhieuProp={selectedDocument.loaiPhieu}
          isViewOnly={selectedDocument.isViewOnly}
          isCreateNew={selectedDocument.isCreateNew}
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

    // Payment Proposal Creator
    if (view === 'payment-proposal-creator') {
      return (
        <PaymentProposalCreator
          onBack={handleBack}
          onSuccess={() => setView('proposal-approval-list')}
          onViewProposal={(proposalId) => {
            setSelectedProposal(proposalId)
            setViewOnlyProposal(true) // Từ tab "Đã đề xuất" - chỉ xem, không có nút duyệt
            setView('proposal-approval-detail')
          }}
        />
      )
    }

    // Proposal Approval List
    if (view === 'proposal-approval-list') {
      return (
        <ProposalApprovalList
          onBack={handleBack}
          onSelectProposal={(proposalId) => {
            setSelectedProposal(proposalId)
            setViewOnlyProposal(false) // Từ danh sách duyệt - có thể duyệt
            setView('proposal-approval-detail')
          }}
        />
      )
    }

    // Proposal Approval Detail
    if (view === 'proposal-approval-detail' && selectedProposal) {
      return (
        <ProposalApprovalDetail
          proposalId={selectedProposal}
          viewOnly={viewOnlyProposal}
          onBack={() => {
            if (viewOnlyProposal) {
              setView('payment-proposal-creator')
            } else {
              setView('proposal-approval-list')
            }
            setViewOnlyProposal(false)
          }}
          onSuccess={() => {
            setView('proposal-approval-list')
            setViewOnlyProposal(false)
          }}
        />
      )
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

    // Print Template Manager - Tạo Form Hành chính
    if (view === 'print-template-manager') {
      return (
        <PrintTemplateManager />
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
            currentType={currentType}
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
