import { FC, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  getLastRewardAccount,
  getStakeState,
  setLastRewardAccount,
} from '../../redux/modules/staking'
import { Lucra, StakingStateAccount } from '@lucra/sdk'
import { useConnection } from '@solana/wallet-adapter-react'
import { useDispatch } from 'react-redux'
import { getConfigs } from '../../redux/modules/app'

export const LastReward: FC = () => {
  const { connection } = useConnection()
  const dispatch = useDispatch()
  const programStakingState = useSelector(getStakeState)
  const configs = useSelector(getConfigs)
  const lastRewardAccount = useSelector(getLastRewardAccount)

  const checkLastRewardAccount = useCallback(
    async (stakingState: StakingStateAccount) => {
      const lucra = new Lucra(connection, configs.lucra)
      const lastRewardNumber = stakingState.rewardCursor - 1
      if (lastRewardNumber > 0) {
        try {
          const lastRewardAccountKP = await lucra.generateRewardAccountKP(
            lastRewardNumber
          )
          const lastRewardAccount = await lucra.getRewardAccount(
            lastRewardAccountKP.publicKey
          )

          dispatch(setLastRewardAccount(lastRewardAccount))
        } catch (e) {
          console.log('error fetching last reward account:', e)
        }
      }
    },
    [connection, dispatch, configs]
  )

  useEffect(() => {
    programStakingState &&
      !lastRewardAccount &&
      checkLastRewardAccount(programStakingState)
  }, [programStakingState, checkLastRewardAccount, lastRewardAccount])

  return <></>
}
