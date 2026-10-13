import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    genericName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    brandNames: {
      type: [String],
      default: [],
    },
    aliases: {
      type: [String],
      default: [],
    },
    form: {
      type: String,
      required: true,
      enum: ['tablet', 'capsule', 'syrup', 'suspension', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'other'],
    },
    strength: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

medicineSchema.index({ name: 'text', genericName: 'text', brandNames: 'text', aliases: 'text' });

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;