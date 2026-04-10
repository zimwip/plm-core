# PLM Core — Architecture & Décisions de conception

> Synthèse des décisions prises lors de la conception du système,
> avec les raisonnements et alternatives écartées.

---

## 1. Vision générale

Le système est un **PLM (Product Lifecycle Management) minimaliste mais extensible**,
conçu autour de trois principes fondateurs :

1. **Tout changement est traçable** — aucune modification ne peut se produire sans laisser une trace versionnée.
2. **Le backend pilote tout** — le frontend est "stupide", il ne contient aucune logique métier (Server-Driven UI).
3. **Le méta-modèle est configurable** — les types de noeuds, attributs, lifecycles et règles sont définis en base, pas en dur dans le code.

---

## 2. Mécanisme transactionnel central

### Principe
Toute modification d'un objet PLM passe par un cycle **checkin → modification → checkout** :

```
checkin  = acquérir un lock pessimiste exclusif sur le noeud
           → fail-fast si déjà locké par un autre utilisateur
checkout = libérer le lock en créant une nouvelle version
           qui capture l'état global du noeud
```

### Pourquoi pessimiste ?
Le lock optimiste (compare-and-swap) aurait nécessité une gestion des conflits côté client (merge, rebase). En PLM, les objets ont une valeur industrielle forte — on préfère bloquer l'accès concurrent plutôt que risquer un merge incorrect sur une fiche de pièce ou un document technique.

### Ce que couvre une transaction PLM
Le même mécanisme gère uniformément :
- Les **modifications de contenu** (attributs métier)
- Les **changements d'état lifecycle** (Draft → InReview)
- Les **signatures électroniques** (acte de validation)
- Les **cascades** (Frozen sur toute une grappe)

Cela évite d'avoir plusieurs mécanismes à maintenir en parallèle.

---

## 3. Versioning et identité des objets

### Double identité
Chaque noeud possède deux niveaux d'identité :

| Niveau | Champ | Usage |
|--------|-------|-------|
| Technique | `version_number` (auto-incrémenté) | Traçabilité totale en base, audit trail |
| Métier | `revision.iteration` (ex: `B.3`) | Visible utilisateur, sémantique PLM |

### Règles de numérotation métier

| Type de changement | `change_type` | Effet sur revision.iteration |
|--------------------|---------------|------------------------------|
| Modification contenu | `CONTENT` | Itération +1 (A.1 → A.2) |
| Changement lifecycle | `LIFECYCLE` | Inchangé (traçabilité pure) |
| Signature électronique | `SIGNATURE` | Inchangé (traçabilité pure) |
| Passage Released | `LIFECYCLE` | Nouvelle révision, itération reset à 1 (A → B.1) |

### Conséquence dans l'audit trail
Plusieurs versions techniques peuvent partager la même `revision.iteration`.
C'est intentionnel : cela permet de répondre à des questions comme
*"Qui a passé l'objet en InReview ?"* ou *"Combien de temps est resté en Draft ?"*
sans que cela perturbe la numérotation métier visible par les utilisateurs.

```
VERSION_NUMBER | REVISION | ITERATION | CHANGE_TYPE | CREATED_BY | DATE
1              | A        | 1         | CONTENT     | alice      | 01/04
2              | A        | 2         | CONTENT     | alice      | 03/04
3              | A        | 2         | LIFECYCLE   | alice      | 05/04  ← même révision.itération
4              | A        | 2         | SIGNATURE   | bob        | 06/04  ← idem
5              | B        | 1         | LIFECYCLE   | alice      | 07/04  ← Released → nouvelle révision
```

---

## 4. Liens typés : VERSION_TO_MASTER vs VERSION_TO_VERSION

### Problème
Un lien entre deux noeuds peut avoir deux sémantiques radicalement différentes :
- "Je veux toujours la dernière version de cet enfant" (configuration vivante)
- "Je veux exactement la version 3 de cet enfant" (référence figée)

### Solution : le type de lien porte la politique

```
NodeA ──[VERSION_TO_MASTER]──► NodeB    (pointe la version courante, dynamique)
NodeA ──[VERSION_TO_VERSION]──► NodeB@v3  (pointe une version précise, immuable)
```

La politique est une propriété du **lien**, pas du noeud.
Cela permet le **reuse naturel** : un même noeud B peut être référencé par
A en `VERSION_TO_MASTER` et par C en `VERSION_TO_VERSION` sans couplage.

