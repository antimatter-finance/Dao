import { useCallback, useMemo, useState } from 'react'
import ChainSwitch from 'components/ChainSwitch/ChainSwitch'
import { Box, Typography } from '@mui/material'
import InputNumerical from 'components/Input/InputNumerical'
import Button from 'components/Button/Button'
import { useCbridgeDepositeCallback } from 'hooks/useDepositOnceCallback'
import { useActiveWeb3React } from 'hooks'
import useModal from 'hooks/useModal'
import TransactionSubmittedModal from 'components/Modal/TransactionModals/TransactiontionSubmittedModal'
import MessageBox from 'components/Modal/TransactionModals/MessageBox'
import { tryParseAmount } from 'utils/parseAmount'
import { BAST_TOKEN } from '../../constants'
import { useCurrencyBalance, useETHBalances } from 'state/wallet/hooks'
import TransactionPendingModal from 'components/Modal/TransactionModals/TransactionPendingModal'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { ReactComponent as ETH } from 'assets/svg/eth_logo.svg'
import EthUrl from 'assets/svg/eth_logo.svg'
import MatterUrl from 'assets/images/favicon.png'
import { ChainId, ChainListMap } from 'constants/chain'
import { useCbridgeSwapFeeInfoResult } from 'hooks/useFee'
import { Chain } from 'models/chain'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import { Dots } from 'theme/components'
import { triggerSwitchChain } from 'utils/triggerSwitchChain'

const ChainList = [
  // {
  //   icon: '',
  //   logo: MatterUrl,
  //   symbol: 'Matter',
  //   name: 'Antimatter B2 Network',
  //   id: ChainId.MATTER,
  //   hex: '0x4efd'
  // },
  {
    icon: '',
    logo: MatterUrl,
    symbol: 'Matter',
    name: 'Antimatter B2 Network',
    id: ChainId.MATTERMAINNET,
    hex: '0x7c6'
  },
  // {
  //   icon: <ETH />,
  //   logo: EthUrl,
  //   symbol: 'Goerli',
  //   name: 'Goerli Testnet',
  //   id: ChainId.GÖRLI,
  //   hex: '0x5'
  // }
  {
    icon: <ETH />,
    logo: EthUrl,
    symbol: 'ETH',
    name: 'ETH Network',
    id: ChainId.MAINNET,
    hex: '0x1'
  }
]

const depositAddressList: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x7510792A3B1969F9307F3845CE88e39578f2bAE1',
  [ChainId.ROPSTEN]: '',
  [ChainId.RINKEBY]: '',
  [ChainId.KOVAN]: '',
  [ChainId.GÖRLI]: '0xe40e60098ccf287413f4f08e39a912e7b6ce8146',
  [ChainId.MATTER]: '0x9bb46d5100d2db4608112026951c9c965b233f4d',
  [ChainId.MATTERMAINNET]: '0xa7C9FeDe809b6af10dC52590804c69F40f6f8154'
}

