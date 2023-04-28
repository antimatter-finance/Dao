import { useMemo, useCallback, useState, useEffect } from 'react'
// import JSBI from 'jsbi'
import { useAntiMatterB2DaoContract } from './useContract'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useActiveWeb3React } from 'hooks'
import { ANTIMATTER_B2_DAO_ADDRESS, Matter } from 'constants/index'
import { parseBalance, tryParseAmount } from 'utils/parseAmount'
import { CurrencyAmount, Token } from 'constants/token'
import { Axios } from 'utils/axios'

export function useB2StakeCallback(): {
  b2StakeCallback: undefined | ((val: string) => Promise<any>)
  b2UnstakeCallback: undefined | ((val: string) => Promise<any>)
  b2GetStakeRewardCallback: undefined | (() => Promise<any>)
} {
  const { account, chainId } = useActiveWeb3React()
  const contract = useAntiMatterB2DaoContract()

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

  const getStakeReward = useCallback(() => {
    return contract?.getReward()
  }, [contract])

  const res = useMemo(() => {
    return {
      b2StakeCallback: stake,
      b2UnstakeCallback: unstake,
      b2GetStakeRewardCallback: getStakeReward
    }
  }, [getStakeReward, stake, unstake])

  return res
}

export function useB2StakingInfo() {
  const [matterPrice, setMatterPrice] = useState(0)
  const { account } = useActiveWeb3React()
  const contract = useAntiMatterB2DaoContract()
  const args = useMemo(() => [account ?? undefined], [account])

  useEffect(() => {
    Axios.get('https://api.antimatter.finance/app/getCoinPrice').then((res: any) => {
      setMatterPrice(res.data.data.matter_price)
    })
  }, [])
  const begin = useSingleCallResult(contract, 'begin')?.result?.[0]?.toString()
  const canStake = useMemo(() => {
    const now = new Date().getTime()
    if (!begin) {
      return false
    }
    return Number(begin) * 1000 > now ? false : true
  }, [begin])

  const apyRes = useSingleCallResult(contract, 'rewardRate')
  const totalDepositedRes = useSingleCallResult(contract, 'totalSupply')
  const earnedRes = useSingleCallResult(contract, 'getEarned', [account ?? undefined])
  const stakedBalanceRes = useSingleCallResult(contract, 'balanceOf', args)

  const res = useMemo(() => {
    // const USDC = new Token(chainId ?? 1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6, 'USDC')

    return {
      canStake,
      b2Apy: apyRes?.result?.[0] ? (+parseBalance(apyRes?.result?.[0], Matter) * 100).toFixed(2).toString() : '-',
      b2TotalDeposited: totalDepositedRes?.result?.[0]
        ? CurrencyAmount.ether(totalDepositedRes?.result?.[0]).toSignificant()
        : '-',
      b2Earned: earnedRes?.result?.[0] ? parseBalance(earnedRes.result?.[0], Matter, 6) : '-',
      b2StakedBalance: earnedRes?.result?.[0] ? parseBalance(stakedBalanceRes.result?.[0], Matter, 6) : '-',
      b2TotalStakedBalance: totalDepositedRes?.result?.[0]
        ? (+CurrencyAmount.ether(totalDepositedRes?.result?.[0]).toSignificant() * matterPrice).toFixed(2).toString()
        : '-'
    }
  }, [apyRes?.result, canStake, earnedRes.result, matterPrice, stakedBalanceRes.result, totalDepositedRes?.result])
  return res
}
