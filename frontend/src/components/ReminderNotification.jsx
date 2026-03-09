import { useState, useEffect, useRef, useCallback } from 'react';
import { getTodayMedications, addLog } from '../services/api';
import { FaCheck, FaXmark, FaBell, FaTriangleExclamation } from 'react-icons/fa6';

// ── Types of alerts ────────────────────────────────────────────────────────
//  'approaching' → 30 min before  (blue/amber)
//  'due'         → within 5 min   (amber)
//  'missed'      → 15+ min past   (red)

const diffMin = (reminderTime) => {
    if (!reminderTime) return null;
    const [h, m] = reminderTime.split(':').map(Number);
    const due = new Date(); due.setHours(h, m, 0, 0);
    return (due - Date.now()) / 60000;
};

const classify = (min) => {
    if (min === null) return null;
    if (min > 30) return null;       // too early
    if (min > 5) return 'approaching';
    if (min >= -5) return 'due';
    if (min >= -60) return 'missed';
    return null;                               // more than 60 min past → ignore
};

const CONFIG = {
    approaching: {
        icon: <FaBell />,
        title: 'Coming Up',
        emoji: '⏰',
        accent: 'var(--blue)',
        bg: 'var(--blue-light)',
        msg: (name, min) => `${name} is due in ${Math.round(min)} minutes.`,
        btnLabel: 'Take Early',
        btnClass: 'btn-taken',
    },
    due: {
        icon: <FaBell />,
        title: 'Time to Take',
        emoji: '⏰',
        accent: 'var(--yellow)',
        bg: 'var(--yellow-light)',
        msg: (name) => `It's time for your ${name}.`,
        btnLabel: 'Mark Taken',
        btnClass: 'btn-taken',
    },
    missed: {
        icon: <FaTriangleExclamation />,
        title: 'Missed Dose',
        emoji: '⚠️',
        accent: 'var(--red)',
        bg: 'var(--red-light)',
        msg: (name, min) => `You missed your ${name} dose ${Math.abs(Math.round(min))} minutes ago.`,
        btnLabel: 'Take Now',
        btnClass: 'btn-taken',
    },
};

export default function ReminderNotification() {
    const [queue, setQueue] = useState([]);   // { med, type }
    const snoozed = useRef({});           // { medId: expiresAt }
    const notified = useRef(new Set());    // medId + type combos already shown

    const check = useCallback(async () => {
        try {
            const res = await getTodayMedications();
            const now = Date.now();
            const toAdd = [];

            for (const med of res.data) {
                const min = diffMin(med.reminder_time);
                const type = classify(min);
                if (!type) continue;

                const key = `${med.id}-${type}`;

                // Respect snooze
                const snoozeExp = snoozed.current[med.id];
                if (snoozeExp && now < snoozeExp) continue;
                if (snoozeExp && now >= snoozeExp) delete snoozed.current[med.id];

                if (notified.current.has(key)) continue;

                toAdd.push({ med, type });
                notified.current.add(key);

                // Browser notification
                if (Notification.permission === 'granted') {
                    const cfg = CONFIG[type];
                    new Notification(`${cfg.emoji} ${cfg.title} — ${med.name}`, {
                        body: cfg.msg(med.name, min),
                        icon: '/favicon.ico',
                    });
                }
            }

            if (toAdd.length) {
                setQueue(prev => {
                    const seen = new Set(prev.map(q => `${q.med.id}-${q.type}`));
                    return [...prev, ...toAdd.filter(q => !seen.has(`${q.med.id}-${q.type}`))];
                });
            }
        } catch (_) { }
    }, []);

    useEffect(() => {
        if (Notification.permission === 'default') Notification.requestPermission();
        check();
        const id = setInterval(check, 60_000);
        return () => clearInterval(id);
    }, [check]);

    const dismiss = ({ med, type }) => {
        setQueue(p => p.filter(q => !(q.med.id === med.id && q.type === type)));
    };

    const act = async ({ med, type }, status) => {
        try { await addLog({ medication: med.id, status }); } catch (_) { }
        dismiss({ med, type });
        window.dispatchEvent(new Event('medicationUpdated'));
    };

    const snooze = ({ med, type }, mins) => {
        snoozed.current[med.id] = Date.now() + mins * 60_000;
        // Remove the current key so it can re-fire after snooze expires
        notified.current.delete(`${med.id}-${type}`);
        dismiss({ med, type });
    };

    if (!queue.length) return null;
    const item = queue[0];
    const { med, type } = item;
    const cfg = CONFIG[type];
    const min = diffMin(med.reminder_time);

    return (
        <div className="reminder-overlay">
            <div className="reminder-card" style={{ '--accent': cfg.accent }}>
                {/* header stripe */}
                <div style={{
                    height: 6, background: cfg.accent, borderRadius: '12px 12px 0 0',
                    margin: '-44px -36px 32px', width: 'calc(100% + 72px)'
                }} />

                <div className="reminder-emoji">{cfg.emoji}</div>
                <div className="reminder-title" style={{ color: cfg.accent }}>{cfg.title}</div>
                <div style={{
                    fontSize: 16, fontWeight: 700, color: 'var(--txt1)', marginBottom: 4, marginTop: 8
                }}>
                    {med.name}
                </div>
                <div className="reminder-sub">{cfg.msg(med.name, min)}</div>
                <div style={{ fontSize: 14, color: 'var(--txt2)', marginBottom: 28, fontWeight: 600 }}>
                    Dosage: {med.dosage}
                </div>

                <button
                    className={cfg.btnClass}
                    style={{ width: '100%', padding: 16, borderRadius: 16, fontSize: 16, fontWeight: 800, marginBottom: 0 }}
                    onClick={() => act(item, 'taken')}
                >
                    <FaCheck /> {cfg.btnLabel}
                </button>

                {/* Snooze row (only for non-missed) */}
                {type !== 'missed' && (
                    <div className="snooze-row" style={{ marginTop: 12 }}>
                        {[5, 10, 30].map(m => (
                            <button key={m} className="btn-snooze" onClick={() => snooze(item, m)}>
                                +{m} min
                            </button>
                        ))}
                    </div>
                )}

                <button className="btn-dismiss" onClick={() => act(item, 'missed')}>
                    {type === 'missed' ? 'Skip (already missed)' : 'Skip this dose'}
                </button>

                {queue.length > 1 && (
                    <div style={{
                        marginTop: 16, padding: '8px 12px',
                        background: 'var(--bg)', borderRadius: 10,
                        fontSize: 12, fontWeight: 700, color: 'var(--txt2)', textAlign: 'center'
                    }}>
                        +{queue.length - 1} more alert{queue.length > 2 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    );
}
