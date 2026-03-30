import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { ChevronLeft, Activity, Stethoscope } from 'lucide-react';

const PatientRecords = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<any>(null);

    const [visit, setVisit] = useState({
        vitals: '',
        symptoms: '',
        diagnosis: '',
        clinicalNotes: ''
    });

    useEffect(() => {
        const users = JSON.parse(localStorage.getItem('healthcare_users_list') || '[]');
        setPatient(users.find((u: any) => u.id === id));

        const visits = JSON.parse(localStorage.getItem('healthcare_visits') || '{}');
        if (visits[id || '']) {
            setVisit(visits[id || '']);
        }
    }, [id]);

    if (!user || !['NURSE', 'DOCTOR'].includes(user.role)) {
        return <Navigate to="/" />;
    }

    if (!patient) return <div className="container" style={{ paddingTop: '6rem' }}>Loading patient...</div>;

    const handleSaveVisit = () => {
        const visits = JSON.parse(localStorage.getItem('healthcare_visits') || '{}');
        visits[patient.id] = visit;
        localStorage.setItem('healthcare_visits', JSON.stringify(visits));
        alert('Visit records saved successfully!');
    };

    const isNurse = user.role === 'NURSE';
    const isDoctor = user.role === 'DOCTOR';

    return (
        <div className="container" style={{ paddingTop: '6rem', minHeight: '80vh', paddingBottom: '4rem' }}>
            <button onClick={() => navigate('/staff')} style={{ background: 'none', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem', fontWeight: 600 }}>
                <ChevronLeft size={20} /> Back to Search
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', alignSelf: 'start' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{patient.firstName} {patient.lastName}</h2>
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Patient ID: {patient.id}</p>
                    <hr style={{ margin: '1.5rem 0', borderColor: 'var(--outline-variant)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <p><strong>Email:</strong> {patient.email}</p>
                        <p><strong>Phone:</strong> {patient.phone}</p>
                        <p><strong>Account Status:</strong> <span style={{ color: 'var(--secondary)' }}>{patient.status || 'ACTIVE'}</span></p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* NURSE WORKFLOW */}
                    <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                            <Activity size={24} />
                            <h3>Nurse Intake (Triage)</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Vitals (Temp, BP, HR)</label>
                                <textarea
                                    value={visit.vitals}
                                    onChange={e => setVisit({ ...visit, vitals: e.target.value })}
                                    disabled={!isNurse}
                                    style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', minHeight: '80px', opacity: isNurse ? 1 : 0.7, background: isNurse ? 'var(--surface)' : 'var(--surface-container-lowest)' }}
                                    placeholder="e.g. Temp: 98.6F, BP: 120/80..."
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Initial Symptoms</label>
                                <textarea
                                    value={visit.symptoms}
                                    onChange={e => setVisit({ ...visit, symptoms: e.target.value })}
                                    disabled={!isNurse}
                                    style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', minHeight: '80px', opacity: isNurse ? 1 : 0.7, background: isNurse ? 'var(--surface)' : 'var(--surface-container-lowest)' }}
                                    placeholder="Patient reports..."
                                />
                            </div>
                            {isNurse && <button className="btn-primary" onClick={handleSaveVisit} style={{ alignSelf: 'flex-start' }}>Save Nurse Record</button>}
                        </div>
                    </div>

                    {/* DOCTOR WORKFLOW */}
                    <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                            <Stethoscope size={24} />
                            <h3>Doctor Evaluation</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Diagnosis</label>
                                <input
                                    type="text"
                                    value={visit.diagnosis}
                                    onChange={e => setVisit({ ...visit, diagnosis: e.target.value })}
                                    disabled={!isDoctor}
                                    style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', opacity: isDoctor ? 1 : 0.7, background: isDoctor ? 'var(--surface)' : 'var(--surface-container-lowest)' }}
                                    placeholder="Official diagnosis..."
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Clinical Notes & Treatment</label>
                                <textarea
                                    value={visit.clinicalNotes}
                                    onChange={e => setVisit({ ...visit, clinicalNotes: e.target.value })}
                                    disabled={!isDoctor}
                                    style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', minHeight: '120px', opacity: isDoctor ? 1 : 0.7, background: isDoctor ? 'var(--surface)' : 'var(--surface-container-lowest)' }}
                                    placeholder="Doctor's notes and prescribed treatment..."
                                />
                            </div>
                            {isDoctor && <button className="btn-primary" onClick={handleSaveVisit} style={{ alignSelf: 'flex-start' }}>Save Doctor Record</button>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientRecords;
