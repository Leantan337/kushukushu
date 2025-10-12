#!/usr/bin/env python3
"""
Role Interconnection Testing Script
Automatically verifies that all roles are properly connected and working together
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Optional
import sys

# Configuration
BACKEND_URL = "http://localhost:8000"
API_BASE = f"{BACKEND_URL}/api"

# ANSI Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'

class TestResult:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        self.tests = []
    
    def add_pass(self, test_name: str, message: str):
        self.passed += 1
        self.tests.append({
            'status': 'PASS',
            'test': test_name,
            'message': message
        })
        print(f"{GREEN}[PASS]{RESET}: {test_name} - {message}")
    
    def add_fail(self, test_name: str, message: str):
        self.failed += 1
        self.tests.append({
            'status': 'FAIL',
            'test': test_name,
            'message': message
        })
        print(f"{RED}[FAIL]{RESET}: {test_name} - {message}")
    
    def add_warning(self, test_name: str, message: str):
        self.warnings += 1
        self.tests.append({
            'status': 'WARN',
            'test': test_name,
            'message': message
        })
        print(f"{YELLOW}[WARN]{RESET}: {test_name} - {message}")
    
    def print_summary(self):
        total = self.passed + self.failed + self.warnings
        print(f"\n{BOLD}{'='*60}{RESET}")
        print(f"{BOLD}TEST SUMMARY{RESET}")
        print(f"{'='*60}")
        print(f"Total Tests: {total}")
        print(f"{GREEN}Passed: {self.passed}{RESET}")
        print(f"{RED}Failed: {self.failed}{RESET}")
        print(f"{YELLOW}Warnings: {self.warnings}{RESET}")
        print(f"{'='*60}")
        
        if self.failed == 0:
            print(f"\n{GREEN}{BOLD}[SUCCESS] ALL TESTS PASSED! Roles are properly interconnected.{RESET}\n")
            return 0
        else:
            print(f"\n{RED}{BOLD}[FAILED] SOME TESTS FAILED. Check the output above.{RESET}\n")
            return 1


def check_backend_connection(result: TestResult):
    """Test 1: Verify backend is running"""
    print(f"\n{BOLD}{BLUE}TEST 1: Backend Connection{RESET}")
    try:
        response = requests.get(f"{BACKEND_URL}/api/", timeout=5)
        if response.status_code == 200:
            result.add_pass("Backend Connection", f"Backend is running on {BACKEND_URL}")
            return True
        else:
            result.add_fail("Backend Connection", f"Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        result.add_fail("Backend Connection", f"Cannot connect to {BACKEND_URL}. Is the backend running?")
        return False
    except Exception as e:
        result.add_fail("Backend Connection", f"Error: {str(e)}")
        return False


def test_inventory_api(result: TestResult):
    """Test 2: Verify inventory API works"""
    print(f"\n{BOLD}{BLUE}TEST 2: Inventory API{RESET}")
    try:
        response = requests.get(f"{API_BASE}/inventory", timeout=5)
        if response.status_code == 200:
            inventory = response.json()
            result.add_pass("Inventory API", f"Retrieved {len(inventory)} inventory items")
            return inventory
        else:
            result.add_fail("Inventory API", f"Failed with status {response.status_code}")
            return None
    except Exception as e:
        result.add_fail("Inventory API", f"Error: {str(e)}")
        return None


def test_stock_requests_api(result: TestResult):
    """Test 3: Verify stock requests API works"""
    print(f"\n{BOLD}{BLUE}TEST 3: Stock Requests API{RESET}")
    try:
        response = requests.get(f"{API_BASE}/stock-requests", timeout=5)
        if response.status_code == 200:
            requests_data = response.json()
            result.add_pass("Stock Requests API", f"Retrieved {len(requests_data)} stock requests")
            return requests_data
        else:
            result.add_fail("Stock Requests API", f"Failed with status {response.status_code}")
            return None
    except Exception as e:
        result.add_fail("Stock Requests API", f"Error: {str(e)}")
        return None


def test_finance_api(result: TestResult):
    """Test 4: Verify finance API works"""
    print(f"\n{BOLD}{BLUE}TEST 4: Finance API{RESET}")
    try:
        response = requests.get(f"{API_BASE}/finance/transactions", timeout=5)
        if response.status_code == 200:
            transactions = response.json()
            result.add_pass("Finance API", f"Retrieved {len(transactions)} finance transactions")
            return transactions
        else:
            result.add_fail("Finance API", f"Failed with status {response.status_code}")
            return None
    except Exception as e:
        result.add_fail("Finance API", f"Error: {str(e)}")
        return None


def test_create_stock_request(result: TestResult, inventory: List[Dict]) -> Optional[str]:
    """Test 5: Create stock request (Sales role)"""
    print(f"\n{BOLD}{BLUE}TEST 5: Create Stock Request (Sales -> System){RESET}")
    
    if not inventory or len(inventory) == 0:
        result.add_fail("Create Stock Request", "No inventory items available")
        return None
    
    # Find a suitable product
    product = None
    for item in inventory:
        if item.get('quantity', 0) > 100 and item.get('is_sellable', True):
            product = item
            break
    
    if not product:
        result.add_warning("Create Stock Request", "No suitable products with sufficient stock")
        return None
    
    try:
        request_data = {
            "product_name": product['name'],
            "package_size": product.get('package_size', '50kg'),
            "quantity": 5,
            "requested_by": "Test Sales User",
            "branch_id": "berhane",
            "reason": "Automated test - verifying role interconnections"
        }
        
        response = requests.post(
            f"{API_BASE}/stock-requests",
            json=request_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            request = response.json()
            request_id = request.get('id')
            request_number = request.get('request_number')
            status = request.get('status')
            
            if status == 'pending_admin_approval':
                result.add_pass(
                    "Create Stock Request",
                    f"Created {request_number} with status '{status}'"
                )
                return request_id
            else:
                result.add_fail(
                    "Create Stock Request",
                    f"Created but status is '{status}' instead of 'pending_admin_approval'"
                )
                return request_id
        else:
            error_detail = response.json().get('detail', 'Unknown error')
            result.add_fail("Create Stock Request", f"Failed: {error_detail}")
            return None
            
    except Exception as e:
        result.add_fail("Create Stock Request", f"Error: {str(e)}")
        return None


def test_admin_approval(result: TestResult, request_id: str) -> bool:
    """Test 6: Admin approves stock request (Admin -> Manager)"""
    print(f"\n{BOLD}{BLUE}TEST 6: Admin Approval (Admin -> Manager){RESET}")
    
    if not request_id:
        result.add_fail("Admin Approval", "No request ID provided")
        return False
    
    try:
        approval_data = {
            "approved_by": "Test Admin User",
            "notes": "Automated test - admin approval"
        }
        
        response = requests.put(
            f"{API_BASE}/stock-requests/{request_id}/approve-admin",
            json=approval_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            request = response.json()
            status = request.get('status')
            inventory_reserved = request.get('inventory_reserved', False)
            
            if status == 'pending_manager_approval' and inventory_reserved:
                result.add_pass(
                    "Admin Approval",
                    f"Approved successfully. Status: '{status}', Inventory reserved: {inventory_reserved}"
                )
                return True
            else:
                result.add_fail(
                    "Admin Approval",
                    f"Status is '{status}' (expected 'pending_manager_approval')"
                )
                return False
        else:
            error_detail = response.json().get('detail', 'Unknown error')
            result.add_fail("Admin Approval", f"Failed: {error_detail}")
            return False
            
    except Exception as e:
        result.add_fail("Admin Approval", f"Error: {str(e)}")
        return False


def test_manager_approval(result: TestResult, request_id: str) -> bool:
    """Test 7: Manager approves stock request (Manager -> Storekeeper)"""
    print(f"\n{BOLD}{BLUE}TEST 7: Manager Approval (Manager -> Storekeeper){RESET}")
    
    if not request_id:
        result.add_fail("Manager Approval", "No request ID provided")
        return False
    
    try:
        approval_data = {
            "approved_by": "Test Manager User",
            "notes": "Automated test - manager approval"
        }
        
        response = requests.put(
            f"{API_BASE}/stock-requests/{request_id}/approve-manager",
            json=approval_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            request = response.json()
            status = request.get('status')
            
            if status == 'pending_fulfillment':
                result.add_pass(
                    "Manager Approval",
                    f"Approved successfully. Status: '{status}' (ready for storekeeper)"
                )
                return True
            else:
                result.add_fail(
                    "Manager Approval",
                    f"Status is '{status}' (expected 'pending_fulfillment')"
                )
                return False
        else:
            error_detail = response.json().get('detail', 'Unknown error')
            result.add_fail("Manager Approval", f"Failed: {error_detail}")
            return False
            
    except Exception as e:
        result.add_fail("Manager Approval", f"Error: {str(e)}")
        return False


def test_storekeeper_fulfillment(result: TestResult, request_id: str) -> bool:
    """Test 8: Storekeeper fulfills request (Storekeeper -> Guard)"""
    print(f"\n{BOLD}{BLUE}TEST 8: Storekeeper Fulfillment (Storekeeper -> Guard){RESET}")
    
    if not request_id:
        result.add_fail("Storekeeper Fulfillment", "No request ID provided")
        return False
    
    try:
        fulfillment_data = {
            "fulfilled_by": "Test Storekeeper User",
            "packing_slip_number": f"PS-TEST-{int(time.time())}",
            "actual_quantity": 5,
            "notes": "Automated test - fulfillment"
        }
        
        response = requests.put(
            f"{API_BASE}/stock-requests/{request_id}/fulfill",
            json=fulfillment_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            request = response.json()
            status = request.get('status')
            inventory_deducted = request.get('inventory_deducted', False)
            
            if status == 'ready_for_pickup' and inventory_deducted:
                result.add_pass(
                    "Storekeeper Fulfillment",
                    f"Fulfilled successfully. Status: '{status}', Inventory deducted: {inventory_deducted}"
                )
                return True
            else:
                result.add_fail(
                    "Storekeeper Fulfillment",
                    f"Status is '{status}', Inventory deducted: {inventory_deducted}"
                )
                return False
        else:
            error_detail = response.json().get('detail', 'Unknown error')
            result.add_fail("Storekeeper Fulfillment", f"Failed: {error_detail}")
            return False
            
    except Exception as e:
        result.add_fail("Storekeeper Fulfillment", f"Error: {str(e)}")
        return False


def test_guard_verification(result: TestResult, request_id: str) -> bool:
    """Test 9: Guard verifies and releases (Guard -> Sales)"""
    print(f"\n{BOLD}{BLUE}TEST 9: Guard Verification (Guard -> Sales){RESET}")
    
    if not request_id:
        result.add_fail("Guard Verification", "No request ID provided")
        return False
    
    try:
        verification_data = {
            "verified_by": "Test Guard User",
            "gate_pass_number": f"GP-TEST-{int(time.time())}",
            "vehicle_number": "ET-TEST-123",
            "driver_name": "Test Driver",
            "notes": "Automated test - gate verification"
        }
        
        response = requests.put(
            f"{API_BASE}/stock-requests/{request_id}/gate-verify",
            json=verification_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            request = response.json()
            status = request.get('status')
            
            if status == 'in_transit':
                result.add_pass(
                    "Guard Verification",
                    f"Verified successfully. Status: '{status}' (ready for delivery)"
                )
                return True
            else:
                result.add_fail(
                    "Guard Verification",
                    f"Status is '{status}' (expected 'in_transit')"
                )
                return False
        else:
            error_detail = response.json().get('detail', 'Unknown error')
            result.add_fail("Guard Verification", f"Failed: {error_detail}")
            return False
            
    except Exception as e:
        result.add_fail("Guard Verification", f"Error: {str(e)}")
        return False


def test_sales_confirmation(result: TestResult, request_id: str) -> bool:
    """Test 10: Sales confirms delivery (Complete workflow)"""
    print(f"\n{BOLD}{BLUE}TEST 10: Sales Delivery Confirmation (Complete Workflow){RESET}")
    
    if not request_id:
        result.add_fail("Sales Confirmation", "No request ID provided")
        return False
    
    try:
        confirmation_data = {
            "confirmed_by": "Test Sales User",
            "received_quantity": 5,
            "condition": "good",
            "notes": "Automated test - delivery confirmed"
        }
        
        response = requests.put(
            f"{API_BASE}/stock-requests/{request_id}/confirm-delivery",
            json=confirmation_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            request = response.json()
            status = request.get('status')
            delivery_confirmed = request.get('delivery_confirmed', False)
            
            if status == 'confirmed' and delivery_confirmed:
                result.add_pass(
                    "Sales Confirmation",
                    f"Confirmed successfully. Status: '{status}' - WORKFLOW COMPLETE!"
                )
                return True
            else:
                result.add_fail(
                    "Sales Confirmation",
                    f"Status is '{status}', Delivery confirmed: {delivery_confirmed}"
                )
                return False
        else:
            error_detail = response.json().get('detail', 'Unknown error')
            result.add_fail("Sales Confirmation", f"Failed: {error_detail}")
            return False
            
    except Exception as e:
        result.add_fail("Sales Confirmation", f"Error: {str(e)}")
        return False


def verify_workflow_history(result: TestResult, request_id: str):
    """Test 11: Verify complete workflow history"""
    print(f"\n{BOLD}{BLUE}TEST 11: Workflow History Verification{RESET}")
    
    if not request_id:
        result.add_fail("Workflow History", "No request ID provided")
        return
    
    try:
        response = requests.get(f"{API_BASE}/stock-requests/{request_id}", timeout=5)
        
        if response.status_code == 200:
            request = response.json()
            workflow_history = request.get('workflow_history', [])
            
            expected_stages = [
                'created',
                'admin_approval',
                'manager_approval',
                'fulfillment',
                'gate_verification',
                'delivery_confirmation'
            ]
            
            found_stages = [entry.get('stage') for entry in workflow_history]
            
            all_stages_present = all(stage in found_stages for stage in expected_stages)
            
            if all_stages_present:
                result.add_pass(
                    "Workflow History",
                    f"All 6 workflow stages recorded: {', '.join(expected_stages)}"
                )
            else:
                missing = [s for s in expected_stages if s not in found_stages]
                result.add_fail(
                    "Workflow History",
                    f"Missing stages: {', '.join(missing)}"
                )
        else:
            result.add_fail("Workflow History", f"Failed to retrieve request")
            
    except Exception as e:
        result.add_fail("Workflow History", f"Error: {str(e)}")


def test_loans_api(result: TestResult):
    """Test 12: Verify loans API (Sales-Finance integration)"""
    print(f"\n{BOLD}{BLUE}TEST 12: Loans API (Sales-Finance Integration){RESET}")
    try:
        response = requests.get(f"{API_BASE}/loans", timeout=5)
        if response.status_code == 200:
            loans = response.json()
            result.add_pass("Loans API", f"Retrieved {len(loans)} loans (Sales-Finance integration working)")
            return loans
        else:
            result.add_fail("Loans API", f"Failed with status {response.status_code}")
            return None
    except Exception as e:
        result.add_fail("Loans API", f"Error: {str(e)}")
        return None


def test_customers_api(result: TestResult):
    """Test 13: Verify customers API (Sales-Finance integration)"""
    print(f"\n{BOLD}{BLUE}TEST 13: Customers API (Sales-Finance Integration){RESET}")
    try:
        response = requests.get(f"{API_BASE}/customers", timeout=5)
        if response.status_code == 200:
            customers = response.json()
            result.add_pass("Customers API", f"Retrieved {len(customers)} customers")
            return customers
        else:
            result.add_fail("Customers API", f"Failed with status {response.status_code}")
            return None
    except Exception as e:
        result.add_fail("Customers API", f"Error: {str(e)}")
        return None


def main():
    print(f"\n{BOLD}{BLUE}{'='*60}{RESET}")
    print(f"{BOLD}{BLUE}ROLE INTERCONNECTION AUTOMATED TEST SUITE{RESET}")
    print(f"{BOLD}{BLUE}{'='*60}{RESET}")
    print(f"Testing: Sales <-> Admin <-> Manager <-> Storekeeper <-> Guard <-> Finance")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Backend: {BACKEND_URL}\n")
    
    result = TestResult()
    
    # Test 1: Backend connection
    if not check_backend_connection(result):
        print(f"\n{RED}Cannot proceed without backend connection.{RESET}")
        result.print_summary()
        return 1
    
    # Test 2: Inventory API
    inventory = test_inventory_api(result)
    
    # Test 3: Stock Requests API
    stock_requests = test_stock_requests_api(result)
    
    # Test 4: Finance API
    finance_transactions = test_finance_api(result)
    
    # Test 12-13: Sales-Finance integration
    loans = test_loans_api(result)
    customers = test_customers_api(result)
    
    # Tests 5-10: Complete stock request workflow
    print(f"\n{BOLD}{YELLOW}{'='*60}{RESET}")
    print(f"{BOLD}{YELLOW}TESTING COMPLETE WORKFLOW (6 ROLES){RESET}")
    print(f"{BOLD}{YELLOW}{'='*60}{RESET}")
    
    # Test 5: Sales creates request
    request_id = test_create_stock_request(result, inventory)
    
    if request_id:
        # Test 6: Admin approves
        if test_admin_approval(result, request_id):
            # Test 7: Manager approves
            if test_manager_approval(result, request_id):
                # Test 8: Storekeeper fulfills
                if test_storekeeper_fulfillment(result, request_id):
                    # Test 9: Guard verifies
                    if test_guard_verification(result, request_id):
                        # Test 10: Sales confirms
                        test_sales_confirmation(result, request_id)
        
        # Test 11: Verify complete workflow history
        verify_workflow_history(result, request_id)
    else:
        result.add_warning(
            "Workflow Test",
            "Could not complete workflow test - no request created"
        )
    
    # Print summary
    return result.print_summary()


if __name__ == "__main__":
    sys.exit(main())

