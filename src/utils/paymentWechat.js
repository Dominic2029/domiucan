/**
 * 微信支付实现示例
 * 参考文档: https://pay.weixin.qq.com/
 */

import axios from 'axios'
import { PACKAGES } from './payment'

const WECHAT_APP_ID = import.meta.env.VITE_WECHAT_APP_ID || ''
const WECHAT_MCH_ID = import.meta.env.VITE_WECHAT_MCH_ID || ''
const WECHAT_API_KEY = import.meta.env.VITE_WECHAT_API_KEY || ''
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * 创建微信支付订单
 * @param {string} packageType - 套餐类型
 * @param {string} returnUrl - 支付成功回调 URL
 * @returns {Promise<string>} 支付参数（用于调起微信支付）
 */
export async function createPaymentOrder(packageType, returnUrl) {
  const packageInfo = PACKAGES[packageType]
  if (!packageInfo) {
    throw new Error('无效的套餐类型')
  }

  // 微信支付需要通过后端统一下单
  try {
    const response = await axios.post(`${API_BASE_URL}/api/payment/wechat/unified-order`, {
      packageType,
      amount: packageInfo.price * 100, // 微信支付使用分为单位
      body: packageInfo.name,
      notifyUrl: `${API_BASE_URL}/api/payment/wechat/notify`,
      returnUrl,
    })

    // 返回支付参数，用于调起微信支付
    return response.data.paymentParams
  } catch (error) {
    throw new Error(error.response?.data?.message || '创建支付订单失败')
  }
}

/**
 * 调起微信支付
 * @param {Object} paymentParams - 支付参数
 */
export function invokeWechatPay(paymentParams) {
  // 在微信浏览器中使用 WeixinJSBridge
  if (typeof WeixinJSBridge !== 'undefined') {
    WeixinJSBridge.invoke(
      'getBrandWCPayRequest',
      {
        appId: paymentParams.appId,
        timeStamp: paymentParams.timeStamp,
        nonceStr: paymentParams.nonceStr,
        package: paymentParams.package,
        signType: paymentParams.signType,
        paySign: paymentParams.paySign,
      },
      (res) => {
        if (res.err_msg === 'get_brand_wcpay_request:ok') {
          // 支付成功，跳转到结果页
          window.location.href = paymentParams.returnUrl
        } else {
          alert('支付失败：' + res.err_msg)
        }
      }
    )
  } else {
    // 非微信浏览器，使用二维码支付
    // 显示二维码，用户扫码支付
    return paymentParams.codeUrl
  }
}

/**
 * 查询微信支付状态
 * @param {string} orderId - 订单 ID
 * @returns {Promise<Object>} 支付状态
 */
export async function queryPaymentStatus(orderId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/payment/wechat/status`, {
      params: { transactionId: orderId },
    })

    const { tradeState } = response.data

    // 微信支付状态映射
    const statusMap = {
      SUCCESS: 'paid',
      REFUND: 'failed',
      NOTPAY: 'pending',
      CLOSED: 'failed',
      REVOKED: 'failed',
      USERPAYING: 'pending',
      PAYERROR: 'failed',
    }

    return {
      status: statusMap[tradeState] || 'pending',
      trade_order_id: orderId,
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || '查询支付状态失败')
  }
}
