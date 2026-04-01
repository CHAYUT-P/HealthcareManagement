import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Shield, Search } from 'lucide-react';

const AdminDashboard = () => {
    const { user, token } = useAuth();
    const [usersList, setUsersList] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [searchTerm, token]);

    const fetchUsers = async () => {
        try {
            const url = searchTerm ? `http://localhost:8000/admin/users?search=${encodeURIComponent(searchTerm)}` : 'http://localhost:8000/admin/users';
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) setUsersList(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/" />;
    }

    const handleStatusChange = async (userId: string, status: string) => {
        try {
            const res = await fetch(`http://localhost:8000/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                const updated = usersList.map(u => u.id === userId ? { ...u, status } : u);
                setUsersList(updated);
            }
        } catch (e) {}
    };

    const handleRoleChange = async (userId: string, role: string) => {
        try {
            const res = await fetch(`http://localhost:8000/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ role })
            });
            if (res.ok) {
                const updated = usersList.map(u => u.id === userId ? { ...u, role } : u);
                setUsersList(updated);
            }
        } catch (e) {}
    };

    return (
        <div className="container" style={{ paddingTop: '6rem', minHeight: '80vh', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Shield size={32} color="var(--primary)" />
                <h1>System Administration</h1>
            </div>

            <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2>Account Management</h2>
                        <p style={{ color: 'var(--on-surface-variant)' }}>Manage system roles and access status for all registered users.</p>
                    </div>
                    <div style={{ position: 'relative', minWidth: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                        <input
                            type="text"
                            placeholder="Search accounts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface)' }}
                        />
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--outline-variant)' }}>
                            <th style={{ padding: '1rem 0' }}>Name</th>
                            <th style={{ padding: '1rem 0' }}>Email</th>
                            <th style={{ padding: '1rem 0' }}>Role</th>
                            <th style={{ padding: '1rem 0' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersList.map((u) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                                <td style={{ padding: '1rem 0', fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
                                <td style={{ padding: '1rem 0', color: 'var(--on-surface-variant)' }}>{u.email}</td>
                                <td style={{ padding: '1rem 0' }}>
                                    <select
                                        value={u.role || 'PATIENT'}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface)' }}
                                    >
                                        <option value="PATIENT">Patient</option>
                                        <option value="NURSE">Nurse</option>
                                        <option value="DOCTOR">Doctor</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </td>
                                <td style={{ padding: '1rem 0' }}>
                                    <select
                                        value={u.status || 'ACTIVE'}
                                        onChange={(e) => handleStatusChange(u.id, e.target.value)}
                                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface)' }}
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="SUSPENDED">Suspended</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
