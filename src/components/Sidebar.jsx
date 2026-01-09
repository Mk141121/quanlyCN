import React, { useState, useEffect } from 'react'
import { mockAPI } from '../utils/mockAPICongNo'
import './Sidebar.css'

const Sidebar = ({ onNavigate, darkMode, onToggleDarkMode, currentView, currentType }) => {
  const [pendingProposals, setPendingProposals] = useState(0)
  const [pendingVouchers, setPendingVouchers] = useState(0)
  const [pendingPOCount, setPendingPOCount] = useState(0)
  const [pendingSOCount, setPendingSOCount] = useState(0)

  useEffect(() => {
    loadPendingCounts()
    // Refresh every 30 seconds
    const interval = setInterval(loadPendingCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadPendingCounts = async () => {
    try {
      // Đề xuất thanh toán chờ duyệt
      const proposals = await mockAPI.getPaymentProposalList('PENDING')
      setPendingProposals(proposals?.length || 0)

      // Phiếu thủ công chờ duyệt
      const vouchers = await mockAPI.getPendingVouchers()
      setPendingVouchers(vouchers?.length || 0)

      // PO chờ xác nhận công nợ
      const pos = await mockAPI.getAvailablePurchaseOrders()
      setPendingPOCount(pos?.length || 0)

      // SO chờ xác nhận công nợ
      const sos = await mockAPI.getAvailableSalesOrders()
      setPendingSOCount(sos?.length || 0)
    } catch (error) {
      console.error('Error loading pending counts:', error)
    }
  }

  const totalPendingApprovals = pendingProposals + pendingVouchers

  return (
    <div className="sidebar-menu">
      {/* User Header */}
      <div className="sidebar-user-header">
        <div className="user-info">
          <div className="user-avatar">🏦</div>
          <div className="user-text">
            <span className="user-greeting">Welcome back,</span>
            <h3 className="user-name">Kế toán</h3>
          </div>
        </div>
        <button 
          className="settings-btn"
          onClick={onToggleDarkMode}
          title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search"
        />
      </div>

      {/* Dashboard */}
      <div className="menu-section">
        <div className="section-label">TỔNG QUAN</div>
        
        <button 
          className={`menu-item ${currentView === 'general-dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('general-dashboard')}
        >
          <span className="menu-item-icon">📊</span>
          <span className="menu-item-text">Dashboard Tổng hợp</span>
          <span className="menu-item-dots">⋮</span>
        </button>
      </div>

      {/* AR Section */}
      <div className="menu-section">
        <div className="section-label">KHÁCH HÀNG</div>
        
        <button 
          className={`menu-item ${currentView === 'grouper' && currentType === 'AR' ? 'active' : ''}`}
          onClick={() => onNavigate('grouper', 'AR')}
        >
          <span className="menu-item-icon">💼</span>
          <span className="menu-item-text">Xác nhận Công nợ</span>
          {pendingSOCount > 0 && <span className="menu-badge">{pendingSOCount}</span>}
          <span className="menu-item-dots">⋮</span>
        </button>

        <button 
          className={`menu-item ${currentView === 'selector' && currentType === 'AR' ? 'active' : ''}`}
          onClick={() => onNavigate('selector', 'AR')}
        >
          <span className="menu-item-icon">💵</span>
          <span className="menu-item-text">Lập Phiếu Thu</span>
          <span className="menu-item-dots">⋮</span>
        </button>

        <button 
          className={`menu-item ${currentView === 'ar-dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('ar-dashboard')}
        >
          <span className="menu-item-icon">📈</span>
          <span className="menu-item-text">Báo cáo AR</span>
          <span className="menu-item-dots">⋮</span>
        </button>
      </div>

      {/* AP Section */}
      <div className="menu-section">
        <div className="section-label">NHÀ CUNG CẤP</div>
        
        <button 
          className={`menu-item ${currentView === 'grouper' && currentType === 'AP' ? 'active' : ''}`}
          onClick={() => onNavigate('grouper', 'AP')}
        >
          <span className="menu-item-icon">🏭</span>
          <span className="menu-item-text">Xác nhận Công nợ</span>
          {pendingPOCount > 0 && <span className="menu-badge">{pendingPOCount}</span>}
          <span className="menu-item-dots">⋮</span>
        </button>

        <button 
          className={`menu-item ${currentView === 'payment-proposal-creator' ? 'active' : ''}`}
          onClick={() => onNavigate('payment-proposal-creator')}
        >
          <span className="menu-item-icon">📝</span>
          <span className="menu-item-text">Đề xuất Thanh toán</span>
          <span className="menu-item-dots">⋮</span>
        </button>

        <button 
          className={`menu-item ${currentView === 'proposal-approval-list' ? 'active' : ''}`}
          onClick={() => onNavigate('proposal-approval-list')}
        >
          <span className="menu-item-icon">✅</span>
          <span className="menu-item-text">Duyệt Đề xuất</span>
          {totalPendingApprovals > 0 && <span className="menu-badge badge-warning">{totalPendingApprovals}</span>}
          <span className="menu-item-dots">⋮</span>
        </button>

        <button 
          className={`menu-item ${currentView === 'selector' && currentType === 'AP' ? 'active' : ''}`}
          onClick={() => onNavigate('selector', 'AP')}
        >
          <span className="menu-item-icon">💳</span>
          <span className="menu-item-text">Lập Phiếu Chi</span>
          <span className="menu-item-dots">⋮</span>
        </button>

        <button 
          className={`menu-item ${currentView === 'ap-dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('ap-dashboard')}
        >
          <span className="menu-item-icon">📊</span>
          <span className="menu-item-text">Báo cáo AP</span>
          <span className="menu-item-dots">⋮</span>
        </button>
      </div>

      {/* Administrative Forms Section */}
      <div className="menu-section">
        <div className="section-label">HÀNH CHÍNH</div>
        
        <button 
          className={`menu-item ${currentView === 'print-template-manager' ? 'active' : ''}`}
          onClick={() => onNavigate('print-template-manager')}
        >
          <span className="menu-item-icon">🖨️</span>
          <span className="menu-item-text">Tạo Form Hành chính</span>
          <span className="menu-item-dots">⋮</span>
        </button>
      </div>

      {/* Bottom Section */}
      <div className="menu-bottom">
        <button className="menu-item menu-item-secondary">
          <span className="menu-item-icon">👤</span>
          <span className="menu-item-text">Hỗ trợ</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
