"""
Simple script to verify the purchase request fix
"""
import requests
import json

BACKEND_URL = "http://localhost:8000"

print("\n" + "="*70)
print("VERIFYING PURCHASE REQUEST FIX")
print("="*70)

try:
    # Get all purchase requisitions
    response = requests.get(f"{BACKEND_URL}/api/purchase-requisitions")
    
    if not response.ok:
        print(f"Error: Cannot fetch requests (status {response.status_code})")
        exit(1)
    
    all_reqs = response.json()
    
    # Count by status
    status_counts = {}
    for req in all_reqs:
        status = req.get('status', 'unknown')
        status_counts[status] = status_counts.get(status, 0) + 1
    
    print(f"\nTotal Requests: {len(all_reqs)}")
    print("\nStatus Distribution:")
    print("-" * 70)
    
    for status, count in sorted(status_counts.items()):
        print(f"  {status}: {count}")
    
    # Check the new statuses
    print("\n" + "="*70)
    print("CORRECTED FLOW STATUS:")
    print("="*70)
    
    admin_pending = status_counts.get('pending_admin_approval', 0)
    owner_pending = status_counts.get('pending_owner_approval', 0)
    old_pending = status_counts.get('pending', 0)
    
    print(f"\n[OK] Admin Queue (pending_admin_approval): {admin_pending}")
    print(f"[OK] Owner Queue (pending_owner_approval): {owner_pending}")
    print(f"[!!] Old Status (pending - should be 0): {old_pending}")
    
    if old_pending > 0:
        print(f"\n[WARNING] Still have {old_pending} requests with old 'pending' status")
        print("These need to be fixed!")
    else:
        print("\n[SUCCESS] All requests are using the correct flow!")
    
    # Show approved counts
    admin_approved = status_counts.get('admin_approved', 0)
    owner_approved = status_counts.get('owner_approved', 0)
    completed = status_counts.get('completed', 0)
    rejected = status_counts.get('rejected', 0)
    
    print(f"\n[INFO] Admin Approved (waiting for Finance): {admin_approved}")
    print(f"[INFO] Owner Approved (waiting for Finance): {owner_approved}")
    print(f"[INFO] Completed: {completed}")
    print(f"[INFO] Rejected: {rejected}")
    
    # Show details of pending requests
    if admin_pending > 0:
        print(f"\n" + "="*70)
        print(f"ADMIN QUEUE ({admin_pending} requests):")
        print("="*70)
        for req in all_reqs:
            if req.get('status') == 'pending_admin_approval':
                print(f"  - {req.get('request_number')}: {req.get('description')} (Br {req.get('estimated_cost', 0):,.2f})")
    
    if owner_pending > 0:
        print(f"\n" + "="*70)
        print(f"OWNER QUEUE ({owner_pending} requests):")
        print("="*70)
        for req in all_reqs:
            if req.get('status') == 'pending_owner_approval':
                print(f"  - {req.get('request_number')}: {req.get('description')} (Br {req.get('estimated_cost', 0):,.2f})")
    
    print("\n" + "="*70)
    print("VERIFICATION COMPLETE")
    print("="*70 + "\n")
    
except Exception as e:
    print(f"\nError: {e}")
    print("Make sure backend is running on http://localhost:8000\n")

