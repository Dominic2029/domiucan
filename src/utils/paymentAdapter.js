/**
 * 支付适配器 - 支持多种支付 API
 * 通过环境变量 VITE_PAYMENT_PROVIDER 切换支付方式
 * 可选值: 'hupijiao' | 'stripe' | 'alipay' | 'wechat' | 'paypal' | 'custom'
 */

import { createPaymentOrder as hupijiaoCreateOrder, queryPaymentStatus as hupijiaoQueryStatus } from './payment'
// 可以导入其他支付方式的实现
// import { createPaymentOrder as stripeCreateOrder, queryPaymentStatus as stripeQueryStatus } from './paymentStripe'
// import { createPaymentOrder as alipayCreateOrder, queryPaymentStatus as alipayQueryStatus } from './paymentAlipay'

const PAYMENT_PROVIDER = import.meta.env.VITE_PAYMENT_PROVIDER || 'hupijiao'

/**
 * 创建支付订单（统一接口）
 * @param {string} packageType - 套餐类型
 * @param {string} returnUrl - 支付成功回调 URL
 * @returns {Promise<string>} 支付链接
 */
export async function createPaymentOrder(packageType, returnUrl) {
  switch (PAYMENT_PROVIDER) {
    case 'hupijiao':
      return await hupijiaoCreateOrder(packageType, returnUrl)
    
    case 'stripe':
      // TODO: 实现 Stripe 支付
      // return await stripeCreateOrder(packageType, returnUrl)
      throw new Error('Stripe 支付暂未实现，请参考 paymentStripe.js 示例')
    
    case 'alipay':
      // TODO: 实现支付宝支付
      // return await alipayCreateOrder(packageType, returnUrl)
      throw new Error('支付宝支付暂未实现，请参考 paymentAlipay.js 示例')
    
    case 'wechat':
      // TODO: 实现微信支付
      // return await wechatCreateOrder(packageType, returnUrl)
      throw new Error('微信支付暂未实现，请参考 paymentWechat.js 示例')
    
    case 'paypal':
      // TODO: 实现 PayPal 支付
      // return await paypalCreateOrder(packageType, returnUrl)
      throw new Error('PayPal 支付暂未实现，请参考 paymentPaypal.js 示例')
    
    case 'custom':
      // TODO: 实现自定义支付接口
      // return await customCreateOrder(packageType, returnUrl)
      throw new Error('自定义支付接口暂未实现')
    
    default:
      throw new Error(`不支持的支付方式: ${PAYMENT_PROVIDER}`)
  }
}

/**
 * 查询支付状态（统一接口）
 * @param {string} orderId - 订单 ID
 * @returns {Promise<Object>} 支付状态 { status: 'paid' | 'pending' | 'failed', ... }
 */
export async function queryPaymentStatus(orderId) {
  switch (PAYMENT_PROVIDER) {
    case 'hupijiao':
      return await hupijiaoQueryStatus(orderId)
    
    case 'stripe':
      // TODO: 实现 Stripe 查询
      // return await stripeQueryStatus(orderId)
      throw new Error('Stripe 支付查询暂未实现')
    
    case 'alipay':
      // TODO: 实现支付宝查询
      // return await alipayQueryStatus(orderId)
      throw new Error('支付宝支付查询暂未实现')
    
    case 'wechat':
      // TODO: 实现微信支付查询
      // return await wechatQueryStatus(orderId)
      throw new Error('微信支付查询暂未实现')
    
    case 'paypal':
      // TODO: 实现 PayPal 查询
      // return await paypalQueryStatus(orderId)
      throw new Error('PayPal 支付查询暂未实现')
    
    case 'custom':
      // TODO: 实现自定义支付查询
      // return await customQueryStatus(orderId)
      throw new Error('自定义支付查询暂未实现')
    
    default:
      throw new Error(`不支持的支付方式: ${PAYMENT_PROVIDER}`)
  }
}

export { PACKAGES } from './payment'
