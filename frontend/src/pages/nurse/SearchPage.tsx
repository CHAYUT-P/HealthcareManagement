import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, UserPlus, CalendarPlus, Activity, X, Edit3, Save } from 'lucide-react';
import { PatientProfileHeader } from '../../components/nurse/PatientProfileHeader';

export const SearchPage: React.FC = () => {
    const { token, logout } = useAuth();

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Selection State
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [patientHistory, setPatientHistory] = useState<any[]>([]);

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '', age: 0, gender: '', national_id: '',
        email: '', contact_info: '', address: '',
        blood_type: '', known_allergies: '', chronic_diseases: '',
        emergency_contact_name: '', emergency_contact_phone: ''
    });

    // New Patient Registration
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [newPatient, setNewPatient] = useState({
        name: '', age: '', gender: 'Male', contact_info: '', email: '',
        national_id: '', blood_type: '', known_allergies: '',
        chronic_diseases: '', address: '',
        emergency_contact_name: '', emergency_contact_phone: ''
    });

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
            if (res.status === 401) {
                logout();
                return;
            }
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
            if (res.status === 401) {
                logout();
                return;
            }
            if (res.ok) setPatientHistory(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleSelectPatient = (patient: any) => {
        setSelectedPatient(patient);
        fetchPatientHistory(patient.id);
        setSearchQuery('');
        setSearchResults([]);
        setShowRegisterForm(false);
        setIsEditingProfile(false);
        setEditForm({
            name: patient.name || '', age: patient.age || 0, gender: patient.gender || '', national_id: patient.national_id || '',
            email: patient.email || '', contact_info: patient.contact_info || '', address: patient.address || '',
            blood_type: patient.blood_type || '', known_allergies: patient.known_allergies || '', chronic_diseases: patient.chronic_diseases || '',
            emergency_contact_name: patient.emergency_contact_name || '', emergency_contact_phone: patient.emergency_contact_phone || ''
        });
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8000/patients/${selectedPatient.id}/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (res.status === 401) {
                logout();
                return;
            }

            if (res.ok) {
                const updated = await res.json();
                setSelectedPatient(updated);
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

    const addToQueue = async () => {
        if (!selectedPatient) return;
        try {
            const res = await fetch('http://localhost:8000/patients/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ patient_id: selectedPatient.id })
            });

            if (res.status === 401) {
                logout();
                return;
            }

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

    const handleRegisterPatient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPatient.name || !newPatient.national_id) {
            alert('Name and Citizen ID are required.');
            return;
        }
        setIsRegistering(true);
        try {
            const payload = {
                ...newPatient,
                age: parseInt(newPatient.age) || 0,
            };
            const res = await fetch('http://localhost:8000/patients/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (res.status === 401) {
                logout();
                return;
            }

            if (res.ok) {
                const created = await res.json();
                alert(`Patient "${created.name}" registered successfully!`);
                setShowRegisterForm(false);
                setNewPatient({
                    name: '', age: '', gender: 'Male', contact_info: '', email: '',
                    national_id: '', blood_type: '', known_allergies: '',
                    chronic_diseases: '', address: '',
                    emergency_contact_name: '', emergency_contact_phone: ''
                });
                handleSelectPatient(created);
            } else {
                const err = await res.json();
                alert(err.detail || 'Registration failed');
            }
        } catch (e) {
            console.error(e);
            alert('Error registering patient');
        } finally {
            setIsRegistering(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--outline-variant)', fontSize: '0.95rem',
        background: 'var(--surface)'
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.85rem', color: 'var(--on-surface-variant)',
        marginBottom: '0.25rem', fontWeight: 600
    };

    return (
        <div style={{ paddingTop: '6rem', minHeight: '100vh', paddingBottom: '4rem', maxWidth: '1280px', margin: '0 auto', padding: '6rem 2rem 4rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Patient Search & Registration</h1>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>Find existing patients or register new walk-in patients.</p>
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

                    {/* Register New Patient Button */}
                    <button
                        onClick={() => { setShowRegisterForm(!showRegisterForm); setSelectedPatient(null); }}
                        className="btn-primary"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '1rem', fontSize: '1rem', borderRadius: 'var(--radius-lg)',
                            background: showRegisterForm ? 'var(--on-surface-variant)' : 'var(--primary)',
                        }}
                    >
                        {showRegisterForm ? <><X size={20} /> Cancel Registration</> : <><UserPlus size={20} /> Register New Patient</>}
                    </button>

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
                                                    HN: {p.hn || 'N/A'} • {p.gender}, {p.age} yrs
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

                {/* Right Column: Profile/Registration Form */}
                <div>
                    {showRegisterForm ? (
                        /* ===== NEW PATIENT REGISTRATION FORM ===== */
                        <div style={{ background: 'var(--surface-container-lowest)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderTop: '4px solid var(--primary)' }}>
                            <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <UserPlus size={22} /> Register New Walk-in Patient
                            </h3>

                            <form onSubmit={handleRegisterPatient} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Personal Info */}
                                <fieldset style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                                    <legend style={{ padding: '0 0.5rem', fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>Personal Information</legend>
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={labelStyle}>Full Name <span style={{ color: '#dc2626' }}>*</span></label>
                                            <input type="text" value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} style={inputStyle} placeholder="Somchai Jaidee" required />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Age</label>
                                            <input type="number" value={newPatient.age} onChange={e => setNewPatient({ ...newPatient, age: e.target.value })} style={inputStyle} placeholder="30" />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Gender</label>
                                            <select value={newPatient.gender} onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })} style={inputStyle}>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                        <div>
                                            <label style={labelStyle}>Citizen ID (บัตรประชาชน) <span style={{ color: '#dc2626' }}>*</span></label>
                                            <input type="text" value={newPatient.national_id} onChange={e => setNewPatient({ ...newPatient, national_id: e.target.value })} style={inputStyle} placeholder="1-2345-67890-12-3" required />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Email</label>
                                            <input type="email" value={newPatient.email} onChange={e => setNewPatient({ ...newPatient, email: e.target.value })} style={inputStyle} placeholder="patient@email.com" />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                        <div>
                                            <label style={labelStyle}>Phone Number</label>
                                            <input type="text" value={newPatient.contact_info} onChange={e => setNewPatient({ ...newPatient, contact_info: e.target.value })} style={inputStyle} placeholder="08X-XXX-XXXX" />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Address</label>
                                            <input type="text" value={newPatient.address} onChange={e => setNewPatient({ ...newPatient, address: e.target.value })} style={inputStyle} placeholder="123 Street, City" />
                                        </div>
                                    </div>
                                </fieldset>

                                {/* Medical Info */}
                                <fieldset style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                                    <legend style={{ padding: '0 0.5rem', fontWeight: 700, color: '#dc2626', fontSize: '0.95rem' }}>Medical Information</legend>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={labelStyle}>Blood Type</label>
                                            <select value={newPatient.blood_type} onChange={e => setNewPatient({ ...newPatient, blood_type: e.target.value })} style={inputStyle}>
                                                <option value="">-- Select --</option>
                                                <option value="A+">A+</option><option value="A-">A-</option>
                                                <option value="B+">B+</option><option value="B-">B-</option>
                                                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                                <option value="O+">O+</option><option value="O-">O-</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Known Allergies</label>
                                            <input type="text" value={newPatient.known_allergies} onChange={e => setNewPatient({ ...newPatient, known_allergies: e.target.value })} style={inputStyle} placeholder="Penicillin, Peanuts..." />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1rem' }}>
                                        <label style={labelStyle}>Chronic Diseases</label>
                                        <input type="text" value={newPatient.chronic_diseases} onChange={e => setNewPatient({ ...newPatient, chronic_diseases: e.target.value })} style={inputStyle} placeholder="Hypertension, Diabetes..." />
                                    </div>
                                </fieldset>

                                {/* Emergency Contact */}
                                <fieldset style={{ border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                                    <legend style={{ padding: '0 0.5rem', fontWeight: 700, color: 'var(--on-surface)', fontSize: '0.95rem' }}>Emergency Contact</legend>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={labelStyle}>Contact Name</label>
                                            <input type="text" value={newPatient.emergency_contact_name} onChange={e => setNewPatient({ ...newPatient, emergency_contact_name: e.target.value })} style={inputStyle} placeholder="Jane Doe" />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Contact Phone</label>
                                            <input type="text" value={newPatient.emergency_contact_phone} onChange={e => setNewPatient({ ...newPatient, emergency_contact_phone: e.target.value })} style={inputStyle} placeholder="09X-XXX-XXXX" />
                                        </div>
                                    </div>
                                </fieldset>

                                <button type="submit" className="btn-primary" disabled={isRegistering} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    padding: '1rem', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)', width: '100%'
                                }}>
                                    {isRegistering ? 'Registering...' : <><UserPlus size={20} /> Register Patient</>}
                                </button>
                            </form>
                        </div>

                    ) : !selectedPatient ? (
                        <div style={{ background: 'var(--surface-container-lowest)', padding: '5rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', outline: '2px dashed var(--outline-variant)' }}>
                            <Search size={48} style={{ color: 'var(--outline)', margin: '0 auto 1.5rem' }} />
                            <h2 style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>No Patient Selected</h2>
                            <p style={{ color: 'var(--outline)' }}>Search and select a patient, or register a new walk-in patient.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {/* Reusable Profile Header & Action Card */}
                            {!isEditingProfile ? (
                                <>
                                    <PatientProfileHeader patient={selectedPatient} />
                                    
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                                        <button className="btn-signin" onClick={() => setIsEditingProfile(true)} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem' }}>
                                            <Edit3 size={18} /> Edit Full Profile
                                        </button>
                                    </div>

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
                                </>
                            ) : (
                                /* Edit Mode Form */
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

