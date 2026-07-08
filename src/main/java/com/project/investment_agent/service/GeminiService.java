package com.project.investment_agent.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    private final ObjectMapper mapper = new ObjectMapper();

    public String askGemini(String company) {

        try {

            String prompt = """
                    Analyze the company %s as an investment.

                    Give:

                    1. Company Overview

                    2. Pros

                    3. Cons

                    4. Recommendation (BUY / HOLD / SELL)
                    """.formatted(company);

            String body = mapper.writeValueAsString(
                    java.util.Map.of(
                            "contents",
                            new Object[] {
                                    java.util.Map.of(
                                            "parts",
                                            new Object[] {
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

            System.out.println(response.body());

            if (response.statusCode() != 200) {
                return response.body();
            }

            JsonNode root = mapper.readTree(response.body());

            return root.get("candidates")
                    .get(0)
                    .get("content")
                    .get("parts")
                    .get(0)
                    .get("text")
                    .asText();

        } catch (Exception e) {

            e.printStackTrace();

            return "ERROR : " + e.getMessage();
        }

    }

}