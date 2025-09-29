import time
from typing import Dict, Any, Optional
import httpx

from app.core.services.llm.base import LLMClient
from app.settings.settings import LLMSettings

class GemmaClient(LLMClient):
    """Gemma client implementation."""
    
    def __init__(self, settings: LLMSettings):
        self.api_key = settings.gemma_api_key
        self.model = settings.gemma_model
        if not self.api_key:
            raise ValueError("Gemma API key is required but not provided")
        self.base_url = "https://api.example.com/gemma"  # Replace with actual Gemma API URL
        self.request_timeout = settings.request_timeout
        
    async def generate(
        self, 
        prompt: str, 
        max_tokens: Optional[int] = 1000,
        temperature: Optional[float] = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/generate",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "max_tokens": max_tokens,
                        "temperature": temperature,
                        **kwargs
                    },
                    timeout=self.request_timeout
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "text": result["generated_text"],
                        "model": self.model,
                        "provider": self.provider_name,
                        "timestamp": time.time()
                    }
                else:
                    raise Exception(f"API returned status code {response.status_code}: {response.text}")
        except Exception as e:
            raise Exception(f"Gemma API error: {str(e)}")
    
    @property
    def provider_name(self) -> str:
        return "gemma"
