import mongoose from 'mongoose';

const sportSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true, trim: true },
  heroTitle: { type: String, maxlength: 180 },
  heroSubtitle: { type: String, maxlength: 400 },
  description: { type: String, maxlength: 3000 },
  applications: [String],
  imageUrl: String,
  active: { type: Boolean, default: false, index: true },
  featured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  seo: { title: String, description: String },
  deletedAt: Date,
}, { timestamps: true });

sportSchema.index({ active: 1, displayOrder: 1 });
export default mongoose.model('Sport', sportSchema);
