import { createTheme } from '@mui/material'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'

export const MATA_PORTS = 1000000
export const LUCRA_PORTS = LAMPORTS_PER_SOL

export const RICHUAL_LIST_SCANNER_TIMEOUT = 60
export const MIN_DESKTOP_SCREEN_WIDTH = 920

// TODO; get from onchain state
export const COLLATERAL_RATE = 3
export const REDUCED_COLLATERAL_RATE = 1.5
export const EPOCH_DAYS = 7

export const STAKING_TIMEFRAME: {
  weight: number
  inflation: number
  duration: string
}[] = [
  { weight: 1, inflation: 3, duration: '1 Week' },
  { weight: 6, inflation: 6, duration: '1 Year' },
  { weight: 12, inflation: 15, duration: '2 Years' },
]

export const MARINADE_STATE_ID = new PublicKey(
  '8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC'
)

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
)

/** Address of the SPL Token program */
export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
)

/** Address of the SPL Token 2022 program */
export const TOKEN_2022_PROGRAM_ID = new PublicKey(
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
)

declare module '@mui/material/styles' {
  interface Palette {
    gold: Palette['primary']
    black: Palette['primary']
    white: Palette['primary']
    solid_grey: Palette['primary']
    grey_blue: Palette['primary']
  }
  interface PaletteOptions {
    gold?: PaletteOptions['primary']
    black?: PaletteOptions['primary']
    white?: PaletteOptions['primary']
    solid_grey?: PaletteOptions['primary']
    grey_blue?: PaletteOptions['primary']
  }
}

export const paletteTheme = createTheme({
  palette: {
    text: {
      primary: '#FFFFFF',
      secondary: '#C8D5E1',
    },
    gold: {
      main: '#B39D74',
    },
    black: {
      main: '#000000',
    },
    white: {
      main: '#FFFFFF',
    },
    solid_grey: {
      main: '#515151',
    },
    grey_blue: {
      main: '#C8D5E1',
    },
  },
})
