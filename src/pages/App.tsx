import { Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { styled } from '@mui/material'
import Header from '../components/Header'
import Polling from '../components/essential/Polling'
import Popups from '../components/essential/Popups'
import Web3ReactManager from '../components/essential/Web3ReactManager'
import WarningModal from '../components/Modal/WarningModal'
import Dashboard from './Dashboard'
import TradingRewards from './TradingRewards'
import Bridge from './Bridge'
import { ModalProvider } from 'context/ModalContext'
import { routes } from 'constants/routes'
import Stake from './Stake'
import Bond from './Bond'
import MyAccount from './MyAccount'
import ComingSoonModal from 'components/Modal/ComingSoonModal'

const AppWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  overflowX: 'hidden',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    height: '100vh'
  }
}))

const ContentWrapper = styled('div')({
  width: '100%',
  maxHeight: '100vh',
  overflow: 'auto',
  alignItems: 'center'
})

const BodyWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minHeight: `calc(100vh - ${theme.height.header})`,
  padding: `50px 32px 80px calc(${theme.width.sidebar} + 32px)`,
  justifyContent: 'flex-start',
  alignItems: 'center',
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    padding: `20px 0 80px`
  }
}))

export default function App() {
  return (
    <Suspense fallback={null}>
      <ModalProvider>
        <AppWrapper id="app">
          <ComingSoonModal />
          <ContentWrapper>
            <Header />
            <BodyWrapper id="body">
              <Popups />
              <Polling />
              <WarningModal />
              <Web3ReactManager>
                <Switch>
                  <Route exact strict path={routes.dashboard} component={Dashboard} />
                  <Route exact strict path={routes.trading_rewards} component={TradingRewards} />
                  <Route exact strict path={routes.stake} component={Stake} />
                  <Route exact strict path={routes.bond} component={Bond} />
                  <Route exact strict path={routes.bridge} component={Bridge} />
                  <Route exact strict path={routes.myaccount} component={MyAccount} />
                  <Route path="/">
                    <Redirect to={routes.dashboard} />
                  </Route>
                </Switch>
              </Web3ReactManager>
            </BodyWrapper>
          </ContentWrapper>
        </AppWrapper>
      </ModalProvider>
    </Suspense>
  )
}
