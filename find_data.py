"""
Find which database actually has the purchase_requisitions data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = 'mongodb://localhost:27017'

async def find_data():
    print("\n" + "="*70)
    print("SEARCHING FOR PURCHASE REQUISITIONS DATA")
    print("="*70)
    
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        
        # Check all databases
        db_names = await client.list_database_names()
        
        print("\nChecking each database for purchase_requisitions...")
        print("-" * 70)
        
        found_db = None
        
        for db_name in db_names:
            db = client[db_name]
            collections = await db.list_collection_names()
            
            if 'purchase_requisitions' in collections:
                count = await db.purchase_requisitions.count_documents({})
                print(f"\n[FOUND] {db_name}:")
                print(f"  - purchase_requisitions: {count} documents")
                
                # Count by status
                statuses = await db.purchase_requisitions.distinct("status")
                print(f"  - Statuses:")
                for status in statuses:
                    status_count = await db.purchase_requisitions.count_documents({"status": status})
                    print(f"      {status}: {status_count}")
                
                found_db = db_name
        
        if found_db:
            print("\n" + "="*70)
            print(f"DATA IS IN: {found_db}")
            print("="*70)
            print(f"\nYou need to use: db_name = '{found_db}'")
        else:
            print("\n[NOT FOUND] No purchase_requisitions collection in any database")
        
        client.close()
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(find_data())
    print("\nDone!\n")

