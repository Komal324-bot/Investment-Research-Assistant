package com.project.investment_agent.controller;

import com.project.investment_agent.dto.ResearchHistoryDTO;
import com.project.investment_agent.entity.ResearchHistory;
import com.project.investment_agent.exception.ResourceNotFoundException;
import com.project.investment_agent.repository.ResearchHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/history")

public class HistoryController {

    private final ResearchHistoryRepository historyRepository;

    public HistoryController(ResearchHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @GetMapping
    public ResponseEntity<List<ResearchHistoryDTO>> getHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        List<ResearchHistory> history = historyRepository.findByUsernameOrderByCreatedAtDesc(username);
        List<ResearchHistoryDTO> dtos = history.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ResearchHistoryDTO>> getRecentHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        List<ResearchHistory> history = historyRepository.findByUsernameOrderByCreatedAtDesc(username);
        // Get last 10 entries
        List<ResearchHistoryDTO> dtos = history.stream()
                .limit(10)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/watchlist")
    public ResponseEntity<List<ResearchHistoryDTO>> getWatchlist() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        List<ResearchHistory> pinned = historyRepository.findByUsernameAndPinnedTrue(username);
        List<ResearchHistoryDTO> dtos = pinned.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PatchMapping("/{id}/pin")
    public ResponseEntity<ResearchHistoryDTO> setPinned(
            @PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean pinned = body.getOrDefault("pinned", true);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        return historyRepository.findByIdAndUsername(id, username)
                .map(history -> {
                    history.setPinned(pinned);
                    historyRepository.save(history);
                    return ResponseEntity.ok(convertToDTO(history));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Long id) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        ResearchHistory history = historyRepository
                .findByIdAndUsername(id, username)
                .orElseThrow(() -> new ResourceNotFoundException("History not found."));

        historyRepository.delete(history);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        historyRepository.deleteByUsername(username);
        return ResponseEntity.ok().build();
    }

    private ResearchHistoryDTO convertToDTO(ResearchHistory history) {
        ResearchHistoryDTO dto = new ResearchHistoryDTO();
        dto.setId(history.getId());
        dto.setCompanyName(history.getCompanyName());
        dto.setQuery(history.getQuery());
        dto.setAiResponse(history.getAiResponse());
        dto.setCreatedAt(history.getCreatedAt());
        dto.setPinned(Boolean.TRUE.equals(history.getPinned()));
        dto.setUsername(history.getUsername());
        return dto;
    }
}