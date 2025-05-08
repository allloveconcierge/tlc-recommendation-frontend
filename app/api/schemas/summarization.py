from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SummarizationRequest(BaseModel):
    text: str = Field(
        ..., 
        description="Text to summarize"
    )
    max_length: Optional[int] = Field(
        200, 
        description="Maximum length of summary in tokens",
        ge=50,
        le=1000
    )
    format: Optional[str] = Field(
        "paragraph", 
        description="Format of the summary (paragraph, bullet_points, key_points)"
    )

class SummarizationResponse(BaseModel):
    summary: str
    original_text_length: int
    summary_length: int
    generated_at: str
    provider: str
