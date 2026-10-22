import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, ChevronRight, Filter, MapPin, MessageCircle, Search, SlidersHorizontal } from 'lucide-react';
import { api } from '../lib/api.js';
import { trackEvent } from '../lib/analytics.js';
import { useApiList } from '../hooks/useApiList.js';
import { settings, products as fallbackProducts, sports as fallbackSports, services as fallbackServices, serviceDetails, productCategories, galleryItems as fallbackGallery } from '../data/content.js';
import { Breadcrumbs, ImageSlot, NamedImage, PageHero, ProductCard, productSummary, SectionHeading, SpecificationList, SportCard } from '../components/Catalog.jsx';
import { useSiteSettings } from '../context/SiteContext.jsx';
import { productImage, sportImage, siteImages, projectGalleryItems } from '../data/images.js';
import EditorialSection from '../components/EditorialSection.jsx';
import ServiceFAQs from '../components/ServiceFAQs.jsx';
import { productEditorial, serviceEditorial, serviceFaqs } from '../data/detailContent.js';

/* â”€â”€ Scroll-reveal hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function useReveal(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('revealed');
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      },
      { threshold: options.threshold ?? 0.12, rootMargin: options.rootMargin ?? '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal-up ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}

function ProductStoryRow({ product, index, selected, compareDisabled, onCompare, hideImage = false }) {
  const media = product.images?.[0]?.url || productImage(product);
  const image = media?.url || media;
  const knownSpecs = [product.pileHeightMm && `${product.pileHeightMm} mm pile height`, product.specifications?.yarn, product.specifications?.gauge].filter(Boolean);
  return <Reveal as="article" className={`product-story-row${index % 2 ? ' is-reversed' : ''}${hideImage ? ' is-image-hidden' : ''}`}>
    {!hideImage&&<Link className="product-story-media" to={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
      <ImageSlot src={image} label={media?.alt || product.name} />
      <span className="product-story-index">{String(index + 1).padStart(2, '0')}</span>
    </Link>}
    <div className="product-story-copy">
      <span className="eyebrow">{product.sport} · {product.category}</span>
      <h2><Link to={`/products/${product.slug}`}>{product.name}</Link></h2>
      <p>{productSummary(product)}</p>
      {knownSpecs.length > 0 && <ul className="product-story-specs">{knownSpecs.map(spec => <li key={spec}><Check size={15}/>{spec}</li>)}</ul>}
      <div className="product-story-actions"><Link className="text-link" to={`/products/${product.slug}`}>View product details <ArrowUpRight size={16}/></Link>
        {onCompare && <label className="compare-choice"><input type="checkbox" checked={selected} disabled={compareDisabled} onChange={onCompare}/> Compare specifications</label>}
      </div>
    </div>
  </Reveal>;
}

/* â”€â”€ Stagger animation for grid children â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function StaggerGrid({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('stagger-revealed');
          observer.unobserve(el);
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`stagger-grid ${className}`}>{children}</div>;
}

const waLink = (message) => `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`;
function imageIdentity(source){
  if(!source)return '';
  const raw=typeof source==='object'?(source.url||source.src||''):source;
  const clean=String(raw).split(/[?#]/)[0];
  const cloudinary=clean.match(/\/upload\/(?:.*?\/)?(v\d+\/.*)$/);
  return cloudinary?cloudinary[1].toLowerCase():clean.toLowerCase();
}
function withUniqueImages(items,getSource,initial=[]){
  const seen=new Set(initial.map(imageIdentity).filter(Boolean));
  return items.map(item=>{
    const source=getSource(item),key=imageIdentity(source),hideImage=Boolean(key&&seen.has(key));
    if(key)seen.add(key);
    return {item,hideImage};
  });
}
function usePageMeta(title,description,structured=null){useEffect(()=>{if(title)document.title=`${title} | Crome India`;if(description){let meta=document.querySelector('meta[name="description"]');if(!meta){meta=document.createElement('meta');meta.name='description';document.head.append(meta)}meta.content=description}let script=document.getElementById('page-structured-data');if(script)script.remove();if(structured){script=document.createElement('script');script.id='page-structured-data';script.type='application/ld+json';script.textContent=JSON.stringify(structured);document.head.append(script)}return()=>{document.getElementById('page-structured-data')?.remove()}},[title,description,JSON.stringify(structured)])}
function LinkButton({to='/request-quote',children,light=false}){return <Link className={`button ${light?'button-light':'button-primary'}`} to={to}>{children}<ArrowUpRight size={16}/></Link>}
function Callout({title='Tell us about your project',copy='Share your sport, application and project needs. The Crome India team can help with the next step.',to='/request-quote'}){return <section className="cta-band"><div><span className="eyebrow">LET'S DISCUSS YOUR REQUIREMENT</span><h2>{title}</h2><p>{copy}</p></div><LinkButton to={to}>Start an enquiry</LinkButton></section>}

function HomeEditorialRow({image,alt,eyebrow,title,copy,to,action='Explore',index=0}){
  const src=image?.url||image;
  return <Reveal as="article" className={`home-editorial-row${index%2?' is-reversed':''}`}>
    <Link className="home-editorial-media" to={to} aria-label={`${action}: ${title}`}><ImageSlot src={src} label={image?.alt||alt||title}/><span>{String(index+1).padStart(2,'0')}</span></Link>
    <div className="home-editorial-copy"><span className="eyebrow">{eyebrow}</span><h3>{title}</h3><p>{copy}</p><Link className="text-link" to={to}>{action}<ArrowUpRight size={16}/></Link></div>
  </Reveal>;
}

export function LeadForm({kind='enquiry',product='',sport='',service='',application='',compact=false}){
  const [busy,setBusy]=useState(false),[result,setResult]=useState(''),[error,setError]=useState('');const location=useLocation();const{items:sportItems}=useApiList('/sports',fallbackSports);
  async function submit(e){e.preventDefault();setBusy(true);setError('');const form=e.currentTarget;const values=Object.fromEntries(new FormData(form));const params=new URLSearchParams(location.search);Object.assign(values,{requestType:kind,product:values.product||product,sport:values.sport||sport,interestedService:values.interestedService||service,sourcePage:location.pathname,landingPage:location.pathname,referrer:document.referrer,utmSource:params.get('utm_source')||'',utmMedium:params.get('utm_medium')||'',utmCampaign:params.get('utm_campaign')||''});try{const response=await api.post('/leads',values);setResult(response.data.data.reference||'');form.reset()}catch(e){setError(e.response?.data?.message||'We could not send your message right now. Please try again or call Crome India.')}finally{setBusy(false)}}
  if(result)return <div className="form-success" role="status"><span><Check size={18}/></span><div><h3>Thank you. Your request has been received by Crome India.</h3><p>Reference: {result}. Our team can follow up using the contact details you shared.</p></div></div>;
  const call=kind==='call';return <form className={`lead-form${compact?' lead-form-compact':''}`} onSubmit={submit}>
    <div className="form-grid"><label>Name <input name="name" autoComplete="name" required minLength="2" maxLength="100" placeholder="Your name"/></label><label>Company <input name="company" autoComplete="organization" maxLength="140" placeholder="Company or organisation"/></label><label>Phone <input name="phone" type="tel" autoComplete="tel" required={call} maxLength="24" placeholder="Contact number"/></label><label>Email <input name="email" type="email" autoComplete="email" required={!call} maxLength="160" placeholder="you@company.com"/></label><label>City <input name="city" autoComplete="address-level2" maxLength="100" placeholder="Project city"/></label>{!call&&<label>Project type <select name="projectType" defaultValue=""><option value="">Select project type</option>{['Sports facility','School / college','Academy','Sports centre','Installer / contractor','Dealer / procurement','Other'].map(x=><option key={x}>{x}</option>)}</select></label>}
    {!call&&<label>Sport / application <select name="sport" defaultValue={sport}><option value="">Choose sport or application</option>{sportItems.map(s=><option key={s.slug} value={s.name}>{s.name}</option>)}</select></label>}
    {!call&&<label>Application detail <input name="application" defaultValue={application} maxLength="140" placeholder="Practice, academy, facility..."/></label>}
    {!call&&<label>Approximate area <span className="area-input"><input type="number" min="1" name="areaValue" placeholder="e.g. 5000"/><select name="areaUnit" aria-label="Area unit"><option>sq ft</option><option>sq m</option></select></span></label>}
    {call&&<label>Preferred contact time <input name="preferredContactTime" placeholder="e.g. Weekdays, 10 am-1 pm"/></label>}
    <label className="form-span">{call?'Requirement':'Product interest'} <input name={call?'interestedService':'product'} defaultValue={call?service:product} placeholder={call?'What would you like to discuss?':'Product or specification, if known'}/></label>
    <label className="form-span">Message <textarea name="message" required minLength="4" maxLength="2000" rows="4" placeholder="Tell us a little about the project, location, usage or specification you are considering."/></label>
    <label className="consent-label form-span"><input type="checkbox" name="consent" value="true" required/><span>I agree to be contacted about this enquiry and have read the <Link to="/privacy-policy">Privacy Policy</Link>.</span></label></div>
    {error&&<p className="form-error" role="alert">{error}</p>}<button className="button button-primary form-submit" disabled={busy}>{busy?'Sending...':call?'Request a call':'Send your enquiry'}<ArrowUpRight size={17}/></button>
  </form>
}

export function HomePage(){
  const {items:allSports}=useApiList('/sports',fallbackSports);
  const {items:allProducts}=useApiList('/products',fallbackProducts);
  const site=useSiteSettings();
  const uniqueSports=[...new Map(allSports.map(sport=>[String(sport.name||sport.slug).trim().toLowerCase().replace(/[^a-z0-9]/g,''),sport])).values()];
  const surfaceSports=[...uniqueSports].sort((a,b)=>(a.displayOrder??999)-(b.displayOrder??999));
  const featuredProducts=[...new Map(allProducts.filter(product=>product.published!==false).sort((a,b)=>Number(b.featured)-Number(a.featured)).map(product=>[String(product.sport||'').trim().toLowerCase(),product])).values()].slice(0,3);
  const featuredProductViews=withUniqueImages(featuredProducts,product=>product.images?.[0]?.url||productImage(product),surfaceSports.map(sport=>sportImage(sport)?.url));
  const homeFaqs=[
    ['How do I choose a sports surface?','Start with the sport, intended use, indoor or outdoor setting, project location and approximate area. Share those details with Crome India to discuss the available product information.'],
    ['Can I review technical specifications before enquiring?','Yes. Product pages show the specifications currently recorded in the catalogue. Fields that have not been confirmed are left out; contact the team for current product documentation.'],
    ['Can I enquire about material supply or a complete project?','Yes. Use the enquiry form to describe your requirement, including whether you are asking about materials, installation or broader project support. The team can confirm the available scope for your project.'],
  ];
  return <>
    <section className="home-hero">
      <video className="home-hero-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" poster={siteImages['home-hero-sports-surface'].url}>
        <source src="https://res.cloudinary.com/dt37ji5yp/video/upload/v1791313293/Commercial_for_artificial_sports__1080p_20261007002703_gwr_video_mvp_g7jg5w.mp4" type="video/mp4"/>
      </video>
      <div className="home-hero-video-shade" aria-hidden="true"/>
      <div className="home-hero-grid">
        <div className="home-hero-copy">
          <span className="eyebrow"><i/> CROME INDIA · SPORTS SURFACES</span>
          <h1>{site.homeHeroTitle||<>Surfaces built<br/>around <em>the sport.</em></>}</h1>
          <p>{site.homeHeroCopy||'Premium sports-surface solutions for academies, institutions and sports facilities.'}</p>
          <div className="hero-actions"><LinkButton to="/sports">Explore sports surfaces</LinkButton><Link className="text-link text-link-light" to="/request-quote">Discuss your project <ArrowRight size={16}/></Link></div>
          <div className="hero-note"><span className="hero-note-mark"/>APPLICATION <b>→</b> SPECIFICATION <b>→</b> PRODUCT</div>
        </div>
      </div>
      <div className="hero-bottom"><span>SPORTS SURFACES & INFRASTRUCTURE</span><span>Serving key South Indian markets</span><a href="#discover">SCROLL TO EXPLORE <ChevronRight size={14}/></a></div>
    </section>

    <section id="discover" className="surface-collection-section">
      <div className="surface-collection-inner"><Reveal><div className="surface-collection-heading"><div><span className="eyebrow">CROME INDIA / SURFACES</span><h2>Made for the game.<br/><em>Chosen for the ground.</em></h2></div><div><p>Explore surfaces by sport and application. Open a category to see current product information or discuss what may suit your project.</p><Link className="text-link" to="/sports">Explore all sports <ArrowUpRight size={16}/></Link></div></div></Reveal>
        <div className="surface-card-grid">{surfaceSports.map((sport,index)=>{const image=sportImage(sport);return <Link className="surface-card" key={sport.slug||sport.name} to={`/sports/${sport.slug}`}><img src={image?.url} alt={image?.alt||`${sport.name} sports surface`} loading="lazy" decoding="async"/><span className="surface-card-number">/{String(index+1).padStart(2,'0')}</span><span className="surface-card-status">{sport.active===false?'Enquire about this surface':'Explore surface'}</span><div className="surface-card-copy"><h3>{sport.name}<br/><em>{sport.name==='Gym'?'Flooring':'Surface'}</em></h3><p>{sport.active===false?'Discuss product options for your application.':'Explore the product details currently listed for this sport.'}</p></div><span className="surface-card-arrow"><ArrowUpRight size={22}/></span></Link>})}</div>
      </div>
    </section>
    {featuredProductViews.some(view=>!view.hideImage)&&<section className="home-featured-products"><div className="home-editorial-inner"><Reveal><SectionHeading eyebrow="PRODUCT CATALOGUE" title="The details start with the product." copy="Explore published catalogue records and review the information available for each surface." link="View all products" to="/products"/></Reveal><div className="home-featured-grid">{featuredProductViews.filter(view=>!view.hideImage).map(({item:product})=><ProductCard key={product._id||product.slug} product={product}/>)}</div></div></section>}

    <section className="home-process-section"><div className="home-editorial-inner"><Reveal><SectionHeading eyebrow="A CLEARER PROJECT CONVERSATION" title="From first brief to a considered next step." copy="A simple sequence for sharing your requirements and reviewing the information relevant to your project."/></Reveal><div className="home-process-grid">{[['01','Enquiry','Share the sport, location and what you are planning.'],['02','Requirement review','Outline the intended use, area and project context.'],['03','Surface discussion','Review relevant product information and open questions.'],['04','Scope confirmation','Confirm product availability and the scope of support for your project.'],['05','Project coordination','Discuss the next steps for the agreed supply or project scope.'],['06','Follow-up','Keep the conversation moving with the details your project needs.']].map(([n,title,copy],index)=><Reveal as="article" className="home-process-step" key={n} delay={index*90}><span>{n}</span><h3>{title}</h3><p>{copy}</p></Reveal>)}</div></div></section>

    <section className="home-industries-section"><div className="home-editorial-inner"><Reveal><SectionHeading eyebrow="WHO WE WORK WITH" title="Spaces designed around their users." copy="Sports-surface enquiries can come from many kinds of projects. Tell us who the space is for and how it will be used."/></Reveal><div className="home-industries-grid">{[['01','Schools & institutions','Spaces for learning, training and shared play.','school-sports-facility'],['02','Academies & clubs','Dedicated environments for practice and sport.','sports-arena'],['03','Commercial sports arenas','Facilities planned around their intended sports and users.','sports-infrastructure-b2b'],['04','Contractors & retailers','Product and project enquiries for trade requirements.','turf-rolls-warehouse']].map(([n,title,copy,img])=><Link className="home-industry-card" to={`/services/${title.toLowerCase().includes('school')?'project-requirement-support':'b2b-product-supply'}`} key={n}><NamedImage name={img}/><span className="industry-index">/{n}</span><div><h3>{title}</h3><p>{copy}</p></div><ArrowUpRight size={18}/></Link>)}</div></div></section>

    <section className="home-engagement-section"><div className="home-editorial-inner"><Reveal><SectionHeading eyebrow="ENGAGEMENT OPTIONS" title="Start with the support your project needs." copy="Describe the scope you have in mind. Crome India can confirm the available product and project support for your requirement."/></Reveal><div className="engagement-grid"><article><span className="eyebrow">01 / PRODUCT ENQUIRY</span><h3>Material supply</h3><p>Share the product or surface category, estimated quantity, location and requested timeline for a supply enquiry.</p><Link className="text-link" to="/request-quote">Enquire about supply <ArrowUpRight size={16}/></Link></article><article><span className="eyebrow">02 / PROJECT ENQUIRY</span><h3>Installation or project support</h3><p>Tell us about the site, sport, approximate area and support you are looking for. The team can confirm the scope available for your project.</p><Link className="text-link" to="/request-quote">Discuss your project <ArrowUpRight size={16}/></Link></article></div></div></section>

    <section className="home-faq-section"><div className="home-editorial-inner"><Reveal><SectionHeading eyebrow="COMMON QUESTIONS" title="A few useful things to know." copy="Have a project-specific question? The team can help you find the right information." link="Ask Crome India" to="/contact"/></Reveal><div className="home-faq-list">{homeFaqs.map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></div></section>

    <section className="home-contact-band"><div><span className="eyebrow">YOUR PROJECT, OUR NEXT CONVERSATION</span><h2>Planning a sports surface?</h2><p>Tell us the sport, location and project scope. Our team will help you take the next step.</p></div><div className="home-contact-actions"><LinkButton to="/request-quote">Discuss your project <ArrowUpRight size={16}/></LinkButton><Link className="home-about-link" to="/about">Get to know Crome India <ArrowRight size={15}/></Link><Link className="home-about-link" to="/services">Explore our services <ArrowRight size={15}/></Link></div></section>
  </>;
}
export function SportsPage(){const{items}=useApiList('/sports',fallbackSports);return <><PageHero eyebrow="SPORTS SURFACE SOLUTIONS" title="Start with the sport. Explore the surface." copy="Products are connected to their applications so you can begin with the way the space will be used."/><section className="section"><StaggerGrid className="sport-card-grid sport-card-grid-large">{items.map(s=><SportCard key={s._id||s.slug} sport={s}/>)}</StaggerGrid></section><Callout title="Not sure which surface fits?" to="/find-your-surface" copy="Answer a few questions about your application and browse only products currently in the catalogue."/></>}

export function SportPage(){
  const{slug}=useParams();
  const{items:sports}=useApiList('/sports',fallbackSports);
  const{items:products}=useApiList('/products',fallbackProducts);
  const sport=sports.find(s=>s.slug===slug)||fallbackSports.find(s=>s.slug===slug);
  const matching=products.filter(p=>String(p.sport).toLowerCase()===sport?.name?.toLowerCase());
  const sportHeroKeys={football:'project-football-turf',cricket:'project-cricket-pitch',hockey:'project-hockey-surface',tennis:'project-court-sports',badminton:'project-court-sports',squash:'project-court-sports','running-athletics':'project-running-track',gym:'project-gym-flooring',multisport:'project-multisport-facility'};
  const heroImage=siteImages[sportHeroKeys[slug]]||siteImages['sports-infrastructure-b2b'];
  const productViews=withUniqueImages(matching,p=>p.images?.[0]?.url||productImage(p),[heroImage.url]);
  const index=Number.isFinite(Number(sport?.displayOrder))?Number(sport.displayOrder)+1:1;
  const suffix=['Football','Cricket','Hockey'].includes(sport?.name)?'turf.':'surface.';
  usePageMeta(sport?`${sport.name} Sports Surfaces`:null,sport?`Explore ${sport.name.toLowerCase()} surface applications and available product specifications with Crome India.`:null);
  if(!sport)return <NotFoundPage/>;
  return <>
    <section className="sport-landing-hero" style={{'--sport-hero-image':`url("${heroImage.url}")`}}>
      <div className="sport-landing-copy"><span className="sport-landing-kicker">SURFACE {String(index).padStart(2,'0')} / CROME INDIA CATALOGUE</span><h1>{sport.name}<br/><em>{suffix}</em></h1><p>{sport.heroSubtitle||`Explore ${sport.name.toLowerCase()} surface options and discuss product information for your project with Crome India.`}</p><div><a className="button button-primary" href="#sport-products">See the products <ArrowUpRight size={16}/></a><Link className="sport-quote-link" to={`/request-quote?sport=${encodeURIComponent(sport.name)}`}>Get a quote <ArrowUpRight size={15}/></Link></div></div>
    </section>
    <section className="section sport-detail-intro"><Reveal><div><span className="eyebrow">APPLICATION FIRST</span><h2>Selected around the specification.</h2><p>{sport.description||`Surface selection for ${sport.name.toLowerCase()} starts with your project type, intended use and site requirements. Share the details with Crome India to discuss the available product information.`}</p></div></Reveal><Reveal delay={100}><div className="considerations"><h3>Consider your project</h3>{['Project type and location','Usage and playing environment','Surface and specification requirements','Area and project timeline'].map(x=><span key={x}><Check size={16}/>{x}</span>)}</div></Reveal></section>
    <section className="section sport-products-section" id="sport-products"><Reveal><SectionHeading eyebrow={`${sport.name.toUpperCase()} PRODUCTS`} title={matching.length?`${matching.length} product${matching.length===1?'':'s'} for ${sport.name.toLowerCase()}.`:'Discuss surface options with our team.'} copy={matching.length?'Explore the product records currently assigned to this sport.':'No product is currently assigned to this application in the catalogue. Contact Crome India to discuss the requirement.'}/></Reveal>{productViews.length?<StaggerGrid className="product-grid">{productViews.map(({item:product,hideImage})=><ProductCard key={product._id||product.slug} product={product} hideImage={hideImage}/>)}</StaggerGrid>:<LinkButton>Speak with Crome India</LinkButton>}</section>
    {sport.applications?.length>0&&<section className="application-section"><Reveal><div><span className="eyebrow">APPLICATIONS</span><h2>Where the sport meets the space.</h2></div></Reveal><div className="application-list">{sport.applications.map((application,i)=><span key={application}><b>{String(i+1).padStart(2,'0')}</b>{application}</span>)}</div></section>}
    <Callout title={`Planning a ${sport.name} facility?`} copy="Tell us about the project, location and application. Our team will follow up on your enquiry."/>
  </>;
}

export function ProductsPage(){const[searchParams,setSearchParams]=useSearchParams();const{items}=useApiList('/products',fallbackProducts);const{items:categoryItems}=useApiList('/categories',productCategories);const{items:sportItems}=useApiList('/sports',fallbackSports);const[search,setSearch]=useState(''),[compare,setCompare]=useState([]);const category=searchParams.get('category')||'',sport=searchParams.get('sport')||'',mm=searchParams.get('pileHeight')||'';const heights=[...new Set(items.map(p=>Number(p.pileHeightMm)).filter(Boolean))].sort((a,b)=>a-b);const visible=items.filter(p=>(!category||p.category===category)&&(!sport||p.sport.toLowerCase()===sport.toLowerCase())&&(!mm||Number(p.pileHeightMm)===Number(mm))&&(!search||`${p.name} ${p.sport} ${p.category}`.toLowerCase().includes(search.toLowerCase())));const setFilter=(key,value)=>setSearchParams(prev=>{const next=new URLSearchParams(prev);value?next.set(key,value):next.delete(key);return next});const toggle=id=>setCompare(v=>v.includes(id)?v.filter(x=>x!==id):v.length<3?[...v,id]:v);return <><PageHero eyebrow="CROME INDIA PRODUCT CATALOGUE" title="Explore products by sport and specification." copy="Compare the information available for each product. Talk to Crome India for application-specific guidance."/><section className="catalog-toolbar"><label className="search-field"><Search size={17}/><input aria-label="Search products" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products"/></label><label><Filter size={16}/><select value={category} onChange={e=>setFilter('category',e.target.value)}><option value="">All categories</option>{categoryItems.map(c=><option key={c.slug} value={c.name}>{c.name}</option>)}</select></label><label><SlidersHorizontal size={16}/><select value={sport} onChange={e=>setFilter('sport',e.target.value)}><option value="">All sports</option>{sportItems.map(s=><option key={s.slug} value={s.name}>{s.name}</option>)}</select></label><label><select aria-label="Filter by pile height" value={mm} onChange={e=>setFilter('pileHeight',e.target.value)}><option value="">All pile heights</option>{heights.map(h=><option key={h} value={h}>{h} mm</option>)}</select></label></section><section className="section products-section"><NamedImage name="acrylic-sports-surface"/><p className="result-count">{visible.length} {visible.length===1?'product':'products'}{mm?` · ${mm} mm`:''}</p>{visible.length?<div className="product-stories">{withUniqueImages(visible,p=>p.images?.[0]?.url||productImage(p)).map(({item:p,hideImage},i)=><ProductStoryRow key={p._id||p.slug} product={p} index={i} selected={compare.includes(p._id||p.slug)} compareDisabled={compare.length>=3&&!compare.includes(p._id||p.slug)} onCompare={()=>toggle(p._id||p.slug)} hideImage={hideImage}/>)}</div>:<div className="empty-state"><span className="eyebrow">NO MATCHING PRODUCT</span><h2>Let's discuss your application.</h2><p>There is no published product matching these filters. The Crome India team can help review your project needs.</p><LinkButton/></div>}</section>{compare.length===1&&<p className="compare-hint">Choose one more product to compare specifications.</p>}{compare.length>1&&<aside className="compare-dock"><span>{compare.length} of 3 selected</span><a href="#comparison">Compare specifications <ArrowUpRight size={15}/></a><button onClick={()=>setCompare([])}>Clear</button></aside>}{compare.length>1&&<section className="section compare-section" id="comparison"><SectionHeading eyebrow="PRODUCT COMPARISON" title="Compare specifications." copy="Only values entered in the product records are shown."/><div className="compare-grid">{items.filter(p=>compare.includes(p._id||p.slug)).map(p=><article key={p._id||p.slug}><h3>{p.name}</h3><SpecificationList product={p}/></article>)}</div></section>}</>}

export function ProductPage(){const{slug}=useParams();const{items}=useApiList('/products',fallbackProducts);const[remote,setRemote]=useState(null);useEffect(()=>{let live=true;api.get(`/products/${slug}`).then(r=>{if(live)setRemote(r.data.data)}).catch(()=>{});return()=>{live=false}},[slug]);const product=remote||items.find(p=>p.slug===slug);usePageMeta(product?`${product.name} | ${product.sport||'Sports Surface'} Product`:null,product?.seo?.description||product?.shortDescription||null,product?{'@context':'https://schema.org','@type':'Product',name:product.name,description:product.seo?.description||product.shortDescription,category:product.category,brand:product.brand?{'@type':'Brand',name:product.brand}:undefined}:null);if(!product)return <NotFoundPage/>;const image=product.images?.[0]?.url||productImage(product);return <><Breadcrumbs items={[{label:'Products',to:'/products'},{label:product.sport,to:`/sports/${product.sport?.toLowerCase().replace(/\s+/g,'-')}`},{label:product.name}]}/><section className="product-detail-hero"><Reveal className="product-detail-image"><ImageSlot src={image?.url||image} label={image?.alt||product.name}/><span className="image-caption">PRODUCT MEDIA</span></Reveal><Reveal className="product-detail-copy" delay={100}><span className="eyebrow">{product.category||product.sport}</span><h1>{product.name}</h1><p>{productSummary(product)}</p><div className="product-meta">{product.sport&&<span>{product.sport}</span>}</div><div className="hero-actions"><LinkButton to={`/request-quote?product=${encodeURIComponent(product.name)}`}>Request a quote</LinkButton><a className="text-link" href={waLink(`Hello Crome India, I'm interested in ${product.name}. Please share more information.`)} target="_blank" rel="noreferrer" onClick={()=>trackEvent('whatsapp_click',product.name,{product:product.name,sport:product.sport})}><MessageCircle size={16}/> WhatsApp us</a></div></Reveal></section><section className="section product-spec-section">{imageIdentity(image?.url||image)!==imageIdentity(siteImages['turf-macro-detail'].url)&&<NamedImage name="turf-macro-detail"/>}<Reveal><div><span className="eyebrow">PRODUCT SPECIFICATION</span><h2>Product details.</h2><p>Only specifications confirmed in this product record are displayed.</p></div></Reveal><SpecificationList product={product}/></section><EditorialSection eyebrow="PRODUCT GUIDANCE" title="Quality, application and the experience of use." intro="Understand the details that are confirmed, the project factors that shape selection, and the questions worth resolving before specification." items={productEditorial[product.slug]}/><section className="section product-enquiry"><Reveal><div><span className="eyebrow">PRODUCT ENQUIRY</span><h2>Ask us about {product.name}.</h2><p>Send your contact details and project context to the Crome India team.</p></div></Reveal><LeadForm kind="product" product={product.name} sport={product.sport}/></section></>}

export function ServicesPage(){
  const {items}=useApiList('/services',fallbackServices);
  const {slug}=useParams();
  const selected=slug&&items.find(item=>item.slug===slug);
  const detail=slug&&serviceDetails[slug];
  usePageMeta(selected?.seo?.title||selected?.title||'Sports Surface Solutions & Services',selected?.seo?.description||selected?.shortDescription||selected?.description||'From understanding the application to selecting the appropriate surface specification.');
  if(selected){
    const images=(detail?.imageKeys||[]).map(key=>({key,image:siteImages[key]})).filter(item=>item.image);
    return <>
      <Breadcrumbs items={[{label:'Services',to:'/services'},{label:selected.title}]}/>
      <PageHero eyebrow="CROME INDIA SERVICES" title={selected.title} copy={selected.shortDescription||selected.description}>
        <LinkButton to={`/request-quote?service=${encodeURIComponent(selected.title)}`}>Discuss this service</LinkButton>
      </PageHero>
      <section className="section service-detail-layout">
        <Reveal className="service-detail-copy">
          <span className="eyebrow">SERVICE OVERVIEW</span>
          <h2>{detail?.heading||selected.title}</h2>
          <p>{selected.fullDescription||detail?.detail||selected.description}</p>
          {detail?.points?.length>0&&<><h3>What we can discuss</h3><ul>{detail.points.map(point=><li key={point}>{point}</li>)}</ul></>}
          {selected.applications?.length>0&&<><h3>Applications</h3><ul>{selected.applications.map(item=><li key={item}>{item}</li>)}</ul></>}
        </Reveal>
        {images.length>0&&<Reveal className={`service-detail-gallery ${images.length>1?'is-multiple':''}`} delay={100}>
          {images.map(({key,image})=><figure key={key}><img src={image.url} alt={image.alt} loading="lazy"/><figcaption>{image.alt}</figcaption></figure>)}
        </Reveal>}
      </section>
      <EditorialSection eyebrow="PROJECT GUIDANCE" title="A considered approach to the surface." intro="Useful decisions come from matching the application to confirmed product information and a clear project brief." items={serviceEditorial[slug]}/>
      <ServiceFAQs items={serviceFaqs[slug]} serviceTitle={selected.title}/>
      <Callout title={`Discuss ${selected.title.toLowerCase()} with our team`} copy="Share the sport, facility, location and project requirements so the team can respond with relevant information." to="/request-quote"/>
    </>;
  }
  const uniqueServices=[...new Map(items.map(item=>[String(item.slug||item.title).trim().toLowerCase(),item])).values()];
  return <>
    <PageHero eyebrow="SPORTS SURFACE SOLUTIONS" title="From application to specification." copy="Explore how Crome India can support your sports-surface project, from an early application discussion to product and supply guidance."/>
    <section className="home-editorial-section services-editorial-section">
      <div className="home-editorial-inner">
        <Reveal><SectionHeading eyebrow="HOW WE CAN SUPPORT" title="Services shaped around your project." copy="Open a service for its details, related surface imagery and the information that helps us respond."/></Reveal>
        <div className="home-editorial-list">{uniqueServices.map((service,index)=>{
          const serviceImage=siteImages[serviceDetails[service.slug]?.imageKeys?.[0]]||siteImages['surface-consultation'];
          return <HomeEditorialRow key={service.slug||service.title} image={serviceImage} alt={serviceImage?.alt||service.title} eyebrow={`CROME INDIA SERVICE · ${String(index+1).padStart(2,'0')}`} title={service.title} copy={service.shortDescription||service.description||'Discuss the requirements for your sports-surface project with Crome India.'} to={`/services/${service.slug}`} action="Explore service" index={index}/>;
        })}</div>
      </div>
    </section>
    <Callout title="Need product or specification guidance?"/>
  </>;
}

export function GalleryPage(){
  const {items:apiItems, loading} = useApiList('/gallery', []);
  const items = withUniqueImages(apiItems.length > 0 ? apiItems : projectGalleryItems,item=>item.url||item.thumbnailUrl,[siteImages['sports-arena'].url]).map(({item})=>item);
  const categories = ['All', ...new Set(items.map(i => i.category).filter(Boolean))];
  const [category, setCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const visible = items.filter(i => category === 'All' || i.category === category);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox(prev => (prev + 1) % visible.length);
      if (e.key === 'ArrowLeft') setLightbox(prev => (prev - 1 + visible.length) % visible.length);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler); };
  }, [lightbox, visible.length]);

  return <>
    <PageHero eyebrow="CROME INDIA PROJECT & SURFACE LIBRARY" title="A closer look at sports surfaces." copy="Browse completed project installations, product photographs and surface imagery from Crome India projects across South India."/>
    <section className="section gallery-page">
      <div className="gallery-filters">{categories.map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div>
      {loading ? <p>Loading gallery...</p> :
        <StaggerGrid className="gallery-grid">{visible.map((item, idx) =>
          <figure key={item._id} className="gallery-figure" onClick={() => setLightbox(idx)} role="button" tabIndex={0} aria-label={`View ${item.title}`}>
            <img src={item.url || item.thumbnailUrl} alt={item.altText || item.title} loading="lazy" decoding="async"/>
            <figcaption><b>{item.title}</b><span>{item.caption || item.category}</span></figcaption>
          </figure>
        )}</StaggerGrid>
      }
    </section>
    {lightbox !== null && visible[lightbox] && (
      <div className="gallery-lightbox" onClick={() => setLightbox(null)} role="dialog" aria-label="Image preview">
        <button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Close preview">&times;</button>
        <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + visible.length) % visible.length); }} aria-label="Previous image">&lsaquo;</button>
        <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
          <img src={visible[lightbox].url || visible[lightbox].thumbnailUrl} alt={visible[lightbox].altText || visible[lightbox].title}/>
          <div className="lightbox-caption">
            <b>{visible[lightbox].title}</b>
            <p>{visible[lightbox].caption || visible[lightbox].category}</p>
            <small>{lightbox + 1} / {visible.length}</small>
          </div>
        </div>
        <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % visible.length); }} aria-label="Next image">&rsaquo;</button>
      </div>
    )}
    <Callout title="Have a project to discuss?"/>
  </>;
}

export function AboutPage(){
  const site=useSiteSettings();
  const markets=site.markets||settings.markets;
  return <>
    <section className="about-editorial-hero"><span className="eyebrow">ABOUT CROME INDIA / BENGALURU</span><h1>Sports spaces,<br/><em>thought through.</em></h1><p>Premium Surfaces. Exceptional Spaces. Crome India helps teams explore sports-surface products, understand available specifications and start a focused project conversation.</p><div className="about-hero-actions"><Link className="button button-primary" to="/sports">Explore surfaces <ArrowUpRight size={16}/></Link><Link className="about-phone-link" to="/contact">Talk with our team <ArrowRight size={15}/></Link></div></section>
    <section className="about-presence-section"><div className="about-presence-heading"><span className="eyebrow">OUR LOCATION & MARKETS</span><h2>Based in Bengaluru.<br/><em>Here to discuss your project.</em></h2><p>Crome India’s office and warehouse are in Bengaluru. The following South Indian markets are listed for enquiries; please contact the team to confirm coverage for your specific location.</p></div><div className="about-presence-panel"><div className="about-network-art" aria-label="Bengaluru connected to listed South Indian enquiry markets"><div className="network-orbit orbit-one"/><div className="network-orbit orbit-two"/><div className="network-center"><MapPin size={24}/><b>BENGALURU</b><small>OFFICE · WAREHOUSE</small></div>{markets.map((market,index)=><span className={`network-node node-${index+1}`} key={market}><i/>{market}</span>)}</div><div className="about-address-grid"><article><span className="eyebrow">OFFICE</span><p>{site.office}</p></article><article><span className="eyebrow">WAREHOUSE</span><p>{site.warehouse}</p></article></div></div></section>
    <Callout/>
  </>;
}export function ContactPage({kind='enquiry'}){const site=useSiteSettings(),[params]=useSearchParams();const call=kind==='call',quote=kind==='quote';return <><PageHero eyebrow={call?'REQUEST A CALL':quote?'REQUEST A QUOTE':'CONTACT CROME INDIA'} title={call?'Request a call from our team':quote?'Tell us about your project':'Let\'s discuss your sports-surface requirement.'} copy={call?'Share your phone number, location and a convenient time for a follow-up.':quote?'Provide a few project details to help us understand your sports-surface requirement.':'Reach out to discuss product specifications, applications or a project requirement.'}/><section className="section contact-layout"><Reveal className="contact-details"><NamedImage name="contact-project"/><span className="eyebrow">CROME INDIA</span><h2>Talk with our team.</h2><a className="contact-phone" href={`tel:${(site.phones?.[0]||'9663556752').replace(/\D/g,'')}`}>{site.phones?.[0]||'9663556752'} <ArrowUpRight size={17}/></a><a className="contact-email" href={`mailto:${site.email}`}>{site.email}</a><article><b>Office</b><p>{site.office}</p></article><article><b>Warehouse</b><p>{site.warehouse}</p></article><p className="contact-note">Serving sports-surface requirements across key South Indian markets. Market coverage does not imply local branch offices.</p></Reveal><Reveal className="contact-form-wrap" delay={100}><span className="eyebrow">{call?'CALLBACK DETAILS':'PROJECT DETAILS'}</span><h2>{call?'When should we reach you?':'Send your enquiry.'}</h2><LeadForm kind={call?'call':quote?'quote':'enquiry'} compact product={params.get('product')||''} sport={params.get('sport')||''} service={params.get('service')||''}/></Reveal></section></>}

export function FinderPage(){const{items}=useApiList('/products',fallbackProducts);const{items:sports}=useApiList('/sports',fallbackSports);const[sport,setSport]=useState(''),[application,setApplication]=useState(''),[step,setStep]=useState(1);const apps=[...new Set(items.filter(p=>!sport||p.sport.toLowerCase()===sport.toLowerCase()).flatMap(p=>p.applications||[]))];const choices=apps.length?apps:['Discuss an application with Crome India'];const results=items.filter(p=>(!sport||p.sport.toLowerCase()===sport.toLowerCase())&&(!application||application==='DISCUSS'||p.applications?.some(a=>a.toLowerCase()===application.toLowerCase())));return <><PageHero eyebrow="SURFACE FINDER" title="Find a starting point for your surface conversation." copy="Select your sport and intended application. The finder uses products currently configured in the Crome India catalogue."/><section className="section finder-layout"><Reveal className="finder-form"><span className="eyebrow">STEP {step} OF 2</span><h2>{step===1?'What sport is the project for?':'How will the surface be used?'}</h2>{step===1?<div className="finder-options">{sports.map(s=><button key={s.slug} className={sport===s.name?'selected':''} onClick={()=>{setSport(s.name);setApplication('')}}>{s.name}{sport===s.name&&<Check size={16}/>}</button>)}</div>:<div className="finder-options">{choices.map(x=><button key={x} className={application===x?'selected':''} onClick={()=>setApplication(apps.length?x:'DISCUSS')}>{x}{application===x&&<Check size={16}/>}</button>)}</div>}<div className="finder-controls">{step===2&&<button className="button button-secondary" onClick={()=>setStep(1)}>Back</button>}<button className="button button-primary" disabled={step===1&&!sport} onClick={()=>step===1?setStep(2):document.getElementById('finder-results')?.scrollIntoView({behavior:'smooth'})}>{step===1?'Continue':'See matching products'} <ArrowRight size={16}/></button></div></Reveal><Reveal as="aside" className="finder-note" delay={80}><span className="eyebrow">APPLICATION &rarr; SPECIFICATION &rarr; PRODUCT</span><h3>A recommendation depends on the project.</h3><p>This finder narrows the catalogue by sport and application. It does not determine technical suitability or replace a project discussion.</p></Reveal></section><section id="finder-results" className="section finder-results"><SectionHeading eyebrow="CATALOGUE MATCHES" title={results.length?`${results.length} product${results.length===1?'':'s'} to explore.`:'Talk with Crome India about your project.'} copy={results.length?'These records match the selection you made. Review the available details and ask our team about suitability.':'No current product record matches every selection. The team can discuss surface options for your application.'}/>{results.length?<StaggerGrid className="product-grid">{withUniqueImages(results,p=>p.images?.[0]?.url||productImage(p)).map(({item:p,hideImage})=><ProductCard key={p._id||p.slug} product={p} hideImage={hideImage}/>)}</StaggerGrid>:<LinkButton/>}<div className="finder-lead"><h3>Need help assessing the application?</h3><LeadForm kind="product-finder" sport={sport} application={application==='DISCUSS'?'':application}/></div></section></>}

export function LegalPage({kind}){const privacy=kind.toLowerCase().includes('privacy');return <><PageHero eyebrow="CROME INDIA" title={kind} copy={privacy?'How information submitted through this website is used.':'Information about using the Crome India website and product catalogue.'}/><section className="section legal-copy">{privacy?<><h2>Information you choose to share</h2><p>When you submit an enquiry or request a call, this website collects the details you enter, which may include your name, company, phone number, email, city, project type, sport, product interest, approximate area and message. The Crome India team uses these details to understand and respond to your request and to manage related follow-up in its enquiry system.</p><h2>Website interaction events</h2><p>The website records limited interaction events such as selecting WhatsApp, opening the product assistant or choosing an enquiry action. Event records can include the page, destination and the product or sport being viewed. They are not designed to include your name, phone number or email address.</p><h2>Assistant and external services</h2><p>If the Crome Surface Assistant is enabled, your chat messages are sent to the Crome India server and may be processed by its configured AI service to prepare a reply using approved Crome India information. Do not include sensitive personal or financial information in a chat. WhatsApp, telephone and email links open services outside this website; their providers handle information under their own terms.</p><h2>Questions about an enquiry</h2><p>For questions about information you submitted through this website, contact <a href="mailto:sales@cromeindia.com">sales@cromeindia.com</a> or call <a href="tel:+919663556752">+91 96635 56752</a>.</p></>:<><h2>Product information</h2><p>The catalogue presents product details and specifications recorded by Crome India. Missing fields are not implied. Confirm application, specification, pricing, availability and project requirements directly with the team before making procurement decisions.</p><h2>Enquiries and quotations</h2><p>Submitting a form starts an enquiry and does not itself create an order or contract. Any commercial terms, product selection, quantities, scope and timing need confirmation in a written quotation or other agreement from Crome India.</p><h2>Website materials</h2><p>Product names, descriptions and other website materials are provided for exploring Crome India's sports-surface offering. Approved project and product imagery will be added by the Crome India team as available.</p><h2>Contact</h2><p>For questions about the website or a product enquiry, contact <a href="mailto:sales@cromeindia.com">sales@cromeindia.com</a> or call <a href="tel:+919663556752">+91 96635 56752</a>.</p></>}<LinkButton to="/contact">Contact Crome India</LinkButton></section></>}
export function NotFoundPage(){return <section className="not-found"><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>We can't find that page.</h1><p>The link may have changed. Continue exploring Crome India's sports surfaces and solutions.</p><div><LinkButton to="/">Go to homepage</LinkButton><Link className="text-link" to="/sports">Browse sports solutions <ArrowRight size={16}/></Link></div></section>}

export default {HomePage,AboutPage,SportsPage,SportPage,ProductsPage,ProductPage,ServicesPage,GalleryPage,ContactPage,FinderPage,LegalPage,NotFoundPage};
