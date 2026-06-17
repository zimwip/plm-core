package com.cad.ingestion;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public final class ZipUtil {

    /** A CAD file extracted from a ZIP, spilled to a temp file on disk (not held in heap). */
    public record FileEntry(String filename, Path path) {}

    private static final Set<String> CAD_EXTENSIONS = Set.of(
        ".step", ".stp", ".catproduct", ".catpart", ".igs", ".iges"
    );

    private ZipUtil() {}

    /** Cheap ZIP sniff from the file header — reads 4 bytes, never the whole archive. */
    public static boolean isZip(Path file) {
        try (InputStream in = Files.newInputStream(file)) {
            byte[] sig = in.readNBytes(4);
            return sig.length == 4
                && sig[0] == 0x50 && sig[1] == 0x4B
                && sig[2] == 0x03 && sig[3] == 0x04;
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * Streams each recognized CAD member of the ZIP to its own temp file and returns
     * the list of {@link FileEntry}. Members are copied chunk-by-chunk (no full byte[]
     * per member in heap). Caller owns the temp files and must delete them.
     */
    public static List<FileEntry> extractCadFiles(Path zipFile) throws IOException {
        List<FileEntry> result = new ArrayList<>();
        try (ZipInputStream zis = new ZipInputStream(Files.newInputStream(zipFile))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (!entry.isDirectory()) {
                    String name = entry.getName();
                    String lower = name.toLowerCase();
                    if (CAD_EXTENSIONS.stream().anyMatch(lower::endsWith)) {
                        String filename = name.contains("/") ? name.substring(name.lastIndexOf('/') + 1) : name;
                        Path tmp = Files.createTempFile("cad-zip-", "-" + filename);
                        Files.copy(zis, tmp, StandardCopyOption.REPLACE_EXISTING);
                        result.add(new FileEntry(filename, tmp));
                    }
                }
                zis.closeEntry();
            }
        }
        return result;
    }
}
