#!/usr/bin/env python3
"""
Simple test script to verify websearch functionality with real Exa API.
Run this to test if the enrich_with_exa_async function works correctly.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.core.services.websearch import enrich_with_exa_async
from app.api.schemas.recommendations import GeneralRecommendationItem

async def test_websearch():
    """Test the websearch functionality with sample data."""
    
    # Check if API key is set
    api_key = os.getenv("EXA_API_KEY")
    if not api_key:
        print("❌ EXA_API_KEY environment variable not set!")
        print("Please set it with: export EXA_API_KEY='your_api_key_here'")
        return False
    
    print(f"✅ EXA_API_KEY found: {api_key[:10]}...")
    
    # Create sample recommendation items
    test_items = [
        GeneralRecommendationItem(
            title="Wireless Headphones",
            product="Sony WH-1000XM4",
            type="product",
            category="Electronics",
            explanation="High-quality noise-canceling headphones",
            store="amazon.co.uk",
            relevance_score=0.9,
            product_url="https://example.com"  # This should be replaced
        ),
        GeneralRecommendationItem(
            title="Coffee Maker",
            product="Nespresso Vertuo",
            type="product", 
            category="Kitchen",
            explanation="Premium coffee machine for home use",
            store="johnlewis.com",
            relevance_score=0.8,
            product_url=None  # This should be filled
        ),
        GeneralRecommendationItem(
            title="Gaming Chair",
            product="Secretlab Titan",
            type="product",
            category="Furniture", 
            explanation="Ergonomic gaming chair",
            store="secretlab.co.uk",
            relevance_score=0.85,
            product_url="https://example.com"  # This should be replaced
        )
    ]
    
    print(f"\n📋 Testing with {len(test_items)} sample items:")
    for i, item in enumerate(test_items, 1):
        print(f"  {i}. {item.product} from {item.store} (URL: {item.product_url})")
    
    print(f"\n🔍 Calling enrich_with_exa_async...")
    
    try:
        # Call the websearch function
        enriched_items = await enrich_with_exa_async(
            test_items,
            num_results=3,
            concurrency=2,
            timeout_s=15.0
        )
        
        print(f"\n✅ Function completed successfully!")
        print(f"\n📊 Results:")
        
        for i, item in enumerate(enriched_items, 1):
            print(f"\n  {i}. {item.product}")
            print(f"     Store: {item.store}")
            print(f"     URL: {item.product_url}")
            print(f"     Changed: {'Yes' if item.product_url and item.product_url != 'https://example.com' else 'No'}")
        
        # Count how many items were successfully enriched
        enriched_count = sum(1 for item in enriched_items 
                           if item.product_url and item.product_url != "https://example.com")
        
        print(f"\n📈 Summary:")
        print(f"   Total items: {len(enriched_items)}")
        print(f"   Successfully enriched: {enriched_count}")
        print(f"   Success rate: {enriched_count/len(enriched_items)*100:.1f}%")
        
        return enriched_count > 0
        
    except Exception as e:
        print(f"\n❌ Error occurred: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Main test function."""
    print("🧪 Testing Websearch Functionality")
    print("=" * 50)
    
    success = await test_websearch()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Test completed successfully!")
        print("The websearch functionality is working with the real Exa API.")
    else:
        print("💥 Test failed!")
        print("Check your API key and network connection.")
    
    return success

if __name__ == "__main__":
    # Run the test
    result = asyncio.run(main())
    sys.exit(0 if result else 1)
