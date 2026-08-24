import { createTheme } from '@mui/material/styles';

const pwcColors = {
  primary: '#FF5A14',
  primaryHover: '#F56B2F',
  button: '#FF7A45',
  sidebar: '#4A4A4A',
  backgroundLight: '#FFFFFF',
  backgroundInput: '#FFF7F2',
  borderLight: '#D8D8D8',
  borderOrange: '#FF8A55',
  textPrimary: '#666666',
  textSecondary: '#888888',
  placeholder: '#B0B0B0',
  white: '#FFFFFF',
};

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: pwcColors.primary,
      light: pwcColors.button,
      dark: pwcColors.primaryHover,
      contrastText: pwcColors.white,
    },
    secondary: {
      main: pwcColors.sidebar,
      contrastText: pwcColors.white,
    },
    background: {
      default: mode === 'light' ? '#f8fafc' : '#0b0f19',
      paper: mode === 'light' ? pwcColors.backgroundLight : '#111827',
      input: mode === 'light' ? pwcColors.backgroundInput : '#1f2937',
    },
    text: {
      primary: mode === 'light' ? pwcColors.textPrimary : '#f8fafc',
      secondary: mode === 'light' ? pwcColors.textSecondary : '#94a3b8',
      disabled: pwcColors.placeholder,
    },
    divider: mode === 'light' ? pwcColors.borderLight : '#1f2937',
    action: {
      hover: mode === 'light' ? 'rgba(255, 90, 20, 0.08)' : 'rgba(255, 90, 20, 0.16)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { color: mode === 'light' ? pwcColors.textPrimary : '#f8fafc' },
    h2: { color: mode === 'light' ? pwcColors.textPrimary : '#f8fafc' },
    h3: { color: mode === 'light' ? pwcColors.textPrimary : '#f8fafc' },
    h4: { color: mode === 'light' ? pwcColors.textPrimary : '#f8fafc' },
    h5: { color: mode === 'light' ? pwcColors.textPrimary : '#f8fafc' },
    h6: { color: mode === 'light' ? pwcColors.textPrimary : '#f8fafc' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: pwcColors.button,
          color: pwcColors.white,
          '&:hover': {
            backgroundColor: pwcColors.primaryHover,
          },
        },
        outlinedPrimary: {
          borderColor: pwcColors.borderOrange,
          color: pwcColors.primary,
          backgroundColor: mode === 'light' ? pwcColors.white : 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(255, 90, 20, 0.04)',
            borderColor: pwcColors.primaryHover,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: mode === 'light' ? pwcColors.backgroundInput : '#1f2937',
            '& fieldset': {
              borderColor: mode === 'light' ? pwcColors.borderLight : '#374151',
            },
            '&:hover fieldset': {
              borderColor: pwcColors.borderOrange,
            },
            '&.Mui-focused fieldset': {
              borderColor: pwcColors.borderOrange,
            },
          },
          '& .MuiInputBase-input::placeholder': {
            color: pwcColors.placeholder,
            opacity: 1,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${mode === 'light' ? pwcColors.borderLight : '#1f2937'}`,
          boxShadow: mode === 'light' ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${mode === 'light' ? pwcColors.borderLight : '#1f2937'}`,
        },
        head: {
          fontWeight: 700,
          color: mode === 'light' ? pwcColors.textPrimary : '#cbd5e1',
          backgroundColor: mode === 'light' ? '#f8fafc' : '#1f2937',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: mode === 'light' ? pwcColors.backgroundInput : '#1e293b',
          },
        },
      },
    },
  },
});

export const createAppTheme = (mode) => createTheme(getDesignTokens(mode));
