import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTodayMedications, getStats } from '../services/api';
import MedicationCard from '../components/MedicationCard';
import { FaMagnifyingGlass, FaChevronLeft, FaChevronRight, FaChartLine, FaSun, FaCircleCheck } from 'react-icons/fa6';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Dashboard() {
    const [meds, setMeds] = useState([]);
    const [stats, setStats] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0); // day offset for date nav; 0 = today

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const name = user.first_name || 'there';

    const viewDate = new Date();
    viewDate.setDate(viewDate.getDate() + offset);
    const dayLabel = `${viewDate.getDate()} ${MONTHS[viewDate.getMonth()]}, ${DAYS[viewDate.getDay()]}`;

    const load = async () => {
        setLoading(true);
        try {
            const [mr, sr] = await Promise.all([getTodayMedications(), getStats()]);
            setMeds(mr.data);
            setStats(sr.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        load();
        window.addEventListener('medicationUpdated', load);
        return () => window.removeEventListener('medicationUpdated', load);
    }, []);

    const filtered = meds.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase())
    );

    const today = stats?.today || {};
    const pct = today.adherence_percent ?? 0;

    return (
        <div className="dashboard">
            {/* ── Blue top section ──────────────────────── */}
            <div className="dash-top">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div className="greeting">
                        <div className="greeting-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Hello, {name} <FaSun style={{ fontSize: 16, color: 'rgba(255,255,255,.8)' }} /></div>
                        <div className="greeting-date" style={{ color: 'rgba(255,255,255,.7)', marginTop: 3 }}>
                            Stay on top of your medication today
                        </div>
                    </div>
                    <Link to="/analytics" style={{
                        background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.25)',
                        borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#fff', fontSize: 15
                    }}>
                        <FaChartLine />
                    </Link>
                </div>

                {/* Date navigation */}
                <div className="date-nav">
                    <button className="date-nav-arrow" onClick={() => setOffset(o => o - 1)}>
                        <FaChevronLeft size={12} />
                    </button>
                    <span className="date-nav-label">
                        {offset === 0 ? `Today, ${dayLabel}` : dayLabel}
                    </span>
                    <button className="date-nav-arrow" onClick={() => setOffset(o => Math.min(0, o + 1))}>
                        <FaChevronRight size={12} />
                    </button>
                </div>
            </div>

            {/* ── Floating summary card ─────────────────── */}
            {stats && (
                <div className="summary-card">
                    <div className="summary-header">
                        <div>
                            <div className="summary-label">Today's Adherence</div>
                            <div className="summary-pct">{pct}<span className="summary-pct-unit">%</span></div>
                        </div>
                        <div className="summary-chart-icon"><FaChartLine /></div>
                    </div>
                    <div className="summary-stats">
                        <div className="s-stat">
                            <div className="s-stat-val">{today.total ?? 0}</div>
                            <div className="s-stat-lbl">Total</div>
                        </div>
                        <div className="s-stat">
                            <div className="s-stat-val" style={{ color: 'var(--green)' }}>{today.taken ?? 0}</div>
                            <div className="s-stat-lbl">Taken</div>
                        </div>
                        <div className="s-stat">
                            <div className="s-stat-val" style={{ color: 'var(--blue)' }}>{today.remaining ?? 0}</div>
                            <div className="s-stat-lbl">Pending</div>
                        </div>
                        <div className="s-stat">
                            <div className="s-stat-val" style={{ color: 'var(--red)' }}>{today.missed ?? 0}</div>
                            <div className="s-stat-lbl">Missed</div>
                        </div>
                    </div>
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                </div>
            )}

            {/* ── Body ─────────────────────────────────── */}
            <div className="dash-body">
                <div className="dash-layout">

                    {/* LEFT COL: search + stats widget (desktop sticky sidebar) */}
                    <div className="dash-sidebar-col">
                        <div className="search-wrap">
                            <FaMagnifyingGlass className="search-icon" />
                            <input
                                className="search-input"
                                placeholder="Search medications…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {stats && (
                            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '16px 18px', boxShadow: 'var(--sh-xs)' }}>
                                <div className="section-title" style={{ marginBottom: 12 }}>Today's Overview</div>
                                {[
                                    { label: 'Total Scheduled', val: today.total ?? 0, color: 'var(--txt1)' },
                                    { label: 'Taken', val: today.taken ?? 0, color: 'var(--green)' },
                                    { label: 'Pending', val: today.remaining ?? 0, color: 'var(--blue)' },
                                    { label: 'Missed', val: today.missed ?? 0, color: 'var(--red)' },
                                ].map(({ label, val, color }) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: 13, color: 'var(--txt2)', fontWeight: 600 }}>{label}</span>
                                        <span style={{ fontSize: 18, fontWeight: 800, color }}>{val}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COL: medication list */}
                    <div className="dash-main-col">
                        <div className="section-title">
                            <span>Medications Due</span>
                            <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{filtered.length}</span>
                        </div>

                        {loading ? (
                            <div className="loading-wrap"><div className="spinner" /></div>
                        ) : filtered.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon"><FaCircleCheck style={{ color: 'var(--green)', fontSize: 42 }} /></div>
                                <div className="empty-title">
                                    {search ? 'No results' : 'All caught up!'}
                                </div>
                                <div className="empty-sub">
                                    {search ? `No medication matches "${search}"` : 'No medications scheduled for today.'}
                                </div>
                            </div>
                        ) : (
                            <div className="med-cards">
                                {filtered.map(m => (
                                    <MedicationCard key={m.id} med={m} onDone={load} />
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
