import {
  Lucra,
  RewardAccount,
  StakeBalance,
  StakingStateAccount,
} from '@lucra/sdk'
import { useConnection } from '@solana/wallet-adapter-react'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getRewardAccounts,
  setRewardAccounts,
} from '../../redux/modules/staking'
import { PublicKey } from '@solana/web3.js'
import { CircularProgress } from '@mui/material'
import { getConfigs } from '../../redux/modules/app'

export interface RewardsProps {
  stakeBalances: StakeBalance[]
  programStakingState: StakingStateAccount
  children: JSX.Element | JSX.Element[]
}

export const Rewards: FC<RewardsProps> = (props) => {
  const { connection } = useConnection()
  const dispatch = useDispatch()
  const rewardAccounts = useSelector(getRewardAccounts)
  const configs = useSelector(getConfigs)
  const compenentIsMounted = useRef(true)
  const [loading, setLoading] = useState(false)

  const checkRewards = useCallback(
    async (list: StakeBalance[], stakingState: StakingStateAccount) => {
      const getRewardAccount = (account: PublicKey): RewardAccount | null => {
        return (
          rewardAccounts?.find(
            (e) => e.account.toString() === account.toString()
          ) || null
        )
      }
      const getHighestRewardCursor = (list: RewardAccount[]): number => {
        return [...list].sort((a, b) => b.rewardCursor - a.rewardCursor)[0]
          .rewardCursor
      }

      if (
        compenentIsMounted.current &&
        (rewardAccounts === null ||
          (rewardAccounts &&
            rewardAccounts.length > 0 &&
            getHighestRewardCursor(rewardAccounts) !==
              stakingState.rewardCursor - 1))
      ) {
        setLoading(true)
        const lucra = new Lucra(connection, configs.lucra)
        const sortedBalances = [...list].sort(
          (a, b) => a.rewardCursor - b.rewardCursor
        )
        if (sortedBalances.length > 0) {
          const lowestBalance = sortedBalances[0]
          const rewardAccountKeys = await lucra.getRewardAccountKeys(
            lowestBalance,
            stakingState
          )
          let rewardList: RewardAccount[] = []
          for (const rewardKey of rewardAccountKeys) {
            try {
              const rewardAccount =
                getRewardAccount(rewardKey) ||
                (await lucra.getRewardAccount(rewardKey))
              rewardList.push(rewardAccount)
              await new Promise((e) => setTimeout(e, 100))
            } catch (e) {
              console.log('reward account does not exist')
            }
          }
          dispatch(setRewardAccounts(rewardList))
          console.log('dispatch(setRewardAccounts(rewardList))')
          console.log(rewardList)
        }
        setLoading(false)
      }
      console.log('-- END CHECKING FOR REWARDS --')
    },
    [connection, dispatch, rewardAccounts, setLoading, configs]
  )

  useEffect(() => {
    props.stakeBalances &&
      props.programStakingState &&
      checkRewards(props.stakeBalances, props.programStakingState)
    console.log('REWARDS MOUNTED')
    return () => {
      console.log('REWARDS UNMOUNTED')
      compenentIsMounted.current = false
    }
  }, [props, checkRewards])

  if (loading) {
    return (
      <div style={{ padding: '7px' }}>
        <CircularProgress
          style={{
            color: 'white',
            top: '20%',
            left: '2%',
            position: 'relative',
          }}
        />
      </div>
    )
  } else {
    return <div className="text-white">{props.children}</div>
  }
}
