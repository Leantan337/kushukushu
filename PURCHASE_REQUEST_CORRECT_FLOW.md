# Purchase Request - CORRECT Flow (Updated)

## 🏢 Chain of Command

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORGANIZATIONAL HIERARCHY                      │
└─────────────────────────────────────────────────────────────────┘

1. OWNER (Top Level)
   - Final authority
   - Approves high-value purchase requests (> Br 50,000)

2. ADMIN (Next to Owner)
   - Can approve purchase requests up to threshold (≤ Br 50,000)
   - Has approval authority for routine purchases

3. FINANCE
   - Tracks all financial transactions
   - Processes payments after approval
   - Manages company funds

4. SALES
   - Requests purchases for their needs
   - Can pay from daily sales revenue if available
   - Otherwise, Finance pays with Admin/Owner approval

5. MANAGER
   - **Factory operations ONLY**
   - **NOT in purchase approval chain!**
   - Handles production, inventory, gate passes
```

## 🔄 Purchase Request Workflow (CORRECTED)

### Flow Diagram:

```
┌─────────────────────────────────────────────────────────────────┐
│              PURCHASE REQUEST APPROVAL FLOW                      │
└─────────────────────────────────────────────────────────────────┘

Step 1: SALES CREATES REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📝 Sales person identifies need and creates purchase request
  ↓
  System automatically routes based on amount:
  
  
  IF Amount ≤ Br 50,000 (Admin Threshold)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ↓
    Status: "pending_admin_approval"
    Routing: → ADMIN
    
    ↓
    Step 2: ADMIN APPROVES
    ━━━━━━━━━━━━━━━━━━━━
      ✅ Admin reviews and approves
      ↓
      Status: "admin_approved"
      ↓
      Step 3: FINANCE PROCESSES PAYMENT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        💰 Finance pays from company funds
        OR
        💰 Sales pays from daily revenue (if available)
        ↓
        Status: "completed"


  IF Amount > Br 50,000 (Exceeds Admin Threshold)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ↓
    Status: "pending_owner_approval"
    Routing: → OWNER
    
    ↓
    Step 2: OWNER APPROVES
    ━━━━━━━━━━━━━━━━━━━━
      ✅ Owner reviews and approves
      ↓
      Status: "owner_approved"
      ↓
      Step 3: FINANCE PROCESSES PAYMENT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        💰 Finance pays from company funds
        OR
        💰 Sales pays from daily revenue (if available)
        ↓
        Status: "completed"


  ❌ REJECTION (Can happen at any stage)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Admin or Owner can reject
    ↓
    Status: "rejected"
    ↓
    Process ends
```

## 📊 Status Definitions

| Status | Meaning | Who Can See It | Next Action |
|--------|---------|----------------|-------------|
| `pending_admin_approval` | Amount ≤ Br 50,000, waiting for admin | **Admin Dashboard** | Admin approves/rejects |
| `pending_owner_approval` | Amount > Br 50,000, waiting for owner | **Owner Dashboard → Approvals** | Owner approves/rejects |
| `admin_approved` | Admin approved, ready for payment | **Finance Dashboard** | Finance processes payment |
| `owner_approved` | Owner approved, ready for payment | **Finance Dashboard** | Finance processes payment |
| `completed` | Payment processed and completed | All (history) | Archived |
| `rejected` | Rejected by Admin or Owner | All (history) | No further action |

## 🎯 Role Responsibilities

### OWNER
- ✅ Approves purchase requests > Br 50,000
- ✅ Can reject any purchase request
- ✅ Final authority on all purchases
- ❌ Does NOT see small purchases (≤ Br 50,000)

### ADMIN
- ✅ Approves purchase requests ≤ Br 50,000
- ✅ Can reject any purchase request
- ✅ Manages routine operational purchases
- ❌ Cannot approve purchases > Br 50,000

### FINANCE
- ✅ Tracks ALL purchase requests
- ✅ Processes payments for approved requests
- ✅ Can pay from company funds or coordinate with Sales
- ✅ Records all financial transactions
- ❌ Cannot approve (only pays)

### SALES
- ✅ Creates purchase requests for their needs
- ✅ Can pay from daily sales revenue if available
- ✅ Tracks their own purchase requests
- ❌ Cannot approve their own requests

### MANAGER (Factory Operations)
- ✅ Handles wheat delivery
- ✅ Manages milling orders
- ✅ Approves gate passes for finished products
- ✅ Approves stock transfers
- ❌ **NOT in purchase request approval chain!**
- ❌ Does not see or approve purchase requisitions

## 💰 Admin Approval Threshold

The admin threshold can be configured in Financial Controls:

**Default: Br 50,000**

- Purchases ≤ Br 50,000 → Admin can approve
- Purchases > Br 50,000 → Requires Owner approval

This threshold can be adjusted by Owner in:
`Owner Dashboard → Financial Controls → Admin Purchase Approval Threshold`

## 🖥️ Where to Find Purchase Requests

### Admin Dashboard
```
Status to filter: pending_admin_approval

Endpoint: GET /api/purchase-requisitions?status=pending_admin_approval

UI Location: Admin Dashboard → Purchase Approvals (to be added)
```

### Owner Dashboard
```
Status to filter: pending_owner_approval

Endpoint: GET /api/purchase-requisitions?status=pending_owner_approval

UI Location: Owner Dashboard → Approvals → Other Approvals tab
```

### Finance Dashboard
```
Status to filter: admin_approved OR owner_approved

