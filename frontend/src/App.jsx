import TopNavbar from "./components/TopNavbar";
import FloatingActions from "./components/FloatingActions";
import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Alert, AppBar, Avatar, Box, Button, Chip, CircularProgress, Container, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Drawer, FormControl, Grid, IconButton, InputLabel, MenuItem,
  Paper, Select, Snackbar, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Tabs, TextField, Toolbar, Tooltip, Typography, useMediaQuery, useTheme
} from '@mui/material';
import {
  AddRounded, AssessmentRounded, BedRounded, CachedRounded, ChevronRightRounded, DashboardRounded,
  HealthAndSafetyRounded, LocalHospitalRounded, LocalPharmacyRounded, MenuRounded, NotificationsActiveRounded,
  PeopleAltRounded, ScienceRounded, SearchRounded, TuneRounded, WarningAmberRounded, MedicalServicesRounded,
  TrendingUpRounded, SwapHorizRounded, Inventory2Rounded, CheckCircleRounded, TranslateRounded
} from '@mui/icons-material';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip as ChartTooltip, XAxis, YAxis
} from 'recharts';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const api = axios.create({ baseURL: API_URL, timeout: 12000 });
const navItems = [
  { key: 'Overview', icon: <DashboardRounded />, label: 'Overview' },
  { key: 'Centres', icon: <LocalHospitalRounded />, label: 'Health centres' },
  { key: 'Inventory', icon: <Inventory2Rounded />, label: 'Medicine inventory' },
  { key: 'Insights', icon: <AssessmentRounded />, label: 'AI insights' }
];
const chartColors = ['#0f766e', '#6172d8', '#f2a65a', '#d95d70'];

function SectionTitle({ eyebrow, title, detail, action }) {
  return <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2.25 }}>
    <Box><Typography className="eyebrow">{eyebrow}</Typography><Typography variant="h5" sx={{ mt: 0.35 }}>{title}</Typography>{detail && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{detail}</Typography>}</Box>
    {action}
  </Stack>;
}

function StatusChip({ status }) {
  const color = status === 'On track' || status === 'Healthy' ? 'success' : status === 'Needs attention' || status === 'Low stock' ? 'warning' : 'error';
  return <Chip size="small" label={status || 'Unknown'} color={color} variant={color === 'success' ? 'outlined' : 'filled'} sx={{ fontWeight: 700, borderRadius: 2 }} />;
}

function MetricCard({ title, value, unit, footnote, icon, tint = 'mint', progress }) {
  return <Paper className="metric-card" elevation={0} sx={{ p: 2.25, height: '100%' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
      <Box sx={{ minWidth: 0 }}><Typography color="text.secondary" variant="body2" fontWeight={650}>{title}</Typography><Stack direction="row" alignItems="baseline" spacing={0.7} sx={{ mt: 1 }}><Typography variant="h4" sx={{ letterSpacing: '-1.3px' }}>{value}</Typography>{unit && <Typography variant="body2" color="text.secondary">{unit}</Typography>}</Stack></Box>
      <Box className={`metric-icon ${tint}`}>{icon}</Box>
    </Stack>
    {progress !== undefined && <Box sx={{ height: 5, bgcolor: '#edf2f7', borderRadius: 5, overflow: 'hidden', mt: 1.6 }}><Box sx={{ height: '100%', width: `${Math.min(progress, 100)}%`, bgcolor: tint === 'amber' ? '#e7a34b' : '#149986', borderRadius: 5, transition: 'width .3s' }} /></Box>}
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.4 }}>{footnote}</Typography>
  </Paper>;
}

