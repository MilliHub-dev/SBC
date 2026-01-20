// theme.js - Blockchain themed Chakra UI configuration
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: {
    // Cyber/Blockchain accent colors
    cyber: {
      cyan: "#00FFFF",
      purple: "#A855F7",
      blue: "#3B82F6",
      green: "#10B981",
      pink: "#EC4899",
      orange: "#F97316",
      yellow: "#FBBF24",
    },
    // Brand colors - Cyan focused for blockchain feel
    brand: {
      50: "#E6FFFF",
      100: "#CCFFFF",
      200: "#99FFFF",
      300: "#66FFFF",
      400: "#33FFFF",
      500: "#00FFFF",
      600: "#00CCCC",
      700: "#009999",
      800: "#006666",
      900: "#003333",
    },
    // Updated gray palette for dark theme
    gray: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#1e293b",
      800: "#0f172a",
      900: "#0a0a0f",
      950: "#020617",
    },
    // Dark backgrounds
    dark: {
      50: "#1a1a2e",
      100: "#16162a",
      200: "#121226",
      300: "#0f0f22",
      400: "#0c0c1e",
      500: "#0a0a1a",
      600: "#080816",
      700: "#060612",
      800: "#04040e",
      900: "#0a0a0f",
    },
  },
  fonts: {
    heading: "'Space Grotesk', 'Inter', sans-serif",
    body: "'Inter', 'Space Grotesk', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  styles: {
    global: {
      body: {
        bg: "#0a0a0f",
        color: "#f8fafc",
        lineHeight: "1.6",
      },
      "*::placeholder": {
        color: "whiteAlpha.400",
      },
      "*, *::before, *::after": {
        borderColor: "whiteAlpha.100",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "600",
        borderRadius: "xl",
        transition: "all 0.3s ease",
      },
      variants: {
        cyber: {
          bg: "linear-gradient(135deg, #00FFFF 0%, #A855F7 100%)",
          color: "#0a0a0f",
          _hover: {
            transform: "translateY(-2px)",
            boxShadow: "0 0 30px rgba(0, 255, 255, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)",
          },
          _active: {
            transform: "translateY(0)",
          },
        },
        cyberOutline: {
          bg: "transparent",
          color: "cyber.cyan",
          border: "2px solid",
          borderColor: "cyber.cyan",
          _hover: {
            bg: "rgba(0, 255, 255, 0.1)",
            boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
          },
        },
        glass: {
          bg: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "white",
          _hover: {
            bg: "rgba(15, 23, 42, 0.8)",
            borderColor: "rgba(0, 255, 255, 0.3)",
          },
        },
        solid: {
          bg: "brand.500",
          color: "#0a0a0f",
          _hover: {
            bg: "brand.400",
            transform: "translateY(-1px)",
            boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
          },
        },
        ghost: {
          color: "whiteAlpha.800",
          _hover: {
            bg: "whiteAlpha.100",
            color: "cyber.cyan",
          },
        },
        outline: {
          borderColor: "whiteAlpha.300",
          color: "white",
          _hover: {
            bg: "whiteAlpha.100",
            borderColor: "cyber.cyan",
          },
        },
      },
      defaultProps: {
        variant: "solid",
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 10, 15, 0.95) 100%)",
          borderRadius: "xl",
          border: "1px solid rgba(0, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          transition: "all 0.3s ease",
          _hover: {
            borderColor: "rgba(0, 255, 255, 0.3)",
            boxShadow: "0 0 30px rgba(0, 255, 255, 0.1), 0 20px 40px rgba(0, 0, 0, 0.3)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    Input: {
      variants: {
        cyber: {
          field: {
            bg: "rgba(15, 23, 42, 0.6)",
            border: "1px solid",
            borderColor: "whiteAlpha.200",
            borderRadius: "xl",
            color: "white",
            _placeholder: {
              color: "whiteAlpha.400",
            },
            _hover: {
              borderColor: "whiteAlpha.300",
            },
            _focus: {
              borderColor: "cyber.cyan",
              boxShadow: "0 0 0 1px #00FFFF",
            },
          },
        },
        filled: {
          field: {
            bg: "whiteAlpha.100",
            borderRadius: "xl",
            _hover: {
              bg: "whiteAlpha.200",
            },
            _focus: {
              bg: "whiteAlpha.100",
              borderColor: "cyber.cyan",
            },
          },
        },
      },
      defaultProps: {
        variant: "cyber",
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0, 255, 255, 0.1)",
          borderRadius: "2xl",
        },
        overlay: {
          bg: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
        },
      },
    },
    Tabs: {
      variants: {
        cyber: {
          tab: {
            color: "whiteAlpha.600",
            fontWeight: "500",
            _selected: {
              color: "cyber.cyan",
              borderBottomColor: "cyber.cyan",
            },
            _hover: {
              color: "white",
            },
          },
          tablist: {
            borderBottomColor: "whiteAlpha.100",
          },
        },
      },
    },
    Badge: {
      variants: {
        cyber: {
          bg: "rgba(0, 255, 255, 0.1)",
          color: "cyber.cyan",
          border: "1px solid",
          borderColor: "cyber.cyan",
          borderRadius: "full",
        },
        success: {
          bg: "rgba(16, 185, 129, 0.1)",
          color: "cyber.green",
          border: "1px solid",
          borderColor: "cyber.green",
        },
        warning: {
          bg: "rgba(251, 191, 36, 0.1)",
          color: "cyber.yellow",
          border: "1px solid",
          borderColor: "cyber.yellow",
        },
        error: {
          bg: "rgba(239, 68, 68, 0.1)",
          color: "red.400",
          border: "1px solid",
          borderColor: "red.400",
        },
      },
    },
    Tooltip: {
      baseStyle: {
        bg: "gray.800",
        color: "white",
        borderRadius: "lg",
        border: "1px solid",
        borderColor: "whiteAlpha.100",
        px: 3,
        py: 2,
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: "gray.800",
          border: "1px solid",
          borderColor: "whiteAlpha.100",
          borderRadius: "xl",
          py: 2,
        },
        item: {
          bg: "transparent",
          _hover: {
            bg: "whiteAlpha.100",
          },
          _focus: {
            bg: "whiteAlpha.100",
          },
        },
      },
    },
    Accordion: {
      baseStyle: {
        container: {
          border: "none",
        },
        button: {
          _hover: {
            bg: "whiteAlpha.50",
          },
        },
        panel: {
          pb: 4,
        },
      },
    },
    Progress: {
      baseStyle: {
        track: {
          bg: "whiteAlpha.100",
          borderRadius: "full",
        },
        filledTrack: {
          bg: "linear-gradient(90deg, #00FFFF, #A855F7)",
          borderRadius: "full",
        },
      },
    },
  },
  layerStyles: {
    glass: {
      bg: "rgba(15, 23, 42, 0.6)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    card: {
      bg: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 10, 15, 0.95) 100%)",
      border: "1px solid rgba(0, 255, 255, 0.1)",
      borderRadius: "xl",
      backdropFilter: "blur(10px)",
    },
    gradientBorder: {
      position: "relative",
      _before: {
        content: '""',
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        padding: "1px",
        background: "linear-gradient(135deg, #00FFFF, #A855F7, #EC4899)",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
      },
    },
  },
  textStyles: {
    gradient: {
      bgGradient: "linear(135deg, cyber.cyan, cyber.purple, cyber.pink)",
      bgClip: "text",
    },
    glow: {
      textShadow: "0 0 20px rgba(0, 255, 255, 0.5)",
    },
  },
  shadows: {
    glowCyan: "0 0 20px rgba(0, 255, 255, 0.3), 0 0 40px rgba(0, 255, 255, 0.1)",
    glowPurple: "0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.1)",
    glowBlue: "0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)",
    card: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)",
    cardHover: "0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 255, 255, 0.1)",
  },
});

export default theme;
