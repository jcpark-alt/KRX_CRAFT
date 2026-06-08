module.exports = {
  testEnvironment: "node",
  // Tests for any pure helpers extracted out of the .xml pages live under
  // test/ as *.test.js. There are none yet, so passWithNoTests keeps CI green.
  testMatch: ["**/test/**/*.test.js", "**/?(*.)+(spec|test).js"],
  testPathIgnorePatterns: ["/node_modules/", "/tools/"],
  passWithNoTests: true,
  // Page logic is embedded in .xml CDATA; coverage applies only to pure helpers
  // extracted into .js under the business-module trees.
  collectCoverageFrom: [
    "gcc/**/*.js",
    "ins/**/*.js",
    "mgt/**/*.js",
    "stf/**/*.js",
  ],
  coverageReporters: ["text", "lcov"],
  // NOTE: the source repo enforced a global 80% threshold. It is omitted here
  // because no .js sources exist yet (the JS is in XML). Re-add a
  // coverageThreshold block once pure helpers are extracted and tested.
};
