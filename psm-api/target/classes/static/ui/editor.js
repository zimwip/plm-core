import { jsx as e, jsxs as n, Fragment as xt } from "react/jsx-runtime";
import { useState as N, useCallback as Ve, useEffect as j, useRef as De, useMemo as Zt, Fragment as Et } from "react";
import en from "react-dom";
import { p as W, i as Ya } from "./psmApi-Br1g6HiW.js";
function Ha({
  shellAPI: b,
  nodeId: o,
  userId: d,
  filterVersionId: E,
  onClose: O
}) {
  const { api: x, useWebSocket: k } = b, [w, C] = N([]), B = Ve(async () => {
    if (o)
      try {
        const A = await x.getSignatureHistory(d, o);
        C(Array.isArray(A) ? A : []);
      } catch {
      }
  }, [o, d]);
  j(() => {
    B();
  }, [B]), k(
    o ? `/topic/nodes/${o}` : null,
    (A) => {
      A.nodeId && A.nodeId !== o || A.event === "SIGNED" && B();
    },
    d
  );
  const P = E ? w.filter((A) => (A.node_version_id || A.NODE_VERSION_ID) === E) : w, M = [], F = {};
  return P.forEach((A) => {
    const _ = A.revision || A.REVISION || "", H = A.iteration ?? A.ITERATION ?? 0, h = `${_}.${H}`;
    F[h] || (F[h] = { key: h, revision: _, iteration: H, items: [] }, M.push(F[h])), F[h].items.push(A);
  }), /* @__PURE__ */ e("div", { className: "signature-modal-overlay", onClick: O, children: /* @__PURE__ */ n("div", { className: "signature-modal", onClick: (A) => A.stopPropagation(), children: [
    /* @__PURE__ */ n("div", { className: "signature-modal-header", children: [
      /* @__PURE__ */ n("span", { children: [
        "Signatures",
        P.length > 0 && /* @__PURE__ */ e("span", { className: "comment-count-badge", children: P.length })
      ] }),
      /* @__PURE__ */ e("button", { className: "comment-close-btn", onClick: O, title: "Close", children: "✕" })
    ] }),
    /* @__PURE__ */ e("div", { className: "signature-modal-body", children: M.length === 0 ? /* @__PURE__ */ e("div", { className: "comment-empty", children: "No signatures on this version" }) : M.map((A) => /* @__PURE__ */ n("div", { className: "sig-group", children: [
      /* @__PURE__ */ n("div", { className: "sig-group-header", children: [
        "Rev ",
        A.iteration === 0 ? A.revision : `${A.revision}.${A.iteration}`
      ] }),
      A.items.map((_, H) => {
        const h = _.meaning || _.MEANING || "", q = _.signed_by || _.SIGNED_BY || _.signedBy || "", D = _.comment || _.COMMENT || "", X = _.signed_at || _.SIGNED_AT || _.signedAt || "", z = X ? new Date(X).toLocaleString(void 0, { dateStyle: "short", timeStyle: "short" }) : "";
        return /* @__PURE__ */ n("div", { className: "sig-entry", children: [
          /* @__PURE__ */ e("span", { className: `sig-meaning-badge ${h === "Rejected" ? "sig-rejected" : "sig-approved"}`, children: h }),
          /* @__PURE__ */ e("span", { className: "sig-by", children: q }),
          D && /* @__PURE__ */ e("span", { className: "sig-comment-text", children: D }),
          /* @__PURE__ */ e("span", { className: "sig-date", children: z })
        ] }, H);
      })
    ] }, A.key)) })
  ] }) });
}
function tn(b) {
  var o;
  return ((o = (b.linkAttributeValues || []).find((d) => d.attributeId === "kind")) == null ? void 0 : o.value) || null;
}
function qa(b) {
  var o;
  return ((o = (b.linkAttributeValues || []).find((d) => d.attributeId === "layer")) == null ? void 0 : o.value) || "main";
}
function Xa(b) {
  var E;
  const o = (((E = b.targetDetails) == null ? void 0 : E.contentType) || "").toLowerCase(), d = (b.displayKey || b.targetKey || "").toLowerCase();
  return o.includes("step") || o.includes("stp") || d.endsWith(".stp") || d.endsWith(".step") || d.endsWith(".p21");
}
function Ja(b) {
  if (b.targetSourceCode !== "DATA_LOCAL") return !1;
  const o = tn(b);
  return o === "simplified" || o === "design" || o === "original" ? !0 : Xa(b);
}
function Qa(b) {
  return { "st-draft": "Draft", "st-inreview": "In Review", "st-released": "Released", "st-frozen": "Frozen", "st-obsolete": "Obsolete" }[b] || b;
}
function Za(b, o, d) {
  let E = b;
  for (; E; ) {
    if (E === o) return !0;
    const O = (d || []).find((x) => (x.id || x.ID) === E);
    E = O && (O.parent_node_type_id || O.PARENT_NODE_TYPE_ID) || null;
  }
  return !1;
}
function Te({ stateId: b, stateName: o, stateColorMap: d }) {
  const E = (d == null ? void 0 : d[b]) || "#6b7280";
  return /* @__PURE__ */ n("span", { className: "pill", style: { color: E, background: `${E}18`, border: `1px solid ${E}30` }, children: [
    /* @__PURE__ */ e("span", { className: "pill-dot", style: { background: E } }),
    o || Qa(b)
  ] });
}
function ei(b, o) {
  const d = new Array(16);
  for (let E = 0; E < 4; E++)
    for (let O = 0; O < 4; O++) {
      let x = 0;
      for (let k = 0; k < 4; k++) x += b[E * 4 + k] * o[k * 4 + O];
      d[E * 4 + O] = x;
    }
  return d;
}
async function Sa(b, o, d, E, O, x, k, w, C, B, P = null, M = null) {
  var h;
  if (k > w) return [];
  if (k === 0 && P === null && C.has(d)) return [];
  k === 0 && P === null && C.add(d);
  const F = x.filter(Ja), A = /* @__PURE__ */ new Map();
  for (const q of F) {
    const D = qa(q), X = tn(q);
    A.has(D) || A.set(D, { simplified: null, fallback: null });
    const z = A.get(D);
    X === "simplified" ? z.simplified = q : z.fallback || (z.fallback = q);
  }
  const _ = [];
  for (const [q, { simplified: D, fallback: X }] of A) {
    if (q !== "main") continue;
    const z = D || X;
    if (!z) continue;
    const U = tn(z) || "design";
    _.push({
      uuid: z.targetKey,
      fileName: z.displayKey || z.targetKey,
      sizeBytes: (h = z.targetDetails) == null ? void 0 : h.sizeBytes,
      instanceKey: P ? `${z.targetKey}#${P}` : z.targetKey,
      matrix: M,
      kind: U
    });
  }
  const H = [];
  if (_.length > 0 && H.push({ nodeId: d, nodeLabel: E, stateColor: O, depth: k, parts: _, instanceId: P || d }), k < w) {
    const q = x.filter((D) => D.targetSourceCode === "SELF" && D.targetNodeId);
    await Promise.all(q.map(async (D) => {
      var z;
      const X = D.linkId;
      if (!(!X || C.has(X))) {
        C.add(X);
        try {
          const U = (z = (D.linkAttributeValues || []).find((be) => be.attributeId === "position")) == null ? void 0 : z.value;
          let Ne = null;
          if (U) {
            const be = U.split(",").map(Number);
            be.length === 16 && be.every((Ct) => !isNaN(Ct)) && (Ne = be);
          }
          let he = null;
          M && Ne ? he = ei(M, Ne) : Ne ? he = Ne : M && (he = M);
          const et = await b.getChildLinks(null, D.targetNodeId), It = (B == null ? void 0 : B[D.targetState]) || "#6b7280", Tt = await Sa(
            b,
            o,
            D.targetNodeId,
            D.targetLogicalId || D.targetNodeId,
            It,
            Array.isArray(et) ? et : [],
            k + 1,
            w,
            new Set(C),
            B,
            P ? `${P}/${X}` : X,
            he
          );
          H.push(...Tt);
        } catch {
        }
      }
    }));
  }
  return H;
}
function ti({ jobData: b, onClose: o }) {
  const { job: d, results: E = [] } = b, O = d.status === "DONE" || d.status === "FAILED", x = E.reduce((w, C) => (w[C.action] = (w[C.action] || 0) + 1, w), {}), k = (w) => w === "CREATED" ? "var(--success)" : w === "UPDATED" ? "var(--accent)" : w === "REJECTED" ? "var(--danger)" : "var(--muted)";
  return /* @__PURE__ */ n(xt, { children: [
    /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }, children: [
      /* @__PURE__ */ e("span", { style: { fontSize: 18 }, children: d.status === "DONE" ? "✓" : d.status === "FAILED" ? "✕" : "⏳" }),
      /* @__PURE__ */ n("span", { style: { fontWeight: 600, color: d.status === "FAILED" ? "var(--danger)" : d.status === "DONE" ? d.errorSummary ? "var(--warning, #f5a623)" : "var(--success)" : void 0 }, children: [
        d.status === "PENDING" && "Queued…",
        d.status === "RUNNING" && "Processing…",
        d.status === "DONE" && `Complete — ${E.length} node${E.length !== 1 ? "s" : ""}${d.errorSummary ? " (with warnings)" : ""}`,
        d.status === "FAILED" && `Failed: ${d.errorSummary || "unknown error"}`
      ] })
    ] }),
    d.status === "DONE" && d.errorSummary && /* @__PURE__ */ e("div", { style: { marginBottom: 12, padding: "8px 10px", background: "var(--warning-bg, #fff8e1)", border: "1px solid var(--warning, #f5a623)", borderRadius: 6, fontSize: 12, color: "var(--warning-text, #7a4f00)", whiteSpace: "pre-wrap" }, children: d.errorSummary }),
    Object.keys(x).length > 0 && /* @__PURE__ */ e("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }, children: Object.entries(x).map(([w, C]) => /* @__PURE__ */ n("span", { style: { fontSize: 12, padding: "2px 8px", borderRadius: 4, border: `1px solid ${k(w)}40`, color: k(w) }, children: [
      w,
      ": ",
      C
    ] }, w)) }),
    E.length > 0 && /* @__PURE__ */ e("div", { style: { maxHeight: 240, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 6, marginBottom: 16 }, children: /* @__PURE__ */ n("table", { style: { width: "100%", fontSize: 12, borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { style: { background: "var(--surface)", position: "sticky", top: 0 }, children: [
        /* @__PURE__ */ e("th", { style: { padding: "6px 10px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }, children: "Name" }),
        /* @__PURE__ */ e("th", { style: { padding: "6px 10px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }, children: "Type" }),
        /* @__PURE__ */ e("th", { style: { padding: "6px 10px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }, children: "Result" })
      ] }) }),
      /* @__PURE__ */ e("tbody", { children: E.map((w, C) => /* @__PURE__ */ n("tr", { style: { borderTop: C > 0 ? "1px solid var(--border)" : void 0 }, children: [
        /* @__PURE__ */ e("td", { style: { padding: "5px 10px" }, children: w.name }),
        /* @__PURE__ */ e("td", { style: { padding: "5px 10px", color: "var(--muted)", fontSize: 11 }, children: w.type }),
        /* @__PURE__ */ e("td", { style: { padding: "5px 10px" }, children: /* @__PURE__ */ n("span", { style: { color: k(w.action), fontSize: 11 }, children: [
          w.action,
          w.errorMessage ? ` — ${w.errorMessage}` : ""
        ] }) })
      ] }, w.id || C)) })
    ] }) }),
    /* @__PURE__ */ e("div", { style: { display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ e("button", { className: "btn btn-sm", onClick: o, children: O ? "Close" : "Dismiss (job continues in background)" }) })
  ] });
}
function ni({
  shellAPI: b,
  nodeId: o,
  userId: d,
  tx: E,
  nodeTypes: O,
  stateColorMap: x,
  activeSubTab: k,
  onSubTabChange: w,
  toast: C,
  onAutoOpenTx: B,
  onDescriptionLoaded: P,
  onRefreshItemData: M,
  itemData: F,
  onOpenCommentsForVersion: A,
  onCommentAttribute: _,
  onNavigate: H,
  onRegisterPreview: h
}) {
  var Vn, Pn, zn, $n, Bn, Mn, Fn, Kn, Wn, jn, Gn, Un, Yn, Hn, qn, Xn, Jn, Qn, Zn, ea, ta, na, aa, ia, la, sa, ra, oa, da, ca, ha, ua, ma, fa, pa, ga, ya, Na;
  const {
    usePlmStore: q,
    useWebSocket: D,
    api: X,
    txApi: z,
    authoringApi: U,
    pollJobStatus: Ne,
    getDraggedNode: he,
    clearDraggedNode: et,
    getLinkRowForSource: It,
    icons: { NODE_ICONS: Tt, SignIcon: be },
    components: { LifecycleDiagram: Ct }
  } = b, [Pe, nn] = N([]), [Ea, At] = N({}), [ue, ze] = N({}), [te, $e] = N([]), [xa, wt] = N(!1), [Lt, Ce] = N(null), [Ae, me] = N(null), [tt, fe] = N({}), [we, nt] = N(null), [an, at] = N(null), Q = De(null), [it, _t] = N(null), [Ia, Rt] = N(!1), [Be, lt] = N([]), [Ot, st] = N([]), [le, ve] = N(!1), [Me, rt] = N(!1), [Dt, ln] = N([]), [Ta, sn] = N({}), [Se, ot] = N(""), [Fe, Le] = N(""), [Ke, We] = N([]), [Vt, ne] = N(-1), [rn, se] = N(!1), [ke, je] = N(""), [on, Pt] = N(!1), [Ca, Ge] = N(null), [dn, zt] = N(""), [_e, re] = N(""), [$t, dt] = N({}), [Z, ct] = N([]), [ht, J] = N(!1), [pe, G] = N(-1), [Aa, Ue] = N(null), [cn, Bt] = N(null), [wa, hn] = N(null), [un, Ye] = N(!1), [mn, fn] = N([]), [pn, Mt] = N(!1), [ut, mt] = N(null), [gn, ft] = N(!1), [Ee, pt] = N(null), [ee, gt] = N(null), [xe, He] = N(null), [La, Ft] = N(!1), [yn, Kt] = N(null), [_a, Nn] = N({}), [bn, vn] = N(!0), Wt = De(null), jt = De(null), qe = De(0), Gt = De(null), yt = De(!1), [I, Sn] = N(() => (F == null ? void 0 : F.data) ?? null);
  j(() => {
    F != null && F.data && Sn(F.data);
  }, [F]);
  const Nt = Ve(() => {
    M && M(o);
  }, [o, M]), Ra = Ve((t) => {
    Sn((a) => {
      if (!a) return a;
      const l = (a.fields || []).map(
        (s) => t[s.name] !== void 0 ? { ...s, value: t[s.name] } : s
      );
      return { ...a, fields: l };
    });
  }, []), kn = q((t) => t.refreshAll), Oa = q((t) => t.refreshNodes), bt = q((t) => t.refreshTx);
  j(() => {
    $e([]);
  }, [o]);
  const Da = (Vn = I == null ? void 0 : I.metadata) == null ? void 0 : Vn.currentVersionId;
  j(() => {
    var t;
    (t = I == null ? void 0 : I.metadata) != null && t.violations && $e(I.metadata.violations);
  }, [Da]), j(() => {
    vn(te.length > 1);
  }, [te.length]);
  const Va = Zt(
    () => Object.fromEntries(te.filter((t) => t.attrCode).map((t) => [t.attrCode, t])),
    [te]
  ), vt = Ve(async () => {
    if (!le)
      try {
        const [t, a] = await Promise.all([
          W.getChildLinks(d, o).catch(() => []),
          W.getParentLinks(d, o).catch(() => [])
        ]);
        lt(Array.isArray(t) ? t : []), st(Array.isArray(a) ? a : []), ve(!0);
      } catch (t) {
        C(t, "error");
      }
  }, [o, d, le, C]);
  j(() => {
    le || vt();
  }, [le, vt]), j(() => {
    var s, r;
    if (!le) return;
    let t = !1;
    Mt(!0);
    const a = ((s = I == null ? void 0 : I.metadata) == null ? void 0 : s.logicalId) || (I == null ? void 0 : I.title) || o, l = (x == null ? void 0 : x[(r = I == null ? void 0 : I.metadata) == null ? void 0 : r.state]) || "#6b7280";
    return Sa(W, d, o, a, l, Be, 0, 3, /* @__PURE__ */ new Set(), x, null, null).then((c) => {
      t || (yt.current = !0, fn(c), Mt(!1));
    }).catch(() => {
      t || (yt.current = !0, Mt(!1));
    }), () => {
      t = !0;
    };
  }, [le, o, Be, (Pn = I == null ? void 0 : I.metadata) == null ? void 0 : Pn.state]), j(() => {
    yt.current && (h == null || h({ nodes: mn, loading: pn }));
  }, [mn, pn]);
  const oe = (E == null ? void 0 : E.ID) || (E == null ? void 0 : E.id) || null;
  j(() => {
    I && P && P(I);
  }, [I]), j(() => {
    nn([]), At({}), ze({}), wt(!1), Ce(null), me(null), fe({}), at(null), Q.current && (clearInterval(Q.current), Q.current = null), _t(null), Rt(!1), rt(!1), ln([]), sn({}), ot(""), Le(""), We([]), ne(-1), se(!1), je(""), Pt(!1), Ge(null), zt(""), re(""), dt({}), ct([]), J(!1), G(-1), Ue(null), Bt(null), hn(null), Ye(!1), mt(null), ft(!1), pt(null), Ft(!1), Kt(null), Nn({}), yt.current = !1, fn([]), h == null || h({ nodes: [], loading: !0 });
  }, [o]);
  const Xe = Ve(async () => {
    try {
      const [t, a, l] = await Promise.all([
        W.getVersionHistory(d, o).catch(() => []),
        W.getComments(d, o).catch(() => []),
        W.getSignatureHistory(d, o).catch(() => [])
      ]);
      nn(Array.isArray(t) ? t : []);
      const s = {};
      Array.isArray(l) && l.forEach((c) => {
        const f = c.node_version_id || c.NODE_VERSION_ID;
        f && (s[f] || (s[f] = { count: 0, hasRejected: !1 }), s[f].count += 1, (c.meaning || c.MEANING || "").toUpperCase() === "REJECTED" && (s[f].hasRejected = !0));
      }), Nn(s);
      const r = {};
      Array.isArray(a) && a.forEach((c) => {
        const f = c.versionId;
        f && (r[f] = (r[f] || 0) + 1);
      }), At(r), ze({}), await Nt();
    } catch (t) {
      C(t, "error");
    }
  }, [o, d, Nt, C]);
  j(() => {
    Xe();
  }, [Xe]);
  const Pa = Ve(async () => {
    try {
      const t = await W.getComments(d, o).catch(() => []), a = {};
      Array.isArray(t) && t.forEach((l) => {
        const s = l.versionId;
        s && (a[s] = (a[s] || 0) + 1);
      }), At(a);
    } catch {
    }
  }, [o, d]);
  j(() => {
    ve(!1), lt([]), st([]), gt(null), He(null);
  }, [o]), j(() => {
    k === "pbs" && vt();
  }, [k, vt]), j(() => () => {
    clearTimeout(Wt.current), clearTimeout(jt.current), Q.current && clearInterval(Q.current);
  }, []), j(() => {
    Me && Gt.current && Gt.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [Me]), D(
    o ? `/topic/nodes/${o}` : null,
    (t) => {
      if (t.nodeId && t.nodeId !== o) return;
      ["STATE_CHANGED", "LOCK_ACQUIRED", "LOCK_RELEASED", "ITEM_UPDATED", "SIGNED"].includes(t.event) && (Nt(), ["LOCK_RELEASED", "LOCK_ACQUIRED", "ITEM_UPDATED"].includes(t.event) && Oa()), t.event === "COMMENT_ADDED" && Pa();
    },
    d
  );
  async function za(t) {
    const a = [...Pe].sort((r, c) => (r.version_number || r.VERSION_NUMBER) - (c.version_number || c.VERSION_NUMBER)), l = a.findIndex((r) => (r.version_number || r.VERSION_NUMBER) === t);
    if (l <= 0) return;
    const s = a[l - 1].version_number || a[l - 1].VERSION_NUMBER;
    Rt(!0);
    try {
      const r = await W.getVersionDiff(d, o, s, t);
      _t({ data: r, v1Num: s, v2Num: t });
    } catch (r) {
      C(r, "error");
    } finally {
      Rt(!1);
    }
  }
  async function En(t = null) {
    var a;
    ot(""), Le((t == null ? void 0 : t.logicalId) || ""), We([]), ne(-1), se(!1), je("");
    try {
      const [l, s] = await Promise.all([
        X.getNodeTypeLinkTypes(d, (a = I == null ? void 0 : I.metadata) == null ? void 0 : a.nodeTypeId).catch(() => []),
        W.getSources(d).catch(() => [])
      ]);
      let r = Array.isArray(l) ? l : [];
      if (t != null && t.nodeTypeId) {
        const f = t.nodeTypeId;
        r = r.filter((v) => {
          const m = v.target_type || v.TARGET_TYPE;
          return !m || Za(f, m, O);
        }), r.length === 1 && ot(r[0].id || r[0].ID);
      }
      ln(r);
      const c = {};
      (Array.isArray(s) ? s : []).forEach((f) => {
        c[f.id] = f;
      }), sn(c), rt(!0);
    } catch (l) {
      C(l, "error");
    }
  }
  async function xn(t, a, l) {
    try {
      const s = await W.getSourceKeys(d, t, a, l, 25);
      We(Array.isArray(s) ? s : []);
    } catch {
      We([]);
    }
  }
  async function St(t, a, l) {
    try {
      const s = await W.getSourceKeys(d, t, a, l, 25);
      ct(Array.isArray(s) ? s : []);
    } catch {
      ct([]);
    }
  }
  async function $a() {
    var r;
    if (!Se) return;
    const t = Dt.find((c) => (c.id || c.ID) === Se), a = (t == null ? void 0 : t.target_source_id) || (t == null ? void 0 : t.TARGET_SOURCE_ID) || "SELF", l = (t == null ? void 0 : t.target_type) || (t == null ? void 0 : t.TARGET_TYPE) || null;
    if (!Fe) return;
    const s = Fe;
    Pt(!0);
    try {
      const c = oe || await B();
      if (!c) return;
      const f = (r = I.actions) == null ? void 0 : r.find((m) => m.code === "create_link");
      if (!f) throw new Error("create_link action not available for this node type");
      const v = {
        linkTypeId: Se,
        targetSourceCode: a,
        ...l ? { targetType: l } : {},
        targetKey: s,
        linkLogicalId: ke || ""
      };
      await (f.path ? U.executeViaDescriptor(f, o, d, c, v) : U.executeAction(o, f.code, d, c, v)), C("Link created", "success"), rt(!1), je(""), Le(""), We([]), ne(-1), se(!1), ve(!1), await bt(), await Xe();
    } catch (c) {
      C(c, "error");
    } finally {
      Pt(!1);
    }
  }
  async function Ba(t, a, l, s) {
    var c;
    const r = (c = I.actions) == null ? void 0 : c.find((f) => f.code === "update_link");
    if (r) {
      Ye(!0);
      try {
        const f = oe || await B();
        if (!f) return;
        const v = {};
        s && Object.entries(s).forEach(([S, g]) => {
          v[`linkAttr_${S}`] = g;
        });
        const m = { linkId: t, logicalId: a, ...l ? { targetKey: l } : {}, ...v };
        await (r.path ? U.executeViaDescriptor(r, o, d, f, m) : U.executeAction(o, r.code, d, f, m)), Ge(null), await bt(), ve(!1), await Promise.all([
          W.getChildLinks(d, o).then((S) => lt(Array.isArray(S) ? S : [])),
          W.getParentLinks(d, o).then((S) => st(Array.isArray(S) ? S : []))
        ]), ve(!0);
      } catch (f) {
        C(f, "error");
      } finally {
        Ye(!1);
      }
    }
  }
  async function Ma(t) {
    var l;
    const a = (l = I.actions) == null ? void 0 : l.find((s) => s.code === "delete_link");
    if (a) {
      Ye(!0), Ue(null);
      try {
        const s = oe || await B();
        if (!s) return;
        await (a.path ? U.executeViaDescriptor(a, o, d, s, { linkId: t }) : U.executeAction(o, a.code, d, s, { linkId: t })), Bt((r) => r === t ? null : r), await bt(), ve(!1), await Promise.all([
          W.getChildLinks(d, o).then((r) => lt(Array.isArray(r) ? r : [])),
          W.getParentLinks(d, o).then((r) => st(Array.isArray(r) ? r : []))
        ]), ve(!0);
      } catch (s) {
        C(s, "error");
      } finally {
        Ye(!1);
      }
    }
  }
  async function In(t, a = {}) {
    var s;
    const l = t.bodyShape === "MULTIPART";
    l || me(null), wt(!0), l && nt(0);
    try {
      const r = l ? (f) => nt(f) : void 0, c = t.path ? await U.executeViaDescriptor(t, o, d, oe, a, r) : await U.executeAction(
        o,
        t.code,
        d,
        oe,
        a,
        (s = t.metadata) == null ? void 0 : s.transitionId
      );
      if (l && (me(null), nt(null)), c != null && c.jobId && t.jobStatusPath) {
        const f = t.jobStatusPath.replace("{jobId}", c.jobId);
        at({ id: c.jobId, data: { job: { id: c.jobId, status: c.status || "PENDING" }, results: [] } }), Q.current && clearInterval(Q.current), Q.current = setInterval(async () => {
          var v, m, S;
          try {
            const g = await Ne("psm", f);
            at((T) => T ? { ...T, data: g } : null), (((v = g.job) == null ? void 0 : v.status) === "DONE" || ((m = g.job) == null ? void 0 : m.status) === "FAILED") && (clearInterval(Q.current), Q.current = null, ((S = g.job) == null ? void 0 : S.status) === "DONE" && (await kn(), await Xe()));
          } catch {
          }
        }, 2e3);
        return;
      }
      (c == null ? void 0 : c.violations) !== void 0 && $e(c.violations), c != null && c.message && C(c.message, "success"), await kn(), await Xe();
    } catch (r) {
      me(null), nt(null), C(r, "error");
    } finally {
      wt(!1);
    }
  }
  function Ut(t) {
    var l;
    const a = (t.parameters || []).filter((s) => s.widget);
    if (a.length > 0) {
      const s = {};
      a.forEach((r) => {
        r.defaultValue && (s[r.name] = r.defaultValue);
      }), fe(s), me(t);
    } else ((l = t.metadata) == null ? void 0 : l.displayCategory) === "DANGEROUS" ? (fe({}), me(t)) : In(t);
  }
  async function Fa(t, a, l) {
    var r;
    Ce("saving");
    const s = { ...t, _description: "Auto-save" };
    try {
      const c = await (l != null && l.path ? U.executeViaDescriptor(l, o, d, a, s) : U.executeAction(o, (l == null ? void 0 : l.code) ?? l, d, a, s));
      Ra(t), ze({}), $e((c == null ? void 0 : c.violations) || []), Ce("saved"), clearTimeout(jt.current), jt.current = setTimeout(() => Ce(null), 2e3), bt();
    } catch (c) {
      Ce(null);
      const f = (r = c.detail) == null ? void 0 : r.violations;
      f != null && f.length ? $e(f) : C(c, "error");
    }
  }
  function Tn(t, a, l) {
    clearTimeout(Wt.current), Ce(null), Wt.current = setTimeout(() => Fa(t, a, l), 800);
  }
  j(() => {
    !ee || !o || !d || (Ft(!0), W.getNodeDescription(d, o, null, ee).then((t) => He(t)).catch((t) => C(t, "error")).finally(() => Ft(!1)));
  }, [ee, o, d]);
  const u = ee && xe ? xe : I, ae = Zt(() => {
    var r;
    const t = [], a = /* @__PURE__ */ new Map(), l = ((r = u == null ? void 0 : u.metadata) == null ? void 0 : r.attributeMeta) || {};
    ((u == null ? void 0 : u.fields) || []).forEach((c) => {
      if (!l[c.name]) return;
      const f = l[c.name] || {}, v = {
        ...c,
        id: c.name,
        // renderAttrField uses attr.id for edits map keys and React keys
        tooltip: c.hint,
        // renderAttrField uses attr.tooltip
        ...f
        // required, displayOrder, section, namingRegex, allowedValues, sourceDomainId, sourceDomainName
      };
      v.sourceDomainId ? (a.has(v.sourceDomainId) || a.set(v.sourceDomainId, {
        id: v.sourceDomainId,
        name: v.sourceDomainName || v.sourceDomainId,
        attrs: []
      }), a.get(v.sourceDomainId).attrs.push(v)) : t.push(v);
    });
    const s = Array.from(a.values()).sort((c, f) => c.name.localeCompare(f.name));
    return { base: t, domains: s };
  }, [u == null ? void 0 : u.fields, (zn = u == null ? void 0 : u.metadata) == null ? void 0 : zn.attributeMeta]);
  Zt(() => ae.base.reduce((t, a) => {
    const l = a.section || "General";
    return t[l] || (t[l] = []), t[l].push(a), t;
  }, {}), [ae.base]);
  const [Cn, Yt] = N(null);
  if (j(() => {
    const t = ae.domains;
    if (t.length === 0) {
      Yt(null);
      return;
    }
    Yt((a) => a && t.some((l) => l.id === a) ? a : t[0].id);
  }, [ae.domains]), !I) return /* @__PURE__ */ n("div", { className: "empty", style: { padding: "60px 24px" }, children: [
    /* @__PURE__ */ e("div", { className: "empty-icon", children: "◎" }),
    /* @__PURE__ */ e("div", { className: "empty-text", children: "Loading…" })
  ] });
  const kt = (($n = u == null ? void 0 : u.metadata) == null ? void 0 : $n.txStatus) === "OPEN", Je = (u == null ? void 0 : u.actions) || [];
  (Bn = u == null ? void 0 : u.metadata) == null || Bn.fingerprintChanged;
  const Ka = /* @__PURE__ */ new Set(["update_node", "create_link", "update_link", "delete_link", "read", "comment", "baseline", "manage_metamodel", "manage_roles", "manage_baselines"]), An = Je.find((t) => {
    var a;
    return t.code === "update_node" && ((a = t.metadata) == null ? void 0 : a.authorized) !== !1;
  }), wn = Je.filter(
    (t) => {
      var a, l, s;
      return ((a = t.metadata) == null ? void 0 : a.authorized) !== !1 && !Ka.has(t.code) && ((l = t.metadata) == null ? void 0 : l.displayCategory) !== "STRUCTURAL" && ((s = t.metadata) == null ? void 0 : s.displayCategory) !== "PROPERTY";
    }
  ), Ht = Je.filter(
    (t) => {
      var a, l;
      return ((a = t.metadata) == null ? void 0 : a.authorized) !== !1 && ((l = t.metadata) == null ? void 0 : l.displayCategory) === "PROPERTY";
    }
  ), Ln = (t) => {
    var a;
    return ((a = t == null ? void 0 : t.guardViolations) == null ? void 0 : a.length) > 0;
  }, _n = (t) => {
    const a = t == null ? void 0 : t.guardViolations;
    return a != null && a.length ? `Blocked:
• ` + a.map((l) => typeof l == "string" ? l : l.message || l.code).join(`
• `) : "";
  }, Wa = Je.filter((t) => {
    var a;
    return (a = t.code) == null ? void 0 : a.startsWith("transition");
  }), ja = new Map(
    Wa.filter((t) => {
      var a;
      return ((a = t.guardViolations) == null ? void 0 : a.length) > 0;
    }).map((t) => [t.label, t.guardViolations])
  ), Rn = wn.filter((t) => {
    var a;
    return (a = t.code) == null ? void 0 : a.startsWith("transition");
  }), Re = (Mn = u == null ? void 0 : u.actions) == null ? void 0 : Mn.some((t) => t.code === "update_link"), Ie = (Fn = u == null ? void 0 : u.actions) == null ? void 0 : Fn.some((t) => t.code === "delete_link"), qt = Je.find((t) => t.code === "checkout"), Xt = Re || Ie || !!qt;
  (Kn = u == null ? void 0 : u.metadata) != null && Kn.lifecycleId;
  const $ = (Wn = u == null ? void 0 : u.metadata) != null && Wn.nodeTypeId ? (O || []).find((t) => (t.id || t.ID) === u.metadata.nodeTypeId) : null, de = ($ == null ? void 0 : $.color) || ($ == null ? void 0 : $.COLOR) || null, On = ($ == null ? void 0 : $.icon) || ($ == null ? void 0 : $.ICON) || null, Jt = On ? Tt[On] : null, Dn = ($ == null ? void 0 : $.name) || ($ == null ? void 0 : $.NAME) || null, Ga = ((jn = Pe.find(
    (t) => {
      var a;
      return (t.id || t.ID) === ((a = I == null ? void 0 : I.metadata) == null ? void 0 : a.currentVersionId);
    }
  )) == null ? void 0 : jn.version_number) ?? null;
  return /* @__PURE__ */ n(
    "div",
    {
      style: { flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" },
      onClick: () => Ee && pt(null),
      children: [
        Ee && en.createPortal(
          /* @__PURE__ */ e(
            "div",
            {
              className: "attr-ctx-menu",
              style: { top: Ee.y, left: Ee.x },
              onClick: (t) => t.stopPropagation(),
              children: /* @__PURE__ */ n(
                "button",
                {
                  className: "attr-ctx-item",
                  onClick: () => {
                    _ == null || _(Ee.attrId, Ee.attrLabel), pt(null);
                  },
                  children: [
                    "💬 Comment on ",
                    /* @__PURE__ */ n("code", { children: [
                      "#",
                      Ee.attrId
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
              (Jt || de || Dn) && /* @__PURE__ */ n("span", { style: {
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: de ? `${de}18` : "rgba(100,116,139,.1)",
                border: `1px solid ${de ? `${de}30` : "rgba(100,116,139,.2)"}`,
                borderRadius: 4,
                padding: "2px 7px",
                fontSize: 11,
                color: de || "var(--muted)",
                fontWeight: 600,
                letterSpacing: ".01em",
                flexShrink: 0
              }, children: [
                Jt ? /* @__PURE__ */ e(Jt, { size: 11, color: de || "var(--muted)", strokeWidth: 2 }) : de ? /* @__PURE__ */ e("span", { style: { width: 7, height: 7, borderRadius: 1, background: de, display: "inline-block" } }) : null,
                Dn
              ] }),
              /* @__PURE__ */ e("span", { className: "node-identity", children: ((Gn = u.metadata) == null ? void 0 : Gn.logicalId) || u.title }),
              u.subtitle && /* @__PURE__ */ e("span", { className: "node-display-name", children: u.subtitle }),
              /* @__PURE__ */ n("span", { style: {
                fontFamily: "var(--mono)",
                fontSize: 13,
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: 4,
                letterSpacing: ".01em",
                color: ee ? "#92400e" : "var(--muted)",
                background: ee ? "rgba(251,191,36,.25)" : "rgba(100,116,139,.1)",
                border: ee ? "1px solid rgba(251,191,36,.5)" : "none"
              }, children: [
                ee && "🕐 ",
                ((Un = u.metadata) == null ? void 0 : Un.iteration) === 0 ? (Yn = u.metadata) == null ? void 0 : Yn.revision : `${(Hn = u.metadata) == null ? void 0 : Hn.revision}.${(qn = u.metadata) == null ? void 0 : qn.iteration}`
              ] }),
              /* @__PURE__ */ e(Te, { stateId: (Xn = u.metadata) == null ? void 0 : Xn.state, stateName: (Jn = u.metadata) == null ? void 0 : Jn.stateName, stateColorMap: x }),
              !ee && ((Zn = (Qn = I.metadata) == null ? void 0 : Qn.lock) == null ? void 0 : Zn.locked) && /* @__PURE__ */ n("span", { className: "pill", style: { color: "var(--muted)", background: "rgba(100,116,139,.1)", border: "1px solid rgba(100,116,139,.2)" }, children: [
                "🔒 ",
                (ta = (ea = I.metadata) == null ? void 0 : ea.lock) == null ? void 0 : ta.lockedBy
              ] })
            ] }),
            /* @__PURE__ */ n("div", { className: "node-meta", children: [
              kt && ((aa = (na = u == null ? void 0 : u.metadata) == null ? void 0 : na.lock) == null ? void 0 : aa.lockedBy) === d && /* @__PURE__ */ e("span", { className: "pill", style: { color: "var(--warn)", background: "rgba(232,169,71,.1)", border: "1px solid rgba(232,169,71,.25)" }, children: "✎ editing" }),
              kt && ((la = (ia = u == null ? void 0 : u.metadata) == null ? void 0 : ia.lock) == null ? void 0 : la.lockedBy) === d && /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--warn)", fontStyle: "italic", opacity: 0.85 }, children: "⚡ uncommitted changes" }),
              kt && ((ra = (sa = u == null ? void 0 : u.metadata) == null ? void 0 : sa.lock) == null ? void 0 : ra.lockedBy) && ((da = (oa = u == null ? void 0 : u.metadata) == null ? void 0 : oa.lock) == null ? void 0 : da.lockedBy) !== d && /* @__PURE__ */ n("span", { style: { fontSize: 11, color: "var(--accent)", fontStyle: "italic", opacity: 0.9 }, children: [
                "✎ in progress — being edited by ",
                (ha = (ca = u.metadata) == null ? void 0 : ca.lock) == null ? void 0 : ha.lockedBy
              ] }),
              Lt === "saving" && /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--muted)", fontStyle: "italic" }, children: "saving…" }),
              Lt === "saved" && te.length === 0 && /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--success)" }, children: "✓ saved" }),
              Lt === "saved" && te.length > 0 && /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--warn)" }, children: "⚠ saved with issues" })
            ] })
          ] }),
          /* @__PURE__ */ e("div", { className: "node-actions", children: wn.map((t) => {
            var f, v, m;
            const a = Ln(t), l = a ? _n(t) : t.description || t.label, s = (f = t.metadata) == null ? void 0 : f.displayColor, r = s ? "" : ((v = t.metadata) == null ? void 0 : v.displayCategory) === "DANGEROUS" ? "btn-danger" : ((m = t.metadata) == null ? void 0 : m.displayCategory) === "PRIMARY" ? "btn-success" : "", c = s ? { color: s, borderColor: `${s}60`, background: `${s}15` } : void 0;
            return /* @__PURE__ */ e(
              "button",
              {
                className: `btn btn-sm ${r}`,
                disabled: xa || a,
                title: l,
                style: { ...c, ...a ? { opacity: 0.45, cursor: "not-allowed" } : {} },
                onClick: () => !a && Ut(t),
                children: a ? `✕ ${t.label}` : t.label
              },
              t.code
            );
          }) })
        ] }),
        Ae && en.createPortal(
          /* @__PURE__ */ e("div", { style: {
            position: "fixed",
            inset: 0,
            zIndex: 2e3,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }, onClick: we === null ? () => me(null) : void 0, children: /* @__PURE__ */ n("div", { style: {
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "28px 32px",
            maxWidth: 440,
            width: "90%",
            boxShadow: "0 8px 32px rgba(0,0,0,.4)"
          }, onClick: (t) => t.stopPropagation(), children: [
            /* @__PURE__ */ e("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 16 }, children: Ae.label }),
            we !== null && /* @__PURE__ */ n("div", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ n("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 6 }, children: [
                /* @__PURE__ */ e("span", { children: "Uploading…" }),
                /* @__PURE__ */ n("span", { children: [
                  we,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ e("div", { style: { height: 6, background: "var(--surface2)", borderRadius: 3, overflow: "hidden" }, children: /* @__PURE__ */ e("div", { style: { height: "100%", width: `${we}%`, background: "var(--accent)", borderRadius: 3, transition: "width 0.15s ease" } }) })
            ] }),
            (Ae.parameters || []).filter((t) => t.widget).map((t) => {
              var s;
              const a = tt[t.name] || "";
              let l = null;
              return ((s = t.options) == null ? void 0 : s.length) > 0 && (l = t.options), /* @__PURE__ */ n("div", { className: "field", style: { marginBottom: 14 }, children: [
                /* @__PURE__ */ n("label", { className: "field-label", children: [
                  t.label || t.name,
                  t.required && /* @__PURE__ */ e("span", { className: "field-req", children: "*" })
                ] }),
                t.widget === "FILE" ? /* @__PURE__ */ n(xt, { children: [
                  /* @__PURE__ */ e(
                    "input",
                    {
                      type: "file",
                      style: { color: "var(--text)" },
                      onChange: (r) => fe((c) => {
                        var f;
                        return { ...c, [t.name]: ((f = r.target.files) == null ? void 0 : f[0]) || null };
                      })
                    }
                  ),
                  t.hint && /* @__PURE__ */ e("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 4 }, children: t.hint })
                ] }) : l ? /* @__PURE__ */ n(
                  "select",
                  {
                    className: "field-input",
                    value: a,
                    onChange: (r) => fe((c) => ({ ...c, [t.name]: r.target.value })),
                    children: [
                      !a && /* @__PURE__ */ e("option", { value: "", children: "—" }),
                      l.map((r) => {
                        const c = typeof r == "object" && r !== null ? r.value : r, f = typeof r == "object" && r !== null ? r.label : r;
                        return /* @__PURE__ */ e("option", { value: c, children: f }, c);
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
                    onChange: (r) => fe((c) => ({ ...c, [t.name]: r.target.value })),
                    style: { resize: "vertical" }
                  }
                ) : t.widget === "CHECKBOX" ? /* @__PURE__ */ n("label", { style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }, children: [
                  /* @__PURE__ */ e(
                    "input",
                    {
                      type: "checkbox",
                      checked: tt[t.name] === "true",
                      onChange: (r) => fe((c) => ({ ...c, [t.name]: r.target.checked ? "true" : "false" }))
                    }
                  ),
                  t.hint && /* @__PURE__ */ e("span", { style: { fontSize: 12, color: "var(--muted)" }, children: t.hint })
                ] }) : /* @__PURE__ */ e(
                  "input",
                  {
                    className: "field-input",
                    placeholder: t.hint || "",
                    value: a,
                    onChange: (r) => fe((c) => ({ ...c, [t.name]: r.target.value }))
                  }
                )
              ] }, t.name);
            }),
            /* @__PURE__ */ n("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }, children: [
              /* @__PURE__ */ e("button", { className: "btn btn-sm", disabled: we !== null, onClick: () => me(null), children: "Cancel" }),
              /* @__PURE__ */ e(
                "button",
                {
                  className: "btn btn-sm btn-success",
                  disabled: we !== null || (Ae.parameters || []).filter((t) => t.widget && t.required).some((t) => {
                    const a = tt[t.name];
                    return t.widget === "FILE" ? !a : !String(a || "").trim();
                  }),
                  onClick: () => In(Ae, tt),
                  children: Ae.label
                }
              )
            ] })
          ] }) }),
          document.body
        ),
        an && en.createPortal(
          /* @__PURE__ */ e("div", { style: { position: "fixed", inset: 0, zIndex: 2e3, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ n("div", { style: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "28px 32px", maxWidth: 560, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,.4)" }, children: [
            /* @__PURE__ */ e("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 16 }, children: "CAD Import" }),
            /* @__PURE__ */ e(ti, { jobData: an.data, onClose: () => {
              Q.current && clearInterval(Q.current), at(null);
            } })
          ] }) }),
          document.body
        ),
        te.length > 0 && /* @__PURE__ */ n("div", { className: "violations-banner", children: [
          /* @__PURE__ */ n(
            "div",
            {
              className: "violations-banner-header",
              style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
              onClick: () => vn((t) => !t),
              children: [
                /* @__PURE__ */ e("span", { className: "violations-banner-title", children: "⚠ Will fail at commit" }),
                /* @__PURE__ */ n("span", { style: { fontSize: 11, opacity: 0.75 }, children: [
                  "(",
                  te.length,
                  " issue",
                  te.length > 1 ? "s" : "",
                  ")"
                ] }),
                /* @__PURE__ */ e("span", { style: { fontSize: 10, marginLeft: "auto", opacity: 0.6 }, children: bn ? "▾ show" : "▴ hide" })
              ]
            }
          ),
          !bn && /* @__PURE__ */ e("ul", { className: "violations-banner-list", children: te.map((t, a) => /* @__PURE__ */ e("li", { children: typeof t == "string" ? t : t.message }, a)) })
        ] }),
        /* @__PURE__ */ e("div", { className: "subtabs", children: [
          { key: "attributes", label: "Properties" },
          { key: "pbs", label: "PBS", count: le ? Be.length + Ot.length : void 0 },
          { key: "history", label: "History", count: Pe.length }
        ].map(({ key: t, label: a, count: l }) => /* @__PURE__ */ n(
          "div",
          {
            className: `subtab ${k === t ? "active" : ""}`,
            onClick: () => w(t),
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
        ee && /* @__PURE__ */ n("div", { style: {
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
            ee,
            xe && ` (${((ua = xe.metadata) == null ? void 0 : ua.iteration) === 0 ? (ma = xe.metadata) == null ? void 0 : ma.revision : `${(fa = xe.metadata) == null ? void 0 : fa.revision}.${(pa = xe.metadata) == null ? void 0 : pa.iteration}`})`,
            La && " — loading…",
            " · read-only"
          ] }),
          /* @__PURE__ */ e("button", { className: "btn btn-sm", onClick: () => {
            gt(null), He(null);
          }, children: "← Back to latest" })
        ] }),
        /* @__PURE__ */ n("div", { style: { flex: 1, overflow: "auto", minHeight: 0, display: "flex", flexDirection: "column" }, children: [
          k === "attributes" && (() => {
            var f, v, m, S, g, T, Y, K, ge;
            const t = (i) => {
              const y = ue[i.id] !== void 0 ? ue[i.id] : i.value || "", p = i.editable && !!oe && kt, L = i.allowedValues ? (() => {
                try {
                  return JSON.parse(i.allowedValues);
                } catch {
                  return [];
                }
              })() : null, R = L ? L.map((V) => typeof V == "object" && V !== null ? { value: V.value, label: V.label || V.value } : { value: V, label: V }) : null, ie = R ? R.map((V) => V.value) : null, Qe = i.namingRegex ? (() => {
                try {
                  return new RegExp(i.namingRegex);
                } catch {
                  return null;
                }
              })() : null, ce = (y || "").trim(), ye = !Qe || !ce ? null : Qe.test(ce), Ua = ye === !1, Qt = i.required && ue[i.id] === "", ba = ie && ue[i.id] != null && ue[i.id] !== "" && !ie.includes(ue[i.id]), Oe = Va[i.id], va = Oe && Oe.code !== "NAMING_REGEX" && Oe.code !== "ENUM_NOT_ALLOWED" && !(Oe.code === "REQUIRED" && Qt) ? Oe : null;
              return /* @__PURE__ */ n(
                "div",
                {
                  className: "field",
                  onContextMenu: (V) => {
                    V.preventDefault(), pt({ attrId: i.id, attrLabel: i.label, x: V.clientX, y: V.clientY });
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
                        disabled: !p,
                        onChange: (V) => {
                          if (!p) return;
                          const Ze = { ...ue, [i.id]: V.target.value };
                          ze(Ze), Tn(Ze, oe, An);
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
                          className: `field-input${Qt || ba || Ua || Oe ? " error" : ye === !0 ? " ok" : ""}`,
                          readOnly: !p,
                          title: i.tooltip || void 0,
                          placeholder: i.tooltip || (i.namingRegex ? `pattern: ${i.namingRegex}` : ""),
                          value: y,
                          onChange: (V) => {
                            if (!p) return;
                            const Ze = { ...ue, [i.id]: V.target.value };
                            ze(Ze), Tn(Ze, oe, An);
                          }
                        }
                      ),
                      ce && Qe && /* @__PURE__ */ e("span", { className: `logical-id-badge ${ye ? "ok" : "err"}`, children: ye ? "✓" : "✗" })
                    ] }),
                    !R && i.namingRegex && /* @__PURE__ */ n("div", { className: "logical-id-hint", children: [
                      /* @__PURE__ */ e("span", { className: "logical-id-hint-label", children: "Pattern" }),
                      /* @__PURE__ */ e("code", { className: "logical-id-hint-code", children: i.namingRegex }),
                      !ce && /* @__PURE__ */ e("span", { className: "logical-id-hint-idle", children: "start typing to validate" }),
                      ce && ye === !1 && /* @__PURE__ */ e("span", { className: "logical-id-hint-err", children: "no match" }),
                      ce && ye === !0 && /* @__PURE__ */ e("span", { className: "logical-id-hint-ok", children: "matches" })
                    ] }),
                    !i.namingRegex && i.tooltip && /* @__PURE__ */ e("span", { className: "field-hint", children: i.tooltip }),
                    Qt && /* @__PURE__ */ e("span", { className: "field-hint error", children: "Required" }),
                    ba && /* @__PURE__ */ e("span", { className: "field-hint error", children: "Value not in allowed list" }),
                    va && /* @__PURE__ */ e("span", { className: "field-hint error", children: va.message })
                  ]
                },
                i.id
              );
            }, a = (i) => {
              const y = i.reduce((p, L) => {
                const R = L.section || "General";
                return p[R] || (p[R] = []), p[R].push(L), p;
              }, {});
              return Object.entries(y).map(([p, L]) => /* @__PURE__ */ n("div", { children: [
                /* @__PURE__ */ e("div", { className: "section-label", children: p }),
                /* @__PURE__ */ e("div", { className: "attr-grid", children: [...L].sort((R, ie) => (R.displayOrder || 0) - (ie.displayOrder || 0)).map(t) })
              ] }, p));
            }, l = ae.domains.find((i) => i.id === Cn), s = (i) => {
              if (!i) return "";
              try {
                return new Date(i).toLocaleString();
              } catch {
                return i;
              }
            }, r = ae.base.filter((i) => (i.section || "General") === "Identity"), c = ae.base.filter((i) => (i.section || "General") !== "Identity");
            return /* @__PURE__ */ n("div", { children: [
              /* @__PURE__ */ n("div", { children: [
                /* @__PURE__ */ e("div", { className: "section-label", children: "Identity" }),
                /* @__PURE__ */ n("div", { className: "attr-grid", children: [
                  /* @__PURE__ */ n("div", { className: "field", children: [
                    /* @__PURE__ */ e("label", { className: "field-label", children: ((f = u.metadata) == null ? void 0 : f.logicalIdLabel) || "Identifier" }),
                    /* @__PURE__ */ e("input", { className: "field-input", readOnly: !0, value: ((v = u.metadata) == null ? void 0 : v.logicalId) || "" })
                  ] }),
                  /* @__PURE__ */ n("div", { className: "field", children: [
                    /* @__PURE__ */ e("label", { className: "field-label", children: "External ID" }),
                    /* @__PURE__ */ e(
                      "input",
                      {
                        className: "field-input",
                        value: ut !== null ? ut : ((m = u.metadata) == null ? void 0 : m.externalId) || "",
                        placeholder: "—",
                        onChange: (i) => mt(i.target.value),
                        onFocus: () => {
                          var i;
                          return mt(((i = u.metadata) == null ? void 0 : i.externalId) || "");
                        },
                        onBlur: async () => {
                          var y;
                          if (ut === null) return;
                          const i = ut.trim();
                          i !== (((y = u.metadata) == null ? void 0 : y.externalId) || "") && (await W.updateExternalId(d, o, i).catch(() => {
                          }), await Nt()), mt(null);
                        }
                      }
                    )
                  ] }),
                  r.sort((i, y) => (i.displayOrder || 0) - (y.displayOrder || 0)).map(t),
                  /* @__PURE__ */ n("div", { className: "field", children: [
                    /* @__PURE__ */ e("label", { className: "field-label", children: "Technical ID" }),
                    /* @__PURE__ */ e("input", { className: "field-input", readOnly: !0, value: ((S = u.metadata) == null ? void 0 : S.technicalId) || "", title: ((g = u.metadata) == null ? void 0 : g.technicalId) || "" })
                  ] }),
                  /* @__PURE__ */ n("div", { className: "field", children: [
                    /* @__PURE__ */ e("label", { className: "field-label", children: "Creator" }),
                    /* @__PURE__ */ e("input", { className: "field-input", readOnly: !0, value: ((T = u.metadata) == null ? void 0 : T.createdBy) || "" })
                  ] }),
                  /* @__PURE__ */ n("div", { className: "field", children: [
                    /* @__PURE__ */ e("label", { className: "field-label", children: "Created" }),
                    /* @__PURE__ */ e("input", { className: "field-input", readOnly: !0, value: s((Y = u.metadata) == null ? void 0 : Y.createdAt) })
                  ] }),
                  /* @__PURE__ */ n("div", { className: "field", children: [
                    /* @__PURE__ */ e("label", { className: "field-label", children: "Modified by" }),
                    /* @__PURE__ */ e("input", { className: "field-input", readOnly: !0, value: ((K = u.metadata) == null ? void 0 : K.modifiedBy) || "" })
                  ] }),
                  /* @__PURE__ */ n("div", { className: "field", children: [
                    /* @__PURE__ */ e("label", { className: "field-label", children: "Last update" }),
                    /* @__PURE__ */ e("input", { className: "field-input", readOnly: !0, value: s((ge = u.metadata) == null ? void 0 : ge.lastUpdate) })
                  ] })
                ] })
              ] }),
              a(c),
              (ae.domains.length > 0 || Ht.length > 0) && /* @__PURE__ */ n("div", { style: { marginTop: 16 }, children: [
                /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, children: [
                  /* @__PURE__ */ e("div", { className: "section-label", style: { marginBottom: 0 }, children: "Domains" }),
                  ae.domains.length > 0 && /* @__PURE__ */ e("div", { className: "subtabs", style: { marginBottom: 0, flex: 1 }, children: ae.domains.map((i) => /* @__PURE__ */ n(
                    "div",
                    {
                      className: `subtab ${Cn === i.id ? "active" : ""}`,
                      onClick: () => Yt(i.id),
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
                  Ht.length > 0 && /* @__PURE__ */ e("div", { style: { display: "flex", gap: 4, marginLeft: "auto", flexShrink: 0 }, children: Ht.map((i) => {
                    const y = Ln(i), p = i.label;
                    return /* @__PURE__ */ e(
                      "button",
                      {
                        className: `btn btn-sm${y ? " btn-disabled" : ""}`,
                        disabled: y,
                        title: y ? _n(i) : i.description || p,
                        onClick: () => Ut(i),
                        children: p
                      },
                      i.code
                    );
                  }) })
                ] }),
                l && a(l.attrs)
              ] })
            ] });
          })(),
          k === "pbs" && /* @__PURE__ */ n(
            "div",
            {
              className: gn ? "pbs-drop-zone drag-over" : "pbs-drop-zone",
              onDragEnter: (t) => {
                he() && (t.preventDefault(), qe.current++, ft(!0));
              },
              onDragOver: (t) => {
                he() && (t.preventDefault(), t.dataTransfer.dropEffect = "link");
              },
              onDragLeave: (t) => {
                qe.current > 0 && qe.current--, qe.current === 0 && ft(!1);
              },
              onDrop: (t) => {
                var l;
                t.preventDefault(), qe.current = 0, ft(!1);
                const a = he();
                if (et(), !!a) {
                  if (!((l = I == null ? void 0 : I.actions) != null && l.some((s) => s.code === "create_link"))) {
                    C("You do not have write permission on this node", "error");
                    return;
                  }
                  a.nodeId && a.nodeId !== o && En(a);
                }
              },
              children: [
                gn && /* @__PURE__ */ e("div", { className: "pbs-drop-hint", children: "Drop to create a link" }),
                ((ga = u.actions) == null ? void 0 : ga.some((t) => t.code === "create_link")) && /* @__PURE__ */ e("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 8 }, children: /* @__PURE__ */ e("button", { className: "btn btn-sm", onClick: () => Me ? rt(!1) : En(), children: Me ? "✕ Cancel" : "+ Add link" }) }),
                Me && (() => {
                  const t = Dt.find((g) => (g.id || g.ID) === Se), a = (t == null ? void 0 : t.link_policy) || (t == null ? void 0 : t.LINK_POLICY) || null, l = (t == null ? void 0 : t.target_source_id) || (t == null ? void 0 : t.TARGET_SOURCE_ID) || "SELF", s = (t == null ? void 0 : t.target_type) || (t == null ? void 0 : t.TARGET_TYPE) || null, r = Ta[l] || null, c = l === "SELF", f = (t == null ? void 0 : t.link_logical_id_label) || (t == null ? void 0 : t.LINK_LOGICAL_ID_LABEL) || "Link ID", v = (t == null ? void 0 : t.link_logical_id_pattern) || (t == null ? void 0 : t.LINK_LOGICAL_ID_PATTERN) || null, m = !v || !ke || new RegExp(`^(?:${v})$`).test(ke), S = !!Fe;
                  return /* @__PURE__ */ n("div", { ref: Gt, className: "link-panel", style: { flexWrap: "wrap", rowGap: 6 }, children: [
                    !oe && /* @__PURE__ */ e("div", { style: { width: "100%", fontSize: 11, color: "var(--warn)", marginBottom: 2 }, children: "⚡ No active transaction — one will be opened automatically on create" }),
                    /* @__PURE__ */ n("div", { style: { display: "flex", gap: 8, width: "100%", alignItems: "flex-end" }, children: [
                      /* @__PURE__ */ n("div", { className: "field", style: { margin: 0, flex: "0 0 180px" }, children: [
                        /* @__PURE__ */ e("label", { className: "field-label", children: "Link type" }),
                        /* @__PURE__ */ n(
                          "select",
                          {
                            className: "field-input",
                            value: Se,
                            onChange: (g) => {
                              ot(g.target.value), je("");
                            },
                            children: [
                              /* @__PURE__ */ e("option", { value: "", children: "— select —" }),
                              Dt.map((g) => /* @__PURE__ */ e("option", { value: g.id || g.ID, children: g.name || g.NAME }, g.id || g.ID))
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
                              placeholder: c ? s ? `Search ${s} by logical ID…` : "Search by logical ID…" : s ? `${s} key (UUID, path, …)` : "Target key",
                              value: Fe,
                              onChange: (g) => {
                                const T = g.target.value;
                                Le(T), ne(-1), se(!0), xn(l, s, T);
                              },
                              onFocus: () => {
                                se(!0), xn(l, s, Fe);
                              },
                              onBlur: () => setTimeout(() => se(!1), 150),
                              onKeyDown: (g) => {
                                if (!(!rn || Ke.length === 0))
                                  if (g.key === "ArrowDown")
                                    g.preventDefault(), ne((T) => Math.min(T + 1, Ke.length - 1));
                                  else if (g.key === "ArrowUp")
                                    g.preventDefault(), ne((T) => Math.max(T - 1, -1));
                                  else if (g.key === "Enter" && Vt >= 0) {
                                    g.preventDefault();
                                    const T = Ke[Vt];
                                    Le(T.key || T.KEY || ""), se(!1), ne(-1);
                                  } else g.key === "Escape" && (se(!1), ne(-1));
                              }
                            }
                          ),
                          rn && Ke.length > 0 && /* @__PURE__ */ e("div", { className: "search-suggestions", children: Ke.map((g, T) => {
                            const Y = g.key || g.KEY || "", K = g.label || g.LABEL || "";
                            return /* @__PURE__ */ n(
                              "div",
                              {
                                className: `search-sug-item${T === Vt ? " hi" : ""}`,
                                onMouseDown: () => {
                                  Le(Y), se(!1), ne(-1);
                                },
                                onMouseEnter: () => ne(T),
                                children: [
                                  /* @__PURE__ */ e("span", { className: "sug-lid", children: Y }),
                                  K && K !== Y && /* @__PURE__ */ e("span", { className: "sug-dname", children: K })
                                ]
                              },
                              Y
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
                          f,
                          v && /* @__PURE__ */ n("span", { style: { marginLeft: 6, opacity: 0.55, fontWeight: 400, fontSize: 10 }, children: [
                            "pattern: ",
                            v
                          ] })
                        ] }),
                        /* @__PURE__ */ e(
                          "input",
                          {
                            className: "field-input",
                            style: { borderColor: (!ke || !m) && Se ? "var(--danger, #e05252)" : void 0 },
                            type: "text",
                            placeholder: f,
                            value: ke,
                            onChange: (g) => je(g.target.value)
                          }
                        ),
                        ke && !m && /* @__PURE__ */ n("div", { style: { fontSize: 10, color: "var(--danger, #e05252)", marginTop: 2 }, children: [
                          "Does not match pattern: ",
                          v
                        ] })
                      ] }),
                      /* @__PURE__ */ e(
                        "button",
                        {
                          className: "btn btn-primary btn-sm",
                          style: { alignSelf: "flex-end" },
                          disabled: !Se || !S || !ke || !m || on,
                          onClick: $a,
                          children: on ? "…" : "Create"
                        }
                      )
                    ] })
                  ] });
                })(),
                /* @__PURE__ */ e("div", { className: "section-label", style: { marginTop: 16 }, children: "BOM — Children" }),
                le ? Be.length === 0 ? /* @__PURE__ */ n("div", { className: "empty", style: { padding: "24px" }, children: [
                  /* @__PURE__ */ e("div", { className: "empty-icon", children: "◌" }),
                  /* @__PURE__ */ e("div", { className: "empty-text", children: "No child links" })
                ] }) : (() => {
                  const t = [], a = /* @__PURE__ */ new Map();
                  return Be.forEach((l) => {
                    a.has(l.linkTypeName) || (a.set(l.linkTypeName, []), t.push(l.linkTypeName)), a.get(l.linkTypeName).push(l);
                  }), t.map((l) => {
                    const s = a.get(l), r = s[0], f = !r.targetSourceCode || r.targetSourceCode === "SELF" ? "Self" : r.sourceName || r.targetSourceCode || "External", v = Xt ? 7 : 6;
                    return /* @__PURE__ */ n(Et, { children: [
                      /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 12, marginBottom: 4 }, children: [
                        /* @__PURE__ */ e("span", { style: { fontSize: 12, fontWeight: 600 }, children: l }),
                        /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--muted)", background: "var(--surface2, rgba(0,0,0,.06))", borderRadius: 3, padding: "1px 6px" }, children: f })
                      ] }),
                      /* @__PURE__ */ n("table", { className: "history-table", children: [
                        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
                          /* @__PURE__ */ e("th", { children: "Link ID" }),
                          /* @__PURE__ */ e("th", { children: "Node type" }),
                          /* @__PURE__ */ e("th", { children: "Identity" }),
                          /* @__PURE__ */ e("th", { children: "Rev" }),
                          /* @__PURE__ */ e("th", { children: "State" }),
                          /* @__PURE__ */ e("th", { children: "Policy" }),
                          Xt && /* @__PURE__ */ e("th", {})
                        ] }) }),
                        /* @__PURE__ */ e("tbody", { children: s.map((m) => {
                          var ge;
                          const S = Ca === m.linkId, g = Aa === m.linkId, T = !m.targetSourceCode || m.targetSourceCode === "SELF", Y = T ? null : It(m.targetSourceCode), K = m.linkTypeAttributes || [];
                          return /* @__PURE__ */ n(Et, { children: [
                            /* @__PURE__ */ n(
                              "tr",
                              {
                                className: cn === m.linkId ? "link-selected" : "",
                                style: { cursor: "pointer" },
                                onClick: () => Bt((i) => i === m.linkId ? null : m.linkId),
                                children: [
                                  /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontSize: 12 }, children: S ? /* @__PURE__ */ e(
                                    "input",
                                    {
                                      className: "field-input",
                                      style: { padding: "2px 6px", fontSize: 12, width: 120 },
                                      value: dn,
                                      onChange: (i) => zt(i.target.value),
                                      autoFocus: !0
                                    }
                                  ) : m.linkLogicalId ? /* @__PURE__ */ e("span", { title: m.linkLogicalIdLabel, children: m.linkLogicalId }) : /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" }) }),
                                  T ? /* @__PURE__ */ n(xt, { children: [
                                    /* @__PURE__ */ e("td", { style: { color: "var(--muted)", fontSize: 12 }, children: m.targetNodeType }),
                                    /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontSize: 13 }, children: S ? /* @__PURE__ */ n("div", { style: { position: "relative" }, children: [
                                      /* @__PURE__ */ e(
                                        "input",
                                        {
                                          className: "field-input",
                                          style: { padding: "2px 4px", fontSize: 12, minWidth: 120 },
                                          type: "text",
                                          autoComplete: "off",
                                          placeholder: "target key…",
                                          value: _e,
                                          onChange: (i) => {
                                            const y = i.target.value;
                                            re(y), G(-1), J(!0), St("SELF", m.targetNodeType, y);
                                          },
                                          onFocus: () => {
                                            J(!0), St("SELF", m.targetNodeType, _e);
                                          },
                                          onBlur: () => setTimeout(() => J(!1), 150),
                                          onKeyDown: (i) => {
                                            !ht || Z.length === 0 || (i.key === "ArrowDown" ? (i.preventDefault(), G((y) => Math.min(y + 1, Z.length - 1))) : i.key === "ArrowUp" ? (i.preventDefault(), G((y) => Math.max(y - 1, -1))) : i.key === "Enter" && pe >= 0 ? (i.preventDefault(), re(Z[pe].key || Z[pe].KEY || ""), J(!1), G(-1)) : i.key === "Escape" && (J(!1), G(-1)));
                                          }
                                        }
                                      ),
                                      ht && Z.length > 0 && /* @__PURE__ */ e("div", { className: "search-suggestions", children: Z.map((i, y) => {
                                        const p = i.key || i.KEY || "", L = i.label || i.LABEL || "";
                                        return /* @__PURE__ */ n(
                                          "div",
                                          {
                                            className: `search-sug-item${y === pe ? " hi" : ""}`,
                                            onMouseDown: () => {
                                              re(p), J(!1), G(-1);
                                            },
                                            onMouseEnter: () => G(y),
                                            children: [
                                              /* @__PURE__ */ e("span", { className: "sug-lid", children: p }),
                                              L && L !== p && /* @__PURE__ */ e("span", { className: "sug-dname", children: L })
                                            ]
                                          },
                                          p
                                        );
                                      }) })
                                    ] }) : m.targetLogicalId || /* @__PURE__ */ n("span", { style: { opacity: 0.4 }, children: [
                                      (ge = m.targetNodeId) == null ? void 0 : ge.slice(0, 8),
                                      "…"
                                    ] }) }),
                                    /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12 }, children: m.linkPolicy === "VERSION_TO_MASTER" ? /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" }) : `${m.targetRevision}.${m.targetIteration}` }),
                                    /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e(Te, { stateId: m.targetState, stateName: m.targetStateName, stateColorMap: x }) }),
                                    /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "hist-type-badge", "data-type": m.linkPolicy, style: { fontSize: 10 }, children: m.linkPolicy === "VERSION_TO_MASTER" ? "V2M" : "V2V" }) })
                                  ] }) : Y ? /* @__PURE__ */ e("td", { colSpan: 5, style: { verticalAlign: "middle" }, children: /* @__PURE__ */ e(
                                    Y,
                                    {
                                      link: m,
                                      isEditing: S,
                                      editTargetKey: _e,
                                      onEditTargetKey: re
                                    }
                                  ) }) : /* @__PURE__ */ n(xt, { children: [
                                    /* @__PURE__ */ e("td", { style: { color: "var(--muted)", fontSize: 12 }, children: m.targetNodeType || /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" }) }),
                                    /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontSize: 12 }, children: S ? /* @__PURE__ */ n("div", { style: { position: "relative" }, children: [
                                      /* @__PURE__ */ e(
                                        "input",
                                        {
                                          className: "field-input",
                                          style: { padding: "2px 4px", fontSize: 12, minWidth: 120 },
                                          type: "text",
                                          autoComplete: "off",
                                          placeholder: "target key…",
                                          value: _e,
                                          onChange: (i) => {
                                            const y = i.target.value;
                                            re(y), G(-1), J(!0), St(m.targetSourceCode, m.targetNodeType, y);
                                          },
                                          onFocus: () => {
                                            J(!0), St(m.targetSourceCode, m.targetNodeType, _e);
                                          },
                                          onBlur: () => setTimeout(() => J(!1), 150),
                                          onKeyDown: (i) => {
                                            !ht || Z.length === 0 || (i.key === "ArrowDown" ? (i.preventDefault(), G((y) => Math.min(y + 1, Z.length - 1))) : i.key === "ArrowUp" ? (i.preventDefault(), G((y) => Math.max(y - 1, -1))) : i.key === "Enter" && pe >= 0 ? (i.preventDefault(), re(Z[pe].key || Z[pe].KEY || ""), J(!1), G(-1)) : i.key === "Escape" && (J(!1), G(-1)));
                                          }
                                        }
                                      ),
                                      ht && Z.length > 0 && /* @__PURE__ */ e("div", { className: "search-suggestions", children: Z.map((i, y) => {
                                        const p = i.key || i.KEY || "", L = i.label || i.LABEL || "";
                                        return /* @__PURE__ */ n(
                                          "div",
                                          {
                                            className: `search-sug-item${y === pe ? " hi" : ""}`,
                                            onMouseDown: () => {
                                              re(p), J(!1), G(-1);
                                            },
                                            onMouseEnter: () => G(y),
                                            children: [
                                              /* @__PURE__ */ e("span", { className: "sug-lid", children: p }),
                                              L && L !== p && /* @__PURE__ */ e("span", { className: "sug-dname", children: L })
                                            ]
                                          },
                                          p
                                        );
                                      }) })
                                    ] }) : m.displayKey || m.targetKey }),
                                    /* @__PURE__ */ e("td", {}),
                                    /* @__PURE__ */ e("td", {}),
                                    /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "hist-type-badge", "data-type": m.linkPolicy, style: { fontSize: 10 }, children: m.linkPolicy === "VERSION_TO_MASTER" ? "V2M" : "V2V" }) })
                                  ] }),
                                  Xt && /* @__PURE__ */ e("td", { style: { whiteSpace: "nowrap" }, onClick: (i) => i.stopPropagation(), children: g ? /* @__PURE__ */ n("span", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
                                    /* @__PURE__ */ e("span", { style: { fontSize: 11, color: "var(--danger, #e05252)", marginRight: 2 }, children: "Delete?" }),
                                    /* @__PURE__ */ e(
                                      "button",
                                      {
                                        className: "btn btn-sm btn-danger",
                                        style: { padding: "1px 6px", fontSize: 11 },
                                        disabled: un,
                                        onClick: () => Ma(m.linkId),
                                        children: "✓"
                                      }
                                    ),
                                    /* @__PURE__ */ e(
                                      "button",
                                      {
                                        className: "btn btn-sm",
                                        style: { padding: "1px 6px", fontSize: 11 },
                                        onClick: () => Ue(null),
                                        children: "✕"
                                      }
                                    )
                                  ] }) : S ? /* @__PURE__ */ n("span", { style: { display: "flex", gap: 4 }, children: [
                                    /* @__PURE__ */ e(
                                      "button",
                                      {
                                        className: "btn btn-sm btn-success",
                                        style: { padding: "1px 6px", fontSize: 11 },
                                        disabled: un,
                                        onClick: () => Ba(m.linkId, dn, _e, $t),
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
                                  ] }) : /* @__PURE__ */ n("span", { style: { display: "flex", gap: 4 }, children: [
                                    (Re || qt) && /* @__PURE__ */ e(
                                      "button",
                                      {
                                        className: "btn btn-sm",
                                        style: { padding: "1px 6px", fontSize: 11, ...Re ? {} : { opacity: 0.35, cursor: "not-allowed" } },
                                        title: Re ? "Edit link" : "Checkout to edit",
                                        disabled: !Re,
                                        onClick: Re ? () => {
                                          Ge(m.linkId), zt(m.linkLogicalId || ""), re(m.targetLogicalId || m.targetKey || "");
                                          const i = {};
                                          (m.linkAttributeValues || []).forEach((y) => {
                                            i[y.attributeId] = y.value || "";
                                          }), dt(i), ct([]), J(!1), G(-1), Ue(null);
                                        } : void 0,
                                        children: "✎"
                                      }
                                    ),
                                    (Ie || qt) && /* @__PURE__ */ e(
                                      "button",
                                      {
                                        className: "btn btn-sm",
                                        style: { padding: "1px 6px", fontSize: 11, color: Ie ? "var(--danger, #e05252)" : void 0, ...Ie ? {} : { opacity: 0.35, cursor: "not-allowed" } },
                                        title: Ie ? "Delete link" : "Checkout to delete",
                                        disabled: !Ie,
                                        onClick: Ie ? () => {
                                          Ue(m.linkId), Ge(null);
                                        } : void 0,
                                        children: "✕"
                                      }
                                    )
                                  ] }) })
                                ]
                              }
                            ),
                            cn === m.linkId && !S && (() => {
                              const i = {};
                              (m.linkAttributeValues || []).forEach((p) => {
                                i[p.attributeId] = p.value;
                              });
                              const y = (p) => {
                                if (!p) return /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" });
                                const L = p.split(",").map((R) => parseFloat(R.trim()));
                                return L.length !== 16 || L.some(isNaN) ? /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono, monospace)", fontSize: 11 }, children: p }) : /* @__PURE__ */ e("div", { style: { fontSize: 11, fontFamily: "var(--mono, monospace)", lineHeight: 1.8, background: "var(--surface2, rgba(0,0,0,.04))", borderRadius: 3, padding: "4px 8px", display: "inline-block" }, children: [0, 1, 2, 3].map((R) => /* @__PURE__ */ e("div", { style: { display: "flex", gap: 10 }, children: [0, 1, 2, 3].map((ie) => /* @__PURE__ */ e("span", { style: { minWidth: 56, textAlign: "right", display: "inline-block" }, children: L[R * 4 + ie].toFixed(4) }, ie)) }, R)) });
                              };
                              return /* @__PURE__ */ e("tr", { className: "link-detail-expand", onClick: (p) => p.stopPropagation(), children: /* @__PURE__ */ e("td", { colSpan: v, children: /* @__PURE__ */ e("div", { className: "link-detail-inner", children: K.length === 0 ? /* @__PURE__ */ e("span", { style: { fontSize: 11, opacity: 0.5 }, children: "No attributes defined for this link type." }) : /* @__PURE__ */ e("div", { style: { display: "flex", flexWrap: "wrap", gap: 12 }, children: K.map((p) => /* @__PURE__ */ n("div", { style: { flex: p.dataType === "POSITION" ? "1 1 100%" : "1 1 160px", minWidth: 120 }, children: [
                                /* @__PURE__ */ e("div", { style: { fontSize: 10, color: "var(--muted)", marginBottom: 4 }, children: p.label || p.name }),
                                p.dataType === "POSITION" ? y(i[p.name]) : /* @__PURE__ */ e("div", { style: { fontSize: 12 }, children: i[p.name] != null ? i[p.name] : /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" }) })
                              ] }, p.id)) }) }) }) });
                            })(),
                            S && K.length > 0 && /* @__PURE__ */ e("tr", { children: /* @__PURE__ */ e("td", { colSpan: v, style: { padding: "4px 8px 8px", background: "var(--surface2, rgba(0,0,0,.04))" }, children: /* @__PURE__ */ e("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }, children: K.map((i) => /* @__PURE__ */ n("div", { className: "field", style: { margin: 0, flex: i.dataType === "POSITION" ? "1 1 100%" : "1 1 160px", minWidth: 120 }, children: [
                              /* @__PURE__ */ n("label", { className: "field-label", style: { fontSize: 10 }, children: [
                                i.label || i.name,
                                i.required && /* @__PURE__ */ e("span", { className: "field-req", children: "*" })
                              ] }),
                              i.dataType === "POSITION" ? (() => {
                                const p = ($t[i.name] || "").split(",").map((R) => parseFloat(R.trim())), L = p.length === 16 && p.every((R) => !isNaN(R)) ? p : Array(16).fill(0);
                                return /* @__PURE__ */ e("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, fontFamily: "var(--mono, monospace)" }, children: L.map((R, ie) => /* @__PURE__ */ e(
                                  "input",
                                  {
                                    type: "number",
                                    className: "field-input",
                                    style: { padding: "2px 4px", fontSize: 11, textAlign: "right", width: "100%" },
                                    value: R,
                                    step: "any",
                                    onChange: (Qe) => {
                                      const ce = [...L];
                                      ce[ie] = parseFloat(Qe.target.value) || 0, dt((ye) => ({ ...ye, [i.name]: ce.join(",") }));
                                    }
                                  },
                                  ie
                                )) });
                              })() : /* @__PURE__ */ e(
                                "input",
                                {
                                  className: "field-input",
                                  style: { padding: "2px 6px", fontSize: 12 },
                                  value: $t[i.name] || "",
                                  onChange: (y) => dt((p) => ({ ...p, [i.name]: y.target.value })),
                                  placeholder: i.label || i.name
                                }
                              )
                            ] }, i.id)) }) }) })
                          ] }, m.linkId);
                        }) })
                      ] })
                    ] }, l);
                  });
                })() : /* @__PURE__ */ n("div", { className: "empty", style: { padding: "24px" }, children: [
                  /* @__PURE__ */ e("div", { className: "empty-icon", children: "◎" }),
                  /* @__PURE__ */ e("div", { className: "empty-text", children: "Loading…" })
                ] }),
                /* @__PURE__ */ e("div", { className: "section-label", style: { marginTop: 24 }, children: "Where Used — Parents" }),
                le ? Ot.length === 0 ? /* @__PURE__ */ n("div", { className: "empty", style: { padding: "24px" }, children: [
                  /* @__PURE__ */ e("div", { className: "empty-icon", children: "◌" }),
                  /* @__PURE__ */ e("div", { className: "empty-text", children: "Not used anywhere" })
                ] }) : (() => {
                  const t = [], a = /* @__PURE__ */ new Map();
                  return Ot.forEach((l) => {
                    a.has(l.linkTypeName) || (a.set(l.linkTypeName, []), t.push(l.linkTypeName)), a.get(l.linkTypeName).push(l);
                  }), t.map((l) => /* @__PURE__ */ n(Et, { children: [
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
                        var c;
                        const r = wa === s.linkId;
                        return /* @__PURE__ */ n(Et, { children: [
                          /* @__PURE__ */ n(
                            "tr",
                            {
                              className: r ? "link-selected" : "",
                              style: { cursor: "pointer" },
                              onClick: () => hn((f) => f === s.linkId ? null : s.linkId),
                              children: [
                                /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontSize: 12 }, children: s.linkLogicalId ? /* @__PURE__ */ e("span", { title: s.linkLogicalIdLabel, children: s.linkLogicalId }) : /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" }) }),
                                /* @__PURE__ */ e("td", { style: { color: "var(--muted)", fontSize: 12 }, children: s.sourceNodeType }),
                                /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontSize: 13 }, children: s.sourceLogicalId || /* @__PURE__ */ n("span", { style: { opacity: 0.4 }, children: [
                                  (c = s.sourceNodeId) == null ? void 0 : c.slice(0, 8),
                                  "…"
                                ] }) }),
                                /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12 }, children: s.linkPolicy === "VERSION_TO_MASTER" ? /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" }) : `${s.sourceRevision}.${s.sourceIteration}` }),
                                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e(Te, { stateId: s.sourceState, stateName: s.sourceStateName, stateColorMap: x }) }),
                                /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "hist-type-badge", "data-type": s.linkPolicy, style: { fontSize: 10 }, children: s.linkPolicy === "VERSION_TO_MASTER" ? "V2M" : "V2V" }) })
                              ]
                            }
                          ),
                          r && (() => {
                            const f = s.linkTypeAttributes || [], v = {};
                            (s.linkAttributeValues || []).forEach((S) => {
                              v[S.attributeId] = S.value;
                            });
                            const m = (S) => {
                              if (!S) return /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" });
                              const g = S.split(",").map((T) => parseFloat(T.trim()));
                              return g.length !== 16 || g.some(isNaN) ? /* @__PURE__ */ e("span", { style: { fontFamily: "var(--mono, monospace)", fontSize: 11 }, children: S }) : /* @__PURE__ */ e("div", { style: { fontSize: 11, fontFamily: "var(--mono, monospace)", lineHeight: 1.8, background: "var(--surface2, rgba(0,0,0,.04))", borderRadius: 3, padding: "4px 8px", display: "inline-block" }, children: [0, 1, 2, 3].map((T) => /* @__PURE__ */ e("div", { style: { display: "flex", gap: 10 }, children: [0, 1, 2, 3].map((Y) => /* @__PURE__ */ e("span", { style: { minWidth: 56, textAlign: "right", display: "inline-block" }, children: g[T * 4 + Y].toFixed(4) }, Y)) }, T)) });
                            };
                            return /* @__PURE__ */ e("tr", { className: "link-detail-expand", onClick: (S) => S.stopPropagation(), children: /* @__PURE__ */ e("td", { colSpan: 6, children: /* @__PURE__ */ e("div", { className: "link-detail-inner", children: f.length === 0 ? /* @__PURE__ */ e("span", { style: { fontSize: 11, opacity: 0.5 }, children: "No attributes defined for this link type." }) : /* @__PURE__ */ e("div", { style: { display: "flex", flexWrap: "wrap", gap: 12 }, children: f.map((S) => /* @__PURE__ */ n("div", { style: { flex: S.dataType === "POSITION" ? "1 1 100%" : "1 1 160px", minWidth: 120 }, children: [
                              /* @__PURE__ */ e("div", { style: { fontSize: 10, color: "var(--muted)", marginBottom: 4 }, children: S.label || S.name }),
                              S.dataType === "POSITION" ? m(v[S.name]) : /* @__PURE__ */ e("div", { style: { fontSize: 12 }, children: v[S.name] != null ? v[S.name] : /* @__PURE__ */ e("span", { style: { opacity: 0.35 }, children: "—" }) })
                            ] }, S.id)) }) }) }) });
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
          k === "history" && /* @__PURE__ */ n("div", { children: [
            /* @__PURE__ */ n("div", { className: "history-lc-section", children: [
              /* @__PURE__ */ e("div", { className: "history-lc-label", children: "Lifecycle" }),
              /* @__PURE__ */ e(
                Ct,
                {
                  lifecycleId: (ya = u.metadata) == null ? void 0 : ya.lifecycleId,
                  currentStateId: (Na = u.metadata) == null ? void 0 : Na.state,
                  userId: d,
                  availableTransitionNames: new Set(
                    Rn.filter((t) => {
                      var a;
                      return !((a = t.guardViolations) != null && a.length);
                    }).map((t) => t.label)
                  ),
                  transitionGuardViolations: ja,
                  onTransition: (t) => {
                    var s;
                    const a = t.name || t.NAME || "", l = Rn.find((r) => r.label === a);
                    l && !((s = l.guardViolations) != null && s.length) && Ut(l);
                  }
                }
              )
            ] }),
            /* @__PURE__ */ e("div", { className: "history-lc-divider", children: /* @__PURE__ */ e("span", { children: "Version history" }) }),
            Pe.length === 0 ? /* @__PURE__ */ n("div", { className: "empty", children: [
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
              /* @__PURE__ */ e("tbody", { children: [...Pe].reverse().map((t, a, l) => {
                var ge, i;
                const s = t.fingerprint || t.FINGERPRINT || null, r = t.tx_id || t.TX_ID || null, c = l[a + 1] ? l[a + 1].fingerprint || l[a + 1].FINGERPRINT : null, f = l[a + 1] ? l[a + 1].tx_id || l[a + 1].TX_ID : null, v = s && c && s !== c, m = s && !c, S = t.committed_at || t.COMMITTED_AT, g = t.version_number || t.VERSION_NUMBER, T = (t.tx_status || t.TX_STATUS) === "OPEN", Y = a === l.length - 1, K = ee === g;
                return /* @__PURE__ */ n("tr", { className: [T ? "pending-row" : "", K ? "historical-row" : ""].filter(Boolean).join(" ") || void 0, children: [
                  /* @__PURE__ */ n("td", { children: [
                    /* @__PURE__ */ e("span", { className: "ver-num", children: g }),
                    T && /* @__PURE__ */ e("span", { className: "pending-badge", children: "pending" })
                  ] }),
                  /* @__PURE__ */ e("td", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12 }, children: (t.iteration ?? t.ITERATION) === 0 ? t.revision || t.REVISION : `${t.revision || t.REVISION}.${t.iteration ?? t.ITERATION}` }),
                  /* @__PURE__ */ e("td", { children: /* @__PURE__ */ e("span", { className: "hist-state", children: t.state_name || t.STATE_NAME || "—" }) }),
                  /* @__PURE__ */ e("td", { children: T ? /* @__PURE__ */ e("span", { className: "hist-type-badge", "data-type": t.change_type || t.CHANGE_TYPE, style: { opacity: 0.6 }, children: t.change_type || t.CHANGE_TYPE }) : /* @__PURE__ */ e("span", { className: "hist-type-badge", "data-type": t.change_type || t.CHANGE_TYPE, children: t.change_type || t.CHANGE_TYPE }) }),
                  /* @__PURE__ */ e("td", { className: "hist-comment", title: t.tx_comment || t.TX_COMMENT || "", children: T ? /* @__PURE__ */ e("span", { style: { color: "var(--warn)", fontStyle: "italic", opacity: 0.7 }, children: "uncommitted" }) : t.tx_comment || t.TX_COMMENT || /* @__PURE__ */ e("span", { style: { opacity: 0.4 }, children: "—" }) }),
                  /* @__PURE__ */ e("td", { className: "hist-by", children: t.created_by || t.CREATED_BY || t.tx_owner || "—" }),
                  /* @__PURE__ */ e("td", { className: "hist-date", children: T ? /* @__PURE__ */ e("span", { style: { color: "var(--warn)", fontStyle: "italic" }, children: "—" }) : S ? new Date(S).toLocaleDateString() : "—" }),
                  /* @__PURE__ */ e("td", { children: s ? /* @__PURE__ */ n(
                    "span",
                    {
                      className: "hist-fp",
                      title: s,
                      style: { color: T ? "var(--warn)" : m || v ? "var(--success)" : "var(--muted2)", opacity: T ? 0.6 : 1 },
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
                      style: { color: T ? "var(--warn)" : r !== f ? "var(--accent)" : "var(--muted2)", fontFamily: "var(--mono)", opacity: T ? 0.6 : 1 },
                      children: [
                        r.slice(0, 8),
                        "…"
                      ]
                    }
                  ) : /* @__PURE__ */ e("span", { style: { opacity: 0.3 }, children: "—" }) }),
                  /* @__PURE__ */ n("td", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
                    /* @__PURE__ */ n("div", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
                      !Y && /* @__PURE__ */ e(
                        "button",
                        {
                          className: "btn-diff",
                          title: `Diff v${((ge = l[a + 1]) == null ? void 0 : ge.version_number) || ((i = l[a + 1]) == null ? void 0 : i.VERSION_NUMBER)} → v${g}${T ? " (pending)" : ""}`,
                          disabled: Ia,
                          onClick: () => za(g),
                          children: "⊕ diff"
                        }
                      ),
                      (() => {
                        const y = t.id || t.ID, p = y && Ea[y] || 0;
                        return p > 0 && A ? /* @__PURE__ */ n(
                          "button",
                          {
                            className: "btn-diff",
                            title: `${p} comment${p > 1 ? "s" : ""} on this version`,
                            onClick: () => A(y),
                            style: { color: "var(--accent)" },
                            children: [
                              "💬 ",
                              p
                            ]
                          }
                        ) : null;
                      })(),
                      (() => {
                        const y = t.id || t.ID, p = y ? _a[y] : null, L = p ? p.count : 0, R = p ? p.hasRejected : !1;
                        return L > 0 ? /* @__PURE__ */ n(
                          "button",
                          {
                            className: "btn-diff",
                            title: `${L} signature${L > 1 ? "s" : ""} on this version${R ? " (rejected)" : ""}`,
                            onClick: () => Kt(y),
                            style: { color: R ? "var(--danger)" : "var(--success)", display: "inline-flex", alignItems: "center", gap: 3 },
                            children: [
                              /* @__PURE__ */ e(be, { size: 12 }),
                              " ",
                              L
                            ]
                          }
                        ) : null;
                      })()
                    ] }),
                    /* @__PURE__ */ e("div", { style: { marginLeft: "auto" }, children: !T && g !== Ga && /* @__PURE__ */ e(
                      "button",
                      {
                        className: "btn-diff",
                        title: K ? "Exit historical view" : `View node at version ${g}`,
                        style: { opacity: K ? 1 : 0.6, background: K ? "rgba(251,191,36,.2)" : void 0 },
                        onClick: () => {
                          K ? (gt(null), He(null)) : (gt(g), He(null));
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
        it && /* @__PURE__ */ e(
          ai,
          {
            diff: it.data,
            v1Num: it.v1Num,
            v2Num: it.v2Num,
            onClose: () => _t(null),
            stateColorMap: x
          }
        ),
        yn && /* @__PURE__ */ e(
          Ha,
          {
            shellAPI: b,
            nodeId: o,
            userId: d,
            filterVersionId: yn,
            onClose: () => Kt(null)
          }
        )
      ]
    }
  );
}
function ai({ diff: b, v1Num: o, v2Num: d, onClose: E, stateColorMap: O }) {
  const { v1: x, v2: k, attributeDiff: w, stateChanged: C, linkDiff: B = [] } = b, P = w.filter((h) => h.changed), M = w.filter((h) => !h.changed), F = B.filter((h) => h.status === "ADDED"), A = B.filter((h) => h.status === "REMOVED"), _ = B.filter((h) => h.status === "UNCHANGED"), H = [...F, ...A];
  return /* @__PURE__ */ e("div", { className: "diff-overlay", onClick: (h) => h.target === h.currentTarget && E(), children: /* @__PURE__ */ n("div", { className: "diff-modal", children: [
    /* @__PURE__ */ n("div", { className: "diff-header", children: [
      /* @__PURE__ */ n("span", { className: "diff-title", children: [
        "Diff — v",
        o,
        " → v",
        d
      ] }),
      /* @__PURE__ */ e("button", { className: "diff-close", onClick: E, children: "✕" })
    ] }),
    /* @__PURE__ */ n("div", { className: "diff-meta-row", children: [
      /* @__PURE__ */ n("div", { className: "diff-meta-cell diff-meta-old", children: [
        /* @__PURE__ */ n("div", { className: "diff-meta-label", children: [
          "Version ",
          o
        ] }),
        /* @__PURE__ */ e("div", { className: "diff-meta-rev", children: x.iteration === 0 ? x.revision : `${x.revision}.${x.iteration}` }),
        /* @__PURE__ */ e(Te, { stateId: x.lifecycleStateId, stateColorMap: O }),
        /* @__PURE__ */ e("span", { className: "hist-type-badge", "data-type": x.changeType, style: { marginLeft: 6 }, children: x.changeType }),
        /* @__PURE__ */ n("div", { className: "diff-meta-sub", children: [
          x.createdBy,
          " · ",
          x.txComment || "—"
        ] })
      ] }),
      /* @__PURE__ */ e("div", { className: "diff-arrow", children: "→" }),
      /* @__PURE__ */ n("div", { className: "diff-meta-cell diff-meta-new", style: k.committedAt ? void 0 : { borderColor: "rgba(232,169,71,.35)", background: "rgba(232,169,71,.05)" }, children: [
        /* @__PURE__ */ n("div", { className: "diff-meta-label", style: { display: "flex", alignItems: "center", gap: 6 }, children: [
          "Version ",
          d,
          !k.committedAt && /* @__PURE__ */ e("span", { className: "pending-badge", children: "pending" })
        ] }),
        /* @__PURE__ */ e("div", { className: "diff-meta-rev", children: k.iteration === 0 ? k.revision : `${k.revision}.${k.iteration}` }),
        /* @__PURE__ */ e(Te, { stateId: k.lifecycleStateId, stateColorMap: O }),
        /* @__PURE__ */ e("span", { className: "hist-type-badge", "data-type": k.changeType, style: { marginLeft: 6 }, children: k.changeType }),
        /* @__PURE__ */ n("div", { className: "diff-meta-sub", children: [
          k.createdBy,
          " · ",
          k.txComment || /* @__PURE__ */ e("em", { style: { opacity: 0.5 }, children: "uncommitted" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ n("div", { className: "diff-body", children: [
      C && /* @__PURE__ */ n("div", { className: "diff-state-change", children: [
        /* @__PURE__ */ e("span", { style: { opacity: 0.7 }, children: "State changed:" }),
        " ",
        /* @__PURE__ */ e(Te, { stateId: x.lifecycleStateId, stateColorMap: O }),
        " ",
        "→",
        " ",
        /* @__PURE__ */ e(Te, { stateId: k.lifecycleStateId, stateColorMap: O })
      ] }),
      P.length === 0 && !C ? /* @__PURE__ */ e("div", { className: "diff-no-changes", children: "No attribute changes between these versions." }) : /* @__PURE__ */ n("div", { className: "diff-attr-section", children: [
        /* @__PURE__ */ n("div", { className: "diff-section-title", children: [
          "Changed attributes (",
          P.length,
          ")"
        ] }),
        P.length === 0 ? /* @__PURE__ */ e("div", { className: "diff-empty-section", children: "None" }) : /* @__PURE__ */ n("table", { className: "diff-table", children: [
          /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ n("tr", { children: [
            /* @__PURE__ */ e("th", { children: "Attribute" }),
            /* @__PURE__ */ n("th", { className: "diff-old-col", children: [
              "Before (v",
              o,
              ")"
            ] }),
            /* @__PURE__ */ n("th", { className: "diff-new-col", children: [
              "After (v",
              d,
              ")"
            ] })
          ] }) }),
          /* @__PURE__ */ e("tbody", { children: P.map((h) => /* @__PURE__ */ n("tr", { className: "diff-row-changed", children: [
            /* @__PURE__ */ e("td", { className: "diff-attr-name", children: h.label || h.id || h.code }),
            /* @__PURE__ */ e("td", { className: "diff-val diff-val-old", children: h.v1Value !== "" ? h.v1Value : /* @__PURE__ */ e("span", { className: "diff-empty", children: "—" }) }),
            /* @__PURE__ */ e("td", { className: "diff-val diff-val-new", children: h.v2Value !== "" ? h.v2Value : /* @__PURE__ */ e("span", { className: "diff-empty", children: "—" }) })
          ] }, h.id || h.code)) })
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
          /* @__PURE__ */ e("tbody", { children: M.map((h) => /* @__PURE__ */ n("tr", { className: "diff-row-unchanged", children: [
            /* @__PURE__ */ e("td", { className: "diff-attr-name", children: h.label || h.id || h.code }),
            /* @__PURE__ */ e("td", { className: "diff-val", colSpan: 2, style: { color: "var(--muted2)" }, children: h.v1Value !== "" ? h.v1Value : /* @__PURE__ */ e("span", { className: "diff-empty", children: "—" }) })
          ] }, h.id || h.code)) })
        ] })
      ] }),
      B.length > 0 && /* @__PURE__ */ n("div", { className: "diff-attr-section", style: { marginTop: 16 }, children: [
        /* @__PURE__ */ n("div", { className: "diff-section-title", children: [
          "Links",
          H.length > 0 ? ` — ${H.length} change${H.length > 1 ? "s" : ""}` : " — no changes"
        ] }),
        H.map((h) => /* @__PURE__ */ n("details", { className: "diff-link-entry", open: !0, children: [
          /* @__PURE__ */ n("summary", { className: "diff-link-summary", children: [
            /* @__PURE__ */ e(
              "span",
              {
                className: "hist-type-badge",
                "data-type": h.status,
                style: {
                  background: h.status === "ADDED" ? "var(--success)" : "var(--danger)",
                  color: "#fff",
                  marginRight: 6,
                  fontSize: 10
                },
                children: h.status
              }
            ),
            /* @__PURE__ */ e("span", { style: { fontWeight: 600, marginRight: 6 }, children: h.linkTypeName }),
            /* @__PURE__ */ e(
              "span",
              {
                className: "hist-type-badge",
                "data-type": h.linkPolicy === "VERSION_TO_VERSION" ? "SIGNATURE" : "LIFECYCLE",
                style: { fontSize: 10, marginRight: 8 },
                children: h.linkPolicy === "VERSION_TO_VERSION" ? "V2V" : "V2M"
              }
            ),
            /* @__PURE__ */ e("span", { style: { color: "var(--fg)" }, children: h.targetLogicalId || h.targetNodeId }),
            /* @__PURE__ */ n("span", { style: { color: "var(--muted2)", fontSize: 11, marginLeft: 4 }, children: [
              "(",
              h.targetNodeType,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ n("div", { className: "diff-link-detail", children: [
            /* @__PURE__ */ n("div", { className: "diff-link-detail-row", children: [
              /* @__PURE__ */ e("span", { className: "diff-attr-name", children: "Target" }),
              /* @__PURE__ */ n("span", { className: "diff-val", children: [
                h.targetLogicalId || h.targetNodeId,
                /* @__PURE__ */ n("span", { style: { color: "var(--muted2)", marginLeft: 4 }, children: [
                  "· ",
                  h.targetNodeType
                ] })
              ] })
            ] }),
            /* @__PURE__ */ n("div", { className: "diff-link-detail-row", children: [
              /* @__PURE__ */ e("span", { className: "diff-attr-name", children: "Policy" }),
              /* @__PURE__ */ e("span", { className: "diff-val", children: h.linkPolicy === "VERSION_TO_VERSION" ? "V2V — pinned version" : "V2M — always latest" })
            ] }),
            h.linkPolicy === "VERSION_TO_VERSION" && /* @__PURE__ */ n("div", { className: "diff-link-detail-row", children: [
              /* @__PURE__ */ e("span", { className: "diff-attr-name", children: "Pinned version" }),
              /* @__PURE__ */ e("span", { className: "diff-val", children: h.pinnedRevision != null ? `${h.pinnedRevision}.${h.pinnedIteration}` : /* @__PURE__ */ e("span", { className: "diff-empty", children: "—" }) })
            ] })
          ] })
        ] }, h.linkId)),
        _.length > 0 && /* @__PURE__ */ n("details", { className: "diff-unchanged-details", style: { marginTop: 8 }, children: [
          /* @__PURE__ */ n("summary", { className: "diff-section-title", style: { cursor: "pointer", fontWeight: 400 }, children: [
            "Unchanged links (",
            _.length,
            ")"
          ] }),
          /* @__PURE__ */ e("div", { style: { marginTop: 4 }, children: _.map((h) => /* @__PURE__ */ n("div", { className: "diff-link-unch-row", children: [
            /* @__PURE__ */ e("span", { style: { fontWeight: 600, marginRight: 6 }, children: h.linkTypeName }),
            /* @__PURE__ */ e(
              "span",
              {
                className: "hist-type-badge",
                "data-type": h.linkPolicy === "VERSION_TO_VERSION" ? "SIGNATURE" : "LIFECYCLE",
                style: { fontSize: 10, marginRight: 8 },
                children: h.linkPolicy === "VERSION_TO_VERSION" ? "V2V" : "V2M"
              }
            ),
            /* @__PURE__ */ e("span", { children: h.targetLogicalId || h.targetNodeId }),
            /* @__PURE__ */ n("span", { style: { color: "var(--muted2)", fontSize: 11, marginLeft: 4 }, children: [
              "(",
              h.targetNodeType,
              ")"
            ] }),
            h.linkPolicy === "VERSION_TO_VERSION" && h.pinnedRevision && /* @__PURE__ */ n("span", { style: { color: "var(--muted2)", fontSize: 11, marginLeft: 8 }, children: [
              "pinned ",
              h.pinnedRevision,
              ".",
              h.pinnedIteration
            ] })
          ] }, h.linkId)) })
        ] })
      ] })
    ] }),
    (x.fingerprint || k.fingerprint) && /* @__PURE__ */ n("div", { className: "diff-fp-row", children: [
      /* @__PURE__ */ e("span", { className: "diff-fp-label", children: "Fingerprint" }),
      /* @__PURE__ */ e("span", { className: "diff-fp-val", title: x.fingerprint, style: { color: "var(--muted2)" }, children: x.fingerprint ? x.fingerprint.slice(0, 12) + "…" : "—" }),
      /* @__PURE__ */ e("span", { style: { margin: "0 6px", opacity: 0.5 }, children: "→" }),
      /* @__PURE__ */ e(
        "span",
        {
          className: "diff-fp-val",
          title: k.fingerprint,
          style: { color: x.fingerprint !== k.fingerprint ? "var(--success)" : "var(--muted2)" },
          children: k.fingerprint ? k.fingerprint.slice(0, 12) + "…" : "—"
        }
      )
    ] })
  ] }) });
}
let ka = null;
function ii({ tab: b, ctx: o }) {
  return /* @__PURE__ */ e(
    ni,
    {
      shellAPI: ka,
      nodeId: b.nodeId,
      userId: o.userId,
      tx: o.tx,
      nodeTypes: o.nodeTypes,
      stateColorMap: o.stateColorMap,
      activeSubTab: b.activeSubTab || "attributes",
      onSubTabChange: (d) => o.onSubTabChange(b.id, d),
      toast: o.toast,
      onAutoOpenTx: o.onAutoOpenTx,
      onDescriptionLoaded: o.onDescriptionLoaded,
      onRefreshItemData: o.onRefreshItemData,
      itemData: o.itemData,
      onOpenCommentsForVersion: o.onOpenCommentsForVersion,
      onCommentAttribute: o.onCommentAttribute,
      onNavigate: o.onNavigate,
      onRegisterPreview: o.onRegisterPreview
    }
  );
}
const di = {
  id: "psm-editor",
  zone: "editor",
  init(b) {
    ka = b, Ya(b);
  },
  matches(b) {
    return (b == null ? void 0 : b.serviceCode) === "psm" && (b == null ? void 0 : b.itemCode) === "node";
  },
  Component: ii
};
export {
  di as default
};
