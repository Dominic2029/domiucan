/**
 * 虎皮椒支付相关工具函数
 */

import qs from 'qs'
import dayjs from 'dayjs'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import CryptoJS from 'crypto-js'

const MERCHANT_ID = import.meta.env.VITE_HUPIJIAO_MERCHANT_ID || ''
const API_KEY = import.meta.env.VITE_HUPIJIAO_API_KEY || ''
const API_BASE_URL = 'https://api.xunhupay.com'

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
    days: null,
  },
}

/**
 * 生成 MD5 签名
 * @param {Object} params - 参数对象（不包含 hash）
 * @param {string} apiKey - API密钥
 * @returns {string} MD5 签名
 */
function generateSign(params, apiKey) {
  const filteredParams = {}
  Object.keys(params)
    .filter(key => key !== 'hash' && params[key] !== null && params[key] !== '')
    .sort()
    .forEach(key => {
      filteredParams[key] = params[key]
    })
  
  const signString = Object.entries(filteredParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&') + apiKey
  
  return CryptoJS.MD5(signString).toString().toLowerCase()
}

/**
 * 创建支付订单（通过后端 API）
 * @param {string} packageType - 套餐类型
 * @param {string} returnUrl - 支付成功回调 URL
 * @returns {Promise<string>} 支付链接
 */
export async function createPaymentOrder(packageType, returnUrl) {
  const packageInfo = PACKAGES[packageType]
  if (!packageInfo) {
    throw new Error('无效的套餐类型')
  }

  try {
    const response = await fetch('/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        packageType,
        returnUrl,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API 请求失败:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('API 返回非 JSON 格式:', text)
      throw new Error('API 返回格式错误，请稍后重试')
    }

    const data = await response.json()

    if (data.success && data.url) {
      return data.url
    } else {
      throw new Error(data.error || '创建订单失败')
    }
  } catch (error) {
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      console.error('JSON 解析错误:', error)
      throw new Error('服务器返回数据格式错误，请稍后重试')
    }
    if (error.message) {
      throw error
    }
    throw new Error(`支付接口调用失败: ${error.message || '网络错误'}`)
  }
}

/**
 * 查询支付状态（通过后端 API）
 * @param {string} orderId - 订单 ID
 * @returns {Promise<Object>} 支付状态 { status: 'paid' | 'pending' | 'failed', ... }
 */
export async function queryPaymentStatus(orderId) {
  try {
    const response = await fetch('/api/payment/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('查询 API 请求失败:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
      throw new Error(`查询请求失败: ${response.status} ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('查询 API 返回非 JSON 格式:', text)
      throw new Error('查询接口返回格式错误，请稍后重试')
    }

    const data = await response.json()

    if (data.success) {
      return {
        status: data.status,
        trade_order_id: data.trade_order_id || orderId,
        total_fee: data.total_fee,
        paid_at: data.paid_at,
      }
    } else {
      throw new Error(data.error || '查询支付状态失败')
    }
  } catch (error) {
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      console.error('JSON 解析错误:', error)
      throw new Error('查询接口返回数据格式错误，请稍后重试')
    }
    throw new Error(`查询支付状态失败: ${error.message || '网络错误'}`)
  }
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

  const tokenPayload = {
    packageType,
    expireTime,
    orderId,
    paidAt: new Date().toISOString(),
  }

  const token = btoa(JSON.stringify(tokenPayload))

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
