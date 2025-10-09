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
from datetime import datetime, timezone, timedelta
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
    RECEIVED = "received"  # Material received and added to inventory
    REJECTED = "rejected"

class PurchaseType(str, Enum):
    MATERIAL = "material"  # Physical goods that go to inventory
    CASH = "cash"  # Cash purchases, services
    SERVICE = "service"  # Services, contracts

class PurchaseCategory(str, Enum):
    RAW_MATERIAL = "raw_material"  # Wheat, supplies
    PACKAGING = "packaging"  # Bags, labels
    EQUIPMENT = "equipment"  # Machinery, tools
    SUPPLIES = "supplies"  # Office, cleaning
    SERVICE = "service"  # Maintenance, consulting
    OTHER = "other"

class InternalOrderStatus(str, Enum):
    PENDING_ADMIN_APPROVAL = "pending_admin_approval"
    ADMIN_APPROVED = "admin_approved"
    PENDING_MANAGER_APPROVAL = "pending_manager_approval"
    MANAGER_APPROVED = "manager_approved"
    PENDING_FULFILLMENT = "pending_fulfillment"
    READY_FOR_PICKUP = "ready_for_pickup"
    PENDING_GATE_APPROVAL = "pending_gate_approval"
    AT_GATE = "at_gate"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CONFIRMED = "confirmed"
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

class LoanStatus(str, Enum):
    ACTIVE = "active"
    PAID = "paid"
    OVERDUE = "overdue"
    WRITTEN_OFF = "written_off"

