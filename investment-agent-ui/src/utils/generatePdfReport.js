import { jsPDF } from "jspdf";
import { formatPrice, formatMarketCap, recommendationTone } from "./format";

const PAGE_WIDTH = 210; // A4, mm
const PAGE_HEIGHT = 297;
const MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const INK = [11, 18, 32];
const SECONDARY = [91, 100, 114];
const DIVIDER = [227, 231, 237];
const PAPER_TINT = [245, 246, 248];

const TONE_RGB = {
  success: [15, 111, 92],
  error: [179, 38, 30],
  warning: [183, 121, 31],
};

function toneRgb(recommendation) {
  return TONE_RGB[recommendationTone(recommendation)] || TONE_RGB.warning;
}

export function generateAnalysisPdf(response) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  const newPage = () => {
    doc.addPage();
    y = MARGIN +4;
  };

const ensureSpace = (needed) => {
  if (y + needed > PAGE_HEIGHT - MARGIN - 10) {
    newPage();
  }
};

  const setInk = () => doc.setTextColor(...INK);
  const setSecondary = () => doc.setTextColor(...SECONDARY);

  const divider = () => {
    doc.setDrawColor(...DIVIDER);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 5;
  };

  const sectionLabel = (text) => {
    ensureSpace(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setSecondary();
    doc.text(text.toUpperCase(), MARGIN, y);
    y += 5.5;
  };

  /** Wraps and prints a paragraph, paginating between lines if needed. */
  const paragraph = (text, { fontSize = 10.5, lineHeight = 5.2, maxWidth = CONTENT_WIDTH } = {}) => {
    if (!text) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    setInk();
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line) => {
  if (y + lineHeight > PAGE_HEIGHT - MARGIN) {
    newPage();
    y += 2; // small top spacing
  }

  doc.text(line, MARGIN, y);
  y += lineHeight;
});
  };

  // ------------------------------------------------------------ Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  setInk();
  doc.text(response.company || "Company", MARGIN, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  setSecondary();
  const subtitleParts = [response.stockData?.symbol, response.stockData?.exchange, response.sector].filter(
    Boolean
  );
  if (subtitleParts.length) doc.text(subtitleParts.join("  ·  "), MARGIN, y + 5.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  setInk();
  const priceText = formatPrice(response.stockData?.currentPrice);
  doc.text(priceText, PAGE_WIDTH - MARGIN, y, { align: "right" });

  if (typeof response.stockData?.changePercent === "number") {
    const up = response.stockData.changePercent > 0;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...(up ? TONE_RGB.success : TONE_RGB.error));
    doc.text(
      `${up ? "+" : ""}${response.stockData.changePercent.toFixed(2)}%`,
      PAGE_WIDTH - MARGIN,
      y + 5.5,
      { align: "right" }
    );
  }

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setSecondary();
  doc.text(
    `Generated ${new Date().toLocaleString()}${response.stockData ? "" : "  ·  Estimated (live market data was off)"}`,
    MARGIN,
    y
  );
  y += 5;
  divider();

  // ------------------------------------------------------------ Quote strip
  if (response.stockData) {
    const stats = [
      ["Open", formatPrice(response.stockData.open)],
      ["Prev Close", formatPrice(response.stockData.previousClose)],
      ["Day High", formatPrice(response.stockData.high)],
      ["Day Low", formatPrice(response.stockData.low)],
      ["52W High", formatPrice(response.stockData.weekHigh52)],
      ["52W Low", formatPrice(response.stockData.weekLow52)],
      [
        "Volume",
        response.stockData.volume != null ? Number(response.stockData.volume).toLocaleString() : "N/A",
      ],
      ["Market Cap", formatMarketCap(response.marketCap) || "N/A"],
    ];
    const colWidth = CONTENT_WIDTH / 4;
    ensureSpace(18);
    stats.forEach(([label, value], i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = MARGIN + col * colWidth;
      const rowY = y + row * 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      setSecondary();
      doc.text(label.toUpperCase(), x, rowY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      setInk();
      doc.text(String(value), x, rowY + 5);
    });
    y += Math.ceil(stats.length / 4) * 14 + 3;
    divider();
  }

  // ------------------------------------------------------------ Recommendation
  ensureSpace(24);
  const tone = toneRgb(response.recommendation);

  sectionLabel("Recommendation");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...tone);
  doc.text(response.recommendation || "N/A", MARGIN + 4, y);
  y += 6;
  paragraph(response.reason, { maxWidth: CONTENT_WIDTH - 4 });
  y += 3;
  divider();

  // ------------------------------------------------------------ Score / target / risk row
  ensureSpace(26);
  const thirdWidth = CONTENT_WIDTH / 3;
  const scoreLabel = typeof response.investmentScore === "number" ? `${response.investmentScore}/100` : "N/A";
  const targetLabel = typeof response.priceTarget === "number" ? formatPrice(response.priceTarget) : "N/A";
  const upsideLabel =
    typeof response.upsidePercent === "number"
      ? `${response.upsidePercent > 0 ? "+" : ""}${response.upsidePercent.toFixed(1)}%`
      : "N/A";

  const miniStat = (x, label, value, color) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setSecondary();
    doc.text(label.toUpperCase(), x, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...(color || INK));
    doc.text(String(value), x, y + 7);
  };

  miniStat(MARGIN, "Investment Score", scoreLabel);
  miniStat(MARGIN + thirdWidth, "12M Price Target", targetLabel);
  miniStat(
    MARGIN + thirdWidth * 2,
    "Implied Upside",
    upsideLabel,
    response.upsidePercent > 0 ? TONE_RGB.success : response.upsidePercent < 0 ? TONE_RGB.error : INK
  );
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setSecondary();
  doc.text(`Risk Level: ${response.riskLevel || "N/A"}`, MARGIN, y);
  y += 6;
  divider();

  // ------------------------------------------------------------ Overview
  sectionLabel("Company Overview");
  paragraph(response.companyOverview);
  y += 2;
  divider();

  // ------------------------------------------------------------ Growth potential
  sectionLabel("Growth Potential");
  paragraph(response.growthPotential);
  y += 2;
  divider();

 // ------------------------------------------------------------ SWOT
