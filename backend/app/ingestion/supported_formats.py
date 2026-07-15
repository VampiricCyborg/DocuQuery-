"""
Supported ingestion formats registry.
To add a new format: add its extension to SUPPORTED_EXTENSIONS.
The parser dispatches on this set.
"""

SUPPORTED_EXTENSIONS: frozenset[str] = frozenset({"pdf", "docx", "txt", "md"})

# Future: {"pptx", "xlsx", "html", "csv"}
