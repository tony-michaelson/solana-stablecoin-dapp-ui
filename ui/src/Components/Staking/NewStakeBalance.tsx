import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { FC, useCallback, useEffect, useState } from 'react'
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  Link,
} from '@mui/material'
import { useDispatch } from 'react-redux'
import { useNotify } from '../../utils/notify'
import LaunchIcon from '@material-ui/icons/Launch'
import {
  bigIntExpoToDecimal,
  findAssociatedTokenAddress,
  lastWeekMsolEstimate,
  lucraAPR,
  numberWithCommas,
  validNumericTrailingCharCheck,
} from '../../utils/helpers'
import { Goldbox } from '../Goldbox/Goldbox'
import { generateStakeAcctKeypairs, Lucra, StakingTimeframe } from '@lucra/sdk'
import { Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { WalletSendTransactionError } from '@solana/wallet-adapter-base'
import { COLLATERAL_RATE, LUCRA_PORTS } from '../../utils/constants'
import {
  getCreateStake2Signature,
  getCreateStakeSignature,
  getLastRewardAccount,
  getStakeAccount,
  getStakeState,
  setCreateStake2Signature,
  setCreateStakeSignature,
  setRefreshBalances,
  setRefreshStakeAccount,
} from '../../redux/modules/staking'
import { InputBox } from '../InputBox/InputBox'
import { LockDuration } from './LockDuration'
import './NewStakeBalance.css'
import { useStyles } from '../../styles'
import { useSelector } from 'react-redux'
import { WALLET_ADAPTER_NETWORK } from '../../utils/wallet-config'
import { LockupDuration } from '../../types'
import { getConfigs, getOraclePrices, getUiMode } from '../../redux/modules/app'
import { Decimal } from 'decimal.js'

export const NewStakeBalance: FC = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [stakeAmount, setStakeAmount] = useState('')
  const [juiceTotal, setJuiceTotal] = useState('0')
  const [loading, setLoading] = useState(false)
  const configs = useSelector(getConfigs)
  const [buttonClicked, setButtonClicked] = useState(false)
  const [lockupDuration, setLockupDuration] = useState<LockupDuration>(0)
  const [walletLucraBalance, setWalletLucraBalance] = useState(0)
  const dispatch = useDispatch()
  const notify = useNotify()
  const styles = useStyles()
  const createStakeBalanceTransactionSignature = useSelector(
    getCreateStakeSignature
  )
  const createStakeBalance2TransactionSignature = useSelector(
    getCreateStake2Signature
  )
  const stakeAccount = useSelector(getStakeAccount)
  const oraclePrices = useSelector(getOraclePrices)
  const programStakingState = useSelector(getStakeState)
  const lastRewardAccount = useSelector(getLastRewardAccount)
  const uiMode = useSelector(getUiMode)

  const setStakeAmountHandler = useCallback(
    (value: string) => {
      if (validNumericTrailingCharCheck(value)) {
        setStakeAmount(validNumericTrailingCharCheck(value))
      } else if (value === '') {
        setStakeAmount('')
      }
    },
    [setStakeAmount]
  )

  const createStakeBalance = useCallback(async () => {
    if (!publicKey) {
      notify('error', 'Wallet not connected!')
      return
    }

    setButtonClicked(true)

    let signature = ''
    let signature2 = ''
    let transactionErr = ''

    try {
      const lucraPorts = new Decimal(stakeAmount).mul(LUCRA_PORTS)

      // check LUCRA balance
      const lucraAtaAddress = await findAssociatedTokenAddress(
        publicKey,
        configs.lucra.mint.lucra.address
      )

      const walletBalance = await connection.getTokenAccountBalance(
        lucraAtaAddress
      )
      const walletBalanceLucra = walletBalance.value.uiAmount
      if (walletBalanceLucra && walletBalanceLucra < parseFloat(stakeAmount)) {
        throw Error(
          `Insufficient wallet balance of ${walletBalanceLucra} LUCRA for transaction of ${stakeAmount} LUCRA.`
        )
      }
      // end mata balance check

      const lucra = new Lucra(connection, configs.lucra)
      const createStakeAccount = await lucra.createStakeAccount({
        owner: publicKey,
      })
      const stakeBalanceAccountKP = Keypair.generate()
      const keypairs = await generateStakeAcctKeypairs(
        stakeBalanceAccountKP.publicKey
      )

      let lockup = StakingTimeframe.Default
      if (lockupDuration === 1) {
        lockup = StakingTimeframe.OneYear
      }
      if (lockupDuration === 2) {
        lockup = StakingTimeframe.TwoYear
      }

      const createStakeBalance = await lucra.createStakeBalance({
        owner: publicKey,
        timeframe: lockup,
        stakeBalanceAccountKP,
        ...keypairs,
      })
      const deposit = await lucra.depositStake({
        owner: publicKey,
        stakeBalanceAccount: stakeBalanceAccountKP.publicKey,
        depositVault: keypairs.depositVaultKP.publicKey,
        lucra: BigInt(lucraPorts.toString()),
      })
      const stake = await lucra.stake({
        owner: publicKey,
        stakeBalanceAccount: stakeBalanceAccountKP.publicKey,
        stakeAccount: createStakeAccount.address,
        depositVault: keypairs.depositVaultKP.publicKey,
        stakeVault: keypairs.stakeVaultKP.publicKey,
        stakedLucraVault: keypairs.stakedLucraVaultKP.publicKey,
        lucra: BigInt(lucraPorts.toString()),
      })

      setLoading(true)
      // -- TRANSACTION 1 -- //
      const transaction = new Transaction().add(
        ...createStakeBalance.transaction1.instructions
      )
      signature = await sendTransaction(transaction, connection, {
        signers: [...createStakeBalance.transaction1.signers],
      })
      notify('info', 'Transaction 1 of 2 sent:', signature)
      const result = await connection.confirmTransaction(signature, 'finalized')
      transactionErr = result.value.err ? result.value.err.toString() : ''

      await connection.confirmTransaction(signature, 'finalized')
      notify('success', 'Transaction 1 successful!', signature)
      dispatch(setCreateStakeSignature(signature))
      stakeAccount === 'none' && dispatch(setRefreshStakeAccount(true))

      // -- TRANSACTION 2 -- //
      const transaction2 = new Transaction()
      if (createStakeAccount.instructions.length > 0) {
        transaction2.add(...createStakeAccount.instructions)
      }
      transaction2.add(...createStakeBalance.transaction2.instructions)
      transaction2.add(deposit)
      transaction2.add(stake)
      const signature2 = await sendTransaction(transaction2, connection, {
        signers: [
          ...createStakeAccount.signers,
          ...createStakeBalance.transaction2.signers,
        ],
      })
      console.log('txid:', signature2)

      notify('info', 'Transaction 2 of 2 sent:', signature2)
      await connection.confirmTransaction(signature2, 'finalized')
      notify('success', 'Transaction 2 successful!', signature2)
      dispatch(setCreateStake2Signature(signature2))

      setStakeAmountHandler('')
      setButtonClicked(false)
      dispatch(setRefreshBalances(true))
      setTimeout(() => {
        setLoading(false)
        dispatch(setCreateStakeSignature(''))
        dispatch(setCreateStake2Signature(''))
      }, 4440)
    } catch (error: any) {
      setButtonClicked(false)
      if (error instanceof WalletSendTransactionError) {
        notify(
          'error',
          `Transaction failed! ${error?.message}`,
          transactionErr ? signature : signature2
        )
        setLoading(false)
        return
      } else {
        console.log(error)
        notify(
          'error',
          `Transaction failed! ${error?.message}`,
          transactionErr ? signature : signature2
        )
        setLoading(false)
        return
      }
    }
  }, [
    connection,
    publicKey,
    stakeAmount,
    stakeAccount,
    setStakeAmountHandler,
    dispatch,
    notify,
    sendTransaction,
    lockupDuration,
    configs,
  ])

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

  function mataBoost(lucra: string): string {
    const lucraDecimal = new Decimal(lucra ? lucra : '0')
    if (
      oraclePrices.LUCRA_SOL &&
      oraclePrices.SOL_USDC &&
      oraclePrices.SOL_USDT
    ) {
      const solUsdPrice = bigIntExpoToDecimal(
        oraclePrices.SOL_USDC.aggPrice > oraclePrices.SOL_USDT.aggPrice
          ? oraclePrices.SOL_USDT.aggPrice
          : oraclePrices.SOL_USDC.aggPrice,
        oraclePrices.SOL_USDC.expo
      )
      const lucraSolPrice = bigIntExpoToDecimal(
        oraclePrices.LUCRA_SOL.aggPrice,
        oraclePrices.LUCRA_SOL.expo
      )
      const lucraValueInSol = lucraDecimal.mul(lucraSolPrice)
      const lucraValueInUsd = lucraValueInSol.mul(solUsdPrice)
      const mataBoost = Math.round(
        lucraValueInUsd.div(COLLATERAL_RATE).toNumber()
      )
      return mataBoost.toString()
    } else {
      return '0'
    }
  }

  const calculateJuiceTotal = useCallback(async () => {
    if (programStakingState && lockupDuration >= 1 && stakeAmount) {
      const lucraAmount = new Decimal(stakeAmount)
      const stakingTreasury = await connection.getTokenAccountBalance(
        configs.lucra.account.treasury.address
      )
      if (lastRewardAccount && stakingTreasury?.value.uiAmount) {
        const juiceRemaining = new Decimal(stakingTreasury.value.uiAmount)
        const weeklyJuice = new Decimal(
          programStakingState.amountToDistributePerEpoch.toString()
        ).div(LUCRA_PORTS)
        console.log('juiceRemaining', juiceRemaining.toString())
        console.log('weeklyJuice', weeklyJuice.toString())
        const weeksRemaining = juiceRemaining.div(weeklyJuice)
        const weeksLocked = new Decimal(lockupDuration * 52)
        const weeksInScope = weeksRemaining.gt(weeksLocked)
          ? weeksLocked
          : weeksRemaining
        const totalJuice = weeksInScope.mul(weeklyJuice)

        const stakedTokenSupply = new Decimal(
          lastRewardAccount.poolTokenSupply.toString()
        )
          .div(LUCRA_PORTS)
          .add(lucraAmount)
        const shareOfSupply = lucraAmount.div(stakedTokenSupply)
        console.log('shareOfSupply', shareOfSupply.toString())
        const firstWeekReward = numberWithCommas(
          totalJuice.mul(shareOfSupply).toNumber().toFixed(2)
        )

        setJuiceTotal(firstWeekReward)
      } else {
        setJuiceTotal('0')
      }
    } else {
      setJuiceTotal('0')
    }
  }, [
    programStakingState,
    setJuiceTotal,
    lockupDuration,
    connection,
    stakeAmount,
    lastRewardAccount,
    configs,
  ])

  useEffect(() => {
    calculateJuiceTotal()
  }, [calculateJuiceTotal])

  const mSOLApr =
    stakeAmount && lastRewardAccount
      ? lastWeekMsolEstimate(new Decimal(stakeAmount), lastRewardAccount)
          .toNumber()
          .toFixed(5)
      : '0'

  return (
    <>
      <div className={'innerbox'}>
        <Box
          sx={{
            p: 2,
            width: uiMode === 'desktop' ? '400px' : 'auto',
          }}
          className="Open-loan-modal"
        >
          <div className="text-modal-label-white">Create New Stake</div>
          <br />
          <InputBox
            textLeft="Amount"
            textRight={'Lucra Balance ' + walletLucraBalance}
            icon="/lucra-glyph-L-white.png"
            iconPosition={{ top: '7px', left: '4px' }}
            value={stakeAmount}
            onChange={(e) => {
              setStakeAmountHandler(e.target.value)
            }}
            maxButton={maxLUCRA}
          />
          <br />
          <LockDuration
            onClick={(option: LockupDuration) => {
              setLockupDuration(option)
            }}
          />
          <br />
          <div>
            <div className="lock-duration-container-label">
              Reward Estimates
            </div>
            <div className="staking-reward-box">
              <div style={{ display: 'flex' }}>
                <div className="staking-reward-label">LUCRA APR:</div>
                <div className="staking-reward-value">
                  {lucraAPR(lockupDuration)}%
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                <div className="staking-reward-label">
                  First Week mSOL Reward:
                </div>
                <div className="staking-reward-value">{mSOLApr}</div>
              </div>

              <div style={{ display: 'flex' }}>
                <div className="staking-reward-label">
                  First Week Juice Rewards:
                </div>
                <div className="staking-reward-value">{juiceTotal}</div>
              </div>
              <div style={{ display: 'flex' }}>
                <div className="staking-reward-label">Mata Boost:</div>
                <div className="staking-reward-value">
                  ${numberWithCommas(mataBoost(stakeAmount))}
                </div>
              </div>
            </div>
          </div>
          <br />
          <Button
            onClick={createStakeBalance}
            variant={'contained'}
            disabled={buttonClicked || !stakeAmount}
            style={{ width: '100%' }}
          >
            Create New Stake
          </Button>
        </Box>
      </div>

      {loading && (
        <Backdrop open={true} style={{ zIndex: 10000 }}>
          <Goldbox classes={['box-centered']}>
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
                    Creating New Stake
                  </div>
                  <div className={'text-center'}>
                    {createStakeBalanceTransactionSignature ? (
                      <Link
                        className={styles.link}
                        href={`https://explorer.solana.com/tx/${createStakeBalanceTransactionSignature}?cluster=${WALLET_ADAPTER_NETWORK}`}
                        target="_blank"
                        alignContent={'center'}
                      >
                        View Transaction 1 of 2
                        <LaunchIcon className={styles.icon} />
                      </Link>
                    ) : (
                      <div className={'text-center'}>
                        <CircularProgress style={{ color: 'white' }} />
                      </div>
                    )}
                  </div>
                  <br />
                  <div className={'text-center'}>
                    {createStakeBalance2TransactionSignature ? (
                      <Link
                        className={styles.link}
                        href={`https://explorer.solana.com/tx/${createStakeBalance2TransactionSignature}?cluster=${WALLET_ADAPTER_NETWORK}`}
                        target="_blank"
                        alignContent={'center'}
                      >
                        View Transaction 2 of 2
                        <LaunchIcon className={styles.icon} />
                      </Link>
                    ) : (
                      createStakeBalanceTransactionSignature && (
                        <div className={'text-center'}>
                          <CircularProgress style={{ color: 'white' }} />
                        </div>
                      )
                    )}
                  </div>
                </div>
              </Grid>
            </Grid>
          </Goldbox>
        </Backdrop>
      )}
    </>
  )
}
