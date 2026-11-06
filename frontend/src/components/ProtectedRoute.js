import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // remember they were so Login can send them back
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return children;
}
export default ProtectedRoute;