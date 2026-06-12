import { useState } from 'react';
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

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function AppContent() {
  const { user } = useAuth();
  const [notificationStatus, setNotificationStatus] = useState('');

  async function registerPush() {
    try {
      if (!('Notification' in window)) {
        setNotificationStatus('Browser notifications are not supported here.');
        return;
      }

      if (!VAPID_PUBLIC_KEY) {
        setNotificationStatus('Notification key is not configured.');
        return;
      }

      const permission = Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();

      if (permission !== 'granted') {
        setNotificationStatus('Notification permission was not allowed.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
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
      setNotificationStatus('Browser reminders are enabled.');
    } catch (err) {
      console.error('Push registration failed:', err);
      setNotificationStatus('Could not enable browser reminders.');
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      {user && (
        <section className="mb-5 flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-white/90 p-4 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text)]">Browser reminders</h2>
            <p className="text-sm text-[var(--color-muted)]">
              Enable notifications only when you want this browser to receive reminders.
            </p>
            {notificationStatus && <p className="mt-1 text-sm text-[var(--color-muted)]">{notificationStatus}</p>}
          </div>
          <button
            type="button"
            onClick={registerPush}
            className="cursor-pointer rounded-lg border-0 bg-[var(--color-brand)] px-4 py-2 font-semibold text-white hover:bg-[var(--color-brand-strong)]"
          >
            Enable reminders
          </button>
        </section>
      )}
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
    </main>
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
