import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('api/v2/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const fetchPendingRegistrations = async () => {
    try {
      const response = await axios.get('api/v2/users/pending-registrations');
      setPendingRegistrations(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pending registrations', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
    fetchPendingRegistrations();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`api/v2/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Delete failed', error);
      }
    }
  };

  const handleDropPending = async (id) => {
    if (window.confirm('Drop this registration request?')) {
      try {
        await axios.delete(`api/v2/users/pending-registrations/${id}`);
        fetchPendingRegistrations();
      } catch (error) {
        console.error('Drop registration request failed', error);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`api/v2/users/${editingUser._id}`, editingUser);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-[#24312f]">Admin User Management</h1>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold text-[#24312f]">Pending Registrations</h2>
        <div className="overflow-x-auto rounded-xl border border-[#e6ddd4] bg-white/90 shadow-[var(--shadow-soft)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f8f4ef] text-[#53615d]">
                <th className="border-b border-[#e6ddd4] p-4 text-left font-semibold">Name</th>
                <th className="border-b border-[#e6ddd4] p-4 text-left font-semibold">Username</th>
                <th className="border-b border-[#e6ddd4] p-4 text-left font-semibold">Email</th>
                <th className="border-b border-[#e6ddd4] p-4 text-left font-semibold">Expires</th>
                <th className="border-b border-[#e6ddd4] p-4 text-left font-semibold">Status</th>
                <th className="border-b border-[#e6ddd4] p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRegistrations.map(request => (
                <tr key={request._id}>
                  <td className="border-b border-[#e6ddd4] p-4">{request.name || '-'}</td>
                  <td className="border-b border-[#e6ddd4] p-4">{request.username}</td>
                  <td className="border-b border-[#e6ddd4] p-4">{request.email}</td>
                  <td className="border-b border-[#e6ddd4] p-4">{new Date(request.expiresAt).toLocaleString()}</td>
                  <td className="border-b border-[#e6ddd4] p-4">
                    <span className={request.expired ? 'font-semibold text-[#b05a5a]' : 'font-semibold text-[#25685f]'}>
                      {request.expired ? 'Expired' : 'Waiting'}
                    </span>
                  </td>
                  <td className="border-b border-[#e6ddd4] p-4">
                    <button
                      onClick={() => handleDropPending(request._id)}
                      className="cursor-pointer rounded-lg border border-[#efcfca] px-4 py-2 text-[#b05a5a] hover:bg-[#fff1ef]"
                    >
                      Drop
                    </button>
                  </td>
                </tr>
              ))}
              {pendingRegistrations.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-[#66736f]">No pending registrations.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="overflow-x-auto rounded-xl border border-[#e6ddd4] bg-white/90 shadow-[var(--shadow-soft)]">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#f8f4ef] text-[#53615d]">
            <th className="border-b border-[#e6ddd4] p-4 text-left font-semibold">Name</th>
            <th className="border-b border-[#e6ddd4] p-4 text-left font-semibold">Username</th>
            <th className="border-b border-[#e6ddd4] p-4 text-left font-semibold">Email</th>
            <th className="border-b border-[#e6ddd4] p-4 text-left font-semibold">Role</th>
            <th className="border-b border-[#e6ddd4] p-4 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td className="border-b border-[#e6ddd4] p-4">{u.name || '-'}</td>
              <td className="border-b border-[#e6ddd4] p-4">{u.username}</td>
              <td className="border-b border-[#e6ddd4] p-4">{u.email}</td>
              <td className="border-b border-[#e6ddd4] p-4">{u.role}</td>
              <td className="border-b border-[#e6ddd4] p-4">
                <button onClick={() => setEditingUser(u)} className="mr-2 cursor-pointer rounded-lg border border-[#d9cec4] px-4 py-2 hover:bg-[#f8f4ef]">Edit</button>
                <button onClick={() => handleDelete(u._id)} className="cursor-pointer rounded-lg border border-[#efcfca] px-4 py-2 text-[#b05a5a] hover:bg-[#fff1ef]">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#24312f]/45 p-4">
          <form onSubmit={handleUpdate} className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-[#e6ddd4] bg-white p-8 shadow-xl">
            <h3 className="text-xl font-bold text-[#24312f]">Edit User</h3>
            <input
              placeholder="Name"
              value={editingUser.name || ''}
              onChange={e => setEditingUser({...editingUser, name: e.target.value})}
              className="rounded-lg border border-[#d9cec4] p-3"
            />
            <input
              placeholder="Username"
              value={editingUser.username}
              onChange={e => setEditingUser({...editingUser, username: e.target.value})}
              className="rounded-lg border border-[#d9cec4] p-3"
            />
            <input
              value={editingUser.email}
              onChange={e => setEditingUser({...editingUser, email: e.target.value})}
              className="rounded-lg border border-[#d9cec4] p-3"
            />
            <select
              value={editingUser.role}
              onChange={e => setEditingUser({...editingUser, role: e.target.value})}
              className="rounded-lg border border-[#d9cec4] p-3"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="cursor-pointer rounded-lg border-0 bg-[#2f7d73] p-3 font-semibold text-white hover:bg-[#25685f]">Save</button>
            <button type="button" onClick={() => setEditingUser(null)} className="cursor-pointer rounded-lg border border-[#d9cec4] p-3 hover:bg-[#f8f4ef]">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

