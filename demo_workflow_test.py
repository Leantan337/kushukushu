#!/usr/bin/env python3
"""
Demo Workflow Backend API Testing
Tests the specific APIs needed for the demo workflow:
1. POS Transaction API with loan payment type
2. Inventory API with stock levels and unit prices
3. Sales Reports API for daily sales data
4. Loan Tracking functionality
"""

import requests
import json
import time
from datetime import datetime, timezone
import os

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

print(f"Testing Demo Workflow APIs at: {API_BASE_URL}")
print("=" * 60)

def test_pos_loan_transaction():
    """Test POST /api/sales-transactions with loan payment type for demo workflow"""
    print("\n1. Testing POS Loan Transaction (POST /api/sales-transactions)")
    print("-" * 55)
    
    # First get available inventory
    try:
        inventory_response = requests.get(f"{API_BASE_URL}/inventory", timeout=10)
        if inventory_response.status_code != 200:
            print("❌ Failed to get inventory for loan transaction test")
            return False, None
        
        inventory = inventory_response.json()
        if not inventory:
            print("❌ No inventory available for loan transaction test")
            return False, None
            
        # Find flour products for demo
        flour_products = [item for item in inventory if 'flour' in item['name'].lower()]
        if not flour_products:
            print("❌ No flour products found in inventory")
            return False, None
            
    except Exception as e:
        print(f"❌ Error getting inventory: {e}")
        return False, None
    
    # Create loan transaction with realistic customer data
    loan_transaction_data = {
        "items": [
            {
                "product_id": flour_products[0]["id"],
                "product_name": flour_products[0]["name"],
                "quantity_kg": 100.0,
                "unit_price": 45.0
            }
        ],
        "payment_type": "loan",
        "sales_person_id": "demo_sales_001",
        "sales_person_name": "Meron Tekle",
        "branch_id": "adigrat_main",
        "customer_id": "cust_demo_001",
        "customer_name": "Adigrat Bakery"
    }
    
    print(f"Creating loan transaction for customer: {loan_transaction_data['customer_name']}")
    print(f"Product: {loan_transaction_data['items'][0]['product_name']}")
    print(f"Quantity: {loan_transaction_data['items'][0]['quantity_kg']}kg")
    print(f"Unit Price: ETB {loan_transaction_data['items'][0]['unit_price']}")
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/sales-transactions",
            json=loan_transaction_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            transaction = response.json()
            print(f"✅ Loan transaction created successfully")
            print(f"Transaction Number: {transaction['transaction_number']}")
            print(f"Total Amount: ETB {transaction['total_amount']}")
            print(f"Payment Type: {transaction['payment_type']}")
            print(f"Status: {transaction['status']}")
            print(f"Customer: {transaction['customer_name']}")
            
            # Verify loan transaction requirements
            checks = [
                (transaction['payment_type'] == 'loan', "Payment type is loan"),
                (transaction['status'] == 'unpaid', "Transaction status is unpaid"),
                (transaction['customer_id'] is not None, "Customer ID is captured"),
                (transaction['customer_name'] is not None, "Customer name is captured"),
                (len(transaction['items']) > 0, "Transaction items are included"),
                (transaction['total_amount'] > 0, "Total amount is calculated")
            ]
            
            all_passed = True
            for check, description in checks:
                if check:
                    print(f"✅ {description}")
                else:
                    print(f"❌ {description}")
                    all_passed = False
            
            if all_passed:
                print("✅ All loan transaction requirements met")
                return True, transaction
            else:
                print("❌ Some loan transaction requirements failed")
                return False, None
                
        else:
            print(f"❌ Loan transaction failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Loan transaction request failed: {e}")
        return False, None

