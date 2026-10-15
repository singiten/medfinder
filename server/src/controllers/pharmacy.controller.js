import mongoose from 'mongoose';
import Pharmacy from '../models/Pharmacy.js';
import Stock from '../models/Stock.js';

const MAX_RADIUS_KM = 50;

export async function nearbyPharmacies(req, res, next) {
  try {
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const radiusRaw = parseFloat(req.query.radius);
    const radiusKm = Number.isFinite(radiusRaw)
      ? Math.min(Math.max(radiusRaw, 0.1), MAX_RADIUS_KM)
      : 10;
    const medicineId = req.query.medicineId;

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return res.status(400).json({ error: 'Valid "lng" and "lat" query parameters are required' });
    }
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({ error: 'Coordinates out of range' });
    }
    if (medicineId && !mongoose.Types.ObjectId.isValid(medicineId)) {
      return res.status(400).json({ error: 'Invalid medicineId' });
    }

    // Stage 1 — geospatial search
    const pharmacies = await Pharmacy.find({
      status: 'approved',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,
        },
      },
    }).lean();

    if (pharmacies.length === 0) {
      return res.json({
        results: [],
        count: 0,
        query: { lng, lat, radiusKm, medicineId: medicineId || null },
      });
    }

    // Stage 2 — stock lookup (only if medicineId given)
    let pharmacyIds = pharmacies.map((p) => p._id);
    let stockByPharmacy = new Map();

    if (medicineId) {
      const stocks = await Stock.find({
        pharmacyId: { $in: pharmacyIds },
        medicineId,
        isActive: true,
      }).lean();

      for (const s of stocks) {
        stockByPharmacy.set(s.pharmacyId.toString(), s);
      }

      // Filter to only pharmacies that have this medicine
      pharmacyIds = pharmacyIds.filter((id) => stockByPharmacy.has(id.toString()));
    }

    // Compute distances in Node (MongoDB doesn't return them by default with .find())
    const results = pharmacies
      .filter((p) => pharmacyIds.some((id) => id.equals(p._id)))
      .map((p) => {
        const distanceKm = haversineKm(lat, lng, p.location.coordinates[1], p.location.coordinates[0]);
        const stockDoc = stockByPharmacy.get(p._id.toString());

        return {
          pharmacy: {
            id: p._id.toString(),
            name: p.name,
            address: p.address,
            phone: p.phone || null,
            location: p.location,
          },
          distanceKm: Math.round(distanceKm * 100) / 100,
          stock: stockDoc
            ? {
                quantity: stockDoc.quantity,
                verificationMethod: stockDoc.verificationMethod,
                verifiedAt: stockDoc.verifiedAt,
                expiryDate: stockDoc.expiryDate || null,
              }
            : null,
        };
      });

    res.json({
      results,
      count: results.length,
      query: { lng, lat, radiusKm, medicineId: medicineId || null },
    });
  } catch (err) {
    next(err);
  }
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}