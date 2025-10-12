"""
Fix purchase requests in the CORRECT database (test_database)
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URL = 'mongodb://localhost:27017'
DB_NAME = 'test_database'  # THIS IS THE CORRECT DATABASE!
ADMIN_THRESHOLD = 50000

async def fix_requests():
    print("\n" + "="*70)
    print(f"FIXING PURCHASE REQUESTS IN: {DB_NAME}")
    print("="*70)
    
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Get all pending requests
        pending_reqs = await db.purchase_requisitions.find(
            {"status": "pending"}
        ).to_list(100)
        
        print(f"\nFound {len(pending_reqs)} pending requests")
        
        if len(pending_reqs) == 0:
            print("Nothing to fix!")
            return
        
        print("\nFixing each request...")
        print("-" * 70)
        
        for req in pending_reqs:
            req_num = req.get('request_number', 'unknown')
            amount = req.get('estimated_cost', 0)
            
            # Determine routing
            if amount <= ADMIN_THRESHOLD:
                new_status = "pending_admin_approval"
                routing = "admin"
            else:
                new_status = "pending_owner_approval"
                routing = "owner"
            
            print(f"  {req_num} (Br {amount:,.2f}) -> {new_status}")
            
            # Update
            await db.purchase_requisitions.update_one(
                {"id": req.get('id')},
                {
                    "$set": {
                        "status": new_status,
                        "routing": routing,
                        "admin_threshold": ADMIN_THRESHOLD
                    },
                    "$unset": {
                        "manager_approved_at": "",
                        "manager_approved_by": "",
                        "manager_notes": ""
                    }
                }
            )
        
        print("\n" + "="*70)
        print("FIX APPLIED!")
        print("="*70)
        
        # Verify
        admin_count = await db.purchase_requisitions.count_documents(
            {"status": "pending_admin_approval"}
        )
        owner_count = await db.purchase_requisitions.count_documents(
            {"status": "pending_owner_approval"}
        )
        still_pending = await db.purchase_requisitions.count_documents(
            {"status": "pending"}
        )
        
        print(f"\nResults:")
        print(f"  Admin Queue: {admin_count}")
        print(f"  Owner Queue: {owner_count}")
        print(f"  Still Pending: {still_pending}")
        
        if still_pending == 0:
            print("\n[SUCCESS] All {len(pending_reqs)} requests fixed!")
        
        client.close()
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(fix_requests())
    print("\nDone!\n")

