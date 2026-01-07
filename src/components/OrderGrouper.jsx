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
  Radio
} from 'antd'
import {
  PlusOutlined,
  FileAddOutlined,
  ArrowLeftOutlined,
  CheckOutlined
} from '@ant-design/icons'
import { mockAPI } from '../utils/mockAPICongNo'
import './OrderGrouper.css'

const { Option } = Select

const OrderGrouper = ({ type = 'AP', onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [partners, setPartners] = useState([])
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [availableOrders, setAvailableOrders] = useState([])
  const [selectedOrderIds, setSelectedOrderIds] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadPartners()
  }, [type])

  useEffect(() => {
    if (selectedPartner) {
      loadAvailableOrders()
    }
  }, [selectedPartner, type])

  const loadPartners = async () => {
    setLoading(true)
    try {
      const data = type === 'AP' 
        ? await mockAPI.getSuppliers() 
        : await mockAPI.getCustomers()
      setPartners(data)
      setSelectedPartner(null)
      setAvailableOrders([])
      setSelectedOrderIds([])
    } catch (error) {
      message.error('Không thể load danh sách: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableOrders = async () => {
    setLoading(true)
    try {
      const data = type === 'AP'
        ? await mockAPI.getAvailablePurchaseOrders(selectedPartner.id)
        : await mockAPI.getAvailableSalesOrders(selectedPartner.id)
      
      if (data.length === 0) {
        message.warning(`Không có ${type === 'AP' ? 'PO' : 'SO'} nào ở trạng thái ĐÃ ĐỐI CHIẾU`)
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
      width: 150,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 180,
      align: 'right',
      render: (amount) => (
        <span style={{ fontSize: 16, fontWeight: 500 }}>
          {amount.toLocaleString()} VND
        </span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => (
        <Tag color="blue">{status}</Tag>
      )
    }
  ]

  const rowSelection = {
    selectedRowKeys: selectedOrderIds,
    onChange: (keys) => setSelectedOrderIds(keys)
  }

  const totalSelected = availableOrders
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
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
            Chọn {type === 'AP' ? 'Nhà cung cấp' : 'Khách hàng'}:
          </label>
          <Select
            style={{ width: '100%', maxWidth: 500 }}
            placeholder={`Chọn ${type === 'AP' ? 'nhà cung cấp' : 'khách hàng'}`}
            onChange={(value) => {
              const partner = partners.find(p => p.id === value)
              setSelectedPartner(partner)
            }}
            value={selectedPartner?.id}
            size="large"
          >
            {partners.map(p => (
              <Option key={p.id} value={p.id}>{p.name}</Option>
            ))}
          </Select>
        </div>

        {/* Orders table */}
        {selectedPartner && (
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
                    <Table.Summary.Cell index={0}>
                      <strong>Đã chọn: {selectedOrderIds.length} đơn</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Statistic
                        value={totalSelected}
                        suffix="VND"
                        valueStyle={{ fontSize: 18, color: '#1890ff', fontWeight: 600 }}
                        formatter={(value) => value.toLocaleString()}
                      />
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} />
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
            <li>Chỉ hiển thị đơn hàng ở trạng thái <strong>ĐÃ ĐỐI CHIẾU</strong></li>
            <li>Chọn nhiều đơn hàng của cùng 1 {type === 'AP' ? 'nhà cung cấp' : 'khách hàng'}</li>
            <li>Tổng tiền sẽ được tự động tính và khóa</li>
            <li>Sau khi tạo, các đơn hàng sẽ bị <strong>KHÓA</strong> không cho sửa/xóa</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

export default OrderGrouper
