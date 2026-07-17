"""
Context builder — assembles ranked chunks into a structured text block
ready to be injected into an LLM prompt in Phase 5.

Pure function: no DB, no I/O, fully testable.
"""

from __future__ import annotations

from app.database.models import DocumentChunk

_SEPARATOR = "-" * 36
_BLOCK_OPEN = "=" * 36
_BLOCK_CLOSE = "=" * 36


def build_context(
    chunks: list[DocumentChunk],
    max_chars: int = 12_000,
) -> str:
    """
    Assemble chunks into a structured context string.

    Format:
        ====================================
        Document: <filename>  |  Page: <n>
        ------------------------------------
        <chunk text>
        ====================================

    Stops adding chunks once max_chars is reached to stay within LLM context windows.
    """
    if not chunks:
        return ""

    parts: list[str] = [_BLOCK_OPEN]
    total_chars = len(_BLOCK_OPEN)

    for i, chunk in enumerate(chunks):
        filename = chunk.metadata_.get("filename", "unknown")
        header = f"Document: {filename}  |  Page: {chunk.page_number}"
        block = f"{header}\n{_SEPARATOR}\n{chunk.text.strip()}"

        if i > 0 and total_chars + len(block) + 2 > max_chars:
            break

        if i > 0:
            parts.append(_SEPARATOR)
        parts.append(block)
        total_chars += len(block)

    parts.append(_BLOCK_CLOSE)
    return "\n".join(parts)
