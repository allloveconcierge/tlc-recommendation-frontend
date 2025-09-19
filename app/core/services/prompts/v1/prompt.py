import json
import pandas as pd
from datetime import datetime
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

from app.api.schemas.recommendations import RecommendationRequest

template_dir = Path(__file__).parent
env = Environment(loader=FileSystemLoader(template_dir))
template = env.get_template('recommendation_prompt.j2')

def create_recommendation_prompt(request):
    """Loads and renders the general recommendation prompt"""
    template = env.get_template('recommendation_prompt.j2')
    return template.render(
        request=request
    )

