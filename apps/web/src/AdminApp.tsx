import { Routes, Route } from 'react-router-dom'
import AdminPage from './pages/AdminPage'

function AdminApp(): JSX.Element {
  return (
    <Routes>
      <Route path="/admin.html" element={<AdminPage />} />
      <Route path="/" element={<AdminPage />} />
    </Routes>
  )
}

export default AdminApp;
