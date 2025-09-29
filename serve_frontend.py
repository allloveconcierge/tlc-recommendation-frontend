"""
Script to serve the frontend build files from the FastAPI backend.
This is useful for Replit deployment where we want to serve everything from one app.
"""
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

def setup_frontend_serving(app: FastAPI):
    """Setup static file serving for the frontend build."""
    
    # Path to the frontend build directory
    frontend_build_path = Path("present-ponder/dist")
    
    if frontend_build_path.exists():
        # Mount static files (CSS, JS, images, etc.)
        app.mount("/assets", StaticFiles(directory=frontend_build_path / "assets"), name="assets")
        
        # Serve the main HTML file for all non-API routes
        @app.get("/{full_path:path}")
        async def serve_frontend(full_path: str):
            # Don't serve frontend for API routes
            if full_path.startswith(("api", "health", "recommend", "summarize", "docs", "openapi.json")):
                return {"error": "Not found"}
            
            # Serve index.html for all other routes (SPA routing)
            index_file = frontend_build_path / "index.html"
            if index_file.exists():
                return FileResponse(index_file)
            else:
                return {"error": "Frontend not built"}
    else:
        print("Warning: Frontend build directory not found. Run 'npm run build' in present-ponder/ first.")
