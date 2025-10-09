import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys
import io
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone
import uuid

# Fix Windows console encoding for Unicode
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_branch_inventory():
    """Seed branch-specific inventory items"""
    
    print("Seeding branch-specific inventory...")
    
    # Clear existing inventory
    await db.inventory.delete_many({})
    print("✓ Cleared existing inventory")
    
    # Branch-specific inventory items
    inventory_items = []
    
    # Berhane Branch Inventory
    berhane_items = [
        {
            "id": str(uuid.uuid4()),
            "name": "Raw Wheat",
            "quantity": 12500.0,
            "unit": "kg",
            "branch_id": "berhane",
            "stock_level": "ok",
            "low_threshold": 5000.0,
            "critical_threshold": 2000.0,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "1st Quality Flour",
            "quantity": 4200.0,
            "unit": "kg",
            "branch_id": "berhane",
            "stock_level": "ok",
            "low_threshold": 3000.0,
            "critical_threshold": 1000.0,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bread Flour",
            "quantity": 2800.0,
            "unit": "kg",
            "branch_id": "berhane",
            "stock_level": "ok",
            "low_threshold": 2000.0,
            "critical_threshold": 800.0,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fruska",
            "quantity": 1300.0,
            "unit": "kg",
            "branch_id": "berhane",
            "stock_level": "ok",
            "low_threshold": 1000.0,
            "critical_threshold": 500.0,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fruskelo",
            "quantity": 650.0,
            "unit": "kg",
            "branch_id": "berhane",
            "stock_level": "ok",
            "low_threshold": 500.0,
            "critical_threshold": 200.0,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Girmay Branch Inventory
    girmay_items = [
        {
            "id": str(uuid.uuid4()),
            "name": "Raw Wheat",
            "quantity": 11800.0,
            "unit": "kg",
            "branch_id": "girmay",
            "stock_level": "ok",
            "low_threshold": 5000.0,
            "critical_threshold": 2000.0,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "1st Quality Flour",
            "quantity": 3900.0,
            "unit": "kg",
            "branch_id": "girmay",
            "stock_level": "ok",
            "low_threshold": 3000.0,
            "critical_threshold": 1000.0,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bread Flour",
            "quantity": 2600.0,
            "unit": "kg",
            "branch_id": "girmay",
            "stock_level": "ok",
            "low_threshold": 2000.0,
            "critical_threshold": 800.0,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fruska",
            "quantity": 1200.0,
            "unit": "kg",
            "branch_id": "girmay",
            "stock_level": "ok",
            "low_threshold": 1000.0,
            "critical_threshold": 500.0,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fruskelo",
            "quantity": 600.0,
            "unit": "kg",
            "branch_id": "girmay",
            "stock_level": "ok",
            "low_threshold": 500.0,
            "critical_threshold": 200.0,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        # Additional items for Girmay
        {
            "id": str(uuid.uuid4()),
            "name": "Premium Flour",
            "quantity": 1500.0,
            "unit": "kg",
            "branch_id": "girmay",
            "stock_level": "ok",
            "low_threshold": 1000.0,
            "critical_threshold": 500.0,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Whole Wheat Flour",
            "quantity": 800.0,
            "unit": "kg",
            "branch_id": "girmay",
            "stock_level": "ok",
            "low_threshold": 600.0,
            "critical_threshold": 300.0,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Semolina",
            "quantity": 950.0,
            "unit": "kg",
            "branch_id": "girmay",
            "stock_level": "ok",
            "low_threshold": 700.0,
            "critical_threshold": 350.0,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Durum Wheat",
            "quantity": 1100.0,
            "unit": "kg",
            "branch_id": "girmay",
            "stock_level": "ok",
            "low_threshold": 800.0,
            "critical_threshold": 400.0,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    inventory_items = berhane_items + girmay_items
    
    await db.inventory.insert_many(inventory_items)
    print(f"✓ Seeded {len(berhane_items)} inventory items for Berhane branch")
    print(f"✓ Seeded {len(girmay_items)} inventory items for Girmay branch")
    print(f"✓ Total: {len(inventory_items)} inventory items")
    
    print("\n✅ Branch-specific inventory seeding completed successfully!")
    
    # Print summary
    print("\n📊 Inventory Summary:")
    print(f"   Berhane Branch: {len(berhane_items)} products")
    print(f"   Girmay Branch: {len(girmay_items)} products")
    print(f"\n   Berhane Raw Wheat: {berhane_items[0]['quantity']}kg")
    print(f"   Girmay Raw Wheat: {girmay_items[0]['quantity']}kg")

async def main():
    await seed_branch_inventory()
    client.close()

if __name__ == "__main__":
    asyncio.run(main())

