"""Google Gemini provider (gemini-1.5-pro, gemini-1.5-flash, etc.)."""

from __future__ import annotations

import logging
import time
from typing import AsyncGenerator

import google.generativeai as genai
from google.api_core.exceptions import GoogleAPIError, ResourceExhausted, DeadlineExceeded

from app.llm.providers.base import BaseLLMProvider
from app.llm.models import LLMRequest, LLMResponse
from app.llm.exceptions import (
    ProviderUnavailableError,
    RateLimitError,
    GenerationTimeoutError,
    MalformedResponseError,
    StreamInterruptedError,
)

logger = logging.getLogger(__name__)


class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str) -> None:
        genai.configure(api_key=api_key)

    def _get_model(self, model_name: str, temperature: float, max_tokens: int):
        return genai.GenerativeModel(
            model_name=model_name,
            generation_config=genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            ),
        )

    def _build_prompt(self, request: LLMRequest) -> str:
        return f"{request.system_prompt}\n\n{request.context}\n\nQuestion: {request.user_message}"

    async def generate(self, request: LLMRequest) -> LLMResponse:
        t0 = time.monotonic()
        model = self._get_model(request.model, request.temperature, request.max_tokens)
        try:
            response = await model.generate_content_async(self._build_prompt(request))
        except ResourceExhausted as exc:
            raise RateLimitError(str(exc)) from exc
        except DeadlineExceeded as exc:
            raise GenerationTimeoutError(str(exc)) from exc
        except GoogleAPIError as exc:
            raise ProviderUnavailableError(str(exc)) from exc

        if not response.text:
            raise MalformedResponseError("Gemini returned empty response.")

        logger.info("[gemini] generate latency=%.2fs model=%s", time.monotonic() - t0, request.model)
        return LLMResponse(answer=response.text, citations=[], model=request.model)

    async def stream(self, request: LLMRequest) -> AsyncGenerator[str, None]:
        t0 = time.monotonic()
        model = self._get_model(request.model, request.temperature, request.max_tokens)
        try:
            async for chunk in await model.generate_content_async(
                self._build_prompt(request), stream=True
            ):
                if chunk.text:
                    yield chunk.text
        except ResourceExhausted as exc:
            raise RateLimitError(str(exc)) from exc
        except GoogleAPIError as exc:
            raise ProviderUnavailableError(str(exc)) from exc
        except GeneratorExit:
            raise StreamInterruptedError("Client disconnected during stream.")

        logger.info("[gemini] stream completed latency=%.2fs", time.monotonic() - t0)

    async def health_check(self) -> bool:
        try:
            models = genai.list_models()
            return any(True for _ in models)
        except Exception:
            return False
