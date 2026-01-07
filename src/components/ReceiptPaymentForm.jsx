import React, { useState } from 'react'
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Button,
  Space,
  message,
  Upload,
  Tag,
  Tooltip,
  Alert
} from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileTextOutlined,
  WarningOutlined
} from '@ant-design/icons'
import ARAPModal from './ARAPModal'
import { mockAPI } from '../utils/mockAPI'
import './ReceiptPaymentForm.css'

const { TextArea } = Input
const { Option } = Select

const ReceiptPaymentForm = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [receiptType, setReceiptType] = useState('THU') // THU or CHI
  const [objectType, setObjectType] = useState('KHACH_HANG') // KHACH_HANG or NHA_CUNG_CAP
  const [paymentMethod, setPaymentMethod] = useState('TIEN_MAT')
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [selectedDocuments, setSelectedDocuments] = useState([])
  const [showARAPModal, setShowARAPModal] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [partnerDebt, setPartnerDebt] = useState(null)

  // Validation: Kiểm tra điều kiện disable nút submit
  const getValidationErrors = () => {
    const errors = []
    const amount = form.getFieldValue('amount')

    // 1. Kiểm tra vượt công nợ
    if (partnerDebt && amount > partnerDebt.balance) {
      errors.push({
        type: 'error',
        message: `Số tiền vượt công nợ hiện tại (${partnerDebt.balance.toLocaleString()} VND)`
      })
    }

    // 2. Kiểm tra chuyển khoản nhưng chưa upload
    if (paymentMethod === 'CHUYEN_KHOAN' && uploadedFiles.length === 0) {
      errors.push({
        type: 'warning',
        message: 'Thanh toán chuyển khoản cần upload chứng từ'
      })
    }

    // 3. Kiểm tra chưa chọn công nợ khi có đối tượng
    if (selectedPartner && selectedDocuments.length === 0) {
      errors.push({
        type: 'info',
        message: 'Chưa chọn chứng từ công nợ (AR/AP)'
      })
    }

    return errors
  }

  const validationErrors = getValidationErrors()
  const canSubmit = !validationErrors.some(e => e.type === 'error')

  // Load AR/AP khi chọn khách hàng/NCC
  const handlePartnerChange = async (partnerId) => {
    if (!partnerId) {
      setSelectedPartner(null)
      setPartnerDebt(null)
      setSelectedDocuments([])
      return
    }

    const partner = await mockAPI.getPartnerById(partnerId, objectType)
    setSelectedPartner(partner)

    // Load debt info
    const debt = await mockAPI.getPartnerDebt(partnerId, objectType)
    setPartnerDebt(debt)

    // Reset selected documents
    setSelectedDocuments([])

    message.info(`Đã load thông tin công nợ của ${partner.name}`)
  }

  // Mở modal chọn AR/AP
  const handleSelectDocuments = () => {
    if (!selectedPartner) {
      message.warning('Vui lòng chọn khách hàng/nhà cung cấp trước')
      return
    }
    setShowARAPModal(true)
  }

  // Submit form
  const handleSubmit = async (values) => {
    if (!canSubmit) {
      message.error('Vui lòng kiểm tra các cảnh báo trước khi tạo phiếu')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...values,
        type: receiptType,
        objectType,
        paymentMethod,
        partnerId: selectedPartner?.id,
        documents: selectedDocuments,
        attachments: uploadedFiles.map(f => f.name)
      }

      const result = await mockAPI.createReceiptPayment(payload)
      
      message.success(`Tạo phiếu ${receiptType === 'THU' ? 'thu' : 'chi'} thành công! Mã: ${result.id}`)
      
      // Sau khi submit thành công, form sẽ ở chế độ readonly (backend sẽ xử lý)
      form.resetFields()
      setSelectedPartner(null)
      setSelectedDocuments([])
      setUploadedFiles([])
      setPartnerDebt(null)
      
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Upload props
  const uploadProps = {
    beforeUpload: (file) => {
      const isValid = file.size / 1024 / 1024 < 10 // < 10MB
      if (!isValid) {
        message.error('File phải nhỏ hơn 10MB')
        return false
      }
      setUploadedFiles(prev => [...prev, file])
      return false
    },
    onRemove: (file) => {
      setUploadedFiles(prev => prev.filter(f => f.uid !== file.uid))
    },
    fileList: uploadedFiles
  }

  return (
    <div className="receipt-payment-container">
      <Card className="receipt-payment-card">
        {/* Header */}
        <div className="card-header">
          <Button icon={<ArrowLeftOutlined />} onClick={() => window.history.back()}>
            Quay lại
          </Button>
          <h2>Tạo phiếu thu chi mới</h2>
        </div>

        {/* Validation Warnings */}
        {validationErrors.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {validationErrors.map((error, index) => (
              <Alert
                key={index}
                message={error.message}
                type={error.type}
                showIcon
                style={{ marginBottom: 8 }}
              />
            ))}
          </div>
        )}

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            amount: 0,
            hasInvoice: false
          }}
        >
          {/* Row 1: Loại phiếu & Số tiền */}
          <div className="form-row">
            <Form.Item
              label="Loại phiếu"
              required
              style={{ flex: 1 }}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Button
                  type={receiptType === 'THU' ? 'primary' : 'default'}
                  icon={<DownloadOutlined />}
                  onClick={() => setReceiptType('THU')}
                  style={{ flex: 1 }}
                >
                  Phiếu thu
                </Button>
                <Button
                  type={receiptType === 'CHI' ? 'primary' : 'default'}
                  icon={<UploadOutlined />}
                  onClick={() => setReceiptType('CHI')}
                  style={{ flex: 1 }}
                  danger
                >
                  Phiếu chi
                </Button>
              </Space.Compact>
            </Form.Item>

            <Form.Item
              name="amount"
              label="Số tiền"
              rules={[
                { required: true, message: 'Vui lòng nhập số tiền' },
                { type: 'number', min: 1, message: 'Số tiền phải lớn hơn 0' }
              ]}
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                addonAfter="VND"
                placeholder="0"
              />
            </Form.Item>
          </div>

          {/* Row 2: Đối tượng & Tìm kiếm */}
          <div className="form-row">
            <Form.Item
              label="Đối tượng"
              required
              style={{ flex: 1 }}
            >
              <Select value={objectType} onChange={setObjectType}>
                <Option value="KHACH_HANG">Khách hàng</Option>
                <Option value="NHA_CUNG_CAP">Nhà cung cấp</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="partnerId"
              label={objectType === 'KHACH_HANG' ? 'Tìm khách hàng' : 'Tìm nhà cung cấp'}
              style={{ flex: 1 }}
            >
              <Select
                showSearch
                placeholder={`Nhập tên hoặc mã ${objectType === 'KHACH_HANG' ? 'khách hàng' : 'nhà cung cấp'}`}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                onChange={handlePartnerChange}
              >
                {mockAPI.getPartnerList(objectType).map(p => (
                  <Option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {/* Debt Info & AR/AP Selection */}
          {selectedPartner && (
            <Alert
              message={
                <div>
                  <strong>{selectedPartner.name}</strong>
                  {partnerDebt && (
                    <div style={{ marginTop: 4 }}>
                      Công nợ hiện tại: <Tag color={partnerDebt.balance > 0 ? 'red' : 'green'}>
                        {partnerDebt.balance.toLocaleString()} VND
                      </Tag>
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<FileTextOutlined />}
                        onClick={handleSelectDocuments}
                      >
                        Chọn chứng từ ({selectedDocuments.length})
                      </Button>
                    </div>
                  )}
                </div>
              }
              type="info"
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Row 3: Phương thức thanh toán & Hóa đơn */}
          <div className="form-row">
            <Form.Item
              label="Phương thức thanh toán"
              style={{ flex: 1 }}
            >
              <Select value={paymentMethod} onChange={setPaymentMethod}>
                <Option value="TIEN_MAT">Tiền mặt</Option>
                <Option value="CHUYEN_KHOAN">Chuyển khoản</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="hasInvoice"
              valuePropName="checked"
              style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}
            >
              <Checkbox>Có hóa đơn</Checkbox>
            </Form.Item>
          </div>

          {/* Upload chứng từ (bắt buộc nếu chuyển khoản) */}
          {paymentMethod === 'CHUYEN_KHOAN' && (
            <Form.Item
              label={
                <span>
                  Upload chứng từ chuyển khoản 
                  <Tag color="red" style={{ marginLeft: 8 }}>Bắt buộc</Tag>
                </span>
              }
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Chọn file</Button>
              </Upload>
            </Form.Item>
          )}

          {/* Lý do */}
          <Form.Item
            name="reason"
            label="Lý do"
          >
            <Input placeholder="Lý do thu/chi" />
          </Form.Item>

          {/* Ghi chú */}
          <Form.Item
            name="note"
            label="Ghi chú"
          >
            <TextArea rows={3} placeholder="Ghi chú thêm..." />
          </Form.Item>

          {/* Actions */}
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button icon={<CloseOutlined />} onClick={() => form.resetFields()}>
                Hủy
              </Button>
              <Tooltip title={!canSubmit ? 'Vui lòng kiểm tra các lỗi' : ''}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  disabled={!canSubmit}
                  style={{ background: canSubmit ? '#16a34a' : undefined }}
                >
                  Tạo mới
                </Button>
              </Tooltip>
            </Space>
          </Form.Item>
        </Form>

        {/* AR/AP Document Selection Modal */}
        <ARAPModal
          visible={showARAPModal}
          onClose={() => setShowARAPModal(false)}
          partner={selectedPartner}
          type={receiptType === 'THU' ? 'AR' : 'AP'}
          selectedDocuments={selectedDocuments}
          onSelect={setSelectedDocuments}
        />
      </Card>
    </div>
  )
}

export default ReceiptPaymentForm
