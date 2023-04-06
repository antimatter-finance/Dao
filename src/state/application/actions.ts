import { createAction } from '@reduxjs/toolkit'
import { ChainId } from 'constants/chain'
import { SUPPORT_PLATFORM } from 'models/platform'

export type PopupContent = {
  txn: {
    hash: string
    success: boolean
    summary?: string
  }
}

export type PopupContent1 = {
  txn: {
    hash: string
    success: boolean
    summary?: string
    crossChain?: {
      bridge: SUPPORT_PLATFORM
      fromChain: ChainId
      toChain: ChainId
      value: string
      fromTXHash: string
      toAddress: string
      pairID?: string
    }
  }
}

export enum ApplicationModal {
  WALLET,
  SETTINGS,
  MENU
}

export const updateBlockNumber = createAction<{ chainId: number; blockNumber: number }>('application/updateBlockNumber')
export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const addPopup = createAction<{ key?: string; removeAfterMs?: number | null; content: PopupContent }>(
  'application/addPopup'
)
export const addPopup1 = createAction<{ key?: string; removeAfterMs?: number | null; content: PopupContent1 }>(
  'application/addPopup'
)
export const removePopup = createAction<{ key: string }>('application/removePopup')
