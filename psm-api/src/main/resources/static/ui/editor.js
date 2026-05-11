import { jsx as e, jsxs as n, Fragment as St } from "react/jsx-runtime";
import { useState as N, useCallback as Oe, useEffect as W, useRef as Re, useMemo as Xt, Fragment as vt } from "react";
import Jt from "react-dom";
import { p as K, i as Ua } from "./psmApi-Br1g6HiW.js";
function Ya({
  shellAPI: k,
  nodeId: h,
  userId: o,
  filterVersionId: E,
  onClose: D
}) {
  const { api: x, useWebSocket: S } = k, [L, C] = N([]), $ = Oe(async () => {
    if (h)
      try {
        const A = await x.getSignatureHistory(o, h);
        C(Array.isArray(A) ? A : []);
      } catch {
      }
  }, [h, o]);
  W(() => {
    $();
  }, [$]), S(
    h ? `/topic/nodes/${h}` : null,
    (A) => {
      A.nodeId && A.nodeId !== h || A.event === "SIGNED" && $();
    },
    o
  );
  const B = E ? L.filter((A) => (A.node_version_id || A.NODE_VERSION_ID) === E) : L, M = [], P = {};
  return B.forEach((A) => {
    const w = A.revision || A.REVISION || "", O = A.iteration ?? A.ITERATION ?? 0, c = `${w}.${O}`;
    P[c] || (P[c] = { key: c, revision: w, iteration: O, items: [] }, M.push(P[c])), P[c].items.push(A);
  }), /* @__PURE__ */ e("div", { className: "signature-modal-overlay", onClick: D, children: /* @__PURE__ */ n("div", { className: "signature-modal", onClick: (A) => A.stopPropagation(), children: [
    /* @__PURE__ */ n("div", { className: "signature-modal-header", children: [
      /* @__PURE__ */ n("span", { children: [
        "Signatures",
        B.length > 0 && /* @__PURE__ */ e("span", { className: "comment-count-badge", children: B.length })
      ] }),
      /* @__PURE__ */ e("button", { className: "comment-close-btn", onClick: D, title: "Close", children: "✕" })
    ] }),
    /* @__PURE__ */ e("div", { className: "signature-modal-body", children: M.length === 0 ? /* @__PURE__ */ e("div", { className: "comment-empty", children: "No signatures on this version" }) : M.map((A) => /* @__PURE__ */ n("div", { className: "sig-group", children: [
      /* @__PURE__ */ n("div", { className: "sig-group-header", children: [
        "Rev ",
        A.iteration === 0 ? A.revision : `${A.revision}.${A.iteration}`
      ] }),
      A.items.map((w, O) => {
        const c = w.meaning || w.MEANING || "", re = w.signed_by || w.SIGNED_BY || w.signedBy || "", pe = w.comment || w.COMMENT || "", J = w.signed_at || w.SIGNED_AT || w.signedAt || "", fe = J ? new Date(J).toLocaleString(void 0, { dateStyle: "short", timeStyle: "short" }) : "";
        return /* @__PURE__ */ n("div", { className: "sig-entry", children: [
          /* @__PURE__ */ e("span", { className: `sig-meaning-badge ${c === "Rejected" ? "sig-rejected" : "sig-approved"}`, children: c }),
          /* @__PURE__ */ e("span", { className: "sig-by", children: re }),
          pe && /* @__PURE__ */ e("span", { className: "sig-comment-text", children: pe }),
          /* @__PURE__ */ e("span", { className: "sig-date", children: fe })
        ] }, O);
      })
    ] }, A.key)) })
  ] }) });
}
function Ha(k) {
  var E;
  const h = (((E = k.targetDetails) == null ? void 0 : E.contentType) || "").toLowerCase(), o = (k.displayKey || k.targetKey || "").toLowerCase();
  return h.includes("step") || h.includes("stp") || o.endsWith(".stp") || o.endsWith(".step") || o.endsWith(".p21");
}
function qa(k) {
  return { "st-draft": "Draft", "st-inreview": "In Review", "st-released": "Released", "st-frozen": "Frozen", "st-obsolete": "Obsolete" }[k] || k;
}
function Xa(k, h, o) {
  let E = k;
  for (; E; ) {
    if (E === h) return !0;
    const D = (o || []).find((x) => (x.id || x.ID) === E);
    E = D && (D.parent_node_type_id || D.PARENT_NODE_TYPE_ID) || null;
  }
  return !1;
}
function xe({ stateId: k, stateName: h, stateColorMap: o }) {
  const E = (o == null ? void 0 : o[k]) || "#6b7280";
  return /* @__PURE__ */ n("span", { className: "pill", style: { color: E, background: `${E}18`, border: `1px solid ${E}30` }, children: [
    /* @__PURE__ */ e("span", { className: "pill-dot", style: { background: E } }),
    h || qa(k)
  ] });
}
function Ja(k, h) {
  const o = new Array(16);
  for (let E = 0; E < 4; E++)
    for (let D = 0; D < 4; D++) {
      let x = 0;
      for (let S = 0; S < 4; S++) x += k[E * 4 + S] * h[S * 4 + D];
      o[E * 4 + D] = x;
    }
  return o;
}
async function ya(k, h, o, E, D, x, S, L, C, $, B = null, M = null) {
  if (S > L) return [];
  if (S === 0 && B === null && C.has(o)) return [];
  S === 0 && B === null && C.add(o);
  const P = x.filter((w) => w.targetSourceCode === "DATA_LOCAL" && Ha(w)).map((w) => {
    var O;
    return {
      uuid: w.targetKey,
      fileName: w.displayKey || w.targetKey,
      sizeBytes: (O = w.targetDetails) == null ? void 0 : O.sizeBytes,
      instanceKey: B ? `${w.targetKey}#${B}` : w.targetKey,
      matrix: M
    };
  }), A = [];
  if (P.length > 0 && A.push({ nodeId: o, nodeLabel: E, stateColor: D, depth: S, parts: P, instanceId: B || o }), S < L) {
    const w = x.filter((O) => O.targetSourceCode === "SELF" && O.targetNodeId);
    await Promise.all(w.map(async (O) => {
      var re;
      const c = O.linkId;
      if (!(!c || C.has(c))) {
        C.add(c);
        try {
          const pe = (re = (O.linkAttributeValues || []).find((ge) => ge.attributeId === "position")) == null ? void 0 : re.value;
          let J = null;
          if (pe) {
            const ge = pe.split(",").map(Number);
            ge.length === 16 && ge.every((Et) => !isNaN(Et)) && (J = ge);
          }
          let fe = null;
          M && J ? fe = Ja(M, J) : J ? fe = J : M && (fe = M);
          const Y = await k.getChildLinks(null, O.targetNodeId), kt = ($ == null ? void 0 : $[O.targetState]) || "#6b7280", De = await ya(
            k,
            h,
            O.targetNodeId,
            O.targetLogicalId || O.targetNodeId,
            kt,
            Array.isArray(Y) ? Y : [],
            S + 1,
            L,
            new Set(C),
            $,
            c,
            fe
          );
          A.push(...De);
        } catch {
        }
      }
    }));
  }
  return A;
}
function Qa({ jobData: k, onClose: h }) {
  const { job: o, results: E = [] } = k, D = o.status === "DONE" || o.status === "FAILED", x = E.reduce((L, C) => (L[C.action] = (L[C.action] || 0) + 1, L), {}), S = (L) => L === "CREATED" ? "var(--success)" : L === "UPDATED" ? "var(--accent)" : L === "REJECTED" ? "var(--danger)" : "var(--muted)";
  return /* @__PURE__ */ n(St, { children: [
    /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }, children: [
      /* @__PURE__ */ e("span", { style: { fontSize: 18 }, children: o.status === "DONE" ? "✓" : o.status === "FAILED" ? "✕" : "⏳" }),
      /* @__PURE__ */ n("span", { style: { fontWeight: 600, color: o.status === "FAILED" ? "var(--danger)" : o.status === "DONE" ? o.errorSummary ? "var(--warning, #f5a623)" : "var(--success)" : void 0 }, children: [
        o.status === "PENDING" && "Queued…",
        o.status === "RUNNING" && "Processing…",
        o.status === "DONE" && `Complete — ${E.length} node${E.length !== 1 ? "s" : ""}${o.errorSummary ? " (with warnings)" : ""}`,
        o.status === "FAILED" && `Failed: ${o.errorSummary || "unknown error"}`
      ] })
    ] }),
    o.status === "DONE" && o.errorSummary && /* @__PURE__ */ e("div", { style: { marginBottom: 12, padding: "8px 10px", background: "var(--warning-bg, #fff8e1)", border: "1px solid var(--warning, #f5a623)", borderRadius: 6, fontSize: 12, color: "var(--warning-text, #7a4f00)", whiteSpace: "pre-wrap" }, children: o.errorSummary }),
    Object.keys(x).length > 0 && /* @__PURE__ */ e("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }, children: Object.entries(x).map(([L, C]) => /* @__PURE__ */ n("span", { style: { fontSize: 12, padding: "2px 8px", borderRadius: 4, border: `1px solid ${S(L)}40`, color: S(L) }, children: [
      L,
      ": ",
      C
    ] }, L)) }),
    E.length > 0 && /* @__PURE__ */ e("div", { style: { maxHeight: 240, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 6, marginBottom: 16 }, children: /* @__PURE__ */ n("table", { style: { width: "100%", fontSize: 12, borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { style: { background: "var(--surface)", position: "sticky", top: 0 }, children: [
        /* @__PURE__ */ e("th", { style: { padding: "6px 10px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }, children: "Name" }),
        /* @__PURE__ */ e("th", { style: { padding: "6px 10px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }, children: "Type" }),
        /* @__PURE__ */ e("th", { style: { padding: "6px 10px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }, children: "Result" })
      ] }) }),
      /* @__PURE__ */ e("tbody", { children: E.map((L, C) => /* @__PURE__ */ n("tr", { style: { borderTop: C > 0 ? "1px solid var(--border)" : void 0 }, children: [
        /* @__PURE__ */ e("td", { style: { padding: "5px 10px" }, children: L.name }),
        /* @__PURE__ */ e("td", { style: { padding: "5px 10px", color: "var(--muted)", fontSize: 11 }, children: L.type }),
        /* @__PURE__ */ e("td", { style: { padding: "5px 10px" }, children: /* @__PURE__ */ n("span", { style: { color: S(L.action), fontSize: 11 }, children: [
          L.action,
          L.errorMessage ? ` — ${L.errorMessage}` : ""
        ] }) })
      ] }, L.id || C)) })
    ] }) }),
    /* @__PURE__ */ e("div", { style: { display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ e("button", { className: "btn btn-sm", onClick: h, children: D ? "Close" : "Dismiss (job continues in background)" }) })
  ] });
}
function Za({
  shellAPI: k,
  nodeId: h,
  userId: o,
  tx: E,
  nodeTypes: D,
  stateColorMap: x,
  activeSubTab: S,
  onSubTabChange: L,
  toast: C,
  onAutoOpenTx: $,
  onDescriptionLoaded: B,
  onRefreshItemData: M,
  itemData: P,
  onOpenCommentsForVersion: A,
  onCommentAttribute: w,
  onNavigate: O,
  onRegisterPreview: c
}) {
  var _n, Rn, On, Dn, Vn, Pn, zn, $n, Bn, Mn, Fn, Kn, Wn, jn, Gn, Un, Yn, Hn, qn, Xn, Jn, Qn, Zn, ea, ta, na, aa, ia, la, sa, ra, oa, da, ca, ha, ma, ua, pa;
  const {
    usePlmStore: re,
    useWebSocket: pe,
    api: J,
    txApi: fe,
    authoringApi: Y,
    pollJobStatus: kt,
    getDraggedNode: De,
    clearDraggedNode: ge,
    getLinkRowForSource: Et,
    icons: { NODE_ICONS: ba, SignIcon: va },
    components: { LifecycleDiagram: Sa }
  } = k, [Ve, Qt] = N([]), [ka, xt] = N({}), [oe, Pe] = N({}), [Q, ze] = N([]), [Ea, It] = N(!1), [Tt, Ie] = N(null), [Te, de] = N(null), [Ze, ce] = N({}), [Ce, et] = N(null), [Zt, tt] = N(null), H = Re(null), [nt, Ct] = N(null), [xa, At] = N(!1), [$e, at] = N([]), [wt, it] = N([]), [ye, Ne] = N(!1), [Be, lt] = N(!1), [Lt, en] = N([]), [Ia, tn] = N({}), [be, st] = N(""), [Me, Ae] = N(""), [Fe, Ke] = N([]), [_t, Z] = N(-1), [nn, ne] = N(!1), [ve, We] = N(""), [an, Rt] = N(!1), [Ta, je] = N(null), [ln, Ot] = N(""), [we, ae] = N(""), [Dt, rt] = N({}), [q, ot] = N([]), [dt, U] = N(!1), [he, j] = N(-1), [Ca, Ge] = N(null), [sn, Vt] = N(null), [Aa, rn] = N(null), [on, Ue] = N(!1), [dn, cn] = N([]), [hn, Pt] = N(!1), [ct, ht] = N(null), [mn, mt] = N(!1), [Se, ut] = N(null), [X, pt] = N(null), [ke, Ye] = N(null), [wa, zt] = N(!1), [un, $t] = N(null), [La, pn] = N({}), [fn, gn] = N(!0), Bt = Re(null), Mt = Re(null), He = Re(0), Ft = Re(null), ft = Re(!1), [I, yn] = N(() => (P == null ? void 0 : P.data) ?? null);
  W(() => {
    P != null && P.data && yn(P.data);
  }, [P]);
  const gt = Oe(() => {
    M && M(h);
  }, [h, M]), _a = Oe((t) => {
    yn((a) => {
      if (!a) return a;
      const l = (a.fields || []).map(
        (s) => t[s.name] !== void 0 ? { ...s, value: t[s.name] } : s
      );
      return { ...a, fields: l };
    });
  }, []), Nn = re((t) => t.refreshAll), Ra = re((t) => t.refreshNodes), yt = re((t) => t.refreshTx);
  W(() => {
    ze([]);
  }, [h]);
  const Oa = (_n = I == null ? void 0 : I.metadata) == null ? void 0 : _n.currentVersionId;
  W(() => {
    var t;
    (t = I == null ? void 0 : I.metadata) != null && t.violations && ze(I.metadata.violations);
  }, [Oa]), W(() => {
    gn(Q.length > 1);
  }, [Q.length]);
  const Da = Xt(
    () => Object.fromEntries(Q.filter((t) => t.attrCode).map((t) => [t.attrCode, t])),
    [Q]
  );
  W(() => {
    Kt();
  }, [h]), W(() => {
    var s, r;
    if (!ye) return;
    let t = !1;
    Pt(!0);
    const a = ((s = I == null ? void 0 : I.metadata) == null ? void 0 : s.logicalId) || (I == null ? void 0 : I.title) || h, l = (x == null ? void 0 : x[(r = I == null ? void 0 : I.metadata) == null ? void 0 : r.state]) || "#6b7280";
    return ya(K, o, h, a, l, $e, 0, 3, /* @__PURE__ */ new Set(), x, null, null).then((d) => {
      t || (ft.current = !0, cn(d), Pt(!1));
    }).catch(() => {
      t || (ft.current = !0, Pt(!1));
    }), () => {
      t = !0;
    };
  }, [ye, $e, (Rn = I == null ? void 0 : I.metadata) == null ? void 0 : Rn.state]), W(() => {
    ft.current && (c == null || c({ nodes: dn, loading: hn }));
  }, [dn, hn]);
  const ie = (E == null ? void 0 : E.ID) || (E == null ? void 0 : E.id) || null;
  W(() => {
    I && B && B(I);
  }, [I]), W(() => {
    Qt([]), xt({}), Pe({}), It(!1), Ie(null), de(null), ce({}), tt(null), H.current && (clearInterval(H.current), H.current = null), Ct(null), At(!1), lt(!1), en([]), tn({}), st(""), Ae(""), Ke([]), Z(-1), ne(!1), We(""), Rt(!1), je(null), Ot(""), ae(""), rt({}), ot([]), U(!1), j(-1), Ge(null), Vt(null), rn(null), Ue(!1), ht(null), mt(!1), ut(null), zt(!1), $t(null), pn({}), ft.current = !1, cn([]), c == null || c({ nodes: [], loading: !0 });
  }, [h]);
  const qe = Oe(async () => {
    try {
      const [t, a, l] = await Promise.all([
        K.getVersionHistory(o, h).catch(() => []),
        K.getComments(o, h).catch(() => []),
        K.getSignatureHistory(o, h).catch(() => [])
      ]);
      Qt(Array.isArray(t) ? t : []);
      const s = {};
      Array.isArray(l) && l.forEach((d) => {
        const p = d.node_version_id || d.NODE_VERSION_ID;
        p && (s[p] || (s[p] = { count: 0, hasRejected: !1 }), s[p].count += 1, (d.meaning || d.MEANING || "").toUpperCase() === "REJECTED" && (s[p].hasRejected = !0));
      }), pn(s);
      const r = {};
      Array.isArray(a) && a.forEach((d) => {
        const p = d.versionId;
        p && (r[p] = (r[p] || 0) + 1);
      }), xt(r), Pe({}), await gt();
    } catch (t) {
      C(t, "error");
    }
  }, [h, o, gt, C]);
  W(() => {
    qe();
  }, [qe]);
  const Va = Oe(async () => {
    try {
      const t = await K.getComments(o, h).catch(() => []), a = {};
      Array.isArray(t) && t.forEach((l) => {
        const s = l.versionId;
        s && (a[s] = (a[s] || 0) + 1);
      }), xt(a);
    } catch {
    }
  }, [h, o]);
  W(() => {
    Ne(!1), at([]), it([]), pt(null), Ye(null);
  }, [h]);
  const Kt = Oe(async () => {
    if (!ye)
      try {
        const [t, a] = await Promise.all([
          K.getChildLinks(o, h).catch(() => []),
          K.getParentLinks(o, h).catch(() => [])
        ]);
        at(Array.isArray(t) ? t : []), it(Array.isArray(a) ? a : []), Ne(!0);
      } catch (t) {
        C(t, "error");
      }
  }, [h, o, ye, C]);
  W(() => {
    S === "pbs" && Kt();
  }, [S, Kt]), W(() => () => {
    clearTimeout(Bt.current), clearTimeout(Mt.current), H.current && clearInterval(H.current);
  }, []), W(() => {
    Be && Ft.current && Ft.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [Be]), pe(
    h ? `/topic/nodes/${h}` : null,
    (t) => {
      if (t.nodeId && t.nodeId !== h) return;
      ["STATE_CHANGED", "LOCK_ACQUIRED", "LOCK_RELEASED", "ITEM_UPDATED", "SIGNED"].includes(t.event) && (gt(), ["LOCK_RELEASED", "LOCK_ACQUIRED", "ITEM_UPDATED"].includes(t.event) && Ra()), t.event === "COMMENT_ADDED" && Va();
    },
    o
  );
  async function Pa(t) {
    const a = [...Ve].sort((r, d) => (r.version_number || r.VERSION_NUMBER) - (d.version_number || d.VERSION_NUMBER)), l = a.findIndex((r) => (r.version_number || r.VERSION_NUMBER) === t);
    if (l <= 0) return;
    const s = a[l - 1].version_number || a[l - 1].VERSION_NUMBER;
    At(!0);
    try {
      const r = await K.getVersionDiff(o, h, s, t);
      Ct({ data: r, v1Num: s, v2Num: t });
    } catch (r) {
      C(r, "error");
    } finally {
      At(!1);
    }
  }
  async function bn(t = null) {
    var a;
    st(""), Ae((t == null ? void 0 : t.logicalId) || ""), Ke([]), Z(-1), ne(!1), We("");
    try {
      const [l, s] = await Promise.all([
        J.getNodeTypeLinkTypes(o, (a = I == null ? void 0 : I.metadata) == null ? void 0 : a.nodeTypeId).catch(() => []),
        K.getSources(o).catch(() => [])
      ]);
      let r = Array.isArray(l) ? l : [];
      if (t != null && t.nodeTypeId) {
        const p = t.nodeTypeId;
        r = r.filter((b) => {
          const u = b.target_type || b.TARGET_TYPE;
          return !u || Xa(p, u, D);
        }), r.length === 1 && st(r[0].id || r[0].ID);
      }
      en(r);
      const d = {};
      (Array.isArray(s) ? s : []).forEach((p) => {
        d[p.id] = p;
      }), tn(d), lt(!0);
    } catch (l) {
      C(l, "error");
    }
  }
  async function vn(t, a, l) {
    try {
      const s = await K.getSourceKeys(o, t, a, l, 25);
      Ke(Array.isArray(s) ? s : []);
    } catch {
      Ke([]);
    }
  }
  async function Nt(t, a, l) {
    try {
      const s = await K.getSourceKeys(o, t, a, l, 25);
      ot(Array.isArray(s) ? s : []);
    } catch {
      ot([]);
    }
  }
  async function za() {
    var r;
    if (!be) return;
    const t = Lt.find((d) => (d.id || d.ID) === be), a = (t == null ? void 0 : t.target_source_id) || (t == null ? void 0 : t.TARGET_SOURCE_ID) || "SELF", l = (t == null ? void 0 : t.target_type) || (t == null ? void 0 : t.TARGET_TYPE) || null;
    if (!Me) return;
    const s = Me;
    Rt(!0);
    try {
      const d = ie || await $();
      if (!d) return;
      const p = (r = I.actions) == null ? void 0 : r.find((u) => u.code === "create_link");
      if (!p) throw new Error("create_link action not available for this node type");
      const b = {
        linkTypeId: be,
        targetSourceCode: a,
        ...l ? { targetType: l } : {},
        targetKey: s,
        linkLogicalId: ve || ""
      };
      await (p.path ? Y.executeViaDescriptor(p, h, o, d, b) : Y.executeAction(h, p.code, o, d, b)), C("Link created", "success"), lt(!1), We(""), Ae(""), Ke([]), Z(-1), ne(!1), Ne(!1), await yt(), await qe();
    } catch (d) {
      C(d, "error");
    } finally {
      Rt(!1);
    }
  }
  async function $a(t, a, l, s) {
    var d;
    const r = (d = I.actions) == null ? void 0 : d.find((p) => p.code === "update_link");
    if (r) {
      Ue(!0);
      try {
        const p = ie || await $();
        if (!p) return;
        const b = {};
        s && Object.entries(s).forEach(([v, g]) => {
          b[`linkAttr_${v}`] = g;
        });
        const u = { linkId: t, logicalId: a, ...l ? { targetKey: l } : {}, ...b };
        await (r.path ? Y.executeViaDescriptor(r, h, o, p, u) : Y.executeAction(h, r.code, o, p, u)), je(null), await yt(), Ne(!1), await Promise.all([
          K.getChildLinks(o, h).then((v) => at(Array.isArray(v) ? v : [])),
          K.getParentLinks(o, h).then((v) => it(Array.isArray(v) ? v : []))
        ]), Ne(!0);
      } catch (p) {
        C(p, "error");
      } finally {
        Ue(!1);
      }
    }
  }
  async function Ba(t) {
    var l;
    const a = (l = I.actions) == null ? void 0 : l.find((s) => s.code === "delete_link");
    if (a) {
      Ue(!0), Ge(null);
      try {
        const s = ie || await $();
        if (!s) return;
        await (a.path ? Y.executeViaDescriptor(a, h, o, s, { linkId: t }) : Y.executeAction(h, a.code, o, s, { linkId: t })), Vt((r) => r === t ? null : r), await yt(), Ne(!1), await Promise.all([
          K.getChildLinks(o, h).then((r) => at(Array.isArray(r) ? r : [])),
          K.getParentLinks(o, h).then((r) => it(Array.isArray(r) ? r : []))
        ]), Ne(!0);
      } catch (s) {
        C(s, "error");
      } finally {
        Ue(!1);
      }
    }
  }
  async function Sn(t, a = {}) {
    var s;
    const l = t.bodyShape === "MULTIPART";
    l || de(null), It(!0), l && et(0);
    try {
      const r = l ? (p) => et(p) : void 0, d = t.path ? await Y.executeViaDescriptor(t, h, o, ie, a, r) : await Y.executeAction(
        h,
        t.code,
        o,
        ie,
        a,
        (s = t.metadata) == null ? void 0 : s.transitionId
      );
      if (l && (de(null), et(null)), d != null && d.jobId && t.jobStatusPath) {
        const p = t.jobStatusPath.replace("{jobId}", d.jobId);
        tt({ id: d.jobId, data: { job: { id: d.jobId, status: d.status || "PENDING" }, results: [] } }), H.current && clearInterval(H.current), H.current = setInterval(async () => {
          var b, u, v;
          try {
            const g = await kt("psm", p);
            tt((T) => T ? { ...T, data: g } : null), (((b = g.job) == null ? void 0 : b.status) === "DONE" || ((u = g.job) == null ? void 0 : u.status) === "FAILED") && (clearInterval(H.current), H.current = null, ((v = g.job) == null ? void 0 : v.status) === "DONE" && (await Nn(), await qe()));
          } catch {
          }
        }, 2e3);
        return;
      }
      (d == null ? void 0 : d.violations) !== void 0 && ze(d.violations), d != null && d.message && C(d.message, "success"), await Nn(), await qe();
    } catch (r) {
      de(null), et(null), C(r, "error");
    } finally {
      It(!1);
    }
  }
  function Wt(t) {
    var l;
    const a = (t.parameters || []).filter((s) => s.widget);
    if (a.length > 0) {
      const s = {};
      a.forEach((r) => {
        r.defaultValue && (s[r.name] = r.defaultValue);
      }), ce(s), de(t);
    } else ((l = t.metadata) == null ? void 0 : l.displayCategory) === "DANGEROUS" ? (ce({}), de(t)) : Sn(t);
  }
  async function Ma(t, a, l) {
    var r;
    Ie("saving");
    const s = { ...t, _description: "Auto-save" };
    try {
      const d = await (l != null && l.path ? Y.executeViaDescriptor(l, h, o, a, s) : Y.executeAction(h, (l == null ? void 0 : l.code) ?? l, o, a, s));
      _a(t), Pe({}), ze((d == null ? void 0 : d.violations) || []), Ie("saved"), clearTimeout(Mt.current), Mt.current = setTimeout(() => Ie(null), 2e3), yt();
    } catch (d) {
      Ie(null);
      const p = (r = d.detail) == null ? void 0 : r.violations;
      p != null && p.length ? ze(p) : C(d, "error");
    }
  }
  function kn(t, a, l) {
    clearTimeout(Bt.current), Ie(null), Bt.current = setTimeout(() => Ma(t, a, l), 800);
  }
  W(() => {
    !X || !h || !o || (zt(!0), K.getNodeDescription(o, h, null, X).then((t) => Ye(t)).catch((t) => C(t, "error")).finally(() => zt(!1)));
  }, [X, h, o]);
  const m = X && ke ? ke : I, ee = Xt(() => {
    var r;
    const t = [], a = /* @__PURE__ */ new Map(), l = ((r = m == null ? void 0 : m.metadata) == null ? void 0 : r.attributeMeta) || {};
    ((m == null ? void 0 : m.fields) || []).forEach((d) => {
      const p = l[d.name] || {}, b = {
        ...d,
        id: d.name,
        // renderAttrField uses attr.id for edits map keys and React keys
        tooltip: d.hint,
        // renderAttrField uses attr.tooltip
        ...p
        // required, displayOrder, section, namingRegex, allowedValues, sourceDomainId, sourceDomainName
      };
      b.sourceDomainId ? (a.has(b.sourceDomainId) || a.set(b.sourceDomainId, {
        id: b.sourceDomainId,
        name: b.sourceDomainName || b.sourceDomainId,
        attrs: []
      }), a.get(b.sourceDomainId).attrs.push(b)) : t.push(b);
    });
    const s = Array.from(a.values()).sort((d, p) => d.name.localeCompare(p.name));
    return { base: t, domains: s };
  }, [m == null ? void 0 : m.fields, (On = m == null ? void 0 : m.metadata) == null ? void 0 : On.attributeMeta]);
  Xt(() => ee.base.reduce((t, a) => {
    const l = a.section || "General";
    return t[l] || (t[l] = []), t[l].push(a), t;
  }, {}), [ee.base]);
  const [En, jt] = N(null);
  if (W(() => {
    const t = ee.domains;
    if (t.length === 0) {
      jt(null);
      return;
    }
    jt((a) => a && t.some((l) => l.id === a) ? a : t[0].id);
  }, [ee.domains]), !I) return /* @__PURE__ */ n("div", { className: "empty", style: { padding: "60px 24px" }, children: [
    /* @__PURE__ */ e("div", { className: "empty-icon", children: "◎" }),
    /* @__PURE__ */ e("div", { className: "empty-text", children: "Loading…" })
  ] });
  const bt = ((Dn = m == null ? void 0 : m.metadata) == null ? void 0 : Dn.txStatus) === "OPEN", Xe = (m == null ? void 0 : m.actions) || [];
  (Vn = m == null ? void 0 : m.metadata) == null || Vn.fingerprintChanged;
  const Fa = /* @__PURE__ */ new Set(["update_node", "create_link", "update_link", "delete_link", "read", "comment", "baseline", "manage_metamodel", "manage_roles", "manage_baselines"]), xn = Xe.find((t) => {
    var a;
    return t.code === "update_node" && ((a = t.metadata) == null ? void 0 : a.authorized) !== !1;
  }), In = Xe.filter(
    (t) => {
      var a, l, s;
      return ((a = t.metadata) == null ? void 0 : a.authorized) !== !1 && !Fa.has(t.code) && ((l = t.metadata) == null ? void 0 : l.displayCategory) !== "STRUCTURAL" && ((s = t.metadata) == null ? void 0 : s.displayCategory) !== "PROPERTY";
    }
  ), Gt = Xe.filter(
    (t) => {
      var a, l;
      return ((a = t.metadata) == null ? void 0 : a.authorized) !== !1 && ((l = t.metadata) == null ? void 0 : l.displayCategory) === "PROPERTY";
    }
  ), Tn = (t) => {
    var a;
    return ((a = t == null ? void 0 : t.guardViolations) == null ? void 0 : a.length) > 0;
  }, Cn = (t) => {
    const a = t == null ? void 0 : t.guardViolations;
    return a != null && a.length ? `Blocked:
• ` + a.map((l) => typeof l == "string" ? l : l.message || l.code).join(`
• `) : "";
  }, Ka = Xe.filter((t) => {
    var a;
    return (a = t.code) == null ? void 0 : a.startsWith("transition");
  }), Wa = new Map(
    Ka.filter((t) => {
      var a;
      return ((a = t.guardViolations) == null ? void 0 : a.length) > 0;
    }).map((t) => [t.label, t.guardViolations])
  ), An = In.filter((t) => {
    var a;
    return (a = t.code) == null ? void 0 : a.startsWith("transition");
  }), Le = (Pn = m == null ? void 0 : m.actions) == null ? void 0 : Pn.some((t) => t.code === "update_link"), Ee = (zn = m == null ? void 0 : m.actions) == null ? void 0 : zn.some((t) => t.code === "delete_link"), Ut = Xe.find((t) => t.code === "checkout"), Yt = Le || Ee || !!Ut;
  ($n = m == null ? void 0 : m.metadata) != null && $n.lifecycleId;
  const z = (Bn = m == null ? void 0 : m.metadata) != null && Bn.nodeTypeId ? (D || []).find((t) => (t.id || t.ID) === m.metadata.nodeTypeId) : null, le = (z == null ? void 0 : z.color) || (z == null ? void 0 : z.COLOR) || null, wn = (z == null ? void 0 : z.icon) || (z == null ? void 0 : z.ICON) || null, Ht = wn ? ba[wn] : null, Ln = (z == null ? void 0 : z.name) || (z == null ? void 0 : z.NAME) || null, ja = ((Mn = Ve.find(
    (t) => {
      var a;
      return (t.id || t.ID) === ((a = I == null ? void 0 : I.metadata) == null ? void 0 : a.currentVersionId);
    }
  )) == null ? void 0 : Mn.version_number) ?? null;
  return /* @__PURE__ */ n(
    "div",
    {
      style: { flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" },
      onClick: () => Se && ut(null),
      children: [
        Se && Jt.createPortal(
          /* @__PURE__ */ e(
            "div",
            {
              className: "attr-ctx-menu",
              style: { top: Se.y, left: Se.x },
              onClick: (t) => t.stopPropagation(),
              children: /* @__PURE__ */ n(
                "button",
                {
                  className: "attr-ctx-item",
                  onClick: () => {
                    w == null || w(Se.attrId, Se.attrLabel), ut(null);
                  },
                  children: [
                    "💬 Comment on ",
                    /* @__PURE__ */ n("code", { children: [
                      "#",
                      Se.attrId
                    ] })
                  ]
                }
              )
            }
          ),
          document.body
        ),
        /* @__PURE__ */ n("div", { className: "node-header", children: [
          /* @__PURE__ */ n("div", { className: "node-title-group", children: [
            /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
              (Ht || le || Ln) && /* @__PURE__ */ n("span", { style: {
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: le ? `${le}18` : "rgba(100,116,139,.1)",
                border: `1px solid ${le ? `${le}30` : "rgba(100,116,139,.2)"}`,
                borderRadius: 4,
                padding: "2px 7px",
                fontSize: 11,
                color: le || "var(--muted)",
                fontWeight: 600,
                letterSpacing: ".01em",
                flexShrink: 0
              }, children: [
                Ht ? /* @__PURE__ */ e(Ht, { size: 11, color: le || "var(--muted)", strokeWidth: 2 }) : le ? /* @__PURE__ */ e("span", { style: { width: 7, height: 7, borderRadius: 1, background: le, display: "inline-block" } }) : null,
                Ln
              ] }),
              /* @__PURE__ */ e("span", { className: "node-identity", children: ((Fn = m.metadata) == null ? void 0 : Fn.logicalId) || m.title }),
              m.subtitle && /* @__PURE__ */ e("span", { className: "node-display-name", children: m.subtitle }),
              /* @__PURE__ */ n("span", { style: {
                fontFamily: "var(--mono)",
                fontSize: 13,
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: 4,
                letterSpacing: ".01em",
                color: X ? "#92400e" : "var(--muted)",
                background: X ? "rgba(251,191,36,.25)" : "rgba(100,116,139,.1)",
                border: X ? "1px solid rgba(251,191,36,.5)" : "none"
              }, children: [
                X && "🕐 ",
                ((Kn = m.metadata) == null ? void 0 : Kn.iteration) === 0 ? (Wn = m.metadata) == null ? void 0 : Wn.revision : `${(jn = m.metadata) == null ? void 0 : jn.revision}.${(Gn = m.metadata) == null ? void 0 : Gn.iteration}`
              ] }),
              /* @__PURE__ */ e(xe, { stateId: (Un = m.metadata) == null ? void 0 : Un.state, stateName: (Yn = m.metadata) == null ? void 0 : Yn.stateName, stateColorMap: x }),
              !X && ((qn = (Hn = I.metadata) == null ? void 0 : Hn.lock) == null ? void 0 : qn.locked) && /* @__PURE__ */ n("span", { className: "pill", style: { color: "var(--muted)", background: "rgba(100,116,139,.1)", border: "1px solid rgba(100,116,139,.2)" }, children: [
                "🔒 ",
                (Jn = (Xn = I.metadata) == null ? void 0 : Xn.lock) == null ? void 0 : Jn.lockedBy
              ] })
            ] }),
            /* @__PURE__ */ n("div", { className: "node-meta", children: [
              bt && ((Zn = (Qn = m == null ? void 0 : m.metadata) == null ? void 0 : Qn.lock) == null ? void 0 : Zn.lockedBy) === o && /* @__PURE__ */ e("span", { className: "pill", style: { color: "var(--warn)", background: "rgba(232,169,71,.1)", border: "1px solid rgba(232,169,71,.25)" }, children: "✎ editing" }),
              bt && ((ta = (ea = m == null ? void 0 : m.metadata) == null ? void 0 : ea.lock) == null ? void 0 : ta.lockedBy) === o && /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--warn)", fontStyle: "italic", opacity: 0.85 }, children: "⚡ uncommitted changes" }),
              bt && ((aa = (na = m == null ? void 0 : m.metadata) == null ? void 0 : na.lock) == null ? void 0 : aa.lockedBy) && ((la = (ia = m == null ? void 0 : m.metadata) == null ? void 0 : ia.lock) == null ? void 0 : la.lockedBy) !== o && /* @__PURE__ */ n("span", { style: { fontSize: 11, color: "var(--accent)", fontStyle: "italic", opacity: 0.9 }, children: [
                "✎ in progress — being edited by ",
                (ra = (sa = m.metadata) == null ? void 0 : sa.lock) == null ? void 0 : ra.lockedBy
              ] }),
              Tt === "saving" && /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--muted)", fontStyle: "italic" }, children: "saving…" }),
              Tt === "saved" && Q.length === 0 && /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--success)" }, children: "✓ saved" }),
              Tt === "saved" && Q.length > 0 && /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--warn)" }, children: "⚠ saved with issues" })
            ] })
          ] }),
          /* @__PURE__ */ e("div", { className: "node-actions", children: In.map((t) => {
            var p, b, u;
            const a = Tn(t), l = a ? Cn(t) : t.description || t.label, s = (p = t.metadata) == null ? void 0 : p.displayColor, r = s ? "" : ((b = t.metadata) == null ? void 0 : b.displayCategory) === "DANGEROUS" ? "btn-danger" : ((u = t.metadata) == null ? void 0 : u.displayCategory) === "PRIMARY" ? "btn-success" : "", d = s ? { color: s, borderColor: `${s}60`, background: `${s}15` } : void 0;
            return /* @__PURE__ */ e(
              "button",
              {
                className: `btn btn-sm ${r}`,
                disabled: Ea || a,
                title: l,
                style: { ...d, ...a ? { opacity: 0.45, cursor: "not-allowed" } : {} },
                onClick: () => !a && Wt(t),
                children: a ? `✕ ${t.label}` : t.label
              },
              t.code
            );
          }) })
        ] }),
        Te && Jt.createPortal(
          /* @__PURE__ */ e("div", { style: {
            position: "fixed",
            inset: 0,
            zIndex: 2e3,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }, onClick: Ce === null ? () => de(null) : void 0, children: /* @__PURE__ */ n("div", { style: {
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "28px 32px",
            maxWidth: 440,
            width: "90%",
            boxShadow: "0 8px 32px rgba(0,0,0,.4)"
          }, onClick: (t) => t.stopPropagation(), children: [
            /* @__PURE__ */ e("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 16 }, children: Te.label }),
            Ce !== null && /* @__PURE__ */ n("div", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ n("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 6 }, children: [
                /* @__PURE__ */ e("span", { children: "Uploading…" }),
                /* @__PURE__ */ n("span", { children: [
                  Ce,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ e("div", { style: { height: 6, background: "var(--surface2)", borderRadius: 3, overflow: "hidden" }, children: /* @__PURE__ */ e("div", { style: { height: "100%", width: `${Ce}%`, background: "var(--accent)", borderRadius: 3, transition: "width 0.15s ease" } }) })
            ] }),
            (Te.parameters || []).filter((t) => t.widget).map((t) => {
              var s;
              const a = Ze[t.name] || "";
              let l = null;
              return ((s = t.options) == null ? void 0 : s.length) > 0 && (l = t.options), /* @__PURE__ */ n("div", { className: "field", style: { marginBottom: 14 }, children: [
                /* @__PURE__ */ n("label", { className: "field-label", children: [
                  t.label || t.name,
                  t.required && /* @__PURE__ */ e("span", { className: "field-req", children: "*" })
                ] }),
                t.widget === "FILE" ? /* @__PURE__ */ n(St, { children: [
                  /* @__PURE__ */ e(
                    "input",
                    {
                      type: "file",
                      style: { color: "var(--text)" },
                      onChange: (r) => ce((d) => {
                        var p;
                        return { ...d, [t.name]: ((p = r.target.files) == null ? void 0 : p[0]) || null };
                      })
                    }
                  ),
                  t.hint && /* @__PURE__ */ e("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 4 }, children: t.hint })
                ] }) : l ? /* @__PURE__ */ n(
                  "select",
                  {
                    className: "field-input",
                    value: a,
                    onChange: (r) => ce((d) => ({ ...d, [t.name]: r.target.value })),
                    children: [
                      !a && /* @__PURE__ */ e("option", { value: "", children: "—" }),
                      l.map((r) => {
                        const d = typeof r == "object" && r !== null ? r.value : r, p = typeof r == "object" && r !== null ? r.label : r;
                        return /* @__PURE__ */ e("option", { value: d, children: p }, d);
                      })
                    ]
                  }
                ) : t.widget === "TEXTAREA" ? /* @__PURE__ */ e(
                  "textarea",
                  {
                    className: "field-input",
                    rows: 3,
                    placeholder: t.hint || "",
                    value: a,
                    onChange: (r) => ce((d) => ({ ...d, [t.name]: r.target.value })),
                    style: { resize: "vertical" }
                  }
                ) : t.widget === "CHECKBOX" ? /* @__PURE__ */ n("label", { style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }, children: [
                  /* @__PURE__ */ e(
                    "input",
                    {
                      type: "checkbox",
                      checked: Ze[t.name] === "true",
                      onChange: (r) => ce((d) => ({ ...d, [t.name]: r.target.checked ? "true" : "false" }))
                    }
                  ),
                  t.hint && /* @__PURE__ */ e("span", { style: { fontSize: 12, color: "var(--muted)" }, children: t.hint })
                ] }) : /* @__PURE__ */ e(
                  "input",
                  {
                    className: "field-input",
                    placeholder: t.hint || "",
                    value: a,
                    onChange: (r) => ce((d) => ({ ...d, [t.name]: r.target.value }))
                  }
                )
              ] }, t.name);
            }),
            /* @__PURE__ */ n("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }, children: [
              /* @__PURE__ */ e("button", { className: "btn btn-sm", disabled: Ce !== null, onClick: () => de(null), children: "Cancel" }),
              /* @__PURE__ */ e(
                "button",
                {
                  className: "btn btn-sm btn-success",
                  disabled: Ce !== null || (Te.parameters || []).filter((t) => t.widget && t.required).some((t) => {
                    const a = Ze[t.name];
                    return t.widget === "FILE" ? !a : !String(a || "").trim();
                  }),
                  onClick: () => Sn(Te, Ze),
                  children: Te.label
                }
              )
            ] })
          ] }) }),
          document.body
        ),
        Zt && Jt.createPortal(
          /* @__PURE__ */ e("div", { style: { position: "fixed", inset: 0, zIndex: 2e3, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ n("div", { style: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "28px 32px", maxWidth: 560, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,.4)" }, children: [
            /* @__PURE__ */ e("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 16 }, children: "CAD Import" }),
            /* @__PURE__ */ e(Qa, { jobData: Zt.data, onClose: () => {
              H.current && clearInterval(H.current), tt(null);
            } })
          ] }) }),
          document.body
        ),
        Q.length > 0 && /* @__PURE__ */ n("div", { className: "violations-banner", children: [
          /* @__PURE__ */ n(
            "div",
            {
              className: "violations-banner-header",
              style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
              onClick: () => gn((t) => !t),
              children: [
                /* @__PURE__ */ e("span", { className: "violations-banner-title", children: "⚠ Will fail at commit" }),
                /* @__PURE__ */ n("span", { style: { fontSize: 11, opacity: 0.75 }, children: [
                  "(",
                  Q.length,
                  " issue",
                  Q.length > 1 ? "s" : "",
                  ")"
                ] }),
                /* @__PURE__ */ e("span", { style: { fontSize: 10, marginLeft: "auto", opacity: 0.6 }, children: fn ? "▾ show" : "▴ hide" })
              ]
            }
          ),
          !fn && /* @__PURE__ */ e("ul", { className: "violations-banner-list", children: Q.map((t, a) => /* @__PURE__ */ e("li", { children: typeof t == "string" ? t : t.message }, a)) })
        ] }),
        /* @__PURE__ */ e("div", { className: "subtabs", children: [
          { key: "attributes", label: "Properties" },
          { key: "pbs", label: "PBS", count: ye ? $e.length + wt.length : void 0 },
          { key: "history", label: "History", count: Ve.length }
        ].map(({ key: t, label: a, count: l }) => /* @__PURE__ */ n(
          "div",
          {
            className: `subtab ${S === t ? "active" : ""}`,
            onClick: () => L(t),
            children: [
              a,
              l > 0 && /* @__PURE__ */ e("span", { className: "subtab-badge", style: {
                background: "rgba(91,156,246,.15)",
                color: "var(--accent)"
              }, children: l })
            ]
          },
          t
        )) }),
        X && /* @__PURE__ */ n("div", { style: {
          background: "rgba(251,191,36,.1)",
          border: "1px solid rgba(251,191,36,.4)",
          borderRadius: 4,
          padding: "7px 12px",
          margin: "0 0 4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 12
        }, children: [
          /* @__PURE__ */ n("span", { style: { color: "#92400e" }, children: [
            "🕐 Historical view — Version ",
            X,
            ke && ` (${((oa = ke.metadata) == null ? void 0 : oa.iteration) === 0 ? (da = ke.metadata) == null ? void 0 : da.revision : `${(ca = ke.metadata) == null ? void 0 : ca.revision}.${(ha = ke.metadata) == null ? void 0 : ha.iteration}`})`,
            wa && " — loading…",
            " · read-only"
          ] }),
          /* @__PURE__ */ e("button", { className: "btn btn-sm", onClick: () => {
            pt(null), Ye(null);
          }, children: "← Back to latest" })
        ] }),
        /* @__PURE__ */ n("div", { style: { flex: 1, overflow: "auto", minHeight: 0, display: "flex", flexDirection: "column" }, children: [
          S === "attributes" && (() => {
            var p, b, u, v, g, T, G, F, me;
            const t = (i) => {
              const y = oe[i.id] !== void 0 ? oe[i.id] : i.value || "", f = i.editable && !!ie && bt, _ = i.allowedValues ? (() => {
                try {
                  return JSON.parse(i.allowedValues);
                } catch {
                  return [];
                }
              })() : null, R = _ ? _.map((V) => typeof V == "object" && V !== null ? { value: V.value, label: V.label || V.value } : { value: V, label: V }) : null, te = R ? R.map((V) => V.value) : null, Je = i.namingRegex ? (() => {
                try {
                  return new RegExp(i.namingRegex);
                } catch {
                  return null;
                }
              })() : null, se = (y || "").trim(), ue = !Je || !se ? null : Je.test(se), Ga = ue === !1, qt = i.required && oe[i.id] === "", fa = te && oe[i.id] != null && oe[i.id] !== "" && !te.includes(oe[i.id]), _e = Da[i.id], ga = _e && _e.code !== "NAMING_REGEX" && _e.code !== "ENUM_NOT_ALLOWED" && !(_e.code === "REQUIRED" && qt) ? _e : null;
              return /* @__PURE__ */ n(
                "div",
                {
                  className: "field",
                  onContextMenu: (V) => {
                    V.preventDefault(), ut({ attrId: i.id, attrLabel: i.label, x: V.clientX, y: V.clientY });
                  },
                  children: [
                    /* @__PURE__ */ n("label", { className: "field-label", children: [
                      i.label,
                      i.required && /* @__PURE__ */ e("span", { className: "field-req", children: "*" })
                    ] }),
                    R ? /* @__PURE__ */ n(
                      "select",
                      {
                        className: "field-input",
                        title: i.tooltip || void 0,
                        value: y,
                        disabled: !f,
                        onChange: (V) => {
                          if (!f) return;
                          const Qe = { ...oe, [i.id]: V.target.value };
                          Pe(Qe), kn(Qe, ie, xn);
                        },
                        children: [
                          /* @__PURE__ */ e("option", { value: "", children: "—" }),
                          R.map((V) => /* @__PURE__ */ e("option", { value: V.value, children: V.label }, V.value))
                        ]
                      }
                    ) : /* @__PURE__ */ n("div", { className: "logical-id-wrap", children: [
                      /* @__PURE__ */ e(
                        "input",
                        {
                          className: `field-input${qt || fa || Ga || _e ? " error" : ue === !0 ? " ok" : ""}`,
                          readOnly: !f,
                          title: i.tooltip || void 0,
                          placeholder: i.tooltip || (i.namingRegex ? `pattern: ${i.namingRegex}` : ""),
                          value: y,
                          onChange: (V) => {
                            if (!f) return;
                            const Qe = { ...oe, [i.id]: V.target.value };
                            Pe(Qe), kn(Qe, ie, xn);
                          }
                        }
                      ),
                      se && Je && /* @__PURE__ */ e("span", { className: `logical-id-badge ${ue ? "ok" : "err"}`, children: ue ? "✓" : "✗" })
                    ] }),
                    !R && i.namingRegex && /* @__PURE__ */ n("div", { className: "logical-id-hint", children: [
                      /* @__PURE__ */ e("span", { className: "logical-id-hint-label", children: "Pattern" }),
                      /* @__PURE__ */ e("code", { className: "logical-id-hint-code", children: i.namingRegex }),
                      !se && /* @__PURE__ */ e("span", { className: "logical-id-hint-idle", children: "start typing to validate" }),
                      se && ue === !1 && /* @__PURE__ */ e("span", { className: "logical-id-hint-err", children: "no match" }),
                      se && ue === !0 && /* @__PURE__ */ e("span", { className: "logical-id-hint-ok", children: "matches" })
                    ] }),
                    !i.namingRegex && i.tooltip && /* @__PURE__ */ e("span", { className: "field-hint", children: i.tooltip }),
                    qt && /* @__PURE__ */ e("span", { className: "field-hint error", children: "Required" }),
                    fa && /* @__PURE__ */ e("span", { className: "field-hint error", children: "Value not in allowed list" }),
                    ga && /* @__PURE__ */ e("span", { className: "field-hint error", children: ga.message })
                  ]
                },
                i.id
              );
            }, a = (i) => {
              const y = i.reduce((f, _) => {
                const R = _.section || "General";
                return f[R] || (f[R] = []), f[R].push(_), f;
              }, {});
              return Object.entries(y).map(([f, _]) => /* @__PURE__ */ n("div", { children: [
                /* @__PURE__ */ e("div", { className: "section-label", children: f }),
                /* @__PURE__ */ e("div", { className: "attr-grid", children: [..._].sort((R, te) => (R.displayOrder || 0) - (te.displayOrder || 0)).map(t) })
              ] }, f));
            }, l = ee.domains.find((i) => i.id === En), s = (i) => {
              if (!i) return "";
              try {
                return new Date(i).toLocaleString();
              } catch {
                return i;
              }
            }, r = ee.base.filter((i) => (i.section || "General") === "Identity"), d = ee.base.filter((i) => (i.section || "General") !== "Identity");
            return /* @__PURE__ */ n("div", { children: [
              /* @__PURE__ */ n("div", { children: [
                /* @__PURE__ */ e("div", { className: "section-label", children: "Identity" }),
                /* @__PURE__ */ n("div", { className: "attr-grid", children: [
                  /* @__PURE__ */ n("div", { className: "field", children: [
                    /* @__PURE__ */ e("label", { className: "field-label", children: ((p = m.metadata) == null ? void 0 : p.logicalIdLabel) || "Identifier" }),
                    /* @__PURE__ */ e("input", { className: "field-input", readOnly: !0, value: ((b = m.metadata) == null ? void 0 : b.logicalId) || "" })
                  ] }),
                  /* @__PURE__ */ n("div", { className: "field", children: [
                    /* @__PURE__ */ e("label", { className: "field-label", children: "External ID" }),
                    /* @__PURE__ */ e(
                      "input",
                      {
                        className: "field-input",
                        value: ct !== null ? ct : ((u = m.metadata) == null ? void 0 : u.externalId) || "",
                        placeholder: "—",
                        onChange: (i) => ht(i.target.value),
                        onFocus: () => {
                          var i;
                          return ht(((i = m.metadata) == null ? void 0 : i.externalId) || "");
                        },
                        onBlur: async () => {
                          var y;
                          if (ct === null) return;
                          const i = ct.trim();
                          i !== (((y = m.metadata) == null ? void 0 : y.externalId) || "") && (await K.updateExternalId(o, h, i).catch(() => {
                          }), await gt()), ht(null);
                        }
                      }
                    )
                  ] }),
                  r.sort((i, y) => (i.displayOrder || 0) - (y.displayOrder || 0)).map(t),
                  /* @__PURE__ */ n("div", { className: "field", children: [
                    /* @__PURE__ */ e("label", { className: "field-label", children: "Technical ID" }),
                    /* @__PURE__ */ e("input", { className: "field-input", readOnly: !0, value: ((v = m.metadata) == null ? void 0 : v.technicalId) || "", title: ((g = m.metadata) == null ? void 0 : g.technicalId) || "" })
                  ] }),
                  /* @__PURE__ */ n("div", { className: "field", children: [
                    /* @__PURE__ */ e("label", { className: "field-label", children: "Creator" }),
                    /* @__PURE__ */ e("input", { className: "field-input", readOnly: !0, value: ((T = m.metadata) == null ? void 0 : T.createdBy) || "" })
                  ] }),
                  /* @__PURE__ */ n("div", { className: "field", children: [
                    /* @__PURE__ */ e("label", { className: "field-label", children: "Created" }),
                    /* @__PURE__ */ e("input", { className: "field-input", readOnly: !0, value: s((G = m.metadata) == null ? void 0 : G.createdAt) })
                  ] }),
                  /* @__PURE__ */ n("div", { className: "field", children: [
                    /* @__PURE__ */ e("label", { className: "field-label", children: "Modified by" }),
                    /* @__PURE__ */ e("input", { className: "field-input", readOnly: !0, value: ((F = m.metadata) == null ? void 0 : F.modifiedBy) || "" })
                  ] }),
                  /* @__PURE__ */ n("div", { className: "field", children: [
                    /* @__PURE__ */ e("label", { className: "field-label", children: "Last update" }),
                    /* @__PURE__ */ e("input", { className: "field-input", readOnly: !0, value: s((me = m.metadata) == null ? void 0 : me.lastUpdate) })
                  ] })
                ] })
              ] }),
              a(d),
              (ee.domains.length > 0 || Gt.length > 0) && /* @__PURE__ */ n("div", { style: { marginTop: 16 }, children: [
                /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, children: [
                  /* @__PURE__ */ e("div", { className: "section-label", style: { marginBottom: 0 }, children: "Domains" }),
                  ee.domains.length > 0 && /* @__PURE__ */ e("div", { className: "subtabs", style: { marginBottom: 0, flex: 1 }, children: ee.domains.map((i) => /* @__PURE__ */ n(
                    "div",
                    {
                      className: `subtab ${En === i.id ? "active" : ""}`,
                      onClick: () => jt(i.id),
                      children: [
                        i.name,
                        /* @__PURE__ */ e("span", { className: "subtab-badge", style: {
                          background: "rgba(91,156,246,.15)",
                          color: "var(--accent)"
                        }, children: i.attrs.length })
                      ]
                    },
                    i.id
                  )) }),
                  Gt.length > 0 && /* @__PURE__ */ e("div", { style: { display: "flex", gap: 4, marginLeft: "auto", flexShrink: 0 }, children: Gt.map((i) => {
                    const y = Tn(i), f = i.label;
                    return /* @__PURE__ */ e(
                      "button",
                      {
                        className: `btn btn-sm${y ? " btn-disabled" : ""}`,
                        disabled: y,
                        title: y ? Cn(i) : i.description || f,
                        onClick: () => Wt(i),
                        children: f
                      },
                      i.code
                    );
                  }) })
                ] }),
                l && a(l.attrs)
              ] })
            ] });
          })(),
          S === "pbs" && /* @__PURE__ */ n(
            "div",
            {
              className: mn ? "pbs-drop-zone drag-over" : "pbs-drop-zone",
              onDragEnter: (t) => {
                De() && (t.preventDefault(), He.current++, mt(!0));
              },
              onDragOver: (t) => {
                De() && (t.preventDefault(), t.dataTransfer.dropEffect = "link");
              },
              onDragLeave: (t) => {
                He.current > 0 && He.current--, He.current === 0 && mt(!1);
              },
              onDrop: (t) => {
                var l;
                t.preventDefault(), He.current = 0, mt(!1);
                const a = De();
                if (ge(), !!a) {
                  if (!((l = I == null ? void 0 : I.actions) != null && l.some((s) => s.code === "create_link"))) {
                    C("You do not have write permission on this node", "error");
                    return;
                  }
                  a.nodeId && a.nodeId !== h && bn(a);
                }
              },
              children: [
                mn && /* @__PURE__ */ e("div", { className: "pbs-drop-hint", children: "Drop to create a link" }),
                ((ma = m.actions) == null ? void 0 : ma.some((t) => t.code === "create_link")) && /* @__PURE__ */ e("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 8 }, children: /* @__PURE__ */ e("button", { className: "btn btn-sm", onClick: () => Be ? lt(!1) : bn(), children: Be ? "✕ Cancel" : "+ Add link" }) }),
                Be && (() => {
                  const t = Lt.find((g) => (g.id || g.ID) === be), a = (t == null ? void 0 : t.link_policy) || (t == null ? void 0 : t.LINK_POLICY) || null, l = (t == null ? void 0 : t.target_source_id) || (t == null ? void 0 : t.TARGET_SOURCE_ID) || "SELF", s = (t == null ? void 0 : t.target_type) || (t == null ? void 0 : t.TARGET_TYPE) || null, r = Ia[l] || null, d = l === "SELF", p = (t == null ? void 0 : t.link_logical_id_label) || (t == null ? void 0 : t.LINK_LOGICAL_ID_LABEL) || "Link ID", b = (t == null ? void 0 : t.link_logical_id_pattern) || (t == null ? void 0 : t.LINK_LOGICAL_ID_PATTERN) || null, u = !b || !ve || new RegExp(`^(?:${b})$`).test(ve), v = !!Me;
                  return /* @__PURE__ */ n("div", { ref: Ft, className: "link-panel", style: { flexWrap: "wrap", rowGap: 6 }, children: [
                    !ie && /* @__PURE__ */ e("div", { style: { width: "100%", fontSize: 11, color: "var(--warn)", marginBottom: 2 }, children: "⚡ No active transaction — one will be opened automatically on create" }),
                    /* @__PURE__ */ n("div", { style: { display: "flex", gap: 8, width: "100%", alignItems: "flex-end" }, children: [
                      /* @__PURE__ */ n("div", { className: "field", style: { margin: 0, flex: "0 0 180px" }, children: [
                        /* @__PURE__ */ e("label", { className: "field-label", children: "Link type" }),
                        /* @__PURE__ */ n(
                          "select",
                          {
                            className: "field-input",
                            value: be,
                            onChange: (g) => {
                              st(g.target.value), We("");
                            },
                            children: [
                              /* @__PURE__ */ e("option", { value: "", children: "— select —" }),
                              Lt.map((g) => /* @__PURE__ */ e("option", { value: g.id || g.ID, children: g.name || g.NAME }, g.id || g.ID))
                            ]
                          }
                        )
                      ] }),
                      /* @__PURE__ */ n("div", { className: "field", style: { margin: 0, flex: 1 }, children: [
                        /* @__PURE__ */ n("label", { className: "field-label", children: [
                          "Target ",
                          r ? /* @__PURE__ */ n("span", { style: { opacity: 0.55, fontWeight: 400, fontSize: 10 }, children: [
                            "— source: ",
                            r.name,
                            r.versioned ? "" : " (immutable)"
                          ] }) : null
                        ] }),
                        /* @__PURE__ */ n("div", { style: { position: "relative" }, children: [
                          /* @__PURE__ */ e(
                            "input",
                            {
                              className: "field-input",
                              type: "text",
                              autoComplete: "off",
                              placeholder: d ? s ? `Search ${s} by logical ID…` : "Search by logical ID…" : s ? `${s} key (UUID, path, …)` : "Target key",
                              value: Me,
                              onChange: (g) => {
                                const T = g.target.value;
                                Ae(T), Z(-1), ne(!0), vn(l, s, T);
                              },
                              onFocus: () => {
                                ne(!0), vn(l, s, Me);
                              },
                              onBlur: () => setTimeout(() => ne(!1), 150),
                              onKeyDown: (g) => {
                                if (!(!nn || Fe.length === 0))
                                  if (g.key === "ArrowDown")
                                    g.preventDefault(), Z((T) => Math.min(T + 1, Fe.length - 1));
                                  else if (g.key === "ArrowUp")
                                    g.preventDefault(), Z((T) => Math.max(T - 1, -1));
                                  else if (g.key === "Enter" && _t >= 0) {
                                    g.preventDefault();
                                    const T = Fe[_t];
                                    Ae(T.key || T.KEY || ""), ne(!1), Z(-1);
                                  } else g.key === "Escape" && (ne(!1), Z(-1));
                              }
                            }
                          ),
                          nn && Fe.length > 0 && /* @__PURE__ */ e("div", { className: "search-suggestions", children: Fe.map((g, T) => {
                            const G = g.key || g.KEY || "", F = g.label || g.LABEL || "";
                            return /* @__PURE__ */ n(
                              "div",
                              {
                                className: `search-sug-item${T === _t ? " hi" : ""}`,
                                onMouseDown: () => {
                                  Ae(G), ne(!1), Z(-1);
                                },
                                onMouseEnter: () => Z(T),
                                children: [
                                  /* @__PURE__ */ e("span", { className: "sug-lid", children: G }),
                                  F && F !== G && /* @__PURE__ */ e("span", { className: "sug-dname", children: F })
                                ]
                              },
                              G
                            );
                          }) })
                        ] })
                      ] }),
                      a && /* @__PURE__ */ n("div", { className: "field", style: { margin: 0, flexShrink: 0 }, children: [
                        /* @__PURE__ */ e("label", { className: "field-label", children: "Policy" }),
                        /* @__PURE__ */ e(
                          "span",
                          {
                            className: "hist-type-badge",
                            "data-type": a,
                            style: { display: "inline-block", padding: "4px 8px", fontSize: 11 },
                            title: a === "VERSION_TO_VERSION" ? "Pinned to current version" : "Always latest version",
                            children: a === "VERSION_TO_VERSION" ? "V2V" : "V2M"
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ n("div", { style: { display: "flex", gap: 8, width: "100%", alignItems: "flex-end" }, children: [
                      /* @__PURE__ */ n("div", { className: "field", style: { margin: 0, flex: 1 }, children: [
                        /* @__PURE__ */ n("label", { className: "field-label", children: [
                          p,
                          b && /* @__PURE__ */ n("span", { style: { marginLeft: 6, opacity: 0.55, fontWeight: 400, fontSize: 10 }, children: [
                            "pattern: ",
                            b
                          ] })
                        ] }),
                        /* @__PURE__ */ e(
                          "input",
                          {
                            className: "field-input",
                            style: { borderColor: (!ve || !u) && be ? "var(--danger, #e05252)" : void 0 },
                            type: "text",
                            placeholder: p,
                            value: ve,
                            onChange: (g) => We(g.target.value)
                          }
                        ),
                        ve && !u && /* @__PURE__ */ n("div", { style: { fontSize: 10, color: "var(--danger, #e05252)", marginTop: 2 }, children: [
                          "Does not match pattern: ",
                          b
                        ] })
                      ] }),
                      /* @__PURE__ */ e(
                        "button",
                        {
                          className: "btn btn-primary btn-sm",
                          style: { alignSelf: "flex-end" },
                          disabled: !be || !v || !ve || !u || an,
                          onClick: za,
                          children: an ? "…" : "Create"
                        }
                      )
                    ] })
                  ] });
                })(),
                /* @__PURE__ */ e("div", { className: "section-label", style: { marginTop: 16 }, children: "BOM — Children" }),
                ye ? $e.length === 0 ? /* @__PURE__ */ n("div", { className: "empty", style: { padding: "24px" }, children: [
                  /* @__PURE__ */ e("div", { className: "empty-icon", children: "◌" }),
                  /* @__PURE__ */ e("div", { className: "empty-text", children: "No child links" })
                ] }) : (() => {
                  const t = [], a = /* @__PURE__ */ new Map();
                  return $e.forEach((l) => {
                    a.has(l.linkTypeName) || (a.set(l.linkTypeName, []), t.push(l.linkTypeName)), a.get(l.linkTypeName).push(l);
                  }), t.map((l) => {
                    const s = a.get(l), r = s[0], p = !r.targetSourceCode || r.targetSourceCode === "SELF" ? "Self" : r.sourceName || r.targetSourceCode || "External", b = Yt ? 7 : 6;
                    return /* @__PURE__ */ n(vt, { children: [
                      /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 12, marginBottom: 4 }, children: [
                        /* @__PURE__ */ e("span", { style: { fontSize: 12, fontWeight: 600 }, children: l }),
                        /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--muted)", background: "var(--surface2, rgba(0,0,0,.06))", borderRadius: 3, padding: "1px 6px" }, children: p })
                      ] }),
                      /* @__PURE__ */ n("table", { className: "history-table", children: [
                        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
                          /* @__PURE__ */ e("th", { children: "Link ID" }),
                          /* @__PURE__ */ e("th", { children: "Node type" }),
                          /* @__PURE__ */ e("th", { children: "Identity" }),
                          /* @__PURE__ */ e("th", { children: "Rev" }),
                          /* @__PURE__ */ e("th", { children: "State" }),
                          /* @__PURE__ */ e("th", { children: "Policy" }),
                          Yt && /* @__PURE__ */ e("th", {})
                        ] }) }),
                        /* @__PURE__ */ e("tbody", { children: s.map((u) => {
                          var me;
                          const v = Ta === u.linkId, g = Ca === u.linkId, T = !u.targetSourceCode || u.targetSourceCode === "SELF", G = T ? null : Et(u.targetSourceCode), F = u.linkTypeAttributes || [];
                          return /* @__PURE__ */ n(vt, { children: [
                            /* @__PURE__ */ n(
                              "tr",
                              {
                                className: sn === u.linkId ? "link-selected" : "",
                                style: { cursor: "pointer" },
                                onClick: () => Vt((i) => i === u.linkId ? null : u.linkId),
                                children: [
                                  /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontSize: 12 }, children: v ? /* @__PURE__ */ e(
                                    "input",
                                    {
                                      className: "field-input",
                                      style: { padding: "2px 6px", fontSize: 12, width: 120 },
                                      value: ln,
                                      onChange: (i) => Ot(i.target.value),
                                      autoFocus: !0
                                    }
                                  ) : u.linkLogicalId ? /* @__PURE__ */ e("span", { title: u.linkLogicalIdLabel, children: u.linkLogicalId }) : /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" }) }),
                                  T ? /* @__PURE__ */ n(St, { children: [
                                    /* @__PURE__ */ e("td", { style: { color: "var(--muted)", fontSize: 12 }, children: u.targetNodeType }),
                                    /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontSize: 13 }, children: v ? /* @__PURE__ */ n("div", { style: { position: "relative" }, children: [
                                      /* @__PURE__ */ e(
                                        "input",
                                        {
                                          className: "field-input",
                                          style: { padding: "2px 4px", fontSize: 12, minWidth: 120 },
                                          type: "text",
                                          autoComplete: "off",
                                          placeholder: "target key…",
                                          value: we,
                                          onChange: (i) => {
                                            const y = i.target.value;
                                            ae(y), j(-1), U(!0), Nt("SELF", u.targetNodeType, y);
                                          },
                                          onFocus: () => {
                                            U(!0), Nt("SELF", u.targetNodeType, we);
                                          },
                                          onBlur: () => setTimeout(() => U(!1), 150),
                                          onKeyDown: (i) => {
                                            !dt || q.length === 0 || (i.key === "ArrowDown" ? (i.preventDefault(), j((y) => Math.min(y + 1, q.length - 1))) : i.key === "ArrowUp" ? (i.preventDefault(), j((y) => Math.max(y - 1, -1))) : i.key === "Enter" && he >= 0 ? (i.preventDefault(), ae(q[he].key || q[he].KEY || ""), U(!1), j(-1)) : i.key === "Escape" && (U(!1), j(-1)));
                                          }
                                        }
                                      ),
                                      dt && q.length > 0 && /* @__PURE__ */ e("div", { className: "search-suggestions", children: q.map((i, y) => {
                                        const f = i.key || i.KEY || "", _ = i.label || i.LABEL || "";
                                        return /* @__PURE__ */ n(
                                          "div",
                                          {
                                            className: `search-sug-item${y === he ? " hi" : ""}`,
                                            onMouseDown: () => {
                                              ae(f), U(!1), j(-1);
                                            },
                                            onMouseEnter: () => j(y),
                                            children: [
                                              /* @__PURE__ */ e("span", { className: "sug-lid", children: f }),
                                              _ && _ !== f && /* @__PURE__ */ e("span", { className: "sug-dname", children: _ })
                                            ]
                                          },
                                          f
                                        );
                                      }) })
                                    ] }) : u.targetLogicalId || /* @__PURE__ */ n("span", { style: { opacity: 0.4 }, children: [
                                      (me = u.targetNodeId) == null ? void 0 : me.slice(0, 8),
                                      "…"
                                    ] }) }),
                                    /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12 }, children: u.linkPolicy === "VERSION_TO_MASTER" ? /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" }) : `${u.targetRevision}.${u.targetIteration}` }),
                                    /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e(xe, { stateId: u.targetState, stateName: u.targetStateName, stateColorMap: x }) }),
                                    /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "hist-type-badge", "data-type": u.linkPolicy, style: { fontSize: 10 }, children: u.linkPolicy === "VERSION_TO_MASTER" ? "V2M" : "V2V" }) })
                                  ] }) : G ? /* @__PURE__ */ e("td", { colSpan: 5, style: { verticalAlign: "middle" }, children: /* @__PURE__ */ e(
                                    G,
                                    {
                                      link: u,
                                      isEditing: v,
                                      editTargetKey: we,
                                      onEditTargetKey: ae
                                    }
                                  ) }) : /* @__PURE__ */ n(St, { children: [
                                    /* @__PURE__ */ e("td", { style: { color: "var(--muted)", fontSize: 12 }, children: u.targetNodeType || /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" }) }),
                                    /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontSize: 12 }, children: v ? /* @__PURE__ */ n("div", { style: { position: "relative" }, children: [
                                      /* @__PURE__ */ e(
                                        "input",
                                        {
                                          className: "field-input",
                                          style: { padding: "2px 4px", fontSize: 12, minWidth: 120 },
                                          type: "text",
                                          autoComplete: "off",
                                          placeholder: "target key…",
                                          value: we,
                                          onChange: (i) => {
                                            const y = i.target.value;
                                            ae(y), j(-1), U(!0), Nt(u.targetSourceCode, u.targetNodeType, y);
                                          },
                                          onFocus: () => {
                                            U(!0), Nt(u.targetSourceCode, u.targetNodeType, we);
                                          },
                                          onBlur: () => setTimeout(() => U(!1), 150),
                                          onKeyDown: (i) => {
                                            !dt || q.length === 0 || (i.key === "ArrowDown" ? (i.preventDefault(), j((y) => Math.min(y + 1, q.length - 1))) : i.key === "ArrowUp" ? (i.preventDefault(), j((y) => Math.max(y - 1, -1))) : i.key === "Enter" && he >= 0 ? (i.preventDefault(), ae(q[he].key || q[he].KEY || ""), U(!1), j(-1)) : i.key === "Escape" && (U(!1), j(-1)));
                                          }
                                        }
                                      ),
                                      dt && q.length > 0 && /* @__PURE__ */ e("div", { className: "search-suggestions", children: q.map((i, y) => {
                                        const f = i.key || i.KEY || "", _ = i.label || i.LABEL || "";
                                        return /* @__PURE__ */ n(
                                          "div",
                                          {
                                            className: `search-sug-item${y === he ? " hi" : ""}`,
                                            onMouseDown: () => {
                                              ae(f), U(!1), j(-1);
                                            },
                                            onMouseEnter: () => j(y),
                                            children: [
                                              /* @__PURE__ */ e("span", { className: "sug-lid", children: f }),
                                              _ && _ !== f && /* @__PURE__ */ e("span", { className: "sug-dname", children: _ })
                                            ]
                                          },
                                          f
                                        );
                                      }) })
                                    ] }) : u.displayKey || u.targetKey }),
                                    /* @__PURE__ */ e("td", {}),
                                    /* @__PURE__ */ e("td", {}),
                                    /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "hist-type-badge", "data-type": u.linkPolicy, style: { fontSize: 10 }, children: u.linkPolicy === "VERSION_TO_MASTER" ? "V2M" : "V2V" }) })
                                  ] }),
                                  Yt && /* @__PURE__ */ e("td", { style: { whiteSpace: "nowrap" }, onClick: (i) => i.stopPropagation(), children: g ? /* @__PURE__ */ n("span", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
                                    /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--danger, #e05252)", marginRight: 2 }, children: "Delete?" }),
                                    /* @__PURE__ */ e(
                                      "button",
                                      {
                                        className: "btn btn-sm btn-danger",
                                        style: { padding: "1px 6px", fontSize: 11 },
                                        disabled: on,
                                        onClick: () => Ba(u.linkId),
                                        children: "✓"
                                      }
                                    ),
                                    /* @__PURE__ */ e(
                                      "button",
                                      {
                                        className: "btn btn-sm",
                                        style: { padding: "1px 6px", fontSize: 11 },
                                        onClick: () => Ge(null),
                                        children: "✕"
                                      }
                                    )
                                  ] }) : v ? /* @__PURE__ */ n("span", { style: { display: "flex", gap: 4 }, children: [
                                    /* @__PURE__ */ e(
                                      "button",
                                      {
                                        className: "btn btn-sm btn-success",
                                        style: { padding: "1px 6px", fontSize: 11 },
                                        disabled: on,
                                        onClick: () => $a(u.linkId, ln, we, Dt),
                                        children: "✓"
                                      }
                                    ),
                                    /* @__PURE__ */ e(
                                      "button",
                                      {
                                        className: "btn btn-sm",
                                        style: { padding: "1px 6px", fontSize: 11 },
                                        onClick: () => je(null),
                                        children: "✕"
                                      }
                                    )
                                  ] }) : /* @__PURE__ */ n("span", { style: { display: "flex", gap: 4 }, children: [
                                    (Le || Ut) && /* @__PURE__ */ e(
                                      "button",
                                      {
                                        className: "btn btn-sm",
                                        style: { padding: "1px 6px", fontSize: 11, ...Le ? {} : { opacity: 0.35, cursor: "not-allowed" } },
                                        title: Le ? "Edit link" : "Checkout to edit",
                                        disabled: !Le,
                                        onClick: Le ? () => {
                                          je(u.linkId), Ot(u.linkLogicalId || ""), ae(u.targetLogicalId || u.targetKey || "");
                                          const i = {};
                                          (u.linkAttributeValues || []).forEach((y) => {
                                            i[y.attributeId] = y.value || "";
                                          }), rt(i), ot([]), U(!1), j(-1), Ge(null);
                                        } : void 0,
                                        children: "✎"
                                      }
                                    ),
                                    (Ee || Ut) && /* @__PURE__ */ e(
                                      "button",
                                      {
                                        className: "btn btn-sm",
                                        style: { padding: "1px 6px", fontSize: 11, color: Ee ? "var(--danger, #e05252)" : void 0, ...Ee ? {} : { opacity: 0.35, cursor: "not-allowed" } },
                                        title: Ee ? "Delete link" : "Checkout to delete",
                                        disabled: !Ee,
                                        onClick: Ee ? () => {
                                          Ge(u.linkId), je(null);
                                        } : void 0,
                                        children: "✕"
                                      }
                                    )
                                  ] }) })
                                ]
                              }
                            ),
                            sn === u.linkId && !v && (() => {
                              const i = {};
                              (u.linkAttributeValues || []).forEach((f) => {
                                i[f.attributeId] = f.value;
                              });
                              const y = (f) => {
                                if (!f) return /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" });
                                const _ = f.split(",").map((R) => parseFloat(R.trim()));
                                return _.length !== 16 || _.some(isNaN) ? /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono, monospace)", fontSize: 11 }, children: f }) : /* @__PURE__ */ e("div", { style: { fontSize: 11, fontFamily: "var(--mono, monospace)", lineHeight: 1.8, background: "var(--surface2, rgba(0,0,0,.04))", borderRadius: 3, padding: "4px 8px", display: "inline-block" }, children: [0, 1, 2, 3].map((R) => /* @__PURE__ */ e("div", { style: { display: "flex", gap: 10 }, children: [0, 1, 2, 3].map((te) => /* @__PURE__ */ e("span", { style: { minWidth: 56, textAlign: "right", display: "inline-block" }, children: _[R * 4 + te].toFixed(4) }, te)) }, R)) });
                              };
                              return /* @__PURE__ */ e("tr", { className: "link-detail-expand", onClick: (f) => f.stopPropagation(), children: /* @__PURE__ */ e("td", { colSpan: b, children: /* @__PURE__ */ e("div", { className: "link-detail-inner", children: F.length === 0 ? /* @__PURE__ */ e("span", { style: { fontSize: 11, opacity: 0.5 }, children: "No attributes defined for this link type." }) : /* @__PURE__ */ e("div", { style: { display: "flex", flexWrap: "wrap", gap: 12 }, children: F.map((f) => /* @__PURE__ */ n("div", { style: { flex: f.dataType === "POSITION" ? "1 1 100%" : "1 1 160px", minWidth: 120 }, children: [
                                /* @__PURE__ */ e("div", { style: { fontSize: 10, color: "var(--muted)", marginBottom: 4 }, children: f.label || f.name }),
                                f.dataType === "POSITION" ? y(i[f.name]) : /* @__PURE__ */ e("div", { style: { fontSize: 12 }, children: i[f.name] != null ? i[f.name] : /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" }) })
                              ] }, f.id)) }) }) }) });
                            })(),
                            v && F.length > 0 && /* @__PURE__ */ e("tr", { children: /* @__PURE__ */ e("td", { colSpan: b, style: { padding: "4px 8px 8px", background: "var(--surface2, rgba(0,0,0,.04))" }, children: /* @__PURE__ */ e("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }, children: F.map((i) => /* @__PURE__ */ n("div", { className: "field", style: { margin: 0, flex: i.dataType === "POSITION" ? "1 1 100%" : "1 1 160px", minWidth: 120 }, children: [
                              /* @__PURE__ */ n("label", { className: "field-label", style: { fontSize: 10 }, children: [
                                i.label || i.name,
                                i.required && /* @__PURE__ */ e("span", { className: "field-req", children: "*" })
                              ] }),
                              i.dataType === "POSITION" ? (() => {
                                const f = (Dt[i.name] || "").split(",").map((R) => parseFloat(R.trim())), _ = f.length === 16 && f.every((R) => !isNaN(R)) ? f : Array(16).fill(0);
                                return /* @__PURE__ */ e("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, fontFamily: "var(--mono, monospace)" }, children: _.map((R, te) => /* @__PURE__ */ e(
                                  "input",
                                  {
                                    type: "number",
                                    className: "field-input",
                                    style: { padding: "2px 4px", fontSize: 11, textAlign: "right", width: "100%" },
                                    value: R,
                                    step: "any",
                                    onChange: (Je) => {
                                      const se = [..._];
                                      se[te] = parseFloat(Je.target.value) || 0, rt((ue) => ({ ...ue, [i.name]: se.join(",") }));
                                    }
                                  },
                                  te
                                )) });
                              })() : /* @__PURE__ */ e(
                                "input",
                                {
                                  className: "field-input",
                                  style: { padding: "2px 6px", fontSize: 12 },
                                  value: Dt[i.name] || "",
                                  onChange: (y) => rt((f) => ({ ...f, [i.name]: y.target.value })),
                                  placeholder: i.label || i.name
                                }
                              )
                            ] }, i.id)) }) }) })
                          ] }, u.linkId);
                        }) })
                      ] })
                    ] }, l);
                  });
                })() : /* @__PURE__ */ n("div", { className: "empty", style: { padding: "24px" }, children: [
                  /* @__PURE__ */ e("div", { className: "empty-icon", children: "◎" }),
                  /* @__PURE__ */ e("div", { className: "empty-text", children: "Loading…" })
                ] }),
                /* @__PURE__ */ e("div", { className: "section-label", style: { marginTop: 24 }, children: "Where Used — Parents" }),
                ye ? wt.length === 0 ? /* @__PURE__ */ n("div", { className: "empty", style: { padding: "24px" }, children: [
                  /* @__PURE__ */ e("div", { className: "empty-icon", children: "◌" }),
                  /* @__PURE__ */ e("div", { className: "empty-text", children: "Not used anywhere" })
                ] }) : (() => {
                  const t = [], a = /* @__PURE__ */ new Map();
                  return wt.forEach((l) => {
                    a.has(l.linkTypeName) || (a.set(l.linkTypeName, []), t.push(l.linkTypeName)), a.get(l.linkTypeName).push(l);
                  }), t.map((l) => /* @__PURE__ */ n(vt, { children: [
                    /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 12, marginBottom: 4 }, children: [
                      /* @__PURE__ */ e("span", { style: { fontSize: 12, fontWeight: 600 }, children: l }),
                      /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--muted)", background: "var(--surface2, rgba(0,0,0,.06))", borderRadius: 3, padding: "1px 6px" }, children: "Self" })
                    ] }),
                    /* @__PURE__ */ n("table", { className: "history-table", children: [
                      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
                        /* @__PURE__ */ e("th", { children: "Link ID" }),
                        /* @__PURE__ */ e("th", { children: "Node type" }),
                        /* @__PURE__ */ e("th", { children: "Identity" }),
                        /* @__PURE__ */ e("th", { children: "Rev" }),
                        /* @__PURE__ */ e("th", { children: "State" }),
                        /* @__PURE__ */ e("th", { children: "Policy" })
                      ] }) }),
                      /* @__PURE__ */ e("tbody", { children: a.get(l).map((s) => {
                        var d;
                        const r = Aa === s.linkId;
                        return /* @__PURE__ */ n(vt, { children: [
                          /* @__PURE__ */ n(
                            "tr",
                            {
                              className: r ? "link-selected" : "",
                              style: { cursor: "pointer" },
                              onClick: () => rn((p) => p === s.linkId ? null : s.linkId),
                              children: [
                                /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontSize: 12 }, children: s.linkLogicalId ? /* @__PURE__ */ e("span", { title: s.linkLogicalIdLabel, children: s.linkLogicalId }) : /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" }) }),
                                /* @__PURE__ */ e("td", { style: { color: "var(--muted)", fontSize: 12 }, children: s.sourceNodeType }),
                                /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontSize: 13 }, children: s.sourceLogicalId || /* @__PURE__ */ n("span", { style: { opacity: 0.4 }, children: [
                                  (d = s.sourceNodeId) == null ? void 0 : d.slice(0, 8),
                                  "…"
                                ] }) }),
                                /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12 }, children: s.linkPolicy === "VERSION_TO_MASTER" ? /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" }) : `${s.sourceRevision}.${s.sourceIteration}` }),
                                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e(xe, { stateId: s.sourceState, stateName: s.sourceStateName, stateColorMap: x }) }),
                                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "hist-type-badge", "data-type": s.linkPolicy, style: { fontSize: 10 }, children: s.linkPolicy === "VERSION_TO_MASTER" ? "V2M" : "V2V" }) })
                              ]
                            }
                          ),
                          r && (() => {
                            const p = s.linkTypeAttributes || [], b = {};
                            (s.linkAttributeValues || []).forEach((v) => {
                              b[v.attributeId] = v.value;
                            });
                            const u = (v) => {
                              if (!v) return /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" });
                              const g = v.split(",").map((T) => parseFloat(T.trim()));
                              return g.length !== 16 || g.some(isNaN) ? /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono, monospace)", fontSize: 11 }, children: v }) : /* @__PURE__ */ e("div", { style: { fontSize: 11, fontFamily: "var(--mono, monospace)", lineHeight: 1.8, background: "var(--surface2, rgba(0,0,0,.04))", borderRadius: 3, padding: "4px 8px", display: "inline-block" }, children: [0, 1, 2, 3].map((T) => /* @__PURE__ */ e("div", { style: { display: "flex", gap: 10 }, children: [0, 1, 2, 3].map((G) => /* @__PURE__ */ e("span", { style: { minWidth: 56, textAlign: "right", display: "inline-block" }, children: g[T * 4 + G].toFixed(4) }, G)) }, T)) });
                            };
                            return /* @__PURE__ */ e("tr", { className: "link-detail-expand", onClick: (v) => v.stopPropagation(), children: /* @__PURE__ */ e("td", { colSpan: 6, children: /* @__PURE__ */ e("div", { className: "link-detail-inner", children: p.length === 0 ? /* @__PURE__ */ e("span", { style: { fontSize: 11, opacity: 0.5 }, children: "No attributes defined for this link type." }) : /* @__PURE__ */ e("div", { style: { display: "flex", flexWrap: "wrap", gap: 12 }, children: p.map((v) => /* @__PURE__ */ n("div", { style: { flex: v.dataType === "POSITION" ? "1 1 100%" : "1 1 160px", minWidth: 120 }, children: [
                              /* @__PURE__ */ e("div", { style: { fontSize: 10, color: "var(--muted)", marginBottom: 4 }, children: v.label || v.name }),
                              v.dataType === "POSITION" ? u(b[v.name]) : /* @__PURE__ */ e("div", { style: { fontSize: 12 }, children: b[v.name] != null ? b[v.name] : /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" }) })
                            ] }, v.id)) }) }) }) });
                          })()
                        ] }, s.linkId);
                      }) })
                    ] })
                  ] }, l));
                })() : /* @__PURE__ */ n("div", { className: "empty", style: { padding: "24px" }, children: [
                  /* @__PURE__ */ e("div", { className: "empty-icon", children: "◎" }),
                  /* @__PURE__ */ e("div", { className: "empty-text", children: "Loading…" })
                ] })
              ]
            }
          ),
          S === "history" && /* @__PURE__ */ n("div", { children: [
            /* @__PURE__ */ n("div", { className: "history-lc-section", children: [
              /* @__PURE__ */ e("div", { className: "history-lc-label", children: "Lifecycle" }),
              /* @__PURE__ */ e(
                Sa,
                {
                  lifecycleId: (ua = m.metadata) == null ? void 0 : ua.lifecycleId,
                  currentStateId: (pa = m.metadata) == null ? void 0 : pa.state,
                  userId: o,
                  availableTransitionNames: new Set(
                    An.filter((t) => {
                      var a;
                      return !((a = t.guardViolations) != null && a.length);
                    }).map((t) => t.label)
                  ),
                  transitionGuardViolations: Wa,
                  onTransition: (t) => {
                    var s;
                    const a = t.name || t.NAME || "", l = An.find((r) => r.label === a);
                    l && !((s = l.guardViolations) != null && s.length) && Wt(l);
                  }
                }
              )
            ] }),
            /* @__PURE__ */ e("div", { className: "history-lc-divider", children: /* @__PURE__ */ e("span", { children: "Version history" }) }),
            Ve.length === 0 ? /* @__PURE__ */ n("div", { className: "empty", children: [
              /* @__PURE__ */ e("div", { className: "empty-icon", children: "◌" }),
              /* @__PURE__ */ e("div", { className: "empty-text", children: "No history yet" })
            ] }) : /* @__PURE__ */ n("table", { className: "history-table", children: [
              /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
                /* @__PURE__ */ e("th", { children: "#" }),
                /* @__PURE__ */ e("th", { children: "Rev" }),
                /* @__PURE__ */ e("th", { children: "State" }),
                /* @__PURE__ */ e("th", { children: "Type" }),
                /* @__PURE__ */ e("th", { children: "Commit message" }),
                /* @__PURE__ */ e("th", { children: "By" }),
                /* @__PURE__ */ e("th", { children: "Date" }),
                /* @__PURE__ */ e("th", { children: "Fingerprint" }),
                /* @__PURE__ */ e("th", { children: "TX" }),
                /* @__PURE__ */ e("th", {})
              ] }) }),
              /* @__PURE__ */ e("tbody", { children: [...Ve].reverse().map((t, a, l) => {
                var me, i;
                const s = t.fingerprint || t.FINGERPRINT || null, r = t.tx_id || t.TX_ID || null, d = l[a + 1] ? l[a + 1].fingerprint || l[a + 1].FINGERPRINT : null, p = l[a + 1] ? l[a + 1].tx_id || l[a + 1].TX_ID : null, b = s && d && s !== d, u = s && !d, v = t.committed_at || t.COMMITTED_AT, g = t.version_number || t.VERSION_NUMBER, T = (t.tx_status || t.TX_STATUS) === "OPEN", G = a === l.length - 1, F = X === g;
                return /* @__PURE__ */ n("tr", { className: [T ? "pending-row" : "", F ? "historical-row" : ""].filter(Boolean).join(" ") || void 0, children: [
                  /* @__PURE__ */ n("td", { children: [
                    /* @__PURE__ */ e("span", { className: "ver-num", children: g }),
                    T && /* @__PURE__ */ e("span", { className: "pending-badge", children: "pending" })
                  ] }),
                  /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12 }, children: (t.iteration ?? t.ITERATION) === 0 ? t.revision || t.REVISION : `${t.revision || t.REVISION}.${t.iteration ?? t.ITERATION}` }),
                  /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "hist-state", children: t.state_name || t.STATE_NAME || "—" }) }),
                  /* @__PURE__ */ e("td", { children: T ? /* @__PURE__ */ e("span", { className: "hist-type-badge", "data-type": t.change_type || t.CHANGE_TYPE, style: { opacity: 0.6 }, children: t.change_type || t.CHANGE_TYPE }) : /* @__PURE__ */ e("span", { className: "hist-type-badge", "data-type": t.change_type || t.CHANGE_TYPE, children: t.change_type || t.CHANGE_TYPE }) }),
                  /* @__PURE__ */ e("td", { className: "hist-comment", title: t.tx_comment || t.TX_COMMENT || "", children: T ? /* @__PURE__ */ e("span", { style: { color: "var(--warn)", fontStyle: "italic", opacity: 0.7 }, children: "uncommitted" }) : t.tx_comment || t.TX_COMMENT || /* @__PURE__ */ e("span", { style: { opacity: 0.4 }, children: "—" }) }),
                  /* @__PURE__ */ e("td", { className: "hist-by", children: t.created_by || t.CREATED_BY || t.tx_owner || "—" }),
                  /* @__PURE__ */ e("td", { className: "hist-date", children: T ? /* @__PURE__ */ e("span", { style: { color: "var(--warn)", fontStyle: "italic" }, children: "—" }) : v ? new Date(v).toLocaleDateString() : "—" }),
                  /* @__PURE__ */ e("td", { children: s ? /* @__PURE__ */ n(
                    "span",
                    {
                      className: "hist-fp",
                      title: s,
                      style: { color: T ? "var(--warn)" : u || b ? "var(--success)" : "var(--muted2)", opacity: T ? 0.6 : 1 },
                      children: [
                        s.slice(0, 8),
                        "…"
                      ]
                    }
                  ) : /* @__PURE__ */ e("span", { style: { opacity: 0.3 }, children: "—" }) }),
                  /* @__PURE__ */ e("td", { children: r ? /* @__PURE__ */ n(
                    "span",
                    {
                      className: "hist-fp",
                      title: r,
                      style: { color: T ? "var(--warn)" : r !== p ? "var(--accent)" : "var(--muted2)", fontFamily: "var(--mono)", opacity: T ? 0.6 : 1 },
                      children: [
                        r.slice(0, 8),
                        "…"
                      ]
                    }
                  ) : /* @__PURE__ */ e("span", { style: { opacity: 0.3 }, children: "—" }) }),
                  /* @__PURE__ */ n("td", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
                    /* @__PURE__ */ n("div", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
                      !G && /* @__PURE__ */ e(
                        "button",
                        {
                          className: "btn-diff",
                          title: `Diff v${((me = l[a + 1]) == null ? void 0 : me.version_number) || ((i = l[a + 1]) == null ? void 0 : i.VERSION_NUMBER)} → v${g}${T ? " (pending)" : ""}`,
                          disabled: xa,
                          onClick: () => Pa(g),
                          children: "⊕ diff"
                        }
                      ),
                      (() => {
                        const y = t.id || t.ID, f = y && ka[y] || 0;
                        return f > 0 && A ? /* @__PURE__ */ n(
                          "button",
                          {
                            className: "btn-diff",
                            title: `${f} comment${f > 1 ? "s" : ""} on this version`,
                            onClick: () => A(y),
                            style: { color: "var(--accent)" },
                            children: [
                              "💬 ",
                              f
                            ]
                          }
                        ) : null;
                      })(),
                      (() => {
                        const y = t.id || t.ID, f = y ? La[y] : null, _ = f ? f.count : 0, R = f ? f.hasRejected : !1;
                        return _ > 0 ? /* @__PURE__ */ n(
                          "button",
                          {
                            className: "btn-diff",
                            title: `${_} signature${_ > 1 ? "s" : ""} on this version${R ? " (rejected)" : ""}`,
                            onClick: () => $t(y),
                            style: { color: R ? "var(--danger)" : "var(--success)", display: "inline-flex", alignItems: "center", gap: 3 },
                            children: [
                              /* @__PURE__ */ e(va, { size: 12 }),
                              " ",
                              _
                            ]
                          }
                        ) : null;
                      })()
                    ] }),
                    /* @__PURE__ */ e("div", { style: { marginLeft: "auto" }, children: !T && g !== ja && /* @__PURE__ */ e(
                      "button",
                      {
                        className: "btn-diff",
                        title: F ? "Exit historical view" : `View node at version ${g}`,
                        style: { opacity: F ? 1 : 0.6, background: F ? "rgba(251,191,36,.2)" : void 0 },
                        onClick: () => {
                          F ? (pt(null), Ye(null)) : (pt(g), Ye(null));
                        },
                        children: "👁"
                      }
                    ) })
                  ] })
                ] }, g);
              }) })
            ] })
          ] })
        ] }),
        nt && /* @__PURE__ */ e(
          ei,
          {
            diff: nt.data,
            v1Num: nt.v1Num,
            v2Num: nt.v2Num,
            onClose: () => Ct(null),
            stateColorMap: x
          }
        ),
        un && /* @__PURE__ */ e(
          Ya,
          {
            shellAPI: k,
            nodeId: h,
            userId: o,
            filterVersionId: un,
            onClose: () => $t(null)
          }
        )
      ]
    }
  );
}
function ei({ diff: k, v1Num: h, v2Num: o, onClose: E, stateColorMap: D }) {
  const { v1: x, v2: S, attributeDiff: L, stateChanged: C, linkDiff: $ = [] } = k, B = L.filter((c) => c.changed), M = L.filter((c) => !c.changed), P = $.filter((c) => c.status === "ADDED"), A = $.filter((c) => c.status === "REMOVED"), w = $.filter((c) => c.status === "UNCHANGED"), O = [...P, ...A];
  return /* @__PURE__ */ e("div", { className: "diff-overlay", onClick: (c) => c.target === c.currentTarget && E(), children: /* @__PURE__ */ n("div", { className: "diff-modal", children: [
    /* @__PURE__ */ n("div", { className: "diff-header", children: [
      /* @__PURE__ */ n("span", { className: "diff-title", children: [
        "Diff — v",
        h,
        " → v",
        o
      ] }),
      /* @__PURE__ */ e("button", { className: "diff-close", onClick: E, children: "✕" })
    ] }),
    /* @__PURE__ */ n("div", { className: "diff-meta-row", children: [
      /* @__PURE__ */ n("div", { className: "diff-meta-cell diff-meta-old", children: [
        /* @__PURE__ */ n("div", { className: "diff-meta-label", children: [
          "Version ",
          h
        ] }),
        /* @__PURE__ */ e("div", { className: "diff-meta-rev", children: x.iteration === 0 ? x.revision : `${x.revision}.${x.iteration}` }),
        /* @__PURE__ */ e(xe, { stateId: x.lifecycleStateId, stateColorMap: D }),
        /* @__PURE__ */ e("span", { className: "hist-type-badge", "data-type": x.changeType, style: { marginLeft: 6 }, children: x.changeType }),
        /* @__PURE__ */ n("div", { className: "diff-meta-sub", children: [
          x.createdBy,
          " · ",
          x.txComment || "—"
        ] })
      ] }),
      /* @__PURE__ */ e("div", { className: "diff-arrow", children: "→" }),
      /* @__PURE__ */ n("div", { className: "diff-meta-cell diff-meta-new", style: S.committedAt ? void 0 : { borderColor: "rgba(232,169,71,.35)", background: "rgba(232,169,71,.05)" }, children: [
        /* @__PURE__ */ n("div", { className: "diff-meta-label", style: { display: "flex", alignItems: "center", gap: 6 }, children: [
          "Version ",
          o,
          !S.committedAt && /* @__PURE__ */ e("span", { className: "pending-badge", children: "pending" })
        ] }),
        /* @__PURE__ */ e("div", { className: "diff-meta-rev", children: S.iteration === 0 ? S.revision : `${S.revision}.${S.iteration}` }),
        /* @__PURE__ */ e(xe, { stateId: S.lifecycleStateId, stateColorMap: D }),
        /* @__PURE__ */ e("span", { className: "hist-type-badge", "data-type": S.changeType, style: { marginLeft: 6 }, children: S.changeType }),
        /* @__PURE__ */ n("div", { className: "diff-meta-sub", children: [
          S.createdBy,
          " · ",
          S.txComment || /* @__PURE__ */ e("em", { style: { opacity: 0.5 }, children: "uncommitted" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ n("div", { className: "diff-body", children: [
      C && /* @__PURE__ */ n("div", { className: "diff-state-change", children: [
        /* @__PURE__ */ e("span", { style: { opacity: 0.7 }, children: "State changed:" }),
        " ",
        /* @__PURE__ */ e(xe, { stateId: x.lifecycleStateId, stateColorMap: D }),
        " ",
        "→",
        " ",
        /* @__PURE__ */ e(xe, { stateId: S.lifecycleStateId, stateColorMap: D })
      ] }),
      B.length === 0 && !C ? /* @__PURE__ */ e("div", { className: "diff-no-changes", children: "No attribute changes between these versions." }) : /* @__PURE__ */ n("div", { className: "diff-attr-section", children: [
        /* @__PURE__ */ n("div", { className: "diff-section-title", children: [
          "Changed attributes (",
          B.length,
          ")"
        ] }),
        B.length === 0 ? /* @__PURE__ */ e("div", { className: "diff-empty-section", children: "None" }) : /* @__PURE__ */ n("table", { className: "diff-table", children: [
          /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
            /* @__PURE__ */ e("th", { children: "Attribute" }),
            /* @__PURE__ */ n("th", { className: "diff-old-col", children: [
              "Before (v",
              h,
              ")"
            ] }),
            /* @__PURE__ */ n("th", { className: "diff-new-col", children: [
              "After (v",
              o,
              ")"
            ] })
          ] }) }),
          /* @__PURE__ */ e("tbody", { children: B.map((c) => /* @__PURE__ */ n("tr", { className: "diff-row-changed", children: [
            /* @__PURE__ */ e("td", { className: "diff-attr-name", children: c.label || c.id || c.code }),
            /* @__PURE__ */ e("td", { className: "diff-val diff-val-old", children: c.v1Value !== "" ? c.v1Value : /* @__PURE__ */ e("span", { className: "diff-empty", children: "—" }) }),
            /* @__PURE__ */ e("td", { className: "diff-val diff-val-new", children: c.v2Value !== "" ? c.v2Value : /* @__PURE__ */ e("span", { className: "diff-empty", children: "—" }) })
          ] }, c.id || c.code)) })
        ] })
      ] }),
      M.length > 0 && /* @__PURE__ */ n("details", { className: "diff-unchanged-details", children: [
        /* @__PURE__ */ n("summary", { className: "diff-section-title", style: { cursor: "pointer" }, children: [
          "Unchanged attributes (",
          M.length,
          ")"
        ] }),
        /* @__PURE__ */ n("table", { className: "diff-table", style: { marginTop: 8 }, children: [
          /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
            /* @__PURE__ */ e("th", { children: "Attribute" }),
            /* @__PURE__ */ e("th", { colSpan: 2, children: "Value" })
          ] }) }),
          /* @__PURE__ */ e("tbody", { children: M.map((c) => /* @__PURE__ */ n("tr", { className: "diff-row-unchanged", children: [
            /* @__PURE__ */ e("td", { className: "diff-attr-name", children: c.label || c.id || c.code }),
            /* @__PURE__ */ e("td", { className: "diff-val", colSpan: 2, style: { color: "var(--muted2)" }, children: c.v1Value !== "" ? c.v1Value : /* @__PURE__ */ e("span", { className: "diff-empty", children: "—" }) })
          ] }, c.id || c.code)) })
        ] })
      ] }),
      $.length > 0 && /* @__PURE__ */ n("div", { className: "diff-attr-section", style: { marginTop: 16 }, children: [
        /* @__PURE__ */ n("div", { className: "diff-section-title", children: [
          "Links",
          O.length > 0 ? ` — ${O.length} change${O.length > 1 ? "s" : ""}` : " — no changes"
        ] }),
        O.map((c) => /* @__PURE__ */ n("details", { className: "diff-link-entry", open: !0, children: [
          /* @__PURE__ */ n("summary", { className: "diff-link-summary", children: [
            /* @__PURE__ */ e(
              "span",
              {
                className: "hist-type-badge",
                "data-type": c.status,
                style: {
                  background: c.status === "ADDED" ? "var(--success)" : "var(--danger)",
                  color: "#fff",
                  marginRight: 6,
                  fontSize: 10
                },
                children: c.status
              }
            ),
            /* @__PURE__ */ e("span", { style: { fontWeight: 600, marginRight: 6 }, children: c.linkTypeName }),
            /* @__PURE__ */ e(
              "span",
              {
                className: "hist-type-badge",
                "data-type": c.linkPolicy === "VERSION_TO_VERSION" ? "SIGNATURE" : "LIFECYCLE",
                style: { fontSize: 10, marginRight: 8 },
                children: c.linkPolicy === "VERSION_TO_VERSION" ? "V2V" : "V2M"
              }
            ),
            /* @__PURE__ */ e("span", { style: { color: "var(--fg)" }, children: c.targetLogicalId || c.targetNodeId }),
            /* @__PURE__ */ n("span", { style: { color: "var(--muted2)", fontSize: 11, marginLeft: 4 }, children: [
              "(",
              c.targetNodeType,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ n("div", { className: "diff-link-detail", children: [
            /* @__PURE__ */ n("div", { className: "diff-link-detail-row", children: [
              /* @__PURE__ */ e("span", { className: "diff-attr-name", children: "Target" }),
              /* @__PURE__ */ n("span", { className: "diff-val", children: [
                c.targetLogicalId || c.targetNodeId,
                /* @__PURE__ */ n("span", { style: { color: "var(--muted2)", marginLeft: 4 }, children: [
                  "· ",
                  c.targetNodeType
                ] })
              ] })
            ] }),
            /* @__PURE__ */ n("div", { className: "diff-link-detail-row", children: [
              /* @__PURE__ */ e("span", { className: "diff-attr-name", children: "Policy" }),
              /* @__PURE__ */ e("span", { className: "diff-val", children: c.linkPolicy === "VERSION_TO_VERSION" ? "V2V — pinned version" : "V2M — always latest" })
            ] }),
            c.linkPolicy === "VERSION_TO_VERSION" && /* @__PURE__ */ n("div", { className: "diff-link-detail-row", children: [
              /* @__PURE__ */ e("span", { className: "diff-attr-name", children: "Pinned version" }),
              /* @__PURE__ */ e("span", { className: "diff-val", children: c.pinnedRevision != null ? `${c.pinnedRevision}.${c.pinnedIteration}` : /* @__PURE__ */ e("span", { className: "diff-empty", children: "—" }) })
            ] })
          ] })
        ] }, c.linkId)),
        w.length > 0 && /* @__PURE__ */ n("details", { className: "diff-unchanged-details", style: { marginTop: 8 }, children: [
          /* @__PURE__ */ n("summary", { className: "diff-section-title", style: { cursor: "pointer", fontWeight: 400 }, children: [
            "Unchanged links (",
            w.length,
            ")"
          ] }),
          /* @__PURE__ */ e("div", { style: { marginTop: 4 }, children: w.map((c) => /* @__PURE__ */ n("div", { className: "diff-link-unch-row", children: [
            /* @__PURE__ */ e("span", { style: { fontWeight: 600, marginRight: 6 }, children: c.linkTypeName }),
            /* @__PURE__ */ e(
              "span",
              {
                className: "hist-type-badge",
                "data-type": c.linkPolicy === "VERSION_TO_VERSION" ? "SIGNATURE" : "LIFECYCLE",
                style: { fontSize: 10, marginRight: 8 },
                children: c.linkPolicy === "VERSION_TO_VERSION" ? "V2V" : "V2M"
              }
            ),
            /* @__PURE__ */ e("span", { children: c.targetLogicalId || c.targetNodeId }),
            /* @__PURE__ */ n("span", { style: { color: "var(--muted2)", fontSize: 11, marginLeft: 4 }, children: [
              "(",
              c.targetNodeType,
              ")"
            ] }),
            c.linkPolicy === "VERSION_TO_VERSION" && c.pinnedRevision && /* @__PURE__ */ n("span", { style: { color: "var(--muted2)", fontSize: 11, marginLeft: 8 }, children: [
              "pinned ",
              c.pinnedRevision,
              ".",
              c.pinnedIteration
            ] })
          ] }, c.linkId)) })
        ] })
      ] })
    ] }),
    (x.fingerprint || S.fingerprint) && /* @__PURE__ */ n("div", { className: "diff-fp-row", children: [
      /* @__PURE__ */ e("span", { className: "diff-fp-label", children: "Fingerprint" }),
      /* @__PURE__ */ e("span", { className: "diff-fp-val", title: x.fingerprint, style: { color: "var(--muted2)" }, children: x.fingerprint ? x.fingerprint.slice(0, 12) + "…" : "—" }),
      /* @__PURE__ */ e("span", { style: { margin: "0 6px", opacity: 0.5 }, children: "→" }),
      /* @__PURE__ */ e(
        "span",
        {
          className: "diff-fp-val",
          title: S.fingerprint,
          style: { color: x.fingerprint !== S.fingerprint ? "var(--success)" : "var(--muted2)" },
          children: S.fingerprint ? S.fingerprint.slice(0, 12) + "…" : "—"
        }
      )
    ] })
  ] }) });
}
let Na = null;
function ti({ tab: k, ctx: h }) {
  return /* @__PURE__ */ e(
    Za,
    {
      shellAPI: Na,
      nodeId: k.nodeId,
      userId: h.userId,
      tx: h.tx,
      nodeTypes: h.nodeTypes,
      stateColorMap: h.stateColorMap,
      activeSubTab: k.activeSubTab || "attributes",
      onSubTabChange: (o) => h.onSubTabChange(k.id, o),
      toast: h.toast,
      onAutoOpenTx: h.onAutoOpenTx,
      onDescriptionLoaded: h.onDescriptionLoaded,
      onRefreshItemData: h.onRefreshItemData,
      itemData: h.itemData,
      onOpenCommentsForVersion: h.onOpenCommentsForVersion,
      onCommentAttribute: h.onCommentAttribute,
      onNavigate: h.onNavigate,
      onRegisterPreview: h.onRegisterPreview
    }
  );
}
const si = {
  id: "psm-editor",
  zone: "editor",
  init(k) {
    Na = k, Ua(k);
  },
  matches(k) {
    return (k == null ? void 0 : k.serviceCode) === "psm" && (k == null ? void 0 : k.itemCode) === "node";
  },
  Component: ti
};
export {
  si as default
};
