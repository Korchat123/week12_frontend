import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DiaryProvider } from './context/DiaryContext';
import Navbar from './component/Navbar';
import ProtectedRoute from './component/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ConfirmRegistration from './pages/ConfirmRegistration';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import axios from 'axios';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "BCrZjjEpR_BhhrfkOwjFNZbWnQTQ_qxVvkIeNXpPEoy0ZMw-fgzGnIQbOfBnB24sFUNp7027mvocgoapM1Y2hzI";

function AppContent() {
  const { user } = useAuth();

  async function registerPush() {
    try {
      if (!('Notification' in window)) {
        console.warn('Push notifications are not supported by this browser');
        return;
      }

      if (!VAPID_PUBLIC_KEY) {
        console.warn('Missing VAPID public key for push notifications');
        return;
      }

      const permission = Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();

      if (permission !== 'granted') {
        console.log('Push notifications not allowed');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW Registered');

      let subscription = await registration.pushManager.getSubscription();
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      if (subscription && !isSubscriptionUsingKey(subscription, applicationServerKey)) {
        await subscription.unsubscribe();
        subscription = null;
      }

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
      }

      await axios.put('api/v2/users/subscribe', {
        subscription,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      console.log('Push Subscribed');
    } catch (err) {
      console.error('Push registration failed:', err);
    }
  }

  useEffect(() => {
    if (user && 'serviceWorker' in navigator && 'PushManager' in window) {
      registerPush();
    }
  }, [user]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/confirm-registration" element={<ConfirmRegistration />} />
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

function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function isSubscriptionUsingKey(subscription, applicationServerKey) {
  const existingKey = subscription.options?.applicationServerKey;
  if (!existingKey) return true;
  return arrayBufferToBase64Url(existingKey) === arrayBufferToBase64Url(applicationServerKey);
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
      <DiaryProvider>
        <Router>
          <Navbar />
          <AppContent />
        </Router>
      </DiaryProvider>
    </AuthProvider>
  );
}

export default App;
