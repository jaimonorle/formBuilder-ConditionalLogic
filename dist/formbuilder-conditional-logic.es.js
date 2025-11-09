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
  const t = e.panelTitle || "Conditional Logic", l = e.types && e.types.length ? e.types : ie, n = e.enableVisualEditor !== !1, d = {};
  l.forEach((f) => {
    d[f] = {
      logic: {
        label: `${t} (JSON)`,
        type: "textarea",
        value: "",
        placeholder: '{ "groups":[...], "actions":["show"] }'
      },
      logicApplyTo: {
        label: `${t}: Apply To`,
        type: "select",
        value: "self",
        options: {
          self: "This Field",
          container: "Field Container",
          group: "Logic Group (below)"
        }
      },
      logicGroup: {
        label: `${t}: Group ID`,
        type: "text",
        value: "",
        placeholder: "e.g., vehicleDetails"
      }
    };
  });
  function p(f, g, c, _) {
    const C = document.createElement("div");
    C.className = "fb-logic-ve", C.style.marginBottom = "8px";
    const N = document.createElement("div");
    N.style.display = "flex", N.style.gap = "6px", N.style.alignItems = "center";
    const R = document.createElement("strong");
    R.textContent = "Conditional Logic (Visual)";
    const k = document.createElement("span");
    k.style.fontSize = "12px", k.style.opacity = "0.7", k.textContent = "— use this editor then save to JSON below", N.appendChild(R), N.appendChild(k), C.appendChild(N);
    const y = document.createElement("div");
    y.className = "fb-logic-ve-body", y.style.border = "1px dashed #cbd5e1", y.style.padding = "8px", y.style.marginTop = "6px", C.appendChild(y);
    const L = document.createElement("div");
    L.style.margin = "6px 0", L.innerHTML = `
    <label style="margin-right:8px;">Mode</label>
    <select class="ve-mode form-select form-select-sm" style="display:inline-block; width:auto;">
      <option value="any">ANY (OR)</option>
      <option value="all">ALL (AND)</option>
    </select>
  `, y.appendChild(L);
    const F = document.createElement("div");
    F.style.margin = "6px 0", F.innerHTML = `
    <label style="margin-right:8px;">Actions</label>
    <label class="form-check form-check-inline"><input class="ve-act form-check-input" type="checkbox" value="show" checked> <span class="form-check-label">show</span></label>
    <label class="form-check form-check-inline"><input class="ve-act form-check-input" type="checkbox" value="require"> <span class="form-check-label">require</span></label>
    <label class="form-check form-check-inline"><input class="ve-act form-check-input" type="checkbox" value="enable"> <span class="form-check-label">enable</span></label>
    <label class="form-check form-check-inline"><input class="ve-act form-check-input" type="checkbox" value="disable"> <span class="form-check-label">disable</span></label>
    <label class="form-check form-check-inline"><input class="ve-act form-check-input" type="checkbox" value="hide"> <span class="form-check-label">hide</span></label>
  `, y.appendChild(F);
    const W = document.createElement("div");
    W.className = "ve-rules", W.style.marginTop = "6px", W.style.display = "grid", W.style.gap = "6px", y.appendChild(W);
    const I = document.createElement("div");
    I.style.display = "flex", I.style.justifyContent = "flex-end", I.style.gap = "8px", I.style.marginTop = "8px";
    const M = document.createElement("button");
    M.type = "button", M.className = "btn btn-sm btn-outline-secondary", M.textContent = "Add rule";
    const J = document.createElement("button");
    J.type = "button", J.className = "btn btn-sm btn-primary", J.textContent = "Save to JSON", I.appendChild(M), I.appendChild(J), y.appendChild(I);
    const D = () => {
      var a, i, o, r;
      try {
        const u = (a = window.jQuery) == null ? void 0 : a.call(window, ".build-wrap"), v = (i = u == null ? void 0 : u.data) == null ? void 0 : i.call(u, "formBuilder"), s = (r = (o = v == null ? void 0 : v.actions) == null ? void 0 : o.getData) == null ? void 0 : r.call(o, "json");
        return (typeof s == "string" ? JSON.parse(s) : Array.isArray(s) ? s : []).filter((E) => E == null ? void 0 : E.name).map((E) => ({
          name: E.name,
          type: E.type,
          label: E.label,
          values: Array.isArray(E.values) ? E.values.map((x) => ({ label: x.label ?? x.value, value: x.value })) : void 0
        }));
      } catch {
        return [];
      }
    }, V = (a) => {
      const i = D().find((o) => o.name === a);
      return (i == null ? void 0 : i.values) ?? null;
    }, z = () => {
      const a = document.createElement("select");
      a.className = "ve-field form-select form-select-sm", a.style.minWidth = "160px";
      const i = D();
      if (i.length)
        i.forEach((o) => {
          const r = document.createElement("option");
          r.value = o.name, r.textContent = o.label ? `${o.label} (${o.name})` : o.name, a.appendChild(r);
        });
      else {
        const o = document.createElement("option");
        o.value = "", o.textContent = "(no fields yet)", a.appendChild(o);
      }
      return a;
    }, U = (a) => {
      var s;
      const i = document.createElement("select");
      i.className = "ve-op form-select form-select-sm", i.style.minWidth = "140px";
      const o = D().find((w) => w.name === a), r = (o == null ? void 0 : o.type) === "number", u = (o == null ? void 0 : o.type) === "radio-group" || (o == null ? void 0 : o.type) === "select" || !!((s = o == null ? void 0 : o.values) != null && s.length), v = r ? ["equals", "notEquals", "gt", "gte", "lt", "lte", "isEmpty", "notEmpty"] : u ? ["equals", "notEquals", "isEmpty", "notEmpty"] : ["equals", "notEquals", "contains", "startsWith", "endsWith", "isEmpty", "notEmpty"];
      return i.innerHTML = "", v.forEach((w) => {
        const E = document.createElement("option");
        E.value = w, E.textContent = w, i.appendChild(E);
      }), i;
    }, m = (a, i) => {
      const o = V(a);
      if (o && o.length) {
        const u = document.createElement("select");
        return u.className = "ve-value form-select form-select-sm", o.forEach((v) => {
          const s = document.createElement("option");
          s.value = v.value, s.textContent = v.label ?? v.value, u.appendChild(s);
        }), u;
      }
      const r = document.createElement("input");
      return r.className = "ve-value form-control form-control-sm", r.type = "text", r;
    };
    function b(a, i, o) {
      var O;
      const r = document.createElement("div");
      r.className = "ve-row", r.style.display = "flex", r.style.gap = "6px", r.style.alignItems = "center";
      const u = z(), v = a || ((O = u.options[0]) == null ? void 0 : O.value) || "", s = U(v), w = document.createElement("div"), E = (S, q) => {
        w.innerHTML = "", w.appendChild(m(S));
      };
      if (a && (u.value = a), E(u.value), i) {
        const S = U(u.value);
        s.innerHTML = S.innerHTML, s.value = i;
      }
      o != null && (w.querySelector(".ve-value").value = o), u.addEventListener("change", () => {
        const S = U(u.value);
        s.innerHTML = S.innerHTML, E(u.value);
      }), r.appendChild(u), r.appendChild(s), r.appendChild(w);
      const x = document.createElement("button");
      x.type = "button", x.className = "btn btn-sm btn-outline-danger", x.textContent = "Remove", x.addEventListener("click", () => r.remove()), r.appendChild(x), W.appendChild(r);
    }
    M.addEventListener("click", () => b()), J.addEventListener("click", () => {
      const a = y.querySelector(".ve-mode").value, i = Array.from(y.querySelectorAll(".ve-act")).filter((s) => s.checked).map((s) => s.value), r = Array.from(y.querySelectorAll(".ve-row")).map((s) => {
        const w = s.querySelector(".ve-field").value, E = s.querySelector(".ve-op").value, O = s.querySelector(".ve-value").value ?? "";
        return { field: w, op: E, value: O };
      }), u = { groups: [{ mode: a, rules: r, actions: i }] }, v = g();
      v ? (v.value = JSON.stringify(u, null, 2), alert("Conditional Logic JSON updated.")) : alert("Could not find the logic JSON field to update.");
    });
    try {
      const a = g(), i = a && a.value || "";
      if (i && i.trim()) {
        const o = JSON.parse(i), r = Array.isArray(o.groups) ? o.groups[0] : null;
        if (r) {
          y.querySelector(".ve-mode").value = r.mode || "any";
          const u = new Set(r.actions || []);
          y.querySelectorAll(".ve-act").forEach((v) => {
            v.checked = u.has(v.value);
          }), (r.rules || []).forEach((v) => b(v.field, v.op, v.value));
        }
      }
    } catch {
    }
    f.prepend(C);
  }
  function h(f) {
    const g = Array.from(
      f.querySelectorAll('[name="logic"], [name="logicApplyTo"], [name="logicGroup"]')
    );
    if (!g.length) return;
    let c = f.querySelector(".fb-logic-section");
    if (!c) {
      c = document.createElement("div"), c.className = "fb-logic-section", c.innerHTML = `
      <div class="fb-logic-header" style="margin-top:8px; font-weight:600; cursor:pointer;">
        ${t}
        <span style="font-weight:400; font-size:12px; opacity:.7"> (toggle)</span>
      </div>
      <div class="fb-logic-body" style="border:1px solid #e5e7eb; padding:8px; margin-top:6px; display:none;"></div>
    `, f.appendChild(c);
      const k = c.querySelector(".fb-logic-header"), y = c.querySelector(".fb-logic-body");
      k.addEventListener("click", () => {
        const L = y.style.display !== "none";
        y.style.display = L ? "none" : "";
      });
    }
    const _ = c.querySelector(".fb-logic-body");
    let C = _.querySelector(".fb-logic-advanced");
    if (!C) {
      C = document.createElement("div"), C.className = "fb-logic-advanced", C.innerHTML = `
      <div class="fb-logic-adv-header" style="margin-top:10px; font-weight:600; cursor:pointer;">
        Advanced (JSON)
        <span style="font-weight:400; font-size:12px; opacity:.7"> (toggle)</span>
      </div>
      <div class="fb-logic-adv-body" style="border:1px dashed #cbd5e1; padding:8px; margin-top:6px; display:none;"></div>
    `, _.appendChild(C);
      const k = C.querySelector(".fb-logic-adv-header"), y = C.querySelector(".fb-logic-adv-body");
      k.addEventListener("click", () => {
        const L = y.style.display !== "none";
        y.style.display = L ? "none" : "";
      });
    }
    const N = C.querySelector(".fb-logic-adv-body");
    g.forEach((k) => {
      const y = k.closest(".form-group") || k.closest("div") || k;
      y && y.parentElement !== N && N.appendChild(y);
    });
    const R = /* @__PURE__ */ new Set();
    if (N.querySelectorAll('[name="logic"], [name="logicApplyTo"], [name="logicGroup"]').forEach((k) => {
      const y = k.getAttribute("name");
      if (R.has(y)) {
        const L = k.closest(".form-group") || k.closest("div") || k;
        L && L.parentElement === N && L.remove();
      } else
        R.add(y);
    }), n) {
      const k = () => _.querySelector('[name="logic"]');
      if (!_.querySelector(".fb-logic-ve")) {
        const y = _.querySelectorAll(".fb-logic-ve");
        y.length > 1 && y.forEach((L, F) => {
          F > 0 && L.remove();
        }), p(_, k);
      }
    }
  }
  return { typeUserAttrs: d, onOpenFieldEdit: h };
}
function de(e, t) {
  const l = typeof t == "string" ? { initialJson: t } : t || {}, n = { json: l.initialJson || "" };
  function d() {
    var m, b, a, i;
    try {
      const o = (m = window.jQuery) == null ? void 0 : m.call(window, ".build-wrap"), r = (b = o == null ? void 0 : o.data) == null ? void 0 : b.call(o, "formBuilder"), u = (i = (a = r == null ? void 0 : r.actions) == null ? void 0 : a.getData) == null ? void 0 : i.call(a, "json");
      return (typeof u == "string" ? JSON.parse(u) : Array.isArray(u) ? u : []).filter((s) => s == null ? void 0 : s.name).map((s) => ({
        name: s.name,
        type: s.type,
        label: s.label,
        values: Array.isArray(s.values) ? s.values.map((w) => ({ label: w.label ?? w.value, value: w.value })) : void 0
      }));
    } catch {
      return [];
    }
  }
  const p = () => {
    var m;
    try {
      const b = (m = l.getAvailableFields) == null ? void 0 : m.call(l);
      if (b && b.length) return b;
    } catch {
    }
    return d();
  }, h = (m) => {
    var a;
    try {
      const i = (a = l.getFieldValues) == null ? void 0 : a.call(l, m);
      if (i) return i;
    } catch {
    }
    const b = p().find((i) => i.name === m);
    return (b == null ? void 0 : b.values) ?? null;
  }, f = document.createElement("div");
  f.style.margin = "8px 0", f.innerHTML = `
    <button type="button" class="btn btn-sm btn-outline-primary">Logic Groups</button>
    <div class="fb-logic-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:99999;">
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

        <div class="fb-groups-ve-header" style="font-weight:600;">Visual Groups Editor
          <span style="font-size:12px;opacity:.7;font-weight:400;">(no JSON typing)</span>
        </div>
        <div class="fb-groups-ve-body" style="border:1px dashed #cbd5e1; padding:8px; margin-top:6px;">
          <div class="fb-groups-list"></div>
          <button type="button" class="btn btn-sm btn-outline-primary fb-groups-add" style="margin-top:8px;">Add group</button>
        </div>

        <div class="fb-groups-adv" style="margin-top:10px;">
          <div class="fb-groups-adv-header" style="font-weight:600; cursor:pointer;">
            Advanced (JSON)
            <span style="font-size:12px;opacity:.7;font-weight:400;">(toggle)</span>
          </div>
          <div class="fb-groups-adv-body" style="border:1px dashed #cbd5e1; padding:8px; margin-top:6px; display:none;">
            <p style="font-size:12px; margin:0 0 6px 0; opacity:.75;">Define reusable groups keyed by ID.</p>
            <textarea class="fb-logic-json" style="width:100%; height:240px; font-family:monospace;"></textarea>
          </div>
        </div>
      </div>
    </div>
  `, e.prepend(f);
  const g = f.querySelector("button"), c = f.querySelector(".fb-logic-modal"), _ = c.querySelector(".fb-logic-close"), C = c.querySelector(".fb-groups-load-sample"), N = c.querySelector(".fb-groups-save"), R = c.querySelector(".fb-groups-from-json"), k = c.querySelector(".fb-groups-adv-header"), y = c.querySelector(".fb-groups-adv-body"), L = c.querySelector(".fb-logic-json"), F = c.querySelector(".fb-groups-list"), W = c.querySelector(".fb-groups-add"), I = () => {
    const m = window.fbLogicGroups && typeof window.fbLogicGroups == "object" ? window.fbLogicGroups : n.json ? J(n.json) : {};
    n.json = JSON.stringify(m || {}, null, 2), L.value = n.json, z(m || {}), c.style.display = "block";
  }, M = () => {
    c.style.display = "none";
  };
  g.addEventListener("click", I), _.addEventListener("click", M), c.addEventListener("click", (m) => {
    m.target === c && M();
  }), k.addEventListener("click", () => {
    const m = y.style.display !== "none";
    y.style.display = m ? "none" : "";
  }), C.addEventListener("click", () => {
    var i;
    const a = {
      vehicleDetails: {
        mode: "any",
        rules: [{ field: ((i = p()[0]) == null ? void 0 : i.name) || "controller", op: "equals", value: "yes" }],
        actions: ["show", "require"]
      }
    };
    L.value = JSON.stringify(a, null, 2), z(a);
  }), R.addEventListener("click", () => {
    const m = J(L.value) || {};
    z(m);
  }), N.addEventListener("click", () => {
    var b, a, i;
    const m = U();
    n.json = JSON.stringify(m, null, 2), L.value = n.json, window.fbLogicGroups = m;
    try {
      const o = (b = window.jQuery) == null ? void 0 : b.call(window, ".build-wrap"), r = (a = o == null ? void 0 : o.data) == null ? void 0 : a.call(o, "formBuilder");
      if ((i = r == null ? void 0 : r.actions) != null && i.getData && !r.__fbLogicGroupsPatched) {
        const u = r.actions.getData.bind(r.actions);
        r.__fbLogicGroupsPatched = !0, r.actions.getData = (v) => {
          const s = u(v);
          if (v !== "json") return s;
          const w = window.fbLogicGroups || J(n.json) || {}, E = JSON.stringify(w);
          try {
            const x = typeof s == "string" ? JSON.parse(s) : Array.isArray(s) ? s : [], O = x.findIndex((q) => (q == null ? void 0 : q.type) === "hidden" && ((q == null ? void 0 : q.name) === "__logicGroups" || (q == null ? void 0 : q.name) === "logicGroups")), S = { type: "hidden", name: "__logicGroups", value: E, label: " ", access: !1, className: "d-none" };
            return O >= 0 ? x[O] = { ...x[O], ...S } : x.push(S), JSON.stringify(x);
          } catch {
            return s;
          }
        };
      }
    } catch (o) {
      console.warn("[logic-groups] export patch failed", o);
    }
    alert("Logic groups saved (no rebuild). They will be embedded into exported JSON automatically."), M();
  }), W.addEventListener("click", () => V());
  function J(m) {
    try {
      return JSON.parse(m);
    } catch {
      return null;
    }
  }
  function D(m) {
    for (; m.firstChild; ) m.removeChild(m.firstChild);
  }
  function V(m = "") {
    const b = document.createElement("div");
    b.className = "fb-group-block", b.style.border = "1px solid #e5e7eb", b.style.borderRadius = "6px", b.style.padding = "8px", b.style.marginTop = "8px";
    const a = document.createElement("div");
    a.style.display = "grid", a.style.gridTemplateColumns = "1fr auto", a.style.gap = "8px", a.style.alignItems = "center";
    const i = document.createElement("input");
    i.className = "form-control form-control-sm fb-group-id", i.placeholder = "Group ID (e.g., vehicleDetails)", i.value = m;
    const o = document.createElement("button");
    o.type = "button", o.className = "btn btn-sm btn-link text-danger", o.textContent = "remove group", o.addEventListener("click", () => b.remove()), a.appendChild(i), a.appendChild(o), b.appendChild(a);
    const r = document.createElement("div");
    r.style.border = "1px dashed #cbd5e1", r.style.padding = "8px", r.style.marginTop = "6px", b.appendChild(r);
    const u = document.createElement("div");
    u.style.display = "flex", u.style.flexWrap = "wrap", u.style.gap = "12px", u.style.alignItems = "center", u.style.marginBottom = "6px";
    const v = document.createElement("label");
    v.textContent = "Mode";
    const s = document.createElement("select");
    s.className = "form-select form-select-sm fb-group-mode", ["any", "all"].forEach((S) => {
      const q = document.createElement("option");
      q.value = S, q.textContent = S.toUpperCase() + (S === "any" ? " (OR)" : " (AND)"), s.appendChild(q);
    });
    const w = document.createElement("div");
    w.innerHTML = `
      <label style="margin-right:8px;">Actions</label>
      <label class="form-check form-check-inline"><input class="fb-act form-check-input" type="checkbox" value="show" checked> <span class="form-check-label">show</span></label>
      <label class="form-check form-check-inline"><input class="fb-act form-check-input" type="checkbox" value="require"> <span class="form-check-label">require</span></label>
      <label class="form-check form-check-inline"><input class="fb-act form-check-input" type="checkbox" value="enable"> <span class="form-check-label">enable</span></label>
      <label class="form-check form-check-inline"><input class="fb-act form-check-input" type="checkbox" value="disable"> <span class="form-check-label">disable</span></label>
      <label class="form-check form-check-inline"><input class="fb-act form-check-input" type="checkbox" value="hide"> <span class="form-check-label">hide</span></label>
    `, u.appendChild(v), u.appendChild(s), u.appendChild(w), r.appendChild(u);
    const E = document.createElement("div");
    E.className = "fb-group-rules", r.appendChild(E);
    const x = document.createElement("button");
    x.type = "button", x.className = "btn btn-sm btn-outline-secondary", x.textContent = "Add rule", x.style.marginTop = "8px", r.appendChild(x);
    function O(S, q, H) {
      const T = document.createElement("div");
      T.className = "fb-group-rule", T.style.display = "grid", T.style.gridTemplateColumns = "1fr 1fr 1fr auto", T.style.gap = "6px", T.style.marginTop = "6px";
      const j = document.createElement("select");
      j.className = "form-select form-select-sm fb-rule-field";
      const oe = p();
      if (oe.length)
        oe.forEach((G) => {
          const A = document.createElement("option");
          A.value = G.name, A.textContent = G.label ? `${G.label} (${G.name})` : G.name, j.appendChild(A);
        });
      else {
        const G = document.createElement("option");
        G.value = "", G.textContent = "(no fields yet)", j.appendChild(G);
      }
      S && (j.value = S);
      const P = document.createElement("select");
      P.className = "form-select form-select-sm fb-rule-op";
      const le = (G) => {
        var $;
        const A = p().find((X) => X.name === G), Z = (A == null ? void 0 : A.type) === "number", B = (A == null ? void 0 : A.type) === "radio-group" || (A == null ? void 0 : A.type) === "select" || !!(($ = A == null ? void 0 : A.values) != null && $.length), K = Z ? ["equals", "notEquals", "gt", "gte", "lt", "lte", "isEmpty", "notEmpty"] : B ? ["equals", "notEquals", "isEmpty", "notEmpty"] : ["equals", "notEquals", "contains", "startsWith", "endsWith", "isEmpty", "notEmpty"];
        P.innerHTML = "", K.forEach((X) => {
          const te = document.createElement("option");
          te.value = X, te.textContent = X, P.appendChild(te);
        });
      };
      le(j.value), q && (P.value = q);
      const Q = document.createElement("div");
      Q.className = "fb-rule-value-wrap";
      const se = (G, A) => {
        Q.innerHTML = "";
        const Z = h(G);
        if (Z && Z.length) {
          const B = document.createElement("select");
          B.className = "form-select form-select-sm fb-rule-value", Z.forEach((K) => {
            const $ = document.createElement("option");
            $.value = K.value, $.textContent = K.label ?? K.value, B.appendChild($);
          }), A && (B.value = A), Q.appendChild(B);
        } else {
          const B = document.createElement("input");
          B.type = "text", B.className = "form-control form-control-sm fb-rule-value", A && (B.value = A), Q.appendChild(B);
        }
      };
      se(j.value, H), j.addEventListener("change", () => {
        le(j.value), se(j.value);
      });
      const Y = document.createElement("button");
      Y.type = "button", Y.className = "btn btn-sm btn-outline-danger", Y.textContent = "Remove", Y.addEventListener("click", () => T.remove()), T.appendChild(j), T.appendChild(P), T.appendChild(Q), T.appendChild(Y), E.appendChild(T);
    }
    return x.addEventListener("click", () => O()), b._set = (S) => {
      S != null && S.mode && (s.value = S.mode);
      const q = new Set((S == null ? void 0 : S.actions) || []);
      w.querySelectorAll(".fb-act").forEach((H) => {
        H.checked = q.has(H.value);
      }), D(E), ((S == null ? void 0 : S.rules) || []).forEach((H) => O(H.field, H.op, H.value));
    }, F.appendChild(b), b;
  }
  function z(m) {
    D(F);
    const b = Object.keys(m || {});
    if (!b.length) {
      V("");
      return;
    }
    b.forEach((a) => {
      V(a)._set(m[a] || {});
    });
  }
  function U() {
    const m = {};
    return F.querySelectorAll(".fb-group-block").forEach((a) => {
      const i = a.querySelector(".fb-group-id").value.trim();
      if (!i) return;
      const o = a.querySelector(".fb-group-mode").value || "any", r = Array.from(a.querySelectorAll(".fb-act")).filter((s) => s.checked).map((s) => s.value), u = [];
      a.querySelectorAll(".fb-group-rule").forEach((s) => {
        const w = s.querySelector(".fb-rule-field").value, E = s.querySelector(".fb-rule-op").value, x = s.querySelector(".fb-rule-value"), O = (x == null ? void 0 : x.value) ?? "";
        w && E && u.push({ field: w, op: E, value: O });
      }), m[i] = { mode: o, rules: u, actions: r };
    }), m;
  }
  return {
    getJson: () => n.json,
    setJson: (m) => {
      n.json = m;
    },
    getGroups: () => J(n.json || "{}") || {}
  };
}
const Ae = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachLogicGroupsManager: de,
  withConditionalLogic: ue
}, Symbol.toStringTag, { value: "Module" }));
function re(e) {
  const t = window.CSS;
  return t && typeof t.escape == "function" ? t.escape(e) : e.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
}
function pe(e) {
  const t = re(e);
  return `[name="${t}"], [name="${t}[]"], [data-fb-name="${t}"]`;
}
function ce(e) {
  const t = [".form-group", ".fb-field-wrapper", ".form-field", ".field-wrapper", ".row", ".mb-3", ".box"];
  for (const l of t) {
    const n = e.closest(l);
    if (n) return n;
  }
  return e.parentElement || e;
}
function me(e) {
  var t, l;
  if (e instanceof HTMLInputElement) {
    if (e.type === "radio") {
      const n = e.name, d = ((t = e.form) == null ? void 0 : t.querySelectorAll(`input[type="radio"][name="${n}"]`)) || document.querySelectorAll(`input[type="radio"][name="${n}"]`);
      for (const p of Array.from(d)) {
        const h = p;
        if (h.checked) return h.value;
      }
      return null;
    }
    if (e.type === "checkbox") {
      const n = e.name, d = ((l = e.form) == null ? void 0 : l.querySelectorAll(`input[type="checkbox"][name="${n}"]`)) || document.querySelectorAll(`input[type="checkbox"][name="${n}"]`), p = [];
      return Array.from(d).forEach((h) => {
        const f = h;
        f.checked && p.push(f.value);
      }), p;
    }
    return e.value;
  }
  return e instanceof HTMLSelectElement ? e.multiple ? Array.from(e.selectedOptions).map((n) => n.value) : e.value : e instanceof HTMLTextAreaElement ? e.value : e.value ?? e.textContent ?? null;
}
function fe(e, t) {
  const l = t.op, n = t.value;
  if (Array.isArray(e))
    return l === "contains" || l === "equals" ? e.includes(n) : l === "notEquals" ? !e.includes(n) : l === "isEmpty" ? e.length === 0 : l === "notEmpty" ? e.length > 0 : !1;
  const d = e == null ? "" : String(e), p = n == null ? "" : String(n), h = Number(e), f = Number(n);
  switch (l) {
    case "equals":
      return e == n;
    case "notEquals":
      return e != n;
    case "contains":
      return d.includes(p);
    case "startsWith":
      return d.startsWith(p);
    case "endsWith":
      return d.endsWith(p);
    case "gt":
      return h > f;
    case "gte":
      return h >= f;
    case "lt":
      return h < f;
    case "lte":
      return h <= f;
    case "isEmpty":
      return d.trim() === "";
    case "notEmpty":
      return d.trim() !== "";
    default:
      return !1;
  }
}
function ye(e, t) {
  const l = t.rules.map((d) => {
    const p = e.querySelector(pe(d.field));
    if (!p) return !1;
    const h = me(p);
    return fe(h, d);
  }), n = t.mode === "all" ? l.every(Boolean) : l.some(Boolean);
  return window.__FB_LOGIC_DEBUG__ && console.log("[fb-logic] group", t, "results", l, "ok?", n), n;
}
function ae(e, t) {
  e.querySelectorAll("input, select, textarea, button").forEach((n) => {
    n.disabled = t, t && (n.required = !1);
  });
}
function be(e, t) {
  e.style.display = t ? "" : "none", e.setAttribute("aria-hidden", t ? "false" : "true");
}
function ge(e, t, l) {
  const n = t.includes("show") ? l : t.includes("hide") ? !l : l;
  be(e, n), t.includes("disable") && ae(e, !0), t.includes("enable") && ae(e, !1), t.includes("require") && e.querySelectorAll("input, select, textarea").forEach((p) => {
    p.required = n;
  });
}
function he(e) {
  const t = e.getAttribute("data-logic");
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return window.__FB_LOGIC_DEBUG__ && console.warn("Invalid data-logic JSON", t, e), null;
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
function Ee(e, t) {
  const l = re(t);
  return e.querySelectorAll(`[name="${l}"], [name="${l}[]"]`);
}
function xe(e, t) {
  if (t) {
    try {
      typeof t == "string" && (t = JSON.parse(t));
    } catch {
      return;
    }
    if (Array.isArray(t))
      for (const l of t) {
        const n = l == null ? void 0 : l.name;
        if (!n) continue;
        const d = Ee(e, n);
        if (!d.length) continue;
        const p = ve(l.logic), h = l.logicApplyTo || l.applyTo || "self", f = l.logicGroup;
        if (!p && f && h === "group") {
          d.forEach((g) => g.setAttribute("data-logic-group", String(f)));
          continue;
        }
        p && (h === "container" ? d.forEach((g) => {
          (typeof window.FB_GET_WRAPPER == "function" ? window.FB_GET_WRAPPER(g) : ce(g)).setAttribute("data-logic-container", p);
        }) : h === "group" && f ? d.forEach((g) => g.setAttribute("data-logic-group", String(f))) : d.forEach((g) => g.setAttribute("data-logic", p)));
      }
  }
}
function Se(e) {
  return e.actions && e.actions.length ? e.actions : ["show"];
}
function we(e) {
  const t = [];
  return e.querySelectorAll("[data-logic]").forEach((l) => {
    const n = he(l);
    n && t.push({ el: l, cfg: n, mode: "self" });
  }), e.querySelectorAll("[data-logic-container]").forEach((l) => {
    const n = l.getAttribute("data-logic-container");
    if (n)
      try {
        t.push({ el: l, cfg: JSON.parse(n), mode: "container" });
      } catch {
      }
  }), e.querySelectorAll("[data-logic-group]").forEach((l) => {
    var p;
    const n = l.getAttribute("data-logic-group") || "", d = (p = window.fbLogicGroups) == null ? void 0 : p[n];
    if (d) {
      const h = { groups: [d], actions: d.actions, applyTo: "group", logicGroup: n };
      t.push({ el: l, cfg: h, mode: "group", groupId: n });
    }
  }), window.__FB_LOGIC_DEBUG__ && console.log("[fb-logic] targets found:", t.length, t), t;
}
function ee(e, t, l) {
  const n = l.getWrapper || ce;
  t.forEach((d) => {
    const p = d.el;
    let h = !0;
    d.cfg.groups && d.cfg.groups.length && (h = d.cfg.groups.every((c) => ye(e, c)));
    const f = d.mode === "self" ? n(p) : d.mode === "container" ? p : n(p), g = Se(d.cfg);
    ge(f, g, h), l.onState && l.onState(p, h), window.__FB_LOGIC_DEBUG__ && console.log("[fb-logic] applied", { el: p, mode: d.mode, actions: g, truthy: h, wrapper: f });
  });
}
function ne(e, t, l = {}) {
  const n = e;
  try {
    if (t) {
      const f = Array.isArray(t) ? t : typeof t == "string" ? JSON.parse(t) : [];
      if (Array.isArray(f)) {
        const g = f.find((c) => (c == null ? void 0 : c.type) === "hidden" && ((c == null ? void 0 : c.name) === "__logicGroups" || (c == null ? void 0 : c.name) === "logicGroups"));
        if (g != null && g.value && typeof g.value == "string")
          try {
            const c = JSON.parse(g.value);
            c && typeof c == "object" && (window.fbLogicGroups = c);
          } catch {
          }
      }
    }
  } catch {
  }
  if (t)
    try {
      xe(n, t);
    } catch (f) {
      window.__FB_LOGIC_DEBUG__ && console.warn("hydrateFromFormData failed", f);
    }
  const d = we(n), p = /* @__PURE__ */ new Set();
  d.forEach((f) => {
    var c;
    (((c = f.cfg) == null ? void 0 : c.groups) || []).forEach((_) => {
      (_.rules || []).forEach((C) => {
        C != null && C.field && (p.add(C.field), p.add(String(C.field).replace(/\[\]$/, "")));
      });
    });
  }), window.__FB_LOGIC_DEBUG__ && console.log("[fb-logic] watching fields:", Array.from(p));
  const h = (f) => {
    const g = f.target;
    if (!g) return;
    const c = g.name || g.getAttribute && g.getAttribute("name") || "";
    if (!c) return;
    const _ = c.replace(/\[\]$/, "");
    (p.has(c) || p.has(_)) && (window.__FB_LOGIC_DEBUG__ && console.log("[fb-logic] change on", c, "→ reeval"), ee(n, d, l));
  };
  n.addEventListener("input", h, !0), n.addEventListener("change", h, !0), ee(n, d, l), n.addEventListener("fb:reinit-logic", () => ee(n, d, l)), window._fbLogic = { refresh: () => ee(n, d, l) };
}
function Ce(e) {
  ne(e);
}
function ke(e, t) {
  ne(e);
}
const qe = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  evaluateField: ke,
  refresh: Ce,
  setup: ne
}, Symbol.toStringTag, { value: "Module" }));
export {
  Ae as builder,
  ke as evaluateField,
  Ce as refresh,
  qe as renderer,
  ne as setup
};
//# sourceMappingURL=formbuilder-conditional-logic.es.js.map
