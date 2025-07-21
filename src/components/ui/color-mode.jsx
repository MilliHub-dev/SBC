'use client'

import * as React from 'react'
import { LuMoon, LuSun } from 'react-icons/lu'

export function ColorModeProvider({ children }) {
  return children
}

export function useColorMode() {
  // Simple implementation for dark mode
  const [colorMode, setColorMode] = React.useState('dark')
  
  const toggleColorMode = () => {
    setColorMode(prevMode => prevMode === 'dark' ? 'light' : 'dark')
  }

  return {
    colorMode,
    setColorMode,
    toggleColorMode,
  }
}

export function useColorModeValue(light, dark) {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? dark : light
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? <LuMoon /> : <LuSun />
}

export const ColorModeButton = React.forwardRef(
  function ColorModeButton(props, ref) {
    const { toggleColorMode } = useColorMode()
    return (
      <button
        onClick={toggleColorMode}
        aria-label='Toggle color mode'
        ref={ref}
        {...props}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '4px',
          ...props.style
        }}
      >
        <ColorModeIcon />
      </button>
    )
  },
)

export const LightMode = React.forwardRef(function LightMode(props, ref) {
  return (
    <div
      style={{ color: 'black', backgroundColor: 'white' }}
      ref={ref}
      {...props}
    />
  )
})

export const DarkMode = React.forwardRef(function DarkMode(props, ref) {
  return (
    <div
      style={{ color: 'white', backgroundColor: '#1a202c' }}
      ref={ref}
      {...props}
    />
  )
})
