# TLC ML Service

A FastAPI service for generating gift recommendations using LLMs.

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
- `POST /recommend` - Get gift recommendations
- `POST /summarize` - Summarize user profile

### Environment Variables

Set your LLM API keys:
- `ANTHROPIC_API_KEY` - For Claude models
- `OPENAI_API_KEY` - For OpenAI models
- `GOOGLE_API_KEY` - For Gemini models

### Testing

```bash
# Run tests
poetry run pytest

# Or with pip
pytest
```
