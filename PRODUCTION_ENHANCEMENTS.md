# 🚀 PRODUCTION ENHANCEMENTS

## Các cải tiến cần thiết khi đưa lên production

---

## 1️⃣ State Management (Redux/Zustand)

### Cài đặt Zustand
```bash
npm install zustand
```

### Create Store
```javascript
// src/store/receiptPaymentStore.js
import { create } from 'zustand'

export const useReceiptPaymentStore = create((set, get) => ({
  // State
  receipts: [],
  currentReceipt: null,
  filters: {},
  loading: false,

  // Actions
  setReceipts: (receipts) => set({ receipts }),
  
  addReceipt: (receipt) => set((state) => ({
    receipts: [...state.receipts, receipt]
  })),

  updateReceipt: (id, updates) => set((state) => ({
    receipts: state.receipts.map(r => 
      r.id === id ? { ...r, ...updates } : r
    )
  })),

  setCurrentReceipt: (receipt) => set({ currentReceipt: receipt }),

  setFilters: (filters) => set({ filters }),

  setLoading: (loading) => set({ loading })
}))
```

---

## 2️⃣ React Query (Data Fetching)

### Cài đặt
```bash
npm install @tanstack/react-query
```

### Setup Provider
```javascript
// src/main.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
```

### Custom Hooks
```javascript
// src/hooks/useReceiptPayments.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

export const useReceiptPayments = (filters) => {
  return useQuery({
    queryKey: ['receiptPayments', filters],
    queryFn: () => api.getReceiptPayments(filters)
  })
}

export const useCreateReceiptPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => api.createReceiptPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['receiptPayments'])
    }
  })
}

export const useARAPDocuments = (partnerId, status) => {
  return useQuery({
    queryKey: ['arapDocuments', partnerId, status],
    queryFn: () => api.getARAPDocuments(partnerId, status),
    enabled: !!partnerId
  })
}
```

---

## 3️⃣ Error Handling & Logging

### Error Boundary
```javascript
// src/components/ErrorBoundary.jsx
import React from 'react'
import { Result, Button } from 'antd'

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error tracking service (Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="Có lỗi xảy ra"
          subTitle={this.state.error?.message}
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              Tải lại trang
            </Button>
          }
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
```

### Sentry Integration
```bash
npm install @sentry/react
```

```javascript
// src/main.jsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0
})
```

---

## 4️⃣ API Service Layer

### Axios Instance
```javascript
// src/services/api.js
import axios from 'axios'
import { message } from 'antd'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra'
    
    if (error.response?.status === 401) {
      message.error('Phiên đăng nhập hết hạn')
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else {
      message.error(errorMessage)
    }

    return Promise.reject(error)
  }
)

export default api
```

---

## 5️⃣ Form với React Hook Form

### Cài đặt
```bash
npm install react-hook-form
```

### Usage
```javascript
// src/components/ReceiptPaymentFormV2.jsx
import { useForm, Controller } from 'react-hook-form'

const ReceiptPaymentFormV2 = () => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      type: 'THU',
      amount: 0
    }
  })

  const onSubmit = async (data) => {
    // Submit logic
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="amount"
        control={control}
        rules={{ 
          required: 'Vui lòng nhập số tiền',
          min: { value: 1, message: 'Số tiền phải lớn hơn 0' }
        }}
        render={({ field }) => (
          <InputNumber 
            {...field} 
            style={{ width: '100%' }}
            status={errors.amount ? 'error' : ''}
          />
        )}
      />
      {errors.amount && <span>{errors.amount.message}</span>}
    </form>
  )
}
```

---

## 6️⃣ Testing

### Unit Tests (Vitest)
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```javascript
// src/utils/__tests__/validators.test.js
import { describe, it, expect } from 'vitest'
import { businessValidators } from '../validators'

describe('Validators', () => {
  it('should reject amount exceeding debt', () => {
    const result = businessValidators.checkDebtLimit(100000000, { balance: 50000000 })
    expect(result.valid).toBe(false)
    expect(result.severity).toBe('error')
  })

  it('should accept amount within debt limit', () => {
    const result = businessValidators.checkDebtLimit(30000000, { balance: 50000000 })
    expect(result.valid).toBe(true)
  })
})
```

### E2E Tests (Playwright)
```bash
npm install -D @playwright/test
```

```javascript
// tests/e2e/receipt-payment.spec.js
import { test, expect } from '@playwright/test'

test('should create receipt payment successfully', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  // Fill form
  await page.fill('input[name="amount"]', '50000000')
  await page.selectOption('select[name="partnerId"]', 'KH001')
  
  // Submit
  await page.click('button[type="submit"]')
  
  // Check success message
  await expect(page.locator('.ant-message-success')).toBeVisible()
})
```

---

## 7️⃣ Performance Optimization

### Code Splitting
```javascript
// src/App.jsx
import { lazy, Suspense } from 'react'

const ReceiptPaymentForm = lazy(() => import('./components/ReceiptPaymentForm'))
const ReceiptPaymentList = lazy(() => import('./components/ReceiptPaymentList'))

function App() {
  return (
    <Suspense fallback={<Spin size="large" />}>
      <Routes>
        <Route path="/" element={<ReceiptPaymentList />} />
        <Route path="/create" element={<ReceiptPaymentForm />} />
      </Routes>
    </Suspense>
  )
}
```

### Memoization
```javascript
import { useMemo, useCallback } from 'react'

const ReceiptPaymentList = () => {
  const columns = useMemo(() => [
    // Column definitions
  ], [])

  const handleView = useCallback((record) => {
    // View logic
  }, [])

  return <Table columns={columns} onRow={(record) => ({ onClick: () => handleView(record) })} />
}
```

### Virtual Scrolling
```bash
npm install react-window
```

---

## 8️⃣ Security

### XSS Prevention
```javascript
import DOMPurify from 'dompurify'

const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input)
}
```

### CSRF Protection
```javascript
// Add CSRF token to all requests
api.interceptors.request.use((config) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken
  }
  return config
})
```

---

## 9️⃣ SEO & Meta Tags

```javascript
// src/hooks/usePageMeta.js
import { useEffect } from 'react'

export const usePageMeta = (title, description) => {
  useEffect(() => {
    document.title = `${title} | ERP System`
    
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.content = description
    }
  }, [title, description])
}
```

---

## 🔟 PWA Support

### manifest.json
```json
{
  "name": "ERP - Phiếu Thu Chi",
  "short_name": "ERP",
  "description": "Hệ thống quản lý phiếu thu chi",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1890ff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker (vite-plugin-pwa)
```bash
npm install -D vite-plugin-pwa
```

```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})
```

---

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints updated
- [ ] Sentry error tracking enabled
- [ ] Analytics (Google Analytics) integrated
- [ ] Performance monitoring (Lighthouse)
- [ ] Security headers configured
- [ ] SSL certificate installed
- [ ] CDN configured for static assets
- [ ] Gzip/Brotli compression enabled
- [ ] Cache headers configured
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Backup strategy in place
- [ ] Monitoring & alerts setup
- [ ] Documentation updated

---

**🎉 Production Ready!**
