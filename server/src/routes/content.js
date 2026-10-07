import { Router } from 'express';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import GalleryItem from '../models/GalleryItem.js';
import SiteSettings from '../models/SiteSettings.js';
import Product from '../models/Product.js';
import ProductCategory from '../models/ProductCategory.js';
import Sport from '../models/Sport.js';
import FAQ from '../models/FAQ.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';
import Media from '../models/Media.js';
import { requireAdmin } from '../middleware/auth.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const router = Router();
const uploadRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');
const adminModels = { services: Service, projects: Project, gallery: GalleryItem, products: Product, categories: ProductCategory, sports: Sport, faqs: FAQ, media: Media };
const publicLists = [
  ['/services', Service], ['/projects', Project], ['/gallery', GalleryItem],
  ['/products', Product], ['/categories', ProductCategory], ['/sports', Sport], ['/faqs', FAQ], ['/media', Media],
];
const allowedData = (Model, input) => {
  const allowed = Object.keys(Model.schema.paths).filter(key => !['_id', '__v', 'createdAt', 'updatedAt', 'deletedAt'].includes(key));
  return Object.fromEntries(Object.entries(input || {}).filter(([key]) => allowed.includes(key)));
};
router.post('/analytics/events', async (req,res,next)=>{
  try{
    const allowed=['whatsapp_click','assistant_open','quote_click','call_click'];
    if(!allowed.includes(req.body?.event))return res.status(400).json({success:false,message:'Unsupported event.'});
    const page=typeof req.body.page==='string'?req.body.page.slice(0,300):'';
    const target=typeof req.body.target==='string'?req.body.target.slice(0,140):'';
    const metadata={};for(const key of ['product','sport'])if(typeof req.body?.metadata?.[key]==='string')metadata[key]=req.body.metadata[key].slice(0,100);
    await AnalyticsEvent.create({event:req.body.event,page,target,metadata});
    res.status(202).json({success:true});
  }catch(error){next(error)}
});
const visibleFilter = (path, query = {}) => {
  const filter = { deletedAt: null };
  if (['/services', '/projects', '/gallery', '/products', '/faqs', '/media'].includes(path)) filter.published = true;
  if (path === '/categories') filter.active = true;
  if (path === '/products') {
    if (query.sport) filter.sport = new RegExp(`^${String(query.sport).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    if (query.category) filter.category = query.category;
    if (query.pileHeight) filter.pileHeightMm = Number(query.pileHeight);
    if (query.featured === 'true') filter.featured = true;
  }
  if (path === '/gallery' && query.category && query.category !== 'All') filter.category = query.category;
  if (path === '/faqs' && query.category) filter.category = query.category;
  return filter;
};

router.get('/admin/content/:type', requireAdmin, async (req, res, next) => {
  try {
    const Model = adminModels[req.params.type];
    if (!Model) return res.status(404).json({ success: false, message: 'Content type not found.' });
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const [items, total] = await Promise.all([
      Model.find({ deletedAt: null }).sort({ displayOrder: 1, sortOrder: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Model.countDocuments({ deletedAt: null }),
    ]);
    res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});

// Accept a single raw image upload; inspect its bytes instead of trusting the browser MIME or file name.
router.post('/admin/media/upload', requireAdmin, async (req, res, next) => {
  try {
    const declared = Number(req.headers['content-length'] || 0);
    if (declared > 8 * 1024 * 1024) return res.status(413).json({ success: false, message: 'Images must be 8 MB or smaller.' });
    const chunks = []; let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 8 * 1024 * 1024) return res.status(413).json({ success: false, message: 'Images must be 8 MB or smaller.' });
      chunks.push(chunk);
    }
    const data = Buffer.concat(chunks);
    const signatures = [
      { ext: '.jpg', ok: b => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
      { ext: '.png', ok: b => b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) },
      { ext: '.webp', ok: b => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
      { ext: '.avif', ok: b => b.toString('ascii', 4, 8) === 'ftyp' && /^(avif|avis)$/.test(b.toString('ascii', 8, 12)) },
    ];
    const image = signatures.find(item => item.ok(data));
    if (!image || !data.length) return res.status(400).json({ success: false, message: 'Upload a valid JPG, PNG, WebP or AVIF image.' });
    await fs.mkdir(uploadRoot, { recursive: true });
    const filename = `${crypto.randomUUID()}${image.ext}`;
    await fs.writeFile(path.join(uploadRoot, filename), data, { flag: 'wx' });
    const mimeType={'.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.avif':'image/avif'}[image.ext];
    const record=await Media.create({url:`/media/${filename}`,filename,mimeType,size,title:'',altText:'',category:'Other',published:false});
    res.status(201).json({ success: true, data: record });
  } catch (error) { next(error); }
});

for (const [path, Model] of publicLists) {
  router.get(path, async (req, res, next) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(60, Number(req.query.limit) || 24);
      const filter = visibleFilter(path, req.query);
      if (path === '/projects') filter.slug = { $exists: true };
      const [items, total] = await Promise.all([
        Model.find(filter).sort({ featured: -1, displayOrder: 1, sortOrder: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Model.countDocuments(filter),
      ]);
      res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) } });
    } catch (error) { next(error); }
  });
  if (['/services', '/projects', '/products', '/sports'].includes(path)) {
    router.get(`${path}/:slug`, async (req, res, next) => {
      try {
        const filter = { slug: req.params.slug, deletedAt: null };
        if (path !== '/sports') filter.published = true;
        const item = await Model.findOne(filter).lean();
        if (!item) return res.status(404).json({ success: false, message: 'Content not found.' });
        res.json({ success: true, data: item });
      } catch (error) { next(error); }
    });
  }
  router.post(path, requireAdmin, async (req, res, next) => {
    try {
      const item = await Model.create(allowedData(Model, req.body));
      res.status(201).json({ success: true, data: item });
    } catch (error) { next(error); }
  });
  router.patch(`${path}/:id`, requireAdmin, async (req, res, next) => {
    try {
      const item = await Model.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, allowedData(Model, req.body), { new: true, runValidators: true });
      if (!item) return res.status(404).json({ success: false, message: 'Content not found.' });
      res.json({ success: true, data: item });
    } catch (error) { next(error); }
  });
  router.delete(`${path}/:id`, requireAdmin, async (req, res, next) => {
    try {
      const item = await Model.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, { deletedAt: new Date(), published: false, active: false }, { new: true });
      if (!item) return res.status(404).json({ success: false, message: 'Content not found.' });
      res.json({ success: true, message: 'Content archived.' });
    } catch (error) { next(error); }
  });
}

router.put('/settings', requireAdmin, async (req, res, next) => {
  try {
    const record = await SiteSettings.findOneAndUpdate({ key: 'main' }, { $set: { data: req.body } }, { new: true, upsert: true, runValidators: true });
    res.json({ success: true, data: record.data });
  } catch (error) { next(error); }
});
router.get('/settings', async (req, res, next) => {
  try {
    const record = await SiteSettings.findOne({ key: 'main' }).lean();
    res.json({ success: true, data: record?.data || {} });
  } catch (error) { next(error); }
});
router.put('/gallery/reorder', requireAdmin, async (req, res, next) => {
  try {
    const order = req.body.order;
    if (!Array.isArray(order) || order.length > 500 || order.some(item => !item.id || !Number.isInteger(item.sortOrder ?? item.displayOrder))) {
      return res.status(400).json({ success: false, message: 'Provide an ordered list of gallery items.' });
    }
    await GalleryItem.bulkWrite(order.map(item => ({ updateOne: { filter: { _id: item.id }, update: { $set: { sortOrder: item.sortOrder ?? item.displayOrder, displayOrder: item.sortOrder ?? item.displayOrder } } } })));
    res.json({ success: true, message: 'Gallery order saved.' });
  } catch (error) { next(error); }
});
router.put('/media/reorder', requireAdmin, async (req,res,next)=>{
  try{const order=req.body.order;if(!Array.isArray(order)||order.length>500||order.some(item=>!item.id||!Number.isInteger(item.sortOrder??item.displayOrder)))return res.status(400).json({success:false,message:'Provide an ordered list of media items.'});await Media.bulkWrite(order.map(item=>({updateOne:{filter:{_id:item.id},update:{$set:{displayOrder:item.sortOrder??item.displayOrder}}}})));res.json({success:true,message:'Media order saved.'})}catch(error){next(error)}
});

export default router;
