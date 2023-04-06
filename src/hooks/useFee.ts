import { Token, TokenAmount } from 'constants/token'
import { useEffect, useState } from 'react'
import { useBlockNumber } from 'state/application/hooks'
import CBRIDGE_ABI from 'constants/abis/cbridge.json'
import { useContract } from './useContract'
import { fetchCbridgeEstimateAmtResult } from 'utils/fetch/cbridge'
import { useSingleCallResult } from 'state/multicall/hooks'

export function useCbridgeSwapFeeInfoResult(
  depositAddress: string | undefined,
  tokenAddress: string | undefined,
  fromChainId: number | undefined,
  toChainId: number | undefined,
  destToken: Token | undefined,
  usrAddr: string | undefined | null,
  slippageTolerance: string | undefined | number, // eg: 0.05%, 0.05% * 1M = 500
  inputAmountRaw: string | undefined
) {
  const [result, setResult] = useState<
    | {
        fees: TokenAmount
        maxSlippage: number
      }
    | undefined
  >()
  const [loading, setLoading] = useState(false)
  const blockNumber = useBlockNumber()
  const contract = useContract(depositAddress, CBRIDGE_ABI)
  console.log(contract)
  const minSend = useSingleCallResult(contract, 'minSend', [tokenAddress])

  useEffect(() => {
    if (!fromChainId || !toChainId || !destToken || !slippageTolerance || !usrAddr || !inputAmountRaw) {
      setResult(undefined)
      return
    }
    ;(async () => {
      setLoading(true)
      try {
        const res = (await fetchCbridgeEstimateAmtResult(
          fromChainId,
          toChainId,
          destToken.symbol || '',
          usrAddr,
          slippageTolerance,
          inputAmountRaw
        )) as any
        const ret = {
          fees: new TokenAmount(destToken, res.perc_fee).add(new TokenAmount(destToken, res.base_fee)),
          maxSlippage: res.max_slippage
        }
        setResult(ret)
      } catch (error) {
        setResult(undefined)
      }
      setLoading(false)
    })()
  }, [fromChainId, toChainId, usrAddr, slippageTolerance, destToken, inputAmountRaw, blockNumber])

  return {
    loading: loading || minSend.loading,
    result: {
      ...result,
      minAmount: minSend.result?.toString()
    }
  }
}
