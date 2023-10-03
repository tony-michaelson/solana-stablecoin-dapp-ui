import { FC } from 'react'
import { useSelector } from 'react-redux'
import { getUiMode } from '../../redux/modules/app'
import { Goldbox } from '../Goldbox/Goldbox'
import { AddStakeModal } from './AddStakeModal'
import { ExplainStaking } from './ExplainStaking'
import { NewStakeBalance } from './NewStakeBalance'
import { StakeBalanceList } from './StakeBalanceList'
import { UnstakeModal } from './UnstakeModal'

export const Staking: FC = () => {
  const uiMode = useSelector(getUiMode)

  if (uiMode === 'desktop') {
    return (
      <>
        <UnstakeModal>
          <AddStakeModal>
            <p>&nbsp;</p>
            <div
              className="box-centered"
              style={{ width: '80%', maxWidth: '1200px' }}
            >
              <div className="flex-container">
                <div className="flex-column flex-align-start">
                  <Goldbox style={{ minHeight: '0px' }}>
                    <NewStakeBalance />
                  </Goldbox>
                </div>
                <div className="flex-column flex-align-start">
                  <div className="box-explanation">
                    <ExplainStaking />
                  </div>
                </div>
              </div>
              <StakeBalanceList />
            </div>
          </AddStakeModal>
        </UnstakeModal>
      </>
    )
  } else {
    return (
      <>
        <UnstakeModal>
          <AddStakeModal>
            <br />

            <Goldbox classes={['box-centered']} style={{ width: '90%' }}>
              <NewStakeBalance />
              <div className={'innerbox'}>
                <StakeBalanceList />
              </div>
            </Goldbox>
          </AddStakeModal>
        </UnstakeModal>
      </>
    )
  }
}
