import { FC, useCallback, useState } from 'react'
import './LockDuration.css'
import { LockupDuration } from '../../types'
import { STAKING_TIMEFRAME } from '../../utils/constants'

export interface LockDurationProps {
  onClick?: (option: LockupDuration) => void
}

export const LockDuration: FC<LockDurationProps> = (props) => {
  const [lockDuration, setLockDuration] = useState(0)
  const onClickHandler = useCallback(
    (option: LockupDuration) => {
      props.onClick && props.onClick(option)
      setLockDuration(option)
    },
    [setLockDuration, props]
  )

  return (
    <>
      <div className="lock-duration-container-label">Lock Duration</div>
      <div className="lock-duration-container">
        <div
          onClick={() => {
            onClickHandler(0)
          }}
          className={
            lockDuration === 0
              ? 'lock-duration-col-selected'
              : 'lock-duration-col'
          }
        >
          {lockDuration === 0 && (
            <>
              <img
                className="lock-duration-selected-corner-top-right"
                alt=""
                src="/lock-duration-corner-top-right.svg"
              />
              <img
                className="lock-duration-selected-corner-top-left"
                alt=""
                src="/lock-duration-corner-top-left.svg"
              />
              <img
                className="lock-duration-selected-corner-bottom-left"
                alt=""
                src="/lock-duration-corner-bottom-left.svg"
              />
              <img
                className="lock-duration-selected-corner-bottom-right"
                alt=""
                src="/lock-duration-corner-bottom-right.svg"
              />
            </>
          )}
          <div className="lock-duration-option-label">1 Week</div>
          <div className="lock-duration-option-description">
            {STAKING_TIMEFRAME[0].weight}x Rewards
          </div>
        </div>
        <div
          onClick={() => {
            onClickHandler(1)
          }}
          className={
            lockDuration === 1
              ? 'lock-duration-col-selected'
              : 'lock-duration-col'
          }
        >
          {lockDuration === 1 && (
            <>
              <img
                className="lock-duration-selected-corner-top-right"
                alt=""
                src="/lock-duration-corner-top-right.svg"
              />
              <img
                className="lock-duration-selected-corner-top-left"
                alt=""
                src="/lock-duration-corner-top-left.svg"
              />
              <img
                className="lock-duration-selected-corner-bottom-left"
                alt=""
                src="/lock-duration-corner-bottom-left.svg"
              />
              <img
                className="lock-duration-selected-corner-bottom-right"
                alt=""
                src="/lock-duration-corner-bottom-right.svg"
              />
            </>
          )}
          <div className="lock-duration-option-label">1 Year</div>
          <div className="lock-duration-option-description">
            {STAKING_TIMEFRAME[1].weight}x Rewards
          </div>
        </div>
        <div
          onClick={() => {
            onClickHandler(2)
          }}
          className={
            lockDuration === 2
              ? 'lock-duration-col-selected'
              : 'lock-duration-col'
          }
        >
          <img
            className="lock-duration-highest-return"
            alt=""
            src="/highest-return-lock-duration.svg"
          />
          {lockDuration === 2 && (
            <>
              <img
                className="lock-duration-selected-corner-top-right"
                alt=""
                src="/lock-duration-corner-top-right.svg"
              />
              <img
                className="lock-duration-selected-corner-top-left"
                alt=""
                src="/lock-duration-corner-top-left.svg"
              />
              <img
                className="lock-duration-selected-corner-bottom-left"
                alt=""
                src="/lock-duration-corner-bottom-left.svg"
              />
              <img
                className="lock-duration-selected-corner-bottom-right"
                alt=""
                src="/lock-duration-corner-bottom-right.svg"
              />
            </>
          )}
          <div className="lock-duration-highest-return-label">
            Highest Return
          </div>
          <div className="lock-duration-option-label">2 Years</div>
          <div className="lock-duration-option-description">
            {STAKING_TIMEFRAME[2].weight}x Rewards
          </div>
        </div>
      </div>
    </>
  )
}
