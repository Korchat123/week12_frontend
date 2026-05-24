import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">DiaryApp</Link>
      </div>
      <ul className="nav-links">
        {user ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            {user.role === 'admin' && <li><Link to="/admin">Admin</Link></li>}
            <li><button onClick={logout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
