package com.example.SpringBoot.config;

import java.time.Duration;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.example.SpringBoot.service.ImageStorageService;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final ImageStorageService storage;

    public WebConfig(ImageStorageService storage) {
        this.storage = storage;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Uploaded names are random UUIDs, so the files can be cached for a long time.
        registry.addResourceHandler("/images/**")
                .addResourceLocations(storage.getDirectory().toUri().toString())
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic());
    }
}
