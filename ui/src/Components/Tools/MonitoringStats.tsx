import { Bond, Lucra, LucraOracles, SystemNames } from '@lucra/sdk'
import { CircularProgress } from '@mui/material'
import { useConnection } from '@solana/wallet-adapter-react'
import Decimal from 'decimal.js'
import { FC, useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getConfigs, getOraclePrices } from '../../redux/modules/app'
import {
  getBondSystemBalances,
  setBondSystemBalances,
} from '../../redux/modules/bonds'
import './Monitoring.css'

export const MonitoringStats: FC = () => {
  const { connection } = useConnection()
  const oraclePrices = useSelector(getOraclePrices)
  const bondSystemBalances = useSelector(getBondSystemBalances)
  const configs = useSelector(getConfigs)
  const dispatch = useDispatch()
  const [msolVault, setMsolVault] = useState<number | null>(0)
  const [linusVault, setLinusVault] = useState<number | null>(0)
  const [stakeTreasury, setStakeTreasury] = useState<number | null>(0)
  const [mataSupply, setMataSupply] = useState<number | null>(0)
  const [lucraSupply, setLucraSupply] = useState<number | null>(0)
  const [stakedLucraSupply, setStakedLucraSupply] = useState<number | null>(0)
  const [collateralRequirement, setCollateralRequirement] = useState<number>(0)
  const [pegBroken, setPegBroken] = useState<boolean>(false)
  const [pegCheckEnabled, setPegCheckEnabled] = useState<boolean>(false)

  const fetchBondSystemBalances = useCallback(async (): Promise<void> => {
    const bondProgram = new Bond(connection, configs.bonds, configs.bondSystems)
    const bondSystemBalances = await bondProgram.getBondSystemBalances()
    dispatch(setBondSystemBalances(bondSystemBalances))
  }, [connection, dispatch, configs])

  const fetchProtoStats = useCallback(async (): Promise<void> => {
    const msolVaultBalance = await connection.getTokenAccountBalance(
      configs.lucra.account.msolVault.address
    )
    const linusVaultBalance = await connection.getTokenAccountBalance(
      configs.lucra.account.arbCoffer.address
    )
    const stakeTreasuryBalance = await connection.getTokenAccountBalance(
      configs.lucra.account.treasury.address
    )
    const mataSupply = await connection.getTokenSupply(
      configs.lucra.mint.mata.address
    )
    const lucraSupply = await connection.getTokenSupply(
      configs.lucra.mint.lucra.address
    )
    const stakedLucraSupply = await connection.getTokenSupply(
      configs.lucra.mint.stLucra.address
    )

    const lucra = new Lucra(connection, configs.lucra)
    const lucraState = await lucra.getStateAccount(configs.lucra.account.state)
    const pegBroken = lucraState.pegBroken

    setMsolVault(msolVaultBalance.value.uiAmount)
    setLinusVault(linusVaultBalance.value.uiAmount)
    setStakeTreasury(stakeTreasuryBalance.value.uiAmount)
    setMataSupply(mataSupply.value.uiAmount)
    setLucraSupply(lucraSupply.value.uiAmount)
    setStakedLucraSupply(stakedLucraSupply.value.uiAmount)
    setPegBroken(pegBroken)
    setPegCheckEnabled(lucraState.pegCheckEnabled)
    setCollateralRequirement(lucraState.collateralRequirement)
  }, [
    connection,
    setMsolVault,
    setLinusVault,
    setStakeTreasury,
    setMataSupply,
    setLucraSupply,
    setStakedLucraSupply,
    setPegBroken,
    setCollateralRequirement,
    configs,
  ])

  useEffect(() => {
    !bondSystemBalances && fetchBondSystemBalances()
    !msolVault && fetchProtoStats()
    return () => {}
  }, [bondSystemBalances, fetchBondSystemBalances, fetchProtoStats, msolVault])

  if (bondSystemBalances && oraclePrices && msolVault) {
    const mataSolBaseLiquidityTotal =
      bondSystemBalances.SOL_MATA_RAYDIUM.lp.base.uiAmount
    const mataSolQuoteLiquidityTotal =
      bondSystemBalances.SOL_MATA_RAYDIUM.lp.quote.uiAmount

    const collateralPotential = mataSolQuoteLiquidityTotal
      ? new Decimal(mataSolQuoteLiquidityTotal).mul(
          new Decimal(collateralRequirement / 100)
        )
      : 'unknown'

    const stakedLucraPerc =
      stakedLucraSupply && lucraSupply
        ? Math.round((stakedLucraSupply / lucraSupply) * 1000000) / 10000
        : 'unknown'

    return (
      <>
        <div className={'flex-row-transparent'}>
          <div style={{ width: '50%' }}>
            <div
              className={'flex-row-transparent'}
              style={{ marginBottom: '0px' }}
            >
              <div className={'text-header-white'}>Protocol Stats</div>
            </div>

            <div
              className={'flex-row-transparent'}
              style={{ marginLeft: '50px', marginTop: '10px' }}
            >
              <div style={{ minWidth: '400px' }}>
                <div className="lock-duration-container-label">Vaults</div>
                <div className="monitoring-reward-box">
                  <div style={{ display: 'flex' }}>
                    <div className="monitoring-reward-label">mSOL Vault:</div>
                    <div className="monitoring-reward-value">{msolVault}</div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div className="monitoring-reward-label">
                      Linus Blanket:
                    </div>
                    <div className="monitoring-reward-value">{linusVault}</div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div className="monitoring-reward-label">
                      Stake Treasury:
                    </div>
                    <div className="monitoring-reward-value">
                      {stakeTreasury}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ width: '50%' }}>
            <div
              className={'flex-row-transparent'}
              style={{ marginBottom: '0px' }}
            >
              <div className={'text-header-white'}>Token Stats</div>
            </div>

            <div
              className={'flex-row-transparent'}
              style={{ marginLeft: '50px', marginTop: '10px' }}
            >
              <div style={{ minWidth: '400px' }}>
                <div className="lock-duration-container-label">MATA</div>
                <div className="monitoring-reward-box">
                  <div style={{ display: 'flex' }}>
                    <div className="monitoring-reward-label">Supply:</div>
                    <div className="monitoring-reward-value">{mataSupply}</div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div className="monitoring-reward-label">Liquidity:</div>
                    <div className="monitoring-reward-value">
                      {mataSolBaseLiquidityTotal} / {mataSolQuoteLiquidityTotal}
                    </div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div className="monitoring-reward-label">
                      Collateral Potential:
                    </div>
                    <div className="monitoring-reward-value">
                      {collateralPotential.toString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div className="monitoring-reward-label">Peg Status:</div>
                    <div className="monitoring-reward-value">
                      {pegBroken ? 'BROKEN' : 'OK'}
                    </div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div className="monitoring-reward-label">
                      Peg Monitoring:
                    </div>
                    <div className="monitoring-reward-value">
                      {pegCheckEnabled ? 'ENABLED' : 'DISABLED'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={'flex-row-transparent'}
              style={{ marginLeft: '50px', marginTop: '10px' }}
            >
              <div style={{ minWidth: '400px' }}>
                <div className="lock-duration-container-label">LUCRA</div>
                <div className="monitoring-reward-box">
                  <div style={{ display: 'flex' }}>
                    <div className="monitoring-reward-label">Supply:</div>
                    <div className="monitoring-reward-value">{lucraSupply}</div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div className="monitoring-reward-label">Staked:</div>
                    <div className="monitoring-reward-value">
                      {stakedLucraSupply}
                    </div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div className="monitoring-reward-label">% Staked:</div>
                    <div className="monitoring-reward-value">
                      {stakedLucraPerc}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={'flex-row-transparent'}>
          <div style={{ width: '50%' }}>
            <div
              className={'flex-row-transparent'}
              style={{ marginBottom: '0px' }}
            >
              <div className={'text-header-white'}>Bond Systems</div>
            </div>
            {Object.keys(bondSystemBalances).map((k) => {
              const bal = bondSystemBalances[k as SystemNames]
              const ownershipPerc =
                bal.lp.lpMintSupply.uiAmount && bal.vault.uiAmount
                  ? Math.round(
                      (bal.vault.uiAmount / bal.lp.lpMintSupply.uiAmount) * 100
                    )
                  : 'unknown'
              return (
                <div
                  key={k}
                  className={'flex-row-transparent'}
                  style={{ marginLeft: '50px', marginTop: '10px' }}
                >
                  <div style={{ minWidth: '400px' }}>
                    <div className="lock-duration-container-label">{k}</div>
                    <div className="monitoring-reward-box">
                      <div style={{ display: 'flex' }}>
                        <div className="monitoring-reward-label">
                          Treasury (Lucra) Bal:
                        </div>
                        <div className="monitoring-reward-value">
                          {bal.treasury.uiAmountString}
                        </div>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <div className="monitoring-reward-label">LP BASE:</div>
                        <div className="monitoring-reward-value">
                          {bal.lp.base.uiAmountString}
                        </div>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <div className="monitoring-reward-label">LP QUOTE:</div>
                        <div className="monitoring-reward-value">
                          {bal.lp.quote.uiAmountString}
                        </div>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <div className="monitoring-reward-label">PRICE:</div>
                        <div className="monitoring-reward-value">
                          {bal.lp.quote.uiAmount && bal.lp.base.uiAmount
                            ? bal.lp.quote.uiAmount / bal.lp.base.uiAmount
                            : 'unknown'}
                        </div>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <div className="monitoring-reward-label">
                          LP Token Bal:
                        </div>
                        <div className="monitoring-reward-value">
                          {bal.vault.uiAmountString}
                        </div>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <div className="monitoring-reward-label">
                          LP Token Supply:
                        </div>
                        <div className="monitoring-reward-value">
                          {bal.lp.lpMintSupply.uiAmountString}
                        </div>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <div className="monitoring-reward-label">
                          % of ownership:
                        </div>
                        <div className="monitoring-reward-value">
                          {ownershipPerc}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div>
            <div
              className={'flex-row-transparent'}
              style={{ marginBottom: '0px' }}
            >
              <div className={'text-header-white'}>Oracles</div>
            </div>
            {Object.keys(oraclePrices).map((k) => {
              const oracle = oraclePrices[k as LucraOracles]
              if (oracle) {
                const expo = new Decimal(oracle.expo.toString())
                const ten = new Decimal(10)
                const price = new Decimal(oracle.aggPrice.toString()).div(
                  ten.pow(expo)
                )
                const slotDiff =
                  oracle.slotDiff < 8 ? BigInt(8) : oracle.slotDiff
                return (
                  <div
                    key={k}
                    className={'flex-row-transparent'}
                    style={{ marginLeft: '50px', marginTop: '10px' }}
                  >
                    <div style={{ minWidth: '400px' }}>
                      <div className="lock-duration-container-label">{k}</div>
                      <div className="monitoring-reward-box">
                        <div style={{ display: 'flex' }}>
                          <div className="monitoring-reward-label">
                            Aggregate Price:
                          </div>
                          <div className="monitoring-reward-value">
                            {price.toString()}
                          </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                          <div className="monitoring-reward-label">Health:</div>
                          <div className="monitoring-reward-value">
                            {oracle.validPrices.toString()} in{' '}
                            {slotDiff.toString()}
                          </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                          <div className="monitoring-reward-label">Valid:</div>
                          <div className="monitoring-reward-value">
                            {oracle.valid ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              } else {
                return <></>
              }
            })}
          </div>
        </div>
      </>
    )
  } else {
    return (
      <CircularProgress
        style={{
          top: '20%',
          position: 'relative',
          color: 'white',
        }}
      />
    )
  }
}
