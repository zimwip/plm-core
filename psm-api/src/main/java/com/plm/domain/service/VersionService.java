package com.plm.domain.service;

import com.plm.domain.model.Enums.ChangeType;
import com.plm.domain.model.Enums.VersionStrategy;
import com.plm.domain.model.numbering.NumberingResult;
import com.plm.domain.model.numbering.NumberingStrategyFactory;
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
 * Règles de numérotation métier — pilotées par VersionStrategy :
 *   NONE    → même révision.itération (traçabilité pure)
 *   ITERATE → itération + 1  (A.1 → A.2)   — défaut pour ChangeType.CONTENT
 *   REVISE  → nouvelle révision, itération reset à 1  (A.x → B.1)
 *
 * ChangeType (CONTENT|LIFECYCLE|SIGNATURE) reste pour l'audit trail uniquement.
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
     * @param changeType  CONTENT | LIFECYCLE | SIGNATURE  (audit trail uniquement)
     * @param strategy    NONE | ITERATE | REVISE — pilote la numérotation métier
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
        VersionStrategy strategy,
        String newStateId,
        Map<String, String> attributes,
        String description
    ) {
        // 1. Vérifier que la transaction est OPEN (le checkout a déjà validé les conflits)
        Record tx = dsl.select().from("plm_transaction").where("id = ?", txId).fetchOne();
        if (tx == null || !"OPEN".equals(tx.get("status", String.class))) {
            throw new IllegalStateException("Transaction " + txId + " is not OPEN");
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
        int    currentIteration     = current != null ? current.get("iteration",      Integer.class) : 1;
        String currentStateId       = current != null ? current.get("lifecycle_state_id", String.class) : null;

        // Resolve effective strategy: caller may pass null to use the ChangeType default
        VersionStrategy effective = strategy;
        if (effective == null) {
            effective = (changeType == ChangeType.CONTENT) ? VersionStrategy.ITERATE : VersionStrategy.NONE;
        }

        // Resolve numbering scheme from node_type and delegate computation
        Record schemeRow = dsl.fetchOne("""
            SELECT nt.numbering_scheme
            FROM node n
            JOIN node_type nt ON nt.id = n.node_type_id
            WHERE n.id = ?
            """, nodeId);
        String schemeRaw = schemeRow != null ? schemeRow.get("numbering_scheme", String.class) : null;

        NumberingResult nr = NumberingStrategyFactory.forSchemeString(schemeRaw)
            .compute(effective, currentRevision, currentIteration);
        String newRevision  = nr.revision();
        int    newIteration = nr.iteration();

        // 5. Copier + merger les attributs
        Map<String, String> resolvedAttributes = copyAndMergeAttributes(nodeId, current, attributes);

        // 6. Créer la version, en chaînant vers la version précédente
        String prevVersionId = current != null ? current.get("id", String.class) : null;
        String versionId = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        // locked_by / locked_at are intentionally NULL here — LockService.lock() writes
        // them after this INSERT, and LockService.unlock() clears them at commit.
        dsl.execute("""
            INSERT INTO node_version
              (ID, NODE_ID, VERSION_NUMBER, REVISION, ITERATION,
               LIFECYCLE_STATE_ID, CHANGE_TYPE, CHANGE_DESCRIPTION,
               TX_ID, PREVIOUS_VERSION_ID, VERSION_REASON,
               CREATED_AT, CREATED_BY)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'REVISE', ?, ?)
            """,
            versionId, nodeId, currentVersionNumber + 1,
            newRevision, newIteration,
            newStateId != null ? newStateId : currentStateId,
            changeType.name(), description,
            txId, prevVersionId,
            now, userId
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
    public String updateVersionAttributes(String versionId, Map<String, String> newAttrs,
                                          String description) {
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
            // All versions of an OPEN transaction are by definition "in progress"
            Record open = dsl.select().from("node_version")
                .where("node_id = ?", nodeId)
                .and("tx_id = ?", txId)
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
            .where("node_id = ?", nodeId)
            .and(DSL.exists(
                dsl.selectOne().from("plm_transaction")
                   .where("id = node_version.tx_id")
                   .and("status = 'COMMITTED'")
            ))
            .orderBy(DSL.field("version_number").desc())
            .limit(1)
            .fetchOne();
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
