import { createAction } from '@reduxjs/toolkit'
import { ChainId } from '../../constants/chain'
import { SUPPORT_PLATFORM } from 'models/platform'

export interface SerializableTransactionReceipt {
  to: string
  from: string
  contractAddress: string
  transactionIndex: number
  blockHash: string
  transactionHash: string
  blockNumber: number
  status?: number
}

export const addTransaction = createAction<{
  chainId: ChainId
  hash: string
  from: string
  approval?: { tokenAddress: string; spender: string }
  claim?: { recipient: string }
  summary?: string
}>('transactions/addTransaction')
export const addTransaction1 = createAction<{
  chainId: ChainId
  hash: string
  from: string
  approval?: { tokenAddress: string; spender: string }
  crossChain?: {
    bridge: SUPPORT_PLATFORM
    fromChain: ChainId
    toChain: ChainId
    value: string
    fromTXHash: string
    toAddress: string
    symbol: string
    pairID?: string
    cbridgeTransferId?: string
  }
  claim?: { recipient: string }
  summary?: string
}>('transactions/addTransaction')
export const clearAllTransactions = createAction<{ chainId: ChainId }>('transactions/clearAllTransactions')
export const finalizeTransaction = createAction<{
  chainId: ChainId
  hash: string
  receipt: SerializableTransactionReceipt
}>('transactions/finalizeTransaction')
export const checkedTransaction = createAction<{
  chainId: ChainId
  hash: string
  blockNumber: number
}>('transactions/checkedTransaction')
