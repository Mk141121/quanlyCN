import React, { useState } from 'react'
import { Button, Space } from 'antd'
import { FileAddOutlined, FileTextOutlined } from '@ant-design/icons'
import OrderGrouper from './components/OrderGrouper'
import DocumentSelector from './components/DocumentSelector'
import PhieuThuChiForm from './components/PhieuThuChiForm'
import ARDashboard from './components/ARDashboard'
import APDashboard from './components/APDashboard'
import './App.css'

function App() {
  const [view, setView] = useState('home') // home, grouper-ap, grouper-ar, selector-ap, selector-ar, payment
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [currentType, setCurrentType] = useState(null) // AP or AR

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
      <div className="app">
        <div className="home-menu">
          <h1>🏦 Hệ thống Quản lý Công nợ</h1>
          
          <div style={{ marginBottom: 30 }}>
            <h3>📦 XÁC NHẬN CÔNG NỢ</h3>
            <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 500 }}>
              <Button
                type="primary"
                size="large"
                icon={<FileAddOutlined />}
                onClick={() => {
                  setCurrentType('AP')
                  setView('grouper')
                }}
                block
                style={{ height: 60, fontSize: 16, background: '#1890ff' }}
              >
                🛒 Công nợ NCC (PO → Payment Proposal)
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<FileAddOutlined />}
                onClick={() => {
                  setCurrentType('AR')
                  setView('grouper')
                }}
                block
                style={{ height: 60, fontSize: 16, background: '#52c41a' }}
              >
                💼 Công nợ khách hàng (SO → AR Document)
              </Button>
            </Space>
          </div>

          <div style={{ marginBottom: 30 }}>
            <h3>💰 Lập Phiếu THU/CHI</h3>
            <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 500 }}>
              <Button
                type="default"
                size="large"
                icon={<FileTextOutlined />}
                onClick={() => {
                  setCurrentType('AP')
                  setView('selector')
                }}
                block
                style={{ height: 60, fontSize: 16 }}
              >
                💳 Phiếu Chi
              </Button>
              <Button
                type="default"
                size="large"
                icon={<FileTextOutlined />}
                onClick={() => {
                  setCurrentType('AR')
                  setView('selector')
                }}
                block
                style={{ height: 60, fontSize: 16 }}
              >
                💵 Phiếu Thu
              </Button>
            </Space>
          </div>

          <div>
            <h3>📊 BÁO CÁO CÔNG NỢ</h3>
            <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 500 }}>
              <Button
                type="dashed"
                size="large"
                icon={<FileTextOutlined />}
                onClick={() => setView('ar-dashboard')}
                block
                style={{ height: 60, fontSize: 16, borderColor: '#52c41a', color: '#52c41a' }}
              >
                📈 AR Dashboard - Công nợ Khách hàng
              </Button>
              <Button
                type="dashed"
                size="large"
                icon={<FileTextOutlined />}
                onClick={() => setView('ap-dashboard')}
                block
                style={{ height: 60, fontSize: 16, borderColor: '#1890ff', color: '#1890ff' }}
              >
                📉 AP Dashboard - Công nợ NCC
              </Button>
            </Space>
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

  return null
}

export default App
