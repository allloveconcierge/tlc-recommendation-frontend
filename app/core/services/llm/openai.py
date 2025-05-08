import time
from typing import Dict, Any, Optional

import openai

from app.core.services.llm.base import LLMClient
from app.settings.settings import LLMSettings

class OpenAIClient(LLMClient):
    """OpenAI client implementation."""
    
    def __init__(self, settings: LLMSettings):
        self.api_key = settings.openai_api_key
        self.model = settings.openai_model
        self.client = openai.OpenAI(api_key=self.api_key)
        self.request_timeout = settings.request_timeout
        
    async def generate(
        self, 
        prompt: str, 
        max_tokens: Optional[int] = 1000,
        temperature: Optional[float] = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=temperature,
                **kwargs
            )
            
            return {
                "text": response.choices[0].message.content,
                "model": self.model,
                "provider": self.provider_name,
                "timestamp": time.time()
            }
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    @property
    def provider_name(self) -> str:
        return "openai"
