import { LoanAccount, Lucra } from '@lucra/sdk'
import { Button, CircularProgress } from '@mui/material'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Transaction, TransactionSignature } from '@solana/web3.js'
import { FC, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getConfigs } from '../../redux/modules/app'
import { setScanForNewLoans } from '../../redux/modules/loans'
import {
  getStakeAccount,
  setRefreshStakeAccount,
} from '../../redux/modules/staking'
import { MATA_PORTS } from '../../utils/constants'
import { findAssociatedTokenAddress } from '../../utils/helpers'
import { useNotify } from '../../utils/notify'

interface ManageFundsProps {
  loanAccount: LoanAccount
  buttonSize?: 'small' | 'large' | 'medium' | undefined
  text?: string
}

export const ManageFunds: FC<ManageFundsProps> = (props) => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const configs = useSelector(getConfigs)
  const stakingAccount = useSelector(getStakeAccount)
  const notify = useNotify()

  const repay = useCallback(async () => {
    if (!publicKey) {
      notify('error', 'Wallet not connected!')
      return
    }

    let signature: TransactionSignature = ''
    try {
      setLoading(true)

      // check MATA balance
      const mataAtaAddress = await findAssociatedTokenAddress(
        publicKey,
        configs.lucra.mint.mata.address
      )

      const walletBalance = await connection.getTokenAccountBalance(
        mataAtaAddress
      )
      const walletBalanceBananas = walletBalance.value.uiAmount
      if (
        walletBalanceBananas &&
        walletBalanceBananas <
          parseFloat(
            (
              BigInt(props.loanAccount.loanAmount) / BigInt(MATA_PORTS)
            ).toString()
          )
      ) {
        throw Error(
          `Insufficient wallet balance of ${walletBalanceBananas} MATA for transaction of ${
            BigInt(props.loanAccount.loanAmount) / BigInt(MATA_PORTS)
          } MATA.`
        )
      }
      // end mata balance check
      const lucra = new Lucra(connection, configs.lucra)
      const stakeAccount =
        props.loanAccount.loanType === 1 &&
        stakingAccount &&
        stakingAccount !== 'none'
          ? stakingAccount.account
          : undefined

      const closeLoan = await lucra.closeLoan({
        payer: publicKey,
        loanAccount: props.loanAccount.account,
        stakeAccount,
        unstakeMsol: false,
      })

      const transaction = new Transaction().add(closeLoan)

      notify('info', 'End Richual Request Approval Needed')

      signature = await sendTransaction(transaction, connection, {
        signers: [],
      })
      notify('info', 'Transaction sent:', signature)
      dispatch(setScanForNewLoans(true))
      dispatch(setRefreshStakeAccount(true))

      await connection.confirmTransaction(signature, 'processed')
      notify('success', 'Transaction successful!', signature)
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      dispatch(setScanForNewLoans(false))
      notify('error', `Transaction failed! ${error?.message}`, signature)
      return
    }
  }, [
    publicKey,
    props,
    connection,
    sendTransaction,
    dispatch,
    notify,
    stakingAccount,
    configs,
  ])

  if (loading) {
    return (
      <CircularProgress
        style={{
          top: '20%',
          position: 'relative',
          color: 'white',
        }}
      />
    )
  } else {
    return (
      <Button
        style={{
          top: '20%',
        }}
        size={props.buttonSize}
        onClick={repay}
        disabled={!publicKey}
        variant={'outlined'}
      >
        {props.text ? props.text : 'Repay'}
      </Button>
    )
  }
}