### Impact sur le lock cascade (Frozen)
- Lien `VERSION_TO_MASTER` → l'enfant doit être locké récursivement
- Lien `VERSION_TO_VERSION` → l'enfant est déjà immuable, aucun lock nécessaire

L'algorithme parcourt le graphe et applique la règle selon le type de lien,
pas selon le type de noeud. C'est générique et extensible.

---

## 5. Lifecycle et états

### Méta-modèle
```
Lifecycle
  ├── State (is_initial, is_frozen, is_released, display_order)
  └── Transition
        ├── from_state → to_state
        ├── guard_expr  (condition pour autoriser la transition)
        └── action_type (ce qui se déclenche après : CASCADE_FROZEN, etc.)
```

### Guards extensibles
Les guards sont des expressions nommées évaluées côté backend :
- `all_required_filled` → vérifie les `AttributeStateRule` required du state cible
- `all_signatures_done` → vérifie les `SignatureRequirement` de la transition

Ajouter une nouvelle guard = ajouter un `case` dans `LifecycleService.evaluateGuard()`.

### Actions post-transition
- `CASCADE_FROZEN` → lock récursif + application de l'état Frozen sur toute la grappe

---

## 6. Méta-modèle des attributs

### Règles attribut × état
La table `ATTRIBUTE_STATE_RULE` exprime, pour chaque attribut dans chaque état :
- `required` — l'attribut doit être rempli pour entrer dans cet état
- `editable` — l'attribut peut être modifié dans cet état
- `visible`  — l'attribut est affiché dans cet état

Cela remplace des dizaines de règles métier codées en dur
par une configuration déclarative en base.

Exemple pour un Document :

| Attribut | Draft | InReview | Released | Frozen |
|----------|-------|----------|----------|--------|
| number | éditable | readonly, required | readonly | readonly |
| reviewNote | invisible | éditable | readonly | invisible |

### Validation intégrée aux guards
La guard `all_required_filled` est **générée automatiquement** par le méta-modèle :
elle vérifie toutes les `AttributeStateRule` où `required=1` pour l'état cible.
Pas besoin d'écrire la guard manuellement.

---

## 7. Signatures électroniques

### Principe
Une signature est un **acte de validation** sur la version courante d'un noeud.
Elle crée une nouvelle version technique (`SIGNATURE`) sans incrémenter `revision.iteration`.

### Règle de doublon
Un utilisateur ne peut pas signer deux fois la même `revision.iteration`.
Après une modification de contenu (nouvelle itération), il peut re-signer.

### Intégration lifecycle
La guard `all_signatures_done` vérifie que tous les `SignatureRequirement`
d'une transition sont satisfaits avant d'autoriser le passage
(ex: 2 signatures requises avant le `Release`).

---

## 8. Baselines

### Problème de cohérence
Une baseline doit être une **photo cohérente** de la grappe à un instant T.
Deux problèmes à résoudre :

1. **Race condition** : entre l'intention de créer la baseline et le clic sur le bouton,
   quelqu'un peut avoir releasé une nouvelle version.
2. **Liens VERSION_TO_MASTER** : ils sont dynamiques par définition,
   il faut capturer quelle version ils pointaient au moment du tag.

### Solution en deux étapes
1. **Prérequis Frozen** : passer la grappe en Frozen (via `CASCADE_FROZEN`) avant le tag.
   Le Frozen garantit qu'aucune nouvelle version ne peut être créée → la race condition est éliminée.
2. **Résolution eager** : au moment du tag, parcourir tous les liens `VERSION_TO_MASTER`
   et enregistrer la version résolue dans `BASELINE_ENTRY`.
   Les liens `VERSION_TO_VERSION` ne nécessitent aucune entrée (déjà immuables).

### Comparaison de baselines
`BaselineService.compareBaselines()` retourne les entrées `CHANGED / ADDED / REMOVED`
entre deux baselines, ce qui permet de produire une liste de modifications entre deux configurations.

---

## 9. Gestion des rôles et permissions

### Architecture en couches
Les permissions s'appliquent en **trois couches successives** :

