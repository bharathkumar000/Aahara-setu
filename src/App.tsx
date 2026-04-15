import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Landing } from './pages/Landing/Landing';
import { Explore } from './pages/Explore/Explore';
import { Upload } from './pages/Upload/Upload';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Notifications } from './pages/Notifications/Notifications';
import { Profile } from './pages/Profile/Profile';
import { Toast } from './components/ui/Toast/Toast';
import type { ToastMessage } from './components/ui/Toast/Toast';
import './styles/App.css';

function AppContent() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const location = useLocation();

  useEffect(() => {
    const t1 = setTimeout(() => {
      addToast('⚡ High Priority Alert', 'Paneer Tikka expiring in 45 mins — 0.4 km away!', 'warning');
    }, 3000);
    const t2 = setTimeout(() => {
      addToast('✅ Match Found', 'Assorted Pastries matched with Hope NGO nearby.', 'success');
    }, 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'warning') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showFooter = location.pathname === '/' || location.pathname === '/profile';

  return (
    <>
      <Navbar />
      <main style={{ padding: '120px 24px 0', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
      <Toast messages={toasts} onRemove={removeToast} />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
