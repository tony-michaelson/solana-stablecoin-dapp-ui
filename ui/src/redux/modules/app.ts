import { typedAction } from '../helpers'
import {
  AppConfigs,
  AppState,
  OraclePrices,
  UiMode,
  WindowSize,
} from '../../types'
import produce from 'immer'
import { RootState } from '..'
import {
  BOND_DEVNET_CONFIG,
  BOND_DEVNET_SYSTEMS,
  LUCRA_DEVNET_CONFIG,
  MARINADE_DEVNET_CONFIG,
} from '@lucra/sdk'

const initialState: AppState = {
  screen: {
    windowHeight: 0,
    windowWidth: 0,
  },
  uiMode: 'desktop',
  oraclePrices: {
    SOL_USDC: null,
    SOL_USDT: null,
    SOL_MATA: null,
    LUCRA_SOL: null,
  },
  config: {
    lucra: LUCRA_DEVNET_CONFIG,
    bonds: BOND_DEVNET_CONFIG,
    bondSystems: BOND_DEVNET_SYSTEMS,
    marinade: MARINADE_DEVNET_CONFIG,
  },
}

// DISPATCHES
export const setScreen = (screen: WindowSize, uiMode: UiMode) => {
  return typedAction('app/SET_SCREEN', {
    screen,
    uiMode,
  })
}

export const setOraclePrices = (price: OraclePrices) => {
  return typedAction('app/SET_ORACLE_PRICES', price)
}

export const setConfigs = (configs: AppConfigs) => {
  return typedAction('app/SET_APP_CONFIGS', configs)
}

type AppStateAction = ReturnType<
  typeof setScreen | typeof setOraclePrices | typeof setConfigs
>

// REDUCER
export function appReducer(
  state: AppState = initialState,
  action: AppStateAction
): AppState {
  switch (action.type) {
    case 'app/SET_SCREEN':
      return produce(state, (draftState: AppState) => {
        draftState.screen = action.payload.screen
        draftState.uiMode = action.payload.uiMode
      })
    case 'app/SET_ORACLE_PRICES':
      return produce(state, (draftState: AppState) => {
        draftState.oraclePrices = action.payload
      })
    case 'app/SET_APP_CONFIGS':
      return produce(state, (draftState: AppState) => {
        draftState.config = action.payload
      })
    default:
      return state
  }
}

// SELECTORS
export const getScreen = (state: RootState) => state.app.screen
export const getUiMode = (state: RootState) => state.app.uiMode
export const getOraclePrices = (state: RootState) => state.app.oraclePrices
export const getConfigs = (state: RootState) => state.app.config
