import { Axios } from 'utils/axios'

const { get, post } = Axios

export function fetchCbridgeSwapResult(fromTXHash: string) {
  return post(`https://cbridge-prod2.celer.network/v1/getTransferStatus`, {
    transfer_id: fromTXHash
  })
}

export function fetchCbridgeEstimateAmtResult(
  fromChainId: number,
  toChainId: number,
  tokenSymbol: string,
  usrAddr: string,
  slippageTolerance: string | number,
  amt: string
) {
  return get(`https://cbridge-prod2.celer.network/v1/estimateAmt`, {
    src_chain_id: fromChainId,
    dst_chain_id: toChainId,
    token_symbol: tokenSymbol,
    usr_addr: usrAddr,
    slippage_tolerance: slippageTolerance,
    amt
  })
}
