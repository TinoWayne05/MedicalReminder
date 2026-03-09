import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { FaBell, FaPills } from 'react-icons/fa6';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on auth pages
  if (['/login', '/register'].includes(location.pathname)) return null;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = user.first_name?.[0]?.toUpperCase() || '?';

  return (
    <header className="header">
      <div className="header-brand" onClick={() => navigate('/')}>
        <div className="header-icon"><FaPills /></div>
        <div>
          <div className="header-title">MedReminder</div>
          <div className="header-subtitle">Health Companion</div>
        </div>
      </div>

      <div className="header-actions">
        <NavLink to="/notifications" className="h-btn" style={{ position: 'relative' }}>
          <FaBell />
        </NavLink>
        <div className="h-avatar" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          {initials}
        </div>
      </div>
    </header>
  );
}
