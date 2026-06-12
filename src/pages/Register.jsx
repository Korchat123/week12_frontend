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
      <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-md rounded-lg bg-white p-8 shadow">
        <h2 className="mb-6 mt-0 text-center text-2xl font-bold">Register</h2>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        {message && <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}      
          disabled={isSubmitting}
          required
          className="mb-4 w-full rounded-md border border-gray-200 p-3"
        />
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}  
          disabled={isSubmitting}
          required
          className="mb-4 w-full rounded-md border border-gray-200 p-3"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}     
          disabled={isSubmitting}
          required
          className="mb-4 w-full rounded-md border border-gray-200 p-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}  
          disabled={isSubmitting}
          required
          className="mb-4 w-full rounded-md border border-gray-200 p-3"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-md border-0 bg-indigo-600 p-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
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
