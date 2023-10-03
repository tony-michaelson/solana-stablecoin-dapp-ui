import { combineReducers } from '@reduxjs/toolkit'
import { appReducer } from './modules/app'
import { bondsReducer } from './modules/bonds'
import { loansReducer } from './modules/loans'
import { stakingReducer } from './modules/staking'

export const rootReducer = combineReducers({
  app: appReducer,
  loans: loansReducer,
  bonds: bondsReducer,
  staking: stakingReducer,
})

export type RootState = ReturnType<typeof rootReducer>
