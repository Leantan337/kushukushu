# 🧪 Role Interconnection Testing & Validation Guide

**Date:** October 9, 2025  
**Purpose:** Verify all roles are properly interconnected and working together  
**Status:** Ready for Testing

---

## 🎯 TESTING OBJECTIVES

Verify that:
1. ✅ Data flows between all roles
2. ✅ Workflows complete end-to-end
3. ✅ Status updates propagate correctly
4. ✅ Notifications reach appropriate roles
5. ✅ Inventory updates across roles
6. ✅ Finance integrations work automatically

---

## 🚀 QUICK START - Full System Test (30 minutes)

### Prerequisites
```bash
# 1. Start Backend
cd backend
python server.py
# Expected: Running on http://localhost:8000

# 2. Start Frontend (new terminal)
cd frontend
npm start
# Expected: Running on http://localhost:3000

# 3. Verify MongoDB is running
# Expected: Connected to flour_factory_erp database
```

---

## 📋 TEST 1: Complete Stock Request Workflow (All 6 Roles)

**Purpose:** Verify Sales → Admin → Manager → Storekeeper → Guard → Sales chain

### Step 1: Sales Creates Request
```
1. Navigate to: http://localhost:3000
2. Login as: Sales
3. Click "Stock" tab
4. Fill form:
   - Product: "1st Quality 50kg"
   - Quantity: 10 bags
   - Reason: "Customer order - testing workflow"
5. Click "Submit Request"

✅ VERIFY:
   - Request created with number SR-XXXXXX
   - Status: "pending_admin_approval"
   - Toast notification appears
   - Request appears in "My Requests"
```

**API Validation:**
```bash
# Check request was created
curl http://localhost:8000/api/stock-requests | grep -A 5 "pending_admin_approval"

# Expected: See your request with status "pending_admin_approval"
```

---

### Step 2: Admin/Owner Approves
```
1. Open new browser tab (incognito/private)
2. Navigate to: http://localhost:3000
3. Login as: Owner/Admin
4. Go to: Owner Dashboard → Stock Request Approvals
5. Should see: The request you just created

✅ VERIFY:
   - Request appears in admin queue
   - Shows requester name
   - Shows product and quantity
   - Auto-refresh works (wait 30 seconds, data updates)

6. Click "Review" on the request
7. Add notes: "Approved - sufficient stock"
8. Click "Approve"

✅ VERIFY:
   - Toast: "Approved successfully"
   - Request disappears from admin queue
   - Status changed to "admin_approved"
```

**API Validation:**
```bash
# Check status changed
curl http://localhost:8000/api/stock-requests | grep -A 10 "SR-"

# Expected: Status = "pending_manager_approval"
# Expected: admin_approval object exists
# Expected: inventory_reserved = true
```

**Database Check:**
```javascript
// In MongoDB shell
use flour_factory_erp
db.stock_requests.find({request_number: /SR-/}).pretty()

// Verify:
// - status: "pending_manager_approval"
// - workflow_history has 2 entries
// - admin_approval object exists
```

---

### Step 3: Manager Approves
```
1. Open new browser tab
2. Navigate to: http://localhost:3000
3. Login as: Manager
4. Go to: Manager Dashboard → Stock Approvals
5. Should see: The same request (now admin-approved)

✅ VERIFY:
   - Request appears in manager queue
   - Shows "Admin Approved" badge
   - Shows requester and product details

6. Click "Review" on the request
7. Add notes: "Approved - production capacity OK"
8. Click "Approve"

✅ VERIFY:
   - Toast: "Approved successfully"
   - Request moves to "pending_fulfillment"
```

**API Validation:**
```bash
curl http://localhost:8000/api/stock-requests?status=pending_fulfillment

# Expected: Your request with manager_approval object
```

---

