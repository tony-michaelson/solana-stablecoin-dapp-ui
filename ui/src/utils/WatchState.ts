import { useEffect, useState } from 'react'

export interface WatchStateParams {
  isActive: boolean
  setNonActive: () => void
  stateChanged: () => Promise<boolean>
  interval: number
  maxTries: number
}

export function WatchState({
  isActive,
  setNonActive,
  stateChanged,
  interval,
  maxTries,
}: WatchStateParams) {
  const [tryCount, setTryCount] = useState(0)

  useEffect(() => {
    async function checkState() {
      if (tryCount >= maxTries) {
        console.log('MAX TRIES REACHED:', tryCount)
        setTryCount(0)
        setNonActive()
      } else if (isActive && (await stateChanged())) {
        console.log('STATE CHANGE DETECTED:', tryCount)
        setTryCount(0)
        setNonActive()
      } else if (isActive) {
        setTryCount(tryCount + 1)
        console.log('NO STATE CHANGE DETECTED:', tryCount)
      } else {
        console.log('NON ACTIVE:', tryCount)
      }
    }

    let id = setInterval(checkState, interval)
    return () => clearInterval(id)
  }, [interval, isActive, tryCount, maxTries, setNonActive, stateChanged])
}
