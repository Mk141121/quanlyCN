import React from 'react'
import { Alert, Space } from 'antd'
import { 
  ExclamationCircleOutlined, 
  WarningOutlined, 
  InfoCircleOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons'

const ValidationAlert = ({ errors, style }) => {
  if (!errors || errors.length === 0) return null

  const getIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <ExclamationCircleOutlined />
      case 'warning':
        return <WarningOutlined />
      case 'info':
        return <InfoCircleOutlined />
      case 'success':
        return <CheckCircleOutlined />
      default:
        return <InfoCircleOutlined />
    }
  }

  const getType = (severity) => {
    switch (severity) {
      case 'error':
        return 'error'
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      case 'success':
        return 'success'
      default:
        return 'info'
    }
  }

  return (
    <Space direction="vertical" style={{ width: '100%', ...style }}>
      {errors.map((error, index) => (
        <Alert
          key={index}
          message={error.message}
          type={getType(error.severity || error.type)}
          showIcon
          icon={getIcon(error.severity || error.type)}
        />
      ))}
    </Space>
  )
}

export default ValidationAlert
