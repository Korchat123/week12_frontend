import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/v2/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/v2/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Delete failed', error);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/v2/users/${editingUser._id}`, editingUser);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin User Management</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name || '-'}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => setEditingUser(u)}>Edit</button>
                <button onClick={() => handleDelete(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser && (
        <div className="edit-modal">
          <form onSubmit={handleUpdate}>
            <h3>Edit User</h3>
            <input 
              placeholder="Name"
              value={editingUser.name || ''} 
              onChange={e => setEditingUser({...editingUser, name: e.target.value})}
            />
            <input 
              placeholder="Username"
              value={editingUser.username} 
              onChange={e => setEditingUser({...editingUser, username: e.target.value})}
            />
            <input 
              value={editingUser.email} 
              onChange={e => setEditingUser({...editingUser, email: e.target.value})}
            />
            <select 
              value={editingUser.role} 
              onChange={e => setEditingUser({...editingUser, role: e.target.value})}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditingUser(null)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}
