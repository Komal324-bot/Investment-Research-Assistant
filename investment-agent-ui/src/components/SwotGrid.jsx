import React from "react";
import { Paper, Typography, Grid, Box, List, ListItem, ListItemText } from "@mui/material";

function Quadrant({ title, items, color }) {
  return (
    <Box
      sx={{
        p: 2,
        height: "100%",
        borderLeft: "3px solid",
        borderLeftColor: color,
        bgcolor: "action.hover",
        borderRadius: 1,
      }}
    >
      <Typography variant="overline" sx={{ color, fontWeight: 700 }}>
        {title}
      </Typography>
      <List dense disablePadding sx={{ mt: 0.5 }}>
        {(items || []).map((item, i) => (
          <ListItem key={i} disableGutters sx={{ py: 0.25 }}>
            <ListItemText
              primaryTypographyProps={{ variant: "body2", lineHeight: 1.5 }}
              primary={`• ${item}`}
            />
          </ListItem>
        ))}
        {(!items || items.length === 0) && (
          <Typography variant="body2" color="text.secondary">
            No data.
          </Typography>
        )}
      </List>
    </Box>
  );
}

export default function SwotGrid({ strengths, weaknesses, opportunities, threats, theme }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Typography variant="overline" color="text.secondary">
        SWOT Analysis
      </Typography>
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Quadrant title="Strengths" items={strengths} color={theme.palette.success.main} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Quadrant title="Weaknesses" items={weaknesses} color={theme.palette.error.main} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Quadrant title="Opportunities" items={opportunities} color={theme.palette.primary.main} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Quadrant title="Threats" items={threats} color={theme.palette.warning.main} />
        </Grid>
      </Grid>
    </Paper>
  );
}
