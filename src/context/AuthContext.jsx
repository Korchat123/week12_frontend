import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// axios default configuration
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://backend-sh3b.onrender.com/';
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await axios.get('api/v2/users/auth/me');
      if (response.data.success) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('api/v2/users/login', { email, password });
      if (response.data.success) {
        setUser(response.data);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('api/v2/users/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
const initialized = useRef(false);

useEffect(() => {
  if (!initialized.current) {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCallbackResponse
    });
    initialized.current = true;
  }
}, []);