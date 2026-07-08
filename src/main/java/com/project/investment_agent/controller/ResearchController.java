package com.project.investment_agent.controller;

import org.springframework.web.bind.annotation.*;

import com.project.investment_agent.dto.ResearchRequest;
import com.project.investment_agent.dto.ResearchResponse;
import com.project.investment_agent.service.GeminiService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ResearchController {

    private final GeminiService geminiService;

    public ResearchController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/research")
    public ResearchResponse analyze(@RequestBody ResearchRequest request) {

        String analysis = geminiService.askGemini(request.getCompany());

        return new ResearchResponse(
                request.getCompany(),
                analysis
        );
    }
}