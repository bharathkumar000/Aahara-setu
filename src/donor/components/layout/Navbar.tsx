import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, LayoutDashboard, Star, Bell, Flame, Radio } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navLinks = [
    { name: t('nav_home'), path: '/', icon: <Home size={18} /> },
    { name: t('nav_dashboard'), path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: t('nav_traceability'), path: '/traceability', icon: <Radio size={18} /> },
    { name: t('nav_donate'), path: '/upload', icon: <Upload size={18} /> },
    { name: t('nav_disasters'), path: '/disasters', icon: <Flame size={18} /> },
    { name: t('nav_alerts'), path: '/notifications', icon: <Bell size={18} /> },
    { name: t('nav_profile'), path: '/profile', icon: <Star size={18} /> },
  ];

  const receiverLinks = [
    { name: 'Dashboard', path: '/receiver', icon: <LayoutDashboard size={18} /> },
    { name: 'Notifications', path: '/receiver/notifications', icon: <Bell size={18} /> },
    { name: 'Explore Food', path: '/disasters', icon: <Globe size={18} /> },
    { name: 'Profile', path: '/profile', icon: <Star size={18} /> },
  ];

  const isReceiver = location.pathname.startsWith('/receiver');
  const links = isReceiver ? receiverLinks : navLinks;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/donor/logo.png" alt="Aahara Setu" className="navbar-logo-img" />
          <span className="logo-text">Aahara Setu</span>
        </Link>
        
        <div className="role-switcher-wrap">
           <Link to={isReceiver ? "/" : "/receiver"} className="role-switch-btn glass">
              {isReceiver ? "NGO Mode" : "Donor Mode"}
              <div className="role-dot" />
           </Link>
        </div>

        <div className="navbar-links">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path && link.path !== '/upload' ? 'active' : ''} ${link.path === '/upload' ? 'donate-pill' : ''}`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