### Step 4: Storekeeper Fulfills
```
1. Open new browser tab
2. Navigate to: http://localhost:3000
3. Login as: Storekeeper
4. Go to: Storekeeper Dashboard → Fulfillment Queue
5. Should see: The request (now ready to fulfill)

✅ VERIFY:
   - Request appears in fulfillment queue
   - Shows "Admin Approved" + "Manager Approved" badges
   - Shows total weight and package details

6. Click "Start Fulfillment"
7. Packing slip auto-generated (or enter manually)
8. Actual quantity: 10
9. Notes: "All items packaged and ready"
10. Click "Mark as Fulfilled"

✅ VERIFY:
   - Toast: "Fulfilled successfully"
   - Status: "ready_for_pickup"
   - IMPORTANT: Check inventory was deducted
```

**Inventory Validation:**
```bash
# Before fulfillment - note the quantity
curl http://localhost:8000/api/inventory | grep -A 5 "1st Quality 50kg"

# After fulfillment - verify quantity decreased
curl http://localhost:8000/api/inventory | grep -A 5 "1st Quality 50kg"

# Expected: Quantity reduced by 500kg (10 bags × 50kg)
```

**Database Check:**
```javascript
db.inventory.find({name: /1st Quality 50kg/}).pretty()

// Verify:
// - quantity decreased
// - transactions array has new entry
// - transaction.type = "out"
// - transaction.reference = "SR-XXXXXX"
```

---

### Step 5: Guard Verifies
```
1. Open new browser tab
2. Navigate to: http://localhost:3000
3. Login as: Guard
4. Go to: Guard Dashboard → Gate Verification
5. Should see: The request (ready for exit)

✅ VERIFY:
   - Request appears in gate queue
   - Shows packing slip number
   - Shows fulfillment details

6. Click "Verify & Release"
7. Gate pass: Auto-generated (GP-XXXXXX)
8. Vehicle number: "ET-123-ABC"
9. Driver name: "Test Driver"
10. Click "Issue Gate Pass"

✅ VERIFY:
   - Toast: "Verified & Released"
   - Status: "in_transit"
   - Gate pass issued
```

**API Validation:**
```bash
curl http://localhost:8000/api/stock-requests | grep -A 20 "in_transit"

# Expected: See gate_verification object with:
# - gate_pass_number
# - vehicle_number
# - driver_name
# - exit_time
```

---

### Step 6: Sales Confirms Delivery
```
1. Go back to FIRST browser tab (Sales)
2. Click "Deliveries" tab
3. Should see: Your request (status "in_transit")

✅ VERIFY:
   - Request appears in pending deliveries
   - Shows gate pass number
   - Shows all approval stages

4. Click "Confirm Receipt"
5. Received quantity: 10
6. Condition: "Good"
7. Notes: "All items received in perfect condition"
8. Click "Confirm Delivery"

✅ VERIFY:
   - Toast: "Delivery confirmed"
   - Status: "confirmed"
   - Request disappears from deliveries
   - IMPORTANT: Check your branch inventory increased
```

**Final Validation:**
```bash
# Check final status
curl http://localhost:8000/api/stock-requests | grep -A 30 "confirmed"

# Expected: Complete workflow with all stages

# Check sales branch inventory increased
curl http://localhost:8000/api/inventory?branch_id=berhane

# Expected: Product quantity increased by 500kg
```

**Complete Workflow Verification:**
```javascript
db.stock_requests.find({request_number: /SR-/}).pretty()

// Verify workflow_history array has 6 entries:
// 1. created (Sales)
// 2. admin_approval (Admin)
// 3. manager_approval (Manager)
// 4. fulfillment (Storekeeper)
// 5. gate_verification (Guard)
// 6. delivery_confirmation (Sales)
```

---

## 📋 TEST 2: Purchase Requisition Workflow (Manager → Admin → Owner → Finance)

### Step 1: Manager Creates Purchase Requisition
```
1. Login as: Manager
2. Go to: Manager Dashboard → Purchase Requisitions (or use Sales role)
3. Click "Create New Purchase Request"
4. Fill form:
   - Type: "Material"
   - Category: "Raw Material"
   - Description: "Premium Wheat - 100 tons"
   - Vendor: "Test Supplier Ltd"
   - Cost: 1,500,000 ETB
   - Reason: "Stock replenishment - testing workflow"
5. Click "Submit"

✅ VERIFY:
   - Request created with PR-XXXXXX
   - Status: "pending"
   - Toast notification
```

