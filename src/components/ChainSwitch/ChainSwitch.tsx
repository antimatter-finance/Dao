import { Box, Typography, styled, useTheme } from '@mui/material'
import { OutlinedCard } from 'components/Card/Card'
import Image from 'components/Image'
import SwitchButton from 'components/Select/ChainSwap/SwitcherButton'
import { Chain } from 'models/chain'

interface Props {
  fromChain: Chain | null
  toChain: Chain | null
  height?: string | number
  toSwitch?: () => void
}

const Label = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: 12,
  fontWeight: 500
}))

export default function ChainSwitch(props: Props) {
  const { fromChain, toChain, height, toSwitch } = props
  const theme = useTheme()

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
          position: 'relative',
          gap: 8,
          mt: 24
        }}
      >
        <Box width="100%">
          <Label sx={{ mb: 8 }}>Send</Label>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'column',
          width: '100%',
          alignItems: 'stretch',
          position: 'relative',
          gap: 8
        }}
      >
        <Box width="100%">
          <OutlinedCard width="100%" color={theme.textColor.text4} style={{ height: '100%' }}>
            <Box
              display="grid"
              gap="8px"
              padding="12px 16px"
              width="100%"
              height={height || '100%'}
              gridTemplateRows="auto 1fr"
            >
              <Image src={fromChain?.logo || ''} style={{ height: 28, width: 28, objectFit: 'contain' }} />
              <Typography variant="inherit" sx={{ fontSize: 12 }}>
                {fromChain?.name || ''}
              </Typography>
            </Box>
          </OutlinedCard>
        </Box>
        <Box
          onClick={toSwitch}
          sx={{
            position: 'absolute',
            left: '50%',
            top: '43%',
            transform: 'rotate(90deg)'
          }}
        >
          <SwitchButton />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center',
            position: 'relative',
            gap: 8,
            mt: 20
          }}
        >
          <Box width="100%">
            <Label>To</Label>
          </Box>
        </Box>
        <Box width="100%">
          <OutlinedCard width="100%" color={theme.textColor.text4} style={{ height: '100%' }}>
            <Box
              display="grid"
              gap="8px"
              padding="12px 16px"
              width="100%"
              height={height || '100%'}
              gridTemplateRows="auto 1fr"
            >
              <Image src={toChain?.logo || ''} style={{ height: 28, width: 28, objectFit: 'contain' }} />
              <Typography variant="inherit" sx={{ fontSize: 12 }}>
                {toChain?.name || ''}
              </Typography>
            </Box>
          </OutlinedCard>
        </Box>
      </Box>
    </>
  )
}
