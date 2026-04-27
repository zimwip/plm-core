package com.plm.permission;

import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.AttributeViewConfig;
import com.plm.platform.config.dto.ConfigSnapshot;
import com.plm.platform.config.dto.ViewAttributeOverrideConfig;
import com.plm.shared.security.PlmUserContext;
import com.plm.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;

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

    private final ConfigCache        configCache;
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
        Set<String> userRoleIds = ctx.getRoleIds();

        return configCache.getAttributeViews(nodeTypeId).stream()
            .filter(v -> isEligible(v, userRoleIds, currentStateId))
            .max(Comparator.comparingInt(AttributeViewConfig::priority))
            .map(AttributeViewConfig::id)
            .orElse(null);
    }

    /**
     * Replicates the SQL WHERE logic:
     *   (role matches AND state matches)
     *   OR (role matches AND state is null)
     *   OR (role is null AND state matches)
     */
    private boolean isEligible(AttributeViewConfig view, Collection<String> userRoleIds, String currentStateId) {
        boolean roleMatches = view.eligibleRoleId() != null && userRoleIds.contains(view.eligibleRoleId());
        boolean stateMatches = view.eligibleStateId() != null && view.eligibleStateId().equals(currentStateId);
        boolean roleNull = view.eligibleRoleId() == null;
        boolean stateNull = view.eligibleStateId() == null;

        return (roleMatches && stateMatches)
            || (roleMatches && stateNull)
            || (roleNull && stateMatches);
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

        // Find the view by id from the snapshot, then locate the matching override
        ConfigSnapshot snap = configCache.getSnapshot();
        List<AttributeViewConfig> allViews = snap != null && snap.attributeViews() != null
            ? snap.attributeViews() : List.of();

        ViewAttributeOverrideConfig override = allViews.stream()
            .filter(v -> viewId.equals(v.id()))
            .findFirst()
            .flatMap(v -> v.overrides() != null
                ? v.overrides().stream()
                    .filter(o -> attributeDefId.equals(o.attributeDefId()))
                    .findFirst()
                : Optional.empty())
            .orElse(null);

        if (override == null) {
            return new AttributeOverride(stateEditable, stateVisible, stateDisplayOrder, stateDisplaySection);
        }

        boolean finalEditable = stateEditable && (override.editable() == null || override.editable());
        boolean finalVisible  = stateVisible  && (override.visible()  == null || override.visible());
        int     finalOrder    = override.displayOrder()   != null ? override.displayOrder()   : stateDisplayOrder;
        String  finalSection  = override.displaySection() != null ? override.displaySection() : stateDisplaySection;

        return new AttributeOverride(finalEditable, finalVisible, finalOrder, finalSection);
    }

    public record AttributeOverride(
        boolean editable,
        boolean visible,
        int displayOrder,
        String displaySection
    ) {}
}