---

### Step 2: Manager Approves (if created by sales)
```
1. Stay as Manager (or login as Manager)
2. View purchase requisitions
3. Should see the request
4. Approve it

✅ VERIFY:
   - Status: "manager_approved"
   - Manager approval recorded
```

---

### Step 3: Admin Approves
```
1. Login as: Admin
2. Go to: Admin Dashboard → Purchase Approvals
3. Should see: Manager-approved request

✅ VERIFY:
   - Request visible to Admin
   - Shows manager approval

4. Review and approve

✅ VERIFY:
   - Status: "admin_approved"
```

---

### Step 4: Owner Final Approval
```
1. Login as: Owner
2. Go to: Owner Dashboard → Approvals
3. Should see: Admin-approved request

✅ VERIFY:
   - Request visible to Owner
   - Shows manager + admin approvals

4. Final approval

✅ VERIFY:
   - Status: "owner_approved"
   - Request now visible to Finance
```

---

### Step 5: Finance Processes Payment
```
1. Login as: Finance
2. Go to: Finance Dashboard → Payment Processing
3. Should see: Owner-approved request

✅ VERIFY:
   - Request appears in finance queue
   - Shows complete approval trail:
     * Manager approval ✓
     * Admin approval ✓
     * Owner approval ✓

4. Click "Process Payment"
5. Select payment method: "Bank Transfer"
6. Bank account: "Commercial Bank 001"
7. Reference: "TRF-2025-TEST-001"
8. Click "Process Payment"

✅ VERIFY:
   - Status: "purchased"
   - Finance transaction created
   - Visible in Owner dashboard as complete
```

**Validation:**
```bash
# Check purchase requisition status
curl http://localhost:8000/api/purchase-requisitions | grep -A 20 "purchased"

# Check finance transaction created
curl http://localhost:8000/api/finance/transactions | grep -A 10 "expense"

# Expected: Finance transaction with type "expense"
```

---

## 📋 TEST 3: Sales → Finance Integration (POS Loan Sale)

### Step 1: Sales Makes Loan Sale
```
1. Login as: Sales
2. Go to: POS tab
3. Add products to cart:
   - 1st Quality 50kg: 5 bags
4. Payment type: "Loan (Credit)"
5. Customer name: "Test Bakery LLC"
6. Customer phone: "+251-911-555-TEST"
7. Click "Complete Sale"

✅ VERIFY:
   - Sale completed
   - Customer auto-created
   - Loan auto-created
   - Finance transaction auto-created
```

---

### Step 2: Verify Finance Received Transaction
```
1. Login as: Finance
2. Go to: Finance Dashboard → Accounts Receivable
3. Should see: Loan just created

✅ VERIFY:
   - Loan appears in finance system
   - Customer "Test Bakery LLC" exists
   - Loan amount matches sale total
   - Status: "Active"
```

**API Validation:**
```bash
# Check customer created
curl http://localhost:8000/api/customers | grep "Test Bakery"

# Check loan created
curl http://localhost:8000/api/loans | grep -A 15 "Test Bakery"

# Check finance transaction
curl http://localhost:8000/api/finance/transactions | grep -A 10 "sale"
```

---

### Step 3: Sales Records Loan Payment
```
1. Stay as Sales (or login as Sales)
2. Go to: Loans tab
3. Find: "Test Bakery LLC" loan
4. Click "Record Payment"
5. Payment amount: 50,000 ETB
6. Payment method: "Cash"
7. Click "Submit Payment"

✅ VERIFY:
   - Payment recorded
   - Balance reduced
   - Payment history updated
```

---

### Step 4: Verify Finance Received Payment
```
1. Login as: Finance
2. Go to: Finance Dashboard → Recent Transactions
3. Should see: Payment transaction (income)

✅ VERIFY:
   - Finance transaction created
   - Type: "income"
   - Amount: 50,000 ETB
   - Reference: Loan payment
```

**API Validation:**
```bash
# Check loan updated
curl http://localhost:8000/api/loans | grep -A 20 "Test Bakery"

# Expected:
# - balance_remaining reduced by 50,000
# - payments array has new entry

# Check finance transaction
curl http://localhost:8000/api/finance/transactions | grep -A 10 "payment"
```

