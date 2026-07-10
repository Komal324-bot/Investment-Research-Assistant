package com.project.investment_agent.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.investment_agent.dto.StockDataDTO;
import com.project.investment_agent.dto.ChartPointDTO;
import com.project.investment_agent.dto.ChartResponseDTO;
import com.project.investment_agent.dto.NewsItemDTO;
import com.project.investment_agent.dto.NewsResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

/**
 * Gets stock prices, price history and news for a company.
 *
 * Two data sources are used for prices/history:
 *   1. Twelve Data (needs an API key, covers US stocks well)
 *   2. Yahoo Finance (no key needed, covers Indian/global stocks too)
 * If Twelve Data can't answer, we just try Yahoo instead.
 *
 * Two data sources are used for news:
 *   1. NewsAPI.org (searched by company name, works for any country)
 *   2. Finnhub (used only if NewsAPI has nothing)
 */
@Service
public class MarketDataService {

    @Value("${twelvedata.api.key}")
    private String twelveDataKey;

    @Value("${finnhub.api.key}")
    private String finnhubKey;

    @Value("${newsapi.api.key:}")
    private String newsApiKey;

    private final RestTemplate http = new RestTemplate();
    private final ObjectMapper json = new ObjectMapper();

    // Remembers symbols we already looked up, so we don't call the API again.
    private final Map<String, String> symbolCache = new ConcurrentHashMap<>();

    // Well-known companies mapped straight to their ticker symbol.
    // Indian companies end in ".NS" (NSE exchange).
    private static final Map<String, String> KNOWN_SYMBOLS = new HashMap<>();

