import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { FaPills, FaEnvelope, FaLock, FaTriangleExclamation } from 'react-icons/fa6';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const res = await login({ username: email, password });
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            localStorage.setItem('user', JSON.stringify(res.data.user || {}));
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid email or password.');
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

                <h1 className="auth-heading">Welcome back</h1>
                <p className="auth-tagline">Sign in to manage your medications</p>

                {error && (
                    <div className="auth-error">
                        <FaTriangleExclamation /> {error}
                    </div>
                )}

                <form onSubmit={submit} className="auth-form-inner">
                    <div className="auth-field">
                        <label><FaEnvelope size={10} style={{ marginRight: 4 }} />Email or Username</label>
                        <input
                            type="text" placeholder="you@example.com"
                            value={email} onChange={e => setEmail(e.target.value)}
                            required autoComplete="username"
                        />
                    </div>

                    <div className="auth-field">
                        <label><FaLock size={10} style={{ marginRight: 4 }} />Password</label>
                        <input
                            type="password" placeholder="••••••••"
                            value={password} onChange={e => setPassword(e.target.value)}
                            required autoComplete="current-password"
                        />
                    </div>

                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? <span className="auth-spinner" /> : 'Sign In'}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}
