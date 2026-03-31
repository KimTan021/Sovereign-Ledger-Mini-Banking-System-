package com.sovereign_ledger.config;

import jakarta.persistence.EntityManagerFactory;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;

@Configuration
public class FlywayConfig {

    @Bean
    public Flyway flyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .baselineOnMigrate(true)
                .locations("classpath:db/migration")
                .load();
        
        flyway.repair();
        flyway.migrate();
        
        return flyway;
    }

    @Bean
    public static BeanFactoryPostProcessor entityManagerFactoryDependsOnFlyway() {
        return beanFactory -> {
            String[] entityManagerFactories = beanFactory.getBeanNamesForType(EntityManagerFactory.class, true, false);
            for (String beanName : entityManagerFactories) {
                addDependsOn(beanFactory, beanName, "flyway");
            }
        };
    }

    private static void addDependsOn(ConfigurableListableBeanFactory beanFactory, String beanName, String dependency) {
        String[] existingDependencies = beanFactory.getBeanDefinition(beanName).getDependsOn();
        Set<String> dependencies = new LinkedHashSet<>();
        if (existingDependencies != null) {
            dependencies.addAll(Arrays.asList(existingDependencies));
        }
        dependencies.add(dependency);
        beanFactory.getBeanDefinition(beanName).setDependsOn(dependencies.toArray(String[]::new));
    }
}
