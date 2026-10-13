import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not set. Check your .env file.');
  }

  mongoose.connection.on('connected', () => {
    console.log('[medfinder] MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[medfinder] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[medfinder] MongoDB disconnected');
  });

  await mongoose.connect(uri);
}