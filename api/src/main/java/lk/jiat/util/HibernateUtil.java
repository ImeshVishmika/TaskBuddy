package lk.jiat.util;

import io.github.cdimascio.dotenv.Dotenv;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class HibernateUtil {
    private static final SessionFactory sessionFactory = buildSessionFactory();

    private static SessionFactory buildSessionFactory() {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory(".")
                    .ignoreIfMissing()
                    .load();

            Configuration configuration = new Configuration().configure();
            configuration.setProperty("connection.url", getRequiredValue(dotenv, "DB_URL"));
            configuration.setProperty("connection.username", getRequiredValue(dotenv, "DB_USERNAME"));
            configuration.setProperty("connection.password", getRequiredValue(dotenv, "DB_PASSWORD"));

            return configuration.buildSessionFactory();
        } catch (Throwable ex) {
            System.err.println("Initial SessionFactory creation failed." + ex);
            throw new ExceptionInInitializerError(ex);
        }
    }

    private static String getRequiredValue(Dotenv dotenv, String key) {
        String value = dotenv.get(key);
        if (value == null || value.isBlank()) {
            value = System.getenv(key);
        }
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing required database environment variable: " + key);
        }
        return value;
    }

    public static SessionFactory getSessionFactory() {
        return sessionFactory;
    }
}