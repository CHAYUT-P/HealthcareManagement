import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Search, Activity } from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
    const { token, logout } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [sortAsc, setSortAsc] = useState(true);

    const [reschedulingApptId, setReschedulingApptId] = useState<number | null>(null);
    const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

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

    const handleReschedule = async () => {
        try {
            const res = await fetch(`http://localhost:8000/nurse/appointments/${reschedulingApptId}/reschedule`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(rescheduleData)
            });
            if (res.ok) {
                setReschedulingApptId(null);
                fetchAppointments();
                alert('Appointment successfully rescheduled.');
            } else {
                const err = await res.json();
                alert(err.detail);
            }
        } catch (e) { console.error(e); }
    };

    const filteredAppointments = appointments.filter(a => {
        const matchesSearch = a.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.details?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = dateFilter ? a.date === dateFilter : true;
        return matchesSearch && matchesDate;
    }).sort((a, b) => {
        // Fallback for sorting if time/date is missing
        const aTime = a.date && a.time ? new Date(`${a.date}T${a.time}`).getTime() : 0;
        const bTime = b.date && b.time ? new Date(`${b.date}T${b.time}`).getTime() : 0;
        return sortAsc ? aTime - bTime : bTime - aTime;
    });

    const setTodayDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        setDateFilter(`${yyyy}-${mm}-${dd}`);
    }

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Appointment Schedule</h1>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>View and manage all booked appointments for the clinic.</p>
            </header>

            <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
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
                    
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input 
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{ padding: '0.9rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', fontSize: '1rem', background: 'var(--surface)' }}
                        />
                        <button 
                            onClick={setTodayDate}
                            style={{ padding: '0.9rem 1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--primary-container)', color: 'var(--on-primary-container)', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Today
                        </button>
                        { dateFilter && (
                            <button 
                                onClick={() => setDateFilter('')}
                                style={{ padding: '0.9rem', borderRadius: 'var(--radius-lg)', background: 'transparent', color: 'var(--on-surface-variant)', border: '1px solid var(--outline-variant)', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Clear
                            </button>
                        )}
                        <button 
                            onClick={() => setSortAsc(!sortAsc)}
                            style={{ padding: '0.9rem', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', color: 'var(--on-surface-variant)', border: '1px solid var(--outline-variant)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            Date Sorting {sortAsc ? '↑' : '↓'}
                        </button>
                    </div>
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
                                    <th style={{ padding: '1rem' }}>Reason for Visit</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.map(a => (
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
                                        <td style={{ padding: '1rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.details}>{a.details || '-'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600,
                                                background: a.status === 'scheduled' ? 'var(--secondary-container)' : a.status === 'completed' ? '#d1fae5' : '#fee2e2',
                                                color: a.status === 'scheduled' ? 'var(--on-secondary-container)' : a.status === 'completed' ? '#065f46' : '#991b1b'
                                            }}>
                                                {a.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {a.status === 'scheduled' && (
                                                reschedulingApptId === a.id ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <input type="date" value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--outline-variant)' }} />
                                                        <input type="time" value={rescheduleData.time} onChange={e => setRescheduleData({...rescheduleData, time: e.target.value})} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--outline-variant)' }} />
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={handleReschedule} style={{ padding: '0.2rem 0.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Save</button>
                                                            <button onClick={() => setReschedulingApptId(null)} style={{ padding: '0.2rem 0.5rem', background: 'transparent', color: 'var(--on-surface-variant)', border: '1px solid var(--outline-variant)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    a.is_doctor_scheduled ? (
                                                        <button 
                                                            onClick={() => { setReschedulingApptId(a.id); setRescheduleData({ date: a.date, time: a.time }); }} 
                                                            style={{ padding: '0.3rem 0.8rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                                                        >
                                                            Reschedule
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: 'var(--outline)', fontSize: '0.8rem' }}>Patient booked</span>
                                                    )
                                                )
                                            )}
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
