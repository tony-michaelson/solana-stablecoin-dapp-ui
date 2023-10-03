import { typedAction } from '../helpers'
import { BondsState } from '../../types'
import produce from 'immer'
import { RootState } from '..'
import { BondSystemAccount } from '@lucra/sdk/state/bondSystem'
import { BondSystemBalances, SystemNames } from '@lucra/sdk'
import { BondAccount } from '@lucra/sdk/state/bond'
import { PublicKey } from '@solana/web3.js'

const initialState: BondsState = {
  systems: null,
  buyBondTransactionSignature: null,
  bonds: null,
  refreshBonds: false,
  walletKey: null,
  modal: {
    system: null,
    buy: false,
  },
  bondSystemBalances: null,
}

// DISPATCHES
export const setBondSystemsList = (systems: BondSystemAccount[] | null) => {
  return typedAction('bonds/SET_BONDSYS_LIST', {
    systems,
  })
}

export const setBondSystemBalances = (balances: BondSystemBalances | null) => {
  return typedAction('bonds/SET_BONDSYS_BALANCES', {
    balances,
  })
}

export const setBondsList = (
  bonds: BondAccount[] | null,
  walletKey: PublicKey
) => {
  return typedAction('bonds/SET_BOND_LIST', {
    bonds: bonds,
    walletKey: walletKey,
  })
}

export const setRefreshBondsList = (refreshBonds: boolean) => {
  return typedAction('bonds/SET_REFRESH_BOND_LIST', {
    refreshBonds,
  })
}

export const setBuyBondTransactionSignature = (signature: string | null) => {
  return typedAction('bonds/SET_BUYBOND_TRANSACTION_SIGNATURE', {
    setBuyBondTransactionSignature: signature,
  })
}

export const setBuyBondModal = (open: boolean, system?: SystemNames) => {
  return typedAction('bonds/SET_BUYBOND_MODAL', {
    buyBondModal: open,
    system,
  })
}

type BondsAction = ReturnType<
  | typeof setBondSystemsList
  | typeof setBondSystemBalances
  | typeof setBuyBondTransactionSignature
  | typeof setBuyBondModal
  | typeof setBondsList
  | typeof setRefreshBondsList
>

// REDUCER
export function bondsReducer(
  state: BondsState = initialState,
  action: BondsAction
): BondsState {
  switch (action.type) {
    case 'bonds/SET_BONDSYS_LIST':
      return produce(state, (draftState: BondsState) => {
        draftState.systems = action.payload.systems
      })
    case 'bonds/SET_BONDSYS_BALANCES':
      return produce(state, (draftState: BondsState) => {
        draftState.bondSystemBalances = action.payload.balances
      })
    case 'bonds/SET_BOND_LIST':
      return produce(state, (draftState: BondsState) => {
        draftState.bonds = action.payload.bonds
        draftState.walletKey = action.payload.walletKey
      })
    case 'bonds/SET_REFRESH_BOND_LIST':
      return produce(state, (draftState: BondsState) => {
        draftState.refreshBonds = action.payload.refreshBonds
      })
    case 'bonds/SET_BUYBOND_TRANSACTION_SIGNATURE':
      return produce(state, (draftState: BondsState) => {
        draftState.buyBondTransactionSignature =
          action.payload.setBuyBondTransactionSignature
      })
    case 'bonds/SET_BUYBOND_MODAL':
      return produce(state, (draftState: BondsState) => {
        draftState.modal.buy = action.payload.buyBondModal
        action.payload.system &&
          (draftState.modal.system = action.payload.system)
      })
    default:
      return state
  }
}

// SELECTORS
export const getBondSystems = (state: RootState): BondSystemAccount[] | null =>
  state.bonds.systems

export const getBondSystemBalances = (
  state: RootState
): BondSystemBalances | null => state.bonds.bondSystemBalances

export const getBonds = (state: RootState): BondsState => state.bonds

export const getBondsList = (state: RootState): BondAccount[] | null =>
  state.bonds.bonds

export const getRefreshBonds = (state: RootState): boolean =>
  state.bonds.refreshBonds

export const getBuyBondTransactionSignature = (
  state: RootState
): string | null => state.bonds.buyBondTransactionSignature

export const getBuyBondModal = (state: RootState): boolean =>
  state.bonds.modal.buy

export const getBondModalCallback = (state: RootState): Function | undefined =>
  state.bonds.modal.callback

export const getBondModalBondSystem = (state: RootState): SystemNames | null =>
  state.bonds.modal.system
