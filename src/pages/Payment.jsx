import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PACKAGES, createPaymentOrder } from '../utils/paymentAdapter'
import Button from '../components/Button'

function Payment() {
  const navigate = useNavigate()
  const [loadingPackage, setLoadingPackage] = useState(null)
  const [configError, setConfigError] = useState(null)

  // 注意：现在使用后端 API，前端不需要检查环境变量
  // 配置检查在后端完成

  const handlePurchase = async (packageType) => {
    if (configError) {
      alert(configError)
      return
    }

    setLoadingPackage(packageType)
    try {
      const returnUrl = `${window.location.origin}/payment/result`
      const paymentUrl = await createPaymentOrder(packageType, returnUrl)
      
      // 跳转到支付页面
      window.location.href = paymentUrl
    } catch (error) {
      console.error('创建订单失败:', error)
      alert(error.message || '创建订单失败，请稍后重试')
      setLoadingPackage(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        选择套餐
      </h1>

      {/* 配置错误提示 */}
      {configError && (
        <div className="mb-6 card bg-red-50 border-red-200">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900 mb-1">支付配置未完成</h3>
              <p className="text-sm text-red-800">{configError}</p>
              <p className="text-sm text-red-700 mt-2">
                请参考项目根目录的 <code className="bg-red-100 px-1 rounded">.env.example</code> 文件配置环境变量
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(PACKAGES).map(([key, pkg]) => (
          <div
            key={key}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{pkg.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary-600">
                  ¥{pkg.price}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-6">
                {pkg.days
                  ? `有效期：${pkg.days} 天`
                  : '有效期：永久'}
              </div>
              <Button
                onClick={() => handlePurchase(key)}
                loading={loadingPackage === key}
                className="w-full"
              >
                立即购买
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">支付说明</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 支付成功后，系统将自动激活您的套餐</li>
          <li>• 套餐激活后即可使用所有功能</li>
          <li>• 如有问题，请联系客服</li>
        </ul>
      </div>
    </div>
  )
}

export default Payment
