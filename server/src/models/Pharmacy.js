import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (coords) => Array.isArray(coords) && coords.length === 2,
          message: 'coordinates must be an array of [longitude, latitude]',
        },
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

pharmacySchema.index({ location: '2dsphere' });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

export default Pharmacy;