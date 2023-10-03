import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { FC, useCallback, useEffect, useState } from 'react'
import { WALLET_ADAPTER_NETWORK } from '../../utils/wallet-config'
import LaunchIcon from '@material-ui/icons/Launch'
import {
  Box,
  Button,
  Grid,
  Link,
  CircularProgress,
  Backdrop,
} from '@mui/material'
import { deserializeUnchecked } from 'borsh'
import { Link as RouteLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useNotify } from '../../utils/notify'
import {
  getOpenLoanTransactionSignature,
  setOpenLoanTransactionSignature,
  setScanForNewLoans,
} from '../../redux/modules/loans'
import {
  format5Dec,
  stringToNumber,
  numLamportsToSol,
  validNumericTrailingCharCheck,
  bigIntExpoToDecimal,
} from '../../utils/helpers'
import * as marinade from '../../utils/marinade-state'
import { RichualAmountEstimate } from './RichualAmountEstimate'
import { Goldbox } from '../Goldbox/Goldbox'
import { LUCRA_PORTS, MARINADE_STATE_ID } from '../../utils/constants'
import { Lucra } from '@lucra/sdk'
import { Transaction, TransactionSignature } from '@solana/web3.js'
import { WalletSendTransactionError } from '@solana/wallet-adapter-base'
import { useStyles } from '../../styles'
import { getConfigs, getOraclePrices, getUiMode } from '../../redux/modules/app'
import { Decimal } from 'decimal.js'
import {
  getStakeAccount,
  setRefreshStakeAccount,
} from '../../redux/modules/staking'
import { InputBox } from '../InputBox/InputBox'
import './NewRichual.css'

