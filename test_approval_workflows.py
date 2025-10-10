"""
Comprehensive Test Script for All Approval Workflows
Tests:
1. Purchase Request Approval (Sales → Manager → Admin → Owner)
2. Stock Request Approval (Sales → Admin → Manager → Storekeeper)
"""

import requests
import json
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8000"
API_BASE = f"{BACKEND_URL}/api"

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_section(title):
    print(f"\n{BLUE}{'=' * 80}{RESET}")
    print(f"{BLUE}{title:^80}{RESET}")
    print(f"{BLUE}{'=' * 80}{RESET}\n")

def print_success(message):
    print(f"{GREEN}[SUCCESS] {message}{RESET}")

def print_error(message):
    print(f"{RED}[ERROR] {message}{RESET}")

def print_info(message):
    print(f"{YELLOW}[INFO] {message}{RESET}")

def print_detail(label, value):
    print(f"  {label}: {value}")


# ============================================================================
# TEST 1: PURCHASE REQUEST WORKFLOW
# ============================================================================

def test_purchase_request_workflow():
    print_section("TEST 1: PURCHASE REQUEST WORKFLOW")
    print_info("Testing Sales -> Manager -> Admin -> Owner approval chain")
    
    # Step 1: Create Purchase Request (Sales)
    print(f"\n{YELLOW}STEP 1: Sales User Creates Purchase Request{RESET}")
    purchase_request = {
        "description": "Office supplies: Pens, papers, folders",
        "estimated_cost": 2500.00,
        "reason": "Monthly office supplies replenishment needed",
        "requested_by": "Sales User",
        "branch_id": "sales_branch",
        "purchase_type": "cash",
        "category": "supplies",
        "impacts_inventory": False,
        "vendor_name": "Office Mart",
        "vendor_contact": "0911234567"
    }
    
    try:
        response = requests.post(f"{API_BASE}/purchase-requests", json=purchase_request)
        if response.status_code == 200:
            pr_data = response.json()
            pr_id = pr_data["id"]
            request_number = pr_data["request_number"]
            print_success(f"Purchase Request Created: {request_number}")
            print_detail("ID", pr_id)
            print_detail("Status", pr_data["status"])
            print_detail("Amount", f"ETB {pr_data['estimated_cost']:,.2f}")
            print_detail("Branch", pr_data.get("branch_id", "N/A"))
            print_detail("Purchase Type", pr_data.get("purchase_type", "N/A"))
            print_detail("Category", pr_data.get("category", "N/A"))
            print_detail("Vendor", pr_data.get("vendor_name", "N/A"))
        else:
            print_error(f"Failed to create purchase request: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print_error(f"Error creating purchase request: {e}")
        return None
    
    # Step 2: Manager Approval
    print(f"\n{YELLOW}STEP 2: Manager Approves Purchase Request{RESET}")
    manager_approval = {
        "approved_by": "Manager User",
        "notes": "Approved by manager - reasonable request"
    }
    
    try:
        response = requests.put(
            f"{API_BASE}/purchase-requisitions/{pr_id}/approve-manager",
            json=manager_approval
        )
        if response.status_code == 200:
            pr_data = response.json()
            print_success("Manager Approval Successful")
            print_detail("Status", pr_data["status"])
            print_detail("Approved by", pr_data.get("manager_approval", {}).get("approved_by", "N/A"))
        else:
            print_error(f"Manager approval failed: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print_error(f"Error during manager approval: {e}")
        return None
    
    # Step 3: Admin Approval
    print(f"\n{YELLOW}STEP 3: Admin Approves Purchase Request{RESET}")
    admin_approval = {
        "approved_by": "Admin User",
        "notes": "Approved by admin - within budget"
    }
    
    try:
        response = requests.put(
            f"{API_BASE}/purchase-requisitions/{pr_id}/approve-admin",
            json=admin_approval
        )
        if response.status_code == 200:
            pr_data = response.json()
            print_success("Admin Approval Successful")
            print_detail("Status", pr_data["status"])
            print_detail("Approved by", pr_data.get("admin_approval", {}).get("approved_by", "N/A"))
        else:
            print_error(f"Admin approval failed: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print_error(f"Error during admin approval: {e}")
        return None
    
    # Step 4: Owner Approval
    print(f"\n{YELLOW}STEP 4: Owner Approves Purchase Request{RESET}")
    owner_approval = {
        "approved_by": "Owner User",
        "notes": "Final approval granted - proceed with purchase"
    }
    
    try:
        response = requests.put(
            f"{API_BASE}/purchase-requisitions/{pr_id}/approve-owner",
            json=owner_approval
        )
        if response.status_code == 200:
            pr_data = response.json()
            print_success("Owner Approval Successful - PURCHASE REQUEST FULLY APPROVED!")
            print_detail("Final Status", pr_data["status"])
            print_detail("Approved by", pr_data.get("owner_approval", {}).get("approved_by", "N/A"))
            print_detail("Request Number", request_number)
            return pr_id
        else:
            print_error(f"Owner approval failed: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print_error(f"Error during owner approval: {e}")
        return None


# ============================================================================
# TEST 2: STOCK REQUEST WORKFLOW
# ============================================================================

def test_stock_request_workflow():
    print_section("TEST 2: STOCK REQUEST WORKFLOW")
    print_info("Testing Sales -> Admin -> Manager -> Storekeeper approval chain")
    
    # Step 1: Create Stock Request (Sales)
    print(f"\n{YELLOW}STEP 1: Sales User Creates Stock Request{RESET}")
    stock_request = {
        "product_name": "1st Quality 50kg",
        "package_size": "50kg",
        "quantity": 10,
        "requested_by": "Sales User",
        "branch_id": "berhane",
        "reason": "Need stock for customer orders"
    }
    
    try:
        response = requests.post(f"{API_BASE}/stock-requests", json=stock_request)
        if response.status_code == 200:
            sr_data = response.json()
            sr_id = sr_data["id"]
            request_number = sr_data["request_number"]
            print_success(f"Stock Request Created: {request_number}")
            print_detail("ID", sr_id)
            print_detail("Status", sr_data["status"])
            print_detail("Product", sr_data["product_name"])
            print_detail("Quantity", f"{sr_data['quantity']} packages")
            print_detail("Total Weight", f"{sr_data.get('total_weight', 0)} kg")
            print_detail("Source Branch", sr_data.get("source_branch", "N/A"))
        else:
            print_error(f"Failed to create stock request: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print_error(f"Error creating stock request: {e}")
        return None
    
    # Step 2: Admin Approval
    print(f"\n{YELLOW}STEP 2: Admin Approves Stock Request{RESET}")
    admin_approval = {
        "approved_by": "Admin User",
        "notes": "Stock available - approved"
    }
    
    try:
        response = requests.put(
            f"{API_BASE}/stock-requests/{sr_id}/approve-admin",
            json=admin_approval
        )
        if response.status_code == 200:
            sr_data = response.json()
            print_success("Admin Approval Successful")
            print_detail("Status", sr_data["status"])
            print_detail("Approved by", sr_data.get("admin_approval", {}).get("approved_by", "N/A"))
            print_detail("Inventory Reserved", sr_data.get("inventory_reserved", False))
        else:
            print_error(f"Admin approval failed: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print_error(f"Error during admin approval: {e}")
        return None
    
    # Step 3: Manager Approval
    print(f"\n{YELLOW}STEP 3: Manager Approves Stock Request{RESET}")
    manager_approval = {
        "approved_by": "Manager User",
        "notes": "Approved for fulfillment"
    }
    
    try:
        response = requests.put(
            f"{API_BASE}/stock-requests/{sr_id}/approve-manager",
            json=manager_approval
        )
        if response.status_code == 200:
            sr_data = response.json()
            print_success("Manager Approval Successful")
            print_detail("Status", sr_data["status"])
            print_detail("Approved by", sr_data.get("manager_approval", {}).get("approved_by", "N/A"))
        else:
            print_error(f"Manager approval failed: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print_error(f"Error during manager approval: {e}")
        return None
    
    # Step 4: Storekeeper Fulfillment
    print(f"\n{YELLOW}STEP 4: Storekeeper Fulfills Stock Request{RESET}")
    fulfillment = {
        "fulfilled_by": "Storekeeper User",
        "notes": "Items prepared and ready for pickup"
    }
    
    try:
        response = requests.put(
            f"{API_BASE}/stock-requests/{sr_id}/fulfill",
            json=fulfillment
        )
        if response.status_code == 200:
            sr_data = response.json()
            print_success("Fulfillment Successful - STOCK REQUEST READY FOR GUARD!")
            print_detail("Status", sr_data["status"])
            print_detail("Fulfilled by", sr_data.get("fulfillment", {}).get("fulfilled_by", "N/A"))
            print_detail("Request Number", request_number)
            return sr_id
        else:
            print_error(f"Fulfillment failed: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print_error(f"Error during fulfillment: {e}")
        return None


# ============================================================================
# TEST 3: REJECTION WORKFLOW
# ============================================================================

def test_rejection_workflow():
    print_section("TEST 3: REJECTION WORKFLOW")
    print_info("Testing rejection at various stages")
    
    # Create a purchase request to reject
    print(f"\n{YELLOW}Creating Purchase Request for Rejection Test{RESET}")
    purchase_request = {
        "description": "Expensive equipment - Heavy machinery",
        "estimated_cost": 50000.00,
        "reason": "Testing rejection workflow - cost too high",
        "requested_by": "Sales User",
        "branch_id": "sales_branch",
        "purchase_type": "material",
        "category": "equipment",
        "impacts_inventory": False
    }
    
    try:
        response = requests.post(f"{API_BASE}/purchase-requests", json=purchase_request)
        if response.status_code == 200:
            pr_data = response.json()
            pr_id = pr_data["id"]
            print_success(f"Purchase Request Created: {pr_data['request_number']}")
        else:
            print_error(f"Failed to create request for rejection test: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False
    
    # Reject at manager level
    print(f"\n{YELLOW}Manager Rejects Purchase Request{RESET}")
    rejection = {
        "rejected_by": "Manager User",
        "reason": "Cost too high, not in budget"
    }
    
    try:
        response = requests.put(
            f"{API_BASE}/purchase-requisitions/{pr_id}/reject",
            json=rejection
        )
        if response.status_code == 200:
            pr_data = response.json()
            print_success("Rejection Successful")
            print_detail("Status", pr_data["status"])
            print_detail("Rejected by", rejection["rejected_by"])
            print_detail("Reason", rejection["reason"])
            return True
        else:
            print_error(f"Rejection failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error during rejection: {e}")
        return False


# ============================================================================
# RUN ALL TESTS
# ============================================================================

def run_all_tests():
    print(f"{BLUE}")
    print("=" * 80)
    print("           COMPREHENSIVE APPROVAL WORKFLOW TEST SUITE                      ")
    print("=" * 80)
    print(f"{RESET}")
    
    results = {
        "purchase_request": False,
        "stock_request": False,
        "rejection": False
    }
    
    # Test 1: Purchase Request Workflow
    try:
        pr_id = test_purchase_request_workflow()
        results["purchase_request"] = pr_id is not None
    except Exception as e:
        print_error(f"Purchase request test failed with exception: {e}")
    
    # Test 2: Stock Request Workflow
    try:
        sr_id = test_stock_request_workflow()
        results["stock_request"] = sr_id is not None
    except Exception as e:
        print_error(f"Stock request test failed with exception: {e}")
    
    # Test 3: Rejection Workflow
    try:
        results["rejection"] = test_rejection_workflow()
    except Exception as e:
        print_error(f"Rejection test failed with exception: {e}")
    
    # Summary
    print_section("TEST SUMMARY")
    
    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)
    
    print(f"\nTotal Tests: {total_tests}")
    print(f"Passed: {GREEN}{passed_tests}{RESET}")
    print(f"Failed: {RED}{total_tests - passed_tests}{RESET}")
    print()
    
    for test_name, passed in results.items():
        status = f"{GREEN}PASSED{RESET}" if passed else f"{RED}FAILED{RESET}"
        print(f"  {test_name.replace('_', ' ').title()}: {status}")
    
    print()
    
    if passed_tests == total_tests:
        print(f"{GREEN}{'=' * 80}{RESET}")
        print(f"{GREEN}ALL TESTS PASSED!{RESET}")
        print(f"{GREEN}{'=' * 80}{RESET}")
    else:
        print(f"{RED}{'=' * 80}{RESET}")
        print(f"{RED}SOME TESTS FAILED - Please review the output above{RESET}")
        print(f"{RED}{'=' * 80}{RESET}")


if __name__ == "__main__":
    print_info("Make sure the backend server is running on http://localhost:8000")
    print_info("Starting tests in 2 seconds...\n")
    
    import time
    time.sleep(2)
    
    run_all_tests()

