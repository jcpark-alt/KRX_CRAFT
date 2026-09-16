/**
 * 전역 Promise 보호 가드.
 *
 * 이니텍 crosswebex6.js 는 로드 직후 bluebird-3.5.0 을 비동기로 끌어오고, bluebird 브라우저 번들은
 * `window.Promise` 를 자기 구현으로 덮어쓴다. bluebird 에는 Promise.allSettled / Promise.any 가 없어서
 * WebSquare 엔진의 프로젝트 공통 로드(_loadWebSquareCommon → Promise.allSettled)가
 * "TypeError: Promise.allSettled is not a function" 으로 실패한다.
 *
 * 이니텍 스크립트(crosswebex6·crosswebexInit·cwui 계열)가 실제로 쓰는 API 는 new Promise / Promise.all /
 * Promise.resolve 뿐이라 네이티브 Promise 로도 그대로 동작한다. 그래서 전역 Promise 를 접근자 속성으로 바꿔
 * 네이티브 구현을 고정하고, bluebird 의 덮어쓰기 대입은 무시한다(예외 없이 흡수). bluebird 자체는 내부 참조로
 * 정상 로드되므로 crosswebex6 의 afterLoadPromise 흐름도 그대로 진행된다.
 *
 * 로드 위치: websquare/config.xml·config.js 의 <engine><module> 에서 crosswebex6.js 보다 앞(벤더 그룹 맨 앞).
 */
(function (w) {
    "use strict";

    const nativePromise = w.Promise;

    // 네이티브 Promise 가 없거나 이미 allSettled 가 없는(구형) 환경이면 보호할 대상이 없다.
    if (typeof nativePromise !== "function" || typeof nativePromise.allSettled !== "function") {
        return;
    }

    // 이미 접근자로 바꿔 두었으면(중복 로드) 다시 정의하지 않는다.
    const desc = Object.getOwnPropertyDescriptor(w, "Promise");
    if (desc && typeof desc.get === "function") {
        return;
    }

    Object.defineProperty(w, "Promise", {
        configurable: true,
        enumerable: false,
        get: function () {
            return nativePromise;
        },
        set: function (replacement) {
            // bluebird 등 대체 구현의 전역 덮어쓰기는 무시한다. 필요 시 확인용으로만 보관한다.
            if (replacement !== nativePromise) {
                w.__replacedPromise = replacement;
            }
        }
    });
})(window);
