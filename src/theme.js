// theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: "#E6F3FF",
      100: "#CCE7FF",
      200: "#99CFFF",
      300: "#66B7FF",
      400: "#339FFF",
      500: "#0088CD", // Your main button color
      600: "#0066A3",
      700: "#004D7A",
      800: "#003D5C",
      900: "#002A40",
    },
    gray: {
      50: "#F7FAFC",
      700: "#2A2A2F",
      800: "#1A1A1D",
      900: "#0A0A0B",
    },
  },
  styles: {
    global: {
      body: {
        bg: "#0A0A0B",
        color: "#FFFFFF",
      },
    },
  },
});

export default theme;
