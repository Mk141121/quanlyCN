import React, { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Input, Select, DatePicker, Card } from 'antd'
import { SearchOutlined, EyeOutlined, PlusOutlined, FilterOutlined } from '@ant-design/icons'
import { formatters, CONSTANTS } from '../utils/validators'
import dayjs from 'dayjs'
import './ReceiptPaymentList.css'

const { RangePicker } = DatePicker
const { Option } = Select

const ReceiptPaymentList = ({ onCreateNew, onView }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: null,
    status: null,
    dateRange: null,
    search: ''
  })

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    setLoading(true)
    // Mock data - replace with real API
    setTimeout(() => {
      const mockData = [
        {
          id: 'RP001',
          code: 'PT-2024-001',
          type: 'THU',
          amount: 50000000,
          partner: { name: 'Công ty TNHH ABC' },
          status: 'APPROVED',
          createdAt: '2024-01-05T10:00:00Z',
          createdBy: { name: 'Nguyễn Văn A' }
        },
        {
          id: 'RP002',
          code: 'PC-2024-001',
          type: 'CHI',
          amount: 30000000,
          partner: { name: 'Nhà cung cấp XYZ' },
          status: 'PENDING_APPROVAL',
          createdAt: '2024-01-06T14:30:00Z',
          createdBy: { name: 'Trần Thị B' }
        }
      ]
      setData(mockData)
      setLoading(false)
    }, 500)
  }

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (text, record) => (
        <Button type="link" onClick={() => onView?.(record)}>
          <strong>{text}</strong>
        </Button>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => {
        const config = CONSTANTS.RECEIPT_TYPE[type]
        return (
          <Tag color={config.color}>
            {config.icon} {config.label}
          </Tag>
        )
      }
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount) => (
        <strong style={{ color: '#1890ff' }}>
          {formatters.currency(amount)}
        </strong>
      )
    },
    {
      title: 'Đối tác',
      dataIndex: ['partner', 'name'],
      key: 'partner',
      ellipsis: true
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => {
        const config = CONSTANTS.STATUS[status]
        return <Tag color={config.color}>{config.label}</Tag>
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => formatters.datetime(date)
    },
    {
      title: 'Người tạo',
      dataIndex: ['createdBy', 'name'],
      key: 'createdBy',
      width: 120
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onView?.(record)}
        >
          Xem
        </Button>
      )
    }
  ]

  return (
    <div className="receipt-payment-list-container">
      <Card>
        <div className="list-header">
          <h2>📋 Danh sách phiếu thu chi</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateNew}
            size="large"
          >
            Tạo mới
          </Button>
        </div>

        {/* Filters */}
        <div className="list-filters">
          <Space wrap>
            <Input
              placeholder="Tìm mã phiếu, đối tác..."
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />

            <Select
              placeholder="Loại phiếu"
              style={{ width: 140 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, type: value })}
            >
              <Option value="THU">⬇ Phiếu thu</Option>
              <Option value="CHI">⬆ Phiếu chi</Option>
            </Select>

            <Select
              placeholder="Trạng thái"
              style={{ width: 160 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              {Object.entries(CONSTANTS.STATUS).map(([key, config]) => (
                <Option key={key} value={key}>
                  <Tag color={config.color}>{config.label}</Tag>
                </Option>
              ))}
            </Select>

            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: 280 }}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />

            <Button icon={<FilterOutlined />}>Bộ lọc nâng cao</Button>
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} phiếu`
          }}
          scroll={{ x: 1200 }}
          className="receipt-payment-table"
        />
      </Card>
    </div>
  )
}

export default ReceiptPaymentList
