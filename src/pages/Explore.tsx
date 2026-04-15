import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, MapPin, Clock, AlertCircle, Zap, ShieldCheck, Users, Utensils, Info, Sparkles, PlusCircle } from 'lucide-react';
import { LeafletMap } from '../components/ui/LeafletMap';
import './Explore.css';

interface FoodItem {
  id: string;
  name: string;
  type: string;
  quantity: string;
  distance: string;
  expiry: string;
  donor: string;
  urgencyScore: number;
  urgencyLevel: 'high' | 'medium' | 'low';
  urgencyLabel: string;
  verified: boolean;
  demand: string;
}

const MOCK_FOOD_ITEMS: FoodItem[] = [
  { id: '1', name: 'Fresh Plain Rice', type: 'Main Course', quantity: '50 portions', distance: '0.8 km', expiry: '45 mins', donor: 'Biryani Zone', urgencyScore: 95, urgencyLevel: 'high', urgencyLabel: '⚡ High - 45 min', verified: true, demand: 'Very High' },
  { id: '2', name: 'Hot Sambar', type: 'Side Dish', quantity: '20 portions', distance: '1.2 km', expiry: '1 hour', donor: 'Sagar Hotel', urgencyScore: 85, urgencyLevel: 'high', urgencyLabel: '⚡ High - 1 hr', verified: true, demand: 'High' },
  { id: '3', name: 'Tandoori Roti', type: 'Bread', quantity: '30 pieces', distance: '2.5 km', expiry: '30 mins', donor: 'Pind Balluchi', urgencyScore: 98, urgencyLevel: 'high', urgencyLabel: '⚡ High - 30 min', verified: true, demand: 'Medium' },
  { id: '4', name: 'Paneer Butter Masala', type: 'Main Course', quantity: '10 portions', distance: '3.1 km', expiry: '2 hours', donor: 'Royal Spice', urgencyScore: 60, urgencyLevel: 'medium', urgencyLabel: '⏰ Med - 2 hr', verified: true, demand: 'High' },
  { id: '5', name: 'Assorted Fruits', type: 'Raw Produce', quantity: '5 kg', distance: '1.5 km', expiry: '1 day', donor: 'Fruit Mart', urgencyScore: 20, urgencyLevel: 'low', urgencyLabel: '✅ Low - 1 Day', verified: false, demand: 'Low' },
  { id: '6', name: 'Chapati (Wheat)', type: 'Bread', quantity: '40 pieces', distance: '0.5 km', expiry: '4 hours', donor: 'Home Kitchen', urgencyScore: 40, urgencyLevel: 'medium', urgencyLabel: '⏰ Med - 4 hr', verified: true, demand: 'Moderate' },
];

const MEAL_PAIRS: Record<string, string[]> = {
  'rice': ['sambar', 'rasam', 'curd', 'dal', 'curry'],
  'roti': ['paneer', 'curry', 'gravy', 'dal', 'butter masala'],
  'chapati': ['paneer', 'curry', 'gravy', 'dal'],
  'sambar': ['rice', 'idli', 'dosa'],
  'gravy': ['roti', 'chapati', 'naan', 'rice'],
};