    static {
        // India
        KNOWN_SYMBOLS.put("reliance", "RELIANCE.NS");
        KNOWN_SYMBOLS.put("tcs", "TCS.NS");
        KNOWN_SYMBOLS.put("tata consultancy services", "TCS.NS");
        KNOWN_SYMBOLS.put("infosys", "INFY.NS");
        KNOWN_SYMBOLS.put("hdfc bank", "HDFCBANK.NS");
        KNOWN_SYMBOLS.put("icici bank", "ICICIBANK.NS");
        KNOWN_SYMBOLS.put("sbi", "SBIN.NS");
        KNOWN_SYMBOLS.put("state bank of india", "SBIN.NS");
        KNOWN_SYMBOLS.put("wipro", "WIPRO.NS");
        KNOWN_SYMBOLS.put("itc", "ITC.NS");
        KNOWN_SYMBOLS.put("hindustan unilever", "HINDUNILVR.NS");
        KNOWN_SYMBOLS.put("hul", "HINDUNILVR.NS");
        KNOWN_SYMBOLS.put("bajaj finance", "BAJFINANCE.NS");
        KNOWN_SYMBOLS.put("adani enterprises", "ADANIENT.NS");
        KNOWN_SYMBOLS.put("adani ports", "ADANIPORTS.NS");
        KNOWN_SYMBOLS.put("ongc", "ONGC.NS");
        KNOWN_SYMBOLS.put("ntpc", "NTPC.NS");
        KNOWN_SYMBOLS.put("larsen and toubro", "LT.NS");
        KNOWN_SYMBOLS.put("l&t", "LT.NS");
        KNOWN_SYMBOLS.put("maruti", "MARUTI.NS");
        KNOWN_SYMBOLS.put("maruti suzuki", "MARUTI.NS");
        KNOWN_SYMBOLS.put("sun pharma", "SUNPHARMA.NS");
        KNOWN_SYMBOLS.put("bharti airtel", "BHARTIARTL.NS");
        KNOWN_SYMBOLS.put("airtel", "BHARTIARTL.NS");
        KNOWN_SYMBOLS.put("kotak mahindra bank", "KOTAKBANK.NS");
        KNOWN_SYMBOLS.put("kotak", "KOTAKBANK.NS");
        KNOWN_SYMBOLS.put("axis bank", "AXISBANK.NS");
        KNOWN_SYMBOLS.put("tata motors", "TATAMOTORS.NS");
        KNOWN_SYMBOLS.put("tata steel", "TATASTEEL.NS");
        KNOWN_SYMBOLS.put("hcl tech", "HCLTECH.NS");
        KNOWN_SYMBOLS.put("hcl technologies", "HCLTECH.NS");
        KNOWN_SYMBOLS.put("zomato", "ZOMATO.NS");
        KNOWN_SYMBOLS.put("paytm", "PAYTM.NS");
        KNOWN_SYMBOLS.put("asian paints", "ASIANPAINT.NS");
        KNOWN_SYMBOLS.put("titan", "TITAN.NS");
        KNOWN_SYMBOLS.put("ultratech cement", "ULTRACEMCO.NS");
        KNOWN_SYMBOLS.put("nestle india", "NESTLEIND.NS");
        KNOWN_SYMBOLS.put("power grid", "POWERGRID.NS");
        KNOWN_SYMBOLS.put("coal india", "COALINDIA.NS");

        // US / Global
        KNOWN_SYMBOLS.put("tesla", "TSLA");
        KNOWN_SYMBOLS.put("apple", "AAPL");
        KNOWN_SYMBOLS.put("microsoft", "MSFT");
        KNOWN_SYMBOLS.put("amazon", "AMZN");
        KNOWN_SYMBOLS.put("google", "GOOGL");
        KNOWN_SYMBOLS.put("alphabet", "GOOGL");
        KNOWN_SYMBOLS.put("meta", "META");
        KNOWN_SYMBOLS.put("facebook", "META");
        KNOWN_SYMBOLS.put("nvidia", "NVDA");
        KNOWN_SYMBOLS.put("netflix", "NFLX");
        KNOWN_SYMBOLS.put("disney", "DIS");
        KNOWN_SYMBOLS.put("coca cola", "KO");
        KNOWN_SYMBOLS.put("coke", "KO");
        KNOWN_SYMBOLS.put("pepsi", "PEP");
        KNOWN_SYMBOLS.put("pepsico", "PEP");
        KNOWN_SYMBOLS.put("nike", "NKE");
        KNOWN_SYMBOLS.put("mcdonalds", "MCD");
        KNOWN_SYMBOLS.put("walmart", "WMT");
        KNOWN_SYMBOLS.put("jpmorgan", "JPM");
        KNOWN_SYMBOLS.put("jp morgan", "JPM");
        KNOWN_SYMBOLS.put("goldman sachs", "GS");
        KNOWN_SYMBOLS.put("visa", "V");
        KNOWN_SYMBOLS.put("mastercard", "MA");
        KNOWN_SYMBOLS.put("intel", "INTC");
        KNOWN_SYMBOLS.put("amd", "AMD");
        KNOWN_SYMBOLS.put("ibm", "IBM");
        KNOWN_SYMBOLS.put("oracle", "ORCL");
        KNOWN_SYMBOLS.put("salesforce", "CRM");
        KNOWN_SYMBOLS.put("adobe", "ADBE");
        KNOWN_SYMBOLS.put("paypal", "PYPL");
        KNOWN_SYMBOLS.put("uber", "UBER");
        KNOWN_SYMBOLS.put("boeing", "BA");
    }

    // ===================== STOCK PRICE =====================

    public StockDataDTO getStockData(String company) {
        String symbol = resolveSymbol(company);
        if (symbol == null) {
            return null;
        }

        StockDataDTO stock;

        if (isIndianSymbol(symbol)) {
            stock = getStockFromYahoo(symbol);
        } else {
            stock = getStockFromTwelveData(symbol);
            if (stock == null) {
                stock = getStockFromYahoo(symbol);
            }
        }

        // If we still have nothing, maybe it's an Indian stock typed without
        // ".NS"/".BO" - try both before giving up.
        if (stock == null && !symbol.contains(".")) {
            stock = getStockFromYahoo(symbol + ".NS");
            if (stock == null) {
                stock = getStockFromYahoo(symbol + ".BO");
            }
        }

        return stock;
    }

