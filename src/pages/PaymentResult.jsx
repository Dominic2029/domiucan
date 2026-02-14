import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { queryPaymentStatus } from '../utils/paymentAdapter'
import { handlePaymentSuccess } from '../utils/payment'
import Cookies from 'js-cookie'
import Button from '../components/Button'

function PaymentResult() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { dispatch } = useAppContext()
  const [status, setStatus] = useState('checking') // checking | success | failed
  const [orderId, setOrderId] = useState(null)
  const [packageType, setPackageType] = useState(null)

  useEffect(() => {
    const orderIdParam = searchParams.get('order_id')
    const packageParam = searchParams.get('package')
    const statusParam = searchParams.get('status')

    if (orderIdParam && packageParam) {
      setOrderId(orderIdParam)
      setPackageType(packageParam)
      
      if (statusParam === 'success') {
        // 模拟查询支付状态（实际应调用真实接口）
        checkPaymentStatus(orderIdParam, packageParam)
      } else {
        setStatus('failed')
      }
    } else {
      setStatus('failed')
    }
  }, [searchParams])

  // 查询支付状态
  const checkPaymentStatus = async (orderId, packageType) => {
    try {
      // 轮询查询支付状态
      const maxAttempts = 10
      let attempts = 0

      const poll = async () => {
        attempts++
        const result = await queryPaymentStatus(orderId)
        
        if (result.status === 'paid') {
          // 支付成功，处理支付结果
          const paymentInfo = handlePaymentSuccess(packageType, orderId)
          
          // 更新全局状态
          dispatch({
            type: 'SET_PAYMENT_STATUS',
            payload: {
              isPaid: true,
              packageType: paymentInfo.packageType,
              expireTime: paymentInfo.expireTime,
              remainingDays: paymentInfo.remainingDays,
            },
          })

          setStatus('success')
        } else if (result.status === 'pending' && attempts < maxAttempts) {
          // 继续轮询（仅当状态为 pending 时）
          setTimeout(poll, 2000)
        } else {
          // 支付失败或超时
          setStatus('failed')
        }
      }

      poll()
    } catch (error) {
      console.error('查询支付状态失败:', error)
      setStatus('failed')
    }
  }

  if (status === 'checking') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">正在验证支付状态...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            支付成功！
          </h2>
          <p className="text-gray-600 mb-6">
            您的套餐已激活，现在可以使用所有功能了
          </p>
        </div>
        <Button onClick={() => navigate('/generator')}>
          开始使用
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <div className="mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          支付失败
        </h2>
        <p className="text-gray-600 mb-6">
          支付未完成，请重试或联系客服
        </p>
      </div>
      <div className="flex justify-center space-x-4">
        <Button onClick={() => navigate('/payment')} variant="primary">
          重新支付
        </Button>
        <Button onClick={() => navigate('/generator')} variant="secondary">
          返回首页
        </Button>
      </div>
    </div>
  )
}

export default PaymentResult
