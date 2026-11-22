import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AdminPage from './Admin.jsx';
import './index.css';

const recordedSections = new Set();

function PortfolioRoot() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const isAdmin = pathname === '/login';

  React.useEffect(() => {
    if (isAdmin) return undefined;

    const sections = ['home', 'about', 'work', 'path', 'notes', 'contact'].map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || recordedSections.has(entry.target.id)) continue;
        recordedSections.add(entry.target.id);
        const path = `/#${entry.target.id}`;
        if (!['/#home', '/#about', '/#work', '/#path', '/#notes', '/#contact'].includes(path)) continue;
      fetch('/api/analytics', {
        method: 'POST',
        credentials: 'same-origin',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      }).catch(() => {});
      }
    }, { rootMargin: '-22% 0px -58% 0px', threshold: [0, 0.12, 0.25, 0.5] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isAdmin]);

  return isAdmin ? <AdminPage /> : <App />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PortfolioRoot />
  </React.StrictMode>,
);
