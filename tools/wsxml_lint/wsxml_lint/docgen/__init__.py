"""WebSquare XML(JSDoc) -> API 문서 생성기.

공개 API:
    extract_modules(paths) -> list[ApiModule]
    extract_module(path)   -> ApiModule
    render_site(modules, title=...) -> str(HTML)
"""

from .extractor import extract_module, extract_modules
from .model import ApiMethod, ApiModule, ApiParam, ApiReturn
from .render import render_site

__all__ = [
    "extract_module",
    "extract_modules",
    "render_site",
    "ApiModule",
    "ApiMethod",
    "ApiParam",
    "ApiReturn",
]
