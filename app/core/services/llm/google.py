import time
from typing import Dict, Any, Optional

import google.generativeai as genai

from app.core.services.llm.base import LLMClient
from app.settings.settings import LLMSettings

class GeminiClient(LLMClient):
    """Google Gemini client implementation."""
    
    def __init__(self, settings: LLMSettings):
        self.api_key = settings.google_api_key
        self.model = settings.gemini_model
        genai.configure(api_key=self.api_key)
        self.request_timeout = settings.request_timeout
        
    async def generate(
        self, 
        prompt: str, 
        max_tokens: Optional[int] = 5000,
        temperature: Optional[float] = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        try:
            model = genai.GenerativeModel(model_name=self.model)
            response = model.generate_content(
                prompt,
                generation_config={
                    "max_output_tokens": max_tokens,
                    "temperature": temperature,
                    **kwargs
                }
            )
            
            return {
                "text": response.text,
                "model": self.model,
                "provider": self.provider_name,
                "timestamp": time.time()
            }
        except Exception as e:
            raise Exception(f"Google Gemini API error: {str(e)}")
    
    @property
    def provider_name(self) -> str:
        return "gemini"