function CentreDialog({ open, onClose, onSave, busy }) {
  const [form, setForm] = useState({ name: '', code: '', type: 'PHC', district: 'Bhopal', patientsToday: 0, avgPatientsPerDay: 0, bedTotal: 10, bedOccupied: 0, doctorsScheduled: 2, doctorsPresent: 2 });
  useEffect(() => { if (open) setForm({ name: '', code: '', type: 'PHC', district: 'Bhopal', patientsToday: 0, avgPatientsPerDay: 0, bedTotal: 10, bedOccupied: 0, doctorsScheduled: 2, doctorsPresent: 2 }); }, [open]);
  const set = (key) => (event) => setForm(old => ({ ...old, [key]: event.target.value }));
  const submit = (event) => { event.preventDefault(); onSave({ name: form.name, code: form.code, type: form.type, district: form.district, patientsToday: Number(form.patientsToday), avgPatientsPerDay: Number(form.avgPatientsPerDay), beds: { total: Number(form.bedTotal), occupied: Number(form.bedOccupied) }, doctors: { scheduled: Number(form.doctorsScheduled), present: Number(form.doctorsPresent) }, tests: [] }); };
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"><Box component="form" onSubmit={submit}><DialogTitle>Add health centre</DialogTitle><DialogContent><Grid container spacing={2} sx={{ pt: 1 }}>
    <Grid item xs={12} sm={8}><TextField label="Centre name" value={form.name} onChange={set('name')} required fullWidth /></Grid>
    <Grid item xs={12} sm={4}><FormControl fullWidth><InputLabel>Type</InputLabel><Select label="Type" value={form.type} onChange={set('type')}><MenuItem value="PHC">PHC</MenuItem><MenuItem value="CHC">CHC</MenuItem></Select></FormControl></Grid>
    <Grid item xs={12} sm={6}><TextField label="Centre code" value={form.code} onChange={set('code')} required fullWidth helperText="Must be unique, e.g. BPL-PHC-05" /></Grid>
    <Grid item xs={12} sm={6}><TextField label="District" value={form.district} onChange={set('district')} required fullWidth /></Grid>
    <Grid item xs={12} sm={6}><TextField label="Patients today" type="number" inputProps={{ min: 0 }} value={form.patientsToday} onChange={set('patientsToday')} fullWidth /></Grid>
    <Grid item xs={12} sm={6}><TextField label="Daily average" type="number" inputProps={{ min: 0 }} value={form.avgPatientsPerDay} onChange={set('avgPatientsPerDay')} fullWidth /></Grid>
    <Grid item xs={6}><TextField label="Total beds" type="number" inputProps={{ min: 0 }} value={form.bedTotal} onChange={set('bedTotal')} fullWidth /></Grid>
    <Grid item xs={6}><TextField label="Occupied beds" type="number" inputProps={{ min: 0 }} value={form.bedOccupied} onChange={set('bedOccupied')} fullWidth /></Grid>
    <Grid item xs={6}><TextField label="Doctors scheduled" type="number" inputProps={{ min: 0 }} value={form.doctorsScheduled} onChange={set('doctorsScheduled')} fullWidth /></Grid>
    <Grid item xs={6}><TextField label="Doctors present" type="number" inputProps={{ min: 0 }} value={form.doctorsPresent} onChange={set('doctorsPresent')} fullWidth /></Grid>
  </Grid></DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>Cancel</Button><Button type="submit" variant="contained" disabled={busy}>{busy ? 'Saving…' : 'Add centre'}</Button></DialogActions></Box></Dialog>;
}

function MedicineDialog({ open, onClose, onSave, centres, busy }) {
  const [form, setForm] = useState({ name: '', genericName: '', category: 'Essential medicine', unit: 'strips', stock: 0, reorderLevel: 20, dailyConsumption: 0, unitCost: 0, centre: '' });
  useEffect(() => { if (open) setForm({ name: '', genericName: '', category: 'Essential medicine', unit: 'strips', stock: 0, reorderLevel: 20, dailyConsumption: 0, unitCost: 0, centre: centres[0]?._id || '' }); }, [open, centres]);
  const set = (key) => (event) => setForm(old => ({ ...old, [key]: event.target.value }));
  const submit = (event) => { event.preventDefault(); onSave({ ...form, stock: Number(form.stock), reorderLevel: Number(form.reorderLevel), dailyConsumption: Number(form.dailyConsumption), unitCost: Number(form.unitCost) }); };
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"><Box component="form" onSubmit={submit}><DialogTitle>Add medicine inventory</DialogTitle><DialogContent><Grid container spacing={2} sx={{ pt: 1 }}>
    <Grid item xs={12} sm={6}><TextField label="Display name" value={form.name} onChange={set('name')} required fullWidth /></Grid>
    <Grid item xs={12} sm={6}><TextField label="Generic name / matching key" value={form.genericName} onChange={set('genericName')} required fullWidth helperText="Use the same key to compare centres" /></Grid>
    <Grid item xs={12} sm={6}><TextField label="Category" value={form.category} onChange={set('category')} fullWidth /></Grid>
    <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Health centre</InputLabel><Select label="Health centre" value={form.centre} onChange={set('centre')}>{centres.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}</Select></FormControl></Grid>
    <Grid item xs={6}><TextField label="Current stock" type="number" inputProps={{ min: 0 }} value={form.stock} onChange={set('stock')} fullWidth /></Grid>
    <Grid item xs={6}><TextField label="Reorder level" type="number" inputProps={{ min: 0 }} value={form.reorderLevel} onChange={set('reorderLevel')} fullWidth /></Grid>
    <Grid item xs={6}><TextField label="Daily consumption" type="number" inputProps={{ min: 0 }} value={form.dailyConsumption} onChange={set('dailyConsumption')} fullWidth /></Grid>
    <Grid item xs={6}><FormControl fullWidth><InputLabel>Unit</InputLabel><Select label="Unit" value={form.unit} onChange={set('unit')}><MenuItem value="strips">strips</MenuItem><MenuItem value="tablets">tablets</MenuItem><MenuItem value="bottles">bottles</MenuItem><MenuItem value="sachets">sachets</MenuItem><MenuItem value="vials">vials</MenuItem><MenuItem value="units">units</MenuItem></Select></FormControl></Grid>
    <Grid item xs={12}><TextField label="Unit cost (₹)" type="number" inputProps={{ min: 0 }} value={form.unitCost} onChange={set('unitCost')} fullWidth /></Grid>
  </Grid></DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>Cancel</Button><Button type="submit" variant="contained" disabled={busy || !centres.length}>{busy ? 'Saving…' : 'Add inventory'}</Button></DialogActions></Box></Dialog>;
}

