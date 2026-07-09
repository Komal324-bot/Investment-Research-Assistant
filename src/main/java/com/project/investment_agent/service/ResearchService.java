package com.project.investment_agent.service;

import org.springframework.stereotype.Service;

import com.project.investment_agent.dto.ResearchRequest;
import com.project.investment_agent.dto.ResearchResponse;

@Service
public class ResearchService {

    private final GeminiService geminiService;

    public ResearchService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    public ResearchResponse analyzeCompany(ResearchRequest request) {
        System.out.println("Calling Gemini for: " + request.getCompany());
        System.out.println("Include live data: " + request.isIncludeLiveData());
        
        ResearchResponse response = geminiService.askGemini(
            request.getCompany(), 
            request.isIncludeLiveData()
        );
        
        System.out.println("Gemini finished.");
        return response;
    }
}