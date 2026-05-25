import { jsx as b, jsxs as F, Fragment as Xr } from "react/jsx-runtime";
import { useState as Ue, useCallback as dr, useEffect as Rt, useRef as Mn, Fragment as hr, useMemo as da } from "react";
import ha from "react-dom";
import { p as Vt, i as sh } from "./psmApi-uItxvmzj.js";
function ah({
  shellAPI: i,
  nodeId: e,
  userId: t,
  filterVersionId: n,
  onClose: r
}) {
  const { api: s, useWebSocket: a } = i, [o, l] = Ue([]), d = dr(async () => {
    if (e)
      try {
        const m = await s.getSignatureHistory(t, e);
        l(Array.isArray(m) ? m : []);
      } catch {
      }
  }, [e, t]);
  Rt(() => {
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
  }), /* @__PURE__ */ b("div", { className: "signature-modal-overlay", onClick: r, children: /* @__PURE__ */ F("div", { className: "signature-modal", onClick: (m) => m.stopPropagation(), children: [
    /* @__PURE__ */ F("div", { className: "signature-modal-header", children: [
      /* @__PURE__ */ F("span", { children: [
        "Signatures",
        u.length > 0 && /* @__PURE__ */ b("span", { className: "comment-count-badge", children: u.length })
      ] }),
      /* @__PURE__ */ b("button", { className: "comment-close-btn", onClick: r, title: "Close", children: "✕" })
    ] }),
    /* @__PURE__ */ b("div", { className: "signature-modal-body", children: p.length === 0 ? /* @__PURE__ */ b("div", { className: "comment-empty", children: "No signatures on this version" }) : p.map((m) => /* @__PURE__ */ F("div", { className: "sig-group", children: [
      /* @__PURE__ */ F("div", { className: "sig-group-header", children: [
        "Rev ",
        m.iteration === 0 ? m.revision : `${m.revision}.${m.iteration}`
      ] }),
      m.items.map((_, x) => {
        const c = _.meaning || _.MEANING || "", h = _.signed_by || _.SIGNED_BY || _.signedBy || "", E = _.comment || _.COMMENT || "", y = _.signed_at || _.SIGNED_AT || _.signedAt || "", w = y ? new Date(y).toLocaleString(void 0, { dateStyle: "short", timeStyle: "short" }) : "";
        return /* @__PURE__ */ F("div", { className: "sig-entry", children: [
          /* @__PURE__ */ b("span", { className: `sig-meaning-badge ${c === "Rejected" ? "sig-rejected" : "sig-approved"}`, children: c }),
          /* @__PURE__ */ b("span", { className: "sig-by", children: h }),
          E && /* @__PURE__ */ b("span", { className: "sig-comment-text", children: E }),
          /* @__PURE__ */ b("span", { className: "sig-date", children: w })
        ] }, x);
      })
    ] }, m.key)) })
  ] }) });
}
const Ps = /* @__PURE__ */ new Map();
async function oh(i, e) {
  if (Ps.has(i)) return Ps.get(i);
  const t = await e(i);
  return Ps.set(i, t), t;
}
function lh() {
  Ps.clear();
}
/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
const ho = "165", Wi = { ROTATE: 0, DOLLY: 1, PAN: 2 }, Xi = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 }, ch = 0, bl = 1, dh = 2, hd = 1, hh = 2, Qn = 3, pi = 0, vn = 1, kn = 2, ui = 0, pr = 1, Tl = 2, Al = 3, wl = 4, uh = 5, Ci = 100, fh = 101, ph = 102, mh = 103, gh = 104, _h = 200, vh = 201, xh = 202, yh = 203, Ja = 204, eo = 205, Sh = 206, Mh = 207, Eh = 208, bh = 209, Th = 210, Ah = 211, wh = 212, Rh = 213, Ch = 214, Ph = 0, Lh = 1, Nh = 2, Ds = 3, Ih = 4, Dh = 5, Uh = 6, Oh = 7, uo = 0, Fh = 1, Bh = 2, fi = 0, zh = 1, kh = 2, Vh = 3, Hh = 4, Gh = 5, Wh = 6, Xh = 7, ud = 300, _r = 301, vr = 302, to = 303, no = 304, Gs = 306, io = 1e3, Ni = 1001, ro = 1002, wn = 1003, Yh = 1004, ts = 1005, In = 1006, ua = 1007, Ii = 1008, mi = 1009, qh = 1010, jh = 1011, Us = 1012, fd = 1013, xr = 1014, hi = 1015, Ws = 1016, pd = 1017, md = 1018, yr = 1020, Kh = 35902, $h = 1021, Zh = 1022, Hn = 1023, Qh = 1024, Jh = 1025, mr = 1026, Sr = 1027, eu = 1028, gd = 1029, tu = 1030, _d = 1031, vd = 1033, fa = 33776, pa = 33777, ma = 33778, ga = 33779, Rl = 35840, Cl = 35841, Pl = 35842, Ll = 35843, Nl = 36196, Il = 37492, Dl = 37496, Ul = 37808, Ol = 37809, Fl = 37810, Bl = 37811, zl = 37812, kl = 37813, Vl = 37814, Hl = 37815, Gl = 37816, Wl = 37817, Xl = 37818, Yl = 37819, ql = 37820, jl = 37821, _a = 36492, Kl = 36494, $l = 36495, nu = 36283, Zl = 36284, Ql = 36285, Jl = 36286, iu = 3200, ru = 3201, xd = 0, su = 1, di = "", Bn = "srgb", _i = "srgb-linear", fo = "display-p3", Xs = "display-p3-linear", Os = "linear", It = "srgb", Fs = "rec709", Bs = "p3", Yi = 7680, ec = 519, au = 512, ou = 513, lu = 514, yd = 515, cu = 516, du = 517, hu = 518, uu = 519, tc = 35044, nc = "300 es", ei = 2e3, zs = 2001;
class Oi {
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
const an = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"], Ls = Math.PI / 180, so = 180 / Math.PI;
function Yr() {
  const i = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
  return (an[i & 255] + an[i >> 8 & 255] + an[i >> 16 & 255] + an[i >> 24 & 255] + "-" + an[e & 255] + an[e >> 8 & 255] + "-" + an[e >> 16 & 15 | 64] + an[e >> 24 & 255] + "-" + an[t & 63 | 128] + an[t >> 8 & 255] + "-" + an[t >> 16 & 255] + an[t >> 24 & 255] + an[n & 255] + an[n >> 8 & 255] + an[n >> 16 & 255] + an[n >> 24 & 255]).toLowerCase();
}
function gn(i, e, t) {
  return Math.max(e, Math.min(t, i));
}
function fu(i, e) {
  return (i % e + e) % e;
}
function va(i, e, t) {
  return (1 - t) * i + t * e;
}
function Nr(i, e) {
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
function _n(i, e) {
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
const pu = {
  DEG2RAD: Ls
};
class Ke {
  constructor(e = 0, t = 0) {
    Ke.prototype.isVector2 = !0, this.x = e, this.y = t;
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
    return Math.acos(gn(n, -1, 1));
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
class ot {
  constructor(e, t, n, r, s, a, o, l, d) {
    ot.prototype.isMatrix3 = !0, this.elements = [
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
    const n = e.elements, r = t.elements, s = this.elements, a = n[0], o = n[3], l = n[6], d = n[1], u = n[4], p = n[7], f = n[2], m = n[5], _ = n[8], x = r[0], c = r[3], h = r[6], E = r[1], y = r[4], w = r[7], I = r[2], R = r[5], C = r[8];
    return s[0] = a * x + o * E + l * I, s[3] = a * c + o * y + l * R, s[6] = a * h + o * w + l * C, s[1] = d * x + u * E + p * I, s[4] = d * c + u * y + p * R, s[7] = d * h + u * w + p * C, s[2] = f * x + m * E + _ * I, s[5] = f * c + m * y + _ * R, s[8] = f * h + m * w + _ * C, this;
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
    return this.premultiply(xa.makeScale(e, t)), this;
  }
  rotate(e) {
    return this.premultiply(xa.makeRotation(-e)), this;
  }
  translate(e, t) {
    return this.premultiply(xa.makeTranslation(e, t)), this;
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
const xa = /* @__PURE__ */ new ot();
function Sd(i) {
  for (let e = i.length - 1; e >= 0; --e)
    if (i[e] >= 65535) return !0;
  return !1;
}
function ks(i) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", i);
}
function mu() {
  const i = ks("canvas");
  return i.style.display = "block", i;
}
const ic = {};
function Md(i) {
  i in ic || (ic[i] = !0, console.warn(i));
}
function gu(i, e, t) {
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
const rc = /* @__PURE__ */ new ot().set(
  0.8224621,
  0.177538,
  0,
  0.0331941,
  0.9668058,
  0,
  0.0170827,
  0.0723974,
  0.9105199
), sc = /* @__PURE__ */ new ot().set(
  1.2249401,
  -0.2249404,
  0,
  -0.0420569,
  1.0420571,
  0,
  -0.0196376,
  -0.0786361,
  1.0982735
), ns = {
  [_i]: {
    transfer: Os,
    primaries: Fs,
    toReference: (i) => i,
    fromReference: (i) => i
  },
  [Bn]: {
    transfer: It,
    primaries: Fs,
    toReference: (i) => i.convertSRGBToLinear(),
    fromReference: (i) => i.convertLinearToSRGB()
  },
  [Xs]: {
    transfer: Os,
    primaries: Bs,
    toReference: (i) => i.applyMatrix3(sc),
    fromReference: (i) => i.applyMatrix3(rc)
  },
  [fo]: {
    transfer: It,
    primaries: Bs,
    toReference: (i) => i.convertSRGBToLinear().applyMatrix3(sc),
    fromReference: (i) => i.applyMatrix3(rc).convertLinearToSRGB()
  }
}, _u = /* @__PURE__ */ new Set([_i, Xs]), xt = {
  enabled: !0,
  _workingColorSpace: _i,
  get workingColorSpace() {
    return this._workingColorSpace;
  },
  set workingColorSpace(i) {
    if (!_u.has(i))
      throw new Error(`Unsupported working color space, "${i}".`);
    this._workingColorSpace = i;
  },
  convert: function(i, e, t) {
    if (this.enabled === !1 || e === t || !e || !t)
      return i;
    const n = ns[e].toReference, r = ns[t].fromReference;
    return r(n(i));
  },
  fromWorkingColorSpace: function(i, e) {
    return this.convert(i, this._workingColorSpace, e);
  },
  toWorkingColorSpace: function(i, e) {
    return this.convert(i, e, this._workingColorSpace);
  },
  getPrimaries: function(i) {
    return ns[i].primaries;
  },
  getTransfer: function(i) {
    return i === di ? Os : ns[i].transfer;
  }
};
function gr(i) {
  return i < 0.04045 ? i * 0.0773993808 : Math.pow(i * 0.9478672986 + 0.0521327014, 2.4);
}
function ya(i) {
  return i < 31308e-7 ? i * 12.92 : 1.055 * Math.pow(i, 0.41666) - 0.055;
}
let qi;
class vu {
  static getDataURL(e) {
    if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u")
      return e.src;
    let t;
    if (e instanceof HTMLCanvasElement)
      t = e;
    else {
      qi === void 0 && (qi = ks("canvas")), qi.width = e.width, qi.height = e.height;
      const n = qi.getContext("2d");
      e instanceof ImageData ? n.putImageData(e, 0, 0) : n.drawImage(e, 0, 0, e.width, e.height), t = qi;
    }
    return t.width > 2048 || t.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", e), t.toDataURL("image/jpeg", 0.6)) : t.toDataURL("image/png");
  }
  static sRGBToLinear(e) {
    if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
      const t = ks("canvas");
      t.width = e.width, t.height = e.height;
      const n = t.getContext("2d");
      n.drawImage(e, 0, 0, e.width, e.height);
      const r = n.getImageData(0, 0, e.width, e.height), s = r.data;
      for (let a = 0; a < s.length; a++)
        s[a] = gr(s[a] / 255) * 255;
      return n.putImageData(r, 0, 0), t;
    } else if (e.data) {
      const t = e.data.slice(0);
      for (let n = 0; n < t.length; n++)
        t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[n] = Math.floor(gr(t[n] / 255) * 255) : t[n] = gr(t[n]);
      return {
        data: t,
        width: e.width,
        height: e.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
  }
}
let xu = 0;
class Ed {
  constructor(e = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: xu++ }), this.uuid = Yr(), this.data = e, this.dataReady = !0, this.version = 0;
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
          r[a].isDataTexture ? s.push(Sa(r[a].image)) : s.push(Sa(r[a]));
      } else
        s = Sa(r);
      n.url = s;
    }
    return t || (e.images[this.uuid] = n), n;
  }
}
function Sa(i) {
  return typeof HTMLImageElement < "u" && i instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && i instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && i instanceof ImageBitmap ? vu.getDataURL(i) : i.data ? {
    data: Array.from(i.data),
    width: i.width,
    height: i.height,
    type: i.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let yu = 0;
class xn extends Oi {
  constructor(e = xn.DEFAULT_IMAGE, t = xn.DEFAULT_MAPPING, n = Ni, r = Ni, s = In, a = Ii, o = Hn, l = mi, d = xn.DEFAULT_ANISOTROPY, u = di) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: yu++ }), this.uuid = Yr(), this.name = "", this.source = new Ed(e), this.mipmaps = [], this.mapping = t, this.channel = 0, this.wrapS = n, this.wrapT = r, this.magFilter = s, this.minFilter = a, this.anisotropy = d, this.format = o, this.internalFormat = null, this.type = l, this.offset = new Ke(0, 0), this.repeat = new Ke(1, 1), this.center = new Ke(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new ot(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = u, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.pmremVersion = 0;
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
    if (this.mapping !== ud) return e;
    if (e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1)
      switch (this.wrapS) {
        case io:
          e.x = e.x - Math.floor(e.x);
          break;
        case Ni:
          e.x = e.x < 0 ? 0 : 1;
          break;
        case ro:
          Math.abs(Math.floor(e.x) % 2) === 1 ? e.x = Math.ceil(e.x) - e.x : e.x = e.x - Math.floor(e.x);
          break;
      }
    if (e.y < 0 || e.y > 1)
      switch (this.wrapT) {
        case io:
          e.y = e.y - Math.floor(e.y);
          break;
        case Ni:
          e.y = e.y < 0 ? 0 : 1;
          break;
        case ro:
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
xn.DEFAULT_IMAGE = null;
xn.DEFAULT_MAPPING = ud;
xn.DEFAULT_ANISOTROPY = 1;
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
    let E = Math.sqrt((c - _) * (c - _) + (p - x) * (p - x) + (f - u) * (f - u));
    return Math.abs(E) < 1e-3 && (E = 1), this.x = (c - _) / E, this.y = (p - x) / E, this.z = (f - u) / E, this.w = Math.acos((d + m + h - 1) / 2), this;
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
class Su extends Oi {
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
    const s = new xn(r, n.mapping, n.wrapS, n.wrapT, n.magFilter, n.minFilter, n.format, n.type, n.anisotropy, n.colorSpace);
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
    return this.texture.source = new Ed(t), this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class Ui extends Su {
  constructor(e = 1, t = 1, n = {}) {
    super(e, t, n), this.isWebGLRenderTarget = !0;
  }
}
class bd extends xn {
  constructor(e = null, t = 1, n = 1, r = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = { data: e, width: t, height: n, depth: r }, this.magFilter = wn, this.minFilter = wn, this.wrapR = Ni, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
  }
  addLayerUpdate(e) {
    this.layerUpdates.add(e);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}
class Mu extends xn {
  constructor(e = null, t = 1, n = 1, r = 1) {
    super(null), this.isData3DTexture = !0, this.image = { data: e, width: t, height: n, depth: r }, this.magFilter = wn, this.minFilter = wn, this.wrapR = Ni, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
class qt {
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
      const h = l * f + d * m + u * _ + p * x, E = h >= 0 ? 1 : -1, y = 1 - h * h;
      if (y > Number.EPSILON) {
        const I = Math.sqrt(y), R = Math.atan2(I, h * E);
        c = Math.sin(c * R) / I, o = Math.sin(o * R) / I;
      }
      const w = o * E;
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
    return 2 * Math.acos(Math.abs(gn(this.dot(e), -1, 1)));
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
    return this.applyQuaternion(ac.setFromEuler(e));
  }
  applyAxisAngle(e, t) {
    return this.applyQuaternion(ac.setFromAxisAngle(e, t));
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
    return Ma.copy(this).projectOnVector(e), this.sub(Ma);
  }
  reflect(e) {
    return this.sub(Ma.copy(e).multiplyScalar(2 * this.dot(e)));
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const n = this.dot(e) / t;
    return Math.acos(gn(n, -1, 1));
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
const Ma = /* @__PURE__ */ new N(), ac = /* @__PURE__ */ new qt();
class qr {
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
        e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), is.copy(e.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), is.copy(n.boundingBox)), is.applyMatrix4(e.matrixWorld), this.union(is);
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
    this.getCenter(Ir), rs.subVectors(this.max, Ir), ji.subVectors(e.a, Ir), Ki.subVectors(e.b, Ir), $i.subVectors(e.c, Ir), ni.subVectors(Ki, ji), ii.subVectors($i, Ki), yi.subVectors(ji, $i);
    let t = [
      0,
      -ni.z,
      ni.y,
      0,
      -ii.z,
      ii.y,
      0,
      -yi.z,
      yi.y,
      ni.z,
      0,
      -ni.x,
      ii.z,
      0,
      -ii.x,
      yi.z,
      0,
      -yi.x,
      -ni.y,
      ni.x,
      0,
      -ii.y,
      ii.x,
      0,
      -yi.y,
      yi.x,
      0
    ];
    return !Ea(t, ji, Ki, $i, rs) || (t = [1, 0, 0, 0, 1, 0, 0, 0, 1], !Ea(t, ji, Ki, $i, rs)) ? !1 : (ss.crossVectors(ni, ii), t = [ss.x, ss.y, ss.z], Ea(t, ji, Ki, $i, rs));
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
    return this.isEmpty() ? this : (qn[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), qn[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), qn[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), qn[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), qn[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), qn[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), qn[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), qn[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(qn), this);
  }
  translate(e) {
    return this.min.add(e), this.max.add(e), this;
  }
  equals(e) {
    return e.min.equals(this.min) && e.max.equals(this.max);
  }
}
const qn = [
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N()
], Pn = /* @__PURE__ */ new N(), is = /* @__PURE__ */ new qr(), ji = /* @__PURE__ */ new N(), Ki = /* @__PURE__ */ new N(), $i = /* @__PURE__ */ new N(), ni = /* @__PURE__ */ new N(), ii = /* @__PURE__ */ new N(), yi = /* @__PURE__ */ new N(), Ir = /* @__PURE__ */ new N(), rs = /* @__PURE__ */ new N(), ss = /* @__PURE__ */ new N(), Si = /* @__PURE__ */ new N();
function Ea(i, e, t, n, r) {
  for (let s = 0, a = i.length - 3; s <= a; s += 3) {
    Si.fromArray(i, s);
    const o = r.x * Math.abs(Si.x) + r.y * Math.abs(Si.y) + r.z * Math.abs(Si.z), l = e.dot(Si), d = t.dot(Si), u = n.dot(Si);
    if (Math.max(-Math.max(l, d, u), Math.min(l, d, u)) > o)
      return !1;
  }
  return !0;
}
const Eu = /* @__PURE__ */ new qr(), Dr = /* @__PURE__ */ new N(), ba = /* @__PURE__ */ new N();
class Ys {
  constructor(e = new N(), t = -1) {
    this.isSphere = !0, this.center = e, this.radius = t;
  }
  set(e, t) {
    return this.center.copy(e), this.radius = t, this;
  }
  setFromPoints(e, t) {
    const n = this.center;
    t !== void 0 ? n.copy(t) : Eu.setFromPoints(e).getCenter(n);
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
    Dr.subVectors(e, this.center);
    const t = Dr.lengthSq();
    if (t > this.radius * this.radius) {
      const n = Math.sqrt(t), r = (n - this.radius) * 0.5;
      this.center.addScaledVector(Dr, r / n), this.radius += r;
    }
    return this;
  }
  union(e) {
    return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (ba.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(Dr.copy(e.center).add(ba)), this.expandByPoint(Dr.copy(e.center).sub(ba))), this);
  }
  equals(e) {
    return e.center.equals(this.center) && e.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const jn = /* @__PURE__ */ new N(), Ta = /* @__PURE__ */ new N(), as = /* @__PURE__ */ new N(), ri = /* @__PURE__ */ new N(), Aa = /* @__PURE__ */ new N(), os = /* @__PURE__ */ new N(), wa = /* @__PURE__ */ new N();
class qs {
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
    return this.origin.copy(this.at(e, jn)), this;
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
    const t = jn.subVectors(e, this.origin).dot(this.direction);
    return t < 0 ? this.origin.distanceToSquared(e) : (jn.copy(this.origin).addScaledVector(this.direction, t), jn.distanceToSquared(e));
  }
  distanceSqToSegment(e, t, n, r) {
    Ta.copy(e).add(t).multiplyScalar(0.5), as.copy(t).sub(e).normalize(), ri.copy(this.origin).sub(Ta);
    const s = e.distanceTo(t) * 0.5, a = -this.direction.dot(as), o = ri.dot(this.direction), l = -ri.dot(as), d = ri.lengthSq(), u = Math.abs(1 - a * a);
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
    return n && n.copy(this.origin).addScaledVector(this.direction, p), r && r.copy(Ta).addScaledVector(as, f), m;
  }
  intersectSphere(e, t) {
    jn.subVectors(e.center, this.origin);
    const n = jn.dot(this.direction), r = jn.dot(jn) - n * n, s = e.radius * e.radius;
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
    return this.intersectBox(e, jn) !== null;
  }
  intersectTriangle(e, t, n, r, s) {
    Aa.subVectors(t, e), os.subVectors(n, e), wa.crossVectors(Aa, os);
    let a = this.direction.dot(wa), o;
    if (a > 0) {
      if (r) return null;
      o = 1;
    } else if (a < 0)
      o = -1, a = -a;
    else
      return null;
    ri.subVectors(this.origin, e);
    const l = o * this.direction.dot(os.crossVectors(ri, os));
    if (l < 0)
      return null;
    const d = o * this.direction.dot(Aa.cross(ri));
    if (d < 0 || l + d > a)
      return null;
    const u = -o * ri.dot(wa);
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
class Et {
  constructor(e, t, n, r, s, a, o, l, d, u, p, f, m, _, x, c) {
    Et.prototype.isMatrix4 = !0, this.elements = [
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
    return new Et().fromArray(this.elements);
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
    const t = this.elements, n = e.elements, r = 1 / Zi.setFromMatrixColumn(e, 0).length(), s = 1 / Zi.setFromMatrixColumn(e, 1).length(), a = 1 / Zi.setFromMatrixColumn(e, 2).length();
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
    return this.compose(bu, e, Tu);
  }
  lookAt(e, t, n) {
    const r = this.elements;
    return yn.subVectors(e, t), yn.lengthSq() === 0 && (yn.z = 1), yn.normalize(), si.crossVectors(n, yn), si.lengthSq() === 0 && (Math.abs(n.z) === 1 ? yn.x += 1e-4 : yn.z += 1e-4, yn.normalize(), si.crossVectors(n, yn)), si.normalize(), ls.crossVectors(yn, si), r[0] = si.x, r[4] = ls.x, r[8] = yn.x, r[1] = si.y, r[5] = ls.y, r[9] = yn.y, r[2] = si.z, r[6] = ls.z, r[10] = yn.z, this;
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, t) {
    const n = e.elements, r = t.elements, s = this.elements, a = n[0], o = n[4], l = n[8], d = n[12], u = n[1], p = n[5], f = n[9], m = n[13], _ = n[2], x = n[6], c = n[10], h = n[14], E = n[3], y = n[7], w = n[11], I = n[15], R = r[0], C = r[4], U = r[8], A = r[12], v = r[1], L = r[5], k = r[9], V = r[13], W = r[2], Q = r[6], j = r[10], ie = r[14], K = r[3], de = r[7], ve = r[11], Ee = r[15];
    return s[0] = a * R + o * v + l * W + d * K, s[4] = a * C + o * L + l * Q + d * de, s[8] = a * U + o * k + l * j + d * ve, s[12] = a * A + o * V + l * ie + d * Ee, s[1] = u * R + p * v + f * W + m * K, s[5] = u * C + p * L + f * Q + m * de, s[9] = u * U + p * k + f * j + m * ve, s[13] = u * A + p * V + f * ie + m * Ee, s[2] = _ * R + x * v + c * W + h * K, s[6] = _ * C + x * L + c * Q + h * de, s[10] = _ * U + x * k + c * j + h * ve, s[14] = _ * A + x * V + c * ie + h * Ee, s[3] = E * R + y * v + w * W + I * K, s[7] = E * C + y * L + w * Q + I * de, s[11] = E * U + y * k + w * j + I * ve, s[15] = E * A + y * V + w * ie + I * Ee, this;
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
    const e = this.elements, t = e[0], n = e[1], r = e[2], s = e[3], a = e[4], o = e[5], l = e[6], d = e[7], u = e[8], p = e[9], f = e[10], m = e[11], _ = e[12], x = e[13], c = e[14], h = e[15], E = p * c * d - x * f * d + x * l * m - o * c * m - p * l * h + o * f * h, y = _ * f * d - u * c * d - _ * l * m + a * c * m + u * l * h - a * f * h, w = u * x * d - _ * p * d + _ * o * m - a * x * m - u * o * h + a * p * h, I = _ * p * l - u * x * l - _ * o * f + a * x * f + u * o * c - a * p * c, R = t * E + n * y + r * w + s * I;
    if (R === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const C = 1 / R;
    return e[0] = E * C, e[1] = (x * f * s - p * c * s - x * r * m + n * c * m + p * r * h - n * f * h) * C, e[2] = (o * c * s - x * l * s + x * r * d - n * c * d - o * r * h + n * l * h) * C, e[3] = (p * l * s - o * f * s - p * r * d + n * f * d + o * r * m - n * l * m) * C, e[4] = y * C, e[5] = (u * c * s - _ * f * s + _ * r * m - t * c * m - u * r * h + t * f * h) * C, e[6] = (_ * l * s - a * c * s - _ * r * d + t * c * d + a * r * h - t * l * h) * C, e[7] = (a * f * s - u * l * s + u * r * d - t * f * d - a * r * m + t * l * m) * C, e[8] = w * C, e[9] = (_ * p * s - u * x * s - _ * n * m + t * x * m + u * n * h - t * p * h) * C, e[10] = (a * x * s - _ * o * s + _ * n * d - t * x * d - a * n * h + t * o * h) * C, e[11] = (u * o * s - a * p * s - u * n * d + t * p * d + a * n * m - t * o * m) * C, e[12] = I * C, e[13] = (u * x * r - _ * p * r + _ * n * f - t * x * f - u * n * c + t * p * c) * C, e[14] = (_ * o * r - a * x * r - _ * n * l + t * x * l + a * n * c - t * o * c) * C, e[15] = (a * p * r - u * o * r + u * n * l - t * p * l - a * n * f + t * o * f) * C, this;
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
    const r = this.elements, s = t._x, a = t._y, o = t._z, l = t._w, d = s + s, u = a + a, p = o + o, f = s * d, m = s * u, _ = s * p, x = a * u, c = a * p, h = o * p, E = l * d, y = l * u, w = l * p, I = n.x, R = n.y, C = n.z;
    return r[0] = (1 - (x + h)) * I, r[1] = (m + w) * I, r[2] = (_ - y) * I, r[3] = 0, r[4] = (m - w) * R, r[5] = (1 - (f + h)) * R, r[6] = (c + E) * R, r[7] = 0, r[8] = (_ + y) * C, r[9] = (c - E) * C, r[10] = (1 - (f + x)) * C, r[11] = 0, r[12] = e.x, r[13] = e.y, r[14] = e.z, r[15] = 1, this;
  }
  decompose(e, t, n) {
    const r = this.elements;
    let s = Zi.set(r[0], r[1], r[2]).length();
    const a = Zi.set(r[4], r[5], r[6]).length(), o = Zi.set(r[8], r[9], r[10]).length();
    this.determinant() < 0 && (s = -s), e.x = r[12], e.y = r[13], e.z = r[14], Ln.copy(this);
    const d = 1 / s, u = 1 / a, p = 1 / o;
    return Ln.elements[0] *= d, Ln.elements[1] *= d, Ln.elements[2] *= d, Ln.elements[4] *= u, Ln.elements[5] *= u, Ln.elements[6] *= u, Ln.elements[8] *= p, Ln.elements[9] *= p, Ln.elements[10] *= p, t.setFromRotationMatrix(Ln), n.x = s, n.y = a, n.z = o, this;
  }
  makePerspective(e, t, n, r, s, a, o = ei) {
    const l = this.elements, d = 2 * s / (t - e), u = 2 * s / (n - r), p = (t + e) / (t - e), f = (n + r) / (n - r);
    let m, _;
    if (o === ei)
      m = -(a + s) / (a - s), _ = -2 * a * s / (a - s);
    else if (o === zs)
      m = -a / (a - s), _ = -a * s / (a - s);
    else
      throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
    return l[0] = d, l[4] = 0, l[8] = p, l[12] = 0, l[1] = 0, l[5] = u, l[9] = f, l[13] = 0, l[2] = 0, l[6] = 0, l[10] = m, l[14] = _, l[3] = 0, l[7] = 0, l[11] = -1, l[15] = 0, this;
  }
  makeOrthographic(e, t, n, r, s, a, o = ei) {
    const l = this.elements, d = 1 / (t - e), u = 1 / (n - r), p = 1 / (a - s), f = (t + e) * d, m = (n + r) * u;
    let _, x;
    if (o === ei)
      _ = (a + s) * p, x = -2 * p;
    else if (o === zs)
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
const Zi = /* @__PURE__ */ new N(), Ln = /* @__PURE__ */ new Et(), bu = /* @__PURE__ */ new N(0, 0, 0), Tu = /* @__PURE__ */ new N(1, 1, 1), si = /* @__PURE__ */ new N(), ls = /* @__PURE__ */ new N(), yn = /* @__PURE__ */ new N(), oc = /* @__PURE__ */ new Et(), lc = /* @__PURE__ */ new qt();
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
        this._y = Math.asin(gn(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-u, m), this._z = Math.atan2(-a, s)) : (this._x = Math.atan2(f, d), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-gn(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._y = Math.atan2(o, m), this._z = Math.atan2(l, d)) : (this._y = Math.atan2(-p, s), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(gn(f, -1, 1)), Math.abs(f) < 0.9999999 ? (this._y = Math.atan2(-p, m), this._z = Math.atan2(-a, d)) : (this._y = 0, this._z = Math.atan2(l, s));
        break;
      case "ZYX":
        this._y = Math.asin(-gn(p, -1, 1)), Math.abs(p) < 0.9999999 ? (this._x = Math.atan2(f, m), this._z = Math.atan2(l, s)) : (this._x = 0, this._z = Math.atan2(-a, d));
        break;
      case "YZX":
        this._z = Math.asin(gn(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-u, d), this._y = Math.atan2(-p, s)) : (this._x = 0, this._y = Math.atan2(o, m));
        break;
      case "XZY":
        this._z = Math.asin(-gn(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(f, d), this._y = Math.atan2(o, s)) : (this._x = Math.atan2(-u, m), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + t);
    }
    return this._order = t, n === !0 && this._onChangeCallback(), this;
  }
  setFromQuaternion(e, t, n) {
    return oc.makeRotationFromQuaternion(e), this.setFromRotationMatrix(oc, t, n);
  }
  setFromVector3(e, t = this._order) {
    return this.set(e.x, e.y, e.z, t);
  }
  reorder(e) {
    return lc.setFromEuler(this), this.setFromQuaternion(lc, e);
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
class po {
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
let Au = 0;
const cc = /* @__PURE__ */ new N(), Qi = /* @__PURE__ */ new qt(), Kn = /* @__PURE__ */ new Et(), cs = /* @__PURE__ */ new N(), Ur = /* @__PURE__ */ new N(), wu = /* @__PURE__ */ new N(), Ru = /* @__PURE__ */ new qt(), dc = /* @__PURE__ */ new N(1, 0, 0), hc = /* @__PURE__ */ new N(0, 1, 0), uc = /* @__PURE__ */ new N(0, 0, 1), fc = { type: "added" }, Cu = { type: "removed" }, Ji = { type: "childadded", child: null }, Ra = { type: "childremoved", child: null };
class Yt extends Oi {
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: Au++ }), this.uuid = Yr(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = Yt.DEFAULT_UP.clone();
    const e = new N(), t = new En(), n = new qt(), r = new N(1, 1, 1);
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
        value: new Et()
      },
      normalMatrix: {
        value: new ot()
      }
    }), this.matrix = new Et(), this.matrixWorld = new Et(), this.matrixAutoUpdate = Yt.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = Yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new po(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
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
    return Qi.setFromAxisAngle(e, t), this.quaternion.multiply(Qi), this;
  }
  rotateOnWorldAxis(e, t) {
    return Qi.setFromAxisAngle(e, t), this.quaternion.premultiply(Qi), this;
  }
  rotateX(e) {
    return this.rotateOnAxis(dc, e);
  }
  rotateY(e) {
    return this.rotateOnAxis(hc, e);
  }
  rotateZ(e) {
    return this.rotateOnAxis(uc, e);
  }
  translateOnAxis(e, t) {
    return cc.copy(e).applyQuaternion(this.quaternion), this.position.add(cc.multiplyScalar(t)), this;
  }
  translateX(e) {
    return this.translateOnAxis(dc, e);
  }
  translateY(e) {
    return this.translateOnAxis(hc, e);
  }
  translateZ(e) {
    return this.translateOnAxis(uc, e);
  }
  localToWorld(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(Kn.copy(this.matrixWorld).invert());
  }
  lookAt(e, t, n) {
    e.isVector3 ? cs.copy(e) : cs.set(e, t, n);
    const r = this.parent;
    this.updateWorldMatrix(!0, !1), Ur.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Kn.lookAt(Ur, cs, this.up) : Kn.lookAt(cs, Ur, this.up), this.quaternion.setFromRotationMatrix(Kn), r && (Kn.extractRotation(r.matrixWorld), Qi.setFromRotationMatrix(Kn), this.quaternion.premultiply(Qi.invert()));
  }
  add(e) {
    if (arguments.length > 1) {
      for (let t = 0; t < arguments.length; t++)
        this.add(arguments[t]);
      return this;
    }
    return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent(fc), Ji.child = e, this.dispatchEvent(Ji), Ji.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this);
  }
  remove(e) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++)
        this.remove(arguments[n]);
      return this;
    }
    const t = this.children.indexOf(e);
    return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(Cu), Ra.child = e, this.dispatchEvent(Ra), Ra.child = null), this;
  }
  removeFromParent() {
    const e = this.parent;
    return e !== null && e.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(e) {
    return this.updateWorldMatrix(!0, !1), Kn.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), Kn.multiply(e.parent.matrixWorld)), e.applyMatrix4(Kn), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent(fc), Ji.child = e, this.dispatchEvent(Ji), Ji.child = null, this;
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
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Ur, e, wu), e;
  }
  getWorldScale(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Ur, Ru, e), e;
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
Yt.DEFAULT_UP = /* @__PURE__ */ new N(0, 1, 0);
Yt.DEFAULT_MATRIX_AUTO_UPDATE = !0;
Yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const Nn = /* @__PURE__ */ new N(), $n = /* @__PURE__ */ new N(), Ca = /* @__PURE__ */ new N(), Zn = /* @__PURE__ */ new N(), er = /* @__PURE__ */ new N(), tr = /* @__PURE__ */ new N(), pc = /* @__PURE__ */ new N(), Pa = /* @__PURE__ */ new N(), La = /* @__PURE__ */ new N(), Na = /* @__PURE__ */ new N();
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
    Nn.subVectors(r, t), $n.subVectors(n, t), Ca.subVectors(e, t);
    const a = Nn.dot(Nn), o = Nn.dot($n), l = Nn.dot(Ca), d = $n.dot($n), u = $n.dot(Ca), p = a * d - o * o;
    if (p === 0)
      return s.set(0, 0, 0), null;
    const f = 1 / p, m = (d * l - o * u) * f, _ = (a * u - o * l) * f;
    return s.set(1 - m - _, _, m);
  }
  static containsPoint(e, t, n, r) {
    return this.getBarycoord(e, t, n, r, Zn) === null ? !1 : Zn.x >= 0 && Zn.y >= 0 && Zn.x + Zn.y <= 1;
  }
  static getInterpolation(e, t, n, r, s, a, o, l) {
    return this.getBarycoord(e, t, n, r, Zn) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(s, Zn.x), l.addScaledVector(a, Zn.y), l.addScaledVector(o, Zn.z), l);
  }
  static isFrontFacing(e, t, n, r) {
    return Nn.subVectors(n, t), $n.subVectors(e, t), Nn.cross($n).dot(r) < 0;
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
    return Nn.subVectors(this.c, this.b), $n.subVectors(this.a, this.b), Nn.cross($n).length() * 0.5;
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
    er.subVectors(r, n), tr.subVectors(s, n), Pa.subVectors(e, n);
    const l = er.dot(Pa), d = tr.dot(Pa);
    if (l <= 0 && d <= 0)
      return t.copy(n);
    La.subVectors(e, r);
    const u = er.dot(La), p = tr.dot(La);
    if (u >= 0 && p <= u)
      return t.copy(r);
    const f = l * p - u * d;
    if (f <= 0 && l >= 0 && u <= 0)
      return a = l / (l - u), t.copy(n).addScaledVector(er, a);
    Na.subVectors(e, s);
    const m = er.dot(Na), _ = tr.dot(Na);
    if (_ >= 0 && m <= _)
      return t.copy(s);
    const x = m * d - l * _;
    if (x <= 0 && d >= 0 && _ <= 0)
      return o = d / (d - _), t.copy(n).addScaledVector(tr, o);
    const c = u * _ - m * p;
    if (c <= 0 && p - u >= 0 && m - _ >= 0)
      return pc.subVectors(s, r), o = (p - u) / (p - u + (m - _)), t.copy(r).addScaledVector(pc, o);
    const h = 1 / (c + x + f);
    return a = x * h, o = f * h, t.copy(n).addScaledVector(er, a).addScaledVector(tr, o);
  }
  equals(e) {
    return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
  }
}
const Td = {
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
}, ai = { h: 0, s: 0, l: 0 }, ds = { h: 0, s: 0, l: 0 };
function Ia(i, e, t) {
  return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? i + (e - i) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? i + (e - i) * 6 * (2 / 3 - t) : i;
}
class ft {
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
    return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, xt.toWorkingColorSpace(this, t), this;
  }
  setRGB(e, t, n, r = xt.workingColorSpace) {
    return this.r = e, this.g = t, this.b = n, xt.toWorkingColorSpace(this, r), this;
  }
  setHSL(e, t, n, r = xt.workingColorSpace) {
    if (e = fu(e, 1), t = gn(t, 0, 1), n = gn(n, 0, 1), t === 0)
      this.r = this.g = this.b = n;
    else {
      const s = n <= 0.5 ? n * (1 + t) : n + t - n * t, a = 2 * n - s;
      this.r = Ia(a, s, e + 1 / 3), this.g = Ia(a, s, e), this.b = Ia(a, s, e - 1 / 3);
    }
    return xt.toWorkingColorSpace(this, r), this;
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
    const n = Td[e.toLowerCase()];
    return n !== void 0 ? this.setHex(n, t) : console.warn("THREE.Color: Unknown color " + e), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(e) {
    return this.r = e.r, this.g = e.g, this.b = e.b, this;
  }
  copySRGBToLinear(e) {
    return this.r = gr(e.r), this.g = gr(e.g), this.b = gr(e.b), this;
  }
  copyLinearToSRGB(e) {
    return this.r = ya(e.r), this.g = ya(e.g), this.b = ya(e.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(e = Bn) {
    return xt.fromWorkingColorSpace(on.copy(this), e), Math.round(gn(on.r * 255, 0, 255)) * 65536 + Math.round(gn(on.g * 255, 0, 255)) * 256 + Math.round(gn(on.b * 255, 0, 255));
  }
  getHexString(e = Bn) {
    return ("000000" + this.getHex(e).toString(16)).slice(-6);
  }
  getHSL(e, t = xt.workingColorSpace) {
    xt.fromWorkingColorSpace(on.copy(this), t);
    const n = on.r, r = on.g, s = on.b, a = Math.max(n, r, s), o = Math.min(n, r, s);
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
  getRGB(e, t = xt.workingColorSpace) {
    return xt.fromWorkingColorSpace(on.copy(this), t), e.r = on.r, e.g = on.g, e.b = on.b, e;
  }
  getStyle(e = Bn) {
    xt.fromWorkingColorSpace(on.copy(this), e);
    const t = on.r, n = on.g, r = on.b;
    return e !== Bn ? `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})` : `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(r * 255)})`;
  }
  offsetHSL(e, t, n) {
    return this.getHSL(ai), this.setHSL(ai.h + e, ai.s + t, ai.l + n);
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
    this.getHSL(ai), e.getHSL(ds);
    const n = va(ai.h, ds.h, t), r = va(ai.s, ds.s, t), s = va(ai.l, ds.l, t);
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
const on = /* @__PURE__ */ new ft();
ft.NAMES = Td;
let Pu = 0;
class Er extends Oi {
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Pu++ }), this.uuid = Yr(), this.name = "", this.type = "Material", this.blending = pr, this.side = pi, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = Ja, this.blendDst = eo, this.blendEquation = Ci, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new ft(0, 0, 0), this.blendAlpha = 0, this.depthFunc = Ds, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = ec, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = Yi, this.stencilZFail = Yi, this.stencilZPass = Yi, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
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
    n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(e).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(e).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(e).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(e).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(e).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(e).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== pr && (n.blending = this.blending), this.side !== pi && (n.side = this.side), this.vertexColors === !0 && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = !0), this.blendSrc !== Ja && (n.blendSrc = this.blendSrc), this.blendDst !== eo && (n.blendDst = this.blendDst), this.blendEquation !== Ci && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== Ds && (n.depthFunc = this.depthFunc), this.depthTest === !1 && (n.depthTest = this.depthTest), this.depthWrite === !1 && (n.depthWrite = this.depthWrite), this.colorWrite === !1 && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== ec && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== Yi && (n.stencilFail = this.stencilFail), this.stencilZFail !== Yi && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== Yi && (n.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === !0 && (n.alphaHash = !0), this.alphaToCoverage === !0 && (n.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0), this.forceSinglePass === !0 && (n.forceSinglePass = !0), this.wireframe === !0 && (n.wireframe = !0), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = !0), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
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
class js extends Er {
  constructor(e) {
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new ft(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new En(), this.combine = uo, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
  }
}
const Xt = /* @__PURE__ */ new N(), hs = /* @__PURE__ */ new Ke();
class Gn {
  constructor(e, t, n = !1) {
    if (Array.isArray(e))
      throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = !0, this.name = "", this.array = e, this.itemSize = t, this.count = e !== void 0 ? e.length / t : 0, this.normalized = n, this.usage = tc, this._updateRange = { offset: 0, count: -1 }, this.updateRanges = [], this.gpuType = hi, this.version = 0;
  }
  onUploadCallback() {
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  get updateRange() {
    return Md("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."), this._updateRange;
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
        hs.fromBufferAttribute(this, t), hs.applyMatrix3(e), this.setXY(t, hs.x, hs.y);
    else if (this.itemSize === 3)
      for (let t = 0, n = this.count; t < n; t++)
        Xt.fromBufferAttribute(this, t), Xt.applyMatrix3(e), this.setXYZ(t, Xt.x, Xt.y, Xt.z);
    return this;
  }
  applyMatrix4(e) {
    for (let t = 0, n = this.count; t < n; t++)
      Xt.fromBufferAttribute(this, t), Xt.applyMatrix4(e), this.setXYZ(t, Xt.x, Xt.y, Xt.z);
    return this;
  }
  applyNormalMatrix(e) {
    for (let t = 0, n = this.count; t < n; t++)
      Xt.fromBufferAttribute(this, t), Xt.applyNormalMatrix(e), this.setXYZ(t, Xt.x, Xt.y, Xt.z);
    return this;
  }
  transformDirection(e) {
    for (let t = 0, n = this.count; t < n; t++)
      Xt.fromBufferAttribute(this, t), Xt.transformDirection(e), this.setXYZ(t, Xt.x, Xt.y, Xt.z);
    return this;
  }
  set(e, t = 0) {
    return this.array.set(e, t), this;
  }
  getComponent(e, t) {
    let n = this.array[e * this.itemSize + t];
    return this.normalized && (n = Nr(n, this.array)), n;
  }
  setComponent(e, t, n) {
    return this.normalized && (n = _n(n, this.array)), this.array[e * this.itemSize + t] = n, this;
  }
  getX(e) {
    let t = this.array[e * this.itemSize];
    return this.normalized && (t = Nr(t, this.array)), t;
  }
  setX(e, t) {
    return this.normalized && (t = _n(t, this.array)), this.array[e * this.itemSize] = t, this;
  }
  getY(e) {
    let t = this.array[e * this.itemSize + 1];
    return this.normalized && (t = Nr(t, this.array)), t;
  }
  setY(e, t) {
    return this.normalized && (t = _n(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
  }
  getZ(e) {
    let t = this.array[e * this.itemSize + 2];
    return this.normalized && (t = Nr(t, this.array)), t;
  }
  setZ(e, t) {
    return this.normalized && (t = _n(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
  }
  getW(e) {
    let t = this.array[e * this.itemSize + 3];
    return this.normalized && (t = Nr(t, this.array)), t;
  }
  setW(e, t) {
    return this.normalized && (t = _n(t, this.array)), this.array[e * this.itemSize + 3] = t, this;
  }
  setXY(e, t, n) {
    return e *= this.itemSize, this.normalized && (t = _n(t, this.array), n = _n(n, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this;
  }
  setXYZ(e, t, n, r) {
    return e *= this.itemSize, this.normalized && (t = _n(t, this.array), n = _n(n, this.array), r = _n(r, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = r, this;
  }
  setXYZW(e, t, n, r, s) {
    return e *= this.itemSize, this.normalized && (t = _n(t, this.array), n = _n(n, this.array), r = _n(r, this.array), s = _n(s, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = r, this.array[e + 3] = s, this;
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
    return this.name !== "" && (e.name = this.name), this.usage !== tc && (e.usage = this.usage), e;
  }
}
class Ad extends Gn {
  constructor(e, t, n) {
    super(new Uint16Array(e), t, n);
  }
}
class wd extends Gn {
  constructor(e, t, n) {
    super(new Uint32Array(e), t, n);
  }
}
class At extends Gn {
  constructor(e, t, n) {
    super(new Float32Array(e), t, n);
  }
}
let Lu = 0;
const Tn = /* @__PURE__ */ new Et(), Da = /* @__PURE__ */ new Yt(), nr = /* @__PURE__ */ new N(), Sn = /* @__PURE__ */ new qr(), Or = /* @__PURE__ */ new qr(), Jt = /* @__PURE__ */ new N();
class dn extends Oi {
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: Lu++ }), this.uuid = Yr(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(e) {
    return Array.isArray(e) ? this.index = new (Sd(e) ? wd : Ad)(e, 1) : this.index = e, this;
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
      const s = new ot().getNormalMatrix(e);
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
    return Da.lookAt(e), Da.updateMatrix(), this.applyMatrix4(Da.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(nr).negate(), this.translate(nr.x, nr.y, nr.z), this;
  }
  setFromPoints(e) {
    const t = [];
    for (let n = 0, r = e.length; n < r; n++) {
      const s = e[n];
      t.push(s.x, s.y, s.z || 0);
    }
    return this.setAttribute("position", new At(t, 3)), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new qr());
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
    this.boundingSphere === null && (this.boundingSphere = new Ys());
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
          Or.setFromBufferAttribute(o), this.morphTargetsRelative ? (Jt.addVectors(Sn.min, Or.min), Sn.expandByPoint(Jt), Jt.addVectors(Sn.max, Or.max), Sn.expandByPoint(Jt)) : (Sn.expandByPoint(Or.min), Sn.expandByPoint(Or.max));
        }
      Sn.getCenter(n);
      let r = 0;
      for (let s = 0, a = e.count; s < a; s++)
        Jt.fromBufferAttribute(e, s), r = Math.max(r, n.distanceToSquared(Jt));
      if (t)
        for (let s = 0, a = t.length; s < a; s++) {
          const o = t[s], l = this.morphTargetsRelative;
          for (let d = 0, u = o.count; d < u; d++)
            Jt.fromBufferAttribute(o, d), l && (nr.fromBufferAttribute(e, d), Jt.add(nr)), r = Math.max(r, n.distanceToSquared(Jt));
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
    const d = new N(), u = new N(), p = new N(), f = new Ke(), m = new Ke(), _ = new Ke(), x = new N(), c = new N();
    function h(U, A, v) {
      d.fromBufferAttribute(n, U), u.fromBufferAttribute(n, A), p.fromBufferAttribute(n, v), f.fromBufferAttribute(s, U), m.fromBufferAttribute(s, A), _.fromBufferAttribute(s, v), u.sub(d), p.sub(d), m.sub(f), _.sub(f);
      const L = 1 / (m.x * _.y - _.x * m.y);
      isFinite(L) && (x.copy(u).multiplyScalar(_.y).addScaledVector(p, -m.y).multiplyScalar(L), c.copy(p).multiplyScalar(m.x).addScaledVector(u, -_.x).multiplyScalar(L), o[U].add(x), o[A].add(x), o[v].add(x), l[U].add(c), l[A].add(c), l[v].add(c));
    }
    let E = this.groups;
    E.length === 0 && (E = [{
      start: 0,
      count: e.count
    }]);
    for (let U = 0, A = E.length; U < A; ++U) {
      const v = E[U], L = v.start, k = v.count;
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
    for (let U = 0, A = E.length; U < A; ++U) {
      const v = E[U], L = v.start, k = v.count;
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
    const t = new dn(), n = this.index.array, r = this.attributes;
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
const mc = /* @__PURE__ */ new Et(), Mi = /* @__PURE__ */ new qs(), us = /* @__PURE__ */ new Ys(), gc = /* @__PURE__ */ new N(), ir = /* @__PURE__ */ new N(), rr = /* @__PURE__ */ new N(), sr = /* @__PURE__ */ new N(), Ua = /* @__PURE__ */ new N(), fs = /* @__PURE__ */ new N(), ps = /* @__PURE__ */ new Ke(), ms = /* @__PURE__ */ new Ke(), gs = /* @__PURE__ */ new Ke(), _c = /* @__PURE__ */ new N(), vc = /* @__PURE__ */ new N(), xc = /* @__PURE__ */ new N(), _s = /* @__PURE__ */ new N(), vs = /* @__PURE__ */ new N();
class Te extends Yt {
  constructor(e = new dn(), t = new js()) {
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
      fs.set(0, 0, 0);
      for (let l = 0, d = s.length; l < d; l++) {
        const u = o[l], p = s[l];
        u !== 0 && (Ua.fromBufferAttribute(p, e), a ? fs.addScaledVector(Ua, u) : fs.addScaledVector(Ua.sub(t), u));
      }
      t.add(fs);
    }
    return t;
  }
  raycast(e, t) {
    const n = this.geometry, r = this.material, s = this.matrixWorld;
    r !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), us.copy(n.boundingSphere), us.applyMatrix4(s), Mi.copy(e.ray).recast(e.near), !(us.containsPoint(Mi.origin) === !1 && (Mi.intersectSphere(us, gc) === null || Mi.origin.distanceToSquared(gc) > (e.far - e.near) ** 2)) && (mc.copy(s).invert(), Mi.copy(e.ray).applyMatrix4(mc), !(n.boundingBox !== null && Mi.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(e, t, Mi)));
  }
  _computeIntersections(e, t, n) {
    let r;
    const s = this.geometry, a = this.material, o = s.index, l = s.attributes.position, d = s.attributes.uv, u = s.attributes.uv1, p = s.attributes.normal, f = s.groups, m = s.drawRange;
    if (o !== null)
      if (Array.isArray(a))
        for (let _ = 0, x = f.length; _ < x; _++) {
          const c = f[_], h = a[c.materialIndex], E = Math.max(c.start, m.start), y = Math.min(o.count, Math.min(c.start + c.count, m.start + m.count));
          for (let w = E, I = y; w < I; w += 3) {
            const R = o.getX(w), C = o.getX(w + 1), U = o.getX(w + 2);
            r = xs(this, h, e, n, d, u, p, R, C, U), r && (r.faceIndex = Math.floor(w / 3), r.face.materialIndex = c.materialIndex, t.push(r));
          }
        }
      else {
        const _ = Math.max(0, m.start), x = Math.min(o.count, m.start + m.count);
        for (let c = _, h = x; c < h; c += 3) {
          const E = o.getX(c), y = o.getX(c + 1), w = o.getX(c + 2);
          r = xs(this, a, e, n, d, u, p, E, y, w), r && (r.faceIndex = Math.floor(c / 3), t.push(r));
        }
      }
    else if (l !== void 0)
      if (Array.isArray(a))
        for (let _ = 0, x = f.length; _ < x; _++) {
          const c = f[_], h = a[c.materialIndex], E = Math.max(c.start, m.start), y = Math.min(l.count, Math.min(c.start + c.count, m.start + m.count));
          for (let w = E, I = y; w < I; w += 3) {
            const R = w, C = w + 1, U = w + 2;
            r = xs(this, h, e, n, d, u, p, R, C, U), r && (r.faceIndex = Math.floor(w / 3), r.face.materialIndex = c.materialIndex, t.push(r));
          }
        }
      else {
        const _ = Math.max(0, m.start), x = Math.min(l.count, m.start + m.count);
        for (let c = _, h = x; c < h; c += 3) {
          const E = c, y = c + 1, w = c + 2;
          r = xs(this, a, e, n, d, u, p, E, y, w), r && (r.faceIndex = Math.floor(c / 3), t.push(r));
        }
      }
  }
}
function Nu(i, e, t, n, r, s, a, o) {
  let l;
  if (e.side === vn ? l = n.intersectTriangle(a, s, r, !0, o) : l = n.intersectTriangle(r, s, a, e.side === pi, o), l === null) return null;
  vs.copy(o), vs.applyMatrix4(i.matrixWorld);
  const d = t.ray.origin.distanceTo(vs);
  return d < t.near || d > t.far ? null : {
    distance: d,
    point: vs.clone(),
    object: i
  };
}
function xs(i, e, t, n, r, s, a, o, l, d) {
  i.getVertexPosition(o, ir), i.getVertexPosition(l, rr), i.getVertexPosition(d, sr);
  const u = Nu(i, e, t, n, ir, rr, sr, _s);
  if (u) {
    r && (ps.fromBufferAttribute(r, o), ms.fromBufferAttribute(r, l), gs.fromBufferAttribute(r, d), u.uv = Vn.getInterpolation(_s, ir, rr, sr, ps, ms, gs, new Ke())), s && (ps.fromBufferAttribute(s, o), ms.fromBufferAttribute(s, l), gs.fromBufferAttribute(s, d), u.uv1 = Vn.getInterpolation(_s, ir, rr, sr, ps, ms, gs, new Ke())), a && (_c.fromBufferAttribute(a, o), vc.fromBufferAttribute(a, l), xc.fromBufferAttribute(a, d), u.normal = Vn.getInterpolation(_s, ir, rr, sr, _c, vc, xc, new N()), u.normal.dot(n.direction) > 0 && u.normal.multiplyScalar(-1));
    const p = {
      a: o,
      b: l,
      c: d,
      normal: new N(),
      materialIndex: 0
    };
    Vn.getNormal(ir, rr, sr, p.normal), u.face = p;
  }
  return u;
}
class Ht extends dn {
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
    _("z", "y", "x", -1, -1, n, t, e, a, s, 0), _("z", "y", "x", 1, -1, n, t, -e, a, s, 1), _("x", "z", "y", 1, 1, e, n, t, r, a, 2), _("x", "z", "y", 1, -1, e, n, -t, r, a, 3), _("x", "y", "z", 1, -1, e, t, n, r, s, 4), _("x", "y", "z", -1, -1, e, t, -n, r, s, 5), this.setIndex(l), this.setAttribute("position", new At(d, 3)), this.setAttribute("normal", new At(u, 3)), this.setAttribute("uv", new At(p, 2));
    function _(x, c, h, E, y, w, I, R, C, U, A) {
      const v = w / C, L = I / U, k = w / 2, V = I / 2, W = R / 2, Q = C + 1, j = U + 1;
      let ie = 0, K = 0;
      const de = new N();
      for (let ve = 0; ve < j; ve++) {
        const Ee = ve * L - V;
        for (let tt = 0; tt < Q; tt++) {
          const ct = tt * v - k;
          de[x] = ct * E, de[c] = Ee * y, de[h] = W, d.push(de.x, de.y, de.z), de[x] = 0, de[c] = 0, de[h] = R > 0 ? 1 : -1, u.push(de.x, de.y, de.z), p.push(tt / C), p.push(1 - ve / U), ie += 1;
        }
      }
      for (let ve = 0; ve < U; ve++)
        for (let Ee = 0; Ee < C; Ee++) {
          const tt = f + Ee + Q * ve, ct = f + Ee + Q * (ve + 1), J = f + (Ee + 1) + Q * (ve + 1), oe = f + (Ee + 1) + Q * ve;
          l.push(tt, ct, oe), l.push(ct, J, oe), K += 6;
        }
      o.addGroup(m, K, A), m += K, f += ie;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new Ht(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments);
  }
}
function Mr(i) {
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
function mn(i) {
  const e = {};
  for (let t = 0; t < i.length; t++) {
    const n = Mr(i[t]);
    for (const r in n)
      e[r] = n[r];
  }
  return e;
}
function Iu(i) {
  const e = [];
  for (let t = 0; t < i.length; t++)
    e.push(i[t].clone());
  return e;
}
function Rd(i) {
  const e = i.getRenderTarget();
  return e === null ? i.outputColorSpace : e.isXRRenderTarget === !0 ? e.texture.colorSpace : xt.workingColorSpace;
}
const Du = { clone: Mr, merge: mn };
var Uu = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, Ou = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class gi extends Er {
  constructor(e) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = Uu, this.fragmentShader = Ou, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
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
    return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = Mr(e.uniforms), this.uniformsGroups = Iu(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
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
class Cd extends Yt {
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new Et(), this.projectionMatrix = new Et(), this.projectionMatrixInverse = new Et(), this.coordinateSystem = ei;
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
const oi = /* @__PURE__ */ new N(), yc = /* @__PURE__ */ new Ke(), Sc = /* @__PURE__ */ new Ke();
class An extends Cd {
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
    this.fov = so * 2 * Math.atan(t), this.updateProjectionMatrix();
  }
  /**
   * Calculates the focal length from the current .fov and .filmGauge.
   */
  getFocalLength() {
    const e = Math.tan(Ls * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / e;
  }
  getEffectiveFOV() {
    return so * 2 * Math.atan(
      Math.tan(Ls * 0.5 * this.fov) / this.zoom
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
    oi.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), t.set(oi.x, oi.y).multiplyScalar(-e / oi.z), oi.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(oi.x, oi.y).multiplyScalar(-e / oi.z);
  }
  /**
   * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
   * Copies the result into the target Vector2, where x is width and y is height.
   */
  getViewSize(e, t) {
    return this.getViewBounds(e, yc, Sc), t.subVectors(Sc, yc);
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
    let t = e * Math.tan(Ls * 0.5 * this.fov) / this.zoom, n = 2 * t, r = this.aspect * n, s = -0.5 * r;
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
const ar = -90, or = 1;
class Fu extends Yt {
  constructor(e, t, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const r = new An(ar, or, e, t);
    r.layers = this.layers, this.add(r);
    const s = new An(ar, or, e, t);
    s.layers = this.layers, this.add(s);
    const a = new An(ar, or, e, t);
    a.layers = this.layers, this.add(a);
    const o = new An(ar, or, e, t);
    o.layers = this.layers, this.add(o);
    const l = new An(ar, or, e, t);
    l.layers = this.layers, this.add(l);
    const d = new An(ar, or, e, t);
    d.layers = this.layers, this.add(d);
  }
  updateCoordinateSystem() {
    const e = this.coordinateSystem, t = this.children.concat(), [n, r, s, a, o, l] = t;
    for (const d of t) this.remove(d);
    if (e === ei)
      n.up.set(0, 1, 0), n.lookAt(1, 0, 0), r.up.set(0, 1, 0), r.lookAt(-1, 0, 0), s.up.set(0, 0, -1), s.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
    else if (e === zs)
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
class Pd extends xn {
  constructor(e, t, n, r, s, a, o, l, d, u) {
    e = e !== void 0 ? e : [], t = t !== void 0 ? t : _r, super(e, t, n, r, s, a, o, l, d, u), this.isCubeTexture = !0, this.flipY = !1;
  }
  get images() {
    return this.image;
  }
  set images(e) {
    this.image = e;
  }
}
class Bu extends Ui {
  constructor(e = 1, t = {}) {
    super(e, e, t), this.isWebGLCubeRenderTarget = !0;
    const n = { width: e, height: e, depth: 1 }, r = [n, n, n, n, n, n];
    this.texture = new Pd(r, t.mapping, t.wrapS, t.wrapT, t.magFilter, t.minFilter, t.format, t.type, t.anisotropy, t.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = t.generateMipmaps !== void 0 ? t.generateMipmaps : !1, this.texture.minFilter = t.minFilter !== void 0 ? t.minFilter : In;
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
    }, r = new Ht(5, 5, 5), s = new gi({
      name: "CubemapFromEquirect",
      uniforms: Mr(n.uniforms),
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader,
      side: vn,
      blending: ui
    });
    s.uniforms.tEquirect.value = t;
    const a = new Te(r, s), o = t.minFilter;
    return t.minFilter === Ii && (t.minFilter = In), new Fu(1, 10, this).update(e, a), t.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
  }
  clear(e, t, n, r) {
    const s = e.getRenderTarget();
    for (let a = 0; a < 6; a++)
      e.setRenderTarget(this, a), e.clear(t, n, r);
    e.setRenderTarget(s);
  }
}
const Oa = /* @__PURE__ */ new N(), zu = /* @__PURE__ */ new N(), ku = /* @__PURE__ */ new ot();
class ci {
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
    const r = Oa.subVectors(n, t).cross(zu.subVectors(e, t)).normalize();
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
    const n = e.delta(Oa), r = this.normal.dot(n);
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
    const n = t || ku.getNormalMatrix(e), r = this.coplanarPoint(Oa).applyMatrix4(e), s = this.normal.applyMatrix3(n).normalize();
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
const Ei = /* @__PURE__ */ new Ys(), ys = /* @__PURE__ */ new N();
class mo {
  constructor(e = new ci(), t = new ci(), n = new ci(), r = new ci(), s = new ci(), a = new ci()) {
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
  setFromProjectionMatrix(e, t = ei) {
    const n = this.planes, r = e.elements, s = r[0], a = r[1], o = r[2], l = r[3], d = r[4], u = r[5], p = r[6], f = r[7], m = r[8], _ = r[9], x = r[10], c = r[11], h = r[12], E = r[13], y = r[14], w = r[15];
    if (n[0].setComponents(l - s, f - d, c - m, w - h).normalize(), n[1].setComponents(l + s, f + d, c + m, w + h).normalize(), n[2].setComponents(l + a, f + u, c + _, w + E).normalize(), n[3].setComponents(l - a, f - u, c - _, w - E).normalize(), n[4].setComponents(l - o, f - p, c - x, w - y).normalize(), t === ei)
      n[5].setComponents(l + o, f + p, c + x, w + y).normalize();
    else if (t === zs)
      n[5].setComponents(o, p, x, y).normalize();
    else
      throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
    return this;
  }
  intersectsObject(e) {
    if (e.boundingSphere !== void 0)
      e.boundingSphere === null && e.computeBoundingSphere(), Ei.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
    else {
      const t = e.geometry;
      t.boundingSphere === null && t.computeBoundingSphere(), Ei.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
    }
    return this.intersectsSphere(Ei);
  }
  intersectsSprite(e) {
    return Ei.center.set(0, 0, 0), Ei.radius = 0.7071067811865476, Ei.applyMatrix4(e.matrixWorld), this.intersectsSphere(Ei);
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
      if (ys.x = r.normal.x > 0 ? e.max.x : e.min.x, ys.y = r.normal.y > 0 ? e.max.y : e.min.y, ys.z = r.normal.z > 0 ? e.max.z : e.min.z, r.distanceToPoint(ys) < 0)
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
function Ld() {
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
function Vu(i) {
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
class jr extends dn {
  constructor(e = 1, t = 1, n = 1, r = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: e,
      height: t,
      widthSegments: n,
      heightSegments: r
    };
    const s = e / 2, a = t / 2, o = Math.floor(n), l = Math.floor(r), d = o + 1, u = l + 1, p = e / o, f = t / l, m = [], _ = [], x = [], c = [];
    for (let h = 0; h < u; h++) {
      const E = h * f - a;
      for (let y = 0; y < d; y++) {
        const w = y * p - s;
        _.push(w, -E, 0), x.push(0, 0, 1), c.push(y / o), c.push(1 - h / l);
      }
    }
    for (let h = 0; h < l; h++)
      for (let E = 0; E < o; E++) {
        const y = E + d * h, w = E + d * (h + 1), I = E + 1 + d * (h + 1), R = E + 1 + d * h;
        m.push(y, w, R), m.push(w, I, R);
      }
    this.setIndex(m), this.setAttribute("position", new At(_, 3)), this.setAttribute("normal", new At(x, 3)), this.setAttribute("uv", new At(c, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new jr(e.width, e.height, e.widthSegments, e.heightSegments);
  }
}
var Hu = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, Gu = `#ifdef USE_ALPHAHASH
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
#endif`, Wu = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, Xu = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, Yu = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, qu = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, ju = `#ifdef USE_AOMAP
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
#endif`, Ku = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, $u = `#ifdef USE_BATCHING
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
#endif`, Zu = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`, Qu = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, Ju = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, ef = `float G_BlinnPhong_Implicit( ) {
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
} // validated`, tf = `#ifdef USE_IRIDESCENCE
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
#endif`, nf = `#ifdef USE_BUMPMAP
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
#endif`, rf = `#if NUM_CLIPPING_PLANES > 0
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
#endif`, sf = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, af = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, of = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, lf = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, cf = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, df = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, hf = `#if defined( USE_COLOR_ALPHA )
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
#endif`, uf = `#define PI 3.141592653589793
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
} // validated`, ff = `#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`, pf = `vec3 transformedNormal = objectNormal;
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
#endif`, mf = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, gf = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, _f = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, vf = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, xf = "gl_FragColor = linearToOutputTexel( gl_FragColor );", yf = `
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
}`, Sf = `#ifdef USE_ENVMAP
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
#endif`, Mf = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, Ef = `#ifdef USE_ENVMAP
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
#endif`, bf = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, Tf = `#ifdef USE_ENVMAP
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
#endif`, Af = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, wf = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, Rf = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, Cf = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, Pf = `#ifdef USE_GRADIENTMAP
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
}`, Lf = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, Nf = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, If = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, Df = `uniform bool receiveShadow;
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
#endif`, Uf = `#ifdef USE_ENVMAP
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
#endif`, Of = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, Ff = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, Bf = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, zf = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, kf = `PhysicalMaterial material;
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
#endif`, Vf = `struct PhysicalMaterial {
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
}`, Hf = `
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
#endif`, Gf = `#if defined( RE_IndirectDiffuse )
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
#endif`, Wf = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, Xf = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, Yf = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, qf = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, jf = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, Kf = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, $f = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, Zf = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`, Qf = `#if defined( USE_POINTS_UV )
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
#endif`, Jf = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, ep = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, tp = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, np = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, ip = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, rp = `#ifdef USE_MORPHTARGETS
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
#endif`, sp = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, ap = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`, op = `#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`, lp = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, cp = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, dp = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, hp = `#ifdef USE_NORMALMAP
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
#endif`, up = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, fp = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, pp = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, mp = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, gp = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, _p = `vec3 packNormalToRGB( const in vec3 normal ) {
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
}`, vp = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, xp = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, yp = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, Sp = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, Mp = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, Ep = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, bp = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, Tp = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, Ap = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`, wp = `float getShadowMask() {
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
}`, Rp = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, Cp = `#ifdef USE_SKINNING
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
#endif`, Pp = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, Lp = `#ifdef USE_SKINNING
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
#endif`, Np = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, Ip = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, Dp = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, Up = `#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`, Op = `#ifdef USE_TRANSMISSION
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
#endif`, Fp = `#ifdef USE_TRANSMISSION
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
#endif`, Bp = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, zp = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, kp = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, Vp = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const Hp = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, Gp = `uniform sampler2D t2D;
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
}`, Wp = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Xp = `#ifdef ENVMAP_TYPE_CUBE
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
}`, Yp = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, qp = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, jp = `#include <common>
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
}`, Kp = `#if DEPTH_PACKING == 3200
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
}`, $p = `#define DISTANCE
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
}`, Zp = `#define DISTANCE
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
}`, Qp = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, Jp = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, em = `uniform float scale;
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
}`, tm = `uniform vec3 diffuse;
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
}`, nm = `#include <common>
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
}`, im = `uniform vec3 diffuse;
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
}`, rm = `#define LAMBERT
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
}`, sm = `#define LAMBERT
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
}`, am = `#define MATCAP
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
}`, om = `#define MATCAP
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
}`, lm = `#define NORMAL
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
}`, cm = `#define NORMAL
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
}`, dm = `#define PHONG
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
}`, hm = `#define PHONG
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
}`, um = `#define STANDARD
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
}`, fm = `#define STANDARD
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
}`, pm = `#define TOON
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
}`, mm = `#define TOON
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
}`, gm = `uniform float size;
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
}`, _m = `uniform vec3 diffuse;
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
}`, vm = `#include <common>
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
}`, xm = `uniform vec3 color;
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
}`, ym = `uniform float rotation;
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
}`, Sm = `uniform vec3 diffuse;
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
}`, at = {
  alphahash_fragment: Hu,
  alphahash_pars_fragment: Gu,
  alphamap_fragment: Wu,
  alphamap_pars_fragment: Xu,
  alphatest_fragment: Yu,
  alphatest_pars_fragment: qu,
  aomap_fragment: ju,
  aomap_pars_fragment: Ku,
  batching_pars_vertex: $u,
  batching_vertex: Zu,
  begin_vertex: Qu,
  beginnormal_vertex: Ju,
  bsdfs: ef,
  iridescence_fragment: tf,
  bumpmap_pars_fragment: nf,
  clipping_planes_fragment: rf,
  clipping_planes_pars_fragment: sf,
  clipping_planes_pars_vertex: af,
  clipping_planes_vertex: of,
  color_fragment: lf,
  color_pars_fragment: cf,
  color_pars_vertex: df,
  color_vertex: hf,
  common: uf,
  cube_uv_reflection_fragment: ff,
  defaultnormal_vertex: pf,
  displacementmap_pars_vertex: mf,
  displacementmap_vertex: gf,
  emissivemap_fragment: _f,
  emissivemap_pars_fragment: vf,
  colorspace_fragment: xf,
  colorspace_pars_fragment: yf,
  envmap_fragment: Sf,
  envmap_common_pars_fragment: Mf,
  envmap_pars_fragment: Ef,
  envmap_pars_vertex: bf,
  envmap_physical_pars_fragment: Uf,
  envmap_vertex: Tf,
  fog_vertex: Af,
  fog_pars_vertex: wf,
  fog_fragment: Rf,
  fog_pars_fragment: Cf,
  gradientmap_pars_fragment: Pf,
  lightmap_pars_fragment: Lf,
  lights_lambert_fragment: Nf,
  lights_lambert_pars_fragment: If,
  lights_pars_begin: Df,
  lights_toon_fragment: Of,
  lights_toon_pars_fragment: Ff,
  lights_phong_fragment: Bf,
  lights_phong_pars_fragment: zf,
  lights_physical_fragment: kf,
  lights_physical_pars_fragment: Vf,
  lights_fragment_begin: Hf,
  lights_fragment_maps: Gf,
  lights_fragment_end: Wf,
  logdepthbuf_fragment: Xf,
  logdepthbuf_pars_fragment: Yf,
  logdepthbuf_pars_vertex: qf,
  logdepthbuf_vertex: jf,
  map_fragment: Kf,
  map_pars_fragment: $f,
  map_particle_fragment: Zf,
  map_particle_pars_fragment: Qf,
  metalnessmap_fragment: Jf,
  metalnessmap_pars_fragment: ep,
  morphinstance_vertex: tp,
  morphcolor_vertex: np,
  morphnormal_vertex: ip,
  morphtarget_pars_vertex: rp,
  morphtarget_vertex: sp,
  normal_fragment_begin: ap,
  normal_fragment_maps: op,
  normal_pars_fragment: lp,
  normal_pars_vertex: cp,
  normal_vertex: dp,
  normalmap_pars_fragment: hp,
  clearcoat_normal_fragment_begin: up,
  clearcoat_normal_fragment_maps: fp,
  clearcoat_pars_fragment: pp,
  iridescence_pars_fragment: mp,
  opaque_fragment: gp,
  packing: _p,
  premultiplied_alpha_fragment: vp,
  project_vertex: xp,
  dithering_fragment: yp,
  dithering_pars_fragment: Sp,
  roughnessmap_fragment: Mp,
  roughnessmap_pars_fragment: Ep,
  shadowmap_pars_fragment: bp,
  shadowmap_pars_vertex: Tp,
  shadowmap_vertex: Ap,
  shadowmask_pars_fragment: wp,
  skinbase_vertex: Rp,
  skinning_pars_vertex: Cp,
  skinning_vertex: Pp,
  skinnormal_vertex: Lp,
  specularmap_fragment: Np,
  specularmap_pars_fragment: Ip,
  tonemapping_fragment: Dp,
  tonemapping_pars_fragment: Up,
  transmission_fragment: Op,
  transmission_pars_fragment: Fp,
  uv_pars_fragment: Bp,
  uv_pars_vertex: zp,
  uv_vertex: kp,
  worldpos_vertex: Vp,
  background_vert: Hp,
  background_frag: Gp,
  backgroundCube_vert: Wp,
  backgroundCube_frag: Xp,
  cube_vert: Yp,
  cube_frag: qp,
  depth_vert: jp,
  depth_frag: Kp,
  distanceRGBA_vert: $p,
  distanceRGBA_frag: Zp,
  equirect_vert: Qp,
  equirect_frag: Jp,
  linedashed_vert: em,
  linedashed_frag: tm,
  meshbasic_vert: nm,
  meshbasic_frag: im,
  meshlambert_vert: rm,
  meshlambert_frag: sm,
  meshmatcap_vert: am,
  meshmatcap_frag: om,
  meshnormal_vert: lm,
  meshnormal_frag: cm,
  meshphong_vert: dm,
  meshphong_frag: hm,
  meshphysical_vert: um,
  meshphysical_frag: fm,
  meshtoon_vert: pm,
  meshtoon_frag: mm,
  points_vert: gm,
  points_frag: _m,
  shadow_vert: vm,
  shadow_frag: xm,
  sprite_vert: ym,
  sprite_frag: Sm
}, Se = {
  common: {
    diffuse: { value: /* @__PURE__ */ new ft(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new ot() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new ot() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new ot() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new ot() },
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
    aoMapTransform: { value: /* @__PURE__ */ new ot() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new ot() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new ot() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new ot() },
    normalScale: { value: /* @__PURE__ */ new Ke(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new ot() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new ot() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new ot() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new ot() }
  },
  gradientmap: {
    gradientMap: { value: null }
  },
  fog: {
    fogDensity: { value: 25e-5 },
    fogNear: { value: 1 },
    fogFar: { value: 2e3 },
    fogColor: { value: /* @__PURE__ */ new ft(16777215) }
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
    diffuse: { value: /* @__PURE__ */ new ft(16777215) },
    opacity: { value: 1 },
    size: { value: 1 },
    scale: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new ot() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new ot() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new ft(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new Ke(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new ot() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new ot() },
    alphaTest: { value: 0 }
  }
}, zn = {
  basic: {
    uniforms: /* @__PURE__ */ mn([
      Se.common,
      Se.specularmap,
      Se.envmap,
      Se.aomap,
      Se.lightmap,
      Se.fog
    ]),
    vertexShader: at.meshbasic_vert,
    fragmentShader: at.meshbasic_frag
  },
  lambert: {
    uniforms: /* @__PURE__ */ mn([
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
        emissive: { value: /* @__PURE__ */ new ft(0) }
      }
    ]),
    vertexShader: at.meshlambert_vert,
    fragmentShader: at.meshlambert_frag
  },
  phong: {
    uniforms: /* @__PURE__ */ mn([
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
        emissive: { value: /* @__PURE__ */ new ft(0) },
        specular: { value: /* @__PURE__ */ new ft(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: at.meshphong_vert,
    fragmentShader: at.meshphong_frag
  },
  standard: {
    uniforms: /* @__PURE__ */ mn([
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
        emissive: { value: /* @__PURE__ */ new ft(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: at.meshphysical_vert,
    fragmentShader: at.meshphysical_frag
  },
  toon: {
    uniforms: /* @__PURE__ */ mn([
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
        emissive: { value: /* @__PURE__ */ new ft(0) }
      }
    ]),
    vertexShader: at.meshtoon_vert,
    fragmentShader: at.meshtoon_frag
  },
  matcap: {
    uniforms: /* @__PURE__ */ mn([
      Se.common,
      Se.bumpmap,
      Se.normalmap,
      Se.displacementmap,
      Se.fog,
      {
        matcap: { value: null }
      }
    ]),
    vertexShader: at.meshmatcap_vert,
    fragmentShader: at.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ mn([
      Se.points,
      Se.fog
    ]),
    vertexShader: at.points_vert,
    fragmentShader: at.points_frag
  },
  dashed: {
    uniforms: /* @__PURE__ */ mn([
      Se.common,
      Se.fog,
      {
        scale: { value: 1 },
        dashSize: { value: 1 },
        totalSize: { value: 2 }
      }
    ]),
    vertexShader: at.linedashed_vert,
    fragmentShader: at.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ mn([
      Se.common,
      Se.displacementmap
    ]),
    vertexShader: at.depth_vert,
    fragmentShader: at.depth_frag
  },
  normal: {
    uniforms: /* @__PURE__ */ mn([
      Se.common,
      Se.bumpmap,
      Se.normalmap,
      Se.displacementmap,
      {
        opacity: { value: 1 }
      }
    ]),
    vertexShader: at.meshnormal_vert,
    fragmentShader: at.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ mn([
      Se.sprite,
      Se.fog
    ]),
    vertexShader: at.sprite_vert,
    fragmentShader: at.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new ot() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: at.background_vert,
    fragmentShader: at.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new ot() }
    },
    vertexShader: at.backgroundCube_vert,
    fragmentShader: at.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: at.cube_vert,
    fragmentShader: at.cube_frag
  },
  equirect: {
    uniforms: {
      tEquirect: { value: null }
    },
    vertexShader: at.equirect_vert,
    fragmentShader: at.equirect_frag
  },
  distanceRGBA: {
    uniforms: /* @__PURE__ */ mn([
      Se.common,
      Se.displacementmap,
      {
        referencePosition: { value: /* @__PURE__ */ new N() },
        nearDistance: { value: 1 },
        farDistance: { value: 1e3 }
      }
    ]),
    vertexShader: at.distanceRGBA_vert,
    fragmentShader: at.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ mn([
      Se.lights,
      Se.fog,
      {
        color: { value: /* @__PURE__ */ new ft(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: at.shadow_vert,
    fragmentShader: at.shadow_frag
  }
};
zn.physical = {
  uniforms: /* @__PURE__ */ mn([
    zn.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: /* @__PURE__ */ new ot() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: /* @__PURE__ */ new ot() },
      clearcoatNormalScale: { value: /* @__PURE__ */ new Ke(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new ot() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: /* @__PURE__ */ new ot() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new ot() },
      sheen: { value: 0 },
      sheenColor: { value: /* @__PURE__ */ new ft(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: /* @__PURE__ */ new ot() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: /* @__PURE__ */ new ot() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: /* @__PURE__ */ new ot() },
      transmissionSamplerSize: { value: /* @__PURE__ */ new Ke() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: /* @__PURE__ */ new ot() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: /* @__PURE__ */ new ft(0) },
      specularColor: { value: /* @__PURE__ */ new ft(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: /* @__PURE__ */ new ot() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: /* @__PURE__ */ new ot() },
      anisotropyVector: { value: /* @__PURE__ */ new Ke() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: /* @__PURE__ */ new ot() }
    }
  ]),
  vertexShader: at.meshphysical_vert,
  fragmentShader: at.meshphysical_frag
};
const Ss = { r: 0, b: 0, g: 0 }, bi = /* @__PURE__ */ new En(), Mm = /* @__PURE__ */ new Et();
function Em(i, e, t, n, r, s, a) {
  const o = new ft(0);
  let l = s === !0 ? 0 : 1, d, u, p = null, f = 0, m = null;
  function _(E) {
    let y = E.isScene === !0 ? E.background : null;
    return y && y.isTexture && (y = (E.backgroundBlurriness > 0 ? t : e).get(y)), y;
  }
  function x(E) {
    let y = !1;
    const w = _(E);
    w === null ? h(o, l) : w && w.isColor && (h(w, 1), y = !0);
    const I = i.xr.getEnvironmentBlendMode();
    I === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, a) : I === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a), (i.autoClear || y) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil));
  }
  function c(E, y) {
    const w = _(y);
    w && (w.isCubeTexture || w.mapping === Gs) ? (u === void 0 && (u = new Te(
      new Ht(1, 1, 1),
      new gi({
        name: "BackgroundCubeMaterial",
        uniforms: Mr(zn.backgroundCube.uniforms),
        vertexShader: zn.backgroundCube.vertexShader,
        fragmentShader: zn.backgroundCube.fragmentShader,
        side: vn,
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
    }), r.update(u)), bi.copy(y.backgroundRotation), bi.x *= -1, bi.y *= -1, bi.z *= -1, w.isCubeTexture && w.isRenderTargetTexture === !1 && (bi.y *= -1, bi.z *= -1), u.material.uniforms.envMap.value = w, u.material.uniforms.flipEnvMap.value = w.isCubeTexture && w.isRenderTargetTexture === !1 ? -1 : 1, u.material.uniforms.backgroundBlurriness.value = y.backgroundBlurriness, u.material.uniforms.backgroundIntensity.value = y.backgroundIntensity, u.material.uniforms.backgroundRotation.value.setFromMatrix4(Mm.makeRotationFromEuler(bi)), u.material.toneMapped = xt.getTransfer(w.colorSpace) !== It, (p !== w || f !== w.version || m !== i.toneMapping) && (u.material.needsUpdate = !0, p = w, f = w.version, m = i.toneMapping), u.layers.enableAll(), E.unshift(u, u.geometry, u.material, 0, 0, null)) : w && w.isTexture && (d === void 0 && (d = new Te(
      new jr(2, 2),
      new gi({
        name: "BackgroundMaterial",
        uniforms: Mr(zn.background.uniforms),
        vertexShader: zn.background.vertexShader,
        fragmentShader: zn.background.fragmentShader,
        side: pi,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), d.geometry.deleteAttribute("normal"), Object.defineProperty(d.material, "map", {
      get: function() {
        return this.uniforms.t2D.value;
      }
    }), r.update(d)), d.material.uniforms.t2D.value = w, d.material.uniforms.backgroundIntensity.value = y.backgroundIntensity, d.material.toneMapped = xt.getTransfer(w.colorSpace) !== It, w.matrixAutoUpdate === !0 && w.updateMatrix(), d.material.uniforms.uvTransform.value.copy(w.matrix), (p !== w || f !== w.version || m !== i.toneMapping) && (d.material.needsUpdate = !0, p = w, f = w.version, m = i.toneMapping), d.layers.enableAll(), E.unshift(d, d.geometry, d.material, 0, 0, null));
  }
  function h(E, y) {
    E.getRGB(Ss, Rd(i)), n.buffers.color.setClear(Ss.r, Ss.g, Ss.b, y, a);
  }
  return {
    getClearColor: function() {
      return o;
    },
    setClearColor: function(E, y = 1) {
      o.set(E), l = y, h(o, l);
    },
    getClearAlpha: function() {
      return l;
    },
    setClearAlpha: function(E) {
      l = E, h(o, l);
    },
    render: x,
    addToRenderList: c
  };
}
function bm(i, e) {
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
    const ie = k.getAttributes();
    for (const K in ie)
      if (ie[K].location >= 0) {
        const ve = W[K];
        let Ee = Q[K];
        if (Ee === void 0 && (K === "instanceMatrix" && v.instanceMatrix && (Ee = v.instanceMatrix), K === "instanceColor" && v.instanceColor && (Ee = v.instanceColor)), ve === void 0 || ve.attribute !== Ee || Ee && ve.data !== Ee.data) return !0;
        j++;
      }
    return s.attributesNum !== j || s.index !== V;
  }
  function _(v, L, k, V) {
    const W = {}, Q = L.attributes;
    let j = 0;
    const ie = k.getAttributes();
    for (const K in ie)
      if (ie[K].location >= 0) {
        let ve = Q[K];
        ve === void 0 && (K === "instanceMatrix" && v.instanceMatrix && (ve = v.instanceMatrix), K === "instanceColor" && v.instanceColor && (ve = v.instanceColor));
        const Ee = {};
        Ee.attribute = ve, ve && ve.data && (Ee.data = ve.data), W[K] = Ee, j++;
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
  function E() {
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
    for (const ie in Q) {
      const K = Q[ie];
      if (K.location >= 0) {
        let de = W[ie];
        if (de === void 0 && (ie === "instanceMatrix" && v.instanceMatrix && (de = v.instanceMatrix), ie === "instanceColor" && v.instanceColor && (de = v.instanceColor)), de !== void 0) {
          const ve = de.normalized, Ee = de.itemSize, tt = e.get(de);
          if (tt === void 0) continue;
          const ct = tt.buffer, J = tt.type, oe = tt.bytesPerElement, be = J === i.INT || J === i.UNSIGNED_INT || de.gpuType === fd;
          if (de.isInterleavedBufferAttribute) {
            const ue = de.data, Je = ue.stride, Ve = de.offset;
            if (ue.isInstancedInterleavedBuffer) {
              for (let nt = 0; nt < K.locationSize; nt++)
                h(K.location + nt, ue.meshPerAttribute);
              v.isInstancedMesh !== !0 && V._maxInstanceCount === void 0 && (V._maxInstanceCount = ue.meshPerAttribute * ue.count);
            } else
              for (let nt = 0; nt < K.locationSize; nt++)
                c(K.location + nt);
            i.bindBuffer(i.ARRAY_BUFFER, ct);
            for (let nt = 0; nt < K.locationSize; nt++)
              y(
                K.location + nt,
                Ee / K.locationSize,
                J,
                ve,
                Je * oe,
                (Ve + Ee / K.locationSize * nt) * oe,
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
            i.bindBuffer(i.ARRAY_BUFFER, ct);
            for (let ue = 0; ue < K.locationSize; ue++)
              y(
                K.location + ue,
                Ee / K.locationSize,
                J,
                ve,
                Ee * oe,
                Ee / K.locationSize * ue * oe,
                be
              );
          }
        } else if (j !== void 0) {
          const ve = j[ie];
          if (ve !== void 0)
            switch (ve.length) {
              case 2:
                i.vertexAttrib2fv(K.location, ve);
                break;
              case 3:
                i.vertexAttrib3fv(K.location, ve);
                break;
              case 4:
                i.vertexAttrib4fv(K.location, ve);
                break;
              default:
                i.vertexAttrib1fv(K.location, ve);
            }
        }
      }
    }
    E();
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
    disableUnusedAttributes: E
  };
}
function Tm(i, e, t) {
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
function Am(i, e, t, n) {
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
    const C = R === Ws && (e.has("EXT_color_buffer_half_float") || e.has("EXT_color_buffer_float"));
    return !(R !== mi && n.convert(R) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
    R !== hi && !C);
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
  const p = t.logarithmicDepthBuffer === !0, f = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS), m = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS), _ = i.getParameter(i.MAX_TEXTURE_SIZE), x = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE), c = i.getParameter(i.MAX_VERTEX_ATTRIBS), h = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS), E = i.getParameter(i.MAX_VARYING_VECTORS), y = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS), w = m > 0, I = i.getParameter(i.MAX_SAMPLES);
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
    maxVaryings: E,
    maxFragmentUniforms: y,
    vertexTextures: w,
    maxSamples: I
  };
}
function wm(i) {
  const e = this;
  let t = null, n = 0, r = !1, s = !1;
  const a = new ci(), o = new ot(), l = { value: null, needsUpdate: !1 };
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
      const E = s ? 0 : n, y = E * 4;
      let w = h.clippingState || null;
      l.value = w, w = u(_, f, y, m);
      for (let I = 0; I !== y; ++I)
        w[I] = t[I];
      h.clippingState = w, this.numIntersection = x ? this.numPlanes : 0, this.numPlanes += E;
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
        const h = m + x * 4, E = f.matrixWorldInverse;
        o.getNormalMatrix(E), (c === null || c.length < h) && (c = new Float32Array(h));
        for (let y = 0, w = m; y !== x; ++y, w += 4)
          a.copy(p[y]).applyMatrix4(E, o), a.normal.toArray(c, w), c[w + 3] = a.constant;
      }
      l.value = c, l.needsUpdate = !0;
    }
    return e.numPlanes = x, e.numIntersection = 0, c;
  }
}
function Rm(i) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(a, o) {
    return o === to ? a.mapping = _r : o === no && (a.mapping = vr), a;
  }
  function n(a) {
    if (a && a.isTexture) {
      const o = a.mapping;
      if (o === to || o === no)
        if (e.has(a)) {
          const l = e.get(a).texture;
          return t(l, a.mapping);
        } else {
          const l = a.image;
          if (l && l.height > 0) {
            const d = new Bu(l.height);
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
class Nd extends Cd {
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
const ur = 4, Mc = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], Pi = 20, Fa = /* @__PURE__ */ new Nd(), Ec = /* @__PURE__ */ new ft();
let Ba = null, za = 0, ka = 0, Va = !1;
const wi = (1 + Math.sqrt(5)) / 2, lr = 1 / wi, bc = [
  /* @__PURE__ */ new N(-wi, lr, 0),
  /* @__PURE__ */ new N(wi, lr, 0),
  /* @__PURE__ */ new N(-lr, 0, wi),
  /* @__PURE__ */ new N(lr, 0, wi),
  /* @__PURE__ */ new N(0, wi, -lr),
  /* @__PURE__ */ new N(0, wi, lr),
  /* @__PURE__ */ new N(-1, 1, -1),
  /* @__PURE__ */ new N(1, 1, -1),
  /* @__PURE__ */ new N(-1, 1, 1),
  /* @__PURE__ */ new N(1, 1, 1)
];
class Tc {
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
    Ba = this._renderer.getRenderTarget(), za = this._renderer.getActiveCubeFace(), ka = this._renderer.getActiveMipmapLevel(), Va = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(256);
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
    this._cubemapMaterial === null && (this._cubemapMaterial = Rc(), this._compileMaterial(this._cubemapMaterial));
  }
  /**
   * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = wc(), this._compileMaterial(this._equirectMaterial));
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
    this._renderer.setRenderTarget(Ba, za, ka), this._renderer.xr.enabled = Va, e.scissorTest = !1, Ms(e, 0, 0, e.width, e.height);
  }
  _fromTexture(e, t) {
    e.mapping === _r || e.mapping === vr ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), Ba = this._renderer.getRenderTarget(), za = this._renderer.getActiveCubeFace(), ka = this._renderer.getActiveMipmapLevel(), Va = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
    const n = t || this._allocateTargets();
    return this._textureToCubeUV(e, n), this._applyPMREM(n), this._cleanup(n), n;
  }
  _allocateTargets() {
    const e = 3 * Math.max(this._cubeSize, 112), t = 4 * this._cubeSize, n = {
      magFilter: In,
      minFilter: In,
      generateMipmaps: !1,
      type: Ws,
      format: Hn,
      colorSpace: _i,
      depthBuffer: !1
    }, r = Ac(e, t, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Ac(e, t, n);
      const { _lodMax: s } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Cm(s)), this._blurMaterial = Pm(s, e, t);
    }
    return r;
  }
  _compileMaterial(e) {
    const t = new Te(this._lodPlanes[0], e);
    this._renderer.compile(t, Fa);
  }
  _sceneToCubeUV(e, t, n, r) {
    const o = new An(90, 1, t, n), l = [1, -1, 1, 1, 1, 1], d = [1, 1, 1, -1, -1, -1], u = this._renderer, p = u.autoClear, f = u.toneMapping;
    u.getClearColor(Ec), u.toneMapping = fi, u.autoClear = !1;
    const m = new js({
      name: "PMREM.Background",
      side: vn,
      depthWrite: !1,
      depthTest: !1
    }), _ = new Te(new Ht(), m);
    let x = !1;
    const c = e.background;
    c ? c.isColor && (m.color.copy(c), e.background = null, x = !0) : (m.color.copy(Ec), x = !0);
    for (let h = 0; h < 6; h++) {
      const E = h % 3;
      E === 0 ? (o.up.set(0, l[h], 0), o.lookAt(d[h], 0, 0)) : E === 1 ? (o.up.set(0, 0, l[h]), o.lookAt(0, d[h], 0)) : (o.up.set(0, l[h], 0), o.lookAt(0, 0, d[h]));
      const y = this._cubeSize;
      Ms(r, E * y, h > 2 ? y : 0, y, y), u.setRenderTarget(r), x && u.render(_, o), u.render(e, o);
    }
    _.geometry.dispose(), _.material.dispose(), u.toneMapping = f, u.autoClear = p, e.background = c;
  }
  _textureToCubeUV(e, t) {
    const n = this._renderer, r = e.mapping === _r || e.mapping === vr;
    r ? (this._cubemapMaterial === null && (this._cubemapMaterial = Rc()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = wc());
    const s = r ? this._cubemapMaterial : this._equirectMaterial, a = new Te(this._lodPlanes[0], s), o = s.uniforms;
    o.envMap.value = e;
    const l = this._cubeSize;
    Ms(t, 0, 0, 3 * l, 2 * l), n.setRenderTarget(t), n.render(a, Fa);
  }
  _applyPMREM(e) {
    const t = this._renderer, n = t.autoClear;
    t.autoClear = !1;
    const r = this._lodPlanes.length;
    for (let s = 1; s < r; s++) {
      const a = Math.sqrt(this._sigmas[s] * this._sigmas[s] - this._sigmas[s - 1] * this._sigmas[s - 1]), o = bc[(r - s - 1) % bc.length];
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
    const u = 3, p = new Te(this._lodPlanes[r], d), f = d.uniforms, m = this._sizeLods[n] - 1, _ = isFinite(s) ? Math.PI / (2 * m) : 2 * Math.PI / (2 * Pi - 1), x = s / _, c = isFinite(s) ? 1 + Math.floor(u * x) : Pi;
    c > Pi && console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${c} samples when the maximum is set to ${Pi}`);
    const h = [];
    let E = 0;
    for (let C = 0; C < Pi; ++C) {
      const U = C / x, A = Math.exp(-U * U / 2);
      h.push(A), C === 0 ? E += A : C < c && (E += 2 * A);
    }
    for (let C = 0; C < h.length; C++)
      h[C] = h[C] / E;
    f.envMap.value = e.texture, f.samples.value = c, f.weights.value = h, f.latitudinal.value = a === "latitudinal", o && (f.poleAxis.value = o);
    const { _lodMax: y } = this;
    f.dTheta.value = _, f.mipInt.value = y - n;
    const w = this._sizeLods[r], I = 3 * w * (r > y - ur ? r - y + ur : 0), R = 4 * (this._cubeSize - w);
    Ms(t, I, R, 3 * w, 2 * w), l.setRenderTarget(t), l.render(p, Fa);
  }
}
function Cm(i) {
  const e = [], t = [], n = [];
  let r = i;
  const s = i - ur + 1 + Mc.length;
  for (let a = 0; a < s; a++) {
    const o = Math.pow(2, r);
    t.push(o);
    let l = 1 / o;
    a > i - ur ? l = Mc[a - i + ur - 1] : a === 0 && (l = 0), n.push(l);
    const d = 1 / (o - 2), u = -d, p = 1 + d, f = [u, u, p, u, p, p, u, u, p, p, u, p], m = 6, _ = 6, x = 3, c = 2, h = 1, E = new Float32Array(x * _ * m), y = new Float32Array(c * _ * m), w = new Float32Array(h * _ * m);
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
      E.set(A, x * _ * R), y.set(f, c * _ * R);
      const v = [R, R, R, R, R, R];
      w.set(v, h * _ * R);
    }
    const I = new dn();
    I.setAttribute("position", new Gn(E, x)), I.setAttribute("uv", new Gn(y, c)), I.setAttribute("faceIndex", new Gn(w, h)), e.push(I), r > ur && r--;
  }
  return { lodPlanes: e, sizeLods: t, sigmas: n };
}
function Ac(i, e, t) {
  const n = new Ui(i, e, t);
  return n.texture.mapping = Gs, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n;
}
function Ms(i, e, t, n, r) {
  i.viewport.set(e, t, n, r), i.scissor.set(e, t, n, r);
}
function Pm(i, e, t) {
  const n = new Float32Array(Pi), r = new N(0, 1, 0);
  return new gi({
    name: "SphericalGaussianBlur",
    defines: {
      n: Pi,
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
    vertexShader: go(),
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
    blending: ui,
    depthTest: !1,
    depthWrite: !1
  });
}
function wc() {
  return new gi({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: { value: null }
    },
    vertexShader: go(),
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
    blending: ui,
    depthTest: !1,
    depthWrite: !1
  });
}
function Rc() {
  return new gi({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: go(),
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
    blending: ui,
    depthTest: !1,
    depthWrite: !1
  });
}
function go() {
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
function Lm(i) {
  let e = /* @__PURE__ */ new WeakMap(), t = null;
  function n(o) {
    if (o && o.isTexture) {
      const l = o.mapping, d = l === to || l === no, u = l === _r || l === vr;
      if (d || u) {
        let p = e.get(o);
        const f = p !== void 0 ? p.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== f)
          return t === null && (t = new Tc(i)), p = d ? t.fromEquirectangular(o, p) : t.fromCubemap(o, p), p.texture.pmremVersion = o.pmremVersion, e.set(o, p), p.texture;
        if (p !== void 0)
          return p.texture;
        {
          const m = o.image;
          return d && m && m.height > 0 || u && m && r(m) ? (t === null && (t = new Tc(i)), p = d ? t.fromEquirectangular(o) : t.fromCubemap(o), p.texture.pmremVersion = o.pmremVersion, e.set(o, p), o.addEventListener("dispose", s), p.texture) : null;
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
function Nm(i) {
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
      return r === null && Md("THREE.WebGLRenderer: " + n + " extension not supported."), r;
    }
  };
}
function Im(i, e, t, n) {
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
      const E = m.array;
      x = m.version;
      for (let y = 0, w = E.length; y < w; y += 3) {
        const I = E[y + 0], R = E[y + 1], C = E[y + 2];
        f.push(I, R, R, C, C, I);
      }
    } else if (_ !== void 0) {
      const E = _.array;
      x = _.version;
      for (let y = 0, w = E.length / 3 - 1; y < w; y += 3) {
        const I = y + 0, R = y + 1, C = y + 2;
        f.push(I, R, R, C, C, I);
      }
    } else
      return;
    const c = new (Sd(f) ? wd : Ad)(f, 1);
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
function Dm(i, e, t) {
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
      for (let E = 0; E < _; E++)
        h += m[E];
      for (let E = 0; E < x.length; E++)
        t.update(h, n, x[E]);
    }
  }
  this.setMode = r, this.setIndex = o, this.render = l, this.renderInstances = d, this.renderMultiDraw = u, this.renderMultiDrawInstances = p;
}
function Um(i) {
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
function Om(i, e, t) {
  const n = /* @__PURE__ */ new WeakMap(), r = new en();
  function s(a, o, l) {
    const d = a.morphTargetInfluences, u = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, p = u !== void 0 ? u.length : 0;
    let f = n.get(o);
    if (f === void 0 || f.count !== p) {
      let A = function() {
        C.dispose(), n.delete(o), o.removeEventListener("dispose", A);
      };
      f !== void 0 && f.texture.dispose();
      const m = o.morphAttributes.position !== void 0, _ = o.morphAttributes.normal !== void 0, x = o.morphAttributes.color !== void 0, c = o.morphAttributes.position || [], h = o.morphAttributes.normal || [], E = o.morphAttributes.color || [];
      let y = 0;
      m === !0 && (y = 1), _ === !0 && (y = 2), x === !0 && (y = 3);
      let w = o.attributes.position.count * y, I = 1;
      w > e.maxTextureSize && (I = Math.ceil(w / e.maxTextureSize), w = e.maxTextureSize);
      const R = new Float32Array(w * I * 4 * p), C = new bd(R, w, I, p);
      C.type = hi, C.needsUpdate = !0;
      const U = y * 4;
      for (let v = 0; v < p; v++) {
        const L = c[v], k = h[v], V = E[v], W = w * I * 4 * v;
        for (let Q = 0; Q < L.count; Q++) {
          const j = Q * U;
          m === !0 && (r.fromBufferAttribute(L, Q), R[W + j + 0] = r.x, R[W + j + 1] = r.y, R[W + j + 2] = r.z, R[W + j + 3] = 0), _ === !0 && (r.fromBufferAttribute(k, Q), R[W + j + 4] = r.x, R[W + j + 5] = r.y, R[W + j + 6] = r.z, R[W + j + 7] = 0), x === !0 && (r.fromBufferAttribute(V, Q), R[W + j + 8] = r.x, R[W + j + 9] = r.y, R[W + j + 10] = r.z, R[W + j + 11] = V.itemSize === 4 ? r.w : 1);
        }
      }
      f = {
        count: p,
        texture: C,
        size: new Ke(w, I)
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
function Fm(i, e, t, n) {
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
class Id extends xn {
  constructor(e, t, n, r, s, a, o, l, d, u = mr) {
    if (u !== mr && u !== Sr)
      throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    n === void 0 && u === mr && (n = xr), n === void 0 && u === Sr && (n = yr), super(null, r, s, a, o, l, u, n, d), this.isDepthTexture = !0, this.image = { width: e, height: t }, this.magFilter = o !== void 0 ? o : wn, this.minFilter = l !== void 0 ? l : wn, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(e) {
    return super.copy(e), this.compareFunction = e.compareFunction, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.compareFunction !== null && (t.compareFunction = this.compareFunction), t;
  }
}
const Dd = /* @__PURE__ */ new xn(), Ud = /* @__PURE__ */ new Id(1, 1);
Ud.compareFunction = yd;
const Od = /* @__PURE__ */ new bd(), Fd = /* @__PURE__ */ new Mu(), Bd = /* @__PURE__ */ new Pd(), Cc = [], Pc = [], Lc = new Float32Array(16), Nc = new Float32Array(9), Ic = new Float32Array(4);
function br(i, e, t) {
  const n = i[0];
  if (n <= 0 || n > 0) return i;
  const r = e * t;
  let s = Cc[r];
  if (s === void 0 && (s = new Float32Array(r), Cc[r] = s), e !== 0) {
    n.toArray(s, 0);
    for (let a = 1, o = 0; a !== e; ++a)
      o += t, i[a].toArray(s, o);
  }
  return s;
}
function jt(i, e) {
  if (i.length !== e.length) return !1;
  for (let t = 0, n = i.length; t < n; t++)
    if (i[t] !== e[t]) return !1;
  return !0;
}
function Kt(i, e) {
  for (let t = 0, n = e.length; t < n; t++)
    i[t] = e[t];
}
function Ks(i, e) {
  let t = Pc[e];
  t === void 0 && (t = new Int32Array(e), Pc[e] = t);
  for (let n = 0; n !== e; ++n)
    t[n] = i.allocateTextureUnit();
  return t;
}
function Bm(i, e) {
  const t = this.cache;
  t[0] !== e && (i.uniform1f(this.addr, e), t[0] = e);
}
function zm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (i.uniform2f(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (jt(t, e)) return;
    i.uniform2fv(this.addr, e), Kt(t, e);
  }
}
function km(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (i.uniform3f(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else if (e.r !== void 0)
    (t[0] !== e.r || t[1] !== e.g || t[2] !== e.b) && (i.uniform3f(this.addr, e.r, e.g, e.b), t[0] = e.r, t[1] = e.g, t[2] = e.b);
  else {
    if (jt(t, e)) return;
    i.uniform3fv(this.addr, e), Kt(t, e);
  }
}
function Vm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (i.uniform4f(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (jt(t, e)) return;
    i.uniform4fv(this.addr, e), Kt(t, e);
  }
}
function Hm(i, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (jt(t, e)) return;
    i.uniformMatrix2fv(this.addr, !1, e), Kt(t, e);
  } else {
    if (jt(t, n)) return;
    Ic.set(n), i.uniformMatrix2fv(this.addr, !1, Ic), Kt(t, n);
  }
}
function Gm(i, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (jt(t, e)) return;
    i.uniformMatrix3fv(this.addr, !1, e), Kt(t, e);
  } else {
    if (jt(t, n)) return;
    Nc.set(n), i.uniformMatrix3fv(this.addr, !1, Nc), Kt(t, n);
  }
}
function Wm(i, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (jt(t, e)) return;
    i.uniformMatrix4fv(this.addr, !1, e), Kt(t, e);
  } else {
    if (jt(t, n)) return;
    Lc.set(n), i.uniformMatrix4fv(this.addr, !1, Lc), Kt(t, n);
  }
}
function Xm(i, e) {
  const t = this.cache;
  t[0] !== e && (i.uniform1i(this.addr, e), t[0] = e);
}
function Ym(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (i.uniform2i(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (jt(t, e)) return;
    i.uniform2iv(this.addr, e), Kt(t, e);
  }
}
function qm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (i.uniform3i(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (jt(t, e)) return;
    i.uniform3iv(this.addr, e), Kt(t, e);
  }
}
function jm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (i.uniform4i(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (jt(t, e)) return;
    i.uniform4iv(this.addr, e), Kt(t, e);
  }
}
function Km(i, e) {
  const t = this.cache;
  t[0] !== e && (i.uniform1ui(this.addr, e), t[0] = e);
}
function $m(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (i.uniform2ui(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (jt(t, e)) return;
    i.uniform2uiv(this.addr, e), Kt(t, e);
  }
}
function Zm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (i.uniform3ui(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (jt(t, e)) return;
    i.uniform3uiv(this.addr, e), Kt(t, e);
  }
}
function Qm(i, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (i.uniform4ui(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (jt(t, e)) return;
    i.uniform4uiv(this.addr, e), Kt(t, e);
  }
}
function Jm(i, e, t) {
  const n = this.cache, r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r);
  const s = this.type === i.SAMPLER_2D_SHADOW ? Ud : Dd;
  t.setTexture2D(e || s, r);
}
function eg(i, e, t) {
  const n = this.cache, r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r), t.setTexture3D(e || Fd, r);
}
function tg(i, e, t) {
  const n = this.cache, r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r), t.setTextureCube(e || Bd, r);
}
function ng(i, e, t) {
  const n = this.cache, r = t.allocateTextureUnit();
  n[0] !== r && (i.uniform1i(this.addr, r), n[0] = r), t.setTexture2DArray(e || Od, r);
}
function ig(i) {
  switch (i) {
    case 5126:
      return Bm;
    case 35664:
      return zm;
    case 35665:
      return km;
    case 35666:
      return Vm;
    case 35674:
      return Hm;
    case 35675:
      return Gm;
    case 35676:
      return Wm;
    case 5124:
    case 35670:
      return Xm;
    case 35667:
    case 35671:
      return Ym;
    case 35668:
    case 35672:
      return qm;
    case 35669:
    case 35673:
      return jm;
    case 5125:
      return Km;
    case 36294:
      return $m;
    case 36295:
      return Zm;
    case 36296:
      return Qm;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Jm;
    case 35679:
    case 36299:
    case 36307:
      return eg;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return tg;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return ng;
  }
}
function rg(i, e) {
  i.uniform1fv(this.addr, e);
}
function sg(i, e) {
  const t = br(e, this.size, 2);
  i.uniform2fv(this.addr, t);
}
function ag(i, e) {
  const t = br(e, this.size, 3);
  i.uniform3fv(this.addr, t);
}
function og(i, e) {
  const t = br(e, this.size, 4);
  i.uniform4fv(this.addr, t);
}
function lg(i, e) {
  const t = br(e, this.size, 4);
  i.uniformMatrix2fv(this.addr, !1, t);
}
function cg(i, e) {
  const t = br(e, this.size, 9);
  i.uniformMatrix3fv(this.addr, !1, t);
}
function dg(i, e) {
  const t = br(e, this.size, 16);
  i.uniformMatrix4fv(this.addr, !1, t);
}
function hg(i, e) {
  i.uniform1iv(this.addr, e);
}
function ug(i, e) {
  i.uniform2iv(this.addr, e);
}
function fg(i, e) {
  i.uniform3iv(this.addr, e);
}
function pg(i, e) {
  i.uniform4iv(this.addr, e);
}
function mg(i, e) {
  i.uniform1uiv(this.addr, e);
}
function gg(i, e) {
  i.uniform2uiv(this.addr, e);
}
function _g(i, e) {
  i.uniform3uiv(this.addr, e);
}
function vg(i, e) {
  i.uniform4uiv(this.addr, e);
}
function xg(i, e, t) {
  const n = this.cache, r = e.length, s = Ks(t, r);
  jt(n, s) || (i.uniform1iv(this.addr, s), Kt(n, s));
  for (let a = 0; a !== r; ++a)
    t.setTexture2D(e[a] || Dd, s[a]);
}
function yg(i, e, t) {
  const n = this.cache, r = e.length, s = Ks(t, r);
  jt(n, s) || (i.uniform1iv(this.addr, s), Kt(n, s));
  for (let a = 0; a !== r; ++a)
    t.setTexture3D(e[a] || Fd, s[a]);
}
function Sg(i, e, t) {
  const n = this.cache, r = e.length, s = Ks(t, r);
  jt(n, s) || (i.uniform1iv(this.addr, s), Kt(n, s));
  for (let a = 0; a !== r; ++a)
    t.setTextureCube(e[a] || Bd, s[a]);
}
function Mg(i, e, t) {
  const n = this.cache, r = e.length, s = Ks(t, r);
  jt(n, s) || (i.uniform1iv(this.addr, s), Kt(n, s));
  for (let a = 0; a !== r; ++a)
    t.setTexture2DArray(e[a] || Od, s[a]);
}
function Eg(i) {
  switch (i) {
    case 5126:
      return rg;
    case 35664:
      return sg;
    case 35665:
      return ag;
    case 35666:
      return og;
    case 35674:
      return lg;
    case 35675:
      return cg;
    case 35676:
      return dg;
    case 5124:
    case 35670:
      return hg;
    case 35667:
    case 35671:
      return ug;
    case 35668:
    case 35672:
      return fg;
    case 35669:
    case 35673:
      return pg;
    case 5125:
      return mg;
    case 36294:
      return gg;
    case 36295:
      return _g;
    case 36296:
      return vg;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return xg;
    case 35679:
    case 36299:
    case 36307:
      return yg;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Sg;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Mg;
  }
}
class bg {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.setValue = ig(t.type);
  }
}
class Tg {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = Eg(t.type);
  }
}
class Ag {
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
const Ha = /(\w+)(\])?(\[|\.)?/g;
function Dc(i, e) {
  i.seq.push(e), i.map[e.id] = e;
}
function wg(i, e, t) {
  const n = i.name, r = n.length;
  for (Ha.lastIndex = 0; ; ) {
    const s = Ha.exec(n), a = Ha.lastIndex;
    let o = s[1];
    const l = s[2] === "]", d = s[3];
    if (l && (o = o | 0), d === void 0 || d === "[" && a + 2 === r) {
      Dc(t, d === void 0 ? new bg(o, i, e) : new Tg(o, i, e));
      break;
    } else {
      let p = t.map[o];
      p === void 0 && (p = new Ag(o), Dc(t, p)), t = p;
    }
  }
}
class Ns {
  constructor(e, t) {
    this.seq = [], this.map = {};
    const n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let r = 0; r < n; ++r) {
      const s = e.getActiveUniform(t, r), a = e.getUniformLocation(t, s.name);
      wg(s, a, this);
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
function Uc(i, e, t) {
  const n = i.createShader(e);
  return i.shaderSource(n, t), i.compileShader(n), n;
}
const Rg = 37297;
let Cg = 0;
function Pg(i, e) {
  const t = i.split(`
`), n = [], r = Math.max(e - 6, 0), s = Math.min(e + 6, t.length);
  for (let a = r; a < s; a++) {
    const o = a + 1;
    n.push(`${o === e ? ">" : " "} ${o}: ${t[a]}`);
  }
  return n.join(`
`);
}
function Lg(i) {
  const e = xt.getPrimaries(xt.workingColorSpace), t = xt.getPrimaries(i);
  let n;
  switch (e === t ? n = "" : e === Bs && t === Fs ? n = "LinearDisplayP3ToLinearSRGB" : e === Fs && t === Bs && (n = "LinearSRGBToLinearDisplayP3"), i) {
    case _i:
    case Xs:
      return [n, "LinearTransferOETF"];
    case Bn:
    case fo:
      return [n, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space:", i), [n, "LinearTransferOETF"];
  }
}
function Oc(i, e, t) {
  const n = i.getShaderParameter(e, i.COMPILE_STATUS), r = i.getShaderInfoLog(e).trim();
  if (n && r === "") return "";
  const s = /ERROR: 0:(\d+)/.exec(r);
  if (s) {
    const a = parseInt(s[1]);
    return t.toUpperCase() + `

` + r + `

` + Pg(i.getShaderSource(e), a);
  } else
    return r;
}
function Ng(i, e) {
  const t = Lg(e);
  return `vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`;
}
function Ig(i, e) {
  let t;
  switch (e) {
    case zh:
      t = "Linear";
      break;
    case kh:
      t = "Reinhard";
      break;
    case Vh:
      t = "OptimizedCineon";
      break;
    case Hh:
      t = "ACESFilmic";
      break;
    case Wh:
      t = "AgX";
      break;
    case Xh:
      t = "Neutral";
      break;
    case Gh:
      t = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", e), t = "Linear";
  }
  return "vec3 " + i + "( vec3 color ) { return " + t + "ToneMapping( color ); }";
}
function Dg(i) {
  return [
    i.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    i.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
  ].filter(Vr).join(`
`);
}
function Ug(i) {
  const e = [];
  for (const t in i) {
    const n = i[t];
    n !== !1 && e.push("#define " + t + " " + n);
  }
  return e.join(`
`);
}
function Og(i, e) {
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
function Vr(i) {
  return i !== "";
}
function Fc(i, e) {
  const t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
  return i.replace(/NUM_DIR_LIGHTS/g, e.numDirLights).replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, t).replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, e.numPointLights).replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
}
function Bc(i, e) {
  return i.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
}
const Fg = /^[ \t]*#include +<([\w\d./]+)>/gm;
function ao(i) {
  return i.replace(Fg, zg);
}
const Bg = /* @__PURE__ */ new Map();
function zg(i, e) {
  let t = at[e];
  if (t === void 0) {
    const n = Bg.get(e);
    if (n !== void 0)
      t = at[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', e, n);
    else
      throw new Error("Can not resolve #include <" + e + ">");
  }
  return ao(t);
}
const kg = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function zc(i) {
  return i.replace(kg, Vg);
}
function Vg(i, e, t, n) {
  let r = "";
  for (let s = parseInt(e); s < parseInt(t); s++)
    r += n.replace(/\[\s*i\s*\]/g, "[ " + s + " ]").replace(/UNROLLED_LOOP_INDEX/g, s);
  return r;
}
function kc(i) {
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
function Hg(i) {
  let e = "SHADOWMAP_TYPE_BASIC";
  return i.shadowMapType === hd ? e = "SHADOWMAP_TYPE_PCF" : i.shadowMapType === hh ? e = "SHADOWMAP_TYPE_PCF_SOFT" : i.shadowMapType === Qn && (e = "SHADOWMAP_TYPE_VSM"), e;
}
function Gg(i) {
  let e = "ENVMAP_TYPE_CUBE";
  if (i.envMap)
    switch (i.envMapMode) {
      case _r:
      case vr:
        e = "ENVMAP_TYPE_CUBE";
        break;
      case Gs:
        e = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  return e;
}
function Wg(i) {
  let e = "ENVMAP_MODE_REFLECTION";
  if (i.envMap)
    switch (i.envMapMode) {
      case vr:
        e = "ENVMAP_MODE_REFRACTION";
        break;
    }
  return e;
}
function Xg(i) {
  let e = "ENVMAP_BLENDING_NONE";
  if (i.envMap)
    switch (i.combine) {
      case uo:
        e = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case Fh:
        e = "ENVMAP_BLENDING_MIX";
        break;
      case Bh:
        e = "ENVMAP_BLENDING_ADD";
        break;
    }
  return e;
}
function Yg(i) {
  const e = i.envMapCubeUVHeight;
  if (e === null) return null;
  const t = Math.log2(e) - 2, n = 1 / e;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 7 * 16)), texelHeight: n, maxMip: t };
}
function qg(i, e, t, n) {
  const r = i.getContext(), s = t.defines;
  let a = t.vertexShader, o = t.fragmentShader;
  const l = Hg(t), d = Gg(t), u = Wg(t), p = Xg(t), f = Yg(t), m = Dg(t), _ = Ug(s), x = r.createProgram();
  let c, h, E = t.glslVersion ? "#version " + t.glslVersion + `
` : "";
  t.isRawShaderMaterial ? (c = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    _
  ].filter(Vr).join(`
`), c.length > 0 && (c += `
`), h = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    _
  ].filter(Vr).join(`
`), h.length > 0 && (h += `
`)) : (c = [
    kc(t),
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
  ].filter(Vr).join(`
`), h = [
    kc(t),
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
    t.toneMapping !== fi ? "#define TONE_MAPPING" : "",
    t.toneMapping !== fi ? at.tonemapping_pars_fragment : "",
    // this code is required here because it is used by the toneMapping() function defined below
    t.toneMapping !== fi ? Ig("toneMapping", t.toneMapping) : "",
    t.dithering ? "#define DITHERING" : "",
    t.opaque ? "#define OPAQUE" : "",
    at.colorspace_pars_fragment,
    // this code is required here because it is used by the various encoding/decoding function defined below
    Ng("linearToOutputTexel", t.outputColorSpace),
    t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "",
    `
`
  ].filter(Vr).join(`
`)), a = ao(a), a = Fc(a, t), a = Bc(a, t), o = ao(o), o = Fc(o, t), o = Bc(o, t), a = zc(a), o = zc(o), t.isRawShaderMaterial !== !0 && (E = `#version 300 es
`, c = [
    m,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + c, h = [
    "#define varying in",
    t.glslVersion === nc ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    t.glslVersion === nc ? "" : "#define gl_FragColor pc_fragColor",
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
  const y = E + c + a, w = E + h + o, I = Uc(r, r.VERTEX_SHADER, y), R = Uc(r, r.FRAGMENT_SHADER, w);
  r.attachShader(x, I), r.attachShader(x, R), t.index0AttributeName !== void 0 ? r.bindAttribLocation(x, 0, t.index0AttributeName) : t.morphTargets === !0 && r.bindAttribLocation(x, 0, "position"), r.linkProgram(x);
  function C(L) {
    if (i.debug.checkShaderErrors) {
      const k = r.getProgramInfoLog(x).trim(), V = r.getShaderInfoLog(I).trim(), W = r.getShaderInfoLog(R).trim();
      let Q = !0, j = !0;
      if (r.getProgramParameter(x, r.LINK_STATUS) === !1)
        if (Q = !1, typeof i.debug.onShaderError == "function")
          i.debug.onShaderError(r, x, I, R);
        else {
          const ie = Oc(r, I, "vertex"), K = Oc(r, R, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " + r.getError() + " - VALIDATE_STATUS " + r.getProgramParameter(x, r.VALIDATE_STATUS) + `

Material Name: ` + L.name + `
Material Type: ` + L.type + `

Program Info Log: ` + k + `
` + ie + `
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
    r.deleteShader(I), r.deleteShader(R), U = new Ns(r, x), A = Og(r, x);
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
    return v === !1 && (v = r.getProgramParameter(x, Rg)), v;
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), r.deleteProgram(x), this.program = void 0;
  }, this.type = t.shaderType, this.name = t.shaderName, this.id = Cg++, this.cacheKey = e, this.usedTimes = 1, this.program = x, this.vertexShader = I, this.fragmentShader = R, this;
}
let jg = 0;
class Kg {
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
    return n === void 0 && (n = new $g(e), t.set(e, n)), n;
  }
}
class $g {
  constructor(e) {
    this.id = jg++, this.code = e, this.usedTimes = 0;
  }
}
function Zg(i, e, t, n, r, s, a) {
  const o = new po(), l = new Kg(), d = /* @__PURE__ */ new Set(), u = [], p = r.logarithmicDepthBuffer, f = r.vertexTextures;
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
    const W = k.fog, Q = V.geometry, j = A.isMeshStandardMaterial ? k.environment : null, ie = (A.isMeshStandardMaterial ? t : e).get(A.envMap || j), K = ie && ie.mapping === Gs ? ie.image.height : null, de = _[A.type];
    A.precision !== null && (m = r.getMaxPrecision(A.precision), m !== A.precision && console.warn("THREE.WebGLProgram.getParameters:", A.precision, "not supported, using", m, "instead."));
    const ve = Q.morphAttributes.position || Q.morphAttributes.normal || Q.morphAttributes.color, Ee = ve !== void 0 ? ve.length : 0;
    let tt = 0;
    Q.morphAttributes.position !== void 0 && (tt = 1), Q.morphAttributes.normal !== void 0 && (tt = 2), Q.morphAttributes.color !== void 0 && (tt = 3);
    let ct, J, oe, be;
    if (de) {
      const dt = zn[de];
      ct = dt.vertexShader, J = dt.fragmentShader;
    } else
      ct = A.vertexShader, J = A.fragmentShader, l.update(A), oe = l.getVertexShaderID(A), be = l.getFragmentShaderID(A);
    const ue = i.getRenderTarget(), Je = V.isInstancedMesh === !0, Ve = V.isBatchedMesh === !0, nt = !!A.map, D = !!A.matcap, it = !!ie, rt = !!A.aoMap, yt = !!A.lightMap, Oe = !!A.bumpMap, $e = !!A.normalMap, et = !!A.displacementMap, Ze = !!A.emissiveMap, Ct = !!A.metalnessMap, P = !!A.roughnessMap, S = A.anisotropy > 0, Y = A.clearcoat > 0, re = A.dispersion > 0, ae = A.iridescence > 0, ne = A.sheen > 0, Pe = A.transmission > 0, pe = S && !!A.anisotropyMap, me = Y && !!A.clearcoatMap, Qe = Y && !!A.clearcoatNormalMap, ce = Y && !!A.clearcoatRoughnessMap, Ie = ae && !!A.iridescenceMap, st = ae && !!A.iridescenceThicknessMap, Fe = ne && !!A.sheenColorMap, xe = ne && !!A.sheenRoughnessMap, qe = !!A.specularMap, Ye = !!A.specularColorMap, St = !!A.specularIntensityMap, g = Pe && !!A.transmissionMap, q = Pe && !!A.thicknessMap, z = !!A.gradientMap, $ = !!A.alphaMap, te = A.alphaTest > 0, Le = !!A.alphaHash, He = !!A.extensions;
    let Pt = fi;
    A.toneMapped && (ue === null || ue.isXRRenderTarget === !0) && (Pt = i.toneMapping);
    const Dt = {
      shaderID: de,
      shaderType: A.type,
      shaderName: A.name,
      vertexShader: ct,
      fragmentShader: J,
      defines: A.defines,
      customVertexShaderID: oe,
      customFragmentShaderID: be,
      isRawShaderMaterial: A.isRawShaderMaterial === !0,
      glslVersion: A.glslVersion,
      precision: m,
      batching: Ve,
      batchingColor: Ve && V._colorsTexture !== null,
      instancing: Je,
      instancingColor: Je && V.instanceColor !== null,
      instancingMorph: Je && V.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace: ue === null ? i.outputColorSpace : ue.isXRRenderTarget === !0 ? ue.texture.colorSpace : _i,
      alphaToCoverage: !!A.alphaToCoverage,
      map: nt,
      matcap: D,
      envMap: it,
      envMapMode: it && ie.mapping,
      envMapCubeUVHeight: K,
      aoMap: rt,
      lightMap: yt,
      bumpMap: Oe,
      normalMap: $e,
      displacementMap: f && et,
      emissiveMap: Ze,
      normalMapObjectSpace: $e && A.normalMapType === su,
      normalMapTangentSpace: $e && A.normalMapType === xd,
      metalnessMap: Ct,
      roughnessMap: P,
      anisotropy: S,
      anisotropyMap: pe,
      clearcoat: Y,
      clearcoatMap: me,
      clearcoatNormalMap: Qe,
      clearcoatRoughnessMap: ce,
      dispersion: re,
      iridescence: ae,
      iridescenceMap: Ie,
      iridescenceThicknessMap: st,
      sheen: ne,
      sheenColorMap: Fe,
      sheenRoughnessMap: xe,
      specularMap: qe,
      specularColorMap: Ye,
      specularIntensityMap: St,
      transmission: Pe,
      transmissionMap: g,
      thicknessMap: q,
      gradientMap: z,
      opaque: A.transparent === !1 && A.blending === pr && A.alphaToCoverage === !1,
      alphaMap: $,
      alphaTest: te,
      alphaHash: Le,
      combine: A.combine,
      //
      mapUv: nt && x(A.map.channel),
      aoMapUv: rt && x(A.aoMap.channel),
      lightMapUv: yt && x(A.lightMap.channel),
      bumpMapUv: Oe && x(A.bumpMap.channel),
      normalMapUv: $e && x(A.normalMap.channel),
      displacementMapUv: et && x(A.displacementMap.channel),
      emissiveMapUv: Ze && x(A.emissiveMap.channel),
      metalnessMapUv: Ct && x(A.metalnessMap.channel),
      roughnessMapUv: P && x(A.roughnessMap.channel),
      anisotropyMapUv: pe && x(A.anisotropyMap.channel),
      clearcoatMapUv: me && x(A.clearcoatMap.channel),
      clearcoatNormalMapUv: Qe && x(A.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: ce && x(A.clearcoatRoughnessMap.channel),
      iridescenceMapUv: Ie && x(A.iridescenceMap.channel),
      iridescenceThicknessMapUv: st && x(A.iridescenceThicknessMap.channel),
      sheenColorMapUv: Fe && x(A.sheenColorMap.channel),
      sheenRoughnessMapUv: xe && x(A.sheenRoughnessMap.channel),
      specularMapUv: qe && x(A.specularMap.channel),
      specularColorMapUv: Ye && x(A.specularColorMap.channel),
      specularIntensityMapUv: St && x(A.specularIntensityMap.channel),
      transmissionMapUv: g && x(A.transmissionMap.channel),
      thicknessMapUv: q && x(A.thicknessMap.channel),
      alphaMapUv: $ && x(A.alphaMap.channel),
      //
      vertexTangents: !!Q.attributes.tangent && ($e || S),
      vertexColors: A.vertexColors,
      vertexAlphas: A.vertexColors === !0 && !!Q.attributes.color && Q.attributes.color.itemSize === 4,
      pointsUvs: V.isPoints === !0 && !!Q.attributes.uv && (nt || $),
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
      morphTextureStride: tt,
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
      toneMapping: Pt,
      decodeVideoTexture: nt && A.map.isVideoTexture === !0 && xt.getTransfer(A.map.colorSpace) === It,
      premultipliedAlpha: A.premultipliedAlpha,
      doubleSided: A.side === kn,
      flipSided: A.side === vn,
      useDepthPacking: A.depthPacking >= 0,
      depthPacking: A.depthPacking || 0,
      index0AttributeName: A.index0AttributeName,
      extensionClipCullDistance: He && A.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: He && A.extensions.multiDraw === !0 && n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: A.customProgramCacheKey()
    };
    return Dt.vertexUv1s = d.has(1), Dt.vertexUv2s = d.has(2), Dt.vertexUv3s = d.has(3), d.clear(), Dt;
  }
  function h(A) {
    const v = [];
    if (A.shaderID ? v.push(A.shaderID) : (v.push(A.customVertexShaderID), v.push(A.customFragmentShaderID)), A.defines !== void 0)
      for (const L in A.defines)
        v.push(L), v.push(A.defines[L]);
    return A.isRawShaderMaterial === !1 && (E(v, A), y(v, A), v.push(i.outputColorSpace)), v.push(A.customProgramCacheKey), v.join();
  }
  function E(A, v) {
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
      L = Du.clone(k.uniforms);
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
    return L === void 0 && (L = new qg(i, v, A, s), u.push(L)), L;
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
function Qg() {
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
function Jg(i, e) {
  return i.groupOrder !== e.groupOrder ? i.groupOrder - e.groupOrder : i.renderOrder !== e.renderOrder ? i.renderOrder - e.renderOrder : i.material.id !== e.material.id ? i.material.id - e.material.id : i.z !== e.z ? i.z - e.z : i.id - e.id;
}
function Vc(i, e) {
  return i.groupOrder !== e.groupOrder ? i.groupOrder - e.groupOrder : i.renderOrder !== e.renderOrder ? i.renderOrder - e.renderOrder : i.z !== e.z ? e.z - i.z : i.id - e.id;
}
function Hc() {
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
    t.length > 1 && t.sort(p || Jg), n.length > 1 && n.sort(f || Vc), r.length > 1 && r.sort(f || Vc);
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
function e_() {
  let i = /* @__PURE__ */ new WeakMap();
  function e(n, r) {
    const s = i.get(n);
    let a;
    return s === void 0 ? (a = new Hc(), i.set(n, [a])) : r >= s.length ? (a = new Hc(), s.push(a)) : a = s[r], a;
  }
  function t() {
    i = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    dispose: t
  };
}
function t_() {
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
            color: new ft()
          };
          break;
        case "SpotLight":
          t = {
            position: new N(),
            direction: new N(),
            color: new ft(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          t = {
            position: new N(),
            color: new ft(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          t = {
            direction: new N(),
            skyColor: new ft(),
            groundColor: new ft()
          };
          break;
        case "RectAreaLight":
          t = {
            color: new ft(),
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
function n_() {
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
            shadowMapSize: new Ke()
          };
          break;
        case "SpotLight":
          t = {
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Ke()
          };
          break;
        case "PointLight":
          t = {
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Ke(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break;
      }
      return i[e.id] = t, t;
    }
  };
}
let i_ = 0;
function r_(i, e) {
  return (e.castShadow ? 2 : 0) - (i.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (i.map ? 1 : 0);
}
function s_(i) {
  const e = new t_(), t = n_(), n = {
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
  const r = new N(), s = new Et(), a = new Et();
  function o(d) {
    let u = 0, p = 0, f = 0;
    for (let A = 0; A < 9; A++) n.probe[A].set(0, 0, 0);
    let m = 0, _ = 0, x = 0, c = 0, h = 0, E = 0, y = 0, w = 0, I = 0, R = 0, C = 0;
    d.sort(r_);
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
          const ie = L.shadow, K = t.get(L);
          K.shadowBias = ie.bias, K.shadowNormalBias = ie.normalBias, K.shadowRadius = ie.radius, K.shadowMapSize = ie.mapSize, n.directionalShadow[m] = K, n.directionalShadowMap[m] = Q, n.directionalShadowMatrix[m] = L.shadow.matrix, E++;
        }
        n.directional[m] = j, m++;
      } else if (L.isSpotLight) {
        const j = e.get(L);
        j.position.setFromMatrixPosition(L.matrixWorld), j.color.copy(k).multiplyScalar(V), j.distance = W, j.coneCos = Math.cos(L.angle), j.penumbraCos = Math.cos(L.angle * (1 - L.penumbra)), j.decay = L.decay, n.spot[x] = j;
        const ie = L.shadow;
        if (L.map && (n.spotLightMap[I] = L.map, I++, ie.updateMatrices(L), L.castShadow && R++), n.spotLightMatrix[x] = ie.matrix, L.castShadow) {
          const K = t.get(L);
          K.shadowBias = ie.bias, K.shadowNormalBias = ie.normalBias, K.shadowRadius = ie.radius, K.shadowMapSize = ie.mapSize, n.spotShadow[x] = K, n.spotShadowMap[x] = Q, w++;
        }
        x++;
      } else if (L.isRectAreaLight) {
        const j = e.get(L);
        j.color.copy(k).multiplyScalar(V), j.halfWidth.set(L.width * 0.5, 0, 0), j.halfHeight.set(0, L.height * 0.5, 0), n.rectArea[c] = j, c++;
      } else if (L.isPointLight) {
        const j = e.get(L);
        if (j.color.copy(L.color).multiplyScalar(L.intensity), j.distance = L.distance, j.decay = L.decay, L.castShadow) {
          const ie = L.shadow, K = t.get(L);
          K.shadowBias = ie.bias, K.shadowNormalBias = ie.normalBias, K.shadowRadius = ie.radius, K.shadowMapSize = ie.mapSize, K.shadowCameraNear = ie.camera.near, K.shadowCameraFar = ie.camera.far, n.pointShadow[_] = K, n.pointShadowMap[_] = Q, n.pointShadowMatrix[_] = L.shadow.matrix, y++;
        }
        n.point[_] = j, _++;
      } else if (L.isHemisphereLight) {
        const j = e.get(L);
        j.skyColor.copy(L.color).multiplyScalar(V), j.groundColor.copy(L.groundColor).multiplyScalar(V), n.hemi[h] = j, h++;
      }
    }
    c > 0 && (i.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = Se.LTC_FLOAT_1, n.rectAreaLTC2 = Se.LTC_FLOAT_2) : (n.rectAreaLTC1 = Se.LTC_HALF_1, n.rectAreaLTC2 = Se.LTC_HALF_2)), n.ambient[0] = u, n.ambient[1] = p, n.ambient[2] = f;
    const U = n.hash;
    (U.directionalLength !== m || U.pointLength !== _ || U.spotLength !== x || U.rectAreaLength !== c || U.hemiLength !== h || U.numDirectionalShadows !== E || U.numPointShadows !== y || U.numSpotShadows !== w || U.numSpotMaps !== I || U.numLightProbes !== C) && (n.directional.length = m, n.spot.length = x, n.rectArea.length = c, n.point.length = _, n.hemi.length = h, n.directionalShadow.length = E, n.directionalShadowMap.length = E, n.pointShadow.length = y, n.pointShadowMap.length = y, n.spotShadow.length = w, n.spotShadowMap.length = w, n.directionalShadowMatrix.length = E, n.pointShadowMatrix.length = y, n.spotLightMatrix.length = w + I - R, n.spotLightMap.length = I, n.numSpotLightShadowsWithMaps = R, n.numLightProbes = C, U.directionalLength = m, U.pointLength = _, U.spotLength = x, U.rectAreaLength = c, U.hemiLength = h, U.numDirectionalShadows = E, U.numPointShadows = y, U.numSpotShadows = w, U.numSpotMaps = I, U.numLightProbes = C, n.version = i_++);
  }
  function l(d, u) {
    let p = 0, f = 0, m = 0, _ = 0, x = 0;
    const c = u.matrixWorldInverse;
    for (let h = 0, E = d.length; h < E; h++) {
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
function Gc(i) {
  const e = new s_(i), t = [], n = [];
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
function a_(i) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(r, s = 0) {
    const a = e.get(r);
    let o;
    return a === void 0 ? (o = new Gc(i), e.set(r, [o])) : s >= a.length ? (o = new Gc(i), a.push(o)) : o = a[s], o;
  }
  function n() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: n
  };
}
class o_ extends Er {
  constructor(e) {
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = iu, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
  }
}
class l_ extends Er {
  constructor(e) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
  }
}
const c_ = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, d_ = `uniform sampler2D shadow_pass;
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
function h_(i, e, t) {
  let n = new mo();
  const r = new Ke(), s = new Ke(), a = new en(), o = new o_({ depthPacking: ru }), l = new l_(), d = {}, u = t.maxTextureSize, p = { [pi]: vn, [vn]: pi, [kn]: kn }, f = new gi({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new Ke() },
      radius: { value: 4 }
    },
    vertexShader: c_,
    fragmentShader: d_
  }), m = f.clone();
  m.defines.HORIZONTAL_PASS = 1;
  const _ = new dn();
  _.setAttribute(
    "position",
    new Gn(
      new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
      3
    )
  );
  const x = new Te(_, f), c = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = hd;
  let h = this.type;
  this.render = function(R, C, U) {
    if (c.enabled === !1 || c.autoUpdate === !1 && c.needsUpdate === !1 || R.length === 0) return;
    const A = i.getRenderTarget(), v = i.getActiveCubeFace(), L = i.getActiveMipmapLevel(), k = i.state;
    k.setBlending(ui), k.buffers.color.setClear(1, 1, 1, 1), k.buffers.depth.setTest(!0), k.setScissorTest(!1);
    const V = h !== Qn && this.type === Qn, W = h === Qn && this.type !== Qn;
    for (let Q = 0, j = R.length; Q < j; Q++) {
      const ie = R[Q], K = ie.shadow;
      if (K === void 0) {
        console.warn("THREE.WebGLShadowMap:", ie, "has no shadow.");
        continue;
      }
      if (K.autoUpdate === !1 && K.needsUpdate === !1) continue;
      r.copy(K.mapSize);
      const de = K.getFrameExtents();
      if (r.multiply(de), s.copy(K.mapSize), (r.x > u || r.y > u) && (r.x > u && (s.x = Math.floor(u / de.x), r.x = s.x * de.x, K.mapSize.x = s.x), r.y > u && (s.y = Math.floor(u / de.y), r.y = s.y * de.y, K.mapSize.y = s.y)), K.map === null || V === !0 || W === !0) {
        const Ee = this.type !== Qn ? { minFilter: wn, magFilter: wn } : {};
        K.map !== null && K.map.dispose(), K.map = new Ui(r.x, r.y, Ee), K.map.texture.name = ie.name + ".shadowMap", K.camera.updateProjectionMatrix();
      }
      i.setRenderTarget(K.map), i.clear();
      const ve = K.getViewportCount();
      for (let Ee = 0; Ee < ve; Ee++) {
        const tt = K.getViewport(Ee);
        a.set(
          s.x * tt.x,
          s.y * tt.y,
          s.x * tt.z,
          s.y * tt.w
        ), k.viewport(a), K.updateMatrices(ie, Ee), n = K.getFrustum(), w(C, U, K.camera, ie, this.type);
      }
      K.isPointLightShadow !== !0 && this.type === Qn && E(K, U), K.needsUpdate = !1;
    }
    h = this.type, c.needsUpdate = !1, i.setRenderTarget(A, v, L);
  };
  function E(R, C) {
    const U = e.update(x);
    f.defines.VSM_SAMPLES !== R.blurSamples && (f.defines.VSM_SAMPLES = R.blurSamples, m.defines.VSM_SAMPLES = R.blurSamples, f.needsUpdate = !0, m.needsUpdate = !0), R.mapPass === null && (R.mapPass = new Ui(r.x, r.y)), f.uniforms.shadow_pass.value = R.map.texture, f.uniforms.resolution.value = R.mapSize, f.uniforms.radius.value = R.radius, i.setRenderTarget(R.mapPass), i.clear(), i.renderBufferDirect(C, null, U, f, x, null), m.uniforms.shadow_pass.value = R.mapPass.texture, m.uniforms.resolution.value = R.mapSize, m.uniforms.radius.value = R.radius, i.setRenderTarget(R.map), i.clear(), i.renderBufferDirect(C, null, U, m, x, null);
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
    if (v.visible = C.visible, v.wireframe = C.wireframe, A === Qn ? v.side = C.shadowSide !== null ? C.shadowSide : C.side : v.side = C.shadowSide !== null ? C.shadowSide : p[C.side], v.alphaMap = C.alphaMap, v.alphaTest = C.alphaTest, v.map = C.map, v.clipShadows = C.clipShadows, v.clippingPlanes = C.clippingPlanes, v.clipIntersection = C.clipIntersection, v.displacementMap = C.displacementMap, v.displacementScale = C.displacementScale, v.displacementBias = C.displacementBias, v.wireframeLinewidth = C.wireframeLinewidth, v.linewidth = C.linewidth, U.isPointLight === !0 && v.isMeshDistanceMaterial === !0) {
      const k = i.properties.get(v);
      k.light = U;
    }
    return v;
  }
  function w(R, C, U, A, v) {
    if (R.visible === !1) return;
    if (R.layers.test(C.layers) && (R.isMesh || R.isLine || R.isPoints) && (R.castShadow || R.receiveShadow && v === Qn) && (!R.frustumCulled || n.intersectsObject(R))) {
      R.modelViewMatrix.multiplyMatrices(U.matrixWorldInverse, R.matrixWorld);
      const V = e.update(R), W = R.material;
      if (Array.isArray(W)) {
        const Q = V.groups;
        for (let j = 0, ie = Q.length; j < ie; j++) {
          const K = Q[j], de = W[K.materialIndex];
          if (de && de.visible) {
            const ve = y(R, de, A, v);
            R.onBeforeShadow(i, R, C, U, V, ve, K), i.renderBufferDirect(U, null, V, ve, R, K), R.onAfterShadow(i, R, C, U, V, ve, K);
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
function u_(i) {
  function e() {
    let g = !1;
    const q = new en();
    let z = null;
    const $ = new en(0, 0, 0, 0);
    return {
      setMask: function(te) {
        z !== te && !g && (i.colorMask(te, te, te, te), z = te);
      },
      setLocked: function(te) {
        g = te;
      },
      setClear: function(te, Le, He, Pt, Dt) {
        Dt === !0 && (te *= Pt, Le *= Pt, He *= Pt), q.set(te, Le, He, Pt), $.equals(q) === !1 && (i.clearColor(te, Le, He, Pt), $.copy(q));
      },
      reset: function() {
        g = !1, z = null, $.set(-1, 0, 0, 0);
      }
    };
  }
  function t() {
    let g = !1, q = null, z = null, $ = null;
    return {
      setTest: function(te) {
        te ? be(i.DEPTH_TEST) : ue(i.DEPTH_TEST);
      },
      setMask: function(te) {
        q !== te && !g && (i.depthMask(te), q = te);
      },
      setFunc: function(te) {
        if (z !== te) {
          switch (te) {
            case Ph:
              i.depthFunc(i.NEVER);
              break;
            case Lh:
              i.depthFunc(i.ALWAYS);
              break;
            case Nh:
              i.depthFunc(i.LESS);
              break;
            case Ds:
              i.depthFunc(i.LEQUAL);
              break;
            case Ih:
              i.depthFunc(i.EQUAL);
              break;
            case Dh:
              i.depthFunc(i.GEQUAL);
              break;
            case Uh:
              i.depthFunc(i.GREATER);
              break;
            case Oh:
              i.depthFunc(i.NOTEQUAL);
              break;
            default:
              i.depthFunc(i.LEQUAL);
          }
          z = te;
        }
      },
      setLocked: function(te) {
        g = te;
      },
      setClear: function(te) {
        $ !== te && (i.clearDepth(te), $ = te);
      },
      reset: function() {
        g = !1, q = null, z = null, $ = null;
      }
    };
  }
  function n() {
    let g = !1, q = null, z = null, $ = null, te = null, Le = null, He = null, Pt = null, Dt = null;
    return {
      setTest: function(dt) {
        g || (dt ? be(i.STENCIL_TEST) : ue(i.STENCIL_TEST));
      },
      setMask: function(dt) {
        q !== dt && !g && (i.stencilMask(dt), q = dt);
      },
      setFunc: function(dt, wt, Ot) {
        (z !== dt || $ !== wt || te !== Ot) && (i.stencilFunc(dt, wt, Ot), z = dt, $ = wt, te = Ot);
      },
      setOp: function(dt, wt, Ot) {
        (Le !== dt || He !== wt || Pt !== Ot) && (i.stencilOp(dt, wt, Ot), Le = dt, He = wt, Pt = Ot);
      },
      setLocked: function(dt) {
        g = dt;
      },
      setClear: function(dt) {
        Dt !== dt && (i.clearStencil(dt), Dt = dt);
      },
      reset: function() {
        g = !1, q = null, z = null, $ = null, te = null, Le = null, He = null, Pt = null, Dt = null;
      }
    };
  }
  const r = new e(), s = new t(), a = new n(), o = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap();
  let d = {}, u = {}, p = /* @__PURE__ */ new WeakMap(), f = [], m = null, _ = !1, x = null, c = null, h = null, E = null, y = null, w = null, I = null, R = new ft(0, 0, 0), C = 0, U = !1, A = null, v = null, L = null, k = null, V = null;
  const W = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let Q = !1, j = 0;
  const ie = i.getParameter(i.VERSION);
  ie.indexOf("WebGL") !== -1 ? (j = parseFloat(/^WebGL (\d)/.exec(ie)[1]), Q = j >= 1) : ie.indexOf("OpenGL ES") !== -1 && (j = parseFloat(/^OpenGL ES (\d)/.exec(ie)[1]), Q = j >= 2);
  let K = null, de = {};
  const ve = i.getParameter(i.SCISSOR_BOX), Ee = i.getParameter(i.VIEWPORT), tt = new en().fromArray(ve), ct = new en().fromArray(Ee);
  function J(g, q, z, $) {
    const te = new Uint8Array(4), Le = i.createTexture();
    i.bindTexture(g, Le), i.texParameteri(g, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(g, i.TEXTURE_MAG_FILTER, i.NEAREST);
    for (let He = 0; He < z; He++)
      g === i.TEXTURE_3D || g === i.TEXTURE_2D_ARRAY ? i.texImage3D(q, 0, i.RGBA, 1, 1, $, 0, i.RGBA, i.UNSIGNED_BYTE, te) : i.texImage2D(q + He, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, te);
    return Le;
  }
  const oe = {};
  oe[i.TEXTURE_2D] = J(i.TEXTURE_2D, i.TEXTURE_2D, 1), oe[i.TEXTURE_CUBE_MAP] = J(i.TEXTURE_CUBE_MAP, i.TEXTURE_CUBE_MAP_POSITIVE_X, 6), oe[i.TEXTURE_2D_ARRAY] = J(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1), oe[i.TEXTURE_3D] = J(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1), r.setClear(0, 0, 0, 1), s.setClear(1), a.setClear(0), be(i.DEPTH_TEST), s.setFunc(Ds), Oe(!1), $e(bl), be(i.CULL_FACE), rt(ui);
  function be(g) {
    d[g] !== !0 && (i.enable(g), d[g] = !0);
  }
  function ue(g) {
    d[g] !== !1 && (i.disable(g), d[g] = !1);
  }
  function Je(g, q) {
    return u[g] !== q ? (i.bindFramebuffer(g, q), u[g] = q, g === i.DRAW_FRAMEBUFFER && (u[i.FRAMEBUFFER] = q), g === i.FRAMEBUFFER && (u[i.DRAW_FRAMEBUFFER] = q), !0) : !1;
  }
  function Ve(g, q) {
    let z = f, $ = !1;
    if (g) {
      z = p.get(q), z === void 0 && (z = [], p.set(q, z));
      const te = g.textures;
      if (z.length !== te.length || z[0] !== i.COLOR_ATTACHMENT0) {
        for (let Le = 0, He = te.length; Le < He; Le++)
          z[Le] = i.COLOR_ATTACHMENT0 + Le;
        z.length = te.length, $ = !0;
      }
    } else
      z[0] !== i.BACK && (z[0] = i.BACK, $ = !0);
    $ && i.drawBuffers(z);
  }
  function nt(g) {
    return m !== g ? (i.useProgram(g), m = g, !0) : !1;
  }
  const D = {
    [Ci]: i.FUNC_ADD,
    [fh]: i.FUNC_SUBTRACT,
    [ph]: i.FUNC_REVERSE_SUBTRACT
  };
  D[mh] = i.MIN, D[gh] = i.MAX;
  const it = {
    [_h]: i.ZERO,
    [vh]: i.ONE,
    [xh]: i.SRC_COLOR,
    [Ja]: i.SRC_ALPHA,
    [Th]: i.SRC_ALPHA_SATURATE,
    [Eh]: i.DST_COLOR,
    [Sh]: i.DST_ALPHA,
    [yh]: i.ONE_MINUS_SRC_COLOR,
    [eo]: i.ONE_MINUS_SRC_ALPHA,
    [bh]: i.ONE_MINUS_DST_COLOR,
    [Mh]: i.ONE_MINUS_DST_ALPHA,
    [Ah]: i.CONSTANT_COLOR,
    [wh]: i.ONE_MINUS_CONSTANT_COLOR,
    [Rh]: i.CONSTANT_ALPHA,
    [Ch]: i.ONE_MINUS_CONSTANT_ALPHA
  };
  function rt(g, q, z, $, te, Le, He, Pt, Dt, dt) {
    if (g === ui) {
      _ === !0 && (ue(i.BLEND), _ = !1);
      return;
    }
    if (_ === !1 && (be(i.BLEND), _ = !0), g !== uh) {
      if (g !== x || dt !== U) {
        if ((c !== Ci || y !== Ci) && (i.blendEquation(i.FUNC_ADD), c = Ci, y = Ci), dt)
          switch (g) {
            case pr:
              i.blendFuncSeparate(i.ONE, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case Tl:
              i.blendFunc(i.ONE, i.ONE);
              break;
            case Al:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case wl:
              i.blendFuncSeparate(i.ZERO, i.SRC_COLOR, i.ZERO, i.SRC_ALPHA);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", g);
              break;
          }
        else
          switch (g) {
            case pr:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case Tl:
              i.blendFunc(i.SRC_ALPHA, i.ONE);
              break;
            case Al:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case wl:
              i.blendFunc(i.ZERO, i.SRC_COLOR);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", g);
              break;
          }
        h = null, E = null, w = null, I = null, R.set(0, 0, 0), C = 0, x = g, U = dt;
      }
      return;
    }
    te = te || q, Le = Le || z, He = He || $, (q !== c || te !== y) && (i.blendEquationSeparate(D[q], D[te]), c = q, y = te), (z !== h || $ !== E || Le !== w || He !== I) && (i.blendFuncSeparate(it[z], it[$], it[Le], it[He]), h = z, E = $, w = Le, I = He), (Pt.equals(R) === !1 || Dt !== C) && (i.blendColor(Pt.r, Pt.g, Pt.b, Dt), R.copy(Pt), C = Dt), x = g, U = !1;
  }
  function yt(g, q) {
    g.side === kn ? ue(i.CULL_FACE) : be(i.CULL_FACE);
    let z = g.side === vn;
    q && (z = !z), Oe(z), g.blending === pr && g.transparent === !1 ? rt(ui) : rt(g.blending, g.blendEquation, g.blendSrc, g.blendDst, g.blendEquationAlpha, g.blendSrcAlpha, g.blendDstAlpha, g.blendColor, g.blendAlpha, g.premultipliedAlpha), s.setFunc(g.depthFunc), s.setTest(g.depthTest), s.setMask(g.depthWrite), r.setMask(g.colorWrite);
    const $ = g.stencilWrite;
    a.setTest($), $ && (a.setMask(g.stencilWriteMask), a.setFunc(g.stencilFunc, g.stencilRef, g.stencilFuncMask), a.setOp(g.stencilFail, g.stencilZFail, g.stencilZPass)), Ze(g.polygonOffset, g.polygonOffsetFactor, g.polygonOffsetUnits), g.alphaToCoverage === !0 ? be(i.SAMPLE_ALPHA_TO_COVERAGE) : ue(i.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Oe(g) {
    A !== g && (g ? i.frontFace(i.CW) : i.frontFace(i.CCW), A = g);
  }
  function $e(g) {
    g !== ch ? (be(i.CULL_FACE), g !== v && (g === bl ? i.cullFace(i.BACK) : g === dh ? i.cullFace(i.FRONT) : i.cullFace(i.FRONT_AND_BACK))) : ue(i.CULL_FACE), v = g;
  }
  function et(g) {
    g !== L && (Q && i.lineWidth(g), L = g);
  }
  function Ze(g, q, z) {
    g ? (be(i.POLYGON_OFFSET_FILL), (k !== q || V !== z) && (i.polygonOffset(q, z), k = q, V = z)) : ue(i.POLYGON_OFFSET_FILL);
  }
  function Ct(g) {
    g ? be(i.SCISSOR_TEST) : ue(i.SCISSOR_TEST);
  }
  function P(g) {
    g === void 0 && (g = i.TEXTURE0 + W - 1), K !== g && (i.activeTexture(g), K = g);
  }
  function S(g, q, z) {
    z === void 0 && (K === null ? z = i.TEXTURE0 + W - 1 : z = K);
    let $ = de[z];
    $ === void 0 && ($ = { type: void 0, texture: void 0 }, de[z] = $), ($.type !== g || $.texture !== q) && (K !== z && (i.activeTexture(z), K = z), i.bindTexture(g, q || oe[g]), $.type = g, $.texture = q);
  }
  function Y() {
    const g = de[K];
    g !== void 0 && g.type !== void 0 && (i.bindTexture(g.type, null), g.type = void 0, g.texture = void 0);
  }
  function re() {
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
  function ne() {
    try {
      i.texSubImage2D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function Pe() {
    try {
      i.texSubImage3D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function pe() {
    try {
      i.compressedTexSubImage2D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function me() {
    try {
      i.compressedTexSubImage3D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function Qe() {
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
  function Ie() {
    try {
      i.texImage2D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function st() {
    try {
      i.texImage3D.apply(i, arguments);
    } catch (g) {
      console.error("THREE.WebGLState:", g);
    }
  }
  function Fe(g) {
    tt.equals(g) === !1 && (i.scissor(g.x, g.y, g.z, g.w), tt.copy(g));
  }
  function xe(g) {
    ct.equals(g) === !1 && (i.viewport(g.x, g.y, g.z, g.w), ct.copy(g));
  }
  function qe(g, q) {
    let z = l.get(q);
    z === void 0 && (z = /* @__PURE__ */ new WeakMap(), l.set(q, z));
    let $ = z.get(g);
    $ === void 0 && ($ = i.getUniformBlockIndex(q, g.name), z.set(g, $));
  }
  function Ye(g, q) {
    const $ = l.get(q).get(g);
    o.get(q) !== $ && (i.uniformBlockBinding(q, $, g.__bindingPointIndex), o.set(q, $));
  }
  function St() {
    i.disable(i.BLEND), i.disable(i.CULL_FACE), i.disable(i.DEPTH_TEST), i.disable(i.POLYGON_OFFSET_FILL), i.disable(i.SCISSOR_TEST), i.disable(i.STENCIL_TEST), i.disable(i.SAMPLE_ALPHA_TO_COVERAGE), i.blendEquation(i.FUNC_ADD), i.blendFunc(i.ONE, i.ZERO), i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO), i.blendColor(0, 0, 0, 0), i.colorMask(!0, !0, !0, !0), i.clearColor(0, 0, 0, 0), i.depthMask(!0), i.depthFunc(i.LESS), i.clearDepth(1), i.stencilMask(4294967295), i.stencilFunc(i.ALWAYS, 0, 4294967295), i.stencilOp(i.KEEP, i.KEEP, i.KEEP), i.clearStencil(0), i.cullFace(i.BACK), i.frontFace(i.CCW), i.polygonOffset(0, 0), i.activeTexture(i.TEXTURE0), i.bindFramebuffer(i.FRAMEBUFFER, null), i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), i.bindFramebuffer(i.READ_FRAMEBUFFER, null), i.useProgram(null), i.lineWidth(1), i.scissor(0, 0, i.canvas.width, i.canvas.height), i.viewport(0, 0, i.canvas.width, i.canvas.height), d = {}, K = null, de = {}, u = {}, p = /* @__PURE__ */ new WeakMap(), f = [], m = null, _ = !1, x = null, c = null, h = null, E = null, y = null, w = null, I = null, R = new ft(0, 0, 0), C = 0, U = !1, A = null, v = null, L = null, k = null, V = null, tt.set(0, 0, i.canvas.width, i.canvas.height), ct.set(0, 0, i.canvas.width, i.canvas.height), r.reset(), s.reset(), a.reset();
  }
  return {
    buffers: {
      color: r,
      depth: s,
      stencil: a
    },
    enable: be,
    disable: ue,
    bindFramebuffer: Je,
    drawBuffers: Ve,
    useProgram: nt,
    setBlending: rt,
    setMaterial: yt,
    setFlipSided: Oe,
    setCullFace: $e,
    setLineWidth: et,
    setPolygonOffset: Ze,
    setScissorTest: Ct,
    activeTexture: P,
    bindTexture: S,
    unbindTexture: Y,
    compressedTexImage2D: re,
    compressedTexImage3D: ae,
    texImage2D: Ie,
    texImage3D: st,
    updateUBOMapping: qe,
    uniformBlockBinding: Ye,
    texStorage2D: Qe,
    texStorage3D: ce,
    texSubImage2D: ne,
    texSubImage3D: Pe,
    compressedTexSubImage2D: pe,
    compressedTexSubImage3D: me,
    scissor: Fe,
    viewport: xe,
    reset: St
  };
}
function f_(i, e, t, n, r, s, a) {
  const o = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), d = new Ke(), u = /* @__PURE__ */ new WeakMap();
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
    ) : ks("canvas");
  }
  function x(P, S, Y) {
    let re = 1;
    const ae = Ct(P);
    if ((ae.width > Y || ae.height > Y) && (re = Y / Math.max(ae.width, ae.height)), re < 1)
      if (typeof HTMLImageElement < "u" && P instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && P instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && P instanceof ImageBitmap || typeof VideoFrame < "u" && P instanceof VideoFrame) {
        const ne = Math.floor(re * ae.width), Pe = Math.floor(re * ae.height);
        p === void 0 && (p = _(ne, Pe));
        const pe = S ? _(ne, Pe) : p;
        return pe.width = ne, pe.height = Pe, pe.getContext("2d").drawImage(P, 0, 0, ne, Pe), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + ae.width + "x" + ae.height + ") to (" + ne + "x" + Pe + ")."), pe;
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
  function E(P, S, Y, re, ae = !1) {
    if (P !== null) {
      if (i[P] !== void 0) return i[P];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + P + "'");
    }
    let ne = S;
    if (S === i.RED && (Y === i.FLOAT && (ne = i.R32F), Y === i.HALF_FLOAT && (ne = i.R16F), Y === i.UNSIGNED_BYTE && (ne = i.R8)), S === i.RED_INTEGER && (Y === i.UNSIGNED_BYTE && (ne = i.R8UI), Y === i.UNSIGNED_SHORT && (ne = i.R16UI), Y === i.UNSIGNED_INT && (ne = i.R32UI), Y === i.BYTE && (ne = i.R8I), Y === i.SHORT && (ne = i.R16I), Y === i.INT && (ne = i.R32I)), S === i.RG && (Y === i.FLOAT && (ne = i.RG32F), Y === i.HALF_FLOAT && (ne = i.RG16F), Y === i.UNSIGNED_BYTE && (ne = i.RG8)), S === i.RG_INTEGER && (Y === i.UNSIGNED_BYTE && (ne = i.RG8UI), Y === i.UNSIGNED_SHORT && (ne = i.RG16UI), Y === i.UNSIGNED_INT && (ne = i.RG32UI), Y === i.BYTE && (ne = i.RG8I), Y === i.SHORT && (ne = i.RG16I), Y === i.INT && (ne = i.RG32I)), S === i.RGB && Y === i.UNSIGNED_INT_5_9_9_9_REV && (ne = i.RGB9_E5), S === i.RGBA) {
      const Pe = ae ? Os : xt.getTransfer(re);
      Y === i.FLOAT && (ne = i.RGBA32F), Y === i.HALF_FLOAT && (ne = i.RGBA16F), Y === i.UNSIGNED_BYTE && (ne = Pe === It ? i.SRGB8_ALPHA8 : i.RGBA8), Y === i.UNSIGNED_SHORT_4_4_4_4 && (ne = i.RGBA4), Y === i.UNSIGNED_SHORT_5_5_5_1 && (ne = i.RGB5_A1);
    }
    return (ne === i.R16F || ne === i.R32F || ne === i.RG16F || ne === i.RG32F || ne === i.RGBA16F || ne === i.RGBA32F) && e.get("EXT_color_buffer_float"), ne;
  }
  function y(P, S) {
    let Y;
    return P ? S === null || S === xr || S === yr ? Y = i.DEPTH24_STENCIL8 : S === hi ? Y = i.DEPTH32F_STENCIL8 : S === Us && (Y = i.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : S === null || S === xr || S === yr ? Y = i.DEPTH_COMPONENT24 : S === hi ? Y = i.DEPTH_COMPONENT32F : S === Us && (Y = i.DEPTH_COMPONENT16), Y;
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
    const Y = P.source, re = f.get(Y);
    if (re) {
      const ae = re[S.__cacheKey];
      ae.usedTimes--, ae.usedTimes === 0 && U(P), Object.keys(re).length === 0 && f.delete(Y);
    }
    n.remove(P);
  }
  function U(P) {
    const S = n.get(P);
    i.deleteTexture(S.__webglTexture);
    const Y = P.source, re = f.get(Y);
    delete re[S.__cacheKey], a.memory.textures--;
  }
  function A(P) {
    const S = n.get(P);
    if (P.depthTexture && P.depthTexture.dispose(), P.isWebGLCubeRenderTarget)
      for (let re = 0; re < 6; re++) {
        if (Array.isArray(S.__webglFramebuffer[re]))
          for (let ae = 0; ae < S.__webglFramebuffer[re].length; ae++) i.deleteFramebuffer(S.__webglFramebuffer[re][ae]);
        else
          i.deleteFramebuffer(S.__webglFramebuffer[re]);
        S.__webglDepthbuffer && i.deleteRenderbuffer(S.__webglDepthbuffer[re]);
      }
    else {
      if (Array.isArray(S.__webglFramebuffer))
        for (let re = 0; re < S.__webglFramebuffer.length; re++) i.deleteFramebuffer(S.__webglFramebuffer[re]);
      else
        i.deleteFramebuffer(S.__webglFramebuffer);
      if (S.__webglDepthbuffer && i.deleteRenderbuffer(S.__webglDepthbuffer), S.__webglMultisampledFramebuffer && i.deleteFramebuffer(S.__webglMultisampledFramebuffer), S.__webglColorRenderbuffer)
        for (let re = 0; re < S.__webglColorRenderbuffer.length; re++)
          S.__webglColorRenderbuffer[re] && i.deleteRenderbuffer(S.__webglColorRenderbuffer[re]);
      S.__webglDepthRenderbuffer && i.deleteRenderbuffer(S.__webglDepthRenderbuffer);
    }
    const Y = P.textures;
    for (let re = 0, ae = Y.length; re < ae; re++) {
      const ne = n.get(Y[re]);
      ne.__webglTexture && (i.deleteTexture(ne.__webglTexture), a.memory.textures--), n.remove(Y[re]);
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
    if (P.isVideoTexture && et(P), P.isRenderTargetTexture === !1 && P.version > 0 && Y.__version !== P.version) {
      const re = P.image;
      if (re === null)
        console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (re.complete === !1)
        console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        ct(Y, P, S);
        return;
      }
    }
    t.bindTexture(i.TEXTURE_2D, Y.__webglTexture, i.TEXTURE0 + S);
  }
  function Q(P, S) {
    const Y = n.get(P);
    if (P.version > 0 && Y.__version !== P.version) {
      ct(Y, P, S);
      return;
    }
    t.bindTexture(i.TEXTURE_2D_ARRAY, Y.__webglTexture, i.TEXTURE0 + S);
  }
  function j(P, S) {
    const Y = n.get(P);
    if (P.version > 0 && Y.__version !== P.version) {
      ct(Y, P, S);
      return;
    }
    t.bindTexture(i.TEXTURE_3D, Y.__webglTexture, i.TEXTURE0 + S);
  }
  function ie(P, S) {
    const Y = n.get(P);
    if (P.version > 0 && Y.__version !== P.version) {
      J(Y, P, S);
      return;
    }
    t.bindTexture(i.TEXTURE_CUBE_MAP, Y.__webglTexture, i.TEXTURE0 + S);
  }
  const K = {
    [io]: i.REPEAT,
    [Ni]: i.CLAMP_TO_EDGE,
    [ro]: i.MIRRORED_REPEAT
  }, de = {
    [wn]: i.NEAREST,
    [Yh]: i.NEAREST_MIPMAP_NEAREST,
    [ts]: i.NEAREST_MIPMAP_LINEAR,
    [In]: i.LINEAR,
    [ua]: i.LINEAR_MIPMAP_NEAREST,
    [Ii]: i.LINEAR_MIPMAP_LINEAR
  }, ve = {
    [au]: i.NEVER,
    [uu]: i.ALWAYS,
    [ou]: i.LESS,
    [yd]: i.LEQUAL,
    [lu]: i.EQUAL,
    [hu]: i.GEQUAL,
    [cu]: i.GREATER,
    [du]: i.NOTEQUAL
  };
  function Ee(P, S) {
    if (S.type === hi && e.has("OES_texture_float_linear") === !1 && (S.magFilter === In || S.magFilter === ua || S.magFilter === ts || S.magFilter === Ii || S.minFilter === In || S.minFilter === ua || S.minFilter === ts || S.minFilter === Ii) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), i.texParameteri(P, i.TEXTURE_WRAP_S, K[S.wrapS]), i.texParameteri(P, i.TEXTURE_WRAP_T, K[S.wrapT]), (P === i.TEXTURE_3D || P === i.TEXTURE_2D_ARRAY) && i.texParameteri(P, i.TEXTURE_WRAP_R, K[S.wrapR]), i.texParameteri(P, i.TEXTURE_MAG_FILTER, de[S.magFilter]), i.texParameteri(P, i.TEXTURE_MIN_FILTER, de[S.minFilter]), S.compareFunction && (i.texParameteri(P, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE), i.texParameteri(P, i.TEXTURE_COMPARE_FUNC, ve[S.compareFunction])), e.has("EXT_texture_filter_anisotropic") === !0) {
      if (S.magFilter === wn || S.minFilter !== ts && S.minFilter !== Ii || S.type === hi && e.has("OES_texture_float_linear") === !1) return;
      if (S.anisotropy > 1 || n.get(S).__currentAnisotropy) {
        const Y = e.get("EXT_texture_filter_anisotropic");
        i.texParameterf(P, Y.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(S.anisotropy, r.getMaxAnisotropy())), n.get(S).__currentAnisotropy = S.anisotropy;
      }
    }
  }
  function tt(P, S) {
    let Y = !1;
    P.__webglInit === void 0 && (P.__webglInit = !0, S.addEventListener("dispose", I));
    const re = S.source;
    let ae = f.get(re);
    ae === void 0 && (ae = {}, f.set(re, ae));
    const ne = V(S);
    if (ne !== P.__cacheKey) {
      ae[ne] === void 0 && (ae[ne] = {
        texture: i.createTexture(),
        usedTimes: 0
      }, a.memory.textures++, Y = !0), ae[ne].usedTimes++;
      const Pe = ae[P.__cacheKey];
      Pe !== void 0 && (ae[P.__cacheKey].usedTimes--, Pe.usedTimes === 0 && U(S)), P.__cacheKey = ne, P.__webglTexture = ae[ne].texture;
    }
    return Y;
  }
  function ct(P, S, Y) {
    let re = i.TEXTURE_2D;
    (S.isDataArrayTexture || S.isCompressedArrayTexture) && (re = i.TEXTURE_2D_ARRAY), S.isData3DTexture && (re = i.TEXTURE_3D);
    const ae = tt(P, S), ne = S.source;
    t.bindTexture(re, P.__webglTexture, i.TEXTURE0 + Y);
    const Pe = n.get(ne);
    if (ne.version !== Pe.__version || ae === !0) {
      t.activeTexture(i.TEXTURE0 + Y);
      const pe = xt.getPrimaries(xt.workingColorSpace), me = S.colorSpace === di ? null : xt.getPrimaries(S.colorSpace), Qe = S.colorSpace === di || pe === me ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, S.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, S.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, S.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, Qe);
      let ce = x(S.image, !1, r.maxTextureSize);
      ce = Ze(S, ce);
      const Ie = s.convert(S.format, S.colorSpace), st = s.convert(S.type);
      let Fe = E(S.internalFormat, Ie, st, S.colorSpace, S.isVideoTexture);
      Ee(re, S);
      let xe;
      const qe = S.mipmaps, Ye = S.isVideoTexture !== !0, St = Pe.__version === void 0 || ae === !0, g = ne.dataReady, q = w(S, ce);
      if (S.isDepthTexture)
        Fe = y(S.format === Sr, S.type), St && (Ye ? t.texStorage2D(i.TEXTURE_2D, 1, Fe, ce.width, ce.height) : t.texImage2D(i.TEXTURE_2D, 0, Fe, ce.width, ce.height, 0, Ie, st, null));
      else if (S.isDataTexture)
        if (qe.length > 0) {
          Ye && St && t.texStorage2D(i.TEXTURE_2D, q, Fe, qe[0].width, qe[0].height);
          for (let z = 0, $ = qe.length; z < $; z++)
            xe = qe[z], Ye ? g && t.texSubImage2D(i.TEXTURE_2D, z, 0, 0, xe.width, xe.height, Ie, st, xe.data) : t.texImage2D(i.TEXTURE_2D, z, Fe, xe.width, xe.height, 0, Ie, st, xe.data);
          S.generateMipmaps = !1;
        } else
          Ye ? (St && t.texStorage2D(i.TEXTURE_2D, q, Fe, ce.width, ce.height), g && t.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, ce.width, ce.height, Ie, st, ce.data)) : t.texImage2D(i.TEXTURE_2D, 0, Fe, ce.width, ce.height, 0, Ie, st, ce.data);
      else if (S.isCompressedTexture)
        if (S.isCompressedArrayTexture) {
          Ye && St && t.texStorage3D(i.TEXTURE_2D_ARRAY, q, Fe, qe[0].width, qe[0].height, ce.depth);
          for (let z = 0, $ = qe.length; z < $; z++)
            if (xe = qe[z], S.format !== Hn)
              if (Ie !== null)
                if (Ye) {
                  if (g)
                    if (S.layerUpdates.size > 0) {
                      for (const te of S.layerUpdates) {
                        const Le = xe.width * xe.height;
                        t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, z, 0, 0, te, xe.width, xe.height, 1, Ie, xe.data.slice(Le * te, Le * (te + 1)), 0, 0);
                      }
                      S.clearLayerUpdates();
                    } else
                      t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, z, 0, 0, 0, xe.width, xe.height, ce.depth, Ie, xe.data, 0, 0);
                } else
                  t.compressedTexImage3D(i.TEXTURE_2D_ARRAY, z, Fe, xe.width, xe.height, ce.depth, 0, xe.data, 0, 0);
              else
                console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              Ye ? g && t.texSubImage3D(i.TEXTURE_2D_ARRAY, z, 0, 0, 0, xe.width, xe.height, ce.depth, Ie, st, xe.data) : t.texImage3D(i.TEXTURE_2D_ARRAY, z, Fe, xe.width, xe.height, ce.depth, 0, Ie, st, xe.data);
        } else {
          Ye && St && t.texStorage2D(i.TEXTURE_2D, q, Fe, qe[0].width, qe[0].height);
          for (let z = 0, $ = qe.length; z < $; z++)
            xe = qe[z], S.format !== Hn ? Ie !== null ? Ye ? g && t.compressedTexSubImage2D(i.TEXTURE_2D, z, 0, 0, xe.width, xe.height, Ie, xe.data) : t.compressedTexImage2D(i.TEXTURE_2D, z, Fe, xe.width, xe.height, 0, xe.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : Ye ? g && t.texSubImage2D(i.TEXTURE_2D, z, 0, 0, xe.width, xe.height, Ie, st, xe.data) : t.texImage2D(i.TEXTURE_2D, z, Fe, xe.width, xe.height, 0, Ie, st, xe.data);
        }
      else if (S.isDataArrayTexture)
        if (Ye) {
          if (St && t.texStorage3D(i.TEXTURE_2D_ARRAY, q, Fe, ce.width, ce.height, ce.depth), g)
            if (S.layerUpdates.size > 0) {
              let z;
              switch (st) {
                case i.UNSIGNED_BYTE:
                  switch (Ie) {
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
                      throw new Error(`Unknown texel size for format ${Ie}.`);
                  }
                  break;
                case i.UNSIGNED_SHORT_4_4_4_4:
                case i.UNSIGNED_SHORT_5_5_5_1:
                case i.UNSIGNED_SHORT_5_6_5:
                  z = 1;
                  break;
                default:
                  throw new Error(`Unknown texel size for type ${st}.`);
              }
              const $ = ce.width * ce.height * z;
              for (const te of S.layerUpdates)
                t.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, te, ce.width, ce.height, 1, Ie, st, ce.data.slice($ * te, $ * (te + 1)));
              S.clearLayerUpdates();
            } else
              t.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, 0, ce.width, ce.height, ce.depth, Ie, st, ce.data);
        } else
          t.texImage3D(i.TEXTURE_2D_ARRAY, 0, Fe, ce.width, ce.height, ce.depth, 0, Ie, st, ce.data);
      else if (S.isData3DTexture)
        Ye ? (St && t.texStorage3D(i.TEXTURE_3D, q, Fe, ce.width, ce.height, ce.depth), g && t.texSubImage3D(i.TEXTURE_3D, 0, 0, 0, 0, ce.width, ce.height, ce.depth, Ie, st, ce.data)) : t.texImage3D(i.TEXTURE_3D, 0, Fe, ce.width, ce.height, ce.depth, 0, Ie, st, ce.data);
      else if (S.isFramebufferTexture) {
        if (St)
          if (Ye)
            t.texStorage2D(i.TEXTURE_2D, q, Fe, ce.width, ce.height);
          else {
            let z = ce.width, $ = ce.height;
            for (let te = 0; te < q; te++)
              t.texImage2D(i.TEXTURE_2D, te, Fe, z, $, 0, Ie, st, null), z >>= 1, $ >>= 1;
          }
      } else if (qe.length > 0) {
        if (Ye && St) {
          const z = Ct(qe[0]);
          t.texStorage2D(i.TEXTURE_2D, q, Fe, z.width, z.height);
        }
        for (let z = 0, $ = qe.length; z < $; z++)
          xe = qe[z], Ye ? g && t.texSubImage2D(i.TEXTURE_2D, z, 0, 0, Ie, st, xe) : t.texImage2D(i.TEXTURE_2D, z, Fe, Ie, st, xe);
        S.generateMipmaps = !1;
      } else if (Ye) {
        if (St) {
          const z = Ct(ce);
          t.texStorage2D(i.TEXTURE_2D, q, Fe, z.width, z.height);
        }
        g && t.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, Ie, st, ce);
      } else
        t.texImage2D(i.TEXTURE_2D, 0, Fe, Ie, st, ce);
      c(S) && h(re), Pe.__version = ne.version, S.onUpdate && S.onUpdate(S);
    }
    P.__version = S.version;
  }
  function J(P, S, Y) {
    if (S.image.length !== 6) return;
    const re = tt(P, S), ae = S.source;
    t.bindTexture(i.TEXTURE_CUBE_MAP, P.__webglTexture, i.TEXTURE0 + Y);
    const ne = n.get(ae);
    if (ae.version !== ne.__version || re === !0) {
      t.activeTexture(i.TEXTURE0 + Y);
      const Pe = xt.getPrimaries(xt.workingColorSpace), pe = S.colorSpace === di ? null : xt.getPrimaries(S.colorSpace), me = S.colorSpace === di || Pe === pe ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
      i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, S.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, S.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, S.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, me);
      const Qe = S.isCompressedTexture || S.image[0].isCompressedTexture, ce = S.image[0] && S.image[0].isDataTexture, Ie = [];
      for (let $ = 0; $ < 6; $++)
        !Qe && !ce ? Ie[$] = x(S.image[$], !0, r.maxCubemapSize) : Ie[$] = ce ? S.image[$].image : S.image[$], Ie[$] = Ze(S, Ie[$]);
      const st = Ie[0], Fe = s.convert(S.format, S.colorSpace), xe = s.convert(S.type), qe = E(S.internalFormat, Fe, xe, S.colorSpace), Ye = S.isVideoTexture !== !0, St = ne.__version === void 0 || re === !0, g = ae.dataReady;
      let q = w(S, st);
      Ee(i.TEXTURE_CUBE_MAP, S);
      let z;
      if (Qe) {
        Ye && St && t.texStorage2D(i.TEXTURE_CUBE_MAP, q, qe, st.width, st.height);
        for (let $ = 0; $ < 6; $++) {
          z = Ie[$].mipmaps;
          for (let te = 0; te < z.length; te++) {
            const Le = z[te];
            S.format !== Hn ? Fe !== null ? Ye ? g && t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, te, 0, 0, Le.width, Le.height, Fe, Le.data) : t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, te, qe, Le.width, Le.height, 0, Le.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : Ye ? g && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, te, 0, 0, Le.width, Le.height, Fe, xe, Le.data) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, te, qe, Le.width, Le.height, 0, Fe, xe, Le.data);
          }
        }
      } else {
        if (z = S.mipmaps, Ye && St) {
          z.length > 0 && q++;
          const $ = Ct(Ie[0]);
          t.texStorage2D(i.TEXTURE_CUBE_MAP, q, qe, $.width, $.height);
        }
        for (let $ = 0; $ < 6; $++)
          if (ce) {
            Ye ? g && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, 0, 0, Ie[$].width, Ie[$].height, Fe, xe, Ie[$].data) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, qe, Ie[$].width, Ie[$].height, 0, Fe, xe, Ie[$].data);
            for (let te = 0; te < z.length; te++) {
              const He = z[te].image[$].image;
              Ye ? g && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, te + 1, 0, 0, He.width, He.height, Fe, xe, He.data) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, te + 1, qe, He.width, He.height, 0, Fe, xe, He.data);
            }
          } else {
            Ye ? g && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, 0, 0, Fe, xe, Ie[$]) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, qe, Fe, xe, Ie[$]);
            for (let te = 0; te < z.length; te++) {
              const Le = z[te];
              Ye ? g && t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, te + 1, 0, 0, Fe, xe, Le.image[$]) : t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + $, te + 1, qe, Fe, xe, Le.image[$]);
            }
          }
      }
      c(S) && h(i.TEXTURE_CUBE_MAP), ne.__version = ae.version, S.onUpdate && S.onUpdate(S);
    }
    P.__version = S.version;
  }
  function oe(P, S, Y, re, ae, ne) {
    const Pe = s.convert(Y.format, Y.colorSpace), pe = s.convert(Y.type), me = E(Y.internalFormat, Pe, pe, Y.colorSpace);
    if (!n.get(S).__hasExternalTextures) {
      const ce = Math.max(1, S.width >> ne), Ie = Math.max(1, S.height >> ne);
      ae === i.TEXTURE_3D || ae === i.TEXTURE_2D_ARRAY ? t.texImage3D(ae, ne, me, ce, Ie, S.depth, 0, Pe, pe, null) : t.texImage2D(ae, ne, me, ce, Ie, 0, Pe, pe, null);
    }
    t.bindFramebuffer(i.FRAMEBUFFER, P), $e(S) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, re, ae, n.get(Y).__webglTexture, 0, Oe(S)) : (ae === i.TEXTURE_2D || ae >= i.TEXTURE_CUBE_MAP_POSITIVE_X && ae <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z) && i.framebufferTexture2D(i.FRAMEBUFFER, re, ae, n.get(Y).__webglTexture, ne), t.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function be(P, S, Y) {
    if (i.bindRenderbuffer(i.RENDERBUFFER, P), S.depthBuffer) {
      const re = S.depthTexture, ae = re && re.isDepthTexture ? re.type : null, ne = y(S.stencilBuffer, ae), Pe = S.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, pe = Oe(S);
      $e(S) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, pe, ne, S.width, S.height) : Y ? i.renderbufferStorageMultisample(i.RENDERBUFFER, pe, ne, S.width, S.height) : i.renderbufferStorage(i.RENDERBUFFER, ne, S.width, S.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, Pe, i.RENDERBUFFER, P);
    } else {
      const re = S.textures;
      for (let ae = 0; ae < re.length; ae++) {
        const ne = re[ae], Pe = s.convert(ne.format, ne.colorSpace), pe = s.convert(ne.type), me = E(ne.internalFormat, Pe, pe, ne.colorSpace), Qe = Oe(S);
        Y && $e(S) === !1 ? i.renderbufferStorageMultisample(i.RENDERBUFFER, Qe, me, S.width, S.height) : $e(S) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, Qe, me, S.width, S.height) : i.renderbufferStorage(i.RENDERBUFFER, me, S.width, S.height);
      }
    }
    i.bindRenderbuffer(i.RENDERBUFFER, null);
  }
  function ue(P, S) {
    if (S && S.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (t.bindFramebuffer(i.FRAMEBUFFER, P), !(S.depthTexture && S.depthTexture.isDepthTexture))
      throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    (!n.get(S.depthTexture).__webglTexture || S.depthTexture.image.width !== S.width || S.depthTexture.image.height !== S.height) && (S.depthTexture.image.width = S.width, S.depthTexture.image.height = S.height, S.depthTexture.needsUpdate = !0), W(S.depthTexture, 0);
    const re = n.get(S.depthTexture).__webglTexture, ae = Oe(S);
    if (S.depthTexture.format === mr)
      $e(S) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, re, 0, ae) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, re, 0);
    else if (S.depthTexture.format === Sr)
      $e(S) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, re, 0, ae) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, re, 0);
    else
      throw new Error("Unknown depthTexture format");
  }
  function Je(P) {
    const S = n.get(P), Y = P.isWebGLCubeRenderTarget === !0;
    if (P.depthTexture && !S.__autoAllocateDepthBuffer) {
      if (Y) throw new Error("target.depthTexture not supported in Cube render targets");
      ue(S.__webglFramebuffer, P);
    } else if (Y) {
      S.__webglDepthbuffer = [];
      for (let re = 0; re < 6; re++)
        t.bindFramebuffer(i.FRAMEBUFFER, S.__webglFramebuffer[re]), S.__webglDepthbuffer[re] = i.createRenderbuffer(), be(S.__webglDepthbuffer[re], P, !1);
    } else
      t.bindFramebuffer(i.FRAMEBUFFER, S.__webglFramebuffer), S.__webglDepthbuffer = i.createRenderbuffer(), be(S.__webglDepthbuffer, P, !1);
    t.bindFramebuffer(i.FRAMEBUFFER, null);
  }
  function Ve(P, S, Y) {
    const re = n.get(P);
    S !== void 0 && oe(re.__webglFramebuffer, P, P.texture, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, 0), Y !== void 0 && Je(P);
  }
  function nt(P) {
    const S = P.texture, Y = n.get(P), re = n.get(S);
    P.addEventListener("dispose", R);
    const ae = P.textures, ne = P.isWebGLCubeRenderTarget === !0, Pe = ae.length > 1;
    if (Pe || (re.__webglTexture === void 0 && (re.__webglTexture = i.createTexture()), re.__version = S.version, a.memory.textures++), ne) {
      Y.__webglFramebuffer = [];
      for (let pe = 0; pe < 6; pe++)
        if (S.mipmaps && S.mipmaps.length > 0) {
          Y.__webglFramebuffer[pe] = [];
          for (let me = 0; me < S.mipmaps.length; me++)
            Y.__webglFramebuffer[pe][me] = i.createFramebuffer();
        } else
          Y.__webglFramebuffer[pe] = i.createFramebuffer();
    } else {
      if (S.mipmaps && S.mipmaps.length > 0) {
        Y.__webglFramebuffer = [];
        for (let pe = 0; pe < S.mipmaps.length; pe++)
          Y.__webglFramebuffer[pe] = i.createFramebuffer();
      } else
        Y.__webglFramebuffer = i.createFramebuffer();
      if (Pe)
        for (let pe = 0, me = ae.length; pe < me; pe++) {
          const Qe = n.get(ae[pe]);
          Qe.__webglTexture === void 0 && (Qe.__webglTexture = i.createTexture(), a.memory.textures++);
        }
      if (P.samples > 0 && $e(P) === !1) {
        Y.__webglMultisampledFramebuffer = i.createFramebuffer(), Y.__webglColorRenderbuffer = [], t.bindFramebuffer(i.FRAMEBUFFER, Y.__webglMultisampledFramebuffer);
        for (let pe = 0; pe < ae.length; pe++) {
          const me = ae[pe];
          Y.__webglColorRenderbuffer[pe] = i.createRenderbuffer(), i.bindRenderbuffer(i.RENDERBUFFER, Y.__webglColorRenderbuffer[pe]);
          const Qe = s.convert(me.format, me.colorSpace), ce = s.convert(me.type), Ie = E(me.internalFormat, Qe, ce, me.colorSpace, P.isXRRenderTarget === !0), st = Oe(P);
          i.renderbufferStorageMultisample(i.RENDERBUFFER, st, Ie, P.width, P.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + pe, i.RENDERBUFFER, Y.__webglColorRenderbuffer[pe]);
        }
        i.bindRenderbuffer(i.RENDERBUFFER, null), P.depthBuffer && (Y.__webglDepthRenderbuffer = i.createRenderbuffer(), be(Y.__webglDepthRenderbuffer, P, !0)), t.bindFramebuffer(i.FRAMEBUFFER, null);
      }
    }
    if (ne) {
      t.bindTexture(i.TEXTURE_CUBE_MAP, re.__webglTexture), Ee(i.TEXTURE_CUBE_MAP, S);
      for (let pe = 0; pe < 6; pe++)
        if (S.mipmaps && S.mipmaps.length > 0)
          for (let me = 0; me < S.mipmaps.length; me++)
            oe(Y.__webglFramebuffer[pe][me], P, S, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + pe, me);
        else
          oe(Y.__webglFramebuffer[pe], P, S, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + pe, 0);
      c(S) && h(i.TEXTURE_CUBE_MAP), t.unbindTexture();
    } else if (Pe) {
      for (let pe = 0, me = ae.length; pe < me; pe++) {
        const Qe = ae[pe], ce = n.get(Qe);
        t.bindTexture(i.TEXTURE_2D, ce.__webglTexture), Ee(i.TEXTURE_2D, Qe), oe(Y.__webglFramebuffer, P, Qe, i.COLOR_ATTACHMENT0 + pe, i.TEXTURE_2D, 0), c(Qe) && h(i.TEXTURE_2D);
      }
      t.unbindTexture();
    } else {
      let pe = i.TEXTURE_2D;
      if ((P.isWebGL3DRenderTarget || P.isWebGLArrayRenderTarget) && (pe = P.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), t.bindTexture(pe, re.__webglTexture), Ee(pe, S), S.mipmaps && S.mipmaps.length > 0)
        for (let me = 0; me < S.mipmaps.length; me++)
          oe(Y.__webglFramebuffer[me], P, S, i.COLOR_ATTACHMENT0, pe, me);
      else
        oe(Y.__webglFramebuffer, P, S, i.COLOR_ATTACHMENT0, pe, 0);
      c(S) && h(pe), t.unbindTexture();
    }
    P.depthBuffer && Je(P);
  }
  function D(P) {
    const S = P.textures;
    for (let Y = 0, re = S.length; Y < re; Y++) {
      const ae = S[Y];
      if (c(ae)) {
        const ne = P.isWebGLCubeRenderTarget ? i.TEXTURE_CUBE_MAP : i.TEXTURE_2D, Pe = n.get(ae).__webglTexture;
        t.bindTexture(ne, Pe), h(ne), t.unbindTexture();
      }
    }
  }
  const it = [], rt = [];
  function yt(P) {
    if (P.samples > 0) {
      if ($e(P) === !1) {
        const S = P.textures, Y = P.width, re = P.height;
        let ae = i.COLOR_BUFFER_BIT;
        const ne = P.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, Pe = n.get(P), pe = S.length > 1;
        if (pe)
          for (let me = 0; me < S.length; me++)
            t.bindFramebuffer(i.FRAMEBUFFER, Pe.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + me, i.RENDERBUFFER, null), t.bindFramebuffer(i.FRAMEBUFFER, Pe.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + me, i.TEXTURE_2D, null, 0);
        t.bindFramebuffer(i.READ_FRAMEBUFFER, Pe.__webglMultisampledFramebuffer), t.bindFramebuffer(i.DRAW_FRAMEBUFFER, Pe.__webglFramebuffer);
        for (let me = 0; me < S.length; me++) {
          if (P.resolveDepthBuffer && (P.depthBuffer && (ae |= i.DEPTH_BUFFER_BIT), P.stencilBuffer && P.resolveStencilBuffer && (ae |= i.STENCIL_BUFFER_BIT)), pe) {
            i.framebufferRenderbuffer(i.READ_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.RENDERBUFFER, Pe.__webglColorRenderbuffer[me]);
            const Qe = n.get(S[me]).__webglTexture;
            i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, Qe, 0);
          }
          i.blitFramebuffer(0, 0, Y, re, 0, 0, Y, re, ae, i.NEAREST), l === !0 && (it.length = 0, rt.length = 0, it.push(i.COLOR_ATTACHMENT0 + me), P.depthBuffer && P.resolveDepthBuffer === !1 && (it.push(ne), rt.push(ne), i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, rt)), i.invalidateFramebuffer(i.READ_FRAMEBUFFER, it));
        }
        if (t.bindFramebuffer(i.READ_FRAMEBUFFER, null), t.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), pe)
          for (let me = 0; me < S.length; me++) {
            t.bindFramebuffer(i.FRAMEBUFFER, Pe.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + me, i.RENDERBUFFER, Pe.__webglColorRenderbuffer[me]);
            const Qe = n.get(S[me]).__webglTexture;
            t.bindFramebuffer(i.FRAMEBUFFER, Pe.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + me, i.TEXTURE_2D, Qe, 0);
          }
        t.bindFramebuffer(i.DRAW_FRAMEBUFFER, Pe.__webglMultisampledFramebuffer);
      } else if (P.depthBuffer && P.resolveDepthBuffer === !1 && l) {
        const S = P.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT;
        i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [S]);
      }
    }
  }
  function Oe(P) {
    return Math.min(r.maxSamples, P.samples);
  }
  function $e(P) {
    const S = n.get(P);
    return P.samples > 0 && e.has("WEBGL_multisampled_render_to_texture") === !0 && S.__useRenderToTexture !== !1;
  }
  function et(P) {
    const S = a.render.frame;
    u.get(P) !== S && (u.set(P, S), P.update());
  }
  function Ze(P, S) {
    const Y = P.colorSpace, re = P.format, ae = P.type;
    return P.isCompressedTexture === !0 || P.isVideoTexture === !0 || Y !== _i && Y !== di && (xt.getTransfer(Y) === It ? (re !== Hn || ae !== mi) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", Y)), S;
  }
  function Ct(P) {
    return typeof HTMLImageElement < "u" && P instanceof HTMLImageElement ? (d.width = P.naturalWidth || P.width, d.height = P.naturalHeight || P.height) : typeof VideoFrame < "u" && P instanceof VideoFrame ? (d.width = P.displayWidth, d.height = P.displayHeight) : (d.width = P.width, d.height = P.height), d;
  }
  this.allocateTextureUnit = k, this.resetTextureUnits = L, this.setTexture2D = W, this.setTexture2DArray = Q, this.setTexture3D = j, this.setTextureCube = ie, this.rebindTextures = Ve, this.setupRenderTarget = nt, this.updateRenderTargetMipmap = D, this.updateMultisampleRenderTarget = yt, this.setupDepthRenderbuffer = Je, this.setupFrameBufferTexture = oe, this.useMultisampledRTT = $e;
}
function p_(i, e) {
  function t(n, r = di) {
    let s;
    const a = xt.getTransfer(r);
    if (n === mi) return i.UNSIGNED_BYTE;
    if (n === pd) return i.UNSIGNED_SHORT_4_4_4_4;
    if (n === md) return i.UNSIGNED_SHORT_5_5_5_1;
    if (n === Kh) return i.UNSIGNED_INT_5_9_9_9_REV;
    if (n === qh) return i.BYTE;
    if (n === jh) return i.SHORT;
    if (n === Us) return i.UNSIGNED_SHORT;
    if (n === fd) return i.INT;
    if (n === xr) return i.UNSIGNED_INT;
    if (n === hi) return i.FLOAT;
    if (n === Ws) return i.HALF_FLOAT;
    if (n === $h) return i.ALPHA;
    if (n === Zh) return i.RGB;
    if (n === Hn) return i.RGBA;
    if (n === Qh) return i.LUMINANCE;
    if (n === Jh) return i.LUMINANCE_ALPHA;
    if (n === mr) return i.DEPTH_COMPONENT;
    if (n === Sr) return i.DEPTH_STENCIL;
    if (n === eu) return i.RED;
    if (n === gd) return i.RED_INTEGER;
    if (n === tu) return i.RG;
    if (n === _d) return i.RG_INTEGER;
    if (n === vd) return i.RGBA_INTEGER;
    if (n === fa || n === pa || n === ma || n === ga)
      if (a === It)
        if (s = e.get("WEBGL_compressed_texture_s3tc_srgb"), s !== null) {
          if (n === fa) return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (n === pa) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (n === ma) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (n === ga) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else
          return null;
      else if (s = e.get("WEBGL_compressed_texture_s3tc"), s !== null) {
        if (n === fa) return s.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === pa) return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === ma) return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === ga) return s.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else
        return null;
    if (n === Rl || n === Cl || n === Pl || n === Ll)
      if (s = e.get("WEBGL_compressed_texture_pvrtc"), s !== null) {
        if (n === Rl) return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === Cl) return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === Pl) return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === Ll) return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else
        return null;
    if (n === Nl || n === Il || n === Dl)
      if (s = e.get("WEBGL_compressed_texture_etc"), s !== null) {
        if (n === Nl || n === Il) return a === It ? s.COMPRESSED_SRGB8_ETC2 : s.COMPRESSED_RGB8_ETC2;
        if (n === Dl) return a === It ? s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : s.COMPRESSED_RGBA8_ETC2_EAC;
      } else
        return null;
    if (n === Ul || n === Ol || n === Fl || n === Bl || n === zl || n === kl || n === Vl || n === Hl || n === Gl || n === Wl || n === Xl || n === Yl || n === ql || n === jl)
      if (s = e.get("WEBGL_compressed_texture_astc"), s !== null) {
        if (n === Ul) return a === It ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : s.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === Ol) return a === It ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : s.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === Fl) return a === It ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : s.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === Bl) return a === It ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : s.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === zl) return a === It ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : s.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === kl) return a === It ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : s.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === Vl) return a === It ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : s.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === Hl) return a === It ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : s.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === Gl) return a === It ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : s.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === Wl) return a === It ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : s.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === Xl) return a === It ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : s.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === Yl) return a === It ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : s.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === ql) return a === It ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : s.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === jl) return a === It ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : s.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (n === _a || n === Kl || n === $l)
      if (s = e.get("EXT_texture_compression_bptc"), s !== null) {
        if (n === _a) return a === It ? s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : s.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === Kl) return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === $l) return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else
        return null;
    if (n === nu || n === Zl || n === Ql || n === Jl)
      if (s = e.get("EXT_texture_compression_rgtc"), s !== null) {
        if (n === _a) return s.COMPRESSED_RED_RGTC1_EXT;
        if (n === Zl) return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === Ql) return s.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === Jl) return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else
        return null;
    return n === yr ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null;
  }
  return { convert: t };
}
class m_ extends An {
  constructor(e = []) {
    super(), this.isArrayCamera = !0, this.cameras = e;
  }
}
class Hr extends Yt {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}
const g_ = { type: "move" };
class Ga {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new Hr(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new Hr(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new N(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new N()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new Hr(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new N(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new N()), this._grip;
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
      o !== null && (r = t.getPose(e.targetRaySpace, n), r === null && s !== null && (r = s), r !== null && (o.matrix.fromArray(r.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(r.linearVelocity)) : o.hasLinearVelocity = !1, r.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(r.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(g_)));
    }
    return o !== null && (o.visible = r !== null), l !== null && (l.visible = s !== null), d !== null && (d.visible = a !== null), this;
  }
  // private method
  _getHandJoint(e, t) {
    if (e.joints[t.jointName] === void 0) {
      const n = new Hr();
      n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n);
    }
    return e.joints[t.jointName];
  }
}
const __ = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, v_ = `
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
class x_ {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(e, t, n) {
    if (this.texture === null) {
      const r = new xn(), s = e.properties.get(r);
      s.__webglTexture = t.texture, (t.depthNear != n.depthNear || t.depthFar != n.depthFar) && (this.depthNear = t.depthNear, this.depthFar = t.depthFar), this.texture = r;
    }
  }
  getMesh(e) {
    if (this.texture !== null && this.mesh === null) {
      const t = e.cameras[0].viewport, n = new gi({
        vertexShader: __,
        fragmentShader: v_,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: t.z },
          depthHeight: { value: t.w }
        }
      });
      this.mesh = new Te(new jr(20, 20), n);
    }
    return this.mesh;
  }
  reset() {
    this.texture = null, this.mesh = null;
  }
}
class y_ extends Oi {
  constructor(e, t) {
    super();
    const n = this;
    let r = null, s = 1, a = null, o = "local-floor", l = 1, d = null, u = null, p = null, f = null, m = null, _ = null;
    const x = new x_(), c = t.getContextAttributes();
    let h = null, E = null;
    const y = [], w = [], I = new Ke();
    let R = null;
    const C = new An();
    C.layers.enable(1), C.viewport = new en();
    const U = new An();
    U.layers.enable(2), U.viewport = new en();
    const A = [C, U], v = new m_();
    v.layers.enable(1), v.layers.enable(2);
    let L = null, k = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(J) {
      let oe = y[J];
      return oe === void 0 && (oe = new Ga(), y[J] = oe), oe.getTargetRaySpace();
    }, this.getControllerGrip = function(J) {
      let oe = y[J];
      return oe === void 0 && (oe = new Ga(), y[J] = oe), oe.getGripSpace();
    }, this.getHand = function(J) {
      let oe = y[J];
      return oe === void 0 && (oe = new Ga(), y[J] = oe), oe.getHandSpace();
    };
    function V(J) {
      const oe = w.indexOf(J.inputSource);
      if (oe === -1)
        return;
      const be = y[oe];
      be !== void 0 && (be.update(J.inputSource, J.frame, d || a), be.dispatchEvent({ type: J.type, data: J.inputSource }));
    }
    function W() {
      r.removeEventListener("select", V), r.removeEventListener("selectstart", V), r.removeEventListener("selectend", V), r.removeEventListener("squeeze", V), r.removeEventListener("squeezestart", V), r.removeEventListener("squeezeend", V), r.removeEventListener("end", W), r.removeEventListener("inputsourceschange", Q);
      for (let J = 0; J < y.length; J++) {
        const oe = w[J];
        oe !== null && (w[J] = null, y[J].disconnect(oe));
      }
      L = null, k = null, x.reset(), e.setRenderTarget(h), m = null, f = null, p = null, r = null, E = null, ct.stop(), n.isPresenting = !1, e.setPixelRatio(R), e.setSize(I.width, I.height, !1), n.dispatchEvent({ type: "sessionend" });
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
          const oe = {
            antialias: c.antialias,
            alpha: !0,
            depth: c.depth,
            stencil: c.stencil,
            framebufferScaleFactor: s
          };
          m = new XRWebGLLayer(r, t, oe), r.updateRenderState({ baseLayer: m }), e.setPixelRatio(1), e.setSize(m.framebufferWidth, m.framebufferHeight, !1), E = new Ui(
            m.framebufferWidth,
            m.framebufferHeight,
            {
              format: Hn,
              type: mi,
              colorSpace: e.outputColorSpace,
              stencilBuffer: c.stencil
            }
          );
        } else {
          let oe = null, be = null, ue = null;
          c.depth && (ue = c.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, oe = c.stencil ? Sr : mr, be = c.stencil ? yr : xr);
          const Je = {
            colorFormat: t.RGBA8,
            depthFormat: ue,
            scaleFactor: s
          };
          p = new XRWebGLBinding(r, t), f = p.createProjectionLayer(Je), r.updateRenderState({ layers: [f] }), e.setPixelRatio(1), e.setSize(f.textureWidth, f.textureHeight, !1), E = new Ui(
            f.textureWidth,
            f.textureHeight,
            {
              format: Hn,
              type: mi,
              depthTexture: new Id(f.textureWidth, f.textureHeight, be, void 0, void 0, void 0, void 0, void 0, void 0, oe),
              stencilBuffer: c.stencil,
              colorSpace: e.outputColorSpace,
              samples: c.antialias ? 4 : 0,
              resolveDepthBuffer: f.ignoreDepthValues === !1
            }
          );
        }
        E.isXRRenderTarget = !0, this.setFoveation(l), d = null, a = await r.requestReferenceSpace(o), ct.setContext(r), ct.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (r !== null)
        return r.environmentBlendMode;
    };
    function Q(J) {
      for (let oe = 0; oe < J.removed.length; oe++) {
        const be = J.removed[oe], ue = w.indexOf(be);
        ue >= 0 && (w[ue] = null, y[ue].disconnect(be));
      }
      for (let oe = 0; oe < J.added.length; oe++) {
        const be = J.added[oe];
        let ue = w.indexOf(be);
        if (ue === -1) {
          for (let Ve = 0; Ve < y.length; Ve++)
            if (Ve >= w.length) {
              w.push(be), ue = Ve;
              break;
            } else if (w[Ve] === null) {
              w[Ve] = be, ue = Ve;
              break;
            }
          if (ue === -1) break;
        }
        const Je = y[ue];
        Je && Je.connect(be);
      }
    }
    const j = new N(), ie = new N();
    function K(J, oe, be) {
      j.setFromMatrixPosition(oe.matrixWorld), ie.setFromMatrixPosition(be.matrixWorld);
      const ue = j.distanceTo(ie), Je = oe.projectionMatrix.elements, Ve = be.projectionMatrix.elements, nt = Je[14] / (Je[10] - 1), D = Je[14] / (Je[10] + 1), it = (Je[9] + 1) / Je[5], rt = (Je[9] - 1) / Je[5], yt = (Je[8] - 1) / Je[0], Oe = (Ve[8] + 1) / Ve[0], $e = nt * yt, et = nt * Oe, Ze = ue / (-yt + Oe), Ct = Ze * -yt;
      oe.matrixWorld.decompose(J.position, J.quaternion, J.scale), J.translateX(Ct), J.translateZ(Ze), J.matrixWorld.compose(J.position, J.quaternion, J.scale), J.matrixWorldInverse.copy(J.matrixWorld).invert();
      const P = nt + Ze, S = D + Ze, Y = $e - Ct, re = et + (ue - Ct), ae = it * D / S * P, ne = rt * D / S * P;
      J.projectionMatrix.makePerspective(Y, re, ae, ne, P, S), J.projectionMatrixInverse.copy(J.projectionMatrix).invert();
    }
    function de(J, oe) {
      oe === null ? J.matrixWorld.copy(J.matrix) : J.matrixWorld.multiplyMatrices(oe.matrixWorld, J.matrix), J.matrixWorldInverse.copy(J.matrixWorld).invert();
    }
    this.updateCamera = function(J) {
      if (r === null) return;
      x.texture !== null && (J.near = x.depthNear, J.far = x.depthFar), v.near = U.near = C.near = J.near, v.far = U.far = C.far = J.far, (L !== v.near || k !== v.far) && (r.updateRenderState({
        depthNear: v.near,
        depthFar: v.far
      }), L = v.near, k = v.far, C.near = L, C.far = k, U.near = L, U.far = k, C.updateProjectionMatrix(), U.updateProjectionMatrix(), J.updateProjectionMatrix());
      const oe = J.parent, be = v.cameras;
      de(v, oe);
      for (let ue = 0; ue < be.length; ue++)
        de(be[ue], oe);
      be.length === 2 ? K(v, C, U) : v.projectionMatrix.copy(C.projectionMatrix), ve(J, v, oe);
    };
    function ve(J, oe, be) {
      be === null ? J.matrix.copy(oe.matrixWorld) : (J.matrix.copy(be.matrixWorld), J.matrix.invert(), J.matrix.multiply(oe.matrixWorld)), J.matrix.decompose(J.position, J.quaternion, J.scale), J.updateMatrixWorld(!0), J.projectionMatrix.copy(oe.projectionMatrix), J.projectionMatrixInverse.copy(oe.projectionMatrixInverse), J.isPerspectiveCamera && (J.fov = so * 2 * Math.atan(1 / J.projectionMatrix.elements[5]), J.zoom = 1);
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
    function tt(J, oe) {
      if (u = oe.getViewerPose(d || a), _ = oe, u !== null) {
        const be = u.views;
        m !== null && (e.setRenderTargetFramebuffer(E, m.framebuffer), e.setRenderTarget(E));
        let ue = !1;
        be.length !== v.cameras.length && (v.cameras.length = 0, ue = !0);
        for (let Ve = 0; Ve < be.length; Ve++) {
          const nt = be[Ve];
          let D = null;
          if (m !== null)
            D = m.getViewport(nt);
          else {
            const rt = p.getViewSubImage(f, nt);
            D = rt.viewport, Ve === 0 && (e.setRenderTargetTextures(
              E,
              rt.colorTexture,
              f.ignoreDepthValues ? void 0 : rt.depthStencilTexture
            ), e.setRenderTarget(E));
          }
          let it = A[Ve];
          it === void 0 && (it = new An(), it.layers.enable(Ve), it.viewport = new en(), A[Ve] = it), it.matrix.fromArray(nt.transform.matrix), it.matrix.decompose(it.position, it.quaternion, it.scale), it.projectionMatrix.fromArray(nt.projectionMatrix), it.projectionMatrixInverse.copy(it.projectionMatrix).invert(), it.viewport.set(D.x, D.y, D.width, D.height), Ve === 0 && (v.matrix.copy(it.matrix), v.matrix.decompose(v.position, v.quaternion, v.scale)), ue === !0 && v.cameras.push(it);
        }
        const Je = r.enabledFeatures;
        if (Je && Je.includes("depth-sensing")) {
          const Ve = p.getDepthInformation(be[0]);
          Ve && Ve.isValid && Ve.texture && x.init(e, Ve, r.renderState);
        }
      }
      for (let be = 0; be < y.length; be++) {
        const ue = w[be], Je = y[be];
        ue !== null && Je !== void 0 && Je.update(ue, oe, d || a);
      }
      Ee && Ee(J, oe), oe.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: oe }), _ = null;
    }
    const ct = new Ld();
    ct.setAnimationLoop(tt), this.setAnimationLoop = function(J) {
      Ee = J;
    }, this.dispose = function() {
    };
  }
}
const Ti = /* @__PURE__ */ new En(), S_ = /* @__PURE__ */ new Et();
function M_(i, e) {
  function t(c, h) {
    c.matrixAutoUpdate === !0 && c.updateMatrix(), h.value.copy(c.matrix);
  }
  function n(c, h) {
    h.color.getRGB(c.fogColor.value, Rd(i)), h.isFog ? (c.fogNear.value = h.near, c.fogFar.value = h.far) : h.isFogExp2 && (c.fogDensity.value = h.density);
  }
  function r(c, h, E, y, w) {
    h.isMeshBasicMaterial || h.isMeshLambertMaterial ? s(c, h) : h.isMeshToonMaterial ? (s(c, h), p(c, h)) : h.isMeshPhongMaterial ? (s(c, h), u(c, h)) : h.isMeshStandardMaterial ? (s(c, h), f(c, h), h.isMeshPhysicalMaterial && m(c, h, w)) : h.isMeshMatcapMaterial ? (s(c, h), _(c, h)) : h.isMeshDepthMaterial ? s(c, h) : h.isMeshDistanceMaterial ? (s(c, h), x(c, h)) : h.isMeshNormalMaterial ? s(c, h) : h.isLineBasicMaterial ? (a(c, h), h.isLineDashedMaterial && o(c, h)) : h.isPointsMaterial ? l(c, h, E, y) : h.isSpriteMaterial ? d(c, h) : h.isShadowMaterial ? (c.color.value.copy(h.color), c.opacity.value = h.opacity) : h.isShaderMaterial && (h.uniformsNeedUpdate = !1);
  }
  function s(c, h) {
    c.opacity.value = h.opacity, h.color && c.diffuse.value.copy(h.color), h.emissive && c.emissive.value.copy(h.emissive).multiplyScalar(h.emissiveIntensity), h.map && (c.map.value = h.map, t(h.map, c.mapTransform)), h.alphaMap && (c.alphaMap.value = h.alphaMap, t(h.alphaMap, c.alphaMapTransform)), h.bumpMap && (c.bumpMap.value = h.bumpMap, t(h.bumpMap, c.bumpMapTransform), c.bumpScale.value = h.bumpScale, h.side === vn && (c.bumpScale.value *= -1)), h.normalMap && (c.normalMap.value = h.normalMap, t(h.normalMap, c.normalMapTransform), c.normalScale.value.copy(h.normalScale), h.side === vn && c.normalScale.value.negate()), h.displacementMap && (c.displacementMap.value = h.displacementMap, t(h.displacementMap, c.displacementMapTransform), c.displacementScale.value = h.displacementScale, c.displacementBias.value = h.displacementBias), h.emissiveMap && (c.emissiveMap.value = h.emissiveMap, t(h.emissiveMap, c.emissiveMapTransform)), h.specularMap && (c.specularMap.value = h.specularMap, t(h.specularMap, c.specularMapTransform)), h.alphaTest > 0 && (c.alphaTest.value = h.alphaTest);
    const E = e.get(h), y = E.envMap, w = E.envMapRotation;
    y && (c.envMap.value = y, Ti.copy(w), Ti.x *= -1, Ti.y *= -1, Ti.z *= -1, y.isCubeTexture && y.isRenderTargetTexture === !1 && (Ti.y *= -1, Ti.z *= -1), c.envMapRotation.value.setFromMatrix4(S_.makeRotationFromEuler(Ti)), c.flipEnvMap.value = y.isCubeTexture && y.isRenderTargetTexture === !1 ? -1 : 1, c.reflectivity.value = h.reflectivity, c.ior.value = h.ior, c.refractionRatio.value = h.refractionRatio), h.lightMap && (c.lightMap.value = h.lightMap, c.lightMapIntensity.value = h.lightMapIntensity, t(h.lightMap, c.lightMapTransform)), h.aoMap && (c.aoMap.value = h.aoMap, c.aoMapIntensity.value = h.aoMapIntensity, t(h.aoMap, c.aoMapTransform));
  }
  function a(c, h) {
    c.diffuse.value.copy(h.color), c.opacity.value = h.opacity, h.map && (c.map.value = h.map, t(h.map, c.mapTransform));
  }
  function o(c, h) {
    c.dashSize.value = h.dashSize, c.totalSize.value = h.dashSize + h.gapSize, c.scale.value = h.scale;
  }
  function l(c, h, E, y) {
    c.diffuse.value.copy(h.color), c.opacity.value = h.opacity, c.size.value = h.size * E, c.scale.value = y * 0.5, h.map && (c.map.value = h.map, t(h.map, c.uvTransform)), h.alphaMap && (c.alphaMap.value = h.alphaMap, t(h.alphaMap, c.alphaMapTransform)), h.alphaTest > 0 && (c.alphaTest.value = h.alphaTest);
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
  function m(c, h, E) {
    c.ior.value = h.ior, h.sheen > 0 && (c.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen), c.sheenRoughness.value = h.sheenRoughness, h.sheenColorMap && (c.sheenColorMap.value = h.sheenColorMap, t(h.sheenColorMap, c.sheenColorMapTransform)), h.sheenRoughnessMap && (c.sheenRoughnessMap.value = h.sheenRoughnessMap, t(h.sheenRoughnessMap, c.sheenRoughnessMapTransform))), h.clearcoat > 0 && (c.clearcoat.value = h.clearcoat, c.clearcoatRoughness.value = h.clearcoatRoughness, h.clearcoatMap && (c.clearcoatMap.value = h.clearcoatMap, t(h.clearcoatMap, c.clearcoatMapTransform)), h.clearcoatRoughnessMap && (c.clearcoatRoughnessMap.value = h.clearcoatRoughnessMap, t(h.clearcoatRoughnessMap, c.clearcoatRoughnessMapTransform)), h.clearcoatNormalMap && (c.clearcoatNormalMap.value = h.clearcoatNormalMap, t(h.clearcoatNormalMap, c.clearcoatNormalMapTransform), c.clearcoatNormalScale.value.copy(h.clearcoatNormalScale), h.side === vn && c.clearcoatNormalScale.value.negate())), h.dispersion > 0 && (c.dispersion.value = h.dispersion), h.iridescence > 0 && (c.iridescence.value = h.iridescence, c.iridescenceIOR.value = h.iridescenceIOR, c.iridescenceThicknessMinimum.value = h.iridescenceThicknessRange[0], c.iridescenceThicknessMaximum.value = h.iridescenceThicknessRange[1], h.iridescenceMap && (c.iridescenceMap.value = h.iridescenceMap, t(h.iridescenceMap, c.iridescenceMapTransform)), h.iridescenceThicknessMap && (c.iridescenceThicknessMap.value = h.iridescenceThicknessMap, t(h.iridescenceThicknessMap, c.iridescenceThicknessMapTransform))), h.transmission > 0 && (c.transmission.value = h.transmission, c.transmissionSamplerMap.value = E.texture, c.transmissionSamplerSize.value.set(E.width, E.height), h.transmissionMap && (c.transmissionMap.value = h.transmissionMap, t(h.transmissionMap, c.transmissionMapTransform)), c.thickness.value = h.thickness, h.thicknessMap && (c.thicknessMap.value = h.thicknessMap, t(h.thicknessMap, c.thicknessMapTransform)), c.attenuationDistance.value = h.attenuationDistance, c.attenuationColor.value.copy(h.attenuationColor)), h.anisotropy > 0 && (c.anisotropyVector.value.set(h.anisotropy * Math.cos(h.anisotropyRotation), h.anisotropy * Math.sin(h.anisotropyRotation)), h.anisotropyMap && (c.anisotropyMap.value = h.anisotropyMap, t(h.anisotropyMap, c.anisotropyMapTransform))), c.specularIntensity.value = h.specularIntensity, c.specularColor.value.copy(h.specularColor), h.specularColorMap && (c.specularColorMap.value = h.specularColorMap, t(h.specularColorMap, c.specularColorMapTransform)), h.specularIntensityMap && (c.specularIntensityMap.value = h.specularIntensityMap, t(h.specularIntensityMap, c.specularIntensityMapTransform));
  }
  function _(c, h) {
    h.matcap && (c.matcap.value = h.matcap);
  }
  function x(c, h) {
    const E = e.get(h).light;
    c.referencePosition.value.setFromMatrixPosition(E.matrixWorld), c.nearDistance.value = E.shadow.camera.near, c.farDistance.value = E.shadow.camera.far;
  }
  return {
    refreshFogUniforms: n,
    refreshMaterialUniforms: r
  };
}
function E_(i, e, t, n) {
  let r = {}, s = {}, a = [];
  const o = i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(E, y) {
    const w = y.program;
    n.uniformBlockBinding(E, w);
  }
  function d(E, y) {
    let w = r[E.id];
    w === void 0 && (_(E), w = u(E), r[E.id] = w, E.addEventListener("dispose", c));
    const I = y.program;
    n.updateUBOMapping(E, I);
    const R = e.render.frame;
    s[E.id] !== R && (f(E), s[E.id] = R);
  }
  function u(E) {
    const y = p();
    E.__bindingPointIndex = y;
    const w = i.createBuffer(), I = E.__size, R = E.usage;
    return i.bindBuffer(i.UNIFORM_BUFFER, w), i.bufferData(i.UNIFORM_BUFFER, I, R), i.bindBuffer(i.UNIFORM_BUFFER, null), i.bindBufferBase(i.UNIFORM_BUFFER, y, w), w;
  }
  function p() {
    for (let E = 0; E < o; E++)
      if (a.indexOf(E) === -1)
        return a.push(E), E;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function f(E) {
    const y = r[E.id], w = E.uniforms, I = E.__cache;
    i.bindBuffer(i.UNIFORM_BUFFER, y);
    for (let R = 0, C = w.length; R < C; R++) {
      const U = Array.isArray(w[R]) ? w[R] : [w[R]];
      for (let A = 0, v = U.length; A < v; A++) {
        const L = U[A];
        if (m(L, R, A, I) === !0) {
          const k = L.__offset, V = Array.isArray(L.value) ? L.value : [L.value];
          let W = 0;
          for (let Q = 0; Q < V.length; Q++) {
            const j = V[Q], ie = x(j);
            typeof j == "number" || typeof j == "boolean" ? (L.__data[0] = j, i.bufferSubData(i.UNIFORM_BUFFER, k + W, L.__data)) : j.isMatrix3 ? (L.__data[0] = j.elements[0], L.__data[1] = j.elements[1], L.__data[2] = j.elements[2], L.__data[3] = 0, L.__data[4] = j.elements[3], L.__data[5] = j.elements[4], L.__data[6] = j.elements[5], L.__data[7] = 0, L.__data[8] = j.elements[6], L.__data[9] = j.elements[7], L.__data[10] = j.elements[8], L.__data[11] = 0) : (j.toArray(L.__data, W), W += ie.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          i.bufferSubData(i.UNIFORM_BUFFER, k, L.__data);
        }
      }
    }
    i.bindBuffer(i.UNIFORM_BUFFER, null);
  }
  function m(E, y, w, I) {
    const R = E.value, C = y + "_" + w;
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
  function _(E) {
    const y = E.uniforms;
    let w = 0;
    const I = 16;
    for (let C = 0, U = y.length; C < U; C++) {
      const A = Array.isArray(y[C]) ? y[C] : [y[C]];
      for (let v = 0, L = A.length; v < L; v++) {
        const k = A[v], V = Array.isArray(k.value) ? k.value : [k.value];
        for (let W = 0, Q = V.length; W < Q; W++) {
          const j = V[W], ie = x(j), K = w % I;
          K !== 0 && I - K < ie.boundary && (w += I - K), k.__data = new Float32Array(ie.storage / Float32Array.BYTES_PER_ELEMENT), k.__offset = w, w += ie.storage;
        }
      }
    }
    const R = w % I;
    return R > 0 && (w += I - R), E.__size = w, E.__cache = {}, this;
  }
  function x(E) {
    const y = {
      boundary: 0,
      // bytes
      storage: 0
      // bytes
    };
    return typeof E == "number" || typeof E == "boolean" ? (y.boundary = 4, y.storage = 4) : E.isVector2 ? (y.boundary = 8, y.storage = 8) : E.isVector3 || E.isColor ? (y.boundary = 16, y.storage = 12) : E.isVector4 ? (y.boundary = 16, y.storage = 16) : E.isMatrix3 ? (y.boundary = 48, y.storage = 48) : E.isMatrix4 ? (y.boundary = 64, y.storage = 64) : E.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", E), y;
  }
  function c(E) {
    const y = E.target;
    y.removeEventListener("dispose", c);
    const w = a.indexOf(y.__bindingPointIndex);
    a.splice(w, 1), i.deleteBuffer(r[y.id]), delete r[y.id], delete s[y.id];
  }
  function h() {
    for (const E in r)
      i.deleteBuffer(r[E]);
    a = [], r = {}, s = {};
  }
  return {
    bind: l,
    update: d,
    dispose: h
  };
}
class b_ {
  constructor(e = {}) {
    const {
      canvas: t = mu(),
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
    const h = [], E = [];
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
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this._outputColorSpace = Bn, this.toneMapping = fi, this.toneMappingExposure = 1;
    const y = this;
    let w = !1, I = 0, R = 0, C = null, U = -1, A = null;
    const v = new en(), L = new en();
    let k = null;
    const V = new ft(0);
    let W = 0, Q = t.width, j = t.height, ie = 1, K = null, de = null;
    const ve = new en(0, 0, Q, j), Ee = new en(0, 0, Q, j);
    let tt = !1;
    const ct = new mo();
    let J = !1, oe = !1;
    const be = new Et(), ue = new N(), Je = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let Ve = !1;
    function nt() {
      return C === null ? ie : 1;
    }
    let D = n;
    function it(T, O) {
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
      if ("setAttribute" in t && t.setAttribute("data-engine", `three.js r${ho}`), t.addEventListener("webglcontextlost", q, !1), t.addEventListener("webglcontextrestored", z, !1), t.addEventListener("webglcontextcreationerror", $, !1), D === null) {
        const O = "webgl2";
        if (D = it(O, T), D === null)
          throw it(O) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (T) {
      throw console.error("THREE.WebGLRenderer: " + T.message), T;
    }
    let rt, yt, Oe, $e, et, Ze, Ct, P, S, Y, re, ae, ne, Pe, pe, me, Qe, ce, Ie, st, Fe, xe, qe, Ye;
    function St() {
      rt = new Nm(D), rt.init(), xe = new p_(D, rt), yt = new Am(D, rt, e, xe), Oe = new u_(D), $e = new Um(D), et = new Qg(), Ze = new f_(D, rt, Oe, et, yt, xe, $e), Ct = new Rm(y), P = new Lm(y), S = new Vu(D), qe = new bm(D, S), Y = new Im(D, S, $e, qe), re = new Fm(D, Y, S, $e), Ie = new Om(D, yt, Ze), me = new wm(et), ae = new Zg(y, Ct, P, rt, yt, qe, me), ne = new M_(y, et), Pe = new e_(), pe = new a_(rt), ce = new Em(y, Ct, P, Oe, re, f, l), Qe = new h_(y, re, yt), Ye = new E_(D, $e, yt, Oe), st = new Tm(D, rt, $e), Fe = new Dm(D, rt, $e), $e.programs = ae.programs, y.capabilities = yt, y.extensions = rt, y.properties = et, y.renderLists = Pe, y.shadowMap = Qe, y.state = Oe, y.info = $e;
    }
    St();
    const g = new y_(y, D);
    this.xr = g, this.getContext = function() {
      return D;
    }, this.getContextAttributes = function() {
      return D.getContextAttributes();
    }, this.forceContextLoss = function() {
      const T = rt.get("WEBGL_lose_context");
      T && T.loseContext();
    }, this.forceContextRestore = function() {
      const T = rt.get("WEBGL_lose_context");
      T && T.restoreContext();
    }, this.getPixelRatio = function() {
      return ie;
    }, this.setPixelRatio = function(T) {
      T !== void 0 && (ie = T, this.setSize(Q, j, !1));
    }, this.getSize = function(T) {
      return T.set(Q, j);
    }, this.setSize = function(T, O, G = !0) {
      if (g.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      Q = T, j = O, t.width = Math.floor(T * ie), t.height = Math.floor(O * ie), G === !0 && (t.style.width = T + "px", t.style.height = O + "px"), this.setViewport(0, 0, T, O);
    }, this.getDrawingBufferSize = function(T) {
      return T.set(Q * ie, j * ie).floor();
    }, this.setDrawingBufferSize = function(T, O, G) {
      Q = T, j = O, ie = G, t.width = Math.floor(T * G), t.height = Math.floor(O * G), this.setViewport(0, 0, T, O);
    }, this.getCurrentViewport = function(T) {
      return T.copy(v);
    }, this.getViewport = function(T) {
      return T.copy(ve);
    }, this.setViewport = function(T, O, G, X) {
      T.isVector4 ? ve.set(T.x, T.y, T.z, T.w) : ve.set(T, O, G, X), Oe.viewport(v.copy(ve).multiplyScalar(ie).round());
    }, this.getScissor = function(T) {
      return T.copy(Ee);
    }, this.setScissor = function(T, O, G, X) {
      T.isVector4 ? Ee.set(T.x, T.y, T.z, T.w) : Ee.set(T, O, G, X), Oe.scissor(L.copy(Ee).multiplyScalar(ie).round());
    }, this.getScissorTest = function() {
      return tt;
    }, this.setScissorTest = function(T) {
      Oe.setScissorTest(tt = T);
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
          B = he === vd || he === _d || he === gd;
        }
        if (B) {
          const he = C.texture.type, Me = he === mi || he === xr || he === Us || he === yr || he === pd || he === md, Re = ce.getClearColor(), De = ce.getClearAlpha(), Ge = Re.r, We = Re.g, Be = Re.b;
          Me ? (m[0] = Ge, m[1] = We, m[2] = Be, m[3] = De, D.clearBufferuiv(D.COLOR, 0, m)) : (_[0] = Ge, _[1] = We, _[2] = Be, _[3] = De, D.clearBufferiv(D.COLOR, 0, _));
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
      t.removeEventListener("webglcontextlost", q, !1), t.removeEventListener("webglcontextrestored", z, !1), t.removeEventListener("webglcontextcreationerror", $, !1), Pe.dispose(), pe.dispose(), et.dispose(), Ct.dispose(), P.dispose(), re.dispose(), qe.dispose(), Ye.dispose(), ae.dispose(), g.dispose(), g.removeEventListener("sessionstart", wt), g.removeEventListener("sessionend", Ot), tn.stop();
    };
    function q(T) {
      T.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), w = !0;
    }
    function z() {
      console.log("THREE.WebGLRenderer: Context Restored."), w = !1;
      const T = $e.autoReset, O = Qe.enabled, G = Qe.autoUpdate, X = Qe.needsUpdate, B = Qe.type;
      St(), $e.autoReset = T, Qe.enabled = O, Qe.autoUpdate = G, Qe.needsUpdate = X, Qe.type = B;
    }
    function $(T) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", T.statusMessage);
    }
    function te(T) {
      const O = T.target;
      O.removeEventListener("dispose", te), Le(O);
    }
    function Le(T) {
      He(T), et.remove(T);
    }
    function He(T) {
      const O = et.get(T).programs;
      O !== void 0 && (O.forEach(function(G) {
        ae.releaseProgram(G);
      }), T.isShaderMaterial && ae.releaseShaderCache(T));
    }
    this.renderBufferDirect = function(T, O, G, X, B, he) {
      O === null && (O = Je);
      const Me = B.isMesh && B.matrixWorld.determinant() < 0, Re = Dn(T, O, G, X, B);
      Oe.setMaterial(X, Me);
      let De = G.index, Ge = 1;
      if (X.wireframe === !0) {
        if (De = Y.getWireframeAttribute(G), De === void 0) return;
        Ge = 2;
      }
      const We = G.drawRange, Be = G.attributes.position;
      let pt = We.start * Ge, Lt = (We.start + We.count) * Ge;
      he !== null && (pt = Math.max(pt, he.start * Ge), Lt = Math.min(Lt, (he.start + he.count) * Ge)), De !== null ? (pt = Math.max(pt, 0), Lt = Math.min(Lt, De.count)) : Be != null && (pt = Math.max(pt, 0), Lt = Math.min(Lt, Be.count));
      const bt = Lt - pt;
      if (bt < 0 || bt === 1 / 0) return;
      qe.setup(B, X, Re, G, De);
      let Bt, mt = st;
      if (De !== null && (Bt = S.get(De), mt = Fe, mt.setIndex(Bt)), B.isMesh)
        X.wireframe === !0 ? (Oe.setLineWidth(X.wireframeLinewidth * nt()), mt.setMode(D.LINES)) : mt.setMode(D.TRIANGLES);
      else if (B.isLine) {
        let we = X.linewidth;
        we === void 0 && (we = 1), Oe.setLineWidth(we * nt()), B.isLineSegments ? mt.setMode(D.LINES) : B.isLineLoop ? mt.setMode(D.LINE_LOOP) : mt.setMode(D.LINE_STRIP);
      } else B.isPoints ? mt.setMode(D.POINTS) : B.isSprite && mt.setMode(D.TRIANGLES);
      if (B.isBatchedMesh)
        B._multiDrawInstances !== null ? mt.renderMultiDrawInstances(B._multiDrawStarts, B._multiDrawCounts, B._multiDrawCount, B._multiDrawInstances) : mt.renderMultiDraw(B._multiDrawStarts, B._multiDrawCounts, B._multiDrawCount);
      else if (B.isInstancedMesh)
        mt.renderInstances(pt, bt, B.count);
      else if (G.isInstancedBufferGeometry) {
        const we = G._maxInstanceCount !== void 0 ? G._maxInstanceCount : 1 / 0, Wt = Math.min(G.instanceCount, we);
        mt.renderInstances(pt, bt, Wt);
      } else
        mt.render(pt, bt);
    };
    function Pt(T, O, G) {
      T.transparent === !0 && T.side === kn && T.forceSinglePass === !1 ? (T.side = vn, T.needsUpdate = !0, Wn(T, O, G), T.side = pi, T.needsUpdate = !0, Wn(T, O, G), T.side = kn) : Wn(T, O, G);
    }
    this.compile = function(T, O, G = null) {
      G === null && (G = T), c = pe.get(G), c.init(O), E.push(c), G.traverseVisible(function(B) {
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
              const Re = he[Me];
              Pt(Re, G, B), X.add(Re);
            }
          else
            Pt(he, G, B), X.add(he);
      }), E.pop(), c = null, X;
    }, this.compileAsync = function(T, O, G = null) {
      const X = this.compile(T, O, G);
      return new Promise((B) => {
        function he() {
          if (X.forEach(function(Me) {
            et.get(Me).currentProgram.isReady() && X.delete(Me);
          }), X.size === 0) {
            B(T);
            return;
          }
          setTimeout(he, 10);
        }
        rt.get("KHR_parallel_shader_compile") !== null ? he() : setTimeout(he, 10);
      });
    };
    let Dt = null;
    function dt(T) {
      Dt && Dt(T);
    }
    function wt() {
      tn.stop();
    }
    function Ot() {
      tn.start();
    }
    const tn = new Ld();
    tn.setAnimationLoop(dt), typeof self < "u" && tn.setContext(self), this.setAnimationLoop = function(T) {
      Dt = T, g.setAnimationLoop(T), T === null ? tn.stop() : tn.start();
    }, g.addEventListener("sessionstart", wt), g.addEventListener("sessionend", Ot), this.render = function(T, O) {
      if (O !== void 0 && O.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (w === !0) return;
      if (T.matrixWorldAutoUpdate === !0 && T.updateMatrixWorld(), O.parent === null && O.matrixWorldAutoUpdate === !0 && O.updateMatrixWorld(), g.enabled === !0 && g.isPresenting === !0 && (g.cameraAutoUpdate === !0 && g.updateCamera(O), O = g.getCamera()), T.isScene === !0 && T.onBeforeRender(y, T, O, C), c = pe.get(T, E.length), c.init(O), E.push(c), be.multiplyMatrices(O.projectionMatrix, O.matrixWorldInverse), ct.setFromProjectionMatrix(be), oe = this.localClippingEnabled, J = me.init(this.clippingPlanes, oe), x = Pe.get(T, h.length), x.init(), h.push(x), g.enabled === !0 && g.isPresenting === !0) {
        const he = y.xr.getDepthSensingMesh();
        he !== null && Gt(he, O, -1 / 0, y.sortObjects);
      }
      Gt(T, O, 0, y.sortObjects), x.finish(), y.sortObjects === !0 && x.sort(K, de), Ve = g.enabled === !1 || g.isPresenting === !1 || g.hasDepthSensing() === !1, Ve && ce.addToRenderList(x, T), this.info.render.frame++, J === !0 && me.beginShadows();
      const G = c.state.shadowsArray;
      Qe.render(G, T, O), J === !0 && me.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const X = x.opaque, B = x.transmissive;
      if (c.setupLights(), O.isArrayCamera) {
        const he = O.cameras;
        if (B.length > 0)
          for (let Me = 0, Re = he.length; Me < Re; Me++) {
            const De = he[Me];
            Rn(X, B, T, De);
          }
        Ve && ce.render(T);
        for (let Me = 0, Re = he.length; Me < Re; Me++) {
          const De = he[Me];
          $t(x, T, De, De.viewport);
        }
      } else
        B.length > 0 && Rn(X, B, T, O), Ve && ce.render(T), $t(x, T, O);
      C !== null && (Ze.updateMultisampleRenderTarget(C), Ze.updateRenderTargetMipmap(C)), T.isScene === !0 && T.onAfterRender(y, T, O), qe.resetDefaultState(), U = -1, A = null, E.pop(), E.length > 0 ? (c = E[E.length - 1], J === !0 && me.setGlobalState(y.clippingPlanes, c.state.camera)) : c = null, h.pop(), h.length > 0 ? x = h[h.length - 1] : x = null;
    };
    function Gt(T, O, G, X) {
      if (T.visible === !1) return;
      if (T.layers.test(O.layers)) {
        if (T.isGroup)
          G = T.renderOrder;
        else if (T.isLOD)
          T.autoUpdate === !0 && T.update(O);
        else if (T.isLight)
          c.pushLight(T), T.castShadow && c.pushShadow(T);
        else if (T.isSprite) {
          if (!T.frustumCulled || ct.intersectsSprite(T)) {
            X && ue.setFromMatrixPosition(T.matrixWorld).applyMatrix4(be);
            const Me = re.update(T), Re = T.material;
            Re.visible && x.push(T, Me, Re, G, ue.z, null);
          }
        } else if ((T.isMesh || T.isLine || T.isPoints) && (!T.frustumCulled || ct.intersectsObject(T))) {
          const Me = re.update(T), Re = T.material;
          if (X && (T.boundingSphere !== void 0 ? (T.boundingSphere === null && T.computeBoundingSphere(), ue.copy(T.boundingSphere.center)) : (Me.boundingSphere === null && Me.computeBoundingSphere(), ue.copy(Me.boundingSphere.center)), ue.applyMatrix4(T.matrixWorld).applyMatrix4(be)), Array.isArray(Re)) {
            const De = Me.groups;
            for (let Ge = 0, We = De.length; Ge < We; Ge++) {
              const Be = De[Ge], pt = Re[Be.materialIndex];
              pt && pt.visible && x.push(T, Me, pt, G, ue.z, Be);
            }
          } else Re.visible && x.push(T, Me, Re, G, ue.z, null);
        }
      }
      const he = T.children;
      for (let Me = 0, Re = he.length; Me < Re; Me++)
        Gt(he[Me], O, G, X);
    }
    function $t(T, O, G, X) {
      const B = T.opaque, he = T.transmissive, Me = T.transparent;
      c.setupLightsView(G), J === !0 && me.setGlobalState(y.clippingPlanes, G), X && Oe.viewport(v.copy(X)), B.length > 0 && bn(B, O, G), he.length > 0 && bn(he, O, G), Me.length > 0 && bn(Me, O, G), Oe.buffers.depth.setTest(!0), Oe.buffers.depth.setMask(!0), Oe.buffers.color.setMask(!0), Oe.setPolygonOffset(!1);
    }
    function Rn(T, O, G, X) {
      if ((G.isScene === !0 ? G.overrideMaterial : null) !== null)
        return;
      c.state.transmissionRenderTarget[X.id] === void 0 && (c.state.transmissionRenderTarget[X.id] = new Ui(1, 1, {
        generateMipmaps: !0,
        type: rt.has("EXT_color_buffer_half_float") || rt.has("EXT_color_buffer_float") ? Ws : mi,
        minFilter: Ii,
        samples: 4,
        stencilBuffer: s,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: xt.workingColorSpace
      }));
      const he = c.state.transmissionRenderTarget[X.id], Me = X.viewport || v;
      he.setSize(Me.z, Me.w);
      const Re = y.getRenderTarget();
      y.setRenderTarget(he), y.getClearColor(V), W = y.getClearAlpha(), W < 1 && y.setClearColor(16777215, 0.5), Ve ? ce.render(G) : y.clear();
      const De = y.toneMapping;
      y.toneMapping = fi;
      const Ge = X.viewport;
      if (X.viewport !== void 0 && (X.viewport = void 0), c.setupLightsView(X), J === !0 && me.setGlobalState(y.clippingPlanes, X), bn(T, G, X), Ze.updateMultisampleRenderTarget(he), Ze.updateRenderTargetMipmap(he), rt.has("WEBGL_multisampled_render_to_texture") === !1) {
        let We = !1;
        for (let Be = 0, pt = O.length; Be < pt; Be++) {
          const Lt = O[Be], bt = Lt.object, Bt = Lt.geometry, mt = Lt.material, we = Lt.group;
          if (mt.side === kn && bt.layers.test(X.layers)) {
            const Wt = mt.side;
            mt.side = vn, mt.needsUpdate = !0, hn(bt, G, X, Bt, mt, we), mt.side = Wt, mt.needsUpdate = !0, We = !0;
          }
        }
        We === !0 && (Ze.updateMultisampleRenderTarget(he), Ze.updateRenderTargetMipmap(he));
      }
      y.setRenderTarget(Re), y.setClearColor(V, W), Ge !== void 0 && (X.viewport = Ge), y.toneMapping = De;
    }
    function bn(T, O, G) {
      const X = O.isScene === !0 ? O.overrideMaterial : null;
      for (let B = 0, he = T.length; B < he; B++) {
        const Me = T[B], Re = Me.object, De = Me.geometry, Ge = X === null ? Me.material : X, We = Me.group;
        Re.layers.test(G.layers) && hn(Re, O, G, De, Ge, We);
      }
    }
    function hn(T, O, G, X, B, he) {
      T.onBeforeRender(y, O, G, X, B, he), T.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse, T.matrixWorld), T.normalMatrix.getNormalMatrix(T.modelViewMatrix), B.onBeforeRender(y, O, G, X, T, he), B.transparent === !0 && B.side === kn && B.forceSinglePass === !1 ? (B.side = vn, B.needsUpdate = !0, y.renderBufferDirect(G, O, X, B, T, he), B.side = pi, B.needsUpdate = !0, y.renderBufferDirect(G, O, X, B, T, he), B.side = kn) : y.renderBufferDirect(G, O, X, B, T, he), T.onAfterRender(y, O, G, X, B, he);
    }
    function Wn(T, O, G) {
      O.isScene !== !0 && (O = Je);
      const X = et.get(T), B = c.state.lights, he = c.state.shadowsArray, Me = B.state.version, Re = ae.getParameters(T, B.state, he, O, G), De = ae.getProgramCacheKey(Re);
      let Ge = X.programs;
      X.environment = T.isMeshStandardMaterial ? O.environment : null, X.fog = O.fog, X.envMap = (T.isMeshStandardMaterial ? P : Ct).get(T.envMap || X.environment), X.envMapRotation = X.environment !== null && T.envMap === null ? O.environmentRotation : T.envMapRotation, Ge === void 0 && (T.addEventListener("dispose", te), Ge = /* @__PURE__ */ new Map(), X.programs = Ge);
      let We = Ge.get(De);
      if (We !== void 0) {
        if (X.currentProgram === We && X.lightsStateVersion === Me)
          return nn(T, Re), We;
      } else
        Re.uniforms = ae.getUniforms(T), T.onBuild(G, Re, y), T.onBeforeCompile(Re, y), We = ae.acquireProgram(Re, De), Ge.set(De, We), X.uniforms = Re.uniforms;
      const Be = X.uniforms;
      return (!T.isShaderMaterial && !T.isRawShaderMaterial || T.clipping === !0) && (Be.clippingPlanes = me.uniform), nn(T, Re), X.needsLights = Zs(T), X.lightsStateVersion = Me, X.needsLights && (Be.ambientLightColor.value = B.state.ambient, Be.lightProbe.value = B.state.probe, Be.directionalLights.value = B.state.directional, Be.directionalLightShadows.value = B.state.directionalShadow, Be.spotLights.value = B.state.spot, Be.spotLightShadows.value = B.state.spotShadow, Be.rectAreaLights.value = B.state.rectArea, Be.ltc_1.value = B.state.rectAreaLTC1, Be.ltc_2.value = B.state.rectAreaLTC2, Be.pointLights.value = B.state.point, Be.pointLightShadows.value = B.state.pointShadow, Be.hemisphereLights.value = B.state.hemi, Be.directionalShadowMap.value = B.state.directionalShadowMap, Be.directionalShadowMatrix.value = B.state.directionalShadowMatrix, Be.spotShadowMap.value = B.state.spotShadowMap, Be.spotLightMatrix.value = B.state.spotLightMatrix, Be.spotLightMap.value = B.state.spotLightMap, Be.pointShadowMap.value = B.state.pointShadowMap, Be.pointShadowMatrix.value = B.state.pointShadowMatrix), X.currentProgram = We, X.uniformsList = null, We;
    }
    function vi(T) {
      if (T.uniformsList === null) {
        const O = T.currentProgram.getUniforms();
        T.uniformsList = Ns.seqWithValue(O.seq, T.uniforms);
      }
      return T.uniformsList;
    }
    function nn(T, O) {
      const G = et.get(T);
      G.outputColorSpace = O.outputColorSpace, G.batching = O.batching, G.batchingColor = O.batchingColor, G.instancing = O.instancing, G.instancingColor = O.instancingColor, G.instancingMorph = O.instancingMorph, G.skinning = O.skinning, G.morphTargets = O.morphTargets, G.morphNormals = O.morphNormals, G.morphColors = O.morphColors, G.morphTargetsCount = O.morphTargetsCount, G.numClippingPlanes = O.numClippingPlanes, G.numIntersection = O.numClipIntersection, G.vertexAlphas = O.vertexAlphas, G.vertexTangents = O.vertexTangents, G.toneMapping = O.toneMapping;
    }
    function Dn(T, O, G, X, B) {
      O.isScene !== !0 && (O = Je), Ze.resetTextureUnits();
      const he = O.fog, Me = X.isMeshStandardMaterial ? O.environment : null, Re = C === null ? y.outputColorSpace : C.isXRRenderTarget === !0 ? C.texture.colorSpace : _i, De = (X.isMeshStandardMaterial ? P : Ct).get(X.envMap || Me), Ge = X.vertexColors === !0 && !!G.attributes.color && G.attributes.color.itemSize === 4, We = !!G.attributes.tangent && (!!X.normalMap || X.anisotropy > 0), Be = !!G.morphAttributes.position, pt = !!G.morphAttributes.normal, Lt = !!G.morphAttributes.color;
      let bt = fi;
      X.toneMapped && (C === null || C.isXRRenderTarget === !0) && (bt = y.toneMapping);
      const Bt = G.morphAttributes.position || G.morphAttributes.normal || G.morphAttributes.color, mt = Bt !== void 0 ? Bt.length : 0, we = et.get(X), Wt = c.state.lights;
      if (J === !0 && (oe === !0 || T !== A)) {
        const fn = T === A && X.id === U;
        me.setState(X, T, fn);
      }
      let ht = !1;
      X.version === we.__version ? (we.needsLights && we.lightsStateVersion !== Wt.state.version || we.outputColorSpace !== Re || B.isBatchedMesh && we.batching === !1 || !B.isBatchedMesh && we.batching === !0 || B.isBatchedMesh && we.batchingColor === !0 && B.colorTexture === null || B.isBatchedMesh && we.batchingColor === !1 && B.colorTexture !== null || B.isInstancedMesh && we.instancing === !1 || !B.isInstancedMesh && we.instancing === !0 || B.isSkinnedMesh && we.skinning === !1 || !B.isSkinnedMesh && we.skinning === !0 || B.isInstancedMesh && we.instancingColor === !0 && B.instanceColor === null || B.isInstancedMesh && we.instancingColor === !1 && B.instanceColor !== null || B.isInstancedMesh && we.instancingMorph === !0 && B.morphTexture === null || B.isInstancedMesh && we.instancingMorph === !1 && B.morphTexture !== null || we.envMap !== De || X.fog === !0 && we.fog !== he || we.numClippingPlanes !== void 0 && (we.numClippingPlanes !== me.numPlanes || we.numIntersection !== me.numIntersection) || we.vertexAlphas !== Ge || we.vertexTangents !== We || we.morphTargets !== Be || we.morphNormals !== pt || we.morphColors !== Lt || we.toneMapping !== bt || we.morphTargetsCount !== mt) && (ht = !0) : (ht = !0, we.__version = X.version);
      let un = we.currentProgram;
      ht === !0 && (un = Wn(X, O, B));
      let Fi = !1, Cn = !1, Bi = !1;
      const Ft = un.getUniforms(), Un = we.uniforms;
      if (Oe.useProgram(un.program) && (Fi = !0, Cn = !0, Bi = !0), X.id !== U && (U = X.id, Cn = !0), Fi || A !== T) {
        Ft.setValue(D, "projectionMatrix", T.projectionMatrix), Ft.setValue(D, "viewMatrix", T.matrixWorldInverse);
        const fn = Ft.map.cameraPosition;
        fn !== void 0 && fn.setValue(D, ue.setFromMatrixPosition(T.matrixWorld)), yt.logarithmicDepthBuffer && Ft.setValue(
          D,
          "logDepthBufFC",
          2 / (Math.log(T.far + 1) / Math.LN2)
        ), (X.isMeshPhongMaterial || X.isMeshToonMaterial || X.isMeshLambertMaterial || X.isMeshBasicMaterial || X.isMeshStandardMaterial || X.isShaderMaterial) && Ft.setValue(D, "isOrthographic", T.isOrthographicCamera === !0), A !== T && (A = T, Cn = !0, Bi = !0);
      }
      if (B.isSkinnedMesh) {
        Ft.setOptional(D, B, "bindMatrix"), Ft.setOptional(D, B, "bindMatrixInverse");
        const fn = B.skeleton;
        fn && (fn.boneTexture === null && fn.computeBoneTexture(), Ft.setValue(D, "boneTexture", fn.boneTexture, Ze));
      }
      B.isBatchedMesh && (Ft.setOptional(D, B, "batchingTexture"), Ft.setValue(D, "batchingTexture", B._matricesTexture, Ze), Ft.setOptional(D, B, "batchingColorTexture"), B._colorsTexture !== null && Ft.setValue(D, "batchingColorTexture", B._colorsTexture, Ze));
      const zi = G.morphAttributes;
      if ((zi.position !== void 0 || zi.normal !== void 0 || zi.color !== void 0) && Ie.update(B, G, un), (Cn || we.receiveShadow !== B.receiveShadow) && (we.receiveShadow = B.receiveShadow, Ft.setValue(D, "receiveShadow", B.receiveShadow)), X.isMeshGouraudMaterial && X.envMap !== null && (Un.envMap.value = De, Un.flipEnvMap.value = De.isCubeTexture && De.isRenderTargetTexture === !1 ? -1 : 1), X.isMeshStandardMaterial && X.envMap === null && O.environment !== null && (Un.envMapIntensity.value = O.environmentIntensity), Cn && (Ft.setValue(D, "toneMappingExposure", y.toneMappingExposure), we.needsLights && Zt(Un, Bi), he && X.fog === !0 && ne.refreshFogUniforms(Un, he), ne.refreshMaterialUniforms(Un, X, ie, j, c.state.transmissionRenderTarget[T.id]), Ns.upload(D, vi(we), Un, Ze)), X.isShaderMaterial && X.uniformsNeedUpdate === !0 && (Ns.upload(D, vi(we), Un, Ze), X.uniformsNeedUpdate = !1), X.isSpriteMaterial && Ft.setValue(D, "center", B.center), Ft.setValue(D, "modelViewMatrix", B.modelViewMatrix), Ft.setValue(D, "normalMatrix", B.normalMatrix), Ft.setValue(D, "modelMatrix", B.matrixWorld), X.isShaderMaterial || X.isRawShaderMaterial) {
        const fn = X.uniformsGroups;
        for (let ki = 0, Tr = fn.length; ki < Tr; ki++) {
          const Vi = fn[ki];
          Ye.update(Vi, un), Ye.bind(Vi, un);
        }
      }
      return un;
    }
    function Zt(T, O) {
      T.ambientLightColor.needsUpdate = O, T.lightProbe.needsUpdate = O, T.directionalLights.needsUpdate = O, T.directionalLightShadows.needsUpdate = O, T.pointLights.needsUpdate = O, T.pointLightShadows.needsUpdate = O, T.spotLights.needsUpdate = O, T.spotLightShadows.needsUpdate = O, T.rectAreaLights.needsUpdate = O, T.hemisphereLights.needsUpdate = O;
    }
    function Zs(T) {
      return T.isMeshLambertMaterial || T.isMeshToonMaterial || T.isMeshPhongMaterial || T.isMeshStandardMaterial || T.isShadowMaterial || T.isShaderMaterial && T.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return I;
    }, this.getActiveMipmapLevel = function() {
      return R;
    }, this.getRenderTarget = function() {
      return C;
    }, this.setRenderTargetTextures = function(T, O, G) {
      et.get(T.texture).__webglTexture = O, et.get(T.depthTexture).__webglTexture = G;
      const X = et.get(T);
      X.__hasExternalTextures = !0, X.__autoAllocateDepthBuffer = G === void 0, X.__autoAllocateDepthBuffer || rt.has("WEBGL_multisampled_render_to_texture") === !0 && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), X.__useRenderToTexture = !1);
    }, this.setRenderTargetFramebuffer = function(T, O) {
      const G = et.get(T);
      G.__webglFramebuffer = O, G.__useDefaultFramebuffer = O === void 0;
    }, this.setRenderTarget = function(T, O = 0, G = 0) {
      C = T, I = O, R = G;
      let X = !0, B = null, he = !1, Me = !1;
      if (T) {
        const De = et.get(T);
        De.__useDefaultFramebuffer !== void 0 ? (Oe.bindFramebuffer(D.FRAMEBUFFER, null), X = !1) : De.__webglFramebuffer === void 0 ? Ze.setupRenderTarget(T) : De.__hasExternalTextures && Ze.rebindTextures(T, et.get(T.texture).__webglTexture, et.get(T.depthTexture).__webglTexture);
        const Ge = T.texture;
        (Ge.isData3DTexture || Ge.isDataArrayTexture || Ge.isCompressedArrayTexture) && (Me = !0);
        const We = et.get(T).__webglFramebuffer;
        T.isWebGLCubeRenderTarget ? (Array.isArray(We[O]) ? B = We[O][G] : B = We[O], he = !0) : T.samples > 0 && Ze.useMultisampledRTT(T) === !1 ? B = et.get(T).__webglMultisampledFramebuffer : Array.isArray(We) ? B = We[G] : B = We, v.copy(T.viewport), L.copy(T.scissor), k = T.scissorTest;
      } else
        v.copy(ve).multiplyScalar(ie).floor(), L.copy(Ee).multiplyScalar(ie).floor(), k = tt;
      if (Oe.bindFramebuffer(D.FRAMEBUFFER, B) && X && Oe.drawBuffers(T, B), Oe.viewport(v), Oe.scissor(L), Oe.setScissorTest(k), he) {
        const De = et.get(T.texture);
        D.framebufferTexture2D(D.FRAMEBUFFER, D.COLOR_ATTACHMENT0, D.TEXTURE_CUBE_MAP_POSITIVE_X + O, De.__webglTexture, G);
      } else if (Me) {
        const De = et.get(T.texture), Ge = O || 0;
        D.framebufferTextureLayer(D.FRAMEBUFFER, D.COLOR_ATTACHMENT0, De.__webglTexture, G || 0, Ge);
      }
      U = -1;
    }, this.readRenderTargetPixels = function(T, O, G, X, B, he, Me) {
      if (!(T && T.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let Re = et.get(T).__webglFramebuffer;
      if (T.isWebGLCubeRenderTarget && Me !== void 0 && (Re = Re[Me]), Re) {
        Oe.bindFramebuffer(D.FRAMEBUFFER, Re);
        try {
          const De = T.texture, Ge = De.format, We = De.type;
          if (!yt.textureFormatReadable(Ge)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!yt.textureTypeReadable(We)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          O >= 0 && O <= T.width - X && G >= 0 && G <= T.height - B && D.readPixels(O, G, X, B, xe.convert(Ge), xe.convert(We), he);
        } finally {
          const De = C !== null ? et.get(C).__webglFramebuffer : null;
          Oe.bindFramebuffer(D.FRAMEBUFFER, De);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(T, O, G, X, B, he, Me) {
      if (!(T && T.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let Re = et.get(T).__webglFramebuffer;
      if (T.isWebGLCubeRenderTarget && Me !== void 0 && (Re = Re[Me]), Re) {
        Oe.bindFramebuffer(D.FRAMEBUFFER, Re);
        try {
          const De = T.texture, Ge = De.format, We = De.type;
          if (!yt.textureFormatReadable(Ge))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
          if (!yt.textureTypeReadable(We))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
          if (O >= 0 && O <= T.width - X && G >= 0 && G <= T.height - B) {
            const Be = D.createBuffer();
            D.bindBuffer(D.PIXEL_PACK_BUFFER, Be), D.bufferData(D.PIXEL_PACK_BUFFER, he.byteLength, D.STREAM_READ), D.readPixels(O, G, X, B, xe.convert(Ge), xe.convert(We), 0), D.flush();
            const pt = D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE, 0);
            await gu(D, pt, 4);
            try {
              D.bindBuffer(D.PIXEL_PACK_BUFFER, Be), D.getBufferSubData(D.PIXEL_PACK_BUFFER, 0, he);
            } finally {
              D.deleteBuffer(Be), D.deleteSync(pt);
            }
            return he;
          }
        } finally {
          const De = C !== null ? et.get(C).__webglFramebuffer : null;
          Oe.bindFramebuffer(D.FRAMEBUFFER, De);
        }
      }
    }, this.copyFramebufferToTexture = function(T, O = null, G = 0) {
      T.isTexture !== !0 && (console.warn("WebGLRenderer: copyFramebufferToTexture function signature has changed."), O = arguments[0] || null, T = arguments[1]);
      const X = Math.pow(2, -G), B = Math.floor(T.image.width * X), he = Math.floor(T.image.height * X), Me = O !== null ? O.x : 0, Re = O !== null ? O.y : 0;
      Ze.setTexture2D(T, 0), D.copyTexSubImage2D(D.TEXTURE_2D, G, 0, 0, Me, Re, B, he), Oe.unbindTexture();
    }, this.copyTextureToTexture = function(T, O, G = null, X = null, B = 0) {
      T.isTexture !== !0 && (console.warn("WebGLRenderer: copyTextureToTexture function signature has changed."), X = arguments[0] || null, T = arguments[1], O = arguments[2], B = arguments[3] || 0, G = null);
      let he, Me, Re, De, Ge, We;
      G !== null ? (he = G.max.x - G.min.x, Me = G.max.y - G.min.y, Re = G.min.x, De = G.min.y) : (he = T.image.width, Me = T.image.height, Re = 0, De = 0), X !== null ? (Ge = X.x, We = X.y) : (Ge = 0, We = 0);
      const Be = xe.convert(O.format), pt = xe.convert(O.type);
      Ze.setTexture2D(O, 0), D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL, O.flipY), D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL, O.premultiplyAlpha), D.pixelStorei(D.UNPACK_ALIGNMENT, O.unpackAlignment);
      const Lt = D.getParameter(D.UNPACK_ROW_LENGTH), bt = D.getParameter(D.UNPACK_IMAGE_HEIGHT), Bt = D.getParameter(D.UNPACK_SKIP_PIXELS), mt = D.getParameter(D.UNPACK_SKIP_ROWS), we = D.getParameter(D.UNPACK_SKIP_IMAGES), Wt = T.isCompressedTexture ? T.mipmaps[B] : T.image;
      D.pixelStorei(D.UNPACK_ROW_LENGTH, Wt.width), D.pixelStorei(D.UNPACK_IMAGE_HEIGHT, Wt.height), D.pixelStorei(D.UNPACK_SKIP_PIXELS, Re), D.pixelStorei(D.UNPACK_SKIP_ROWS, De), T.isDataTexture ? D.texSubImage2D(D.TEXTURE_2D, B, Ge, We, he, Me, Be, pt, Wt.data) : T.isCompressedTexture ? D.compressedTexSubImage2D(D.TEXTURE_2D, B, Ge, We, Wt.width, Wt.height, Be, Wt.data) : D.texSubImage2D(D.TEXTURE_2D, B, Ge, We, Be, pt, Wt), D.pixelStorei(D.UNPACK_ROW_LENGTH, Lt), D.pixelStorei(D.UNPACK_IMAGE_HEIGHT, bt), D.pixelStorei(D.UNPACK_SKIP_PIXELS, Bt), D.pixelStorei(D.UNPACK_SKIP_ROWS, mt), D.pixelStorei(D.UNPACK_SKIP_IMAGES, we), B === 0 && O.generateMipmaps && D.generateMipmap(D.TEXTURE_2D), Oe.unbindTexture();
    }, this.copyTextureToTexture3D = function(T, O, G = null, X = null, B = 0) {
      T.isTexture !== !0 && (console.warn("WebGLRenderer: copyTextureToTexture3D function signature has changed."), G = arguments[0] || null, X = arguments[1] || null, T = arguments[2], O = arguments[3], B = arguments[4] || 0);
      let he, Me, Re, De, Ge, We, Be, pt, Lt;
      const bt = T.isCompressedTexture ? T.mipmaps[B] : T.image;
      G !== null ? (he = G.max.x - G.min.x, Me = G.max.y - G.min.y, Re = G.max.z - G.min.z, De = G.min.x, Ge = G.min.y, We = G.min.z) : (he = bt.width, Me = bt.height, Re = bt.depth, De = 0, Ge = 0, We = 0), X !== null ? (Be = X.x, pt = X.y, Lt = X.z) : (Be = 0, pt = 0, Lt = 0);
      const Bt = xe.convert(O.format), mt = xe.convert(O.type);
      let we;
      if (O.isData3DTexture)
        Ze.setTexture3D(O, 0), we = D.TEXTURE_3D;
      else if (O.isDataArrayTexture || O.isCompressedArrayTexture)
        Ze.setTexture2DArray(O, 0), we = D.TEXTURE_2D_ARRAY;
      else {
        console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");
        return;
      }
      D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL, O.flipY), D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL, O.premultiplyAlpha), D.pixelStorei(D.UNPACK_ALIGNMENT, O.unpackAlignment);
      const Wt = D.getParameter(D.UNPACK_ROW_LENGTH), ht = D.getParameter(D.UNPACK_IMAGE_HEIGHT), un = D.getParameter(D.UNPACK_SKIP_PIXELS), Fi = D.getParameter(D.UNPACK_SKIP_ROWS), Cn = D.getParameter(D.UNPACK_SKIP_IMAGES);
      D.pixelStorei(D.UNPACK_ROW_LENGTH, bt.width), D.pixelStorei(D.UNPACK_IMAGE_HEIGHT, bt.height), D.pixelStorei(D.UNPACK_SKIP_PIXELS, De), D.pixelStorei(D.UNPACK_SKIP_ROWS, Ge), D.pixelStorei(D.UNPACK_SKIP_IMAGES, We), T.isDataTexture || T.isData3DTexture ? D.texSubImage3D(we, B, Be, pt, Lt, he, Me, Re, Bt, mt, bt.data) : O.isCompressedArrayTexture ? D.compressedTexSubImage3D(we, B, Be, pt, Lt, he, Me, Re, Bt, bt.data) : D.texSubImage3D(we, B, Be, pt, Lt, he, Me, Re, Bt, mt, bt), D.pixelStorei(D.UNPACK_ROW_LENGTH, Wt), D.pixelStorei(D.UNPACK_IMAGE_HEIGHT, ht), D.pixelStorei(D.UNPACK_SKIP_PIXELS, un), D.pixelStorei(D.UNPACK_SKIP_ROWS, Fi), D.pixelStorei(D.UNPACK_SKIP_IMAGES, Cn), B === 0 && O.generateMipmaps && D.generateMipmap(we), Oe.unbindTexture();
    }, this.initRenderTarget = function(T) {
      et.get(T).__webglFramebuffer === void 0 && Ze.setupRenderTarget(T);
    }, this.initTexture = function(T) {
      T.isCubeTexture ? Ze.setTextureCube(T, 0) : T.isData3DTexture ? Ze.setTexture3D(T, 0) : T.isDataArrayTexture || T.isCompressedArrayTexture ? Ze.setTexture2DArray(T, 0) : Ze.setTexture2D(T, 0), Oe.unbindTexture();
    }, this.resetState = function() {
      I = 0, R = 0, C = null, Oe.reset(), qe.reset();
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  get coordinateSystem() {
    return ei;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(e) {
    this._outputColorSpace = e;
    const t = this.getContext();
    t.drawingBufferColorSpace = e === fo ? "display-p3" : "srgb", t.unpackColorSpace = xt.workingColorSpace === Xs ? "display-p3" : "srgb";
  }
}
class T_ extends Yt {
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
class $s extends Er {
  constructor(e) {
    super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new ft(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.linewidth = e.linewidth, this.linecap = e.linecap, this.linejoin = e.linejoin, this.fog = e.fog, this;
  }
}
const Vs = /* @__PURE__ */ new N(), Hs = /* @__PURE__ */ new N(), Wc = /* @__PURE__ */ new Et(), Fr = /* @__PURE__ */ new qs(), Es = /* @__PURE__ */ new Ys(), Wa = /* @__PURE__ */ new N(), Xc = /* @__PURE__ */ new N();
class Jn extends Yt {
  constructor(e = new dn(), t = new $s()) {
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
        Vs.fromBufferAttribute(t, r - 1), Hs.fromBufferAttribute(t, r), n[r] = n[r - 1], n[r] += Vs.distanceTo(Hs);
      e.setAttribute("lineDistance", new At(n, 1));
    } else
      console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
  raycast(e, t) {
    const n = this.geometry, r = this.matrixWorld, s = e.params.Line.threshold, a = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), Es.copy(n.boundingSphere), Es.applyMatrix4(r), Es.radius += s, e.ray.intersectsSphere(Es) === !1) return;
    Wc.copy(r).invert(), Fr.copy(e.ray).applyMatrix4(Wc);
    const o = s / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = o * o, d = this.isLineSegments ? 2 : 1, u = n.index, f = n.attributes.position;
    if (u !== null) {
      const m = Math.max(0, a.start), _ = Math.min(u.count, a.start + a.count);
      for (let x = m, c = _ - 1; x < c; x += d) {
        const h = u.getX(x), E = u.getX(x + 1), y = bs(this, e, Fr, l, h, E);
        y && t.push(y);
      }
      if (this.isLineLoop) {
        const x = u.getX(_ - 1), c = u.getX(m), h = bs(this, e, Fr, l, x, c);
        h && t.push(h);
      }
    } else {
      const m = Math.max(0, a.start), _ = Math.min(f.count, a.start + a.count);
      for (let x = m, c = _ - 1; x < c; x += d) {
        const h = bs(this, e, Fr, l, x, x + 1);
        h && t.push(h);
      }
      if (this.isLineLoop) {
        const x = bs(this, e, Fr, l, _ - 1, m);
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
function bs(i, e, t, n, r, s) {
  const a = i.geometry.attributes.position;
  if (Vs.fromBufferAttribute(a, r), Hs.fromBufferAttribute(a, s), t.distanceSqToSegment(Vs, Hs, Wa, Xc) > n) return;
  Wa.applyMatrix4(i.matrixWorld);
  const l = e.ray.origin.distanceTo(Wa);
  if (!(l < e.near || l > e.far))
    return {
      distance: l,
      // What do we want? intersection point on the ray or on the segment??
      // point: raycaster.ray.at( distance ),
      point: Xc.clone().applyMatrix4(i.matrixWorld),
      index: r,
      face: null,
      faceIndex: null,
      object: i
    };
}
const Yc = /* @__PURE__ */ new N(), qc = /* @__PURE__ */ new N();
class zd extends Jn {
  constructor(e, t) {
    super(e, t), this.isLineSegments = !0, this.type = "LineSegments";
  }
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const t = e.attributes.position, n = [];
      for (let r = 0, s = t.count; r < s; r += 2)
        Yc.fromBufferAttribute(t, r), qc.fromBufferAttribute(t, r + 1), n[r] = r === 0 ? 0 : n[r - 1], n[r + 1] = n[r] + Yc.distanceTo(qc);
      e.setAttribute("lineDistance", new At(n, 1));
    } else
      console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
}
class ln extends dn {
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
    E(), a === !1 && (e > 0 && y(!0), t > 0 && y(!1)), this.setIndex(u), this.setAttribute("position", new At(p, 3)), this.setAttribute("normal", new At(f, 3)), this.setAttribute("uv", new At(m, 2));
    function E() {
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
      const I = _, R = new Ke(), C = new N();
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
    return new ln(e.radiusTop, e.radiusBottom, e.height, e.radialSegments, e.heightSegments, e.openEnded, e.thetaStart, e.thetaLength);
  }
}
class _o extends dn {
  constructor(e = [], t = [], n = 1, r = 0) {
    super(), this.type = "PolyhedronGeometry", this.parameters = {
      vertices: e,
      indices: t,
      radius: n,
      detail: r
    };
    const s = [], a = [];
    o(r), d(n), u(), this.setAttribute("position", new At(s, 3)), this.setAttribute("normal", new At(s.slice(), 3)), this.setAttribute("uv", new At(a, 2)), r === 0 ? this.computeVertexNormals() : this.normalizeNormals();
    function o(E) {
      const y = new N(), w = new N(), I = new N();
      for (let R = 0; R < t.length; R += 3)
        m(t[R + 0], y), m(t[R + 1], w), m(t[R + 2], I), l(y, w, I, E);
    }
    function l(E, y, w, I) {
      const R = I + 1, C = [];
      for (let U = 0; U <= R; U++) {
        C[U] = [];
        const A = E.clone().lerp(w, U / R), v = y.clone().lerp(w, U / R), L = R - U;
        for (let k = 0; k <= L; k++)
          k === 0 && U === R ? C[U][k] = A : C[U][k] = A.clone().lerp(v, k / L);
      }
      for (let U = 0; U < R; U++)
        for (let A = 0; A < 2 * (R - U) - 1; A++) {
          const v = Math.floor(A / 2);
          A % 2 === 0 ? (f(C[U][v + 1]), f(C[U + 1][v]), f(C[U][v])) : (f(C[U][v + 1]), f(C[U + 1][v + 1]), f(C[U + 1][v]));
        }
    }
    function d(E) {
      const y = new N();
      for (let w = 0; w < s.length; w += 3)
        y.x = s[w + 0], y.y = s[w + 1], y.z = s[w + 2], y.normalize().multiplyScalar(E), s[w + 0] = y.x, s[w + 1] = y.y, s[w + 2] = y.z;
    }
    function u() {
      const E = new N();
      for (let y = 0; y < s.length; y += 3) {
        E.x = s[y + 0], E.y = s[y + 1], E.z = s[y + 2];
        const w = c(E) / 2 / Math.PI + 0.5, I = h(E) / Math.PI + 0.5;
        a.push(w, 1 - I);
      }
      _(), p();
    }
    function p() {
      for (let E = 0; E < a.length; E += 6) {
        const y = a[E + 0], w = a[E + 2], I = a[E + 4], R = Math.max(y, w, I), C = Math.min(y, w, I);
        R > 0.9 && C < 0.1 && (y < 0.2 && (a[E + 0] += 1), w < 0.2 && (a[E + 2] += 1), I < 0.2 && (a[E + 4] += 1));
      }
    }
    function f(E) {
      s.push(E.x, E.y, E.z);
    }
    function m(E, y) {
      const w = E * 3;
      y.x = e[w + 0], y.y = e[w + 1], y.z = e[w + 2];
    }
    function _() {
      const E = new N(), y = new N(), w = new N(), I = new N(), R = new Ke(), C = new Ke(), U = new Ke();
      for (let A = 0, v = 0; A < s.length; A += 9, v += 6) {
        E.set(s[A + 0], s[A + 1], s[A + 2]), y.set(s[A + 3], s[A + 4], s[A + 5]), w.set(s[A + 6], s[A + 7], s[A + 8]), R.set(a[v + 0], a[v + 1]), C.set(a[v + 2], a[v + 3]), U.set(a[v + 4], a[v + 5]), I.copy(E).add(y).add(w).divideScalar(3);
        const L = c(I);
        x(R, v + 0, E, L), x(C, v + 2, y, L), x(U, v + 4, w, L);
      }
    }
    function x(E, y, w, I) {
      I < 0 && E.x === 1 && (a[y] = E.x - 1), w.x === 0 && w.z === 0 && (a[y] = I / 2 / Math.PI + 0.5);
    }
    function c(E) {
      return Math.atan2(E.z, -E.x);
    }
    function h(E) {
      return Math.atan2(-E.y, Math.sqrt(E.x * E.x + E.z * E.z));
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new _o(e.vertices, e.indices, e.radius, e.details);
  }
}
class fr extends _o {
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
    return new fr(e.radius, e.detail);
  }
}
class vo extends dn {
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
      const E = [], y = h / n;
      let w = 0;
      h === 0 && a === 0 ? w = 0.5 / t : h === n && l === Math.PI && (w = -0.5 / t);
      for (let I = 0; I <= t; I++) {
        const R = I / t;
        p.x = -e * Math.cos(r + R * s) * Math.sin(a + y * o), p.y = e * Math.cos(a + y * o), p.z = e * Math.sin(r + R * s) * Math.sin(a + y * o), _.push(p.x, p.y, p.z), f.copy(p).normalize(), x.push(f.x, f.y, f.z), c.push(R + w, 1 - y), E.push(d++);
      }
      u.push(E);
    }
    for (let h = 0; h < n; h++)
      for (let E = 0; E < t; E++) {
        const y = u[h][E + 1], w = u[h][E], I = u[h + 1][E], R = u[h + 1][E + 1];
        (h !== 0 || a > 0) && m.push(y, w, R), (h !== n - 1 || l < Math.PI) && m.push(w, I, R);
      }
    this.setIndex(m), this.setAttribute("position", new At(_, 3)), this.setAttribute("normal", new At(x, 3)), this.setAttribute("uv", new At(c, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new vo(e.radius, e.widthSegments, e.heightSegments, e.phiStart, e.phiLength, e.thetaStart, e.thetaLength);
  }
}
class Li extends dn {
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
        const x = (r + 1) * m + _ - 1, c = (r + 1) * (m - 1) + _ - 1, h = (r + 1) * (m - 1) + _, E = (r + 1) * m + _;
        a.push(x, c, E), a.push(c, h, E);
      }
    this.setIndex(a), this.setAttribute("position", new At(o, 3)), this.setAttribute("normal", new At(l, 3)), this.setAttribute("uv", new At(d, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new Li(e.radius, e.tube, e.radialSegments, e.tubularSegments, e.arc);
  }
}
class A_ extends Er {
  constructor(e) {
    super(), this.isMeshPhongMaterial = !0, this.type = "MeshPhongMaterial", this.color = new ft(16777215), this.specular = new ft(1118481), this.shininess = 30, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new ft(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = xd, this.normalScale = new Ke(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new En(), this.combine = uo, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.specular.copy(e.specular), this.shininess = e.shininess, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}
class kd extends Yt {
  constructor(e, t = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new ft(e), this.intensity = t;
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
const Xa = /* @__PURE__ */ new Et(), jc = /* @__PURE__ */ new N(), Kc = /* @__PURE__ */ new N();
class w_ {
  constructor(e) {
    this.camera = e, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new Ke(512, 512), this.map = null, this.mapPass = null, this.matrix = new Et(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new mo(), this._frameExtents = new Ke(1, 1), this._viewportCount = 1, this._viewports = [
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
    jc.setFromMatrixPosition(e.matrixWorld), t.position.copy(jc), Kc.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(Kc), t.updateMatrixWorld(), Xa.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Xa), n.set(
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
    ), n.multiply(Xa);
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
class R_ extends w_ {
  constructor() {
    super(new Nd(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}
class C_ extends kd {
  constructor(e, t) {
    super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(Yt.DEFAULT_UP), this.updateMatrix(), this.target = new Yt(), this.shadow = new R_();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e) {
    return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
}
class P_ extends kd {
  constructor(e, t) {
    super(e, t), this.isAmbientLight = !0, this.type = "AmbientLight";
  }
}
const $c = /* @__PURE__ */ new Et();
class L_ {
  constructor(e, t, n = 0, r = 1 / 0) {
    this.ray = new qs(e, t), this.near = n, this.far = r, this.camera = null, this.layers = new po(), this.params = {
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
    return $c.identity().extractRotation(e.matrixWorld), this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4($c), this;
  }
  intersectObject(e, t = !0, n = []) {
    return oo(e, this, n, t), n.sort(Zc), n;
  }
  intersectObjects(e, t = !0, n = []) {
    for (let r = 0, s = e.length; r < s; r++)
      oo(e[r], this, n, t);
    return n.sort(Zc), n;
  }
}
function Zc(i, e) {
  return i.distance - e.distance;
}
function oo(i, e, t, n) {
  let r = !0;
  if (i.layers.test(e.layers) && i.raycast(e, t) === !1 && (r = !1), r === !0 && n === !0) {
    const s = i.children;
    for (let a = 0, o = s.length; a < o; a++)
      oo(s[a], e, t, !0);
  }
}
class Qc {
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
    return this.radius = Math.sqrt(e * e + t * t + n * n), this.radius === 0 ? (this.theta = 0, this.phi = 0) : (this.theta = Math.atan2(e, n), this.phi = Math.acos(gn(t / this.radius, -1, 1))), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class N_ extends zd {
  constructor(e = 10, t = 10, n = 4473924, r = 8947848) {
    n = new ft(n), r = new ft(r);
    const s = t / 2, a = e / t, o = e / 2, l = [], d = [];
    for (let f = 0, m = 0, _ = -o; f <= t; f++, _ += a) {
      l.push(-o, 0, _, o, 0, _), l.push(_, 0, -o, _, 0, o);
      const x = f === s ? n : r;
      x.toArray(d, m), m += 3, x.toArray(d, m), m += 3, x.toArray(d, m), m += 3, x.toArray(d, m), m += 3;
    }
    const u = new dn();
    u.setAttribute("position", new At(l, 3)), u.setAttribute("color", new At(d, 3));
    const p = new $s({ vertexColors: !0, toneMapped: !1 });
    super(u, p), this.type = "GridHelper";
  }
  dispose() {
    this.geometry.dispose(), this.material.dispose();
  }
}
class Jc extends zd {
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
    ], r = new dn();
    r.setAttribute("position", new At(t, 3)), r.setAttribute("color", new At(n, 3));
    const s = new $s({ vertexColors: !0, toneMapped: !1 });
    super(r, s), this.type = "AxesHelper";
  }
  setColors(e, t, n) {
    const r = new ft(), s = this.geometry.attributes.color.array;
    return r.set(e), r.toArray(s, 0), r.toArray(s, 3), r.set(t), r.toArray(s, 6), r.toArray(s, 9), r.set(n), r.toArray(s, 12), r.toArray(s, 15), this.geometry.attributes.color.needsUpdate = !0, this;
  }
  dispose() {
    this.geometry.dispose(), this.material.dispose();
  }
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
  revision: ho
} }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = ho);
const ed = { type: "change" }, Ya = { type: "start" }, td = { type: "end" }, Ts = new qs(), nd = new ci(), I_ = Math.cos(70 * pu.DEG2RAD);
class D_ extends Oi {
  constructor(e, t) {
    super(), this.object = e, this.domElement = t, this.domElement.style.touchAction = "none", this.enabled = !0, this.target = new N(), this.cursor = new N(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }, this.mouseButtons = { LEFT: Wi.ROTATE, MIDDLE: Wi.DOLLY, RIGHT: Wi.PAN }, this.touches = { ONE: Xi.ROTATE, TWO: Xi.DOLLY_PAN }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this.getPolarAngle = function() {
      return o.phi;
    }, this.getAzimuthalAngle = function() {
      return o.theta;
    }, this.getDistance = function() {
      return this.object.position.distanceTo(this.target);
    }, this.listenToKeyEvents = function(g) {
      g.addEventListener("keydown", me), this._domElementKeyEvents = g;
    }, this.stopListenToKeyEvents = function() {
      this._domElementKeyEvents.removeEventListener("keydown", me), this._domElementKeyEvents = null;
    }, this.saveState = function() {
      n.target0.copy(n.target), n.position0.copy(n.object.position), n.zoom0 = n.object.zoom;
    }, this.reset = function() {
      n.target.copy(n.target0), n.object.position.copy(n.position0), n.object.zoom = n.zoom0, n.object.updateProjectionMatrix(), n.dispatchEvent(ed), n.update(), s = r.NONE;
    }, this.update = function() {
      const g = new N(), q = new qt().setFromUnitVectors(e.up, new N(0, 1, 0)), z = q.clone().invert(), $ = new N(), te = new qt(), Le = new N(), He = 2 * Math.PI;
      return function(Dt = null) {
        const dt = n.object.position;
        g.copy(dt).sub(n.target), g.applyQuaternion(q), o.setFromVector3(g), n.autoRotate && s === r.NONE && k(v(Dt)), n.enableDamping ? (o.theta += l.theta * n.dampingFactor, o.phi += l.phi * n.dampingFactor) : (o.theta += l.theta, o.phi += l.phi);
        let wt = n.minAzimuthAngle, Ot = n.maxAzimuthAngle;
        isFinite(wt) && isFinite(Ot) && (wt < -Math.PI ? wt += He : wt > Math.PI && (wt -= He), Ot < -Math.PI ? Ot += He : Ot > Math.PI && (Ot -= He), wt <= Ot ? o.theta = Math.max(wt, Math.min(Ot, o.theta)) : o.theta = o.theta > (wt + Ot) / 2 ? Math.max(wt, o.theta) : Math.min(Ot, o.theta)), o.phi = Math.max(n.minPolarAngle, Math.min(n.maxPolarAngle, o.phi)), o.makeSafe(), n.enableDamping === !0 ? n.target.addScaledVector(u, n.dampingFactor) : n.target.add(u), n.target.sub(n.cursor), n.target.clampLength(n.minTargetRadius, n.maxTargetRadius), n.target.add(n.cursor);
        let tn = !1;
        if (n.zoomToCursor && R || n.object.isOrthographicCamera)
          o.radius = ve(o.radius);
        else {
          const Gt = o.radius;
          o.radius = ve(o.radius * d), tn = Gt != o.radius;
        }
        if (g.setFromSpherical(o), g.applyQuaternion(z), dt.copy(n.target).add(g), n.object.lookAt(n.target), n.enableDamping === !0 ? (l.theta *= 1 - n.dampingFactor, l.phi *= 1 - n.dampingFactor, u.multiplyScalar(1 - n.dampingFactor)) : (l.set(0, 0, 0), u.set(0, 0, 0)), n.zoomToCursor && R) {
          let Gt = null;
          if (n.object.isPerspectiveCamera) {
            const $t = g.length();
            Gt = ve($t * d);
            const Rn = $t - Gt;
            n.object.position.addScaledVector(w, Rn), n.object.updateMatrixWorld(), tn = !!Rn;
          } else if (n.object.isOrthographicCamera) {
            const $t = new N(I.x, I.y, 0);
            $t.unproject(n.object);
            const Rn = n.object.zoom;
            n.object.zoom = Math.max(n.minZoom, Math.min(n.maxZoom, n.object.zoom / d)), n.object.updateProjectionMatrix(), tn = Rn !== n.object.zoom;
            const bn = new N(I.x, I.y, 0);
            bn.unproject(n.object), n.object.position.sub(bn).add($t), n.object.updateMatrixWorld(), Gt = g.length();
          } else
            console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), n.zoomToCursor = !1;
          Gt !== null && (this.screenSpacePanning ? n.target.set(0, 0, -1).transformDirection(n.object.matrix).multiplyScalar(Gt).add(n.object.position) : (Ts.origin.copy(n.object.position), Ts.direction.set(0, 0, -1).transformDirection(n.object.matrix), Math.abs(n.object.up.dot(Ts.direction)) < I_ ? e.lookAt(n.target) : (nd.setFromNormalAndCoplanarPoint(n.object.up, n.target), Ts.intersectPlane(nd, n.target))));
        } else if (n.object.isOrthographicCamera) {
          const Gt = n.object.zoom;
          n.object.zoom = Math.max(n.minZoom, Math.min(n.maxZoom, n.object.zoom / d)), Gt !== n.object.zoom && (n.object.updateProjectionMatrix(), tn = !0);
        }
        return d = 1, R = !1, tn || $.distanceToSquared(n.object.position) > a || 8 * (1 - te.dot(n.object.quaternion)) > a || Le.distanceToSquared(n.target) > a ? (n.dispatchEvent(ed), $.copy(n.object.position), te.copy(n.object.quaternion), Le.copy(n.target), !0) : !1;
      };
    }(), this.dispose = function() {
      n.domElement.removeEventListener("contextmenu", Ie), n.domElement.removeEventListener("pointerdown", Ct), n.domElement.removeEventListener("pointercancel", S), n.domElement.removeEventListener("wheel", ae), n.domElement.removeEventListener("pointermove", P), n.domElement.removeEventListener("pointerup", S), n.domElement.getRootNode().removeEventListener("keydown", Pe, { capture: !0 }), n._domElementKeyEvents !== null && (n._domElementKeyEvents.removeEventListener("keydown", me), n._domElementKeyEvents = null);
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
    const a = 1e-6, o = new Qc(), l = new Qc();
    let d = 1;
    const u = new N(), p = new Ke(), f = new Ke(), m = new Ke(), _ = new Ke(), x = new Ke(), c = new Ke(), h = new Ke(), E = new Ke(), y = new Ke(), w = new N(), I = new Ke();
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
        const te = n.domElement;
        if (n.object.isPerspectiveCamera) {
          const Le = n.object.position;
          g.copy(Le).sub(n.target);
          let He = g.length();
          He *= Math.tan(n.object.fov / 2 * Math.PI / 180), W(2 * z * He / te.clientHeight, n.object.matrix), Q(2 * $ * He / te.clientHeight, n.object.matrix);
        } else n.object.isOrthographicCamera ? (W(z * (n.object.right - n.object.left) / n.object.zoom / te.clientWidth, n.object.matrix), Q($ * (n.object.top - n.object.bottom) / n.object.zoom / te.clientHeight, n.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), n.enablePan = !1);
      };
    }();
    function ie(g) {
      n.object.isPerspectiveCamera || n.object.isOrthographicCamera ? d /= g : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), n.enableZoom = !1);
    }
    function K(g) {
      n.object.isPerspectiveCamera || n.object.isOrthographicCamera ? d *= g : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), n.enableZoom = !1);
    }
    function de(g, q) {
      if (!n.zoomToCursor)
        return;
      R = !0;
      const z = n.domElement.getBoundingClientRect(), $ = g - z.left, te = q - z.top, Le = z.width, He = z.height;
      I.x = $ / Le * 2 - 1, I.y = -(te / He) * 2 + 1, w.set(I.x, I.y, 1).unproject(n.object).sub(n.object.position).normalize();
    }
    function ve(g) {
      return Math.max(n.minDistance, Math.min(n.maxDistance, g));
    }
    function Ee(g) {
      p.set(g.clientX, g.clientY);
    }
    function tt(g) {
      de(g.clientX, g.clientX), h.set(g.clientX, g.clientY);
    }
    function ct(g) {
      _.set(g.clientX, g.clientY);
    }
    function J(g) {
      f.set(g.clientX, g.clientY), m.subVectors(f, p).multiplyScalar(n.rotateSpeed);
      const q = n.domElement;
      k(2 * Math.PI * m.x / q.clientHeight), V(2 * Math.PI * m.y / q.clientHeight), p.copy(f), n.update();
    }
    function oe(g) {
      E.set(g.clientX, g.clientY), y.subVectors(E, h), y.y > 0 ? ie(L(y.y)) : y.y < 0 && K(L(y.y)), h.copy(E), n.update();
    }
    function be(g) {
      x.set(g.clientX, g.clientY), c.subVectors(x, _).multiplyScalar(n.panSpeed), j(c.x, c.y), _.copy(x), n.update();
    }
    function ue(g) {
      de(g.clientX, g.clientY), g.deltaY < 0 ? K(L(g.deltaY)) : g.deltaY > 0 && ie(L(g.deltaY)), n.update();
    }
    function Je(g) {
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
    function Ve(g) {
      if (C.length === 1)
        p.set(g.pageX, g.pageY);
      else {
        const q = Ye(g), z = 0.5 * (g.pageX + q.x), $ = 0.5 * (g.pageY + q.y);
        p.set(z, $);
      }
    }
    function nt(g) {
      if (C.length === 1)
        _.set(g.pageX, g.pageY);
      else {
        const q = Ye(g), z = 0.5 * (g.pageX + q.x), $ = 0.5 * (g.pageY + q.y);
        _.set(z, $);
      }
    }
    function D(g) {
      const q = Ye(g), z = g.pageX - q.x, $ = g.pageY - q.y, te = Math.sqrt(z * z + $ * $);
      h.set(0, te);
    }
    function it(g) {
      n.enableZoom && D(g), n.enablePan && nt(g);
    }
    function rt(g) {
      n.enableZoom && D(g), n.enableRotate && Ve(g);
    }
    function yt(g) {
      if (C.length == 1)
        f.set(g.pageX, g.pageY);
      else {
        const z = Ye(g), $ = 0.5 * (g.pageX + z.x), te = 0.5 * (g.pageY + z.y);
        f.set($, te);
      }
      m.subVectors(f, p).multiplyScalar(n.rotateSpeed);
      const q = n.domElement;
      k(2 * Math.PI * m.x / q.clientHeight), V(2 * Math.PI * m.y / q.clientHeight), p.copy(f);
    }
    function Oe(g) {
      if (C.length === 1)
        x.set(g.pageX, g.pageY);
      else {
        const q = Ye(g), z = 0.5 * (g.pageX + q.x), $ = 0.5 * (g.pageY + q.y);
        x.set(z, $);
      }
      c.subVectors(x, _).multiplyScalar(n.panSpeed), j(c.x, c.y), _.copy(x);
    }
    function $e(g) {
      const q = Ye(g), z = g.pageX - q.x, $ = g.pageY - q.y, te = Math.sqrt(z * z + $ * $);
      E.set(0, te), y.set(0, Math.pow(E.y / h.y, n.zoomSpeed)), ie(y.y), h.copy(E);
      const Le = (g.pageX + q.x) * 0.5, He = (g.pageY + q.y) * 0.5;
      de(Le, He);
    }
    function et(g) {
      n.enableZoom && $e(g), n.enablePan && Oe(g);
    }
    function Ze(g) {
      n.enableZoom && $e(g), n.enableRotate && yt(g);
    }
    function Ct(g) {
      n.enabled !== !1 && (C.length === 0 && (n.domElement.setPointerCapture(g.pointerId), n.domElement.addEventListener("pointermove", P), n.domElement.addEventListener("pointerup", S)), !xe(g) && (st(g), g.pointerType === "touch" ? Qe(g) : Y(g)));
    }
    function P(g) {
      n.enabled !== !1 && (g.pointerType === "touch" ? ce(g) : re(g));
    }
    function S(g) {
      switch (Fe(g), C.length) {
        case 0:
          n.domElement.releasePointerCapture(g.pointerId), n.domElement.removeEventListener("pointermove", P), n.domElement.removeEventListener("pointerup", S), n.dispatchEvent(td), s = r.NONE;
          break;
        case 1:
          const q = C[0], z = U[q];
          Qe({ pointerId: q, pageX: z.x, pageY: z.y });
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
        case Wi.DOLLY:
          if (n.enableZoom === !1) return;
          tt(g), s = r.DOLLY;
          break;
        case Wi.ROTATE:
          if (g.ctrlKey || g.metaKey || g.shiftKey) {
            if (n.enablePan === !1) return;
            ct(g), s = r.PAN;
          } else {
            if (n.enableRotate === !1) return;
            Ee(g), s = r.ROTATE;
          }
          break;
        case Wi.PAN:
          if (g.ctrlKey || g.metaKey || g.shiftKey) {
            if (n.enableRotate === !1) return;
            Ee(g), s = r.ROTATE;
          } else {
            if (n.enablePan === !1) return;
            ct(g), s = r.PAN;
          }
          break;
        default:
          s = r.NONE;
      }
      s !== r.NONE && n.dispatchEvent(Ya);
    }
    function re(g) {
      switch (s) {
        case r.ROTATE:
          if (n.enableRotate === !1) return;
          J(g);
          break;
        case r.DOLLY:
          if (n.enableZoom === !1) return;
          oe(g);
          break;
        case r.PAN:
          if (n.enablePan === !1) return;
          be(g);
          break;
      }
    }
    function ae(g) {
      n.enabled === !1 || n.enableZoom === !1 || s !== r.NONE || (g.preventDefault(), n.dispatchEvent(Ya), ue(ne(g)), n.dispatchEvent(td));
    }
    function ne(g) {
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
    function Pe(g) {
      g.key === "Control" && (A = !0, n.domElement.getRootNode().addEventListener("keyup", pe, { passive: !0, capture: !0 }));
    }
    function pe(g) {
      g.key === "Control" && (A = !1, n.domElement.getRootNode().removeEventListener("keyup", pe, { passive: !0, capture: !0 }));
    }
    function me(g) {
      n.enabled === !1 || n.enablePan === !1 || Je(g);
    }
    function Qe(g) {
      switch (qe(g), C.length) {
        case 1:
          switch (n.touches.ONE) {
            case Xi.ROTATE:
              if (n.enableRotate === !1) return;
              Ve(g), s = r.TOUCH_ROTATE;
              break;
            case Xi.PAN:
              if (n.enablePan === !1) return;
              nt(g), s = r.TOUCH_PAN;
              break;
            default:
              s = r.NONE;
          }
          break;
        case 2:
          switch (n.touches.TWO) {
            case Xi.DOLLY_PAN:
              if (n.enableZoom === !1 && n.enablePan === !1) return;
              it(g), s = r.TOUCH_DOLLY_PAN;
              break;
            case Xi.DOLLY_ROTATE:
              if (n.enableZoom === !1 && n.enableRotate === !1) return;
              rt(g), s = r.TOUCH_DOLLY_ROTATE;
              break;
            default:
              s = r.NONE;
          }
          break;
        default:
          s = r.NONE;
      }
      s !== r.NONE && n.dispatchEvent(Ya);
    }
    function ce(g) {
      switch (qe(g), s) {
        case r.TOUCH_ROTATE:
          if (n.enableRotate === !1) return;
          yt(g), n.update();
          break;
        case r.TOUCH_PAN:
          if (n.enablePan === !1) return;
          Oe(g), n.update();
          break;
        case r.TOUCH_DOLLY_PAN:
          if (n.enableZoom === !1 && n.enablePan === !1) return;
          et(g), n.update();
          break;
        case r.TOUCH_DOLLY_ROTATE:
          if (n.enableZoom === !1 && n.enableRotate === !1) return;
          Ze(g), n.update();
          break;
        default:
          s = r.NONE;
      }
    }
    function Ie(g) {
      n.enabled !== !1 && g.preventDefault();
    }
    function st(g) {
      C.push(g.pointerId);
    }
    function Fe(g) {
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
    function qe(g) {
      let q = U[g.pointerId];
      q === void 0 && (q = new Ke(), U[g.pointerId] = q), q.set(g.pageX, g.pageY);
    }
    function Ye(g) {
      const q = g.pointerId === C[0] ? C[1] : C[0];
      return U[q];
    }
    n.domElement.addEventListener("contextmenu", Ie), n.domElement.addEventListener("pointerdown", Ct), n.domElement.addEventListener("pointercancel", S), n.domElement.addEventListener("wheel", ae, { passive: !1 }), n.domElement.getRootNode().addEventListener("keydown", Pe, { passive: !0, capture: !0 }), this.update();
  }
}
const Ai = new L_(), cn = new N(), li = new N(), Ut = new qt(), id = {
  X: new N(1, 0, 0),
  Y: new N(0, 1, 0),
  Z: new N(0, 0, 1)
}, qa = { type: "change" }, rd = { type: "mouseDown", mode: null }, sd = { type: "mouseUp", mode: null }, ad = { type: "objectChange" };
class U_ extends Yt {
  constructor(e, t) {
    super(), t === void 0 && (console.warn('THREE.TransformControls: The second parameter "domElement" is now mandatory.'), t = document), this.isTransformControls = !0, this.visible = !1, this.domElement = t, this.domElement.style.touchAction = "none";
    const n = new V_();
    this._gizmo = n, this.add(n);
    const r = new H_();
    this._plane = r, this.add(r);
    const s = this;
    function a(E, y) {
      let w = y;
      Object.defineProperty(s, E, {
        get: function() {
          return w !== void 0 ? w : y;
        },
        set: function(I) {
          w !== I && (w = I, r[E] = I, n[E] = I, s.dispatchEvent({ type: E + "-changed", value: I }), s.dispatchEvent(qa));
        }
      }), s[E] = y, r[E] = y, n[E] = y;
    }
    a("camera", e), a("object", void 0), a("enabled", !0), a("axis", null), a("mode", "translate"), a("translationSnap", null), a("rotationSnap", null), a("scaleSnap", null), a("space", "world"), a("size", 1), a("dragging", !1), a("showX", !0), a("showY", !0), a("showZ", !0);
    const o = new N(), l = new N(), d = new qt(), u = new qt(), p = new N(), f = new qt(), m = new N(), _ = new N(), x = new N(), c = 0, h = new N();
    a("worldPosition", o), a("worldPositionStart", l), a("worldQuaternion", d), a("worldQuaternionStart", u), a("cameraPosition", p), a("cameraQuaternion", f), a("pointStart", m), a("pointEnd", _), a("rotationAxis", x), a("rotationAngle", c), a("eye", h), this._offset = new N(), this._startNorm = new N(), this._endNorm = new N(), this._cameraScale = new N(), this._parentPosition = new N(), this._parentQuaternion = new qt(), this._parentQuaternionInv = new qt(), this._parentScale = new N(), this._worldScaleStart = new N(), this._worldQuaternionInv = new qt(), this._worldScale = new N(), this._positionStart = new N(), this._quaternionStart = new qt(), this._scaleStart = new N(), this._getPointer = O_.bind(this), this._onPointerDown = B_.bind(this), this._onPointerHover = F_.bind(this), this._onPointerMove = z_.bind(this), this._onPointerUp = k_.bind(this), this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointermove", this._onPointerHover), this.domElement.addEventListener("pointerup", this._onPointerUp);
  }
  // updateMatrixWorld updates key transformation variables
  updateMatrixWorld(e) {
    this.object !== void 0 && (this.object.updateMatrixWorld(), this.object.parent === null ? console.error("TransformControls: The attached 3D object must be a part of the scene graph.") : this.object.parent.matrixWorld.decompose(this._parentPosition, this._parentQuaternion, this._parentScale), this.object.matrixWorld.decompose(this.worldPosition, this.worldQuaternion, this._worldScale), this._parentQuaternionInv.copy(this._parentQuaternion).invert(), this._worldQuaternionInv.copy(this.worldQuaternion).invert()), this.camera.updateMatrixWorld(), this.camera.matrixWorld.decompose(this.cameraPosition, this.cameraQuaternion, this._cameraScale), this.camera.isOrthographicCamera ? this.camera.getWorldDirection(this.eye).negate() : this.eye.copy(this.cameraPosition).sub(this.worldPosition).normalize(), super.updateMatrixWorld(e);
  }
  pointerHover(e) {
    if (this.object === void 0 || this.dragging === !0) return;
    e !== null && Ai.setFromCamera(e, this.camera);
    const t = ja(this._gizmo.picker[this.mode], Ai);
    t ? this.axis = t.object.name : this.axis = null;
  }
  pointerDown(e) {
    if (!(this.object === void 0 || this.dragging === !0 || e != null && e.button !== 0) && this.axis !== null) {
      e !== null && Ai.setFromCamera(e, this.camera);
      const t = ja(this._plane, Ai, !0);
      t && (this.object.updateMatrixWorld(), this.object.parent.updateMatrixWorld(), this._positionStart.copy(this.object.position), this._quaternionStart.copy(this.object.quaternion), this._scaleStart.copy(this.object.scale), this.object.matrixWorld.decompose(this.worldPositionStart, this.worldQuaternionStart, this._worldScaleStart), this.pointStart.copy(t.point).sub(this.worldPositionStart)), this.dragging = !0, rd.mode = this.mode, this.dispatchEvent(rd);
    }
  }
  pointerMove(e) {
    const t = this.axis, n = this.mode, r = this.object;
    let s = this.space;
    if (n === "scale" ? s = "local" : (t === "E" || t === "XYZE" || t === "XYZ") && (s = "world"), r === void 0 || t === null || this.dragging === !1 || e !== null && e.button !== -1) return;
    e !== null && Ai.setFromCamera(e, this.camera);
    const a = ja(this._plane, Ai, !0);
    if (a) {
      if (this.pointEnd.copy(a.point).sub(this.worldPositionStart), n === "translate")
        this._offset.copy(this.pointEnd).sub(this.pointStart), s === "local" && t !== "XYZ" && this._offset.applyQuaternion(this._worldQuaternionInv), t.indexOf("X") === -1 && (this._offset.x = 0), t.indexOf("Y") === -1 && (this._offset.y = 0), t.indexOf("Z") === -1 && (this._offset.z = 0), s === "local" && t !== "XYZ" ? this._offset.applyQuaternion(this._quaternionStart).divide(this._parentScale) : this._offset.applyQuaternion(this._parentQuaternionInv).divide(this._parentScale), r.position.copy(this._offset).add(this._positionStart), this.translationSnap && (s === "local" && (r.position.applyQuaternion(Ut.copy(this._quaternionStart).invert()), t.search("X") !== -1 && (r.position.x = Math.round(r.position.x / this.translationSnap) * this.translationSnap), t.search("Y") !== -1 && (r.position.y = Math.round(r.position.y / this.translationSnap) * this.translationSnap), t.search("Z") !== -1 && (r.position.z = Math.round(r.position.z / this.translationSnap) * this.translationSnap), r.position.applyQuaternion(this._quaternionStart)), s === "world" && (r.parent && r.position.add(cn.setFromMatrixPosition(r.parent.matrixWorld)), t.search("X") !== -1 && (r.position.x = Math.round(r.position.x / this.translationSnap) * this.translationSnap), t.search("Y") !== -1 && (r.position.y = Math.round(r.position.y / this.translationSnap) * this.translationSnap), t.search("Z") !== -1 && (r.position.z = Math.round(r.position.z / this.translationSnap) * this.translationSnap), r.parent && r.position.sub(cn.setFromMatrixPosition(r.parent.matrixWorld))));
      else if (n === "scale") {
        if (t.search("XYZ") !== -1) {
          let o = this.pointEnd.length() / this.pointStart.length();
          this.pointEnd.dot(this.pointStart) < 0 && (o *= -1), li.set(o, o, o);
        } else
          cn.copy(this.pointStart), li.copy(this.pointEnd), cn.applyQuaternion(this._worldQuaternionInv), li.applyQuaternion(this._worldQuaternionInv), li.divide(cn), t.search("X") === -1 && (li.x = 1), t.search("Y") === -1 && (li.y = 1), t.search("Z") === -1 && (li.z = 1);
        r.scale.copy(this._scaleStart).multiply(li), this.scaleSnap && (t.search("X") !== -1 && (r.scale.x = Math.round(r.scale.x / this.scaleSnap) * this.scaleSnap || this.scaleSnap), t.search("Y") !== -1 && (r.scale.y = Math.round(r.scale.y / this.scaleSnap) * this.scaleSnap || this.scaleSnap), t.search("Z") !== -1 && (r.scale.z = Math.round(r.scale.z / this.scaleSnap) * this.scaleSnap || this.scaleSnap));
      } else if (n === "rotate") {
        this._offset.copy(this.pointEnd).sub(this.pointStart);
        const o = 20 / this.worldPosition.distanceTo(cn.setFromMatrixPosition(this.camera.matrixWorld));
        let l = !1;
        t === "XYZE" ? (this.rotationAxis.copy(this._offset).cross(this.eye).normalize(), this.rotationAngle = this._offset.dot(cn.copy(this.rotationAxis).cross(this.eye)) * o) : (t === "X" || t === "Y" || t === "Z") && (this.rotationAxis.copy(id[t]), cn.copy(id[t]), s === "local" && cn.applyQuaternion(this.worldQuaternion), cn.cross(this.eye), cn.length() === 0 ? l = !0 : this.rotationAngle = this._offset.dot(cn.normalize()) * o), (t === "E" || l) && (this.rotationAxis.copy(this.eye), this.rotationAngle = this.pointEnd.angleTo(this.pointStart), this._startNorm.copy(this.pointStart).normalize(), this._endNorm.copy(this.pointEnd).normalize(), this.rotationAngle *= this._endNorm.cross(this._startNorm).dot(this.eye) < 0 ? 1 : -1), this.rotationSnap && (this.rotationAngle = Math.round(this.rotationAngle / this.rotationSnap) * this.rotationSnap), s === "local" && t !== "E" && t !== "XYZE" ? (r.quaternion.copy(this._quaternionStart), r.quaternion.multiply(Ut.setFromAxisAngle(this.rotationAxis, this.rotationAngle)).normalize()) : (this.rotationAxis.applyQuaternion(this._parentQuaternionInv), r.quaternion.copy(Ut.setFromAxisAngle(this.rotationAxis, this.rotationAngle)), r.quaternion.multiply(this._quaternionStart).normalize());
      }
      this.dispatchEvent(qa), this.dispatchEvent(ad);
    }
  }
  pointerUp(e) {
    e !== null && e.button !== 0 || (this.dragging && this.axis !== null && (sd.mode = this.mode, this.dispatchEvent(sd)), this.dragging = !1, this.axis = null);
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
    this.enabled && this.dragging && (this.object.position.copy(this._positionStart), this.object.quaternion.copy(this._quaternionStart), this.object.scale.copy(this._scaleStart), this.dispatchEvent(qa), this.dispatchEvent(ad), this.pointStart.copy(this.pointEnd));
  }
  getRaycaster() {
    return Ai;
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
function O_(i) {
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
function F_(i) {
  if (this.enabled)
    switch (i.pointerType) {
      case "mouse":
      case "pen":
        this.pointerHover(this._getPointer(i));
        break;
    }
}
function B_(i) {
  this.enabled && (document.pointerLockElement || this.domElement.setPointerCapture(i.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.pointerHover(this._getPointer(i)), this.pointerDown(this._getPointer(i)));
}
function z_(i) {
  this.enabled && this.pointerMove(this._getPointer(i));
}
function k_(i) {
  this.enabled && (this.domElement.releasePointerCapture(i.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.pointerUp(this._getPointer(i)));
}
function ja(i, e, t) {
  const n = e.intersectObject(i, !0);
  for (let r = 0; r < n.length; r++)
    if (n[r].object.visible || t)
      return n[r];
  return !1;
}
const As = new En(), Tt = new N(0, 1, 0), od = new N(0, 0, 0), ld = new Et(), ws = new qt(), Is = new qt(), Fn = new N(), cd = new Et(), Gr = new N(1, 0, 0), Ri = new N(0, 1, 0), Wr = new N(0, 0, 1), Rs = new N(), Br = new N(), zr = new N();
class V_ extends Yt {
  constructor() {
    super(), this.isTransformControlsGizmo = !0, this.type = "TransformControlsGizmo";
    const e = new js({
      depthTest: !1,
      depthWrite: !1,
      fog: !1,
      toneMapped: !1,
      transparent: !0
    }), t = new $s({
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
    const x = new ln(0, 0.04, 0.1, 12);
    x.translate(0, 0.05, 0);
    const c = new Ht(0.08, 0.08, 0.08);
    c.translate(0, 0.04, 0);
    const h = new dn();
    h.setAttribute("position", new At([0, 0, 0, 1, 0, 0], 3));
    const E = new ln(75e-4, 75e-4, 0.5, 3);
    E.translate(0, 0.25, 0);
    function y(Q, j) {
      const ie = new Li(Q, 75e-4, 3, 64, j * Math.PI * 2);
      return ie.rotateY(Math.PI / 2), ie.rotateX(Math.PI / 2), ie;
    }
    function w() {
      const Q = new dn();
      return Q.setAttribute("position", new At([0, 0, 0, 1, 1, 1], 3)), Q;
    }
    const I = {
      X: [
        [new Te(x, s), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
        [new Te(x, s), [-0.5, 0, 0], [0, 0, Math.PI / 2]],
        [new Te(E, s), [0, 0, 0], [0, 0, -Math.PI / 2]]
      ],
      Y: [
        [new Te(x, a), [0, 0.5, 0]],
        [new Te(x, a), [0, -0.5, 0], [Math.PI, 0, 0]],
        [new Te(E, a)]
      ],
      Z: [
        [new Te(x, o), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new Te(x, o), [0, 0, -0.5], [-Math.PI / 2, 0, 0]],
        [new Te(E, o), null, [Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new Te(new fr(0.1, 0), p.clone()), [0, 0, 0]]
      ],
      XY: [
        [new Te(new Ht(0.15, 0.15, 0.01), u.clone()), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new Te(new Ht(0.15, 0.15, 0.01), l.clone()), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new Te(new Ht(0.15, 0.15, 0.01), d.clone()), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ]
    }, R = {
      X: [
        [new Te(new ln(0.2, 0, 0.6, 4), n), [0.3, 0, 0], [0, 0, -Math.PI / 2]],
        [new Te(new ln(0.2, 0, 0.6, 4), n), [-0.3, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new Te(new ln(0.2, 0, 0.6, 4), n), [0, 0.3, 0]],
        [new Te(new ln(0.2, 0, 0.6, 4), n), [0, -0.3, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new Te(new ln(0.2, 0, 0.6, 4), n), [0, 0, 0.3], [Math.PI / 2, 0, 0]],
        [new Te(new ln(0.2, 0, 0.6, 4), n), [0, 0, -0.3], [-Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new Te(new fr(0.2, 0), n)]
      ],
      XY: [
        [new Te(new Ht(0.2, 0.2, 0.01), n), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new Te(new Ht(0.2, 0.2, 0.01), n), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new Te(new Ht(0.2, 0.2, 0.01), n), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ]
    }, C = {
      START: [
        [new Te(new fr(0.01, 2), r), null, null, null, "helper"]
      ],
      END: [
        [new Te(new fr(0.01, 2), r), null, null, null, "helper"]
      ],
      DELTA: [
        [new Jn(w(), r), null, null, null, "helper"]
      ],
      X: [
        [new Jn(h, r.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ],
      Y: [
        [new Jn(h, r.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], "helper"]
      ],
      Z: [
        [new Jn(h, r.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], "helper"]
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
        [new Jn(h, r.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ]
    }, v = {
      XYZE: [
        [new Te(new vo(0.25, 10, 8), n)]
      ],
      X: [
        [new Te(new Li(0.5, 0.1, 4, 24), n), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]]
      ],
      Y: [
        [new Te(new Li(0.5, 0.1, 4, 24), n), [0, 0, 0], [Math.PI / 2, 0, 0]]
      ],
      Z: [
        [new Te(new Li(0.5, 0.1, 4, 24), n), [0, 0, 0], [0, 0, -Math.PI / 2]]
      ],
      E: [
        [new Te(new Li(0.75, 0.1, 2, 24), n)]
      ]
    }, L = {
      X: [
        [new Te(c, s), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
        [new Te(E, s), [0, 0, 0], [0, 0, -Math.PI / 2]],
        [new Te(c, s), [-0.5, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new Te(c, a), [0, 0.5, 0]],
        [new Te(E, a)],
        [new Te(c, a), [0, -0.5, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new Te(c, o), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new Te(E, o), [0, 0, 0], [Math.PI / 2, 0, 0]],
        [new Te(c, o), [0, 0, -0.5], [-Math.PI / 2, 0, 0]]
      ],
      XY: [
        [new Te(new Ht(0.15, 0.15, 0.01), u), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new Te(new Ht(0.15, 0.15, 0.01), l), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new Te(new Ht(0.15, 0.15, 0.01), d), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new Te(new Ht(0.1, 0.1, 0.1), p.clone())]
      ]
    }, k = {
      X: [
        [new Te(new ln(0.2, 0, 0.6, 4), n), [0.3, 0, 0], [0, 0, -Math.PI / 2]],
        [new Te(new ln(0.2, 0, 0.6, 4), n), [-0.3, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new Te(new ln(0.2, 0, 0.6, 4), n), [0, 0.3, 0]],
        [new Te(new ln(0.2, 0, 0.6, 4), n), [0, -0.3, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new Te(new ln(0.2, 0, 0.6, 4), n), [0, 0, 0.3], [Math.PI / 2, 0, 0]],
        [new Te(new ln(0.2, 0, 0.6, 4), n), [0, 0, -0.3], [-Math.PI / 2, 0, 0]]
      ],
      XY: [
        [new Te(new Ht(0.2, 0.2, 0.01), n), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new Te(new Ht(0.2, 0.2, 0.01), n), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new Te(new Ht(0.2, 0.2, 0.01), n), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new Te(new Ht(0.2, 0.2, 0.2), n), [0, 0, 0]]
      ]
    }, V = {
      X: [
        [new Jn(h, r.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ],
      Y: [
        [new Jn(h, r.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], "helper"]
      ],
      Z: [
        [new Jn(h, r.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], "helper"]
      ]
    };
    function W(Q) {
      const j = new Yt();
      for (const ie in Q)
        for (let K = Q[ie].length; K--; ) {
          const de = Q[ie][K][0].clone(), ve = Q[ie][K][1], Ee = Q[ie][K][2], tt = Q[ie][K][3], ct = Q[ie][K][4];
          de.name = ie, de.tag = ct, ve && de.position.set(ve[0], ve[1], ve[2]), Ee && de.rotation.set(Ee[0], Ee[1], Ee[2]), tt && de.scale.set(tt[0], tt[1], tt[2]), de.updateMatrix();
          const J = de.geometry.clone();
          J.applyMatrix4(de.matrix), de.geometry = J, de.renderOrder = 1 / 0, de.position.set(0, 0, 0), de.rotation.set(0, 0, 0), de.scale.set(1, 1, 1), j.add(de);
        }
      return j;
    }
    this.gizmo = {}, this.picker = {}, this.helper = {}, this.add(this.gizmo.translate = W(I)), this.add(this.gizmo.rotate = W(U)), this.add(this.gizmo.scale = W(L)), this.add(this.picker.translate = W(R)), this.add(this.picker.rotate = W(v)), this.add(this.picker.scale = W(k)), this.add(this.helper.translate = W(C)), this.add(this.helper.rotate = W(A)), this.add(this.helper.scale = W(V)), this.picker.translate.visible = !1, this.picker.rotate.visible = !1, this.picker.scale.visible = !1;
  }
  // updateMatrixWorld will update transformations and appearance of individual handles
  updateMatrixWorld(e) {
    const n = (this.mode === "scale" ? "local" : this.space) === "local" ? this.worldQuaternion : Is;
    this.gizmo.translate.visible = this.mode === "translate", this.gizmo.rotate.visible = this.mode === "rotate", this.gizmo.scale.visible = this.mode === "scale", this.helper.translate.visible = this.mode === "translate", this.helper.rotate.visible = this.mode === "rotate", this.helper.scale.visible = this.mode === "scale";
    let r = [];
    r = r.concat(this.picker[this.mode].children), r = r.concat(this.gizmo[this.mode].children), r = r.concat(this.helper[this.mode].children);
    for (let s = 0; s < r.length; s++) {
      const a = r[s];
      a.visible = !0, a.rotation.set(0, 0, 0), a.position.copy(this.worldPosition);
      let o;
      if (this.camera.isOrthographicCamera ? o = (this.camera.top - this.camera.bottom) / this.camera.zoom : o = this.worldPosition.distanceTo(this.cameraPosition) * Math.min(1.9 * Math.tan(Math.PI * this.camera.fov / 360) / this.camera.zoom, 7), a.scale.set(1, 1, 1).multiplyScalar(o * this.size / 4), a.tag === "helper") {
        a.visible = !1, a.name === "AXIS" ? (a.visible = !!this.axis, this.axis === "X" && (Ut.setFromEuler(As.set(0, 0, 0)), a.quaternion.copy(n).multiply(Ut), Math.abs(Tt.copy(Gr).applyQuaternion(n).dot(this.eye)) > 0.9 && (a.visible = !1)), this.axis === "Y" && (Ut.setFromEuler(As.set(0, 0, Math.PI / 2)), a.quaternion.copy(n).multiply(Ut), Math.abs(Tt.copy(Ri).applyQuaternion(n).dot(this.eye)) > 0.9 && (a.visible = !1)), this.axis === "Z" && (Ut.setFromEuler(As.set(0, Math.PI / 2, 0)), a.quaternion.copy(n).multiply(Ut), Math.abs(Tt.copy(Wr).applyQuaternion(n).dot(this.eye)) > 0.9 && (a.visible = !1)), this.axis === "XYZE" && (Ut.setFromEuler(As.set(0, Math.PI / 2, 0)), Tt.copy(this.rotationAxis), a.quaternion.setFromRotationMatrix(ld.lookAt(od, Tt, Ri)), a.quaternion.multiply(Ut), a.visible = this.dragging), this.axis === "E" && (a.visible = !1)) : a.name === "START" ? (a.position.copy(this.worldPositionStart), a.visible = this.dragging) : a.name === "END" ? (a.position.copy(this.worldPosition), a.visible = this.dragging) : a.name === "DELTA" ? (a.position.copy(this.worldPositionStart), a.quaternion.copy(this.worldQuaternionStart), cn.set(1e-10, 1e-10, 1e-10).add(this.worldPositionStart).sub(this.worldPosition).multiplyScalar(-1), cn.applyQuaternion(this.worldQuaternionStart.clone().invert()), a.scale.copy(cn), a.visible = this.dragging) : (a.quaternion.copy(n), this.dragging ? a.position.copy(this.worldPositionStart) : a.position.copy(this.worldPosition), this.axis && (a.visible = this.axis.search(a.name) !== -1));
        continue;
      }
      a.quaternion.copy(n), this.mode === "translate" || this.mode === "scale" ? (a.name === "X" && Math.abs(Tt.copy(Gr).applyQuaternion(n).dot(this.eye)) > 0.99 && (a.scale.set(1e-10, 1e-10, 1e-10), a.visible = !1), a.name === "Y" && Math.abs(Tt.copy(Ri).applyQuaternion(n).dot(this.eye)) > 0.99 && (a.scale.set(1e-10, 1e-10, 1e-10), a.visible = !1), a.name === "Z" && Math.abs(Tt.copy(Wr).applyQuaternion(n).dot(this.eye)) > 0.99 && (a.scale.set(1e-10, 1e-10, 1e-10), a.visible = !1), a.name === "XY" && Math.abs(Tt.copy(Wr).applyQuaternion(n).dot(this.eye)) < 0.2 && (a.scale.set(1e-10, 1e-10, 1e-10), a.visible = !1), a.name === "YZ" && Math.abs(Tt.copy(Gr).applyQuaternion(n).dot(this.eye)) < 0.2 && (a.scale.set(1e-10, 1e-10, 1e-10), a.visible = !1), a.name === "XZ" && Math.abs(Tt.copy(Ri).applyQuaternion(n).dot(this.eye)) < 0.2 && (a.scale.set(1e-10, 1e-10, 1e-10), a.visible = !1)) : this.mode === "rotate" && (ws.copy(n), Tt.copy(this.eye).applyQuaternion(Ut.copy(n).invert()), a.name.search("E") !== -1 && a.quaternion.setFromRotationMatrix(ld.lookAt(this.eye, od, Ri)), a.name === "X" && (Ut.setFromAxisAngle(Gr, Math.atan2(-Tt.y, Tt.z)), Ut.multiplyQuaternions(ws, Ut), a.quaternion.copy(Ut)), a.name === "Y" && (Ut.setFromAxisAngle(Ri, Math.atan2(Tt.x, Tt.z)), Ut.multiplyQuaternions(ws, Ut), a.quaternion.copy(Ut)), a.name === "Z" && (Ut.setFromAxisAngle(Wr, Math.atan2(Tt.y, Tt.x)), Ut.multiplyQuaternions(ws, Ut), a.quaternion.copy(Ut))), a.visible = a.visible && (a.name.indexOf("X") === -1 || this.showX), a.visible = a.visible && (a.name.indexOf("Y") === -1 || this.showY), a.visible = a.visible && (a.name.indexOf("Z") === -1 || this.showZ), a.visible = a.visible && (a.name.indexOf("E") === -1 || this.showX && this.showY && this.showZ), a.material._color = a.material._color || a.material.color.clone(), a.material._opacity = a.material._opacity || a.material.opacity, a.material.color.copy(a.material._color), a.material.opacity = a.material._opacity, this.enabled && this.axis && (a.name === this.axis || this.axis.split("").some(function(l) {
        return a.name === l;
      })) && (a.material.color.setHex(16776960), a.material.opacity = 1);
    }
    super.updateMatrixWorld(e);
  }
}
class H_ extends Te {
  constructor() {
    super(
      new jr(1e5, 1e5, 2, 2),
      new js({ visible: !1, wireframe: !0, side: kn, transparent: !0, opacity: 0.1, toneMapped: !1 })
    ), this.isTransformControlsPlane = !0, this.type = "TransformControlsPlane";
  }
  updateMatrixWorld(e) {
    let t = this.space;
    switch (this.position.copy(this.worldPosition), this.mode === "scale" && (t = "local"), Rs.copy(Gr).applyQuaternion(t === "local" ? this.worldQuaternion : Is), Br.copy(Ri).applyQuaternion(t === "local" ? this.worldQuaternion : Is), zr.copy(Wr).applyQuaternion(t === "local" ? this.worldQuaternion : Is), Tt.copy(Br), this.mode) {
      case "translate":
      case "scale":
        switch (this.axis) {
          case "X":
            Tt.copy(this.eye).cross(Rs), Fn.copy(Rs).cross(Tt);
            break;
          case "Y":
            Tt.copy(this.eye).cross(Br), Fn.copy(Br).cross(Tt);
            break;
          case "Z":
            Tt.copy(this.eye).cross(zr), Fn.copy(zr).cross(Tt);
            break;
          case "XY":
            Fn.copy(zr);
            break;
          case "YZ":
            Fn.copy(Rs);
            break;
          case "XZ":
            Tt.copy(zr), Fn.copy(Br);
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
    Fn.length() === 0 ? this.quaternion.copy(this.cameraQuaternion) : (cd.lookAt(cn.set(0, 0, 0), Fn, Tt), this.quaternion.setFromRotationMatrix(cd)), super.updateMatrixWorld(e);
  }
}
const dd = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], Ka = Math.PI / 180, $a = 180 / Math.PI;
function Za(i) {
  if (i == null) return null;
  const e = String(i).split(",").map(Number);
  return e.length === 16 && !e.some(isNaN) ? e : null;
}
function lo(i) {
  const e = new Et();
  return e.set(i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7], i[8], i[9], i[10], i[11], i[12], i[13], i[14], i[15]), e;
}
function Vd(i) {
  const e = i.elements;
  return [e[0], e[4], e[8], e[12], e[1], e[5], e[9], e[13], e[2], e[6], e[10], e[14], e[3], e[7], e[11], e[15]];
}
function kr(i) {
  const e = new N(), t = new qt(), n = new N();
  lo(i).decompose(e, t, n);
  const r = new En().setFromQuaternion(t, "XYZ");
  return { tx: e.x, ty: e.y, tz: e.z, rx: r.x * $a, ry: r.y * $a, rz: r.z * $a };
}
function G_(i) {
  return Vd(new Et().compose(
    new N(i.tx, i.ty, i.tz),
    new qt().setFromEuler(new En(i.rx * Ka, i.ry * Ka, i.rz * Ka, "XYZ")),
    new N(1, 1, 1)
  ));
}
function W_(i) {
  return Vd(new Et().compose(i.position, i.quaternion, new N(1, 1, 1)));
}
function cr(i) {
  return Math.abs(i) < 1e-9 ? "0" : String(parseFloat(i.toPrecision(7)));
}
function Cs(i) {
  return { tx: cr(i.tx), ty: cr(i.ty), tz: cr(i.tz), rx: cr(i.rx), ry: cr(i.ry), rz: cr(i.rz) };
}
function X_({ matRef: i, readOnly: e, onMatChange: t, tcMode: n }) {
  const r = Mn(null), s = Mn(t), a = Mn(null);
  return Rt(() => {
    s.current = t;
  }), Rt(() => {
    var o;
    (o = a.current) == null || o.setMode(n);
  }, [n]), Rt(() => {
    const o = r.current;
    if (!o) return;
    const l = 256, d = 200, u = new b_({ canvas: o, antialias: !0 });
    u.setPixelRatio(Math.min(window.devicePixelRatio, 2)), u.setSize(l, d, !1), u.setClearColor(1315870);
    const p = new T_(), f = new An(45, l / d, 1e-3, 1e5);
    f.position.set(3, 2.5, 4), f.lookAt(0, 0, 0), p.add(new N_(6, 6, 3816026, 2763330)), p.add(new Jc(1.5)), p.add(new P_(16777215, 0.7));
    const m = new C_(16777215, 0.6);
    m.position.set(5, 8, 5), p.add(m);
    const _ = new Hr();
    _.add(new Te(
      new Ht(0.22, 0.36, 0.16),
      new A_({ color: 3381759, transparent: !0, opacity: 0.8 })
    )), _.add(new Jc(0.7)), p.add(_), lo(i.current).decompose(_.position, _.quaternion, _.scale), _.updateMatrixWorld(!0);
    const x = new D_(f, o);
    x.enableDamping = !0, x.dampingFactor = 0.1;
    let c = null, h = !1;
    e || (c = new U_(f, o), c.attach(_), c.setMode(n), p.add(c), a.current = c, c.addEventListener("dragging-changed", (I) => {
      x.enabled = !I.value, h = I.value, I.value || (E = i.current);
    }), c.addEventListener("change", () => {
      var R;
      const I = W_(_);
      i.current = I, (R = s.current) == null || R.call(s, I);
    }));
    let E = i.current, y;
    const w = () => {
      y = requestAnimationFrame(w), !h && i.current !== E && (E = i.current, lo(E).decompose(_.position, _.quaternion, _.scale), _.updateMatrixWorld(!0)), x.update(), u.render(p, f);
    };
    return w(), () => {
      cancelAnimationFrame(y), x.dispose(), c == null || c.dispose(), u.forceContextLoss(), u.dispose(), a.current = null;
    };
  }, []), /* @__PURE__ */ b(
    "canvas",
    {
      ref: r,
      width: 256,
      height: 200,
      style: { borderRadius: 4, display: "block", width: 256, height: 200 }
    }
  );
}
function Qa({ value: i, onChange: e, readOnly: t }) {
  const n = Mn(Za(i) ?? [...dd]), r = Mn(e), s = Mn(!1), a = Za(i) ?? [...dd], [o, l] = Ue(a), [d, u] = Ue(() => Cs(kr(a))), [p, f] = Ue(!1), [m, _] = Ue(!1), [x, c] = Ue("translate");
  Rt(() => {
    r.current = e;
  }), Rt(() => {
    const v = Za(i);
    if (v) {
      if (s.current) {
        s.current = !1;
        return;
      }
      n.current = v, l(v), u(Cs(kr(v)));
    }
  }, [i]);
  function h(v) {
    var L;
    s.current = !0, (L = r.current) == null || L.call(r, v.join(","));
  }
  function E(v, L) {
    if (t) return;
    u((W) => ({ ...W, [v]: L }));
    const k = parseFloat(L);
    if (isNaN(k)) return;
    const V = G_({ ...kr(n.current), [v]: k });
    n.current = V, l(V), h(V);
  }
  function y(v, L) {
    if (t) return;
    const k = parseFloat(L);
    if (isNaN(k)) return;
    const V = [...n.current];
    V[v] = k, n.current = V, l(V), u(Cs(kr(V))), h(V);
  }
  function w(v) {
    n.current = v, l(v), u(Cs(kr(v))), h(v);
  }
  const I = { fontSize: 10, color: "var(--muted, #888)", marginBottom: 4 }, R = { display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 6px", alignItems: "center" }, C = { fontSize: 10, color: "var(--muted, #888)", fontFamily: "var(--mono, monospace)" }, U = { padding: "2px 4px", fontSize: 11, width: "100%" }, A = { flex: 1, fontSize: 10, padding: "2px 0", border: "1px solid var(--border, #3a3a5a)", borderRadius: 3, cursor: "pointer" };
  return /* @__PURE__ */ F("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
    /* @__PURE__ */ F("div", { style: { display: "flex", gap: 12, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ F("div", { style: { flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 8 }, children: [
        /* @__PURE__ */ F("div", { children: [
          /* @__PURE__ */ b("div", { style: I, children: "Translation" }),
          /* @__PURE__ */ b("div", { style: R, children: [["tx", "X"], ["ty", "Y"], ["tz", "Z"]].map(([v, L]) => /* @__PURE__ */ F(hr, { children: [
            /* @__PURE__ */ b("span", { style: C, children: L }),
            /* @__PURE__ */ b(
              "input",
              {
                type: "number",
                step: "any",
                className: "field-input",
                style: U,
                value: d[v],
                disabled: t,
                onChange: (k) => E(v, k.target.value)
              }
            )
          ] }, v)) })
        ] }),
        /* @__PURE__ */ F("div", { children: [
          /* @__PURE__ */ b("div", { style: I, children: "Rotation (°)" }),
          /* @__PURE__ */ b("div", { style: R, children: [["rx", "X"], ["ry", "Y"], ["rz", "Z"]].map(([v, L]) => /* @__PURE__ */ F(hr, { children: [
            /* @__PURE__ */ b("span", { style: C, children: L }),
            /* @__PURE__ */ b(
              "input",
              {
                type: "number",
                step: "any",
                className: "field-input",
                style: U,
                value: d[v],
                disabled: t,
                onChange: (k) => E(v, k.target.value)
              }
            )
          ] }, v)) })
        ] })
      ] }),
      /* @__PURE__ */ b("div", { style: { flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 4 }, children: m ? /* @__PURE__ */ F(Xr, { children: [
        /* @__PURE__ */ b(X_, { matRef: n, readOnly: t, onMatChange: w, tcMode: x }),
        !t && /* @__PURE__ */ F("div", { style: { display: "flex", gap: 4 }, children: [
          ["translate", "rotate"].map((v) => /* @__PURE__ */ b("button", { style: {
            ...A,
            background: x === v ? "var(--accent, #3399ff)" : "var(--surface2, #1e1e2e)",
            color: x === v ? "#fff" : "var(--fg, #ccc)"
          }, onClick: () => c(v), children: v === "translate" ? "Translate" : "Rotate" }, v)),
          /* @__PURE__ */ b(
            "button",
            {
              style: { ...A, flex: "0 0 auto", padding: "2px 6px", background: "var(--surface2, #1e1e2e)", color: "var(--muted, #888)" },
              onClick: () => _(!1),
              children: "✕"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ b(
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
      p && /* @__PURE__ */ b("div", { style: { marginTop: 4, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, fontFamily: "var(--mono, monospace)" }, children: o.map((v, L) => /* @__PURE__ */ b(
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
function co(i) {
  var e;
  return ((e = (i.linkAttributeValues || []).find((t) => t.attributeId === "kind")) == null ? void 0 : e.value) || null;
}
function Y_(i) {
  var e;
  return ((e = (i.linkAttributeValues || []).find((t) => t.attributeId === "layer")) == null ? void 0 : e.value) || "main";
}
function q_(i) {
  var n;
  const e = (((n = i.targetDetails) == null ? void 0 : n.contentType) || "").toLowerCase(), t = (i.displayKey || i.targetKey || "").toLowerCase();
  return e.includes("step") || e.includes("stp") || t.endsWith(".stp") || t.endsWith(".step") || t.endsWith(".p21");
}
function j_(i) {
  if (i.targetSourceCode !== "DATA_LOCAL") return !1;
  const e = co(i);
  return e === "simplified" || e === "design" || e === "original" ? !0 : q_(i);
}
function K_(i) {
  return { "st-draft": "Draft", "st-inreview": "In Review", "st-released": "Released", "st-frozen": "Frozen", "st-obsolete": "Obsolete" }[i] || i;
}
function $_(i, e, t) {
  let n = i;
  for (; n; ) {
    if (n === e) return !0;
    const r = (t || []).find((s) => (s.id || s.ID) === n);
    n = r && (r.parent_node_type_id || r.PARENT_NODE_TYPE_ID) || null;
  }
  return !1;
}
function Di({ stateId: i, stateName: e, stateColorMap: t }) {
  const n = (t == null ? void 0 : t[i]) || "#6b7280";
  return /* @__PURE__ */ F("span", { className: "pill", style: { color: n, background: `${n}18`, border: `1px solid ${n}30` }, children: [
    /* @__PURE__ */ b("span", { className: "pill-dot", style: { background: n } }),
    e || K_(i)
  ] });
}
function Z_(i, e) {
  const t = new Array(16);
  for (let n = 0; n < 4; n++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let a = 0; a < 4; a++) s += i[n * 4 + a] * e[a * 4 + r];
      t[n * 4 + r] = s;
    }
  return t;
}
async function Hd(i, e, t, n, r, s, a, o, l, d, u = null, p = null) {
  var c;
  if (a > o) return [];
  if (a === 0 && u === null && l.has(t)) return [];
  a === 0 && u === null && l.add(t);
  const f = s.filter(j_), m = /* @__PURE__ */ new Map();
  for (const h of f) {
    const E = Y_(h), y = co(h);
    m.has(E) || m.set(E, { simplified: null, fallback: null });
    const w = m.get(E);
    y === "simplified" ? w.simplified = h : w.fallback || (w.fallback = h);
  }
  const _ = [];
  for (const [h, { simplified: E, fallback: y }] of m) {
    if (h !== "main") continue;
    const w = E || y;
    if (!w) continue;
    const I = co(w) || "design";
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
    const h = s.filter((E) => E.targetSourceCode === "SELF" && E.targetNodeId);
    await Promise.all(h.map(async (E) => {
      var w;
      const y = E.linkId;
      if (!(!y || l.has(y))) {
        l.add(y);
        try {
          const I = (w = (E.linkAttributeValues || []).find((L) => L.attributeId === "position")) == null ? void 0 : w.value;
          let R = null;
          if (I) {
            const L = I.split(",").map(Number);
            L.length === 16 && L.every((k) => !isNaN(k)) && (R = L);
          }
          let C = null;
          p && R ? C = Z_(p, R) : R ? C = R : p && (C = p);
          const U = await i.getChildLinks(null, E.targetNodeId), A = (d == null ? void 0 : d[E.targetState]) || "#6b7280", v = await Hd(
            i,
            e,
            E.targetNodeId,
            E.targetLogicalId || E.targetNodeId,
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
function Q_({ jobData: i, onClose: e }) {
  const { job: t, results: n = [] } = i, r = t.status === "DONE" || t.status === "FAILED", s = n.reduce((o, l) => (o[l.action] = (o[l.action] || 0) + 1, o), {}), a = (o) => o === "CREATED" ? "var(--success)" : o === "UPDATED" ? "var(--accent)" : o === "REJECTED" ? "var(--danger)" : "var(--muted)";
  return /* @__PURE__ */ F(Xr, { children: [
    /* @__PURE__ */ F("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }, children: [
      /* @__PURE__ */ b("span", { style: { fontSize: 18 }, children: t.status === "DONE" ? "✓" : t.status === "FAILED" ? "✕" : "⏳" }),
      /* @__PURE__ */ F("span", { style: { fontWeight: 600, color: t.status === "FAILED" ? "var(--danger)" : t.status === "DONE" ? t.errorSummary ? "var(--warning, #f5a623)" : "var(--success)" : void 0 }, children: [
        t.status === "PENDING" && "Queued…",
        t.status === "RUNNING" && "Processing…",
        t.status === "DONE" && `Complete — ${n.length} node${n.length !== 1 ? "s" : ""}${t.errorSummary ? " (with warnings)" : ""}`,
        t.status === "FAILED" && `Failed: ${t.errorSummary || "unknown error"}`
      ] })
    ] }),
    t.status === "DONE" && t.errorSummary && /* @__PURE__ */ b("div", { style: { marginBottom: 12, padding: "8px 10px", background: "var(--warning-bg, #fff8e1)", border: "1px solid var(--warning, #f5a623)", borderRadius: 6, fontSize: 12, color: "var(--warning-text, #7a4f00)", whiteSpace: "pre-wrap" }, children: t.errorSummary }),
    Object.keys(s).length > 0 && /* @__PURE__ */ b("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }, children: Object.entries(s).map(([o, l]) => /* @__PURE__ */ F("span", { style: { fontSize: 12, padding: "2px 8px", borderRadius: 4, border: `1px solid ${a(o)}40`, color: a(o) }, children: [
      o,
      ": ",
      l
    ] }, o)) }),
    n.length > 0 && /* @__PURE__ */ b("div", { style: { maxHeight: 240, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 6, marginBottom: 16 }, children: /* @__PURE__ */ F("table", { style: { width: "100%", fontSize: 12, borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ b("thead", { children: /* @__PURE__ */ F("tr", { style: { background: "var(--surface)", position: "sticky", top: 0 }, children: [
        /* @__PURE__ */ b("th", { style: { padding: "6px 10px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }, children: "Name" }),
        /* @__PURE__ */ b("th", { style: { padding: "6px 10px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }, children: "Type" }),
        /* @__PURE__ */ b("th", { style: { padding: "6px 10px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)" }, children: "Result" })
      ] }) }),
      /* @__PURE__ */ b("tbody", { children: n.map((o, l) => /* @__PURE__ */ F("tr", { style: { borderTop: l > 0 ? "1px solid var(--border)" : void 0 }, children: [
        /* @__PURE__ */ b("td", { style: { padding: "5px 10px" }, children: o.name }),
        /* @__PURE__ */ b("td", { style: { padding: "5px 10px", color: "var(--muted)", fontSize: 11 }, children: o.type }),
        /* @__PURE__ */ b("td", { style: { padding: "5px 10px" }, children: /* @__PURE__ */ F("span", { style: { color: a(o.action), fontSize: 11 }, children: [
          o.action,
          o.errorMessage ? ` — ${o.errorMessage}` : ""
        ] }) })
      ] }, o.id || l)) })
    ] }) }),
    /* @__PURE__ */ b("div", { style: { display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ b("button", { className: "btn btn-sm", onClick: e, children: r ? "Close" : "Dismiss (job continues in background)" }) })
  ] });
}
function J_({
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
  var Do, Uo, Oo, Fo, Bo, zo, ko, Vo, Ho, Go, Wo, Xo, Yo, qo, jo, Ko, $o, Zo, Qo, Jo, el, tl, nl, il, rl, sl, al, ol, ll, cl, dl, hl, ul, fl, pl, ml, gl, _l, vl, xl, yl, Sl, Ml;
  const {
    usePlmStore: h,
    useWebSocket: E,
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
  } = i, [W, Q] = Ue([]), [j, ie] = Ue({}), [K, de] = Ue({}), [ve, Ee] = Ue([]), [tt, ct] = Ue(!1), [J, oe] = Ue(null), [be, ue] = Ue(null), [Je, Ve] = Ue({}), [nt, D] = Ue(null), [it, rt] = Ue(null), [yt, Oe] = Ue(!1), $e = Mn(null), [et, Ze] = Ue(null), [Ct, P] = Ue(!1), [S, Y] = Ue([]), [re, ae] = Ue([]), [ne, Pe] = Ue(!1), [pe, me] = Ue(!1), [Qe, ce] = Ue([]), [Ie, st] = Ue({}), [Fe, xe] = Ue(""), [qe, Ye] = Ue(""), [St, g] = Ue([]), [q, z] = Ue(-1), [$, te] = Ue(!1), [Le, He] = Ue(""), [Pt, Dt] = Ue(!1), [dt, wt] = Ue(null), [Ot, tn] = Ue(""), [Gt, $t] = Ue(""), [Rn, bn] = Ue({}), [hn, Wn] = Ue([]), [vi, nn] = Ue(!1), [Dn, Zt] = Ue(-1), [Zs, T] = Ue(null), [O, G] = Ue(null), [X, B] = Ue(null), [he, Me] = Ue(!1), [Re, De] = Ue([]), [Ge, We] = Ue(!1), [Be, pt] = Ue(null), [Lt, bt] = Ue(!1), [Bt, mt] = Ue(null), [we, Wt] = Ue(null), [ht, un] = Ue(null), [Fi, Cn] = Ue(!1), [Bi, Ft] = Ue(null), [Un, zi] = Ue({}), [fn, ki] = Ue(!0), Tr = Mn(null), Vi = Mn(null), Ar = Mn(0), Qs = Mn(null), Kr = Mn(!1), Js = Mn(null), [ke, xo] = Ue(() => (f == null ? void 0 : f.data) ?? null);
  Rt(() => {
    f != null && f.data && xo(f.data);
  }, [f]);
  const [pn, ea] = Ue(null), [yo, ta] = Ue(/* @__PURE__ */ new Map()), [$r, Wd] = Ue(/* @__PURE__ */ new Map());
  Rt(() => {
    var H, Z;
    const M = ((H = ke == null ? void 0 : ke.itemType) == null ? void 0 : H.itemKey) ?? ((Z = ke == null ? void 0 : ke.metadata) == null ? void 0 : Z.nodeTypeId);
    M && Vt.getNodeTypeDescriptor(M).then(ea).catch(() => ea(null));
  }, [(Do = ke == null ? void 0 : ke.itemType) == null ? void 0 : Do.itemKey, (Uo = ke == null ? void 0 : ke.metadata) == null ? void 0 : Uo.nodeTypeId]);
  const wr = (Oo = ke == null ? void 0 : ke.metadata) == null ? void 0 : Oo.domains;
  Rt(() => {
    if (!(wr != null && wr.length)) {
      ta(/* @__PURE__ */ new Map());
      return;
    }
    Promise.all(
      wr.map(
        (M) => Vt.getDomainDescriptor(M.id).then((H) => [M.id, H]).catch(() => [M.id, null])
      )
    ).then((M) => ta(new Map(M.filter(([, H]) => H))));
  }, [wr]);
  const So = dr(() => {
    p && p(e);
  }, [e, p]), Xd = dr((M) => {
    xo((H) => {
      if (!H) return H;
      if (H.values) {
        const ee = H.values.map(
          (se) => M[se.name] !== void 0 ? { ...se, value: M[se.name] } : se
        );
        return { ...H, values: ee };
      }
      const Z = (H.fields || []).map(
        (ee) => M[ee.name] !== void 0 ? { ...ee, value: M[ee.name] } : ee
      );
      return { ...H, fields: Z };
    });
  }, []), Mo = h((M) => M.refreshAll), Yd = h((M) => M.refreshNodes), Zr = h((M) => M.refreshTx);
  Rt(() => {
    Ee([]);
  }, [e]);
  const qd = (Fo = ke == null ? void 0 : ke.metadata) == null ? void 0 : Fo.currentVersionId;
  Rt(() => {
    var M;
    (M = ke == null ? void 0 : ke.metadata) != null && M.violations && Ee(ke.metadata.violations);
  }, [qd]), Rt(() => {
    ki(ve.length > 1);
  }, [ve.length]);
  const jd = da(
    () => Object.fromEntries(ve.filter((M) => M.attrCode).map((M) => [M.attrCode, M])),
    [ve]
  ), Qr = dr(async () => {
    if (!ne)
      try {
        const [M, H] = await Promise.all([
          Vt.getChildLinks(t, e).catch(() => []),
          Vt.getParentLinks(t, e).catch(() => [])
        ]), Z = Array.isArray(M) ? M : [], ee = Array.isArray(H) ? H : [];
        Y(Z), ae(ee), Pe(!0);
        const se = [...new Set(
          [...Z, ...ee].map((_e) => _e.linkTypeId).filter(Boolean)
        )], fe = await Promise.all(
          se.map(
            (_e) => oh(_e, (lt) => Vt.getLinkTypeDescriptor(lt)).then((lt) => [_e, lt]).catch(() => [_e, null])
          )
        );
        Wd(new Map(fe));
      } catch (M) {
        l(M, "error");
      }
  }, [e, t, ne, l]);
  Rt(() => {
    ne || Qr();
  }, [ne, Qr]), Rt(() => {
    var ee, se;
    if (!ne) return;
    let M = !1;
    We(!0);
    const H = ((ee = ke == null ? void 0 : ke.metadata) == null ? void 0 : ee.logicalId) || (ke == null ? void 0 : ke.title) || e, Z = (s == null ? void 0 : s[(se = ke == null ? void 0 : ke.metadata) == null ? void 0 : se.state]) || "#6b7280";
    return Hd(Vt, t, e, H, Z, S, 0, 3, /* @__PURE__ */ new Set(), s, null, null).then((fe) => {
      M || (Kr.current = !0, De(fe), We(!1));
    }).catch(() => {
      M || (Kr.current = !0, We(!1));
    }), () => {
      M = !0;
    };
  }, [ne, e, S, (Bo = ke == null ? void 0 : ke.metadata) == null ? void 0 : Bo.state]), Rt(() => {
    Kr.current && (c == null || c({ nodes: Re, loading: Ge }));
  }, [Re, Ge]);
  const ti = (n == null ? void 0 : n.txId) || null;
  Rt(() => {
    ke && u && u(ke);
  }, [ke]), Rt(() => {
    Q([]), ie({}), de({}), ct(!1), oe(null), ue(null), Ve({}), rt(null), $e.current && (clearInterval($e.current), $e.current = null), Ze(null), P(!1), me(!1), ce([]), st({}), xe(""), Ye(""), g([]), z(-1), te(!1), He(""), Dt(!1), wt(null), tn(""), $t(""), bn({}), Wn([]), nn(!1), Zt(-1), T(null), G(null), B(null), Me(!1), pt(null), bt(!1), mt(null), Cn(!1), Ft(null), zi({}), Pe(!1), Y([]), ae([]), Kr.current = !1, De([]), c == null || c({ nodes: [], loading: !0 });
  }, [e]), Rt(() => {
    Js.current && !dt && (i == null || i.emit({ type: "psm:link:positionChange", linkId: Js.current, matrix: null })), Js.current = dt;
  }, [dt, i]), Rt(() => {
    if (i != null && i.on)
      return i.on("psm:part:selected", ({ linkId: M }) => {
        G(M ?? null);
      });
  }, [i]);
  const Rr = dr(async () => {
    try {
      const [M, H, Z] = await Promise.all([
        Vt.getVersionHistory(t, e).catch(() => []),
        Vt.getComments(t, e).catch(() => []),
        Vt.getSignatureHistory(t, e).catch(() => [])
      ]);
      Q(Array.isArray(M) ? M : []);
      const ee = {};
      Array.isArray(Z) && Z.forEach((fe) => {
        const _e = fe.node_version_id || fe.NODE_VERSION_ID;
        _e && (ee[_e] || (ee[_e] = { count: 0, hasRejected: !1 }), ee[_e].count += 1, (fe.meaning || fe.MEANING || "").toUpperCase() === "REJECTED" && (ee[_e].hasRejected = !0));
      }), zi(ee);
      const se = {};
      Array.isArray(H) && H.forEach((fe) => {
        const _e = fe.versionId;
        _e && (se[_e] = (se[_e] || 0) + 1);
      }), ie(se), de({});
    } catch (M) {
      l(M, "error");
    }
  }, [e, t, l]);
  Rt(() => {
    Rr();
  }, [Rr]);
  const Kd = dr(async () => {
    try {
      const M = await Vt.getComments(t, e).catch(() => []), H = {};
      Array.isArray(M) && M.forEach((Z) => {
        const ee = Z.versionId;
        ee && (H[ee] = (H[ee] || 0) + 1);
      }), ie(H);
    } catch {
    }
  }, [e, t]);
  Rt(() => {
    Pe(!1), Y([]), ae([]), Wt(null), un(null);
  }, [e]), Rt(() => {
    a === "pbs" && Qr();
  }, [a, Qr]), Rt(() => () => {
    clearTimeout(Tr.current), clearTimeout(Vi.current), $e.current && clearInterval($e.current);
  }, []), Rt(() => {
    pe && Qs.current && Qs.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [pe]), E(
    e ? `/topic/nodes/${e}` : null,
    (M) => {
      M.nodeId && M.nodeId !== e || ((M.event === "STATE_CHANGED" || M.event === "SIGNED" || M.event === "ITEM_DEFINITION_UPDATED") && So(), (M.event === "LOCK_RELEASED" || M.event === "LOCK_ACQUIRED" || M.event === "ITEM_UPDATED" || M.event === "ITEM_DEFINITION_UPDATED") && Yd(), M.event === "COMMENT_ADDED" && Kd());
    },
    t
  ), E(
    "/topic/global",
    (M) => {
      M.event === "METAMODEL_CHANGED" && (lh(), Vt.clearDomainDescriptorCache(), Pe(!1), ea(null), ta(/* @__PURE__ */ new Map()));
    },
    t
  );
  async function $d(M) {
    const H = [...W].sort((se, fe) => (se.version_number || se.VERSION_NUMBER) - (fe.version_number || fe.VERSION_NUMBER)), Z = H.findIndex((se) => (se.version_number || se.VERSION_NUMBER) === M);
    if (Z <= 0) return;
    const ee = H[Z - 1].version_number || H[Z - 1].VERSION_NUMBER;
    P(!0);
    try {
      const se = await Vt.getVersionDiff(t, e, ee, M);
      Ze({ data: se, v1Num: ee, v2Num: M });
    } catch (se) {
      l(se, "error");
    } finally {
      P(!1);
    }
  }
  async function Eo(M = null) {
    var H;
    xe(""), Ye((M == null ? void 0 : M.logicalId) || ""), g([]), z(-1), te(!1), He("");
    try {
      const [Z, ee] = await Promise.all([
        y.getNodeTypeLinkTypes(t, (H = ke == null ? void 0 : ke.metadata) == null ? void 0 : H.nodeTypeId).catch(() => []),
        Vt.getSources(t).catch(() => [])
      ]);
      let se = Array.isArray(Z) ? Z : [];
      if (M != null && M.nodeTypeId) {
        const _e = M.nodeTypeId;
        se = se.filter((lt) => {
          const ut = lt.target_type || lt.TARGET_TYPE;
          return !ut || $_(_e, ut, r);
        }), se.length === 1 && xe(se[0].id || se[0].ID);
      }
      ce(se);
      const fe = {};
      (Array.isArray(ee) ? ee : []).forEach((_e) => {
        fe[_e.id] = _e;
      }), st(fe), me(!0);
    } catch (Z) {
      l(Z, "error");
    }
  }
  async function bo(M, H, Z) {
    try {
      const ee = await Vt.getSourceKeys(t, M, H, Z, 25);
      g(Array.isArray(ee) ? ee : []);
    } catch {
      g([]);
    }
  }
  async function Jr(M, H, Z) {
    try {
      const ee = await Vt.getSourceKeys(t, M, H, Z, 25);
      Wn(Array.isArray(ee) ? ee : []);
    } catch {
      Wn([]);
    }
  }
  async function Zd() {
    var se;
    if (!Fe) return;
    const M = Qe.find((fe) => (fe.id || fe.ID) === Fe), H = (M == null ? void 0 : M.target_source_id) || (M == null ? void 0 : M.TARGET_SOURCE_ID) || "SELF", Z = (M == null ? void 0 : M.target_type) || (M == null ? void 0 : M.TARGET_TYPE) || null;
    if (!qe) return;
    const ee = qe;
    Dt(!0);
    try {
      const fe = ti || await d();
      if (!fe) return;
      const _e = (se = ke.actions) == null ? void 0 : se.find((ut) => ut.code === "create_link");
      if (!_e) throw new Error("create_link action not available for this node type");
      const lt = {
        linkTypeId: Fe,
        targetSourceCode: H,
        ...Z ? { targetType: Z } : {},
        targetKey: ee,
        linkLogicalId: Le || ""
      };
      await (_e.path ? I.executeViaDescriptor(_e, e, t, fe, lt) : I.executeAction(e, _e.code, t, fe, lt)), l("Link created", "success"), me(!1), He(""), Ye(""), g([]), z(-1), te(!1), Pe(!1), await Zr(), await Rr();
    } catch (fe) {
      l(fe, "error");
    } finally {
      Dt(!1);
    }
  }
  async function Qd(M, H, Z, ee) {
    var fe;
    const se = (fe = ke.actions) == null ? void 0 : fe.find((_e) => _e.code === "update_link");
    if (se) {
      Me(!0);
      try {
        const _e = ti || await d();
        if (!_e) return;
        const lt = {};
        ee && Object.entries(ee).forEach(([Mt, le]) => {
          lt[`linkAttr_${Mt}`] = le;
        });
        const ut = { linkId: M, logicalId: H, ...Z ? { targetKey: Z } : {}, ...lt };
        await (se.path ? I.executeViaDescriptor(se, e, t, _e, ut) : I.executeAction(e, se.code, t, _e, ut)), wt(null), await Zr(), Pe(!1), await Promise.all([
          Vt.getChildLinks(t, e).then((Mt) => Y(Array.isArray(Mt) ? Mt : [])),
          Vt.getParentLinks(t, e).then((Mt) => ae(Array.isArray(Mt) ? Mt : []))
        ]), Pe(!0);
      } catch (_e) {
        l(_e, "error");
      } finally {
        Me(!1);
      }
    }
  }
  async function Jd(M) {
    var Z;
    const H = (Z = ke.actions) == null ? void 0 : Z.find((ee) => ee.code === "delete_link");
    if (H) {
      Me(!0), T(null);
      try {
        const ee = ti || await d();
        if (!ee) return;
        await (H.path ? I.executeViaDescriptor(H, e, t, ee, { linkId: M }) : I.executeAction(e, H.code, t, ee, { linkId: M })), G((se) => se === M ? null : se), await Zr(), Pe(!1), await Promise.all([
          Vt.getChildLinks(t, e).then((se) => Y(Array.isArray(se) ? se : [])),
          Vt.getParentLinks(t, e).then((se) => ae(Array.isArray(se) ? se : []))
        ]), Pe(!0);
      } catch (ee) {
        l(ee, "error");
      } finally {
        Me(!1);
      }
    }
  }
  async function To(M, H = {}) {
    var ee;
    const Z = M.bodyShape === "MULTIPART";
    Z || ue(null), ct(!0), Z && D(0);
    try {
      const se = Z ? (_e) => D(_e) : void 0, fe = M.path ? await I.executeViaDescriptor(M, e, t, ti, H, se) : await I.executeAction(
        e,
        M.code,
        t,
        ti,
        H,
        (ee = M.metadata) == null ? void 0 : ee.transitionId
      );
      if (Z && (ue(null), D(null)), fe != null && fe.jobId && M.jobStatusPath) {
        const _e = M.jobStatusPath.replace("{jobId}", fe.jobId), lt = fe.jobId, ut = M.label || M.name || "Import";
        rt({ id: lt, data: { job: { id: lt, status: fe.status || "PENDING" }, results: [] } }), Oe(!0), C.register(lt, ut, () => Oe(!0)), $e.current && clearInterval($e.current), $e.current = setInterval(async () => {
          var Mt, le, Ne;
          try {
            const ze = await R("psm", _e);
            rt((gt) => gt ? { ...gt, data: ze } : null), (((Mt = ze.job) == null ? void 0 : Mt.status) === "DONE" || ((le = ze.job) == null ? void 0 : le.status) === "FAILED") && (C.update(lt, ze.job.status === "DONE" ? "done" : "failed"), clearInterval($e.current), $e.current = null, ((Ne = ze.job) == null ? void 0 : Ne.status) === "DONE" && (await Mo(), await Rr()));
          } catch {
          }
        }, 2e3);
        return;
      }
      (fe == null ? void 0 : fe.violations) !== void 0 && Ee(fe.violations), fe != null && fe.message && l(fe.message, "success"), await Mo(), await Rr();
    } catch (se) {
      ue(null), D(null), l(se, "error");
    } finally {
      ct(!1);
    }
  }
  function na(M) {
    var Z;
    const H = (M.parameters || []).filter((ee) => ee.widget);
    if (H.length > 0) {
      const ee = {};
      H.forEach((se) => {
        se.defaultValue && (ee[se.name] = se.defaultValue);
      }), Ve(ee), ue(M);
    } else ((Z = M.metadata) == null ? void 0 : Z.displayCategory) === "DANGEROUS" ? (Ve({}), ue(M)) : To(M);
  }
  async function eh(M, H, Z) {
    var se;
    oe("saving");
    const ee = { ...M, _description: "Auto-save" };
    try {
      const fe = await (Z != null && Z.path ? I.executeViaDescriptor(Z, e, t, H, ee) : I.executeAction(e, (Z == null ? void 0 : Z.code) ?? Z, t, H, ee));
      Xd(M), de({}), Ee((fe == null ? void 0 : fe.violations) || []), oe("saved"), clearTimeout(Vi.current), Vi.current = setTimeout(() => oe(null), 2e3), Zr();
    } catch (fe) {
      oe(null);
      const _e = (se = fe.detail) == null ? void 0 : se.violations;
      _e != null && _e.length ? Ee(_e) : l(fe, "error");
    }
  }
  function Ao(M, H, Z) {
    clearTimeout(Tr.current), oe(null), Tr.current = setTimeout(() => eh(M, H, Z), 800);
  }
  Rt(() => {
    !we || !e || !t || (Cn(!0), Vt.getNodeDescription(t, e, null, we).then((M) => un(M)).catch((M) => l(M, "error")).finally(() => Cn(!1)));
  }, [we, e, t]);
  const ye = we && ht ? ht : ke, On = da(() => {
    var ut, Mt, le;
    const M = [], H = /* @__PURE__ */ new Map(), Z = {}, ee = {};
    if (pn != null && pn.fields) {
      for (const ze of pn.fields) Z[ze.name] = ze;
      const Ne = ((ut = pn.staticMetadata) == null ? void 0 : ut.fieldMeta) || {};
      for (const [ze, gt] of Object.entries(Ne)) ee[ze] = gt;
    }
    const se = {};
    for (const [Ne, ze] of yo) {
      if (!(ze != null && ze.fields)) continue;
      const gt = ze.displayName || Ne, Xe = ((Mt = ze.staticMetadata) == null ? void 0 : Mt.fieldMeta) || {};
      for (const Ae of ze.fields)
        se[Ae.name] = { fm: Ae, enrich: Xe[Ae.name] || {}, domainId: Ne, domainName: gt };
    }
    const fe = ((le = ye == null ? void 0 : ye.metadata) == null ? void 0 : le.attributeMeta) || {};
    ((ye == null ? void 0 : ye.values) ?? (ye == null ? void 0 : ye.fields) ?? []).forEach((Ne) => {
      var sn, rn, Ce, je, Nt, zt, es, Gi, Pr, Yn;
      const ze = Z[Ne.name], gt = ee[Ne.name] || {}, Xe = se[Ne.name], Ae = fe[Ne.name];
      if (!ze && !Xe && !Ae) return;
      const ge = gt.sourceDomainId || ((sn = Xe == null ? void 0 : Xe.enrich) == null ? void 0 : sn.sourceDomainId) || (Ae == null ? void 0 : Ae.sourceDomainId) || "", _t = gt.sourceDomainName || ((rn = Xe == null ? void 0 : Xe.enrich) == null ? void 0 : rn.sourceDomainName) || (Xe == null ? void 0 : Xe.domainName) || (Ae == null ? void 0 : Ae.sourceDomainName) || "", vt = {
        id: Ne.name,
        name: Ne.name,
        value: Ne.value,
        editable: Ne.editable ?? !1,
        required: Ne.required ?? (Ae == null ? void 0 : Ae.required) ?? !1,
        label: (ze == null ? void 0 : ze.label) ?? ((Ce = Xe == null ? void 0 : Xe.fm) == null ? void 0 : Ce.label) ?? (Ae == null ? void 0 : Ae.label) ?? Ne.name,
        widget: Ne.widget ?? (ze == null ? void 0 : ze.widget) ?? ((je = Xe == null ? void 0 : Xe.fm) == null ? void 0 : je.widget) ?? (Ae == null ? void 0 : Ae.widget) ?? "text",
        tooltip: Ne.hint ?? (ze == null ? void 0 : ze.hint) ?? ((Nt = Xe == null ? void 0 : Xe.fm) == null ? void 0 : Nt.tooltip) ?? (Ae == null ? void 0 : Ae.tooltip) ?? null,
        hint: Ne.hint ?? (ze == null ? void 0 : ze.hint) ?? ((zt = Xe == null ? void 0 : Xe.fm) == null ? void 0 : zt.tooltip) ?? (Ae == null ? void 0 : Ae.hint) ?? null,
        displayOrder: (ze == null ? void 0 : ze.displayOrder) ?? ((es = Xe == null ? void 0 : Xe.fm) == null ? void 0 : es.displayOrder) ?? (Ae == null ? void 0 : Ae.displayOrder) ?? 0,
        section: (ze == null ? void 0 : ze.group) ?? ((Gi = Xe == null ? void 0 : Xe.fm) == null ? void 0 : Gi.group) ?? (Ae == null ? void 0 : Ae.section) ?? "General",
        namingRegex: gt.namingRegex || ((Pr = Xe == null ? void 0 : Xe.enrich) == null ? void 0 : Pr.namingRegex) || (Ae == null ? void 0 : Ae.namingRegex) || "",
        allowedValues: gt.allowedValues || ((Yn = Xe == null ? void 0 : Xe.enrich) == null ? void 0 : Yn.allowedValues) || (Ae == null ? void 0 : Ae.allowedValues) || "",
        sourceDomainId: ge,
        sourceDomainName: _t
      };
      vt.sourceDomainId ? (H.has(vt.sourceDomainId) || H.set(vt.sourceDomainId, {
        id: vt.sourceDomainId,
        name: vt.sourceDomainName || vt.sourceDomainId,
        attrs: []
      }), H.get(vt.sourceDomainId).attrs.push(vt)) : M.push(vt);
    });
    const lt = Array.from(H.values()).sort((Ne, ze) => Ne.name.localeCompare(ze.name));
    return { base: M, domains: lt };
  }, [ye == null ? void 0 : ye.values, ye == null ? void 0 : ye.fields, (zo = ye == null ? void 0 : ye.metadata) == null ? void 0 : zo.attributeMeta, pn, yo]);
  da(() => On.base.reduce((M, H) => {
    const Z = H.section || "General";
    return M[Z] || (M[Z] = []), M[Z].push(H), M;
  }, {}), [On.base]);
  const [wo, ia] = Ue(null);
  if (Rt(() => {
    const M = On.domains;
    if (M.length === 0) {
      ia(null);
      return;
    }
    ia((H) => H && M.some((Z) => Z.id === H) ? H : M[0].id);
  }, [On.domains]), !ke) return /* @__PURE__ */ F("div", { className: "empty", style: { padding: "60px 24px" }, children: [
    /* @__PURE__ */ b("div", { className: "empty-icon", children: "◎" }),
    /* @__PURE__ */ b("div", { className: "empty-text", children: "Loading…" })
  ] });
  const ra = ((ko = ye == null ? void 0 : ye.metadata) == null ? void 0 : ko.txStatus) === "OPEN", Cr = (ye == null ? void 0 : ye.actions) || [];
  (Vo = ye == null ? void 0 : ye.metadata) == null || Vo.fingerprintChanged;
  const th = /* @__PURE__ */ new Set(["update_node", "create_link", "update_link", "delete_link", "read", "comment", "baseline", "manage_metamodel", "manage_roles", "manage_baselines"]), sa = Cr.find((M) => {
    var H;
    return M.code === "update_node" && ((H = M.metadata) == null ? void 0 : H.authorized) !== !1;
  }), Ro = Cr.filter(
    (M) => {
      var H, Z, ee;
      return ((H = M.metadata) == null ? void 0 : H.authorized) !== !1 && !th.has(M.code) && ((Z = M.metadata) == null ? void 0 : Z.displayCategory) !== "STRUCTURAL" && ((ee = M.metadata) == null ? void 0 : ee.displayCategory) !== "PROPERTY";
    }
  ), aa = Cr.filter(
    (M) => {
      var H, Z;
      return ((H = M.metadata) == null ? void 0 : H.authorized) !== !1 && ((Z = M.metadata) == null ? void 0 : Z.displayCategory) === "PROPERTY";
    }
  ), Co = (M) => {
    var H;
    return ((H = M == null ? void 0 : M.guardViolations) == null ? void 0 : H.length) > 0;
  }, Po = (M) => {
    const H = M == null ? void 0 : M.guardViolations;
    return H != null && H.length ? `Blocked:
• ` + H.map((Z) => typeof Z == "string" ? Z : Z.message || Z.code).join(`
• `) : "";
  }, nh = Cr.filter((M) => {
    var H;
    return (H = M.code) == null ? void 0 : H.startsWith("transition");
  }), ih = new Map(
    nh.filter((M) => {
      var H;
      return ((H = M.guardViolations) == null ? void 0 : H.length) > 0;
    }).map((M) => [M.label, M.guardViolations])
  ), Lo = Ro.filter((M) => {
    var H;
    return (H = M.code) == null ? void 0 : H.startsWith("transition");
  }), Hi = (Ho = ye == null ? void 0 : ye.actions) == null ? void 0 : Ho.some((M) => M.code === "update_link"), xi = (Go = ye == null ? void 0 : ye.actions) == null ? void 0 : Go.some((M) => M.code === "delete_link"), oa = Cr.find((M) => M.code === "checkout"), la = Hi || xi || !!oa;
  (Wo = pn == null ? void 0 : pn.staticMetadata) != null && Wo.lifecycleId || (Xo = ye == null ? void 0 : ye.metadata) != null && Xo.lifecycleId;
  const Qt = (Yo = ye == null ? void 0 : ye.metadata) != null && Yo.nodeTypeId ? (r || []).find((M) => (M.id || M.ID) === ye.metadata.nodeTypeId) : null, Xn = (Qt == null ? void 0 : Qt.color) || (Qt == null ? void 0 : Qt.COLOR) || null, No = (Qt == null ? void 0 : Qt.icon) || (Qt == null ? void 0 : Qt.ICON) || null, ca = No ? L[No] : null, Io = (Qt == null ? void 0 : Qt.name) || (Qt == null ? void 0 : Qt.NAME) || null, rh = ((qo = W.find(
    (M) => {
      var H;
      return (M.id || M.ID) === ((H = ke == null ? void 0 : ke.metadata) == null ? void 0 : H.currentVersionId);
    }
  )) == null ? void 0 : qo.version_number) ?? null;
  return /* @__PURE__ */ F(
    "div",
    {
      style: { flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", padding: "0 16px" },
      onClick: () => Bt && mt(null),
      children: [
        Bt && ha.createPortal(
          /* @__PURE__ */ b(
            "div",
            {
              className: "attr-ctx-menu",
              style: { top: Bt.y, left: Bt.x },
              onClick: (M) => M.stopPropagation(),
              children: /* @__PURE__ */ F(
                "button",
                {
                  className: "attr-ctx-item",
                  onClick: () => {
                    _ == null || _(Bt.attrId, Bt.attrLabel), mt(null);
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
              (ca || Xn || Io) && /* @__PURE__ */ F("span", { style: {
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
                ca ? /* @__PURE__ */ b(ca, { size: 11, color: Xn || "var(--muted)", strokeWidth: 2 }) : Xn ? /* @__PURE__ */ b("span", { style: { width: 7, height: 7, borderRadius: 1, background: Xn, display: "inline-block" } }) : null,
                Io
              ] }),
              /* @__PURE__ */ b("span", { className: "node-identity", children: ((jo = ye.metadata) == null ? void 0 : jo.logicalId) || ye.title }),
              ye.subtitle && /* @__PURE__ */ b("span", { className: "node-display-name", children: ye.subtitle }),
              /* @__PURE__ */ F("span", { style: {
                fontFamily: "var(--mono)",
                fontSize: 13,
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: 4,
                letterSpacing: ".01em",
                color: we ? "#92400e" : "var(--muted)",
                background: we ? "rgba(251,191,36,.25)" : "rgba(100,116,139,.1)",
                border: we ? "1px solid rgba(251,191,36,.5)" : "none"
              }, children: [
                we && "🕐 ",
                ((Ko = ye.metadata) == null ? void 0 : Ko.iteration) === 0 ? ($o = ye.metadata) == null ? void 0 : $o.revision : `${(Zo = ye.metadata) == null ? void 0 : Zo.revision}.${(Qo = ye.metadata) == null ? void 0 : Qo.iteration}`
              ] }),
              /* @__PURE__ */ b(Di, { stateId: (Jo = ye.metadata) == null ? void 0 : Jo.state, stateName: (el = ye.metadata) == null ? void 0 : el.stateName, stateColorMap: s }),
              !we && ((nl = (tl = ke.metadata) == null ? void 0 : tl.lock) == null ? void 0 : nl.locked) && /* @__PURE__ */ F("span", { className: "pill", style: { color: "var(--muted)", background: "rgba(100,116,139,.1)", border: "1px solid rgba(100,116,139,.2)" }, children: [
                "🔒 ",
                (rl = (il = ke.metadata) == null ? void 0 : il.lock) == null ? void 0 : rl.lockedBy
              ] })
            ] }),
            /* @__PURE__ */ F("div", { className: "node-meta", children: [
              ra && ((al = (sl = ye == null ? void 0 : ye.metadata) == null ? void 0 : sl.lock) == null ? void 0 : al.lockedBy) === t && /* @__PURE__ */ b("span", { className: "pill", style: { color: "var(--warn)", background: "rgba(232,169,71,.1)", border: "1px solid rgba(232,169,71,.25)" }, children: "✎ editing" }),
              ra && ((ll = (ol = ye == null ? void 0 : ye.metadata) == null ? void 0 : ol.lock) == null ? void 0 : ll.lockedBy) === t && /* @__PURE__ */ b("span", { style: { fontSize: 11, color: "var(--warn)", fontStyle: "italic", opacity: 0.85 }, children: "⚡ uncommitted changes" }),
              ra && ((dl = (cl = ye == null ? void 0 : ye.metadata) == null ? void 0 : cl.lock) == null ? void 0 : dl.lockedBy) && ((ul = (hl = ye == null ? void 0 : ye.metadata) == null ? void 0 : hl.lock) == null ? void 0 : ul.lockedBy) !== t && /* @__PURE__ */ F("span", { style: { fontSize: 11, color: "var(--accent)", fontStyle: "italic", opacity: 0.9 }, children: [
                "✎ in progress — being edited by ",
                (pl = (fl = ye.metadata) == null ? void 0 : fl.lock) == null ? void 0 : pl.lockedBy
              ] }),
              J === "saving" && /* @__PURE__ */ b("span", { style: { fontSize: 11, color: "var(--muted)", fontStyle: "italic" }, children: "saving…" }),
              J === "saved" && ve.length === 0 && /* @__PURE__ */ b("span", { style: { fontSize: 11, color: "var(--success)" }, children: "✓ saved" }),
              J === "saved" && ve.length > 0 && /* @__PURE__ */ b("span", { style: { fontSize: 11, color: "var(--warn)" }, children: "⚠ saved with issues" })
            ] })
          ] }),
          /* @__PURE__ */ b("div", { className: "node-actions", children: Ro.map((M) => {
            var _e, lt, ut;
            const H = Co(M), Z = H ? Po(M) : M.description || M.label, ee = (_e = M.metadata) == null ? void 0 : _e.displayColor, se = ee ? "" : ((lt = M.metadata) == null ? void 0 : lt.displayCategory) === "DANGEROUS" ? "btn-danger" : ((ut = M.metadata) == null ? void 0 : ut.displayCategory) === "PRIMARY" ? "btn-success" : "", fe = ee ? { color: ee, borderColor: `${ee}60`, background: `${ee}15` } : void 0;
            return /* @__PURE__ */ b(
              "button",
              {
                className: `btn btn-sm ${se}`,
                disabled: tt || H,
                title: Z,
                style: { ...fe, ...H ? { opacity: 0.45, cursor: "not-allowed" } : {} },
                onClick: () => !H && na(M),
                children: H ? `✕ ${M.label}` : M.label
              },
              M.code
            );
          }) })
        ] }),
        be && ha.createPortal(
          /* @__PURE__ */ b("div", { style: {
            position: "fixed",
            inset: 0,
            zIndex: 2e3,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }, onClick: nt === null ? () => ue(null) : void 0, children: /* @__PURE__ */ F("div", { style: {
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "28px 32px",
            maxWidth: 440,
            width: "90%",
            boxShadow: "0 8px 32px rgba(0,0,0,.4)"
          }, onClick: (M) => M.stopPropagation(), children: [
            /* @__PURE__ */ b("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 16 }, children: be.label }),
            nt !== null && /* @__PURE__ */ F("div", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ F("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 6 }, children: [
                /* @__PURE__ */ b("span", { children: "Uploading…" }),
                /* @__PURE__ */ F("span", { children: [
                  nt,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ b("div", { style: { height: 6, background: "var(--surface2)", borderRadius: 3, overflow: "hidden" }, children: /* @__PURE__ */ b("div", { style: { height: "100%", width: `${nt}%`, background: "var(--accent)", borderRadius: 3, transition: "width 0.15s ease" } }) })
            ] }),
            (be.parameters || []).filter((M) => M.widget).map((M) => {
              var ee;
              const H = Je[M.name] || "";
              let Z = null;
              return ((ee = M.options) == null ? void 0 : ee.length) > 0 && (Z = M.options), /* @__PURE__ */ F("div", { className: "field", style: { marginBottom: 14 }, children: [
                /* @__PURE__ */ F("label", { className: "field-label", children: [
                  M.label || M.name,
                  M.required && /* @__PURE__ */ b("span", { className: "field-req", children: "*" })
                ] }),
                M.widget === "FILE" ? /* @__PURE__ */ F(Xr, { children: [
                  /* @__PURE__ */ b(
                    "input",
                    {
                      type: "file",
                      style: { color: "var(--text)" },
                      onChange: (se) => Ve((fe) => {
                        var _e;
                        return { ...fe, [M.name]: ((_e = se.target.files) == null ? void 0 : _e[0]) || null };
                      })
                    }
                  ),
                  M.hint && /* @__PURE__ */ b("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 4 }, children: M.hint })
                ] }) : Z ? /* @__PURE__ */ F(
                  "select",
                  {
                    className: "field-input",
                    value: H,
                    onChange: (se) => Ve((fe) => ({ ...fe, [M.name]: se.target.value })),
                    children: [
                      !H && /* @__PURE__ */ b("option", { value: "", children: "—" }),
                      Z.map((se) => {
                        const fe = typeof se == "object" && se !== null ? se.value : se, _e = typeof se == "object" && se !== null ? se.label : se;
                        return /* @__PURE__ */ b("option", { value: fe, children: _e }, fe);
                      })
                    ]
                  }
                ) : M.widget === "TEXTAREA" ? /* @__PURE__ */ b(
                  "textarea",
                  {
                    className: "field-input",
                    rows: 3,
                    placeholder: M.hint || "",
                    value: H,
                    onChange: (se) => Ve((fe) => ({ ...fe, [M.name]: se.target.value })),
                    style: { resize: "vertical" }
                  }
                ) : M.widget === "CHECKBOX" ? /* @__PURE__ */ F("label", { style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }, children: [
                  /* @__PURE__ */ b(
                    "input",
                    {
                      type: "checkbox",
                      checked: Je[M.name] === "true",
                      onChange: (se) => Ve((fe) => ({ ...fe, [M.name]: se.target.checked ? "true" : "false" }))
                    }
                  ),
                  M.hint && /* @__PURE__ */ b("span", { style: { fontSize: 12, color: "var(--muted)" }, children: M.hint })
                ] }) : /* @__PURE__ */ b(
                  "input",
                  {
                    className: "field-input",
                    placeholder: M.hint || "",
                    value: H,
                    onChange: (se) => Ve((fe) => ({ ...fe, [M.name]: se.target.value }))
                  }
                )
              ] }, M.name);
            }),
            /* @__PURE__ */ F("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }, children: [
              /* @__PURE__ */ b("button", { className: "btn btn-sm", disabled: nt !== null, onClick: () => ue(null), children: "Cancel" }),
              /* @__PURE__ */ b(
                "button",
                {
                  className: "btn btn-sm btn-success",
                  disabled: nt !== null || (be.parameters || []).filter((M) => M.widget && M.required).some((M) => {
                    const H = Je[M.name];
                    return M.widget === "FILE" ? !H : !String(H || "").trim();
                  }),
                  onClick: () => To(be, Je),
                  children: be.label
                }
              )
            ] })
          ] }) }),
          document.body
        ),
        it && yt && ha.createPortal(
          /* @__PURE__ */ b(
            "div",
            {
              style: { position: "fixed", inset: 0, zIndex: 2e3, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center" },
              onClick: (M) => {
                M.target === M.currentTarget && Oe(!1);
              },
              children: /* @__PURE__ */ F(
                "div",
                {
                  style: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "28px 32px", maxWidth: 560, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,.4)" },
                  onClick: (M) => M.stopPropagation(),
                  children: [
                    /* @__PURE__ */ b("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 16 }, children: "CAD Import" }),
                    /* @__PURE__ */ b(
                      Q_,
                      {
                        jobData: it.data,
                        onClose: () => {
                          var H, Z;
                          (((H = it.data.job) == null ? void 0 : H.status) === "DONE" || ((Z = it.data.job) == null ? void 0 : Z.status) === "FAILED") && (C.remove(it.id), rt(null)), Oe(!1);
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
        ve.length > 0 && /* @__PURE__ */ F("div", { className: "violations-banner", children: [
          /* @__PURE__ */ F(
            "div",
            {
              className: "violations-banner-header",
              style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
              onClick: () => ki((M) => !M),
              children: [
                /* @__PURE__ */ b("span", { className: "violations-banner-title", children: "⚠ Will fail at commit" }),
                /* @__PURE__ */ F("span", { style: { fontSize: 11, opacity: 0.75 }, children: [
                  "(",
                  ve.length,
                  " issue",
                  ve.length > 1 ? "s" : "",
                  ")"
                ] }),
                /* @__PURE__ */ b("span", { style: { fontSize: 10, marginLeft: "auto", opacity: 0.6 }, children: fn ? "▾ show" : "▴ hide" })
              ]
            }
          ),
          !fn && /* @__PURE__ */ b("ul", { className: "violations-banner-list", children: ve.map((M, H) => /* @__PURE__ */ b("li", { children: typeof M == "string" ? M : M.message }, H)) })
        ] }),
        /* @__PURE__ */ b("div", { className: "subtabs", children: [
          { key: "attributes", label: "Properties" },
          { key: "pbs", label: "PBS", count: ne ? S.length + re.length : void 0 },
          { key: "history", label: "History", count: W.length }
        ].map(({ key: M, label: H, count: Z }) => /* @__PURE__ */ F(
          "div",
          {
            className: `subtab ${a === M ? "active" : ""}`,
            onClick: () => o(M),
            children: [
              H,
              Z > 0 && /* @__PURE__ */ b("span", { className: "subtab-badge", style: {
                background: "rgba(91,156,246,.15)",
                color: "var(--accent)"
              }, children: Z })
            ]
          },
          M
        )) }),
        we && /* @__PURE__ */ F("div", { style: {
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
            we,
            ht && ` (${((ml = ht.metadata) == null ? void 0 : ml.iteration) === 0 ? (gl = ht.metadata) == null ? void 0 : gl.revision : `${(_l = ht.metadata) == null ? void 0 : _l.revision}.${(vl = ht.metadata) == null ? void 0 : vl.iteration}`})`,
            Fi && " — loading…",
            " · read-only"
          ] }),
          /* @__PURE__ */ b("button", { className: "btn btn-sm", onClick: () => {
            Wt(null), un(null);
          }, children: "← Back to latest" })
        ] }),
        /* @__PURE__ */ F("div", { style: { flex: 1, overflow: "auto", minHeight: 0, display: "flex", flexDirection: "column" }, children: [
          a === "attributes" && (() => {
            var _e, lt, ut, Mt, le, Ne, ze, gt, Xe, Ae;
            const M = (ge) => {
              const _t = K[ge.id] !== void 0 ? K[ge.id] : ge.value || "", vt = ge.editable && !!sa, sn = ge.allowedValues ? (() => {
                try {
                  return JSON.parse(ge.allowedValues);
                } catch {
                  return [];
                }
              })() : null, rn = sn ? sn.map((kt) => typeof kt == "object" && kt !== null ? { value: kt.value, label: kt.label || kt.value } : { value: kt, label: kt }) : null, Ce = rn ? rn.map((kt) => kt.value) : null, je = ge.namingRegex ? (() => {
                try {
                  return new RegExp(ge.namingRegex);
                } catch {
                  return null;
                }
              })() : null, Nt = (_t || "").trim(), zt = !je || !Nt ? null : je.test(Nt), es = zt === !1, Gi = ge.required && K[ge.id] === "", Pr = Ce && K[ge.id] != null && K[ge.id] !== "" && !Ce.includes(K[ge.id]), Yn = jd[ge.id], El = Yn && Yn.code !== "NAMING_REGEX" && Yn.code !== "ENUM_NOT_ALLOWED" && !(Yn.code === "REQUIRED" && Gi) ? Yn : null;
              return /* @__PURE__ */ F(
                "div",
                {
                  className: "field",
                  onContextMenu: (kt) => {
                    kt.preventDefault(), mt({ attrId: ge.id, attrLabel: ge.label, x: kt.clientX, y: kt.clientY });
                  },
                  children: [
                    /* @__PURE__ */ F("label", { className: "field-label", children: [
                      ge.label,
                      ge.required && /* @__PURE__ */ b("span", { className: "field-req", children: "*" })
                    ] }),
                    rn ? /* @__PURE__ */ F(
                      "select",
                      {
                        className: "field-input",
                        title: ge.tooltip || void 0,
                        value: _t,
                        disabled: !vt,
                        onChange: (kt) => {
                          if (!vt) return;
                          const Lr = { ...K, [ge.id]: kt.target.value };
                          de(Lr), Ao(Lr, ti, sa);
                        },
                        children: [
                          /* @__PURE__ */ b("option", { value: "", children: "—" }),
                          rn.map((kt) => /* @__PURE__ */ b("option", { value: kt.value, children: kt.label }, kt.value))
                        ]
                      }
                    ) : /* @__PURE__ */ F("div", { className: "logical-id-wrap", children: [
                      /* @__PURE__ */ b(
                        "input",
                        {
                          className: `field-input${Gi || Pr || es || Yn ? " error" : zt === !0 ? " ok" : ""}`,
                          readOnly: !vt,
                          title: ge.tooltip || void 0,
                          placeholder: ge.tooltip || (ge.namingRegex ? `pattern: ${ge.namingRegex}` : ""),
                          value: _t,
                          onChange: (kt) => {
                            if (!vt) return;
                            const Lr = { ...K, [ge.id]: kt.target.value };
                            de(Lr), Ao(Lr, ti, sa);
                          }
                        }
                      ),
                      Nt && je && /* @__PURE__ */ b("span", { className: `logical-id-badge ${zt ? "ok" : "err"}`, children: zt ? "✓" : "✗" })
                    ] }),
                    !rn && ge.namingRegex && /* @__PURE__ */ F("div", { className: "logical-id-hint", children: [
                      /* @__PURE__ */ b("span", { className: "logical-id-hint-label", children: "Pattern" }),
                      /* @__PURE__ */ b("code", { className: "logical-id-hint-code", children: ge.namingRegex }),
                      !Nt && /* @__PURE__ */ b("span", { className: "logical-id-hint-idle", children: "start typing to validate" }),
                      Nt && zt === !1 && /* @__PURE__ */ b("span", { className: "logical-id-hint-err", children: "no match" }),
                      Nt && zt === !0 && /* @__PURE__ */ b("span", { className: "logical-id-hint-ok", children: "matches" })
                    ] }),
                    !ge.namingRegex && ge.tooltip && /* @__PURE__ */ b("span", { className: "field-hint", children: ge.tooltip }),
                    Gi && /* @__PURE__ */ b("span", { className: "field-hint error", children: "Required" }),
                    Pr && /* @__PURE__ */ b("span", { className: "field-hint error", children: "Value not in allowed list" }),
                    El && /* @__PURE__ */ b("span", { className: "field-hint error", children: El.message })
                  ]
                },
                ge.id
              );
            }, H = (ge) => {
              const _t = ge.reduce((vt, sn) => {
                const rn = sn.section || "General";
                return vt[rn] || (vt[rn] = []), vt[rn].push(sn), vt;
              }, {});
              return Object.entries(_t).map(([vt, sn]) => /* @__PURE__ */ F("div", { children: [
                /* @__PURE__ */ b("div", { className: "section-label", children: vt }),
                /* @__PURE__ */ b("div", { className: "attr-grid", children: [...sn].sort((rn, Ce) => (rn.displayOrder || 0) - (Ce.displayOrder || 0)).map(M) })
              ] }, vt));
            }, Z = On.domains.find((ge) => ge.id === wo), ee = (ge) => {
              if (!ge) return "";
              try {
                return new Date(ge).toLocaleString();
              } catch {
                return ge;
              }
            }, se = On.base.filter((ge) => (ge.section || "General") === "Identity"), fe = On.base.filter((ge) => (ge.section || "General") !== "Identity");
            return /* @__PURE__ */ F("div", { children: [
              /* @__PURE__ */ F("div", { children: [
                /* @__PURE__ */ b("div", { className: "section-label", children: "Identity" }),
                /* @__PURE__ */ F("div", { className: "attr-grid", children: [
                  /* @__PURE__ */ F("div", { className: "field", children: [
                    /* @__PURE__ */ b("label", { className: "field-label", children: ((_e = pn == null ? void 0 : pn.staticMetadata) == null ? void 0 : _e.logicalIdLabel) || ((lt = ye.metadata) == null ? void 0 : lt.logicalIdLabel) || "Identifier" }),
                    /* @__PURE__ */ b("input", { className: "field-input", readOnly: !0, value: ((ut = ye.metadata) == null ? void 0 : ut.logicalId) || "" })
                  ] }),
                  /* @__PURE__ */ F("div", { className: "field", children: [
                    /* @__PURE__ */ b("label", { className: "field-label", children: "External ID" }),
                    /* @__PURE__ */ b(
                      "input",
                      {
                        className: "field-input",
                        value: Be !== null ? Be : ((Mt = ye.metadata) == null ? void 0 : Mt.externalId) || "",
                        placeholder: "—",
                        onChange: (ge) => pt(ge.target.value),
                        onFocus: () => {
                          var ge;
                          return pt(((ge = ye.metadata) == null ? void 0 : ge.externalId) || "");
                        },
                        onBlur: async () => {
                          var _t;
                          if (Be === null) return;
                          const ge = Be.trim();
                          ge !== (((_t = ye.metadata) == null ? void 0 : _t.externalId) || "") && (await Vt.updateExternalId(t, e, ge).catch(() => {
                          }), await So()), pt(null);
                        }
                      }
                    )
                  ] }),
                  se.sort((ge, _t) => (ge.displayOrder || 0) - (_t.displayOrder || 0)).map(M),
                  /* @__PURE__ */ F("div", { className: "field", children: [
                    /* @__PURE__ */ b("label", { className: "field-label", children: "Technical ID" }),
                    /* @__PURE__ */ b("input", { className: "field-input", readOnly: !0, value: ((le = ye.metadata) == null ? void 0 : le.technicalId) || "", title: ((Ne = ye.metadata) == null ? void 0 : Ne.technicalId) || "" })
                  ] }),
                  /* @__PURE__ */ F("div", { className: "field", children: [
                    /* @__PURE__ */ b("label", { className: "field-label", children: "Creator" }),
                    /* @__PURE__ */ b("input", { className: "field-input", readOnly: !0, value: ((ze = ye.metadata) == null ? void 0 : ze.createdBy) || "" })
                  ] }),
                  /* @__PURE__ */ F("div", { className: "field", children: [
                    /* @__PURE__ */ b("label", { className: "field-label", children: "Created" }),
                    /* @__PURE__ */ b("input", { className: "field-input", readOnly: !0, value: ee((gt = ye.metadata) == null ? void 0 : gt.createdAt) })
                  ] }),
                  /* @__PURE__ */ F("div", { className: "field", children: [
                    /* @__PURE__ */ b("label", { className: "field-label", children: "Modified by" }),
                    /* @__PURE__ */ b("input", { className: "field-input", readOnly: !0, value: ((Xe = ye.metadata) == null ? void 0 : Xe.modifiedBy) || "" })
                  ] }),
                  /* @__PURE__ */ F("div", { className: "field", children: [
                    /* @__PURE__ */ b("label", { className: "field-label", children: "Last update" }),
                    /* @__PURE__ */ b("input", { className: "field-input", readOnly: !0, value: ee((Ae = ye.metadata) == null ? void 0 : Ae.lastUpdate) })
                  ] })
                ] })
              ] }),
              H(fe),
              (On.domains.length > 0 || aa.length > 0) && /* @__PURE__ */ F("div", { style: { marginTop: 16 }, children: [
                /* @__PURE__ */ F("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, children: [
                  /* @__PURE__ */ b("div", { className: "section-label", style: { marginBottom: 0 }, children: "Domains" }),
                  On.domains.length > 0 && /* @__PURE__ */ b("div", { className: "subtabs", style: { marginBottom: 0, flex: 1 }, children: On.domains.map((ge) => /* @__PURE__ */ F(
                    "div",
                    {
                      className: `subtab ${wo === ge.id ? "active" : ""}`,
                      onClick: () => ia(ge.id),
                      children: [
                        ge.name,
                        /* @__PURE__ */ b("span", { className: "subtab-badge", style: {
                          background: "rgba(91,156,246,.15)",
                          color: "var(--accent)"
                        }, children: ge.attrs.length })
                      ]
                    },
                    ge.id
                  )) }),
                  aa.length > 0 && /* @__PURE__ */ b("div", { style: { display: "flex", gap: 4, marginLeft: "auto", flexShrink: 0 }, children: aa.map((ge) => {
                    const _t = Co(ge), vt = ge.label;
                    return /* @__PURE__ */ b(
                      "button",
                      {
                        className: `btn btn-sm${_t ? " btn-disabled" : ""}`,
                        disabled: _t,
                        title: _t ? Po(ge) : ge.description || vt,
                        onClick: () => na(ge),
                        children: vt
                      },
                      ge.code
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
              className: Lt ? "pbs-drop-zone drag-over" : "pbs-drop-zone",
              onDragEnter: (M) => {
                U() && (M.preventDefault(), Ar.current++, bt(!0));
              },
              onDragOver: (M) => {
                U() && (M.preventDefault(), M.dataTransfer.dropEffect = "link");
              },
              onDragLeave: (M) => {
                Ar.current > 0 && Ar.current--, Ar.current === 0 && bt(!1);
              },
              onDrop: (M) => {
                var Z;
                M.preventDefault(), Ar.current = 0, bt(!1);
                const H = U();
                if (A(), !!H) {
                  if (!((Z = ke == null ? void 0 : ke.actions) != null && Z.some((ee) => ee.code === "create_link"))) {
                    l("You do not have write permission on this node", "error");
                    return;
                  }
                  H.nodeId && H.nodeId !== e && Eo(H);
                }
              },
              children: [
                Lt && /* @__PURE__ */ b("div", { className: "pbs-drop-hint", children: "Drop to create a link" }),
                ((xl = ye.actions) == null ? void 0 : xl.some((M) => M.code === "create_link")) && /* @__PURE__ */ b("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 8 }, children: /* @__PURE__ */ b("button", { className: "btn btn-sm", onClick: () => pe ? me(!1) : Eo(), children: pe ? "✕ Cancel" : "+ Add link" }) }),
                pe && (() => {
                  const M = Qe.find((le) => (le.id || le.ID) === Fe), H = (M == null ? void 0 : M.link_policy) || (M == null ? void 0 : M.LINK_POLICY) || null, Z = (M == null ? void 0 : M.target_source_id) || (M == null ? void 0 : M.TARGET_SOURCE_ID) || "SELF", ee = (M == null ? void 0 : M.target_type) || (M == null ? void 0 : M.TARGET_TYPE) || null, se = Ie[Z] || null, fe = Z === "SELF", _e = (M == null ? void 0 : M.link_logical_id_label) || (M == null ? void 0 : M.LINK_LOGICAL_ID_LABEL) || "Link ID", lt = (M == null ? void 0 : M.link_logical_id_pattern) || (M == null ? void 0 : M.LINK_LOGICAL_ID_PATTERN) || null, ut = !lt || !Le || new RegExp(`^(?:${lt})$`).test(Le), Mt = !!qe;
                  return /* @__PURE__ */ F("div", { ref: Qs, className: "link-panel", style: { flexWrap: "wrap", rowGap: 6 }, children: [
                    !ti && /* @__PURE__ */ b("div", { style: { width: "100%", fontSize: 11, color: "var(--warn)", marginBottom: 2 }, children: "⚡ No active transaction — one will be opened automatically on create" }),
                    /* @__PURE__ */ F("div", { style: { display: "flex", gap: 8, width: "100%", alignItems: "flex-end" }, children: [
                      /* @__PURE__ */ F("div", { className: "field", style: { margin: 0, flex: "0 0 180px" }, children: [
                        /* @__PURE__ */ b("label", { className: "field-label", children: "Link type" }),
                        /* @__PURE__ */ F(
                          "select",
                          {
                            className: "field-input",
                            value: Fe,
                            onChange: (le) => {
                              xe(le.target.value), He("");
                            },
                            children: [
                              /* @__PURE__ */ b("option", { value: "", children: "— select —" }),
                              Qe.map((le) => /* @__PURE__ */ b("option", { value: le.id || le.ID, children: le.name || le.NAME }, le.id || le.ID))
                            ]
                          }
                        )
                      ] }),
                      /* @__PURE__ */ F("div", { className: "field", style: { margin: 0, flex: 1 }, children: [
                        /* @__PURE__ */ F("label", { className: "field-label", children: [
                          "Target ",
                          se ? /* @__PURE__ */ F("span", { style: { opacity: 0.55, fontWeight: 400, fontSize: 10 }, children: [
                            "— source: ",
                            se.name,
                            se.versioned ? "" : " (immutable)"
                          ] }) : null
                        ] }),
                        /* @__PURE__ */ F("div", { style: { position: "relative" }, children: [
                          /* @__PURE__ */ b(
                            "input",
                            {
                              className: "field-input",
                              type: "text",
                              autoComplete: "off",
                              placeholder: fe ? ee ? `Search ${ee} by logical ID…` : "Search by logical ID…" : ee ? `${ee} key (UUID, path, …)` : "Target key",
                              value: qe,
                              onChange: (le) => {
                                const Ne = le.target.value;
                                Ye(Ne), z(-1), te(!0), bo(Z, ee, Ne);
                              },
                              onFocus: () => {
                                te(!0), bo(Z, ee, qe);
                              },
                              onBlur: () => setTimeout(() => te(!1), 150),
                              onKeyDown: (le) => {
                                if (!(!$ || St.length === 0))
                                  if (le.key === "ArrowDown")
                                    le.preventDefault(), z((Ne) => Math.min(Ne + 1, St.length - 1));
                                  else if (le.key === "ArrowUp")
                                    le.preventDefault(), z((Ne) => Math.max(Ne - 1, -1));
                                  else if (le.key === "Enter" && q >= 0) {
                                    le.preventDefault();
                                    const Ne = St[q];
                                    Ye(Ne.key || Ne.KEY || ""), te(!1), z(-1);
                                  } else le.key === "Escape" && (te(!1), z(-1));
                              }
                            }
                          ),
                          $ && St.length > 0 && /* @__PURE__ */ b("div", { className: "search-suggestions", children: St.map((le, Ne) => {
                            const ze = le.key || le.KEY || "", gt = le.label || le.LABEL || "";
                            return /* @__PURE__ */ F(
                              "div",
                              {
                                className: `search-sug-item${Ne === q ? " hi" : ""}`,
                                onMouseDown: () => {
                                  Ye(ze), te(!1), z(-1);
                                },
                                onMouseEnter: () => z(Ne),
                                children: [
                                  /* @__PURE__ */ b("span", { className: "sug-lid", children: ze }),
                                  gt && gt !== ze && /* @__PURE__ */ b("span", { className: "sug-dname", children: gt })
                                ]
                              },
                              ze
                            );
                          }) })
                        ] })
                      ] }),
                      H && /* @__PURE__ */ F("div", { className: "field", style: { margin: 0, flexShrink: 0 }, children: [
                        /* @__PURE__ */ b("label", { className: "field-label", children: "Policy" }),
                        /* @__PURE__ */ b(
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
                          _e,
                          lt && /* @__PURE__ */ F("span", { style: { marginLeft: 6, opacity: 0.55, fontWeight: 400, fontSize: 10 }, children: [
                            "pattern: ",
                            lt
                          ] })
                        ] }),
                        /* @__PURE__ */ b(
                          "input",
                          {
                            className: "field-input",
                            style: { borderColor: (!Le || !ut) && Fe ? "var(--danger, #e05252)" : void 0 },
                            type: "text",
                            placeholder: _e,
                            value: Le,
                            onChange: (le) => He(le.target.value)
                          }
                        ),
                        Le && !ut && /* @__PURE__ */ F("div", { style: { fontSize: 10, color: "var(--danger, #e05252)", marginTop: 2 }, children: [
                          "Does not match pattern: ",
                          lt
                        ] })
                      ] }),
                      /* @__PURE__ */ b(
                        "button",
                        {
                          className: "btn btn-primary btn-sm",
                          style: { alignSelf: "flex-end" },
                          disabled: !Fe || !Mt || !Le || !ut || Pt,
                          onClick: Zd,
                          children: Pt ? "…" : "Create"
                        }
                      )
                    ] })
                  ] });
                })(),
                /* @__PURE__ */ b("div", { className: "section-label", style: { marginTop: 16 }, children: "BOM — Children" }),
                ne ? S.length === 0 ? /* @__PURE__ */ F("div", { className: "empty", style: { padding: "24px" }, children: [
                  /* @__PURE__ */ b("div", { className: "empty-icon", children: "◌" }),
                  /* @__PURE__ */ b("div", { className: "empty-text", children: "No child links" })
                ] }) : (() => {
                  const M = [], H = /* @__PURE__ */ new Map();
                  return S.forEach((Z) => {
                    const ee = Z.linkTypeId || Z.linkTypeName || "?";
                    H.has(ee) || (H.set(ee, []), M.push(ee)), H.get(ee).push(Z);
                  }), M.map((Z) => {
                    const ee = H.get(Z), se = ee[0], fe = $r.get(Z), _e = (fe == null ? void 0 : fe.name) ?? se.linkTypeName ?? Z, ut = !se.targetSourceCode || se.targetSourceCode === "SELF" ? "Self" : se.sourceName || se.targetSourceCode || "External", Mt = la ? 7 : 6;
                    return /* @__PURE__ */ F(hr, { children: [
                      /* @__PURE__ */ F("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 12, marginBottom: 4 }, children: [
                        /* @__PURE__ */ b("span", { style: { fontSize: 12, fontWeight: 600 }, children: _e }),
                        /* @__PURE__ */ b("span", { style: { fontSize: 11, color: "var(--muted)", background: "var(--surface2, rgba(0,0,0,.06))", borderRadius: 3, padding: "1px 6px" }, children: ut })
                      ] }),
                      /* @__PURE__ */ F("table", { className: "history-table", children: [
                        /* @__PURE__ */ b("thead", { children: /* @__PURE__ */ F("tr", { children: [
                          /* @__PURE__ */ b("th", { children: "Link ID" }),
                          /* @__PURE__ */ b("th", { children: "Node type" }),
                          /* @__PURE__ */ b("th", { children: "Identity" }),
                          /* @__PURE__ */ b("th", { children: "Rev" }),
                          /* @__PURE__ */ b("th", { children: "State" }),
                          /* @__PURE__ */ b("th", { children: "Policy" }),
                          la && /* @__PURE__ */ b("th", {})
                        ] }) }),
                        /* @__PURE__ */ b("tbody", { children: ee.map((le) => {
                          var sn, rn;
                          const Ne = dt === le.linkId, ze = Zs === le.linkId, gt = !le.targetSourceCode || le.targetSourceCode === "SELF", Xe = gt ? null : v(le.targetSourceCode), Ae = $r.get(le.linkTypeId), ge = (Ae == null ? void 0 : Ae.attributes) ?? le.linkTypeAttributes ?? [], _t = (Ae == null ? void 0 : Ae.linkPolicy) ?? le.linkPolicy, vt = ((sn = Ae == null ? void 0 : Ae.staticMetadata) == null ? void 0 : sn.linkLogicalIdLabel) ?? le.linkLogicalIdLabel ?? "Link ID";
                          return /* @__PURE__ */ F(hr, { children: [
                            /* @__PURE__ */ F(
                              "tr",
                              {
                                className: O === le.linkId ? "link-selected" : "",
                                style: { cursor: "pointer" },
                                onClick: () => {
                                  const Ce = O === le.linkId ? null : le.linkId;
                                  G(Ce), i == null || i.emit({ type: "psm:link:selected", linkId: Ce });
                                },
                                children: [
                                  /* @__PURE__ */ b("td", { style: { fontFamily: "var(--sans)", fontSize: 12 }, children: Ne ? /* @__PURE__ */ b(
                                    "input",
                                    {
                                      className: "field-input",
                                      style: { padding: "2px 6px", fontSize: 12, width: 120 },
                                      value: Ot,
                                      onChange: (Ce) => tn(Ce.target.value),
                                      autoFocus: !0
                                    }
                                  ) : le.linkLogicalId ? /* @__PURE__ */ b("span", { title: vt, children: le.linkLogicalId }) : /* @__PURE__ */ b("span", { style: { opacity: 0.35 }, children: "—" }) }),
                                  gt ? /* @__PURE__ */ F(Xr, { children: [
                                    /* @__PURE__ */ b("td", { style: { color: "var(--muted)", fontSize: 12 }, children: le.targetNodeType }),
                                    /* @__PURE__ */ b("td", { style: { fontFamily: "var(--sans)", fontSize: 13 }, children: Ne ? /* @__PURE__ */ F("div", { style: { position: "relative" }, children: [
                                      /* @__PURE__ */ b(
                                        "input",
                                        {
                                          className: "field-input",
                                          style: { padding: "2px 4px", fontSize: 12, minWidth: 120 },
                                          type: "text",
                                          autoComplete: "off",
                                          placeholder: "target key…",
                                          value: Gt,
                                          onChange: (Ce) => {
                                            const je = Ce.target.value;
                                            $t(je), Zt(-1), nn(!0), Jr("SELF", le.targetNodeType, je);
                                          },
                                          onFocus: () => {
                                            nn(!0), Jr("SELF", le.targetNodeType, Gt);
                                          },
                                          onBlur: () => setTimeout(() => nn(!1), 150),
                                          onKeyDown: (Ce) => {
                                            !vi || hn.length === 0 || (Ce.key === "ArrowDown" ? (Ce.preventDefault(), Zt((je) => Math.min(je + 1, hn.length - 1))) : Ce.key === "ArrowUp" ? (Ce.preventDefault(), Zt((je) => Math.max(je - 1, -1))) : Ce.key === "Enter" && Dn >= 0 ? (Ce.preventDefault(), $t(hn[Dn].key || hn[Dn].KEY || ""), nn(!1), Zt(-1)) : Ce.key === "Escape" && (nn(!1), Zt(-1)));
                                          }
                                        }
                                      ),
                                      vi && hn.length > 0 && /* @__PURE__ */ b("div", { className: "search-suggestions", children: hn.map((Ce, je) => {
                                        const Nt = Ce.key || Ce.KEY || "", zt = Ce.label || Ce.LABEL || "";
                                        return /* @__PURE__ */ F(
                                          "div",
                                          {
                                            className: `search-sug-item${je === Dn ? " hi" : ""}`,
                                            onMouseDown: () => {
                                              $t(Nt), nn(!1), Zt(-1);
                                            },
                                            onMouseEnter: () => Zt(je),
                                            children: [
                                              /* @__PURE__ */ b("span", { className: "sug-lid", children: Nt }),
                                              zt && zt !== Nt && /* @__PURE__ */ b("span", { className: "sug-dname", children: zt })
                                            ]
                                          },
                                          Nt
                                        );
                                      }) })
                                    ] }) : le.targetLogicalId || /* @__PURE__ */ F("span", { style: { opacity: 0.4 }, children: [
                                      (rn = le.targetNodeId) == null ? void 0 : rn.slice(0, 8),
                                      "…"
                                    ] }) }),
                                    /* @__PURE__ */ b("td", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12 }, children: _t === "VERSION_TO_MASTER" ? /* @__PURE__ */ b("span", { style: { opacity: 0.35 }, children: "—" }) : `${le.targetRevision}.${le.targetIteration}` }),
                                    /* @__PURE__ */ b("td", { children: /* @__PURE__ */ b(Di, { stateId: le.targetState, stateName: le.targetStateName, stateColorMap: s }) }),
                                    /* @__PURE__ */ b("td", { children: /* @__PURE__ */ b("span", { className: "hist-type-badge", "data-type": _t, style: { fontSize: 10 }, children: _t === "VERSION_TO_MASTER" ? "V2M" : "V2V" }) })
                                  ] }) : Xe ? /* @__PURE__ */ b("td", { colSpan: 5, style: { verticalAlign: "middle" }, children: /* @__PURE__ */ b(
                                    Xe,
                                    {
                                      link: le,
                                      isEditing: Ne,
                                      editTargetKey: Gt,
                                      onEditTargetKey: $t
                                    }
                                  ) }) : /* @__PURE__ */ F(Xr, { children: [
                                    /* @__PURE__ */ b("td", { style: { color: "var(--muted)", fontSize: 12 }, children: le.targetNodeType || /* @__PURE__ */ b("span", { style: { opacity: 0.35 }, children: "—" }) }),
                                    /* @__PURE__ */ b("td", { style: { fontFamily: "var(--sans)", fontSize: 12 }, children: Ne ? /* @__PURE__ */ F("div", { style: { position: "relative" }, children: [
                                      /* @__PURE__ */ b(
                                        "input",
                                        {
                                          className: "field-input",
                                          style: { padding: "2px 4px", fontSize: 12, minWidth: 120 },
                                          type: "text",
                                          autoComplete: "off",
                                          placeholder: "target key…",
                                          value: Gt,
                                          onChange: (Ce) => {
                                            const je = Ce.target.value;
                                            $t(je), Zt(-1), nn(!0), Jr(le.targetSourceCode, le.targetNodeType, je);
                                          },
                                          onFocus: () => {
                                            nn(!0), Jr(le.targetSourceCode, le.targetNodeType, Gt);
                                          },
                                          onBlur: () => setTimeout(() => nn(!1), 150),
                                          onKeyDown: (Ce) => {
                                            !vi || hn.length === 0 || (Ce.key === "ArrowDown" ? (Ce.preventDefault(), Zt((je) => Math.min(je + 1, hn.length - 1))) : Ce.key === "ArrowUp" ? (Ce.preventDefault(), Zt((je) => Math.max(je - 1, -1))) : Ce.key === "Enter" && Dn >= 0 ? (Ce.preventDefault(), $t(hn[Dn].key || hn[Dn].KEY || ""), nn(!1), Zt(-1)) : Ce.key === "Escape" && (nn(!1), Zt(-1)));
                                          }
                                        }
                                      ),
                                      vi && hn.length > 0 && /* @__PURE__ */ b("div", { className: "search-suggestions", children: hn.map((Ce, je) => {
                                        const Nt = Ce.key || Ce.KEY || "", zt = Ce.label || Ce.LABEL || "";
                                        return /* @__PURE__ */ F(
                                          "div",
                                          {
                                            className: `search-sug-item${je === Dn ? " hi" : ""}`,
                                            onMouseDown: () => {
                                              $t(Nt), nn(!1), Zt(-1);
                                            },
                                            onMouseEnter: () => Zt(je),
                                            children: [
                                              /* @__PURE__ */ b("span", { className: "sug-lid", children: Nt }),
                                              zt && zt !== Nt && /* @__PURE__ */ b("span", { className: "sug-dname", children: zt })
                                            ]
                                          },
                                          Nt
                                        );
                                      }) })
                                    ] }) : le.displayKey || le.targetKey }),
                                    /* @__PURE__ */ b("td", {}),
                                    /* @__PURE__ */ b("td", {}),
                                    /* @__PURE__ */ b("td", { children: /* @__PURE__ */ b("span", { className: "hist-type-badge", "data-type": _t, style: { fontSize: 10 }, children: _t === "VERSION_TO_MASTER" ? "V2M" : "V2V" }) })
                                  ] }),
                                  la && /* @__PURE__ */ b("td", { style: { whiteSpace: "nowrap" }, onClick: (Ce) => Ce.stopPropagation(), children: ze ? /* @__PURE__ */ F("span", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
                                    /* @__PURE__ */ b("span", { style: { fontSize: 11, color: "var(--danger, #e05252)", marginRight: 2 }, children: "Delete?" }),
                                    /* @__PURE__ */ b(
                                      "button",
                                      {
                                        className: "btn btn-sm btn-danger",
                                        style: { padding: "1px 6px", fontSize: 11 },
                                        disabled: he,
                                        onClick: () => Jd(le.linkId),
                                        children: "✓"
                                      }
                                    ),
                                    /* @__PURE__ */ b(
                                      "button",
                                      {
                                        className: "btn btn-sm",
                                        style: { padding: "1px 6px", fontSize: 11 },
                                        onClick: () => T(null),
                                        children: "✕"
                                      }
                                    )
                                  ] }) : Ne ? /* @__PURE__ */ F("span", { style: { display: "flex", gap: 4 }, children: [
                                    /* @__PURE__ */ b(
                                      "button",
                                      {
                                        className: "btn btn-sm btn-success",
                                        style: { padding: "1px 6px", fontSize: 11 },
                                        disabled: he,
                                        onClick: () => Qd(le.linkId, Ot, Gt, Rn),
                                        children: "✓"
                                      }
                                    ),
                                    /* @__PURE__ */ b(
                                      "button",
                                      {
                                        className: "btn btn-sm",
                                        style: { padding: "1px 6px", fontSize: 11 },
                                        onClick: () => wt(null),
                                        children: "✕"
                                      }
                                    )
                                  ] }) : /* @__PURE__ */ F("span", { style: { display: "flex", gap: 4 }, children: [
                                    (Hi || oa) && /* @__PURE__ */ b(
                                      "button",
                                      {
                                        className: "btn btn-sm",
                                        style: { padding: "1px 6px", fontSize: 11, ...Hi ? {} : { opacity: 0.35, cursor: "not-allowed" } },
                                        title: Hi ? "Edit link" : "Checkout to edit",
                                        disabled: !Hi,
                                        onClick: Hi ? () => {
                                          wt(le.linkId), tn(le.linkLogicalId || ""), $t(le.targetLogicalId || le.targetKey || "");
                                          const Ce = {};
                                          (le.linkAttributeValues || []).forEach((je) => {
                                            Ce[je.attributeId] = je.value || "";
                                          }), bn(Ce), Wn([]), nn(!1), Zt(-1), T(null);
                                        } : void 0,
                                        children: "✎"
                                      }
                                    ),
                                    (xi || oa) && /* @__PURE__ */ b(
                                      "button",
                                      {
                                        className: "btn btn-sm",
                                        style: { padding: "1px 6px", fontSize: 11, color: xi ? "var(--danger, #e05252)" : void 0, ...xi ? {} : { opacity: 0.35, cursor: "not-allowed" } },
                                        title: xi ? "Delete link" : "Checkout to delete",
                                        disabled: !xi,
                                        onClick: xi ? () => {
                                          T(le.linkId), wt(null);
                                        } : void 0,
                                        children: "✕"
                                      }
                                    )
                                  ] }) })
                                ]
                              }
                            ),
                            O === le.linkId && !Ne && (() => {
                              const Ce = {};
                              return (le.linkAttributeValues || []).forEach((je) => {
                                Ce[je.attributeId] = je.value;
                              }), /* @__PURE__ */ b("tr", { className: "link-detail-expand", onClick: (je) => je.stopPropagation(), children: /* @__PURE__ */ b("td", { colSpan: Mt, children: /* @__PURE__ */ b("div", { className: "link-detail-inner", children: ge.length === 0 ? /* @__PURE__ */ b("span", { style: { fontSize: 11, opacity: 0.5 }, children: "No attributes defined for this link type." }) : /* @__PURE__ */ b("div", { style: { display: "flex", flexWrap: "wrap", gap: 12 }, children: ge.map((je) => /* @__PURE__ */ F("div", { style: { flex: je.dataType === "POSITION" ? "1 1 100%" : "1 1 160px", minWidth: 120 }, children: [
                                /* @__PURE__ */ b("div", { style: { fontSize: 10, color: "var(--muted)", marginBottom: 4 }, children: je.label || je.name }),
                                je.dataType === "POSITION" ? /* @__PURE__ */ b(Qa, { value: Ce[je.name], readOnly: !0 }) : /* @__PURE__ */ b("div", { style: { fontSize: 12 }, children: Ce[je.name] != null ? Ce[je.name] : /* @__PURE__ */ b("span", { style: { opacity: 0.35 }, children: "—" }) })
                              ] }, je.name)) }) }) }) });
                            })(),
                            Ne && ge.length > 0 && /* @__PURE__ */ b("tr", { children: /* @__PURE__ */ b("td", { colSpan: Mt, style: { padding: "4px 8px 8px", background: "var(--surface2, rgba(0,0,0,.04))" }, children: /* @__PURE__ */ b("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }, children: ge.map((Ce) => /* @__PURE__ */ F("div", { className: "field", style: { margin: 0, flex: Ce.dataType === "POSITION" ? "1 1 100%" : "1 1 160px", minWidth: 120 }, children: [
                              /* @__PURE__ */ F("label", { className: "field-label", style: { fontSize: 10 }, children: [
                                Ce.label || Ce.name,
                                Ce.required && /* @__PURE__ */ b("span", { className: "field-req", children: "*" })
                              ] }),
                              Ce.dataType === "POSITION" ? /* @__PURE__ */ b(
                                Qa,
                                {
                                  value: Rn[Ce.name] || "",
                                  onChange: (je) => {
                                    bn((zt) => ({ ...zt, [Ce.name]: je }));
                                    const Nt = je.split(",").map(Number);
                                    Nt.length === 16 && Nt.every((zt) => !isNaN(zt)) && (i == null || i.emit({ type: "psm:link:positionChange", linkId: dt, matrix: Nt }));
                                  }
                                }
                              ) : /* @__PURE__ */ b(
                                "input",
                                {
                                  className: "field-input",
                                  style: { padding: "2px 6px", fontSize: 12 },
                                  value: Rn[Ce.name] || "",
                                  onChange: (je) => bn((Nt) => ({ ...Nt, [Ce.name]: je.target.value })),
                                  placeholder: Ce.label || Ce.name
                                }
                              )
                            ] }, Ce.name)) }) }) })
                          ] }, le.linkId);
                        }) })
                      ] })
                    ] }, Z);
                  });
                })() : /* @__PURE__ */ F("div", { className: "empty", style: { padding: "24px" }, children: [
                  /* @__PURE__ */ b("div", { className: "empty-icon", children: "◎" }),
                  /* @__PURE__ */ b("div", { className: "empty-text", children: "Loading…" })
                ] }),
                /* @__PURE__ */ b("div", { className: "section-label", style: { marginTop: 24 }, children: "Where Used — Parents" }),
                ne ? re.length === 0 ? /* @__PURE__ */ F("div", { className: "empty", style: { padding: "24px" }, children: [
                  /* @__PURE__ */ b("div", { className: "empty-icon", children: "◌" }),
                  /* @__PURE__ */ b("div", { className: "empty-text", children: "Not used anywhere" })
                ] }) : (() => {
                  const M = [], H = /* @__PURE__ */ new Map();
                  return re.forEach((Z) => {
                    const ee = Z.linkTypeId || Z.linkTypeName || "?";
                    H.has(ee) || (H.set(ee, []), M.push(ee)), H.get(ee).push(Z);
                  }), M.map((Z) => {
                    var fe;
                    const ee = $r.get(Z), se = (ee == null ? void 0 : ee.name) ?? ((fe = H.get(Z)[0]) == null ? void 0 : fe.linkTypeName) ?? Z;
                    return /* @__PURE__ */ F(hr, { children: [
                      /* @__PURE__ */ F("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 12, marginBottom: 4 }, children: [
                        /* @__PURE__ */ b("span", { style: { fontSize: 12, fontWeight: 600 }, children: se }),
                        /* @__PURE__ */ b("span", { style: { fontSize: 11, color: "var(--muted)", background: "var(--surface2, rgba(0,0,0,.06))", borderRadius: 3, padding: "1px 6px" }, children: "Self" })
                      ] }),
                      /* @__PURE__ */ F("table", { className: "history-table", children: [
                        /* @__PURE__ */ b("thead", { children: /* @__PURE__ */ F("tr", { children: [
                          /* @__PURE__ */ b("th", { children: "Link ID" }),
                          /* @__PURE__ */ b("th", { children: "Node type" }),
                          /* @__PURE__ */ b("th", { children: "Identity" }),
                          /* @__PURE__ */ b("th", { children: "Rev" }),
                          /* @__PURE__ */ b("th", { children: "State" }),
                          /* @__PURE__ */ b("th", { children: "Policy" })
                        ] }) }),
                        /* @__PURE__ */ b("tbody", { children: H.get(Z).map((_e) => {
                          var Ne, ze;
                          const lt = X === _e.linkId, ut = $r.get(_e.linkTypeId), Mt = (ut == null ? void 0 : ut.linkPolicy) ?? _e.linkPolicy, le = ((Ne = ut == null ? void 0 : ut.staticMetadata) == null ? void 0 : Ne.linkLogicalIdLabel) ?? _e.linkLogicalIdLabel ?? "Link ID";
                          return /* @__PURE__ */ F(hr, { children: [
                            /* @__PURE__ */ F(
                              "tr",
                              {
                                className: lt ? "link-selected" : "",
                                style: { cursor: "pointer" },
                                onClick: () => B((gt) => gt === _e.linkId ? null : _e.linkId),
                                children: [
                                  /* @__PURE__ */ b("td", { style: { fontFamily: "var(--sans)", fontSize: 12 }, children: _e.linkLogicalId ? /* @__PURE__ */ b("span", { title: le, children: _e.linkLogicalId }) : /* @__PURE__ */ b("span", { style: { opacity: 0.35 }, children: "—" }) }),
                                  /* @__PURE__ */ b("td", { style: { color: "var(--muted)", fontSize: 12 }, children: _e.sourceNodeType }),
                                  /* @__PURE__ */ b("td", { style: { fontFamily: "var(--sans)", fontSize: 13 }, children: _e.sourceLogicalId || /* @__PURE__ */ F("span", { style: { opacity: 0.4 }, children: [
                                    (ze = _e.sourceNodeId) == null ? void 0 : ze.slice(0, 8),
                                    "…"
                                  ] }) }),
                                  /* @__PURE__ */ b("td", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12 }, children: Mt === "VERSION_TO_MASTER" ? /* @__PURE__ */ b("span", { style: { opacity: 0.35 }, children: "—" }) : `${_e.sourceRevision}.${_e.sourceIteration}` }),
                                  /* @__PURE__ */ b("td", { children: /* @__PURE__ */ b(Di, { stateId: _e.sourceState, stateName: _e.sourceStateName, stateColorMap: s }) }),
                                  /* @__PURE__ */ b("td", { children: /* @__PURE__ */ b("span", { className: "hist-type-badge", "data-type": Mt, style: { fontSize: 10 }, children: Mt === "VERSION_TO_MASTER" ? "V2M" : "V2V" }) })
                                ]
                              }
                            ),
                            lt && (() => {
                              const gt = (ut == null ? void 0 : ut.attributes) ?? _e.linkTypeAttributes ?? [], Xe = {};
                              return (_e.linkAttributeValues || []).forEach((Ae) => {
                                Xe[Ae.attributeId] = Ae.value;
                              }), /* @__PURE__ */ b("tr", { className: "link-detail-expand", onClick: (Ae) => Ae.stopPropagation(), children: /* @__PURE__ */ b("td", { colSpan: 6, children: /* @__PURE__ */ b("div", { className: "link-detail-inner", children: gt.length === 0 ? /* @__PURE__ */ b("span", { style: { fontSize: 11, opacity: 0.5 }, children: "No attributes defined for this link type." }) : /* @__PURE__ */ b("div", { style: { display: "flex", flexWrap: "wrap", gap: 12 }, children: gt.map((Ae) => /* @__PURE__ */ F("div", { style: { flex: Ae.dataType === "POSITION" ? "1 1 100%" : "1 1 160px", minWidth: 120 }, children: [
                                /* @__PURE__ */ b("div", { style: { fontSize: 10, color: "var(--muted)", marginBottom: 4 }, children: Ae.label || Ae.name }),
                                Ae.dataType === "POSITION" ? /* @__PURE__ */ b(Qa, { value: Xe[Ae.name], readOnly: !0 }) : /* @__PURE__ */ b("div", { style: { fontSize: 12 }, children: Xe[Ae.name] != null ? Xe[Ae.name] : /* @__PURE__ */ b("span", { style: { opacity: 0.35 }, children: "—" }) })
                              ] }, Ae.name)) }) }) }) });
                            })()
                          ] }, _e.linkId);
                        }) })
                      ] })
                    ] }, Z);
                  });
                })() : /* @__PURE__ */ F("div", { className: "empty", style: { padding: "24px" }, children: [
                  /* @__PURE__ */ b("div", { className: "empty-icon", children: "◎" }),
                  /* @__PURE__ */ b("div", { className: "empty-text", children: "Loading…" })
                ] })
              ]
            }
          ),
          a === "history" && /* @__PURE__ */ F("div", { children: [
            /* @__PURE__ */ F("div", { className: "history-lc-section", children: [
              /* @__PURE__ */ b("div", { className: "history-lc-label", children: "Lifecycle" }),
              /* @__PURE__ */ b(
                V,
                {
                  lifecycleId: ((yl = pn == null ? void 0 : pn.staticMetadata) == null ? void 0 : yl.lifecycleId) || ((Sl = ye.metadata) == null ? void 0 : Sl.lifecycleId),
                  currentStateId: (Ml = ye.metadata) == null ? void 0 : Ml.state,
                  userId: t,
                  availableTransitionNames: new Set(
                    Lo.filter((M) => {
                      var H;
                      return !((H = M.guardViolations) != null && H.length);
                    }).map((M) => M.label)
                  ),
                  transitionGuardViolations: ih,
                  onTransition: (M) => {
                    var ee;
                    const H = M.name || M.NAME || "", Z = Lo.find((se) => se.label === H);
                    Z && !((ee = Z.guardViolations) != null && ee.length) && na(Z);
                  }
                }
              )
            ] }),
            /* @__PURE__ */ b("div", { className: "history-lc-divider", children: /* @__PURE__ */ b("span", { children: "Version history" }) }),
            W.length === 0 ? /* @__PURE__ */ F("div", { className: "empty", children: [
              /* @__PURE__ */ b("div", { className: "empty-icon", children: "◌" }),
              /* @__PURE__ */ b("div", { className: "empty-text", children: "No history yet" })
            ] }) : /* @__PURE__ */ F("table", { className: "history-table", children: [
              /* @__PURE__ */ b("thead", { children: /* @__PURE__ */ F("tr", { children: [
                /* @__PURE__ */ b("th", { children: "#" }),
                /* @__PURE__ */ b("th", { children: "Rev" }),
                /* @__PURE__ */ b("th", { children: "State" }),
                /* @__PURE__ */ b("th", { children: "Type" }),
                /* @__PURE__ */ b("th", { children: "Commit message" }),
                /* @__PURE__ */ b("th", { children: "By" }),
                /* @__PURE__ */ b("th", { children: "Date" }),
                /* @__PURE__ */ b("th", { children: "Fingerprint" }),
                /* @__PURE__ */ b("th", { children: "TX" }),
                /* @__PURE__ */ b("th", {})
              ] }) }),
              /* @__PURE__ */ b("tbody", { children: [...W].reverse().map((M, H, Z) => {
                var Xe, Ae;
                const ee = M.fingerprint || M.FINGERPRINT || null, se = M.tx_id || M.TX_ID || null, fe = Z[H + 1] ? Z[H + 1].fingerprint || Z[H + 1].FINGERPRINT : null, _e = Z[H + 1] ? Z[H + 1].tx_id || Z[H + 1].TX_ID : null, lt = ee && fe && ee !== fe, ut = ee && !fe, Mt = M.committed_at || M.COMMITTED_AT, le = M.version_number || M.VERSION_NUMBER, Ne = (M.tx_status || M.TX_STATUS) === "OPEN", ze = H === Z.length - 1, gt = we === le;
                return /* @__PURE__ */ F("tr", { className: [Ne ? "pending-row" : "", gt ? "historical-row" : ""].filter(Boolean).join(" ") || void 0, children: [
                  /* @__PURE__ */ F("td", { children: [
                    /* @__PURE__ */ b("span", { className: "ver-num", children: le }),
                    Ne && /* @__PURE__ */ b("span", { className: "pending-badge", children: "pending" })
                  ] }),
                  /* @__PURE__ */ b("td", { style: { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 12 }, children: (M.iteration ?? M.ITERATION) === 0 ? M.revision || M.REVISION : `${M.revision || M.REVISION}.${M.iteration ?? M.ITERATION}` }),
                  /* @__PURE__ */ b("td", { children: /* @__PURE__ */ b("span", { className: "hist-state", children: M.state_name || M.STATE_NAME || "—" }) }),
                  /* @__PURE__ */ b("td", { children: Ne ? /* @__PURE__ */ b("span", { className: "hist-type-badge", "data-type": M.change_type || M.CHANGE_TYPE, style: { opacity: 0.6 }, children: M.change_type || M.CHANGE_TYPE }) : /* @__PURE__ */ b("span", { className: "hist-type-badge", "data-type": M.change_type || M.CHANGE_TYPE, children: M.change_type || M.CHANGE_TYPE }) }),
                  /* @__PURE__ */ b("td", { className: "hist-comment", title: M.tx_comment || M.TX_COMMENT || "", children: Ne ? /* @__PURE__ */ b("span", { style: { color: "var(--warn)", fontStyle: "italic", opacity: 0.7 }, children: "uncommitted" }) : M.tx_comment || M.TX_COMMENT || /* @__PURE__ */ b("span", { style: { opacity: 0.4 }, children: "—" }) }),
                  /* @__PURE__ */ b("td", { className: "hist-by", children: M.created_by || M.CREATED_BY || M.tx_owner || "—" }),
                  /* @__PURE__ */ b("td", { className: "hist-date", children: Ne ? /* @__PURE__ */ b("span", { style: { color: "var(--warn)", fontStyle: "italic" }, children: "—" }) : Mt ? new Date(Mt).toLocaleDateString() : "—" }),
                  /* @__PURE__ */ b("td", { children: ee ? /* @__PURE__ */ F(
                    "span",
                    {
                      className: "hist-fp",
                      title: ee,
                      style: { color: Ne ? "var(--warn)" : ut || lt ? "var(--success)" : "var(--muted2)", opacity: Ne ? 0.6 : 1 },
                      children: [
                        ee.slice(0, 8),
                        "…"
                      ]
                    }
                  ) : /* @__PURE__ */ b("span", { style: { opacity: 0.3 }, children: "—" }) }),
                  /* @__PURE__ */ b("td", { children: se ? /* @__PURE__ */ F(
                    "span",
                    {
                      className: "hist-fp",
                      title: se,
                      style: { color: Ne ? "var(--warn)" : se !== _e ? "var(--accent)" : "var(--muted2)", fontFamily: "var(--mono)", opacity: Ne ? 0.6 : 1 },
                      children: [
                        se.slice(0, 8),
                        "…"
                      ]
                    }
                  ) : /* @__PURE__ */ b("span", { style: { opacity: 0.3 }, children: "—" }) }),
                  /* @__PURE__ */ F("td", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
                    /* @__PURE__ */ F("div", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
                      !ze && /* @__PURE__ */ b(
                        "button",
                        {
                          className: "btn-diff",
                          title: `Diff v${((Xe = Z[H + 1]) == null ? void 0 : Xe.version_number) || ((Ae = Z[H + 1]) == null ? void 0 : Ae.VERSION_NUMBER)} → v${le}${Ne ? " (pending)" : ""}`,
                          disabled: Ct,
                          onClick: () => $d(le),
                          children: "⊕ diff"
                        }
                      ),
                      (() => {
                        const ge = M.id || M.ID, _t = ge && j[ge] || 0;
                        return _t > 0 && m ? /* @__PURE__ */ F(
                          "button",
                          {
                            className: "btn-diff",
                            title: `${_t} comment${_t > 1 ? "s" : ""} on this version`,
                            onClick: () => m(ge),
                            style: { color: "var(--accent)" },
                            children: [
                              "💬 ",
                              _t
                            ]
                          }
                        ) : null;
                      })(),
                      (() => {
                        const ge = M.id || M.ID, _t = ge ? Un[ge] : null, vt = _t ? _t.count : 0, sn = _t ? _t.hasRejected : !1;
                        return vt > 0 ? /* @__PURE__ */ F(
                          "button",
                          {
                            className: "btn-diff",
                            title: `${vt} signature${vt > 1 ? "s" : ""} on this version${sn ? " (rejected)" : ""}`,
                            onClick: () => Ft(ge),
                            style: { color: sn ? "var(--danger)" : "var(--success)", display: "inline-flex", alignItems: "center", gap: 3 },
                            children: [
                              /* @__PURE__ */ b(k, { size: 12 }),
                              " ",
                              vt
                            ]
                          }
                        ) : null;
                      })()
                    ] }),
                    /* @__PURE__ */ b("div", { style: { marginLeft: "auto" }, children: !Ne && le !== rh && /* @__PURE__ */ b(
                      "button",
                      {
                        className: "btn-diff",
                        title: gt ? "Exit historical view" : `View node at version ${le}`,
                        style: { opacity: gt ? 1 : 0.6, background: gt ? "rgba(251,191,36,.2)" : void 0 },
                        onClick: () => {
                          gt ? (Wt(null), un(null)) : (Wt(le), un(null));
                        },
                        children: "👁"
                      }
                    ) })
                  ] })
                ] }, le);
              }) })
            ] })
          ] })
        ] }),
        et && /* @__PURE__ */ b(
          e0,
          {
            diff: et.data,
            v1Num: et.v1Num,
            v2Num: et.v2Num,
            onClose: () => Ze(null),
            stateColorMap: s
          }
        ),
        Bi && /* @__PURE__ */ b(
          ah,
          {
            shellAPI: i,
            nodeId: e,
            userId: t,
            filterVersionId: Bi,
            onClose: () => Ft(null)
          }
        )
      ]
    }
  );
}
function e0({ diff: i, v1Num: e, v2Num: t, onClose: n, stateColorMap: r }) {
  const { v1: s, v2: a, attributeDiff: o, stateChanged: l, linkDiff: d = [] } = i, u = o.filter((c) => c.changed), p = o.filter((c) => !c.changed), f = d.filter((c) => c.status === "ADDED"), m = d.filter((c) => c.status === "REMOVED"), _ = d.filter((c) => c.status === "UNCHANGED"), x = [...f, ...m];
  return /* @__PURE__ */ b("div", { className: "diff-overlay", onClick: (c) => c.target === c.currentTarget && n(), children: /* @__PURE__ */ F("div", { className: "diff-modal", children: [
    /* @__PURE__ */ F("div", { className: "diff-header", children: [
      /* @__PURE__ */ F("span", { className: "diff-title", children: [
        "Diff — v",
        e,
        " → v",
        t
      ] }),
      /* @__PURE__ */ b("button", { className: "diff-close", onClick: n, children: "✕" })
    ] }),
    /* @__PURE__ */ F("div", { className: "diff-meta-row", children: [
      /* @__PURE__ */ F("div", { className: "diff-meta-cell diff-meta-old", children: [
        /* @__PURE__ */ F("div", { className: "diff-meta-label", children: [
          "Version ",
          e
        ] }),
        /* @__PURE__ */ b("div", { className: "diff-meta-rev", children: s.iteration === 0 ? s.revision : `${s.revision}.${s.iteration}` }),
        /* @__PURE__ */ b(Di, { stateId: s.lifecycleStateId, stateColorMap: r }),
        /* @__PURE__ */ b("span", { className: "hist-type-badge", "data-type": s.changeType, style: { marginLeft: 6 }, children: s.changeType }),
        /* @__PURE__ */ F("div", { className: "diff-meta-sub", children: [
          s.createdBy,
          " · ",
          s.txComment || "—"
        ] })
      ] }),
      /* @__PURE__ */ b("div", { className: "diff-arrow", children: "→" }),
      /* @__PURE__ */ F("div", { className: "diff-meta-cell diff-meta-new", style: a.committedAt ? void 0 : { borderColor: "rgba(232,169,71,.35)", background: "rgba(232,169,71,.05)" }, children: [
        /* @__PURE__ */ F("div", { className: "diff-meta-label", style: { display: "flex", alignItems: "center", gap: 6 }, children: [
          "Version ",
          t,
          !a.committedAt && /* @__PURE__ */ b("span", { className: "pending-badge", children: "pending" })
        ] }),
        /* @__PURE__ */ b("div", { className: "diff-meta-rev", children: a.iteration === 0 ? a.revision : `${a.revision}.${a.iteration}` }),
        /* @__PURE__ */ b(Di, { stateId: a.lifecycleStateId, stateColorMap: r }),
        /* @__PURE__ */ b("span", { className: "hist-type-badge", "data-type": a.changeType, style: { marginLeft: 6 }, children: a.changeType }),
        /* @__PURE__ */ F("div", { className: "diff-meta-sub", children: [
          a.createdBy,
          " · ",
          a.txComment || /* @__PURE__ */ b("em", { style: { opacity: 0.5 }, children: "uncommitted" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ F("div", { className: "diff-body", children: [
      l && /* @__PURE__ */ F("div", { className: "diff-state-change", children: [
        /* @__PURE__ */ b("span", { style: { opacity: 0.7 }, children: "State changed:" }),
        " ",
        /* @__PURE__ */ b(Di, { stateId: s.lifecycleStateId, stateColorMap: r }),
        " ",
        "→",
        " ",
        /* @__PURE__ */ b(Di, { stateId: a.lifecycleStateId, stateColorMap: r })
      ] }),
      u.length === 0 && !l ? /* @__PURE__ */ b("div", { className: "diff-no-changes", children: "No attribute changes between these versions." }) : /* @__PURE__ */ F("div", { className: "diff-attr-section", children: [
        /* @__PURE__ */ F("div", { className: "diff-section-title", children: [
          "Changed attributes (",
          u.length,
          ")"
        ] }),
        u.length === 0 ? /* @__PURE__ */ b("div", { className: "diff-empty-section", children: "None" }) : /* @__PURE__ */ F("table", { className: "diff-table", children: [
          /* @__PURE__ */ b("thead", { children: /* @__PURE__ */ F("tr", { children: [
            /* @__PURE__ */ b("th", { children: "Attribute" }),
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
          /* @__PURE__ */ b("tbody", { children: u.map((c) => /* @__PURE__ */ F("tr", { className: "diff-row-changed", children: [
            /* @__PURE__ */ b("td", { className: "diff-attr-name", children: c.label || c.id || c.code }),
            /* @__PURE__ */ b("td", { className: "diff-val diff-val-old", children: c.v1Value !== "" ? c.v1Value : /* @__PURE__ */ b("span", { className: "diff-empty", children: "—" }) }),
            /* @__PURE__ */ b("td", { className: "diff-val diff-val-new", children: c.v2Value !== "" ? c.v2Value : /* @__PURE__ */ b("span", { className: "diff-empty", children: "—" }) })
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
          /* @__PURE__ */ b("thead", { children: /* @__PURE__ */ F("tr", { children: [
            /* @__PURE__ */ b("th", { children: "Attribute" }),
            /* @__PURE__ */ b("th", { colSpan: 2, children: "Value" })
          ] }) }),
          /* @__PURE__ */ b("tbody", { children: p.map((c) => /* @__PURE__ */ F("tr", { className: "diff-row-unchanged", children: [
            /* @__PURE__ */ b("td", { className: "diff-attr-name", children: c.label || c.id || c.code }),
            /* @__PURE__ */ b("td", { className: "diff-val", colSpan: 2, style: { color: "var(--muted2)" }, children: c.v1Value !== "" ? c.v1Value : /* @__PURE__ */ b("span", { className: "diff-empty", children: "—" }) })
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
            /* @__PURE__ */ b(
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
            /* @__PURE__ */ b("span", { style: { fontWeight: 600, marginRight: 6 }, children: c.linkTypeName }),
            /* @__PURE__ */ b(
              "span",
              {
                className: "hist-type-badge",
                "data-type": c.linkPolicy === "VERSION_TO_VERSION" ? "SIGNATURE" : "LIFECYCLE",
                style: { fontSize: 10, marginRight: 8 },
                children: c.linkPolicy === "VERSION_TO_VERSION" ? "V2V" : "V2M"
              }
            ),
            /* @__PURE__ */ b("span", { style: { color: "var(--fg)" }, children: c.targetLogicalId || c.targetNodeId }),
            /* @__PURE__ */ F("span", { style: { color: "var(--muted2)", fontSize: 11, marginLeft: 4 }, children: [
              "(",
              c.targetNodeType,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ F("div", { className: "diff-link-detail", children: [
            /* @__PURE__ */ F("div", { className: "diff-link-detail-row", children: [
              /* @__PURE__ */ b("span", { className: "diff-attr-name", children: "Target" }),
              /* @__PURE__ */ F("span", { className: "diff-val", children: [
                c.targetLogicalId || c.targetNodeId,
                /* @__PURE__ */ F("span", { style: { color: "var(--muted2)", marginLeft: 4 }, children: [
                  "· ",
                  c.targetNodeType
                ] })
              ] })
            ] }),
            /* @__PURE__ */ F("div", { className: "diff-link-detail-row", children: [
              /* @__PURE__ */ b("span", { className: "diff-attr-name", children: "Policy" }),
              /* @__PURE__ */ b("span", { className: "diff-val", children: c.linkPolicy === "VERSION_TO_VERSION" ? "V2V — pinned version" : "V2M — always latest" })
            ] }),
            c.linkPolicy === "VERSION_TO_VERSION" && /* @__PURE__ */ F("div", { className: "diff-link-detail-row", children: [
              /* @__PURE__ */ b("span", { className: "diff-attr-name", children: "Pinned version" }),
              /* @__PURE__ */ b("span", { className: "diff-val", children: c.pinnedRevision != null ? `${c.pinnedRevision}.${c.pinnedIteration}` : /* @__PURE__ */ b("span", { className: "diff-empty", children: "—" }) })
            ] })
          ] })
        ] }, c.linkId)),
        _.length > 0 && /* @__PURE__ */ F("details", { className: "diff-unchanged-details", style: { marginTop: 8 }, children: [
          /* @__PURE__ */ F("summary", { className: "diff-section-title", style: { cursor: "pointer", fontWeight: 400 }, children: [
            "Unchanged links (",
            _.length,
            ")"
          ] }),
          /* @__PURE__ */ b("div", { style: { marginTop: 4 }, children: _.map((c) => /* @__PURE__ */ F("div", { className: "diff-link-unch-row", children: [
            /* @__PURE__ */ b("span", { style: { fontWeight: 600, marginRight: 6 }, children: c.linkTypeName }),
            /* @__PURE__ */ b(
              "span",
              {
                className: "hist-type-badge",
                "data-type": c.linkPolicy === "VERSION_TO_VERSION" ? "SIGNATURE" : "LIFECYCLE",
                style: { fontSize: 10, marginRight: 8 },
                children: c.linkPolicy === "VERSION_TO_VERSION" ? "V2V" : "V2M"
              }
            ),
            /* @__PURE__ */ b("span", { children: c.targetLogicalId || c.targetNodeId }),
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
      /* @__PURE__ */ b("span", { className: "diff-fp-label", children: "Fingerprint" }),
      /* @__PURE__ */ b("span", { className: "diff-fp-val", title: s.fingerprint, style: { color: "var(--muted2)" }, children: s.fingerprint ? s.fingerprint.slice(0, 12) + "…" : "—" }),
      /* @__PURE__ */ b("span", { style: { margin: "0 6px", opacity: 0.5 }, children: "→" }),
      /* @__PURE__ */ b(
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
let Gd = null;
function t0({ tab: i, ctx: e }) {
  return /* @__PURE__ */ b(
    J_,
    {
      shellAPI: Gd,
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
const a0 = {
  id: "psm-editor",
  zone: "editor",
  init(i) {
    Gd = i, sh(i);
  },
  matches(i) {
    return (i == null ? void 0 : i.serviceCode) === "psm";
  },
  Component: t0
};
export {
  a0 as default
};
