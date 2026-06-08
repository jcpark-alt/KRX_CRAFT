"""pytest 부트스트랩.

`pip install -e .` 없이도 `pytest` 한 줄로 돌도록, 패키지 루트를 sys.path 에 넣는다.
"""

import os
import sys

ROOT = os.path.dirname(__file__)
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
