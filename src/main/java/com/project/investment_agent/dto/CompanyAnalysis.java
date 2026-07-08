package com.project.investment_agent.dto;

import java.util.List;

import lombok.Data;

@Data
public class CompanyAnalysis {
     private String companyOverview;

    private List<String> pros;

    private List<String> cons;

    private String recommendation;

    private String reason;
}
