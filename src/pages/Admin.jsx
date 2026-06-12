import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [registrationExpireMinutes, setRegistrationExpireMinutes] = useState(1);
  const [settingsStatus, setSettingsStatus] = useState('');
  const [adminError, setAdminError] = useState('');
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [busyAction, setBusyAction] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await axios.get('api/v2/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
      setAdminError('Could not load users.');
    }
  };

  const fetchPendingRegistrations = async () => {
    try {
      const response = await axios.get('api/v2/users/pending-registrations');
      setPendingRegistrations(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pending registrations', error);
      setAdminError('Could not load pending registrations.');
    }
  };

  const fetchRegistrationSettings = async () => {
    try {
      const response = await axios.get('api/v2/users/registration-settings');
      setRegistrationExpireMinutes(response.data.data.registrationExpireMinutes);
    } catch (error) {
      console.error('Failed to fetch registration settings', error);
      setAdminError('Could not load registration settings.');
    }
  };

  useEffect(() => {
    const loadAdminData = async () => {
      setLoadingAdmin(true);
      await Promise.all([
        fetchUsers(),
        fetchPendingRegistrations(),
        fetchRegistrationSettings()
      ]);
      setLoadingAdmin(false);
    };

    loadAdminData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setBusyAction(`delete-${id}`);
        await axios.delete(`api/v2/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Delete failed', error);
        setAdminError(error.response?.data?.error || 'Delete failed.');
      } finally {
        setBusyAction('');
      }
    }
  };

  const handleDropPending = async (id) => {
    if (window.confirm('Drop this registration request?')) {
      try {
        setBusyAction(`drop-${id}`);
        await axios.delete(`api/v2/users/pending-registrations/${id}`);
        fetchPendingRegistrations();
      } catch (error) {
        console.error('Drop registration request failed', error);
        setAdminError(error.response?.data?.error || 'Drop registration request failed.');
      } finally {
        setBusyAction('');
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setBusyAction('update-user');
      await axios.put(`api/v2/users/${editingUser._id}`, editingUser);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Update failed', error);
      setAdminError(error.response?.data?.error || 'Update failed.');
    } finally {
      setBusyAction('');
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsStatus('');

    try {
      setBusyAction('settings');
      const response = await axios.put('api/v2/users/registration-settings', {
        registrationExpireMinutes: Number(registrationExpireMinutes)
      });
      setRegistrationExpireMinutes(response.data.data.registrationExpireMinutes);
      setSettingsStatus('Registration expiry updated.');
    } catch (error) {
      setSettingsStatus(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Could not update registration expiry.'
      );
    } finally {
      setBusyAction('');
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-[var(--color-text)]">Admin User Management</h1>
      {loadingAdmin && <p className="mb-4 rounded-lg bg-[var(--color-panel-muted)] p-3 text-sm text-[var(--color-muted)]">Loading admin data...</p>}
      {adminError && <p className="mb-4 rounded-lg bg-[#fff1ef] p-3 text-sm text-[#b05a5a]">{adminError}</p>}

      <section className="mb-8 rounded-xl border border-[var(--color-border)] bg-white/90 p-5 shadow-[var(--shadow-soft)]">
        <h2 className="mb-4 text-2xl font-bold text-[var(--color-text)]">Registration Settings</h2>
        <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex max-w-xs flex-1 flex-col gap-1 font-semibold text-[var(--color-muted)]">
            Link expiry minutes
            <input
              type="number"
              min="1"
              max="1440"
              value={registrationExpireMinutes}
              onChange={(event) => setRegistrationExpireMinutes(event.target.value)}
              className="rounded-lg border border-[var(--color-border)] p-3 font-normal text-[var(--color-text)]"
            />
          </label>
          <button type="submit" disabled={busyAction === 'settings'} className="cursor-pointer rounded-lg border-0 bg-[var(--color-brand)] px-5 py-3 font-semibold text-white hover:bg-[var(--color-brand-strong)] disabled:cursor-not-allowed disabled:bg-sky-300">
            {busyAction === 'settings' ? 'Saving...' : 'Save'}
          </button>
        </form>
        {settingsStatus && <p className="mt-3 text-sm text-[var(--color-muted)]">{settingsStatus}</p>}
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold text-[var(--color-text)]">Pending Registrations</h2>
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white/90 shadow-[var(--shadow-soft)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--color-panel-muted)] text-[var(--color-muted)]">
                <th className="border-b border-[var(--color-border)] p-4 text-left font-semibold">Name</th>
                <th className="border-b border-[var(--color-border)] p-4 text-left font-semibold">Username</th>
                <th className="border-b border-[var(--color-border)] p-4 text-left font-semibold">Email</th>
                <th className="border-b border-[var(--color-border)] p-4 text-left font-semibold">Expires</th>
                <th className="border-b border-[var(--color-border)] p-4 text-left font-semibold">Status</th>
                <th className="border-b border-[var(--color-border)] p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRegistrations.map(request => (
                <tr key={request._id}>
                  <td className="border-b border-[var(--color-border)] p-4">{request.name || '-'}</td>
                  <td className="border-b border-[var(--color-border)] p-4">{request.username}</td>
                  <td className="border-b border-[var(--color-border)] p-4">{request.email}</td>
                  <td className="border-b border-[var(--color-border)] p-4">{new Date(request.expiresAt).toLocaleString()}</td>
                  <td className="border-b border-[var(--color-border)] p-4">
                    <span className={request.expired ? 'font-semibold text-[#b05a5a]' : 'font-semibold text-[var(--color-brand-strong)]'}>
                      {request.expired ? 'Expired' : 'Waiting'}
                    </span>
                  </td>
                  <td className="border-b border-[var(--color-border)] p-4">
                    <button
                      onClick={() => handleDropPending(request._id)}
                      disabled={busyAction === `drop-${request._id}`}
                      className="cursor-pointer rounded-lg border border-[#efcfca] px-4 py-2 text-[#b05a5a] hover:bg-[#fff1ef] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyAction === `drop-${request._id}` ? 'Dropping...' : 'Drop'}
                    </button>
                  </td>
                </tr>
              ))}
              {pendingRegistrations.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-[var(--color-muted)]">No pending registrations.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white/90 shadow-[var(--shadow-soft)]">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[var(--color-panel-muted)] text-[var(--color-muted)]">
            <th className="border-b border-[var(--color-border)] p-4 text-left font-semibold">Name</th>
            <th className="border-b border-[var(--color-border)] p-4 text-left font-semibold">Username</th>
            <th className="border-b border-[var(--color-border)] p-4 text-left font-semibold">Email</th>
            <th className="border-b border-[var(--color-border)] p-4 text-left font-semibold">Role</th>
            <th className="border-b border-[var(--color-border)] p-4 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td className="border-b border-[var(--color-border)] p-4">{u.name || '-'}</td>
              <td className="border-b border-[var(--color-border)] p-4">{u.username}</td>
              <td className="border-b border-[var(--color-border)] p-4">{u.email}</td>
              <td className="border-b border-[var(--color-border)] p-4">{u.role}</td>
              <td className="border-b border-[var(--color-border)] p-4">
                <button onClick={() => setEditingUser(u)} className="mr-2 cursor-pointer rounded-lg border border-[var(--color-border)] px-4 py-2 hover:bg-[var(--color-panel-muted)]">Edit</button>
                <button disabled={busyAction === `delete-${u._id}`} onClick={() => handleDelete(u._id)} className="cursor-pointer rounded-lg border border-[#efcfca] px-4 py-2 text-[#b05a5a] hover:bg-[#fff1ef] disabled:cursor-not-allowed disabled:opacity-60">
                  {busyAction === `delete-${u._id}` ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-text)]/45 p-4">
          <form onSubmit={handleUpdate} className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-white p-8 shadow-xl">
            <h3 className="text-xl font-bold text-[var(--color-text)]">Edit User</h3>
            <input
              placeholder="Name"
              value={editingUser.name || ''}
              onChange={e => setEditingUser({...editingUser, name: e.target.value})}
              className="rounded-lg border border-[var(--color-border)] p-3"
            />
            <input
              placeholder="Username"
              value={editingUser.username}
              onChange={e => setEditingUser({...editingUser, username: e.target.value})}
              className="rounded-lg border border-[var(--color-border)] p-3"
            />
            <input
              value={editingUser.email}
              onChange={e => setEditingUser({...editingUser, email: e.target.value})}
              className="rounded-lg border border-[var(--color-border)] p-3"
            />
            <select
              value={editingUser.role}
              onChange={e => setEditingUser({...editingUser, role: e.target.value})}
              className="rounded-lg border border-[var(--color-border)] p-3"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" disabled={busyAction === 'update-user'} className="cursor-pointer rounded-lg border-0 bg-[var(--color-brand)] p-3 font-semibold text-white hover:bg-[var(--color-brand-strong)] disabled:cursor-not-allowed disabled:bg-sky-300">
              {busyAction === 'update-user' ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditingUser(null)} className="cursor-pointer rounded-lg border border-[var(--color-border)] p-3 hover:bg-[var(--color-panel-muted)]">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

