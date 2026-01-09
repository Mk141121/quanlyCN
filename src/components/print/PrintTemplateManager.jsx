import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Tabs,
  Tag,
  Popconfirm,
  Tooltip,
  Row,
  Col,
  Divider,
  Empty,
  InputNumber,
  Radio
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PrinterOutlined,
  CopyOutlined,
  ReloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  FormOutlined,
  SettingOutlined,
  BankOutlined
} from '@ant-design/icons'
import { 
  getTemplates, 
  saveTemplate, 
  deleteTemplate, 
  resetTemplates,
  DEFAULT_TEMPLATES,
  generateDocNumber,
  DEFAULT_COMPANY_CONFIG
} from '../../utils/printUtils'
import { generatePDF, previewHTML, mapTemplateToDocumentType, mapFormDataToTemplateData, checkServerHealth } from '../../utils/pdfApi'
import { getCompanyConfig } from '../../utils/printUtils'
import PrintPreview from './PrintPreview'
import CompanyConfigForm from './CompanyConfigForm'
import './PrintTemplateManager.css'

const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

const FIELD_TYPES = [
  { value: 'text', label: 'Văn bản' },
  { value: 'number', label: 'Số' },
  { value: 'currency', label: 'Tiền tệ' },
  { value: 'date', label: 'Ngày tháng' },
  { value: 'textarea', label: 'Văn bản dài' },
  { value: 'select', label: 'Danh sách chọn' },
  { value: 'table', label: 'Bảng dữ liệu' }
]

const PAPER_SIZES = [
  { value: 'A4', label: 'A4 (210 x 297 mm)' },
  { value: 'A5', label: 'A5 (148 x 210 mm)' },
  { value: 'Letter', label: 'Letter (216 x 279 mm)' },
  { value: 'Legal', label: 'Legal (216 x 356 mm)' },
  { value: 'B5', label: 'B5 (176 x 250 mm)' }
]

const DEFAULT_PRINT_SETTINGS = {
  paperSize: 'A4',
  orientation: 'portrait',
  fontSize: 13,
  marginTop: 15,
  marginRight: 15,
  marginBottom: 15,
  marginLeft: 15
}

