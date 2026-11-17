import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { products, sports, services, settings } from '../src/data/content.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const shell=await fs.readFile(path.join(root,'index.html'),'utf8');
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pages=[
  {url:'/',title:'Premium Sports Surfaces & Sports Infrastructure',heading:'Surfaces built around the sport.',copy:'Premium sports-surface solutions for football, cricket, hockey, tennis, multisport and professional sports spaces.'},
  {url:'/about',title:'About Crome India',heading:'Premium surfaces. Exceptional spaces.',copy:'Crome India supports sports-surface and sports-infrastructure requirements with application-specific product information and professional enquiry support.'},
  {url:'/sports',title:'Sports Surface Solutions',heading:'Start with the sport. Explore the surface.',copy:'Explore sports applications and review products configured in the Crome India catalogue.'},
  ...sports.map(s=>({url:`/sports/${s.slug}`,title:`${s.name} Sports Surfaces`,heading:s.heroTitle||`${s.name.toUpperCase()} SURFACES`,copy:s.heroSubtitle||`Explore surface options for ${s.name.toLowerCase()} applications.`})),
  {url:'/products',title:'Sports Surface Products',heading:'Explore products by sport and specification.',copy:'Review Crome India product records and compare available factual specifications.'},
  ...products.map(p=>({url:`/products/${p.slug}`,title:`${p.name} | ${p.category||p.sport}`,heading:p.name,copy:p.shortDescription||'Explore this Crome India sports turf and surface product and discuss its application with our team.'})),
  {url:'/services',title:'Sports Surface Solutions & Services',heading:'From application to specification.',copy:'From understanding the application to selecting the appropriate surface specification.'},
  ...services.map(s=>({url:`/services/${s.slug}`,title:s.title,heading:s.title,copy:s.description})),
  {url:'/gallery',title:'Sports Surface Gallery',heading:'A closer look at sports surfaces.',copy:'Browse approved project, product and surface images added by the Crome India team.'},
  {url:'/contact',title:'Contact Crome India',heading:'Let’s discuss your sports-surface requirement.',copy:`Contact Crome India at ${settings.phones[0]} or ${settings.email}.`},
  {url:'/request-quote',title:'Request a Sports Surface Quote',heading:'Tell us about your project.',copy:'Share a few project details to help the Crome India team understand your requirement.'},
  {url:'/request-call',title:'Request a Call',heading:'Request a call from our team.',copy:'Share your phone number, location and a convenient time for a follow-up.'},
  {url:'/find-your-surface',title:'Find a Sports Surface',heading:'Find a starting point for your surface conversation.',copy:'Select a sport and application to browse matching records in the current Crome India catalogue.'},
  {url:'/privacy-policy',title:'Privacy Policy',heading:'Privacy policy',copy:'How information submitted through this website is used.'},
  {url:'/terms',title:'Terms of Use',heading:'Terms of use',copy:'Information about using the Crome India website and product catalogue.'},
];
const org={'@context':'https://schema.org','@type':'Organization',name:'Crome India',url:'https://cromeindiagroup.com',email:settings.email,telephone:'+91 96635 56752',address:{'@type':'PostalAddress',streetAddress:'E5, Dhi Innovations, Bannerghatta Road, Venugopal Reddy Layout, Arekere',addressLocality:'Bengaluru',addressRegion:'Karnataka',postalCode:'560076',addressCountry:'IN'},areaServed:settings.markets};
for(const page of pages){const title=`${page.title} | Crome India`,canonical=`https://cromeindiagroup.com${page.url}`,main=`<main><nav aria-label="Breadcrumb"><a href="/">Home</a>${page.url==='/'?'':` / ${escape(page.title)}`}</nav><h1>${escape(page.heading)}</h1><p>${escape(page.copy)}</p><p><a href="/sports">Explore sports surfaces</a> · <a href="/products">Browse products</a> · <a href="/request-quote">Request a quote</a></p></main>`;let html=shell.replace(/<title>[^<]*<\/title>/,`<title>${escape(title)}</title>`).replace(/<meta name="description" content="[^"]*"\s*\/?\s*>/,`<meta name="description" content="${escape(page.copy)}"/>`).replace(/<link rel="canonical" href="[^"]*"\s*\/?\s*>/,`<link rel="canonical" href="${canonical}"/>`).replace(/<meta property="og:title" content="[^"]*"\s*\/?\s*>/,`<meta property="og:title" content="${escape(title)}"/>`).replace(/<meta property="og:description" content="[^"]*"\s*\/?\s*>/,`<meta property="og:description" content="${escape(page.copy)}"/>`).replace(/<meta property="og:url" content="[^"]*"\s*\/?\s*>/,`<meta property="og:url" content="${canonical}"/>`);
  if(page.url.startsWith('/products/')){const product=products.find(p=>page.url.endsWith(p.slug));const productSchema={'@context':'https://schema.org','@type':'Product',name:product?.name,description:product?.shortDescription,category:product?.category,brand:product?.brand?{'@type':'Brand',name:product.brand}:undefined};html=html.replace('</head>',`<script type="application/ld+json">${JSON.stringify(productSchema).replace(/</g,'\\u003c')}</script></head>`)}
  html=html.replace('<div id="root"></div>',`<div id="root">${main}</div>`);const destination=page.url==='/'?path.join(root,'index.html'):path.join(root,page.url.slice(1),'index.html');await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,html)}
console.info(`Prerendered ${pages.length} Crome India routes, including ${products.length} products and ${sports.length} sports pages.`);

/* ── Static sitemap.xml + robots.txt so Vercel serves them at the site root ──
   (the Express backend also serves dynamic versions for the Render deployment). */
const base='https://cromeindiagroup.com';
const priorityFor=url=>url==='/'?'1.0':/^\/(sports|products)$/.test(url)?'0.9':/^\/(about|services|contact|request-quote)$/.test(url)?'0.8':/^\/(sports|products|services)\//.test(url)?'0.7':/^\/(gallery|find-your-surface|request-call)$/.test(url)?'0.6':'0.3';
const changefreqFor=url=>url==='/'||/^\/(sports|products)$/.test(url)?'weekly':/^\/(privacy-policy|terms)$/.test(url)?'yearly':'monthly';
const now=new Date().toISOString();
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(page=>`  <url><loc>${base}${page.url==='/'?'/':page.url}</loc><lastmod>${now}</lastmod><changefreq>${changefreqFor(page.url)}</changefreq><priority>${priorityFor(page.url)}</priority></url>`).join('\n')}\n</urlset>\n`;
await fs.writeFile(path.join(root,'sitemap.xml'),sitemap);
const robots=`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\n\nSitemap: ${base}/sitemap.xml\n`;
await fs.writeFile(path.join(root,'robots.txt'),robots);
console.info(`Wrote sitemap.xml (${pages.length} URLs) and robots.txt for ${base}.`);
