from app.core.services.llm.base import LLMClient
from app.core.services.llm.anthropic import ClaudeClient
from app.core.services.llm.openai import OpenAIClient
from app.core.services.llm.google import GeminiClient
from app.core.services.llm.gemma import GemmaClient
from app.core.services.llm.flash import FlashClient
from app.settings.settings import LLMSettings

def get_llm_client(settings: LLMSettings) -> LLMClient:
    """
    Factory function to create an LLM client based on the configuration.
    
    Args:
        settings: Application settings
        
    Returns:
        An instance of LLMClient
        
    Raises:
        ValueError: If the requested provider is not supported
    """
    provider = settings.llm_provider.lower()
    
    if provider == "claude":
        return ClaudeClient(settings)
    elif provider == "openai":
        return OpenAIClient(settings)
    elif provider == "gemini":
        return GeminiClient(settings)
    elif provider == "gemma":
        return GemmaClient(settings)
    elif provider == "flash":
        return FlashClient(settings)
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")
