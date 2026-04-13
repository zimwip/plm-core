package com.plm.infrastructure;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import org.jooq.Record;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

/**
 * Sérialise les Records JOOQ comme des objets JSON simples (via intoMap()).
 * Nécessaire car Jackson ne sait pas introspécter les Records JOOQ directement.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jooqRecordSerializer() {
        return builder -> {
            SimpleModule module = new SimpleModule();
            module.addSerializer(Record.class, new StdSerializer<>(Record.class) {
                @Override
                public void serialize(Record record, JsonGenerator gen, SerializerProvider provider)
                        throws IOException {
                    gen.writeObject(record.intoMap());
                }
            });
            builder.modules(module);
        };
    }
}
