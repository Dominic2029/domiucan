/**
 * Shopify OAuth 授权相关工具函数
 */

const SHOPIFY_CLIENT_ID = import.meta.env.VITE_SHOPIFY_CLIENT_ID || ''

/**
 * 生成 Shopify OAuth 授权 URL
 * @param {string} shopDomain - 店铺域名（如：xxx.myshopify.com）
 * @returns {string} 授权 URL
 */
export function generateShopifyAuthUrl(shopDomain) {
  const redirectUri = `${window.location.origin}/settings?shopify_callback=1`
  const scopes = 'read_products,write_blogs'
  const state = btoa(JSON.stringify({ timestamp: Date.now() })) // 简单的 state 参数

  const authUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
  
  return authUrl
}

/**
 * 从 URL 参数中提取 Shopify 授权码
 * @returns {string|null} 授权码
 */
export function extractShopifyCode() {
  const params = new URLSearchParams(window.location.search)
  return params.get('code')
}

/**
 * 模拟获取 Shopify 产品列表
 * 实际使用时需替换为真实 Shopify API 调用
 * @param {string} accessToken - Shopify Access Token
 * @returns {Promise<Array>} 产品列表
 */
export async function fetchShopifyProducts(accessToken) {
  // TODO: 替换为真实 Shopify API 调用
  // const response = await fetch(`https://${shopDomain}/admin/api/2024-01/products.json`, {
  //   headers: {
  //     'X-Shopify-Access-Token': accessToken,
  //   },
  // })
  // const data = await response.json()
  // return data.products

  // 模拟数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockProducts = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: `产品 ${i + 1}`,
        description: `这是产品 ${i + 1} 的描述信息`,
        handle: `product-${i + 1}`,
        images: [
          {
            src: `https://via.placeholder.com/300x300?text=Product+${i + 1}`,
          },
        ],
        variants: [
          {
            id: i + 1,
            price: (Math.random() * 100 + 10).toFixed(2),
            compare_at_price: (Math.random() * 150 + 50).toFixed(2),
          },
        ],
      }))
      resolve(mockProducts)
    }, 1000)
  })
}

/**
 * 发布文章到 Shopify 博客
 * @param {string} shopDomain - 店铺域名
 * @param {string} accessToken - Access Token
 * @param {string} title - 文章标题
 * @param {string} content - 文章内容（HTML）
 * @returns {Promise<Object>} 发布结果
 */
export async function publishToShopifyBlog(shopDomain, accessToken, title, content) {
  // TODO: 替换为真实 Shopify API 调用
  // const response = await fetch(`https://${shopDomain}/admin/api/2024-01/blogs/${blogId}/articles.json`, {
  //   method: 'POST',
  //   headers: {
  //     'X-Shopify-Access-Token': accessToken,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     article: {
  //       title,
  //       body_html: content,
  //     },
  //   }),
  // })
  // return await response.json()

  // 模拟发布
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        article: {
          id: Date.now(),
          title,
          published_at: new Date().toISOString(),
        },
      })
    }, 1500)
  })
}
