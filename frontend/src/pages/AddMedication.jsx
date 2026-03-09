import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMedication } from '../services/api';
import { FaArrowLeft, FaCapsules, FaClock, FaCalendarDays, FaClipboard, FaCheck } from 'react-icons/fa6';

export default function AddMedication() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', dosage: '',
        reminder_time: '08:00',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '', notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            // Django expects HH:MM:SS
            const payload = {
                ...form,
                reminder_time: form.reminder_time.length === 5
                    ? form.reminder_time + ':00'
                    : form.reminder_time,
                end_date: form.end_date || null,
            };
            await addMedication(payload);
            window.dispatchEvent(new Event('medicationUpdated'));
            navigate('/');
        } catch (err) {
            setError('Failed to save medication. Please check the fields.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft />
                </button>
                <h1 className="page-title">Add Medication</h1>
            </div>

            <div className="form-card">
                <form className="form-section" onSubmit={submit}>

                    <div className="form-group">
                        <label className="form-label"><FaCapsules size={12} /> Medication Name</label>
                        <input
                            className="form-input" type="text" required
                            placeholder="e.g. Paracetamol"
                            value={form.name} onChange={set('name')}
                        />
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label className="form-label">Dosage</label>
                            <input
                                className="form-input" type="text" required
                                placeholder="500mg"
                                value={form.dosage} onChange={set('dosage')}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label"><FaClock size={12} /> Time</label>
                            <input
                                className="form-input" type="time" required
                                value={form.reminder_time} onChange={set('reminder_time')}
                            />
                        </div>
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label className="form-label"><FaCalendarDays size={12} /> Start Date</label>
                            <input
                                className="form-input" type="date" required
                                value={form.start_date} onChange={set('start_date')}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Date (opt.)</label>
                            <input
                                className="form-input" type="date"
                                value={form.end_date} onChange={set('end_date')}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label"><FaClipboard size={12} /> Instructions</label>
                        <textarea
                            className="form-input"
                            placeholder="Take after food, avoid alcohol…"
                            value={form.notes} onChange={set('notes')}
                        />
                    </div>

                    {error && <div className="error-banner">{error}</div>}

                    <button className="btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Saving…' : <><FaCheck /> Save Medication</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
