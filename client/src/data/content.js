export const productCategories = [
  'Football Turf','Cricket Turf','Hockey Turf','Multisport Turf','Sports Surface','Tennis Surfaces','Badminton Surfaces','Squash Surfaces','Running / Athletic Surfaces','Gym Flooring','Acrylic Sports Surfaces','Indoor Sports Flooring','Shock Pads','Sports Surface Accessories','Related Surface Materials',
].map((name, displayOrder) => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''), displayOrder, active: ['Football Turf','Cricket Turf','Hockey Turf','Multisport Turf','Sports Surface'].includes(name) }));

export const sports = [
  { name:'Football', slug:'football', active:true, featured:true, displayOrder:0, heroTitle:'FOOTBALL SURFACES', heroSubtitle:'Built around the game. Selected around the specification.', applications:['Sports arenas','Futsal facilities','Football academies','Schools and clubs'] },
  { name:'Cricket', slug:'cricket', active:true, featured:true, displayOrder:1, heroTitle:'CRICKET SURFACES', heroSubtitle:'From practice facilities to sports centres, start with the right surface specification.', applications:['Cricket practice areas','Cricket academies','Sports centres','Schools and institutions','Training facilities'] },
  { name:'Hockey', slug:'hockey', active:true, featured:true, displayOrder:2, heroTitle:'HOCKEY SURFACES', heroSubtitle:'Explore hockey-specific surface options and product specifications.', applications:['Hockey facilities','Sports centres','Institutions'] },
  { name:'Tennis', slug:'tennis', active:false, displayOrder:3, heroTitle:'TENNIS SURFACES', heroSubtitle:'Discuss surface options for your tennis project.' },
  { name:'Badminton', slug:'badminton', active:false, displayOrder:4, heroTitle:'BADMINTON SURFACES', heroSubtitle:'Discuss surface options for your badminton project.' },
  { name:'Squash', slug:'squash', active:false, displayOrder:5, heroTitle:'SQUASH SURFACES', heroSubtitle:'Discuss surface options for your squash project.' },
  { name:'Running / Athletics', slug:'running-athletics', active:false, displayOrder:6, heroTitle:'RUNNING & ATHLETIC SURFACES', heroSubtitle:'Discuss surface options for your running or athletics project.' },
  { name:'Gym', slug:'gym', active:false, displayOrder:7, heroTitle:'GYM & FITNESS FLOORING', heroSubtitle:'Discuss surface options for your gym or fitness project.' },
  { name:'Multisport', slug:'multisport', active:true, featured:true, displayOrder:8, heroTitle:'MULTISPORT SURFACES', heroSubtitle:'Start with the application. Then compare the specification.' },
];

