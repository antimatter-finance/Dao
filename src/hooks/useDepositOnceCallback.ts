import { CurrencyAmount } from 'constants/token'
import { useActiveWeb3React } from 'hooks'
import { useTransactionAdder1 } from 'state/transactions/hooks'
import { calculateGasMargin, checkoutContract } from '../utils'
import { TransactionResponse } from '@ethersproject/providers'
import ReactGA from 'react-ga4'
import { useContract } from './useContract'
import CBRIDGE_ABI from 'constants/abis/cbridge.json'
import { BridgeCrossDirection, BridgeSymbiosisDirection } from '../models/platform'

interface MoreDataProp {
  pairID?: string //multichain
  direction?: BridgeCrossDirection //multichain
  feeInt?: string //multichain
  underlying?: string //anyswap v2
  maxSlippage?: number // cbridge eg: slippage 0.5%
  srcPoolId?: number
  dstPoolId?: number
  minReceive?: string | undefined
  bridgeSymbiosisDirection?: BridgeSymbiosisDirection
  symbiosisSrcPortalAddress?: string
  symbiosisSrcBridgeAddress?: string
  symbiosisSrcSynthesisAddress?: string
  symbiosisDestPortalAddress?: string
  symbiosisDestBridgeAddress?: string
  symbiosisDestSynthesisAddress?: string
}

export enum ContractCallbackState {
  INVALID,
  LOADING,
  VALID
}

export function useCbridgeDepositeCallback(
  depositAddress: string
): {
  state: ContractCallbackState
  callback:
    | undefined
    | ((
        tokenAddress: string,
        toChainId: number,
        toAccount: string,
        amount: CurrencyAmount,
        isETHER: boolean,
        fromChainId: number,
        symbol: string,
        moreData: MoreDataProp
      ) => Promise<{ hash: string; transferId?: string; depositAddress?: string }>)
  error: string | null
} {
  const addTransaction1 = useTransactionAdder1()
  const contract = useContract(depositAddress, CBRIDGE_ABI)
  const { account } = useActiveWeb3React()

  return {
    state: ContractCallbackState.VALID,
    callback: async function onCall(
      tokenAddress: string,
      toChainId: number,
      toAccount: string,
      amount: CurrencyAmount,
      isETHER: boolean,
      fromChainId: number,
      symbol: string,
      moreData: MoreDataProp
    ): Promise<{ hash: string; transferId?: string; depositAddress?: string }> {
      if (!contract) {
        throw new Error('Unexpected error. Contract error')
      }
      if (!account) {
        throw new Error('Unexpected error. account')
      }
      if (!moreData.maxSlippage) {
        throw new Error('Unexpected error. maxSlippage')
      }
      checkoutContract(contract.address)

      const timestamp = (new Date().getTime() / 1000).toFixed()
      const method = 'transfer'

      if (isETHER) {
        const args = [toAccount, amount.raw.toString(), toChainId, timestamp, moreData.maxSlippage]
        return contract.estimateGas
          .sendNative(...args, { from: account, value: amount.raw.toString() })
          .then(estimatedGasLimit => {
            return contract
              .sendNative(...args, {
                gasLimit: calculateGasMargin(estimatedGasLimit),
                from: account,
                value: amount.raw.toString()
              })
              .then((response: TransactionResponse) => {
                addTransaction1(response, {
                  summary: `transfer`,
                  claim: { recipient: `${account}_transfer_ether_to${toChainId}` }
                })
                return response.hash
              })
              .catch((err: any) => {
                if (err.code !== 4001) {
                  ReactGA.event({
                    category: `catch-${method}`,
                    action: `${err?.error.message || ''} ${err?.message || ''} ${err?.data?.message || ''}`,
                    label: JSON.stringify(args)
                  })
                }
                throw err
              })
          })
      } else {
        const args = [toAccount, tokenAddress, amount.raw.toString(), toChainId, timestamp, moreData.maxSlippage]
        return contract.estimateGas.send(...args, { from: account }).then(estimatedGasLimit => {
          return contract
            .send(...args, {
              gasLimit: calculateGasMargin(estimatedGasLimit),
              from: account
            })
            .then((response: TransactionResponse) => {
              addTransaction1(response, {
                summary: `transfer`,
                claim: { recipient: `${account}_transfer_ether_to${toChainId}` }
              })
              return response.hash
            })
            .catch((err: any) => {
              if (err.code !== 4001) {
                ReactGA.event({
                  category: `catch-${method}`,
                  action: `${err?.error.message || ''} ${err?.message || ''} ${err?.data?.message || ''}`,
                  label: JSON.stringify(args)
                })
              }
              throw err
            })
        })
      }
    },
    error: ''
  }
}

export function useDepositeOnceCallback(contractAddress?: string) {
  const cbridge = useCbridgeDepositeCallback(contractAddress ?? '')
  return cbridge.callback
}
