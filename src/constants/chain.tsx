import { Chain } from 'models/chain'
import { ReactComponent as ETH } from 'assets/svg/eth_logo.svg'
import MatterUrl from 'assets/images/favicon.png'
import EthUrl from 'assets/svg/eth_logo.svg'

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  MATTER = 20221,
  MATTERMAINNET = 1990
}

export const NETWORK_CHAIN_ID: ChainId = process.env.REACT_APP_CHAIN_ID
  ? parseInt(process.env.REACT_APP_CHAIN_ID)
  : ChainId.MAINNET

export const ChainList = [
  {
    icon: <ETH />,
    logo: EthUrl,
    symbol: 'ETH',
    name: 'ETH Network',
    id: ChainId.MAINNET,
    hex: '0x1'
  },
  {
    icon: '',
    logo: MatterUrl,
    symbol: 'Matter',
    name: 'Antimatter B2 Network',
    id: ChainId.MATTER,
    hex: '0x4efd'
  },
  {
    icon: '',
    logo: MatterUrl,
    symbol: 'Matter',
    name: 'Antimatter B2 Network',
    id: ChainId.MATTERMAINNET,
    hex: '0x7c6'
  },
  {
    icon: <ETH />,
    logo: EthUrl,
    symbol: 'Ropsten',
    name: 'Ropsten Test Network',
    id: ChainId.ROPSTEN,
    hex: '0x3'
  },
  {
    icon: <ETH />,
    logo: EthUrl,
    symbol: 'Rinkeby',
    name: 'Rinkeby Testnet',
    id: ChainId.RINKEBY,
    hex: '0x4'
  },
  {
    icon: <ETH />,
    logo: EthUrl,
    symbol: 'Goerli',
    name: 'Goerli Testnet',
    id: ChainId.GÖRLI,
    hex: '0x5'
  },
  {
    icon: <ETH />,
    logo: EthUrl,
    symbol: 'Kovan',
    name: 'Kovan Testnet',
    id: ChainId.KOVAN,
    hex: '0x2a'
  }
]

export const ChainListMap: {
  [key: number]: { icon: JSX.Element; link?: string; selectedIcon?: JSX.Element } & Chain
} = ChainList.reduce((acc, item) => {
  acc[item.id] = item
  return acc
}, {} as any)

export const SUPPORTED_NETWORKS: {
  [chainId in ChainId]?: {
    chainId: string
    chainName: string
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
    rpcUrls: string[]
    blockExplorerUrls: string[]
  }
} = {
  [ChainId.MAINNET]: {
    chainId: '0x1',
    chainName: 'Ethereum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3'],
    blockExplorerUrls: ['https://etherscan.com']
  },
  [ChainId.ROPSTEN]: {
    chainId: '0x3',
    chainName: 'Ropsten',
    nativeCurrency: {
      name: 'Ropsten',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://ropsten.infura.io/v3/'],
    blockExplorerUrls: ['https://ropsten.etherscan.io/']
  },
  [ChainId.RINKEBY]: {
    chainId: '0x4',
    chainName: 'Rinkeby',
    nativeCurrency: {
      name: 'Rinkeby',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://rinkeby.infura.io/v3/'],
    blockExplorerUrls: ['https://rinkeby.etherscan.io/']
  },
  [ChainId.KOVAN]: {
    chainId: '0x2a',
    chainName: 'Kovan',
    nativeCurrency: {
      name: 'Kovan',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://kovan.infura.io/v3/'],
    blockExplorerUrls: ['https://kovan.etherscan.io/']
  },
  [ChainId.GÖRLI]: {
    chainId: '0x5',
    chainName: 'Goerli',
    nativeCurrency: {
      name: 'Goerli ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://goerli.infura.io/v3/'],
    blockExplorerUrls: ['https://goerli.etherscan.io/']
  },
  [ChainId.MATTER]: {
    chainId: '0x4efd',
    chainName: 'b2',
    nativeCurrency: {
      name: 'Antimatter B2 Network',
      symbol: 'Matter',
      decimals: 18
    },
    rpcUrls: ['https://bastest-rpc.antimatter.finance/'],
    blockExplorerUrls: ['https://bastest-explorer.antimatter.finance/']
  },
  [ChainId.MATTERMAINNET]: {
    chainId: '0x7c6',
    chainName: 'b2',
    nativeCurrency: {
      name: 'Antimatter B2 Network',
      symbol: 'Matter',
      decimals: 18
    },
    rpcUrls: ['https://rpc.antimatter.finance/'],
    blockExplorerUrls: ['https://b2-explorer.antimatter.finance/']
  }
}
