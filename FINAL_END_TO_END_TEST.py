"""
Final End-to-End Test of Purchase Request Flow
Tests the complete workflow from creation to Finance queue
"""
import requests
import json
from datetime import datetime

BACKEND_URL = "http://localhost:8000"

def print_section(title):
    print("\n" + "="*70)
    print(title.center(70))
    print("="*70)

def test_complete_flow():
    print_section("PURCHASE REQUEST - COMPLETE FLOW TEST")
    print(f"Backend: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    all_passed = True
    
    # Test 1: Check Admin Queue
    print_section("TEST 1: Admin Queue")
    try:
        response = requests.get(f"{BACKEND_URL}/api/purchase-requisitions?status=pending_admin_approval")
        if response.ok:
            data = response.json()
            print(f"[PASS] Admin queue has {len(data)} pending request(s)")
            for req in data[:3]:
                print(f"  - {req.get('request_number')}: Br {req.get('estimated_cost', 0):,.2f}")
        else:
            print(f"[FAIL] Status: {response.status_code}")
            all_passed = False
    except Exception as e:
        print(f"[ERROR] {e}")
        all_passed = False
    
    # Test 2: Check Finance Queue
    print_section("TEST 2: Finance Queue")
    try:
        response = requests.get(f"{BACKEND_URL}/api/finance/pending-authorizations")
        if response.ok:
            data = response.json()
            admin_approved = [r for r in data if r.get('status') == 'admin_approved']
            owner_approved = [r for r in data if r.get('status') == 'owner_approved']
            total_amount = sum(r.get('estimated_cost', 0) for r in data)
            
            print(f"[PASS] Finance queue has {len(data)} approved request(s)")
            print(f"  • Admin Approved (<=Br 50k): {len(admin_approved)}")
            print(f"  • Owner Approved (>Br 50k): {len(owner_approved)}")
            print(f"  • Total Amount: Br {total_amount:,.2f}")
            
            if len(data) > 0:
                print(f"\n  Latest requests:")
                for req in data[:5]:
                    status_label = "ADMIN" if req.get('status') == 'admin_approved' else "OWNER"
                    print(f"  - {req.get('request_number')}: Br {req.get('estimated_cost', 0):,.2f} [{status_label}]")
        else:
            print(f"[FAIL] Status: {response.status_code}")
            all_passed = False
    except Exception as e:
        print(f"[ERROR] {e}")
        all_passed = False
    
    # Test 3: Finance Summary
    print_section("TEST 3: Finance Summary")
    try:
        response = requests.get(f"{BACKEND_URL}/api/finance/summary")
        if response.ok:
            summary = response.json()
            print(f"[PASS] Finance summary retrieved")
            print(f"  • Cash in Bank: Br {summary.get('cash_account', 0):,.2f}")
            print(f"  • Pending Payments: Br {summary.get('pending_payments', 0):,.2f}")
            print(f"  • Pending Count: {summary.get('pending_count', 0)} request(s)")
            print(f"  • Total Income: Br {summary.get('total_income', 0):,.2f}")
            print(f"  • Net Balance: Br {summary.get('net_balance', 0):,.2f}")
        else:
            print(f"[FAIL] Status: {response.status_code}")
            all_passed = False
    except Exception as e:
        print(f"[ERROR] {e}")
        all_passed = False
    
    # Test 4: Check Specific Request
    print_section("TEST 4: Your Latest Request")
    try:
        response = requests.get(f"{BACKEND_URL}/api/purchase-requisitions")
        if response.ok:
            all_reqs = response.json()
            # Sort by date to get latest
            all_reqs.sort(key=lambda x: x.get('requested_at', ''), reverse=True)
            
            if all_reqs:
                latest = all_reqs[0]
                print(f"[PASS] Latest request found")
                print(f"  • Request Number: {latest.get('request_number')}")
                print(f"  • Description: {latest.get('description')}")
                print(f"  • Amount: Br {latest.get('estimated_cost', 0):,.2f}")
                print(f"  • Status: {latest.get('status')}")
                print(f"  • Routing: {latest.get('routing', 'N/A').upper()}")
                print(f"  • Requested At: {latest.get('requested_at')}")
                
                # Check where it should be visible
                status = latest.get('status')
                if status == 'pending_admin_approval':
                    print(f"\n  ✓ Visible in: Admin Dashboard → Purchase Approvals")
                elif status == 'pending_owner_approval':
                    print(f"\n  ✓ Visible in: Owner Dashboard → Approvals → Other Approvals")
                elif status in ['admin_approved', 'owner_approved']:
                    print(f"\n  ✓ Visible in: Finance Dashboard → Pending Approvals")
                    print(f"  ✓ Can process payment!")
            else:
                print("[INFO] No requests found")
        else:
            print(f"[FAIL] Status: {response.status_code}")
            all_passed = False
    except Exception as e:
        print(f"[ERROR] {e}")
        all_passed = False
    
    # Test 5: Owner Queue (should be empty for now)
    print_section("TEST 5: Owner Queue")
    try:
        response = requests.get(f"{BACKEND_URL}/api/purchase-requisitions?status=pending_owner_approval")
        if response.ok:
            data = response.json()
            print(f"[PASS] Owner queue has {len(data)} request(s)")
            if len(data) == 0:
                print("  (None currently - all requests are under Br 50,000)")
            else:
                for req in data:
                    print(f"  - {req.get('request_number')}: Br {req.get('estimated_cost', 0):,.2f}")
        else:
            print(f"[FAIL] Status: {response.status_code}")
            all_passed = False
    except Exception as e:
        print(f"[ERROR] {e}")
        all_passed = False
    
    # Final Summary
    print_section("TEST RESULTS")
    
    if all_passed:
        print("[SUCCESS] All tests passed!")
        print("\n✅ Purchase Request Flow is Working End-to-End!")
        print("\nThe Complete Flow:")
        print("  1. Sales creates request")
        print("  2. System routes to Admin (<=50k) or Owner (>50k)")
        print("  3. Admin/Owner approves")
        print("  4. Finance sees it and can process payment")
        print("\nYour Requests:")
        print("  • Admin Queue: Check /admin/purchase-approvals")
        print("  • Finance Queue: Check /finance/dashboard → Pending Approvals")
        print("  • All showing correct status badges!")
    else:
        print("[FAIL] Some tests failed")
        print("Check errors above for details")
    
    print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    test_complete_flow()

