"""API 문서 데이터 모델.

추출기(extractor)가 XML+JSDoc 을 파싱해 이 dataclass 들로 채우고,
렌더러(render)가 이를 HTML 로 출력한다.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class ApiParam:
    type: str
    name: str
    desc: str


@dataclass
class ApiReturn:
    type: str
    desc: str


@dataclass
class ApiMethod:
    name: str                       # 표시용 메서드명 (@name 우선, 없으면 선언명)
    signature: str                  # 예: "isEmpty(value)"
    description: str = ""
    params: list[ApiParam] = field(default_factory=list)
    returns: ApiReturn | None = None
    example: str = ""
    exception: str = ""
    deprecated: str | None = None   # None = 아님, "" = @deprecated(설명없음), "..." = 설명
    qualified: str = ""             # 예: "$c.util.isEmpty"


@dataclass
class ApiModule:
    name: str                       # 짧은 이름 (파일 stem), 예: "util"
    namespace: str                  # 예: "$c.util"
    file: str                       # 예: "util.xml"
    title: str = ""                 # meta_screenName
    desc: str = ""                  # meta_desc
    methods: list[ApiMethod] = field(default_factory=list)
    note: str = ""                  # 예: "공개 메서드가 없습니다."
