import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';
import {
    FaArrowLeft, FaUser, FaCheck, FaRightFromBracket,
    FaPhone, FaNotesMedical, FaWeightScale, FaArrowRight, FaCircleCheck
} from 'react-icons/fa6';

export default function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const isSetup = new URLSearchParams(location.search).get('setup') === '1';
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [dark, setDark] = useState(
        document.documentElement.getAttribute('data-theme') === 'dark'
    );

    useEffect(() => {
        getProfile()
            .then(r => setProfile(r.data))
            .catch(() => navigate('/login'))
            .finally(() => setLoading(false));
    }, [navigate]);

    const toggleTheme = () => {
        const next = dark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        setDark(!dark);
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true); setSaved(false); setSaveError('');
        try {
            await updateProfile(profile);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setSaveError('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const set = (k) => (e) => setProfile(p => ({ ...p, [k]: e.target.value }));

    if (loading) return (
        <div className="loading-wrap">
            <div className="spinner" />
        </div>
    );

    const user = profile?.user_details || {};
    const initials = user.first_name?.[0]?.toUpperCase() || 'U';

    return (
        <div className="profile-wrap">
            {/* Setup banner */}
            {isSetup && (
                <div style={{
                    background: 'linear-gradient(135deg, var(--blue), var(--blue-dark))',
                    borderRadius: 20, padding: '18px 20px', marginBottom: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    boxShadow: 'var(--sh-blue)',
                }}>
                    <div>
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, marginBottom: 4 }}>👋 Set up your profile first!</div>
                        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 13, fontWeight: 500 }}>Help us personalise your experience and set your emergency contact.</div>
                    </div>
                    <button
                        style={{ background: 'rgba(255,255,255,.2)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: 14, padding: '10px 16px', fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}
                        onClick={() => { sessionStorage.setItem('profile_prompted', 'done'); navigate('/'); }}
                    >
                        Skip <FaArrowRight size={12} />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft /></button>
                <h1 className="page-title">{isSetup ? 'Complete Profile' : 'My Profile'}</h1>
            </div>

            {/* Avatar card */}
            <div className="profile-header">
                <div className="profile-avatar">{initials}</div>
                <div>
                    <div className="profile-name">{user.first_name || 'User'}</div>
                    <div className="profile-email">{user.email || '—'}</div>
                </div>
            </div>

            {/* Edit form */}
            <form onSubmit={save}>
                <div className="profile-section-card">
                    <div className="section-header"><FaUser size={13} /> Personal Details</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-row-2">
                            <div className="form-group">
                                <label className="form-label">Age</label>
                                <input className="form-input" type="number" placeholder="—"
                                    value={profile?.age || ''} onChange={set('age')} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <select className="form-input" value={profile?.gender || ''} onChange={set('gender')}>
                                    <option value="">Select</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="O">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label"><FaWeightScale size={12} /> Weight (kg)</label>
                            <input className="form-input" type="number" placeholder="—"
                                value={profile?.weight || ''} onChange={set('weight')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label"><FaNotesMedical size={12} /> Medical Conditions</label>
                            <textarea className="form-input" placeholder="Hypertension, Diabetes…"
                                value={profile?.medical_conditions || ''} onChange={set('medical_conditions')} />
                        </div>
                    </div>
                </div>

                <div className="profile-section-card">
                    <div className="section-header"><FaPhone size={13} /> Emergency Contact</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input className="form-input" type="text" placeholder="Contact name"
                                value={profile?.emergency_contact_name || ''} onChange={set('emergency_contact_name')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input className="form-input" type="text" placeholder="+263 7xx xxx xxx"
                                value={profile?.emergency_contact_phone || ''} onChange={set('emergency_contact_phone')} />
                        </div>
                    </div>
                </div>

                {saveError && <div className="error-banner">{saveError}</div>}
                {saved && (
                    <div style={{ background: 'var(--green-light)', color: 'var(--green)', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, border: '1px solid var(--green-soft)' }}>
                        <FaCircleCheck /> Profile saved successfully!
                    </div>
                )}
                <button className="btn-primary" type="submit" disabled={saving}>
                    {saving ? 'Saving…' : <><FaCheck /> {isSetup ? 'Save & Go to Dashboard' : 'Save Profile'}</>}
                </button>
            </form>

            {/* Theme toggle */}
            <div className="theme-toggle" style={{ marginTop: 16 }}>
                <div>
                    <div style={{ fontWeight: 700 }}>Appearance</div>
                    <div style={{ fontSize: 13, color: 'var(--txt2)', fontWeight: 500 }}>
                        {dark ? 'Dark Mode' : 'Light Mode'}
                    </div>
                </div>
                <div className={`toggle-track ${dark ? 'on' : ''}`} onClick={toggleTheme}>
                    <div className="toggle-knob" />
                </div>
            </div>

            {/* Logout */}
            <button
                className="logout-btn"
                style={{ marginTop: 12 }}
                onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            >
                <FaRightFromBracket /> Sign Out
            </button>
        </div>
    );
}