---

## 📋 TEST 4: Auto-Refresh & Real-Time Updates

### Purpose: Verify roles see updates from other roles in real-time

```
1. Open 3 browser windows side-by-side:
   - Window 1: Sales Dashboard (Overview tab)
   - Window 2: Admin Dashboard (Stock Approvals)
   - Window 3: Finance Dashboard (Recent Transactions)

2. In Window 1 (Sales):
   - Create new stock request
   
3. Wait 30 seconds

4. In Window 2 (Admin):
   ✅ VERIFY: Request automatically appears (auto-refresh)
   
5. In Window 2 (Admin):
   - Approve the request
   
6. In Window 1 (Sales):
   ✅ VERIFY: Request status updates after 30 seconds

7. In Window 1 (Sales):
   - Make a POS sale with loan
   
8. In Window 3 (Finance):
   ✅ VERIFY: Transaction appears after 30 seconds
```

---

## 📋 TEST 5: Branch-Specific Routing

### Purpose: Verify automatic branch routing works

```
1. Login as: Sales (Berhane Branch)
2. Go to: POS tab
3. Top-right: Select "Berhane Branch"

✅ VERIFY:
   - Only see Berhane products:
     * Bread 50kg ✓
     * Bread 25kg ✓
     * Fruska ✓
     * Fruskelo Red ✓
   - Should NOT see:
     * 1st Quality products (Girmay only)
     * Fruskelo White (Girmay only)

4. Create stock request for "1st Quality 50kg"
5. Check API: curl http://localhost:8000/api/stock-requests

✅ VERIFY:
   - source_branch: "girmay" (auto-routed!)
   - branch_id: "berhane" (destination)
```

---

## 📋 TEST 6: Inventory Synchronization

### Purpose: Verify inventory updates across all roles

```
1. Check initial inventory:
   curl http://localhost:8000/api/inventory | grep -A 5 "1st Quality 50kg"
   Note the quantity: ___________

2. Sales creates stock request: 20 bags (1000kg)
3. Admin approves → Check inventory
   ✅ VERIFY: Quantity unchanged (only reserved)

4. Manager approves → Check inventory
   ✅ VERIFY: Quantity unchanged (still reserved)

5. Storekeeper fulfills → Check inventory
   ✅ VERIFY: Quantity DECREASED by 1000kg

6. Guard verifies → Check inventory
   ✅ VERIFY: Quantity still decreased

7. Sales confirms → Check inventory
   ✅ VERIFY: Sales branch inventory INCREASED by 1000kg
```

---

## 🔍 VALIDATION CHECKLIST

### ✅ Stock Request Workflow
- [ ] Sales can create requests
- [ ] Admin sees requests immediately
- [ ] Admin approval reserves inventory
- [ ] Manager sees admin-approved requests
- [ ] Manager approval forwards to storekeeper
- [ ] Storekeeper fulfillment deducts inventory
- [ ] Guard sees fulfilled packages
- [ ] Guard verification issues gate pass
- [ ] Sales sees in-transit deliveries
- [ ] Sales confirmation adds to branch inventory
- [ ] Complete workflow history recorded
- [ ] All 6 stages execute correctly

### ✅ Purchase Requisition Workflow
- [ ] Manager/Sales can create requisitions
- [ ] Manager approval recorded
- [ ] Admin sees manager-approved requests
- [ ] Admin approval recorded
- [ ] Owner sees admin-approved requests
- [ ] Owner approval forwards to finance
- [ ] Finance sees owner-approved requests
- [ ] Finance payment processing works
- [ ] Status updates to "purchased"
- [ ] Owner sees completed requisitions

### ✅ Sales-Finance Integration
- [ ] POS sales create finance transactions
- [ ] Loan sales auto-create customers
- [ ] Loan sales auto-create loans
- [ ] Loan payments create income transactions
- [ ] Finance sees all sales transactions
- [ ] Accounts receivable updates automatically

