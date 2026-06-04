import { jsx as e, jsxs as n, Fragment as re } from "react/jsx-runtime";
import { forwardRef as at, createElement as Ke, useState as _, useEffect as Ae, useCallback as $e } from "react";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const st = (a) => a.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), nt = (...a) => a.filter((t, l, y) => !!t && t.trim() !== "" && y.indexOf(t) === l).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var ct = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ut = at(
  ({
    color: a = "currentColor",
    size: t = 24,
    strokeWidth: l = 2,
    absoluteStrokeWidth: y,
    className: T = "",
    children: S,
    iconNode: p,
    ...C
  }, P) => Ke(
    "svg",
    {
      ref: P,
      ...ct,
      width: t,
      height: t,
      stroke: a,
      strokeWidth: y ? Number(l) * 24 / Number(t) : l,
      className: nt("lucide", T),
      ...C
    },
    [
      ...p.map(([G, M]) => Ke(G, M)),
      ...Array.isArray(S) ? S : [S]
    ]
  )
);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Me = (a, t) => {
  const l = at(
    ({ className: y, ...T }, S) => Ke(ut, {
      ref: S,
      iconNode: t,
      className: nt(`lucide-${st(a)}`, y),
      ...T
    })
  );
  return l.displayName = `${a}`, l;
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Oe = Me("ChevronDown", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ze = Me("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pt = Me("Copy", [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ye = Me("Pen", [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const be = Me("Plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ce = Me("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);
let it = null;
function mt(a) {
  it = a.http;
}
const E = (a, t, l) => it.serviceRequest("psa", a, t, l), f = {
  // ── Metadata keys ─────────────────────────────────────────────────
  getMetadataKeys: (a, t) => E("GET", t ? `/metamodel/metadata/keys/${t}` : "/metamodel/metadata/keys"),
  // ── Node types ────────────────────────────────────────────────────
  getNodeTypes: (a) => E("GET", "/metamodel/nodetypes"),
  createNodeType: (a, t) => E("POST", "/metamodel/nodetypes", t),
  deleteNodeType: (a, t) => E("DELETE", `/metamodel/nodetypes/${t}`),
  updateNodeTypeIdentity: (a, t, l) => E("PUT", `/metamodel/nodetypes/${t}/identity`, l),
  updateNodeTypeNumberingScheme: (a, t, l) => E("PUT", `/metamodel/nodetypes/${t}/numbering-scheme`, { numberingScheme: l }),
  updateNodeTypeVersionPolicy: (a, t, l) => E("PUT", `/metamodel/nodetypes/${t}/version-policy`, { versionPolicy: l }),
  updateNodeTypeCollapseHistory: (a, t, l) => E("PUT", `/metamodel/nodetypes/${t}/collapse-history`, { collapseHistory: l }),
  updateNodeTypeLifecycle: (a, t, l) => E("PUT", `/metamodel/nodetypes/${t}/lifecycle`, { lifecycleId: l || null }),
  updateNodeTypeAppearance: (a, t, l, y) => E("PUT", `/metamodel/nodetypes/${t}/appearance`, { color: l || null, icon: y || null }),
  updateNodeTypeParent: (a, t, l) => E("PUT", `/metamodel/nodetypes/${t}/parent`, { parentNodeTypeId: l || null }),
  // ── Node type attributes ──────────────────────────────────────────
  getNodeTypeAttributes: (a, t) => E("GET", `/metamodel/nodetypes/${t}/attributes`),
  createAttribute: (a, t, l) => E("POST", `/metamodel/nodetypes/${t}/attributes`, l),
  updateAttribute: (a, t, l, y) => E("PUT", `/metamodel/nodetypes/${t}/attributes/${l}`, y),
  deleteAttribute: (a, t, l) => E("DELETE", `/metamodel/nodetypes/${t}/attributes/${l}`),
  // ── Node type actions ─────────────────────────────────────────────
  getAllActions: (a) => E("GET", "/metamodel/actions"),
  getActionsForNodeType: (a, t) => E("GET", `/metamodel/nodetypes/${t}/actions`),
  registerCustomAction: (a, t) => E("POST", "/metamodel/actions", t),
  // ── Link types ────────────────────────────────────────────────────
  getLinkTypes: (a) => E("GET", "/metamodel/linktypes"),
  getNodeTypeLinkTypes: (a, t) => E("GET", `/metamodel/nodetypes/${t}/linktypes`),
  createLinkType: (a, t) => E("POST", "/metamodel/linktypes", t),
  updateLinkType: (a, t, l) => E("PUT", `/metamodel/linktypes/${t}`, l),
  deleteLinkType: (a, t) => E("DELETE", `/metamodel/linktypes/${t}`),
  // ── Link type attributes ──────────────────────────────────────────
  getLinkTypeAttributes: (a, t) => E("GET", `/metamodel/linktypes/${t}/attributes`),
  createLinkTypeAttribute: (a, t, l) => E("POST", `/metamodel/linktypes/${t}/attributes`, l),
  updateLinkTypeAttribute: (a, t, l, y) => E("PUT", `/metamodel/linktypes/${t}/attributes/${l}`, y),
  deleteLinkTypeAttribute: (a, t, l) => E("DELETE", `/metamodel/linktypes/${t}/attributes/${l}`),
  // ── Link type cascade rules ───────────────────────────────────────
  getLinkTypeCascades: (a, t) => E("GET", `/metamodel/linktypes/${t}/cascades`),
  createLinkTypeCascade: (a, t, l, y, T) => E("POST", `/metamodel/linktypes/${t}/cascades`, { parentTransitionId: l, childFromStateId: y, childTransitionId: T }),
  deleteLinkTypeCascade: (a, t, l) => E("DELETE", `/metamodel/linktypes/${t}/cascades/${l}`),
  // ── Lifecycles ────────────────────────────────────────────────────
  getLifecycles: (a) => E("GET", "/metamodel/lifecycles"),
  getLifecycleStates: (a, t) => E("GET", `/metamodel/lifecycles/${t}/states`),
  getLifecycleTransitions: (a, t) => E("GET", `/metamodel/lifecycles/${t}/transitions`),
  createLifecycle: (a, t) => E("POST", "/metamodel/lifecycles", t),
  duplicateLifecycle: (a, t, l, y) => E("POST", `/metamodel/lifecycles/${t}/duplicate`, { code: l, name: y }),
  deleteLifecycle: (a, t) => E("DELETE", `/metamodel/lifecycles/${t}`),
  // ── Lifecycle states ──────────────────────────────────────────────
  addLifecycleState: (a, t, l) => E("POST", `/metamodel/lifecycles/${t}/states`, l),
  updateLifecycleState: (a, t, l, y) => E("PUT", `/metamodel/lifecycles/${t}/states/${l}`, y),
  deleteLifecycleState: (a, t, l) => E("DELETE", `/metamodel/lifecycles/${t}/states/${l}`),
  // ── Lifecycle state actions ───────────────────────────────────────
  listLifecycleStateActions: (a, t, l) => E("GET", `/metamodel/lifecycles/${t}/states/${l}/actions`),
  attachLifecycleStateAction: (a, t, l, y, T, S, p = 0) => E("POST", `/metamodel/lifecycles/${t}/states/${l}/actions`, { instanceId: y, trigger: T, executionMode: S, displayOrder: p }),
  detachLifecycleStateAction: (a, t, l, y) => E("DELETE", `/metamodel/lifecycles/${t}/states/${l}/actions/${y}`),
  // ── Lifecycle transitions ─────────────────────────────────────────
  addLifecycleTransition: (a, t, l) => E("POST", `/metamodel/lifecycles/${t}/transitions`, l),
  updateLifecycleTransition: (a, t, l, y) => E("PUT", `/metamodel/lifecycles/${t}/transitions/${l}`, y),
  deleteLifecycleTransition: (a, t, l) => E("DELETE", `/metamodel/lifecycles/${t}/transitions/${l}`),
  // ── Transition signature requirements ────────────────────────────
  addTransitionSignatureRequirement: (a, t, l, y = 0) => E("POST", `/metamodel/transitions/${t}/signature-requirements`, { roleId: l, displayOrder: y }),
  removeTransitionSignatureRequirement: (a, t, l) => E("DELETE", `/metamodel/transitions/${t}/signature-requirements/${l}`),
  // ── Transition guards ─────────────────────────────────────────────
  listTransitionGuards: (a, t) => E("GET", `/metamodel/lifecycles/transitions/${t}/guards`),
  attachTransitionGuard: (a, t, l, y, T) => E("POST", `/metamodel/lifecycles/transitions/${t}/guards`, { instanceId: l, effect: y, displayOrder: T }),
  updateTransitionGuard: (a, t, l) => E("PUT", `/metamodel/lifecycles/transitions/guards/${t}`, { effect: l }),
  detachTransitionGuard: (a, t) => E("DELETE", `/metamodel/lifecycles/transitions/guards/${t}`),
  // ── Sources ───────────────────────────────────────────────────────
  getSources: (a) => E("GET", "/sources"),
  getSourceResolvers: (a) => E("GET", "/sources/resolvers"),
  createSource: (a, t) => E("POST", "/sources", t),
  updateSource: (a, t, l) => E("PUT", `/sources/${t}`, l),
  deleteSource: (a, t) => E("DELETE", `/sources/${t}`),
  // ── Import contexts ───────────────────────────────────────────────
  getImportContexts: () => E("GET", "/admin/import-contexts"),
  createImportContext: (a) => E("POST", "/admin/import-contexts", a),
  updateImportContext: (a, t) => E("PUT", `/admin/import-contexts/${a}`, t),
  deleteImportContext: (a) => E("DELETE", `/admin/import-contexts/${a}`),
  getImportAlgorithmInstances: () => E("GET", "/admin/import-contexts/algorithm-instances/import"),
  getValidationAlgorithmInstances: () => E("GET", "/admin/import-contexts/algorithm-instances/validation"),
  // ── Domains ───────────────────────────────────────────────────────
  getDomains: (a) => E("GET", "/domains"),
  createDomain: (a, t) => E("POST", "/domains", t),
  updateDomain: (a, t, l) => E("PUT", `/domains/${t}`, l),
  deleteDomain: (a, t) => E("DELETE", `/domains/${t}`),
  getDomainAttributes: (a, t) => E("GET", `/domains/${t}/attributes`),
  createDomainAttribute: (a, t, l) => E("POST", `/domains/${t}/attributes`, l),
  updateDomainAttribute: (a, t, l, y) => E("PUT", `/domains/${t}/attributes/${l}`, y),
  deleteDomainAttribute: (a, t, l) => E("DELETE", `/domains/${t}/attributes/${l}`),
  // ── Enums ─────────────────────────────────────────────────────────
  getEnums: (a) => E("GET", "/enums"),
  getEnumDetail: (a, t) => E("GET", `/enums/${t}`),
  createEnum: (a, t) => E("POST", "/enums", t),
  updateEnum: (a, t, l) => E("PUT", `/enums/${t}`, l),
  deleteEnum: (a, t) => E("DELETE", `/enums/${t}`),
  getEnumValues: (a, t) => E("GET", `/enums/${t}/values`),
  addEnumValue: (a, t, l) => E("POST", `/enums/${t}/values`, l),
  updateEnumValue: (a, t, l, y) => E("PUT", `/enums/${t}/values/${l}`, y),
  deleteEnumValue: (a, t, l) => E("DELETE", `/enums/${t}/values/${l}`),
  reorderEnumValues: (a, t, l) => E("PUT", `/enums/${t}/values/reorder`, l),
  // ── Attribute validators (generic pluggable validation) ───────────
  // Attachments + per-attribute regex live in entity_metadata, published to psm-api.
  listAttributeValidators: (a, t, l) => E("GET", `/metamodel/attributes/${l}/validators?nodeTypeId=${encodeURIComponent(t)}`),
  attachAttributeValidator: (a, t, l) => E("POST", `/metamodel/attributes/${t}/validators`, l),
  detachAttributeValidator: (a, t, { nodeTypeId: l, stateId: y, instanceId: T }) => {
    const S = new URLSearchParams();
    return l && S.set("nodeTypeId", l), y && S.set("stateId", y), T && S.set("instanceId", T), E("DELETE", `/metamodel/attributes/${t}/validators?${S.toString()}`);
  },
  getAttributeRegex: (a, t, l) => E("GET", `/metamodel/attributes/${t}/regex${l ? `?nodeTypeId=${encodeURIComponent(l)}` : ""}`),
  setAttributeRegex: (a, t, l) => E("PUT", `/metamodel/attributes/${t}/regex`, { regex: l }),
  // Generic per-attribute metadata (entity_metadata, target_type=ATTRIBUTE_DEFINITION).
  listAttributeMetadata: (a, t) => E("GET", `/metamodel/attributes/${t}/metadata`),
  setAttributeMetadata: (a, t, l, y) => E("PUT", `/metamodel/attributes/${t}/metadata/${encodeURIComponent(l)}`, { value: y }),
  removeAttributeMetadata: (a, t, l) => E("DELETE", `/metamodel/attributes/${t}/metadata/${encodeURIComponent(l)}`)
};
let qe = () => {
}, lt = null, Ve = {}, rt = [], dt = () => Promise.reject("not initialised"), Qe = () => Promise.reject("not initialised");
const Je = ["VERSION_TO_MASTER", "VERSION_TO_VERSION"], Ze = ["ALPHA_NUMERIC"], et = ["NONE", "ITERATE", "RELEASE"], Ge = ["STRING", "NUMBER", "DATE", "BOOLEAN", "ENUM"], Be = ["TEXT", "TEXTAREA", "DROPDOWN", "DATE_PICKER", "CHECKBOX"], ht = ["NONE", "REQUIRE_SIGNATURE"], yt = ["NONE", "ITERATE", "REVISE"], Fe = "#6b7280", gt = [
  "#5b9cf6",
  "#38bdf8",
  "#34d399",
  "#a3e635",
  "#facc15",
  "#fb923c",
  "#f87171",
  "#e879f9",
  "#a78bfa",
  "#56d18e",
  "#e8a947",
  "#6b7280"
], ft = ["STEP", "CATIA_V5"], Se = (a) => (a || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/, "");
function He(a) {
  return (a == null ? void 0 : a.color) || (a == null ? void 0 : a.COLOR) || Fe;
}
function vt(a) {
  if (!a) return { fg: "var(--muted2)", bg: "rgba(120,130,150,.14)" };
  let t = 0;
  for (let y = 0; y < a.length; y++) t = t * 31 + a.charCodeAt(y) & 16777215;
  const l = t % 360;
  return { fg: `hsl(${l},70%,72%)`, bg: `hsl(${l},55%,22%)` };
}
function tt({ module: a }) {
  if (!a) return null;
  const t = vt(a);
  return /* @__PURE__ */ e(
    "span",
    {
      title: `Spring Modulith module: ${a}`,
      style: {
        display: "inline-block",
        padding: "1px 7px",
        borderRadius: 10,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: ".06em",
        fontFamily: "var(--mono)",
        textTransform: "uppercase",
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.fg}33`,
        verticalAlign: "middle"
      },
      children: a
    }
  );
}
function Re({ title: a, onClose: t, onSave: l, saving: y, saveLabel: T = "Save", children: S, width: p = 480 }) {
  return /* @__PURE__ */ e(
    "div",
    {
      className: "diff-overlay",
      style: { zIndex: 600 },
      onClick: (C) => {
        C.target === C.currentTarget && t();
      },
      children: /* @__PURE__ */ n("div", { className: "diff-modal", style: { width: p, maxHeight: "85vh", display: "flex", flexDirection: "column" }, children: [
        /* @__PURE__ */ n("div", { className: "diff-header", children: [
          /* @__PURE__ */ e("span", { className: "diff-title", children: a }),
          /* @__PURE__ */ e("button", { className: "diff-close", onClick: t, children: "×" })
        ] }),
        /* @__PURE__ */ e("div", { style: { flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }, children: S }),
        /* @__PURE__ */ n("div", { style: { padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 8, flexShrink: 0 }, children: [
          /* @__PURE__ */ e("button", { className: "btn", onClick: t, children: "Cancel" }),
          /* @__PURE__ */ e("button", { className: "btn btn-primary", onClick: l, disabled: y, children: y ? "Saving…" : T })
        ] })
      ] })
    }
  );
}
function I({ label: a, children: t }) {
  return /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: [
    /* @__PURE__ */ e("label", { style: { fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }, children: a }),
    t
  ] });
}
function Pe({ label: a, value: t, onChange: l }) {
  return /* @__PURE__ */ e(I, { label: a, children: /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
    /* @__PURE__ */ e("div", { style: {
      width: 28,
      height: 28,
      borderRadius: 4,
      flexShrink: 0,
      background: t || "var(--bg3)",
      border: "1px solid var(--border)"
    } }),
    /* @__PURE__ */ e(
      "input",
      {
        type: "color",
        className: "field-input",
        style: { width: 48, height: 28, padding: 1, cursor: "pointer" },
        value: t || "#6aacff",
        onChange: (y) => l(y.target.value)
      }
    ),
    /* @__PURE__ */ e(
      "input",
      {
        type: "text",
        className: "field-input",
        style: { flex: 1 },
        value: t || "",
        onChange: (y) => l(y.target.value),
        placeholder: "#rrggbb",
        maxLength: 7
      }
    ),
    t && /* @__PURE__ */ e("button", { className: "btn btn-sm", style: { padding: "2px 8px", fontSize: 10 }, onClick: () => l(""), children: "Clear" })
  ] }) });
}
function ot({ value: a, onChange: t }) {
  return /* @__PURE__ */ n(I, { label: "Icon", children: [
    /* @__PURE__ */ n("div", { style: { display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4, padding: "8px 0" }, children: [
      /* @__PURE__ */ e(
        "button",
        {
          title: "No icon",
          onClick: () => t(""),
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: 4,
            cursor: "pointer",
            border: a ? "1px solid var(--border)" : "2px solid var(--accent)",
            background: a ? "transparent" : "var(--accent-dim)",
            fontSize: 10,
            color: "var(--muted)"
          },
          children: "—"
        }
      ),
      rt.map((l) => {
        const y = Ve[l], T = a === l;
        return /* @__PURE__ */ e(
          "button",
          {
            title: l,
            onClick: () => t(l),
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 4,
              cursor: "pointer",
              border: T ? "2px solid var(--accent)" : "1px solid var(--border)",
              background: T ? "var(--accent-dim)" : "transparent"
            },
            children: /* @__PURE__ */ e(y, { size: 14, strokeWidth: 1.8, color: T ? "var(--accent)" : "var(--muted)" })
          },
          l
        );
      })
    ] }),
    a && /* @__PURE__ */ e("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: -4 }, children: a })
  ] });
}
function Ye({ label: a, action: t }) {
  return /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }, children: [
    /* @__PURE__ */ e("span", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--muted)" }, children: a }),
    t
  ] });
}
function bt({ value: a, onChange: t }) {
  return /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
    /* @__PURE__ */ e("div", { style: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }, children: gt.map((l) => /* @__PURE__ */ e(
      "button",
      {
        onClick: () => t(l),
        style: {
          width: "100%",
          aspectRatio: "1",
          borderRadius: 4,
          background: l,
          border: "none",
          cursor: "pointer",
          outline: a === l ? "2px solid var(--text)" : "2px solid transparent",
          outlineOffset: 2
        },
        title: l
      },
      l
    )) }),
    /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
      /* @__PURE__ */ e("label", { style: { fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }, children: "Custom" }),
      /* @__PURE__ */ e(
        "input",
        {
          type: "color",
          value: a || Fe,
          onChange: (l) => t(l.target.value),
          style: { width: 36, height: 28, padding: 2, border: "1px solid var(--border2)", borderRadius: 4, background: "var(--surface)", cursor: "pointer" }
        }
      ),
      /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }, children: a || Fe })
    ] })
  ] });
}
function Ue({ userId: a, enumDefinitionId: t, onChange: l }) {
  const [y, T] = _(null), [S, p] = _(null);
  return Ae(() => {
    f.getEnums(a).then((C) => T(Array.isArray(C) ? C : [])).catch(() => T([]));
  }, [a]), Ae(() => {
    if (!t) {
      p(null);
      return;
    }
    f.getEnumValues(a, t).then((C) => p(Array.isArray(C) ? C.filter(Boolean) : [])).catch(() => p([]));
  }, [a, t]), y === null ? /* @__PURE__ */ e(I, { label: "Enumeration", children: /* @__PURE__ */ e("span", { style: { fontSize: 12, color: "var(--muted)" }, children: "Loading…" }) }) : /* @__PURE__ */ n(re, { children: [
    /* @__PURE__ */ e(I, { label: "Enumeration *", children: /* @__PURE__ */ n("select", { className: "field-input", value: t || "", onChange: (C) => l(C.target.value || null), children: [
      /* @__PURE__ */ e("option", { value: "", children: "Select an enumeration…" }),
      y.map((C) => /* @__PURE__ */ n("option", { value: C.id, children: [
        C.name,
        " (",
        C.valueCount,
        " value",
        C.valueCount !== 1 ? "s" : "",
        ")"
      ] }, C.id))
    ] }) }),
    S && S.length > 0 && /* @__PURE__ */ e("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 }, children: S.map((C) => /* @__PURE__ */ e("span", { style: {
      display: "inline-block",
      background: "var(--accent-dim, #e0e7ff)",
      color: "var(--fg)",
      padding: "2px 8px",
      borderRadius: 4,
      fontSize: 11
    }, children: C.label || C.value }, C.id)) })
  ] });
}
function Xe({ form: a, setForm: t, autoFocusName: l = !0, hideAsName: y = !1, userId: T }) {
  const S = a.dataType || "STRING";
  return /* @__PURE__ */ n(re, { children: [
    /* @__PURE__ */ n("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
      /* @__PURE__ */ e(I, { label: "Name (internal key) *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: l, value: a.name || "", onChange: (p) => t((C) => ({ ...C, name: p.target.value })), placeholder: "e.g. reviewNote" }) }),
      /* @__PURE__ */ e(I, { label: "Label (display) *", children: /* @__PURE__ */ e("input", { className: "field-input", value: a.label || "", onChange: (p) => t((C) => ({ ...C, label: p.target.value })), placeholder: "e.g. Review Note" }) })
    ] }),
    /* @__PURE__ */ n("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
      /* @__PURE__ */ e(I, { label: "Data Type", children: /* @__PURE__ */ e("select", { className: "field-input", value: S, onChange: (p) => t((C) => ({ ...C, dataType: p.target.value })), children: Ge.map((p) => /* @__PURE__ */ e("option", { value: p, children: p }, p)) }) }),
      /* @__PURE__ */ e(I, { label: "Widget", children: /* @__PURE__ */ e("select", { className: "field-input", value: a.widgetType || "TEXT", onChange: (p) => t((C) => ({ ...C, widgetType: p.target.value })), children: Be.map((p) => /* @__PURE__ */ e("option", { value: p, children: p }, p)) }) })
    ] }),
    /* @__PURE__ */ n("div", { style: { display: "grid", gridTemplateColumns: "1fr 80px", gap: 12 }, children: [
      /* @__PURE__ */ e(I, { label: "Section", children: /* @__PURE__ */ e("input", { className: "field-input", value: a.displaySection || "", onChange: (p) => t((C) => ({ ...C, displaySection: p.target.value })), placeholder: "e.g. Details" }) }),
      /* @__PURE__ */ e(I, { label: "Order", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: a.displayOrder ?? "", onChange: (p) => t((C) => ({ ...C, displayOrder: p.target.value })), placeholder: "0" }) })
    ] }),
    /* @__PURE__ */ e(I, { label: "Default value", children: /* @__PURE__ */ e("input", { className: "field-input", value: a.defaultValue || "", onChange: (p) => t((C) => ({ ...C, defaultValue: p.target.value })), placeholder: "Optional" }) }),
    S !== "ENUM" && /* @__PURE__ */ e(I, { label: "Allowed values (comma-separated)", children: /* @__PURE__ */ e("input", { className: "field-input", value: a.allowedValues || "", onChange: (p) => t((C) => ({ ...C, allowedValues: p.target.value })), placeholder: "e.g. Low,Medium,High" }) }),
    /* @__PURE__ */ e(I, { label: "Tooltip", children: /* @__PURE__ */ e("input", { className: "field-input", value: a.tooltip || "", onChange: (p) => t((C) => ({ ...C, tooltip: p.target.value })), placeholder: "Hint shown next to the field" }) }),
    /* @__PURE__ */ e("div", { style: { display: "flex", gap: 20, flexWrap: "wrap" }, children: !y && /* @__PURE__ */ n("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13 }, children: [
      /* @__PURE__ */ e("input", { type: "checkbox", checked: !!a.asName, onChange: (p) => t((C) => ({ ...C, asName: p.target.checked })) }),
      "Use as display name ",
      /* @__PURE__ */ e("span", { style: { color: "var(--accent)", marginLeft: 2 }, children: "★" })
    ] }) }),
    S === "ENUM" && T && /* @__PURE__ */ e(
      Ue,
      {
        userId: T,
        enumDefinitionId: a.enumDefinitionId || null,
        onChange: (p) => t((C) => ({ ...C, enumDefinitionId: p }))
      }
    )
  ] });
}
const Nt = "algtype-attribute-validator";
function Tt({ userId: a, nodeTypeId: t, attrDefId: l, lifecycleId: y, canWrite: T, toast: S }) {
  const [p, C] = _({}), [P, G] = _([]), [M, v] = _([]), [W, c] = _({}), [x, H] = _(!0), [ae, L] = _(""), [te, s] = _(""), [R, d] = _("*"), [g, N] = _(""), [u, A] = _(!1), h = $e(
    () => f.listAttributeMetadata(a, l).then((b) => C(b && typeof b == "object" ? b : {})).catch(() => C({})),
    [a, l]
  ), V = $e(
    () => f.listAttributeValidators(a, t, l).then((b) => c(b && typeof b == "object" ? b : {})).catch(() => c({})),
    [a, t, l]
  );
  Ae(() => {
    let b = !1;
    return H(!0), Promise.all([
      f.listAttributeMetadata(a, l).then((z) => z && typeof z == "object" ? z : {}).catch(() => ({})),
      f.listAttributeValidators(a, t, l).then((z) => z && typeof z == "object" ? z : {}).catch(() => ({})),
      Qe("GET", "/algorithms/instances").then((z) => Array.isArray(z) ? z : []).catch(() => []),
      y ? f.getLifecycleStates(a, y).then((z) => Array.isArray(z) ? z : []).catch(() => []) : Promise.resolve([])
    ]).then(([z, Q, Ee, ge]) => {
      b || (C(z), c(Q), v(Ee), G(ge), H(!1));
    }), () => {
      b = !0;
    };
  }, [a, l, t, y]);
  const J = (b) => {
    const z = M.find((Q) => (Q.id || Q.ID) === b);
    return z && (z.name || z.NAME) || b;
  }, se = (b) => {
    if (b === "*" || b === "_" || b == null) return "All states";
    const z = P.find((Q) => (Q.id || Q.ID) === b);
    return z && (z.name || z.NAME) || b;
  }, m = (b) => {
    const z = b.indexOf("__");
    return z < 0 ? { stateId: "_", instanceId: b } : { stateId: b.slice(0, z), instanceId: b.slice(z + 2) };
  };
  async function F(b, z) {
    A(!0);
    try {
      await f.setAttributeMetadata(a, l, b, z ?? ""), await h();
    } catch (Q) {
      S(Q, "error");
    } finally {
      A(!1);
    }
  }
  async function Z() {
    const b = ae.trim();
    b && (await F(b, te), L(""), s(""));
  }
  async function i(b) {
    A(!0);
    try {
      await f.removeAttributeMetadata(a, l, b), await h();
    } catch (z) {
      S(z, "error");
    } finally {
      A(!1);
    }
  }
  async function r() {
    if (g) {
      A(!0);
      try {
        await f.attachAttributeValidator(a, l, { nodeTypeId: t, stateId: R === "*" ? null : R, instanceId: g }), await V(), N(""), S("Validator attached", "success");
      } catch (b) {
        S(b, "error");
      } finally {
        A(!1);
      }
    }
  }
  async function O(b, z) {
    try {
      await f.detachAttributeValidator(a, l, { nodeTypeId: t, stateId: b === "*" ? null : b, instanceId: z }), await V(), S("Validator detached", "success");
    } catch (Q) {
      S(Q, "error");
    }
  }
  if (x) return /* @__PURE__ */ e("div", { style: { fontSize: 12, color: "var(--muted)", padding: "4px 0" }, children: "Loading…" });
  const B = Object.keys(p), K = Object.keys(W), ne = { fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 6, marginBottom: 6 };
  return /* @__PURE__ */ n(re, { children: [
    /* @__PURE__ */ e("div", { style: ne, children: "Metadata" }),
    B.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", style: { fontSize: 11, marginBottom: 6 }, children: "No metadata" }),
    B.map((b) => /* @__PURE__ */ n("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }, children: [
      /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono)", fontSize: 11, minWidth: 130, color: "var(--accent)", wordBreak: "break-all" }, children: b }),
      /* @__PURE__ */ e(
        "input",
        {
          className: "field-input",
          style: { flex: 1, fontFamily: "var(--mono)", fontSize: 11 },
          defaultValue: p[b],
          disabled: !T,
          onBlur: (z) => {
            z.target.value !== p[b] && F(b, z.target.value);
          },
          onKeyDown: (z) => {
            z.key === "Enter" && z.target.blur();
          }
        }
      ),
      T && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete metadata", onClick: () => i(b), children: /* @__PURE__ */ e(ce, { size: 10, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
    ] }, b)),
    T && /* @__PURE__ */ n("div", { style: { display: "flex", gap: 6, alignItems: "center", marginTop: 2 }, children: [
      /* @__PURE__ */ e(
        "input",
        {
          className: "field-input",
          style: { minWidth: 130, fontSize: 11, fontFamily: "var(--mono)" },
          value: ae,
          onChange: (b) => L(b.target.value),
          placeholder: "key (e.g. validation.regex)"
        }
      ),
      /* @__PURE__ */ e(
        "input",
        {
          className: "field-input",
          style: { flex: 1, fontSize: 11, fontFamily: "var(--mono)" },
          value: te,
          onChange: (b) => s(b.target.value),
          placeholder: "value",
          onKeyDown: (b) => {
            b.key === "Enter" && Z();
          }
        }
      ),
      /* @__PURE__ */ e("button", { className: "btn btn-sm", style: { fontSize: 10 }, disabled: u || !ae.trim(), onClick: Z, children: "Add" })
    ] }),
    /* @__PURE__ */ e("div", { style: ne, children: "Validators" }),
    K.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", style: { fontSize: 11, marginBottom: 8 }, children: "No validators attached" }),
    K.map((b) => {
      const { stateId: z, instanceId: Q } = m(b);
      return /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", marginBottom: 2, borderRadius: 3, background: "var(--subtle-bg)", border: "1px solid var(--border)", fontSize: 11 }, children: [
        /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono)", color: "var(--accent)", fontWeight: 600 }, children: J(Q) }),
        /* @__PURE__ */ n("span", { style: { fontSize: 10, color: "var(--muted)" }, children: [
          "@ ",
          se(z)
        ] }),
        /* @__PURE__ */ e("span", { style: { flex: 1 } }),
        T && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Detach validator", onClick: () => O(z, Q), children: /* @__PURE__ */ e(ce, { size: 10, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
      ] }, b);
    }),
    T && /* @__PURE__ */ n("div", { style: { display: "flex", gap: 6, marginTop: 4, alignItems: "center", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ n("select", { className: "field-input", style: { flex: 1, minWidth: 160, fontSize: 11 }, value: g, onChange: (b) => N(b.target.value), children: [
        /* @__PURE__ */ e("option", { value: "", children: "Select validator…" }),
        M.filter((b) => (b.algorithmTypeId || b.ALGORITHM_TYPE_ID) === Nt).map((b) => {
          const z = b.id || b.ID, Q = b.algorithmName || b.ALGORITHM_NAME;
          return /* @__PURE__ */ n("option", { value: z, children: [
            b.name || b.NAME || z,
            Q ? ` (${Q})` : ""
          ] }, z);
        })
      ] }),
      /* @__PURE__ */ n("select", { className: "field-input", style: { width: 130, fontSize: 11 }, value: R, onChange: (b) => d(b.target.value), children: [
        /* @__PURE__ */ e("option", { value: "*", children: "All states" }),
        P.map((b) => {
          const z = b.id || b.ID;
          return /* @__PURE__ */ e("option", { value: z, children: b.name || b.NAME || z }, z);
        })
      ] }),
      /* @__PURE__ */ e("button", { className: "btn btn-sm", style: { fontSize: 10 }, disabled: u || !g, onClick: r, children: "Attach" })
    ] })
  ] });
}
function It({ form: a, setForm: t, knownMetaKeys: l = [], onNameChange: y = null }) {
  const T = a.metadata || {}, S = (P, G) => t((M) => ({
    ...M,
    metadata: { ...M.metadata || {}, [P]: G ? "true" : void 0 }
  })), p = new Set(l), C = Object.keys(T).filter((P) => !p.has(P));
  return /* @__PURE__ */ n(re, { children: [
    /* @__PURE__ */ e(I, { label: "State Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !y, value: a.name || "", onChange: (P) => y ? y(P.target.value) : t((G) => ({ ...G, name: P.target.value })), placeholder: "e.g. In Review" }) }),
    /* @__PURE__ */ e(I, { label: "Display Order", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: a.displayOrder ?? "", onChange: (P) => t((G) => ({ ...G, displayOrder: P.target.value })), placeholder: "0", style: { width: 100 } }) }),
    /* @__PURE__ */ e(I, { label: "Flags", children: /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: /* @__PURE__ */ n("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }, children: [
      /* @__PURE__ */ e("input", { type: "checkbox", checked: !!a.isInitial, onChange: (P) => t((G) => ({ ...G, isInitial: P.target.checked })) }),
      /* @__PURE__ */ e("span", { className: "lc-state-flag", style: { opacity: a.isInitial ? 1 : 0.4 }, children: "INIT" }),
      /* @__PURE__ */ e("span", { style: { color: "var(--muted)", fontSize: 11 }, children: "Initial state — entry point of the lifecycle" })
    ] }) }) }),
    /* @__PURE__ */ e(I, { label: "Metadata", children: /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
      l.map((P) => /* @__PURE__ */ n("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }, children: [
        /* @__PURE__ */ e("input", { type: "checkbox", checked: T[P] === "true", onChange: (G) => S(P, G.target.checked) }),
        /* @__PURE__ */ e("span", { className: "lc-state-flag", style: { opacity: T[P] === "true" ? 1 : 0.4 }, children: P.toUpperCase() })
      ] }, P)),
      l.length === 0 && /* @__PURE__ */ e("span", { style: { color: "var(--muted)", fontSize: 11 }, children: "No metadata keys registered in backend" }),
      C.map((P) => /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11 }, children: [
        /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono)", color: "var(--accent)" }, children: P }),
        /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "=" }),
        /* @__PURE__ */ e("span", { style: { color: "var(--text)" }, children: T[P] }),
        /* @__PURE__ */ e("button", { className: "panel-icon-btn", onClick: () => {
          const G = { ...a.metadata || {} };
          delete G[P], t((M) => ({ ...M, metadata: G }));
        }, title: "Remove", children: /* @__PURE__ */ e(ce, { size: 10, strokeWidth: 2, color: "var(--danger)" }) })
      ] }, P))
    ] }) }),
    /* @__PURE__ */ e(I, { label: "Color", children: /* @__PURE__ */ e(bt, { value: a.color || Fe, onChange: (P) => t((G) => ({ ...G, color: P })) }) })
  ] });
}
function Et({ form: a, setForm: t, states: l, onNameChange: y = null }) {
  return /* @__PURE__ */ n(re, { children: [
    /* @__PURE__ */ e(I, { label: "Transition Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !y, value: a.name || "", onChange: (T) => y ? y(T.target.value) : t((S) => ({ ...S, name: T.target.value })), placeholder: "e.g. freeze" }) }),
    /* @__PURE__ */ n("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
      /* @__PURE__ */ e(I, { label: "From State *", children: /* @__PURE__ */ n("select", { className: "field-input", value: a.fromStateId || "", onChange: (T) => t((S) => ({ ...S, fromStateId: T.target.value })), children: [
        /* @__PURE__ */ e("option", { value: "", children: "Select…" }),
        l.map((T) => {
          const S = T.id || T.ID;
          return /* @__PURE__ */ e("option", { value: S, children: T.name || T.NAME || S }, S);
        })
      ] }) }),
      /* @__PURE__ */ e(I, { label: "To State *", children: /* @__PURE__ */ n("select", { className: "field-input", value: a.toStateId || "", onChange: (T) => t((S) => ({ ...S, toStateId: T.target.value })), children: [
        /* @__PURE__ */ e("option", { value: "", children: "Select…" }),
        l.map((T) => {
          const S = T.id || T.ID;
          return /* @__PURE__ */ e("option", { value: S, children: T.name || T.NAME || S }, S);
        })
      ] }) })
    ] }),
    /* @__PURE__ */ n("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
      /* @__PURE__ */ e(I, { label: "Action Type", children: /* @__PURE__ */ e("select", { className: "field-input", value: a.actionType || "NONE", onChange: (T) => t((S) => ({ ...S, actionType: T.target.value })), children: ht.map((T) => /* @__PURE__ */ e("option", { value: T, children: T }, T)) }) }),
      /* @__PURE__ */ e(I, { label: "Version Strategy", children: /* @__PURE__ */ e("select", { className: "field-input", value: a.versionStrategy || "NONE", onChange: (T) => t((S) => ({ ...S, versionStrategy: T.target.value })), children: yt.map((T) => /* @__PURE__ */ e("option", { value: T, children: T }, T)) }) })
    ] })
  ] });
}
function Ct({ userId: a, linkTypeId: t, canWrite: l, toast: y }) {
  var s, R;
  const [T, S] = _(null), [p, C] = _(null), [P, G] = _(null), [M, v] = _({}), [W, c] = _(!1), x = $e(
    () => f.getLinkTypeAttributes(a, t).then((d) => S(Array.isArray(d) ? d : [])).catch(() => S([])),
    [a, t]
  );
  Ae(() => {
    x();
  }, [x]);
  function H(d) {
    v({
      label: d.label || d.LABEL || "",
      dataType: d.data_type || d.DATA_TYPE || "STRING",
      widgetType: d.widget_type || d.WIDGET_TYPE || "TEXT",
      required: !!(d.required || d.REQUIRED),
      enumDefinitionId: d.enum_definition_id || d.ENUM_DEFINITION_ID || null,
      displaySection: d.display_section || d.DISPLAY_SECTION || "",
      displayOrder: d.display_order ?? d.DISPLAY_ORDER ?? "",
      defaultValue: d.default_value || d.DEFAULT_VALUE || "",
      namingRegex: d.naming_regex || d.NAMING_REGEX || "",
      allowedValues: d.allowed_values || d.ALLOWED_VALUES || "",
      tooltip: d.tooltip || d.TOOLTIP || ""
    }), G({ attr: d });
  }
  async function ae() {
    var d, g, N, u;
    c(!0);
    try {
      await f.updateLinkTypeAttribute(a, t, P.attr.id || P.attr.ID, {
        label: M.label,
        dataType: M.dataType,
        widgetType: M.widgetType,
        required: !!M.required,
        enumDefinitionId: M.dataType === "ENUM" && M.enumDefinitionId || null,
        displaySection: M.displaySection || null,
        displayOrder: M.displayOrder !== "" ? Number(M.displayOrder) : 0,
        defaultValue: ((d = M.defaultValue) == null ? void 0 : d.trim()) || null,
        namingRegex: ((g = M.namingRegex) == null ? void 0 : g.trim()) || null,
        allowedValues: M.dataType !== "ENUM" && ((N = M.allowedValues) == null ? void 0 : N.trim()) || null,
        tooltip: ((u = M.tooltip) == null ? void 0 : u.trim()) || null
      }), await x(), G(null);
    } catch (A) {
      y(A, "error");
    } finally {
      c(!1);
    }
  }
  async function L() {
    var d, g, N, u, A, h;
    if (!(!((d = p == null ? void 0 : p.name) != null && d.trim()) || !((g = p == null ? void 0 : p.label) != null && g.trim()))) {
      c(!0);
      try {
        await f.createLinkTypeAttribute(a, t, {
          name: p.name.trim(),
          label: p.label.trim(),
          dataType: p.dataType || "STRING",
          widgetType: p.widgetType || "TEXT",
          required: !!p.required,
          enumDefinitionId: p.dataType === "ENUM" && p.enumDefinitionId || null,
          displaySection: p.displaySection || null,
          displayOrder: p.displayOrder !== "" ? Number(p.displayOrder) : 0,
          defaultValue: ((N = p.defaultValue) == null ? void 0 : N.trim()) || null,
          namingRegex: ((u = p.namingRegex) == null ? void 0 : u.trim()) || null,
          allowedValues: p.dataType !== "ENUM" && ((A = p.allowedValues) == null ? void 0 : A.trim()) || null,
          tooltip: ((h = p.tooltip) == null ? void 0 : h.trim()) || null
        }), await x(), C(null);
      } catch (V) {
        y(V, "error");
      } finally {
        c(!1);
      }
    }
  }
  async function te(d) {
    const g = d.label || d.LABEL || d.name || d.NAME;
    if (window.confirm(`Delete attribute "${g}"?`))
      try {
        await f.deleteLinkTypeAttribute(a, t, d.id || d.ID), await x();
      } catch (N) {
        y(N, "error");
      }
  }
  return T === null ? /* @__PURE__ */ e("div", { style: { fontSize: 12, color: "var(--muted)", padding: "4px 0" }, children: "Loading…" }) : /* @__PURE__ */ n(re, { children: [
    P && /* @__PURE__ */ n(Re, { title: "Edit Attribute", onClose: () => G(null), onSave: ae, saving: W, saveLabel: "Update", children: [
      /* @__PURE__ */ e(I, { label: "Label (display) *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: M.label || "", onChange: (d) => v((g) => ({ ...g, label: d.target.value })) }) }),
      /* @__PURE__ */ n("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
        /* @__PURE__ */ e(I, { label: "Data Type", children: /* @__PURE__ */ e("select", { className: "field-input", value: M.dataType || "STRING", onChange: (d) => v((g) => ({ ...g, dataType: d.target.value })), children: Ge.map((d) => /* @__PURE__ */ e("option", { value: d, children: d }, d)) }) }),
        /* @__PURE__ */ e(I, { label: "Widget", children: /* @__PURE__ */ e("select", { className: "field-input", value: M.widgetType || "TEXT", onChange: (d) => v((g) => ({ ...g, widgetType: d.target.value })), children: Be.map((d) => /* @__PURE__ */ e("option", { value: d, children: d }, d)) }) })
      ] }),
      M.dataType === "ENUM" && /* @__PURE__ */ e(
        Ue,
        {
          userId: a,
          enumDefinitionId: M.enumDefinitionId || null,
          onChange: (d) => v((g) => ({ ...g, enumDefinitionId: d }))
        }
      ),
      /* @__PURE__ */ n("div", { style: { display: "grid", gridTemplateColumns: "1fr 80px", gap: 12 }, children: [
        /* @__PURE__ */ e(I, { label: "Section", children: /* @__PURE__ */ e("input", { className: "field-input", value: M.displaySection || "", onChange: (d) => v((g) => ({ ...g, displaySection: d.target.value })) }) }),
        /* @__PURE__ */ e(I, { label: "Order", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: M.displayOrder ?? "", onChange: (d) => v((g) => ({ ...g, displayOrder: d.target.value })) }) })
      ] }),
      /* @__PURE__ */ e(I, { label: "Default value", children: /* @__PURE__ */ e("input", { className: "field-input", value: M.defaultValue || "", onChange: (d) => v((g) => ({ ...g, defaultValue: d.target.value })), placeholder: "Optional" }) }),
      /* @__PURE__ */ e(I, { label: "Validation regex", children: /* @__PURE__ */ e("input", { className: "field-input", value: M.namingRegex || "", onChange: (d) => v((g) => ({ ...g, namingRegex: d.target.value })) }) }),
      M.dataType !== "ENUM" && /* @__PURE__ */ e(I, { label: "Allowed values (comma-separated)", children: /* @__PURE__ */ e("input", { className: "field-input", value: M.allowedValues || "", onChange: (d) => v((g) => ({ ...g, allowedValues: d.target.value })) }) }),
      /* @__PURE__ */ e(I, { label: "Tooltip", children: /* @__PURE__ */ e("input", { className: "field-input", value: M.tooltip || "", onChange: (d) => v((g) => ({ ...g, tooltip: d.target.value })) }) }),
      /* @__PURE__ */ n("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13 }, children: [
        /* @__PURE__ */ e("input", { type: "checkbox", checked: !!M.required, onChange: (d) => v((g) => ({ ...g, required: d.target.checked })) }),
        "Required field"
      ] })
    ] }),
    T.length > 0 && /* @__PURE__ */ n("table", { className: "settings-table", style: { marginBottom: 8 }, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
        /* @__PURE__ */ e("th", { children: "Name" }),
        /* @__PURE__ */ e("th", { children: "Label" }),
        /* @__PURE__ */ e("th", { children: "Type" }),
        /* @__PURE__ */ e("th", { children: "Req" }),
        /* @__PURE__ */ e("th", {})
      ] }) }),
      /* @__PURE__ */ e("tbody", { children: [...T].sort((d, g) => (d.display_order || d.DISPLAY_ORDER || 0) - (g.display_order || g.DISPLAY_ORDER || 0)).map((d) => {
        const g = d.id || d.ID, N = d.name || d.NAME, u = d.label || d.LABEL || N, A = d.data_type || d.DATA_TYPE || "STRING", h = !!(d.required || d.REQUIRED);
        return /* @__PURE__ */ n("tr", { children: [
          /* @__PURE__ */ e("td", { className: "settings-td-mono", children: N }),
          /* @__PURE__ */ e("td", { children: u }),
          /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "settings-badge", children: A }) }),
          /* @__PURE__ */ e("td", { style: { color: h ? "var(--success)" : "var(--muted)" }, children: h ? "✓" : "—" }),
          /* @__PURE__ */ e("td", { children: /* @__PURE__ */ n("div", { style: { display: "flex", gap: 4 }, children: [
            l && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit", onClick: () => H(d), children: /* @__PURE__ */ e(ye, { size: 11, strokeWidth: 2, color: "var(--accent)" }) }),
            l && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: () => te(d), children: /* @__PURE__ */ e(ce, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
          ] }) })
        ] }, g);
      }) })
    ] }),
    T.length === 0 && !p && /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No attributes" }),
    p ? /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", gap: 8, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: 12, marginTop: 4 }, children: [
      /* @__PURE__ */ n("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
        /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, placeholder: "Name (key) *", value: p.name || "", onChange: (d) => C((g) => ({ ...g, name: d.target.value })) }),
        /* @__PURE__ */ e("input", { className: "field-input", placeholder: "Label (display) *", value: p.label || "", onChange: (d) => C((g) => ({ ...g, label: d.target.value })) })
      ] }),
      /* @__PURE__ */ n("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 8 }, children: [
        /* @__PURE__ */ e("select", { className: "field-input", value: p.dataType || "STRING", onChange: (d) => C((g) => ({ ...g, dataType: d.target.value })), children: Ge.map((d) => /* @__PURE__ */ e("option", { value: d, children: d }, d)) }),
        /* @__PURE__ */ e("select", { className: "field-input", value: p.widgetType || "TEXT", onChange: (d) => C((g) => ({ ...g, widgetType: d.target.value })), children: Be.map((d) => /* @__PURE__ */ e("option", { value: d, children: d }, d)) }),
        /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", placeholder: "Order", value: p.displayOrder ?? "", onChange: (d) => C((g) => ({ ...g, displayOrder: d.target.value })) })
      ] }),
      p.dataType === "ENUM" && /* @__PURE__ */ e(
        Ue,
        {
          userId: a,
          enumDefinitionId: p.enumDefinitionId || null,
          onChange: (d) => C((g) => ({ ...g, enumDefinitionId: d }))
        }
      ),
      /* @__PURE__ */ e("input", { className: "field-input", placeholder: "Default value (optional)", value: p.defaultValue || "", onChange: (d) => C((g) => ({ ...g, defaultValue: d.target.value })) }),
      /* @__PURE__ */ e("input", { className: "field-input", placeholder: "Validation regex (optional)", value: p.namingRegex || "", onChange: (d) => C((g) => ({ ...g, namingRegex: d.target.value })) }),
      p.dataType !== "ENUM" && /* @__PURE__ */ e("input", { className: "field-input", placeholder: "Allowed values comma-separated (optional)", value: p.allowedValues || "", onChange: (d) => C((g) => ({ ...g, allowedValues: d.target.value })) }),
      /* @__PURE__ */ e("input", { className: "field-input", placeholder: "Tooltip (optional)", value: p.tooltip || "", onChange: (d) => C((g) => ({ ...g, tooltip: d.target.value })) }),
      /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ n("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 12 }, children: [
          /* @__PURE__ */ e("input", { type: "checkbox", checked: !!p.required, onChange: (d) => C((g) => ({ ...g, required: d.target.checked })) }),
          "Required"
        ] }),
        /* @__PURE__ */ n("div", { style: { display: "flex", gap: 6 }, children: [
          /* @__PURE__ */ e("button", { className: "btn", onClick: () => C(null), children: "Cancel" }),
          /* @__PURE__ */ e("button", { className: "btn btn-primary", onClick: L, disabled: W || !((s = p.name) != null && s.trim()) || !((R = p.label) != null && R.trim()), children: W ? "Adding…" : "Add" })
        ] })
      ] })
    ] }) : l ? /* @__PURE__ */ n(
      "button",
      {
        className: "btn btn-sm",
        style: { display: "flex", alignItems: "center", gap: 5, alignSelf: "flex-start", marginTop: 4 },
        onClick: () => C({ dataType: "STRING", widgetType: "TEXT", required: !1 }),
        children: [
          /* @__PURE__ */ e(be, { size: 11, strokeWidth: 2.5 }),
          "Add attribute"
        ]
      }
    ) : null
  ] });
}
function St({ userId: a, linkTypeId: t, sourceLifecycleId: l, targetLifecycleId: y, canWrite: T, toast: S }) {
  const [p, C] = _(null), [P, G] = _([]), [M, v] = _([]), [W, c] = _([]), [x, H] = _(null), [ae, L] = _(!1), te = $e(
    () => f.getLinkTypeCascades(a, t).then((N) => C(Array.isArray(N) ? N : [])).catch(() => C([])),
    [a, t]
  );
  Ae(() => {
    te();
  }, [te]);
  function s() {
    const N = [];
    l && P.length === 0 && N.push(f.getLifecycleTransitions(a, l).then((u) => G(Array.isArray(u) ? u : [])).catch(() => {
    })), y && M.length === 0 && N.push(f.getLifecycleStates(a, y).then((u) => v(Array.isArray(u) ? u : [])).catch(() => {
    })), y && W.length === 0 && N.push(f.getLifecycleTransitions(a, y).then((u) => c(Array.isArray(u) ? u : [])).catch(() => {
    })), Promise.all(N).then(() => H({ parentTransitionId: "", childFromStateId: "", childTransitionId: "" }));
  }
  async function R() {
    if (!(!(x != null && x.parentTransitionId) || !(x != null && x.childFromStateId) || !(x != null && x.childTransitionId))) {
      L(!0);
      try {
        await f.createLinkTypeCascade(a, t, x.parentTransitionId, x.childFromStateId, x.childTransitionId), await te(), H(null);
      } catch (N) {
        S(N, "error");
      } finally {
        L(!1);
      }
    }
  }
  async function d(N) {
    const u = N.parent_transition_name || N.PARENT_TRANSITION_NAME || N.parent_transition_id, A = N.child_from_state_name || N.CHILD_FROM_STATE_NAME || N.child_from_state_id, h = N.child_transition_name || N.CHILD_TRANSITION_NAME || N.child_transition_id;
    if (window.confirm(`Delete cascade rule "${u} → [${A}] → ${h}"?`))
      try {
        await f.deleteLinkTypeCascade(a, t, N.id || N.ID), await te();
      } catch (V) {
        S(V, "error");
      }
  }
  const g = (N) => /* @__PURE__ */ e("span", { style: { display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: N || "#6b7280", flexShrink: 0 } });
  return p === null ? /* @__PURE__ */ e("div", { style: { fontSize: 12, color: "var(--muted)", padding: "4px 0" }, children: "Loading…" }) : !l || !y ? /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "Cascade rules require both source and target node types to have a lifecycle." }) : /* @__PURE__ */ n(re, { children: [
    p.length > 0 && /* @__PURE__ */ n("table", { className: "settings-table", style: { marginBottom: 8 }, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
        /* @__PURE__ */ e("th", { children: "Parent transition" }),
        /* @__PURE__ */ e("th", {}),
        /* @__PURE__ */ e("th", { children: "Child state" }),
        /* @__PURE__ */ e("th", {}),
        /* @__PURE__ */ e("th", { children: "Child transition" }),
        /* @__PURE__ */ e("th", {})
      ] }) }),
      /* @__PURE__ */ e("tbody", { children: p.map((N) => {
        const u = N.child_from_state_color || N.CHILD_FROM_STATE_COLOR, A = N.parent_transition_name || N.PARENT_TRANSITION_NAME || N.parent_transition_id, h = N.child_from_state_name || N.CHILD_FROM_STATE_NAME || N.child_from_state_id, V = N.child_transition_name || N.CHILD_TRANSITION_NAME || N.child_transition_id;
        return /* @__PURE__ */ n("tr", { children: [
          /* @__PURE__ */ e("td", { style: { fontSize: 12 }, children: A }),
          /* @__PURE__ */ e("td", { style: { color: "var(--muted)", fontSize: 12 }, children: "→" }),
          /* @__PURE__ */ e("td", { children: /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
            g(u),
            /* @__PURE__ */ e("span", { style: { color: u || "var(--text)", fontSize: 12 }, children: h })
          ] }) }),
          /* @__PURE__ */ e("td", { style: { color: "var(--muted)", fontSize: 12 }, children: "→" }),
          /* @__PURE__ */ e("td", { style: { fontSize: 12 }, children: V }),
          /* @__PURE__ */ e("td", { children: T && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: () => d(N), children: /* @__PURE__ */ e(ce, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) }) })
        ] }, N.id || N.ID);
      }) })
    ] }),
    p.length === 0 && !x && /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No cascade rules — child nodes will not be automatically transitioned." }),
    x ? /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", gap: 8, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }, children: [
      /* @__PURE__ */ n("div", { style: { display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 8, alignItems: "center" }, children: [
        /* @__PURE__ */ n("select", { className: "field-input", value: x.parentTransitionId, onChange: (N) => H((u) => ({ ...u, parentTransitionId: N.target.value })), children: [
          /* @__PURE__ */ e("option", { value: "", children: "Parent transition…" }),
          P.map((N) => {
            const u = N.id || N.ID;
            return /* @__PURE__ */ e("option", { value: u, children: N.name || N.NAME || u }, u);
          })
        ] }),
        /* @__PURE__ */ e("span", { style: { color: "var(--muted)", fontSize: 13 }, children: "→" }),
        /* @__PURE__ */ n("select", { className: "field-input", value: x.childFromStateId, onChange: (N) => H((u) => ({ ...u, childFromStateId: N.target.value })), children: [
          /* @__PURE__ */ e("option", { value: "", children: "Child state…" }),
          M.map((N) => {
            const u = N.id || N.ID;
            return /* @__PURE__ */ e("option", { value: u, children: N.name || N.NAME || u }, u);
          })
        ] }),
        /* @__PURE__ */ e("span", { style: { color: "var(--muted)", fontSize: 13 }, children: "→" }),
        /* @__PURE__ */ n("select", { className: "field-input", value: x.childTransitionId, onChange: (N) => H((u) => ({ ...u, childTransitionId: N.target.value })), children: [
          /* @__PURE__ */ e("option", { value: "", children: "Child transition…" }),
          W.map((N) => {
            const u = N.id || N.ID;
            return /* @__PURE__ */ e("option", { value: u, children: N.name || N.NAME || u }, u);
          })
        ] })
      ] }),
      /* @__PURE__ */ n("div", { style: { display: "flex", justifyContent: "flex-end", gap: 6 }, children: [
        /* @__PURE__ */ e("button", { className: "btn", onClick: () => H(null), children: "Cancel" }),
        /* @__PURE__ */ e("button", { className: "btn btn-primary", onClick: R, disabled: ae || !x.parentTransitionId || !x.childFromStateId || !x.childTransitionId, children: ae ? "Adding…" : "Add Rule" })
      ] })
    ] }) : T ? /* @__PURE__ */ n("button", { className: "btn btn-sm", style: { display: "flex", alignItems: "center", gap: 5, alignSelf: "flex-start", marginTop: 4 }, onClick: s, children: [
      /* @__PURE__ */ e(be, { size: 11, strokeWidth: 2.5 }),
      "Add rule"
    ] }) : null
  ] });
}
function At({ userId: a, canWrite: t, toast: l }) {
  const [y, T] = _([]), [S, p] = _(null), [C, P] = _({}), [G, M] = _({}), [v, W] = _(!0), [c, x] = _([]), [H, ae] = _([]), [L, te] = _(null), [s, R] = _({}), [d, g] = _(!1);
  function N() {
    return f.getNodeTypes(a).then((i) => T(Array.isArray(i) ? i : []));
  }
  Ae(() => {
    N().finally(() => W(!1)), f.getLifecycles(a).then((i) => x(Array.isArray(i) ? i : [])), f.getSources(a).then((i) => ae(Array.isArray(i) ? i : []));
  }, [a]), qe((i) => {
    i.event === "METAMODEL_CHANGED" && N();
  });
  const u = {};
  y.forEach((i) => {
    u[i.id || i.ID] = i.name || i.NAME;
  });
  async function A(i) {
    const r = i.id || i.ID;
    if (S === r) {
      p(null);
      return;
    }
    p(r);
    const O = [];
    C[r] || O.push(
      f.getNodeTypeAttributes(a, r).then((B) => P((K) => ({ ...K, [r]: Array.isArray(B) ? B : [] }))).catch(() => P((B) => ({ ...B, [r]: [] })))
    ), G[r] || O.push(
      f.getNodeTypeLinkTypes(a, r).then((B) => M((K) => ({ ...K, [r]: Array.isArray(B) ? B : [] }))).catch(() => M((B) => ({ ...B, [r]: [] })))
    ), await Promise.all(O);
  }
  function h(i, r = {}, O = {}) {
    R(O), te({ type: i, ctx: r });
  }
  function V() {
    te(null), R({});
  }
  async function J() {
    var i, r, O, B, K, ne, b, z, Q, Ee, ge, Ne, de, pe, Te, ke, _e, k, o, q, ie, le;
    g(!0);
    try {
      const { type: U, ctx: j } = L;
      if (U === "create-nodetype")
        await f.createNodeType(a, {
          code: (i = s.code) == null ? void 0 : i.trim(),
          name: (r = s.name) == null ? void 0 : r.trim(),
          description: ((O = s.description) == null ? void 0 : O.trim()) || null,
          lifecycleId: s.lifecycleId || null,
          numberingScheme: s.numberingScheme || "ALPHA_NUMERIC",
          versionPolicy: s.versionPolicy || "ITERATE",
          color: s.color || null,
          icon: s.icon || null,
          parentNodeTypeId: s.parentNodeTypeId || null
        }), await N();
      else if (U === "edit-identity")
        await f.updateNodeTypeIdentity(a, j.nodeTypeId, {
          logicalIdLabel: s.logicalIdLabel || "Identifier",
          logicalIdPattern: ((B = s.logicalIdPattern) == null ? void 0 : B.trim()) || null
        }), await N(), p(null);
      else if (U === "edit-appearance")
        await f.updateNodeTypeAppearance(a, j.nodeTypeId, s.color || null, s.icon || null), await N(), p(null);
      else if (U === "edit-lifecycle")
        await f.updateNodeTypeLifecycle(a, j.nodeTypeId, s.lifecycleId || null), await N(), p(null);
      else if (U === "edit-versioning")
        await Promise.all([
          f.updateNodeTypeNumberingScheme(a, j.nodeTypeId, s.numberingScheme || "ALPHA_NUMERIC"),
          f.updateNodeTypeVersionPolicy(a, j.nodeTypeId, s.versionPolicy || "ITERATE")
        ]), await N(), p(null);
      else if (U === "create-attr") {
        await f.createAttribute(a, j.nodeTypeId, {
          code: Se((K = s.name) == null ? void 0 : K.trim()),
          name: (ne = s.name) == null ? void 0 : ne.trim(),
          label: (b = s.label) == null ? void 0 : b.trim(),
          dataType: s.dataType || "STRING",
          widgetType: s.widgetType || "TEXT",
          required: !!s.required,
          asName: !!s.asName,
          enumDefinitionId: s.dataType === "ENUM" && s.enumDefinitionId || null,
          displaySection: ((z = s.displaySection) == null ? void 0 : z.trim()) || null,
          displayOrder: s.displayOrder !== "" ? Number(s.displayOrder) : 0,
          defaultValue: ((Q = s.defaultValue) == null ? void 0 : Q.trim()) || null,
          namingRegex: ((Ee = s.namingRegex) == null ? void 0 : Ee.trim()) || null,
          allowedValues: s.dataType !== "ENUM" && ((ge = s.allowedValues) == null ? void 0 : ge.trim()) || null,
          tooltip: ((Ne = s.tooltip) == null ? void 0 : Ne.trim()) || null
        });
        const w = await f.getNodeTypeAttributes(a, j.nodeTypeId);
        P((D) => ({ ...D, [j.nodeTypeId]: Array.isArray(w) ? w : [] }));
      } else if (U === "edit-attr") {
        await f.updateAttribute(a, j.nodeTypeId, j.attrId, {
          label: (de = s.label) == null ? void 0 : de.trim(),
          dataType: s.dataType || "STRING",
          widgetType: s.widgetType || "TEXT",
          required: !!s.required,
          asName: !!s.asName,
          enumDefinitionId: s.dataType === "ENUM" && s.enumDefinitionId || null,
          displaySection: ((pe = s.displaySection) == null ? void 0 : pe.trim()) || null,
          displayOrder: s.displayOrder !== "" ? Number(s.displayOrder) : 0,
          defaultValue: ((Te = s.defaultValue) == null ? void 0 : Te.trim()) || null,
          namingRegex: ((ke = s.namingRegex) == null ? void 0 : ke.trim()) || null,
          allowedValues: s.dataType !== "ENUM" && ((_e = s.allowedValues) == null ? void 0 : _e.trim()) || null,
          tooltip: ((k = s.tooltip) == null ? void 0 : k.trim()) || null
        });
        const w = await f.getNodeTypeAttributes(a, j.nodeTypeId);
        P((D) => ({ ...D, [j.nodeTypeId]: Array.isArray(w) ? w : [] }));
      } else if (U === "create-link") {
        const w = s.targetSourceId || "SELF", D = w === "SELF" ? s.targetNodeTypeId || null : s.targetType || null;
        await f.createLinkType(a, {
          code: (o = s.code) == null ? void 0 : o.trim(),
          name: (q = s.name) == null ? void 0 : q.trim(),
          sourceNodeTypeId: j.nodeTypeId,
          targetSourceId: w,
          targetType: D,
          linkPolicy: s.linkPolicy || "VERSION_TO_MASTER",
          minCardinality: Number(s.minCardinality) || 0,
          maxCardinality: s.maxCardinality !== "" ? Number(s.maxCardinality) : null,
          color: s.color || null
        });
        const X = await f.getNodeTypeLinkTypes(a, j.nodeTypeId);
        M((ee) => ({ ...ee, [j.nodeTypeId]: Array.isArray(X) ? X : [] }));
      } else if (U === "edit-link") {
        const w = s.targetSourceId || "SELF", D = w === "SELF" ? s.targetNodeTypeId || null : s.targetType || null;
        await f.updateLinkType(a, j.linkTypeId, {
          name: (ie = s.name) == null ? void 0 : ie.trim(),
          description: ((le = s.description) == null ? void 0 : le.trim()) || null,
          linkPolicy: s.linkPolicy || "VERSION_TO_MASTER",
          minCardinality: Number(s.minCardinality) || 0,
          maxCardinality: s.maxCardinality !== "" && s.maxCardinality != null ? Number(s.maxCardinality) : null,
          color: s.color || null,
          targetSourceId: w,
          targetNodeTypeId: D
        });
        const X = await f.getNodeTypeLinkTypes(a, j.nodeTypeId);
        M((ee) => ({ ...ee, [j.nodeTypeId]: Array.isArray(X) ? X : [] }));
      } else U === "edit-parent" && (await f.updateNodeTypeParent(a, j.nodeTypeId, s.parentNodeTypeId || null), await N(), p(null));
      V();
    } catch (U) {
      l(U, "error");
    } finally {
      g(!1);
    }
  }
  async function se(i, r) {
    if (i.stopPropagation(), !!window.confirm(`Delete node type "${r.name || r.NAME}"?

This also deletes all its attributes and link types. Cannot be undone.`))
      try {
        await f.deleteNodeType(a, r.id || r.ID), await N(), S === (r.id || r.ID) && p(null);
      } catch (O) {
        l(O, "error");
      }
  }
  async function m(i, r, O) {
    if (i.stopPropagation(), !!window.confirm(`Delete attribute "${O.label || O.LABEL || O.name || O.NAME}"?`))
      try {
        await f.deleteAttribute(a, r, O.id || O.ID);
        const B = await f.getNodeTypeAttributes(a, r);
        P((K) => ({ ...K, [r]: Array.isArray(B) ? B : [] }));
      } catch (B) {
        l(B, "error");
      }
  }
  async function F(i, r, O) {
    if (i.stopPropagation(), !!window.confirm(`Delete link type "${O.name || O.NAME}"?`))
      try {
        await f.deleteLinkType(a, O.id || O.ID);
        const B = await f.getNodeTypeLinkTypes(a, r);
        M((K) => ({ ...K, [r]: Array.isArray(B) ? B : [] }));
      } catch (B) {
        l(B, "error");
      }
  }
  const Z = () => {
    var r, O, B, K, ne, b, z, Q;
    if (!L || d) return !0;
    const { type: i } = L;
    return i === "create-nodetype" ? !((r = s.code) != null && r.trim()) || !((O = s.name) != null && O.trim()) : i === "create-attr" ? !((B = s.name) != null && B.trim()) || !((K = s.label) != null && K.trim()) : i === "edit-attr" ? !((ne = s.label) != null && ne.trim()) : i === "create-link" ? !((b = s.code) != null && b.trim()) || !((z = s.name) != null && z.trim()) || !s.targetNodeTypeId : i === "edit-link" ? !((Q = s.name) != null && Q.trim()) : !1;
  };
  return v ? /* @__PURE__ */ e("div", { className: "settings-loading", children: "Loading…" }) : /* @__PURE__ */ n("div", { className: "settings-list", children: [
    L && /* @__PURE__ */ n(
      Re,
      {
        title: L.type === "create-nodetype" ? "New Node Type" : L.type === "edit-identity" ? "Edit Identifier" : L.type === "edit-parent" ? "Change Parent" : L.type === "create-attr" ? "Add Attribute" : L.type === "edit-attr" ? "Edit Attribute" : L.type === "create-link" ? "Add Link Type" : L.type === "edit-link" ? `Edit Link Type — ${L.ctx.linkName}` : "",
        width: L.type === "edit-link" ? 620 : 480,
        onClose: V,
        onSave: J,
        saving: Z(),
        saveLabel: ["edit-identity", "edit-attr", "edit-link", "edit-parent"].includes(L.type) ? "Update" : "Create",
        children: [
          L.type === "create-nodetype" && /* @__PURE__ */ n(re, { children: [
            /* @__PURE__ */ e(I, { label: "Code *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: s.code || "", onChange: (i) => R((r) => ({ ...r, code: i.target.value, codeEdited: !0 })), placeholder: "e.g. assembly", style: { fontFamily: "var(--mono)" } }) }),
            /* @__PURE__ */ e(I, { label: "Name *", children: /* @__PURE__ */ e("input", { className: "field-input", value: s.name || "", onChange: (i) => R((r) => ({ ...r, name: i.target.value, code: r.codeEdited ? r.code : Se(i.target.value) })), placeholder: "e.g. Assembly" }) }),
            /* @__PURE__ */ e(I, { label: "Description", children: /* @__PURE__ */ e("input", { className: "field-input", value: s.description || "", onChange: (i) => R((r) => ({ ...r, description: i.target.value })), placeholder: "Optional description" }) }),
            /* @__PURE__ */ e(I, { label: "Lifecycle", children: /* @__PURE__ */ n("select", { className: "field-input", value: s.lifecycleId || "", onChange: (i) => R((r) => ({ ...r, lifecycleId: i.target.value })), children: [
              /* @__PURE__ */ e("option", { value: "", children: "None" }),
              c.map((i) => {
                const r = i.id || i.ID;
                return /* @__PURE__ */ e("option", { value: r, children: i.name || i.NAME || r }, r);
              })
            ] }) }),
            /* @__PURE__ */ e(I, { label: "Numbering Scheme", children: /* @__PURE__ */ e("select", { className: "field-input", value: s.numberingScheme || "ALPHA_NUMERIC", onChange: (i) => R((r) => ({ ...r, numberingScheme: i.target.value })), children: Ze.map((i) => /* @__PURE__ */ e("option", { value: i, children: i }, i)) }) }),
            /* @__PURE__ */ e(I, { label: "Version Policy", children: /* @__PURE__ */ e("select", { className: "field-input", value: s.versionPolicy || "ITERATE", onChange: (i) => R((r) => ({ ...r, versionPolicy: i.target.value })), children: et.map((i) => /* @__PURE__ */ e("option", { value: i, children: i }, i)) }) }),
            /* @__PURE__ */ e(I, { label: "Parent node type (optional)", children: /* @__PURE__ */ n("select", { className: "field-input", value: s.parentNodeTypeId || "", onChange: (i) => R((r) => ({ ...r, parentNodeTypeId: i.target.value })), children: [
              /* @__PURE__ */ e("option", { value: "", children: "None" }),
              y.map((i) => {
                const r = i.id || i.ID;
                return /* @__PURE__ */ e("option", { value: r, children: i.name || i.NAME || r }, r);
              })
            ] }) })
          ] }),
          L.type === "edit-identity" && /* @__PURE__ */ n(re, { children: [
            /* @__PURE__ */ e(I, { label: "Label", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: s.logicalIdLabel || "", onChange: (i) => R((r) => ({ ...r, logicalIdLabel: i.target.value })), placeholder: "Identifier" }) }),
            /* @__PURE__ */ e(I, { label: "Validation Pattern (regex)", children: /* @__PURE__ */ e("input", { className: "field-input", value: s.logicalIdPattern || "", onChange: (i) => R((r) => ({ ...r, logicalIdPattern: i.target.value })), placeholder: "e.g. ^[A-Z]{2}-\\d{4}$" }) })
          ] }),
          L.type === "edit-parent" && /* @__PURE__ */ e(re, { children: /* @__PURE__ */ e(I, { label: "Parent node type", children: /* @__PURE__ */ n("select", { className: "field-input", autoFocus: !0, value: s.parentNodeTypeId || "", onChange: (i) => R((r) => ({ ...r, parentNodeTypeId: i.target.value })), children: [
            /* @__PURE__ */ e("option", { value: "", children: "None (root type)" }),
            y.filter((i) => (i.id || i.ID) !== L.ctx.nodeTypeId).map((i) => {
              const r = i.id || i.ID;
              return /* @__PURE__ */ e("option", { value: r, children: i.name || i.NAME || r }, r);
            })
          ] }) }) }),
          L.type === "edit-lifecycle" && /* @__PURE__ */ e(re, { children: /* @__PURE__ */ e(I, { label: "Lifecycle", children: /* @__PURE__ */ n("select", { className: "field-input", autoFocus: !0, value: s.lifecycleId || "", onChange: (i) => R((r) => ({ ...r, lifecycleId: i.target.value })), children: [
            /* @__PURE__ */ e("option", { value: "", children: "None" }),
            c.map((i) => {
              const r = i.id || i.ID;
              return /* @__PURE__ */ e("option", { value: r, children: i.name || i.NAME || r }, r);
            })
          ] }) }) }),
          L.type === "edit-versioning" && /* @__PURE__ */ n(re, { children: [
            /* @__PURE__ */ e(I, { label: "Numbering Scheme", children: /* @__PURE__ */ e("select", { className: "field-input", autoFocus: !0, value: s.numberingScheme || "ALPHA_NUMERIC", onChange: (i) => R((r) => ({ ...r, numberingScheme: i.target.value })), children: Ze.map((i) => /* @__PURE__ */ e("option", { value: i, children: i }, i)) }) }),
            /* @__PURE__ */ e(I, { label: "Version Policy", children: /* @__PURE__ */ e("select", { className: "field-input", value: s.versionPolicy || "ITERATE", onChange: (i) => R((r) => ({ ...r, versionPolicy: i.target.value })), children: et.map((i) => /* @__PURE__ */ e("option", { value: i, children: i }, i)) }) })
          ] }),
          L.type === "edit-appearance" && /* @__PURE__ */ n(re, { children: [
            /* @__PURE__ */ e(Pe, { label: "Color", value: s.color || "", onChange: (i) => R((r) => ({ ...r, color: i })) }),
            /* @__PURE__ */ e(ot, { value: s.icon || "", onChange: (i) => R((r) => ({ ...r, icon: i })) })
          ] }),
          L.type === "create-attr" && /* @__PURE__ */ e(Xe, { form: s, setForm: R, userId: a }),
          L.type === "edit-attr" && /* @__PURE__ */ n(re, { children: [
            /* @__PURE__ */ e(Xe, { form: s, setForm: R, autoFocusName: !1, userId: a }),
            /* @__PURE__ */ e(Ye, { label: "Validation" }),
            /* @__PURE__ */ e(
              Tt,
              {
                userId: a,
                nodeTypeId: L.ctx.nodeTypeId,
                attrDefId: L.ctx.attrId,
                lifecycleId: L.ctx.lifecycleId,
                canWrite: t,
                toast: l
              }
            )
          ] }),
          L.type === "create-link" && /* @__PURE__ */ n(re, { children: [
            /* @__PURE__ */ e(I, { label: "Code *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: s.code || "", onChange: (i) => R((r) => ({ ...r, code: i.target.value, codeEdited: !0 })), placeholder: "e.g. composed-of", style: { fontFamily: "var(--mono)" } }) }),
            /* @__PURE__ */ e(I, { label: "Link Name *", children: /* @__PURE__ */ e("input", { className: "field-input", value: s.name || "", onChange: (i) => R((r) => ({ ...r, name: i.target.value, code: r.codeEdited ? r.code : Se(i.target.value) })), placeholder: "e.g. composed_of" }) }),
            /* @__PURE__ */ e(I, { label: "Target Source", children: /* @__PURE__ */ n("select", { className: "field-input", value: s.targetSourceId || "SELF", onChange: (i) => R((r) => ({ ...r, targetSourceId: i.target.value, targetNodeTypeId: "", targetType: "" })), children: [
              /* @__PURE__ */ e("option", { value: "SELF", children: "Self (PSM)" }),
              H.filter((i) => (i.id || i.ID) !== "SELF").map((i) => {
                const r = i.id || i.ID;
                return /* @__PURE__ */ e("option", { value: r, children: i.name || i.NAME || r }, r);
              })
            ] }) }),
            !s.targetSourceId || s.targetSourceId === "SELF" ? /* @__PURE__ */ e(I, { label: "Target Node Type", children: /* @__PURE__ */ n("select", { className: "field-input", value: s.targetNodeTypeId || "", onChange: (i) => R((r) => ({ ...r, targetNodeTypeId: i.target.value })), children: [
              /* @__PURE__ */ e("option", { value: "", children: "Any" }),
              y.map((i) => {
                const r = i.id || i.ID;
                return /* @__PURE__ */ e("option", { value: r, children: i.name || i.NAME || r }, r);
              })
            ] }) }) : /* @__PURE__ */ e(I, { label: "Target Type", children: /* @__PURE__ */ e("input", { className: "field-input", value: s.targetType || "", onChange: (i) => R((r) => ({ ...r, targetType: i.target.value })), placeholder: "Type name in source" }) }),
            /* @__PURE__ */ e(I, { label: "Link Policy", children: /* @__PURE__ */ e("select", { className: "field-input", value: s.linkPolicy || "VERSION_TO_MASTER", onChange: (i) => R((r) => ({ ...r, linkPolicy: i.target.value })), children: Je.map((i) => /* @__PURE__ */ e("option", { value: i, children: i }, i)) }) }),
            /* @__PURE__ */ n("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
              /* @__PURE__ */ e(I, { label: "Min Cardinality", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: s.minCardinality ?? "0", onChange: (i) => R((r) => ({ ...r, minCardinality: i.target.value })) }) }),
              /* @__PURE__ */ e(I, { label: "Max (blank = unlimited)", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: s.maxCardinality ?? "", onChange: (i) => R((r) => ({ ...r, maxCardinality: i.target.value })), placeholder: "∞" }) })
            ] }),
            /* @__PURE__ */ e(Pe, { label: "Color", value: s.color || "", onChange: (i) => R((r) => ({ ...r, color: i })) })
          ] }),
          L.type === "edit-link" && /* @__PURE__ */ n(re, { children: [
            /* @__PURE__ */ e(I, { label: "Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: s.name || "", onChange: (i) => R((r) => ({ ...r, name: i.target.value })) }) }),
            /* @__PURE__ */ e(I, { label: "Description", children: /* @__PURE__ */ e("input", { className: "field-input", value: s.description || "", onChange: (i) => R((r) => ({ ...r, description: i.target.value })), placeholder: "Optional description" }) }),
            /* @__PURE__ */ e(I, { label: "Target Source", children: /* @__PURE__ */ n("select", { className: "field-input", value: s.targetSourceId || "SELF", onChange: (i) => R((r) => ({ ...r, targetSourceId: i.target.value, targetNodeTypeId: "", targetType: "" })), children: [
              /* @__PURE__ */ e("option", { value: "SELF", children: "Self (PSM)" }),
              H.filter((i) => (i.id || i.ID) !== "SELF").map((i) => {
                const r = i.id || i.ID;
                return /* @__PURE__ */ e("option", { value: r, children: i.name || i.NAME || r }, r);
              })
            ] }) }),
            !s.targetSourceId || s.targetSourceId === "SELF" ? /* @__PURE__ */ e(I, { label: "Target Node Type", children: /* @__PURE__ */ n("select", { className: "field-input", value: s.targetNodeTypeId || "", onChange: (i) => R((r) => ({ ...r, targetNodeTypeId: i.target.value })), children: [
              /* @__PURE__ */ e("option", { value: "", children: "Any" }),
              y.map((i) => {
                const r = i.id || i.ID;
                return /* @__PURE__ */ e("option", { value: r, children: i.name || i.NAME || r }, r);
              })
            ] }) }) : /* @__PURE__ */ e(I, { label: "Target Type", children: /* @__PURE__ */ e("input", { className: "field-input", value: s.targetType || "", onChange: (i) => R((r) => ({ ...r, targetType: i.target.value })), placeholder: "Type name in source" }) }),
            /* @__PURE__ */ e(I, { label: "Link Policy", children: /* @__PURE__ */ e("select", { className: "field-input", value: s.linkPolicy || "VERSION_TO_MASTER", onChange: (i) => R((r) => ({ ...r, linkPolicy: i.target.value })), children: Je.map((i) => /* @__PURE__ */ e("option", { value: i, children: i }, i)) }) }),
            /* @__PURE__ */ n("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
              /* @__PURE__ */ e(I, { label: "Min Cardinality", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: s.minCardinality ?? "0", onChange: (i) => R((r) => ({ ...r, minCardinality: i.target.value })) }) }),
              /* @__PURE__ */ e(I, { label: "Max (blank = unlimited)", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: s.maxCardinality ?? "", onChange: (i) => R((r) => ({ ...r, maxCardinality: i.target.value })), placeholder: "∞" }) })
            ] }),
            /* @__PURE__ */ e(Pe, { label: "Color", value: s.color || "", onChange: (i) => R((r) => ({ ...r, color: i })) }),
            /* @__PURE__ */ e(Ye, { label: "Attributes" }),
            /* @__PURE__ */ e(Ct, { userId: a, linkTypeId: L.ctx.linkTypeId, canWrite: t, toast: l }),
            /* @__PURE__ */ e(Ye, { label: "Cascade Rules" }),
            (() => {
              const i = y.find((O) => (O.id || O.ID) === L.ctx.nodeTypeId), r = y.find((O) => (O.id || O.ID) === L.ctx.targetNodeTypeId);
              return /* @__PURE__ */ e(
                St,
                {
                  userId: a,
                  linkTypeId: L.ctx.linkTypeId,
                  sourceLifecycleId: (i == null ? void 0 : i.lifecycle_id) || (i == null ? void 0 : i.LIFECYCLE_ID),
                  targetLifecycleId: (r == null ? void 0 : r.lifecycle_id) || (r == null ? void 0 : r.LIFECYCLE_ID),
                  canWrite: t,
                  toast: l
                }
              );
            })()
          ] })
        ]
      }
    ),
    /* @__PURE__ */ e("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 8 }, children: t && /* @__PURE__ */ n(
      "button",
      {
        className: "btn btn-sm",
        style: { display: "flex", alignItems: "center", gap: 5 },
        onClick: () => h("create-nodetype", {}, { lifecycleId: c[0] ? c[0].id || c[0].ID : "", numberingScheme: "ALPHA_NUMERIC", versionPolicy: "ITERATE" }),
        children: [
          /* @__PURE__ */ e(be, { size: 11, strokeWidth: 2.5 }),
          "New node type"
        ]
      }
    ) }),
    y.map((i) => {
      var k;
      const r = i.id || i.ID, O = i.name || i.NAME || r, B = S === r, K = C[r] || [], ne = G[r] || [], b = i.logical_id_label || i.LOGICAL_ID_LABEL || "Identifier", z = i.logical_id_pattern || i.LOGICAL_ID_PATTERN || "", Q = i.numbering_scheme || i.NUMBERING_SCHEME || "ALPHA_NUMERIC", Ee = i.version_policy || i.VERSION_POLICY || "ITERATE", ge = i.lifecycle_id || i.LIFECYCLE_ID || null, Ne = ((k = c.find((o) => (o.id || o.ID) === ge)) == null ? void 0 : k.name) || ge || "—", de = i.color || i.COLOR || null, pe = i.icon || i.ICON || null, Te = pe ? Ve[pe] : null, ke = i.parent_node_type_id || i.PARENT_NODE_TYPE_ID || null, _e = ke ? u[ke] || ke : null;
      return /* @__PURE__ */ n("div", { className: "settings-card", children: [
        /* @__PURE__ */ n("div", { className: "settings-card-hd", onClick: () => A(i), style: { display: "flex", alignItems: "center" }, children: [
          /* @__PURE__ */ e("span", { className: "settings-card-chevron", children: B ? /* @__PURE__ */ e(Oe, { size: 13, strokeWidth: 2, color: "var(--muted)" }) : /* @__PURE__ */ e(ze, { size: 13, strokeWidth: 2, color: "var(--muted)" }) }),
          Te ? /* @__PURE__ */ e(Te, { size: 14, strokeWidth: 2, color: de || "var(--muted)", style: { marginRight: 4, flexShrink: 0 } }) : de ? /* @__PURE__ */ e("span", { style: { width: 10, height: 10, borderRadius: "50%", background: de, flexShrink: 0, marginRight: 4 } }) : null,
          /* @__PURE__ */ e("span", { className: "settings-card-name", children: O }),
          /* @__PURE__ */ e("span", { className: "settings-card-id", children: r }),
          t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete node type", style: { marginLeft: "auto" }, onClick: (o) => se(o, i), children: /* @__PURE__ */ e(ce, { size: 12, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
        ] }),
        B && /* @__PURE__ */ n("div", { className: "settings-card-body", children: [
          /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Inheritance" }),
            t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Change parent", onClick: () => h("edit-parent", { nodeTypeId: r }, { parentNodeTypeId: ke || "" }), children: /* @__PURE__ */ e(ye, { size: 12, strokeWidth: 2, color: "var(--accent)" }) })
          ] }),
          /* @__PURE__ */ e("table", { className: "settings-table", children: /* @__PURE__ */ e("tbody", { children: /* @__PURE__ */ n("tr", { children: [
            /* @__PURE__ */ e("td", { style: { color: "var(--muted)", width: 110 }, children: "Inherits from" }),
            /* @__PURE__ */ e("td", { children: _e ? /* @__PURE__ */ e("span", { className: "settings-badge", children: _e }) : /* @__PURE__ */ e("span", { style: { color: "var(--muted2)" }, children: "—" }) })
          ] }) }) }),
          /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Identifier" }),
            t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit identifier", onClick: () => h("edit-identity", { nodeTypeId: r }, { logicalIdLabel: b, logicalIdPattern: z }), children: /* @__PURE__ */ e(ye, { size: 12, strokeWidth: 2, color: "var(--accent)" }) })
          ] }),
          /* @__PURE__ */ e("table", { className: "settings-table", children: /* @__PURE__ */ n("tbody", { children: [
            /* @__PURE__ */ n("tr", { children: [
              /* @__PURE__ */ e("td", { style: { color: "var(--muted)", width: 110 }, children: "Label" }),
              /* @__PURE__ */ e("td", { className: "settings-td-mono", children: b })
            ] }),
            /* @__PURE__ */ n("tr", { children: [
              /* @__PURE__ */ e("td", { style: { color: "var(--muted)" }, children: "Pattern" }),
              /* @__PURE__ */ e("td", { className: "settings-td-mono", children: z || "—" })
            ] })
          ] }) }),
          /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Lifecycle" }),
            t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Change lifecycle", onClick: () => h("edit-lifecycle", { nodeTypeId: r }, { lifecycleId: ge || "" }), children: /* @__PURE__ */ e(ye, { size: 12, strokeWidth: 2, color: "var(--accent)" }) })
          ] }),
          /* @__PURE__ */ e("table", { className: "settings-table", children: /* @__PURE__ */ e("tbody", { children: /* @__PURE__ */ n("tr", { children: [
            /* @__PURE__ */ e("td", { style: { color: "var(--muted)", width: 110 }, children: "Lifecycle" }),
            /* @__PURE__ */ e("td", { children: ge ? /* @__PURE__ */ e("span", { className: "settings-badge", children: Ne }) : /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "—" }) })
          ] }) }) }),
          /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Versioning" }),
            t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit versioning", onClick: () => h("edit-versioning", { nodeTypeId: r }, { numberingScheme: Q, versionPolicy: Ee }), children: /* @__PURE__ */ e(ye, { size: 12, strokeWidth: 2, color: "var(--accent)" }) })
          ] }),
          /* @__PURE__ */ e("table", { className: "settings-table", children: /* @__PURE__ */ n("tbody", { children: [
            /* @__PURE__ */ n("tr", { children: [
              /* @__PURE__ */ e("td", { style: { color: "var(--muted)", width: 110 }, children: "Numbering" }),
              /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "settings-badge", children: Q }) })
            ] }),
            /* @__PURE__ */ n("tr", { children: [
              /* @__PURE__ */ e("td", { style: { color: "var(--muted)" }, children: "Policy" }),
              /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "settings-badge", children: Ee }) })
            ] })
          ] }) }),
          /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Appearance" }),
            t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit appearance", onClick: () => h("edit-appearance", { nodeTypeId: r }, { color: de || "", icon: pe || "" }), children: /* @__PURE__ */ e(ye, { size: 12, strokeWidth: 2, color: "var(--accent)" }) })
          ] }),
          /* @__PURE__ */ e("table", { className: "settings-table", children: /* @__PURE__ */ n("tbody", { children: [
            /* @__PURE__ */ n("tr", { children: [
              /* @__PURE__ */ e("td", { style: { color: "var(--muted)", width: 110 }, children: "Color" }),
              /* @__PURE__ */ e("td", { children: de ? /* @__PURE__ */ n("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
                /* @__PURE__ */ e("span", { style: { width: 12, height: 12, borderRadius: 3, background: de, display: "inline-block" } }),
                /* @__PURE__ */ e("span", { className: "settings-td-mono", style: { fontSize: 10 }, children: de })
              ] }) : /* @__PURE__ */ e("span", { style: { color: "var(--muted2)" }, children: "—" }) })
            ] }),
            /* @__PURE__ */ n("tr", { children: [
              /* @__PURE__ */ e("td", { style: { color: "var(--muted)" }, children: "Icon" }),
              /* @__PURE__ */ e("td", { children: Te ? /* @__PURE__ */ n("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
                /* @__PURE__ */ e(Te, { size: 13, strokeWidth: 2, color: de || "var(--muted)" }),
                /* @__PURE__ */ e("span", { style: { fontSize: 10, color: "var(--muted)" }, children: pe })
              ] }) : /* @__PURE__ */ e("span", { style: { color: "var(--muted2)" }, children: "—" }) })
            ] })
          ] }) }),
          /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Attributes" }),
            t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Add attribute", onClick: () => h("create-attr", { nodeTypeId: r }, { dataType: "STRING", widgetType: "TEXT", required: !1, asName: !1 }), children: /* @__PURE__ */ e(be, { size: 12, strokeWidth: 2.5, color: "var(--accent)" }) })
          ] }),
          K.length === 0 ? /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No attributes defined" }) : /* @__PURE__ */ n("table", { className: "settings-table", children: [
            /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
              /* @__PURE__ */ e("th", { children: "Name" }),
              /* @__PURE__ */ e("th", { children: "Label" }),
              /* @__PURE__ */ e("th", { children: "Type" }),
              /* @__PURE__ */ e("th", { children: "As Name" }),
              /* @__PURE__ */ e("th", { children: "Section" }),
              /* @__PURE__ */ e("th", {})
            ] }) }),
            /* @__PURE__ */ e("tbody", { children: [...K].sort((o, q) => (o.display_order || o.DISPLAY_ORDER || 0) - (q.display_order || q.DISPLAY_ORDER || 0)).map((o) => {
              const q = o.id || o.ID, ie = o.name || o.NAME, le = o.label || o.LABEL || ie, U = o.widget_type || o.WIDGET_TYPE || "TEXT", j = !!(o.required || o.REQUIRED), w = !!(o.as_name || o.AS_NAME), D = o.display_section || o.DISPLAY_SECTION || "—", X = !!(o.inherited || o.INHERITED), ee = o.inherited_from || o.INHERITED_FROM || null;
              return /* @__PURE__ */ n("tr", { children: [
                /* @__PURE__ */ e("td", { className: "settings-td-mono", children: /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: 5 }, children: [
                  ie,
                  X && /* @__PURE__ */ n("span", { style: { fontSize: 9, background: "var(--accent-dim,rgba(99,179,237,.15))", color: "var(--accent)", borderRadius: 3, padding: "1px 4px", whiteSpace: "nowrap" }, children: [
                    "from ",
                    ee || "parent"
                  ] })
                ] }) }),
                /* @__PURE__ */ e("td", { children: le }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "settings-badge", children: U }) }),
                /* @__PURE__ */ e("td", { style: { color: w ? "var(--accent)" : "var(--muted)", fontWeight: w ? 600 : 400 }, children: w ? "★" : "—" }),
                /* @__PURE__ */ e("td", { style: { color: "var(--muted)" }, children: D }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ n("div", { style: { display: "flex", gap: 4 }, children: [
                  t && !X && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit", onClick: () => h("edit-attr", { nodeTypeId: r, attrId: q, lifecycleId: ge }, {
                    name: ie,
                    label: le,
                    dataType: o.data_type || o.DATA_TYPE || "STRING",
                    widgetType: o.widget_type || o.WIDGET_TYPE || "TEXT",
                    required: j,
                    asName: w,
                    enumDefinitionId: o.enum_definition_id || o.ENUM_DEFINITION_ID || null,
                    displaySection: o.display_section || o.DISPLAY_SECTION || "",
                    displayOrder: o.display_order ?? o.DISPLAY_ORDER ?? "",
                    defaultValue: o.default_value || o.DEFAULT_VALUE || "",
                    namingRegex: o.naming_regex || o.NAMING_REGEX || "",
                    allowedValues: o.allowed_values || o.ALLOWED_VALUES || "",
                    tooltip: o.tooltip || o.TOOLTIP || ""
                  }), children: /* @__PURE__ */ e(ye, { size: 11, strokeWidth: 2, color: "var(--accent)" }) }),
                  t && !X && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: (fe) => m(fe, r, o), children: /* @__PURE__ */ e(ce, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
                ] }) })
              ] }, q);
            }) })
          ] }),
          /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Outgoing Links" }),
            t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Add link type", onClick: () => h("create-link", { nodeTypeId: r }, { linkPolicy: "VERSION_TO_MASTER", minCardinality: "0", targetSourceId: "SELF", targetNodeTypeId: y[0] ? y[0].id || y[0].ID : "" }), children: /* @__PURE__ */ e(be, { size: 12, strokeWidth: 2.5, color: "var(--accent)" }) })
          ] }),
          ne.length === 0 ? /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No outgoing links defined" }) : /* @__PURE__ */ n("table", { className: "settings-table", children: [
            /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
              /* @__PURE__ */ e("th", {}),
              /* @__PURE__ */ e("th", { children: "Name" }),
              /* @__PURE__ */ e("th", { children: "Target" }),
              /* @__PURE__ */ e("th", { children: "Policy" }),
              /* @__PURE__ */ e("th", { children: "Cardinality" }),
              /* @__PURE__ */ e("th", {})
            ] }) }),
            /* @__PURE__ */ e("tbody", { children: ne.map((o) => {
              const q = o.id || o.ID, ie = o.name || o.NAME || q, le = o.target_source_id || o.TARGET_SOURCE_ID || "SELF", U = o.target_type || o.TARGET_TYPE, j = U ? le === "SELF" ? u[U] || U : `${le}:${U}` : "Any", w = o.link_policy || o.LINK_POLICY || "—", D = o.min_cardinality ?? o.MIN_CARDINALITY ?? 0, X = o.max_cardinality ?? o.MAX_CARDINALITY, ee = X == null ? `${D}..*` : `${D}..${X}`, fe = o.color || o.COLOR || null, ue = !!(o.inherited || o.INHERITED), me = o.inherited_from || o.INHERITED_FROM || null;
              return /* @__PURE__ */ n("tr", { style: ue ? { opacity: 0.75 } : void 0, children: [
                /* @__PURE__ */ e("td", { style: { width: 18 }, children: /* @__PURE__ */ e("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: fe || "var(--border)" } }) }),
                /* @__PURE__ */ e("td", { className: "settings-td-mono", children: /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: 5 }, children: [
                  ie,
                  ue && /* @__PURE__ */ n("span", { style: { fontSize: 9, background: "var(--accent-dim,rgba(99,179,237,.15))", color: "var(--accent)", borderRadius: 3, padding: "1px 4px", whiteSpace: "nowrap" }, children: [
                    "from ",
                    me || "parent"
                  ] })
                ] }) }),
                /* @__PURE__ */ e("td", { children: j }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "settings-badge", children: w }) }),
                /* @__PURE__ */ e("td", { style: { color: "var(--muted)" }, children: ee }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ n("div", { style: { display: "flex", gap: 4 }, children: [
                  t && !ue && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit link type", onClick: () => h("edit-link", { nodeTypeId: r, linkTypeId: q, linkName: ie, targetNodeTypeId: U }, {
                    name: ie,
                    description: o.description || o.DESCRIPTION || "",
                    linkPolicy: w,
                    minCardinality: String(D),
                    maxCardinality: X != null ? String(X) : "",
                    color: fe || "",
                    targetSourceId: le,
                    targetNodeTypeId: U || "",
                    targetType: le !== "SELF" && U || ""
                  }), children: /* @__PURE__ */ e(ye, { size: 11, strokeWidth: 2, color: "var(--accent)" }) }),
                  t && !ue && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete link type", onClick: (Ie) => F(Ie, r, o), children: /* @__PURE__ */ e(ce, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
                ] }) })
              ] }, q);
            }) })
          ] })
        ] })
      ] }, r);
    })
  ] });
}
function xt({ userId: a, canWrite: t, toast: l }) {
  const [y, T] = _([]), [S, p] = _(null), [C, P] = _({}), [G, M] = _(!0), [v, W] = _(null), [c, x] = _({}), [H, ae] = _(!1);
  function L() {
    return f.getDomains(a).then((u) => T(Array.isArray(u) ? u : []));
  }
  Ae(() => {
    L().finally(() => M(!1));
  }, [a]), qe((u) => {
    u.event === "METAMODEL_CHANGED" && L();
  });
  async function te(u) {
    const A = u.id;
    if (S === A) {
      p(null);
      return;
    }
    if (p(A), !C[A])
      try {
        const h = await f.getDomainAttributes(a, A);
        P((V) => ({ ...V, [A]: Array.isArray(h) ? h : [] }));
      } catch {
        P((h) => ({ ...h, [A]: [] }));
      }
  }
  function s(u, A = {}, h = {}) {
    x(h), W({ type: u, ctx: A });
  }
  function R() {
    W(null), x({});
  }
  async function d() {
    var u, A, h, V, J, se, m, F, Z, i, r, O, B, K, ne, b, z, Q, Ee, ge;
    ae(!0);
    try {
      const { type: Ne, ctx: de } = v;
      if (Ne === "create-domain")
        await f.createDomain(a, { code: (u = c.code) == null ? void 0 : u.trim(), name: (A = c.name) == null ? void 0 : A.trim(), description: ((h = c.description) == null ? void 0 : h.trim()) || null, color: c.color || null, icon: c.icon || null }), await L();
      else if (Ne === "edit-domain")
        await f.updateDomain(a, de.domainId, { name: (V = c.name) == null ? void 0 : V.trim(), description: ((J = c.description) == null ? void 0 : J.trim()) || null, color: c.color || null, icon: c.icon || null }), await L();
      else if (Ne === "create-attr") {
        await f.createDomainAttribute(a, de.domainId, {
          code: Se((se = c.name) == null ? void 0 : se.trim()),
          name: (m = c.name) == null ? void 0 : m.trim(),
          label: (F = c.label) == null ? void 0 : F.trim(),
          dataType: c.dataType || "STRING",
          widgetType: c.widgetType || "TEXT",
          required: !!c.required,
          enumDefinitionId: c.dataType === "ENUM" && c.enumDefinitionId || null,
          displaySection: ((Z = c.displaySection) == null ? void 0 : Z.trim()) || null,
          displayOrder: c.displayOrder !== "" ? Number(c.displayOrder) : 0,
          defaultValue: ((i = c.defaultValue) == null ? void 0 : i.trim()) || null,
          namingRegex: ((r = c.namingRegex) == null ? void 0 : r.trim()) || null,
          allowedValues: c.dataType !== "ENUM" && ((O = c.allowedValues) == null ? void 0 : O.trim()) || null,
          tooltip: ((B = c.tooltip) == null ? void 0 : B.trim()) || null
        });
        const pe = await f.getDomainAttributes(a, de.domainId);
        P((Te) => ({ ...Te, [de.domainId]: Array.isArray(pe) ? pe : [] }));
      } else if (Ne === "edit-attr") {
        await f.updateDomainAttribute(a, de.domainId, de.attrId, {
          name: (K = c.name) == null ? void 0 : K.trim(),
          label: (ne = c.label) == null ? void 0 : ne.trim(),
          dataType: c.dataType || "STRING",
          widgetType: c.widgetType || "TEXT",
          required: !!c.required,
          enumDefinitionId: c.dataType === "ENUM" && c.enumDefinitionId || null,
          displaySection: ((b = c.displaySection) == null ? void 0 : b.trim()) || null,
          displayOrder: c.displayOrder !== "" ? Number(c.displayOrder) : 0,
          defaultValue: ((z = c.defaultValue) == null ? void 0 : z.trim()) || null,
          namingRegex: ((Q = c.namingRegex) == null ? void 0 : Q.trim()) || null,
          allowedValues: c.dataType !== "ENUM" && ((Ee = c.allowedValues) == null ? void 0 : Ee.trim()) || null,
          tooltip: ((ge = c.tooltip) == null ? void 0 : ge.trim()) || null
        });
        const pe = await f.getDomainAttributes(a, de.domainId);
        P((Te) => ({ ...Te, [de.domainId]: Array.isArray(pe) ? pe : [] }));
      }
      R();
    } catch (Ne) {
      l(Ne, "error");
    } finally {
      ae(!1);
    }
  }
  async function g(u, A) {
    if (u.stopPropagation(), !!window.confirm(`Delete domain "${A.name}"?

This also deletes all its attributes. Cannot be undone.`))
      try {
        await f.deleteDomain(a, A.id), await L(), S === A.id && p(null);
      } catch (h) {
        l(h, "error");
      }
  }
  async function N(u, A, h) {
    if (u.stopPropagation(), !!window.confirm(`Delete attribute "${h.label || h.name}"?`))
      try {
        await f.deleteDomainAttribute(a, A, h.id);
        const V = await f.getDomainAttributes(a, A);
        P((J) => ({ ...J, [A]: Array.isArray(V) ? V : [] }));
      } catch (V) {
        l(V, "error");
      }
  }
  return G ? /* @__PURE__ */ e("div", { className: "settings-loading", children: "Loading…" }) : /* @__PURE__ */ n("div", { className: "settings-list", children: [
    v && /* @__PURE__ */ n(
      Re,
      {
        title: v.type === "create-domain" ? "New Domain" : v.type === "edit-domain" ? "Edit Domain" : v.type === "create-attr" ? "Add Attribute" : "Edit Attribute",
        width: 480,
        onClose: R,
        onSave: d,
        saving: H,
        saveLabel: ["edit-domain", "edit-attr"].includes(v.type) ? "Update" : "Create",
        children: [
          (v.type === "create-domain" || v.type === "edit-domain") && /* @__PURE__ */ n(re, { children: [
            v.type === "create-domain" && /* @__PURE__ */ e(I, { label: "Code *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: c.code || "", onChange: (u) => x((A) => ({ ...A, code: u.target.value, codeEdited: !0 })), placeholder: "e.g. electrical", style: { fontFamily: "var(--mono)" } }) }),
            /* @__PURE__ */ e(I, { label: "Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: v.type !== "create-domain", value: c.name || "", onChange: (u) => x((A) => ({ ...A, name: u.target.value, ...v.type === "create-domain" && !A.codeEdited ? { code: Se(u.target.value) } : {} })), placeholder: "e.g. Electrical" }) }),
            /* @__PURE__ */ e(I, { label: "Description", children: /* @__PURE__ */ e("input", { className: "field-input", value: c.description || "", onChange: (u) => x((A) => ({ ...A, description: u.target.value })), placeholder: "Optional description" }) }),
            /* @__PURE__ */ e(Pe, { label: "Color", value: c.color || "", onChange: (u) => x((A) => ({ ...A, color: u })) })
          ] }),
          v.type === "create-attr" && /* @__PURE__ */ e(Xe, { form: c, setForm: x, hideAsName: !0, userId: a }),
          v.type === "edit-attr" && /* @__PURE__ */ n(re, { children: [
            /* @__PURE__ */ e(I, { label: "Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: c.name || "", onChange: (u) => x((A) => ({ ...A, name: u.target.value })) }) }),
            /* @__PURE__ */ e(I, { label: "Label (display) *", children: /* @__PURE__ */ e("input", { className: "field-input", value: c.label || "", onChange: (u) => x((A) => ({ ...A, label: u.target.value })) }) }),
            /* @__PURE__ */ n("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
              /* @__PURE__ */ e(I, { label: "Data Type", children: /* @__PURE__ */ e("select", { className: "field-input", value: c.dataType || "STRING", onChange: (u) => x((A) => ({ ...A, dataType: u.target.value })), children: Ge.map((u) => /* @__PURE__ */ e("option", { value: u, children: u }, u)) }) }),
              /* @__PURE__ */ e(I, { label: "Widget", children: /* @__PURE__ */ e("select", { className: "field-input", value: c.widgetType || "TEXT", onChange: (u) => x((A) => ({ ...A, widgetType: u.target.value })), children: Be.map((u) => /* @__PURE__ */ e("option", { value: u, children: u }, u)) }) })
            ] }),
            c.dataType === "ENUM" && /* @__PURE__ */ e(Ue, { userId: a, enumDefinitionId: c.enumDefinitionId || null, onChange: (u) => x((A) => ({ ...A, enumDefinitionId: u })) }),
            /* @__PURE__ */ n("div", { style: { display: "grid", gridTemplateColumns: "1fr 80px", gap: 12 }, children: [
              /* @__PURE__ */ e(I, { label: "Section", children: /* @__PURE__ */ e("input", { className: "field-input", value: c.displaySection || "", onChange: (u) => x((A) => ({ ...A, displaySection: u.target.value })) }) }),
              /* @__PURE__ */ e(I, { label: "Order", children: /* @__PURE__ */ e("input", { className: "field-input", type: "number", min: "0", value: c.displayOrder ?? "", onChange: (u) => x((A) => ({ ...A, displayOrder: u.target.value })) }) })
            ] }),
            /* @__PURE__ */ n("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13 }, children: [
              /* @__PURE__ */ e("input", { type: "checkbox", checked: !!c.required, onChange: (u) => x((A) => ({ ...A, required: u.target.checked })) }),
              "Required field"
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ e("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 8 }, children: t && /* @__PURE__ */ n("button", { className: "btn btn-sm", style: { display: "flex", alignItems: "center", gap: 5 }, onClick: () => s("create-domain", {}, {}), children: [
      /* @__PURE__ */ e(be, { size: 11, strokeWidth: 2.5 }),
      "New domain"
    ] }) }),
    y.map((u) => {
      const A = u.id, h = u.name || A, V = S === A, J = C[A] || [], se = u.color || null;
      return /* @__PURE__ */ n("div", { className: "settings-card", children: [
        /* @__PURE__ */ n("div", { className: "settings-card-hd", onClick: () => te(u), style: { display: "flex", alignItems: "center" }, children: [
          /* @__PURE__ */ e("span", { className: "settings-card-chevron", children: V ? /* @__PURE__ */ e(Oe, { size: 13, strokeWidth: 2, color: "var(--muted)" }) : /* @__PURE__ */ e(ze, { size: 13, strokeWidth: 2, color: "var(--muted)" }) }),
          se && /* @__PURE__ */ e("span", { style: { width: 10, height: 10, borderRadius: "50%", background: se, flexShrink: 0, marginRight: 4 } }),
          /* @__PURE__ */ e("span", { className: "settings-card-name", children: h }),
          /* @__PURE__ */ e("span", { className: "settings-card-id", children: A }),
          /* @__PURE__ */ n("div", { style: { display: "flex", gap: 4, marginLeft: "auto" }, children: [
            t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit domain", onClick: (m) => {
              m.stopPropagation(), s("edit-domain", { domainId: A }, { name: u.name, description: u.description || "", color: se || "" });
            }, children: /* @__PURE__ */ e(ye, { size: 12, strokeWidth: 2, color: "var(--accent)" }) }),
            t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete domain", onClick: (m) => g(m, u), children: /* @__PURE__ */ e(ce, { size: 12, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
          ] })
        ] }),
        V && /* @__PURE__ */ n("div", { className: "settings-card-body", children: [
          u.description && /* @__PURE__ */ e("div", { style: { fontSize: 11, color: "var(--muted)", marginBottom: 8 }, children: u.description }),
          /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Attributes" }),
            t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Add attribute", onClick: () => s("create-attr", { domainId: A }, { dataType: "STRING", widgetType: "TEXT", required: !1 }), children: /* @__PURE__ */ e(be, { size: 12, strokeWidth: 2.5, color: "var(--accent)" }) })
          ] }),
          J.length === 0 ? /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No attributes defined" }) : /* @__PURE__ */ n("table", { className: "settings-table", children: [
            /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
              /* @__PURE__ */ e("th", { children: "Name" }),
              /* @__PURE__ */ e("th", { children: "Label" }),
              /* @__PURE__ */ e("th", { children: "Type" }),
              /* @__PURE__ */ e("th", { children: "Req" }),
              /* @__PURE__ */ e("th", { children: "Section" }),
              /* @__PURE__ */ e("th", {})
            ] }) }),
            /* @__PURE__ */ e("tbody", { children: [...J].sort((m, F) => (m.display_order || 0) - (F.display_order || 0)).map((m) => /* @__PURE__ */ n("tr", { children: [
              /* @__PURE__ */ e("td", { className: "settings-td-mono", children: m.name }),
              /* @__PURE__ */ e("td", { children: m.label || m.name }),
              /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "settings-badge", children: m.widget_type || "TEXT" }) }),
              /* @__PURE__ */ e("td", { style: { color: m.required ? "var(--success)" : "var(--muted)" }, children: m.required ? "✓" : "—" }),
              /* @__PURE__ */ e("td", { style: { color: "var(--muted)" }, children: m.display_section || "—" }),
              /* @__PURE__ */ e("td", { children: /* @__PURE__ */ n("div", { style: { display: "flex", gap: 4 }, children: [
                t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit", onClick: () => s("edit-attr", { domainId: A, attrId: m.id }, {
                  name: m.name,
                  label: m.label || m.name,
                  dataType: m.data_type || "STRING",
                  widgetType: m.widget_type || "TEXT",
                  required: !!m.required,
                  enumDefinitionId: m.enum_definition_id || null,
                  displaySection: m.display_section || "",
                  displayOrder: m.display_order ?? "",
                  defaultValue: m.default_value || "",
                  namingRegex: m.naming_regex || "",
                  allowedValues: m.allowed_values || "",
                  tooltip: m.tooltip || ""
                }), children: /* @__PURE__ */ e(ye, { size: 11, strokeWidth: 2, color: "var(--accent)" }) }),
                t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: (F) => N(F, A, m), children: /* @__PURE__ */ e(ce, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
              ] }) })
            ] }, m.id)) })
          ] })
        ] })
      ] }, A);
    }),
    y.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No domains defined yet" })
  ] });
}
function wt({ userId: a, canWrite: t, toast: l }) {
  var J, se;
  const [y, T] = _([]), [S, p] = _(null), [C, P] = _({}), [G, M] = _(null), [v, W] = _({}), [c, x] = _(!1), [H, ae] = _(null), [L, te] = _(null), s = $e(
    () => f.getEnums(a).then((m) => T(Array.isArray(m) ? m : [])).catch(() => T([])),
    [a]
  );
  Ae(() => {
    s();
  }, [s]);
  function R(m) {
    f.getEnumValues(a, m).then((F) => P((Z) => ({ ...Z, [m]: Array.isArray(F) ? F.filter(Boolean) : [] }))).catch(() => P((F) => ({ ...F, [m]: [] })));
  }
  function d(m) {
    if (S === m) {
      p(null);
      return;
    }
    p(m), C[m] || R(m);
  }
  async function g() {
    var m, F, Z, i, r;
    x(!0);
    try {
      const { type: O, ctx: B } = G;
      O === "create-enum" ? (await f.createEnum(a, { code: (m = v.code) == null ? void 0 : m.trim(), name: (F = v.name) == null ? void 0 : F.trim(), description: ((Z = v.description) == null ? void 0 : Z.trim()) || null }), await s()) : O === "edit-enum" && (await f.updateEnum(a, B.enumId, { name: (i = v.name) == null ? void 0 : i.trim(), description: ((r = v.description) == null ? void 0 : r.trim()) || null }), await s()), M(null), W({});
    } catch (O) {
      l(O, "error");
    } finally {
      x(!1);
    }
  }
  async function N(m, F) {
    if (m.stopPropagation(), !!window.confirm(`Delete enumeration "${F.name}"?

This also deletes all its values. Cannot be undone.`))
      try {
        await f.deleteEnum(a, F.id), await s(), S === F.id && p(null);
      } catch (Z) {
        l(Z, "error");
      }
  }
  async function u(m) {
    var F, Z;
    if ((F = H == null ? void 0 : H.value) != null && F.trim()) {
      x(!0);
      try {
        await f.addEnumValue(a, m, { value: H.value.trim(), label: ((Z = H.label) == null ? void 0 : Z.trim()) || null }), R(m), ae(null);
      } catch (i) {
        l(i, "error");
      } finally {
        x(!1);
      }
    }
  }
  async function A(m, F) {
    if (window.confirm(`Delete value "${F.value}"?`))
      try {
        await f.deleteEnumValue(a, m, F.id), R(m);
      } catch (Z) {
        l(Z, "error");
      }
  }
  async function h() {
    var m, F;
    if (L) {
      x(!0);
      try {
        await f.updateEnumValue(a, L.enumId, L.id, {
          value: (m = L.value) == null ? void 0 : m.trim(),
          label: ((F = L.label) == null ? void 0 : F.trim()) || null,
          displayOrder: L.displayOrder ?? 0
        }), R(L.enumId), te(null);
      } catch (Z) {
        l(Z, "error");
      } finally {
        x(!1);
      }
    }
  }
  async function V(m, F, Z) {
    const i = C[m];
    if (!i) return;
    const r = F + Z;
    if (r < 0 || r >= i.length) return;
    const O = [...i];
    [O[F], O[r]] = [O[r], O[F]], P((B) => ({ ...B, [m]: O }));
    try {
      await f.reorderEnumValues(a, m, O.map((B) => B.id));
    } catch (B) {
      l(B, "error"), R(m);
    }
  }
  return /* @__PURE__ */ n("div", { className: "settings-section", children: [
    G && /* @__PURE__ */ n(
      Re,
      {
        title: G.type === "create-enum" ? "New Enumeration" : "Edit Enumeration",
        width: 420,
        onClose: () => {
          M(null), W({});
        },
        onSave: g,
        saving: c || !((J = v.name) != null && J.trim()) || G.type === "create-enum" && !((se = v.code) != null && se.trim()),
        saveLabel: G.type === "edit-enum" ? "Update" : "Create",
        children: [
          G.type === "create-enum" && /* @__PURE__ */ e(I, { label: "Code *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: v.code || "", onChange: (m) => W((F) => ({ ...F, code: m.target.value, codeEdited: !0 })), placeholder: "e.g. materials", style: { fontFamily: "var(--mono)" } }) }),
          /* @__PURE__ */ e(I, { label: "Name *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: G.type !== "create-enum", value: v.name || "", onChange: (m) => W((F) => ({ ...F, name: m.target.value, ...G.type === "create-enum" && !F.codeEdited ? { code: Se(m.target.value) } : {} })), placeholder: "e.g. Materials" }) }),
          /* @__PURE__ */ e(I, { label: "Description", children: /* @__PURE__ */ e("input", { className: "field-input", value: v.description || "", onChange: (m) => W((F) => ({ ...F, description: m.target.value })), placeholder: "Optional description" }) })
        ]
      }
    ),
    /* @__PURE__ */ e("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 8 }, children: t && /* @__PURE__ */ n(
      "button",
      {
        className: "btn btn-sm",
        style: { display: "flex", alignItems: "center", gap: 5 },
        onClick: () => {
          M({ type: "create-enum", ctx: {} }), W({});
        },
        children: [
          /* @__PURE__ */ e(be, { size: 11, strokeWidth: 2.5 }),
          "New enumeration"
        ]
      }
    ) }),
    y.map((m) => {
      var i;
      const F = S === m.id, Z = C[m.id] || [];
      return /* @__PURE__ */ n("div", { className: "settings-card", children: [
        /* @__PURE__ */ n("div", { className: "settings-card-hd", onClick: () => d(m.id), style: { display: "flex", alignItems: "center" }, children: [
          /* @__PURE__ */ e("span", { className: "settings-card-chevron", children: F ? /* @__PURE__ */ e(Oe, { size: 13, strokeWidth: 2, color: "var(--muted)" }) : /* @__PURE__ */ e(ze, { size: 13, strokeWidth: 2, color: "var(--muted)" }) }),
          /* @__PURE__ */ e("span", { className: "settings-card-name", children: m.name }),
          /* @__PURE__ */ n("span", { className: "settings-badge", style: { marginLeft: 6 }, children: [
            m.valueCount,
            " value",
            m.valueCount !== 1 ? "s" : ""
          ] }),
          m.description && /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--muted)", marginLeft: 8 }, children: m.description }),
          /* @__PURE__ */ n("div", { style: { display: "flex", gap: 4, marginLeft: "auto" }, children: [
            t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit", onClick: (r) => {
              r.stopPropagation(), M({ type: "edit-enum", ctx: { enumId: m.id } }), W({ name: m.name, description: m.description || "" });
            }, children: /* @__PURE__ */ e(ye, { size: 12, strokeWidth: 2, color: "var(--accent)" }) }),
            t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: (r) => N(r, m), children: /* @__PURE__ */ e(ce, { size: 12, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
          ] })
        ] }),
        F && /* @__PURE__ */ n("div", { className: "settings-card-body", style: { padding: "8px 16px 12px" }, children: [
          Z.length > 0 && /* @__PURE__ */ n("table", { className: "settings-table", style: { marginBottom: 8 }, children: [
            /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
              /* @__PURE__ */ e("th", { style: { width: 40 }, children: "#" }),
              /* @__PURE__ */ e("th", { children: "Value" }),
              /* @__PURE__ */ e("th", { children: "Label" }),
              /* @__PURE__ */ e("th", { style: { width: 1 } })
            ] }) }),
            /* @__PURE__ */ e("tbody", { children: Z.map((r, O) => {
              var K;
              return (L == null ? void 0 : L.id) === r.id ? /* @__PURE__ */ n("tr", { children: [
                /* @__PURE__ */ e("td", { style: { textAlign: "center", color: "var(--muted)", fontSize: 11 }, children: O }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: L.value || "", onChange: (ne) => te((b) => ({ ...b, value: ne.target.value })), onKeyDown: (ne) => {
                  ne.key === "Enter" && h(), ne.key === "Escape" && te(null);
                }, style: { fontSize: 12, padding: "2px 6px" } }) }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("input", { className: "field-input", value: L.label || "", onChange: (ne) => te((b) => ({ ...b, label: ne.target.value })), onKeyDown: (ne) => {
                  ne.key === "Enter" && h(), ne.key === "Escape" && te(null);
                }, placeholder: "(optional)", style: { fontSize: 12, padding: "2px 6px" } }) }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ n("div", { style: { display: "flex", gap: 4, justifyContent: "flex-end", whiteSpace: "nowrap" }, children: [
                  /* @__PURE__ */ e("button", { className: "btn btn-primary btn-sm", onClick: h, disabled: c || !((K = L.value) != null && K.trim()), style: { fontSize: 11, padding: "2px 8px" }, children: "Save" }),
                  /* @__PURE__ */ e("button", { className: "btn btn-sm", onClick: () => te(null), style: { fontSize: 11, padding: "2px 8px" }, children: "Cancel" })
                ] }) })
              ] }, r.id) : /* @__PURE__ */ n("tr", { children: [
                /* @__PURE__ */ e("td", { style: { textAlign: "center", color: "var(--muted)", fontSize: 11 }, children: O }),
                /* @__PURE__ */ e("td", { className: "settings-td-mono", children: r.value }),
                /* @__PURE__ */ e("td", { style: { color: r.label ? "var(--fg)" : "var(--muted)" }, children: r.label || "—" }),
                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ n("div", { style: { display: "flex", gap: 2, justifyContent: "flex-end", whiteSpace: "nowrap" }, children: [
                  t && O > 0 && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Move up", onClick: () => V(m.id, O, -1), style: { fontSize: 10 }, children: "▲" }),
                  t && O < Z.length - 1 && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Move down", onClick: () => V(m.id, O, 1), style: { fontSize: 10 }, children: "▼" }),
                  t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit", onClick: () => te({ id: r.id, enumId: m.id, value: r.value, label: r.label || "", displayOrder: O }), children: /* @__PURE__ */ e(ye, { size: 11, strokeWidth: 2, color: "var(--accent)" }) }),
                  t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: () => A(m.id, r), children: /* @__PURE__ */ e(ce, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
                ] }) })
              ] }, r.id);
            }) })
          ] }),
          Z.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No values yet" }),
          t && (H == null ? void 0 : H.enumId) === m.id ? /* @__PURE__ */ n("div", { style: { display: "flex", gap: 6, alignItems: "center", marginTop: 4 }, children: [
            /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, placeholder: "Value *", value: H.value || "", onChange: (r) => ae((O) => ({ ...O, value: r.target.value })), onKeyDown: (r) => {
              r.key === "Enter" && u(m.id);
            }, style: { flex: 1 } }),
            /* @__PURE__ */ e("input", { className: "field-input", placeholder: "Label (optional)", value: H.label || "", onChange: (r) => ae((O) => ({ ...O, label: r.target.value })), style: { flex: 1 } }),
            /* @__PURE__ */ e("button", { className: "btn btn-primary btn-sm", onClick: () => u(m.id), disabled: c || !((i = H.value) != null && i.trim()), children: "Add" }),
            /* @__PURE__ */ e("button", { className: "btn btn-sm", onClick: () => ae(null), children: "Cancel" })
          ] }) : t ? /* @__PURE__ */ n("button", { className: "btn btn-sm", style: { display: "flex", alignItems: "center", gap: 5, marginTop: 4 }, onClick: () => ae({ enumId: m.id, value: "", label: "" }), children: [
            /* @__PURE__ */ e(be, { size: 11, strokeWidth: 2.5 }),
            "Add value"
          ] }) : null
        ] })
      ] }, m.id);
    }),
    y.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No enumerations defined yet" })
  ] });
}
function kt({ userId: a, canWrite: t, toast: l }) {
  var _e;
  const [y, T] = _([]), [S, p] = _(null), [C, P] = _({}), [G, M] = _(!0), [v, W] = _(null), [c, x] = _({}), [H, ae] = _(!1), [L, te] = _([]), [s, R] = _(""), [d, g] = _(!1), [N, u] = _({}), [A, h] = _([]), [V, J] = _({}), [se, m] = _(null), [F, Z] = _(null), [i, r] = _([]), O = lt;
  function B() {
    return f.getLifecycles(a).then((k) => T(Array.isArray(k) ? k : []));
  }
  Ae(() => {
    B().finally(() => M(!1)), dt("GET", "/roles").then((k) => te(Array.isArray(k) ? k : [])).catch(() => {
    }), Qe("GET", "/algorithms/instances").then((k) => h(Array.isArray(k) ? k : [])).catch(() => {
    }), f.getMetadataKeys(a, "LIFECYCLE_STATE").then((k) => r(Array.isArray(k) ? k : [])).catch(() => {
    });
  }, [a]), qe((k) => {
    k.event === "METAMODEL_CHANGED" && B();
  });
  async function K(k) {
    const [o, q] = await Promise.all([
      f.getLifecycleStates(a, k),
      f.getLifecycleTransitions(a, k)
    ]), ie = Array.isArray(q) ? q : [];
    P((U) => ({ ...U, [k]: {
      states: Array.isArray(o) ? o : [],
      transitions: ie
    } }));
    for (const U of ie) {
      const j = U.id || U.ID;
      f.listTransitionGuards(a, j).then((w) => u((D) => ({ ...D, [j]: Array.isArray(w) ? w : [] }))).catch(() => {
      });
    }
    const le = Array.isArray(o) ? o : [];
    for (const U of le) {
      const j = U.id || U.ID;
      f.listLifecycleStateActions(a, k, j).then((w) => J((D) => ({ ...D, [j]: Array.isArray(w) ? w : [] }))).catch(() => {
      });
    }
  }
  async function ne(k) {
    const o = k.id || k.ID;
    if (S === o) {
      p(null);
      return;
    }
    p(o), C[o] || await K(o).catch((q) => l(q, "error"));
  }
  function b(k, o = {}, q = {}) {
    x(q), W({ type: k, ctx: o }), R("");
  }
  function z() {
    W(null), x({}), R("");
  }
  async function Q() {
    var k, o, q, ie, le, U, j, w, D;
    ae(!0);
    try {
      const { type: X, ctx: ee } = v, fe = c.metadata || {}, ue = {};
      for (const [Ce, Y] of Object.entries(fe))
        Y != null && (ue[Ce] = Y);
      const me = {
        code: (k = c.code) == null ? void 0 : k.trim(),
        name: (o = c.name) == null ? void 0 : o.trim(),
        isInitial: !!c.isInitial,
        metadata: ue,
        displayOrder: c.displayOrder !== "" ? Number(c.displayOrder) : 0,
        color: c.color || null
      }, Ie = {
        code: (q = c.code) == null ? void 0 : q.trim(),
        name: (ie = c.name) == null ? void 0 : ie.trim(),
        fromStateId: c.fromStateId,
        toStateId: c.toStateId,
        actionType: c.actionType || "NONE",
        versionStrategy: c.versionStrategy || "NONE"
      };
      X === "create-lc" ? (await f.createLifecycle(a, { code: (le = c.code) == null ? void 0 : le.trim(), name: (U = c.name) == null ? void 0 : U.trim(), description: ((j = c.description) == null ? void 0 : j.trim()) || null }), await B()) : X === "duplicate-lc" ? (await f.duplicateLifecycle(a, ee.sourceId, (w = c.code) == null ? void 0 : w.trim(), (D = c.name) == null ? void 0 : D.trim()), await B()) : X === "create-state" ? (await f.addLifecycleState(a, ee.lifecycleId, me), await K(ee.lifecycleId)) : X === "edit-state" ? (await f.updateLifecycleState(a, ee.lifecycleId, ee.stateId, me), await K(ee.lifecycleId)) : X === "create-transition" ? (await f.addLifecycleTransition(a, ee.lifecycleId, Ie), await K(ee.lifecycleId)) : X === "edit-transition" && (await f.updateLifecycleTransition(a, ee.lifecycleId, ee.transId, Ie), await K(ee.lifecycleId)), z();
    } catch (X) {
      l(X, "error");
    } finally {
      ae(!1);
    }
  }
  async function Ee(k, o) {
    if (k.stopPropagation(), !!window.confirm(`Delete lifecycle "${o.name || o.NAME}"?

This deletes all states, transitions and attribute state rules. Cannot be undone.`))
      try {
        await f.deleteLifecycle(a, o.id || o.ID), await B(), S === (o.id || o.ID) && p(null);
      } catch (q) {
        l(q, "error");
      }
  }
  async function ge(k, o) {
    if (window.confirm(`Delete state "${o.name || o.NAME}"?

Attribute state rules for this state will also be deleted.`))
      try {
        await f.deleteLifecycleState(a, k, o.id || o.ID), await K(k);
      } catch (q) {
        l(q, "error");
      }
  }
  async function Ne(k, o) {
    if (window.confirm(`Delete transition "${o.name || o.NAME}"?`))
      try {
        await f.deleteLifecycleTransition(a, k, o.id || o.ID), await K(k);
      } catch (q) {
        l(q, "error");
      }
  }
  async function de(k, o) {
    if (s) {
      g(!0);
      try {
        await f.addTransitionSignatureRequirement(a, k, s), R(""), await K(o);
      } catch (q) {
        l(q, "error");
      } finally {
        g(!1);
      }
    }
  }
  async function pe(k, o, q) {
    g(!0);
    try {
      await f.removeTransitionSignatureRequirement(a, k, o), await K(q);
    } catch (ie) {
      l(ie, "error");
    } finally {
      g(!1);
    }
  }
  if (G) return /* @__PURE__ */ e("div", { className: "settings-loading", children: "Loading…" });
  const Te = {
    "create-lc": "New Lifecycle",
    "duplicate-lc": "Duplicate Lifecycle",
    "create-state": "Add State",
    "edit-state": "Edit State",
    "create-transition": "Add Transition",
    "edit-transition": "Edit Transition"
  }[v == null ? void 0 : v.type] || "", ke = v && ["edit-state", "edit-transition"].includes(v.type);
  return /* @__PURE__ */ n("div", { className: "settings-list", children: [
    v && /* @__PURE__ */ n(
      Re,
      {
        title: Te,
        onClose: z,
        onSave: Q,
        saving: H,
        saveLabel: ke ? "Update" : "Create",
        width: (_e = v.type) != null && _e.includes("state") || v.type === "edit-transition" ? 520 : 480,
        children: [
          v.type === "create-lc" && /* @__PURE__ */ n(re, { children: [
            /* @__PURE__ */ e(I, { label: "Code *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: c.code || "", onChange: (k) => x((o) => ({ ...o, code: k.target.value, codeEdited: !0 })), placeholder: "e.g. standard", style: { fontFamily: "var(--mono)" } }) }),
            /* @__PURE__ */ e(I, { label: "Name *", children: /* @__PURE__ */ e("input", { className: "field-input", value: c.name || "", onChange: (k) => x((o) => ({ ...o, name: k.target.value, code: o.codeEdited ? o.code : Se(k.target.value) })), placeholder: "e.g. Standard" }) }),
            /* @__PURE__ */ e(I, { label: "Description", children: /* @__PURE__ */ e("input", { className: "field-input", value: c.description || "", onChange: (k) => x((o) => ({ ...o, description: k.target.value })), placeholder: "Optional description" }) })
          ] }),
          v.type === "duplicate-lc" && /* @__PURE__ */ n(re, { children: [
            /* @__PURE__ */ n("div", { style: { fontSize: 11, color: "var(--muted)", marginBottom: 8 }, children: [
              "Duplicating ",
              /* @__PURE__ */ e("strong", { style: { color: "var(--text)" }, children: v.ctx.sourceName }),
              " — copies all states, transitions, guards, signature requirements, state actions, and metadata."
            ] }),
            /* @__PURE__ */ e(I, { label: "New Code *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: c.code || "", onChange: (k) => x((o) => ({ ...o, code: k.target.value, codeEdited: !0 })), placeholder: "e.g. standard-v2", style: { fontFamily: "var(--mono)" } }) }),
            /* @__PURE__ */ e(I, { label: "New Name *", children: /* @__PURE__ */ e("input", { className: "field-input", value: c.name || "", onChange: (k) => x((o) => ({ ...o, name: k.target.value, code: o.codeEdited ? o.code : Se(k.target.value) })), placeholder: "e.g. Standard (v2)" }) })
          ] }),
          (v.type === "create-state" || v.type === "edit-state") && /* @__PURE__ */ n(re, { children: [
            v.type === "create-state" && /* @__PURE__ */ e(I, { label: "Code *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: c.code || "", onChange: (k) => x((o) => ({ ...o, code: k.target.value, codeEdited: !0 })), placeholder: `e.g. ${v.ctx.lifecycleId || "lc"}-in-work`, style: { fontFamily: "var(--mono)" } }) }),
            /* @__PURE__ */ e(
              It,
              {
                form: c,
                setForm: x,
                knownMetaKeys: i,
                onNameChange: v.type === "create-state" ? (k) => x((o) => ({ ...o, name: k, code: o.codeEdited ? o.code : `${v.ctx.lifecycleId}-${Se(k)}` })) : null
              }
            )
          ] }),
          (v.type === "create-transition" || v.type === "edit-transition") && /* @__PURE__ */ n(re, { children: [
            v.type === "create-transition" && /* @__PURE__ */ e(I, { label: "Code *", children: /* @__PURE__ */ e("input", { className: "field-input", autoFocus: !0, value: c.code || "", onChange: (k) => x((o) => ({ ...o, code: k.target.value, codeEdited: !0 })), placeholder: `e.g. ${v.ctx.lifecycleId || "lc"}-freeze`, style: { fontFamily: "var(--mono)" } }) }),
            /* @__PURE__ */ e(
              Et,
              {
                form: c,
                setForm: x,
                states: v.ctx.states || [],
                onNameChange: v.type === "create-transition" ? (k) => x((o) => ({ ...o, name: k, code: o.codeEdited ? o.code : `${v.ctx.lifecycleId}-${Se(k)}` })) : null
              }
            )
          ] }),
          v.type === "edit-transition" && t && (() => {
            var U, j;
            const k = v.ctx.lifecycleId, o = v.ctx.transId, q = (j = (U = C[k]) == null ? void 0 : U.transitions) == null ? void 0 : j.find((w) => (w.id || w.ID) === o), ie = (q == null ? void 0 : q.signatureRequirements) || [], le = new Set(ie.map((w) => w.roleRequired));
            return /* @__PURE__ */ n("div", { style: { marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }, children: [
              /* @__PURE__ */ e("div", { style: { fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }, children: "Signature Requirements" }),
              ie.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", style: { fontSize: 11 }, children: "No signatures required for this transition" }),
              ie.map((w) => {
                var D;
                return /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 12 }, children: [
                  /* @__PURE__ */ e("span", { style: { flex: 1, color: "var(--text)" }, children: ((D = L.find((X) => (X.id || X.ID) === w.roleRequired)) == null ? void 0 : D.name) || w.roleRequired }),
                  /* @__PURE__ */ e(
                    "button",
                    {
                      className: "panel-icon-btn",
                      disabled: d,
                      onClick: () => pe(o, w.id, k),
                      title: "Remove requirement",
                      children: /* @__PURE__ */ e(ce, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" })
                    }
                  )
                ] }, w.id);
              }),
              /* @__PURE__ */ n("div", { style: { display: "flex", gap: 6, marginTop: 8 }, children: [
                /* @__PURE__ */ n(
                  "select",
                  {
                    className: "field-input",
                    style: { flex: 1, fontSize: 12 },
                    value: s,
                    onChange: (w) => R(w.target.value),
                    children: [
                      /* @__PURE__ */ e("option", { value: "", children: "Add required role…" }),
                      L.map((w) => {
                        const D = w.id || w.ID;
                        return /* @__PURE__ */ e("option", { value: D, disabled: le.has(D), children: w.name || w.NAME || D }, D);
                      })
                    ]
                  }
                ),
                /* @__PURE__ */ e(
                  "button",
                  {
                    className: "btn btn-sm",
                    disabled: !s || d,
                    onClick: () => de(o, k),
                    children: "Add"
                  }
                )
              ] })
            ] });
          })()
        ]
      }
    ),
    /* @__PURE__ */ e("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 8 }, children: t && /* @__PURE__ */ n("button", { className: "btn btn-sm", style: { display: "flex", alignItems: "center", gap: 5 }, onClick: () => b("create-lc"), children: [
      /* @__PURE__ */ e(be, { size: 11, strokeWidth: 2.5 }),
      "New lifecycle"
    ] }) }),
    y.map((k) => {
      var j;
      const o = k.id || k.ID, q = k.name || k.NAME || o, ie = S === o, le = C[o], U = (le == null ? void 0 : le.states) || [];
      return /* @__PURE__ */ n("div", { className: "settings-card", children: [
        /* @__PURE__ */ n("div", { className: "settings-card-hd", onClick: () => ne(k), style: { display: "flex", alignItems: "center" }, children: [
          /* @__PURE__ */ e("span", { className: "settings-card-chevron", children: ie ? /* @__PURE__ */ e(Oe, { size: 13, strokeWidth: 2, color: "var(--muted)" }) : /* @__PURE__ */ e(ze, { size: 13, strokeWidth: 2, color: "var(--muted)" }) }),
          /* @__PURE__ */ e("span", { className: "settings-card-name", children: q }),
          /* @__PURE__ */ e("span", { className: "settings-card-id", children: o }),
          t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Duplicate lifecycle", style: { marginLeft: "auto" }, onClick: (w) => {
            w.stopPropagation(), b("duplicate-lc", { sourceId: o, sourceName: q }, { name: `${q} (copy)`, code: Se(`${q}-copy`) });
          }, children: /* @__PURE__ */ e(pt, { size: 12, strokeWidth: 2, color: "var(--accent)" }) }),
          t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete lifecycle", onClick: (w) => Ee(w, k), children: /* @__PURE__ */ e(ce, { size: 12, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
        ] }),
        ie && le && /* @__PURE__ */ n("div", { className: "settings-card-body", style: { display: "flex", flexDirection: "column", gap: 0 }, children: [
          ((j = le.states) == null ? void 0 : j.length) > 0 && O && /* @__PURE__ */ e("div", { style: { marginBottom: 16, overflowX: "auto" }, children: /* @__PURE__ */ e(O, { lifecycleId: o, userId: a, previewMode: !0 }) }),
          /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "States" }),
            t && /* @__PURE__ */ e(
              "button",
              {
                className: "panel-icon-btn",
                title: "Add state",
                onClick: () => b("create-state", { lifecycleId: o }, { color: Fe, displayOrder: "" }),
                children: /* @__PURE__ */ e(be, { size: 12, strokeWidth: 2.5, color: "var(--accent)" })
              }
            )
          ] }),
          U.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", style: { marginBottom: 12 }, children: "No states defined" }),
          U.map((w) => {
            const D = w.id || w.ID, X = w.name || w.NAME || D, ee = He(w), fe = w.metadata || {}, ue = [
              w.is_initial || w.IS_INITIAL ? "INIT" : null,
              ...Object.keys(fe).map((Y) => Y.toUpperCase())
            ].filter(Boolean), me = w.display_order ?? w.DISPLAY_ORDER ?? 0, Ie = se === D, Ce = V[D] || [];
            return /* @__PURE__ */ n("div", { style: { marginBottom: 3 }, children: [
              /* @__PURE__ */ n("div", { style: {
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 8px",
                borderRadius: Ie ? "5px 5px 0 0" : 5,
                background: "var(--subtle-bg)",
                border: "1px solid var(--border)",
                borderBottom: Ie ? "1px solid var(--border2)" : "1px solid var(--border)",
                cursor: "pointer"
              }, onClick: () => m(Ie ? null : D), children: [
                /* @__PURE__ */ e("span", { style: { flexShrink: 0 }, children: Ie ? /* @__PURE__ */ e(Oe, { size: 11, strokeWidth: 2, color: "var(--muted)" }) : /* @__PURE__ */ e(ze, { size: 11, strokeWidth: 2, color: "var(--muted)" }) }),
                /* @__PURE__ */ e("span", { style: {
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: ee,
                  boxShadow: `0 0 0 2px ${ee}33`
                } }),
                /* @__PURE__ */ e("span", { style: { fontWeight: 600, fontSize: 12, color: "var(--text)", flex: 1 }, children: X }),
                /* @__PURE__ */ e("div", { style: { display: "flex", gap: 4 }, children: ue.map((Y) => /* @__PURE__ */ e("span", { className: "lc-state-flag", style: { background: ee + "22", color: ee, borderColor: ee + "55" }, children: Y }, Y)) }),
                Ce.length > 0 && /* @__PURE__ */ n("span", { className: "settings-badge", title: `${Ce.length} state action(s)`, children: [
                  Ce.length,
                  " action",
                  Ce.length > 1 ? "s" : ""
                ] }),
                /* @__PURE__ */ n("span", { style: { fontSize: 10, color: "var(--muted)", minWidth: 24, textAlign: "right" }, children: [
                  "#",
                  me
                ] }),
                t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit state", onClick: (Y) => {
                  Y.stopPropagation(), b("edit-state", { lifecycleId: o, stateId: D }, {
                    name: X,
                    isInitial: !!(w.is_initial || w.IS_INITIAL),
                    metadata: { ...fe },
                    displayOrder: me,
                    color: ee
                  });
                }, children: /* @__PURE__ */ e(ye, { size: 11, strokeWidth: 2, color: "var(--accent)" }) }),
                t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete state", onClick: (Y) => {
                  Y.stopPropagation(), ge(o, w);
                }, children: /* @__PURE__ */ e(ce, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
              ] }),
              Ie && /* @__PURE__ */ n("div", { style: {
                padding: "10px 12px",
                background: "var(--subtle-bg2)",
                border: "1px solid var(--border)",
                borderTop: "none",
                borderRadius: "0 0 5px 5px"
              }, children: [
                /* @__PURE__ */ n("div", { style: { display: "flex", gap: 16, marginBottom: 12, fontSize: 11 }, children: [
                  /* @__PURE__ */ n("div", { children: [
                    /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "ID" }),
                    " ",
                    /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono)", color: "var(--text)", fontSize: 10 }, children: D })
                  ] }),
                  /* @__PURE__ */ n("div", { children: [
                    /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "Order" }),
                    " ",
                    /* @__PURE__ */ e("span", { style: { color: "var(--text)" }, children: me })
                  ] })
                ] }),
                Object.keys(fe).length > 0 && /* @__PURE__ */ n("div", { style: { marginBottom: 12 }, children: [
                  /* @__PURE__ */ e("div", { style: { fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }, children: "Metadata" }),
                  /* @__PURE__ */ e("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: Object.entries(fe).map(([Y, oe]) => /* @__PURE__ */ n("span", { style: {
                    fontSize: 10,
                    fontFamily: "var(--mono)",
                    padding: "2px 6px",
                    borderRadius: 3,
                    background: "var(--accent-dim)",
                    color: "var(--accent)",
                    border: "1px solid rgba(106,172,255,.2)"
                  }, children: [
                    Y,
                    "=",
                    oe
                  ] }, Y)) })
                ] }),
                /* @__PURE__ */ e("div", { style: { fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }, children: "State Actions" }),
                Ce.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", style: { fontSize: 11, marginBottom: 8 }, children: "No actions attached to this state" }),
                Ce.map((Y) => /* @__PURE__ */ n("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 6px",
                  marginBottom: 2,
                  borderRadius: 3,
                  background: "var(--subtle-bg)",
                  border: "1px solid var(--border)",
                  fontSize: 11
                }, children: [
                  /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono)", color: "var(--accent)", fontWeight: 600 }, children: Y.algorithmCode || Y.instanceName }),
                  /* @__PURE__ */ e(tt, { module: Y.moduleName }),
                  /* @__PURE__ */ e("span", { className: "settings-badge", style: {
                    background: Y.trigger === "ON_ENTER" ? "rgba(52,211,153,.15)" : "rgba(248,113,113,.15)",
                    color: Y.trigger === "ON_ENTER" ? "#34d399" : "#f87171",
                    fontSize: 9
                  }, children: Y.trigger }),
                  /* @__PURE__ */ e("span", { className: "settings-badge", style: {
                    background: Y.executionMode === "TRANSACTIONAL" ? "rgba(167,139,250,.15)" : "rgba(250,204,21,.15)",
                    color: Y.executionMode === "TRANSACTIONAL" ? "#a78bfa" : "#facc15",
                    fontSize: 9
                  }, children: Y.executionMode }),
                  /* @__PURE__ */ e("span", { style: { flex: 1 } }),
                  t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Detach action", onClick: async () => {
                    try {
                      await f.detachLifecycleStateAction(a, o, D, Y.id), J((oe) => ({ ...oe, [D]: (oe[D] || []).filter((xe) => xe.id !== Y.id) })), l("Action detached", "success");
                    } catch (oe) {
                      l(oe, "error");
                    }
                  }, children: /* @__PURE__ */ e(ce, { size: 10, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
                ] }, Y.id)),
                t && (() => {
                  const Y = A.filter((oe) => oe.typeName === "State Action");
                  return /* @__PURE__ */ n("div", { style: { display: "flex", gap: 6, marginTop: 6, alignItems: "center" }, children: [
                    /* @__PURE__ */ n("select", { className: "field-input", id: `sa-inst-${D}`, style: { flex: 1, fontSize: 11 }, defaultValue: "", children: [
                      /* @__PURE__ */ e("option", { value: "", children: "Select action instance…" }),
                      Y.map((oe) => /* @__PURE__ */ n("option", { value: oe.id, children: [
                        oe.algorithmName || oe.name,
                        " — ",
                        oe.name
                      ] }, oe.id)),
                      Y.length === 0 && /* @__PURE__ */ e("option", { disabled: !0, children: "No State Action instances available" })
                    ] }),
                    /* @__PURE__ */ n("select", { className: "field-input", id: `sa-trigger-${D}`, style: { width: 100, fontSize: 11 }, defaultValue: "ON_ENTER", children: [
                      /* @__PURE__ */ e("option", { value: "ON_ENTER", children: "ON_ENTER" }),
                      /* @__PURE__ */ e("option", { value: "ON_EXIT", children: "ON_EXIT" })
                    ] }),
                    /* @__PURE__ */ n("select", { className: "field-input", id: `sa-mode-${D}`, style: { width: 130, fontSize: 11 }, defaultValue: "TRANSACTIONAL", children: [
                      /* @__PURE__ */ e("option", { value: "TRANSACTIONAL", children: "TRANSACTIONAL" }),
                      /* @__PURE__ */ e("option", { value: "POST_COMMIT", children: "POST_COMMIT" })
                    ] }),
                    /* @__PURE__ */ e("button", { className: "btn btn-sm", style: { fontSize: 10 }, onClick: async () => {
                      const oe = document.getElementById(`sa-inst-${D}`), xe = document.getElementById(`sa-trigger-${D}`), De = document.getElementById(`sa-mode-${D}`);
                      if (oe != null && oe.value)
                        try {
                          await f.attachLifecycleStateAction(a, o, D, oe.value, xe.value, De.value);
                          const we = await f.listLifecycleStateActions(a, o, D);
                          J((We) => ({ ...We, [D]: Array.isArray(we) ? we : [] })), oe.value = "", l("Action attached", "success");
                        } catch (we) {
                          l(we, "error");
                        }
                    }, children: "Attach" })
                  ] });
                })()
              ] })
            ] }, D);
          }),
          /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, marginBottom: 6 }, children: [
            /* @__PURE__ */ e("span", { className: "settings-sub-label", style: { margin: 0 }, children: "Transitions" }),
            t && /* @__PURE__ */ e(
              "button",
              {
                className: "panel-icon-btn",
                title: "Add transition",
                onClick: () => b("create-transition", { lifecycleId: o, states: U }, { actionType: "NONE", versionStrategy: "NONE" }),
                children: /* @__PURE__ */ e(be, { size: 12, strokeWidth: 2.5, color: "var(--accent)" })
              }
            )
          ] }),
          le.transitions.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", children: "No transitions defined" }),
          le.transitions.map((w) => {
            const D = w.id || w.ID, X = w.name || w.NAME || D, ee = w.from_state_id || w.FROM_STATE_ID || "", fe = w.to_state_id || w.TO_STATE_ID || "", ue = U.find(($) => ($.id || $.ID) === ee), me = U.find(($) => ($.id || $.ID) === fe), Ie = He(ue), Ce = He(me), Y = w.version_strategy || w.VERSION_STRATEGY, oe = w.action_type || w.ACTION_TYPE || "NONE", xe = N[D] || [], De = F === D, we = w.signatureRequirements || [], We = A.filter(($) => $.typeName === "Action Guard" || $.typeName === "Lifecycle Guard");
            return /* @__PURE__ */ n("div", { style: { marginBottom: 3 }, children: [
              /* @__PURE__ */ n("div", { style: {
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 8px",
                borderRadius: De ? "5px 5px 0 0" : 5,
                background: "var(--subtle-bg)",
                border: "1px solid var(--border)",
                borderBottom: De ? "1px solid var(--border2)" : "1px solid var(--border)",
                cursor: "pointer"
              }, onClick: () => Z(De ? null : D), children: [
                /* @__PURE__ */ e("span", { style: { flexShrink: 0 }, children: De ? /* @__PURE__ */ e(Oe, { size: 11, strokeWidth: 2, color: "var(--muted)" }) : /* @__PURE__ */ e(ze, { size: 11, strokeWidth: 2, color: "var(--muted)" }) }),
                /* @__PURE__ */ e("span", { style: { fontWeight: 600, fontSize: 12, color: "var(--text)", minWidth: 90 }, children: X }),
                /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 5, flex: 1, fontSize: 11 }, children: [
                  /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                    /* @__PURE__ */ e("span", { style: { width: 8, height: 8, borderRadius: "50%", background: Ie, flexShrink: 0 } }),
                    /* @__PURE__ */ e("span", { style: { color: Ie }, children: (ue == null ? void 0 : ue.name) || (ue == null ? void 0 : ue.NAME) || ee })
                  ] }),
                  /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "→" }),
                  /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                    /* @__PURE__ */ e("span", { style: { width: 8, height: 8, borderRadius: "50%", background: Ce, flexShrink: 0 } }),
                    /* @__PURE__ */ e("span", { style: { color: Ce }, children: (me == null ? void 0 : me.name) || (me == null ? void 0 : me.NAME) || fe })
                  ] })
                ] }),
                /* @__PURE__ */ n("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" }, children: [
                  xe.length > 0 && /* @__PURE__ */ n("span", { className: "settings-badge", title: xe.map(($) => $.algorithmCode).join(", "), children: [
                    xe.length,
                    " guard",
                    xe.length > 1 ? "s" : ""
                  ] }),
                  Y && Y !== "NONE" && /* @__PURE__ */ e("span", { className: "settings-badge", children: Y }),
                  we.length > 0 && /* @__PURE__ */ n("span", { className: "settings-badge", style: { background: "rgba(139,92,246,.18)", color: "#a78bfa" }, children: [
                    we.length,
                    " sign."
                  ] })
                ] }),
                t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit transition", onClick: ($) => {
                  $.stopPropagation(), b("edit-transition", { lifecycleId: o, transId: D, states: U }, {
                    name: X,
                    fromStateId: ee,
                    toStateId: fe,
                    actionType: oe,
                    versionStrategy: Y || "NONE"
                  });
                }, children: /* @__PURE__ */ e(ye, { size: 11, strokeWidth: 2, color: "var(--accent)" }) }),
                t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete transition", onClick: ($) => {
                  $.stopPropagation(), Ne(o, w);
                }, children: /* @__PURE__ */ e(ce, { size: 11, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
              ] }),
              De && /* @__PURE__ */ n("div", { style: {
                padding: "10px 12px",
                background: "var(--subtle-bg2)",
                border: "1px solid var(--border)",
                borderTop: "none",
                borderRadius: "0 0 5px 5px"
              }, children: [
                /* @__PURE__ */ n("div", { style: { display: "flex", gap: 16, marginBottom: 12, fontSize: 11, flexWrap: "wrap" }, children: [
                  /* @__PURE__ */ n("div", { children: [
                    /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "ID" }),
                    " ",
                    /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono)", color: "var(--text)", fontSize: 10 }, children: D })
                  ] }),
                  /* @__PURE__ */ n("div", { children: [
                    /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "Action Type" }),
                    " ",
                    /* @__PURE__ */ e("span", { style: { color: "var(--text)" }, children: oe })
                  ] }),
                  /* @__PURE__ */ n("div", { children: [
                    /* @__PURE__ */ e("span", { style: { color: "var(--muted)" }, children: "Version Strategy" }),
                    " ",
                    /* @__PURE__ */ e("span", { style: { color: "var(--text)" }, children: Y || "NONE" })
                  ] })
                ] }),
                /* @__PURE__ */ e("div", { style: { fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }, children: "Guards" }),
                xe.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", style: { fontSize: 11, marginBottom: 8 }, children: "No guards attached" }),
                xe.map(($) => /* @__PURE__ */ n("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 6px",
                  marginBottom: 2,
                  borderRadius: 3,
                  background: "var(--subtle-bg)",
                  border: "1px solid var(--border)",
                  fontSize: 11
                }, children: [
                  /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono)", color: "var(--accent)", fontWeight: 600 }, children: $.algorithmName || $.algorithmCode || $.instanceName }),
                  $.algorithmCode && $.algorithmName && /* @__PURE__ */ n("span", { style: { fontSize: 10, color: "var(--muted)" }, children: [
                    "(",
                    $.algorithmCode,
                    ")"
                  ] }),
                  /* @__PURE__ */ e(tt, { module: $.moduleName }),
                  t ? /* @__PURE__ */ n(
                    "select",
                    {
                      className: "field-input",
                      style: { fontSize: 10, padding: "0 4px", height: 20 },
                      value: $.effect,
                      onChange: async (he) => {
                        const ve = he.target.value;
                        try {
                          await f.updateTransitionGuard(a, $.id, ve), u((Le) => ({
                            ...Le,
                            [D]: (Le[D] || []).map((je) => je.id === $.id ? { ...je, effect: ve } : je)
                          })), l("Effect updated", "success");
                        } catch (Le) {
                          l(Le, "error");
                        }
                      },
                      children: [
                        /* @__PURE__ */ e("option", { value: "HIDE", children: "HIDE" }),
                        /* @__PURE__ */ e("option", { value: "BLOCK", children: "BLOCK" })
                      ]
                    }
                  ) : /* @__PURE__ */ e("span", { className: `settings-badge ${$.effect === "BLOCK" ? "badge-warn" : ""}`, style: { fontSize: 9 }, children: $.effect }),
                  /* @__PURE__ */ e("span", { style: { flex: 1 } }),
                  t && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Detach guard", onClick: async () => {
                    try {
                      await f.detachTransitionGuard(a, $.id), u((he) => ({ ...he, [D]: (he[D] || []).filter((ve) => ve.id !== $.id) })), l("Guard detached", "success");
                    } catch (he) {
                      l(he, "error");
                    }
                  }, children: /* @__PURE__ */ e(ce, { size: 10, strokeWidth: 2, color: "var(--danger, #f87171)" }) })
                ] }, $.id)),
                t && /* @__PURE__ */ n("div", { style: { display: "flex", gap: 6, marginTop: 4, alignItems: "center" }, children: [
                  /* @__PURE__ */ n("select", { className: "field-input", id: `tg-inst-${D}`, style: { flex: 1, fontSize: 11 }, defaultValue: "", children: [
                    /* @__PURE__ */ e("option", { value: "", children: "Select guard instance…" }),
                    We.map(($) => /* @__PURE__ */ n("option", { value: $.id, children: [
                      $.algorithmName || $.name,
                      " — ",
                      $.name
                    ] }, $.id))
                  ] }),
                  /* @__PURE__ */ n("select", { className: "field-input", id: `tg-effect-${D}`, style: { width: 80, fontSize: 11 }, defaultValue: "BLOCK", children: [
                    /* @__PURE__ */ e("option", { value: "BLOCK", children: "BLOCK" }),
                    /* @__PURE__ */ e("option", { value: "HIDE", children: "HIDE" })
                  ] }),
                  /* @__PURE__ */ e("button", { className: "btn btn-sm", style: { fontSize: 10 }, onClick: async () => {
                    const $ = document.getElementById(`tg-inst-${D}`), he = document.getElementById(`tg-effect-${D}`);
                    if ($ != null && $.value)
                      try {
                        await f.attachTransitionGuard(a, D, $.value, he.value, 0);
                        const ve = await f.listTransitionGuards(a, D);
                        u((Le) => ({ ...Le, [D]: Array.isArray(ve) ? ve : [] })), $.value = "", l("Guard attached", "success");
                      } catch (ve) {
                        l(ve, "error");
                      }
                  }, children: "Attach" })
                ] }),
                /* @__PURE__ */ e("div", { style: { fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 14, marginBottom: 6 }, children: "Signature Requirements" }),
                we.length === 0 && /* @__PURE__ */ e("div", { className: "settings-empty-row", style: { fontSize: 11, marginBottom: 8 }, children: "No signatures required" }),
                we.map(($) => {
                  var he;
                  return /* @__PURE__ */ n("div", { style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 6px",
                    marginBottom: 2,
                    borderRadius: 3,
                    background: "var(--subtle-bg)",
                    border: "1px solid var(--border)",
                    fontSize: 11
                  }, children: [
                    /* @__PURE__ */ e("span", { style: { color: "var(--text)", flex: 1 }, children: ((he = L.find((ve) => (ve.id || ve.ID) === $.roleRequired)) == null ? void 0 : he.name) || $.roleRequired }),
                    t && /* @__PURE__ */ e(
                      "button",
                      {
                        className: "panel-icon-btn",
                        disabled: d,
                        title: "Remove requirement",
                        onClick: () => pe(D, $.id, o),
                        children: /* @__PURE__ */ e(ce, { size: 10, strokeWidth: 2, color: "var(--danger, #f87171)" })
                      }
                    )
                  ] }, $.id);
                }),
                t && /* @__PURE__ */ n("div", { style: { display: "flex", gap: 6, marginTop: 4, alignItems: "center" }, children: [
                  /* @__PURE__ */ n(
                    "select",
                    {
                      className: "field-input",
                      style: { flex: 1, fontSize: 11 },
                      value: s,
                      onChange: ($) => R($.target.value),
                      children: [
                        /* @__PURE__ */ e("option", { value: "", children: "Add required role…" }),
                        L.map(($) => {
                          const he = $.id || $.ID, ve = we.some((Le) => Le.roleRequired === he);
                          return /* @__PURE__ */ e("option", { value: he, disabled: ve, children: $.name || $.NAME || he }, he);
                        })
                      ]
                    }
                  ),
                  /* @__PURE__ */ e(
                    "button",
                    {
                      className: "btn btn-sm",
                      style: { fontSize: 10 },
                      disabled: !s || d,
                      onClick: () => de(D, o),
                      children: "Add"
                    }
                  )
                ] })
              ] })
            ] }, D);
          })
        ] })
      ] }, o);
    })
  ] });
}
function _t({ userId: a, canWrite: t, toast: l }) {
  const [y, T] = _([]), [S, p] = _([]), [C, P] = _(!0), [G, M] = _(null), [v, W] = _({}), [c, x] = _(!1);
  async function H() {
    const [d, g] = await Promise.all([
      f.getSources(a).catch(() => []),
      f.getSourceResolvers(a).catch(() => [])
    ]);
    T(Array.isArray(d) ? d : []), p(Array.isArray(g) ? g : []);
  }
  Ae(() => {
    H().finally(() => P(!1));
  }, [a]);
  function ae() {
    var d;
    W({ id: "", name: "", description: "", resolverInstanceId: ((d = S[0]) == null ? void 0 : d.instanceId) || "", color: "", icon: "" }), M({ kind: "create" });
  }
  function L(d) {
    W({ id: d.id, name: d.name, description: d.description || "", resolverInstanceId: d.resolverInstanceId, color: d.color || "", icon: d.icon || "" }), M({ kind: "edit", original: d });
  }
  function te() {
    M(null), W({});
  }
  async function s() {
    var d, g, N;
    x(!0);
    try {
      const u = {
        name: (d = v.name) == null ? void 0 : d.trim(),
        description: ((g = v.description) == null ? void 0 : g.trim()) || null,
        resolverInstanceId: v.resolverInstanceId,
        color: v.color || null,
        icon: v.icon || null
      };
      G.kind === "create" ? (await f.createSource(a, { id: (N = v.id) == null ? void 0 : N.trim(), ...u }), l("Source created", "success")) : (await f.updateSource(a, G.original.id, u), l("Source updated", "success")), te(), await H();
    } catch (u) {
      l(u, "error");
    } finally {
      x(!1);
    }
  }
  async function R(d) {
    if (window.confirm(`Delete source "${d.name}" (${d.id})?`))
      try {
        await f.deleteSource(a, d.id), l("Source deleted", "success"), await H();
      } catch (g) {
        l(g, "error");
      }
  }
  return C ? /* @__PURE__ */ e("div", { style: { padding: 16, color: "var(--muted)" }, children: "Loading…" }) : /* @__PURE__ */ n("div", { style: { padding: "0 16px 24px" }, children: [
    /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }, children: [
      /* @__PURE__ */ n("div", { style: { flex: 1, fontSize: 12, color: "var(--muted)" }, children: [
        "Sources declare the systems that host link targets. Each source binds to a resolver (algorithm of type ",
        /* @__PURE__ */ e("code", { children: "algtype-source-resolver" }),
        "). The built-in",
        " ",
        /* @__PURE__ */ e("span", { className: "settings-badge", children: "SELF" }),
        " source targets nodes inside this PLM instance and is not editable."
      ] }),
      t && /* @__PURE__ */ n("button", { className: "btn btn-primary btn-sm", onClick: ae, disabled: S.length === 0, children: [
        /* @__PURE__ */ e(be, { size: 11, strokeWidth: 2 }),
        " Add Source"
      ] })
    ] }),
    /* @__PURE__ */ n("table", { className: "settings-table", children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
        /* @__PURE__ */ e("th", { style: { width: 40 } }),
        /* @__PURE__ */ e("th", { style: { width: 160 }, children: "ID" }),
        /* @__PURE__ */ e("th", { children: "Name" }),
        /* @__PURE__ */ e("th", { children: "Resolver" }),
        /* @__PURE__ */ e("th", { children: "Description" }),
        /* @__PURE__ */ e("th", { style: { width: 90 } })
      ] }) }),
      /* @__PURE__ */ e("tbody", { children: y.map((d) => {
        const g = d.icon ? Ve[d.icon] : null;
        return /* @__PURE__ */ n("tr", { children: [
          /* @__PURE__ */ e("td", { children: g ? /* @__PURE__ */ e(g, { size: 16, strokeWidth: 1.8, color: d.color || "var(--muted)" }) : /* @__PURE__ */ e("span", { style: { color: "var(--muted2)" }, children: "—" }) }),
          /* @__PURE__ */ n("td", { className: "settings-td-mono", children: [
            d.id,
            " ",
            d.builtin && /* @__PURE__ */ e("span", { className: "settings-badge", style: { marginLeft: 4 }, children: "built-in" })
          ] }),
          /* @__PURE__ */ e("td", { children: d.name }),
          /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "settings-badge", children: d.resolverAlgorithmCode }) }),
          /* @__PURE__ */ e("td", { style: { color: "var(--muted)", fontSize: 12 }, children: d.description }),
          /* @__PURE__ */ e("td", { style: { textAlign: "right", whiteSpace: "nowrap" }, children: t && !d.builtin && /* @__PURE__ */ n(re, { children: [
            /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit", onClick: () => L(d), children: /* @__PURE__ */ e(ye, { size: 12, strokeWidth: 2, color: "var(--accent)" }) }),
            /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: () => R(d), style: { marginLeft: 4 }, children: /* @__PURE__ */ e(ce, { size: 12, strokeWidth: 2, color: "var(--danger)" }) })
          ] }) })
        ] }, d.id);
      }) })
    ] }),
    G && /* @__PURE__ */ n(
      Re,
      {
        title: G.kind === "create" ? "New Source" : `Edit ${G.original.name}`,
        onClose: te,
        onSave: s,
        saving: c || !v.name || !v.resolverInstanceId || G.kind === "create" && !v.id,
        children: [
          /* @__PURE__ */ e(I, { label: "ID", children: /* @__PURE__ */ e(
            "input",
            {
              className: "field-input",
              value: v.id || "",
              disabled: G.kind === "edit",
              onChange: (d) => W((g) => ({ ...g, id: d.target.value })),
              placeholder: "e.g. FILE_LOCAL"
            }
          ) }),
          /* @__PURE__ */ e(I, { label: "Name", children: /* @__PURE__ */ e("input", { className: "field-input", value: v.name || "", onChange: (d) => W((g) => ({ ...g, name: d.target.value })) }) }),
          /* @__PURE__ */ e(I, { label: "Description", children: /* @__PURE__ */ e(
            "textarea",
            {
              className: "field-input",
              rows: 2,
              value: v.description || "",
              onChange: (d) => W((g) => ({ ...g, description: d.target.value }))
            }
          ) }),
          /* @__PURE__ */ e(I, { label: "Resolver", children: /* @__PURE__ */ n(
            "select",
            {
              className: "field-input",
              value: v.resolverInstanceId || "",
              onChange: (d) => W((g) => ({ ...g, resolverInstanceId: d.target.value })),
              children: [
                /* @__PURE__ */ e("option", { value: "", children: "— select —" }),
                S.map((d) => /* @__PURE__ */ n("option", { value: d.instanceId, children: [
                  d.algorithmCode,
                  " — ",
                  d.instanceName
                ] }, d.instanceId))
              ]
            }
          ) }),
          /* @__PURE__ */ e(Pe, { label: "Color", value: v.color, onChange: (d) => W((g) => ({ ...g, color: d })) }),
          /* @__PURE__ */ e(ot, { value: v.icon, onChange: (d) => W((g) => ({ ...g, icon: d })) })
        ]
      }
    )
  ] });
}
function Lt({ userId: a, canWrite: t, toast: l }) {
  const [y, T] = _([]), [S, p] = _([]), [C, P] = _([]), [G, M] = _(!0), [v, W] = _(null), [c, x] = _({}), [H, ae] = _(!1);
  async function L() {
    const [h, V, J] = await Promise.all([
      f.getImportContexts().catch(() => []),
      f.getImportAlgorithmInstances().catch(() => []),
      f.getValidationAlgorithmInstances().catch(() => [])
    ]);
    T(Array.isArray(h) ? h : []), p(Array.isArray(V) ? V : []), P(Array.isArray(J) ? J : []);
  }
  Ae(() => {
    L().finally(() => M(!1));
  }, [a]);
  function te() {
    x({ code: "", label: "", allowedRootNodeTypes: "", acceptedFormats: "", importContextAlgorithmInstanceId: "", nodeValidationAlgorithmInstanceId: "" }), W({ kind: "create" });
  }
  function s(h) {
    x({
      code: h.code,
      label: h.label,
      allowedRootNodeTypes: h.allowedRootNodeTypes || "",
      acceptedFormats: h.acceptedFormats || "",
      importContextAlgorithmInstanceId: h.importContextAlgorithmInstanceId || "",
      nodeValidationAlgorithmInstanceId: h.nodeValidationAlgorithmInstanceId || ""
    }), W({ kind: "edit", original: h });
  }
  function R() {
    W(null), x({});
  }
  function d(h) {
    return h.name || h.instanceName || h.algorithmCode || h.instanceId || h.id || "?";
  }
  function g(h) {
    return h.instanceId || h.id;
  }
  async function N() {
    var h, V, J, se;
    ae(!0);
    try {
      const m = {
        code: (h = c.code) == null ? void 0 : h.trim(),
        label: (V = c.label) == null ? void 0 : V.trim(),
        allowedRootNodeTypes: ((J = c.allowedRootNodeTypes) == null ? void 0 : J.trim()) || null,
        acceptedFormats: ((se = c.acceptedFormats) == null ? void 0 : se.trim()) || null,
        importContextAlgorithmInstanceId: c.importContextAlgorithmInstanceId || null,
        nodeValidationAlgorithmInstanceId: c.nodeValidationAlgorithmInstanceId || null
      };
      v.kind === "create" ? (await f.createImportContext(m), l("Import context created", "success")) : (await f.updateImportContext(v.original.id, m), l("Import context updated", "success")), R(), await L();
    } catch (m) {
      l(m, "error");
    } finally {
      ae(!1);
    }
  }
  async function u(h) {
    if (window.confirm(`Delete import context "${h.label}" (${h.code})?`))
      try {
        await f.deleteImportContext(h.id), l("Import context deleted", "success"), await L();
      } catch (V) {
        l(V, "error");
      }
  }
  function A(h, V) {
    if (!V) return "—";
    const J = h.find((se) => g(se) === V);
    return J ? d(J) : V;
  }
  return G ? /* @__PURE__ */ e("div", { style: { padding: 16, color: "var(--muted)" }, children: "Loading…" }) : /* @__PURE__ */ n("div", { style: { padding: "0 16px 24px" }, children: [
    /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }, children: [
      /* @__PURE__ */ n("div", { style: { flex: 1, fontSize: 12, color: "var(--muted)" }, children: [
        "Import contexts bind a logical code to algorithm instances for CAD file processing (cad-api) and node validation (psm-api). The built-in",
        " ",
        /* @__PURE__ */ e("span", { className: "settings-badge", children: "default" }),
        " context uses service-level default algorithms when no specific context is requested."
      ] }),
      t && /* @__PURE__ */ n("button", { className: "btn btn-primary btn-sm", onClick: te, children: [
        /* @__PURE__ */ e(be, { size: 11, strokeWidth: 2 }),
        " Add Context"
      ] })
    ] }),
    /* @__PURE__ */ n("table", { className: "settings-table", children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
        /* @__PURE__ */ e("th", { style: { width: 140 }, children: "Code" }),
        /* @__PURE__ */ e("th", { children: "Label" }),
        /* @__PURE__ */ e("th", { children: "Import algorithm" }),
        /* @__PURE__ */ e("th", { children: "Validation algorithm" }),
        /* @__PURE__ */ e("th", { style: { width: 90 } })
      ] }) }),
      /* @__PURE__ */ e("tbody", { children: y.map((h) => /* @__PURE__ */ n("tr", { children: [
        /* @__PURE__ */ n("td", { className: "settings-td-mono", children: [
          h.code,
          h.code === "default" && /* @__PURE__ */ e("span", { className: "settings-badge", style: { marginLeft: 4 }, children: "built-in" })
        ] }),
        /* @__PURE__ */ e("td", { children: h.label }),
        /* @__PURE__ */ e("td", { style: { fontSize: 12, color: "var(--muted)" }, children: A(S, h.importContextAlgorithmInstanceId) }),
        /* @__PURE__ */ e("td", { style: { fontSize: 12, color: "var(--muted)" }, children: A(C, h.nodeValidationAlgorithmInstanceId) }),
        /* @__PURE__ */ e("td", { style: { textAlign: "right", whiteSpace: "nowrap" }, children: t && /* @__PURE__ */ n(re, { children: [
          /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Edit", onClick: () => s(h), children: /* @__PURE__ */ e(ye, { size: 12, strokeWidth: 2, color: "var(--accent)" }) }),
          h.code !== "default" && /* @__PURE__ */ e("button", { className: "panel-icon-btn", title: "Delete", onClick: () => u(h), style: { marginLeft: 4 }, children: /* @__PURE__ */ e(ce, { size: 12, strokeWidth: 2, color: "var(--danger)" }) })
        ] }) })
      ] }, h.id)) })
    ] }),
    v && /* @__PURE__ */ n(
      Re,
      {
        title: v.kind === "create" ? "New Import Context" : `Edit ${v.original.label}`,
        onClose: R,
        onSave: N,
        saving: H || !c.label || v.kind === "create" && !c.code,
        children: [
          /* @__PURE__ */ e(I, { label: "Code", children: /* @__PURE__ */ e(
            "input",
            {
              className: "field-input",
              value: c.code || "",
              disabled: v.kind === "edit",
              onChange: (h) => x((V) => ({ ...V, code: h.target.value })),
              placeholder: "e.g. catia-v5-mech"
            }
          ) }),
          /* @__PURE__ */ e(I, { label: "Label", children: /* @__PURE__ */ e("input", { className: "field-input", value: c.label || "", onChange: (h) => x((V) => ({ ...V, label: h.target.value })) }) }),
          /* @__PURE__ */ e(I, { label: "Accepted formats", children: /* @__PURE__ */ e("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }, children: ft.map((h) => {
            const V = c.acceptedFormats || "", J = V.includes(`"${h}"`);
            function se() {
              let m = [];
              try {
                m = JSON.parse(V || "[]");
              } catch {
                m = [];
              }
              m = J ? m.filter((F) => F !== h) : [...m, h], x((F) => ({ ...F, acceptedFormats: m.length ? JSON.stringify(m) : "" }));
            }
            return /* @__PURE__ */ n("label", { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" }, children: [
              /* @__PURE__ */ e("input", { type: "checkbox", checked: J, onChange: se }),
              h
            ] }, h);
          }) }) }),
          /* @__PURE__ */ e(I, { label: "Import algorithm instance", children: /* @__PURE__ */ n(
            "select",
            {
              className: "field-input",
              value: c.importContextAlgorithmInstanceId || "",
              onChange: (h) => x((V) => ({ ...V, importContextAlgorithmInstanceId: h.target.value })),
              children: [
                /* @__PURE__ */ e("option", { value: "", children: "— none (use default) —" }),
                S.map((h) => /* @__PURE__ */ e("option", { value: g(h), children: d(h) }, g(h)))
              ]
            }
          ) }),
          /* @__PURE__ */ e(I, { label: "Node validation algorithm instance", children: /* @__PURE__ */ n(
            "select",
            {
              className: "field-input",
              value: c.nodeValidationAlgorithmInstanceId || "",
              onChange: (h) => x((V) => ({ ...V, nodeValidationAlgorithmInstanceId: h.target.value })),
              children: [
                /* @__PURE__ */ e("option", { value: "", children: "— none (use default) —" }),
                C.map((h) => /* @__PURE__ */ e("option", { value: g(h), children: d(h) }, g(h)))
              ]
            }
          ) })
        ]
      }
    )
  ] });
}
const Ot = {
  id: "psa-settings",
  zone: "settings",
  init(a) {
    var t, l;
    qe = a.useWsEvent ?? (() => {
    }), lt = ((t = a.components) == null ? void 0 : t.LifecycleDiagram) ?? null, Ve = ((l = a.icons) == null ? void 0 : l.NODE_ICONS) ?? {}, rt = Object.keys(Ve), dt = (y, T, S) => a.http.serviceRequest("pno", y, T, S), Qe = (y, T, S) => a.http.serviceRequest("platform", y, T, S), mt(a);
  },
  sections: {
    "node-types": At,
    domains: xt,
    enums: wt,
    lifecycles: kt,
    sources: _t,
    "import-contexts": Lt
  }
};
export {
  xt as DomainsSection,
  wt as EnumsSection,
  At as NodeTypesSection,
  Ot as default
};
