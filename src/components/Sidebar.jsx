import React from 'react'
import './Sidebar.css'

const Sidebar = ({ onNavigate, darkMode, onToggleDarkMode, currentView, currentType }) => {
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
