import { Bond, BondAccount, BondSystemAccount } from '@lucra/sdk'
import { Button } from '@mui/material'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { WalletSendTransactionError } from '@solana/wallet-adapter-base'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Transaction } from '@solana/web3.js'
import { FC, useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { getConfigs, getUiMode } from '../../redux/modules/app'
import { setRefreshBondsList } from '../../redux/modules/bonds'
import { bondTimeRemaining } from '../../utils/helpers'
import { useNotify } from '../../utils/notify'

export interface BondListItemProps {
  bond: BondAccount
  system: BondSystemAccount
}

export const BondListItem: FC<BondListItemProps> = (props) => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const notify = useNotify()
  const dispatch = useDispatch()
  const configs = useSelector(getConfigs)
  const uiMode = useSelector(getUiMode)
  const [buttonClicked, setButtonClicked] = useState(false)

  const exerciseBond = useCallback(async () => {
    if (!publicKey) {
      notify('error', 'Wallet not connected!')
      return
    }

    setButtonClicked(true)
    let signature = ''
    try {
      const bondProgram = new Bond(
        connection,
        configs.bonds,
        configs.bondSystems
      )
      const bondSystemName = bondProgram.getSystemNameByAccount(
        props.system.account
      )
      const bondSystem = bondProgram.getBondSystem(bondSystemName)
      const lucraTokenAccount = await getAssociatedTokenAddress(
        bondSystem.treasuryMint,
        publicKey,
        false
      )
      const exerciseBond = await bondProgram.exerciseBond(bondSystemName, {
        bond: props.bond.account,
        tokenAccount: lucraTokenAccount,
      })

      const transaction = new Transaction().add(...exerciseBond.instructions)
      notify('info', 'Exercise Bond Request Approval Needed')
      signature = await sendTransaction(transaction, connection, {
        signers: [...exerciseBond.signers],
      })
      notify('info', 'Transaction sent:', signature)
      await connection.confirmTransaction(signature, 'finalized')

      notify('success', 'Transaction successful!', signature)

      setButtonClicked(false)
      dispatch(setRefreshBondsList(true))
    } catch (error: any) {
      if (error instanceof WalletSendTransactionError) {
        notify('error', `Transaction failed! ${error?.message}`, signature)
        setButtonClicked(false)
        return
      } else {
        console.log(error)
        notify('error', `Transaction failed! ${error?.message}`, signature)
        setButtonClicked(false)
        return
      }
    }
  }, [
    props,
    setButtonClicked,
    connection,
    dispatch,
    notify,
    publicKey,
    sendTransaction,
    configs,
  ])

  const lockDaysRemaining = bondTimeRemaining(props.bond, props.system) / 86400
  const lockTimeRemaining = bondTimeRemaining(props.bond, props.system)

  if (uiMode === 'desktop') {
    return (
      <div className="flex-row" key={props.bond.account.toString()}>
        <div className="flex-column">
          <div className={'col-label-gold'}>Bond</div>
          <div className={'col-text-white'}>
            {props.system.name}-{props.system.provider}
          </div>
        </div>
        <div className="flex-column">
          <div className={'col-label-gold'}>Interest</div>
          <div className={'col-text-white'}>{props.system.bondYield}%</div>
        </div>

        <div className="flex-column">
          <div className={'col-label-gold'}>Lock Remaining</div>
          <div className={'col-text-white'}>{lockDaysRemaining} Days</div>
        </div>

        <div className="flex-column">
          <div className={'col-label-gold'}>Supplied Value</div>
          <div className={'col-text-white'}>
            {props.bond.suppliedValue.toString()}
          </div>
        </div>

        <div className="flex-column text-center min-content">
          <Button
            style={{
              top: '20%',
              minWidth: '120px',
            }}
            onClick={() => exerciseBond()}
            disabled={
              lockTimeRemaining > 0 || props.bond.exercised || buttonClicked
            }
            variant={'outlined'}
          >
            Exercise
          </Button>
        </div>
      </div>
    )
  } else {
    return (
      <div
        className="flex-row"
        style={{ display: 'block' }}
        key={props.bond.account.toString()}
      >
        <div className="flex-column">
          <div className={'col-label-gold'}>Bond</div>
          <div className={'col-text-white'}>
            {props.system.name}-{props.system.provider}
          </div>
        </div>
        <div className="flex-column">
          <div className={'col-label-gold'}>Interest</div>
          <div className={'col-text-white'}>{props.system.bondYield}%</div>
        </div>

        <div className="flex-column">
          <div className={'col-label-gold'}>Lock Remaining</div>
          <div className={'col-text-white'}>{lockDaysRemaining} Days</div>
        </div>

        <div className="flex-column">
          <div className={'col-label-gold'}>Supplied Value</div>
          <div className={'col-text-white'} style={{ overflow: 'hidden' }}>
            {props.bond.suppliedValue.toString()}
          </div>
        </div>

        <div className="flex-column text-center min-content">
          <Button
            style={{
              top: '20%',
              minWidth: '120px',
            }}
            onClick={() => exerciseBond()}
            disabled={
              lockTimeRemaining > 0 || props.bond.exercised || buttonClicked
            }
            variant={'outlined'}
          >
            Exercise
          </Button>
        </div>
      </div>
    )
  }
}
