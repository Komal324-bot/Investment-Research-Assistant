package com.project.investment_agent.dto;

public class StockDataDTO {

    private String symbol;
    private String companyName;
    private String exchange;
    private String currency;

    private double currentPrice;
    private double open;
    private double high;
    private double low;
    private double previousClose;

    private double volume;

    private double change;
    private double changePercent;

    private double weekHigh52;
    private double weekLow52;
    private String logoUrl;

public String getLogoUrl() {
    return logoUrl;
}

public void setLogoUrl(String logoUrl) {
    this.logoUrl = logoUrl;
}

    // Getters & Setters

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getExchange() {
        return exchange;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public double getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public double getOpen() {
        return open;
    }

    public void setOpen(double open) {
        this.open = open;
    }

    public double getHigh() {
        return high;
    }

    public void setHigh(double high) {
        this.high = high;
    }

    public double getLow() {
        return low;
    }

    public void setLow(double low) {
        this.low = low;
    }

    public double getPreviousClose() {
        return previousClose;
    }

    public void setPreviousClose(double previousClose) {
        this.previousClose = previousClose;
    }

    public double getVolume() {
        return volume;
    }

    public void setVolume(double volume) {
        this.volume = volume;
    }

    public double getChange() {
        return change;
    }

    public void setChange(double change) {
        this.change = change;
    }

    public double getChangePercent() {
        return changePercent;
    }

    public void setChangePercent(double changePercent) {
        this.changePercent = changePercent;
    }

    public double getWeekHigh52() {
        return weekHigh52;
    }

    public void setWeekHigh52(double weekHigh52) {
        this.weekHigh52 = weekHigh52;
    }

    public double getWeekLow52() {
        return weekLow52;
    }

    public void setWeekLow52(double weekLow52) {
        this.weekLow52 = weekLow52;
    }
}