import { useState } from 'react'
import { PACKAGES, createPaymentOrder } from '../utils/paymentAdapter'
import Button from '../components/Button'

function Payment() {
  const [loadingPackage, setLoadingPackage] = useState(null)

  const handlePurchase = async (packageType) => {
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
