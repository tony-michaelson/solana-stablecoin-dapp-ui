import { OracleAccount } from '@lucra/sdk/state/oracle'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { ArbToken, BondSystemPair, LockupDuration } from '../types'
import {
  TOKEN_PROGRAM_ID,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  COLLATERAL_RATE,
  REDUCED_COLLATERAL_RATE,
  STAKING_TIMEFRAME,
  LUCRA_PORTS,
} from './constants'
import { Decimal } from 'decimal.js'
import {
  BondAccount,
  BondSystemAccount,
  RewardAccount,
  StakeBalance,
  StakeBalanceWithAmounts,
  StakingStateAccount,
} from '@lucra/sdk'

export function numberWithCommas(num: number | string): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function stringToNumber(numberString: string): number {
  if (parseFloat(numberString)) {
    return parseFloat(numberString)
  } else {
    return 0
  }
}

export function validNumericTrailingCharCheck(text: string) {
  const filtered = text.replaceAll(/[^0-9.]/g, '')
  if (filtered.slice(0, -1).match(/\./) && filtered.slice(-1) === '.') {
    // trailing period when a period is already in the text
    return filtered.slice(0, -1)
  } else {
    return filtered
  }
}

export function calculateLoanAmount(
  collateral: number,
  lucra: number,
  solPrice: OracleAccount | null,
  lucraSolPrice: OracleAccount | null
): string {
  if (collateral > 0 && solPrice && solPrice.aggPrice) {
    const lucraAmount = lucra > 0 ? lucra : 0
    const lucraValueInSol =
      lucraSolPrice && lucraSolPrice.aggPrice
        ? bigIntExpoToDecimal(lucraSolPrice.aggPrice, lucraSolPrice.expo).mul(
            new Decimal(lucraAmount)
          )
        : new Decimal(0)
    console.log('lucraValueInSol:', lucraValueInSol.toString())
    const rate = lucraValueInSol.gte(collateral)
      ? REDUCED_COLLATERAL_RATE
      : COLLATERAL_RATE
    console.log('rate:', rate)
    const price = bigIntExpoToDecimal(solPrice.aggPrice, solPrice.expo)
    const depositValue = price.mul(new Decimal(collateral))
    const loanEst = parseFloat(depositValue.div(rate).toString())

    return new Intl.NumberFormat('en-US').format(loanEst).toString()
  } else {
    return '0'
  }
}

export function calculateArbAmount(
  amount: number,
  priceData: OracleAccount | null,
  arbToken: ArbToken
): string {
  if (amount > 0 && priceData && priceData.aggPrice) {
    const price = bigIntExpoToDecimal(priceData.aggPrice, priceData.expo)
    const swapEstimate = price
    const internationalNumberFormat = new Intl.NumberFormat('en-US')
    return (
      internationalNumberFormat.format(amount).toString() +
      ' ' +
      arbToken +
      ' ' +
      ' / ' +
      ' $' +
      internationalNumberFormat.format(priceData.aggPrice).toString() +
      ' = ' +
      internationalNumberFormat.format(swapEstimate.toNumber()).toString()
    )
  } else {
    return '0'
  }
}

export function calculateArbAmountLucra(
  amount: number,
  priceData: OracleAccount | null,
  arbToken: ArbToken
): string {
  if (amount > 0 && priceData && priceData.aggPrice) {
    const swapEstimate = parseFloat(
      (BigInt(amount) * priceData.aggPrice).toString()
    )
    const internationalNumberFormat = new Intl.NumberFormat('en-US')
    return (
      internationalNumberFormat.format(amount).toString() +
      ' ' +
      arbToken +
      ' ' +
      ' * ' +
      ' $' +
      internationalNumberFormat.format(priceData.aggPrice).toString() +
      ' = ' +
      internationalNumberFormat.format(swapEstimate).toString()
    )
  } else {
    return '0'
  }
}

