package com.plm.domain.service;

import com.plm.domain.security.PlmUserContext;
import com.plm.domain.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

/**
 * Résolution des vues d'attributs en fonction du rôle et de l'état lifecycle.
 *
 * Pipeline :
 *   1. resolveActiveView — trouve la vue la plus prioritaire pour (rôle ∩ état)
 *   2. applyViewOverride — applique les restrictions de la vue sur chaque attribut
 *
 * Règle fondamentale : une vue peut RESTREINDRE mais JAMAIS élargir les droits
 * définis par l'état lifecycle (AttributeStateRule).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ViewService {

    private final DSLContext          dsl;
    private final SecurityContextPort secCtx;

    /**
     * Résout la vue active pour un utilisateur dans un état donné.
     *
     * Algorithme :
     *  1. Chercher une vue éligible (role_id ∩ user_roles ET state_id = currentState)
     *  2. Si plusieurs vues éligibles → prendre celle avec la priorité la plus haute
     *  3. Si aucune vue → retourner null (comportement par défaut)
     */
    public String resolveActiveView(String nodeTypeId, String currentStateId) {
        PlmUserContext ctx = secCtx.currentUser();

        var view = dsl.select()
            .from("attribute_view")
            .where("node_type_id = ?", nodeTypeId)
            .and(
                DSL.field("eligible_role_id").in(ctx.getRoleIds())
                   .and(DSL.field("eligible_state_id").eq(currentStateId))
                .or(
                    DSL.field("eligible_role_id").in(ctx.getRoleIds())
                       .and(DSL.field("eligible_state_id").isNull())
                )
                .or(
                    DSL.field("eligible_role_id").isNull()
                       .and(DSL.field("eligible_state_id").eq(currentStateId))
                )
            )
            .orderBy(DSL.field("priority").desc())
            .limit(1)
            .fetchOne();

        return view != null ? view.get("id", String.class) : null;
    }

    /**
     * Applique les overrides d'une vue sur un attribut.
     *
     * Règle fondamentale : un override ne peut que RESTREINDRE.
     * Si la règle d'état dit editable=false, la vue ne peut pas dire editable=true.
     */
    public AttributeOverride applyViewOverride(
        String viewId,
        String attributeDefId,
        boolean stateEditable,
        boolean stateVisible,
        int stateDisplayOrder,
        String stateDisplaySection
    ) {
        if (viewId == null) {
            return new AttributeOverride(stateEditable, stateVisible, stateDisplayOrder, stateDisplaySection);
        }

        var override = dsl.select()
            .from("view_attribute_override")
            .where("view_id = ?", viewId)
            .and("attribute_def_id = ?", attributeDefId)
            .fetchOne();

        if (override == null) {
            return new AttributeOverride(stateEditable, stateVisible, stateDisplayOrder, stateDisplaySection);
        }

        Integer viewEditable = override.get("editable", Integer.class);
        Integer viewVisible  = override.get("visible", Integer.class);
        Integer viewOrder    = override.get("display_order", Integer.class);
        String  viewSection  = override.get("display_section", String.class);

        boolean finalEditable = stateEditable && (viewEditable == null || viewEditable == 1);
        boolean finalVisible  = stateVisible  && (viewVisible  == null || viewVisible  == 1);
        int     finalOrder    = viewOrder   != null ? viewOrder   : stateDisplayOrder;
        String  finalSection  = viewSection != null ? viewSection : stateDisplaySection;

        return new AttributeOverride(finalEditable, finalVisible, finalOrder, finalSection);
    }

    public record AttributeOverride(
        boolean editable,
        boolean visible,
        int displayOrder,
        String displaySection
    ) {}
}