function OperationsDialog({ open, centre, onClose, onSave, busy }) {
  const [form, setForm] = useState(null);
  useEffect(() => { if (centre && open) setForm({ patientsToday: centre.patientsToday || 0, avgPatientsPerDay: centre.avgPatientsPerDay || 0, bedTotal: centre.beds?.total || 0, bedOccupied: centre.beds?.occupied || 0, doctorsScheduled: centre.doctors?.scheduled || 0, doctorsPresent: centre.doctors?.present || 0, testsText: (centre.tests || []).map(t => `${t.name}|${t.available ? 'yes' : 'no'}|${t.capacityPerDay}`).join('\n') }); }, [centre, open]);
  if (!form || !centre) return null;
  const set = (key) => (event) => setForm(old => ({ ...old, [key]: event.target.value }));
  const submit = (event) => { event.preventDefault(); const tests = form.testsText.split('\n').map(line => line.trim()).filter(Boolean).map(line => { const [name, status = 'yes', capacity = '20'] = line.split('|'); return { name: name.trim(), available: ['yes', 'true', 'available', '1'].includes(status.trim().toLowerCase()), capacityPerDay: Math.max(0, Number(capacity) || 0) }; }); onSave(centre._id, { patientsToday: Number(form.patientsToday), avgPatientsPerDay: Number(form.avgPatientsPerDay), beds: { total: Number(form.bedTotal), occupied: Number(form.bedOccupied) }, doctors: { scheduled: Number(form.doctorsScheduled), present: Number(form.doctorsPresent) }, tests }); };
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"><Box component="form" onSubmit={submit}><DialogTitle>Update operations <Typography color="text.secondary" variant="body2">{centre.name} · {centre.code}</Typography></DialogTitle><DialogContent><Grid container spacing={2} sx={{ pt: 1 }}>
    <Grid item xs={6}><TextField label="Patients today" type="number" inputProps={{ min: 0 }} value={form.patientsToday} onChange={set('patientsToday')} fullWidth /></Grid>
    <Grid item xs={6}><TextField label="Daily average" type="number" inputProps={{ min: 0 }} value={form.avgPatientsPerDay} onChange={set('avgPatientsPerDay')} fullWidth /></Grid>
    <Grid item xs={6}><TextField label="Total beds" type="number" inputProps={{ min: 0 }} value={form.bedTotal} onChange={set('bedTotal')} fullWidth /></Grid>
    <Grid item xs={6}><TextField label="Occupied beds" type="number" inputProps={{ min: 0 }} value={form.bedOccupied} onChange={set('bedOccupied')} fullWidth /></Grid>
    <Grid item xs={6}><TextField label="Doctors scheduled" type="number" inputProps={{ min: 0 }} value={form.doctorsScheduled} onChange={set('doctorsScheduled')} fullWidth /></Grid>
    <Grid item xs={6}><TextField label="Doctors present" type="number" inputProps={{ min: 0 }} value={form.doctorsPresent} onChange={set('doctorsPresent')} fullWidth /></Grid>
    <Grid item xs={12}><TextField label="Test services (one per line: Name|yes/no|daily capacity)" multiline minRows={3} value={form.testsText} onChange={set('testsText')} fullWidth helperText="Example: CBC|yes|25" /></Grid>
  </Grid></DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>Cancel</Button><Button type="submit" variant="contained" disabled={busy}>{busy ? 'Saving…' : 'Save operations'}</Button></DialogActions></Box></Dialog>;
}

