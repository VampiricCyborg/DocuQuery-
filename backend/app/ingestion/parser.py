"""
Document parser — extracts raw text per page/section from supported file types.
Returns a list of ParsedPage so downstream modules are format-agnostic.
"""

import logging
from dataclasses import dataclass, field
from pathlib import Path

logger = logging.getLogger(__name__)


@dataclass
class ParsedPage:
    page_number: int
    text: str
    metadata: dict = field(default_factory=dict)


def parse_document(file_path: str) -> list[ParsedPage]:
    """
    Dispatch to the correct parser based on file extension.
    Raises ValueError for unsupported types, RuntimeError for corrupt files.
    """
    path = Path(file_path)
    ext = path.suffix.lstrip(".").lower()

    parsers = {
        "pdf": _parse_pdf,
        "docx": _parse_docx,
        "txt": _parse_txt,
        "md": _parse_md,
    }

    parser_fn = parsers.get(ext)
    if parser_fn is None:
        raise ValueError(f"Unsupported file type: .{ext}")

    logger.info("Parsing %s as %s", path.name, ext)
    return parser_fn(path)


def _parse_pdf(path: Path) -> list[ParsedPage]:
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise RuntimeError("PyMuPDF not installed. Run: pip install pymupdf")

    try:
        doc = fitz.open(str(path))
    except Exception as e:
        raise RuntimeError(f"Failed to open PDF {path.name}: {e}") from e

    pages = []
    for i, page in enumerate(doc):
        text = page.get_text("text")
        if text.strip():
            pages.append(ParsedPage(page_number=i + 1, text=text))
    doc.close()
    return pages


def _parse_docx(path: Path) -> list[ParsedPage]:
    try:
        from docx import Document as DocxDocument
    except ImportError:
        raise RuntimeError("python-docx not installed. Run: pip install python-docx")

    try:
        doc = DocxDocument(str(path))
    except Exception as e:
        raise RuntimeError(f"Failed to open DOCX {path.name}: {e}") from e

    # DOCX has no pages — treat the whole document as page 1
    full_text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    return [ParsedPage(page_number=1, text=full_text)] if full_text else []


def _parse_txt(path: Path) -> list[ParsedPage]:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        raise RuntimeError(f"Failed to read TXT {path.name}: {e}") from e
    return [ParsedPage(page_number=1, text=text)] if text.strip() else []


def _parse_md(path: Path) -> list[ParsedPage]:
    """Parse Markdown — preserves headings as structural markers."""
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        raise RuntimeError(f"Failed to read Markdown {path.name}: {e}") from e
    return [ParsedPage(page_number=1, text=text, metadata={"format": "markdown"})] if text.strip() else []
