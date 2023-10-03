import { createTheme, styled, TextField } from '@mui/material'
import { makeStyles } from '@material-ui/core'
import { paletteTheme } from './utils/constants'

export const theme = createTheme({
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: paletteTheme.palette.white.main + ' !important',
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          '::after': {
            borderBottom: '2px solid ' + paletteTheme.palette.white.main,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        filled: {
          borderBottom: '2px solid ' + paletteTheme.palette.white.main,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: {
          borderRadius: 0,
          fontFamily: 'var(--main-font-family-regular)',
          fontWeight: 700,
          color: paletteTheme.palette.gold.main,
          border: '1px solid',
          borderColor: paletteTheme.palette.gold.main,
          '&:hover': {
            color: paletteTheme.palette.white.main,
            background: paletteTheme.palette.gold.main,
            borderColor: paletteTheme.palette.gold.main,
          },
          '&:disabled': {
            color: paletteTheme.palette.gold.main,
            borderColor: paletteTheme.palette.gold.main,
            opacity: 0.5,
          },
          textTransform: 'none',
        },
        contained: {
          borderRadius: 0,
          fontFamily: 'var(--main-font-family-regular)',
          fontWeight: 700,
          color: paletteTheme.palette.black.main,
          background:
            'linear-gradient(164.1deg, #BC3926 -98.73%, #EEB854 88.96%), linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)), linear-gradient(95.89deg, #AC82FF -8.99%, #1C85C4 197.65%), rgba(132, 72, 251, 0.1)',
          '&:hover': {
            color: paletteTheme.palette.white.main,
          },
          '&:disabled': {
            color: paletteTheme.palette.black.main,
            opacity: 0.5,
          },
          textTransform: 'none',
        },
        disabled: {},
      },
    },
  },
})

export const CssTextField = styled(TextField)({
  '& label.MuiInputLabel': {
    color: 'white',
  },
  '& label.MuiInputLabel-root': {
    color: 'white',
  },
  '& label.Mui-focused': {
    color: 'white',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: 'green',
  },
  '& .MuiInputBase-root': {
    color: 'white',
    backgroundColor: 'transparent',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'white',
    },
    '&:hover fieldset': {
      borderColor: 'white',
    },
    '&.Mui-focused fieldset': {
      borderColor: paletteTheme.palette.gold.main,
    },
  },
})

export const InputField = styled(TextField)({
  '& label.MuiInputLabel': {
    color: 'white',
  },
  '& label.MuiInputLabel-root': {
    color: 'white',
  },
  '& label.Mui-focused': {
    color: 'white',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: 'none',
  },
  '& .MuiInputBase-root': {
    color: 'white',
    backgroundColor: 'transparent',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'white',
    },
    '&:hover fieldset': {
      borderColor: 'white',
    },
    '&.Mui-focused fieldset': {
      borderColor: paletteTheme.palette.gold.main,
    },
  },
})

export const useStyles = makeStyles({
  link: {
    color: '#ffffff',
    textAlign: 'center',
    textDecoration: 'none',
    '&:hover': {
      color: paletteTheme.palette.gold.main,
    },
    marginRight: '15px',
  },
  icon: {
    position: 'absolute',
    fontSize: 20,
  },
})
