import React from 'react';
import { User, AlertTriangle } from 'lucide-react';

interface PatientProfileHeaderProps {
    patient: any;
    compact?: boolean;
}

export const PatientProfileHeader: React.FC<PatientProfileHeaderProps> = ({ patient, compact = false }) => {
    if (!patient) return null;

    return (
        <section style={{
            background: 'var(--surface-container-lowest)',
            padding: compact ? '1.5rem' : '2rem',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            borderTop: '4px solid var(--primary)',
            marginBottom: '2rem'
        }}>
            <h2 style={{
                marginBottom: compact ? '1rem' : '1.5rem',
                color: 'var(--primary)',
                borderBottom: '1px solid var(--outline-variant)',
                paddingBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <User size={24} /> General Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                <div>
                    <strong style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase' }}>Full Name</strong>
                    <span style={{ fontSize: '1.2rem', display: 'block', fontWeight: 600 }}>{patient.name}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <strong style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase' }}>Age</strong>
                        <span style={{ fontSize: '1.1rem' }}>{patient.age} yrs</span>
                    </div>
                    <div>
                        <strong style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase' }}>Gender</strong>
                        <span style={{ fontSize: '1.1rem' }}>{patient.gender}</span>
                    </div>
                </div>

                <div>
                    <strong style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase' }}>HN Number</strong>
                    <span style={{ fontSize: '1.1rem', fontFamily: 'monospace' }}>{patient.hn_number || '-'}</span>
                </div>
                <div>
                    <strong style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase' }}>National ID</strong>
                    <span style={{ fontSize: '1.1rem', fontFamily: 'monospace' }}>{patient.national_id || '-'}</span>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--outline-variant)' }}>
                    <div>
                        <strong style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase' }}>Blood Type</strong>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#dc2626' }}>{patient.blood_type || '-'}</span>
                    </div>

                    {patient.chronic_diseases && (
                        <div>
                            <strong style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase' }}>Chronic Diseases</strong>
                            <span style={{ fontSize: '1.1rem' }}>{patient.chronic_diseases}</span>
                        </div>
                    )}
                </div>

                {patient.known_allergies && (
                    <div style={{ gridColumn: '1 / -1', background: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #fecaca', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <AlertTriangle color="#dc2626" size={24} style={{ flexShrink: 0 }} />
                        <div>
                            <strong style={{ color: '#dc2626', display: 'block', marginBottom: '0.25rem' }}>Known Allergies (Red Alert)</strong>
                            <span style={{ color: '#dc2626', fontWeight: 600 }}>{patient.known_allergies}</span>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
