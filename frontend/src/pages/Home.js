import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import MediaCard from '../components/MediaCard';

function Home() {
  const { user, isAuthenticated } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false; // prevents setting state after unmount

    async function loadFeatured() {
      try {
        const res = await api.get('/media/featured');
        if (!ignore) setSections(res.data.sections);
      } catch {
        if (!ignore) setError('Could not load featured titles. Please try again later.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadFeatured();
    return () => {
      ignore = true;
    };
  }, []); // empty array = run once when the page loads

  return (
    <div className="page home">
      <section className="hero">
        {isAuthenticated ? (
          <h1>Welcome back, {user.username}!</h1>
        ) : (
          <>
            <h1>Track every book, comic, and manga you read.</h1>
            <p>Log what you've read, write reviews, and build your shelf.</p>
            <div className="home-actions">
              <Link to="/register" className="btn">Get Started</Link>
              <Link to="/login" className="btn btn-secondary">Log In</Link>
            </div>
          </>
        )}
      </section>

      {loading && <p>Loading titles...</p>}
      {error && <p className="error">{error}</p>}

      {sections.map((section) => (
        <section key={section.id} className="media-section">
          <h2>{section.title}</h2>
          <div className="media-row">
            {section.items.map((item) => (
              <MediaCard key={item._id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default Home;