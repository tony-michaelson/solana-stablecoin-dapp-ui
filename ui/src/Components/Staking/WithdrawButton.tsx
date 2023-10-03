import {
  generateStakeAcctKeypairs,
  Lucra,
  PendingWithdrawalAccount,
  StakeBalanceWithAmounts,
  StakingStateAccount,
} from '@lucra/sdk'
import { Button, CircularProgress } from '@mui/material'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Transaction, TransactionSignature } from '@solana/web3.js'
import { FC, useCallback, useEffect, useState } from 'react'
import { LUCRA_PORTS } from '../../utils/constants'
import { useNotify } from '../../utils/notify'
import { Decimal } from 'decimal.js'
import { WatchState } from '../../utils/WatchState'
import { setModalAccount, setUnStakeModal } from '../../redux/modules/staking'
import { useDispatch, useSelector } from 'react-redux'
import { getConfigs } from '../../redux/modules/app'

export interface WithdrawButtonProps {
  stakeBalance: StakeBalanceWithAmounts
  stakingState: StakingStateAccount
  lockDaysRemaining: number
  withdrawCallback?: () => void
  buttonSize?: 'small' | 'large' | 'medium' | undefined
  text?: string
  minWidth?: string
  disabled?: boolean
}

export const WithdrawButton: FC<WithdrawButtonProps> = (props) => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [pendingWithdrawalAccounts, setPendingAccounts] = useState<
    PendingWithdrawalAccount[] | null
  >(null)
  const [scanPendingWithdrawalAccounts, setScanPendingWithdrawalAccounts] =
    useState(false)
  const [loading, setLoading] = useState(false)
  const notify = useNotify()
  const configs = useSelector(getConfigs)
  const dispatch = useDispatch()
  const rewardsPending =
    props.stakingState.rewardCursor > props.stakeBalance.rewardCursor
  const isDisabled: boolean = props.stakingState
    ? props.lockDaysRemaining > 0 ||
      props.stakingState.rewardCursor !== props.stakeBalance.rewardCursor
    : props.lockDaysRemaining > 0

  const withdrawStake = useCallback(
    async (pendingWithdrawalAccount: PendingWithdrawalAccount) => {
      if (!publicKey) {
        notify('error', 'Wallet not connected!')
        return
      }

      let signature: TransactionSignature = ''
      try {
        setLoading(true)

        const lucra = new Lucra(connection, configs.lucra)

        const keypairs = await generateStakeAcctKeypairs(
          props.stakeBalance.account
        )
        const depositVault = keypairs.depositVaultKP.publicKey
        const pendingVault = keypairs.pendingVaultKP.publicKey
        const stakeVault = keypairs.stakeVaultKP.publicKey
        const stakedLucraVault = keypairs.stakedLucraVaultKP.publicKey
        const endUnstake = await lucra.endUnstake({
          owner: publicKey,
          stakeBalanceAccount: props.stakeBalance.account,
          pendingVault,
          depositVault,
          pendingWithdrawal: pendingWithdrawalAccount.account,
        })
        const withdrawStake = await lucra.withdrawStake({
          owner: publicKey,
          stakeBalanceAccount: props.stakeBalance.account,
          depositVault,
          pendingVault,
          stakedLucraVault,
          stakeVault,
          lucra: pendingWithdrawalAccount.lucra,
        })

        const transaction = new Transaction().add(endUnstake).add(withdrawStake)

        notify('info', 'Withdraw Stake Request Approval Needed')

        signature = await sendTransaction(transaction, connection, {
          signers: [],
        })
        notify('info', 'Transaction sent:', signature)

        await connection.confirmTransaction(signature, 'processed')
        notify('success', 'Transaction successful!', signature)

        props.withdrawCallback && props.withdrawCallback()
        setScanPendingWithdrawalAccounts(true)
      } catch (error: any) {
        setLoading(false)
        notify('error', `Transaction failed! ${error?.message}`, signature)
        return
      }
    },
    [publicKey, props, connection, sendTransaction, notify, configs]
  )

  const getPendingWithdrawalAccounts =
    useCallback(async (): Promise<boolean> => {
      const lucra = new Lucra(connection, configs.lucra)
      const currentPendingWithdrawalAccounts =
        await lucra.getPendingWithdrawalAccounts(props.stakeBalance.account)
      console.log('pendingWithdrawalAccounts', pendingWithdrawalAccounts)
      if (
        pendingWithdrawalAccounts === null ||
        pendingWithdrawalAccounts.length !==
          currentPendingWithdrawalAccounts.length
      ) {
        console.log(currentPendingWithdrawalAccounts)
        console.log('setPendingAccounts(currentPendingWithdrawalAccounts)')
        setPendingAccounts(currentPendingWithdrawalAccounts)
        setLoading(false)
        return true
      } else {
        return false
      }
    }, [connection, props, pendingWithdrawalAccounts, configs])

  useEffect(() => {
    pendingWithdrawalAccounts === null &&
      !rewardsPending &&
      getPendingWithdrawalAccounts()
    return () => {}
  }, [pendingWithdrawalAccounts, getPendingWithdrawalAccounts, rewardsPending])

  WatchState({
    isActive: scanPendingWithdrawalAccounts,
    setNonActive: () => {
      setScanPendingWithdrawalAccounts(false)
      setLoading(false)
    },
    stateChanged: getPendingWithdrawalAccounts,
    interval: 5000,
    maxTries: 5,
  })

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
  } else if (rewardsPending) {
    return <></>
  } else if (
    pendingWithdrawalAccounts &&
    pendingWithdrawalAccounts.length > 0
  ) {
    const pendingWithdrawalAccount = pendingWithdrawalAccounts[0]
    const withdrawAmount = new Decimal(
      (pendingWithdrawalAccount.lucra / BigInt(LUCRA_PORTS)).toString()
    )
      .round()
      .toString()

    return (
      <Button
        style={{
          top: '20%',
          minWidth: '150px',
        }}
        onClick={() => {
          withdrawStake(pendingWithdrawalAccount)
        }}
        disabled={props.disabled}
        variant={'contained'}
      >
        Withdraw ({withdrawAmount})
      </Button>
    )
  } else {
    return (
      <Button
        style={{
          top: '20%',
          minWidth: props.minWidth ? props.minWidth : '150px',
        }}
        onClick={() => {
          dispatch(setModalAccount(props.stakeBalance))
          dispatch(
            setUnStakeModal(true, () => {
              setScanPendingWithdrawalAccounts(true)
              setLoading(true)
            })
          )
        }}
        disabled={isDisabled}
        variant={'outlined'}
      >
        {props.text ? props.text : 'Withdraw Stake'}
      </Button>
    )
  }
}
