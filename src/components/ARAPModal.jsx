import React, { useState, useEffect } from 'react'
import { Modal, Table, Tag, Space, Statistic, message, Spin } from 'antd'
import { FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { mockAPI } from '../utils/mockAPI'
import dayjs from 'dayjs'
import './ARAPModal.css'

const ARAPModal = ({ visible, onClose, partner, type, selectedDocuments, onSelect }) => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  useEffect(() => {
    if (visible && partner) {
      loadDocuments()
    }
  }, [visible, partner, type])

  useEffect(() => {
    if (selectedDocuments) {
      setSelectedRowKeys(selectedDocuments.map(d => d.id))
    }
  }, [selectedDocuments])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      // Load AR (CHỜ_THU) hoặc AP (CHỜ_CHI) documents
      const status = type === 'AR' ? 'CHO_THU' : 'CHO_CHI'
      const docs = await mockAPI.getARAPDocuments(partner.id, status)
      setDocuments(docs)
    } catch (error) {
      message.error('Không thể tải danh sách chứng từ: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Mã chứng từ',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Loại',
      dataIndex: 'documentType',
      key: 'documentType',
      width: 120,
      render: (text) => {
        const typeMap = {
          'INVOICE': { label: 'Hóa đơn', color: 'blue' },
          'ORDER': { label: 'Đơn hàng', color: 'cyan' },
          'CONTRACT': { label: 'Hợp đồng', color: 'purple' }
        }
        const type = typeMap[text] || { label: text, color: 'default' }
        return <Tag color={type.color}>{type.label}</Tag>
      }
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      render: (amount) => (
        <span style={{ fontWeight: 500 }}>
          {amount.toLocaleString()} VND
        </span>
      )
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 140,
      align: 'right',
      render: (amount) => (
        <span style={{ color: '#52c41a' }}>
          {amount.toLocaleString()} VND
        </span>
      )
    },
    {
      title: 'Còn lại',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 140,
      align: 'right',
      render: (amount) => (
        <span style={{ color: '#ff4d4f', fontWeight: 600 }}>
          {amount.toLocaleString()} VND
        </span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusMap = {
          'CHO_THU': { label: 'Chờ thu', color: 'orange' },
          'CHO_CHI': { label: 'Chờ chi', color: 'orange' },
          'DA_THANH_TOAN': { label: 'Đã thanh toán', color: 'green' },
          'QUA_HAN': { label: 'Quá hạn', color: 'red' }
        }
        const s = statusMap[status] || { label: status, color: 'default' }
        return <Tag color={s.color}>{s.label}</Tag>
      }
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys)
      onSelect(rows)
    },
    getCheckboxProps: (record) => ({
      disabled: record.status === 'DA_THANH_TOAN'
    })
  }

  const totalRemaining = documents
    .filter(d => selectedRowKeys.includes(d.id))
    .reduce((sum, d) => sum + d.remainingAmount, 0)

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          <span>Chọn chứng từ {type === 'AR' ? 'công nợ phải thu (AR)' : 'công nợ phải chi (AP)'}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      onOk={() => {
        message.success(`Đã chọn ${selectedRowKeys.length} chứng từ`)
        onClose()
      }}
      width={1200}
      okText="Xác nhận"
      cancelText="Đóng"
      okButtonProps={{
        icon: <CheckCircleOutlined />,
        disabled: selectedRowKeys.length === 0
      }}
    >
      {/* Summary Statistics */}
      {partner && (
        <div className="arap-summary">
          <Statistic
            title="Đối tượng"
            value={partner.name}
            valueStyle={{ fontSize: 16, color: '#1890ff' }}
          />
          <Statistic
            title="Số chứng từ chờ xử lý"
            value={documents.length}
            suffix="chứng từ"
            valueStyle={{ fontSize: 16 }}
          />
          <Statistic
            title="Đã chọn"
            value={selectedRowKeys.length}
            suffix={`/ ${documents.length}`}
            valueStyle={{ fontSize: 16, color: '#52c41a' }}
          />
          <Statistic
            title="Tổng còn lại"
            value={totalRemaining}
            suffix="VND"
            valueStyle={{ fontSize: 16, color: '#ff4d4f' }}
            formatter={(value) => value.toLocaleString()}
          />
        </div>
      )}

      {/* Documents Table */}
      <Spin spinning={loading}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={documents}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} chứng từ`
          }}
          scroll={{ x: 1000 }}
          size="small"
          className="arap-table"
        />
      </Spin>
    </Modal>
  )
}

export default ARAPModal
