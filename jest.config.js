module.exports = {
  testEnvironment: "node",
  // Tests for any pure helpers extracted out of the .xml pages live under
  // test/ as *.test.js. There are none yet, so passWithNoTests keeps CI green.
  testMatch: ["**/test/**/*.test.js", "**/?(*.)+(spec|test).js"],
  testPathIgnorePatterns: ["/node_modules/", "/tools/"],
  passWithNoTests: true,
  // Page logic is embedded in .xml CDATA; coverage applies only to pure helpers
  // extracted into .js under the business-module trees.
  // websquare/(엔진 번들 websquare/engine + 배포 설정 참조본 config.js/config.xml)는 cm/ 밖이라 커버리지 대상이 아니다
  // (대용량 엔진 번들은 계측 시 워커가 죽고, config.js 는 ES 모듈 참조본이라 실행 코드가 아니다; eslint 도 websquare/** 를 ignore 한다)
  collectCoverageFrom: ["cm/**/*.js"],
  coverageReporters: ["text", "lcov"],
  // NOTE: the source repo enforced a global 80% threshold. It is omitted here
  // because no .js sources exist yet (the JS is in XML). Re-add a
  // coverageThreshold block once pure helpers are extracted and tested.
};
