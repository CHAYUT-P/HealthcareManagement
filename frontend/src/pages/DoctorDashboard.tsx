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

    useEffect(() => {
        fetchCurrentPatient();
    }, []);

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
                body: JSON.stringify({ ...clinicalNote, prescription_items: prescriptionItems })
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
                alert("Consultation Complete. Patient moved to Pharmacy/Billing.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>Loading workspace...</div>;
    }

    return (
        <div style={{ padding: '6rem 2rem 4rem', maxWidth: '1280px', margin: '0 auto', minHeight: '100vh' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Doctor Dashboard - Focus Mode</h1>
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>Dr. {user?.username?.split('@')[0]}</p>
                </div>
            </header>

            {!currentData ? (
                <div style={{ background: 'var(--surface-container-lowest)', padding: '5rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', outline: '2px dashed var(--outline-variant)' }}>
                    <ClipboardList size={48} style={{ color: 'var(--outline)', margin: '0 auto 1.5rem' }} />
                    <h2 style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>No Active Patient</h2>
                    <p style={{ color: 'var(--outline)', marginBottom: '2rem' }}>You have no patients currently assigned in your examination room.</p>
                    <button onClick={fetchCurrentPatient} className="btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: 'var(--radius-full)' }}>Refresh Room</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
                    {/* Left Column: Read-Only Triage & Medical Context */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Patient Profile Context */}
                        <section style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderTop: '4px solid var(--primary)' }}>
                            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '0.5rem' }}>General Information</h2>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div><strong style={{ color: 'var(--on-surface-variant)' }}>Name:</strong> <span style={{ fontSize: '1.2rem', display: 'block' }}>{currentData.patient.name}</span></div>
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

                        {/* Reason for Visit & Vitals Context */}
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

                    {/* Right Column: Active Diagnostic and Notes Input */}
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

                            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--outline-variant)' }}>
                                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', borderRadius: 'var(--radius-full)', background: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                    Complete Consultation & Discharge to Pharmacy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
