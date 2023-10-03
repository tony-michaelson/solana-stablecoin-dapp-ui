import { typedAction } from '../helpers'
import { None, StakingState } from '../../types'
import produce from 'immer'
import { RootState } from '..'
import {
  RewardAccount,
  StakeBalanceWithAmounts,
  StakingStateAccount,
} from '@lucra/sdk'
import { StakeAccount } from '@lucra/sdk/state/stakeAccount'
import { StakeBalance } from '@lucra/sdk/state/stakeBalance'
import { PublicKey } from '@solana/web3.js'

const initialState: StakingState = {
  stakeAccount: null,
  refreshStakeAccount: false,
  balances: null,
  refreshBalances: false,
  stakingState: null,
  refreshStakingState: false,
  rewardAccounts: null,
  lastRewardAccount: null,
  rewardClaims: [],
  walletKey: null,
  signature: {
    create: null,
    create2: null,
    deposit: null,
    stake: null,
    claim: null,
    unstake: null,
  },
  modal: {
    account: null,
    deposit: false,
    unstake: false,
  },
}

// DISPATCHES
export const setStakeAccount = (stakeAccount: StakeAccount | null | None) => {
  return typedAction('staking/SET_STAKE_ACCOUNT', {
    stakeAccount,
  })
}

export const setStakeBalances = (
  balances: StakeBalance[] | null,
  walletAddress: PublicKey | null
) => {
  return typedAction('staking/SET_STAKE_BALANCES', { balances, walletAddress })
}

export const setRefreshBalances = (refresh: boolean) => {
  return typedAction('staking/SET_REFRESH_BALANCES', refresh)
}

export const setRewardAccounts = (rewardAccount: RewardAccount[] | null) => {
  return typedAction('staking/SET_REWARD_ACCOUNTS', rewardAccount)
}
export const setLastRewardAccount = (rewardAccount: RewardAccount | null) => {
  return typedAction('staking/SET_LAST_REWARD_ACCOUNT', rewardAccount)
}

export const setRefreshStakeAccount = (refreshStakeAccount: boolean) => {
  return typedAction('staking/SET_REFRESH_STAKE_ACCOUNT', refreshStakeAccount)
}

export const setStakingState = (stakingState: StakingStateAccount) => {
  return typedAction('staking/SET_STAKE_STATE', {
    stakingState,
  })
}

export const setRefreshStakingState = (refresh: boolean) => {
  return typedAction('staking/SET_REFRESH_STAKING_STATE', refresh)
}

export const setCreateStakeSignature = (signature: string | null) => {
  return typedAction('staking/SET_STAKE_CREATE', signature)
}

export const setCreateStake2Signature = (signature: string | null) => {
  return typedAction('staking/SET_STAKE_CREATE2', signature)
}

export const setUnStakeSignature = (signature: string | null) => {
  return typedAction('staking/SET_UNSTAKE_SIGNATURE', {
    signature,
  })
}

export const setDepositStakeModal = (open: boolean, callback?: Function) => {
  return typedAction('staking/SET_DEPOSIT_STAKE_MODAL', {
    open,
    callback,
  })
}

export const setUnStakeModal = (open: boolean, callback?: Function) => {
  return typedAction('staking/SET_UNSTAKE_MODAL', {
    open,
    callback,
  })
}

export const setModalAccount = (account: StakeBalanceWithAmounts | null) => {
  return typedAction('staking/SET_STAKE_MODAL_ACCOUNT', {
    account,
  })
}

type StakingAction = ReturnType<
  | typeof setStakeAccount
  | typeof setStakeBalances
  | typeof setRefreshBalances
  | typeof setRewardAccounts
  | typeof setLastRewardAccount
  | typeof setRefreshStakeAccount
  | typeof setStakingState
  | typeof setRefreshStakingState
  | typeof setCreateStakeSignature
  | typeof setCreateStake2Signature
  | typeof setUnStakeSignature
  | typeof setDepositStakeModal
  | typeof setUnStakeModal
  | typeof setModalAccount
>

