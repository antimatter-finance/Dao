import { CurrencyAmount } from 'constants/token'
import { useActiveWeb3React } from 'hooks'
import { useTransactionAdder1 } from 'state/transactions/hooks'
import { calculateGasMargin } from '../utils'
import { TransactionResponse } from '@ethersproject/providers'
// import { useGasPriceInfo } from './useGasPrice'
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
  // const gasPriceInfoCallback = useGasPriceInfo()

  return {
    state: ContractCallbackState.VALID,
    callback: async function onCall(
      tokenAddress: string,
      toChainId: number,
      toAccount: string,
      amount: CurrencyAmount,
      isETHER: boolean
      // fromChainId: number,
      // symbol: string,
      // moreData: MoreDataProp
    ): Promise<{ hash: string; transferId?: string; depositAddress?: string }> {
      if (!contract) {
        throw new Error('Unexpected error. Contract error')
      }
      if (!account) {
        throw new Error('Unexpected error. account')
      }
      // if (!moreData.maxSlippage) {
      //   throw new Error('Unexpected error. maxSlippage')
      // }

      const timestamp = (new Date().getTime() / 1000).toFixed()
      if (isETHER) {
        const args = [toChainId, toAccount, timestamp]
        return contract.estimateGas
          .burnNative(...args, { from: account, value: amount.raw.toString() })
          .then(estimatedGasLimit => {
            return contract
              .burnNative(...args, {
                gasLimit: calculateGasMargin(estimatedGasLimit),
                from: account,
                value: amount.raw.toString()
              })
              .then((response: TransactionResponse) => {
                addTransaction1(response, {
                  summary: `Cross ${amount.toSignificant()} Matter to ${toAccount}`,
                  claim: { recipient: `${account}_transfer_ether_to${toChainId}` }
                })
                return response.hash
              })
              .catch((err: any) => {
                throw err
              })
          })
      } else {
        const args = [tokenAddress, amount.raw.toString(), toChainId, toAccount, timestamp]
        // const { gasLimit, gasPrice } = await gasPriceInfoCallback(contract, 'burn', args, undefined)
        return contract.estimateGas.deposit(...args, { from: account, value: undefined }).then(estimatedGasLimit => {
          return contract
            .deposit(...args, {
              // gasPrice,
              gasLimit: calculateGasMargin(estimatedGasLimit),
              from: account
            })
            .then((response: TransactionResponse) => {
              addTransaction1(response, {
                summary: `Cross ${amount.toSignificant()} Matter to ${toAccount}`,
                claim: { recipient: `${account}_transfer_ether_to${toChainId}` }
              })
              return response.hash
            })
            .catch((err: any) => {
              throw err
            })
        })
      }
    },
    error: ''
  }
}

export function useDepositeOnceCallback(contractAddress?: string) {
  return useCbridgeDepositeCallback(contractAddress ?? '').callback
}
