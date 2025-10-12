"""
Test script to verify Sales Dashboard API endpoints
"""
import requests
import json
from datetime import datetime

BACKEND_URL = "http://localhost:8000"

def test_endpoint(endpoint, description):
    """Test a single endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing: {description}")
    print(f"Endpoint: {endpoint}")
    print('='*60)
    
    try:
        response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=5)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Retrieved {len(data) if isinstance(data, list) else 1} item(s)")
            
            # Show sample of first item
            if isinstance(data, list) and len(data) > 0:
                print(f"\nSample Data (first item):")
                print(json.dumps(data[0], indent=2, default=str))
            elif isinstance(data, dict):
                print(f"\nData:")
                print(json.dumps(data, indent=2, default=str))
            
            return True
        else:
            print(f"❌ FAILED - Status: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ FAILED - Cannot connect to backend server")
        print("Make sure the backend server is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ FAILED - Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("SALES DASHBOARD API ENDPOINT TESTS")
    print("="*60)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    endpoints = [
        ("/api/sales-transactions", "Sales Transactions"),
        ("/api/stock-requests", "Stock Requests"),
        ("/api/inventory", "Inventory Items"),
        ("/api/recent-activity?limit=10", "Recent Activity Feed"),
    ]
    
    results = []
    for endpoint, description in endpoints:
        result = test_endpoint(endpoint, description)
        results.append((description, result))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for description, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {description}")
    
    print("\n" + "="*60)
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("✅ All tests passed! Sales Dashboard should work correctly.")
    else:
        print("❌ Some tests failed. Please check the backend server and MongoDB.")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()

