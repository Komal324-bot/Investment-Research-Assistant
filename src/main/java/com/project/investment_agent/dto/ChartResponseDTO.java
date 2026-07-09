package com.project.investment_agent.dto;

import java.util.List;

public class ChartResponseDTO {

    private String symbol;
    private String interval;
    private List<ChartPointDTO> points;

    public ChartResponseDTO() {
    }

    public ChartResponseDTO(String symbol, String interval, List<ChartPointDTO> points) {
        this.symbol = symbol;
        this.interval = interval;
        this.points = points;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getInterval() {
        return interval;
    }

    public void setInterval(String interval) {
        this.interval = interval;
    }

    public List<ChartPointDTO> getPoints() {
        return points;
    }

    public void setPoints(List<ChartPointDTO> points) {
        this.points = points;
    }
}
