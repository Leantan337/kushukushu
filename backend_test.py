#!/usr/bin/env python3
"""
Backend API Testing for Wheat Flour Factory ERP
Tests all backend endpoints for functionality, data persistence, and error handling.
"""

import requests
import json
import time
from datetime import datetime
import os
from pathlib import Path

# Load environment variables to get the backend URL
def load_env_file(file_path):
    env_vars = {}
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key] = value.strip('"')
    return env_vars

# Get backend URL from frontend .env file
frontend_env = load_env_file('/app/frontend/.env')
BACKEND_URL = frontend_env.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE_URL = f"{BACKEND_URL}/api"

print(f"Testing backend API at: {API_BASE_URL}")
print("=" * 60)

def test_root_endpoint():
    """Test GET /api/ - Root endpoint health check"""
    print("\n1. Testing Root Endpoint (GET /api/)")
    print("-" * 40)
    
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Check CORS headers
        print(f"CORS Headers:")
        cors_headers = {k: v for k, v in response.headers.items() if 'access-control' in k.lower()}
        for header, value in cors_headers.items():
            print(f"  {header}: {value}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Hello World":
                print("✅ Root endpoint working correctly")
                return True
            else:
                print("❌ Root endpoint returned unexpected message")
                return False
        else:
            print(f"❌ Root endpoint failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Root endpoint request failed: {e}")
        return False

def test_create_status_check():
    """Test POST /api/status - Create status check with client_name"""
    print("\n2. Testing Create Status Check (POST /api/status)")
    print("-" * 50)
    
    test_cases = [
        {"client_name": "Adigrat Flour Mill"},
        {"client_name": "Tigray Grain Processing"},
        {"client_name": "Ethiopian Wheat Co."}
    ]
    
    created_ids = []
    
    for i, test_data in enumerate(test_cases, 1):
        print(f"\nTest Case {i}: {test_data}")
        try:
            response = requests.post(
                f"{API_BASE_URL}/status",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2)}")
                
                # Validate response structure
                required_fields = ["id", "client_name", "timestamp"]
                if all(field in data for field in required_fields):
                    if data["client_name"] == test_data["client_name"]:
                        print(f"✅ Status check created successfully")
                        created_ids.append(data["id"])
                    else:
                        print(f"❌ Client name mismatch in response")
                        return False, []
                else:
                    print(f"❌ Missing required fields in response")
                    return False, []
            else:
                print(f"❌ Create status check failed with status {response.status_code}")
                print(f"Response: {response.text}")
                return False, []
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Create status check request failed: {e}")
            return False, []
    
    print(f"\n✅ All {len(test_cases)} status checks created successfully")
    return True, created_ids

def test_get_status_checks(expected_count=0):
    """Test GET /api/status - Retrieve all status checks"""
    print("\n3. Testing Get Status Checks (GET /api/status)")
    print("-" * 45)
    
    try:
        response = requests.get(f"{API_BASE_URL}/status", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Number of status checks retrieved: {len(data)}")
            
            if len(data) >= expected_count:
                print("✅ Status checks retrieved successfully")
                
                # Validate structure of first item if any exist
                if data:
                    first_item = data[0]
                    print(f"Sample record: {json.dumps(first_item, indent=2)}")
                    
                    required_fields = ["id", "client_name", "timestamp"]
                    if all(field in first_item for field in required_fields):
                        print("✅ Response structure is correct")
                        return True, data
                    else:
                        print("❌ Missing required fields in response")
                        return False, []
                else:
                    print("✅ Empty response is valid")
                    return True, []
            else:
                print(f"❌ Expected at least {expected_count} records, got {len(data)}")
                return False, []
        else:
            print(f"❌ Get status checks failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False, []
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Get status checks request failed: {e}")
        return False, []

def test_error_handling():
    """Test error handling for invalid requests"""
    print("\n4. Testing Error Handling")
    print("-" * 30)
    
    # Test invalid POST data
    print("\nTesting invalid POST data (missing client_name):")
    try:
        response = requests.post(
            f"{API_BASE_URL}/status",
            json={},  # Missing client_name
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 422:  # FastAPI validation error
            print("✅ Proper validation error returned for missing client_name")
        else:
            print(f"⚠️ Expected 422 validation error, got {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error handling test failed: {e}")
        return False
    
    # Test invalid content type
    print("\nTesting invalid content type:")
    try:
        response = requests.post(
            f"{API_BASE_URL}/status",
            data="invalid data",  # Not JSON
            headers={"Content-Type": "text/plain"},
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code in [400, 422]:
            print("✅ Proper error returned for invalid content type")
        else:
            print(f"⚠️ Expected 400/422 error, got {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error handling test failed: {e}")
        return False
    
    return True

def test_data_persistence():
    """Test that data persists between requests"""
    print("\n5. Testing Data Persistence")
    print("-" * 30)
    
    # Get initial count
    success, initial_data = test_get_status_checks()
    if not success:
        return False
    
    initial_count = len(initial_data)
    print(f"Initial record count: {initial_count}")
    
    # Create a new record
    test_data = {"client_name": "Persistence Test Mill"}
    try:
        response = requests.post(
            f"{API_BASE_URL}/status",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to create test record: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to create test record: {e}")
        return False
    
    # Wait a moment and check if record persists
    time.sleep(1)
    success, final_data = test_get_status_checks()
    if not success:
        return False
    
    final_count = len(final_data)
    print(f"Final record count: {final_count}")
    
    if final_count == initial_count + 1:
        print("✅ Data persistence verified - record was saved and retrieved")
        return True
    else:
        print(f"❌ Data persistence failed - expected {initial_count + 1}, got {final_count}")
        return False

def run_all_tests():
    """Run all backend API tests"""
    print("WHEAT FLOUR FACTORY ERP - BACKEND API TESTS")
    print("=" * 60)
    
    test_results = {
        "root_endpoint": False,
        "create_status": False,
        "get_status": False,
        "error_handling": False,
        "data_persistence": False
    }
    
    # Test 1: Root endpoint
    test_results["root_endpoint"] = test_root_endpoint()
    
    # Test 2: Create status checks
    success, created_ids = test_create_status_check()
    test_results["create_status"] = success
    
    # Test 3: Get status checks
    expected_count = len(created_ids) if success else 0
    success, _ = test_get_status_checks(expected_count)
    test_results["get_status"] = success
    
    # Test 4: Error handling
    test_results["error_handling"] = test_error_handling()
    
    # Test 5: Data persistence
    test_results["data_persistence"] = test_data_persistence()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(test_results.values())
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\nOverall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED - Backend API is working correctly!")
        return True
    else:
        print("⚠️ SOME TESTS FAILED - Backend API has issues that need attention")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)