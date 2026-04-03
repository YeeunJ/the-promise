import { Routes, Route } from 'react-router-dom'
import ReservationPage from './pages/ReservationPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ReservationPage />} />
    </Routes>
  )
}
