import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import {
    FaPills, FaUser, FaEnvelope, FaLock,
    FaTriangleExclamation, FaShield, FaBan, FaInfinity
} from 'react-icons/fa6';

export default function Register() {
    const [form, setForm] = useState({ first_name: '', email: '', password: '', confirm_password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return; }
        setLoading(true);
        try {
            const res = await register(form);
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            localStorage.setItem('user', JSON.stringify(res.data.user || {}));
            window.location.href = '/';
        } catch (err) {
            const data = err.response?.data;
            setError(
                typeof data === 'object'
                    ? Object.values(data).flat().join(' ')
                    : 'Registration failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-root">
            <div className="auth-blob auth-blob-1" />
            <div className="auth-blob auth-blob-2" />
            <div className="auth-blob auth-blob-3" />

            <div className="auth-card">
                <div className="auth-logo-row">
                    <div className="auth-logo-pill"><FaPills /></div>
                    <span className="auth-logo-name">MedReminder</span>
                </div>

                <h1 className="auth-heading">Create your account</h1>
                <p className="auth-tagline">Free forever · No credit card needed</p>

                {error && (
                    <div className="auth-error">
                        <FaTriangleExclamation /> {error}
                    </div>
                )}

                <form onSubmit={submit} className="auth-form-inner">
                    <div className="auth-field">
                        <label><FaUser size={10} style={{ marginRight: 4 }} />Full Name</label>
                        <input
                            type="text" placeholder="Your name"
                            value={form.first_name} onChange={set('first_name')}
                            required autoComplete="name"
                        />
                    </div>

                    <div className="auth-field">
                        <label><FaEnvelope size={10} style={{ marginRight: 4 }} />Email Address</label>
                        <input
                            type="email" placeholder="you@example.com"
                            value={form.email} onChange={set('email')}
                            required autoComplete="email"
                        />
                    </div>

                    <div className="auth-field-row">
                        <div className="auth-field">
                            <label><FaLock size={10} style={{ marginRight: 4 }} />Password</label>
                            <input
                                type="password" placeholder="Min. 6 chars"
                                value={form.password} onChange={set('password')}
                                required autoComplete="new-password"
                            />
                        </div>
                        <div className="auth-field">
                            <label><FaLock size={10} style={{ marginRight: 4 }} />Confirm</label>
                            <input
                                type="password" placeholder="Repeat"
                                value={form.confirm_password} onChange={set('confirm_password')}
                                required autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? <span className="auth-spinner" /> : 'Create Account'}
                    </button>
                </form>

                {/* Trust badges — icons instead of emojis */}
                <div className="auth-trust">
                    <span><FaShield size={11} /> Secure</span>
                    <span><FaBan size={11} /> No spam</span>
                    <span><FaInfinity size={11} /> Free forever</span>
                </div>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
