import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Search, Activity } from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
    const { token, logout } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await fetch('http://localhost:8000/patients/appointments/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.status === 401) {
                logout();
                return;
            }
            
            if (res.ok) {
                setAppointments(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAppointments = appointments.filter(a => 
        a.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Appointment Schedule</h1>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>View and manage all booked appointments for the clinic.</p>
            </header>

            <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                    <Search className="input-icon" size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                    <input
                        type="text"
                        placeholder="Search by Patient, Doctor, or Service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 3rem',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--outline-variant)',
                            fontSize: '1rem',
                            background: 'var(--surface)'
                        }}
                    />
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <Activity className="spinner" size={32} style={{ color: 'var(--primary)', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
                        <p>Loading schedule...</p>
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--outline-variant)', borderRadius: 'var(--radius-lg)' }}>
                        <Calendar size={48} style={{ color: 'var(--outline)', marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--on-surface-variant)' }}>No appointments found.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--outline-variant)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Patient</th>
                                    <th style={{ padding: '1rem' }}>Date & Time</th>
                                    <th style={{ padding: '1rem' }}>Service</th>
                                    <th style={{ padding: '1rem' }}>Doctor</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(a => (
                                    <tr key={a.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '40px', height: '40px', background: 'var(--primary-container)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-primary-container)', fontWeight: 700 }}>
                                                    {a.patient_name?.[0]}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{a.patient_name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                                                    <Calendar size={14} /> {a.date}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                                                    <Clock size={14} /> {a.time}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{a.service}</td>
                                        <td style={{ padding: '1rem' }}>{a.doctor_name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600,
                                                background: a.status === 'scheduled' ? 'var(--secondary-container)' : a.status === 'completed' ? '#d1fae5' : '#fee2e2',
                                                color: a.status === 'scheduled' ? 'var(--on-secondary-container)' : a.status === 'completed' ? '#065f46' : '#991b1b'
                                            }}>
                                                {a.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
