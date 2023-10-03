import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { VariantType, SnackbarKey } from 'notistack'
import {
  BondSystemAccounts,
  SystemNames,
  BondAccount,
  RewardAccount,
  StakeAccountWithBalances,
  StakingStateAccount,
  StakeBalance,
  StakeBalanceAmounts,
  BondSystem,
  BondSystemAccount,
  BondSystemBalance,
  LucraOracles,
  LucraConfig,
  BondConfig,
  MarinadeConfig,
  BondSystems,
} from '@lucra/sdk'
import { OracleAccount } from '@lucra/sdk/state/oracle'

export type ArbToken = 'MATA' | 'LUCRA'

export type LockupDuration = 0 | 1 | 2

export interface BondSystemPair {
  bond: BondAccount
  system: BondSystemAccount
}

export interface WindowSize {
  windowWidth: number
  windowHeight: number
}

export type OraclePrices = {
  [key in LucraOracles]:
    | (OracleAccount & { slotDiff: bigint } & { validPrices: number })
    | null
}

export type UiMode = 'desktop' | 'mobile'

export type AppConfigs = {
  lucra: LucraConfig
  bonds: BondConfig
  bondSystems: BondSystems
  marinade: MarinadeConfig
}

export type AppState = {
  screen: WindowSize
  uiMode: UiMode
  oraclePrices: OraclePrices
  config: AppConfigs
}

type NotifyFunction = (
  variant: VariantType,
  message: string,
  signature?: string | undefined
) => void

export type LoansState = {
  notify: NotifyFunction | null
  list: LoanAccount[] | null
  openLoanTransactionSignature: string | null
  walletKey: PublicKey | null
  scan: boolean
  scanStartTime: number | null
  scanTimer: NodeJS.Timer | null
  openLoanModal: boolean
}

export type BondsState = {
  systems: BondSystemAccount[] | null
  buyBondTransactionSignature: string | null
  bonds: BondAccount[] | null
  refreshBonds: boolean
  walletKey: PublicKey | null
  modal: {
    system: SystemNames | null
    buy: boolean
    callback?: Function
  }
  bondSystemBalances: BondSystemBalances | null
}

export type None = 'none'

export type StakingState = {
  stakeAccount: StakeAccount | null | None
  refreshStakeAccount: boolean
  balances: StakeBalance[] | null
  refreshBalances: boolean
  stakingState: StakingStateAccount | null
  refreshStakingState: boolean
  rewardAccounts: RewardAccount[] | null
  lastRewardAccount: RewardAccount | null
  rewardClaims: TransactionInstruction[]
  walletKey: PublicKey | null
  signature: {
    create: string | null
    create2: string | null
    deposit: string | null
    stake: string | null
    claim: string | null
    unstake: string | null
  }
  modal: {
    account: StakeAccountWithBalances | null
    deposit: boolean
    unstake: boolean
    callback?: Function
  }
}
