import './NavBar.css'
import { FC } from 'react'
import Toolbar from '@mui/material/Toolbar'
import { AppBar, Box, Grid, Divider } from '@mui/material'
import { Wallet } from '../Wallet/Wallet'
import { Link } from 'react-router-dom'
import { getUiMode } from '../../redux/modules/app'
import { useSelector } from 'react-redux'
import { useWallet } from '@solana/wallet-adapter-react'

export const NavBar: FC = () => {
  const uiMode = useSelector(getUiMode)
  const { publicKey } = useWallet()

  if (publicKey) {
    if (uiMode === 'desktop') {
      return (
        <div style={{ position: 'relative', zIndex: 9999 }}>
          <AppBar position="static" className="Nav-bar">
            <Toolbar variant="regular">
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={3} className="Nav-cell-center">
                    <img
                      alt="Lucra"
                      src="/lucra-white-logo.png"
                      height="40px"
                      className="Nav-logo"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Grid container spacing={2}>
                      <Grid item xs={3} className="Nav-cell-center">
                        <Link to="/" className="Nav-link Nav-cell-middle">
                          RICHUALS
                        </Link>
                      </Grid>
                      <Grid item xs={3} className="Nav-cell-center">
                        <Link
                          to="/staking"
                          className="Nav-link Nav-cell-middle"
                        >
                          STAKING
                        </Link>
                      </Grid>
                      <Grid item xs={3} className="Nav-cell-center">
                        <Link to="/bonds" className="Nav-link Nav-cell-middle">
                          BONDS
                        </Link>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={3} className="Nav-cell-center">
                    <div style={{ textAlign: 'right' }}>
                      <Wallet />
                    </div>
                  </Grid>
                </Grid>
              </Box>
            </Toolbar>
          </AppBar>
          <Divider
            orientation="horizontal"
            flexItem
            className={'Nav-divider'}
          />
        </div>
      )
    } else {
      return (
        <div style={{ position: 'relative', zIndex: 9999 }}>
          <AppBar position="static" className="Nav-bar">
            <Toolbar variant="dense">
              <Grid container spacing={0}>
                <Grid item xs={2}>
                  <img
                    alt="Lucra"
                    src="/lucra-glyph-transparent-white-L.png"
                    height="40px"
                    className="Nav-logo"
                  />
                </Grid>
                <Grid item xs={3} className="Nav-cell-center">
                  <Link to="/" className="Nav-link Nav-cell-middle">
                    RICHUALS
                  </Link>
                </Grid>
                <Grid item xs={3} className="Nav-cell-center">
                  <Link to="/staking" className="Nav-link Nav-cell-middle">
                    STAKING
                  </Link>
                </Grid>
                <Grid item xs={3} className="Nav-cell-center">
                  <Link to="/bonds" className="Nav-link Nav-cell-middle">
                    BONDS
                  </Link>
                </Grid>
                <Grid item xs={1} className="Nav-cell-center">
                  <div style={{ textAlign: 'right' }}>
                    <Wallet />
                  </div>
                </Grid>
              </Grid>
            </Toolbar>
          </AppBar>
          <Divider
            orientation="horizontal"
            flexItem
            className={'Nav-divider'}
          />
        </div>
      )
    }
  } else {
    return (
      <div style={{ position: 'relative', zIndex: 9999 }}>
        <AppBar position="static" className="Nav-bar">
          <Toolbar variant="regular">
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={3} className="Nav-cell-center">
                  <img
                    alt="Lucra"
                    src="/lucra-glyph-transparent-white-L.png"
                    height="40px"
                    className="Nav-logo"
                  />
                </Grid>
                <Grid item xs={4} className="Nav-cell-center" />
                <Grid item xs={5} className="Nav-cell-center">
                  <div style={{ textAlign: 'right' }}>
                    <Wallet
                      buttonText={
                        uiMode === 'mobile' ? 'Connect' : 'Select Wallet'
                      }
                    />
                  </div>
                </Grid>
              </Grid>
            </Box>
          </Toolbar>
        </AppBar>
        <Divider orientation="horizontal" flexItem className={'Nav-divider'} />
      </div>
    )
  }
}
