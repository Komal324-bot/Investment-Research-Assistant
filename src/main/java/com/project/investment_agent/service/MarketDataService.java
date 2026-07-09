package com.project.investment_agent.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.investment_agent.dto.StockDataDTO;
import com.project.investment_agent.dto.ChartPointDTO;
import com.project.investment_agent.dto.ChartResponseDTO;
import com.project.investment_agent.dto.NewsItemDTO;
import com.project.investment_agent.dto.NewsResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MarketDataService {

    @Value("${twelvedata.api.key}")
    private String apiKey;

    @Value("${finnhub.api.key}")
    private String finnhubApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public StockDataDTO getStockData(String company) {

        try {

            String symbol = resolveSymbol(company);

            if (symbol == null) {
                return null;
            }

            String url = String.format(
                    "https://api.twelvedata.com/quote?symbol=%s&apikey=%s",
                    symbol,
                    apiKey);

            System.out.println("\n========== TWELVE DATA ==========");
            System.out.println(url);

            String response = restTemplate.getForObject(url, String.class);

            System.out.println(response);

            JsonNode root = mapper.readTree(response);

            if (root.has("status") &&
                    "error".equals(root.get("status").asText())) {

                System.out.println(root.get("message").asText());
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

            JsonNode week52 = root.path("fifty_two_week");

            stock.setWeekHigh52(
                    week52.path("high").asDouble());

            stock.setWeekLow52(
                    week52.path("low").asDouble());

            System.out.println("\n===== PARSED STOCK DATA =====");

            System.out.println("Company : " + stock.getCompanyName());
            System.out.println("Symbol : " + stock.getSymbol());
            System.out.println("Exchange : " + stock.getExchange());
            System.out.println("Currency : " + stock.getCurrency());

            System.out.println("Price : " + stock.getCurrentPrice());
            System.out.println("Open : " + stock.getOpen());
            System.out.println("High : " + stock.getHigh());
            System.out.println("Low : " + stock.getLow());

            System.out.println("Previous Close : " + stock.getPreviousClose());

            System.out.println("Volume : " + stock.getVolume());

            System.out.println("Change : " + stock.getChange());

            System.out.println("Change % : " + stock.getChangePercent());

            System.out.println("52W High : " + stock.getWeekHigh52());

            System.out.println("52W Low : " + stock.getWeekLow52());

            System.out.println("=============================\n");

            return stock;

        } catch (Exception e) {

            e.printStackTrace();

            return null;

        }

    }

    public String resolveSymbol(String company) {

        company = company.trim().toLowerCase();

        switch (company) {

            // US

            case "tesla":
                return "TSLA";

            case "apple":
                return "AAPL";

            case "microsoft":
                return "MSFT";

            case "amazon":
                return "AMZN";

            case "google":
            case "alphabet":
                return "GOOGL";

            case "meta":
            case "facebook":
                return "META";

            case "nvidia":
                return "NVDA";

            // INDIA

            case "tcs":
                return "TCS";

            case "infosys":
                return "INFY";

            case "reliance":
                return "RELIANCE";

            case "hdfc bank":
                return "HDFCBANK";

            case "icici bank":
                return "ICICIBANK";

            case "sbi":
                return "SBIN";

            default:
                return company.toUpperCase();

        }

    }
    private String getLogoUrl(String companyName) {

    if (companyName == null)
        return "";

    companyName = companyName.toLowerCase();

    if (companyName.contains("tesla"))
        return "https://logo.clearbit.com/tesla.com";

    if (companyName.contains("apple"))
        return "https://logo.clearbit.com/apple.com";

    if (companyName.contains("microsoft"))
        return "https://logo.clearbit.com/microsoft.com";

    if (companyName.contains("amazon"))
        return "https://logo.clearbit.com/amazon.com";

    if (companyName.contains("google") || companyName.contains("alphabet"))
        return "https://logo.clearbit.com/google.com";

    if (companyName.contains("meta"))
        return "https://logo.clearbit.com/meta.com";

    if (companyName.contains("nvidia"))
        return "https://logo.clearbit.com/nvidia.com";

    if (companyName.contains("infosys"))
        return "https://logo.clearbit.com/infosys.com";

    if (companyName.contains("tata"))
        return "https://logo.clearbit.com/tcs.com";

    if (companyName.contains("reliance"))
        return "https://logo.clearbit.com/ril.com";

    if (companyName.contains("hdfc"))
        return "https://logo.clearbit.com/hdfcbank.com";

    if (companyName.contains("icici"))
        return "https://logo.clearbit.com/icicibank.com";

    // Generic fallback for any company not covered above: derive a best-guess
    // domain from the company name and let Clearbit's logo API resolve it.
    // This makes the logo work for whatever company was searched, not just
    // the hardcoded few, at the cost of occasionally guessing wrong for
    // companies whose common name doesn't match their domain.
    String guessedDomain = guessDomain(companyName);

    if (guessedDomain != null)
        return "https://logo.clearbit.com/" + guessedDomain;

    return "";
}

    /**
     * Turns a free-text company name into a plausible root domain, e.g.
     * "Netflix, Inc." -> "netflix.com". Strips common legal suffixes and
     * non-alphanumeric characters, then appends ".com". This is only a guess —
     * Clearbit's logo endpoint simply 404s (frontend falls back to the
     * initial-letter avatar) when the guess is wrong.
     */
    private String guessDomain(String companyName) {

        if (companyName == null || companyName.isBlank())
            return null;

        String cleaned = companyName.toLowerCase()
                .replaceAll("\\b(inc|incorporated|corp|corporation|co|company|ltd|limited|plc|llc|group|holdings)\\b\\.?", "")
                .replaceAll("[^a-z0-9]", "")
                .trim();

        if (cleaned.isEmpty())
            return null;

        return cleaned + ".com";
    }

    /**
     * Fetches historical OHLC data for the price chart.
     * interval e.g. "1min", "5min", "1day", "1week"
     * outputsize is how many candles to return (Twelve Data caps this per plan).
     */
    public ChartResponseDTO getTimeSeries(String company, String interval, String outputsize) {

        String symbol = resolveSymbol(company);

        if (symbol == null) {
            return null;
        }

        try {
            String url = String.format(
                    "https://api.twelvedata.com/time_series?symbol=%s&interval=%s&outputsize=%s&apikey=%s",
                    symbol, interval, outputsize, apiKey);

            System.out.println("\n========== TWELVE DATA (time_series) ==========");
            System.out.println(url);

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = mapper.readTree(response);

            if (root.has("status") && "error".equals(root.get("status").asText())) {
                System.out.println(root.path("message").asText());
                return new ChartResponseDTO(symbol, interval, new java.util.ArrayList<>());
            }

            java.util.List<ChartPointDTO> points = new java.util.ArrayList<>();
            JsonNode values = root.path("values");

            if (values.isArray()) {
                for (JsonNode node : values) {
                    points.add(new ChartPointDTO(
                            node.path("datetime").asText(),
                            node.path("close").asDouble()));
                }
            }

            // Twelve Data returns newest-first; chart wants oldest-first.
            java.util.Collections.reverse(points);

            return new ChartResponseDTO(symbol, interval, points);

        } catch (Exception e) {
            e.printStackTrace();
            return new ChartResponseDTO(symbol, interval, new java.util.ArrayList<>());
        }
    }

    /**
     * Fetches recent news for the company from Finnhub's free /company-news endpoint
     * (Twelve Data's news isn't on our current plan). Finnhub's free tier covers US-listed
     * tickers well; symbols it doesn't recognize (e.g. some non-US exchanges) will just
     * come back empty, so we return available=false and let the frontend show a graceful
     * empty state instead of crashing or showing fabricated headlines.
     */
    public NewsResponseDTO getNews(String company) {

        String symbol = resolveSymbol(company);

        if (symbol == null || finnhubApiKey == null || finnhubApiKey.isBlank()
                || finnhubApiKey.startsWith("YOUR_")) {
            return new NewsResponseDTO(company, new java.util.ArrayList<>(), false);
        }

        try {
            java.time.LocalDate to = java.time.LocalDate.now();
            java.time.LocalDate from = to.minusDays(30);

            String url = String.format(
                    "https://finnhub.io/api/v1/company-news?symbol=%s&from=%s&to=%s&token=%s",
                    symbol, from, to, finnhubApiKey);

            System.out.println("\n========== FINNHUB (company-news) ==========");
            System.out.println(url.replace(finnhubApiKey, "***"));

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = mapper.readTree(response);

            // Finnhub returns {"error": "..."} on bad symbol/token instead of an array.
            if (root.has("error")) {
                System.out.println(root.get("error").asText());
                return new NewsResponseDTO(symbol, new java.util.ArrayList<>(), false);
            }

            java.util.List<NewsItemDTO> articles = new java.util.ArrayList<>();

            if (root.isArray()) {
                for (JsonNode node : root) {
                    long epochSeconds = node.path("datetime").asLong(0);
                    String publishedAt = epochSeconds > 0
                            ? java.time.format.DateTimeFormatter.ofPattern("MMM d, yyyy")
                                    .withZone(java.time.ZoneOffset.UTC)
                                    .format(java.time.Instant.ofEpochSecond(epochSeconds))
                            : "";

                    articles.add(new NewsItemDTO(
                            node.path("headline").asText(""),
                            node.path("url").asText(""),
                            node.path("source").asText(""),
                            publishedAt));
                }
            }

            // Finnhub already returns newest-first; cap it so the frontend isn't flooded.
            java.util.List<NewsItemDTO> capped = articles.size() > 20
                    ? articles.subList(0, 20)
                    : articles;

            return new NewsResponseDTO(symbol, capped, true);

        } catch (Exception e) {
            e.printStackTrace();
            return new NewsResponseDTO(symbol, new java.util.ArrayList<>(), false);
        }
    }

}