```
Couche 1 : NodeTypePermission
  → can_read / can_write / can_transition / can_sign / can_baseline
  → droits de base selon le rôle sur le type de noeud

Couche 2 : AttributeStateRule (lifecycle)
  → editable / visible / required selon l'état courant
  → s'applique indépendamment du rôle

Couche 3 : AttributeView (rôle ∩ état)
  → overrides de section, ordre d'affichage, visibilité
  → PEUT RESTREINDRE, JAMAIS ÉLARGIR les droits de la couche 2
```

### Règle fondamentale des vues
Un override de vue ne peut que **restreindre** les droits définis par l'état lifecycle.
Si l'état dit `editable=false`, aucune vue ne peut dire `editable=true`.
Cette règle garantit la cohérence : l'état reste la source de vérité sur les droits.

### Résolution de la vue active
Une vue est éligible si `eligible_role_id ∈ rôles_utilisateur` ET `eligible_state_id = état_courant`.
Si plusieurs vues sont éligibles, la vue de **priorité la plus haute** gagne.
`NULL` dans `eligible_role_id` ou `eligible_state_id` signifie "tous".

### Permissions sur les transitions
Si aucune `TRANSITION_PERMISSION` n'est définie pour une transition → ouverte à tous.
Si des permissions sont définies → seuls les rôles listés peuvent déclencher la transition.

---

## 10. Server-Driven UI

### Principe
Le backend calcule et retourne un payload complet qui décrit l'objet **tel qu'il doit être affiché**
pour l'utilisateur courant dans son contexte (état + rôle + vue active).

```json
{
  "nodeId": "...",
  "identity": "B.3",
  "state": "InReview",
  "canWrite": false,
  "activeView": "view-reviewer-inreview",
  "attributes": [
    { "name": "reviewNote", "label": "Review Note", "editable": true,  "visible": true, "displayOrder": 1 },
    { "name": "number",     "label": "Number",      "editable": false, "visible": true, "displayOrder": 2 }
  ],
  "actions": [
    { "id": "tr-approve", "name": "Approve" },
    { "id": "tr-reject",  "name": "Reject"  }
  ]
}
```

### Avantages
- **Zéro logique métier** dans le frontend → pas de désynchronisation possible
- **Multi-frontend** : web, mobile, API tierce reçoivent la même description
- **Testabilité** : on teste le payload, pas l'UI

---

## 11. Notifications temps réel (WebSocket)

### Scope délibérément limité
Le modèle pessimiste (lock exclusif) rend la **co-édition impossible par conception**.
Le WebSocket ne sert donc pas à synchroniser des modifications en temps réel,
mais uniquement à **notifier** les changements d'état et de disponibilité.

### Pattern : notification + fetch
Le frontend reçoit un événement léger, puis rappelle le REST endpoint pour les données complètes.
Cela évite les problèmes de synchronisation d'état dans le canal WebSocket lui-même.

### Topics
```
/topic/nodes/{nodeId}  → LOCK_ACQUIRED, LOCK_RELEASED, LOCK_EXPIRING, STATE_CHANGED
/topic/baselines       → BASELINE_CREATED
```

---

## 12. Choix techniques

### JOOQ plutôt que JPA/Hibernate
Le modèle PLM est fortement relationnel avec des requêtes complexes
(parcours de graphe, jointures multi-niveaux, résolution de vue).
JOOQ offre un SQL typé et expressif sans la magie des ORMs
qui peut masquer des problèmes de performance.

### Derby en dev, PostgreSQL en prod
Derby in-memory élimine toute dépendance externe pour le développement et les tests.
Le basculement vers PostgreSQL est une simple modification de configuration
(datasource URL + dialecte JOOQ) — Flyway et JOOQ gèrent le reste.

### Flyway pour les migrations
Toute l'évolution du schéma est versionnée et reproductible :
- `V1` — Schéma de base
- `V2` — Signatures électroniques
- `V3` — Rôles, permissions, vues
- `V4` — Données initiales (seed)

---

## 13. Prochaines évolutions envisageables

| Domaine | Extension |
|---------|-----------|
| Auth | Remplacement de `PlmAuthFilter` par JWT/OAuth2 |
| Guards | Plugin system pour les guards custom (SPI Java) |
| Notifications | Intégration email/Slack sur les transitions lifecycle |
| API | Pagination et filtres sur les listes de noeuds |
| UI | Interface d'administration du méta-modèle |
| Reporting | Export baseline en PDF ou Excel |
| Audit | Endpoint dédié à l'audit trail avec filtres |
| Multi-tenant | Isolation des données par organisation |