export const products = [
  { name:'Bellin Prestige', slug:'bellin-prestige', brand:'Bellin', sport:'Football', category:'Football Turf', pileHeightMm:50, shortDescription:'A key football turf in the Crome India range.', highlightText:'The Bellin Prestige football turf series is highly sold in the European market.', featured:true, published:true, displayOrder:0, applications:['Football','Sports facilities'] },
  { name:'Bellin Prestige Pro', slug:'bellin-prestige-pro', brand:'Bellin', sport:'Football', category:'Football Turf', shortDescription:'Football turf product. Ask Crome India for the current specification.', published:true, displayOrder:1 },
  { name:'Bellin Prestige Pro Classic', slug:'bellin-prestige-pro-classic', brand:'Bellin', sport:'Football', category:'Football Turf', shortDescription:'Football turf product. Ask Crome India for the current specification.', published:true, displayOrder:2 },
  { name:'Bellin Prestige Pro Premium', slug:'bellin-prestige-pro-premium', brand:'Bellin', sport:'Football', category:'Football Turf', shortDescription:'Football turf product. Ask Crome India for the current specification.', published:true, displayOrder:3 },
  { name:'Bellin Diamond', slug:'bellin-diamond', brand:'Bellin', sport:'Football', category:'Football Turf', shortDescription:'Football turf product. Ask Crome India for the current specification.', published:true, displayOrder:4 },
  { name:'Bellin Non Infill', slug:'bellin-non-infill', brand:'Bellin', sport:'Sports turf', category:'Sports Surface', shortDescription:'Surface product. Contact Crome India to discuss its application and current specification.', published:true, displayOrder:5 },
  { name:'Bellin Hockey Supreme', slug:'bellin-hockey-supreme', brand:'Bellin', sport:'Hockey', category:'Hockey Turf', pileHeightMm:18, applications:['Hockey facilities','Sports centres','Institutions'], shortDescription:'Hockey surface product. Ask Crome India for the current specification and approved certification details.', published:true, displayOrder:6 },
  { name:'Cricket Turf', slug:'cricket-turf', brand:'Bellin', sport:'Cricket', category:'Cricket Turf', pileHeightMm:9, applications:['Cricket practice areas','Cricket academies','Sports centres','Schools and institutions','Training facilities'], specifications:{ yarn:'Fibrillated yarn', gauge:'3/16' }, shortDescription:'Cricket turf for practice and related facilities.', published:true, displayOrder:7 },
  { name:'Multisport Turf 7 mm', slug:'multisport-turf-7-mm', brand:'Bellin', sport:'Multisport', category:'Multisport Turf', pileHeightMm:7, shortDescription:'Compare this specification against the requirements of your application.', published:true, displayOrder:8 },
  { name:'Multisport Turf 15 mm', slug:'multisport-turf-15-mm', brand:'Bellin', sport:'Multisport', category:'Multisport Turf', pileHeightMm:15, shortDescription:'Compare this specification against the requirements of your application.', published:true, displayOrder:9 },
];

export const services = [
  { title:'Sports surface consultation', slug:'sports-surface-consultation', description:'Discuss sport, application, project size, usage and surface requirements with the Crome India team.' },
  { title:'Product & specification guidance', slug:'product-specification-guidance', description:'Understand pile height, yarn, gauge, density, Dtex, backing and surface construction.' },
  { title:'Football surface solutions', slug:'football-surface-solutions', description:'Explore Bellin Prestige and other football systems available from Crome India.' },
  { title:'Cricket surface solutions', slug:'cricket-surface-solutions', description:'Cricket turf options for academies, institutions, sports centres and related projects.' },
  { title:'Multisport surface solutions', slug:'multisport-surface-solutions', description:'Compare surface options against the needs of your multisport environment.' },
  { title:'Hockey surface solutions', slug:'hockey-surface-solutions', description:'Hockey-specific product solutions where available.' },
  { title:'Court & indoor sports surfaces', slug:'court-indoor-sports-surfaces', description:'Discuss tennis, badminton, squash, acrylic and indoor sports flooring requirements.' },
  { title:'Running & athletic surfaces', slug:'running-athletic-surfaces', description:'Share the requirements for your running or athletics surface enquiry.' },
  { title:'Gym & fitness flooring', slug:'gym-fitness-flooring', description:'Discuss surface options for gym and fitness environments where products are available.' },
  { title:'B2B product supply', slug:'b2b-product-supply', description:'Enquiry support for sports infrastructure companies, installers, dealers, contractors, builders and institutions.' },
  { title:'Project requirement support', slug:'project-requirement-support', description:'Share sport, project type, location, area, surface, specification and timeline.' },
];

