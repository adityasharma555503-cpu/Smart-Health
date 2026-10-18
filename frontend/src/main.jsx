import React from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App.jsx';
import './styles.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0f766e', dark: '#115e59', light: '#ccfbf1' },
    secondary: { main: '#6172d8' },
    background: { default: '#f5f7fb', paper: '#ffffff' },
    success: { main: '#18866a' },
    warning: { main: '#c17a18' },
    error: { main: '#c2414b' },
    text: { primary: '#142b3b', secondary: '#637587' },
    divider: '#e8edf2'
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 800 }, h2: { fontWeight: 800 }, h3: { fontWeight: 800 }, h4: { fontWeight: 750 },
    h5: { fontWeight: 750 }, h6: { fontWeight: 750 }, button: { textTransform: 'none', fontWeight: 700 }
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTableCell: { styleOverrides: { head: { color: '#637587', fontWeight: 700, backgroundColor: '#f8fafc' } } }
  }
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode><ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider></React.StrictMode>
);
