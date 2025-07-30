package com.example.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/")
@Tag(name = "Hello", description = "Test endpoint for API verification")
public class HelloController {

    @GetMapping("/hello")
    @Operation(
        summary = "Test endpoint", 
        description = "Simple test endpoint to verify API is running correctly"
    )
    @ApiResponse(responseCode = "200", description = "Success")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Welcome to the Claims Management API! System is ready and connected to database.");
    }
}