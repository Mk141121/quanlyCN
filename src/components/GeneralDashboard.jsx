import React, { useState, useEffect, useRef } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Button, Progress, Alert, Layout, Input, Space, DatePicker } from 'antd'
import { 
  DollarOutlined, 
  ShoppingCartOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  PictureOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons'
import { mockAPI } from '../utils/mockAPICongNo'
import dayjs from 'dayjs'
import './GeneralDashboard.css'

const { RangePicker } = DatePicker

const { Sider, Content } = Layout

function GeneralDashboard({ 
  onNavigate, 
  darkMode,
  onToggleDarkMode 
}) {
  const [loading, setLoading] = useState(false)
  const [summaryData, setSummaryData] = useState(null)
  const [arConfirmations, setArConfirmations] = useState([])
  const [apConfirmations, setApConfirmations] = useState([])
  const [recentReceipts, setRecentReceipts] = useState([])
  const [recentPayments, setRecentPayments] = useState([])
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [summary, arList, apList, receipts, payments] = await Promise.all([
        mockAPI.getSummaryReports(),
        mockAPI.getARConfirmations(),
        mockAPI.getAPConfirmations(),
        mockAPI.getRecentReceipts({ limit: 10 }),
        mockAPI.getRecentPayments({ limit: 10 })
      ])

      setSummaryData(summary)
      setArConfirmations(arList)
      setApConfirmations(apList)
      setRecentReceipts(receipts)
      setRecentPayments(payments)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Format tiền VND
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  // Render trạng thái
  const renderStatus = (status, paymentPercent) => {
    if (status === 'DA_THANH_TOAN') {
      return <Tag color="green" icon={<CheckCircleOutlined />}>ĐÃ THANH TOÁN</Tag>
    }
    if (status === 'PARTIAL') {
      return <Tag color="pink" icon={<ClockCircleOutlined />}>ĐÃ TT {paymentPercent}%</Tag>
    }
    if (status === 'CHO_THU_TIEN' || status === 'CHO_THANH_TOAN') {
      return <Tag color="gold" icon={<ClockCircleOutlined />}>CHỜ THANH TOÁN</Tag>
    }
    return <Tag color="default">MỚI</Tag>
  }

  // Helper function for text search filter
  const getColumnSearchProps = (dataIndex, placeholder) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Tìm ${placeholder}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Xóa
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => 
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase())
  })

  // Helper function for status filter
  const getStatusFilterProps = () => ({
    filters: [
      { text: 'Đã thanh toán', value: 'DA_THANH_TOAN' },
      { text: 'Chờ thanh toán', value: 'CHO_THANH_TOAN' },
      { text: 'Chờ thu tiền', value: 'CHO_THU_TIEN' },
      { text: 'Thanh toán 1 phần', value: 'PARTIAL' },
    ],
    onFilter: (value, record) => record.status === value,
    filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
  })

  // Helper function for date range filter
  const getDateRangeFilterProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <RangePicker
          format="DD/MM/YYYY"
          onChange={(dates) => setSelectedKeys(dates ? [dates] : [])}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90 }}
          >
            Lọc
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Xóa
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      if (!value || value.length !== 2) return true
      const recordDate = dayjs(record[dataIndex])
      return recordDate.isAfter(value[0]) && recordDate.isBefore(value[1])
    }
  })

  // Helper function for number range filter
  const getNumberRangeFilterProps = (dataIndex, placeholder) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Space direction="vertical">
          <Input
            placeholder={`${placeholder} từ`}
            type="number"
            value={selectedKeys[0]?.min}
            onChange={e => {
              const newValue = { ...selectedKeys[0], min: e.target.value }
              setSelectedKeys([newValue])
            }}
            style={{ width: 150 }}
          />
          <Input
            placeholder={`${placeholder} đến`}
            type="number"
            value={selectedKeys[0]?.max}
            onChange={e => {
              const newValue = { ...selectedKeys[0], max: e.target.value }
              setSelectedKeys([newValue])
            }}
            style={{ width: 150 }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 70 }}
            >
              Lọc
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 70 }}>
              Xóa
            </Button>
          </Space>
        </Space>
      </div>
    ),
    filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      if (!value) return true
      const recordValue = record[dataIndex]
      const min = value.min ? parseFloat(value.min) : -Infinity
      const max = value.max ? parseFloat(value.max) : Infinity
      return recordValue >= min && recordValue <= max
    }
  })

  // Columns cho AR Confirmations
  const arColumns = [
    {
      title: 'Mã AR',
      dataIndex: 'maAR',
      key: 'maAR',
      width: 120,
      fixed: 'left',
      render: (text) => <strong style={{ color: '#10b981' }}>{text}</strong>,
      ...getColumnSearchProps('maAR', 'mã AR')
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      width: 200,
      ...getColumnSearchProps('customer', 'khách hàng')
    },
    {
      title: 'Số đơn',
      dataIndex: 'orderCount',
      key: 'orderCount',
      width: 80,
      align: 'center',
      render: (count) => <Tag color="blue">{count} đơn</Tag>
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (value) => <strong>{formatCurrency(value)}</strong>,
      ...getNumberRangeFilterProps('amount', 'Số tiền')
    },
    {
      title: 'Đã thu',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 150,
      align: 'right',
      render: (value) => <span style={{ color: '#10b981' }}>{formatCurrency(value)}</span>,
      ...getNumberRangeFilterProps('paidAmount', 'Số tiền')
    },
    {
      title: 'Tiến độ',
      dataIndex: 'paymentPercent',
      key: 'paymentPercent',
      width: 150,
      render: (percent, record) => (
        <Progress 
          percent={percent} 
          size="small"
          status={percent === 100 ? 'success' : percent > 0 ? 'active' : 'normal'}
          strokeColor={percent === 100 ? '#10b981' : '#3b82f6'}
        />
      ),
      sorter: (a, b) => a.paymentPercent - b.paymentPercent
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status, record) => renderStatus(status, record.paymentPercent),
      ...getStatusFilterProps()
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      ...getDateRangeFilterProps('createdAt'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
    }
  ]

  // Columns cho AP Confirmations
  const apColumns = [
    {
      title: 'Mã PP',
      dataIndex: 'maPP',
      key: 'maPP',
      width: 120,
      fixed: 'left',
      render: (text) => <strong style={{ color: '#3b82f6' }}>{text}</strong>,
      ...getColumnSearchProps('maPP', 'mã PP')
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 200,
      ...getColumnSearchProps('supplier', 'nhà cung cấp')
    },
    {
      title: 'Số đơn',
      dataIndex: 'orderCount',
      key: 'orderCount',
      width: 80,
      align: 'center',
      render: (count) => <Tag color="orange">{count} đơn</Tag>
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (value) => <strong>{formatCurrency(value)}</strong>,
      ...getNumberRangeFilterProps('amount', 'Số tiền')
    },
    {
      title: 'Đã chi',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 150,
      align: 'right',
      render: (value) => <span style={{ color: '#3b82f6' }}>{formatCurrency(value)}</span>,
      ...getNumberRangeFilterProps('paidAmount', 'Số tiền')
    },
    {
      title: 'Tiến độ',
      dataIndex: 'paymentPercent',
      key: 'paymentPercent',
      width: 150,
      render: (percent) => (
        <Progress 
          percent={percent} 
          size="small"
          status={percent === 100 ? 'success' : percent > 0 ? 'active' : 'normal'}
          strokeColor={percent === 100 ? '#10b981' : '#f59e0b'}
        />
      ),
      sorter: (a, b) => a.paymentPercent - b.paymentPercent
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status, record) => renderStatus(status, record.paymentPercent),
      ...getStatusFilterProps()
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      ...getDateRangeFilterProps('createdAt'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
    }
  ]

  // Columns cho Phiếu Thu
  const receiptColumns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'maPhieu',
      key: 'maPhieu',
      width: 120,
      render: (text) => <strong style={{ color: '#10b981' }}>{text}</strong>,
      ...getColumnSearchProps('maPhieu', 'mã phiếu')
    },
    {
      title: 'Số tiền',
      dataIndex: 'soTien',
      key: 'soTien',
      width: 150,
      align: 'right',
      render: (value) => <strong>{formatCurrency(value)}</strong>,
      ...getNumberRangeFilterProps('soTien', 'Số tiền'),
      sorter: (a, b) => a.soTien - b.soTien
    },
    {
      title: 'Phương thức',
      dataIndex: 'phuongThuc',
      key: 'phuongThuc',
      width: 120,
      render: (method) => (
        <Tag color={method === 'TIEN_MAT' ? 'green' : 'blue'}>
          {method === 'TIEN_MAT' ? 'Tiền mặt' : 'Chuyển khoản'}
        </Tag>
      ),
      filters: [
        { text: 'Tiền mặt', value: 'TIEN_MAT' },
        { text: 'Chuyển khoản', value: 'CHUYEN_KHOAN' },
      ],
      onFilter: (value, record) => record.phuongThuc === value
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => renderStatus(status),
      ...getStatusFilterProps()
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'hasImage',
      key: 'hasImage',
      width: 100,
      align: 'center',
      render: (hasImage, record) => 
        hasImage ? (
          <Button type="link" icon={<PictureOutlined />} size="small">Xem</Button>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
      filters: [
        { text: 'Có hình ảnh', value: true },
        { text: 'Không có hình ảnh', value: false },
      ],
      onFilter: (value, record) => record.hasImage === value
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      ...getDateRangeFilterProps('createdAt'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
    }
  ]

  // Columns cho Phiếu Chi
  const paymentColumns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'maPhieu',
      key: 'maPhieu',
      width: 120,
      render: (text) => <strong style={{ color: '#3b82f6' }}>{text}</strong>,
      ...getColumnSearchProps('maPhieu', 'mã phiếu')
    },
    {
      title: 'Số tiền',
      dataIndex: 'soTien',
      key: 'soTien',
      width: 150,
      align: 'right',
      render: (value) => <strong>{formatCurrency(value)}</strong>,
      ...getNumberRangeFilterProps('soTien', 'Số tiền'),
      sorter: (a, b) => a.soTien - b.soTien
    },
    {
      title: 'Phương thức',
      dataIndex: 'phuongThuc',
      key: 'phuongThuc',
      width: 120,
      render: (method) => (
        <Tag color={method === 'TIEN_MAT' ? 'green' : 'blue'}>
          {method === 'TIEN_MAT' ? 'Tiền mặt' : 'Chuyển khoản'}
        </Tag>
      ),
      filters: [
        { text: 'Tiền mặt', value: 'TIEN_MAT' },
        { text: 'Chuyển khoản', value: 'CHUYEN_KHOAN' },
      ],
      onFilter: (value, record) => record.phuongThuc === value
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => renderStatus(status),
      ...getStatusFilterProps()
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'needsImage',
      key: 'needsImage',
      width: 100,
      align: 'center',
      render: (needsImage, record) => 
        needsImage ? (
          <WarningOutlined style={{ color: '#f59e0b', fontSize: '18px' }} />
        ) : record.hasImage ? (
          <Button type="link" icon={<PictureOutlined />} size="small">Xem</Button>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
      filters: [
        { text: 'Cần hình ảnh', value: 'needs' },
        { text: 'Có hình ảnh', value: 'has' },
        { text: 'Không cần', value: 'none' },
      ],
      onFilter: (value, record) => {
        if (value === 'needs') return record.needsImage
        if (value === 'has') return record.hasImage
        if (value === 'none') return !record.needsImage && !record.hasImage
        return true
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      ...getDateRangeFilterProps('createdAt'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
    }
  ]

  if (!summaryData) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu...</div>
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* LEFT SIDEBAR - MENU */}
      <Sider 
        width={320} 
        style={{ 
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0
        }}
      >
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

          {/* AR Section */}
          <div className="menu-section">
            <div className="section-label">KHÁCH HÀNG</div>
            
            <button 
              className="menu-item"
              onClick={() => onNavigate('grouper', 'AR')}
            >
              <span className="menu-item-icon">💼</span>
              <span className="menu-item-text">Xác nhẫn Công nợ</span>
              <span className="menu-item-dots">⋮</span>
            </button>

            <button 
              className="menu-item"
              onClick={() => onNavigate('selector', 'AR')}
            >
              <span className="menu-item-icon">💵</span>
              <span className="menu-item-text">Lập Phiếu Thu</span>
              <span className="menu-item-dots">⋮</span>
            </button>

            <button 
              className="menu-item"
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
              className="menu-item"
              onClick={() => onNavigate('grouper', 'AP')}
            >
              <span className="menu-item-icon">🏭</span>
              <span className="menu-item-text">Xác nhận Công nợ</span>
              <span className="menu-item-dots">⋮</span>
            </button>

            <button 
              className="menu-item"
              onClick={() => onNavigate('selector', 'AP')}
            >
              <span className="menu-item-icon">💳</span>
              <span className="menu-item-text">Lập Phiếu Chi</span>
              <span className="menu-item-dots">⋮</span>
            </button>

            <button 
              className="menu-item"
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
      </Sider>

      {/* RIGHT CONTENT - DASHBOARD */}
      <Layout style={{ marginLeft: 320, background: 'var(--bg-primary)' }}>
        <Content style={{ padding: '24px' }}>
          {/* Dashboard Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
              📊 Dashboard Kế toán Tổng hợp
            </h1>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>
              Tổng quan về công nợ và dòng tiền
            </p>
          </div>

      {/* KHỐI 1: BÁO CÁO CÔNG NỢ TỔNG HỢP */}
      <Card 
        title={<span style={{ fontSize: '20px', fontWeight: 600 }}>📈 Báo cáo Công nợ Tổng hợp</span>}
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[24, 24]}>
          {/* Công nợ Khách hàng (AR) */}
          <Col xs={24} lg={12}>
            <Card 
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '12px'
              }}
            >
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
                💼 CÔNG NỢ KHÁCH HÀNG (AR)
              </h3>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Doanh số</span>}
                    value={summaryData.customer_ar.sales}
                    prefix={<ShoppingCartOutlined />}
                    suffix="₫"
                    valueStyle={{ color: 'white', fontSize: '20px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Đã thu</span>}
                    value={summaryData.customer_ar.received}
                    prefix={<CheckCircleOutlined />}
                    suffix="₫"
                    valueStyle={{ color: '#d1fae5', fontSize: '20px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Chưa thu</span>}
                    value={summaryData.customer_ar.pending}
                    prefix={<ClockCircleOutlined />}
                    suffix="₫"
                    valueStyle={{ color: '#fbbf24', fontSize: '20px' }}
                  />
                </Col>
              </Row>
              <div style={{ marginTop: '20px' }}>
                <Progress 
                  percent={summaryData.customer_ar.receivedPercent} 
                  strokeColor="#d1fae5"
                  trailColor="rgba(255,255,255,0.3)"
                  format={(percent) => <span style={{ color: 'white' }}>{percent}% đã thu</span>}
                />
              </div>
            </Card>
          </Col>

          {/* Công nợ Nhà cung cấp (AP) */}
          <Col xs={24} lg={12}>
            <Card 
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '12px'
              }}
            >
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
                🏭 CÔNG NỢ NHÀ CUNG CẤP (AP)
              </h3>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Doanh số</span>}
                    value={summaryData.supplier_ap.purchases}
                    prefix={<ShoppingCartOutlined />}
                    suffix="₫"
                    valueStyle={{ color: 'white', fontSize: '20px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Đã chi</span>}
                    value={summaryData.supplier_ap.paid}
                    prefix={<CheckCircleOutlined />}
                    suffix="₫"
                    valueStyle={{ color: '#dbeafe', fontSize: '20px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Chưa chi</span>}
                    value={summaryData.supplier_ap.pending}
                    prefix={<ClockCircleOutlined />}
                    suffix="₫"
                    valueStyle={{ color: '#fbbf24', fontSize: '20px' }}
                  />
                </Col>
              </Row>
              <div style={{ marginTop: '20px' }}>
                <Progress 
                  percent={summaryData.supplier_ap.paidPercent} 
                  strokeColor="#dbeafe"
                  trailColor="rgba(255,255,255,0.3)"
                  format={(percent) => <span style={{ color: 'white' }}>{percent}% đã chi</span>}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* KHỐI 2: XÁC NHẬN CÔNG NỢ */}
      <Card 
        title={<span style={{ fontSize: '20px', fontWeight: 600 }}>📑 Xác nhận Công nợ (AR/AP Documents)</span>}
        style={{ marginBottom: '24px' }}
      >
        {/* AR Confirmations */}
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#10b981' }}>
          💼 Xác nhận Công nợ Khách hàng (AR Documents)
        </h3>
        <Table
          columns={arColumns}
          dataSource={arConfirmations}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 1200 }}
          style={{ marginBottom: '32px' }}
          size="small"
        />

        {/* AP Confirmations */}
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#3b82f6' }}>
          🏭 Xác nhận Công nợ Nhà cung cấp (Payment Proposals)
        </h3>
        <Table
          columns={apColumns}
          dataSource={apConfirmations}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>

      {/* KHỐI 3: QUẢN LÝ PHIẾU THU/CHI */}
      <Card 
        title={<span style={{ fontSize: '20px', fontWeight: 600 }}>💳 Quản lý Phiếu Thu/Chi</span>}
      >
        <Row gutter={[24, 24]}>
          {/* Phiếu Thu */}
          <Col xs={24} xl={12}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#10b981' }}>
              📥 Danh sách Phiếu Thu
            </h3>
            <Table
              columns={receiptColumns}
              dataSource={recentReceipts}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              scroll={{ x: 800 }}
              size="small"
            />
          </Col>

          {/* Phiếu Chi */}
          <Col xs={24} xl={12}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#3b82f6' }}>
              📤 Danh sách Phiếu Chi
            </h3>
            {recentPayments.some(p => p.needsImage) && (
              <Alert
                message="⚠️ Cảnh báo"
                description="Có phiếu chi chuyển khoản chưa upload hình ảnh Bill"
                type="warning"
                showIcon
                style={{ marginBottom: '12px' }}
              />
            )}
            <Table
              columns={paymentColumns}
              dataSource={recentPayments}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              scroll={{ x: 800 }}
              size="small"
            />
          </Col>
        </Row>
      </Card>
        </Content>
      </Layout>
    </Layout>
  )
}

export default GeneralDashboard
