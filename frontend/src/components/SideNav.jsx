import { NavLink, useNavigate } from 'react-router-dom';
import {
    FaHouse, FaPlus, FaUser, FaChartLine,
    FaBell, FaPills, FaRightFromBracket
} from 'react-icons/fa6';

const links = [
    { to: '/', icon: <FaHouse />, label: 'Home', exact: true },
    { to: '/analytics', icon: <FaChartLine />, label: 'Analytics' },
    { to: '/add', icon: <FaPlus />, label: 'Add Med' },
    { to: '/notifications', icon: <FaBell />, label: 'History' },
    { to: '/profile', icon: <FaUser />, label: 'Profile' },
];

export default function SideNav() {
    const navigate = useNavigate();
    const signOut = () => { localStorage.clear(); window.location.href = '/login'; };

    return (
        <aside className="side-nav">
            {/* Brand */}
            <div className="side-brand" onClick={() => navigate('/')}>
                <div className="side-brand-icon"><FaPills /></div>
                <div>
                    <div className="side-brand-name">MedReminder</div>
                    <div className="side-brand-sub">Medication Tracker</div>
                </div>
            </div>

            {/* Nav links */}
            <nav className="side-links">
                {links.map(({ to, icon, label, exact }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={exact}
                        className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}
                    >
                        <span className="side-link-icon">{icon}</span>
                        <span className="side-link-label">{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Sign out */}
            <button className="side-signout" onClick={signOut}>
                <FaRightFromBracket /> Sign Out
            </button>
        </aside>
    );
}