export function lucraAPR(lockPeriod: LockupDuration): number {
  const inflationRate = STAKING_TIMEFRAME[lockPeriod].inflation
  const multiplier = STAKING_TIMEFRAME[lockPeriod].weight
  return inflationRate * multiplier
}

export function lockRemaining(
  stakeBalance: StakeBalanceWithAmounts | StakeBalance,
  stakingState: StakingStateAccount
): number {
  const currentTime = Math.round(new Date().getTime() / 1000)
  const timeframeMultiplier: Record<number, number> = {
    0: 0,
    1: 52,
    2: 104,
  }
  const epochsAhead =
    stakeBalance.rewardCursor > stakingState.rewardCursor
      ? stakeBalance.rewardCursor - stakingState.rewardCursor
      : 0
  const weeks = BigInt(timeframeMultiplier[stakeBalance.stakingTimeframe])
  const stakeEndTime =
    stakeBalance.lastStakeTimestamp +
    (weeks + BigInt(epochsAhead)) * BigInt(604800)
  const daysRemaining = Math.round(
    parseInt((stakeEndTime - BigInt(currentTime)).toString()) / 86400
  )

  return daysRemaining > 0 ? daysRemaining : 0
}

export function bondTimeRemaining(
  bond: BondAccount,
  bondSystem: BondSystemAccount
): number {
  const currentTime = Math.round(Date.now() / 1000)
  const maturityDate = bondSystem.timelock + bond.timestamp
  const timeRemaining =
    maturityDate > currentTime
      ? parseInt(maturityDate.toString()) - currentTime
      : 0
  return timeRemaining
}

export function createBondSystemPairs(
  bondList: BondAccount[],
  bondSystems: BondSystemAccount[]
): BondSystemPair[] {
  const pairs = bondList.map((bond) => {
    const system = bondSystems.find(
      (bondSystem) =>
        bondSystem.account.toString() === bond.bondSystem.toString()
    )
    return {
      bond: bond,
      system,
    }
  })
  const filterPairs = (
    pairs: { bond: BondAccount; system: BondSystemAccount | undefined }[]
  ): BondSystemPair[] => {
    return pairs.filter((e) => e.system) as BondSystemPair[]
  }
  return filterPairs(pairs)
}

export function lastWeekMsolEstimate(
  lucraAmount: Decimal,
  lastRewardAccount: RewardAccount
): Decimal {
  const lastRewardAmount = new Decimal(lastRewardAccount.total.toString()).div(
    LAMPORTS_PER_SOL
  )
  console.log('lastRewardAmount', lastRewardAmount.toString())
  const stakedTokenSupply = new Decimal(
    lastRewardAccount.poolTokenSupply.toString()
  )
    .div(LUCRA_PORTS)
    .add(lucraAmount)
  console.log('stakedTokenSupply', stakedTokenSupply.toString())
  const rewardEstimate = lucraAmount
    .div(stakedTokenSupply)
    .mul(lastRewardAmount)
  return rewardEstimate
}

export const bigIntExpoToDecimal = (n: bigint, decimals: number): Decimal => {
  return new Decimal(n.toString()).div(new Decimal(10 ** decimals))
}

export function format5Dec(balance: number, divisor?: number): string {
  return balance === null
    ? '--'
    : (Math.round((balance / (divisor || 1)) * 1e5) / 1e5).toString()
}

export function numLamportsToSol(amount: number): number {
  return amount / LAMPORTS_PER_SOL
}

export function getBigNumber(num: any) {
  return num === undefined || num === null ? 0 : parseFloat(num.toString())
}

export function formatUnixTimestamp(timestamp: bigint): string {
  const mili = getBigNumber(timestamp) * 1000
  const dateTxt = new Date(mili).toLocaleDateString('en-us')
  return dateTxt
}

export async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )
  )[0]
}

export function getOraclePrice(oracle: OracleAccount): Decimal {
  const expo = new Decimal(oracle.expo.toString())
  const ten = new Decimal(10)
  const price = new Decimal(oracle.aggPrice.toString()).div(ten.pow(expo))
  return price
}
