import React, { useEffect, useState } from "react";
import { Paper, Typography, Stack, Box, CircularProgress, Link, Divider } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import { getNews } from "../services/api";

export default function NewsFeed({ company }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (!company) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await getNews(company);
        if (cancelled) return;
        setArticles(res.data?.articles || []);
        setAvailable(res.data?.available !== false);
      } catch (e) {
        console.error(e);
        if (!cancelled) setAvailable(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [company]);

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Typography variant="overline" color="text.secondary">
        Latest News
      </Typography>

      <Box sx={{ mt: 1.5 }}>
        {loading && (
          <Stack alignItems="center" sx={{ py: 3 }}>
            <CircularProgress size={24} />
          </Stack>
        )}

        {!loading && !available && (
          <Typography variant="body2" color="text.secondary">
            News isn't available on your current data plan yet.
          </Typography>
        )}

        {!loading && available && articles.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No recent news found for this company.
          </Typography>
        )}

        {!loading &&
          available &&
          articles.slice(0, 6).map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider sx={{ my: 1.25 }} />}
              <Link
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 1.5,
                  color: "text.primary",
                  "&:hover": { color: "primary.main" },
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.5 }}>
                    {item.title || "Untitled"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {[item.source, item.publishedAt].filter(Boolean).join(" · ")}
                  </Typography>
                </Box>
                <OpenInNew sx={{ fontSize: 16, mt: 0.3, flexShrink: 0 }} />
              </Link>
            </React.Fragment>
          ))}
      </Box>
    </Paper>
  );
}
