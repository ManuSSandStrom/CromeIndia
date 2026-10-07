import { Suspense, lazy, useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SiteHeader, SiteFooter, MobileActionBar, ContactBubbles } from './layouts/SiteLayout.jsx';
import IntroAnimation from './components/IntroAnimation.jsx';
import ChatAssistant from './components/ChatAssistant.jsx';
import EnquiryPopup from './components/EnquiryPopup.jsx';
const page=name=>lazy(()=>import('./pages/Pages.jsx').then(module=>({default:module[name]})));
const HomePage=page('HomePage'),AboutPage=page('AboutPage'),SportsPage=page('SportsPage'),SportPage=page('SportPage');
const ProductsPage=page('ProductsPage'),ProductPage=page('ProductPage'),ServicesPage=page('ServicesPage'),GalleryPage=page('GalleryPage');
const ContactPage=page('ContactPage'),FinderPage=page('FinderPage'),LegalPage=page('LegalPage'),NotFoundPage=page('NotFoundPage');
const AdminCRM=lazy(()=>import('./admin/AdminCRM.jsx'));
const AdminContent=lazy(()=>import('./admin/AdminContent.jsx'));

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  useEffect(() => {
    const path = location.pathname;
    const seo = {
      '/':{ title:'Premium Sports Surfaces & Sports Infrastructure', desc:'Premium sports-surface solutions from Crome India. Explore football, cricket, hockey and multisport products, review specifications and discuss your project.' },
      '/about':{ title:'About Crome India', desc:'Crome India supports sports-surface and sports-infrastructure requirements with application-specific product information and professional enquiry support.' },
      '/sports':{ title:'Sports Surface Solutions', desc:'Explore sports applications and review surface products configured in the Crome India catalogue for football, cricket, hockey, tennis and multisport.' },
      '/products':{ title:'Sports Surface Products', desc:'Review Crome India product records and compare available factual specifications for football, cricket, hockey and multisport surfaces.' },
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
      ogUrl.content = `https://www.cromeindia.com${path}`;
    }
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = `https://www.cromeindia.com${path}`;
  }, [location.pathname]);
  if (isAdmin) return <Suspense fallback={<div className="route-loading">Loading administration…</div>}><Routes><Route path="/admin" element={<AdminCRM/>}/><Route path="/admin/login" element={<AdminCRM/>}/><Route path="/admin/*" element={<AdminContent/>}/></Routes></Suspense>;
  return <>
    <SiteHeader />
    <AnimatePresence mode="wait"><motion.main className="page-transition" key={location.pathname} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:.3,ease:[.22,1,.36,1]}}><Suspense fallback={<div className="route-loading">Loading Crome India…</div>}>
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
    </Suspense></motion.main></AnimatePresence>
    <SiteFooter/><MobileActionBar/><ContactBubbles/><ChatAssistant/><EnquiryPopup/>
    <IntroAnimation/>
  </>;
}
export default App;
