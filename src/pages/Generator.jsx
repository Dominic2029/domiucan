import { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { generateArticle } from '../utils/deepseek'
import { publishToShopifyBlog } from '../utils/shopify'
import ProductSelector from '../components/ProductSelector'
import RichTextEditor from '../components/RichTextEditor'
import Modal from '../components/Modal'
import Button from '../components/Button'

function Generator() {
  const { shopify, aiConfig, dispatch } = useAppContext()
  const [prompt, setPrompt] = useState('')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [autoSaveTimer, setAutoSaveTimer] = useState(null)

  // 自动保存编辑内容
  useEffect(() => {
    if (isEditing && editedContent) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
      const timer = setTimeout(() => {
        localStorage.setItem('draft_article', editedContent)
        console.log('自动保存成功')
      }, 30000) // 30 秒
      setAutoSaveTimer(timer)
      return () => clearTimeout(timer)
    }
  }, [editedContent, isEditing])

  // 恢复草稿
  useEffect(() => {
    const draft = localStorage.getItem('draft_article')
    if (draft && !generatedContent) {
      setGeneratedContent(draft)
    }
  }, [])

  // 处理产品选择
  const handleProductSelect = (product) => {
    setSelectedProducts([...selectedProducts, { ...product, shopDomain: shopify.shopDomain }])
    
    // 自动追加产品信息到提示词
    const productInfo = `\n\n产品：${product.title}\n描述：${product.description || '暂无'}\n价格：¥${product.variants?.[0]?.price || '面议'}\n链接：https://${shopify.shopDomain}/products/${product.handle || product.id}`
    setPrompt((prev) => prev + productInfo)
  }

  // 移除产品
  const handleProductRemove = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId))
  }

  // 生成文章
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('请输入提示词')
      return
    }

    setIsGenerating(true)
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const apiKey = aiConfig.useCustomKey && aiConfig.customApiKey
        ? aiConfig.customApiKey
        : import.meta.env.VITE_DEEPSEEK_DEFAULT_KEY

      if (!apiKey) {
        throw new Error('API Key 未配置，请在设置页面配置')
      }

      const content = await generateArticle(prompt, selectedProducts, apiKey)
      setGeneratedContent(content)
      setEditedContent(content)
      localStorage.setItem('draft_article', content)
    } catch (error) {
      console.error('生成文章失败:', error)
      alert(error.message || '生成文章失败，请稍后重试')
    } finally {
      setIsGenerating(false)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // 复制文章
  const handleCopy = () => {
    const content = isEditing ? editedContent : generatedContent
    navigator.clipboard.writeText(content).then(() => {
      alert('复制成功！')
    }).catch(() => {
      alert('复制失败，请手动复制')
    })
  }

  // 发布到 Shopify
  const handlePublish = async () => {
    if (!shopify.isAuthorized) {
      alert('请先在设置页面完成 Shopify 授权')
      return
    }

    const content = isEditing ? editedContent : generatedContent
    if (!content) {
      alert('没有可发布的内容')
      return
    }

    const title = prompt.split('\n')[0] || 'AI 生成文章'

    setIsPublishing(true)
    try {
      await publishToShopifyBlog(
        shopify.shopDomain,
        shopify.accessToken,
        title,
        content
      )
      alert('发布成功！')
    } catch (error) {
      console.error('发布失败:', error)
      alert('发布失败，请稍后重试')
    } finally {
      setIsPublishing(false)
    }
  }

  // 分享到社媒
  const handleShare = () => {
    // TODO: 实现社媒分享弹窗
    alert('社媒分享功能待实现')
  }

  // 跳转第三方编辑工具
  const handleThirdPartyEditor = () => {
    const content = isEditing ? editedContent : generatedContent
    
    // 复制内容到剪贴板
    navigator.clipboard.writeText(content).then(() => {
      const editorUrl = import.meta.env.VITE_THIRD_PARTY_EDITOR_URL || 'https://editor.example.com'
      window.open(editorUrl, '_blank')
      alert('文章已复制到剪贴板，正在跳转到第三方编辑工具...')
    })
  }

  // 打开深度编辑
  const handleOpenEditor = () => {
    setEditedContent(generatedContent)
    setIsEditing(true)
  }

  // 关闭编辑
  const handleCloseEditor = () => {
    setIsEditing(false)
    if (editedContent) {
      setGeneratedContent(editedContent)
    }
  }

  // 字数统计
  const wordCount = prompt.length

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">AI 文章生成器</h1>

      {/* 提示词输入区 */}
      <div className="card">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              提示词
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">字数：{wordCount}</span>
              <Button
                onClick={() => setPrompt('')}
                variant="secondary"
                className="text-sm py-1 px-2"
              >
                清空
              </Button>
            </div>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入文章生成提示词（例如：为夏季连衣裙写一篇种草文章）"
            className="input-field"
            rows={8}
            style={{ minHeight: '200px' }}
          />
        </div>
      </div>

      {/* Shopify 产品选择模块 */}
      {shopify.isAuthorized && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">选择产品（可选）</h2>
          <ProductSelector
            selectedProducts={selectedProducts}
            onSelect={handleProductSelect}
            onRemove={handleProductRemove}
          />
        </div>
      )}

      {/* 生成按钮 */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerate}
          loading={isGenerating}
          className="px-8 py-3 text-lg"
        >
          生成文章
        </Button>
      </div>

      {/* 文章预览区 */}
      {generatedContent && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">文章预览</h2>
          
          {/* 富文本预览 */}
          <div
            className="prose max-w-none border border-gray-200 rounded-lg p-4 mb-4"
            dangerouslySetInnerHTML={{ __html: generatedContent }}
          />

          {/* 功能按钮组 */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleOpenEditor} variant="primary">
              深度编辑
            </Button>
            <Button onClick={handleCopy} variant="secondary">
              复制文章
            </Button>
            <Button
              onClick={handlePublish}
              loading={isPublishing}
              variant="primary"
              disabled={!shopify.isAuthorized}
            >
              发布为新博客
            </Button>
            <Button onClick={handleShare} variant="secondary">
              分享到社媒
            </Button>
            <Button onClick={handleThirdPartyEditor} variant="outline">
              跳转第三方编辑工具
            </Button>
          </div>
        </div>
      )}

      {/* 深度编辑弹窗 */}
      <Modal
        isOpen={isEditing}
        onClose={handleCloseEditor}
        title="深度编辑"
        size="full"
      >
        <div className="space-y-4">
          <RichTextEditor
            value={editedContent}
            onChange={setEditedContent}
            placeholder="开始编辑文章..."
          />
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button onClick={handleCloseEditor} variant="secondary">
              返回
            </Button>
            <Button onClick={handleCopy} variant="secondary">
              复制
            </Button>
            <Button
              onClick={handlePublish}
              loading={isPublishing}
              disabled={!shopify.isAuthorized}
            >
              发布为新博客
            </Button>
            <Button onClick={handleShare} variant="secondary">
              分享到社媒
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Generator
