#!/usr/bin/env python3
"""
Alternative startup script for Railway deployment
"""
import os
import uvicorn

if __name__ == "__main__":
    # Get port from Railway environment
    port = int(os.environ.get("PORT", 8000))
    
    # Start the server
    uvicorn.run(
        "app.asgi:app",
        host="0.0.0.0",
        port=port,
        workers=1,
        log_level="info"
    )
