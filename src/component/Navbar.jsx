import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] bg-white/85 px-4 py-4 backdrop-blur sm:px-8">
      <div>
        <Link to="/" className="text-2xl font-bold text-[var(--color-brand)]">Remide Mood</Link>
      </div>
      <ul className="flex list-none flex-wrap items-center gap-4 p-0 text-base font-medium sm:gap-6">
        <li><Link to="/" className="text-[var(--color-muted)] hover:text-[var(--color-brand)]">Home</Link></li>
        {user ? (
          <>
            <li><Link to="/dashboard" className="text-[var(--color-muted)] hover:text-[var(--color-brand)]">Journal</Link></li>
            {user.role === 'admin' && <li><Link to="/admin" className="text-[var(--color-muted)] hover:text-[var(--color-brand)]">Admin</Link></li>}
            <li><button onClick={logout} className="cursor-pointer border-0 bg-transparent p-0 text-base font-medium text-[var(--color-muted)] hover:text-[var(--color-brand)]">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login" className="text-[var(--color-muted)] hover:text-[var(--color-brand)]">Login</Link></li>
            <li><Link to="/register" className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-white hover:bg-[var(--color-brand-strong)]">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
