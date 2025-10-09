"""
Demo Data Seeding Script for Client Presentation
Creates realistic sample data across all modules for impressive demo
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone, timedelta
import uuid
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_demo_data():
    """Seed comprehensive demo data for client presentation"""
    
    print("🎯 Starting Demo Data Seeding for Client Presentation...")
    print("=" * 60)
    
    # Step 1: Ensure inventory exists (run update_branch_products.py first)
    inventory_count = await db.inventory.count_documents({})
    print(f"\n📦 Current Inventory Items: {inventory_count}")
    
    if inventory_count < 10:
        print("⚠️  Warning: Run 'python update_branch_products.py' first!")
        print("   Continuing with existing inventory...")
    
    # Step 2: Create demo customers
    print("\n👥 Creating Demo Customers...")
    customers = [
        {
            "id": str(uuid.uuid4()),
            "customer_number": "CUST-00001",
            "name": "ABC Bakery",
            "phone": "+251-911-123456",
            "email": "abc@bakery.et",
            "credit_limit": 500000.0,
            "current_balance": 125000.0,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "customer_number": "CUST-00002",
            "name": "Sunshine Bakery & Cafe",
            "phone": "+251-911-234567",
            "email": "sunshine@cafe.et",
            "credit_limit": 500000.0,
            "current_balance": 75000.0,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=25)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "customer_number": "CUST-00003",
            "name": "Golden Grain Restaurant",
            "phone": "+251-911-345678",
            "email": "golden@restaurant.et",
            "credit_limit": 500000.0,
            "current_balance": 0.0,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat()
        }
    ]
    
    await db.customers.delete_many({})
    await db.customers.insert_many(customers)
    print(f"   ✓ Created {len(customers)} demo customers")
    
    # Step 3: Create demo sales transactions
    print("\n💰 Creating Demo Sales Transactions...")
    
    # Get some products for transactions
    products = await db.inventory.find({"is_sellable": {"$ne": False}}).limit(5).to_list(None)
    
    sales_transactions = []
    for i in range(5):
        product = random.choice(products) if products else None
        if not product:
            continue
            
        transaction = {
            "id": str(uuid.uuid4()),
            "transaction_number": f"TXN-{str(i+1).zfill(6)}",
            "branch_id": product.get("branch_id", "berhane"),
            "items": [{
                "product_id": product["id"],
                "product_name": product["name"],
                "quantity_kg": 100.0,
                "unit_price": product.get("unit_price", 2500),
                "total_price": 100.0 * product.get("unit_price", 2500)
            }],
            "total_amount": 100.0 * product.get("unit_price", 2500),
            "payment_type": random.choice(["cash", "check", "bank_transfer"]),
            "created_by": "demo_sales",
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48))).isoformat()
        }
        sales_transactions.append(transaction)
    
    if sales_transactions:
        await db.sales_transactions.delete_many({})
        await db.sales_transactions.insert_many(sales_transactions)
        print(f"   ✓ Created {len(sales_transactions)} sales transactions")
    
    # Step 4: Create demo loans
    print("\n💳 Creating Demo Loans...")
    loans = [
        {
            "id": str(uuid.uuid4()),
            "loan_number": "LOAN-00001",
            "customer_id": customers[0]["id"],
            "customer_name": customers[0]["name"],
            "customer_phone": customers[0]["phone"],
            "principal_amount": 125000.0,
            "amount_paid": 0.0,
            "balance": 125000.0,
            "issue_date": (datetime.now(timezone.utc) - timedelta(days=15)).isoformat(),
            "due_date": (datetime.now(timezone.utc) + timedelta(days=15)).isoformat(),
            "status": "active",
            "branch_id": "berhane",
            "created_by": "demo_sales",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=15)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "loan_number": "LOAN-00002",
            "customer_id": customers[1]["id"],
            "customer_name": customers[1]["name"],
            "customer_phone": customers[1]["phone"],
            "principal_amount": 75000.0,
            "amount_paid": 0.0,
            "balance": 75000.0,
            "issue_date": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat(),
            "due_date": (datetime.now(timezone.utc) + timedelta(days=20)).isoformat(),
            "status": "active",
            "branch_id": "girmay",
            "created_by": "demo_sales",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        }
    ]
    
    await db.loans.delete_many({})
    await db.loans.insert_many(loans)
    print(f"   ✓ Created {len(loans)} active loans")
    
    # Step 5: Create demo stock requests in various stages
    print("\n📋 Creating Demo Stock Requests...")
    stock_requests = [
        {
            "id": str(uuid.uuid4()),
            "request_number": "SR-00001",
            "product_name": "1st Quality 50kg",
            "quantity": 500.0,
            "requesting_branch": "berhane",
            "source_branch": "girmay",
            "status": "pending_admin_approval",
            "requested_by": "demo_sales",
            "requested_at": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
            "reason": "Restocking for weekend rush"
        },
        {
            "id": str(uuid.uuid4()),
            "request_number": "SR-00002",
            "product_name": "Bread 50kg",
            "quantity": 300.0,
            "requesting_branch": "girmay",
            "source_branch": "berhane",
            "status": "pending_manager_approval",
            "requested_by": "demo_sales",
            "requested_at": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat(),
            "reason": "Customer bulk order",
            "admin_approval": {
                "approved_by": "demo_admin",
                "approved_at": (datetime.now(timezone.utc) - timedelta(hours=5)).isoformat(),
                "notes": "Approved - inventory available"
            }
        },
        {
            "id": str(uuid.uuid4()),
            "request_number": "SR-00003",
            "product_name": "Fruska",
            "quantity": 200.0,
            "requesting_branch": "berhane",
            "source_branch": "girmay",
            "status": "in_transit",
            "requested_by": "demo_sales",
            "requested_at": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
            "reason": "Regular restocking",
            "admin_approval": {
                "approved_by": "demo_admin",
                "approved_at": (datetime.now(timezone.utc) - timedelta(hours=20)).isoformat(),
                "notes": "Approved"
            },
            "manager_approval": {
                "approved_by": "demo_manager",
                "approved_at": (datetime.now(timezone.utc) - timedelta(hours=18)).isoformat(),
                "notes": "Approved - capacity available"
            }
        }
    ]
    
    await db.stock_requests.delete_many({})
    await db.stock_requests.insert_many(stock_requests)
    print(f"   ✓ Created {len(stock_requests)} stock requests")
    
    # Step 6: Create demo purchase requisitions
    print("\n🛒 Creating Demo Purchase Requisitions...")
    purchase_reqs = [
        {
            "id": str(uuid.uuid4()),
            "request_number": "PR-00001",
            "description": "Raw Wheat Purchase - 5000kg",
            "purchase_type": "material",
            "category": "raw_material",
            "estimated_cost": 250000.0,
            "vendor_name": "Ethiopian Wheat Suppliers",
            "vendor_contact": "+251-911-555001",
            "requested_by": "demo_manager",
            "requested_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
            "status": "owner_approved",
            "manager_approval": {
                "approved_by": "demo_manager",
                "approved_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
                "notes": "Approved - needed for production"
            },
            "admin_approval": {
                "approved_by": "demo_admin",
                "approved_at": (datetime.now(timezone.utc) - timedelta(days=1, hours=12)).isoformat(),
                "notes": "Approved - verified pricing"
            },
            "owner_approval": {
                "approved_by": "demo_owner",
                "approved_at": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat(),
                "notes": "Approved for processing"
            }
        },
        {
            "id": str(uuid.uuid4()),
            "request_number": "PR-00002",
            "description": "Packaging Bags - 50kg size",
            "purchase_type": "material",
            "category": "packaging",
            "estimated_cost": 85000.0,
            "vendor_name": "Addis Packaging Co.",
            "vendor_contact": "+251-911-555002",
            "requested_by": "demo_manager",
            "requested_at": (datetime.now(timezone.utc) - timedelta(hours=12)).isoformat(),
            "status": "pending_owner_approval",
            "manager_approval": {
                "approved_by": "demo_manager",
                "approved_at": (datetime.now(timezone.utc) - timedelta(hours=12)).isoformat(),
                "notes": "Approved"
            },
            "admin_approval": {
                "approved_by": "demo_admin",
                "approved_at": (datetime.now(timezone.utc) - timedelta(hours=8)).isoformat(),
                "notes": "Approved - quote verified"
            }
        }
    ]
    
    await db.purchase_requisitions.delete_many({})
    await db.purchase_requisitions.insert_many(purchase_reqs)
    print(f"   ✓ Created {len(purchase_reqs)} purchase requisitions")
    
    # Step 7: Create demo finance transactions
    print("\n💵 Creating Demo Finance Transactions...")
    finance_transactions = []
    
    # Create transactions for sales
    for i, sale in enumerate(sales_transactions):
        transaction = {
            "id": str(uuid.uuid4()),
            "transaction_number": f"FIN-{str(i+1).zfill(6)}",
            "transaction_type": "income",
            "account_type": sale["payment_type"],
            "amount": sale["total_amount"],
            "reference": sale["transaction_number"],
            "description": f"Sales transaction - {sale['items'][0]['product_name']}",
            "branch_id": sale["branch_id"],
            "created_by": "system",
            "created_at": sale["created_at"]
        }
        finance_transactions.append(transaction)
    
    # Create transaction for paid purchase
    finance_transactions.append({
        "id": str(uuid.uuid4()),
        "transaction_number": f"FIN-{str(len(finance_transactions)+1).zfill(6)}",
        "transaction_type": "expense",
        "account_type": "bank_transfer",
        "amount": 250000.0,
        "reference": "PR-00001",
        "description": "Payment for wheat purchase",
        "created_by": "demo_finance",
        "created_at": (datetime.now(timezone.utc) - timedelta(hours=4)).isoformat()
    })
    
    if finance_transactions:
        await db.finance_transactions.delete_many({})
        await db.finance_transactions.insert_many(finance_transactions)
        print(f"   ✓ Created {len(finance_transactions)} finance transactions")
    
    # Step 8: Create demo milling orders
    print("\n⚙️ Creating Demo Milling Orders...")
    milling_orders = [
        {
            "id": str(uuid.uuid4()),
            "order_number": "MO-00001",
            "branch_id": "berhane",
            "input_quantity": 1000.0,
            "status": "completed",
            "created_by": "demo_manager",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
            "completed_at": (datetime.now(timezone.utc) - timedelta(hours=18)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "order_number": "MO-00002",
            "branch_id": "girmay",
            "input_quantity": 800.0,
            "status": "in_progress",
            "created_by": "demo_manager",
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=4)).isoformat()
        }
    ]
    
    await db.milling_orders.delete_many({})
    await db.milling_orders.insert_many(milling_orders)
    print(f"   ✓ Created {len(milling_orders)} milling orders")
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ DEMO DATA SEEDING COMPLETED!")
    print("=" * 60)
    print("\n📊 Summary:")
    print(f"   • Customers: {len(customers)}")
    print(f"   • Sales Transactions: {len(sales_transactions)}")
    print(f"   • Active Loans: {len(loans)}")
    print(f"   • Stock Requests: {len(stock_requests)}")
    print(f"   • Purchase Requisitions: {len(purchase_reqs)}")
    print(f"   • Finance Transactions: {len(finance_transactions)}")
    print(f"   • Milling Orders: {len(milling_orders)}")
    print(f"   • Inventory Items: {inventory_count}")
    
    print("\n🎯 Ready for Client Demo!")
    print("\n📝 Demo User Credentials:")
    print("   • Username: demo_owner   | Password: demo123 | Role: Owner")
    print("   • Username: demo_sales   | Password: demo123 | Role: Sales")
    print("   • Username: demo_manager | Password: demo123 | Role: Manager")
    print("   • Username: demo_finance | Password: demo123 | Role: Finance")
    print("   • Username: demo_admin   | Password: demo123 | Role: Admin")
    
    print("\n🚀 Next Steps:")
    print("   1. Start backend: python server.py")
    print("   2. Start frontend: cd ../frontend && npm start")
    print("   3. Test login with demo credentials")
    print("   4. Verify all data appears correctly")

async def main():
    await seed_demo_data()
    client.close()

if __name__ == "__main__":
    asyncio.run(main())

