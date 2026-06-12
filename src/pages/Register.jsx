import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const result = await register(formData);
      if (result.success) {
        setMessage(result.message || 'Check your email to confirm registration.');
      } else {
        setError(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-md rounded-xl border border-[#e6ddd4] bg-white/90 p-8 shadow-[var(--shadow-soft)]">
        <h2 className="mb-2 mt-0 text-center text-2xl font-bold text-[#24312f]">Create Your Space</h2>
        <p className="mb-6 text-center text-sm text-[#66736f]">Keep notes, mood check-ins, and gentle reminders together.</p>
        {error && <p className="mb-4 rounded-lg bg-[#fff1ef] p-3 text-sm text-[#b05a5a]">{error}</p>}
        {message && <p className="mb-4 rounded-lg bg-[#e4f2ee] p-3 text-sm text-[#25685f]">{message}</p>}
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}      
          disabled={isSubmitting}
          required
          className="mb-4 w-full rounded-lg border border-[#d9cec4] bg-white/90 p-3 text-[#24312f] focus:border-[#2f7d73]"
        />
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}  
          disabled={isSubmitting}
          required
          className="mb-4 w-full rounded-lg border border-[#d9cec4] bg-white/90 p-3 text-[#24312f] focus:border-[#2f7d73]"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}     
          disabled={isSubmitting}
          required
          className="mb-4 w-full rounded-lg border border-[#d9cec4] bg-white/90 p-3 text-[#24312f] focus:border-[#2f7d73]"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}  
          disabled={isSubmitting}
          required
          className="mb-4 w-full rounded-lg border border-[#d9cec4] bg-white/90 p-3 text-[#24312f] focus:border-[#2f7d73]"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-lg border-0 bg-[#2f7d73] p-3 font-semibold text-white hover:bg-[#25685f] disabled:cursor-not-allowed disabled:bg-[#9bc8c0]"
        >
          {isSubmitting ? 'Sending link...' : 'Register'}
        </button>

        <div className={`mt-4 flex justify-center ${isSubmitting ? 'pointer-events-none opacity-60' : ''}`}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Sign-up failed')}
            useOneTap
          />
        </div>
      </form>
    </div>
  );
}
