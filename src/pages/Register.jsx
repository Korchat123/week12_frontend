import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/v2/users', formData);
      if (response.data.success) {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Register</h2>
        {error && <p className="error">{error}</p>}
        <input 
          type="text" 
          placeholder="Username" 
          value={formData.username} 
          onChange={(e) => setFormData({...formData, username: e.target.value})} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={formData.email} 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={formData.password} 
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
          required 
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
