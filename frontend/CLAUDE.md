# frontend — React 18 microfrontend shell

React 18 + nginx · port 3000 · shell extensible via plugins fournis par les services backend.

---

## Stack

| Composant | Choix | Raison |
|-----------|-------|--------|
| UI | React 18 | SPA extensible |
| Serveur statique | nginx | Termine HTTP, proxy vers spe-api |
| Temps réel | WebSocket STOMP | Notifs lock/état seulement |
| State | Zustand (`usePlmStore`) | Store global shell |
| Plugins | ES module dynamique | Microfrontend par service |

---

## Routing nginx

nginx (port 3000) proxy toutes routes `/api/*` vers spe-api (port 8082). Aucun service backend exposé direct.

```
/api/spe/auth         ──► spe-api (login, JWT)
/api/psm/*            ──► spe-api ─── svc://psm
/api/pno/*            ──► spe-api ─── svc://pno
/api/psa/*            ──► spe-api ─── svc://psa
/api/platform/*       ──► spe-api ─── svc://platform
/api/ws               ──► spe-api ─── svc://ws  (WebSocket upgrade)
/actuator/            ──► spe-api
```

Sous **Podman**, pas Docker. `127.0.0.11` (DNS embarqué Docker) n'existe pas. nginx utilise `proxy_pass` simple sans directive `resolver`. Ordre démarrage garanti par `depends_on: condition: service_healthy` dans docker-compose.

---

## Architecture plugin (microfrontend)

### Vue d'ensemble

Chaque service backend peut fournir ses propres composants UI sous forme de bundles ES module. Le shell charge ces bundles au démarrage via un manifest centralisé (`platform-api`), les enregistre dans `pluginRegistry`, et les monte dans des **zones** prédéfinies de l'UI.

```
platform-api  →  GET /api/platform/ui/manifest  →  [{pluginId, url, zone}, ...]
                                                         │
                         PluginLoader.js  ←─ import(url) ┘
                                │
                         pluginRegistry.js  (Map pluginId → plugin, Map zone → plugin[])
                                │
                     Shell zones (nav, editor, settings, …)
```

### Contrat plugin

Chaque bundle expose un export `default` avec :

```js
export default {
  id: 'psm-editor',          // identifiant unique
  zone: 'editor',            // zone de montage : 'nav' | 'editor' | 'settings' | ...
  init(shellAPI) { ... },    // appelé une fois au chargement
  matches(descriptor) { ... }, // sélection dynamique du plugin
  Component: MyComponent,    // composant React rendu par le shell
};
```

### Zones disponibles

| Zone | Sélecteur | Composant | Props injectées |
|------|-----------|-----------|-----------------|
| `nav` | `findNavPlugin(descriptor)` | Row dans left panel | `shellAPI, descriptor, item, isActive, hasChildren, isExpanded, isLoading, onToggleChildren` |
| `editor` | `findEditorPlugin(descriptor)` | Zone centrale d'édition | `shellAPI, tab, ctx` |
| `settings` | `findSettingsSectionComponent(key)` | Section Settings | standard |

### Importmap — partage React entre shell et plugins

Les plugins déclarent `react`, `react-dom`, `react-dom/client`, `react/jsx-runtime` comme **externals**. Le shell expose ces modules via un importmap dans `index.html` :

```html
<script type="importmap">
{
  "imports": {
    "react":             "/assets/vendor-react.js",
    "react-dom":         "/assets/vendor-react-dom.js",
    "react-dom/client":  "/assets/vendor-react-dom.js",
    "react/jsx-runtime": "/assets/vendor-react-jsx-runtime.js"
  }
}
</script>
```

Ces fichiers sont produits par `vite.config.js` comme **explicit Rollup entry points** (`src/react-shim.js`, etc.). Trois contraintes à respecter :

1. **Explicit entry points** obligatoires — `manualChunks` crée des chunks non-entry dont Rollup peut mangler les exports. Seuls les entry points garantissent des noms d'exports préservés.
2. **Named exports explicites dans les shims** — `export * from 'react'` ne fonctionne pas pour les modules CJS qui font `module.exports = require(...)` (Rollup ne peut pas les énumérer statiquement). Il faut lister explicitement chaque export (`export const { useState, ... } = React`).
3. **`preserveEntrySignatures: 'strict'`** — empêche Rollup de supprimer les exports d'un entry point qu'il juge non utilisés (les plugins remote sont hors du graphe de build).
4. **React packages hors `manualChunks`** (`/node_modules/react`, `/node_modules/scheduler`) — si on les route vers `vendor`, les shim entries deviennent des proxies vers un chunk non-entry avec exports manglés.

**Règle critique** : React doit être **une seule instance** partagée entre shell et plugins. Si un plugin bundle React en interne (pas external), les hooks (`useEffect`, `useRef`) lèveront une erreur car ils lisent un dispatcher d'une instance React différente.

### Règles pour un nouveau plugin de service

1. `vite.config.js` du service : `external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime']`
2. Sources : ne jamais `import React from 'react'` (default). Utiliser uniquement hooks nommés `import { useState } from 'react'` ou rien si JSX only (runtime automatique s'en charge).
3. Aucune dépendance vers les fichiers internes du shell (`../../components/...`). Communiquer via `shellAPI` uniquement.
4. Le bundle est servi par le service backend sous `/api/<serviceCode>/ui/<plugin>.js`.
5. Enregistrer l'URL dans le manifest `platform-api` (table `ui_manifest` ou équivalent).

### Services avec plugins actifs

| Service | Plugins | Zone |
|---------|---------|------|
| `psm-api` | `psm-nav`, `psm-editor` | `nav`, `editor` |
| `dst`     | `dst-nav`               | `nav`           |

Sources plugins : `<service>/ui/src/`.

---

## Header HTTP envoyés

`X-PLM-User: user-alice` + `X-PLM-ProjectSpace: ps-default`. Auth réelle via JWT produit par `/api/spe/auth/login`.
