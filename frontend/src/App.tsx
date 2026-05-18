import { Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/dashboard/DashboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="*" element={<DashboardPage />} />
    </Routes>
  )
}
