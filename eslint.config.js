const globals = require("globals");

// ESLint 9+ flat config for the KRX_Craft WebSquare tree.
//
// SCOPE: this project's business logic lives as JavaScript embedded inside
// <script><![CDATA[ ... ]]> blocks in the .xml pages under gcc/ ins/ mgt/ stf/.
// ESLint only lints standalone *.js files, so on this tree it covers tooling/
// config and any helpers later extracted into .js. To lint the XML pages
// themselves use wsxml_lint:  npm run lint:xml  (tools/wsxml_lint).
//
// WebSquare common functions run in the browser as plain scripts that attach to
// global namespaces, so the runtime globals below are declared to keep
// `no-undef` from firing on them.
module.exports = [
  {
    // cm/conversion/sample-front: 샘플 갤러리에 동봉된 벤더 배포본(sbchart.js 압축본 등) — lint 대상 아님
    // cm/websquare: 배포 환경 WebSquare 설정 참조본(config.js 는 ES 모듈) — 훅 이름 SOT 용도, lint 대상 아님
    // resources/**: 백엔드 정적 폴더 사본(이니텍·라온 벤더 JS, jQuery, 부트스트랩) — untracked, lint 대상 아님
    ignores: ["node_modules/**", "coverage/**", "tools/wsxml_lint/**", "resources/**", "cm/engine/**", "cm/conversion/sample-front/**", "cm/websquare/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        ...globals.browser,
        globalThis: "readonly",
        // WebSquare runtime globals
        WebSquare: "readonly",
        scwin: "readonly",
        $p: "readonly",
        $w: "readonly",
        $c: "readonly", // gcc common-library accessor ($c.util, $c.str, ...)
        comFunc: "writable",
        // UMD / CommonJS interop used by source files and config files
        module: "readonly",
        require: "readonly",
        exports: "writable",
      },
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": "warn",
      eqeqeq: ["warn", "smart"],
    },
  },
  {
    files: ["test/**/*.js", "**/*.test.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
];
