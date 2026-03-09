import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotificationHistory } from '../services/api';
import { FaArrowLeft, FaCircleCheck, FaCircleXmark, FaHourglassHalf, FaBell, FaClockRotateLeft, FaCalendarCheck } from 'react-icons/fa6';

const icons = {
    taken: { icon: <FaCircleCheck />, cls: 'hi-taken' },
    missed: { icon: <FaCircleXmark />, cls: 'hi-missed' },
    snoozed: { icon: <FaHourglassHalf />, cls: 'hi-snoozed' },
    sent: { icon: <FaBell />, cls: 'hi-sent' },
};

const badgeColors = {
    taken: { bg: 'var(--green-soft)', color: 'var(--green)' },
    missed: { bg: 'var(--red-soft)', color: 'var(--red)' },
    snoozed: { bg: 'var(--yellow-light)', color: 'var(--yellow)' },
    sent: { bg: 'var(--blue-soft)', color: 'var(--blue)' },
};

export default function NotificationHistory() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getNotificationHistory()
            .then(r => setHistory(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="loading-wrap"><div className="spinner" /></div>
    );

    return (
        <div className="history-wrap">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft /></button>
                <h1 className="page-title">Health Journey</h1>
            </div>

            {history.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><FaClockRotateLeft style={{ color: 'var(--blue)', fontSize: 40 }} /></div>
                    <div className="empty-title">No activity yet</div>
                    <div className="empty-sub">Your medication history will appear here.</div>
                </div>
            ) : (
                <div className="history-list">
                    {history.map(item => {
                        const type = item.action || 'sent';
                        const { icon, cls } = icons[type] || { icon: <FaClockRotateLeft />, cls: 'hi-sent' };
                        const bc = badgeColors[type] || badgeColors.sent;
                        const dt = new Date(item.timestamp);
                        return (
                            <div key={item.id} className="history-item">
                                <div className={`history-icon-wrap ${cls}`}>{icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div className="history-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {item.medication_name}
                                        <span className="history-badge" style={{ background: bc.bg, color: bc.color }}>
                                            {type}
                                        </span>
                                    </div>
                                    <div className="history-meta">
                                        <FaCalendarCheck size={11} style={{ marginRight: 5 }} />
                                        {dt.toLocaleDateString([], { month: 'short', day: 'numeric' })} · {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
