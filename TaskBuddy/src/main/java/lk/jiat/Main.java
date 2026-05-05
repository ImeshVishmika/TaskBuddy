package lk.jiat;

import lk.jiat.config.AppConfig;
import lk.jiat.util.HibernateUtil;
import org.apache.catalina.Context;
import org.apache.catalina.LifecycleException;
import org.apache.catalina.startup.Tomcat;
import org.glassfish.jersey.servlet.ServletContainer;

import java.io.File;

public class Main {

    public static void main(String[] args) {
        //Initialize Hibernate Connection

        System.out.println("Initializing Database...");
        try {
            HibernateUtil.getSessionFactory();
        } catch (Exception e) {
            System.err.println("Database Connection Failed: " + e.getMessage());
            return; // Stop if DB fails
        }

        // Configure Tomcat Server
        Tomcat tomcat = new Tomcat();

        tomcat.setPort(8080);
        tomcat.getConnector(); // Initialize default connector

        // Create Context
        String docBase = new File(".").getAbsolutePath();
        Context context = tomcat.addContext("", docBase);

        //  Register REST API (Jersey)
        // We map it to "/api/*" so your endpoints will be http://localhost:8080/api/tasks
        ServletContainer servletContainer = new ServletContainer(new AppConfig());
        Tomcat.addServlet(context, "JerseyServlet", servletContainer);
        context.addServletMappingDecoded("/api/*", "JerseyServlet");

        //  Start Server
        try {
            System.out.println("✅ Server Started! API available at http://localhost:8080/api/tasks");
            tomcat.start();
            tomcat.getServer().await();
        } catch (LifecycleException e) {
            e.printStackTrace();
        }
    }
}