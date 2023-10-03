import { LoanAccount } from '@lucra/sdk'
import { Button } from '@mui/material'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { FC } from 'react'
import { Link } from 'react-router-dom'
import { MATA_PORTS } from '../../utils/constants'
import { MataBoostRemaining } from './MataBoostRemaining'

export interface RichualStatsProps {
  loanList?: LoanAccount[]
}

export const RichualStats: FC<RichualStatsProps> = (props) => {
  return (
    <table style={{ height: '400px', width: '100%' }}>
      <tbody>
        <tr>
          <td>
            <div className="label-value-box">
              <div className="text-label-gold ">Total Locked</div>
              <div className="text-stat-value">
                {props.loanList
                  ? props.loanList
                      .map((a: LoanAccount) =>
                        parseFloat(
                          (
                            a.solCollateralAmount / BigInt(LAMPORTS_PER_SOL)
                          ).toString()
                        )
                      )
                      .reduce((a, b) => a + b, 0)
                      .toString()
                  : '0'}{' '}
                SOL
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div className="label-value-box">
              <div className="text-label-gold ">Total Borrowed</div>
              <div className="text-stat-value">
                {props.loanList
                  ? props.loanList
                      .map((a: LoanAccount) =>
                        parseFloat(
                          (a.loanAmount / BigInt(MATA_PORTS)).toString()
                        )
                      )
                      .reduce((a, b) => a + b, 0)
                      .toString()
                  : '0'}{' '}
                MATA
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div className="label-value-box">
              <div className="text-label-gold ">Boost Remaining</div>
              <div className="text-stat-value">
                <MataBoostRemaining />
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div className={'flex-container'}>
              <div className="align-bottom" style={{ width: '80%' }}>
                <Link to={'/newrichual'} className={'button-link'}>
                  {' '}
                  <Button variant={'contained'} style={{ width: '100%' }}>
                    New Richual
                  </Button>
                </Link>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
