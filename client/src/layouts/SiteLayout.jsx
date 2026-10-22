import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, LockKeyhole, Menu, X, Phone, Instagram, Search } from 'lucide-react';
import { sports, productCategories, products as fallbackProducts, settings } from '../data/content.js';
import { siteImages } from '../data/images.js';
import { useSiteSettings } from '../context/SiteContext.jsx';
import { trackEvent } from '../lib/analytics.js';
import { useApiList } from '../hooks/useApiList.js';

function Wordmark(){return <Link className="wordmark" to="/" aria-label="Crome India home"><img className="wordmark-logo" src={siteImages['crome-india-logo'].url} alt={siteImages['crome-india-logo'].alt} width="36" height="36" loading="eager"/><span><b>CROME INDIA</b><small>SPORTS SURFACES</small></span></Link>}
const primarySports=sports;
function WhatsAppIcon({size=19}){return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.3 11.5a8.3 8.3 0 0 1-12.4 7.2L3.5 20l1.3-4.2A8.3 8.3 0 1 1 20.3 11.5Z"/><path d="M8.3 8.2c.2-.4.5-.5.8-.5h.5l1 2.4-.8.9c.7 1.5 1.7 2.4 3.2 3.1l.9-.8 2.4 1v.5c0 .4-.2.7-.5.9-.5.4-1 .6-1.7.5-3.4-.5-6.2-3.3-6.7-6.7-.1-.6.1-1.2.5-1.7Z"/></svg>}

export function SiteHeader(){
  const [open,setOpen]=useState(false),[mega,setMega]=useState(''),[searchOpen,setSearchOpen]=useState(false),[searchQuery,setSearchQuery]=useState('');
  const location=useLocation();
  const navigate=useNavigate();
  const searchInput=useRef(null);
  const{items:categories}=useApiList('/categories',productCategories);
  const{items:catalogue}=useApiList('/products',fallbackProducts);
  const catalogueCategories=categories.filter(category=>catalogue.some(product=>product.category===category.name));
  const categorySportSlugs={'Football Turf':'football','Cricket Turf':'cricket','Hockey Turf':'hockey','Multisport Turf':'multisport','Tennis Surfaces':'tennis','Badminton Surfaces':'badminton','Squash Surfaces':'squash','Running / Athletic Surfaces':'running-athletics','Gym Flooring':'gym'};
  const categoryHref=category=>categorySportSlugs[category.name]?`/sports/${categorySportSlugs[category.name]}`:`/products?category=${encodeURIComponent(category.name)}`;
  const solutions=[['Overview','/services'],['Sports surface consultation','/services/sports-surface-consultation'],['Product & specification guidance','/services/product-specification-guidance'],['Project requirement support','/services/project-requirement-support'],['B2B product supply','/services/b2b-product-supply']];
  const trust=[['Product information','/products'],['Project gallery','/gallery']];
  const [mobileGroup,setMobileGroup]=useState('');
  useEffect(()=>{setOpen(false);setMega('');setSearchOpen(false);setSearchQuery('');window.scrollTo({top:0,behavior:'instant'});},[location.pathname]);
  useEffect(()=>{
    if(!open&&!mega&&!searchOpen)return;
    const old=document.body.style.overflow;
    if(open||mega==='products'||searchOpen)document.body.style.overflow='hidden';
    const key=e=>{if(e.key==='Escape'){setOpen(false);setMega('');setSearchOpen(false)}};
    window.addEventListener('keydown',key);
    return()=>{document.body.style.overflow=old;window.removeEventListener('keydown',key)};
  },[open,mega,searchOpen]);
  useEffect(()=>{if(searchOpen)requestAnimationFrame(()=>searchInput.current?.focus())},[searchOpen]);
  const toggleMega=name=>{setSearchOpen(false);setMega(current=>current===name?'':name)};
  const menuLink=(label,to,extra={})=><Link key={`${label}-${to}`} to={to} onClick={()=>setMega('')} {...extra}>{label}<ArrowUpRight size={14}/></Link>;
  const searchableItems=[
    ...catalogueCategories.map(category=>({title:category.name,type:'Product category',to:categoryHref(category),detail:`${catalogue.filter(product=>product.category===category.name).length} products listed`})),
    ...catalogue.filter(product=>product.published!==false).map(product=>({title:product.name,type:'Product',to:`/products/${product.slug}`,detail:[product.sport,product.category].filter(Boolean).join(' · ')})),
    ...primarySports.map(sport=>({title:`${sport.name} surfaces`,type:'Sports surface',to:`/sports/${sport.slug}`,detail:sport.active===false?'Ask about this application':'Explore this surface'})),
    ...solutions.map(([title,to])=>({title,type:'Solutions',to,detail:'Crome India project support'})),
    ...trust.map(([title,to])=>({title,type:'Company',to,detail:'Crome India information'})),
  ];
  const normalizedQuery=searchQuery.trim().toLowerCase();
  const searchResults=normalizedQuery?searchableItems.filter(item=>`${item.title} ${item.type} ${item.detail}`.toLowerCase().includes(normalizedQuery)).filter((item,index,array)=>array.findIndex(other=>other.title===item.title&&other.to===item.to)===index).slice(0,12):[];
  const submitSearch=event=>{event.preventDefault();if(searchResults[0]){navigate(searchResults[0].to);setSearchOpen(false);setSearchQuery('')}};
  return <>
    <header className="site-header"><div className="header-inner"><Wordmark/><nav className="desktop-nav" aria-label="Main navigation">
      <NavLink to="/">Home</NavLink><NavLink to="/about">About</NavLink>
      <div className="nav-menu nav-products"><button type="button" aria-expanded={mega==='products'} aria-haspopup="dialog" aria-controls="products-menu" onClick={()=>toggleMega('products')}>Products <ChevronDown size={14}/></button></div>
      <div className="nav-menu nav-solutions"><button type="button" aria-expanded={mega==='solutions'} aria-haspopup="true" onClick={()=>toggleMega('solutions')}>Solutions <ChevronDown size={14}/></button>{mega==='solutions'&&<div className="nav-dropdown-panel">{solutions.map(([label,to])=>menuLink(label,to))}</div>}</div>
      <div className="nav-menu nav-trust"><button type="button" aria-expanded={mega==='trust'} aria-haspopup="true" onClick={()=>toggleMega('trust')}>Resources <ChevronDown size={14}/></button>{mega==='trust'&&<div className="nav-dropdown-panel">{trust.map(([label,to])=>menuLink(label,to))}</div>}</div>
    </nav><Link to="/contact" className="button button-primary header-quote">Contact <ArrowUpRight size={16}/></Link><button type="button" className="site-search-trigger" aria-label="Search Crome India" aria-expanded={searchOpen} onClick={()=>{setOpen(false);setMega('');setSearchOpen(value=>!value)}}><Search size={20}/></button><button className="mobile-menu-button" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div></header>
    {searchOpen&&<><button className="site-search-backdrop" aria-label="Close search" onClick={()=>setSearchOpen(false)}/><section className="site-search-panel" role="dialog" aria-modal="true" aria-label="Search Crome India"><form className="site-search-form" onSubmit={submitSearch}><Search size={21}/><input ref={searchInput} type="search" value={searchQuery} onChange={event=>setSearchQuery(event.target.value)} placeholder="Search products, sports and services" aria-label="Search products, sports and services"/><button type="button" className="site-search-clear" onClick={()=>setSearchQuery('')} disabled={!searchQuery} aria-label="Clear search">×</button><button type="button" className="site-search-close" onClick={()=>setSearchOpen(false)} aria-label="Close search"><X size={21}/></button></form><div className="site-search-results" aria-live="polite">{normalizedQuery?searchResults.length?searchResults.map((result,index)=><Link to={result.to} key={`${result.type}-${result.to}-${index}`} onClick={()=>{setSearchOpen(false);setSearchQuery('')}}><b>{result.title}</b><span>{result.type}</span></Link>):<div className="site-search-empty"><b>No matching Crome India content found.</b><p>Try a sport, surface or product name, or contact our team for help.</p><Link to="/contact" onClick={()=>setSearchOpen(false)}>Contact Crome India <ArrowUpRight size={15}/></Link></div>:<div className="site-search-hint"><span>SEARCH THE CROME INDIA CATALOGUE</span><p>Find products, sports surfaces, project support and company information.</p><div>{catalogueCategories.slice(0,5).map(category=><Link to={categoryHref(category)} key={category.slug} onClick={()=>setSearchOpen(false)}>{category.name}<ArrowUpRight size={13}/></Link>)}</div></div>}</div></section></>}
    {mega==='products'&&<><button className="product-drawer-backdrop" aria-label="Close products menu" onClick={()=>setMega('')}/><aside className="product-drawer" id="products-menu" role="dialog" aria-modal="true" aria-label="Products menu"><div className="product-drawer-heading"><div><span>PRODUCT CATALOGUE</span><h2>Surfaces & products</h2><p>Browse the product categories currently represented in the Crome India catalogue.</p></div><button onClick={()=>setMega('')} aria-label="Close products menu"><X size={20}/></button></div><div className="product-drawer-list">{catalogueCategories.map((category,index)=>{const count=catalogue.filter(product=>product.category===category.name).length;return <Link to={categoryHref(category)} onClick={()=>setMega('')} key={category.slug}><span className="drawer-category-index">/{String(index+1).padStart(2,'0')}</span><span className="drawer-category-icon"><i/></span><span className="drawer-category-copy"><b>{category.name}</b><small>{count} {count===1?'product':'products'} listed · view recorded details</small></span><ArrowUpRight size={17}/></Link>})}<Link className="drawer-all-products" to="/products" onClick={()=>setMega('')}>View all products <ArrowUpRight size={16}/></Link></div><div className="product-drawer-foot">Specifications and availability should be confirmed with Crome India for your project.</div></aside></>}
    {open&&createPortal(
      <div className="mobile-navigation">
        <div className="mobile-nav-top"><Wordmark/><button aria-label="Close navigation" onClick={()=>setOpen(false)}><X/></button></div>
        <nav aria-label="Mobile navigation">
          <NavLink to="/" onClick={()=>setOpen(false)}>Home</NavLink>
          <NavLink to="/about" onClick={()=>setOpen(false)}>About Crome India</NavLink>
          {[["Products",catalogueCategories.map(category=>[category.name,categoryHref(category)]).concat([['All products','/products']])],["Solutions",solutions],["Resources",trust]].map(([group,items])=><section className="mobile-nav-group" key={group}>
            <button type="button" aria-expanded={mobileGroup===group} onClick={()=>setMobileGroup(current=>current===group?'':group)}>{group}<ChevronDown size={17}/></button>
            {mobileGroup===group&&<div className="mobile-nav-group-links">{items.map(([label,to])=>menuLink(label,to,{onClick:()=>setOpen(false)}))}</div>}
          </section>)}
          <NavLink to="/contact" onClick={()=>setOpen(false)}>Contact</NavLink>
        </nav>
        <Link className="button button-primary mobile-nav-quote" to="/request-quote" onClick={()=>setOpen(false)}>Request a quote <ArrowUpRight size={16}/></Link>
      </div>,document.body)}
  </>;
}export function SiteFooter(){const site=useSiteSettings();return <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><Wordmark/><p>Premium sports-surface solutions shaped around the sport, the application and the specification.</p><Link className="footer-contact" to="/contact">Talk to our team <ArrowUpRight size={15}/></Link><a className="footer-instagram" href={site.social?.instagram||settings.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Follow Crome India on Instagram"><Instagram size={16}/> Follow on Instagram <ArrowUpRight size={14}/></a></div><div className="footer-column"><span className="eyebrow">EXPLORE</span><Link to="/sports">Sports solutions</Link><Link to="/products">Products</Link><Link to="/services">Services</Link><Link to="/gallery">Gallery</Link><Link to="/about">About Crome India</Link></div><div className="footer-column"><span className="eyebrow">CONTACT</span>{site.phones.map(p=><a key={p} href={`tel:${p.replace(/\D/g,'')}`}>{p}</a>)}<a href={`mailto:${site.email}`}>{site.email}</a><span className="footer-address"><b>Office</b>{site.office}</span><span className="footer-address"><b>Warehouse</b>{site.warehouse}</span></div><div className="footer-markets"><span className="eyebrow">SOUTH INDIA</span><h3>Surface support across key markets.</h3><p>{(site.markets||settings.markets).join(' · ')}</p><small>Market coverage does not imply a physical branch in each location.</small></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Crome India</span><div><Link to="/privacy-policy">Privacy</Link><Link to="/terms">Terms</Link><Link className="admin-footer-link" to="/admin/login" aria-label="Administrator sign in"><LockKeyhole size={13}/><span>Admin</span></Link></div><span>Premium Surfaces. Exceptional Spaces.</span></div></footer>}
export function MobileActionBar(){const site=useSiteSettings();const phone=(site.phones?.[0]||settings.phones[0]).replace(/\D/g,'');const wa=(site.whatsapp||settings.whatsapp).replace(/\D/g,'');return <nav className="mobile-action-bar" aria-label="Quick contact"><a href={`tel:${phone}`} onClick={()=>trackEvent('call_click',phone)}><Phone size={17}/><span>Call</span></a><a href={`https://wa.me/${wa}?text=${encodeURIComponent('Hello Crome India, I would like to discuss a sports-surface requirement.')}`} target="_blank" rel="noreferrer" onClick={()=>trackEvent('whatsapp_click','site')}><WhatsAppIcon size={18}/><span>WhatsApp</span></a><Link to="/request-quote" onClick={()=>trackEvent('quote_click','mobile-bar')}><ArrowUpRight size={17}/><span>Enquire</span></Link></nav>}
export function ContactBubbles(){const site=useSiteSettings();const wa=(site.whatsapp||settings.whatsapp).replace(/\D/g,'');return <aside className="desktop-contact-bubbles" aria-label="Social contact"><a className="instagram-bubble" href={site.social?.instagram||settings.social.instagram} target="_blank" rel="noreferrer" aria-label="Crome India on Instagram" title="Instagram"><Instagram size={21}/></a><a className="whatsapp-bubble" href={`https://wa.me/${wa}?text=${encodeURIComponent('Hello Crome India, I would like to discuss a sports-surface requirement.')}`} target="_blank" rel="noreferrer" aria-label="Chat with Crome India on WhatsApp" title="WhatsApp" onClick={()=>trackEvent('whatsapp_click','site')}><WhatsAppIcon size={21}/></a></aside>}
