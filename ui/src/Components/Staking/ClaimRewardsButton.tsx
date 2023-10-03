import {
  Lucra,
  RewardAccount,
  StakeBalanceWithAmounts,
  StakingStateAccount,
} from '@lucra/sdk'
import { Button, CircularProgress } from '@mui/material'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
} from '@solana/web3.js'
import { FC, useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getRewardAccounts } from '../../redux/modules/staking'
import { lastWeekMsolEstimate, lucraAPR } from '../../utils/helpers'
import { useNotify } from '../../utils/notify'
import { Decimal } from 'decimal.js'
import { LUCRA_PORTS } from '../../utils/constants'
import { LockupDuration } from '../../types'
import { getConfigs } from '../../redux/modules/app'

export interface ClaimRewardButtonProps {
  balance: StakeBalanceWithAmounts
  stakingState: StakingStateAccount
  callback?: () => void
  rewardsEstimateCb?: (amount: number) => void
  buttonSize?: 'small' | 'large' | 'medium' | undefined
  text?: string
}

export const ClaimRewardsButton: FC<ClaimRewardButtonProps> = (props) => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [loading, setLoading] = useState(false)
  const [rewardsChecked, setRewardsChecked] = useState(false)
  const configs = useSelector(getConfigs)
  const [rewardsCursor, setRewardsCursor] = useState(
    props.stakingState.rewardCursor
  )
  const [rewardsPending, setRewardsPending] = useState(0)
  const [claimInstructions, setClaimInstructions] = useState<
    TransactionInstruction[]
  >([])
  const notify = useNotify()
  const rewardAccounts = useSelector(getRewardAccounts)
  const MAX_INSTRUCTIONS = 10

  const claimReward = useCallback(async () => {
    let signature: TransactionSignature = ''
    try {
      setLoading(true)
      notify('info', 'Claim Reward Request Approval Needed')
      const lessThanMaxInst = claimInstructions.slice(0, MAX_INSTRUCTIONS)
      const transaction = new Transaction().add(...lessThanMaxInst)
      signature = await sendTransaction(transaction, connection, {
        signers: [],
      })
      notify('info', 'Transaction sent:', signature)

      await connection.confirmTransaction(signature, 'processed')
      notify('success', 'Transaction successful!', signature)
      const remainingInst = claimInstructions.slice(
        MAX_INSTRUCTIONS,
        claimInstructions.length
      )
      setRewardsPending(remainingInst.length)
      setClaimInstructions(remainingInst)
      setLoading(false)
      remainingInst.length === 0 && props.callback && props.callback()
      remainingInst.length === 0 &&
        props.rewardsEstimateCb &&
        props.rewardsEstimateCb(0)
    } catch (error: any) {
      setLoading(false)
      notify('error', `Transaction failed! ${error?.message}`, signature)
      return
    }
  }, [connection, sendTransaction, notify, claimInstructions, props])

  const makeClaimInstructions = useCallback(async () => {
    const getRewardAccount = (account: PublicKey): RewardAccount | null => {
      return (
        rewardAccounts?.find(
          (e) => e.account.toString() === account.toString()
        ) || null
      )
    }

    const calculateRewardEstimate = (
      stakeBalance: StakeBalanceWithAmounts,
      stakingState: StakingStateAccount,
      reward: RewardAccount
    ) => {
      const lucraAmount = stakeBalance.balance.stLucraVault.uiAmount
        ? new Decimal(stakeBalance.balance.stLucraVault.uiAmount)
        : new Decimal(0)
      const msolAmount = lastWeekMsolEstimate(lucraAmount, reward)
      const weeklyJuice = new Decimal(
        stakingState.amountToDistributePerEpoch.toString()
      ).div(LUCRA_PORTS)
      const stakedTokenSupply = new Decimal(reward.poolTokenSupply.toString())
        .div(LUCRA_PORTS)
        .add(lucraAmount)

      const shareOfSupply = lucraAmount.div(stakedTokenSupply)
      const juiceReward = weeklyJuice.mul(shareOfSupply)
      const lucraInflationReward = new Decimal(1)
        .div(lucraAPR(stakeBalance.stakingTimeframe as LockupDuration))
        .mul(lucraAmount)

      const msolTotal = msolAmount.mul(35)
      const juiceTotal = juiceReward.mul(5)
      return msolTotal.add(juiceTotal).add(lucraInflationReward)
    }

    console.log('-- CLAIM INSTRUCTIONS --')
    async function claimRewardInstructions(owner: PublicKey) {
      const lucra = new Lucra(connection, configs.lucra)
      let instructions: TransactionInstruction[] = []
      let estimatedRewardTotal = 0

      const rewardAccountKeys = await lucra.getRewardAccountKeys(
        props.balance,
        props.stakingState
      )
      console.log(
        props.balance.rewardCursor,
        '-',
        props.stakingState.rewardCursor
      )
      for (const rewardKey of rewardAccountKeys) {
        try {
          const rewardAccount =
            getRewardAccount(rewardKey) ||
            (await lucra.getRewardAccount(rewardKey))
          console.log(
            props.balance.rewardCursor,
            '<=',
            rewardAccount.rewardCursor
          )
          const estimatedReward = calculateRewardEstimate(
            props.balance,
            props.stakingState,
            rewardAccount
          )
          estimatedRewardTotal += estimatedReward.toNumber()
          if (props.balance.rewardCursor <= rewardAccount.rewardCursor) {
            const claimInst = await lucra.claimReward({
              owner,
              stakeBalanceAccount: props.balance.account,
              rewardAccount: rewardKey,
              stakeVault: props.balance.vaults.stakeVault,
              stakedLucraVault: props.balance.vaults.stLucraVault,
            })
            instructions.push(claimInst)
          }
        } catch (e) {
          console.log('reward account does not exist')
        }
      }
      props.rewardsEstimateCb && props.rewardsEstimateCb(estimatedRewardTotal)
      return instructions
    }

    if (!publicKey) {
      notify('error', 'Wallet not connected!')
      return
    }
    const instructions = await claimRewardInstructions(publicKey)
    setRewardsPending(instructions.length)
    setRewardsChecked(true)
    setRewardsCursor(props.stakingState.rewardCursor)
    setClaimInstructions(instructions)
  }, [
    rewardAccounts,
    setRewardsPending,
    setRewardsChecked,
    connection,
    notify,
    props,
    publicKey,
    configs,
  ])

  useEffect(() => {
    !rewardsChecked && makeClaimInstructions()
    rewardsCursor !== props.stakingState.rewardCursor && makeClaimInstructions()
    return () => {}
  }, [
    claimInstructions,
    rewardsCursor,
    rewardsChecked,
    makeClaimInstructions,
    props,
  ])

  if (loading) {
    return (
      <CircularProgress
        style={{
          color: 'white',
          top: '20%',
          right: '40%',
          position: 'relative',
        }}
      />
    )
  } else {
    return (
      <Button
        style={{
          top: '20%',
          minWidth: '120px',
        }}
        onClick={claimReward}
        disabled={!rewardsPending}
        variant={'contained'}
      >
        Claim ({rewardsPending}) Rewards
      </Button>
    )
  }
}
