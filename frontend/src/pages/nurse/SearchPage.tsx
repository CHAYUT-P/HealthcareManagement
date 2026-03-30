import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, UserPlus, CalendarPlus, Activity } from 'lucide-react';
import { PatientProfileHeader } from '../../components/nurse/PatientProfileHeader';

export const SearchPage: React.FC = () => {
    const { token } = useAuth();

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Selection State
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [patientHistory, setPatientHistory] = useState<any[]>([]);

    useEffect(() => {
        setIsLoading(true);
        const debounceTimer = setTimeout(() => {
            fetchSearchResults();
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const fetchSearchResults = async () => {
        try {
            const queryParam = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
            const res = await fetch(`http://localhost:8000/patients/search${queryParam}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setSearchResults(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPatientHistory = async (patientId: number) => {
        try {
            const res = await fetch(`http://localhost:8000/patients/${patientId}/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setPatientHistory(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleSelectPatient = (patient: any) => {
        setSelectedPatient(patient);
        fetchPatientHistory(patient.id);
        setSearchQuery('');
        setSearchResults([]);
    };

    const addToQueue = async () => {
        if (!selectedPatient) return;
        try {
            const res = await fetch('http://localhost:8000/patients/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ patient_id: selectedPatient.id })
            });
            if (res.ok) {
                alert("Patient successfully added to today's queue!");
                setSelectedPatient(null);
            } else {
                const data = await res.json();
                alert(data.detail || "Error adding patient to queue");
            }
        } catch (e) {
            console.error(e);
            alert("Error adding patient to queue");
        }
    };

    return (
        <div style={{ paddingTop: '6rem', minHeight: '100vh', paddingBottom: '4rem', maxWidth: '1280px', margin: '0 auto', padding: '6rem 2rem 4rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Patient Search & Registration</h1>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>Find existing patients and register them for today's visit queue.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 2fr)', gap: '2rem' }}>

                {/* Left Column: Search Bar & Results */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search className="input-icon" size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                        <input
                            type="text"
                            placeholder="Search by Name, HN, ID, or Phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1.25rem 1rem 1.25rem 3rem',
                                borderRadius: 'var(--radius-xl)',
                                border: '2px solid var(--primary-container)',
                                fontSize: '1.1rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                background: 'var(--surface)'
                            }}
                        />
                    </div>

                    {isLoading ? (
                        <div style={{ background: 'var(--surface-container-lowest)', padding: '3rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                            <Activity className="spinner" size={32} style={{ color: 'var(--primary)', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
                            <p style={{ color: 'var(--on-surface-variant)', margin: 0 }}>Loading patient records...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {searchResults.map(p => (
                                    <li
                                        key={p.id}
                                        onClick={() => handleSelectPatient(p)}
                                        style={{
                                            padding: '1.25rem',
                                            borderBottom: '1px solid var(--outline-variant)',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-variant)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong style={{ fontSize: '1.1rem', color: 'var(--on-surface)' }}>{p.name}</strong>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>
                                                    HN: {p.hn_number || 'N/A'} • {p.gender}, {p.age} yrs
                                                </div>
                                            </div>
                                            <UserPlus size={20} color="var(--primary)" />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div style={{ background: 'var(--surface-container-lowest)', padding: '3rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                            <p style={{ color: 'var(--on-surface-variant)', margin: 0 }}>No patients found matching your search.</p>
                        </div>
                    )}
                </div>

                {/* Right Column: General Patient Profile View */}
                <div>
                    {!selectedPatient ? (
                        <div style={{ background: 'var(--surface-container-lowest)', padding: '5rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', outline: '2px dashed var(--outline-variant)' }}>
                            <Search size={48} style={{ color: 'var(--outline)', margin: '0 auto 1.5rem' }} />
                            <h2 style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>No Patient Selected</h2>
                            <p style={{ color: 'var(--outline)' }}>Search and select a patient to view their profile and add them to the queue.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {/* Reusable Profile Header */}
                            <PatientProfileHeader patient={selectedPatient} />

                            {/* Action Card: Add to Queue */}
                            <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderTop: '4px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Patient Registration</h3>
                                    <p style={{ color: 'var(--on-surface-variant)', margin: 0 }}>Register this patient for today's visit queue.</p>
                                </div>
                                <button onClick={addToQueue} className="btn-primary" style={{ background: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: 'var(--radius-full)' }}>
                                    <CalendarPlus size={20} /> Add to Today's Queue
                                </button>
                            </div>

                            {/* Past Treatment History */}
                            <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Activity size={20} /> Past Treatment History
                                </h3>

                                {patientHistory.length === 0 ? (
                                    <p style={{ color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>No past visits recorded for this patient.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {patientHistory.map((h, i) => (
                                            <div key={i} style={{ padding: '1.25rem', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <strong style={{ color: 'var(--primary)' }}>{new Date(h.date).toLocaleDateString()}</strong>
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>Dr. {h.doctor_name.split('@')[0]}</span>
                                                </div>
                                                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500 }}>Chief Complaint: {h.chief_complaint}</p>
                                                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--on-surface-variant)' }}><strong style={{ color: 'var(--on-surface)' }}>Dx:</strong> {h.diagnosis || 'Pending'}</p>
                                                {h.treatments && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.95rem', color: 'var(--on-surface-variant)' }}><strong style={{ color: 'var(--on-surface)' }}>Rx:</strong> {h.treatments}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
