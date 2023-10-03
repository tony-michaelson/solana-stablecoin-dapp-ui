import { FC, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getOraclePrices } from '../../redux/modules/app'
import { getStakeAccount } from '../../redux/modules/staking'
import { bigIntExpoToDecimal } from '../../utils/helpers'
import { Decimal } from 'decimal.js'
import { COLLATERAL_RATE, LUCRA_PORTS } from '../../utils/constants'
import { CircularProgress } from '@mui/material'

export const MataBoostRemaining: FC = () => {
  const oraclePrices = useSelector(getOraclePrices)
  const stakingAccount = useSelector(getStakeAccount)
  const [mataBoost, setMataBoost] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    stakingAccount && setLoading(false)
  }, [stakingAccount, setLoading])

  useEffect(() => {
    if (
      oraclePrices.SOL_USDC &&
      oraclePrices.SOL_USDT &&
      oraclePrices.LUCRA_SOL &&
      stakingAccount &&
      stakingAccount !== 'none'
    ) {
      const lowestSolUsdPrice = bigIntExpoToDecimal(
        oraclePrices.SOL_USDC.aggPrice > oraclePrices.SOL_USDT.aggPrice
          ? oraclePrices.SOL_USDT.aggPrice
          : oraclePrices.SOL_USDC.aggPrice,
        oraclePrices.SOL_USDT.expo
      )
      const solLucraPrice = bigIntExpoToDecimal(
        oraclePrices.LUCRA_SOL.aggPrice,
        oraclePrices.LUCRA_SOL.expo
      )

      const lucraUsdPrice = solLucraPrice.mul(lowestSolUsdPrice)

      const stakedLucraAmountRemaining =
        (stakingAccount.total - stakingAccount.lockedTotal) /
        BigInt(LUCRA_PORTS)

      const stakedLucraUsdValue = lucraUsdPrice
        .mul(stakedLucraAmountRemaining.toString())
        .div(new Decimal(COLLATERAL_RATE))

      const mataBoostRemaining = stakedLucraUsdValue
        .sub(stakingAccount.lockedTotal.toString())
        .toNearest(0.01)

      setMataBoost(mataBoostRemaining.toString())
    }
  }, [setMataBoost, oraclePrices, stakingAccount])

  if (stakingAccount === 'none') {
    return <>0 MATA</>
  } else if (loading || mataBoost === '') {
    return (
      <CircularProgress
        style={{
          top: '20%',
          position: 'relative',
          color: 'white',
        }}
      />
    )
  } else {
    return <>{stakingAccount ? mataBoost : '0'} MATA</>
  }
}