def test_inventory_deduction():
    """Verify that inventory is automatically deducted after sales transaction"""
    print("\n2. Testing Inventory Auto-Deduction")
    print("-" * 35)
    
    try:
        # Get current inventory state
        inventory_response = requests.get(f"{API_BASE_URL}/inventory", timeout=10)
        if inventory_response.status_code != 200:
            print("❌ Failed to get inventory for deduction test")
            return False
        
        inventory_before = inventory_response.json()
        flour_product = next((item for item in inventory_before if 'flour' in item['name'].lower()), None)
        
        if not flour_product:
            print("❌ No flour product found for deduction test")
            return False
        
        initial_quantity = flour_product['quantity']
        print(f"Initial {flour_product['name']} quantity: {initial_quantity}kg")
        
        # Create a cash transaction to test deduction
        transaction_data = {
            "items": [
                {
                    "product_id": flour_product["id"],
                    "product_name": flour_product["name"],
                    "quantity_kg": 50.0,
                    "unit_price": 45.0
                }
            ],
            "payment_type": "cash",
            "sales_person_id": "demo_sales_001",
            "sales_person_name": "Meron Tekle",
            "branch_id": "adigrat_main"
        }
        
        # Execute transaction
        response = requests.post(
            f"{API_BASE_URL}/sales-transactions",
            json=transaction_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ Transaction failed: {response.status_code}")
            return False
        
        transaction = response.json()
        print(f"Transaction created: {transaction['transaction_number']}")
        
        # Check inventory after transaction
        inventory_response_after = requests.get(f"{API_BASE_URL}/inventory", timeout=10)
        inventory_after = inventory_response_after.json()
        flour_product_after = next((item for item in inventory_after if item['id'] == flour_product['id']), None)
        
        if not flour_product_after:
            print("❌ Product not found after transaction")
            return False
        
        final_quantity = flour_product_after['quantity']
        expected_quantity = initial_quantity - 50.0
        
        print(f"Final {flour_product_after['name']} quantity: {final_quantity}kg")
        print(f"Expected quantity: {expected_quantity}kg")
        
        if abs(final_quantity - expected_quantity) < 0.01:  # Allow for floating point precision
            print("✅ Inventory automatically deducted correctly")
            return True
        else:
            print(f"❌ Inventory deduction failed. Expected {expected_quantity}, got {final_quantity}")
            return False
            
    except Exception as e:
        print(f"❌ Inventory deduction test failed: {e}")
        return False

def test_inventory_api():
    """Test GET /api/inventory for demo dashboard requirements"""
    print("\n3. Testing Inventory API (GET /api/inventory)")
    print("-" * 40)
    
    try:
        response = requests.get(f"{API_BASE_URL}/inventory", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            inventory = response.json()
            print(f"Number of inventory items: {len(inventory)}")
            
            if not inventory:
                print("⚠️ No inventory items found")
                return True  # Empty inventory is valid
            
            # Check demo requirements for each item
            demo_requirements_met = True
            
            for item in inventory:
                print(f"\n--- {item['name']} ---")
                print(f"Current Stock: {item['quantity']}kg")
                print(f"Stock Level: {item['stock_level']}")
                print(f"Low Threshold: {item.get('low_threshold', 'N/A')}kg")
                print(f"Critical Threshold: {item.get('critical_threshold', 'N/A')}kg")
                
                # Check required fields for demo
                required_fields = ['id', 'name', 'quantity', 'stock_level']
                missing_fields = [field for field in required_fields if field not in item]
                
                if missing_fields:
                    print(f"❌ Missing required fields: {missing_fields}")
                    demo_requirements_met = False
                else:
                    print("✅ All required fields present")
                
                # Check stock level indicators
                stock_level = item.get('stock_level')
                if stock_level in ['ok', 'low', 'critical']:
                    print(f"✅ Stock level indicator working: {stock_level}")
                else:
                    print(f"❌ Invalid stock level indicator: {stock_level}")
                    demo_requirements_met = False
            
            # Check for finished flour products (needed for demo)
            flour_products = [item for item in inventory if 'flour' in item['name'].lower()]
            print(f"\nFinished flour products found: {len(flour_products)}")
            
            for flour in flour_products:
                print(f"- {flour['name']}: {flour['quantity']}kg ({flour['stock_level']})")
            
            if demo_requirements_met:
                print("\n✅ Inventory API meets all demo requirements")
                return True
            else:
                print("\n❌ Inventory API missing some demo requirements")
                return False
                
        else:
            print(f"❌ Inventory API failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Inventory API request failed: {e}")
        return False

def test_sales_reports_daily():
    """Test GET /api/reports/sales?period=daily for demo dashboard"""
    print("\n4. Testing Daily Sales Reports (GET /api/reports/sales?period=daily)")
    print("-" * 60)
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/reports/sales",
            params={"period": "daily"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            report = response.json()
            
            # Check report structure for demo requirements
            required_keys = ["summary", "transactions", "top_products"]
            missing_keys = [key for key in required_keys if key not in report]
            
            if missing_keys:
                print(f"❌ Missing required report keys: {missing_keys}")
                return False
            
            summary = report["summary"]
            transactions = report["transactions"]
            top_products = report["top_products"]
            
            print("=== DAILY SALES SUMMARY ===")
            print(f"Period: {summary.get('period', 'N/A')}")
            print(f"Total Sales: ETB {summary.get('total_sales', 0)}")
            print(f"Total Transactions: {summary.get('total_transactions', 0)}")
            print(f"Cash Sales: ETB {summary.get('cash_sales', 0)}")
            print(f"Credit Sales: ETB {summary.get('credit_sales', 0)}")
            print(f"Average Transaction: ETB {summary.get('average_transaction', 0):.2f}")
            
            print(f"\n=== RECENT TRANSACTIONS ===")
            print(f"Number of today's transactions: {len(transactions)}")
            
            # Show recent transactions for demo
            for i, txn in enumerate(transactions[:3]):  # Show first 3
                print(f"\nTransaction {i+1}:")
                print(f"  Number: {txn.get('transaction_number', 'N/A')}")
                print(f"  Amount: ETB {txn.get('total_amount', 0)}")
                print(f"  Payment: {txn.get('payment_type', 'N/A')}")
                print(f"  Status: {txn.get('status', 'N/A')}")
                if txn.get('customer_name'):
                    print(f"  Customer: {txn.get('customer_name')}")
            
            print(f"\n=== TOP PRODUCTS ===")
            print(f"Number of top products: {len(top_products)}")
            for product in top_products[:5]:  # Show top 5
                print(f"- {product.get('name', 'N/A')}: {product.get('quantity_sold', 0)}kg sold")
            
            # Verify demo requirements
            demo_checks = [
                (isinstance(summary.get('total_sales'), (int, float)), "Total sales is numeric"),
                (isinstance(summary.get('total_transactions'), int), "Transaction count is integer"),
                (isinstance(summary.get('cash_sales'), (int, float)), "Cash sales is numeric"),
                (isinstance(summary.get('credit_sales'), (int, float)), "Credit sales is numeric"),
                (isinstance(transactions, list), "Transactions is a list"),
                (isinstance(top_products, list), "Top products is a list")
            ]
            
            all_passed = True
            print(f"\n=== DEMO REQUIREMENTS CHECK ===")
            for check, description in demo_checks:
                if check:
                    print(f"✅ {description}")
                else:
                    print(f"❌ {description}")
                    all_passed = False
            
            if all_passed:
                print("\n✅ Daily sales report meets all demo requirements")
                return True
            else:
                print("\n❌ Daily sales report missing some demo requirements")
                return False
                
        else:
            print(f"❌ Sales report API failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Sales report API request failed: {e}")
        return False

def test_loan_tracking():
    """Test loan tracking functionality - retrieving unpaid transactions"""
    print("\n5. Testing Loan Tracking Functionality")
    print("-" * 35)
    
    try:
        # Get all sales transactions to find unpaid ones
        response = requests.get(
            f"{API_BASE_URL}/reports/sales",
            params={"period": "monthly"},  # Get broader range
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to get sales data for loan tracking: {response.status_code}")
            return False
        
        report = response.json()
        transactions = report.get("transactions", [])
        
        # Filter unpaid transactions (loans)
        unpaid_transactions = [txn for txn in transactions if txn.get('status') == 'unpaid']
        loan_transactions = [txn for txn in transactions if txn.get('payment_type') == 'loan']
        
        print(f"Total transactions found: {len(transactions)}")
        print(f"Unpaid transactions: {len(unpaid_transactions)}")
        print(f"Loan transactions: {len(loan_transactions)}")
        
        # Calculate outstanding loan amounts
        total_outstanding = sum(txn.get('total_amount', 0) for txn in unpaid_transactions)
        
        print(f"\n=== LOAN TRACKING SUMMARY ===")
        print(f"Total Outstanding Loans: ETB {total_outstanding}")
        
        # Show loan details for demo
        if unpaid_transactions:
            print(f"\n=== OUTSTANDING LOANS ===")
            for i, loan in enumerate(unpaid_transactions[:5]):  # Show first 5
                print(f"\nLoan {i+1}:")
                print(f"  Transaction: {loan.get('transaction_number', 'N/A')}")
                print(f"  Customer: {loan.get('customer_name', 'N/A')}")
                print(f"  Amount: ETB {loan.get('total_amount', 0)}")
                print(f"  Date: {loan.get('timestamp', 'N/A')[:10]}")  # Just date part
                
                # Show items in the loan
                items = loan.get('items', [])
                if items:
                    print(f"  Items:")
                    for item in items:
                        print(f"    - {item.get('product_name', 'N/A')}: {item.get('quantity_kg', 0)}kg")
        else:
            print("No outstanding loans found")
        
        # Verify loan tracking requirements
        tracking_checks = [
            (isinstance(unpaid_transactions, list), "Unpaid transactions retrievable"),
            (all('customer_name' in txn for txn in unpaid_transactions if txn.get('payment_type') == 'loan'), "Customer info available for loans"),
            (all('total_amount' in txn for txn in unpaid_transactions), "Loan amounts available"),
            (isinstance(total_outstanding, (int, float)), "Outstanding amounts calculable")
        ]
        
        all_passed = True
        print(f"\n=== LOAN TRACKING REQUIREMENTS CHECK ===")
        for check, description in tracking_checks:
            if check:
                print(f"✅ {description}")
            else:
                print(f"❌ {description}")
                all_passed = False
        
        if all_passed:
            print("\n✅ Loan tracking functionality working correctly")
            return True
        else:
            print("\n❌ Loan tracking functionality has issues")
            return False
            
    except Exception as e:
        print(f"❌ Loan tracking test failed: {e}")
        return False

def run_demo_workflow_tests():
    """Run all demo workflow tests"""
    print("DEMO WORKFLOW BACKEND API TESTS")
    print("Testing APIs needed for demo components")
    print("=" * 60)
    
    test_results = {
        "pos_loan_transaction": False,
        "inventory_deduction": False,
        "inventory_api": False,
        "sales_reports_daily": False,
        "loan_tracking": False
    }
    
    # Run tests in demo workflow order
    success, loan_transaction = test_pos_loan_transaction()
    test_results["pos_loan_transaction"] = success
    
    test_results["inventory_deduction"] = test_inventory_deduction()
    test_results["inventory_api"] = test_inventory_api()
    test_results["sales_reports_daily"] = test_sales_reports_daily()
    test_results["loan_tracking"] = test_loan_tracking()
    
    # Summary
    print("\n" + "=" * 60)
    print("DEMO WORKFLOW TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(test_results.values())
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\nOverall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL DEMO WORKFLOW TESTS PASSED!")
        print("✅ POS loan transactions working")
        print("✅ Inventory auto-deduction working") 
        print("✅ Inventory API ready for dashboard")
        print("✅ Daily sales reports working")
        print("✅ Loan tracking functionality working")
        print("\n🚀 Demo workflow APIs are ready for presentation!")
        return True
    else:
        print("⚠️ SOME DEMO WORKFLOW TESTS FAILED")
        print("The following issues need attention before demo:")
        for test_name, result in test_results.items():
            if not result:
                print(f"❌ {test_name.replace('_', ' ').title()}")
        return False

if __name__ == "__main__":
    success = run_demo_workflow_tests()
    exit(0 if success else 1)