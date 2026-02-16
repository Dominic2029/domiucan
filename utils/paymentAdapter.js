// 套餐配置
export const PACKAGES = {
  basic: {
    name: '基础版',
    price: 9.9,
    days: 30,
    description: '基础功能'
  },
  pro: {
    name: '专业版',
    price: 29.9,
    days: 90,
    description: '专业功能'
  },
  premium: {
    name: '高级版',
    price: 99.9,
    days: 365,
    description: '全部功能'
  },
  lifetime: {
    name: '终身版',
    price: 299,
    days: null,
    description: '永久使用'
  }
}

/**
 * 创建支付订单
 * @param {string} packageType - 套餐类型 (basic/pro/premium/lifetime)
 * @param {string} returnUrl - 支付完成后的返回地址
 * @returns {Promise<string>} 支付页面URL
 */
export async function createPaymentOrder(packageType, returnUrl) {
  try {
    const pkg = PACKAGES[packageType]
    if (!pkg) {
      throw new Error('无效的套餐类型')
    }

    // 生成唯一订单号
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 调用后端 API 创建订单
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId,
        money: pkg.price.toString(),
        title: `购买${pkg.name} - ${pkg.description}`,
        package_type: packageType,
        return_url: returnUrl
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '创建订单失败')
    }

    const result = await response.json()

    if (!result.success || !result.data?.url) {
      throw new Error('获取支付链接失败')
    }

    // 返回支付页面URL
    return result.data.url

  } catch (error) {
    console.error('创建支付订单失败:', error)
    throw error
  }
}

/**
 * 查询订单状态
 * @param {string} orderId - 订单号
 * @returns {Promise<Object>} 订单信息
 */
export async function queryOrderStatus(orderId) {
  try {
    const response = await fetch(`/api/query-order?order_id=${orderId}`, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error('查询订单失败')
    }

    return await response.json()
  } catch (error) {
    console.error('查询订单状态失败:', error)
    throw error
  }
}
