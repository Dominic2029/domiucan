/**
 * 虎皮椒支付相关工具函数
 */

import qs from 'qs'
import dayjs from 'dayjs'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

const MERCHANT_ID = import.meta.env.VITE_HUPIJIAO_MERCHANT_ID || ''
const API_KEY = import.meta.env.VITE_HUPIJIAO_API_KEY || ''
const API_BASE_URL = 'https://api.xunhupay.com' // 虎皮椒 API 地址

/**
 * 套餐配置
 */
export const PACKAGES = {
  daily: {
    name: '单日套餐',
    price: 3,
    days: 1,
  },
  weekly: {
    name: '周套餐',
    price: 7,
    days: 7,
  },
  monthly: {
    name: '月套餐',
    price: 30,
    days: 30,
  },
  lifetime: {
    name: '终身套餐',
    price: 100,
    days: null, // 永久
  },
}

/**
 * 创建支付订单
 * @param {string} packageType - 套餐类型
 * @param {string} returnUrl - 支付成功回调 URL
 * @returns {Promise<string>} 支付链接
 */
export async function createPaymentOrder(packageType, returnUrl) {
  const packageInfo = PACKAGES[packageType]
  if (!packageInfo) {
    throw new Error('无效的套餐类型')
  }

  // TODO: 替换为真实虎皮椒 API 调用
  // const params = {
  //   version: '1.1',
  //   lang: 'zh-cn',
  //   plugins: 'xunhupay',
  //   appid: MERCHANT_ID,
  //   trade_order_id: `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  //   payment: 'wechat',
  //   total_fee: packageInfo.price,
  //   title: packageInfo.name,
  //   time: Math.floor(Date.now() / 1000),
  //   notify_url: `${window.location.origin}/api/payment/notify`,
  //   return_url: returnUrl,
  //   callback_url: returnUrl,
  // }
  //
  // // 生成签名
  // const signString = Object.keys(params)
  //   .sort()
  //   .map((key) => `${key}=${params[key]}`)
  //   .join('&')
  // const sign = md5(signString + API_KEY)
  // params.hash = sign
  //
  // const response = await fetch(`${API_BASE_URL}/payment/do.html`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //   },
  //   body: qs.stringify(params),
  // })
  //
  // const data = await response.json()
  // if (data.errcode === 0) {
  //   return data.url
  // } else {
  //   throw new Error(data.errmsg || '创建订单失败')
  // }

  // 模拟创建订单（实际使用时需替换）
  // 注意：这是模拟实现，实际应跳转到真实支付页面
  return new Promise((resolve, reject) => {
    // 在开发环境中，需要用户确认是否模拟支付成功
    const shouldMockPay = confirm(
      `【开发模式】这是模拟支付流程\n\n` +
      `套餐：${packageInfo.name}\n` +
      `价格：¥${packageInfo.price}\n\n` +
      `点击"确定"模拟支付成功，点击"取消"模拟支付失败`
    )
    
    setTimeout(() => {
      const mockOrderId = `ORDER_${Date.now()}`
      if (shouldMockPay) {
        // 模拟支付成功
        const mockPaymentUrl = `/payment/result?order_id=${mockOrderId}&package=${packageType}&status=success`
        resolve(mockPaymentUrl)
      } else {
        // 模拟支付失败
        const mockPaymentUrl = `/payment/result?order_id=${mockOrderId}&package=${packageType}&status=failed`
        resolve(mockPaymentUrl)
      }
    }, 500)
  })
}

/**
 * 查询支付状态
 * @param {string} orderId - 订单 ID
 * @returns {Promise<Object>} 支付状态
 */
export async function queryPaymentStatus(orderId) {
  // TODO: 替换为真实虎皮椒 API 调用
  // const params = {
  //   version: '1.1',
  //   lang: 'zh-cn',
  //   plugins: 'xunhupay',
  //   appid: MERCHANT_ID,
  //   trade_order_id: orderId,
  //   time: Math.floor(Date.now() / 1000),
  // }
  //
  // const signString = Object.keys(params)
  //   .sort()
  //   .map((key) => `${key}=${params[key]}`)
  //   .join('&')
  // const sign = md5(signString + API_KEY)
  // params.hash = sign
  //
  // const response = await fetch(`${API_BASE_URL}/payment/query.html`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //   },
  //   body: qs.stringify(params),
  // })
  //
  // return await response.json()

  // 模拟查询（实际使用时需替换）
  // 注意：这是模拟实现，实际应调用真实支付接口验证
  return new Promise((resolve) => {
    setTimeout(() => {
      // 从 URL 参数中获取支付状态（模拟）
      const urlParams = new URLSearchParams(window.location.search)
      const statusParam = urlParams.get('status')
      
      // 只有明确标记为 success 时才返回 paid，否则返回 pending 或 failed
      if (statusParam === 'success') {
        resolve({
          status: 'paid',
          trade_order_id: orderId,
        })
      } else {
        resolve({
          status: 'pending',
          trade_order_id: orderId,
        })
      }
    }, 500)
  })
}

/**
 * 处理支付成功回调
 * @param {string} packageType - 套餐类型
 * @param {string} orderId - 订单 ID
 */
export function handlePaymentSuccess(packageType, orderId) {
  const packageInfo = PACKAGES[packageType]
  let expireTime

  if (packageType === 'lifetime') {
    expireTime = '9999-12-31T23:59:59.999Z'
  } else {
    expireTime = dayjs().add(packageInfo.days, 'day').toISOString()
  }

  // 生成支付 Token（JWT 格式）
  const tokenPayload = {
    packageType,
    expireTime,
    orderId,
    paidAt: new Date().toISOString(),
  }

  // 简单的 Base64 编码（实际应使用 JWT 库）
  const token = btoa(JSON.stringify(tokenPayload))

  // 存储到 Cookie（7 天过期）
  Cookies.set('payment_token', token, { expires: 7 })

  return {
    packageType,
    expireTime,
    remainingDays: packageType === 'lifetime' ? null : packageInfo.days,
  }
}

/**
 * 验证支付状态
 * @returns {Object|null} 支付信息或 null
 */
export function verifyPaymentStatus() {
  const token = Cookies.get('payment_token')
  if (!token) return null

  try {
    const decoded = JSON.parse(atob(token))
    const expireTime = decoded.expireTime

    // 检查是否过期（终身套餐除外）
    if (decoded.packageType !== 'lifetime' && dayjs(expireTime).isBefore(dayjs())) {
      Cookies.remove('payment_token')
      return null
    }

    return {
      isPaid: true,
      packageType: decoded.packageType,
      expireTime,
      remainingDays:
        decoded.packageType === 'lifetime'
          ? null
          : dayjs(expireTime).diff(dayjs(), 'day'),
    }
  } catch (error) {
    console.error('验证支付状态失败:', error)
    Cookies.remove('payment_token')
    return null
  }
}