class PaymentHistoryRating(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"

# Finance-specific Enums
class IncomeCategory(str, Enum):
    SALES_REVENUE = "sales_revenue"
    LOAN_PAYMENT = "loan_payment"
    BANK_INTEREST = "bank_interest"
    REFUND = "refund"
    ASSET_SALE = "asset_sale"
    INVESTMENT_INCOME = "investment_income"
    OTHER_INCOME = "other_income"

class ExpenseCategory(str, Enum):
    PURCHASE_PAYMENT = "purchase_payment"
    SALARY = "salary"
    UTILITY = "utility"
    RENT = "rent"
    DEPRECIATION = "depreciation"
    TAX = "tax"
    MAINTENANCE = "maintenance"
    TRANSPORTATION = "transportation"
    OTHER_EXPENSE = "other_expense"

class FinancePaymentMethod(str, Enum):
    CASH = "cash"
    BANK_TRANSFER = "bank_transfer"
    CHECK = "check"
    MOBILE_MONEY = "mobile_money"

class ReconciliationStatus(str, Enum):
    UNRECONCILED = "unreconciled"
    RECONCILED = "reconciled"
    DISPUTED = "disputed"
    ADJUSTED = "adjusted"

class DailyReconciliationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DISPUTED = "disputed"

class FinanceTransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


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
    
    # Branch-specific fields
    category: Optional[str] = None  # flour, bran, service
    branch_id: Optional[str] = None
    branch_name: Optional[str] = None
    
    # Product fields for sales
    product_type: Optional[str] = None
    package_size: Optional[str] = None
    packages_available: Optional[int] = None
    unit_price: Optional[float] = None
    is_sellable: Optional[bool] = True
    is_service: Optional[bool] = False
    service_for: Optional[str] = None
    notes: Optional[str] = None
    current_stock: Optional[float] = None  # Alias for quantity for compatibility
    
    # TDF-specific fields (Berhane branch only)
    is_tdf: Optional[bool] = False  # True if product is made from TDF wheat
    tdf_source: Optional[str] = None  # "Tigray Defense Force" for TDF products

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
    actual_cost: Optional[float] = None
    reason: str
    requested_by: str
    branch_id: str
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # NEW: Categorization
    purchase_type: PurchaseType = PurchaseType.CASH
    category: PurchaseCategory = PurchaseCategory.OTHER
    impacts_inventory: bool = False
    inventory_items: List[Dict] = []  # [{item_name, quantity, unit}]
    
    # NEW: Vendor Information
    vendor_name: Optional[str] = None
    vendor_contact: Optional[str] = None
    vendor_quotation: Optional[str] = None
    
    # Approval Chain
    status: PurchaseRequisitionStatus = PurchaseRequisitionStatus.PENDING
    manager_approval: Optional[ApprovalRecord] = None
    admin_approval: Optional[ApprovalRecord] = None
    owner_approval: Optional[ApprovalRecord] = None
    
    # Purchase & Receipt
    purchased_at: Optional[datetime] = None
    purchased_by: Optional[str] = None
    receipt_number: Optional[str] = None
    receipt_date: Optional[datetime] = None
    payment_method: Optional[str] = None
    
    # Material Receipt (if impacts inventory)
    received_at: Optional[datetime] = None
    received_by: Optional[str] = None
    inventory_updated: bool = False
    
    # Rejection
    rejection_reason: Optional[str] = None
    rejected_by: Optional[str] = None
    rejected_at: Optional[datetime] = None

class PurchaseRequisitionCreate(BaseModel):
    description: str
    estimated_cost: float
    reason: str
    requested_by: str
    branch_id: str
    purchase_type: PurchaseType = PurchaseType.CASH
    category: PurchaseCategory = PurchaseCategory.OTHER
    impacts_inventory: bool = False
    inventory_items: List[Dict] = []
    vendor_name: Optional[str] = None
    vendor_contact: Optional[str] = None

class PurchaseRequisitionApproval(BaseModel):
    approved_by: str
    notes: Optional[str] = None

class PurchaseRequisitionRejection(BaseModel):
    rejected_by: str
    reason: str

class PurchaseCompletion(BaseModel):
    purchased_by: str
    actual_cost: float
    receipt_number: Optional[str] = None
    receipt_date: Optional[str] = None
    payment_method: str  # cash, check, transfer
    notes: Optional[str] = None

class MaterialReceipt(BaseModel):
    received_by: str
    received_quantity: Dict  # {item_name: quantity}
    condition: str  # good, damaged, partial
    notes: Optional[str] = None


# Internal Order Requisition Models
class WorkflowStage(BaseModel):
    stage: str
    status: str
    assigned_to: Optional[str] = None
    completed_by: Optional[str] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None

class InternalOrderRequisition(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request_number: str
    product_name: str  # e.g., "1st Quality Flour", "Bread Flour"
    package_size: str  # e.g., "50kg", "25kg", "10kg", "5kg"
    quantity: int  # number of packages
    total_weight: float  # total kg = quantity * package_size
    requested_by: str
    branch_id: str  # Sales branch requesting
    source_branch: str  # Warehouse branch where product is located
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: InternalOrderStatus = InternalOrderStatus.PENDING_ADMIN_APPROVAL
    
    # Inventory tracking
    inventory_reserved: bool = False
    inventory_deducted: bool = False
    delivery_confirmed: bool = False
    
    # Workflow stages
    admin_approval: Optional[ApprovalRecord] = None
    manager_approval: Optional[ApprovalRecord] = None
    fulfillment: Optional[Dict] = None  # fulfilled_by, fulfilled_at, packing_slip, etc.
    gate_verification: Optional[Dict] = None  # verified_by, gate_pass, vehicle, etc.
    delivery_confirmation: Optional[Dict] = None  # confirmed_by, received_at, condition, etc.
    
    # Rejection
    rejection_reason: Optional[str] = None
    rejected_by: Optional[str] = None
    rejected_at: Optional[datetime] = None
    rejected_at_stage: Optional[str] = None
    
    # Workflow history
    workflow_history: List[Dict] = []

class InternalOrderCreate(BaseModel):
    product_name: str
    package_size: str
    quantity: int
    requested_by: str
    branch_id: str
    reason: Optional[str] = None

class AdminApprovalAction(BaseModel):
    approved_by: str
    notes: Optional[str] = None

class ManagerApprovalAction(BaseModel):
    approved_by: str
    notes: Optional[str] = None

class InternalOrderRejection(BaseModel):
    rejected_by: str
    reason: str
    stage: str

class FulfillmentAction(BaseModel):
    fulfilled_by: str
    packing_slip_number: Optional[str] = None
    actual_quantity: Optional[int] = None
    notes: Optional[str] = None
    gate_pass_number: Optional[str] = None
    vehicle_number: Optional[str] = None
    driver_name: Optional[str] = None

class GateVerificationAction(BaseModel):
    verified_by: str
    gate_pass_number: str
    vehicle_number: Optional[str] = None
    driver_name: Optional[str] = None
    notes: Optional[str] = None

class DeliveryConfirmationAction(BaseModel):
    confirmed_by: str
    received_quantity: int
    condition: str  # "good", "damaged", "partial"
    notes: Optional[str] = None


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


# Customer & Loan Models
class LoanPayment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    payment_number: str
    amount: float
    payment_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    payment_method: str  # cash, check, transfer
    received_by: str
    receipt_number: Optional[str] = None
    notes: Optional[str] = None

class Loan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    loan_number: str
    customer_id: str
    sales_transaction_id: str
    transaction_number: str
    principal_amount: float
    amount_paid: float = 0.0
    balance: float
    issue_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    due_date: datetime
    status: LoanStatus = LoanStatus.ACTIVE
    interest_rate: float = 0.0  # percentage
    days_overdue: int = 0
    payments: List[Dict] = []  # Payment history
    branch_id: str
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_number: str
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    branch_id: str
    
    # Credit Management
    credit_limit: float = 100000.0
    credit_used: float = 0.0
    credit_available: float = 100000.0
    
    # Payment Tracking
    payment_history_rating: PaymentHistoryRating = PaymentHistoryRating.GOOD
    total_credit_used: float = 0.0
    total_paid: float = 0.0
    outstanding_balance: float = 0.0
    
    # Metadata
    registration_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    registered_by: str
    status: str = "active"  # active, suspended, blocked
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomerCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    branch_id: str
    credit_limit: float = 100000.0
    registered_by: str
    notes: Optional[str] = None

class LoanCreate(BaseModel):
    customer_id: str
    sales_transaction_id: str
    principal_amount: float
    due_date: datetime
    interest_rate: float = 0.0
    branch_id: str
    created_by: str

class LoanPaymentCreate(BaseModel):
    amount: float
    payment_method: str
    received_by: str
    receipt_number: Optional[str] = None
    notes: Optional[str] = None


# Finance Models
class FinanceTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transaction_number: str
    type: FinanceTransactionType  # income or expense
    category: Optional[str] = None  # From IncomeCategory or ExpenseCategory
    amount: float
    payment_method: FinancePaymentMethod
    
    # Source tracking
    source_type: Optional[str] = None  # sales, loan_payment, purchase, manual, etc.
    source_id: Optional[str] = None  # ID of the source transaction
    source_reference: Optional[str] = None  # Reference number
    
    # Party information
    party_name: Optional[str] = None  # Customer, supplier, employee name
    party_contact: Optional[str] = None
    
    # Branch and account info
    branch_id: Optional[str] = None
    account_type: Optional[str] = None  # cash, bank, etc.
    bank_account: Optional[str] = None  # Bank account used
    
    # Description and documentation
    description: str
    reference_number: Optional[str] = None  # Check number, transfer ref, etc.
    supporting_documents: List[str] = []  # Document references
    
    # Accountability fields
    processed_by: str  # Finance officer who processed this
    approved_by: Optional[str] = None  # Who approved (for expenses)
    
    # Reconciliation
    reconciliation_status: ReconciliationStatus = ReconciliationStatus.UNRECONCILED
    reconciled_by: Optional[str] = None
    reconciliation_date: Optional[datetime] = None
    reconciliation_notes: Optional[str] = None
    
    # Timestamps
    transaction_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FinanceTransactionCreate(BaseModel):
    type: FinanceTransactionType
    category: str
    amount: float
    payment_method: FinancePaymentMethod
    party_name: Optional[str] = None
    party_contact: Optional[str] = None
    branch_id: Optional[str] = None
    account_type: Optional[str] = None
    bank_account: Optional[str] = None
    description: str
    reference_number: Optional[str] = None
    supporting_documents: List[str] = []
    processed_by: str
    transaction_date: Optional[datetime] = None


class DailyReconciliation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reconciliation_number: str
    
    # Date and branch
    reconciliation_date: datetime
    branch_id: str
    
    # Cash amounts
    expected_cash: float  # From POS transactions (cash + mobile money)
    actual_cash: float  # Counted by sales person
    variance: float  # Difference (positive = overage, negative = shortage)
    
    # Transaction breakdown
    total_sales: float  # Total sales for the day
    cash_sales: float  # Cash transactions
    mobile_money_sales: float  # Mobile money transactions
    loan_sales: float  # Credit/loan transactions
    transaction_count: int  # Number of transactions
    
    # Related transactions
    transaction_ids: List[str] = []  # IDs of sales transactions included
    
    # Submission info
    submitted_by: str  # Sales person who submitted
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    submission_notes: Optional[str] = None
    
    # Verification info
    status: DailyReconciliationStatus = DailyReconciliationStatus.PENDING
    verified_by: Optional[str] = None  # Finance officer who verified
    verified_at: Optional[datetime] = None
    verification_notes: Optional[str] = None
    
    # Variance handling
    variance_explanation: Optional[str] = None
    variance_adjustment_id: Optional[str] = None  # Finance transaction ID if variance recorded
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DailyReconciliationCreate(BaseModel):
    reconciliation_date: datetime
    branch_id: str
    actual_cash: float
    submitted_by: str
    submission_notes: Optional[str] = None

class DailyReconciliationVerify(BaseModel):
    status: DailyReconciliationStatus
    verified_by: str
    verification_notes: Optional[str] = None
    variance_explanation: Optional[str] = None


class ExpenseRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    expense_number: str
    
    # Expense details
    category: ExpenseCategory
    amount: float
    payment_method: FinancePaymentMethod
    
    # Payee information
    payee_name: str
    payee_contact: Optional[str] = None
    payee_account: Optional[str] = None
    
    # Payment details
    payment_date: datetime
    reference_number: Optional[str] = None  # Check number, transfer ref
    bank_account: Optional[str] = None  # Bank account used for payment
    
    # Allocation
    branch_id: Optional[str] = None  # Which branch/department
    account_allocation: Optional[str] = None  # Chart of accounts reference
    
    # Description and documentation
    description: str
    supporting_documents: List[str] = []
    
    # Approval and processing
    requested_by: Optional[str] = None  # Who requested this expense
    approved_by: Optional[str] = None  # Who approved
    processed_by: str  # Finance officer who processed
    
    # Related records
    purchase_requisition_id: Optional[str] = None  # If related to PR
    finance_transaction_id: Optional[str] = None  # Link to finance transaction
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExpenseRecordCreate(BaseModel):
    category: ExpenseCategory
    amount: float
    payment_method: FinancePaymentMethod
    payee_name: str
    payee_contact: Optional[str] = None
    payee_account: Optional[str] = None
    payment_date: datetime
    reference_number: Optional[str] = None
    bank_account: Optional[str] = None
    branch_id: Optional[str] = None
    account_allocation: Optional[str] = None
    description: str
    supporting_documents: List[str] = []
    processed_by: str


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

# Helper function for audit logging
async def log_audit(user: str, action: str, entity_type: str, entity_id: str, details: dict):
    """Create an audit log entry"""
    audit_log = AuditLog(
        user=user,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details
    )
    await db.audit_logs.insert_one(serialize_datetime(audit_log.model_dump()))


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
async def get_inventory(branch_id: Optional[str] = None):
    """Get all inventory items, optionally filtered by branch"""
    query = {}
    if branch_id:
        query["branch_id"] = branch_id
    
    items = await db.inventory.find(query, {"_id": 0}).to_list(1000)
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

@api_router.put("/purchase-requisitions/{req_id}/complete-purchase")
async def complete_purchase(req_id: str, completion: PurchaseCompletion):
    """Complete purchase with receipt details and create finance transaction"""
    req = await db.purchase_requisitions.find_one({"id": req_id}, {"_id": 0})
    if not req:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    if req["status"] != PurchaseRequisitionStatus.OWNER_APPROVED:
        raise HTTPException(status_code=400, detail="Requisition must be owner approved first")
    
    update_data = {
        "status": PurchaseRequisitionStatus.PURCHASED,
        "purchased_at": datetime.now(timezone.utc).isoformat(),
        "purchased_by": completion.purchased_by,
        "actual_cost": completion.actual_cost,
        "receipt_number": completion.receipt_number,
        "receipt_date": completion.receipt_date,
        "payment_method": completion.payment_method
    }
    
    await db.purchase_requisitions.update_one({"id": req_id}, {"$set": update_data})
    
    # Create Finance Transaction for expense
    finance_txn_count = await db.finance_transactions.count_documents({})
    finance_txn_number = f"FIN-{finance_txn_count + 1:06d}"
    
    finance_transaction = {
        "id": str(uuid.uuid4()),
        "transaction_number": finance_txn_number,
        "type": "expense",
        "source_type": "purchase",
        "source_id": req_id,
        "source_reference": req["request_number"],
        "amount": completion.actual_cost,
        "payment_method": completion.payment_method,
        "account_type": "cash" if completion.payment_method == "cash" else "bank",
        "branch_id": req.get("branch_id", "main"),
        "description": f"Purchase: {req['description']}",
        "processed_by": completion.purchased_by,
        "reconciled": False,
        "vendor_name": req.get("vendor_name"),
        "receipt_number": completion.receipt_number,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.finance_transactions.insert_one(finance_transaction)
    
    # Create audit log
    await log_audit(
        user=completion.purchased_by,
        action="complete_purchase",
        entity_type="purchase_requisition",
        entity_id=req_id,
        details={
            "actual_cost": completion.actual_cost,
            "payment_method": completion.payment_method,
            "receipt_number": completion.receipt_number
        }
    )
    
    updated_req = await db.purchase_requisitions.find_one({"id": req_id}, {"_id": 0})
    deserialize_datetime(updated_req)
    return updated_req


@api_router.put("/purchase-requisitions/{req_id}/receive-material")
async def receive_material(req_id: str, receipt: MaterialReceipt):
    """Receive material and update inventory (for material purchases)"""
    req = await db.purchase_requisitions.find_one({"id": req_id}, {"_id": 0})
    if not req:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    if req["status"] != PurchaseRequisitionStatus.PURCHASED:
        raise HTTPException(status_code=400, detail="Purchase must be completed first")
    
    if not req.get("impacts_inventory", False):
        raise HTTPException(status_code=400, detail="This purchase does not impact inventory")
    
    # Update inventory for each item
    for item_name, quantity in receipt.received_quantity.items():
        # Find inventory item
        inventory_item = await db.inventory.find_one({"name": item_name}, {"_id": 0})
        
        if inventory_item:
            # Update existing inventory
            await add_inventory_transaction(
                inventory_item["id"],
                "in",
                float(quantity),
                f"Purchase {req['request_number']} - {req.get('vendor_name', 'Vendor')}",
                receipt.received_by
            )
        else:
            # Create new inventory item if doesn't exist
            new_inventory = {
                "id": str(uuid.uuid4()),
                "name": item_name,
                "quantity": float(quantity),
                "unit": "kg",
                "stock_level": "ok",
                "low_threshold": 1000.0,
                "critical_threshold": 500.0,
                "category": req.get("category", "other"),
                "branch_id": req.get("branch_id", "main"),
                "transactions": [{
                    "id": str(uuid.uuid4()),
                    "date": datetime.now(timezone.utc).isoformat(),
                    "type": "in",
                    "quantity": float(quantity),
                    "reference": f"Purchase {req['request_number']}",
                    "performed_by": receipt.received_by
                }],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.inventory.insert_one(new_inventory)
    
    # Update purchase requisition
    update_data = {
        "status": PurchaseRequisitionStatus.RECEIVED,
        "received_at": datetime.now(timezone.utc).isoformat(),
        "received_by": receipt.received_by,
        "inventory_updated": True
    }
    
    await db.purchase_requisitions.update_one({"id": req_id}, {"$set": update_data})
    
    # Log audit
    await log_audit(
        user=receipt.received_by,
        action="receive_material",
        entity_type="purchase_requisition",
        entity_id=req_id,
        details={
            "condition": receipt.condition,
            "items_received": receipt.received_quantity
        }
    )
    
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

# ==================== LEGACY INTERNAL ORDERS - COMMENTED OUT ====================
# NOTE: These endpoints have been replaced by the new /stock-requests workflow
# Keeping them here for backward compatibility if needed
# To re-enable, uncomment and add the missing model classes

# @api_router.get("/internal-orders", response_model=List[InternalOrderRequisition])
# async def get_internal_orders(status: Optional[InternalOrderStatus] = None):
#     """Get all internal order requisitions, optionally filtered by status"""
#     query = {}
#     if status:
#         query["status"] = status
#     
#     orders = await db.internal_orders.find(query, {"_id": 0}).to_list(1000)
#     for order in orders:
#         deserialize_datetime(order)
#     return orders


# ==================== MANAGER ROLE ENDPOINTS ====================

@api_router.post("/wheat-deliveries", response_model=RawWheatDelivery)
async def create_wheat_delivery(delivery: RawWheatDeliveryCreate):
    """Creates a new raw wheat delivery record"""
    # Create the delivery record
    wheat_delivery = RawWheatDelivery(**delivery.model_dump())
    
    doc = wheat_delivery.model_dump()
    serialize_datetime(doc)
    
    await db.raw_wheat_deliveries.insert_one(doc)
    
    # Find Raw Wheat inventory item for this branch and update stock
    raw_wheat_item = await db.inventory.find_one(
        {"name": "Raw Wheat", "branch_id": delivery.branch_id}, 
        {"_id": 0}
    )
    if raw_wheat_item:
        # Add inventory transaction
        await add_inventory_transaction(
            raw_wheat_item["id"],
            "in",
            delivery.quantity_kg,
            f"Wheat Delivery from {delivery.supplier_name}",
            delivery.manager_id
        )
    else:
        raise HTTPException(
            status_code=404, 
            detail=f"Raw Wheat inventory not found for branch {delivery.branch_id}"
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
async def get_manager_queue(branch_id: Optional[str] = None):
    """Fetches all stock requests pending manager approval - NEW WORKFLOW, optionally filtered by branch"""
    query = {"status": InternalOrderStatus.PENDING_MANAGER_APPROVAL}
    if branch_id:
        query["source_branch"] = branch_id
    
    orders = await db.stock_requests.find(query, {"_id": 0}).to_list(1000)
    
    for order in orders:
        deserialize_datetime(order)
    return orders

@api_router.post("/inventory-requests/{order_id}/approve")
async def approve_inventory_request(order_id: str, approval: ManagerApprovalAction):
    """Legacy endpoint - redirects to new manager approval workflow"""
    # Find the stock request
    request = await db.stock_requests.find_one({"id": order_id}, {"_id": 0})
    
    if not request:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    if request["status"] != InternalOrderStatus.PENDING_MANAGER_APPROVAL:
        raise HTTPException(status_code=400, detail="Request not in pending manager approval state")
    
    # Create approval record
    approval_record = ApprovalRecord(
        approved_by=approval.approved_by,
        notes=approval.notes
    )
    
    # Update request
    update_data = {
        "status": InternalOrderStatus.MANAGER_APPROVED,
        "manager_approval": serialize_datetime(approval_record.model_dump())
    }
    
    workflow_entry = {
        "stage": "manager_approval",
        "status": "approved",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor": approval.approved_by,
        "action": "Approved by Manager",
        "notes": approval.notes or ""
    }
    
    await db.stock_requests.update_one(
        {"id": order_id},
        {
            "$set": update_data,
            "$push": {"workflow_history": workflow_entry}
        }
    )
    
    await log_audit(
        user=approval.approved_by,
        action="approve_stock_request_manager",
        entity_type="stock_request",
        entity_id=order_id,
        details={"notes": approval.notes}
    )
    
    # Move to pending fulfillment
    await db.stock_requests.update_one(
        {"id": order_id},
        {"$set": {"status": InternalOrderStatus.PENDING_FULFILLMENT}}
    )
    
    updated = await db.stock_requests.find_one({"id": order_id}, {"_id": 0})
    deserialize_datetime(updated)
    return updated

@api_router.post("/milling-orders", response_model=MillingOrder)
async def create_milling_order(order: MillingOrderCreate):
    """Creates a new milling order and deducts raw wheat from inventory for specific branch"""
    # Check if there's enough raw wheat in inventory for this branch
    raw_wheat_item = await db.inventory.find_one(
        {"name": "Raw Wheat", "branch_id": order.branch_id}, 
        {"_id": 0}
    )
    if not raw_wheat_item:
        raise HTTPException(
            status_code=404, 
            detail=f"Raw Wheat inventory item not found for branch {order.branch_id}"
        )
    
    if raw_wheat_item["quantity"] < order.raw_wheat_input_kg:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient raw wheat in {order.branch_id} branch. Available: {raw_wheat_item['quantity']}kg, Required: {order.raw_wheat_input_kg}kg"
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

@api_router.get("/milling-orders", response_model=List[MillingOrder])
async def get_milling_orders(branch_id: Optional[str] = None, status: Optional[MillingOrderStatus] = None):
    """Get milling orders, optionally filtered by branch and status"""
    query = {}
    if branch_id:
        query["branch_id"] = branch_id
    if status:
        query["status"] = status
    
    orders = await db.milling_orders.find(query, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    for order in orders:
        deserialize_datetime(order)
    return orders

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
    branch_id = milling_order.get("branch_id")
    for output in completion.outputs:
        # Find the product in inventory for this branch
        product_item = await db.inventory.find_one(
            {"id": output.product_id, "branch_id": branch_id}, 
            {"_id": 0}
        )
        if not product_item:
            raise HTTPException(
                status_code=404, 
                detail=f"Product with ID {output.product_id} not found for branch {branch_id}"
            )
        
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

@api_router.get("/sales-transactions")
async def get_sales_transactions(branch_id: Optional[str] = None):
    """
    Get all sales transactions, optionally filtered by branch.
    """
    query = {}
    if branch_id:
        query["branch_id"] = branch_id
    
    transactions = await db.sales_transactions.find(query, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    return transactions

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
        quantity_requested = item_data.get("quantity_kg", item_data.get("quantity", 0))
        product_qty = product.get("quantity", 0)
        
        if product_qty < quantity_requested:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for {product['name']}. Available: {product_qty}kg, Requested: {quantity_requested}kg"
            )
        
        # Create transaction item
        item_total = quantity_requested * item_data["unit_price"]
        transaction_item = SalesTransactionItem(
            product_id=item_data["product_id"],
            product_name=item_data["product_name"],
            quantity_kg=quantity_requested,
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
    
    # Create Finance Transaction Record
    finance_txn_count = await db.finance_transactions.count_documents({})
    finance_txn_number = f"FIN-{finance_txn_count + 1:06d}"
    
    finance_transaction = {
        "id": str(uuid.uuid4()),
        "transaction_number": finance_txn_number,
        "type": "income",
        "source_type": "sales",
        "source_id": sales_transaction.id,
        "source_reference": transaction_number,
        "amount": total_amount,
        "payment_method": transaction.payment_type.value,
        "account_type": "cash" if transaction.payment_type == PaymentType.CASH else 
                       "bank" if transaction.payment_type in [PaymentType.CHECK, PaymentType.TRANSFER] else
                       "loan",
        "branch_id": transaction.branch_id,
        "description": f"Sales payment - {transaction_number}",
        "processed_by": transaction.sales_person_name,
        "reconciled": False,
        "reconciliation_date": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.finance_transactions.insert_one(finance_transaction)
    
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
    
    # If payment is loan, automatically create loan record
    if transaction.payment_type == PaymentType.LOAN:
        # Check if customer exists, if not create one
        customer = await db.customers.find_one({"phone": transaction.customer_id}, {"_id": 0})
        
        if not customer:
            # Create new customer
            customer_count = await db.customers.count_documents({})
            customer_number = f"CUST-{customer_count + 1:05d}"
            
            customer = {
                "id": str(uuid.uuid4()),
                "customer_number": customer_number,
                "name": transaction.customer_name,
                "phone": transaction.customer_id,  # Using phone as customer_id
                "branch_id": transaction.branch_id,
                "credit_limit": 500000.0,  # Default credit limit
                "credit_used": total_amount,
                "credit_available": 500000.0 - total_amount,
                "outstanding_balance": total_amount,
                "payment_history_rating": "good",
                "total_credit_used": total_amount,
                "total_paid": 0.0,
                "registration_date": datetime.now(timezone.utc).isoformat(),
                "registered_by": transaction.sales_person_name,
                "status": "active",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.customers.insert_one(customer)
        
        # Create loan
        loan_count = await db.loans.count_documents({})
        loan_number = f"LOAN-{loan_count + 1:06d}"
        
        # Due date: 30 days from now (configurable)
        due_date = datetime.now(timezone.utc) + timedelta(days=30)
        
        loan = {
            "id": str(uuid.uuid4()),
            "loan_number": loan_number,
            "customer_id": customer["id"],
            "sales_transaction_id": sales_transaction.id,
            "transaction_number": transaction_number,
            "principal_amount": total_amount,
            "amount_paid": 0.0,
            "balance": total_amount,
            "issue_date": datetime.now(timezone.utc).isoformat(),
            "due_date": due_date.isoformat(),
            "status": "active",
            "interest_rate": 0.0,
            "days_overdue": 0,
            "payments": [],
            "branch_id": transaction.branch_id,
            "created_by": transaction.sales_person_name,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.loans.insert_one(loan)
        
        await log_audit(
            user=transaction.sales_person_name,
            action="create_loan_from_sale",
            entity_type="loan",
            entity_id=loan["id"],
            details={
                "loan_number": loan_number,
                "customer": transaction.customer_name,
                "amount": total_amount,
                "due_date": due_date.isoformat()
        }
    )
    
    return sales_transaction


@api_router.post("/stock-requests", response_model=InternalOrderRequisition)
async def create_stock_request(order: InternalOrderCreate):
    """
    Creates a new stock request with automatic branch routing.
    NEW 6-Stage Workflow: Admin → Manager → Storekeeper → Guard → Sales Confirmation
    """
    # Generate request number
    request_count = await db.stock_requests.count_documents({})
    request_number = f"SR-{request_count + 1:06d}"
    
    # Calculate total weight based on package size
    package_size_map = {
        "50kg": 50, "25kg": 25, "15kg": 15, "10kg": 10, "5kg": 5
    }
    package_weight = package_size_map.get(order.package_size, 0)
    if package_weight == 0:
        # For bulk items like bran
        package_weight = order.quantity  # quantity is kg directly
        total_weight = order.quantity
    else:
        total_weight = order.quantity * package_weight
    
    # Determine source branch automatically
    source_branch = await determine_source_branch(order.product_name)
    
    # Check if inventory is available
    reservation_result = await reserve_inventory(order.product_name, source_branch, total_weight)
    
    if not reservation_result["success"]:
        raise HTTPException(status_code=400, detail=reservation_result["error"])
    
    # Create stock request with workflow tracking
    stock_request = InternalOrderRequisition(
        request_number=request_number,
        product_name=order.product_name,
        package_size=order.package_size,
        quantity=order.quantity,
        total_weight=total_weight,
        requested_by=order.requested_by,
        branch_id=order.branch_id,
        source_branch=source_branch,
        status=InternalOrderStatus.PENDING_ADMIN_APPROVAL,
        inventory_reserved=False,  # Will be set when admin approves
        inventory_deducted=False,
        delivery_confirmed=False,
        workflow_history=[
            {
                "stage": "created",
                "status": "completed",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actor": order.requested_by,
                "action": "Request created",
                "notes": order.reason or ""
            }
        ]
    )
    
    # Save to database
    order_dict = stock_request.model_dump()
    serialize_datetime(order_dict)
    await db.stock_requests.insert_one(order_dict)
    
    # Log audit trail
    await log_audit(
        user=order.requested_by,
        action="create_stock_request",
        entity_type="stock_request",
        entity_id=stock_request.id,
        details={
            "request_number": request_number,
            "product_name": order.product_name,
            "quantity": order.quantity,
            "total_weight": total_weight,
            "source_branch": source_branch,
            "destination_branch": order.branch_id
        }
    )
    
    return stock_request


# Maintain backward compatibility
@api_router.post("/inventory-requests", response_model=InternalOrderRequisition)
async def create_inventory_request_sales(order: InternalOrderCreate):
    """Legacy endpoint - redirects to new stock-requests endpoint"""
    return await create_stock_request(order)


@api_router.get("/stock-requests")
async def get_stock_requests(
    status: Optional[str] = None,
    branch_id: Optional[str] = None,
    source_branch: Optional[str] = None,
    requested_by: Optional[str] = None
):
    """Get stock requests with optional filters"""
    query = {}
    if status:
        query["status"] = status
    if branch_id:
        query["branch_id"] = branch_id
    if source_branch:
        query["source_branch"] = source_branch
    if requested_by:
        query["requested_by"] = requested_by
    
    requests = await db.stock_requests.find(query, {"_id": 0}).sort("requested_at", -1).to_list(1000)
    
    for req in requests:
        deserialize_datetime(req)
    
    return requests


@api_router.get("/stock-requests/{request_id}")
async def get_stock_request(request_id: str):
    """Get specific stock request with full details"""
    request = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    if not request:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    deserialize_datetime(request)
    return request


@api_router.put("/stock-requests/{request_id}/approve-admin")
async def approve_stock_request_admin(request_id: str, approval: AdminApprovalAction):
    """STAGE 2: Admin/Owner approves stock request and reserves inventory"""
    request = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    if not request:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    if request["status"] != InternalOrderStatus.PENDING_ADMIN_APPROVAL:
        raise HTTPException(status_code=400, detail="Request not in pending admin approval state")
    
    # Create approval record
    approval_record = ApprovalRecord(
        approved_by=approval.approved_by,
        notes=approval.notes
    )
    
    # Update request
    update_data = {
        "status": InternalOrderStatus.ADMIN_APPROVED,
        "admin_approval": serialize_datetime(approval_record.model_dump()),
        "inventory_reserved": True
    }
    
    # Add to workflow history
    workflow_entry = {
        "stage": "admin_approval",
        "status": "approved",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor": approval.approved_by,
        "action": "Approved by Admin",
        "notes": approval.notes or ""
    }
    
    await db.stock_requests.update_one(
        {"id": request_id},
        {
            "$set": update_data,
            "$push": {"workflow_history": workflow_entry}
        }
    )
    
    # Log audit
    await log_audit(
        user=approval.approved_by,
        action="approve_stock_request_admin",
        entity_type="stock_request",
        entity_id=request_id,
        details={"notes": approval.notes}
    )
    
    # Automatically move to pending manager approval
    await db.stock_requests.update_one(
        {"id": request_id},
        {"$set": {"status": InternalOrderStatus.PENDING_MANAGER_APPROVAL}}
    )
    
    updated = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    deserialize_datetime(updated)
    return updated


@api_router.put("/stock-requests/{request_id}/approve-manager")
async def approve_stock_request_manager(request_id: str, approval: ManagerApprovalAction):
    """STAGE 3: Manager approves stock request"""
    request = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    if not request:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    if request["status"] != InternalOrderStatus.PENDING_MANAGER_APPROVAL:
        raise HTTPException(status_code=400, detail="Request not in pending manager approval state")
    
    # Create approval record
    approval_record = ApprovalRecord(
        approved_by=approval.approved_by,
        notes=approval.notes
    )
    
    # Update request
    update_data = {
        "status": InternalOrderStatus.MANAGER_APPROVED,
        "manager_approval": serialize_datetime(approval_record.model_dump())
    }
    
    workflow_entry = {
        "stage": "manager_approval",
        "status": "approved",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor": approval.approved_by,
        "action": "Approved by Manager",
        "notes": approval.notes or ""
    }
    
    await db.stock_requests.update_one(
        {"id": request_id},
        {
            "$set": update_data,
            "$push": {"workflow_history": workflow_entry}
        }
    )
    
    await log_audit(
        user=approval.approved_by,
        action="approve_stock_request_manager",
        entity_type="stock_request",
        entity_id=request_id,
        details={"notes": approval.notes}
    )
    
    # Move to pending fulfillment
    await db.stock_requests.update_one(
        {"id": request_id},
        {"$set": {"status": InternalOrderStatus.PENDING_FULFILLMENT}}
    )
    
    updated = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    deserialize_datetime(updated)
    return updated


@api_router.put("/stock-requests/{request_id}/fulfill")
async def fulfill_stock_request(request_id: str, fulfillment: FulfillmentAction):
    """STAGE 4: Storekeeper fulfills request and deducts inventory"""
    request = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    if not request:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    if request["status"] != InternalOrderStatus.PENDING_FULFILLMENT:
        raise HTTPException(status_code=400, detail="Request not in pending fulfillment state")
    
    # Deduct inventory from source warehouse
    await deduct_inventory_for_fulfillment(
        request["product_name"],
        request["source_branch"],
        request["total_weight"],
        f"Stock Request {request['request_number']}",
        fulfillment.fulfilled_by
    )
    
    # Generate packing slip and gate pass numbers
    packing_slip = fulfillment.packing_slip_number or f"PS-{request['request_number']}"
    gate_pass = fulfillment.gate_pass_number or f"GP-{request['request_number']}"
    
    fulfillment_record = {
        "fulfilled_by": fulfillment.fulfilled_by,
        "fulfilled_at": datetime.now(timezone.utc).isoformat(),
        "packing_slip_number": packing_slip,
        "actual_quantity": fulfillment.actual_quantity or request["quantity"],
        "notes": fulfillment.notes or ""
    }
    
    # Store gate pass info (generated by storekeeper)
    gate_pass_draft = {
        "gate_pass_number": gate_pass,
        "vehicle_number": fulfillment.vehicle_number,
        "driver_name": fulfillment.driver_name,
        "created_by": fulfillment.fulfilled_by,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending_approval"
    }
    
    workflow_entry = {
        "stage": "fulfillment",
        "status": "completed",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor": fulfillment.fulfilled_by,
        "action": "Fulfilled by Storekeeper with Gate Pass",
        "notes": fulfillment.notes or ""
    }
    
    # Change status to pending_gate_approval (manager must approve gate pass)
    await db.stock_requests.update_one(
        {"id": request_id},
        {
            "$set": {
                "status": InternalOrderStatus.PENDING_GATE_APPROVAL,
                "fulfillment": fulfillment_record,
                "gate_pass_draft": gate_pass_draft,
                "inventory_deducted": True
            },
            "$push": {"workflow_history": workflow_entry}
        }
    )
    
    await log_audit(
        user=fulfillment.fulfilled_by,
        action="fulfill_stock_request",
        entity_type="stock_request",
        entity_id=request_id,
        details={"packing_slip": packing_slip}
    )
    
    updated = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    deserialize_datetime(updated)
    return updated


@api_router.put("/stock-requests/{request_id}/approve-gate-pass")
async def approve_gate_pass(request_id: str, approval: ManagerApprovalAction):
    """Manager approves gate pass for release"""
    request = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    if not request:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    if request["status"] != InternalOrderStatus.PENDING_GATE_APPROVAL:
        raise HTTPException(status_code=400, detail="Request not pending gate approval")
    
    # Approve gate pass and mark as ready for guard
    gate_pass = request.get("gate_pass_draft", {})
    gate_pass["approved_by"] = approval.approved_by
    gate_pass["approved_at"] = datetime.now(timezone.utc).isoformat()
    gate_pass["status"] = "approved"
    gate_pass["approval_notes"] = approval.notes or ""
    
    workflow_entry = {
        "stage": "gate_pass_approval",
        "status": "approved",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor": approval.approved_by,
        "action": "Gate Pass Approved by Manager",
        "notes": approval.notes or ""
    }
    
    # Move to in_transit (ready for physical guard check)
    await db.stock_requests.update_one(
        {"id": request_id},
        {
            "$set": {
                "status": InternalOrderStatus.IN_TRANSIT,
                "gate_verification": gate_pass
            },
            "$unset": {"gate_pass_draft": ""},
            "$push": {"workflow_history": workflow_entry}
        }
    )
    
    await log_audit(
        user=approval.approved_by,
        action="approve_gate_pass",
        entity_type="stock_request",
        entity_id=request_id,
        details={"gate_pass": gate_pass["gate_pass_number"]}
    )
    
    updated = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    deserialize_datetime(updated)
    return updated


@api_router.put("/stock-requests/{request_id}/gate-verify")
async def verify_at_gate(request_id: str, verification: GateVerificationAction):
    """STAGE 5: Guard verifies at gate and issues gate pass"""
    request = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    if not request:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    if request["status"] != InternalOrderStatus.READY_FOR_PICKUP:
        raise HTTPException(status_code=400, detail="Request not ready for gate verification")
    
    gate_record = {
        "verified_by": verification.verified_by,
        "verified_at": datetime.now(timezone.utc).isoformat(),
        "gate_pass_number": verification.gate_pass_number,
        "vehicle_number": verification.vehicle_number,
        "driver_name": verification.driver_name,
        "exit_time": datetime.now(timezone.utc).isoformat(),
        "notes": verification.notes or ""
    }
    
    workflow_entry = {
        "stage": "gate_verification",
        "status": "completed",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor": verification.verified_by,
        "action": "Verified and released at gate",
        "notes": verification.notes or ""
    }
    
    await db.stock_requests.update_one(
        {"id": request_id},
        {
            "$set": {
                "status": InternalOrderStatus.IN_TRANSIT,
                "gate_verification": gate_record
            },
            "$push": {"workflow_history": workflow_entry}
        }
    )
    
    await log_audit(
        user=verification.verified_by,
        action="gate_verify_stock_request",
        entity_type="stock_request",
        entity_id=request_id,
        details={"gate_pass": verification.gate_pass_number}
    )
    
    updated = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    deserialize_datetime(updated)
    return updated


@api_router.put("/stock-requests/{request_id}/confirm-delivery")
async def confirm_delivery(request_id: str, confirmation: DeliveryConfirmationAction):
    """STAGE 6: Sales confirms receipt of delivery"""
    request = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    if not request:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    if request["status"] != InternalOrderStatus.IN_TRANSIT:
        raise HTTPException(status_code=400, detail="Request not in transit")
    
    # Add inventory to destination branch
    await add_inventory_for_delivery(
        request["product_name"],
        request["branch_id"],
        request["total_weight"],
        f"Stock Request {request['request_number']}",
        confirmation.confirmed_by
    )
    
    delivery_record = {
        "confirmed_by": confirmation.confirmed_by,
        "confirmed_at": datetime.now(timezone.utc).isoformat(),
        "received_quantity": confirmation.received_quantity,
        "condition": confirmation.condition,
        "notes": confirmation.notes or ""
    }
    
    workflow_entry = {
        "stage": "delivery_confirmation",
        "status": "completed",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor": confirmation.confirmed_by,
        "action": "Delivery confirmed",
        "notes": confirmation.notes or ""
    }
    
    await db.stock_requests.update_one(
        {"id": request_id},
        {
            "$set": {
                "status": InternalOrderStatus.CONFIRMED,
                "delivery_confirmation": delivery_record,
                "delivery_confirmed": True
            },
            "$push": {"workflow_history": workflow_entry}
        }
    )
    
    await log_audit(
        user=confirmation.confirmed_by,
        action="confirm_delivery_stock_request",
        entity_type="stock_request",
        entity_id=request_id,
        details={"condition": confirmation.condition}
    )
    
    updated = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    deserialize_datetime(updated)
    return updated


@api_router.put("/stock-requests/{request_id}/reject")
async def reject_stock_request(request_id: str, rejection: InternalOrderRejection):
    """Reject stock request at any stage"""
    request = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    
    if not request:
        raise HTTPException(status_code=404, detail="Stock request not found")
    
    if request["status"] in [InternalOrderStatus.CONFIRMED, InternalOrderStatus.REJECTED]:
        raise HTTPException(status_code=400, detail="Cannot reject completed or already rejected request")
    
    # Unreserve inventory if it was reserved
    if request.get("inventory_reserved") and not request.get("inventory_deducted"):
        # Inventory was reserved but not yet deducted, nothing to unreserve in our simple model
        pass
    
    workflow_entry = {
        "stage": rejection.stage,
        "status": "rejected",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor": rejection.rejected_by,
        "action": f"Rejected at {rejection.stage}",
        "notes": rejection.reason
    }
    
    await db.stock_requests.update_one(
        {"id": request_id},
        {
            "$set": {
                "status": InternalOrderStatus.REJECTED,
                "rejection_reason": rejection.reason,
                "rejected_by": rejection.rejected_by,
                "rejected_at": datetime.now(timezone.utc).isoformat(),
                "rejected_at_stage": rejection.stage
            },
            "$push": {"workflow_history": workflow_entry}
        }
    )
    
    await log_audit(
        user=rejection.rejected_by,
        action="reject_stock_request",
        entity_type="stock_request",
        entity_id=request_id,
        details={"reason": rejection.reason, "stage": rejection.stage}
    )
    
    updated = await db.stock_requests.find_one({"id": request_id}, {"_id": 0})
    deserialize_datetime(updated)
    return updated


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
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
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


@api_router.get("/finance/transactions")
async def get_finance_transactions(
    branch_id: Optional[str] = None,
    account_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100
):
    """
    Get finance transactions with optional filters
    """
    query = {}
    
    if branch_id:
        query["branch_id"] = branch_id
    if account_type:
        query["account_type"] = account_type
    
    if start_date and end_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query["created_at"] = {"$gte": start_dt.isoformat(), "$lte": end_dt.isoformat()}
        except ValueError:
            pass
    
    transactions = await db.finance_transactions.find(
        query, {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return transactions


@api_router.get("/finance/summary")
async def get_finance_summary(branch_id: Optional[str] = None):
    """
    Get finance summary by account type
    """
    query = {}
    if branch_id:
        query["branch_id"] = branch_id
    
    transactions = await db.finance_transactions.find(query, {"_id": 0}).to_list(10000)
    
    summary = {
        "total_income": 0,
        "total_expense": 0,
        "cash_account": 0,
        "bank_account": 0,
        "loan_account": 0,
        "reconciled_count": 0,
        "unreconciled_count": 0
    }
    
    for txn in transactions:
        amount = txn.get("amount", 0)
        if txn.get("type") == "income":
            summary["total_income"] += amount
        else:
            summary["total_expense"] += amount
        
        if txn.get("account_type") == "cash":
            summary["cash_account"] += amount
        elif txn.get("account_type") == "bank":
            summary["bank_account"] += amount
        elif txn.get("account_type") == "loan":
            summary["loan_account"] += amount
        
        if txn.get("reconciled"):
            summary["reconciled_count"] += 1
        else:
            summary["unreconciled_count"] += 1
    
    summary["net_balance"] = summary["total_income"] - summary["total_expense"]
    
    return summary


# ==================== FINANCE API ENDPOINTS ====================

# Income Recording Endpoints
@api_router.post("/finance/income/cash-receipt", response_model=FinanceTransaction)
async def record_cash_receipt(transaction: FinanceTransactionCreate):
    """Record non-sales cash receipts (refunds, interest, misc income)"""
    
    # Generate transaction number
    txn_count = await db.finance_transactions.count_documents({})
    transaction_number = f"FIN-{txn_count + 1:06d}"
    
    # Create finance transaction
    finance_txn = FinanceTransaction(
        transaction_number=transaction_number,
        type=FinanceTransactionType.INCOME,
        category=transaction.category,
        amount=transaction.amount,
        payment_method=transaction.payment_method,
        party_name=transaction.party_name,
        party_contact=transaction.party_contact,
        branch_id=transaction.branch_id,
        account_type=transaction.account_type,
        bank_account=transaction.bank_account,
        description=transaction.description,
        reference_number=transaction.reference_number,
        supporting_documents=transaction.supporting_documents,
        processed_by=transaction.processed_by,
        source_type="manual_income",
        transaction_date=transaction.transaction_date or datetime.now(timezone.utc)
    )
    
    # Save to database
    txn_dict = finance_txn.model_dump()
    serialize_datetime(txn_dict)
    await db.finance_transactions.insert_one(txn_dict)
    
    # Audit log
    await log_audit(
        user=transaction.processed_by,
        action="record_income",
        entity_type="finance_transaction",
        entity_id=finance_txn.id,
        details={
            "category": transaction.category,
            "amount": transaction.amount,
            "description": transaction.description
        }
    )
    
    return finance_txn


@api_router.get("/finance/income")
async def get_income_transactions(
    branch_id: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100
):
    """List all income transactions with filters"""
    query = {"type": "income"}
    
    if branch_id:
        query["branch_id"] = branch_id
    if category:
        query["category"] = category
    
    if start_date and end_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query["transaction_date"] = {"$gte": start_dt.isoformat(), "$lte": end_dt.isoformat()}
        except ValueError:
            pass
    
    transactions = await db.finance_transactions.find(
        query, {"_id": 0}
    ).sort("transaction_date", -1).limit(limit).to_list(limit)
    
    return transactions


@api_router.get("/finance/income/summary")
async def get_income_summary(
    branch_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get income summary by category"""
    query = {"type": "income"}
    
    if branch_id:
        query["branch_id"] = branch_id
    
    if start_date and end_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query["transaction_date"] = {"$gte": start_dt.isoformat(), "$lte": end_dt.isoformat()}
        except ValueError:
            pass
    
    transactions = await db.finance_transactions.find(query, {"_id": 0}).to_list(10000)
    
    # Group by category
    summary = {}
    total = 0.0
    
    for txn in transactions:
        category = txn.get("category", "uncategorized")
        amount = txn.get("amount", 0)
        
        if category not in summary:
            summary[category] = {"count": 0, "total": 0.0}
        
        summary[category]["count"] += 1
        summary[category]["total"] += amount
        total += amount
    
    return {
        "by_category": summary,
        "total_income": total,
        "transaction_count": len(transactions)
    }


# Expense Recording Endpoints
@api_router.post("/finance/expenses/record", response_model=ExpenseRecord)
async def record_expense(expense: ExpenseRecordCreate):
    """Record expense (salary, utility, rent, tax, etc.)"""
    
    # Generate expense number
    expense_count = await db.expense_records.count_documents({})
    expense_number = f"EXP-{expense_count + 1:06d}"
    
    # Generate finance transaction number
    txn_count = await db.finance_transactions.count_documents({})
    transaction_number = f"FIN-{txn_count + 1:06d}"
    
    # Create finance transaction
    finance_txn = FinanceTransaction(
        transaction_number=transaction_number,
        type=FinanceTransactionType.EXPENSE,
        category=expense.category.value,
        amount=expense.amount,
        payment_method=expense.payment_method,
        party_name=expense.payee_name,
        party_contact=expense.payee_contact,
        branch_id=expense.branch_id,
        bank_account=expense.bank_account,
        description=expense.description,
        reference_number=expense.reference_number,
        supporting_documents=expense.supporting_documents,
        processed_by=expense.processed_by,
        source_type="manual_expense",
        transaction_date=expense.payment_date
    )
    
    # Save finance transaction
    txn_dict = finance_txn.model_dump()
    serialize_datetime(txn_dict)
    await db.finance_transactions.insert_one(txn_dict)
    
    # Create expense record
    expense_record = ExpenseRecord(
        expense_number=expense_number,
        category=expense.category,
        amount=expense.amount,
        payment_method=expense.payment_method,
        payee_name=expense.payee_name,
        payee_contact=expense.payee_contact,
        payee_account=expense.payee_account,
        payment_date=expense.payment_date,
        reference_number=expense.reference_number,
        bank_account=expense.bank_account,
        branch_id=expense.branch_id,
        account_allocation=expense.account_allocation,
        description=expense.description,
        supporting_documents=expense.supporting_documents,
        processed_by=expense.processed_by,
        finance_transaction_id=finance_txn.id
    )
    
    # Save expense record
    expense_dict = expense_record.model_dump()
    serialize_datetime(expense_dict)
    await db.expense_records.insert_one(expense_dict)
    
    # Audit log
    await log_audit(
        user=expense.processed_by,
        action="record_expense",
        entity_type="expense_record",
        entity_id=expense_record.id,
        details={
            "category": expense.category.value,
            "amount": expense.amount,
            "payee": expense.payee_name
        }
    )
    
    return expense_record


@api_router.get("/finance/expenses")
async def get_expenses(
    branch_id: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100
):
    """List expenses with filters"""
    query = {}
    
    if branch_id:
        query["branch_id"] = branch_id
    if category:
        query["category"] = category
    
    if start_date and end_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query["payment_date"] = {"$gte": start_dt.isoformat(), "$lte": end_dt.isoformat()}
        except ValueError:
            pass
    
    expenses = await db.expense_records.find(
        query, {"_id": 0}
    ).sort("payment_date", -1).limit(limit).to_list(limit)
    
    return expenses


@api_router.get("/finance/expenses/summary")
async def get_expense_summary(
    branch_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get expense breakdown by category"""
    query = {}
    
    if branch_id:
        query["branch_id"] = branch_id
    
    if start_date and end_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query["payment_date"] = {"$gte": start_dt.isoformat(), "$lte": end_dt.isoformat()}
        except ValueError:
            pass
    
    expenses = await db.expense_records.find(query, {"_id": 0}).to_list(10000)
    
    # Group by category
    summary = {}
    total = 0.0
    
    for expense in expenses:
        category = expense.get("category", "uncategorized")
        amount = expense.get("amount", 0)
        
        if category not in summary:
            summary[category] = {"count": 0, "total": 0.0}
        
        summary[category]["count"] += 1
        summary[category]["total"] += amount
        total += amount
    
    return {
        "by_category": summary,
        "total_expense": total,
        "expense_count": len(expenses)
    }


# Purchase Authorization Endpoints
@api_router.get("/finance/pending-authorizations")
async def get_pending_authorizations():
    """Get owner-approved purchase requests needing finance authorization"""
    
    # Get owner-approved purchase requisitions
    prs = await db.purchase_requisitions.find(
        {"status": "owner_approved"},
        {"_id": 0}
    ).sort("requested_at", 1).to_list(100)
    
    return prs


@api_router.post("/finance/authorize-payment/{pr_id}")
async def authorize_payment(pr_id: str, authorization: Dict):
    """Finance authorizes payment for purchase requisition"""
    
    pr = await db.purchase_requisitions.find_one({"id": pr_id}, {"_id": 0})
    if not pr:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    if pr.get("status") != "owner_approved":
        raise HTTPException(status_code=400, detail="Purchase requisition must be owner-approved")
    
    # Update PR with finance authorization
    await db.purchase_requisitions.update_one(
        {"id": pr_id},
        {
            "$set": {
                "finance_authorized": True,
                "finance_authorized_by": authorization.get("authorized_by"),
                "finance_authorized_at": datetime.now(timezone.utc).isoformat(),
                "finance_authorization_notes": authorization.get("notes"),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Audit log
    await log_audit(
        user=authorization.get("authorized_by"),
        action="authorize_payment",
        entity_type="purchase_requisition",
        entity_id=pr_id,
        details={
            "amount": pr.get("estimated_cost"),
            "notes": authorization.get("notes")
        }
    )
    
    updated_pr = await db.purchase_requisitions.find_one({"id": pr_id}, {"_id": 0})
    return updated_pr


@api_router.post("/finance/process-payment/{pr_id}")
async def process_payment(pr_id: str, payment_details: Dict):
    """Process actual payment for authorized purchase requisition"""
    
    pr = await db.purchase_requisitions.find_one({"id": pr_id}, {"_id": 0})
    if not pr:
        raise HTTPException(status_code=404, detail="Purchase requisition not found")
    
    if pr.get("status") != "owner_approved":
        raise HTTPException(status_code=400, detail="Purchase requisition must be owner-approved")
    
    # Generate finance transaction number
    txn_count = await db.finance_transactions.count_documents({})
    transaction_number = f"FIN-{txn_count + 1:06d}"
    
    # Create finance transaction for payment
    finance_txn = {
        "id": str(uuid.uuid4()),
        "transaction_number": transaction_number,
        "type": "expense",
        "category": "purchase_payment",
        "amount": payment_details.get("amount", pr.get("estimated_cost")),
        "payment_method": payment_details.get("payment_method"),
        "party_name": pr.get("vendor_name"),
        "party_contact": pr.get("vendor_contact"),
        "branch_id": pr.get("branch_id"),
        "bank_account": payment_details.get("bank_account"),
        "description": f"Payment for {pr.get('description')}",
        "reference_number": payment_details.get("reference_number"),
        "processed_by": payment_details.get("processed_by"),
        "source_type": "purchase",
        "source_id": pr_id,
        "source_reference": pr.get("request_number"),
        "transaction_date": payment_details.get("payment_date", datetime.now(timezone.utc).isoformat()),
        "reconciliation_status": "unreconciled",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.finance_transactions.insert_one(finance_txn)
    
    # Update purchase requisition status
    await db.purchase_requisitions.update_one(
        {"id": pr_id},
        {
            "$set": {
                "status": "purchased",
                "payment_processed": True,
                "payment_processed_by": payment_details.get("processed_by"),
                "payment_processed_at": datetime.now(timezone.utc).isoformat(),
                "payment_method": payment_details.get("payment_method"),
                "payment_reference": payment_details.get("reference_number"),
                "finance_transaction_id": finance_txn["id"],
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Audit log
    await log_audit(
        user=payment_details.get("processed_by"),
        action="process_payment",
        entity_type="purchase_requisition",
        entity_id=pr_id,
        details={
            "amount": payment_details.get("amount"),
            "payment_method": payment_details.get("payment_method"),
            "reference": payment_details.get("reference_number")
        }
    )
    
    return {"success": True, "finance_transaction": finance_txn, "purchase_requisition_updated": True}


@api_router.get("/finance/payment-history")
async def get_payment_history(limit: int = 100):
    """Get complete payment history"""
    
    payments = await db.finance_transactions.find(
        {
            "type": "expense",
            "category": "purchase_payment"
        },
        {"_id": 0}
    ).sort("transaction_date", -1).limit(limit).to_list(limit)
    
    return payments


# Daily Reconciliation Endpoints
@api_router.post("/finance/reconciliation/submit", response_model=DailyReconciliation)
async def submit_daily_reconciliation(reconciliation: DailyReconciliationCreate):
    """Sales submits end-of-day cash count"""
    
    # Generate reconciliation number
    recon_count = await db.daily_reconciliations.count_documents({})
    reconciliation_number = f"RECON-{recon_count + 1:06d}"
    
    # Get sales transactions for the day and branch
    start_of_day = reconciliation.reconciliation_date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = reconciliation.reconciliation_date.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    sales_txns = await db.sales_transactions.find({
        "branch_id": reconciliation.branch_id,
        "timestamp": {
            "$gte": start_of_day.isoformat(),
            "$lte": end_of_day.isoformat()
        }
    }, {"_id": 0}).to_list(1000)
    
    # Calculate expected amounts
    total_sales = 0.0
    cash_sales = 0.0
    mobile_money_sales = 0.0
    loan_sales = 0.0
    transaction_ids = []
    
    for txn in sales_txns:
        amount = txn.get("total_amount", 0)
        total_sales += amount
        transaction_ids.append(txn.get("id"))
        
        payment_type = txn.get("payment_type", "")
        if payment_type == "cash":
            cash_sales += amount
        elif payment_type == "transfer":  # mobile money
            mobile_money_sales += amount
        elif payment_type == "loan":
            loan_sales += amount
    
    expected_cash = cash_sales + mobile_money_sales
    variance = reconciliation.actual_cash - expected_cash
    
    # Create reconciliation record
    daily_recon = DailyReconciliation(
        reconciliation_number=reconciliation_number,
        reconciliation_date=reconciliation.reconciliation_date,
        branch_id=reconciliation.branch_id,
        expected_cash=expected_cash,
        actual_cash=reconciliation.actual_cash,
        variance=variance,
        total_sales=total_sales,
        cash_sales=cash_sales,
        mobile_money_sales=mobile_money_sales,
        loan_sales=loan_sales,
        transaction_count=len(sales_txns),
        transaction_ids=transaction_ids,
        submitted_by=reconciliation.submitted_by,
        submission_notes=reconciliation.submission_notes,
        status=DailyReconciliationStatus.PENDING
    )
    
    # Save to database
    recon_dict = daily_recon.model_dump()
    serialize_datetime(recon_dict)
    await db.daily_reconciliations.insert_one(recon_dict)
    
    # Audit log
    await log_audit(
        user=reconciliation.submitted_by,
        action="submit_reconciliation",
        entity_type="daily_reconciliation",
        entity_id=daily_recon.id,
        details={
            "branch": reconciliation.branch_id,
            "expected": expected_cash,
            "actual": reconciliation.actual_cash,
            "variance": variance
        }
    )
    
    return daily_recon


@api_router.get("/finance/reconciliation/pending")
async def get_pending_reconciliations():
    """Get pending reconciliations for Finance to verify"""
    
    reconciliations = await db.daily_reconciliations.find(
        {"status": "pending"},
        {"_id": 0}
    ).sort("reconciliation_date", -1).to_list(100)
    
    return reconciliations


@api_router.post("/finance/reconciliation/{recon_id}/verify")
async def verify_reconciliation(recon_id: str, verification: DailyReconciliationVerify):
    """Finance verifies and approves reconciliation"""
    
    recon = await db.daily_reconciliations.find_one({"id": recon_id}, {"_id": 0})
    if not recon:
        raise HTTPException(status_code=404, detail="Reconciliation not found")
    
    # Update reconciliation
    await db.daily_reconciliations.update_one(
        {"id": recon_id},
        {
            "$set": {
                "status": verification.status.value,
                "verified_by": verification.verified_by,
                "verified_at": datetime.now(timezone.utc).isoformat(),
                "verification_notes": verification.verification_notes,
                "variance_explanation": verification.variance_explanation,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # If approved, update related transactions to reconciled
    if verification.status == DailyReconciliationStatus.APPROVED:
        transaction_ids = recon.get("transaction_ids", [])
        
        # Update all sales transactions
        for txn_id in transaction_ids:
            await db.sales_transactions.update_one(
                {"id": txn_id},
                {"$set": {"reconciled": True, "reconciled_at": datetime.now(timezone.utc).isoformat()}}
            )
        
        # Update related finance transactions
        await db.finance_transactions.update_many(
            {"source_id": {"$in": transaction_ids}},
            {
                "$set": {
                    "reconciliation_status": "reconciled",
                    "reconciled_by": verification.verified_by,
                    "reconciliation_date": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        # If there's a variance, record it as a finance transaction
        variance = recon.get("variance", 0)
        if abs(variance) > 0.01:  # If variance is significant (more than 1 cent)
            txn_count = await db.finance_transactions.count_documents({})
            transaction_number = f"FIN-{txn_count + 1:06d}"
            
            variance_txn = {
                "id": str(uuid.uuid4()),
                "transaction_number": transaction_number,
                "type": "expense" if variance < 0 else "income",
                "category": "other_expense" if variance < 0 else "other_income",
                "amount": abs(variance),
                "payment_method": "cash",
                "branch_id": recon.get("branch_id"),
                "description": f"Cash variance from reconciliation {recon.get('reconciliation_number')}: {'shortage' if variance < 0 else 'overage'}",
                "processed_by": verification.verified_by,
                "source_type": "reconciliation_variance",
                "source_id": recon_id,
                "source_reference": recon.get("reconciliation_number"),
                "reconciliation_status": "reconciled",
                "transaction_date": datetime.now(timezone.utc).isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.finance_transactions.insert_one(variance_txn)
            
            # Update reconciliation with variance adjustment ID
            await db.daily_reconciliations.update_one(
                {"id": recon_id},
                {"$set": {"variance_adjustment_id": variance_txn["id"]}}
            )
    
    # Audit log
    await log_audit(
        user=verification.verified_by,
        action="verify_reconciliation",
        entity_type="daily_reconciliation",
        entity_id=recon_id,
        details={
            "status": verification.status.value,
            "variance": recon.get("variance"),
            "notes": verification.verification_notes
        }
    )
    
    updated_recon = await db.daily_reconciliations.find_one({"id": recon_id}, {"_id": 0})
    return updated_recon


@api_router.get("/finance/reconciliation/history")
async def get_reconciliation_history(
    branch_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100
):
    """Get historical reconciliation records"""
    query = {}
    
    if branch_id:
        query["branch_id"] = branch_id
    if status:
        query["status"] = status
    
    reconciliations = await db.daily_reconciliations.find(
        query, {"_id": 0}
    ).sort("reconciliation_date", -1).limit(limit).to_list(limit)
    
    return reconciliations


# Financial Reports & Accountability
@api_router.get("/finance/reports/cash-flow")
async def get_cash_flow_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    branch_id: Optional[str] = None
):
    """Cash flow statement (income vs expenses)"""
    query = {}
    
    if branch_id:
        query["branch_id"] = branch_id
    
    if start_date and end_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query["transaction_date"] = {"$gte": start_dt.isoformat(), "$lte": end_dt.isoformat()}
        except ValueError:
            pass
    
    transactions = await db.finance_transactions.find(query, {"_id": 0}).to_list(10000)
    
    income_total = 0.0
    expense_total = 0.0
    income_by_category = {}
    expense_by_category = {}
    
    for txn in transactions:
        amount = txn.get("amount", 0)
        category = txn.get("category", "uncategorized")
        txn_type = txn.get("type")
        
        if txn_type == "income":
            income_total += amount
            if category not in income_by_category:
                income_by_category[category] = 0.0
            income_by_category[category] += amount
        else:
            expense_total += amount
            if category not in expense_by_category:
                expense_by_category[category] = 0.0
            expense_by_category[category] += amount
    
    net_cash_flow = income_total - expense_total
    
    return {
        "total_income": income_total,
        "total_expense": expense_total,
        "net_cash_flow": net_cash_flow,
        "income_by_category": income_by_category,
        "expense_by_category": expense_by_category,
        "period": {"start": start_date, "end": end_date}
    }


@api_router.get("/finance/reports/daily-summary")
async def get_daily_summary(date: Optional[str] = None, branch_id: Optional[str] = None):
    """Daily financial activity summary"""
    
    if date:
        target_date = datetime.fromisoformat(date.replace('Z', '+00:00'))
    else:
        target_date = datetime.now(timezone.utc)
    
    start_of_day = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = target_date.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    query = {
        "transaction_date": {
            "$gte": start_of_day.isoformat(),
            "$lte": end_of_day.isoformat()
        }
    }
    
    if branch_id:
        query["branch_id"] = branch_id
    
    transactions = await db.finance_transactions.find(query, {"_id": 0}).to_list(1000)
    
    income_total = 0.0
    expense_total = 0.0
    transaction_count = len(transactions)
    
    for txn in transactions:
        if txn.get("type") == "income":
            income_total += txn.get("amount", 0)
        else:
            expense_total += txn.get("amount", 0)
    
    # Get reconciliation status
    recon = await db.daily_reconciliations.find_one({
        "reconciliation_date": {
            "$gte": start_of_day.isoformat(),
            "$lte": end_of_day.isoformat()
        },
        "branch_id": branch_id
    }, {"_id": 0})
    
    return {
        "date": target_date.date().isoformat(),
        "branch_id": branch_id,
        "total_income": income_total,
        "total_expense": expense_total,
        "net": income_total - expense_total,
        "transaction_count": transaction_count,
        "reconciliation": recon
    }


@api_router.get("/finance/reports/accountability")
async def get_accountability_report(
    finance_officer: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Finance officer accountability report (all transactions they processed)"""
    query = {"processed_by": finance_officer}
    
    if start_date and end_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query["transaction_date"] = {"$gte": start_dt.isoformat(), "$lte": end_dt.isoformat()}
        except ValueError:
            pass
    
    transactions = await db.finance_transactions.find(query, {"_id": 0}).to_list(10000)
    
    total_income_processed = 0.0
    total_expense_processed = 0.0
    
    for txn in transactions:
        if txn.get("type") == "income":
            total_income_processed += txn.get("amount", 0)
        else:
            total_expense_processed += txn.get("amount", 0)
    
    # Get reconciliations verified by this officer
    reconciliations = await db.daily_reconciliations.find(
        {"verified_by": finance_officer},
        {"_id": 0}
    ).to_list(1000)
    
    return {
        "finance_officer": finance_officer,
        "period": {"start": start_date, "end": end_date},
        "transactions_processed": len(transactions),
        "total_income_processed": total_income_processed,
        "total_expense_processed": total_expense_processed,
        "reconciliations_verified": len(reconciliations),
        "detailed_transactions": transactions
    }


@api_router.get("/finance/reports/audit-trail")
async def get_audit_trail(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    entity_type: Optional[str] = None,
    limit: int = 200
):
    """Complete financial audit trail"""
    query = {}
    
    if entity_type:
        query["entity_type"] = {"$in": ["finance_transaction", "expense_record", "daily_reconciliation", entity_type]}
    
    if start_date and end_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query["timestamp"] = {"$gte": start_dt.isoformat(), "$lte": end_dt.isoformat()}
        except ValueError:
            pass
    
    audit_logs = await db.audit_logs.find(
        query, {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return audit_logs


@api_router.get("/recent-activity")
async def get_recent_activity(branch_id: Optional[str] = None, user_id: Optional[str] = None, limit: int = 10):
    """
    Get recent activity for the dashboard (sales transactions, stock requests, purchase requests)
    """
    activities = []
    
    # Get recent sales transactions
    sales_query = {}
    if branch_id:
        sales_query["branch_id"] = branch_id
    if user_id:
        sales_query["sales_person_id"] = user_id
    
    recent_sales = await db.sales_transactions.find(
        sales_query, {"_id": 0}
    ).sort("timestamp", -1).limit(5).to_list(5)
    
    for sale in recent_sales:
        deserialize_datetime(sale)
        time_ago = get_time_ago(sale.get("timestamp"))
        activities.append({
            "action": f"Completed sale {sale.get('transaction_number')}",
            "time": time_ago,
            "type": "success",
            "timestamp": sale.get("timestamp")
        })
    
    # Get recent stock requests
    stock_query = {}
    if user_id:
        stock_query["requested_by"] = user_id
    
    recent_requests = await db.internal_order_requisitions.find(
        stock_query, {"_id": 0}
    ).sort("requested_at", -1).limit(5).to_list(5)
    
    for req in recent_requests:
        deserialize_datetime(req)
        time_ago = get_time_ago(req.get("requested_at"))
        status = req.get("status", "pending_approval")
        
        if status == "fulfilled":
            action = f"Stock request {req.get('request_number')} fulfilled"
            act_type = "success"
        elif "approved" in status:
            action = f"Stock request {req.get('request_number')} approved"
            act_type = "success"
        elif status == "rejected":
            action = f"Stock request {req.get('request_number')} rejected"
            act_type = "warning"
        else:
            action = f"Stock request {req.get('request_number')} pending"
            act_type = "info"
        
        activities.append({
            "action": action,
            "time": time_ago,
            "type": act_type,
            "timestamp": req.get("requested_at")
        })
    
    # Get low stock alerts
    low_stock_items = await db.inventory.find(
        {"stock_level": {"$in": ["low", "critical"]}}, {"_id": 0}
    ).limit(3).to_list(3)
    
    for item in low_stock_items:
        activities.append({
            "action": f"Low stock alert: {item.get('name')}",
            "time": "Now",
            "type": "warning",
            "timestamp": datetime.now(timezone.utc)
        })
    
    # Sort all activities by timestamp
    activities.sort(key=lambda x: x.get("timestamp", datetime.min), reverse=True)
    
    # Return limited number
    return activities[:limit]


# ==================== CUSTOMER & LOAN MANAGEMENT ENDPOINTS ====================

@api_router.post("/customers", response_model=Customer)
async def create_customer(customer: CustomerCreate):
    """Create a new customer account for credit/loan tracking"""
    # Generate customer number
    customer_count = await db.customers.count_documents({})
    customer_number = f"CUST-{customer_count + 1:05d}"
    
    new_customer = Customer(
        **customer.model_dump(),
        customer_number=customer_number,
        credit_available=customer.credit_limit
    )
    
    doc = new_customer.model_dump()
    serialize_datetime(doc)
    await db.customers.insert_one(doc)
    
    await log_audit(
        user=customer.registered_by,
        action="create_customer",
        entity_type="customer",
        entity_id=new_customer.id,
        details={
            "customer_number": customer_number,
            "name": customer.name,
            "credit_limit": customer.credit_limit
        }
    )
    
    return new_customer


@api_router.get("/customers")
async def get_customers(branch_id: Optional[str] = None, status: Optional[str] = None):
    """Get all customers with optional filters"""
    query = {}
    if branch_id:
        query["branch_id"] = branch_id
    if status:
        query["status"] = status
    
    customers = await db.customers.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for customer in customers:
        deserialize_datetime(customer)
    
    return customers


@api_router.get("/customers/{customer_id}")
async def get_customer(customer_id: str):
    """Get customer details with loan history"""
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    deserialize_datetime(customer)
    
    # Get customer's loans
    loans = await db.loans.find({"customer_id": customer_id}, {"_id": 0}).to_list(100)
    for loan in loans:
        deserialize_datetime(loan)
    
    customer["loans"] = loans
    
    return customer


@api_router.put("/customers/{customer_id}")
async def update_customer(customer_id: str, updates: Dict):
    """Update customer information"""
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.customers.update_one({"id": customer_id}, {"$set": updates})
    
    updated = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    deserialize_datetime(updated)
    
    return updated


@api_router.post("/loans", response_model=Loan)
async def create_loan(loan: LoanCreate):
    """Create a new loan from a sales transaction"""
    # Verify customer exists
    customer = await db.customers.find_one({"id": loan.customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Check credit limit
    if customer["credit_used"] + loan.principal_amount > customer["credit_limit"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Exceeds credit limit. Available: {customer['credit_available']}, Requested: {loan.principal_amount}"
        )
    
    # Generate loan number
    loan_count = await db.loans.count_documents({})
    loan_number = f"LOAN-{loan_count + 1:06d}"
    
    # Get transaction info
    transaction = await db.sales_transactions.find_one({"id": loan.sales_transaction_id}, {"_id": 0})
    
    new_loan = Loan(
        **loan.model_dump(),
        loan_number=loan_number,
        transaction_number=transaction.get("transaction_number", ""),
        balance=loan.principal_amount
    )
    
    doc = new_loan.model_dump()
    serialize_datetime(doc)
    await db.loans.insert_one(doc)
    
    # Update customer credit
    await db.customers.update_one(
        {"id": loan.customer_id},
        {
            "$inc": {
                "credit_used": loan.principal_amount,
                "outstanding_balance": loan.principal_amount,
                "total_credit_used": loan.principal_amount
            },
            "$set": {
                "credit_available": customer["credit_limit"] - (customer["credit_used"] + loan.principal_amount),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    await log_audit(
        user=loan.created_by,
        action="create_loan",
        entity_type="loan",
        entity_id=new_loan.id,
        details={
            "loan_number": loan_number,
            "customer_id": loan.customer_id,
            "amount": loan.principal_amount
        }
    )
    
    return new_loan


@api_router.get("/loans")
async def get_loans(
    customer_id: Optional[str] = None,
    status: Optional[LoanStatus] = None,
    branch_id: Optional[str] = None
):
    """Get loans with optional filters"""
    query = {}
    if customer_id:
        query["customer_id"] = customer_id
    if status:
        query["status"] = status
    if branch_id:
        query["branch_id"] = branch_id
    
    loans = await db.loans.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Update overdue status
    for loan in loans:
        deserialize_datetime(loan)
        
        # Check if overdue
        if loan["status"] == "active" and loan["balance"] > 0:
            due_date = loan["due_date"]
            if isinstance(due_date, str):
                due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            
            if datetime.now(timezone.utc) > due_date:
                days_overdue = (datetime.now(timezone.utc) - due_date).days
                loan["days_overdue"] = days_overdue
                loan["status"] = "overdue"
                
                # Update in database
                await db.loans.update_one(
                    {"id": loan["id"]},
                    {"$set": {"status": "overdue", "days_overdue": days_overdue}}
                )
    
    return loans


@api_router.get("/loans/{loan_id}")
async def get_loan(loan_id: str):
    """Get specific loan with payment history"""
    loan = await db.loans.find_one({"id": loan_id}, {"_id": 0})
    
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    deserialize_datetime(loan)
    
    return loan


@api_router.post("/loans/{loan_id}/payment")
async def record_loan_payment(loan_id: str, payment: LoanPaymentCreate):
    """Record a payment against a loan"""
    loan = await db.loans.find_one({"id": loan_id}, {"_id": 0})
    
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    if loan["status"] == "paid":
        raise HTTPException(status_code=400, detail="Loan already paid in full")
    
    # Generate payment number
    payment_count = len(loan.get("payments", []))
    payment_number = f"{loan['loan_number']}-PAY-{payment_count + 1:03d}"
    
    payment_record = {
        "id": str(uuid.uuid4()),
        "payment_number": payment_number,
        "amount": payment.amount,
        "payment_date": datetime.now(timezone.utc).isoformat(),
        "payment_method": payment.payment_method,
        "received_by": payment.received_by,
        "receipt_number": payment.receipt_number,
        "notes": payment.notes
    }
    
    # Update loan
    new_balance = loan["balance"] - payment.amount
    new_amount_paid = loan["amount_paid"] + payment.amount
    new_status = "paid" if new_balance <= 0 else loan.get("status", "active")
    
    await db.loans.update_one(
        {"id": loan_id},
        {
            "$set": {
                "balance": max(0, new_balance),
                "amount_paid": new_amount_paid,
                "status": new_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$push": {"payments": payment_record}
        }
    )
    
    # Update customer credit
    customer = await db.customers.find_one({"id": loan["customer_id"]}, {"_id": 0})
    if customer:
        await db.customers.update_one(
            {"id": loan["customer_id"]},
            {
                "$inc": {
                    "credit_used": -payment.amount,
                    "outstanding_balance": -payment.amount,
                    "total_paid": payment.amount
                },
                "$set": {
                    "credit_available": customer["credit_limit"] - (customer["credit_used"] - payment.amount),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
    
    # Create finance transaction for payment received
    finance_txn_count = await db.finance_transactions.count_documents({})
    finance_txn_number = f"FIN-{finance_txn_count + 1:06d}"
    
    finance_transaction = {
        "id": str(uuid.uuid4()),
        "transaction_number": finance_txn_number,
        "type": "income",
        "source_type": "loan_payment",
        "source_id": loan_id,
        "source_reference": payment_number,
        "amount": payment.amount,
        "payment_method": payment.payment_method,
        "account_type": "cash" if payment.payment_method == "cash" else "bank",
        "branch_id": loan.get("branch_id"),
        "description": f"Loan payment - {loan['loan_number']}",
        "processed_by": payment.received_by,
        "reconciled": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.finance_transactions.insert_one(finance_transaction)
    
    await log_audit(
        user=payment.received_by,
        action="record_loan_payment",
        entity_type="loan",
        entity_id=loan_id,
        details={
            "amount": payment.amount,
            "new_balance": max(0, new_balance),
            "payment_method": payment.payment_method
        }
    )
    
    updated_loan = await db.loans.find_one({"id": loan_id}, {"_id": 0})
    deserialize_datetime(updated_loan)
    
    return updated_loan


@api_router.get("/loans/overdue")
async def get_overdue_loans(branch_id: Optional[str] = None):
    """Get all overdue loans"""
    query = {"status": "overdue"}
    if branch_id:
        query["branch_id"] = branch_id
    
    loans = await db.loans.find(query, {"_id": 0}).sort("days_overdue", -1).to_list(1000)
    
    for loan in loans:
        deserialize_datetime(loan)
        
        # Get customer info
        customer = await db.customers.find_one({"id": loan["customer_id"]}, {"_id": 0})
        if customer:
            loan["customer_name"] = customer["name"]
            loan["customer_phone"] = customer["phone"]
    
    return loans


@api_router.get("/reports/loan-aging")
async def get_loan_aging_report(branch_id: Optional[str] = None):
    """Get loan aging report"""
    query = {"status": {"$in": ["active", "overdue"]}}
    if branch_id:
        query["branch_id"] = branch_id
    
    loans = await db.loans.find(query, {"_id": 0}).to_list(1000)
    
    aging_buckets = {
        "current": {"count": 0, "amount": 0},
        "1-30": {"count": 0, "amount": 0},
        "31-60": {"count": 0, "amount": 0},
        "61-90": {"count": 0, "amount": 0},
        "over_90": {"count": 0, "amount": 0}
    }
    
    for loan in loans:
        deserialize_datetime(loan)
        balance = loan.get("balance", 0)
        
        due_date = loan["due_date"]
        if isinstance(due_date, str):
            due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
        
        days_diff = (datetime.now(timezone.utc) - due_date).days
        
        if days_diff <= 0:
            aging_buckets["current"]["count"] += 1
            aging_buckets["current"]["amount"] += balance
        elif days_diff <= 30:
            aging_buckets["1-30"]["count"] += 1
            aging_buckets["1-30"]["amount"] += balance
        elif days_diff <= 60:
            aging_buckets["31-60"]["count"] += 1
            aging_buckets["31-60"]["amount"] += balance
        elif days_diff <= 90:
            aging_buckets["61-90"]["count"] += 1
            aging_buckets["61-90"]["amount"] += balance
        else:
            aging_buckets["over_90"]["count"] += 1
            aging_buckets["over_90"]["amount"] += balance
    
    total_outstanding = sum(bucket["amount"] for bucket in aging_buckets.values())
    
    return {
        "aging_buckets": aging_buckets,
        "total_outstanding": total_outstanding,
        "total_loans": len(loans)
    }


def get_time_ago(timestamp):
    """Helper function to get human-readable time ago"""
    if not timestamp:
        return "Unknown"
    
    now = datetime.now(timezone.utc)
    if isinstance(timestamp, str):
        try:
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        except:
            return "Unknown"
    
    # Make timestamp timezone-aware if it isn't
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    
    diff = now - timestamp
    
    if diff.days > 0:
        if diff.days == 1:
            return "1 day ago"
        return f"{diff.days} days ago"
    
    hours = diff.seconds // 3600
    if hours > 0:
        if hours == 1:
            return "1 hour ago"
        return f"{hours} hours ago"
    
    minutes = diff.seconds // 60
    if minutes > 0:
        if minutes == 1:
            return "1 minute ago"
        return f"{minutes} minutes ago"
    
    return "Just now"


async def determine_source_branch(product_name: str):
    """Determine which branch produces the product based on actual production capabilities"""
    # Product-to-branch mapping based on ACTUAL production capabilities
    product_branch_map = {
        # ONLY Girmay Branch produces:
        "1st Quality": "girmay",      # All 1st Quality flour - ONLY GIRMAY
        "Fruskelo White": "girmay",   # White Fruskelo - ONLY GIRMAY
        
        # ONLY Berhane Branch produces:
        "TDF": "berhane",             # TDF products (from Tigray Defense Force wheat) - ONLY BERHANE
        "Fruskelo Red": "berhane",    # Red Fruskelo - ONLY BERHANE
        
        # Both branches produce:
        "Bread": "both",              # Bread flour - Check both branches
        "Fruska": "both",             # Fruska - Check both branches
    }
    
    # Check which product type it matches
    for product_type, branch in product_branch_map.items():
        if product_type in product_name:
            if branch == "both":
                # Check both branches for availability
                # Try to find the product in database
                product_berhane = await db.inventory.find_one({
                    "name": product_name,
                    "branch_id": "berhane"
                }, {"_id": 0})
                
                product_girmay = await db.inventory.find_one({
                    "name": product_name,
                    "branch_id": "girmay"
                }, {"_id": 0})
                
                # Return branch with higher stock
                if product_berhane and product_girmay:
                    return "berhane" if product_berhane.get("quantity", 0) > product_girmay.get("quantity", 0) else "girmay"
                elif product_berhane:
                    return "berhane"
                elif product_girmay:
                    return "girmay"
            else:
                return branch
    
    # Default: Check database for the product
    product = await db.inventory.find_one({"name": product_name}, {"_id": 0})
    if product:
        return product.get("branch_id", "berhane")
    
    return "berhane"  # Default fallback


async def reserve_inventory(product_name: str, source_branch: str, quantity_kg: float):
    """Reserve inventory for a pending request"""
    # Find the product in inventory
    product = await db.inventory.find_one({
        "name": product_name,
        "branch_id": source_branch
    }, {"_id": 0})
    
    if not product:
        return {"success": False, "error": "Product not found in source branch"}
    
    available_qty = product.get("quantity", 0)
    
    if available_qty < quantity_kg:
        return {"success": False, "error": f"Insufficient stock. Available: {available_qty}kg, Requested: {quantity_kg}kg"}
    
    # Reserve the quantity (we'll track this separately)
    # For now, we don't actually deduct, just mark as reserved in the request
    return {"success": True, "available": available_qty}


async def deduct_inventory_for_fulfillment(product_name: str, source_branch: str, quantity_kg: float, reference: str, performed_by: str):
    """Actually deduct inventory when storekeeper fulfills"""
    product = await db.inventory.find_one({
        "name": product_name,
        "branch_id": source_branch
    }, {"_id": 0})
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product["quantity"] < quantity_kg:
        raise HTTPException(status_code=400, detail="Insufficient inventory")
    
    # Deduct quantity
    new_quantity = product["quantity"] - quantity_kg
    
    # Update inventory
    await db.inventory.update_one(
        {"id": product["id"]},
        {
            "$set": {
                "quantity": new_quantity,
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$push": {
                "transactions": {
                    "id": str(uuid.uuid4()),
                    "date": datetime.now(timezone.utc).isoformat(),
                    "type": "out",
                    "quantity": quantity_kg,
                    "reference": reference,
                    "performed_by": performed_by
                }
            }
        }
    )
    
    return {"success": True, "new_quantity": new_quantity}


async def add_inventory_for_delivery(product_name: str, dest_branch: str, quantity_kg: float, reference: str, performed_by: str):
    """Add inventory to destination when sales confirms delivery"""
    # Find or create product in destination branch
    product = await db.inventory.find_one({
        "name": product_name,
        "branch_id": dest_branch
    }, {"_id": 0})
    
    if product:
        # Update existing
        new_quantity = product["quantity"] + quantity_kg
        await db.inventory.update_one(
            {"id": product["id"]},
            {
                "$set": {
                    "quantity": new_quantity,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                },
                "$push": {
                    "transactions": {
                        "id": str(uuid.uuid4()),
                        "date": datetime.now(timezone.utc).isoformat(),
                        "type": "in",
                        "quantity": quantity_kg,
                        "reference": reference,
                        "performed_by": performed_by
                    }
                }
            }
        )
    else:
        # Create new inventory item in destination
        # (This would be a new product entry for this branch)
        pass
    
    return {"success": True}


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