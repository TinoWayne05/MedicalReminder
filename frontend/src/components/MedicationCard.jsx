import { useState } from 'react';
import { addLog } from '../services/api';
import { FaCheck, FaXmark, FaClock, FaCapsules, FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';

const fmtTime = (t) => {
    if (!t) return '--:--';
    const [h, m] = t.split(':');
    const d = new Date(); d.setHours(+h); d.setMinutes(+m);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getTimingStatus = (reminderTime) => {
    if (!reminderTime) return 'upcoming';
    const [h, m] = reminderTime.split(':').map(Number);
    const due = new Date(); due.setHours(h, m, 0, 0);
    const diff = (due - Date.now()) / 60000;
    if (diff > 30) return 'upcoming';
    if (diff >= 0) return 'soon';
    if (diff >= -15) return 'late';
    return 'overdue';
};

export default function MedicationCard({ med, onDone }) {
    const [localStatus, setLocalStatus] = useState(med.today_status);
    const [loading, setLoading] = useState(false);

    const act = async (status) => {
        if (localStatus === 'taken' || localStatus === 'missed') return;
        setLoading(true);
        try {
            await addLog({ medication: med.id, status });
            setLocalStatus(status);
            setTimeout(() => onDone?.(), 700);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const timing = getTimingStatus(med.reminder_time);

    // ── TAKEN ──
    if (localStatus === 'taken') {
        return (
            <div className="med-card med-card-done">
                <div className="med-time-row">
                    <div className="med-time-dot" style={{ background: 'var(--green)' }} />
                    <span className="med-time-label" style={{ color: 'var(--green)' }}>Given</span>
                    <span className="med-time-val">· {fmtTime(med.reminder_time)}</span>
                </div>
                <div className="card-row" style={{ paddingBottom: 12 }}>
                    <div className="med-icon" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
                        <FaCircleCheck />
                    </div>
                    <div className="med-meta">
                        <div className="med-name" style={{ color: 'var(--green)' }}>{med.name}</div>
                        <div className="med-dose">{med.dosage}</div>
                    </div>
                </div>
            </div>
        );
    }

    // ── MISSED ──
    if (localStatus === 'missed') {
        return (
            <div className="med-card med-card-done">
                <div className="med-time-row">
                    <div className="med-time-dot" style={{ background: 'var(--red)' }} />
                    <span className="med-time-label" style={{ color: 'var(--red)' }}>Skipped</span>
                    <span className="med-time-val">· {fmtTime(med.reminder_time)}</span>
                </div>
                <div className="card-row" style={{ paddingBottom: 12 }}>
                    <div className="med-icon" style={{ background: 'var(--red-light)', color: 'var(--red)' }}>
                        <FaCircleXmark />
                    </div>
                    <div className="med-meta">
                        <div className="med-name" style={{ color: 'var(--red)' }}>{med.name}</div>
                        <div className="med-dose">{med.dosage}</div>
                    </div>
                </div>
            </div>
        );
    }

    // ── PENDING ──
    const isOverdue = timing === 'overdue';
    const isSoon = timing === 'soon' || timing === 'late';

    return (
        <div className="med-card">
            {/* Time header row */}
            <div className="med-time-row">
                <div className={`med-time-dot${isOverdue ? '' : ''}`}
                    style={{ background: isOverdue ? 'var(--red)' : isSoon ? 'var(--yellow)' : 'var(--blue)' }}
                />
                <span className="med-time-label"
                    style={{ color: isOverdue ? 'var(--red)' : isSoon ? 'var(--yellow)' : 'var(--blue)' }}>
                    {isOverdue ? 'Overdue' : isSoon ? 'Due Soon' : 'Upcoming'}
                </span>
                <span className="med-time-val">· {fmtTime(med.reminder_time)}</span>
            </div>

            {/* Drug info */}
            <div className="card-row">
                <div className={`med-icon${isOverdue ? ' med-icon-overdue' : isSoon ? ' med-icon-soon' : ''}`}>
                    <FaCapsules />
                </div>
                <div className="med-meta">
                    <div className="med-name">{med.name}</div>
                    <div className="med-dose">{med.dosage}</div>
                    {med.notes && <div className="card-notes" style={{ padding: 0, marginTop: 5, border: 'none', background: 'none', fontSize: 11, color: 'var(--txt3)' }}>{med.notes}</div>}
                </div>
            </div>

            {/* Action buttons — MyDoses style */}
            <div className="card-actions">
                <button className="btn-taken" onClick={() => act('taken')} disabled={loading}>
                    <FaCheck size={12} /> {loading ? 'Saving…' : '✓ Given'}
                </button>
                <button className="btn-skip" onClick={() => act('missed')} disabled={loading}>
                    <FaXmark size={12} /> {localStatus === 'missed' ? 'Skipped' : '✗ Skip'}
                </button>
            </div>
        </div>
    );
}
