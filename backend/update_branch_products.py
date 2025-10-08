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

async def update_branch_products():
    """Add actual branch-specific products"""
    
    print("=" * 60)
    print("ADDING ACTUAL BRANCH-SPECIFIC PRODUCTS")
    print("=" * 60)
    
    print("\n📍 BERHANE BRANCH Products:")
    print("-" * 60)
    
    # ==================== BERHANE BRANCH ====================
    berhane_products = [
        # Bread Products
        {
            "id": str(uuid.uuid4()),
            "name": "Bread 50kg",
            "product_type": "Bread Flour",
            "package_size": "50kg",
            "quantity": 2000.0,
            "packages_available": 40,
            "unit": "kg",
            "unit_price": 2600.0,
            "stock_level": "ok",
            "low_threshold": 1500.0,
            "critical_threshold": 500.0,
            "category": "flour",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": True,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bread 25kg",
            "product_type": "Bread Flour",
            "package_size": "25kg",
            "quantity": 1000.0,
            "packages_available": 40,
            "unit": "kg",
            "unit_price": 1350.0,
            "stock_level": "ok",
            "low_threshold": 750.0,
            "critical_threshold": 250.0,
            "category": "flour",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": True,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        
        # Bran Products
        {
            "id": str(uuid.uuid4()),
            "name": "Fruska",
            "product_type": "Bran",
            "package_size": "bulk",
            "quantity": 900.0,
            "packages_available": 0,
            "unit": "kg",
            "unit_price": 12.0,
            "stock_level": "ok",
            "low_threshold": 500.0,
            "critical_threshold": 200.0,
            "category": "bran",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": True,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fruskelo Red",
            "product_type": "Bran",
            "package_size": "bulk",
            "quantity": 650.0,
            "packages_available": 0,
            "unit": "kg",
            "unit_price": 18.0,
            "stock_level": "ok",
            "low_threshold": 400.0,
            "critical_threshold": 150.0,
            "category": "bran",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": True,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        
        # TDF Service (Special - not for sale, tracking only)
        {
            "id": str(uuid.uuid4()),
            "name": "TDF Service Parts",
            "product_type": "Service/Spare Parts",
            "package_size": "unit",
            "quantity": 0.0,
            "packages_available": 0,
            "unit": "unit",
            "unit_price": 0.0,
            "stock_level": "ok",
            "low_threshold": 0.0,
            "critical_threshold": 0.0,
            "category": "service",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": False,
            "is_service": True,
            "service_for": "TDF",
            "notes": "Service and spare parts for TDF - tracking only, not for sale",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    print("\n📍 GIRMAY BRANCH Products:")
    print("-" * 60)
    
    # ==================== GIRMAY BRANCH ====================
    girmay_products = [
        # 1st Quality Flour - ALL sizes
        {
            "id": str(uuid.uuid4()),
            "name": "1st Quality 50kg",
            "product_type": "1st Quality Flour",
            "package_size": "50kg",
            "quantity": 2500.0,
            "packages_available": 50,
            "unit": "kg",
            "unit_price": 2500.0,
            "stock_level": "ok",
            "low_threshold": 1500.0,
            "critical_threshold": 500.0,
            "category": "flour",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": True,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "1st Quality 25kg",
            "product_type": "1st Quality Flour",
            "package_size": "25kg",
            "quantity": 1250.0,
            "packages_available": 50,
            "unit": "kg",
            "unit_price": 1300.0,
            "stock_level": "ok",
            "low_threshold": 750.0,
            "critical_threshold": 250.0,
            "category": "flour",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": True,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "1st Quality 10kg",
            "product_type": "1st Quality Flour",
            "package_size": "10kg",
            "quantity": 500.0,
            "packages_available": 50,
            "unit": "kg",
            "unit_price": 550.0,
            "stock_level": "ok",
            "low_threshold": 300.0,
            "critical_threshold": 100.0,
            "category": "flour",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": True,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "1st Quality 5kg",
            "product_type": "1st Quality Flour",
            "package_size": "5kg",
            "quantity": 250.0,
            "packages_available": 50,
            "unit": "kg",
            "unit_price": 280.0,
            "stock_level": "ok",
            "low_threshold": 150.0,
            "critical_threshold": 50.0,
            "category": "flour",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": True,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        
        # Bread Products
        {
            "id": str(uuid.uuid4()),
            "name": "Bread 50kg",
            "product_type": "Bread Flour",
            "package_size": "50kg",
            "quantity": 1800.0,
            "packages_available": 36,
            "unit": "kg",
            "unit_price": 2600.0,
            "stock_level": "ok",
            "low_threshold": 1000.0,
            "critical_threshold": 400.0,
            "category": "flour",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": True,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bread 25kg",
            "product_type": "Bread Flour",
            "package_size": "25kg",
            "quantity": 900.0,
            "packages_available": 36,
            "unit": "kg",
            "unit_price": 1350.0,
            "stock_level": "ok",
            "low_threshold": 500.0,
            "critical_threshold": 200.0,
            "category": "flour",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": True,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        
        # Bran Products
        {
            "id": str(uuid.uuid4()),
            "name": "Fruska",
            "product_type": "Bran",
            "package_size": "bulk",
            "quantity": 850.0,
            "packages_available": 0,
            "unit": "kg",
            "unit_price": 12.0,
            "stock_level": "ok",
            "low_threshold": 500.0,
            "critical_threshold": 200.0,
            "category": "bran",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": True,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fruskelo Red",
            "product_type": "Bran",
            "package_size": "bulk",
            "quantity": 700.0,
            "packages_available": 0,
            "unit": "kg",
            "unit_price": 18.0,
            "stock_level": "ok",
            "low_threshold": 400.0,
            "critical_threshold": 150.0,
            "category": "bran",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": True,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fruskelo White",
            "product_type": "Bran",
            "package_size": "bulk",
            "quantity": 600.0,
            "packages_available": 0,
            "unit": "kg",
            "unit_price": 16.0,
            "stock_level": "ok",
            "low_threshold": 400.0,
            "critical_threshold": 150.0,
            "category": "bran",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": True,
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Combine all products
    all_products = berhane_products + girmay_products
    
    # Insert products
    print("\n💾 Inserting Products...")
    print("-" * 60)
    
    inserted_count = 0
    skipped_count = 0
    
    for product in all_products:
        # Check if product with same name and branch already exists
        existing = await db.inventory.find_one({
            "name": product["name"],
            "branch_id": product["branch_id"]
        })
        
        if existing:
            print(f"  ⚠ {product['name']} ({product['branch_name']}) - Already exists, skipping")
            skipped_count += 1
        else:
            await db.inventory.insert_one(product)
            sellable = "" if product.get("is_sellable", True) else " [SERVICE ONLY - NOT FOR SALE]"
            print(f"  ✓ {product['name']} ({product['branch_name']}) - {product['quantity']}kg{sellable}")
            inserted_count += 1
    
    print("\n" + "=" * 60)
    print("PRODUCT SUMMARY BY BRANCH")
    print("=" * 60)
    
    # Show summary
    berhane_count = await db.inventory.count_documents({"branch_id": "berhane"})
    girmay_count = await db.inventory.count_documents({"branch_id": "girmay"})
    
    print(f"\n📍 BERHANE BRANCH: {berhane_count} products")
    berhane_items = await db.inventory.find(
        {"branch_id": "berhane"}, 
        {"_id": 0, "name": 1, "quantity": 1, "category": 1, "is_sellable": 1}
    ).to_list(100)
    for item in berhane_items:
        sellable_tag = "" if item.get("is_sellable", True) else " [SERVICE]"
        print(f"   - {item['name']}: {item['quantity']}kg ({item['category']}){sellable_tag}")
    
    print(f"\n📍 GIRMAY BRANCH: {girmay_count} products")
    girmay_items = await db.inventory.find(
        {"branch_id": "girmay"}, 
        {"_id": 0, "name": 1, "quantity": 1, "category": 1}
    ).to_list(100)
    for item in girmay_items:
        print(f"   - {item['name']}: {item['quantity']}kg ({item['category']})")
    
    print("\n" + "=" * 60)
    print(f"✅ COMPLETED!")
    print(f"   Inserted: {inserted_count}")
    print(f"   Skipped: {skipped_count}")
    print("=" * 60)
    
    print("\n📝 IMPORTANT NOTES:")
    print("  ✓ Each product is unique to its branch")
    print("  ✓ Berhane produces: Bread (2 sizes), Fruska, Fruskelo Red, TDF Service")
    print("  ✓ Girmay produces: 1st Quality (4 sizes), Bread (2 sizes), Fruska, Fruskelo Red, Fruskelo White")
    print("  ✓ TDF Service added to Berhane (not sellable - tracking only)")
    print("  ✓ Stock requests will auto-route to correct branch")
    print("  ✓ POS will show only products from user's branch")
    print("\n🔜 NEXT STEPS:")
    print("  1. Restart backend: python server.py")
    print("  2. Test POS - should see branch-specific products")
    print("  3. Test stock requests - should route correctly")

async def main():
    await update_branch_products()
    client.close()

if __name__ == "__main__":
    asyncio.run(main())

