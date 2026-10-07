import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true, maxlength: 300 },
  answer: { type: String, required: true, maxlength: 2500 },
  category: { type: String, default: 'General' },
  published: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  deletedAt: Date,
}, { timestamps: true });

export default mongoose.model('FAQ', faqSchema);
