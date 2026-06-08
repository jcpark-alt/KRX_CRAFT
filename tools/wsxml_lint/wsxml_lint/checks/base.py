"""검사기 공통 인터페이스.

각 검사기는 Check 를 상속하고 run(doc) 에서 Finding 들을 yield 한다.
새 검사를 추가하려면 이 인터페이스만 구현한 뒤 linter.DEFAULT_CHECKS 에 등록하면 된다.
"""

from __future__ import annotations

from typing import Iterable

from ..document import WsDocument
from ..model import Finding


class Check:
    #: 사람이 읽는 검사기 이름(Finding.check 에 채워짐).
    name: str = "base"

    def run(self, doc: WsDocument) -> Iterable[Finding]:  # pragma: no cover - 추상
        raise NotImplementedError
