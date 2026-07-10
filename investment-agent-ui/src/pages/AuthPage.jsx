import React, { useState } from "react";
import {
  ThemeProvider,
  GlobalStyles,
  Box,
  Paper,
  Typography,
  IconButton,
  Alert,
  Stack,
  Tooltip,
  Link,
} from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { buildTheme, MONO_STACK } from "../theme";
import { useAuth } from "../context/AuthContext";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

// A self-contained candlestick/line-chart motif so the login page never
// depends on an external image request (and never risks a licensed photo).
function buildFinanceBackgroundSvg(darkMode) {
  const stroke = darkMode ? "#22B27D" : "#0F6F5C";
  const grid = darkMode ? "#233047" : "#D0D5DD";
  const bg = darkMode ? "#0B1220" : "#F5F6F8";
  const up = darkMode ? "#22B27D" : "#0F6F5C";
  const down = darkMode ? "#E5675F" : "#B3261E";

  const candles = [
    [80, 520, 640, "up"], [140, 560, 500, "down"], [200, 480, 610, "up"],
    [260, 440, 560, "up"], [320, 500, 470, "down"], [380, 420, 500, "up"],
    [440, 380, 460, "up"], [500, 410, 400, "down"], [560, 340, 410, "up"],
    [620, 300, 360, "up"], [680, 330, 300, "down"], [740, 260, 330, "up"],
    [800, 220, 270, "up"], [860, 250, 230, "down"], [920, 180, 250, "up"],
    [980, 150, 200, "up"], [1040, 190, 160, "down"], [1100, 120, 190, "up"],
    [1160, 90, 140, "up"], [1220, 130, 100, "down"], [1280, 60, 130, "up"],
    [1340, 40, 80, "up"], [1400, 80, 50, "down"], [1460, 20, 80, "up"],
  ];

  const bars = candles
    .map(([x, top, bottom, dir]) => {
      const color = dir === "up" ? up : down;
      const wickX = x + 16;
      return `
        <line x1="${wickX}" y1="${top - 14}" x2="${wickX}" y2="${bottom + 14}" stroke="${color}" stroke-width="2.5" opacity="0.7" />
        <rect x="${x}" y="${Math.min(top, bottom)}" width="32" height="${Math.abs(bottom - top)}" fill="${color}" opacity="0.6" rx="2" />
      `;
    })
    .join("");

  const gridLines = Array.from({ length: 9 })
    .map((_, i) => `<line x1="0" y1="${i * 100 + 20}" x2="1600" y2="${i * 100 + 20}" stroke="${grid}" stroke-width="1.5" opacity="0.5" />`)
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      <rect width="1600" height="900" fill="${bg}" />
      ${gridLines}
      <polyline points="80,600 200,540 380,470 560,400 740,320 920,250 1100,180 1280,110 1460,60"
        fill="none" stroke="${stroke}" stroke-width="3.5" opacity="0.5" />
      ${bars}
    </svg>
  `;
}

export default function AuthPage({ darkMode, setDarkMode }) {
  const theme = React.useMemo(() => buildTheme(darkMode), [darkMode]);
  const { authError, clearAuthError } = useAuth();
  const [mode, setMode] = useState("login");

  const financeBackground = React.useMemo(
    () =>
      `url("data:image/svg+xml,${encodeURIComponent(
        buildFinanceBackgroundSvg(darkMode)
      )}")`,
    [darkMode]
  );

  const switchMode = (nextMode) => {
    clearAuthError();
    setMode(nextMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles
        styles={`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        `}
      />
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          px: 2,
          // Simply increased opacity of the overlays
          backgroundImage: (t) =>
            t.palette.mode === "dark"
              ? `radial-gradient(circle at 15% 15%, rgba(34,178,125,0.25), transparent 50%), radial-gradient(circle at 85% 85%, rgba(34,178,125,0.2), transparent 50%), linear-gradient(rgba(11,18,32,0.6), rgba(11,18,32,0.8)), ${financeBackground}`
              : `radial-gradient(circle at 15% 15%, rgba(15,111,92,0.15), transparent 50%), radial-gradient(circle at 85% 85%, rgba(15,111,92,0.1), transparent 50%), linear-gradient(rgba(245,246,248,0.7), rgba(245,246,248,0.85)), ${financeBackground}`,
          backgroundSize: "cover, cover, cover, cover",
          backgroundPosition: "center, center, center, center",
          backgroundRepeat: "no-repeat, no-repeat, no-repeat, no-repeat",
        }}
      >
        <Tooltip title={darkMode ? "Light mode" : "Dark mode"}>
          <IconButton
            onClick={() => setDarkMode(!darkMode)}
            sx={{ 
              position: "absolute", 
              top: 20, 
              right: 20,
              bgcolor: "background.paper",
            }}
          >
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>

        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 420,
            p: { xs: 3.5, sm: 5 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            // Added slight transparency
            bgcolor: (t) => t.palette.mode === "dark" 
              ? "rgba(11, 18, 32, 0.85)" 
              : "rgba(255, 255, 255, 0.85)",
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "10px",
                bgcolor: "text.primary",
                color: "background.paper",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: MONO_STACK,
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              IR
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: "block", lineHeight: 1 }}
              >
                Equity Research
              </Typography>
              <Typography variant="h5">Investment Research Assistant</Typography>
            </Box>
          </Box>

          {authError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearAuthError}>
              {authError}
            </Alert>
          )}

          {mode === "login" ? <LoginForm /> : <RegisterForm />}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "block", textAlign: "center", mt: 3.5 }}
          >
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => switchMode("register")}
                  sx={{ fontWeight: 600 }}
                >
                  Create one
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => switchMode("login")}
                  sx={{ fontWeight: 600 }}
                >
                  Sign in
                </Link>
              </>
            )}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", textAlign: "center", mt: 2 }}
          >
            Secured with JWT
          </Typography>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}