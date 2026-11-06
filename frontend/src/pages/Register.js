import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Register() {
    // form fields
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // this is the change handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // this handles submissions
    const handleSubmit = async (e) => {
        e.preventDefault(); // stop browser from reloading page
        setError('');

        // client-side validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const { username, email, password } = formData; // don't send confirmPassword
            await api.post('/auth/register', { username, email, password });

            // send them to login with a success message
            navigate('/login', {
                state: { message: 'Account successfully created! Please log in.' },
            });
        } catch (err) {
            // backend message (generic one for now)
            setError(err.response?.data?.message || 'Registration failed. Please try again');
        } finally {
            setLoading(false);
        }
    };

    // form 
    return (
        <div className="page auth-page">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Create your account</h2>

                {error && <p className="error">{error}</p>}

                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
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
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Register'}
                </button>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Log In</Link>
                </p>
            </form>
        </div>
    );
}

export default Register;