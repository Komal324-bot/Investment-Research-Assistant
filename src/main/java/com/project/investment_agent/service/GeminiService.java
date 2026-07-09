package com.project.investment_agent.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.investment_agent.dto.ResearchResponse;
import com.project.investment_agent.dto.StockDataDTO;
import com.project.investment_agent.entity.ResearchHistory;
import com.project.investment_agent.repository.ResearchHistoryRepository;

@Service
public class GeminiService {

    @Autowired
    private ResearchHistoryRepository researchHistoryRepository;

    @Autowired
    private MarketDataService marketDataService;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    private final ObjectMapper mapper = new ObjectMapper();

    public ResearchResponse askGemini(String company, boolean includeLiveData) {

    try {
        StockDataDTO stockData = null;

        if (includeLiveData) {
            stockData = marketDataService.getStockData(company);
        }

        String prompt = buildPrompt(company, stockData);

       String body = mapper.writeValueAsString(
    Map.of(
        "contents",
        List.of(
            Map.of(
                "parts",
                List.of(
                    Map.of("text", prompt)
                )
            )
        ),
        "generationConfig",
        Map.of(
            "responseMimeType", "application/json"
        )
    )
);

        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + model + ":generateContent?key=" + apiKey;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response =
                client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException(response.body());
        }

        JsonNode root = mapper.readTree(response.body());
        JsonNode candidates = root.path("candidates");

        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new RuntimeException("Gemini returned no candidates:\n" + response.body());
        }

        String json = root.get("candidates")
                .get(0)
                .get("content")
                .get("parts")
                .get(0)
                .get("text")
                .asText();

        // Remove markdown if Gemini returns it
        json = json.replace("```json", "")
                   .replace("```", "")
                   .trim();

        // Print Gemini response
        System.out.println("\n================ GEMINI RESPONSE ================\n");
        System.out.println(json);
        System.out.println("\n=================================================\n");

        // Validate JSON
        try {
            mapper.readTree(json);
        } catch (Exception ex) {
            throw new RuntimeException("Gemini returned INVALID JSON:\n\n" + json, ex);
        }

        ResearchResponse researchResponse =
                mapper.readValue(json, ResearchResponse.class);

        researchResponse.setCompany(company);

        if (stockData != null) {
            researchResponse.setStockData(stockData);
        }

        researchResponse.setTimestamp(
                LocalDateTime.now()
                        .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        ResearchHistory history = new ResearchHistory();
        history.setCompanyName(company);
        history.setQuery("Investment analysis for " + company);
        history.setAiResponse(json);
        history.setCreatedAt(LocalDateTime.now());

        researchHistoryRepository.save(history);

        return researchResponse;

    } catch (Exception e) {
        e.printStackTrace();
        throw new RuntimeException("Gemini API Error: " + e.getMessage(), e);
    }
}

    private String buildPrompt(String company, StockDataDTO stockData) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a professional investment research analyst.\n\n");
        prompt.append("Analyze the company ").append(company).append(".\n\n");

        if (stockData != null) {
            prompt.append("Here is the live market data for this company:\n");
            prompt.append("- Current Price: $").append(stockData.getCurrentPrice()).append("\n");
            prompt.append("- 52-Week High: $").append(stockData.getWeekHigh52()).append("\n");
            prompt.append("- 52-Week Low: $").append(stockData.getWeekLow52()).append("\n");
            prompt.append("- Volume: ").append(stockData.getVolume()).append("\n");
            prompt.append("- Today's Change: ").append(stockData.getChangePercent()).append("%\n\n");
        }

        prompt.append("Return ONLY valid JSON.\n\n");
        prompt.append("{\n");
        prompt.append("  \"companyOverview\":\"\",\n");
        prompt.append("  \"sector\":\"\",\n");
        prompt.append("  \"marketCap\":\"\",\n");
        prompt.append("  \"peRatio\":\"\",\n");
        prompt.append("  \"pros\":[],\n");
        prompt.append("  \"cons\":[],\n");
        prompt.append("  \"recommendation\":\"\",\n");
        prompt.append("  \"reason\":\"\",\n");
        prompt.append("  \"riskLevel\":\"\",\n");
        prompt.append("  \"growthPotential\":\"\",\n");
        prompt.append("  \"competitors\":[]\n");
        prompt.append("}\n\n");
        prompt.append("Rules:\n");
        prompt.append("- Return ONLY JSON.\n");
        prompt.append("- No markdown.\n");
        prompt.append("- No ```json.\n");
        prompt.append("- recommendation must be BUY, HOLD or SELL.\n");
        prompt.append("- Give exactly 5 pros.\n");
        prompt.append("- Give exactly 5 cons.\n");
        prompt.append("- Give exactly 5 competitors.\n");
        prompt.append("- Use the live market data to inform your analysis.\n");

        return prompt.toString();
    }
}