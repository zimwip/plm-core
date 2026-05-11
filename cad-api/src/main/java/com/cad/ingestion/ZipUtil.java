package com.cad.ingestion;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public final class ZipUtil {

    public record FileEntry(String filename, byte[] bytes) {}

    private static final Set<String> CAD_EXTENSIONS = Set.of(
        ".step", ".stp", ".catproduct", ".catpart", ".igs", ".iges"
    );

    private ZipUtil() {}

    public static boolean isZip(byte[] bytes) {
        return bytes.length > 3
            && bytes[0] == 0x50 && bytes[1] == 0x4B
            && bytes[2] == 0x03 && bytes[3] == 0x04;
    }

    public static List<FileEntry> extractCadFiles(byte[] zipBytes) throws IOException {
        List<FileEntry> result = new ArrayList<>();
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipBytes))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (!entry.isDirectory()) {
                    String name = entry.getName();
                    String lower = name.toLowerCase();
                    if (CAD_EXTENSIONS.stream().anyMatch(lower::endsWith)) {
                        String filename = name.contains("/") ? name.substring(name.lastIndexOf('/') + 1) : name;
                        result.add(new FileEntry(filename, zis.readAllBytes()));
                    }
                }
                zis.closeEntry();
            }
        }
        return result;
    }
}
