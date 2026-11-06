import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="brand">Piledd</Link>
            <div className="nav-links">
                <NavLink to="/" end>Home</NavLink>

                {isAuthenticated ? (
                    <>
                        <span className="nav-user">Hi, {user.username}</span>
                        <button className="btn-link" onClick={handleLogout}>Log Out</button>
                    </>
                ) : (
                    <>
                        <NavLink to="/login">Login</NavLink>
                        <NavLink to="/register">Register</NavLink>
                    </>
                )}
            </div>
        </nav>
    );
}
export default Navbar;