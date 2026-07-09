import React from "react";
import {Paper,Typography,Table,TableHead,TableBody,TableRow,TableCell,Chip,} from "@mui/material";

const MONO_STACK = '"IBM Plex Mono", "Roboto Mono", ui-monospace, monospace';

function recommendationTone(value) {
  switch ((value || "").toUpperCase()) {
    case "BUY":
      return "success";
    case "SELL":
      return "error";
    default:
      return "warning";
  }
}

export default function CompetitorTable({
  company,
  competitorDetails,
  competitors,
}) {
  const rows =
    competitorDetails && competitorDetails.length > 0
      ? competitorDetails
      : (competitors || []).map((name) => ({ name }));

  if (rows.length === 0) return null;

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3, overflowX: "auto" }}>
      <Typography variant="overline" color="text.secondary">
        Competitor Comparison
      </Typography>

      <Table size="small" sx={{ mt: 1.5 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Ticker</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Market Cap</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>P/E Ratio</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>View</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((c, i) => (
            <TableRow key={i} hover>
              <TableCell>{c.name || "—"}</TableCell>
              <TableCell sx={{ fontFamily: MONO_STACK }}>
                {c.ticker || "—"}
              </TableCell>
              <TableCell sx={{ fontFamily: MONO_STACK }}>
                {c.marketCap || "—"}
              </TableCell>
              <TableCell sx={{ fontFamily: MONO_STACK }}>
                {c.peRatio || "—"}
              </TableCell>
              <TableCell>
                {c.recommendation ? (
                  <Chip
                    label={c.recommendation}
                    color={recommendationTone(c.recommendation)}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 1.5 }}
      >
        Figures are AI-generated estimates for comparison against{" "}
        {company || "this company"}, not live quotes.
      </Typography>
    </Paper>
  );
}
