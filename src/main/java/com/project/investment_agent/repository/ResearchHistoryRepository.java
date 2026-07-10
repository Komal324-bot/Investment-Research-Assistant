package com.project.investment_agent.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.investment_agent.entity.ResearchHistory;

@Repository
public interface ResearchHistoryRepository extends JpaRepository<ResearchHistory, Long> {

    List<ResearchHistory> findByPinnedTrue();

    List<ResearchHistory> findByUsernameOrderByCreatedAtDesc(String username);

    List<ResearchHistory> findByUsernameAndPinnedTrue(String username);

    Optional<ResearchHistory> findByIdAndUsername(Long id, String username);

    void deleteByUsername(String username);
}