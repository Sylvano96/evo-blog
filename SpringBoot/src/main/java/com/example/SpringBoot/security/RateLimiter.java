package com.example.SpringBoot.security;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.example.SpringBoot.web.ApiException;

/**
 * Small in-memory fixed-window rate limiter, used to slow down password and
 * activation-code brute forcing. (For several instances, use a shared store.)
 */
@Component
public class RateLimiter {

    private record Window(long start, int count) {
    }

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    public void check(String key, int max, Duration period) {
        long now = System.currentTimeMillis();
        long length = period.toMillis();
        Window w = windows.compute(key, (k, cur) -> (cur == null || now - cur.start() >= length)
                ? new Window(now, 1)
                : new Window(cur.start(), cur.count() + 1));
        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(e -> now - e.getValue().start() >= length);
        }
        if (w.count() > max) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Trop de tentatives, réessayez plus tard.");
        }
    }
}
