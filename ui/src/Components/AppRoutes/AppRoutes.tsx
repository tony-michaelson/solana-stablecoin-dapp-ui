import { useWallet } from '@solana/wallet-adapter-react'
import { FC } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Admin } from '../Tools/Admin'
import { Monitoring } from '../Tools/Monitoring'
import { Bonds } from '../Bonds/Bonds'
import { NewRichual } from '../Richuals/NewRichual'
import { Richuals } from '../Richuals/Richuals'
import { Staking } from '../Staking/Staking'
import { Transmute } from '../Transmute/Transmute'
import './AppRoutes.css'
import { Welcome } from '../Welcome/Welcome'

export const AppRoutes: FC = () => {
  const { publicKey } = useWallet()

  return publicKey ? (
    <Routes>
      <Route path="/" element={<Richuals />} />
      <Route path="newrichual" element={<NewRichual />} />
      <Route path="staking" element={<Staking />} />
      <Route path="transmute" element={<Transmute />} />
      <Route path="bonds" element={<Bonds />} />
      <Route path="admin" element={<Admin />} />
      <Route path="monitoring" element={<Monitoring />} />
    </Routes>
  ) : (
    <Welcome />
  )
}
