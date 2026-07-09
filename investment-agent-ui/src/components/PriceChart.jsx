import React, { useEffect, useState, useCallback } from "react";
import { Paper, Typography, Stack, Button, Box, CircularProgress } from "@mui/material";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getChart } from "../services/api";

const MONO_STACK = '"IBM Plex Mono", "Roboto Mono", ui-monospace, monospace';

// label -> [interval, outputsize] understood by Twelve Data's time_series endpoint
const RANGES = {
  "1D": ["5min", "78"],
  "1W": ["1h", "42"],
  "1M": ["1day", "22"],
  "6M": ["1day", "130"],
  "1Y": ["1week", "52"],
};

export default function PriceChart({ company, accentColor = "#0F6F5C" }) {
  const [range, setRange] = useState("1M");
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!company) return;
    setLoading(true);
    setError(false);
    try {
      const [interval, outputsize] = RANGES[range];
      const res = await getChart(company, interval, outputsize);
      setPoints(res.data?.points || []);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [company, range]);

  useEffect(() => {
    load();
  }, [load]);

  const chartData = points.map((p) => ({
    time: p.datetime,
    close: p.close,
  }));

  const isUp =
    chartData.length > 1 && chartData[chartData.length - 1].close >= chartData[0].close;
  const lineColor = isUp ? accentColor : "#B3261E";

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="overline" color="text.secondary">
          Price Chart
        </Typography>
        <Stack direction="row" spacing={0.5}>
          {Object.keys(RANGES).map((label) => (
            <Button
              key={label}
              size="small"
              onClick={() => setRange(label)}
              variant={range === label ? "contained" : "text"}
              disableElevation
              sx={{
                minWidth: 40,
                fontSize: 12,
                fontFamily: MONO_STACK,
                ...(range !== label && { color: "text.secondary" }),
              }}
            >
              {label}
            </Button>
          ))}
        </Stack>
      </Stack>

      <Box sx={{ height: 260, position: "relative" }}>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Couldn't load chart data right now.
            </Typography>
          </Box>
        )}

        {!loading && !error && chartData.length === 0 && (
          <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No chart data available for this range.
            </Typography>
          </Box>
        )}

        {!loading && !error && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fontFamily: MONO_STACK }}
                minTickGap={40}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 11, fontFamily: MONO_STACK }}
                width={56}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Close"]}
                labelStyle={{ fontFamily: MONO_STACK, fontSize: 12 }}
                contentStyle={{ fontFamily: MONO_STACK, fontSize: 12, borderRadius: 8 }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={lineColor}
                strokeWidth={2}
                fill="url(#priceFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  );
}
