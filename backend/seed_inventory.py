import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_inventory():
    """Seed initial inventory items"""
    
    # Check if inventory already has data
    count = await db.inventory.count_documents({})
    if count > 0:
        print(f"Inventory already has {count} items. Skipping seed.")
        return
    
    print("Seeding inventory...")
    
    inventory_items = [
        {
            "id": str(uuid.uuid4()),
            "name": "Raw Wheat",
            "quantity": 12500.0,
            "unit": "kg",
            "stock_level": "ok",
            "low_threshold": 5000.0,
            "critical_threshold": 2000.0,
            "transactions": [
                {
                    "id": str(uuid.uuid4()),
                    "date": datetime(2025, 1, 15, 10, 30).isoformat(),
                    "type": "in",
                    "quantity": 1560.0,
                    "reference": "Purchase Order #245",
                    "performed_by": "Berhe Kidane"
                },
                {
                    "id": str(uuid.uuid4()),
                    "date": datetime(2025, 1, 14, 14, 20).isoformat(),
                    "type": "out",
                    "quantity": 800.0,
                    "reference": "Milling Order #58",
                    "performed_by": "System"
                }
            ],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "1st Quality Flour",
            "quantity": 3200.0,
            "unit": "kg",
            "stock_level": "low",
            "low_threshold": 5000.0,
            "critical_threshold": 2000.0,
            "transactions": [
                {
                    "id": str(uuid.uuid4()),
                    "date": datetime(2025, 1, 15, 9, 15).isoformat(),
                    "type": "in",
                    "quantity": 650.0,
                    "reference": "Milling Order #58",
                    "performed_by": "System"
                },
                {
                    "id": str(uuid.uuid4()),
                    "date": datetime(2025, 1, 14, 16, 45).isoformat(),
                    "type": "out",
                    "quantity": 500.0,
                    "reference": "Sales Request #101",
                    "performed_by": "Mekdes Alem"
                }
            ],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bread Flour",
            "quantity": 4800.0,
            "unit": "kg",
            "stock_level": "ok",
            "low_threshold": 4000.0,
            "critical_threshold": 1500.0,
            "transactions": [
                {
                    "id": str(uuid.uuid4()),
                    "date": datetime(2025, 1, 15, 11, 0).isoformat(),
                    "type": "in",
                    "quantity": 480.0,
                    "reference": "Milling Order #59",
                    "performed_by": "System"
                }
            ],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fruska",
            "quantity": 1800.0,
            "unit": "kg",
            "stock_level": "critical",
            "low_threshold": 3000.0,
            "critical_threshold": 2000.0,
            "transactions": [
                {
                    "id": str(uuid.uuid4()),
                    "date": datetime(2025, 1, 15, 11, 0).isoformat(),
                    "type": "in",
                    "quantity": 280.0,
                    "reference": "Milling Order #58",
                    "performed_by": "System"
                }
            ],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fruskelo",
            "quantity": 850.0,
            "unit": "kg",
            "stock_level": "ok",
            "low_threshold": 500.0,
            "critical_threshold": 200.0,
            "transactions": [
                {
                    "id": str(uuid.uuid4()),
                    "date": datetime(2025, 1, 15, 11, 0).isoformat(),
                    "type": "in",
                    "quantity": 120.0,
                    "reference": "Milling Order #58",
                    "performed_by": "System"
                }
            ],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.inventory.insert_many(inventory_items)
    print(f"✓ Seeded {len(inventory_items)} inventory items")
    
    # Seed some sample purchase requisitions
    purchase_reqs = [
        {
            "id": str(uuid.uuid4()),
            "request_number": "PR-00001",
            "description": "New Milling Equipment",
            "estimated_cost": 25000000.0,
            "reason": "Replacement of old machinery to increase production efficiency",
            "requested_by": "Yohannes Teklu",
            "requested_at": datetime(2025, 1, 15, 10, 30).isoformat(),
            "status": "pending",
            "manager_approval": None,
            "admin_approval": None,
            "owner_approval": None,
            "rejection_reason": None,
            "rejected_by": None,
            "rejected_at": None,
            "purchased_at": None
        },
        {
            "id": str(uuid.uuid4()),
            "request_number": "PR-00002",
            "description": "Office Supplies and Stationery",
            "estimated_cost": 15000.0,
            "reason": "Monthly office supplies replenishment",
            "requested_by": "Mekdes Alem",
            "requested_at": datetime(2025, 1, 14, 14, 20).isoformat(),
            "status": "manager_approved",
            "manager_approval": {
                "approved_by": "Yohannes Teklu",
                "approved_at": datetime(2025, 1, 15, 9, 0).isoformat(),
                "notes": "Approved for standard office supplies"
            },
            "admin_approval": None,
            "owner_approval": None,
            "rejection_reason": None,
            "rejected_by": None,
            "rejected_at": None,
            "purchased_at": None
        }
    ]
    
    await db.purchase_requisitions.insert_many(purchase_reqs)
    print(f"✓ Seeded {len(purchase_reqs)} purchase requisitions")
    
    # Seed some sample internal orders
    internal_orders = [
        {
            "id": str(uuid.uuid4()),
            "request_number": "IO-00001",
            "product_name": "1st Quality Flour",
            "package_size": "50kg",
            "quantity": 20,
            "total_weight": 1000.0,
            "requested_by": "Mekdes Alem",
            "requested_at": datetime(2025, 1, 15, 10, 30).isoformat(),
            "status": "pending_approval",
            "approved_by": None,
            "approved_at": None,
            "fulfilled_by": None,
            "fulfilled_at": None,
            "rejection_reason": None,
            "rejected_by": None,
            "rejected_at": None
        },
        {
            "id": str(uuid.uuid4()),
            "request_number": "IO-00002",
            "product_name": "Bread Flour",
            "package_size": "25kg",
            "quantity": 40,
            "total_weight": 1000.0,
            "requested_by": "Mekdes Alem",
            "requested_at": datetime(2025, 1, 14, 14, 20).isoformat(),
            "status": "approved",
            "approved_by": "Yohannes Teklu",
            "approved_at": datetime(2025, 1, 14, 15, 30).isoformat(),
            "fulfilled_by": None,
            "fulfilled_at": None,
            "rejection_reason": None,
            "rejected_by": None,
            "rejected_at": None
        }
    ]
    
    await db.internal_orders.insert_many(internal_orders)
    print(f"✓ Seeded {len(internal_orders)} internal orders")
    
    print("\n✅ Database seeding completed successfully!")

async def main():
    await seed_inventory()
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
