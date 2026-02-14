import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppContext } from './context/AppContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Settings from './pages/Settings'
import Generator from './pages/Generator'
import Payment from './pages/Payment'
import PaymentResult from './pages/PaymentResult'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/generator" replace />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generator"
          element={
            <ProtectedRoute>
              <Generator />
            </ProtectedRoute>
          }
        />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/result" element={<PaymentResult />} />
        <Route path="*" element={<Navigate to="/generator" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
