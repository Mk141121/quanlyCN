import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Select,
  message,
  Tag,
  Input,
  DatePicker,
  Row,
  Col,
  Divider,
  Space,
  Modal,
  Tooltip
} from 'antd'
import {
  FileAddOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  FilterOutlined,
  SendOutlined
} from '@ant-design/icons'
import { mockAPI } from '../utils/mockAPICongNo'
import dayjs from 'dayjs'
import './PaymentProposalCreator.css'

const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

const PaymentProposalCreator = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()])
  const [availableOrders, setAvailableOrders] = useState([])
  const [allOrders, setAllOrders] = useState([])
  const [selectedOrderIds, setSelectedOrderIds] = useState([])
  const [searchText, setSearchText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [proposalNote, setProposalNote] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [supplierDetails, setSupplierDetails] = useState([])

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

  useEffect(() => {
    loadSuppliers()
    loadGroups()
    loadAvailableOrders()
  }, [])

  useEffect(() => {
    loadAvailableOrders()
  }, [selectedGroup, selectedSupplier, dateRange])

  const loadSuppliers = async () => {
    try {
      const data = await mockAPI.getSuppliers()
      setSuppliers(data || [])
    } catch (error) {
      message.error('Không thể load danh sách nhà cung cấp: ' + error.message)
      setSuppliers([])
    }
  }

  const loadGroups = async () => {
    try {
      const data = await mockAPI.getSupplierGroups()
      setGroups(data || [])
    } catch (error) {
      message.error('Không thể load danh sách nhóm: ' + error.message)
      setGroups([])
    }
  }

  const loadAvailableOrders = async () => {
    setLoading(true)
    try {
      const fromDate = dateRange?.[0]?.format('YYYY-MM-DD')
      const toDate = dateRange?.[1]?.format('YYYY-MM-DD')
      
      // Sử dụng API riêng cho Payment Proposal - chỉ lấy PO đã đối chiếu
      const data = await mockAPI.getAvailablePurchaseOrdersForProposal(selectedSupplier?.id, fromDate, toDate, selectedGroup)
      
      if (!data || data.length === 0) {
        message.info('Không tìm thấy PO nào đã đối chiếu và chưa được đề xuất thanh toán')
      }
      
      setAvailableOrders(data || [])
      // Merge với allOrders để giữ lại tất cả đơn đã load
      setAllOrders(prev => {
        const newOrders = [...prev]
        if (data && Array.isArray(data)) {
          data.forEach(order => {
            if (!newOrders.find(o => o.id === order.id)) {
              newOrders.push(order)
            }
          })
        }
        return newOrders
      })
    } catch (error) {
      message.error('Không thể load đơn hàng: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'maDon',
      key: 'maDon',
      width: 120,
      render: (text) => <strong>{text}</strong>,
      ...getColumnSearchProps('maDon', 'mã đơn')
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 250,
      ellipsis: true,
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount) => (
        <span style={{ fontSize: 16, fontWeight: 500 }}>
          {amount.toLocaleString()} VND
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Trạng thái',
      dataIndex: 'poStatus',
      key: 'poStatus',
      width: 200,
      render: (status, record) => (
        <Space>
          <Tag color="green">
            Đã đối chiếu
          </Tag>
          {record.rejectedInProposal && (
            <Tooltip title={`Đơn này đã bị từ chối trong đề xuất trước (${record.rejectedProposalId || 'N/A'})`}>
              <Tag color="red">Không duyệt</Tag>
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  const rowSelection = {
    selectedRowKeys: selectedOrderIds,
    onChange: (keys) => setSelectedOrderIds(keys),
    preserveSelectedRowKeys: true
  }

  const totalSelected = (allOrders || [])
    .filter(order => selectedOrderIds.includes(order.id))
    .reduce((sum, order) => sum + order.amount, 0)

  // Nhóm các đơn đã chọn theo NCC
  const groupedBySupplier = () => {
    if (!allOrders || allOrders.length === 0) {
      return []
    }
    
    const selectedOrders = allOrders.filter(order => selectedOrderIds.includes(order.id))
    const grouped = {}
    
    selectedOrders.forEach(order => {
      const supplierId = order.supplierId
      if (!grouped[supplierId]) {
        grouped[supplierId] = {
          supplierId,
          supplierName: order.supplier,
          orders: [],
          total: 0
        }
      }
      grouped[supplierId].orders.push(order)
      grouped[supplierId].total += order.amount
    })
    
    return Object.values(grouped)
  }

  const handleCreateProposal = async () => {
    if (selectedOrderIds.length === 0) {
      message.error('Vui lòng chọn ít nhất 1 đơn hàng!')
      return
    }

    const supplierGroups = groupedBySupplier()
    
    // Tạo dữ liệu cho bảng chi tiết - load lịch sử thanh toán
    const detailsPromises = supplierGroups.map(async (group, index) => {
      const history = await mockAPI.getLastPaymentHistory(group.supplierId)
      return {
        key: group.supplierId,
        stt: index + 1,
        noiDungThanhToan: `Thanh toán ${group.orders.length} đơn hàng`,
        tenNCC: group.supplierName,
        ngayTTGanNhat: history.date,
        soTienTTGanNhat: history.amount > 0 ? history.amount.toLocaleString() + ' VND' : '-',
        soTienDeXuat: group.total,
        ghiChu: ''
      }
    })
    
    const details = await Promise.all(detailsPromises)
    setSupplierDetails(details)
    setShowDetailModal(true)
  }

  const handleSubmitProposal = async () => {
    setSubmitting(true)
    try {
      const supplierGroups = groupedBySupplier()
      
      const payload = {
        supplierGroups: supplierGroups.map((group, index) => {
          const detail = supplierDetails[index]
          return {
            supplierId: group.supplierId,
            supplierName: group.supplierName,
            poIds: group.orders.map(o => o.id),
            amount: detail.soTienDeXuat,
            noiDungThanhToan: detail.noiDungThanhToan,
            ghiChu: detail.ghiChu,
            paymentHistory: {
              date: detail.ngayTTGanNhat,
              amount: typeof detail.soTienTTGanNhat === 'string' 
                ? parseInt(detail.soTienTTGanNhat.replace(/[^0-9]/g, '')) || 0
                : detail.soTienTTGanNhat
            }
          }
        }),
        totalAmount: supplierDetails.reduce((sum, d) => sum + d.soTienDeXuat, 0),
        note: proposalNote,
        createdBy: 'Kế toán',
        status: 'PENDING'
      }

      const result = await mockAPI.createPaymentProposalWorkflow(payload)
      
      message.success(`✅ Tạo đề xuất thành công! Mã: ${result.proposalCode}`)
      
      setShowDetailModal(false)
      
      if (onSuccess) {
        onSuccess()
      } else {
        // Reset form
        setSelectedOrderIds([])
        setProposalNote('')
        setSupplierDetails([])
        loadAvailableOrders()
      }
    } catch (error) {
      message.error('Lỗi: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const supplierSummary = groupedBySupplier()

  return (
    <div style={{ padding: '24px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
    <div className="payment-proposal-creator-container">
      <Card className="payment-proposal-creator-card">
        {/* Header */}
        <div className="proposal-creator-header">
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Quay lại
          </Button>
          <h2>
            <FileAddOutlined /> 📝 Tạo Đề xuất Thanh toán NCC
          </h2>
        </div>

        {/* Filters */}
        <div className="partner-section" style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Khoảng ngày <span style={{ color: 'red' }}>*</span>
              </label>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                size="large"
              />
            </Col>

            <Col span={8}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Nhóm nhà cung cấp
              </label>
              <Select
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: '100%' }}
                placeholder="Chọn nhóm nhà cung cấp"
                onChange={(value) => {
                  setSelectedGroup(value)
                  setSelectedSupplier(null)
                }}
                value={selectedGroup}
                size="large"
              >
                {(groups || []).map(g => (
                  <Option key={g.id} value={g.id}>
                    {g.name}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col span={8}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Nhà cung cấp cụ thể
              </label>
              <Select
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: '100%' }}
                placeholder="Chọn nhà cung cấp"
                onChange={(value) => {
                  const supplier = value ? suppliers.find(s => s.id === value) : null
                  setSelectedSupplier(supplier)
                }}
                value={selectedSupplier?.id}
                size="large"
              >
                {(suppliers || [])
                  .filter(s => !selectedGroup || s.groupId === selectedGroup)
                  .map(s => (
                    <Option key={s.id} value={s.id}>
                      {s.name} {s.groupName && <Tag color="blue" style={{ marginLeft: 4 }}>{s.groupName}</Tag>}
                    </Option>
                  ))}
              </Select>
            </Col>
          </Row>

          <div style={{ marginTop: 16 }}>
            <Space>
              <Tag color="blue" icon={<FilterOutlined />}>
                {(availableOrders || []).length} đơn hàng tìm thấy
              </Tag>
              {selectedGroup && (
                <Tag color="purple">
                  Nhóm: {groups.find(g => g.id === selectedGroup)?.name}
                </Tag>
              )}
              {selectedSupplier && (
                <Tag color="cyan">
                  {selectedSupplier.name}
                </Tag>
              )}
              {dateRange && dateRange[0] && dateRange[1] && (
                <Tag color="orange">
                  {dateRange[0].format('DD/MM/YYYY')} - {dateRange[1].format('DD/MM/YYYY')}
                </Tag>
              )}
            </Space>
          </div>
        </div>

        {/* Summary of selected by supplier */}
        {supplierSummary.length > 0 && (
          <div style={{ background: '#e6f7ff', padding: 16, borderRadius: 8, marginBottom: 24 }}>
            <h3 style={{ marginTop: 0 }}>📋 Tóm tắt đề xuất ({supplierSummary.length} NCC)</h3>
            <Row gutter={[16, 16]}>
              {supplierSummary.map(group => (
                <Col key={group.supplierId} span={8}>
                  <Card size="small" style={{ background: 'white' }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{group.supplierName}</div>
                    <div style={{ color: '#666' }}>{group.orders.length} đơn hàng</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1890ff', marginTop: 8 }}>
                      {group.total.toLocaleString()} VND
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 16 }}>
                  Tổng cộng: {selectedOrderIds.length} đơn - {totalSelected.toLocaleString()} VND
                </strong>
              </div>
              <Button
                type="primary"
                icon={<SendOutlined />}
                size="large"
                onClick={handleCreateProposal}
                loading={submitting}
              >
                Tạo Đề xuất
              </Button>
            </div>
          </div>
        )}

        {/* Orders table */}
        {(availableOrders || []).length > 0 && (
          <>
            <div style={{ margin: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                Danh sách PO - Sẵn sàng tạo đề xuất
              </Tag>
              <Input
                placeholder="Tìm nhà cung cấp..."
                prefix={<SearchOutlined />}
                allowClear
                style={{ width: 300 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="large"
              />
            </div>

            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={availableOrders.filter(order => {
                if (!searchText) return true
                const supplierName = order.supplier || ''
                return supplierName.toLowerCase().includes(searchText.toLowerCase())
              })}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`,
                position: ['bottomCenter']
              }}
              locale={{ emptyText: 'Không có đơn hàng nào' }}
            />
          </>
        )}
      </Card>
    </div>

    {/* Modal chi tiết đề xuất thanh toán */}
    <Modal
      title="✏️ Tạo Đề xuất Thanh toán NCC"
      open={showDetailModal}
      onCancel={() => setShowDetailModal(false)}
      width={1200}
      footer={[
        <Button key="cancel" onClick={() => setShowDetailModal(false)}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleSubmitProposal}
          icon={<SendOutlined />}
        >
          Tạo Đề xuất
        </Button>
      ]}
    >
      <Table
        dataSource={supplierDetails}
        pagination={false}
        size="small"
        bordered
        columns={[
          {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            width: 60,
            align: 'center'
          },
          {
            title: 'Nội dung thanh toán',
            dataIndex: 'noiDungThanhToan',
            key: 'noiDungThanhToan',
            width: 250,
            render: (text, record, index) => (
              <Input
                value={text}
                onChange={(e) => {
                  const newDetails = [...supplierDetails]
                  newDetails[index].noiDungThanhToan = e.target.value
                  setSupplierDetails(newDetails)
                }}
                placeholder="Nhập nội dung thanh toán"
              />
            )
          },
          {
            title: 'Tên NCC',
            dataIndex: 'tenNCC',
            key: 'tenNCC',
            width: 200
          },
          {
            title: 'Ngày TT gần nhất',
            dataIndex: 'ngayTTGanNhat',
            key: 'ngayTTGanNhat',
            width: 120,
            align: 'center'
          },
          {
            title: 'Số tiền TT gần nhất',
            dataIndex: 'soTienTTGanNhat',
            key: 'soTienTTGanNhat',
            width: 150,
            align: 'right'
          },
          {
            title: 'Số tiền đề xuất',
            dataIndex: 'soTienDeXuat',
            key: 'soTienDeXuat',
            width: 150,
            align: 'right',
            render: (amount) => <strong style={{ color: '#1890ff' }}>{amount.toLocaleString()} VND</strong>
          },
          {
            title: 'Ghi chú',
            dataIndex: 'ghiChu',
            key: 'ghiChu',
            render: (text, record, index) => (
              <TextArea
                value={text}
                onChange={(e) => {
                  const newDetails = [...supplierDetails]
                  newDetails[index].ghiChu = e.target.value
                  setSupplierDetails(newDetails)
                }}
                placeholder="Ghi chú..."
                rows={1}
                autoSize={{ minRows: 1, maxRows: 3 }}
              />
            )
          }
        ]}
        summary={(pageData) => {
          const total = pageData.reduce((sum, record) => sum + record.soTienDeXuat, 0)
          return (
            <Table.Summary fixed>
              <Table.Summary.Row style={{ background: '#fffbe6' }}>
                <Table.Summary.Cell index={0} colSpan={5} align="right">
                  <strong>Tổng cộng:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong style={{ fontSize: 16, color: '#1890ff' }}>
                    {total.toLocaleString()} VND
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <strong>{pageData.length} NCC</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )
        }}
      />
    </Modal>
    </div>
  )
}

export default PaymentProposalCreator
