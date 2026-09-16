module.exports = {
  testEnvironment: "node",
  // Tests for any pure helpers extracted out of the .xml pages live under
  // test/ as *.test.js. There are none yet, so passWithNoTests keeps CI green.
  testMatch: ["**/test/**/*.test.js", "**/?(*.)+(spec|test).js"],
  testPathIgnorePatterns: ["/node_modules/", "/tools/"],
  passWithNoTests: true,
  // Page logic is embedded in .xml CDATA; coverage applies only to pure helpers
  // extracted into .js under the business-module trees.
  // cm/engine 은 대용량 WebSquare 엔진 번들 — 계측 시 워커가 죽으므로 커버리지 대상에서 제외
  // (eslint 도 cm/engine/** 를 ignore 한다).
  // cm/websquare 는 배포 WebSquare 설정 참조본(config.js 는 ES 모듈) — 실행 코드가 아니므로 계측 제외
  collectCoverageFrom: ["cm/**/*.js", "!cm/engine/**", "!cm/websquare/**"],
  coverageReporters: ["text", "lcov"],
  // NOTE: the source repo enforced a global 80% threshold. It is omitted here
  // because no .js sources exist yet (the JS is in XML). Re-add a
  // coverageThreshold block once pure helpers are extracted and tested.
};
