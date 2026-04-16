import React from 'react';
import { Home, LayoutDashboard, Radio, Flame, Bell, Globe, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Footer.css';

export const Footer: React.FC = () => {
  const { role } = useAuth();
  const location = useLocation();

  const isReceiver = role === 'receiver';

  return (
    <footer className="floating-footer-wrapper">
      <div className="floating-footer-dock">
        
        <div className="dock-logo">
          <Link to="/">
            <img src="/donor/logo.png" alt="Aahara Setu" />
          </Link>
        </div>

        <div className="dock-icons">
          <Link to="/" className={`dock-icon ${location.pathname === '/' ? 'active' : ''}`}>
            <Home size={22} />
          </Link>
          
          <Link to={isReceiver ? "/receiver" : "/dashboard"} className={`dock-icon ${['/receiver', '/dashboard'].includes(location.pathname) ? 'active' : ''}`}>
            <LayoutDashboard size={22} />
          </Link>

          <Link to={isReceiver ? "/receiver/explore" : "/explore"} className={`dock-icon ${location.pathname.includes('/explore') ? 'active' : ''}`}>
            <Globe size={22} />
          </Link>
          
          <Link to="/traceability" className={`dock-icon ${location.pathname === '/traceability' ? 'active' : ''}`}>
             <Radio size={22} />
          </Link>

          <Link to={isReceiver ? "/receiver/disasters" : "/disasters"} className={`dock-icon emergency-trigger ${['/disasters', '/receiver/disasters'].includes(location.pathname) ? 'active' : ''}`}>
            <Flame size={24} />
          </Link>
          
          <Link to={isReceiver ? "/receiver/notifications" : "/notifications"} className={`dock-icon ${['/notifications', '/receiver/notifications'].includes(location.pathname) ? 'active' : ''}`}>
            <Bell size={22} />
          </Link>

          <Link to="/profile" className={`dock-icon ${location.pathname === '/profile' ? 'active' : ''}`}>
            <User size={22} />
          </Link>
        </div>
      </div>
    </footer>
  );
};
