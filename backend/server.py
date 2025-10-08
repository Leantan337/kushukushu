from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Enums for status tracking
class StockLevel(str, Enum):
    OK = "ok"
    LOW = "low"
    CRITICAL = "critical"

class PurchaseRequisitionStatus(str, Enum):
    PENDING = "pending"
    MANAGER_APPROVED = "manager_approved"
    ADMIN_APPROVED = "admin_approved"
    OWNER_APPROVED = "owner_approved"
    PURCHASED = "purchased"
    REJECTED = "rejected"

class InternalOrderStatus(str, Enum):
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    FULFILLED = "fulfilled"
    REJECTED = "rejected"

class StockAdjustmentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class ManagerApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class MillingOrderStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class QualityRating(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    AVERAGE = "average"
    POOR = "poor"

class PaymentType(str, Enum):
    CASH = "cash"
    CHECK = "check"
    TRANSFER = "transfer"
    LOAN = "loan"

class TransactionStatus(str, Enum):
    PAID = "paid"
    UNPAID = "unpaid"

class UserRole(str, Enum):
    SALES = "sales"
    MANAGER = "manager"
    ADMIN = "admin"
    OWNER = "owner"
    STORE_KEEPER = "store_keeper"


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


# Inventory Models
class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    type: str  # "in" or "out"
    quantity: float
    reference: str  # e.g., "Milling Order #58", "Sales Request #101"
    performed_by: str

class InventoryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    quantity: float  # in kg
    unit: str = "kg"
    stock_level: StockLevel = StockLevel.OK
    low_threshold: float = 5000.0
    critical_threshold: float = 2000.0
    transactions: List[Transaction] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InventoryItemCreate(BaseModel):
    name: str
    quantity: float
    unit: str = "kg"
    low_threshold: float = 5000.0
    critical_threshold: float = 2000.0

class InventoryItemUpdate(BaseModel):
    quantity: Optional[float] = None
    low_threshold: Optional[float] = None
    critical_threshold: Optional[float] = None


# Stock Adjustment Models
class StockAdjustmentRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    inventory_item_id: str
    inventory_item_name: str
    adjustment_amount: float
    reason: str
    requested_by: str
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: StockAdjustmentStatus = StockAdjustmentStatus.PENDING
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None

class StockAdjustmentCreate(BaseModel):
    inventory_item_id: str
    adjustment_amount: float
    reason: str
    requested_by: str

class StockAdjustmentReview(BaseModel):
    status: StockAdjustmentStatus
    reviewed_by: str
    review_notes: Optional[str] = None


# Purchase Requisition Models
class ApprovalRecord(BaseModel):
    approved_by: str
    approved_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None

class PurchaseRequisition(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request_number: str
    description: str
    estimated_cost: float
    reason: str
    requested_by: str
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: PurchaseRequisitionStatus = PurchaseRequisitionStatus.PENDING
    manager_approval: Optional[ApprovalRecord] = None
    admin_approval: Optional[ApprovalRecord] = None
    owner_approval: Optional[ApprovalRecord] = None
    rejection_reason: Optional[str] = None
    rejected_by: Optional[str] = None
    rejected_at: Optional[datetime] = None
    purchased_at: Optional[datetime] = None

class PurchaseRequisitionCreate(BaseModel):
    description: str
    estimated_cost: float
    reason: str
    requested_by: str

class PurchaseRequisitionApproval(BaseModel):
    approved_by: str
    notes: Optional[str] = None

class PurchaseRequisitionRejection(BaseModel):
    rejected_by: str
    reason: str


# Internal Order Requisition Models
class InternalOrderRequisition(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request_number: str
    product_name: str  # e.g., "1st Quality Flour", "Bread Flour"
    package_size: str  # e.g., "50kg", "25kg", "10kg", "5kg"
    quantity: int  # number of packages
    total_weight: float  # total kg = quantity * package_size
    requested_by: str
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: InternalOrderStatus = InternalOrderStatus.PENDING_APPROVAL
    manager_approval_status: ManagerApprovalStatus = ManagerApprovalStatus.PENDING
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    fulfilled_by: Optional[str] = None
    fulfilled_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    rejected_by: Optional[str] = None
    rejected_at: Optional[datetime] = None

class InternalOrderCreate(BaseModel):
    product_name: str
    package_size: str
    quantity: int
    requested_by: str

class InternalOrderApproval(BaseModel):
    approved_by: str

class InternalOrderRejection(BaseModel):
    rejected_by: str
    reason: str

class InternalOrderFulfillment(BaseModel):
    fulfilled_by: str

class ManagerApproval(BaseModel):
    approved_by: str


# Manager Role Models
class RawWheatDelivery(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    supplier_name: str
    quantity_kg: float
    quality_rating: QualityRating
    manager_id: str
    branch_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RawWheatDeliveryCreate(BaseModel):
    supplier_name: str
    quantity_kg: float
    quality_rating: QualityRating
    manager_id: str
    branch_id: str

class MillingOrder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: MillingOrderStatus = MillingOrderStatus.PENDING
    raw_wheat_input_kg: float
    manager_id: str
    branch_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MillingOrderCreate(BaseModel):
    raw_wheat_input_kg: float
    manager_id: str
    branch_id: str

class MillingOrderOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    milling_order_id: str
    product_id: str
    product_name: str
    output_quantity_kg: float

class MillingOrderOutputCreate(BaseModel):
    product_id: str
    quantity: float

class MillingOrderCompletion(BaseModel):
    outputs: List[MillingOrderOutputCreate]


# Audit Log Model
class AuditLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user: str
    action: str
    entity_type: str
    entity_id: str
    details: Dict
    ip_address: Optional[str] = None


# Sales Models
class SalesTransactionItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    product_name: str
    quantity_kg: float
    unit_price: float
    total_price: float  # quantity_kg * unit_price

class SalesTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transaction_number: str
    items: List[SalesTransactionItem]
    total_amount: float
    payment_type: PaymentType
    status: TransactionStatus
    sales_person_id: str
    sales_person_name: str
    branch_id: str
    customer_id: Optional[str] = None  # Required for loan transactions
    customer_name: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SalesTransactionCreate(BaseModel):
    items: List[Dict]  # List of {product_id, product_name, quantity_kg, unit_price}
    payment_type: PaymentType
    sales_person_id: str
    sales_person_name: str
    branch_id: str
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None

class SalesReportQuery(BaseModel):
    period: Optional[str] = "daily"  # daily, weekly, monthly
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    sales_person_id: Optional[str] = None


# Helper function to serialize datetime fields
def serialize_datetime(doc):
    if isinstance(doc, dict):
        for key, value in doc.items():
            if isinstance(value, datetime):
                doc[key] = value.isoformat()
            elif isinstance(value, dict):
                serialize_datetime(value)
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict):
                        serialize_datetime(item)
    return doc

# Helper function to deserialize datetime fields
def deserialize_datetime(doc):
    if isinstance(doc, dict):
        for key, value in doc.items():
            if isinstance(value, str) and 'T' in value:
                try:
                    doc[key] = datetime.fromisoformat(value)
                except ValueError:
                    pass
            elif isinstance(value, dict):
                deserialize_datetime(value)
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict):
                        deserialize_datetime(item)
    return doc

# Helper function to determine stock level
def calculate_stock_level(quantity: float, low_threshold: float, critical_threshold: float) -> StockLevel:
    if quantity <= critical_threshold:
        return StockLevel.CRITICAL
    elif quantity <= low_threshold:
        return StockLevel.LOW
    return StockLevel.OK


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# ==================== INVENTORY MANAGEMENT ENDPOINTS ====================

@api_router.get("/inventory", response_model=List[InventoryItem])
async def get_inventory():
    """Get all inventory items"""
    items = await db.inventory.find({}, {"_id": 0}).to_list(1000)
    for item in items:
        deserialize_datetime(item)
    return items

@api_router.get("/inventory/{item_id}", response_model=InventoryItem)
async def get_inventory_item(item_id: str):
    """Get a specific inventory item with transaction history"""
    item = await db.inventory.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    deserialize_datetime(item)
    return item

@api_router.post("/inventory", response_model=InventoryItem)
async def create_inventory_item(item: InventoryItemCreate):
    """Create a new inventory item"""
    inventory_item = InventoryItem(**item.model_dump())
    inventory_item.stock_level = calculate_stock_level(
        inventory_item.quantity,
        inventory_item.low_threshold,
        inventory_item.critical_threshold
    )
    
    doc = inventory_item.model_dump()
    serialize_datetime(doc)
    
    await db.inventory.insert_one(doc)
    
    # Create audit log
    audit_log = AuditLog(
        user="system",
        action="create_inventory_item",
        entity_type="inventory",
        entity_id=inventory_item.id,
        details={"name": inventory_item.name, "quantity": inventory_item.quantity}
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    return inventory_item

@api_router.put("/inventory/{item_id}", response_model=InventoryItem)
async def update_inventory_item(item_id: str, update: InventoryItemUpdate):
    """Update inventory item thresholds"""
    item = await db.inventory.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        # Recalculate stock level if quantity or thresholds changed
        if "quantity" in update_data:
            quantity = update_data["quantity"]
            low_threshold = update_data.get("low_threshold", item.get("low_threshold", 5000))
            critical_threshold = update_data.get("critical_threshold", item.get("critical_threshold", 2000))
            update_data["stock_level"] = calculate_stock_level(quantity, low_threshold, critical_threshold)
        
        await db.inventory.update_one({"id": item_id}, {"$set": update_data})
    
    updated_item = await db.inventory.find_one({"id": item_id}, {"_id": 0})
    deserialize_datetime(updated_item)
    return updated_item

@api_router.post("/inventory/{item_id}/transaction")
async def add_inventory_transaction(item_id: str, transaction_type: str, quantity: float, reference: str, performed_by: str):
    """Add a transaction to inventory item (internal use)"""
    item = await db.inventory.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    transaction = Transaction(
        type=transaction_type,
        quantity=quantity,
        reference=reference,
        performed_by=performed_by
    )
    
    # Update quantity
    new_quantity = item["quantity"]
    if transaction_type == "in":
        new_quantity += quantity
    else:  # "out"
        new_quantity -= quantity
        if new_quantity < 0:
            raise HTTPException(status_code=400, detail="Insufficient inventory")
    
    # Calculate new stock level
    stock_level = calculate_stock_level(
        new_quantity,
        item.get("low_threshold", 5000),
        item.get("critical_threshold", 2000)
    )
    
    # Update database
    await db.inventory.update_one(
        {"id": item_id},
        {
            "$set": {
                "quantity": new_quantity,
                "stock_level": stock_level,
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$push": {"transactions": serialize_datetime(transaction.model_dump())}
        }
    )
    
    # Create audit log
    audit_log = AuditLog(
        user=performed_by,
        action=f"inventory_transaction_{transaction_type}",
        entity_type="inventory",
        entity_id=item_id,
        details={"quantity": quantity, "reference": reference, "new_quantity": new_quantity}
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    return {"success": True, "new_quantity": new_quantity, "stock_level": stock_level}


# ==================== STOCK ADJUSTMENT ENDPOINTS ====================

@api_router.get("/stock-adjustments", response_model=List[StockAdjustmentRequest])
async def get_stock_adjustments(status: Optional[StockAdjustmentStatus] = None):
    """Get all stock adjustment requests, optionally filtered by status"""
    query = {}
    if status:
        query["status"] = status
    
    adjustments = await db.stock_adjustments.find(query, {"_id": 0}).to_list(1000)
    for adjustment in adjustments:
        deserialize_datetime(adjustment)
    return adjustments

@api_router.post("/stock-adjustments", response_model=StockAdjustmentRequest)
async def create_stock_adjustment(adjustment: StockAdjustmentCreate):
    """Create a stock adjustment request"""
    # Verify inventory item exists
    item = await db.inventory.find_one({"id": adjustment.inventory_item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    # Generate request number
    count = await db.stock_adjustments.count_documents({})
    request_number = f"SA-{count + 1:05d}"
    
    adjustment_request = StockAdjustmentRequest(
        **adjustment.model_dump(),
        inventory_item_name=item["name"]
    )
    
    doc = adjustment_request.model_dump()
    doc["request_number"] = request_number
    serialize_datetime(doc)
    
    await db.stock_adjustments.insert_one(doc)
    
    # Create audit log
    audit_log = AuditLog(
        user=adjustment.requested_by,
        action="create_stock_adjustment_request",
        entity_type="stock_adjustment",
        entity_id=adjustment_request.id,
        details={
            "inventory_item": item["name"],
            "adjustment_amount": adjustment.adjustment_amount,
            "reason": adjustment.reason
        }
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    return adjustment_request

@api_router.put("/stock-adjustments/{adjustment_id}/review", response_model=StockAdjustmentRequest)
async def review_stock_adjustment(adjustment_id: str, review: StockAdjustmentReview):
    """Approve or reject a stock adjustment request"""
    adjustment = await db.stock_adjustments.find_one({"id": adjustment_id}, {"_id": 0})
    if not adjustment:
        raise HTTPException(status_code=404, detail="Stock adjustment request not found")
    
    if adjustment["status"] != StockAdjustmentStatus.PENDING:
        raise HTTPException(status_code=400, detail="Adjustment already reviewed")
    
    update_data = {
        "status": review.status,
        "reviewed_by": review.reviewed_by,
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
        "review_notes": review.review_notes
    }
    
    await db.stock_adjustments.update_one({"id": adjustment_id}, {"$set": update_data})
    
    # If approved, apply the adjustment
    if review.status == StockAdjustmentStatus.APPROVED:
        await add_inventory_transaction(
            adjustment["inventory_item_id"],
            "in" if adjustment["adjustment_amount"] > 0 else "out",
            abs(adjustment["adjustment_amount"]),
            f"Stock Adjustment #{adjustment_id[:8]}",
            review.reviewed_by
        )
    
    # Create audit log
    audit_log = AuditLog(
        user=review.reviewed_by,
        action=f"stock_adjustment_{review.status}",
        entity_type="stock_adjustment",
        entity_id=adjustment_id,
        details={"status": review.status, "notes": review.review_notes}
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    updated_adjustment = await db.stock_adjustments.find_one({"id": adjustment_id}, {"_id": 0})
    deserialize_datetime(updated_adjustment)
    return updated_adjustment


# ==================== PURCHASE REQUISITION ENDPOINTS ====================

@api_router.get("/purchase-requisitions", response_model=List[PurchaseRequisition])
async def get_purchase_requisitions(status: Optional[PurchaseRequisitionStatus] = None):
    """Get all purchase requisitions, optionally filtered by status"""
    query = {}
    if status:
        query["status"] = status
    
    requisitions = await db.purchase_requisitions.find(query, {"_id": 0}).to_list(1000)
    for req in requisitions:
        deserialize_datetime(req)
    return requisitions

@api_router.get("/purchase-requisitions/{req_id}", response_model=PurchaseRequisition)
async def get_purchase_requisition(req_id: str):
    """Get a specific purchase requisition"""
    req = await db.purchase_requisitions.find_one({"id": req_id}, {"_id": 0})
    if not req:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    deserialize_datetime(req)
    return req

@api_router.post("/purchase-requisitions", response_model=PurchaseRequisition)
async def create_purchase_requisition(requisition: PurchaseRequisitionCreate):
    """Create a new purchase requisition"""
    # Generate request number
    count = await db.purchase_requisitions.count_documents({})
    request_number = f"PR-{count + 1:05d}"
    
    purchase_req = PurchaseRequisition(
        **requisition.model_dump(),
        request_number=request_number
    )
    
    doc = purchase_req.model_dump()
    serialize_datetime(doc)
    
    await db.purchase_requisitions.insert_one(doc)
    
    # Create audit log
    audit_log = AuditLog(
        user=requisition.requested_by,
        action="create_purchase_requisition",
        entity_type="purchase_requisition",
        entity_id=purchase_req.id,
        details={
            "description": requisition.description,
            "estimated_cost": requisition.estimated_cost
        }
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    return purchase_req

@api_router.put("/purchase-requisitions/{req_id}/approve-manager", response_model=PurchaseRequisition)
async def approve_purchase_requisition_manager(req_id: str, approval: PurchaseRequisitionApproval):
    """Manager approves purchase requisition"""
    req = await db.purchase_requisitions.find_one({"id": req_id}, {"_id": 0})
    if not req:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    if req["status"] != PurchaseRequisitionStatus.PENDING:
        raise HTTPException(status_code=400, detail="Requisition not in pending state")
    
    approval_record = ApprovalRecord(
        approved_by=approval.approved_by,
        notes=approval.notes
    )
    
    update_data = {
        "status": PurchaseRequisitionStatus.MANAGER_APPROVED,
        "manager_approval": serialize_datetime(approval_record.model_dump())
    }
    
    await db.purchase_requisitions.update_one({"id": req_id}, {"$set": update_data})
    
    # Create audit log
    audit_log = AuditLog(
        user=approval.approved_by,
        action="approve_purchase_requisition_manager",
        entity_type="purchase_requisition",
        entity_id=req_id,
        details={"notes": approval.notes}
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    updated_req = await db.purchase_requisitions.find_one({"id": req_id}, {"_id": 0})
    deserialize_datetime(updated_req)
    return updated_req

@api_router.put("/purchase-requisitions/{req_id}/approve-admin", response_model=PurchaseRequisition)
async def approve_purchase_requisition_admin(req_id: str, approval: PurchaseRequisitionApproval):
    """Admin approves purchase requisition"""
    req = await db.purchase_requisitions.find_one({"id": req_id}, {"_id": 0})
    if not req:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    if req["status"] != PurchaseRequisitionStatus.MANAGER_APPROVED:
        raise HTTPException(status_code=400, detail="Requisition must be manager approved first")
    
    approval_record = ApprovalRecord(
        approved_by=approval.approved_by,
        notes=approval.notes
    )
    
    update_data = {
        "status": PurchaseRequisitionStatus.ADMIN_APPROVED,
        "admin_approval": serialize_datetime(approval_record.model_dump())
    }
    
    await db.purchase_requisitions.update_one({"id": req_id}, {"$set": update_data})
    
    # Create audit log
    audit_log = AuditLog(
        user=approval.approved_by,
        action="approve_purchase_requisition_admin",
        entity_type="purchase_requisition",
        entity_id=req_id,
        details={"notes": approval.notes}
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    updated_req = await db.purchase_requisitions.find_one({"id": req_id}, {"_id": 0})
    deserialize_datetime(updated_req)
    return updated_req

@api_router.put("/purchase-requisitions/{req_id}/approve-owner", response_model=PurchaseRequisition)
async def approve_purchase_requisition_owner(req_id: str, approval: PurchaseRequisitionApproval):
    """Owner approves purchase requisition"""
    req = await db.purchase_requisitions.find_one({"id": req_id}, {"_id": 0})
    if not req:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    if req["status"] != PurchaseRequisitionStatus.ADMIN_APPROVED:
        raise HTTPException(status_code=400, detail="Requisition must be admin approved first")
    
    approval_record = ApprovalRecord(
        approved_by=approval.approved_by,
        notes=approval.notes
    )
    
    update_data = {
        "status": PurchaseRequisitionStatus.OWNER_APPROVED,
        "owner_approval": serialize_datetime(approval_record.model_dump())
    }
    
    await db.purchase_requisitions.update_one({"id": req_id}, {"$set": update_data})
    
    # Create audit log
    audit_log = AuditLog(
        user=approval.approved_by,
        action="approve_purchase_requisition_owner",
        entity_type="purchase_requisition",
        entity_id=req_id,
        details={"notes": approval.notes}
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    updated_req = await db.purchase_requisitions.find_one({"id": req_id}, {"_id": 0})
    deserialize_datetime(updated_req)
    return updated_req

@api_router.put("/purchase-requisitions/{req_id}/mark-purchased", response_model=PurchaseRequisition)
async def mark_purchase_requisition_purchased(req_id: str, user: str):
    """Mark purchase requisition as purchased"""
    req = await db.purchase_requisitions.find_one({"id": req_id}, {"_id": 0})
    if not req:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    if req["status"] != PurchaseRequisitionStatus.OWNER_APPROVED:
        raise HTTPException(status_code=400, detail="Requisition must be owner approved first")
    
    update_data = {
        "status": PurchaseRequisitionStatus.PURCHASED,
        "purchased_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.purchase_requisitions.update_one({"id": req_id}, {"$set": update_data})
    
    # Create audit log
    audit_log = AuditLog(
        user=user,
        action="mark_purchase_requisition_purchased",
        entity_type="purchase_requisition",
        entity_id=req_id,
        details={}
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    updated_req = await db.purchase_requisitions.find_one({"id": req_id}, {"_id": 0})
    deserialize_datetime(updated_req)
    return updated_req

@api_router.put("/purchase-requisitions/{req_id}/reject", response_model=PurchaseRequisition)
async def reject_purchase_requisition(req_id: str, rejection: PurchaseRequisitionRejection):
    """Reject a purchase requisition"""
    req = await db.purchase_requisitions.find_one({"id": req_id}, {"_id": 0})
    if not req:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    if req["status"] in [PurchaseRequisitionStatus.PURCHASED, PurchaseRequisitionStatus.REJECTED]:
        raise HTTPException(status_code=400, detail="Cannot reject completed or already rejected requisition")
    
    update_data = {
        "status": PurchaseRequisitionStatus.REJECTED,
        "rejection_reason": rejection.reason,
        "rejected_by": rejection.rejected_by,
        "rejected_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.purchase_requisitions.update_one({"id": req_id}, {"$set": update_data})
    
    # Create audit log
    audit_log = AuditLog(
        user=rejection.rejected_by,
        action="reject_purchase_requisition",
        entity_type="purchase_requisition",
        entity_id=req_id,
        details={"reason": rejection.reason}
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    updated_req = await db.purchase_requisitions.find_one({"id": req_id}, {"_id": 0})
    deserialize_datetime(updated_req)
    return updated_req


# ==================== INTERNAL ORDER REQUISITION ENDPOINTS ====================

@api_router.get("/internal-orders", response_model=List[InternalOrderRequisition])
async def get_internal_orders(status: Optional[InternalOrderStatus] = None):
    """Get all internal order requisitions, optionally filtered by status"""
    query = {}
    if status:
        query["status"] = status
    
    orders = await db.internal_orders.find(query, {"_id": 0}).to_list(1000)
    for order in orders:
        deserialize_datetime(order)
    return orders

@api_router.get("/internal-orders/{order_id}", response_model=InternalOrderRequisition)
async def get_internal_order(order_id: str):
    """Get a specific internal order requisition"""
    order = await db.internal_orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Internal order not found")
    deserialize_datetime(order)
    return order

@api_router.post("/internal-orders", response_model=InternalOrderRequisition)
async def create_internal_order(order: InternalOrderCreate):
    """Create a new internal order requisition (flour request)"""
    # Generate request number
    count = await db.internal_orders.count_documents({})
    request_number = f"IO-{count + 1:05d}"
    
    # Calculate total weight
    package_size_kg = float(order.package_size.replace("kg", ""))
    total_weight = package_size_kg * order.quantity
    
    internal_order = InternalOrderRequisition(
        **order.model_dump(),
        request_number=request_number,
        total_weight=total_weight
    )
    
    doc = internal_order.model_dump()
    serialize_datetime(doc)
    
    await db.internal_orders.insert_one(doc)
    
    # Create audit log
    audit_log = AuditLog(
        user=order.requested_by,
        action="create_internal_order",
        entity_type="internal_order",
        entity_id=internal_order.id,
        details={
            "product": order.product_name,
            "quantity": order.quantity,
            "package_size": order.package_size,
            "total_weight": total_weight
        }
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    return internal_order

@api_router.put("/internal-orders/{order_id}/approve", response_model=InternalOrderRequisition)
async def approve_internal_order(order_id: str, approval: InternalOrderApproval):
    """Approve an internal order requisition"""
    order = await db.internal_orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Internal order not found")
    
    if order["status"] != InternalOrderStatus.PENDING_APPROVAL:
        raise HTTPException(status_code=400, detail="Order not in pending approval state")
    
    update_data = {
        "status": InternalOrderStatus.APPROVED,
        "approved_by": approval.approved_by,
        "approved_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.internal_orders.update_one({"id": order_id}, {"$set": update_data})
    
    # Create audit log
    audit_log = AuditLog(
        user=approval.approved_by,
        action="approve_internal_order",
        entity_type="internal_order",
        entity_id=order_id,
        details={}
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    updated_order = await db.internal_orders.find_one({"id": order_id}, {"_id": 0})
    deserialize_datetime(updated_order)
    return updated_order

@api_router.put("/internal-orders/{order_id}/fulfill", response_model=InternalOrderRequisition)
async def fulfill_internal_order(order_id: str, fulfillment: InternalOrderFulfillment):
    """Fulfill an internal order (auto-deduct from inventory)"""
    order = await db.internal_orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Internal order not found")
    
    if order["status"] != InternalOrderStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Order must be approved before fulfillment")
    
    # Find the inventory item for this product
    inventory_item = await db.inventory.find_one({"name": order["product_name"]}, {"_id": 0})
    if not inventory_item:
        raise HTTPException(status_code=404, detail=f"Inventory item '{order['product_name']}' not found")
    
    # Check if enough inventory
    if inventory_item["quantity"] < order["total_weight"]:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient inventory. Available: {inventory_item['quantity']}kg, Required: {order['total_weight']}kg"
        )
    
    # Deduct from inventory
    await add_inventory_transaction(
        inventory_item["id"],
        "out",
        order["total_weight"],
        f"Internal Order {order['request_number']}",
        fulfillment.fulfilled_by
    )
    
    # Update order status
    update_data = {
        "status": InternalOrderStatus.FULFILLED,
        "fulfilled_by": fulfillment.fulfilled_by,
        "fulfilled_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.internal_orders.update_one({"id": order_id}, {"$set": update_data})
    
    # Create audit log
    audit_log = AuditLog(
        user=fulfillment.fulfilled_by,
        action="fulfill_internal_order",
        entity_type="internal_order",
        entity_id=order_id,
        details={"inventory_deducted": order["total_weight"]}
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    updated_order = await db.internal_orders.find_one({"id": order_id}, {"_id": 0})
    deserialize_datetime(updated_order)
    return updated_order

@api_router.put("/internal-orders/{order_id}/reject", response_model=InternalOrderRequisition)
async def reject_internal_order(order_id: str, rejection: InternalOrderRejection):
    """Reject an internal order requisition"""
    order = await db.internal_orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Internal order not found")
    
    if order["status"] in [InternalOrderStatus.FULFILLED, InternalOrderStatus.REJECTED]:
        raise HTTPException(status_code=400, detail="Cannot reject fulfilled or already rejected order")
    
    update_data = {
        "status": InternalOrderStatus.REJECTED,
        "rejection_reason": rejection.reason,
        "rejected_by": rejection.rejected_by,
        "rejected_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.internal_orders.update_one({"id": order_id}, {"$set": update_data})
    
    # Create audit log
    audit_log = AuditLog(
        user=rejection.rejected_by,
        action="reject_internal_order",
        entity_type="internal_order",
        entity_id=order_id,
        details={"reason": rejection.reason}
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    updated_order = await db.internal_orders.find_one({"id": order_id}, {"_id": 0})
    deserialize_datetime(updated_order)
    return updated_order


# ==================== MANAGER ROLE ENDPOINTS ====================

@api_router.post("/wheat-deliveries", response_model=RawWheatDelivery)
async def create_wheat_delivery(delivery: RawWheatDeliveryCreate):
    """Creates a new raw wheat delivery record"""
    # Create the delivery record
    wheat_delivery = RawWheatDelivery(**delivery.model_dump())
    
    doc = wheat_delivery.model_dump()
    serialize_datetime(doc)
    
    await db.raw_wheat_deliveries.insert_one(doc)
    
    # Find Raw Wheat inventory item and update stock
    raw_wheat_item = await db.inventory.find_one({"name": "Raw Wheat"}, {"_id": 0})
    if raw_wheat_item:
        # Add inventory transaction
        await add_inventory_transaction(
            raw_wheat_item["id"],
            "in",
            delivery.quantity_kg,
            f"Wheat Delivery from {delivery.supplier_name}",
            delivery.manager_id
        )
    
    # Create audit log
    audit_log = AuditLog(
        user=delivery.manager_id,
        action="create_wheat_delivery",
        entity_type="wheat_delivery",
        entity_id=wheat_delivery.id,
        details={
            "supplier_name": delivery.supplier_name,
            "quantity_kg": delivery.quantity_kg,
            "quality_rating": delivery.quality_rating,
            "branch_id": delivery.branch_id
        }
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    return wheat_delivery

@api_router.get("/inventory-requests/manager-queue", response_model=List[InternalOrderRequisition])
async def get_manager_queue():
    """Fetches all internal order requisitions pending manager approval"""
    orders = await db.internal_orders.find(
        {"manager_approval_status": ManagerApprovalStatus.PENDING}, 
        {"_id": 0}
    ).to_list(1000)
    
    for order in orders:
        deserialize_datetime(order)
    return orders

@api_router.post("/inventory-requests/{order_id}/approve")
async def approve_inventory_request(order_id: str, approval: ManagerApproval):
    """Sets manager approval status to approved for a specific request"""
    order = await db.internal_orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Internal order not found")
    
    if order["manager_approval_status"] != ManagerApprovalStatus.PENDING:
        raise HTTPException(status_code=400, detail="Order already reviewed by manager")
    
    update_data = {
        "manager_approval_status": ManagerApprovalStatus.APPROVED
    }
    
    await db.internal_orders.update_one({"id": order_id}, {"$set": update_data})
    
    # Create audit log
    audit_log = AuditLog(
        user=approval.approved_by,
        action="approve_inventory_request_manager",
        entity_type="internal_order",
        entity_id=order_id,
        details={"manager_approval": "approved"}
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    return {"success": True, "message": "Request approved by manager"}

@api_router.post("/milling-orders", response_model=MillingOrder)
async def create_milling_order(order: MillingOrderCreate):
    """Creates a new milling order and deducts raw wheat from inventory"""
    # Check if there's enough raw wheat in inventory
    raw_wheat_item = await db.inventory.find_one({"name": "Raw Wheat"}, {"_id": 0})
    if not raw_wheat_item:
        raise HTTPException(status_code=404, detail="Raw Wheat inventory item not found")
    
    if raw_wheat_item["quantity"] < order.raw_wheat_input_kg:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient raw wheat. Available: {raw_wheat_item['quantity']}kg, Required: {order.raw_wheat_input_kg}kg"
        )
    
    # Create the milling order
    milling_order = MillingOrder(**order.model_dump())
    
    doc = milling_order.model_dump()
    serialize_datetime(doc)
    
    await db.milling_orders.insert_one(doc)
    
    # Deduct raw wheat from inventory
    await add_inventory_transaction(
        raw_wheat_item["id"],
        "out",
        order.raw_wheat_input_kg,
        f"Milling Order {milling_order.id[:8]}",
        order.manager_id
    )
    
    # Create audit log
    audit_log = AuditLog(
        user=order.manager_id,
        action="create_milling_order",
        entity_type="milling_order",
        entity_id=milling_order.id,
        details={
            "raw_wheat_input_kg": order.raw_wheat_input_kg,
            "branch_id": order.branch_id
        }
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    return milling_order

@api_router.post("/milling-orders/{order_id}/complete")
async def complete_milling_order(order_id: str, completion: MillingOrderCompletion):
    """Completes milling order and adds finished products to inventory"""
    # Find the milling order
    milling_order = await db.milling_orders.find_one({"id": order_id}, {"_id": 0})
    if not milling_order:
        raise HTTPException(status_code=404, detail="Milling order not found")
    
    if milling_order["status"] != MillingOrderStatus.PENDING:
        raise HTTPException(status_code=400, detail="Milling order is not in pending status")
    
    # Process each output product
    output_records = []
    for output in completion.outputs:
        # Find the product in inventory
        product_item = await db.inventory.find_one({"id": output.product_id}, {"_id": 0})
        if not product_item:
            raise HTTPException(status_code=404, detail=f"Product with ID {output.product_id} not found")
        
        # Add to inventory
        await add_inventory_transaction(
            output.product_id,
            "in",
            output.quantity,
            f"Milling Order Output {order_id[:8]}",
            milling_order["manager_id"]
        )
        
        # Create output record
        output_record = MillingOrderOutput(
            milling_order_id=order_id,
            product_id=output.product_id,
            product_name=product_item["name"],
            output_quantity_kg=output.quantity
        )
        output_records.append(output_record.model_dump())
    
    # Store output records
    if output_records:
        serialized_outputs = [serialize_datetime(record) for record in output_records]
        await db.milling_order_outputs.insert_many(serialized_outputs)
    
    # Update milling order status to completed
    await db.milling_orders.update_one(
        {"id": order_id},
        {"$set": {"status": MillingOrderStatus.COMPLETED}}
    )
    
    # Create audit log
    audit_log = AuditLog(
        user=milling_order["manager_id"],
        action="complete_milling_order",
        entity_type="milling_order",
        entity_id=order_id,
        details={
            "outputs": [{"product_id": o.product_id, "quantity": o.quantity} for o in completion.outputs]
        }
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))
    
    return {"success": True, "message": "Milling order completed successfully", "outputs": len(completion.outputs)}


# ==================== AUDIT LOG ENDPOINTS ====================

@api_router.get("/audit-logs", response_model=List[AuditLog])
async def get_audit_logs(entity_type: Optional[str] = None, user: Optional[str] = None, limit: int = 100):
    """Get audit logs with optional filters"""
    query = {}
    if entity_type:
        query["entity_type"] = entity_type
    if user:
        query["user"] = user
    
    logs = await db.audit_logs.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    for log in logs:
        deserialize_datetime(log)
    return logs


# ==================== SALES ROLE ENDPOINTS ====================

@api_router.post("/sales-transactions", response_model=SalesTransaction)
async def create_sales_transaction(transaction: SalesTransactionCreate):
    """
    Point of Sale (POS) endpoint - Creates a new sales transaction and deducts inventory.
    Accessible only by users with 'Sales' role.
    """
    # Generate transaction number
    transaction_count = await db.sales_transactions.count_documents({})
    transaction_number = f"TXN-{transaction_count + 1:06d}"
    
    # Validate and process items
    transaction_items = []
    total_amount = 0.0
    
    for item_data in transaction.items:
        # Validate product exists in inventory
        product = await db.inventory.find_one({"id": item_data["product_id"]}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item_data['product_id']} not found")
        
        # Check sufficient stock
        if product["quantity"] < item_data["quantity_kg"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for {product['name']}. Available: {product['quantity']}kg, Requested: {item_data['quantity_kg']}kg"
            )
        
        # Create transaction item
        item_total = item_data["quantity_kg"] * item_data["unit_price"]
        transaction_item = SalesTransactionItem(
            product_id=item_data["product_id"],
            product_name=item_data["product_name"],
            quantity_kg=item_data["quantity_kg"],
            unit_price=item_data["unit_price"],
            total_price=item_total
        )
        transaction_items.append(transaction_item)
        total_amount += item_total
    
    # Determine transaction status based on payment type
    status = TransactionStatus.PAID if transaction.payment_type != PaymentType.LOAN else TransactionStatus.UNPAID
    
    # Validate customer info for loan transactions
    if transaction.payment_type == PaymentType.LOAN:
        if not transaction.customer_id or not transaction.customer_name:
            raise HTTPException(status_code=400, detail="Customer ID and name are required for loan transactions")
    
    # Create sales transaction
    sales_transaction = SalesTransaction(
        transaction_number=transaction_number,
        items=transaction_items,
        total_amount=total_amount,
        payment_type=transaction.payment_type,
        status=status,
        sales_person_id=transaction.sales_person_id,
        sales_person_name=transaction.sales_person_name,
        branch_id=transaction.branch_id,
        customer_id=transaction.customer_id,
        customer_name=transaction.customer_name
    )
    
    # Save to database
    sales_dict = sales_transaction.model_dump()
    serialize_datetime(sales_dict)
    result = await db.sales_transactions.insert_one(sales_dict)
    
    # Deduct inventory for each item
    for item_data in transaction.items:
        # Update inventory quantity
        await db.inventory.update_one(
            {"id": item_data["product_id"]},
            {
                "$inc": {"quantity": -item_data["quantity_kg"]},
                "$set": {"updated_at": datetime.now(timezone.utc)}
            }
        )
        
        # Add transaction to inventory history
        inventory_transaction = Transaction(
            type="out",
            quantity=item_data["quantity_kg"],
            reference=f"Sales Transaction {transaction_number}",
            performed_by=transaction.sales_person_name
        )
        
        await db.inventory.update_one(
            {"id": item_data["product_id"]},
            {"$push": {"transactions": inventory_transaction.model_dump()}}
        )
        
        # Update stock level
        product = await db.inventory.find_one({"id": item_data["product_id"]}, {"_id": 0})
        new_quantity = product["quantity"] - item_data["quantity_kg"]
        stock_level = StockLevel.OK
        if new_quantity <= product.get("critical_threshold", 2000.0):
            stock_level = StockLevel.CRITICAL
        elif new_quantity <= product.get("low_threshold", 5000.0):
            stock_level = StockLevel.LOW
        
        await db.inventory.update_one(
            {"id": item_data["product_id"]},
            {"$set": {"stock_level": stock_level}}
        )
        
        # Log audit trail
        await log_audit(
            user=transaction.sales_person_name,
            action="inventory_deduction",
            entity_type="sales_transaction",
            entity_id=sales_transaction.id,
            details={
                "product_id": item_data["product_id"],
                "product_name": item_data["product_name"],
                "quantity_sold": item_data["quantity_kg"],
                "transaction_number": transaction_number,
                "payment_type": transaction.payment_type.value
            }
        )
    
    # Log sales transaction audit
    await log_audit(
        user=transaction.sales_person_name,
        action="create_sales_transaction",
        entity_type="sales_transaction",
        entity_id=sales_transaction.id,
        details={
            "transaction_number": transaction_number,
            "total_amount": total_amount,
            "payment_type": transaction.payment_type.value,
            "status": status.value,
            "items_count": len(transaction_items)
        }
    )
    
    return sales_transaction


@api_router.post("/inventory-requests", response_model=InternalOrderRequisition)
async def create_inventory_request_sales(order: InternalOrderCreate):
    """
    Creates a new internal order requisition (sales team requesting flour stock).
    Accessible only by users with 'Sales' role.
    """
    # Generate request number
    request_count = await db.internal_order_requisitions.count_documents({})
    request_number = f"REQ-{request_count + 1:06d}"
    
    # Calculate total weight based on package size
    package_size_map = {
        "50kg": 50, "25kg": 25, "10kg": 10, "5kg": 5
    }
    package_weight = package_size_map.get(order.package_size, 0)
    if package_weight == 0:
        raise HTTPException(status_code=400, detail="Invalid package size")
    
    total_weight = order.quantity * package_weight
    
    # Create internal order
    internal_order = InternalOrderRequisition(
        request_number=request_number,
        product_name=order.product_name,
        package_size=order.package_size,
        quantity=order.quantity,
        total_weight=total_weight,
        requested_by=order.requested_by,
        status=InternalOrderStatus.PENDING_APPROVAL,
        manager_approval_status=ManagerApprovalStatus.PENDING
    )
    
    # Save to database
    order_dict = internal_order.model_dump()
    serialize_datetime(order_dict)
    result = await db.internal_order_requisitions.insert_one(order_dict)
    
    # Log audit trail
    await log_audit(
        user=order.requested_by,
        action="create_inventory_request",
        entity_type="internal_order_requisition",
        entity_id=internal_order.id,
        details={
            "request_number": request_number,
            "product_name": order.product_name,
            "quantity": order.quantity,
            "package_size": order.package_size,
            "total_weight": total_weight
        }
    )
    
    return internal_order


@api_router.post("/purchase-requests", response_model=PurchaseRequisition)
async def create_purchase_request_sales(requisition: PurchaseRequisitionCreate):
    """
    Creates a new purchase requisition (sales team requesting purchase of items).
    Accessible only by users with 'Sales' role.
    """
    # Generate request number
    request_count = await db.purchase_requisitions.count_documents({})
    request_number = f"PR-{request_count + 1:06d}"
    
    # Create purchase requisition
    purchase_req = PurchaseRequisition(
        request_number=request_number,
        description=requisition.description,
        estimated_cost=requisition.estimated_cost,
        reason=requisition.reason,
        requested_by=requisition.requested_by,
        status=PurchaseRequisitionStatus.PENDING
    )
    
    # Save to database
    req_dict = purchase_req.model_dump()
    serialize_datetime(req_dict)
    result = await db.purchase_requisitions.insert_one(req_dict)
    
    # Log audit trail
    await log_audit(
        user=requisition.requested_by,
        action="create_purchase_request",
        entity_type="purchase_requisition",
        entity_id=purchase_req.id,
        details={
            "request_number": request_number,
            "description": requisition.description,
            "estimated_cost": requisition.estimated_cost,
            "reason": requisition.reason
        }
    )
    
    return purchase_req


@api_router.get("/reports/sales")
async def get_sales_report(
    period: str = "daily",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    sales_person_id: Optional[str] = None
):
    """
    Fetches sales data for reports. Supports filtering by period, date range, and sales person.
    Accessible only by users with 'Sales' role.
    """
    # Build date filter
    query = {}
    
    if start_date and end_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query["timestamp"] = {"$gte": start_dt, "$lte": end_dt}
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format.")
    elif period == "daily":
        # Today's transactions
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today.replace(day=today.day + 1)
        query["timestamp"] = {"$gte": today, "$lt": tomorrow}
    elif period == "weekly":
        # Last 7 days
        week_ago = datetime.now(timezone.utc) - datetime.timedelta(days=7)
        query["timestamp"] = {"$gte": week_ago}
    elif period == "monthly":
        # Current month
        today = datetime.now(timezone.utc)
        month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        query["timestamp"] = {"$gte": month_start}
    
    if sales_person_id:
        query["sales_person_id"] = sales_person_id
    
    # Fetch transactions
    transactions = await db.sales_transactions.find(query, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    
    for transaction in transactions:
        deserialize_datetime(transaction)
    
    # Calculate summary statistics
    total_sales = sum(t.get("total_amount", 0) for t in transactions)
    total_transactions = len(transactions)
    cash_sales = sum(t.get("total_amount", 0) for t in transactions if t.get("payment_type") == "cash")
    credit_sales = sum(t.get("total_amount", 0) for t in transactions if t.get("payment_type") == "loan")
    
    # Top products sold
    product_sales = {}
    for transaction in transactions:
        for item in transaction.get("items", []):
            product_name = item.get("product_name", "Unknown")
            quantity = item.get("quantity_kg", 0)
            if product_name in product_sales:
                product_sales[product_name] += quantity
            else:
                product_sales[product_name] = quantity
    
    top_products = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "summary": {
            "period": period,
            "total_sales": total_sales,
            "total_transactions": total_transactions,
            "cash_sales": cash_sales,
            "credit_sales": credit_sales,
            "average_transaction": total_sales / max(total_transactions, 1)
        },
        "transactions": transactions,
        "top_products": [{"name": name, "quantity_sold": qty} for name, qty in top_products]
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()