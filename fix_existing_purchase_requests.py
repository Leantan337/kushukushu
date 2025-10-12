"""
Script to fix existing purchase requests to use the correct flow
- Removes manager approval requirement
- Routes based on amount (admin threshold = Br 50,000)
"""
import requests
import json

BACKEND_URL = "http://localhost:8000"
ADMIN_THRESHOLD = 50000

def main():
    print("\n" + "="*70)
    print("🔧 FIXING EXISTING PURCHASE REQUESTS")
    print("="*70)
    
    try:
        # Fetch all purchase requisitions
        response = requests.get(f"{BACKEND_URL}/api/purchase-requisitions")
        
        if not response.ok:
            print(f"❌ Failed to fetch purchase requisitions: {response.status_code}")
            return
        
        all_reqs = response.json()
        
        if not all_reqs:
            print("\n📭 No purchase requests found.")
            return
        
        print(f"\n📊 Found {len(all_reqs)} purchase request(s)")
        print(f"📍 Admin Threshold: Br {ADMIN_THRESHOLD:,.2f}\n")
        
        # Count by current status
        status_counts = {}
        for req in all_reqs:
            status = req.get('status', 'unknown')
            status_counts[status] = status_counts.get(status, 0) + 1
        
        print("Current Status Distribution:")
        print("-" * 70)
        for status, count in status_counts.items():
            print(f"  {status}: {count}")
        print()
        
        # Find requests that need fixing
        needs_fixing = []
        for req in all_reqs:
            status = req.get('status', '')
            estimated_cost = req.get('estimated_cost', 0)
            
            # Fix requests with old statuses
            if status in ['pending', 'manager_approved']:
                needs_fixing.append({
                    'id': req['id'],
                    'request_number': req.get('request_number'),
                    'current_status': status,
                    'amount': estimated_cost,
                    'new_status': 'pending_admin_approval' if estimated_cost <= ADMIN_THRESHOLD else 'pending_owner_approval',
                    'routing': 'admin' if estimated_cost <= ADMIN_THRESHOLD else 'owner'
                })
        
        if not needs_fixing:
            print("✅ All purchase requests are using the correct flow!")
            print("   No fixes needed.\n")
            return
        
        print(f"🔧 Found {len(needs_fixing)} request(s) that need fixing:\n")
        
        for req in needs_fixing:
            print(f"  • {req['request_number']}")
            print(f"    Current: {req['current_status']}")
            print(f"    Amount: Br {req['amount']:,.2f}")
            print(f"    Will change to: {req['new_status']} (Route to {req['routing'].upper()})")
            print()
        
        # Ask for confirmation
        confirm = input("Do you want to fix these requests? (yes/no): ").strip().lower()
        
        if confirm not in ['yes', 'y']:
            print("\n❌ Fix cancelled.")
            return
        
        print("\n" + "="*70)
        print("🔄 APPLYING FIXES...")
        print("="*70 + "\n")
        
        # Note: Direct MongoDB update would be needed here
        # For now, just show what would be done
        print("⚠️  Direct MongoDB update required:")
        print()
        print("Run this in MongoDB shell or Compass:")
        print()
        
        for req in needs_fixing:
            print(f"// Fix {req['request_number']}")
            print(f"db.purchase_requisitions.updateOne(")
            print(f"  {{ id: \"{req['id']}\" }},")
            print(f"  {{")
            print(f"    $set: {{")
            print(f"      status: \"{req['new_status']}\",")
            print(f"      routing: \"{req['routing']}\",")
            print(f"      admin_threshold: {ADMIN_THRESHOLD}")
            print(f"    }},")
            print(f"    $unset: {{")
            print(f"      manager_approved_at: \"\",")
            print(f"      manager_approved_by: \"\",")
            print(f"      manager_notes: \"\"")
            print(f"    }}")
            print(f"  }}")
            print(f");")
            print()
        
        print("="*70)
        print("✅ Instructions provided above")
        print("   Copy and paste into MongoDB shell to apply fixes")
        print("="*70 + "\n")
        
        # Also provide Python Motor code
        print("\nOr use this Python code with Motor:")
        print("-" * 70)
        print("""
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def fix_requests():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['kushukushu_erp']
    
    fixes = """)
        print(json.dumps(needs_fixing, indent=4))
        print("""
    
    for req in fixes:
        result = await db.purchase_requisitions.update_one(
            {"id": req['id']},
            {
                "$set": {
                    "status": req['new_status'],
                    "routing": req['routing'],
                    "admin_threshold": """ + str(ADMIN_THRESHOLD) + """
                },
                "$unset": {
                    "manager_approved_at": "",
                    "manager_approved_by": "",
                    "manager_notes": ""
                }
            }
        )
        print(f"✅ Fixed {req['request_number']}")
    
    print(f"\\n✅ Fixed {len(fixes)} requests")

asyncio.run(fix_requests())
        """)
        
    except requests.exceptions.ConnectionError:
        print(f"\n❌ Cannot connect to backend at {BACKEND_URL}")
        print("   Make sure the backend server is running.")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()