const PrintTemplateManager = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [createDocVisible, setCreateDocVisible] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [serverOnline, setServerOnline] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [form] = Form.useForm()
  const [docForm] = Form.useForm()

  useEffect(() => {
    loadTemplates()
    checkPDFServer()
  }, [])

  // Check PDF server status
  const checkPDFServer = async () => {
    const online = await checkServerHealth()
    setServerOnline(online)
    if (!online) {
      console.warn('[PrintTemplateManager] PDF Server offline - falling back to client-side preview')
    }
  }

  const loadTemplates = () => {
    setLoading(true)
    try {
      const data = getTemplates()
      setTemplates(data)
    } catch (error) {
      message.error('Không thể load danh sách mẫu in')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setEditingTemplate(null)
    form.resetFields()
    form.setFieldsValue({
      fields: [
        { key: 'maPhieu', label: 'Số phiếu', type: 'text', required: true }
      ],
      layoutType: 'phieu_thu_chi',
      printSettings: DEFAULT_PRINT_SETTINGS
    })
    setModalVisible(true)
  }

  const handleEdit = (template) => {
    setEditingTemplate(template)
    form.setFieldsValue({
      ...template,
      fields: template.fields || [],
      layoutType: template.layoutType || 'phieu_thu_chi',
      printSettings: template.printSettings || DEFAULT_PRINT_SETTINGS
    })
    setModalVisible(true)
  }

  const handleCopy = (template) => {
    const newTemplate = {
      ...template,
      id: `${template.id}_COPY_${Date.now()}`,
      name: `${template.name} (Bản sao)`,
      prefix: template.prefix,
      layoutType: template.layoutType || 'phieu_thu_chi',
      printSettings: template.printSettings || DEFAULT_PRINT_SETTINGS
    }
    setEditingTemplate(null)
    form.setFieldsValue(newTemplate)
    setModalVisible(true)
  }

  const handleDelete = (templateId) => {
    try {
      const updated = deleteTemplate(templateId)
      setTemplates(updated)
      message.success('Đã xóa mẫu in')
    } catch (error) {
      message.error('Không thể xóa mẫu in')
    }
  }

  const handleReset = () => {
    Modal.confirm({
      title: 'Khôi phục mẫu mặc định',
      content: 'Tất cả các mẫu tùy chỉnh sẽ bị xóa và khôi phục về mẫu gốc. Bạn có chắc chắn?',
      okText: 'Khôi phục',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => {
        const defaultTemplates = resetTemplates()
        setTemplates(defaultTemplates)
        message.success('Đã khôi phục mẫu mặc định')
      }
    })
  }

  const handleSaveTemplate = async () => {
    try {
      const values = await form.validateFields()
      
      const template = {
        ...values,
        id: editingTemplate?.id || values.id || `CUSTOM_${Date.now()}`,
        fields: values.fields || [],
        layoutType: values.layoutType || 'phieu_thu_chi',
        printSettings: values.printSettings || DEFAULT_PRINT_SETTINGS
      }
      
      saveTemplate(template)
      // Reload templates from localStorage to get the latest data
      loadTemplates()
      setModalVisible(false)
      message.success(editingTemplate ? 'Đã cập nhật mẫu in' : 'Đã tạo mẫu in mới')
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin')
    }
  }

  const handlePreview = (template) => {
    // Get the latest template from localStorage to ensure we have updated printSettings
    const latestTemplates = getTemplates()
    const latestTemplate = latestTemplates.find(t => t.id === template.id) || template
    
    setPreviewTemplate(latestTemplate)
    setPreviewVisible(true)
  }

  const handleCreateDocument = (template) => {
    // Get the latest template from localStorage to ensure we have updated printSettings
    const latestTemplates = getTemplates()
    const latestTemplate = latestTemplates.find(t => t.id === template.id) || template
    
    setSelectedTemplate(latestTemplate)
    docForm.resetFields()
    // Generate default values
    const defaultValues = {}
    latestTemplate.fields?.forEach(field => {
      if (field.key === 'maPhieu' || field.key === 'maDeXuat') {
        defaultValues[field.key] = generateDocNumber(latestTemplate.prefix)
      }
      if (field.type === 'date' && field.key.includes('ngay')) {
        defaultValues[field.key] = new Date().toISOString().split('T')[0]
      }
    })
    docForm.setFieldsValue(defaultValues)
    setCreateDocVisible(true)
  }

  // Xử lý in với PDF Server hoặc fallback client-side
  const handlePrintDocument = async () => {
    try {
      const values = await docForm.validateFields()
      
      if (serverOnline) {
        // Sử dụng PDF Server
        setPrinting(true)
        try {
          const documentType = mapTemplateToDocumentType(selectedTemplate.id)
          const data = mapFormDataToTemplateData(selectedTemplate.id, values)
          const config = getCompanyConfig()
          
          // Lấy printSettings từ template
          const printSettings = selectedTemplate.printSettings || DEFAULT_PRINT_SETTINGS
          
          await generatePDF(documentType, data, config, true, printSettings)
          setCreateDocVisible(false)
          message.success('Đã tạo PDF thành công')
        } catch (error) {
          message.error('Lỗi tạo PDF: ' + error.message)
          // Fallback to client-side preview
          setPreviewTemplate({
            ...selectedTemplate,
            documentData: values
          })
          setCreateDocVisible(false)
          setPreviewVisible(true)
        } finally {
          setPrinting(false)
        }
      } else {
        // Fallback: Client-side preview
        setPreviewTemplate({
          ...selectedTemplate,
          documentData: values
        })
        setCreateDocVisible(false)
        setPreviewVisible(true)
      }
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc')
    }
  }

  // In trực tiếp từ nút "In" trong bảng
  const handleDirectPrint = async (template) => {
    if (!serverOnline) {
      message.warning('PDF Server chưa hoạt động. Vui lòng chạy: npm run server')
      // Fallback to preview
      handlePreview(template)
      return
    }

    setPrinting(true)
    try {
      const documentType = mapTemplateToDocumentType(template.id)
      // Tạo data mẫu với số phiếu tự động
      const sampleData = {
        soPhieu: generateDocNumber(template.prefix),
        ngayLap: new Date().toISOString(),
        proposalCode: generateDocNumber(template.prefix)
      }
      const config = getCompanyConfig()
      
      await previewHTML(documentType, sampleData, config)
      message.info('Đã mở preview HTML - Điền dữ liệu và in từ màn hình "Tạo chứng từ"')
    } catch (error) {
      message.error('Không thể kết nối PDF Server: ' + error.message)
      handlePreview(template)
    } finally {
      setPrinting(false)
    }
  }

  const columns = [
    {
      title: 'Tên mẫu',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
          {Object.keys(DEFAULT_TEMPLATES).includes(record.id) && (
            <Tag color="blue">Mặc định</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Mã tiền tố',
      dataIndex: 'prefix',
      key: 'prefix',
      width: 100,
      render: (text) => <Tag color="geekblue">{text}</Tag>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Số trường',
      key: 'fieldCount',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tag>{record.fields?.length || 0} trường</Tag>
      )
    },
    {
      title: 'Bố cục',
      key: 'layoutType',
      width: 120,
      render: (_, record) => {
        const layoutLabels = {
          'phieu_thu_chi': 'Phiếu Thu/Chi',
          'de_xuat': 'Đề xuất Chi',
          'de_xuat_thanh_toan': 'Đề xuất TT',
          'generic': 'Tùy chỉnh'
        }
        const lt = record.layoutType || 'phieu_thu_chi'
        return <Tag color="purple">{layoutLabels[lt] || lt}</Tag>
      }
    },
    {
      title: 'Cài đặt in',
      key: 'printSettings',
      width: 150,
      render: (_, record) => {
        const ps = record.printSettings || DEFAULT_PRINT_SETTINGS
        return (
          <Space direction="vertical" size={0} style={{ fontSize: 12 }}>
            <span>{ps.paperSize} {ps.orientation === 'landscape' ? '(Ngang)' : '(Dọc)'}</span>
            <span style={{ color: '#999' }}>Font: {ps.fontSize}pt</span>
          </Space>
        )
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Tạo phiếu">
            <Button 
              type="primary"
              icon={<FormOutlined />}
              onClick={() => handleCreateDocument(record)}
            >
              Tạo phiếu
            </Button>
          </Tooltip>
          <Tooltip title="Xem trước">
            <Button 
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Sao chép">
            <Button 
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa mẫu này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const renderFieldInput = (field) => {
    switch (field.type) {
      case 'textarea':
        return <TextArea rows={3} placeholder={`Nhập ${field.label}`} />
      case 'date':
        return <Input type="date" />
      case 'number':
        return <Input type="number" placeholder={`Nhập ${field.label}`} />
      case 'currency':
        return (
          <Input 
            type="number" 
            placeholder={`Nhập ${field.label}`}
            addonAfter="VNĐ"
          />
        )
      case 'select':
        return (
          <Select placeholder={`Chọn ${field.label}`}>
            {(field.options || []).map(opt => (
              <Option key={opt} value={opt}>{opt}</Option>
            ))}
          </Select>
        )
      default:
        return <Input placeholder={`Nhập ${field.label}`} />
    }
  }

  const tabItems = [
    {
      key: 'templates',
      label: (
        <span>
          <FileTextOutlined />
          Mẫu phiếu
        </span>
      ),
      children: (
        <>
          <div className="template-intro">
            <p>
              📋 Quản lý và tùy chỉnh các mẫu phiếu hành chính. 
              Bạn có thể tạo mẫu mới, chỉnh sửa mẫu có sẵn, hoặc sao chép từ mẫu mặc định.
            </p>
            {/* PDF Server Status */}
            <div style={{ marginTop: 8 }}>
              <Tag color={serverOnline ? 'green' : 'orange'}>
                {serverOnline ? '🟢 PDF Server: Online' : '🟠 PDF Server: Offline (sử dụng preview)'}
              </Tag>
              {!serverOnline && (
                <Button size="small" type="link" onClick={checkPDFServer}>
                  Kiểm tra lại
                </Button>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Space>
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                Khôi phục mặc định
              </Button>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateNew}
              >
                Tạo mẫu mới
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={templates}
            rowKey="id"
            loading={loading}
            pagination={false}
            locale={{
              emptyText: <Empty description="Chưa có mẫu in nào" />
            }}
          />
        </>
      )
    },
    {
      key: 'company',
      label: (
        <span>
          <BankOutlined />
          Cấu hình công ty
        </span>
      ),
      children: <CompanyConfigForm />
    }
  ]

  return (
    <div className="print-template-manager">
      <Card 
        title={
          <Space>
            <PrinterOutlined />
            <span>Tạo Form Hành chính</span>
          </Space>
        }
      >
        <Tabs items={tabItems} />
      </Card>

      {/* Modal tạo/sửa mẫu */}
      <Modal
        title={editingTemplate ? 'Chỉnh sửa mẫu in' : 'Tạo mẫu in mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSaveTemplate}
        okText="Lưu mẫu"
        cancelText="Hủy"
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="name"
                label="Tên mẫu"
                rules={[{ required: true, message: 'Vui lòng nhập tên mẫu' }]}
              >
                <Input placeholder="VD: Phiếu Thu tiền mặt" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="prefix"
                label="Mã tiền tố"
                rules={[{ required: true, message: 'Vui lòng nhập mã tiền tố' }]}
              >
                <Input placeholder="VD: PT, PC, DXC" maxLength={10} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="layoutType"
                label="Kiểu bố cục"
                initialValue="phieu_thu_chi"
                tooltip="Chọn bố cục hiển thị khi in"
              >
                <Select>
                  <Option value="phieu_thu_chi">Phiếu Thu/Chi</Option>
                  <Option value="de_xuat">Đề xuất Chi</Option>
                  <Option value="de_xuat_thanh_toan">Đề xuất Thanh toán</Option>
                  <Option value="generic">Tùy chỉnh</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={2} placeholder="Mô tả ngắn về mẫu in" />
          </Form.Item>

          <Divider>Danh sách trường dữ liệu</Divider>

          <Form.List name="fields">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={8} className="field-row">
                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'key']}
                        rules={[{ required: true, message: 'Nhập key' }]}
                      >
                        <Input placeholder="Key (VD: maPhieu)" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'label']}
                        rules={[{ required: true, message: 'Nhập label' }]}
                      >
                        <Input placeholder="Nhãn (VD: Số phiếu)" />
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        initialValue="text"
                      >
                        <Select placeholder="Loại">
                          {FIELD_TYPES.map(t => (
                            <Option key={t.value} value={t.value}>{t.label}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item
                        {...restField}
                        name={[name, 'required']}
                        valuePropName="checked"
                      >
                        <Select placeholder="Bắt buộc?">
                          <Option value={true}>Bắt buộc</Option>
                          <Option value={false}>Không bắt buộc</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Button 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    </Col>
                  </Row>
                ))}
                <Button 
                  type="dashed" 
                  onClick={() => add({ type: 'text', required: false })} 
                  block 
                  icon={<PlusOutlined />}
                >
                  Thêm trường
                </Button>
              </>
            )}
          </Form.List>

          <Divider>🖨️ Cài đặt in cho mẫu này</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={['printSettings', 'paperSize']}
                label="Khổ giấy"
                initialValue="A4"
              >
                <Select options={PAPER_SIZES} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['printSettings', 'orientation']}
                label="Hướng giấy"
                initialValue="portrait"
              >
                <Radio.Group>
                  <Radio.Button value="portrait">📄 Dọc</Radio.Button>
                  <Radio.Button value="landscape">📃 Ngang</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['printSettings', 'fontSize']}
                label="Cỡ chữ (pt)"
                initialValue={13}
              >
                <InputNumber min={8} max={20} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name={['printSettings', 'marginTop']}
                label="Lề trên (mm)"
                initialValue={15}
              >
                <InputNumber min={0} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={['printSettings', 'marginRight']}
                label="Lề phải (mm)"
                initialValue={15}
              >
                <InputNumber min={0} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={['printSettings', 'marginBottom']}
                label="Lề dưới (mm)"
                initialValue={15}
              >
                <InputNumber min={0} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={['printSettings', 'marginLeft']}
                label="Lề trái (mm)"
                initialValue={15}
              >
                <InputNumber min={0} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal tạo phiếu từ mẫu */}
      <Modal
        title={
          <Space>
            <FormOutlined />
            <span>Tạo phiếu: {selectedTemplate?.name}</span>
            {serverOnline && <Tag color="green" style={{ marginLeft: 8 }}>PDF Server Online</Tag>}
          </Space>
        }
        open={createDocVisible}
        onCancel={() => setCreateDocVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setCreateDocVisible(false)}>
            Hủy
          </Button>,
          <Button 
            key="preview" 
            icon={<EyeOutlined />}
            onClick={async () => {
              try {
                const values = await docForm.validateFields()
                setPreviewTemplate({
                  ...selectedTemplate,
                  documentData: values
                })
                setCreateDocVisible(false)
                setPreviewVisible(true)
              } catch (e) {
                message.error('Vui lòng điền đầy đủ thông tin')
              }
            }}
          >
            Xem trước
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />}
            loading={printing}
            onClick={handlePrintDocument}
          >
            {serverOnline ? 'Tạo PDF' : 'Xem & In'}
          </Button>
        ]}
        width={700}
        destroyOnClose
      >
        <Form
          form={docForm}
          layout="vertical"
        >
          {selectedTemplate?.fields?.map(field => (
            <Form.Item
              key={field.key}
              name={field.key}
              label={field.label}
              rules={field.required ? [{ required: true, message: `Vui lòng nhập ${field.label}` }] : []}
            >
              {renderFieldInput(field)}
            </Form.Item>
          ))}
        </Form>
      </Modal>

      {/* Preview Modal */}
      {previewVisible && (
        <PrintPreview
          template={previewTemplate}
          visible={previewVisible}
          onClose={() => {
            setPreviewVisible(false)
            setPreviewTemplate(null)
          }}
        />
      )}
    </div>
  )
}

export default PrintTemplateManager
