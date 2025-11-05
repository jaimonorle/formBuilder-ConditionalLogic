const ie = [
  "text",
  "textarea",
  "number",
  "select",
  "radio-group",
  "checkbox-group",
  "date",
  "paragraph",
  "header",
  "file",
  "autocomplete"
];
function ue(e = {}) {
  const n = e.panelTitle || "Conditional Logic", o = e.types && e.types.length ? e.types : ie, t = e.enableVisualEditor !== !1, r = {};
  o.forEach((v) => {
    r[v] = {
      logic: {
        label: `${n} (JSON)`,
        type: "textarea",
        value: "",
        placeholder: '{ "groups":[...], "actions":["show"] }'
      },
      logicApplyTo: {
        label: `${n}: Apply To`,
        type: "select",
        value: "self",
        options: {
          self: "This Field",
          container: "Field Container",
          group: "Logic Group (below)"
        }
      },
      logicGroup: {
        label: `${n}: Group ID`,
        type: "text",
        value: "",
        placeholder: "e.g., vehicleDetails"
      }
    };
  });
  function c() {
    var v, f, _;
    try {
      const q = (v = window.jQuery) == null ? void 0 : v.call(window, ".build-wrap"), C = q == null ? void 0 : q.data("formBuilder"), L = (_ = (f = C == null ? void 0 : C.actions) == null ? void 0 : f.getData) == null ? void 0 : _.call(f, "json");
      return (typeof L == "string" ? JSON.parse(L) : Array.isArray(L) ? L : []).filter((d) => d == null ? void 0 : d.name).map((d) => ({
        name: d.name,
        type: d.type,
        label: d.label,
        values: Array.isArray(d.values) ? d.values.map((y) => ({ label: y.label ?? y.value, value: y.value })) : void 0
      }));
    } catch {
      return [];
    }
  }
  function u() {
    var v;
    try {
      const f = (v = e.getAvailableFields) == null ? void 0 : v.call(e);
      if (f && f.length) return f;
    } catch {
    }
    return c();
  }
  function p(v) {
    var _;
    try {
      const q = (_ = e.getFieldValues) == null ? void 0 : _.call(e, v);
      if (q) return q;
    } catch {
    }
    const f = u().find((q) => q.name === v);
    return (f == null ? void 0 : f.values) ?? null;
  }
  function x(v, f, _, q) {
    const C = document.createElement("div");
    C.className = "fb-logic-ve", C.style.marginBottom = "8px";
    const L = document.createElement("div");
    L.className = "fb-logic-ve-header", L.style.marginTop = "0px", L.style.fontWeight = "600", L.innerHTML = 'Visual Rules Editor <span style="font-size:12px;opacity:.7;font-weight:400;">(no JSON typing)</span>', C.appendChild(L);
    const b = document.createElement("div");
    b.className = "fb-logic-ve-body", b.style.border = "1px dashed #cbd5e1", b.style.padding = "8px", b.style.marginTop = "6px", C.appendChild(b);
    const d = document.createElement("div");
    d.style.margin = "6px 0", d.innerHTML = `
    <label style="margin-right:8px;">Mode</label>
    <select class="ve-mode form-select form-select-sm" style="display:inline-block; width:auto;">
      <option value="any">ANY (OR)</option>
      <option value="all">ALL (AND)</option>
    </select>
  `, b.appendChild(d);
    const y = document.createElement("div");
    y.style.margin = "6px 0", y.innerHTML = `
    <label style="margin-right:8px;">Actions</label>
    <label class="form-check form-check-inline"><input class="form-check-input ve-act" type="checkbox" value="show" checked> <span class="form-check-label">show</span></label>
    <label class="form-check form-check-inline"><input class="form-check-input ve-act" type="checkbox" value="require"> <span class="form-check-label">require</span></label>
    <label class="form-check form-check-inline"><input class="form-check-input ve-act" type="checkbox" value="enable"> <span class="form-check-label">enable</span></label>
    <label class="form-check form-check-inline"><input class="form-check-input ve-act" type="checkbox" value="disable"> <span class="form-check-label">disable</span></label>
    <label class="form-check form-check-inline"><input class="form-check-input ve-act" type="checkbox" value="hide"> <span class="form-check-label">hide</span></label>
  `, b.appendChild(y);
    const O = document.createElement("div");
    O.className = "ve-rules", b.appendChild(O);
    const B = document.createElement("button");
    B.type = "button", B.className = "btn btn-sm btn-outline-primary", B.textContent = "Add rule", B.style.marginTop = "8px", b.appendChild(B);
    function U(F, j, V) {
      const l = document.createElement("div");
      l.className = "ve-row", l.style.display = "grid", l.style.gridTemplateColumns = "1fr 1fr 1fr auto", l.style.gap = "6px", l.style.marginTop = "6px";
      const a = document.createElement("select");
      a.className = "form-select form-select-sm ve-field", u().forEach((S) => {
        const s = document.createElement("option");
        s.value = S.name, s.textContent = S.label ? `${S.label} (${S.name})` : S.name, a.appendChild(s);
      }), F && (a.value = F);
      const i = document.createElement("select");
      i.className = "form-select form-select-sm ve-op";
      function g(S) {
        var G;
        const s = u().find((I) => I.name === S), T = (s == null ? void 0 : s.type) === "number", A = (s == null ? void 0 : s.type) === "radio-group" || (s == null ? void 0 : s.type) === "select" || !!((G = s == null ? void 0 : s.values) != null && G.length), J = T ? ["equals", "notEquals", "gt", "gte", "lt", "lte", "isEmpty", "notEmpty"] : A ? ["equals", "notEquals", "isEmpty", "notEmpty"] : ["equals", "notEquals", "contains", "startsWith", "endsWith", "isEmpty", "notEmpty"];
        i.innerHTML = "", J.forEach((I) => {
          const w = document.createElement("option");
          w.value = I, w.textContent = I, i.appendChild(w);
        });
      }
      g(a.value), j && (i.value = j);
      const E = document.createElement("div");
      E.className = "ve-value-wrap";
      function N(S, s) {
        E.innerHTML = "";
        const T = p(S);
        if (T && T.length) {
          const A = document.createElement("select");
          A.className = "form-select form-select-sm ve-value", T.forEach((J) => {
            const G = document.createElement("option");
            G.value = J.value, G.textContent = J.label ?? J.value, A.appendChild(G);
          }), s && (A.value = s), E.appendChild(A);
        } else {
          const A = document.createElement("input");
          A.type = "text", A.className = "form-control form-control-sm ve-value", s && (A.value = s), E.appendChild(A);
        }
      }
      N(a.value, V);
      const h = document.createElement("button");
      h.type = "button", h.className = "btn btn-sm btn-link text-danger", h.textContent = "remove", a.addEventListener("change", () => {
        g(a.value), N(a.value);
      }), h.addEventListener("click", () => l.remove()), l.appendChild(a), l.appendChild(i), l.appendChild(E), l.appendChild(h), O.appendChild(l);
    }
    B.addEventListener("click", () => U());
    const M = document.createElement("button");
    M.type = "button", M.className = "btn btn-sm btn-primary", M.textContent = "Save to JSON", M.style.marginTop = "8px", M.style.marginLeft = "8px", b.appendChild(M), M.addEventListener("click", () => {
      const F = b.querySelector(".ve-mode").value, j = Array.from(b.querySelectorAll(".ve-act")).filter((i) => i.checked).map((i) => i.value), l = Array.from(b.querySelectorAll(".ve-row")).map((i) => {
        const g = i.querySelector(".ve-field").value, E = i.querySelector(".ve-op").value, h = i.querySelector(".ve-value").value ?? "";
        return { field: g, op: E, value: h };
      }), a = { groups: [{ mode: F, rules: l, actions: j }] };
      f().value = JSON.stringify(a, null, 2), alert(`Conditional Logic JSON updated.
Tip: you can switch back to Visual to adjust again.`);
    });
    try {
      const F = f().value;
      if (F && F.trim()) {
        const j = JSON.parse(F), V = Array.isArray(j.groups) ? j.groups[0] : null;
        if (V) {
          b.querySelector(".ve-mode").value = V.mode || "any";
          const l = new Set(V.actions || []);
          b.querySelectorAll(".ve-act").forEach((a) => {
            a.checked = l.has(a.value);
          }), (V.rules || []).forEach((a) => U(a.field, a.op, a.value));
        }
      }
    } catch {
    }
    v.prepend(C);
  }
  function m(v) {
    const f = Array.from(
      v.querySelectorAll('[name="logic"], [name="logicApplyTo"], [name="logicGroup"]')
    );
    if (!f.length) return;
    let _ = v.querySelector(".fb-logic-section");
    if (!_) {
      _ = document.createElement("div"), _.className = "fb-logic-section", _.innerHTML = `
        <div class="fb-logic-header" style="margin-top:8px; font-weight:600; cursor:pointer;">
          ${n}
          <span style="font-weight:400; font-size:12px; opacity:.7"> (toggle)</span>
        </div>
        <div class="fb-logic-body" style="border:1px solid #e5e7eb; padding:8px; margin-top:6px; display:none;"></div>
      `, v.appendChild(_);
      const d = _.querySelector(".fb-logic-header"), y = _.querySelector(".fb-logic-body");
      d.addEventListener("click", () => {
        const O = y.style.display !== "none";
        y.style.display = O ? "none" : "";
      });
    }
    const q = _.querySelector(".fb-logic-body");
    if (t) {
      const d = () => q.querySelector('[name="logic"]');
      if (!q.querySelector(".fb-logic-ve")) {
        const y = q.querySelectorAll(".fb-logic-ve");
        y.length > 1 && y.forEach((O, B) => {
          B > 0 && O.remove();
        }), x(q, d);
      }
    }
    let C = q.querySelector(".fb-logic-advanced");
    if (!C) {
      C = document.createElement("div"), C.className = "fb-logic-advanced", C.innerHTML = `
        <div class="fb-logic-adv-header" style="margin-top:10px; font-weight:600; cursor:pointer;">
          Advanced (JSON)
          <span style="font-weight:400; font-size:12px; opacity:.7"> (toggle)</span>
        </div>
        <div class="fb-logic-adv-body" style="
          border:1px dashed #cbd5e1;
          padding:8px;
          margin-top:6px;
          display:none; /* collapsed by default */
        "></div>
      `, q.appendChild(C);
      const d = C.querySelector(".fb-logic-adv-header"), y = C.querySelector(".fb-logic-adv-body");
      d.addEventListener("click", () => {
        const O = y.style.display !== "none";
        y.style.display = O ? "none" : "";
      });
    }
    const L = C.querySelector(".fb-logic-adv-body");
    f.forEach((d) => {
      const y = d.closest(".form-group") || d.closest("div") || d;
      y && y.parentElement !== L && L.appendChild(y);
    });
    const b = /* @__PURE__ */ new Set();
    L.querySelectorAll('[name="logic"], [name="logicApplyTo"], [name="logicGroup"]').forEach((d) => {
      const y = d.getAttribute("name");
      if (b.has(y)) {
        const O = d.closest(".form-group") || d.closest("div") || d;
        O && O.parentElement === L && O.remove();
      } else
        b.add(y);
    });
  }
  return { typeUserAttrs: r, onOpenFieldEdit: m };
}
function de(e, n) {
  const o = typeof n == "string" ? { initialJson: n } : n || {}, t = {
    json: o.initialJson || ""
  };
  function r() {
    var l, a, i, g;
    try {
      const E = (l = window.jQuery) == null ? void 0 : l.call(window, ".build-wrap"), N = (a = E == null ? void 0 : E.data) == null ? void 0 : a.call(E, "formBuilder"), h = (g = (i = N == null ? void 0 : N.actions) == null ? void 0 : i.getData) == null ? void 0 : g.call(i, "json");
      return (typeof h == "string" ? JSON.parse(h) : Array.isArray(h) ? h : []).filter((s) => s == null ? void 0 : s.name).map((s) => ({
        name: s.name,
        type: s.type,
        label: s.label,
        values: Array.isArray(s.values) ? s.values.map((T) => ({ label: T.label ?? T.value, value: T.value })) : void 0
      }));
    } catch {
      return [];
    }
  }
  function c() {
    var l;
    try {
      const a = (l = o.getAvailableFields) == null ? void 0 : l.call(o);
      if (a && a.length) return a;
    } catch {
    }
    return r();
  }
  function u(l) {
    var i;
    try {
      const g = (i = o.getFieldValues) == null ? void 0 : i.call(o, l);
      if (g) return g;
    } catch {
    }
    const a = c().find((g) => g.name === l);
    return (a == null ? void 0 : a.values) ?? null;
  }
  const p = document.createElement("div");
  p.style.margin = "8px 0", p.innerHTML = `
    <button type="button" class="btn btn-sm btn-outline-primary">Logic Groups</button>
    <div class="fb-logic-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:99999;">
      <div style="background:#fff; max-width:900px; width:92%; margin:4% auto; padding:16px; border-radius:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
          <strong style="font-size:16px;">Logic Groups</strong>
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-sm btn-secondary fb-groups-load-sample">Load sample</button>
            <button type="button" class="btn btn-sm btn-outline-secondary fb-groups-from-json">From JSON</button>
            <button type="button" class="btn btn-sm btn-primary fb-groups-save">Save</button>
            <button type="button" class="btn btn-sm btn-light fb-logic-close">Close</button>
          </div>
        </div>

        <!-- Visual Editor header outside border -->
        <div class="fb-groups-ve-header" style="font-weight:600;">Visual Groups Editor
          <span style="font-size:12px;opacity:.7;font-weight:400;">(no JSON typing)</span>
        </div>
        <div class="fb-groups-ve-body" style="border:1px dashed #cbd5e1; padding:8px; margin-top:6px;">
          <div class="fb-groups-list"></div>
          <button type="button" class="btn btn-sm btn-outline-primary fb-groups-add" style="margin-top:8px;">Add group</button>
        </div>

        <!-- Advanced (collapsed by default) -->
        <div class="fb-groups-adv" style="margin-top:10px;">
          <div class="fb-groups-adv-header" style="font-weight:600; cursor:pointer;">
            Advanced (JSON)
            <span style="font-size:12px;opacity:.7;font-weight:400;">(toggle)</span>
          </div>
          <div class="fb-groups-adv-body" style="border:1px dashed #cbd5e1; padding:8px; margin-top:6px; display:none;">
            <p style="font-size:12px; margin: 0 0 6px 0; opacity:.75;">
              Define reusable groups keyed by ID. Example:
            </p>
            <pre style="background:#f8fafc; padding:6px; border-radius:6px; font-size:12px; margin-top:0;">{
  "vehicleDetails": {
    "mode": "any",
    "rules": [{ "field": "hasVehicle", "op": "equals", "value": "yes" }],
    "actions": ["show", "require"]
  }
}</pre>
            <textarea class="fb-logic-json" style="width:100%; height:240px; font-family:monospace;"></textarea>
          </div>
        </div>
      </div>
    </div>
  `, e.prepend(p);
  const x = p.querySelector("button"), m = p.querySelector(".fb-logic-modal"), v = m.querySelector(".fb-logic-close"), f = m.querySelector(".fb-groups-load-sample"), _ = m.querySelector(".fb-groups-save"), q = m.querySelector(".fb-groups-from-json"), C = m.querySelector(".fb-groups-adv-header"), L = m.querySelector(".fb-groups-adv-body"), b = m.querySelector(".fb-logic-json"), d = m.querySelector(".fb-groups-list"), y = m.querySelector(".fb-groups-add"), O = () => {
    const l = window.fbLogicGroups && typeof window.fbLogicGroups == "object" ? window.fbLogicGroups : t.json ? U(t.json) : {};
    t.json = JSON.stringify(l || {}, null, 2), b.value = t.json, j(l || {}), m.style.display = "block";
  }, B = () => {
    m.style.display = "none";
  };
  x.addEventListener("click", O), v.addEventListener("click", B), m.addEventListener("click", (l) => {
    l.target === m && B();
  }), C.addEventListener("click", () => {
    const l = L.style.display !== "none";
    L.style.display = l ? "none" : "";
  }), f.addEventListener("click", () => {
    const l = {
      vehicleDetails: {
        mode: "any",
        rules: [{ field: "hasVehicle", op: "equals", value: "yes" }],
        actions: ["show", "require"]
      }
    };
    b.value = JSON.stringify(l, null, 2), j(l);
  }), q.addEventListener("click", () => {
    const l = U(b.value) || {};
    j(l);
  }), _.addEventListener("click", () => {
    const l = V();
    t.json = JSON.stringify(l, null, 2), b.value = t.json, window.fbLogicGroups = l, alert("Logic groups saved (visual & JSON). Available as window.fbLogicGroups."), B();
  }), y.addEventListener("click", () => F());
  function U(l) {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  }
  function M(l) {
    for (; l.firstChild; ) l.removeChild(l.firstChild);
  }
  function F(l = "") {
    const a = document.createElement("div");
    a.className = "fb-group-block", a.style.border = "1px solid #e5e7eb", a.style.borderRadius = "6px", a.style.padding = "8px", a.style.marginTop = "8px";
    const i = document.createElement("div");
    i.style.display = "grid", i.style.gridTemplateColumns = "1fr auto", i.style.gap = "8px", i.style.alignItems = "center";
    const g = document.createElement("input");
    g.className = "form-control form-control-sm fb-group-id", g.placeholder = "Group ID (e.g., vehicleDetails)", g.value = l;
    const E = document.createElement("button");
    E.type = "button", E.className = "btn btn-sm btn-link text-danger", E.textContent = "remove group", E.addEventListener("click", () => a.remove()), i.appendChild(g), i.appendChild(E), a.appendChild(i);
    const N = document.createElement("div");
    N.style.border = "1px dashed #cbd5e1", N.style.padding = "8px", N.style.marginTop = "6px", a.appendChild(N);
    const h = document.createElement("div");
    h.style.display = "flex", h.style.flexWrap = "wrap", h.style.gap = "12px", h.style.alignItems = "center", h.style.marginBottom = "6px";
    const S = document.createElement("label");
    S.textContent = "Mode";
    const s = document.createElement("select");
    s.className = "form-select form-select-sm fb-group-mode", ["any", "all"].forEach((w) => {
      const R = document.createElement("option");
      R.value = w, R.textContent = w.toUpperCase() + (w === "any" ? " (OR)" : " (AND)"), s.appendChild(R);
    });
    const T = document.createElement("div");
    T.innerHTML = `
      <label style="margin-right:8px;">Actions</label>
      <label class="form-check form-check-inline"><input class="form-check-input fb-act" type="checkbox" value="show" checked> <span class="form-check-label">show</span></label>
      <label class="form-check form-check-inline"><input class="form-check-input fb-act" type="checkbox" value="require"> <span class="form-check-label">require</span></label>
      <label class="form-check form-check-inline"><input class="form-check-input fb-act" type="checkbox" value="enable"> <span class="form-check-label">enable</span></label>
      <label class="form-check form-check-inline"><input class="form-check-input fb-act" type="checkbox" value="disable"> <span class="form-check-label">disable</span></label>
      <label class="form-check form-check-inline"><input class="form-check-input fb-act" type="checkbox" value="hide"> <span class="form-check-label">hide</span></label>
    `;
    const A = document.createElement("div");
    A.appendChild(S), A.appendChild(document.createTextNode(" ")), A.appendChild(s), h.appendChild(A), h.appendChild(T), N.appendChild(h);
    const J = document.createElement("div");
    J.className = "fb-group-rules", N.appendChild(J);
    const G = document.createElement("button");
    G.type = "button", G.className = "btn btn-sm btn-outline-primary", G.textContent = "Add rule", G.style.marginTop = "8px", N.appendChild(G);
    function I(w, R, z) {
      const W = document.createElement("div");
      W.className = "fb-group-rule", W.style.display = "grid", W.style.gridTemplateColumns = "1fr 1fr 1fr auto", W.style.gap = "6px", W.style.marginTop = "6px";
      const D = document.createElement("select");
      D.className = "form-select form-select-sm fb-rule-field", c().forEach((H) => {
        const k = document.createElement("option");
        k.value = H.name, k.textContent = H.label ? `${H.label} (${H.name})` : H.name, D.appendChild(k);
      }), w && (D.value = w);
      const Q = document.createElement("select");
      Q.className = "form-select form-select-sm fb-rule-op";
      function le(H) {
        var P;
        const k = c().find((ee) => ee.name === H), K = (k == null ? void 0 : k.type) === "number", $ = (k == null ? void 0 : k.type) === "radio-group" || (k == null ? void 0 : k.type) === "select" || !!((P = k == null ? void 0 : k.values) != null && P.length), X = K ? ["equals", "notEquals", "gt", "gte", "lt", "lte", "isEmpty", "notEmpty"] : $ ? ["equals", "notEquals", "isEmpty", "notEmpty"] : ["equals", "notEquals", "contains", "startsWith", "endsWith", "isEmpty", "notEmpty"];
        Q.innerHTML = "", X.forEach((ee) => {
          const ne = document.createElement("option");
          ne.value = ee, ne.textContent = ee, Q.appendChild(ne);
        });
      }
      le(D.value), R && (Q.value = R);
      const Y = document.createElement("div");
      Y.className = "fb-rule-value-wrap";
      function ae(H, k) {
        Y.innerHTML = "";
        const K = u(H);
        if (K && K.length) {
          const $ = document.createElement("select");
          $.className = "form-select form-select-sm fb-rule-value", K.forEach((X) => {
            const P = document.createElement("option");
            P.value = X.value, P.textContent = X.label ?? X.value, $.appendChild(P);
          }), k && ($.value = k), Y.appendChild($);
        } else {
          const $ = document.createElement("input");
          $.type = "text", $.className = "form-control form-control-sm fb-rule-value", k && ($.value = k), Y.appendChild($);
        }
      }
      ae(D.value, z);
      const Z = document.createElement("button");
      Z.type = "button", Z.className = "btn btn-sm btn-link text-danger", Z.textContent = "remove", Z.addEventListener("click", () => W.remove()), D.addEventListener("change", () => {
        le(D.value), ae(D.value);
      }), W.appendChild(D), W.appendChild(Q), W.appendChild(Y), W.appendChild(Z), J.appendChild(W);
    }
    return G.addEventListener("click", () => I()), a._set = (w) => {
      w != null && w.mode && (s.value = w.mode);
      const R = new Set((w == null ? void 0 : w.actions) || []);
      T.querySelectorAll(".fb-act").forEach((z) => {
        z.checked = R.has(z.value);
      }), M(J), ((w == null ? void 0 : w.rules) || []).forEach((z) => I(z.field, z.op, z.value));
    }, d.appendChild(a), a;
  }
  function j(l) {
    M(d);
    const a = Object.keys(l || {});
    if (!a.length) {
      F();
      return;
    }
    a.forEach((i) => {
      const g = l[i] || {};
      F(i)._set({ mode: g.mode || "any", actions: g.actions || [], rules: g.rules || [] });
    });
  }
  function V() {
    const l = {};
    return Array.from(d.querySelectorAll(".fb-group-block")).forEach((i) => {
      const g = i.querySelector(".fb-group-id").value.trim();
      if (!g) return;
      const E = i.querySelector(".fb-group-mode").value, N = Array.from(i.querySelectorAll(".fb-act")).filter((S) => S.checked).map((S) => S.value), h = [];
      i.querySelectorAll(".fb-group-rule").forEach((S) => {
        var G, I;
        const s = (G = S.querySelector(".fb-rule-field")) == null ? void 0 : G.value, T = (I = S.querySelector(".fb-rule-op")) == null ? void 0 : I.value, A = S.querySelector(".fb-rule-value"), J = (A == null ? void 0 : A.value) ?? "";
        s && T && h.push({ field: s, op: T, value: J });
      }), l[g] = { mode: E, rules: h, actions: N };
    }), l;
  }
  return {
    getJson: () => t.json,
    setJson: (l) => {
      t.json = l;
    },
    getGroups: () => U(t.json || "{}") || {}
  };
}
const Ae = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachLogicGroupsManager: de,
  withConditionalLogic: ue
}, Symbol.toStringTag, { value: "Module" }));
function se(e) {
  const n = window.CSS;
  return n && typeof n.escape == "function" ? n.escape(e) : e.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
}
function pe(e) {
  const n = se(e);
  return `[name="${n}"], [name="${n}[]"], [data-fb-name="${n}"]`;
}
function ce(e) {
  const n = [".form-group", ".fb-field-wrapper", ".form-field", ".field-wrapper", ".row", ".mb-3", ".box"];
  for (const o of n) {
    const t = e.closest(o);
    if (t) return t;
  }
  return e.parentElement || e;
}
function me(e) {
  var n, o;
  if (e instanceof HTMLInputElement) {
    if (e.type === "radio") {
      const t = e.name, r = ((n = e.form) == null ? void 0 : n.querySelectorAll(`input[type="radio"][name="${t}"]`)) || document.querySelectorAll(`input[type="radio"][name="${t}"]`);
      for (const c of Array.from(r)) {
        const u = c;
        if (u.checked) return u.value;
      }
      return null;
    }
    if (e.type === "checkbox") {
      const t = e.name, r = ((o = e.form) == null ? void 0 : o.querySelectorAll(`input[type="checkbox"][name="${t}"]`)) || document.querySelectorAll(`input[type="checkbox"][name="${t}"]`), c = [];
      return Array.from(r).forEach((u) => {
        const p = u;
        p.checked && c.push(p.value);
      }), c;
    }
    return e.value;
  }
  return e instanceof HTMLSelectElement ? e.multiple ? Array.from(e.selectedOptions).map((t) => t.value) : e.value : e instanceof HTMLTextAreaElement ? e.value : e.value ?? e.textContent ?? null;
}
function fe(e, n) {
  const o = n.op, t = n.value;
  if (Array.isArray(e))
    return o === "contains" || o === "equals" ? e.includes(t) : o === "notEquals" ? !e.includes(t) : o === "isEmpty" ? e.length === 0 : o === "notEmpty" ? e.length > 0 : !1;
  const r = e == null ? "" : String(e), c = t == null ? "" : String(t), u = Number(e), p = Number(t);
  switch (o) {
    case "equals":
      return e == t;
    case "notEquals":
      return e != t;
    case "contains":
      return r.includes(c);
    case "startsWith":
      return r.startsWith(c);
    case "endsWith":
      return r.endsWith(c);
    case "gt":
      return u > p;
    case "gte":
      return u >= p;
    case "lt":
      return u < p;
    case "lte":
      return u <= p;
    case "isEmpty":
      return r.trim() === "";
    case "notEmpty":
      return r.trim() !== "";
    default:
      return !1;
  }
}
function ye(e, n) {
  const o = n.rules.map((r) => {
    const c = e.querySelector(pe(r.field));
    if (!c) return !1;
    const u = me(c);
    return fe(u, r);
  }), t = n.mode === "all" ? o.every(Boolean) : o.some(Boolean);
  return window.__FB_LOGIC_DEBUG__ && console.log("[fb-logic] group", n, "results", o, "ok?", t), t;
}
function re(e, n) {
  e.querySelectorAll("input, select, textarea, button").forEach((t) => {
    t.disabled = n, n && (t.required = !1);
  });
}
function be(e, n) {
  e.style.display = n ? "" : "none", e.setAttribute("aria-hidden", n ? "false" : "true");
}
function ge(e, n, o) {
  const t = n.includes("show") ? o : n.includes("hide") ? !o : o;
  be(e, t), n.includes("disable") && re(e, !0), n.includes("enable") && re(e, !1), n.includes("require") && e.querySelectorAll("input, select, textarea").forEach((c) => {
    c.required = t;
  });
}
function he(e) {
  const n = e.getAttribute("data-logic");
  if (!n) return null;
  try {
    return JSON.parse(n);
  } catch {
    return window.__FB_LOGIC_DEBUG__ && console.warn("Invalid data-logic JSON", n, e), null;
  }
}
function ve(e) {
  if (!e) return null;
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return null;
  }
}
function Ee(e, n) {
  const o = se(n);
  return e.querySelectorAll(`[name="${o}"], [name="${o}[]"]`);
}
function xe(e, n) {
  if (n) {
    try {
      typeof n == "string" && (n = JSON.parse(n));
    } catch {
      return;
    }
    if (Array.isArray(n))
      for (const o of n) {
        const t = o == null ? void 0 : o.name;
        if (!t) continue;
        const r = Ee(e, t);
        if (!r.length) continue;
        const c = ve(o.logic), u = o.logicApplyTo || o.applyTo || "self", p = o.logicGroup;
        if (!c && p && u === "group") {
          r.forEach((x) => x.setAttribute("data-logic-group", String(p)));
          continue;
        }
        c && (u === "container" ? r.forEach((x) => {
          (typeof window.FB_GET_WRAPPER == "function" ? window.FB_GET_WRAPPER(x) : ce(x)).setAttribute("data-logic-container", c);
        }) : u === "group" && p ? r.forEach((x) => x.setAttribute("data-logic-group", String(p))) : r.forEach((x) => x.setAttribute("data-logic", c)));
      }
  }
}
function Se(e) {
  return e.actions && e.actions.length ? e.actions : ["show"];
}
function we(e) {
  const n = [];
  return e.querySelectorAll("[data-logic]").forEach((o) => {
    const t = he(o);
    t && n.push({ el: o, cfg: t, mode: "self" });
  }), e.querySelectorAll("[data-logic-container]").forEach((o) => {
    const t = o.getAttribute("data-logic-container");
    if (t)
      try {
        n.push({ el: o, cfg: JSON.parse(t), mode: "container" });
      } catch {
      }
  }), e.querySelectorAll("[data-logic-group]").forEach((o) => {
    var c;
    const t = o.getAttribute("data-logic-group") || "", r = (c = window.fbLogicGroups) == null ? void 0 : c[t];
    if (r) {
      const u = { groups: [r], actions: r.actions, applyTo: "group", logicGroup: t };
      n.push({ el: o, cfg: u, mode: "group", groupId: t });
    }
  }), window.__FB_LOGIC_DEBUG__ && console.log("[fb-logic] targets found:", n.length, n), n;
}
function te(e, n, o) {
  const t = o.getWrapper || ce;
  n.forEach((r) => {
    const c = r.el;
    let u = !0;
    r.cfg.groups && r.cfg.groups.length && (u = r.cfg.groups.every((m) => ye(e, m)));
    const p = r.mode === "self" ? t(c) : r.mode === "container" ? c : t(c), x = Se(r.cfg);
    ge(p, x, u), o.onState && o.onState(c, u), window.__FB_LOGIC_DEBUG__ && console.log("[fb-logic] applied", { el: c, mode: r.mode, actions: x, truthy: u, wrapper: p });
  });
}
function oe(e, n, o = {}) {
  const t = e;
  if (n)
    try {
      xe(t, n);
    } catch (x) {
      window.__FB_LOGIC_DEBUG__ && console.warn("hydrateFromFormData failed", x);
    }
  const r = we(t), c = /* @__PURE__ */ new Set();
  r.forEach((x) => {
    var m;
    (m = x.cfg.groups) == null || m.forEach((v) => v.rules.forEach((f) => c.add(f.field)));
  }), window.__FB_LOGIC_DEBUG__ && console.log("[fb-logic] watching fields:", Array.from(c));
  const u = (x) => {
    var f;
    const m = (f = x.target) == null ? void 0 : f.name;
    if (!m) return;
    const v = m.replace(/\[\]$/, "");
    (c.has(m) || c.has(v)) && (window.__FB_LOGIC_DEBUG__ && console.log("[fb-logic] change on", m, "→ reeval"), te(t, r, o));
  };
  t.addEventListener("input", u, !0), t.addEventListener("change", u, !0), te(t, r, o), t.addEventListener("fb:reinit-logic", () => te(t, r, o));
  const p = {
    refresh: () => te(t, r, o),
    destroy: () => {
      t.removeEventListener("input", u, !0), t.removeEventListener("change", u, !0);
    }
  };
  return window._fbLogic = p, p;
}
function ke(e) {
  oe(e);
}
function Ce(e, n) {
  oe(e);
}
const qe = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  evaluateField: Ce,
  refresh: ke,
  setup: oe
}, Symbol.toStringTag, { value: "Module" }));
export {
  Ae as builder,
  Ce as evaluateField,
  ke as refresh,
  qe as renderer,
  oe as setup
};
//# sourceMappingURL=formbuilder-conditional-logic.es.js.map
