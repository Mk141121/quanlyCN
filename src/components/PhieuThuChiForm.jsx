import React, { useState, useEffect } from 'react'
import {
  Card,
  Descriptions,
  Table,
  Radio,
  Upload,
  Button,
  message,
  Statistic,
  Row,
  Col,
  Tag,
  Space,
  Image,
  InputNumber,
  Progress
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  DollarOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { mockAPI } from '../utils/mockAPICongNo'
import './PhieuThuChiForm.css'

// Màu sắc theo SPEC
const STATUS_COLORS = {
  CHO_THANH_TOAN: 'gold',     // Vàng
  CHO_THU_TIEN: 'gold',       // Vàng
  DA_THANH_TOAN: 'green'      // Xanh
}

const STATUS_LABELS = {
  CHO_THANH_TOAN: 'Chờ thanh toán',
  CHO_THU_TIEN: 'Chờ thu tiền',
  DA_THANH_TOAN: 'Đã thanh toán'
}

const PhieuThuChiForm = ({ refId, refType, onBack, onSuccess }) => {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [documentData, setDocumentData] = useState(null)
  const [phuongThuc, setPhuongThuc] = useState('TIEN_MAT')
  const [billImage, setBillImage] = useState(null)
  const [soTienThanhToan, setSoTienThanhToan] = useState(0)  // Số tiền thanh toán lần này

  const loaiPhieu = refType === 'PaymentProposal' ? 'CHI' : 'THU'

  useEffect(() => {
    loadDocumentData()
  }, [refId, refType])

  const loadDocumentData = async () => {
    setLoading(true)
    try {
      let data
      if (refType === 'PaymentProposal') {
        data = await mockAPI.getPaymentProposalById(refId)
      } else {
        data = await mockAPI.getARDocumentById(refId)
      }
      setDocumentData(data)
      // Auto-fill số tiền còn nợ
      const remaining = data.totalAmount - (data.paidAmount || 0)
      setSoTienThanhToan(remaining)
    } catch (error) {
      message.error('Không thể load dữ liệu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Columns cho bảng PO/SO items
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
      width: 200,
      align: 'right',
      render: (amount) => (
        <span style={{ fontSize: 16, fontWeight: 500 }}>
          {amount.toLocaleString()} VND
        </span>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, record) => {
        const status = record.poStatus || record.soStatus
        return (
          <Tag color={STATUS_COLORS[status]}>
            {STATUS_LABELS[status]}
          </Tag>
        )
      }
    }
  ]

  // Upload config
  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('Chỉ chấp nhận file ảnh!')
        return false
      }
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error('File phải nhỏ hơn 10MB!')
        return false
      }
      
      // Convert to base64 for preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setBillImage(e.target.result)
      }
      reader.readAsDataURL(file)
      
      return false // Prevent auto upload
    },
    onRemove: () => {
      setBillImage(null)
    },
    maxCount: 1
  }

  // Xác nhận thanh toán - CASCADE UPDATE
  const handleConfirm = async () => {
    // VALIDATION: Bắt buộc upload Bill khi chuyển khoản
    if (phuongThuc === 'CHUYEN_KHOAN' && !billImage) {
      message.error('Thanh toán chuyển khoản bắt buộc phải upload Bill!')
      return
    }

    // VALIDATION: Số tiền thanh toán phải > 0
    if (soTienThanhToan <= 0) {
      message.error('Số tiền thanh toán phải lớn hơn 0!')
      return
    }

    const remaining = documentData.totalAmount - (documentData.paidAmount || 0)
    if (soTienThanhToan > remaining) {
      message.error(`Số tiền thanh toán không được vượt quá số tiền còn nợ: ${remaining.toLocaleString()} VND`)
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        loaiPhieu,
        phuongThuc,
        soTien: soTienThanhToan,  // Số tiền thanh toán lần này
        billImage,
        refId,
        refType
      }

      const result = await mockAPI.createPhieuThuChi(payload)
      
      message.success(`✅ Xác nhận thanh toán thành công! Mã phiếu: ${result.id}`)
      
      // Quay về DocumentSelector để tiếp tục thanh toán chứng từ khác
      setTimeout(() => {
        onBack()
      }, 500)
    } catch (error) {
      message.error('Lỗi: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Card loading={loading} />
  }

  if (!documentData) {
    return <Card>Không tìm thấy dữ liệu</Card>
  }

  const isLocked = documentData.status === 'DA_THANH_TOAN'

  return (
    <div className="phieu-thu-chi-container">
      <Card className="phieu-thu-chi-card">
        {/* HEADER */}
        <div className="form-header">
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Quay lại
          </Button>
          <h2>
            {loaiPhieu === 'CHI' ? '💳 Phiếu Chi' : '💰 Phiếu Thu'}
          </h2>
        </div>

        {/* Thông tin chứng từ gốc */}
        <Descriptions
          bordered
          column={2}
          className="document-info"
          labelStyle={{ fontWeight: 600 }}
        >
          <Descriptions.Item label="Mã chứng từ">
            <Tag color="blue" style={{ fontSize: 14 }}>
              {documentData.maDeXuat || documentData.maChungTu}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Đối tượng">
            <strong>{documentData.supplier || documentData.customer}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền" span={2}>
            <Statistic
              value={documentData.totalAmount}
              suffix="VND"
              valueStyle={{ color: '#1890ff', fontSize: 24 }}
              formatter={(value) => value.toLocaleString()}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái" span={2}>
            <Tag 
              color={STATUS_COLORS[documentData.status]} 
              style={{ fontSize: 16, padding: '4px 12px' }}
            >
              {STATUS_LABELS[documentData.status]}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        {/* BODY: Danh sách đơn hàng (PO/SO) để đối soát */}
        <div className="items-section">
          <h3>
            <FileTextOutlined /> Danh sách đơn hàng liên quan
          </h3>
          <Table
            columns={columns}
            dataSource={documentData.items}
            rowKey="id"
            pagination={false}
            summary={(data) => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <strong>Tổng cộng</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong style={{ fontSize: 16, color: '#1890ff' }}>
                      {data.reduce((sum, item) => sum + item.amount, 0).toLocaleString()} VND
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
            className="items-table"
          />
        </div>

        {/* FOOTER: Thanh toán 1 phần */}
        {!isLocked && (
          <div className="payment-section">
            {/* Progress bar - Tiến độ thanh toán */}
            <div style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Tổng tiền"
                    value={documentData.totalAmount}
                    suffix="VND"
                    valueStyle={{ fontSize: 18 }}
                    formatter={(value) => value.toLocaleString()}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Đã thanh toán"
                    value={documentData.paidAmount || 0}
                    suffix="VND"
                    valueStyle={{ fontSize: 18, color: '#52c41a' }}
                    formatter={(value) => value.toLocaleString()}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Còn nợ"
                    value={documentData.totalAmount - (documentData.paidAmount || 0)}
                    suffix="VND"
                    valueStyle={{ fontSize: 18, color: '#ff4d4f' }}
                    formatter={(value) => value.toLocaleString()}
                  />
                </Col>
              </Row>
              <Progress
                percent={Math.round(((documentData.paidAmount || 0) / documentData.totalAmount) * 100)}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#52c41a',
                }}
                style={{ marginTop: 16 }}
              />
            </div>

            {/* Input số tiền thanh toán lần này */}
            <div className="form-item" style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 16, fontWeight: 600 }}>
                Số tiền thanh toán lần này <span style={{ color: 'red' }}>*</span>
              </label>
              <InputNumber
                value={soTienThanhToan}
                onChange={setSoTienThanhToan}
                min={0}
                max={documentData.totalAmount - (documentData.paidAmount || 0)}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                size="large"
                style={{ width: '100%' }}
                addonAfter="VND"
              />
              <div style={{ marginTop: 8, color: '#666' }}>
                Có thể thanh toán 1 phần. Số tiền tối đa: {(documentData.totalAmount - (documentData.paidAmount || 0)).toLocaleString()} VND
              </div>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="form-item">
                  <label>Phương thức thanh toán <span style={{ color: 'red' }}>*</span></label>
                  <Radio.Group
                    value={phuongThuc}
                    onChange={(e) => setPhuongThuc(e.target.value)}
                    buttonStyle="solid"
                    size="large"
                    style={{ width: '100%' }}
                  >
                    <Radio.Button value="TIEN_MAT" style={{ width: '50%', textAlign: 'center' }}>
                      💵 Tiền mặt
                    </Radio.Button>
                    <Radio.Button value="CHUYEN_KHOAN" style={{ width: '50%', textAlign: 'center' }}>
                      🏦 Chuyển khoản
                    </Radio.Button>
                  </Radio.Group>
                </div>
              </Col>

              <Col span={12}>
                <div className="form-item">
                  <label>
                    Upload Bill {phuongThuc === 'CHUYEN_KHOAN' && (
                      <Tag color="red">Bắt buộc</Tag>
                    )}
                  </label>
                  <Upload {...uploadProps} listType="picture-card">
                    {!billImage && (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                      </div>
                    )}
                  </Upload>
                  {billImage && (
                    <Image
                      width={200}
                      src={billImage}
                      alt="Bill preview"
                      style={{ marginTop: 8 }}
                    />
                  )}
                </div>
              </Col>
            </Row>

            {/* Nút xác nhận */}
            <div className="action-section">
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={handleConfirm}
                loading={submitting}
                style={{ 
                  background: '#52c41a',
                  borderColor: '#52c41a',
                  height: 50,
                  fontSize: 16,
                  fontWeight: 600
                }}
                block
              >
                ✅ XÁC NHẬN THANH TOÁN {soTienThanhToan > 0 && `(${soTienThanhToan.toLocaleString()} VND)`}
              </Button>
            </div>
          </div>
        )}

        {/* Locked message */}
        {isLocked && (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Tag color="green" style={{ fontSize: 18, padding: '8px 16px' }}>
              ✅ Đã thanh toán - Chứng từ đã bị khóa
            </Tag>
          </div>
        )}
      </Card>
    </div>
  )
}

export default PhieuThuChiForm
