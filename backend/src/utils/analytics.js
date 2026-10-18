/**
 * Transparent operational heuristics for hackathon demonstration.
 * These are not clinical decision rules or a trained forecasting model.
 */
export function getMedicineStatus(medicine) {
  if (medicine.stock <= 0) return 'Stock-out';
  if (medicine.stock <= medicine.reorderLevel) return 'Low stock';
  return 'Healthy';
}

export function forecastMedicine(medicine) {
  const daily = Number(medicine.dailyConsumption || 0);
  const stock = Number(medicine.stock || 0);
  const daysRemaining = daily > 0 ? Math.floor(stock / daily) : null;
  const sevenDayNeed = Math.ceil(daily * 7);
  return {
    ...medicine,
    status: getMedicineStatus(medicine),
    daysRemaining,
    sevenDayNeed,
    projectedSevenDayBalance: stock - sevenDayNeed,
    needsAttention: stock <= medicine.reorderLevel || (daysRemaining !== null && daysRemaining <= 7)
  };
}

export function assessCentre(centre, centreMedicines) {
  const reasons = [];
  const scheduled = Number(centre.doctors?.scheduled || 0);
  const present = Number(centre.doctors?.present || 0);
  const bedsTotal = Number(centre.beds?.total || 0);
  const bedsOccupied = Number(centre.beds?.occupied || 0);
  const attendanceRate = scheduled > 0 ? present / scheduled : null;
  const occupancyRate = bedsTotal > 0 ? bedsOccupied / bedsTotal : null;
  const stockouts = centreMedicines.filter(m => Number(m.stock) <= 0);
  const lowStock = centreMedicines.filter(m => Number(m.stock) > 0 && Number(m.stock) <= Number(m.reorderLevel));
  const unavailableTests = (centre.tests || []).filter(t => !t.available);

  if (attendanceRate !== null && attendanceRate < 0.6) reasons.push('Doctor attendance below 60%');
  if (occupancyRate !== null && occupancyRate >= 0.9) reasons.push('Bed occupancy at or above 90%');
  if (stockouts.length) reasons.push(`${stockouts.length} medicine stock-out${stockouts.length > 1 ? 's' : ''}`);
  if (unavailableTests.length) reasons.push(`${unavailableTests.length} test service${unavailableTests.length > 1 ? 's' : ''} unavailable`);
  return {
    attendanceRate,
    occupancyRate,
    stockouts: stockouts.length,
    lowStock: lowStock.length,
    unavailableTests: unavailableTests.length,
    status: reasons.length >= 2 ? 'Needs intervention' : reasons.length === 1 ? 'Needs attention' : 'On track',
    reasons
  };
}
