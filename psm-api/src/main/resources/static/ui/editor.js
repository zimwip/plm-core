import { jsx as E, jsxs as F, Fragment as Hr } from "react/jsx-runtime";
import { useState as Ie, useCallback as cr, useEffect as Ct, useRef as Mn, Fragment as dr, useMemo as aa } from "react";
import oa from "react-dom";
import { p as Xt, i as th } from "./psmApi-B75Wvp00.js";
function nh({
  shellAPI: i,
  nodeId: e,
  userId: t,
  filterVersionId: n,
  onClose: r
}) {
  const { api: s, useWebSocket: a } = i, [o, l] = Ie([]), d = cr(async () => {
    if (e)
      try {
        const m = await s.getSignatureHistory(t, e);
        l(Array.isArray(m) ? m : []);
      } catch {
      }
  }, [e, t]);
  Ct(() => {
    d();
  }, [d]), a(
    e ? `/topic/nodes/${e}` : null,
    (m) => {
      m.nodeId && m.nodeId !== e || m.event === "SIGNED" && d();
    },
    t
  );
  const u = n ? o.filter((m) => (m.node_version_id || m.NODE_VERSION_ID) === n) : o, p = [], f = {};
  return u.forEach((m) => {
    const _ = m.revision || m.REVISION || "", x = m.iteration ?? m.ITERATION ?? 0, c = `${_}.${x}`;
    f[c] || (f[c] = { key: c, revision: _, iteration: x, items: [] }, p.push(f[c])), f[c].items.push(m);
  }), /* @__PURE__ */ E("div", { className: "signature-modal-overlay", onClick: r, children: /* @__PURE__ */ F("div", { className: "signature-modal", onClick: (m) => m.stopPropagation(), children: [
    /* @__PURE__ */ F("div", { className: "signature-modal-header", children: [
      /* @__PURE__ */ F("span", { children: [
        "Signatures",
        u.length > 0 && /* @__PURE__ */ E("span", { className: "comment-count-badge", children: u.length })
      ] }),
      /* @__PURE__ */ E("button", { className: "comment-close-btn", onClick: r, title: "Close", children: "✕" })
    ] }),
    /* @__PURE__ */ E("div", { className: "signature-modal-body", children: p.length === 0 ? /* @__PURE__ */ E("div", { className: "comment-empty", children: "No signatures on this version" }) : p.map((m) => /* @__PURE__ */ F("div", { className: "sig-group", children: [
      /* @__PURE__ */ F("div", { className: "sig-group-header", children: [
        "Rev ",
        m.iteration === 0 ? m.revision : `${m.revision}.${m.iteration}`
      ] }),
      m.items.map((_, x) => {
        const c = _.meaning || _.MEANING || "", h = _.signed_by || _.SIGNED_BY || _.signedBy || "", M = _.comment || _.COMMENT || "", y = _.signed_at || _.SIGNED_AT || _.signedAt || "", w = y ? new Date(y).toLocaleString(void 0, { dateStyle: "short", timeStyle: "short" }) : "";
        return /* @__PURE__ */ F("div", { className: "sig-entry", children: [
          /* @__PURE__ */ E("span", { className: `sig-meaning-badge ${c === "Rejected" ? "sig-rejected" : "sig-approved"}`, children: c }),
          /* @__PURE__ */ E("span", { className: "sig-by", children: h }),
          M && /* @__PURE__ */ E("span", { className: "sig-comment-text", children: M }),
          /* @__PURE__ */ E("span", { className: "sig-date", children: w })
        ] }, x);
      })
    ] }, m.key)) })
  ] }) });
}
const ws = /* @__PURE__ */ new Map();
async function ih(i, e) {
  if (ws.has(i)) return ws.get(i);
  const t = await e(i);
  return ws.set(i, t), t;
}
function rh() {
  ws.clear();
}
/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
const ao = "165", Gi = { ROTATE: 0, DOLLY: 1, PAN: 2 }, Wi = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 }, sh = 0, xl = 1, ah = 2, ad = 1, oh = 2, Zn = 3, fi = 0, _n = 1, kn = 2, hi = 0, fr = 1, yl = 2, Sl = 3, Ml = 4, lh = 5, Ri = 100, ch = 101, dh = 102, hh = 103, uh = 104, fh = 200, ph = 201, mh = 202, gh = 203, Ka = 204, $a = 205, _h = 206, vh = 207, xh = 208, yh = 209, Sh = 210, Mh = 211, Eh = 212, bh = 213, Th = 214, Ah = 0, wh = 1, Rh = 2, Ls = 3, Ch = 4, Ph = 5, Lh = 6, Nh = 7, oo = 0, Ih = 1, Dh = 2, ui = 0, Uh = 1, Oh = 2, Fh = 3, Bh = 4, zh = 5, kh = 6, Vh = 7, od = 300, gr = 301, _r = 302, Za = 303, Qa = 304, ks = 306, Ja = 1e3, Li = 1001, eo = 1002, wn = 1003, Hh = 1004, Qr = 1005, In = 1006, la = 1007, Ni = 1008, pi = 1009, Gh = 1010, Wh = 1011, Ns = 1012, ld = 1013, vr = 1014, di = 1015, Vs = 1016, cd = 1017, dd = 1018, xr = 1020, Xh = 35902, Yh = 1021, qh = 1022, Hn = 1023, jh = 1024, Kh = 1025, pr = 1026, yr = 1027, $h = 1028, hd = 1029, Zh = 1030, ud = 1031, fd = 1033, ca = 33776, da = 33777, ha = 33778, ua = 33779, El = 35840, bl = 35841, Tl = 35842, Al = 35843, wl = 36196, Rl = 37492, Cl = 37496, Pl = 37808, Ll = 37809, Nl = 37810, Il = 37811, Dl = 37812, Ul = 37813, Ol = 37814, Fl = 37815, Bl = 37816, zl = 37817, kl = 37818, Vl = 37819, Hl = 37820, Gl = 37821, fa = 36492, Wl = 36494, Xl = 36495, Qh = 36283, Yl = 36284, ql = 36285, jl = 36286, Jh = 3200, eu = 3201, pd = 0, tu = 1, ci = "", Bn = "srgb", gi = "srgb-linear", lo = "display-p3", Hs = "display-p3-linear", Is = "linear", Pt = "srgb", Ds = "rec709", Us = "p3", Xi = 7680, Kl = 519, nu = 512, iu = 513, ru = 514, md = 515, su = 516, au = 517, ou = 518, lu = 519, $l = 35044, Zl = "300 es", Jn = 2e3, Os = 2001;
class Ui {
  addEventListener(e, t) {
    this._listeners === void 0 && (this._listeners = {});
    const n = this._listeners;
    n[e] === void 0 && (n[e] = []), n[e].indexOf(t) === -1 && n[e].push(t);
  }
  hasEventListener(e, t) {
    if (this._listeners === void 0) return !1;
    const n = this._listeners;
    return n[e] !== void 0 && n[e].indexOf(t) !== -1;
  }
  removeEventListener(e, t) {
    if (this._listeners === void 0) return;
    const r = this._listeners[e];
    if (r !== void 0) {
      const s = r.indexOf(t);
      s !== -1 && r.splice(s, 1);
    }
  }
  dispatchEvent(e) {
    if (this._listeners === void 0) return;
    const n = this._listeners[e.type];
    if (n !== void 0) {
      e.target = this;
      const r = n.slice(0);
      for (let s = 0, a = r.length; s < a; s++)
        r[s].call(this, e);
      e.target = null;
    }
  }
}
const rn = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"], Rs = Math.PI / 180, to = 180 / Math.PI;
function Gr() {
  const i = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
  return (rn[i & 255] + rn[i >> 8 & 255] + rn[i >> 16 & 255] + rn[i >> 24 & 255] + "-" + rn[e & 255] + rn[e >> 8 & 255] + "-" + rn[e >> 16 & 15 | 64] + rn[e >> 24 & 255] + "-" + rn[t & 63 | 128] + rn[t >> 8 & 255] + "-" + rn[t >> 16 & 255] + rn[t >> 24 & 255] + rn[n & 255] + rn[n >> 8 & 255] + rn[n >> 16 & 255] + rn[n >> 24 & 255]).toLowerCase();
}
function pn(i, e, t) {
  return Math.max(e, Math.min(t, i));
}
function cu(i, e) {
  return (i % e + e) % e;
}
function pa(i, e, t) {
  return (1 - t) * i + t * e;
}
function Cr(i, e) {
  switch (e.constructor) {
    case Float32Array:
      return i;
    case Uint32Array:
      return i / 4294967295;
    case Uint16Array:
      return i / 65535;
    case Uint8Array:
      return i / 255;
    case Int32Array:
      return Math.max(i / 2147483647, -1);
    case Int16Array:
      return Math.max(i / 32767, -1);
    case Int8Array:
      return Math.max(i / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
}
function gn(i, e) {
  switch (e.constructor) {
    case Float32Array:
      return i;
    case Uint32Array:
      return Math.round(i * 4294967295);
    case Uint16Array:
      return Math.round(i * 65535);
    case Uint8Array:
      return Math.round(i * 255);
    case Int32Array:
      return Math.round(i * 2147483647);
    case Int16Array:
      return Math.round(i * 32767);
    case Int8Array:
      return Math.round(i * 127);
    default:
      throw new Error("Invalid component type.");
  }
}
const du = {
  DEG2RAD: Rs
};
class Xe {
  constructor(e = 0, t = 0) {
    Xe.prototype.isVector2 = !0, this.x = e, this.y = t;
  }
  get width() {
    return this.x;
  }
  set width(e) {
    this.x = e;
  }
  get height() {
    return this.y;
  }
  set height(e) {
    this.y = e;
  }
  set(e, t) {
    return this.x = e, this.y = t, this;
  }
  setScalar(e) {
    return this.x = e, this.y = e, this;
  }
  setX(e) {
    return this.x = e, this;
  }
  setY(e) {
    return this.y = e, this;
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y);
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this;
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this;
  }
  addScalar(e) {
    return this.x += e, this.y += e, this;
  }
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this;
  }
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this;
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this;
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this;
  }
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this;
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this;
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this;
  }
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  applyMatrix3(e) {
    const t = this.x, n = this.y, r = e.elements;
    return this.x = r[0] * t + r[3] * n + r[6], this.y = r[1] * t + r[4] * n + r[7], this;
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this;
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this;
  }
  clamp(e, t) {
    return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this;
  }
  clampScalar(e, t) {
    return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this;
  }
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Math.max(e, Math.min(t, n)));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y;
  }
  cross(e) {
    return this.x * e.y - this.y * e.x;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  angle() {
    return Math.atan2(-this.y, -this.x) + Math.PI;
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const n = this.dot(e) / t;
    return Math.acos(pn(n, -1, 1));
  }
  distanceTo(e) {
    return Math.sqrt(this.distanceToSquared(e));
  }
  distanceToSquared(e) {
    const t = this.x - e.x, n = this.y - e.y;
    return t * t + n * n;
  }
  manhattanDistanceTo(e) {
    return Math.abs(this.x - e.x) + Math.abs(this.y - e.y);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this;
  }
  lerpVectors(e, t, n) {
    return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y;
  }
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e;
  }
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this;
  }
  rotateAround(e, t) {
    const n = Math.cos(t), r = Math.sin(t), s = this.x - e.x, a = this.y - e.y;
    return this.x = s * n - a * r + e.x, this.y = s * r + a * n + e.y, this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y;
  }
}
class at {
  constructor(e, t, n, r, s, a, o, l, d) {
    at.prototype.isMatrix3 = !0, this.elements = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ], e !== void 0 && this.set(e, t, n, r, s, a, o, l, d);
  }
  set(e, t, n, r, s, a, o, l, d) {
    const u = this.elements;
    return u[0] = e, u[1] = r, u[2] = o, u[3] = t, u[4] = s, u[5] = l, u[6] = n, u[7] = a, u[8] = d, this;
  }
  identity() {
    return this.set(
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ), this;
  }
  copy(e) {
    const t = this.elements, n = e.elements;
    return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], this;
  }
  extractBasis(e, t, n) {
    return e.setFromMatrix3Column(this, 0), t.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this;
  }
  setFromMatrix4(e) {
    const t = e.elements;
    return this.set(
      t[0],
      t[4],
      t[8],
      t[1],
      t[5],
      t[9],
      t[2],
      t[6],
      t[10]
    ), this;
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, t) {
    const n = e.elements, r = t.elements, s = this.elements, a = n[0], o = n[3], l = n[6], d = n[1], u = n[4], p = n[7], f = n[2], m = n[5], _ = n[8], x = r[0], c = r[3], h = r[6], M = r[1], y = r[4], w = r[7], I = r[2], R = r[5], C = r[8];
    return s[0] = a * x + o * M + l * I, s[3] = a * c + o * y + l * R, s[6] = a * h + o * w + l * C, s[1] = d * x + u * M + p * I, s[4] = d * c + u * y + p * R, s[7] = d * h + u * w + p * C, s[2] = f * x + m * M + _ * I, s[5] = f * c + m * y + _ * R, s[8] = f * h + m * w + _ * C, this;
  }
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[3] *= e, t[6] *= e, t[1] *= e, t[4] *= e, t[7] *= e, t[2] *= e, t[5] *= e, t[8] *= e, this;
  }
  determinant() {
    const e = this.elements, t = e[0], n = e[1], r = e[2], s = e[3], a = e[4], o = e[5], l = e[6], d = e[7], u = e[8];
    return t * a * u - t * o * d - n * s * u + n * o * l + r * s * d - r * a * l;
  }
  invert() {
    const e = this.elements, t = e[0], n = e[1], r = e[2], s = e[3], a = e[4], o = e[5], l = e[6], d = e[7], u = e[8], p = u * a - o * d, f = o * l - u * s, m = d * s - a * l, _ = t * p + n * f + r * m;
    if (_ === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const x = 1 / _;
    return e[0] = p * x, e[1] = (r * d - u * n) * x, e[2] = (o * n - r * a) * x, e[3] = f * x, e[4] = (u * t - r * l) * x, e[5] = (r * s - o * t) * x, e[6] = m * x, e[7] = (n * l - d * t) * x, e[8] = (a * t - n * s) * x, this;
  }
  transpose() {
    let e;
    const t = this.elements;
    return e = t[1], t[1] = t[3], t[3] = e, e = t[2], t[2] = t[6], t[6] = e, e = t[5], t[5] = t[7], t[7] = e, this;
  }
  getNormalMatrix(e) {
    return this.setFromMatrix4(e).invert().transpose();
  }
  transposeIntoArray(e) {
    const t = this.elements;
    return e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8], this;
  }
  setUvTransform(e, t, n, r, s, a, o) {
    const l = Math.cos(s), d = Math.sin(s);
    return this.set(
      n * l,
      n * d,
      -n * (l * a + d * o) + a + e,
      -r * d,
      r * l,
      -r * (-d * a + l * o) + o + t,
      0,
      0,
      1
    ), this;
  }
  //
  scale(e, t) {
    return this.premultiply(ma.makeScale(e, t)), this;
  }
  rotate(e) {
    return this.premultiply(ma.makeRotation(-e)), this;
  }
  translate(e, t) {
    return this.premultiply(ma.makeTranslation(e, t)), this;
  }
  // for 2D Transforms
  makeTranslation(e, t) {
    return e.isVector2 ? this.set(
      1,
      0,
      e.x,
      0,
      1,
      e.y,
      0,
      0,
      1
    ) : this.set(
      1,
      0,
      e,
      0,
      1,
      t,
      0,
      0,
      1
    ), this;
  }
  makeRotation(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      t,
      -n,
      0,
      n,
      t,
      0,
      0,
      0,
      1
    ), this;
  }
  makeScale(e, t) {
    return this.set(
      e,
      0,
      0,
      0,
      t,
      0,
      0,
      0,
      1
    ), this;
  }
  //
  equals(e) {
    const t = this.elements, n = e.elements;
    for (let r = 0; r < 9; r++)
      if (t[r] !== n[r]) return !1;
    return !0;
  }
  fromArray(e, t = 0) {
    for (let n = 0; n < 9; n++)
      this.elements[n] = e[n + t];
    return this;
  }
  toArray(e = [], t = 0) {
    const n = this.elements;
    return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e;
  }
  clone() {
    return new this.constructor().fromArray(this.elements);
  }
}
const ma = /* @__PURE__ */ new at();
function gd(i) {
  for (let e = i.length - 1; e >= 0; --e)
    if (i[e] >= 65535) return !0;
  return !1;
}
function Fs(i) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", i);
}
function hu() {
  const i = Fs("canvas");
  return i.style.display = "block", i;
}
const Ql = {};
function _d(i) {
  i in Ql || (Ql[i] = !0, console.warn(i));
}
function uu(i, e, t) {
  return new Promise(function(n, r) {
    function s() {
      switch (i.clientWaitSync(e, i.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case i.WAIT_FAILED:
          r();
          break;
        case i.TIMEOUT_EXPIRED:
          setTimeout(s, t);
          break;
        default:
          n();
      }
    }
    setTimeout(s, t);
  });
}
const Jl = /* @__PURE__ */ new at().set(
  0.8224621,
  0.177538,
  0,
  0.0331941,
  0.9668058,
  0,
  0.0170827,
  0.0723974,
  0.9105199
), ec = /* @__PURE__ */ new at().set(
  1.2249401,
  -0.2249404,
  0,
  -0.0420569,
  1.0420571,
  0,
  -0.0196376,
  -0.0786361,
  1.0982735
), Jr = {
  [gi]: {
    transfer: Is,
    primaries: Ds,
    toReference: (i) => i,
    fromReference: (i) => i
  },
  [Bn]: {
    transfer: Pt,
    primaries: Ds,
    toReference: (i) => i.convertSRGBToLinear(),
    fromReference: (i) => i.convertLinearToSRGB()
  },
  [Hs]: {
    transfer: Is,
    primaries: Us,
    toReference: (i) => i.applyMatrix3(ec),
    fromReference: (i) => i.applyMatrix3(Jl)
  },
  [lo]: {
    transfer: Pt,
    primaries: Us,
    toReference: (i) => i.convertSRGBToLinear().applyMatrix3(ec),
    fromReference: (i) => i.applyMatrix3(Jl).convertLinearToSRGB()
  }
}, fu = /* @__PURE__ */ new Set([gi, Hs]), _t = {
  enabled: !0,
  _workingColorSpace: gi,
  get workingColorSpace() {
    return this._workingColorSpace;
  },
  set workingColorSpace(i) {
    if (!fu.has(i))
      throw new Error(`Unsupported working color space, "${i}".`);
    this._workingColorSpace = i;
  },
  convert: function(i, e, t) {
    if (this.enabled === !1 || e === t || !e || !t)
      return i;
    const n = Jr[e].toReference, r = Jr[t].fromReference;
    return r(n(i));
  },
  fromWorkingColorSpace: function(i, e) {
    return this.convert(i, this._workingColorSpace, e);
  },
  toWorkingColorSpace: function(i, e) {
    return this.convert(i, e, this._workingColorSpace);
  },
  getPrimaries: function(i) {
    return Jr[i].primaries;
  },
  getTransfer: function(i) {
    return i === ci ? Is : Jr[i].transfer;
  }
};
function mr(i) {
  return i < 0.04045 ? i * 0.0773993808 : Math.pow(i * 0.9478672986 + 0.0521327014, 2.4);
}
function ga(i) {
  return i < 31308e-7 ? i * 12.92 : 1.055 * Math.pow(i, 0.41666) - 0.055;
}
let Yi;
class pu {
  static getDataURL(e) {
    if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u")
      return e.src;
    let t;
    if (e instanceof HTMLCanvasElement)
      t = e;
    else {
      Yi === void 0 && (Yi = Fs("canvas")), Yi.width = e.width, Yi.height = e.height;
      const n = Yi.getContext("2d");
      e instanceof ImageData ? n.putImageData(e, 0, 0) : n.drawImage(e, 0, 0, e.width, e.height), t = Yi;
    }
    return t.width > 2048 || t.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", e), t.toDataURL("image/jpeg", 0.6)) : t.toDataURL("image/png");
  }
  static sRGBToLinear(e) {
    if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
      const t = Fs("canvas");
      t.width = e.width, t.height = e.height;
      const n = t.getContext("2d");
      n.drawImage(e, 0, 0, e.width, e.height);
      const r = n.getImageData(0, 0, e.width, e.height), s = r.data;
      for (let a = 0; a < s.length; a++)
        s[a] = mr(s[a] / 255) * 255;
      return n.putImageData(r, 0, 0), t;
    } else if (e.data) {
      const t = e.data.slice(0);
      for (let n = 0; n < t.length; n++)
        t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[n] = Math.floor(mr(t[n] / 255) * 255) : t[n] = mr(t[n]);
      return {
        data: t,
        width: e.width,
        height: e.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
  }
}
let mu = 0;
class vd {
  constructor(e = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: mu++ }), this.uuid = Gr(), this.data = e, this.dataReady = !0, this.version = 0;
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    if (!t && e.images[this.uuid] !== void 0)
      return e.images[this.uuid];
    const n = {
      uuid: this.uuid,
      url: ""
    }, r = this.data;
    if (r !== null) {
      let s;
      if (Array.isArray(r)) {
        s = [];
        for (let a = 0, o = r.length; a < o; a++)
          r[a].isDataTexture ? s.push(_a(r[a].image)) : s.push(_a(r[a]));
      } else
        s = _a(r);
      n.url = s;
    }
    return t || (e.images[this.uuid] = n), n;
  }
}
function _a(i) {
  return typeof HTMLImageElement < "u" && i instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && i instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && i instanceof ImageBitmap ? pu.getDataURL(i) : i.data ? {
    data: Array.from(i.data),
    width: i.width,
    height: i.height,
    type: i.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let gu = 0;
class vn extends Ui {
  constructor(e = vn.DEFAULT_IMAGE, t = vn.DEFAULT_MAPPING, n = Li, r = Li, s = In, a = Ni, o = Hn, l = pi, d = vn.DEFAULT_ANISOTROPY, u = ci) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: gu++ }), this.uuid = Gr(), this.name = "", this.source = new vd(e), this.mipmaps = [], this.mapping = t, this.channel = 0, this.wrapS = n, this.wrapT = r, this.magFilter = s, this.minFilter = a, this.anisotropy = d, this.format = o, this.internalFormat = null, this.type = l, this.offset = new Xe(0, 0), this.repeat = new Xe(1, 1), this.center = new Xe(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new at(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = u, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.pmremVersion = 0;
  }
  get image() {
    return this.source.data;
  }
  set image(e = null) {
    this.source.data = e;
  }
  updateMatrix() {
    this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.name = e.name, this.source = e.source, this.mipmaps = e.mipmaps.slice(0), this.mapping = e.mapping, this.channel = e.channel, this.wrapS = e.wrapS, this.wrapT = e.wrapT, this.magFilter = e.magFilter, this.minFilter = e.minFilter, this.anisotropy = e.anisotropy, this.format = e.format, this.internalFormat = e.internalFormat, this.type = e.type, this.offset.copy(e.offset), this.repeat.copy(e.repeat), this.center.copy(e.center), this.rotation = e.rotation, this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrix.copy(e.matrix), this.generateMipmaps = e.generateMipmaps, this.premultiplyAlpha = e.premultiplyAlpha, this.flipY = e.flipY, this.unpackAlignment = e.unpackAlignment, this.colorSpace = e.colorSpace, this.userData = JSON.parse(JSON.stringify(e.userData)), this.needsUpdate = !0, this;
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    if (!t && e.textures[this.uuid] !== void 0)
      return e.textures[this.uuid];
    const n = {
      metadata: {
        version: 4.6,
        type: "Texture",
        generator: "Texture.toJSON"
      },
      uuid: this.uuid,
      name: this.name,
      image: this.source.toJSON(e).uuid,
      mapping: this.mapping,
      channel: this.channel,
      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,
      wrap: [this.wrapS, this.wrapT],
      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      colorSpace: this.colorSpace,
      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,
      flipY: this.flipY,
      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment
    };
    return Object.keys(this.userData).length > 0 && (n.userData = this.userData), t || (e.textures[this.uuid] = n), n;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  transformUv(e) {
    if (this.mapping !== od) return e;
    if (e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1)
      switch (this.wrapS) {
        case Ja:
          e.x = e.x - Math.floor(e.x);
          break;
        case Li:
          e.x = e.x < 0 ? 0 : 1;
          break;
        case eo:
          Math.abs(Math.floor(e.x) % 2) === 1 ? e.x = Math.ceil(e.x) - e.x : e.x = e.x - Math.floor(e.x);
          break;
      }
    if (e.y < 0 || e.y > 1)
      switch (this.wrapT) {
        case Ja:
          e.y = e.y - Math.floor(e.y);
          break;
        case Li:
          e.y = e.y < 0 ? 0 : 1;
          break;
        case eo:
          Math.abs(Math.floor(e.y) % 2) === 1 ? e.y = Math.ceil(e.y) - e.y : e.y = e.y - Math.floor(e.y);
          break;
      }
    return this.flipY && (e.y = 1 - e.y), e;
  }
  set needsUpdate(e) {
    e === !0 && (this.version++, this.source.needsUpdate = !0);
  }
  set needsPMREMUpdate(e) {
    e === !0 && this.pmremVersion++;
  }
}
vn.DEFAULT_IMAGE = null;
vn.DEFAULT_MAPPING = od;
vn.DEFAULT_ANISOTROPY = 1;
class en {
  constructor(e = 0, t = 0, n = 0, r = 1) {
    en.prototype.isVector4 = !0, this.x = e, this.y = t, this.z = n, this.w = r;
  }
  get width() {
    return this.z;
  }
  set width(e) {
    this.z = e;
  }
  get height() {
    return this.w;
  }
  set height(e) {
    this.w = e;
  }
  set(e, t, n, r) {
    return this.x = e, this.y = t, this.z = n, this.w = r, this;
  }
  setScalar(e) {
    return this.x = e, this.y = e, this.z = e, this.w = e, this;
  }
  setX(e) {
    return this.x = e, this;
  }
  setY(e) {
    return this.y = e, this;
  }
  setZ(e) {
    return this.z = e, this;
  }
  setW(e) {
    return this.w = e, this;
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      case 2:
        this.z = t;
        break;
      case 3:
        this.w = t;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this.w = e.w !== void 0 ? e.w : 1, this;
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this.z += e.z, this.w += e.w, this;
  }
  addScalar(e) {
    return this.x += e, this.y += e, this.z += e, this.w += e, this;
  }
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this.w = e.w + t.w, this;
  }
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this.w += e.w * t, this;
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this.z -= e.z, this.w -= e.w, this;
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this.z -= e, this.w -= e, this;
  }
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this.w = e.w - t.w, this;
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this.z *= e.z, this.w *= e.w, this;
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this.z *= e, this.w *= e, this;
  }
  applyMatrix4(e) {
    const t = this.x, n = this.y, r = this.z, s = this.w, a = e.elements;
    return this.x = a[0] * t + a[4] * n + a[8] * r + a[12] * s, this.y = a[1] * t + a[5] * n + a[9] * r + a[13] * s, this.z = a[2] * t + a[6] * n + a[10] * r + a[14] * s, this.w = a[3] * t + a[7] * n + a[11] * r + a[15] * s, this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  setAxisAngleFromQuaternion(e) {
    this.w = 2 * Math.acos(e.w);
    const t = Math.sqrt(1 - e.w * e.w);
    return t < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = e.x / t, this.y = e.y / t, this.z = e.z / t), this;
  }
  setAxisAngleFromRotationMatrix(e) {
    let t, n, r, s;
    const l = e.elements, d = l[0], u = l[4], p = l[8], f = l[1], m = l[5], _ = l[9], x = l[2], c = l[6], h = l[10];
    if (Math.abs(u - f) < 0.01 && Math.abs(p - x) < 0.01 && Math.abs(_ - c) < 0.01) {
      if (Math.abs(u + f) < 0.1 && Math.abs(p + x) < 0.1 && Math.abs(_ + c) < 0.1 && Math.abs(d + m + h - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      t = Math.PI;
      const y = (d + 1) / 2, w = (m + 1) / 2, I = (h + 1) / 2, R = (u + f) / 4, C = (p + x) / 4, U = (_ + c) / 4;
      return y > w && y > I ? y < 0.01 ? (n = 0, r = 0.707106781, s = 0.707106781) : (n = Math.sqrt(y), r = R / n, s = C / n) : w > I ? w < 0.01 ? (n = 0.707106781, r = 0, s = 0.707106781) : (r = Math.sqrt(w), n = R / r, s = U / r) : I < 0.01 ? (n = 0.707106781, r = 0.707106781, s = 0) : (s = Math.sqrt(I), n = C / s, r = U / s), this.set(n, r, s, t), this;
    }
    let M = Math.sqrt((c - _) * (c - _) + (p - x) * (p - x) + (f - u) * (f - u));
    return Math.abs(M) < 1e-3 && (M = 1), this.x = (c - _) / M, this.y = (p - x) / M, this.z = (f - u) / M, this.w = Math.acos((d + m + h - 1) / 2), this;
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this.w = Math.min(this.w, e.w), this;
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this.w = Math.max(this.w, e.w), this;
  }
  clamp(e, t) {
    return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this.w = Math.max(e.w, Math.min(t.w, this.w)), this;
  }
  clampScalar(e, t) {
    return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this.z = Math.max(e, Math.min(t, this.z)), this.w = Math.max(e, Math.min(t, this.w)), this;
  }
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Math.max(e, Math.min(t, n)));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this.w += (e.w - this.w) * t, this;
  }
  lerpVectors(e, t, n) {
    return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this.w = e.w + (t.w - e.w) * n, this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w;
  }
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this.w = e[t + 3], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e[t + 3] = this.w, e;
  }
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this.w = e.getW(t), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z, yield this.w;
  }
}
class _u extends Ui {
  constructor(e = 1, t = 1, n = {}) {
    super(), this.isRenderTarget = !0, this.width = e, this.height = t, this.depth = 1, this.scissor = new en(0, 0, e, t), this.scissorTest = !1, this.viewport = new en(0, 0, e, t);
    const r = { width: e, height: t, depth: 1 };
    n = Object.assign({
      generateMipmaps: !1,
      internalFormat: null,
      minFilter: In,
      depthBuffer: !0,
      stencilBuffer: !1,
      resolveDepthBuffer: !0,
      resolveStencilBuffer: !0,
      depthTexture: null,
      samples: 0,
      count: 1
    }, n);
    const s = new vn(r, n.mapping, n.wrapS, n.wrapT, n.magFilter, n.minFilter, n.format, n.type, n.anisotropy, n.colorSpace);
    s.flipY = !1, s.generateMipmaps = n.generateMipmaps, s.internalFormat = n.internalFormat, this.textures = [];
    const a = n.count;
    for (let o = 0; o < a; o++)
      this.textures[o] = s.clone(), this.textures[o].isRenderTargetTexture = !0;
    this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this.depthTexture = n.depthTexture, this.samples = n.samples;
  }
  get texture() {
    return this.textures[0];
  }
  set texture(e) {
    this.textures[0] = e;
  }
  setSize(e, t, n = 1) {
    if (this.width !== e || this.height !== t || this.depth !== n) {
      this.width = e, this.height = t, this.depth = n;
      for (let r = 0, s = this.textures.length; r < s; r++)
        this.textures[r].image.width = e, this.textures[r].image.height = t, this.textures[r].image.depth = n;
      this.dispose();
    }
    this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.width = e.width, this.height = e.height, this.depth = e.depth, this.scissor.copy(e.scissor), this.scissorTest = e.scissorTest, this.viewport.copy(e.viewport), this.textures.length = 0;
    for (let n = 0, r = e.textures.length; n < r; n++)
      this.textures[n] = e.textures[n].clone(), this.textures[n].isRenderTargetTexture = !0;
    const t = Object.assign({}, e.texture.image);
    return this.texture.source = new vd(t), this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class Di extends _u {
  constructor(e = 1, t = 1, n = {}) {
    super(e, t, n), this.isWebGLRenderTarget = !0;
  }
}
class xd extends vn {
  constructor(e = null, t = 1, n = 1, r = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = { data: e, width: t, height: n, depth: r }, this.magFilter = wn, this.minFilter = wn, this.wrapR = Li, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
  }
  addLayerUpdate(e) {
    this.layerUpdates.add(e);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}
class vu extends vn {
  constructor(e = null, t = 1, n = 1, r = 1) {
    super(null), this.isData3DTexture = !0, this.image = { data: e, width: t, height: n, depth: r }, this.magFilter = wn, this.minFilter = wn, this.wrapR = Li, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
class Yt {
  constructor(e = 0, t = 0, n = 0, r = 1) {
    this.isQuaternion = !0, this._x = e, this._y = t, this._z = n, this._w = r;
  }
  static slerpFlat(e, t, n, r, s, a, o) {
    let l = n[r + 0], d = n[r + 1], u = n[r + 2], p = n[r + 3];
    const f = s[a + 0], m = s[a + 1], _ = s[a + 2], x = s[a + 3];
    if (o === 0) {
      e[t + 0] = l, e[t + 1] = d, e[t + 2] = u, e[t + 3] = p;
      return;
    }
    if (o === 1) {
      e[t + 0] = f, e[t + 1] = m, e[t + 2] = _, e[t + 3] = x;
      return;
    }
    if (p !== x || l !== f || d !== m || u !== _) {
      let c = 1 - o;
      const h = l * f + d * m + u * _ + p * x, M = h >= 0 ? 1 : -1, y = 1 - h * h;
      if (y > Number.EPSILON) {
        const I = Math.sqrt(y), R = Math.atan2(I, h * M);
        c = Math.sin(c * R) / I, o = Math.sin(o * R) / I;
      }
      const w = o * M;
      if (l = l * c + f * w, d = d * c + m * w, u = u * c + _ * w, p = p * c + x * w, c === 1 - o) {
        const I = 1 / Math.sqrt(l * l + d * d + u * u + p * p);
        l *= I, d *= I, u *= I, p *= I;
      }
    }
    e[t] = l, e[t + 1] = d, e[t + 2] = u, e[t + 3] = p;
  }
  static multiplyQuaternionsFlat(e, t, n, r, s, a) {
    const o = n[r], l = n[r + 1], d = n[r + 2], u = n[r + 3], p = s[a], f = s[a + 1], m = s[a + 2], _ = s[a + 3];
    return e[t] = o * _ + u * p + l * m - d * f, e[t + 1] = l * _ + u * f + d * p - o * m, e[t + 2] = d * _ + u * m + o * f - l * p, e[t + 3] = u * _ - o * p - l * f - d * m, e;
  }
  get x() {
    return this._x;
  }
  set x(e) {
    this._x = e, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(e) {
    this._y = e, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(e) {
    this._z = e, this._onChangeCallback();
  }
  get w() {
    return this._w;
  }
  set w(e) {
    this._w = e, this._onChangeCallback();
  }
  set(e, t, n, r) {
    return this._x = e, this._y = t, this._z = n, this._w = r, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  }
  copy(e) {
    return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this._onChangeCallback(), this;
  }
  setFromEuler(e, t = !0) {
    const n = e._x, r = e._y, s = e._z, a = e._order, o = Math.cos, l = Math.sin, d = o(n / 2), u = o(r / 2), p = o(s / 2), f = l(n / 2), m = l(r / 2), _ = l(s / 2);
    switch (a) {
      case "XYZ":
        this._x = f * u * p + d * m * _, this._y = d * m * p - f * u * _, this._z = d * u * _ + f * m * p, this._w = d * u * p - f * m * _;
        break;
      case "YXZ":
        this._x = f * u * p + d * m * _, this._y = d * m * p - f * u * _, this._z = d * u * _ - f * m * p, this._w = d * u * p + f * m * _;
        break;
      case "ZXY":
        this._x = f * u * p - d * m * _, this._y = d * m * p + f * u * _, this._z = d * u * _ + f * m * p, this._w = d * u * p - f * m * _;
        break;
      case "ZYX":
        this._x = f * u * p - d * m * _, this._y = d * m * p + f * u * _, this._z = d * u * _ - f * m * p, this._w = d * u * p + f * m * _;
        break;
      case "YZX":
        this._x = f * u * p + d * m * _, this._y = d * m * p + f * u * _, this._z = d * u * _ - f * m * p, this._w = d * u * p - f * m * _;
        break;
      case "XZY":
        this._x = f * u * p - d * m * _, this._y = d * m * p - f * u * _, this._z = d * u * _ + f * m * p, this._w = d * u * p + f * m * _;
        break;
      default:
        console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + a);
    }
    return t === !0 && this._onChangeCallback(), this;
  }
  setFromAxisAngle(e, t) {
    const n = t / 2, r = Math.sin(n);
    return this._x = e.x * r, this._y = e.y * r, this._z = e.z * r, this._w = Math.cos(n), this._onChangeCallback(), this;
  }
  setFromRotationMatrix(e) {
    const t = e.elements, n = t[0], r = t[4], s = t[8], a = t[1], o = t[5], l = t[9], d = t[2], u = t[6], p = t[10], f = n + o + p;
    if (f > 0) {
      const m = 0.5 / Math.sqrt(f + 1);
      this._w = 0.25 / m, this._x = (u - l) * m, this._y = (s - d) * m, this._z = (a - r) * m;
    } else if (n > o && n > p) {
      const m = 2 * Math.sqrt(1 + n - o - p);
      this._w = (u - l) / m, this._x = 0.25 * m, this._y = (r + a) / m, this._z = (s + d) / m;
    } else if (o > p) {
      const m = 2 * Math.sqrt(1 + o - n - p);
      this._w = (s - d) / m, this._x = (r + a) / m, this._y = 0.25 * m, this._z = (l + u) / m;
    } else {
      const m = 2 * Math.sqrt(1 + p - n - o);
      this._w = (a - r) / m, this._x = (s + d) / m, this._y = (l + u) / m, this._z = 0.25 * m;
    }
    return this._onChangeCallback(), this;
  }
  setFromUnitVectors(e, t) {
    let n = e.dot(t) + 1;
    return n < Number.EPSILON ? (n = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = n)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = n), this.normalize();
  }
  angleTo(e) {
    return 2 * Math.acos(Math.abs(pn(this.dot(e), -1, 1)));
  }
  rotateTowards(e, t) {
    const n = this.angleTo(e);
    if (n === 0) return this;
    const r = Math.min(1, t / n);
    return this.slerp(e, r), this;
  }
  identity() {
    return this.set(0, 0, 0, 1);
  }
  invert() {
    return this.conjugate();
  }
  conjugate() {
    return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
  }
  dot(e) {
    return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w;
  }
  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
  }
  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  }
  normalize() {
    let e = this.length();
    return e === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x = this._x * e, this._y = this._y * e, this._z = this._z * e, this._w = this._w * e), this._onChangeCallback(), this;
  }
  multiply(e) {
    return this.multiplyQuaternions(this, e);
  }
  premultiply(e) {
    return this.multiplyQuaternions(e, this);
  }
  multiplyQuaternions(e, t) {
    const n = e._x, r = e._y, s = e._z, a = e._w, o = t._x, l = t._y, d = t._z, u = t._w;
    return this._x = n * u + a * o + r * d - s * l, this._y = r * u + a * l + s * o - n * d, this._z = s * u + a * d + n * l - r * o, this._w = a * u - n * o - r * l - s * d, this._onChangeCallback(), this;
  }
  slerp(e, t) {
    if (t === 0) return this;
    if (t === 1) return this.copy(e);
    const n = this._x, r = this._y, s = this._z, a = this._w;
    let o = a * e._w + n * e._x + r * e._y + s * e._z;
    if (o < 0 ? (this._w = -e._w, this._x = -e._x, this._y = -e._y, this._z = -e._z, o = -o) : this.copy(e), o >= 1)
      return this._w = a, this._x = n, this._y = r, this._z = s, this;
    const l = 1 - o * o;
    if (l <= Number.EPSILON) {
      const m = 1 - t;
      return this._w = m * a + t * this._w, this._x = m * n + t * this._x, this._y = m * r + t * this._y, this._z = m * s + t * this._z, this.normalize(), this;
    }
    const d = Math.sqrt(l), u = Math.atan2(d, o), p = Math.sin((1 - t) * u) / d, f = Math.sin(t * u) / d;
    return this._w = a * p + this._w * f, this._x = n * p + this._x * f, this._y = r * p + this._y * f, this._z = s * p + this._z * f, this._onChangeCallback(), this;
  }
  slerpQuaternions(e, t, n) {
    return this.copy(e).slerp(t, n);
  }
  random() {
    const e = 2 * Math.PI * Math.random(), t = 2 * Math.PI * Math.random(), n = Math.random(), r = Math.sqrt(1 - n), s = Math.sqrt(n);
    return this.set(
      r * Math.sin(e),
      r * Math.cos(e),
      s * Math.sin(t),
      s * Math.cos(t)
    );
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w;
  }
  fromArray(e, t = 0) {
    return this._x = e[t], this._y = e[t + 1], this._z = e[t + 2], this._w = e[t + 3], this._onChangeCallback(), this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._w, e;
  }
  fromBufferAttribute(e, t) {
    return this._x = e.getX(t), this._y = e.getY(t), this._z = e.getZ(t), this._w = e.getW(t), this._onChangeCallback(), this;
  }
  toJSON() {
    return this.toArray();
  }
  _onChange(e) {
    return this._onChangeCallback = e, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._w;
  }
}
class N {
  constructor(e = 0, t = 0, n = 0) {
    N.prototype.isVector3 = !0, this.x = e, this.y = t, this.z = n;
  }
  set(e, t, n) {
    return n === void 0 && (n = this.z), this.x = e, this.y = t, this.z = n, this;
  }
  setScalar(e) {
    return this.x = e, this.y = e, this.z = e, this;
  }
  setX(e) {
    return this.x = e, this;
  }
  setY(e) {
    return this.y = e, this;
  }
  setZ(e) {
    return this.z = e, this;
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      case 2:
        this.z = t;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z);
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this;
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this.z += e.z, this;
  }
  addScalar(e) {
    return this.x += e, this.y += e, this.z += e, this;
  }
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this;
  }
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this;
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this.z -= e.z, this;
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this.z -= e, this;
  }
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this;
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this.z *= e.z, this;
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this.z *= e, this;
  }
  multiplyVectors(e, t) {
    return this.x = e.x * t.x, this.y = e.y * t.y, this.z = e.z * t.z, this;
  }
  applyEuler(e) {
    return this.applyQuaternion(tc.setFromEuler(e));
  }
  applyAxisAngle(e, t) {
    return this.applyQuaternion(tc.setFromAxisAngle(e, t));
  }
  applyMatrix3(e) {
    const t = this.x, n = this.y, r = this.z, s = e.elements;
    return this.x = s[0] * t + s[3] * n + s[6] * r, this.y = s[1] * t + s[4] * n + s[7] * r, this.z = s[2] * t + s[5] * n + s[8] * r, this;
  }
  applyNormalMatrix(e) {
    return this.applyMatrix3(e).normalize();
  }
  applyMatrix4(e) {
    const t = this.x, n = this.y, r = this.z, s = e.elements, a = 1 / (s[3] * t + s[7] * n + s[11] * r + s[15]);
    return this.x = (s[0] * t + s[4] * n + s[8] * r + s[12]) * a, this.y = (s[1] * t + s[5] * n + s[9] * r + s[13]) * a, this.z = (s[2] * t + s[6] * n + s[10] * r + s[14]) * a, this;
  }
  applyQuaternion(e) {
    const t = this.x, n = this.y, r = this.z, s = e.x, a = e.y, o = e.z, l = e.w, d = 2 * (a * r - o * n), u = 2 * (o * t - s * r), p = 2 * (s * n - a * t);
    return this.x = t + l * d + a * p - o * u, this.y = n + l * u + o * d - s * p, this.z = r + l * p + s * u - a * d, this;
  }
  project(e) {
    return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix);
  }
  unproject(e) {
    return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld);
  }
  transformDirection(e) {
    const t = this.x, n = this.y, r = this.z, s = e.elements;
    return this.x = s[0] * t + s[4] * n + s[8] * r, this.y = s[1] * t + s[5] * n + s[9] * r, this.z = s[2] * t + s[6] * n + s[10] * r, this.normalize();
  }
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this.z /= e.z, this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this;
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this;
  }
  clamp(e, t) {
    return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this;
  }
  clampScalar(e, t) {
    return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this.z = Math.max(e, Math.min(t, this.z)), this;
  }
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Math.max(e, Math.min(t, n)));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z;
  }
  // TODO lengthSquared?
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this;
  }
  lerpVectors(e, t, n) {
    return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this;
  }
  cross(e) {
    return this.crossVectors(this, e);
  }
  crossVectors(e, t) {
    const n = e.x, r = e.y, s = e.z, a = t.x, o = t.y, l = t.z;
    return this.x = r * l - s * o, this.y = s * a - n * l, this.z = n * o - r * a, this;
  }
  projectOnVector(e) {
    const t = e.lengthSq();
    if (t === 0) return this.set(0, 0, 0);
    const n = e.dot(this) / t;
    return this.copy(e).multiplyScalar(n);
  }
  projectOnPlane(e) {
    return va.copy(this).projectOnVector(e), this.sub(va);
  }
  reflect(e) {
    return this.sub(va.copy(e).multiplyScalar(2 * this.dot(e)));
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const n = this.dot(e) / t;
    return Math.acos(pn(n, -1, 1));
  }
  distanceTo(e) {
    return Math.sqrt(this.distanceToSquared(e));
  }
  distanceToSquared(e) {
    const t = this.x - e.x, n = this.y - e.y, r = this.z - e.z;
    return t * t + n * n + r * r;
  }
  manhattanDistanceTo(e) {
    return Math.abs(this.x - e.x) + Math.abs(this.y - e.y) + Math.abs(this.z - e.z);
  }
  setFromSpherical(e) {
    return this.setFromSphericalCoords(e.radius, e.phi, e.theta);
  }
  setFromSphericalCoords(e, t, n) {
    const r = Math.sin(t) * e;
    return this.x = r * Math.sin(n), this.y = Math.cos(t) * e, this.z = r * Math.cos(n), this;
  }
  setFromCylindrical(e) {
    return this.setFromCylindricalCoords(e.radius, e.theta, e.y);
  }
  setFromCylindricalCoords(e, t, n) {
    return this.x = e * Math.sin(t), this.y = n, this.z = e * Math.cos(t), this;
  }
  setFromMatrixPosition(e) {
    const t = e.elements;
    return this.x = t[12], this.y = t[13], this.z = t[14], this;
  }
  setFromMatrixScale(e) {
    const t = this.setFromMatrixColumn(e, 0).length(), n = this.setFromMatrixColumn(e, 1).length(), r = this.setFromMatrixColumn(e, 2).length();
    return this.x = t, this.y = n, this.z = r, this;
  }
  setFromMatrixColumn(e, t) {
    return this.fromArray(e.elements, t * 4);
  }
  setFromMatrix3Column(e, t) {
    return this.fromArray(e.elements, t * 3);
  }
  setFromEuler(e) {
    return this.x = e._x, this.y = e._y, this.z = e._z, this;
  }
  setFromColor(e) {
    return this.x = e.r, this.y = e.g, this.z = e.b, this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z;
  }
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e;
  }
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
  }
  randomDirection() {
    const e = Math.random() * Math.PI * 2, t = Math.random() * 2 - 1, n = Math.sqrt(1 - t * t);
    return this.x = n * Math.cos(e), this.y = t, this.z = n * Math.sin(e), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z;
  }
}
const va = /* @__PURE__ */ new N(), tc = /* @__PURE__ */ new Yt();
class Wr {
  constructor(e = new N(1 / 0, 1 / 0, 1 / 0), t = new N(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = !0, this.min = e, this.max = t;
  }
  set(e, t) {
    return this.min.copy(e), this.max.copy(t), this;
  }
  setFromArray(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t += 3)
      this.expandByPoint(Pn.fromArray(e, t));
    return this;
  }
  setFromBufferAttribute(e) {
    this.makeEmpty();
    for (let t = 0, n = e.count; t < n; t++)
      this.expandByPoint(Pn.fromBufferAttribute(e, t));
    return this;
  }
  setFromPoints(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t++)
      this.expandByPoint(e[t]);
    return this;
  }
  setFromCenterAndSize(e, t) {
    const n = Pn.copy(t).multiplyScalar(0.5);
    return this.min.copy(e).sub(n), this.max.copy(e).add(n), this;
  }
  setFromObject(e, t = !1) {
    return this.makeEmpty(), this.expandByObject(e, t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.min.copy(e.min), this.max.copy(e.max), this;
  }
  makeEmpty() {
    return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this;
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  }
  getCenter(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min);
  }
  expandByPoint(e) {
    return this.min.min(e), this.max.max(e), this;
  }
  expandByVector(e) {
    return this.min.sub(e), this.max.add(e), this;
  }
  expandByScalar(e) {
    return this.min.addScalar(-e), this.max.addScalar(e), this;
  }
  expandByObject(e, t = !1) {
    e.updateWorldMatrix(!1, !1);
    const n = e.geometry;
    if (n !== void 0) {
      const s = n.getAttribute("position");
      if (t === !0 && s !== void 0 && e.isInstancedMesh !== !0)
        for (let a = 0, o = s.count; a < o; a++)
          e.isMesh === !0 ? e.getVertexPosition(a, Pn) : Pn.fromBufferAttribute(s, a), Pn.applyMatrix4(e.matrixWorld), this.expandByPoint(Pn);
      else
        e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), es.copy(e.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), es.copy(n.boundingBox)), es.applyMatrix4(e.matrixWorld), this.union(es);
    }
    const r = e.children;
    for (let s = 0, a = r.length; s < a; s++)
      this.expandByObject(r[s], t);
    return this;
  }
  containsPoint(e) {
    return !(e.x < this.min.x || e.x > this.max.x || e.y < this.min.y || e.y > this.max.y || e.z < this.min.z || e.z > this.max.z);
  }
  containsBox(e) {
    return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z;
  }
  getParameter(e, t) {
    return t.set(
      (e.x - this.min.x) / (this.max.x - this.min.x),
      (e.y - this.min.y) / (this.max.y - this.min.y),
      (e.z - this.min.z) / (this.max.z - this.min.z)
    );
  }
  intersectsBox(e) {
    return !(e.max.x < this.min.x || e.min.x > this.max.x || e.max.y < this.min.y || e.min.y > this.max.y || e.max.z < this.min.z || e.min.z > this.max.z);
  }
  intersectsSphere(e) {
    return this.clampPoint(e.center, Pn), Pn.distanceToSquared(e.center) <= e.radius * e.radius;
  }
  intersectsPlane(e) {
    let t, n;
    return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant;
  }
  intersectsTriangle(e) {
    if (this.isEmpty())
      return !1;
    this.getCenter(Pr), ts.subVectors(this.max, Pr), qi.subVectors(e.a, Pr), ji.subVectors(e.b, Pr), Ki.subVectors(e.c, Pr), ti.subVectors(ji, qi), ni.subVectors(Ki, ji), xi.subVectors(qi, Ki);
    let t = [
      0,
      -ti.z,
      ti.y,
      0,
      -ni.z,
      ni.y,
      0,
      -xi.z,
      xi.y,
      ti.z,
      0,
      -ti.x,
      ni.z,
      0,
      -ni.x,
      xi.z,
      0,
      -xi.x,
      -ti.y,
      ti.x,
      0,
      -ni.y,
      ni.x,
      0,
      -xi.y,
      xi.x,
      0
    ];
    return !xa(t, qi, ji, Ki, ts) || (t = [1, 0, 0, 0, 1, 0, 0, 0, 1], !xa(t, qi, ji, Ki, ts)) ? !1 : (ns.crossVectors(ti, ni), t = [ns.x, ns.y, ns.z], xa(t, qi, ji, Ki, ts));
  }
  clampPoint(e, t) {
    return t.copy(e).clamp(this.min, this.max);
  }
  distanceToPoint(e) {
    return this.clampPoint(e, Pn).distanceTo(e);
  }
  getBoundingSphere(e) {
    return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(Pn).length() * 0.5), e;
  }
  intersect(e) {
    return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(e) {
    return this.min.min(e.min), this.max.max(e.max), this;
  }
  applyMatrix4(e) {
    return this.isEmpty() ? this : (Yn[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), Yn[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), Yn[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), Yn[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), Yn[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), Yn[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), Yn[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), Yn[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(Yn), this);
  }
  translate(e) {
    return this.min.add(e), this.max.add(e), this;
  }
  equals(e) {
    return e.min.equals(this.min) && e.max.equals(this.max);
  }
}
const Yn = [
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N()
], Pn = /* @__PURE__ */ new N(), es = /* @__PURE__ */ new Wr(), qi = /* @__PURE__ */ new N(), ji = /* @__PURE__ */ new N(), Ki = /* @__PURE__ */ new N(), ti = /* @__PURE__ */ new N(), ni = /* @__PURE__ */ new N(), xi = /* @__PURE__ */ new N(), Pr = /* @__PURE__ */ new N(), ts = /* @__PURE__ */ new N(), ns = /* @__PURE__ */ new N(), yi = /* @__PURE__ */ new N();
function xa(i, e, t, n, r) {
  for (let s = 0, a = i.length - 3; s <= a; s += 3) {
    yi.fromArray(i, s);
    const o = r.x * Math.abs(yi.x) + r.y * Math.abs(yi.y) + r.z * Math.abs(yi.z), l = e.dot(yi), d = t.dot(yi), u = n.dot(yi);
    if (Math.max(-Math.max(l, d, u), Math.min(l, d, u)) > o)
      return !1;
  }
  return !0;
}
const xu = /* @__PURE__ */ new Wr(), Lr = /* @__PURE__ */ new N(), ya = /* @__PURE__ */ new N();
class Gs {
  constructor(e = new N(), t = -1) {
    this.isSphere = !0, this.center = e, this.radius = t;
  }
  set(e, t) {
    return this.center.copy(e), this.radius = t, this;
  }
  setFromPoints(e, t) {
    const n = this.center;
    t !== void 0 ? n.copy(t) : xu.setFromPoints(e).getCenter(n);
    let r = 0;
    for (let s = 0, a = e.length; s < a; s++)
      r = Math.max(r, n.distanceToSquared(e[s]));
    return this.radius = Math.sqrt(r), this;
  }
  copy(e) {
    return this.center.copy(e.center), this.radius = e.radius, this;
  }
  isEmpty() {
    return this.radius < 0;
  }
  makeEmpty() {
    return this.center.set(0, 0, 0), this.radius = -1, this;
  }
  containsPoint(e) {
    return e.distanceToSquared(this.center) <= this.radius * this.radius;
  }
  distanceToPoint(e) {
    return e.distanceTo(this.center) - this.radius;
  }
  intersectsSphere(e) {
    const t = this.radius + e.radius;
    return e.center.distanceToSquared(this.center) <= t * t;
  }
  intersectsBox(e) {
    return e.intersectsSphere(this);
  }
  intersectsPlane(e) {
    return Math.abs(e.distanceToPoint(this.center)) <= this.radius;
  }
  clampPoint(e, t) {
    const n = this.center.distanceToSquared(e);
    return t.copy(e), n > this.radius * this.radius && (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)), t;
  }
  getBoundingBox(e) {
    return this.isEmpty() ? (e.makeEmpty(), e) : (e.set(this.center, this.center), e.expandByScalar(this.radius), e);
  }
  applyMatrix4(e) {
    return this.center.applyMatrix4(e), this.radius = this.radius * e.getMaxScaleOnAxis(), this;
  }
  translate(e) {
    return this.center.add(e), this;
  }
  expandByPoint(e) {
    if (this.isEmpty())
      return this.center.copy(e), this.radius = 0, this;
    Lr.subVectors(e, this.center);
    const t = Lr.lengthSq();
    if (t > this.radius * this.radius) {
      const n = Math.sqrt(t), r = (n - this.radius) * 0.5;
      this.center.addScaledVector(Lr, r / n), this.radius += r;
    }
    return this;
  }
  union(e) {
    return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (ya.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(Lr.copy(e.center).add(ya)), this.expandByPoint(Lr.copy(e.center).sub(ya))), this);
  }
  equals(e) {
    return e.center.equals(this.center) && e.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const qn = /* @__PURE__ */ new N(), Sa = /* @__PURE__ */ new N(), is = /* @__PURE__ */ new N(), ii = /* @__PURE__ */ new N(), Ma = /* @__PURE__ */ new N(), rs = /* @__PURE__ */ new N(), Ea = /* @__PURE__ */ new N();
class Ws {
  constructor(e = new N(), t = new N(0, 0, -1)) {
    this.origin = e, this.direction = t;
  }
  set(e, t) {
    return this.origin.copy(e), this.direction.copy(t), this;
  }
  copy(e) {
    return this.origin.copy(e.origin), this.direction.copy(e.direction), this;
  }
  at(e, t) {
    return t.copy(this.origin).addScaledVector(this.direction, e);
  }
  lookAt(e) {
    return this.direction.copy(e).sub(this.origin).normalize(), this;
  }
  recast(e) {
    return this.origin.copy(this.at(e, qn)), this;
  }
  closestPointToPoint(e, t) {
    t.subVectors(e, this.origin);
    const n = t.dot(this.direction);
    return n < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, n);
  }
  distanceToPoint(e) {
    return Math.sqrt(this.distanceSqToPoint(e));
  }
  distanceSqToPoint(e) {
    const t = qn.subVectors(e, this.origin).dot(this.direction);
    return t < 0 ? this.origin.distanceToSquared(e) : (qn.copy(this.origin).addScaledVector(this.direction, t), qn.distanceToSquared(e));
  }
  distanceSqToSegment(e, t, n, r) {
    Sa.copy(e).add(t).multiplyScalar(0.5), is.copy(t).sub(e).normalize(), ii.copy(this.origin).sub(Sa);
    const s = e.distanceTo(t) * 0.5, a = -this.direction.dot(is), o = ii.dot(this.direction), l = -ii.dot(is), d = ii.lengthSq(), u = Math.abs(1 - a * a);
    let p, f, m, _;
    if (u > 0)
      if (p = a * l - o, f = a * o - l, _ = s * u, p >= 0)
        if (f >= -_)
          if (f <= _) {
            const x = 1 / u;
            p *= x, f *= x, m = p * (p + a * f + 2 * o) + f * (a * p + f + 2 * l) + d;
          } else
            f = s, p = Math.max(0, -(a * f + o)), m = -p * p + f * (f + 2 * l) + d;
        else
          f = -s, p = Math.max(0, -(a * f + o)), m = -p * p + f * (f + 2 * l) + d;
      else
        f <= -_ ? (p = Math.max(0, -(-a * s + o)), f = p > 0 ? -s : Math.min(Math.max(-s, -l), s), m = -p * p + f * (f + 2 * l) + d) : f <= _ ? (p = 0, f = Math.min(Math.max(-s, -l), s), m = f * (f + 2 * l) + d) : (p = Math.max(0, -(a * s + o)), f = p > 0 ? s : Math.min(Math.max(-s, -l), s), m = -p * p + f * (f + 2 * l) + d);
    else
      f = a > 0 ? -s : s, p = Math.max(0, -(a * f + o)), m = -p * p + f * (f + 2 * l) + d;
    return n && n.copy(this.origin).addScaledVector(this.direction, p), r && r.copy(Sa).addScaledVector(is, f), m;
  }
  intersectSphere(e, t) {
    qn.subVectors(e.center, this.origin);
    const n = qn.dot(this.direction), r = qn.dot(qn) - n * n, s = e.radius * e.radius;
    if (r > s) return null;
    const a = Math.sqrt(s - r), o = n - a, l = n + a;
    return l < 0 ? null : o < 0 ? this.at(l, t) : this.at(o, t);
  }
  intersectsSphere(e) {
    return this.distanceSqToPoint(e.center) <= e.radius * e.radius;
  }
  distanceToPlane(e) {
    const t = e.normal.dot(this.direction);
    if (t === 0)
      return e.distanceToPoint(this.origin) === 0 ? 0 : null;
    const n = -(this.origin.dot(e.normal) + e.constant) / t;
    return n >= 0 ? n : null;
  }
  intersectPlane(e, t) {
    const n = this.distanceToPlane(e);
    return n === null ? null : this.at(n, t);
  }
  intersectsPlane(e) {
    const t = e.distanceToPoint(this.origin);
    return t === 0 || e.normal.dot(this.direction) * t < 0;
  }
  intersectBox(e, t) {
    let n, r, s, a, o, l;
    const d = 1 / this.direction.x, u = 1 / this.direction.y, p = 1 / this.direction.z, f = this.origin;
    return d >= 0 ? (n = (e.min.x - f.x) * d, r = (e.max.x - f.x) * d) : (n = (e.max.x - f.x) * d, r = (e.min.x - f.x) * d), u >= 0 ? (s = (e.min.y - f.y) * u, a = (e.max.y - f.y) * u) : (s = (e.max.y - f.y) * u, a = (e.min.y - f.y) * u), n > a || s > r || ((s > n || isNaN(n)) && (n = s), (a < r || isNaN(r)) && (r = a), p >= 0 ? (o = (e.min.z - f.z) * p, l = (e.max.z - f.z) * p) : (o = (e.max.z - f.z) * p, l = (e.min.z - f.z) * p), n > l || o > r) || ((o > n || n !== n) && (n = o), (l < r || r !== r) && (r = l), r < 0) ? null : this.at(n >= 0 ? n : r, t);
  }
  intersectsBox(e) {
    return this.intersectBox(e, qn) !== null;
  }
  intersectTriangle(e, t, n, r, s) {
    Ma.subVectors(t, e), rs.subVectors(n, e), Ea.crossVectors(Ma, rs);
    let a = this.direction.dot(Ea), o;
    if (a > 0) {
      if (r) return null;
      o = 1;
    } else if (a < 0)
      o = -1, a = -a;
    else
      return null;
    ii.subVectors(this.origin, e);
    const l = o * this.direction.dot(rs.crossVectors(ii, rs));
    if (l < 0)
      return null;
    const d = o * this.direction.dot(Ma.cross(ii));
    if (d < 0 || l + d > a)
      return null;
    const u = -o * ii.dot(Ea);
    return u < 0 ? null : this.at(u / a, s);
  }
  applyMatrix4(e) {
    return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this;
  }
  equals(e) {
    return e.origin.equals(this.origin) && e.direction.equals(this.direction);
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class yt {
  constructor(e, t, n, r, s, a, o, l, d, u, p, f, m, _, x, c) {
    yt.prototype.isMatrix4 = !0, this.elements = [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ], e !== void 0 && this.set(e, t, n, r, s, a, o, l, d, u, p, f, m, _, x, c);
  }
  set(e, t, n, r, s, a, o, l, d, u, p, f, m, _, x, c) {
    const h = this.elements;
    return h[0] = e, h[4] = t, h[8] = n, h[12] = r, h[1] = s, h[5] = a, h[9] = o, h[13] = l, h[2] = d, h[6] = u, h[10] = p, h[14] = f, h[3] = m, h[7] = _, h[11] = x, h[15] = c, this;
  }
  identity() {
    return this.set(
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  clone() {
    return new yt().fromArray(this.elements);
  }
  copy(e) {
    const t = this.elements, n = e.elements;
    return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], t[9] = n[9], t[10] = n[10], t[11] = n[11], t[12] = n[12], t[13] = n[13], t[14] = n[14], t[15] = n[15], this;
  }
  copyPosition(e) {
    const t = this.elements, n = e.elements;
    return t[12] = n[12], t[13] = n[13], t[14] = n[14], this;
  }
  setFromMatrix3(e) {
    const t = e.elements;
    return this.set(
      t[0],
      t[3],
      t[6],
      0,
      t[1],
      t[4],
      t[7],
      0,
      t[2],
      t[5],
      t[8],
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  extractBasis(e, t, n) {
    return e.setFromMatrixColumn(this, 0), t.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this;
  }
  makeBasis(e, t, n) {
    return this.set(
      e.x,
      t.x,
      n.x,
      0,
      e.y,
      t.y,
      n.y,
      0,
      e.z,
      t.z,
      n.z,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  extractRotation(e) {
    const t = this.elements, n = e.elements, r = 1 / $i.setFromMatrixColumn(e, 0).length(), s = 1 / $i.setFromMatrixColumn(e, 1).length(), a = 1 / $i.setFromMatrixColumn(e, 2).length();
    return t[0] = n[0] * r, t[1] = n[1] * r, t[2] = n[2] * r, t[3] = 0, t[4] = n[4] * s, t[5] = n[5] * s, t[6] = n[6] * s, t[7] = 0, t[8] = n[8] * a, t[9] = n[9] * a, t[10] = n[10] * a, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  makeRotationFromEuler(e) {
    const t = this.elements, n = e.x, r = e.y, s = e.z, a = Math.cos(n), o = Math.sin(n), l = Math.cos(r), d = Math.sin(r), u = Math.cos(s), p = Math.sin(s);
    if (e.order === "XYZ") {
      const f = a * u, m = a * p, _ = o * u, x = o * p;
      t[0] = l * u, t[4] = -l * p, t[8] = d, t[1] = m + _ * d, t[5] = f - x * d, t[9] = -o * l, t[2] = x - f * d, t[6] = _ + m * d, t[10] = a * l;
    } else if (e.order === "YXZ") {
      const f = l * u, m = l * p, _ = d * u, x = d * p;
      t[0] = f + x * o, t[4] = _ * o - m, t[8] = a * d, t[1] = a * p, t[5] = a * u, t[9] = -o, t[2] = m * o - _, t[6] = x + f * o, t[10] = a * l;
    } else if (e.order === "ZXY") {
      const f = l * u, m = l * p, _ = d * u, x = d * p;
      t[0] = f - x * o, t[4] = -a * p, t[8] = _ + m * o, t[1] = m + _ * o, t[5] = a * u, t[9] = x - f * o, t[2] = -a * d, t[6] = o, t[10] = a * l;
    } else if (e.order === "ZYX") {
      const f = a * u, m = a * p, _ = o * u, x = o * p;
      t[0] = l * u, t[4] = _ * d - m, t[8] = f * d + x, t[1] = l * p, t[5] = x * d + f, t[9] = m * d - _, t[2] = -d, t[6] = o * l, t[10] = a * l;
    } else if (e.order === "YZX") {
      const f = a * l, m = a * d, _ = o * l, x = o * d;
      t[0] = l * u, t[4] = x - f * p, t[8] = _ * p + m, t[1] = p, t[5] = a * u, t[9] = -o * u, t[2] = -d * u, t[6] = m * p + _, t[10] = f - x * p;
    } else if (e.order === "XZY") {
      const f = a * l, m = a * d, _ = o * l, x = o * d;
      t[0] = l * u, t[4] = -p, t[8] = d * u, t[1] = f * p + x, t[5] = a * u, t[9] = m * p - _, t[2] = _ * p - m, t[6] = o * u, t[10] = x * p + f;
    }
    return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  makeRotationFromQuaternion(e) {
    return this.compose(yu, e, Su);
  }
  lookAt(e, t, n) {
    const r = this.elements;
    return yn.subVectors(e, t), yn.lengthSq() === 0 && (yn.z = 1), yn.normalize(), ri.crossVectors(n, yn), ri.lengthSq() === 0 && (Math.abs(n.z) === 1 ? yn.x += 1e-4 : yn.z += 1e-4, yn.normalize(), ri.crossVectors(n, yn)), ri.normalize(), ss.crossVectors(yn, ri), r[0] = ri.x, r[4] = ss.x, r[8] = yn.x, r[1] = ri.y, r[5] = ss.y, r[9] = yn.y, r[2] = ri.z, r[6] = ss.z, r[10] = yn.z, this;
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, t) {
    const n = e.elements, r = t.elements, s = this.elements, a = n[0], o = n[4], l = n[8], d = n[12], u = n[1], p = n[5], f = n[9], m = n[13], _ = n[2], x = n[6], c = n[10], h = n[14], M = n[3], y = n[7], w = n[11], I = n[15], R = r[0], C = r[4], U = r[8], A = r[12], v = r[1], L = r[5], k = r[9], V = r[13], W = r[2], Q = r[6], j = r[10], re = r[14], K = r[3], de = r[7], _e = r[11], Ee = r[15];
    return s[0] = a * R + o * v + l * W + d * K, s[4] = a * C + o * L + l * Q + d * de, s[8] = a * U + o * k + l * j + d * _e, s[12] = a * A + o * V + l * re + d * Ee, s[1] = u * R + p * v + f * W + m * K, s[5] = u * C + p * L + f * Q + m * de, s[9] = u * U + p * k + f * j + m * _e, s[13] = u * A + p * V + f * re + m * Ee, s[2] = _ * R + x * v + c * W + h * K, s[6] = _ * C + x * L + c * Q + h * de, s[10] = _ * U + x * k + c * j + h * _e, s[14] = _ * A + x * V + c * re + h * Ee, s[3] = M * R + y * v + w * W + I * K, s[7] = M * C + y * L + w * Q + I * de, s[11] = M * U + y * k + w * j + I * _e, s[15] = M * A + y * V + w * re + I * Ee, this;
  }
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this;
  }
  determinant() {
    const e = this.elements, t = e[0], n = e[4], r = e[8], s = e[12], a = e[1], o = e[5], l = e[9], d = e[13], u = e[2], p = e[6], f = e[10], m = e[14], _ = e[3], x = e[7], c = e[11], h = e[15];
    return _ * (+s * l * p - r * d * p - s * o * f + n * d * f + r * o * m - n * l * m) + x * (+t * l * m - t * d * f + s * a * f - r * a * m + r * d * u - s * l * u) + c * (+t * d * p - t * o * m - s * a * p + n * a * m + s * o * u - n * d * u) + h * (-r * o * u - t * l * p + t * o * f + r * a * p - n * a * f + n * l * u);
  }
  transpose() {
    const e = this.elements;
    let t;
    return t = e[1], e[1] = e[4], e[4] = t, t = e[2], e[2] = e[8], e[8] = t, t = e[6], e[6] = e[9], e[9] = t, t = e[3], e[3] = e[12], e[12] = t, t = e[7], e[7] = e[13], e[13] = t, t = e[11], e[11] = e[14], e[14] = t, this;
  }
  setPosition(e, t, n) {
    const r = this.elements;
    return e.isVector3 ? (r[12] = e.x, r[13] = e.y, r[14] = e.z) : (r[12] = e, r[13] = t, r[14] = n), this;
  }
  invert() {
    const e = this.elements, t = e[0], n = e[1], r = e[2], s = e[3], a = e[4], o = e[5], l = e[6], d = e[7], u = e[8], p = e[9], f = e[10], m = e[11], _ = e[12], x = e[13], c = e[14], h = e[15], M = p * c * d - x * f * d + x * l * m - o * c * m - p * l * h + o * f * h, y = _ * f * d - u * c * d - _ * l * m + a * c * m + u * l * h - a * f * h, w = u * x * d - _ * p * d + _ * o * m - a * x * m - u * o * h + a * p * h, I = _ * p * l - u * x * l - _ * o * f + a * x * f + u * o * c - a * p * c, R = t * M + n * y + r * w + s * I;
    if (R === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const C = 1 / R;
    return e[0] = M * C, e[1] = (x * f * s - p * c * s - x * r * m + n * c * m + p * r * h - n * f * h) * C, e[2] = (o * c * s - x * l * s + x * r * d - n * c * d - o * r * h + n * l * h) * C, e[3] = (p * l * s - o * f * s - p * r * d + n * f * d + o * r * m - n * l * m) * C, e[4] = y * C, e[5] = (u * c * s - _ * f * s + _ * r * m - t * c * m - u * r * h + t * f * h) * C, e[6] = (_ * l * s - a * c * s - _ * r * d + t * c * d + a * r * h - t * l * h) * C, e[7] = (a * f * s - u * l * s + u * r * d - t * f * d - a * r * m + t * l * m) * C, e[8] = w * C, e[9] = (_ * p * s - u * x * s - _ * n * m + t * x * m + u * n * h - t * p * h) * C, e[10] = (a * x * s - _ * o * s + _ * n * d - t * x * d - a * n * h + t * o * h) * C, e[11] = (u * o * s - a * p * s - u * n * d + t * p * d + a * n * m - t * o * m) * C, e[12] = I * C, e[13] = (u * x * r - _ * p * r + _ * n * f - t * x * f - u * n * c + t * p * c) * C, e[14] = (_ * o * r - a * x * r - _ * n * l + t * x * l + a * n * c - t * o * c) * C, e[15] = (a * p * r - u * o * r + u * n * l - t * p * l - a * n * f + t * o * f) * C, this;
  }
  scale(e) {
    const t = this.elements, n = e.x, r = e.y, s = e.z;
    return t[0] *= n, t[4] *= r, t[8] *= s, t[1] *= n, t[5] *= r, t[9] *= s, t[2] *= n, t[6] *= r, t[10] *= s, t[3] *= n, t[7] *= r, t[11] *= s, this;
  }
  getMaxScaleOnAxis() {
    const e = this.elements, t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2], n = e[4] * e[4] + e[5] * e[5] + e[6] * e[6], r = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
    return Math.sqrt(Math.max(t, n, r));
  }
  makeTranslation(e, t, n) {
    return e.isVector3 ? this.set(
      1,
      0,
      0,
      e.x,
      0,
      1,
      0,
      e.y,
      0,
      0,
      1,
      e.z,
      0,
      0,
      0,
      1
    ) : this.set(
      1,
      0,
      0,
      e,
      0,
      1,
      0,
      t,
      0,
      0,
      1,
      n,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationX(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      1,
      0,
      0,
      0,
      0,
      t,
      -n,
      0,
      0,
      n,
      t,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationY(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      t,
      0,
      n,
      0,
      0,
      1,
      0,
      0,
      -n,
      0,
      t,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationZ(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      t,
      -n,
      0,
      0,
      n,
      t,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationAxis(e, t) {
    const n = Math.cos(t), r = Math.sin(t), s = 1 - n, a = e.x, o = e.y, l = e.z, d = s * a, u = s * o;
    return this.set(
      d * a + n,
      d * o - r * l,
      d * l + r * o,
      0,
      d * o + r * l,
      u * o + n,
      u * l - r * a,
      0,
      d * l - r * o,
      u * l + r * a,
      s * l * l + n,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeScale(e, t, n) {
    return this.set(
      e,
      0,
      0,
      0,
      0,
      t,
      0,
      0,
      0,
      0,
      n,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeShear(e, t, n, r, s, a) {
    return this.set(
      1,
      n,
      s,
      0,
      e,
      1,
      a,
      0,
      t,
      r,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  compose(e, t, n) {
    const r = this.elements, s = t._x, a = t._y, o = t._z, l = t._w, d = s + s, u = a + a, p = o + o, f = s * d, m = s * u, _ = s * p, x = a * u, c = a * p, h = o * p, M = l * d, y = l * u, w = l * p, I = n.x, R = n.y, C = n.z;
    return r[0] = (1 - (x + h)) * I, r[1] = (m + w) * I, r[2] = (_ - y) * I, r[3] = 0, r[4] = (m - w) * R, r[5] = (1 - (f + h)) * R, r[6] = (c + M) * R, r[7] = 0, r[8] = (_ + y) * C, r[9] = (c - M) * C, r[10] = (1 - (f + x)) * C, r[11] = 0, r[12] = e.x, r[13] = e.y, r[14] = e.z, r[15] = 1, this;
  }
  decompose(e, t, n) {
    const r = this.elements;
    let s = $i.set(r[0], r[1], r[2]).length();
    const a = $i.set(r[4], r[5], r[6]).length(), o = $i.set(r[8], r[9], r[10]).length();
    this.determinant() < 0 && (s = -s), e.x = r[12], e.y = r[13], e.z = r[14], Ln.copy(this);
    const d = 1 / s, u = 1 / a, p = 1 / o;
    return Ln.elements[0] *= d, Ln.elements[1] *= d, Ln.elements[2] *= d, Ln.elements[4] *= u, Ln.elements[5] *= u, Ln.elements[6] *= u, Ln.elements[8] *= p, Ln.elements[9] *= p, Ln.elements[10] *= p, t.setFromRotationMatrix(Ln), n.x = s, n.y = a, n.z = o, this;
  }
  makePerspective(e, t, n, r, s, a, o = Jn) {
    const l = this.elements, d = 2 * s / (t - e), u = 2 * s / (n - r), p = (t + e) / (t - e), f = (n + r) / (n - r);
    let m, _;
    if (o === Jn)
      m = -(a + s) / (a - s), _ = -2 * a * s / (a - s);
    else if (o === Os)
      m = -a / (a - s), _ = -a * s / (a - s);
    else
      throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
    return l[0] = d, l[4] = 0, l[8] = p, l[12] = 0, l[1] = 0, l[5] = u, l[9] = f, l[13] = 0, l[2] = 0, l[6] = 0, l[10] = m, l[14] = _, l[3] = 0, l[7] = 0, l[11] = -1, l[15] = 0, this;
  }
  makeOrthographic(e, t, n, r, s, a, o = Jn) {
    const l = this.elements, d = 1 / (t - e), u = 1 / (n - r), p = 1 / (a - s), f = (t + e) * d, m = (n + r) * u;
    let _, x;
    if (o === Jn)
      _ = (a + s) * p, x = -2 * p;
    else if (o === Os)
      _ = s * p, x = -1 * p;
    else
      throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
    return l[0] = 2 * d, l[4] = 0, l[8] = 0, l[12] = -f, l[1] = 0, l[5] = 2 * u, l[9] = 0, l[13] = -m, l[2] = 0, l[6] = 0, l[10] = x, l[14] = -_, l[3] = 0, l[7] = 0, l[11] = 0, l[15] = 1, this;
  }
  equals(e) {
    const t = this.elements, n = e.elements;
    for (let r = 0; r < 16; r++)
      if (t[r] !== n[r]) return !1;
    return !0;
  }
  fromArray(e, t = 0) {
    for (let n = 0; n < 16; n++)
      this.elements[n] = e[n + t];
    return this;
  }
  toArray(e = [], t = 0) {
    const n = this.elements;
    return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e[t + 9] = n[9], e[t + 10] = n[10], e[t + 11] = n[11], e[t + 12] = n[12], e[t + 13] = n[13], e[t + 14] = n[14], e[t + 15] = n[15], e;
  }
}
const $i = /* @__PURE__ */ new N(), Ln = /* @__PURE__ */ new yt(), yu = /* @__PURE__ */ new N(0, 0, 0), Su = /* @__PURE__ */ new N(1, 1, 1), ri = /* @__PURE__ */ new N(), ss = /* @__PURE__ */ new N(), yn = /* @__PURE__ */ new N(), nc = /* @__PURE__ */ new yt(), ic = /* @__PURE__ */ new Yt();
class En {
  constructor(e = 0, t = 0, n = 0, r = En.DEFAULT_ORDER) {
    this.isEuler = !0, this._x = e, this._y = t, this._z = n, this._order = r;
  }
  get x() {
    return this._x;
  }
  set x(e) {
    this._x = e, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(e) {
    this._y = e, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(e) {
    this._z = e, this._onChangeCallback();
  }
  get order() {
    return this._order;
  }
  set order(e) {
    this._order = e, this._onChangeCallback();
  }
  set(e, t, n, r = this._order) {
    return this._x = e, this._y = t, this._z = n, this._order = r, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._order);
  }
  copy(e) {
    return this._x = e._x, this._y = e._y, this._z = e._z, this._order = e._order, this._onChangeCallback(), this;
  }
  setFromRotationMatrix(e, t = this._order, n = !0) {
    const r = e.elements, s = r[0], a = r[4], o = r[8], l = r[1], d = r[5], u = r[9], p = r[2], f = r[6], m = r[10];
    switch (t) {
      case "XYZ":
        this._y = Math.asin(pn(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-u, m), this._z = Math.atan2(-a, s)) : (this._x = Math.atan2(f, d), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-pn(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._y = Math.atan2(o, m), this._z = Math.atan2(l, d)) : (this._y = Math.atan2(-p, s), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(pn(f, -1, 1)), Math.abs(f) < 0.9999999 ? (this._y = Math.atan2(-p, m), this._z = Math.atan2(-a, d)) : (this._y = 0, this._z = Math.atan2(l, s));
        break;
      case "ZYX":
        this._y = Math.asin(-pn(p, -1, 1)), Math.abs(p) < 0.9999999 ? (this._x = Math.atan2(f, m), this._z = Math.atan2(l, s)) : (this._x = 0, this._z = Math.atan2(-a, d));
        break;
      case "YZX":
        this._z = Math.asin(pn(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-u, d), this._y = Math.atan2(-p, s)) : (this._x = 0, this._y = Math.atan2(o, m));
        break;
      case "XZY":
        this._z = Math.asin(-pn(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(f, d), this._y = Math.atan2(o, s)) : (this._x = Math.atan2(-u, m), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + t);
    }
    return this._order = t, n === !0 && this._onChangeCallback(), this;
  }
  setFromQuaternion(e, t, n) {
    return nc.makeRotationFromQuaternion(e), this.setFromRotationMatrix(nc, t, n);
  }
  setFromVector3(e, t = this._order) {
    return this.set(e.x, e.y, e.z, t);
  }
  reorder(e) {
    return ic.setFromEuler(this), this.setFromQuaternion(ic, e);
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order;
  }
  fromArray(e) {
    return this._x = e[0], this._y = e[1], this._z = e[2], e[3] !== void 0 && (this._order = e[3]), this._onChangeCallback(), this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._order, e;
  }
  _onChange(e) {
    return this._onChangeCallback = e, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._order;
  }
}
En.DEFAULT_ORDER = "XYZ";
class co {
  constructor() {
    this.mask = 1;
  }
  set(e) {
    this.mask = (1 << e | 0) >>> 0;
  }
  enable(e) {
    this.mask |= 1 << e | 0;
  }
  enableAll() {
    this.mask = -1;
  }
  toggle(e) {
    this.mask ^= 1 << e | 0;
  }
  disable(e) {
    this.mask &= ~(1 << e | 0);
  }
  disableAll() {
    this.mask = 0;
  }
  test(e) {
    return (this.mask & e.mask) !== 0;
  }
  isEnabled(e) {
    return (this.mask & (1 << e | 0)) !== 0;
  }
}
let Mu = 0;
const rc = /* @__PURE__ */ new N(), Zi = /* @__PURE__ */ new Yt(), jn = /* @__PURE__ */ new yt(), as = /* @__PURE__ */ new N(), Nr = /* @__PURE__ */ new N(), Eu = /* @__PURE__ */ new N(), bu = /* @__PURE__ */ new Yt(), sc = /* @__PURE__ */ new N(1, 0, 0), ac = /* @__PURE__ */ new N(0, 1, 0), oc = /* @__PURE__ */ new N(0, 0, 1), lc = { type: "added" }, Tu = { type: "removed" }, Qi = { type: "childadded", child: null }, ba = { type: "childremoved", child: null };
class Wt extends Ui {
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: Mu++ }), this.uuid = Gr(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = Wt.DEFAULT_UP.clone();
    const e = new N(), t = new En(), n = new Yt(), r = new N(1, 1, 1);
    function s() {
      n.setFromEuler(t, !1);
    }
    function a() {
      t.setFromQuaternion(n, void 0, !1);
    }
    t._onChange(s), n._onChange(a), Object.defineProperties(this, {
      position: {
        configurable: !0,
        enumerable: !0,
        value: e
      },
      rotation: {
        configurable: !0,
        enumerable: !0,
        value: t
      },
      quaternion: {
        configurable: !0,
        enumerable: !0,
        value: n
      },
      scale: {
        configurable: !0,
        enumerable: !0,
        value: r
      },
      modelViewMatrix: {
        value: new yt()
      },
      normalMatrix: {
        value: new at()
      }
    }), this.matrix = new yt(), this.matrixWorld = new yt(), this.matrixAutoUpdate = Wt.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = Wt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new co(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
  }
  onBeforeShadow() {
  }
  onAfterShadow() {
  }
  onBeforeRender() {
  }
  onAfterRender() {
  }
  applyMatrix4(e) {
    this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(e), this.matrix.decompose(this.position, this.quaternion, this.scale);
  }
  applyQuaternion(e) {
    return this.quaternion.premultiply(e), this;
  }
  setRotationFromAxisAngle(e, t) {
    this.quaternion.setFromAxisAngle(e, t);
  }
  setRotationFromEuler(e) {
    this.quaternion.setFromEuler(e, !0);
  }
  setRotationFromMatrix(e) {
    this.quaternion.setFromRotationMatrix(e);
  }
  setRotationFromQuaternion(e) {
    this.quaternion.copy(e);
  }
  rotateOnAxis(e, t) {
    return Zi.setFromAxisAngle(e, t), this.quaternion.multiply(Zi), this;
  }
  rotateOnWorldAxis(e, t) {
    return Zi.setFromAxisAngle(e, t), this.quaternion.premultiply(Zi), this;
  }
  rotateX(e) {
    return this.rotateOnAxis(sc, e);
  }
  rotateY(e) {
    return this.rotateOnAxis(ac, e);
  }
  rotateZ(e) {
    return this.rotateOnAxis(oc, e);
  }
  translateOnAxis(e, t) {
    return rc.copy(e).applyQuaternion(this.quaternion), this.position.add(rc.multiplyScalar(t)), this;
  }
  translateX(e) {
    return this.translateOnAxis(sc, e);
  }
  translateY(e) {
    return this.translateOnAxis(ac, e);
  }
  translateZ(e) {
    return this.translateOnAxis(oc, e);
  }
  localToWorld(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(jn.copy(this.matrixWorld).invert());
  }
  lookAt(e, t, n) {
    e.isVector3 ? as.copy(e) : as.set(e, t, n);
    const r = this.parent;
    this.updateWorldMatrix(!0, !1), Nr.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? jn.lookAt(Nr, as, this.up) : jn.lookAt(as, Nr, this.up), this.quaternion.setFromRotationMatrix(jn), r && (jn.extractRotation(r.matrixWorld), Zi.setFromRotationMatrix(jn), this.quaternion.premultiply(Zi.invert()));
  }
  add(e) {
    if (arguments.length > 1) {
      for (let t = 0; t < arguments.length; t++)
        this.add(arguments[t]);
      return this;
    }
    return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent(lc), Qi.child = e, this.dispatchEvent(Qi), Qi.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this);
  }
  remove(e) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++)
        this.remove(arguments[n]);
      return this;
    }
    const t = this.children.indexOf(e);
    return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(Tu), ba.child = e, this.dispatchEvent(ba), ba.child = null), this;
  }
  removeFromParent() {
    const e = this.parent;
    return e !== null && e.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(e) {
    return this.updateWorldMatrix(!0, !1), jn.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), jn.multiply(e.parent.matrixWorld)), e.applyMatrix4(jn), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent(lc), Qi.child = e, this.dispatchEvent(Qi), Qi.child = null, this;
  }
  getObjectById(e) {
    return this.getObjectByProperty("id", e);
  }
  getObjectByName(e) {
    return this.getObjectByProperty("name", e);
  }
  getObjectByProperty(e, t) {
    if (this[e] === t) return this;
    for (let n = 0, r = this.children.length; n < r; n++) {
      const a = this.children[n].getObjectByProperty(e, t);
      if (a !== void 0)
        return a;
    }
  }
  getObjectsByProperty(e, t, n = []) {
    this[e] === t && n.push(this);
    const r = this.children;
    for (let s = 0, a = r.length; s < a; s++)
      r[s].getObjectsByProperty(e, t, n);
    return n;
  }
  getWorldPosition(e) {
    return this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld);
  }
  getWorldQuaternion(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Nr, e, Eu), e;
  }
  getWorldScale(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Nr, bu, e), e;
  }
  getWorldDirection(e) {
    this.updateWorldMatrix(!0, !1);
    const t = this.matrixWorld.elements;
    return e.set(t[8], t[9], t[10]).normalize();
  }
  raycast() {
  }
  traverse(e) {
    e(this);
    const t = this.children;
    for (let n = 0, r = t.length; n < r; n++)
      t[n].traverse(e);
  }
  traverseVisible(e) {
    if (this.visible === !1) return;
    e(this);
    const t = this.children;
    for (let n = 0, r = t.length; n < r; n++)
      t[n].traverseVisible(e);
  }
  traverseAncestors(e) {
    const t = this.parent;
    t !== null && (e(t), t.traverseAncestors(e));
  }
  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
  }
  updateMatrixWorld(e) {
    this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || e) && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), this.matrixWorldNeedsUpdate = !1, e = !0);
    const t = this.children;
    for (let n = 0, r = t.length; n < r; n++) {
      const s = t[n];
      (s.matrixWorldAutoUpdate === !0 || e === !0) && s.updateMatrixWorld(e);
    }
  }
  updateWorldMatrix(e, t) {
    const n = this.parent;
    if (e === !0 && n !== null && n.matrixWorldAutoUpdate === !0 && n.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), t === !0) {
      const r = this.children;
      for (let s = 0, a = r.length; s < a; s++) {
        const o = r[s];
        o.matrixWorldAutoUpdate === !0 && o.updateWorldMatrix(!1, !0);
      }
    }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string", n = {};
    t && (e = {
      geometries: {},
      materials: {},
      textures: {},
      images: {},
      shapes: {},
      skeletons: {},
      animations: {},
      nodes: {}
    }, n.metadata = {
      version: 4.6,
      type: "Object",
      generator: "Object3D.toJSON"
    });
    const r = {};
    r.uuid = this.uuid, r.type = this.type, this.name !== "" && (r.name = this.name), this.castShadow === !0 && (r.castShadow = !0), this.receiveShadow === !0 && (r.receiveShadow = !0), this.visible === !1 && (r.visible = !1), this.frustumCulled === !1 && (r.frustumCulled = !1), this.renderOrder !== 0 && (r.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (r.userData = this.userData), r.layers = this.layers.mask, r.matrix = this.matrix.toArray(), r.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (r.matrixAutoUpdate = !1), this.isInstancedMesh && (r.type = "InstancedMesh", r.count = this.count, r.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (r.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (r.type = "BatchedMesh", r.perObjectFrustumCulled = this.perObjectFrustumCulled, r.sortObjects = this.sortObjects, r.drawRanges = this._drawRanges, r.reservedRanges = this._reservedRanges, r.visibility = this._visibility, r.active = this._active, r.bounds = this._bounds.map((o) => ({
      boxInitialized: o.boxInitialized,
      boxMin: o.box.min.toArray(),
      boxMax: o.box.max.toArray(),
      sphereInitialized: o.sphereInitialized,
      sphereRadius: o.sphere.radius,
      sphereCenter: o.sphere.center.toArray()
    })), r.maxGeometryCount = this._maxGeometryCount, r.maxVertexCount = this._maxVertexCount, r.maxIndexCount = this._maxIndexCount, r.geometryInitialized = this._geometryInitialized, r.geometryCount = this._geometryCount, r.matricesTexture = this._matricesTexture.toJSON(e), this._colorsTexture !== null && (r.colorsTexture = this._colorsTexture.toJSON(e)), this.boundingSphere !== null && (r.boundingSphere = {
      center: r.boundingSphere.center.toArray(),
      radius: r.boundingSphere.radius
    }), this.boundingBox !== null && (r.boundingBox = {
      min: r.boundingBox.min.toArray(),
      max: r.boundingBox.max.toArray()
    }));
    function s(o, l) {
      return o[l.uuid] === void 0 && (o[l.uuid] = l.toJSON(e)), l.uuid;
    }
    if (this.isScene)
      this.background && (this.background.isColor ? r.background = this.background.toJSON() : this.background.isTexture && (r.background = this.background.toJSON(e).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (r.environment = this.environment.toJSON(e).uuid);
    else if (this.isMesh || this.isLine || this.isPoints) {
      r.geometry = s(e.geometries, this.geometry);
      const o = this.geometry.parameters;
      if (o !== void 0 && o.shapes !== void 0) {
        const l = o.shapes;
        if (Array.isArray(l))
          for (let d = 0, u = l.length; d < u; d++) {
            const p = l[d];
            s(e.shapes, p);
          }
        else
          s(e.shapes, l);
      }
    }
    if (this.isSkinnedMesh && (r.bindMode = this.bindMode, r.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (s(e.skeletons, this.skeleton), r.skeleton = this.skeleton.uuid)), this.material !== void 0)
      if (Array.isArray(this.material)) {
        const o = [];
        for (let l = 0, d = this.material.length; l < d; l++)
          o.push(s(e.materials, this.material[l]));
        r.material = o;
      } else
        r.material = s(e.materials, this.material);
    if (this.children.length > 0) {
      r.children = [];
      for (let o = 0; o < this.children.length; o++)
        r.children.push(this.children[o].toJSON(e).object);
    }
    if (this.animations.length > 0) {
      r.animations = [];
      for (let o = 0; o < this.animations.length; o++) {
        const l = this.animations[o];
        r.animations.push(s(e.animations, l));
      }
    }
    if (t) {
      const o = a(e.geometries), l = a(e.materials), d = a(e.textures), u = a(e.images), p = a(e.shapes), f = a(e.skeletons), m = a(e.animations), _ = a(e.nodes);
      o.length > 0 && (n.geometries = o), l.length > 0 && (n.materials = l), d.length > 0 && (n.textures = d), u.length > 0 && (n.images = u), p.length > 0 && (n.shapes = p), f.length > 0 && (n.skeletons = f), m.length > 0 && (n.animations = m), _.length > 0 && (n.nodes = _);
    }
    return n.object = r, n;
    function a(o) {
      const l = [];
      for (const d in o) {
        const u = o[d];
        delete u.metadata, l.push(u);
      }
      return l;
    }
  }
  clone(e) {
    return new this.constructor().copy(this, e);
  }
  copy(e, t = !0) {
    if (this.name = e.name, this.up.copy(e.up), this.position.copy(e.position), this.rotation.order = e.rotation.order, this.quaternion.copy(e.quaternion), this.scale.copy(e.scale), this.matrix.copy(e.matrix), this.matrixWorld.copy(e.matrixWorld), this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate, this.layers.mask = e.layers.mask, this.visible = e.visible, this.castShadow = e.castShadow, this.receiveShadow = e.receiveShadow, this.frustumCulled = e.frustumCulled, this.renderOrder = e.renderOrder, this.animations = e.animations.slice(), this.userData = JSON.parse(JSON.stringify(e.userData)), t === !0)
      for (let n = 0; n < e.children.length; n++) {
        const r = e.children[n];
        this.add(r.clone());
      }
    return this;
  }
}
Wt.DEFAULT_UP = /* @__PURE__ */ new N(0, 1, 0);
Wt.DEFAULT_MATRIX_AUTO_UPDATE = !0;
Wt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const Nn = /* @__PURE__ */ new N(), Kn = /* @__PURE__ */ new N(), Ta = /* @__PURE__ */ new N(), $n = /* @__PURE__ */ new N(), Ji = /* @__PURE__ */ new N(), er = /* @__PURE__ */ new N(), cc = /* @__PURE__ */ new N(), Aa = /* @__PURE__ */ new N(), wa = /* @__PURE__ */ new N(), Ra = /* @__PURE__ */ new N();
class Vn {
  constructor(e = new N(), t = new N(), n = new N()) {
    this.a = e, this.b = t, this.c = n;
  }
  static getNormal(e, t, n, r) {
    r.subVectors(n, t), Nn.subVectors(e, t), r.cross(Nn);
    const s = r.lengthSq();
    return s > 0 ? r.multiplyScalar(1 / Math.sqrt(s)) : r.set(0, 0, 0);
  }
  // static/instance method to calculate barycentric coordinates
  // based on: http://www.blackpawn.com/texts/pointinpoly/default.html
  static getBarycoord(e, t, n, r, s) {
    Nn.subVectors(r, t), Kn.subVectors(n, t), Ta.subVectors(e, t);
    const a = Nn.dot(Nn), o = Nn.dot(Kn), l = Nn.dot(Ta), d = Kn.dot(Kn), u = Kn.dot(Ta), p = a * d - o * o;
    if (p === 0)
      return s.set(0, 0, 0), null;
    const f = 1 / p, m = (d * l - o * u) * f, _ = (a * u - o * l) * f;
    return s.set(1 - m - _, _, m);
  }
  static containsPoint(e, t, n, r) {
    return this.getBarycoord(e, t, n, r, $n) === null ? !1 : $n.x >= 0 && $n.y >= 0 && $n.x + $n.y <= 1;
  }
  static getInterpolation(e, t, n, r, s, a, o, l) {
    return this.getBarycoord(e, t, n, r, $n) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(s, $n.x), l.addScaledVector(a, $n.y), l.addScaledVector(o, $n.z), l);
  }
  static isFrontFacing(e, t, n, r) {
    return Nn.subVectors(n, t), Kn.subVectors(e, t), Nn.cross(Kn).dot(r) < 0;
  }
  set(e, t, n) {
    return this.a.copy(e), this.b.copy(t), this.c.copy(n), this;
  }
  setFromPointsAndIndices(e, t, n, r) {
    return this.a.copy(e[t]), this.b.copy(e[n]), this.c.copy(e[r]), this;
  }
  setFromAttributeAndIndices(e, t, n, r) {
    return this.a.fromBufferAttribute(e, t), this.b.fromBufferAttribute(e, n), this.c.fromBufferAttribute(e, r), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this;
  }
  getArea() {
    return Nn.subVectors(this.c, this.b), Kn.subVectors(this.a, this.b), Nn.cross(Kn).length() * 0.5;
  }
  getMidpoint(e) {
    return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  getNormal(e) {
    return Vn.getNormal(this.a, this.b, this.c, e);
  }
  getPlane(e) {
    return e.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(e, t) {
    return Vn.getBarycoord(e, this.a, this.b, this.c, t);
  }
  getInterpolation(e, t, n, r, s) {
    return Vn.getInterpolation(e, this.a, this.b, this.c, t, n, r, s);
  }
  containsPoint(e) {
    return Vn.containsPoint(e, this.a, this.b, this.c);
  }
  isFrontFacing(e) {
    return Vn.isFrontFacing(this.a, this.b, this.c, e);
  }
  intersectsBox(e) {
    return e.intersectsTriangle(this);
  }
  closestPointToPoint(e, t) {
    const n = this.a, r = this.b, s = this.c;
    let a, o;
    Ji.subVectors(r, n), er.subVectors(s, n), Aa.subVectors(e, n);
    const l = Ji.dot(Aa), d = er.dot(Aa);
    if (l <= 0 && d <= 0)
      return t.copy(n);
    wa.subVectors(e, r);
    const u = Ji.dot(wa), p = er.dot(wa);
    if (u >= 0 && p <= u)
      return t.copy(r);
    const f = l * p - u * d;
    if (f <= 0 && l >= 0 && u <= 0)
      return a = l / (l - u), t.copy(n).addScaledVector(Ji, a);
    Ra.subVectors(e, s);
    const m = Ji.dot(Ra), _ = er.dot(Ra);
    if (_ >= 0 && m <= _)
      return t.copy(s);
    const x = m * d - l * _;
    if (x <= 0 && d >= 0 && _ <= 0)
      return o = d / (d - _), t.copy(n).addScaledVector(er, o);
    const c = u * _ - m * p;
    if (c <= 0 && p - u >= 0 && m - _ >= 0)
      return cc.subVectors(s, r), o = (p - u) / (p - u + (m - _)), t.copy(r).addScaledVector(cc, o);
    const h = 1 / (c + x + f);
    return a = x * h, o = f * h, t.copy(n).addScaledVector(Ji, a).addScaledVector(er, o);
  }
  equals(e) {
    return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
  }
}
const yd = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
}, si = { h: 0, s: 0, l: 0 }, os = { h: 0, s: 0, l: 0 };
function Ca(i, e, t) {
  return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? i + (e - i) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? i + (e - i) * 6 * (2 / 3 - t) : i;
}
class ut {
  constructor(e, t, n) {
    return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(e, t, n);
  }
  set(e, t, n) {
    if (t === void 0 && n === void 0) {
      const r = e;
      r && r.isColor ? this.copy(r) : typeof r == "number" ? this.setHex(r) : typeof r == "string" && this.setStyle(r);
    } else
      this.setRGB(e, t, n);
    return this;
  }
  setScalar(e) {
    return this.r = e, this.g = e, this.b = e, this;
  }
  setHex(e, t = Bn) {
    return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, _t.toWorkingColorSpace(this, t), this;
  }
  setRGB(e, t, n, r = _t.workingColorSpace) {
    return this.r = e, this.g = t, this.b = n, _t.toWorkingColorSpace(this, r), this;
  }
  setHSL(e, t, n, r = _t.workingColorSpace) {
    if (e = cu(e, 1), t = pn(t, 0, 1), n = pn(n, 0, 1), t === 0)
      this.r = this.g = this.b = n;
    else {
      const s = n <= 0.5 ? n * (1 + t) : n + t - n * t, a = 2 * n - s;
      this.r = Ca(a, s, e + 1 / 3), this.g = Ca(a, s, e), this.b = Ca(a, s, e - 1 / 3);
    }
    return _t.toWorkingColorSpace(this, r), this;
  }
  setStyle(e, t = Bn) {
    function n(s) {
      s !== void 0 && parseFloat(s) < 1 && console.warn("THREE.Color: Alpha component of " + e + " will be ignored.");
    }
    let r;
    if (r = /^(\w+)\(([^\)]*)\)/.exec(e)) {
      let s;
      const a = r[1], o = r[2];
      switch (a) {
        case "rgb":
        case "rgba":
          if (s = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return n(s[4]), this.setRGB(
              Math.min(255, parseInt(s[1], 10)) / 255,
              Math.min(255, parseInt(s[2], 10)) / 255,
              Math.min(255, parseInt(s[3], 10)) / 255,
              t
            );
          if (s = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return n(s[4]), this.setRGB(
              Math.min(100, parseInt(s[1], 10)) / 100,
              Math.min(100, parseInt(s[2], 10)) / 100,
              Math.min(100, parseInt(s[3], 10)) / 100,
              t
            );
          break;
        case "hsl":
        case "hsla":
          if (s = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return n(s[4]), this.setHSL(
              parseFloat(s[1]) / 360,
              parseFloat(s[2]) / 100,
              parseFloat(s[3]) / 100,
              t
            );
          break;
        default:
          console.warn("THREE.Color: Unknown color model " + e);
      }
    } else if (r = /^\#([A-Fa-f\d]+)$/.exec(e)) {
      const s = r[1], a = s.length;
      if (a === 3)
        return this.setRGB(
          parseInt(s.charAt(0), 16) / 15,
          parseInt(s.charAt(1), 16) / 15,
          parseInt(s.charAt(2), 16) / 15,
          t
        );
      if (a === 6)
        return this.setHex(parseInt(s, 16), t);
      console.warn("THREE.Color: Invalid hex color " + e);
    } else if (e && e.length > 0)
      return this.setColorName(e, t);
    return this;
  }
  setColorName(e, t = Bn) {
    const n = yd[e.toLowerCase()];
    return n !== void 0 ? this.setHex(n, t) : console.warn("THREE.Color: Unknown color " + e), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(e) {
    return this.r = e.r, this.g = e.g, this.b = e.b, this;
  }
  copySRGBToLinear(e) {
    return this.r = mr(e.r), this.g = mr(e.g), this.b = mr(e.b), this;
  }
  copyLinearToSRGB(e) {
    return this.r = ga(e.r), this.g = ga(e.g), this.b = ga(e.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(e = Bn) {
    return _t.fromWorkingColorSpace(sn.copy(this), e), Math.round(pn(sn.r * 255, 0, 255)) * 65536 + Math.round(pn(sn.g * 255, 0, 255)) * 256 + Math.round(pn(sn.b * 255, 0, 255));
  }
  getHexString(e = Bn) {
    return ("000000" + this.getHex(e).toString(16)).slice(-6);
  }
  getHSL(e, t = _t.workingColorSpace) {
    _t.fromWorkingColorSpace(sn.copy(this), t);
    const n = sn.r, r = sn.g, s = sn.b, a = Math.max(n, r, s), o = Math.min(n, r, s);
    let l, d;
    const u = (o + a) / 2;
    if (o === a)
      l = 0, d = 0;
    else {
      const p = a - o;
      switch (d = u <= 0.5 ? p / (a + o) : p / (2 - a - o), a) {
        case n:
          l = (r - s) / p + (r < s ? 6 : 0);
          break;
        case r:
          l = (s - n) / p + 2;
          break;
        case s:
          l = (n - r) / p + 4;
          break;
      }
      l /= 6;
    }
    return e.h = l, e.s = d, e.l = u, e;
  }
  getRGB(e, t = _t.workingColorSpace) {
    return _t.fromWorkingColorSpace(sn.copy(this), t), e.r = sn.r, e.g = sn.g, e.b = sn.b, e;
  }
  getStyle(e = Bn) {
    _t.fromWorkingColorSpace(sn.copy(this), e);
    const t = sn.r, n = sn.g, r = sn.b;
    return e !== Bn ? `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})` : `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(r * 255)})`;
  }
  offsetHSL(e, t, n) {
    return this.getHSL(si), this.setHSL(si.h + e, si.s + t, si.l + n);
  }
  add(e) {
    return this.r += e.r, this.g += e.g, this.b += e.b, this;
  }
  addColors(e, t) {
    return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this;
  }
  addScalar(e) {
    return this.r += e, this.g += e, this.b += e, this;
  }
  sub(e) {
    return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this;
  }
  multiply(e) {
    return this.r *= e.r, this.g *= e.g, this.b *= e.b, this;
  }
  multiplyScalar(e) {
    return this.r *= e, this.g *= e, this.b *= e, this;
  }
  lerp(e, t) {
    return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this;
  }
  lerpColors(e, t, n) {
    return this.r = e.r + (t.r - e.r) * n, this.g = e.g + (t.g - e.g) * n, this.b = e.b + (t.b - e.b) * n, this;
  }
  lerpHSL(e, t) {
    this.getHSL(si), e.getHSL(os);
    const n = pa(si.h, os.h, t), r = pa(si.s, os.s, t), s = pa(si.l, os.l, t);
    return this.setHSL(n, r, s), this;
  }
  setFromVector3(e) {
    return this.r = e.x, this.g = e.y, this.b = e.z, this;
  }
  applyMatrix3(e) {
    const t = this.r, n = this.g, r = this.b, s = e.elements;
    return this.r = s[0] * t + s[3] * n + s[6] * r, this.g = s[1] * t + s[4] * n + s[7] * r, this.b = s[2] * t + s[5] * n + s[8] * r, this;
  }
  equals(e) {
    return e.r === this.r && e.g === this.g && e.b === this.b;
  }
  fromArray(e, t = 0) {
    return this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e;
  }
  fromBufferAttribute(e, t) {
    return this.r = e.getX(t), this.g = e.getY(t), this.b = e.getZ(t), this;
  }
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    yield this.r, yield this.g, yield this.b;
  }
}
const sn = /* @__PURE__ */ new ut();
ut.NAMES = yd;
let Au = 0;
class Mr extends Ui {
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Au++ }), this.uuid = Gr(), this.name = "", this.type = "Material", this.blending = fr, this.side = fi, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = Ka, this.blendDst = $a, this.blendEquation = Ri, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new ut(0, 0, 0), this.blendAlpha = 0, this.depthFunc = Ls, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = Kl, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = Xi, this.stencilZFail = Xi, this.stencilZPass = Xi, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
  }
  get alphaTest() {
    return this._alphaTest;
  }
  set alphaTest(e) {
    this._alphaTest > 0 != e > 0 && this.version++, this._alphaTest = e;
  }
  onBuild() {
  }
  onBeforeRender() {
  }
  onBeforeCompile() {
  }
  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }
  setValues(e) {
    if (e !== void 0)
      for (const t in e) {
        const n = e[t];
        if (n === void 0) {
          console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);
          continue;
        }
        const r = this[t];
        if (r === void 0) {
          console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);
          continue;
        }
        r && r.isColor ? r.set(n) : r && r.isVector3 && n && n.isVector3 ? r.copy(n) : this[t] = n;
      }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    t && (e = {
      textures: {},
      images: {}
    });
    const n = {
      metadata: {
        version: 4.6,
        type: "Material",
        generator: "Material.toJSON"
      }
    };
    n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(e).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(e).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(e).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(e).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(e).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(e).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== fr && (n.blending = this.blending), this.side !== fi && (n.side = this.side), this.vertexColors === !0 && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = !0), this.blendSrc !== Ka && (n.blendSrc = this.blendSrc), this.blendDst !== $a && (n.blendDst = this.blendDst), this.blendEquation !== Ri && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== Ls && (n.depthFunc = this.depthFunc), this.depthTest === !1 && (n.depthTest = this.depthTest), this.depthWrite === !1 && (n.depthWrite = this.depthWrite), this.colorWrite === !1 && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== Kl && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== Xi && (n.stencilFail = this.stencilFail), this.stencilZFail !== Xi && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== Xi && (n.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === !0 && (n.alphaHash = !0), this.alphaToCoverage === !0 && (n.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0), this.forceSinglePass === !0 && (n.forceSinglePass = !0), this.wireframe === !0 && (n.wireframe = !0), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = !0), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
    function r(s) {
      const a = [];
      for (const o in s) {
        const l = s[o];
        delete l.metadata, a.push(l);
      }
      return a;
    }
    if (t) {
      const s = r(e.textures), a = r(e.images);
      s.length > 0 && (n.textures = s), a.length > 0 && (n.images = a);
    }
    return n;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.name = e.name, this.blending = e.blending, this.side = e.side, this.vertexColors = e.vertexColors, this.opacity = e.opacity, this.transparent = e.transparent, this.blendSrc = e.blendSrc, this.blendDst = e.blendDst, this.blendEquation = e.blendEquation, this.blendSrcAlpha = e.blendSrcAlpha, this.blendDstAlpha = e.blendDstAlpha, this.blendEquationAlpha = e.blendEquationAlpha, this.blendColor.copy(e.blendColor), this.blendAlpha = e.blendAlpha, this.depthFunc = e.depthFunc, this.depthTest = e.depthTest, this.depthWrite = e.depthWrite, this.stencilWriteMask = e.stencilWriteMask, this.stencilFunc = e.stencilFunc, this.stencilRef = e.stencilRef, this.stencilFuncMask = e.stencilFuncMask, this.stencilFail = e.stencilFail, this.stencilZFail = e.stencilZFail, this.stencilZPass = e.stencilZPass, this.stencilWrite = e.stencilWrite;
    const t = e.clippingPlanes;
    let n = null;
    if (t !== null) {
      const r = t.length;
      n = new Array(r);
      for (let s = 0; s !== r; ++s)
        n[s] = t[s].clone();
    }
    return this.clippingPlanes = n, this.clipIntersection = e.clipIntersection, this.clipShadows = e.clipShadows, this.shadowSide = e.shadowSide, this.colorWrite = e.colorWrite, this.precision = e.precision, this.polygonOffset = e.polygonOffset, this.polygonOffsetFactor = e.polygonOffsetFactor, this.polygonOffsetUnits = e.polygonOffsetUnits, this.dithering = e.dithering, this.alphaTest = e.alphaTest, this.alphaHash = e.alphaHash, this.alphaToCoverage = e.alphaToCoverage, this.premultipliedAlpha = e.premultipliedAlpha, this.forceSinglePass = e.forceSinglePass, this.visible = e.visible, this.toneMapped = e.toneMapped, this.userData = JSON.parse(JSON.stringify(e.userData)), this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
}
class Xs extends Mr {
  constructor(e) {
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new ut(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new En(), this.combine = oo, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
  }
}
const Gt = /* @__PURE__ */ new N(), ls = /* @__PURE__ */ new Xe();
class Gn {
  constructor(e, t, n = !1) {
    if (Array.isArray(e))
      throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = !0, this.name = "", this.array = e, this.itemSize = t, this.count = e !== void 0 ? e.length / t : 0, this.normalized = n, this.usage = $l, this._updateRange = { offset: 0, count: -1 }, this.updateRanges = [], this.gpuType = di, this.version = 0;
  }
  onUploadCallback() {
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  get updateRange() {
    return _d("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."), this._updateRange;
  }
  setUsage(e) {
    return this.usage = e, this;
  }
  addUpdateRange(e, t) {
    this.updateRanges.push({ start: e, count: t });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(e) {
    return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this.gpuType = e.gpuType, this;
  }
  copyAt(e, t, n) {
    e *= this.itemSize, n *= t.itemSize;
    for (let r = 0, s = this.itemSize; r < s; r++)
      this.array[e + r] = t.array[n + r];
    return this;
  }
  copyArray(e) {
    return this.array.set(e), this;
  }
  applyMatrix3(e) {
    if (this.itemSize === 2)
      for (let t = 0, n = this.count; t < n; t++)
        ls.fromBufferAttribute(this, t), ls.applyMatrix3(e), this.setXY(t, ls.x, ls.y);
    else if (this.itemSize === 3)
      for (let t = 0, n = this.count; t < n; t++)
        Gt.fromBufferAttribute(this, t), Gt.applyMatrix3(e), this.setXYZ(t, Gt.x, Gt.y, Gt.z);
    return this;
  }
  applyMatrix4(e) {
    for (let t = 0, n = this.count; t < n; t++)
      Gt.fromBufferAttribute(this, t), Gt.applyMatrix4(e), this.setXYZ(t, Gt.x, Gt.y, Gt.z);
    return this;
  }
  applyNormalMatrix(e) {
    for (let t = 0, n = this.count; t < n; t++)
      Gt.fromBufferAttribute(this, t), Gt.applyNormalMatrix(e), this.setXYZ(t, Gt.x, Gt.y, Gt.z);
    return this;
  }
  transformDirection(e) {
    for (let t = 0, n = this.count; t < n; t++)
      Gt.fromBufferAttribute(this, t), Gt.transformDirection(e), this.setXYZ(t, Gt.x, Gt.y, Gt.z);
    return this;
  }
  set(e, t = 0) {
    return this.array.set(e, t), this;
  }
  getComponent(e, t) {
    let n = this.array[e * this.itemSize + t];
    return this.normalized && (n = Cr(n, this.array)), n;
  }
  setComponent(e, t, n) {
    return this.normalized && (n = gn(n, this.array)), this.array[e * this.itemSize + t] = n, this;
  }
  getX(e) {
    let t = this.array[e * this.itemSize];
    return this.normalized && (t = Cr(t, this.array)), t;
  }
  setX(e, t) {
    return this.normalized && (t = gn(t, this.array)), this.array[e * this.itemSize] = t, this;
  }
  getY(e) {
    let t = this.array[e * this.itemSize + 1];
    return this.normalized && (t = Cr(t, this.array)), t;
  }
  setY(e, t) {
    return this.normalized && (t = gn(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
  }
  getZ(e) {
    let t = this.array[e * this.itemSize + 2];
    return this.normalized && (t = Cr(t, this.array)), t;
  }
  setZ(e, t) {
    return this.normalized && (t = gn(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
  }
  getW(e) {
    let t = this.array[e * this.itemSize + 3];
    return this.normalized && (t = Cr(t, this.array)), t;
  }
  setW(e, t) {
    return this.normalized && (t = gn(t, this.array)), this.array[e * this.itemSize + 3] = t, this;
  }
  setXY(e, t, n) {
    return e *= this.itemSize, this.normalized && (t = gn(t, this.array), n = gn(n, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this;
  }
  setXYZ(e, t, n, r) {
    return e *= this.itemSize, this.normalized && (t = gn(t, this.array), n = gn(n, this.array), r = gn(r, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = r, this;
  }
  setXYZW(e, t, n, r, s) {
    return e *= this.itemSize, this.normalized && (t = gn(t, this.array), n = gn(n, this.array), r = gn(r, this.array), s = gn(s, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = r, this.array[e + 3] = s, this;
  }
  onUpload(e) {
    return this.onUploadCallback = e, this;
  }
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  toJSON() {
    const e = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized
    };
    return this.name !== "" && (e.name = this.name), this.usage !== $l && (e.usage = this.usage), e;
  }
}
class Sd extends Gn {
  constructor(e, t, n) {
    super(new Uint16Array(e), t, n);
  }
}
class Md extends Gn {
  constructor(e, t, n) {
    super(new Uint32Array(e), t, n);
  }
}
class Et extends Gn {
  constructor(e, t, n) {
    super(new Float32Array(e), t, n);
  }
}
let wu = 0;
const Tn = /* @__PURE__ */ new yt(), Pa = /* @__PURE__ */ new Wt(), tr = /* @__PURE__ */ new N(), Sn = /* @__PURE__ */ new Wr(), Ir = /* @__PURE__ */ new Wr(), Jt = /* @__PURE__ */ new N();
class ln extends Ui {
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: wu++ }), this.uuid = Gr(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(e) {
    return Array.isArray(e) ? this.index = new (gd(e) ? Md : Sd)(e, 1) : this.index = e, this;
  }
  getAttribute(e) {
    return this.attributes[e];
  }
  setAttribute(e, t) {
    return this.attributes[e] = t, this;
  }
  deleteAttribute(e) {
    return delete this.attributes[e], this;
  }
  hasAttribute(e) {
    return this.attributes[e] !== void 0;
  }
  addGroup(e, t, n = 0) {
    this.groups.push({
      start: e,
      count: t,
      materialIndex: n
    });
  }
  clearGroups() {
    this.groups = [];
  }
  setDrawRange(e, t) {
    this.drawRange.start = e, this.drawRange.count = t;
  }
  applyMatrix4(e) {
    const t = this.attributes.position;
    t !== void 0 && (t.applyMatrix4(e), t.needsUpdate = !0);
    const n = this.attributes.normal;
    if (n !== void 0) {
      const s = new at().getNormalMatrix(e);
      n.applyNormalMatrix(s), n.needsUpdate = !0;
    }
    const r = this.attributes.tangent;
    return r !== void 0 && (r.transformDirection(e), r.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  applyQuaternion(e) {
    return Tn.makeRotationFromQuaternion(e), this.applyMatrix4(Tn), this;
  }
  rotateX(e) {
    return Tn.makeRotationX(e), this.applyMatrix4(Tn), this;
  }
  rotateY(e) {
    return Tn.makeRotationY(e), this.applyMatrix4(Tn), this;
  }
  rotateZ(e) {
    return Tn.makeRotationZ(e), this.applyMatrix4(Tn), this;
  }
  translate(e, t, n) {
    return Tn.makeTranslation(e, t, n), this.applyMatrix4(Tn), this;
  }
  scale(e, t, n) {
    return Tn.makeScale(e, t, n), this.applyMatrix4(Tn), this;
  }
  lookAt(e) {
    return Pa.lookAt(e), Pa.updateMatrix(), this.applyMatrix4(Pa.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(tr).negate(), this.translate(tr.x, tr.y, tr.z), this;
  }
  setFromPoints(e) {
    const t = [];
    for (let n = 0, r = e.length; n < r; n++) {
      const s = e[n];
      t.push(s.x, s.y, s.z || 0);
    }
    return this.setAttribute("position", new Et(t, 3)), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new Wr());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(
        new N(-1 / 0, -1 / 0, -1 / 0),
        new N(1 / 0, 1 / 0, 1 / 0)
      );
      return;
    }
    if (e !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(e), t)
        for (let n = 0, r = t.length; n < r; n++) {
          const s = t[n];
          Sn.setFromBufferAttribute(s), this.morphTargetsRelative ? (Jt.addVectors(this.boundingBox.min, Sn.min), this.boundingBox.expandByPoint(Jt), Jt.addVectors(this.boundingBox.max, Sn.max), this.boundingBox.expandByPoint(Jt)) : (this.boundingBox.expandByPoint(Sn.min), this.boundingBox.expandByPoint(Sn.max));
        }
    } else
      this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new Gs());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new N(), 1 / 0);
      return;
    }
    if (e) {
      const n = this.boundingSphere.center;
      if (Sn.setFromBufferAttribute(e), t)
        for (let s = 0, a = t.length; s < a; s++) {
          const o = t[s];
          Ir.setFromBufferAttribute(o), this.morphTargetsRelative ? (Jt.addVectors(Sn.min, Ir.min), Sn.expandByPoint(Jt), Jt.addVectors(Sn.max, Ir.max), Sn.expandByPoint(Jt)) : (Sn.expandByPoint(Ir.min), Sn.expandByPoint(Ir.max));
        }
      Sn.getCenter(n);
      let r = 0;
      for (let s = 0, a = e.count; s < a; s++)
        Jt.fromBufferAttribute(e, s), r = Math.max(r, n.distanceToSquared(Jt));
      if (t)
        for (let s = 0, a = t.length; s < a; s++) {
          const o = t[s], l = this.morphTargetsRelative;
          for (let d = 0, u = o.count; d < u; d++)
            Jt.fromBufferAttribute(o, d), l && (tr.fromBufferAttribute(e, d), Jt.add(tr)), r = Math.max(r, n.distanceToSquared(Jt));
        }
      this.boundingSphere.radius = Math.sqrt(r), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
    }
  }
  computeTangents() {
    const e = this.index, t = this.attributes;
    if (e === null || t.position === void 0 || t.normal === void 0 || t.uv === void 0) {
      console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
      return;
    }
    const n = t.position, r = t.normal, s = t.uv;
    this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new Gn(new Float32Array(4 * n.count), 4));
    const a = this.getAttribute("tangent"), o = [], l = [];
    for (let U = 0; U < n.count; U++)
      o[U] = new N(), l[U] = new N();
    const d = new N(), u = new N(), p = new N(), f = new Xe(), m = new Xe(), _ = new Xe(), x = new N(), c = new N();
    function h(U, A, v) {
      d.fromBufferAttribute(n, U), u.fromBufferAttribute(n, A), p.fromBufferAttribute(n, v), f.fromBufferAttribute(s, U), m.fromBufferAttribute(s, A), _.fromBufferAttribute(s, v), u.sub(d), p.sub(d), m.sub(f), _.sub(f);
      const L = 1 / (m.x * _.y - _.x * m.y);
      isFinite(L) && (x.copy(u).multiplyScalar(_.y).addScaledVector(p, -m.y).multiplyScalar(L), c.copy(p).multiplyScalar(m.x).addScaledVector(u, -_.x).multiplyScalar(L), o[U].add(x), o[A].add(x), o[v].add(x), l[U].add(c), l[A].add(c), l[v].add(c));
    }
    let M = this.groups;
    M.length === 0 && (M = [{
      start: 0,
      count: e.count
    }]);
    for (let U = 0, A = M.length; U < A; ++U) {
      const v = M[U], L = v.start, k = v.count;
      for (let V = L, W = L + k; V < W; V += 3)
        h(
          e.getX(V + 0),
          e.getX(V + 1),
          e.getX(V + 2)
        );
    }
    const y = new N(), w = new N(), I = new N(), R = new N();
    function C(U) {
      I.fromBufferAttribute(r, U), R.copy(I);
      const A = o[U];
      y.copy(A), y.sub(I.multiplyScalar(I.dot(A))).normalize(), w.crossVectors(R, A);
      const L = w.dot(l[U]) < 0 ? -1 : 1;
      a.setXYZW(U, y.x, y.y, y.z, L);
    }
    for (let U = 0, A = M.length; U < A; ++U) {
      const v = M[U], L = v.start, k = v.count;
      for (let V = L, W = L + k; V < W; V += 3)
        C(e.getX(V + 0)), C(e.getX(V + 1)), C(e.getX(V + 2));
    }
  }
  computeVertexNormals() {
    const e = this.index, t = this.getAttribute("position");
    if (t !== void 0) {
      let n = this.getAttribute("normal");
      if (n === void 0)
        n = new Gn(new Float32Array(t.count * 3), 3), this.setAttribute("normal", n);
      else
        for (let f = 0, m = n.count; f < m; f++)
          n.setXYZ(f, 0, 0, 0);
      const r = new N(), s = new N(), a = new N(), o = new N(), l = new N(), d = new N(), u = new N(), p = new N();
      if (e)
        for (let f = 0, m = e.count; f < m; f += 3) {
          const _ = e.getX(f + 0), x = e.getX(f + 1), c = e.getX(f + 2);
          r.fromBufferAttribute(t, _), s.fromBufferAttribute(t, x), a.fromBufferAttribute(t, c), u.subVectors(a, s), p.subVectors(r, s), u.cross(p), o.fromBufferAttribute(n, _), l.fromBufferAttribute(n, x), d.fromBufferAttribute(n, c), o.add(u), l.add(u), d.add(u), n.setXYZ(_, o.x, o.y, o.z), n.setXYZ(x, l.x, l.y, l.z), n.setXYZ(c, d.x, d.y, d.z);
        }
      else
        for (let f = 0, m = t.count; f < m; f += 3)
          r.fromBufferAttribute(t, f + 0), s.fromBufferAttribute(t, f + 1), a.fromBufferAttribute(t, f + 2), u.subVectors(a, s), p.subVectors(r, s), u.cross(p), n.setXYZ(f + 0, u.x, u.y, u.z), n.setXYZ(f + 1, u.x, u.y, u.z), n.setXYZ(f + 2, u.x, u.y, u.z);
      this.normalizeNormals(), n.needsUpdate = !0;
    }
  }
  normalizeNormals() {
    const e = this.attributes.normal;
    for (let t = 0, n = e.count; t < n; t++)
      Jt.fromBufferAttribute(e, t), Jt.normalize(), e.setXYZ(t, Jt.x, Jt.y, Jt.z);
  }
  toNonIndexed() {
    function e(o, l) {
      const d = o.array, u = o.itemSize, p = o.normalized, f = new d.constructor(l.length * u);
      let m = 0, _ = 0;
      for (let x = 0, c = l.length; x < c; x++) {
        o.isInterleavedBufferAttribute ? m = l[x] * o.data.stride + o.offset : m = l[x] * u;
        for (let h = 0; h < u; h++)
          f[_++] = d[m++];
      }
      return new Gn(f, u, p);
    }
    if (this.index === null)
      return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const t = new ln(), n = this.index.array, r = this.attributes;
    for (const o in r) {
      const l = r[o], d = e(l, n);
      t.setAttribute(o, d);
    }
    const s = this.morphAttributes;
    for (const o in s) {
      const l = [], d = s[o];
      for (let u = 0, p = d.length; u < p; u++) {
        const f = d[u], m = e(f, n);
        l.push(m);
      }
      t.morphAttributes[o] = l;
    }
    t.morphTargetsRelative = this.morphTargetsRelative;
    const a = this.groups;
    for (let o = 0, l = a.length; o < l; o++) {
      const d = a[o];
      t.addGroup(d.start, d.count, d.materialIndex);
    }
    return t;
  }
  toJSON() {
    const e = {
      metadata: {
        version: 4.6,
        type: "BufferGeometry",
        generator: "BufferGeometry.toJSON"
      }
    };
    if (e.uuid = this.uuid, e.type = this.type, this.name !== "" && (e.name = this.name), Object.keys(this.userData).length > 0 && (e.userData = this.userData), this.parameters !== void 0) {
      const l = this.parameters;
      for (const d in l)
        l[d] !== void 0 && (e[d] = l[d]);
      return e;
    }
    e.data = { attributes: {} };
    const t = this.index;
    t !== null && (e.data.index = {
      type: t.array.constructor.name,
      array: Array.prototype.slice.call(t.array)
    });
    const n = this.attributes;
    for (const l in n) {
      const d = n[l];
      e.data.attributes[l] = d.toJSON(e.data);
    }
    const r = {};
    let s = !1;
    for (const l in this.morphAttributes) {
      const d = this.morphAttributes[l], u = [];
      for (let p = 0, f = d.length; p < f; p++) {
        const m = d[p];
        u.push(m.toJSON(e.data));
      }
      u.length > 0 && (r[l] = u, s = !0);
    }
    s && (e.data.morphAttributes = r, e.data.morphTargetsRelative = this.morphTargetsRelative);
    const a = this.groups;
    a.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(a)));
    const o = this.boundingSphere;
    return o !== null && (e.data.boundingSphere = {
      center: o.center.toArray(),
      radius: o.radius
    }), e;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
    const t = {};
    this.name = e.name;
    const n = e.index;
    n !== null && this.setIndex(n.clone(t));
    const r = e.attributes;
    for (const d in r) {
      const u = r[d];
      this.setAttribute(d, u.clone(t));
    }
    const s = e.morphAttributes;
    for (const d in s) {
      const u = [], p = s[d];
      for (let f = 0, m = p.length; f < m; f++)
        u.push(p[f].clone(t));
      this.morphAttributes[d] = u;
    }
    this.morphTargetsRelative = e.morphTargetsRelative;
    const a = e.groups;
    for (let d = 0, u = a.length; d < u; d++) {
      const p = a[d];
      this.addGroup(p.start, p.count, p.materialIndex);
    }
    const o = e.boundingBox;
    o !== null && (this.boundingBox = o.clone());
    const l = e.boundingSphere;
    return l !== null && (this.boundingSphere = l.clone()), this.drawRange.start = e.drawRange.start, this.drawRange.count = e.drawRange.count, this.userData = e.userData, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
const dc = /* @__PURE__ */ new yt(), Si = /* @__PURE__ */ new Ws(), cs = /* @__PURE__ */ new Gs(), hc = /* @__PURE__ */ new N(), nr = /* @__PURE__ */ new N(), ir = /* @__PURE__ */ new N(), rr = /* @__PURE__ */ new N(), La = /* @__PURE__ */ new N(), ds = /* @__PURE__ */ new N(), hs = /* @__PURE__ */ new Xe(), us = /* @__PURE__ */ new Xe(), fs = /* @__PURE__ */ new Xe(), uc = /* @__PURE__ */ new N(), fc = /* @__PURE__ */ new N(), pc = /* @__PURE__ */ new N(), ps = /* @__PURE__ */ new N(), ms = /* @__PURE__ */ new N();
class Te extends Wt {
  constructor(e = new ln(), t = new Xs()) {
    super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = t, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), e.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = e.morphTargetInfluences.slice()), e.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary)), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  updateMorphTargets() {
    const t = this.geometry.morphAttributes, n = Object.keys(t);
    if (n.length > 0) {
      const r = t[n[0]];
      if (r !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let s = 0, a = r.length; s < a; s++) {
          const o = r[s].name || String(s);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = s;
        }
      }
    }
  }
  getVertexPosition(e, t) {
    const n = this.geometry, r = n.attributes.position, s = n.morphAttributes.position, a = n.morphTargetsRelative;
    t.fromBufferAttribute(r, e);
    const o = this.morphTargetInfluences;
    if (s && o) {
      ds.set(0, 0, 0);
      for (let l = 0, d = s.length; l < d; l++) {
        const u = o[l], p = s[l];
        u !== 0 && (La.fromBufferAttribute(p, e), a ? ds.addScaledVector(La, u) : ds.addScaledVector(La.sub(t), u));
      }
      t.add(ds);
    }
    return t;
  }
  raycast(e, t) {
    const n = this.geometry, r = this.material, s = this.matrixWorld;
    r !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), cs.copy(n.boundingSphere), cs.applyMatrix4(s), Si.copy(e.ray).recast(e.near), !(cs.containsPoint(Si.origin) === !1 && (Si.intersectSphere(cs, hc) === null || Si.origin.distanceToSquared(hc) > (e.far - e.near) ** 2)) && (dc.copy(s).invert(), Si.copy(e.ray).applyMatrix4(dc), !(n.boundingBox !== null && Si.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(e, t, Si)));
  }
  _computeIntersections(e, t, n) {
    let r;
    const s = this.geometry, a = this.material, o = s.index, l = s.attributes.position, d = s.attributes.uv, u = s.attributes.uv1, p = s.attributes.normal, f = s.groups, m = s.drawRange;
    if (o !== null)
      if (Array.isArray(a))
        for (let _ = 0, x = f.length; _ < x; _++) {
          const c = f[_], h = a[c.materialIndex], M = Math.max(c.start, m.start), y = Math.min(o.count, Math.min(c.start + c.count, m.start + m.count));
          for (let w = M, I = y; w < I; w += 3) {
            const R = o.getX(w), C = o.getX(w + 1), U = o.getX(w + 2);
            r = gs(this, h, e, n, d, u, p, R, C, U), r && (r.faceIndex = Math.floor(w / 3), r.face.materialIndex = c.materialIndex, t.push(r));
          }
        }
      else {
        const _ = Math.max(0, m.start), x = Math.min(o.count, m.start + m.count);
        for (let c = _, h = x; c < h; c += 3) {
          const M = o.getX(c), y = o.getX(c + 1), w = o.getX(c + 2);
          r = gs(this, a, e, n, d, u, p, M, y, w), r && (r.faceIndex = Math.floor(c / 3), t.push(r));
        }
      }
    else if (l !== void 0)
      if (Array.isArray(a))
        for (let _ = 0, x = f.length; _ < x; _++) {
          const c = f[_], h = a[c.materialIndex], M = Math.max(c.start, m.start), y = Math.min(l.count, Math.min(c.start + c.count, m.start + m.count));
          for (let w = M, I = y; w < I; w += 3) {
            const R = w, C = w + 1, U = w + 2;
            r = gs(this, h, e, n, d, u, p, R, C, U), r && (r.faceIndex = Math.floor(w / 3), r.face.materialIndex = c.materialIndex, t.push(r));
          }
        }
      else {
        const _ = Math.max(0, m.start), x = Math.min(l.count, m.start + m.count);
        for (let c = _, h = x; c < h; c += 3) {
          const M = c, y = c + 1, w = c + 2;
          r = gs(this, a, e, n, d, u, p, M, y, w), r && (r.faceIndex = Math.floor(c / 3), t.push(r));
        }
      }
  }
}
function Ru(i, e, t, n, r, s, a, o) {
  let l;
  if (e.side === _n ? l = n.intersectTriangle(a, s, r, !0, o) : l = n.intersectTriangle(r, s, a, e.side === fi, o), l === null) return null;
  ms.copy(o), ms.applyMatrix4(i.matrixWorld);
  const d = t.ray.origin.distanceTo(ms);
  return d < t.near || d > t.far ? null : {
    distance: d,
    point: ms.clone(),
    object: i
  };
}
function gs(i, e, t, n, r, s, a, o, l, d) {
  i.getVertexPosition(o, nr), i.getVertexPosition(l, ir), i.getVertexPosition(d, rr);
  const u = Ru(i, e, t, n, nr, ir, rr, ps);
  if (u) {
    r && (hs.fromBufferAttribute(r, o), us.fromBufferAttribute(r, l), fs.fromBufferAttribute(r, d), u.uv = Vn.getInterpolation(ps, nr, ir, rr, hs, us, fs, new Xe())), s && (hs.fromBufferAttribute(s, o), us.fromBufferAttribute(s, l), fs.fromBufferAttribute(s, d), u.uv1 = Vn.getInterpolation(ps, nr, ir, rr, hs, us, fs, new Xe())), a && (uc.fromBufferAttribute(a, o), fc.fromBufferAttribute(a, l), pc.fromBufferAttribute(a, d), u.normal = Vn.getInterpolation(ps, nr, ir, rr, uc, fc, pc, new N()), u.normal.dot(n.direction) > 0 && u.normal.multiplyScalar(-1));
    const p = {
      a: o,
      b: l,
      c: d,
      normal: new N(),
      materialIndex: 0
    };
    Vn.getNormal(nr, ir, rr, p.normal), u.face = p;
  }
  return u;
}
class kt extends ln {
  constructor(e = 1, t = 1, n = 1, r = 1, s = 1, a = 1) {
    super(), this.type = "BoxGeometry", this.parameters = {
      width: e,
      height: t,
      depth: n,
      widthSegments: r,
      heightSegments: s,
      depthSegments: a
    };
    const o = this;
    r = Math.floor(r), s = Math.floor(s), a = Math.floor(a);
    const l = [], d = [], u = [], p = [];
    let f = 0, m = 0;
    _("z", "y", "x", -1, -1, n, t, e, a, s, 0), _("z", "y", "x", 1, -1, n, t, -e, a, s, 1), _("x", "z", "y", 1, 1, e, n, t, r, a, 2), _("x", "z", "y", 1, -1, e, n, -t, r, a, 3), _("x", "y", "z", 1, -1, e, t, n, r, s, 4), _("x", "y", "z", -1, -1, e, t, -n, r, s, 5), this.setIndex(l), this.setAttribute("position", new Et(d, 3)), this.setAttribute("normal", new Et(u, 3)), this.setAttribute("uv", new Et(p, 2));
    function _(x, c, h, M, y, w, I, R, C, U, A) {
      const v = w / C, L = I / U, k = w / 2, V = I / 2, W = R / 2, Q = C + 1, j = U + 1;
      let re = 0, K = 0;
      const de = new N();
      for (let _e = 0; _e < j; _e++) {
        const Ee = _e * L - V;
        for (let Je = 0; Je < Q; Je++) {
          const lt = Je * v - k;
          de[x] = lt * M, de[c] = Ee * y, de[h] = W, d.push(de.x, de.y, de.z), de[x] = 0, de[c] = 0, de[h] = R > 0 ? 1 : -1, u.push(de.x, de.y, de.z), p.push(Je / C), p.push(1 - _e / U), re += 1;
        }
      }
      for (let _e = 0; _e < U; _e++)
        for (let Ee = 0; Ee < C; Ee++) {
          const Je = f + Ee + Q * _e, lt = f + Ee + Q * (_e + 1), J = f + (Ee + 1) + Q * (_e + 1), le = f + (Ee + 1) + Q * _e;
          l.push(Je, lt, le), l.push(lt, J, le), K += 6;
        }
      o.addGroup(m, K, A), m += K, f += re;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new kt(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments);
  }
}
function Sr(i) {
  const e = {};
  for (const t in i) {
    e[t] = {};
    for (const n in i[t]) {
      const r = i[t][n];
      r && (r.isColor || r.isMatrix3 || r.isMatrix4 || r.isVector2 || r.isVector3 || r.isVector4 || r.isTexture || r.isQuaternion) ? r.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), e[t][n] = null) : e[t][n] = r.clone() : Array.isArray(r) ? e[t][n] = r.slice() : e[t][n] = r;
    }
  }
  return e;
}
function fn(i) {
  const e = {};
  for (let t = 0; t < i.length; t++) {
    const n = Sr(i[t]);
    for (const r in n)
      e[r] = n[r];
  }
  return e;
}
function Cu(i) {
  const e = [];
  for (let t = 0; t < i.length; t++)
    e.push(i[t].clone());
  return e;
}
function Ed(i) {
  const e = i.getRenderTarget();
  return e === null ? i.outputColorSpace : e.isXRRenderTarget === !0 ? e.texture.colorSpace : _t.workingColorSpace;
}
const Pu = { clone: Sr, merge: fn };
var Lu = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, Nu = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class mi extends Mr {
  constructor(e) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = Lu, this.fragmentShader = Nu, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
      clipCullDistance: !1,
      // set to use vertex shader clipping
      multiDraw: !1
      // set to use vertex shader multi_draw / enable gl_DrawID
    }, this.defaultAttributeValues = {
      color: [1, 1, 1],
      uv: [0, 0],
      uv1: [0, 0]
    }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = Sr(e.uniforms), this.uniformsGroups = Cu(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    t.glslVersion = this.glslVersion, t.uniforms = {};
    for (const r in this.uniforms) {
      const a = this.uniforms[r].value;
      a && a.isTexture ? t.uniforms[r] = {
        type: "t",
        value: a.toJSON(e).uuid
      } : a && a.isColor ? t.uniforms[r] = {
        type: "c",
        value: a.getHex()
      } : a && a.isVector2 ? t.uniforms[r] = {
        type: "v2",
        value: a.toArray()
      } : a && a.isVector3 ? t.uniforms[r] = {
        type: "v3",
        value: a.toArray()
      } : a && a.isVector4 ? t.uniforms[r] = {
        type: "v4",
        value: a.toArray()
      } : a && a.isMatrix3 ? t.uniforms[r] = {
        type: "m3",
        value: a.toArray()
      } : a && a.isMatrix4 ? t.uniforms[r] = {
        type: "m4",
        value: a.toArray()
      } : t.uniforms[r] = {
        value: a
      };
    }
    Object.keys(this.defines).length > 0 && (t.defines = this.defines), t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader, t.lights = this.lights, t.clipping = this.clipping;
    const n = {};
    for (const r in this.extensions)
      this.extensions[r] === !0 && (n[r] = !0);
    return Object.keys(n).length > 0 && (t.extensions = n), t;
  }
}
class bd extends Wt {
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new yt(), this.projectionMatrix = new yt(), this.projectionMatrixInverse = new yt(), this.coordinateSystem = Jn;
  }
  copy(e, t) {
    return super.copy(e, t), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this.coordinateSystem = e.coordinateSystem, this;
  }
  getWorldDirection(e) {
    return super.getWorldDirection(e).negate();
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  updateWorldMatrix(e, t) {
    super.updateWorldMatrix(e, t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const ai = /* @__PURE__ */ new N(), mc = /* @__PURE__ */ new Xe(), gc = /* @__PURE__ */ new Xe();
class An extends bd {
  constructor(e = 50, t = 1, n = 0.1, r = 2e3) {
    super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = e, this.zoom = 1, this.near = n, this.far = r, this.focus = 10, this.aspect = t, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
  }
  copy(e, t) {
    return super.copy(e, t), this.fov = e.fov, this.zoom = e.zoom, this.near = e.near, this.far = e.far, this.focus = e.focus, this.aspect = e.aspect, this.view = e.view === null ? null : Object.assign({}, e.view), this.filmGauge = e.filmGauge, this.filmOffset = e.filmOffset, this;
  }
  /**
   * Sets the FOV by focal length in respect to the current .filmGauge.
   *
   * The default film gauge is 35, so that the focal length can be specified for
   * a 35mm (full frame) camera.
   *
   * Values for focal length and film gauge must have the same unit.
   */
  setFocalLength(e) {
    const t = 0.5 * this.getFilmHeight() / e;
    this.fov = to * 2 * Math.atan(t), this.updateProjectionMatrix();
  }
  /**
   * Calculates the focal length from the current .fov and .filmGauge.
   */
  getFocalLength() {
    const e = Math.tan(Rs * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / e;
  }
  getEffectiveFOV() {
    return to * 2 * Math.atan(
      Math.tan(Rs * 0.5 * this.fov) / this.zoom
    );
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  /**
   * Computes the 2D bounds of the camera's viewable rectangle at a given distance along the viewing direction.
   * Sets minTarget and maxTarget to the coordinates of the lower-left and upper-right corners of the view rectangle.
   */
  getViewBounds(e, t, n) {
    ai.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), t.set(ai.x, ai.y).multiplyScalar(-e / ai.z), ai.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(ai.x, ai.y).multiplyScalar(-e / ai.z);
  }
  /**
   * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
   * Copies the result into the target Vector2, where x is width and y is height.
   */
  getViewSize(e, t) {
    return this.getViewBounds(e, mc, gc), t.subVectors(gc, mc);
  }
  /**
   * Sets an offset in a larger frustum. This is useful for multi-window or
   * multi-monitor/multi-machine setups.
   *
   * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
   * the monitors are in grid like this
   *
   *   +---+---+---+
   *   | A | B | C |
   *   +---+---+---+
   *   | D | E | F |
   *   +---+---+---+
   *
   * then for each monitor you would call it like this
   *
   *   const w = 1920;
   *   const h = 1080;
   *   const fullWidth = w * 3;
   *   const fullHeight = h * 2;
   *
   *   --A--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
   *   --B--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
   *   --C--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
   *   --D--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
   *   --E--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
   *   --F--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
   *
   *   Note there is no reason monitors have to be the same size or in a grid.
   */
  setViewOffset(e, t, n, r, s, a) {
    this.aspect = e / t, this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = r, this.view.width = s, this.view.height = a, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const e = this.near;
    let t = e * Math.tan(Rs * 0.5 * this.fov) / this.zoom, n = 2 * t, r = this.aspect * n, s = -0.5 * r;
    const a = this.view;
    if (this.view !== null && this.view.enabled) {
      const l = a.fullWidth, d = a.fullHeight;
      s += a.offsetX * r / l, t -= a.offsetY * n / d, r *= a.width / l, n *= a.height / d;
    }
    const o = this.filmOffset;
    o !== 0 && (s += e * o / this.getFilmWidth()), this.projectionMatrix.makePerspective(s, s + r, t, t - n, e, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.fov = this.fov, t.object.zoom = this.zoom, t.object.near = this.near, t.object.far = this.far, t.object.focus = this.focus, t.object.aspect = this.aspect, this.view !== null && (t.object.view = Object.assign({}, this.view)), t.object.filmGauge = this.filmGauge, t.object.filmOffset = this.filmOffset, t;
  }
}
const sr = -90, ar = 1;
class Iu extends Wt {
  constructor(e, t, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const r = new An(sr, ar, e, t);
    r.layers = this.layers, this.add(r);
    const s = new An(sr, ar, e, t);
    s.layers = this.layers, this.add(s);
    const a = new An(sr, ar, e, t);
    a.layers = this.layers, this.add(a);
    const o = new An(sr, ar, e, t);
    o.layers = this.layers, this.add(o);
    const l = new An(sr, ar, e, t);
    l.layers = this.layers, this.add(l);
    const d = new An(sr, ar, e, t);
    d.layers = this.layers, this.add(d);
  }
  updateCoordinateSystem() {
    const e = this.coordinateSystem, t = this.children.concat(), [n, r, s, a, o, l] = t;
    for (const d of t) this.remove(d);
    if (e === Jn)
      n.up.set(0, 1, 0), n.lookAt(1, 0, 0), r.up.set(0, 1, 0), r.lookAt(-1, 0, 0), s.up.set(0, 0, -1), s.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
    else if (e === Os)
      n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), r.up.set(0, -1, 0), r.lookAt(1, 0, 0), s.up.set(0, 0, 1), s.lookAt(0, 1, 0), a.up.set(0, 0, -1), a.lookAt(0, -1, 0), o.up.set(0, -1, 0), o.lookAt(0, 0, 1), l.up.set(0, -1, 0), l.lookAt(0, 0, -1);
    else
      throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + e);
    for (const d of t)
      this.add(d), d.updateMatrixWorld();
  }
  update(e, t) {
    this.parent === null && this.updateMatrixWorld();
    const { renderTarget: n, activeMipmapLevel: r } = this;
    this.coordinateSystem !== e.coordinateSystem && (this.coordinateSystem = e.coordinateSystem, this.updateCoordinateSystem());
    const [s, a, o, l, d, u] = this.children, p = e.getRenderTarget(), f = e.getActiveCubeFace(), m = e.getActiveMipmapLevel(), _ = e.xr.enabled;
    e.xr.enabled = !1;
    const x = n.texture.generateMipmaps;
    n.texture.generateMipmaps = !1, e.setRenderTarget(n, 0, r), e.render(t, s), e.setRenderTarget(n, 1, r), e.render(t, a), e.setRenderTarget(n, 2, r), e.render(t, o), e.setRenderTarget(n, 3, r), e.render(t, l), e.setRenderTarget(n, 4, r), e.render(t, d), n.texture.generateMipmaps = x, e.setRenderTarget(n, 5, r), e.render(t, u), e.setRenderTarget(p, f, m), e.xr.enabled = _, n.texture.needsPMREMUpdate = !0;
  }
}
class Td extends vn {
  constructor(e, t, n, r, s, a, o, l, d, u) {
    e = e !== void 0 ? e : [], t = t !== void 0 ? t : gr, super(e, t, n, r, s, a, o, l, d, u), this.isCubeTexture = !0, this.flipY = !1;
  }
  get images() {
    return this.image;
  }
  set images(e) {
    this.image = e;
  }
}
class Du extends Di {
  constructor(e = 1, t = {}) {
    super(e, e, t), this.isWebGLCubeRenderTarget = !0;
    const n = { width: e, height: e, depth: 1 }, r = [n, n, n, n, n, n];
    this.texture = new Td(r, t.mapping, t.wrapS, t.wrapT, t.magFilter, t.minFilter, t.format, t.type, t.anisotropy, t.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = t.generateMipmaps !== void 0 ? t.generateMipmaps : !1, this.texture.minFilter = t.minFilter !== void 0 ? t.minFilter : In;
  }
  fromEquirectangularTexture(e, t) {
    this.texture.type = t.type, this.texture.colorSpace = t.colorSpace, this.texture.generateMipmaps = t.generateMipmaps, this.texture.minFilter = t.minFilter, this.texture.magFilter = t.magFilter;
    const n = {
      uniforms: {
        tEquirect: { value: null }
      },
      vertexShader: (
        /* glsl */
        `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`
      ),
      fragmentShader: (
        /* glsl */
        `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
      )
    }, r = new kt(5, 5, 5), s = new mi({
      name: "CubemapFromEquirect",
      uniforms: Sr(n.uniforms),
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader,
      side: _n,
      blending: hi
    });
    s.uniforms.tEquirect.value = t;
    const a = new Te(r, s), o = t.minFilter;
    return t.minFilter === Ni && (t.minFilter = In), new Iu(1, 10, this).update(e, a), t.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
  }
  clear(e, t, n, r) {
    const s = e.getRenderTarget();
    for (let a = 0; a < 6; a++)
      e.setRenderTarget(this, a), e.clear(t, n, r);
    e.setRenderTarget(s);
  }
}
const Na = /* @__PURE__ */ new N(), Uu = /* @__PURE__ */ new N(), Ou = /* @__PURE__ */ new at();
class li {
  constructor(e = new N(1, 0, 0), t = 0) {
    this.isPlane = !0, this.normal = e, this.constant = t;
  }
  set(e, t) {
    return this.normal.copy(e), this.constant = t, this;
  }
  setComponents(e, t, n, r) {
    return this.normal.set(e, t, n), this.constant = r, this;
  }
  setFromNormalAndCoplanarPoint(e, t) {
    return this.normal.copy(e), this.constant = -t.dot(this.normal), this;
  }
  setFromCoplanarPoints(e, t, n) {
    const r = Na.subVectors(n, t).cross(Uu.subVectors(e, t)).normalize();
    return this.setFromNormalAndCoplanarPoint(r, e), this;
  }
  copy(e) {
    return this.normal.copy(e.normal), this.constant = e.constant, this;
  }
  normalize() {
    const e = 1 / this.normal.length();
    return this.normal.multiplyScalar(e), this.constant *= e, this;
  }
  negate() {
    return this.constant *= -1, this.normal.negate(), this;
  }
  distanceToPoint(e) {
    return this.normal.dot(e) + this.constant;
  }
  distanceToSphere(e) {
    return this.distanceToPoint(e.center) - e.radius;
  }
  projectPoint(e, t) {
    return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e));
  }
  intersectLine(e, t) {
    const n = e.delta(Na), r = this.normal.dot(n);
    if (r === 0)
      return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
    const s = -(e.start.dot(this.normal) + this.constant) / r;
    return s < 0 || s > 1 ? null : t.copy(e.start).addScaledVector(n, s);
  }
  intersectsLine(e) {
    const t = this.distanceToPoint(e.start), n = this.distanceToPoint(e.end);
    return t < 0 && n > 0 || n < 0 && t > 0;
  }
  intersectsBox(e) {
    return e.intersectsPlane(this);
  }
  intersectsSphere(e) {
    return e.intersectsPlane(this);
  }
  coplanarPoint(e) {
    return e.copy(this.normal).multiplyScalar(-this.constant);
  }
  applyMatrix4(e, t) {
    const n = t || Ou.getNormalMatrix(e), r = this.coplanarPoint(Na).applyMatrix4(e), s = this.normal.applyMatrix3(n).normalize();
    return this.constant = -r.dot(s), this;
  }
  translate(e) {
    return this.constant -= e.dot(this.normal), this;
  }
  equals(e) {
    return e.normal.equals(this.normal) && e.constant === this.constant;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Mi = /* @__PURE__ */ new Gs(), _s = /* @__PURE__ */ new N();
class ho {
  constructor(e = new li(), t = new li(), n = new li(), r = new li(), s = new li(), a = new li()) {
    this.planes = [e, t, n, r, s, a];
  }
  set(e, t, n, r, s, a) {
    const o = this.planes;
    return o[0].copy(e), o[1].copy(t), o[2].copy(n), o[3].copy(r), o[4].copy(s), o[5].copy(a), this;
  }
  copy(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++)
      t[n].copy(e.planes[n]);
    return this;
  }
  setFromProjectionMatrix(e, t = Jn) {
    const n = this.planes, r = e.elements, s = r[0], a = r[1], o = r[2], l = r[3], d = r[4], u = r[5], p = r[6], f = r[7], m = r[8], _ = r[9], x = r[10], c = r[11], h = r[12], M = r[13], y = r[14], w = r[15];
    if (n[0].setComponents(l - s, f - d, c - m, w - h).normalize(), n[1].setComponents(l + s, f + d, c + m, w + h).normalize(), n[2].setComponents(l + a, f + u, c + _, w + M).normalize(), n[3].setComponents(l - a, f - u, c - _, w - M).normalize(), n[4].setComponents(l - o, f - p, c - x, w - y).normalize(), t === Jn)
      n[5].setComponents(l + o, f + p, c + x, w + y).normalize();
    else if (t === Os)
      n[5].setComponents(o, p, x, y).normalize();
    else
      throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
    return this;
  }
  intersectsObject(e) {
    if (e.boundingSphere !== void 0)
      e.boundingSphere === null && e.computeBoundingSphere(), Mi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
    else {
      const t = e.geometry;
      t.boundingSphere === null && t.computeBoundingSphere(), Mi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
    }
    return this.intersectsSphere(Mi);
  }
  intersectsSprite(e) {
    return Mi.center.set(0, 0, 0), Mi.radius = 0.7071067811865476, Mi.applyMatrix4(e.matrixWorld), this.intersectsSphere(Mi);
  }
  intersectsSphere(e) {
    const t = this.planes, n = e.center, r = -e.radius;
    for (let s = 0; s < 6; s++)
      if (t[s].distanceToPoint(n) < r)
        return !1;
    return !0;
  }
  intersectsBox(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++) {
      const r = t[n];
      if (_s.x = r.normal.x > 0 ? e.max.x : e.min.x, _s.y = r.normal.y > 0 ? e.max.y : e.min.y, _s.z = r.normal.z > 0 ? e.max.z : e.min.z, r.distanceToPoint(_s) < 0)
        return !1;
    }
    return !0;
  }
  containsPoint(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++)
      if (t[n].distanceToPoint(e) < 0)
        return !1;
    return !0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
function Ad() {
  let i = null, e = !1, t = null, n = null;
  function r(s, a) {
    t(s, a), n = i.requestAnimationFrame(r);
  }
  return {
    start: function() {
      e !== !0 && t !== null && (n = i.requestAnimationFrame(r), e = !0);
    },
    stop: function() {
      i.cancelAnimationFrame(n), e = !1;
    },
    setAnimationLoop: function(s) {
      t = s;
    },
    setContext: function(s) {
      i = s;
    }
  };
}
function Fu(i) {
  const e = /* @__PURE__ */ new WeakMap();
  function t(o, l) {
    const d = o.array, u = o.usage, p = d.byteLength, f = i.createBuffer();
    i.bindBuffer(l, f), i.bufferData(l, d, u), o.onUploadCallback();
    let m;
    if (d instanceof Float32Array)
      m = i.FLOAT;
    else if (d instanceof Uint16Array)
      o.isFloat16BufferAttribute ? m = i.HALF_FLOAT : m = i.UNSIGNED_SHORT;
    else if (d instanceof Int16Array)
      m = i.SHORT;
    else if (d instanceof Uint32Array)
      m = i.UNSIGNED_INT;
    else if (d instanceof Int32Array)
      m = i.INT;
    else if (d instanceof Int8Array)
      m = i.BYTE;
    else if (d instanceof Uint8Array)
      m = i.UNSIGNED_BYTE;
    else if (d instanceof Uint8ClampedArray)
      m = i.UNSIGNED_BYTE;
    else
      throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + d);
    return {
      buffer: f,
      type: m,
      bytesPerElement: d.BYTES_PER_ELEMENT,
      version: o.version,
      size: p
    };
  }
  function n(o, l, d) {
    const u = l.array, p = l._updateRange, f = l.updateRanges;
    if (i.bindBuffer(d, o), p.count === -1 && f.length === 0 && i.bufferSubData(d, 0, u), f.length !== 0) {
      for (let m = 0, _ = f.length; m < _; m++) {
        const x = f[m];
        i.bufferSubData(
          d,
          x.start * u.BYTES_PER_ELEMENT,
          u,
          x.start,
          x.count
        );
      }
      l.clearUpdateRanges();
    }
    p.count !== -1 && (i.bufferSubData(
      d,
      p.offset * u.BYTES_PER_ELEMENT,
      u,
      p.offset,
      p.count
    ), p.count = -1), l.onUploadCallback();
  }
  function r(o) {
    return o.isInterleavedBufferAttribute && (o = o.data), e.get(o);
  }
  function s(o) {
    o.isInterleavedBufferAttribute && (o = o.data);
    const l = e.get(o);
    l && (i.deleteBuffer(l.buffer), e.delete(o));
  }
  function a(o, l) {
    if (o.isGLBufferAttribute) {
      const u = e.get(o);
      (!u || u.version < o.version) && e.set(o, {
        buffer: o.buffer,
        type: o.type,
        bytesPerElement: o.elementSize,
        version: o.version
      });
      return;
    }
    o.isInterleavedBufferAttribute && (o = o.data);
    const d = e.get(o);
    if (d === void 0)
      e.set(o, t(o, l));
    else if (d.version < o.version) {
      if (d.size !== o.array.byteLength)
        throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
      n(d.buffer, o, l), d.version = o.version;
    }
  }
  return {
    get: r,
    remove: s,
    update: a
  };
}
class Xr extends ln {
  constructor(e = 1, t = 1, n = 1, r = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: e,
      height: t,
      widthSegments: n,
      heightSegments: r
    };
    const s = e / 2, a = t / 2, o = Math.floor(n), l = Math.floor(r), d = o + 1, u = l + 1, p = e / o, f = t / l, m = [], _ = [], x = [], c = [];
    for (let h = 0; h < u; h++) {
      const M = h * f - a;
      for (let y = 0; y < d; y++) {
        const w = y * p - s;
        _.push(w, -M, 0), x.push(0, 0, 1), c.push(y / o), c.push(1 - h / l);
      }
    }
    for (let h = 0; h < l; h++)
      for (let M = 0; M < o; M++) {
        const y = M + d * h, w = M + d * (h + 1), I = M + 1 + d * (h + 1), R = M + 1 + d * h;
        m.push(y, w, R), m.push(w, I, R);
      }
    this.setIndex(m), this.setAttribute("position", new Et(_, 3)), this.setAttribute("normal", new Et(x, 3)), this.setAttribute("uv", new Et(c, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new Xr(e.width, e.height, e.widthSegments, e.heightSegments);
  }
}
var Bu = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, zu = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`, ku = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, Vu = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, Hu = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, Gu = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, Wu = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`, Xu = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, Yu = `#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`, qu = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`, ju = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, Ku = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, $u = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`, Zu = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`, Qu = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`, Ju = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`, ef = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, tf = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, nf = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, rf = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, sf = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, af = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, of = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( batchId );
	vColor.xyz *= batchingColor.xyz;
#endif`, lf = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`, cf = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`, df = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`, hf = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, uf = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, ff = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, pf = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, mf = "gl_FragColor = linearToOutputTexel( gl_FragColor );", gf = `
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`, _f = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`, vf = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, xf = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`, yf = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, Sf = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`, Mf = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, Ef = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, bf = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, Tf = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, Af = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`, wf = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, Rf = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, Cf = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, Pf = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`, Lf = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`, Nf = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, If = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, Df = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, Uf = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, Of = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`, Ff = `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`, Bf = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`, zf = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`, kf = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, Vf = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, Hf = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, Gf = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, Wf = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, Xf = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, Yf = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, qf = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`, jf = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, Kf = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, $f = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, Zf = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, Qf = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, Jf = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, ep = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`, tp = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, np = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`, ip = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`, rp = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, sp = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, ap = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, op = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`, lp = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, cp = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, dp = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, hp = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, up = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, fp = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`, pp = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, mp = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, gp = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, _p = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, vp = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, xp = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, yp = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return shadow;
	}
#endif`, Sp = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`, Mp = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`, Ep = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`, bp = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, Tp = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`, Ap = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, wp = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`, Rp = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, Cp = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, Pp = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, Lp = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`, Np = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`, Ip = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`, Dp = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, Up = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, Op = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`, Fp = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const Bp = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, zp = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, kp = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Vp = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Hp = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Gp = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Wp = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`, Xp = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`, Yp = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`, qp = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`, jp = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, Kp = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, $p = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, Zp = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, Qp = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`, Jp = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, em = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, tm = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, nm = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`, im = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, rm = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`, sm = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`, am = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, om = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, lm = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`, cm = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, dm = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, hm = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, um = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`, fm = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, pm = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, mm = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, gm = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, _m = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, st = {
  alphahash_fragment: Bu,
  alphahash_pars_fragment: zu,
  alphamap_fragment: ku,
  alphamap_pars_fragment: Vu,
  alphatest_fragment: Hu,
  alphatest_pars_fragment: Gu,
  aomap_fragment: Wu,
  aomap_pars_fragment: Xu,
  batching_pars_vertex: Yu,
  batching_vertex: qu,
  begin_vertex: ju,
  beginnormal_vertex: Ku,
  bsdfs: $u,
  iridescence_fragment: Zu,
  bumpmap_pars_fragment: Qu,
  clipping_planes_fragment: Ju,
  clipping_planes_pars_fragment: ef,
  clipping_planes_pars_vertex: tf,
  clipping_planes_vertex: nf,
  color_fragment: rf,
  color_pars_fragment: sf,
  color_pars_vertex: af,
  color_vertex: of,
  common: lf,
  cube_uv_reflection_fragment: cf,
  defaultnormal_vertex: df,
  displacementmap_pars_vertex: hf,
  displacementmap_vertex: uf,
  emissivemap_fragment: ff,
  emissivemap_pars_fragment: pf,
  colorspace_fragment: mf,
  colorspace_pars_fragment: gf,
  envmap_fragment: _f,
  envmap_common_pars_fragment: vf,
  envmap_pars_fragment: xf,
  envmap_pars_vertex: yf,
  envmap_physical_pars_fragment: Lf,
  envmap_vertex: Sf,
  fog_vertex: Mf,
  fog_pars_vertex: Ef,
  fog_fragment: bf,
  fog_pars_fragment: Tf,
  gradientmap_pars_fragment: Af,
  lightmap_pars_fragment: wf,
  lights_lambert_fragment: Rf,
  lights_lambert_pars_fragment: Cf,
  lights_pars_begin: Pf,
  lights_toon_fragment: Nf,
  lights_toon_pars_fragment: If,
  lights_phong_fragment: Df,
  lights_phong_pars_fragment: Uf,
  lights_physical_fragment: Of,
  lights_physical_pars_fragment: Ff,
  lights_fragment_begin: Bf,
  lights_fragment_maps: zf,
  lights_fragment_end: kf,
  logdepthbuf_fragment: Vf,
  logdepthbuf_pars_fragment: Hf,
  logdepthbuf_pars_vertex: Gf,
  logdepthbuf_vertex: Wf,
  map_fragment: Xf,
  map_pars_fragment: Yf,
  map_particle_fragment: qf,
  map_particle_pars_fragment: jf,
  metalnessmap_fragment: Kf,
  metalnessmap_pars_fragment: $f,
  morphinstance_vertex: Zf,
  morphcolor_vertex: Qf,
  morphnormal_vertex: Jf,
  morphtarget_pars_vertex: ep,
  morphtarget_vertex: tp,
  normal_fragment_begin: np,
  normal_fragment_maps: ip,
  normal_pars_fragment: rp,
  normal_pars_vertex: sp,
  normal_vertex: ap,
  normalmap_pars_fragment: op,
  clearcoat_normal_fragment_begin: lp,
  clearcoat_normal_fragment_maps: cp,
  clearcoat_pars_fragment: dp,
  iridescence_pars_fragment: hp,
  opaque_fragment: up,
  packing: fp,
  premultiplied_alpha_fragment: pp,
  project_vertex: mp,
  dithering_fragment: gp,
  dithering_pars_fragment: _p,
  roughnessmap_fragment: vp,
  roughnessmap_pars_fragment: xp,
  shadowmap_pars_fragment: yp,
  shadowmap_pars_vertex: Sp,
  shadowmap_vertex: Mp,
  shadowmask_pars_fragment: Ep,
  skinbase_vertex: bp,
  skinning_pars_vertex: Tp,
  skinning_vertex: Ap,
  skinnormal_vertex: wp,
  specularmap_fragment: Rp,
  specularmap_pars_fragment: Cp,
  tonemapping_fragment: Pp,
  tonemapping_pars_fragment: Lp,
  transmission_fragment: Np,
  transmission_pars_fragment: Ip,
  uv_pars_fragment: Dp,
  uv_pars_vertex: Up,
  uv_vertex: Op,
  worldpos_vertex: Fp,
  background_vert: Bp,
  background_frag: zp,
  backgroundCube_vert: kp,
  backgroundCube_frag: Vp,
  cube_vert: Hp,
  cube_frag: Gp,
  depth_vert: Wp,
  depth_frag: Xp,
  distanceRGBA_vert: Yp,
  distanceRGBA_frag: qp,
  equirect_vert: jp,
  equirect_frag: Kp,
  linedashed_vert: $p,
  linedashed_frag: Zp,
  meshbasic_vert: Qp,
  meshbasic_frag: Jp,
  meshlambert_vert: em,
  meshlambert_frag: tm,
  meshmatcap_vert: nm,
  meshmatcap_frag: im,
  meshnormal_vert: rm,
  meshnormal_frag: sm,
  meshphong_vert: am,
  meshphong_frag: om,
  meshphysical_vert: lm,
  meshphysical_frag: cm,
  meshtoon_vert: dm,
  meshtoon_frag: hm,
  points_vert: um,
  points_frag: fm,
  shadow_vert: pm,
  shadow_frag: mm,
  sprite_vert: gm,
  sprite_frag: _m
}, Se = {
  common: {
    diffuse: { value: /* @__PURE__ */ new ut(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new at() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new at() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new at() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new at() },
    flipEnvMap: { value: -1 },
    reflectivity: { value: 1 },
    // basic, lambert, phong
    ior: { value: 1.5 },
    // physical
    refractionRatio: { value: 0.98 }
    // basic, lambert, phong
  },
  aomap: {
    aoMap: { value: null },
    aoMapIntensity: { value: 1 },
    aoMapTransform: { value: /* @__PURE__ */ new at() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new at() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new at() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new at() },
    normalScale: { value: /* @__PURE__ */ new Xe(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new at() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new at() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new at() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new at() }
  },
  gradientmap: {
    gradientMap: { value: null }
  },
  fog: {
    fogDensity: { value: 25e-5 },
    fogNear: { value: 1 },
    fogFar: { value: 2e3 },
    fogColor: { value: /* @__PURE__ */ new ut(16777215) }
  },
  lights: {
    ambientLightColor: { value: [] },
    lightProbe: { value: [] },
    directionalLights: { value: [], properties: {
      direction: {},
      color: {}
    } },
    directionalLightShadows: { value: [], properties: {
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {}
    } },
    directionalShadowMap: { value: [] },
    directionalShadowMatrix: { value: [] },
    spotLights: { value: [], properties: {
      color: {},
      position: {},
      direction: {},
      distance: {},
      coneCos: {},
      penumbraCos: {},
      decay: {}
    } },
    spotLightShadows: { value: [], properties: {
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {}
    } },
    spotLightMap: { value: [] },
    spotShadowMap: { value: [] },
    spotLightMatrix: { value: [] },
    pointLights: { value: [], properties: {
      color: {},
      position: {},
      decay: {},
      distance: {}
    } },
    pointLightShadows: { value: [], properties: {
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {},
      shadowCameraNear: {},
      shadowCameraFar: {}
    } },
    pointShadowMap: { value: [] },
    pointShadowMatrix: { value: [] },
    hemisphereLights: { value: [], properties: {
      direction: {},
      skyColor: {},
      groundColor: {}
    } },
    // TODO (abelnation): RectAreaLight BRDF data needs to be moved from example to main src
    rectAreaLights: { value: [], properties: {
      color: {},
      position: {},
      width: {},
      height: {}
    } },
    ltc_1: { value: null },
    ltc_2: { value: null }
  },
  points: {
    diffuse: { value: /* @__PURE__ */ new ut(16777215) },
    opacity: { value: 1 },
    size: { value: 1 },
    scale: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new at() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new at() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new ut(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new Xe(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new at() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new at() },
    alphaTest: { value: 0 }
  }
}, zn = {
  basic: {
    uniforms: /* @__PURE__ */ fn([
      Se.common,
      Se.specularmap,
      Se.envmap,
      Se.aomap,
      Se.lightmap,
      Se.fog
    ]),
    vertexShader: st.meshbasic_vert,
    fragmentShader: st.meshbasic_frag
  },
  lambert: {
    uniforms: /* @__PURE__ */ fn([
      Se.common,
      Se.specularmap,
      Se.envmap,
      Se.aomap,
      Se.lightmap,
      Se.emissivemap,
      Se.bumpmap,
      Se.normalmap,
      Se.displacementmap,
      Se.fog,
      Se.lights,
      {
        emissive: { value: /* @__PURE__ */ new ut(0) }
      }
    ]),
    vertexShader: st.meshlambert_vert,
    fragmentShader: st.meshlambert_frag
  },
  phong: {
    uniforms: /* @__PURE__ */ fn([
      Se.common,
      Se.specularmap,
      Se.envmap,
      Se.aomap,
      Se.lightmap,
      Se.emissivemap,
      Se.bumpmap,
      Se.normalmap,
      Se.displacementmap,
      Se.fog,
      Se.lights,
      {
        emissive: { value: /* @__PURE__ */ new ut(0) },
        specular: { value: /* @__PURE__ */ new ut(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: st.meshphong_vert,
    fragmentShader: st.meshphong_frag
  },
  standard: {
    uniforms: /* @__PURE__ */ fn([
      Se.common,
      Se.envmap,
      Se.aomap,
      Se.lightmap,
      Se.emissivemap,
      Se.bumpmap,
      Se.normalmap,
      Se.displacementmap,
      Se.roughnessmap,
      Se.metalnessmap,
      Se.fog,
      Se.lights,
      {
        emissive: { value: /* @__PURE__ */ new ut(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: st.meshphysical_vert,
    fragmentShader: st.meshphysical_frag
  },
  toon: {
    uniforms: /* @__PURE__ */ fn([
      Se.common,
      Se.aomap,
      Se.lightmap,
      Se.emissivemap,
      Se.bumpmap,
      Se.normalmap,
      Se.displacementmap,
      Se.gradientmap,
      Se.fog,
      Se.lights,
      {
        emissive: { value: /* @__PURE__ */ new ut(0) }
      }
    ]),
    vertexShader: st.meshtoon_vert,
    fragmentShader: st.meshtoon_frag
  },
  matcap: {
    uniforms: /* @__PURE__ */ fn([
      Se.common,
      Se.bumpmap,
      Se.normalmap,
      Se.displacementmap,
      Se.fog,
      {
        matcap: { value: null }
      }
    ]),
    vertexShader: st.meshmatcap_vert,
    fragmentShader: st.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ fn([
      Se.points,
      Se.fog
    ]),
    vertexShader: st.points_vert,
    fragmentShader: st.points_frag
  },
  dashed: {
    uniforms: /* @__PURE__ */ fn([
      Se.common,
      Se.fog,
      {
        scale: { value: 1 },
        dashSize: { value: 1 },
        totalSize: { value: 2 }
      }
    ]),
    vertexShader: st.linedashed_vert,
    fragmentShader: st.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ fn([
      Se.common,
      Se.displacementmap
    ]),
    vertexShader: st.depth_vert,
    fragmentShader: st.depth_frag
  },
  normal: {
    uniforms: /* @__PURE__ */ fn([
      Se.common,
      Se.bumpmap,
      Se.normalmap,
      Se.displacementmap,
      {
        opacity: { value: 1 }
      }
    ]),
    vertexShader: st.meshnormal_vert,
    fragmentShader: st.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ fn([
      Se.sprite,
      Se.fog
    ]),
    vertexShader: st.sprite_vert,
    fragmentShader: st.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new at() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: st.background_vert,
    fragmentShader: st.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new at() }
    },
    vertexShader: st.backgroundCube_vert,
    fragmentShader: st.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: st.cube_vert,
    fragmentShader: st.cube_frag
  },
  equirect: {
    uniforms: {
      tEquirect: { value: null }
    },
    vertexShader: st.equirect_vert,
    fragmentShader: st.equirect_frag
  },
  distanceRGBA: {
    uniforms: /* @__PURE__ */ fn([
      Se.common,
      Se.displacementmap,
      {
        referencePosition: { value: /* @__PURE__ */ new N() },
        nearDistance: { value: 1 },
        farDistance: { value: 1e3 }
      }
    ]),
    vertexShader: st.distanceRGBA_vert,
    fragmentShader: st.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ fn([
      Se.lights,
      Se.fog,
      {
        color: { value: /* @__PURE__ */ new ut(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: st.shadow_vert,
    fragmentShader: st.shadow_frag
  }
};
zn.physical = {
  uniforms: /* @__PURE__ */ fn([
    zn.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: /* @__PURE__ */ new at() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: /* @__PURE__ */ new at() },
      clearcoatNormalScale: { value: /* @__PURE__ */ new Xe(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new at() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: /* @__PURE__ */ new at() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new at() },
      sheen: { value: 0 },
      sheenColor: { value: /* @__PURE__ */ new ut(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: /* @__PURE__ */ new at() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: /* @__PURE__ */ new at() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: /* @__PURE__ */ new at() },
      transmissionSamplerSize: { value: /* @__PURE__ */ new Xe() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: /* @__PURE__ */ new at() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: /* @__PURE__ */ new ut(0) },
      specularColor: { value: /* @__PURE__ */ new ut(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: /* @__PURE__ */ new at() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: /* @__PURE__ */ new at() },
      anisotropyVector: { value: /* @__PURE__ */ new Xe() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: /* @__PURE__ */ new at() }
    }
  ]),
  vertexShader: st.meshphysical_vert,
  fragmentShader: st.meshphysical_frag
};
const vs = { r: 0, b: 0, g: 0 }, Ei = /* @__PURE__ */ new En(), vm = /* @__PURE__ */ new yt();
function xm(i, e, t, n, r, s, a) {
  const o = new ut(0);
  let l = s === !0 ? 0 : 1, d, u, p = null, f = 0, m = null;
  function _(M) {
    let y = M.isScene === !0 ? M.background : null;
    return y && y.isTexture && (y = (M.backgroundBlurriness > 0 ? t : e).get(y)), y;
  }
  function x(M) {
    let y = !1;
    const w = _(M);
    w === null ? h(o, l) : w && w.isColor && (h(w, 1), y = !0);
    const I = i.xr.getEnvironmentBlendMode();
    I === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, a) : I === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a), (i.autoClear || y) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil));
  }
  function c(M, y) {
    const w = _(y);
    w && (w.isCubeTexture || w.mapping === ks) ? (u === void 0 && (u = new Te(
      new kt(1, 1, 1),
      new mi({
        name: "BackgroundCubeMaterial",
        uniforms: Sr(zn.backgroundCube.uniforms),
        vertexShader: zn.backgroundCube.vertexShader,
        fragmentShader: zn.backgroundCube.fragmentShader,
        side: _n,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), u.geometry.deleteAttribute("normal"), u.geometry.deleteAttribute("uv"), u.onBeforeRender = function(I, R, C) {
      this.matrixWorld.copyPosition(C.matrixWorld);
    }, Object.defineProperty(u.material, "envMap", {
      get: function() {
        return this.uniforms.envMap.value;
      }
    }), r.update(u)), Ei.copy(y.backgroundRotation), Ei.x *= -1, Ei.y *= -1, Ei.z *= -1, w.isCubeTexture && w.isRenderTargetTexture === !1 && (Ei.y *= -1, Ei.z *= -1), u.material.uniforms.envMap.value = w, u.material.uniforms.flipEnvMap.value = w.isCubeTexture && w.isRenderTargetTexture === !1 ? -1 : 1, u.material.uniforms.backgroundBlurriness.value = y.backgroundBlurriness, u.material.uniforms.backgroundIntensity.value = y.backgroundIntensity, u.material.uniforms.backgroundRotation.value.setFromMatrix4(vm.makeRotationFromEuler(Ei)), u.material.toneMapped = _t.getTransfer(w.colorSpace) !== Pt, (p !== w || f !== w.version || m !== i.toneMapping) && (u.material.needsUpdate = !0, p = w, f = w.version, m = i.toneMapping), u.layers.enableAll(), M.unshift(u, u.geometry, u.material, 0, 0, null)) : w && w.isTexture && (d === void 0 && (d = new Te(
      new Xr(2, 2),
      new mi({
        name: "BackgroundMaterial",
        uniforms: Sr(zn.background.uniforms),
        vertexShader: zn.background.vertexShader,
        fragmentShader: zn.background.fragmentShader,
        side: fi,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), d.geometry.deleteAttribute("normal"), Object.defineProperty(d.material, "map", {
      get: function() {
        return this.uniforms.t2D.value;
      }
    }), r.update(d)), d.material.uniforms.t2D.value = w, d.material.uniforms.backgroundIntensity.value = y.backgroundIntensity, d.material.toneMapped = _t.getTransfer(w.colorSpace) !== Pt, w.matrixAutoUpdate === !0 && w.updateMatrix(), d.material.uniforms.uvTransform.value.copy(w.matrix), (p !== w || f !== w.version || m !== i.toneMapping) && (d.material.needsUpdate = !0, p = w, f = w.version, m = i.toneMapping), d.layers.enableAll(), M.unshift(d, d.geometry, d.material, 0, 0, null));
  }
  function h(M, y) {
    M.getRGB(vs, Ed(i)), n.buffers.color.setClear(vs.r, vs.g, vs.b, y, a);
  }
  return {
    getClearColor: function() {
      return o;
    },
    setClearColor: function(M, y = 1) {
      o.set(M), l = y, h(o, l);
    },
    getClearAlpha: function() {
      return l;
    },
    setClearAlpha: function(M) {
      l = M, h(o, l);
    },
    render: x,
    addToRenderList: c
  };
}
function ym(i, e) {
  const t = i.getParameter(i.MAX_VERTEX_ATTRIBS), n = {}, r = f(null);
  let s = r, a = !1;
  function o(v, L, k, V, W) {
    let Q = !1;
    const j = p(V, k, L);
    s !== j && (s = j, d(s.object)), Q = m(v, V, k, W), Q && _(v, V, k, W), W !== null && e.update(W, i.ELEMENT_ARRAY_BUFFER), (Q || a) && (a = !1, w(v, L, k, V), W !== null && i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, e.get(W).buffer));
  }
  function l() {
    return i.createVertexArray();
  }
  function d(v) {
    return i.bindVertexArray(v);
  }
  function u(v) {
    return i.deleteVertexArray(v);
  }
  function p(v, L, k) {
    const V = k.wireframe === !0;
    let W = n[v.id];
    W === void 0 && (W = {}, n[v.id] = W);
    let Q = W[L.id];
    Q === void 0 && (Q = {}, W[L.id] = Q);
    let j = Q[V];
    return j === void 0 && (j = f(l()), Q[V] = j), j;
  }
  function f(v) {
    const L = [], k = [], V = [];
    for (let W = 0; W < t; W++)
      L[W] = 0, k[W] = 0, V[W] = 0;
    return {
      // for backward compatibility on non-VAO support browser
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: L,
      enabledAttributes: k,
      attributeDivisors: V,
      object: v,
      attributes: {},
      index: null
    };
  }
  function m(v, L, k, V) {
    const W = s.attributes, Q = L.attributes;
    let j = 0;
    const re = k.getAttributes();
    for (const K in re)
      if (re[K].location >= 0) {
        const _e = W[K];
        let Ee = Q[K];
        if (Ee === void 0 && (K === "instanceMatrix" && v.instanceMatrix && (Ee = v.instanceMatrix), K === "instanceColor" && v.instanceColor && (Ee = v.instanceColor)), _e === void 0 || _e.attribute !== Ee || Ee && _e.data !== Ee.data) return !0;
        j++;
      }
    return s.attributesNum !== j || s.index !== V;
  }
  function _(v, L, k, V) {
    const W = {}, Q = L.attributes;
    let j = 0;
    const re = k.getAttributes();
    for (const K in re)
      if (re[K].location >= 0) {
        let _e = Q[K];
        _e === void 0 && (K === "instanceMatrix" && v.instanceMatrix && (_e = v.instanceMatrix), K === "instanceColor" && v.instanceColor && (_e = v.instanceColor));
        const Ee = {};
        Ee.attribute = _e, _e && _e.data && (Ee.data = _e.data), W[K] = Ee, j++;
      }
    s.attributes = W, s.attributesNum = j, s.index = V;
  }
  function x() {
    const v = s.newAttributes;
    for (let L = 0, k = v.length; L < k; L++)
      v[L] = 0;
  }
  function c(v) {
    h(v, 0);
  }
  function h(v, L) {
    const k = s.newAttributes, V = s.enabledAttributes, W = s.attributeDivisors;
    k[v] = 1, V[v] === 0 && (i.enableVertexAttribArray(v), V[v] = 1), W[v] !== L && (i.vertexAttribDivisor(v, L), W[v] = L);
  }
  function M() {
    const v = s.newAttributes, L = s.enabledAttributes;
    for (let k = 0, V = L.length; k < V; k++)
      L[k] !== v[k] && (i.disableVertexAttribArray(k), L[k] = 0);
  }
  function y(v, L, k, V, W, Q, j) {
    j === !0 ? i.vertexAttribIPointer(v, L, k, W, Q) : i.vertexAttribPointer(v, L, k, V, W, Q);
  }
  function w(v, L, k, V) {
    x();
    const W = V.attributes, Q = k.getAttributes(), j = L.defaultAttributeValues;
    for (const re in Q) {
      const K = Q[re];
      if (K.location >= 0) {
        let de = W[re];
        if (de === void 0 && (re === "instanceMatrix" && v.instanceMatrix && (de = v.instanceMatrix), re === "instanceColor" && v.instanceColor && (de = v.instanceColor)), de !== void 0) {
          const _e = de.normalized, Ee = de.itemSize, Je = e.get(de);
          if (Je === void 0) continue;
          const lt = Je.buffer, J = Je.type, le = Je.bytesPerElement, be = J === i.INT || J === i.UNSIGNED_INT || de.gpuType === ld;
          if (de.isInterleavedBufferAttribute) {
            const ue = de.data, $e = ue.stride, Fe = de.offset;
            if (ue.isInstancedInterleavedBuffer) {
              for (let et = 0; et < K.locationSize; et++)
                h(K.location + et, ue.meshPerAttribute);
              v.isInstancedMesh !== !0 && V._maxInstanceCount === void 0 && (V._maxInstanceCount = ue.meshPerAttribute * ue.count);
            } else
              for (let et = 0; et < K.locationSize; et++)
                c(K.location + et);
            i.bindBuffer(i.ARRAY_BUFFER, lt);
            for (let et = 0; et < K.locationSize; et++)
              y(
                K.location + et,
                Ee / K.locationSize,
                J,
                _e,
                $e * le,
                (Fe + Ee / K.locationSize * et) * le,
                be
              );
          } else {
            if (de.isInstancedBufferAttribute) {
              for (let ue = 0; ue < K.locationSize; ue++)
                h(K.location + ue, de.meshPerAttribute);
              v.isInstancedMesh !== !0 && V._maxInstanceCount === void 0 && (V._maxInstanceCount = de.meshPerAttribute * de.count);
            } else
              for (let ue = 0; ue < K.locationSize; ue++)
                c(K.location + ue);
            i.bindBuffer(i.ARRAY_BUFFER, lt);
            for (let ue = 0; ue < K.locationSize; ue++)
              y(
                K.location + ue,
                Ee / K.locationSize,
                J,
                _e,
                Ee * le,
                Ee / K.locationSize * ue * le,
                be
              );
          }
        } else if (j !== void 0) {
          const _e = j[re];
          if (_e !== void 0)
            switch (_e.length) {
              case 2:
                i.vertexAttrib2fv(K.location, _e);
                break;
              case 3:
                i.vertexAttrib3fv(K.location, _e);
                break;
              case 4:
                i.vertexAttrib4fv(K.location, _e);
                break;
              default:
                i.vertexAttrib1fv(K.location, _e);
            }
        }
      }
    }
    M();
  }
  function I() {
    U();
    for (const v in n) {
      const L = n[v];
      for (const k in L) {
        const V = L[k];
        for (const W in V)
          u(V[W].object), delete V[W];
        delete L[k];
      }
      delete n[v];
    }
  }
  function R(v) {
    if (n[v.id] === void 0) return;
    const L = n[v.id];
    for (const k in L) {
      const V = L[k];
      for (const W in V)
        u(V[W].object), delete V[W];
      delete L[k];
    }
    delete n[v.id];
  }
  function C(v) {
    for (const L in n) {
      const k = n[L];
      if (k[v.id] === void 0) continue;
      const V = k[v.id];
      for (const W in V)
        u(V[W].object), delete V[W];
      delete k[v.id];
    }
  }
  function U() {
    A(), a = !0, s !== r && (s = r, d(s.object));
  }
  function A() {
    r.geometry = null, r.program = null, r.wireframe = !1;
  }
  return {
    setup: o,
    reset: U,
    resetDefaultState: A,
    dispose: I,
    releaseStatesOfGeometry: R,
    releaseStatesOfProgram: C,
    initAttributes: x,
    enableAttribute: c,
    disableUnusedAttributes: M
  };
}
function Sm(i, e, t) {
  let n;
  function r(d) {
    n = d;
  }
  function s(d, u) {
    i.drawArrays(n, d, u), t.update(u, n, 1);
  }
  function a(d, u, p) {
    p !== 0 && (i.drawArraysInstanced(n, d, u, p), t.update(u, n, p));
  }
  function o(d, u, p) {
    if (p === 0) return;
    const f = e.get("WEBGL_multi_draw");
    if (f === null)
      for (let m = 0; m < p; m++)
        this.render(d[m], u[m]);
    else {
      f.multiDrawArraysWEBGL(n, d, 0, u, 0, p);
      let m = 0;
      for (let _ = 0; _ < p; _++)
        m += u[_];
      t.update(m, n, 1);
    }
  }
  function l(d, u, p, f) {
    if (p === 0) return;
    const m = e.get("WEBGL_multi_draw");
    if (m === null)
      for (let _ = 0; _ < d.length; _++)
        a(d[_], u[_], f[_]);
    else {
      m.multiDrawArraysInstancedWEBGL(n, d, 0, u, 0, f, 0, p);
      let _ = 0;
      for (let x = 0; x < p; x++)
        _ += u[x];
      for (let x = 0; x < f.length; x++)
        t.update(_, n, f[x]);
    }
  }
  this.setMode = r, this.render = s, this.renderInstances = a, this.renderMultiDraw = o, this.renderMultiDrawInstances = l;
}
function Mm(i, e, t, n) {
  let r;
  function s() {
    if (r !== void 0) return r;
    if (e.has("EXT_texture_filter_anisotropic") === !0) {
      const R = e.get("EXT_texture_filter_anisotropic");
      r = i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else
      r = 0;
    return r;
  }
  function a(R) {
    return !(R !== Hn && n.convert(R) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function o(R) {
    const C = R === Vs && (e.has("EXT_color_buffer_half_float") || e.has("EXT_color_buffer_float"));
    return !(R !== pi && n.convert(R) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
    R !== di && !C);
  }
  function l(R) {
    if (R === "highp") {
      if (i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.HIGH_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.HIGH_FLOAT).precision > 0)
        return "highp";
      R = "mediump";
    }
    return R === "mediump" && i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.MEDIUM_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let d = t.precision !== void 0 ? t.precision : "highp";
  const u = l(d);
  u !== d && (console.warn("THREE.WebGLRenderer:", d, "not supported, using", u, "instead."), d = u);
  const p = t.logarithmicDepthBuffer === !0, f = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS), m = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS), _ = i.getParameter(i.MAX_TEXTURE_SIZE), x = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE), c = i.getParameter(i.MAX_VERTEX_ATTRIBS), h = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS), M = i.getParameter(i.MAX_VARYING_VECTORS), y = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS), w = m > 0, I = i.getParameter(i.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    // keeping this for backwards compatibility
    getMaxAnisotropy: s,
    getMaxPrecision: l,
    textureFormatReadable: a,
    textureTypeReadable: o,
    precision: d,
    logarithmicDepthBuffer: p,
    maxTextures: f,
    maxVertexTextures: m,
    maxTextureSize: _,
    maxCubemapSize: x,
    maxAttributes: c,
    maxVertexUniforms: h,
    maxVaryings: M,
    maxFragmentUniforms: y,
    vertexTextures: w,
    maxSamples: I
  };
}
function Em(i) {
  const e = this;
  let t = null, n = 0, r = !1, s = !1;
  const a = new li(), o = new at(), l = { value: null, needsUpdate: !1 };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(p, f) {
    const m = p.length !== 0 || f || // enable state of previous frame - the clipping code has to
    // run another frame in order to reset the state:
    n !== 0 || r;
    return r = f, n = p.length, m;
  }, this.beginShadows = function() {
    s = !0, u(null);
  }, this.endShadows = function() {
    s = !1;
  }, this.setGlobalState = function(p, f) {
    t = u(p, f, 0);
  }, this.setState = function(p, f, m) {
    const _ = p.clippingPlanes, x = p.clipIntersection, c = p.clipShadows, h = i.get(p);
    if (!r || _ === null || _.length === 0 || s && !c)
      s ? u(null) : d();
    else {
      const M = s ? 0 : n, y = M * 4;
      let w = h.clippingState || null;
      l.value = w, w = u(_, f, y, m);
      for (let I = 0; I !== y; ++I)
        w[I] = t[I];
      h.clippingState = w, this.numIntersection = x ? this.numPlanes : 0, this.numPlanes += M;
    }
  };
  function d() {
    l.value !== t && (l.value = t, l.needsUpdate = n > 0), e.numPlanes = n, e.numIntersection = 0;
  }
  function u(p, f, m, _) {
    const x = p !== null ? p.length : 0;
    let c = null;
    if (x !== 0) {
      if (c = l.value, _ !== !0 || c === null) {
        const h = m + x * 4, M = f.matrixWorldInverse;
        o.getNormalMatrix(M), (c === null || c.length < h) && (c = new Float32Array(h));
        for (let y = 0, w = m; y !== x; ++y, w += 4)
          a.copy(p[y]).applyMatrix4(M, o), a.normal.toArray(c, w), c[w + 3] = a.constant;
      }
      l.value = c, l.needsUpdate = !0;
    }
    return e.numPlanes = x, e.numIntersection = 0, c;
  }
}
function bm(i) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(a, o) {
    return o === Za ? a.mapping = gr : o === Qa && (a.mapping = _r), a;
  }
  function n(a) {
    if (a && a.isTexture) {
      const o = a.mapping;
      if (o === Za || o === Qa)
        if (e.has(a)) {
          const l = e.get(a).texture;
          return t(l, a.mapping);
        } else {
          const l = a.image;
          if (l && l.height > 0) {
            const d = new Du(l.height);
            return d.fromEquirectangularTexture(i, a), e.set(a, d), a.addEventListener("dispose", r), t(d.texture, a.mapping);
          } else
            return null;
        }
    }
    return a;
  }
  function r(a) {
    const o = a.target;
    o.removeEventListener("dispose", r);
    const l = e.get(o);
    l !== void 0 && (e.delete(o), l.dispose());
  }
  function s() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: n,
    dispose: s
  };
}
class wd extends bd {
  constructor(e = -1, t = 1, n = 1, r = -1, s = 0.1, a = 2e3) {
    super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = e, this.right = t, this.top = n, this.bottom = r, this.near = s, this.far = a, this.updateProjectionMatrix();
  }
  copy(e, t) {
    return super.copy(e, t), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this.view = e.view === null ? null : Object.assign({}, e.view), this;
  }
  setViewOffset(e, t, n, r, s, a) {
    this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = r, this.view.width = s, this.view.height = a, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const e = (this.right - this.left) / (2 * this.zoom), t = (this.top - this.bottom) / (2 * this.zoom), n = (this.right + this.left) / 2, r = (this.top + this.bottom) / 2;
    let s = n - e, a = n + e, o = r + t, l = r - t;
    if (this.view !== null && this.view.enabled) {
      const d = (this.right - this.left) / this.view.fullWidth / this.zoom, u = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      s += d * this.view.offsetX, a = s + d * this.view.width, o -= u * this.view.offsetY, l = o - u * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(s, a, o, l, this.near, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, this.view !== null && (t.object.view = Object.assign({}, this.view)), t;
  }
}
const hr = 4, _c = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], Ci = 20, Ia = /* @__PURE__ */ new wd(), vc = /* @__PURE__ */ new ut();
let Da = null, Ua = 0, Oa = 0, Fa = !1;
const Ai = (1 + Math.sqrt(5)) / 2, or = 1 / Ai, xc = [
  /* @__PURE__ */ new N(-Ai, or, 0),
  /* @__PURE__ */ new N(Ai, or, 0),
  /* @__PURE__ */ new N(-or, 0, Ai),
  /* @__PURE__ */ new N(or, 0, Ai),
  /* @__PURE__ */ new N(0, Ai, -or),
  /* @__PURE__ */ new N(0, Ai, or),
  /* @__PURE__ */ new N(-1, 1, -1),
  /* @__PURE__ */ new N(1, 1, -1),
  /* @__PURE__ */ new N(-1, 1, 1),
  /* @__PURE__ */ new N(1, 1, 1)
];
class yc {
  constructor(e) {
    this._renderer = e, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
  }
  /**
   * Generates a PMREM from a supplied Scene, which can be faster than using an
   * image if networking bandwidth is low. Optional sigma specifies a blur radius
   * in radians to be applied to the scene before PMREM generation. Optional near
   * and far planes ensure the scene is rendered in its entirety (the cubeCamera
   * is placed at the origin).
   */
  fromScene(e, t = 0, n = 0.1, r = 100) {
    Da = this._renderer.getRenderTarget(), Ua = this._renderer.getActiveCubeFace(), Oa = this._renderer.getActiveMipmapLevel(), Fa = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(256);
    const s = this._allocateTargets();
    return s.depthBuffer = !0, this._sceneToCubeUV(e, n, r, s), t > 0 && this._blur(s, 0, 0, t), this._applyPMREM(s), this._cleanup(s), s;
  }
  /**
   * Generates a PMREM from an equirectangular texture, which can be either LDR
   * or HDR. The ideal input image size is 1k (1024 x 512),
   * as this matches best with the 256 x 256 cubemap output.
   * The smallest supported equirectangular image size is 64 x 32.
   */
  fromEquirectangular(e, t = null) {
    return this._fromTexture(e, t);
  }
  /**
   * Generates a PMREM from an cubemap texture, which can be either LDR
   * or HDR. The ideal input cube size is 256 x 256,
   * as this matches best with the 256 x 256 cubemap output.
   * The smallest supported cube size is 16 x 16.
   */
  fromCubemap(e, t = null) {
    return this._fromTexture(e, t);
  }
  /**
   * Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileCubemapShader() {
    this._cubemapMaterial === null && (this._cubemapMaterial = Ec(), this._compileMaterial(this._cubemapMaterial));
  }
  /**
   * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = Mc(), this._compileMaterial(this._equirectMaterial));
  }
  /**
   * Disposes of the PMREMGenerator's internal memory. Note that PMREMGenerator is a static class,
   * so you should not need more than one PMREMGenerator object. If you do, calling dispose() on
   * one of them will cause any others to also become unusable.
   */
  dispose() {
    this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose();
  }
  // private interface
  _setSize(e) {
    this._lodMax = Math.floor(Math.log2(e)), this._cubeSize = Math.pow(2, this._lodMax);
  }
  _dispose() {
    this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
    for (let e = 0; e < this._lodPlanes.length; e++)
      this._lodPlanes[e].dispose();
  }
  _cleanup(e) {
    this._renderer.setRenderTarget(Da, Ua, Oa), this._renderer.xr.enabled = Fa, e.scissorTest = !1, xs(e, 0, 0, e.width, e.height);
  }
  _fromTexture(e, t) {
    e.mapping === gr || e.mapping === _r ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), Da = this._renderer.getRenderTarget(), Ua = this._renderer.getActiveCubeFace(), Oa = this._renderer.getActiveMipmapLevel(), Fa = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
    const n = t || this._allocateTargets();
    return this._textureToCubeUV(e, n), this._applyPMREM(n), this._cleanup(n), n;
  }
  _allocateTargets() {
    const e = 3 * Math.max(this._cubeSize, 112), t = 4 * this._cubeSize, n = {
      magFilter: In,
      minFilter: In,
      generateMipmaps: !1,
      type: Vs,
      format: Hn,
      colorSpace: gi,
      depthBuffer: !1
    }, r = Sc(e, t, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Sc(e, t, n);
      const { _lodMax: s } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Tm(s)), this._blurMaterial = Am(s, e, t);
    }
    return r;
  }
  _compileMaterial(e) {
    const t = new Te(this._lodPlanes[0], e);
    this._renderer.compile(t, Ia);
  }
  _sceneToCubeUV(e, t, n, r) {
    const o = new An(90, 1, t, n), l = [1, -1, 1, 1, 1, 1], d = [1, 1, 1, -1, -1, -1], u = this._renderer, p = u.autoClear, f = u.toneMapping;
    u.getClearColor(vc), u.toneMapping = ui, u.autoClear = !1;
    const m = new Xs({
      name: "PMREM.Background",
      side: _n,
      depthWrite: !1,
      depthTest: !1
    }), _ = new Te(new kt(), m);
    let x = !1;
    const c = e.background;
    c ? c.isColor && (m.color.copy(c), e.background = null, x = !0) : (m.color.copy(vc), x = !0);
    for (let h = 0; h < 6; h++) {
      const M = h % 3;
      M === 0 ? (o.up.set(0, l[h], 0), o.lookAt(d[h], 0, 0)) : M === 1 ? (o.up.set(0, 0, l[h]), o.lookAt(0, d[h], 0)) : (o.up.set(0, l[h], 0), o.lookAt(0, 0, d[h]));
      const y = this._cubeSize;
      xs(r, M * y, h > 2 ? y : 0, y, y), u.setRenderTarget(r), x && u.render(_, o), u.render(e, o);
    }
    _.geometry.dispose(), _.material.dispose(), u.toneMapping = f, u.autoClear = p, e.background = c;
  }
  _textureToCubeUV(e, t) {
    const n = this._renderer, r = e.mapping === gr || e.mapping === _r;
    r ? (this._cubemapMaterial === null && (this._cubemapMaterial = Ec()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = Mc());
    const s = r ? this._cubemapMaterial : this._equirectMaterial, a = new Te(this._lodPlanes[0], s), o = s.uniforms;
    o.envMap.value = e;
    const l = this._cubeSize;
    xs(t, 0, 0, 3 * l, 2 * l), n.setRenderTarget(t), n.render(a, Ia);
  }
  _applyPMREM(e) {
    const t = this._renderer, n = t.autoClear;
    t.autoClear = !1;
    const r = this._lodPlanes.length;
    for (let s = 1; s < r; s++) {
      const a = Math.sqrt(this._sigmas[s] * this._sigmas[s] - this._sigmas[s - 1] * this._sigmas[s - 1]), o = xc[(r - s - 1) % xc.length];
      this._blur(e, s - 1, s, a, o);
    }
    t.autoClear = n;
  }
  /**
   * This is a two-pass Gaussian blur for a cubemap. Normally this is done
   * vertically and horizontally, but this breaks down on a cube. Here we apply
   * the blur latitudinally (around the poles), and then longitudinally (towards
   * the poles) to approximate the orthogonally-separable blur. It is least
   * accurate at the poles, but still does a decent job.
   */
  _blur(e, t, n, r, s) {
    const a = this._pingPongRenderTarget;
    this._halfBlur(
      e,
      a,
      t,
      n,
      r,
      "latitudinal",
      s
    ), this._halfBlur(
      a,
      e,
      n,
      n,
      r,
      "longitudinal",
      s
    );
  }
  _halfBlur(e, t, n, r, s, a, o) {
    const l = this._renderer, d = this._blurMaterial;
    a !== "latitudinal" && a !== "longitudinal" && console.error(
      "blur direction must be either latitudinal or longitudinal!"
    );
    const u = 3, p = new Te(this._lodPlanes[r], d), f = d.uniforms, m = this._sizeLods[n] - 1, _ = isFinite(s) ? Math.PI / (2 * m) : 2 * Math.PI / (2 * Ci - 1), x = s / _, c = isFinite(s) ? 1 + Math.floor(u * x) : Ci;
    c > Ci && console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${c} samples when the maximum is set to ${Ci}`);
    const h = [];
    let M = 0;
    for (let C = 0; C < Ci; ++C) {
      const U = C / x, A = Math.exp(-U * U / 2);
      h.push(A), C === 0 ? M += A : C < c && (M += 2 * A);
    }
    for (let C = 0; C < h.length; C++)
      h[C] = h[C] / M;
    f.envMap.value = e.texture, f.samples.value = c, f.weights.value = h, f.latitudinal.value = a === "latitudinal", o && (f.poleAxis.value = o);
    const { _lodMax: y } = this;
    f.dTheta.value = _, f.mipInt.value = y - n;
    const w = this._sizeLods[r], I = 3 * w * (r > y - hr ? r - y + hr : 0), R = 4 * (this._cubeSize - w);
    xs(t, I, R, 3 * w, 2 * w), l.setRenderTarget(t), l.render(p, Ia);
  }
}
function Tm(i) {
  const e = [], t = [], n = [];
  let r = i;
  const s = i - hr + 1 + _c.length;
  for (let a = 0; a < s; a++) {
    const o = Math.pow(2, r);
    t.push(o);
    let l = 1 / o;
    a > i - hr ? l = _c[a - i + hr - 1] : a === 0 && (l = 0), n.push(l);
    const d = 1 / (o - 2), u = -d, p = 1 + d, f = [u, u, p, u, p, p, u, u, p, p, u, p], m = 6, _ = 6, x = 3, c = 2, h = 1, M = new Float32Array(x * _ * m), y = new Float32Array(c * _ * m), w = new Float32Array(h * _ * m);
    for (let R = 0; R < m; R++) {
      const C = R % 3 * 2 / 3 - 1, U = R > 2 ? 0 : -1, A = [
        C,
        U,
        0,
        C + 2 / 3,
        U,
        0,
        C + 2 / 3,
        U + 1,
        0,
        C,
        U,
        0,
        C + 2 / 3,
        U + 1,
        0,
        C,
        U + 1,
        0
      ];
      M.set(A, x * _ * R), y.set(f, c * _ * R);
      const v = [R, R, R, R, R, R];
      w.set(v, h * _ * R);
    }
    const I = new ln();
    I.setAttribute("position", new Gn(M, x)), I.setAttribute("uv", new Gn(y, c)), I.setAttribute("faceIndex", new Gn(w, h)), e.push(I), r > hr && r--;
  }
  return { lodPlanes: e, sizeLods: t, sigmas: n };
}
function Sc(i, e, t) {
  const n = new Di(i, e, t);
  return n.texture.mapping = ks, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n;
}
function xs(i, e, t, n, r) {
  i.viewport.set(e, t, n, r), i.scissor.set(e, t, n, r);
}
function Am(i, e, t) {
  const n = new Float32Array(Ci), r = new N(0, 1, 0);
  return new mi({
    name: "SphericalGaussianBlur",
    defines: {
      n: Ci,
      CUBEUV_TEXEL_WIDTH: 1 / e,
      CUBEUV_TEXEL_HEIGHT: 1 / t,
      CUBEUV_MAX_MIP: `${i}.0`
    },
    uniforms: {
      envMap: { value: null },
      samples: { value: 1 },
      weights: { value: n },
      latitudinal: { value: !1 },
      dTheta: { value: 0 },
      mipInt: { value: 0 },
      poleAxis: { value: r }
    },
    vertexShader: uo(),
    fragmentShader: (
      /* glsl */
      `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`
    ),
    blending: hi,
    depthTest: !1,
    depthWrite: !1
  });
}
function Mc() {
  return new mi({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: { value: null }
    },
    vertexShader: uo(),
    fragmentShader: (
      /* glsl */
      `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`
    ),
    blending: hi,
    depthTest: !1,
    depthWrite: !1
  });
}
function Ec() {
  return new mi({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: uo(),
    fragmentShader: (
      /* glsl */
      `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`
    ),
    blending: hi,
    depthTest: !1,
    depthWrite: !1
  });
}
function uo() {
  return (
    /* glsl */
    `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`
  );
}
function wm(i) {
  let e = /* @__PURE__ */ new WeakMap(), t = null;
  function n(o) {
    if (o && o.isTexture) {
      const l = o.mapping, d = l === Za || l === Qa, u = l === gr || l === _r;
      if (d || u) {
        let p = e.get(o);
        const f = p !== void 0 ? p.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== f)
          return t === null && (t = new yc(i)), p = d ? t.fromEquirectangular(o, p) : t.fromCubemap(o, p), p.texture.pmremVersion = o.pmremVersion, e.set(o, p), p.texture;
        if (p !== void 0)
          return p.texture;
        {
          const m = o.image;
          return d && m && m.height > 0 || u && m && r(m) ? (t === null && (t = new yc(i)), p = d ? t.fromEquirectangular(o) : t.fromCubemap(o), p.texture.pmremVersion = o.pmremVersion, e.set(o, p), o.addEventListener("dispose", s), p.texture) : null;
        }
      }
    }
    return o;
  }
  function r(o) {
    let l = 0;
    const d = 6;
    for (let u = 0; u < d; u++)
      o[u] !== void 0 && l++;
    return l === d;
  }
  function s(o) {
    const l = o.target;
    l.removeEventListener("dispose", s);
    const d = e.get(l);
    d !== void 0 && (e.delete(l), d.dispose());
  }
  function a() {
    e = /* @__PURE__ */ new WeakMap(), t !== null && (t.dispose(), t = null);
  }
  return {
    get: n,
    dispose: a
  };
}
function Rm(i) {
  const e = {};
  function t(n) {
    if (e[n] !== void 0)
      return e[n];
    let r;
    switch (n) {
      case "WEBGL_depth_texture":
        r = i.getExtension("WEBGL_depth_texture") || i.getExtension("MOZ_WEBGL_depth_texture") || i.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        r = i.getExtension("EXT_texture_filter_anisotropic") || i.getExtension("MOZ_EXT_texture_filter_anisotropic") || i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        r = i.getExtension("WEBGL_compressed_texture_s3tc") || i.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        r = i.getExtension("WEBGL_compressed_texture_pvrtc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        r = i.getExtension(n);
    }
    return e[n] = r, r;
  }
  return {
    has: function(n) {
      return t(n) !== null;
    },
    init: function() {
      t("EXT_color_buffer_float"), t("WEBGL_clip_cull_distance"), t("OES_texture_float_linear"), t("EXT_color_buffer_half_float"), t("WEBGL_multisampled_render_to_texture"), t("WEBGL_render_shared_exponent");
    },
    get: function(n) {
      const r = t(n);
      return r === null && _d("THREE.WebGLRenderer: " + n + " extension not supported."), r;
    }
  };
}
function Cm(i, e, t, n) {
  const r = {}, s = /* @__PURE__ */ new WeakMap();
  function a(p) {
    const f = p.target;
    f.index !== null && e.remove(f.index);
    for (const _ in f.attributes)
      e.remove(f.attributes[_]);
    for (const _ in f.morphAttributes) {
      const x = f.morphAttributes[_];
      for (let c = 0, h = x.length; c < h; c++)
        e.remove(x[c]);
    }
    f.removeEventListener("dispose", a), delete r[f.id];
    const m = s.get(f);
    m && (e.remove(m), s.delete(f)), n.releaseStatesOfGeometry(f), f.isInstancedBufferGeometry === !0 && delete f._maxInstanceCount, t.memory.geometries--;
  }
  function o(p, f) {
    return r[f.id] === !0 || (f.addEventListener("dispose", a), r[f.id] = !0, t.memory.geometries++), f;
  }
  function l(p) {
    const f = p.attributes;
    for (const _ in f)
      e.update(f[_], i.ARRAY_BUFFER);
    const m = p.morphAttributes;
    for (const _ in m) {
      const x = m[_];
      for (let c = 0, h = x.length; c < h; c++)
        e.update(x[c], i.ARRAY_BUFFER);
    }
  }
  function d(p) {
    const f = [], m = p.index, _ = p.attributes.position;
    let x = 0;
    if (m !== null) {
      const M = m.array;
      x = m.version;
      for (let y = 0, w = M.length; y < w; y += 3) {
        const I = M[y + 0], R = M[y + 1], C = M[y + 2];
        f.push(I, R, R, C, C, I);
      }
    } else if (_ !== void 0) {
      const M = _.array;
      x = _.version;
      for (let y = 0, w = M.length / 3 - 1; y < w; y += 3) {
        const I = y + 0, R = y + 1, C = y + 2;
        f.push(I, R, R, C, C, I);
      }
    } else
      return;
    const c = new (gd(f) ? Md : Sd)(f, 1);
    c.version = x;
    const h = s.get(p);
    h && e.remove(h), s.set(p, c);
  }
  function u(p) {
    const f = s.get(p);
    if (f) {
      const m = p.index;
      m !== null && f.version < m.version && d(p);
    } else
      d(p);
    return s.get(p);
  }
  return {
    get: o,
    update: l,
    getWireframeAttribute: u
  };
}
function Pm(i, e, t) {
  let n;
  function r(f) {
    n = f;
  }
  let s, a;
  function o(f) {
    s = f.type, a = f.bytesPerElement;
  }
  function l(f, m) {
    i.drawElements(n, m, s, f * a), t.update(m, n, 1);
  }
  function d(f, m, _) {
    _ !== 0 && (i.drawElementsInstanced(n, m, s, f * a, _), t.update(m, n, _));
  }
  function u(f, m, _) {
    if (_ === 0) return;
    const x = e.get("WEBGL_multi_draw");
    if (x === null)
      for (let c = 0; c < _; c++)
        this.render(f[c] / a, m[c]);
    else {
      x.multiDrawElementsWEBGL(n, m, 0, s, f, 0, _);
      let c = 0;
      for (let h = 0; h < _; h++)
        c += m[h];
      t.update(c, n, 1);
    }
  }
  function p(f, m, _, x) {
    if (_ === 0) return;
    const c = e.get("WEBGL_multi_draw");
    if (c === null)
      for (let h = 0; h < f.length; h++)
        d(f[h] / a, m[h], x[h]);
    else {
      c.multiDrawElementsInstancedWEBGL(n, m, 0, s, f, 0, x, 0, _);
      let h = 0;
      for (let M = 0; M < _; M++)
        h += m[M];
      for (let M = 0; M < x.length; M++)
        t.update(h, n, x[M]);
    }
  }
  this.setMode = r, this.setIndex = o, this.render = l, this.renderInstances = d, this.renderMultiDraw = u, this.renderMultiDrawInstances = p;
}
function Lm(i) {
  const e = {
    geometries: 0,
    textures: 0
  }, t = {
    frame: 0,
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  };
  function n(s, a, o) {
    switch (t.calls++, a) {
      case i.TRIANGLES:
        t.triangles += o * (s / 3);
        break;
      case i.LINES:
        t.lines += o * (s / 2);
        break;
      case i.LINE_STRIP:
        t.lines += o * (s - 1);
        break;
      case i.LINE_LOOP:
        t.lines += o * s;
        break;
      case i.POINTS:
        t.points += o * s;
        break;
      default:
        console.error("THREE.WebGLInfo: Unknown draw mode:", a);
        break;
    }
  }
  function r() {
    t.calls = 0, t.triangles = 0, t.points = 0, t.lines = 0;
  }
  return {
    memory: e,
    render: t,
    programs: null,
    autoReset: !0,
    reset: r,
    update: n
  };
}
function Nm(i, e, t) {
  const n = /* @__PURE__ */ new WeakMap(), r = new en();
  function s(a, o, l) {
    const d = a.morphTargetInfluences, u = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, p = u !== void 0 ? u.length : 0;
    let f = n.get(o);
    if (f === void 0 || f.count !== p) {
      let A = function() {
        C.dispose(), n.delete(o), o.removeEventListener("dispose", A);
      };
      f !== void 0 && f.texture.dispose();
      const m = o.morphAttributes.position !== void 0, _ = o.morphAttributes.normal !== void 0, x = o.morphAttributes.color !== void 0, c = o.morphAttributes.position || [], h = o.morphAttributes.normal || [], M = o.morphAttributes.color || [];
      let y = 0;
      m === !0 && (y = 1), _ === !0 && (y = 2), x === !0 && (y = 3);
      let w = o.attributes.position.count * y, I = 1;
      w > e.maxTextureSize && (I = Math.ceil(w / e.maxTextureSize), w = e.maxTextureSize);
      const R = new Float32Array(w * I * 4 * p), C = new xd(R, w, I, p);
      C.type = di, C.needsUpdate = !0;
      const U = y * 4;
      for (let v = 0; v < p; v++) {
        const L = c[v], k = h[v], V = M[v], W = w * I * 4 * v;
        for (let Q = 0; Q < L.count; Q++) {
          const j = Q * U;
          m === !0 && (r.fromBufferAttribute(L, Q), R[W + j + 0] = r.x, R[W + j + 1] = r.y, R[W + j + 2] = r.z, R[W + j + 3] = 0), _ === !0 && (r.fromBufferAttribute(k, Q), R[W + j + 4] = r.x, R[W + j + 5] = r.y, R[W + j + 6] = r.z, R[W + j + 7] = 0), x === !0 && (r.fromBufferAttribute(V, Q), R[W + j + 8] = r.x, R[W + j + 9] = r.y, R[W + j + 10] = r.z, R[W + j + 11] = V.itemSize === 4 ? r.w : 1);
        }
      }
      f = {
        count: p,
        texture: C,
        size: new Xe(w, I)
      }, n.set(o, f), o.addEventListener("dispose", A);
    }
    if (a.isInstancedMesh === !0 && a.morphTexture !== null)
      l.getUniforms().setValue(i, "morphTexture", a.morphTexture, t);
    else {
      let m = 0;
      for (let x = 0; x < d.length; x++)
        m += d[x];
      const _ = o.morphTargetsRelative ? 1 : 1 - m;
      l.getUniforms().setValue(i, "morphTargetBaseInfluence", _), l.getUniforms().setValue(i, "morphTargetInfluences", d);
    }
    l.getUniforms().setValue(i, "morphTargetsTexture", f.texture, t), l.getUniforms().setValue(i, "morphTargetsTextureSize", f.size);
  }
  return {
    update: s
  };
}
function Im(i, e, t, n) {
  let r = /* @__PURE__ */ new WeakMap();
  function s(l) {
    const d = n.render.frame, u = l.geometry, p = e.get(l, u);
    if (r.get(p) !== d && (e.update(p), r.set(p, d)), l.isInstancedMesh && (l.hasEventListener("dispose", o) === !1 && l.addEventListener("dispose", o), r.get(l) !== d && (t.update(l.instanceMatrix, i.ARRAY_BUFFER), l.instanceColor !== null && t.update(l.instanceColor, i.ARRAY_BUFFER), r.set(l, d))), l.isSkinnedMesh) {
      const f = l.skeleton;
      r.get(f) !== d && (f.update(), r.set(f, d));
    }
    return p;
  }
  function a() {
    r = /* @__PURE__ */ new WeakMap();
  }
  function o(l) {
    const d = l.target;
    d.removeEventListener("dispose", o), t.remove(d.instanceMatrix), d.instanceColor !== null && t.remove(d.instanceColor);
  }
  return {
    update: s,
    dispose: a
  };
}
class Rd extends vn {
  constructor(e, t, n, r, s, a, o, l, d, u = pr) {
    if (u !== pr && u !== yr)
      throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    n === void 0 && u === pr && (n = vr), n === void 0 && u === yr && (n = xr), super(null, r, s, a, o, l, u, n, d), this.isDepthTexture = !0, this.image = { width: e, height: t }, this.magFilter = o !== void 0 ? o : wn, this.minFilter = l !== void 0 ? l : wn, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(e) {
    return super.copy(e), this.compareFunction = e.compareFunction, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.compareFunction !== null && (t.compareFunction = this.compareFunction), t;
  }
}
const Cd = /* @__PURE__ */ new vn(), Pd = /* @__PURE__ */ new Rd(1, 1);
Pd.compareFunction = md;
const Ld = /* @__PURE__ */ new xd(), Nd = /* @__PURE__ */ new vu(), Id = /* @__PURE__ */ new Td(), bc = [], Tc = [], Ac = new Float32Array(16), wc = new Float32Array(9), Rc = new Float32Array(4);
function Er(i, e, t) {
  const n = i[0];
  if (n <= 0 || n > 0) return i;
  const r = e * t;
  let s = bc[r];
  if (s === void 0 && (s = new Float32Array(r), bc[r] = s), e !== 0) {
    n.toArray(s, 0);
    for (let a = 1, o = 0; a !== e; ++a)
      o += t, i[a].toArray(s, o);
  }
  return s;
}
function qt(i, e) {
  if (i.length !== e.length) return !1;
  for (let t = 0, n = i.length; t < n; t++)
    if (i[t] !== e[t]) return !1;
  return !0;
}
function jt(i, e) {
  for (let t = 0, n = e.length; t < n; t++)
    i[t] = e[t];
}
function Ys(i, e) {
  let t = Tc[e];
  t === void 0 && (t = new Int32Array(e), Tc[e] = t);
  for (let n = 0; n !== e; ++n)
    t[n] = i.allocateTextureUnit();
  return t;
}
function Dm(i, e) {
  const t = this.cache;
  t[0] !== e && (i.uniform1f(this.addr, e), t[0] = e);
}
function Um(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (i.uniform2f(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (qt(t, e)) return;
    i.uniform2fv(this.addr, e), jt(t, e);
  }
}
function Om(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (i.uniform3f(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else if (e.r !== void 0)
    (t[0] !== e.r || t[1] !== e.g || t[2] !== e.b) && (i.uniform3f(this.addr, e.r, e.g, e.b), t[0] = e.r, t[1] = e.g, t[2] = e.b);
  else {
    if (qt(t, e)) return;
    i.uniform3fv(this.addr, e), jt(t, e);
  }
}
function Fm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (i.uniform4f(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (qt(t, e)) return;
    i.uniform4fv(this.addr, e), jt(t, e);
  }
}
function Bm(i, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (qt(t, e)) return;
    i.uniformMatrix2fv(this.addr, !1, e), jt(t, e);
  } else {
    if (qt(t, n)) return;
    Rc.set(n), i.uniformMatrix2fv(this.addr, !1, Rc), jt(t, n);
  }
}
function zm(i, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (qt(t, e)) return;
    i.uniformMatrix3fv(this.addr, !1, e), jt(t, e);
  } else {
    if (qt(t, n)) return;
    wc.set(n), i.uniformMatrix3fv(this.addr, !1, wc), jt(t, n);
  }
}
function km(i, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (qt(t, e)) return;
    i.uniformMatrix4fv(this.addr, !1, e), jt(t, e);
  } else {
    if (qt(t, n)) return;
    Ac.set(n), i.uniformMatrix4fv(this.addr, !1, Ac), jt(t, n);
  }
}
function Vm(i, e) {
  const t = this.cache;
  t[0] !== e && (i.uniform1i(this.addr, e), t[0] = e);
}
function Hm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (i.uniform2i(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (qt(t, e)) return;
    i.uniform2iv(this.addr, e), jt(t, e);
  }
}
function Gm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (i.uniform3i(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (qt(t, e)) return;
    i.uniform3iv(this.addr, e), jt(t, e);
  }
}
function Wm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (i.uniform4i(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (qt(t, e)) return;
    i.uniform4iv(this.addr, e), jt(t, e);
  }
}
function Xm(i, e) {
  const t = this.cache;
  t[0] !== e && (i.uniform1ui(this.addr, e), t[0] = e);
}
function Ym(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (i.uniform2ui(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (qt(t, e)) return;
    i.uniform2uiv(this.addr, e), jt(t, e);
  }
}
function qm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (i.uniform3ui(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (qt(t, e)) return;
    i.uniform3uiv(this.addr, e), jt(t, e);
  }
}
function jm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (i.uniform4ui(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (qt(t, e)) return;
    i.uniform4uiv(this.addr, e), jt(t, e);
  }
}
function Km(i, e, t) {
  const n = this.cache, r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r);
  const s = this.type === i.SAMPLER_2D_SHADOW ? Pd : Cd;
  t.setTexture2D(e || s, r);
}
function $m(i, e, t) {
  const n = this.cache, r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r), t.setTexture3D(e || Nd, r);
}
function Zm(i, e, t) {
  const n = this.cache, r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r), t.setTextureCube(e || Id, r);
}
function Qm(i, e, t) {
  const n = this.cache, r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r), t.setTexture2DArray(e || Ld, r);
}
function Jm(i) {
  switch (i) {
    case 5126:
      return Dm;
    case 35664:
      return Um;
    case 35665:
      return Om;
    case 35666:
      return Fm;
    case 35674:
      return Bm;
    case 35675:
      return zm;
    case 35676:
      return km;
    case 5124:
    case 35670:
      return Vm;
    case 35667:
    case 35671:
      return Hm;
    case 35668:
    case 35672:
      return Gm;
    case 35669:
    case 35673:
      return Wm;
    case 5125:
      return Xm;
    case 36294:
      return Ym;
    case 36295:
      return qm;
    case 36296:
      return jm;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Km;
    case 35679:
    case 36299:
    case 36307:
      return $m;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Zm;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Qm;
  }
}
function eg(i, e) {
  i.uniform1fv(this.addr, e);
}
function tg(i, e) {
  const t = Er(e, this.size, 2);
  i.uniform2fv(this.addr, t);
}
function ng(i, e) {
  const t = Er(e, this.size, 3);
  i.uniform3fv(this.addr, t);
}
function ig(i, e) {
  const t = Er(e, this.size, 4);
  i.uniform4fv(this.addr, t);
}
function rg(i, e) {
  const t = Er(e, this.size, 4);
  i.uniformMatrix2fv(this.addr, !1, t);
}
function sg(i, e) {
  const t = Er(e, this.size, 9);
  i.uniformMatrix3fv(this.addr, !1, t);
}
function ag(i, e) {
  const t = Er(e, this.size, 16);
  i.uniformMatrix4fv(this.addr, !1, t);
}
function og(i, e) {
  i.uniform1iv(this.addr, e);
}
function lg(i, e) {
  i.uniform2iv(this.addr, e);
}
function cg(i, e) {
  i.uniform3iv(this.addr, e);
}
function dg(i, e) {
  i.uniform4iv(this.addr, e);
}
function hg(i, e) {
  i.uniform1uiv(this.addr, e);
}
function ug(i, e) {
  i.uniform2uiv(this.addr, e);
}
function fg(i, e) {
  i.uniform3uiv(this.addr, e);
}
function pg(i, e) {
  i.uniform4uiv(this.addr, e);
}
function mg(i, e, t) {
  const n = this.cache, r = e.length, s = Ys(t, r);
  qt(n, s) || (i.uniform1iv(this.addr, s), jt(n, s));
  for (let a = 0; a !== r; ++a)
    t.setTexture2D(e[a] || Cd, s[a]);
}
function gg(i, e, t) {
  const n = this.cache, r = e.length, s = Ys(t, r);
  qt(n, s) || (i.uniform1iv(this.addr, s), jt(n, s));
  for (let a = 0; a !== r; ++a)
    t.setTexture3D(e[a] || Nd, s[a]);
}
function _g(i, e, t) {
  const n = this.cache, r = e.length, s = Ys(t, r);
  qt(n, s) || (i.uniform1iv(this.addr, s), jt(n, s));
  for (let a = 0; a !== r; ++a)
    t.setTextureCube(e[a] || Id, s[a]);
}
function vg(i, e, t) {
  const n = this.cache, r = e.length, s = Ys(t, r);
  qt(n, s) || (i.uniform1iv(this.addr, s), jt(n, s));
  for (let a = 0; a !== r; ++a)
    t.setTexture2DArray(e[a] || Ld, s[a]);
}
function xg(i) {
  switch (i) {
    case 5126:
      return eg;
    case 35664:
      return tg;
    case 35665:
      return ng;
    case 35666:
      return ig;
    case 35674:
      return rg;
    case 35675:
      return sg;
    case 35676:
      return ag;
    case 5124:
    case 35670:
      return og;
    case 35667:
    case 35671:
      return lg;
    case 35668:
    case 35672:
      return cg;
    case 35669:
    case 35673:
      return dg;
    case 5125:
      return hg;
    case 36294:
      return ug;
    case 36295:
      return fg;
    case 36296:
      return pg;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return mg;
    case 35679:
    case 36299:
    case 36307:
      return gg;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return _g;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return vg;
  }
}
class yg {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.setValue = Jm(t.type);
  }
}
class Sg {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = xg(t.type);
  }
}
class Mg {
  constructor(e) {
    this.id = e, this.seq = [], this.map = {};
  }
  setValue(e, t, n) {
    const r = this.seq;
    for (let s = 0, a = r.length; s !== a; ++s) {
      const o = r[s];
      o.setValue(e, t[o.id], n);
    }
  }
}
const Ba = /(\w+)(\])?(\[|\.)?/g;
function Cc(i, e) {
  i.seq.push(e), i.map[e.id] = e;
}
function Eg(i, e, t) {
  const n = i.name, r = n.length;
  for (Ba.lastIndex = 0; ; ) {
    const s = Ba.exec(n), a = Ba.lastIndex;
    let o = s[1];
    const l = s[2] === "]", d = s[3];
    if (l && (o = o | 0), d === void 0 || d === "[" && a + 2 === r) {
      Cc(t, d === void 0 ? new yg(o, i, e) : new Sg(o, i, e));
      break;
    } else {
      let p = t.map[o];
      p === void 0 && (p = new Mg(o), Cc(t, p)), t = p;
    }
  }
}
class Cs {
  constructor(e, t) {
    this.seq = [], this.map = {};
    const n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let r = 0; r < n; ++r) {
      const s = e.getActiveUniform(t, r), a = e.getUniformLocation(t, s.name);
      Eg(s, a, this);
    }
  }
  setValue(e, t, n, r) {
    const s = this.map[t];
    s !== void 0 && s.setValue(e, n, r);
  }
  setOptional(e, t, n) {
    const r = t[n];
    r !== void 0 && this.setValue(e, n, r);
  }
  static upload(e, t, n, r) {
    for (let s = 0, a = t.length; s !== a; ++s) {
      const o = t[s], l = n[o.id];
      l.needsUpdate !== !1 && o.setValue(e, l.value, r);
    }
  }
  static seqWithValue(e, t) {
    const n = [];
    for (let r = 0, s = e.length; r !== s; ++r) {
      const a = e[r];
      a.id in t && n.push(a);
    }
    return n;
  }
}
function Pc(i, e, t) {
  const n = i.createShader(e);
  return i.shaderSource(n, t), i.compileShader(n), n;
}
const bg = 37297;
let Tg = 0;
function Ag(i, e) {
  const t = i.split(`
`), n = [], r = Math.max(e - 6, 0), s = Math.min(e + 6, t.length);
  for (let a = r; a < s; a++) {
    const o = a + 1;
    n.push(`${o === e ? ">" : " "} ${o}: ${t[a]}`);
  }
  return n.join(`
`);
}
function wg(i) {
  const e = _t.getPrimaries(_t.workingColorSpace), t = _t.getPrimaries(i);
  let n;
  switch (e === t ? n = "" : e === Us && t === Ds ? n = "LinearDisplayP3ToLinearSRGB" : e === Ds && t === Us && (n = "LinearSRGBToLinearDisplayP3"), i) {
    case gi:
    case Hs:
      return [n, "LinearTransferOETF"];
    case Bn:
    case lo:
      return [n, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space:", i), [n, "LinearTransferOETF"];
  }
}
function Lc(i, e, t) {
  const n = i.getShaderParameter(e, i.COMPILE_STATUS), r = i.getShaderInfoLog(e).trim();
  if (n && r === "") return "";
  const s = /ERROR: 0:(\d+)/.exec(r);
  if (s) {
    const a = parseInt(s[1]);
    return t.toUpperCase() + `

` + r + `

` + Ag(i.getShaderSource(e), a);
  } else
    return r;
}
function Rg(i, e) {
  const t = wg(e);
  return `vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`;
}
function Cg(i, e) {
  let t;
  switch (e) {
    case Uh:
      t = "Linear";
      break;
    case Oh:
      t = "Reinhard";
      break;
    case Fh:
      t = "OptimizedCineon";
      break;
    case Bh:
      t = "ACESFilmic";
      break;
    case kh:
      t = "AgX";
      break;
    case Vh:
      t = "Neutral";
      break;
    case zh:
      t = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", e), t = "Linear";
  }
  return "vec3 " + i + "( vec3 color ) { return " + t + "ToneMapping( color ); }";
}
function Pg(i) {
  return [
    i.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    i.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
  ].filter(Br).join(`
`);
}
function Lg(i) {
  const e = [];
  for (const t in i) {
    const n = i[t];
    n !== !1 && e.push("#define " + t + " " + n);
  }
  return e.join(`
`);
}
function Ng(i, e) {
  const t = {}, n = i.getProgramParameter(e, i.ACTIVE_ATTRIBUTES);
  for (let r = 0; r < n; r++) {
    const s = i.getActiveAttrib(e, r), a = s.name;
    let o = 1;
    s.type === i.FLOAT_MAT2 && (o = 2), s.type === i.FLOAT_MAT3 && (o = 3), s.type === i.FLOAT_MAT4 && (o = 4), t[a] = {
      type: s.type,
      location: i.getAttribLocation(e, a),
      locationSize: o
    };
  }
  return t;
}
function Br(i) {
  return i !== "";
}
function Nc(i, e) {
  const t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
  return i.replace(/NUM_DIR_LIGHTS/g, e.numDirLights).replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, t).replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, e.numPointLights).replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
}
function Ic(i, e) {
  return i.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
}
const Ig = /^[ \t]*#include +<([\w\d./]+)>/gm;
function no(i) {
  return i.replace(Ig, Ug);
}
const Dg = /* @__PURE__ */ new Map();
function Ug(i, e) {
  let t = st[e];
  if (t === void 0) {
    const n = Dg.get(e);
    if (n !== void 0)
      t = st[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', e, n);
    else
      throw new Error("Can not resolve #include <" + e + ">");
  }
  return no(t);
}
const Og = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function Dc(i) {
  return i.replace(Og, Fg);
}
function Fg(i, e, t, n) {
  let r = "";
  for (let s = parseInt(e); s < parseInt(t); s++)
    r += n.replace(/\[\s*i\s*\]/g, "[ " + s + " ]").replace(/UNROLLED_LOOP_INDEX/g, s);
  return r;
}
function Uc(i) {
  let e = `precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;
  return i.precision === "highp" ? e += `
#define HIGH_PRECISION` : i.precision === "mediump" ? e += `
#define MEDIUM_PRECISION` : i.precision === "lowp" && (e += `
#define LOW_PRECISION`), e;
}
function Bg(i) {
  let e = "SHADOWMAP_TYPE_BASIC";
  return i.shadowMapType === ad ? e = "SHADOWMAP_TYPE_PCF" : i.shadowMapType === oh ? e = "SHADOWMAP_TYPE_PCF_SOFT" : i.shadowMapType === Zn && (e = "SHADOWMAP_TYPE_VSM"), e;
}
function zg(i) {
  let e = "ENVMAP_TYPE_CUBE";
  if (i.envMap)
    switch (i.envMapMode) {
      case gr:
      case _r:
        e = "ENVMAP_TYPE_CUBE";
        break;
      case ks:
        e = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  return e;
}
function kg(i) {
  let e = "ENVMAP_MODE_REFLECTION";
  if (i.envMap)
    switch (i.envMapMode) {
      case _r:
        e = "ENVMAP_MODE_REFRACTION";
        break;
    }
  return e;
}
function Vg(i) {
  let e = "ENVMAP_BLENDING_NONE";
  if (i.envMap)
    switch (i.combine) {
      case oo:
        e = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case Ih:
        e = "ENVMAP_BLENDING_MIX";
        break;
      case Dh:
        e = "ENVMAP_BLENDING_ADD";
        break;
    }
  return e;
}
function Hg(i) {
  const e = i.envMapCubeUVHeight;
  if (e === null) return null;
  const t = Math.log2(e) - 2, n = 1 / e;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 7 * 16)), texelHeight: n, maxMip: t };
}
function Gg(i, e, t, n) {
  const r = i.getContext(), s = t.defines;
  let a = t.vertexShader, o = t.fragmentShader;
  const l = Bg(t), d = zg(t), u = kg(t), p = Vg(t), f = Hg(t), m = Pg(t), _ = Lg(s), x = r.createProgram();
  let c, h, M = t.glslVersion ? "#version " + t.glslVersion + `
` : "";
  t.isRawShaderMaterial ? (c = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    _
  ].filter(Br).join(`
`), c.length > 0 && (c += `
`), h = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    _
  ].filter(Br).join(`
`), h.length > 0 && (h += `
`)) : (c = [
    Uc(t),
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    _,
    t.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
    t.batching ? "#define USE_BATCHING" : "",
    t.batchingColor ? "#define USE_BATCHING_COLOR" : "",
    t.instancing ? "#define USE_INSTANCING" : "",
    t.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
    t.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
    t.useFog && t.fog ? "#define USE_FOG" : "",
    t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "",
    t.map ? "#define USE_MAP" : "",
    t.envMap ? "#define USE_ENVMAP" : "",
    t.envMap ? "#define " + u : "",
    t.lightMap ? "#define USE_LIGHTMAP" : "",
    t.aoMap ? "#define USE_AOMAP" : "",
    t.bumpMap ? "#define USE_BUMPMAP" : "",
    t.normalMap ? "#define USE_NORMALMAP" : "",
    t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    t.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
    t.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    t.anisotropy ? "#define USE_ANISOTROPY" : "",
    t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    t.specularMap ? "#define USE_SPECULARMAP" : "",
    t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    t.metalnessMap ? "#define USE_METALNESSMAP" : "",
    t.alphaMap ? "#define USE_ALPHAMAP" : "",
    t.alphaHash ? "#define USE_ALPHAHASH" : "",
    t.transmission ? "#define USE_TRANSMISSION" : "",
    t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    t.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    //
    t.mapUv ? "#define MAP_UV " + t.mapUv : "",
    t.alphaMapUv ? "#define ALPHAMAP_UV " + t.alphaMapUv : "",
    t.lightMapUv ? "#define LIGHTMAP_UV " + t.lightMapUv : "",
    t.aoMapUv ? "#define AOMAP_UV " + t.aoMapUv : "",
    t.emissiveMapUv ? "#define EMISSIVEMAP_UV " + t.emissiveMapUv : "",
    t.bumpMapUv ? "#define BUMPMAP_UV " + t.bumpMapUv : "",
    t.normalMapUv ? "#define NORMALMAP_UV " + t.normalMapUv : "",
    t.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + t.displacementMapUv : "",
    t.metalnessMapUv ? "#define METALNESSMAP_UV " + t.metalnessMapUv : "",
    t.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + t.roughnessMapUv : "",
    t.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + t.anisotropyMapUv : "",
    t.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + t.clearcoatMapUv : "",
    t.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + t.clearcoatNormalMapUv : "",
    t.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + t.clearcoatRoughnessMapUv : "",
    t.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + t.iridescenceMapUv : "",
    t.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + t.iridescenceThicknessMapUv : "",
    t.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + t.sheenColorMapUv : "",
    t.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + t.sheenRoughnessMapUv : "",
    t.specularMapUv ? "#define SPECULARMAP_UV " + t.specularMapUv : "",
    t.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + t.specularColorMapUv : "",
    t.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + t.specularIntensityMapUv : "",
    t.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + t.transmissionMapUv : "",
    t.thicknessMapUv ? "#define THICKNESSMAP_UV " + t.thicknessMapUv : "",
    //
    t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "",
    t.vertexColors ? "#define USE_COLOR" : "",
    t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    t.vertexUv1s ? "#define USE_UV1" : "",
    t.vertexUv2s ? "#define USE_UV2" : "",
    t.vertexUv3s ? "#define USE_UV3" : "",
    t.pointsUvs ? "#define USE_POINTS_UV" : "",
    t.flatShading ? "#define FLAT_SHADED" : "",
    t.skinning ? "#define USE_SKINNING" : "",
    t.morphTargets ? "#define USE_MORPHTARGETS" : "",
    t.morphNormals && t.flatShading === !1 ? "#define USE_MORPHNORMALS" : "",
    t.morphColors ? "#define USE_MORPHCOLORS" : "",
    t.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + t.morphTextureStride : "",
    t.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + t.morphTargetsCount : "",
    t.doubleSided ? "#define DOUBLE_SIDED" : "",
    t.flipSided ? "#define FLIP_SIDED" : "",
    t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    t.shadowMapEnabled ? "#define " + l : "",
    t.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
    t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    t.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
    "uniform mat4 modelMatrix;",
    "uniform mat4 modelViewMatrix;",
    "uniform mat4 projectionMatrix;",
    "uniform mat4 viewMatrix;",
    "uniform mat3 normalMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    "#ifdef USE_INSTANCING",
    "	attribute mat4 instanceMatrix;",
    "#endif",
    "#ifdef USE_INSTANCING_COLOR",
    "	attribute vec3 instanceColor;",
    "#endif",
    "#ifdef USE_INSTANCING_MORPH",
    "	uniform sampler2D morphTexture;",
    "#endif",
    "attribute vec3 position;",
    "attribute vec3 normal;",
    "attribute vec2 uv;",
    "#ifdef USE_UV1",
    "	attribute vec2 uv1;",
    "#endif",
    "#ifdef USE_UV2",
    "	attribute vec2 uv2;",
    "#endif",
    "#ifdef USE_UV3",
    "	attribute vec2 uv3;",
    "#endif",
    "#ifdef USE_TANGENT",
    "	attribute vec4 tangent;",
    "#endif",
    "#if defined( USE_COLOR_ALPHA )",
    "	attribute vec4 color;",
    "#elif defined( USE_COLOR )",
    "	attribute vec3 color;",
    "#endif",
    "#ifdef USE_SKINNING",
    "	attribute vec4 skinIndex;",
    "	attribute vec4 skinWeight;",
    "#endif",
    `
`
  ].filter(Br).join(`
`), h = [
    Uc(t),
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    _,
    t.useFog && t.fog ? "#define USE_FOG" : "",
    t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "",
    t.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
    t.map ? "#define USE_MAP" : "",
    t.matcap ? "#define USE_MATCAP" : "",
    t.envMap ? "#define USE_ENVMAP" : "",
    t.envMap ? "#define " + d : "",
    t.envMap ? "#define " + u : "",
    t.envMap ? "#define " + p : "",
    f ? "#define CUBEUV_TEXEL_WIDTH " + f.texelWidth : "",
    f ? "#define CUBEUV_TEXEL_HEIGHT " + f.texelHeight : "",
    f ? "#define CUBEUV_MAX_MIP " + f.maxMip + ".0" : "",
    t.lightMap ? "#define USE_LIGHTMAP" : "",
    t.aoMap ? "#define USE_AOMAP" : "",
    t.bumpMap ? "#define USE_BUMPMAP" : "",
    t.normalMap ? "#define USE_NORMALMAP" : "",
    t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    t.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    t.anisotropy ? "#define USE_ANISOTROPY" : "",
    t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    t.clearcoat ? "#define USE_CLEARCOAT" : "",
    t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    t.dispersion ? "#define USE_DISPERSION" : "",
    t.iridescence ? "#define USE_IRIDESCENCE" : "",
    t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    t.specularMap ? "#define USE_SPECULARMAP" : "",
    t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    t.metalnessMap ? "#define USE_METALNESSMAP" : "",
    t.alphaMap ? "#define USE_ALPHAMAP" : "",
    t.alphaTest ? "#define USE_ALPHATEST" : "",
    t.alphaHash ? "#define USE_ALPHAHASH" : "",
    t.sheen ? "#define USE_SHEEN" : "",
    t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    t.transmission ? "#define USE_TRANSMISSION" : "",
    t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    t.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "",
    t.vertexColors || t.instancingColor || t.batchingColor ? "#define USE_COLOR" : "",
    t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    t.vertexUv1s ? "#define USE_UV1" : "",
    t.vertexUv2s ? "#define USE_UV2" : "",
    t.vertexUv3s ? "#define USE_UV3" : "",
    t.pointsUvs ? "#define USE_POINTS_UV" : "",
    t.gradientMap ? "#define USE_GRADIENTMAP" : "",
    t.flatShading ? "#define FLAT_SHADED" : "",
    t.doubleSided ? "#define DOUBLE_SIDED" : "",
    t.flipSided ? "#define FLIP_SIDED" : "",
    t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    t.shadowMapEnabled ? "#define " + l : "",
    t.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
    t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    t.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
    t.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
    "uniform mat4 viewMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    t.toneMapping !== ui ? "#define TONE_MAPPING" : "",
    t.toneMapping !== ui ? st.tonemapping_pars_fragment : "",
    // this code is required here because it is used by the toneMapping() function defined below
    t.toneMapping !== ui ? Cg("toneMapping", t.toneMapping) : "",
    t.dithering ? "#define DITHERING" : "",
    t.opaque ? "#define OPAQUE" : "",
    st.colorspace_pars_fragment,
    // this code is required here because it is used by the various encoding/decoding function defined below
    Rg("linearToOutputTexel", t.outputColorSpace),
    t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "",
    `
`
  ].filter(Br).join(`
`)), a = no(a), a = Nc(a, t), a = Ic(a, t), o = no(o), o = Nc(o, t), o = Ic(o, t), a = Dc(a), o = Dc(o), t.isRawShaderMaterial !== !0 && (M = `#version 300 es
`, c = [
    m,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + c, h = [
    "#define varying in",
    t.glslVersion === Zl ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    t.glslVersion === Zl ? "" : "#define gl_FragColor pc_fragColor",
    "#define gl_FragDepthEXT gl_FragDepth",
    "#define texture2D texture",
    "#define textureCube texture",
    "#define texture2DProj textureProj",
    "#define texture2DLodEXT textureLod",
    "#define texture2DProjLodEXT textureProjLod",
    "#define textureCubeLodEXT textureLod",
    "#define texture2DGradEXT textureGrad",
    "#define texture2DProjGradEXT textureProjGrad",
    "#define textureCubeGradEXT textureGrad"
  ].join(`
`) + `
` + h);
  const y = M + c + a, w = M + h + o, I = Pc(r, r.VERTEX_SHADER, y), R = Pc(r, r.FRAGMENT_SHADER, w);
  r.attachShader(x, I), r.attachShader(x, R), t.index0AttributeName !== void 0 ? r.bindAttribLocation(x, 0, t.index0AttributeName) : t.morphTargets === !0 && r.bindAttribLocation(x, 0, "position"), r.linkProgram(x);
  function C(L) {
    if (i.debug.checkShaderErrors) {
      const k = r.getProgramInfoLog(x).trim(), V = r.getShaderInfoLog(I).trim(), W = r.getShaderInfoLog(R).trim();
      let Q = !0, j = !0;
      if (r.getProgramParameter(x, r.LINK_STATUS) === !1)
        if (Q = !1, typeof i.debug.onShaderError == "function")
          i.debug.onShaderError(r, x, I, R);
        else {
          const re = Lc(r, I, "vertex"), K = Lc(r, R, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " + r.getError() + " - VALIDATE_STATUS " + r.getProgramParameter(x, r.VALIDATE_STATUS) + `

Material Name: ` + L.name + `
Material Type: ` + L.type + `

Program Info Log: ` + k + `
` + re + `
` + K
          );
        }
      else k !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", k) : (V === "" || W === "") && (j = !1);
      j && (L.diagnostics = {
        runnable: Q,
        programLog: k,
        vertexShader: {
          log: V,
          prefix: c
        },
        fragmentShader: {
          log: W,
          prefix: h
        }
      });
    }
    r.deleteShader(I), r.deleteShader(R), U = new Cs(r, x), A = Ng(r, x);
  }
  let U;
  this.getUniforms = function() {
    return U === void 0 && C(this), U;
  };
  let A;
  this.getAttributes = function() {
    return A === void 0 && C(this), A;
  };
  let v = t.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return v === !1 && (v = r.getProgramParameter(x, bg)), v;
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), r.deleteProgram(x), this.program = void 0;
  }, this.type = t.shaderType, this.name = t.shaderName, this.id = Tg++, this.cacheKey = e, this.usedTimes = 1, this.program = x, this.vertexShader = I, this.fragmentShader = R, this;
}
let Wg = 0;
class Xg {
  constructor() {
    this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
  }
  update(e) {
    const t = e.vertexShader, n = e.fragmentShader, r = this._getShaderStage(t), s = this._getShaderStage(n), a = this._getShaderCacheForMaterial(e);
    return a.has(r) === !1 && (a.add(r), r.usedTimes++), a.has(s) === !1 && (a.add(s), s.usedTimes++), this;
  }
  remove(e) {
    const t = this.materialCache.get(e);
    for (const n of t)
      n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
    return this.materialCache.delete(e), this;
  }
  getVertexShaderID(e) {
    return this._getShaderStage(e.vertexShader).id;
  }
  getFragmentShaderID(e) {
    return this._getShaderStage(e.fragmentShader).id;
  }
  dispose() {
    this.shaderCache.clear(), this.materialCache.clear();
  }
  _getShaderCacheForMaterial(e) {
    const t = this.materialCache;
    let n = t.get(e);
    return n === void 0 && (n = /* @__PURE__ */ new Set(), t.set(e, n)), n;
  }
  _getShaderStage(e) {
    const t = this.shaderCache;
    let n = t.get(e);
    return n === void 0 && (n = new Yg(e), t.set(e, n)), n;
  }
}
class Yg {
  constructor(e) {
    this.id = Wg++, this.code = e, this.usedTimes = 0;
  }
}
function qg(i, e, t, n, r, s, a) {
  const o = new co(), l = new Xg(), d = /* @__PURE__ */ new Set(), u = [], p = r.logarithmicDepthBuffer, f = r.vertexTextures;
  let m = r.precision;
  const _ = {
    MeshDepthMaterial: "depth",
    MeshDistanceMaterial: "distanceRGBA",
    MeshNormalMaterial: "normal",
    MeshBasicMaterial: "basic",
    MeshLambertMaterial: "lambert",
    MeshPhongMaterial: "phong",
    MeshToonMaterial: "toon",
    MeshStandardMaterial: "physical",
    MeshPhysicalMaterial: "physical",
    MeshMatcapMaterial: "matcap",
    LineBasicMaterial: "basic",
    LineDashedMaterial: "dashed",
    PointsMaterial: "points",
    ShadowMaterial: "shadow",
    SpriteMaterial: "sprite"
  };
  function x(A) {
    return d.add(A), A === 0 ? "uv" : `uv${A}`;
  }
  function c(A, v, L, k, V) {
    const W = k.fog, Q = V.geometry, j = A.isMeshStandardMaterial ? k.environment : null, re = (A.isMeshStandardMaterial ? t : e).get(A.envMap || j), K = re && re.mapping === ks ? re.image.height : null, de = _[A.type];
    A.precision !== null && (m = r.getMaxPrecision(A.precision), m !== A.precision && console.warn("THREE.WebGLProgram.getParameters:", A.precision, "not supported, using", m, "instead."));
    const _e = Q.morphAttributes.position || Q.morphAttributes.normal || Q.morphAttributes.color, Ee = _e !== void 0 ? _e.length : 0;
    let Je = 0;
    Q.morphAttributes.position !== void 0 && (Je = 1), Q.morphAttributes.normal !== void 0 && (Je = 2), Q.morphAttributes.color !== void 0 && (Je = 3);
    let lt, J, le, be;
    if (de) {
      const ct = zn[de];
      lt = ct.vertexShader, J = ct.fragmentShader;
    } else
      lt = A.vertexShader, J = A.fragmentShader, l.update(A), le = l.getVertexShaderID(A), be = l.getFragmentShaderID(A);
    const ue = i.getRenderTarget(), $e = V.isInstancedMesh === !0, Fe = V.isBatchedMesh === !0, et = !!A.map, D = !!A.matcap, nt = !!re, it = !!A.aoMap, vt = !!A.lightMap, De = !!A.bumpMap, Ye = !!A.normalMap, Ze = !!A.displacementMap, qe = !!A.emissiveMap, Tt = !!A.metalnessMap, P = !!A.roughnessMap, S = A.anisotropy > 0, Y = A.clearcoat > 0, se = A.dispersion > 0, ae = A.iridescence > 0, ie = A.sheen > 0, Re = A.transmission > 0, fe = S && !!A.anisotropyMap, pe = Y && !!A.clearcoatMap, je = Y && !!A.clearcoatNormalMap, ce = Y && !!A.clearcoatRoughnessMap, Le = ae && !!A.iridescenceMap, rt = ae && !!A.iridescenceThicknessMap, Ue = ie && !!A.sheenColorMap, xe = ie && !!A.sheenRoughnessMap, Ge = !!A.specularMap, He = !!A.specularColorMap, xt = !!A.specularIntensityMap, g = Re && !!A.transmissionMap, q = Re && !!A.thicknessMap, z = !!A.gradientMap, $ = !!A.alphaMap, ne = A.alphaTest > 0, Ce = !!A.alphaHash, Be = !!A.extensions;
    let At = ui;
    A.toneMapped && (ue === null || ue.isXRRenderTarget === !0) && (At = i.toneMapping);
    const Lt = {
      shaderID: de,
      shaderType: A.type,
      shaderName: A.name,
      vertexShader: lt,
      fragmentShader: J,
      defines: A.defines,
      customVertexShaderID: le,
      customFragmentShaderID: be,
      isRawShaderMaterial: A.isRawShaderMaterial === !0,
      glslVersion: A.glslVersion,
      precision: m,
      batching: Fe,
      batchingColor: Fe && V._colorsTexture !== null,
      instancing: $e,
      instancingColor: $e && V.instanceColor !== null,
      instancingMorph: $e && V.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace: ue === null ? i.outputColorSpace : ue.isXRRenderTarget === !0 ? ue.texture.colorSpace : gi,
      alphaToCoverage: !!A.alphaToCoverage,
      map: et,
      matcap: D,
      envMap: nt,
      envMapMode: nt && re.mapping,
      envMapCubeUVHeight: K,
      aoMap: it,
      lightMap: vt,
      bumpMap: De,
      normalMap: Ye,
      displacementMap: f && Ze,
      emissiveMap: qe,
      normalMapObjectSpace: Ye && A.normalMapType === tu,
      normalMapTangentSpace: Ye && A.normalMapType === pd,
      metalnessMap: Tt,
      roughnessMap: P,
      anisotropy: S,
      anisotropyMap: fe,
      clearcoat: Y,
      clearcoatMap: pe,
      clearcoatNormalMap: je,
      clearcoatRoughnessMap: ce,
      dispersion: se,
      iridescence: ae,
      iridescenceMap: Le,
      iridescenceThicknessMap: rt,
      sheen: ie,
      sheenColorMap: Ue,
      sheenRoughnessMap: xe,
      specularMap: Ge,
      specularColorMap: He,
      specularIntensityMap: xt,
      transmission: Re,
      transmissionMap: g,
      thicknessMap: q,
      gradientMap: z,
      opaque: A.transparent === !1 && A.blending === fr && A.alphaToCoverage === !1,
      alphaMap: $,
      alphaTest: ne,
      alphaHash: Ce,
      combine: A.combine,
      //
      mapUv: et && x(A.map.channel),
      aoMapUv: it && x(A.aoMap.channel),
      lightMapUv: vt && x(A.lightMap.channel),
      bumpMapUv: De && x(A.bumpMap.channel),
      normalMapUv: Ye && x(A.normalMap.channel),
      displacementMapUv: Ze && x(A.displacementMap.channel),
      emissiveMapUv: qe && x(A.emissiveMap.channel),
      metalnessMapUv: Tt && x(A.metalnessMap.channel),
      roughnessMapUv: P && x(A.roughnessMap.channel),
      anisotropyMapUv: fe && x(A.anisotropyMap.channel),
      clearcoatMapUv: pe && x(A.clearcoatMap.channel),
      clearcoatNormalMapUv: je && x(A.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: ce && x(A.clearcoatRoughnessMap.channel),
      iridescenceMapUv: Le && x(A.iridescenceMap.channel),
      iridescenceThicknessMapUv: rt && x(A.iridescenceThicknessMap.channel),
      sheenColorMapUv: Ue && x(A.sheenColorMap.channel),
      sheenRoughnessMapUv: xe && x(A.sheenRoughnessMap.channel),
      specularMapUv: Ge && x(A.specularMap.channel),
      specularColorMapUv: He && x(A.specularColorMap.channel),
      specularIntensityMapUv: xt && x(A.specularIntensityMap.channel),
      transmissionMapUv: g && x(A.transmissionMap.channel),
      thicknessMapUv: q && x(A.thicknessMap.channel),
      alphaMapUv: $ && x(A.alphaMap.channel),
      //
      vertexTangents: !!Q.attributes.tangent && (Ye || S),
      vertexColors: A.vertexColors,
      vertexAlphas: A.vertexColors === !0 && !!Q.attributes.color && Q.attributes.color.itemSize === 4,
      pointsUvs: V.isPoints === !0 && !!Q.attributes.uv && (et || $),
      fog: !!W,
      useFog: A.fog === !0,
      fogExp2: !!W && W.isFogExp2,
      flatShading: A.flatShading === !0,
      sizeAttenuation: A.sizeAttenuation === !0,
      logarithmicDepthBuffer: p,
      skinning: V.isSkinnedMesh === !0,
      morphTargets: Q.morphAttributes.position !== void 0,
      morphNormals: Q.morphAttributes.normal !== void 0,
      morphColors: Q.morphAttributes.color !== void 0,
      morphTargetsCount: Ee,
      morphTextureStride: Je,
      numDirLights: v.directional.length,
      numPointLights: v.point.length,
      numSpotLights: v.spot.length,
      numSpotLightMaps: v.spotLightMap.length,
      numRectAreaLights: v.rectArea.length,
      numHemiLights: v.hemi.length,
      numDirLightShadows: v.directionalShadowMap.length,
      numPointLightShadows: v.pointShadowMap.length,
      numSpotLightShadows: v.spotShadowMap.length,
      numSpotLightShadowsWithMaps: v.numSpotLightShadowsWithMaps,
      numLightProbes: v.numLightProbes,
      numClippingPlanes: a.numPlanes,
      numClipIntersection: a.numIntersection,
      dithering: A.dithering,
      shadowMapEnabled: i.shadowMap.enabled && L.length > 0,
      shadowMapType: i.shadowMap.type,
      toneMapping: At,
      decodeVideoTexture: et && A.map.isVideoTexture === !0 && _t.getTransfer(A.map.colorSpace) === Pt,
      premultipliedAlpha: A.premultipliedAlpha,
      doubleSided: A.side === kn,
      flipSided: A.side === _n,
      useDepthPacking: A.depthPacking >= 0,
      depthPacking: A.depthPacking || 0,
      index0AttributeName: A.index0AttributeName,
      extensionClipCullDistance: Be && A.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: Be && A.extensions.multiDraw === !0 && n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: A.customProgramCacheKey()
    };
    return Lt.vertexUv1s = d.has(1), Lt.vertexUv2s = d.has(2), Lt.vertexUv3s = d.has(3), d.clear(), Lt;
  }
  function h(A) {
    const v = [];
    if (A.shaderID ? v.push(A.shaderID) : (v.push(A.customVertexShaderID), v.push(A.customFragmentShaderID)), A.defines !== void 0)
      for (const L in A.defines)
        v.push(L), v.push(A.defines[L]);
    return A.isRawShaderMaterial === !1 && (M(v, A), y(v, A), v.push(i.outputColorSpace)), v.push(A.customProgramCacheKey), v.join();
  }
  function M(A, v) {
    A.push(v.precision), A.push(v.outputColorSpace), A.push(v.envMapMode), A.push(v.envMapCubeUVHeight), A.push(v.mapUv), A.push(v.alphaMapUv), A.push(v.lightMapUv), A.push(v.aoMapUv), A.push(v.bumpMapUv), A.push(v.normalMapUv), A.push(v.displacementMapUv), A.push(v.emissiveMapUv), A.push(v.metalnessMapUv), A.push(v.roughnessMapUv), A.push(v.anisotropyMapUv), A.push(v.clearcoatMapUv), A.push(v.clearcoatNormalMapUv), A.push(v.clearcoatRoughnessMapUv), A.push(v.iridescenceMapUv), A.push(v.iridescenceThicknessMapUv), A.push(v.sheenColorMapUv), A.push(v.sheenRoughnessMapUv), A.push(v.specularMapUv), A.push(v.specularColorMapUv), A.push(v.specularIntensityMapUv), A.push(v.transmissionMapUv), A.push(v.thicknessMapUv), A.push(v.combine), A.push(v.fogExp2), A.push(v.sizeAttenuation), A.push(v.morphTargetsCount), A.push(v.morphAttributeCount), A.push(v.numDirLights), A.push(v.numPointLights), A.push(v.numSpotLights), A.push(v.numSpotLightMaps), A.push(v.numHemiLights), A.push(v.numRectAreaLights), A.push(v.numDirLightShadows), A.push(v.numPointLightShadows), A.push(v.numSpotLightShadows), A.push(v.numSpotLightShadowsWithMaps), A.push(v.numLightProbes), A.push(v.shadowMapType), A.push(v.toneMapping), A.push(v.numClippingPlanes), A.push(v.numClipIntersection), A.push(v.depthPacking);
  }
  function y(A, v) {
    o.disableAll(), v.supportsVertexTextures && o.enable(0), v.instancing && o.enable(1), v.instancingColor && o.enable(2), v.instancingMorph && o.enable(3), v.matcap && o.enable(4), v.envMap && o.enable(5), v.normalMapObjectSpace && o.enable(6), v.normalMapTangentSpace && o.enable(7), v.clearcoat && o.enable(8), v.iridescence && o.enable(9), v.alphaTest && o.enable(10), v.vertexColors && o.enable(11), v.vertexAlphas && o.enable(12), v.vertexUv1s && o.enable(13), v.vertexUv2s && o.enable(14), v.vertexUv3s && o.enable(15), v.vertexTangents && o.enable(16), v.anisotropy && o.enable(17), v.alphaHash && o.enable(18), v.batching && o.enable(19), v.dispersion && o.enable(20), v.batchingColor && o.enable(21), A.push(o.mask), o.disableAll(), v.fog && o.enable(0), v.useFog && o.enable(1), v.flatShading && o.enable(2), v.logarithmicDepthBuffer && o.enable(3), v.skinning && o.enable(4), v.morphTargets && o.enable(5), v.morphNormals && o.enable(6), v.morphColors && o.enable(7), v.premultipliedAlpha && o.enable(8), v.shadowMapEnabled && o.enable(9), v.doubleSided && o.enable(10), v.flipSided && o.enable(11), v.useDepthPacking && o.enable(12), v.dithering && o.enable(13), v.transmission && o.enable(14), v.sheen && o.enable(15), v.opaque && o.enable(16), v.pointsUvs && o.enable(17), v.decodeVideoTexture && o.enable(18), v.alphaToCoverage && o.enable(19), A.push(o.mask);
  }
  function w(A) {
    const v = _[A.type];
    let L;
    if (v) {
      const k = zn[v];
      L = Pu.clone(k.uniforms);
    } else
      L = A.uniforms;
    return L;
  }
  function I(A, v) {
    let L;
    for (let k = 0, V = u.length; k < V; k++) {
      const W = u[k];
      if (W.cacheKey === v) {
        L = W, ++L.usedTimes;
        break;
      }
    }
    return L === void 0 && (L = new Gg(i, v, A, s), u.push(L)), L;
  }
  function R(A) {
    if (--A.usedTimes === 0) {
      const v = u.indexOf(A);
      u[v] = u[u.length - 1], u.pop(), A.destroy();
    }
  }
  function C(A) {
    l.remove(A);
  }
  function U() {
    l.dispose();
  }
  return {
    getParameters: c,
    getProgramCacheKey: h,
    getUniforms: w,
    acquireProgram: I,
    releaseProgram: R,
    releaseShaderCache: C,
    // Exposed for resource monitoring & error feedback via renderer.info:
    programs: u,
    dispose: U
  };
}
function jg() {
  let i = /* @__PURE__ */ new WeakMap();
  function e(s) {
    let a = i.get(s);
    return a === void 0 && (a = {}, i.set(s, a)), a;
  }
  function t(s) {
    i.delete(s);
  }
  function n(s, a, o) {
    i.get(s)[a] = o;
  }
  function r() {
    i = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    remove: t,
    update: n,
    dispose: r
  };
}
function Kg(i, e) {
  return i.groupOrder !== e.groupOrder ? i.groupOrder - e.groupOrder : i.renderOrder !== e.renderOrder ? i.renderOrder - e.renderOrder : i.material.id !== e.material.id ? i.material.id - e.material.id : i.z !== e.z ? i.z - e.z : i.id - e.id;
}
function Oc(i, e) {
  return i.groupOrder !== e.groupOrder ? i.groupOrder - e.groupOrder : i.renderOrder !== e.renderOrder ? i.renderOrder - e.renderOrder : i.z !== e.z ? e.z - i.z : i.id - e.id;
}
function Fc() {
  const i = [];
  let e = 0;
  const t = [], n = [], r = [];
  function s() {
    e = 0, t.length = 0, n.length = 0, r.length = 0;
  }
  function a(p, f, m, _, x, c) {
    let h = i[e];
    return h === void 0 ? (h = {
      id: p.id,
      object: p,
      geometry: f,
      material: m,
      groupOrder: _,
      renderOrder: p.renderOrder,
      z: x,
      group: c
    }, i[e] = h) : (h.id = p.id, h.object = p, h.geometry = f, h.material = m, h.groupOrder = _, h.renderOrder = p.renderOrder, h.z = x, h.group = c), e++, h;
  }
  function o(p, f, m, _, x, c) {
    const h = a(p, f, m, _, x, c);
    m.transmission > 0 ? n.push(h) : m.transparent === !0 ? r.push(h) : t.push(h);
  }
  function l(p, f, m, _, x, c) {
    const h = a(p, f, m, _, x, c);
    m.transmission > 0 ? n.unshift(h) : m.transparent === !0 ? r.unshift(h) : t.unshift(h);
  }
  function d(p, f) {
    t.length > 1 && t.sort(p || Kg), n.length > 1 && n.sort(f || Oc), r.length > 1 && r.sort(f || Oc);
  }
  function u() {
    for (let p = e, f = i.length; p < f; p++) {
      const m = i[p];
      if (m.id === null) break;
      m.id = null, m.object = null, m.geometry = null, m.material = null, m.group = null;
    }
  }
  return {
    opaque: t,
    transmissive: n,
    transparent: r,
    init: s,
    push: o,
    unshift: l,
    finish: u,
    sort: d
  };
}
function $g() {
  let i = /* @__PURE__ */ new WeakMap();
  function e(n, r) {
    const s = i.get(n);
    let a;
    return s === void 0 ? (a = new Fc(), i.set(n, [a])) : r >= s.length ? (a = new Fc(), s.push(a)) : a = s[r], a;
  }
  function t() {
    i = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    dispose: t
  };
}
function Zg() {
  const i = {};
  return {
    get: function(e) {
      if (i[e.id] !== void 0)
        return i[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = {
            direction: new N(),
            color: new ut()
          };
          break;
        case "SpotLight":
          t = {
            position: new N(),
            direction: new N(),
            color: new ut(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          t = {
            position: new N(),
            color: new ut(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          t = {
            direction: new N(),
            skyColor: new ut(),
            groundColor: new ut()
          };
          break;
        case "RectAreaLight":
          t = {
            color: new ut(),
            position: new N(),
            halfWidth: new N(),
            halfHeight: new N()
          };
          break;
      }
      return i[e.id] = t, t;
    }
  };
}
function Qg() {
  const i = {};
  return {
    get: function(e) {
      if (i[e.id] !== void 0)
        return i[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = {
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Xe()
          };
          break;
        case "SpotLight":
          t = {
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Xe()
          };
          break;
        case "PointLight":
          t = {
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Xe(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break;
      }
      return i[e.id] = t, t;
    }
  };
}
let Jg = 0;
function e_(i, e) {
  return (e.castShadow ? 2 : 0) - (i.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (i.map ? 1 : 0);
}
function t_(i) {
  const e = new Zg(), t = Qg(), n = {
    version: 0,
    hash: {
      directionalLength: -1,
      pointLength: -1,
      spotLength: -1,
      rectAreaLength: -1,
      hemiLength: -1,
      numDirectionalShadows: -1,
      numPointShadows: -1,
      numSpotShadows: -1,
      numSpotMaps: -1,
      numLightProbes: -1
    },
    ambient: [0, 0, 0],
    probe: [],
    directional: [],
    directionalShadow: [],
    directionalShadowMap: [],
    directionalShadowMatrix: [],
    spot: [],
    spotLightMap: [],
    spotShadow: [],
    spotShadowMap: [],
    spotLightMatrix: [],
    rectArea: [],
    rectAreaLTC1: null,
    rectAreaLTC2: null,
    point: [],
    pointShadow: [],
    pointShadowMap: [],
    pointShadowMatrix: [],
    hemi: [],
    numSpotLightShadowsWithMaps: 0,
    numLightProbes: 0
  };
  for (let d = 0; d < 9; d++) n.probe.push(new N());
  const r = new N(), s = new yt(), a = new yt();
  function o(d) {
    let u = 0, p = 0, f = 0;
    for (let A = 0; A < 9; A++) n.probe[A].set(0, 0, 0);
    let m = 0, _ = 0, x = 0, c = 0, h = 0, M = 0, y = 0, w = 0, I = 0, R = 0, C = 0;
    d.sort(e_);
    for (let A = 0, v = d.length; A < v; A++) {
      const L = d[A], k = L.color, V = L.intensity, W = L.distance, Q = L.shadow && L.shadow.map ? L.shadow.map.texture : null;
      if (L.isAmbientLight)
        u += k.r * V, p += k.g * V, f += k.b * V;
      else if (L.isLightProbe) {
        for (let j = 0; j < 9; j++)
          n.probe[j].addScaledVector(L.sh.coefficients[j], V);
        C++;
      } else if (L.isDirectionalLight) {
        const j = e.get(L);
        if (j.color.copy(L.color).multiplyScalar(L.intensity), L.castShadow) {
          const re = L.shadow, K = t.get(L);
          K.shadowBias = re.bias, K.shadowNormalBias = re.normalBias, K.shadowRadius = re.radius, K.shadowMapSize = re.mapSize, n.directionalShadow[m] = K, n.directionalShadowMap[m] = Q, n.directionalShadowMatrix[m] = L.shadow.matrix, M++;
        }
        n.directional[m] = j, m++;
      } else if (L.isSpotLight) {
        const j = e.get(L);
        j.position.setFromMatrixPosition(L.matrixWorld), j.color.copy(k).multiplyScalar(V), j.distance = W, j.coneCos = Math.cos(L.angle), j.penumbraCos = Math.cos(L.angle * (1 - L.penumbra)), j.decay = L.decay, n.spot[x] = j;
        const re = L.shadow;
        if (L.map && (n.spotLightMap[I] = L.map, I++, re.updateMatrices(L), L.castShadow && R++), n.spotLightMatrix[x] = re.matrix, L.castShadow) {
          const K = t.get(L);
          K.shadowBias = re.bias, K.shadowNormalBias = re.normalBias, K.shadowRadius = re.radius, K.shadowMapSize = re.mapSize, n.spotShadow[x] = K, n.spotShadowMap[x] = Q, w++;
        }
        x++;
      } else if (L.isRectAreaLight) {
        const j = e.get(L);
        j.color.copy(k).multiplyScalar(V), j.halfWidth.set(L.width * 0.5, 0, 0), j.halfHeight.set(0, L.height * 0.5, 0), n.rectArea[c] = j, c++;
      } else if (L.isPointLight) {
        const j = e.get(L);
        if (j.color.copy(L.color).multiplyScalar(L.intensity), j.distance = L.distance, j.decay = L.decay, L.castShadow) {
          const re = L.shadow, K = t.get(L);
          K.shadowBias = re.bias, K.shadowNormalBias = re.normalBias, K.shadowRadius = re.radius, K.shadowMapSize = re.mapSize, K.shadowCameraNear = re.camera.near, K.shadowCameraFar = re.camera.far, n.pointShadow[_] = K, n.pointShadowMap[_] = Q, n.pointShadowMatrix[_] = L.shadow.matrix, y++;
        }
        n.point[_] = j, _++;
      } else if (L.isHemisphereLight) {
        const j = e.get(L);
        j.skyColor.copy(L.color).multiplyScalar(V), j.groundColor.copy(L.groundColor).multiplyScalar(V), n.hemi[h] = j, h++;
      }
    }
    c > 0 && (i.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = Se.LTC_FLOAT_1, n.rectAreaLTC2 = Se.LTC_FLOAT_2) : (n.rectAreaLTC1 = Se.LTC_HALF_1, n.rectAreaLTC2 = Se.LTC_HALF_2)), n.ambient[0] = u, n.ambient[1] = p, n.ambient[2] = f;
    const U = n.hash;
    (U.directionalLength !== m || U.pointLength !== _ || U.spotLength !== x || U.rectAreaLength !== c || U.hemiLength !== h || U.numDirectionalShadows !== M || U.numPointShadows !== y || U.numSpotShadows !== w || U.numSpotMaps !== I || U.numLightProbes !== C) && (n.directional.length = m, n.spot.length = x, n.rectArea.length = c, n.point.length = _, n.hemi.length = h, n.directionalShadow.length = M, n.directionalShadowMap.length = M, n.pointShadow.length = y, n.pointShadowMap.length = y, n.spotShadow.length = w, n.spotShadowMap.length = w, n.directionalShadowMatrix.length = M, n.pointShadowMatrix.length = y, n.spotLightMatrix.length = w + I - R, n.spotLightMap.length = I, n.numSpotLightShadowsWithMaps = R, n.numLightProbes = C, U.directionalLength = m, U.pointLength = _, U.spotLength = x, U.rectAreaLength = c, U.hemiLength = h, U.numDirectionalShadows = M, U.numPointShadows = y, U.numSpotShadows = w, U.numSpotMaps = I, U.numLightProbes = C, n.version = Jg++);
  }
  function l(d, u) {
    let p = 0, f = 0, m = 0, _ = 0, x = 0;
    const c = u.matrixWorldInverse;
    for (let h = 0, M = d.length; h < M; h++) {
      const y = d[h];
      if (y.isDirectionalLight) {
        const w = n.directional[p];
        w.direction.setFromMatrixPosition(y.matrixWorld), r.setFromMatrixPosition(y.target.matrixWorld), w.direction.sub(r), w.direction.transformDirection(c), p++;
      } else if (y.isSpotLight) {
        const w = n.spot[m];
        w.position.setFromMatrixPosition(y.matrixWorld), w.position.applyMatrix4(c), w.direction.setFromMatrixPosition(y.matrixWorld), r.setFromMatrixPosition(y.target.matrixWorld), w.direction.sub(r), w.direction.transformDirection(c), m++;
      } else if (y.isRectAreaLight) {
        const w = n.rectArea[_];
        w.position.setFromMatrixPosition(y.matrixWorld), w.position.applyMatrix4(c), a.identity(), s.copy(y.matrixWorld), s.premultiply(c), a.extractRotation(s), w.halfWidth.set(y.width * 0.5, 0, 0), w.halfHeight.set(0, y.height * 0.5, 0), w.halfWidth.applyMatrix4(a), w.halfHeight.applyMatrix4(a), _++;
      } else if (y.isPointLight) {
        const w = n.point[f];
        w.position.setFromMatrixPosition(y.matrixWorld), w.position.applyMatrix4(c), f++;
      } else if (y.isHemisphereLight) {
        const w = n.hemi[x];
        w.direction.setFromMatrixPosition(y.matrixWorld), w.direction.transformDirection(c), x++;
      }
    }
  }
  return {
    setup: o,
    setupView: l,
    state: n
  };
}
function Bc(i) {
  const e = new t_(i), t = [], n = [];
  function r(u) {
    d.camera = u, t.length = 0, n.length = 0;
  }
  function s(u) {
    t.push(u);
  }
  function a(u) {
    n.push(u);
  }
  function o() {
    e.setup(t);
  }
  function l(u) {
    e.setupView(t, u);
  }
  const d = {
    lightsArray: t,
    shadowsArray: n,
    camera: null,
    lights: e,
    transmissionRenderTarget: {}
  };
  return {
    init: r,
    state: d,
    setupLights: o,
    setupLightsView: l,
    pushLight: s,
    pushShadow: a
  };
}
function n_(i) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(r, s = 0) {
    const a = e.get(r);
    let o;
    return a === void 0 ? (o = new Bc(i), e.set(r, [o])) : s >= a.length ? (o = new Bc(i), a.push(o)) : o = a[s], o;
  }
  function n() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: n
  };
}
class i_ extends Mr {
  constructor(e) {
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = Jh, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
  }
}
class r_ extends Mr {
  constructor(e) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
  }
}
const s_ = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, a_ = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;
function o_(i, e, t) {
  let n = new ho();
  const r = new Xe(), s = new Xe(), a = new en(), o = new i_({ depthPacking: eu }), l = new r_(), d = {}, u = t.maxTextureSize, p = { [fi]: _n, [_n]: fi, [kn]: kn }, f = new mi({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new Xe() },
      radius: { value: 4 }
    },
    vertexShader: s_,
    fragmentShader: a_
  }), m = f.clone();
  m.defines.HORIZONTAL_PASS = 1;
  const _ = new ln();
  _.setAttribute(
    "position",
    new Gn(
      new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
      3
    )
  );
  const x = new Te(_, f), c = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = ad;
  let h = this.type;
  this.render = function(R, C, U) {
    if (c.enabled === !1 || c.autoUpdate === !1 && c.needsUpdate === !1 || R.length === 0) return;
    const A = i.getRenderTarget(), v = i.getActiveCubeFace(), L = i.getActiveMipmapLevel(), k = i.state;
    k.setBlending(hi), k.buffers.color.setClear(1, 1, 1, 1), k.buffers.depth.setTest(!0), k.setScissorTest(!1);
    const V = h !== Zn && this.type === Zn, W = h === Zn && this.type !== Zn;
    for (let Q = 0, j = R.length; Q < j; Q++) {
      const re = R[Q], K = re.shadow;
      if (K === void 0) {
        console.warn("THREE.WebGLShadowMap:", re, "has no shadow.");
        continue;
      }
      if (K.autoUpdate === !1 && K.needsUpdate === !1) continue;
      r.copy(K.mapSize);
      const de = K.getFrameExtents();
      if (r.multiply(de), s.copy(K.mapSize), (r.x > u || r.y > u) && (r.x > u && (s.x = Math.floor(u / de.x), r.x = s.x * de.x, K.mapSize.x = s.x), r.y > u && (s.y = Math.floor(u / de.y), r.y = s.y * de.y, K.mapSize.y = s.y)), K.map === null || V === !0 || W === !0) {
        const Ee = this.type !== Zn ? { minFilter: wn, magFilter: wn } : {};
        K.map !== null && K.map.dispose(), K.map = new Di(r.x, r.y, Ee), K.map.texture.name = re.name + ".shadowMap", K.camera.updateProjectionMatrix();
      }
      i.setRenderTarget(K.map), i.clear();
      const _e = K.getViewportCount();
      for (let Ee = 0; Ee < _e; Ee++) {
        const Je = K.getViewport(Ee);
        a.set(
          s.x * Je.x,
          s.y * Je.y,
          s.x * Je.z,
          s.y * Je.w
        ), k.viewport(a), K.updateMatrices(re, Ee), n = K.getFrustum(), w(C, U, K.camera, re, this.type);
      }
      K.isPointLightShadow !== !0 && this.type === Zn && M(K, U), K.needsUpdate = !1;
    }
    h = this.type, c.needsUpdate = !1, i.setRenderTarget(A, v, L);
  };
  function M(R, C) {
    const U = e.update(x);
    f.defines.VSM_SAMPLES !== R.blurSamples && (f.defines.VSM_SAMPLES = R.blurSamples, m.defines.VSM_SAMPLES = R.blurSamples, f.needsUpdate = !0, m.needsUpdate = !0), R.mapPass === null && (R.mapPass = new Di(r.x, r.y)), f.uniforms.shadow_pass.value = R.map.texture, f.uniforms.resolution.value = R.mapSize, f.uniforms.radius.value = R.radius, i.setRenderTarget(R.mapPass), i.clear(), i.renderBufferDirect(C, null, U, f, x, null), m.uniforms.shadow_pass.value = R.mapPass.texture, m.uniforms.resolution.value = R.mapSize, m.uniforms.radius.value = R.radius, i.setRenderTarget(R.map), i.clear(), i.renderBufferDirect(C, null, U, m, x, null);
  }
  function y(R, C, U, A) {
    let v = null;
    const L = U.isPointLight === !0 ? R.customDistanceMaterial : R.customDepthMaterial;
    if (L !== void 0)
      v = L;
    else if (v = U.isPointLight === !0 ? l : o, i.localClippingEnabled && C.clipShadows === !0 && Array.isArray(C.clippingPlanes) && C.clippingPlanes.length !== 0 || C.displacementMap && C.displacementScale !== 0 || C.alphaMap && C.alphaTest > 0 || C.map && C.alphaTest > 0) {
      const k = v.uuid, V = C.uuid;
      let W = d[k];
      W === void 0 && (W = {}, d[k] = W);
      let Q = W[V];
      Q === void 0 && (Q = v.clone(), W[V] = Q, C.addEventListener("dispose", I)), v = Q;
    }
    if (v.visible = C.visible, v.wireframe = C.wireframe, A === Zn ? v.side = C.shadowSide !== null ? C.shadowSide : C.side : v.side = C.shadowSide !== null ? C.shadowSide : p[C.side], v.alphaMap = C.alphaMap, v.alphaTest = C.alphaTest, v.map = C.map, v.clipShadows = C.clipShadows, v.clippingPlanes = C.clippingPlanes, v.clipIntersection = C.clipIntersection, v.displacementMap = C.displacementMap, v.displacementScale = C.displacementScale, v.displacementBias = C.displacementBias, v.wireframeLinewidth = C.wireframeLinewidth, v.linewidth = C.linewidth, U.isPointLight === !0 && v.isMeshDistanceMaterial === !0) {
      const k = i.properties.get(v);
      k.light = U;
    }
    return v;
  }
  function w(R, C, U, A, v) {
    if (R.visible === !1) return;
    if (R.layers.test(C.layers) && (R.isMesh || R.isLine || R.isPoints) && (R.castShadow || R.receiveShadow && v === Zn) && (!R.frustumCulled || n.intersectsObject(R))) {
      R.modelViewMatrix.multiplyMatrices(U.matrixWorldInverse, R.matrixWorld);
      const V = e.update(R), W = R.material;
      if (Array.isArray(W)) {
        const Q = V.groups;
        for (let j = 0, re = Q.length; j < re; j++) {
          const K = Q[j], de = W[K.materialIndex];
          if (de && de.visible) {
            const _e = y(R, de, A, v);
            R.onBeforeShadow(i, R, C, U, V, _e, K), i.renderBufferDirect(U, null, V, _e, R, K), R.onAfterShadow(i, R, C, U, V, _e, K);
          }
        }
      } else if (W.visible) {
        const Q = y(R, W, A, v);
        R.onBeforeShadow(i, R, C, U, V, Q, null), i.renderBufferDirect(U, null, V, Q, R, null), R.onAfterShadow(i, R, C, U, V, Q, null);
      }
    }
    const k = R.children;
    for (let V = 0, W = k.length; V < W; V++)
      w(k[V], C, U, A, v);
  }
  function I(R) {
    R.target.removeEventListener("dispose", I);
    for (const U in d) {
      const A = d[U], v = R.target.uuid;
      v in A && (A[v].dispose(), delete A[v]);
    }
  }
}
function l_(i) {
  function e() {
    let g = !1;
    const q = new en();
    let z = null;
    const $ = new en(0, 0, 0, 0);
    return {
      setMask: function(ne) {
        z !== ne && !g && (i.colorMask(ne, ne, ne, ne), z = ne);
      },
      setLocked: function(ne) {
        g = ne;
      },
      setClear: function(ne, Ce, Be, At, Lt) {
        Lt === !0 && (ne *= At, Ce *= At, Be *= At), q.set(ne, Ce, Be, At), $.equals(q) === !1 && (i.clearColor(ne, Ce, Be, At), $.copy(q));
      },
      reset: function() {
        g = !1, z = null, $.set(-1, 0, 0, 0);
      }
    };
  }
  function t() {
    let g = !1, q = null, z = null, $ = null;
    return {
      setTest: function(ne) {
        ne ? be(i.DEPTH_TEST) : ue(i.DEPTH_TEST);
      },
      setMask: function(ne) {
        q !== ne && !g && (i.depthMask(ne), q = ne);
      },
      setFunc: function(ne) {
        if (z !== ne) {
          switch (ne) {
            case Ah:
              i.depthFunc(i.NEVER);
              break;
            case wh:
              i.depthFunc(i.ALWAYS);
              break;
            case Rh:
              i.depthFunc(i.LESS);
              break;
            case Ls:
              i.depthFunc(i.LEQUAL);
              break;
            case Ch:
              i.depthFunc(i.EQUAL);
              break;
            case Ph:
              i.depthFunc(i.GEQUAL);
              break;
            case Lh:
              i.depthFunc(i.GREATER);
              break;
            case Nh:
              i.depthFunc(i.NOTEQUAL);
              break;
            default:
              i.depthFunc(i.LEQUAL);
          }
          z = ne;
        }
      },
      setLocked: function(ne) {
        g = ne;
      },
      setClear: function(ne) {
        $ !== ne && (i.clearDepth(ne), $ = ne);
      },
      reset: function() {
        g = !1, q = null, z = null, $ = null;
      }
    };
  }
  function n() {
    let g = !1, q = null, z = null, $ = null, ne = null, Ce = null, Be = null, At = null, Lt = null;
    return {
      setTest: function(ct) {
        g || (ct ? be(i.STENCIL_TEST) : ue(i.STENCIL_TEST));
      },
      setMask: function(ct) {
        q !== ct && !g && (i.stencilMask(ct), q = ct);
      },
      setFunc: function(ct, bt, It) {
        (z !== ct || $ !== bt || ne !== It) && (i.stencilFunc(ct, bt, It), z = ct, $ = bt, ne = It);
      },
      setOp: function(ct, bt, It) {
        (Ce !== ct || Be !== bt || At !== It) && (i.stencilOp(ct, bt, It), Ce = ct, Be = bt, At = It);
      },
      setLocked: function(ct) {
        g = ct;
      },
      setClear: function(ct) {
        Lt !== ct && (i.clearStencil(ct), Lt = ct);
      },
      reset: function() {
        g = !1, q = null, z = null, $ = null, ne = null, Ce = null, Be = null, At = null, Lt = null;
      }
    };
  }
  const r = new e(), s = new t(), a = new n(), o = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap();
  let d = {}, u = {}, p = /* @__PURE__ */ new WeakMap(), f = [], m = null, _ = !1, x = null, c = null, h = null, M = null, y = null, w = null, I = null, R = new ut(0, 0, 0), C = 0, U = !1, A = null, v = null, L = null, k = null, V = null;
  const W = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let Q = !1, j = 0;
  const re = i.getParameter(i.VERSION);
  re.indexOf("WebGL") !== -1 ? (j = parseFloat(/^WebGL (\d)/.exec(re)[1]), Q = j >= 1) : re.indexOf("OpenGL ES") !== -1 && (j = parseFloat(/^OpenGL ES (\d)/.exec(re)[1]), Q = j >= 2);
  let K = null, de = {};
  const _e = i.getParameter(i.SCISSOR_BOX), Ee = i.getParameter(i.VIEWPORT), Je = new en().fromArray(_e), lt = new en().fromArray(Ee);
  function J(g, q, z, $) {
    const ne = new Uint8Array(4), Ce = i.createTexture();
    i.bindTexture(g, Ce), i.texParameteri(g, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(g, i.TEXTURE_MAG_FILTER, i.NEAREST);
    for (let Be = 0; Be < z; Be++)
      g === i.TEXTURE_3D || g === i.TEXTURE_2D_ARRAY ? i.texImage3D(q, 0, i.RGBA, 1, 1, $, 0, i.RGBA, i.UNSIGNED_BYTE, ne) : i.texImage2D(q + Be, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, ne);
    return Ce;
  }
  const le = {};
  le[i.TEXTURE_2D] = J(i.TEXTURE_2D, i.TEXTURE_2D, 1), le[i.TEXTURE_CUBE_MAP] = J(i.TEXTURE_CUBE_MAP, i.TEXTURE_CUBE_MAP_POSITIVE_X, 6), le[i.TEXTURE_2D_ARRAY] = J(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1), le[i.TEXTURE_3D] = J(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1), r.setClear(0, 0, 0, 1), s.setClear(1), a.setClear(0), be(i.DEPTH_TEST), s.setFunc(Ls), De(!1), Ye(xl), be(i.CULL_FACE), it(hi);
  function be(g) {
    d[g] !== !0 && (i.enable(g), d[g] = !0);
  }
  function ue(g) {
    d[g] !== !1 && (i.disable(g), d[g] = !1);
  }
  function $e(g, q) {
    return u[g] !== q ? (i.bindFramebuffer(g, q), u[g] = q, g === i.DRAW_FRAMEBUFFER && (u[i.FRAMEBUFFER] = q), g === i.FRAMEBUFFER && (u[i.DRAW_FRAMEBUFFER] = q), !0) : !1;
  }
  function Fe(g, q) {
    let z = f, $ = !1;
    if (g) {
      z = p.get(q), z === void 0 && (z = [], p.set(q, z));
      const ne = g.textures;
      if (z.length !== ne.length || z[0] !== i.COLOR_ATTACHMENT0) {
        for (let Ce = 0, Be = ne.length; Ce < Be; Ce++)
          z[Ce] = i.COLOR_ATTACHMENT0 + Ce;
        z.length = ne.length, $ = !0;
      }
    } else
      z[0] !== i.BACK && (z[0] = i.BACK, $ = !0);
    $ && i.drawBuffers(z);
  }
  function et(g) {
    return m !== g ? (i.useProgram(g), m = g, !0) : !1;
  }
  const D = {
    [Ri]: i.FUNC_ADD,
    [ch]: i.FUNC_SUBTRACT,
    [dh]: i.FUNC_REVERSE_SUBTRACT
  };
  D[hh] = i.MIN, D[uh] = i.MAX;
  const nt = {
    [fh]: i.ZERO,
    [ph]: i.ONE,
    [mh]: i.SRC_COLOR,
    [Ka]: i.SRC_ALPHA,
    [Sh]: i.SRC_ALPHA_SATURATE,
    [xh]: i.DST_COLOR,
    [_h]: i.DST_ALPHA,
    [gh]: i.ONE_MINUS_SRC_COLOR,
    [$a]: i.ONE_MINUS_SRC_ALPHA,
    [yh]: i.ONE_MINUS_DST_COLOR,
    [vh]: i.ONE_MINUS_DST_ALPHA,
    [Mh]: i.CONSTANT_COLOR,
    [Eh]: i.ONE_MINUS_CONSTANT_COLOR,
    [bh]: i.CONSTANT_ALPHA,
    [Th]: i.ONE_MINUS_CONSTANT_ALPHA
  };
  function it(g, q, z, $, ne, Ce, Be, At, Lt, ct) {
    if (g === hi) {
      _ === !0 && (ue(i.BLEND), _ = !1);
      return;
    }
    if (_ === !1 && (be(i.BLEND), _ = !0), g !== lh) {
      if (g !== x || ct !== U) {
        if ((c !== Ri || y !== Ri) && (i.blendEquation(i.FUNC_ADD), c = Ri, y = Ri), ct)
          switch (g) {
            case fr:
              i.blendFuncSeparate(i.ONE, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case yl:
              i.blendFunc(i.ONE, i.ONE);
              break;
            case Sl:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case Ml:
              i.blendFuncSeparate(i.ZERO, i.SRC_COLOR, i.ZERO, i.SRC_ALPHA);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", g);
              break;
          }
        else
          switch (g) {
            case fr:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case yl:
              i.blendFunc(i.SRC_ALPHA, i.ONE);
              break;
            case Sl:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case Ml:
              i.blendFunc(i.ZERO, i.SRC_COLOR);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", g);
              break;
          }
        h = null, M = null, w = null, I = null, R.set(0, 0, 0), C = 0, x = g, U = ct;
      }
      return;
    }
    ne = ne || q, Ce = Ce || z, Be = Be || $, (q !== c || ne !== y) && (i.blendEquationSeparate(D[q], D[ne]), c = q, y = ne), (z !== h || $ !== M || Ce !== w || Be !== I) && (i.blendFuncSeparate(nt[z], nt[$], nt[Ce], nt[Be]), h = z, M = $, w = Ce, I = Be), (At.equals(R) === !1 || Lt !== C) && (i.blendColor(At.r, At.g, At.b, Lt), R.copy(At), C = Lt), x = g, U = !1;
  }
  function vt(g, q) {
    g.side === kn ? ue(i.CULL_FACE) : be(i.CULL_FACE);
    let z = g.side === _n;
    q && (z = !z), De(z), g.blending === fr && g.transparent === !1 ? it(hi) : it(g.blending, g.blendEquation, g.blendSrc, g.blendDst, g.blendEquationAlpha, g.blendSrcAlpha, g.blendDstAlpha, g.blendColor, g.blendAlpha, g.premultipliedAlpha), s.setFunc(g.depthFunc), s.setTest(g.depthTest), s.setMask(g.depthWrite), r.setMask(g.colorWrite);
    const $ = g.stencilWrite;
    a.setTest($), $ && (a.setMask(g.stencilWriteMask), a.setFunc(g.stencilFunc, g.stencilRef, g.stencilFuncMask), a.setOp(g.stencilFail, g.stencilZFail, g.stencilZPass)), qe(g.polygonOffset, g.polygonOffsetFactor, g.polygonOffsetUnits), g.alphaToCoverage === !0 ? be(i.SAMPLE_ALPHA_TO_COVERAGE) : ue(i.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function De(g) {
    A !== g && (g ? i.frontFace(i.CW) : i.frontFace(i.CCW), A = g);
  }
  function Ye(g) {
    g !== sh ? (be(i.CULL_FACE), g !== v && (g === xl ? i.cullFace(i.BACK) : g === ah ? i.cullFace(i.FRONT) : i.cullFace(i.FRONT_AND_BACK))) : ue(i.CULL_FACE), v = g;
  }
  function Ze(g) {
    g !== L && (Q && i.lineWidth(g), L = g);
  }
  function qe(g, q, z) {
    g ? (be(i.POLYGON_OFFSET_FILL), (k !== q || V !== z) && (i.polygonOffset(q, z), k = q, V = z)) : ue(i.POLYGON_OFFSET_FILL);
  }
  function Tt(g) {
    g ? be(i.SCISSOR_TEST) : ue(i.SCISSOR_TEST);
  }
  function P(g) {
    g === void 0 && (g = i.TEXTURE0 + W - 1), K !== g && (i.activeTexture(g), K = g);
  }
  function S(g, q, z) {
    z === void 0 && (K === null ? z = i.TEXTURE0 + W - 1 : z = K);
    let $ = de[z];
    $ === void 0 && ($ = { type: void 0, texture: void 0 }, de[z] = $), ($.type !== g || $.texture !== q) && (K !== z && (i.activeTexture(z), K = z), i.bindTexture(g, q || le[g]), $.type = g, $.texture = q);
  }
  function Y() {
    const g = de[K];
    g !== void 0 && g.type !== void 0 && (i.bindTexture(g.type, null), g.type = void 0, g.texture = void 0);
  }
  function se() {
    try {
      i.compressedTexImage2D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function ae() {
    try {
      i.compressedTexImage3D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function ie() {
    try {
      i.texSubImage2D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function Re() {
    try {
      i.texSubImage3D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function fe() {
    try {
      i.compressedTexSubImage2D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function pe() {
    try {
      i.compressedTexSubImage3D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function je() {
    try {
      i.texStorage2D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function ce() {
    try {
      i.texStorage3D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function Le() {
    try {
      i.texImage2D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function rt() {
    try {
      i.texImage3D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function Ue(g) {
    Je.equals(g) === !1 && (i.scissor(g.x, g.y, g.z, g.w), Je.copy(g));
  }
  function xe(g) {
    lt.equals(g) === !1 && (i.viewport(g.x, g.y, g.z, g.w), lt.copy(g));
  }
  function Ge(g, q) {
    let z = l.get(q);
    z === void 0 && (z = /* @__PURE__ */ new WeakMap(), l.set(q, z));
    let $ = z.get(g);
    $ === void 0 && ($ = i.getUniformBlockIndex(q, g.name), z.set(g, $));
  }
  function He(g, q) {
    const $ = l.get(q).get(g);
    o.get(q) !== $ && (i.uniformBlockBinding(q, $, g.__bindingPointIndex), o.set(q, $));
  }
  function xt() {
    i.disable(i.BLEND), i.disable(i.CULL_FACE), i.disable(i.DEPTH_TEST), i.disable(i.POLYGON_OFFSET_FILL), i.disable(i.SCISSOR_TEST), i.disable(i.STENCIL_TEST), i.disable(i.SAMPLE_ALPHA_TO_COVERAGE), i.blendEquation(i.FUNC_ADD), i.blendFunc(i.ONE, i.ZERO), i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO), i.blendColor(0, 0, 0, 0), i.colorMask(!0, !0, !0, !0), i.clearColor(0, 0, 0, 0), i.depthMask(!0), i.depthFunc(i.LESS), i.clearDepth(1), i.stencilMask(4294967295), i.stencilFunc(i.ALWAYS, 0, 4294967295), i.stencilOp(i.KEEP, i.KEEP, i.KEEP), i.clearStencil(0), i.cullFace(i.BACK), i.frontFace(i.CCW), i.polygonOffset(0, 0), i.activeTexture(i.TEXTURE0), i.bindFramebuffer(i.FRAMEBUFFER, null), i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), i.bindFramebuffer(i.READ_FRAMEBUFFER, null), i.useProgram(null), i.lineWidth(1), i.scissor(0, 0, i.canvas.width, i.canvas.height), i.viewport(0, 0, i.canvas.width, i.canvas.height), d = {}, K = null, de = {}, u = {}, p = /* @__PURE__ */ new WeakMap(), f = [], m = null, _ = !1, x = null, c = null, h = null, M = null, y = null, w = null, I = null, R = new ut(0, 0, 0), C = 0, U = !1, A = null, v = null, L = null, k = null, V = null, Je.set(0, 0, i.canvas.width, i.canvas.height), lt.set(0, 0, i.canvas.width, i.canvas.height), r.reset(), s.reset(), a.reset();
  }
  return {
    buffers: {
      color: r,
      depth: s,
      stencil: a
    },
    enable: be,
    disable: ue,
    bindFramebuffer: $e,
    drawBuffers: Fe,
    useProgram: et,
    setBlending: it,
    setMaterial: vt,
    setFlipSided: De,
    setCullFace: Ye,
    setLineWidth: Ze,
    setPolygonOffset: qe,
    setScissorTest: Tt,
    activeTexture: P,
    bindTexture: S,
    unbindTexture: Y,
    compressedTexImage2D: se,
    compressedTexImage3D: ae,
    texImage2D: Le,
    texImage3D: rt,
    updateUBOMapping: Ge,
    uniformBlockBinding: He,
    texStorage2D: je,
    texStorage3D: ce,
    texSubImage2D: ie,
    texSubImage3D: Re,
    compressedTexSubImage2D: fe,
    compressedTexSubImage3D: pe,
    scissor: Ue,
    viewport: xe,
    reset: xt
  };
}
function c_(i, e, t, n, r, s, a) {
  const o = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), d = new Xe(), u = /* @__PURE__ */ new WeakMap();
  let p;
  const f = /* @__PURE__ */ new WeakMap();
  let m = !1;
  try {
    m = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function _(P, S) {
    return m ? (
      // eslint-disable-next-line compat/compat
      new OffscreenCanvas(P, S)
    ) : Fs("canvas");
  }
  function x(P, S, Y) {
    let se = 1;
    const ae = Tt(P);
    if ((ae.width > Y || ae.height > Y) && (se = Y / Math.max(ae.width, ae.height)), se < 1)
      if (typeof HTMLImageElement < "u" && P instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && P instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && P instanceof ImageBitmap || typeof VideoFrame < "u" && P instanceof VideoFrame) {
        const ie = Math.floor(se * ae.width), Re = Math.floor(se * ae.height);
        p === void 0 && (p = _(ie, Re));
        const fe = S ? _(ie, Re) : p;
        return fe.width = ie, fe.height = Re, fe.getContext("2d").drawImage(P, 0, 0, ie, Re), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + ae.width + "x" + ae.height + ") to (" + ie + "x" + Re + ")."), fe;
      } else
        return "data" in P && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + ae.width + "x" + ae.height + ")."), P;
    return P;
  }
  function c(P) {
    return P.generateMipmaps && P.minFilter !== wn && P.minFilter !== In;
  }
  function h(P) {
    i.generateMipmap(P);
  }
  function M(P, S, Y, se, ae = !1) {
    if (P !== null) {
      if (i[P] !== void 0) return i[P];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + P + "'");
    }
    let ie = S;
    if (S === i.RED && (Y === i.FLOAT && (ie = i.R32F), Y === i.HALF_FLOAT && (ie = i.R16F), Y === i.UNSIGNED_BYTE && (ie = i.R8)), S === i.RED_INTEGER && (Y === i.UNSIGNED_BYTE && (ie = i.R8UI), Y === i.UNSIGNED_SHORT && (ie = i.R16UI), Y === i.UNSIGNED_INT && (ie = i.R32UI), Y === i.BYTE && (ie = i.R8I), Y === i.SHORT && (ie = i.R16I), Y === i.INT && (ie = i.R32I)), S === i.RG && (Y === i.FLOAT && (ie = i.RG32F), Y === i.HALF_FLOAT && (ie = i.RG16F), Y === i.UNSIGNED_BYTE && (ie = i.RG8)), S === i.RG_INTEGER && (Y === i.UNSIGNED_BYTE && (ie = i.RG8UI), Y === i.UNSIGNED_SHORT && (ie = i.RG16UI), Y === i.UNSIGNED_INT && (ie = i.RG32UI), Y === i.BYTE && (ie = i.RG8I), Y === i.SHORT && (ie = i.RG16I), Y === i.INT && (ie = i.RG32I)), S === i.RGB && Y === i.UNSIGNED_INT_5_9_9_9_REV && (ie = i.RGB9_E5), S === i.RGBA) {
      const Re = ae ? Is : _t.getTransfer(se);
      Y === i.FLOAT && (ie = i.RGBA32F), Y === i.HALF_FLOAT && (ie = i.RGBA16F), Y === i.UNSIGNED_BYTE && (ie = Re === Pt ? i.SRGB8_ALPHA8 : i.RGBA8), Y === i.UNSIGNED_SHORT_4_4_4_4 && (ie = i.RGBA4), Y === i.UNSIGNED_SHORT_5_5_5_1 && (ie = i.RGB5_A1);
    }
    return (ie === i.R16F || ie === i.R32F || ie === i.RG16F || ie === i.RG32F || ie === i.RGBA16F || ie === i.RGBA32F) && e.get("EXT_color_buffer_float"), ie;
  }
  function y(P, S) {
    let Y;
    return P ? S === null || S === vr || S === xr ? Y = i.DEPTH24_STENCIL8 : S === di ? Y = i.DEPTH32F_STENCIL8 : S === Ns && (Y = i.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : S === null || S === vr || S === xr ? Y = i.DEPTH_COMPONENT24 : S === di ? Y = i.DEPTH_COMPONENT32F : S === Ns && (Y = i.DEPTH_COMPONENT16), Y;
  }
  function w(P, S) {
    return c(P) === !0 || P.isFramebufferTexture && P.minFilter !== wn && P.minFilter !== In ? Math.log2(Math.max(S.width, S.height)) + 1 : P.mipmaps !== void 0 && P.mipmaps.length > 0 ? P.mipmaps.length : P.isCompressedTexture && Array.isArray(P.image) ? S.mipmaps.length : 1;
  }
  function I(P) {
    const S = P.target;
    S.removeEventListener("dispose", I), C(S), S.isVideoTexture && u.delete(S);
  }
  function R(P) {
    const S = P.target;
    S.removeEventListener("dispose", R), A(S);
  }
  function C(P) {
    const S = n.get(P);
    if (S.__webglInit === void 0) return;
    const Y = P.source, se = f.get(Y);
    if (se) {
      const ae = se[S.__cacheKey];
      ae.usedTimes--, ae.usedTimes === 0 && U(P), Object.keys(se).length === 0 && f.delete(Y);
    }
    n.remove(P);
  }
  function U(P) {
    const S = n.get(P);
    i.deleteTexture(S.__webglTexture);
    const Y = P.source, se = f.get(Y);
    delete se[S.__cacheKey], a.memory.textures--;
  }
  function A(P) {
    const S = n.get(P);
    if (P.depthTexture && P.depthTexture.dispose(), P.isWebGLCubeRenderTarget)
      for (let se = 0; se < 6; se++) {
        if (Array.isArray(S.__webglFramebuffer[se]))
          for (let ae = 0; ae < S.__webglFramebuffer[se].length; ae++) i.deleteFramebuffer(S.__webglFramebuffer[se][ae]);
        else
          i.deleteFramebuffer(S.__webglFramebuffer[se]);
        S.__webglDepthbuffer && i.deleteRenderbuffer(S.__webglDepthbuffer[se]);
      }
    else {
      if (Array.isArray(S.__webglFramebuffer))
        for (let se = 0; se < S.__webglFramebuffer.length; se++) i.deleteFramebuffer(S.__webglFramebuffer[se]);
      else
        i.deleteFramebuffer(S.__webglFramebuffer);
      if (S.__webglDepthbuffer && i.deleteRenderbuffer(S.__webglDepthbuffer), S.__webglMultisampledFramebuffer && i.deleteFramebuffer(S.__webglMultisampledFramebuffer), S.__webglColorRenderbuffer)
        for (let se = 0; se < S.__webglColorRenderbuffer.length; se++)
          S.__webglColorRenderbuffer[se] && i.deleteRenderbuffer(S.__webglColorRenderbuffer[se]);
      S.__webglDepthRenderbuffer && i.deleteRenderbuffer(S.__webglDepthRenderbuffer);
    }
    const Y = P.textures;
    for (let se = 0, ae = Y.length; se < ae; se++) {
      const ie = n.get(Y[se]);
      ie.__webglTexture && (i.deleteTexture(ie.__webglTexture), a.memory.textures--), n.remove(Y[se]);
    }
    n.remove(P);
  }
  let v = 0;
  function L() {
    v = 0;
  }
  function k() {
    const P = v;
    return P >= r.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + P + " texture units while this GPU supports only " + r.maxTextures), v += 1, P;
  }
  function V(P) {
    const S = [];
    return S.push(P.wrapS), S.push(P.wrapT), S.push(P.wrapR || 0), S.push(P.magFilter), S.push(P.minFilter), S.push(P.anisotropy), S.push(P.internalFormat), S.push(P.format), S.push(P.type), S.push(P.generateMipmaps), S.push(P.premultiplyAlpha), S.push(P.flipY), S.push(P.unpackAlignment), S.push(P.colorSpace), S.join();
  }
  function W(P, S) {
    const Y = n.get(P);
    if (P.isVideoTexture && Ze(P), P.isRenderTargetTexture === !1 && P.version > 0 && Y.__version !== P.version) {
      const se = P.image;
      if (se === null)
        console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (se.complete === !1)
        console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        lt(Y, P, S);
        return;
      }
    }
    t.bindTexture(i.TEXTURE_2D, Y.__webglTexture, i.TEXTURE0 + S);
  }
  function Q(P, S) {
    const Y = n.get(P);
    if (P.version > 0 && Y.__version !== P.version) {
      lt(Y, P, S);
      return;
    }
    t.bindTexture(i.TEXTURE_2D_ARRAY, Y.__webglTexture, i.TEXTURE0 + S);
  }
  function j(P, S) {
    const Y = n.get(P);
    if (P.version > 0 && Y.__version !== P.version) {
      lt(Y, P, S);
      return;
    }
    t.bindTexture(i.TEXTURE_3D, Y.__webglTexture, i.TEXTURE0 + S);
  }
  function re(P, S) {
    const Y = n.get(P);
    if (P.version > 0 && Y.__version !== P.version) {
      J(Y, P, S);
      return;
    }
    t.bindTexture(i.TEXTURE_CUBE_MAP, Y.__webglTexture, i.TEXTURE0 + S);
  }
  const K = {
    [Ja]: i.REPEAT,
    [Li]: i.CLAMP_TO_EDGE,
    [eo]: i.MIRRORED_REPEAT
  }, de = {
    [wn]: i.NEAREST,
    [Hh]: i.NEAREST_MIPMAP_NEAREST,
    [Qr]: i.NEAREST_MIPMAP_LINEAR,
    [In]: i.LINEAR,
    [la]: i.LINEAR_MIPMAP_NEAREST,
    [Ni]: i.LINEAR_MIPMAP_LINEAR
  }, _e = {
    [nu]: i.NEVER,
    [lu]: i.ALWAYS,
    [iu]: i.LESS,
    [md]: i.LEQUAL,
    [ru]: i.EQUAL,
    [ou]: i.GEQUAL,
    [su]: i.GREATER,
    [au]: i.NOTEQUAL
  };
  function Ee(P, S) {
    if (S.type === di && e.has("OES_texture_float_linear") === !1 && (S.magFilter === In || S.magFilter === la || S.magFilter === Qr || S.magFilter === Ni || S.minFilter === In || S.minFilter === la || S.minFilter === Qr || S.minFilter === Ni) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), i.texParameteri(P, i.TEXTURE_WRAP_S, K[S.wrapS]), i.texParameteri(P, i.TEXTURE_WRAP_T, K[S.wrapT]), (P === i.TEXTURE_3D || P === i.TEXTURE_2D_ARRAY) && i.texParameteri(P, i.TEXTURE_WRAP_R, K[S.wrapR]), i.texParameteri(P, i.TEXTURE_MAG_FILTER, de[S.magFilter]), i.texParameteri(P, i.TEXTURE_MIN_FILTER, de[S.minFilter]), S.compareFunction && (i.texParameteri(P, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE), i.texParameteri(P, i.TEXTURE_COMPARE_FUNC, _e[S.compareFunction])), e.has("EXT_texture_filter_anisotropic") === !0) {
      if (S.magFilter === wn || S.minFilter !== Qr && S.minFilter !== Ni || S.type === di && e.has("OES_texture_float_linear") === !1) return;
      if (S.anisotropy > 1 || n.get(S).__currentAnisotropy) {
        const Y = e.get("EXT_texture_filter_anisotropic");
        i.texParameterf(P, Y.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(S.anisotropy, r.getMaxAnisotropy())), n.get(S).__currentAnisotropy = S.anisotropy;
      }
    }
  }
  function Je(P, S) {
    let Y = !1;
    P.__webglInit === void 0 && (P.__webglInit = !0, S.addEventListener("dispose", I));
    const se = S.source;
    let ae = f.get(se);
    ae === void 0 && (ae = {}, f.set(se, ae));
    const ie = V(S);
    if (ie !== P.__cacheKey) {
      ae[ie] === void 0 && (ae[ie] = {
        texture: i.createTexture(),
        usedTimes: 0
      }, a.memory.textures++, Y = !0), ae[ie].usedTimes++;
      const Re = ae[P.__cacheKey];
      Re !== void 0 && (ae[P.__cacheKey].usedTimes--, Re.usedTimes === 0 && U(S)), P.__cacheKey = ie, P.__webglTexture = ae[ie].texture;
    }
    return Y;
  }
  function lt(P, S, Y) {
    let se = i.TEXTURE_2D;
    (S.isDataArrayTexture || S.isCompressedArrayTexture) && (se = i.TEXTURE_2D_ARRAY), S.isData3DTexture && (se = i.TEXTURE_3D);
    const ae = Je(P, S), ie = S.source;
    t.bindTexture(se, P.__webglTexture, i.TEXTURE0 + Y);
    const Re = n.get(ie);
    if (ie.version !== Re.__version || ae === !0) {
      t.activeTexture(i.TEXTURE0 + Y);
      const fe = _t.getPrimaries(_t.workingColorSpace), pe = S.colorSpace === ci ? null : _t.getPrimaries(S.colorSpace), je = S.colorSpace === ci || fe === pe ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, S.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, S.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, S.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, je);
      let ce = x(S.image, !1, r.maxTextureSize);
      ce = qe(S, ce);
      const Le = s.convert(S.format, S.colorSpace), rt = s.convert(S.type);
      let Ue = M(S.internalFormat, Le, rt, S.colorSpace, S.isVideoTexture);
      Ee(se, S);
      let xe;
      const Ge = S.mipmaps, He = S.isVideoTexture !== !0, xt = Re.__version === void 0 || ae === !0, g = ie.dataReady, q = w(S, ce);
      if (S.isDepthTexture)
        Ue = y(S.format === yr, S.type), xt && (He ? t.texStorage2D(i.TEXTURE_2D, 1, Ue, ce.width, ce.height) : t.texImage2D(i.TEXTURE_2D, 0, Ue, ce.width, ce.height, 0, Le, rt, null));
      else if (S.isDataTexture)
        if (Ge.length > 0) {
          He && xt && t.texStorage2D(i.TEXTURE_2D, q, Ue, Ge[0].width, Ge[0].height);
          for (let z = 0, $ = Ge.length; z < $; z++)
            xe = Ge[z], He ? g && t.texSubImage2D(i.TEXTURE_2D, z, 0, 0, xe.width, xe.height, Le, rt, xe.data) : t.texImage2D(i.TEXTURE_2D, z, Ue, xe.width, xe.height, 0, Le, rt, xe.data);
          S.generateMipmaps = !1;
        } else
          He ? (xt && t.texStorage2D(i.TEXTURE_2D, q, Ue, ce.width, ce.height), g && t.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, ce.width, ce.height, Le, rt, ce.data)) : t.texImage2D(i.TEXTURE_2D, 0, Ue, ce.width, ce.height, 0, Le, rt, ce.data);
      else if (S.isCompressedTexture)
        if (S.isCompressedArrayTexture) {
          He && xt && t.texStorage3D(i.TEXTURE_2D_ARRAY, q, Ue, Ge[0].width, Ge[0].height, ce.depth);
          for (let z = 0, $ = Ge.length; z < $; z++)
            if (xe = Ge[z], S.format !== Hn)
              if (Le !== null)
                if (He) {
                  if (g)
                    if (S.layerUpdates.size > 0) {
                      for (const ne of S.layerUpdates) {
                        const Ce = xe.width * xe.height;
                        t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, z, 0, 0, ne, xe.width, xe.height, 1, Le, xe.data.slice(Ce * ne, Ce * (ne + 1)), 0, 0);
                      }
                      S.clearLayerUpdates();
                    } else
                      t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, z, 0, 0, 0, xe.width, xe.height, ce.depth, Le, xe.data, 0, 0);
                } else
                  t.compressedTexImage3D(i.TEXTURE_2D_ARRAY, z, Ue, xe.width, xe.height, ce.depth, 0, xe.data, 0, 0);
              else
                console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              He ? g && t.texSubImage3D(i.TEXTURE_2D_ARRAY, z, 0, 0, 0, xe.width, xe.height, ce.depth, Le, rt, xe.data) : t.texImage3D(i.TEXTURE_2D_ARRAY, z, Ue, xe.width, xe.height, ce.depth, 0, Le, rt, xe.data);
        } else {
          He && xt && t.texStorage2D(i.TEXTURE_2D, q, Ue, Ge[0].width, Ge[0].height);
          for (let z = 0, $ = Ge.length; z < $; z++)
            xe = Ge[z], S.format !== Hn ? Le !== null ? He ? g && t.compressedTexSubImage2D(i.TEXTURE_2D, z, 0, 0, xe.width, xe.height, Le, xe.data) : t.compressedTexImage2D(i.TEXTURE_2D, z, Ue, xe.width, xe.height, 0, xe.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : He ? g && t.texSubImage2D(i.TEXTURE_2D, z, 0, 0, xe.width, xe.height, Le, rt, xe.data) : t.texImage2D(i.TEXTURE_2D, z, Ue, xe.width, xe.height, 0, Le, rt, xe.data);
        }
      else if (S.isDataArrayTexture)
        if (He) {
          if (xt && t.texStorage3D(i.TEXTURE_2D_ARRAY, q, Ue, ce.width, ce.height, ce.depth), g)
            if (S.layerUpdates.size > 0) {
              let z;
              switch (rt) {
                case i.UNSIGNED_BYTE:
                  switch (Le) {
                    case i.ALPHA:
                      z = 1;
                      break;
                    case i.LUMINANCE:
                      z = 1;
                      break;
                    case i.LUMINANCE_ALPHA:
                      z = 2;
                      break;
                    case i.RGB:
                      z = 3;
                      break;
                    case i.RGBA:
                      z = 4;
                      break;
                    default:
                      throw new Error(`Unknown texel size for format ${Le}.`);
                  }
                  break;
                case i.UNSIGNED_SHORT_4_4_4_4:
                case i.UNSIGNED_SHORT_5_5_5_1:
                case i.UNSIGNED_SHORT_5_6_5:
                  z = 1;
                  break;
                default:
                  throw new Error(`Unknown texel size for type ${rt}.`);
              }
              const $ = ce.width * ce.height * z;
              for (const ne of S.layerUpdates)
                t.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, ne, ce.width, ce.height, 1, Le, rt, ce.data.slice($ * ne, $ * (ne + 1)));
              S.clearLayerUpdates();
            } else
              t.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, 0, ce.width, ce.height, ce.depth, Le, rt, ce.data);
        } else
          t.texImage3D(i.TEXTURE_2D_ARRAY, 0, Ue, ce.width, ce.height, ce.depth, 0, Le, rt, ce.data);
      else if (S.isData3DTexture)
        He ? (xt && t.texStorage3D(i.TEXTURE_3D, q, Ue, ce.width, ce.height, ce.depth), g && t.texSubImage3D(i.TEXTURE_3D, 0, 0, 0, 0, ce.width, ce.height, ce.depth, Le, rt, ce.data)) : t.texImage3D(i.TEXTURE_3D, 0, Ue, ce.width, ce.height, ce.depth, 0, Le, rt, ce.data);
      else if (S.isFramebufferTexture) {
        if (xt)
          if (He)
            t.texStorage2D(i.TEXTURE_2D, q, Ue, ce.width, ce.height);
          else {
            let z = ce.width, $ = ce.height;
            for (let ne = 0; ne < q; ne++)
              t.texImage2D(i.TEXTURE_2D, ne, Ue, z, $, 0, Le, rt, null), z >>= 1, $ >>= 1;
          }
      } else if (Ge.length > 0) {
        if (He && xt) {
          const z = Tt(Ge[0]);
          t.texStorage2D(i.TEXTURE_2D, q, Ue, z.width, z.height);
        }
        for (let z = 0, $ = Ge.length; z < $; z++)
          xe = Ge[z], He ? g && t.texSubImage2D(i.TEXTURE_2D, z, 0, 0, Le, rt, xe) : t.texImage2D(i.TEXTURE_2D, z, Ue, Le, rt, xe);
        S.generateMipmaps = !1;
      } else if (He) {
        if (xt) {
          const z = Tt(ce);
          t.texStorage2D(i.TEXTURE_2D, q, Ue, z.width, z.height);
        }
        g && t.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, Le, rt, ce);
      } else
        t.texImage2D(i.TEXTURE_2D, 0, Ue, Le, rt, ce);
      c(S) && h(se), Re.__version = ie.version, S.onUpdate && S.onUpdate(S);
    }
    P.__version = S.version;
  }
  function J(P, S, Y) {
    if (S.image.length !== 6) return;
    const se = Je(P, S), ae = S.source;
    t.bindTexture(i.TEXTURE_CUBE_MAP, P.__webglTexture, i.TEXTURE0 + Y);
    const ie = n.get(ae);
    if (ae.version !== ie.__version || se === !0) {
      t.activeTexture(i.TEXTURE0 + Y);
      const Re = _t.getPrimaries(_t.workingColorSpace), fe = S.colorSpace === ci ? null : _t.getPrimaries(S.colorSpace), pe = S.colorSpace === ci || Re === fe ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, S.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, S.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, S.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, pe);
      const je = S.isCompressedTexture || S.image[0].isCompressedTexture, ce = S.image[0] && S.image[0].isDataTexture, Le = [];
      for (let $ = 0; $ < 6; $++)
        !je && !ce ? Le[$] = x(S.image[$], !0, r.maxCubemapSize) : Le[$] = ce ? S.image[$].image : S.image[$], Le[$] = qe(S, Le[$]);
      const rt = Le[0], Ue = s.convert(S.format, S.colorSpace), xe = s.convert(S.type), Ge = M(S.internalFormat, Ue, xe, S.colorSpace), He = S.isVideoTexture !== !0, xt = ie.__version === void 0 || se === !0, g = ae.dataReady;
      let q = w(S, rt);
      Ee(i.TEXTURE_CUBE_MAP, S);
      let z;
      if (je) {
        He && xt && t.texStorage2D(i.TEXTURE_CUBE_MAP, q, Ge, rt.width, rt.height);
        for (let $ = 0; $ < 6; $++) {
          z = Le[$].mipmaps;
          for (let ne = 0; ne < z.length; ne++) {
            const Ce = z[ne];
            S.format !== Hn ? Ue !== null ? He ? g && t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, ne, 0, 0, Ce.width, Ce.height, Ue, Ce.data) : t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, ne, Ge, Ce.width, Ce.height, 0, Ce.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : He ? g && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, ne, 0, 0, Ce.width, Ce.height, Ue, xe, Ce.data) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, ne, Ge, Ce.width, Ce.height, 0, Ue, xe, Ce.data);
          }
        }
      } else {
        if (z = S.mipmaps, He && xt) {
          z.length > 0 && q++;
          const $ = Tt(Le[0]);
          t.texStorage2D(i.TEXTURE_CUBE_MAP, q, Ge, $.width, $.height);
        }
        for (let $ = 0; $ < 6; $++)
          if (ce) {
            He ? g && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, 0, 0, Le[$].width, Le[$].height, Ue, xe, Le[$].data) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, Ge, Le[$].width, Le[$].height, 0, Ue, xe, Le[$].data);
            for (let ne = 0; ne < z.length; ne++) {
              const Be = z[ne].image[$].image;
              He ? g && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, ne + 1, 0, 0, Be.width, Be.height, Ue, xe, Be.data) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, ne + 1, Ge, Be.width, Be.height, 0, Ue, xe, Be.data);
            }
          } else {
            He ? g && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, 0, 0, Ue, xe, Le[$]) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, Ge, Ue, xe, Le[$]);
            for (let ne = 0; ne < z.length; ne++) {
              const Ce = z[ne];
              He ? g && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, ne + 1, 0, 0, Ue, xe, Ce.image[$]) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, ne + 1, Ge, Ue, xe, Ce.image[$]);
            }
          }
      }
      c(S) && h(i.TEXTURE_CUBE_MAP), ie.__version = ae.version, S.onUpdate && S.onUpdate(S);
    }
    P.__version = S.version;
  }
  function le(P, S, Y, se, ae, ie) {
    const Re = s.convert(Y.format, Y.colorSpace), fe = s.convert(Y.type), pe = M(Y.internalFormat, Re, fe, Y.colorSpace);
    if (!n.get(S).__hasExternalTextures) {
      const ce = Math.max(1, S.width >> ie), Le = Math.max(1, S.height >> ie);
      ae === i.TEXTURE_3D || ae === i.TEXTURE_2D_ARRAY ? t.texImage3D(ae, ie, pe, ce, Le, S.depth, 0, Re, fe, null) : t.texImage2D(ae, ie, pe, ce, Le, 0, Re, fe, null);
    }
    t.bindFramebuffer(i.FRAMEBUFFER, P), Ye(S) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, se, ae, n.get(Y).__webglTexture, 0, De(S)) : (ae === i.TEXTURE_2D || ae >= i.TEXTURE_CUBE_MAP_POSITIVE_X && ae <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z) && i.framebufferTexture2D(i.FRAMEBUFFER, se, ae, n.get(Y).__webglTexture, ie), t.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function be(P, S, Y) {
    if (i.bindRenderbuffer(i.RENDERBUFFER, P), S.depthBuffer) {
      const se = S.depthTexture, ae = se && se.isDepthTexture ? se.type : null, ie = y(S.stencilBuffer, ae), Re = S.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, fe = De(S);
      Ye(S) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, fe, ie, S.width, S.height) : Y ? i.renderbufferStorageMultisample(i.RENDERBUFFER, fe, ie, S.width, S.height) : i.renderbufferStorage(i.RENDERBUFFER, ie, S.width, S.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, Re, i.RENDERBUFFER, P);
    } else {
      const se = S.textures;
      for (let ae = 0; ae < se.length; ae++) {
        const ie = se[ae], Re = s.convert(ie.format, ie.colorSpace), fe = s.convert(ie.type), pe = M(ie.internalFormat, Re, fe, ie.colorSpace), je = De(S);
        Y && Ye(S) === !1 ? i.renderbufferStorageMultisample(i.RENDERBUFFER, je, pe, S.width, S.height) : Ye(S) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, je, pe, S.width, S.height) : i.renderbufferStorage(i.RENDERBUFFER, pe, S.width, S.height);
      }
    }
    i.bindRenderbuffer(i.RENDERBUFFER, null);
  }
  function ue(P, S) {
    if (S && S.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (t.bindFramebuffer(i.FRAMEBUFFER, P), !(S.depthTexture && S.depthTexture.isDepthTexture))
      throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    (!n.get(S.depthTexture).__webglTexture || S.depthTexture.image.width !== S.width || S.depthTexture.image.height !== S.height) && (S.depthTexture.image.width = S.width, S.depthTexture.image.height = S.height, S.depthTexture.needsUpdate = !0), W(S.depthTexture, 0);
    const se = n.get(S.depthTexture).__webglTexture, ae = De(S);
    if (S.depthTexture.format === pr)
      Ye(S) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, se, 0, ae) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, se, 0);
    else if (S.depthTexture.format === yr)
      Ye(S) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, se, 0, ae) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, se, 0);
    else
      throw new Error("Unknown depthTexture format");
  }
  function $e(P) {
    const S = n.get(P), Y = P.isWebGLCubeRenderTarget === !0;
    if (P.depthTexture && !S.__autoAllocateDepthBuffer) {
      if (Y) throw new Error("target.depthTexture not supported in Cube render targets");
      ue(S.__webglFramebuffer, P);
    } else if (Y) {
      S.__webglDepthbuffer = [];
      for (let se = 0; se < 6; se++)
        t.bindFramebuffer(i.FRAMEBUFFER, S.__webglFramebuffer[se]), S.__webglDepthbuffer[se] = i.createRenderbuffer(), be(S.__webglDepthbuffer[se], P, !1);
    } else
      t.bindFramebuffer(i.FRAMEBUFFER, S.__webglFramebuffer), S.__webglDepthbuffer = i.createRenderbuffer(), be(S.__webglDepthbuffer, P, !1);
    t.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function Fe(P, S, Y) {
    const se = n.get(P);
    S !== void 0 && le(se.__webglFramebuffer, P, P.texture, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, 0), Y !== void 0 && $e(P);
  }
  function et(P) {
    const S = P.texture, Y = n.get(P), se = n.get(S);
    P.addEventListener("dispose", R);
    const ae = P.textures, ie = P.isWebGLCubeRenderTarget === !0, Re = ae.length > 1;
    if (Re || (se.__webglTexture === void 0 && (se.__webglTexture = i.createTexture()), se.__version = S.version, a.memory.textures++), ie) {
      Y.__webglFramebuffer = [];
      for (let fe = 0; fe < 6; fe++)
        if (S.mipmaps && S.mipmaps.length > 0) {
          Y.__webglFramebuffer[fe] = [];
          for (let pe = 0; pe < S.mipmaps.length; pe++)
            Y.__webglFramebuffer[fe][pe] = i.createFramebuffer();
        } else
          Y.__webglFramebuffer[fe] = i.createFramebuffer();
    } else {
      if (S.mipmaps && S.mipmaps.length > 0) {
        Y.__webglFramebuffer = [];
        for (let fe = 0; fe < S.mipmaps.length; fe++)
          Y.__webglFramebuffer[fe] = i.createFramebuffer();
      } else
        Y.__webglFramebuffer = i.createFramebuffer();
      if (Re)
        for (let fe = 0, pe = ae.length; fe < pe; fe++) {
          const je = n.get(ae[fe]);
          je.__webglTexture === void 0 && (je.__webglTexture = i.createTexture(), a.memory.textures++);
        }
      if (P.samples > 0 && Ye(P) === !1) {
        Y.__webglMultisampledFramebuffer = i.createFramebuffer(), Y.__webglColorRenderbuffer = [], t.bindFramebuffer(i.FRAMEBUFFER, Y.__webglMultisampledFramebuffer);
        for (let fe = 0; fe < ae.length; fe++) {
          const pe = ae[fe];
          Y.__webglColorRenderbuffer[fe] = i.createRenderbuffer(), i.bindRenderbuffer(i.RENDERBUFFER, Y.__webglColorRenderbuffer[fe]);
          const je = s.convert(pe.format, pe.colorSpace), ce = s.convert(pe.type), Le = M(pe.internalFormat, je, ce, pe.colorSpace, P.isXRRenderTarget === !0), rt = De(P);
          i.renderbufferStorageMultisample(i.RENDERBUFFER, rt, Le, P.width, P.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + fe, i.RENDERBUFFER, Y.__webglColorRenderbuffer[fe]);
        }
        i.bindRenderbuffer(i.RENDERBUFFER, null), P.depthBuffer && (Y.__webglDepthRenderbuffer = i.createRenderbuffer(), be(Y.__webglDepthRenderbuffer, P, !0)), t.bindFramebuffer(i.FRAMEBUFFER, null);
      }
    }
    if (ie) {
      t.bindTexture(i.TEXTURE_CUBE_MAP, se.__webglTexture), Ee(i.TEXTURE_CUBE_MAP, S);
      for (let fe = 0; fe < 6; fe++)
        if (S.mipmaps && S.mipmaps.length > 0)
          for (let pe = 0; pe < S.mipmaps.length; pe++)
            le(Y.__webglFramebuffer[fe][pe], P, S, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + fe, pe);
        else
          le(Y.__webglFramebuffer[fe], P, S, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + fe, 0);
      c(S) && h(i.TEXTURE_CUBE_MAP), t.unbindTexture();
    } else if (Re) {
      for (let fe = 0, pe = ae.length; fe < pe; fe++) {
        const je = ae[fe], ce = n.get(je);
        t.bindTexture(i.TEXTURE_2D, ce.__webglTexture), Ee(i.TEXTURE_2D, je), le(Y.__webglFramebuffer, P, je, i.COLOR_ATTACHMENT0 + fe, i.TEXTURE_2D, 0), c(je) && h(i.TEXTURE_2D);
      }
      t.unbindTexture();
    } else {
      let fe = i.TEXTURE_2D;
      if ((P.isWebGL3DRenderTarget || P.isWebGLArrayRenderTarget) && (fe = P.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), t.bindTexture(fe, se.__webglTexture), Ee(fe, S), S.mipmaps && S.mipmaps.length > 0)
        for (let pe = 0; pe < S.mipmaps.length; pe++)
          le(Y.__webglFramebuffer[pe], P, S, i.COLOR_ATTACHMENT0, fe, pe);
      else
        le(Y.__webglFramebuffer, P, S, i.COLOR_ATTACHMENT0, fe, 0);
      c(S) && h(fe), t.unbindTexture();
    }
    P.depthBuffer && $e(P);
  }
  function D(P) {
    const S = P.textures;
    for (let Y = 0, se = S.length; Y < se; Y++) {
      const ae = S[Y];
      if (c(ae)) {
        const ie = P.isWebGLCubeRenderTarget ? i.TEXTURE_CUBE_MAP : i.TEXTURE_2D, Re = n.get(ae).__webglTexture;
        t.bindTexture(ie, Re), h(ie), t.unbindTexture();
      }
    }
  }
  const nt = [], it = [];
  function vt(P) {
    if (P.samples > 0) {
      if (Ye(P) === !1) {
        const S = P.textures, Y = P.width, se = P.height;
        let ae = i.COLOR_BUFFER_BIT;
        const ie = P.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, Re = n.get(P), fe = S.length > 1;
        if (fe)
          for (let pe = 0; pe < S.length; pe++)
            t.bindFramebuffer(i.FRAMEBUFFER, Re.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + pe, i.RENDERBUFFER, null), t.bindFramebuffer(i.FRAMEBUFFER, Re.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + pe, i.TEXTURE_2D, null, 0);
        t.bindFramebuffer(i.READ_FRAMEBUFFER, Re.__webglMultisampledFramebuffer), t.bindFramebuffer(i.DRAW_FRAMEBUFFER, Re.__webglFramebuffer);
        for (let pe = 0; pe < S.length; pe++) {
          if (P.resolveDepthBuffer && (P.depthBuffer && (ae |= i.DEPTH_BUFFER_BIT), P.stencilBuffer && P.resolveStencilBuffer && (ae |= i.STENCIL_BUFFER_BIT)), fe) {
            i.framebufferRenderbuffer(i.READ_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.RENDERBUFFER, Re.__webglColorRenderbuffer[pe]);
            const je = n.get(S[pe]).__webglTexture;
            i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, je, 0);
          }
          i.blitFramebuffer(0, 0, Y, se, 0, 0, Y, se, ae, i.NEAREST), l === !0 && (nt.length = 0, it.length = 0, nt.push(i.COLOR_ATTACHMENT0 + pe), P.depthBuffer && P.resolveDepthBuffer === !1 && (nt.push(ie), it.push(ie), i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, it)), i.invalidateFramebuffer(i.READ_FRAMEBUFFER, nt));
        }
        if (t.bindFramebuffer(i.READ_FRAMEBUFFER, null), t.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), fe)
          for (let pe = 0; pe < S.length; pe++) {
            t.bindFramebuffer(i.FRAMEBUFFER, Re.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + pe, i.RENDERBUFFER, Re.__webglColorRenderbuffer[pe]);
            const je = n.get(S[pe]).__webglTexture;
            t.bindFramebuffer(i.FRAMEBUFFER, Re.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + pe, i.TEXTURE_2D, je, 0);
          }
        t.bindFramebuffer(i.DRAW_FRAMEBUFFER, Re.__webglMultisampledFramebuffer);
      } else if (P.depthBuffer && P.resolveDepthBuffer === !1 && l) {
        const S = P.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT;
        i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [S]);
      }
    }
  }
  function De(P) {
    return Math.min(r.maxSamples, P.samples);
  }
  function Ye(P) {
    const S = n.get(P);
    return P.samples > 0 && e.has("WEBGL_multisampled_render_to_texture") === !0 && S.__useRenderToTexture !== !1;
  }
  function Ze(P) {
    const S = a.render.frame;
    u.get(P) !== S && (u.set(P, S), P.update());
  }
  function qe(P, S) {
    const Y = P.colorSpace, se = P.format, ae = P.type;
    return P.isCompressedTexture === !0 || P.isVideoTexture === !0 || Y !== gi && Y !== ci && (_t.getTransfer(Y) === Pt ? (se !== Hn || ae !== pi) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", Y)), S;
  }
  function Tt(P) {
    return typeof HTMLImageElement < "u" && P instanceof HTMLImageElement ? (d.width = P.naturalWidth || P.width, d.height = P.naturalHeight || P.height) : typeof VideoFrame < "u" && P instanceof VideoFrame ? (d.width = P.displayWidth, d.height = P.displayHeight) : (d.width = P.width, d.height = P.height), d;
  }
  this.allocateTextureUnit = k, this.resetTextureUnits = L, this.setTexture2D = W, this.setTexture2DArray = Q, this.setTexture3D = j, this.setTextureCube = re, this.rebindTextures = Fe, this.setupRenderTarget = et, this.updateRenderTargetMipmap = D, this.updateMultisampleRenderTarget = vt, this.setupDepthRenderbuffer = $e, this.setupFrameBufferTexture = le, this.useMultisampledRTT = Ye;
}
function d_(i, e) {
  function t(n, r = ci) {
    let s;
    const a = _t.getTransfer(r);
    if (n === pi) return i.UNSIGNED_BYTE;
    if (n === cd) return i.UNSIGNED_SHORT_4_4_4_4;
    if (n === dd) return i.UNSIGNED_SHORT_5_5_5_1;
    if (n === Xh) return i.UNSIGNED_INT_5_9_9_9_REV;
    if (n === Gh) return i.BYTE;
    if (n === Wh) return i.SHORT;
    if (n === Ns) return i.UNSIGNED_SHORT;
    if (n === ld) return i.INT;
    if (n === vr) return i.UNSIGNED_INT;
    if (n === di) return i.FLOAT;
    if (n === Vs) return i.HALF_FLOAT;
    if (n === Yh) return i.ALPHA;
    if (n === qh) return i.RGB;
    if (n === Hn) return i.RGBA;
    if (n === jh) return i.LUMINANCE;
    if (n === Kh) return i.LUMINANCE_ALPHA;
    if (n === pr) return i.DEPTH_COMPONENT;
    if (n === yr) return i.DEPTH_STENCIL;
    if (n === $h) return i.RED;
    if (n === hd) return i.RED_INTEGER;
    if (n === Zh) return i.RG;
    if (n === ud) return i.RG_INTEGER;
    if (n === fd) return i.RGBA_INTEGER;
    if (n === ca || n === da || n === ha || n === ua)
      if (a === Pt)
        if (s = e.get("WEBGL_compressed_texture_s3tc_srgb"), s !== null) {
          if (n === ca) return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (n === da) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (n === ha) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (n === ua) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else
          return null;
      else if (s = e.get("WEBGL_compressed_texture_s3tc"), s !== null) {
        if (n === ca) return s.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === da) return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === ha) return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === ua) return s.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else
        return null;
    if (n === El || n === bl || n === Tl || n === Al)
      if (s = e.get("WEBGL_compressed_texture_pvrtc"), s !== null) {
        if (n === El) return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === bl) return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === Tl) return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === Al) return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else
        return null;
    if (n === wl || n === Rl || n === Cl)
      if (s = e.get("WEBGL_compressed_texture_etc"), s !== null) {
        if (n === wl || n === Rl) return a === Pt ? s.COMPRESSED_SRGB8_ETC2 : s.COMPRESSED_RGB8_ETC2;
        if (n === Cl) return a === Pt ? s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : s.COMPRESSED_RGBA8_ETC2_EAC;
      } else
        return null;
    if (n === Pl || n === Ll || n === Nl || n === Il || n === Dl || n === Ul || n === Ol || n === Fl || n === Bl || n === zl || n === kl || n === Vl || n === Hl || n === Gl)
      if (s = e.get("WEBGL_compressed_texture_astc"), s !== null) {
        if (n === Pl) return a === Pt ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : s.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === Ll) return a === Pt ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : s.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === Nl) return a === Pt ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : s.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === Il) return a === Pt ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : s.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === Dl) return a === Pt ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : s.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === Ul) return a === Pt ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : s.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === Ol) return a === Pt ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : s.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === Fl) return a === Pt ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : s.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === Bl) return a === Pt ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : s.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === zl) return a === Pt ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : s.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === kl) return a === Pt ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : s.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === Vl) return a === Pt ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : s.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === Hl) return a === Pt ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : s.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === Gl) return a === Pt ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : s.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (n === fa || n === Wl || n === Xl)
      if (s = e.get("EXT_texture_compression_bptc"), s !== null) {
        if (n === fa) return a === Pt ? s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : s.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === Wl) return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === Xl) return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else
        return null;
    if (n === Qh || n === Yl || n === ql || n === jl)
      if (s = e.get("EXT_texture_compression_rgtc"), s !== null) {
        if (n === fa) return s.COMPRESSED_RED_RGTC1_EXT;
        if (n === Yl) return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === ql) return s.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === jl) return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else
        return null;
    return n === xr ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null;
  }
  return { convert: t };
}
class h_ extends An {
  constructor(e = []) {
    super(), this.isArrayCamera = !0, this.cameras = e;
  }
}
class zr extends Wt {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}
const u_ = { type: "move" };
class za {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new zr(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new zr(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new N(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new N()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new zr(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new N(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new N()), this._grip;
  }
  dispatchEvent(e) {
    return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this;
  }
  connect(e) {
    if (e && e.hand) {
      const t = this._hand;
      if (t)
        for (const n of e.hand.values())
          this._getHandJoint(t, n);
    }
    return this.dispatchEvent({ type: "connected", data: e }), this;
  }
  disconnect(e) {
    return this.dispatchEvent({ type: "disconnected", data: e }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
  }
  update(e, t, n) {
    let r = null, s = null, a = null;
    const o = this._targetRay, l = this._grip, d = this._hand;
    if (e && t.session.visibilityState !== "visible-blurred") {
      if (d && e.hand) {
        a = !0;
        for (const x of e.hand.values()) {
          const c = t.getJointPose(x, n), h = this._getHandJoint(d, x);
          c !== null && (h.matrix.fromArray(c.transform.matrix), h.matrix.decompose(h.position, h.rotation, h.scale), h.matrixWorldNeedsUpdate = !0, h.jointRadius = c.radius), h.visible = c !== null;
        }
        const u = d.joints["index-finger-tip"], p = d.joints["thumb-tip"], f = u.position.distanceTo(p.position), m = 0.02, _ = 5e-3;
        d.inputState.pinching && f > m + _ ? (d.inputState.pinching = !1, this.dispatchEvent({
          type: "pinchend",
          handedness: e.handedness,
          target: this
        })) : !d.inputState.pinching && f <= m - _ && (d.inputState.pinching = !0, this.dispatchEvent({
          type: "pinchstart",
          handedness: e.handedness,
          target: this
        }));
      } else
        l !== null && e.gripSpace && (s = t.getPose(e.gripSpace, n), s !== null && (l.matrix.fromArray(s.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), l.matrixWorldNeedsUpdate = !0, s.linearVelocity ? (l.hasLinearVelocity = !0, l.linearVelocity.copy(s.linearVelocity)) : l.hasLinearVelocity = !1, s.angularVelocity ? (l.hasAngularVelocity = !0, l.angularVelocity.copy(s.angularVelocity)) : l.hasAngularVelocity = !1));
      o !== null && (r = t.getPose(e.targetRaySpace, n), r === null && s !== null && (r = s), r !== null && (o.matrix.fromArray(r.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(r.linearVelocity)) : o.hasLinearVelocity = !1, r.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(r.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(u_)));
    }
    return o !== null && (o.visible = r !== null), l !== null && (l.visible = s !== null), d !== null && (d.visible = a !== null), this;
  }
  // private method
  _getHandJoint(e, t) {
    if (e.joints[t.jointName] === void 0) {
      const n = new zr();
      n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n);
    }
    return e.joints[t.jointName];
  }
}
const f_ = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, p_ = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;
class m_ {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(e, t, n) {
    if (this.texture === null) {
      const r = new vn(), s = e.properties.get(r);
      s.__webglTexture = t.texture, (t.depthNear != n.depthNear || t.depthFar != n.depthFar) && (this.depthNear = t.depthNear, this.depthFar = t.depthFar), this.texture = r;
    }
  }
  getMesh(e) {
    if (this.texture !== null && this.mesh === null) {
      const t = e.cameras[0].viewport, n = new mi({
        vertexShader: f_,
        fragmentShader: p_,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: t.z },
          depthHeight: { value: t.w }
        }
      });
      this.mesh = new Te(new Xr(20, 20), n);
    }
    return this.mesh;
  }
  reset() {
    this.texture = null, this.mesh = null;
  }
}
class g_ extends Ui {
  constructor(e, t) {
    super();
    const n = this;
    let r = null, s = 1, a = null, o = "local-floor", l = 1, d = null, u = null, p = null, f = null, m = null, _ = null;
    const x = new m_(), c = t.getContextAttributes();
    let h = null, M = null;
    const y = [], w = [], I = new Xe();
    let R = null;
    const C = new An();
    C.layers.enable(1), C.viewport = new en();
    const U = new An();
    U.layers.enable(2), U.viewport = new en();
    const A = [C, U], v = new h_();
    v.layers.enable(1), v.layers.enable(2);
    let L = null, k = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(J) {
      let le = y[J];
      return le === void 0 && (le = new za(), y[J] = le), le.getTargetRaySpace();
    }, this.getControllerGrip = function(J) {
      let le = y[J];
      return le === void 0 && (le = new za(), y[J] = le), le.getGripSpace();
    }, this.getHand = function(J) {
      let le = y[J];
      return le === void 0 && (le = new za(), y[J] = le), le.getHandSpace();
    };
    function V(J) {
      const le = w.indexOf(J.inputSource);
      if (le === -1)
        return;
      const be = y[le];
      be !== void 0 && (be.update(J.inputSource, J.frame, d || a), be.dispatchEvent({ type: J.type, data: J.inputSource }));
    }
    function W() {
      r.removeEventListener("select", V), r.removeEventListener("selectstart", V), r.removeEventListener("selectend", V), r.removeEventListener("squeeze", V), r.removeEventListener("squeezestart", V), r.removeEventListener("squeezeend", V), r.removeEventListener("end", W), r.removeEventListener("inputsourceschange", Q);
      for (let J = 0; J < y.length; J++) {
        const le = w[J];
        le !== null && (w[J] = null, y[J].disconnect(le));
      }
      L = null, k = null, x.reset(), e.setRenderTarget(h), m = null, f = null, p = null, r = null, M = null, lt.stop(), n.isPresenting = !1, e.setPixelRatio(R), e.setSize(I.width, I.height, !1), n.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function(J) {
      s = J, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function(J) {
      o = J, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return d || a;
    }, this.setReferenceSpace = function(J) {
      d = J;
    }, this.getBaseLayer = function() {
      return f !== null ? f : m;
    }, this.getBinding = function() {
      return p;
    }, this.getFrame = function() {
      return _;
    }, this.getSession = function() {
      return r;
    }, this.setSession = async function(J) {
      if (r = J, r !== null) {
        if (h = e.getRenderTarget(), r.addEventListener("select", V), r.addEventListener("selectstart", V), r.addEventListener("selectend", V), r.addEventListener("squeeze", V), r.addEventListener("squeezestart", V), r.addEventListener("squeezeend", V), r.addEventListener("end", W), r.addEventListener("inputsourceschange", Q), c.xrCompatible !== !0 && await t.makeXRCompatible(), R = e.getPixelRatio(), e.getSize(I), r.renderState.layers === void 0) {
          const le = {
            antialias: c.antialias,
            alpha: !0,
            depth: c.depth,
            stencil: c.stencil,
            framebufferScaleFactor: s
          };
          m = new XRWebGLLayer(r, t, le), r.updateRenderState({ baseLayer: m }), e.setPixelRatio(1), e.setSize(m.framebufferWidth, m.framebufferHeight, !1), M = new Di(
            m.framebufferWidth,
            m.framebufferHeight,
            {
              format: Hn,
              type: pi,
              colorSpace: e.outputColorSpace,
              stencilBuffer: c.stencil
            }
          );
        } else {
          let le = null, be = null, ue = null;
          c.depth && (ue = c.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, le = c.stencil ? yr : pr, be = c.stencil ? xr : vr);
          const $e = {
            colorFormat: t.RGBA8,
            depthFormat: ue,
            scaleFactor: s
          };
          p = new XRWebGLBinding(r, t), f = p.createProjectionLayer($e), r.updateRenderState({ layers: [f] }), e.setPixelRatio(1), e.setSize(f.textureWidth, f.textureHeight, !1), M = new Di(
            f.textureWidth,
            f.textureHeight,
            {
              format: Hn,
              type: pi,
              depthTexture: new Rd(f.textureWidth, f.textureHeight, be, void 0, void 0, void 0, void 0, void 0, void 0, le),
              stencilBuffer: c.stencil,
              colorSpace: e.outputColorSpace,
              samples: c.antialias ? 4 : 0,
              resolveDepthBuffer: f.ignoreDepthValues === !1
            }
          );
        }
        M.isXRRenderTarget = !0, this.setFoveation(l), d = null, a = await r.requestReferenceSpace(o), lt.setContext(r), lt.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (r !== null)
        return r.environmentBlendMode;
    };
    function Q(J) {
      for (let le = 0; le < J.removed.length; le++) {
        const be = J.removed[le], ue = w.indexOf(be);
        ue >= 0 && (w[ue] = null, y[ue].disconnect(be));
      }
      for (let le = 0; le < J.added.length; le++) {
        const be = J.added[le];
        let ue = w.indexOf(be);
        if (ue === -1) {
          for (let Fe = 0; Fe < y.length; Fe++)
            if (Fe >= w.length) {
              w.push(be), ue = Fe;
              break;
            } else if (w[Fe] === null) {
              w[Fe] = be, ue = Fe;
              break;
            }
          if (ue === -1) break;
        }
        const $e = y[ue];
        $e && $e.connect(be);
      }
    }
    const j = new N(), re = new N();
    function K(J, le, be) {
      j.setFromMatrixPosition(le.matrixWorld), re.setFromMatrixPosition(be.matrixWorld);
      const ue = j.distanceTo(re), $e = le.projectionMatrix.elements, Fe = be.projectionMatrix.elements, et = $e[14] / ($e[10] - 1), D = $e[14] / ($e[10] + 1), nt = ($e[9] + 1) / $e[5], it = ($e[9] - 1) / $e[5], vt = ($e[8] - 1) / $e[0], De = (Fe[8] + 1) / Fe[0], Ye = et * vt, Ze = et * De, qe = ue / (-vt + De), Tt = qe * -vt;
      le.matrixWorld.decompose(J.position, J.quaternion, J.scale), J.translateX(Tt), J.translateZ(qe), J.matrixWorld.compose(J.position, J.quaternion, J.scale), J.matrixWorldInverse.copy(J.matrixWorld).invert();
      const P = et + qe, S = D + qe, Y = Ye - Tt, se = Ze + (ue - Tt), ae = nt * D / S * P, ie = it * D / S * P;
      J.projectionMatrix.makePerspective(Y, se, ae, ie, P, S), J.projectionMatrixInverse.copy(J.projectionMatrix).invert();
    }
    function de(J, le) {
      le === null ? J.matrixWorld.copy(J.matrix) : J.matrixWorld.multiplyMatrices(le.matrixWorld, J.matrix), J.matrixWorldInverse.copy(J.matrixWorld).invert();
    }
    this.updateCamera = function(J) {
      if (r === null) return;
      x.texture !== null && (J.near = x.depthNear, J.far = x.depthFar), v.near = U.near = C.near = J.near, v.far = U.far = C.far = J.far, (L !== v.near || k !== v.far) && (r.updateRenderState({
        depthNear: v.near,
        depthFar: v.far
      }), L = v.near, k = v.far, C.near = L, C.far = k, U.near = L, U.far = k, C.updateProjectionMatrix(), U.updateProjectionMatrix(), J.updateProjectionMatrix());
      const le = J.parent, be = v.cameras;
      de(v, le);
      for (let ue = 0; ue < be.length; ue++)
        de(be[ue], le);
      be.length === 2 ? K(v, C, U) : v.projectionMatrix.copy(C.projectionMatrix), _e(J, v, le);
    };
    function _e(J, le, be) {
      be === null ? J.matrix.copy(le.matrixWorld) : (J.matrix.copy(be.matrixWorld), J.matrix.invert(), J.matrix.multiply(le.matrixWorld)), J.matrix.decompose(J.position, J.quaternion, J.scale), J.updateMatrixWorld(!0), J.projectionMatrix.copy(le.projectionMatrix), J.projectionMatrixInverse.copy(le.projectionMatrixInverse), J.isPerspectiveCamera && (J.fov = to * 2 * Math.atan(1 / J.projectionMatrix.elements[5]), J.zoom = 1);
    }
    this.getCamera = function() {
      return v;
    }, this.getFoveation = function() {
      if (!(f === null && m === null))
        return l;
    }, this.setFoveation = function(J) {
      l = J, f !== null && (f.fixedFoveation = J), m !== null && m.fixedFoveation !== void 0 && (m.fixedFoveation = J);
    }, this.hasDepthSensing = function() {
      return x.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return x.getMesh(v);
    };
    let Ee = null;
    function Je(J, le) {
      if (u = le.getViewerPose(d || a), _ = le, u !== null) {
        const be = u.views;
        m !== null && (e.setRenderTargetFramebuffer(M, m.framebuffer), e.setRenderTarget(M));
        let ue = !1;
        be.length !== v.cameras.length && (v.cameras.length = 0, ue = !0);
        for (let Fe = 0; Fe < be.length; Fe++) {
          const et = be[Fe];
          let D = null;
          if (m !== null)
            D = m.getViewport(et);
          else {
            const it = p.getViewSubImage(f, et);
            D = it.viewport, Fe === 0 && (e.setRenderTargetTextures(
              M,
              it.colorTexture,
              f.ignoreDepthValues ? void 0 : it.depthStencilTexture
            ), e.setRenderTarget(M));
          }
          let nt = A[Fe];
          nt === void 0 && (nt = new An(), nt.layers.enable(Fe), nt.viewport = new en(), A[Fe] = nt), nt.matrix.fromArray(et.transform.matrix), nt.matrix.decompose(nt.position, nt.quaternion, nt.scale), nt.projectionMatrix.fromArray(et.projectionMatrix), nt.projectionMatrixInverse.copy(nt.projectionMatrix).invert(), nt.viewport.set(D.x, D.y, D.width, D.height), Fe === 0 && (v.matrix.copy(nt.matrix), v.matrix.decompose(v.position, v.quaternion, v.scale)), ue === !0 && v.cameras.push(nt);
        }
        const $e = r.enabledFeatures;
        if ($e && $e.includes("depth-sensing")) {
          const Fe = p.getDepthInformation(be[0]);
          Fe && Fe.isValid && Fe.texture && x.init(e, Fe, r.renderState);
        }
      }
      for (let be = 0; be < y.length; be++) {
        const ue = w[be], $e = y[be];
        ue !== null && $e !== void 0 && $e.update(ue, le, d || a);
      }
      Ee && Ee(J, le), le.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: le }), _ = null;
    }
    const lt = new Ad();
    lt.setAnimationLoop(Je), this.setAnimationLoop = function(J) {
      Ee = J;
    }, this.dispose = function() {
    };
  }
}
const bi = /* @__PURE__ */ new En(), __ = /* @__PURE__ */ new yt();
function v_(i, e) {
  function t(c, h) {
    c.matrixAutoUpdate === !0 && c.updateMatrix(), h.value.copy(c.matrix);
  }
  function n(c, h) {
    h.color.getRGB(c.fogColor.value, Ed(i)), h.isFog ? (c.fogNear.value = h.near, c.fogFar.value = h.far) : h.isFogExp2 && (c.fogDensity.value = h.density);
  }
  function r(c, h, M, y, w) {
    h.isMeshBasicMaterial || h.isMeshLambertMaterial ? s(c, h) : h.isMeshToonMaterial ? (s(c, h), p(c, h)) : h.isMeshPhongMaterial ? (s(c, h), u(c, h)) : h.isMeshStandardMaterial ? (s(c, h), f(c, h), h.isMeshPhysicalMaterial && m(c, h, w)) : h.isMeshMatcapMaterial ? (s(c, h), _(c, h)) : h.isMeshDepthMaterial ? s(c, h) : h.isMeshDistanceMaterial ? (s(c, h), x(c, h)) : h.isMeshNormalMaterial ? s(c, h) : h.isLineBasicMaterial ? (a(c, h), h.isLineDashedMaterial && o(c, h)) : h.isPointsMaterial ? l(c, h, M, y) : h.isSpriteMaterial ? d(c, h) : h.isShadowMaterial ? (c.color.value.copy(h.color), c.opacity.value = h.opacity) : h.isShaderMaterial && (h.uniformsNeedUpdate = !1);
  }
  function s(c, h) {
    c.opacity.value = h.opacity, h.color && c.diffuse.value.copy(h.color), h.emissive && c.emissive.value.copy(h.emissive).multiplyScalar(h.emissiveIntensity), h.map && (c.map.value = h.map, t(h.map, c.mapTransform)), h.alphaMap && (c.alphaMap.value = h.alphaMap, t(h.alphaMap, c.alphaMapTransform)), h.bumpMap && (c.bumpMap.value = h.bumpMap, t(h.bumpMap, c.bumpMapTransform), c.bumpScale.value = h.bumpScale, h.side === _n && (c.bumpScale.value *= -1)), h.normalMap && (c.normalMap.value = h.normalMap, t(h.normalMap, c.normalMapTransform), c.normalScale.value.copy(h.normalScale), h.side === _n && c.normalScale.value.negate()), h.displacementMap && (c.displacementMap.value = h.displacementMap, t(h.displacementMap, c.displacementMapTransform), c.displacementScale.value = h.displacementScale, c.displacementBias.value = h.displacementBias), h.emissiveMap && (c.emissiveMap.value = h.emissiveMap, t(h.emissiveMap, c.emissiveMapTransform)), h.specularMap && (c.specularMap.value = h.specularMap, t(h.specularMap, c.specularMapTransform)), h.alphaTest > 0 && (c.alphaTest.value = h.alphaTest);
    const M = e.get(h), y = M.envMap, w = M.envMapRotation;
    y && (c.envMap.value = y, bi.copy(w), bi.x *= -1, bi.y *= -1, bi.z *= -1, y.isCubeTexture && y.isRenderTargetTexture === !1 && (bi.y *= -1, bi.z *= -1), c.envMapRotation.value.setFromMatrix4(__.makeRotationFromEuler(bi)), c.flipEnvMap.value = y.isCubeTexture && y.isRenderTargetTexture === !1 ? -1 : 1, c.reflectivity.value = h.reflectivity, c.ior.value = h.ior, c.refractionRatio.value = h.refractionRatio), h.lightMap && (c.lightMap.value = h.lightMap, c.lightMapIntensity.value = h.lightMapIntensity, t(h.lightMap, c.lightMapTransform)), h.aoMap && (c.aoMap.value = h.aoMap, c.aoMapIntensity.value = h.aoMapIntensity, t(h.aoMap, c.aoMapTransform));
  }
  function a(c, h) {
    c.diffuse.value.copy(h.color), c.opacity.value = h.opacity, h.map && (c.map.value = h.map, t(h.map, c.mapTransform));
  }
  function o(c, h) {
    c.dashSize.value = h.dashSize, c.totalSize.value = h.dashSize + h.gapSize, c.scale.value = h.scale;
  }
  function l(c, h, M, y) {
    c.diffuse.value.copy(h.color), c.opacity.value = h.opacity, c.size.value = h.size * M, c.scale.value = y * 0.5, h.map && (c.map.value = h.map, t(h.map, c.uvTransform)), h.alphaMap && (c.alphaMap.value = h.alphaMap, t(h.alphaMap, c.alphaMapTransform)), h.alphaTest > 0 && (c.alphaTest.value = h.alphaTest);
  }
  function d(c, h) {
    c.diffuse.value.copy(h.color), c.opacity.value = h.opacity, c.rotation.value = h.rotation, h.map && (c.map.value = h.map, t(h.map, c.mapTransform)), h.alphaMap && (c.alphaMap.value = h.alphaMap, t(h.alphaMap, c.alphaMapTransform)), h.alphaTest > 0 && (c.alphaTest.value = h.alphaTest);
  }
  function u(c, h) {
    c.specular.value.copy(h.specular), c.shininess.value = Math.max(h.shininess, 1e-4);
  }
  function p(c, h) {
    h.gradientMap && (c.gradientMap.value = h.gradientMap);
  }
  function f(c, h) {
    c.metalness.value = h.metalness, h.metalnessMap && (c.metalnessMap.value = h.metalnessMap, t(h.metalnessMap, c.metalnessMapTransform)), c.roughness.value = h.roughness, h.roughnessMap && (c.roughnessMap.value = h.roughnessMap, t(h.roughnessMap, c.roughnessMapTransform)), h.envMap && (c.envMapIntensity.value = h.envMapIntensity);
  }
  function m(c, h, M) {
    c.ior.value = h.ior, h.sheen > 0 && (c.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen), c.sheenRoughness.value = h.sheenRoughness, h.sheenColorMap && (c.sheenColorMap.value = h.sheenColorMap, t(h.sheenColorMap, c.sheenColorMapTransform)), h.sheenRoughnessMap && (c.sheenRoughnessMap.value = h.sheenRoughnessMap, t(h.sheenRoughnessMap, c.sheenRoughnessMapTransform))), h.clearcoat > 0 && (c.clearcoat.value = h.clearcoat, c.clearcoatRoughness.value = h.clearcoatRoughness, h.clearcoatMap && (c.clearcoatMap.value = h.clearcoatMap, t(h.clearcoatMap, c.clearcoatMapTransform)), h.clearcoatRoughnessMap && (c.clearcoatRoughnessMap.value = h.clearcoatRoughnessMap, t(h.clearcoatRoughnessMap, c.clearcoatRoughnessMapTransform)), h.clearcoatNormalMap && (c.clearcoatNormalMap.value = h.clearcoatNormalMap, t(h.clearcoatNormalMap, c.clearcoatNormalMapTransform), c.clearcoatNormalScale.value.copy(h.clearcoatNormalScale), h.side === _n && c.clearcoatNormalScale.value.negate())), h.dispersion > 0 && (c.dispersion.value = h.dispersion), h.iridescence > 0 && (c.iridescence.value = h.iridescence, c.iridescenceIOR.value = h.iridescenceIOR, c.iridescenceThicknessMinimum.value = h.iridescenceThicknessRange[0], c.iridescenceThicknessMaximum.value = h.iridescenceThicknessRange[1], h.iridescenceMap && (c.iridescenceMap.value = h.iridescenceMap, t(h.iridescenceMap, c.iridescenceMapTransform)), h.iridescenceThicknessMap && (c.iridescenceThicknessMap.value = h.iridescenceThicknessMap, t(h.iridescenceThicknessMap, c.iridescenceThicknessMapTransform))), h.transmission > 0 && (c.transmission.value = h.transmission, c.transmissionSamplerMap.value = M.texture, c.transmissionSamplerSize.value.set(M.width, M.height), h.transmissionMap && (c.transmissionMap.value = h.transmissionMap, t(h.transmissionMap, c.transmissionMapTransform)), c.thickness.value = h.thickness, h.thicknessMap && (c.thicknessMap.value = h.thicknessMap, t(h.thicknessMap, c.thicknessMapTransform)), c.attenuationDistance.value = h.attenuationDistance, c.attenuationColor.value.copy(h.attenuationColor)), h.anisotropy > 0 && (c.anisotropyVector.value.set(h.anisotropy * Math.cos(h.anisotropyRotation), h.anisotropy * Math.sin(h.anisotropyRotation)), h.anisotropyMap && (c.anisotropyMap.value = h.anisotropyMap, t(h.anisotropyMap, c.anisotropyMapTransform))), c.specularIntensity.value = h.specularIntensity, c.specularColor.value.copy(h.specularColor), h.specularColorMap && (c.specularColorMap.value = h.specularColorMap, t(h.specularColorMap, c.specularColorMapTransform)), h.specularIntensityMap && (c.specularIntensityMap.value = h.specularIntensityMap, t(h.specularIntensityMap, c.specularIntensityMapTransform));
  }
  function _(c, h) {
    h.matcap && (c.matcap.value = h.matcap);
  }
  function x(c, h) {
    const M = e.get(h).light;
    c.referencePosition.value.setFromMatrixPosition(M.matrixWorld), c.nearDistance.value = M.shadow.camera.near, c.farDistance.value = M.shadow.camera.far;
  }
  return {
    refreshFogUniforms: n,
    refreshMaterialUniforms: r
  };
}
function x_(i, e, t, n) {
  let r = {}, s = {}, a = [];
  const o = i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(M, y) {
    const w = y.program;
    n.uniformBlockBinding(M, w);
  }
  function d(M, y) {
    let w = r[M.id];
    w === void 0 && (_(M), w = u(M), r[M.id] = w, M.addEventListener("dispose", c));
    const I = y.program;
    n.updateUBOMapping(M, I);
    const R = e.render.frame;
    s[M.id] !== R && (f(M), s[M.id] = R);
  }
  function u(M) {
    const y = p();
    M.__bindingPointIndex = y;
    const w = i.createBuffer(), I = M.__size, R = M.usage;
    return i.bindBuffer(i.UNIFORM_BUFFER, w), i.bufferData(i.UNIFORM_BUFFER, I, R), i.bindBuffer(i.UNIFORM_BUFFER, null), i.bindBufferBase(i.UNIFORM_BUFFER, y, w), w;
  }
  function p() {
    for (let M = 0; M < o; M++)
      if (a.indexOf(M) === -1)
        return a.push(M), M;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function f(M) {
    const y = r[M.id], w = M.uniforms, I = M.__cache;
    i.bindBuffer(i.UNIFORM_BUFFER, y);
    for (let R = 0, C = w.length; R < C; R++) {
      const U = Array.isArray(w[R]) ? w[R] : [w[R]];
      for (let A = 0, v = U.length; A < v; A++) {
        const L = U[A];
        if (m(L, R, A, I) === !0) {
          const k = L.__offset, V = Array.isArray(L.value) ? L.value : [L.value];
          let W = 0;
          for (let Q = 0; Q < V.length; Q++) {
            const j = V[Q], re = x(j);
            typeof j == "number" || typeof j == "boolean" ? (L.__data[0] = j, i.bufferSubData(i.UNIFORM_BUFFER, k + W, L.__data)) : j.isMatrix3 ? (L.__data[0] = j.elements[0], L.__data[1] = j.elements[1], L.__data[2] = j.elements[2], L.__data[3] = 0, L.__data[4] = j.elements[3], L.__data[5] = j.elements[4], L.__data[6] = j.elements[5], L.__data[7] = 0, L.__data[8] = j.elements[6], L.__data[9] = j.elements[7], L.__data[10] = j.elements[8], L.__data[11] = 0) : (j.toArray(L.__data, W), W += re.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          i.bufferSubData(i.UNIFORM_BUFFER, k, L.__data);
        }
      }
    }
    i.bindBuffer(i.UNIFORM_BUFFER, null);
  }
  function m(M, y, w, I) {
    const R = M.value, C = y + "_" + w;
    if (I[C] === void 0)
      return typeof R == "number" || typeof R == "boolean" ? I[C] = R : I[C] = R.clone(), !0;
    {
      const U = I[C];
      if (typeof R == "number" || typeof R == "boolean") {
        if (U !== R)
          return I[C] = R, !0;
      } else if (U.equals(R) === !1)
        return U.copy(R), !0;
    }
    return !1;
  }
  function _(M) {
    const y = M.uniforms;
    let w = 0;
    const I = 16;
    for (let C = 0, U = y.length; C < U; C++) {
      const A = Array.isArray(y[C]) ? y[C] : [y[C]];
      for (let v = 0, L = A.length; v < L; v++) {
        const k = A[v], V = Array.isArray(k.value) ? k.value : [k.value];
        for (let W = 0, Q = V.length; W < Q; W++) {
          const j = V[W], re = x(j), K = w % I;
          K !== 0 && I - K < re.boundary && (w += I - K), k.__data = new Float32Array(re.storage / Float32Array.BYTES_PER_ELEMENT), k.__offset = w, w += re.storage;
        }
      }
    }
    const R = w % I;
    return R > 0 && (w += I - R), M.__size = w, M.__cache = {}, this;
  }
  function x(M) {
    const y = {
      boundary: 0,
      // bytes
      storage: 0
      // bytes
    };
    return typeof M == "number" || typeof M == "boolean" ? (y.boundary = 4, y.storage = 4) : M.isVector2 ? (y.boundary = 8, y.storage = 8) : M.isVector3 || M.isColor ? (y.boundary = 16, y.storage = 12) : M.isVector4 ? (y.boundary = 16, y.storage = 16) : M.isMatrix3 ? (y.boundary = 48, y.storage = 48) : M.isMatrix4 ? (y.boundary = 64, y.storage = 64) : M.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", M), y;
  }
  function c(M) {
    const y = M.target;
    y.removeEventListener("dispose", c);
    const w = a.indexOf(y.__bindingPointIndex);
    a.splice(w, 1), i.deleteBuffer(r[y.id]), delete r[y.id], delete s[y.id];
  }
  function h() {
    for (const M in r)
      i.deleteBuffer(r[M]);
    a = [], r = {}, s = {};
  }
  return {
    bind: l,
    update: d,
    dispose: h
  };
}
class y_ {
  constructor(e = {}) {
    const {
      canvas: t = hu(),
      context: n = null,
      depth: r = !0,
      stencil: s = !1,
      alpha: a = !1,
      antialias: o = !1,
      premultipliedAlpha: l = !0,
      preserveDrawingBuffer: d = !1,
      powerPreference: u = "default",
      failIfMajorPerformanceCaveat: p = !1
    } = e;
    this.isWebGLRenderer = !0;
    let f;
    if (n !== null) {
      if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext)
        throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      f = n.getContextAttributes().alpha;
    } else
      f = a;
    const m = new Uint32Array(4), _ = new Int32Array(4);
    let x = null, c = null;
    const h = [], M = [];
    this.domElement = t, this.debug = {
      /**
       * Enables error checking and reporting when shader programs are being compiled
       * @type {boolean}
       */
      checkShaderErrors: !0,
      /**
       * Callback for custom error reporting.
       * @type {?Function}
       */
      onShaderError: null
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this._outputColorSpace = Bn, this.toneMapping = ui, this.toneMappingExposure = 1;
    const y = this;
    let w = !1, I = 0, R = 0, C = null, U = -1, A = null;
    const v = new en(), L = new en();
    let k = null;
    const V = new ut(0);
    let W = 0, Q = t.width, j = t.height, re = 1, K = null, de = null;
    const _e = new en(0, 0, Q, j), Ee = new en(0, 0, Q, j);
    let Je = !1;
    const lt = new ho();
    let J = !1, le = !1;
    const be = new yt(), ue = new N(), $e = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let Fe = !1;
    function et() {
      return C === null ? re : 1;
    }
    let D = n;
    function nt(T, O) {
      return t.getContext(T, O);
    }
    try {
      const T = {
        alpha: !0,
        depth: r,
        stencil: s,
        antialias: o,
        premultipliedAlpha: l,
        preserveDrawingBuffer: d,
        powerPreference: u,
        failIfMajorPerformanceCaveat: p
      };
      if ("setAttribute" in t && t.setAttribute("data-engine", `three.js r${ao}`), t.addEventListener("webglcontextlost", q, !1), t.addEventListener("webglcontextrestored", z, !1), t.addEventListener("webglcontextcreationerror", $, !1), D === null) {
        const O = "webgl2";
        if (D = nt(O, T), D === null)
          throw nt(O) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (T) {
      throw console.error("THREE.WebGLRenderer: " + T.message), T;
    }
    let it, vt, De, Ye, Ze, qe, Tt, P, S, Y, se, ae, ie, Re, fe, pe, je, ce, Le, rt, Ue, xe, Ge, He;
    function xt() {
      it = new Rm(D), it.init(), xe = new d_(D, it), vt = new Mm(D, it, e, xe), De = new l_(D), Ye = new Lm(D), Ze = new jg(), qe = new c_(D, it, De, Ze, vt, xe, Ye), Tt = new bm(y), P = new wm(y), S = new Fu(D), Ge = new ym(D, S), Y = new Cm(D, S, Ye, Ge), se = new Im(D, Y, S, Ye), Le = new Nm(D, vt, qe), pe = new Em(Ze), ae = new qg(y, Tt, P, it, vt, Ge, pe), ie = new v_(y, Ze), Re = new $g(), fe = new n_(it), ce = new xm(y, Tt, P, De, se, f, l), je = new o_(y, se, vt), He = new x_(D, Ye, vt, De), rt = new Sm(D, it, Ye), Ue = new Pm(D, it, Ye), Ye.programs = ae.programs, y.capabilities = vt, y.extensions = it, y.properties = Ze, y.renderLists = Re, y.shadowMap = je, y.state = De, y.info = Ye;
    }
    xt();
    const g = new g_(y, D);
    this.xr = g, this.getContext = function() {
      return D;
    }, this.getContextAttributes = function() {
      return D.getContextAttributes();
    }, this.forceContextLoss = function() {
      const T = it.get("WEBGL_lose_context");
      T && T.loseContext();
    }, this.forceContextRestore = function() {
      const T = it.get("WEBGL_lose_context");
      T && T.restoreContext();
    }, this.getPixelRatio = function() {
      return re;
    }, this.setPixelRatio = function(T) {
      T !== void 0 && (re = T, this.setSize(Q, j, !1));
    }, this.getSize = function(T) {
      return T.set(Q, j);
    }, this.setSize = function(T, O, G = !0) {
      if (g.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      Q = T, j = O, t.width = Math.floor(T * re), t.height = Math.floor(O * re), G === !0 && (t.style.width = T + "px", t.style.height = O + "px"), this.setViewport(0, 0, T, O);
    }, this.getDrawingBufferSize = function(T) {
      return T.set(Q * re, j * re).floor();
    }, this.setDrawingBufferSize = function(T, O, G) {
      Q = T, j = O, re = G, t.width = Math.floor(T * G), t.height = Math.floor(O * G), this.setViewport(0, 0, T, O);
    }, this.getCurrentViewport = function(T) {
      return T.copy(v);
    }, this.getViewport = function(T) {
      return T.copy(_e);
    }, this.setViewport = function(T, O, G, X) {
      T.isVector4 ? _e.set(T.x, T.y, T.z, T.w) : _e.set(T, O, G, X), De.viewport(v.copy(_e).multiplyScalar(re).round());
    }, this.getScissor = function(T) {
      return T.copy(Ee);
    }, this.setScissor = function(T, O, G, X) {
      T.isVector4 ? Ee.set(T.x, T.y, T.z, T.w) : Ee.set(T, O, G, X), De.scissor(L.copy(Ee).multiplyScalar(re).round());
    }, this.getScissorTest = function() {
      return Je;
    }, this.setScissorTest = function(T) {
      De.setScissorTest(Je = T);
    }, this.setOpaqueSort = function(T) {
      K = T;
    }, this.setTransparentSort = function(T) {
      de = T;
    }, this.getClearColor = function(T) {
      return T.copy(ce.getClearColor());
    }, this.setClearColor = function() {
      ce.setClearColor.apply(ce, arguments);
    }, this.getClearAlpha = function() {
      return ce.getClearAlpha();
    }, this.setClearAlpha = function() {
      ce.setClearAlpha.apply(ce, arguments);
    }, this.clear = function(T = !0, O = !0, G = !0) {
      let X = 0;
      if (T) {
        let B = !1;
        if (C !== null) {
          const he = C.texture.format;
          B = he === fd || he === ud || he === hd;
        }
        if (B) {
          const he = C.texture.type, Me = he === pi || he === vr || he === Ns || he === xr || he === cd || he === dd, we = ce.getClearColor(), Ne = ce.getClearAlpha(), ze = we.r, ke = we.g, Oe = we.b;
          Me ? (m[0] = ze, m[1] = ke, m[2] = Oe, m[3] = Ne, D.clearBufferuiv(D.COLOR, 0, m)) : (_[0] = ze, _[1] = ke, _[2] = Oe, _[3] = Ne, D.clearBufferiv(D.COLOR, 0, _));
        } else
          X |= D.COLOR_BUFFER_BIT;
      }
      O && (X |= D.DEPTH_BUFFER_BIT), G && (X |= D.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), D.clear(X);
    }, this.clearColor = function() {
      this.clear(!0, !1, !1);
    }, this.clearDepth = function() {
      this.clear(!1, !0, !1);
    }, this.clearStencil = function() {
      this.clear(!1, !1, !0);
    }, this.dispose = function() {
      t.removeEventListener("webglcontextlost", q, !1), t.removeEventListener("webglcontextrestored", z, !1), t.removeEventListener("webglcontextcreationerror", $, !1), Re.dispose(), fe.dispose(), Ze.dispose(), Tt.dispose(), P.dispose(), se.dispose(), Ge.dispose(), He.dispose(), ae.dispose(), g.dispose(), g.removeEventListener("sessionstart", bt), g.removeEventListener("sessionend", It), tn.stop();
    };
    function q(T) {
      T.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), w = !0;
    }
    function z() {
      console.log("THREE.WebGLRenderer: Context Restored."), w = !1;
      const T = Ye.autoReset, O = je.enabled, G = je.autoUpdate, X = je.needsUpdate, B = je.type;
      xt(), Ye.autoReset = T, je.enabled = O, je.autoUpdate = G, je.needsUpdate = X, je.type = B;
    }
    function $(T) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", T.statusMessage);
    }
    function ne(T) {
      const O = T.target;
      O.removeEventListener("dispose", ne), Ce(O);
    }
    function Ce(T) {
      Be(T), Ze.remove(T);
    }
    function Be(T) {
      const O = Ze.get(T).programs;
      O !== void 0 && (O.forEach(function(G) {
        ae.releaseProgram(G);
      }), T.isShaderMaterial && ae.releaseShaderCache(T));
    }
    this.renderBufferDirect = function(T, O, G, X, B, he) {
      O === null && (O = $e);
      const Me = B.isMesh && B.matrixWorld.determinant() < 0, we = Dn(T, O, G, X, B);
      De.setMaterial(X, Me);
      let Ne = G.index, ze = 1;
      if (X.wireframe === !0) {
        if (Ne = Y.getWireframeAttribute(G), Ne === void 0) return;
        ze = 2;
      }
      const ke = G.drawRange, Oe = G.attributes.position;
      let ft = ke.start * ze, wt = (ke.start + ke.count) * ze;
      he !== null && (ft = Math.max(ft, he.start * ze), wt = Math.min(wt, (he.start + he.count) * ze)), Ne !== null ? (ft = Math.max(ft, 0), wt = Math.min(wt, Ne.count)) : Oe != null && (ft = Math.max(ft, 0), wt = Math.min(wt, Oe.count));
      const St = wt - ft;
      if (St < 0 || St === 1 / 0) return;
      Ge.setup(B, X, we, G, Ne);
      let Bt, pt = rt;
      if (Ne !== null && (Bt = S.get(Ne), pt = Ue, pt.setIndex(Bt)), B.isMesh)
        X.wireframe === !0 ? (De.setLineWidth(X.wireframeLinewidth * et()), pt.setMode(D.LINES)) : pt.setMode(D.TRIANGLES);
      else if (B.isLine) {
        let Ae = X.linewidth;
        Ae === void 0 && (Ae = 1), De.setLineWidth(Ae * et()), B.isLineSegments ? pt.setMode(D.LINES) : B.isLineLoop ? pt.setMode(D.LINE_LOOP) : pt.setMode(D.LINE_STRIP);
      } else B.isPoints ? pt.setMode(D.POINTS) : B.isSprite && pt.setMode(D.TRIANGLES);
      if (B.isBatchedMesh)
        B._multiDrawInstances !== null ? pt.renderMultiDrawInstances(B._multiDrawStarts, B._multiDrawCounts, B._multiDrawCount, B._multiDrawInstances) : pt.renderMultiDraw(B._multiDrawStarts, B._multiDrawCounts, B._multiDrawCount);
      else if (B.isInstancedMesh)
        pt.renderInstances(ft, St, B.count);
      else if (G.isInstancedBufferGeometry) {
        const Ae = G._maxInstanceCount !== void 0 ? G._maxInstanceCount : 1 / 0, Ht = Math.min(G.instanceCount, Ae);
        pt.renderInstances(ft, St, Ht);
      } else
        pt.render(ft, St);
    };
    function At(T, O, G) {
      T.transparent === !0 && T.side === kn && T.forceSinglePass === !1 ? (T.side = _n, T.needsUpdate = !0, Wn(T, O, G), T.side = fi, T.needsUpdate = !0, Wn(T, O, G), T.side = kn) : Wn(T, O, G);
    }
    this.compile = function(T, O, G = null) {
      G === null && (G = T), c = fe.get(G), c.init(O), M.push(c), G.traverseVisible(function(B) {
        B.isLight && B.layers.test(O.layers) && (c.pushLight(B), B.castShadow && c.pushShadow(B));
      }), T !== G && T.traverseVisible(function(B) {
        B.isLight && B.layers.test(O.layers) && (c.pushLight(B), B.castShadow && c.pushShadow(B));
      }), c.setupLights();
      const X = /* @__PURE__ */ new Set();
      return T.traverse(function(B) {
        const he = B.material;
        if (he)
          if (Array.isArray(he))
            for (let Me = 0; Me < he.length; Me++) {
              const we = he[Me];
              At(we, G, B), X.add(we);
            }
          else
            At(he, G, B), X.add(he);
      }), M.pop(), c = null, X;
    }, this.compileAsync = function(T, O, G = null) {
      const X = this.compile(T, O, G);
      return new Promise((B) => {
        function he() {
          if (X.forEach(function(Me) {
            Ze.get(Me).currentProgram.isReady() && X.delete(Me);
          }), X.size === 0) {
            B(T);
            return;
          }
          setTimeout(he, 10);
        }
        it.get("KHR_parallel_shader_compile") !== null ? he() : setTimeout(he, 10);
      });
    };
    let Lt = null;
    function ct(T) {
      Lt && Lt(T);
    }
    function bt() {
      tn.stop();
    }
    function It() {
      tn.start();
    }
    const tn = new Ad();
    tn.setAnimationLoop(ct), typeof self < "u" && tn.setContext(self), this.setAnimationLoop = function(T) {
      Lt = T, g.setAnimationLoop(T), T === null ? tn.stop() : tn.start();
    }, g.addEventListener("sessionstart", bt), g.addEventListener("sessionend", It), this.render = function(T, O) {
      if (O !== void 0 && O.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (w === !0) return;
      if (T.matrixWorldAutoUpdate === !0 && T.updateMatrixWorld(), O.parent === null && O.matrixWorldAutoUpdate === !0 && O.updateMatrixWorld(), g.enabled === !0 && g.isPresenting === !0 && (g.cameraAutoUpdate === !0 && g.updateCamera(O), O = g.getCamera()), T.isScene === !0 && T.onBeforeRender(y, T, O, C), c = fe.get(T, M.length), c.init(O), M.push(c), be.multiplyMatrices(O.projectionMatrix, O.matrixWorldInverse), lt.setFromProjectionMatrix(be), le = this.localClippingEnabled, J = pe.init(this.clippingPlanes, le), x = Re.get(T, h.length), x.init(), h.push(x), g.enabled === !0 && g.isPresenting === !0) {
        const he = y.xr.getDepthSensingMesh();
        he !== null && Vt(he, O, -1 / 0, y.sortObjects);
      }
      Vt(T, O, 0, y.sortObjects), x.finish(), y.sortObjects === !0 && x.sort(K, de), Fe = g.enabled === !1 || g.isPresenting === !1 || g.hasDepthSensing() === !1, Fe && ce.addToRenderList(x, T), this.info.render.frame++, J === !0 && pe.beginShadows();
      const G = c.state.shadowsArray;
      je.render(G, T, O), J === !0 && pe.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const X = x.opaque, B = x.transmissive;
      if (c.setupLights(), O.isArrayCamera) {
        const he = O.cameras;
        if (B.length > 0)
          for (let Me = 0, we = he.length; Me < we; Me++) {
            const Ne = he[Me];
            Rn(X, B, T, Ne);
          }
        Fe && ce.render(T);
        for (let Me = 0, we = he.length; Me < we; Me++) {
          const Ne = he[Me];
          Kt(x, T, Ne, Ne.viewport);
        }
      } else
        B.length > 0 && Rn(X, B, T, O), Fe && ce.render(T), Kt(x, T, O);
      C !== null && (qe.updateMultisampleRenderTarget(C), qe.updateRenderTargetMipmap(C)), T.isScene === !0 && T.onAfterRender(y, T, O), Ge.resetDefaultState(), U = -1, A = null, M.pop(), M.length > 0 ? (c = M[M.length - 1], J === !0 && pe.setGlobalState(y.clippingPlanes, c.state.camera)) : c = null, h.pop(), h.length > 0 ? x = h[h.length - 1] : x = null;
    };
    function Vt(T, O, G, X) {
      if (T.visible === !1) return;
      if (T.layers.test(O.layers)) {
        if (T.isGroup)
          G = T.renderOrder;
        else if (T.isLOD)
          T.autoUpdate === !0 && T.update(O);
        else if (T.isLight)
          c.pushLight(T), T.castShadow && c.pushShadow(T);
        else if (T.isSprite) {
          if (!T.frustumCulled || lt.intersectsSprite(T)) {
            X && ue.setFromMatrixPosition(T.matrixWorld).applyMatrix4(be);
            const Me = se.update(T), we = T.material;
            we.visible && x.push(T, Me, we, G, ue.z, null);
          }
        } else if ((T.isMesh || T.isLine || T.isPoints) && (!T.frustumCulled || lt.intersectsObject(T))) {
          const Me = se.update(T), we = T.material;
          if (X && (T.boundingSphere !== void 0 ? (T.boundingSphere === null && T.computeBoundingSphere(), ue.copy(T.boundingSphere.center)) : (Me.boundingSphere === null && Me.computeBoundingSphere(), ue.copy(Me.boundingSphere.center)), ue.applyMatrix4(T.matrixWorld).applyMatrix4(be)), Array.isArray(we)) {
            const Ne = Me.groups;
            for (let ze = 0, ke = Ne.length; ze < ke; ze++) {
              const Oe = Ne[ze], ft = we[Oe.materialIndex];
              ft && ft.visible && x.push(T, Me, ft, G, ue.z, Oe);
            }
          } else we.visible && x.push(T, Me, we, G, ue.z, null);
        }
      }
      const he = T.children;
      for (let Me = 0, we = he.length; Me < we; Me++)
        Vt(he[Me], O, G, X);
    }
    function Kt(T, O, G, X) {
      const B = T.opaque, he = T.transmissive, Me = T.transparent;
      c.setupLightsView(G), J === !0 && pe.setGlobalState(y.clippingPlanes, G), X && De.viewport(v.copy(X)), B.length > 0 && bn(B, O, G), he.length > 0 && bn(he, O, G), Me.length > 0 && bn(Me, O, G), De.buffers.depth.setTest(!0), De.buffers.depth.setMask(!0), De.buffers.color.setMask(!0), De.setPolygonOffset(!1);
    }
    function Rn(T, O, G, X) {
      if ((G.isScene === !0 ? G.overrideMaterial : null) !== null)
        return;
      c.state.transmissionRenderTarget[X.id] === void 0 && (c.state.transmissionRenderTarget[X.id] = new Di(1, 1, {
        generateMipmaps: !0,
        type: it.has("EXT_color_buffer_half_float") || it.has("EXT_color_buffer_float") ? Vs : pi,
        minFilter: Ni,
        samples: 4,
        stencilBuffer: s,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: _t.workingColorSpace
      }));
      const he = c.state.transmissionRenderTarget[X.id], Me = X.viewport || v;
      he.setSize(Me.z, Me.w);
      const we = y.getRenderTarget();
      y.setRenderTarget(he), y.getClearColor(V), W = y.getClearAlpha(), W < 1 && y.setClearColor(16777215, 0.5), Fe ? ce.render(G) : y.clear();
      const Ne = y.toneMapping;
      y.toneMapping = ui;
      const ze = X.viewport;
      if (X.viewport !== void 0 && (X.viewport = void 0), c.setupLightsView(X), J === !0 && pe.setGlobalState(y.clippingPlanes, X), bn(T, G, X), qe.updateMultisampleRenderTarget(he), qe.updateRenderTargetMipmap(he), it.has("WEBGL_multisampled_render_to_texture") === !1) {
        let ke = !1;
        for (let Oe = 0, ft = O.length; Oe < ft; Oe++) {
          const wt = O[Oe], St = wt.object, Bt = wt.geometry, pt = wt.material, Ae = wt.group;
          if (pt.side === kn && St.layers.test(X.layers)) {
            const Ht = pt.side;
            pt.side = _n, pt.needsUpdate = !0, cn(St, G, X, Bt, pt, Ae), pt.side = Ht, pt.needsUpdate = !0, ke = !0;
          }
        }
        ke === !0 && (qe.updateMultisampleRenderTarget(he), qe.updateRenderTargetMipmap(he));
      }
      y.setRenderTarget(we), y.setClearColor(V, W), ze !== void 0 && (X.viewport = ze), y.toneMapping = Ne;
    }
    function bn(T, O, G) {
      const X = O.isScene === !0 ? O.overrideMaterial : null;
      for (let B = 0, he = T.length; B < he; B++) {
        const Me = T[B], we = Me.object, Ne = Me.geometry, ze = X === null ? Me.material : X, ke = Me.group;
        we.layers.test(G.layers) && cn(we, O, G, Ne, ze, ke);
      }
    }
    function cn(T, O, G, X, B, he) {
      T.onBeforeRender(y, O, G, X, B, he), T.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse, T.matrixWorld), T.normalMatrix.getNormalMatrix(T.modelViewMatrix), B.onBeforeRender(y, O, G, X, T, he), B.transparent === !0 && B.side === kn && B.forceSinglePass === !1 ? (B.side = _n, B.needsUpdate = !0, y.renderBufferDirect(G, O, X, B, T, he), B.side = fi, B.needsUpdate = !0, y.renderBufferDirect(G, O, X, B, T, he), B.side = kn) : y.renderBufferDirect(G, O, X, B, T, he), T.onAfterRender(y, O, G, X, B, he);
    }
    function Wn(T, O, G) {
      O.isScene !== !0 && (O = $e);
      const X = Ze.get(T), B = c.state.lights, he = c.state.shadowsArray, Me = B.state.version, we = ae.getParameters(T, B.state, he, O, G), Ne = ae.getProgramCacheKey(we);
      let ze = X.programs;
      X.environment = T.isMeshStandardMaterial ? O.environment : null, X.fog = O.fog, X.envMap = (T.isMeshStandardMaterial ? P : Tt).get(T.envMap || X.environment), X.envMapRotation = X.environment !== null && T.envMap === null ? O.environmentRotation : T.envMapRotation, ze === void 0 && (T.addEventListener("dispose", ne), ze = /* @__PURE__ */ new Map(), X.programs = ze);
      let ke = ze.get(Ne);
      if (ke !== void 0) {
        if (X.currentProgram === ke && X.lightsStateVersion === Me)
          return nn(T, we), ke;
      } else
        we.uniforms = ae.getUniforms(T), T.onBuild(G, we, y), T.onBeforeCompile(we, y), ke = ae.acquireProgram(we, Ne), ze.set(Ne, ke), X.uniforms = we.uniforms;
      const Oe = X.uniforms;
      return (!T.isShaderMaterial && !T.isRawShaderMaterial || T.clipping === !0) && (Oe.clippingPlanes = pe.uniform), nn(T, we), X.needsLights = js(T), X.lightsStateVersion = Me, X.needsLights && (Oe.ambientLightColor.value = B.state.ambient, Oe.lightProbe.value = B.state.probe, Oe.directionalLights.value = B.state.directional, Oe.directionalLightShadows.value = B.state.directionalShadow, Oe.spotLights.value = B.state.spot, Oe.spotLightShadows.value = B.state.spotShadow, Oe.rectAreaLights.value = B.state.rectArea, Oe.ltc_1.value = B.state.rectAreaLTC1, Oe.ltc_2.value = B.state.rectAreaLTC2, Oe.pointLights.value = B.state.point, Oe.pointLightShadows.value = B.state.pointShadow, Oe.hemisphereLights.value = B.state.hemi, Oe.directionalShadowMap.value = B.state.directionalShadowMap, Oe.directionalShadowMatrix.value = B.state.directionalShadowMatrix, Oe.spotShadowMap.value = B.state.spotShadowMap, Oe.spotLightMatrix.value = B.state.spotLightMatrix, Oe.spotLightMap.value = B.state.spotLightMap, Oe.pointShadowMap.value = B.state.pointShadowMap, Oe.pointShadowMatrix.value = B.state.pointShadowMatrix), X.currentProgram = ke, X.uniformsList = null, ke;
    }
    function _i(T) {
      if (T.uniformsList === null) {
        const O = T.currentProgram.getUniforms();
        T.uniformsList = Cs.seqWithValue(O.seq, T.uniforms);
      }
      return T.uniformsList;
    }
    function nn(T, O) {
      const G = Ze.get(T);
      G.outputColorSpace = O.outputColorSpace, G.batching = O.batching, G.batchingColor = O.batchingColor, G.instancing = O.instancing, G.instancingColor = O.instancingColor, G.instancingMorph = O.instancingMorph, G.skinning = O.skinning, G.morphTargets = O.morphTargets, G.morphNormals = O.morphNormals, G.morphColors = O.morphColors, G.morphTargetsCount = O.morphTargetsCount, G.numClippingPlanes = O.numClippingPlanes, G.numIntersection = O.numClipIntersection, G.vertexAlphas = O.vertexAlphas, G.vertexTangents = O.vertexTangents, G.toneMapping = O.toneMapping;
    }
    function Dn(T, O, G, X, B) {
      O.isScene !== !0 && (O = $e), qe.resetTextureUnits();
      const he = O.fog, Me = X.isMeshStandardMaterial ? O.environment : null, we = C === null ? y.outputColorSpace : C.isXRRenderTarget === !0 ? C.texture.colorSpace : gi, Ne = (X.isMeshStandardMaterial ? P : Tt).get(X.envMap || Me), ze = X.vertexColors === !0 && !!G.attributes.color && G.attributes.color.itemSize === 4, ke = !!G.attributes.tangent && (!!X.normalMap || X.anisotropy > 0), Oe = !!G.morphAttributes.position, ft = !!G.morphAttributes.normal, wt = !!G.morphAttributes.color;
      let St = ui;
      X.toneMapped && (C === null || C.isXRRenderTarget === !0) && (St = y.toneMapping);
      const Bt = G.morphAttributes.position || G.morphAttributes.normal || G.morphAttributes.color, pt = Bt !== void 0 ? Bt.length : 0, Ae = Ze.get(X), Ht = c.state.lights;
      if (J === !0 && (le === !0 || T !== A)) {
        const hn = T === A && X.id === U;
        pe.setState(X, T, hn);
      }
      let dt = !1;
      X.version === Ae.__version ? (Ae.needsLights && Ae.lightsStateVersion !== Ht.state.version || Ae.outputColorSpace !== we || B.isBatchedMesh && Ae.batching === !1 || !B.isBatchedMesh && Ae.batching === !0 || B.isBatchedMesh && Ae.batchingColor === !0 && B.colorTexture === null || B.isBatchedMesh && Ae.batchingColor === !1 && B.colorTexture !== null || B.isInstancedMesh && Ae.instancing === !1 || !B.isInstancedMesh && Ae.instancing === !0 || B.isSkinnedMesh && Ae.skinning === !1 || !B.isSkinnedMesh && Ae.skinning === !0 || B.isInstancedMesh && Ae.instancingColor === !0 && B.instanceColor === null || B.isInstancedMesh && Ae.instancingColor === !1 && B.instanceColor !== null || B.isInstancedMesh && Ae.instancingMorph === !0 && B.morphTexture === null || B.isInstancedMesh && Ae.instancingMorph === !1 && B.morphTexture !== null || Ae.envMap !== Ne || X.fog === !0 && Ae.fog !== he || Ae.numClippingPlanes !== void 0 && (Ae.numClippingPlanes !== pe.numPlanes || Ae.numIntersection !== pe.numIntersection) || Ae.vertexAlphas !== ze || Ae.vertexTangents !== ke || Ae.morphTargets !== Oe || Ae.morphNormals !== ft || Ae.morphColors !== wt || Ae.toneMapping !== St || Ae.morphTargetsCount !== pt) && (dt = !0) : (dt = !0, Ae.__version = X.version);
      let dn = Ae.currentProgram;
      dt === !0 && (dn = Wn(X, O, B));
      let Oi = !1, Cn = !1, Fi = !1;
      const Ut = dn.getUniforms(), Un = Ae.uniforms;
      if (De.useProgram(dn.program) && (Oi = !0, Cn = !0, Fi = !0), X.id !== U && (U = X.id, Cn = !0), Oi || A !== T) {
        Ut.setValue(D, "projectionMatrix", T.projectionMatrix), Ut.setValue(D, "viewMatrix", T.matrixWorldInverse);
        const hn = Ut.map.cameraPosition;
        hn !== void 0 && hn.setValue(D, ue.setFromMatrixPosition(T.matrixWorld)), vt.logarithmicDepthBuffer && Ut.setValue(
          D,
          "logDepthBufFC",
          2 / (Math.log(T.far + 1) / Math.LN2)
        ), (X.isMeshPhongMaterial || X.isMeshToonMaterial || X.isMeshLambertMaterial || X.isMeshBasicMaterial || X.isMeshStandardMaterial || X.isShaderMaterial) && Ut.setValue(D, "isOrthographic", T.isOrthographicCamera === !0), A !== T && (A = T, Cn = !0, Fi = !0);
      }
      if (B.isSkinnedMesh) {
        Ut.setOptional(D, B, "bindMatrix"), Ut.setOptional(D, B, "bindMatrixInverse");
        const hn = B.skeleton;
        hn && (hn.boneTexture === null && hn.computeBoneTexture(), Ut.setValue(D, "boneTexture", hn.boneTexture, qe));
      }
      B.isBatchedMesh && (Ut.setOptional(D, B, "batchingTexture"), Ut.setValue(D, "batchingTexture", B._matricesTexture, qe), Ut.setOptional(D, B, "batchingColorTexture"), B._colorsTexture !== null && Ut.setValue(D, "batchingColorTexture", B._colorsTexture, qe));
      const Bi = G.morphAttributes;
      if ((Bi.position !== void 0 || Bi.normal !== void 0 || Bi.color !== void 0) && Le.update(B, G, dn), (Cn || Ae.receiveShadow !== B.receiveShadow) && (Ae.receiveShadow = B.receiveShadow, Ut.setValue(D, "receiveShadow", B.receiveShadow)), X.isMeshGouraudMaterial && X.envMap !== null && (Un.envMap.value = Ne, Un.flipEnvMap.value = Ne.isCubeTexture && Ne.isRenderTargetTexture === !1 ? -1 : 1), X.isMeshStandardMaterial && X.envMap === null && O.environment !== null && (Un.envMapIntensity.value = O.environmentIntensity), Cn && (Ut.setValue(D, "toneMappingExposure", y.toneMappingExposure), Ae.needsLights && $t(Un, Fi), he && X.fog === !0 && ie.refreshFogUniforms(Un, he), ie.refreshMaterialUniforms(Un, X, re, j, c.state.transmissionRenderTarget[T.id]), Cs.upload(D, _i(Ae), Un, qe)), X.isShaderMaterial && X.uniformsNeedUpdate === !0 && (Cs.upload(D, _i(Ae), Un, qe), X.uniformsNeedUpdate = !1), X.isSpriteMaterial && Ut.setValue(D, "center", B.center), Ut.setValue(D, "modelViewMatrix", B.modelViewMatrix), Ut.setValue(D, "normalMatrix", B.normalMatrix), Ut.setValue(D, "modelMatrix", B.matrixWorld), X.isShaderMaterial || X.isRawShaderMaterial) {
        const hn = X.uniformsGroups;
        for (let zi = 0, br = hn.length; zi < br; zi++) {
          const ki = hn[zi];
          He.update(ki, dn), He.bind(ki, dn);
        }
      }
      return dn;
    }
    function $t(T, O) {
      T.ambientLightColor.needsUpdate = O, T.lightProbe.needsUpdate = O, T.directionalLights.needsUpdate = O, T.directionalLightShadows.needsUpdate = O, T.pointLights.needsUpdate = O, T.pointLightShadows.needsUpdate = O, T.spotLights.needsUpdate = O, T.spotLightShadows.needsUpdate = O, T.rectAreaLights.needsUpdate = O, T.hemisphereLights.needsUpdate = O;
    }
    function js(T) {
      return T.isMeshLambertMaterial || T.isMeshToonMaterial || T.isMeshPhongMaterial || T.isMeshStandardMaterial || T.isShadowMaterial || T.isShaderMaterial && T.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return I;
    }, this.getActiveMipmapLevel = function() {
      return R;
    }, this.getRenderTarget = function() {
      return C;
    }, this.setRenderTargetTextures = function(T, O, G) {
      Ze.get(T.texture).__webglTexture = O, Ze.get(T.depthTexture).__webglTexture = G;
      const X = Ze.get(T);
      X.__hasExternalTextures = !0, X.__autoAllocateDepthBuffer = G === void 0, X.__autoAllocateDepthBuffer || it.has("WEBGL_multisampled_render_to_texture") === !0 && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), X.__useRenderToTexture = !1);
    }, this.setRenderTargetFramebuffer = function(T, O) {
      const G = Ze.get(T);
      G.__webglFramebuffer = O, G.__useDefaultFramebuffer = O === void 0;
    }, this.setRenderTarget = function(T, O = 0, G = 0) {
      C = T, I = O, R = G;
      let X = !0, B = null, he = !1, Me = !1;
      if (T) {
        const Ne = Ze.get(T);
        Ne.__useDefaultFramebuffer !== void 0 ? (De.bindFramebuffer(D.FRAMEBUFFER, null), X = !1) : Ne.__webglFramebuffer === void 0 ? qe.setupRenderTarget(T) : Ne.__hasExternalTextures && qe.rebindTextures(T, Ze.get(T.texture).__webglTexture, Ze.get(T.depthTexture).__webglTexture);
        const ze = T.texture;
        (ze.isData3DTexture || ze.isDataArrayTexture || ze.isCompressedArrayTexture) && (Me = !0);
        const ke = Ze.get(T).__webglFramebuffer;
        T.isWebGLCubeRenderTarget ? (Array.isArray(ke[O]) ? B = ke[O][G] : B = ke[O], he = !0) : T.samples > 0 && qe.useMultisampledRTT(T) === !1 ? B = Ze.get(T).__webglMultisampledFramebuffer : Array.isArray(ke) ? B = ke[G] : B = ke, v.copy(T.viewport), L.copy(T.scissor), k = T.scissorTest;
      } else
        v.copy(_e).multiplyScalar(re).floor(), L.copy(Ee).multiplyScalar(re).floor(), k = Je;
      if (De.bindFramebuffer(D.FRAMEBUFFER, B) && X && De.drawBuffers(T, B), De.viewport(v), De.scissor(L), De.setScissorTest(k), he) {
        const Ne = Ze.get(T.texture);
        D.framebufferTexture2D(D.FRAMEBUFFER, D.COLOR_ATTACHMENT0, D.TEXTURE_CUBE_MAP_POSITIVE_X + O, Ne.__webglTexture, G);
      } else if (Me) {
        const Ne = Ze.get(T.texture), ze = O || 0;
        D.framebufferTextureLayer(D.FRAMEBUFFER, D.COLOR_ATTACHMENT0, Ne.__webglTexture, G || 0, ze);
      }
      U = -1;
    }, this.readRenderTargetPixels = function(T, O, G, X, B, he, Me) {
      if (!(T && T.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let we = Ze.get(T).__webglFramebuffer;
      if (T.isWebGLCubeRenderTarget && Me !== void 0 && (we = we[Me]), we) {
        De.bindFramebuffer(D.FRAMEBUFFER, we);
        try {
          const Ne = T.texture, ze = Ne.format, ke = Ne.type;
          if (!vt.textureFormatReadable(ze)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!vt.textureTypeReadable(ke)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          O >= 0 && O <= T.width - X && G >= 0 && G <= T.height - B && D.readPixels(O, G, X, B, xe.convert(ze), xe.convert(ke), he);
        } finally {
          const Ne = C !== null ? Ze.get(C).__webglFramebuffer : null;
          De.bindFramebuffer(D.FRAMEBUFFER, Ne);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(T, O, G, X, B, he, Me) {
      if (!(T && T.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let we = Ze.get(T).__webglFramebuffer;
      if (T.isWebGLCubeRenderTarget && Me !== void 0 && (we = we[Me]), we) {
        De.bindFramebuffer(D.FRAMEBUFFER, we);
        try {
          const Ne = T.texture, ze = Ne.format, ke = Ne.type;
          if (!vt.textureFormatReadable(ze))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
          if (!vt.textureTypeReadable(ke))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
          if (O >= 0 && O <= T.width - X && G >= 0 && G <= T.height - B) {
            const Oe = D.createBuffer();
            D.bindBuffer(D.PIXEL_PACK_BUFFER, Oe), D.bufferData(D.PIXEL_PACK_BUFFER, he.byteLength, D.STREAM_READ), D.readPixels(O, G, X, B, xe.convert(ze), xe.convert(ke), 0), D.flush();
            const ft = D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE, 0);
            await uu(D, ft, 4);
            try {
              D.bindBuffer(D.PIXEL_PACK_BUFFER, Oe), D.getBufferSubData(D.PIXEL_PACK_BUFFER, 0, he);
            } finally {
              D.deleteBuffer(Oe), D.deleteSync(ft);
            }
            return he;
          }
        } finally {
          const Ne = C !== null ? Ze.get(C).__webglFramebuffer : null;
          De.bindFramebuffer(D.FRAMEBUFFER, Ne);
        }
      }
    }, this.copyFramebufferToTexture = function(T, O = null, G = 0) {
      T.isTexture !== !0 && (console.warn("WebGLRenderer: copyFramebufferToTexture function signature has changed."), O = arguments[0] || null, T = arguments[1]);
      const X = Math.pow(2, -G), B = Math.floor(T.image.width * X), he = Math.floor(T.image.height * X), Me = O !== null ? O.x : 0, we = O !== null ? O.y : 0;
      qe.setTexture2D(T, 0), D.copyTexSubImage2D(D.TEXTURE_2D, G, 0, 0, Me, we, B, he), De.unbindTexture();
    }, this.copyTextureToTexture = function(T, O, G = null, X = null, B = 0) {
      T.isTexture !== !0 && (console.warn("WebGLRenderer: copyTextureToTexture function signature has changed."), X = arguments[0] || null, T = arguments[1], O = arguments[2], B = arguments[3] || 0, G = null);
      let he, Me, we, Ne, ze, ke;
      G !== null ? (he = G.max.x - G.min.x, Me = G.max.y - G.min.y, we = G.min.x, Ne = G.min.y) : (he = T.image.width, Me = T.image.height, we = 0, Ne = 0), X !== null ? (ze = X.x, ke = X.y) : (ze = 0, ke = 0);
      const Oe = xe.convert(O.format), ft = xe.convert(O.type);
      qe.setTexture2D(O, 0), D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL, O.flipY), D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL, O.premultiplyAlpha), D.pixelStorei(D.UNPACK_ALIGNMENT, O.unpackAlignment);
      const wt = D.getParameter(D.UNPACK_ROW_LENGTH), St = D.getParameter(D.UNPACK_IMAGE_HEIGHT), Bt = D.getParameter(D.UNPACK_SKIP_PIXELS), pt = D.getParameter(D.UNPACK_SKIP_ROWS), Ae = D.getParameter(D.UNPACK_SKIP_IMAGES), Ht = T.isCompressedTexture ? T.mipmaps[B] : T.image;
      D.pixelStorei(D.UNPACK_ROW_LENGTH, Ht.width), D.pixelStorei(D.UNPACK_IMAGE_HEIGHT, Ht.height), D.pixelStorei(D.UNPACK_SKIP_PIXELS, we), D.pixelStorei(D.UNPACK_SKIP_ROWS, Ne), T.isDataTexture ? D.texSubImage2D(D.TEXTURE_2D, B, ze, ke, he, Me, Oe, ft, Ht.data) : T.isCompressedTexture ? D.compressedTexSubImage2D(D.TEXTURE_2D, B, ze, ke, Ht.width, Ht.height, Oe, Ht.data) : D.texSubImage2D(D.TEXTURE_2D, B, ze, ke, Oe, ft, Ht), D.pixelStorei(D.UNPACK_ROW_LENGTH, wt), D.pixelStorei(D.UNPACK_IMAGE_HEIGHT, St), D.pixelStorei(D.UNPACK_SKIP_PIXELS, Bt), D.pixelStorei(D.UNPACK_SKIP_ROWS, pt), D.pixelStorei(D.UNPACK_SKIP_IMAGES, Ae), B === 0 && O.generateMipmaps && D.generateMipmap(D.TEXTURE_2D), De.unbindTexture();
    }, this.copyTextureToTexture3D = function(T, O, G = null, X = null, B = 0) {
      T.isTexture !== !0 && (console.warn("WebGLRenderer: copyTextureToTexture3D function signature has changed."), G = arguments[0] || null, X = arguments[1] || null, T = arguments[2], O = arguments[3], B = arguments[4] || 0);
      let he, Me, we, Ne, ze, ke, Oe, ft, wt;
      const St = T.isCompressedTexture ? T.mipmaps[B] : T.image;
      G !== null ? (he = G.max.x - G.min.x, Me = G.max.y - G.min.y, we = G.max.z - G.min.z, Ne = G.min.x, ze = G.min.y, ke = G.min.z) : (he = St.width, Me = St.height, we = St.depth, Ne = 0, ze = 0, ke = 0), X !== null ? (Oe = X.x, ft = X.y, wt = X.z) : (Oe = 0, ft = 0, wt = 0);
      const Bt = xe.convert(O.format), pt = xe.convert(O.type);
      let Ae;
      if (O.isData3DTexture)
        qe.setTexture3D(O, 0), Ae = D.TEXTURE_3D;
      else if (O.isDataArrayTexture || O.isCompressedArrayTexture)
        qe.setTexture2DArray(O, 0), Ae = D.TEXTURE_2D_ARRAY;
      else {
        console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");
        return;
      }
      D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL, O.flipY), D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL, O.premultiplyAlpha), D.pixelStorei(D.UNPACK_ALIGNMENT, O.unpackAlignment);
      const Ht = D.getParameter(D.UNPACK_ROW_LENGTH), dt = D.getParameter(D.UNPACK_IMAGE_HEIGHT), dn = D.getParameter(D.UNPACK_SKIP_PIXELS), Oi = D.getParameter(D.UNPACK_SKIP_ROWS), Cn = D.getParameter(D.UNPACK_SKIP_IMAGES);
      D.pixelStorei(D.UNPACK_ROW_LENGTH, St.width), D.pixelStorei(D.UNPACK_IMAGE_HEIGHT, St.height), D.pixelStorei(D.UNPACK_SKIP_PIXELS, Ne), D.pixelStorei(D.UNPACK_SKIP_ROWS, ze), D.pixelStorei(D.UNPACK_SKIP_IMAGES, ke), T.isDataTexture || T.isData3DTexture ? D.texSubImage3D(Ae, B, Oe, ft, wt, he, Me, we, Bt, pt, St.data) : O.isCompressedArrayTexture ? D.compressedTexSubImage3D(Ae, B, Oe, ft, wt, he, Me, we, Bt, St.data) : D.texSubImage3D(Ae, B, Oe, ft, wt, he, Me, we, Bt, pt, St), D.pixelStorei(D.UNPACK_ROW_LENGTH, Ht), D.pixelStorei(D.UNPACK_IMAGE_HEIGHT, dt), D.pixelStorei(D.UNPACK_SKIP_PIXELS, dn), D.pixelStorei(D.UNPACK_SKIP_ROWS, Oi), D.pixelStorei(D.UNPACK_SKIP_IMAGES, Cn), B === 0 && O.generateMipmaps && D.generateMipmap(Ae), De.unbindTexture();
    }, this.initRenderTarget = function(T) {
      Ze.get(T).__webglFramebuffer === void 0 && qe.setupRenderTarget(T);
    }, this.initTexture = function(T) {
      T.isCubeTexture ? qe.setTextureCube(T, 0) : T.isData3DTexture ? qe.setTexture3D(T, 0) : T.isDataArrayTexture || T.isCompressedArrayTexture ? qe.setTexture2DArray(T, 0) : qe.setTexture2D(T, 0), De.unbindTexture();
    }, this.resetState = function() {
      I = 0, R = 0, C = null, De.reset(), Ge.reset();
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  get coordinateSystem() {
    return Jn;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(e) {
    this._outputColorSpace = e;
    const t = this.getContext();
    t.drawingBufferColorSpace = e === lo ? "display-p3" : "srgb", t.unpackColorSpace = _t.workingColorSpace === Hs ? "display-p3" : "srgb";
  }
}
class S_ extends Wt {
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new En(), this.environmentIntensity = 1, this.environmentRotation = new En(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(e, t) {
    return super.copy(e, t), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, this.backgroundRotation.copy(e.backgroundRotation), this.environmentIntensity = e.environmentIntensity, this.environmentRotation.copy(e.environmentRotation), e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.fog !== null && (t.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (t.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity), t.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (t.object.environmentIntensity = this.environmentIntensity), t.object.environmentRotation = this.environmentRotation.toArray(), t;
  }
}
class qs extends Mr {
  constructor(e) {
    super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new ut(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.linewidth = e.linewidth, this.linecap = e.linecap, this.linejoin = e.linejoin, this.fog = e.fog, this;
  }
}
const Bs = /* @__PURE__ */ new N(), zs = /* @__PURE__ */ new N(), zc = /* @__PURE__ */ new yt(), Dr = /* @__PURE__ */ new Ws(), ys = /* @__PURE__ */ new Gs(), ka = /* @__PURE__ */ new N(), kc = /* @__PURE__ */ new N();
class Qn extends Wt {
  constructor(e = new ln(), t = new qs()) {
    super(), this.isLine = !0, this.type = "Line", this.geometry = e, this.material = t, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const t = e.attributes.position, n = [0];
      for (let r = 1, s = t.count; r < s; r++)
        Bs.fromBufferAttribute(t, r - 1), zs.fromBufferAttribute(t, r), n[r] = n[r - 1], n[r] += Bs.distanceTo(zs);
      e.setAttribute("lineDistance", new Et(n, 1));
    } else
      console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
  raycast(e, t) {
    const n = this.geometry, r = this.matrixWorld, s = e.params.Line.threshold, a = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), ys.copy(n.boundingSphere), ys.applyMatrix4(r), ys.radius += s, e.ray.intersectsSphere(ys) === !1) return;
    zc.copy(r).invert(), Dr.copy(e.ray).applyMatrix4(zc);
    const o = s / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = o * o, d = this.isLineSegments ? 2 : 1, u = n.index, f = n.attributes.position;
    if (u !== null) {
      const m = Math.max(0, a.start), _ = Math.min(u.count, a.start + a.count);
      for (let x = m, c = _ - 1; x < c; x += d) {
        const h = u.getX(x), M = u.getX(x + 1), y = Ss(this, e, Dr, l, h, M);
        y && t.push(y);
      }
      if (this.isLineLoop) {
        const x = u.getX(_ - 1), c = u.getX(m), h = Ss(this, e, Dr, l, x, c);
        h && t.push(h);
      }
    } else {
      const m = Math.max(0, a.start), _ = Math.min(f.count, a.start + a.count);
      for (let x = m, c = _ - 1; x < c; x += d) {
        const h = Ss(this, e, Dr, l, x, x + 1);
        h && t.push(h);
      }
      if (this.isLineLoop) {
        const x = Ss(this, e, Dr, l, _ - 1, m);
        x && t.push(x);
      }
    }
  }
  updateMorphTargets() {
    const t = this.geometry.morphAttributes, n = Object.keys(t);
    if (n.length > 0) {
      const r = t[n[0]];
      if (r !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let s = 0, a = r.length; s < a; s++) {
          const o = r[s].name || String(s);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = s;
        }
      }
    }
  }
}
function Ss(i, e, t, n, r, s) {
  const a = i.geometry.attributes.position;
  if (Bs.fromBufferAttribute(a, r), zs.fromBufferAttribute(a, s), t.distanceSqToSegment(Bs, zs, ka, kc) > n) return;
  ka.applyMatrix4(i.matrixWorld);
  const l = e.ray.origin.distanceTo(ka);
  if (!(l < e.near || l > e.far))
    return {
      distance: l,
      // What do we want? intersection point on the ray or on the segment??
      // point: raycaster.ray.at( distance ),
      point: kc.clone().applyMatrix4(i.matrixWorld),
      index: r,
      face: null,
      faceIndex: null,
      object: i
    };
}
const Vc = /* @__PURE__ */ new N(), Hc = /* @__PURE__ */ new N();
class Dd extends Qn {
  constructor(e, t) {
    super(e, t), this.isLineSegments = !0, this.type = "LineSegments";
  }
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const t = e.attributes.position, n = [];
      for (let r = 0, s = t.count; r < s; r += 2)
        Vc.fromBufferAttribute(t, r), Hc.fromBufferAttribute(t, r + 1), n[r] = r === 0 ? 0 : n[r - 1], n[r + 1] = n[r] + Vc.distanceTo(Hc);
      e.setAttribute("lineDistance", new Et(n, 1));
    } else
      console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
}
class an extends ln {
  constructor(e = 1, t = 1, n = 1, r = 32, s = 1, a = !1, o = 0, l = Math.PI * 2) {
    super(), this.type = "CylinderGeometry", this.parameters = {
      radiusTop: e,
      radiusBottom: t,
      height: n,
      radialSegments: r,
      heightSegments: s,
      openEnded: a,
      thetaStart: o,
      thetaLength: l
    };
    const d = this;
    r = Math.floor(r), s = Math.floor(s);
    const u = [], p = [], f = [], m = [];
    let _ = 0;
    const x = [], c = n / 2;
    let h = 0;
    M(), a === !1 && (e > 0 && y(!0), t > 0 && y(!1)), this.setIndex(u), this.setAttribute("position", new Et(p, 3)), this.setAttribute("normal", new Et(f, 3)), this.setAttribute("uv", new Et(m, 2));
    function M() {
      const w = new N(), I = new N();
      let R = 0;
      const C = (t - e) / n;
      for (let U = 0; U <= s; U++) {
        const A = [], v = U / s, L = v * (t - e) + e;
        for (let k = 0; k <= r; k++) {
          const V = k / r, W = V * l + o, Q = Math.sin(W), j = Math.cos(W);
          I.x = L * Q, I.y = -v * n + c, I.z = L * j, p.push(I.x, I.y, I.z), w.set(Q, C, j).normalize(), f.push(w.x, w.y, w.z), m.push(V, 1 - v), A.push(_++);
        }
        x.push(A);
      }
      for (let U = 0; U < r; U++)
        for (let A = 0; A < s; A++) {
          const v = x[A][U], L = x[A + 1][U], k = x[A + 1][U + 1], V = x[A][U + 1];
          u.push(v, L, V), u.push(L, k, V), R += 6;
        }
      d.addGroup(h, R, 0), h += R;
    }
    function y(w) {
      const I = _, R = new Xe(), C = new N();
      let U = 0;
      const A = w === !0 ? e : t, v = w === !0 ? 1 : -1;
      for (let k = 1; k <= r; k++)
        p.push(0, c * v, 0), f.push(0, v, 0), m.push(0.5, 0.5), _++;
      const L = _;
      for (let k = 0; k <= r; k++) {
        const W = k / r * l + o, Q = Math.cos(W), j = Math.sin(W);
        C.x = A * j, C.y = c * v, C.z = A * Q, p.push(C.x, C.y, C.z), f.push(0, v, 0), R.x = Q * 0.5 + 0.5, R.y = j * 0.5 * v + 0.5, m.push(R.x, R.y), _++;
      }
      for (let k = 0; k < r; k++) {
        const V = I + k, W = L + k;
        w === !0 ? u.push(W, W + 1, V) : u.push(W + 1, W, V), U += 3;
      }
      d.addGroup(h, U, w === !0 ? 1 : 2), h += U;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new an(e.radiusTop, e.radiusBottom, e.height, e.radialSegments, e.heightSegments, e.openEnded, e.thetaStart, e.thetaLength);
  }
}
class fo extends ln {
  constructor(e = [], t = [], n = 1, r = 0) {
    super(), this.type = "PolyhedronGeometry", this.parameters = {
      vertices: e,
      indices: t,
      radius: n,
      detail: r
    };
    const s = [], a = [];
    o(r), d(n), u(), this.setAttribute("position", new Et(s, 3)), this.setAttribute("normal", new Et(s.slice(), 3)), this.setAttribute("uv", new Et(a, 2)), r === 0 ? this.computeVertexNormals() : this.normalizeNormals();
    function o(M) {
      const y = new N(), w = new N(), I = new N();
      for (let R = 0; R < t.length; R += 3)
        m(t[R + 0], y), m(t[R + 1], w), m(t[R + 2], I), l(y, w, I, M);
    }
    function l(M, y, w, I) {
      const R = I + 1, C = [];
      for (let U = 0; U <= R; U++) {
        C[U] = [];
        const A = M.clone().lerp(w, U / R), v = y.clone().lerp(w, U / R), L = R - U;
        for (let k = 0; k <= L; k++)
          k === 0 && U === R ? C[U][k] = A : C[U][k] = A.clone().lerp(v, k / L);
      }
      for (let U = 0; U < R; U++)
        for (let A = 0; A < 2 * (R - U) - 1; A++) {
          const v = Math.floor(A / 2);
          A % 2 === 0 ? (f(C[U][v + 1]), f(C[U + 1][v]), f(C[U][v])) : (f(C[U][v + 1]), f(C[U + 1][v + 1]), f(C[U + 1][v]));
        }
    }
    function d(M) {
      const y = new N();
      for (let w = 0; w < s.length; w += 3)
        y.x = s[w + 0], y.y = s[w + 1], y.z = s[w + 2], y.normalize().multiplyScalar(M), s[w + 0] = y.x, s[w + 1] = y.y, s[w + 2] = y.z;
    }
    function u() {
      const M = new N();
      for (let y = 0; y < s.length; y += 3) {
        M.x = s[y + 0], M.y = s[y + 1], M.z = s[y + 2];
        const w = c(M) / 2 / Math.PI + 0.5, I = h(M) / Math.PI + 0.5;
        a.push(w, 1 - I);
      }
      _(), p();
    }
    function p() {
      for (let M = 0; M < a.length; M += 6) {
        const y = a[M + 0], w = a[M + 2], I = a[M + 4], R = Math.max(y, w, I), C = Math.min(y, w, I);
        R > 0.9 && C < 0.1 && (y < 0.2 && (a[M + 0] += 1), w < 0.2 && (a[M + 2] += 1), I < 0.2 && (a[M + 4] += 1));
      }
    }
    function f(M) {
      s.push(M.x, M.y, M.z);
    }
    function m(M, y) {
      const w = M * 3;
      y.x = e[w + 0], y.y = e[w + 1], y.z = e[w + 2];
    }
    function _() {
      const M = new N(), y = new N(), w = new N(), I = new N(), R = new Xe(), C = new Xe(), U = new Xe();
      for (let A = 0, v = 0; A < s.length; A += 9, v += 6) {
        M.set(s[A + 0], s[A + 1], s[A + 2]), y.set(s[A + 3], s[A + 4], s[A + 5]), w.set(s[A + 6], s[A + 7], s[A + 8]), R.set(a[v + 0], a[v + 1]), C.set(a[v + 2], a[v + 3]), U.set(a[v + 4], a[v + 5]), I.copy(M).add(y).add(w).divideScalar(3);
        const L = c(I);
        x(R, v + 0, M, L), x(C, v + 2, y, L), x(U, v + 4, w, L);
      }
    }
    function x(M, y, w, I) {
      I < 0 && M.x === 1 && (a[y] = M.x - 1), w.x === 0 && w.z === 0 && (a[y] = I / 2 / Math.PI + 0.5);
    }
    function c(M) {
      return Math.atan2(M.z, -M.x);
    }
    function h(M) {
      return Math.atan2(-M.y, Math.sqrt(M.x * M.x + M.z * M.z));
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new fo(e.vertices, e.indices, e.radius, e.details);
  }
}
class ur extends fo {
  constructor(e = 1, t = 0) {
    const n = [
      1,
      0,
      0,
      -1,
      0,
      0,
      0,
      1,
      0,
      0,
      -1,
      0,
      0,
      0,
      1,
      0,
      0,
      -1
    ], r = [
      0,
      2,
      4,
      0,
      4,
      3,
      0,
      3,
      5,
      0,
      5,
      2,
      1,
      2,
      5,
      1,
      5,
      3,
      1,
      3,
      4,
      1,
      4,
      2
    ];
    super(n, r, e, t), this.type = "OctahedronGeometry", this.parameters = {
      radius: e,
      detail: t
    };
  }
  static fromJSON(e) {
    return new ur(e.radius, e.detail);
  }
}
class po extends ln {
  constructor(e = 1, t = 32, n = 16, r = 0, s = Math.PI * 2, a = 0, o = Math.PI) {
    super(), this.type = "SphereGeometry", this.parameters = {
      radius: e,
      widthSegments: t,
      heightSegments: n,
      phiStart: r,
      phiLength: s,
      thetaStart: a,
      thetaLength: o
    }, t = Math.max(3, Math.floor(t)), n = Math.max(2, Math.floor(n));
    const l = Math.min(a + o, Math.PI);
    let d = 0;
    const u = [], p = new N(), f = new N(), m = [], _ = [], x = [], c = [];
    for (let h = 0; h <= n; h++) {
      const M = [], y = h / n;
      let w = 0;
      h === 0 && a === 0 ? w = 0.5 / t : h === n && l === Math.PI && (w = -0.5 / t);
      for (let I = 0; I <= t; I++) {
        const R = I / t;
        p.x = -e * Math.cos(r + R * s) * Math.sin(a + y * o), p.y = e * Math.cos(a + y * o), p.z = e * Math.sin(r + R * s) * Math.sin(a + y * o), _.push(p.x, p.y, p.z), f.copy(p).normalize(), x.push(f.x, f.y, f.z), c.push(R + w, 1 - y), M.push(d++);
      }
      u.push(M);
    }
    for (let h = 0; h < n; h++)
      for (let M = 0; M < t; M++) {
        const y = u[h][M + 1], w = u[h][M], I = u[h + 1][M], R = u[h + 1][M + 1];
        (h !== 0 || a > 0) && m.push(y, w, R), (h !== n - 1 || l < Math.PI) && m.push(w, I, R);
      }
    this.setIndex(m), this.setAttribute("position", new Et(_, 3)), this.setAttribute("normal", new Et(x, 3)), this.setAttribute("uv", new Et(c, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new po(e.radius, e.widthSegments, e.heightSegments, e.phiStart, e.phiLength, e.thetaStart, e.thetaLength);
  }
}
class Pi extends ln {
  constructor(e = 1, t = 0.4, n = 12, r = 48, s = Math.PI * 2) {
    super(), this.type = "TorusGeometry", this.parameters = {
      radius: e,
      tube: t,
      radialSegments: n,
      tubularSegments: r,
      arc: s
    }, n = Math.floor(n), r = Math.floor(r);
    const a = [], o = [], l = [], d = [], u = new N(), p = new N(), f = new N();
    for (let m = 0; m <= n; m++)
      for (let _ = 0; _ <= r; _++) {
        const x = _ / r * s, c = m / n * Math.PI * 2;
        p.x = (e + t * Math.cos(c)) * Math.cos(x), p.y = (e + t * Math.cos(c)) * Math.sin(x), p.z = t * Math.sin(c), o.push(p.x, p.y, p.z), u.x = e * Math.cos(x), u.y = e * Math.sin(x), f.subVectors(p, u).normalize(), l.push(f.x, f.y, f.z), d.push(_ / r), d.push(m / n);
      }
    for (let m = 1; m <= n; m++)
      for (let _ = 1; _ <= r; _++) {
        const x = (r + 1) * m + _ - 1, c = (r + 1) * (m - 1) + _ - 1, h = (r + 1) * (m - 1) + _, M = (r + 1) * m + _;
        a.push(x, c, M), a.push(c, h, M);
      }
    this.setIndex(a), this.setAttribute("position", new Et(o, 3)), this.setAttribute("normal", new Et(l, 3)), this.setAttribute("uv", new Et(d, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new Pi(e.radius, e.tube, e.radialSegments, e.tubularSegments, e.arc);
  }
}
class M_ extends Mr {
  constructor(e) {
    super(), this.isMeshPhongMaterial = !0, this.type = "MeshPhongMaterial", this.color = new ut(16777215), this.specular = new ut(1118481), this.shininess = 30, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new ut(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = pd, this.normalScale = new Xe(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new En(), this.combine = oo, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.specular.copy(e.specular), this.shininess = e.shininess, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}
class Ud extends Wt {
  constructor(e, t = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new ut(e), this.intensity = t;
  }
  dispose() {
  }
  copy(e, t) {
    return super.copy(e, t), this.color.copy(e.color), this.intensity = e.intensity, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.color = this.color.getHex(), t.object.intensity = this.intensity, this.groundColor !== void 0 && (t.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (t.object.distance = this.distance), this.angle !== void 0 && (t.object.angle = this.angle), this.decay !== void 0 && (t.object.decay = this.decay), this.penumbra !== void 0 && (t.object.penumbra = this.penumbra), this.shadow !== void 0 && (t.object.shadow = this.shadow.toJSON()), t;
  }
}
const Va = /* @__PURE__ */ new yt(), Gc = /* @__PURE__ */ new N(), Wc = /* @__PURE__ */ new N();
class E_ {
  constructor(e) {
    this.camera = e, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new Xe(512, 512), this.map = null, this.mapPass = null, this.matrix = new yt(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new ho(), this._frameExtents = new Xe(1, 1), this._viewportCount = 1, this._viewports = [
      new en(0, 0, 1, 1)
    ];
  }
  getViewportCount() {
    return this._viewportCount;
  }
  getFrustum() {
    return this._frustum;
  }
  updateMatrices(e) {
    const t = this.camera, n = this.matrix;
    Gc.setFromMatrixPosition(e.matrixWorld), t.position.copy(Gc), Wc.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(Wc), t.updateMatrixWorld(), Va.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Va), n.set(
      0.5,
      0,
      0,
      0.5,
      0,
      0.5,
      0,
      0.5,
      0,
      0,
      0.5,
      0.5,
      0,
      0,
      0,
      1
    ), n.multiply(Va);
  }
  getViewport(e) {
    return this._viewports[e];
  }
  getFrameExtents() {
    return this._frameExtents;
  }
  dispose() {
    this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
  }
  copy(e) {
    return this.camera = e.camera.clone(), this.bias = e.bias, this.radius = e.radius, this.mapSize.copy(e.mapSize), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    const e = {};
    return this.bias !== 0 && (e.bias = this.bias), this.normalBias !== 0 && (e.normalBias = this.normalBias), this.radius !== 1 && (e.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (e.mapSize = this.mapSize.toArray()), e.camera = this.camera.toJSON(!1).object, delete e.camera.matrix, e;
  }
}
class b_ extends E_ {
  constructor() {
    super(new wd(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}
class T_ extends Ud {
  constructor(e, t) {
    super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(Wt.DEFAULT_UP), this.updateMatrix(), this.target = new Wt(), this.shadow = new b_();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e) {
    return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
}
class A_ extends Ud {
  constructor(e, t) {
    super(e, t), this.isAmbientLight = !0, this.type = "AmbientLight";
  }
}
const Xc = /* @__PURE__ */ new yt();
class w_ {
  constructor(e, t, n = 0, r = 1 / 0) {
    this.ray = new Ws(e, t), this.near = n, this.far = r, this.camera = null, this.layers = new co(), this.params = {
      Mesh: {},
      Line: { threshold: 1 },
      LOD: {},
      Points: { threshold: 1 },
      Sprite: {}
    };
  }
  set(e, t) {
    this.ray.set(e, t);
  }
  setFromCamera(e, t) {
    t.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(e.x, e.y, 0.5).unproject(t).sub(this.ray.origin).normalize(), this.camera = t) : t.isOrthographicCamera ? (this.ray.origin.set(e.x, e.y, (t.near + t.far) / (t.near - t.far)).unproject(t), this.ray.direction.set(0, 0, -1).transformDirection(t.matrixWorld), this.camera = t) : console.error("THREE.Raycaster: Unsupported camera type: " + t.type);
  }
  setFromXRController(e) {
    return Xc.identity().extractRotation(e.matrixWorld), this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(Xc), this;
  }
  intersectObject(e, t = !0, n = []) {
    return io(e, this, n, t), n.sort(Yc), n;
  }
  intersectObjects(e, t = !0, n = []) {
    for (let r = 0, s = e.length; r < s; r++)
      io(e[r], this, n, t);
    return n.sort(Yc), n;
  }
}
function Yc(i, e) {
  return i.distance - e.distance;
}
function io(i, e, t, n) {
  let r = !0;
  if (i.layers.test(e.layers) && i.raycast(e, t) === !1 && (r = !1), r === !0 && n === !0) {
    const s = i.children;
    for (let a = 0, o = s.length; a < o; a++)
      io(s[a], e, t, !0);
  }
}
class qc {
  constructor(e = 1, t = 0, n = 0) {
    return this.radius = e, this.phi = t, this.theta = n, this;
  }
  set(e, t, n) {
    return this.radius = e, this.phi = t, this.theta = n, this;
  }
  copy(e) {
    return this.radius = e.radius, this.phi = e.phi, this.theta = e.theta, this;
  }
  // restrict phi to be between EPS and PI-EPS
  makeSafe() {
    return this.phi = Math.max(1e-6, Math.min(Math.PI - 1e-6, this.phi)), this;
  }
  setFromVector3(e) {
    return this.setFromCartesianCoords(e.x, e.y, e.z);
  }
  setFromCartesianCoords(e, t, n) {
    return this.radius = Math.sqrt(e * e + t * t + n * n), this.radius === 0 ? (this.theta = 0, this.phi = 0) : (this.theta = Math.atan2(e, n), this.phi = Math.acos(pn(t / this.radius, -1, 1))), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class R_ extends Dd {
  constructor(e = 10, t = 10, n = 4473924, r = 8947848) {
    n = new ut(n), r = new ut(r);
    const s = t / 2, a = e / t, o = e / 2, l = [], d = [];
    for (let f = 0, m = 0, _ = -o; f <= t; f++, _ += a) {
      l.push(-o, 0, _, o, 0, _), l.push(_, 0, -o, _, 0, o);
      const x = f === s ? n : r;
      x.toArray(d, m), m += 3, x.toArray(d, m), m += 3, x.toArray(d, m), m += 3, x.toArray(d, m), m += 3;
    }
    const u = new ln();
    u.setAttribute("position", new Et(l, 3)), u.setAttribute("color", new Et(d, 3));
    const p = new qs({ vertexColors: !0, toneMapped: !1 });
    super(u, p), this.type = "GridHelper";
  }
  dispose() {
    this.geometry.dispose(), this.material.dispose();
  }
}
class jc extends Dd {
  constructor(e = 1) {
    const t = [
      0,
      0,
      0,
      e,
      0,
      0,
      0,
      0,
      0,
      0,
      e,
      0,
      0,
      0,
      0,
      0,
      0,
      e
    ], n = [
      1,
      0,
      0,
      1,
      0.6,
      0,
      0,
      1,
      0,
      0.6,
      1,
      0,
      0,
      0,
      1,
      0,
      0.6,
      1
    ], r = new ln();
    r.setAttribute("position", new Et(t, 3)), r.setAttribute("color", new Et(n, 3));
    const s = new qs({ vertexColors: !0, toneMapped: !1 });
    super(r, s), this.type = "AxesHelper";
  }
  setColors(e, t, n) {
    const r = new ut(), s = this.geometry.attributes.color.array;
    return r.set(e), r.toArray(s, 0), r.toArray(s, 3), r.set(t), r.toArray(s, 6), r.toArray(s, 9), r.set(n), r.toArray(s, 12), r.toArray(s, 15), this.geometry.attributes.color.needsUpdate = !0, this;
  }
  dispose() {
    this.geometry.dispose(), this.material.dispose();
  }
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
  revision: ao
} }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = ao);
const Kc = { type: "change" }, Ha = { type: "start" }, $c = { type: "end" }, Ms = new Ws(), Zc = new li(), C_ = Math.cos(70 * du.DEG2RAD);
class P_ extends Ui {
  constructor(e, t) {
    super(), this.object = e, this.domElement = t, this.domElement.style.touchAction = "none", this.enabled = !0, this.target = new N(), this.cursor = new N(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }, this.mouseButtons = { LEFT: Gi.ROTATE, MIDDLE: Gi.DOLLY, RIGHT: Gi.PAN }, this.touches = { ONE: Wi.ROTATE, TWO: Wi.DOLLY_PAN }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this.getPolarAngle = function() {
      return o.phi;
    }, this.getAzimuthalAngle = function() {
      return o.theta;
    }, this.getDistance = function() {
      return this.object.position.distanceTo(this.target);
    }, this.listenToKeyEvents = function(g) {
      g.addEventListener("keydown", pe), this._domElementKeyEvents = g;
    }, this.stopListenToKeyEvents = function() {
      this._domElementKeyEvents.removeEventListener("keydown", pe), this._domElementKeyEvents = null;
    }, this.saveState = function() {
      n.target0.copy(n.target), n.position0.copy(n.object.position), n.zoom0 = n.object.zoom;
    }, this.reset = function() {
      n.target.copy(n.target0), n.object.position.copy(n.position0), n.object.zoom = n.zoom0, n.object.updateProjectionMatrix(), n.dispatchEvent(Kc), n.update(), s = r.NONE;
    }, this.update = function() {
      const g = new N(), q = new Yt().setFromUnitVectors(e.up, new N(0, 1, 0)), z = q.clone().invert(), $ = new N(), ne = new Yt(), Ce = new N(), Be = 2 * Math.PI;
      return function(Lt = null) {
        const ct = n.object.position;
        g.copy(ct).sub(n.target), g.applyQuaternion(q), o.setFromVector3(g), n.autoRotate && s === r.NONE && k(v(Lt)), n.enableDamping ? (o.theta += l.theta * n.dampingFactor, o.phi += l.phi * n.dampingFactor) : (o.theta += l.theta, o.phi += l.phi);
        let bt = n.minAzimuthAngle, It = n.maxAzimuthAngle;
        isFinite(bt) && isFinite(It) && (bt < -Math.PI ? bt += Be : bt > Math.PI && (bt -= Be), It < -Math.PI ? It += Be : It > Math.PI && (It -= Be), bt <= It ? o.theta = Math.max(bt, Math.min(It, o.theta)) : o.theta = o.theta > (bt + It) / 2 ? Math.max(bt, o.theta) : Math.min(It, o.theta)), o.phi = Math.max(n.minPolarAngle, Math.min(n.maxPolarAngle, o.phi)), o.makeSafe(), n.enableDamping === !0 ? n.target.addScaledVector(u, n.dampingFactor) : n.target.add(u), n.target.sub(n.cursor), n.target.clampLength(n.minTargetRadius, n.maxTargetRadius), n.target.add(n.cursor);
        let tn = !1;
        if (n.zoomToCursor && R || n.object.isOrthographicCamera)
          o.radius = _e(o.radius);
        else {
          const Vt = o.radius;
          o.radius = _e(o.radius * d), tn = Vt != o.radius;
        }
        if (g.setFromSpherical(o), g.applyQuaternion(z), ct.copy(n.target).add(g), n.object.lookAt(n.target), n.enableDamping === !0 ? (l.theta *= 1 - n.dampingFactor, l.phi *= 1 - n.dampingFactor, u.multiplyScalar(1 - n.dampingFactor)) : (l.set(0, 0, 0), u.set(0, 0, 0)), n.zoomToCursor && R) {
          let Vt = null;
          if (n.object.isPerspectiveCamera) {
            const Kt = g.length();
            Vt = _e(Kt * d);
            const Rn = Kt - Vt;
            n.object.position.addScaledVector(w, Rn), n.object.updateMatrixWorld(), tn = !!Rn;
          } else if (n.object.isOrthographicCamera) {
            const Kt = new N(I.x, I.y, 0);
            Kt.unproject(n.object);
            const Rn = n.object.zoom;
            n.object.zoom = Math.max(n.minZoom, Math.min(n.maxZoom, n.object.zoom / d)), n.object.updateProjectionMatrix(), tn = Rn !== n.object.zoom;
            const bn = new N(I.x, I.y, 0);
            bn.unproject(n.object), n.object.position.sub(bn).add(Kt), n.object.updateMatrixWorld(), Vt = g.length();
          } else
            console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), n.zoomToCursor = !1;
          Vt !== null && (this.screenSpacePanning ? n.target.set(0, 0, -1).transformDirection(n.object.matrix).multiplyScalar(Vt).add(n.object.position) : (Ms.origin.copy(n.object.position), Ms.direction.set(0, 0, -1).transformDirection(n.object.matrix), Math.abs(n.object.up.dot(Ms.direction)) < C_ ? e.lookAt(n.target) : (Zc.setFromNormalAndCoplanarPoint(n.object.up, n.target), Ms.intersectPlane(Zc, n.target))));
        } else if (n.object.isOrthographicCamera) {
          const Vt = n.object.zoom;
          n.object.zoom = Math.max(n.minZoom, Math.min(n.maxZoom, n.object.zoom / d)), Vt !== n.object.zoom && (n.object.updateProjectionMatrix(), tn = !0);
        }
        return d = 1, R = !1, tn || $.distanceToSquared(n.object.position) > a || 8 * (1 - ne.dot(n.object.quaternion)) > a || Ce.distanceToSquared(n.target) > a ? (n.dispatchEvent(Kc), $.copy(n.object.position), ne.copy(n.object.quaternion), Ce.copy(n.target), !0) : !1;
      };
    }(), this.dispose = function() {
      n.domElement.removeEventListener("contextmenu", Le), n.domElement.removeEventListener("pointerdown", Tt), n.domElement.removeEventListener("pointercancel", S), n.domElement.removeEventListener("wheel", ae), n.domElement.removeEventListener("pointermove", P), n.domElement.removeEventListener("pointerup", S), n.domElement.getRootNode().removeEventListener("keydown", Re, { capture: !0 }), n._domElementKeyEvents !== null && (n._domElementKeyEvents.removeEventListener("keydown", pe), n._domElementKeyEvents = null);
    };
    const n = this, r = {
      NONE: -1,
      ROTATE: 0,
      DOLLY: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_PAN: 4,
      TOUCH_DOLLY_PAN: 5,
      TOUCH_DOLLY_ROTATE: 6
    };
    let s = r.NONE;
    const a = 1e-6, o = new qc(), l = new qc();
    let d = 1;
    const u = new N(), p = new Xe(), f = new Xe(), m = new Xe(), _ = new Xe(), x = new Xe(), c = new Xe(), h = new Xe(), M = new Xe(), y = new Xe(), w = new N(), I = new Xe();
    let R = !1;
    const C = [], U = {};
    let A = !1;
    function v(g) {
      return g !== null ? 2 * Math.PI / 60 * n.autoRotateSpeed * g : 2 * Math.PI / 60 / 60 * n.autoRotateSpeed;
    }
    function L(g) {
      const q = Math.abs(g * 0.01);
      return Math.pow(0.95, n.zoomSpeed * q);
    }
    function k(g) {
      l.theta -= g;
    }
    function V(g) {
      l.phi -= g;
    }
    const W = function() {
      const g = new N();
      return function(z, $) {
        g.setFromMatrixColumn($, 0), g.multiplyScalar(-z), u.add(g);
      };
    }(), Q = function() {
      const g = new N();
      return function(z, $) {
        n.screenSpacePanning === !0 ? g.setFromMatrixColumn($, 1) : (g.setFromMatrixColumn($, 0), g.crossVectors(n.object.up, g)), g.multiplyScalar(z), u.add(g);
      };
    }(), j = function() {
      const g = new N();
      return function(z, $) {
        const ne = n.domElement;
        if (n.object.isPerspectiveCamera) {
          const Ce = n.object.position;
          g.copy(Ce).sub(n.target);
          let Be = g.length();
          Be *= Math.tan(n.object.fov / 2 * Math.PI / 180), W(2 * z * Be / ne.clientHeight, n.object.matrix), Q(2 * $ * Be / ne.clientHeight, n.object.matrix);
        } else n.object.isOrthographicCamera ? (W(z * (n.object.right - n.object.left) / n.object.zoom / ne.clientWidth, n.object.matrix), Q($ * (n.object.top - n.object.bottom) / n.object.zoom / ne.clientHeight, n.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), n.enablePan = !1);
      };
    }();
    function re(g) {
      n.object.isPerspectiveCamera || n.object.isOrthographicCamera ? d /= g : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), n.enableZoom = !1);
    }
    function K(g) {
      n.object.isPerspectiveCamera || n.object.isOrthographicCamera ? d *= g : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), n.enableZoom = !1);
    }
    function de(g, q) {
      if (!n.zoomToCursor)
        return;
      R = !0;
      const z = n.domElement.getBoundingClientRect(), $ = g - z.left, ne = q - z.top, Ce = z.width, Be = z.height;
      I.x = $ / Ce * 2 - 1, I.y = -(ne / Be) * 2 + 1, w.set(I.x, I.y, 1).unproject(n.object).sub(n.object.position).normalize();
    }
    function _e(g) {
      return Math.max(n.minDistance, Math.min(n.maxDistance, g));
    }
    function Ee(g) {
      p.set(g.clientX, g.clientY);
    }
    function Je(g) {
      de(g.clientX, g.clientX), h.set(g.clientX, g.clientY);
    }
    function lt(g) {
      _.set(g.clientX, g.clientY);
    }
    function J(g) {
      f.set(g.clientX, g.clientY), m.subVectors(f, p).multiplyScalar(n.rotateSpeed);
      const q = n.domElement;
      k(2 * Math.PI * m.x / q.clientHeight), V(2 * Math.PI * m.y / q.clientHeight), p.copy(f), n.update();
    }
    function le(g) {
      M.set(g.clientX, g.clientY), y.subVectors(M, h), y.y > 0 ? re(L(y.y)) : y.y < 0 && K(L(y.y)), h.copy(M), n.update();
    }
    function be(g) {
      x.set(g.clientX, g.clientY), c.subVectors(x, _).multiplyScalar(n.panSpeed), j(c.x, c.y), _.copy(x), n.update();
    }
    function ue(g) {
      de(g.clientX, g.clientY), g.deltaY < 0 ? K(L(g.deltaY)) : g.deltaY > 0 && re(L(g.deltaY)), n.update();
    }
    function $e(g) {
      let q = !1;
      switch (g.code) {
        case n.keys.UP:
          g.ctrlKey || g.metaKey || g.shiftKey ? V(2 * Math.PI * n.rotateSpeed / n.domElement.clientHeight) : j(0, n.keyPanSpeed), q = !0;
          break;
        case n.keys.BOTTOM:
          g.ctrlKey || g.metaKey || g.shiftKey ? V(-2 * Math.PI * n.rotateSpeed / n.domElement.clientHeight) : j(0, -n.keyPanSpeed), q = !0;
          break;
        case n.keys.LEFT:
          g.ctrlKey || g.metaKey || g.shiftKey ? k(2 * Math.PI * n.rotateSpeed / n.domElement.clientHeight) : j(n.keyPanSpeed, 0), q = !0;
          break;
        case n.keys.RIGHT:
          g.ctrlKey || g.metaKey || g.shiftKey ? k(-2 * Math.PI * n.rotateSpeed / n.domElement.clientHeight) : j(-n.keyPanSpeed, 0), q = !0;
          break;
      }
      q && (g.preventDefault(), n.update());
    }
    function Fe(g) {
      if (C.length === 1)
        p.set(g.pageX, g.pageY);
      else {
        const q = He(g), z = 0.5 * (g.pageX + q.x), $ = 0.5 * (g.pageY + q.y);
        p.set(z, $);
      }
    }
    function et(g) {
      if (C.length === 1)
        _.set(g.pageX, g.pageY);
      else {
        const q = He(g), z = 0.5 * (g.pageX + q.x), $ = 0.5 * (g.pageY + q.y);
        _.set(z, $);
      }
    }
    function D(g) {
      const q = He(g), z = g.pageX - q.x, $ = g.pageY - q.y, ne = Math.sqrt(z * z + $ * $);
      h.set(0, ne);
    }
    function nt(g) {
      n.enableZoom && D(g), n.enablePan && et(g);
    }
    function it(g) {
      n.enableZoom && D(g), n.enableRotate && Fe(g);
    }
    function vt(g) {
      if (C.length == 1)
        f.set(g.pageX, g.pageY);
      else {
        const z = He(g), $ = 0.5 * (g.pageX + z.x), ne = 0.5 * (g.pageY + z.y);
        f.set($, ne);
      }
      m.subVectors(f, p).multiplyScalar(n.rotateSpeed);
      const q = n.domElement;
      k(2 * Math.PI * m.x / q.clientHeight), V(2 * Math.PI * m.y / q.clientHeight), p.copy(f);
    }
    function De(g) {
      if (C.length === 1)
        x.set(g.pageX, g.pageY);
      else {
        const q = He(g), z = 0.5 * (g.pageX + q.x), $ = 0.5 * (g.pageY + q.y);
        x.set(z, $);
      }
      c.subVectors(x, _).multiplyScalar(n.panSpeed), j(c.x, c.y), _.copy(x);
    }
    function Ye(g) {
      const q = He(g), z = g.pageX - q.x, $ = g.pageY - q.y, ne = Math.sqrt(z * z + $ * $);
      M.set(0, ne), y.set(0, Math.pow(M.y / h.y, n.zoomSpeed)), re(y.y), h.copy(M);
      const Ce = (g.pageX + q.x) * 0.5, Be = (g.pageY + q.y) * 0.5;
      de(Ce, Be);
    }
    function Ze(g) {
      n.enableZoom && Ye(g), n.enablePan && De(g);
    }
    function qe(g) {
      n.enableZoom && Ye(g), n.enableRotate && vt(g);
    }
    function Tt(g) {
      n.enabled !== !1 && (C.length === 0 && (n.domElement.setPointerCapture(g.pointerId), n.domElement.addEventListener("pointermove", P), n.domElement.addEventListener("pointerup", S)), !xe(g) && (rt(g), g.pointerType === "touch" ? je(g) : Y(g)));
    }
    function P(g) {
      n.enabled !== !1 && (g.pointerType === "touch" ? ce(g) : se(g));
    }
    function S(g) {
      switch (Ue(g), C.length) {
        case 0:
          n.domElement.releasePointerCapture(g.pointerId), n.domElement.removeEventListener("pointermove", P), n.domElement.removeEventListener("pointerup", S), n.dispatchEvent($c), s = r.NONE;
          break;
        case 1:
          const q = C[0], z = U[q];
          je({ pointerId: q, pageX: z.x, pageY: z.y });
          break;
      }
    }
    function Y(g) {
      let q;
      switch (g.button) {
        case 0:
          q = n.mouseButtons.LEFT;
          break;
        case 1:
          q = n.mouseButtons.MIDDLE;
          break;
        case 2:
          q = n.mouseButtons.RIGHT;
          break;
        default:
          q = -1;
      }
      switch (q) {
        case Gi.DOLLY:
          if (n.enableZoom === !1) return;
          Je(g), s = r.DOLLY;
          break;
        case Gi.ROTATE:
          if (g.ctrlKey || g.metaKey || g.shiftKey) {
            if (n.enablePan === !1) return;
            lt(g), s = r.PAN;
          } else {
            if (n.enableRotate === !1) return;
            Ee(g), s = r.ROTATE;
          }
          break;
        case Gi.PAN:
          if (g.ctrlKey || g.metaKey || g.shiftKey) {
            if (n.enableRotate === !1) return;
            Ee(g), s = r.ROTATE;
          } else {
            if (n.enablePan === !1) return;
            lt(g), s = r.PAN;
          }
          break;
        default:
          s = r.NONE;
      }
      s !== r.NONE && n.dispatchEvent(Ha);
    }
    function se(g) {
      switch (s) {
        case r.ROTATE:
          if (n.enableRotate === !1) return;
          J(g);
          break;
        case r.DOLLY:
          if (n.enableZoom === !1) return;
          le(g);
          break;
        case r.PAN:
          if (n.enablePan === !1) return;
          be(g);
          break;
      }
    }
    function ae(g) {
      n.enabled === !1 || n.enableZoom === !1 || s !== r.NONE || (g.preventDefault(), n.dispatchEvent(Ha), ue(ie(g)), n.dispatchEvent($c));
    }
    function ie(g) {
      const q = g.deltaMode, z = {
        clientX: g.clientX,
        clientY: g.clientY,
        deltaY: g.deltaY
      };
      switch (q) {
        case 1:
          z.deltaY *= 16;
          break;
        case 2:
          z.deltaY *= 100;
          break;
      }
      return g.ctrlKey && !A && (z.deltaY *= 10), z;
    }
    function Re(g) {
      g.key === "Control" && (A = !0, n.domElement.getRootNode().addEventListener("keyup", fe, { passive: !0, capture: !0 }));
    }
    function fe(g) {
      g.key === "Control" && (A = !1, n.domElement.getRootNode().removeEventListener("keyup", fe, { passive: !0, capture: !0 }));
    }
    function pe(g) {
      n.enabled === !1 || n.enablePan === !1 || $e(g);
    }
    function je(g) {
      switch (Ge(g), C.length) {
        case 1:
          switch (n.touches.ONE) {
            case Wi.ROTATE:
              if (n.enableRotate === !1) return;
              Fe(g), s = r.TOUCH_ROTATE;
              break;
            case Wi.PAN:
              if (n.enablePan === !1) return;
              et(g), s = r.TOUCH_PAN;
              break;
            default:
              s = r.NONE;
          }
          break;
        case 2:
          switch (n.touches.TWO) {
            case Wi.DOLLY_PAN:
              if (n.enableZoom === !1 && n.enablePan === !1) return;
              nt(g), s = r.TOUCH_DOLLY_PAN;
              break;
            case Wi.DOLLY_ROTATE:
              if (n.enableZoom === !1 && n.enableRotate === !1) return;
              it(g), s = r.TOUCH_DOLLY_ROTATE;
              break;
            default:
              s = r.NONE;
          }
          break;
        default:
          s = r.NONE;
      }
      s !== r.NONE && n.dispatchEvent(Ha);
    }
    function ce(g) {
      switch (Ge(g), s) {
        case r.TOUCH_ROTATE:
          if (n.enableRotate === !1) return;
          vt(g), n.update();
          break;
        case r.TOUCH_PAN:
          if (n.enablePan === !1) return;
          De(g), n.update();
          break;
        case r.TOUCH_DOLLY_PAN:
          if (n.enableZoom === !1 && n.enablePan === !1) return;
          Ze(g), n.update();
          break;
        case r.TOUCH_DOLLY_ROTATE:
          if (n.enableZoom === !1 && n.enableRotate === !1) return;
          qe(g), n.update();
          break;
        default:
          s = r.NONE;
      }
    }
    function Le(g) {
      n.enabled !== !1 && g.preventDefault();
    }
    function rt(g) {
      C.push(g.pointerId);
    }
    function Ue(g) {
      delete U[g.pointerId];
      for (let q = 0; q < C.length; q++)
        if (C[q] == g.pointerId) {
          C.splice(q, 1);
          return;
        }
    }
    function xe(g) {
      for (let q = 0; q < C.length; q++)
        if (C[q] == g.pointerId) return !0;
      return !1;
    }
    function Ge(g) {
      let q = U[g.pointerId];
      q === void 0 && (q = new Xe(), U[g.pointerId] = q), q.set(g.pageX, g.pageY);
    }
    function He(g) {
      const q = g.pointerId === C[0] ? C[1] : C[0];
      return U[q];
    }
    n.domElement.addEventListener("contextmenu", Le), n.domElement.addEventListener("pointerdown", Tt), n.domElement.addEventListener("pointercancel", S), n.domElement.addEventListener("wheel", ae, { passive: !1 }), n.domElement.getRootNode().addEventListener("keydown", Re, { passive: !0, capture: !0 }), this.update();
  }
}
const Ti = new w_(), on = new N(), oi = new N(), Nt = new Yt(), Qc = {
  X: new N(1, 0, 0),
  Y: new N(0, 1, 0),
  Z: new N(0, 0, 1)
}, Ga = { type: "change" }, Jc = { type: "mouseDown", mode: null }, ed = { type: "mouseUp", mode: null }, td = { type: "objectChange" };
class L_ extends Wt {
  constructor(e, t) {
    super(), t === void 0 && (console.warn('THREE.TransformControls: The second parameter "domElement" is now mandatory.'), t = document), this.isTransformControls = !0, this.visible = !1, this.domElement = t, this.domElement.style.touchAction = "none";
    const n = new F_();
    this._gizmo = n, this.add(n);
    const r = new B_();
    this._plane = r, this.add(r);
    const s = this;
    function a(M, y) {
      let w = y;
      Object.defineProperty(s, M, {
        get: function() {
          return w !== void 0 ? w : y;
        },
        set: function(I) {
          w !== I && (w = I, r[M] = I, n[M] = I, s.dispatchEvent({ type: M + "-changed", value: I }), s.dispatchEvent(Ga));
        }
      }), s[M] = y, r[M] = y, n[M] = y;
    }
    a("camera", e), a("object", void 0), a("enabled", !0), a("axis", null), a("mode", "translate"), a("translationSnap", null), a("rotationSnap", null), a("scaleSnap", null), a("space", "world"), a("size", 1), a("dragging", !1), a("showX", !0), a("showY", !0), a("showZ", !0);
    const o = new N(), l = new N(), d = new Yt(), u = new Yt(), p = new N(), f = new Yt(), m = new N(), _ = new N(), x = new N(), c = 0, h = new N();
    a("worldPosition", o), a("worldPositionStart", l), a("worldQuaternion", d), a("worldQuaternionStart", u), a("cameraPosition", p), a("cameraQuaternion", f), a("pointStart", m), a("pointEnd", _), a("rotationAxis", x), a("rotationAngle", c), a("eye", h), this._offset = new N(), this._startNorm = new N(), this._endNorm = new N(), this._cameraScale = new N(), this._parentPosition = new N(), this._parentQuaternion = new Yt(), this._parentQuaternionInv = new Yt(), this._parentScale = new N(), this._worldScaleStart = new N(), this._worldQuaternionInv = new Yt(), this._worldScale = new N(), this._positionStart = new N(), this._quaternionStart = new Yt(), this._scaleStart = new N(), this._getPointer = N_.bind(this), this._onPointerDown = D_.bind(this), this._onPointerHover = I_.bind(this), this._onPointerMove = U_.bind(this), this._onPointerUp = O_.bind(this), this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointermove", this._onPointerHover), this.domElement.addEventListener("pointerup", this._onPointerUp);
  }
  // updateMatrixWorld updates key transformation variables
  updateMatrixWorld(e) {
    this.object !== void 0 && (this.object.updateMatrixWorld(), this.object.parent === null ? console.error("TransformControls: The attached 3D object must be a part of the scene graph.") : this.object.parent.matrixWorld.decompose(this._parentPosition, this._parentQuaternion, this._parentScale), this.object.matrixWorld.decompose(this.worldPosition, this.worldQuaternion, this._worldScale), this._parentQuaternionInv.copy(this._parentQuaternion).invert(), this._worldQuaternionInv.copy(this.worldQuaternion).invert()), this.camera.updateMatrixWorld(), this.camera.matrixWorld.decompose(this.cameraPosition, this.cameraQuaternion, this._cameraScale), this.camera.isOrthographicCamera ? this.camera.getWorldDirection(this.eye).negate() : this.eye.copy(this.cameraPosition).sub(this.worldPosition).normalize(), super.updateMatrixWorld(e);
  }
  pointerHover(e) {
    if (this.object === void 0 || this.dragging === !0) return;
    e !== null && Ti.setFromCamera(e, this.camera);
    const t = Wa(this._gizmo.picker[this.mode], Ti);
    t ? this.axis = t.object.name : this.axis = null;
  }
  pointerDown(e) {
    if (!(this.object === void 0 || this.dragging === !0 || e != null && e.button !== 0) && this.axis !== null) {
      e !== null && Ti.setFromCamera(e, this.camera);
      const t = Wa(this._plane, Ti, !0);
      t && (this.object.updateMatrixWorld(), this.object.parent.updateMatrixWorld(), this._positionStart.copy(this.object.position), this._quaternionStart.copy(this.object.quaternion), this._scaleStart.copy(this.object.scale), this.object.matrixWorld.decompose(this.worldPositionStart, this.worldQuaternionStart, this._worldScaleStart), this.pointStart.copy(t.point).sub(this.worldPositionStart)), this.dragging = !0, Jc.mode = this.mode, this.dispatchEvent(Jc);
    }
  }
  pointerMove(e) {
    const t = this.axis, n = this.mode, r = this.object;
    let s = this.space;
    if (n === "scale" ? s = "local" : (t === "E" || t === "XYZE" || t === "XYZ") && (s = "world"), r === void 0 || t === null || this.dragging === !1 || e !== null && e.button !== -1) return;
    e !== null && Ti.setFromCamera(e, this.camera);
    const a = Wa(this._plane, Ti, !0);
    if (a) {
      if (this.pointEnd.copy(a.point).sub(this.worldPositionStart), n === "translate")
        this._offset.copy(this.pointEnd).sub(this.pointStart), s === "local" && t !== "XYZ" && this._offset.applyQuaternion(this._worldQuaternionInv), t.indexOf("X") === -1 && (this._offset.x = 0), t.indexOf("Y") === -1 && (this._offset.y = 0), t.indexOf("Z") === -1 && (this._offset.z = 0), s === "local" && t !== "XYZ" ? this._offset.applyQuaternion(this._quaternionStart).divide(this._parentScale) : this._offset.applyQuaternion(this._parentQuaternionInv).divide(this._parentScale), r.position.copy(this._offset).add(this._positionStart), this.translationSnap && (s === "local" && (r.position.applyQuaternion(Nt.copy(this._quaternionStart).invert()), t.search("X") !== -1 && (r.position.x = Math.round(r.position.x / this.translationSnap) * this.translationSnap), t.search("Y") !== -1 && (r.position.y = Math.round(r.position.y / this.translationSnap) * this.translationSnap), t.search("Z") !== -1 && (r.position.z = Math.round(r.position.z / this.translationSnap) * this.translationSnap), r.position.applyQuaternion(this._quaternionStart)), s === "world" && (r.parent && r.position.add(on.setFromMatrixPosition(r.parent.matrixWorld)), t.search("X") !== -1 && (r.position.x = Math.round(r.position.x / this.translationSnap) * this.translationSnap), t.search("Y") !== -1 && (r.position.y = Math.round(r.position.y / this.translationSnap) * this.translationSnap), t.search("Z") !== -1 && (r.position.z = Math.round(r.position.z / this.translationSnap) * this.translationSnap), r.parent && r.position.sub(on.setFromMatrixPosition(r.parent.matrixWorld))));
      else if (n === "scale") {
        if (t.search("XYZ") !== -1) {
          let o = this.pointEnd.length() / this.pointStart.length();
          this.pointEnd.dot(this.pointStart) < 0 && (o *= -1), oi.set(o, o, o);
        } else
          on.copy(this.pointStart), oi.copy(this.pointEnd), on.applyQuaternion(this._worldQuaternionInv), oi.applyQuaternion(this._worldQuaternionInv), oi.divide(on), t.search("X") === -1 && (oi.x = 1), t.search("Y") === -1 && (oi.y = 1), t.search("Z") === -1 && (oi.z = 1);
        r.scale.copy(this._scaleStart).multiply(oi), this.scaleSnap && (t.search("X") !== -1 && (r.scale.x = Math.round(r.scale.x / this.scaleSnap) * this.scaleSnap || this.scaleSnap), t.search("Y") !== -1 && (r.scale.y = Math.round(r.scale.y / this.scaleSnap) * this.scaleSnap || this.scaleSnap), t.search("Z") !== -1 && (r.scale.z = Math.round(r.scale.z / this.scaleSnap) * this.scaleSnap || this.scaleSnap));
      } else if (n === "rotate") {
        this._offset.copy(this.pointEnd).sub(this.pointStart);
        const o = 20 / this.worldPosition.distanceTo(on.setFromMatrixPosition(this.camera.matrixWorld));
        let l = !1;
        t === "XYZE" ? (this.rotationAxis.copy(this._offset).cross(this.eye).normalize(), this.rotationAngle = this._offset.dot(on.copy(this.rotationAxis).cross(this.eye)) * o) : (t === "X" || t === "Y" || t === "Z") && (this.rotationAxis.copy(Qc[t]), on.copy(Qc[t]), s === "local" && on.applyQuaternion(this.worldQuaternion), on.cross(this.eye), on.length() === 0 ? l = !0 : this.rotationAngle = this._offset.dot(on.normalize()) * o), (t === "E" || l) && (this.rotationAxis.copy(this.eye), this.rotationAngle = this.pointEnd.angleTo(this.pointStart), this._startNorm.copy(this.pointStart).normalize(), this._endNorm.copy(this.pointEnd).normalize(), this.rotationAngle *= this._endNorm.cross(this._startNorm).dot(this.eye) < 0 ? 1 : -1), this.rotationSnap && (this.rotationAngle = Math.round(this.rotationAngle / this.rotationSnap) * this.rotationSnap), s === "local" && t !== "E" && t !== "XYZE" ? (r.quaternion.copy(this._quaternionStart), r.quaternion.multiply(Nt.setFromAxisAngle(this.rotationAxis, this.rotationAngle)).normalize()) : (this.rotationAxis.applyQuaternion(this._parentQuaternionInv), r.quaternion.copy(Nt.setFromAxisAngle(this.rotationAxis, this.rotationAngle)), r.quaternion.multiply(this._quaternionStart).normalize());
      }
      this.dispatchEvent(Ga), this.dispatchEvent(td);
    }
  }
  pointerUp(e) {
    e !== null && e.button !== 0 || (this.dragging && this.axis !== null && (ed.mode = this.mode, this.dispatchEvent(ed)), this.dragging = !1, this.axis = null);
  }
  dispose() {
    this.domElement.removeEventListener("pointerdown", this._onPointerDown), this.domElement.removeEventListener("pointermove", this._onPointerHover), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.traverse(function(e) {
      e.geometry && e.geometry.dispose(), e.material && e.material.dispose();
    });
  }
  // Set current object
  attach(e) {
    return this.object = e, this.visible = !0, this;
  }
  // Detach from object
  detach() {
    return this.object = void 0, this.visible = !1, this.axis = null, this;
  }
  reset() {
    this.enabled && this.dragging && (this.object.position.copy(this._positionStart), this.object.quaternion.copy(this._quaternionStart), this.object.scale.copy(this._scaleStart), this.dispatchEvent(Ga), this.dispatchEvent(td), this.pointStart.copy(this.pointEnd));
  }
  getRaycaster() {
    return Ti;
  }
  // TODO: deprecate
  getMode() {
    return this.mode;
  }
  setMode(e) {
    this.mode = e;
  }
  setTranslationSnap(e) {
    this.translationSnap = e;
  }
  setRotationSnap(e) {
    this.rotationSnap = e;
  }
  setScaleSnap(e) {
    this.scaleSnap = e;
  }
  setSize(e) {
    this.size = e;
  }
  setSpace(e) {
    this.space = e;
  }
}
function N_(i) {
  if (this.domElement.ownerDocument.pointerLockElement)
    return {
      x: 0,
      y: 0,
      button: i.button
    };
  {
    const e = this.domElement.getBoundingClientRect();
    return {
      x: (i.clientX - e.left) / e.width * 2 - 1,
      y: -(i.clientY - e.top) / e.height * 2 + 1,
      button: i.button
    };
  }
}
function I_(i) {
  if (this.enabled)
    switch (i.pointerType) {
      case "mouse":
      case "pen":
        this.pointerHover(this._getPointer(i));
        break;
    }
}
function D_(i) {
  this.enabled && (document.pointerLockElement || this.domElement.setPointerCapture(i.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.pointerHover(this._getPointer(i)), this.pointerDown(this._getPointer(i)));
}
function U_(i) {
  this.enabled && this.pointerMove(this._getPointer(i));
}
function O_(i) {
  this.enabled && (this.domElement.releasePointerCapture(i.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.pointerUp(this._getPointer(i)));
}
function Wa(i, e, t) {
  const n = e.intersectObject(i, !0);
  for (let r = 0; r < n.length; r++)
    if (n[r].object.visible || t)
      return n[r];
  return !1;
}
const Es = new En(), Mt = new N(0, 1, 0), nd = new N(0, 0, 0), id = new yt(), bs = new Yt(), Ps = new Yt(), Fn = new N(), rd = new yt(), kr = new N(1, 0, 0), wi = new N(0, 1, 0), Vr = new N(0, 0, 1), Ts = new N(), Ur = new N(), Or = new N();
class F_ extends Wt {
  constructor() {
    super(), this.isTransformControlsGizmo = !0, this.type = "TransformControlsGizmo";
    const e = new Xs({
      depthTest: !1,
      depthWrite: !1,
      fog: !1,
      toneMapped: !1,
      transparent: !0
    }), t = new qs({
      depthTest: !1,
      depthWrite: !1,
      fog: !1,
      toneMapped: !1,
      transparent: !0
    }), n = e.clone();
    n.opacity = 0.15;
    const r = t.clone();
    r.opacity = 0.5;
    const s = e.clone();
    s.color.setHex(16711680);
    const a = e.clone();
    a.color.setHex(65280);
    const o = e.clone();
    o.color.setHex(255);
    const l = e.clone();
    l.color.setHex(16711680), l.opacity = 0.5;
    const d = e.clone();
    d.color.setHex(65280), d.opacity = 0.5;
    const u = e.clone();
    u.color.setHex(255), u.opacity = 0.5;
    const p = e.clone();
    p.opacity = 0.25;
    const f = e.clone();
    f.color.setHex(16776960), f.opacity = 0.25, e.clone().color.setHex(16776960);
    const _ = e.clone();
    _.color.setHex(7895160);
    const x = new an(0, 0.04, 0.1, 12);
    x.translate(0, 0.05, 0);
    const c = new kt(0.08, 0.08, 0.08);
    c.translate(0, 0.04, 0);
    const h = new ln();
    h.setAttribute("position", new Et([0, 0, 0, 1, 0, 0], 3));
    const M = new an(75e-4, 75e-4, 0.5, 3);
    M.translate(0, 0.25, 0);
    function y(Q, j) {
      const re = new Pi(Q, 75e-4, 3, 64, j * Math.PI * 2);
      return re.rotateY(Math.PI / 2), re.rotateX(Math.PI / 2), re;
    }
    function w() {
      const Q = new ln();
      return Q.setAttribute("position", new Et([0, 0, 0, 1, 1, 1], 3)), Q;
    }
    const I = {
      X: [
        [new Te(x, s), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
        [new Te(x, s), [-0.5, 0, 0], [0, 0, Math.PI / 2]],
        [new Te(M, s), [0, 0, 0], [0, 0, -Math.PI / 2]]
      ],
      Y: [
        [new Te(x, a), [0, 0.5, 0]],
        [new Te(x, a), [0, -0.5, 0], [Math.PI, 0, 0]],
        [new Te(M, a)]
      ],
      Z: [
        [new Te(x, o), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new Te(x, o), [0, 0, -0.5], [-Math.PI / 2, 0, 0]],
        [new Te(M, o), null, [Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new Te(new ur(0.1, 0), p.clone()), [0, 0, 0]]
      ],
      XY: [
        [new Te(new kt(0.15, 0.15, 0.01), u.clone()), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new Te(new kt(0.15, 0.15, 0.01), l.clone()), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new Te(new kt(0.15, 0.15, 0.01), d.clone()), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ]
    }, R = {
      X: [
        [new Te(new an(0.2, 0, 0.6, 4), n), [0.3, 0, 0], [0, 0, -Math.PI / 2]],
        [new Te(new an(0.2, 0, 0.6, 4), n), [-0.3, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new Te(new an(0.2, 0, 0.6, 4), n), [0, 0.3, 0]],
        [new Te(new an(0.2, 0, 0.6, 4), n), [0, -0.3, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new Te(new an(0.2, 0, 0.6, 4), n), [0, 0, 0.3], [Math.PI / 2, 0, 0]],
        [new Te(new an(0.2, 0, 0.6, 4), n), [0, 0, -0.3], [-Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new Te(new ur(0.2, 0), n)]
      ],
      XY: [
        [new Te(new kt(0.2, 0.2, 0.01), n), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new Te(new kt(0.2, 0.2, 0.01), n), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new Te(new kt(0.2, 0.2, 0.01), n), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ]
    }, C = {
      START: [
        [new Te(new ur(0.01, 2), r), null, null, null, "helper"]
      ],
      END: [
        [new Te(new ur(0.01, 2), r), null, null, null, "helper"]
      ],
      DELTA: [
        [new Qn(w(), r), null, null, null, "helper"]
      ],
      X: [
        [new Qn(h, r.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ],
      Y: [
        [new Qn(h, r.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], "helper"]
      ],
      Z: [
        [new Qn(h, r.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], "helper"]
      ]
    }, U = {
      XYZE: [
        [new Te(y(0.5, 1), _), null, [0, Math.PI / 2, 0]]
      ],
      X: [
        [new Te(y(0.5, 0.5), s)]
      ],
      Y: [
        [new Te(y(0.5, 0.5), a), null, [0, 0, -Math.PI / 2]]
      ],
      Z: [
        [new Te(y(0.5, 0.5), o), null, [0, Math.PI / 2, 0]]
      ],
      E: [
        [new Te(y(0.75, 1), f), null, [0, Math.PI / 2, 0]]
      ]
    }, A = {
      AXIS: [
        [new Qn(h, r.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ]
    }, v = {
      XYZE: [
        [new Te(new po(0.25, 10, 8), n)]
      ],
      X: [
        [new Te(new Pi(0.5, 0.1, 4, 24), n), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]]
      ],
      Y: [
        [new Te(new Pi(0.5, 0.1, 4, 24), n), [0, 0, 0], [Math.PI / 2, 0, 0]]
      ],
      Z: [
        [new Te(new Pi(0.5, 0.1, 4, 24), n), [0, 0, 0], [0, 0, -Math.PI / 2]]
      ],
      E: [
        [new Te(new Pi(0.75, 0.1, 2, 24), n)]
      ]
    }, L = {
      X: [
        [new Te(c, s), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
        [new Te(M, s), [0, 0, 0], [0, 0, -Math.PI / 2]],
        [new Te(c, s), [-0.5, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new Te(c, a), [0, 0.5, 0]],
        [new Te(M, a)],
        [new Te(c, a), [0, -0.5, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new Te(c, o), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new Te(M, o), [0, 0, 0], [Math.PI / 2, 0, 0]],
        [new Te(c, o), [0, 0, -0.5], [-Math.PI / 2, 0, 0]]
      ],
      XY: [
        [new Te(new kt(0.15, 0.15, 0.01), u), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new Te(new kt(0.15, 0.15, 0.01), l), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new Te(new kt(0.15, 0.15, 0.01), d), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new Te(new kt(0.1, 0.1, 0.1), p.clone())]
      ]
    }, k = {
      X: [
        [new Te(new an(0.2, 0, 0.6, 4), n), [0.3, 0, 0], [0, 0, -Math.PI / 2]],
        [new Te(new an(0.2, 0, 0.6, 4), n), [-0.3, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new Te(new an(0.2, 0, 0.6, 4), n), [0, 0.3, 0]],
        [new Te(new an(0.2, 0, 0.6, 4), n), [0, -0.3, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new Te(new an(0.2, 0, 0.6, 4), n), [0, 0, 0.3], [Math.PI / 2, 0, 0]],
        [new Te(new an(0.2, 0, 0.6, 4), n), [0, 0, -0.3], [-Math.PI / 2, 0, 0]]
      ],
      XY: [
        [new Te(new kt(0.2, 0.2, 0.01), n), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new Te(new kt(0.2, 0.2, 0.01), n), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new Te(new kt(0.2, 0.2, 0.01), n), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new Te(new kt(0.2, 0.2, 0.2), n), [0, 0, 0]]
      ]
    }, V = {
      X: [
        [new Qn(h, r.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ],
      Y: [
        [new Qn(h, r.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], "helper"]
      ],
      Z: [
        [new Qn(h, r.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], "helper"]
      ]
    };
    function W(Q) {
      const j = new Wt();
      for (const re in Q)
        for (let K = Q[re].length; K--; ) {
          const de = Q[re][K][0].clone(), _e = Q[re][K][1], Ee = Q[re][K][2], Je = Q[re][K][3], lt = Q[re][K][4];
          de.name = re, de.tag = lt, _e && de.position.set(_e[0], _e[1], _e[2]), Ee && de.rotation.set(Ee[0], Ee[1], Ee[2]), Je && de.scale.set(Je[0], Je[1], Je[2]), de.updateMatrix();
          const J = de.geometry.clone();
          J.applyMatrix4(de.matrix), de.geometry = J, de.renderOrder = 1 / 0, de.position.set(0, 0, 0), de.rotation.set(0, 0, 0), de.scale.set(1, 1, 1), j.add(de);
        }
      return j;
    }
    this.gizmo = {}, this.picker = {}, this.helper = {}, this.add(this.gizmo.translate = W(I)), this.add(this.gizmo.rotate = W(U)), this.add(this.gizmo.scale = W(L)), this.add(this.picker.translate = W(R)), this.add(this.picker.rotate = W(v)), this.add(this.picker.scale = W(k)), this.add(this.helper.translate = W(C)), this.add(this.helper.rotate = W(A)), this.add(this.helper.scale = W(V)), this.picker.translate.visible = !1, this.picker.rotate.visible = !1, this.picker.scale.visible = !1;
  }
  // updateMatrixWorld will update transformations and appearance of individual handles
  updateMatrixWorld(e) {
    const n = (this.mode === "scale" ? "local" : this.space) === "local" ? this.worldQuaternion : Ps;
    this.gizmo.translate.visible = this.mode === "translate", this.gizmo.rotate.visible = this.mode === "rotate", this.gizmo.scale.visible = this.mode === "scale", this.helper.translate.visible = this.mode === "translate", this.helper.rotate.visible = this.mode === "rotate", this.helper.scale.visible = this.mode === "scale";
    let r = [];
    r = r.concat(this.picker[this.mode].children), r = r.concat(this.gizmo[this.mode].children), r = r.concat(this.helper[this.mode].children);
    for (let s = 0; s < r.length; s++) {
      const a = r[s];
      a.visible = !0, a.rotation.set(0, 0, 0), a.position.copy(this.worldPosition);
      let o;
      if (this.camera.isOrthographicCamera ? o = (this.camera.top - this.camera.bottom) / this.camera.zoom : o = this.worldPosition.distanceTo(this.cameraPosition) * Math.min(1.9 * Math.tan(Math.PI * this.camera.fov / 360) / this.camera.zoom, 7), a.scale.set(1, 1, 1).multiplyScalar(o * this.size / 4), a.tag === "helper") {
        a.visible = !1, a.name === "AXIS" ? (a.visible = !!this.axis, this.axis === "X" && (Nt.setFromEuler(Es.set(0, 0, 0)), a.quaternion.copy(n).multiply(Nt), Math.abs(Mt.copy(kr).applyQuaternion(n).dot(this.eye)) > 0.9 && (a.visible = !1)), this.axis === "Y" && (Nt.setFromEuler(Es.set(0, 0, Math.PI / 2)), a.quaternion.copy(n).multiply(Nt), Math.abs(Mt.copy(wi).applyQuaternion(n).dot(this.eye)) > 0.9 && (a.visible = !1)), this.axis === "Z" && (Nt.setFromEuler(Es.set(0, Math.PI / 2, 0)), a.quaternion.copy(n).multiply(Nt), Math.abs(Mt.copy(Vr).applyQuaternion(n).dot(this.eye)) > 0.9 && (a.visible = !1)), this.axis === "XYZE" && (Nt.setFromEuler(Es.set(0, Math.PI / 2, 0)), Mt.copy(this.rotationAxis), a.quaternion.setFromRotationMatrix(id.lookAt(nd, Mt, wi)), a.quaternion.multiply(Nt), a.visible = this.dragging), this.axis === "E" && (a.visible = !1)) : a.name === "START" ? (a.position.copy(this.worldPositionStart), a.visible = this.dragging) : a.name === "END" ? (a.position.copy(this.worldPosition), a.visible = this.dragging) : a.name === "DELTA" ? (a.position.copy(this.worldPositionStart), a.quaternion.copy(this.worldQuaternionStart), on.set(1e-10, 1e-10, 1e-10).add(this.worldPositionStart).sub(this.worldPosition).multiplyScalar(-1), on.applyQuaternion(this.worldQuaternionStart.clone().invert()), a.scale.copy(on), a.visible = this.dragging) : (a.quaternion.copy(n), this.dragging ? a.position.copy(this.worldPositionStart) : a.position.copy(this.worldPosition), this.axis && (a.visible = this.axis.search(a.name) !== -1));
        continue;
      }
      a.quaternion.copy(n), this.mode === "translate" || this.mode === "scale" ? (a.name === "X" && Math.abs(Mt.copy(kr).applyQuaternion(n).dot(this.eye)) > 0.99 && (a.scale.set(1e-10, 1e-10, 1e-10), a.visible = !1), a.name === "Y" && Math.abs(Mt.copy(wi).applyQuaternion(n).dot(this.eye)) > 0.99 && (a.scale.set(1e-10, 1e-10, 1e-10), a.visible = !1), a.name === "Z" && Math.abs(Mt.copy(Vr).applyQuaternion(n).dot(this.eye)) > 0.99 && (a.scale.set(1e-10, 1e-10, 1e-10), a.visible = !1), a.name === "XY" && Math.abs(Mt.copy(Vr).applyQuaternion(n).dot(this.eye)) < 0.2 && (a.scale.set(1e-10, 1e-10, 1e-10), a.visible = !1), a.name === "YZ" && Math.abs(Mt.copy(kr).applyQuaternion(n).dot(this.eye)) < 0.2 && (a.scale.set(1e-10, 1e-10, 1e-10), a.visible = !1), a.name === "XZ" && Math.abs(Mt.copy(wi).applyQuaternion(n).dot(this.eye)) < 0.2 && (a.scale.set(1e-10, 1e-10, 1e-10), a.visible = !1)) : this.mode === "rotate" && (bs.copy(n), Mt.copy(this.eye).applyQuaternion(Nt.copy(n).invert()), a.name.search("E") !== -1 && a.quaternion.setFromRotationMatrix(id.lookAt(this.eye, nd, wi)), a.name === "X" && (Nt.setFromAxisAngle(kr, Math.atan2(-Mt.y, Mt.z)), Nt.multiplyQuaternions(bs, Nt), a.quaternion.copy(Nt)), a.name === "Y" && (Nt.setFromAxisAngle(wi, Math.atan2(Mt.x, Mt.z)), Nt.multiplyQuaternions(bs, Nt), a.quaternion.copy(Nt)), a.name === "Z" && (Nt.setFromAxisAngle(Vr, Math.atan2(Mt.y, Mt.x)), Nt.multiplyQuaternions(bs, Nt), a.quaternion.copy(Nt))), a.visible = a.visible && (a.name.indexOf("X") === -1 || this.showX), a.visible = a.visible && (a.name.indexOf("Y") === -1 || this.showY), a.visible = a.visible && (a.name.indexOf("Z") === -1 || this.showZ), a.visible = a.visible && (a.name.indexOf("E") === -1 || this.showX && this.showY && this.showZ), a.material._color = a.material._color || a.material.color.clone(), a.material._opacity = a.material._opacity || a.material.opacity, a.material.color.copy(a.material._color), a.material.opacity = a.material._opacity, this.enabled && this.axis && (a.name === this.axis || this.axis.split("").some(function(l) {
        return a.name === l;
      })) && (a.material.color.setHex(16776960), a.material.opacity = 1);
    }
    super.updateMatrixWorld(e);
  }
}
class B_ extends Te {
  constructor() {
    super(
      new Xr(1e5, 1e5, 2, 2),
      new Xs({ visible: !1, wireframe: !0, side: kn, transparent: !0, opacity: 0.1, toneMapped: !1 })
    ), this.isTransformControlsPlane = !0, this.type = "TransformControlsPlane";
  }
  updateMatrixWorld(e) {
    let t = this.space;
    switch (this.position.copy(this.worldPosition), this.mode === "scale" && (t = "local"), Ts.copy(kr).applyQuaternion(t === "local" ? this.worldQuaternion : Ps), Ur.copy(wi).applyQuaternion(t === "local" ? this.worldQuaternion : Ps), Or.copy(Vr).applyQuaternion(t === "local" ? this.worldQuaternion : Ps), Mt.copy(Ur), this.mode) {
      case "translate":
      case "scale":
        switch (this.axis) {
          case "X":
            Mt.copy(this.eye).cross(Ts), Fn.copy(Ts).cross(Mt);
            break;
          case "Y":
            Mt.copy(this.eye).cross(Ur), Fn.copy(Ur).cross(Mt);
            break;
          case "Z":
            Mt.copy(this.eye).cross(Or), Fn.copy(Or).cross(Mt);
            break;
          case "XY":
            Fn.copy(Or);
            break;
          case "YZ":
            Fn.copy(Ts);
            break;
          case "XZ":
            Mt.copy(Or), Fn.copy(Ur);
            break;
          case "XYZ":
          case "E":
            Fn.set(0, 0, 0);
            break;
        }
        break;
      case "rotate":
      default:
        Fn.set(0, 0, 0);
    }
    Fn.length() === 0 ? this.quaternion.copy(this.cameraQuaternion) : (rd.lookAt(on.set(0, 0, 0), Fn, Mt), this.quaternion.setFromRotationMatrix(rd)), super.updateMatrixWorld(e);
  }
}
const sd = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], Xa = Math.PI / 180, Ya = 180 / Math.PI;
function qa(i) {
  if (i == null) return null;
  const e = String(i).split(",").map(Number);
  return e.length === 16 && !e.some(isNaN) ? e : null;
}
function ro(i) {
  const e = new yt();
  return e.set(i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7], i[8], i[9], i[10], i[11], i[12], i[13], i[14], i[15]), e;
}
function Od(i) {
  const e = i.elements;
  return [e[0], e[4], e[8], e[12], e[1], e[5], e[9], e[13], e[2], e[6], e[10], e[14], e[3], e[7], e[11], e[15]];
}
function Fr(i) {
  const e = new N(), t = new Yt(), n = new N();
  ro(i).decompose(e, t, n);
  const r = new En().setFromQuaternion(t, "XYZ");
  return { tx: e.x, ty: e.y, tz: e.z, rx: r.x * Ya, ry: r.y * Ya, rz: r.z * Ya };
}
function z_(i) {
  return Od(new yt().compose(
    new N(i.tx, i.ty, i.tz),
    new Yt().setFromEuler(new En(i.rx * Xa, i.ry * Xa, i.rz * Xa, "XYZ")),
    new N(1, 1, 1)
  ));
}
function k_(i) {
  return Od(new yt().compose(i.position, i.quaternion, new N(1, 1, 1)));
}
function lr(i) {
  return Math.abs(i) < 1e-9 ? "0" : String(parseFloat(i.toPrecision(7)));
}
function As(i) {
  return { tx: lr(i.tx), ty: lr(i.ty), tz: lr(i.tz), rx: lr(i.rx), ry: lr(i.ry), rz: lr(i.rz) };
}
function V_({ matRef: i, readOnly: e, onMatChange: t, tcMode: n }) {
  const r = Mn(null), s = Mn(t), a = Mn(null);
  return Ct(() => {
    s.current = t;
  }), Ct(() => {
    var o;
    (o = a.current) == null || o.setMode(n);
  }, [n]), Ct(() => {
    const o = r.current;
    if (!o) return;
    const l = 256, d = 200, u = new y_({ canvas: o, antialias: !0 });
    u.setPixelRatio(Math.min(window.devicePixelRatio, 2)), u.setSize(l, d, !1), u.setClearColor(1315870);
    const p = new S_(), f = new An(45, l / d, 1e-3, 1e5);
    f.position.set(3, 2.5, 4), f.lookAt(0, 0, 0), p.add(new R_(6, 6, 3816026, 2763330)), p.add(new jc(1.5)), p.add(new A_(16777215, 0.7));
    const m = new T_(16777215, 0.6);
    m.position.set(5, 8, 5), p.add(m);
    const _ = new zr();
    _.add(new Te(
      new kt(0.22, 0.36, 0.16),
      new M_({ color: 3381759, transparent: !0, opacity: 0.8 })
    )), _.add(new jc(0.7)), p.add(_), ro(i.current).decompose(_.position, _.quaternion, _.scale), _.updateMatrixWorld(!0);
    const x = new P_(f, o);
    x.enableDamping = !0, x.dampingFactor = 0.1;
    let c = null, h = !1;
    e || (c = new L_(f, o), c.attach(_), c.setMode(n), p.add(c), a.current = c, c.addEventListener("dragging-changed", (I) => {
      x.enabled = !I.value, h = I.value, I.value || (M = i.current);
    }), c.addEventListener("change", () => {
      var R;
      const I = k_(_);
      i.current = I, (R = s.current) == null || R.call(s, I);
    }));
    let M = i.current, y;
    const w = () => {
      y = requestAnimationFrame(w), !h && i.current !== M && (M = i.current, ro(M).decompose(_.position, _.quaternion, _.scale), _.updateMatrixWorld(!0)), x.update(), u.render(p, f);
    };
    return w(), () => {
      cancelAnimationFrame(y), x.dispose(), c == null || c.dispose(), u.forceContextLoss(), u.dispose(), a.current = null;
    };
  }, []), /* @__PURE__ */ E(
    "canvas",
    {
      ref: r,
      width: 256,
      height: 200,
      style: { borderRadius: 4, display: "block", width: 256, height: 200 }
    }
  );
}
function ja({ value: i, onChange: e, readOnly: t }) {
  const n = Mn(qa(i) ?? [...sd]), r = Mn(e), s = Mn(!1), a = qa(i) ?? [...sd], [o, l] = Ie(a), [d, u] = Ie(() => As(Fr(a))), [p, f] = Ie(!1), [m, _] = Ie(!1), [x, c] = Ie("translate");
  Ct(() => {
    r.current = e;
  }), Ct(() => {
    const v = qa(i);
    if (v) {
      if (s.current) {
        s.current = !1;
        return;
      }
      n.current = v, l(v), u(As(Fr(v)));
    }
  }, [i]);
  function h(v) {
    var L;
    s.current = !0, (L = r.current) == null || L.call(r, v.join(","));
  }
  function M(v, L) {
    if (t) return;
    u((W) => ({ ...W, [v]: L }));
    const k = parseFloat(L);
    if (isNaN(k)) return;
    const V = z_({ ...Fr(n.current), [v]: k });
    n.current = V, l(V), h(V);
  }
  function y(v, L) {
    if (t) return;
    const k = parseFloat(L);
    if (isNaN(k)) return;
    const V = [...n.current];
    V[v] = k, n.current = V, l(V), u(As(Fr(V))), h(V);
  }
  function w(v) {
    n.current = v, l(v), u(As(Fr(v))), h(v);
  }
  const I = { fontSize: 10, color: "var(--muted, #888)", marginBottom: 4 }, R = { display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 6px", alignItems: "center" }, C = { fontSize: 10, color: "var(--muted, #888)", fontFamily: "var(--mono, monospace)" }, U = { padding: "2px 4px", fontSize: 11, width: "100%" }, A = { flex: 1, fontSize: 10, padding: "2px 0", border: "1px solid var(--border, #3a3a5a)", borderRadius: 3, cursor: "pointer" };
  return /* @__PURE__ */ F("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
    /* @__PURE__ */ F("div", { style: { display: "flex", gap: 12, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ F("div", { style: { flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 8 }, children: [
        /* @__PURE__ */ F("div", { children: [
          /* @__PURE__ */ E("div", { style: I, children: "Translation" }),
          /* @__PURE__ */ E("div", { style: R, children: [["tx", "X"], ["ty", "Y"], ["tz", "Z"]].map(([v, L]) => /* @__PURE__ */ F(dr, { children: [
            /* @__PURE__ */ E("span", { style: C, children: L }),
            /* @__PURE__ */ E(
              "input",
              {
                type: "number",
                step: "any",
                className: "field-input",
                style: U,
                value: d[v],
                disabled: t,
                onChange: (k) => M(v, k.target.value)
              }
            )
          ] }, v)) })
        ] }),
        /* @__PURE__ */ F("div", { children: [
          /* @__PURE__ */ E("div", { style: I, children: "Rotation (°)" }),
          /* @__PURE__ */ E("div", { style: R, children: [["rx", "X"], ["ry", "Y"], ["rz", "Z"]].map(([v, L]) => /* @__PURE__ */ F(dr, { children: [
            /* @__PURE__ */ E("span", { style: C, children: L }),
            /* @__PURE__ */ E(
              "input",
              {
                type: "number",
                step: "any",
                className: "field-input",
                style: U,
                value: d[v],
                disabled: t,
                onChange: (k) => M(v, k.target.value)
              }
            )
          ] }, v)) })
        ] })
      ] }),
      /* @__PURE__ */ E("div", { style: { flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 4 }, children: m ? /* @__PURE__ */ F(Hr, { children: [
        /* @__PURE__ */ E(V_, { matRef: n, readOnly: t, onMatChange: w, tcMode: x }),
        !t && /* @__PURE__ */ F("div", { style: { display: "flex", gap: 4 }, children: [
          ["translate", "rotate"].map((v) => /* @__PURE__ */ E("button", { style: {
            ...A,
            background: x === v ? "var(--accent, #3399ff)" : "var(--surface2, #1e1e2e)",
            color: x === v ? "#fff" : "var(--fg, #ccc)"
          }, onClick: () => c(v), children: v === "translate" ? "Translate" : "Rotate" }, v)),
          /* @__PURE__ */ E(
            "button",
            {
              style: { ...A, flex: "0 0 auto", padding: "2px 6px", background: "var(--surface2, #1e1e2e)", color: "var(--muted, #888)" },
              onClick: () => _(!1),
              children: "✕"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ E(
        "button",
        {
          style: { ...A, flex: "none", padding: "4px 10px", fontSize: 11, background: "var(--surface2, #1e1e2e)", color: "var(--fg, #ccc)" },
          onClick: () => _(!0),
          children: "▷ 3D"
        }
      ) })
    ] }),
    /* @__PURE__ */ F("div", { children: [
      /* @__PURE__ */ F(
        "button",
        {
          style: { fontSize: 10, color: "var(--muted, #888)", background: "none", border: "none", cursor: "pointer", padding: "2px 0" },
          onClick: () => f((v) => !v),
          children: [
            p ? "▼" : "▶",
            " Raw 4×4 matrix"
          ]
        }
      ),
      p && /* @__PURE__ */ E("div", { style: { marginTop: 4, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, fontFamily: "var(--mono, monospace)" }, children: o.map((v, L) => /* @__PURE__ */ E(
        "input",
        {
          type: "number",
          step: "any",
          className: "field-input",
          style: { padding: "2px 4px", fontSize: 10, textAlign: "right", width: "100%" },
          value: parseFloat(v.toFixed(8)),
          disabled: t,
          onChange: (k) => y(L, k.target.value)
        },
        L
      )) })
    ] })
  ] });
}
function so(i) {
  var e;
  return ((e = (i.linkAttributeValues || []).find((t) => t.attributeId === "kind")) == null ? void 0 : e.value) || null;
}
function H_(i) {
  var e;
  return ((e = (i.linkAttributeValues || []).find((t) => t.attributeId === "layer")) == null ? void 0 : e.value) || "main";
}
function G_(i) {
  var n;
  const e = (((n = i.targetDetails) == null ? void 0 : n.contentType) || "").toLowerCase(), t = (i.displayKey || i.targetKey || "").toLowerCase();
  return e.includes("step") || e.includes("stp") || t.endsWith(".stp") || t.endsWith(".step") || t.endsWith(".p21");
}
function W_(i) {
  if (i.targetSourceCode !== "DATA_LOCAL") return !1;
  const e = so(i);
  return e === "simplified" || e === "design" || e === "original" ? !0 : G_(i);
}
function X_(i) {
  return { "st-draft": "Draft", "st-inreview": "In Review", "st-released": "Released", "st-frozen": "Frozen", "st-obsolete": "Obsolete" }[i] || i;
}
function Y_(i, e, t) {
  let n = i;
  for (; n; ) {
    if (n === e) return !0;
    const r = (t || []).find((s) => (s.id || s.ID) === n);
    n = r && (r.parent_node_type_id || r.PARENT_NODE_TYPE_ID) || null;
  }
  return !1;
}
function Ii({ stateId: i, stateName: e, stateColorMap: t }) {
  const n = (t == null ? void 0 : t[i]) || "#6b7280";
  return /* @__PURE__ */ F("span", { className: "pill", style: { color: n, background: `${n}18`, border: `1px solid ${n}30` }, children: [
    /* @__PURE__ */ E("span", { className: "pill-dot", style: { background: n } }),
    e || X_(i)
  ] });
}
function q_(i, e) {
  const t = new Array(16);
  for (let n = 0; n < 4; n++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let a = 0; a < 4; a++) s += i[n * 4 + a] * e[a * 4 + r];
      t[n * 4 + r] = s;
    }
  return t;
}
async function Fd(i, e, t, n, r, s, a, o, l, d, u = null, p = null) {
  var c;
  if (a > o) return [];
  if (a === 0 && u === null && l.has(t)) return [];
  a === 0 && u === null && l.add(t);
  const f = s.filter(W_), m = /* @__PURE__ */ new Map();
  for (const h of f) {
    const M = H_(h), y = so(h);
    m.has(M) || m.set(M, { simplified: null, fallback: null });
    const w = m.get(M);
    y === "simplified" ? w.simplified = h : w.fallback || (w.fallback = h);
  }
  const _ = [];
  for (const [h, { simplified: M, fallback: y }] of m) {
    if (h !== "main") continue;
    const w = M || y;
    if (!w) continue;
    const I = so(w) || "design";
    _.push({
      uuid: w.targetKey,
      fileName: w.displayKey || w.targetKey,
      sizeBytes: (c = w.targetDetails) == null ? void 0 : c.sizeBytes,
      instanceKey: u ? `${w.targetKey}#${u}` : w.targetKey,
      matrix: p,
      kind: I
    });
  }
  const x = [];
  if (_.length > 0 && x.push({ nodeId: t, nodeLabel: n, stateColor: r, depth: a, parts: _, instanceId: u || t }), a < o) {
    const h = s.filter((M) => M.targetSourceCode === "SELF" && M.targetNodeId);
    await Promise.all(h.map(async (M) => {
      var w;
      const y = M.linkId;
      if (!(!y || l.has(y))) {
        l.add(y);
        try {
          const I = (w = (M.linkAttributeValues || []).find((L) => L.attributeId === "position")) == null ? void 0 : w.value;
          let R = null;
          if (I) {
            const L = I.split(",").map(Number);
            L.length === 16 && L.every((k) => !isNaN(k)) && (R = L);
          }
          let C = null;
          p && R ? C = q_(p, R) : R ? C = R : p && (C = p);
          const U = await i.getChildLinks(null, M.targetNodeId), A = (d == null ? void 0 : d[M.targetState]) || "#6b7280", v = await Fd(
            i,
            e,
            M.targetNodeId,
            M.targetLogicalId || M.targetNodeId,
            A,
            Array.isArray(U) ? U : [],
            a + 1,
            o,
            new Set(l),
            d,
            u ? `${u}/${y}` : y,
            C
          );
          x.push(...v);
        } catch {
        }
      }
    }));
  }
  return x;
}
function j_({ jobData: i, onClose: e }) {
  const { job: t, results: n = [] } = i, r = t.status === "DONE" || t.status === "FAILED", s = n.reduce((o, l) => (o[l.action] = (o[l.action] || 0) + 1, o), {}), a = (o) => o === "CREATED" ? "var(--success)" : o === "UPDATED" ? "var(--accent)" : o === "REJECTED" ? "var(--danger)" : "var(--muted)";
  return /* @__PURE__ */ F(Hr, { children: [
    /* @__PURE__ */ F("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }, children: [
      /* @__PURE__ */ E("span", { style: { fontSize: 18 }, children: t.status === "DONE" ? "✓" : t.status === "FAILED" ? "✕" : "⏳" }),
      /* @__PURE__ */ F("span", { style: { fontWeight: 600, color: t.status === "FAILED" ? "var(--danger)" : t.status === "DONE" ? t.errorSummary ? "var(--warning, #f5a623)" : "var(--success)" : void 0 }, children: [
        t.status === "PENDING" && "Queued…",
        t.status === "RUNNING" && "Processing…",
        t.status === "DONE" && `Complete — ${n.length} node${n.length !== 1 ? "s" : ""}${t.errorSummary ? " (with warnings)" : ""}`,
        t.status === "FAILED" && `Failed: ${t.errorSummary || "unknown error"}`
      ] })
    ] }),
    t.status === "DONE" && t.errorSummary && /* @__PURE__ */ E("div", { style: { marginBottom: 12, padding: "8px 10px", background: "var(--warning-bg, #fff8e1)", border: "1px solid var(--warning, #f5a623)", borderRadius: 6, fontSize: 12, color: "var(--warning-text, #7a4f00)", whiteSpace: "pre-wrap" }, children: t.errorSummary }),
    Object.keys(s).length > 0 && /* @__PURE__ */ E("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }, children: Object.entries(s).map(([o, l]) => /* @__PURE__ */ F("span", { style: { fontSize: 12, padding: "2px 8px", borderRadius: 4, border: `1px solid ${a(o)}40`, color: a(o) }, children: [
      o,
      ": ",
      l
    ] }, o)) }),
    n.length > 0 && /* @__PURE__ */ E("div", { style: { maxHeight: 240, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 6, marginBottom: 16 }, children: /* @__PURE__ */ F("table", { style: { width: "100%", fontSize: 12, borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ E("thead", { children: /* @__PURE__ */ F("tr", { style: { background: "var(--surface)", position: "sticky", top: 0 }, children: [
        /* @__PURE__ */ E("th", { style: { padding: "6px 10px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }, children: "Name" }),
        /* @__PURE__ */ E("th", { style: { padding: "6px 10px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }, children: "Type" }),
        /* @__PURE__ */ E("th", { style: { padding: "6px 10px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }, children: "Result" })
      ] }) }),
      /* @__PURE__ */ E("tbody", { children: n.map((o, l) => /* @__PURE__ */ F("tr", { style: { borderTop: l > 0 ? "1px solid var(--border)" : void 0 }, children: [
        /* @__PURE__ */ E("td", { style: { padding: "5px 10px" }, children: o.name }),
        /* @__PURE__ */ E("td", { style: { padding: "5px 10px", color: "var(--muted)", fontSize: 11 }, children: o.type }),
        /* @__PURE__ */ E("td", { style: { padding: "5px 10px" }, children: /* @__PURE__ */ F("span", { style: { color: a(o.action), fontSize: 11 }, children: [
          o.action,
          o.errorMessage ? ` — ${o.errorMessage}` : ""
        ] }) })
      ] }, o.id || l)) })
    ] }) }),
    /* @__PURE__ */ E("div", { style: { display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ E("button", { className: "btn btn-sm", onClick: e, children: r ? "Close" : "Dismiss (job continues in background)" }) })
  ] });
}
function K_({
  shellAPI: i,
  nodeId: e,
  userId: t,
  tx: n,
  nodeTypes: r,
  stateColorMap: s,
  activeSubTab: a,
  onSubTabChange: o,
  toast: l,
  onAutoOpenTx: d,
  onDescriptionLoaded: u,
  onRefreshItemData: p,
  itemData: f,
  onOpenCommentsForVersion: m,
  onCommentAttribute: _,
  onNavigate: x,
  onRegisterPreview: c
}) {
  var Co, Po, Lo, No, Io, Do, Uo, Oo, Fo, Bo, zo, ko, Vo, Ho, Go, Wo, Xo, Yo, qo, jo, Ko, $o, Zo, Qo, Jo, el, tl, nl, il, rl, sl, al, ol, ll, cl, dl, hl, ul, fl, pl, ml, gl;
  const {
    usePlmStore: h,
    useWebSocket: M,
    api: y,
    txApi: w,
    authoringApi: I,
    pollJobStatus: R,
    jobs: C,
    getDraggedNode: U,
    clearDraggedNode: A,
    getLinkRowForSource: v,
    icons: { NODE_ICONS: L, SignIcon: k },
    components: { LifecycleDiagram: V }
  } = i, [W, Q] = Ie([]), [j, re] = Ie({}), [K, de] = Ie({}), [_e, Ee] = Ie([]), [Je, lt] = Ie(!1), [J, le] = Ie(null), [be, ue] = Ie(null), [$e, Fe] = Ie({}), [et, D] = Ie(null), [nt, it] = Ie(null), [vt, De] = Ie(!1), Ye = Mn(null), [Ze, qe] = Ie(null), [Tt, P] = Ie(!1), [S, Y] = Ie([]), [se, ae] = Ie([]), [ie, Re] = Ie(!1), [fe, pe] = Ie(!1), [je, ce] = Ie([]), [Le, rt] = Ie({}), [Ue, xe] = Ie(""), [Ge, He] = Ie(""), [xt, g] = Ie([]), [q, z] = Ie(-1), [$, ne] = Ie(!1), [Ce, Be] = Ie(""), [At, Lt] = Ie(!1), [ct, bt] = Ie(null), [It, tn] = Ie(""), [Vt, Kt] = Ie(""), [Rn, bn] = Ie({}), [cn, Wn] = Ie([]), [_i, nn] = Ie(!1), [Dn, $t] = Ie(-1), [js, T] = Ie(null), [O, G] = Ie(null), [X, B] = Ie(null), [he, Me] = Ie(!1), [we, Ne] = Ie([]), [ze, ke] = Ie(!1), [Oe, ft] = Ie(null), [wt, St] = Ie(!1), [Bt, pt] = Ie(null), [Ae, Ht] = Ie(null), [dt, dn] = Ie(null), [Oi, Cn] = Ie(!1), [Fi, Ut] = Ie(null), [Un, Bi] = Ie({}), [hn, zi] = Ie(!0), br = Mn(null), ki = Mn(null), Tr = Mn(0), Ks = Mn(null), Yr = Mn(!1), $s = Mn(null), [Ve, mo] = Ie(() => (f == null ? void 0 : f.data) ?? null);
  Ct(() => {
    f != null && f.data && mo(f.data);
  }, [f]);
  const [un, go] = Ie(null), [qr, zd] = Ie(/* @__PURE__ */ new Map());
  Ct(() => {
    var H, Z;
    const b = ((H = Ve == null ? void 0 : Ve.itemType) == null ? void 0 : H.itemKey) ?? ((Z = Ve == null ? void 0 : Ve.metadata) == null ? void 0 : Z.nodeTypeId);
    b && Xt.getNodeTypeDescriptor(b).then(go).catch(() => go(null));
  }, [(Co = Ve == null ? void 0 : Ve.itemType) == null ? void 0 : Co.itemKey, (Po = Ve == null ? void 0 : Ve.metadata) == null ? void 0 : Po.nodeTypeId]);
  const jr = cr(() => {
    p && p(e);
  }, [e, p]), kd = cr((b) => {
    mo((H) => {
      if (!H) return H;
      if (H.values) {
        const te = H.values.map(
          (oe) => b[oe.name] !== void 0 ? { ...oe, value: b[oe.name] } : oe
        );
        return { ...H, values: te };
      }
      const Z = (H.fields || []).map(
        (te) => b[te.name] !== void 0 ? { ...te, value: b[te.name] } : te
      );
      return { ...H, fields: Z };
    });
  }, []), _o = h((b) => b.refreshAll), Vd = h((b) => b.refreshNodes), Kr = h((b) => b.refreshTx);
  Ct(() => {
    Ee([]);
  }, [e]);
  const Hd = (Lo = Ve == null ? void 0 : Ve.metadata) == null ? void 0 : Lo.currentVersionId;
  Ct(() => {
    var b;
    (b = Ve == null ? void 0 : Ve.metadata) != null && b.violations && Ee(Ve.metadata.violations);
  }, [Hd]), Ct(() => {
    zi(_e.length > 1);
  }, [_e.length]);
  const Gd = aa(
    () => Object.fromEntries(_e.filter((b) => b.attrCode).map((b) => [b.attrCode, b])),
    [_e]
  ), $r = cr(async () => {
    if (!ie)
      try {
        const [b, H] = await Promise.all([
          Xt.getChildLinks(t, e).catch(() => []),
          Xt.getParentLinks(t, e).catch(() => [])
        ]), Z = Array.isArray(b) ? b : [], te = Array.isArray(H) ? H : [];
        Y(Z), ae(te), Re(!0);
        const oe = [...new Set(
          [...Z, ...te].map((ge) => ge.linkTypeId).filter(Boolean)
        )], me = await Promise.all(
          oe.map(
            (ge) => ih(ge, (ot) => Xt.getLinkTypeDescriptor(ot)).then((ot) => [ge, ot]).catch(() => [ge, null])
          )
        );
        zd(new Map(me));
      } catch (b) {
        l(b, "error");
      }
  }, [e, t, ie, l]);
  Ct(() => {
    ie || $r();
  }, [ie, $r]), Ct(() => {
    var te, oe;
    if (!ie) return;
    let b = !1;
    ke(!0);
    const H = ((te = Ve == null ? void 0 : Ve.metadata) == null ? void 0 : te.logicalId) || (Ve == null ? void 0 : Ve.title) || e, Z = (s == null ? void 0 : s[(oe = Ve == null ? void 0 : Ve.metadata) == null ? void 0 : oe.state]) || "#6b7280";
    return Fd(Xt, t, e, H, Z, S, 0, 3, /* @__PURE__ */ new Set(), s, null, null).then((me) => {
      b || (Yr.current = !0, Ne(me), ke(!1));
    }).catch(() => {
      b || (Yr.current = !0, ke(!1));
    }), () => {
      b = !0;
    };
  }, [ie, e, S, (No = Ve == null ? void 0 : Ve.metadata) == null ? void 0 : No.state]), Ct(() => {
    Yr.current && (c == null || c({ nodes: we, loading: ze }));
  }, [we, ze]);
  const ei = (n == null ? void 0 : n.txId) || null;
  Ct(() => {
    Ve && u && u(Ve);
  }, [Ve]), Ct(() => {
    Q([]), re({}), de({}), lt(!1), le(null), ue(null), Fe({}), it(null), Ye.current && (clearInterval(Ye.current), Ye.current = null), qe(null), P(!1), pe(!1), ce([]), rt({}), xe(""), He(""), g([]), z(-1), ne(!1), Be(""), Lt(!1), bt(null), tn(""), Kt(""), bn({}), Wn([]), nn(!1), $t(-1), T(null), G(null), B(null), Me(!1), ft(null), St(!1), pt(null), Cn(!1), Ut(null), Bi({}), Re(!1), Y([]), ae([]), Yr.current = !1, Ne([]), c == null || c({ nodes: [], loading: !0 });
  }, [e]), Ct(() => {
    $s.current && !ct && (i == null || i.emit({ type: "psm:link:positionChange", linkId: $s.current, matrix: null })), $s.current = ct;
  }, [ct, i]), Ct(() => {
    if (i != null && i.on)
      return i.on("psm:part:selected", ({ linkId: b }) => {
        G(b ?? null);
      });
  }, [i]);
  const Ar = cr(async () => {
    try {
      const [b, H, Z] = await Promise.all([
        Xt.getVersionHistory(t, e).catch(() => []),
        Xt.getComments(t, e).catch(() => []),
        Xt.getSignatureHistory(t, e).catch(() => [])
      ]);
      Q(Array.isArray(b) ? b : []);
      const te = {};
      Array.isArray(Z) && Z.forEach((me) => {
        const ge = me.node_version_id || me.NODE_VERSION_ID;
        ge && (te[ge] || (te[ge] = { count: 0, hasRejected: !1 }), te[ge].count += 1, (me.meaning || me.MEANING || "").toUpperCase() === "REJECTED" && (te[ge].hasRejected = !0));
      }), Bi(te);
      const oe = {};
      Array.isArray(H) && H.forEach((me) => {
        const ge = me.versionId;
        ge && (oe[ge] = (oe[ge] || 0) + 1);
      }), re(oe), de({}), await jr();
    } catch (b) {
      l(b, "error");
    }
  }, [e, t, jr, l]);
  Ct(() => {
    Ar();
  }, [Ar]);
  const Wd = cr(async () => {
    try {
      const b = await Xt.getComments(t, e).catch(() => []), H = {};
      Array.isArray(b) && b.forEach((Z) => {
        const te = Z.versionId;
        te && (H[te] = (H[te] || 0) + 1);
      }), re(H);
    } catch {
    }
  }, [e, t]);
  Ct(() => {
    Re(!1), Y([]), ae([]), Ht(null), dn(null);
  }, [e]), Ct(() => {
    a === "pbs" && $r();
  }, [a, $r]), Ct(() => () => {
    clearTimeout(br.current), clearTimeout(ki.current), Ye.current && clearInterval(Ye.current);
  }, []), Ct(() => {
    fe && Ks.current && Ks.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [fe]), M(
    e ? `/topic/nodes/${e}` : null,
    (b) => {
      if (b.nodeId && b.nodeId !== e) return;
      ["STATE_CHANGED", "LOCK_ACQUIRED", "LOCK_RELEASED", "ITEM_UPDATED", "SIGNED"].includes(b.event) && (jr(), ["LOCK_RELEASED", "LOCK_ACQUIRED", "ITEM_UPDATED"].includes(b.event) && Vd()), b.event === "COMMENT_ADDED" && Wd();
    },
    t
  ), M(
    "/topic/global",
    (b) => {
      b.event === "METAMODEL_CHANGED" && (rh(), Re(!1));
    },
    t
  );
  async function Xd(b) {
    const H = [...W].sort((oe, me) => (oe.version_number || oe.VERSION_NUMBER) - (me.version_number || me.VERSION_NUMBER)), Z = H.findIndex((oe) => (oe.version_number || oe.VERSION_NUMBER) === b);
    if (Z <= 0) return;
    const te = H[Z - 1].version_number || H[Z - 1].VERSION_NUMBER;
    P(!0);
    try {
      const oe = await Xt.getVersionDiff(t, e, te, b);
      qe({ data: oe, v1Num: te, v2Num: b });
    } catch (oe) {
      l(oe, "error");
    } finally {
      P(!1);
    }
  }
  async function vo(b = null) {
    var H;
    xe(""), He((b == null ? void 0 : b.logicalId) || ""), g([]), z(-1), ne(!1), Be("");
    try {
      const [Z, te] = await Promise.all([
        y.getNodeTypeLinkTypes(t, (H = Ve == null ? void 0 : Ve.metadata) == null ? void 0 : H.nodeTypeId).catch(() => []),
        Xt.getSources(t).catch(() => [])
      ]);
      let oe = Array.isArray(Z) ? Z : [];
      if (b != null && b.nodeTypeId) {
        const ge = b.nodeTypeId;
        oe = oe.filter((ot) => {
          const ht = ot.target_type || ot.TARGET_TYPE;
          return !ht || Y_(ge, ht, r);
        }), oe.length === 1 && xe(oe[0].id || oe[0].ID);
      }
      ce(oe);
      const me = {};
      (Array.isArray(te) ? te : []).forEach((ge) => {
        me[ge.id] = ge;
      }), rt(me), pe(!0);
    } catch (Z) {
      l(Z, "error");
    }
  }
  async function xo(b, H, Z) {
    try {
      const te = await Xt.getSourceKeys(t, b, H, Z, 25);
      g(Array.isArray(te) ? te : []);
    } catch {
      g([]);
    }
  }
  async function Zr(b, H, Z) {
    try {
      const te = await Xt.getSourceKeys(t, b, H, Z, 25);
      Wn(Array.isArray(te) ? te : []);
    } catch {
      Wn([]);
    }
  }
  async function Yd() {
    var oe;
    if (!Ue) return;
    const b = je.find((me) => (me.id || me.ID) === Ue), H = (b == null ? void 0 : b.target_source_id) || (b == null ? void 0 : b.TARGET_SOURCE_ID) || "SELF", Z = (b == null ? void 0 : b.target_type) || (b == null ? void 0 : b.TARGET_TYPE) || null;
    if (!Ge) return;
    const te = Ge;
    Lt(!0);
    try {
      const me = ei || await d();
      if (!me) return;
      const ge = (oe = Ve.actions) == null ? void 0 : oe.find((ht) => ht.code === "create_link");
      if (!ge) throw new Error("create_link action not available for this node type");
      const ot = {
        linkTypeId: Ue,
        targetSourceCode: H,
        ...Z ? { targetType: Z } : {},
        targetKey: te,
        linkLogicalId: Ce || ""
      };
      await (ge.path ? I.executeViaDescriptor(ge, e, t, me, ot) : I.executeAction(e, ge.code, t, me, ot)), l("Link created", "success"), pe(!1), Be(""), He(""), g([]), z(-1), ne(!1), Re(!1), await Kr(), await Ar();
    } catch (me) {
      l(me, "error");
    } finally {
      Lt(!1);
    }
  }
  async function qd(b, H, Z, te) {
    var me;
    const oe = (me = Ve.actions) == null ? void 0 : me.find((ge) => ge.code === "update_link");
    if (oe) {
      Me(!0);
      try {
        const ge = ei || await d();
        if (!ge) return;
        const ot = {};
        te && Object.entries(te).forEach(([tt, ee]) => {
          ot[`linkAttr_${tt}`] = ee;
        });
        const ht = { linkId: b, logicalId: H, ...Z ? { targetKey: Z } : {}, ...ot };
        await (oe.path ? I.executeViaDescriptor(oe, e, t, ge, ht) : I.executeAction(e, oe.code, t, ge, ht)), bt(null), await Kr(), Re(!1), await Promise.all([
          Xt.getChildLinks(t, e).then((tt) => Y(Array.isArray(tt) ? tt : [])),
          Xt.getParentLinks(t, e).then((tt) => ae(Array.isArray(tt) ? tt : []))
        ]), Re(!0);
      } catch (ge) {
        l(ge, "error");
      } finally {
        Me(!1);
      }
    }
  }
  async function jd(b) {
    var Z;
    const H = (Z = Ve.actions) == null ? void 0 : Z.find((te) => te.code === "delete_link");
    if (H) {
      Me(!0), T(null);
      try {
        const te = ei || await d();
        if (!te) return;
        await (H.path ? I.executeViaDescriptor(H, e, t, te, { linkId: b }) : I.executeAction(e, H.code, t, te, { linkId: b })), G((oe) => oe === b ? null : oe), await Kr(), Re(!1), await Promise.all([
          Xt.getChildLinks(t, e).then((oe) => Y(Array.isArray(oe) ? oe : [])),
          Xt.getParentLinks(t, e).then((oe) => ae(Array.isArray(oe) ? oe : []))
        ]), Re(!0);
      } catch (te) {
        l(te, "error");
      } finally {
        Me(!1);
      }
    }
  }
  async function yo(b, H = {}) {
    var te;
    const Z = b.bodyShape === "MULTIPART";
    Z || ue(null), lt(!0), Z && D(0);
    try {
      const oe = Z ? (ge) => D(ge) : void 0, me = b.path ? await I.executeViaDescriptor(b, e, t, ei, H, oe) : await I.executeAction(
        e,
        b.code,
        t,
        ei,
        H,
        (te = b.metadata) == null ? void 0 : te.transitionId
      );
      if (Z && (ue(null), D(null)), me != null && me.jobId && b.jobStatusPath) {
        const ge = b.jobStatusPath.replace("{jobId}", me.jobId), ot = me.jobId, ht = b.label || b.name || "Import";
        it({ id: ot, data: { job: { id: ot, status: me.status || "PENDING" }, results: [] } }), De(!0), C.register(ot, ht, () => De(!0)), Ye.current && clearInterval(Ye.current), Ye.current = setInterval(async () => {
          var tt, ee, We;
          try {
            const Qe = await R("psm", ge);
            it((Rt) => Rt ? { ...Rt, data: Qe } : null), (((tt = Qe.job) == null ? void 0 : tt.status) === "DONE" || ((ee = Qe.job) == null ? void 0 : ee.status) === "FAILED") && (C.update(ot, Qe.job.status === "DONE" ? "done" : "failed"), clearInterval(Ye.current), Ye.current = null, ((We = Qe.job) == null ? void 0 : We.status) === "DONE" && (await _o(), await Ar()));
          } catch {
          }
        }, 2e3);
        return;
      }
      (me == null ? void 0 : me.violations) !== void 0 && Ee(me.violations), me != null && me.message && l(me.message, "success"), await _o(), await Ar();
    } catch (oe) {
      ue(null), D(null), l(oe, "error");
    } finally {
      lt(!1);
    }
  }
  function Zs(b) {
    var Z;
    const H = (b.parameters || []).filter((te) => te.widget);
    if (H.length > 0) {
      const te = {};
      H.forEach((oe) => {
        oe.defaultValue && (te[oe.name] = oe.defaultValue);
      }), Fe(te), ue(b);
    } else ((Z = b.metadata) == null ? void 0 : Z.displayCategory) === "DANGEROUS" ? (Fe({}), ue(b)) : yo(b);
  }
  async function Kd(b, H, Z) {
    var oe;
    le("saving");
    const te = { ...b, _description: "Auto-save" };
    try {
      const me = await (Z != null && Z.path ? I.executeViaDescriptor(Z, e, t, H, te) : I.executeAction(e, (Z == null ? void 0 : Z.code) ?? Z, t, H, te));
      kd(b), de({}), Ee((me == null ? void 0 : me.violations) || []), le("saved"), clearTimeout(ki.current), ki.current = setTimeout(() => le(null), 2e3), Kr();
    } catch (me) {
      le(null);
      const ge = (oe = me.detail) == null ? void 0 : oe.violations;
      ge != null && ge.length ? Ee(ge) : l(me, "error");
    }
  }
  function So(b, H, Z) {
    clearTimeout(br.current), le(null), br.current = setTimeout(() => Kd(b, H, Z), 800);
  }
  Ct(() => {
    !Ae || !e || !t || (Cn(!0), Xt.getNodeDescription(t, e, null, Ae).then((b) => dn(b)).catch((b) => l(b, "error")).finally(() => Cn(!1)));
  }, [Ae, e, t]);
  const ye = Ae && dt ? dt : Ve, On = aa(() => {
    var ot, ht;
    const b = [], H = /* @__PURE__ */ new Map(), Z = {}, te = {};
    if (un != null && un.fields) {
      for (const ee of un.fields) Z[ee.name] = ee;
      const tt = ((ot = un.staticMetadata) == null ? void 0 : ot.fieldMeta) || {};
      for (const [ee, We] of Object.entries(tt)) te[ee] = We;
    }
    const oe = ((ht = ye == null ? void 0 : ye.metadata) == null ? void 0 : ht.attributeMeta) || {};
    ((ye == null ? void 0 : ye.values) ?? (ye == null ? void 0 : ye.fields) ?? []).forEach((tt) => {
      const ee = Z[tt.name], We = te[tt.name] || {}, Qe = oe[tt.name];
      if (!ee && !Qe) return;
      const Rt = (ee == null ? void 0 : ee.group) ?? (Qe == null ? void 0 : Qe.section) ?? "General", Dt = {
        id: tt.name,
        name: tt.name,
        value: tt.value,
        editable: tt.editable ?? !1,
        required: tt.required ?? (Qe == null ? void 0 : Qe.required) ?? !1,
        label: (ee == null ? void 0 : ee.label) ?? tt.label ?? tt.name,
        widget: tt.widget ?? (ee == null ? void 0 : ee.widget) ?? "text",
        tooltip: tt.hint ?? (ee == null ? void 0 : ee.hint) ?? null,
        hint: tt.hint ?? (ee == null ? void 0 : ee.hint) ?? null,
        displayOrder: (ee == null ? void 0 : ee.displayOrder) ?? (Qe == null ? void 0 : Qe.displayOrder) ?? 0,
        section: Rt,
        namingRegex: We.namingRegex ?? (Qe == null ? void 0 : Qe.namingRegex) ?? "",
        allowedValues: We.allowedValues ?? (Qe == null ? void 0 : Qe.allowedValues) ?? "",
        sourceDomainId: We.sourceDomainId ?? (Qe == null ? void 0 : Qe.sourceDomainId) ?? "",
        sourceDomainName: We.sourceDomainName ?? (Qe == null ? void 0 : Qe.sourceDomainName) ?? ""
      };
      Dt.sourceDomainId ? (H.has(Dt.sourceDomainId) || H.set(Dt.sourceDomainId, {
        id: Dt.sourceDomainId,
        name: Dt.sourceDomainName || Dt.sourceDomainId,
        attrs: []
      }), H.get(Dt.sourceDomainId).attrs.push(Dt)) : b.push(Dt);
    });
    const ge = Array.from(H.values()).sort((tt, ee) => tt.name.localeCompare(ee.name));
    return { base: b, domains: ge };
  }, [ye == null ? void 0 : ye.values, ye == null ? void 0 : ye.fields, (Io = ye == null ? void 0 : ye.metadata) == null ? void 0 : Io.attributeMeta, un]);
  aa(() => On.base.reduce((b, H) => {
    const Z = H.section || "General";
    return b[Z] || (b[Z] = []), b[Z].push(H), b;
  }, {}), [On.base]);
  const [Mo, Qs] = Ie(null);
  if (Ct(() => {
    const b = On.domains;
    if (b.length === 0) {
      Qs(null);
      return;
    }
    Qs((H) => H && b.some((Z) => Z.id === H) ? H : b[0].id);
  }, [On.domains]), !Ve) return /* @__PURE__ */ F("div", { className: "empty", style: { padding: "60px 24px" }, children: [
    /* @__PURE__ */ E("div", { className: "empty-icon", children: "◎" }),
    /* @__PURE__ */ E("div", { className: "empty-text", children: "Loading…" })
  ] });
  const Js = ((Do = ye == null ? void 0 : ye.metadata) == null ? void 0 : Do.txStatus) === "OPEN", wr = (ye == null ? void 0 : ye.actions) || [];
  (Uo = ye == null ? void 0 : ye.metadata) == null || Uo.fingerprintChanged;
  const $d = /* @__PURE__ */ new Set(["update_node", "create_link", "update_link", "delete_link", "read", "comment", "baseline", "manage_metamodel", "manage_roles", "manage_baselines"]), ea = wr.find((b) => {
    var H;
    return b.code === "update_node" && ((H = b.metadata) == null ? void 0 : H.authorized) !== !1;
  }), Eo = wr.filter(
    (b) => {
      var H, Z, te;
      return ((H = b.metadata) == null ? void 0 : H.authorized) !== !1 && !$d.has(b.code) && ((Z = b.metadata) == null ? void 0 : Z.displayCategory) !== "STRUCTURAL" && ((te = b.metadata) == null ? void 0 : te.displayCategory) !== "PROPERTY";
    }
  ), ta = wr.filter(
    (b) => {
      var H, Z;
      return ((H = b.metadata) == null ? void 0 : H.authorized) !== !1 && ((Z = b.metadata) == null ? void 0 : Z.displayCategory) === "PROPERTY";
    }
  ), bo = (b) => {
    var H;
    return ((H = b == null ? void 0 : b.guardViolations) == null ? void 0 : H.length) > 0;
  }, To = (b) => {
    const H = b == null ? void 0 : b.guardViolations;
    return H != null && H.length ? `Blocked:
• ` + H.map((Z) => typeof Z == "string" ? Z : Z.message || Z.code).join(`
• `) : "";
  }, Zd = wr.filter((b) => {
    var H;
    return (H = b.code) == null ? void 0 : H.startsWith("transition");
  }), Qd = new Map(
    Zd.filter((b) => {
      var H;
      return ((H = b.guardViolations) == null ? void 0 : H.length) > 0;
    }).map((b) => [b.label, b.guardViolations])
  ), Ao = Eo.filter((b) => {
    var H;
    return (H = b.code) == null ? void 0 : H.startsWith("transition");
  }), Vi = (Oo = ye == null ? void 0 : ye.actions) == null ? void 0 : Oo.some((b) => b.code === "update_link"), vi = (Fo = ye == null ? void 0 : ye.actions) == null ? void 0 : Fo.some((b) => b.code === "delete_link"), na = wr.find((b) => b.code === "checkout"), ia = Vi || vi || !!na;
  (Bo = un == null ? void 0 : un.staticMetadata) != null && Bo.lifecycleId || (zo = ye == null ? void 0 : ye.metadata) != null && zo.lifecycleId;
  const Zt = (ko = ye == null ? void 0 : ye.metadata) != null && ko.nodeTypeId ? (r || []).find((b) => (b.id || b.ID) === ye.metadata.nodeTypeId) : null, Xn = (Zt == null ? void 0 : Zt.color) || (Zt == null ? void 0 : Zt.COLOR) || null, wo = (Zt == null ? void 0 : Zt.icon) || (Zt == null ? void 0 : Zt.ICON) || null, ra = wo ? L[wo] : null, Ro = (Zt == null ? void 0 : Zt.name) || (Zt == null ? void 0 : Zt.NAME) || null, Jd = ((Vo = W.find(
    (b) => {
      var H;
      return (b.id || b.ID) === ((H = Ve == null ? void 0 : Ve.metadata) == null ? void 0 : H.currentVersionId);
    }
  )) == null ? void 0 : Vo.version_number) ?? null;
  return /* @__PURE__ */ F(
    "div",
    {
      style: { flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" },
      onClick: () => Bt && pt(null),
      children: [
        Bt && oa.createPortal(
          /* @__PURE__ */ E(
            "div",
            {
              className: "attr-ctx-menu",
              style: { top: Bt.y, left: Bt.x },
              onClick: (b) => b.stopPropagation(),
              children: /* @__PURE__ */ F(
                "button",
                {
                  className: "attr-ctx-item",
                  onClick: () => {
                    _ == null || _(Bt.attrId, Bt.attrLabel), pt(null);
                  },
                  children: [
                    "💬 Comment on ",
                    /* @__PURE__ */ F("code", { children: [
                      "#",
                      Bt.attrId
                    ] })
                  ]
                }
              )
            }
          ),
          document.body
        ),
        /* @__PURE__ */ F("div", { className: "node-header", children: [
          /* @__PURE__ */ F("div", { className: "node-title-group", children: [
            /* @__PURE__ */ F("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
              (ra || Xn || Ro) && /* @__PURE__ */ F("span", { style: {
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: Xn ? `${Xn}18` : "rgba(100,116,139,.1)",
                border: `1px solid ${Xn ? `${Xn}30` : "rgba(100,116,139,.2)"}`,
                borderRadius: 4,
                padding: "2px 7px",
                fontSize: 11,
                color: Xn || "var(--muted)",
                fontWeight: 600,
                letterSpacing: ".01em",
                flexShrink: 0
              }, children: [
                ra ? /* @__PURE__ */ E(ra, { size: 11, color: Xn || "var(--muted)", strokeWidth: 2 }) : Xn ? /* @__PURE__ */ E("span", { style: { width: 7, height: 7, borderRadius: 1, background: Xn, display: "inline-block" } }) : null,
                Ro
              ] }),
              /* @__PURE__ */ E("span", { className: "node-identity", children: ((Ho = ye.metadata) == null ? void 0 : Ho.logicalId) || ye.title }),
              ye.subtitle && /* @__PURE__ */ E("span", { className: "node-display-name", children: ye.subtitle }),
              /* @__PURE__ */ F("span", { style: {
                fontFamily: "var(--mono)",
                fontSize: 13,
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: 4,
                letterSpacing: ".01em",
                color: Ae ? "#92400e" : "var(--muted)",
                background: Ae ? "rgba(251,191,36,.25)" : "rgba(100,116,139,.1)",
                border: Ae ? "1px solid rgba(251,191,36,.5)" : "none"
              }, children: [
                Ae && "🕐 ",
                ((Go = ye.metadata) == null ? void 0 : Go.iteration) === 0 ? (Wo = ye.metadata) == null ? void 0 : Wo.revision : `${(Xo = ye.metadata) == null ? void 0 : Xo.revision}.${(Yo = ye.metadata) == null ? void 0 : Yo.iteration}`
              ] }),
              /* @__PURE__ */ E(Ii, { stateId: (qo = ye.metadata) == null ? void 0 : qo.state, stateName: (jo = ye.metadata) == null ? void 0 : jo.stateName, stateColorMap: s }),
              !Ae && (($o = (Ko = Ve.metadata) == null ? void 0 : Ko.lock) == null ? void 0 : $o.locked) && /* @__PURE__ */ F("span", { className: "pill", style: { color: "var(--muted)", background: "rgba(100,116,139,.1)", border: "1px solid rgba(100,116,139,.2)" }, children: [
                "🔒 ",
                (Qo = (Zo = Ve.metadata) == null ? void 0 : Zo.lock) == null ? void 0 : Qo.lockedBy
              ] })
            ] }),
            /* @__PURE__ */ F("div", { className: "node-meta", children: [
              Js && ((el = (Jo = ye == null ? void 0 : ye.metadata) == null ? void 0 : Jo.lock) == null ? void 0 : el.lockedBy) === t && /* @__PURE__ */ E("span", { className: "pill", style: { color: "var(--warn)", background: "rgba(232,169,71,.1)", border: "1px solid rgba(232,169,71,.25)" }, children: "✎ editing" }),
              Js && ((nl = (tl = ye == null ? void 0 : ye.metadata) == null ? void 0 : tl.lock) == null ? void 0 : nl.lockedBy) === t && /* @__PURE__ */ E("span", { style: { fontSize: 11, color: "var(--warn)", fontStyle: "italic", opacity: 0.85 }, children: "⚡ uncommitted changes" }),
              Js && ((rl = (il = ye == null ? void 0 : ye.metadata) == null ? void 0 : il.lock) == null ? void 0 : rl.lockedBy) && ((al = (sl = ye == null ? void 0 : ye.metadata) == null ? void 0 : sl.lock) == null ? void 0 : al.lockedBy) !== t && /* @__PURE__ */ F("span", { style: { fontSize: 11, color: "var(--accent)", fontStyle: "italic", opacity: 0.9 }, children: [
                "✎ in progress — being edited by ",
                (ll = (ol = ye.metadata) == null ? void 0 : ol.lock) == null ? void 0 : ll.lockedBy
              ] }),
              J === "saving" && /* @__PURE__ */ E("span", { style: { fontSize: 11, color: "var(--muted)", fontStyle: "italic" }, children: "saving…" }),
              J === "saved" && _e.length === 0 && /* @__PURE__ */ E("span", { style: { fontSize: 11, color: "var(--success)" }, children: "✓ saved" }),
              J === "saved" && _e.length > 0 && /* @__PURE__ */ E("span", { style: { fontSize: 11, color: "var(--warn)" }, children: "⚠ saved with issues" })
            ] })
          ] }),
          /* @__PURE__ */ E("div", { className: "node-actions", children: Eo.map((b) => {
            var ge, ot, ht;
            const H = bo(b), Z = H ? To(b) : b.description || b.label, te = (ge = b.metadata) == null ? void 0 : ge.displayColor, oe = te ? "" : ((ot = b.metadata) == null ? void 0 : ot.displayCategory) === "DANGEROUS" ? "btn-danger" : ((ht = b.metadata) == null ? void 0 : ht.displayCategory) === "PRIMARY" ? "btn-success" : "", me = te ? { color: te, borderColor: `${te}60`, background: `${te}15` } : void 0;
            return /* @__PURE__ */ E(
              "button",
              {
                className: `btn btn-sm ${oe}`,
                disabled: Je || H,
                title: Z,
                style: { ...me, ...H ? { opacity: 0.45, cursor: "not-allowed" } : {} },
                onClick: () => !H && Zs(b),
                children: H ? `✕ ${b.label}` : b.label
              },
              b.code
            );
          }) })
        ] }),
        be && oa.createPortal(
          /* @__PURE__ */ E("div", { style: {
            position: "fixed",
            inset: 0,
            zIndex: 2e3,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }, onClick: et === null ? () => ue(null) : void 0, children: /* @__PURE__ */ F("div", { style: {
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "28px 32px",
            maxWidth: 440,
            width: "90%",
            boxShadow: "0 8px 32px rgba(0,0,0,.4)"
          }, onClick: (b) => b.stopPropagation(), children: [
            /* @__PURE__ */ E("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 16 }, children: be.label }),
            et !== null && /* @__PURE__ */ F("div", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ F("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 6 }, children: [
                /* @__PURE__ */ E("span", { children: "Uploading…" }),
                /* @__PURE__ */ F("span", { children: [
                  et,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ E("div", { style: { height: 6, background: "var(--surface2)", borderRadius: 3, overflow: "hidden" }, children: /* @__PURE__ */ E("div", { style: { height: "100%", width: `${et}%`, background: "var(--accent)", borderRadius: 3, transition: "width 0.15s ease" } }) })
            ] }),
            (be.parameters || []).filter((b) => b.widget).map((b) => {
              var te;
              const H = $e[b.name] || "";
              let Z = null;
              return ((te = b.options) == null ? void 0 : te.length) > 0 && (Z = b.options), /* @__PURE__ */ F("div", { className: "field", style: { marginBottom: 14 }, children: [
                /* @__PURE__ */ F("label", { className: "field-label", children: [
                  b.label || b.name,
                  b.required && /* @__PURE__ */ E("span", { className: "field-req", children: "*" })
                ] }),
                b.widget === "FILE" ? /* @__PURE__ */ F(Hr, { children: [
                  /* @__PURE__ */ E(
                    "input",
                    {
                      type: "file",
                      style: { color: "var(--text)" },
                      onChange: (oe) => Fe((me) => {
                        var ge;
                        return { ...me, [b.name]: ((ge = oe.target.files) == null ? void 0 : ge[0]) || null };
                      })
                    }
                  ),
                  b.hint && /* @__PURE__ */ E("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 4 }, children: b.hint })
                ] }) : Z ? /* @__PURE__ */ F(
                  "select",
                  {
                    className: "field-input",
                    value: H,
                    onChange: (oe) => Fe((me) => ({ ...me, [b.name]: oe.target.value })),
                    children: [
                      !H && /* @__PURE__ */ E("option", { value: "", children: "—" }),
                      Z.map((oe) => {
                        const me = typeof oe == "object" && oe !== null ? oe.value : oe, ge = typeof oe == "object" && oe !== null ? oe.label : oe;
                        return /* @__PURE__ */ E("option", { value: me, children: ge }, me);
                      })
                    ]
                  }
                ) : b.widget === "TEXTAREA" ? /* @__PURE__ */ E(
                  "textarea",
                  {
                    className: "field-input",
                    rows: 3,
                    placeholder: b.hint || "",
                    value: H,
                    onChange: (oe) => Fe((me) => ({ ...me, [b.name]: oe.target.value })),
                    style: { resize: "vertical" }
                  }
                ) : b.widget === "CHECKBOX" ? /* @__PURE__ */ F("label", { style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }, children: [
                  /* @__PURE__ */ E(
                    "input",
                    {
                      type: "checkbox",
                      checked: $e[b.name] === "true",
                      onChange: (oe) => Fe((me) => ({ ...me, [b.name]: oe.target.checked ? "true" : "false" }))
                    }
                  ),
                  b.hint && /* @__PURE__ */ E("span", { style: { fontSize: 12, color: "var(--muted)" }, children: b.hint })
                ] }) : /* @__PURE__ */ E(
                  "input",
                  {
                    className: "field-input",
                    placeholder: b.hint || "",
                    value: H,
                    onChange: (oe) => Fe((me) => ({ ...me, [b.name]: oe.target.value }))
                  }
                )
              ] }, b.name);
            }),
            /* @__PURE__ */ F("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }, children: [
              /* @__PURE__ */ E("button", { className: "btn btn-sm", disabled: et !== null, onClick: () => ue(null), children: "Cancel" }),
              /* @__PURE__ */ E(
                "button",
                {
                  className: "btn btn-sm btn-success",
                  disabled: et !== null || (be.parameters || []).filter((b) => b.widget && b.required).some((b) => {
                    const H = $e[b.name];
                    return b.widget === "FILE" ? !H : !String(H || "").trim();
                  }),
                  onClick: () => yo(be, $e),
                  children: be.label
                }
              )
            ] })
          ] }) }),
          document.body
        ),
        nt && vt && oa.createPortal(
          /* @__PURE__ */ E(
            "div",
            {
              style: { position: "fixed", inset: 0, zIndex: 2e3, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center" },
              onClick: (b) => {
                b.target === b.currentTarget && De(!1);
              },
              children: /* @__PURE__ */ F(
                "div",
                {
                  style: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "28px 32px", maxWidth: 560, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,.4)" },
                  onClick: (b) => b.stopPropagation(),
                  children: [
                    /* @__PURE__ */ E("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 16 }, children: "CAD Import" }),
                    /* @__PURE__ */ E(
                      j_,
                      {
                        jobData: nt.data,
                        onClose: () => {
                          var H, Z;
                          (((H = nt.data.job) == null ? void 0 : H.status) === "DONE" || ((Z = nt.data.job) == null ? void 0 : Z.status) === "FAILED") && (C.remove(nt.id), it(null)), De(!1);
                        }
                      }
                    )
                  ]
                }
              )
            }
          ),
          document.body
        ),
        _e.length > 0 && /* @__PURE__ */ F("div", { className: "violations-banner", children: [
          /* @__PURE__ */ F(
            "div",
            {
              className: "violations-banner-header",
              style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
              onClick: () => zi((b) => !b),
              children: [
                /* @__PURE__ */ E("span", { className: "violations-banner-title", children: "⚠ Will fail at commit" }),
                /* @__PURE__ */ F("span", { style: { fontSize: 11, opacity: 0.75 }, children: [
                  "(",
                  _e.length,
                  " issue",
                  _e.length > 1 ? "s" : "",
                  ")"
                ] }),
                /* @__PURE__ */ E("span", { style: { fontSize: 10, marginLeft: "auto", opacity: 0.6 }, children: hn ? "▾ show" : "▴ hide" })
              ]
            }
          ),
          !hn && /* @__PURE__ */ E("ul", { className: "violations-banner-list", children: _e.map((b, H) => /* @__PURE__ */ E("li", { children: typeof b == "string" ? b : b.message }, H)) })
        ] }),
        /* @__PURE__ */ E("div", { className: "subtabs", children: [
          { key: "attributes", label: "Properties" },
          { key: "pbs", label: "PBS", count: ie ? S.length + se.length : void 0 },
          { key: "history", label: "History", count: W.length }
        ].map(({ key: b, label: H, count: Z }) => /* @__PURE__ */ F(
          "div",
          {
            className: `subtab ${a === b ? "active" : ""}`,
            onClick: () => o(b),
            children: [
              H,
              Z > 0 && /* @__PURE__ */ E("span", { className: "subtab-badge", style: {
                background: "rgba(91,156,246,.15)",
                color: "var(--accent)"
              }, children: Z })
            ]
          },
          b
        )) }),
        Ae && /* @__PURE__ */ F("div", { style: {
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
          /* @__PURE__ */ F("span", { style: { color: "#92400e" }, children: [
            "🕐 Historical view — Version ",
            Ae,
            dt && ` (${((cl = dt.metadata) == null ? void 0 : cl.iteration) === 0 ? (dl = dt.metadata) == null ? void 0 : dl.revision : `${(hl = dt.metadata) == null ? void 0 : hl.revision}.${(ul = dt.metadata) == null ? void 0 : ul.iteration}`})`,
            Oi && " — loading…",
            " · read-only"
          ] }),
          /* @__PURE__ */ E("button", { className: "btn btn-sm", onClick: () => {
            Ht(null), dn(null);
          }, children: "← Back to latest" })
        ] }),
        /* @__PURE__ */ F("div", { style: { flex: 1, overflow: "auto", minHeight: 0, display: "flex", flexDirection: "column" }, children: [
          a === "attributes" && (() => {
            var ge, ot, ht, tt, ee, We, Qe, Rt, Dt, gt;
            const b = (ve) => {
              const mt = K[ve.id] !== void 0 ? K[ve.id] : ve.value || "", Ot = ve.editable && !!ea, xn = ve.allowedValues ? (() => {
                try {
                  return JSON.parse(ve.allowedValues);
                } catch {
                  return [];
                }
              })() : null, mn = xn ? xn.map((zt) => typeof zt == "object" && zt !== null ? { value: zt.value, label: zt.label || zt.value } : { value: zt, label: zt }) : null, Pe = mn ? mn.map((zt) => zt.value) : null, Ke = ve.namingRegex ? (() => {
                try {
                  return new RegExp(ve.namingRegex);
                } catch {
                  return null;
                }
              })() : null, Ft = (mt || "").trim(), Qt = !Ke || !Ft ? null : Ke.test(Ft), eh = Qt === !1, sa = ve.required && K[ve.id] === "", _l = Pe && K[ve.id] != null && K[ve.id] !== "" && !Pe.includes(K[ve.id]), Hi = Gd[ve.id], vl = Hi && Hi.code !== "NAMING_REGEX" && Hi.code !== "ENUM_NOT_ALLOWED" && !(Hi.code === "REQUIRED" && sa) ? Hi : null;
              return /* @__PURE__ */ F(
                "div",
                {
                  className: "field",
                  onContextMenu: (zt) => {
                    zt.preventDefault(), pt({ attrId: ve.id, attrLabel: ve.label, x: zt.clientX, y: zt.clientY });
                  },
                  children: [
                    /* @__PURE__ */ F("label", { className: "field-label", children: [
                      ve.label,
                      ve.required && /* @__PURE__ */ E("span", { className: "field-req", children: "*" })
                    ] }),
                    mn ? /* @__PURE__ */ F(
                      "select",
                      {
                        className: "field-input",
                        title: ve.tooltip || void 0,
                        value: mt,
                        disabled: !Ot,
                        onChange: (zt) => {
                          if (!Ot) return;
                          const Rr = { ...K, [ve.id]: zt.target.value };
                          de(Rr), So(Rr, ei, ea);
                        },
                        children: [
                          /* @__PURE__ */ E("option", { value: "", children: "—" }),
                          mn.map((zt) => /* @__PURE__ */ E("option", { value: zt.value, children: zt.label }, zt.value))
                        ]
                      }
                    ) : /* @__PURE__ */ F("div", { className: "logical-id-wrap", children: [
                      /* @__PURE__ */ E(
                        "input",
                        {
                          className: `field-input${sa || _l || eh || Hi ? " error" : Qt === !0 ? " ok" : ""}`,
                          readOnly: !Ot,
                          title: ve.tooltip || void 0,
                          placeholder: ve.tooltip || (ve.namingRegex ? `pattern: ${ve.namingRegex}` : ""),
                          value: mt,
                          onChange: (zt) => {
                            if (!Ot) return;
                            const Rr = { ...K, [ve.id]: zt.target.value };
                            de(Rr), So(Rr, ei, ea);
                          }
                        }
                      ),
                      Ft && Ke && /* @__PURE__ */ E("span", { className: `logical-id-badge ${Qt ? "ok" : "err"}`, children: Qt ? "✓" : "✗" })
                    ] }),
                    !mn && ve.namingRegex && /* @__PURE__ */ F("div", { className: "logical-id-hint", children: [
                      /* @__PURE__ */ E("span", { className: "logical-id-hint-label", children: "Pattern" }),
                      /* @__PURE__ */ E("code", { className: "logical-id-hint-code", children: ve.namingRegex }),
                      !Ft && /* @__PURE__ */ E("span", { className: "logical-id-hint-idle", children: "start typing to validate" }),
                      Ft && Qt === !1 && /* @__PURE__ */ E("span", { className: "logical-id-hint-err", children: "no match" }),
                      Ft && Qt === !0 && /* @__PURE__ */ E("span", { className: "logical-id-hint-ok", children: "matches" })
                    ] }),
                    !ve.namingRegex && ve.tooltip && /* @__PURE__ */ E("span", { className: "field-hint", children: ve.tooltip }),
                    sa && /* @__PURE__ */ E("span", { className: "field-hint error", children: "Required" }),
                    _l && /* @__PURE__ */ E("span", { className: "field-hint error", children: "Value not in allowed list" }),
                    vl && /* @__PURE__ */ E("span", { className: "field-hint error", children: vl.message })
                  ]
                },
                ve.id
              );
            }, H = (ve) => {
              const mt = ve.reduce((Ot, xn) => {
                const mn = xn.section || "General";
                return Ot[mn] || (Ot[mn] = []), Ot[mn].push(xn), Ot;
              }, {});
              return Object.entries(mt).map(([Ot, xn]) => /* @__PURE__ */ F("div", { children: [
                /* @__PURE__ */ E("div", { className: "section-label", children: Ot }),
                /* @__PURE__ */ E("div", { className: "attr-grid", children: [...xn].sort((mn, Pe) => (mn.displayOrder || 0) - (Pe.displayOrder || 0)).map(b) })
              ] }, Ot));
            }, Z = On.domains.find((ve) => ve.id === Mo), te = (ve) => {
              if (!ve) return "";
              try {
                return new Date(ve).toLocaleString();
              } catch {
                return ve;
              }
            }, oe = On.base.filter((ve) => (ve.section || "General") === "Identity"), me = On.base.filter((ve) => (ve.section || "General") !== "Identity");
            return /* @__PURE__ */ F("div", { children: [
              /* @__PURE__ */ F("div", { children: [
                /* @__PURE__ */ E("div", { className: "section-label", children: "Identity" }),
                /* @__PURE__ */ F("div", { className: "attr-grid", children: [
                  /* @__PURE__ */ F("div", { className: "field", children: [
                    /* @__PURE__ */ E("label", { className: "field-label", children: ((ge = un == null ? void 0 : un.staticMetadata) == null ? void 0 : ge.logicalIdLabel) || ((ot = ye.metadata) == null ? void 0 : ot.logicalIdLabel) || "Identifier" }),
                    /* @__PURE__ */ E("input", { className: "field-input", readOnly: !0, value: ((ht = ye.metadata) == null ? void 0 : ht.logicalId) || "" })
                  ] }),
                  /* @__PURE__ */ F("div", { className: "field", children: [
                    /* @__PURE__ */ E("label", { className: "field-label", children: "External ID" }),
                    /* @__PURE__ */ E(
                      "input",
                      {
                        className: "field-input",
                        value: Oe !== null ? Oe : ((tt = ye.metadata) == null ? void 0 : tt.externalId) || "",
                        placeholder: "—",
                        onChange: (ve) => ft(ve.target.value),
                        onFocus: () => {
                          var ve;
                          return ft(((ve = ye.metadata) == null ? void 0 : ve.externalId) || "");
                        },
                        onBlur: async () => {
                          var mt;
                          if (Oe === null) return;
                          const ve = Oe.trim();
                          ve !== (((mt = ye.metadata) == null ? void 0 : mt.externalId) || "") && (await Xt.updateExternalId(t, e, ve).catch(() => {
                          }), await jr()), ft(null);
                        }
                      }
                    )
                  ] }),
                  oe.sort((ve, mt) => (ve.displayOrder || 0) - (mt.displayOrder || 0)).map(b),
                  /* @__PURE__ */ F("div", { className: "field", children: [
                    /* @__PURE__ */ E("label", { className: "field-label", children: "Technical ID" }),
                    /* @__PURE__ */ E("input", { className: "field-input", readOnly: !0, value: ((ee = ye.metadata) == null ? void 0 : ee.technicalId) || "", title: ((We = ye.metadata) == null ? void 0 : We.technicalId) || "" })
                  ] }),
                  /* @__PURE__ */ F("div", { className: "field", children: [
                    /* @__PURE__ */ E("label", { className: "field-label", children: "Creator" }),
                    /* @__PURE__ */ E("input", { className: "field-input", readOnly: !0, value: ((Qe = ye.metadata) == null ? void 0 : Qe.createdBy) || "" })
                  ] }),
                  /* @__PURE__ */ F("div", { className: "field", children: [
                    /* @__PURE__ */ E("label", { className: "field-label", children: "Created" }),
                    /* @__PURE__ */ E("input", { className: "field-input", readOnly: !0, value: te((Rt = ye.metadata) == null ? void 0 : Rt.createdAt) })
                  ] }),
                  /* @__PURE__ */ F("div", { className: "field", children: [
                    /* @__PURE__ */ E("label", { className: "field-label", children: "Modified by" }),
                    /* @__PURE__ */ E("input", { className: "field-input", readOnly: !0, value: ((Dt = ye.metadata) == null ? void 0 : Dt.modifiedBy) || "" })
                  ] }),
                  /* @__PURE__ */ F("div", { className: "field", children: [
                    /* @__PURE__ */ E("label", { className: "field-label", children: "Last update" }),
                    /* @__PURE__ */ E("input", { className: "field-input", readOnly: !0, value: te((gt = ye.metadata) == null ? void 0 : gt.lastUpdate) })
                  ] })
                ] })
              ] }),
              H(me),
              (On.domains.length > 0 || ta.length > 0) && /* @__PURE__ */ F("div", { style: { marginTop: 16 }, children: [
                /* @__PURE__ */ F("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, children: [
                  /* @__PURE__ */ E("div", { className: "section-label", style: { marginBottom: 0 }, children: "Domains" }),
                  On.domains.length > 0 && /* @__PURE__ */ E("div", { className: "subtabs", style: { marginBottom: 0, flex: 1 }, children: On.domains.map((ve) => /* @__PURE__ */ F(
                    "div",
                    {
                      className: `subtab ${Mo === ve.id ? "active" : ""}`,
                      onClick: () => Qs(ve.id),
                      children: [
                        ve.name,
                        /* @__PURE__ */ E("span", { className: "subtab-badge", style: {
                          background: "rgba(91,156,246,.15)",
                          color: "var(--accent)"
                        }, children: ve.attrs.length })
                      ]
                    },
                    ve.id
                  )) }),
                  ta.length > 0 && /* @__PURE__ */ E("div", { style: { display: "flex", gap: 4, marginLeft: "auto", flexShrink: 0 }, children: ta.map((ve) => {
                    const mt = bo(ve), Ot = ve.label;
                    return /* @__PURE__ */ E(
                      "button",
                      {
                        className: `btn btn-sm${mt ? " btn-disabled" : ""}`,
                        disabled: mt,
                        title: mt ? To(ve) : ve.description || Ot,
                        onClick: () => Zs(ve),
                        children: Ot
                      },
                      ve.code
                    );
                  }) })
                ] }),
                Z && H(Z.attrs)
              ] })
            ] });
          })(),
          a === "pbs" && /* @__PURE__ */ F(
            "div",
            {
              className: wt ? "pbs-drop-zone drag-over" : "pbs-drop-zone",
              onDragEnter: (b) => {
                U() && (b.preventDefault(), Tr.current++, St(!0));
              },
              onDragOver: (b) => {
                U() && (b.preventDefault(), b.dataTransfer.dropEffect = "link");
              },
              onDragLeave: (b) => {
                Tr.current > 0 && Tr.current--, Tr.current === 0 && St(!1);
              },
              onDrop: (b) => {
                var Z;
                b.preventDefault(), Tr.current = 0, St(!1);
                const H = U();
                if (A(), !!H) {
                  if (!((Z = Ve == null ? void 0 : Ve.actions) != null && Z.some((te) => te.code === "create_link"))) {
                    l("You do not have write permission on this node", "error");
                    return;
                  }
                  H.nodeId && H.nodeId !== e && vo(H);
                }
              },
              children: [
                wt && /* @__PURE__ */ E("div", { className: "pbs-drop-hint", children: "Drop to create a link" }),
                ((fl = ye.actions) == null ? void 0 : fl.some((b) => b.code === "create_link")) && /* @__PURE__ */ E("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 8 }, children: /* @__PURE__ */ E("button", { className: "btn btn-sm", onClick: () => fe ? pe(!1) : vo(), children: fe ? "✕ Cancel" : "+ Add link" }) }),
                fe && (() => {
                  const b = je.find((ee) => (ee.id || ee.ID) === Ue), H = (b == null ? void 0 : b.link_policy) || (b == null ? void 0 : b.LINK_POLICY) || null, Z = (b == null ? void 0 : b.target_source_id) || (b == null ? void 0 : b.TARGET_SOURCE_ID) || "SELF", te = (b == null ? void 0 : b.target_type) || (b == null ? void 0 : b.TARGET_TYPE) || null, oe = Le[Z] || null, me = Z === "SELF", ge = (b == null ? void 0 : b.link_logical_id_label) || (b == null ? void 0 : b.LINK_LOGICAL_ID_LABEL) || "Link ID", ot = (b == null ? void 0 : b.link_logical_id_pattern) || (b == null ? void 0 : b.LINK_LOGICAL_ID_PATTERN) || null, ht = !ot || !Ce || new RegExp(`^(?:${ot})$`).test(Ce), tt = !!Ge;
                  return /* @__PURE__ */ F("div", { ref: Ks, className: "link-panel", style: { flexWrap: "wrap", rowGap: 6 }, children: [
                    !ei && /* @__PURE__ */ E("div", { style: { width: "100%", fontSize: 11, color: "var(--warn)", marginBottom: 2 }, children: "⚡ No active transaction — one will be opened automatically on create" }),
                    /* @__PURE__ */ F("div", { style: { display: "flex", gap: 8, width: "100%", alignItems: "flex-end" }, children: [
                      /* @__PURE__ */ F("div", { className: "field", style: { margin: 0, flex: "0 0 180px" }, children: [
                        /* @__PURE__ */ E("label", { className: "field-label", children: "Link type" }),
                        /* @__PURE__ */ F(
                          "select",
                          {
                            className: "field-input",
                            value: Ue,
                            onChange: (ee) => {
                              xe(ee.target.value), Be("");
                            },
                            children: [
                              /* @__PURE__ */ E("option", { value: "", children: "— select —" }),
                              je.map((ee) => /* @__PURE__ */ E("option", { value: ee.id || ee.ID, children: ee.name || ee.NAME }, ee.id || ee.ID))
                            ]
                          }
                        )
                      ] }),
                      /* @__PURE__ */ F("div", { className: "field", style: { margin: 0, flex: 1 }, children: [
                        /* @__PURE__ */ F("label", { className: "field-label", children: [
                          "Target ",
                          oe ? /* @__PURE__ */ F("span", { style: { opacity: 0.55, fontWeight: 400, fontSize: 10 }, children: [
                            "— source: ",
                            oe.name,
                            oe.versioned ? "" : " (immutable)"
                          ] }) : null
                        ] }),
                        /* @__PURE__ */ F("div", { style: { position: "relative" }, children: [
                          /* @__PURE__ */ E(
                            "input",
                            {
                              className: "field-input",
                              type: "text",
                              autoComplete: "off",
                              placeholder: me ? te ? `Search ${te} by logical ID…` : "Search by logical ID…" : te ? `${te} key (UUID, path, …)` : "Target key",
                              value: Ge,
                              onChange: (ee) => {
                                const We = ee.target.value;
                                He(We), z(-1), ne(!0), xo(Z, te, We);
                              },
                              onFocus: () => {
                                ne(!0), xo(Z, te, Ge);
                              },
                              onBlur: () => setTimeout(() => ne(!1), 150),
                              onKeyDown: (ee) => {
                                if (!(!$ || xt.length === 0))
                                  if (ee.key === "ArrowDown")
                                    ee.preventDefault(), z((We) => Math.min(We + 1, xt.length - 1));
                                  else if (ee.key === "ArrowUp")
                                    ee.preventDefault(), z((We) => Math.max(We - 1, -1));
                                  else if (ee.key === "Enter" && q >= 0) {
                                    ee.preventDefault();
                                    const We = xt[q];
                                    He(We.key || We.KEY || ""), ne(!1), z(-1);
                                  } else ee.key === "Escape" && (ne(!1), z(-1));
                              }
                            }
                          ),
                          $ && xt.length > 0 && /* @__PURE__ */ E("div", { className: "search-suggestions", children: xt.map((ee, We) => {
                            const Qe = ee.key || ee.KEY || "", Rt = ee.label || ee.LABEL || "";
                            return /* @__PURE__ */ F(
                              "div",
                              {
                                className: `search-sug-item${We === q ? " hi" : ""}`,
                                onMouseDown: () => {
                                  He(Qe), ne(!1), z(-1);
                                },
                                onMouseEnter: () => z(We),
                                children: [
                                  /* @__PURE__ */ E("span", { className: "sug-lid", children: Qe }),
                                  Rt && Rt !== Qe && /* @__PURE__ */ E("span", { className: "sug-dname", children: Rt })
                                ]
                              },
                              Qe
                            );
                          }) })
                        ] })
                      ] }),
                      H && /* @__PURE__ */ F("div", { className: "field", style: { margin: 0, flexShrink: 0 }, children: [
                        /* @__PURE__ */ E("label", { className: "field-label", children: "Policy" }),
                        /* @__PURE__ */ E(
                          "span",
                          {
                            className: "hist-type-badge",
                            "data-type": H,
                            style: { display: "inline-block", padding: "4px 8px", fontSize: 11 },
                            title: H === "VERSION_TO_VERSION" ? "Pinned to current version" : "Always latest version",
                            children: H === "VERSION_TO_VERSION" ? "V2V" : "V2M"
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ F("div", { style: { display: "flex", gap: 8, width: "100%", alignItems: "flex-end" }, children: [
                      /* @__PURE__ */ F("div", { className: "field", style: { margin: 0, flex: 1 }, children: [
                        /* @__PURE__ */ F("label", { className: "field-label", children: [
                          ge,
                          ot && /* @__PURE__ */ F("span", { style: { marginLeft: 6, opacity: 0.55, fontWeight: 400, fontSize: 10 }, children: [
                            "pattern: ",
                            ot
                          ] })
                        ] }),
                        /* @__PURE__ */ E(
                          "input",
                          {
                            className: "field-input",
                            style: { borderColor: (!Ce || !ht) && Ue ? "var(--danger, #e05252)" : void 0 },
                            type: "text",
                            placeholder: ge,
                            value: Ce,
                            onChange: (ee) => Be(ee.target.value)
                          }
                        ),
                        Ce && !ht && /* @__PURE__ */ F("div", { style: { fontSize: 10, color: "var(--danger, #e05252)", marginTop: 2 }, children: [
                          "Does not match pattern: ",
                          ot
                        ] })
                      ] }),
                      /* @__PURE__ */ E(
                        "button",
                        {
                          className: "btn btn-primary btn-sm",
                          style: { alignSelf: "flex-end" },
                          disabled: !Ue || !tt || !Ce || !ht || At,
                          onClick: Yd,
                          children: At ? "…" : "Create"
                        }
                      )
                    ] })
                  ] });
                })(),
                /* @__PURE__ */ E("div", { className: "section-label", style: { marginTop: 16 }, children: "BOM — Children" }),
                ie ? S.length === 0 ? /* @__PURE__ */ F("div", { className: "empty", style: { padding: "24px" }, children: [
                  /* @__PURE__ */ E("div", { className: "empty-icon", children: "◌" }),
                  /* @__PURE__ */ E("div", { className: "empty-text", children: "No child links" })
                ] }) : (() => {
                  const b = [], H = /* @__PURE__ */ new Map();
                  return S.forEach((Z) => {
                    const te = Z.linkTypeId || Z.linkTypeName || "?";
                    H.has(te) || (H.set(te, []), b.push(te)), H.get(te).push(Z);
                  }), b.map((Z) => {
                    const te = H.get(Z), oe = te[0], me = qr.get(Z), ge = (me == null ? void 0 : me.name) ?? oe.linkTypeName ?? Z, ht = !oe.targetSourceCode || oe.targetSourceCode === "SELF" ? "Self" : oe.sourceName || oe.targetSourceCode || "External", tt = ia ? 7 : 6;
                    return /* @__PURE__ */ F(dr, { children: [
                      /* @__PURE__ */ F("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 12, marginBottom: 4 }, children: [
                        /* @__PURE__ */ E("span", { style: { fontSize: 12, fontWeight: 600 }, children: ge }),
                        /* @__PURE__ */ E("span", { style: { fontSize: 11, color: "var(--muted)", background: "var(--surface2, rgba(0,0,0,.06))", borderRadius: 3, padding: "1px 6px" }, children: ht })
                      ] }),
                      /* @__PURE__ */ F("table", { className: "history-table", children: [
                        /* @__PURE__ */ E("thead", { children: /* @__PURE__ */ F("tr", { children: [
                          /* @__PURE__ */ E("th", { children: "Link ID" }),
                          /* @__PURE__ */ E("th", { children: "Node type" }),
                          /* @__PURE__ */ E("th", { children: "Identity" }),
                          /* @__PURE__ */ E("th", { children: "Rev" }),
                          /* @__PURE__ */ E("th", { children: "State" }),
                          /* @__PURE__ */ E("th", { children: "Policy" }),
                          ia && /* @__PURE__ */ E("th", {})
                        ] }) }),
                        /* @__PURE__ */ E("tbody", { children: te.map((ee) => {
                          var xn, mn;
                          const We = ct === ee.linkId, Qe = js === ee.linkId, Rt = !ee.targetSourceCode || ee.targetSourceCode === "SELF", Dt = Rt ? null : v(ee.targetSourceCode), gt = qr.get(ee.linkTypeId), ve = (gt == null ? void 0 : gt.attributes) ?? ee.linkTypeAttributes ?? [], mt = (gt == null ? void 0 : gt.linkPolicy) ?? ee.linkPolicy, Ot = ((xn = gt == null ? void 0 : gt.staticMetadata) == null ? void 0 : xn.linkLogicalIdLabel) ?? ee.linkLogicalIdLabel ?? "Link ID";
                          return /* @__PURE__ */ F(dr, { children: [
                            /* @__PURE__ */ F(
                              "tr",
                              {
                                className: O === ee.linkId ? "link-selected" : "",
                                style: { cursor: "pointer" },
                                onClick: () => {
                                  const Pe = O === ee.linkId ? null : ee.linkId;
                                  G(Pe), i == null || i.emit({ type: "psm:link:selected", linkId: Pe });
                                },
                                children: [
                                  /* @__PURE__ */ E("td", { style: { fontFamily: "var(--sans)", fontSize: 12 }, children: We ? /* @__PURE__ */ E(
                                    "input",
                                    {
                                      className: "field-input",
                                      style: { padding: "2px 6px", fontSize: 12, width: 120 },
                                      value: It,
                                      onChange: (Pe) => tn(Pe.target.value),
                                      autoFocus: !0
                                    }
                                  ) : ee.linkLogicalId ? /* @__PURE__ */ E("span", { title: Ot, children: ee.linkLogicalId }) : /* @__PURE__ */ E("span", { style: { opacity: 0.35 }, children: "—" }) }),
                                  Rt ? /* @__PURE__ */ F(Hr, { children: [
                                    /* @__PURE__ */ E("td", { style: { color: "var(--muted)", fontSize: 12 }, children: ee.targetNodeType }),
                                    /* @__PURE__ */ E("td", { style: { fontFamily: "var(--sans)", fontSize: 13 }, children: We ? /* @__PURE__ */ F("div", { style: { position: "relative" }, children: [
                                      /* @__PURE__ */ E(
                                        "input",
                                        {
                                          className: "field-input",
                                          style: { padding: "2px 4px", fontSize: 12, minWidth: 120 },
                                          type: "text",
                                          autoComplete: "off",
                                          placeholder: "target key…",
                                          value: Vt,
                                          onChange: (Pe) => {
                                            const Ke = Pe.target.value;
                                            Kt(Ke), $t(-1), nn(!0), Zr("SELF", ee.targetNodeType, Ke);
                                          },
                                          onFocus: () => {
                                            nn(!0), Zr("SELF", ee.targetNodeType, Vt);
                                          },
                                          onBlur: () => setTimeout(() => nn(!1), 150),
                                          onKeyDown: (Pe) => {
                                            !_i || cn.length === 0 || (Pe.key === "ArrowDown" ? (Pe.preventDefault(), $t((Ke) => Math.min(Ke + 1, cn.length - 1))) : Pe.key === "ArrowUp" ? (Pe.preventDefault(), $t((Ke) => Math.max(Ke - 1, -1))) : Pe.key === "Enter" && Dn >= 0 ? (Pe.preventDefault(), Kt(cn[Dn].key || cn[Dn].KEY || ""), nn(!1), $t(-1)) : Pe.key === "Escape" && (nn(!1), $t(-1)));
                                          }
                                        }
                                      ),
                                      _i && cn.length > 0 && /* @__PURE__ */ E("div", { className: "search-suggestions", children: cn.map((Pe, Ke) => {
                                        const Ft = Pe.key || Pe.KEY || "", Qt = Pe.label || Pe.LABEL || "";
                                        return /* @__PURE__ */ F(
                                          "div",
                                          {
                                            className: `search-sug-item${Ke === Dn ? " hi" : ""}`,
                                            onMouseDown: () => {
                                              Kt(Ft), nn(!1), $t(-1);
                                            },
                                            onMouseEnter: () => $t(Ke),
                                            children: [
                                              /* @__PURE__ */ E("span", { className: "sug-lid", children: Ft }),
                                              Qt && Qt !== Ft && /* @__PURE__ */ E("span", { className: "sug-dname", children: Qt })
                                            ]
                                          },
                                          Ft
                                        );
                                      }) })
                                    ] }) : ee.targetLogicalId || /* @__PURE__ */ F("span", { style: { opacity: 0.4 }, children: [
                                      (mn = ee.targetNodeId) == null ? void 0 : mn.slice(0, 8),
                                      "…"
                                    ] }) }),
                                    /* @__PURE__ */ E("td", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12 }, children: mt === "VERSION_TO_MASTER" ? /* @__PURE__ */ E("span", { style: { opacity: 0.35 }, children: "—" }) : `${ee.targetRevision}.${ee.targetIteration}` }),
                                    /* @__PURE__ */ E("td", { children: /* @__PURE__ */ E(Ii, { stateId: ee.targetState, stateName: ee.targetStateName, stateColorMap: s }) }),
                                    /* @__PURE__ */ E("td", { children: /* @__PURE__ */ E("span", { className: "hist-type-badge", "data-type": mt, style: { fontSize: 10 }, children: mt === "VERSION_TO_MASTER" ? "V2M" : "V2V" }) })
                                  ] }) : Dt ? /* @__PURE__ */ E("td", { colSpan: 5, style: { verticalAlign: "middle" }, children: /* @__PURE__ */ E(
                                    Dt,
                                    {
                                      link: ee,
                                      isEditing: We,
                                      editTargetKey: Vt,
                                      onEditTargetKey: Kt
                                    }
                                  ) }) : /* @__PURE__ */ F(Hr, { children: [
                                    /* @__PURE__ */ E("td", { style: { color: "var(--muted)", fontSize: 12 }, children: ee.targetNodeType || /* @__PURE__ */ E("span", { style: { opacity: 0.35 }, children: "—" }) }),
                                    /* @__PURE__ */ E("td", { style: { fontFamily: "var(--sans)", fontSize: 12 }, children: We ? /* @__PURE__ */ F("div", { style: { position: "relative" }, children: [
                                      /* @__PURE__ */ E(
                                        "input",
                                        {
                                          className: "field-input",
                                          style: { padding: "2px 4px", fontSize: 12, minWidth: 120 },
                                          type: "text",
                                          autoComplete: "off",
                                          placeholder: "target key…",
                                          value: Vt,
                                          onChange: (Pe) => {
                                            const Ke = Pe.target.value;
                                            Kt(Ke), $t(-1), nn(!0), Zr(ee.targetSourceCode, ee.targetNodeType, Ke);
                                          },
                                          onFocus: () => {
                                            nn(!0), Zr(ee.targetSourceCode, ee.targetNodeType, Vt);
                                          },
                                          onBlur: () => setTimeout(() => nn(!1), 150),
                                          onKeyDown: (Pe) => {
                                            !_i || cn.length === 0 || (Pe.key === "ArrowDown" ? (Pe.preventDefault(), $t((Ke) => Math.min(Ke + 1, cn.length - 1))) : Pe.key === "ArrowUp" ? (Pe.preventDefault(), $t((Ke) => Math.max(Ke - 1, -1))) : Pe.key === "Enter" && Dn >= 0 ? (Pe.preventDefault(), Kt(cn[Dn].key || cn[Dn].KEY || ""), nn(!1), $t(-1)) : Pe.key === "Escape" && (nn(!1), $t(-1)));
                                          }
                                        }
                                      ),
                                      _i && cn.length > 0 && /* @__PURE__ */ E("div", { className: "search-suggestions", children: cn.map((Pe, Ke) => {
                                        const Ft = Pe.key || Pe.KEY || "", Qt = Pe.label || Pe.LABEL || "";
                                        return /* @__PURE__ */ F(
                                          "div",
                                          {
                                            className: `search-sug-item${Ke === Dn ? " hi" : ""}`,
                                            onMouseDown: () => {
                                              Kt(Ft), nn(!1), $t(-1);
                                            },
                                            onMouseEnter: () => $t(Ke),
                                            children: [
                                              /* @__PURE__ */ E("span", { className: "sug-lid", children: Ft }),
                                              Qt && Qt !== Ft && /* @__PURE__ */ E("span", { className: "sug-dname", children: Qt })
                                            ]
                                          },
                                          Ft
                                        );
                                      }) })
                                    ] }) : ee.displayKey || ee.targetKey }),
                                    /* @__PURE__ */ E("td", {}),
                                    /* @__PURE__ */ E("td", {}),
                                    /* @__PURE__ */ E("td", { children: /* @__PURE__ */ E("span", { className: "hist-type-badge", "data-type": mt, style: { fontSize: 10 }, children: mt === "VERSION_TO_MASTER" ? "V2M" : "V2V" }) })
                                  ] }),
                                  ia && /* @__PURE__ */ E("td", { style: { whiteSpace: "nowrap" }, onClick: (Pe) => Pe.stopPropagation(), children: Qe ? /* @__PURE__ */ F("span", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
                                    /* @__PURE__ */ E("span", { style: { fontSize: 11, color: "var(--danger, #e05252)", marginRight: 2 }, children: "Delete?" }),
                                    /* @__PURE__ */ E(
                                      "button",
                                      {
                                        className: "btn btn-sm btn-danger",
                                        style: { padding: "1px 6px", fontSize: 11 },
                                        disabled: he,
                                        onClick: () => jd(ee.linkId),
                                        children: "✓"
                                      }
                                    ),
                                    /* @__PURE__ */ E(
                                      "button",
                                      {
                                        className: "btn btn-sm",
                                        style: { padding: "1px 6px", fontSize: 11 },
                                        onClick: () => T(null),
                                        children: "✕"
                                      }
                                    )
                                  ] }) : We ? /* @__PURE__ */ F("span", { style: { display: "flex", gap: 4 }, children: [
                                    /* @__PURE__ */ E(
                                      "button",
                                      {
                                        className: "btn btn-sm btn-success",
                                        style: { padding: "1px 6px", fontSize: 11 },
                                        disabled: he,
                                        onClick: () => qd(ee.linkId, It, Vt, Rn),
                                        children: "✓"
                                      }
                                    ),
                                    /* @__PURE__ */ E(
                                      "button",
                                      {
                                        className: "btn btn-sm",
                                        style: { padding: "1px 6px", fontSize: 11 },
                                        onClick: () => bt(null),
                                        children: "✕"
                                      }
                                    )
                                  ] }) : /* @__PURE__ */ F("span", { style: { display: "flex", gap: 4 }, children: [
                                    (Vi || na) && /* @__PURE__ */ E(
                                      "button",
                                      {
                                        className: "btn btn-sm",
                                        style: { padding: "1px 6px", fontSize: 11, ...Vi ? {} : { opacity: 0.35, cursor: "not-allowed" } },
                                        title: Vi ? "Edit link" : "Checkout to edit",
                                        disabled: !Vi,
                                        onClick: Vi ? () => {
                                          bt(ee.linkId), tn(ee.linkLogicalId || ""), Kt(ee.targetLogicalId || ee.targetKey || "");
                                          const Pe = {};
                                          (ee.linkAttributeValues || []).forEach((Ke) => {
                                            Pe[Ke.attributeId] = Ke.value || "";
                                          }), bn(Pe), Wn([]), nn(!1), $t(-1), T(null);
                                        } : void 0,
                                        children: "✎"
                                      }
                                    ),
                                    (vi || na) && /* @__PURE__ */ E(
                                      "button",
                                      {
                                        className: "btn btn-sm",
                                        style: { padding: "1px 6px", fontSize: 11, color: vi ? "var(--danger, #e05252)" : void 0, ...vi ? {} : { opacity: 0.35, cursor: "not-allowed" } },
                                        title: vi ? "Delete link" : "Checkout to delete",
                                        disabled: !vi,
                                        onClick: vi ? () => {
                                          T(ee.linkId), bt(null);
                                        } : void 0,
                                        children: "✕"
                                      }
                                    )
                                  ] }) })
                                ]
                              }
                            ),
                            O === ee.linkId && !We && (() => {
                              const Pe = {};
                              return (ee.linkAttributeValues || []).forEach((Ke) => {
                                Pe[Ke.attributeId] = Ke.value;
                              }), /* @__PURE__ */ E("tr", { className: "link-detail-expand", onClick: (Ke) => Ke.stopPropagation(), children: /* @__PURE__ */ E("td", { colSpan: tt, children: /* @__PURE__ */ E("div", { className: "link-detail-inner", children: ve.length === 0 ? /* @__PURE__ */ E("span", { style: { fontSize: 11, opacity: 0.5 }, children: "No attributes defined for this link type." }) : /* @__PURE__ */ E("div", { style: { display: "flex", flexWrap: "wrap", gap: 12 }, children: ve.map((Ke) => /* @__PURE__ */ F("div", { style: { flex: Ke.dataType === "POSITION" ? "1 1 100%" : "1 1 160px", minWidth: 120 }, children: [
                                /* @__PURE__ */ E("div", { style: { fontSize: 10, color: "var(--muted)", marginBottom: 4 }, children: Ke.label || Ke.name }),
                                Ke.dataType === "POSITION" ? /* @__PURE__ */ E(ja, { value: Pe[Ke.name], readOnly: !0 }) : /* @__PURE__ */ E("div", { style: { fontSize: 12 }, children: Pe[Ke.name] != null ? Pe[Ke.name] : /* @__PURE__ */ E("span", { style: { opacity: 0.35 }, children: "—" }) })
                              ] }, Ke.name)) }) }) }) });
                            })(),
                            We && ve.length > 0 && /* @__PURE__ */ E("tr", { children: /* @__PURE__ */ E("td", { colSpan: tt, style: { padding: "4px 8px 8px", background: "var(--surface2, rgba(0,0,0,.04))" }, children: /* @__PURE__ */ E("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }, children: ve.map((Pe) => /* @__PURE__ */ F("div", { className: "field", style: { margin: 0, flex: Pe.dataType === "POSITION" ? "1 1 100%" : "1 1 160px", minWidth: 120 }, children: [
                              /* @__PURE__ */ F("label", { className: "field-label", style: { fontSize: 10 }, children: [
                                Pe.label || Pe.name,
                                Pe.required && /* @__PURE__ */ E("span", { className: "field-req", children: "*" })
                              ] }),
                              Pe.dataType === "POSITION" ? /* @__PURE__ */ E(
                                ja,
                                {
                                  value: Rn[Pe.name] || "",
                                  onChange: (Ke) => {
                                    bn((Qt) => ({ ...Qt, [Pe.name]: Ke }));
                                    const Ft = Ke.split(",").map(Number);
                                    Ft.length === 16 && Ft.every((Qt) => !isNaN(Qt)) && (i == null || i.emit({ type: "psm:link:positionChange", linkId: ct, matrix: Ft }));
                                  }
                                }
                              ) : /* @__PURE__ */ E(
                                "input",
                                {
                                  className: "field-input",
                                  style: { padding: "2px 6px", fontSize: 12 },
                                  value: Rn[Pe.name] || "",
                                  onChange: (Ke) => bn((Ft) => ({ ...Ft, [Pe.name]: Ke.target.value })),
                                  placeholder: Pe.label || Pe.name
                                }
                              )
                            ] }, Pe.name)) }) }) })
                          ] }, ee.linkId);
                        }) })
                      ] })
                    ] }, Z);
                  });
                })() : /* @__PURE__ */ F("div", { className: "empty", style: { padding: "24px" }, children: [
                  /* @__PURE__ */ E("div", { className: "empty-icon", children: "◎" }),
                  /* @__PURE__ */ E("div", { className: "empty-text", children: "Loading…" })
                ] }),
                /* @__PURE__ */ E("div", { className: "section-label", style: { marginTop: 24 }, children: "Where Used — Parents" }),
                ie ? se.length === 0 ? /* @__PURE__ */ F("div", { className: "empty", style: { padding: "24px" }, children: [
                  /* @__PURE__ */ E("div", { className: "empty-icon", children: "◌" }),
                  /* @__PURE__ */ E("div", { className: "empty-text", children: "Not used anywhere" })
                ] }) : (() => {
                  const b = [], H = /* @__PURE__ */ new Map();
                  return se.forEach((Z) => {
                    const te = Z.linkTypeId || Z.linkTypeName || "?";
                    H.has(te) || (H.set(te, []), b.push(te)), H.get(te).push(Z);
                  }), b.map((Z) => {
                    var me;
                    const te = qr.get(Z), oe = (te == null ? void 0 : te.name) ?? ((me = H.get(Z)[0]) == null ? void 0 : me.linkTypeName) ?? Z;
                    return /* @__PURE__ */ F(dr, { children: [
                      /* @__PURE__ */ F("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 12, marginBottom: 4 }, children: [
                        /* @__PURE__ */ E("span", { style: { fontSize: 12, fontWeight: 600 }, children: oe }),
                        /* @__PURE__ */ E("span", { style: { fontSize: 11, color: "var(--muted)", background: "var(--surface2, rgba(0,0,0,.06))", borderRadius: 3, padding: "1px 6px" }, children: "Self" })
                      ] }),
                      /* @__PURE__ */ F("table", { className: "history-table", children: [
                        /* @__PURE__ */ E("thead", { children: /* @__PURE__ */ F("tr", { children: [
                          /* @__PURE__ */ E("th", { children: "Link ID" }),
                          /* @__PURE__ */ E("th", { children: "Node type" }),
                          /* @__PURE__ */ E("th", { children: "Identity" }),
                          /* @__PURE__ */ E("th", { children: "Rev" }),
                          /* @__PURE__ */ E("th", { children: "State" }),
                          /* @__PURE__ */ E("th", { children: "Policy" })
                        ] }) }),
                        /* @__PURE__ */ E("tbody", { children: H.get(Z).map((ge) => {
                          var We, Qe;
                          const ot = X === ge.linkId, ht = qr.get(ge.linkTypeId), tt = (ht == null ? void 0 : ht.linkPolicy) ?? ge.linkPolicy, ee = ((We = ht == null ? void 0 : ht.staticMetadata) == null ? void 0 : We.linkLogicalIdLabel) ?? ge.linkLogicalIdLabel ?? "Link ID";
                          return /* @__PURE__ */ F(dr, { children: [
                            /* @__PURE__ */ F(
                              "tr",
                              {
                                className: ot ? "link-selected" : "",
                                style: { cursor: "pointer" },
                                onClick: () => B((Rt) => Rt === ge.linkId ? null : ge.linkId),
                                children: [
                                  /* @__PURE__ */ E("td", { style: { fontFamily: "var(--sans)", fontSize: 12 }, children: ge.linkLogicalId ? /* @__PURE__ */ E("span", { title: ee, children: ge.linkLogicalId }) : /* @__PURE__ */ E("span", { style: { opacity: 0.35 }, children: "—" }) }),
                                  /* @__PURE__ */ E("td", { style: { color: "var(--muted)", fontSize: 12 }, children: ge.sourceNodeType }),
                                  /* @__PURE__ */ E("td", { style: { fontFamily: "var(--sans)", fontSize: 13 }, children: ge.sourceLogicalId || /* @__PURE__ */ F("span", { style: { opacity: 0.4 }, children: [
                                    (Qe = ge.sourceNodeId) == null ? void 0 : Qe.slice(0, 8),
                                    "…"
                                  ] }) }),
                                  /* @__PURE__ */ E("td", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12 }, children: tt === "VERSION_TO_MASTER" ? /* @__PURE__ */ E("span", { style: { opacity: 0.35 }, children: "—" }) : `${ge.sourceRevision}.${ge.sourceIteration}` }),
                                  /* @__PURE__ */ E("td", { children: /* @__PURE__ */ E(Ii, { stateId: ge.sourceState, stateName: ge.sourceStateName, stateColorMap: s }) }),
                                  /* @__PURE__ */ E("td", { children: /* @__PURE__ */ E("span", { className: "hist-type-badge", "data-type": tt, style: { fontSize: 10 }, children: tt === "VERSION_TO_MASTER" ? "V2M" : "V2V" }) })
                                ]
                              }
                            ),
                            ot && (() => {
                              const Rt = (ht == null ? void 0 : ht.attributes) ?? ge.linkTypeAttributes ?? [], Dt = {};
                              return (ge.linkAttributeValues || []).forEach((gt) => {
                                Dt[gt.attributeId] = gt.value;
                              }), /* @__PURE__ */ E("tr", { className: "link-detail-expand", onClick: (gt) => gt.stopPropagation(), children: /* @__PURE__ */ E("td", { colSpan: 6, children: /* @__PURE__ */ E("div", { className: "link-detail-inner", children: Rt.length === 0 ? /* @__PURE__ */ E("span", { style: { fontSize: 11, opacity: 0.5 }, children: "No attributes defined for this link type." }) : /* @__PURE__ */ E("div", { style: { display: "flex", flexWrap: "wrap", gap: 12 }, children: Rt.map((gt) => /* @__PURE__ */ F("div", { style: { flex: gt.dataType === "POSITION" ? "1 1 100%" : "1 1 160px", minWidth: 120 }, children: [
                                /* @__PURE__ */ E("div", { style: { fontSize: 10, color: "var(--muted)", marginBottom: 4 }, children: gt.label || gt.name }),
                                gt.dataType === "POSITION" ? /* @__PURE__ */ E(ja, { value: Dt[gt.name], readOnly: !0 }) : /* @__PURE__ */ E("div", { style: { fontSize: 12 }, children: Dt[gt.name] != null ? Dt[gt.name] : /* @__PURE__ */ E("span", { style: { opacity: 0.35 }, children: "—" }) })
                              ] }, gt.name)) }) }) }) });
                            })()
                          ] }, ge.linkId);
                        }) })
                      ] })
                    ] }, Z);
                  });
                })() : /* @__PURE__ */ F("div", { className: "empty", style: { padding: "24px" }, children: [
                  /* @__PURE__ */ E("div", { className: "empty-icon", children: "◎" }),
                  /* @__PURE__ */ E("div", { className: "empty-text", children: "Loading…" })
                ] })
              ]
            }
          ),
          a === "history" && /* @__PURE__ */ F("div", { children: [
            /* @__PURE__ */ F("div", { className: "history-lc-section", children: [
              /* @__PURE__ */ E("div", { className: "history-lc-label", children: "Lifecycle" }),
              /* @__PURE__ */ E(
                V,
                {
                  lifecycleId: ((pl = un == null ? void 0 : un.staticMetadata) == null ? void 0 : pl.lifecycleId) || ((ml = ye.metadata) == null ? void 0 : ml.lifecycleId),
                  currentStateId: (gl = ye.metadata) == null ? void 0 : gl.state,
                  userId: t,
                  availableTransitionNames: new Set(
                    Ao.filter((b) => {
                      var H;
                      return !((H = b.guardViolations) != null && H.length);
                    }).map((b) => b.label)
                  ),
                  transitionGuardViolations: Qd,
                  onTransition: (b) => {
                    var te;
                    const H = b.name || b.NAME || "", Z = Ao.find((oe) => oe.label === H);
                    Z && !((te = Z.guardViolations) != null && te.length) && Zs(Z);
                  }
                }
              )
            ] }),
            /* @__PURE__ */ E("div", { className: "history-lc-divider", children: /* @__PURE__ */ E("span", { children: "Version history" }) }),
            W.length === 0 ? /* @__PURE__ */ F("div", { className: "empty", children: [
              /* @__PURE__ */ E("div", { className: "empty-icon", children: "◌" }),
              /* @__PURE__ */ E("div", { className: "empty-text", children: "No history yet" })
            ] }) : /* @__PURE__ */ F("table", { className: "history-table", children: [
              /* @__PURE__ */ E("thead", { children: /* @__PURE__ */ F("tr", { children: [
                /* @__PURE__ */ E("th", { children: "#" }),
                /* @__PURE__ */ E("th", { children: "Rev" }),
                /* @__PURE__ */ E("th", { children: "State" }),
                /* @__PURE__ */ E("th", { children: "Type" }),
                /* @__PURE__ */ E("th", { children: "Commit message" }),
                /* @__PURE__ */ E("th", { children: "By" }),
                /* @__PURE__ */ E("th", { children: "Date" }),
                /* @__PURE__ */ E("th", { children: "Fingerprint" }),
                /* @__PURE__ */ E("th", { children: "TX" }),
                /* @__PURE__ */ E("th", {})
              ] }) }),
              /* @__PURE__ */ E("tbody", { children: [...W].reverse().map((b, H, Z) => {
                var Dt, gt;
                const te = b.fingerprint || b.FINGERPRINT || null, oe = b.tx_id || b.TX_ID || null, me = Z[H + 1] ? Z[H + 1].fingerprint || Z[H + 1].FINGERPRINT : null, ge = Z[H + 1] ? Z[H + 1].tx_id || Z[H + 1].TX_ID : null, ot = te && me && te !== me, ht = te && !me, tt = b.committed_at || b.COMMITTED_AT, ee = b.version_number || b.VERSION_NUMBER, We = (b.tx_status || b.TX_STATUS) === "OPEN", Qe = H === Z.length - 1, Rt = Ae === ee;
                return /* @__PURE__ */ F("tr", { className: [We ? "pending-row" : "", Rt ? "historical-row" : ""].filter(Boolean).join(" ") || void 0, children: [
                  /* @__PURE__ */ F("td", { children: [
                    /* @__PURE__ */ E("span", { className: "ver-num", children: ee }),
                    We && /* @__PURE__ */ E("span", { className: "pending-badge", children: "pending" })
                  ] }),
                  /* @__PURE__ */ E("td", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12 }, children: (b.iteration ?? b.ITERATION) === 0 ? b.revision || b.REVISION : `${b.revision || b.REVISION}.${b.iteration ?? b.ITERATION}` }),
                  /* @__PURE__ */ E("td", { children: /* @__PURE__ */ E("span", { className: "hist-state", children: b.state_name || b.STATE_NAME || "—" }) }),
                  /* @__PURE__ */ E("td", { children: We ? /* @__PURE__ */ E("span", { className: "hist-type-badge", "data-type": b.change_type || b.CHANGE_TYPE, style: { opacity: 0.6 }, children: b.change_type || b.CHANGE_TYPE }) : /* @__PURE__ */ E("span", { className: "hist-type-badge", "data-type": b.change_type || b.CHANGE_TYPE, children: b.change_type || b.CHANGE_TYPE }) }),
                  /* @__PURE__ */ E("td", { className: "hist-comment", title: b.tx_comment || b.TX_COMMENT || "", children: We ? /* @__PURE__ */ E("span", { style: { color: "var(--warn)", fontStyle: "italic", opacity: 0.7 }, children: "uncommitted" }) : b.tx_comment || b.TX_COMMENT || /* @__PURE__ */ E("span", { style: { opacity: 0.4 }, children: "—" }) }),
                  /* @__PURE__ */ E("td", { className: "hist-by", children: b.created_by || b.CREATED_BY || b.tx_owner || "—" }),
                  /* @__PURE__ */ E("td", { className: "hist-date", children: We ? /* @__PURE__ */ E("span", { style: { color: "var(--warn)", fontStyle: "italic" }, children: "—" }) : tt ? new Date(tt).toLocaleDateString() : "—" }),
                  /* @__PURE__ */ E("td", { children: te ? /* @__PURE__ */ F(
                    "span",
                    {
                      className: "hist-fp",
                      title: te,
                      style: { color: We ? "var(--warn)" : ht || ot ? "var(--success)" : "var(--muted2)", opacity: We ? 0.6 : 1 },
                      children: [
                        te.slice(0, 8),
                        "…"
                      ]
                    }
                  ) : /* @__PURE__ */ E("span", { style: { opacity: 0.3 }, children: "—" }) }),
                  /* @__PURE__ */ E("td", { children: oe ? /* @__PURE__ */ F(
                    "span",
                    {
                      className: "hist-fp",
                      title: oe,
                      style: { color: We ? "var(--warn)" : oe !== ge ? "var(--accent)" : "var(--muted2)", fontFamily: "var(--mono)", opacity: We ? 0.6 : 1 },
                      children: [
                        oe.slice(0, 8),
                        "…"
                      ]
                    }
                  ) : /* @__PURE__ */ E("span", { style: { opacity: 0.3 }, children: "—" }) }),
                  /* @__PURE__ */ F("td", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
                    /* @__PURE__ */ F("div", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
                      !Qe && /* @__PURE__ */ E(
                        "button",
                        {
                          className: "btn-diff",
                          title: `Diff v${((Dt = Z[H + 1]) == null ? void 0 : Dt.version_number) || ((gt = Z[H + 1]) == null ? void 0 : gt.VERSION_NUMBER)} → v${ee}${We ? " (pending)" : ""}`,
                          disabled: Tt,
                          onClick: () => Xd(ee),
                          children: "⊕ diff"
                        }
                      ),
                      (() => {
                        const ve = b.id || b.ID, mt = ve && j[ve] || 0;
                        return mt > 0 && m ? /* @__PURE__ */ F(
                          "button",
                          {
                            className: "btn-diff",
                            title: `${mt} comment${mt > 1 ? "s" : ""} on this version`,
                            onClick: () => m(ve),
                            style: { color: "var(--accent)" },
                            children: [
                              "💬 ",
                              mt
                            ]
                          }
                        ) : null;
                      })(),
                      (() => {
                        const ve = b.id || b.ID, mt = ve ? Un[ve] : null, Ot = mt ? mt.count : 0, xn = mt ? mt.hasRejected : !1;
                        return Ot > 0 ? /* @__PURE__ */ F(
                          "button",
                          {
                            className: "btn-diff",
                            title: `${Ot} signature${Ot > 1 ? "s" : ""} on this version${xn ? " (rejected)" : ""}`,
                            onClick: () => Ut(ve),
                            style: { color: xn ? "var(--danger)" : "var(--success)", display: "inline-flex", alignItems: "center", gap: 3 },
                            children: [
                              /* @__PURE__ */ E(k, { size: 12 }),
                              " ",
                              Ot
                            ]
                          }
                        ) : null;
                      })()
                    ] }),
                    /* @__PURE__ */ E("div", { style: { marginLeft: "auto" }, children: !We && ee !== Jd && /* @__PURE__ */ E(
                      "button",
                      {
                        className: "btn-diff",
                        title: Rt ? "Exit historical view" : `View node at version ${ee}`,
                        style: { opacity: Rt ? 1 : 0.6, background: Rt ? "rgba(251,191,36,.2)" : void 0 },
                        onClick: () => {
                          Rt ? (Ht(null), dn(null)) : (Ht(ee), dn(null));
                        },
                        children: "👁"
                      }
                    ) })
                  ] })
                ] }, ee);
              }) })
            ] })
          ] })
        ] }),
        Ze && /* @__PURE__ */ E(
          $_,
          {
            diff: Ze.data,
            v1Num: Ze.v1Num,
            v2Num: Ze.v2Num,
            onClose: () => qe(null),
            stateColorMap: s
          }
        ),
        Fi && /* @__PURE__ */ E(
          nh,
          {
            shellAPI: i,
            nodeId: e,
            userId: t,
            filterVersionId: Fi,
            onClose: () => Ut(null)
          }
        )
      ]
    }
  );
}
function $_({ diff: i, v1Num: e, v2Num: t, onClose: n, stateColorMap: r }) {
  const { v1: s, v2: a, attributeDiff: o, stateChanged: l, linkDiff: d = [] } = i, u = o.filter((c) => c.changed), p = o.filter((c) => !c.changed), f = d.filter((c) => c.status === "ADDED"), m = d.filter((c) => c.status === "REMOVED"), _ = d.filter((c) => c.status === "UNCHANGED"), x = [...f, ...m];
  return /* @__PURE__ */ E("div", { className: "diff-overlay", onClick: (c) => c.target === c.currentTarget && n(), children: /* @__PURE__ */ F("div", { className: "diff-modal", children: [
    /* @__PURE__ */ F("div", { className: "diff-header", children: [
      /* @__PURE__ */ F("span", { className: "diff-title", children: [
        "Diff — v",
        e,
        " → v",
        t
      ] }),
      /* @__PURE__ */ E("button", { className: "diff-close", onClick: n, children: "✕" })
    ] }),
    /* @__PURE__ */ F("div", { className: "diff-meta-row", children: [
      /* @__PURE__ */ F("div", { className: "diff-meta-cell diff-meta-old", children: [
        /* @__PURE__ */ F("div", { className: "diff-meta-label", children: [
          "Version ",
          e
        ] }),
        /* @__PURE__ */ E("div", { className: "diff-meta-rev", children: s.iteration === 0 ? s.revision : `${s.revision}.${s.iteration}` }),
        /* @__PURE__ */ E(Ii, { stateId: s.lifecycleStateId, stateColorMap: r }),
        /* @__PURE__ */ E("span", { className: "hist-type-badge", "data-type": s.changeType, style: { marginLeft: 6 }, children: s.changeType }),
        /* @__PURE__ */ F("div", { className: "diff-meta-sub", children: [
          s.createdBy,
          " · ",
          s.txComment || "—"
        ] })
      ] }),
      /* @__PURE__ */ E("div", { className: "diff-arrow", children: "→" }),
      /* @__PURE__ */ F("div", { className: "diff-meta-cell diff-meta-new", style: a.committedAt ? void 0 : { borderColor: "rgba(232,169,71,.35)", background: "rgba(232,169,71,.05)" }, children: [
        /* @__PURE__ */ F("div", { className: "diff-meta-label", style: { display: "flex", alignItems: "center", gap: 6 }, children: [
          "Version ",
          t,
          !a.committedAt && /* @__PURE__ */ E("span", { className: "pending-badge", children: "pending" })
        ] }),
        /* @__PURE__ */ E("div", { className: "diff-meta-rev", children: a.iteration === 0 ? a.revision : `${a.revision}.${a.iteration}` }),
        /* @__PURE__ */ E(Ii, { stateId: a.lifecycleStateId, stateColorMap: r }),
        /* @__PURE__ */ E("span", { className: "hist-type-badge", "data-type": a.changeType, style: { marginLeft: 6 }, children: a.changeType }),
        /* @__PURE__ */ F("div", { className: "diff-meta-sub", children: [
          a.createdBy,
          " · ",
          a.txComment || /* @__PURE__ */ E("em", { style: { opacity: 0.5 }, children: "uncommitted" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ F("div", { className: "diff-body", children: [
      l && /* @__PURE__ */ F("div", { className: "diff-state-change", children: [
        /* @__PURE__ */ E("span", { style: { opacity: 0.7 }, children: "State changed:" }),
        " ",
        /* @__PURE__ */ E(Ii, { stateId: s.lifecycleStateId, stateColorMap: r }),
        " ",
        "→",
        " ",
        /* @__PURE__ */ E(Ii, { stateId: a.lifecycleStateId, stateColorMap: r })
      ] }),
      u.length === 0 && !l ? /* @__PURE__ */ E("div", { className: "diff-no-changes", children: "No attribute changes between these versions." }) : /* @__PURE__ */ F("div", { className: "diff-attr-section", children: [
        /* @__PURE__ */ F("div", { className: "diff-section-title", children: [
          "Changed attributes (",
          u.length,
          ")"
        ] }),
        u.length === 0 ? /* @__PURE__ */ E("div", { className: "diff-empty-section", children: "None" }) : /* @__PURE__ */ F("table", { className: "diff-table", children: [
          /* @__PURE__ */ E("thead", { children: /* @__PURE__ */ F("tr", { children: [
            /* @__PURE__ */ E("th", { children: "Attribute" }),
            /* @__PURE__ */ F("th", { className: "diff-old-col", children: [
              "Before (v",
              e,
              ")"
            ] }),
            /* @__PURE__ */ F("th", { className: "diff-new-col", children: [
              "After (v",
              t,
              ")"
            ] })
          ] }) }),
          /* @__PURE__ */ E("tbody", { children: u.map((c) => /* @__PURE__ */ F("tr", { className: "diff-row-changed", children: [
            /* @__PURE__ */ E("td", { className: "diff-attr-name", children: c.label || c.id || c.code }),
            /* @__PURE__ */ E("td", { className: "diff-val diff-val-old", children: c.v1Value !== "" ? c.v1Value : /* @__PURE__ */ E("span", { className: "diff-empty", children: "—" }) }),
            /* @__PURE__ */ E("td", { className: "diff-val diff-val-new", children: c.v2Value !== "" ? c.v2Value : /* @__PURE__ */ E("span", { className: "diff-empty", children: "—" }) })
          ] }, c.id || c.code)) })
        ] })
      ] }),
      p.length > 0 && /* @__PURE__ */ F("details", { className: "diff-unchanged-details", children: [
        /* @__PURE__ */ F("summary", { className: "diff-section-title", style: { cursor: "pointer" }, children: [
          "Unchanged attributes (",
          p.length,
          ")"
        ] }),
        /* @__PURE__ */ F("table", { className: "diff-table", style: { marginTop: 8 }, children: [
          /* @__PURE__ */ E("thead", { children: /* @__PURE__ */ F("tr", { children: [
            /* @__PURE__ */ E("th", { children: "Attribute" }),
            /* @__PURE__ */ E("th", { colSpan: 2, children: "Value" })
          ] }) }),
          /* @__PURE__ */ E("tbody", { children: p.map((c) => /* @__PURE__ */ F("tr", { className: "diff-row-unchanged", children: [
            /* @__PURE__ */ E("td", { className: "diff-attr-name", children: c.label || c.id || c.code }),
            /* @__PURE__ */ E("td", { className: "diff-val", colSpan: 2, style: { color: "var(--muted2)" }, children: c.v1Value !== "" ? c.v1Value : /* @__PURE__ */ E("span", { className: "diff-empty", children: "—" }) })
          ] }, c.id || c.code)) })
        ] })
      ] }),
      d.length > 0 && /* @__PURE__ */ F("div", { className: "diff-attr-section", style: { marginTop: 16 }, children: [
        /* @__PURE__ */ F("div", { className: "diff-section-title", children: [
          "Links",
          x.length > 0 ? ` — ${x.length} change${x.length > 1 ? "s" : ""}` : " — no changes"
        ] }),
        x.map((c) => /* @__PURE__ */ F("details", { className: "diff-link-entry", open: !0, children: [
          /* @__PURE__ */ F("summary", { className: "diff-link-summary", children: [
            /* @__PURE__ */ E(
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
            /* @__PURE__ */ E("span", { style: { fontWeight: 600, marginRight: 6 }, children: c.linkTypeName }),
            /* @__PURE__ */ E(
              "span",
              {
                className: "hist-type-badge",
                "data-type": c.linkPolicy === "VERSION_TO_VERSION" ? "SIGNATURE" : "LIFECYCLE",
                style: { fontSize: 10, marginRight: 8 },
                children: c.linkPolicy === "VERSION_TO_VERSION" ? "V2V" : "V2M"
              }
            ),
            /* @__PURE__ */ E("span", { style: { color: "var(--fg)" }, children: c.targetLogicalId || c.targetNodeId }),
            /* @__PURE__ */ F("span", { style: { color: "var(--muted2)", fontSize: 11, marginLeft: 4 }, children: [
              "(",
              c.targetNodeType,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ F("div", { className: "diff-link-detail", children: [
            /* @__PURE__ */ F("div", { className: "diff-link-detail-row", children: [
              /* @__PURE__ */ E("span", { className: "diff-attr-name", children: "Target" }),
              /* @__PURE__ */ F("span", { className: "diff-val", children: [
                c.targetLogicalId || c.targetNodeId,
                /* @__PURE__ */ F("span", { style: { color: "var(--muted2)", marginLeft: 4 }, children: [
                  "· ",
                  c.targetNodeType
                ] })
              ] })
            ] }),
            /* @__PURE__ */ F("div", { className: "diff-link-detail-row", children: [
              /* @__PURE__ */ E("span", { className: "diff-attr-name", children: "Policy" }),
              /* @__PURE__ */ E("span", { className: "diff-val", children: c.linkPolicy === "VERSION_TO_VERSION" ? "V2V — pinned version" : "V2M — always latest" })
            ] }),
            c.linkPolicy === "VERSION_TO_VERSION" && /* @__PURE__ */ F("div", { className: "diff-link-detail-row", children: [
              /* @__PURE__ */ E("span", { className: "diff-attr-name", children: "Pinned version" }),
              /* @__PURE__ */ E("span", { className: "diff-val", children: c.pinnedRevision != null ? `${c.pinnedRevision}.${c.pinnedIteration}` : /* @__PURE__ */ E("span", { className: "diff-empty", children: "—" }) })
            ] })
          ] })
        ] }, c.linkId)),
        _.length > 0 && /* @__PURE__ */ F("details", { className: "diff-unchanged-details", style: { marginTop: 8 }, children: [
          /* @__PURE__ */ F("summary", { className: "diff-section-title", style: { cursor: "pointer", fontWeight: 400 }, children: [
            "Unchanged links (",
            _.length,
            ")"
          ] }),
          /* @__PURE__ */ E("div", { style: { marginTop: 4 }, children: _.map((c) => /* @__PURE__ */ F("div", { className: "diff-link-unch-row", children: [
            /* @__PURE__ */ E("span", { style: { fontWeight: 600, marginRight: 6 }, children: c.linkTypeName }),
            /* @__PURE__ */ E(
              "span",
              {
                className: "hist-type-badge",
                "data-type": c.linkPolicy === "VERSION_TO_VERSION" ? "SIGNATURE" : "LIFECYCLE",
                style: { fontSize: 10, marginRight: 8 },
                children: c.linkPolicy === "VERSION_TO_VERSION" ? "V2V" : "V2M"
              }
            ),
            /* @__PURE__ */ E("span", { children: c.targetLogicalId || c.targetNodeId }),
            /* @__PURE__ */ F("span", { style: { color: "var(--muted2)", fontSize: 11, marginLeft: 4 }, children: [
              "(",
              c.targetNodeType,
              ")"
            ] }),
            c.linkPolicy === "VERSION_TO_VERSION" && c.pinnedRevision && /* @__PURE__ */ F("span", { style: { color: "var(--muted2)", fontSize: 11, marginLeft: 8 }, children: [
              "pinned ",
              c.pinnedRevision,
              ".",
              c.pinnedIteration
            ] })
          ] }, c.linkId)) })
        ] })
      ] })
    ] }),
    (s.fingerprint || a.fingerprint) && /* @__PURE__ */ F("div", { className: "diff-fp-row", children: [
      /* @__PURE__ */ E("span", { className: "diff-fp-label", children: "Fingerprint" }),
      /* @__PURE__ */ E("span", { className: "diff-fp-val", title: s.fingerprint, style: { color: "var(--muted2)" }, children: s.fingerprint ? s.fingerprint.slice(0, 12) + "…" : "—" }),
      /* @__PURE__ */ E("span", { style: { margin: "0 6px", opacity: 0.5 }, children: "→" }),
      /* @__PURE__ */ E(
        "span",
        {
          className: "diff-fp-val",
          title: a.fingerprint,
          style: { color: s.fingerprint !== a.fingerprint ? "var(--success)" : "var(--muted2)" },
          children: a.fingerprint ? a.fingerprint.slice(0, 12) + "…" : "—"
        }
      )
    ] })
  ] }) });
}
let Bd = null;
function Z_({ tab: i, ctx: e }) {
  return /* @__PURE__ */ E(
    K_,
    {
      shellAPI: Bd,
      nodeId: i.nodeId,
      userId: e.userId,
      tx: e.tx,
      nodeTypes: e.nodeTypes,
      stateColorMap: e.stateColorMap,
      activeSubTab: i.activeSubTab || "attributes",
      onSubTabChange: (t) => e.onSubTabChange(i.id, t),
      toast: e.toast,
      onAutoOpenTx: e.onAutoOpenTx,
      onDescriptionLoaded: e.onDescriptionLoaded,
      onRefreshItemData: e.onRefreshItemData,
      itemData: e.itemData,
      onOpenCommentsForVersion: e.onOpenCommentsForVersion,
      onCommentAttribute: e.onCommentAttribute,
      onNavigate: e.onNavigate,
      onRegisterPreview: e.onRegisterPreview
    }
  );
}
const n0 = {
  id: "psm-editor",
  zone: "editor",
  init(i) {
    Bd = i, th(i);
  },
  matches(i) {
    return (i == null ? void 0 : i.serviceCode) === "psm";
  },
  Component: Z_
};
export {
  n0 as default
};