export const NewRichual: FC = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [collateral, setCollateral] = useState('')
  const [lucraAmount, setLucraAmount] = useState('')
  const [walletSolBalance, setWalletSolBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [stakeLucra, setStakeLucra] = useState(false)
  const [buttonClicked, setButtonClicked] = useState(false)
  const configs = useSelector(getConfigs)
  const dispatch = useDispatch()
  const uiMode = useSelector(getUiMode)
  const notify = useNotify()
  const navigate = useNavigate()
  const openLoanTransactionSignature = useSelector(
    getOpenLoanTransactionSignature
  )
  const styles = useStyles()
  const oraclePrices = useSelector(getOraclePrices)
  const stakingAccount = useSelector(getStakeAccount)
  const remainingStakedLucra =
    stakingAccount && stakingAccount !== 'none'
      ? (stakingAccount.total - stakingAccount.lockedTotal) /
        BigInt(LUCRA_PORTS)
      : BigInt(0)

  const handleClose = useCallback(
    () => navigate('/', { replace: true }),
    [navigate]
  )

  const calculateStakedLucraToUse = useCallback(
    (collateral: string, forceBrew?: boolean) => {
      const newLucraAmount = forceBrew ? '' : lucraAmount
      if (remainingStakedLucra && oraclePrices.LUCRA_SOL) {
        const lucraPrice = bigIntExpoToDecimal(
          oraclePrices.LUCRA_SOL.aggPrice,
          oraclePrices.LUCRA_SOL.expo
        )
        const lucraValueInSol = lucraPrice.mul(
          new Decimal(remainingStakedLucra.toString())
        )
        if (lucraValueInSol.gte(new Decimal(collateral))) {
          const minStakedLucraNeeded = new Decimal(collateral)
            .div(lucraPrice)
            .ceil()
          console.log('lucraAmount:', newLucraAmount)
          console.log("lucraAmount !== '0'", newLucraAmount !== '0')
          newLucraAmount !== '0' &&
            setLucraAmount(minStakedLucraNeeded.toString())
          newLucraAmount !== '0' && setStakeLucra(true)
        } else {
          newLucraAmount !== '0' && setLucraAmount('')
          newLucraAmount !== '0' && setStakeLucra(false)
        }
      }
    },
    [lucraAmount, oraclePrices, remainingStakedLucra]
  )

  const setCollateralAmount = useCallback(
    (value: string) => {
      if (validNumericTrailingCharCheck(value)) {
        const collateral = validNumericTrailingCharCheck(value)
        setCollateral(collateral)
        calculateStakedLucraToUse(collateral)
      } else if (value === '') {
        setCollateral('')
        console.log('lucraAmount:', lucraAmount)
        console.log("lucraAmount !== '0'", lucraAmount !== '0')
        lucraAmount !== '0' && setLucraAmount('')
        lucraAmount !== '0' && setStakeLucra(false)
      }
    },
    [
      calculateStakedLucraToUse,
      lucraAmount,
      setLucraAmount,
      setStakeLucra,
      setCollateral,
    ]
  )

  const maxSOL = useCallback(() => {
    setCollateralAmount(walletSolBalance.toString())
  }, [walletSolBalance, setCollateralAmount])

  useEffect(() => {
    async function getSolBalance() {
      if (publicKey) {
        const walletBalance = await connection.getBalance(publicKey)
        setWalletSolBalance(walletBalance / LAMPORTS_PER_SOL)
      }
    }
    getSolBalance()
  }, [connection, publicKey, walletSolBalance])

  const setLucraAmountHandler = useCallback(
    (value: string) => {
      if (validNumericTrailingCharCheck(value)) {
        const lucraAmount = validNumericTrailingCharCheck(value)
        if (remainingStakedLucra && oraclePrices.LUCRA_SOL) {
          if (
            new Decimal(remainingStakedLucra.toString()).gte(
              new Decimal(lucraAmount)
            )
          ) {
            setLucraAmount(lucraAmount)
            lucraAmount === '0' ? setStakeLucra(false) : setStakeLucra(true)
            const lucraPrice = bigIntExpoToDecimal(
              oraclePrices.LUCRA_SOL.aggPrice,
              oraclePrices.LUCRA_SOL.expo
            )
            const collateralAmount = lucraPrice.mul(lucraAmount)
            lucraAmount !== '0' && setCollateral(collateralAmount.toString())
          }
        }
      } else if (value === '') {
        setLucraAmount('')
        setStakeLucra(false)
        setCollateral('')
      }
    },
    [oraclePrices, setLucraAmount, setCollateral, remainingStakedLucra]
  )

  const maxLucra = useCallback(() => {
    setLucraAmountHandler(remainingStakedLucra.toString())
  }, [remainingStakedLucra, setLucraAmountHandler])

  const toggleBrew = useCallback(() => {
    if (lucraAmount !== '0') {
      setLucraAmountHandler('0')
    } else {
      calculateStakedLucraToUse(collateral, true)
    }
  }, [
    lucraAmount,
    collateral,
    calculateStakedLucraToUse,
    setLucraAmountHandler,
  ])

  const maxAmountToStake = (
    nativeSOLBalance: number,
    totalStaked: number,
    transactionFee: number,
    marinadeState: marinade.State
  ) => {
    const stakingSolCap =
      marinadeState.staking_sol_cap &&
      Number(
        format5Dec(Number(marinadeState.staking_sol_cap), LAMPORTS_PER_SOL)
      )

    const extraAmountToKeep =
      transactionFee * 4 + marinadeState.rent_exempt_for_token_acc.toNumber()

    const fillCap =
      totalStaked &&
      marinadeState.staking_sol_cap &&
      Number(
        format5Dec(Number(marinadeState.staking_sol_cap), LAMPORTS_PER_SOL)
      ) - Number(format5Dec(totalStaked, LAMPORTS_PER_SOL))

    const maxSolBalance =
      nativeSOLBalance &&
      transactionFee &&
      marinadeState.rent_exempt_for_token_acc &&
      Math.max(
        nativeSOLBalance -
          transactionFee * 4 -
          Number(marinadeState.rent_exempt_for_token_acc),
        0
      ) / LAMPORTS_PER_SOL

    console.log('maxSolBalance: ', maxSolBalance)
    console.log('extraAmountToKeep: ', extraAmountToKeep)
    console.log('fillCap: ', fillCap)
    console.log('Number(format5Dec(totalStaked, LAMPORTS_PER_SOL))')
    console.log(Number(format5Dec(totalStaked, LAMPORTS_PER_SOL)))
    console.log('stakingSolCap: ', stakingSolCap)

    if (
      maxSolBalance + Number(format5Dec(totalStaked, LAMPORTS_PER_SOL)) <
      stakingSolCap
    ) {
      console.log('LESS')
      return maxSolBalance - numLamportsToSol(extraAmountToKeep)
    } else {
      console.log('MORE')
      return fillCap - numLamportsToSol(extraAmountToKeep)
    }
  }

  const createRichual = useCallback(async () => {
    if (!publicKey) {
      notify('error', 'Wallet not connected!')
      return
    }

    setButtonClicked(true)

    let signature: TransactionSignature = ''
    try {
      const walletBalance = await connection.getBalance(publicKey)
      const walletBalanceSOL = walletBalance / LAMPORTS_PER_SOL
      if (walletBalanceSOL < stringToNumber(collateral)) {
        throw Error(
          `Insufficient wallet balance of ${walletBalanceSOL.toFixed(
            5
          )} SOL for transaction of ${collateral} SOL.`
        )
      }
      if (stringToNumber(collateral) <= 0) {
        throw Error('No Collateral Provided')
      }

      // // Check Marinade
      const stateAccount = await connection.getAccountInfo(MARINADE_STATE_ID)
      const state: marinade.State = deserializeUnchecked(
        marinade.MARINADE_BORSH_SCHEMA,
        marinade.State,
        stateAccount!.data.slice(8)
      )

      const totalStaked = state?.validator_system?.total_active_balance
        ?.add(state?.stake_system.total_cooling_down)
        ?.add(state?.available_reserve_balance)
        // ?.sub(state?.circulating_ticket_balance)
        ?.toNumber()

      const transactionFee = (await connection.getRecentBlockhash())
        .feeCalculator.lamportsPerSignature

      if (
        Number(collateral) + Number(format5Dec(totalStaked, LAMPORTS_PER_SOL)) >
        Number(format5Dec(Number(state?.staking_sol_cap), LAMPORTS_PER_SOL))
      ) {
        const max = maxAmountToStake(
          walletBalance,
          totalStaked,
          transactionFee,
          state
        )
        setCollateral(max.toString())
        notify(
          'warning',
          'Marinade Staking Pool is limiting loan collateral to: ' +
            max.toString()
        )
        setLoading(false)
        setButtonClicked(false)
        dispatch(setOpenLoanTransactionSignature(null))
        return
      }
      // END Check

      const lucra = new Lucra(connection, configs.lucra)

      const stakeAccount = stakeLucra
        ? (await lucra.getStakeAccount(publicKey)).account
        : undefined

      const loanArgs = stakeAccount
        ? {
            payer: publicKey,
            lamports: BigInt(stringToNumber(collateral) * LAMPORTS_PER_SOL),
            stakeAccount,
          }
        : {
            payer: publicKey,
            lamports: BigInt(stringToNumber(collateral) * LAMPORTS_PER_SOL),
          }

      console.log(loanArgs)
      const createLoan = await lucra.createLoan(loanArgs)

      const transaction = new Transaction().add(...createLoan.instructions)
      notify('info', 'Richual Request Approval Needed')
      signature = await sendTransaction(transaction, connection, {
        signers: [...createLoan.signers],
      })
      notify('info', 'Transaction sent:', signature)
      setLoading(true)
      dispatch(setOpenLoanTransactionSignature(signature))

      await connection.confirmTransaction(signature, 'finalized')

      notify('success', 'Transaction successful!', signature)
      dispatch(setScanForNewLoans(true))
      dispatch(setRefreshStakeAccount(true))
      dispatch(setOpenLoanTransactionSignature(null))
      handleClose()
      setLoading(false)
      setButtonClicked(false)
      setCollateral('')
    } catch (error: any) {
      if (error instanceof WalletSendTransactionError) {
        notify('error', `Transaction failed! ${error?.message}`, signature)
        setLoading(false)
        setButtonClicked(false)
        dispatch(setScanForNewLoans(false))
        dispatch(setOpenLoanTransactionSignature(null))
        return
      } else {
        console.log(error)
        notify('error', `Transaction failed! ${error?.message}`, signature)
        setLoading(false)
        setButtonClicked(false)
        dispatch(setScanForNewLoans(false))
        dispatch(setOpenLoanTransactionSignature(null))
        return
      }
    }
  }, [
    connection,
    stakeLucra,
    publicKey,
    collateral,
    dispatch,
    handleClose,
    notify,
    sendTransaction,
    configs,
  ])

  const boxWidth = uiMode === 'desktop' ? '475px' : '95%'

  return (
    <>
      <p>&nbsp;</p>
      <Backdrop open={true} style={{ zIndex: 10000 }}>
        <Goldbox classes={['box-centered']}>
          {loading ? (
            <Grid container spacing={0}>
              <Grid className={'innerbox'} item xs={6}>
                <img
                  alt="casting ..."
                  style={{ width: '100%' }}
                  src="/golden-hourglass.gif"
                />
              </Grid>
              <Grid className={'innerbox innerbox-right'} item xs={6}>
                <div>
                  <div
                    className={
                      'text-header-white text-center box-padded-medium'
                    }
                  >
                    Casting Materia
                  </div>
                  <div className={'text-center'}>
                    {openLoanTransactionSignature ? (
                      <Link
                        className={styles.link}
                        href={`https://explorer.solana.com/tx/${openLoanTransactionSignature}?cluster=${WALLET_ADAPTER_NETWORK}`}
                        target="_blank"
                        alignContent={'center'}
                      >
                        View Transaction
                        <LaunchIcon className={styles.icon} />
                      </Link>
                    ) : (
                      <div className={'text-center'}>
                        <CircularProgress style={{ color: 'white' }} />
                      </div>
                    )}
                  </div>
                </div>
              </Grid>
            </Grid>
          ) : (
            <div className={'innerbox'}>
              <Box
                sx={{
                  p: 2,
                  width: boxWidth,
                }}
                className="Open-loan-modal"
              >
                <div className="text-modal-label-white">Create New Richual</div>
                <br />
                <div style={{ display: 'flex' }}>
                  <div style={{ flexGrow: 1 }}>
                    <InputBox
                      textLeft="Amount of SOL to Lock"
                      textRight={'Balance ' + walletSolBalance}
                      icon="/solana-glyph.png"
                      iconPosition={{ top: '7px', left: '4px' }}
                      value={collateral}
                      onChange={(e) => {
                        setCollateralAmount(e.target.value)
                      }}
                      maxButton={maxSOL}
                    />
                    <br />
                    <InputBox
                      textLeft="Staked Lucra to Use"
                      textRight={'Balance ' + remainingStakedLucra}
                      icon="/lucra-glyph-L-white.png"
                      iconPosition={{ top: '7px', left: '4px' }}
                      value={lucraAmount}
                      onChange={(e) => {
                        setLucraAmountHandler(e.target.value)
                      }}
                      maxButton={maxLucra}
                    />
                    <br />
                    <RichualAmountEstimate
                      collateral={collateral}
                      lucra={lucraAmount}
                    />
                  </div>
                  <div className="brew-connector-container">
                    <div className="brew-connector-top" />
                    <div
                      className={
                        lucraAmount === '0'
                          ? 'brew-icon-bg-disabled'
                          : 'brew-icon-bg'
                      }
                      onClick={() => {
                        toggleBrew()
                      }}
                    >
                      <img alt="" className="brew-icon" src="/brew-pot.svg" />
                    </div>
                    <div
                      className={
                        stakeLucra
                          ? 'brew-connector-bottom'
                          : 'brew-connector-bottom-disabled'
                      }
                    />
                    <div className="brew-connector-matabox">
                      <div className="brew-connector-matabox-border-cover" />
                    </div>
                  </div>
                </div>
                <br />
                <br />
                <Button
                  onClick={createRichual}
                  variant={'contained'}
                  disabled={buttonClicked || !collateral}
                >
                  Create Richual
                </Button>
                &nbsp;&nbsp;&nbsp;
                <RouteLink to={'/'} className={'button-link'}>
                  {''}
                  <Button variant={'contained'} color={'warning'}>
                    Cancel
                  </Button>
                </RouteLink>
              </Box>
            </div>
          )}
        </Goldbox>
      </Backdrop>
    </>
  )
}
