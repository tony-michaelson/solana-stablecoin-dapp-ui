import { Button, CircularProgress } from '@mui/material'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js'
import { FC, useCallback, useState } from 'react'
import { useNotify } from '../../utils/notify'
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import { Lucra } from '@lucra/sdk'
import {
  createATAInst,
  generateRewardAccountKP,
} from '@lucra/sdk/instructions/common'
import { LUCRA_PORTS } from '../../utils/constants'
import { useDispatch, useSelector } from 'react-redux'
import { setRefreshStakingState } from '../../redux/modules/staking'
import { getConfigs } from '../../redux/modules/app'

export const Admin: FC = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [loading, setLoading] = useState(false)
  const configs = useSelector(getConfigs)
  const notify = useNotify()
  const dispatch = useDispatch()

  const DEVNET_SECRETKEY = Keypair.fromSecretKey(
    new Uint8Array([
      50, 148, 138, 132, 180, 96, 203, 192, 208, 124, 84, 140, 158, 205, 34,
      118, 157, 56, 255, 189, 167, 222, 199, 38, 187, 164, 195, 208, 146, 122,
      41, 77, 227, 5, 27, 212, 10, 32, 81, 222, 72, 15, 110, 30, 53, 254, 209,
      181, 165, 128, 247, 155, 132, 229, 193, 152, 227, 10, 174, 21, 117, 137,
      83, 40,
    ])
  )

  const airdropSolana = useCallback(async () => {
    let signature: TransactionSignature = ''
    try {
      if (!publicKey) {
        throw Error('Wallet Not Connected')
      }
      setLoading(true)
      signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL)
      notify('info', 'Airdrop request sent:', signature)

      await connection.confirmTransaction(signature, 'processed')
      notify('success', 'Transaction successful!', signature)
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      notify('error', `Transaction failed! ${error?.message}`, signature)
      return
    }
  }, [connection, notify, publicKey])

  const airdropLucra = useCallback(async () => {
    let signature: TransactionSignature = ''
    try {
      if (!publicKey) {
        throw Error('Wallet Not Connected')
      }
      setLoading(true)
      const transaction = new Transaction()

      const lucraATAInstruction = await createATAInst(
        connection,
        publicKey,
        configs.lucra.mint.lucra.address
      )
      if (lucraATAInstruction.instructions.length) {
        transaction.add(...lucraATAInstruction.instructions)
      }

      const transfer = createTransferInstruction(
        new PublicKey('CwLbpx6VnFme9U99ihwMhuvHdBzYAeUKW3oHjjoXiHFo'),
        lucraATAInstruction.address,
        DEVNET_SECRETKEY.publicKey,
        1000 * LUCRA_PORTS
      )
      transaction.add(transfer)

      console.log(transaction)

      signature = await sendTransaction(transaction, connection, {
        signers: [DEVNET_SECRETKEY],
      })
      notify('info', 'Transaction sent:', signature)

      await connection.confirmTransaction(signature, 'processed')
      notify('success', 'Transaction successful!', signature)
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      notify('error', `Transaction failed! ${error?.message}`, signature)
      return
    }
  }, [
    DEVNET_SECRETKEY,
    connection,
    notify,
    publicKey,
    sendTransaction,
    configs,
  ])

  const dropStakingReward = useCallback(async () => {
    let signature: TransactionSignature = ''
    try {
      if (!publicKey) {
        throw Error('Wallet Not Connected')
      }
      setLoading(true)
      const transaction = new Transaction()
      const msolAtaAddress = await getAssociatedTokenAddress(
        configs.marinade.msolMint,
        DEVNET_SECRETKEY.publicKey
      )

      const transfer = await createTransferInstruction(
        msolAtaAddress,
        configs.lucra.account.msolVault.address,
        DEVNET_SECRETKEY.publicKey,
        BigInt(LAMPORTS_PER_SOL * 1)
      )
      transaction.add(transfer)

      const lucra = new Lucra(connection, configs.lucra)
      const stakingState = await lucra.getStakingStateAccount()
      const rewardAccountKP = await generateRewardAccountKP(
        configs.lucra,
        stakingState.rewardCursor + 1
      )
      const drop = await lucra.dropReward({
        payer: publicKey,
        rewardAccountKP,
      })
      transaction.add(...drop.instructions)

      signature = await sendTransaction(transaction, connection, {
        signers: [...drop.signers, DEVNET_SECRETKEY],
      })
      notify('info', 'Transaction sent:', signature)

      await connection.confirmTransaction(signature, 'processed')
      notify('success', 'Transaction successful!', signature)
      setLoading(false)
      dispatch(setRefreshStakingState(true))
    } catch (error: any) {
      setLoading(false)
      notify('error', `Transaction failed! ${error?.message}`, signature)
      return
    }
  }, [
    DEVNET_SECRETKEY,
    connection,
    notify,
    publicKey,
    sendTransaction,
    dispatch,
    configs,
  ])

  return (
    <>
      <div>
        <div className={'text-header-white box-padded-medium'}>
          This pubkey sources the airdrops and mSOL rewards dropped into the
          treasury.
        </div>
        <div className={'flex-row'}>
          <div className={'flex-column text-white'} style={{ flexGrow: 0 }}>
            PublicKey:
          </div>
          <div
            className={'flex-column text-white'}
            style={{ flexGrow: 0, textAlign: 'left' }}
          >
            {DEVNET_SECRETKEY.publicKey.toString()}
          </div>
        </div>
        <div
          className={'flex-row'}
          style={{
            border: '0px',
            backgroundColor: 'transparent',
            backdropFilter: 'none',
          }}
        >
          {loading ? (
            <CircularProgress
              style={{
                color: 'white',
                position: 'relative',
              }}
            />
          ) : (
            <>
              <div className={'flex-column'}>
                <Button
                  style={{
                    top: '20%',
                    minWidth: '120px',
                  }}
                  onClick={airdropSolana}
                  variant={'contained'}
                >
                  Airdrop (1) SOL
                </Button>
              </div>
              <div className={'flex-column'}>
                <Button
                  style={{
                    top: '20%',
                    minWidth: '120px',
                  }}
                  onClick={airdropLucra}
                  variant={'contained'}
                >
                  Airdrop (1000) Lucra
                </Button>
              </div>
              <div className={'flex-column'}>
                <Button
                  style={{
                    top: '20%',
                    minWidth: '120px',
                  }}
                  onClick={dropStakingReward}
                  variant={'contained'}
                >
                  Drop (1) mSOL Staking Reward
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
