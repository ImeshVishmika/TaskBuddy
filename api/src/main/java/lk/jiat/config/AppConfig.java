package lk.jiat.config;

import org.glassfish.jersey.server.ResourceConfig;

public class AppConfig extends ResourceConfig {
    public AppConfig() {
        // Scan controllers
        packages("lk.jiat.controller");

        //Register the CORS Filter
        register(CorsFilter.class);
    }
}