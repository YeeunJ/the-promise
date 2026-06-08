import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import LandingPage from './pages/LandingPage';
import LookupLoginPage from './pages/LookupLoginPage';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import BookingFailedPage from './pages/BookingFailedPage';
import MyReservationsPage from './pages/MyReservationsPage';
import BoardPage from './pages/BoardPage';

export default function App(): JSX.Element {
  return (
    <Routes>
      {/* 전체화면 공개 보드 (헤더/네비 없음, 로비 디스플레이용) */}
      <Route path="/board" element={<BoardPage />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking/confirm" element={<ConfirmationPage />} />
        <Route path="/booking/success" element={<BookingSuccessPage />} />
        <Route path="/booking/failed" element={<BookingFailedPage />} />
        <Route path="/my/login" element={<LookupLoginPage />} />
        <Route path="/my" element={<MyReservationsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
