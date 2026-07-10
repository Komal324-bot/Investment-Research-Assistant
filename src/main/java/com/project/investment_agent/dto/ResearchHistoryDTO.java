package com.project.investment_agent.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResearchHistoryDTO {
    private Long id;
    private String companyName;
    private String query;
    private String aiResponse;
    private LocalDateTime createdAt;
    private Boolean pinned;
    private String username;
}