import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AdminApp from './AdminApp'

createRoot(document.getElementById('admin-root')!).render(
  <BrowserRouter>
    <AdminApp />
  </BrowserRouter>,
)
