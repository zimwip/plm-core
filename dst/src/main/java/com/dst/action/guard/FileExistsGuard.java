package com.dst.action.guard;

import com.plm.platform.action.guard.ActionGuard;
import com.plm.platform.action.guard.ActionGuardContext;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardViolation;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class FileExistsGuard implements ActionGuard {

    private final DSLContext dsl;

    @Override
    public String code() {
        return "dst_file_exists";
    }

    @Override
    public List<GuardViolation> evaluate(ActionGuardContext ctx) {
        String fileId = ctx.ids().get("fileId");
        if (fileId == null) return List.of();

        String projectSpaceId = ctx.ids().get("projectSpaceId");
        boolean exists;
        if (projectSpaceId != null) {
            exists = dsl.fetchOne(
                "SELECT id FROM data_object WHERE id = ? AND project_space_id = ?",
                fileId, projectSpaceId) != null;
        } else {
            exists = dsl.fetchOne(
                "SELECT id FROM data_object WHERE id = ?", fileId) != null;
        }

        if (!exists) {
            return List.of(new GuardViolation(code(), "File not found", GuardEffect.HIDE));
        }
        return List.of();
    }
}
