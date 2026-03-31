package com.sovereign_ledger.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.databind.deser.std.StdScalarDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.util.Set;

/**
 * Global Jackson configuration to automatically trim leading/trailing whitespace 
 * from all incoming JSON string values, with specific exclusions for security-sensitive fields.
 */
@Configuration
public class JacksonConfig {

    private static final Set<String> SKIP_TRIMMING_FIELDS = Set.of(
        "password", 
        "newPassword", 
        "currentPassword"
    );

    @Bean
    public Module trimmingModule() {
        SimpleModule module = new SimpleModule();
        module.addDeserializer(String.class, new StdScalarDeserializer<String>(String.class) {
            @Override
            public String deserialize(JsonParser jsonParser, DeserializationContext ctx) throws IOException {
                String value = jsonParser.getValueAsString();
                if (value == null) {
                    return null;
                }

                String currentName = jsonParser.currentName();
                if (currentName != null && SKIP_TRIMMING_FIELDS.contains(currentName)) {
                    return value;
                }

                return value.trim();
            }
        });
        return module;
    }
}
