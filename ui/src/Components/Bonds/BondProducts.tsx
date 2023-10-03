import { Bond } from '@lucra/sdk'
import { CircularProgress } from '@mui/material'
import { useConnection } from '@solana/wallet-adapter-react'
import { FC, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getConfigs } from '../../redux/modules/app'
import { getBondSystems, setBondSystemsList } from '../../redux/modules/bonds'
import { BondSystem } from './BondSystem'

export const BondProducts: FC = () => {
  const { connection } = useConnection()
  const bondSystems = useSelector(getBondSystems)
  const dispatch = useDispatch()
  const configs = useSelector(getConfigs)

  const fetchBondSystems = useCallback(async (): Promise<void> => {
    const bondProgram = new Bond(connection, configs.bonds, configs.bondSystems)
    const systems = await bondProgram.getBondSystemAccounts()
    dispatch(setBondSystemsList(systems))
  }, [connection, dispatch, configs])

  useEffect(() => {
    !bondSystems && fetchBondSystems()
    return () => {}
  }, [bondSystems, fetchBondSystems])

  if (!bondSystems) {
    return (
      <div className={'text-center'}>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <CircularProgress
          style={{
            color: 'white',
            position: 'absolute',
            top: '40%',
            left: '45%',
          }}
        />
      </div>
    )
  } else {
    return (
      <>
        {bondSystems.map((bondSystem) => {
          const name = bondSystem.name + '-' + bondSystem.provider
          return (
            <BondSystem
              key={bondSystem.account.toString()}
              name={name}
              system={bondSystem}
            />
          )
        })}
      </>
    )
  }
}