sectionLabel("SWOT Analysis");

const swotColWidth = (CONTENT_WIDTH - 6) / 2;

const swot = [
  ["Strengths", response.pros, TONE_RGB.success],
  ["Weaknesses", response.cons, TONE_RGB.error],
  ["Opportunities", response.opportunities, [15, 111, 92]],
  ["Threats", response.threats, TONE_RGB.warning],
];

for (let i = 0; i < swot.length; i += 2) {
  // ---------- Calculate row height before printing
  let leftHeight = 0;
  let rightHeight = 0;

  [0, 1].forEach((col) => {
    const [, items] = swot[i + col] || [];
    const text =
      items && items.length
        ? items.map((it) => `• ${it}`).join("\n")
        : "No data.";

    const lines = doc.splitTextToSize(text, swotColWidth - 2);

    const height = 5 + 5 + lines.length * 4.6;
    if (col === 0) leftHeight = height;
    else rightHeight = height;
  });

  const rowHeight = Math.max(leftHeight, rightHeight) + 4;

  // Entire row moves to next page if required
  ensureSpace(rowHeight);

  const rowStartY = y;

  for (let col = 0; col < 2; col++) {
    const [label, items, color] = swot[i + col] || [];
    if (!label) continue;

    const x = MARGIN + col * (swotColWidth + 6);
    let localY = rowStartY;

    // Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...color);
    doc.text(label.toUpperCase(), x, localY);
    localY += 5;

    // Body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setInk();

    const text =
      items && items.length
        ? items.map((it) => `• ${it}`).join("\n")
        : "No data.";

    const lines = doc.splitTextToSize(text, swotColWidth - 2);

    lines.forEach((line) => {
      doc.text(line, x, localY);
      localY += 4.6;
    });
  }

  y += rowHeight;
}

divider();

  // ------------------------------------------------------------ Competitor table
  const rows =
    response.competitorDetails && response.competitorDetails.length > 0
      ? response.competitorDetails
      : (response.competitors || []).map((name) => ({ name }));

  if (rows.length > 0) {
    sectionLabel("Competitor Comparison");
    const cols = [
      { label: "Company", key: "name", width: 0.34 },
      { label: "Ticker", key: "ticker", width: 0.16 },
      { label: "Market Cap", key: "marketCap", width: 0.2 },
      { label: "P/E", key: "peRatio", width: 0.14 },
      { label: "View", key: "recommendation", width: 0.16 },
    ];
    const rowHeight = 7;
    const headerHeight = 7;

    const drawHeader = () => {
      doc.setFillColor(...PAPER_TINT);
      doc.rect(MARGIN, y, CONTENT_WIDTH, headerHeight, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      setInk();
      let x = MARGIN + 2;
      cols.forEach((col) => {
        doc.text(col.label, x, y + 5);
        x += CONTENT_WIDTH * col.width;
      });
      y += headerHeight;
      doc.setDrawColor(...DIVIDER);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    };

    ensureSpace(headerHeight + rowHeight);
    drawHeader();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    rows.forEach((row, i) => {
      if (y + rowHeight > PAGE_HEIGHT - MARGIN) {
        newPage();
        drawHeader();
      }
      if (i % 2 === 1) {
        doc.setFillColor(...PAPER_TINT);
        doc.rect(MARGIN, y, CONTENT_WIDTH, rowHeight, "F");
      }
      setInk();
      let x = MARGIN + 2;
      cols.forEach((col) => {
        const raw = row[col.key];
        const value = raw == null || raw === "" ? "—" : String(raw);
        const maxChars = Math.floor((CONTENT_WIDTH * col.width) / 1.8);
        const truncated = value.length > maxChars ? `${value.slice(0, maxChars - 1)}…` : value;
        doc.text(truncated, x, y + 5);
        x += CONTENT_WIDTH * col.width;
      });
      y += rowHeight;
    });
    y += 4;
  }

// ------------------------------------------------------------ Footer / disclaimer + page numbers
const totalPages = doc.internal.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
  doc.setPage(i);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  setSecondary();
  
  // Line 1: Disclaimer
  doc.text(
    "AI-generated research for informational purposes only — not financial advice.",
    MARGIN,
    PAGE_HEIGHT - 12
  );
  
  // Line 2: Developed by Komal (centered, one line below)
  doc.text(
    "Developed by Komal",
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 6,
    { align: "center" }
  );
  
  // Right - Page number (same line as disclaimer)
  doc.text(
    `${i} / ${totalPages}`,
    PAGE_WIDTH - MARGIN,
    PAGE_HEIGHT - 12,
    { align: "right" }
  );
}

  doc.save(`${(response.company || "analysis").replace(/\s+/g, "-")}-analysis.pdf`);
}