import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import HealthCentre from './models/HealthCentre.js';
import Medicine from './models/Medicine.js';

const centresData = [
  { name: 'Ayodhya Nagar PHC', code: 'BPL-PHC-01', type: 'PHC', district: 'Bhopal', location: { label: 'Ayodhya Nagar, Bhopal' }, patientsToday: 82, avgPatientsPerDay: 74, beds: { total: 18, occupied: 14 }, doctors: { scheduled: 4, present: 3 }, tests: [{ name: 'CBC', available: true, capacityPerDay: 25 }, { name: 'Blood glucose', available: true, capacityPerDay: 30 }, { name: 'Malaria rapid test', available: false, capacityPerDay: 20 }] },
  { name: 'Gandhi Nagar CHC', code: 'BPL-CHC-02', type: 'CHC', district: 'Bhopal', location: { label: 'Gandhi Nagar, Bhopal' }, patientsToday: 146, avgPatientsPerDay: 130, beds: { total: 55, occupied: 49 }, doctors: { scheduled: 8, present: 4 }, tests: [{ name: 'CBC', available: true, capacityPerDay: 50 }, { name: 'X-ray', available: false, capacityPerDay: 18 }, { name: 'Blood glucose', available: true, capacityPerDay: 40 }] },
  { name: 'Berasia PHC', code: 'BPL-PHC-03', type: 'PHC', district: 'Bhopal Rural', location: { label: 'Berasia, Bhopal Rural' }, patientsToday: 39, avgPatientsPerDay: 47, beds: { total: 12, occupied: 4 }, doctors: { scheduled: 3, present: 3 }, tests: [{ name: 'CBC', available: true, capacityPerDay: 18 }, { name: 'Blood glucose', available: true, capacityPerDay: 20 }, { name: 'Malaria rapid test', available: true, capacityPerDay: 16 }] },
  { name: 'Phanda CHC', code: 'BPL-CHC-04', type: 'CHC', district: 'Bhopal Rural', location: { label: 'Phanda, Bhopal Rural' }, patientsToday: 61, avgPatientsPerDay: 68, beds: { total: 35, occupied: 20 }, doctors: { scheduled: 6, present: 5 }, tests: [{ name: 'CBC', available: true, capacityPerDay: 35 }, { name: 'X-ray', available: true, capacityPerDay: 12 }, { name: 'Blood glucose', available: true, capacityPerDay: 32 }] }
];

try {
  await connectDB();
  await Medicine.deleteMany({});
  await HealthCentre.deleteMany({});
  const centres = await HealthCentre.insertMany(centresData);
  const [ayodhya, gandhi, berasia, phanda] = centres;
  const medicinesData = [
    { name: 'Paracetamol 500 mg', genericName: 'paracetamol 500mg', category: 'Analgesic', unit: 'strips', stock: 18, reorderLevel: 30, dailyConsumption: 6, unitCost: 12, centre: ayodhya._id },
    { name: 'ORS Sachets', genericName: 'oral rehydration salts', category: 'Essential supplies', unit: 'sachets', stock: 12, reorderLevel: 25, dailyConsumption: 5, unitCost: 4, centre: ayodhya._id },
    { name: 'Amoxicillin 500 mg', genericName: 'amoxicillin 500mg', category: 'Antibiotic', unit: 'strips', stock: 0, reorderLevel: 20, dailyConsumption: 3, unitCost: 32, centre: ayodhya._id },
    { name: 'Paracetamol 500 mg', genericName: 'paracetamol 500mg', category: 'Analgesic', unit: 'strips', stock: 125, reorderLevel: 30, dailyConsumption: 8, unitCost: 12, centre: gandhi._id },
    { name: 'ORS Sachets', genericName: 'oral rehydration salts', category: 'Essential supplies', unit: 'sachets', stock: 160, reorderLevel: 30, dailyConsumption: 10, unitCost: 4, centre: gandhi._id },
    { name: 'Amoxicillin 500 mg', genericName: 'amoxicillin 500mg', category: 'Antibiotic', unit: 'strips', stock: 45, reorderLevel: 20, dailyConsumption: 4, unitCost: 32, centre: gandhi._id },
    { name: 'Paracetamol 500 mg', genericName: 'paracetamol 500mg', category: 'Analgesic', unit: 'strips', stock: 70, reorderLevel: 20, dailyConsumption: 5, unitCost: 12, centre: berasia._id },
    { name: 'ORS Sachets', genericName: 'oral rehydration salts', category: 'Essential supplies', unit: 'sachets', stock: 20, reorderLevel: 25, dailyConsumption: 2, unitCost: 4, centre: berasia._id },
    { name: 'Amoxicillin 500 mg', genericName: 'amoxicillin 500mg', category: 'Antibiotic', unit: 'strips', stock: 35, reorderLevel: 18, dailyConsumption: 2, unitCost: 32, centre: berasia._id },
    { name: 'Paracetamol 500 mg', genericName: 'paracetamol 500mg', category: 'Analgesic', unit: 'strips', stock: 42, reorderLevel: 25, dailyConsumption: 6, unitCost: 12, centre: phanda._id },
    { name: 'ORS Sachets', genericName: 'oral rehydration salts', category: 'Essential supplies', unit: 'sachets', stock: 95, reorderLevel: 25, dailyConsumption: 6, unitCost: 4, centre: phanda._id },
    { name: 'Amoxicillin 500 mg', genericName: 'amoxicillin 500mg', category: 'Antibiotic', unit: 'strips', stock: 24, reorderLevel: 18, dailyConsumption: 3, unitCost: 32, centre: phanda._id }
  ];
  await Medicine.insertMany(medicinesData);
  console.log(`Seeded ${centres.length} centres and ${medicinesData.length} medicine inventory records.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
