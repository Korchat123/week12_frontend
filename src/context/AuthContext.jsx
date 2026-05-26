import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// axios default configuration
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';
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

  const googleLogin = async (credential) => {
    try {
      const response = await axios.post('api/v2/users/google-login', {
        token: credential
      });
      if (response.data.success) {
        await checkAuth();
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.message || 'Google Login failed'
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

  const register = async (formData) => {
    try {
      const response = await axios.post('api/v2/users/hashpass/', formData);
      if (response.data.success) {
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.message || 'Registration failed'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, googleLogin, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
