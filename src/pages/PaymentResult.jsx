import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { queryOrderStatus } from '../utils/paymentAdapter'
import Button from '../components/Button'

function PaymentResult() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('checking') // checking, success, failed
  const [message, setMessage] = useState('正在确认支付结果...')

  useEffect(() => {
    checkPaymentStatus()
  }, [])

  const checkPaymentStatus = async () => {
    // 从URL获取订单号
    const orderId = searchParams.get('order_id') || 
                   searchParams.get('trade_order_id')

    if (!orderId) {
      setStatus('failed')
      setMessage('订单号丢失，请联系客服')
      return
    }

    try {
      // 查询订单状态
      const result = await queryOrderStatus(orderId)
      
      if (result.success && result.data.status === 'paid') {
        setStatus('success')
        setMessage('支付成功！您的套餐已激活')
      } else {
        // 支付可能还在处理中，等待几秒后重试
        setTimeout(() => {
          setStatus('failed')
          setMessage('支付确认中，请稍后在"我的订单"中查看')
        }, 3000)
      }
    } catch (error) {
      console.error('查询支付状态失败:', error)
      setStatus('failed')
      setMessage('无法确认支付状态，请稍后在"我的订单"中查看')
    }
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="card">
        {status === 'checking' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
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
              <Button onClick={() => navigate('/dashboard')} variant="secondary" className="w-full">
                查看我的套餐
              </Button>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">支付确认中</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/payment')} className="w-full">
                重新购买
              </Button>
              <Button onClick={() => navigate('/')} variant="secondary" className="w-full">
                返回首页
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentResult
