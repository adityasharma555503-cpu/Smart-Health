import { Box, Tooltip, Typography } from '@mui/material';
import {
  PhoneInTalkRounded,
  CalendarMonthRounded,
  MailOutlineRounded,
  KeyboardArrowUpRounded,
} from '@mui/icons-material';

const actionSx = {
  width: 62,
  minHeight: 62,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.4,
  color: '#fff',
  textDecoration: 'none',
  borderRadius: '12px 0 0 12px',
  boxShadow: '0 5px 18px rgba(15, 23, 42, .18)',
  transition: 'width .18s ease, filter .18s ease, transform .18s ease',
  '&:hover': { width: 72, filter: 'brightness(1.08)' },
  '&:focus-visible': { outline: '3px solid #fff', outlineOffset: '-4px' },
};

function Action({ label, icon, href, color, onClick }) {
  return (
    <Tooltip title={label} placement="left">
      <Box
        component={href ? 'a' : 'button'}
        {...(href ? { href } : {})}
        onClick={onClick}
        aria-label={label}
        title={label}
        sx={{ ...actionSx, bgcolor: color, border: 0, cursor: 'pointer', font: 'inherit', p: 1 }}
      >
        {icon}
        <Typography component="span" sx={{ color: 'inherit', fontSize: 11, lineHeight: 1.1, fontWeight: 800 }}>
          {label}
        </Typography>
      </Box>
    </Tooltip>
  );
}

export default function FloatingActions({ onCall, onBook, onContact }) {
  const configuredPhone = (import.meta.env.VITE_HEALTH_CONTACT_PHONE || '').trim();

  return (
    <Box
      aria-label="Quick actions"
      sx={{
        position: 'fixed',
        right: 0,
        top: '25%',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        '@media (max-width:600px)': { top: 'auto', bottom: 18, gap: 0.35 },
      }}
    >
      <Action
        label="Call"
        icon={<PhoneInTalkRounded fontSize="small" />}
        color="#dc2635"
        href={configuredPhone ? `tel:${configuredPhone}` : undefined}
        onClick={configuredPhone ? undefined : onCall}
      />
      <Action label="Book" icon={<CalendarMonthRounded fontSize="small" />} color="#109b85" onClick={onBook} />
      <Action label="Contact" icon={<MailOutlineRounded fontSize="small" />} color="#07544d" onClick={onContact} />
      <Action
        label="Top"
        icon={<KeyboardArrowUpRounded fontSize="small" />}
        color="#64716f"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
    </Box>
  );
}
