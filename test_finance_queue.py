"""
Test what Finance can see in their queue
"""
import requests
import json

BACKEND_URL = "http://localhost:8000"

print("\n" + "="*70)
print("FINANCE QUEUE - PENDING AUTHORIZATIONS")
print("="*70)

try:
    # Test the finance endpoint
    response = requests.get(f"{BACKEND_URL}/api/finance/pending-authorizations")
    
    if response.ok:
        data = response.json()
        
        print(f"\nTotal in Finance Queue: {len(data)} request(s)")
        
        if len(data) == 0:
            print("\n[EMPTY] No purchase requests waiting for Finance payment")
            print("\nThis means:")
            print("  - No admin_approved requests")
            print("  - No owner_approved requests")
        else:
            # Group by status
            admin_approved = [r for r in data if r.get('status') == 'admin_approved']
            owner_approved = [r for r in data if r.get('status') == 'owner_approved']
            
            print("\nBreakdown:")
            print(f"  Admin Approved (<=Br 50k): {len(admin_approved)}")
            print(f"  Owner Approved (>Br 50k): {len(owner_approved)}")
            
            # Calculate totals
            total_amount = sum(r.get('estimated_cost', 0) for r in data)
            print(f"\nTotal Amount Pending: Br {total_amount:,.2f}")
            
            # Show each request
            print("\n" + "-"*70)
            print("REQUESTS AWAITING PAYMENT:")
            print("-"*70)
            
            for i, req in enumerate(data, 1):
                print(f"\n{i}. {req.get('request_number')}")
                print(f"   Status: {req.get('status').upper()}")
                print(f"   Description: {req.get('description')}")
                print(f"   Item: {req.get('item_name')}")
                print(f"   Amount: Br {req.get('estimated_cost', 0):,.2f}")
                print(f"   Requested by: {req.get('requested_by')}")
                print(f"   Approved by: {req.get('admin_approved_by') or req.get('owner_approved_by', 'N/A')}")
                if req.get('routing'):
                    print(f"   Routing: {req.get('routing').upper()}")
    else:
        print(f"\n[ERROR] Failed to fetch: {response.status_code}")
        print(f"Response: {response.text}")

    # Also check the summary
    print("\n" + "="*70)
    print("FINANCE SUMMARY")
    print("="*70)
    
    summary_response = requests.get(f"{BACKEND_URL}/api/finance/summary")
    if summary_response.ok:
        summary = summary_response.json()
        print(f"\nPending Payments: Br {summary.get('pending_payments', 0):,.2f}")
        print(f"Pending Count: {summary.get('pending_count', 0)} request(s)")
        print(f"Cash in Bank: Br {summary.get('cash_account', 0):,.2f}")
        print(f"Total Income: Br {summary.get('total_income', 0):,.2f}")
    
except requests.exceptions.ConnectionError:
    print(f"\n[ERROR] Cannot connect to {BACKEND_URL}")
    print("Make sure backend is running!")
except Exception as e:
    print(f"\n[ERROR] {e}")

print("\n" + "="*70 + "\n")

