import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, ClipboardList } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
    const { token, user } = useAuth();

    const [currentData, setCurrentData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [clinicalNote, setClinicalNote] = useState({
        physical_examination: '',
        diagnosis: '',
        prescriptions: '',
        lab_orders: ''
    });

    const [prescriptionItems, setPrescriptionItems] = useState<{ medicine_name: string; instructions: string; quantity: number }[]>([]);
    
    const [followUp, setFollowUp] = useState({ date: '', time: '', note: '' });

    const [isAvailable, setIsAvailable] = useState(true);
    const [blockouts, setBlockouts] = useState<any[]>([]);
    const [ruleType, setRuleType] = useState<'SPECIFIC' | 'RECURRING'>('SPECIFIC');
    const [ruleDate, setRuleDate] = useState('');
    const [ruleDay, setRuleDay] = useState('Monday');
    const [timeType, setTimeType] = useState<'ALL_DAY' | 'RANGE'>('ALL_DAY');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [activeTab, setActiveTab] = useState<'consultation' | 'schedule'>('consultation');

    useEffect(() => {
        fetchCurrentPatient();
        fetchStatusAndBlockouts();
    }, []);

    const fetchStatusAndBlockouts = async () => {
        try {
            const resStatus = await fetch('http://localhost:8000/doctor/status', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resStatus.ok) {
                const data = await resStatus.json();
                setIsAvailable(data.is_available_now);
            }

            const resBlockouts = await fetch('http://localhost:8000/doctor/blockouts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resBlockouts.ok) {
                const data = await resBlockouts.json();
                setBlockouts(data);
            }
        } catch (e) { console.error(e); }
    };

    const fetchCurrentPatient = async () => {
        try {
            const res = await fetch('http://localhost:8000/doctor/current-patient', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCurrentData(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const submitNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentData?.visit) return;

        try {
            const res = await fetch(`http://localhost:8000/doctor/visits/${currentData.visit.id}/consult`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ 
                    ...clinicalNote, 
                    prescription_items: prescriptionItems,
                    follow_up_date: followUp.date || undefined,
                    follow_up_time: followUp.time || undefined,
                    follow_up_note: followUp.note || undefined
                })
            });
            if (res.ok) {
                setCurrentData(null);
                setClinicalNote({
                    physical_examination: '',
                    diagnosis: '',
                    prescriptions: '',
                    lab_orders: ''
                });
                setPrescriptionItems([]);
                setFollowUp({ date: '', time: '', note: '' });
                alert("Consultation Complete. Patient moved to Pharmacy/Billing.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const toggleStatus = async (e: any) => {
        const val = e.target.value === 'available';
        try {
            const res = await fetch('http://localhost:8000/doctor/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ is_available_now: val })
            });
            if (res.ok) setIsAvailable(val);
        } catch(e) { console.error(e); }
    };

    const addBlockout = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                is_recurring: ruleType === 'RECURRING',
                date: ruleType === 'SPECIFIC' ? ruleDate : undefined,
                day_of_week: ruleType === 'RECURRING' ? ruleDay : undefined,
                is_all_day: timeType === 'ALL_DAY',
                start_time: timeType === 'RANGE' ? startTime : undefined,
                end_time: timeType === 'RANGE' ? endTime : undefined
            };
            const res = await fetch('http://localhost:8000/doctor/blockouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const newB = await res.json();
                if (!blockouts.find(b => b.id === newB.id)) {
                    setBlockouts([...blockouts, newB]);
                }
                setRuleDate('');
                setStartTime('');
                setEndTime('');
            }
        } catch(e) { console.error(e); }
    };

    const removeBlockout = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:8000/doctor/blockouts/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setBlockouts(blockouts.filter(b => b.id !== id));
            }
        } catch(e) { console.error(e); }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>Loading workspace...</div>;
    }

    return (
        <div style={{ padding: '6rem 2rem 4rem', maxWidth: '1280px', margin: '0 auto', minHeight: '100vh' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Doctor Dashboard</h1>
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>Dr. {user?.username?.split('@')[0]}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isAvailable ? '#dcfce7' : '#fee2e2', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: isAvailable ? '#16a34a' : '#dc2626' }}></span>
                        <select 
                            value={isAvailable ? 'available' : 'offline'}
                            onChange={toggleStatus}
                            style={{ background: 'transparent', border: 'none', fontWeight: 600, color: isAvailable ? '#166534' : '#991b1b', cursor: 'pointer', outline: 'none', fontSize: '0.95rem' }}
                        >
                            <option value="available">Accepting Patients</option>
                            <option value="offline">Offline / Busy</option>
                        </select>
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '2px solid var(--outline-variant)' }}>
                <button 
                    onClick={() => setActiveTab('consultation')} 
                    style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'consultation' ? 600 : 400, color: activeTab === 'consultation' ? 'var(--primary)' : 'var(--outline)', cursor: 'pointer', paddingBottom: '0.75rem', borderBottom: activeTab === 'consultation' ? '3px solid var(--primary)' : '3px solid transparent', transform: 'translateY(2px)' }}
                >
                    Live Active Patient
                </button>
                <button 
                    onClick={() => setActiveTab('schedule')} 
                    style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'schedule' ? 600 : 400, color: activeTab === 'schedule' ? 'var(--primary)' : 'var(--outline)', cursor: 'pointer', paddingBottom: '0.75rem', borderBottom: activeTab === 'schedule' ? '3px solid var(--primary)' : '3px solid transparent', transform: 'translateY(2px)' }}
                >
                    Schedule Management
                </button>
            </div>

            {activeTab === 'consultation' && !currentData && (
                <div style={{ background: 'var(--surface-container-lowest)', padding: '5rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', outline: '2px dashed var(--outline-variant)' }}>
                    <ClipboardList size={48} style={{ color: 'var(--outline)', margin: '0 auto 1.5rem' }} />
                    <h2 style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>No Active Patient</h2>
                    <p style={{ color: 'var(--outline)', marginBottom: '2rem' }}>You have no patients currently assigned in your examination room.</p>
                    <button onClick={fetchCurrentPatient} className="btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: 'var(--radius-full)' }}>Refresh Room</button>
                </div>
            )}

            {activeTab === 'consultation' && currentData && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <section style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderTop: '4px solid var(--primary)' }}>
                            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '0.5rem' }}>General Information</h2>
                                <div>
                                    <strong style={{ color: 'var(--on-surface-variant)' }}>Name:</strong> 
                                    <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                        {currentData.patient.name}
                                        {currentData.visit.triage_level === 'Red' && (
                                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#fee2e2', color: '#dc2626', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>🔴 EMERGENCY</span>
                                        )}
                                        {currentData.visit.triage_level === 'Yellow' && (
                                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#fef3c7', color: '#d97706', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>🟡 URGENT</span>
                                        )}
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                                    <div><strong style={{ color: 'var(--on-surface-variant)' }}>Age:</strong> <br />{currentData.patient.age} yrs</div>
                                    <div><strong style={{ color: 'var(--on-surface-variant)' }}>Gender:</strong> <br />{currentData.patient.gender}</div>
                                </div>

                                {currentData.patient.known_allergies && (
                                    <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #fecaca', marginTop: '1rem' }}>
                                        <strong style={{ color: '#dc2626', display: 'block', marginBottom: '0.25rem' }}>Known Allergies</strong>
                                        <span style={{ color: '#dc2626', fontWeight: 500 }}>{currentData.patient.known_allergies}</span>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ marginBottom: '1.5rem', color: 'var(--on-surface)', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '0.5rem' }}>Nurse Triage Data</h2>

                            <div style={{ marginBottom: '1.5rem', background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--tertiary)' }}>
                                <strong style={{ display: 'block', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>Reason for Visit (Chief Complaint)</strong>
                                <p style={{ fontSize: '1.1rem', margin: 0 }}>{currentData.vitals?.chief_complaint || 'No complaint recorded.'}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: 'var(--surface-variant)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                    <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Blood Pressure</strong>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{currentData.vitals?.blood_pressure || '-'}</span>
                                </div>
                                <div style={{ background: 'var(--surface-variant)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                    <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Heart Rate</strong>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{currentData.vitals?.heart_rate || '-'} bpm</span>
                                </div>
                                <div style={{ background: 'var(--surface-variant)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                    <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Temp</strong>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{currentData.vitals?.temperature || '-'} °C</span>
                                </div>
                                <div style={{ background: 'var(--surface-variant)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                    <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>SpO2</strong>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{currentData.vitals?.oxygen_saturation || '-'} %</span>
                                </div>
                                <div style={{ background: 'var(--surface-variant)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                    <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Weight</strong>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{currentData.vitals?.weight || '-'} kg</span>
                                </div>
                                <div style={{ background: 'var(--surface-variant)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                    <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Height</strong>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{currentData.vitals?.height || '-'} cm</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div style={{ background: 'var(--surface-container-lowest)', padding: '3rem 2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FileText size={28} /> Consultation Notes
                        </h2>
                        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2.5rem' }}>Document your findings and formalize the diagnosis.</p>

                        <form onSubmit={submitNote} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--on-surface)' }}>Physical Examination</label>
                                <textarea
                                    value={clinicalNote.physical_examination}
                                    onChange={e => setClinicalNote({ ...clinicalNote, physical_examination: e.target.value })}
                                    style={{ width: '100%', padding: '1rem', minHeight: '150px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', fontSize: '1rem', background: 'var(--surface)', resize: 'vertical' }}
                                    placeholder="Enter physical exam observations..."
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--on-surface)' }}>Diagnosis (Dx)</label>
                                <input
                                    value={clinicalNote.diagnosis}
                                    onChange={e => setClinicalNote({ ...clinicalNote, diagnosis: e.target.value })}
                                    style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', fontSize: '1.1rem', background: 'var(--surface)' }}
                                    placeholder="e.g. Acute Bronchitis"
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--on-surface)' }}>Prescriptions (Rx)</label>
                                    <textarea
                                        value={clinicalNote.prescriptions}
                                        onChange={e => setClinicalNote({ ...clinicalNote, prescriptions: e.target.value })}
                                        style={{ width: '100%', padding: '1rem', minHeight: '120px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', fontSize: '1rem', background: 'var(--surface)', resize: 'vertical' }}
                                        placeholder="Medications separated by line..."
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--on-surface)' }}>Lab/Imaging Orders</label>
                                    <textarea
                                        value={clinicalNote.lab_orders}
                                        onChange={e => setClinicalNote({ ...clinicalNote, lab_orders: e.target.value })}
                                        style={{ width: '100%', padding: '1rem', minHeight: '120px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', fontSize: '1rem', background: 'var(--surface)', resize: 'vertical' }}
                                        placeholder="Specific lab panels or X-Rays..."
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--outline-variant)', paddingTop: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--on-surface)' }}>Detailed Prescriptions (Pharmacy)</label>
                                    <button type="button" onClick={() => setPrescriptionItems([...prescriptionItems, { medicine_name: '', instructions: '', quantity: 1 }])} className="btn-signin" style={{ padding: '0.5rem 1rem' }}>+ Add Medication</button>
                                </div>
                                {prescriptionItems.map((item, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr) minmax(0, 1fr) auto', gap: '1rem', marginBottom: '1rem', alignItems: 'start' }}>
                                        <input placeholder="Medicine Name" value={item.medicine_name} onChange={e => { const newItems = [...prescriptionItems]; newItems[idx].medicine_name = e.target.value; setPrescriptionItems(newItems); }} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} required />
                                        <input placeholder="Instructions (e.g. 1 pill twice a day)" value={item.instructions} onChange={e => { const newItems = [...prescriptionItems]; newItems[idx].instructions = e.target.value; setPrescriptionItems(newItems); }} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} required />
                                        <input type="number" min="1" value={item.quantity} onChange={e => { const newItems = [...prescriptionItems]; newItems[idx].quantity = parseInt(e.target.value) || 1; setPrescriptionItems(newItems); }} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} required />
                                        <button type="button" onClick={() => setPrescriptionItems(prescriptionItems.filter((_, i) => i !== idx))} style={{ padding: '0.75rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                                    </div>
                                ))}
                                {prescriptionItems.length === 0 && <p style={{ color: 'var(--outline)', fontStyle: 'italic', fontSize: '0.95rem' }}>No medications added. Click "+ Add Medication" to prescribe items.</p>}
                            </div>

                            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--outline-variant)', paddingTop: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '1rem' }}>Schedule Follow-up (Optional)</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.95rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>Follow-up Date</label>
                                        <input type="date" value={followUp.date} onChange={e => setFollowUp({...followUp, date: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.95rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>Follow-up Time</label>
                                        <input type="time" value={followUp.time} onChange={e => setFollowUp({...followUp, time: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.95rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>Reason for Follow-up</label>
                                    <input type="text" value={followUp.note} onChange={e => setFollowUp({...followUp, note: e.target.value})} placeholder="e.g. Check lab results, remove stitches" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} />
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--outline-variant)' }}>
                                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', borderRadius: 'var(--radius-full)', background: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                    Complete Consultation & Discharge to Pharmacy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'schedule' && (
                <div style={{ background: 'var(--surface-container-lowest)', padding: '3rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderTop: '4px solid #f59e0b' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Block Out Time Slots</h2>
                    <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2.5rem' }}>Specific un-bookable hours are strictly hidden from patient appointment bookings. If you do not plan on attending clinic soon, toggle offline near your name above so Nurses won't assign walkin checks to you either.</p>
                    
                    <form onSubmit={addBlockout} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem', background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>Schedule Type</label>
                                <select value={ruleType} onChange={e => setRuleType(e.target.value as 'SPECIFIC' | 'RECURRING')} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '1rem' }}>
                                    <option value="SPECIFIC">Specific Date</option>
                                    <option value="RECURRING">Recurring Weekly Schedule</option>
                                </select>
                            </div>
                            
                            {ruleType === 'SPECIFIC' ? (
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>Unavailability Date</label>
                                    <input type="date" required value={ruleDate} onChange={e => setRuleDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '1rem' }} />
                                </div>
                            ) : (
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>Day of the Week</label>
                                    <select value={ruleDay} onChange={e => setRuleDay(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '1rem' }}>
                                        <option value="Monday">Monday</option>
                                        <option value="Tuesday">Tuesday</option>
                                        <option value="Wednesday">Wednesday</option>
                                        <option value="Thursday">Thursday</option>
                                        <option value="Friday">Friday</option>
                                        <option value="Saturday">Saturday</option>
                                        <option value="Sunday">Sunday</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>Time Type</label>
                                <select value={timeType} onChange={e => setTimeType(e.target.value as 'ALL_DAY' | 'RANGE')} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '1rem' }}>
                                    <option value="ALL_DAY">All Day Block</option>
                                    <option value="RANGE">Specific Time Range</option>
                                </select>
                            </div>
                            
                            {timeType === 'RANGE' && (
                                <>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>Start Time</label>
                                        <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '1rem' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>End Time</label>
                                        <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '1rem' }} />
                                    </div>
                                </>
                            )}
                            
                            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: 'var(--radius-md)', fontSize: '1rem', height: '46px' }}>Add Blocked Rule +</button>
                        </div>
                    </form>

                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--on-surface)', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '0.5rem' }}>Currently Blocked Slots</h3>
                    {blockouts.length === 0 ? (
                        <p style={{ color: 'var(--outline)', fontStyle: 'italic' }}>No blocked time slots assigned right now.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {blockouts.map(b => (
                                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffbeb', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #fcd34d' }}>
                                    <div style={{ display: 'flex', gap: '3rem' }}>
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: '#92400e', display: 'block', marginBottom: '0.25rem' }}>Date / Day</span>
                                            <span style={{ fontWeight: 600, color: '#92400e', fontSize: '1.1rem' }}>{b.is_recurring ? `Every ${b.day_of_week}` : b.date}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: '#92400e', display: 'block', marginBottom: '0.25rem' }}>Time Range</span>
                                            <span style={{ color: '#92400e', fontWeight: 600, fontSize: '1.1rem' }}>{b.is_all_day ? "All Day" : `${b.start_time} - ${b.end_time}`}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => removeBlockout(b.id)} style={{ padding: '0.5rem 1.5rem', background: 'transparent', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
