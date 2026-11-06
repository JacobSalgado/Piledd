import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="page home">
            {isAuthenticated ? (
                <>
                    <h1>Welcome back, {user.username}!</h1>
                    <p>Log your favorite books now!</p>
                </>
            ) : (
                <>
                    <h1>Welcome to Piledd</h1>
                    <p>Review and track your pile of books</p>
                    <div className="home-actions">
                        <Link to="/register" className="btn">Create an Account</Link>
                        <Link to="/login" className="btn btn-secondary">Log In</Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default Home;