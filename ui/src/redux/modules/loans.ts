import { typedAction } from '../helpers'
import { LoansState, NotifyFunction } from '../../types'
import produce from 'immer'
import { RootState } from '..'
import { PublicKey } from '@solana/web3.js'
import { RICHUAL_LIST_SCANNER_TIMEOUT } from '../../utils/constants'
import { LoanAccount } from '@lucra/sdk/state/loan'

const initialState: LoansState = {
  notify: null,
  list: [],
  openLoanTransactionSignature: null,
  walletKey: null,
  scan: false,
  scanStartTime: null,
  scanTimer: null,
  openLoanModal: false,
}

// DISPATCHES
export const setLoansList = (
  loans: LoanAccount[] | null,
  walletKey: PublicKey | null
) => {
  return typedAction('loans/SET_LOAN_LIST', {
    loans: loans,
    walletKey: walletKey,
  })
}

export const setOpenLoanTransactionSignature = (
  openLoanTransactionSignature: string | null
) => {
  return typedAction('loans/SET_OPEN_LOAN_TRANSACTION_SIGNATURE', {
    openLoanTransactionSignature: openLoanTransactionSignature,
  })
}

export const setNotifier = (notify: NotifyFunction) => {
  return typedAction('loans/SET_NOTIFIER', {
    notify: notify,
  })
}

export const setScanForNewLoans = (scan: boolean) => {
  return typedAction('loans/SET_LOAN_SCAN', {
    scan: scan,
  })
}

export const setScanTimer = (
  startTime: number | null,
  scanTimer: NodeJS.Timer | null
) => {
  return typedAction('loans/SET_LOAN_SCAN_TIMER', {
    scanStartTime: startTime,
    scanTimer: scanTimer,
  })
}

export const checkTimeout = () => {
  return typedAction('loans/CHECK_LOAN_SCAN_TIMEOUT')
}

export const setOpenLoanModal = (open: boolean) => {
  return typedAction('loans/SET_OPEN_LOAN_MODAL', {
    openLoanModal: open,
  })
}

type LoansAction = ReturnType<
  | typeof setLoansList
  | typeof setScanForNewLoans
  | typeof setScanTimer
  | typeof checkTimeout
  | typeof setNotifier
  | typeof setOpenLoanModal
  | typeof setOpenLoanTransactionSignature
>

// REDUCER
export function loansReducer(
  state: LoansState = initialState,
  action: LoansAction
): LoansState {
  switch (action.type) {
    case 'loans/SET_LOAN_LIST':
      return produce(state, (draftState: LoansState) => {
        draftState.list = action.payload.loans
        draftState.walletKey = action.payload.walletKey
        draftState.scan = false
        if (draftState.scanTimer) {
          clearInterval(draftState.scanTimer)
          draftState.scanStartTime = null
          draftState.scanTimer = null
        }
      })
    case 'loans/SET_OPEN_LOAN_TRANSACTION_SIGNATURE':
      return produce(state, (draftState: LoansState) => {
        draftState.openLoanTransactionSignature =
          action.payload.openLoanTransactionSignature
      })
    case 'loans/SET_NOTIFIER':
      return produce(state, (draftState: LoansState) => {
        draftState.notify = action.payload.notify
      })
    case 'loans/CHECK_LOAN_SCAN_TIMEOUT':
      return produce(state, (draftState: LoansState) => {
        const currentTime = new Date().getTime()
        if (
          draftState.scanTimer &&
          draftState.scanStartTime &&
          currentTime - draftState.scanStartTime >
            RICHUAL_LIST_SCANNER_TIMEOUT * 1000
        ) {
          draftState.notify &&
            draftState.notify(
              'warning',
              'Timeout of ' +
                RICHUAL_LIST_SCANNER_TIMEOUT +
                ' Seconds Reached for Richual List Refresh'
            )
          clearInterval(draftState.scanTimer)
          draftState.scanStartTime = null
          draftState.scanTimer = null
          draftState.scan = false
        }
      })
    case 'loans/SET_LOAN_SCAN':
      return produce(state, (draftState: LoansState) => {
        draftState.scan = action.payload.scan
      })
    case 'loans/SET_LOAN_SCAN_TIMER':
      return produce(state, (draftState: LoansState) => {
        // CLEAR INTERVAL IF SETTING TO NULL
        if (draftState.scanTimer && action.payload.scanTimer === null) {
          clearInterval(draftState.scanTimer)
        }
        draftState.scanStartTime = action.payload.scanStartTime
        draftState.scanTimer = action.payload.scanTimer
      })
    case 'loans/SET_OPEN_LOAN_MODAL':
      return produce(state, (draftState: LoansState) => {
        draftState.openLoanModal = action.payload.openLoanModal
      })
    default:
      return state
  }
}

// SELECTORS
export const getLoans = (state: RootState) => state.loans
export const getOpenLoanModal = (state: RootState) => state.loans.openLoanModal
export const getOpenLoanTransactionSignature = (state: RootState) =>
  state.loans.openLoanTransactionSignature
