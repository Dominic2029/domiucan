/**
 * 支付宝支付实现示例
 * 参考文档: https://opendocs.alipay.com/
 */

import axios from 'axios'
import CryptoJS from 'crypto-js' // 需要安装: npm install crypto-js
import { PACKAGES } from './payment'

const ALIPAY_APP_ID = import.meta.env.VITE_ALIPAY_APP_ID || ''
const ALIPAY_PRIVATE_KEY = import.meta.env.VITE_ALIPAY_PRIVATE_KEY || ''
const ALIPAY_PUBLIC_KEY = import.meta.env.VITE_ALIPAY_PUBLIC_KEY || ''
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * 创建支付宝支付订单
 * @param {string} packageType - 套餐类型
 * @param {string} returnUrl - 支付成功回调 URL
 * @returns {Promise<string>} 支付链接
 */
export async function createPaymentOrder(packageType, returnUrl) {
  const packageInfo = PACKAGES[packageType]
  if (!packageInfo) {
    throw new Error('无效的套餐类型')
  }

  // 方式1: 通过后端创建订单（推荐，更安全）
  try {
    const response = await axios.post(`${API_BASE_URL}/api/payment/alipay/create-order`, {
      packageType,
      amount: packageInfo.price,
      subject: packageInfo.name,
      returnUrl,
      notifyUrl: `${API_BASE_URL}/api/payment/alipay/notify`,
    })

    return response.data.paymentUrl // 支付宝支付链接
  } catch (error) {
    throw new Error(error.response?.data?.message || '创建支付订单失败')
  }

  // 方式2: 使用支付宝手机网站支付（需要后端支持）
  // 前端调用后端接口，后端调用支付宝 API 生成支付表单
}

/**
 * 查询支付宝支付状态
 * @param {string} orderId - 订单 ID
 * @returns {Promise<Object>} 支付状态
 */
export async function queryPaymentStatus(orderId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/payment/alipay/status`, {
      params: { tradeNo: orderId },
    })

    const { tradeStatus } = response.data

    // 支付宝交易状态映射
    const statusMap = {
      TRADE_SUCCESS: 'paid',
      TRADE_FINISHED: 'paid',
      WAIT_BUYER_PAY: 'pending',
      TRADE_CLOSED: 'failed',
    }

    return {
      status: statusMap[tradeStatus] || 'pending',
      trade_order_id: orderId,
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || '查询支付状态失败')
  }
}
