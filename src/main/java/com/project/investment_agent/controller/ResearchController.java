package com.project.investment_agent.controller;

import org.springframework.web.bind.annotation.*;

import com.project.investment_agent.dto.ResearchRequest;
import com.project.investment_agent.dto.ResearchResponse;
import com.project.investment_agent.service.ResearchService;

@RestController
@RequestMapping("/api")

public class ResearchController {

    private final ResearchService researchService;

    public ResearchController(ResearchService researchService) {
        this.researchService = researchService;
    }

    @PostMapping("/research")
    public ResearchResponse analyze(@RequestBody ResearchRequest request) {

        return researchService.analyzeCompany(request);
    }
}