import React, { useState, useEffect, useMemo } from "react";
import {
  ThemeProvider,
  GlobalStyles,
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Drawer,
  Toolbar,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Avatar,
  Stack,
  Skeleton,
  Badge,
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
  Star,
  StarBorder,
  InfoOutlined,
  Bolt,
  Logout,
  AccountCircle,
} from "@mui/icons-material";
import { analyzeCompany } from "../services/api";
import {
  getHistory,
  clearHistory,
  deleteHistoryItem,
  togglePin,
} from "../services/history";
import { generateAnalysisPdf } from "../utils/generatePdfReport";
import { formatPrice, formatMarketCap, recommendationTone } from "../utils/format";
import PriceChart from "./PriceChart";
import NewsFeed from "./NewsFeed";
import InvestmentScoreCard from "./InvestmentScoreCard";
import PriceTargetCard from "./PriceTargetCard";
import RiskGauge from "./RiskGauge";
import SwotGrid from "./SwotGrid";
import CompetitorTable from "./CompetitorTable";
import Watchlist from "./Watchlist";
import { buildTheme, FONT_STACK, MONO_STACK } from "../theme";
import { useAuth } from "../context/AuthContext";

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
  const { username, logout } = useAuth();
  const [company, setCompany] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [includeLiveData, setIncludeLiveData] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const theme = useMemo(() => buildTheme(darkMode), [darkMode]);
  const watchlistItems = useMemo(() => history.filter((item) => item.pinned), [history]);

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

  const handleTogglePin = async (id, pinned) => {
    setHistory((prev) => prev.map((item) => (item.id === id ? { ...item, pinned } : item)));
    try {
      await togglePin(id, pinned);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Couldn't update watchlist", severity: "error" });
      loadHistory(); 
    }
  };

  const exportPDF = () => {
    if (!response) return;
    try {
      generateAnalysisPdf(response);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Couldn't generate PDF", severity: "error" });
    }
  };

  const copyAnalysis = async () => {
    await navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setSnackbar({ open: true, message: "Copied to clipboard", severity: "success" });
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
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
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
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="h5">Investment Research Assistant</Typography>
          
        </Stack>
      </Box>
    </Stack>

    <Tooltip title="Watchlist">
      <IconButton onClick={() => setWatchlistOpen(true)}>
        <Badge badgeContent={watchlistItems.length} color="primary">
          <Star />
        </Badge>
      </IconButton>
    </Tooltip>
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
    <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1 }} />
    <Chip
      icon={<AccountCircle />}
      label={username || "Account"}
      variant="outlined"
      sx={{ fontFamily: MONO_STACK, mr: 1 }}
    />
    <Tooltip title="Log out">
      <IconButton onClick={logout}>
        <Logout />
      </IconButton>
    </Tooltip>
  </Toolbar>