export default function TabContentBridge() {
  const [value, setValue] = useState('')
  const { account, chainId, library } = useActiveWeb3React()
  const { showModal, hideModal } = useModal()
  const toggleWalletModal = useWalletModalToggle()
  const depositAddress = depositAddressList[chainId ?? ChainId.MATTERMAINNET]
  const { callback: depositeOnceCallback } = useCbridgeDepositeCallback(depositAddress)
  const [fromToken, setFromToken] = useState(BAST_TOKEN[ChainId.MATTERMAINNET])
  const [toToken, setToToken] = useState(BAST_TOKEN[ChainId.MAINNET])
  const [fromChain, setFromChain] = useState<Chain>(ChainList[0])
  const [toChain, setToChain] = useState<Chain>(ChainList[1])

  const walletIsCurrentChain = useMemo(() => chainId === fromChain?.id, [chainId, fromChain?.id])
  const isETHER = useMemo(() => fromToken.chainId === ChainId.MATTERMAINNET, [fromToken.chainId])
  const fromAmount = useMemo(() => tryParseAmount(value, fromToken), [fromToken, value])
  const ethBalance = useETHBalances([account || undefined])[account || 0]
  const nativeBalance = useCurrencyBalance(account || undefined, !isETHER ? fromToken : undefined)

  const fromBalance = isETHER ? ethBalance : nativeBalance
  const userSlippage = useUserSlippageTolerance()

  const { loading: cbridgeFeeInfoLoading, result: cbridgeFeeInfo } = useCbridgeSwapFeeInfoResult(
    depositAddress,
    fromToken.address,
    fromChain?.id ?? undefined,
    toChain?.id ?? undefined,
    fromToken,
    account,
    userSlippage[0] * 100,
    fromAmount?.raw.toString()
  )
  const depositCallback = useCallback(() => {
    if (!account || !fromAmount || !fromToken || !fromToken.symbol) return
    const params = {
      tokenAddress: fromToken.address,
      toChainId: toToken?.chainId,
      toAccount: account,
      amount: fromAmount,
      isETHER,
      fromChainId: fromToken.chainId,
      symbol: fromToken.symbol,
      moreData: {
        maxSlippage: cbridgeFeeInfo?.maxSlippage
      }
    }
    showModal(<TransactionPendingModal />)
    depositeOnceCallback &&
      depositeOnceCallback(
        params.tokenAddress,
        params.toChainId,
        params.toAccount,
        params.amount,
        params.isETHER,
        params.fromChainId,
        params.symbol,
        params.moreData
      )
        .then(() => {
          hideModal()
          showModal(<TransactionSubmittedModal />)
          setValue('')
        })
        .catch(err => {
          hideModal()
          showModal(
            <MessageBox type="error">{err.data && err.data.message ? err.data.message : err?.message}</MessageBox>
          )
          console.error(err)
        })
  }, [
    account,
    cbridgeFeeInfo?.maxSlippage,
    depositeOnceCallback,
    fromAmount,
    fromToken,
    hideModal,
    isETHER,
    showModal,
    toToken?.chainId
  ])
  const [approvalState, approveCallback] = useApproveCallback(
    isETHER ? fromBalance : tryParseAmount(value, fromBalance?.currency),
    chainId ? depositAddressList[chainId] || undefined : undefined
  )

  const toSwitch = useCallback(() => {
    if (!fromToken || !toToken) return
    setFromToken(toToken)
    setToToken(fromToken)
    setFromChain(toChain)
    setToChain(fromChain)
  }, [fromChain, fromToken, toToken, toChain])

  const getActions = useCallback(() => {
    if (!account) {
      return <Button onClick={toggleWalletModal}>Connect Wallet</Button>
    }
    if (!walletIsCurrentChain) {
      return (
        <Button onClick={() => fromChain.id && triggerSwitchChain(library, fromChain.id, account)}>
          Switch to {fromChain.id && ChainListMap[fromChain.id].name}
        </Button>
      )
    }

    if (!fromAmount || !value) return <Button disabled>Enter amount</Button>

    if (!fromBalance || fromBalance?.lessThan(fromAmount)) {
      return <Button disabled>Balance insufficient</Button>
    }
    if (!cbridgeFeeInfo || !cbridgeFeeInfo?.fees || cbridgeFeeInfoLoading)
      return (
        <Button disabled>
          Loading fee info
          <Dots />
        </Button>
      )
    const _cminInput = cbridgeFeeInfo.fees.toSignificant()
    if (Number(_cminInput) > Number(fromAmount?.toSignificant())) {
      return <Button disabled>Minimum amount is {_cminInput}</Button>
    }
    if (approvalState !== ApprovalState.APPROVED) {
      if (approvalState === ApprovalState.PENDING) {
        return (
          <Button disabled>
            processing
            <Dots />
          </Button>
        )
      } else if (approvalState === ApprovalState.NOT_APPROVED) {
        return <Button onClick={approveCallback}>Approve</Button>
      } else {
        return (
          <Button disabled>
            Loading
            <Dots />
          </Button>
        )
      }
    }
    return <Button onClick={depositCallback}>Transfer</Button>
  }, [
    account,
    approvalState,
    approveCallback,
    cbridgeFeeInfo,
    cbridgeFeeInfoLoading,
    depositCallback,
    fromAmount,
    fromBalance,
    fromChain.id,
    library,
    toggleWalletModal,
    value,
    walletIsCurrentChain
  ])

  return (
    <Box display="flex">
      <Box width="40%" height="100%">
        <ChainSwitch fromChain={fromChain} toChain={toChain} height={82} toSwitch={toSwitch} />
      </Box>
      <Box padding="22px 32px" display="grid" gap="22px" width="60%">
        <InputNumerical
          label="Amount"
          onMax={() => setValue(fromBalance?.toSignificant() || '')}
          balance={fromChain.id === chainId ? fromBalance?.toSignificant() : '-'}
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography fontWeight={500} fontSize={12}>
            Fee:
          </Typography>
          <Typography fontWeight={500} fontSize={12}>
            {(cbridgeFeeInfo.fees && cbridgeFeeInfo.fees.toSignificant()) || '-'} MATTER
          </Typography>
        </Box>
        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography fontWeight={500} fontSize={12}>
            Receive(estimated):
          </Typography>
          <Typography fontWeight={500} fontSize={12}>
            {(fromAmount &&
              fromBalance &&
              fromBalance?.greaterThan(fromAmount) &&
              cbridgeFeeInfo.fees &&
              fromAmount?.greaterThan(cbridgeFeeInfo.fees) &&
              fromAmount?.subtract(cbridgeFeeInfo.fees).toSignificant()) ||
              '-'}{' '}
            MATTER
          </Typography>
        </Box>
        {getActions()}
      </Box>
    </Box>
  )
}
