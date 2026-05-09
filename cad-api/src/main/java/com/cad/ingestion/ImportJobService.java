package com.cad.ingestion;

import com.cad.algorithm.ImportJobContext;
import com.cad.ingestion.model.ImportJob;
import com.cad.ingestion.model.ImportJobResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
                            UUID rootNodeId, byte[] fileBytes, String psmTxId) {
        ImportJob job = new ImportJob();
        job.setId(UUID.randomUUID());
        job.setStatus("PENDING");
        job.setImportContext(contextCode != null ? contextCode : "default");
        job.setFilename(filename);
        job.setFileCount(1);
        job.setRootNodeId(rootNodeId);
        job.setProjectSpaceId(projectSpaceId);
        job.setCreatedBy(userId);
        job.setCreatedAt(LocalDateTime.now());

        repository.createJob(job);

        ImportJobContext ctx = new ImportJobContext(
            job.getId().toString(), projectSpaceId, userId,
            job.getImportContext(), psmTxId,
            rootNodeId != null ? rootNodeId.toString() : null
        );
        processor.process(job.getId(), fileBytes, filename, ctx);

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
