// Run with: node tests/selfcheck.test.js
"use strict";
var DMA = require("../data.js");
var runSelfCheck = require("../selfcheck.js");

var result = runSelfCheck(DMA);
if (!result.ok) {
  console.error("Self-check FAILED:");
  result.errors.forEach(function (e) { console.error("  - " + e); });
  process.exit(1);
}

var tally = {};
DMA.TOPICS.forEach(function (t) {
  var z = DMA.ZONES[DMA.classify(t.f, t.i)].name;
  tally[z] = (tally[z] || 0) + 1;
});
console.log("Self-check passed: 16 topics, scores in range, zones match spec.", tally);
