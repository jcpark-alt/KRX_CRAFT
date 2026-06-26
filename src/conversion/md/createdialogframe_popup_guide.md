# CreateDialogFrame → $c.win.openPopup 변환 지침 (규칙 17)

> 이 문서는 레거시 Gauce 팝업 호출 `$c.frame.CreateDialogFrame(...)` 을 WebSquare gcc 표준 팝업 공통함수 `$c.win.openPopup(...)` 로 전환하는 규칙(규칙 17)의 독립 지침입니다. 결정적 치환 파이프라인은 [conversion_pipeline.md](conversion_pipeline.md), 규칙 정의는 [conversion_rules.md](conversion_rules.md) 를 참조하세요.

## 1. 대상 패턴

스크립트 영역에서 아래 형태의 호출을 변환합니다(선행 `await`, 수신자 `$c.frame` / `frame` 모두 포함).

```javascript
[await] $c.frame.CreateDialogFrame({options.id}, {url}, {options.title}, {left}, {top}, {options.width}, {options.height}, {options.type});
```

* 인자는 **8개 위치 인자**: `id, url, title, left, top, width, height, type`.
* 인자 개수가 8개가 아니거나, `url` 이 문자열 리터럴이 아니면(예: `"/common/" + strUrl + ".gfm"` 동적 결합) **변환하지 않고 리포트**합니다(파일명 추출 불가).

## 2. 변환 규칙

| # | 규칙 | 설명 |
| --- | --- | --- |
| 1 | `type` 분기 | `{options.type}` 값이 `"window"` → `type: "browserPopup"`. 값이 없거나 다른 값(`"tool"` 등) → `type: "pageFramePopup"`. |
| 2 | `left`/`top` 드롭 | 4·5번째 인자(`{left}`, `{top}`)는 **사용하지 않습니다**. |
| 3 | `id` = url 파일명 | `{options.id}` 는 AS-IS 첫 인자를 무시하고 **`{url}` 의 파일명(확장자 제거)** 을 사용. 예: `/lstmgt/ULDSTF40601.gfm` → `"ULDSTF40601"`. |
| 4 | browserPopup 콜백 | `"browserPopup"` 으로 정의되면 `data.callbackFn: "scwin.popupCallback"` 추가 + `scwin.popupCallback(result);` 호출 + `scwin.popupCallback` 함수 정의를 파일에 1회 추가. |
| 5 | 선행 row 호출 삭제 | `CreateDialogFrame` 바로 윗줄이 인자에 `row` 를 넘기는 함수 호출(예: `fn_setId(row);`)이면 **삭제**합니다. |

**부가 규칙(결정적 산출 보조)**

* `width`/`height` : 정수 리터럴은 `"{n}px"` 문자열로(예: `603` → `"603px"`), 표현식·변수(`515 + 5`, `strW`)는 **원형 유지**(검토 보강 대상).
* `title` : 리터럴/표현식 모두 원형 유지.
* `url` : AS-IS 의 url 문자열을 `openPopup` 첫 인자로 그대로 사용(확장자 변환 없음).
* `data` 객체 : 레거시 `CreateDialogFrame` 호출에는 전달 페이로드가 없으므로 **`// TO-DO` 플레이스홀더**로 생성합니다. browserPopup 인 경우에만 `callbackFn` 을 함께 넣습니다.
* 같은 블록에 여러 호출이 있으면 변수명을 `options`/`data`/`result`, `options2`/`data2`/`result2` … 로 부여합니다.

## 3. 변환 예시

### AS-IS

```javascript
fn_setId(row);
$c.frame.CreateDialogFrame("gform", "/lstmgt/ULDSTF40601.gfm", "상장증명서발급 승인", 200, 100, 603, 398, "window");
```

### 변환 후 — `type:"window"` → **browserPopup**

```javascript
const options = {
    id: "ULDSTF40601",
    title: "상장증명서발급 승인",
    type: "browserPopup",
    width: "603px",
    height: "398px"
};

const data = {
    // TO-DO : 팝업으로 전달할 파라미터 설정,
    callbackFn: "scwin.popupCallback"
};

const result = await $c.win.openPopup("/lstmgt/ULDSTF40601.gfm", options, data);
scwin.popupCallback(result);
```

그리고 파일에 콜백 함수 정의를 1회 추가합니다(이미 정의돼 있으면 추가하지 않음).

```javascript
/**
 * @method
 * @name popupCallback
 * @description browserPopup 팝업의 callback 함수. 부모창에서 팝업 결과 값을 처리한다.
 * @param {String | Number} arg 팝업에서 전달받은 값
 */
scwin.popupCallback = function (arg) {
    // TO-DO : arg 값 확인 후 업무 로직 추가
};
```

### 변환 후 — `type:"tool"`(또는 그 외) → **pageFramePopup**

```javascript
const options = {
    id: "ULDSTF92017",
    title: "종목선택",
    type: "pageFramePopup",
    width: "410px",
    height: "580px"
};

const data = {
    // TO-DO : 팝업으로 전달할 파라미터 설정
};

const result = await $c.win.openPopup("../listingcommon/ULDSTF92017.gfm", options, data);
// TO-DO : result 값 확인 후 업무 로직 추가
```

(pageFramePopup 은 `callbackFn` / `scwin.popupCallback` 을 추가하지 않습니다.)

## 4. 단계 2(Claude) 보강 포인트

* `data` 객체에 실제로 팝업에 전달할 파라미터를 채웁니다(레거시는 전역/스코프 변수로 넘기던 값).
* `result`(및 browserPopup 의 `scwin.popupCallback(result)`) 처리 업무 로직을 작성합니다.
* `width`/`height` 가 표현식·변수로 남은 경우 `"...px"` 규약에 맞게 정리합니다.
* `url` 이 동적 결합이라 미변환·리포트된 호출은 수동으로 `openPopup` 형태로 재작성합니다.

## 5. 참조 구현

`src/conversion/tools/convert.py` 의 `rule17_create_dialog_frame` (헬퍼 `_url_to_id`, `_popup_dim`, 패턴 `_CDF_RE`/`_ROW_CALL_RE`). 인자 파싱은 문자열/주석 보호 파서 `_scan_call` 을 재사용하며, 결과는 멱등(2회 변환 동일)하고 XML well-formed 를 보존합니다.
