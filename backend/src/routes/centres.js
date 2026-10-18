import { Router } from 'express';
import HealthCentre from '../models/HealthCentre.js';
import Medicine from '../models/Medicine.js';
import { assessCentre } from '../utils/analytics.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [centres, medicines] = await Promise.all([
      HealthCentre.find().sort({ district: 1, name: 1 }).lean(),
      Medicine.find().lean()
    ]);
    const result = centres.map(centre => {
      const centreMedicines = medicines.filter(m => String(m.centre) === String(centre._id));
      return { ...centre, assessment: assessCentre(centre, centreMedicines), medicineCount: centreMedicines.length };
    });
    res.json({ data: result });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const created = await HealthCentre.create(req.body);
    res.status(201).json({ data: created });
  } catch (error) { next(error); }
});

router.patch('/:id/operations', async (req, res, next) => {
  try {
    const allowed = ['patientsToday', 'avgPatientsPerDay', 'beds', 'doctors', 'tests'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    updates.lastReportedAt = new Date();
    const centre = await HealthCentre.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!centre) return res.status(404).json({ message: 'Health centre not found' });
    res.json({ data: centre });
  } catch (error) { next(error); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const centre = await HealthCentre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!centre) return res.status(404).json({ message: 'Health centre not found' });
    res.json({ data: centre });
  } catch (error) { next(error); }
});

export default router;
