import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
  Statistic,
  Tag,
  Space,
  message,
  Drawer
} from 'antd'
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  LineChartOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { mockAPI } from '../utils/mockAPICongNo'
import dayjs from 'dayjs'
import './APDashboard.css'

const { RangePicker } = DatePicker
const { Option } = Select

const APDashboard = ({ onBack }) => {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState([
    dayjs().startOf('month'),
    dayjs()
  ])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [summaryData, setSummaryData] = useState([])
  const [detailDrawer, setDetailDrawer] = useState(false)
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState(null)
  const [orderDetails, setOrderDetails] = useState([])

  useEffect(() => {
    loadSuppliers()
  }, [])

  useEffect(() => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      loadSummary()
    }
  }, [dateRange, selectedSupplier])

  const loadSuppliers = async () => {
    try {
      const data = await mockAPI.getSuppliers()
      setSuppliers(data)
    } catch (error) {
      message.error('Không thể load danh sách nhà cung cấp')
    }
  }

  const loadSummary = async () => {
    setLoading(true)
    try {
      const params = {
        fromDate: dateRange[0].format('YYYY-MM-DD'),
        toDate: dateRange[1].format('YYYY-MM-DD'),
        supplierId: selectedSupplier
      }
      const data = await mockAPI.getAPSummary(params)
      setSummaryData(data)
    } catch (error) {
      message.error('Không thể load báo cáo')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (supplier) => {
    setSelectedSupplierDetail(supplier)
    setDetailDrawer(true)
    try {
      const params = {
        supplierId: supplier.supplierId,
        fromDate: dateRange[0].format('YYYY-MM-DD'),
        toDate: dateRange[1].format('YYYY-MM-DD')
      }
      const data = await mockAPI.getSupplierOrders(params)
      setOrderDetails(data)
    } catch (error) {
      message.error('Không thể load chi tiết đơn hàng')
    }
  }

  // Cột cho bảng tổng hợp
  const summaryColumns = [
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplierName',
      key: 'supplierName',
      fixed: 'left',
      width: 200,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Tổng giá trị mua\n(CN tạm)',
      dataIndex: 'totalPurchase',
      key: 'totalPurchase',
      align: 'right',
      width: 150,
      render: (value) => (
        <span style={{ color: '#1890ff', fontWeight: 500 }}>
          {value.toLocaleString()}
        </span>
      )
    },
    {
      title: 'Công nợ phải trả\n(CN chính thức)',
      dataIndex: 'accountingAP',
      key: 'accountingAP',
      align: 'right',
      width: 180,
      render: (value) => (
        <span style={{ color: '#faad14', fontWeight: 600 }}>
          {value.toLocaleString()}
        </span>
      )
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'paid',
      key: 'paid',
      align: 'right',
      width: 150,
      render: (value) => (
        <span style={{ color: '#52c41a', fontWeight: 500 }}>
          {value.toLocaleString()}
        </span>
      )
    },
    {
      title: 'Còn lại',
      dataIndex: 'remaining',
      key: 'remaining',
      align: 'right',
      width: 150,
      render: (value) => (
        <span style={{ color: value > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 600 }}>
          {value.toLocaleString()}
        </span>
      )
    },
    {
      title: '% Trả',
      key: 'paymentRate',
      align: 'center',
      width: 100,
      render: (_, record) => {
        const rate = record.accountingAP > 0 
          ? Math.round((record.paid / record.accountingAP) * 100)
          : 0
        return (
          <Tag color={rate === 100 ? 'green' : rate >= 50 ? 'orange' : 'red'}>
            {rate}%
          </Tag>
        )
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<FileTextOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      )
    }
  ]

  // Cột cho bảng chi tiết đơn
  const orderColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'maDon',
      key: 'maDon',
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Ngày',
      dataIndex: 'ngay',
      key: 'ngay',
      width: 120
    },
    {
      title: 'Giá trị',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 150,
      render: (value) => (
        <span style={{ fontWeight: 500 }}>
          {value.toLocaleString()} VND
        </span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'statusDisplay',
      key: 'statusDisplay',
      width: 150,
      render: (text, record) => {
        const colorMap = {
          'ĐÃ ĐỐI CHIẾU': 'orange',
          'CHỜ THANH TOÁN': 'gold',
          'ĐÃ THANH TOÁN': 'green'
        }
        return <Tag color={colorMap[text]}>{text}</Tag>
      }
    }
  ]

  // Tính tổng
  const totals = summaryData.reduce((acc, item) => ({
    totalPurchase: acc.totalPurchase + item.totalPurchase,
    accountingAP: acc.accountingAP + item.accountingAP,
    paid: acc.paid + item.paid,
    remaining: acc.remaining + item.remaining
  }), { totalPurchase: 0, accountingAP: 0, paid: 0, remaining: 0 })

  return (
    <div className="ap-dashboard-container">
      <Card>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space>
                <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
                  Quay lại
                </Button>
                <h2 style={{ margin: 0 }}>
                  <LineChartOutlined /> AP Dashboard - Công nợ Nhà cung cấp
                </h2>
              </Space>
            </Col>
            <Col>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadSummary}
                loading={loading}
              >
                Làm mới
              </Button>
            </Col>
          </Row>
        </div>

        {/* Bộ lọc */}
        <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
          <Row gutter={16}>
            <Col span={12}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Khoảng ngày
              </label>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                size="large"
              />
            </Col>
            <Col span={12}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Nhà cung cấp
              </label>
              <Select
                value={selectedSupplier}
                onChange={setSelectedSupplier}
                style={{ width: '100%' }}
                size="large"
                allowClear
                placeholder="Tất cả nhà cung cấp"
              >
                {suppliers.map(s => (
                  <Option key={s.id} value={s.id}>{s.name}</Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Thống kê tổng */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng giá trị mua (CN tạm)"
                value={totals.totalPurchase}
                suffix="VND"
                valueStyle={{ color: '#1890ff' }}
                formatter={(value) => value.toLocaleString()}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Công nợ phải trả"
                value={totals.accountingAP}
                suffix="VND"
                valueStyle={{ color: '#faad14' }}
                formatter={(value) => value.toLocaleString()}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã thanh toán"
                value={totals.paid}
                suffix="VND"
                valueStyle={{ color: '#52c41a' }}
                formatter={(value) => value.toLocaleString()}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Còn lại"
                value={totals.remaining}
                suffix="VND"
                valueStyle={{ color: '#ff4d4f' }}
                formatter={(value) => value.toLocaleString()}
              />
            </Card>
          </Col>
        </Row>

        {/* Bảng tổng hợp */}
        <Table
          columns={summaryColumns}
          dataSource={summaryData}
          rowKey="supplierId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhà cung cấp`
          }}
          scroll={{ x: 1200 }}
        />

        {/* Drawer chi tiết */}
        <Drawer
          title={`Chi tiết đơn mua - ${selectedSupplierDetail?.supplierName}`}
          placement="right"
          onClose={() => setDetailDrawer(false)}
          open={detailDrawer}
          width={800}
        >
          <Table
            columns={orderColumns}
            dataSource={orderDetails}
            rowKey="id"
            pagination={false}
            scroll={{ y: 600 }}
          />
        </Drawer>
      </Card>
    </div>
  )
}

export default APDashboard
