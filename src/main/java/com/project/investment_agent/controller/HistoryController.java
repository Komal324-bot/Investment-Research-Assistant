package com.project.investment_agent.controller;

import com.project.investment_agent.dto.ResearchHistoryDTO;
import com.project.investment_agent.entity.ResearchHistory;
import com.project.investment_agent.repository.ResearchHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "http://localhost:5173")
public class HistoryController {

    private final ResearchHistoryRepository historyRepository;

    public HistoryController(ResearchHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @GetMapping
    public ResponseEntity<List<ResearchHistoryDTO>> getHistory() {
        List<ResearchHistory> history = historyRepository.findAll();
        List<ResearchHistoryDTO> dtos = history.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ResearchHistoryDTO>> getRecentHistory() {
        List<ResearchHistory> history = historyRepository.findAll();
        // Get last 10 entries
        List<ResearchHistoryDTO> dtos = history.stream()
                .limit(10)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Long id) {
        historyRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearHistory() {
        historyRepository.deleteAll();
        return ResponseEntity.ok().build();
    }

    private ResearchHistoryDTO convertToDTO(ResearchHistory history) {
        ResearchHistoryDTO dto = new ResearchHistoryDTO();
        dto.setId(history.getId());
        dto.setCompanyName(history.getCompanyName());
        dto.setQuery(history.getQuery());
        dto.setAiResponse(history.getAiResponse());
        dto.setCreatedAt(history.getCreatedAt());
        return dto;
    }
}