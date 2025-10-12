"""
Debug script to check MongoDB connection and collections
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = 'mongodb://localhost:27017'

async def debug():
    print("\n" + "="*70)
    print("DEBUGGING MONGODB CONNECTION")
    print("="*70)
    
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        
        # List databases
        print("\nDatabases:")
        dbs = await client.list_database_names()
        for db_name in dbs:
            print(f"  - {db_name}")
        
        # Check kushukushu_erp
        db = client['kushukushu_erp']
        print("\nCollections in 'kushukushu_erp':")
        collections = await db.list_collection_names()
        for coll_name in collections:
            count = await db[coll_name].count_documents({})
            print(f"  - {coll_name}: {count} documents")
        
        # Check purchase_requisitions specifically
        if 'purchase_requisitions' in collections:
            print("\nPurchase Requisitions Status Breakdown:")
            statuses = await db.purchase_requisitions.distinct("status")
            for status in statuses:
                count = await db.purchase_requisitions.count_documents({"status": status})
                print(f"  - {status}: {count}")
            
            # Try to get one pending request
            pending_req = await db.purchase_requisitions.find_one({"status": "pending"})
            if pending_req:
                print("\nSample pending request:")
                print(f"  ID: {pending_req.get('id')}")
                print(f"  Number: {pending_req.get('request_number')}")
                print(f"  Status: {pending_req.get('status')}")
                print(f"  Amount: {pending_req.get('estimated_cost')}")
            else:
                print("\nNo pending requests found in MongoDB")
        
        client.close()
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug())
    print("\nDone!\n")

