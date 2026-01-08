import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  message,
  Space,
  Input,
  DatePicker,
  Tabs,
  Modal
} from 'antd'
import {
  ArrowLeftOutlined,
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { mockAPI } from '../utils/mockAPICongNo'
import dayjs from 'dayjs'
import './ProposalApprovalList.css'

const { RangePicker } = DatePicker
const { TextArea } = Input

const ProposalApprovalList = ({ onBack, onSelectProposal }) => {
  const [loading, setLoading] = useState(false)
  const [proposals, setProposals] = useState([])
  const [manualVouchers, setManualVouchers] = useState([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [activeTab, setActiveTab] = useState('proposals')
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    loadProposals()
    loadManualVouchers()
  }, [statusFilter])

  const loadProposals = async () => {
    setLoading(true)
    try {
      const data = await mockAPI.getPaymentProposalList(statusFilter)
      setProposals(data)
    } catch (error) {
      message.error('Không thể load danh sách đề xuất: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadManualVouchers = async () => {
    try {
      const allVouchers = await mockAPI.getPhieuThuChi()
      const filtered = allVouchers.filter(v => v.isManual)
      setManualVouchers(filtered)
    } catch (error) {
      console.error('Error loading manual vouchers:', error)
    }
  }

  // Duyệt phiếu thủ công
  const handleApproveVoucher = async (voucher) => {
    Modal.confirm({
      title: 'Xác nhận Duyệt phiếu',
      content: (
        <div>
          <p>Bạn có chắc muốn duyệt {voucher.loaiPhieu === 'CHI' ? 'Phiếu Chi' : 'Phiếu Thu'} này?</p>
          <p><strong>Mã phiếu:</strong> {voucher.maPhieu}</p>
          <p><strong>Nội dung:</strong> {voucher.noiDung}</p>
          <p><strong>Số tiền:</strong> {voucher.totalAmount.toLocaleString()} VND</p>
        </div>
      ),
      okText: 'Duyệt',
      cancelText: 'Hủy',
      okType: 'primary',
      onOk: async () => {
        try {
          await mockAPI.approveManualVoucher(voucher.id)
          message.success('✅ Đã duyệt phiếu thành công!')
          loadManualVouchers()
        } catch (error) {
          message.error('Lỗi: ' + error.message)
        }
      }
    })
  }

  // Từ chối phiếu thủ công
  const handleRejectVoucher = async (voucher) => {
    let reasonValue = ''
    Modal.confirm({
      title: 'Từ chối phiếu',
      content: (
        <div>
          <p>Bạn có chắc muốn từ chối {voucher.loaiPhieu === 'CHI' ? 'Phiếu Chi' : 'Phiếu Thu'} này?</p>
          <p><strong>Mã phiếu:</strong> {voucher.maPhieu}</p>
          <TextArea
            rows={3}
            placeholder="Nhập lý do từ chối..."
            onChange={(e) => { reasonValue = e.target.value }}
            style={{ marginTop: 12 }}
          />
        </div>
      ),
      okText: 'Từ chối',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        if (!reasonValue.trim()) {
          message.error('Vui lòng nhập lý do từ chối!')
          return Promise.reject()
        }
        try {
          await mockAPI.rejectManualVoucher(voucher.id, reasonValue)
          message.success('❌ Đã từ chối phiếu!')
          loadManualVouchers()
        } catch (error) {
          message.error('Lỗi: ' + error.message)
        }
      }
    })
  }

  const columns = [
    {
      title: 'Mã đề xuất',
      dataIndex: 'proposalCode',
      key: 'proposalCode',
      width: 150,
      render: (text) => (
        <Tag color="blue" style={{ fontSize: 14 }}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 150
    },
    {
      title: 'Số NCC',
      dataIndex: 'supplierCount',
      key: 'supplierCount',
      width: 100,
      align: 'center',
      render: (count) => (
        <Tag color="purple">{count} NCC</Tag>
      )
    },
    {
      title: 'Số đơn hàng',
      dataIndex: 'orderCount',
      key: 'orderCount',
      width: 120,
      align: 'center',
      render: (count) => (
        <Tag color="cyan">{count} đơn</Tag>
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 180,
      align: 'right',
      render: (amount) => (
        <strong style={{ fontSize: 16, color: '#1890ff' }}>
          {amount.toLocaleString()} VND
        </strong>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        const colors = {
          PENDING: 'orange',
          APPROVED: 'green',
          REJECTED: 'red'
        }
        const labels = {
          PENDING: 'Chờ duyệt',
          APPROVED: 'Đã duyệt',
          REJECTED: 'Từ chối'
        }
        return (
          <Tag color={colors[status]}>
            {labels[status]}
          </Tag>
        )
      },
      filters: [
        { text: 'Chờ duyệt', value: 'PENDING' },
        { text: 'Đã duyệt', value: 'APPROVED' },
        { text: 'Từ chối', value: 'REJECTED' }
      ],
      onFilter: (value, record) => record.status === value
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
          icon={<EyeOutlined />}
          onClick={() => onSelectProposal(record.id)}
        >
          Xem
        </Button>
      )
    }
  ]

  const filteredProposals = proposals.filter(proposal => {
    if (!searchText) return true
    return (
      proposal.proposalCode.toLowerCase().includes(searchText.toLowerCase()) ||
      proposal.createdBy.toLowerCase().includes(searchText.toLowerCase())
    )
  })

  // Columns cho phiếu thủ công
  const voucherColumns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'maPhieu',
      key: 'maPhieu',
      width: 150,
      render: (text, record) => (
        <Tag color={record.loaiPhieu === 'CHI' ? 'blue' : 'green'} style={{ fontSize: 14 }}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'loaiPhieu',
      key: 'loaiPhieu',
      width: 100,
      render: (type) => (
        <Tag color={type === 'CHI' ? 'volcano' : 'cyan'}>
          {type === 'CHI' ? '💳 Chi' : '💵 Thu'}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Nội dung',
      dataIndex: 'noiDung',
      key: 'noiDung',
      ellipsis: true
    },
    {
      title: 'Đối tác',
      dataIndex: 'doiTac',
      key: 'doiTac',
      width: 200,
      ellipsis: true
    },
    {
      title: 'Số tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 160,
      align: 'right',
      render: (amount) => (
        <strong style={{ fontSize: 15, color: '#1890ff' }}>
          {amount?.toLocaleString()} VND
        </strong>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => {
        const colors = {
          CHO_DUYET: 'orange',
          CHO_THANH_TOAN: 'gold',
          DA_THANH_TOAN: 'green',
          KHONG_DUYET: 'red'
        }
        const labels = {
          CHO_DUYET: 'Chờ duyệt',
          CHO_THANH_TOAN: 'Chờ TT',
          DA_THANH_TOAN: 'Đã TT',
          KHONG_DUYET: 'Từ chối'
        }
        return <Tag color={colors[status]}>{labels[status]}</Tag>
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => {
        if (record.status === 'CHO_DUYET') {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApproveVoucher(record)}
              >
                Duyệt
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleRejectVoucher(record)}
              >
                Từ chối
              </Button>
            </Space>
          )
        }
        return <Tag color="default">Đã xử lý</Tag>
      }
    }
  ]

  const pendingVouchers = manualVouchers.filter(v => v.status === 'CHO_DUYET')
  const processedVouchers = manualVouchers.filter(v => v.status !== 'CHO_DUYET')

  return (
    <div style={{ padding: '24px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Card>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              Quay lại
            </Button>
            <h2 style={{ margin: 0 }}>
              ✅ Duyệt Đề xuất Thanh toán
            </h2>
          </div>
          <Button type="primary" onClick={() => { loadProposals(); loadManualVouchers(); }}>
            Làm mới
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'proposals',
              label: (
                <span>
                  📝 Đề xuất Thanh toán 
                  {proposals.filter(p => p.status === 'PENDING').length > 0 && (
                    <Tag color="orange" style={{ marginLeft: 8 }}>
                      {proposals.filter(p => p.status === 'PENDING').length}
                    </Tag>
                  )}
                </span>
              ),
              children: (
                <>
                  {/* Filters */}
                  <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
                    <Space>
                      <Tag 
                        color={statusFilter === 'PENDING' ? 'orange' : 'default'}
                        style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 14 }}
                        onClick={() => setStatusFilter('PENDING')}
                      >
                        Chờ duyệt ({proposals.filter(p => p.status === 'PENDING').length})
                      </Tag>
                      <Tag 
                        color={statusFilter === 'APPROVED' ? 'green' : 'default'}
                        style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 14 }}
                        onClick={() => setStatusFilter('APPROVED')}
                      >
                        Đã duyệt ({proposals.filter(p => p.status === 'APPROVED').length})
                      </Tag>
                      <Tag 
                        color={statusFilter === 'REJECTED' ? 'red' : 'default'}
                        style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 14 }}
                        onClick={() => setStatusFilter('REJECTED')}
                      >
                        Từ chối ({proposals.filter(p => p.status === 'REJECTED').length})
                      </Tag>
                    </Space>
                    <Input
                      placeholder="Tìm mã đề xuất hoặc người tạo..."
                      prefix={<SearchOutlined />}
                      allowClear
                      style={{ width: 300 }}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>

                  {/* Table */}
                  <Table
                    columns={columns}
                    dataSource={filteredProposals}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Tổng ${total} đề xuất`
                    }}
                    scroll={{ x: 1200 }}
                  />
                </>
              )
            },
            {
              key: 'vouchers',
              label: (
                <span>
                  📄 Đề xuất Chi khác
                  {pendingVouchers.length > 0 && (
                    <Tag color="orange" style={{ marginLeft: 8 }}>
                      {pendingVouchers.length}
                    </Tag>
                  )}
                </span>
              ),
              children: (
                <>
                  {pendingVouchers.length > 0 && (
                    <>
                      <h4 style={{ marginBottom: 16 }}>🔔 Phiếu chờ duyệt ({pendingVouchers.length})</h4>
                      <Table
                        columns={voucherColumns}
                        dataSource={pendingVouchers}
                        rowKey="id"
                        pagination={false}
                        scroll={{ x: 1000 }}
                        style={{ marginBottom: 32 }}
                      />
                    </>
                  )}

                  {processedVouchers.length > 0 && (
                    <>
                      <h4 style={{ marginBottom: 16 }}>📋 Phiếu đã xử lý ({processedVouchers.length})</h4>
                      <Table
                        columns={voucherColumns}
                        dataSource={processedVouchers}
                        rowKey="id"
                        pagination={{
                          pageSize: 10,
                          showTotal: (total) => `Tổng ${total} phiếu`
                        }}
                        scroll={{ x: 1000 }}
                      />
                    </>
                  )}

                  {manualVouchers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
                      Chưa có đề xuất chi nào
                    </div>
                  )}
                </>
              )
            }
          ]}
        />
      </Card>
    </div>
  )
}

export default ProposalApprovalList
