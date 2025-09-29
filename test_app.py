#!/usr/bin/env python3
"""
Test script to check if the app can start without errors
"""
import os
import sys

def test_imports():
    """Test if all imports work"""
    try:
        print("Testing imports...")
        
        # Test basic imports
        from app.asgi import app
        print("✅ App import successful")
        
        # Test if app is created
        print(f"✅ App created: {app}")
        
        # Test if health endpoint exists
        routes = [route.path for route in app.routes]
        print(f"✅ Available routes: {routes}")
        
        if "/health" in routes:
            print("✅ Health endpoint found")
        else:
            print("❌ Health endpoint not found")
            
        return True
        
    except Exception as e:
        print(f"❌ Import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_imports()
    sys.exit(0 if success else 1)
