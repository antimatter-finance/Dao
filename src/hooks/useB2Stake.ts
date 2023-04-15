import { useMemo, useCallback } from 'react'
// import JSBI from 'jsbi'
import { useAntiMatterB2DaoContract } from './useContract'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useActiveWeb3React } from 'hooks'
import { ANTIMATTER_B2_DAO_ADDRESS, Matter } from 'constants/index'
import { parseBalance, tryParseAmount } from 'utils/parseAmount'
import { CurrencyAmount, Token } from 'constants/token'
// import { useETHBalances } from 'state/wallet/hooks'

export function useB2StakeCallback(): {
  b2StakeCallback: undefined | ((val: string) => Promise<any>)
  b2UnstakeCallback: undefined | ((val: string) => Promise<any>)
} {
  const { account, chainId } = useActiveWeb3React()
  const contract = useAntiMatterB2DaoContract()
  if (!account) {
    throw new Error('Unexpected error. account')
  }
  const stake = useCallback(
    (val: string): Promise<any> => {
      return contract?.stakeEth({
        from: account,
        value: val
      })
    },
    [account, contract]
  )

  const unstake = useCallback(
    (val: string): Promise<any> => {
      if (!chainId || !account) throw new Error('Unexpected error. account')

      const TOKEN = new Token(chainId, ANTIMATTER_B2_DAO_ADDRESS[chainId], 18, 'MATTER')
      const amount = tryParseAmount(val, TOKEN)?.raw.toString()
      return (
        amount &&
        contract?.withdrawEth(amount, {
          from: account
        })
      )
    },
    [account, chainId, contract]
  )

  const res = useMemo(() => {
    return {
      b2StakeCallback: stake,
      b2UnstakeCallback: unstake
    }
  }, [stake, unstake])

  return res
}

export function useB2StakingInfo() {
  const { account } = useActiveWeb3React()
  const contract = useAntiMatterB2DaoContract()
  const args = useMemo(() => [account ?? undefined], [account])

  // const totalStakedBalanceRes = useETHBalances([(chainId && ANTIMATTER_B2_DAO_ADDRESS[chainId]) || undefined])[
  //   (chainId && ANTIMATTER_B2_DAO_ADDRESS[chainId]) || 0
  // ]

  const apyRes = useSingleCallResult(contract, 'rewardRate')
  const totalDepositedRes = useSingleCallResult(contract, 'totalSupply')
  const earnedRes = useSingleCallResult(contract, 'getEarned', [account ?? undefined])
  const stakedBalanceRes = useSingleCallResult(contract, 'balanceOf', args)

  const res = useMemo(() => {
    // const USDC = new Token(chainId ?? 1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6, 'USDC')

    return {
      b2Apy: apyRes?.result?.[0] ? (+parseBalance(apyRes?.result?.[0], Matter) * 100).toFixed(2).toString() : '-',
      b2TotalDeposited: totalDepositedRes?.result?.[0]
        ? CurrencyAmount.ether(totalDepositedRes?.result?.[0]).toSignificant()
        : '-',
      b2Earned: earnedRes?.result?.[0] ? parseBalance(earnedRes.result?.[0], Matter, 4) : '-',
      b2StakedBalance: earnedRes?.result?.[0] ? parseBalance(stakedBalanceRes.result?.[0], Matter, 4) : '-'
      // b2TotalStakedBalance: totalStakedBalanceRes ? parseFloat(totalStakedBalanceRes.toSignificant()).toFixed(0) : '-'
    }
  }, [apyRes?.result, earnedRes.result, stakedBalanceRes.result, totalDepositedRes?.result])
  return res
}
