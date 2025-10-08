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