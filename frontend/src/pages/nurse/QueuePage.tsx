import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, UserPlus, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { PatientProfileHeader } from '../../components/nurse/PatientProfileHeader';

export const QueuePage: React.FC = () => {
    const { token, logout } = useAuth();

    const [queue, setQueue] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [selectedVisit, setSelectedVisit] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<'triage' | 'ready'>('triage');
    const [isLoading, setIsLoading] = useState(true);

    const [triageForm, setTriageForm] = useState({
        blood_pressure: '', heart_rate: '', temperature: '',
        respiratory_rate: '', oxygen_saturation: '', weight: '',
        height: '', chief_complaint: '', notes: ''
    });
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [currentTriageLevel, setCurrentTriageLevel] = useState<string>('Green');

    useEffect(() => {
        if (token) {
            fetchQueue();
            fetchDoctors();
            const interval = setInterval(() => {
                fetchQueue();
                fetchDoctors();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [token]);

    const fetchQueue = async () => {
        try {
            const res = await fetch('http://localhost:8000/nurse/queue/today', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 401) {
                logout();
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setQueue(data);

                if (selectedVisit) {
                    const latestMatch = data.find((v: any) => v.id === selectedVisit.id);
                    if (!latestMatch || latestMatch.status !== selectedVisit.status) {
                        setSelectedVisit(null);
                    } else {
                        setSelectedVisit(latestMatch);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await fetch('http://localhost:8000/nurse/doctors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 401) {
                logout();
                return;
            }
            if (res.ok) setDoctors(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleSelectVisit = (visit: any, tab: 'triage' | 'ready') => {
        setSelectedVisit(visit);
        setActiveTab(tab);
        if (tab === 'triage') {
            setTriageForm({
                blood_pressure: '', heart_rate: '', temperature: '',
                respiratory_rate: '', oxygen_saturation: '', weight: '',
                height: '', chief_complaint: '', notes: ''
            });
            setCurrentTriageLevel(visit.triage_level || 'Green');
        }
    };

    const getTriageColor = (level: string) => {
        if (level === 'Red') return '#dc2626';
        if (level === 'Yellow') return '#d97706';
        if (level === 'Green') return '#10b981';
        return 'var(--outline-variant)';
    };

    const submitTriage = async (visitId: number) => {
        if (!triageForm.blood_pressure || !triageForm.heart_rate || !triageForm.temperature || 
            !triageForm.oxygen_saturation || !triageForm.weight || !triageForm.height || 
            !triageForm.chief_complaint) {
            return alert('All triage information fields are required.');
        }

        try {
            const payload = {
                blood_pressure: triageForm.blood_pressure,
                heart_rate: parseInt(triageForm.heart_rate),
                temperature: parseFloat(triageForm.temperature),
                oxygen_saturation: parseInt(triageForm.oxygen_saturation),
                weight: parseFloat(triageForm.weight),
                height: parseFloat(triageForm.height),
                chief_complaint: triageForm.chief_complaint,
                triage_level: currentTriageLevel
            };
            const res = await fetch(`http://localhost:8000/nurse/visits/${visitId}/vitals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.status === 401) {
                logout();
                return;
            }
            if (res.ok) {
                fetchQueue();
                setSelectedVisit(null);
                alert('Triage successfully recorded. Patient marked as Ready for Doctor.');
            } else {
                const err = await res.json();
                alert(`Error: ${err.detail || 'Failed to submit triage'}`);
            }
        } catch (e) { console.error(e); }
    };

    const assignDoctor = async (visitId: number) => {
        if (!selectedDoctorId) return alert('Please select a doctor');
        try {
            const res = await fetch(`http://localhost:8000/nurse/queue/${visitId}/assign`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ doctor_id: parseInt(selectedDoctorId) })
            });
            if (res.status === 401) {
                logout();
                return;
            }
            if (res.ok) {
                fetchQueue();
                setSelectedVisit(null);
                setSelectedDoctorId('');
                alert('Patient assigned and transferred to Exam Room.');
            }
        } catch (e) { console.error(e); }
    };

    const waitingQueue = queue.filter(v => v.status === 'Waiting for Triage');
    const readyQueue = queue.filter(v => v.status === 'Ready for Doctor');

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(500px, 2fr)', gap: '2rem' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <h3 style={{ padding: '1.5rem', margin: 0, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={20} /> Waiting for Triage ({waitingQueue.length})
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '350px', overflowY: 'auto' }}>
                            {isLoading ? (
                                <li style={{ padding: '2rem', textAlign: 'center' }}><Activity className="spinner" size={24} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} /></li>
                            ) : waitingQueue.length === 0 ? (
                                <li style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No patients are waiting for triage today.</li>
                            ) : (
                                waitingQueue.map(v => (
                                    <li
                                        key={v.id}
                                        onClick={() => handleSelectVisit(v, 'triage')}
                                        style={{
                                            padding: '1.25rem', borderBottom: '1px solid var(--outline-variant)', cursor: 'pointer',
                                            background: selectedVisit?.id === v.id && activeTab === 'triage' ? 'var(--primary-container)' : 'transparent',
                                            transition: 'background 0.2s ease', borderLeft: `6px solid ${getTriageColor(v.triage_level)}`
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <strong style={{ fontSize: '1.1rem', color: selectedVisit?.id === v.id && activeTab === 'triage' ? 'var(--on-primary-container)' : 'var(--on-surface)' }}>{v.patient.name}</strong>
                                                    {v.triage_level !== 'Green' && (
                                                        <span style={{ background: v.triage_level === 'Red' ? '#fef2f2' : '#fffbeb', color: getTriageColor(v.triage_level), border: `1px solid ${getTriageColor(v.triage_level)}`, padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                                            {v.triage_level.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>
                                                    HN: {v.patient.hn} • Wait: {Math.floor((Date.now() - new Date(v.created_at.includes('Z') ? v.created_at : v.created_at + '+00:00').getTime()) / 60000)}m
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <h3 style={{ padding: '1.5rem', margin: 0, background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={20} /> Ready for Doctor ({readyQueue.length})
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '350px', overflowY: 'auto' }}>
                            {isLoading ? (
                                <li style={{ padding: '2rem', textAlign: 'center' }}><Activity className="spinner" size={24} style={{ color: '#10b981', animation: 'spin 1s linear infinite' }} /></li>
                            ) : readyQueue.length === 0 ? (
                                <li style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No patients are ready for doctors today.</li>
                            ) : (
                                readyQueue.map(v => (
                                    <li
                                        key={v.id}
                                        onClick={() => handleSelectVisit(v, 'ready')}
                                        style={{
                                            padding: '1.25rem', borderBottom: '1px solid var(--outline-variant)', cursor: 'pointer',
                                            background: selectedVisit?.id === v.id && activeTab === 'ready' ? '#d1fae5' : 'transparent',
                                            transition: 'background 0.2s ease', borderLeft: `6px solid ${getTriageColor(v.triage_level)}`
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <strong style={{ fontSize: '1.1rem', color: selectedVisit?.id === v.id && activeTab === 'ready' ? '#065f46' : 'var(--on-surface)' }}>{v.patient.name}</strong>
                                                    {v.triage_level !== 'Green' && (
                                                        <span style={{ background: v.triage_level === 'Red' ? '#fef2f2' : '#fffbeb', color: getTriageColor(v.triage_level), border: `1px solid ${getTriageColor(v.triage_level)}`, padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                                            {v.triage_level.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>
                                                    Triage complete • Chief Complaint: {v.vitals?.chief_complaint?.substring(0, 20)}...
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                </div>

                <div>
                    {!selectedVisit ? (
                        <div style={{ background: 'var(--surface-container-lowest)', padding: '5rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', outline: '2px dashed var(--outline-variant)' }}>
                            <Activity size={48} style={{ color: 'var(--outline)', margin: '0 auto 1.5rem' }} />
                            <h2 style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>No Context Selected</h2>
                            <p style={{ color: 'var(--outline)' }}>Select a patient from the queue lists to perform triage or assign them to a doctor.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            <PatientProfileHeader patient={selectedVisit.patient} compact={true} />

                            {activeTab === 'triage' && (
                                <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                    <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Activity size={20} /> Current Triage Entry
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.25rem' }}>Blood Pressure (mmHg) <span style={{ color: 'var(--destructive)' }}>*</span></label>
                                                <input type="text" value={triageForm.blood_pressure} onChange={e => setTriageForm({ ...triageForm, blood_pressure: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} placeholder="120/80" required />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.25rem' }}>Heart Rate (bpm) <span style={{ color: 'var(--destructive)' }}>*</span></label>
                                                <input type="number" value={triageForm.heart_rate} onChange={e => setTriageForm({ ...triageForm, heart_rate: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} placeholder="75" required />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.25rem' }}>Temperature (°C) <span style={{ color: 'var(--destructive)' }}>*</span></label>
                                                <input type="number" step="0.1" value={triageForm.temperature} onChange={e => setTriageForm({ ...triageForm, temperature: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} placeholder="37.0" required />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.25rem' }}>SpO2 (%) <span style={{ color: 'var(--destructive)' }}>*</span></label>
                                                <input type="number" value={triageForm.oxygen_saturation} onChange={e => setTriageForm({ ...triageForm, oxygen_saturation: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} placeholder="98" required />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.25rem' }}>Weight (kg) <span style={{ color: 'var(--destructive)' }}>*</span></label>
                                                <input type="number" step="0.1" value={triageForm.weight} onChange={e => setTriageForm({ ...triageForm, weight: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} placeholder="70" required />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.25rem' }}>Height (cm) <span style={{ color: 'var(--destructive)' }}>*</span></label>
                                                <input type="number" step="0.1" value={triageForm.height} onChange={e => setTriageForm({ ...triageForm, height: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} placeholder="175" required />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.25rem' }}>Chief Complaint <span style={{ color: 'var(--destructive)' }}>*</span></label>
                                            <textarea value={triageForm.chief_complaint} onChange={e => setTriageForm({ ...triageForm, chief_complaint: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', resize: 'vertical' }} rows={2} required></textarea>
                                        </div>

                                        <div style={{ marginBottom: '1rem', marginTop: '0.5rem', background: 'var(--surface-variant)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>Update Triage Urgency Level (Leave unselected for Normal)</label>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => setCurrentTriageLevel(currentTriageLevel === 'Red' ? 'Green' : 'Red')} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `2px solid ${currentTriageLevel === 'Red' ? '#dc2626' : 'var(--outline-variant)'}`, background: currentTriageLevel === 'Red' ? '#fef2f2' : 'var(--surface)', color: currentTriageLevel === 'Red' ? '#dc2626' : 'var(--on-surface-variant)', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s ease', opacity: currentTriageLevel === 'Yellow' ? 0.5 : 1 }}>
                                                    {currentTriageLevel === 'Red' ? '🔴 EMERGENCY SELECTED' : '🔴 Mark as Emergency'}
                                                </button>
                                                <button onClick={() => setCurrentTriageLevel(currentTriageLevel === 'Yellow' ? 'Green' : 'Yellow')} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `2px solid ${currentTriageLevel === 'Yellow' ? '#f59e0b' : 'var(--outline-variant)'}`, background: currentTriageLevel === 'Yellow' ? '#fffbeb' : 'var(--surface)', color: currentTriageLevel === 'Yellow' ? '#b45309' : 'var(--on-surface-variant)', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s ease', opacity: currentTriageLevel === 'Red' ? 0.5 : 1 }}>
                                                    {currentTriageLevel === 'Yellow' ? '🟡 URGENT SELECTED' : '🟡 Mark as Urgent'}
                                                </button>
                                            </div>
                                        </div>

                                        <button onClick={() => submitTriage(selectedVisit.id)} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)' }}>
                                            Save Vitals & Mark Ready <AlertCircle size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ready' && (
                                <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderTop: '4px solid #3b82f6' }}>
                                    <h3 style={{ color: '#3b82f6', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <UserPlus size={20} /> Assign Doctor & Send to Exam Room
                                    </h3>

                                    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', marginBottom: '2rem' }}>
                                        <strong style={{ display: 'block', color: 'var(--on-surface)', marginBottom: '0.5rem' }}>Chief Complaint</strong>
                                        <p style={{ margin: '0 0 1rem 0', color: 'var(--on-surface-variant)' }}>{selectedVisit.vitals?.chief_complaint || 'Not recorded'}</p>

                                        <strong style={{ display: 'block', color: 'var(--on-surface)', marginBottom: '0.5rem' }}>Triage Vitals Snapshot</strong>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.9rem' }}>
                                            <span>BP: {selectedVisit.vitals?.blood_pressure || '-'}</span>
                                            <span>HR: {selectedVisit.vitals?.heart_rate || '-'}</span>
                                            <span>Temp: {selectedVisit.vitals?.temperature || '-'}</span>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <label style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.5rem' }}>Select Available Doctor</label>
                                        <select
                                            value={selectedDoctorId}
                                            onChange={e => setSelectedDoctorId(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '1rem', background: 'var(--surface)' }}
                                            required
                                        >
                                            <option value="">-- Choose a Doctor --</option>
                                            {doctors.map(d => (
                                                <option key={d.id} value={d.id} disabled={!d.is_available}>
                                                    {d.is_available ? '🟢' : '🔴'} Dr. {d.username.split('@')[0]} {d.is_available ? '(Available)' : '(Busy)'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button onClick={() => assignDoctor(selectedVisit.id)} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', background: '#3b82f6', borderColor: '#3b82f6', padding: '1rem', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)' }}>
                                        Confirm Assignment <FileText size={20} />
                                    </button>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
