package lk.jiat.config;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;

@Provider
public class CorsFilter implements ContainerResponseFilter {

    @Override
    public void filter(ContainerRequestContext requestContext,
                       ContainerResponseContext responseContext) throws IOException {

        // allow any website to connect (*)
        responseContext.getHeaders().add(
                "Access-Control-Allow-Origin", "*");

        //Allow these standard methods
        responseContext.getHeaders().add(
                "Access-Control-Allow-Headers",
                "origin, content-type, accept, authorization");

        // allow these HTTP verbs
        responseContext.getHeaders().add(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS, HEAD");
    }
}