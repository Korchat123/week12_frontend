import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-[#e6ddd4] bg-[#fffdf8]/90 px-4 py-4 backdrop-blur sm:px-8">
      <div>
        <Link to="/" className="text-2xl font-bold text-[#2f7d73]">Mindful Diary</Link>
      </div>
      <ul className="flex list-none flex-wrap items-center gap-4 p-0 text-base font-medium sm:gap-6">
        <li><Link to="/" className="text-[#53615d] hover:text-[#2f7d73]">Home</Link></li>
        {user ? (
          <>
            <li><Link to="/dashboard" className="text-[#53615d] hover:text-[#2f7d73]">Journal</Link></li>
            {user.role === 'admin' && <li><Link to="/admin" className="text-[#53615d] hover:text-[#2f7d73]">Admin</Link></li>}
            <li><button onClick={logout} className="cursor-pointer border-0 bg-transparent p-0 text-base font-medium text-[#53615d] hover:text-[#2f7d73]">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login" className="text-[#53615d] hover:text-[#2f7d73]">Login</Link></li>
            <li><Link to="/register" className="rounded-lg bg-[#2f7d73] px-4 py-2 text-white hover:bg-[#25685f]">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
