import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  genericName: { type: String, required: true, trim: true, lowercase: true },
  category: { type: String, default: 'Essential medicine', trim: true },
  unit: { type: String, default: 'strips', trim: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  reorderLevel: { type: Number, required: true, min: 0, default: 20 },
  dailyConsumption: { type: Number, min: 0, default: 0 },
  unitCost: { type: Number, min: 0, default: 0 },
  centre: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthCentre', required: true },
  expiryDate: { type: Date, default: null },
  lastUpdatedBy: { type: String, default: 'Demo Admin' }
}, { timestamps: true });

medicineSchema.index({ genericName: 1, centre: 1 }, { unique: true });
medicineSchema.index({ stock: 1, reorderLevel: 1 });
export default mongoose.model('Medicine', medicineSchema);
