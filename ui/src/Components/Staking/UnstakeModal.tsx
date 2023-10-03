import { FC, useCallback, useState } from 'react'
import { Box, Button, Backdrop } from '@mui/material'

import {
  lockRemaining,
  stringToNumber,
  validNumericTrailingCharCheck,
} from '../../utils/helpers'
import { Goldbox } from '../Goldbox/Goldbox'
import { useDispatch, useSelector } from 'react-redux'
import {
  getStakeModalAccount,
  getUnStakeModal,
  getStakingModalCallback,
  setModalAccount,
  setUnStakeModal,
  setUnStakeSignature,
  getStakeState,
} from '../../redux/modules/staking'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useNotify } from '../../utils/notify'
import { generateStakeAcctKeypairs, Lucra } from '@lucra/sdk'
import { LUCRA_PORTS, STAKING_TIMEFRAME } from '../../utils/constants'
import { WalletSendTransactionError } from '@solana/wallet-adapter-base'
import { Transaction } from '@solana/web3.js'
import { InputBox } from '../InputBox/InputBox'
import { LockupDuration } from '../../types'
import { getConfigs } from '../../redux/modules/app'

export interface UnstakeModalProps {
  children: JSX.Element | JSX.Element[]
}

export const UnstakeModal: FC<UnstakeModalProps> = (props) => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const notify = useNotify()
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [buttonClicked, setButtonClicked] = useState(false)
  const unstakeModal = useSelector(getUnStakeModal)
  const configs = useSelector(getConfigs)
  const stakingModalCallback = useSelector(getStakingModalCallback)
  const stakeBalance = useSelector(getStakeModalAccount)
  const programStakingState = useSelector(getStakeState)
  const dispatch = useDispatch()

  const cancel = useCallback(() => {
    setButtonClicked(false)
    dispatch(setUnStakeSignature(null))
    dispatch(setModalAccount(null))
    dispatch(setUnStakeModal(false))
  }, [dispatch])

  const startUnstake = useCallback(async () => {
    if (!publicKey) {
      notify('error', 'Wallet not connected!')
      return
    }
    if (!stakeBalance) {
      notify('error', 'Stake Balance Not Found!')
      return
    }

    setButtonClicked(true)
    let signature = ''
    try {
      const lucra = new Lucra(connection, configs.lucra)
      const stakeAccount = await lucra.getStakeAccount(publicKey)
      const keypairs = await generateStakeAcctKeypairs(stakeBalance.account)
      const pendingVault = keypairs.pendingVaultKP.publicKey
      const stakeVault = keypairs.stakeVaultKP.publicKey
      const stakedLucraVault = keypairs.stakedLucraVaultKP.publicKey
      const startUnstake = await lucra.startUnstake({
        owner: publicKey,
        stakeAccount: stakeAccount.account,
        stakeBalanceAccount: stakeBalance.account,
        pendingVault,
        stakeVault,
        stakedLucraVault,
        lucra: BigInt(stringToNumber(unstakeAmount) * LUCRA_PORTS),
      })

      const transaction = new Transaction().add(...startUnstake.instructions)
      notify('info', 'Unstake Request Approval Needed')
      signature = await sendTransaction(transaction, connection, {
        signers: [...startUnstake.signers],
      })
      notify('info', 'Transaction sent:', signature)

      await connection.confirmTransaction(signature, 'finalized')
      notify('success', 'Transaction successful!', signature)

      dispatch(setUnStakeSignature(signature))
      setButtonClicked(false)
      dispatch(setModalAccount(null))
      stakingModalCallback &&
        stakingModalCallback(stringToNumber(unstakeAmount))
      dispatch(setUnStakeModal(false))
    } catch (error: any) {
      if (error instanceof WalletSendTransactionError) {
        notify('error', `Transaction failed! ${error?.message}`, signature)
        cancel()
        return
      } else {
        console.log(error)
        notify('error', `Transaction failed! ${error?.message}`, signature)
        cancel()
        return
      }
    }
  }, [
    stakingModalCallback,
    setButtonClicked,
    connection,
    dispatch,
    notify,
    publicKey,
    sendTransaction,
    stakeBalance,
    unstakeAmount,
    cancel,
    configs,
  ])

  const setUnstakeAmountHandler = useCallback(
    (value: string) => {
      if (validNumericTrailingCharCheck(value)) {
        setUnstakeAmount(validNumericTrailingCharCheck(value))
      } else if (value === '') {
        setUnstakeAmount('')
      }
    },
    [setUnstakeAmount]
  )

  const maxLUCRA = useCallback(() => {
    stakeBalance?.balance.stakeVault.uiAmountString &&
      setUnstakeAmountHandler(stakeBalance.balance.stakeVault.uiAmountString)
  }, [setUnstakeAmountHandler, stakeBalance])

  const lockDuration = stakeBalance
    ? STAKING_TIMEFRAME[stakeBalance.stakingTimeframe as LockupDuration]
        .duration
    : 'Unknown'
  const lockDaysRemaining =
    stakeBalance && programStakingState
      ? lockRemaining(stakeBalance, programStakingState)
      : 0

  return (
    <>
      <div style={{ opacity: unstakeModal ? '.3' : '1' }}>{props.children}</div>
      <Backdrop open={unstakeModal} style={{ zIndex: 10000 }}>
        <Goldbox classes={['box-centered']} style={{ minHeight: '0px' }}>
          <div className={'innerbox'} style={{ minHeight: '0px' }}>
            <Box
              sx={{
                p: 2,
                width: '400px',
              }}
              className="Open-loan-modal"
            >
              <div className="text-modal-label-white">Current Stake</div>
              <br />
              <div style={{ display: 'flex' }}>
                <div style={{ flexGrow: 1 }}>
                  <div className="col-label-white">LUCRA Staked</div>
                  <div className="col-text-white">
                    {stakeBalance?.balance.stakeVault.uiAmount
                      ? Math.round(stakeBalance.balance.stakeVault.uiAmount)
                      : 0}
                  </div>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div className="col-label-white">Lock Duration</div>
                  <div className="col-text-white">{lockDuration}</div>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div className="col-label-white">Lock Remaining</div>
                  <div className="col-text-white">{lockDaysRemaining} Days</div>
                </div>
              </div>
              <br />
              <div
                style={{
                  borderBottom: '1px solid rgba(81, 81, 81, 0.8)',
                }}
              ></div>
              <br />
              <div className="text-modal-label-white">Begin Untake</div>
              <div
                className="text-description text-attention"
                style={{ paddingTop: '10px', paddingBottom: '10px' }}
              >
                Your Lucra tokens will be available to withdraw in 7 days
              </div>
              <InputBox
                textLeft="Amount"
                icon="/lucra-glyph-L-white.png"
                iconPosition={{ top: '7px', left: '4px' }}
                value={unstakeAmount}
                onChange={(e) => {
                  setUnstakeAmountHandler(e.target.value)
                }}
                maxButton={maxLUCRA}
              />
              <br />
              <Button
                onClick={startUnstake}
                variant={'contained'}
                disabled={buttonClicked || !unstakeAmount}
              >
                Start Unstake
              </Button>
              &nbsp;&nbsp;&nbsp;
              <Button
                onClick={cancel}
                disabled={buttonClicked}
                variant={'contained'}
                color={'warning'}
              >
                Cancel
              </Button>
            </Box>
          </div>
        </Goldbox>
      </Backdrop>
    </>
  )
}
