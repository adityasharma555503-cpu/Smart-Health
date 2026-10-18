import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CachedRounded,
  MenuRounded,
  NotificationsActiveRounded,
  TranslateRounded,
} from '@mui/icons-material';

/** The single shared header for the Smart Health dashboard. */
export default function TopNavbar({
  page,
  small,
  language = 'en',
  onLanguageChange,
  onMenuClick,
  onRefresh,
  onNotificationsClick,
}) {
  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      className="topbar"
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        borderBottom: '1px solid #e7edf3',
        backgroundColor: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Toolbar
        className="topbar-toolbar"
        sx={{
          minHeight: { xs: 62, sm: 70 },
          px: { xs: 1.25, sm: 2.5 },
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        {small && (
          <Tooltip title="Open navigation">
            <IconButton onClick={onMenuClick} aria-label="Open navigation" size="medium">
              <MenuRounded />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: { xs: 11.5, sm: 13.5 } }}
          >
            District health operations
            <Box component="span" sx={{ mx: 0.7, color: '#9aa8b6' }}>/</Box>
            <Box component="span" color="text.primary" fontWeight={800}>{page}</Box>
          </Typography>
        </Box>

        <Tooltip title="Refresh dashboard data">
          <IconButton onClick={onRefresh} aria-label="Refresh dashboard" size="small" sx={{ color: '#536779' }}>
            <CachedRounded />
          </IconButton>
        </Tooltip>

        <Tooltip title={language === 'en' ? 'Switch interface label to Hindi (demo toggle)' : 'Switch interface label to English (demo toggle)'}>
          <Button
            onClick={() => onLanguageChange?.(language === 'en' ? 'hi' : 'en')}
            startIcon={<TranslateRounded />}
            size="small"
            variant="outlined"
            aria-label="Change language"
            sx={{
              ml: 0.25,
              minWidth: { xs: 56, sm: 76 },
              px: { xs: 1, sm: 1.25 },
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 800,
              borderColor: '#b8e3da',
              color: '#0f766e',
              backgroundColor: '#f0fdfa',
              '&:hover': { backgroundColor: '#dff7f1', borderColor: '#79c9b9' },
              '& .MuiButton-startIcon': { mr: 0.5 },
            }}
          >
            {language === 'en' ? 'EN' : 'हि'}
          </Button>
        </Tooltip>

        <Tooltip title="View alerts and insights">
          <IconButton onClick={onNotificationsClick} aria-label="View alerts and insights" size="small" sx={{ color: '#536779' }}>
            <NotificationsActiveRounded />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: { xs: 0.25, sm: 0.75 }, borderColor: '#e5ebf0' }} />
        <Avatar sx={{ width: 34, height: 34, bgcolor: '#d8f3eb', color: '#0f766e', fontWeight: 800, fontSize: 14 }}>DA</Avatar>
        {!small && (
          <Box sx={{ ml: 0.25, minWidth: 98 }}>
            <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.25 }}>District Admin</Typography>
            <Typography variant="caption" color="text.secondary">Operations team</Typography>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
