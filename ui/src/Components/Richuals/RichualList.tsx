import { LoanAccount } from '@lucra/sdk'
import { CircularProgress } from '@mui/material'
import { FC } from 'react'
import { useSelector } from 'react-redux'
import { getLoans } from '../../redux/modules/loans'
import { ExplainRichual } from './ExplainRichual'
import { RichualListItem } from './RichualListItem'

export const RichualList: FC = () => {
  const loans = useSelector(getLoans)

  if (loans.scan) {
    return (
      <div className={'text-center'}>
        <CircularProgress
          style={{
            color: 'white',
            position: 'absolute',
            top: '40%',
            left: '45%',
          }}
        />
      </div>
    )
  } else if (loans.list?.length) {
    let loansUnsorted: LoanAccount[] = Object.assign([], loans.list)
    let loansSorted: LoanAccount[] = loansUnsorted.sort((a, b) => {
      if (a.creationDate > b.creationDate) {
        return -1
      } else if (a.creationDate < b.creationDate) {
        return 1
      } else {
        return 0
      }
    })
    return (
      <>
        {loansSorted.map((row) => (
          <RichualListItem key={row.account.toString()} loan={row} />
        ))}
      </>
    )
  } else if (loans.list == null) {
    return <ExplainRichual />
  } else {
    return (
      <div className={'text-center'}>
        <CircularProgress
          style={{
            color: 'white',
            position: 'absolute',
            top: '40%',
            left: '45%',
          }}
        />
      </div>
    )
  }
}
