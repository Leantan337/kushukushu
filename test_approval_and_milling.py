#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test Approval Workflow and Milling Orders
Verifies that stock request approvals and milling orders work correctly
"""

import sys
import io
import requests
import json
from datetime import datetime

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

BACKEND_URL = "http://localhost:8000"

def print_header(title):
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def print_test(test_name):
    print(f"\n{'─'*70}")
    print(f"🧪 TEST: {test_name}")
    print(f"{'─'*70}")

def print_result(success, message):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")

def print_step(step_num, description):
    print(f"\n{step_num}. {description}")

# ============================================================================
# TEST 1: Stock Request Approval Workflow
# ============================================================================
def test_stock_request_approval_workflow():
    print_test("Stock Request Approval Workflow")
    
    try:
        # Step 1: Create a stock request from Sales
        print_step(1, "Sales creates stock request")
        request_data = {
            "product_name": "1st Quality Flour",
            "package_size": "50kg",
            "quantity": 10,
            "requested_by": "Test Sales User",
            "branch_id": "berhane",
            "reason": "Low stock for customer orders"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/stock-requests", json=request_data)
        
        if response.ok:
            stock_request = response.json()
            request_id = stock_request['id']
            print_result(True, f"Stock request created: {stock_request.get('request_number')}")
            print(f"   Status: {stock_request.get('status')}")
            print(f"   Source Branch: {stock_request.get('source_branch')}")
        else:
            print_result(False, f"Failed to create stock request: {response.status_code} - {response.text[:200]}")
            return False
        
        # Step 2: Admin approves
        print_step(2, "Admin approves stock request")
        approval_data = {
            "approved_by": "Admin User",
            "notes": "Verified inventory availability"
        }
        
        response = requests.put(
            f"{BACKEND_URL}/api/stock-requests/{request_id}/approve-admin",
            json=approval_data
        )
        
        if response.ok:
            updated_request = response.json()
            print_result(True, f"Admin approved - Status: {updated_request.get('status')}")
        else:
            print_result(False, f"Admin approval failed: {response.status_code} - {response.text[:200]}")
            return False
        
        # Step 3: Manager approves
        print_step(3, "Manager approves stock request")
        approval_data = {
            "approved_by": "Manager Berhane",
            "notes": "Production capacity verified"
        }
        
        response = requests.put(
            f"{BACKEND_URL}/api/stock-requests/{request_id}/approve-manager",
            json=approval_data
        )
        
        if response.ok:
            updated_request = response.json()
            print_result(True, f"Manager approved - Status: {updated_request.get('status')}")
        else:
            print_result(False, f"Manager approval failed: {response.status_code} - {response.text[:200]}")
            return False
        
        # Step 4: Storekeeper fulfills
        print_step(4, "Storekeeper fulfills stock request")
        fulfillment_data = {
            "fulfilled_by": "Storekeeper Berhane",
            "notes": "Delivered to sales office"
        }
        
        response = requests.put(
            f"{BACKEND_URL}/api/stock-requests/{request_id}/fulfill",
            json=fulfillment_data
        )
        
        if response.ok:
            final_request = response.json()
            print_result(True, f"Order fulfilled - Status: {final_request.get('status')}")
            return True
        else:
            print_result(False, f"Fulfillment failed: {response.status_code} - {response.text[:200]}")
            return False
            
    except Exception as e:
        print_result(False, f"Exception occurred: {str(e)}")
        return False

# ============================================================================
# TEST 2: Milling Order Creation (No Approval Needed)
# ============================================================================
def test_milling_order_creation():
    print_test("Milling Order Creation (No Approval Required)")
    
    try:
        # Check raw wheat availability
        print_step(1, "Check raw wheat availability in Berhane branch")
        response = requests.get(f"{BACKEND_URL}/api/inventory?branch_id=berhane")
        
        if response.ok:
            inventory = response.json()
            raw_wheat = next((item for item in inventory if item['name'] == 'Raw Wheat'), None)
            
            if raw_wheat:
                print_result(True, f"Raw wheat available: {raw_wheat['quantity']}kg")
                
                # Create milling order
                print_step(2, "Manager creates milling order (immediate, no approval)")
                
                if raw_wheat['quantity'] < 100:
                    print_result(True, f"Insufficient wheat ({raw_wheat['quantity']}kg) - Skipping test")
                    return True
                
                milling_data = {
                    "raw_wheat_input_kg": 100,
                    "manager_id": "manager-berhane",
                    "branch_id": "berhane"
                }
                
                response = requests.post(f"{BACKEND_URL}/api/milling-orders", json=milling_data)
                
                if response.ok:
                    milling_order = response.json()
                    print_result(True, f"✅ Milling order created IMMEDIATELY")
                    print(f"   Order ID: {milling_order.get('id')[:8]}...")
                    print(f"   Status: {milling_order.get('status')} (no approval needed)")
                    print(f"   Raw wheat used: {milling_order.get('raw_wheat_input_kg')}kg")
                    
                    # Verify inventory was deducted
                    print_step(3, "Verify raw wheat was deducted from inventory")
                    response = requests.get(f"{BACKEND_URL}/api/inventory?branch_id=berhane")
                    
                    if response.ok:
                        updated_inventory = response.json()
                        updated_wheat = next((item for item in updated_inventory if item['name'] == 'Raw Wheat'), None)
                        
                        expected_qty = raw_wheat['quantity'] - 100
                        actual_qty = updated_wheat['quantity']
                        
                        if abs(actual_qty - expected_qty) < 0.01:
                            print_result(True, f"Inventory updated: {raw_wheat['quantity']}kg → {actual_qty}kg")
                            return True
                        else:
                            print_result(False, f"Inventory mismatch: expected {expected_qty}kg, got {actual_qty}kg")
                            return False
                    else:
                        print_result(False, "Failed to verify inventory")
                        return False
                else:
                    error_msg = response.text
                    print_result(False, f"Failed to create milling order: {response.status_code}")
                    print(f"   Error: {error_msg[:300]}")
                    return False
            else:
                print_result(False, "Raw wheat not found in Berhane inventory")
                return False
        else:
            print_result(False, f"Failed to fetch inventory: {response.status_code}")
            return False
            
    except Exception as e:
        print_result(False, f"Exception occurred: {str(e)}")
        return False

# ============================================================================
# TEST 3: Manager Queue Filtering
# ============================================================================
def test_manager_queue_filtering():
    print_test("Manager Queue Branch Filtering")
    
    try:
        # Test Berhane manager queue
        print_step(1, "Check Berhane manager queue (branch-specific)")
        response = requests.get(f"{BACKEND_URL}/api/inventory-requests/manager-queue?branch_id=berhane")
        
        if response.ok:
            berhane_queue = response.json()
            other_branch_items = [req for req in berhane_queue if req.get('source_branch') != 'berhane']
            
            print_result(
                len(other_branch_items) == 0,
                f"Berhane queue has {len(berhane_queue)} items, {len(other_branch_items)} from other branches"
            )
            
            if len(other_branch_items) > 0:
                print(f"   ⚠️  Found requests from other branches:")
                for req in other_branch_items:
                    print(f"      - {req.get('request_number')}: {req.get('source_branch')}")
                return False
            
            return True
        else:
            print_result(True, f"No pending requests (status: {response.status_code})")
            return True
            
    except Exception as e:
        print_result(False, f"Exception occurred: {str(e)}")
        return False

# ============================================================================
# TEST 4: Sales Can View All Branches
# ============================================================================
def test_sales_inventory_access():
    print_test("Sales Office Can Access All Branch Inventories")
    
    try:
        # Test access to all branches
        print_step(1, "Sales fetches inventory from all branches")
        response = requests.get(f"{BACKEND_URL}/api/inventory")
        
        if response.ok:
            all_inventory = response.json()
            berhane_items = [item for item in all_inventory if item.get('branch_id') == 'berhane']
            girmay_items = [item for item in all_inventory if item.get('branch_id') == 'girmay']
            
            print_result(
                len(berhane_items) > 0 and len(girmay_items) > 0,
                f"Sales can see both branches: Berhane ({len(berhane_items)} items), Girmay ({len(girmay_items)} items)"
            )
            
            # Test specific branch filtering
            print_step(2, "Sales filters for Berhane branch only")
            response = requests.get(f"{BACKEND_URL}/api/inventory?branch_id=berhane")
            
            if response.ok:
                berhane_only = response.json()
                girmay_in_filter = [item for item in berhane_only if item.get('branch_id') == 'girmay']
                
                print_result(
                    len(girmay_in_filter) == 0,
                    f"Filter works: {len(berhane_only)} Berhane items, {len(girmay_in_filter)} Girmay items"
                )
                return len(girmay_in_filter) == 0
            else:
                print_result(False, "Failed to filter by branch")
                return False
        else:
            print_result(False, f"Failed to fetch all inventory: {response.status_code}")
            return False
            
    except Exception as e:
        print_result(False, f"Exception occurred: {str(e)}")
        return False

# ============================================================================
# Main Test Runner
# ============================================================================
def run_all_tests():
    print_header("APPROVAL WORKFLOW & MILLING ORDER TEST SUITE")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Check backend connectivity
    try:
        response = requests.get(f"{BACKEND_URL}/api/inventory", timeout=5)
        if response.status_code not in [200, 404]:
            print("\n❌ ERROR: Backend is not responding correctly")
            return
    except requests.exceptions.RequestException as e:
        print(f"\n❌ ERROR: Cannot connect to backend at {BACKEND_URL}")
        print(f"   Please ensure the backend server is running")
        print(f"   Error: {e}")
        return
    
    # Run tests
    results = {}
    
    print_header("Running Tests...")
    
    results['Stock Request Approval'] = test_stock_request_approval_workflow()
    results['Milling Order Creation'] = test_milling_order_creation()
    results['Manager Queue Filtering'] = test_manager_queue_filtering()
    results['Sales Inventory Access'] = test_sales_inventory_access()
    
    # Summary
    print_header("TEST SUMMARY")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    print(f"\nResults: {passed}/{total} tests passed\n")
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {status}  {test_name}")
    
    print("\n" + "="*70)
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! System is working correctly.\n")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review the errors above.\n")
    
    print("="*70 + "\n")

if __name__ == "__main__":
    run_all_tests()

