import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-md rounded-xl border border-[var(--color-border)] bg-white/90 p-8 shadow-[var(--shadow-soft)]">
        <h2 className="mb-2 mt-0 text-center text-2xl font-bold text-[var(--color-text)]">Welcome Back</h2>
        <p className="mb-6 text-center text-sm text-[var(--color-muted)]">Open your private journal and reminders.</p>
        {error && <p className="mb-4 rounded-lg bg-[#fff1ef] p-3 text-sm text-[#b05a5a]">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          required
          className="mb-4 w-full rounded-lg border border-[var(--color-border)] bg-white/90 p-3 text-[var(--color-text)] focus:border-[var(--color-brand)]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          required
          className="mb-4 w-full rounded-lg border border-[var(--color-border)] bg-white/90 p-3 text-[var(--color-text)] focus:border-[var(--color-brand)]"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-lg border-0 bg-[var(--color-brand)] p-3 font-semibold text-white hover:bg-[var(--color-brand-strong)] disabled:cursor-not-allowed disabled:bg-sky-300"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        <div className={`mt-4 flex justify-center ${isSubmitting ? 'pointer-events-none opacity-60' : ''}`}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Login failed')}
            useOneTap
          />
        </div>
      </form>
    </div>
  );
}