</Box>

          {/* ---------------------------------------------------------- Watchlist drawer */}
          <Watchlist
            open={watchlistOpen}
            onClose={() => setWatchlistOpen(false)}
            items={watchlistItems}
            theme={theme}
            onUnpin={(id) => handleTogglePin(id, false)}
            onSelect={(name) => {
              setCompany(name);
              setWatchlistOpen(false);
            }}
          />

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
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title={item.pinned ? "Remove from watchlist" : "Add to watchlist"}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePin(item.id, !item.pinned);
                              }}
                            >
                              {item.pinned ? (
                                <Star fontSize="small" sx={{ color: "warning.main" }} />
                              ) : (
                                <StarBorder fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
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
                        </Stack>
                      }
                    >
                      <ListItemText
                        primary={item.companyName}
                        secondary={new Date(item.createdAt).toLocaleString()}
                        sx={{ pr: 8 }}
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
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={includeLiveData}
                        onChange={(e) => setIncludeLiveData(e.target.checked)}
                      />
                    }
                    label="Live market data"
                    sx={{ mr: 0.25 }}
                  />
                  <Tooltip
                    title={
                      includeLiveData
                        ? "Pulls real-time price, volume, and 52-week range into the analysis."
                        : "Live data is off — the AI will estimate figures from its own knowledge, which is faster but less current and precise."
                    }
                  >
                    <InfoOutlined sx={{ fontSize: 17, color: "text.secondary", cursor: "pointer" }} />
                  </Tooltip>
                </Stack>
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
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <CircularProgress size={18} thickness={5} />
                <Typography variant="body2" color="text.secondary">
                  Analyzing {company} — pulling market data and generating insights…
                </Typography>
              </Stack>

              {/* Ticker header skeleton */}
              <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="rounded" width={56} height={56} />
                    <Box>
                      <Skeleton variant="text" width={160} height={28} />
                      <Skeleton variant="text" width={100} height={18} />
                    </Box>
                  </Stack>
                  <Skeleton variant="text" width={100} height={36} />
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={4}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Box key={i}>
                      <Skeleton variant="text" width={50} height={14} />
                      <Skeleton variant="text" width={60} height={20} />
                    </Box>
                  ))}
                </Stack>
              </Paper>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 8 }}>
                  <Stack spacing={3}>
                    <Skeleton variant="rounded" height={300} />
                    <Skeleton variant="rounded" height={110} />
                    <Skeleton variant="rounded" height={130} />
                    <Skeleton variant="rounded" height={220} />
                    <Skeleton variant="rounded" height={180} />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <Stack spacing={3}>
                    <Skeleton variant="rounded" height={170} />
                    <Skeleton variant="rounded" height={150} />
                    <Skeleton variant="rounded" height={190} />
                    <Skeleton variant="rounded" height={240} />
                  </Stack>
                </Grid>
              </Grid>
            </Box>
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
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h5">{response.company}</Typography>
                        {!response.stockData && (
                          <Tooltip title="This analysis was generated without live market data — figures are the AI's own estimates.">
                            <Chip
                              icon={<Bolt sx={{ fontSize: "14px !important" }} />}
                              label="Estimated"
                              size="small"
                              variant="outlined"
                              color="warning"
                              sx={{ height: 22, fontSize: 11 }}
                            />
                          </Tooltip>
                        )}
                      </Stack>
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
                      <Tooltip title="Copy analysis as JSON">
                        <IconButton size="small" onClick={copyAnalysis}>
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download PDF">
                        <IconButton size="small" onClick={exportPDF}>
                          <GetApp fontSize="small" />
                        </IconButton>
                      </Tooltip>
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

    
              <Grid container spacing={3}>
                {/* ---------------------------------------------- Main column */}
                <Grid size={{ xs: 12, lg: 8 }}>
                  <Stack spacing={3}>
                    <PriceChart company={response.company} accentColor={theme.palette.primary.main} />

                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <Typography variant="overline" color="text.secondary">
                        Company Overview
                      </Typography>
                      <Typography sx={{ mt: 1, lineHeight: 1.75 }}>
                        {response.companyOverview}
                      </Typography>
                    </Paper>

                    {/* Recommendation — verdict card with left rule */}
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
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

                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <Typography variant="overline" color="text.secondary">
                        Growth Potential
                      </Typography>
                      <Typography sx={{ mt: 1, lineHeight: 1.75 }}>
                        {response.growthPotential}
                      </Typography>
                    </Paper>

                    <SwotGrid
                      strengths={response.pros}
                      weaknesses={response.cons}
                      opportunities={response.opportunities}
                      threats={response.threats}
                      theme={theme}
                    />

                    <CompetitorTable
                      company={response.company}
                      competitorDetails={response.competitorDetails}
                      competitors={response.competitors}
                    />
                  </Stack>
                </Grid>

                {/* ---------------------------------------------- Sidebar rail */}
                <Grid size={{ xs: 12, lg: 4 }}>
                  <Stack spacing={3}>
                    <InvestmentScoreCard score={response.investmentScore} theme={theme} />
                    <PriceTargetCard
                      currentPrice={response.stockData?.currentPrice}
                      priceTarget={response.priceTarget}
                      upsidePercent={response.upsidePercent}
                      theme={theme}
                    />
                    <RiskGauge riskLevel={response.riskLevel} theme={theme} />
                    <NewsFeed company={response.company} />
                  </Stack>
                </Grid>
              </Grid>
            </Box>   
          )}
          <Divider sx={{ mt: 6, mb: 3 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">
              Investment Research Assistant v1.0
            </Typography>

            <Typography variant="body2">
              Developed by <strong>Komal</strong> 
            </Typography>
          </Box>
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