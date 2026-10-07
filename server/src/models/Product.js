import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 140 },
  slug: { type: String, required: true, unique: true, index: true },
  brand: { type: String, default: 'Bellin', trim: true, maxlength: 100 },
  sport: { type: String, required: true, trim: true, index: true },
  category: { type: String, required: true, trim: true, index: true },
  shortDescription: { type: String, maxlength: 320 },
  fullDescription: { type: String, maxlength: 5000 },
  highlightText: { type: String, maxlength: 400 },
  pileHeightMm: { type: Number, min: 0 },
  specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
  applications: [String],
  technicalFeatures: [String],
  images: [{ url: String, altText: String, sortOrder: { type: Number, default: 0 } }],
  videoUrl: String,
  technicalPdfUrl: String,
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: false, index: true },
  displayOrder: { type: Number, default: 0, index: true },
  seo: { title: String, description: String },
  deletedAt: Date,
}, { timestamps: true });

productSchema.index({ published: 1, sport: 1, pileHeightMm: 1, displayOrder: 1 });
export default mongoose.model('Product', productSchema);
