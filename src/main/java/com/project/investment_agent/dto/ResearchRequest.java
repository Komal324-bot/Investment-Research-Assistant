package com.project.investment_agent.dto;

import lombok.Data;

@Data
public class ResearchRequest {
    private String company;
    private boolean includeLiveData = true; // New field
}
