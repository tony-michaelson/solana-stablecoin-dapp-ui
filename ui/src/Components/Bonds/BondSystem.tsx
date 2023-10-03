import { Bond, BondSystemAccount } from '@lucra/sdk'
import { Button } from '@mui/material'
import { useConnection } from '@solana/wallet-adapter-react'
import Decimal from 'decimal.js'
import { FC } from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { getConfigs, getOraclePrices, getUiMode } from '../../redux/modules/app'
import { setBuyBondModal } from '../../redux/modules/bonds'
import { LUCRA_PORTS } from '../../utils/constants'
import { getOraclePrice, numberWithCommas } from '../../utils/helpers'

export interface BondSystemProps {
  name: string
  system: BondSystemAccount
}

export const BondSystem: FC<BondSystemProps> = (props) => {
  const oraclePrices = useSelector(getOraclePrices)
  const dispatch = useDispatch()
  const { connection } = useConnection()
  const configs = useSelector(getConfigs)
  const bondProgram = new Bond(connection, configs.bonds, configs.bondSystems)
  const uiMode = useSelector(getUiMode)
  let totalValueInUSD = new Decimal(0)
  if (
    oraclePrices.SOL_USDC &&
    oraclePrices.SOL_USDT &&
    oraclePrices.LUCRA_SOL
  ) {
    console.log(
      'totalAmountDistributed:',
      props.system.totalAmountDistributed.toString()
    )
    const valueInSol = new Decimal(
      props.system.totalAmountDistributed.toString()
    )
      .div(LUCRA_PORTS)
      .mul(new Decimal(oraclePrices.LUCRA_SOL.aggPrice.toString()))

    console.log('valueInSol:', valueInSol.toString())

    totalValueInUSD =
      oraclePrices.SOL_USDC.aggPrice < oraclePrices.SOL_USDT.aggPrice
        ? valueInSol
            .mul(new Decimal(getOraclePrice(oraclePrices.SOL_USDC).toString()))
            .round()
        : valueInSol
            .mul(new Decimal(getOraclePrice(oraclePrices.SOL_USDT).toString()))
            .round()
  }

  if (uiMode === 'desktop') {
    return (
      <div className="flex-row">
        <div className="flex-column" style={{ width: '30%' }}>
          <div className={'col-label-gold'}>Bond</div>
          <div className={'col-text-white'}>{props.name}</div>
        </div>
        <div className="flex-column">
          <div className={'col-label-gold'}>Payout Asset</div>
          <div className={'col-text-white'}>LUCRA</div>
        </div>

        <div className="flex-column">
          <div className={'col-label-gold'}>Interest</div>
          <div className={'col-text-white'}>
            {props.system.bondYield.toString()}%
          </div>
        </div>

        <div className="flex-column">
          <div className={'col-label-gold'}>Total Sold</div>
          <div className={'col-text-white'}>
            ${numberWithCommas(totalValueInUSD.toString())}
          </div>
        </div>

        <div className="flex-column text-center min-content">
          <Button
            style={{
              top: '20%',
            }}
            disabled={props.system.closed}
            onClick={() => {
              const bondSystemName = bondProgram.getSystemNameByAccount(
                props.system.account
              )
              dispatch(setBuyBondModal(true, bondSystemName))
            }}
            variant={'outlined'}
          >
            {'Buy'}
          </Button>
        </div>
      </div>
    )
  } else {
    return (
      <div className="flex-row" style={{ display: 'block' }}>
        <div className="flex-column" style={{ width: '100%' }}>
          <div className={'col-label-gold'}>Bond</div>
          <div className={'col-text-white'}>{props.name}</div>
        </div>

        <div style={{ display: 'flex' }}>
          <div className="flex-column">
            <div className={'col-label-gold'}>Payout Asset</div>
            <div className={'col-text-white'}>LUCRA</div>
          </div>

          <div className="flex-column">
            <div className={'col-label-gold'}>Interest</div>
            <div className={'col-text-white'}>
              {props.system.bondYield.toString()}%
            </div>
          </div>
        </div>

        <div className="flex-column">
          <div className={'col-label-gold'}>Total Sold</div>
          <div className={'col-text-white'}>
            ${numberWithCommas(totalValueInUSD.toString())}
          </div>
        </div>

        <div className="flex-column text-center min-content">
          <Button
            style={{
              top: '20%',
            }}
            disabled={props.system.closed}
            onClick={() => {
              const bondSystemName = bondProgram.getSystemNameByAccount(
                props.system.account
              )
              dispatch(setBuyBondModal(true, bondSystemName))
            }}
            variant={'outlined'}
          >
            {'Buy'}
          </Button>
        </div>
      </div>
    )
  }
}
