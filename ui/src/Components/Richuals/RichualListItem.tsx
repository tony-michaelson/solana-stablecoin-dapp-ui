import { LoanAccount } from '@lucra/sdk'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { FC } from 'react'
import { useSelector } from 'react-redux'
import { getUiMode } from '../../redux/modules/app'
import { MATA_PORTS } from '../../utils/constants'
import { numberWithCommas } from '../../utils/helpers'
import { ManageFunds } from './ManageFunds'

export interface RichualListItemProps {
  loan: LoanAccount
}

export const RichualListItem: FC<RichualListItemProps> = (props) => {
  const uiMode = useSelector(getUiMode)

  return uiMode === 'desktop' ? (
    <div className="flex-row" key={props.loan.account.toString()}>
      <div className="flex-column">
        <div className={'col-label-gold'}>Collateral</div>
        <div className={'col-text-white'}>
          {(
            parseFloat(props.loan.solCollateralAmount.toString()) /
            LAMPORTS_PER_SOL
          ).toString()}
          {' SOL'}
        </div>
      </div>
      <div className="flex-column">
        <div className={'col-label-gold'}>Casted MATA</div>
        <div className={'col-text-white'}>
          {numberWithCommas(
            Math.round(
              parseFloat(props.loan.loanAmount.toString()) / MATA_PORTS
            )
          )}
        </div>
      </div>

      <div className="flex-column">
        <div className={'col-label-gold'}>Boost Used</div>
        <div className={'col-text-white'}>
          {numberWithCommas(
            Math.round(
              parseFloat(props.loan.stakingCollateralAmount.toString())
            )
          )}
        </div>
      </div>
      <div className="flex-column text-center min-content">
        <ManageFunds loanAccount={props.loan} />
      </div>
    </div>
  ) : (
    <div className="flex-row" key={props.loan.account.toString()}>
      <div style={{ width: '100%' }}>
        <div className="flex-column">
          <div className={'col-label-gold'}>Collateral</div>
          <div className={'col-text-white'}>
            {(
              parseFloat(props.loan.solCollateralAmount.toString()) /
              LAMPORTS_PER_SOL
            ).toString()}
            {' SOL'}
          </div>
        </div>
        <div className="flex-column">
          <div className={'col-label-gold'}>Casted MATA</div>
          <div className={'col-text-white'}>
            {numberWithCommas(
              Math.round(
                parseFloat(props.loan.loanAmount.toString()) / MATA_PORTS
              )
            )}
          </div>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <div className="flex-column">
          <div className={'col-label-gold'}>Boost Used</div>
          <div className={'col-text-white'}>
            {numberWithCommas(
              Math.round(
                parseFloat(props.loan.stakingCollateralAmount.toString())
              )
            )}
          </div>
        </div>
        <div className="flex-column text-center min-content">
          <ManageFunds loanAccount={props.loan} />
        </div>
      </div>
    </div>
  )
}
