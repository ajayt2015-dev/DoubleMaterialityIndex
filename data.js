/*
 * The Corporate — Double Materiality Assessment data and classification rules.
 * Source: docs/reference/Materiality_Aggregated_Scores.xlsx, sheet "Aggregated".
 * Scores are final blended values (Employees, Suppliers, Investors, Customers — 25% each).
 * Works in the browser (window.DMA) and in Node (module.exports) for the self-check.
 */
(function (root) {
  "use strict";

  var CATEGORIES = {
    E: { code: "E", name: "Environmental", color: "#2E8B57", text: "#FFFFFF" },
    S: { code: "S", name: "Social", color: "#F2C200", text: "#000000" },
    G: { code: "G", name: "Governance", color: "#C62828", text: "#FFFFFF" }
  };

  var ZONES = {
    HIGHLY_MATERIAL: { id: "HIGHLY_MATERIAL", name: "Highly Material", color: "#F6CFCB", rule: "≥ 3.5 on both axes" },
    MATERIAL: { id: "MATERIAL", name: "Material", color: "#FBE0BD", rule: "≥ 3.0 on either axis" },
    WATCH_LIST: { id: "WATCH_LIST", name: "Watch List", color: "#E8E8E8", rule: "an axis 2.0–2.9, neither ≥ 3.0" },
    NOT_MATERIAL: { id: "NOT_MATERIAL", name: "Not Material", color: "#C4C4C4", rule: "both axes < 2.0" }
  };

  var ZONE_ORDER = ["HIGHLY_MATERIAL", "MATERIAL", "WATCH_LIST", "NOT_MATERIAL"];

  // n = topic number, f = financial score (x), i = impact score (y)
  var TOPICS = [
    { n: 1, name: "GHG Emissions (Scopes 1, 2, 3)", cat: "E", f: 3.73, i: 4.30 },
    { n: 2, name: "Energy Management & Renewable Transition", cat: "E", f: 3.58, i: 3.80 },
    { n: 3, name: "Water Stewardship", cat: "E", f: 3.28, i: 3.78 },
    { n: 4, name: "Hazardous Materials & Chemical Management", cat: "E", f: 4.03, i: 4.33 },
    { n: 5, name: "Waste Generation & Circular Economy", cat: "E", f: 3.43, i: 3.88 },
    { n: 6, name: "Upstream Supply Chain Emissions (Scope 3 Cat. 1)", cat: "E", f: 3.70, i: 4.28 },
    { n: 7, name: "Air Quality & Process Emissions", cat: "E", f: 3.18, i: 3.55 },
    { n: 8, name: "Product End-of-Life & E-Waste", cat: "E", f: 3.48, i: 4.13 },
    { n: 9, name: "Occupational Health & Safety", cat: "S", f: 3.95, i: 4.20 },
    { n: 10, name: "Labor Rights & Working Conditions", cat: "S", f: 4.43, i: 4.58 },
    { n: 11, name: "Responsible Minerals Sourcing", cat: "S", f: 4.13, i: 4.55 },
    { n: 12, name: "Community Impact & Local Employment", cat: "S", f: 3.13, i: 3.70 },
    { n: 13, name: "Workforce Development & Skills", cat: "S", f: 3.63, i: 3.35 },
    { n: 14, name: "Diversity, Equity & Inclusion", cat: "S", f: 3.20, i: 3.43 },
    { n: 15, name: "ESG Governance & Board Accountability", cat: "G", f: 3.70, i: 3.48 },
    { n: 16, name: "Multi-Jurisdictional Regulatory Compliance & Ethics", cat: "G", f: 4.33, i: 4.05 }
  ];

  // Approved thresholds (Stakeholder Engagement Strategy, 2 April 2026).
  // Evaluated top-down; the first match applies. Boundaries belong to the higher zone.
  function classify(f, i) {
    if (f >= 3.5 && i >= 3.5) return "HIGHLY_MATERIAL";
    if (f >= 3.0 || i >= 3.0) return "MATERIAL";
    if (f >= 2.0 || i >= 2.0) return "WATCH_LIST";
    return "NOT_MATERIAL";
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  var api = {
    CATEGORIES: CATEGORIES,
    ZONES: ZONES,
    ZONE_ORDER: ZONE_ORDER,
    TOPICS: TOPICS,
    classify: classify,
    pad2: pad2
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DMA = api;
})(this);
