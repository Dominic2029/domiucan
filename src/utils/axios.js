import axios from 'axios'
import Cookies from 'js-cookie'

// 创建 axios 实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加支付 Token（如果存在）
    const paymentToken = Cookies.get('payment_token')
    if (paymentToken) {
      config.headers.Authorization = `Bearer ${paymentToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        // 未授权，清除 Token 并跳转支付页
        Cookies.remove('payment_token')
        window.location.href = '/payment'
      }
      return Promise.reject(data || error.message)
    }
    return Promise.reject(error.message || '网络错误，请稍后重试')
  }
)

export default api
