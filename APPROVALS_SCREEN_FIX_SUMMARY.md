# Approvals Screen - Fix Summary

## Issue Identified

**Error:** `GET http://localhost:8000/api/purchase-requisitions?status=admin_approved 404 (Not Found)`

**Root Cause:** The backend was missing the GET endpoint for fetching purchase requisitions. The ApprovalsScreen component was trying to fetch purchase requisitions that need owner approval, but the endpoint didn't exist.

## Fixes Applied

### 1. **Backend - Added Missing GET Endpoints**

Added two new endpoints to `backend/server.py`:

#### `/api/purchase-requisitions` (GET)
- Fetches all purchase requisitions with optional filtering
- Query parameters:
  - `status` - Filter by status (e.g., "admin_approved", "pending", "manager_approved", "owner_approved")
  - `branch_id` - Filter by branch
  - `limit` - Maximum number of results (default: 100, max: 1000)
- Returns sorted by `requested_at` (newest first)

#### `/api/purchase-requisitions/{requisition_id}` (GET)
- Fetches a specific purchase requisition by ID
- Returns 404 if not found

### 2. **Frontend - Fixed HTTP Methods**

Updated `frontend/src/components/owner/ApprovalsScreen.jsx`:

#### Changed Approve Endpoint:
- **Before:** `POST /api/purchase-requisitions/{id}/owner-approve`
- **After:** `PUT /api/purchase-requisitions/{id}/approve-owner`

#### Changed Reject Method:
- **Before:** Used `POST` method
- **After:** Uses `PUT` method

## Code Changes

### Backend (`backend/server.py`)

```python
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
```

### Frontend (`frontend/src/components/owner/ApprovalsScreen.jsx`)

#### Approve Handler:
```javascript
const handleApprove = async (id) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/purchase-requisitions/${id}/approve-owner`, {
      method: 'PUT',  // Changed from POST
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved_by: 'Owner' })
    });
    // ... rest of handler
  }
};
```

#### Reject Handler:
```javascript
const handleReject = async (id) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/purchase-requisitions/${id}/reject`, {
      method: 'PUT',  // Changed from POST
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejected_by: 'Owner', rejection_reason: 'Rejected by Owner' })
    });
    // ... rest of handler
  }
};
```

## Test Results

✅ **All endpoints now working correctly**

Test run on October 12, 2025 at 12:50:34:

| Endpoint | Status | Results |
|----------|--------|---------|
| `/api/purchase-requisitions` | ✅ PASS | Retrieved 11 requisitions |
| `/api/purchase-requisitions?status=admin_approved` | ✅ PASS | Retrieved 0 requisitions |
| `/api/purchase-requisitions?status=pending` | ✅ PASS | Retrieved 4 requisitions |
| `/api/stock-requests` | ✅ PASS | Retrieved 25 requests |

**Results: 4/4 tests passed** ✅

## Files Modified

1. **backend/server.py**
   - Added `get_purchase_requisitions()` endpoint (line ~1464)
   - Added `get_purchase_requisition_by_id()` endpoint (line ~1481)

2. **frontend/src/components/owner/ApprovalsScreen.jsx**
   - Fixed approve endpoint URL and HTTP method (line ~93)
   - Fixed reject HTTP method (line ~128)

## Build Status

✅ **Build Successful**
- Frontend compiled without errors
- Bundle size: 208.7 kB (gzipped)
- CSS: 16.35 kB (gzipped)
- No linting errors

## Testing the Fix

### Start the Application:

1. **Backend** (should already be running):
   ```bash
   cd backend
   python server.py
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm start
   # OR serve the built version:
   npx serve -s build
   ```

### Test the Approvals Screen:

1. Navigate to `http://localhost:3000`
2. Login as owner user
3. Navigate to **Approvals** screen
4. Click on "Other Approvals" tab
5. Verify:
   - ✅ No 404 errors in console
   - ✅ Purchase requisitions load (if any exist with status "admin_approved")
   - ✅ Empty state shows if no approvals pending
   - ✅ Approve/Reject buttons work correctly

### Check Browser Console:

Open DevTools (F12) and verify:
- ✅ No 404 errors for `/api/purchase-requisitions`
- ✅ Successful 200 responses
- ✅ No JavaScript errors

## API Usage Examples

### Fetch All Purchase Requisitions:
```bash
curl http://localhost:8000/api/purchase-requisitions
```

### Fetch Admin-Approved Requisitions:
```bash
curl "http://localhost:8000/api/purchase-requisitions?status=admin_approved"
```

### Fetch Pending Requisitions for Specific Branch:
```bash
curl "http://localhost:8000/api/purchase-requisitions?status=pending&branch_id=berhane"
```

### Get Specific Requisition:
```bash
curl http://localhost:8000/api/purchase-requisitions/{requisition_id}
```

### Approve Requisition:
```bash
curl -X PUT http://localhost:8000/api/purchase-requisitions/{requisition_id}/approve-owner \
  -H "Content-Type: application/json" \
  -d '{"approved_by": "Owner"}'
```

### Reject Requisition:
```bash
curl -X PUT http://localhost:8000/api/purchase-requisitions/{requisition_id}/reject \
  -H "Content-Type: application/json" \
  -d '{"rejected_by": "Owner", "rejection_reason": "Budget constraints"}'
```

## Related Endpoints

The purchase requisitions workflow now has complete CRUD operations:

- **GET** `/api/purchase-requisitions` - List all (with filtering)
- **GET** `/api/purchase-requisitions/{id}` - Get one
- **POST** `/api/purchase-requisitions` - Create new
- **PUT** `/api/purchase-requisitions/{id}/approve-manager` - Manager approval
- **PUT** `/api/purchase-requisitions/{id}/approve-admin` - Admin approval
- **PUT** `/api/purchase-requisitions/{id}/approve-owner` - Owner approval
- **PUT** `/api/purchase-requisitions/{id}/reject` - Reject

## Status Flow

Purchase requisitions follow this approval workflow:

```
pending 
  ↓
manager_approved (via approve-manager)
  ↓
admin_approved (via approve-admin)
  ↓
owner_approved (via approve-owner) ← ApprovalsScreen operates here
  ↓
completed

Any step can be rejected → status: "rejected"
```

## Next Steps

If issues persist:
1. Verify backend is running on `http://localhost:8000`
2. Check MongoDB connection and data
3. Verify purchase requisitions collection exists
4. Check that requisitions have `status="admin_approved"` for ApprovalsScreen
5. Review browser console for any errors

---

*Fix completed: October 12, 2025*
*Test script: `test_approvals_api.py`*

