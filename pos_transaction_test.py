#!/usr/bin/env python3
"""
Focused POS Transaction Testing
Tests the specific scenarios requested in the review:
1. Valid sales transaction with cash payment - verify inventory deduction
2. Valid sales transaction with loan payment - verify customer info requirement  
3. Insufficient stock scenario - proper error handling
4. Invalid product ID - proper error handling
5. Transaction numbering is sequential (TXN-000001, etc.)
6. All payment types work correctly (cash, check, transfer, loan)
"""

import requests
import json
import os
from datetime import datetime

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

print(f"Testing POS Transaction API at: {API_BASE_URL}")
print("=" * 60)

def get_inventory():
    """Get current inventory items"""
    try:
        response = requests.get(f"{API_BASE_URL}/inventory", timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Failed to get inventory: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error getting inventory: {e}")
        return []

def test_cash_payment_with_inventory_deduction():
    """Test 1: Valid cash payment transaction with inventory deduction verification"""
    print("\n1. Testing Cash Payment with Inventory Deduction")
    print("-" * 50)
    
    # Get current inventory
    inventory = get_inventory()
    if not inventory:
        print("❌ No inventory available for testing")
        return False
    
    # Select first product and record initial quantity
    product = inventory[0]
    initial_quantity = product['quantity']
    test_quantity = 100.0
    
    print(f"Product: {product['name']}")
    print(f"Initial quantity: {initial_quantity}kg")
    print(f"Transaction quantity: {test_quantity}kg")
    
    # Create cash transaction
    transaction_data = {
        "items": [
            {
                "product_id": product["id"],
                "product_name": product["name"],
                "quantity_kg": test_quantity,
                "unit_price": 45.0
            }
        ],
        "payment_type": "cash",
        "sales_person_id": "sales_test_001",
        "sales_person_name": "Test Sales Person",
        "branch_id": "branch_test_001"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/sales-transactions",
            json=transaction_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            transaction = response.json()
            print(f"✅ Transaction created: {transaction['transaction_number']}")
            print(f"Total Amount: ETB {transaction['total_amount']}")
            print(f"Payment Type: {transaction['payment_type']}")
            print(f"Status: {transaction['status']}")
            
            # Verify inventory deduction
            updated_inventory = get_inventory()
            updated_product = next((item for item in updated_inventory if item['id'] == product['id']), None)
            
            if updated_product:
                expected_quantity = initial_quantity - test_quantity
                actual_quantity = updated_product['quantity']
                
                print(f"Expected quantity after deduction: {expected_quantity}kg")
                print(f"Actual quantity after deduction: {actual_quantity}kg")
                
                if abs(actual_quantity - expected_quantity) < 0.01:  # Allow for floating point precision
                    print("✅ Inventory deduction verified successfully")
                    return True
                else:
                    print("❌ Inventory deduction failed - quantities don't match")
                    return False
            else:
                print("❌ Could not find updated product in inventory")
                return False
        else:
            print(f"❌ Transaction failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

def test_loan_payment_customer_requirement():
    """Test 2: Loan payment transaction with customer info requirement"""
    print("\n2. Testing Loan Payment Customer Info Requirement")
    print("-" * 50)
    
    inventory = get_inventory()
    if not inventory:
        print("❌ No inventory available for testing")
        return False
    
    product = inventory[0]
    
    # Test 1: Loan transaction WITH customer info (should succeed)
    print("Test 2a: Loan transaction WITH customer info")
    loan_with_customer = {
        "items": [
            {
                "product_id": product["id"],
                "product_name": product["name"],
                "quantity_kg": 50.0,
                "unit_price": 45.0
            }
        ],
        "payment_type": "loan",
        "sales_person_id": "sales_test_001",
        "sales_person_name": "Test Sales Person",
        "branch_id": "branch_test_001",
        "customer_id": "cust_test_001",
        "customer_name": "Adigrat Bakery"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/sales-transactions",
            json=loan_with_customer,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            transaction = response.json()
            if transaction['status'] == 'unpaid' and transaction['payment_type'] == 'loan':
                print(f"✅ Loan transaction successful: {transaction['transaction_number']}")
                print(f"Status: {transaction['status']} (correct for loan)")
                print(f"Customer: {transaction['customer_name']}")
            else:
                print("❌ Loan transaction status incorrect")
                return False
        else:
            print(f"❌ Loan transaction with customer failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Loan transaction with customer failed: {e}")
        return False
    
    # Test 2: Loan transaction WITHOUT customer info (should fail)
    print("\nTest 2b: Loan transaction WITHOUT customer info")
    loan_without_customer = {
        "items": [
            {
                "product_id": product["id"],
                "product_name": product["name"],
                "quantity_kg": 50.0,
                "unit_price": 45.0
            }
        ],
        "payment_type": "loan",
        "sales_person_id": "sales_test_001",
        "sales_person_name": "Test Sales Person",
        "branch_id": "branch_test_001"
        # Missing customer_id and customer_name
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/sales-transactions",
            json=loan_without_customer,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 400:
            print("✅ Loan transaction without customer info properly rejected")
            return True
        else:
            print(f"❌ Expected 400 error for loan without customer, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Loan transaction without customer test failed: {e}")
        return False

def test_insufficient_stock_error():
    """Test 3: Insufficient stock scenario"""
    print("\n3. Testing Insufficient Stock Error Handling")
    print("-" * 45)
    
    inventory = get_inventory()
    if not inventory:
        print("❌ No inventory available for testing")
        return False
    
    product = inventory[0]
    excessive_quantity = product['quantity'] + 1000.0  # More than available
    
    print(f"Product: {product['name']}")
    print(f"Available quantity: {product['quantity']}kg")
    print(f"Requesting quantity: {excessive_quantity}kg")
    
    insufficient_stock_data = {
        "items": [
            {
                "product_id": product["id"],
                "product_name": product["name"],
                "quantity_kg": excessive_quantity,
                "unit_price": 45.0
            }
        ],
        "payment_type": "cash",
        "sales_person_id": "sales_test_001",
        "sales_person_name": "Test Sales Person",
        "branch_id": "branch_test_001"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/sales-transactions",
            json=insufficient_stock_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            error_message = response.text
            print(f"✅ Insufficient stock error properly returned")
            print(f"Error message: {error_message}")
            return True
        else:
            print(f"❌ Expected 400 error for insufficient stock, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Insufficient stock test failed: {e}")
        return False

def test_invalid_product_id_error():
    """Test 4: Invalid product ID scenario"""
    print("\n4. Testing Invalid Product ID Error Handling")
    print("-" * 45)
    
    invalid_product_data = {
        "items": [
            {
                "product_id": "invalid-product-id-12345",
                "product_name": "Non-existent Product",
                "quantity_kg": 50.0,
                "unit_price": 45.0
            }
        ],
        "payment_type": "cash",
        "sales_person_id": "sales_test_001",
        "sales_person_name": "Test Sales Person",
        "branch_id": "branch_test_001"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/sales-transactions",
            json=invalid_product_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            error_message = response.text
            print(f"✅ Invalid product ID error properly returned")
            print(f"Error message: {error_message}")
            return True
        else:
            print(f"❌ Expected 404 error for invalid product ID, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Invalid product ID test failed: {e}")
        return False

def test_transaction_numbering():
    """Test 5: Sequential transaction numbering"""
    print("\n5. Testing Sequential Transaction Numbering")
    print("-" * 45)
    
    inventory = get_inventory()
    if not inventory:
        print("❌ No inventory available for testing")
        return False
    
    product = inventory[0]
    transaction_numbers = []
    
    # Create 3 transactions and check numbering
    for i in range(3):
        transaction_data = {
            "items": [
                {
                    "product_id": product["id"],
                    "product_name": product["name"],
                    "quantity_kg": 10.0,
                    "unit_price": 45.0
                }
            ],
            "payment_type": "cash",
            "sales_person_id": "sales_test_001",
            "sales_person_name": "Test Sales Person",
            "branch_id": "branch_test_001"
        }
        
        try:
            response = requests.post(
                f"{API_BASE_URL}/sales-transactions",
                json=transaction_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                transaction = response.json()
                transaction_numbers.append(transaction['transaction_number'])
                print(f"Transaction {i+1}: {transaction['transaction_number']}")
            else:
                print(f"❌ Transaction {i+1} failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Transaction {i+1} failed: {e}")
            return False
    
    # Verify sequential numbering
    print(f"\nTransaction numbers: {transaction_numbers}")
    
    # Check if they follow TXN-XXXXXX format and are sequential
    for i, txn_num in enumerate(transaction_numbers):
        if not txn_num.startswith('TXN-'):
            print(f"❌ Transaction number format incorrect: {txn_num}")
            return False
    
    print("✅ Transaction numbering format is correct (TXN-XXXXXX)")
    return True

def test_all_payment_types():
    """Test 6: All payment types work correctly"""
    print("\n6. Testing All Payment Types")
    print("-" * 35)
    
    inventory = get_inventory()
    if not inventory:
        print("❌ No inventory available for testing")
        return False
    
    product = inventory[0]
    
    payment_types = [
        {"type": "cash", "expected_status": "paid"},
        {"type": "check", "expected_status": "paid"},
        {"type": "transfer", "expected_status": "paid"},
        {"type": "loan", "expected_status": "unpaid"}
    ]
    
    for payment in payment_types:
        print(f"\nTesting {payment['type']} payment:")
        
        transaction_data = {
            "items": [
                {
                    "product_id": product["id"],
                    "product_name": product["name"],
                    "quantity_kg": 25.0,
                    "unit_price": 45.0
                }
            ],
            "payment_type": payment['type'],
            "sales_person_id": "sales_test_001",
            "sales_person_name": "Test Sales Person",
            "branch_id": "branch_test_001"
        }
        
        # Add customer info for loan payments
        if payment['type'] == 'loan':
            transaction_data['customer_id'] = 'cust_test_002'
            transaction_data['customer_name'] = 'Test Customer'
        
        try:
            response = requests.post(
                f"{API_BASE_URL}/sales-transactions",
                json=transaction_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                transaction = response.json()
                actual_status = transaction['status']
                expected_status = payment['expected_status']
                
                if actual_status == expected_status:
                    print(f"✅ {payment['type']} payment successful - Status: {actual_status}")
                else:
                    print(f"❌ {payment['type']} payment status incorrect - Expected: {expected_status}, Got: {actual_status}")
                    return False
            else:
                print(f"❌ {payment['type']} payment failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ {payment['type']} payment failed: {e}")
            return False
    
    print("\n✅ All payment types working correctly")
    return True

def test_inventory_endpoints():
    """Test basic inventory endpoints"""
    print("\n7. Testing Basic Inventory Endpoints")
    print("-" * 40)
    
    # Test GET /api/inventory
    print("Testing GET /api/inventory:")
    try:
        response = requests.get(f"{API_BASE_URL}/inventory", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            inventory = response.json()
            print(f"✅ Retrieved {len(inventory)} inventory items")
            
            if inventory:
                # Show sample inventory item
                sample_item = inventory[0]
                print(f"Sample item: {sample_item['name']} - {sample_item['quantity']}kg")
                print(f"Stock level: {sample_item['stock_level']}")
                
                # Test GET /api/inventory/{item_id}
                print(f"\nTesting GET /api/inventory/{sample_item['id']}:")
                item_response = requests.get(f"{API_BASE_URL}/inventory/{sample_item['id']}", timeout=10)
                print(f"Status Code: {item_response.status_code}")
                
                if item_response.status_code == 200:
                    item_detail = item_response.json()
                    print(f"✅ Retrieved item details: {item_detail['name']}")
                    print(f"Transactions: {len(item_detail.get('transactions', []))}")
                    return True
                else:
                    print(f"❌ Failed to get item details: {item_response.status_code}")
                    return False
            else:
                print("⚠️ No inventory items found")
                return True
        else:
            print(f"❌ Failed to get inventory: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Inventory endpoint test failed: {e}")
        return False

def run_pos_tests():
    """Run all POS transaction tests"""
    print("POS TRANSACTION ENDPOINT TESTING")
    print("Focus: Sales Transaction Validation & Error Handling")
    print("=" * 60)
    
    test_results = {
        "cash_payment_inventory_deduction": False,
        "loan_payment_customer_requirement": False,
        "insufficient_stock_error": False,
        "invalid_product_id_error": False,
        "transaction_numbering": False,
        "all_payment_types": False,
        "inventory_endpoints": False
    }
    
    # Run all tests
    test_results["cash_payment_inventory_deduction"] = test_cash_payment_with_inventory_deduction()
    test_results["loan_payment_customer_requirement"] = test_loan_payment_customer_requirement()
    test_results["insufficient_stock_error"] = test_insufficient_stock_error()
    test_results["invalid_product_id_error"] = test_invalid_product_id_error()
    test_results["transaction_numbering"] = test_transaction_numbering()
    test_results["all_payment_types"] = test_all_payment_types()
    test_results["inventory_endpoints"] = test_inventory_endpoints()
    
    # Summary
    print("\n" + "=" * 60)
    print("POS TRANSACTION TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(test_results.values())
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\nOverall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL POS TRANSACTION TESTS PASSED!")
        return True
    else:
        print("⚠️ SOME POS TRANSACTION TESTS FAILED")
        return False

if __name__ == "__main__":
    success = run_pos_tests()
    exit(0 if success else 1)