import { jsx as t, jsxs as r } from "react/jsx-runtime";
import { useState as h, useEffect as f } from "react";
import { i as m, d as y } from "./dstApi-Dmlh36CO.js";
function g(i) {
  return i ? i < 1024 ? `${i} B` : i < 1024 * 1024 ? `${(i / 1024).toFixed(1)} KB` : i < 1024 * 1024 * 1024 ? `${(i / (1024 * 1024)).toFixed(1)} MB` : `${(i / (1024 * 1024 * 1024)).toFixed(2)} GB` : "0 B";
}
function S({ toast: i }) {
  var d, s;
  const [n, p] = h(null), [l, o] = h(!1);
  async function a() {
    o(!0);
    try {
      p(await y.getStats());
    } catch (e) {
      i((e == null ? void 0 : e.message) || String(e), "error");
    } finally {
      o(!1);
    }
  }
  return f(() => {
    a();
  }, []), l && !n ? /* @__PURE__ */ t("div", { style: { padding: 24, color: "var(--muted)", fontSize: 12 }, children: "Loading…" }) : n ? /* @__PURE__ */ r("div", { className: "settings-section", children: [
    /* @__PURE__ */ r("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }, children: [
      /* @__PURE__ */ t("h2", { style: { margin: 0 }, children: "Storage Statistics" }),
      /* @__PURE__ */ t("button", { className: "btn btn-xs", onClick: a, disabled: l, children: "Refresh" })
    ] }),
    /* @__PURE__ */ t("div", { style: { display: "flex", gap: 12, marginBottom: 20 }, children: [
      { v: n.totalFiles.toLocaleString(), l: "Total Files" },
      { v: g(n.totalSizeBytes), l: "Total Size" },
      { v: n.maxFileSize, l: "Max Upload" }
    ].map(({ v: e, l: c }) => /* @__PURE__ */ r("div", { style: {
      background: "var(--surface2)",
      borderRadius: 8,
      padding: "12px 18px",
      flex: 1
    }, children: [
      /* @__PURE__ */ t("div", { style: { fontSize: 22, fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }, children: e }),
      /* @__PURE__ */ t("div", { style: { fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginTop: 4 }, children: c })
    ] }, c)) }),
    /* @__PURE__ */ r("div", { style: { marginBottom: 20 }, children: [
      /* @__PURE__ */ t("div", { style: { fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }, children: "Storage Root" }),
      /* @__PURE__ */ t("code", { style: { fontSize: 12, color: "var(--text2)", background: "var(--surface2)", padding: "4px 8px", borderRadius: 4 }, children: n.storageRoot })
    ] }),
    ((d = n.perProjectSpace) == null ? void 0 : d.length) > 0 && /* @__PURE__ */ r("div", { style: { marginBottom: 20 }, children: [
      /* @__PURE__ */ t("div", { style: { fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }, children: "By Project Space" }),
      /* @__PURE__ */ r("table", { className: "settings-table", children: [
        /* @__PURE__ */ t("thead", { children: /* @__PURE__ */ r("tr", { children: [
          /* @__PURE__ */ t("th", { children: "Project Space" }),
          /* @__PURE__ */ t("th", { style: { textAlign: "right" }, children: "Files" }),
          /* @__PURE__ */ t("th", { style: { textAlign: "right" }, children: "Size" })
        ] }) }),
        /* @__PURE__ */ t("tbody", { children: n.perProjectSpace.map((e) => /* @__PURE__ */ r("tr", { children: [
          /* @__PURE__ */ t("td", { children: /* @__PURE__ */ t("code", { style: { fontSize: 11 }, children: e.projectSpaceId || "—" }) }),
          /* @__PURE__ */ t("td", { style: { textAlign: "right" }, children: e.fileCount.toLocaleString() }),
          /* @__PURE__ */ t("td", { style: { textAlign: "right" }, children: g(e.totalSizeBytes) })
        ] }, e.projectSpaceId)) })
      ] })
    ] }),
    ((s = n.perContentType) == null ? void 0 : s.length) > 0 && /* @__PURE__ */ r("div", { children: [
      /* @__PURE__ */ t("div", { style: { fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }, children: "By Content Type" }),
      /* @__PURE__ */ r("table", { className: "settings-table", children: [
        /* @__PURE__ */ t("thead", { children: /* @__PURE__ */ r("tr", { children: [
          /* @__PURE__ */ t("th", { children: "Content Type" }),
          /* @__PURE__ */ t("th", { style: { textAlign: "right" }, children: "Files" })
        ] }) }),
        /* @__PURE__ */ t("tbody", { children: n.perContentType.map((e) => /* @__PURE__ */ r("tr", { children: [
          /* @__PURE__ */ t("td", { children: /* @__PURE__ */ t("code", { style: { fontSize: 11 }, children: e.contentType || "—" }) }),
          /* @__PURE__ */ t("td", { style: { textAlign: "right" }, children: e.fileCount.toLocaleString() })
        ] }, e.contentType || "unknown")) })
      ] })
    ] })
  ] }) : null;
}
const B = {
  id: "dst-settings",
  zone: "settings",
  init(i) {
    m(i);
  },
  sections: {
    "dst-stats": S
  }
};
export {
  B as default
};