Endpoint: GET /api/purchase-requisitions?status=admin_approved
          GET /api/purchase-requisitions?status=owner_approved

UI Location: Finance Dashboard → Pending Authorizations
```

### Sales Dashboard
```
View their own requests: GET /api/purchase-requisitions

UI Location: Sales Dashboard → Purchase Request tab
             (Shows all their requests with current status)
```

## 🔌 API Endpoints

### Create Purchase Request
```bash
POST /api/purchase-requests

Body:
{
  "description": "Office Supplies",
  "item_name": "Pens and Paper",
  "quantity": 100,
  "unit": "items",
  "estimated_cost": 35000,
  "supplier_name": "Office Mart",
  "requested_by": "Sales Person Name",
  "branch_id": "sales_branch",
  "urgency": "normal",
  "category": "supplies",
  "payment_source": "finance"  // or "sales_revenue"
}

Response:
{
  "id": "uuid",
  "request_number": "PR-20251012-xxxx",
  "status": "pending_admin_approval",  // or "pending_owner_approval"
  "routing": "admin",  // or "owner"
  "admin_threshold": 50000,
  ...
}
```

### Admin Approval
```bash
PUT /api/purchase-requisitions/{id}/approve-admin

Body:
{
  "approved_by": "Admin Name",
  "notes": "Approved for operational needs"
}

Response:
{
  "status": "admin_approved",
  "next_step": "finance_payment",
  ...
}
```

### Owner Approval
```bash
PUT /api/purchase-requisitions/{id}/approve-owner

Body:
{
  "approved_by": "Owner Name",
  "notes": "Approved"
}

Response:
{
  "status": "owner_approved",
  "next_step": "finance_payment",
  ...
}
```

### Rejection
```bash
PUT /api/purchase-requisitions/{id}/reject

Body:
{
  "rejected_by": "Admin Name",  // or "Owner Name"
  "rejection_reason": "Not in budget"
}

Response:
{
  "status": "rejected",
  ...
}
```

### Query Purchase Requests
```bash
# All requests
GET /api/purchase-requisitions

# Filter by status
GET /api/purchase-requisitions?status=pending_admin_approval
GET /api/purchase-requisitions?status=pending_owner_approval
GET /api/purchase-requisitions?status=admin_approved
GET /api/purchase-requisitions?status=owner_approved

# Filter by branch
GET /api/purchase-requisitions?branch_id=sales_branch
```

## 🧪 Testing Examples

### Example 1: Small Purchase (Admin Approves)
```bash
# 1. Sales creates request (Br 25,000 - under threshold)
curl -X POST http://localhost:8000/api/purchase-requests \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Office Supplies",
    "item_name": "Stationery",
    "estimated_cost": 25000,
    "requested_by": "Sales Person"
  }'

# Response shows: "status": "pending_admin_approval"

# 2. Admin approves
curl -X PUT http://localhost:8000/api/purchase-requisitions/{id}/approve-admin \
  -H "Content-Type: application/json" \
  -d '{
    "approved_by": "Admin",
    "notes": "Approved"
  }'

# Response shows: "status": "admin_approved", "next_step": "finance_payment"

# 3. Finance processes payment (to be implemented)
```

### Example 2: Large Purchase (Owner Approves)
```bash
# 1. Sales creates request (Br 75,000 - above threshold)
curl -X POST http://localhost:8000/api/purchase-requests \
  -H "Content-Type: application/json" \
  -d '{
    "description": "New Equipment",
    "item_name": "Packaging Machine",
    "estimated_cost": 75000,
    "requested_by": "Sales Person"
  }'

# Response shows: "status": "pending_owner_approval"

# 2. Owner approves
curl -X PUT http://localhost:8000/api/purchase-requisitions/{id}/approve-owner \
  -H "Content-Type: application/json" \
  -d '{
    "approved_by": "Owner",
    "notes": "Approved for expansion"
  }'

# Response shows: "status": "owner_approved", "next_step": "finance_payment"

# 3. Finance processes payment (to be implemented)
```

## ✅ What Changed from Previous Flow

### REMOVED:
- ❌ Manager approval step
- ❌ Three-level approval (Manager → Admin → Owner)
- ❌ Manager visibility of purchase requests

### ADDED:
- ✅ Automatic routing based on amount
- ✅ Admin threshold check
- ✅ Direct routing to Admin OR Owner (not both)
- ✅ Payment source tracking (Finance vs Sales Revenue)

### KEPT:
- ✅ Owner final authority
- ✅ Finance payment processing
- ✅ Rejection capability
- ✅ Status tracking

## 🚀 Next Steps

### For Immediate Use:
1. **Check your pending requests:**
   ```bash
   curl "http://localhost:8000/api/purchase-requisitions?status=pending_admin_approval"
   curl "http://localhost:8000/api/purchase-requisitions?status=pending_owner_approval"
   ```

2. **Update existing pending requests** (if needed):
   - Requests with "pending" status should be updated to either:
     - "pending_admin_approval" (if amount ≤ Br 50,000)
     - "pending_owner_approval" (if amount > Br 50,000)

3. **Add Admin Approval Screen:**
   - Create Admin Dashboard → Purchase Approvals tab
   - Show requests with status "pending_admin_approval"
   - Allow approve/reject actions

4. **Update Finance Dashboard:**
   - Show requests with status "admin_approved" OR "owner_approved"
   - Add payment processing functionality

---

*This is the CORRECT flow based on your organizational structure!*
*Manager is NOT in the purchase approval chain - they only handle factory operations.*


