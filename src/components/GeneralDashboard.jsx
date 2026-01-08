import React, { useState, useEffect, useRef } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Button, Progress, Alert, Input, Space, DatePicker } from 'antd'
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

      setSummaryData(summary || null)
      setArConfirmations(Array.isArray(arList) ? arList : [])
      setApConfirmations(Array.isArray(apList) ? apList : [])
      setRecentReceipts(Array.isArray(receipts) ? receipts : [])
      setRecentPayments(Array.isArray(payments) ? payments : [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setSummaryData(null)
      setArConfirmations([])
      setApConfirmations([])
      setRecentReceipts([])
      setRecentPayments([])
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
    if (status === 'DA_THANH_TOAN' || status === 'DA_THU_TIEN') {
      return <Tag color="green" icon={<CheckCircleOutlined />}>ĐÃ THANH TOÁN</Tag>
    }
    if (paymentPercent > 0 && paymentPercent < 100) {
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
            value={selectedKeys[0]?.min || ''}
            onChange={e => {
              const currentValue = selectedKeys[0] || {}
              const newValue = { ...currentValue, min: e.target.value }
              setSelectedKeys([newValue])
            }}
            style={{ width: 150 }}
          />
          <Input
            placeholder={`${placeholder} đến`}
            type="number"
            value={selectedKeys[0]?.max || ''}
            onChange={e => {
              const currentValue = selectedKeys[0] || {}
              const newValue = { ...currentValue, max: e.target.value }
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
    <div style={{ padding: '24px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
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
        {summaryData && summaryData.customer_ar && summaryData.supplier_ap ? (
        <Row gutter={[24, 24]}>
          {/* Công nợ Khách hàng (AR) */}
          <Col xs={24} lg={12}>
            <Card 
              style={{ 
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
              }}
            >
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
                💼 CÔNG NỢ KHÁCH HÀNG (AR)
              </h3>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ color: 'white', fontSize: '0.9375rem', fontWeight: 700 }}>Doanh số</span>}
                    value={summaryData.customer_ar.sales || 0}
                    prefix={<ShoppingCartOutlined style={{ fontSize: '1.25rem' }} />}
                    suffix="₫"
                    valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ color: 'white', fontSize: '0.9375rem', fontWeight: 700 }}>Đã thu</span>}
                    value={summaryData.customer_ar.received || 0}
                    prefix={<CheckCircleOutlined style={{ fontSize: '1.25rem' }} />}
                    suffix="₫"
                    valueStyle={{ color: '#6ee7b7', fontSize: '24px', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ color: 'white', fontSize: '0.9375rem', fontWeight: 700 }}>Chưa thu</span>}
                    value={summaryData.customer_ar.pending || 0}
                    prefix={<ClockCircleOutlined style={{ fontSize: '1.25rem' }} />}
                    suffix="₫"
                    valueStyle={{ color: '#fb923c', fontSize: '24px', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                  />
                </Col>
              </Row>
              <div style={{ marginTop: '20px' }}>
                <Progress 
                  percent={summaryData.customer_ar.receivedPercent || 0} 
                  strokeColor="#6ee7b7"
                  trailColor="rgba(255,255,255,0.3)"
                  format={(percent) => <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9375rem' }}>{percent}% đã thu</span>}
                />
              </div>

              {/* Status Counters */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ color: 'white', fontSize: '0.9375rem', marginBottom: '10px', fontWeight: 600 }}>
                  📋 Trạng thái chứng từ:
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Tag style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, padding: '4px 12px', background: '#94a3b8', color: 'white', border: 'none' }}>
                    Mới: <span style={{ fontSize: '1rem', fontWeight: 800 }}>{summaryData.customer_ar.statusCounts?.new || 0}</span>
                  </Tag>
                  <Tag style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, padding: '4px 12px', background: '#fb923c', color: 'white', border: 'none' }}>
                    Chờ thu: <span style={{ fontSize: '1rem', fontWeight: 800 }}>{summaryData.customer_ar.statusCounts?.pending || 0}</span>
                  </Tag>
                  <Tag style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, padding: '4px 12px', background: '#fbbf24', color: '#78350f', border: 'none' }}>
                    Thu 1 phần: <span style={{ fontSize: '1rem', fontWeight: 800 }}>{summaryData.customer_ar.statusCounts?.partial || 0}</span>
                  </Tag>
                  <Tag style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, padding: '4px 12px', background: '#10b981', color: 'white', border: 'none' }}>
                    Đã thu: <span style={{ fontSize: '1rem', fontWeight: 800 }}>{summaryData.customer_ar.statusCounts?.completed || 0}</span>
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>

          {/* Công nợ Nhà cung cấp (AP) */}
          <Col xs={24} lg={12}>
            <Card 
              style={{ 
                background: 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(49, 46, 129, 0.3)'
              }}
            >
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
                🏭 CÔNG NỢ NHÀ CUNG CẤP (AP)
              </h3>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ color: 'white', fontSize: '0.9375rem', fontWeight: 700 }}>Doanh số</span>}
                    value={summaryData.supplier_ap.purchases || 0}
                    prefix={<ShoppingCartOutlined style={{ fontSize: '1.25rem' }} />}
                    suffix="₫"
                    valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ color: 'white', fontSize: '0.9375rem', fontWeight: 700 }}>Đã chi</span>}
                    value={summaryData.supplier_ap.paid || 0}
                    prefix={<CheckCircleOutlined style={{ fontSize: '1.25rem' }} />}
                    suffix="₫"
                    valueStyle={{ color: '#6ee7b7', fontSize: '24px', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<span style={{ color: 'white', fontSize: '0.9375rem', fontWeight: 700 }}>Chưa chi</span>}
                    value={summaryData.supplier_ap.pending || 0}
                    prefix={<ClockCircleOutlined style={{ fontSize: '1.25rem' }} />}
                    suffix="₫"
                    valueStyle={{ color: '#fb923c', fontSize: '24px', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                  />
                </Col>
              </Row>
              <div style={{ marginTop: '20px' }}>
                <Progress 
                  percent={summaryData.supplier_ap.paidPercent || 0} 
                  strokeColor="#6ee7b7"
                  trailColor="rgba(255,255,255,0.3)"
                  format={(percent) => <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9375rem' }}>{percent}% đã chi</span>}
                />
              </div>

              {/* Status Counters */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ color: 'white', fontSize: '0.9375rem', marginBottom: '10px', fontWeight: 600 }}>
                  📋 Trạng thái chứng từ:
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Tag style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, padding: '4px 12px', background: '#94a3b8', color: 'white', border: 'none' }}>
                    Mới: <span style={{ fontSize: '1rem', fontWeight: 800 }}>{summaryData.supplier_ap.statusCounts?.new || 0}</span>
                  </Tag>
                  <Tag style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, padding: '4px 12px', background: '#fb923c', color: 'white', border: 'none' }}>
                    Chờ chi: <span style={{ fontSize: '1rem', fontWeight: 800 }}>{summaryData.supplier_ap.statusCounts?.pending || 0}</span>
                  </Tag>
                  <Tag style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, padding: '4px 12px', background: '#fbbf24', color: '#78350f', border: 'none' }}>
                    Chi 1 phần: <span style={{ fontSize: '1rem', fontWeight: 800 }}>{summaryData.supplier_ap.statusCounts?.partial || 0}</span>
                  </Tag>
                  <Tag style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, padding: '4px 12px', background: '#10b981', color: 'white', border: 'none' }}>
                    Đã chi: <span style={{ fontSize: '1rem', fontWeight: 800 }}>{summaryData.supplier_ap.statusCounts?.completed || 0}</span>
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            {loading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu'}
          </div>
        )}
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
    </div>
  )
}

export default GeneralDashboard
