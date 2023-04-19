import { useState, useCallback, useMemo } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import Card from 'components/Card/Card'
import NumericalCard from 'components/Card/NumericalCard'
import { ReactComponent as MatterCircle } from 'assets/svg/stake_matter_circle.svg'
import SmallButton from 'components/Button/SmallButton'
import StakeInputModal, { StakeType } from './StakeInputModal'
import B2StakeInputModal from './B2StakeInputModal'
import StakeActionModal from './StakeActionModal'
import { useStakeCallback, useStakingInfo } from 'hooks/useStake'
import useModal from 'hooks/useModal'
import { useTransactionAdder } from 'state/transactions/hooks'
import TransacitonPendingModal from 'components/Modal/TransactionModals/TransactionPendingModal'
import MessageBox from 'components/Modal/TransactionModals/MessageBox'
import { useActiveWeb3React } from 'hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import { CURRENT_SUPPORTED_CHAINS, Matter } from 'constants/index'
import { TokenAmount } from 'constants/token'
import { triggerSwitchChain } from 'utils/triggerSwitchChain'
import { ChainId, ChainListMap } from 'constants/chain'
import { useCurrencyBalance, useETHBalances } from 'state/wallet/hooks'
import { useB2StakeCallback, useB2StakingInfo } from 'hooks/useB2Stake'

