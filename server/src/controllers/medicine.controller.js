import Medicine from '../models/Medicine.js';

export async function createMedicine(req, res, next) {
  try {
    const { name, genericName, brandNames, aliases, form, strength, category } = req.body;

    const medicine = await Medicine.create({
      name,
      genericName,
      brandNames,
      aliases,
      form,
      strength,
      category,
    });

    res.status(201).json({ medicine });
  } catch (err) {
    next(err);
  }
}