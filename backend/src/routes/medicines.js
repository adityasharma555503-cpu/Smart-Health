import { Router } from 'express';
import Medicine from '../models/Medicine.js';
import HealthCentre from '../models/HealthCentre.js';
import { forecastMedicine } from '../utils/analytics.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.centreId) filter.centre = req.query.centreId;
    const medicines = await Medicine.find(filter).populate('centre', 'name code district').sort({ name: 1 }).lean();
    res.json({ data: medicines.map(forecastMedicine) });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const centreExists = await HealthCentre.exists({ _id: req.body.centre });
    if (!centreExists) return res.status(400).json({ message: 'Choose a valid health centre.' });
    const created = await Medicine.create(req.body);
    const populated = await created.populate('centre', 'name code district');
    res.status(201).json({ data: forecastMedicine(populated.toObject()) });
  } catch (error) { next(error); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['name', 'genericName', 'category', 'unit', 'stock', 'reorderLevel', 'dailyConsumption', 'unitCost', 'expiryDate', 'lastUpdatedBy'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (updates.genericName) updates.genericName = updates.genericName.toLowerCase().trim();
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true }).populate('centre', 'name code district').lean();
    if (!medicine) return res.status(404).json({ message: 'Medicine record not found' });
    res.json({ data: forecastMedicine(medicine) });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine record not found' });
    res.json({ message: 'Medicine deleted' });
  } catch (error) { next(error); }
});

export default router;
