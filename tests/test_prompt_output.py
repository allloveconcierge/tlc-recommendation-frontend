#!/usr/bin/env python3
"""
Simple script to test and print the output of create_recommendation_prompt
"""

from app.core.services.prompts.v1.prompt import create_recommendation_prompt
from app.api.schemas.recommendations import RecommendationRequest, Profile, Gender
def main():
    # Create a sample profile
    profile = Profile(
        profile_id="demo_profile_123",
        age=28,
        gender=Gender.FEMALE,
        relationship="sister"
    )
    
    # Create a sample request
    request = RecommendationRequest(
        profile=profile,
        location="Bath, UK",
        upcoming_event="birthday",
        profile_interests=["art", "books", "tea", "gardening"],
        context="She loves watercolor painting, reading mystery novels, and has a beautiful garden",
        count=5
    )
    
    # Generate the prompt
    print("=" * 80)
    print("RECOMMENDATION PROMPT OUTPUT")
    print("=" * 80)
    print()
    
    prompt = create_recommendation_prompt(request)
    print(prompt)
    
    print()
    print("=" * 80)
    print(f"Prompt length: {len(prompt)} characters")
    print("=" * 80)

if __name__ == "__main__":
    main()
