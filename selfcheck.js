/*
 * Data self-check (spec Section 9 / acceptance criterion 12).
 * Runs in the browser on page load (results in the console) and in Node via tests/selfcheck.test.js.
 */
(function (root) {
  "use strict";

  var EXPECTED_ZONES = {
    1: "HIGHLY_MATERIAL", 2: "HIGHLY_MATERIAL", 3: "MATERIAL", 4: "HIGHLY_MATERIAL",
    5: "MATERIAL", 6: "HIGHLY_MATERIAL", 7: "MATERIAL", 8: "MATERIAL",
    9: "HIGHLY_MATERIAL", 10: "HIGHLY_MATERIAL", 11: "HIGHLY_MATERIAL", 12: "MATERIAL",
    13: "MATERIAL", 14: "MATERIAL", 15: "MATERIAL", 16: "HIGHLY_MATERIAL"
  };

  function runSelfCheck(DMA) {
    var errors = [];
    function check(cond, msg) { if (!cond) errors.push(msg); }

    var topics = DMA.TOPICS;
    check(topics.length === 16, "Expected 16 topics, found " + topics.length);

    for (var n = 1; n <= 16; n++) {
      var t = topics.filter(function (x) { return x.n === n; });
      check(t.length === 1, "Topic " + DMA.pad2(n) + " should appear exactly once");
      if (t.length !== 1) continue;
      t = t[0];
      check(!!DMA.CATEGORIES[t.cat], "Topic " + DMA.pad2(n) + " has unknown category " + t.cat);
      ["f", "i"].forEach(function (k) {
        var v = t[k];
        check(typeof v === "number" && isFinite(v) && v >= 1 && v <= 5,
          "Topic " + DMA.pad2(n) + " score " + k + "=" + v + " is outside 1.0–5.0");
      });
      var zone = DMA.classify(t.f, t.i);
      check(zone === EXPECTED_ZONES[n],
        "Topic " + DMA.pad2(n) + " classified " + zone + ", expected " + EXPECTED_ZONES[n]);
    }

    var counts = { E: 0, S: 0, G: 0 };
    topics.forEach(function (t) { counts[t.cat]++; });
    check(counts.E === 8 && counts.S === 6 && counts.G === 2,
      "Category counts should be E 8, S 6, G 2; got " + JSON.stringify(counts));

    // Rule tests from the source document and spec edge cases.
    check(DMA.classify(3.3, 2.5) === "MATERIAL", "Worked example f=3.3, i=2.5 should be Material");
    check(DMA.classify(2.95, 2.95) === "WATCH_LIST", "2.95 / 2.95 should be Watch List");
    check(DMA.classify(2.95, 1.0) === "WATCH_LIST", "2.95 / 1.0 should be Watch List");
    check(DMA.classify(1.99, 1.99) === "NOT_MATERIAL", "1.99 / 1.99 should be Not Material");
    check(DMA.classify(2.0, 1.0) === "WATCH_LIST", "Boundary 2.0 belongs to Watch List");
    check(DMA.classify(3.0, 1.0) === "MATERIAL", "Boundary 3.0 belongs to Material");
    check(DMA.classify(3.5, 3.5) === "HIGHLY_MATERIAL", "Boundary 3.5/3.5 belongs to Highly Material");
    check(DMA.classify(5.0, 3.49) === "MATERIAL", "5.0 / 3.49 should be Material");

    return { ok: errors.length === 0, errors: errors };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = runSelfCheck;
  else root.runSelfCheck = runSelfCheck;
})(this);
