#!/usr/bin/env python3
"""
Main entry point for Railway deployment
"""
import os
import sys
import uvicorn

def main():
    try:
        # Import the app after setting up environment
        from app.asgi import app
        
        port = int(os.environ.get("PORT", 8000))
        host = os.environ.get("HOST", "0.0.0.0")
        
        print(f"Starting server on {host}:{port}")
        
        uvicorn.run(
            "app.asgi:app",
            host=host,
            port=port,
            workers=1,
            log_level="info",
            access_log=True
        )
    except Exception as e:
        print(f"Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
