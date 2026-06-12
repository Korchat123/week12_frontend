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
      <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-md rounded-lg bg-white p-8 shadow">
        <h2 className="mb-6 mt-0 text-center text-2xl font-bold">Login</h2>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          required
          className="mb-4 w-full rounded-md border border-gray-200 p-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          required
          className="mb-4 w-full rounded-md border border-gray-200 p-3"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-md border-0 bg-indigo-600 p-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
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
