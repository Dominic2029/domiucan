import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

function PaymentResult() {
  const navigate = useNavigate()
  const [status] = useState('success')
  const [message] = useState('支付成功！您的套餐已激活')

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="card">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">支付成功！</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="space-y-3">
          <Button onClick={() => navigate('/')} className="w-full">
            返回首页
          </Button>
          <Button onClick={() => navigate('/settings')} variant="secondary" className="w-full">
            前往设置
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PaymentResult
