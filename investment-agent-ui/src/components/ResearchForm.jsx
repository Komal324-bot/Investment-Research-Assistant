import React, { useState, useEffect, useMemo } from "react";
import {
  ThemeProvider,
  createTheme,
  GlobalStyles,
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Drawer,
  AppBar,
  Toolbar,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Avatar,
  Stack,
} from "@mui/material";
import {
  History,
  ContentCopy,
  GetApp,
  DarkMode,
  LightMode,
  Close,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  CheckCircleRounded,
  CancelRounded,
} from "@mui/icons-material";
import { analyzeCompany } from "../services/api";
import {
  getHistory,
  clearHistory,
  deleteHistoryItem,
} from "../services/history";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// ---------------------------------------------------------------------------
// Design tokens — an "equity research desk" palette: ink + paper + one
// deliberate accent (emerald), with monospace reserved for figures only so
// prices read like a real quote terminal rather than generic UI text.
// ---------------------------------------------------------------------------
const FONT_STACK = '"Inter", "Helvetica Neue", Arial, sans-serif';
const MONO_STACK = '"IBM Plex Mono", "Roboto Mono", ui-monospace, monospace';

function buildTheme(darkMode) {
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

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

/** One entry in the dense quote strip — label on top, monospace value below. */
function QuoteStat({ label, value, valueColor }) {
  return (
    <Box sx={{ minWidth: 96, px: 2, py: 1 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 11 }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: MONO_STACK,
          fontWeight: 600,
          fontSize: 15,
          mt: 0.25,
          color: valueColor || "text.primary",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function ResearchForm({ darkMode, setDarkMode }) {
  const [company, setCompany] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [includeLiveData, setIncludeLiveData] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const theme = useMemo(() => buildTheme(darkMode), [darkMode]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = async () => {
    if (!company.trim()) {
      setError("Please enter a company name.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const res = await analyzeCompany(company.trim(), includeLiveData);
      setResponse(res.data);
      loadHistory();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    const element = document.getElementById("analysis-content");
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`${response.company}-analysis.pdf`);
  };

  const copyAnalysis = async () => {
    await navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setSnackbar({ open: true, message: "Copied to clipboard", severity: "success" });
  };

  const recommendationTone = (value) => {
    switch ((value || "").toUpperCase()) {
      case "BUY":
        return "success";
      case "SELL":
        return "error";
      default:
        return "warning";
    }
  };

  const riskTone = (risk) => {
    switch ((risk || "").toLowerCase()) {
      case "low":
        return "success";
      case "medium":
        return "warning";
      default:
        return "error";
    }
  };

  const formatPrice = (price) => (price == null ? "N/A" : `$${Number(price).toFixed(2)}`);

  const formatMarketCap = (marketCap) => {
    if (!marketCap) return null;
    const value = Number(marketCap);
    if (Number.isNaN(value)) return null;
    if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const changePercent = response?.stockData?.changePercent;
  const isUp = typeof changePercent === "number" && changePercent > 0;
  const isDown = typeof changePercent === "number" && changePercent < 0;
  const DeltaIcon = isUp ? TrendingUp : isDown ? TrendingDown : TrendingFlat;
  const deltaTone = isUp ? "success.main" : isDown ? "error.main" : "text.secondary";

  const marketCapFormatted = formatMarketCap(response?.marketCap);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles
        styles={`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        `}
      />
      <Box sx={{ bgcolor: "background.default", minHeight: "100%", py: 4 }}>
        <Container maxWidth="lg">
          {/* ---------------------------------------------------------- Masthead */}
          <Box sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2, mb: 4 }}>
            <Toolbar disableGutters>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "8px",
                    bgcolor: "text.primary",
                    color: "background.paper",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: MONO_STACK,
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  IR
                </Box>
                <Box>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ display: "block", lineHeight: 1 }}
                  >
                    Equity Research
                  </Typography>
                  <Typography variant="h5">Investment Research Assistant</Typography>
                </Box>
              </Stack>

              <Tooltip title="Search history">
                <IconButton onClick={() => setHistoryOpen(true)}>
                  <History />
                </IconButton>
              </Tooltip>
              <Tooltip title={darkMode ? "Light mode" : "Dark mode"}>
                <IconButton onClick={() => setDarkMode(!darkMode)}>
                  {darkMode ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Tooltip>
            </Toolbar>
          </Box>

          {/* ---------------------------------------------------------- History drawer */}
          <Drawer anchor="right" open={historyOpen} onClose={() => setHistoryOpen(false)}>
            <Box sx={{ width: 340, p: 3, bgcolor: "background.paper", height: "100%" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Search History</Typography>
                <IconButton size="small" onClick={() => setHistoryOpen(false)}>
                  <Close fontSize="small" />
                </IconButton>
              </Stack>

              <Button
                fullWidth
                color="error"
                variant="outlined"
                size="small"
                disabled={history.length === 0}
                sx={{ mb: 3 }}
                onClick={async () => {
                  await clearHistory();
                  loadHistory();
                }}
              >
                Clear history
              </Button>

              {history.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  No searches yet.
                </Typography>
              ) : (
                <List disablePadding>
                  {history.map((item) => (
                    <ListItem
                      key={item.id}
                      divider
                      sx={{ cursor: "pointer", borderRadius: 1 }}
                      onClick={() => {
                        setCompany(item.companyName);
                        setHistoryOpen(false);
                      }}
                      secondaryAction={
                        <IconButton
                          size="small"
                          color="error"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await deleteHistoryItem(item.id);
                            loadHistory();
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={item.companyName}
                        secondary={new Date(item.createdAt).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Drawer>

          {/* ---------------------------------------------------------- Search panel */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Company name"
                  placeholder="Tesla, Apple, Microsoft…"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAnalyze();
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 7, md: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  disableElevation
                  sx={{ height: 56 }}
                  disabled={loading}
                  onClick={handleAnalyze}
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {loading ? "Analyzing…" : "Analyze"}
                </Button>
              </Grid>

              <Grid size={{ xs: 12, sm: 5, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={includeLiveData}
                      onChange={(e) => setIncludeLiveData(e.target.checked)}
                    />
                  }
                  label="Live market data"
                />
              </Grid>
            </Grid>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* ---------------------------------------------------------- Loading */}
          {loading && (
            <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
              <CircularProgress size={44} thickness={4} />
              <Typography variant="h6" sx={{ mt: 3 }}>
                Analyzing {company}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Pulling live market data and generating investment insights
              </Typography>
            </Paper>
          )}

          {/* ---------------------------------------------------------- Results */}
          {!loading && response && (
            <Box id="analysis-content">
              {/* Ticker header */}
              <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, mb: 3 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={2}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={response.stockData?.logoUrl || undefined}
                      alt={response.company}
                      variant="rounded"
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: "background.default",
                        border: "1px solid",
                        borderColor: "divider",
                        color: "text.secondary",
                        fontFamily: MONO_STACK,
                        fontWeight: 600,
                      }}
                    >
                      {(response.company || "?").charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h5">{response.company}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {[response.stockData?.symbol, response.stockData?.exchange]
                          .filter(Boolean)
                          .join(" · ")}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={3} alignItems="baseline">
                    <Typography sx={{ fontFamily: MONO_STACK, fontWeight: 700, fontSize: 30 }}>
                      {formatPrice(response.stockData?.currentPrice)}
                    </Typography>
                    {changePercent !== undefined && (
                      <Chip
                        icon={<DeltaIcon sx={{ fontSize: "16px !important" }} />}
                        label={`${Math.abs(changePercent).toFixed(2)}%`}
                        size="small"
                        sx={{
                          bgcolor: isUp ? "success.main" : isDown ? "error.main" : "action.hover",
                          color: isUp || isDown ? "#fff" : "text.secondary",
                          fontFamily: MONO_STACK,
                          fontWeight: 700,
                          fontSize: 13,
                          "& .MuiChip-icon": { color: "inherit" },
                        }}
                      />
                    )}
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <IconButton size="small" onClick={copyAnalysis}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={exportPDF}>
                        <GetApp fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Dense quote strip */}
                <Stack direction="row" flexWrap="wrap" sx={{ mx: -2 }}>
                  <QuoteStat label="Open" value={formatPrice(response.stockData?.open)} />
                  <QuoteStat label="Prev Close" value={formatPrice(response.stockData?.previousClose)} />
                  <QuoteStat label="Day High" value={formatPrice(response.stockData?.high)} />
                  <QuoteStat label="Day Low" value={formatPrice(response.stockData?.low)} />
                  <QuoteStat label="52W High" value={formatPrice(response.stockData?.weekHigh52)} />
                  <QuoteStat label="52W Low" value={formatPrice(response.stockData?.weekLow52)} />
                  <QuoteStat
                    label="Volume"
                    value={
                      response.stockData?.volume != null
                        ? Number(response.stockData.volume).toLocaleString()
                        : "N/A"
                    }
                  />
                  {marketCapFormatted && <QuoteStat label="Market Cap" value={marketCapFormatted} />}
                </Stack>
              </Paper>

              {/* Overview */}
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  Company Overview
                </Typography>
                <Typography sx={{ mt: 1, lineHeight: 1.75 }}>{response.companyOverview}</Typography>
              </Paper>

              {/* Recommendation — verdict card with left rule */}
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  mb: 3,
                  borderLeft: "4px solid",
                  borderLeftColor: `${recommendationTone(response.recommendation)}.main`,
                }}
              >
                <Typography variant="overline" color="text.secondary">
                  Recommendation
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1, mb: 1.5 }}>
                  <Chip
                    label={response.recommendation}
                    color={recommendationTone(response.recommendation)}
                    sx={{ fontSize: 14, letterSpacing: "0.04em", height: 30, px: 1 }}
                  />
                </Stack>
                <Typography sx={{ lineHeight: 1.75 }}>{response.reason}</Typography>
              </Paper>

              {/* Risk & growth */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
                    <Typography variant="overline" color="text.secondary">
                      Risk Level
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={response.riskLevel}
                        color={riskTone(response.riskLevel)}
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
                    <Typography variant="overline" color="text.secondary">
                      Growth Potential
                    </Typography>
                    <Typography sx={{ mt: 1 }}>{response.growthPotential}</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Pros & Cons */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
                    <Typography variant="overline" color="success.main">
                      Strengths
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <List dense disablePadding>
                      {response.pros?.map((item, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckCircleRounded color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
                    <Typography variant="overline" color="error.main">
                      Risks
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <List dense disablePadding>
                      {response.cons?.map((item, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CancelRounded color="error" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}