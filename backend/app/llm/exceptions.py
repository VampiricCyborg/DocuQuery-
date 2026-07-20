"""LLM layer exception hierarchy — mirrors retrieval.exceptions pattern."""


class LLMError(Exception):
    """Base class for all LLM errors."""


class ProviderUnavailableError(LLMError):
    """Provider API is unreachable or returned a non-retryable error."""


class RateLimitError(LLMError):
    """Provider rate limit exceeded."""


class GenerationTimeoutError(LLMError):
    """LLM generation exceeded the configured timeout."""


class StreamInterruptedError(LLMError):
    """Streaming was cut short before completion."""


class MalformedResponseError(LLMError):
    """Provider returned a response that could not be parsed."""


class NoContextError(LLMError):
    """No retrieval context available — cannot generate a grounded answer."""
