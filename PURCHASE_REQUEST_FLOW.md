# Purchase Request Flow - Complete Guide

## 🔄 The Complete Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PURCHASE REQUEST APPROVAL WORKFLOW                    │
└─────────────────────────────────────────────────────────────────────────┘

Step 1: CREATE (Sales/Manager)
━━━━━━━━━━━━━━━━━━━━━━━━━━
  📝 Sales or Manager creates purchase request
  ↓
  Status: "pending"
  ↓
  Stored in MongoDB: purchase_requisitions collection


Step 2: MANAGER APPROVAL
━━━━━━━━━━━━━━━━━━━━━━━━━━
  👨‍💼 Manager reviews and approves
  ↓
  Endpoint: PUT /api/purchase-requisitions/{id}/approve-manager
  ↓
  Status: "manager_approved"


Step 3: ADMIN APPROVAL
━━━━━━━━━━━━━━━━━━━━━━━━━━
  👤 Admin reviews and approves
  ↓
  Endpoint: PUT /api/purchase-requisitions/{id}/approve-admin
  ↓
  Status: "admin_approved"


Step 4: OWNER APPROVAL
━━━━━━━━━━━━━━━━━━━━━━━━━━
  👑 Owner reviews and approves
  ↓
  Endpoint: PUT /api/purchase-requisitions/{id}/approve-owner
  ↓
  Status: "owner_approved"


Step 5: FINANCE PAYMENT (Future)
━━━━━━━━━━━━━━━━━━━━━━━━━━
  💰 Finance processes payment
  ↓
  Endpoint: POST /api/finance/request-funds/{id}
  ↓
  Status: "completed"
```

## 📍 Where to Find Your Purchase Request

### Current Status: "pending"
Your purchase request is waiting for **MANAGER APPROVAL**.

### Where Each Role Can See It:

| Role | Status Filter | Where to Look |
|------|---------------|---------------|
| **Manager** | `status=pending` | Manager Dashboard → Purchase Requisitions |
| **Admin** | `status=manager_approved` | Admin Dashboard → Purchase Requisitions |
| **Owner** | `status=admin_approved` | Owner Dashboard → Approvals → Other Approvals tab |
| **Finance** | `status=owner_approved` | Finance Dashboard → Pending Authorizations |

## 🎯 How to View Your Purchase Request

### Option 1: Use the PurchaseRequisitions Component

There's a dedicated component at:
`frontend/src/components/requisitions/PurchaseRequisitions.jsx`

This component shows purchase requests based on your role and their status.

### Option 2: Direct API Query

Check if your request exists:
```bash
# See all purchase requests
curl http://localhost:8000/api/purchase-requisitions

# See pending requests (waiting for manager)
curl "http://localhost:8000/api/purchase-requisitions?status=pending"

# See manager-approved (waiting for admin)
curl "http://localhost:8000/api/purchase-requisitions?status=manager_approved"

# See admin-approved (waiting for owner)
curl "http://localhost:8000/api/purchase-requisitions?status=admin_approved"

# See owner-approved (waiting for finance)
curl "http://localhost:8000/api/purchase-requisitions?status=owner_approved"
```

### Option 3: Check MongoDB Directly

```javascript
// In MongoDB shell or Compass
db.purchase_requisitions.find({}).sort({requested_at: -1})

// Find your most recent request
db.purchase_requisitions.find({}).sort({requested_at: -1}).limit(1)

// Find by status
db.purchase_requisitions.find({status: "pending"})
```

## 🔧 Current System Gap

**Issue:** The system is missing direct navigation to Purchase Requisitions screens!

Currently:
- ✅ Owner can see purchase requests in Approvals Screen (when status=admin_approved)
- ⚠️ Manager doesn't have a dedicated purchase requisitions approval screen
- ⚠️ Admin doesn't have a dedicated purchase requisitions approval screen
- ⚠️ Finance doesn't show purchase requisitions (only in pending authorizations)

## 🛠️ Solution: Add Purchase Requisitions to Dashboards

### For Manager Dashboard

Add this to `ManagerDashboard.jsx`:

```jsx
import PurchaseRequisitions from "../requisitions/PurchaseRequisitions";

// In the dashboard tabs:
<TabsTrigger value="purchase-requests">Purchase Requests</TabsTrigger>

// In the content area:
<TabsContent value="purchase-requests">
  <PurchaseRequisitions userRole="manager" />
</TabsContent>
```

### For Admin Dashboard

Add this to `AdminDashboard.jsx`:

```jsx
// Quick navigation button
<QuickNavCard
  title="Purchase Requisitions"
  icon={ShoppingCart}
  color="bg-indigo-600"
  onClick={() => navigate("/purchase-requisitions")}
