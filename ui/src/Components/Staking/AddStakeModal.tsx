import { FC, useCallback, useEffect, useState } from 'react'
import { Box, Button, Backdrop } from '@mui/material'
import {
  bigIntExpoToDecimal,
  findAssociatedTokenAddress,
  stringToNumber,
  validNumericTrailingCharCheck,
} from '../../utils/helpers'
import { Goldbox } from '../Goldbox/Goldbox'
import { useDispatch, useSelector } from 'react-redux'
import {
  getDepositStakeModal,
  getStakeModalAccount,
  getStakingModalCallback,
  setModalAccount,
  setDepositStakeModal,
  setUnStakeSignature,
  getStakeState,
} from '../../redux/modules/staking'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useNotify } from '../../utils/notify'
import { generateStakeAcctKeypairs, Lucra } from '@lucra/sdk'
import { WalletSendTransactionError } from '@solana/wallet-adapter-base'
import { PublicKey, Transaction } from '@solana/web3.js'
import { LUCRA_PORTS, STAKING_TIMEFRAME } from '../../utils/constants'
import { InputBox } from '../InputBox/InputBox'
import { lockRemaining } from '../../utils/helpers'
import { LockupDuration } from '../../types'
import { getConfigs } from '../../redux/modules/app'

export interface AddStakeModalProps {
  children: JSX.Element | JSX.Element[]
}

export const AddStakeModal: FC<AddStakeModalProps> = (props) => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const notify = useNotify()
  const [addStakeAmount, setAddStakeAmount] = useState('')
  const configs = useSelector(getConfigs)
  const [buttonClicked, setButtonClicked] = useState(false)
  const depositStakeModal = useSelector(getDepositStakeModal)
  const stakingModalCallback = useSelector(getStakingModalCallback)
  const stakeBalance = useSelector(getStakeModalAccount)
  const programStakingState = useSelector(getStakeState)
  const [walletLucraBalance, setWalletLucraBalance] = useState(0)
  const dispatch = useDispatch()

  const cancel = useCallback(() => {
    setButtonClicked(false)
    dispatch(setUnStakeSignature(null))
    dispatch(setDepositStakeModal(false))
    dispatch(setModalAccount(null))
    dispatch(setDepositStakeModal(false))
  }, [dispatch])

  const addStake = useCallback(async () => {
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
      const depositVault = keypairs.depositVaultKP.publicKey
      const stakeVault = keypairs.stakeVaultKP.publicKey
      const stakedLucraVault = keypairs.stakedLucraVaultKP.publicKey

      const deposit = await lucra.depositStake({
        owner: publicKey,
        stakeBalanceAccount: stakeBalance.account,
        depositVault,
        lucra: BigInt(stringToNumber(addStakeAmount) * LUCRA_PORTS),
      })

      const stake = await lucra.stake({
        owner: publicKey,
        stakeBalanceAccount: stakeBalance.account,
        stakeAccount: stakeAccount.account,
        depositVault,
        stakeVault,
        stakedLucraVault,
        lucra: BigInt(stringToNumber(addStakeAmount) * LUCRA_PORTS),
      })

      const transaction = new Transaction().add(deposit).add(stake)
      notify('info', 'Add Stake Request Approval Needed')
      signature = await sendTransaction(transaction, connection, {
        signers: [],
      })
      notify('info', 'Transaction sent:', signature)
      await connection.confirmTransaction(signature, 'finalized')

      notify('success', 'Transaction successful!', signature)

      setButtonClicked(false)
      dispatch(setModalAccount(null))
      dispatch(setDepositStakeModal(false))
      dispatch(setUnStakeSignature(signature))
      stakingModalCallback && stakingModalCallback()
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
    addStakeAmount,
    cancel,
    configs,
  ])

  const setStakeAmountHandler = useCallback(
    (value: string) => {
      if (validNumericTrailingCharCheck(value)) {
        setAddStakeAmount(validNumericTrailingCharCheck(value))
      } else if (value === '') {
        setAddStakeAmount('')
      }
    },
    [setAddStakeAmount]
  )

  const maxLUCRA = useCallback(() => {
    setStakeAmountHandler(walletLucraBalance.toString())
  }, [walletLucraBalance, setStakeAmountHandler])

  useEffect(() => {
    async function getLucraBalance(owner: PublicKey) {
      const lucraATA = await findAssociatedTokenAddress(
        owner,
        configs.lucra.mint.lucra.address
      )
      try {
        const walletBalance = await connection.getTokenAccountBalance(lucraATA)
        const balance = bigIntExpoToDecimal(
          BigInt(walletBalance.value.amount),
          walletBalance.value.decimals
        )
        setWalletLucraBalance(balance.toNumber())
      } catch (e) {
        setWalletLucraBalance(0)
      }
    }
    publicKey && getLucraBalance(publicKey)
  }, [connection, publicKey, setWalletLucraBalance, configs])

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
      <div style={{ opacity: depositStakeModal ? '.3' : '1' }}>
        {props.children}
      </div>
      <Backdrop open={depositStakeModal} style={{ zIndex: 10000 }}>
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
              <div className="text-modal-label-white">Add to Stake</div>
              <div
                className="text-description text-attention"
                style={{ paddingTop: '10px', paddingBottom: '10px' }}
              >
                Adding to this stake will reset your remaining lock back to the
                original lock duration and you will miss 1 reward period.
              </div>
              <InputBox
                textLeft="Amount"
                textRight={'Lucra Balance ' + walletLucraBalance}
                icon="/lucra-glyph-L-white.png"
                iconPosition={{ top: '7px', left: '4px' }}
                value={addStakeAmount}
                onChange={(e) => {
                  setStakeAmountHandler(e.target.value)
                }}
                maxButton={maxLUCRA}
              />
              <br />
              <Button
                onClick={addStake}
                variant={'contained'}
                disabled={
                  buttonClicked || !addStakeAmount || addStakeAmount === '0'
                }
              >
                Add To Stake
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
