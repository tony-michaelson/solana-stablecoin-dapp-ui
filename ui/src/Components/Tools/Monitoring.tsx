import { Grid } from '@mui/material'
import { FC } from 'react'
import { Goldbox } from '../Goldbox/Goldbox'
import './Monitoring.css'
import { MonitoringStats } from './MonitoringStats'

export const Monitoring: FC = () => {
  return (
    <>
      <p>&nbsp;</p>
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
              <MonitoringStats />
            </Grid>
          </Grid>
        </Goldbox>
      </div>
    </>
  )
}
