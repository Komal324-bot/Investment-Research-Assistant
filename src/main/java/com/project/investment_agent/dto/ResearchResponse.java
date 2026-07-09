package com.project.investment_agent.dto;

import java.util.List;

public class ResearchResponse {

    private String company;

    private String companyOverview;

    private String sector;

    private String marketCap;

    private List<String> pros;

    private List<String> cons;

    private String recommendation;

    private String reason;

    private String riskLevel;

    private String growthPotential;

    private String peRatio;

    private List<String> competitors;

    public StockDataDTO getStockData() {
        return stockData;
    }

    public void setStockData(StockDataDTO stockData) {
        this.stockData = stockData;
    }

    public String getPeRatio() {
        return peRatio;
    }

    public void setPeRatio(String peRatio) {
        this.peRatio = peRatio;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    private StockDataDTO stockData;
    private String timestamp;

    public ResearchResponse() {
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getCompanyOverview() {
        return companyOverview;
    }

    public void setCompanyOverview(String companyOverview) {
        this.companyOverview = companyOverview;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public String getMarketCap() {
        return marketCap;
    }

    public void setMarketCap(String marketCap) {
        this.marketCap = marketCap;
    }

    public List<String> getPros() {
        return pros;
    }

    public void setPros(List<String> pros) {
        this.pros = pros;
    }

    public List<String> getCons() {
        return cons;
    }

    public void setCons(List<String> cons) {
        this.cons = cons;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getGrowthPotential() {
        return growthPotential;
    }

    public void setGrowthPotential(String growthPotential) {
        this.growthPotential = growthPotential;
    }

    public List<String> getCompetitors() {
        return competitors;
    }

    public void setCompetitors(List<String> competitors) {
        this.competitors = competitors;
    }
}