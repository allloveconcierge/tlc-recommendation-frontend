import json
import pandas as pd

from app.api.schemas.recommendations import RecommendationRequest

def create_category_determination_prompt(df):
    return f"""
    You are a gift recommendation expert. Based on the provided recipient information, identify {df.count} suitable gift categories.

    Recipient Information:
    - ID: {df.id}
    - Age: {df.age}
    - Gender: {df.gender}
    - Location: {df.location}
    - Interests: {df.interests}
    - Upcoming Events: {df.upcoming_event}
    - Relationship: {df.relationship}

    Return the categories as a JSON array:
    ["Category1", "Category2", "Category3"]

    Ensure the categories are tailored to the recipient's profile and aligned with their interests and events.
    """

def create_general_recommendation_prompt(df, categories):
    return f"""
    You are a gift recommendation expert. Using the categories: {categories}, suggest {df.count} unique gifts or experiences per category from UK-based brands.

    Your suggestions should:
    1. Be relevant to the recipient's profile and interests.
    2. Include only the base domain for each store (e.g., 'thortful.com' not 'thortful.com/search?q=category')
    3. Provide reasons for suitability.
    4. Feel free to recommend other unique and interesting UK-based stores beyond the examples provided.

    Use the following JSON format for your response:

    {{
      "user_id": "{df.id}",
      "recommendations": [
        {{
          "Product": "Gift/Experience Name",
          "Category": "Gift/Experience Category",
          "Explanation": "Why this gift/experience is suitable",
          "Store": "thortful.com"
        }},
        ...
      ]
    }}

    Note:
    - Suggested UK stores include (but are not limited to):
      - thortful.com
      - prezzybox.com
      - funkypigeon.com
      - notonthehighstreet.com
      - virginexperiencedays.co.uk
    - Feel encouraged to suggest other cool, unique UK-based stores that match the gift categories and recipient's interests

    Present only the JSON response—no additional text or commentary.
    """

def create_recommendation_for_moment_prompt(df):
    return f"""
    You are a gift recommendation specialist who focuses EXCLUSIVELY on milestone moments. Your expertise is creating deeply meaningful, occasion-specific gifts that commemorate life's significant moments.

    Recipient & Moment Details:
    - ID: {df.id}
    - Age: {df.age}
    - Gender: {df.gender}
    - Interests: {df.interests}
    - Relationship to Gifter: {df.relationship}
    - MILESTONE EVENT: {df.moment_type}
    - EVENT DATE: {df.moment_date}
    - Days Until Event: {(pd.to_datetime(df.moment_date) - pd.Timestamp.now()).days if pd.notna(df.moment_date) else 'Unknown'}

    Your task: Create {df.count} EXTRAORDINARY gift recommendations that will create a LASTING MEMORY of this {df.moment_type}.

    IMPORTANT GUIDELINES:

    1. Focus on SYMBOLIC and MILESTONE-MARKING gifts that:
       - Commemorate this specific life transition
       - Create lasting memories or keepsakes
       - Mark the significance of this particular milestone
       - Potentially become family heirlooms or treasured mementos

    2. Consider RITUAL and TRADITION:
       - Traditional gifts associated with this milestone in UK culture
       - Modern interpretations of traditional milestone gifts
       - Cultural ceremonies or customs associated with this milestone

    3. Think about TRANSFORMATIONAL gifts:
       - Items that help the recipient transition to their new stage/role
       - Experiences that mark this life passage
       - Items that acknowledge the recipient's journey to this point

    4. Include PERSONALIZATION options:
       - Custom engravings with milestone dates
       - Personalized milestone markers
       - Commissioned items specific to this achievement

    5. Consider TIME-SPECIFIC elements:
       - Future opening/viewing (e.g., time capsules, aged items)
       - Annual remembrance options
       - Growth-over-time gifts (e.g., investments, plants, collectible series)

    Provide recommendations in these categories:
    - SYMBOLIC KEEPSAKE: A physical item that symbolizes this milestone
    - EXPERIENTIAL MILESTONE MARKER: An experience that commemorates this achievement
    - TRADITIONAL MILESTONE GIFT: Something following cultural traditions for this milestone
    - PERSONALIZED COMMEMORATION: A highly customized item marking this specific achievement
    - FUTURE-FOCUSED MILESTONE GIFT: Something that grows in meaning or value over time

    Use this JSON format:

    {{
      "user_id": "{df.id}",
      "milestone_event": "{df.moment_type}",
      "event_date": "{df.moment_date}",
      "milestone_recommendations": [
        {{
          "Product": "Name of the milestone gift",
          "Gift_Type": "SYMBOLIC KEEPSAKE/EXPERIENTIAL MILESTONE MARKER/TRADITIONAL MILESTONE GIFT/PERSONALIZED COMMEMORATION/FUTURE-FOCUSED MILESTONE GIFT",
          "Explanation": "Detailed explanation of why this gift has SPECIAL SIGNIFICANCE for this specific life milestone",
          "Store": "Specific UK retailer or artisan who specializes in milestone gifts"
        }},
        ...
      ]
    }}

    MILESTONE-SPECIFIC CONSIDERATIONS:
    - BIRTHDAYS: Age milestone traditions (18th, 21st, 30th, etc.), birth stone/flower, "coming of age" items
    - ANNIVERSARIES: Traditional gifts by year (1st: paper, 5th: wood, 25th: silver, etc.), commemorative items
    - GRADUATIONS: Field of study keepsakes, achievement markers, professional transition items
    - NEW JOB: Career milestone markers, professional identity items, workplace transition gifts
    - RETIREMENT: Career commemoration, legacy items, new chapter beginnings
    - NEW HOME: Hearth & home traditions, housewarming customs, home blessing items
    - NEW BABY: Family milestone traditions, heirloom starter items, parenting transition gifts
    - ENGAGEMENT/WEDDING: Partnership symbols, union traditions, future-together items

    Focus only on MILESTONE-MARKING gifts that would be inappropriate for everyday occasions.
    """

def create_default_prompt(self, request: RecommendationRequest) -> str:
    """Create a prompt for the LLM based on the recommendation request."""
    return f"""
    Your task is to generate {request.count} recommendations in the category of {request.category}.
    
    User preferences: {json.dumps(request.user_preferences)}
    
    Additional context: {request.context if request.context else "No additional context provided."}
    
    Please provide a list of recommendations with the following JSON structure:
    [
        {{
            "title": "Recommendation title",
            "description": "Detailed description explaining why this was recommended",
            "relevance_score": 0.95,  # A score between 0 and 1 indicating how well it matches preferences
            "metadata": {{
                "key1": "value1",
                "key2": "value2"
            }}
        }},
        ... more recommendations
    ]
    
    Ensure all recommendations are relevant to the user's preferences.
    """
