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
    
    print("\nBERHANE BRANCH Products:")
    print("-" * 60)
    
    # ==================== BERHANE BRANCH ====================
    # BERHANE DOES NOT PRODUCE 1ST QUALITY FLOUR
    # BERHANE produces: Bread (50kg, 25kg), Fruska, Red Fruskelo, TDF products
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
        
        # TDF Products - ONLY BERHANE receives wheat from TDF and processes it
        {
            "id": str(uuid.uuid4()),
            "name": "TDF Bread 50kg",
            "product_type": "TDF Bread Flour",
            "package_size": "50kg",
            "quantity": 1500.0,
            "packages_available": 30,
            "unit": "kg",
            "unit_price": 2700.0,
            "stock_level": "ok",
            "low_threshold": 1000.0,
            "critical_threshold": 400.0,
            "category": "flour",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": True,
            "is_tdf": True,
            "tdf_source": "Tigray Defense Force",
            "notes": "Processed from TDF wheat - Only available at Berhane",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "TDF Bread 25kg",
            "product_type": "TDF Bread Flour",
            "package_size": "25kg",
            "quantity": 750.0,
            "packages_available": 30,
            "unit": "kg",
            "unit_price": 1400.0,
            "stock_level": "ok",
            "low_threshold": 500.0,
            "critical_threshold": 200.0,
            "category": "flour",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": True,
            "is_tdf": True,
            "tdf_source": "Tigray Defense Force",
            "notes": "Processed from TDF wheat - Only available at Berhane",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        
        # Packaging Materials - BERHANE SPECIFIC
        {
            "id": str(uuid.uuid4()),
            "name": "Package for Bread 50kg",
            "product_type": "Packaging",
            "package_size": "unit",
            "quantity": 500.0,
            "packages_available": 500,
            "unit": "units",
            "unit_price": 5.0,
            "stock_level": "ok",
            "low_threshold": 200.0,
            "critical_threshold": 50.0,
            "category": "packaging",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": False,
            "notes": "Packaging material for Bread 50kg bags",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Package for Bread 25kg",
            "product_type": "Packaging",
            "package_size": "unit",
            "quantity": 500.0,
            "packages_available": 500,
            "unit": "units",
            "unit_price": 3.0,
            "stock_level": "ok",
            "low_threshold": 200.0,
            "critical_threshold": 50.0,
            "category": "packaging",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": False,
            "notes": "Packaging material for Bread 25kg bags",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Package for TDF 50kg",
            "product_type": "Packaging",
            "package_size": "unit",
            "quantity": 300.0,
            "packages_available": 300,
            "unit": "units",
            "unit_price": 5.0,
            "stock_level": "ok",
            "low_threshold": 150.0,
            "critical_threshold": 40.0,
            "category": "packaging",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": False,
            "notes": "Packaging material for TDF Bread 50kg bags",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Package for TDF 25kg",
            "product_type": "Packaging",
            "package_size": "unit",
            "quantity": 300.0,
            "packages_available": 300,
            "unit": "units",
            "unit_price": 3.0,
            "stock_level": "ok",
            "low_threshold": 150.0,
            "critical_threshold": 40.0,
            "category": "packaging",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": False,
            "notes": "Packaging material for TDF Bread 25kg bags",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Package for Fruska",
            "product_type": "Packaging",
            "package_size": "unit",
            "quantity": 400.0,
            "packages_available": 400,
            "unit": "units",
            "unit_price": 2.0,
            "stock_level": "ok",
            "low_threshold": 150.0,
            "critical_threshold": 30.0,
            "category": "packaging",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": False,
            "notes": "Packaging material for Fruska bags",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Package for Fruskelo Red",
            "product_type": "Packaging",
            "package_size": "unit",
            "quantity": 300.0,
            "packages_available": 300,
            "unit": "units",
            "unit_price": 2.5,
            "stock_level": "ok",
            "low_threshold": 120.0,
            "critical_threshold": 30.0,
            "category": "packaging",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": False,
            "notes": "Packaging material for Fruskelo Red bags",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        
        # Spare Parts - BERHANE
        {
            "id": str(uuid.uuid4()),
            "name": "Wenfit",
            "product_type": "Spare Parts",
            "package_size": "unit",
            "quantity": 15.0,
            "packages_available": 15,
            "unit": "units",
            "unit_price": 450.0,
            "stock_level": "ok",
            "low_threshold": 5.0,
            "critical_threshold": 2.0,
            "category": "spare_parts",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": False,
            "notes": "Milling machine spare part",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Dinamo",
            "product_type": "Spare Parts",
            "package_size": "unit",
            "quantity": 8.0,
            "packages_available": 8,
            "unit": "units",
            "unit_price": 1200.0,
            "stock_level": "ok",
            "low_threshold": 3.0,
            "critical_threshold": 1.0,
            "category": "spare_parts",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": False,
            "notes": "Motor/Generator for milling equipment",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Chingya",
            "product_type": "Spare Parts",
            "package_size": "unit",
            "quantity": 25.0,
            "packages_available": 25,
            "unit": "units",
            "unit_price": 180.0,
            "stock_level": "ok",
            "low_threshold": 10.0,
            "critical_threshold": 3.0,
            "category": "spare_parts",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": False,
            "notes": "Milling machine component",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Cycle Wenfit",
            "product_type": "Spare Parts",
            "package_size": "unit",
            "quantity": 12.0,
            "packages_available": 12,
            "unit": "units",
            "unit_price": 350.0,
            "stock_level": "ok",
            "low_threshold": 5.0,
            "critical_threshold": 2.0,
            "category": "spare_parts",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": False,
            "notes": "Cycle component for milling machine",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bulohi",
            "product_type": "Spare Parts",
            "package_size": "unit",
            "quantity": 30.0,
            "packages_available": 30,
            "unit": "units",
            "unit_price": 85.0,
            "stock_level": "ok",
            "low_threshold": 12.0,
            "critical_threshold": 4.0,
            "category": "spare_parts",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": False,
            "notes": "Bearing/bushing for machinery",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Kuchinya",
            "product_type": "Spare Parts",
            "package_size": "unit",
            "quantity": 20.0,
            "packages_available": 20,
            "unit": "units",
            "unit_price": 120.0,
            "stock_level": "ok",
            "low_threshold": 8.0,
            "critical_threshold": 3.0,
            "category": "spare_parts",
            "branch_id": "berhane",
            "branch_name": "Berhane Branch",
            "is_sellable": False,
            "notes": "Milling machine spare part",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    print("\nGIRMAY BRANCH Products:")
    print("-" * 60)
    
    # ==================== GIRMAY BRANCH ====================
    # GIRMAY produces: 1st Quality Flour (all sizes), Bread, Fruska, White Fruskelo
    # GIRMAY DOES NOT PRODUCE TDF products
    girmay_products = [
        # 1st Quality Flour - ALL sizes - ONLY GIRMAY produces this
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
            "notes": "White Fruskelo - ONLY produced at Girmay Branch",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        
        # Packaging Materials - GIRMAY SPECIFIC
        {
            "id": str(uuid.uuid4()),
            "name": "Package for 1st Quality 50kg",
            "product_type": "Packaging",
            "package_size": "unit",
            "quantity": 600.0,
            "packages_available": 600,
            "unit": "units",
            "unit_price": 5.0,
            "stock_level": "ok",
            "low_threshold": 250.0,
            "critical_threshold": 60.0,
            "category": "packaging",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": False,
            "notes": "Packaging material for 1st Quality 50kg bags",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Package for 1st Quality 25kg",
            "product_type": "Packaging",
            "package_size": "unit",
            "quantity": 600.0,
            "packages_available": 600,
            "unit": "units",
            "unit_price": 3.0,
            "stock_level": "ok",
            "low_threshold": 250.0,
            "critical_threshold": 60.0,
            "category": "packaging",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": False,
            "notes": "Packaging material for 1st Quality 25kg bags",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Package for 1st Quality 10kg",
            "product_type": "Packaging",
            "package_size": "unit",
            "quantity": 400.0,
            "packages_available": 400,
            "unit": "units",
            "unit_price": 2.0,
            "stock_level": "ok",
            "low_threshold": 150.0,
            "critical_threshold": 40.0,
            "category": "packaging",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": False,
            "notes": "Packaging material for 1st Quality 10kg bags",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Package for 1st Quality 5kg",
            "product_type": "Packaging",
            "package_size": "unit",
            "quantity": 400.0,
            "packages_available": 400,
            "unit": "units",
            "unit_price": 1.5,
            "stock_level": "ok",
            "low_threshold": 150.0,
            "critical_threshold": 40.0,
            "category": "packaging",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": False,
            "notes": "Packaging material for 1st Quality 5kg bags",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Package for Bread 50kg",
            "product_type": "Packaging",
            "package_size": "unit",
            "quantity": 500.0,
            "packages_available": 500,
            "unit": "units",
            "unit_price": 5.0,
            "stock_level": "ok",
            "low_threshold": 200.0,
            "critical_threshold": 50.0,
            "category": "packaging",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": False,
            "notes": "Packaging material for Bread 50kg bags",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Package for Bread 25kg",
            "product_type": "Packaging",
            "package_size": "unit",
            "quantity": 500.0,
            "packages_available": 500,
            "unit": "units",
            "unit_price": 3.0,
            "stock_level": "ok",
            "low_threshold": 200.0,
            "critical_threshold": 50.0,
            "category": "packaging",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": False,
            "notes": "Packaging material for Bread 25kg bags",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Package for Fruska",
            "product_type": "Packaging",
            "package_size": "unit",
            "quantity": 400.0,
            "packages_available": 400,
            "unit": "units",
            "unit_price": 2.0,
            "stock_level": "ok",
            "low_threshold": 150.0,
            "critical_threshold": 30.0,
            "category": "packaging",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": False,
            "notes": "Packaging material for Fruska bags",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Package for Fruskelo White",
            "product_type": "Packaging",
            "package_size": "unit",
            "quantity": 300.0,
            "packages_available": 300,
            "unit": "units",
            "unit_price": 2.5,
            "stock_level": "ok",
            "low_threshold": 120.0,
            "critical_threshold": 30.0,
            "category": "packaging",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": False,
            "notes": "Packaging material for Fruskelo White bags",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        
        # Spare Parts - GIRMAY
        {
            "id": str(uuid.uuid4()),
            "name": "Wenfit",
            "product_type": "Spare Parts",
            "package_size": "unit",
            "quantity": 18.0,
            "packages_available": 18,
            "unit": "units",
            "unit_price": 450.0,
            "stock_level": "ok",
            "low_threshold": 5.0,
            "critical_threshold": 2.0,
            "category": "spare_parts",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": False,
            "notes": "Milling machine spare part",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Dinamo",
            "product_type": "Spare Parts",
            "package_size": "unit",
            "quantity": 10.0,
            "packages_available": 10,
            "unit": "units",
            "unit_price": 1200.0,
            "stock_level": "ok",
            "low_threshold": 3.0,
            "critical_threshold": 1.0,
            "category": "spare_parts",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": False,
            "notes": "Motor/Generator for milling equipment",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Chingya",
            "product_type": "Spare Parts",
            "package_size": "unit",
            "quantity": 28.0,
            "packages_available": 28,
            "unit": "units",
            "unit_price": 180.0,
            "stock_level": "ok",
            "low_threshold": 10.0,
            "critical_threshold": 3.0,
            "category": "spare_parts",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": False,
            "notes": "Milling machine component",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Cycle Wenfit",
            "product_type": "Spare Parts",
            "package_size": "unit",
            "quantity": 14.0,
            "packages_available": 14,
            "unit": "units",
            "unit_price": 350.0,
            "stock_level": "ok",
            "low_threshold": 5.0,
            "critical_threshold": 2.0,
            "category": "spare_parts",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": False,
            "notes": "Cycle component for milling machine",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bulohi",
            "product_type": "Spare Parts",
            "package_size": "unit",
            "quantity": 35.0,
            "packages_available": 35,
            "unit": "units",
            "unit_price": 85.0,
            "stock_level": "ok",
            "low_threshold": 12.0,
            "critical_threshold": 4.0,
            "category": "spare_parts",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": False,
            "notes": "Bearing/bushing for machinery",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Kuchinya",
            "product_type": "Spare Parts",
            "package_size": "unit",
            "quantity": 22.0,
            "packages_available": 22,
            "unit": "units",
            "unit_price": 120.0,
            "stock_level": "ok",
            "low_threshold": 8.0,
            "critical_threshold": 3.0,
            "category": "spare_parts",
            "branch_id": "girmay",
            "branch_name": "Girmay Branch",
            "is_sellable": False,
            "notes": "Milling machine spare part",
            "transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Combine all products
    all_products = berhane_products + girmay_products
    
    # Insert products
    print("\nInserting Products...")
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
            print(f"  [SKIP] {product['name']} ({product['branch_name']}) - Already exists, skipping")
            skipped_count += 1
        else:
            await db.inventory.insert_one(product)
            sellable = "" if product.get("is_sellable", True) else " [SERVICE ONLY - NOT FOR SALE]"
            print(f"  [OK] {product['name']} ({product['branch_name']}) - {product['quantity']}kg{sellable}")
            inserted_count += 1
    
    print("\n" + "=" * 60)
    print("PRODUCT SUMMARY BY BRANCH")
    print("=" * 60)
    
    # Show summary
    berhane_count = await db.inventory.count_documents({"branch_id": "berhane"})
    girmay_count = await db.inventory.count_documents({"branch_id": "girmay"})
    
    print(f"\nBERHANE BRANCH: {berhane_count} products")
    berhane_items = await db.inventory.find(
        {"branch_id": "berhane"}, 
        {"_id": 0, "name": 1, "quantity": 1, "category": 1, "is_sellable": 1}
    ).to_list(100)
    for item in berhane_items:
        sellable_tag = "" if item.get("is_sellable", True) else " [SERVICE]"
        category = item.get('category', 'N/A')
        print(f"   - {item['name']}: {item['quantity']}kg ({category}){sellable_tag}")
    
    print(f"\nGIRMAY BRANCH: {girmay_count} products")
    girmay_items = await db.inventory.find(
        {"branch_id": "girmay"}, 
        {"_id": 0, "name": 1, "quantity": 1, "category": 1}
    ).to_list(100)
    for item in girmay_items:
        category = item.get('category', 'N/A')
        print(f"   - {item['name']}: {item['quantity']}kg ({category})")
    
    print("\n" + "=" * 60)
    print(f"COMPLETED!")
    print(f"   Inserted: {inserted_count}")
    print(f"   Skipped: {skipped_count}")
    print("=" * 60)
    
    print("\nIMPORTANT NOTES:")
    print("  * Each product is unique to its branch")
    print("  * BERHANE produces: Bread (50kg, 25kg), Fruska, Fruskelo Red, TDF Bread (50kg, 25kg)")
    print("  * BERHANE DOES NOT PRODUCE: 1st Quality Flour")
    print("  * BERHANE ONLY receives wheat from TDF (Tigray Defense Force) for processing")
    print("  * GIRMAY produces: 1st Quality (4 sizes), Bread (50kg, 25kg), Fruska, Fruskelo White")
    print("  * GIRMAY DOES NOT PRODUCE: TDF products, Fruskelo Red")
    print("  * Fruskelo Red is ONLY produced at BERHANE")
    print("  * Fruskelo White is ONLY produced at GIRMAY")
    print("  * Stock requests will auto-route to correct branch")
    print("  * POS will show only products from user's branch")
    print("\nNEXT STEPS:")
    print("  1. Restart backend: python server.py")
    print("  2. Test POS - should see branch-specific products")
    print("  3. Test stock requests - should route correctly")

async def main():
    await update_branch_products()
    client.close()

if __name__ == "__main__":
    asyncio.run(main())

