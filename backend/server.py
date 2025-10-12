from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from enum import Enum
import os
import logging
from pathlib import Path
import uuid

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'kushukushu_erp')]

# Create app
app = FastAPI(title="KushuKushu ERP API", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== ENUMS ====================

class PaymentType(str, Enum):
    CASH = "cash"
    LOAN = "loan"
    BANK_TRANSFER = "bank_transfer"
    CREDIT = "credit"

class TransactionStatus(str, Enum):
    PAID = "paid"
    UNPAID = "unpaid"
    PARTIALLY_PAID = "partially_paid"

class RequisitionStatus(str, Enum):
    PENDING = "pending"
    MANAGER_APPROVED = "manager_approved"
    ADMIN_APPROVED = "admin_approved"
    OWNER_APPROVED = "owner_approved"
    FINANCE_REQUESTED = "finance_requested"
    COMPLETED = "completed"
    REJECTED = "rejected"

class StockRequestStatus(str, Enum):
    PENDING = "pending"
    MANAGER_APPROVED = "manager_approved"
    ADMIN_APPROVED = "admin_approved"
    PENDING_GATE_APPROVAL = "pending_gate_approval"
    READY_FOR_PICKUP = "ready_for_pickup"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# ==================== PYDANTIC MODELS ====================

class FinancialSummary(BaseModel):
    cash_account: float = 0
    bank_account: float = 0
    total_income: float = 0
    total_expenses: float = 0
    net_balance: float = 0
    accounts_receivable: float = 0
    pending_payments: float = 0

class PurchaseRequisition(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    description: str
    item_name: str
    quantity: float
    unit: str
    estimated_cost: float
    supplier_name: Optional[str] = None
    requested_by: str
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "pending"
    manager_approved_at: Optional[datetime] = None
    admin_approved_at: Optional[datetime] = None
    owner_approved_at: Optional[datetime] = None
    branch_id: Optional[str] = None
    urgency: str = "normal"
    notes: Optional[str] = None
    batch_number: Optional[str] = None  # For grouping related quick-add requests

class SalesTransactionItem(BaseModel):
    product_id: str
    product_name: str
    quantity_kg: float
    unit_price: float

class SalesTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transaction_number: str = Field(default_factory=lambda: f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}")
    items: List[SalesTransactionItem]
    payment_type: str
    total_amount: float = 0
    status: str = "paid"
    sales_person_id: str
    sales_person_name: str
    branch_id: str
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reconciliation_status: str = "pending"

class Loan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    customer_name: str
    customer_phone: Optional[str] = None
    initial_amount: float
    balance: float
    paid_amount: float = 0
    branch_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    due_date: Optional[datetime] = None
    status: str = "active"
    last_payment_date: Optional[datetime] = None
    payment_history_rating: str = "Good"

class InventoryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    quantity: float
    unit: str
    branch_id: str
    unit_cost: float = 0
    actual_unit_cost: float = 0
    current_unit_cost: float = 0
    unit_selling_price: float = 0
    reorder_level: float = 0
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StockRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request_number: str = Field(default_factory=lambda: f"SR-{datetime.now().strftime('%Y%m%d%H%M%S')}")
    source_branch: str
    destination_branch: str
    product_id: str
    product_name: str
    quantity_kg: float
    urgency: str = "normal"
    reason: str
    requested_by: str
    requested_by_id: str
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "pending"
    approved_by_manager_at: Optional[datetime] = None
    approved_by_admin_at: Optional[datetime] = None
    # Batch processing
    batch_id: Optional[str] = None  # Groups multiple requests together for batch approval
    # Customer delivery fields
    is_customer_delivery: bool = False
    customer_info: Optional[Dict[str, Any]] = None  # name, phone, address, delivery_date_preference
    customer_order_details: Optional[Dict[str, Any]] = None  # items[], total_amount, payment_terms
    dispatch_status: Optional[str] = None  # pending_dispatch, dispatched, delivered
    dispatch_info: Optional[Dict[str, Any]] = None  # dispatched_by, dispatched_at, dispatch_notes

class ActivityLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str
    action: str
    description: str
    branch: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user_id: Optional[str] = None
    user_name: Optional[str] = None

class DashboardSummary(BaseModel):
    financial_kpis: Dict[str, float]
    operations: Dict[str, Any]
    trends: Dict[str, Any]

class BranchStats(BaseModel):
    branch_id: str
    branch_name: str
    today_sales: float
    today_production: float
    current_inventory: float
    operational_status: str
    active_staff: int

class FinancialControls(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    finance_daily_limit: float = 500000
    finance_transaction_limit: float = 100000
    manager_purchase_limit: float = 50000
    auto_approve_threshold: float = 10000
    require_owner_approval_above: float = 1000000
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_by: str = "system"

# ==================== HELPER FUNCTIONS ====================

async def log_activity(role: str, action: str, description: str, branch: Optional[str] = None, user_name: Optional[str] = None):
    """Log activity to database"""
    activity = ActivityLog(
        role=role,
        action=action,
        description=description,
        branch=branch,
        user_name=user_name
    )
    await db.activity_logs.insert_one(activity.model_dump())

async def initialize_sample_data():
    """Initialize sample data if database is empty"""
    
    # Always ensure raw wheat exists for both branches
    for branch in ["berhane", "girmay"]:
        raw_wheat = await db.inventory.find_one({"name": "Raw Wheat", "branch_id": branch})
        if not raw_wheat:
            logger.info(f"Adding Raw Wheat to {branch} branch...")
            wheat_item = {
                "id": str(uuid.uuid4()),
                "name": "Raw Wheat",
                "category": "Raw Material",
                "quantity": 15000 if branch == "berhane" else 12000,
                "unit": "kg",
                "branch_id": branch,
                "unit_cost": 25,
                "actual_unit_cost": 24,
                "current_unit_cost": 25,
                "unit_selling_price": 0,
                "reorder_level": 5000,
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
            await db.inventory.insert_one(wheat_item)
        
        # Ensure standard flour products exist for production logging
        standard_products = []
        
        if branch == "berhane":
            standard_products = [
                ("Bread Flour", 2000, 35, 45),
                ("Fruskelo", 500, 12, 16)
            ]
        else:  # girmay
            standard_products = [
                ("1st Quality Flour", 2500, 40, 50),
                ("Bread Flour", 1000, 35, 45),
                ("Fruskelo", 600, 12, 16)
            ]
        
        for product_name, initial_qty, unit_cost, selling_price in standard_products:
            existing = await db.inventory.find_one({"name": product_name, "branch_id": branch})
            if not existing:
                logger.info(f"Adding {product_name} to {branch} branch...")
                product_item = {
                    "id": str(uuid.uuid4()),
                    "name": product_name,
                    "category": "Finished Product",
                    "quantity": initial_qty,
                    "unit": "kg",
                    "branch_id": branch,
                    "unit_cost": unit_cost,
                    "actual_unit_cost": unit_cost - 3,
                    "current_unit_cost": unit_cost,
                    "unit_selling_price": selling_price,
                    "reorder_level": 500,
                    "last_updated": datetime.now(timezone.utc).isoformat()
                }
                await db.inventory.insert_one(product_item)
    
    # Check if inventory exists
    inventory_count = await db.inventory.count_documents({})
    if inventory_count == 0:
        logger.info("Initializing sample inventory data...")
        sample_inventory = [
            {
                "id": "inv_001",
                "name": "Bread Flour - 25kg",
                "category": "Finished Product",
                "quantity": 5000,
                "unit": "kg",
                "branch_id": "berhane",
                "unit_cost": 35,
                "actual_unit_cost": 32,
                "current_unit_cost": 35,
                "unit_selling_price": 45,
                "reorder_level": 1000,
                "last_updated": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "inv_002",
                "name": "All-Purpose Flour - 50kg",
                "category": "Finished Product",
                "quantity": 3500,
                "unit": "kg",
                "branch_id": "berhane",
                "unit_cost": 40,
                "actual_unit_cost": 37,
                "current_unit_cost": 40,
                "unit_selling_price": 52,
                "reorder_level": 800,
                "last_updated": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "inv_003",
                "name": "Raw Wheat",
                "category": "Raw Material",
                "quantity": 15000,
                "unit": "kg",
                "branch_id": "berhane",
                "unit_cost": 25,
                "actual_unit_cost": 24,
                "current_unit_cost": 25,
                "unit_selling_price": 0,
                "reorder_level": 5000,
                "last_updated": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "inv_004",
                "name": "Bread Flour - 25kg",
                "category": "Finished Product",
                "quantity": 4200,
                "unit": "kg",
                "branch_id": "girmay",
                "unit_cost": 35,
                "actual_unit_cost": 32,
                "current_unit_cost": 35,
                "unit_selling_price": 45,
                "reorder_level": 1000,
                "last_updated": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "inv_005",
                "name": "All-Purpose Flour - 50kg",
                "category": "Finished Product",
                "quantity": 3800,
                "unit": "kg",
                "branch_id": "girmay",
                "unit_cost": 40,
                "actual_unit_cost": 37,
                "current_unit_cost": 40,
                "unit_selling_price": 52,
                "reorder_level": 800,
                "last_updated": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "inv_006",
                "name": "Raw Wheat",
                "category": "Raw Material",
                "quantity": 12000,
                "unit": "kg",
                "branch_id": "girmay",
                "unit_cost": 25,
                "actual_unit_cost": 24,
                "current_unit_cost": 25,
                "unit_selling_price": 0,
                "reorder_level": 5000,
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.inventory.insert_many(sample_inventory)
    
    # Initialize financial controls if not exists
    controls_count = await db.financial_controls.count_documents({})
    if controls_count == 0:
        logger.info("Initializing financial controls...")
        default_controls = FinancialControls()
        await db.financial_controls.insert_one(default_controls.model_dump())

# ==================== ROOT & HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "KushuKushu ERP API v2.0", "status": "operational"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# ==================== FINANCE MODULE ====================

@api_router.get("/finance/summary")
async def get_finance_summary():
    """Get financial summary"""
    
    # Get all sales transactions
    transactions = await db.sales_transactions.find({}, {"_id": 0}).to_list(1000)
    
    # Get all loans
    loans = await db.loans.find({"status": "active"}, {"_id": 0}).to_list(1000)
    
    # Get pending requisitions (both admin_approved and owner_approved)
    requisitions = await db.purchase_requisitions.find(
        {"status": {"$in": ["admin_approved", "owner_approved"]}}, 
        {"_id": 0}
    ).to_list(1000)
    
    total_sales = sum(txn.get('total_amount', 0) for txn in transactions)
    accounts_receivable = sum(loan.get('balance', 0) for loan in loans)
    pending_payments = sum(req.get('estimated_cost', 0) for req in requisitions)
    
    return {
        "cash_account": total_sales * 0.7,  # Mock: 70% of sales as cash
        "bank_account": total_sales * 0.3,  # Mock: 30% in bank
        "total_income": total_sales,
        "total_expenses": pending_payments,
        "net_balance": total_sales - pending_payments,
        "accounts_receivable": accounts_receivable,
        "pending_payments": pending_payments,
        "pending_count": len(requisitions)
    }

@api_router.get("/finance/pending-authorizations")
async def get_pending_authorizations():
    """Get purchase requisitions awaiting payment
    
    Returns both:
    - admin_approved: Requests approved by Admin (≤ Br 50,000)
    - owner_approved: Requests approved by Owner (> Br 50,000)
    
    Both need Finance to process payment!
    """
    requisitions = await db.purchase_requisitions.find(
        {"status": {"$in": ["admin_approved", "owner_approved"]}},
        {"_id": 0}
    ).sort("requested_at", -1).to_list(100)
    return requisitions

@api_router.get("/finance/transactions")
async def get_finance_transactions(limit: int = Query(10, ge=1, le=100)):
    """Get recent financial transactions"""
    transactions = await db.sales_transactions.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Format for frontend
    formatted = []
    for txn in transactions:
        formatted.append({
            "id": txn.get("id"),
            "type": "sale" if txn.get("status") == "paid" else "receivable",
            "description": f"Sales Transaction - {txn.get('transaction_number')}",
            "amount": txn.get("total_amount", 0),
            "transaction_date": txn.get("created_at"),
            "created_at": txn.get("created_at"),
            "branch_id": txn.get("branch_id"),
            "reconciliation_status": txn.get("reconciliation_status", "pending")
        })
    
    return formatted

@api_router.get("/finance/reconciliation/pending")
async def get_pending_reconciliation():
    """Get transactions pending reconciliation"""
    pending = await db.sales_transactions.find(
        {"reconciliation_status": "pending"},
        {"_id": 0}
    ).to_list(100)
    return pending

@api_router.post("/finance/reconciliation/submit")
async def submit_reconciliation(data: Dict[str, Any]):
    """Submit daily reconciliation"""
    reconciliation = {
        "id": str(uuid.uuid4()),
        "branch_id": data.get("branch_id"),
        "date": data.get("date"),
        "expected_cash": data.get("expected_cash", 0),
        "actual_cash": data.get("actual_cash", 0),
        "variance": data.get("variance", 0),
        "notes": data.get("notes", ""),
        "submitted_by": data.get("submitted_by", "Unknown"),
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "status": "submitted"
    }
    
    # Make a copy for response
    response_data = reconciliation.copy()
    
    await db.reconciliations.insert_one(reconciliation)
    await log_activity("Finance", "reconciliation", f"Submitted reconciliation for {data.get('branch_id')}", branch=data.get("branch_id"))
    
    return {"success": True, "reconciliation": response_data}

@api_router.get("/finance/spending-limits")
async def get_spending_limits(finance_officer: str = Query(...)):
    """Get spending limits for finance officer"""
    controls = await db.financial_controls.find_one({}, {"_id": 0})
    
    if not controls:
        controls = FinancialControls().model_dump()
    
    return {
        "finance_officer": finance_officer,
        "daily_limit": controls.get("finance_daily_limit", 500000),
        "transaction_limit": controls.get("finance_transaction_limit", 100000),
        "remaining_daily_limit": controls.get("finance_daily_limit", 500000) * 0.65  # Mock: 65% remaining
    }

@api_router.post("/finance/process-payment/{requisition_id}")
async def process_payment(requisition_id: str, payment_data: Dict[str, Any]):
    """Process payment for approved requisition
    
    Accepts both:
    - admin_approved: Requests approved by Admin (≤ Br 50,000)
    - owner_approved: Requests approved by Owner (> Br 50,000)
    """
    
    # Get requisition
    requisition = await db.purchase_requisitions.find_one({"id": requisition_id}, {"_id": 0})
    
    if not requisition:
        raise HTTPException(status_code=404, detail="Requisition not found")
    
    # Check if requisition is approved (by Admin or Owner)
    if requisition.get("status") not in ["admin_approved", "owner_approved"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Requisition not approved for payment. Current status: {requisition.get('status')}"
        )
    
    # Create payment record
    payment = {
        "id": str(uuid.uuid4()),
        "requisition_id": requisition_id,
        "amount": requisition.get("estimated_cost"),
        "payment_method": payment_data.get("payment_method"),
        "bank_name": payment_data.get("bank_name"),
        "reference_number": payment_data.get("reference_number"),
        "processed_by": payment_data.get("processed_by", "Finance Officer"),
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "notes": payment_data.get("notes", ""),
        "status": "completed"
    }
    
    # Make a copy for response
    response_data = payment.copy()
    
    await db.payments.insert_one(payment)
    
    # Update requisition status
    await db.purchase_requisitions.update_one(
        {"id": requisition_id},
        {"$set": {
            "status": "completed", 
            "payment_id": payment["id"],
            "completed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log activity with approval source
    approval_source = "Admin" if requisition.get('status') == 'admin_approved' else "Owner"
    await log_activity(
        "Finance", 
        "payment", 
        f"Processed payment for {requisition.get('description')} (Br {requisition.get('estimated_cost', 0):,.2f}) - {approval_source} approved", 
        branch=requisition.get("branch_id")
    )
    
    return {"success": True, "payment": response_data}

@api_router.post("/finance/request-funds/{requisition_id}")
async def request_funds(requisition_id: str, request_data: Dict[str, Any]):
    """Request funds from owner for payment"""
    
    fund_request = {
        "id": str(uuid.uuid4()),
        "requisition_id": requisition_id,
        "amount": request_data.get("amount"),
        "requested_by": request_data.get("requested_by"),
        "payment_urgency": request_data.get("payment_urgency", "normal"),
        "justification": request_data.get("justification"),
        "requested_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending"
    }
    
    # Make a copy for response
    response_data = fund_request.copy()
    
    await db.fund_requests.insert_one(fund_request)
    
    return {"success": True, "fund_request": response_data}

# ==================== OWNER MODULE ====================

@api_router.get("/owner/dashboard-summary")
async def get_owner_dashboard_summary():
    """Get owner dashboard summary"""
    
    # Get today's date range
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Get sales
    all_transactions = await db.sales_transactions.find({}, {"_id": 0}).to_list(1000)
    
    # Filter today's transactions safely
    today_transactions = []
    for t in all_transactions:
        created_at = t.get('created_at')
        if created_at:
            try:
                if isinstance(created_at, str):
                    txn_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                else:
                    txn_date = created_at
                if txn_date >= today_start:
                    today_transactions.append(t)
            except (ValueError, AttributeError):
                continue
    
    # Get loans
    loans = await db.loans.find({"status": "active"}, {"_id": 0}).to_list(1000)
    
    # Get inventory
    inventory = await db.inventory.find({}, {"_id": 0}).to_list(1000)
    
    # Get fund requests
    fund_requests = await db.fund_requests.find({"status": "pending"}, {"_id": 0}).to_list(100)
    
    total_sales = sum(t.get('total_amount', 0) for t in all_transactions)
    today_sales = sum(t.get('total_amount', 0) for t in today_transactions)
    accounts_receivable = sum(l.get('balance', 0) for l in loans)
    
    inventory_value = sum(
        item.get('quantity', 0) * item.get('current_unit_cost', 0)
        for item in inventory
    )
    
    return {
        "financial_kpis": {
            "cash_in_bank": total_sales * 0.75,
            "todays_sales": today_sales,
            "accounts_receivable": accounts_receivable,
            "gross_profit": total_sales * 0.3,
            "pending_fund_requests": len(fund_requests),
            "inventory_value": inventory_value
        },
        "operations": {
            "total_staff": 45,
            "active_branches": 2,
            "pending_approvals": await db.purchase_requisitions.count_documents({"status": "admin_approved"})
        },
        "trends": {
            "sales_growth": 12.5,
            "profit_margin": 30.0
        }
    }

@api_router.get("/owner/branch-stats")
async def get_branch_stats():
    """Get statistics for all branches"""
    
    branches = ["berhane", "girmay"]
    stats = {}
    
    for branch_id in branches:
        # Get branch inventory
        inventory = await db.inventory.find({"branch_id": branch_id}, {"_id": 0}).to_list(100)
        
        # Get branch sales
        transactions = await db.sales_transactions.find({"branch_id": branch_id}, {"_id": 0}).to_list(1000)
        
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Calculate today's sales safely
        today_sales = 0
        for t in transactions:
            created_at = t.get('created_at')
            if created_at:
                try:
                    if isinstance(created_at, str):
                        txn_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    else:
                        txn_date = created_at
                    if txn_date >= today_start:
                        today_sales += t.get('total_amount', 0)
                except (ValueError, AttributeError):
                    continue
        
        total_inventory = sum(item.get('quantity', 0) for item in inventory if item.get('category') == 'Finished Product')
        
        stats[branch_id] = {
            "branch_id": branch_id,
            "branch_name": f"{branch_id.capitalize()} Branch",
            "today_sales": today_sales,
            "today_production": total_inventory * 0.1,  # Mock production
            "current_inventory": total_inventory,
            "operational_status": "Active",
            "active_staff": 22 if branch_id == "berhane" else 18
        }
    
    return stats

@api_router.get("/owner/activity-feed")
async def get_activity_feed(limit: int = Query(50, ge=1, le=100)):
    """Get recent activity feed"""
    activities = await db.activity_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return activities

@api_router.get("/recent-activity")
async def get_recent_activity(limit: int = Query(10, ge=1, le=100)):
    """Get recent activity - alternative endpoint"""
    activities = await db.activity_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return activities

@api_router.get("/owner/pending-fund-requests")
async def get_pending_fund_requests():
    """Get pending fund authorization requests"""
    fund_requests = await db.fund_requests.find({"status": "pending"}, {"_id": 0}).to_list(100)
    
    # Enrich with requisition data
    for request in fund_requests:
        req_id = request.get("requisition_id")
        if req_id:
            requisition = await db.purchase_requisitions.find_one({"id": req_id}, {"_id": 0})
            if requisition:
                request["requisition"] = requisition
    
    return fund_requests

# ==================== INVENTORY MODULE ====================

@api_router.get("/inventory")
async def get_inventory(branch_id: Optional[str] = None):
    """Get inventory items, optionally filtered by branch"""
    query = {}
    if branch_id:
        query["branch_id"] = branch_id
    
    # Exclude MongoDB's _id field to avoid serialization issues
    inventory = await db.inventory.find(query, {"_id": 0}).to_list(1000)
    return inventory

@api_router.get("/inventory/valuation")
async def get_inventory_valuation():
    """Get inventory valuation by branch"""
    inventory = await db.inventory.find({}, {"_id": 0}).to_list(1000)
    
    valuation_by_branch = {}
    total_inv_value = 0
    total_sell_value = 0
    
    for item in inventory:
        branch = item.get('branch_id', 'unknown')
        qty = item.get('quantity', 0)
        cost = item.get('current_unit_cost', 0)
        price = item.get('unit_selling_price', 0)
        
        inv_value = qty * cost
        sell_value = qty * price
        
        if branch not in valuation_by_branch:
            valuation_by_branch[branch] = {
                "branch_id": branch,
                "inventory_value": 0,
                "selling_value": 0,
                "potential_profit": 0
            }
        
        valuation_by_branch[branch]["inventory_value"] += inv_value
        valuation_by_branch[branch]["selling_value"] += sell_value
        valuation_by_branch[branch]["potential_profit"] += (sell_value - inv_value)
        
        total_inv_value += inv_value
        total_sell_value += sell_value
    
    return {
        "total_inventory_value": total_inv_value,
        "total_selling_value": total_sell_value,
        "total_potential_profit": total_sell_value - total_inv_value,
        "profit_margin_percent": ((total_sell_value - total_inv_value) / total_inv_value * 100) if total_inv_value > 0 else 0,
        "by_branch": valuation_by_branch
    }

@api_router.get("/inventory/valuation/summary")
async def get_inventory_valuation_summary():
    """Get inventory valuation summary by category"""
    inventory = await db.inventory.find({}, {"_id": 0}).to_list(1000)
    
    by_category = {}
    total_value = 0
    
    for item in inventory:
        category = item.get('category', 'Unknown')
        qty = item.get('quantity', 0)
        cost = item.get('current_unit_cost', 0)
        value = qty * cost
        
        if category not in by_category:
            by_category[category] = {
                "category": category,
                "total_value": 0,
                "item_count": 0
            }
        
        by_category[category]["total_value"] += value
        by_category[category]["item_count"] += 1
        total_value += value
    
    return {
        "total_inventory_value": total_value,
        "by_category": by_category,
        "item_count": len(inventory)
    }

@api_router.put("/inventory/{item_id}/pricing")
async def update_inventory_pricing(item_id: str, pricing_data: Dict[str, Any]):
    """Update pricing for inventory item"""
    
    update_fields = {}
    if "actual_unit_cost" in pricing_data:
        update_fields["actual_unit_cost"] = pricing_data["actual_unit_cost"]
    if "current_unit_cost" in pricing_data:
        update_fields["current_unit_cost"] = pricing_data["current_unit_cost"]
    if "unit_selling_price" in pricing_data:
        update_fields["unit_selling_price"] = pricing_data["unit_selling_price"]
    
    update_fields["last_updated"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.inventory.update_one(
        {"id": item_id},
        {"$set": update_fields}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    return {"success": True, "updated_fields": update_fields}

# ==================== SALES MODULE ====================

@api_router.post("/sales-transactions")
async def create_sales_transaction(transaction_data: Dict[str, Any]):
    """Create a new sales transaction"""
    
    # Calculate total
    items = transaction_data.get("items", [])
    total_amount = sum(item.get('quantity_kg', 0) * item.get('unit_price', 0) for item in items)
    
    # Determine status based on payment type
    payment_type = transaction_data.get("payment_type", "cash")
    status = "unpaid" if payment_type == "loan" else "paid"
    
    transaction = {
        "id": str(uuid.uuid4()),
        "transaction_number": f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:4]}",
        "items": items,
        "payment_type": payment_type,
        "total_amount": total_amount,
        "status": status,
        "sales_person_id": transaction_data.get("sales_person_id"),
        "sales_person_name": transaction_data.get("sales_person_name"),
        "branch_id": transaction_data.get("branch_id"),
        "customer_id": transaction_data.get("customer_id"),
        "customer_name": transaction_data.get("customer_name"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "reconciliation_status": "pending"
    }
    
    # Make a copy without _id for response
    response_data = transaction.copy()
    
    await db.sales_transactions.insert_one(transaction)
    
    # If loan, create loan record
    if payment_type == "loan" and transaction_data.get("customer_id"):
        existing_loan = await db.loans.find_one({"customer_id": transaction_data.get("customer_id"), "status": "active"}, {"_id": 0})
        
        if existing_loan:
            # Add to existing loan
            new_balance = existing_loan.get("balance", 0) + total_amount
            await db.loans.update_one(
                {"id": existing_loan["id"]},
                {"$set": {"balance": new_balance, "initial_amount": existing_loan.get("initial_amount", 0) + total_amount}}
            )
        else:
            # Create new loan
            loan = {
                "id": str(uuid.uuid4()),
                "customer_id": transaction_data.get("customer_id"),
                "customer_name": transaction_data.get("customer_name"),
                "customer_phone": transaction_data.get("customer_phone", ""),
                "initial_amount": total_amount,
                "balance": total_amount,
                "paid_amount": 0,
                "branch_id": transaction_data.get("branch_id"),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "due_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
                "status": "active",
                "payment_history_rating": "New Customer"
            }
            await db.loans.insert_one(loan)
    
    # Deduct from inventory
    for item in items:
        await db.inventory.update_one(
            {"id": item.get("product_id"), "branch_id": transaction_data.get("branch_id")},
            {"$inc": {"quantity": -item.get("quantity_kg", 0)}}
        )
    
    await log_activity("Sales", "transaction", f"Created sales transaction {transaction['transaction_number']}", branch=transaction_data.get("branch_id"))
    
    return response_data

@api_router.get("/sales-transactions")
async def get_sales_transactions(branch_id: Optional[str] = None):
    """Get sales transactions"""
    query = {}
    if branch_id:
        query["branch_id"] = branch_id
    
    # Exclude MongoDB's _id field to avoid serialization issues
    transactions = await db.sales_transactions.find(query, {"_id": 0}).to_list(1000)
    return transactions

# ==================== LOANS MODULE ====================

@api_router.get("/loans")
async def get_loans(status: Optional[str] = None, limit: int = Query(100, ge=1, le=1000)):
    """Get loans, optionally filtered by status"""
    query = {}
    if status:
        query["status"] = status
    
    loans = await db.loans.find(query, {"_id": 0}).limit(limit).to_list(limit)
    return loans

@api_router.post("/loans/{loan_id}/payment")
async def record_loan_payment(loan_id: str, payment_data: Dict[str, Any]):
    """Record a payment for a loan"""
    
    # Get the loan
    loan = await db.loans.find_one({"id": loan_id}, {"_id": 0})
    
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    if loan.get("status") != "active":
        raise HTTPException(status_code=400, detail="Can only record payments for active loans")
    
    payment_amount = payment_data.get("amount", 0)
    current_balance = loan.get("balance", 0)
    current_paid = loan.get("paid_amount", 0)
    
    if payment_amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than 0")
    
    if payment_amount > current_balance:
        raise HTTPException(status_code=400, detail="Payment amount cannot exceed loan balance")
    
    # Calculate new balances
    new_balance = current_balance - payment_amount
    new_paid_amount = current_paid + payment_amount
    
    # Determine new status
    new_status = "paid" if new_balance <= 0 else "active"
    
    # Update loan
    current_time = datetime.now(timezone.utc).isoformat()
    
    update_data = {
        "balance": new_balance,
        "paid_amount": new_paid_amount,
        "status": new_status,
        "last_payment_date": current_time
    }
    
    await db.loans.update_one(
        {"id": loan_id},
        {"$set": update_data}
    )
    
    # Create payment record
    payment_record = {
        "id": str(uuid.uuid4()),
        "loan_id": loan_id,
        "customer_id": loan.get("customer_id"),
        "customer_name": loan.get("customer_name"),
        "amount": payment_amount,
        "payment_method": payment_data.get("payment_method", "cash"),
        "received_by": payment_data.get("received_by", "Unknown"),
        "notes": payment_data.get("notes", ""),
        "payment_date": current_time,
        "previous_balance": current_balance,
        "new_balance": new_balance,
        "branch_id": loan.get("branch_id")
    }
    
    # Make a copy for response
    response_data = payment_record.copy()
    
    await db.loan_payments.insert_one(payment_record)
    
    # Log activity
    await log_activity(
        "Sales", 
        "loan_payment", 
        f"Recorded payment of ETB {payment_amount} for loan {loan_id} (Customer: {loan.get('customer_name')})", 
        branch=loan.get("branch_id")
    )
    
    return {"success": True, "payment": response_data, "updated_loan": {**loan, **update_data}}

@api_router.get("/loans/{loan_id}/payments")
async def get_loan_payments(loan_id: str):
    """Get payment history for a specific loan"""
    
    # Check if loan exists
    loan = await db.loans.find_one({"id": loan_id}, {"_id": 0})
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    # Get payments
    payments = await db.loan_payments.find(
        {"loan_id": loan_id}, 
        {"_id": 0}
    ).sort("payment_date", -1).to_list(100)
    
    return payments

@api_router.get("/customers")
async def get_customers(limit: int = Query(100, ge=1, le=1000)):
    """Get customers (from loans and sales transactions)"""
    # Get unique customers from loans
    loans = await db.loans.find({}, {"_id": 0}).to_list(1000)
    
    customers = {}
    for loan in loans:
        customer_id = loan.get("customer_id")
        if customer_id and customer_id not in customers:
            customers[customer_id] = {
                "id": customer_id,
                "name": loan.get("customer_name"),
                "phone": loan.get("customer_phone", ""),
                "total_loans": 0,
                "total_balance": 0,
                "payment_rating": loan.get("payment_history_rating", "Good")
            }
        
        if customer_id in customers:
            customers[customer_id]["total_loans"] += 1
            customers[customer_id]["total_balance"] += loan.get("balance", 0)
    
    return list(customers.values())[:limit]

# ==================== STOCK REQUESTS ====================

@api_router.post("/stock-requests")
async def create_stock_request(request_data: Dict[str, Any]):
    """Create a stock transfer request"""
    
    # Handle both quantity formats
    quantity = request_data.get("quantity", request_data.get("quantity_kg", 0))
    package_size = request_data.get("package_size", "50kg")
    
    # Extract kg from package size (e.g., "50kg" -> 50)
    try:
        kg_per_package = float(package_size.replace("kg", "").strip())
    except:
        kg_per_package = 50
    
    quantity_kg = quantity if "quantity_kg" in request_data else quantity * kg_per_package
    total_weight = quantity * kg_per_package if isinstance(quantity, (int, float)) else quantity_kg
    
    current_time = datetime.now(timezone.utc).isoformat()
    
    stock_request = {
        "id": str(uuid.uuid4()),
        "request_number": f"SR-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:4]}",
        "source_branch": request_data.get("source_branch", request_data.get("branch_id")),
        "destination_branch": request_data.get("destination_branch"),
        "product_id": request_data.get("product_id", str(uuid.uuid4())),
        "product_name": request_data.get("product_name"),
        "package_size": package_size,
        "quantity": quantity,
        "quantity_kg": quantity_kg,
        "total_weight": total_weight,
        "urgency": request_data.get("urgency", "normal"),
        "reason": request_data.get("reason", ""),
        "requested_by": request_data.get("requested_by"),
        "requested_by_id": request_data.get("requested_by_id", str(uuid.uuid4())),
        "requested_at": current_time,
        "status": "pending_admin_approval",  # Initial status awaiting admin
        "inventory_reserved": False,
        # Batch processing
        "batch_id": request_data.get("batch_id"),
        # Customer delivery fields
        "is_customer_delivery": request_data.get("is_customer_delivery", False),
        "customer_info": request_data.get("customer_info"),
        "customer_order_details": request_data.get("customer_order_details"),
        "dispatch_status": "pending_dispatch" if request_data.get("is_customer_delivery") else None,
        "dispatch_info": None,
        "workflow_history": [{
            "stage": "created",
            "timestamp": current_time,
            "by": request_data.get("requested_by", "Unknown"),
            "status": "pending_admin_approval"
        }]
    }
    
    # Make a copy without _id for response
    response_data = stock_request.copy()
    
    await db.stock_requests.insert_one(stock_request)
    await log_activity("Sales", "stock_request", f"Created stock request {stock_request['request_number']}")
    
    return response_data

@api_router.get("/stock-requests")
async def get_stock_requests(
    status: Optional[str] = None,
    source_branch: Optional[str] = None,
    is_customer_delivery: Optional[bool] = None
):
    """Get stock requests with optional filters"""
    query = {}
    if status:
        query["status"] = status
    if source_branch:
        query["source_branch"] = source_branch
    if is_customer_delivery is not None:
        query["is_customer_delivery"] = is_customer_delivery
    
    requests = await db.stock_requests.find(query, {"_id": 0}).to_list(1000)
    return requests

@api_router.get("/stock-requests/{request_id}")
async def get_stock_request_by_id(request_id: str):
    """Get a specific stock request by ID"""
    request = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    if not request:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    return request

@api_router.put("/stock-requests/{request_id}/approve-admin")
async def approve_stock_request_admin(request_id: str, approval_data: Dict[str, Any]):
    """Admin approves a stock request"""
    
    current_time = datetime.now(timezone.utc).isoformat()
    
    result = await db.stock_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "pending_manager_approval",  # After admin approval, awaits manager
            "admin_approved_at": current_time,
            "admin_approved_by": approval_data.get("approved_by", "Admin"),
            "admin_notes": approval_data.get("notes", ""),
            "inventory_reserved": True  # Admin reserves inventory
        },
        "$push": {
            "workflow_history": {
                "stage": "admin_approval",
                "timestamp": current_time,
                "by": approval_data.get("approved_by", "Admin"),
                "status": "pending_manager_approval",
                "notes": approval_data.get("notes", "")
            }
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    # Get updated request
    updated = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    await log_activity("Admin", "approval", f"Approved stock request {request_id}")
    
    return updated

@api_router.put("/stock-requests/{request_id}/approve-manager")
async def approve_stock_request_manager(request_id: str, approval_data: Dict[str, Any]):
    """Manager approves a stock request"""
    
    current_time = datetime.now(timezone.utc).isoformat()
    
    result = await db.stock_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "pending_fulfillment",  # After manager approval, awaits storekeeper fulfillment
            "manager_approved_at": current_time,
            "manager_approved_by": approval_data.get("approved_by", "Manager"),
            "manager_notes": approval_data.get("notes", "")
        },
        "$push": {
            "workflow_history": {
                "stage": "manager_approval",
                "timestamp": current_time,
                "by": approval_data.get("approved_by", "Manager"),
                "status": "pending_fulfillment",
                "notes": approval_data.get("notes", "")
            }
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    # Get updated request
    updated = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    await log_activity("Manager", "approval", f"Approved stock request {request_id}")
    
    return updated

@api_router.put("/stock-requests/{request_id}/fulfill")
async def fulfill_stock_request(request_id: str, fulfillment_data: Dict[str, Any]):
    """Storekeeper fulfills stock request"""
    
    # Get the stock request first
    stock_request = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    if not stock_request:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    # Deduct inventory from source branch
    source_branch = stock_request.get("source_branch")
    product_name = stock_request.get("product_name")
    quantity_kg = stock_request.get("quantity_kg", 0)
    
    if source_branch and product_name and quantity_kg > 0:
        # Try to deduct from inventory
        deduct_result = await db.inventory.update_one(
            {"name": product_name, "branch_id": source_branch},
            {"$inc": {"quantity": -quantity_kg}}
        )
        inventory_deducted = deduct_result.modified_count > 0
    else:
        inventory_deducted = False
    
    # Update stock request
    current_time = datetime.now(timezone.utc).isoformat()
    
    result = await db.stock_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "ready_for_pickup",  # Changed from pending_gate_approval
            "fulfilled_at": current_time,
            "fulfilled_by": fulfillment_data.get("fulfilled_by", "Storekeeper"),
            "fulfillment_notes": fulfillment_data.get("notes", ""),
            "inventory_deducted": inventory_deducted,
            "fulfillment": {
                "fulfilled_by": fulfillment_data.get("fulfilled_by", "Storekeeper"),
                "notes": fulfillment_data.get("notes", "")
            }
        },
        "$push": {
            "workflow_history": {
                "stage": "fulfillment",
                "timestamp": current_time,
                "by": fulfillment_data.get("fulfilled_by", "Storekeeper"),
                "status": "ready_for_pickup",
                "inventory_deducted": inventory_deducted
            }
        }}
    )
    
    # Get updated request
    updated = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    await log_activity("StoreKeeper", "fulfillment", f"Fulfilled stock request {request_id}")
    
    return updated

@api_router.put("/stock-requests/{request_id}/gate-verify")
async def gate_verify_stock_request(request_id: str, verification_data: Dict[str, Any]):
    """Guard verifies and releases stock for delivery"""
    
    current_time = datetime.now(timezone.utc).isoformat()
    
    result = await db.stock_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "in_transit",
            "gate_verified_at": current_time,
            "verified_by": verification_data.get("verified_by", "Guard"),
            "gate_pass_number": verification_data.get("gate_pass_number"),
            "vehicle_number": verification_data.get("vehicle_number"),
            "driver_name": verification_data.get("driver_name"),
            "gate_verification": {
                "verified_by": verification_data.get("verified_by", "Guard"),
                "gate_pass_number": verification_data.get("gate_pass_number"),
                "vehicle_number": verification_data.get("vehicle_number"),
                "driver_name": verification_data.get("driver_name"),
                "notes": verification_data.get("notes", "")
            }
        },
        "$push": {
            "workflow_history": {
                "stage": "gate_verification",
                "timestamp": current_time,
                "by": verification_data.get("verified_by", "Guard"),
                "status": "in_transit",
                "gate_pass": verification_data.get("gate_pass_number")
            }
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    # Get updated request
    updated = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    await log_activity("Guard", "gate_verification", f"Verified stock request {request_id} for delivery")
    
    return updated

@api_router.put("/stock-requests/{request_id}/approve-gate-pass")
async def approve_gate_pass(request_id: str, approval_data: Dict[str, Any]):
    """Approve gate pass for stock request"""
    
    result = await db.stock_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "ready_for_pickup",
            "gate_pass_approved_at": datetime.now(timezone.utc).isoformat(),
            "gate_pass_approved": True
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    return {"success": True}

@api_router.put("/stock-requests/{request_id}/confirm-delivery")
async def confirm_delivery(request_id: str, delivery_data: Dict[str, Any]):
    """Confirm delivery of stock request"""
    
    current_time = datetime.now(timezone.utc).isoformat()
    
    result = await db.stock_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "confirmed",  # Final status
            "delivered_at": current_time,
            "delivery_confirmed": True,
            "confirmed_by": delivery_data.get("confirmed_by", delivery_data.get("received_by", "Unknown")),
            "received_quantity": delivery_data.get("received_quantity"),
            "condition": delivery_data.get("condition", "good"),
            "delivery_notes": delivery_data.get("notes", ""),
            "delivery_confirmation": {
                "confirmed_by": delivery_data.get("confirmed_by", "Unknown"),
                "received_quantity": delivery_data.get("received_quantity"),
                "condition": delivery_data.get("condition", "good"),
                "notes": delivery_data.get("notes", "")
            }
        },
        "$push": {
            "workflow_history": {
                "stage": "delivery_confirmation",
                "timestamp": current_time,
                "by": delivery_data.get("confirmed_by", "Unknown"),
                "status": "confirmed",
                "received_quantity": delivery_data.get("received_quantity"),
                "condition": delivery_data.get("condition", "good")
            }
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    # Get updated request
    updated = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    await log_activity("Sales", "delivery_confirmation", f"Confirmed delivery of stock request {request_id}")
    
    return updated

@api_router.put("/stock-requests/{request_id}/dispatch")
async def dispatch_customer_delivery(request_id: str, dispatch_data: Dict[str, Any]):
    """Mark customer delivery as dispatched (Manager action)"""
    
    current_time = datetime.now(timezone.utc).isoformat()
    
    # Get the stock request first to verify it's a customer delivery
    stock_request = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    if not stock_request:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    if not stock_request.get("is_customer_delivery"):
        raise HTTPException(status_code=400, detail="This request is not a customer delivery")
    
    result = await db.stock_requests.update_one(
        {"id": request_id},
        {"$set": {
            "dispatch_status": "dispatched",
            "dispatch_info": {
                "dispatched_by": dispatch_data.get("dispatched_by", "Manager"),
                "dispatched_at": current_time,
                "driver_name": dispatch_data.get("driver_name"),
                "vehicle_number": dispatch_data.get("vehicle_number"),
                "expected_delivery_time": dispatch_data.get("expected_delivery_time"),
                "dispatch_notes": dispatch_data.get("dispatch_notes", "")
            }
        },
        "$push": {
            "workflow_history": {
                "stage": "dispatched",
                "timestamp": current_time,
                "by": dispatch_data.get("dispatched_by", "Manager"),
                "status": "dispatched",
                "notes": dispatch_data.get("dispatch_notes", "")
            }
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Failed to update dispatch status")
    
    # Get updated request
    updated = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    await log_activity("Manager", "customer_dispatch", f"Dispatched customer delivery {request_id}")
    
    return updated

@api_router.get("/customer-deliveries")
async def get_customer_deliveries(
    status: Optional[str] = None,
    dispatch_status: Optional[str] = None,
    branch_id: Optional[str] = None
):
    """Get all customer delivery requests with optional filters"""
    query = {"is_customer_delivery": True}
    
    if status:
        query["status"] = status
    if dispatch_status:
        query["dispatch_status"] = dispatch_status
    if branch_id:
        query["source_branch"] = branch_id
    
    deliveries = await db.stock_requests.find(query, {"_id": 0}).sort("requested_at", -1).to_list(1000)
    return deliveries

# ==================== PURCHASE REQUESTS ====================

@api_router.post("/purchase-requests")
async def create_purchase_request(request_data: Dict[str, Any]):
    """Create a new purchase request
    
    Workflow:
    1. Sales creates request with status 'pending_approval'
    2. If amount <= admin_threshold: Admin approves → Finance pays
    3. If amount > admin_threshold: Owner approves → Finance pays
    
    Manager is NOT in the approval chain for purchase requests!
    """
    
    estimated_cost = request_data.get("estimated_cost", 0)
    
    # Get financial controls to determine initial routing
    controls = await db.financial_controls.find_one({})
    admin_threshold = controls.get("admin_purchase_approval_threshold", 50000) if controls else 50000
    
    # Determine initial status and routing based on amount
    if estimated_cost <= admin_threshold:
        initial_status = "pending_admin_approval"
        routing = "admin"
    else:
        initial_status = "pending_owner_approval"
        routing = "owner"
    
    purchase_request = {
        "id": str(uuid.uuid4()),
        "request_number": f"PR-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:4]}",
        "description": request_data.get("description"),
        "item_name": request_data.get("item_name", request_data.get("description", "Unknown")),
        "quantity": request_data.get("quantity", 1),
        "unit": request_data.get("unit", "pcs"),
        "estimated_cost": estimated_cost,
        "supplier_name": request_data.get("supplier_name", request_data.get("vendor_name")),
        "requested_by": request_data.get("requested_by"),
        "requested_at": datetime.now(timezone.utc).isoformat(),
        "status": initial_status,
        "routing": routing,  # 'admin' or 'owner'
        "branch_id": request_data.get("branch_id"),
        "urgency": request_data.get("urgency", "normal"),
        "notes": request_data.get("reason", request_data.get("notes", "")),
        "purchase_type": request_data.get("purchase_type", "cash"),
        "category": request_data.get("category", "general"),
        "vendor_contact": request_data.get("vendor_contact", ""),
        "payment_source": request_data.get("payment_source", "finance"),  # 'sales_revenue' or 'finance'
        "admin_threshold": admin_threshold
    }
    
    # Make a copy for response
    response_data = purchase_request.copy()
    
    await db.purchase_requisitions.insert_one(purchase_request)
    await log_activity(
        "Sales", 
        "purchase_request", 
        f"Created purchase request {purchase_request['request_number']} (Br {estimated_cost:,.2f}) - Routed to {routing.upper()}", 
        branch=request_data.get("branch_id")
    )
    
    return response_data

@api_router.get("/purchase-requisitions")
async def get_purchase_requisitions(
    status: Optional[str] = None,
    branch_id: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000)
):
    """Get purchase requisitions with optional filtering"""
    query = {}
    
    if status:
        query["status"] = status
    if branch_id:
        query["branch_id"] = branch_id
    
    requisitions = await db.purchase_requisitions.find(query, {"_id": 0}).sort("requested_at", -1).limit(limit).to_list(limit)
    return requisitions

@api_router.get("/purchase-requisitions/{requisition_id}")
async def get_purchase_requisition_by_id(requisition_id: str):
    """Get a specific purchase requisition by ID"""
    requisition = await db.purchase_requisitions.find_one({"id": requisition_id}, {"_id": 0})
    
    if not requisition:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    return requisition

# Manager approval removed - managers only handle factory operations, not purchase approvals

@api_router.put("/purchase-requisitions/{requisition_id}/approve-admin")
async def approve_purchase_request_admin(requisition_id: str, approval_data: Dict[str, Any]):
    """Admin approves a purchase requisition (up to their threshold)
    
    After admin approval, request goes to Finance for payment processing.
    If amount exceeds admin threshold, it should have been routed to Owner instead.
    """
    
    requisition = await db.purchase_requisitions.find_one({"id": requisition_id}, {"_id": 0})
    
    if not requisition:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    # Check if this should have gone to owner instead
    estimated_cost = requisition.get("estimated_cost", 0)
    admin_threshold = requisition.get("admin_threshold", 50000)
    
    if estimated_cost > admin_threshold:
        raise HTTPException(
            status_code=400, 
            detail=f"Amount (Br {estimated_cost:,.2f}) exceeds admin threshold (Br {admin_threshold:,.2f}). Requires Owner approval."
        )
    
    result = await db.purchase_requisitions.update_one(
        {"id": requisition_id},
        {"$set": {
            "status": "admin_approved",
            "admin_approved_at": datetime.now(timezone.utc).isoformat(),
            "admin_approved_by": approval_data.get("approved_by", "Admin"),
            "admin_notes": approval_data.get("notes", ""),
            "next_step": "finance_payment"
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    # Get updated requisition
    updated = await db.purchase_requisitions.find_one({"id": requisition_id}, {"_id": 0})
    
    await log_activity(
        "Admin", 
        "approval", 
        f"Approved purchase requisition {requisition_id} (Br {estimated_cost:,.2f}) - Sent to Finance for payment", 
        branch=updated.get("branch_id")
    )
    
    return updated

@api_router.put("/purchase-requisitions/{requisition_id}/approve-owner")
async def approve_purchase_request_owner(requisition_id: str, approval_data: Dict[str, Any]):
    """Owner approves a purchase requisition (for amounts above admin threshold)
    
    After owner approval, request goes to Finance for payment processing.
    """
    
    requisition = await db.purchase_requisitions.find_one({"id": requisition_id}, {"_id": 0})
    
    if not requisition:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    estimated_cost = requisition.get("estimated_cost", 0)
    
    result = await db.purchase_requisitions.update_one(
        {"id": requisition_id},
        {"$set": {
            "status": "owner_approved",
            "owner_approved_at": datetime.now(timezone.utc).isoformat(),
            "owner_approved_by": approval_data.get("approved_by", "Owner"),
            "owner_notes": approval_data.get("notes", ""),
            "next_step": "finance_payment"
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    # Get updated requisition
    updated = await db.purchase_requisitions.find_one({"id": requisition_id}, {"_id": 0})
    
    await log_activity(
        "Owner", 
        "approval", 
        f"Approved purchase requisition {requisition_id} (Br {estimated_cost:,.2f}) - Sent to Finance for payment", 
        branch=updated.get("branch_id")
    )
    
    return updated

@api_router.put("/purchase-requisitions/{requisition_id}/reject")
async def reject_purchase_requisition(requisition_id: str, rejection_data: Dict[str, Any]):
    """Reject a purchase requisition"""
    
    result = await db.purchase_requisitions.update_one(
        {"id": requisition_id},
        {"$set": {
            "status": "rejected",
            "rejected_at": datetime.now(timezone.utc).isoformat(),
            "rejected_by": rejection_data.get("rejected_by", "Unknown"),
            "rejection_reason": rejection_data.get("reason", "No reason provided")
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    # Get updated requisition
    updated = await db.purchase_requisitions.find_one({"id": requisition_id}, {"_id": 0})
    
    await log_activity("System", "rejection", f"Rejected purchase requisition {requisition_id}")
    
    return updated

# ==================== MANAGER MODULE ====================

@api_router.get("/inventory-requests/manager-queue")
async def get_manager_queue(branch_id: Optional[str] = None):
    """Get inventory/purchase requests for manager approval"""
    query = {"status": "pending"}
    if branch_id:
        query["branch_id"] = branch_id
    
    requests = await db.purchase_requisitions.find(query, {"_id": 0}).to_list(100)
    return requests

@api_router.post("/inventory-requests/{order_id}/approve")
async def approve_manager_request(order_id: str, approval_data: Dict[str, Any]):
    """Manager approves an inventory request"""
    
    result = await db.purchase_requisitions.update_one(
        {"id": order_id},
        {"$set": {
            "status": "manager_approved",
            "manager_approved_at": datetime.now(timezone.utc).isoformat(),
            "approved_by_manager": approval_data.get("approved_by")
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    
    return {"success": True}

@api_router.post("/wheat-deliveries")
async def create_wheat_delivery(delivery_data: Dict[str, Any]):
    """Record wheat delivery"""
    
    delivery = {
        "id": str(uuid.uuid4()),
        "delivery_number": f"WD-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "branch_id": delivery_data.get("branch_id"),
        "supplier": delivery_data.get("supplier"),
        "quantity_kg": delivery_data.get("quantity_kg"),
        "unit_cost": delivery_data.get("unit_cost"),
        "total_cost": delivery_data.get("quantity_kg", 0) * delivery_data.get("unit_cost", 0),
        "delivery_date": delivery_data.get("delivery_date"),
        "received_by": delivery_data.get("received_by"),
        "notes": delivery_data.get("notes", ""),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Make a copy for response
    response_data = delivery.copy()
    
    await db.wheat_deliveries.insert_one(delivery)
    
    # Update raw wheat inventory
    await db.inventory.update_one(
        {"name": "Raw Wheat", "branch_id": delivery_data.get("branch_id")},
        {"$inc": {"quantity": delivery_data.get("quantity_kg", 0)}}
    )
    
    await log_activity("Manager", "wheat_delivery", f"Recorded wheat delivery {delivery['delivery_number']}", branch=delivery_data.get("branch_id"))
    
    return response_data

@api_router.post("/milling-orders")
async def create_milling_order(order_data: Dict[str, Any]):
    """Create a milling order (converts raw wheat to flour)"""
    
    branch_id = order_data.get("branch_id")
    # Accept both field names
    raw_wheat_kg = order_data.get("raw_wheat_kg") or order_data.get("raw_wheat_input_kg", 0)
    output_product = order_data.get("output_product", "Bread Flour - 25kg")
    
    # Calculate flour output (assume 85% conversion rate - 15% loss to bran)
    flour_output_kg = raw_wheat_kg * 0.85
    
    # Check if auto_complete flag is set (for backward compatibility)
    auto_complete = order_data.get("auto_complete", False)
    
    milling_order = {
        "id": str(uuid.uuid4()),
        "order_number": f"MO-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:4]}",
        "branch_id": branch_id,
        "raw_wheat_kg": raw_wheat_kg,
        "raw_wheat_input_kg": raw_wheat_kg,  # For compatibility with test
        "output_product": output_product,
        "expected_flour_output_kg": flour_output_kg,
        "flour_output_kg": flour_output_kg if auto_complete else 0,
        "conversion_rate": 0.85,
        "mill_operator": order_data.get("mill_operator", "Unknown"),
        "created_by": order_data.get("created_by", "Manager"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "completed" if auto_complete else "pending",
        "notes": order_data.get("notes", "")
    }
    
    # Make a copy for response
    response_data = milling_order.copy()
    
    await db.milling_orders.insert_one(milling_order)
    
    # Check if raw wheat exists first
    raw_wheat_item = await db.inventory.find_one(
        {"name": "Raw Wheat", "branch_id": branch_id},
        {"_id": 0}
    )
    
    if not raw_wheat_item:
        raise HTTPException(status_code=400, detail=f"Raw wheat not found in {branch_id} branch inventory")
    
    if raw_wheat_item.get("quantity", 0) < raw_wheat_kg:
        raise HTTPException(status_code=400, detail=f"Insufficient raw wheat. Available: {raw_wheat_item.get('quantity', 0)}kg, Required: {raw_wheat_kg}kg")
    
    # Deduct raw wheat
    await db.inventory.update_one(
        {"name": "Raw Wheat", "branch_id": branch_id},
        {"$inc": {"quantity": -raw_wheat_kg}}
    )
    
    # Add finished flour only if auto_complete is true
    if auto_complete:
        # Try to find existing flour product or create new
        flour_product = await db.inventory.find_one(
            {"name": output_product, "branch_id": branch_id},
            {"_id": 0}
        )
        
        if flour_product:
            # Update existing
            await db.inventory.update_one(
                {"id": flour_product["id"]},
                {"$inc": {"quantity": flour_output_kg}}
            )
        else:
            # Create new flour product
            new_flour = {
                "id": str(uuid.uuid4()),
                "name": output_product,
                "category": "Finished Product",
                "quantity": flour_output_kg,
                "unit": "kg",
                "branch_id": branch_id,
                "unit_cost": 35,
                "actual_unit_cost": 32,
                "current_unit_cost": 35,
                "unit_selling_price": 45,
                "reorder_level": 1000,
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
            await db.inventory.insert_one(new_flour)
    
    await log_activity(
        "Manager", 
        "milling", 
        f"Milling order {milling_order['order_number']}: {raw_wheat_kg}kg wheat → {flour_output_kg}kg flour", 
        branch=branch_id
    )
    
    return response_data

@api_router.get("/milling-orders")
async def get_milling_orders(
    branch_id: Optional[str] = None,
    status: Optional[str] = None
):
    """Get milling orders with optional filters"""
    query = {}
    if branch_id:
        query["branch_id"] = branch_id
    if status:
        query["status"] = status
    
    orders = await db.milling_orders.find(query, {"_id": 0}).to_list(1000)
    return orders

@api_router.post("/milling-orders/{order_id}/complete")
async def complete_milling_order(order_id: str, completion_data: Dict[str, Any]):
    """Complete a milling order with actual output data"""
    
    # Get the order
    order = await db.milling_orders.find_one({"id": order_id}, {"_id": 0})
    
    if not order:
        raise HTTPException(status_code=404, detail="Milling order not found")
    
    outputs = completion_data.get("outputs", [])
    
    # Calculate total from outputs (support both formats)
    total_flour_output = 0
    for output in outputs:
        qty = output.get("quantity_kg") or output.get("quantity", 0)
        total_flour_output += qty
    
    # Update order status
    current_time = datetime.now(timezone.utc).isoformat()
    
    await db.milling_orders.update_one(
        {"id": order_id},
        {"$set": {
            "status": "completed",
            "completed_at": current_time,
            "outputs": outputs,
            "flour_output_kg": total_flour_output
        }}
    )
    
    # Add flour products to inventory
    branch_id = order.get("branch_id")
    
    for output in outputs:
        # Support both formats: product_name/quantity_kg OR product_id/quantity
        product_id = output.get("product_id")
        product_name = output.get("product_name")
        quantity = output.get("quantity_kg") or output.get("quantity", 0)
        
        if quantity <= 0:
            continue
        
        # Update by product_id if provided
        if product_id:
            result = await db.inventory.update_one(
                {"id": product_id, "branch_id": branch_id},
                {"$inc": {"quantity": quantity}}
            )
            
            if result.modified_count == 0:
                # Product not found by ID, skip
                continue
        # Otherwise update by name
        elif product_name:
            existing_product = await db.inventory.find_one(
                {"name": product_name, "branch_id": branch_id},
                {"_id": 0}
            )
            
            if existing_product:
                # Update existing
                await db.inventory.update_one(
                    {"id": existing_product["id"]},
                    {"$inc": {"quantity": quantity}}
                )
            else:
                # Create new product
                new_product = {
                    "id": str(uuid.uuid4()),
                    "name": product_name,
                    "category": "Finished Product",
                    "quantity": quantity,
                    "unit": "kg",
                    "branch_id": branch_id,
                    "unit_cost": output.get("unit_cost", 35),
                    "actual_unit_cost": 32,
                    "current_unit_cost": output.get("unit_cost", 35),
                    "unit_selling_price": output.get("unit_selling_price", 45),
                    "reorder_level": 1000,
                    "last_updated": current_time
                }
                await db.inventory.insert_one(new_product)
    
    await log_activity(
        "Manager",
        "milling_complete",
        f"Completed milling order {order.get('order_number')}: {total_flour_output}kg flour produced",
        branch=branch_id
    )
    
    # Get updated order
    updated_order = await db.milling_orders.find_one({"id": order_id}, {"_id": 0})
    
    return updated_order

# ==================== SETTINGS ====================

@api_router.get("/settings/financial-controls")
async def get_financial_controls():
    """Get financial control settings"""
    controls = await db.financial_controls.find_one({}, {"_id": 0})
    
    if not controls:
        controls = FinancialControls().model_dump()
        await db.financial_controls.insert_one(controls)
    
    return controls

@api_router.put("/settings/financial-controls")
async def update_financial_controls(controls_data: Dict[str, Any]):
    """Update financial control settings"""
    
    controls_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.financial_controls.update_one(
        {},
        {"$set": controls_data},
        upsert=True
    )
    
    return {"success": True, "controls": controls_data}

# ==================== INCLUDE ROUTER ====================

app.include_router(api_router)

# ==================== STARTUP EVENT ====================

@app.on_event("startup")
async def startup_event():
    logger.info("Starting KushuKushu ERP API...")
    await initialize_sample_data()
    logger.info("Sample data initialized")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down KushuKushu ERP API...")
    client.close()
