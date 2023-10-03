import { FC, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  getRefreshStakeAccount,
  getStakeAccount,
  setRefreshStakeAccount,
  setStakeAccount,
} from '../../redux/modules/staking'
import { Lucra } from '@lucra/sdk'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useDispatch } from 'react-redux'
import { WatchState } from '../../utils/WatchState'
import isEqual from 'lodash.isequal'
import { getConfigs } from '../../redux/modules/app'

export const UserStakeAccountState: FC = () => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const dispatch = useDispatch()
  const configs = useSelector(getConfigs)
  const stakingAccount = useSelector(getStakeAccount)

  const checkStakeAccount = useCallback(async (): Promise<boolean> => {
    if (publicKey) {
      const lucra = new Lucra(connection, configs.lucra)
      const owner = publicKey
      try {
        const currentStakingAccount = await lucra.getStakeAccount(owner)
        if (
          stakingAccount === null ||
          !isEqual(stakingAccount, currentStakingAccount)
        ) {
          dispatch(setStakeAccount(currentStakingAccount))
          return true
        } else {
          return false
        }
      } catch (e) {
        dispatch(setStakeAccount('none'))
        return true
      }
    } else {
      return false
    }
  }, [publicKey, connection, stakingAccount, dispatch, configs])

  useEffect(() => {
    checkStakeAccount()
  }, [checkStakeAccount])

  WatchState({
    isActive: useSelector(getRefreshStakeAccount),
    setNonActive: () => dispatch(setRefreshStakeAccount(false)),
    stateChanged: checkStakeAccount,
    interval: 2233,
    maxTries: 12,
  })

  return <></>
}
