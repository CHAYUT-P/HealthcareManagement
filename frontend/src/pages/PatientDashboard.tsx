import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Calendar, Edit3, X, Save, Activity } from 'lucide-react';

const PatientDashboard = () => {
    const { user, token } = useAuth();
    const [patientInfo, setPatientInfo] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);

    // Edit Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        gender: '',
        email: '',
        contact_info: '',
        address: '',
        blood_type: '',
        known_allergies: '',
        chronic_diseases: '',
        emergency_contact_name: '',
        emergency_contact_phone: ''
    });

    useEffect(() => {
        if (user?.role === 'PATIENT' && token) {
            fetchPatientData();
        }
    }, [user, token]);

    const fetchPatientData = async () => {
        try {
            const pRes = await fetch('http://localhost:8000/patients/me', { headers: { Authorization: `Bearer ${token}` } });
            if (pRes.ok) {
                const pData = await pRes.json();
                setPatientInfo(pData);
                setEditForm({
                    name: pData.name || '',
                    gender: pData.gender || '',
                    email: pData.email || '',
                    contact_info: pData.contact_info || '',
                    address: pData.address || '',
                    blood_type: pData.blood_type || '',
                    known_allergies: pData.known_allergies || '',
                    chronic_diseases: pData.chronic_diseases || '',
                    emergency_contact_name: pData.emergency_contact_name || '',
                    emergency_contact_phone: pData.emergency_contact_phone || ''
                });
            }

            const aRes = await fetch('http://localhost:8000/patients/me/appointments', { headers: { Authorization: `Bearer ${token}` } });
            if (aRes.ok) setAppointments(await aRes.json());

            const hRes = await fetch('http://localhost:8000/patients/me/history', { headers: { Authorization: `Bearer ${token}` } });
            if (hRes.ok) setHistory(await hRes.json());

        } catch (e) { console.error(e); }
    };

    const handleCancelEdit = () => {
        if (patientInfo) {
            setEditForm({
                name: patientInfo.name || '',
                gender: patientInfo.gender || '',
                email: patientInfo.email || '',
                contact_info: patientInfo.contact_info || '',
                address: patientInfo.address || '',
                blood_type: patientInfo.blood_type || '',
                known_allergies: patientInfo.known_allergies || '',
                chronic_diseases: patientInfo.chronic_diseases || '',
                emergency_contact_name: patientInfo.emergency_contact_name || '',
                emergency_contact_phone: patientInfo.emergency_contact_phone || ''
            });
        }
        setIsEditing(false);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8000/patients/me/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                const updated = await res.json();
                setPatientInfo(updated);
                setIsEditing(false);
            }
        } catch (e) { console.error(e); }
    };

    if (!user || user.role !== 'PATIENT') {
        return <Navigate to="/" />;
    }

    return (
        <div className="container" style={{ paddingTop: '6rem', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <User size={32} color="var(--primary)" />
                <h1>Patient Dashboard</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '2rem' }}>

                {/* Left Column: Profile */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ color: 'var(--primary)' }}>My Profile</h3>
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="btn-signin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                                    <Edit3 size={16} /> Edit
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Full Name</label>
                                    <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Gender</label>
                                    <select value={editForm.gender} onChange={e => setEditForm(prev => ({ ...prev, gender: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Email Contact</label>
                                        <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Phone Number</label>
                                        <input type="text" value={editForm.contact_info} onChange={e => setEditForm({ ...editForm, contact_info: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Current Address</label>
                                    <textarea value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', resize: 'vertical' }} rows={2}></textarea>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Known Allergies</label>
                                    <input type="text" value={editForm.known_allergies} onChange={e => setEditForm({ ...editForm, known_allergies: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} placeholder="e.g., Peanuts, Penicillin..." />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Chronic Diseases</label>
                                    <input type="text" value={editForm.chronic_diseases} onChange={e => setEditForm({ ...editForm, chronic_diseases: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} placeholder="e.g., Hypertension..." />
                                </div>

                                <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                    <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--on-surface)' }}>Emergency Contact</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Contact Name</label>
                                            <input type="text" value={editForm.emergency_contact_name} onChange={e => setEditForm({ ...editForm, emergency_contact_name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>Contact Phone</label>
                                            <input type="text" value={editForm.emergency_contact_phone} onChange={e => setEditForm({ ...editForm, emergency_contact_phone: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" onClick={handleCancelEdit} className="btn-signin" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                        <X size={18} /> Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                        <Save size={18} /> Save Settings
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {patientInfo ? (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                            <div>
                                                <strong style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', display: 'block' }}>Name</strong>
                                                <span>{patientInfo.name} ({patientInfo.gender}, {patientInfo.age} yrs)</span>
                                            </div>
                                            <div>
                                                <strong style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', display: 'block' }}>Email</strong>
                                                <span>{patientInfo.email || '-'}</span>
                                            </div>
                                            <div>
                                                <strong style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', display: 'block' }}>Phone Number</strong>
                                                <span>{patientInfo.contact_info || '-'}</span>
                                            </div>
                                            <div>
                                                <strong style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', display: 'block' }}>Current Address</strong>
                                                <span>{patientInfo.address || '-'}</span>
                                            </div>
                                        </div>

                                        <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', marginTop: '0.5rem' }}>
                                            <strong style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.5rem' }}>Emergency Contact</strong>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{patientInfo.emergency_contact_name || 'Not provided'}</span>
                                                <span>{patientInfo.emergency_contact_phone}</span>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--outline-variant)', paddingTop: '1.5rem' }}>
                                            <strong style={{ fontSize: '0.95rem', color: 'var(--on-surface)', display: 'block', marginBottom: '1rem' }}>Immovable Medical Tokens</strong>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <strong style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'block', textTransform: 'uppercase' }}>Blood Type</strong>
                                                    <span style={{ fontWeight: 600 }}>{patientInfo.blood_type || '-'}</span>
                                                </div>
                                                <div>
                                                    <strong style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'block', textTransform: 'uppercase' }}>ID Number</strong>
                                                    <span style={{ fontWeight: 600 }}>{patientInfo.national_id || '-'}</span>
                                                </div>
                                                <div style={{ gridColumn: '1 / -1' }}>
                                                    <strong style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'block', textTransform: 'uppercase' }}>Known Allergies</strong>
                                                    <span style={{ color: '#dc2626', fontWeight: 600 }}>{patientInfo.known_allergies || 'None recorded'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p style={{ color: 'var(--outline)' }}>Loading medical profile...</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Timelines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Appointments */}
                    <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Calendar size={20} /> Upcoming Appointments
                        </h3>
                        {appointments.length === 0 ? (
                            <p style={{ color: 'var(--on-surface-variant)' }}>You have no upcoming appointments booked.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {appointments.map(a => (
                                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', border: '1px solid var(--primary-container)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
                                        <div>
                                            <strong style={{ fontSize: '1.1rem', color: 'var(--on-surface)', display: 'block' }}>{a.service}</strong>
                                            {a.details && <span style={{ color: 'var(--on-surface-variant)', display: 'block', fontSize: '0.9rem', marginTop: '0.25rem' }}>"{a.details}"</span>}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <strong style={{ display: 'block', color: 'var(--primary)' }}>{a.date}</strong>
                                            <span style={{ color: 'var(--on-surface-variant)' }}>{a.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Medical History */}
                    <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Activity size={20} /> Medical Treatment History
                        </h3>
                        {history.length === 0 ? (
                            <p style={{ color: 'var(--on-surface-variant)' }}>No previous visits recorded.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {history.map((h, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
                                        <div style={{ width: '2px', background: 'var(--primary-container)', position: 'absolute', left: '11px', top: '24px', bottom: '-1.5rem', zIndex: 0 }}></div>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, zIndex: 1, marginTop: '2px', border: '4px solid var(--surface-container-lowest)' }}></div>
                                        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <h4 style={{ color: 'var(--primary)' }}>Visit on {new Date(h.date).toLocaleDateString()}</h4>
                                                <span style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>Dr. {h.doctor_name.split('@')[0]}</span>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                                <div>
                                                    <strong style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Outcome Diagnosis</strong>
                                                    <p style={{ marginTop: '0.25rem', fontWeight: 500, color: 'var(--on-surface)' }}>{h.diagnosis || 'Pending'}</p>
                                                </div>
                                                {(h.treatments || (h.prescription_items && h.prescription_items.length > 0)) && (
                                                    <div>
                                                        <strong style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Prescriptions</strong>
                                                        {h.treatments && <p style={{ marginTop: '0.25rem', color: 'var(--on-surface)', whiteSpace: 'pre-wrap' }}>{h.treatments}</p>}
                                                        {h.prescription_items && h.prescription_items.length > 0 && (
                                                            <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0, color: 'var(--on-surface)' }}>
                                                                {h.prescription_items.map((pi: any, idx: number) => (
                                                                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{pi.quantity}x {pi.name}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                )}
                                                {(h.grand_total !== undefined && h.grand_total > 0) && (
                                                    <div style={{ marginTop: '1rem', background: 'var(--surface-variant)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
                                                        <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Billing Summary</h5>
                                                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--on-surface)' }}>
                                                                <span>Treatment Fee</span>
                                                                <span>${(h.treatment_fee || 0).toFixed(2)}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--on-surface)' }}>
                                                                <span>Medications</span>
                                                                <span>${(h.medication_cost || 0).toFixed(2)}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', color: 'var(--on-surface)', fontWeight: 700, borderTop: '1px solid var(--outline-variant)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                                                                <span>Grand Total</span>
                                                                <span>${(h.grand_total || 0).toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