export const Explore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [items, setItems] = useState<FoodItem[]>(MOCK_FOOD_ITEMS);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [claimQuantity, setClaimQuantity] = useState<string>('');
  const [pairingAlert, setPairingAlert] = useState<string | null>(null);

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filter === 'all' || item.urgencyLevel === filter;
    return matchSearch && matchFilter && !claimedIds.includes(item.id);
  });

  const getPairings = (itemName: string) => {
    const lowerName = itemName.toLowerCase();
    const pairingKey = Object.keys(MEAL_PAIRS).find(key => lowerName.includes(key));
    if (!pairingKey) return [];
    
    return items.filter(item => 
      MEAL_PAIRS[pairingKey].some(p => item.name.toLowerCase().includes(p)) && 
      item.id !== selectedFoodId &&
      !claimedIds.includes(item.id)
    );
  };

  const handleConfirmClaim = () => {
    if (selectedFoodId) {
      setClaimedIds(prev => [...prev, selectedFoodId]);
      setSelectedFoodId(null);
      alert(`Claim confirmed! Pairing AI is now looking for complementary items...`);
    }
  };

  const selectedFood = items.find(i => i.id === selectedFoodId);
  const matchedPairings = selectedFood ? getPairings(selectedFood.name) : [];

  return (
    <div className="explore-container">
      {/* Smart Pairing Notification Banner */}
      {pairingAlert && (
          <div className="pairing-notification-banner animate-slide-down">
              <Sparkles size={20} className="text-warning" />
              <div className="flex-1">
                  <strong>Meal Completion Alert:</strong> {pairingAlert} is now available nearby! Combine it with your Rice for a complete meal.
              </div>
              <Button size="sm" variant="glass" onClick={() => setPairingAlert(null)}>View Match</Button>
          </div>
      )}

      {selectedFood && (
        <div className="modal-overlay" onClick={() => setSelectedFoodId(null)}>
          <Card className="modal-content-wide glass" onClick={e => e.stopPropagation()}>
            <div className="modal-header-main">
               <h2 className="modal-title">Claim {selectedFood.name}</h2>
               <button className="modal-close-btn" onClick={() => setSelectedFoodId(null)}>&times;</button>
            </div>
            
            <div className="modal-body-grid">
               <div className="modal-left">
                  <div className="food-details-grid">
                    <div className="detail-box">
                       <label>Donor</label>
                       <p>{selectedFood.donor}</p>
                    </div>
                    <div className="detail-box">
                       <label>Quantity</label>
                       <p>{selectedFood.quantity}</p>
                    </div>
                    <div className="detail-box">
                       <label>Distance</label>
                       <p>{selectedFood.distance}</p>
                    </div>
                    <div className="detail-box">
                       <label>Expiry</label>
                       <p className="text-danger">{selectedFood.expiry}</p>
                    </div>
                  </div>

                  <div className="map-placeholder-mini">
                     <LeafletMap location={selectedFood.donor} />
                  </div>

                  <div className="portion-selector">
                    <label>How many portions do you need?</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="50" 
                      value={claimQuantity || 1} 
                      onChange={(e) => setClaimQuantity(e.target.value)}
                    />
                    <div className="range-labels">
                       <span>1</span>
                       <span className="current-val">{claimQuantity || 1} portions</span>
                       <span>Max</span>
                    </div>
                  </div>
               </div>

               <div className="modal-right ai-pairing-sidebar">
                  <div className="ai-header">
                     <Sparkles size={18} className="text-primary" />
                     <h3>Meal Completeness AI</h3>
                  </div>
                  
                  {matchedPairings.length > 0 ? (
                    <div className="pairing-suggestions">
                       <p className="ai-hint">We found items nearby that complete this meal! Bundle them together:</p>
                       {matchedPairings.map(pair => (
                         <div key={pair.id} className="pair-card-mini">
                            <div className="pair-info">
                               <span className="pair-name">{pair.name}</span>
                               <span className="pair-donor">from {pair.donor}</span>
                            </div>
                            <Button size="sm" variant="outline" className="add-pair-btn" onClick={() => {
                                alert(`Added ${pair.name} to your claim bundle!`);
                                setClaimedIds(prev => [...prev, pair.id]);
                            }}>
                               <PlusCircle size={14} /> Add
                            </Button>
                         </div>
                       ))}
                       <div className="ai-footer">
                          <Info size={14} /> Claiming these together reduces transport waste.
                       </div>
                    </div>
                  ) : (
                    <div className="ai-empty-pairing">
                       <Utensils size={32} />
                       <p>Looking for Sambar, Dal, or Curry to complete this meal...</p>
                       <span className="ai-status">AI will alert you if a pairing matches later!</span>
                    </div>
                  )}
               </div>
            </div>

            <div className="modal-actions-main">
               <Button variant="outline" onClick={() => setSelectedFoodId(null)}>Cancel</Button>
               <Button onClick={handleConfirmClaim}>Confirm Claim</Button>
            </div>
          </Card>
        </div>
      )}

      <div className="explore-header">
        <h1 className="page-title">Find Food <span className="gradient-text">Nearby</span></h1>
        <p className="page-subtitle">Real-time surplus food available, sorted by urgency. Claim before it expires!</p>
      </div>

      <div className="search-filter-bar glass">
        <div className="search-input-wrap">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search food name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-inner-input"
          />
        </div>
        <div className="filter-chips">
          {(['all', 'high', 'medium', 'low'] as const).map(f => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? 'active' : ''} chip-${f}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '🌐 All' : f === 'high' ? '⚡ High' : f === 'medium' ? '⏰ Medium' : '✅ Low'}
            </button>
          ))}
        </div>
      </div>

      <div className="food-grid">
        {filteredItems.map((item) => (
          <Card key={item.id} className={`food-card urgency-border-${item.urgencyLevel}`}>
             <div className="food-card-top">
                <span className="food-type-badge">{item.type}</span>
                <span className={`urgency-badge ${item.urgencyLevel}`}>{item.urgencyLabel}</span>
              </div>
              <h3 className="food-name">{item.name}</h3>
              <p className="donor-name">from {item.donor}</p>
              
              <div className="food-meta-simple">
                 <span><MapPin size={14} /> {item.distance}</span>
                 <span><Clock size={14} /> {item.expiry}</span>
              </div>
              
              <div className="urgency-bar-wrap">
                <div className="urgency-bar"><div className={`urgency-bar-fill ${item.urgencyLevel}`} style={{ width: `${item.urgencyScore}%` }} /></div>
              </div>

              <Button fullWidth onClick={() => setSelectedFoodId(item.id)}>Claim Now</Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
