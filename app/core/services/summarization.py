import datetime
from typing import Dict, Any

from app.api.schemas.summarization import SummarizationRequest, SummarizationResponse
from app.core.services.llm.base import LLMClient

class SummarizationService:
    """Service for generating text summaries using an LLM."""
    
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client
        
    async def generate_summary(self, request: SummarizationRequest) -> SummarizationResponse:
        """
        Generate a summary of the provided text.
        
        Args:
            request: The summarization request
            
        Returns:
            A summarization response with the generated summary
        """
        # Create a prompt for the LLM
        prompt = self._create_prompt(request)
        
        # Generate summary from the LLM
        llm_response = await self.llm_client.generate(
            prompt=prompt,
            max_tokens=request.max_length,
            temperature=0.3  # Lower temperature for more deterministic summaries
        )
        
        summary = llm_response["text"].strip()
        
        return SummarizationResponse(
            summary=summary,
            original_text_length=len(request.text),
            summary_length=len(summary),
            generated_at=datetime.datetime.now().isoformat(),
            provider=self.llm_client.provider_name
        )
        
    def _create_prompt(self, request: SummarizationRequest) -> str:
        """Create a prompt for the LLM based on the summarization request."""
        format_instructions = ""
        if request.format == "bullet_points":
            format_instructions = "Format the summary as bullet points."
        elif request.format == "key_points":
            format_instructions = "Format the summary as a list of key points."
        else:
            format_instructions = "Format the summary as a cohesive paragraph."
            
        return f"""
        Your task is to create a concise summary of the following text. 
        The summary should be approximately {request.max_length} tokens or less.
        {format_instructions}
        
        TEXT TO SUMMARIZE:
        {request.text}
        
        SUMMARY:
        """