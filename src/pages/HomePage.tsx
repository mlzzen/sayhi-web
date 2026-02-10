import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './HomePage.css';

export function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>SayHi</h1>
        <div className="user-info">
          <span>Welcome, {user?.username}</span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="home-content">
        <div className="features-card">
          <h2>Welcome to SayHi!</h2>
          <p>Your chat application is set up and ready to use.</p>

          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>User registration and login</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>JWT authentication</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⏳</span>
              <span>Friend system (coming soon)</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⏳</span>
              <span>Real-time messaging (coming soon)</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⏳</span>
              <span>Group chat (coming soon)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