    private StockDataDTO getStockFromTwelveData(String symbol) {
        try {
            String url = "https://api.twelvedata.com/quote?symbol=" + symbol + "&apikey=" + twelveDataKey;
            JsonNode root = json.readTree(http.getForObject(url, String.class));

            if (isError(root)) {
                return null;
            }

            StockDataDTO stock = new StockDataDTO();
            stock.setSymbol(root.path("symbol").asText());
            stock.setCompanyName(root.path("name").asText());
            stock.setLogoUrl(getLogoUrl(stock.getCompanyName()));
            stock.setExchange(root.path("exchange").asText());
            stock.setCurrency(root.path("currency").asText());
            stock.setOpen(root.path("open").asDouble());
            stock.setHigh(root.path("high").asDouble());
            stock.setLow(root.path("low").asDouble());
            stock.setCurrentPrice(root.path("close").asDouble());
            stock.setPreviousClose(root.path("previous_close").asDouble());
            stock.setVolume(root.path("volume").asDouble());
            stock.setChange(root.path("change").asDouble());
            stock.setChangePercent(root.path("percent_change").asDouble());
            stock.setWeekHigh52(root.path("fifty_two_week").path("high").asDouble());
            stock.setWeekLow52(root.path("fifty_two_week").path("low").asDouble());

            return stock;

        } catch (Exception e) {
            return null;
        }
    }

    private StockDataDTO getStockFromYahoo(String symbol) {
        try {
            JsonNode result = fetchYahooChart(symbol, "1d", "5d");
            if (result == null) {
                return null;
            }

            JsonNode meta = result.path("meta");
            if (meta.isMissingNode()) {
                return null;
            }

            String resolvedSymbol = meta.path("symbol").asText(symbol);
            String name = meta.path("longName").asText(meta.path("shortName").asText(resolvedSymbol));

            double previousClose = meta.path("previousClose").asDouble(meta.path("chartPreviousClose").asDouble(0));
            double currentPrice = meta.path("regularMarketPrice").asDouble(0);
            double change = currentPrice - previousClose;

            StockDataDTO stock = new StockDataDTO();
            stock.setSymbol(resolvedSymbol);
            stock.setCompanyName(name);
            stock.setLogoUrl(getLogoUrl(name));
            stock.setExchange(meta.path("exchangeName").asText(""));
            stock.setCurrency(meta.path("currency").asText(""));
            stock.setCurrentPrice(currentPrice);
            stock.setPreviousClose(previousClose);
            stock.setHigh(meta.path("regularMarketDayHigh").asDouble(currentPrice));
            stock.setLow(meta.path("regularMarketDayLow").asDouble(currentPrice));
            stock.setVolume(meta.path("regularMarketVolume").asDouble(0));
            stock.setWeekHigh52(meta.path("fiftyTwoWeekHigh").asDouble(0));
            stock.setWeekLow52(meta.path("fiftyTwoWeekLow").asDouble(0));
            stock.setOpen(findTodaysOpen(result, previousClose));
            stock.setChange(change);
            stock.setChangePercent(previousClose != 0 ? (change / previousClose) * 100 : 0);

            return stock;

        } catch (Exception e) {
            return null;
        }
    }

    // Yahoo doesn't always give today's open price directly, so we grab the
    // most recent open value from the price history instead.
    private double findTodaysOpen(JsonNode chartResult, double fallback) {
        JsonNode quotes = chartResult.path("indicators").path("quote");
        if (!quotes.isArray() || quotes.isEmpty()) {
            return fallback;
        }

        JsonNode opens = quotes.get(0).path("open");
        for (int i = opens.size() - 1; i >= 0; i--) {
            if (!opens.get(i).isNull()) {
                return opens.get(i).asDouble();
            }
        }
        return fallback;
    }

    // ===================== PRICE HISTORY (CHART) =====================

    public ChartResponseDTO getTimeSeries(String company, String interval, String outputsize) {
        String symbol = resolveSymbol(company);
        if (symbol == null) {
            return null;
        }

        ChartResponseDTO chart;

        if (isIndianSymbol(symbol)) {
            chart = getHistoryFromYahoo(symbol, interval, outputsize);
        } else {
            chart = getHistoryFromTwelveData(symbol, interval, outputsize);
            if (isEmpty(chart)) {
                chart = getHistoryFromYahoo(symbol, interval, outputsize);
            }
        }

        if (isEmpty(chart) && !symbol.contains(".")) {
            chart = getHistoryFromYahoo(symbol + ".NS", interval, outputsize);
            if (isEmpty(chart)) {
                chart = getHistoryFromYahoo(symbol + ".BO", interval, outputsize);
            }
        }

        return chart != null ? chart : new ChartResponseDTO(symbol, interval, new ArrayList<>());
    }

