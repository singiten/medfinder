import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
      index: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    verificationMethod: {
      type: String,
      enum: ['photo', 'csv', 'manual', 'import'],
      required: true,
    },
    verifiedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    expiryDate: {
      type: Date,
    },
    batchNumber: {
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

stockSchema.index({ pharmacyId: 1, medicineId: 1 }, { unique: true });

const Stock = mongoose.model('Stock', stockSchema);

export default Stock;