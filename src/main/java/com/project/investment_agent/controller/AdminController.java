package com.project.investment_agent.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminController {

    @GetMapping("/admin/test")
    public String adminTest() {
        return "Welcome Admin!";
    }
}