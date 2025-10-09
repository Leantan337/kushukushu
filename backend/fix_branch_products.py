import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys
import io
from dotenv import load_dotenv
from pathlib import Path

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

async def fix_branch_products():
    """Fix branch-specific product inventory based on actual production capabilities"""
    
    print("=" * 70)
    print("FIXING BRANCH-SPECIFIC PRODUCT INVENTORY")
    print("=" * 70)
    
    # ========== STEP 1: Remove products that should NOT exist ==========
    print("\n📋 STEP 1: Removing incorrectly assigned products...")
    print("-" * 70)
    
    # Products that should NOT be at BERHANE
    berhane_remove = [
        {"name": {"$regex": "1st Quality", "$options": "i"}, "branch_id": "berhane"},
        {"name": "Fruskelo White", "branch_id": "berhane"}
    ]
    
    # Products that should NOT be at GIRMAY
    girmay_remove = [
        {"name": {"$regex": "TDF", "$options": "i"}, "branch_id": "girmay"},
        {"name": "Fruskelo Red", "branch_id": "girmay"}
    ]
    
    removed_count = 0
    
    for query in berhane_remove:
        result = await db.inventory.delete_many(query)
        if result.deleted_count > 0:
            print(f"  ❌ Removed {result.deleted_count} '{query.get('name', 'items')}' from BERHANE")
            removed_count += result.deleted_count
    
    for query in girmay_remove:
        result = await db.inventory.delete_many(query)
        if result.deleted_count > 0:
            print(f"  ❌ Removed {result.deleted_count} '{query.get('name', 'items')}' from GIRMAY")
            removed_count += result.deleted_count
    
    if removed_count == 0:
        print("  ✅ No incorrect products found to remove")
    else:
        print(f"\n  Total removed: {removed_count} products")
    
    # ========== STEP 2: Verify correct products exist ==========
    print("\n📋 STEP 2: Verifying branch-specific products...")
    print("-" * 70)
    
    # Check BERHANE products
    berhane_expected = [
        "Bread 50kg", "Bread 25kg", 
        "Fruska", "Fruskelo Red",
        "TDF Bread 50kg", "TDF Bread 25kg"
    ]
    
    # Check GIRMAY products
    girmay_expected = [
        "1st Quality 50kg", "1st Quality 25kg", "1st Quality 10kg", "1st Quality 5kg",
        "Bread 50kg", "Bread 25kg",
        "Fruska", "Fruskelo White"
    ]
    
    print("\n🔍 BERHANE BRANCH - Expected Products:")
    berhane_found = []
    berhane_missing = []
    for product in berhane_expected:
        exists = await db.inventory.find_one({"name": product, "branch_id": "berhane"})
        if exists:
            print(f"  ✅ {product} - Found ({exists.get('quantity', 0)}kg)")
            berhane_found.append(product)
        else:
            print(f"  ⚠️  {product} - MISSING")
            berhane_missing.append(product)
    
    print("\n🔍 GIRMAY BRANCH - Expected Products:")
    girmay_found = []
    girmay_missing = []
    for product in girmay_expected:
        exists = await db.inventory.find_one({"name": product, "branch_id": "girmay"})
        if exists:
            print(f"  ✅ {product} - Found ({exists.get('quantity', 0)}kg)")
            girmay_found.append(product)
        else:
            print(f"  ⚠️  {product} - MISSING")
            girmay_missing.append(product)
    
    # ========== STEP 3: Summary ==========
    print("\n" + "=" * 70)
    print("VERIFICATION SUMMARY")
    print("=" * 70)
    
    print(f"\n📊 BERHANE BRANCH:")
    print(f"   Found: {len(berhane_found)}/{len(berhane_expected)} products")
    if berhane_missing:
        print(f"   Missing: {', '.join(berhane_missing)}")
    else:
        print(f"   ✅ All expected products present")
    
    print(f"\n📊 GIRMAY BRANCH:")
    print(f"   Found: {len(girmay_found)}/{len(girmay_expected)} products")
    if girmay_missing:
        print(f"   Missing: {', '.join(girmay_missing)}")
    else:
        print(f"   ✅ All expected products present")
    
    # ========== STEP 4: Recommendations ==========
    print("\n" + "=" * 70)
    print("RECOMMENDATIONS")
    print("=" * 70)
    
    if berhane_missing or girmay_missing:
        print("\n⚠️  Missing products detected!")
        print("\n   Run the following command to add missing products:")
        print("   python update_branch_products.py")
    else:
        print("\n✅ All branch-specific products are correctly configured!")
    
    print("\n" + "=" * 70)
    print("CRITICAL BUSINESS RULES")
    print("=" * 70)
    print("\n✅ BERHANE Branch:")
    print("   - Produces: Bread (50kg, 25kg), Fruska, Fruskelo Red")
    print("   - Produces: TDF Bread (50kg, 25kg) - from TDF wheat")
    print("   - DOES NOT produce: 1st Quality Flour, Fruskelo White")
    
    print("\n✅ GIRMAY Branch:")
    print("   - Produces: 1st Quality (50kg, 25kg, 10kg, 5kg)")
    print("   - Produces: Bread (50kg, 25kg), Fruska, Fruskelo White")
    print("   - DOES NOT produce: TDF products, Fruskelo Red")
    
    print("\n" + "=" * 70)

async def main():
    await fix_branch_products()
    client.close()

if __name__ == "__main__":
    asyncio.run(main())

