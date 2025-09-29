#!/usr/bin/env python3
"""
Minimal FastAPI app for Railway testing
"""
from fastapi import FastAPI
import uvicorn

app = FastAPI(title="TLC API Test")

@app.get("/")
async def root():
    return {"message": "TLC API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "message": "Service is running"}

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
