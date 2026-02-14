/**
 * DeepSeek API 相关工具函数
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEFAULT_API_KEY = import.meta.env.VITE_DEEPSEEK_DEFAULT_KEY || ''

/**
 * 获取当前使用的 API Key
 * @param {boolean} useCustomKey - 是否使用自定义 Key
 * @param {string} customApiKey - 自定义 API Key
 * @returns {string} API Key
 */
export function getApiKey(useCustomKey, customApiKey) {
  return useCustomKey && customApiKey ? customApiKey : DEFAULT_API_KEY
}

/**
 * 测试 API Key 有效性
 * @param {string} apiKey - API Key
 * @returns {Promise<boolean>} 是否有效
 */
export async function testApiKey(apiKey) {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: '测试',
          },
        ],
        max_tokens: 10,
      }),
    })

    return response.ok
  } catch (error) {
    console.error('API Key 测试失败:', error)
    return false
  }
}

/**
 * 生成文章内容
 * @param {string} prompt - 提示词
 * @param {Array} products - 选中的产品列表
 * @param {string} apiKey - API Key
 * @returns {Promise<string>} 生成的文章 HTML
 */
export async function generateArticle(prompt, products = [], apiKey) {
  // 构建完整的提示词
  let fullPrompt = prompt

  if (products.length > 0) {
    const productInfo = products
      .map(
        (product) => `
产品名称：${product.title}
产品描述：${product.description || '暂无描述'}
产品价格：${product.variants?.[0]?.price || '面议'}
产品链接：https://${product.shopDomain || 'shop.example.com'}/products/${product.handle || product.id}
`
      )
      .join('\n')

    fullPrompt += `\n\n请为以下产品生成一篇营销文章：\n${productInfo}\n\n要求：\n1. 文章需包含产品关键词并添加产品链接\n2. 核心产品需插入产品卡片（HTML 格式，包含图片、名称、价格、链接）\n3. 文章需有吸引力的标题和结构化的内容\n4. 使用 HTML 格式输出`
  } else {
    fullPrompt += '\n\n请生成一篇完整的营销文章，使用 HTML 格式输出，包含标题、段落、列表等元素。'
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              '你是一位专业的电商营销文案写手，擅长撰写吸引人的产品推广文章。请使用 HTML 格式输出文章内容。',
          },
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || '生成文章失败')
    }

    const data = await response.json()
    let content = data.choices[0]?.message?.content || ''

    // 如果没有 HTML 标签，尝试包装成 HTML
    if (!content.includes('<')) {
      content = `<h1>${content.split('\n')[0]}</h1><p>${content.split('\n').slice(1).join('</p><p>')}</p>`
    }

    // 处理产品卡片（如果有产品信息）
    if (products.length > 0) {
      products.forEach((product) => {
        const productCard = `
<div class="product-card" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; display: flex; gap: 16px;">
  <img src="${product.images?.[0]?.src || 'https://via.placeholder.com/150'}" alt="${product.title}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 4px;">
  <div style="flex: 1;">
    <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${product.title}</h3>
    <p style="margin: 0 0 8px 0; color: #6b7280;">${product.description || ''}</p>
    <p style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #ef4444;">¥${product.variants?.[0]?.price || '面议'}</p>
    <a href="https://${product.shopDomain || 'shop.example.com'}/products/${product.handle || product.id}" target="_blank" style="display: inline-block; padding: 8px 16px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 4px; margin-top: 8px;">立即购买</a>
  </div>
</div>
`
        // 在内容中查找产品名称并插入卡片
        if (content.includes(product.title)) {
          content = content.replace(
            new RegExp(`(${product.title}[^<]*)`, 'g'),
            `$1${productCard}`
          )
        } else {
          // 如果没找到，在文章末尾添加
          content += productCard
        }
      })
    }

    return content
  } catch (error) {
    console.error('生成文章失败:', error)
    throw error
  }
}
