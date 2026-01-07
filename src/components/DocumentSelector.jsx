import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Radio, message, Spin, Input, Space, DatePicker } from 'antd'
import { FileTextOutlined, RightOutlined, ArrowLeftOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons'
import { mockAPI } from '../utils/mockAPICongNo'
import dayjs from 'dayjs'
import './DocumentSelector.css'

const { RangePicker } = DatePicker

// Màu sắc theo SPEC
const STATUS_COLORS = {
  CHO_THANH_TOAN: 'gold',
  CHO_THU_TIEN: 'gold',
  DA_THANH_TOAN: 'green',
  PARTIAL_PAID: 'pink'  // Hồng nhạt cho thanh toán 1 phần
}

const STATUS_LABELS = {
  CHO_THANH_TOAN: 'Chờ thanh toán',
  CHO_THU_TIEN: 'Chờ thu tiền',
  DA_THANH_TOAN: 'Đã thanh toán'
}

// Helper: Tính % thanh toán và trạng thái
const getPaymentStatus = (doc) => {
  const paidPercent = doc.amount > 0 ? Math.round((doc.paidAmount / doc.amount) * 100) : 0
  
  if (paidPercent === 0) {
    return {
      color: doc.status === 'CHO_THANH_TOAN' || doc.status === 'CHO_THU_TIEN' ? STATUS_COLORS.CHO_THANH_TOAN : STATUS_COLORS.CHO_THU_TIEN,
      label: STATUS_LABELS[doc.status]
    }
  } else if (paidPercent >= 100) {
    return {
      color: STATUS_COLORS.DA_THANH_TOAN,
      label: STATUS_LABELS.DA_THANH_TOAN
    }
  } else {
    return {
      color: STATUS_COLORS.PARTIAL_PAID,
      label: `Đã TT ${paidPercent}%`
    }
  }
}

const DocumentSelector = ({ type = 'AP', onSelect, onBack }) => {
  const loaiPhieu = type === 'AP' ? 'CHI' : 'THU'
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)

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

  useEffect(() => {
    loadDocuments()
  }, [loaiPhieu])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      let data
      if (loaiPhieu === 'CHI') {
        // Load Payment Proposals (AP)
        data = await mockAPI.getPaymentProposals()
        // Transform to common format
        data = data.map(pp => ({
          id: pp.id,
          code: pp.maDeXuat,
          partner: pp.supplier,  // Tên NCC
          amount: pp.totalAmount,
          paidAmount: pp.paidAmount || 0,
          status: pp.status,
          itemCount: pp.items.length,
          createdAt: pp.createdAt,
          type: 'PaymentProposal'
        }))
      } else {
        // Load AR Documents
        data = await mockAPI.getARDocuments()
        // Transform to common format
        data = data.map(ar => ({
          id: ar.id,
          code: ar.maChungTu,
          partner: ar.customer,  // Tên khách hàng
          amount: ar.totalAmount,
          paidAmount: ar.paidAmount || 0,
          status: ar.status,
          itemCount: ar.items.length,
          createdAt: ar.createdAt,
          type: 'ARDocument'
        }))
      }
      setDocuments(data)
    } catch (error) {
      message.error('Không thể load danh sách: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Mã chứng từ',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      render: (text) => (
        <Tag color="blue" style={{ fontSize: 14 }}>
          {text}
        </Tag>
      ),
      ...getColumnSearchProps('code', 'mã chứng từ')
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date) => date ? new Date(date).toLocaleString('vi-VN') : '-',
      ...getDateRangeFilterProps('createdAt'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
    },
    {
      title: 'Đối tượng',
      dataIndex: 'partner',
      key: 'partner',
      ellipsis: true,
      ...getColumnSearchProps('partner', 'đối tượng')
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 180,
      align: 'right',
      render: (amount) => (
        <strong style={{ fontSize: 16, color: '#1890ff' }}>
          {amount.toLocaleString()} VND
        </strong>
      ),
      ...getNumberRangeFilterProps('amount', 'Số tiền'),
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Số đơn hàng',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 120,
      align: 'center',
      render: (count) => (
        <Tag color="cyan">{count} đơn</Tag>
      ),
      sorter: (a, b) => a.itemCount - b.itemCount
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, record) => {
        const paymentStatus = getPaymentStatus(record)
        return (
          <Tag color={paymentStatus.color}>
            {paymentStatus.label}
          </Tag>
        )
      },
      ...getStatusFilterProps()
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<RightOutlined />}
          onClick={() => handleSelect(record)}
          disabled={record.status === 'DA_THANH_TOAN'}
        >
          Chọn
        </Button>
      )
    }
  ]

  const handleSelect = (record) => {
    onSelect({
      refId: record.id,
      refType: record.type,
      loaiPhieu
    })
  }

  return (
    <div className="document-selector-container">
      <Card className="document-selector-card">
        <div className="selector-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>Quay lại</Button>
            <h2>
              <FileTextOutlined /> 
              {loaiPhieu === 'CHI' ? ' 💳 Phiếu Chi' : ' 💵 Phiếu Thu'}
            </h2>
          </div>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={documents}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} chứng từ`
            }}
            scroll={{ x: 1000 }}
            className="documents-table"
          />
        </Spin>
      </Card>
    </div>
  )
}

export default DocumentSelector
