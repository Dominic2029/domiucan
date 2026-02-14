import { Navigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

/**
 * 路由保护组件：未支付用户自动跳转到支付页
 */
function ProtectedRoute({ children }) {
  const { isPaymentValid } = useAppContext()

  if (!isPaymentValid()) {
    return <Navigate to="/payment" replace />
  }

  return children
}

export default ProtectedRoute
