'use client'

import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { ColorModeProvider } from './color-mode'

// Dark theme configuration for Chakra UI v2
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#0088CD', // Main brand color
      600: '#1976d2',
      700: '#1565c0',
      800: '#0d47a1',
      900: '#0277bd',
    },
  },
  styles: {
    global: {
      body: {
        bg: "#0A0A0B",
        color: "#FFFFFF"
      }
    }
  }
})

export function Provider(props) {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
