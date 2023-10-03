import { Grid } from '@mui/material'
import { FC } from 'react'
import { useSelector } from 'react-redux'
import { getUiMode } from '../../redux/modules/app'
import { getBondSystems } from '../../redux/modules/bonds'
import { Goldbox } from '../Goldbox/Goldbox'
import { BondList } from './BondList'
import { BondProducts } from './BondProducts'
import { BuyBondModal } from './BuyBondModal'

export const Bonds: FC = () => {
  const bondSystems = useSelector(getBondSystems)
  const uiMode = useSelector(getUiMode)

  if (uiMode === 'desktop') {
    return (
      <>
        <p>&nbsp;</p>
        <BuyBondModal>
          <div
            className="box-centered"
            style={{ width: '80%', maxWidth: '1200px' }}
          >
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
                      Bond Products
                    </div>
                    <div
                      className={'flex-column text-description'}
                      style={{
                        flexGrow: 0,
                        textAlign: 'left',
                        paddingTop: '16px',
                      }}
                    >
                      Acquire discounted LUCRA with liquidity tokens
                    </div>
                  </div>
                  <BondProducts />
                </Grid>
              </Grid>
            </Goldbox>
            {bondSystems && <BondList bondSystems={bondSystems} />}
          </div>
        </BuyBondModal>
      </>
    )
  } else {
    return (
      <>
        <br />
        <BuyBondModal>
          <>
            <Goldbox classes={['box-centered']} style={{ width: '90%' }}>
              <div className={'innerbox'}>
                <div className={'flex-row-transparent'}>
                  <div className={' text-header-white'} style={{ flexGrow: 0 }}>
                    Bond Products
                  </div>
                </div>
                <BondProducts />
              </div>
              <div className={'innerbox'}>
                {bondSystems && <BondList bondSystems={bondSystems} />}
              </div>
            </Goldbox>
          </>
        </BuyBondModal>
      </>
    )
  }
}