### ✅ Real-Time Updates
- [ ] Auto-refresh works (30 seconds)
- [ ] Status changes propagate
- [ ] New requests appear automatically
- [ ] Inventory updates visible immediately

### ✅ Branch Routing
- [ ] POS shows only branch products
- [ ] Stock requests auto-route correctly
- [ ] Source branch determined automatically
- [ ] Inventory updates correct branches

### ✅ Audit & History
- [ ] All actions logged
- [ ] Workflow history complete
- [ ] Timestamps accurate
- [ ] Actor names recorded

---

## 🚨 TROUBLESHOOTING

### Issue: Request Not Appearing in Next Role's Queue

**Check:**
```bash
# Verify status changed
curl http://localhost:8000/api/stock-requests/{request_id}

# Check workflow_history
# Should have entry for last approval
```

**Fix:**
- Ensure approval API endpoint returned success
- Check browser console for errors
- Verify auto-refresh is working (wait 30 seconds)

---

### Issue: Inventory Not Updating

**Check:**
```bash
# Check transactions array
curl http://localhost:8000/api/inventory | grep -A 30 "1st Quality"

# Look for recent transaction entry
```

**Fix:**
- Verify fulfillment completed successfully
- Check inventory_deducted flag is true
- Check MongoDB transactions array

---

### Issue: Finance Transaction Not Created

**Check:**
```bash
curl http://localhost:8000/api/finance/transactions

# Should see recent transactions
```

**Fix:**
- Verify payment type was "Loan" for loan sales
- Check POS sale completed successfully
- Verify loan payment submission succeeded

---

## 📊 SUCCESS CRITERIA

**All tests pass when:**

1. ✅ **Complete Workflow**: Stock request goes through all 6 stages
2. ✅ **Status Updates**: Each role sees correct status
3. ✅ **Inventory Sync**: Inventory deducted and added correctly
4. ✅ **Auto-Refresh**: New data appears within 30 seconds
5. ✅ **Finance Integration**: All sales create finance records
6. ✅ **Branch Routing**: Products route to correct branches
7. ✅ **Audit Trail**: Complete history of all actions
8. ✅ **No Errors**: No console errors, all API calls succeed

---

## 🎉 EXPECTED RESULTS

After completing all tests, you should have:

- ✅ 1 complete stock request (6 stages)
- ✅ 1 complete purchase requisition (4 approvals)
- ✅ Multiple finance transactions
- ✅ 1 customer created
- ✅ 1 loan created with payment
- ✅ Inventory changes verified
- ✅ All audit logs recorded

**Total Time:** ~30-45 minutes  
**Roles Tested:** All 6 roles  
**Workflows Tested:** 3 major workflows  
**Integration Points:** 15+

---

## 📝 TEST REPORT TEMPLATE

After testing, document results:

```
# Test Report - Role Interconnection Validation
Date: ________________
Tester: ______________

## Test Results

### Stock Request Workflow
- Sales → Admin: ☐ Pass ☐ Fail
- Admin → Manager: ☐ Pass ☐ Fail
- Manager → Storekeeper: ☐ Pass ☐ Fail
- Storekeeper → Guard: ☐ Pass ☐ Fail
- Guard → Sales: ☐ Pass ☐ Fail
- Complete Workflow: ☐ Pass ☐ Fail

### Purchase Requisition Workflow
- Manager → Admin: ☐ Pass ☐ Fail
- Admin → Owner: ☐ Pass ☐ Fail
- Owner → Finance: ☐ Pass ☐ Fail
- Complete Workflow: ☐ Pass ☐ Fail

### Sales-Finance Integration
- POS → Finance: ☐ Pass ☐ Fail
- Loan Creation: ☐ Pass ☐ Fail
- Payment Processing: ☐ Pass ☐ Fail

### Real-Time Updates
- Auto-refresh: ☐ Pass ☐ Fail
- Status propagation: ☐ Pass ☐ Fail

## Issues Found
1. _____________________________________
2. _____________________________________

## Overall Result: ☐ ALL PASS ☐ NEEDS FIXES
```

---

**Ready to verify your interconnected system!** 🚀  
Follow each test carefully and check off the validation points.

