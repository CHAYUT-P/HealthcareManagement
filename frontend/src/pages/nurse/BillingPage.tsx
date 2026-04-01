import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, CheckCircle, Clock } from 'lucide-react';

export const BillingPage: React.FC = () => {
    const { token } = useAuth();
    const [queue, setQueue] = useState<any[]>([]);
    const [selectedVisit, setSelectedVisit] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Map of item_id resolving to its unit_price currently typed by Nurse
    const [prices, setPrices] = useState<Record<number, string>>({});
    
    // Additional generic treatment fee for consultation
    const [treatmentFee, setTreatmentFee] = useState<string>('0');

    const fetchQueue = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/nurse/billing/queue', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setQueue(data);
            }
        } catch (e) {
            console.error("Failed to fetch billing queue:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    // Calculate totals dynamically
    const medSubtotal = selectedVisit?.items?.reduce((sum: number, item: any) => {
        const p = parseFloat(prices[item.item_id]) || 0;
        return sum + (p * item.quantity);
    }, 0) || 0;
    
    const grandTotal = medSubtotal + (parseFloat(treatmentFee) || 0);

    const finalizeBilling = async () => {
        if (!selectedVisit) return;
        
        // Final format expected by backend: [{"item_id": int, "unit_price": float}], treatment_fee
        const payload = {
            treatment_fee: parseFloat(treatmentFee) || 0,
            items: Object.keys(prices).map(id => ({
                item_id: parseInt(id),
                unit_price: parseFloat(prices[parseInt(id)]) || 0
            }))
        };

        try {
            const res = await fetch(`http://localhost:8000/nurse/billing/${selectedVisit.visit_id}/finalize`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert("Payment Finalized & Patient Discharged!");
                setSelectedVisit(null);
                setPrices({});
                setTreatmentFee('0');
                fetchQueue();
            }
        } catch (e) {
            console.error("Failed to finalize billing:", e);
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading billing queue...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--on-surface)' }}>Pharmacy & Billing Queue</h2>
                <button onClick={fetchQueue} className="btn-signin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                    <Clock size={16} /> Refresh Queue
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2.5fr)', gap: '2rem' }}>
                
                {/* Left side: Queue of PENDING_PAYMENT patients */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {queue.length === 0 ? (
                        <div style={{ padding: '3rem 2rem', background: 'var(--surface-variant)', borderRadius: 'var(--radius-xl)', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                            <CheckCircle size={48} style={{ color: 'var(--primary)', opacity: 0.5, margin: '0 auto 1rem' }} />
                            <p>No pending payments.</p>
                            <span style={{ fontSize: '0.9rem' }}>All patients have been cleared.</span>
                        </div>
                    ) : (
                        queue.map((v) => (
                            <div 
                                key={v.visit_id} 
                                onClick={() => {
                                    setSelectedVisit(v);
                                    // Reset prices when switching
                                    setPrices({});
                                    setTreatmentFee('0');
                                }}
                                style={{ 
                                    padding: '1.5rem', 
                                    background: selectedVisit?.visit_id === v.visit_id ? 'var(--primary-container)' : 'var(--surface-container-lowest)', 
                                    borderRadius: 'var(--radius-lg)', 
                                    cursor: 'pointer',
                                    border: selectedVisit?.visit_id === v.visit_id ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                }}
                            >
                                <strong style={{ fontSize: '1.1rem', color: selectedVisit?.visit_id === v.visit_id ? 'var(--on-primary-container)' : 'var(--on-surface)' }}>{v.patient_name}</strong>
                                <span style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>Visit ID: #{v.visit_id}</span>
                                <span style={{ fontSize: '0.85rem', color: '#b45309', background: '#fef3c7', padding: '0.25rem 0.5rem', borderRadius: '4px', alignSelf: 'flex-start', fontWeight: 600 }}>Awaiting Payment</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Right side: Detailed Billing Form */}
                {selectedVisit ? (
                    <div style={{ background: 'var(--surface-container-lowest)', padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--outline-variant)' }}>
                        <div style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', color: 'var(--on-surface)', marginBottom: '0.25rem' }}>{selectedVisit.patient_name}</h2>
                                <p style={{ color: 'var(--on-surface-variant)' }}>Billing Invoice for Visit #{selectedVisit.visit_id}</p>
                            </div>
                            <FileText size={36} style={{ color: 'var(--primary)' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px' }}>Prescription Items</h3>
                            
                            {(!selectedVisit.items || selectedVisit.items.length === 0) ? (
                                <p style={{ color: 'var(--outline)', fontStyle: 'italic' }}>No medications prescribed for this visit.</p>
                            ) : (
                                selectedVisit.items.map((item: any) => (
                                    <div key={item.item_id} style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '2rem', alignItems: 'center', background: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
                                        <div>
                                            <strong style={{ fontSize: '1.15rem', display: 'block', marginBottom: '0.25rem', color: 'var(--on-surface)' }}>{item.medicine_name}</strong>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', display: 'block' }}>Qty: {item.quantity} | Sig: {item.instructions}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <strong style={{ fontSize: '1.1rem', color: 'var(--on-surface-variant)' }}>$</strong>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                step="0.01" 
                                                placeholder="Unit Price"
                                                value={prices[item.item_id] || ''}
                                                onChange={(e) => setPrices({...prices, [item.item_id]: e.target.value})}
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '1.1rem', textAlign: 'right' }} 
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '0.5rem' }}>Consultation & Treatment Fee</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '2rem', alignItems: 'center', background: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
                                <div>
                                    <strong style={{ fontSize: '1.15rem', display: 'block', marginBottom: '0.25rem', color: 'var(--on-surface)' }}>Doctor Consultation / Services</strong>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', display: 'block' }}>Base treatment fee applied to the visit</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <strong style={{ fontSize: '1.1rem', color: 'var(--on-surface-variant)' }}>$</strong>
                                    <input 
                                        type="number" 
                                        min="0" 
                                        step="0.01" 
                                        placeholder="0.00"
                                        value={treatmentFee}
                                        onChange={(e) => setTreatmentFee(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', fontSize: '1.1rem', textAlign: 'right', background: 'var(--primary-container)' }} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--primary-container)', padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--on-primary-container)', opacity: 0.8, fontSize: '0.95rem' }}>
                                <span>Medication Subtotal:</span>
                                <span>${medSubtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--on-primary-container)', opacity: 0.8, fontSize: '0.95rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '1rem' }}>
                                <span>Treatment Fee:</span>
                                <span>${(parseFloat(treatmentFee) || 0).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--on-primary-container)' }}>Grand Total Due:</span>
                                <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--on-primary-container)' }}>${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={finalizeBilling}
                            className="btn-primary" 
                            style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', borderRadius: 'var(--radius-full)', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                            Finalize Payment & Disburse Meds
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem', background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--outline-variant)', color: 'var(--outline)' }}>
                        <h3>Select a patient from the queue to process billing.</h3>
                    </div>
                )}
            </div>
        </div>
    );
};
