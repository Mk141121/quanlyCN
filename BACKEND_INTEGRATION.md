# 🔌 BACKEND INTEGRATION GUIDE

## Kiến trúc hệ thống

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   React Frontend│──────▶│   API Gateway   │──────▶│  ERP Backend    │
│   (Ant Design)  │       │   (REST/GraphQL)│       │   Services      │
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                  │                           │
                                  │                           │
                          ┌───────▼───────┐         ┌─────────▼──────┐
                          │  Auth Service  │         │   Database     │
                          │  (JWT/OAuth)   │         │   (PostgreSQL) │
                          └────────────────┘         └────────────────┘
```

---

## 📋 Database Schema

### Table: `receipt_payments`
```sql
CREATE TABLE receipt_payments (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,  -- Auto-generated: PT-2024-001, PC-2024-001
    type VARCHAR(10) NOT NULL,         -- 'THU' or 'CHI'
    amount DECIMAL(18,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    
    object_type VARCHAR(20) NOT NULL,  -- 'KHACH_HANG' or 'NHA_CUNG_CAP'
    partner_id VARCHAR(50) NOT NULL,
    
    payment_method VARCHAR(20),        -- 'TIEN_MAT' or 'CHUYEN_KHOAN'
    has_invoice BOOLEAN DEFAULT FALSE,
    
    reason TEXT,
    note TEXT,
    
    status VARCHAR(20) NOT NULL,       -- 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED'
    
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(50) NOT NULL,
    approved_at TIMESTAMP,
    approved_by VARCHAR(50),
    
    FOREIGN KEY (partner_id) REFERENCES partners(id)
);
```

### Table: `receipt_payment_documents`
```sql
CREATE TABLE receipt_payment_documents (
    id VARCHAR(50) PRIMARY KEY,
    receipt_payment_id VARCHAR(50) NOT NULL,
    ar_ap_document_id VARCHAR(50) NOT NULL,
    allocated_amount DECIMAL(18,2) NOT NULL,
    
    FOREIGN KEY (receipt_payment_id) REFERENCES receipt_payments(id),
    FOREIGN KEY (ar_ap_document_id) REFERENCES ar_ap_documents(id)
);
```

### Table: `receipt_payment_attachments`
```sql
CREATE TABLE receipt_payment_attachments (
    id VARCHAR(50) PRIMARY KEY,
    receipt_payment_id VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (receipt_payment_id) REFERENCES receipt_payments(id)
);
```

### Table: `ar_ap_documents`
```sql
CREATE TABLE ar_ap_documents (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    partner_id VARCHAR(50) NOT NULL,
    document_type VARCHAR(20) NOT NULL,  -- 'INVOICE', 'ORDER', 'CONTRACT'
    
    date DATE NOT NULL,
    due_date DATE,
    
    total_amount DECIMAL(18,2) NOT NULL,
    paid_amount DECIMAL(18,2) DEFAULT 0,
    remaining_amount DECIMAL(18,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    
    status VARCHAR(20) NOT NULL,  -- 'CHO_THU', 'CHO_CHI', 'DA_THANH_TOAN', 'QUA_HAN'
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (partner_id) REFERENCES partners(id)
);
```

### Table: `partners`
```sql
CREATE TABLE partners (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,  -- 'KHACH_HANG' or 'NHA_CUNG_CAP'
    
    tax_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    
    total_debt DECIMAL(18,2) DEFAULT 0,  -- Tổng công nợ hiện tại
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 API Endpoints (REST)

### 1. Authentication
```
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### 2. Partners
```
GET    /api/partners?type=KHACH_HANG&search=abc
GET    /api/partners/:id
GET    /api/partners/:id/debt
POST   /api/partners
PUT    /api/partners/:id
DELETE /api/partners/:id
```

### 3. AR/AP Documents
```
GET    /api/ar-ap-documents?partnerId=KH001&status=CHO_THU
GET    /api/ar-ap-documents/:id
POST   /api/ar-ap-documents
PUT    /api/ar-ap-documents/:id
```

### 4. Receipt/Payment (CORE)
```
GET    /api/receipt-payments
GET    /api/receipt-payments/:id
POST   /api/receipt-payments           ✅ Tạo phiếu mới
PUT    /api/receipt-payments/:id       ❌ Chỉ update note/status
DELETE /api/receipt-payments/:id       ❌ Soft delete only
POST   /api/receipt-payments/:id/approve
POST   /api/receipt-payments/:id/reject
```

---

## 📝 API Detailed Specs

### POST /api/receipt-payments

**Request Body:**
```json
{
  "type": "THU",
  "amount": 50000000,
  "currency": "VND",
  "objectType": "KHACH_HANG",
  "partnerId": "KH001",
  "paymentMethod": "CHUYEN_KHOAN",
  "hasInvoice": true,
  "reason": "Thu tiền hóa đơn tháng 1",
  "note": "Khách hàng chuyển khoản",
  "documents": [
    {
      "arApDocumentId": "AR001",
      "allocatedAmount": 50000000
    }
  ],
  "attachments": [
    {
      "fileName": "chuyen-khoan.pdf",
      "fileData": "base64_encoded_string"
    }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "RP-2024-001",
    "code": "PT-2024-001",
    "type": "THU",
    "amount": 50000000,
    "status": "PENDING_APPROVAL",
    "createdAt": "2024-01-07T10:00:00Z",
    "createdBy": "user001"
  }
}
```

**Response (Validation Error):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Số tiền vượt công nợ",
    "details": {
      "field": "amount",
      "currentDebt": 30000000,
      "requestedAmount": 50000000
    }
  }
}
```

---

## ⚙️ Business Logic (Backend)

### Validation Rules

```javascript
// middleware/validateReceiptPayment.js

exports.validate = async (req, res, next) => {
  const { partnerId, amount, paymentMethod, attachments } = req.body;

  // 1. Check partner exists
  const partner = await Partner.findById(partnerId);
  if (!partner) {
    return res.status(404).json({
      success: false,
      error: { message: 'Không tìm thấy đối tác' }
    });
  }

  // 2. Check debt limit
  const debt = await getPartnerDebt(partnerId);
  if (amount > debt.balance) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'EXCEED_DEBT_LIMIT',
        message: `Số tiền vượt công nợ (${debt.balance} VND)`,
        details: { currentDebt: debt.balance, requestedAmount: amount }
      }
    });
  }

  // 3. Check bank transfer attachment
  if (paymentMethod === 'CHUYEN_KHOAN' && (!attachments || attachments.length === 0)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_ATTACHMENT',
        message: 'Thanh toán chuyển khoản cần upload chứng từ'
      }
    });
  }

  next();
};
```

### Auto Generate Code

```javascript
// utils/codeGenerator.js

exports.generateCode = async (type) => {
  const prefix = type === 'THU' ? 'PT' : 'PC';
  const year = new Date().getFullYear();
  
  const lastReceipt = await ReceiptPayment.findOne({
    code: { $regex: `^${prefix}-${year}-` }
  }).sort({ code: -1 });

  let sequence = 1;
  if (lastReceipt) {
    const lastSequence = parseInt(lastReceipt.code.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `${prefix}-${year}-${sequence.toString().padStart(4, '0')}`;
  // Example: PT-2024-0001, PC-2024-0002
};
```

### Update AR/AP Documents

```javascript
// services/receiptPaymentService.js

exports.createReceiptPayment = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Generate code
    const code = await codeGenerator.generateCode(data.type);

    // 2. Create receipt/payment
    const receipt = await ReceiptPayment.create([{
      ...data,
      code,
      status: 'PENDING_APPROVAL'
    }], { session });

    // 3. Update AR/AP documents
    for (const doc of data.documents) {
      await ARAPDocument.findByIdAndUpdate(
        doc.arApDocumentId,
        {
          $inc: { paidAmount: doc.allocatedAmount }
        },
        { session }
      );

      // Check if fully paid
      const updatedDoc = await ARAPDocument.findById(doc.arApDocumentId).session(session);
      if (updatedDoc.remainingAmount === 0) {
        updatedDoc.status = 'DA_THANH_TOAN';
        await updatedDoc.save({ session });
      }
    }

    // 4. Update partner debt
    await Partner.findByIdAndUpdate(
      data.partnerId,
      {
        $inc: { total_debt: -data.amount }
      },
      { session }
    );

    await session.commitTransaction();
    return receipt[0];

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

---

## 🔔 Workflow & Notifications

### Approval Workflow

```javascript
// routes/receiptPayments.js

router.post('/:id/approve', async (req, res) => {
  const receipt = await ReceiptPayment.findById(req.params.id);
  
  if (receipt.status !== 'PENDING_APPROVAL') {
    return res.status(400).json({
      success: false,
      error: { message: 'Phiếu không ở trạng thái chờ duyệt' }
    });
  }

  receipt.status = 'APPROVED';
  receipt.approvedBy = req.user.id;
  receipt.approvedAt = new Date();
  await receipt.save();

  // Send notification
  await notificationService.send({
    userId: receipt.createdBy,
    type: 'RECEIPT_APPROVED',
    title: `Phiếu ${receipt.code} đã được phê duyệt`,
    url: `/receipts/${receipt.id}`
  });

  res.json({ success: true, data: receipt });
});
```

### Email Notification (NodeMailer)

```javascript
// services/emailService.js

exports.sendReceiptCreated = async (receipt, user) => {
  const mailOptions = {
    from: 'erp@company.com',
    to: 'accountant@company.com',
    subject: `[ERP] Phiếu ${receipt.type === 'THU' ? 'thu' : 'chi'} mới: ${receipt.code}`,
    html: `
      <h2>Phiếu ${receipt.type === 'THU' ? 'thu' : 'chi'} mới cần duyệt</h2>
      <p><strong>Mã phiếu:</strong> ${receipt.code}</p>
      <p><strong>Số tiền:</strong> ${receipt.amount.toLocaleString()} VND</p>
      <p><strong>Người tạo:</strong> ${user.name}</p>
      <p><strong>Lý do:</strong> ${receipt.reason}</p>
      <a href="https://erp.company.com/receipts/${receipt.id}">Xem chi tiết</a>
    `
  };

  await transporter.sendMail(mailOptions);
};
```

---

## 🔒 Security Best Practices

### 1. Authentication
```javascript
// middleware/auth.js

exports.requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 2. Authorization (RBAC)
```javascript
// middleware/permission.js

exports.canApprove = (req, res, next) => {
  if (!['ACCOUNTANT', 'DIRECTOR'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Không có quyền phê duyệt' });
  }
  next();
};
```

### 3. Input Sanitization
```javascript
// middleware/sanitize.js

const { body } = require('express-validator');

exports.sanitizeReceiptPayment = [
  body('amount').isFloat({ min: 1 }).toFloat(),
  body('type').isIn(['THU', 'CHI']),
  body('paymentMethod').isIn(['TIEN_MAT', 'CHUYEN_KHOAN']),
  body('reason').trim().escape(),
  body('note').trim().escape()
];
```

---

## 📊 Performance Optimization

### 1. Database Indexing
```sql
CREATE INDEX idx_receipt_payments_partner ON receipt_payments(partner_id);
CREATE INDEX idx_receipt_payments_status ON receipt_payments(status);
CREATE INDEX idx_receipt_payments_created_at ON receipt_payments(created_at DESC);
CREATE INDEX idx_ar_ap_documents_partner_status ON ar_ap_documents(partner_id, status);
```

### 2. Caching (Redis)
```javascript
// cache/partnerDebt.js

exports.getPartnerDebt = async (partnerId) => {
  const cacheKey = `partner:${partnerId}:debt`;
  
  // Try cache first
  let debt = await redis.get(cacheKey);
  if (debt) {
    return JSON.parse(debt);
  }

  // Calculate from DB
  debt = await calculatePartnerDebt(partnerId);
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(debt));
  
  return debt;
};
```

---

## 🧪 Testing

### Unit Test (Jest)
```javascript
// tests/receiptPayment.test.js

describe('ReceiptPayment Creation', () => {
  it('should create receipt payment successfully', async () => {
    const data = {
      type: 'THU',
      amount: 50000000,
      partnerId: 'KH001'
    };

    const receipt = await receiptPaymentService.create(data);
    
    expect(receipt.code).toMatch(/^PT-\d{4}-\d{4}$/);
    expect(receipt.status).toBe('PENDING_APPROVAL');
  });

  it('should reject if exceed debt limit', async () => {
    const data = {
      type: 'THU',
      amount: 100000000,  // Exceed debt
      partnerId: 'KH001'
    };

    await expect(receiptPaymentService.create(data))
      .rejects.toThrow('Số tiền vượt công nợ');
  });
});
```

---

## 🚀 Deployment Checklist

- [ ] Environment variables configured (.env)
- [ ] Database migrations run
- [ ] Redis server running
- [ ] S3/Storage for file uploads
- [ ] Email service configured
- [ ] SSL certificate installed
- [ ] Rate limiting enabled
- [ ] Error tracking (Sentry)
- [ ] Logging (Winston)
- [ ] Monitoring (PM2)

---

**🎉 Backend Ready!**
