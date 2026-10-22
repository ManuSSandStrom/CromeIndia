import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, FileText } from 'lucide-react';
import { productImage, siteImages, sportImage } from '../data/images.js';

export function ImageSlot({ src, label = 'Sports surface', className = '' }) {
  return src
    ? <img className={`image-slot-image ${className}`} src={src} alt={label} loading="lazy" decoding="async" />
    : <div className={`image-slot ${className}`} role="img" aria-label={`${label} image not yet added`}><span className="image-slot-mark" aria-hidden="true"/><span>{label}</span><small>IMAGE LIBRARY</small></div>;
}

export function productSummary(product){
  const description=String(product?.shortDescription||'').trim();
  if(/^football turf product\. ask crome india for the current specification\.$/i.test(description))return `${product.name} is listed in the football turf range. Ask Crome India to confirm its current specification.`;
  if(/^compare this specification against the requirements of your application\.$/i.test(description))return `${product.name} is listed with a ${product.pileHeightMm||'recorded'} mm pile height. Request its complete technical details for your project.`;
  return description||'Contact Crome India for the current product specification.';
}

export function SectionHeading({ eyebrow, title, copy, action, link, to }) {
  const label = action || link;
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><div className="section-heading-side">{copy && <p>{copy}</p>}{label && <Link className="text-link" to={to || '/products'}>{label}<ArrowUpRight size={16}/></Link>}</div></div>;
}

export function ProductCard({ product, selected = false, onCompare, compareDisabled = false, hideImage = false }) {
  const specs = product.pileHeightMm ? `${product.pileHeightMm} mm pile height` : '';
  const image = product.images?.[0]?.url || productImage(product);
  return <article className={`product-card${hideImage?' is-image-hidden':''}`}>
    {!hideImage&&<Link className="product-card-image" to={`/products/${product.slug}`}><ImageSlot src={image?.url||image} label={image?.alt||product.name}/><span className="product-image-tag">{product.sport}</span><span className="product-open"><ArrowUpRight size={18}/></span></Link>}
    <div className="product-card-body"><div className="product-card-meta"><span>{product.category}</span>{product.featured && <span className="featured-label">FEATURED</span>}</div><h3><Link to={`/products/${product.slug}`}>{product.name}</Link></h3><p>{productSummary(product)}</p><div className="product-card-footer"><span>{specs || 'Specification on request'}</span><Link to={`/products/${product.slug}`} aria-label={`View ${product.name}`}><ArrowRight size={17}/></Link></div>{onCompare && <label className="compare-choice"><input type="checkbox" checked={selected} disabled={compareDisabled} onChange={onCompare}/> Compare specifications</label>}</div>
  </article>;
}

export function SpecificationList({ product }) {
  const known = [
    ['Pile height', product.pileHeightMm ? `${product.pileHeightMm} mm` : ''],
    ['Gauge', product.specifications?.gauge], ['Yarn type', product.specifications?.yarn],
    ['Dtex', product.specifications?.dtex], ['Density', product.specifications?.density],
    ['Stitch rate', product.specifications?.stitchRate], ['Backing', product.specifications?.backing],
    ['Roll width', product.specifications?.rollWidth], ['Roll length', product.specifications?.rollLength],
    ['Infill requirement', product.specifications?.infill], ['Application', product.applications?.join(', ') || product.sport],
    ['Certification', product.specifications?.certification], ['Recommended use', product.specifications?.recommendedUse],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');
  const standardKeys = new Set(['gauge','yarn','dtex','density','stitchRate','stitchrate','backing','rollWidth','rollwidth','rollLength','rolllength','infill','certification','recommendedUse','recommendeduse']);
  Object.entries(product.specifications || {}).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, first => first.toUpperCase());
    const hasValue=Array.isArray(value)?value.length>0:value!==undefined&&value!==null&&value!=='';
    if (hasValue && !standardKeys.has(key) && !known.some(([existing]) => existing.toLowerCase() === label.toLowerCase())) known.push([label, value]);
  });
  if (!known.length) return <div className="spec-empty"><FileText size={19}/><p>Detailed specifications are available from the Crome India team.</p></div>;
  return <dl className="spec-list">{known.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{Array.isArray(value) ? value.join(', ') : value}</dd></div>)}</dl>;
}

export function SportCard({ sport }) {
  const image = sportImage(sport);
  return <Link className="sport-card" to={`/sports/${sport.slug}`}><div className="sport-card-art"><ImageSlot src={image?.url||sport.imageUrl} label={image?.alt||`${sport.name} surface`}/><span className="sport-card-index">{String((sport.displayOrder ?? 0) + 1).padStart(2,'0')}</span></div><div className="sport-card-copy"><div><h3>{sport.name}</h3><span>{sport.active ? 'Explore solutions' : 'Discuss your application'}</span></div><ArrowUpRight size={18}/></div></Link>;
}

export function NamedImage({ name, className = '' }) {
  const image = siteImages[name];
  return image ? <ImageSlot src={image.url} label={image.alt} className={className}/> : null;
}

export function Breadcrumbs({ items = [] }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link>{items.map((item, index) => <span key={`${item.label}-${index}`}>{item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>;
}

export function PageHero({ eyebrow, title, copy, children, className = '' }) {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  const page = parts[0];
  let image = siteImages['sports-infrastructure-b2b'];
  if (page === 'sports' && parts[1]) image = sportImage({ slug: parts[1] }) || image;
  else if (page === 'services') image = siteImages[parts[1] ? 'south-india-sports' : 'sports-arena'];
  else if (page === 'products') image = siteImages['turf-rolls-warehouse'];
  else if (page === 'gallery') image = siteImages['sports-arena'];
  else if (page === 'about') image = siteImages['south-india-sports'];
  else if (['contact', 'request-quote', 'request-call'].includes(page)) image = siteImages['sports-arena'];
  else if (page === 'find-your-surface') image = siteImages['multisport-surface'];
  else if (['privacy-policy', 'terms'].includes(page)) image = siteImages['sports-infrastructure-b2b'];
  const backgroundImage = image?.url ? `url("${image.url}")` : undefined;
  return <section className={`page-hero page-hero-light page-hero-with-image ${className}`} style={{ backgroundImage }}><div className="page-hero-inner"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{copy && <p>{copy}</p>}{children}</div></section>;
}
