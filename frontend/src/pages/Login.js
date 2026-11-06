import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // message passed from Register ("Account created!")
    const successMessage = location.state?.message;
    // page the user was trying to reach before being sent to login
    const redirectTo = location.state?.from?.pathname || '/';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/login', formData);
            const { token, user } = res.data;

            login(token, user);                 // save to context + localStorage
            navigate(redirectTo, { replace: true });     // replace so "Back" doesn't return to login
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="path auth-page">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Log In</h2>

                {successMessage && <p className="success">{successMessage}</p>}
                {error && <p className="error">{error}</p>}

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Log In'}
                </button>

                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </form>
        </div>
    )
}

export default Login;