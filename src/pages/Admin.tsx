import React from 'react';
import { Card } from '../donor/components/ui/Card/Card';
import { ShieldCheck } from 'lucide-react';

export const Admin: React.FC = () => {
  return (
    <div style={{ padding: '40px 0' }}>
      <Card style={{ textAlign: 'center', padding: '100px 40px', borderRadius: '40px' }}>
        <ShieldCheck size={64} color="#4f633d" style={{ marginBottom: '24px', opacity: 0.2 }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Admin Panel</h1>
        <p style={{ color: '#666', fontSize: '1.2rem' }}>Centralized Management System under construction.</p>
      </Card>
    </div>
  );
};
