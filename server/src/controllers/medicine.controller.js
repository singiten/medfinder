import Medicine from '../models/Medicine.js';

import { generateAliases } from '../services/alias.service.js';
export async function createMedicine(req, res, next) {
  try {
    const { name, genericName, brandNames, aliases, form, strength, category } = req.body;

    const generatedAliases = generateAliases({ name, genericName, brandNames });
    const mergedAliases = Array.from(new Set([...(aliases || []), ...generatedAliases]));

    const medicine = await Medicine.create({
      name,
      genericName,
      brandNames,
      aliases: mergedAliases,
      form,
      strength,
      category,
    });

    res.status(201).json({ medicine });
  } catch (err) {
    next(err);
  }
}
export async function searchMedicines(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    const limitRaw = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 20;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const results = await Medicine.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();

    const shaped = results.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      genericName: m.genericName,
      brandNames: m.brandNames || [],
      form: m.form,
      strength: m.strength,
      score: m.score,
    }));

    res.json({ results: shaped, count: shaped.length, query: q });
  } catch (err) {
    next(err);
  }
}