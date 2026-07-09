package com.project.investment_agent.dto;

public class ChartPointDTO {

    private String datetime;
    private double close;

    public ChartPointDTO() {
    }

    public ChartPointDTO(String datetime, double close) {
        this.datetime = datetime;
        this.close = close;
    }

    public String getDatetime() {
        return datetime;
    }

    public void setDatetime(String datetime) {
        this.datetime = datetime;
    }

    public double getClose() {
        return close;
    }

    public void setClose(double close) {
        this.close = close;
    }
}
