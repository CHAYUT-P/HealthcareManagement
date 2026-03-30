import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Search, Activity } from 'lucide-react';

const StaffDashboard = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('healthcare_users_list') || '[]');
        setPatients(data.filter((u: any) => u.role === 'PATIENT' || !u.role));
    }, []);

    if (!user || !['NURSE', 'DOCTOR'].includes(user.role)) {
        return <Navigate to="/" />;
    }

    const filteredPatients = patients.filter(p =>
        (p.firstName + ' ' + p.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container" style={{ paddingTop: '6rem', minHeight: '80vh', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Activity size={32} color="var(--primary)" />
                <h1>Medical Staff Portal ({user.role})</h1>
            </div>

            <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h2>Patient Database Search</h2>

                <div style={{ position: 'relative', marginTop: '1.5rem', marginBottom: '2rem' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
                    <input
                        type="text"
                        placeholder="Search patient by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)' }}
                    />
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredPatients.map(p => (
                        <div
                            key={p.id}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)' }}
                        >
                            <div>
                                <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--primary)', fontSize: '1.2rem' }}>{p.firstName} {p.lastName}</h3>
                                <p style={{ margin: 0, color: 'var(--on-surface-variant)' }}>{p.email}</p>
                            </div>
                            <button className="btn-primary" onClick={() => navigate(`/staff/patient/${p.id}`)} style={{ padding: '0.75rem 1.5rem' }}>View Profile & Records</button>
                        </div>
                    ))}
                    {filteredPatients.length === 0 && <p style={{ color: 'var(--on-surface-variant)' }}>No patients found.</p>}
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
