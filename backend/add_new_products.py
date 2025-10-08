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

async def add_new_products():
    """Add new packaged products to inventory"""
    
    print("Adding new packaged products...")
    
    # New products with package sizes and pricing
    new_products = [
        # 1st Quality Flour - Different package sizes
        {
            "id": str(uuid.uuid4()),
            "name": "1st Quality 50kg",
            "product_type": "1st Quality Flour",
            "package_size": "50kg",
            "quantity": 2000.0,  # in kg (40 bags x 50kg)
            "packages_available": 40,
            "unit": "kg",
            "unit_price": 2500.0,  # price per 50kg bag
            "stock_level": "ok",
            "low_threshold": 1500.0,
            "critical_threshold": 500.0,
            "category": "flour",
            "branch_id": "main_warehouse",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "1st Quality 25kg",
            "product_type": "1st Quality Flour",
            "package_size": "25kg",
            "quantity": 1000.0,  # in kg (40 bags x 25kg)
            "packages_available": 40,
            "unit": "kg",
            "unit_price": 1300.0,  # price per 25kg bag
            "stock_level": "ok",
            "low_threshold": 750.0,
            "critical_threshold": 250.0,
            "category": "flour",
            "branch_id": "main_warehouse",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "1st Quality 15kg",
            "product_type": "1st Quality Flour",
            "package_size": "15kg",
            "quantity": 600.0,  # in kg (40 bags x 15kg)
            "packages_available": 40,
            "unit": "kg",
            "unit_price": 800.0,  # price per 15kg bag
            "stock_level": "ok",
            "low_threshold": 450.0,
            "critical_threshold": 150.0,
            "category": "flour",
            "branch_id": "main_warehouse",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "1st Quality 5kg",
            "product_type": "1st Quality Flour",
            "package_size": "5kg",
            "quantity": 250.0,  # in kg (50 bags x 5kg)
            "packages_available": 50,
            "unit": "kg",
            "unit_price": 280.0,  # price per 5kg bag
            "stock_level": "ok",
            "low_threshold": 150.0,
            "critical_threshold": 50.0,
            "category": "flour",
            "branch_id": "main_warehouse",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        
        # Bread Flour - Different package sizes
        {
            "id": str(uuid.uuid4()),
            "name": "Bread Flour 50kg",
            "product_type": "Bread Flour",
            "package_size": "50kg",
            "quantity": 1500.0,  # in kg (30 bags x 50kg)
            "packages_available": 30,
            "unit": "kg",
            "unit_price": 2400.0,  # price per 50kg bag
            "stock_level": "ok",
            "low_threshold": 1000.0,
            "critical_threshold": 400.0,
            "category": "flour",
            "branch_id": "girmay_warehouse",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bread Flour 25kg",
            "product_type": "Bread Flour",
            "package_size": "25kg",
            "quantity": 750.0,  # in kg (30 bags x 25kg)
            "packages_available": 30,
            "unit": "kg",
            "unit_price": 1250.0,  # price per 25kg bag
            "stock_level": "ok",
            "low_threshold": 500.0,
            "critical_threshold": 200.0,
            "category": "flour",
            "branch_id": "girmay_warehouse",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        
        # Bran Products
        {
            "id": str(uuid.uuid4()),
            "name": "White Fruskela",
            "product_type": "Bran",
            "package_size": "bulk",
            "quantity": 800.0,  # in kg
            "packages_available": 0,  # sold by weight
            "unit": "kg",
            "unit_price": 15.0,  # price per kg
            "stock_level": "ok",
            "low_threshold": 500.0,
            "critical_threshold": 200.0,
            "category": "bran",
            "branch_id": "main_warehouse",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Red Fruskela",
            "product_type": "Bran",
            "package_size": "bulk",
            "quantity": 650.0,  # in kg
            "packages_available": 0,  # sold by weight
            "unit": "kg",
            "unit_price": 18.0,  # price per kg
            "stock_level": "ok",
            "low_threshold": 400.0,
            "critical_threshold": 150.0,
            "category": "bran",
            "branch_id": "girmay_warehouse",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Furska",
            "product_type": "Bran",
            "package_size": "bulk",
            "quantity": 900.0,  # in kg
            "packages_available": 0,  # sold by weight
            "unit": "kg",
            "unit_price": 12.0,  # price per kg
            "stock_level": "ok",
            "low_threshold": 500.0,
            "critical_threshold": 200.0,
            "category": "bran",
            "branch_id": "main_warehouse",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Check if products already exist
    for product in new_products:
        existing = await db.inventory.find_one({"name": product["name"]})
        if existing:
            print(f"  ⚠ Product '{product['name']}' already exists. Skipping.")
        else:
            await db.inventory.insert_one(product)
            print(f"  ✓ Added: {product['name']} ({product['package_size']}) - {product['quantity']}kg")
    
    print(f"\n✅ Product addition completed!")
    
    # Print summary
    total_count = await db.inventory.count_documents({})
    print(f"\n📊 Total inventory items: {total_count}")
    
    # Show products by category
    flour_count = await db.inventory.count_documents({"category": "flour"})
    bran_count = await db.inventory.count_documents({"category": "bran"})
    print(f"   - Flour products: {flour_count}")
    print(f"   - Bran products: {bran_count}")

async def main():
    await add_new_products()
    client.close()

if __name__ == "__main__":
    asyncio.run(main())

