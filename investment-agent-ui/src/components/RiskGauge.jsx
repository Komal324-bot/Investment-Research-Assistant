import React from "react";
import { Paper, Typography, Box } from "@mui/material";

const MONO_STACK = '"IBM Plex Mono", "Roboto Mono", ui-monospace, monospace';

function riskMeta(risk, theme) {
  const key = (risk || "").toLowerCase();

  if (key.includes("low")) {
    return { value: 0.17, color: theme.palette.success.main, label: risk || "Low" };
  }
  if (key.includes("high")) {
    return { value: 0.85, color: theme.palette.error.main, label: risk || "High" };
  }
  if (key.includes("medium") || key.includes("moderate")) {
    return { value: 0.5, color: theme.palette.warning.main, label: risk || "Medium" };
  }
  return { value: 0.5, color: theme.palette.text.secondary, label: risk || "Unknown" };
}

export default function RiskGauge({ riskLevel, theme }) {
  const { value, color, label } = riskMeta(riskLevel, theme);

  const cx = 100;
  const cy = 95;
  const r = 78;

  const angleForValue = (v) => Math.PI - v * Math.PI; 

  const pointOnArc = (v, radius) => {
    const angle = angleForValue(v);
    return {
      x: cx + radius * Math.cos(angle),
      y: cy - radius * Math.sin(angle),
    };
  };

  const arcPath = (from, to, radius) => {
    const p1 = pointOnArc(from, radius);
    const p2 = pointOnArc(to, radius);
    const largeArc = to - from > 0.5 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${radius} ${radius} 0 ${largeArc} 1 ${p2.x} ${p2.y}`;
  };

  const needleTip = pointOnArc(value, r - 8);

  return (
    <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
      <Typography variant="overline" color="text.secondary">
        Risk Gauge
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 1 }}>
        <svg viewBox="0 0 200 115" width="100%" style={{ maxWidth: 240 }}>
          {/* Band segments */}
          <path
            d={arcPath(0, 1 / 3, r)}
            stroke={theme.palette.success.main}
            strokeWidth={14}
            fill="none"
            strokeLinecap="round"
            opacity={0.85}
          />
          <path
            d={arcPath(1 / 3, 2 / 3, r)}
            stroke={theme.palette.warning.main}
            strokeWidth={14}
            fill="none"
            opacity={0.85}
          />
          <path
            d={arcPath(2 / 3, 1, r)}
            stroke={theme.palette.error.main}
            strokeWidth={14}
            fill="none"
            strokeLinecap="round"
            opacity={0.85}
          />

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke={theme.palette.text.primary}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={5} fill={theme.palette.text.primary} />
        </svg>

        <Typography
          sx={{
            fontFamily: MONO_STACK,
            fontWeight: 700,
            fontSize: 20,
            color,
            mt: -1,
          }}
        >
          {label.toUpperCase()}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          AI-estimated risk classification
        </Typography>
      </Box>
    </Paper>
  );
}
