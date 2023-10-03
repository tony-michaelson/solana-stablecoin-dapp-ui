import { FC, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  getRefreshStakingState,
  getStakeState,
  setRefreshStakingState,
  setStakingState,
} from '../../redux/modules/staking'
import { Lucra } from '@lucra/sdk'
import { useConnection } from '@solana/wallet-adapter-react'
import { useDispatch } from 'react-redux'
import { WatchState } from '../../utils/WatchState'
import isEqual from 'lodash.isequal'
import { getConfigs } from '../../redux/modules/app'

export const ProgramStakingState: FC = () => {
  const { connection } = useConnection()
  const dispatch = useDispatch()
  const programStakingState = useSelector(getStakeState)
  const configs = useSelector(getConfigs)

  const checkProgramStakingState = useCallback(async (): Promise<boolean> => {
    const lucra = new Lucra(connection, configs.lucra)
    const currentProgramStakingState = await lucra.getStakingStateAccount()
    if (
      programStakingState === null ||
      !isEqual(programStakingState, currentProgramStakingState)
    ) {
      dispatch(setStakingState(currentProgramStakingState))
      return true
    } else {
      return false
    }
  }, [connection, programStakingState, dispatch, configs])

  useEffect(() => {
    checkProgramStakingState()
  }, [checkProgramStakingState])

  WatchState({
    isActive: useSelector(getRefreshStakingState),
    setNonActive: () => dispatch(setRefreshStakingState(false)),
    stateChanged: checkProgramStakingState,
    interval: 2233,
    maxTries: 12,
  })

  return <></>
}
