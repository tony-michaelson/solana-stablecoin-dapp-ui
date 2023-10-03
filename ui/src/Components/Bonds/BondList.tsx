import { Bond, BondSystemAccount } from '@lucra/sdk'
import { CircularProgress, Grid } from '@mui/material'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { FC, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WatchState } from '../../utils/WatchState'
import isEqual from 'lodash.isequal'
import { bondTimeRemaining, createBondSystemPairs } from '../../utils/helpers'
import {
  getBonds,
  getRefreshBonds,
  setBondsList,
  setRefreshBondsList,
} from '../../redux/modules/bonds'
import { BondSystemPair } from '../../types'
import { BondListItem } from './BondListItem'
import { Goldbox } from '../Goldbox/Goldbox'
import { getConfigs, getUiMode } from '../../redux/modules/app'

export interface BondListProps {
  bondSystems: BondSystemAccount[]
}

export const BondList: FC<BondListProps> = (props) => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const dispatch = useDispatch()
  const configs = useSelector(getConfigs)
  const bonds = useSelector(getBonds)
  const bondsList = bonds.bonds
  const refreshingBonds = useSelector(getRefreshBonds)
  const uiMode = useSelector(getUiMode)

  if (publicKey && !bonds.walletKey?.equals(publicKey)) {
    dispatch(setBondsList(null, publicKey))
  }

  const fetchBonds = useCallback(async (): Promise<boolean> => {
    if (publicKey) {
      const bondProgram = new Bond(
        connection,
        configs.bonds,
        configs.bondSystems
      )
      const owner = publicKey
      const currentBonds = await bondProgram.getBonds(publicKey)

      const compareLeft = bondsList
        ? bondsList.map((e) => [e.account, e.exercised])
        : []
      const compareRight = currentBonds?.map((e) => [e.account, e.exercised])
      if (bondsList === null || !isEqual(compareLeft, compareRight)) {
        dispatch(setBondsList(currentBonds, owner))
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }, [publicKey, connection, bondsList, dispatch, configs])

  useEffect(() => {
    bondsList === null && fetchBonds()
    return () => {}
  }, [bondsList, fetchBonds])

  WatchState({
    isActive: refreshingBonds,
    setNonActive: () => dispatch(setRefreshBondsList(false)),
    stateChanged: fetchBonds,
    interval: 5000,
    maxTries: 5,
  })

  if (refreshingBonds) {
    return (
      <div className={'text-center'}>
        <p>&nbsp;</p>
        <CircularProgress
          style={{
            color: 'white',
            top: '40%',
            left: '45%',
          }}
        />
      </div>
    )
  } else if (bondsList?.length) {
    let bonds: BondSystemPair[] = createBondSystemPairs(
      bondsList,
      props.bondSystems
    )
    if (uiMode === 'desktop') {
      return (
        <>
          <p>&nbsp;</p>
          <Goldbox
            classes={['box-centered']}
            style={{ width: '100%', minWidth: '700px', minHeight: '150px' }}
          >
            <Grid container spacing={0}>
              <Grid
                item
                xs={12}
                className={'innerbox'}
                style={{ minHeight: '150px' }}
              >
                <div className={'flex-row-transparent'}>
                  <div
                    className={'flex-column text-header-white'}
                    style={{ flexGrow: 0 }}
                  >
                    Bonds Purchased
                  </div>
                </div>

                <div>
                  {bonds
                    .sort((a, b) => {
                      const aLR = bondTimeRemaining(a.bond, a.system)
                      const bLR = bondTimeRemaining(b.bond, b.system)
                      return aLR > bLR ? 1 : -1
                    })
                    .map((e) => {
                      return (
                        <BondListItem
                          key={e.bond.account.toString()}
                          bond={e.bond}
                          system={e.system}
                        />
                      )
                    })}
                </div>
              </Grid>
            </Grid>
          </Goldbox>
        </>
      )
    } else {
      return (
        <>
          <div className={'flex-row-transparent'}>
            <div
              className={'flex-column text-header-white'}
              style={{ flexGrow: 0 }}
            >
              Bonds Purchased
            </div>
          </div>

          <div>
            {bonds
              .sort((a, b) => {
                const aLR = bondTimeRemaining(a.bond, a.system)
                const bLR = bondTimeRemaining(b.bond, b.system)
                return aLR > bLR ? 1 : -1
              })
              .map((e) => {
                return (
                  <BondListItem
                    key={e.bond.account.toString()}
                    bond={e.bond}
                    system={e.system}
                  />
                )
              })}
          </div>
        </>
      )
    }
  } else {
    return <></>
  }
}
