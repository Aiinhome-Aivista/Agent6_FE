import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { username, password });
            const loggedInUser = response.data.user;
            login(loggedInUser, response.data.access_token);
            if (loggedInUser.role_id === 5) {
                navigate('/manage-application');
            } else if (loggedInUser.role_id === 3 || loggedInUser.role_id === 4) {
                navigate('/case-queue');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials and ensure the API is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h2>Sign In to IUA</h2>
                {error && <div className="error-msg">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            placeholder="Enter your username"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                placeholder="••••••••"
                                style={{ paddingRight: '2.75rem', width: '100%' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#64748b',
                                    padding: 0
                                }}
                            >
                                {showPassword ? <VisibilityOffIcon style={{ fontSize: '20px' }} /> : <VisibilityIcon style={{ fontSize: '20px' }} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-submit" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </button>
                </form>

                {/* Quick Login Section for Testing */}
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase' }}>
                        Quick Test Logins
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                        {[
                            { label: 'Broker', user: 'broker_john' },
                            { label: 'Underwriter', user: 'underwriter_jane' },
                            { label: 'Senior UW', user: 'senior_uw' },
                            { label: 'Manager', user: 'manager_user' }
                        ].map(account => (
                            <button
                                key={account.user}
                                type="button"
                                onClick={() => {
                                    setUsername(account.user);
                                    setPassword('password123');
                                }}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    backgroundColor: '#f1f5f9',
                                    color: '#334155',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#e2e8f0';
                                    e.target.style.borderColor = '#94a3b8';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#f1f5f9';
                                    e.target.style.borderColor = '#cbd5e1';
                                }}
                            >
                                {account.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* 
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#2563eb', fontWeight: '500' }}>Register here</Link>
                </p> 
                */}
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link to="/" style={{ color: '#64748b', fontSize: '0.85rem' }}>← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
