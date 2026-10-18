import { Router } from 'express';
import HealthCentre from '../models/HealthCentre.js';
import Medicine from '../models/Medicine.js';
import { assessCentre, forecastMedicine } from '../utils/analytics.js';

const router = Router();

router.get('/summary', async (_req, res, next) => {
  try {
    const [centres, rawMedicines] = await Promise.all([HealthCentre.find().lean(), Medicine.find().lean()]);
    const medicines = rawMedicines.map(forecastMedicine);
    const centreAssessments = centres.map(c => {
      const centreMedicines = rawMedicines.filter(m => String(m.centre) === String(c._id));
      return { centre: c, assessment: assessCentre(c, centreMedicines) };
    });
    const activeCentres = centres.length;
    const patientsToday = centres.reduce((sum, c) => sum + Number(c.patientsToday || 0), 0);
    const totalBeds = centres.reduce((sum, c) => sum + Number(c.beds?.total || 0), 0);
    const occupiedBeds = centres.reduce((sum, c) => sum + Number(c.beds?.occupied || 0), 0);
    const doctorsScheduled = centres.reduce((sum, c) => sum + Number(c.doctors?.scheduled || 0), 0);
    const doctorsPresent = centres.reduce((sum, c) => sum + Number(c.doctors?.present || 0), 0);
    const stockouts = medicines.filter(m => m.stock <= 0).length;
    const lowStock = medicines.filter(m => m.stock > 0 && m.stock <= m.reorderLevel).length;
    const attentionCentres = centreAssessments.filter(c => c.assessment.status !== 'On track').length;
    const demand = centres.map(c => ({ name: c.code, centre: c.name, today: c.patientsToday, average: c.avgPatientsPerDay }));
    const districtMap = new Map();
    centres.forEach(c => districtMap.set(c.district, (districtMap.get(c.district) || 0) + Number(c.patientsToday || 0)));
    res.json({ data: {
      activeCentres, patientsToday, totalBeds, occupiedBeds, availableBeds: Math.max(0, totalBeds - occupiedBeds),
      bedOccupancyRate: totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      doctorsScheduled, doctorsPresent, doctorAttendanceRate: doctorsScheduled ? Math.round((doctorsPresent / doctorsScheduled) * 100) : 0,
      medicineItems: medicines.length, stockouts, lowStock, attentionCentres,
      demand, districts: [...districtMap.entries()].map(([district, patients]) => ({ district, patients })),
      recentAlerts: medicines.filter(m => m.needsAttention).sort((a, b) => (a.stock - a.reorderLevel) - (b.stock - b.reorderLevel)).slice(0, 6).map(m => ({
        id: m._id, type: m.stock <= 0 ? 'error' : 'warning', title: m.stock <= 0 ? `${m.name} is out of stock` : `${m.name} is running low`,
        detail: `${m.stock} ${m.unit} remaining · ${m.centre ? 'centre stock' : 'inventory'}${m.daysRemaining !== null ? ` · approx. ${m.daysRemaining} days left` : ''}`
      }))
    } });
  } catch (error) { next(error); }
});

router.get('/insights', async (_req, res, next) => {
  try {
    const [centres, medicines] = await Promise.all([HealthCentre.find().lean(), Medicine.find().populate('centre', 'name code district').lean()]);
    const assessments = centres.map(centre => ({
      centre,
      assessment: assessCentre(centre, medicines.filter(m => String(m.centre?._id || m.centre) === String(centre._id)))
    }));
    const recommendations = [];
    const byGeneric = new Map();
    medicines.forEach(m => {
      const key = (m.genericName || m.name).toLowerCase();
      if (!byGeneric.has(key)) byGeneric.set(key, []);
      byGeneric.get(key).push(m);
    });
    for (const [genericName, rows] of byGeneric.entries()) {
      const shortageRows = rows.filter(m => Number(m.stock) <= Number(m.reorderLevel));
      const surplusRows = rows.filter(m => Number(m.stock) > Number(m.reorderLevel) * 2);
      for (const recipient of shortageRows) {
        const donor = surplusRows.find(m => String(m.centre?._id || m.centre) !== String(recipient.centre?._id || recipient.centre));
        if (donor) {
          const target = Math.max(0, Number(recipient.reorderLevel) * 2 - Number(recipient.stock));
          const transferable = Math.max(0, Number(donor.stock) - Number(donor.reorderLevel));
          const quantity = Math.min(target, transferable);
          if (quantity > 0) recommendations.push({
            id: `${donor._id}-${recipient._id}`, medicine: recipient.name, genericName,
            from: donor.centre?.name || 'Donor centre', to: recipient.centre?.name || 'Recipient centre', quantity,
            priority: Number(recipient.stock) <= 0 ? 'Urgent' : 'High',
            reason: `Recipient has ${recipient.stock} ${recipient.unit}; donor has ${donor.stock}.`
          });
        }
      }
    }
    const forecasts = medicines.map(forecastMedicine).filter(m => m.needsAttention).map(m => ({
      id: m._id, medicine: m.name, centre: m.centre?.name || 'Unknown centre', stock: m.stock, unit: m.unit,
      daysRemaining: m.daysRemaining, sevenDayNeed: m.sevenDayNeed, status: m.status
    })).sort((a, b) => (a.daysRemaining ?? 9999) - (b.daysRemaining ?? 9999));
    res.json({ data: {
      forecasts,
      recommendations,
      underperforming: assessments.filter(x => x.assessment.status !== 'On track').map(x => ({
        id: x.centre._id, name: x.centre.name, code: x.centre.code, district: x.centre.district,
        status: x.assessment.status, reasons: x.assessment.reasons
      }))
    } });
  } catch (error) { next(error); }
});

export default router;
