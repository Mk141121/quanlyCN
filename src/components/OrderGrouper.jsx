import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Select,
  message,
  Statistic,
  Space,
  Tag,
  Radio,
  Input,
  DatePicker,
  Row,
  Col
} from 'antd'
import {
  PlusOutlined,
  FileAddOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons'
import { mockAPI } from '../utils/mockAPICongNo'
import dayjs from 'dayjs'
import './OrderGrouper.css'

const { Option } = Select
const { RangePicker } = DatePicker

const OrderGrouper = ({ type = 'AP', onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [partners, setPartners] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()])
  const [availableOrders, setAvailableOrders] = useState([])
  const [selectedOrderIds, setSelectedOrderIds] = useState([])
  const [submitting, setSubmitting] = useState(false)

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

  useEffect(() => {
    loadPartners()
    loadGroups()
  }, [type])

  useEffect(() => {
    loadAvailableOrders()
  }, [selectedPartner, selectedGroup, dateRange, type])

  const loadPartners = async () => {
    setLoading(true)
    try {
      const data = type === 'AP' 
        ? await mockAPI.getSuppliers() 
        : await mockAPI.getCustomers()
      setPartners(data)
    } catch (error) {
      message.error('Không thể load danh sách: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async () => {
    try {
      const data = type === 'AP'
        ? await mockAPI.getSupplierGroups()
        : await mockAPI.getCustomerGroups()
      setGroups(data)
    } catch (error) {
      message.error('Không thể load danh sách nhóm: ' + error.message)
    }
  }

  const loadAvailableOrders = async () => {
    // Chỉ load khi có ít nhất 1 filter được chọn
    if (!selectedPartner && !selectedGroup && !dateRange) {
      setAvailableOrders([])
      return
    }

    setLoading(true)
    try {
      const fromDate = dateRange?.[0]?.format('YYYY-MM-DD')
      const toDate = dateRange?.[1]?.format('YYYY-MM-DD')
      
      const data = type === 'AP'
        ? await mockAPI.getAvailablePurchaseOrders(selectedPartner?.id, fromDate, toDate, selectedGroup)
        : await mockAPI.getAvailableSalesOrders(selectedPartner?.id, fromDate, toDate, selectedGroup)
      
      if (data.length === 0) {
        message.info(`Không tìm thấy ${type === 'AP' ? 'PO' : 'SO'} nào phù hợp với điều kiện lọc`)
      }
      
      setAvailableOrders(data)
      setSelectedOrderIds([])
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
      title: type === 'AP' ? 'Nhà cung cấp' : 'Khách hàng',
      dataIndex: type === 'AP' ? 'supplier' : 'customer',
      key: 'partner',
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
      ...getNumberRangeFilterProps('amount', 'Số tiền'),
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => (
        <Tag color="blue">{status}</Tag>
      ),
      filters: [
        { text: 'DA_DOI_CHIEU', value: 'DA_DOI_CHIEU' },
        { text: 'CHO_THANH_TOAN', value: 'CHO_THANH_TOAN' },
        { text: 'ACTIVE', value: 'ACTIVE' },
      ],
      onFilter: (value, record) => record.status === value
    }
  ]

  const rowSelection = {
    selectedRowKeys: selectedOrderIds,
    onChange: (keys) => setSelectedOrderIds(keys)
  }

  const totalSelected = (availableOrders || [])
    .filter(order => selectedOrderIds.includes(order.id))
    .reduce((sum, order) => sum + order.amount, 0)

  const handleCreate = async () => {
    if (selectedOrderIds.length === 0) {
      message.error('Vui lòng chọn ít nhất 1 đơn hàng!')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        [type === 'AP' ? 'supplierId' : 'customerId']: selectedPartner.id,
        [type === 'AP' ? 'supplier' : 'customer']: selectedPartner.name,
        [type === 'AP' ? 'poIds' : 'soIds']: selectedOrderIds,
        totalAmount: totalSelected
      }

      let result
      if (type === 'AP') {
        result = await mockAPI.createPaymentProposal(payload)
        message.success(`✅ Tạo Payment Proposal thành công! Mã: ${result.maDeXuat}`)
      } else {
        result = await mockAPI.createARDocument(payload)
        message.success(`✅ Tạo AR Document thành công! Mã: ${result.maChungTu}`)
      }

      // Reload data để tiếp tục tạo
      await loadAvailableOrders()
      setSelectedOrderIds([])
      
      // KHÔNG gọi onSuccess - ở lại màn hình này để tiếp tục tạo
    } catch (error) {
      message.error('Lỗi: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '24px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
    <div className="order-grouper-container">
      <Card className="order-grouper-card">
        {/* Header */}
        <div className="grouper-header">
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Quay lại
          </Button>
          <h2>
            <FileAddOutlined /> 
            {type === 'AP' ? ' 🛒 Công nợ NCC (PO → Payment Proposal)' : ' 💼 Công nợ khách hàng (SO → AR Document)'}
          </h2>
        </div>

        {/* Partner selector */}
        <div className="partner-section">
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
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </Col>

            <Col span={8}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Nhóm {type === 'AP' ? 'nhà cung cấp' : 'khách hàng'}
              </label>
              <Select
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: '100%' }}
                placeholder={`Chọn nhóm ${type === 'AP' ? 'nhà cung cấp' : 'khách hàng'}`}
                onChange={(value) => {
                  setSelectedGroup(value)
                  setSelectedPartner(null)
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
                {type === 'AP' ? 'Nhà cung cấp' : 'Khách hàng'} cụ thể
              </label>
              <Select
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: '100%' }}
                placeholder={`Chọn ${type === 'AP' ? 'nhà cung cấp' : 'khách hàng'}`}
                onChange={(value) => {
                  const partner = value ? partners.find(p => p.id === value) : null
                  setSelectedPartner(partner)
                }}
                value={selectedPartner?.id}
                size="large"
              >
                {(partners || [])
                  .filter(p => !selectedGroup || p.groupId === selectedGroup)
                  .map(p => (
                    <Option key={p.id} value={p.id}>
                      {p.name} {p.groupName && <Tag color="blue" style={{ marginLeft: 4 }}>{p.groupName}</Tag>}
                    </Option>
                  ))}
              </Select>
            </Col>
          </Row>

          <div style={{ marginTop: 16 }}>
            <Space>
              <Tag color="blue" icon={<FilterOutlined />}>
                {availableOrders.length} đơn hàng tìm thấy
              </Tag>
              {selectedGroup && (
                <Tag color="purple">
                  Nhóm: {groups.find(g => g.id === selectedGroup)?.name}
                </Tag>
              )}
              {selectedPartner && (
                <Tag color="cyan">
                  {selectedPartner.name}
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

        {/* Orders table */}
        {availableOrders.length > 0 && (
          <>
            <div style={{ margin: '24px 0' }}>
              <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                Danh sách {type === 'AP' ? 'PO' : 'SO'} đã đối chiếu - Sẵn sàng gom
              </Tag>
            </div>

            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={availableOrders}
              rowKey="id"
              loading={loading}
              pagination={false}
              locale={{ emptyText: 'Không có đơn hàng nào' }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <strong style={{ whiteSpace: 'nowrap' }}>Đã chọn: {selectedOrderIds.length} đơn</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right">
                      <strong style={{ fontSize: 18, color: '#1890ff', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {totalSelected.toLocaleString()} VND
                      </strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} />
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />

            {/* Action */}
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Button
                type="primary"
                size="large"
                icon={<CheckOutlined />}
                onClick={handleCreate}
                loading={submitting}
                disabled={selectedOrderIds.length === 0}
                style={{ 
                  background: '#52c41a',
                  borderColor: '#52c41a',
                  minWidth: 200
                }}
              >
                ✅ Tạo {type === 'AP' ? 'Payment Proposal' : 'AR Document'}
              </Button>
            </div>
          </>
        )}

        {/* Info box */}
        <div className="info-box">
          <h4>ℹ️ Lưu ý:</h4>
          <ul>
            <li>Chọn <strong>Khoảng ngày</strong> để lọc đơn hàng theo thời gian</li>
            <li>Chọn <strong>Nhóm</strong> để xem tất cả đơn hàng của các {type === 'AP' ? 'nhà cung cấp' : 'khách hàng'} trong nhóm</li>
            <li>Hoặc chọn <strong>{type === 'AP' ? 'Nhà cung cấp' : 'Khách hàng'} cụ thể</strong> để xem đơn hàng của một đối tác</li>
            <li>Chỉ hiển thị đơn hàng ở trạng thái <strong>ĐÃ ĐỐI CHIẾU</strong></li>
            <li>Tổng tiền sẽ được tự động tính và khóa</li>
            <li>Sau khi tạo, các đơn hàng sẽ bị <strong>KHÓA</strong> không cho sửa/xóa</li>
          </ul>
        </div>
      </Card>
    </div>
    </div>
  )
}

export default OrderGrouper
