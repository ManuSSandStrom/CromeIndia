import { Suspense, lazy, useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SiteHeader, SiteFooter, MobileActionBar, ContactBubbles } from './layouts/SiteLayout.jsx';
import ChatAssistant from './components/ChatAssistant.jsx';
import EnquiryPopup from './components/EnquiryPopup.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
// Public pages load eagerly (one shared module) so a fresh page load renders
// straight over the prerendered content — no Suspense "Loading…" flash in
// between. Admin stays lazy/code-split since it is never the landing route.
import { HomePage, AboutPage, SportsPage, SportPage, ProductsPage, ProductPage, ServicesPage, GalleryPage, ContactPage, FinderPage, LegalPage, NotFoundPage } from './pages/Pages.jsx';
const AdminCRM=lazy(()=>import('./admin/AdminCRM.jsx'));
const AdminContent=lazy(()=>import('./admin/AdminContent.jsx'));

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  useEffect(() => {
    const path = location.pathname;
    const seo = {
      '/':{ title:'Premium Sports Turf & Surfaces', desc:'Premium sports turf and surfaces from Crome India — football turf, cricket turf, hockey turf, multisport and artificial grass turf. Explore specifications and discuss your project across Bangalore and South India.' },
      '/about':{ title:'About Crome India', desc:'Crome India supports sports turf, sports-surface and sports-infrastructure requirements with application-specific product information and professional enquiry support.' },
      '/sports':{ title:'Sports Turf & Surface Solutions', desc:'Explore turf and surface options by sport — football turf, cricket turf, hockey turf, tennis and multisport surfaces configured in the Crome India catalogue.' },
      '/products':{ title:'Sports Turf & Surface Products', desc:'Browse Crome India turf and surface products and compare factual specifications for football turf, cricket turf, hockey and multisport surfaces.' },
      '/services':{ title:'Sports Surface Solutions & Services', desc:'From understanding the application to selecting the appropriate surface specification. Explore Crome India service areas.' },
      '/gallery':{ title:'Sports Surface Gallery', desc:'Browse approved project, product and surface images added by the Crome India team across completed installations.' },
      '/contact':{ title:'Contact Crome India', desc:'Contact Crome India to discuss your sports-surface requirement. Call, email or submit an enquiry form.' },
      '/request-quote':{ title:'Request a Sports Surface Quote', desc:'Share project details to help the Crome India team understand your sports-surface requirement and prepare a relevant response.' },
      '/request-call':{ title:'Request a Call', desc:'Share your phone number, location and a convenient time for a follow-up call from the Crome India team.' },
      '/find-your-surface':{ title:'Find a Sports Surface', desc:'Select a sport and application to browse matching records in the current Crome India sports surface catalogue.' },
      '/privacy-policy':{ title:'Privacy Policy', desc:'How information submitted through the Crome India website is collected, used and stored.' },
      '/terms':{ title:'Terms of Use', desc:'Information about using the Crome India website, product catalogue and associated services.' },
    };
    const page = seo[path];
    if (page) {
      document.title = `${page.title} | Crome India`;
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.append(meta); }
      meta.content = page.desc;
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = `${page.title} | Crome India`;
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.content = page.desc;
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) { ogUrl = document.createElement('meta'); ogUrl.setAttribute('property','og:url'); document.head.append(ogUrl); }
      ogUrl.content = `https://cromeindiagroup.com${path}`;
    }
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = `https://cromeindiagroup.com${path}`;
  }, [location.pathname]);
  if (isAdmin) return <ErrorBoundary><Suspense fallback={<div className="route-loading"><span className="route-loading-spinner" aria-hidden="true"/>Loading administration…</div>}><Routes><Route path="/admin" element={<AdminCRM/>}/><Route path="/admin/login" element={<AdminCRM/>}/><Route path="/admin/*" element={<AdminContent/>}/></Routes></Suspense></ErrorBoundary>;
  return <>
    <SiteHeader />
    <AnimatePresence mode="wait"><motion.main className="page-transition" key={location.pathname} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:.3,ease:[.22,1,.36,1]}}><ErrorBoundary><Suspense fallback={<div className="route-loading"><span className="route-loading-spinner" aria-hidden="true"/>Loading Crome India…</div>}>
      <Routes>
        <Route path="/" element={<HomePage/>}/><Route path="/about" element={<AboutPage/>}/>
        <Route path="/sports" element={<SportsPage/>}/><Route path="/sports/:slug" element={<SportPage/>}/>
        <Route path="/products" element={<ProductsPage/>}/><Route path="/products/:slug" element={<ProductPage/>}/>
        <Route path="/services" element={<ServicesPage/>}/><Route path="/services/:slug" element={<ServicesPage/>}/>
        <Route path="/gallery" element={<GalleryPage/>}/><Route path="/contact" element={<ContactPage/>}/>
        <Route path="/request-quote" element={<ContactPage kind="quote"/>}/><Route path="/request-call" element={<ContactPage kind="call"/>}/>
        <Route path="/find-your-surface" element={<FinderPage/>}/><Route path="/privacy-policy" element={<LegalPage kind="Privacy policy"/>}/>
        <Route path="/terms" element={<LegalPage kind="Terms of use"/>}/><Route path="*" element={<NotFoundPage/>}/>
      </Routes>
    </Suspense></ErrorBoundary></motion.main></AnimatePresence>
    <SiteFooter/><MobileActionBar/><ContactBubbles/><ChatAssistant/><EnquiryPopup/>
  </>;
}
export default App;
