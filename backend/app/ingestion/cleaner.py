"""
Text cleaner — operates on raw extracted text.
Preserves paragraph breaks and Markdown headings; strips noise.
"""

import re
from app.ingestion.parser import ParsedPage


def clean_pages(pages: list[ParsedPage]) -> list[ParsedPage]:
    """Clean all pages in-place, returning a new list."""
    return [ParsedPage(page_number=p.page_number, text=clean_text(p.text), metadata=p.metadata) for p in pages]


def clean_text(text: str) -> str:
    """
    1. Normalize line endings
    2. Remove form-feed / null chars
    3. Collapse runs of spaces/tabs within a line
    4. Collapse 3+ consecutive blank lines → double newline (paragraph break)
    5. Strip leading/trailing whitespace
    """
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[\x00\x0c]", "", text)                  # null + form-feed
    text = re.sub(r"[ \t]+", " ", text)                      # collapse inline whitespace
    text = re.sub(r" *\n *", "\n", text)                     # trim spaces around newlines
    text = re.sub(r"\n{3,}", "\n\n", text)                   # max one blank line between paragraphs
    return text.strip()
