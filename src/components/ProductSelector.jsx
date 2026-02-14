import { useState, useMemo } from 'react'
import { useAppContext } from '../context/AppContext'

/**
 * Shopify 产品选择器组件
 */
function ProductSelector({ selectedProducts, onSelect, onRemove }) {
  const { shopify } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // 过滤产品
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return shopify.products.slice(0, 20)
    return shopify.products.filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [shopify.products, searchTerm])

  const handleSelect = (product) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      onSelect(product)
    }
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="space-y-4">
      {/* 搜索输入框 */}
      <div className="relative">
        <input
          type="text"
          placeholder="搜索并选择产品..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="input-field"
        />
        {isOpen && filteredProducts.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelect(product)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
              >
                <img
                  src={product.images?.[0]?.src || 'https://via.placeholder.com/50'}
                  alt={product.title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{product.title}</p>
                  <p className="text-xs text-gray-500">
                    ¥{product.variants?.[0]?.price || '面议'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 已选产品标签 */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedProducts.map((product) => (
            <div
              key={product.id}
              className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm"
            >
              <span>{product.title}</span>
              <button
                onClick={() => onRemove(product.id)}
                className="text-primary-600 hover:text-primary-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {!shopify.isAuthorized && (
        <p className="text-sm text-gray-500">
          请先在设置页面完成 Shopify 授权
        </p>
      )}
    </div>
  )
}

export default ProductSelector
