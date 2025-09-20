# TLC ML Service

A FastAPI service for generating personalized gift recommendations using LLMs with real-time web search enrichment.

## Quick Start

### Prerequisites
- Python 3.12+
- Poetry (recommended) or pip

### Installation

**With Poetry:**
```bash
poetry install
```

**With pip:**
```bash
pip install -r requirements.txt
```

### Running the API

**With Poetry:**
```bash
poetry run python run.py
```

**With pip:**
```bash
python run.py
```

The API will start on `http://localhost:8000`

### API Endpoints

- `GET /health` - Health check
- `POST /recommend` - Get personalized gift recommendations with optional web search enrichment
- `POST /summarize` - Summarize user profile

### Features

- **LLM-powered recommendations** using Gemini, Claude, or OpenAI
- **Real-time web search** via Exa API for product URLs and details
- **UK-focused** gift suggestions from local retailers
- **Personalized** based on recipient's interests, age, and occasion

### Environment Variables

Set your API keys:
- `GOOGLE_API_KEY` - For Gemini LLM (required)
- `EXA_API_KEY` - For web search enrichment (optional)
- `ANTHROPIC_API_KEY` - For Claude models (optional)
- `OPENAI_API_KEY` - For OpenAI models (optional)

### Testing

```bash
# Run tests
poetry run pytest

# Or with pip
pytest
```
