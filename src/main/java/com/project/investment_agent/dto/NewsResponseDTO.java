package com.project.investment_agent.dto;

import java.util.List;

public class NewsResponseDTO {

    private String symbol;
    private List<NewsItemDTO> articles;
    private boolean available;

    public NewsResponseDTO() {
    }

    public NewsResponseDTO(String symbol, List<NewsItemDTO> articles, boolean available) {
        this.symbol = symbol;
        this.articles = articles;
        this.available = available;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public List<NewsItemDTO> getArticles() {
        return articles;
    }

    public void setArticles(List<NewsItemDTO> articles) {
        this.articles = articles;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