function App() {
  const theme = useTheme();
  const small = useMediaQuery(theme.breakpoints.down('md'));
  const [page, setPage] = useState('Overview');
  const [language, setLanguage] = useState('en');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [centres, setCentres] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [insights, setInsights] = useState({ forecasts: [], recommendations: [], underperforming: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [centreDialog, setCentreDialog] = useState(false);
  const [medicineDialog, setMedicineDialog] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [search, setSearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState('All');

  const loadData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError('');
    try {
      const [summaryRes, centreRes, medicineRes, insightsRes] = await Promise.all([
        api.get('/dashboard/summary'), api.get('/centres'), api.get('/medicines'), api.get('/dashboard/insights')
      ]);
      setSummary(summaryRes.data.data);
      setCentres(centreRes.data.data);
      setMedicines(medicineRes.data.data);
      setInsights(insightsRes.data.data);
    } catch (err) {
      const message = err.response?.data?.message || `Cannot reach API at ${API_URL}. Start the backend and verify MongoDB connection.`;
      setError(message);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const createCentre = async (payload) => {
    setSaving(true);
    try { await api.post('/centres', payload); setCentreDialog(false); setSnackbar('Health centre added'); await loadData(true); }
    catch (err) { setSnackbar(err.response?.data?.message || 'Could not add centre'); }
    finally { setSaving(false); }
  };
  const createMedicine = async (payload) => {
    setSaving(true);
    try { await api.post('/medicines', payload); setMedicineDialog(false); setSnackbar('Inventory record added'); await loadData(true); }
    catch (err) { setSnackbar(err.response?.data?.message || 'Could not add inventory record'); }
    finally { setSaving(false); }
  };
  const saveOperations = async (id, payload) => {
    setSaving(true);
    try { await api.patch(`/centres/${id}/operations`, payload); setSelectedCentre(null); setSnackbar('Centre operations updated'); await loadData(true); }
    catch (err) { setSnackbar(err.response?.data?.message || 'Could not update operations'); }
    finally { setSaving(false); }
  };
  const updateStock = async (medicine, adjustment) => {
    const next = Math.max(0, Number(medicine.stock) + adjustment);
    try { await api.patch(`/medicines/${medicine._id}`, { stock: next }); setSnackbar(`${medicine.name}: stock updated to ${next}`); await loadData(true); }
    catch (err) { setSnackbar(err.response?.data?.message || 'Could not update stock'); }
  };

  const filteredCentres = useMemo(() => centres.filter(c => `${c.name} ${c.code} ${c.district}`.toLowerCase().includes(search.toLowerCase())), [centres, search]);
  const filteredMedicines = useMemo(() => medicines.filter(m => {
    const matchesSearch = `${m.name} ${m.genericName} ${m.centre?.name || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = inventoryFilter === 'All' || (inventoryFilter === 'Attention' ? m.status !== 'Healthy' : m.status === inventoryFilter);
    return matchesSearch && matchesFilter;
  }), [medicines, search, inventoryFilter]);

  const SideNav = <Box className="sidebar-inner">
    <Button className="brand-lockup brand-home-button" onClick={() => { setPage('Overview'); setDrawerOpen(false); setSearch(''); }} aria-label="Go to dashboard" sx={{ display: 'flex', justifyContent: 'flex-start', textAlign: 'left', width: '100%', color: 'inherit', textTransform: 'none', p: 0, mb: 2, borderRadius: 2, '&:hover': { bgcolor: '#f0fdfa' } }}><Box className="brand-symbol"><HealthAndSafetyRounded /></Box><Box><Typography fontWeight={850} fontSize={17} lineHeight={1.2}>Smart Health</Typography><Typography variant="caption" color="text.secondary">District command centre</Typography></Box></Button>
    <Typography className="nav-label">WORKSPACE</Typography>
    <Stack spacing={0.6}>{navItems.map(item => <Button key={item.key} startIcon={item.icon} onClick={() => { setPage(item.key); setDrawerOpen(false); setSearch(''); }} className={`nav-button ${page === item.key ? 'active' : ''}`} fullWidth>{item.label}</Button>)}</Stack>
    <Box className="sidebar-bottom"><Box className="live-dot" /><Box><Typography fontWeight={750} fontSize={12}>SYSTEM STATUS</Typography><Typography variant="caption" color="text.secondary">Operational overview</Typography></Box><Box sx={{ flex: 1 }} /><Chip size="small" label="DEMO" color="success" variant="outlined" /></Box>
  </Box>;

  return <Box className="app-shell">
    {!small && <Box className="sidebar">{SideNav}</Box>}
    <Box className="main-column">
      <TopNavbar
        page={page}
        small={small}
        language={language}
        onLanguageChange={setLanguage}
        onMenuClick={() => setDrawerOpen(true)}
        onRefresh={() => loadData()}
        onNotificationsClick={() => setPage('Insights')}
      />
      <Container maxWidth={false} className="page-content">
        {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={() => loadData()}>Retry</Button>}>{error}<Typography variant="caption" display="block">Check backend/.env, MongoDB connectivity and VITE_API_URL.</Typography></Alert>}
        {loading && !summary ? <Box className="loading-state"><CircularProgress /><Typography color="text.secondary">Connecting to health operations database…</Typography></Box> : <>
          {page === 'Overview' && <>
            <Box className="welcome-banner"><Box className="welcome-content"><Chip icon={<CheckCircleRounded />} label="LIVE OPERATIONS VIEW" size="small" className="banner-chip" /><Typography variant="h4" sx={{ color: 'white', mt: 1.4, maxWidth: 650 }}>Smarter health centres.<br className="desktop-break"/> Healthier communities.</Typography><Typography sx={{ color: 'rgba(255,255,255,.78)', mt: 1, maxWidth: 560 }}>A single view of medicine availability, patient demand, bed capacity and staff readiness across district PHCs and CHCs.</Typography><Stack direction="row" spacing={1} sx={{ mt: 2.3 }}><Button variant="contained" color="inherit" onClick={() => setPage('Insights')} endIcon={<ChevronRightRounded />} sx={{ color: '#115e59', bgcolor: 'white', '&:hover': { bgcolor: '#e9f8f5' } }}>View AI insights</Button><Button variant="outlined" onClick={() => setCentreDialog(true)} startIcon={<AddRounded />} sx={{ borderColor: 'rgba(255,255,255,.45)', color: 'white' }}>Add centre</Button></Stack></Box><Box className="banner-art"><Box className="art-circle big"/><Box className="art-circle small"/><Box className="art-cross"><LocalHospitalRounded sx={{ fontSize: 80 }} /></Box><Box className="art-card"><Typography variant="caption" fontWeight={800}>DISTRICT SNAPSHOT</Typography><Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}><Box><Typography variant="h6" color="white">{summary?.activeCentres ?? '—'}</Typography><Typography variant="caption">Centres</Typography></Box><Box><Typography variant="h6" color="white">{summary?.availableBeds ?? '—'}</Typography><Typography variant="caption">Beds free</Typography></Box></Stack></Box></Box></Box>
            <SectionTitle eyebrow="DISTRICT SNAPSHOT" title="Today at a glance" detail={`Operational status across ${summary?.activeCentres ?? 0} registered health centres.`} action={<Chip icon={<CheckCircleRounded />} label="Data refreshed" variant="outlined" color="success" />} />
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} xl={3}><MetricCard title="Patient footfall" value={(summary?.patientsToday ?? 0).toLocaleString('en-IN')} footnote="Reported visits today" icon={<PeopleAltRounded />} tint="mint" /></Grid>
              <Grid item xs={12} sm={6} xl={3}><MetricCard title="Beds available" value={(summary?.availableBeds ?? 0).toLocaleString('en-IN')} unit={`/ ${summary?.totalBeds ?? 0}`} footnote={`${summary?.bedOccupancyRate ?? 0}% district bed occupancy`} icon={<BedRounded />} tint="blue" progress={summary?.bedOccupancyRate ?? 0} /></Grid>
              <Grid item xs={12} sm={6} xl={3}><MetricCard title="Doctor attendance" value={`${summary?.doctorAttendanceRate ?? 0}%`} footnote={`${summary?.doctorsPresent ?? 0} of ${summary?.doctorsScheduled ?? 0} scheduled doctors present`} icon={<MedicalServicesRounded />} tint="violet" progress={summary?.doctorAttendanceRate ?? 0} /></Grid>
              <Grid item xs={12} sm={6} xl={3}><MetricCard title="Stock alerts" value={(summary?.stockouts ?? 0) + (summary?.lowStock ?? 0)} footnote={`${summary?.stockouts ?? 0} stock-outs · ${summary?.lowStock ?? 0} low-stock items`} icon={<WarningAmberRounded />} tint="amber" /></Grid>
            </Grid>
            <Grid container spacing={2.2}>
              <Grid item xs={12} lg={7}><Paper className="panel" elevation={0}><SectionTitle eyebrow="PATIENT DEMAND" title="Footfall by centre" detail="Reported visits compared with each centre’s typical daily average." /><Box sx={{ height: 290, width: '100%' }}>{(summary?.demand?.length || 0) > 0 ? <ResponsiveContainer><BarChart data={summary.demand} margin={{ top: 6, right: 8, left: -18, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9eef4"/><XAxis dataKey="name" tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false}/><YAxis tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false}/><ChartTooltip cursor={{ fill: '#f4f8fa' }}/><Bar dataKey="today" name="Today" fill="#0f766e" radius={[6, 6, 0, 0]} maxBarSize={35}/><Bar dataKey="average" name="Daily average" fill="#b9e6dc" radius={[6, 6, 0, 0]} maxBarSize={35}/></BarChart></ResponsiveContainer> : <Empty text="Add health centres to see patient demand."/>}</Box><Stack direction="row" spacing={2.5} sx={{ mt: 1 }}><Legend color="#0f766e" label="Reported today"/><Legend color="#b9e6dc" label="Usual daily average"/></Stack></Paper></Grid>
              <Grid item xs={12} lg={5}><Paper className="panel" elevation={0}><SectionTitle eyebrow="SERVICE READINESS" title="Centre status" detail="Flags are based on transparent operational thresholds."/><Stack spacing={1.25}>{(centres || []).slice(0, 5).map(c => <Box key={c._id} className="centre-mini"><Avatar variant="rounded" className={`centre-avatar ${c.type === 'CHC' ? 'chc' : ''}`}><LocalHospitalRounded /></Avatar><Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={750} fontSize={13.5} noWrap>{c.name}</Typography><Typography variant="caption" color="text.secondary">{c.code} · {c.district}</Typography></Box><StatusChip status={c.assessment?.status || 'On track'}/></Box>)}{!centres.length && <Empty text="No centres are registered yet."/>}</Stack><Button fullWidth sx={{ mt: 2 }} endIcon={<ChevronRightRounded />} onClick={() => setPage('Centres')}>View all health centres</Button></Paper></Grid>
              <Grid item xs={12}><Paper className="panel" elevation={0}><SectionTitle eyebrow="NEEDS ATTENTION" title="Priority alerts" detail="Inventory signals estimated from stock level and daily consumption." action={<Button onClick={() => setPage('Insights')} endIcon={<ChevronRightRounded />}>View all</Button>}/>{summary?.recentAlerts?.length ? <Grid container spacing={1.5}>{summary.recentAlerts.map(alert => <Grid item xs={12} md={6} key={alert.id}><Box className={`alert-row ${alert.type}`}><Box className="alert-icon"><WarningAmberRounded /></Box><Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={750} fontSize={13.5}>{alert.title}</Typography><Typography variant="caption" color="text.secondary">{alert.detail}</Typography></Box><ChevronRightRounded color="action"/></Box></Grid>)}</Grid> : <Empty text="No low-stock alerts. Nice work!"/>}</Paper></Grid>
            </Grid>
          </>}
          {page === 'Centres' && <><SectionTitle eyebrow="FACILITY NETWORK" title="Health centres" detail="Monitor patient volumes, staffing, bed capacity and service availability." action={<Button variant="contained" startIcon={<AddRounded />} onClick={() => setCentreDialog(true)}>Add centre</Button>}/><SearchBar value={search} onChange={setSearch} placeholder="Search centre, code or district…"/><Paper className="panel table-panel" elevation={0}><TableContainer><Table><TableHead><TableRow><TableCell>Centre</TableCell><TableCell>Footfall</TableCell><TableCell>Bed availability</TableCell><TableCell>Doctor attendance</TableCell><TableCell>Service flags</TableCell><TableCell>Status</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead><TableBody>{filteredCentres.map(c => <TableRow key={c._id} hover><TableCell><Stack direction="row" spacing={1.2} alignItems="center"><Avatar variant="rounded" className={`centre-avatar ${c.type === 'CHC' ? 'chc' : ''}`}><LocalHospitalRounded/></Avatar><Box><Typography fontWeight={750} fontSize={13.5}>{c.name}</Typography><Typography variant="caption" color="text.secondary">{c.code} · {c.type} · {c.district}</Typography></Box></Stack></TableCell><TableCell><Typography fontWeight={750}>{c.patientsToday || 0}</Typography><Typography variant="caption" color="text.secondary">avg. {c.avgPatientsPerDay || 0}/day</Typography></TableCell><TableCell><Typography fontWeight={750}>{Math.max(0, (c.beds?.total || 0) - (c.beds?.occupied || 0))} free</Typography><Typography variant="caption" color="text.secondary">{c.beds?.occupied || 0}/{c.beds?.total || 0} occupied</Typography></TableCell><TableCell><Typography fontWeight={750}>{c.doctors?.present || 0}/{c.doctors?.scheduled || 0}</Typography><Typography variant="caption" color="text.secondary">doctors present</Typography></TableCell><TableCell><Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>{c.assessment?.stockouts > 0 && <Chip size="small" color="error" label={`${c.assessment.stockouts} stock-out`}/>}{c.assessment?.unavailableTests > 0 && <Chip size="small" color="warning" label={`${c.assessment.unavailableTests} test issue`}/>}{!c.assessment?.stockouts && !c.assessment?.unavailableTests && <Typography variant="caption" color="text.secondary">No service flags</Typography>}</Stack></TableCell><TableCell><StatusChip status={c.assessment?.status}/></TableCell><TableCell align="right"><Button size="small" onClick={() => setSelectedCentre(c)} startIcon={<TuneRounded />}>Update</Button></TableCell></TableRow>)}{!filteredCentres.length && <TableRow><TableCell colSpan={7}><Empty text="No health centres match your search."/></TableCell></TableRow>}</TableBody></Table></TableContainer></Paper></>}
          {page === 'Inventory' && <><SectionTitle eyebrow="MEDICINE SUPPLY CHAIN" title="Medicine inventory" detail="Track stock on hand, reorder thresholds and estimated days remaining." action={<Button variant="contained" startIcon={<AddRounded />} onClick={() => setMedicineDialog(true)}>Add inventory</Button>}/><Grid container spacing={2} sx={{ mb: 2.2 }}><Grid item xs={12} sm={4}><MetricCard title="Tracked records" value={summary?.medicineItems ?? 0} footnote="Medicine-centre combinations" icon={<LocalPharmacyRounded/>}/></Grid><Grid item xs={12} sm={4}><MetricCard title="Stock-outs" value={summary?.stockouts ?? 0} footnote="Stock has reached zero" icon={<WarningAmberRounded/>} tint="amber"/></Grid><Grid item xs={12} sm={4}><MetricCard title="Low stock" value={summary?.lowStock ?? 0} footnote="At or below reorder threshold" icon={<Inventory2Rounded/>} tint="blue"/></Grid></Grid><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mb: 2 }}><Box sx={{ flex: 1 }}><SearchBar value={search} onChange={setSearch} placeholder="Search medicine or centre…"/></Box><FormControl size="small" sx={{ minWidth: 170, bgcolor: 'white' }}><InputLabel>Stock status</InputLabel><Select label="Stock status" value={inventoryFilter} onChange={e => setInventoryFilter(e.target.value)}><MenuItem value="All">All inventory</MenuItem><MenuItem value="Attention">Needs attention</MenuItem><MenuItem value="Stock-out">Stock-out</MenuItem><MenuItem value="Low stock">Low stock</MenuItem><MenuItem value="Healthy">Healthy</MenuItem></Select></FormControl></Stack><Paper className="panel table-panel" elevation={0}><TableContainer><Table><TableHead><TableRow><TableCell>Medicine</TableCell><TableCell>Centre</TableCell><TableCell>Stock on hand</TableCell><TableCell>7-day need</TableCell><TableCell>Estimate</TableCell><TableCell>Status</TableCell><TableCell align="right">Quick adjust</TableCell></TableRow></TableHead><TableBody>{filteredMedicines.map(m => <TableRow key={m._id} hover><TableCell><Typography fontWeight={750} fontSize={13.5}>{m.name}</Typography><Typography variant="caption" color="text.secondary">{m.category} · {m.genericName}</Typography></TableCell><TableCell><Typography fontSize={13}>{m.centre?.name || '—'}</Typography><Typography variant="caption" color="text.secondary">{m.centre?.code || ''}</Typography></TableCell><TableCell><Typography fontWeight={800} color={m.stock <= 0 ? 'error.main' : m.stock <= m.reorderLevel ? 'warning.main' : 'text.primary'}>{m.stock} {m.unit}</Typography><Typography variant="caption" color="text.secondary">reorder at {m.reorderLevel}</Typography></TableCell><TableCell>{m.sevenDayNeed} {m.unit}/7d</TableCell><TableCell>{m.daysRemaining === null ? <Typography variant="caption" color="text.secondary">Add consumption</Typography> : <Typography fontWeight={750}>{m.daysRemaining} days</Typography>}</TableCell><TableCell><StatusChip status={m.status}/></TableCell><TableCell align="right"><Stack direction="row" justifyContent="flex-end" spacing={0.5}><Button size="small" variant="outlined" onClick={() => updateStock(m, -1)} disabled={m.stock <= 0} sx={{ minWidth: 34, px: 0 }}>−</Button><Button size="small" variant="outlined" onClick={() => updateStock(m, 10)} sx={{ minWidth: 34, px: 0 }}>+10</Button></Stack></TableCell></TableRow>)}{!filteredMedicines.length && <TableRow><TableCell colSpan={7}><Empty text="No inventory records match these filters."/></TableCell></TableRow>}</TableBody></Table></TableContainer></Paper></>}
          {page === 'Insights' && <><SectionTitle eyebrow="DECISION SUPPORT" title="AI-assisted insights" detail="Explainable rules-based forecasts and resource reallocation suggestions for a hackathon prototype."/><Alert severity="info" sx={{ mb: 2.5 }}>Demo analytics use reported daily consumption and transparent thresholds. They are planning aids, not a trained predictive model or clinical advice. Validate recommendations with district administrators before moving stock or staff.</Alert><Grid container spacing={2.2}><Grid item xs={12} lg={7}><Paper className="panel" elevation={0}><SectionTitle eyebrow="DEMAND FORECAST" title="Medicine run-out watch" detail="Items that are below reorder level or estimated to run out within 7 days."/><TableContainer><Table size="small"><TableHead><TableRow><TableCell>Medicine / centre</TableCell><TableCell>Stock</TableCell><TableCell>7-day need</TableCell><TableCell>Days left</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>{insights.forecasts.map(row => <TableRow key={row.id}><TableCell><Typography fontWeight={750} fontSize={13}>{row.medicine}</Typography><Typography variant="caption" color="text.secondary">{row.centre}</Typography></TableCell><TableCell>{row.stock} {row.unit}</TableCell><TableCell>{row.sevenDayNeed} {row.unit}</TableCell><TableCell>{row.daysRemaining === null ? '—' : row.daysRemaining}</TableCell><TableCell><StatusChip status={row.status}/></TableCell></TableRow>)}{!insights.forecasts.length && <TableRow><TableCell colSpan={5}><Empty text="No forecast warnings with current data."/></TableCell></TableRow>}</TableBody></Table></TableContainer></Paper></Grid><Grid item xs={12} lg={5}><Paper className="panel" elevation={0}><SectionTitle eyebrow="RESOURCE OPTIMISATION" title="Redistribution ideas" detail="Potential transfers of matching generic medicine records between centres."/><Stack spacing={1.2}>{insights.recommendations.map(r => <Box key={r.id} className="recommendation"><Stack direction="row" alignItems="center" spacing={1}><Avatar className="transfer-icon"><SwapHorizRounded/></Avatar><Box sx={{ flex: 1 }}><Typography fontWeight={800} fontSize={13.5}>{r.medicine}</Typography><Typography variant="caption" color="text.secondary">{r.from} → {r.to}</Typography></Box><Chip size="small" color={r.priority === 'Urgent' ? 'error' : 'warning'} label={r.priority}/></Stack><Typography variant="body2" sx={{ mt: 1 }}>Consider transfer of <b>{r.quantity} units</b></Typography><Typography variant="caption" color="text.secondary">{r.reason}</Typography></Box>)}{!insights.recommendations.length && <Empty text="No cross-centre transfers suggested. Add matching generic names at multiple centres to compare stock."/>}</Stack></Paper></Grid><Grid item xs={12}><Paper className="panel" elevation={0}><SectionTitle eyebrow="FACILITY WATCHLIST" title="Centres needing intervention" detail="Flags include low doctor attendance, high bed occupancy, stock-outs and unavailable tests."/><Grid container spacing={1.4}>{insights.underperforming.map(c => <Grid item xs={12} md={6} xl={4} key={c.id}><Box className="watch-card"><Stack direction="row" alignItems="center" spacing={1}><Avatar variant="rounded" className="centre-avatar"><LocalHospitalRounded/></Avatar><Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={800} noWrap>{c.name}</Typography><Typography variant="caption" color="text.secondary">{c.code} · {c.district}</Typography></Box><StatusChip status={c.status}/></Stack><Divider sx={{ my: 1.3 }}/><Stack spacing={0.7}>{c.reasons.map(reason => <Stack key={reason} direction="row" spacing={0.8} alignItems="flex-start"><WarningAmberRounded sx={{ fontSize: 16, color: 'warning.main', mt: '2px' }}/><Typography variant="body2">{reason}</Typography></Stack>)}</Stack><Button size="small" fullWidth sx={{ mt: 1.5 }} onClick={() => { const match = centres.find(x => x._id === c.id); if (match) setSelectedCentre(match); }}>Update centre report</Button></Box></Grid>)}{!insights.underperforming.length && <Grid item xs={12}><Empty text="All registered centres are on track against the current demo thresholds."/></Grid>}</Grid></Paper></Grid><Grid item xs={12}><Paper className="panel" elevation={0}><SectionTitle eyebrow="DAILY FOOTFALL" title="Demand distribution"/><Box sx={{ height: 240 }}><ResponsiveContainer><AreaChart data={summary?.demand || []} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}><defs><linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f766e" stopOpacity={0.22}/><stop offset="95%" stopColor="#0f766e" stopOpacity={0.01}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9eef4"/><XAxis dataKey="name" tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false}/><YAxis tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false}/><ChartTooltip/><Area type="monotone" dataKey="today" name="Patients today" stroke="#0f766e" strokeWidth={2.5} fill="url(#demandGradient)"/></AreaChart></ResponsiveContainer></Box></Paper></Grid></Grid></>}
        </>}
        <Box className="page-footer"><Typography variant="caption" color="text.secondary">Smart Health · Hackathon prototype · Operational data only, no patient-identifying information</Typography><Typography variant="caption" color="text.secondary">Rules-based decision support · v1.0</Typography></Box>
      </Container>
    </Box>
    <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>{SideNav}</Drawer>
    <CentreDialog open={centreDialog} onClose={() => setCentreDialog(false)} onSave={createCentre} busy={saving}/>
    <MedicineDialog open={medicineDialog} onClose={() => setMedicineDialog(false)} onSave={createMedicine} centres={centres} busy={saving}/>
    <OperationsDialog open={Boolean(selectedCentre)} centre={selectedCentre} onClose={() => setSelectedCentre(null)} onSave={saveOperations} busy={saving}/>
    <FloatingActions onCall={() => setSnackbar('Configure VITE_HEALTH_CONTACT_PHONE in frontend/.env to enable calling.')} onBook={() => setSnackbar('Add an appointment workflow to enable booking.')} onContact={() => setSnackbar('Contact your district health administrator.')} />
    <Snackbar open={Boolean(snackbar)} autoHideDuration={4000} onClose={() => setSnackbar('')} message={snackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}/>
  </Box>;
}

function Legend({ color, label }) { return <Stack direction="row" alignItems="center" spacing={0.7}><Box sx={{ width: 8, height: 8, borderRadius: 2, bgcolor: color }}/><Typography variant="caption" color="text.secondary">{label}</Typography></Stack>; }
function Empty({ text }) { return <Box sx={{ py: 4, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">{text}</Typography></Box>; }
function SearchBar({ value, onChange, placeholder }) { return <TextField fullWidth size="small" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} InputProps={{ startAdornment: <SearchRounded sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }}/> }} sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 3 } }}/>; }

export default App;