// REDUCER
export function stakingReducer(
  state: StakingState = initialState,
  action: StakingAction
): StakingState {
  switch (action.type) {
    case 'staking/SET_STAKE_ACCOUNT':
      return produce(state, (draftState: StakingState) => {
        draftState.stakeAccount = action.payload.stakeAccount
      })
    case 'staking/SET_LAST_REWARD_ACCOUNT':
      return produce(state, (draftState: StakingState) => {
        draftState.lastRewardAccount = action.payload
      })
    case 'staking/SET_REWARD_ACCOUNTS':
      return produce(state, (draftState: StakingState) => {
        draftState.rewardAccounts = action.payload
      })
    case 'staking/SET_REFRESH_STAKE_ACCOUNT':
      return produce(state, (draftState: StakingState) => {
        draftState.refreshStakeAccount = action.payload
      })
    case 'staking/SET_REFRESH_BALANCES':
      return produce(state, (draftState: StakingState) => {
        draftState.refreshBalances = action.payload
      })
    case 'staking/SET_STAKE_BALANCES':
      return produce(state, (draftState: StakingState) => {
        draftState.balances = action.payload.balances
        draftState.walletKey = action.payload.walletAddress
      })
    case 'staking/SET_STAKE_STATE':
      return produce(state, (draftState: StakingState) => {
        draftState.stakingState = action.payload.stakingState
      })
    case 'staking/SET_REFRESH_STAKING_STATE':
      return produce(state, (draftState: StakingState) => {
        draftState.refreshStakingState = action.payload
      })
    case 'staking/SET_STAKE_CREATE':
      return produce(state, (draftState: StakingState) => {
        draftState.signature.create = action.payload
      })
    case 'staking/SET_STAKE_CREATE2':
      return produce(state, (draftState: StakingState) => {
        draftState.signature.create2 = action.payload
      })
    case 'staking/SET_UNSTAKE_SIGNATURE':
      return produce(state, (draftState: StakingState) => {
        draftState.signature.unstake = action.payload.signature
      })
    case 'staking/SET_DEPOSIT_STAKE_MODAL':
      return produce(state, (draftState: StakingState) => {
        draftState.modal.deposit = action.payload.open
        draftState.modal.callback = action.payload.callback
      })
    case 'staking/SET_UNSTAKE_MODAL':
      return produce(state, (draftState: StakingState) => {
        draftState.modal.unstake = action.payload.open
        draftState.modal.callback = action.payload.callback
      })
    case 'staking/SET_STAKE_MODAL_ACCOUNT':
      return produce(state, (draftState: StakingState) => {
        draftState.modal.account = action.payload.account
      })
    default:
      return state
  }
}

// SELECTORS
export const getStakeAccount = (state: RootState): StakeAccount | null | None =>
  state.staking.stakeAccount

export const getRewardAccounts = (state: RootState): RewardAccount[] | null =>
  state.staking.rewardAccounts

export const getLastRewardAccount = (state: RootState): RewardAccount | null =>
  state.staking.lastRewardAccount

export const getRefreshStakeAccount = (state: RootState): boolean =>
  state.staking.refreshStakeAccount

export const getStakeBalances = (state: RootState): StakeBalance[] | null =>
  state.staking.balances

export const getRefreshBalances = (state: RootState): boolean =>
  state.staking.refreshBalances

export const getStakingInfo = (state: RootState): StakingState => state.staking

export const getStakeState = (state: RootState): StakingStateAccount | null =>
  state.staking.stakingState

export const getRefreshStakingState = (state: RootState): boolean =>
  state.staking.refreshStakingState

export const getCreateStakeSignature = (state: RootState): string | null =>
  state.staking.signature.create

export const getCreateStake2Signature = (state: RootState): string | null =>
  state.staking.signature.create2

export const getStakeSignature = (state: RootState): string | null =>
  state.staking.signature.stake

export const getUnStakeSignature = (state: RootState): string | null =>
  state.staking.signature.unstake

export const getDepositStakeModal = (state: RootState): boolean =>
  state.staking.modal.deposit

export const getUnStakeModal = (state: RootState): boolean =>
  state.staking.modal.unstake

export const getStakingModalCallback = (
  state: RootState
): Function | undefined => state.staking.modal.callback

export const getStakeModalAccount = (
  state: RootState
): StakeBalanceWithAmounts | null => state.staking.modal.account
