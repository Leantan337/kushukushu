import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys
import io
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone

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

async def seed_pricing():
    """Add realistic pricing data to all inventory items"""
    
    print("Adding pricing data to inventory items...")
    
    # Define pricing rules based on product type
    pricing_rules = {
        # Raw Materials - Cost per kg
        "Raw Wheat": {"actual_unit_cost": 32.0, "current_unit_cost": 32.0, "unit_selling_price": 0.0},
        "Durum Wheat": {"actual_unit_cost": 38.0, "current_unit_cost": 38.0, "unit_selling_price": 0.0},
        
        # Intermediate Products - Cost per kg
        "1st Quality Flour": {"actual_unit_cost": 42.0, "current_unit_cost": 42.0, "unit_selling_price": 0.0},
        "Bread Flour": {"actual_unit_cost": 38.0, "current_unit_cost": 38.0, "unit_selling_price": 0.0},
        "Premium Flour": {"actual_unit_cost": 45.0, "current_unit_cost": 45.0, "unit_selling_price": 0.0},
        "Whole Wheat Flour": {"actual_unit_cost": 40.0, "current_unit_cost": 40.0, "unit_selling_price": 0.0},
        "Semolina": {"actual_unit_cost": 43.0, "current_unit_cost": 43.0, "unit_selling_price": 0.0},
        "Fruska": {"actual_unit_cost": 15.0, "current_unit_cost": 15.0, "unit_selling_price": 0.0},
        "Fruskelo": {"actual_unit_cost": 12.0, "current_unit_cost": 12.0, "unit_selling_price": 0.0},
        
        # Finished Packaged Flour Products - Cost and Selling Price per package
        "Bread 50kg": {"actual_unit_cost": 2000.0, "current_unit_cost": 2000.0, "unit_selling_price": 2600.0},
        "Bread 25kg": {"actual_unit_cost": 1050.0, "current_unit_cost": 1050.0, "unit_selling_price": 1350.0},
        "TDF Bread 50kg": {"actual_unit_cost": 2100.0, "current_unit_cost": 2100.0, "unit_selling_price": 2700.0},
        "TDF Bread 25kg": {"actual_unit_cost": 1100.0, "current_unit_cost": 1100.0, "unit_selling_price": 1400.0},
        "1st Quality 50kg": {"actual_unit_cost": 1950.0, "current_unit_cost": 1950.0, "unit_selling_price": 2500.0},
        "1st Quality 25kg": {"actual_unit_cost": 1000.0, "current_unit_cost": 1000.0, "unit_selling_price": 1300.0},
        "1st Quality 10kg": {"actual_unit_cost": 420.0, "current_unit_cost": 420.0, "unit_selling_price": 550.0},
        "1st Quality 5kg": {"actual_unit_cost": 215.0, "current_unit_cost": 215.0, "unit_selling_price": 280.0},
        
        # Bran Products - Cost per kg
        "Fruskelo Red": {"actual_unit_cost": 12.0, "current_unit_cost": 12.0, "unit_selling_price": 18.0},
        "Fruskelo White": {"actual_unit_cost": 11.0, "current_unit_cost": 11.0, "unit_selling_price": 16.0},
        
        # Packaging Materials - Cost and Selling Price per unit
        "Package for Bread 50kg": {"actual_unit_cost": 3.5, "current_unit_cost": 3.5, "unit_selling_price": 5.0},
        "Package for Bread 25kg": {"actual_unit_cost": 2.0, "current_unit_cost": 2.0, "unit_selling_price": 3.0},
        "Package for TDF 50kg": {"actual_unit_cost": 3.5, "current_unit_cost": 3.5, "unit_selling_price": 5.0},
        "Package for TDF 25kg": {"actual_unit_cost": 2.0, "current_unit_cost": 2.0, "unit_selling_price": 3.0},
        "Package for 1st Quality 50kg": {"actual_unit_cost": 3.5, "current_unit_cost": 3.5, "unit_selling_price": 5.0},
        "Package for 1st Quality 25kg": {"actual_unit_cost": 2.0, "current_unit_cost": 2.0, "unit_selling_price": 3.0},
        "Package for 1st Quality 10kg": {"actual_unit_cost": 1.3, "current_unit_cost": 1.3, "unit_selling_price": 2.0},
        "Package for 1st Quality 5kg": {"actual_unit_cost": 1.0, "current_unit_cost": 1.0, "unit_selling_price": 1.5},
        "Package for Fruska": {"actual_unit_cost": 1.3, "current_unit_cost": 1.3, "unit_selling_price": 2.0},
        "Package for Fruskelo Red": {"actual_unit_cost": 1.7, "current_unit_cost": 1.7, "unit_selling_price": 2.5},
        "Package for Fruskelo White": {"actual_unit_cost": 1.7, "current_unit_cost": 1.7, "unit_selling_price": 2.5},
        
        # Spare Parts - Cost and Selling Price per unit
        "Wenfit": {"actual_unit_cost": 320.0, "current_unit_cost": 320.0, "unit_selling_price": 450.0},
        "Dinamo": {"actual_unit_cost": 900.0, "current_unit_cost": 900.0, "unit_selling_price": 1200.0},
        "Chingya": {"actual_unit_cost": 130.0, "current_unit_cost": 130.0, "unit_selling_price": 180.0},
        "Cycle Wenfit": {"actual_unit_cost": 260.0, "current_unit_cost": 260.0, "unit_selling_price": 350.0},
        "Bulohi": {"actual_unit_cost": 60.0, "current_unit_cost": 60.0, "unit_selling_price": 85.0},
        "Kuchinya": {"actual_unit_cost": 85.0, "current_unit_cost": 85.0, "unit_selling_price": 120.0},
    }
    
    # Get all inventory items
    items = await db.inventory.find({}, {"_id": 0}).to_list(1000)
    
    updated_count = 0
    not_found = []
    
    for item in items:
        item_name = item.get("name", "")
        
        if item_name in pricing_rules:
            pricing = pricing_rules[item_name]
            quantity = item.get("quantity", 0)
            
            # Calculate valuation fields
            actual_cost = pricing["actual_unit_cost"]
            current_cost = pricing["current_unit_cost"]
            selling_price = pricing["unit_selling_price"]
            
            update_fields = {
                "actual_unit_cost": actual_cost,
                "current_unit_cost": current_cost,
                "unit_selling_price": selling_price,
                "unit_price": selling_price,  # Keep legacy field in sync
                "total_inventory_value": quantity * current_cost,
                "total_selling_value": quantity * selling_price,
                "potential_profit": (quantity * selling_price) - (quantity * current_cost),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            # Calculate profit margin if cost > 0
            if current_cost > 0 and selling_price > 0:
                update_fields["profit_margin_percent"] = ((selling_price - current_cost) / current_cost) * 100
            else:
                update_fields["profit_margin_percent"] = 0.0
            
            # Update the item
            await db.inventory.update_one(
                {"id": item["id"]},
                {"$set": update_fields}
            )
            
            updated_count += 1
            print(f"✓ Updated pricing for: {item_name} (Branch: {item.get('branch_id', 'N/A')})")
            print(f"  Cost: ETB {actual_cost:,.2f} | Selling: ETB {selling_price:,.2f} | Margin: {update_fields['profit_margin_percent']:.1f}%")
        else:
            not_found.append(item_name)
    
    print(f"\n✅ Updated pricing for {updated_count} inventory items")
    
    if not_found:
        print(f"\n⚠️  No pricing rules found for {len(set(not_found))} product types:")
        for name in set(not_found):
            print(f"   - {name}")
    
    # Print summary
    print("\n📊 Pricing Summary:")
    total_inventory_value = 0
    total_selling_value = 0
    
    items = await db.inventory.find({}, {"_id": 0}).to_list(1000)
    for item in items:
        total_inventory_value += item.get("total_inventory_value", 0)
        total_selling_value += item.get("total_selling_value", 0)
    
    total_profit = total_selling_value - total_inventory_value
    margin_percent = (total_profit / total_inventory_value * 100) if total_inventory_value > 0 else 0
    
    print(f"   Total Inventory Value: ETB {total_inventory_value:,.2f}")
    print(f"   Total Potential Revenue: ETB {total_selling_value:,.2f}")
    print(f"   Total Potential Profit: ETB {total_profit:,.2f}")
    print(f"   Average Profit Margin: {margin_percent:.1f}%")

async def main():
    await seed_pricing()
    client.close()

if __name__ == "__main__":
    asyncio.run(main())

