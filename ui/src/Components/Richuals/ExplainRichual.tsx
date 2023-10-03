import { FC } from 'react'

export const ExplainRichual: FC = () => {
  return (
    <div>
      <div className={'text-header-white box-padded-medium'}>
        Rich•u•al — an instant loan with no liquidations.
      </div>
      <div className={'text-white box-padded-medium'}>
        By offering Solana as collateral, you will receive 33% of the USD value
        of your SOL in Materia. Materia is a USD pegged stablecoin.
        <br />
        <br />
        You can unlock your SOL after 7 days by returning the Materia casted in
        your Richuals.
        <br />
        <br />
        Staked Lucra can be used to get more MATA in a Richual and will be
        locked until the MATA is returned.
      </div>
    </div>
  )
}
