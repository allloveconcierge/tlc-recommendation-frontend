import time
import json
from typing import Dict, Any, Optional

import anthropic
from anthropic import AI_PROMPT, HUMAN_PROMPT

from app.core.services.llm.base import LLMClient
from app.settings.settings import LLMSettings

class ClaudeClient(LLMClient):
    """Anthropic Claude client implementation."""
    
    def __init__(self, settings: LLMSettings):
        self.api_key = settings.claude_api_key
        self.model = settings.claude_model
        if not self.api_key:
            raise ValueError("Claude API key is required but not provided")
        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.request_timeout = settings.request_timeout
        
    async def generate(
        self, 
        prompt: str, 
        max_tokens: Optional[int] = 1000,
        temperature: Optional[float] = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        formatted_prompt = f"{HUMAN_PROMPT} {prompt} {AI_PROMPT}"
        
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )
            
            return {
                "text": response.content[0].text,
                "model": self.model,
                "provider": self.provider_name,
                "timestamp": time.time()
            }
        except Exception as e:
            raise Exception(f"Claude API error: {str(e)}")
    
    @property
    def provider_name(self) -> str:
        return "claude"
