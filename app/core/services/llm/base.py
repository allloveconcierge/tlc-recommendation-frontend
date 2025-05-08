from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class LLMClient(ABC):
    """Abstract base class for LLM clients."""
    
    @abstractmethod
    async def generate(
        self, 
        prompt: str, 
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate a response from the LLM.
        
        Args:
            prompt: The input prompt for the LLM
            max_tokens: Maximum number of tokens to generate
            temperature: Temperature parameter for generation
            **kwargs: Additional model-specific parameters
            
        Returns:
            A dictionary containing the response and additional metadata
        """
        pass
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the name of the LLM provider."""
        pass
