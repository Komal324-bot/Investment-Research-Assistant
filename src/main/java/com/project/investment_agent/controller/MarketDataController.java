package com.project.investment_agent.controller;

import org.springframework.web.bind.annotation.*;

import com.project.investment_agent.dto.ChartResponseDTO;
import com.project.investment_agent.dto.NewsResponseDTO;
import com.project.investment_agent.service.MarketDataService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class MarketDataController {

    private final MarketDataService marketDataService;

    public MarketDataController(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    @GetMapping("/chart")
    public ChartResponseDTO getChart(
            @RequestParam String company,
            @RequestParam(defaultValue = "1day") String interval,
            @RequestParam(defaultValue = "30") String outputsize) {

        return marketDataService.getTimeSeries(company, interval, outputsize);
    }

    @GetMapping("/news")
    public NewsResponseDTO getNews(@RequestParam String company) {
        return marketDataService.getNews(company);
    }
}
