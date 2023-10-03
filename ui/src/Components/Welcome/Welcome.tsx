import { FC } from 'react'
import { useSelector } from 'react-redux'
import { getUiMode } from '../../redux/modules/app'
import { Goldbox } from '../Goldbox/Goldbox'
import { Wallet } from '../Wallet/Wallet'

export const Welcome: FC = () => {
  const uiMode = useSelector(getUiMode)

  if (uiMode === 'desktop') {
    return (
      <>
        <p>&nbsp;</p>
        <Goldbox classes={['box-centered']} style={{ width: '60%' }}>
          <div
            className={'text-header-white'}
            style={{ padding: '20px', lineHeight: '40px' }}
          >
            <p style={{ textAlign: 'center' }}>— Lucra —</p>
            <p style={{ textAlign: 'center' }}>
              A DeFi(ance) Protocol built on the Solana blockchain
            </p>
            <p>
              <strong>Features</strong>
            </p>
            <ul>
              <li>
                <p>Cast stable coins with SOL at 0% interest</p>
              </li>
              <li>
                <p>No risk of sudden liquidation</p>
              </li>
              <li>
                <p>Return stables to unseal SOL</p>
              </li>
            </ul>
            <div className="Nav-cell-center">
              <Wallet buttonText="Connect Wallet & Profit" />
            </div>
          </div>
        </Goldbox>
      </>
    )
  } else {
    return (
      <>
        <p>&nbsp;</p>
        <Goldbox classes={['box-centered']} style={{ width: '90%' }}>
          <div
            className={'text-header-white'}
            style={{ padding: '20px', lineHeight: '40px' }}
          >
            <p style={{ textAlign: 'center' }}>— Lucra —</p>
            <p style={{ textAlign: 'center' }}>A Solana DeFi(ance) Protocol</p>
            <p>
              <strong>Features</strong>
            </p>
            <ul>
              <li>
                <p>Cast stable coins with SOL at 0% interest</p>
              </li>
              <li>
                <p>No risk of sudden liquidation</p>
              </li>
              <li>
                <p>Return stables to unseal SOL</p>
              </li>
            </ul>
            <div className="Nav-cell-center">
              <Wallet buttonText="Connect & Profit" />
            </div>
          </div>
        </Goldbox>
      </>
    )
  }
}
