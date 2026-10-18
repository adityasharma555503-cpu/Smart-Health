import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  available: { type: Boolean, default: true },
  capacityPerDay: { type: Number, default: 20, min: 0 }
}, { _id: false });

const healthCentreSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['PHC', 'CHC'], default: 'PHC' },
  district: { type: String, required: true, trim: true },
  location: {
    label: { type: String, default: '' },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  patientsToday: { type: Number, default: 0, min: 0 },
  avgPatientsPerDay: { type: Number, default: 0, min: 0 },
  beds: {
    total: { type: Number, default: 0, min: 0 },
    occupied: { type: Number, default: 0, min: 0 }
  },
  doctors: {
    scheduled: { type: Number, default: 0, min: 0 },
    present: { type: Number, default: 0, min: 0 }
  },
  tests: { type: [testSchema], default: [] },
  lastReportedAt: { type: Date, default: Date.now }
}, { timestamps: true });

healthCentreSchema.index({ district: 1, name: 1 });
export default mongoose.model('HealthCentre', healthCentreSchema);
