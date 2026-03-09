import { NavLink, useLocation } from 'react-router-dom';
import { FaHouse, FaPlus, FaUser, FaChartLine } from 'react-icons/fa6';

export default function BottomNav() {
    return (
        <nav className="bottom-nav">
            <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <FaHouse />
                <span>Home</span>
            </NavLink>

            <NavLink to="/analytics" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <FaChartLine />
                <span>Analytics</span>
            </NavLink>

            <NavLink to="/add" className="nav-item" style={{ position: 'relative', zIndex: 1 }}>
                <div className="nav-add-btn">
                    <FaPlus />
                </div>
            </NavLink>

            <NavLink to="/notifications" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                {/* bell icon via unicode so no extra import needed */}
                <span style={{ fontSize: 22 }}>🔔</span>
                <span>History</span>
            </NavLink>

            <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <FaUser />
                <span>Profile</span>
            </NavLink>
        </nav>
    );
}
