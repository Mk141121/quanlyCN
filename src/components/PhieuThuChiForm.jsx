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
  Progress,
  Input,
  Alert
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  DollarOutlined,
  FileTextOutlined,
  LockOutlined,
  PrinterOutlined
} from '@ant-design/icons'
import { mockAPI, mockPurchaseOrders } from '../utils/mockAPICongNo'
import dayjs from 'dayjs'
import PrintButton from './print/PrintButton'
import { getCompanyConfig } from '../utils/printUtils'
import './PhieuThuChiForm.css'

// Màu sắc theo SPEC
const STATUS_COLORS = {
  CHO_DUYET: 'orange',        // Cam - Chờ duyệt
  CHO_THANH_TOAN: 'gold',     // Vàng - Đã duyệt, chờ thanh toán
  CHO_THU_TIEN: 'gold',       // Vàng
  DA_THANH_TOAN: 'green',     // Xanh - Đã thanh toán
  DA_THU_TIEN: 'green',       // Xanh
  KHONG_DUYET: 'red'          // Đỏ - Từ chối
}

const STATUS_LABELS = {
  CHO_DUYET: 'Chờ duyệt',
  CHO_THANH_TOAN: 'Chờ thanh toán',
  CHO_THU_TIEN: 'Chờ thu tiền',
  DA_THANH_TOAN: 'Đã thanh toán',
  DA_THU_TIEN: 'Đã thu tiền',
  KHONG_DUYET: 'Không duyệt'
}

