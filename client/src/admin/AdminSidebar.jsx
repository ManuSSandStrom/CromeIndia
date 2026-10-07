import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const sections = [
  { to: '/admin', label: 'Lead inbox', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/sports', label: 'Sports' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/media', label: 'Media library' },
  { to: '/admin/gallery', label: 'Gallery' },
  { to: '/admin/faqs', label: 'FAQs' },
  { to: '/admin/settings', label: 'Site settings' },
];

export default function AdminSidebar({ onSignOut }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = event => { if (event.key === 'Escape') setOpen(false); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return <aside className={`admin-sidebar${open ? ' is-open' : ''}`}>
    <div className="admin-sidebar-head">
      <Link to="/" className="brand" aria-label="Crome India home">
        <span className="brand-space" aria-hidden="true"/><span className="brand-caption">ADMINISTRATION</span>
      </Link>
      <button type="button" className="admin-menu-toggle" aria-controls="admin-navigation" aria-expanded={open} onClick={() => setOpen(value => !value)}>
        {open ? <X size={18}/> : <Menu size={18}/>}<span>{open ? 'Close menu' : 'Menu'}</span>
      </button>
    </div>
    {open && <button type="button" className="admin-nav-backdrop" aria-label="Close admin menu" onClick={() => setOpen(false)}/>}
    <nav id="admin-navigation" className="admin-nav" aria-label="Admin navigation">
      <div className="admin-drawer-head"><b>WORKSPACE</b><button type="button" aria-label="Close menu" onClick={() => setOpen(false)}><X size={19}/></button></div>
      {sections.map(({to,label,end}) => <NavLink key={to} to={to} end={end}>{label}</NavLink>)}
      <button type="button" className="admin-mobile-signout" onClick={onSignOut}>Sign out</button>
    </nav>
    <button type="button" className="button button-secondary admin-desktop-signout" onClick={onSignOut}>Sign out</button>
  </aside>;
}
