import React, { createContext, useContext, useReducer, useEffect } from 'react'
import Cookies from 'js-cookie'
import dayjs from 'dayjs'
import { jwtDecode } from 'jwt-decode'

// 初始状态
const initialState = {
  // 用户支付状态
  payment: {
    isPaid: false,
    packageType: null, // 'daily' | 'weekly' | 'monthly' | 'lifetime'
    expireTime: null,
    remainingDays: null,
  },
  // Shopify 授权状态
  shopify: {
    isAuthorized: false,
    shopDomain: null,
    accessToken: null,
    products: [],
  },
  // 社媒授权状态
  socialMedia: {
    facebook: { isAuthorized: false, token: null },
    twitter: { isAuthorized: false, token: null },
    instagram: { isAuthorized: false, token: null },
    linkedin: { isAuthorized: false, token: null },
  },
  // AI 配置
  aiConfig: {
    useCustomKey: false,
    customApiKey: null,
  },
  // 加载状态
  loading: false,
  error: null,
}

// Action Types
const ActionTypes = {
  // 支付相关
  SET_PAYMENT_STATUS: 'SET_PAYMENT_STATUS',
  UPDATE_PAYMENT_EXPIRY: 'UPDATE_PAYMENT_EXPIRY',
  // Shopify 相关
  SET_SHOPIFY_AUTH: 'SET_SHOPIFY_AUTH',
  SET_SHOPIFY_PRODUCTS: 'SET_SHOPIFY_PRODUCTS',
  CLEAR_SHOPIFY_AUTH: 'CLEAR_SHOPIFY_AUTH',
  // 社媒相关
  SET_SOCIAL_MEDIA_AUTH: 'SET_SOCIAL_MEDIA_AUTH',
  CLEAR_SOCIAL_MEDIA_AUTH: 'CLEAR_SOCIAL_MEDIA_AUTH',
  // AI 配置
  SET_AI_CONFIG: 'SET_AI_CONFIG',
  // 通用
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
}

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_PAYMENT_STATUS:
      return {
        ...state,
        payment: {
          ...state.payment,
          ...action.payload,
        },
      }
    case ActionTypes.UPDATE_PAYMENT_EXPIRY:
      const expireTime = state.payment.expireTime
      if (expireTime) {
        const remaining = dayjs(expireTime).diff(dayjs(), 'day')
        return {
          ...state,
          payment: {
            ...state.payment,
            remainingDays: remaining > 0 ? remaining : 0,
          },
        }
      }
      return state
    case ActionTypes.SET_SHOPIFY_AUTH:
      return {
        ...state,
        shopify: {
          ...state.shopify,
          ...action.payload,
          isAuthorized: true,
        },
      }
    case ActionTypes.SET_SHOPIFY_PRODUCTS:
      return {
        ...state,
        shopify: {
          ...state.shopify,
          products: action.payload,
        },
      }
    case ActionTypes.CLEAR_SHOPIFY_AUTH:
      return {
        ...state,
        shopify: {
          ...initialState.shopify,
        },
      }
    case ActionTypes.SET_SOCIAL_MEDIA_AUTH:
      return {
        ...state,
        socialMedia: {
          ...state.socialMedia,
          [action.payload.platform]: {
            isAuthorized: true,
            token: action.payload.token,
          },
        },
      }
    case ActionTypes.CLEAR_SOCIAL_MEDIA_AUTH:
      return {
        ...state,
        socialMedia: {
          ...state.socialMedia,
          [action.payload]: {
            isAuthorized: false,
            token: null,
          },
        },
      }
    case ActionTypes.SET_AI_CONFIG:
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          ...action.payload,
        },
      }
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      }
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

// Context
const AppContext = createContext()

// Provider Component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // 初始化：从 Cookie 和 localStorage 恢复状态
  useEffect(() => {
    // 恢复支付状态
    const paymentToken = Cookies.get('payment_token')
    if (paymentToken) {
      try {
        const decoded = jwtDecode(paymentToken)
        dispatch({
          type: ActionTypes.SET_PAYMENT_STATUS,
          payload: {
            isPaid: true,
            packageType: decoded.packageType,
            expireTime: decoded.expireTime,
          },
        })
      } catch (error) {
        console.error('Failed to decode payment token:', error)
        Cookies.remove('payment_token')
      }
    }

    // 恢复 Shopify 授权
    const shopifyAuth = localStorage.getItem('shopify_auth')
    if (shopifyAuth) {
      try {
        const auth = JSON.parse(shopifyAuth)
        dispatch({
          type: ActionTypes.SET_SHOPIFY_AUTH,
          payload: auth,
        })
      } catch (error) {
        console.error('Failed to parse Shopify auth:', error)
      }
    }

    // 恢复社媒授权
    const socialMediaAuth = localStorage.getItem('social_media_auth')
    if (socialMediaAuth) {
      try {
        const auth = JSON.parse(socialMediaAuth)
        Object.keys(auth).forEach((platform) => {
          if (auth[platform].isAuthorized) {
            dispatch({
              type: ActionTypes.SET_SOCIAL_MEDIA_AUTH,
              payload: {
                platform,
                token: auth[platform].token,
              },
            })
          }
        })
      } catch (error) {
        console.error('Failed to parse social media auth:', error)
      }
    }

    // 恢复 AI 配置
    const aiConfig = localStorage.getItem('ai_config')
    if (aiConfig) {
      try {
        const config = JSON.parse(aiConfig)
        dispatch({
          type: ActionTypes.SET_AI_CONFIG,
          payload: config,
        })
      } catch (error) {
        console.error('Failed to parse AI config:', error)
      }
    }

    // 定期更新剩余天数
    const interval = setInterval(() => {
      dispatch({ type: ActionTypes.UPDATE_PAYMENT_EXPIRY })
    }, 60000) // 每分钟更新一次

    return () => clearInterval(interval)
  }, [])

  // 检查支付状态是否有效
  const isPaymentValid = () => {
    if (!state.payment.isPaid) return false
    if (state.payment.packageType === 'lifetime') return true
    if (!state.payment.expireTime) return false
    
    // 检查是否过期
    const isValid = dayjs(state.payment.expireTime).isAfter(dayjs())
    
    // 如果过期，清除支付状态
    if (!isValid && state.payment.isPaid) {
      Cookies.remove('payment_token')
      dispatch({
        type: ActionTypes.SET_PAYMENT_STATUS,
        payload: {
          isPaid: false,
          packageType: null,
          expireTime: null,
          remainingDays: null,
        },
      })
    }
    
    return isValid
  }

  const value = {
    ...state,
    dispatch,
    isPaymentValid,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Hook
export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
