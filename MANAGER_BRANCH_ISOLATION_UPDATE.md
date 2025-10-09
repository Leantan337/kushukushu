# Manager Branch Isolation Update

## Overview
Updated the manager role to have complete branch isolation similar to the storekeeper role. Managers now select their branch at login and can only manage operations for their specific branch. Additionally, managers can now start milling orders without requiring owner approval.

## Date: October 9, 2025

---

## Changes Made

### 1. Frontend - Login System (`UnifiedLogin.jsx`)

**Added branch selection for managers:**
- Managers now must select their branch during login (Berhane or Girmay)
- Updated role configuration to mark manager as `needsBranch: true`
- Branch selection UI shows appropriate message for managers: "You will manage operations for your selected branch"
- Login button is disabled until both role and branch are selected for managers

**Key Changes:**
```javascript
// Managers now require branch selection
{ value: "manager", label: "Manager", route: "/manager/dashboard", needsBranch: true }

// Branch selection shown for both storekeeper and manager
{(selectedRole === "storekeeper" || selectedRole === "manager") && (
  <div className="space-y-2">
    <Label>Select Branch</Label>
    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
      {/* Branch options */}
    </Select>
  </div>
)}
```

---

### 2. Manager Dashboard (`ManagerDashboard.jsx`)

**Branch-aware user context:**
- Added `getUserInfo()` function to retrieve branch from localStorage
- Manager information now includes: id, name, branch_id, and branch_name
- Dashboard header displays current branch with a badge
- All API calls now filter by branch_id

**Key Changes:**
```javascript
const getUserInfo = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    id: `manager-${user.branch}`,
    name: user.name || user.username,
    branch_id: user.branch,
    branch_name: user.branch === "berhane" ? "Berhane Branch" : "Girmay Branch"
  };
};

// Dashboard stats filtered by branch
const approvalResponse = await fetch(
  `${backendUrl}/api/inventory-requests/manager-queue?branch_id=${currentManager.branch_id}`
);
const inventoryResponse = await fetch(
  `${backendUrl}/api/inventory?branch_id=${currentManager.branch_id}`
);
```

**UI Updates:**
- Branch name badge displayed next to dashboard title
- Raw wheat stock shows only for manager's branch
- Pending approvals filtered to branch-specific requests

---

### 3. Manager Queue (`ManagerQueue.jsx`)

**Branch-filtered order queue:**
- Fetch pending orders with branch_id query parameter
- Double-filter to ensure only orders from manager's branch are shown
- Orders filtered by both `branch_id` and `source_branch` fields

**Key Changes:**
```javascript
const fetchPendingOrders = async () => {
  const response = await fetch(
    `${backendUrl}/api/inventory-requests/manager-queue?branch_id=${manager.branch_id}`
  );
  const data = await response.json();
  const branchOrders = data.filter(
    order => order.branch_id === manager.branch_id || order.source_branch === manager.branch_id
  );
  setPendingOrders(branchOrders);
};
```

---

### 4. Manager Stock Approvals (`ManagerStockApprovals.jsx`)

**Complete branch isolation:**
- Added `getUserInfo()` function to get current manager's branch
- All stock requests filtered by source_branch matching manager's branch
- Branch badge displayed in component header
- Approval actions use manager's name from user context

**Key Changes:**
```javascript
// Fetch only branch-specific requests
const response = await fetch(
  `${BACKEND_URL}/api/stock-requests?status=pending_manager_approval&branch_id=${currentManager.branch_id}`
);
const branchRequests = data.filter(req => req.source_branch === currentManager.branch_id);

// Use manager's actual name in approvals
body: JSON.stringify({
  approved_by: currentManager.name,
  notes: notes || "Approved - capacity verified"
})
```

---

### 5. Milling Order Form (`MillingOrderForm.jsx`)

**Branch-specific inventory:**
- Inventory fetched with branch_id filter
- Raw wheat stock calculated only for manager's branch
- All milling operations isolated to manager's branch

**Key Changes:**
```javascript
const fetchData = async () => {
  const inventoryResponse = await fetch(
    `${backendUrl}/api/inventory?branch_id=${manager.branch_id}`
  );
  const branchInventory = inventoryData.filter(
    item => item.branch_id === manager.branch_id
  );
  setInventory(branchInventory);
};
```

---

### 6. Backend API Updates (`server.py`)

#### A. Manager Queue Endpoint
**Added branch filtering support:**
```python
@api_router.get("/inventory-requests/manager-queue")
async def get_manager_queue(branch_id: Optional[str] = None):
    """Fetches stock requests with optional branch filter"""
    query = {"status": InternalOrderStatus.PENDING_MANAGER_APPROVAL}
    if branch_id:
        query["source_branch"] = branch_id
    orders = await db.stock_requests.find(query, {"_id": 0}).to_list(1000)
    return orders
```

#### B. Milling Orders Endpoint
**Branch-specific raw wheat checking:**
```python
@api_router.post("/milling-orders", response_model=MillingOrder)
async def create_milling_order(order: MillingOrderCreate):
    """Creates milling order with branch-specific inventory"""
    raw_wheat_item = await db.inventory.find_one(
        {"name": "Raw Wheat", "branch_id": order.branch_id}, 
        {"_id": 0}
    )
    if not raw_wheat_item:
        raise HTTPException(
            status_code=404, 
            detail=f"Raw Wheat inventory not found for branch {order.branch_id}"
        )
    # ... rest of logic
```

