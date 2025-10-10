# Quick Approval Testing Checklist ✅

Use this checklist to verify all approval workflows in your UI.

---

## Pre-Testing Setup

- [ ] Backend server is running (`python backend/server.py`)
- [ ] Frontend is running (`npm run dev` in frontend directory)
- [ ] Database has inventory data (if not, run `python backend/seed_branch_inventory.py`)
- [ ] You have access to multiple user roles (Sales, Manager, Admin, Owner, Storekeeper, Guard)

---

## Test 1: Purchase Request Workflow (Sales → Manager → Admin → Owner)

### As Sales User:
- [ ] Navigate to Purchase Request form
- [ ] Try a quick template (e.g., "Office Supplies")
- [ ] Verify form pre-fills with template data
- [ ] Or create custom request with:
  - [ ] Description: "Test purchase request"
  - [ ] Purchase Type: "Cash"
  - [ ] Category: "Supplies"
  - [ ] Vendor: "Test Vendor"
  - [ ] Cost: "5000"
  - [ ] Reason: "Testing approval workflow"
- [ ] Click "Submit Request"
- [ ] Verify success toast appears
- [ ] Note the request number (e.g., PR-000001)

### As Manager:
- [ ] Switch to Manager role/login
- [ ] Navigate to Purchase Requests queue
- [ ] Find your test request
- [ ] Verify all details are correct:
  - [ ] Description matches
  - [ ] Cost matches
  - [ ] Vendor info present
  - [ ] Branch ID present
  - [ ] Purchase type present
  - [ ] Category present
- [ ] Click "Approve"
- [ ] Add notes: "Approved by manager"
- [ ] Verify success message
- [ ] Verify status changes to "Manager Approved"

### As Admin:
- [ ] Switch to Admin role/login
- [ ] Navigate to Purchase Requests queue
- [ ] Find your test request (should be in "Manager Approved" status)
- [ ] Click "Approve"
- [ ] Add notes: "Approved by admin"
- [ ] Verify success message
- [ ] Verify status changes to "Admin Approved"

### As Owner:
- [ ] Switch to Owner role/login
- [ ] Navigate to Purchase Requests queue
- [ ] Find your test request (should be in "Admin Approved" status)
- [ ] Click "Approve"
- [ ] Add notes: "Final approval granted"
- [ ] Verify success message
- [ ] Verify status changes to "Owner Approved"
- [ ] ✅ **Purchase Request Workflow Complete!**

---

## Test 2: Stock Request Workflow (Sales → Admin → Manager → Storekeeper)

### As Sales User:
- [ ] Navigate to Inventory Request form
- [ ] Select branch: "Berhane" or "Girmay"
- [ ] Verify products load in dropdown
- [ ] Select a product (e.g., "1st Quality 50kg")
- [ ] Verify available quantity shows in dropdown
- [ ] Select package size: "50kg"
- [ ] Enter number of packages: "5"
- [ ] Verify total weight calculates correctly (5 × 50 = 250 kg)
- [ ] Enter reason: "Testing stock request workflow"
- [ ] Click "Submit Request"
- [ ] Verify success toast appears
- [ ] Note the request number (e.g., SR-000001)

### As Admin/Owner:
- [ ] Switch to Admin/Owner role
- [ ] Navigate to Stock Requests queue
- [ ] Find your test request
- [ ] Verify all details:
  - [ ] Product name correct
  - [ ] Quantity correct
  - [ ] Total weight correct
  - [ ] Source branch correct
- [ ] Click "Approve"
- [ ] Add notes: "Inventory reserved"
- [ ] Verify success message
- [ ] Verify status changes to "Pending Manager Approval"
- [ ] Verify "Inventory Reserved: true"

### As Manager:
- [ ] Switch to Manager role
- [ ] Navigate to Stock Requests queue
- [ ] Find your test request (should be in "Pending Manager Approval")
- [ ] Click "Approve"
- [ ] Add notes: "Approved for fulfillment"
- [ ] Verify success message
- [ ] Verify status changes to "Pending Fulfillment"

### As Storekeeper:
- [ ] Switch to Storekeeper role
- [ ] Navigate to Fulfillment queue
- [ ] Find your test request
- [ ] Review items to prepare
- [ ] Click "Mark as Fulfilled"
- [ ] Add notes: "Items prepared and ready"
- [ ] Verify success message
- [ ] Verify status changes to "Pending Gate Approval"
- [ ] ✅ **Stock Request Workflow Complete!** (Guard approval optional)

---

## Test 3: Rejection Workflow

### Test Purchase Request Rejection:
- [ ] As Sales: Create a new purchase request with high cost (e.g., 50,000 ETB)
- [ ] As Manager: Find the request
- [ ] Click "Reject" (if available) or "Deny"
- [ ] Enter rejection reason: "Cost too high, not in budget"
- [ ] Verify success message
- [ ] Verify status changes to "Rejected"
- [ ] Verify rejection reason is visible
- [ ] ✅ **Purchase Request Rejection Works!**

