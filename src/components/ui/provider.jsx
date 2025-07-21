'use client'

import { ChakraProvider, createSystem, defineConfig } from '@chakra-ui/react'
import { ColorModeProvider } from './color-mode'

// Dark theme configuration
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        bg: {
          value: "#0A0A0B"
        },
        fg: {
          value: "#FFFFFF"
        }
      }
    },
    globalCss: {
      body: {
        bg: "#0A0A0B",
        color: "#FFFFFF"
      }
    }
  }
})

const system = createSystem(config)

export function Provider(props) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
