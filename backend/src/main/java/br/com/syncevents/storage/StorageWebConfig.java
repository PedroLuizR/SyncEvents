package br.com.syncevents.storage;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Serve os uploads locais em /files/**. */
@Configuration
public class StorageWebConfig implements WebMvcConfigurer {

    private final LocalStorageService storage;

    public StorageWebConfig(LocalStorageService storage) {
        this.storage = storage;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/files/**")
                .addResourceLocations(storage.getRaiz().toUri().toString() + "/");
    }
}
