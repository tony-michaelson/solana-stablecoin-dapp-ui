import './Wallet.css'
import { FC } from 'react'
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'
import { getUiMode } from '../../redux/modules/app'
import { useSelector } from 'react-redux'
import { useWallet } from '@solana/wallet-adapter-react'

export interface WalletProps {
  buttonText?: string
}

export const Wallet: FC<WalletProps> = (props) => {
  const uiMode = useSelector(getUiMode)
  const { publicKey } = useWallet()

  return uiMode === 'desktop' ? (
    <WalletModalProvider>
      {props.buttonText ? (
        <WalletMultiButton className="Connect-wallet-button">
          {props.buttonText}
        </WalletMultiButton>
      ) : (
        <WalletMultiButton className="Connect-wallet-button" />
      )}
    </WalletModalProvider>
  ) : (
    <WalletModalProvider>
      <WalletMultiButton className="Connect-wallet-button">
        {publicKey ? <></> : <>{props.buttonText}</>}
      </WalletMultiButton>
    </WalletModalProvider>
  )
}