### Test Stock Request Rejection:
- [ ] As Sales: Create a new stock request
- [ ] As Admin: Find the request
- [ ] Click "Reject"
- [ ] Enter rejection reason: "Insufficient inventory"
- [ ] Verify success message
- [ ] Verify status changes to "Rejected"
- [ ] Verify rejection reason is visible
- [ ] ✅ **Stock Request Rejection Works!**

---

## Test 4: Form Validation

### Purchase Request Form:
- [ ] Try submitting with empty description → Should show error
- [ ] Try submitting with $0 cost → Should show error
- [ ] Try submitting with empty reason → Should show error
- [ ] Verify all required fields are marked with *
- [ ] ✅ **Purchase Request Validation Works!**

### Stock Request Form:
- [ ] Try submitting with 0 packages → Should show error
- [ ] Try submitting with empty reason → Should show error
- [ ] Switch branches and verify products reload
- [ ] ✅ **Stock Request Validation Works!**

---

## Test 5: Data Integrity

### Verify Purchase Request Data:
- [ ] Open browser DevTools → Network tab
- [ ] Create a purchase request
- [ ] Check the POST request payload
- [ ] Verify all fields are present:
  ```json
  {
    "description": "...",
    "estimated_cost": 2500,
    "reason": "...",
    "requested_by": "...",
    "branch_id": "sales_branch",
    "purchase_type": "cash",
    "category": "supplies",
    "impacts_inventory": false,
    "vendor_name": "...",
    "vendor_contact": "..."
  }
  ```
- [ ] ✅ **All fields are sent!**

### Verify Stock Request Data:
- [ ] Check the POST request payload
- [ ] Verify all fields are present:
  ```json
  {
    "product_name": "1st Quality 50kg",
    "package_size": "50kg",
    "quantity": 10,
    "requested_by": "...",
    "branch_id": "berhane",
    "reason": "..."
  }
  ```
- [ ] ✅ **All fields are sent!**

---

## Test 6: Error Handling

### Test Backend Offline:
- [ ] Stop backend server
- [ ] Try submitting a purchase request
- [ ] Verify error toast appears: "Failed to submit request"
- [ ] Restart backend
- [ ] Try again → Should work
- [ ] ✅ **Error handling works!**

### Test Invalid Data:
- [ ] In browser console, try sending invalid purchase_type:
  ```javascript
  fetch('http://localhost:8000/api/purchase-requests', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      description: 'Test',
      estimated_cost: 1000,
      reason: 'Test',
      requested_by: 'Test',
      branch_id: 'test',
      purchase_type: 'INVALID',
      category: 'supplies'
    })
  })
  ```
- [ ] Should get 422 validation error
- [ ] ✅ **Validation works!**

---

## Automated Test

If you prefer, run the automated test script:

```bash
# Ensure backend is running first
python test_approval_workflows.py
```

Expected output:
```
================================================================================
           COMPREHENSIVE APPROVAL WORKFLOW TEST SUITE                      
================================================================================

TEST 1: PURCHASE REQUEST WORKFLOW
  [SUCCESS] All steps completed

TEST 2: STOCK REQUEST WORKFLOW
  [SUCCESS] All steps completed

TEST 3: REJECTION WORKFLOW
  [SUCCESS] All steps completed

TEST SUMMARY
Total Tests: 3
Passed: 3
Failed: 0

ALL TESTS PASSED!
```

---

## Issues & Solutions

### Issue: "Purchase request not accepting vendor info"
✅ **FIXED** - Backend now accepts all fields

### Issue: "Product dropdown is empty"
**Solution:** Run inventory seed script:
```bash
python backend/seed_branch_inventory.py
```

### Issue: "Request not appearing in queue"
**Solution:** Check:
1. Correct role/permissions
2. Correct branch filter
3. Correct status filter
4. Refresh the page

---

## Sign-Off

Once all tests pass, sign off here:

- [ ] **Purchase Request Workflow** - Tested by: __________ Date: __________
- [ ] **Stock Request Workflow** - Tested by: __________ Date: __________
- [ ] **Rejection Workflow** - Tested by: __________ Date: __________
- [ ] **Form Validation** - Tested by: __________ Date: __________
- [ ] **Data Integrity** - Tested by: __________ Date: __________
- [ ] **Error Handling** - Tested by: __________ Date: __________

**System Ready for Production:** ✅ YES / ⏸️ NO

**Notes:**
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

## Contact

If you encounter any issues during testing:
1. Check browser console for errors
2. Check backend logs
3. Review `APPROVAL_WORKFLOWS_VERIFIED.md` for detailed documentation
4. Run automated tests: `python test_approval_workflows.py`

