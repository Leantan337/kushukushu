"""
Force fix all pending purchase requests
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URL = 'mongodb://localhost:27017'
DB_NAME = 'kushukushu_erp'
ADMIN_THRESHOLD = 50000

async def force_fix():
    print("\n" + "="*70)
    print("FORCE FIXING PURCHASE REQUESTS")
    print("="*70)
    
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        print(f"\nConnected to: {MONGO_URL}/{DB_NAME}")
        
        # Find ALL "pending" requests
        pending_reqs = await db.purchase_requisitions.find(
            {"status": "pending"}
        ).to_list(100)
        
        print(f"Found {len(pending_reqs)} requests with status 'pending'")
        
        if len(pending_reqs) == 0:
            print("No requests to fix!")
            return
        
        print("\nFixing each request...")
        print("-" * 70)
        
        fixed_count = 0
        
        for req in pending_reqs:
            req_id = req.get('id')
            req_num = req.get('request_number', 'unknown')
            amount = req.get('estimated_cost', 0)
            
            # Determine new status based on amount
            if amount <= ADMIN_THRESHOLD:
                new_status = "pending_admin_approval"
                routing = "admin"
            else:
                new_status = "pending_owner_approval"
                routing = "owner"
            
            print(f"  Fixing {req_num} (Br {amount:,.2f}) -> {new_status}")
            
            # Update the request
            result = await db.purchase_requisitions.update_one(
                {"id": req_id},
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
                fixed_count += 1
                print(f"    [OK] Fixed!")
            else:
                print(f"    [WARN] Not modified")
        
        print("\n" + "="*70)
        print(f"FIXED {fixed_count} REQUESTS")
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
        
        print(f"\nVerification:")
        print(f"  Admin Queue: {admin_count}")
        print(f"  Owner Queue: {owner_count}")
        print(f"  Still Pending (should be 0): {still_pending}")
        
        if still_pending == 0:
            print("\n[SUCCESS] All requests fixed!")
        else:
            print(f"\n[ERROR] Still have {still_pending} unfixed requests")
        
        client.close()
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(force_fix())
    print("\nDone!\n")

