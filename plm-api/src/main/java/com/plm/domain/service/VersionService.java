package com.plm.domain.service;

import com.plm.domain.model.Enums.ChangeType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

/**
 * Création de versions de noeuds PLM.
 *
 * Le txId est un paramètre de première classe :
 *   - Obligatoire pour toute opération d'authoring
 *   - La version créée est taguée OPEN jusqu'au commit de la transaction
 *   - Le lock doit déjà avoir été acquis via LockService.checkin(nodeId, userId, txId)
 *
 * Règles de numérotation métier :
 *   CONTENT   → incrémente l'itération (A.1 → A.2)
 *   LIFECYCLE → même révision.itération (traçabilité pure)
 *   SIGNATURE → même révision.itération (traçabilité pure)
 *   Released  → nouvelle révision, itération reset à 1 (A → B.1)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VersionService {

    private final DSLContext        dsl;
    private final LockService       lockService;
    private final ValidationService validationService;

    // ================================================================
    // CRÉATION DE VERSION — txId OBLIGATOIRE
    // ================================================================

    /**
     * Crée une nouvelle version dans le contexte d'une transaction explicite.
     *
     * @param nodeId      noeud à versionner (doit être locké dans cette tx)
     * @param userId      auteur de la modification
     * @param txId        transaction PLM ouverte — OBLIGATOIRE
     * @param changeType  CONTENT | LIFECYCLE | SIGNATURE
     * @param newStateId  nouvel état lifecycle (null si pas de changement d'état)
     * @param attributes  nouvelles valeurs d'attributs (vide si aucun changement)
     * @param description description du changement
     * @return id de la version créée
     */
    @Transactional
    public String createVersion(
        String nodeId,
        String userId,
        String txId,
        ChangeType changeType,
        String newStateId,
        Map<String, String> attributes,
        String description
    ) {
        // 1. Vérifier que le noeud est bien locké dans cette transaction
        if (!lockService.isLockedByTx(nodeId, txId)) {
            throw new IllegalStateException(
                "Node " + nodeId + " is not locked in transaction " + txId +
                ". Call checkin first.");
        }

        // 2. Récupérer la version courante (dernière committée ou OPEN de cette tx)
        Record current = getCurrentVersionForTx(nodeId, txId);

        // 3. Valider les attributs si changement d'état
        if (newStateId != null) {
            validationService.validateAttributesForState(nodeId, newStateId, attributes, current);
        }

        // 4. Calculer la nouvelle identité métier
        int    currentVersionNumber = current != null ? current.get("version_number", Integer.class) : 0;
        String currentRevision      = current != null ? current.get("revision",       String.class)  : "A";
        int    currentIteration     = current != null ? current.get("iteration",      Integer.class) : 0;
        String currentStateId       = current != null ? current.get("lifecycle_state_id", String.class) : null;

        boolean isReleased = newStateId != null && isReleasedState(newStateId);
        String  newRevision  = currentRevision;
        int     newIteration = currentIteration;

        if (isReleased) {
            newRevision  = nextRevision(currentRevision);
            newIteration = 1;
        } else if (changeType == ChangeType.CONTENT) {
            newIteration = currentIteration + 1;
        }
        // LIFECYCLE ou SIGNATURE → même révision.itération

        // 5. Copier + merger les attributs
        Map<String, String> resolvedAttributes = copyAndMergeAttributes(nodeId, current, attributes);

        // 6. Créer la version avec tx_status = OPEN, en chaînant vers la version précédente
        String prevVersionId = current != null ? current.get("id", String.class) : null;
        String versionId = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO node_version
              (ID, NODE_ID, VERSION_NUMBER, REVISION, ITERATION,
               LIFECYCLE_STATE_ID, CHANGE_TYPE, CHANGE_DESCRIPTION,
               TX_ID, TX_STATUS, CREATED_AT, CREATED_BY, PREVIOUS_VERSION_ID)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?, ?)
            """,
            versionId, nodeId, currentVersionNumber + 1,
            newRevision, newIteration,
            newStateId != null ? newStateId : currentStateId,
            changeType.name(), description,
            txId, LocalDateTime.now(), userId, prevVersionId
        );

        // 7. Sauvegarder les attributs
        for (Map.Entry<String, String> entry : resolvedAttributes.entrySet()) {
            dsl.execute(
                "INSERT INTO node_version_attribute (ID, NODE_VERSION_ID, ATTRIBUTE_DEF_ID, VALUE) VALUES (?,?,?,?)",
                UUID.randomUUID().toString(), versionId, entry.getKey(), entry.getValue()
            );
        }

        log.info("Version created: node={} v={} {}.{} type={} tx={} user={}",
            nodeId, currentVersionNumber + 1, newRevision, newIteration, changeType, txId, userId);

        return versionId;
    }

    // ================================================================
    // MISE À JOUR D'UNE VERSION OPEN EXISTANTE
    // ================================================================

    /**
     * Met à jour les attributs d'une version OPEN existante (pas de nouvelle version créée).
     * Utilisé quand le noeud est déjà checké-out dans la même transaction : on remplace
     * les attributs en place plutôt que d'empiler une deuxième version OPEN.
     *
     * @param versionId   id de la version OPEN à mettre à jour
     * @param newAttrs    attributs modifiés (mergés par-dessus les valeurs existantes)
     * @param description nouvelle description du changement (si non null/blank)
     * @return versionId (inchangé)
     */
    @Transactional
    public String updateVersionAttributes(String versionId, Map<String, String> newAttrs, String description) {
        // Lire les attributs actuels de la version OPEN
        Map<String, String> merged = new java.util.HashMap<>();
        dsl.select().from("node_version_attribute")
           .where("node_version_id = ?", versionId)
           .fetch().forEach(r -> merged.put(
               r.get("attribute_def_id", String.class), r.get("value", String.class)));

        // Merger les nouvelles valeurs
        merged.putAll(newAttrs);

        // Remplacer tous les attributs
        dsl.execute("DELETE FROM node_version_attribute WHERE node_version_id = ?", versionId);
        for (Map.Entry<String, String> e : merged.entrySet()) {
            dsl.execute(
                "INSERT INTO node_version_attribute (ID, NODE_VERSION_ID, ATTRIBUTE_DEF_ID, VALUE) VALUES (?,?,?,?)",
                UUID.randomUUID().toString(), versionId, e.getKey(), e.getValue()
            );
        }

        // Mettre à jour la description si fournie
        if (description != null && !description.isBlank()) {
            dsl.execute("UPDATE node_version SET change_description = ? WHERE id = ?", description, versionId);
        }

        log.info("Version updated in-place: id={}", versionId);
        return versionId;
    }

    // ================================================================
    // LECTURE
    // ================================================================

    /**
     * Version courante visible pour une transaction donnée :
     *   - Dernière version OPEN de cette tx sur ce noeud (si elle existe)
     *   - Sinon dernière version COMMITTED
     */
    public Record getCurrentVersionForTx(String nodeId, String txId) {
        if (txId != null) {
            Record open = dsl.select().from("node_version")
                .where("node_id = ?", nodeId)
                .and("tx_id = ?", txId)
                .and("tx_status = 'OPEN'")
                .orderBy(DSL.field("version_number").desc())
                .limit(1).fetchOne();
            if (open != null) return open;
        }
        return getLastCommittedVersion(nodeId);
    }

    /** Dernière version COMMITTED d'un noeud (version publique). */
    public Record getCurrentVersion(String nodeId) {
        return getLastCommittedVersion(nodeId);
    }

    public Record getVersion(String versionId) {
        return dsl.select().from("node_version").where("id = ?", versionId).fetchOne();
    }

    // ================================================================
    // Helpers
    // ================================================================

    private Record getLastCommittedVersion(String nodeId) {
        return dsl.select().from("node_version")
            .where("node_id = ?", nodeId).and("tx_status = 'COMMITTED'")
            .orderBy(DSL.field("version_number").desc())
            .limit(1).fetchOne();
    }

    private boolean isReleasedState(String stateId) {
        Integer v = dsl.select().from("lifecycle_state").where("id = ?", stateId)
            .fetchOne("is_released", Integer.class);
        return v != null && v == 1;
    }

    private String nextRevision(String current) {
        char[] chars = current.toCharArray();
        int i = chars.length - 1;
        while (i >= 0) {
            if (chars[i] < 'Z') { chars[i]++; return new String(chars); }
            chars[i] = 'A'; i--;
        }
        char[] next = new char[chars.length + 1];
        java.util.Arrays.fill(next, 'A');
        return new String(next);
    }

    private Map<String, String> copyAndMergeAttributes(String nodeId, Record prev, Map<String, String> newAttrs) {
        Map<String, String> result = new java.util.HashMap<>();
        if (prev != null) {
            dsl.select().from("node_version_attribute")
               .where("node_version_id = ?", prev.get("id", String.class))
               .fetch().forEach(r -> result.put(
                   r.get("attribute_def_id", String.class), r.get("value", String.class)));
        }
        result.putAll(newAttrs);
        return result;
    }
}
