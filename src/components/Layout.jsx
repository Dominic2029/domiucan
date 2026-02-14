import { Link, useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import dayjs from 'dayjs'

function Layout({ children }) {
  const location = useLocation()
  const { payment, isPaymentValid } = useAppContext()

  const navItems = [
    { path: '/generator', label: '文章生成', icon: '✍️' },
    { path: '/settings', label: '设置', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-primary-600">
                Shopify AI 文章生成器
              </Link>
              <div className="flex space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isPaymentValid() ? (
                <div className="text-sm text-gray-600">
                  <span className="text-green-600 font-medium">已激活</span>
                  {payment.packageType !== 'lifetime' && payment.remainingDays !== null && (
                    <span className="ml-2">
                      （剩余 {payment.remainingDays} 天）
                    </span>
                  )}
                </div>
              ) : (
                <Link
                  to="/payment"
                  className="btn-primary text-sm"
                >
                  立即购买
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2024 Shopify AI 文章生成器. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
