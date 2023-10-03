import { FC } from 'react'
import { STAKING_TIMEFRAME } from '../../utils/constants'

export const ExplainStaking: FC = () => {
  return (
    <div>
      <div className={'text-header-white box-padded-medium'}>
        LUCRA Stakers Receive:
      </div>
      <div className={'text-explanation-body box-padded-medium'}>
        <div
          className={'text-explanation-label-white'}
          style={{ paddingBottom: '4px' }}
        >
          mSOL distributions
        </div>
        • All SOL locked in Richuals is staked with{' '}
        <a
          style={{ color: 'white', textDecoration: 'none' }}
          href="https://marinade.finance/"
          rel="noreferrer"
          target="_blank"
        >
          Marinade.finance
        </a>{' '}
        earning approximately 6% APR.
        <br />
        • Half of these earnings go to the Linus Blanket and the rest goes to
        Lucra stakers.
        <br />
        <br />
        <div
          className={'text-explanation-label-white'}
          style={{ paddingBottom: '4px' }}
        >
          Lock Duration Incentives
        </div>
        • 7 Day: {STAKING_TIMEFRAME[0].inflation + '% APR'}
        <br />• 1 Year:{' '}
        {STAKING_TIMEFRAME[1].inflation * STAKING_TIMEFRAME[1].weight +
          '% APR'}{' '}
        + Juice Rewards
        <br />
        <span className="text-attention">
          • 2 Year:{' '}
          {STAKING_TIMEFRAME[2].inflation * STAKING_TIMEFRAME[2].weight +
            '% APR'}{' '}
          + Juice Rewards
        </span>
        <br />
        <br />
        <div
          className={'text-explanation-label-white'}
          style={{ paddingBottom: '4px' }}
        >
          MATA boosts
        </div>
        • Staked Lucra will DOUBLE the MATA casted in a Richual
        <br />• 33% of Lucra value in USD is casted to MATA in your Richuals
      </div>
    </div>
  )
}
