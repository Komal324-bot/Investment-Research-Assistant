import React from "react";
import {
  Box,
  Drawer,
  Typography,
  Stack,
  IconButton,
  Chip,
  Paper,
  Divider,
  Tooltip,
} from "@mui/material";
import { Close, Star, ArrowForward } from "@mui/icons-material";
import { parseHistoryAnalysis, recommendationTone } from "../utils/format";

const MONO_STACK = '"IBM Plex Mono", "Roboto Mono", ui-monospace, monospace';

function scoreColor(score, theme) {
  if (score == null) return theme.palette.text.secondary;
  if (score >= 70) return theme.palette.success.main;
  if (score >= 40) return theme.palette.warning.main;
  return theme.palette.error.main;
}

function WatchlistCard({ item, theme, onUnpin, onSelect }) {
  const analysis = parseHistoryAnalysis(item);
  const score = typeof analysis?.investmentScore === "number" ? analysis.investmentScore : null;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1.5,
        cursor: "pointer",
        transition: "border-color 120ms ease",
        "&:hover": { borderColor: "primary.main" },
      }}
      onClick={() => onSelect(item.companyName)}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700 }} noWrap>
            {item.companyName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Cached {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
          <Tooltip title="Remove from watchlist">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onUnpin(item.id);
              }}
            >
              <Star fontSize="small" sx={{ color: "warning.main" }} />
            </IconButton>
          </Tooltip>
          <ArrowForward fontSize="small" sx={{ color: "text.secondary" }} />
        </Stack>
      </Stack>

      {analysis ? (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 1.25, gap: 1 }}>
          {analysis.recommendation && (
            <Chip
              label={analysis.recommendation}
              color={recommendationTone(analysis.recommendation)}
              size="small"
              sx={{ fontWeight: 700 }}
            />
          )}
          {score != null && (
            <Chip
              label={`Score ${score}/100`}
              size="small"
              variant="outlined"
              sx={{
                fontFamily: MONO_STACK,
                fontWeight: 700,
                color: scoreColor(score, theme),
                borderColor: scoreColor(score, theme),
              }}
            />
          )}
          {analysis.riskLevel && (
            <Chip label={analysis.riskLevel} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
          )}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Cached analysis unavailable.
        </Typography>
      )}
    </Paper>
  );
}

export default function Watchlist({ open, onClose, items, theme, onUnpin, onSelect }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 360, p: 3, bgcolor: "background.paper", height: "100%" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Watchlist</Typography>
          <IconButton size="small" onClick={onClose}>
            <Close fontSize="small" />
          </IconButton>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Pinned companies with their most recent cached score and recommendation. Pin from the
          search history panel.
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {items.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            No pinned companies yet. Star an entry in your search history to add it here.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {items.map((item) => (
              <WatchlistCard
                key={item.id}
                item={item}
                theme={theme}
                onUnpin={onUnpin}
                onSelect={onSelect}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
