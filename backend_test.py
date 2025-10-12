#!/usr/bin/env python3
"""
Backend API Testing for Wheat Flour Factory ERP
Tests all backend endpoints for functionality, data persistence, and error handling.
Focus on Sales Role & Transaction Workflow endpoints.
"""

import requests
import json
import time
from datetime import datetime, timezone
import os
from pathlib import Path
import uuid

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
BACKEND_URL = frontend_env.get('REACT_APP_BACKEND_URL', 'http://localhost:8000')
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

# ==================== SALES ROLE TESTING ====================

def setup_test_inventory():
    """Setup test inventory items for sales testing"""
    print("\n🔧 Setting up test inventory...")
    
    test_products = [
        {
            "name": "1st Quality Flour",
            "quantity": 10000.0,
            "unit": "kg",
            "low_threshold": 2000.0,
            "critical_threshold": 500.0
        },
        {
            "name": "Bread Flour", 
            "quantity": 8000.0,
            "unit": "kg",
            "low_threshold": 1500.0,
            "critical_threshold": 300.0
        },
        {
            "name": "Fruska",
            "quantity": 5000.0,
            "unit": "kg", 
            "low_threshold": 1000.0,
            "critical_threshold": 200.0
        },
        {
            "name": "Fruskelo",
            "quantity": 3000.0,
            "unit": "kg",
            "low_threshold": 500.0,
            "critical_threshold": 100.0
        }
    ]
    
    created_products = []
    
    for product in test_products:
        try:
            response = requests.post(
                f"{API_BASE_URL}/inventory",
                json=product,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                created_product = response.json()
                created_products.append(created_product)
                print(f"✅ Created {product['name']} - ID: {created_product['id']}")
            else:
                print(f"❌ Failed to create {product['name']}: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Error creating {product['name']}: {e}")
    
    print(f"✅ Setup complete: {len(created_products)} products created")
    return created_products

def test_sales_transaction_pos():
    """Test POST /api/sales-transactions - Point of Sale functionality"""
    print("\n6. Testing Sales Transaction POS (POST /api/sales-transactions)")
    print("-" * 60)
    
    # Get available inventory
    try:
        inventory_response = requests.get(f"{API_BASE_URL}/inventory", timeout=10)
        if inventory_response.status_code != 200:
            print("❌ Failed to get inventory for testing")
            return False
        
        inventory = inventory_response.json()
        if not inventory:
            print("⚠️ No inventory available, setting up test inventory...")
            inventory = setup_test_inventory()
            
        if not inventory:
            print("❌ Could not setup inventory for testing")
            return False
            
    except Exception as e:
        print(f"❌ Error getting inventory: {e}")
        return False
    
    # Test cases for different payment types
    test_cases = [
        {
            "name": "Cash Payment Transaction",
            "data": {
                "items": [
                    {
                        "product_id": inventory[0]["id"],
                        "product_name": inventory[0]["name"],
                        "quantity_kg": 50.0,
                        "unit_price": 45.0
                    },
                    {
                        "product_id": inventory[1]["id"] if len(inventory) > 1 else inventory[0]["id"],
                        "product_name": inventory[1]["name"] if len(inventory) > 1 else inventory[0]["name"],
                        "quantity_kg": 25.0,
                        "unit_price": 50.0
                    }
                ],
                "payment_type": "cash",
                "sales_person_id": "sales_001",
                "sales_person_name": "John Sales",
                "branch_id": "branch_001"
            },
            "expected_status": "paid"
        },
        {
            "name": "Check Payment Transaction",
            "data": {
                "items": [
                    {
                        "product_id": inventory[0]["id"],
                        "product_name": inventory[0]["name"],
                        "quantity_kg": 100.0,
                        "unit_price": 45.0
                    }
                ],
                "payment_type": "check",
                "sales_person_id": "sales_001",
                "sales_person_name": "John Sales",
                "branch_id": "branch_001"
            },
            "expected_status": "paid"
        },
        {
            "name": "Transfer Payment Transaction",
            "data": {
                "items": [
                    {
                        "product_id": inventory[0]["id"],
                        "product_name": inventory[0]["name"],
                        "quantity_kg": 75.0,
                        "unit_price": 45.0
                    }
                ],
                "payment_type": "transfer",
                "sales_person_id": "sales_001",
                "sales_person_name": "John Sales",
                "branch_id": "branch_001"
            },
            "expected_status": "paid"
        },
        {
            "name": "Loan Payment Transaction",
            "data": {
                "items": [
                    {
                        "product_id": inventory[0]["id"],
                        "product_name": inventory[0]["name"],
                        "quantity_kg": 200.0,
                        "unit_price": 45.0
                    }
                ],
                "payment_type": "loan",
                "sales_person_id": "sales_001",
                "sales_person_name": "John Sales",
                "branch_id": "branch_001",
                "customer_id": "cust_001",
                "customer_name": "ABC Store"
            },
            "expected_status": "unpaid"
        }
    ]
    
    successful_transactions = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}: {test_case['name']}")
        try:
            response = requests.post(
                f"{API_BASE_URL}/sales-transactions",
                json=test_case["data"],
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                transaction = response.json()
                print(f"Transaction Number: {transaction['transaction_number']}")
                print(f"Total Amount: {transaction['total_amount']}")
                print(f"Payment Type: {transaction['payment_type']}")
                print(f"Status: {transaction['status']}")
                
                # Verify expected status
                if transaction['status'] == test_case['expected_status']:
                    print(f"✅ {test_case['name']} successful")
                    successful_transactions.append(transaction)
                else:
                    print(f"❌ Status mismatch: expected {test_case['expected_status']}, got {transaction['status']}")
                    return False
                    
            else:
                print(f"❌ {test_case['name']} failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ {test_case['name']} request failed: {e}")
            return False
    
    print(f"\n✅ All {len(test_cases)} sales transaction tests passed")
    return True

def test_sales_transaction_validation():
    """Test sales transaction validation (insufficient stock, non-existent products)"""
    print("\n7. Testing Sales Transaction Validation")
    print("-" * 45)
    
    # Get available inventory
    try:
        inventory_response = requests.get(f"{API_BASE_URL}/inventory", timeout=10)
        inventory = inventory_response.json()
        if not inventory:
            print("❌ No inventory available for validation testing")
            return False
    except Exception as e:
        print(f"❌ Error getting inventory: {e}")
        return False
    
    # Test insufficient stock
    print("\nTesting insufficient stock validation:")
    insufficient_stock_data = {
        "items": [
            {
                "product_id": inventory[0]["id"],
                "product_name": inventory[0]["name"],
                "quantity_kg": inventory[0]["quantity"] + 1000.0,  # More than available
                "unit_price": 45.0
            }
        ],
        "payment_type": "cash",
        "sales_person_id": "sales_001",
        "sales_person_name": "John Sales",
        "branch_id": "branch_001"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/sales-transactions",
            json=insufficient_stock_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 400:
            print("✅ Insufficient stock validation working correctly")
        else:
            print(f"❌ Expected 400 error for insufficient stock, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Insufficient stock test failed: {e}")
        return False
    
    # Test non-existent product
    print("\nTesting non-existent product validation:")
    nonexistent_product_data = {
        "items": [
            {
                "product_id": "nonexistent-id",
                "product_name": "Nonexistent Product",
                "quantity_kg": 50.0,
                "unit_price": 45.0
            }
        ],
        "payment_type": "cash",
        "sales_person_id": "sales_001",
        "sales_person_name": "John Sales",
        "branch_id": "branch_001"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/sales-transactions",
            json=nonexistent_product_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 404:
            print("✅ Non-existent product validation working correctly")
        else:
            print(f"❌ Expected 404 error for non-existent product, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Non-existent product test failed: {e}")
        return False
    
    # Test loan without customer info
    print("\nTesting loan transaction without customer info:")
    loan_without_customer_data = {
        "items": [
            {
                "product_id": inventory[0]["id"],
                "product_name": inventory[0]["name"],
                "quantity_kg": 50.0,
                "unit_price": 45.0
            }
        ],
        "payment_type": "loan",
        "sales_person_id": "sales_001",
        "sales_person_name": "John Sales",
        "branch_id": "branch_001"
        # Missing customer_id and customer_name
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/sales-transactions",
            json=loan_without_customer_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 400:
            print("✅ Loan customer validation working correctly")
        else:
            print(f"❌ Expected 400 error for loan without customer, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Loan customer validation test failed: {e}")
        return False
    
    print("\n✅ All validation tests passed")
    return True

def test_inventory_requests():
    """Test POST /api/inventory-requests - Sales team requesting flour"""
    print("\n8. Testing Inventory Requests (POST /api/inventory-requests)")
    print("-" * 55)
    
    test_cases = [
        {
            "name": "50kg Package Request",
            "data": {
                "product_name": "1st Quality Flour",
                "package_size": "50kg",
                "quantity": 10,
                "requested_by": "sales_001"
            },
            "expected_weight": 500.0
        },
        {
            "name": "25kg Package Request",
            "data": {
                "product_name": "Bread Flour",
                "package_size": "25kg",
                "quantity": 8,
                "requested_by": "sales_001"
            },
            "expected_weight": 200.0
        },
        {
            "name": "10kg Package Request",
            "data": {
                "product_name": "Fruska",
                "package_size": "10kg",
                "quantity": 15,
                "requested_by": "sales_001"
            },
            "expected_weight": 150.0
        },
        {
            "name": "5kg Package Request",
            "data": {
                "product_name": "Fruskelo",
                "package_size": "5kg",
                "quantity": 20,
                "requested_by": "sales_001"
            },
            "expected_weight": 100.0
        }
    ]
    
    successful_requests = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}: {test_case['name']}")
        try:
            response = requests.post(
                f"{API_BASE_URL}/inventory-requests",
                json=test_case["data"],
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                request = response.json()
                print(f"Request Number: {request['request_number']}")
                print(f"Product: {request['product_name']}")
                print(f"Package Size: {request['package_size']}")
                print(f"Quantity: {request['quantity']}")
                print(f"Total Weight: {request['total_weight']}kg")
                print(f"Status: {request['status']}")
                
                # Verify total weight calculation
                if request['total_weight'] == test_case['expected_weight']:
                    print(f"✅ {test_case['name']} successful")
                    successful_requests.append(request)
                else:
                    print(f"❌ Weight calculation error: expected {test_case['expected_weight']}, got {request['total_weight']}")
                    return False
                    
            else:
                print(f"❌ {test_case['name']} failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ {test_case['name']} request failed: {e}")
            return False
    
    # Test invalid package size
    print(f"\nTesting invalid package size:")
    invalid_data = {
        "product_name": "1st Quality Flour",
        "package_size": "15kg",  # Invalid size
        "quantity": 5,
        "requested_by": "sales_001"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/inventory-requests",
            json=invalid_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 400:
            print("✅ Invalid package size validation working correctly")
        else:
            print(f"❌ Expected 400 error for invalid package size, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Invalid package size test failed: {e}")
        return False
    
    print(f"\n✅ All {len(test_cases)} inventory request tests passed")
    return True

def test_purchase_requests():
    """Test POST /api/purchase-requests - Sales team requesting supplies"""
    print("\n9. Testing Purchase Requests (POST /api/purchase-requests)")
    print("-" * 50)
    
    test_cases = [
        {
            "name": "Office Supplies Request",
            "data": {
                "description": "Office supplies: pens, paper, folders",
                "estimated_cost": 2500.0,
                "reason": "Monthly office supply replenishment",
                "requested_by": "sales_001"
            }
        },
        {
            "name": "Packaging Materials Request",
            "data": {
                "description": "Flour packaging bags (50kg, 25kg, 10kg)",
                "estimated_cost": 15000.0,
                "reason": "Running low on packaging materials for sales",
                "requested_by": "sales_001"
            }
        },
        {
            "name": "Marketing Materials Request",
            "data": {
                "description": "Promotional banners and brochures",
                "estimated_cost": 5000.0,
                "reason": "Upcoming trade fair participation",
                "requested_by": "sales_001"
            }
        }
    ]
    
    successful_requests = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}: {test_case['name']}")
        try:
            response = requests.post(
                f"{API_BASE_URL}/purchase-requests",
                json=test_case["data"],
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                request = response.json()
                print(f"Request Number: {request['request_number']}")
                print(f"Description: {request['description']}")
                print(f"Estimated Cost: {request['estimated_cost']}")
                print(f"Status: {request['status']}")
                print(f"Requested By: {request['requested_by']}")
                
                # Verify it integrates with approval workflow
                if request['status'] == 'pending':
                    print(f"✅ {test_case['name']} successful")
                    successful_requests.append(request)
                else:
                    print(f"❌ Expected 'pending' status, got {request['status']}")
                    return False
                    
            else:
                print(f"❌ {test_case['name']} failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ {test_case['name']} request failed: {e}")
            return False
    
    print(f"\n✅ All {len(test_cases)} purchase request tests passed")
    return True

def test_sales_reports():
    """Test GET /api/reports/sales - Sales reporting with filters"""
    print("\n10. Testing Sales Reports (GET /api/reports/sales)")
    print("-" * 45)
    
    test_cases = [
        {
            "name": "Daily Report",
            "params": {"period": "daily"}
        },
        {
            "name": "Weekly Report", 
            "params": {"period": "weekly"}
        },
        {
            "name": "Monthly Report",
            "params": {"period": "monthly"}
        },
        {
            "name": "Sales Person Filter",
            "params": {"period": "daily", "sales_person_id": "sales_001"}
        },
        {
            "name": "Date Range Filter",
            "params": {
                "start_date": "2024-01-01T00:00:00Z",
                "end_date": "2024-12-31T23:59:59Z"
            }
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}: {test_case['name']}")
        try:
            response = requests.get(
                f"{API_BASE_URL}/reports/sales",
                params=test_case["params"],
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                report = response.json()
                
                # Verify report structure
                required_keys = ["summary", "transactions", "top_products"]
                if all(key in report for key in required_keys):
                    summary = report["summary"]
                    print(f"Period: {summary.get('period', 'N/A')}")
                    print(f"Total Sales: {summary.get('total_sales', 0)}")
                    print(f"Total Transactions: {summary.get('total_transactions', 0)}")
                    print(f"Cash Sales: {summary.get('cash_sales', 0)}")
                    print(f"Credit Sales: {summary.get('credit_sales', 0)}")
                    print(f"Top Products: {len(report['top_products'])}")
                    print(f"✅ {test_case['name']} successful")
                else:
                    print(f"❌ Missing required keys in report structure")
                    return False
                    
            else:
                print(f"❌ {test_case['name']} failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ {test_case['name']} request failed: {e}")
            return False
    
    # Test invalid date format
    print(f"\nTesting invalid date format:")
    try:
        response = requests.get(
            f"{API_BASE_URL}/reports/sales",
            params={"start_date": "invalid-date", "end_date": "also-invalid"},
            timeout=10
        )
        
        if response.status_code == 400:
            print("✅ Invalid date format validation working correctly")
        else:
            print(f"❌ Expected 400 error for invalid date, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Invalid date format test failed: {e}")
        return False
    
    print(f"\n✅ All {len(test_cases)} sales report tests passed")
    return True

def run_all_tests():
    """Run all backend API tests including Sales Role endpoints"""
    print("WHEAT FLOUR FACTORY ERP - BACKEND API TESTS")
    print("FOCUS: Sales Role & Transaction Workflow")
    print("=" * 60)
    
    test_results = {
        "root_endpoint": False,
        "create_status": False,
        "get_status": False,
        "error_handling": False,
        "data_persistence": False,
        "sales_transaction_pos": False,
        "sales_transaction_validation": False,
        "inventory_requests": False,
        "purchase_requests": False,
        "sales_reports": False
    }
    
    # Basic API tests
    test_results["root_endpoint"] = test_root_endpoint()
    
    success, created_ids = test_create_status_check()
    test_results["create_status"] = success
    
    expected_count = len(created_ids) if success else 0
    success, _ = test_get_status_checks(expected_count)
    test_results["get_status"] = success
    
    test_results["error_handling"] = test_error_handling()
    test_results["data_persistence"] = test_data_persistence()
    
    # Sales Role specific tests
    test_results["sales_transaction_pos"] = test_sales_transaction_pos()
    test_results["sales_transaction_validation"] = test_sales_transaction_validation()
    test_results["inventory_requests"] = test_inventory_requests()
    test_results["purchase_requests"] = test_purchase_requests()
    test_results["sales_reports"] = test_sales_reports()
    
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
        print("🎉 ALL TESTS PASSED - Sales Role & Transaction Workflow working correctly!")
        return True
    else:
        print("⚠️ SOME TESTS FAILED - Sales Role endpoints have issues that need attention")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)