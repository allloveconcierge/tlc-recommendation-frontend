#!/usr/bin/env python3
"""
Simple main.py for Railway deployment
"""
import os
import uvicorn
from app.asgi import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "app.asgi:app",
        host="0.0.0.0",
        port=port,
        workers=1,
        log_level="info"
    )
