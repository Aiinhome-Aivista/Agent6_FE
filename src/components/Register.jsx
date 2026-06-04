import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role_id: ''
    });
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch roles from the backend API when component loads
        const fetchRoles = async () => {
            try {
                const response = await api.get('/roles/');
                setRoles(response.data);
                if (response.data.length > 0) {
                    setFormData(f => ({ ...f, role_id: response.data[0].id }));
                }
            } catch (err) {
                console.error("Failed to load roles", err);
                setError("Could not load roles. Make sure the backend API is running.");
            }
        };
        fetchRoles();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role_id: parseInt(formData.role_id)
            });
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h2>Create Account</h2>
                {error && <div className="error-msg">{error}</div>}
                {success && <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>{success}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            value={formData.username} 
                            onChange={(e) => setFormData({...formData, username: e.target.value})} 
                            required 
                            placeholder="Choose a username"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            value={formData.email} 
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            required 
                            placeholder="your.email@company.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={formData.password} 
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            required 
                            placeholder="Create a strong password"
                        />
                    </div>
                    <div className="form-group">
                        <label>Select Role</label>
                        <select 
                            value={formData.role_id}
                            onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                            required
                        >
                            {roles.length === 0 && <option value="">Loading roles...</option>}
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-submit" disabled={loading || roles.length === 0}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>
                
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem' }}>
                    Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: '500' }}>Sign in</Link>
                </p>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link to="/" style={{ color: '#64748b', fontSize: '0.85rem' }}>← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
