"""
Metadata extraction — collects document-level metadata.
Kept separate so Phase 4 can enrich with title extraction, language detection, etc.
"""

from app.ingestion.parser import ParsedPage


def extract_document_metadata(pages: list[ParsedPage], filename: str) -> dict:
    """Build a metadata dict for the document as a whole."""
    total_chars = sum(len(p.text) for p in pages)
    return {
        "filename": filename,
        "page_count": len(pages),
        "total_chars": total_chars,
    }
