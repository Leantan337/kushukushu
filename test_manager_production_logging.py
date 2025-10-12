"""
Test Manager Production Logging System
Tests the complete workflow: wheat delivery → milling order → output logging
"""

import asyncio
import httpx
from datetime import datetime
import sys
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Configuration
BACKEND_URL = "http://localhost:8000"
TEST_BRANCHES = ["berhane", "girmay"]

# ANSI color codes for better output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*70}")
    print(f"{text}")
    print(f"{'='*70}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")

async def get_inventory(branch_id, product_name):
    """Get inventory item for a specific branch and product"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BACKEND_URL}/api/inventory", params={"branch_id": branch_id})
        if response.status_code == 200:
            inventory = response.json()
            for item in inventory:
                if item.get("name") == product_name and item.get("branch_id") == branch_id:
                    return item
        return None

async def test_wheat_delivery(branch_id):
    """Test 1: Record wheat delivery"""
    print_header(f"TEST 1: Wheat Delivery - {branch_id.upper()} BRANCH")
    
    # Get initial raw wheat stock
    initial_stock = await get_inventory(branch_id, "Raw Wheat")
    initial_quantity = initial_stock["quantity"] if initial_stock else 0
    print_info(f"Initial Raw Wheat stock: {initial_quantity}kg")
    
    # Create wheat delivery
    delivery_data = {
        "supplier_name": "Test Supplier Co.",
        "quantity_kg": 1000.0,
        "quality_rating": "excellent",
        "manager_id": f"manager-{branch_id}",
        "branch_id": branch_id
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{BACKEND_URL}/api/wheat-deliveries", json=delivery_data)
        
        if response.status_code == 200:
            result = response.json()
            print_success(f"Wheat delivery recorded: {delivery_data['quantity_kg']}kg from {delivery_data['supplier_name']}")
            
            # Verify inventory increased
            updated_stock = await get_inventory(branch_id, "Raw Wheat")
            updated_quantity = updated_stock["quantity"] if updated_stock else 0
            
            if updated_quantity == initial_quantity + 1000:
                print_success(f"Inventory updated correctly: {initial_quantity}kg → {updated_quantity}kg")
                return True, result["id"]
            else:
                print_error(f"Inventory mismatch: Expected {initial_quantity + 1000}kg, got {updated_quantity}kg")
                return False, None
        else:
            print_error(f"Failed to create wheat delivery: {response.text}")
            return False, None

async def test_milling_order(branch_id):
    """Test 2: Create milling order"""
    print_header(f"TEST 2: Create Milling Order - {branch_id.upper()} BRANCH")
    
    # Get raw wheat stock
    raw_wheat = await get_inventory(branch_id, "Raw Wheat")
    if not raw_wheat:
        print_error("No Raw Wheat inventory found")
        return False, None
    
    initial_quantity = raw_wheat["quantity"]
    print_info(f"Current Raw Wheat stock: {initial_quantity}kg")
    
    # Create milling order
    milling_input = 500.0  # Use 500kg for milling
    order_data = {
        "raw_wheat_input_kg": milling_input,
        "manager_id": f"manager-{branch_id}",
        "branch_id": branch_id
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{BACKEND_URL}/api/milling-orders", json=order_data)
        
        if response.status_code == 200:
            result = response.json()
            order_id = result["id"]
            print_success(f"Milling order created: {milling_input}kg input (Order ID: {order_id[:8]})")
            
            # Verify raw wheat decreased
            updated_wheat = await get_inventory(branch_id, "Raw Wheat")
            updated_quantity = updated_wheat["quantity"]
            
            if updated_quantity == initial_quantity - milling_input:
                print_success(f"Raw Wheat deducted: {initial_quantity}kg → {updated_quantity}kg")
                
                # Verify order is pending
                orders_response = await client.get(f"{BACKEND_URL}/api/milling-orders", params={
                    "branch_id": branch_id,
                    "status": "pending"
                })
                
                if orders_response.status_code == 200:
                    pending_orders = orders_response.json()
                    if any(order["id"] == order_id for order in pending_orders):
                        print_success(f"Order appears in pending queue")
                        return True, order_id
                    else:
                        print_error("Order not found in pending queue")
                        return False, None
                else:
                    print_error("Failed to fetch pending orders")
                    return False, None
            else:
                print_error(f"Raw Wheat not deducted correctly: Expected {initial_quantity - milling_input}kg, got {updated_quantity}kg")
                return False, None
        else:
            print_error(f"Failed to create milling order: {response.text}")
            return False, None

async def test_log_outputs(branch_id, order_id):
    """Test 3: Log production outputs"""
    print_header(f"TEST 3: Log Production Outputs - {branch_id.upper()} BRANCH")
    
    # Get inventory before logging
    async with httpx.AsyncClient() as client:
        inventory_response = await client.get(f"{BACKEND_URL}/api/inventory", params={"branch_id": branch_id})
        if inventory_response.status_code != 200:
            print_error("Failed to fetch inventory")
            return False
        
        inventory = inventory_response.json()
        
        # Define outputs based on branch
        if branch_id == "berhane":
            # Berhane produces Bread Flour and bran products
            products = {
                "Bread Flour": 325.0,  # 65% main product
                "Fruska": 100.0,       # 20% bran
                "Fruskelo": 60.0       # 12% fine bran
            }
        else:  # girmay
            # Girmay produces 1st Quality, Bread Flour, and bran products
            products = {
                "1st Quality Flour": 300.0,  # 60% main product
                "Bread Flour": 50.0,         # 10% secondary
                "Fruska": 90.0,              # 18% bran
                "Fruskelo": 50.0             # 10% fine bran
            }
        
        print_info(f"Logging outputs for Order ID: {order_id[:8]}")
        
        # Get initial quantities
        initial_quantities = {}
        for product_name in products.keys():
            item = next((i for i in inventory if i.get("name") == product_name and i.get("branch_id") == branch_id), None)
            if item:
                initial_quantities[product_name] = {
                    "id": item["id"],
                    "quantity": item["quantity"]
                }
                print_info(f"  {product_name}: {item['quantity']}kg (before)")
            else:
                print_error(f"  Product not found: {product_name}")
                return False
        
        # Prepare outputs
        outputs = []
        total_output = 0
        for product_name, quantity in products.items():
            outputs.append({
                "product_id": initial_quantities[product_name]["id"],
                "quantity": quantity
            })
            total_output += quantity
        
        print_info(f"Total output to log: {total_output}kg")
        
        # Complete milling order with outputs
        completion_data = {"outputs": outputs}
        response = await client.post(f"{BACKEND_URL}/api/milling-orders/{order_id}/complete", json=completion_data)
        
        if response.status_code == 200:
            result = response.json()
            print_success(f"Production outputs logged successfully: {len(outputs)} products")
            
            # Verify inventory increased for all products
            updated_inventory_response = await client.get(f"{BACKEND_URL}/api/inventory", params={"branch_id": branch_id})
            if updated_inventory_response.status_code == 200:
                updated_inventory = updated_inventory_response.json()
                
                all_correct = True
                for product_name, quantity in products.items():
                    updated_item = next((i for i in updated_inventory if i.get("name") == product_name and i.get("branch_id") == branch_id), None)
                    if updated_item:
                        expected = initial_quantities[product_name]["quantity"] + quantity
                        actual = updated_item["quantity"]
                        if actual == expected:
                            print_success(f"  {product_name}: {initial_quantities[product_name]['quantity']}kg → {actual}kg (+{quantity}kg)")
                        else:
                            print_error(f"  {product_name}: Expected {expected}kg, got {actual}kg")
                            all_correct = False
                    else:
                        print_error(f"  {product_name}: Not found in updated inventory")
                        all_correct = False
                
                if all_correct:
                    print_success("All inventory quantities updated correctly!")
                    
                    # Verify order is completed
                    orders_response = await client.get(f"{BACKEND_URL}/api/milling-orders", params={"branch_id": branch_id})
                    if orders_response.status_code == 200:
                        orders = orders_response.json()
                        order = next((o for o in orders if o["id"] == order_id), None)
                        if order and order["status"] == "completed":
                            print_success("Order status changed to COMPLETED")
                            return True
                        else:
                            print_error("Order status not updated to completed")
                            return False
                    else:
                        print_error("Failed to verify order status")
                        return False
                else:
                    return False
            else:
                print_error("Failed to fetch updated inventory")
                return False
        else:
            print_error(f"Failed to log outputs: {response.text}")
            return False

async def test_branch(branch_id):
    """Test complete workflow for a branch"""
    print_header(f"🏭 TESTING {branch_id.upper()} BRANCH PRODUCTION WORKFLOW")
    
    results = {
        "wheat_delivery": False,
        "milling_order": False,
        "output_logging": False
    }
    
    # Test 1: Wheat Delivery
    success, delivery_id = await test_wheat_delivery(branch_id)
    results["wheat_delivery"] = success
    
    if not success:
        print_error(f"Wheat delivery test failed for {branch_id}. Skipping remaining tests.")
        return results
    
    # Test 2: Milling Order
    success, order_id = await test_milling_order(branch_id)
    results["milling_order"] = success
    
    if not success:
        print_error(f"Milling order test failed for {branch_id}. Skipping output logging test.")
        return results
    
    # Test 3: Output Logging
    success = await test_log_outputs(branch_id, order_id)
    results["output_logging"] = success
    
    return results

async def main():
    """Run all tests"""
    print_header("🧪 MANAGER PRODUCTION LOGGING SYSTEM - COMPREHENSIVE TESTS")
    print_info(f"Backend URL: {BACKEND_URL}")
    print_info(f"Testing branches: {', '.join(TEST_BRANCHES)}")
    print_info(f"Test started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    all_results = {}
    
    # Test each branch
    for branch_id in TEST_BRANCHES:
        results = await test_branch(branch_id)
        all_results[branch_id] = results
        
        # Small delay between branches
        await asyncio.sleep(1)
    
    # Print summary
    print_header("📊 TEST SUMMARY")
    
    total_tests = 0
    passed_tests = 0
    
    for branch_id, results in all_results.items():
        print(f"\n{Colors.BOLD}{branch_id.upper()} Branch:{Colors.ENDC}")
        for test_name, result in results.items():
            total_tests += 1
            if result:
                passed_tests += 1
                print_success(f"{test_name.replace('_', ' ').title()}: PASSED")
            else:
                print_error(f"{test_name.replace('_', ' ').title()}: FAILED")
    
    print(f"\n{Colors.BOLD}Overall Results:{Colors.ENDC}")
    print(f"  Total Tests: {total_tests}")
    print(f"  Passed: {passed_tests}")
    print(f"  Failed: {total_tests - passed_tests}")
    
    if passed_tests == total_tests:
        print_success(f"\n🎉 ALL TESTS PASSED! Production logging system is working correctly.")
        return 0
    else:
        print_error(f"\n❌ Some tests failed. Please review the output above.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

