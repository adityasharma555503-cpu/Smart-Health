import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import centreRoutes from './routes/centres.js';
import medicineRoutes from './routes/medicines.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(x => x.trim());

app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error(`CORS blocked origin: ${origin}`));
} }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => res.json({ name: 'Smart Health API', status: 'running', docs: '/api/health' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: 'connected when startup completes', timestamp: new Date().toISOString() }));
app.use('/api/centres', centreRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === 11000) return res.status(409).json({ message: 'A record with that unique code or medicine/centre combination already exists.' });
  if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid record ID or field value.' });
  if (error.message?.startsWith('CORS blocked')) return res.status(403).json({ message: error.message });
  res.status(500).json({ message: 'Unexpected server error. Check backend logs.' });
});

connectDB().then(() => {
  app.listen(port, () => console.log(`Smart Health API listening on port ${port}`));
}).catch(error => {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
});
