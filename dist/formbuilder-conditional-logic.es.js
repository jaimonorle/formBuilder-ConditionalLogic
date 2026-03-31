const ue = [
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
function de(e = {}) {
  const t = e.panelTitle || "Conditional Logic", l = e.types && e.types.length ? e.types : ue, n = e.enableVisualEditor !== !1, u = e.builderSelector || ".build-wrap", p = {};
  l.forEach((m) => {
    p[m] = {
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
  function b(m, g, x, N) {
    const _ = document.createElement("div");
    _.className = "fb-logic-ve", _.style.marginBottom = "8px";
    const O = document.createElement("div");
    O.style.display = "flex", O.style.gap = "6px", O.style.alignItems = "center";
    const D = document.createElement("strong");
    D.textContent = "Conditional Logic (Visual)";
    const k = document.createElement("span");
    k.style.fontSize = "12px", k.style.opacity = "0.7", k.textContent = "— use this editor then save to JSON below", O.appendChild(D), O.appendChild(k), _.appendChild(O);
    const f = document.createElement("div");
    f.className = "fb-logic-ve-body", f.style.border = "1px dashed #cbd5e1", f.style.padding = "8px", f.style.marginTop = "6px", _.appendChild(f);
    const L = document.createElement("div");
    L.style.margin = "6px 0", L.innerHTML = `
    <label style="margin-right:8px;">Mode</label>
    <select class="ve-mode form-select form-select-sm" style="display:inline-block; width:auto;">
      <option value="any">ANY (OR)</option>
      <option value="all">ALL (AND)</option>
    </select>
  `, f.appendChild(L);
    const I = document.createElement("div");
    I.style.margin = "6px 0", I.innerHTML = `
    <label style="margin-right:8px;">Actions</label>
    <label class="form-check form-check-inline"><input class="ve-act form-check-input" type="checkbox" value="show" checked> <span class="form-check-label">show</span></label>
    <label class="form-check form-check-inline"><input class="ve-act form-check-input" type="checkbox" value="require"> <span class="form-check-label">require</span></label>
    <label class="form-check form-check-inline"><input class="ve-act form-check-input" type="checkbox" value="enable"> <span class="form-check-label">enable</span></label>
    <label class="form-check form-check-inline"><input class="ve-act form-check-input" type="checkbox" value="disable"> <span class="form-check-label">disable</span></label>
    <label class="form-check form-check-inline"><input class="ve-act form-check-input" type="checkbox" value="hide"> <span class="form-check-label">hide</span></label>
  `, f.appendChild(I);
    const H = document.createElement("div");
    H.className = "ve-rules", H.style.marginTop = "6px", H.style.display = "grid", H.style.gap = "6px", f.appendChild(H);
    const M = document.createElement("div");
    M.style.display = "flex", M.style.justifyContent = "flex-end", M.style.gap = "8px", M.style.marginTop = "8px";
    const W = document.createElement("button");
    W.type = "button", W.className = "btn btn-sm btn-outline-secondary", W.textContent = "Add rule";
    const j = document.createElement("button");
    j.type = "button", j.className = "btn btn-sm btn-primary", j.textContent = "Save to JSON", M.appendChild(W), M.appendChild(j), f.appendChild(M);
    const $ = () => {
      var r, c, o, a;
      try {
        const i = (r = window.jQuery) == null ? void 0 : r.call(window, u), h = (c = i == null ? void 0 : i.data) == null ? void 0 : c.call(i, "formBuilder"), s = (a = (o = h == null ? void 0 : h.actions) == null ? void 0 : o.getData) == null ? void 0 : a.call(o, "json");
        return (typeof s == "string" ? JSON.parse(s) : Array.isArray(s) ? s : []).filter((E) => E == null ? void 0 : E.name).map((E) => ({
          name: E.name,
          type: E.type,
          label: E.label,
          values: Array.isArray(E.values) ? E.values.map((S) => ({ label: S.label ?? S.value, value: S.value })) : void 0
        }));
      } catch {
        return [];
      }
    }, z = (r) => {
      const c = $().find((o) => o.name === r);
      return (c == null ? void 0 : c.values) ?? null;
    }, U = () => {
      const r = document.createElement("select");
      r.className = "ve-field form-select form-select-sm", r.style.minWidth = "160px";
      const c = $();
      if (c.length)
        c.forEach((o) => {
          const a = document.createElement("option");
          a.value = o.name, a.textContent = o.label ? `${o.label} (${o.name})` : o.name, r.appendChild(a);
        });
      else {
        const o = document.createElement("option");
        o.value = "", o.textContent = "(no fields yet)", r.appendChild(o);
      }
      return r;
    }, P = (r) => {
      var s;
      const c = document.createElement("select");
      c.className = "ve-op form-select form-select-sm", c.style.minWidth = "140px";
      const o = $().find((C) => C.name === r), a = (o == null ? void 0 : o.type) === "number", i = (o == null ? void 0 : o.type) === "radio-group" || (o == null ? void 0 : o.type) === "select" || !!((s = o == null ? void 0 : o.values) != null && s.length), h = a ? ["equals", "notEquals", "gt", "gte", "lt", "lte", "isEmpty", "notEmpty"] : i ? ["equals", "notEquals", "isEmpty", "notEmpty"] : ["equals", "notEquals", "contains", "startsWith", "endsWith", "isEmpty", "notEmpty"];
      return c.innerHTML = "", h.forEach((C) => {
        const E = document.createElement("option");
        E.value = C, E.textContent = C, c.appendChild(E);
      }), c;
    }, d = (r, c) => {
      const o = z(r);
      if (o && o.length) {
        const i = document.createElement("select");
        return i.className = "ve-value form-select form-select-sm", o.forEach((h) => {
          const s = document.createElement("option");
          s.value = h.value, s.textContent = h.label ?? h.value, i.appendChild(s);
        }), i;
      }
      const a = document.createElement("input");
      return a.className = "ve-value form-control form-control-sm", a.type = "text", a;
    };
    function y(r, c, o) {
      var G;
      const a = document.createElement("div");
      a.className = "ve-row", a.style.display = "flex", a.style.gap = "6px", a.style.alignItems = "center";
      const i = U(), h = r || ((G = i.options[0]) == null ? void 0 : G.value) || "", s = P(h), C = document.createElement("div"), E = (w, q) => {
        C.innerHTML = "", C.appendChild(d(w));
      };
      if (r && (i.value = r), E(i.value), c) {
        const w = P(i.value);
        s.innerHTML = w.innerHTML, s.value = c;
      }
      o != null && (C.querySelector(".ve-value").value = o), i.addEventListener("change", () => {
        const w = P(i.value);
        s.innerHTML = w.innerHTML, E(i.value);
      }), a.appendChild(i), a.appendChild(s), a.appendChild(C);
      const S = document.createElement("button");
      S.type = "button", S.className = "btn btn-sm btn-outline-danger", S.textContent = "Remove", S.addEventListener("click", () => a.remove()), a.appendChild(S), H.appendChild(a);
    }
    W.addEventListener("click", () => y()), j.addEventListener("click", () => {
      const r = f.querySelector(".ve-mode").value, c = Array.from(f.querySelectorAll(".ve-act")).filter((s) => s.checked).map((s) => s.value), a = Array.from(f.querySelectorAll(".ve-row")).map((s) => {
        const C = s.querySelector(".ve-field").value, E = s.querySelector(".ve-op").value, G = s.querySelector(".ve-value").value ?? "";
        return { field: C, op: E, value: G };
      }), i = { groups: [{ mode: r, rules: a, actions: c }] }, h = g();
      h ? (h.value = JSON.stringify(i, null, 2), alert("Conditional Logic JSON updated.")) : alert("Could not find the logic JSON field to update.");
    });
    try {
      const r = g(), c = r && r.value || "";
      if (c && c.trim()) {
        const o = JSON.parse(c), a = Array.isArray(o.groups) ? o.groups[0] : null;
        if (a) {
          f.querySelector(".ve-mode").value = a.mode || "any";
          const i = new Set(a.actions || []);
          f.querySelectorAll(".ve-act").forEach((h) => {
            h.checked = i.has(h.value);
          }), (a.rules || []).forEach((h) => y(h.field, h.op, h.value));
        }
      }
    } catch {
    }
    m.prepend(_);
  }
  function v(m) {
    const g = Array.from(
      m.querySelectorAll('[name="logic"], [name="logicApplyTo"], [name="logicGroup"]')
    );
    if (!g.length) return;
    let x = m.querySelector(".fb-logic-section");
    if (!x) {
      x = document.createElement("div"), x.className = "fb-logic-section", x.innerHTML = `
      <div class="fb-logic-header" style="margin-top:8px; font-weight:600; cursor:pointer;">
        ${t}
        <span style="font-weight:400; font-size:12px; opacity:.7"> (toggle)</span>
      </div>
      <div class="fb-logic-body" style="border:1px solid #e5e7eb; padding:8px; margin-top:6px; display:none;"></div>
    `, m.appendChild(x);
      const k = x.querySelector(".fb-logic-header"), f = x.querySelector(".fb-logic-body");
      k.addEventListener("click", () => {
        const L = f.style.display !== "none";
        f.style.display = L ? "none" : "";
      });
    }
    const N = x.querySelector(".fb-logic-body");
    let _ = N.querySelector(".fb-logic-advanced");
    if (!_) {
      _ = document.createElement("div"), _.className = "fb-logic-advanced", _.innerHTML = `
      <div class="fb-logic-adv-header" style="margin-top:10px; font-weight:600; cursor:pointer;">
        Advanced (JSON)
        <span style="font-weight:400; font-size:12px; opacity:.7"> (toggle)</span>
      </div>
      <div class="fb-logic-adv-body" style="border:1px dashed #cbd5e1; padding:8px; margin-top:6px; display:none;"></div>
    `, N.appendChild(_);
      const k = _.querySelector(".fb-logic-adv-header"), f = _.querySelector(".fb-logic-adv-body");
      k.addEventListener("click", () => {
        const L = f.style.display !== "none";
        f.style.display = L ? "none" : "";
      });
    }
    const O = _.querySelector(".fb-logic-adv-body");
    g.forEach((k) => {
      const f = k.closest(".form-group") || k.closest("div") || k;
      f && f.parentElement !== O && O.appendChild(f);
    });
    const D = /* @__PURE__ */ new Set();
    if (O.querySelectorAll('[name="logic"], [name="logicApplyTo"], [name="logicGroup"]').forEach((k) => {
      const f = k.getAttribute("name");
      if (D.has(f)) {
        const L = k.closest(".form-group") || k.closest("div") || k;
        L && L.parentElement === O && L.remove();
      } else
        D.add(f);
    }), n) {
      const k = () => N.querySelector('[name="logic"]');
      if (!N.querySelector(".fb-logic-ve")) {
        const f = N.querySelectorAll(".fb-logic-ve");
        f.length > 1 && f.forEach((L, I) => {
          I > 0 && L.remove();
        }), b(N, k);
      }
    }
  }
  return { typeUserAttrs: p, onOpenFieldEdit: v };
}
function pe(e, t) {
  const l = typeof t == "string" ? { initialJson: t } : t || {}, n = { json: l.initialJson || "" }, u = l.builderSelector || ".build-wrap";
  function p() {
    var d, y, r, c;
    try {
      const o = (d = window.jQuery) == null ? void 0 : d.call(window, u), a = (y = o == null ? void 0 : o.data) == null ? void 0 : y.call(o, "formBuilder"), i = (c = (r = a == null ? void 0 : a.actions) == null ? void 0 : r.getData) == null ? void 0 : c.call(r, "json");
      return (typeof i == "string" ? JSON.parse(i) : Array.isArray(i) ? i : []).filter((s) => s == null ? void 0 : s.name).map((s) => ({
        name: s.name,
        type: s.type,
        label: s.label,
        values: Array.isArray(s.values) ? s.values.map((C) => ({ label: C.label ?? C.value, value: C.value })) : void 0
      }));
    } catch {
      return [];
    }
  }
  const b = () => {
    var d;
    try {
      const y = (d = l.getAvailableFields) == null ? void 0 : d.call(l);
      if (y && y.length) return y;
    } catch {
    }
    return p();
  }, v = (d) => {
    var r;
    try {
      const c = (r = l.getFieldValues) == null ? void 0 : r.call(l, d);
      if (c) return c;
    } catch {
    }
    const y = b().find((c) => c.name === d);
    return (y == null ? void 0 : y.values) ?? null;
  }, m = document.createElement("div");
  m.style.margin = "8px 0", m.innerHTML = `
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
  `, e.prepend(m);
  const g = m.querySelector("button"), x = m.querySelector(".fb-logic-modal"), N = x.querySelector(".fb-logic-close"), _ = x.querySelector(".fb-groups-load-sample"), O = x.querySelector(".fb-groups-save"), D = x.querySelector(".fb-groups-from-json"), k = x.querySelector(".fb-groups-adv-header"), f = x.querySelector(".fb-groups-adv-body"), L = x.querySelector(".fb-logic-json"), I = x.querySelector(".fb-groups-list"), H = x.querySelector(".fb-groups-add"), M = () => {
    const d = window.fbLogicGroups && typeof window.fbLogicGroups == "object" ? window.fbLogicGroups : n.json ? j(n.json) : {};
    n.json = JSON.stringify(d || {}, null, 2), L.value = n.json, U(d || {}), x.style.display = "block";
  }, W = () => {
    x.style.display = "none";
  };
  g.addEventListener("click", M), N.addEventListener("click", W), x.addEventListener("click", (d) => {
    d.target === x && W();
  }), k.addEventListener("click", () => {
    const d = f.style.display !== "none";
    f.style.display = d ? "none" : "";
  }), _.addEventListener("click", () => {
    var c;
    const r = {
      vehicleDetails: {
        mode: "any",
        rules: [{ field: ((c = b()[0]) == null ? void 0 : c.name) || "controller", op: "equals", value: "yes" }],
        actions: ["show", "require"]
      }
    };
    L.value = JSON.stringify(r, null, 2), U(r);
  }), D.addEventListener("click", () => {
    const d = j(L.value) || {};
    U(d);
  }), O.addEventListener("click", () => {
    var y, r, c;
    const d = P();
    n.json = JSON.stringify(d, null, 2), L.value = n.json, window.fbLogicGroups = d;
    try {
      const o = (y = window.jQuery) == null ? void 0 : y.call(window, u), a = (r = o == null ? void 0 : o.data) == null ? void 0 : r.call(o, "formBuilder");
      if ((c = a == null ? void 0 : a.actions) != null && c.getData && !a.__fbLogicGroupsPatched) {
        const i = a.actions.getData.bind(a.actions);
        a.__fbLogicGroupsPatched = !0, a.actions.getData = (h) => {
          const s = i(h);
          if (h !== "json") return s;
          const C = window.fbLogicGroups || j(n.json) || {}, E = JSON.stringify(C);
          try {
            const S = typeof s == "string" ? JSON.parse(s) : Array.isArray(s) ? s : [], G = S.findIndex((q) => (q == null ? void 0 : q.type) === "hidden" && ((q == null ? void 0 : q.name) === "__logicGroups" || (q == null ? void 0 : q.name) === "logicGroups")), w = { type: "hidden", name: "__logicGroups", value: E, label: " ", access: !1, className: "d-none" };
            return G >= 0 ? S[G] = { ...S[G], ...w } : S.push(w), JSON.stringify(S);
          } catch {
            return s;
          }
        };
      }
    } catch (o) {
      console.warn("[logic-groups] export patch failed", o);
    }
    alert("Logic groups saved (no rebuild). They will be embedded into exported JSON automatically."), W();
  }), H.addEventListener("click", () => z());
  function j(d) {
    try {
      return JSON.parse(d);
    } catch {
      return null;
    }
  }
  function $(d) {
    for (; d.firstChild; ) d.removeChild(d.firstChild);
  }
  function z(d = "") {
    const y = document.createElement("div");
    y.className = "fb-group-block", y.style.border = "1px solid #e5e7eb", y.style.borderRadius = "6px", y.style.padding = "8px", y.style.marginTop = "8px";
    const r = document.createElement("div");
    r.style.display = "grid", r.style.gridTemplateColumns = "1fr auto", r.style.gap = "8px", r.style.alignItems = "center";
    const c = document.createElement("input");
    c.className = "form-control form-control-sm fb-group-id", c.placeholder = "Group ID (e.g., vehicleDetails)", c.value = d;
    const o = document.createElement("button");
    o.type = "button", o.className = "btn btn-sm btn-link text-danger", o.textContent = "remove group", o.addEventListener("click", () => y.remove()), r.appendChild(c), r.appendChild(o), y.appendChild(r);
    const a = document.createElement("div");
    a.style.border = "1px dashed #cbd5e1", a.style.padding = "8px", a.style.marginTop = "6px", y.appendChild(a);
    const i = document.createElement("div");
    i.style.display = "flex", i.style.flexWrap = "wrap", i.style.gap = "12px", i.style.alignItems = "center", i.style.marginBottom = "6px";
    const h = document.createElement("label");
    h.textContent = "Mode";
    const s = document.createElement("select");
    s.className = "form-select form-select-sm fb-group-mode", ["any", "all"].forEach((w) => {
      const q = document.createElement("option");
      q.value = w, q.textContent = w.toUpperCase() + (w === "any" ? " (OR)" : " (AND)"), s.appendChild(q);
    });
    const C = document.createElement("div");
    C.innerHTML = `
      <label style="margin-right:8px;">Actions</label>
      <label class="form-check form-check-inline"><input class="fb-act form-check-input" type="checkbox" value="show" checked> <span class="form-check-label">show</span></label>
      <label class="form-check form-check-inline"><input class="fb-act form-check-input" type="checkbox" value="require"> <span class="form-check-label">require</span></label>
      <label class="form-check form-check-inline"><input class="fb-act form-check-input" type="checkbox" value="enable"> <span class="form-check-label">enable</span></label>
      <label class="form-check form-check-inline"><input class="fb-act form-check-input" type="checkbox" value="disable"> <span class="form-check-label">disable</span></label>
      <label class="form-check form-check-inline"><input class="fb-act form-check-input" type="checkbox" value="hide"> <span class="form-check-label">hide</span></label>
    `, i.appendChild(h), i.appendChild(s), i.appendChild(C), a.appendChild(i);
    const E = document.createElement("div");
    E.className = "fb-group-rules", a.appendChild(E);
    const S = document.createElement("button");
    S.type = "button", S.className = "btn btn-sm btn-outline-secondary", S.textContent = "Add rule", S.style.marginTop = "8px", a.appendChild(S);
    function G(w, q, R) {
      const B = document.createElement("div");
      B.className = "fb-group-rule", B.style.display = "grid", B.style.gridTemplateColumns = "1fr 1fr 1fr auto", B.style.gap = "6px", B.style.marginTop = "6px";
      const F = document.createElement("select");
      F.className = "form-select form-select-sm fb-rule-field";
      const le = b();
      if (le.length)
        le.forEach((T) => {
          const A = document.createElement("option");
          A.value = T.name, A.textContent = T.label ? `${T.label} (${T.name})` : T.name, F.appendChild(A);
        });
      else {
        const T = document.createElement("option");
        T.value = "", T.textContent = "(no fields yet)", F.appendChild(T);
      }
      w && (F.value = w);
      const Q = document.createElement("select");
      Q.className = "form-select form-select-sm fb-rule-op";
      const se = (T) => {
        var V;
        const A = b().find((ee) => ee.name === T), K = (A == null ? void 0 : A.type) === "number", J = (A == null ? void 0 : A.type) === "radio-group" || (A == null ? void 0 : A.type) === "select" || !!((V = A == null ? void 0 : A.values) != null && V.length), X = K ? ["equals", "notEquals", "gt", "gte", "lt", "lte", "isEmpty", "notEmpty"] : J ? ["equals", "notEquals", "isEmpty", "notEmpty"] : ["equals", "notEquals", "contains", "startsWith", "endsWith", "isEmpty", "notEmpty"];
        Q.innerHTML = "", X.forEach((ee) => {
          const ne = document.createElement("option");
          ne.value = ee, ne.textContent = ee, Q.appendChild(ne);
        });
      };
      se(F.value), q && (Q.value = q);
      const Y = document.createElement("div");
      Y.className = "fb-rule-value-wrap";
      const re = (T, A) => {
        Y.innerHTML = "";
        const K = v(T);
        if (K && K.length) {
          const J = document.createElement("select");
          J.className = "form-select form-select-sm fb-rule-value", K.forEach((X) => {
            const V = document.createElement("option");
            V.value = X.value, V.textContent = X.label ?? X.value, J.appendChild(V);
          }), A && (J.value = A), Y.appendChild(J);
        } else {
          const J = document.createElement("input");
          J.type = "text", J.className = "form-control form-control-sm fb-rule-value", A && (J.value = A), Y.appendChild(J);
        }
      };
      re(F.value, R), F.addEventListener("change", () => {
        se(F.value), re(F.value);
      });
      const Z = document.createElement("button");
      Z.type = "button", Z.className = "btn btn-sm btn-outline-danger", Z.textContent = "Remove", Z.addEventListener("click", () => B.remove()), B.appendChild(F), B.appendChild(Q), B.appendChild(Y), B.appendChild(Z), E.appendChild(B);
    }
    return S.addEventListener("click", () => G()), y._set = (w) => {
      w != null && w.mode && (s.value = w.mode);
      const q = new Set((w == null ? void 0 : w.actions) || []);
      C.querySelectorAll(".fb-act").forEach((R) => {
        R.checked = q.has(R.value);
      }), $(E), ((w == null ? void 0 : w.rules) || []).forEach((R) => G(R.field, R.op, R.value));
    }, I.appendChild(y), y;
  }
  function U(d) {
    $(I);
    const y = Object.keys(d || {});
    if (!y.length) {
      z("");
      return;
    }
    y.forEach((r) => {
      z(r)._set(d[r] || {});
    });
  }
  function P() {
    const d = {};
    return I.querySelectorAll(".fb-group-block").forEach((r) => {
      const c = r.querySelector(".fb-group-id").value.trim();
      if (!c) return;
      const o = r.querySelector(".fb-group-mode").value || "any", a = Array.from(r.querySelectorAll(".fb-act")).filter((s) => s.checked).map((s) => s.value), i = [];
      r.querySelectorAll(".fb-group-rule").forEach((s) => {
        const C = s.querySelector(".fb-rule-field").value, E = s.querySelector(".fb-rule-op").value, S = s.querySelector(".fb-rule-value"), G = (S == null ? void 0 : S.value) ?? "";
        C && E && i.push({ field: C, op: E, value: G });
      }), d[c] = { mode: o, rules: i, actions: a };
    }), d;
  }
  return {
    getJson: () => n.json,
    setJson: (d) => {
      n.json = d;
    },
    getGroups: () => j(n.json || "{}") || {}
  };
}
const qe = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachLogicGroupsManager: pe,
  withConditionalLogic: de
}, Symbol.toStringTag, { value: "Module" }));
function ce(e) {
  const t = window.CSS;
  return t && typeof t.escape == "function" ? t.escape(e) : e.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
}
function me(e) {
  const t = ce(e);
  return `[name="${t}"], [name="${t}[]"], [data-fb-name="${t}"]`;
}
function ie(e) {
  const t = [".form-group", ".fb-field-wrapper", ".form-field", ".field-wrapper", ".row", ".mb-3", ".box"];
  for (const l of t) {
    const n = e.closest(l);
    if (n) return n;
  }
  return e.parentElement || e;
}
function fe(e) {
  var t, l;
  if (e instanceof HTMLInputElement) {
    if (e.type === "radio") {
      const n = e.name, u = ((t = e.form) == null ? void 0 : t.querySelectorAll(`input[type="radio"][name="${n}"]`)) || document.querySelectorAll(`input[type="radio"][name="${n}"]`);
      for (const p of Array.from(u)) {
        const b = p;
        if (b.checked) return b.value;
      }
      return null;
    }
    if (e.type === "checkbox") {
      const n = e.name, u = ((l = e.form) == null ? void 0 : l.querySelectorAll(`input[type="checkbox"][name="${n}"]`)) || document.querySelectorAll(`input[type="checkbox"][name="${n}"]`), p = [];
      return Array.from(u).forEach((b) => {
        const v = b;
        v.checked && p.push(v.value);
      }), p;
    }
    return e.value;
  }
  return e instanceof HTMLSelectElement ? e.multiple ? Array.from(e.selectedOptions).map((n) => n.value) : e.value : e instanceof HTMLTextAreaElement ? e.value : e.value ?? e.textContent ?? null;
}
function ye(e, t) {
  const l = t.op, n = t.value;
  if (Array.isArray(e))
    return l === "contains" || l === "equals" ? e.includes(n) : l === "notEquals" ? !e.includes(n) : l === "isEmpty" ? e.length === 0 : l === "notEmpty" ? e.length > 0 : !1;
  const u = e == null ? "" : String(e), p = n == null ? "" : String(n), b = Number(e), v = Number(n);
  switch (l) {
    case "equals":
      return e == n;
    case "notEquals":
      return e != n;
    case "contains":
      return u.includes(p);
    case "startsWith":
      return u.startsWith(p);
    case "endsWith":
      return u.endsWith(p);
    case "gt":
      return b > v;
    case "gte":
      return b >= v;
    case "lt":
      return b < v;
    case "lte":
      return b <= v;
    case "isEmpty":
      return u.trim() === "";
    case "notEmpty":
      return u.trim() !== "";
    default:
      return !1;
  }
}
function be(e, t) {
  const l = t.rules.map((u) => {
    const p = e.querySelector(me(u.field));
    if (!p) return !1;
    const b = fe(p);
    return ye(b, u);
  }), n = t.mode === "all" ? l.every(Boolean) : l.some(Boolean);
  return window.__FB_LOGIC_DEBUG__ && console.log("[fb-logic] group", t, "results", l, "ok?", n), n;
}
function ae(e, t) {
  e.querySelectorAll("input, select, textarea, button").forEach((n) => {
    n.disabled = t, t && (n.required = !1);
  });
}
function ge(e, t) {
  e.style.display = t ? "" : "none", e.setAttribute("aria-hidden", t ? "false" : "true");
}
function he(e, t, l) {
  const n = t.includes("show") ? l : t.includes("hide") ? !l : l;
  ge(e, n), t.includes("disable") && ae(e, !0), t.includes("enable") && ae(e, !1), t.includes("require") && e.querySelectorAll("input, select, textarea").forEach((p) => {
    p.required = n;
  });
}
function ve(e) {
  const t = e.getAttribute("data-logic");
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return window.__FB_LOGIC_DEBUG__ && console.warn("Invalid data-logic JSON", t, e), null;
  }
}
function Ee(e) {
  if (!e) return null;
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return null;
  }
}
function xe(e, t) {
  const l = ce(t);
  return e.querySelectorAll(`[name="${l}"], [name="${l}[]"]`);
}
function Se(e, t) {
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
        const u = xe(e, n);
        if (!u.length) continue;
        const p = Ee(l.logic), b = l.logicApplyTo || l.applyTo || "self", v = l.logicGroup;
        if (!p && v && b === "group") {
          u.forEach((m) => m.setAttribute("data-logic-group", String(v)));
          continue;
        }
        p && (b === "container" ? u.forEach((m) => {
          (typeof window.FB_GET_WRAPPER == "function" ? window.FB_GET_WRAPPER(m) : ie(m)).setAttribute("data-logic-container", p);
        }) : b === "group" && v ? u.forEach((m) => m.setAttribute("data-logic-group", String(v))) : u.forEach((m) => m.setAttribute("data-logic", p)));
      }
  }
}
function we(e) {
  return e.actions && e.actions.length ? e.actions : ["show"];
}
function Ce(e) {
  const t = [];
  return e.querySelectorAll("[data-logic]").forEach((l) => {
    const n = ve(l);
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
    const n = l.getAttribute("data-logic-group") || "", u = (p = window.fbLogicGroups) == null ? void 0 : p[n];
    if (u) {
      const b = { groups: [u], actions: u.actions, applyTo: "group", logicGroup: n };
      t.push({ el: l, cfg: b, mode: "group", groupId: n });
    }
  }), window.__FB_LOGIC_DEBUG__ && console.log("[fb-logic] targets found:", t.length, t), t;
}
function te(e, t, l) {
  const n = l.getWrapper || ie;
  t.forEach((u) => {
    const p = u.el;
    let b = !0;
    u.cfg.groups && u.cfg.groups.length && (b = u.cfg.groups.every((g) => be(e, g)));
    const v = u.mode === "self" ? n(p) : u.mode === "container" ? p : n(p), m = we(u.cfg);
    he(v, m, b), l.onState && l.onState(p, b), window.__FB_LOGIC_DEBUG__ && console.log("[fb-logic] applied", { el: p, mode: u.mode, actions: m, truthy: b, wrapper: v });
  });
}
function oe(e, t, l = {}) {
  const n = e;
  try {
    if (t) {
      const v = Array.isArray(t) ? t : typeof t == "string" ? JSON.parse(t) : [];
      if (Array.isArray(v)) {
        const m = v.find((g) => (g == null ? void 0 : g.type) === "hidden" && ((g == null ? void 0 : g.name) === "__logicGroups" || (g == null ? void 0 : g.name) === "logicGroups"));
        if (m != null && m.value && typeof m.value == "string")
          try {
            const g = JSON.parse(m.value);
            g && typeof g == "object" && (window.fbLogicGroups = g);
          } catch {
          }
      }
    }
  } catch {
  }
  if (t)
    try {
      Se(n, t);
    } catch (v) {
      window.__FB_LOGIC_DEBUG__ && console.warn("hydrateFromFormData failed", v);
    }
  const u = Ce(n), p = /* @__PURE__ */ new Set();
  u.forEach((v) => {
    var g;
    (((g = v.cfg) == null ? void 0 : g.groups) || []).forEach((x) => {
      (x.rules || []).forEach((N) => {
        N != null && N.field && (p.add(N.field), p.add(String(N.field).replace(/\[\]$/, "")));
      });
    });
  }), window.__FB_LOGIC_DEBUG__ && console.log("[fb-logic] watching fields:", Array.from(p));
  const b = (v) => {
    const m = v.target;
    if (!m) return;
    const g = m.name || m.getAttribute && m.getAttribute("name") || "";
    if (!g) return;
    const x = g.replace(/\[\]$/, "");
    (p.has(g) || p.has(x)) && (window.__FB_LOGIC_DEBUG__ && console.log("[fb-logic] change on", g, "→ reeval"), te(n, u, l));
  };
  n.addEventListener("input", b, !0), n.addEventListener("change", b, !0), te(n, u, l), n.addEventListener("fb:reinit-logic", () => te(n, u, l)), window._fbLogic = { refresh: () => te(n, u, l) };
}
function ke(e) {
  oe(e);
}
function Ae(e, t) {
  oe(e);
}
const Le = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  evaluateField: Ae,
  refresh: ke,
  setup: oe
}, Symbol.toStringTag, { value: "Module" }));
export {
  qe as builder,
  Ae as evaluateField,
  ke as refresh,
  Le as renderer,
  oe as setup
};
//# sourceMappingURL=formbuilder-conditional-logic.es.js.map
