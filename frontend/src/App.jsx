import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import SideNav from './components/SideNav';
import BottomNav from './components/BottomNav';
import ReminderNotification from './components/ReminderNotification';
import Dashboard from './pages/Dashboard';
import AddMedication from './pages/AddMedication';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotificationHistory from './pages/NotificationHistory';
import Analytics from './pages/Analytics';

const isAuth = () => !!localStorage.getItem('access_token');

function ProfileSetupGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const alreadyPrompted = sessionStorage.getItem('profile_prompted');
    const onAuth = ['/login', '/register'].includes(location.pathname);
    const onProfile = location.pathname === '/profile';
    if (!isAuth() || alreadyPrompted || onAuth || onProfile) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.profile_complete) {
      sessionStorage.setItem('profile_prompted', '1');
      navigate('/profile?setup=1', { replace: true });
    }
  }, []);
  return children;
}

function Guard({ children }) {
  return isAuth() ? children : <Navigate to="/login" replace />;
}

function App() {
  const auth = isAuth();
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  return (
    <BrowserRouter>
      <div className="app-wrapper">
        {/* Header: always visible when authenticated */}
        {auth && <Header />}

        {/* Desktop sidebar: shows on ≥768px when authenticated */}
        {auth && <SideNav />}

        {auth && <ReminderNotification />}

        <main className={`main-content${auth ? ' with-nav' : ' auth-layout'}`}>
          <div className="page-container">
            <ProfileSetupGuard>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Guard><Dashboard /></Guard>} />
                <Route path="/add" element={<Guard><AddMedication /></Guard>} />
                <Route path="/history" element={<Guard><History /></Guard>} />
                <Route path="/profile" element={<Guard><Profile /></Guard>} />
                <Route path="/analytics" element={<Guard><Analytics /></Guard>} />
                <Route path="/notifications" element={<Guard><NotificationHistory /></Guard>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ProfileSetupGuard>
          </div>
        </main>

        {/* Mobile bottom nav: hidden on desktop */}
        {auth && <BottomNav />}
      </div>
    </BrowserRouter>
  );
}

export default App;