const PhieuThuChiForm = ({ refId, refType, loaiPhieuProp, isViewOnly = false, isCreateNew = false, onBack, onSuccess }) => {
  const [loading, setLoading] = useState(!isCreateNew)
  const [submitting, setSubmitting] = useState(false)
  const [documentData, setDocumentData] = useState(null)
  const [phuongThuc, setPhuongThuc] = useState('TIEN_MAT')
  const [billImage, setBillImage] = useState(null)
  const [soTienThanhToan, setSoTienThanhToan] = useState(0)  // Số tiền thanh toán lần này
  
  // Form fields for create new mode
  const [noiDung, setNoiDung] = useState('')
  const [doiTac, setDoiTac] = useState('')
  const [ghiChu, setGhiChu] = useState('')

  const loaiPhieu = loaiPhieuProp || ((refType === 'PaymentProposal' || refType === 'PhieuChi') ? 'CHI' : 'THU')

  useEffect(() => {
    if (!isCreateNew && refId) {
      loadDocumentData()
    }
  }, [refId, refType, isCreateNew])

  const loadDocumentData = async () => {
    if (isCreateNew) return
    
    setLoading(true)
    try {
      let data
      if (refType === 'PhieuChi') {
        // Load Phiếu Chi created from approved proposals
        const allPhieuChi = await mockAPI.getPhieuThuChi()
        const phieuChi = allPhieuChi.find(p => p.id === refId)
        if (!phieuChi) {
          throw new Error('Không tìm thấy Phiếu Chi')
        }
        
        // Load PO items from mockPurchaseOrders
        const poItems = (phieuChi.poIds || [])
          .map(poId => {
            const po = mockPurchaseOrders.find(p => p.id === poId)
            if (po) {
              return {
                id: po.id,
                maDon: po.maDon,
                supplier: po.supplier,
                createdDate: po.createdDate,
                amount: po.amount,
                description: `Đơn hàng ${po.maDon}`,
                poStatus: po.status
              }
            }
            return null
          })
          .filter(item => item !== null)
        
        // Transform to common format
        data = {
          id: phieuChi.id,
          maChungTu: phieuChi.maPhieu,
          supplier: phieuChi.supplier,
          totalAmount: phieuChi.totalAmount,
          paidAmount: phieuChi.paidAmount || 0,
          status: phieuChi.status,
          poIds: phieuChi.poIds || [],
          note: phieuChi.note,
          items: poItems
        }
      } else if (refType === 'PaymentProposal') {
        data = await mockAPI.getPaymentProposalById(refId)
      } else {
        // Load AR Document với SO items
        const arDoc = await mockAPI.getARDocumentById(refId)
        
        // Transform items nếu cần (đảm bảo format đúng)
        const soItems = (arDoc.items || []).map(item => ({
          id: item.id,
          maDon: item.maDon,
          customer: item.customer || arDoc.customer,
          createdDate: item.createdDate,
          amount: item.amount || 0,
          description: item.description || `Đơn hàng ${item.maDon}`,
          soStatus: item.soStatus
        }))
        
        data = {
          ...arDoc,
          items: soItems
        }
      }
      setDocumentData(data)
      // Auto-fill số tiền còn nợ
      if (data && data.totalAmount !== undefined) {
        const remaining = data.totalAmount - (data.paidAmount || 0)
        setSoTienThanhToan(remaining > 0 ? remaining : 0)
      }
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
      width: 120,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: loaiPhieu === 'CHI' ? 'Nhà cung cấp' : 'Khách hàng',
      dataIndex: loaiPhieu === 'CHI' ? 'supplier' : 'customer',
      key: 'partner',
      width: 200,
      ellipsis: true,
      render: (text) => <span>{text || documentData.supplier || documentData.customer}</span>
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 120,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'Số tiền (VNĐ)',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount) => (
        <span style={{ fontSize: 16, fontWeight: 500 }}>
          {(amount || 0).toLocaleString()}
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
    if (!soTienThanhToan || soTienThanhToan <= 0) {
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

  // Handler cho tạo mới phiếu
  const handleCreateNew = async () => {
    // Validation
    if (!noiDung.trim()) {
      message.error('Vui lòng nhập nội dung thanh toán!')
      return
    }
    if (!soTienThanhToan || soTienThanhToan <= 0) {
      message.error('Số tiền thanh toán phải lớn hơn 0!')
      return
    }
    if (phuongThuc === 'CHUYEN_KHOAN' && !billImage) {
      message.error('Thanh toán chuyển khoản bắt buộc phải upload Bill!')
      return
    }

    setSubmitting(true)
    try {
      const newPhieu = {
        id: `${loaiPhieu === 'CHI' ? 'pc' : 'pt'}-manual-${Date.now()}`,
        maPhieu: `${loaiPhieu === 'CHI' ? 'PC' : 'PT'}-M-${String(Date.now()).slice(-6)}`,
        loaiPhieu,
        ngayLap: new Date().toISOString().split('T')[0],
        noiDung: noiDung.trim(),
        doiTac: doiTac.trim(),
        supplier: loaiPhieu === 'CHI' ? doiTac.trim() : undefined,
        customer: loaiPhieu === 'THU' ? doiTac.trim() : undefined,
        ghiChu: ghiChu.trim(),
        note: noiDung.trim(),
        totalAmount: soTienThanhToan,
        paidAmount: 0,  // Chưa thanh toán - phải chờ duyệt
        soTien: soTienThanhToan,
        phuongThuc,
        billImage,
        status: 'CHO_DUYET',  // Trạng thái chờ duyệt
        isManual: true,
        createdBy: 'Kế toán',
        createdAt: new Date().toISOString()
      }
      
      // Save to mockAPI
      await mockAPI.createManualVoucher(newPhieu)
      
      message.success(`✅ Tạo ${loaiPhieu === 'CHI' ? 'Phiếu Chi' : 'Phiếu Thu'} thành công! Mã: ${newPhieu.maPhieu}. Đang chờ duyệt.`)
      
      setTimeout(() => {
        onBack()
      }, 500)
    } catch (error) {
      message.error('Lỗi: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // MODE: Create New
  if (isCreateNew) {
    return (
      <div style={{ padding: '24px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <div className="phieu-thu-chi-container">
          <Card className="phieu-thu-chi-card">
            {/* HEADER */}
            <div className="form-header">
              <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
                Quay lại
              </Button>
              <h2>
                {loaiPhieu === 'CHI' ? '💳 Tạo Phiếu Chi Mới' : '💰 Tạo Phiếu Thu Mới'}
              </h2>
            </div>

            <Alert
              message={`Tạo ${loaiPhieu === 'CHI' ? 'Đề xuất Chi' : 'Phiếu Thu'} mới`}
              description={`Phiếu này không liên kết với đề xuất thanh toán hay chứng từ công nợ. Sau khi tạo, phiếu sẽ ở trạng thái "Chờ duyệt" và cần được cấp trên phê duyệt trước khi thanh toán.`}
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            {/* Form tạo mới */}
            <Descriptions
              bordered
              column={1}
              className="document-info"
              styles={{ label: { fontWeight: 600, width: 180 } }}
            >
              <Descriptions.Item label="Nội dung thanh toán">
                <Input
                  placeholder={loaiPhieu === 'CHI' ? 'VD: Chi phí văn phòng phẩm, Chi trả tiền điện...' : 'VD: Thu tiền mặt bán hàng lẻ...'}
                  value={noiDung}
                  onChange={(e) => setNoiDung(e.target.value)}
                  style={{ width: '100%' }}
                />
              </Descriptions.Item>
              <Descriptions.Item label={loaiPhieu === 'CHI' ? 'Người nhận' : 'Người nộp'}>
                <Input
                  placeholder={loaiPhieu === 'CHI' ? 'Tên người/đơn vị nhận tiền' : 'Tên người/đơn vị nộp tiền'}
                  value={doiTac}
                  onChange={(e) => setDoiTac(e.target.value)}
                  style={{ width: '100%' }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền">
                <Space.Compact style={{ width: '100%' }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={100000}
                    value={soTienThanhToan}
                    onChange={(value) => setSoTienThanhToan(value || 0)}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    size="large"
                  />
                  <Button disabled style={{ pointerEvents: 'none' }}>VND</Button>
                </Space.Compact>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức">
                <Radio.Group
                  value={phuongThuc}
                  onChange={(e) => setPhuongThuc(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="TIEN_MAT">💵 Tiền mặt</Radio.Button>
                  <Radio.Button value="CHUYEN_KHOAN">🏦 Chuyển khoản</Radio.Button>
                </Radio.Group>
              </Descriptions.Item>
              {phuongThuc === 'CHUYEN_KHOAN' && (
                <Descriptions.Item label="Ảnh Bill">
                  <Upload
                    beforeUpload={(file) => {
                      const reader = new FileReader()
                      reader.onload = (e) => setBillImage(e.target.result)
                      reader.readAsDataURL(file)
                      return false
                    }}
                    maxCount={1}
                    accept="image/*"
                  >
                    <Button icon={<UploadOutlined />}>Upload ảnh Bill</Button>
                  </Upload>
                  {billImage && (
                    <Image src={billImage} alt="Bill" style={{ marginTop: 8, maxWidth: 200 }} />
                  )}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ghi chú">
                <Input.TextArea
                  placeholder="Ghi chú thêm (không bắt buộc)"
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  rows={3}
                />
              </Descriptions.Item>
            </Descriptions>

            {/* Button Submit */}
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Space size="middle">
                <PrintButton
                  templateId={loaiPhieu === 'CHI' ? 'PHIEU_CHI' : 'PHIEU_THU'}
                  templateName={loaiPhieu === 'CHI' ? 'Phiếu Chi' : 'Phiếu Thu'}
                  data={{
                    soPhieu: `${loaiPhieu === 'CHI' ? 'PC' : 'PT'}-M-${Date.now().toString().slice(-6)}`,
                    ngayLap: new Date().toISOString().split('T')[0],
                    nguoiNhan: doiTac || '',
                    nguoiNop: doiTac || '',
                    lyDo: noiDung || '',
                    soTien: soTienThanhToan || 0,
                    phuongThuc: phuongThuc,
                    ghiChu: ghiChu || ''
                  }}
                  config={getCompanyConfig()}
                  buttonText="🖨️ In phiếu"
                  buttonType="default"
                  buttonSize="large"
                  style={{ height: 50, fontSize: 16 }}
                />
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={handleCreateNew}
                  loading={submitting}
                  style={{ 
                    background: '#52c41a',
                    borderColor: '#52c41a',
                    height: 50,
                    fontSize: 16,
                    fontWeight: 600,
                    minWidth: 300
                  }}
                >
                  ✅ XÁC NHẬN TẠO {loaiPhieu === 'CHI' ? 'PHIẾU CHI' : 'PHIẾU THU'} ({soTienThanhToan.toLocaleString()} VND)
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return <Card loading={loading} />
  }

  if (!documentData) {
    return <Card>Không tìm thấy dữ liệu</Card>
  }

  const isLocked = isViewOnly || documentData.status === 'DA_THANH_TOAN' || documentData.status === 'DA_THU_TIEN'

  return (
    <div style={{ padding: '24px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
    <div className="phieu-thu-chi-container">
      <Card className="phieu-thu-chi-card">
        {/* HEADER */}
        <div className="form-header">
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Quay lại
          </Button>
          <h2>
            {loaiPhieu === 'CHI' ? '💳 Phiếu Chi' : '💰 Phiếu Thu'}
            {isLocked && <Tag color="green" style={{ marginLeft: 12, fontSize: 12 }}><LockOutlined /> ĐÃ KHÓA</Tag>}
          </h2>
        </div>

        {/* Alert chứng từ đã khóa */}
        {isLocked && (
          <Alert
            message="Chứng từ đã khóa"
            description="Phiếu này đã được thanh toán hoàn tất. Bạn chỉ có thể xem thông tin, không thể chỉnh sửa."
            type="success"
            showIcon
            icon={<LockOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Thông tin chứng từ gốc */}
        <Descriptions
          bordered
          column={2}
          className="document-info"
          styles={{ label: { fontWeight: 600 } }}
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
                    value={(documentData && documentData.totalAmount) ? documentData.totalAmount - (documentData.paidAmount || 0) : 0}
                    suffix="VND"
                    valueStyle={{ fontSize: 18, color: '#ff4d4f' }}
                    formatter={(value) => value.toLocaleString()}
                  />
                </Col>
              </Row>
              <Progress
                percent={documentData && documentData.totalAmount > 0 ? Math.round(((documentData.paidAmount || 0) / documentData.totalAmount) * 100) : 0}
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
              <Space.Compact style={{ width: '100%' }}>
                <InputNumber
                  value={soTienThanhToan}
                  onChange={setSoTienThanhToan}
                  min={1}
                  max={(documentData && documentData.totalAmount) ? documentData.totalAmount - (documentData.paidAmount || 0) : 0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  size="large"
                  style={{ width: '100%' }}
                  disabled={isLocked}
                />
                <Button size="large" disabled style={{ width: 70 }}>VND</Button>
              </Space.Compact>
              <div style={{ marginTop: 8, color: '#666' }}>
                Có thể thanh toán 1 phần. Số tiền tối đa: {((documentData && documentData.totalAmount) ? (documentData.totalAmount - (documentData.paidAmount || 0)) : 0).toLocaleString()} VND
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
                    disabled={isLocked}
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

            {/* Nút xác nhận và in */}
            <div className="action-section">
              <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
                <PrintButton
                  templateId={loaiPhieu === 'CHI' ? 'PHIEU_CHI' : 'PHIEU_THU'}
                  templateName={loaiPhieu === 'CHI' ? 'Phiếu Chi' : 'Phiếu Thu'}
                  data={{
                    soPhieu: documentData?.maChungTu || documentData?.maPhieu || documentData?.maDeXuat || '',
                    ngayLap: documentData?.ngayLap || new Date().toISOString().split('T')[0],
                    nguoiNhan: documentData?.supplier || documentData?.doiTac || documentData?.items?.[0]?.supplier || '',
                    nguoiNop: documentData?.customer || documentData?.doiTac || documentData?.items?.[0]?.customer || '',
                    diaChi: documentData?.diaChiNCC || documentData?.diaChiKH || documentData?.address || '',
                    lyDo: documentData?.noiDung || documentData?.note || 'Thanh toán công nợ',
                    soTien: soTienThanhToan || documentData?.totalAmount || 0,
                    phuongThuc: phuongThuc
                  }}
                  config={getCompanyConfig()}
                  buttonText="🖨️ In phiếu"
                  buttonType="default"
                  buttonSize="large"
                  style={{ height: 50, fontSize: 16 }}
                />
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={handleConfirm}
                  loading={submitting}
                  disabled={isLocked}
                  style={{ 
                    background: '#52c41a',
                    borderColor: '#52c41a',
                    height: 50,
                    fontSize: 16,
                    fontWeight: 600,
                    minWidth: 280
                  }}
                >
                  ✅ XÁC NHẬN THANH TOÁN {soTienThanhToan > 0 && `(${soTienThanhToan.toLocaleString()} VND)`}
                </Button>
              </Space>
            </div>
          </div>
        )}

        {/* Locked message */}
        {isLocked && (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Space>
              <Tag color="green" style={{ fontSize: 18, padding: '8px 16px' }}>
                ✅ Đã thanh toán - Chứng từ đã bị khóa
              </Tag>
                <PrintButton
                templateId={loaiPhieu === 'CHI' ? 'PHIEU_CHI' : 'PHIEU_THU'}
                templateName={loaiPhieu === 'CHI' ? 'Phiếu Chi' : 'Phiếu Thu'}
                data={{
                  soPhieu: documentData?.maChungTu || documentData?.maPhieu || documentData?.maDeXuat || '',
                  ngayLap: documentData?.ngayLap || new Date().toISOString().split('T')[0],
                  nguoiNhan: documentData?.supplier || documentData?.doiTac || documentData?.items?.[0]?.supplier || '',
                  nguoiNop: documentData?.customer || documentData?.doiTac || documentData?.items?.[0]?.customer || '',
                  lyDo: documentData?.noiDung || documentData?.note || 'Thanh toán công nợ',
                  soTien: soTienThanhToan || documentData?.totalAmount || 0,
                  phuongThuc: phuongThuc
                }}
                config={getCompanyConfig()}
                buttonText="In phiếu"
                buttonType="primary"
                buttonSize="large"
              />
            </Space>
          </div>
        )}
      </Card>
    </div>
    </div>
  )
}

export default PhieuThuChiForm
