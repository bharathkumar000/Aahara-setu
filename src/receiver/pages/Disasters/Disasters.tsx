import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../donor/components/ui/Button/Button';
import { Card } from '../../../donor/components/ui/Card/Card';
import { 
  AlertTriangle, MapPin, Users, Heart, 
  Zap, Plus, X, Globe, Send
} from 'lucide-react';
import './Disasters.css';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';


interface DisasterAlert {
  id: string;
  type: string;
  location: string;
  urgency: string;
  peopleInNeed: number;
  suppliesNeeded: string;
  impact: string;
  timeRemaining: string;
}

export const Disasters: React.FC = () => {
  const { role } = useAuth();

  const [activeDisasters, setActiveDisasters] = useState<DisasterAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    location: '',
    severity: 'high',
    needs: '',
    people_in_need: ''
  });

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('disaster_alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const MOCK_DISASTERS: DisasterAlert[] = [
        {
          id: 'mock-d-1',
          type: 'Flood Relief',
          location: 'Assam High-Waste Zone B',
          urgency: 'CRITICAL',
          peopleInNeed: 1200,
          suppliesNeeded: 'Ready-to-eat meals, Water, Biscuits',
          impact: 'Severely affected by monsoon',
          timeRemaining: 'Nil'
        }
      ];

      if (data && data.length > 0) {
        const formatted = data.map((d: any) => ({
          id: d.id,
          type: d.title,
          location: d.location_name,
          urgency: d.severity?.toUpperCase() || 'HIGH',
          peopleInNeed: d.people_in_need || 500,
          suppliesNeeded: Array.isArray(d.needs) ? d.needs.join(', ') : (d.needs || 'Various food items'),
          impact: d.impact_desc || 'Urgent support required',
          timeRemaining: 'Nil'
        }));
        setActiveDisasters(formatted);
      } else {
        const MOCK_NIL = MOCK_DISASTERS.map(d => ({ ...d, timeRemaining: 'Nil' }));
        setActiveDisasters(MOCK_NIL);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Subscribe to new alerts
    const subscription = supabase
      .channel('disaster_alerts_live')
      .on('postgres_changes', { event: '*', table: 'disaster_alerts', schema: 'public' }, () => {
        fetchAlerts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Format needs as an array
    const needsArray = broadcastData.needs
      ? broadcastData.needs.split(',').map((s: any) => s.trim()).filter((s: any) => s.length > 0)
      : [];

    const { error } = await supabase.from('disaster_alerts').insert({
      title: broadcastData.title,
      location_name: broadcastData.location,
      severity: broadcastData.severity.toLowerCase(),
      needs: needsArray,
      people_in_need: parseInt(broadcastData.people_in_need) || 0,
      impact_desc: `Urgent requirement for ${broadcastData.title} in ${broadcastData.location}`,
      location_point: 'SRID=4326;POINT(77.5946 12.9716)' // Standard PostGIS format for Supabase
    });

    if (!error) {
      showToast('Emergency Alert Broadcasted Globally!');
      setIsModalOpen(false);
      setBroadcastData({ title: '', location: '', severity: 'high', needs: '', people_in_need: '' });
      fetchAlerts(); // Refresh list immediately
    } else {
      console.error('Broadcast error details:', error);
      showToast(`Error: ${error.message || 'Failed to broadcast'}`);
    }
    setLoading(false);
  };
  
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="disasters-container">
      <header className="disasters-header">
        <div className="header-top-row">
          <div className="emergency-badge">
            <Siren size={16} /> EMERGENCY RESPONSE ACTIVE
          </div>
        </div>
        
        <h1 className="disasters-title">Disaster <span className="relief-text">Relief</span> Portal</h1>
        <p className="disasters-subtitle">
          Reporting from the ground? Broadcast high-priority food requirements 
          to institutional donors and relief networks instantly.
        </p>
      </header>

      <section className="active-alerts">
        <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="alert-section-title" style={{ margin: 0 }}>
            <AlertTriangle className="alert-icon-pulse" /> Active Critical Zones
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {role === 'receiver' && (
              <Button 
                className="broadcast-btn animate-pulse" 
                onClick={() => setIsModalOpen(true)}
                style={{ borderRadius: '100px', background: '#e11d48', color: 'white', gap: '8px', height: '40px', fontSize: '0.9rem', fontWeight: 700 }}
              >
                <Plus size={18} /> Broadcast Emergency
              </Button>
            )}
            <span className="live-badge" style={{ margin: 0 }}>LIVE UPDATES</span>
          </div>

        </div>
        
        <div className="alerts-grid">
          {activeDisasters.map(disaster => (
            <Card key={disaster.id} className="disaster-alert-card">
              <div className="disaster-card-header">
                <div>
                  <h3 className="disaster-type">{disaster.type}</h3>
                  <div className="disaster-loc">
                    <MapPin size={14} /> {disaster.location}
                  </div>
                </div>
                <div className={`urgency-pill ${disaster.urgency.toLowerCase()}`}>
                  {disaster.urgency}
                </div>
              </div>

              <div className="disaster-stats">
                <div className="dstat">
                  <Users size={18} />
                  <span><strong>{disaster.peopleInNeed}+</strong> in need</span>
                </div>
                <div className="dstat">
                  <Zap size={18} />
                  <span>Need: {disaster.suppliesNeeded}</span>
                </div>
              </div>

              <div className="disaster-footer">
                <Link to="/receiver/explore" style={{ textDecoration: 'none', width: '100%' }}>
                  <Button fullWidth variant="primary" className="emergency-btn">
                    View Relief Food <Heart size={16} fill="white" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* --- BROADCAST MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay glass animate-fade-in" onClick={() => setIsModalOpen(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px'
        }}>
          <div className="broadcast-modal-box" onClick={e => e.stopPropagation()} style={{
            background: '#FFFDF7', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '40px',
            width: '100%', maxWidth: '500px', boxShadow: '0 30px 60px rgba(0,0,0,0.12)'
          }}>
            <div className="modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
               <h2 style={{ color: '#e11d48', display: 'flex', alignItems: 'center', gap: '12px', margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>
                 <Globe size={28} /> Broadcast SOS
               </h2>
               <button onClick={() => setIsModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', color: '#666', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <div className="input-group">
                 <label style={{ fontSize: '0.75rem', color: '#4F633D', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Disaster Title</label>
                 <input 
                   required
                   placeholder="e.g. Flash Floods Relief"
                   value={broadcastData.title}
                   onChange={e => setBroadcastData({...broadcastData, title: e.target.value})}
                   style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '16px', color: '#2C3E50', marginTop: '8px', outline: 'none', transition: 'border-color 0.2s' }}
                 />
               </div>
               <div className="input-group">
                 <label style={{ fontSize: '0.75rem', color: '#4F633D', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
                 <input 
                   required
                   placeholder="Affected Zone / Neighborhood"
                   value={broadcastData.location}
                   onChange={e => setBroadcastData({...broadcastData, location: e.target.value})}
                   style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '16px', color: '#2C3E50', marginTop: '8px', outline: 'none' }}
                 />
               </div>
               <div className="input-group">
                 <label style={{ fontSize: '0.75rem', color: '#4F633D', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Severity</label>
                 <select 
                   value={broadcastData.severity}
                   onChange={e => setBroadcastData({...broadcastData, severity: e.target.value})}
                   style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '16px', color: '#2C3E50', marginTop: '8px', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                 >
                   <option value="critical">🔴 CRITICAL</option>
                   <option value="high">🟠 HIGH</option>
                   <option value="medium">🟡 MEDIUM</option>
                 </select>
               </div>
               <div className="input-group">
                 <label style={{ fontSize: '0.75rem', color: '#4F633D', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Needs (Comma separated)</label>
                 <input 
                   required
                   placeholder="e.g. Rice, Water, Biscuits"
                   value={broadcastData.needs}
                   onChange={e => setBroadcastData({...broadcastData, needs: e.target.value})}
                   style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '16px', color: '#2C3E50', marginTop: '8px', outline: 'none' }}
                 />
               </div>
               <div className="input-group">
                 <label style={{ fontSize: '0.75rem', color: '#4F633D', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>People Affected</label>
                 <input 
                   type="number"
                   required
                   placeholder="Approx. count"
                   value={broadcastData.people_in_need}
                   onChange={e => setBroadcastData({...broadcastData, people_in_need: e.target.value})}
                   style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '16px', color: '#2C3E50', marginTop: '8px', outline: 'none' }}
                 />
               </div>

               <Button type="submit" className="sumbit-sos-btn" fullWidth style={{ background: '#e11d48', height: '60px', borderRadius: '100px', fontSize: '1.2rem', fontWeight: 800, marginTop: '12px', boxShadow: '0 10px 20px rgba(225, 29, 72, 0.2)' }}>
                 {loading ? 'Broadcasting...' : 'Publish LIVE Alert'} <Send size={20} style={{ marginLeft: '12px' }} />
               </Button>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-primary)', color: 'white', padding: '16px 32px', borderRadius: '100px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 10000, fontWeight: 700
        }}>
          🚀 {toast}
        </div>
      )}
    </div>
  );
};

const Siren = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 11v8a5 5 0 0 0 10 0v-8" />
    <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    <path d="M12 2v2" />
    <path d="M21 12h2" />
    <path d="M1 12h2" />
    <path d="M20 7l-2 2" />
    <path d="M6 9L4 7" />
  </svg>
);
