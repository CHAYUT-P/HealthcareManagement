import React, { useState } from 'react';
import { SearchPage } from './SearchPage';
import { QueuePage } from './QueuePage';
import { AppointmentsPage } from './AppointmentsPage';
import { Search, Activity, Calendar } from 'lucide-react';

export const NurseDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'search' | 'queue' | 'appointments'>('search');

    return (
        <div style={{ paddingTop: '6rem', minHeight: '100vh', paddingBottom: '4rem', maxWidth: '1440px', margin: '0 auto', padding: '6rem 2rem 4rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Nurse Dashboard</h1>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>Manage patient records, active queues, and upcoming appointments.</p>
            </header>

            <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--outline-variant)', marginBottom: '2rem' }}>
                <button 
                    onClick={() => setActiveTab('search')}
                    style={{ 
                        padding: '1rem 2rem', 
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'search' ? '4px solid var(--primary)' : '4px solid transparent',
                        color: activeTab === 'search' ? 'var(--primary)' : 'var(--on-surface-variant)',
                        fontWeight: activeTab === 'search' ? 600 : 500,
                        fontSize: '1.05rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Search size={20} /> Patient Search
                </button>
                <button 
                    onClick={() => setActiveTab('queue')}
                    style={{ 
                        padding: '1rem 2rem', 
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'queue' ? '4px solid var(--primary)' : '4px solid transparent',
                        color: activeTab === 'queue' ? 'var(--primary)' : 'var(--on-surface-variant)',
                        fontWeight: activeTab === 'queue' ? 600 : 500,
                        fontSize: '1.05rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Activity size={20} /> Active Queue
                </button>
                <button 
                    onClick={() => setActiveTab('appointments')}
                    style={{ 
                        padding: '1rem 2rem', 
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'appointments' ? '4px solid var(--primary)' : '4px solid transparent',
                        color: activeTab === 'appointments' ? 'var(--primary)' : 'var(--on-surface-variant)',
                        fontWeight: activeTab === 'appointments' ? 600 : 500,
                        fontSize: '1.05rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Calendar size={20} /> Appointments
                </button>
            </div>

            <main style={{ minHeight: '600px' }}>
                {activeTab === 'search' && <SearchPage />}
                {activeTab === 'queue' && <QueuePage />}
                {activeTab === 'appointments' && <AppointmentsPage />}
            </main>
        </div>
    );
};
