"""
Quick script to find and show your purchase request
"""
import requests
import json
from datetime import datetime

BACKEND_URL = "http://localhost:8000"

def main():
    print("\n" + "="*70)
    print("🔍 PURCHASE REQUEST CHECKER")
    print("="*70)
    
    try:
        # Fetch all purchase requisitions
        response = requests.get(f"{BACKEND_URL}/api/purchase-requisitions")
        
        if not response.ok:
            print(f"❌ Failed to fetch purchase requisitions: {response.status_code}")
            print(f"   Make sure backend is running on {BACKEND_URL}")
            return
        
        all_reqs = response.json()
        
        if not all_reqs:
            print("\n📭 No purchase requests found in the system.")
            print("\nTo create one, use:")
            print("  - Sales Dashboard → Purchase Request tab")
            print("  - Or POST to /api/purchase-requests")
            return
        
        # Sort by date (newest first)
        all_reqs.sort(key=lambda x: x.get('requested_at', ''), reverse=True)
        
        print(f"\n📊 Found {len(all_reqs)} purchase request(s) in total\n")
        
        # Group by status
        by_status = {}
        for req in all_reqs:
            status = req.get('status', 'unknown')
            if status not in by_status:
                by_status[status] = []
            by_status[status].append(req)
        
        # Show counts by status
        print("Status Distribution:")
        print("-" * 70)
        for status, reqs in by_status.items():
            count = len(reqs)
            icon = {
                'pending': '⏳',
                'manager_approved': '✅',
                'admin_approved': '✅✅',
                'owner_approved': '✅✅✅',
                'completed': '🎉',
                'rejected': '❌'
            }.get(status, '❓')
            
            visibility = {
                'pending': 'Visible to: MANAGER',
                'manager_approved': 'Visible to: ADMIN',
                'admin_approved': 'Visible to: OWNER (in Approvals screen)',
                'owner_approved': 'Visible to: FINANCE (for payment)',
                'completed': 'Visible to: ALL (history)',
                'rejected': 'Visible to: ALL (history)'
            }.get(status, 'Unknown visibility')
            
            print(f"{icon} {status.upper()}: {count} request(s)")
            print(f"   {visibility}")
            print()
        
        # Show recent requests
        print("\n" + "="*70)
        print("📝 YOUR MOST RECENT PURCHASE REQUESTS")
        print("="*70)
        
        for i, req in enumerate(all_reqs[:5], 1):  # Show top 5
            print(f"\n{i}. {req.get('request_number', 'N/A')}")
            print(f"   Status: {req.get('status', 'unknown').upper()}")
            print(f"   Description: {req.get('description', 'N/A')}")
            print(f"   Item: {req.get('item_name', 'N/A')}")
            print(f"   Amount: Br {req.get('estimated_cost', 0):,.2f}")
            print(f"   Requested by: {req.get('requested_by', 'Unknown')}")
            print(f"   Requested at: {req.get('requested_at', 'N/A')}")
            
            # Show who can see it
            status = req.get('status', 'unknown')
            if status == 'pending':
                print(f"   👉 NEXT STEP: Manager needs to approve")
                print(f"   📍 Manager should look in: Manager Dashboard → Purchase Requisitions")
            elif status == 'manager_approved':
                print(f"   👉 NEXT STEP: Admin needs to approve")
                print(f"   📍 Admin should look in: Admin Dashboard → Purchase Requisitions")
            elif status == 'admin_approved':
                print(f"   👉 NEXT STEP: Owner needs to approve")
                print(f"   📍 Owner can see it in: Owner Dashboard → Approvals → Other Approvals tab")
                print(f"   🌐 URL: http://localhost:3000/approvals (Other Approvals tab)")
            elif status == 'owner_approved':
                print(f"   👉 NEXT STEP: Finance needs to process payment")
                print(f"   📍 Finance should see it in: Finance Dashboard → Pending Authorizations")
            elif status == 'completed':
                print(f"   ✅ COMPLETED - No further action needed")
            elif status == 'rejected':
                print(f"   ❌ REJECTED")
                if req.get('rejected_by'):
                    print(f"   Rejected by: {req.get('rejected_by')}")
                if req.get('rejection_reason'):
                    print(f"   Reason: {req.get('rejection_reason')}")
        
        # Show the approval workflow
        print("\n\n" + "="*70)
        print("📋 APPROVAL WORKFLOW")
        print("="*70)
        print("""
Step 1: CREATE → Status: "pending"
        ↓ Manager approves
Step 2: MANAGER APPROVED → Status: "manager_approved"
        ↓ Admin approves
Step 3: ADMIN APPROVED → Status: "admin_approved"
        ↓ Owner approves
Step 4: OWNER APPROVED → Status: "owner_approved"
        ↓ Finance processes payment
Step 5: COMPLETED → Status: "completed"

At any stage, request can be REJECTED → Status: "rejected"
        """)
        
        # API endpoints for testing
        print("="*70)
        print("🔧 USEFUL API ENDPOINTS")
        print("="*70)
        print(f"""
# View all purchase requests:
curl {BACKEND_URL}/api/purchase-requisitions

# Filter by status:
curl "{BACKEND_URL}/api/purchase-requisitions?status=pending"
curl "{BACKEND_URL}/api/purchase-requisitions?status=admin_approved"

# Approve a request (replace {{request-id}}):
curl -X PUT {BACKEND_URL}/api/purchase-requisitions/{{request-id}}/approve-manager \\
  -H "Content-Type: application/json" \\
  -d '{{"approved_by": "Manager", "notes": "Approved"}}'
        """)
        
    except requests.exceptions.ConnectionError:
        print(f"\n❌ Cannot connect to backend at {BACKEND_URL}")
        print("   Make sure the backend server is running:")
        print("   cd backend && python server.py")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
    print("\n" + "="*70 + "\n")


