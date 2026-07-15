"""
Intelligent recursive chunker.
Uses LangChain's RecursiveCharacterTextSplitter with token-aware sizing.
Each chunk carries full provenance metadata for retrieval.
"""

import logging
import re
from dataclasses import dataclass, field

from app.ingestion.parser import ParsedPage
from app.core.config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class TextChunk:
    text: str
    chunk_index: int
    page_number: int
    document_id: str
    filename: str
    section: str = ""
    metadata: dict = field(default_factory=dict)


def chunk_pages(
    pages: list[ParsedPage],
    document_id: str,
    filename: str,
) -> list[TextChunk]:
    """
    Split cleaned pages into overlapping chunks.
    Attempts to detect section headings (Markdown # or ALL-CAPS lines).
    """
    settings = get_settings()

    try:
        from langchain_text_splitters import RecursiveCharacterTextSplitter
    except ImportError:
        raise RuntimeError("langchain-text-splitters not installed.")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
        length_function=len,
    )

    chunks: list[TextChunk] = []
    chunk_index = 0

    for page in pages:
        current_section = _extract_section(page.text)
        splits = splitter.split_text(page.text)

        for split in splits:
            if not split.strip():
                continue
            # Update section if this split starts a new heading
            heading = _extract_section(split)
            if heading:
                current_section = heading

            chunks.append(
                TextChunk(
                    text=split.strip(),
                    chunk_index=chunk_index,
                    page_number=page.page_number,
                    document_id=document_id,
                    filename=filename,
                    section=current_section,
                    metadata={**page.metadata},
                )
            )
            chunk_index += 1

    logger.info("Chunked '%s' → %d chunks", filename, len(chunks))
    return chunks


def _extract_section(text: str) -> str:
    """Return the first heading found in text, or empty string."""
    # Markdown heading
    md_match = re.match(r"^#{1,6}\s+(.+)", text.strip())
    if md_match:
        return md_match.group(1).strip()
    # ALL-CAPS short line (common in PDFs)
    first_line = text.strip().split("\n")[0]
    if first_line.isupper() and 3 < len(first_line) < 80:
        return first_line
    return ""
