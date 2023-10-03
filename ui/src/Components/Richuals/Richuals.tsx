import { Lucra } from '@lucra/sdk'
import { LoanAccount } from '@lucra/sdk/state/loan'
import { Grid } from '@mui/material'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { FC, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  checkTimeout,
  getLoans,
  setLoansList,
  setNotifier,
  setScanForNewLoans,
  setScanTimer,
} from '../../redux/modules/loans'
import { useNotify } from '../../utils/notify'
import { Goldbox } from '../Goldbox/Goldbox'
import { RichualList } from './RichualList'
import { getConfigs, getUiMode } from '../../redux/modules/app'
import { RichualStats } from './RichualStats'

export const Richuals: FC = () => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const uiMode = useSelector(getUiMode)
  const dispatch = useDispatch()
  const configs = useSelector(getConfigs)
  const loans = useSelector(getLoans)
  const notify = useNotify()
  const componentIsMounted = useRef(true)
  const lucra = new Lucra(connection, configs.lucra)

  if (!loans.notify) {
    dispatch(setNotifier(notify))
  }

  if (publicKey && !loans.walletKey?.equals(publicKey)) {
    dispatch(setLoansList([], publicKey))
  }

  useEffect(() => {
    componentIsMounted.current = true
    return () => {
      console.log('set timer null')
      dispatch(setScanTimer(null, null))
      componentIsMounted.current = false
    }
  }, [dispatch])

  useEffect(() => {
    async function getAccounts() {
      if (publicKey) {
        if (componentIsMounted.current) {
          console.log('Getting Loan List')
          const loanList = await lucra.getUnpaidLoanAccounts(publicKey)
          console.log('Found:', loanList.length, 'Loans')
          if (loanList.length) {
            dispatch(setLoansList(loanList, publicKey))
          } else {
            dispatch(setLoansList(null, publicKey))
          }
        }
      } else {
        notify('warning', 'Wallet Not Connected')
      }
    }

    // GET LOAN LIST
    if (publicKey && loans.list?.length === 0) {
      console.log('No Loans, getAccounts()')
      getAccounts()
    }
  })

  useEffect(() => {
    async function checkAccountsTotal(loansList: LoanAccount[] | null) {
      const currentLoanTotal = loansList ? loansList.length : 0
      console.log('currentLoanTotal:', currentLoanTotal)

      if (publicKey) {
        console.log('componentIsMounted.current', componentIsMounted.current)
        if (componentIsMounted.current) {
          console.log('Current')
          dispatch(checkTimeout())
          console.log('Getting Loan List')
          const loanAccounts = await lucra.getUnpaidLoanAccounts(publicKey)
          console.log('Found:', loanAccounts.length, 'Loans')
          if (loanAccounts.length !== currentLoanTotal) {
            if (loanAccounts.length) {
              dispatch(setScanForNewLoans(false))
              dispatch(setLoansList(loanAccounts, publicKey))
            } else {
              dispatch(setLoansList(null, publicKey))
            }
          }
        }
      } else {
        notify('warning', 'Wallet Not Connected')
      }
    }

    // SCAN FOR CHANGES TO ACCOUNTS TOTAL
    if (publicKey && loans.scan && loans.scanTimer === null) {
      console.log('Scanning for loans ...')
      dispatch(
        setScanTimer(
          new Date().getTime(),
          setInterval(() => checkAccountsTotal(loans.list), 5000)
        )
      )
    }
  })

  return uiMode === 'desktop' ? (
    <>
      <p>&nbsp;</p>
      <Goldbox
        classes={['box-centered']}
        style={{ width: '65%', minWidth: '700px' }}
      >
        <Grid container spacing={0}>
          <Grid className={'innerbox'} item xs={4}>
            <RichualStats />
          </Grid>
          <Grid className={'innerbox innerbox-right'} item xs={8}>
            <RichualList />
          </Grid>
        </Grid>
      </Goldbox>
    </>
  ) : (
    <>
      <br />
      <Goldbox classes={['box-centered']} style={{ width: '90%' }}>
        <div className={'innerbox'}>
          <RichualStats />
        </div>
        <div className={'innerbox'}>
          <RichualList />
        </div>
      </Goldbox>
    </>
  )
}
