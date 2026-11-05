import { Link, NavLink } from 'react-router-dom'

function Navbar() {
    return (
        <nav className="navbar">
            <Link to="/" className="brand">Piledd</Link>
            <div className="nav-links">
                <NavLink to="/" end>Home</NavLink>
                <NavLink to="/login" end>Login</NavLink>
                <NavLink to="/reister" end>Register</NavLink>
            </div>
        </nav>
    )
}
export default Navbar;