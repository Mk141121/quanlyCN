import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  message,
  Descriptions,
  Divider,
  Modal,
  Input,
  Space,
  Row,
  Col,
  Statistic
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  DownOutlined,
  UpOutlined,
  PrinterOutlined
} from '@ant-design/icons'
import { mockAPI } from '../utils/mockAPICongNo'
import dayjs from 'dayjs'
import PrintButton from './print/PrintButton'
import { getCompanyConfig } from '../utils/printUtils'
import './ProposalApprovalDetail.css'

const { TextArea } = Input

const ProposalApprovalDetail = ({ proposalId, onBack, onSuccess, viewOnly = false }) => {
  const [loading, setLoading] = useState(false)
  const [proposal, setProposal] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [selectedSuppliers, setSelectedSuppliers] = useState([])

  useEffect(() => {
    loadProposalDetail()
  }, [proposalId])

  const loadProposalDetail = async () => {
    setLoading(true)
    try {
      const data = await mockAPI.getPaymentProposalDetail(proposalId)
      setProposal(data)
    } catch (error) {
      message.error('Không thể load chi tiết đề xuất: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = () => {
    const suppliersToApprove = selectedSuppliers.length > 0 
      ? proposal.supplierGroups.filter(g => selectedSuppliers.includes(g.supplierId))
      : proposal.supplierGroups
    
    if (suppliersToApprove.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 NCC để duyệt!')
      return
    }

    const isPartialApproval = suppliersToApprove.length < proposal.supplierGroups.length
    
    Modal.confirm({
      title: isPartialApproval ? 'Xác nhận Duyệt một phần' : 'Xác nhận Duyệt đề xuất',
      content: (
        <div>
          <p>Sau khi duyệt, hệ thống sẽ tự động tạo <strong>{suppliersToApprove.length} Phiếu Chi</strong> riêng biệt cho từng NCC.</p>
          <ul>
            {suppliersToApprove.map(group => (
              <li key={group.supplierId}>
                <strong>{group.supplierName}</strong>: {group.orders?.length || 0} đơn - {group.amount?.toLocaleString() || 0} VND
              </li>
            ))}
          </ul>
          {isPartialApproval && (
            <p style={{ color: '#1890ff', marginTop: 16 }}>
              ℹ️ Đây là duyệt một phần. Các NCC không được chọn sẽ vẫn ở trạng thái chờ duyệt.
            </p>
          )}
          <p style={{ color: '#ff4d4f', marginTop: 16 }}>
            ⚠️ Thao tác này không thể hoàn tác!
          </p>
        </div>
      ),
      okText: 'Xác nhận Duyệt',
      cancelText: 'Hủy',
      okType: 'primary',
      width: 600,
      onOk: async () => {
        setSubmitting(true)
        try {
          const result = await mockAPI.approvePaymentProposal(proposalId, selectedSuppliers)
          message.success(`✅ Duyệt thành công! Đã tạo ${result.createdVouchers?.length || 0} Phiếu Chi`)
          
          if (onSuccess) {
            onSuccess()
          } else {
            onBack()
          }
        } catch (error) {
          message.error('Lỗi: ' + error.message)
        } finally {
          setSubmitting(false)
        }
      }
    })
  }

  const handleReject = () => {
    Modal.confirm({
      title: 'Từ chối Đề xuất',
      content: (
        <div>
          <p>Vui lòng nhập lý do từ chối:</p>
          <TextArea
            rows={4}
            placeholder="Nhập lý do từ chối đề xuất..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            style={{ marginTop: 8 }}
          />
        </div>
      ),
      okText: 'Xác nhận Từ chối',
      cancelText: 'Hủy',
      okType: 'danger',
      width: 600,
      onOk: async () => {
        if (!rejectReason.trim()) {
          message.error('Vui lòng nhập lý do từ chối!')
          return Promise.reject()
        }

        setSubmitting(true)
        try {
          await mockAPI.rejectPaymentProposal(proposalId, rejectReason)
          message.success('✅ Đã từ chối đề xuất')
          
          if (onSuccess) {
            onSuccess()
          } else {
            onBack()
          }
        } catch (error) {
          message.error('Lỗi: ' + error.message)
        } finally {
          setSubmitting(false)
        }
      }
    })
  }

  if (loading || !proposal) {
    return <Card loading={loading}>Đang tải...</Card>
  }

  const isPending = proposal.status === 'PENDING'
  const isApproved = proposal.status === 'APPROVED'
  const isRejected = proposal.status === 'REJECTED'

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
              <FileTextOutlined /> Chi tiết Đề xuất Thanh toán
            </h2>
          </div>
          
          {/* Nút In luôn hiện, nút Duyệt/Từ chối chỉ hiện khi không phải viewOnly và đang PENDING */}
          <Space>
            <PrintButton
              templateId="DE_XUAT_THANH_TOAN"
              templateName="Đề xuất Thanh toán"
              data={{
                proposalCode: proposal.maDeXuat || proposal.proposalCode || proposal.id,
                createdAt: proposal.createdDate || proposal.createdAt,
                createdBy: proposal.createdBy || 'Kế toán',
                supplierGroups: (proposal.supplierGroups || []).map(g => ({
                  supplierCode: g.supplierCode || '',
                  supplierName: g.supplierName,
                  noiDungThanhToan: g.noiDungThanhToan || `Thanh toán ${(g.orders || g.poIds || []).length} đơn hàng`,
                  lastPaymentDate: g.lastPaymentDate || g.paymentHistory?.date || null,
                  lastPaymentAmount: g.lastPaymentAmount || g.paymentHistory?.amount || 0,
                  paymentAmount: g.amount || g.paymentAmount || 0,
                  ghiChu: g.ghiChu || '',
                  orders: (g.orders || g.poIds || []).map(o => typeof o === 'string' ? { orderCode: o } : o)
                })),
                totalPayment: proposal.totalAmount,
                ghiChu: proposal.note
              }}
              config={getCompanyConfig()}
              buttonText="In đề xuất"
              buttonType="default"
              buttonSize="large"
            />
            {/* Chỉ hiện nút Duyệt/Từ chối khi KHÔNG phải viewOnly và đang PENDING */}
            {!viewOnly && isPending && (
              <>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  size="large"
                  onClick={handleReject}
                  loading={submitting}
                >
                  Từ chối
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="large"
                  onClick={handleApprove}
                  loading={submitting}
                >
                  Duyệt {selectedSuppliers.length > 0 ? `(${selectedSuppliers.length}/${proposal?.supplierGroups?.length || 0})` : ''}
                </Button>
              </>
            )}
          </Space>
        </div>

        {/* Proposal Info */}
        <Descriptions
          bordered
          column={2}
          styles={{ label: { fontWeight: 600 } }}
          style={{ marginBottom: 24 }}
        >
          <Descriptions.Item label="Mã đề xuất">
            <Tag color="blue" style={{ fontSize: 14 }}>
              {proposal.proposalCode}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag 
              color={isApproved ? 'green' : isRejected ? 'red' : 'orange'}
              style={{ fontSize: 14 }}
            >
              {isApproved ? 'Đã duyệt' : isRejected ? 'Từ chối' : 'Chờ duyệt'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            {proposal.createdBy}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {dayjs(proposal.createdAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          {isApproved && (
            <>
              <Descriptions.Item label="Người duyệt">
                {proposal.approvedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày duyệt">
                {dayjs(proposal.approvedAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </>
          )}
          {isRejected && (
            <>
              <Descriptions.Item label="Người từ chối">
                {proposal.rejectedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày từ chối">
                {dayjs(proposal.rejectedAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Lý do từ chối" span={2}>
                <div style={{ color: '#ff4d4f', fontStyle: 'italic' }}>
                  {proposal.rejectReason}
                </div>
              </Descriptions.Item>
            </>
          )}
          <Descriptions.Item label="Ghi chú" span={2}>
            {proposal.note || '-'}
          </Descriptions.Item>
        </Descriptions>

        {/* Summary Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Số nhà cung cấp"
                value={proposal.supplierGroups?.length || 0}
                suffix="NCC"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Tổng số đơn hàng"
                value={proposal.supplierGroups?.reduce((sum, g) => sum + (g.orders?.length || 0), 0) || 0}
                suffix="đơn"
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Tổng tiền đề xuất"
                value={proposal.totalAmount}
                suffix="VND"
                valueStyle={{ color: '#1890ff', fontSize: 20 }}
                formatter={(value) => value.toLocaleString()}
              />
            </Card>
          </Col>
        </Row>

        <Divider>Chi tiết theo Nhà cung cấp</Divider>

        {/* Detail by Supplier - Expandable Table */}
        <Table
          dataSource={proposal.supplierGroups?.map((group, index) => {
            // Extract payment history from group if available
            const paymentHistory = group.paymentHistory || { date: '-', amount: 0 }
            return {
              key: group.supplierId,
              stt: index + 1,
              noiDungThanhToan: group.noiDungThanhToan || `Thanh toán ${group.orders?.length || 0} đơn hàng`,
              supplierName: group.supplierName,
              ngayTTGanNhat: paymentHistory.date,
              soTienTTGanNhat: paymentHistory.amount > 0 ? paymentHistory.amount.toLocaleString() + ' VND' : '-',
              orderCount: group.orders?.length || 0,
              amount: group.amount || 0,
              ghiChu: group.ghiChu || '',
              orders: group.orders || []
            }
          })}
          rowSelection={(!viewOnly && isPending) ? {
            selectedRowKeys: selectedSuppliers,
            onChange: (keys) => setSelectedSuppliers(keys),
            columnWidth: 50
          } : null}
          pagination={false}
          rowKey="key"
          expandable={{
            expandedRowRender: (record) => {
              const isSupplierSelected = selectedSuppliers.length === 0 || selectedSuppliers.includes(record.key)
              const showNotApprovedStatus = isPending && selectedSuppliers.length > 0 && !isSupplierSelected
              
              return (
                <Table
                  dataSource={record.orders}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  style={{ margin: '8px 0' }}
                  columns={[
                    {
                      title: 'Mã đơn',
                      dataIndex: 'maDon',
                      key: 'maDon',
                      width: 150,
                      render: (text) => <strong>{text}</strong>
                    },
                    {
                      title: 'Ngày tạo',
                      dataIndex: 'createdDate',
                      key: 'createdDate',
                      width: 150,
                      render: (date) => dayjs(date).format('DD/MM/YYYY')
                    },
                    {
                      title: 'Số tiền',
                      dataIndex: 'amount',
                      key: 'amount',
                      align: 'right',
                      render: (amount) => (
                        <span style={{ fontSize: 14, fontWeight: 500 }}>
                          {amount?.toLocaleString() || 0} VND
                        </span>
                      )
                    },
                    {
                      title: 'Trạng thái',
                      key: 'status',
                      width: 200,
                      render: () => (
                        <Space>
                          <Tag color="green">Đã đối chiếu</Tag>
                          {showNotApprovedStatus && (
                            <Tag color="red">Không duyệt</Tag>
                          )}
                        </Space>
                      )
                    }
                  ]}
                />
              )
            },
            expandIcon: ({ expanded, onExpand, record }) => (
              <Button
                size="small"
                type="text"
                icon={expanded ? <UpOutlined /> : <DownOutlined />}
                onClick={(e) => onExpand(record, e)}
              />
            )
          }}
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
              width: 250
            },
            {
              title: 'Tên NCC',
              dataIndex: 'supplierName',
              key: 'supplierName',
              width: 200,
              render: (text, record) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{text}</div>
                  <div style={{ color: '#666', fontSize: 12 }}>
                    {record.orderCount} đơn hàng
                  </div>
                </div>
              )
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
              dataIndex: 'amount',
              key: 'amount',
              align: 'right',
              width: 150,
              render: (amount) => (
                <strong style={{ fontSize: 16, fontWeight: 700, color: '#1890ff' }}>
                  {amount?.toLocaleString() || 0} VND
                </strong>
              )
            },
            {
              title: 'Ghi chú',
              dataIndex: 'ghiChu',
              key: 'ghiChu',
              width: 200,
              ellipsis: true
            },
            {
              title: '',
              key: 'action',
              width: 100
            }
          ]}
          summary={(pageData) => {
            // Calculate total amount based on selected suppliers
            const selectedData = selectedSuppliers.length > 0
              ? pageData.filter(record => selectedSuppliers.includes(record.key))
              : pageData
            
            const totalAmount = selectedData.reduce((sum, record) => sum + (record.amount || 0), 0)
            const totalOrders = selectedData.reduce((sum, record) => sum + (record.orderCount || 0), 0)
            
            const displayText = selectedSuppliers.length > 0
              ? `Đã chọn: ${selectedSuppliers.length}/${proposal.supplierGroups?.length || 0} NCC - ${totalOrders} đơn`
              : `Tổng cộng: ${proposal.supplierGroups?.length || 0} NCC - ${proposal.orderCount || 0} đơn`
            
            return (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ background: '#fffbe6' }}>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <strong style={{ fontSize: 16 }}>
                      {displayText}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong style={{ fontSize: 18, color: '#1890ff' }}>
                      {totalAmount.toLocaleString()} VND
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={2} />
                </Table.Summary.Row>
              </Table.Summary>
            )
          }}
        />
      </Card>
    </div>
  )
}

export default ProposalApprovalDetail