/>
```

### For Finance Dashboard

The finance module should show owner-approved requisitions for payment processing.

## 📊 Status Definitions

| Status | Meaning | Who Can See It | What Happens Next |
|--------|---------|----------------|-------------------|
| `pending` | Just created, waiting for manager | Manager | Manager approves/rejects |
| `manager_approved` | Manager approved, waiting for admin | Admin | Admin approves/rejects |
| `admin_approved` | Admin approved, waiting for owner | Owner | Owner approves/rejects |
| `owner_approved` | Owner approved, ready for payment | Finance | Finance processes payment |
| `completed` | Paid and completed | All (history) | Archived |
| `rejected` | Rejected at any stage | All (history) | No further action |

## 🧪 Testing Your Purchase Request

### 1. Verify It Was Created

```bash
python -c "
import requests
response = requests.get('http://localhost:8000/api/purchase-requisitions?status=pending')
data = response.json()
print(f'Found {len(data)} pending purchase requests')
for req in data:
    print(f'  - {req.get(\"request_number\")}: {req.get(\"description\")} - Br {req.get(\"estimated_cost\")}')
"
```

### 2. Check the Data

```bash
# Get the most recent purchase request
curl http://localhost:8000/api/purchase-requisitions?status=pending | python -m json.tool
```

### 3. Manually Approve (For Testing)

```bash
# Replace {request-id} with your actual request ID

# Manager approval
curl -X PUT http://localhost:8000/api/purchase-requisitions/{request-id}/approve-manager \
  -H "Content-Type: application/json" \
  -d '{"approved_by": "Manager Test", "notes": "Approved for testing"}'

# Admin approval
curl -X PUT http://localhost:8000/api/purchase-requisitions/{request-id}/approve-admin \
  -H "Content-Type: application/json" \
  -d '{"approved_by": "Admin Test", "notes": "Approved for testing"}'

# Owner approval
curl -X PUT http://localhost:8000/api/purchase-requisitions/{request-id}/approve-owner \
  -H "Content-Type: application/json" \
  -d '{"approved_by": "Owner Test", "notes": "Approved for testing"}'
```

## 🎬 Quick Fix: Test the Flow

Create a test script:

```bash
# Save as test_purchase_request_flow.py

import requests
import json
from time import sleep

BACKEND_URL = "http://localhost:8000"

# 1. Create purchase request
print("1️⃣ Creating purchase request...")
create_response = requests.post(f"{BACKEND_URL}/api/purchase-requests", json={
    "description": "Test Office Supplies",
    "item_name": "Office Supplies",
    "quantity": 10,
    "unit": "boxes",
    "estimated_cost": 5000,
    "supplier_name": "Office Depot",
    "requested_by": "Test User",
    "branch_id": "berhane",
    "urgency": "normal",
    "category": "supplies"
})

if create_response.ok:
    req_data = create_response.json()
    req_id = req_data['id']
    print(f"✅ Created: {req_data['request_number']} - Status: {req_data['status']}")
    
    # 2. Manager approval
    print("\n2️⃣ Manager approving...")
    sleep(1)
    mgr_response = requests.put(
        f"{BACKEND_URL}/api/purchase-requisitions/{req_id}/approve-manager",
        json={"approved_by": "Manager Test", "notes": "Approved"}
    )
    if mgr_response.ok:
        print(f"✅ Manager approved - Status: {mgr_response.json()['status']}")
    
    # 3. Admin approval
    print("\n3️⃣ Admin approving...")
    sleep(1)
    admin_response = requests.put(
        f"{BACKEND_URL}/api/purchase-requisitions/{req_id}/approve-admin",
        json={"approved_by": "Admin Test", "notes": "Approved"}
    )
    if admin_response.ok:
        print(f"✅ Admin approved - Status: {admin_response.json()['status']}")
    
    # 4. Owner approval
    print("\n4️⃣ Owner approving...")
    sleep(1)
    owner_response = requests.put(
        f"{BACKEND_URL}/api/purchase-requisitions/{req_id}/approve-owner",
        json={"approved_by": "Owner Test", "notes": "Approved"}
    )
    if owner_response.ok:
        print(f"✅ Owner approved - Status: {owner_response.json()['status']}")
        print(f"\n🎉 Purchase request fully approved and ready for payment!")
        print(f"Finance can now see it at: /api/finance/pending-authorizations")
else:
    print(f"❌ Failed to create: {create_response.text}")
```

Run it:
```bash
python test_purchase_request_flow.py
```

## 💡 Why You Can't See Your Request

Your purchase request is in status **"pending"**, which means:

- ❌ **Not visible to Owner** - Owner only sees status = "admin_approved"
- ❌ **Not visible to Admin** (no dedicated screen yet) - Admin should see status = "manager_approved"
- ❌ **Not visible to Finance** - Finance only sees status = "owner_approved"
- ✅ **Should be visible to Manager** - Manager should see status = "pending"

**The problem:** There's no dedicated screen in Manager/Admin dashboards to show purchase requisitions!

## ✅ Immediate Solutions

### Solution 1: Use the API
```bash
# Check your pending requests
curl "http://localhost:8000/api/purchase-requisitions?status=pending"
```

### Solution 2: Manually Approve Through API
Use the test script above to move it through the workflow.

### Solution 3: Add PurchaseRequisitions Component to Dashboards
(I can help you add this if needed!)

---

*Need help adding purchase requisitions screens to Manager/Admin dashboards? Let me know!*


