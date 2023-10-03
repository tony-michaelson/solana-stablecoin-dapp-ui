import { FC, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getConfigs,
  getOraclePrices,
  setOraclePrices,
} from '../../redux/modules/app'
import { useConnection } from '@solana/wallet-adapter-react'
import { Lucra } from '@lucra/sdk'
import { OracleAccount } from '@lucra/sdk/state/oracle'

export const OraclePrices: FC = () => {
  const { connection } = useConnection()
  const oraclePrices = useSelector(getOraclePrices)
  const configs = useSelector(getConfigs)
  const dispatch = useDispatch()

  const getPrices = useCallback(async () => {
    const lucra = new Lucra(connection, configs.lucra)

    const SOL_USDC = await lucra.getOracleAccount(
      configs.lucra.oracle.SOL_USDC.account
    )
    const SOL_USDT = await lucra.getOracleAccount(
      configs.lucra.oracle.SOL_USDT.account
    )
    const SOL_MATA = await lucra.getOracleAccount(
      configs.lucra.oracle.SOL_MATA.account
    )
    const LUCRA_SOL = await lucra.getOracleAccount(
      configs.lucra.oracle.LUCRA_SOL.account
    )
    const currentSlot = await connection.getSlot()
    const slotDiff = (lowestSlot: bigint): bigint => {
      return currentSlot ? BigInt(currentSlot) - lowestSlot : BigInt(0)
    }

    const validPrices = (oracle: OracleAccount): number => {
      const validPricesCount = oracle.prices.filter(
        (p) => p.slot >= oracle.lowestSlot
      ).length
      return validPricesCount
    }

    const SOL_USDC_DATA = {
      slotDiff: slotDiff(SOL_USDC.lowestSlot),
      validPrices: validPrices(SOL_USDC),
      ...SOL_USDC,
    }

    const SOL_USDT_DATA = {
      slotDiff: slotDiff(SOL_USDT.lowestSlot),
      validPrices: validPrices(SOL_USDT),
      ...SOL_USDT,
    }

    const SOL_MATA_DATA = {
      slotDiff: slotDiff(SOL_MATA.lowestSlot),
      validPrices: validPrices(SOL_MATA),
      ...SOL_MATA,
    }

    const LUCRA_SOL_DATA = {
      slotDiff: slotDiff(LUCRA_SOL.lowestSlot),
      validPrices: validPrices(LUCRA_SOL),
      ...LUCRA_SOL,
    }

    dispatch(
      setOraclePrices({
        SOL_USDC: SOL_USDC_DATA,
        SOL_USDT: SOL_USDT_DATA,
        SOL_MATA: SOL_MATA_DATA,
        LUCRA_SOL: LUCRA_SOL_DATA,
      })
    )
  }, [connection, dispatch, configs])

  useEffect(() => {
    oraclePrices.SOL_USDC === null && configs.lucra && getPrices()
    let id = setInterval(getPrices, 30000)
    return () => {
      clearInterval(id)
    }
  }, [oraclePrices, getPrices, configs])

  return <></>
}
