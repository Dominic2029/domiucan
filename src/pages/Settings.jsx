import { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { generateShopifyAuthUrl, extractShopifyCode, fetchShopifyProducts } from '../utils/shopify'
import { testApiKey } from '../utils/deepseek'
import Button from '../components/Button'

function Settings() {
  const { shopify, socialMedia, aiConfig, dispatch } = useAppContext()
  const [shopDomain, setShopDomain] = useState(shopify.shopDomain || '')
  const [shopifyLoading, setShopifyLoading] = useState(false)
  const [apiKeyTestLoading, setApiKeyTestLoading] = useState(false)
  const [apiKeyTestResult, setApiKeyTestResult] = useState(null)
  const [customApiKey, setCustomApiKey] = useState(aiConfig.customApiKey || '')

  // 处理 Shopify 授权回调
  useEffect(() => {
    const code = extractShopifyCode()
    if (code) {
      handleShopifyCallback(code)
    }
  }, [])

  // 验证 Shopify 域名格式
  const validateShopDomain = (domain) => {
    const pattern = /^[a-zA-Z0-9-]+\.myshopify\.com$/
    return pattern.test(domain)
  }

  // Shopify 授权
  const handleShopifyAuth = () => {
    if (!validateShopDomain(shopDomain)) {
      alert('请输入正确的 Shopify 店铺域名（格式：xxx.myshopify.com）')
      return
    }

    const authUrl = generateShopifyAuthUrl(shopDomain)
    window.location.href = authUrl
  }

  // 处理 Shopify 授权回调（模拟）
  const handleShopifyCallback = async (code) => {
    setShopifyLoading(true)
    try {
      // TODO: 替换为真实 Shopify OAuth Token 交换
      // const response = await fetch('YOUR_BACKEND_API/shopify/oauth', {
      //   method: 'POST',
      //   body: JSON.stringify({ code, shop: shopDomain }),
      // })
      // const { access_token } = await response.json()

      // 模拟获取 Token
      const mockAccessToken = `mock_token_${Date.now()}`

      // 保存授权信息
      const authData = {
        shopDomain,
        accessToken: mockAccessToken,
      }
      localStorage.setItem('shopify_auth', JSON.stringify(authData))
      dispatch({
        type: 'SET_SHOPIFY_AUTH',
        payload: authData,
      })

      // 获取产品列表
      const products = await fetchShopifyProducts(mockAccessToken)
      dispatch({
        type: 'SET_SHOPIFY_PRODUCTS',
        payload: products,
      })

      // 清除 URL 参数
      window.history.replaceState({}, document.title, '/settings')
    } catch (error) {
      console.error('Shopify 授权失败:', error)
      alert('授权失败，请重试')
    } finally {
      setShopifyLoading(false)
    }
  }

  // 清除 Shopify 授权
  const handleClearShopifyAuth = () => {
    if (confirm('确定要清除 Shopify 授权吗？')) {
      localStorage.removeItem('shopify_auth')
      dispatch({ type: 'CLEAR_SHOPIFY_AUTH' })
      setShopDomain('')
    }
  }

  // 社媒授权
  const handleSocialMediaAuth = (platform) => {
    // TODO: 替换为真实社媒 OAuth 流程
    alert(`${platform} 授权功能待实现，请替换为真实 OAuth 接口`)
    
    // 模拟授权成功
    const mockToken = `mock_${platform}_token_${Date.now()}`
    const authData = JSON.parse(localStorage.getItem('social_media_auth') || '{}')
    authData[platform] = { isAuthorized: true, token: mockToken }
    localStorage.setItem('social_media_auth', JSON.stringify(authData))
    
    dispatch({
      type: 'SET_SOCIAL_MEDIA_AUTH',
      payload: { platform, token: mockToken },
    })
  }

  // 清除社媒授权
  const handleClearSocialMediaAuth = (platform) => {
    const authData = JSON.parse(localStorage.getItem('social_media_auth') || '{}')
    authData[platform] = { isAuthorized: false, token: null }
    localStorage.setItem('social_media_auth', JSON.stringify(authData))
    
    dispatch({
      type: 'CLEAR_SOCIAL_MEDIA_AUTH',
      payload: platform,
    })
  }

  // 测试 API Key
  const handleTestApiKey = async () => {
    if (!customApiKey) {
      alert('请输入 API Key')
      return
    }

    setApiKeyTestLoading(true)
    setApiKeyTestResult(null)

    try {
      const isValid = await testApiKey(customApiKey)
      setApiKeyTestResult(isValid ? 'success' : 'error')
      
      if (isValid) {
        // 保存配置
        const config = {
          useCustomKey: true,
          customApiKey,
        }
        localStorage.setItem('ai_config', JSON.stringify(config))
        dispatch({
          type: 'SET_AI_CONFIG',
          payload: config,
        })
      }
    } catch (error) {
      setApiKeyTestResult('error')
    } finally {
      setApiKeyTestLoading(false)
    }
  }

  // 切换 API Key 使用
  const handleToggleCustomKey = (useCustom) => {
    const config = {
      useCustomKey: useCustom,
      customApiKey: useCustom ? customApiKey : null,
    }
    localStorage.setItem('ai_config', JSON.stringify(config))
    dispatch({
      type: 'SET_AI_CONFIG',
      payload: config,
    })
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">设置</h1>

      {/* Shopify OAuth 授权模块 */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Shopify OAuth 授权</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              店铺域名
            </label>
            <input
              type="text"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder="xxx.myshopify.com"
              disabled={shopify.isAuthorized}
              className="input-field"
            />
            <p className="mt-1 text-sm text-gray-500">
              格式：xxx.myshopify.com
            </p>
          </div>

          {shopify.isAuthorized ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-medium">✓ 已授权</span>
                <span className="text-sm text-gray-600">
                  {shopify.shopDomain}
                </span>
              </div>
              
              {/* 产品列表预览 */}
              {shopify.products.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    产品列表预览（前 20 个）：
                  </p>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                    {shopify.products.slice(0, 20).map((product) => (
                      <div key={product.id} className="text-sm py-1">
                        {product.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleClearShopifyAuth}
                variant="danger"
              >
                清除授权
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleShopifyAuth}
              loading={shopifyLoading}
            >
              授权 Shopify
            </Button>
          )}
        </div>
      </div>

      {/* 社媒授权模块 */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">社媒授权</h2>
        <div className="grid grid-cols-2 gap-4">
          {['facebook', 'twitter', 'instagram', 'linkedin'].map((platform) => {
            const auth = socialMedia[platform]
            return (
              <div
                key={platform}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{platform}</span>
                  {auth.isAuthorized ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600">已授权</span>
                      <Button
                        onClick={() => handleClearSocialMediaAuth(platform)}
                        variant="outline"
                        className="text-xs py-1 px-2"
                      >
                        解绑
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleSocialMediaAuth(platform)}
                      variant="outline"
                      className="text-xs py-1 px-2"
                    >
                      授权
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          * 社媒授权功能需替换为真实 OAuth 接口
        </p>
      </div>

      {/* AI 配置模块 */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">AI 配置</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="useCustomKey"
              checked={aiConfig.useCustomKey}
              onChange={(e) => handleToggleCustomKey(e.target.checked)}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="useCustomKey" className="text-sm font-medium text-gray-700">
              使用自定义 DeepSeek API Key
            </label>
          </div>

          {aiConfig.useCustomKey && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                自定义 API Key
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="输入您的 DeepSeek API Key"
                className="input-field"
              />
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleTestApiKey}
                  loading={apiKeyTestLoading}
                  variant="secondary"
                  className="text-sm"
                >
                  测试 API Key
                </Button>
                {apiKeyTestResult === 'success' && (
                  <span className="text-sm text-green-600">✓ API Key 有效</span>
                )}
                {apiKeyTestResult === 'error' && (
                  <span className="text-sm text-red-600">✗ API Key 无效</span>
                )}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500">
            {aiConfig.useCustomKey
              ? '当前使用您的自定义 API Key'
              : '当前使用系统默认 API Key（关闭则使用系统默认 Key，开启则使用您的 Key）'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings
