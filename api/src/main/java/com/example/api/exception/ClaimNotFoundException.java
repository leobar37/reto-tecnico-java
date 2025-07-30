package com.example.api.exception;

public class ClaimNotFoundException extends RuntimeException {
    public ClaimNotFoundException(String message) {
        super(message);
    }
    
    public ClaimNotFoundException(Long id) {
        super("Claim not found with id: " + id);
    }
}