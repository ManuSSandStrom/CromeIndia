import 'dotenv/config';
import mongoose from 'mongoose';
import Service from '../src/models/Service.js';
import Product from '../src/models/Product.js';
import ProductCategory from '../src/models/ProductCategory.js';
import Sport from '../src/models/Sport.js';
import GalleryItem from '../src/models/GalleryItem.js';
import FAQ from '../src/models/FAQ.js';
import SiteSettings from '../src/models/SiteSettings.js';
import { productCategories, products, services, sports, settings } from '../../client/src/data/content.js';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
await mongoose.connect(process.env.MONGODB_URI);
try {
  const archivedAt = new Date();
  await Promise.all([
    Service.updateMany({ slug: { $in: ['cricket-infrastructure','sports-surfaces','facility-development','football-multi-sport','running-tracks','indoor-sports-flooring'] } }, { $set: { published: false, deletedAt: archivedAt } }),
    GalleryItem.updateMany({}, { $set: { published: false, deletedAt: archivedAt } }),
  ]);
  await Promise.all(services.map((item, displayOrder) => Service.updateOne(
    { slug: item.slug },
    { $setOnInsert: { title: item.title, slug: item.slug, shortDescription: item.description, fullDescription: item.description, displayOrder, published: true } },
    { upsert: true },
  )));
  await Promise.all(products.map(item => {
    const { applications = [], ...fields } = item;
    return Product.updateOne({ slug: item.slug }, { $set: { applications }, $setOnInsert: fields }, { upsert: true });
  }));
  await Promise.all(productCategories.map(item => {
    const { active = false, ...fields } = item;
    return ProductCategory.updateOne({ slug: item.slug }, { $set: { active }, $setOnInsert: fields }, { upsert: true });
  }));
  await Promise.all(sports.map(item => Sport.updateOne(
    { slug: item.slug }, { $setOnInsert: item }, { upsert: true },
  )));
  const faqs=[
    {question:'Which sports-surface products are listed by Crome India?',answer:'The current catalogue lists football turf, cricket turf, hockey turf and multisport turf products. Other sports pages are available for project enquiries; products are shown only when assigned in the catalogue.',category:'Products',published:true,displayOrder:0},
    {question:'How do I select a pile height?',answer:'Pile height is one part of a sports-surface specification. The appropriate choice depends on sport, application and project requirements. Contact Crome India for application-specific guidance.',category:'Specifications',published:true,displayOrder:1},
    {question:'What specifications are confirmed for Cricket Turf?',answer:'The current Crome India product record lists 9 mm pile height, fibrillated yarn and 3/16 gauge. Contact the team to confirm other details for your project.',category:'Specifications',published:true,displayOrder:2},
    {question:'Which locations does Crome India serve?',answer:'Crome India lists Chennai, Hyderabad, Mysuru, Coimbatore, Hubballi, Mangaluru and the Kerala region as key South Indian markets. The company is based in Bengaluru. These are service markets and do not imply a local branch office.',category:'Company',published:true,displayOrder:3},
  ];
  await Promise.all(faqs.map(item=>FAQ.updateOne({question:item.question},item.question==='Which locations does Crome India serve?'?{$set:item}:{$setOnInsert:item},{upsert:true})));
  await SiteSettings.updateOne({key:'main'},{$set:{data:settings}},{upsert:true});
  console.info(`Starter catalogue ready: ${products.length} products, ${productCategories.length} categories, ${sports.length} sports, ${services.length} services. No sample gallery photos were added.`);
} finally {
  await mongoose.disconnect();
}
