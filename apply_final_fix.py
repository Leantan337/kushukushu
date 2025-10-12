"""
Final Fix: Update existing purchase requests to use correct flow
- Changes status from "pending" to "pending_admin_approval" or "pending_owner_approval"
- Routes based on amount (admin threshold = Br 50,000)
- Removes manager approval fields
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URL = 'mongodb://localhost:27017'
DB_NAME = 'kushukushu_erp'
ADMIN_THRESHOLD = 50000

async def fix_purchase_requests():
    print("\n" + "="*70)
    print("APPLYING FINAL FIX TO PURCHASE REQUESTS")
    print("="*70)
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        print(f"\nConnected to MongoDB: {MONGO_URL}/{DB_NAME}")
        
        # Get all pending requests
        pending_requests = await db.purchase_requisitions.find(
            {"status": "pending"}
        ).to_list(100)
        
        if not pending_requests:
            print("\nNo pending requests to fix!")
            print("   All requests are already using the correct flow.\n")
            return
        
        print(f"\nFound {len(pending_requests)} request(s) with status 'pending'")
        print("\nRequests to be fixed:")
        print("-" * 70)
        
        admin_route_count = 0
        owner_route_count = 0
        
        for req in pending_requests:
            amount = req.get('estimated_cost', 0)
            new_status = "pending_admin_approval" if amount <= ADMIN_THRESHOLD else "pending_owner_approval"
            routing = "admin" if amount <= ADMIN_THRESHOLD else "owner"
            
            print(f"  • {req.get('request_number')} (Br {amount:,.2f})")
            print(f"    → {new_status} (Route to {routing.upper()})")
            
            if routing == "admin":
                admin_route_count += 1
            else:
                owner_route_count += 1
        
        print(f"\nSummary:")
        print(f"  • {admin_route_count} will go to ADMIN")
        print(f"  • {owner_route_count} will go to OWNER")
        print()
        
        # Apply the fix
        print("Applying fix...")
        
        # Update requests based on amount
        for req in pending_requests:
            amount = req.get('estimated_cost', 0)
            new_status = "pending_admin_approval" if amount <= ADMIN_THRESHOLD else "pending_owner_approval"
            routing = "admin" if amount <= ADMIN_THRESHOLD else "owner"
            
            result = await db.purchase_requisitions.update_one(
                {"id": req['id']},
                {
                    "$set": {
                        "status": new_status,
                        "routing": routing,
                        "admin_threshold": ADMIN_THRESHOLD,
                        "updated_at": datetime.utcnow().isoformat()
                    },
                    "$unset": {
                        "manager_approved_at": "",
                        "manager_approved_by": "",
                        "manager_notes": ""
                    }
                }
            )
            
            if result.modified_count > 0:
                print(f"  [OK] Fixed {req.get('request_number')}")
        
        print("\n" + "="*70)
        print("FIX APPLIED SUCCESSFULLY!")
        print("="*70)
        
        # Verify the fix
        print("\nVerification:")
        print("-" * 70)
        
        admin_count = await db.purchase_requisitions.count_documents(
            {"status": "pending_admin_approval"}
        )
        owner_count = await db.purchase_requisitions.count_documents(
            {"status": "pending_owner_approval"}
        )
        pending_count = await db.purchase_requisitions.count_documents(
            {"status": "pending"}
        )
        
        print(f"  • Admin queue (pending_admin_approval): {admin_count}")
        print(f"  • Owner queue (pending_owner_approval): {owner_count}")
        print(f"  • Old pending status (should be 0): {pending_count}")
        
        if pending_count == 0:
            print("\nPerfect! All requests are now using the correct flow.")
        else:
            print(f"\nStill have {pending_count} with old status. Re-run fix if needed.")
        
        print("\n" + "="*70)
        print("NEXT STEPS:")
        print("="*70)
        print("""
1. Check Admin Queue:
   curl "http://localhost:8000/api/purchase-requisitions?status=pending_admin_approval"

2. Check Owner Queue:
   curl "http://localhost:8000/api/purchase-requisitions?status=pending_owner_approval"

3. Admin can now approve their requests:
   curl -X PUT http://localhost:8000/api/purchase-requisitions/{id}/approve-admin \\
     -H "Content-Type: application/json" \\
     -d '{"approved_by": "Admin", "notes": "Approved"}'

4. After approval, Finance will see them:
   curl "http://localhost:8000/api/purchase-requisitions?status=admin_approved"
        """)
        
        client.close()
        
    except Exception as e:
        print(f"\nError: {e}")
        print("\nTroubleshooting:")
        print("  - Make sure MongoDB is running")
        print("  - Check connection string:", MONGO_URL)
        print("  - Check database name:", DB_NAME)
        raise

if __name__ == "__main__":
    print("\nStarting final fix...")
    asyncio.run(fix_purchase_requests())
    print("\nDone!\n")

