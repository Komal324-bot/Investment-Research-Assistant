package com.project.investment_agent.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.investment_agent.dto.ResearchResponse;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    private final ObjectMapper mapper = new ObjectMapper();

    public ResearchResponse askGemini(String company) {

        try {

            String prompt = """
                    You are a professional investment research analyst.

                    Analyze the company %s.

                    Return ONLY valid JSON.

                    {
                      "companyOverview":"",
                      "sector":"",
                      "marketCap":"",
                      "pros":[],
                      "cons":[],
                      "recommendation":"",
                      "reason":"",
                      "riskLevel":"",
                      "growthPotential":"",
                      "competitors":[]
                    }

                    Rules:
                    - Return ONLY JSON.
                    - No markdown.
                    - No ```json.
                    - recommendation must be BUY, HOLD or SELL.
                    - Give exactly 5 pros.
                    - Give exactly 5 cons.
                    - Give exactly 5 competitors.
                    """.formatted(company);

            String body = mapper.writeValueAsString(
                    java.util.Map.of(
                            "contents",
                            new Object[]{
                                    java.util.Map.of(
                                            "parts",
                                            new Object[]{
                                                    java.util.Map.of("text", prompt)
                                            })
                            }));

            String url =
                    "https://generativelanguage.googleapis.com/v1beta/models/"
                            + model
                            + ":generateContent?key="
                            + apiKey;

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

            String json = root.get("candidates")
                    .get(0)
                    .get("content")
                    .get("parts")
                    .get(0)
                    .get("text")
                    .asText();
System.out.println("========== GEMINI JSON ==========");
System.out.println(json);
System.out.println("=================================");
            // Convert Gemini JSON into Java object
            ResearchResponse researchResponse =
                    mapper.readValue(json, ResearchResponse.class);

            // Set company name
            researchResponse.setCompany(company);

            return researchResponse;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Gemini API Error: " + e.getMessage(), e);
        }
    }
}