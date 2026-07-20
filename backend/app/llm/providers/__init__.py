"""Provider factory — resolves provider name to a BaseLLMProvider instance."""

from __future__ import annotations

from app.llm.providers.base import BaseLLMProvider


def get_provider(
    provider: str,
    *,
    api_key: str = "",
    ollama_base_url: str = "http://localhost:11434",
    timeout: float = 30.0,
) -> BaseLLMProvider:
    """
    Factory that returns the correct provider instance.

    Raises ValueError for unknown provider names so misconfiguration
    is caught at startup rather than at request time.
    """
    name = provider.lower()

    if name == "groq":
        from app.llm.providers.groq_provider import GroqProvider
        return GroqProvider(api_key=api_key, timeout=timeout)

    if name == "openai":
        from app.llm.providers.openai_provider import OpenAIProvider
        return OpenAIProvider(api_key=api_key, timeout=timeout)

    if name == "anthropic":
        from app.llm.providers.anthropic_provider import AnthropicProvider
        return AnthropicProvider(api_key=api_key, timeout=timeout)

    if name == "gemini":
        from app.llm.providers.gemini_provider import GeminiProvider
        return GeminiProvider(api_key=api_key)

    if name == "ollama":
        from app.llm.providers.ollama_provider import OllamaProvider
        return OllamaProvider(base_url=ollama_base_url, timeout=timeout)

    raise ValueError(f"Unknown LLM provider: {provider!r}. Choose from: groq, openai, anthropic, gemini, ollama")
