import { Lucra, StakeBalanceWithAmounts, StakingStateAccount } from '@lucra/sdk'
import { Button, CircularProgress } from '@mui/material'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { FC, useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  setDepositStakeModal,
  setModalAccount,
} from '../../redux/modules/staking'
import { LockupDuration } from '../../types'
import { lockRemaining, lucraAPR } from '../../utils/helpers'
import { WithdrawButton } from './WithdrawButton'
import isEqual from 'lodash.isequal'
import { PublicKey } from '@solana/web3.js'
import { WatchState } from '../../utils/WatchState'
import { ClaimRewardsButton } from './ClaimRewardsButton'
import { useSelector } from 'react-redux'
import { getConfigs, getUiMode } from '../../redux/modules/app'

export interface StakeBalanceProps {
  stakeBalanceAccount: PublicKey
  stakingState: StakingStateAccount
}

export const StakeBalanceItem: FC<StakeBalanceProps> = (props) => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [stakeBalance, setStakeBalance] =
    useState<StakeBalanceWithAmounts | null>(null)
  const [refresh, setRefresh] = useState(false)
  const [rewardEstimate, setRewardEstimate] = useState(0)
  const uiMode = useSelector(getUiMode)
  const configs = useSelector(getConfigs)
  const dispatch = useDispatch()

  const checkStakeBalance = useCallback(async (): Promise<boolean> => {
    if (publicKey) {
      const lucra = new Lucra(connection, configs.lucra)
      const currentStakeBalance = await lucra.getStakeBalanceWithAmounts(
        props.stakeBalanceAccount
      )
      const compareLeft = stakeBalance
      const compareRight = currentStakeBalance
      console.log(compareLeft)
      console.log(compareRight)
      if (!compareLeft || !isEqual(compareLeft, compareRight)) {
        setStakeBalance(currentStakeBalance)
        console.log('setStakeBalance(currentStakeBalance)')
        return true
      } else {
        console.log('no updates found yet')
        return false
      }
    } else {
      return false
    }
  }, [publicKey, setStakeBalance, connection, props, stakeBalance, configs])

  WatchState({
    isActive: refresh,
    setNonActive: () => {
      setRefresh(false)
    },
    stateChanged: checkStakeBalance,
    interval: 5000,
    maxTries: 5,
  })

  useEffect(() => {
    !stakeBalance && checkStakeBalance()
    return () => {}
  }, [checkStakeBalance, stakeBalance])

  if (stakeBalance && props.stakingState) {
    const lockDaysRemaining = lockRemaining(stakeBalance, props.stakingState)
    const rewardsPending =
      props.stakingState.rewardCursor > stakeBalance.rewardCursor

    if (uiMode === 'desktop') {
      return (
        <div className="flex-row" key={props.stakeBalanceAccount.toString()}>
          <div className="flex-column">
            <div className={'col-label-gold'}>Lucra Staked</div>
            <div className={'col-text-white'}>
              {stakeBalance.balance.stakeVault.uiAmount
                ? Math.round(stakeBalance.balance.stakeVault.uiAmount)
                : 0}
            </div>
          </div>
          <div className="flex-column">
            <div className={'col-label-gold'}>Est. APY</div>
            <div className={'col-text-white'}>
              {lucraAPR(stakeBalance.stakingTimeframe as LockupDuration)}%
            </div>
          </div>

          <div className="flex-column">
            <div className={'col-label-gold'}>Lock Remaining</div>
            <div className={'col-text-white'}>{lockDaysRemaining} Days</div>
          </div>

          <div className="flex-column">
            <div className={'col-label-gold'}>Rewards</div>
            <div className={'col-text-white'}>
              ${Math.round(rewardEstimate)}
            </div>
          </div>

          {rewardsPending ? (
            <div className="flex-column text-center min-content">
              <ClaimRewardsButton
                balance={stakeBalance}
                stakingState={props.stakingState}
                callback={() => {
                  setRefresh(true)
                }}
                rewardsEstimateCb={(amount: number) => {
                  setRewardEstimate(amount)
                }}
              />
            </div>
          ) : (
            <div className="flex-column text-center min-content">
              <WithdrawButton
                stakeBalance={stakeBalance}
                lockDaysRemaining={lockDaysRemaining}
                stakingState={props.stakingState}
                withdrawCallback={() => {
                  setRefresh(true)
                }}
              />
            </div>
          )}

          <div className="flex-column text-center min-content">
            <Button
              style={{
                top: '20%',
                minWidth: '120px',
              }}
              onClick={() => {
                dispatch(setModalAccount(stakeBalance))
                dispatch(
                  setDepositStakeModal(true, () => {
                    setRefresh(true)
                  })
                )
              }}
              disabled={
                props.stakingState
                  ? props.stakingState.rewardCursor !==
                    stakeBalance.rewardCursor
                  : false
              }
              variant={'outlined'}
            >
              Add To Stake
            </Button>
          </div>
        </div>
      )
    } else {
      return (
        <div
          className="flex-row"
          key={props.stakeBalanceAccount.toString()}
          style={{ display: 'block' }}
        >
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex' }}>
              <div className="flex-column">
                <div className={'col-label-gold'}>Lucra Staked</div>
                <div className={'col-text-white'}>
                  {stakeBalance.balance.stakeVault.uiAmount
                    ? Math.round(stakeBalance.balance.stakeVault.uiAmount)
                    : 0}
                </div>
              </div>
              <div className="flex-column">
                <div className={'col-label-gold'}>Est. APY</div>
                <div className={'col-text-white'}>
                  {lucraAPR(stakeBalance.stakingTimeframe as LockupDuration)}%
                </div>
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div className="flex-column">
                <div className={'col-label-gold'}>Lock Remaining</div>
                <div className={'col-text-white'}>{lockDaysRemaining} Days</div>
              </div>

              <div className="flex-column">
                <div className={'col-label-gold'}>Rewards</div>
                <div className={'col-text-white'}>
                  ${Math.round(rewardEstimate)}
                </div>
              </div>
            </div>
          </div>
          <div style={{ width: '100%' }}>
            <div
              style={{ width: '100%', display: 'flex', marginBottom: '15px' }}
            >
              {rewardsPending ? (
                <div className="flex-column text-center min-content">
                  <ClaimRewardsButton
                    balance={stakeBalance}
                    stakingState={props.stakingState}
                    callback={() => {
                      setRefresh(true)
                    }}
                    rewardsEstimateCb={(amount: number) => {
                      setRewardEstimate(amount)
                    }}
                  />
                </div>
              ) : (
                <>
                  <div className="flex-column text-center min-content">
                    <WithdrawButton
                      stakeBalance={stakeBalance}
                      lockDaysRemaining={lockDaysRemaining}
                      stakingState={props.stakingState}
                      withdrawCallback={() => {
                        setRefresh(true)
                      }}
                      text="Withdraw"
                      minWidth="90px"
                    />
                  </div>
                  <div className="flex-column text-center min-content">
                    <Button
                      style={{
                        top: '20%',
                        minWidth: '60px',
                      }}
                      onClick={() => {
                        dispatch(setModalAccount(stakeBalance))
                        dispatch(
                          setDepositStakeModal(true, () => {
                            setRefresh(true)
                          })
                        )
                      }}
                      disabled={
                        props.stakingState
                          ? props.stakingState.rewardCursor !==
                            stakeBalance.rewardCursor
                          : false
                      }
                      variant={'outlined'}
                    >
                      Add
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )
    }
  } else {
    return (
      <div className={'text-center'}>
        <CircularProgress
          style={{
            color: 'white',
            top: '40%',
            left: '45%',
          }}
        />
      </div>
    )
  }
}