    private boolean isEmpty(ChartResponseDTO chart) {
        return chart == null || chart.getPoints().isEmpty();
    }

    private ChartResponseDTO getHistoryFromTwelveData(String symbol, String interval, String outputsize) {
        try {
            String url = "https://api.twelvedata.com/time_series?symbol=" + symbol
                    + "&interval=" + interval + "&outputsize=" + outputsize + "&apikey=" + twelveDataKey;

            JsonNode root = json.readTree(http.getForObject(url, String.class));
            if (isError(root)) {
                return null;
            }

            List<ChartPointDTO> points = new ArrayList<>();
            for (JsonNode node : root.path("values")) {
                points.add(new ChartPointDTO(node.path("datetime").asText(), node.path("close").asDouble()));
            }

            Collections.reverse(points); // Twelve Data gives newest first; we want oldest first.
            return new ChartResponseDTO(symbol, interval, points);

        } catch (Exception e) {
            return null;
        }
    }

    private ChartResponseDTO getHistoryFromYahoo(String symbol, String interval, String outputsize) {
        try {
            int count = parseIntOrDefault(outputsize, 30);
            String[] yahooIntervalAndRange = toYahooIntervalAndRange(interval, count);
            String yahooInterval = yahooIntervalAndRange[0];
            String range = yahooIntervalAndRange[1];

            JsonNode result = fetchYahooChart(symbol, yahooInterval, range);
            if (result == null) {
                return null;
            }

            JsonNode timestamps = result.path("timestamp");
            JsonNode quotes = result.path("indicators").path("quote");
            JsonNode closes = quotes.isArray() && !quotes.isEmpty() ? quotes.get(0).path("close") : null;

            List<ChartPointDTO> points = new ArrayList<>();
            DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneOffset.UTC);

            if (timestamps.isArray() && closes != null) {
                for (int i = 0; i < timestamps.size(); i++) {
                    if (i >= closes.size() || closes.get(i).isNull()) {
                        continue;
                    }
                    String date = dateFormat.format(Instant.ofEpochSecond(timestamps.get(i).asLong()));
                    points.add(new ChartPointDTO(date, closes.get(i).asDouble()));
                }
            }

            // Keep only the most recent `count` points, oldest first.
            if (points.size() > count) {
                points = points.subList(points.size() - count, points.size());
            }

            String resolvedSymbol = result.path("meta").path("symbol").asText(symbol);
            return new ChartResponseDTO(resolvedSymbol, interval, points);

        } catch (Exception e) {
            return null;
        }
    }

    // Turns our own interval names ("1day", "1week", "5min"...) into the
    // interval + range values that Yahoo's API expects.
    private String[] toYahooIntervalAndRange(String interval, int count) {
        if (interval.startsWith("1week")) {
            return new String[] { "1wk", "2y" };
        }
        if (interval.startsWith("1month")) {
            return new String[] { "1mo", "5y" };
        }
        if (interval.contains("min")) {
            return new String[] { interval.replace("min", "m"), "5d" };
        }

        String range = count <= 30 ? "1mo"
                : count <= 90 ? "3mo"
                : count <= 180 ? "6mo"
                : count <= 365 ? "1y"
                : "5y";
        return new String[] { "1d", range };
    }

    // ===================== SYMBOL LOOKUP =====================

    public String resolveSymbol(String company) {
        String key = company.trim().toLowerCase();

        if (KNOWN_SYMBOLS.containsKey(key)) {
            return KNOWN_SYMBOLS.get(key);
        }
        if (symbolCache.containsKey(key)) {
            return symbolCache.get(key);
        }

        String discovered = searchSymbolOnTwelveData(company);
        if (discovered != null) {
            symbolCache.put(key, discovered);
            return discovered;
        }

        // Nothing found - if it already looks like a ticker (short, no spaces),
        // just use it as typed. Otherwise fall back to the company name itself.
        boolean looksLikeTicker = key.length() <= 5 && !key.contains(" ") && key.matches("[a-z0-9.]+");
        return looksLikeTicker ? key.toUpperCase() : company.toUpperCase();
    }

    private String searchSymbolOnTwelveData(String company) {
        try {
            String url = "https://api.twelvedata.com/symbol_search?symbol="
                    + URLEncoder.encode(company, StandardCharsets.UTF_8) + "&apikey=" + twelveDataKey;

            JsonNode data = json.readTree(http.getForObject(url, String.class)).path("data");
            if (!data.isArray() || data.isEmpty()) {
                return null;
            }
            return data.get(0).path("symbol").asText(null);

        } catch (Exception e) {
            return null;
        }
    }

    private boolean isIndianSymbol(String symbol) {
        return symbol != null && (symbol.endsWith(".NS") || symbol.endsWith(".BO"));
    }

    // ===================== NEWS =====================

    /**
     * Gets recent news for a company. Tries NewsAPI first (works for any
     * country), and only falls back to Finnhub if NewsAPI has no results.
     */
    public NewsResponseDTO getNews(String company) {
        NewsResponseDTO newsApiResult = getNewsFromNewsApi(company);

        if (newsApiResult.isAvailable() && !newsApiResult.getArticles().isEmpty()) {
            return newsApiResult;
        }
        return getNewsFromFinnhub(company);
    }

    private NewsResponseDTO getNewsFromNewsApi(String company) {
        if (newsApiKey == null || newsApiKey.isBlank() || newsApiKey.startsWith("YOUR_")) {
            return new NewsResponseDTO(company, new ArrayList<>(), false);
        }

        String name = company.trim();

        // Multi-word names need quotes so NewsAPI treats them as one phrase
        // (otherwise "Coal India" could match "coal" and "India" separately).
        String searchText = name.contains(" ") ? "\"" + name + "\"" : name;
        String encodedQuery = URLEncoder.encode(searchText, StandardCharsets.UTF_8);

        // Search titles first - this is the strictest, most accurate match.
        NewsResponseDTO titleResults = searchNewsApi(name, encodedQuery, true);
        if (titleResults.isAvailable() && !titleResults.getArticles().isEmpty()) {
            return titleResults;
        }

        // If nothing showed up in titles, widen the search.
        return searchNewsApi(name, encodedQuery, false);
    }

    private NewsResponseDTO searchNewsApi(String company, String encodedQuery, boolean titleOnly) {
        try {
            String field = titleOnly ? "qInTitle" : "q";
            String url = "https://newsapi.org/v2/everything?" + field + "=" + encodedQuery
                    + "&sortBy=relevancy&language=en&pageSize=20&apiKey=" + newsApiKey;

            JsonNode root = json.readTree(http.getForObject(url, String.class));
            if (!"ok".equalsIgnoreCase(root.path("status").asText())) {
                return new NewsResponseDTO(company, new ArrayList<>(), false);
            }

            List<NewsItemDTO> articles = new ArrayList<>();
            for (JsonNode item : root.path("articles")) {
                String title = item.path("title").asText("");
                String description = item.path("description").asText("");

                // Double-check the article is actually about this company,
                // not just something that happens to share a keyword.
                if (!mentionsCompany(company, title, description)) {
                    continue;
                }

                articles.add(new NewsItemDTO(
                        title,
                        item.path("url").asText(""),
                        item.path("source").path("name").asText(""),
                        formatDate(item.path("publishedAt").asText(""))));
            }

            return new NewsResponseDTO(company, articles, !articles.isEmpty());

        } catch (Exception e) {
            return new NewsResponseDTO(company, new ArrayList<>(), false);
        }
    }

    // Checks the company name really appears in the article (as a whole word,
    // not part of another word - e.g. "ITC" should not match "stitch").
    private boolean mentionsCompany(String company, String title, String description) {
        String text = (title + " " + description).toLowerCase();
        String name = company.trim().toLowerCase();

        if (name.isEmpty()) {
            return false;
        }
        if (name.contains(" ")) {
            return text.contains(name);
        }

        return Pattern.compile("\\b" + Pattern.quote(name) + "\\b").matcher(text).find();
    }

    private NewsResponseDTO getNewsFromFinnhub(String company) {
        String symbol = resolveSymbol(company);

        if (symbol == null || finnhubKey == null || finnhubKey.isBlank() || finnhubKey.startsWith("YOUR_")) {
            return new NewsResponseDTO(company, new ArrayList<>(), false);
        }

        try {
            LocalDate to = LocalDate.now();
            LocalDate from = to.minusDays(30);

            String url = "https://finnhub.io/api/v1/company-news?symbol=" + symbol
                    + "&from=" + from + "&to=" + to + "&token=" + finnhubKey;

            JsonNode root = json.readTree(http.getForObject(url, String.class));
            if (root.has("error") || !root.isArray()) {
                return new NewsResponseDTO(symbol, new ArrayList<>(), false);
            }

            List<NewsItemDTO> articles = new ArrayList<>();
            for (JsonNode item : root) {
                long epochSeconds = item.path("datetime").asLong(0);
                String publishedAt = epochSeconds > 0
                        ? DateTimeFormatter.ofPattern("MMM d, yyyy").withZone(ZoneOffset.UTC)
                                .format(Instant.ofEpochSecond(epochSeconds))
                        : "";

                articles.add(new NewsItemDTO(
                        item.path("headline").asText(""),
                        item.path("url").asText(""),
                        item.path("source").asText(""),
                        publishedAt));
            }

            // Finnhub already sorts newest-first; just cap the list length.
            if (articles.size() > 20) {
                articles = articles.subList(0, 20);
            }

            return new NewsResponseDTO(symbol, articles, true);

        } catch (Exception e) {
            return new NewsResponseDTO(symbol, new ArrayList<>(), false);
        }
    }

    private String formatDate(String isoDateTime) {
        if (isoDateTime == null || isoDateTime.isBlank()) {
            return "";
        }
        try {
            return DateTimeFormatter.ofPattern("MMM d, yyyy").withZone(ZoneOffset.UTC)
                    .format(Instant.parse(isoDateTime));
        } catch (Exception e) {
            return isoDateTime;
        }
    }

    // ===================== SHARED HELPERS =====================

    // Calls Yahoo Finance's public chart endpoint and returns the first result,
    // or null if there's no data. Used by both price and history lookups.
    private JsonNode fetchYahooChart(String symbol, String interval, String range) throws Exception {
        String url = "https://query1.finance.yahoo.com/v8/finance/chart/"
                + URLEncoder.encode(symbol, StandardCharsets.UTF_8)
                + "?interval=" + interval + "&range=" + range;

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0");
        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<String> response = http.exchange(url, HttpMethod.GET, request, String.class);
        JsonNode results = json.readTree(response.getBody()).path("chart").path("result");

        return results.isArray() && !results.isEmpty() ? results.get(0) : null;
    }

    private boolean isError(JsonNode root) {
        return root.has("status") && "error".equals(root.get("status").asText());
    }

    private int parseIntOrDefault(String value, int fallback) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    // Picks a company logo image. Known brands map to their real domain;
    // anything else gets a best-guess "companyname.com" (may not always exist,
    // in which case the frontend just shows a text avatar instead).
    private String getLogoUrl(String companyName) {
        if (companyName == null) {
            return "";
        }

        String name = companyName.toLowerCase();
        Map<String, String> knownLogos = Map.ofEntries(
                Map.entry("tesla", "tesla.com"),
                Map.entry("apple", "apple.com"),
                Map.entry("microsoft", "microsoft.com"),
                Map.entry("amazon", "amazon.com"),
                Map.entry("google", "google.com"),
                Map.entry("alphabet", "google.com"),
                Map.entry("meta", "meta.com"),
                Map.entry("nvidia", "nvidia.com"),
                Map.entry("infosys", "infosys.com"),
                Map.entry("tata", "tcs.com"),
                Map.entry("reliance", "ril.com"),
                Map.entry("hdfc", "hdfcbank.com"),
                Map.entry("icici", "icicibank.com"));

        for (Map.Entry<String, String> entry : knownLogos.entrySet()) {
            if (name.contains(entry.getKey())) {
                return "https://logo.clearbit.com/" + entry.getValue();
            }
        }

        String guessedDomain = guessDomain(name);
        return guessedDomain != null ? "https://logo.clearbit.com/" + guessedDomain : "";
    }

    // Turns a company name into a likely domain, e.g. "Netflix, Inc." -> "netflix.com".
    private String guessDomain(String companyName) {
        String cleaned = companyName
                .replaceAll("\\b(inc|incorporated|corp|corporation|co|company|ltd|limited|plc|llc|group|holdings)\\b\\.?", "")
                .replaceAll("[^a-z0-9]", "")
                .trim();

        return cleaned.isEmpty() ? null : cleaned + ".com";
    }
}
