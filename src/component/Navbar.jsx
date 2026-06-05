import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-4 sm:px-8">
      <div>
        <Link to="/" className="text-2xl font-bold text-indigo-600">DiaryApp</Link>
      </div>
      <ul className="flex list-none flex-wrap items-center gap-4 p-0 text-base font-medium sm:gap-6">
        <li><Link to="/" className="text-gray-900 hover:text-indigo-600">Home</Link></li>
        {user ? (
          <>
            <li><Link to="/dashboard" className="text-gray-900 hover:text-indigo-600">Journal</Link></li>
            {user.role === 'admin' && <li><Link to="/admin" className="text-gray-900 hover:text-indigo-600">Admin</Link></li>}
            <li><button onClick={logout} className="cursor-pointer border-0 bg-transparent p-0 text-base font-medium text-gray-900 hover:text-indigo-600">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login" className="text-gray-900 hover:text-indigo-600">Login</Link></li>
            <li><Link to="/register" className="text-gray-900 hover:text-indigo-600">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
