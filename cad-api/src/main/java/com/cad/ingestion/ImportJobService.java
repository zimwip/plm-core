package com.cad.ingestion;

import com.cad.algorithm.ImportJobContext;
import com.cad.ingestion.model.ImportJob;
import com.cad.ingestion.model.ImportJobResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImportJobService {

    private final ImportJobRepository repository;
    private final ImportJobProcessor  processor;

    public ImportJob submit(String userId, String projectSpaceId,
                            String filename, String contextCode,
                            UUID rootNodeId, byte[] fileBytes, String psmTxId,
                            boolean splitMode) {

        List<ZipUtil.FileEntry> zipEntries = null;
        if (ZipUtil.isZip(fileBytes)) {
            try {
                zipEntries = ZipUtil.extractCadFiles(fileBytes);
            } catch (IOException e) {
                throw new IllegalArgumentException("Cannot extract ZIP archive: " + e.getMessage());
            }
            if (zipEntries.isEmpty()) {
                throw new IllegalArgumentException(
                    "ZIP archive contains no recognized CAD files (.step, .stp, .catproduct, .catpart, .igs, .iges)");
            }
        }

        ImportJob job = new ImportJob();
        job.setId(UUID.randomUUID());
        job.setStatus("PENDING");
        job.setImportContext(contextCode != null ? contextCode : "default");
        job.setFilename(filename);
        job.setFileCount(zipEntries != null ? zipEntries.size() : 1);
        job.setRootNodeId(rootNodeId);
        job.setProjectSpaceId(projectSpaceId);
        job.setCreatedBy(userId);
        job.setCreatedAt(LocalDateTime.now());

        repository.createJob(job);

        ImportJobContext ctx = new ImportJobContext(
            job.getId().toString(), projectSpaceId, userId,
            job.getImportContext(), psmTxId,
            rootNodeId != null ? rootNodeId.toString() : null,
            splitMode
        );

        if (zipEntries != null) {
            processor.processMulti(job.getId(), fileBytes, filename, zipEntries, ctx);
        } else {
            processor.process(job.getId(), fileBytes, filename, ctx);
        }

        return job;
    }

    public ImportJob getJob(UUID jobId) {
        ImportJob job = repository.findById(jobId);
        if (job == null) throw new IllegalArgumentException("Import job not found: " + jobId);
        return job;
    }

    public List<ImportJob> listForUser(String userId, int page, int size) {
        return repository.findByUser(userId, page, size);
    }

    public List<ImportJobResult> getResults(UUID jobId) {
        return repository.findResultsByJobId(jobId);
    }
}