export default function Stake() {
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [depositB2ModalOpen, setDepositB2ModalOpen] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [withdrawB2ModalOpen, setWithdrawB2ModalOpen] = useState(false)
  const [compoundModalOpen, setCompoundModalOpen] = useState(false)
  const [claimModalOpen, setClaimModalOpen] = useState(false)

  const theme = useTheme()
  const { showModal, hideModal } = useModal()
  const toggleWalletModal = useWalletModalToggle()

  const { chainId, account, library } = useActiveWeb3React()
  const { stakeCallback, unstakeCallback, compoundCallback } = useStakeCallback()
  const { b2StakeCallback, b2UnstakeCallback, b2GetStakeRewardCallback } = useB2StakeCallback()
  const addTransaction = useTransactionAdder()
  const { apy, earned, stakedBalance, totalDeposited, totalStakedBalance } = useStakingInfo()
  const { canStake, b2Apy, b2Earned, b2StakedBalance, b2TotalDeposited, b2TotalStakedBalance } = useB2StakingInfo()

  const matterBalance = useCurrencyBalance(account ?? undefined, Matter)
  const b2MatterBalance = useETHBalances([account || undefined])[account || 0]

  const onDismiss = useCallback(() => {
    setDepositModalOpen(false)
    setWithdrawModalOpen(false)
    setCompoundModalOpen(false)
    setDepositB2ModalOpen(false)
    setWithdrawB2ModalOpen(false)
    setClaimModalOpen(false)
  }, [])

  const handleStake = useCallback(
    (val: string | undefined, setHash: (hash: string) => void) => () => {
      if (!stakeCallback || !val || !account) return
      showModal(<TransacitonPendingModal />)
      stakeCallback(val)
        .then(r => {
          hideModal()
          setHash(r.hash)
          const matterToken = new TokenAmount(Matter, val)
          addTransaction(r, {
            summary: `Stake ${matterToken.toExact()} MATTER`
          })
        })
        .catch(e => {
          showModal(<MessageBox type="error">{e.message}</MessageBox>)
        })
    },
    [addTransaction, hideModal, showModal, stakeCallback, account]
  )

  const handleB2Stake = useCallback(
    (val: string | undefined, setHash: (hash: string) => void) => () => {
      if (!b2StakeCallback || !val || !account) return
      showModal(<TransacitonPendingModal />)
      b2StakeCallback(val)
        .then(r => {
          hideModal()
          setHash(r.hash)
          const matterToken = new TokenAmount(Matter, val)
          addTransaction(r, {
            summary: `Stake ${matterToken.toExact()} MATTER`
          })
        })
        .catch(e => {
          showModal(<MessageBox type="error">{e.message}</MessageBox>)
        })
    },
    [account, showModal, b2StakeCallback, hideModal, addTransaction]
  )

  const handleUnStake = useCallback(
    (setHash: (hash: string) => void) => () => {
      if (!unstakeCallback) return
      showModal(<TransacitonPendingModal />)
      unstakeCallback()
        .then(r => {
          hideModal()
          setHash(r.hash)
          addTransaction(r, {
            summary: `Unstake MATTER`
          })
        })
        .catch(e => {
          showModal(<MessageBox type="error">{e.message}</MessageBox>)
        })
    },
    [addTransaction, hideModal, showModal, unstakeCallback]
  )

  const handleClaimReward = useCallback(
    (setHash: (hash: string) => void) => () => {
      if (!b2GetStakeRewardCallback) return
      showModal(<TransacitonPendingModal />)
      b2GetStakeRewardCallback()
        .then(r => {
          hideModal()
          setHash(r.hash)
          addTransaction(r, {
            summary: `Claim Reward`
          })
        })
        .catch(e => {
          showModal(<MessageBox type="error">{e.message}</MessageBox>)
        })
    },
    [addTransaction, b2GetStakeRewardCallback, hideModal, showModal]
  )

  const handleB2UnStake = useCallback(
    (setHash: (hash: string) => void) => () => {
      if (!b2UnstakeCallback) return
      showModal(<TransacitonPendingModal />)
      b2UnstakeCallback(b2StakedBalance)
        .then(r => {
          hideModal()
          setHash(r.hash)
          addTransaction(r, {
            summary: `Unstake MATTER`
          })
        })
        .catch(e => {
          showModal(<MessageBox type="error">{e.message}</MessageBox>)
        })
    },
    [addTransaction, b2StakedBalance, b2UnstakeCallback, hideModal, showModal]
  )

  const handleCompound = useCallback(
    (setHash: (hash: string) => void) => () => {
      if (!compoundCallback) return
      showModal(<TransacitonPendingModal />)
      compoundCallback()
        .then(r => {
          hideModal()
          setHash(r.hash)
          addTransaction(r, {
            summary: `Compound MATTER`
          })
        })
        .catch(e => {
          showModal(<MessageBox type="error">{e.message}</MessageBox>)
        })
    },
    [addTransaction, compoundCallback, hideModal, showModal]
  )

  const currentSupportChain = CURRENT_SUPPORTED_CHAINS.stake[0] || 1
  const [supportChain, switchToSupportChain] = useMemo(() => {
    if (!chainId || !account || !library) return [false, () => {}]
    if (CURRENT_SUPPORTED_CHAINS.stake.includes(chainId)) {
      return [true, () => {}]
    }
    return [
      false,
      () => {
        triggerSwitchChain(library, currentSupportChain, account)
      }
    ]
  }, [account, chainId, currentSupportChain, library])

  return (
    <>
      {chainId && chainId === ChainId.MAINNET ? (
        <>
          <Box display="grid" alignContent="flex-start" sx={{ width: '100%' }} gap="20px">
            <Card>
              <Box display="grid" padding="34px 24px 30px" gap="40px">
                <Box display="flex" gap="20px">
                  <Box display="grid" gap="8px">
                    <Typography fontWeight={700} fontSize={24}>
                      Stake MATTER IN ETH
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" gap="20px" flexDirection={{ md: 'row', xs: 'column' }}>
                  <NumericalCard title="APY" value={new Date().getTime() > 1637107200000 ? apy : '--'} unit="%" gray />
                  <NumericalCard title="Total Staked" value={totalStakedBalance} unit="Matter" gray />
                  <NumericalCard title="Total Value Deposited" value={totalDeposited} unit="$" gray />
                </Box>
              </Box>
            </Card>
            <Box
              display="grid"
              gridTemplateColumns={{ md: '100%', lg: ' 2fr 1.5fr 1.5fr' }}
              gap="20px"
              flexWrap="wrap"
              maxWidth="100%"
              sx={{ width: '100%' }}
            >
              <NumericalCard title="MATTER Earned" value={earned} unit="Matter" fontSize="44px" height="280px">
                <>
                  {supportChain && earned && earned !== '-' && (
                    <SmallButton
                      variant="outlined"
                      onClick={() => {
                        setCompoundModalOpen(true)
                      }}
                      sx={{ position: 'absolute', right: '24px', top: '11px' }}
                    >
                      Compound
                    </SmallButton>
                  )}
                  <Box sx={{ position: 'absolute', right: '24px', bottom: '34px' }}>
                    {account ? (
                      supportChain ? (
                        <>
                          {stakedBalance && +stakedBalance > 0 ? (
                            <Box display="flex" gap="8px">
                              <SmallButton
                                sx={{ height: 44, width: 44, borderRadius: '12px', padding: 0 }}
                                onClick={() => {
                                  setDepositModalOpen(true)
                                }}
                              >
                                <svg viewBox="0 0 10 10" width="10" height="10">
                                  <rect y="4" width="10" height="2" fill="white" />
                                  <rect x="6" width="10" height="2" transform="rotate(90 6 0)" fill="white" />
                                </svg>
                              </SmallButton>
                              <SmallButton
                                sx={{ height: 44, width: 44, borderRadius: '12px', padding: 0 }}
                                onClick={() => {
                                  setWithdrawModalOpen(true)
                                }}
                              >
                                <svg viewBox="0 0 10 2" width="10" height="2">
                                  <rect width="10" height="2" fill="white" />
                                </svg>
                              </SmallButton>
                            </Box>
                          ) : (
                            <SmallButton
                              disabled
                              sx={{ height: 44, width: 108, borderRadius: '12px', padding: 0 }}
                              onClick={() => {
                                setDepositModalOpen(true)
                              }}
                            >
                              + Stake
                            </SmallButton>
                          )}
                        </>
                      ) : (
                        <SmallButton onClick={switchToSupportChain}>
                          Switch to {ChainListMap[currentSupportChain as number]?.symbol}
                        </SmallButton>
                      )
                    ) : (
                      <SmallButton onClick={toggleWalletModal}>Connect</SmallButton>
                    )}
                  </Box>
                </>
              </NumericalCard>

              <NumericalCard
                title="My Wallet Balance"
                value={matterBalance !== undefined ? matterBalance.toFixed(4) : '-'}
                unit="Matter"
                fontSize="44px"
                height="280px"
              />
              <NumericalCard
                title="My Staked Balance"
                value={stakedBalance}
                unit="Matter"
                fontSize="44px"
                height="280px"
              />
            </Box>
          </Box>
          <StakeInputModal
            type={StakeType.DEPOSIT}
            isOpen={depositModalOpen}
            onDismiss={onDismiss}
            onAction={handleStake}
            balance={matterBalance}
          />
          <StakeActionModal
            title="Withdraw MATTER Tokens"
            buttonActionText="Unstake"
            buttonPendingText="Pending Confirmat..."
            isOpen={withdrawModalOpen}
            onDismiss={onDismiss}
            onAction={handleUnStake}
            balance={stakedBalance}
          />
          <StakeActionModal
            title="MATTER Compound"
            buttonActionText="Comfirm"
            buttonPendingText="Confirming"
            isOpen={compoundModalOpen}
            onDismiss={onDismiss}
            onAction={handleCompound}
            balance={earned}
          />
        </>
      ) : (
        <>
          <Box display="grid" alignContent="flex-start" sx={{ width: '100%' }} gap="20px">
            <Card>
              <Box display="grid" padding="34px 24px 30px" gap="40px">
                <Box display="flex" justifyContent="space-between">
                  <Box display="flex" gap="20px">
                    <MatterCircle />
                    <Box display="grid" gap="8px">
                      <Typography fontWeight={700} fontSize={24}>
                        Stake MATTER
                      </Typography>
                      <Typography variant="inherit" color={theme.palette.text.secondary}>
                        Stake MATTER and get exponentially growing returns!
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box display="flex" gap="20px">
                  <Box display="grid" gap="8px">
                    <Typography fontWeight={700} fontSize={24}>
                      Stake MATTER IN AntiMatter B2
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" gap="20px" flexDirection={{ md: 'row', xs: 'column' }}>
                  <NumericalCard
                    title="APY"
                    value={new Date().getTime() > 1637107200000 ? b2Apy : '--'}
                    unit="%"
                    gray
                  />
                  <NumericalCard title="Total Staked" value={b2TotalDeposited} unit="Matter" gray />
                  <NumericalCard title="Total Value Deposited" value={b2TotalStakedBalance} unit="$" gray />
                </Box>
              </Box>
            </Card>
            <Box
              display="grid"
              gridTemplateColumns={{ md: '100%', lg: ' 2fr 1.5fr 1.5fr' }}
              gap="20px"
              flexWrap="wrap"
              maxWidth="100%"
              sx={{ width: '100%' }}
            >
              <NumericalCard title="MATTER Earned" value={b2Earned} unit="Matter" fontSize="44px" height="280px">
                <>
                  <Box sx={{ position: 'absolute', right: '24px', bottom: '90px' }}>
                    {supportChain && b2Earned && b2Earned !== '0' && (
                      <SmallButton
                        onClick={() => {
                          setClaimModalOpen(true)
                        }}
                        sx={{
                          position: 'absolute',
                          right: '0px',
                          top: '11px',
                          width: 108,
                          height: 44,
                          borderRadius: '12px'
                        }}
                      >
                        Claim
                      </SmallButton>
                    )}
                  </Box>
                </>
              </NumericalCard>

              <NumericalCard
                title="My Wallet Balance"
                value={b2MatterBalance !== undefined ? b2MatterBalance.toFixed(4) : '-'}
                unit="Matter"
                fontSize="44px"
                height="280px"
              />
              <NumericalCard
                title="My Staked Balance"
                value={b2StakedBalance}
                unit="Matter"
                fontSize="44px"
                height="280px"
              >
                <>
                  <Box sx={{ position: 'absolute', right: '24px', bottom: '34px' }}>
                    {account ? (
                      supportChain ? (
                        <>
                          {b2StakedBalance && +b2StakedBalance > 0 ? (
                            <Box display="flex" gap="8px">
                              <SmallButton
                                sx={{ height: 44, width: 44, borderRadius: '12px', padding: 0 }}
                                onClick={() => {
                                  setDepositB2ModalOpen(true)
                                }}
                              >
                                <svg viewBox="0 0 10 10" width="10" height="10">
                                  <rect y="4" width="10" height="2" fill="white" />
                                  <rect x="6" width="10" height="2" transform="rotate(90 6 0)" fill="white" />
                                </svg>
                              </SmallButton>
                              <SmallButton
                                sx={{ height: 44, width: 44, borderRadius: '12px', padding: 0 }}
                                onClick={() => {
                                  setWithdrawB2ModalOpen(true)
                                }}
                              >
                                <svg viewBox="0 0 10 2" width="10" height="2">
                                  <rect width="10" height="2" fill="white" />
                                </svg>
                              </SmallButton>
                            </Box>
                          ) : (
                            <SmallButton
                              sx={{ height: 44, width: 108, borderRadius: '12px', padding: 0 }}
                              disabled={!canStake}
                              onClick={() => {
                                setDepositB2ModalOpen(true)
                              }}
                            >
                              + Stake
                            </SmallButton>
                          )}
                        </>
                      ) : (
                        <SmallButton onClick={switchToSupportChain}>Switch to B2</SmallButton>
                      )
                    ) : (
                      <SmallButton onClick={toggleWalletModal}>Connect</SmallButton>
                    )}
                  </Box>
                </>
              </NumericalCard>
            </Box>
          </Box>
          <B2StakeInputModal
            type={StakeType.DEPOSIT}
            isOpen={depositB2ModalOpen}
            onDismiss={onDismiss}
            onAction={handleB2Stake}
            balance={b2MatterBalance}
          />
          <StakeActionModal
            title="Withdraw MATTER Tokens"
            buttonActionText="Unstake"
            buttonPendingText="Pending Confirmat..."
            isOpen={withdrawB2ModalOpen}
            onDismiss={onDismiss}
            onAction={handleB2UnStake}
            balance={b2StakedBalance}
          />
          <StakeActionModal
            title="MATTER Claim"
            buttonActionText="Comfirm"
            buttonPendingText="Confirming"
            isOpen={claimModalOpen}
            onDismiss={onDismiss}
            onAction={handleClaimReward}
            balance={b2Earned}
          />
        </>
      )}
    </>
  )
}
