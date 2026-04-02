import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Calendar, Edit3, X, Save, Activity } from 'lucide-react';
import './PatientDashboard.css';

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

    const [reschedulingApptId, setReschedulingApptId] = useState<number | null>(null);
    const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

    useEffect(() => {
        if (user && user.role !== 'ADMIN' && token) {
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

    const handleReschedule = async () => {
        try {
            const res = await fetch(`http://localhost:8000/patients/appointments/${reschedulingApptId}/reschedule`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(rescheduleData)
            });
            if (res.ok) {
                setReschedulingApptId(null);
                fetchPatientData();
                alert('Appointment successfully rescheduled.');
            } else {
                const err = await res.json();
                alert(err.detail);
            }
        } catch (e) { console.error(e); }
    };

    if (!user || user.role === 'ADMIN') {
        return <Navigate to="/" />;
    }

    return (
        <div className="container patient-dashboard">
            <div className="patient-dashboard__header">
                <User size={32} color="var(--primary)" />
                <h1>Patient Dashboard</h1>
            </div>

            <div className="patient-dashboard__grid">

                {/* Left Column: Profile */}
                <div className="patient-dashboard__column">
                    <div className="pd-card">
                        <div className="pd-card__header">
                            <h3 className="pd-card__title">My Profile</h3>
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="btn-signin pd-edit-btn">
                                    <Edit3 size={16} /> Edit
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSaveProfile} className="pd-form">
                                <div>
                                    <label className="pd-form__label">Full Name</label>
                                    <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="pd-form__input" required />
                                </div>
                                <div>
                                    <label className="pd-form__label">Gender</label>
                                    <select value={editForm.gender} onChange={e => setEditForm(prev => ({ ...prev, gender: e.target.value }))} className="pd-form__input">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="pd-form__row">
                                    <div>
                                        <label className="pd-form__label">Email Contact</label>
                                        <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="pd-form__input" />
                                    </div>
                                    <div>
                                        <label className="pd-form__label">Phone Number</label>
                                        <input type="text" value={editForm.contact_info} onChange={e => setEditForm({ ...editForm, contact_info: e.target.value })} className="pd-form__input" />
                                    </div>
                                </div>
                                <div>
                                    <label className="pd-form__label">Current Address</label>
                                    <textarea value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className="pd-form__textarea" rows={2}></textarea>
                                </div>
                                <div>
                                    <label className="pd-form__label">Known Allergies</label>
                                    <input type="text" value={editForm.known_allergies} onChange={e => setEditForm({ ...editForm, known_allergies: e.target.value })} className="pd-form__input" placeholder="e.g., Peanuts, Penicillin..." />
                                </div>
                                <div>
                                    <label className="pd-form__label">Chronic Diseases</label>
                                    <input type="text" value={editForm.chronic_diseases} onChange={e => setEditForm({ ...editForm, chronic_diseases: e.target.value })} className="pd-form__input" placeholder="e.g., Hypertension..." />
                                </div>

                                <div className="pd-emergency-section">
                                    <h4 className="pd-emergency-section__title">Emergency Contact</h4>
                                    <div className="pd-emergency-fields">
                                        <div>
                                            <label className="pd-form__label">Contact Name</label>
                                            <input type="text" value={editForm.emergency_contact_name} onChange={e => setEditForm({ ...editForm, emergency_contact_name: e.target.value })} className="pd-form__input" />
                                        </div>
                                        <div>
                                            <label className="pd-form__label">Contact Phone</label>
                                            <input type="text" value={editForm.emergency_contact_phone} onChange={e => setEditForm({ ...editForm, emergency_contact_phone: e.target.value })} className="pd-form__input" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pd-form__actions">
                                    <button type="button" onClick={handleCancelEdit} className="btn-signin pd-form__action-btn">
                                        <X size={18} /> Cancel
                                    </button>
                                    <button type="submit" className="btn-primary pd-form__action-btn">
                                        <Save size={18} /> Save Settings
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="pd-profile-view">
                                {patientInfo ? (
                                    <>
                                        <div className="pd-profile-grid">
                                            <div>
                                                <strong className="pd-profile-label">Name</strong>
                                                <span>{patientInfo.name} ({patientInfo.gender}, {patientInfo.age} yrs)</span>
                                            </div>
                                            <div>
                                                <strong className="pd-profile-label">Email</strong>
                                                <span>{patientInfo.email || '-'}</span>
                                            </div>
                                            <div>
                                                <strong className="pd-profile-label">Phone Number</strong>
                                                <span>{patientInfo.contact_info || '-'}</span>
                                            </div>
                                            <div>
                                                <strong className="pd-profile-label">Current Address</strong>
                                                <span>{patientInfo.address || '-'}</span>
                                            </div>
                                        </div>

                                        <div className="pd-emergency-card">
                                            <strong className="pd-emergency-card__label">Emergency Contact</strong>
                                            <div className="pd-emergency-card__row">
                                                <span>{patientInfo.emergency_contact_name || 'Not provided'}</span>
                                                <span>{patientInfo.emergency_contact_phone}</span>
                                            </div>
                                        </div>

                                        <div className="pd-medical-tokens">
                                            <strong className="pd-medical-tokens__title">Immovable Medical Tokens</strong>
                                            <div className="pd-medical-tokens__grid">
                                                <div>
                                                    <strong className="pd-token-label">Blood Type</strong>
                                                    <span className="pd-token-value">{patientInfo.blood_type || '-'}</span>
                                                </div>
                                                <div>
                                                    <strong className="pd-token-label">National ID</strong>
                                                    <span className="pd-token-value">{patientInfo.national_id || '-'}</span>
                                                </div>
                                                <div className="pd-full-width">
                                                    <strong className="pd-token-label">Known Allergies</strong>
                                                    <span className="pd-token-allergy">{patientInfo.known_allergies || 'None recorded'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="pd-loading-text">Loading medical profile...</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Timelines */}
                <div className="patient-dashboard__column">

                    {/* Appointments */}
                    <div className="pd-card">
                        <h3 className="pd-card__title--icon">
                            <Calendar size={20} /> Upcoming Appointments
                        </h3>
                        {appointments.length === 0 ? (
                            <p className="pd-empty-text">You have no upcoming appointments booked.</p>
                        ) : (
                            <div className="pd-appointments-grid">
                                {appointments.map(a => (
                                    <div key={a.id} className={`pd-appointment-card ${a.is_doctor_scheduled ? 'pd-appointment-card--doctor' : ''}`}>
                                        <div>
                                            {a.is_doctor_scheduled && <span className="pd-doctor-badge">Doctor's Appointment</span>}
                                            <strong className="pd-appointment-service">{a.service}</strong>
                                            {a.details && <span className="pd-appointment-details">"{a.details}"</span>}
                                        </div>
                                        <div className="pd-appointment-right">
                                            {reschedulingApptId === a.id ? (
                                                <div className="pd-reschedule-form">
                                                    <input type="date" value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} className="pd-reschedule-input" />
                                                    <input type="time" value={rescheduleData.time} onChange={e => setRescheduleData({...rescheduleData, time: e.target.value})} className="pd-reschedule-input" />
                                                    <div className="pd-reschedule-actions">
                                                        <button onClick={handleReschedule} className="pd-reschedule-save">Save Changes</button>
                                                        <button onClick={() => setReschedulingApptId(null)} className="pd-reschedule-cancel">Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <strong className="pd-appointment-date">{a.date}</strong>
                                                    <span className="pd-appointment-time">{a.time}</span>
                                                    {!a.is_doctor_scheduled && (
                                                        <button onClick={() => { setReschedulingApptId(a.id); setRescheduleData({ date: a.date, time: a.time }); }} className="pd-btn-reschedule">
                                                            Reschedule
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Medical History */}
                    <div className="pd-card">
                        <h3 className="pd-card__title--icon">
                            <Activity size={20} /> Medical Treatment History
                        </h3>
                        {history.length === 0 ? (
                            <p className="pd-empty-text">No previous visits recorded.</p>
                        ) : (
                            <div className="pd-history-list">
                                {history.map((h, i) => (
                                    <div key={i} className="pd-history-item">
                                        <div className="pd-history-line"></div>
                                        <div className="pd-history-dot"></div>
                                        <div className="pd-history-card">
                                            <div className="pd-history-card__header">
                                                <h4 className="pd-history-card__date">Visit on {new Date(h.date).toLocaleDateString()}</h4>
                                                <span className="pd-history-card__doctor">Dr. {h.doctor_name.split('@')[0]}</span>
                                            </div>
                                            <div className="pd-history-card__grid">
                                                <div>
                                                    <strong className="pd-history-section-label">Outcome Diagnosis</strong>
                                                    <p className="pd-history-diagnosis">{h.diagnosis || 'Pending'}</p>
                                                </div>
                                                {(h.treatments || (h.prescription_items && h.prescription_items.length > 0)) && (
                                                    <div>
                                                        <strong className="pd-history-section-label">Prescriptions</strong>
                                                        {h.treatments && <p className="pd-history-treatments">{h.treatments}</p>}
                                                        {h.prescription_items && h.prescription_items.length > 0 && (
                                                            <ul className="pd-history-rx-list">
                                                                {h.prescription_items.map((pi: any, idx: number) => (
                                                                    <li key={idx} className="pd-history-rx-item">{pi.quantity}x {pi.name}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                )}
                                                {h.next_appointment && (
                                                    <div className="pd-next-appointment">
                                                        <strong className="pd-next-appointment__title">Next Appointment Scheduled</strong>
                                                        <span className="pd-next-appointment__datetime">{h.next_appointment.date} at {h.next_appointment.time}</span>
                                                        <span className="pd-next-appointment__reason">Reason: {h.next_appointment.note}</span>
                                                    </div>
                                                )}
                                                {(h.grand_total !== undefined && h.grand_total > 0) && (
                                                    <div className="pd-billing">
                                                        <h5 className="pd-billing__title">Billing Summary</h5>
                                                        <div className="pd-billing__grid">
                                                            <div className="pd-billing__row">
                                                                <span>Treatment Fee</span>
                                                                <span>${(h.treatment_fee || 0).toFixed(2)}</span>
                                                            </div>
                                                            <div className="pd-billing__row">
                                                                <span>Medications</span>
                                                                <span>${(h.medication_cost || 0).toFixed(2)}</span>
                                                            </div>
                                                            <div className="pd-billing__total">
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