#### C. Milling Order Completion
**Branch-specific output products:**
```python
@api_router.post("/milling-orders/{order_id}/complete")
async def complete_milling_order(order_id: str, completion: MillingOrderCompletion):
    """Completes order and adds products to branch inventory"""
    branch_id = milling_order.get("branch_id")
    for output in completion.outputs:
        product_item = await db.inventory.find_one(
            {"id": output.product_id, "branch_id": branch_id}, 
            {"_id": 0}
        )
        # ... add to branch inventory
```

#### D. Wheat Delivery Endpoint
**Branch-specific wheat delivery:**
```python
@api_router.post("/wheat-deliveries", response_model=RawWheatDelivery)
async def create_wheat_delivery(delivery: RawWheatDeliveryCreate):
    """Records wheat delivery for specific branch"""
    raw_wheat_item = await db.inventory.find_one(
        {"name": "Raw Wheat", "branch_id": delivery.branch_id}, 
        {"_id": 0}
    )
    if not raw_wheat_item:
        raise HTTPException(
            status_code=404, 
            detail=f"Raw Wheat inventory not found for branch {delivery.branch_id}"
        )
    # ... add to branch inventory
```

---

## Key Features Implemented

### ✅ Branch Isolation
- **Login**: Managers select their branch at login
- **Dashboard**: Shows only branch-specific data and statistics
- **Inventory**: Managers see and manage only their branch's inventory
- **Orders**: All order queues filtered by branch
- **Approvals**: Only see stock requests from their branch

### ✅ No Approval Required for Milling
- Managers can **immediately start milling orders** without owner approval
- Milling orders execute instantly when sufficient raw wheat is available
- Only requirement: adequate raw wheat stock in the manager's branch

### ✅ Data Isolation
- Raw wheat deliveries added only to the manager's branch inventory
- Milling orders use and produce inventory only for the manager's branch
- Stock approvals limited to requests originating from the manager's branch
- All statistics and reports show branch-specific data

---

## Branch Workflow

### Manager A (Berhane Branch)
1. Logs in and selects "Berhane Branch"
2. Sees Berhane's inventory: Raw Wheat, 1st Quality Flour, etc.
3. Records wheat delivery → adds to Berhane inventory
4. Creates milling order → uses Berhane raw wheat, produces Berhane flour
5. Approves stock requests → only sees Berhane requests
6. **Cannot see or affect Girmay Branch operations**

### Manager B (Girmay Branch)
1. Logs in and selects "Girmay Branch"
2. Sees Girmay's inventory: Raw Wheat, 1st Quality Flour, etc.
3. Records wheat delivery → adds to Girmay inventory
4. Creates milling order → uses Girmay raw wheat, produces Girmay flour
5. Approves stock requests → only sees Girmay requests
6. **Cannot see or affect Berhane Branch operations**

---

## API Endpoints Updated

| Endpoint | Change | Purpose |
|----------|--------|---------|
| `GET /inventory` | Already had `branch_id` filter | Filter inventory by branch |
| `GET /inventory-requests/manager-queue` | Added `branch_id` filter | Branch-specific approval queue |
| `GET /stock-requests` | Already had filters | Branch-specific stock requests |
| `POST /milling-orders` | Branch-specific raw wheat check | Ensure branch isolation |
| `POST /milling-orders/{id}/complete` | Branch-specific product lookup | Add outputs to correct branch |
| `POST /wheat-deliveries` | Branch-specific inventory update | Add wheat to correct branch |

---

## Testing Checklist

### Login Testing
- [ ] Manager can select Berhane branch during login
- [ ] Manager can select Girmay branch during login
- [ ] Cannot login as manager without selecting a branch
- [ ] Branch selection persists in localStorage

### Dashboard Testing
- [ ] Dashboard shows correct branch name badge
- [ ] Raw wheat stock shows only for selected branch
- [ ] Pending approvals count is branch-specific
- [ ] Quick actions work for the selected branch

### Milling Order Testing
- [ ] Can create milling order without approval
- [ ] Milling deducts raw wheat from correct branch
- [ ] Insufficient wheat error shows branch name
- [ ] Completed milling adds products to correct branch
- [ ] Cannot access other branch's raw wheat

### Approval Queue Testing
- [ ] Only see stock requests from own branch
- [ ] Cannot approve requests from other branch
- [ ] Approval actions recorded with manager's name
- [ ] Branch name visible in approval interface

### Wheat Delivery Testing
- [ ] Wheat delivery adds to correct branch inventory
- [ ] Cannot add wheat to wrong branch
- [ ] Delivery history shows only for manager's branch

---

## Error Handling

### Branch Not Found Errors
- **Raw wheat not found**: "Raw Wheat inventory not found for branch {branch_id}"
- **Product not found**: "Product with ID {id} not found for branch {branch_id}"
- **Insufficient wheat**: "Insufficient raw wheat in {branch_id} branch. Available: Xkg, Required: Ykg"

---

## Summary

The manager role now has **complete branch isolation** similar to storekeepers:
- ✅ Select branch at login
- ✅ See only branch-specific data
- ✅ Manage only branch inventory
- ✅ Approve only branch requests
- ✅ **No approval needed to start milling** (was removed - managers operate independently)
- ✅ All operations isolated to selected branch

This ensures that:
1. Berhane manager cannot affect Girmay operations
2. Girmay manager cannot affect Berhane operations
3. Each manager has full autonomy within their branch
4. Inventory tracking remains accurate per branch
5. Milling operations happen immediately when sufficient raw wheat exists

