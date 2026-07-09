import React from "react";
import { Paper, Typography, Box, Stack } from "@mui/material";
import { TrendingUp, TrendingDown, TrendingFlat } from "@mui/icons-material";

const MONO_STACK = '"IBM Plex Mono", "Roboto Mono", ui-monospace, monospace';

export default function PriceTargetCard({ currentPrice, priceTarget, upsidePercent, theme }) {
  const hasTarget = typeof priceTarget === "number";
  const hasCurrent = typeof currentPrice === "number";
  const hasUpside = typeof upsidePercent === "number";

  const isUp = hasUpside && upsidePercent > 0;
  const isDown = hasUpside && upsidePercent < 0;
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : TrendingFlat;
  const tone = isUp ? theme.palette.success.main : isDown ? theme.palette.error.main : theme.palette.text.secondary;

  const low = hasCurrent && hasTarget ? Math.min(currentPrice, priceTarget) : 0;
  const high = hasCurrent && hasTarget ? Math.max(currentPrice, priceTarget) : 1;
  const span = high - low || 1;
  const currentPct = hasCurrent ? ((currentPrice - low) / span) * 100 : 0;
  const targetPct = hasTarget ? ((priceTarget - low) / span) * 100 : 100;

  return (
    <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
      <Typography variant="overline" color="text.secondary">
        Price Target &amp; Upside
      </Typography>

      <Stack direction="row" spacing={4} sx={{ mt: 1.5, mb: hasTarget && hasCurrent ? 3 : 0 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Current
          </Typography>
          <Typography sx={{ fontFamily: MONO_STACK, fontWeight: 700, fontSize: 22 }}>
            {hasCurrent ? `$${currentPrice.toFixed(2)}` : "N/A"}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            12-Month Target
          </Typography>
          <Typography sx={{ fontFamily: MONO_STACK, fontWeight: 700, fontSize: 22 }}>
            {hasTarget ? `$${priceTarget.toFixed(2)}` : "N/A"}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Implied Upside
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Icon sx={{ fontSize: 18, color: tone }} />
            <Typography sx={{ fontFamily: MONO_STACK, fontWeight: 700, fontSize: 22, color: tone }}>
              {hasUpside ? `${upsidePercent > 0 ? "+" : ""}${upsidePercent.toFixed(1)}%` : "N/A"}
            </Typography>
          </Stack>
        </Box>
      </Stack>

      {hasTarget && hasCurrent && (
        <Box sx={{ position: "relative", height: 6, borderRadius: 3, bgcolor: "action.hover", mt: 1 }}>
          <Box
            sx={{
              position: "absolute",
              left: 0,
              width: `${Math.max(0, Math.min(100, Math.max(currentPct, targetPct)))}%`,
              height: "100%",
              borderRadius: 3,
              bgcolor: tone,
              opacity: 0.35,
            }}
          />
          <Box
            title="Current price"
            sx={{
              position: "absolute",
              left: `calc(${Math.max(0, Math.min(100, currentPct))}% - 5px)`,
              top: -3,
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: "background.paper",
              border: "2px solid",
              borderColor: "text.secondary",
            }}
          />
          <Box
            title="Price target"
            sx={{
              position: "absolute",
              left: `calc(${Math.max(0, Math.min(100, targetPct))}% - 5px)`,
              top: -3,
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: tone,
              border: "2px solid",
              borderColor: "background.paper",
            }}
          />
        </Box>
      )}
    </Paper>
  );
}
