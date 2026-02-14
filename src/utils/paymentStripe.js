/**
 * Stripe 支付实现示例
 * 参考文档: https://stripe.com/docs/payments/checkout
 */

import axios from 'axios'
import { PACKAGES } from './payment'

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY || ''
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * 创建 Stripe 支付订单
 * @param {string} packageType - 套餐类型
 * @param {string} returnUrl - 支付成功回调 URL
 * @returns {Promise<string>} 支付链接（Checkout Session URL）
 */
export async function createPaymentOrder(packageType, returnUrl) {
  const packageInfo = PACKAGES[packageType]
  if (!packageInfo) {
    throw new Error('无效的套餐类型')
  }

  // 方式1: 通过后端创建 Checkout Session（推荐，更安全）
  try {
    const response = await axios.post(`${API_BASE_URL}/api/payment/stripe/create-session`, {
      packageType,
      amount: packageInfo.price * 100, // Stripe 使用分为单位
      currency: 'cny',
      successUrl: returnUrl,
      cancelUrl: `${window.location.origin}/payment`,
    })

    return response.data.url // Checkout Session URL
  } catch (error) {
    throw new Error(error.response?.data?.message || '创建支付订单失败')
  }

  // 方式2: 直接在前端使用 Stripe.js（需要加载 Stripe.js 库）
  // import { loadStripe } from '@stripe/stripe-js'
  // const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY)
  // const { error, session } = await stripe.redirectToCheckout({
  //   lineItems: [{
  //     price: 'price_xxx', // 需要在 Stripe Dashboard 创建 Price
  //     quantity: 1,
  //   }],
  //   mode: 'payment',
  //   successUrl: returnUrl,
  //   cancelUrl: `${window.location.origin}/payment`,
  // })
  // if (error) throw error
  // return session.url
}

/**
 * 查询 Stripe 支付状态
 * @param {string} orderId - 订单 ID 或 Session ID
 * @returns {Promise<Object>} 支付状态
 */
export async function queryPaymentStatus(orderId) {
  try {
    // 通过后端查询（推荐）
    const response = await axios.get(`${API_BASE_URL}/api/payment/stripe/status`, {
      params: { sessionId: orderId },
    })

    const { status, paymentStatus } = response.data

    // Stripe 支付状态映射
    const statusMap = {
      paid: 'paid',
      unpaid: 'pending',
      canceled: 'failed',
    }

    return {
      status: statusMap[paymentStatus] || 'pending',
      trade_order_id: orderId,
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || '查询支付状态失败')
  }
}
