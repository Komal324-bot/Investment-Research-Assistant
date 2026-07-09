import React from "react";
import { Paper, Typography, Box } from "@mui/material";

const MONO_STACK = '"IBM Plex Mono", "Roboto Mono", ui-monospace, monospace';

function scoreColor(score, theme) {
  if (score == null) return theme.palette.text.secondary;
  if (score >= 70) return theme.palette.success.main;
  if (score >= 40) return theme.palette.warning.main;
  return theme.palette.error.main;
}

function scoreLabel(score) {
  if (score == null) return "N/A";
  if (score >= 80) return "Exceptional";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Favorable";
  if (score >= 40) return "Mixed";
  if (score >= 25) return "Weak";
  return "Poor";
}

export default function InvestmentScoreCard({ score, theme }) {
  const value = typeof score === "number" ? Math.max(0, Math.min(100, score)) : null;
  const color = scoreColor(value, theme);

  const r = 54;
  const circumference = 2 * Math.PI * r;
  const dash = value == null ? 0 : (value / 100) * circumference;

  return (
    <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
      <Typography variant="overline" color="text.secondary">
        Investment Score
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mt: 1 }}>
        <Box sx={{ position: "relative", width: 128, height: 128, flexShrink: 0 }}>
          <svg viewBox="0 0 128 128" width="128" height="128">
            <circle
              cx="64"
              cy="64"
              r={r}
              fill="none"
              stroke={theme.palette.divider}
              strokeWidth={12}
            />
            <circle
              cx="64"
              cy="64"
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={12}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              transform="rotate(-90 64 64)"
            />
          </svg>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontFamily: MONO_STACK, fontWeight: 700, fontSize: 28, lineHeight: 1 }}>
              {value ?? "—"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              / 100
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color }}>
            {scoreLabel(value)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Overall conviction score derived from the AI's fundamentals, growth,
            and risk assessment.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
