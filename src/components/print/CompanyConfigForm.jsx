import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  message,
  Divider,
  Row,
  Col,
  Upload,
  Image,
  Tabs,
  Table,
  Popconfirm,
  Select,
  InputNumber,
  Radio
} from 'antd'
import {
  SaveOutlined,
  ReloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  BankOutlined,
  EditOutlined,
  PrinterOutlined
} from '@ant-design/icons'
import {
  getCompanyConfig,
  saveCompanyConfig,
  resetCompanyConfig,
  DEFAULT_COMPANY_CONFIG
} from '../../utils/printUtils'
import './CompanyConfigForm.css'

const { TextArea } = Input

const CompanyConfigForm = ({ onSave }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [logo, setLogo] = useState('')
  const [addresses, setAddresses] = useState([])
  const [signaturesPhieu, setSignaturesPhieu] = useState([])
  const [signaturesDeXuat, setSignaturesDeXuat] = useState([])
  const [printSettings, setPrintSettings] = useState(DEFAULT_COMPANY_CONFIG.printSettings)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = () => {
    const config = getCompanyConfig()
    form.setFieldsValue(config)
    setLogo(config.companyLogo || '')
    setAddresses(config.addresses || DEFAULT_COMPANY_CONFIG.addresses)
    setSignaturesPhieu(config.signatures_phieu || DEFAULT_COMPANY_CONFIG.signatures_phieu)
    setSignaturesDeXuat(config.signatures_dexuat || DEFAULT_COMPANY_CONFIG.signatures_dexuat)
    setPrintSettings(config.printSettings || DEFAULT_COMPANY_CONFIG.printSettings)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const values = await form.validateFields()
      const config = {
        ...values,
        companyLogo: logo,
        addresses: addresses,
        signatures_phieu: signaturesPhieu,
        signatures_dexuat: signaturesDeXuat,
        printSettings: printSettings
      }
      saveCompanyConfig(config)
      message.success('✅ Đã lưu cấu hình công ty!')
      if (onSave) onSave(config)
    } catch (error) {
      message.error('Vui lòng kiểm tra lại thông tin')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    const defaultConfig = resetCompanyConfig()
    form.setFieldsValue(defaultConfig)
    setLogo(defaultConfig.companyLogo || '')
    setAddresses(defaultConfig.addresses || [])
    setSignaturesPhieu(defaultConfig.signatures_phieu)
    setSignaturesDeXuat(defaultConfig.signatures_dexuat)
    setPrintSettings(defaultConfig.printSettings || DEFAULT_COMPANY_CONFIG.printSettings)
    message.success('Đã khôi phục cấu hình mặc định')
  }

  const handleLogoUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('Chỉ chấp nhận file ảnh!')
      return false
    }
    if (file.size > 2 * 1024 * 1024) {
      message.error('File phải nhỏ hơn 2MB!')
      return false
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setLogo(e.target.result)
    }
    reader.readAsDataURL(file)
    return false
  }

  const handleRemoveLogo = () => {
    setLogo('')
  }

  // Address table columns
  const addressColumns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Loại địa chỉ',
      dataIndex: 'label',
      key: 'label',
      width: 150,
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleAddressChange(index, 'label', e.target.value)}
          placeholder="VD: Văn phòng, Kho, Chi nhánh..."
        />
      )
    },
    {
      title: 'Địa chỉ chi tiết',
      dataIndex: 'value',
      key: 'value',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleAddressChange(index, 'value', e.target.value)}
          placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
        />
      )
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, __, index) => (
        <Popconfirm
          title="Xóa địa chỉ này?"
          onConfirm={() => handleRemoveAddress(index)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      )
    }
  ]

  const handleAddressChange = (index, field, value) => {
    const newAddresses = [...addresses]
    newAddresses[index] = { ...newAddresses[index], [field]: value }
    setAddresses(newAddresses)
  }

  const handleAddAddress = () => {
    setAddresses([...addresses, { label: '', value: '' }])
  }

  const handleRemoveAddress = (index) => {
    setAddresses(addresses.filter((_, i) => i !== index))
  }

  // Signature table columns
  const signatureColumns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Chức danh',
      dataIndex: 'title',
      key: 'title',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleSignatureChange(index, 'title', e.target.value, 'phieu')}
          placeholder="VD: Giám đốc"
        />
      )
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleSignatureChange(index, 'note', e.target.value, 'phieu')}
          placeholder="VD: (Ký, họ tên)"
        />
      )
    },
    {
      title: 'Tên người ký',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleSignatureChange(index, 'name', e.target.value, 'phieu')}
          placeholder="Để trống nếu chưa xác định"
        />
      )
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, __, index) => (
        <Popconfirm
          title="Xóa vị trí ký này?"
          onConfirm={() => handleRemoveSignature(index, 'phieu')}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      )
    }
  ]

  const signatureDeXuatColumns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Chức danh',
      dataIndex: 'title',
      key: 'title',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleSignatureChange(index, 'title', e.target.value, 'dexuat')}
          placeholder="VD: Giám đốc"
        />
      )
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleSignatureChange(index, 'note', e.target.value, 'dexuat')}
          placeholder="VD: (Ký, họ tên)"
        />
      )
    },
    {
      title: 'Tên người ký',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleSignatureChange(index, 'name', e.target.value, 'dexuat')}
          placeholder="Để trống nếu chưa xác định"
        />
      )
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, __, index) => (
        <Popconfirm
          title="Xóa vị trí ký này?"
          onConfirm={() => handleRemoveSignature(index, 'dexuat')}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      )
    }
  ]

  const handleSignatureChange = (index, field, value, type) => {
    if (type === 'phieu') {
      const newSignatures = [...signaturesPhieu]
      newSignatures[index] = { ...newSignatures[index], [field]: value }
      setSignaturesPhieu(newSignatures)
    } else {
      const newSignatures = [...signaturesDeXuat]
      newSignatures[index] = { ...newSignatures[index], [field]: value }
      setSignaturesDeXuat(newSignatures)
    }
  }

  const handleAddSignature = (type) => {
    const newSig = { title: '', note: '(Ký, họ tên)', name: '' }
    if (type === 'phieu') {
      setSignaturesPhieu([...signaturesPhieu, newSig])
    } else {
      setSignaturesDeXuat([...signaturesDeXuat, newSig])
    }
  }

  const handleRemoveSignature = (index, type) => {
    if (type === 'phieu') {
      setSignaturesPhieu(signaturesPhieu.filter((_, i) => i !== index))
    } else {
      setSignaturesDeXuat(signaturesDeXuat.filter((_, i) => i !== index))
    }
  }

  const tabItems = [
    {
      key: 'company',
      label: '🏢 Thông tin công ty',
      children: (
        <div className="config-section">
          <Row gutter={24}>
            <Col span={16}>
              <Form.Item
                name="companyName"
                label="Tên công ty"
                rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
              >
                <Input placeholder="VD: CÔNG TY TNHH ABC" style={{ fontWeight: 'bold', fontSize: 16 }} />
              </Form.Item>

              <Divider orientation="left">📍 Địa chỉ các chi nhánh</Divider>
              
              <Table
                columns={addressColumns}
                dataSource={addresses}
                rowKey={(_, index) => index}
                pagination={false}
                size="small"
                style={{ marginBottom: 16 }}
              />
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddAddress}
                style={{ width: '100%', marginBottom: 24 }}
              >
                Thêm địa chỉ chi nhánh
              </Button>

              <Divider orientation="left">📞 Thông tin liên hệ</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="companyTel" label="Số điện thoại">
                    <Input placeholder="VD: 028.1234.5678" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="companyHotline" label="Hotline">
                    <Input placeholder="VD: 090.245.8081" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="companyEmail" label="Email">
                    <Input placeholder="VD: info@abc.com.vn" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="companyWebsite" label="Website">
                    <Input placeholder="VD: http://abc.com.vn" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="companyFax" label="Fax">
                    <Input placeholder="VD: 028.1234.5679" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="companyTaxCode" label="Mã số thuế">
                    <Input placeholder="VD: 0123456789" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col span={8}>
              <div className="logo-section">
                <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Logo công ty</label>
                {logo ? (
                  <div className="logo-preview">
                    <Image
                      src={logo}
                      alt="Logo"
                      style={{ maxWidth: 200, maxHeight: 100, objectFit: 'contain' }}
                    />
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleRemoveLogo}
                      style={{ marginTop: 8 }}
                    >
                      Xóa logo
                    </Button>
                  </div>
                ) : (
                  <Upload
                    beforeUpload={handleLogoUpload}
                    showUploadList={false}
                    accept="image/*"
                  >
                    <div className="logo-upload-area">
                      <UploadOutlined style={{ fontSize: 32, color: '#999' }} />
                      <p>Click để upload logo</p>
                      <p style={{ fontSize: 12, color: '#999' }}>PNG, JPG (max 2MB)</p>
                    </div>
                  </Upload>
                )}
              </div>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'document',
      label: '📄 Thông tin chứng từ',
      children: (
        <div className="config-section">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="docFormPhieuThu" label="Mẫu số - Phiếu Thu">
                <Input placeholder="VD: 01-TT" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="docFormPhieuChi" label="Mẫu số - Phiếu Chi">
                <Input placeholder="VD: 02-TT" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="location" label="Địa điểm (cho ngày tháng)">
                <Input placeholder="VD: TP.HCM" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="docDecision" label="Căn cứ ban hành">
            <Input placeholder="VD: Ban hành theo QĐ số 48/2006/QĐ-BTC" />
          </Form.Item>
        </div>
      )
    },
    {
      key: 'signatures_phieu',
      label: '✍️ Chữ ký - Phiếu Thu/Chi',
      children: (
        <div className="config-section">
          <p style={{ marginBottom: 16, color: '#666' }}>
            Cấu hình các vị trí ký trên Phiếu Thu, Phiếu Chi. Thứ tự từ trái sang phải.
          </p>
          <Table
            columns={signatureColumns}
            dataSource={signaturesPhieu}
            rowKey={(_, index) => index}
            pagination={false}
            size="small"
          />
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => handleAddSignature('phieu')}
            style={{ marginTop: 16, width: '100%' }}
          >
            Thêm vị trí ký
          </Button>
        </div>
      )
    },
    {
      key: 'signatures_dexuat',
      label: '✍️ Chữ ký - Đề xuất',
      children: (
        <div className="config-section">
          <p style={{ marginBottom: 16, color: '#666' }}>
            Cấu hình các vị trí ký trên các phiếu Đề xuất Chi, Đề xuất Thanh toán. Thứ tự từ trái sang phải.
          </p>
          <Table
            columns={signatureDeXuatColumns}
            dataSource={signaturesDeXuat}
            rowKey={(_, index) => index}
            pagination={false}
            size="small"
          />
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => handleAddSignature('dexuat')}
            style={{ marginTop: 16, width: '100%' }}
          >
            Thêm vị trí ký
          </Button>
        </div>
      )
    },
    {
      key: 'print_settings',
      label: '🖨️ Cài đặt in mặc định',
      children: (
        <div className="config-section">
          <p style={{ marginBottom: 16, color: '#666' }}>
            Cấu hình khổ giấy, hướng in và font chữ <strong>mặc định</strong> cho các phiếu in. 
            Mỗi mẫu phiếu có thể có cài đặt riêng sẽ ghi đè lên cài đặt này.
          </p>
          
          <Row gutter={24}>
            <Col span={8}>
              <div className="print-setting-item">
                <label>Khổ giấy mặc định</label>
                <Select
                  value={printSettings.paperSize}
                  onChange={(value) => setPrintSettings({ ...printSettings, paperSize: value })}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'A4', label: 'A4 (210 x 297 mm)' },
                    { value: 'A5', label: 'A5 (148 x 210 mm)' },
                    { value: 'Letter', label: 'Letter (216 x 279 mm)' },
                    { value: 'Legal', label: 'Legal (216 x 356 mm)' },
                    { value: 'B5', label: 'B5 (176 x 250 mm)' }
                  ]}
                />
              </div>
            </Col>
            
            <Col span={8}>
              <div className="print-setting-item">
                <label>Hướng giấy mặc định</label>
                <Radio.Group
                  value={printSettings.orientation}
                  onChange={(e) => setPrintSettings({ ...printSettings, orientation: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <Radio.Button value="portrait" style={{ width: '50%', textAlign: 'center' }}>
                    📄 Dọc
                  </Radio.Button>
                  <Radio.Button value="landscape" style={{ width: '50%', textAlign: 'center' }}>
                    📃 Ngang
                  </Radio.Button>
                </Radio.Group>
              </div>
            </Col>
            
            <Col span={8}>
              <div className="print-setting-item">
                <label>Cỡ chữ mặc định (pt)</label>
                <InputNumber
                  value={printSettings.fontSize}
                  onChange={(value) => setPrintSettings({ ...printSettings, fontSize: value })}
                  min={8}
                  max={20}
                  style={{ width: '100%' }}
                  addonAfter="pt"
                />
              </div>
            </Col>
          </Row>

          <Divider orientation="left" style={{ marginTop: 24 }}>🏢 Font chữ thông tin công ty</Divider>
          
          <Row gutter={24}>
            <Col span={8}>
              <div className="print-setting-item">
                <label>Cỡ chữ tên công ty (pt)</label>
                <InputNumber
                  value={printSettings.fontSizeCompanyName || 14}
                  onChange={(value) => setPrintSettings({ ...printSettings, fontSizeCompanyName: value })}
                  min={10}
                  max={24}
                  style={{ width: '100%' }}
                  addonAfter="pt"
                />
              </div>
            </Col>
            <Col span={8}>
              <div className="print-setting-item">
                <label>Cỡ chữ địa chỉ, liên hệ (pt)</label>
                <InputNumber
                  value={printSettings.fontSizeAddress || 10}
                  onChange={(value) => setPrintSettings({ ...printSettings, fontSizeAddress: value })}
                  min={8}
                  max={16}
                  style={{ width: '100%' }}
                  addonAfter="pt"
                />
              </div>
            </Col>
            <Col span={8}>
              <div className="print-setting-item">
                <label>Cỡ chữ phần ký (pt)</label>
                <InputNumber
                  value={printSettings.fontSizeSignature || 12}
                  onChange={(value) => setPrintSettings({ ...printSettings, fontSizeSignature: value })}
                  min={10}
                  max={18}
                  style={{ width: '100%' }}
                  addonAfter="pt"
                />
              </div>
            </Col>
          </Row>
          
          <Divider orientation="left" style={{ marginTop: 24 }}>📐 Lề giấy mặc định (mm)</Divider>
          
          <Row gutter={16}>
            <Col span={6}>
              <div className="print-setting-item">
                <label>Lề trên</label>
                <InputNumber
                  value={printSettings.marginTop}
                  onChange={(value) => setPrintSettings({ ...printSettings, marginTop: value })}
                  min={0}
                  max={50}
                  style={{ width: '100%' }}
                  addonAfter="mm"
                />
              </div>
            </Col>
            <Col span={6}>
              <div className="print-setting-item">
                <label>Lề phải</label>
                <InputNumber
                  value={printSettings.marginRight}
                  onChange={(value) => setPrintSettings({ ...printSettings, marginRight: value })}
                  min={0}
                  max={50}
                  style={{ width: '100%' }}
                  addonAfter="mm"
                />
              </div>
            </Col>
            <Col span={6}>
              <div className="print-setting-item">
                <label>Lề dưới</label>
                <InputNumber
                  value={printSettings.marginBottom}
                  onChange={(value) => setPrintSettings({ ...printSettings, marginBottom: value })}
                  min={0}
                  max={50}
                  style={{ width: '100%' }}
                  addonAfter="mm"
                />
              </div>
            </Col>
            <Col span={6}>
              <div className="print-setting-item">
                <label>Lề trái</label>
                <InputNumber
                  value={printSettings.marginLeft}
                  onChange={(value) => setPrintSettings({ ...printSettings, marginLeft: value })}
                  min={0}
                  max={50}
                  style={{ width: '100%' }}
                  addonAfter="mm"
                />
              </div>
            </Col>
          </Row>
          
          <div className="print-preview-hint" style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            <Space direction="vertical" size={8}>
              <div>
                <PrinterOutlined style={{ fontSize: 20, color: '#1890ff', marginRight: 8 }} />
                <strong>Lưu ý:</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Đây là cài đặt in <strong>mặc định</strong> cho tất cả các mẫu phiếu.</li>
                <li>Mỗi mẫu phiếu có thể có cài đặt riêng (trong tab "Mẫu phiếu" → Sửa mẫu).</li>
                <li>Cài đặt riêng của mẫu phiếu sẽ <strong>ghi đè</strong> lên cài đặt mặc định này.</li>
              </ul>
            </Space>
          </div>
        </div>
      )
    }
  ]

  return (
    <Card
      title={
        <Space>
          <BankOutlined />
          <span>Cấu hình thông tin công ty</span>
        </Space>
      }
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Khôi phục mặc định
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={loading}>
            Lưu cấu hình
          </Button>
        </Space>
      }
      className="company-config-card"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={DEFAULT_COMPANY_CONFIG}
      >
        <Tabs items={tabItems} />
      </Form>
    </Card>
  )
}

export default CompanyConfigForm
