import { FC, useCallback, useEffect, useState } from 'react'
import { Box, Button, Backdrop } from '@mui/material'
import {
  bigIntExpoToDecimal,
  findAssociatedTokenAddress,
  validNumericTrailingCharCheck,
} from '../../utils/helpers'
import { Goldbox } from '../Goldbox/Goldbox'
import { useDispatch, useSelector } from 'react-redux'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useNotify } from '../../utils/notify'
import { Bond } from '@lucra/sdk'
import { WalletSendTransactionError } from '@solana/wallet-adapter-base'
import { PublicKey, Transaction } from '@solana/web3.js'
import { InputBox } from '../InputBox/InputBox'
import {
  getBuyBondModal,
  getBondModalCallback,
  getBondModalBondSystem,
  setBuyBondModal,
  setBuyBondTransactionSignature,
  setRefreshBondsList,
} from '../../redux/modules/bonds'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { getConfigs, getUiMode } from '../../redux/modules/app'

export interface BuyBondModalProps {
  children: JSX.Element | JSX.Element[]
}

export const BuyBondModal: FC<BuyBondModalProps> = (props) => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const notify = useNotify()
  const configs = useSelector(getConfigs)
  const [lpTokenAmount, setLpTokenAmount] = useState('')
  const [buttonClicked, setButtonClicked] = useState(false)
  const buyBondModal = useSelector(getBuyBondModal)
  const bondsModalCallback = useSelector(getBondModalCallback)
  const bondSystemName = useSelector(getBondModalBondSystem)
  const uiMode = useSelector(getUiMode)
  const [walletLpTokenBalance, setWalletLpTokenBalance] = useState(0)
  const dispatch = useDispatch()

  const cancel = useCallback(() => {
    setButtonClicked(false)
    dispatch(setBuyBondModal(false))
    dispatch(setBuyBondTransactionSignature(null))
  }, [dispatch])

  const buyBond = useCallback(async () => {
    if (!publicKey) {
      notify('error', 'Wallet not connected!')
      return
    }
    if (!bondSystemName) {
      notify('error', 'Bond System Not Found!')
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
      const bondSystem = bondProgram.getBondSystem(bondSystemName)
      const lpTokenAccount = await getAssociatedTokenAddress(
        bondSystem.lpInfo.lpMint,
        publicKey,
        false
      )

      const buyBond = await bondProgram.buyBond(bondSystemName, {
        lpTokenAmount: BigInt(lpTokenAmount),
        tokenAccount: lpTokenAccount,
        owner: publicKey,
        payer: publicKey,
      })

      const transaction = new Transaction().add(...buyBond.instructions)
      notify('info', 'Buy Bond Request Approval Needed')
      signature = await sendTransaction(transaction, connection, {
        signers: [...buyBond.signers],
      })
      notify('info', 'Transaction sent:', signature)
      await connection.confirmTransaction(signature, 'finalized')

      notify('success', 'Transaction successful!', signature)

      setButtonClicked(false)
      dispatch(setBuyBondModal(false))
      dispatch(setRefreshBondsList(true))
      dispatch(setBuyBondTransactionSignature(signature))
      bondsModalCallback && bondsModalCallback()
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
    bondsModalCallback,
    setButtonClicked,
    connection,
    dispatch,
    notify,
    publicKey,
    sendTransaction,
    bondSystemName,
    lpTokenAmount,
    cancel,
    configs,
  ])

  const setLpTokenAmountHandler = useCallback(
    (value: string) => {
      if (validNumericTrailingCharCheck(value)) {
        setLpTokenAmount(validNumericTrailingCharCheck(value))
      } else if (value === '') {
        setLpTokenAmount('')
      }
    },
    [setLpTokenAmount]
  )

  const maxLpTokens = useCallback(() => {
    setLpTokenAmountHandler(walletLpTokenBalance.toString())
  }, [walletLpTokenBalance, setLpTokenAmountHandler])

  useEffect(() => {
    async function getLpTokenBalance(owner: PublicKey) {
      if (!bondSystemName) {
        notify('error', 'LP Token Balance Not Found!')
        return
      }
      const bondProgram = new Bond(
        connection,
        configs.bonds,
        configs.bondSystems
      )
      const bondSystem = bondProgram.getBondSystem(bondSystemName)
      const lpMintATA = await findAssociatedTokenAddress(
        owner,
        bondSystem.lpInfo.lpMint
      )
      try {
        const walletBalance = await connection.getTokenAccountBalance(lpMintATA)
        const balance = bigIntExpoToDecimal(
          BigInt(walletBalance.value.amount),
          walletBalance.value.decimals
        )
        setWalletLpTokenBalance(balance.toNumber())
      } catch (e) {
        setWalletLpTokenBalance(0)
      }
    }
    publicKey && bondSystemName && getLpTokenBalance(publicKey)
  }, [
    connection,
    publicKey,
    setWalletLpTokenBalance,
    bondSystemName,
    notify,
    configs,
  ])

  if (bondSystemName) {
    const bondProgram = new Bond(connection, configs.bonds, configs.bondSystems)
    const bondSystem = bondProgram.getBondSystem(bondSystemName)
    return (
      <>
        <div style={{ opacity: buyBondModal ? '.3' : '1' }}>
          {props.children}
        </div>
        <Backdrop open={buyBondModal} style={{ zIndex: 10000 }}>
          <Goldbox classes={['box-centered']} style={{ minHeight: '0px' }}>
            <div className={'innerbox'} style={{ minHeight: '0px' }}>
              <Box
                sx={{
                  p: 2,
                  width: uiMode === 'desktop' ? '400px' : 'auto',
                }}
                className="Open-loan-modal"
              >
                <div className="text-modal-label-white">
                  New {bondSystem.name} Bond
                </div>
                <br />
                <InputBox
                  textLeft="Amount"
                  textRight={'LP Token Balance ' + walletLpTokenBalance}
                  icon="/lucra-glyph-L-white.png"
                  iconPosition={{ top: '7px', left: '4px' }}
                  value={lpTokenAmount}
                  onChange={(e) => {
                    setLpTokenAmountHandler(e.target.value)
                  }}
                  maxButton={maxLpTokens}
                />
                <br />
                <Button
                  onClick={buyBond}
                  variant={'contained'}
                  disabled={
                    buttonClicked || !lpTokenAmount || lpTokenAmount === '0'
                  }
                >
                  Buy Bond
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
  } else {
    return <>{props.children}</>
  }
}
