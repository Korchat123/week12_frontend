import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './component/Navbar';
import ProtectedRoute from './component/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import axios from 'axios';
import './App.css';

function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    if (user && 'serviceWorker' in navigator && 'PushManager' in window) {
      registerPush();
    }
  }, [user]);

  const registerPush = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW Registered');

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const publicVapidKey = "BCrZjjEpR_BhhrfkOwjFNZbWnQTQ_qxVvkIeNXpPEoy0ZMw-fgzGnIQbOfBnB24sFUNp7027mvocgoapM1Y2hzI"; // Replace with your real key
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
      }

      await axios.put('v2/users/subscribe', { subscription });
      console.log('Push Subscribed');
    } catch (err) {
      console.error('Push registration failed:', err);
    }
  };

  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <Admin />
            </ProtectedRoute>
          }
        />
        {/* Catch-all route to redirect unmatched paths to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
