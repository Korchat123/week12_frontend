import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../component/Diary.css';

export default function Home() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchReminders = async () => {
        try {
          const response = await axios.get('v2/notes');
          const now = new Date();
          // Filter future reminders and sort by date
          const future = response.data.data
            .filter(n => n.reminderDate && new Date(n.reminderDate) > now)
            .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));
          setReminders(future);
        } catch (error) {
          console.error('Failed to fetch reminders', error);
        }
      };
      fetchReminders();
    }
  }, [user]);

  const getProximityClass = (dateString) => {
    const now = new Date();
    const target = new Date(dateString);
    const diffHours = (target - now) / (1000 * 60 * 60);

    if (diffHours <= 24) return 'prox-red';      // Within 24 hours
    if (diffHours <= 72) return 'prox-yellow';   // Within 3 days
    return 'prox-gray';                          // Further away
  };

  if (!user) {
    return (
      <div className="home-guest">
        <header className="hero-section">
          <h1>Plan Your Life, Track Your Mood</h1>
          <p>The smartest full-stack diary app to keep you organized.</p>
          <div className="hero-actions">
            <Link to="/login" className="btn-primary">Login Now</Link>
            <Link to="/register" className="btn-secondary">Get Started</Link>
          </div>
        </header>

        <section className="example-section">
          <h3>Example Reminders</h3>
          <div className="reminder-grid">
            <div className="reminder-card prox-red">
              <span className="prox-tag">TOMORROW</span>
              <h4>Meeting with Client</h4>
              <p>Prepare the project presentation and reports.</p>
            </div>
            <div className="reminder-card prox-yellow">
              <span className="prox-tag">IN 3 DAYS</span>
              <h4>Dentist Appointment</h4>
              <p>Regular checkup at the clinic.</p>
            </div>
            <div className="reminder-card prox-gray">
              <span className="prox-tag">NEXT WEEK</span>
              <h4>Buy Groceries</h4>
              <p>Don't forget the milk and eggs.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="home-user">
      <header className="welcome-header">
        <h1>Hello, {user.name || user.username}! 👋</h1>
        <p>Here are your upcoming reminders:</p>
      </header>

      <div className="reminder-alerts">
        {reminders.length > 0 ? (
          <div className="reminder-grid">
            {reminders.map(r => (
              <Link key={r._id} to="/dashboard" className={`reminder-card ${getProximityClass(r.reminderDate)}`}>
                <span className="prox-tag">{new Date(r.reminderDate).toLocaleDateString()}</span>
                <h4>{r.topic}</h4>
                <p>{r.detail.substring(0, 100)}{r.detail.length > 100 ? '...' : ''}</p>
                <span className="time-tag">{new Date(r.reminderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-reminders">
            <p>You have no upcoming reminders. Go to your <Link to="/dashboard">Dashboard</Link> to add some!</p>
          </div>
        )}
      </div>
    </div>
  );
}
