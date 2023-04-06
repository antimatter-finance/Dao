import { Token } from 'constants/token'

export enum SUPPORT_PLATFORM {
  MULTICHAIN = 'MultiChain',
  POLYNETWORK = 'PolyBridge',
  ANYSWAP = 'AnySwap',
  CBRIDGE = 'CBridge',
  BICONOMY = 'Biconomy',
  STARGATE = 'Stargate',
  SYMBIOSIS = 'Symbiosis',
  CONNEXT = 'CONNEXT',
  WORMHOLE = 'Wormhole',
  O3SWAP = 'O3Swap'
}

export enum BridgeCrossDirection {
  SRC_TO_DEST,
  DESC_TO_SRC
}

export enum BridgeSymbiosisDirection {
  MINT,
  BURN
}

export interface PLATFORM_INFO {
  name: string
  intro: string
  logo: string
  link: string
}

export interface CrossChainProp {
  platform: SUPPORT_PLATFORM
  srcToken: Token
  destToken: Token
  depositeContract: string
  minAmount: string
  maxAmount: string
  moreData: {
    direction: BridgeCrossDirection
    bridgeSymbiosisDirection?: BridgeSymbiosisDirection
    pairID?: string
    feeRate?: number
    maxFee?: number
    minFee?: number
    underlying?: string
    destUnderlying?: string
    srcLayer0PoolId?: number
    destLayer0PoolId?: number
    srcPoolId?: number
    dstPoolId?: number
    symbiosisSrcPortalAddress?: string
    symbiosisSrcBridgeAddress?: string
    symbiosisSrcSynthesisAddress?: string
    symbiosisDestPortalAddress?: string
    symbiosisDestBridgeAddress?: string
    symbiosisDestSynthesisAddress?: string
  }
}
