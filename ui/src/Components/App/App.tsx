import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { SnackbarProvider } from 'notistack'
import { FC, useEffect, useMemo } from 'react'
import { NavBar } from '../NavBar/NavBar'
import { useDispatch } from 'react-redux'
import { getUiMode, setScreen } from '../../redux/modules/app'
import { AppRoutes } from '../AppRoutes/AppRoutes'
import { theme } from '../../styles'
import { ThemeProvider } from '@emotion/react'
import { OraclePrices } from '../GlobalState/OraclePrices'
import { ProgramStakingState } from '../GlobalState/ProgramStakingState'
import { UserStakeAccountState } from '../GlobalState/UserStakeAccountState'
import { LastReward } from '../GlobalState/LastReward'
import { MIN_DESKTOP_SCREEN_WIDTH } from '../../utils/constants'
import { useSelector } from 'react-redux'

require('./App.css')
require('@solana/wallet-adapter-react-ui/styles.css')

const App: FC = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const handler = () => {
      const uiMode =
        window.innerWidth >= MIN_DESKTOP_SCREEN_WIDTH ? 'desktop' : 'mobile'
      console.log('uiMode', uiMode)
      dispatch(
        setScreen(
          {
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
          },
          uiMode
        )
      )
    }

    // Set size at the first client-side load
    handler()

    window.addEventListener('resize', handler)

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('resize', handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded.
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  )

  const uiMode = useSelector(getUiMode)

  return (
    <section id={uiMode}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={5}>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <UserStakeAccountState />
                <ProgramStakingState />
                <LastReward />
                <NavBar />
                <AppRoutes />
                <OraclePrices />
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </section>
  )
}
export default App
