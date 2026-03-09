import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getNotificationHistory } from '../services/api';
import {
    FaCircleCheck, FaCircleXmark, FaHourglassHalf,
    FaArrowLeft, FaFire, FaCalendarCheck, FaChartLine
} from 'react-icons/fa6';

/* ── SVG Adherence Ring ─────────────────────────────────── */
function AdherenceRing({ pct = 0, size = 110, stroke = 11 }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const fill = circ * Math.min(pct, 100) / 100;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="var(--border)" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="var(--blue)" strokeWidth={stroke}
                strokeDasharray={`${fill} ${circ - fill}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }}
            />
        </svg>
    );
}

const ACTION_MAP = {
    taken: { icon: <FaCircleCheck />, cls: 'hi-taken', label: 'Taken', bg: 'var(--green-light)', color: 'var(--green)' },
    missed: { icon: <FaCircleXmark />, cls: 'hi-missed', label: 'Missed', bg: 'var(--red-light)', color: 'var(--red)' },
    snoozed: { icon: <FaHourglassHalf />, cls: 'hi-snoozed', label: 'Snoozed', bg: 'var(--yellow-light)', color: 'var(--yellow)' },
    sent: { icon: <FaCalendarCheck />, cls: 'hi-sent', label: 'Alert', bg: 'var(--blue-light)', color: 'var(--blue)' },
};

export default function Analytics() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getStats(), getNotificationHistory()])
            .then(([sr, hr]) => {
                setStats(sr.data);
                setHistory(hr.data.slice(0, 12));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

    const today = stats?.today || {};
    const allTime = stats?.all_time || {};
    const todayPct = Math.round(today.adherence_percent ?? 0);
    const allPct = Math.round(allTime.adherence_percent ?? 0);

    return (
        <div className="page-wrap" style={{ maxWidth: 700, margin: '0 auto' }}>

            {/* ── Header ─────────────────────────────── */}
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft /></button>
                <h1 className="page-title">Analytics</h1>
            </div>

            {/* ── Today adherence card ────────────────── */}
            <div className="an-today-card">
                {/* Ring + centre label */}
                <div className="an-ring-wrap">
                    <AdherenceRing pct={todayPct} />
                    <div className="an-ring-label">
                        <span className="an-ring-pct">{todayPct}%</span>
                        <span className="an-ring-sub">today</span>
                    </div>
                </div>

                {/* Stats list */}
                <div className="an-today-stats">
                    <div className="an-today-title">Today's Adherence</div>
                    {[
                        { l: 'Total', v: today.total ?? 0, color: 'var(--blue)' },
                        { l: 'Taken', v: today.taken ?? 0, color: 'var(--green)' },
                        { l: 'Pending', v: today.remaining ?? 0, color: 'var(--txt1)' },
                        { l: 'Missed', v: today.missed ?? 0, color: 'var(--red)' },
                    ].map(({ l, v, color }) => (
                        <div key={l} className="an-today-row">
                            <span className="an-today-lbl">{l}</span>
                            <span className="an-today-val" style={{ color }}>{v}</span>
                        </div>
                    ))}
                    <div className="progress-track" style={{ marginTop: 14 }}>
                        <div className="progress-fill" style={{ width: `${todayPct}%` }} />
                    </div>
                </div>
            </div>

            {/* ── All-time stat chips ─────────────────── */}
            <div className="section-title" style={{ marginBottom: 10 }}>All-time Summary</div>
            <div className="an-chips">
                {[
                    { icon: <FaCircleCheck />, label: 'Total Taken', value: allTime.total_taken ?? 0, color: 'var(--green)', bg: 'var(--green-light)' },
                    { icon: <FaCircleXmark />, label: 'Total Missed', value: allTime.total_missed ?? 0, color: 'var(--red)', bg: 'var(--red-light)' },
                    { icon: <FaFire />, label: 'Adherence', value: `${allPct}%`, color: 'var(--blue)', bg: 'var(--blue-light)' },
                ].map(({ icon, label, value, color, bg }) => (
                    <div key={label} className="an-chip">
                        <div className="an-chip-icon" style={{ background: bg, color }}>{icon}</div>
                        <div className="an-chip-val" style={{ color }}>{value}</div>
                        <div className="an-chip-lbl">{label}</div>
                    </div>
                ))}
            </div>

            {/* ── Recent Activity ─────────────────────── */}
            <div className="section-title" style={{ marginBottom: 10 }}>Recent Activity</div>
            {history.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><FaChartLine style={{ color: 'var(--blue)', fontSize: 42 }} /></div>
                    <div className="empty-title">No activity yet</div>
                    <div className="empty-sub">Start recording medications to see your history.</div>
                </div>
            ) : (
                <div className="history-list">
                    {history.map(item => {
                        const act = item.action || 'sent';
                        const info = ACTION_MAP[act] || ACTION_MAP.sent;
                        const dt = new Date(item.timestamp);
                        return (
                            <div key={item.id} className="history-item">
                                <div className={`history-icon-wrap ${info.cls}`}>{info.icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="history-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.medication_name}
                                        <span className="history-badge"
                                            style={{ background: info.bg, color: info.color, flexShrink: 0 }}>
                                            {info.label}
                                        </span>
                                    </div>
                                    <div className="history-meta">
                                        <FaCalendarCheck size={10} />
                                        {dt.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} · {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
