import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { ChevronLeft, Activity, Stethoscope, Edit3, X, Save } from 'lucide-react';
import { PatientProfileHeader } from '../components/nurse/PatientProfileHeader';

const PatientRecords = () => {
    const { id } = useParams();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    
    const [patient, setPatient] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [visit, setVisit] = useState({
        vitals: '',
        symptoms: '',
        diagnosis: '',
        clinicalNotes: ''
    });

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '', age: 0, gender: '', national_id: '',
        email: '', contact_info: '', address: '',
        blood_type: '', known_allergies: '', chronic_diseases: '',
        emergency_contact_name: '', emergency_contact_phone: ''
    });

    const fetchPatientData = async () => {
        try {
            // First we try to search by ID directly. In a real app we'd have a specific GET /patients/{id}
            // For now, search and filter.
            const res = await fetch(`http://localhost:8000/patients/search?q=`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const p = data.find((p: any) => p.id === Number(id));
                if (p) {
                    setPatient(p);
                    setEditForm({
                        name: p.name || '', age: p.age || 0, gender: p.gender || '', national_id: p.national_id || '',
                        email: p.email || '', contact_info: p.contact_info || '', address: p.address || '',
                        blood_type: p.blood_type || '', known_allergies: p.known_allergies || '', chronic_diseases: p.chronic_diseases || '',
                        emergency_contact_name: p.emergency_contact_name || '', emergency_contact_phone: p.emergency_contact_phone || ''
                    });
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchPatientData();

        // LocalStorage fallback for visit data (keeping original behavior)
        const visits = JSON.parse(localStorage.getItem('healthcare_visits') || '{}');
        if (visits[id || '']) {
            setVisit(visits[id || '']);
        }
    }, [id, token]);

    if (!user || !['NURSE', 'DOCTOR', 'ADMIN'].includes(user.role)) {
        return <Navigate to="/" />;
    }

    if (isLoading) return <div className="container" style={{ paddingTop: '6rem' }}>Loading patient...</div>;
    if (!patient) return <div className="container" style={{ paddingTop: '6rem' }}>Patient not found.</div>;

    const handleSaveVisit = () => {
        const visits = JSON.parse(localStorage.getItem('healthcare_visits') || '{}');
        visits[patient.id] = visit;
        localStorage.setItem('healthcare_visits', JSON.stringify(visits));
        alert('Visit records saved successfully!');
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8000/patients/${patient.id}/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                const updated = await res.json();
                setPatient(updated);
                setIsEditingProfile(false);
                alert("Profile updated successfully!");
            } else {
                const err = await res.json();
                alert(`Error: ${err.detail}`);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to update profile.");
        }
    };

    const isNurse = user.role === 'NURSE';
    const isDoctor = user.role === 'DOCTOR';

    return (
        <div className="container" style={{ paddingTop: '6rem', minHeight: '80vh', paddingBottom: '4rem' }}>
            <button onClick={() => navigate('/staff')} style={{ background: 'none', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem', fontWeight: 600 }}>
                <ChevronLeft size={20} /> Back to Search
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* View Mode */}
                    {!isEditingProfile ? (
                        <>
                            <PatientProfileHeader patient={patient} />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-signin" onClick={() => setIsEditingProfile(true)} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                    <Edit3 size={18} /> Edit Full Profile
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Edit Mode */
                        <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ color: 'var(--primary)', margin: 0 }}>Edit Patient Profile</h3>
                            </div>

                            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Full Name</label>
                                    <input type="text" value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Age</label>
                                        <input type="number" value={editForm.age} onChange={e => setEditForm(prev => ({ ...prev, age: Number(e.target.value) }))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} required />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Gender</label>
                                        <select value={editForm.gender} onChange={e => setEditForm(prev => ({ ...prev, gender: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Citizen ID</label>
                                    <input type="text" value={editForm.national_id} onChange={e => setEditForm(prev => ({ ...prev, national_id: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} required />
                                </div>

                                <div style={{ borderTop: '1px solid var(--outline-variant)', margin: '0.5rem 0' }}></div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Blood Type</label>
                                    <select value={editForm.blood_type} onChange={e => setEditForm(prev => ({ ...prev, blood_type: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
                                        <option value="">-- Select --</option>
                                        <option value="A+">A+</option><option value="A-">A-</option>
                                        <option value="B+">B+</option><option value="B-">B-</option>
                                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                        <option value="O+">O+</option><option value="O-">O-</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Known Allergies</label>
                                    <input type="text" value={editForm.known_allergies} onChange={e => setEditForm(prev => ({ ...prev, known_allergies: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Chronic Diseases</label>
                                    <input type="text" value={editForm.chronic_diseases} onChange={e => setEditForm(prev => ({ ...prev, chronic_diseases: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} />
                                </div>

                                <div style={{ borderTop: '1px solid var(--outline-variant)', margin: '0.5rem 0' }}></div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Email</label>
                                        <input type="email" value={editForm.email} onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Phone</label>
                                        <input type="text" value={editForm.contact_info} onChange={e => setEditForm(prev => ({ ...prev, contact_info: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Emergency Contact Name</label>
                                    <input type="text" value={editForm.emergency_contact_name} onChange={e => setEditForm(prev => ({ ...prev, emergency_contact_name: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Emergency Contact Phone</label>
                                    <input type="text" value={editForm.emergency_contact_phone} onChange={e => setEditForm(prev => ({ ...prev, emergency_contact_phone: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" onClick={() => setIsEditingProfile(false)} className="btn-signin" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                        <X size={18} /> Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                        <Save size={18} /> Save Complete Profile
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
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

