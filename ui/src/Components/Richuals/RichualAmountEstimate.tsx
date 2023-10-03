import { FC } from 'react'
import { useSelector } from 'react-redux'
import { getOraclePrices } from '../../redux/modules/app'
import { calculateLoanAmount, stringToNumber } from '../../utils/helpers'
import './RichualAmountEstimate.css'

interface propsState {
  collateral: string
  lucra: string
}

export const RichualAmountEstimate: FC<propsState> = (props) => {
  const oraclePrices = useSelector(getOraclePrices)
  if (
    oraclePrices.SOL_USDC &&
    oraclePrices.SOL_USDT &&
    oraclePrices.LUCRA_SOL
  ) {
    const LOWEST_SOL_PRICE =
      oraclePrices.SOL_USDC.aggPrice > oraclePrices.SOL_USDT.aggPrice
        ? oraclePrices.SOL_USDT
        : oraclePrices.SOL_USDC
    const loanAmount = calculateLoanAmount(
      stringToNumber(props.collateral),
      stringToNumber(props.lucra),
      LOWEST_SOL_PRICE,
      oraclePrices.LUCRA_SOL
    )
    return (
      <>
        <div className="col-label-white">What You'll Receive</div>
        <div className="estimate-box">{loanAmount} MATA</div>
      </>
    )
  } else {
    return (
      <>
        <div className="col-label-white">What You'll Receive</div>
        <div className="estimate-box">Unknown</div>
      </>
    )
  }
}
