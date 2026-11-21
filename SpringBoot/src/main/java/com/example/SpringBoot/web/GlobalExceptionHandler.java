package com.example.SpringBoot.web;

import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.example.SpringBoot.dto.Dtos.MessageResponse;

/** Turns exceptions into {"message": "..."} without leaking internal details. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    ResponseEntity<MessageResponse> api(ApiException e) {
        return ResponseEntity.status(e.getStatus()).body(new MessageResponse(e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<MessageResponse> invalid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + " : " + f.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(new MessageResponse("Données invalides (" + msg + ")"));
    }

    @ExceptionHandler({ HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            HandlerMethodValidationException.class, MissingServletRequestPartException.class })
    ResponseEntity<MessageResponse> badRequest(Exception e) {
        return ResponseEntity.badRequest().body(new MessageResponse("Requête invalide"));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<MessageResponse> tooLarge() {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(new MessageResponse("Image trop lourde (5 Mo maximum)"));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<MessageResponse> method() {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(new MessageResponse("Méthode non autorisée"));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<MessageResponse> notFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Ressource introuvable"));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<MessageResponse> unexpected(Exception e) {
        if (e instanceof ErrorResponse framework && framework.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(framework.getStatusCode()).body(new MessageResponse("Requête invalide"));
        }
        log.error("Unexpected error", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Erreur interne du serveur"));
    }
}
