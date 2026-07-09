package com.project.investment_agent.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.investment_agent.dto.StockDataDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MarketDataService {

    @Value("${twelvedata.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public StockDataDTO getStockData(String company) {

        try {

            String symbol = getSymbol(company);

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

    private String getSymbol(String company) {

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

    return "";
}

}