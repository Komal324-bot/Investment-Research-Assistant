import { createTheme } from "@mui/material";

export const FONT_STACK = '"Inter", "Helvetica Neue", Arial, sans-serif';
export const MONO_STACK = '"IBM Plex Mono", "Roboto Mono", ui-monospace, monospace';

export function buildTheme(darkMode) {
  return createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      background: {
        default: darkMode ? "#0B1220" : "#F5F6F8",
        paper: darkMode ? "#121A2B" : "#FFFFFF",
      },
      text: {
        primary: darkMode ? "#E7ECF3" : "#0B1220",
        secondary: darkMode ? "#93A0B4" : "#5B6472",
      },
      divider: darkMode ? "#233047" : "#E3E7ED",
      primary: { main: darkMode ? "#22B27D" : "#0F6F5C" },
      success: { main: darkMode ? "#22B27D" : "#0F6F5C" },
      error: { main: darkMode ? "#E5675F" : "#B3261E" },
      warning: { main: darkMode ? "#E0AC4E" : "#B7791F" },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: FONT_STACK,
      h4: { fontWeight: 700, letterSpacing: "-0.02em" },
      h5: { fontWeight: 700, letterSpacing: "-0.01em" },
      h6: { fontWeight: 700 },
      overline: { fontWeight: 700, letterSpacing: "0.08em" },
    },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 700 } } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8 } } },
    },
  });
}
