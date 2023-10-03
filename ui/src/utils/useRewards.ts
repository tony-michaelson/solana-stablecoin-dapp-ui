import { RewardAccount } from '@lucra/sdk'
import { PublicKey } from '@solana/web3.js'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { getRewardAccounts, setRewardAccounts } from '../redux/modules/staking'

export const useRewards = () => {
  const rewardAccounts = useSelector(getRewardAccounts)
  const dispatch = useDispatch()
  const getRewardAccount = (account: PublicKey): RewardAccount | null => {
    return (
      rewardAccounts?.find(
        (e) => e.account.toString() === account.toString()
      ) || null
    )
  }

  const storeRewardAccount = (rewardAccount: RewardAccount): RewardAccount => {
    !getRewardAccount(rewardAccount.account) &&
      dispatch(setRewardAccounts(rewardAccounts?.concat(rewardAccount) || null))
    return rewardAccount
  }

  return [getRewardAccount, storeRewardAccount] as const
}
