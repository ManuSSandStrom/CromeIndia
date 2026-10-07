import mongoose from 'mongoose';

const productCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, maxlength: 500 },
  active: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  deletedAt: Date,
}, { timestamps: true });

export default mongoose.model('ProductCategory', productCategorySchema);
