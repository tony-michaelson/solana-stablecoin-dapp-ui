import { Lucra, StakeBalance } from '@lucra/sdk'
import { CircularProgress } from '@mui/material'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { FC, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getRefreshBalances,
  getStakeBalances,
  getStakeState,
  getStakingInfo,
  setRefreshBalances,
  setStakeBalances,
} from '../../redux/modules/staking'
import { WatchState } from '../../utils/WatchState'
import { StakeBalanceItem } from './StakeBalanceItem'
import isEqual from 'lodash.isequal'
import { lockRemaining } from '../../utils/helpers'
import { Rewards } from './Rewards'
import { getConfigs } from '../../redux/modules/app'

export const StakeBalanceList: FC = () => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const dispatch = useDispatch()
  const programStakingState = useSelector(getStakeState)
  const stakingInfo = useSelector(getStakingInfo)
  const stakeBalances = useSelector(getStakeBalances)
  const refreshingStakeBalances = useSelector(getRefreshBalances)
  const configs = useSelector(getConfigs)

  if (publicKey && !stakingInfo.walletKey?.equals(publicKey)) {
    dispatch(setStakeBalances(null, publicKey))
  }

  const checkStakeBalances = useCallback(async (): Promise<boolean> => {
    if (publicKey) {
      const lucra = new Lucra(connection, configs.lucra)
      const owner = publicKey
      const currentStakeBalances = await lucra.getStakeBalances(owner)
      const compareLeft = stakeBalances?.map((e) => [e.account])
      const compareRight = currentStakeBalances?.map((e) => [e.account])
      if (stakeBalances === null || !isEqual(compareLeft, compareRight)) {
        dispatch(setStakeBalances(currentStakeBalances, publicKey))
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }, [publicKey, connection, stakeBalances, dispatch, configs])

  useEffect(() => {
    stakeBalances === null && checkStakeBalances()
    return () => {}
  }, [stakeBalances, checkStakeBalances, programStakingState])

  WatchState({
    isActive: refreshingStakeBalances,
    setNonActive: () => dispatch(setRefreshBalances(false)),
    stateChanged: checkStakeBalances,
    interval: 5000,
    maxTries: 5,
  })

  if (refreshingStakeBalances) {
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
  } else if (stakeBalances?.length && programStakingState) {
    let balances: StakeBalance[] = Object.assign([], stakeBalances)
    console.log(stakeBalances)
    return (
      <Rewards
        stakeBalances={stakeBalances}
        programStakingState={programStakingState}
      >
        <div style={{ padding: '7px' }}>
          <div style={{ margin: '15px', display: 'flex' }}>
            <div
              style={{ width: '100%', alignSelf: 'start', marginTop: 'auto' }}
              className={'text-header-white'}
            >
              Active Stakes
            </div>
          </div>
          {balances
            .sort((a, b) => {
              const aLR = lockRemaining(a, programStakingState)
              const bLR = lockRemaining(b, programStakingState)
              return aLR > bLR ? 1 : -1
            })
            .map((stakeBalance) => (
              <StakeBalanceItem
                key={stakeBalance.account.toString()}
                stakeBalanceAccount={stakeBalance.account}
                stakingState={programStakingState}
              />
            ))}
        </div>
      </Rewards>
    )
  } else {
    return <></>
  }
}