export const serviceDetails = {
  'sports-surface-consultation': { imageKeys:['surface-consultation'], heading:'Plan the surface around the project.', detail:'Start with the sport, intended use, project location and approximate area. The team can use those details to guide a focused discussion about suitable product information.', points:['Sport and playing use','Project type, location and area','Surface requirements and timeline'] },
  'product-specification-guidance': { imageKeys:['turf-macro-detail'], heading:'Understand the specification fields.', detail:'Review the product information recorded for pile height, yarn, gauge, density, Dtex, backing and construction. Ask the team to confirm any field that is missing from the catalogue.', points:['Pile height and yarn','Gauge, density and Dtex','Backing and construction details'] },
  'football-surface-solutions': { imageKeys:['football-turf','bellin-prestige-hero'], heading:'Explore football turf options.', detail:'Review football surface options and the Bellin Prestige product information currently listed by Crome India. Share how the facility will be used to discuss the project requirement.', points:['Football turf catalogue','Bellin Prestige product information','Facility use and project requirements'] },
  'cricket-surface-solutions': { imageKeys:['cricket-turf'], heading:'Discuss cricket practice surfaces.', detail:'Explore cricket turf options for academies, institutions, sports centres and training facilities. The current Cricket Turf record includes 9 mm pile height, fibrillated yarn and 3/16 gauge.', points:['Cricket practice and training','Academies and institutions','Recorded product specifications'] },
  'multisport-surface-solutions': { imageKeys:['multisport-surface'], heading:'Compare multisport applications.', detail:'Discuss the sports, usage and setting planned for a multisport space, then review the product information currently recorded for the application.', points:['Intended sports and activities','Indoor or outdoor setting','Available multisport product records'] },
  'hockey-surface-solutions': { imageKeys:['hockey-turf'], heading:'Review hockey surface options.', detail:'Explore the hockey surface product information currently listed and share details about the facility and its intended use.', points:['Hockey facilities','Sports centres and institutions','Available hockey product details'] },
  'court-indoor-sports-surfaces': { imageKeys:['tennis-surface','badminton-surface','squash-surface'], heading:'Explore court and indoor surfaces.', detail:'Discuss the specific court sport and indoor flooring needs. Crome India can review the application and confirm which product options are currently available.', points:['Tennis court surfaces','Badminton and squash courts','Indoor sports flooring requirements'] },
  'running-athletic-surfaces': { imageKeys:['running-athletics-surface'], heading:'Plan a running or athletics surface.', detail:'Share the activity, facility setting and project details so the team can discuss the relevant running or athletics surface requirement.', points:['Running and athletics use','Facility setting and area','Project specification questions'] },
  'gym-fitness-flooring': { imageKeys:['gym-flooring'], heading:'Discuss gym and fitness flooring.', detail:'Describe the training activities and facility setting to discuss gym and fitness flooring options currently available from Crome India.', points:['Gym and fitness activities','Facility type and intended use','Available flooring options'] },
  'b2b-product-supply': { imageKeys:['sports-infrastructure-b2b','turf-rolls-warehouse'], heading:'Coordinate a sports-surface supply enquiry.', detail:'Share the products or surface category, project location, estimated quantities and delivery requirements. The team can review supply details for the specific project.', points:['Installer, contractor or dealer requirements','Product and estimated quantity','Project location and requested timeline'] },
  'project-requirement-support': { imageKeys:['contact-project','school-sports-facility','sports-arena'], heading:'Share the details of your project.', detail:'Provide the sport, project type, location, approximate area, intended use and timeline. These details help the team understand what information to prepare for your enquiry.', points:['Sport and project type','Location and approximate area','Surface needs and timeline'] },
};

export { projectGalleryItems as galleryItems } from './images.js';
export const settings = {
  name:'Crome India', companyName:'Crome India', category:'Sports Surfaces / Sports Infrastructure',
  positioning:'Premium Surfaces. Exceptional Spaces.', email:'sales@cromeindia.com',
  phones:['9663556752'], whatsapp:'919663556752',
  office:'E5, Dhi Innovations, Bannerghatta Road, Venugopal Reddy Layout, Arekere, Bengaluru, Karnataka 560076',
  warehouse:'No. 93/7B, Mylasandra Road, Near GIBS Business School, Akshayanagar, Mylasandra, Karnataka 560114',
  marketCopy:'Serving sports-surface requirements across key South Indian markets.',
  markets:['Bangalore','Chennai','Hyderabad','Mysore','Coimbatore','Hubballi','Mangalore','Kerala region'],
  social:{ instagram:'https://www.instagram.com/cromeindia.sports?stkn=OXc2NmhzMHdheHdh', facebook:'', linkedin:'' },
};
