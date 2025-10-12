# 📋 Manual UI Testing Checklist

**Date:** October 11, 2025  
**Backend Status:** ✅ Running & All Tests Passed  
**Frontend Status:** Ready to test

---

## 🚀 Prerequisites

### Backend Running
```powershell
cd backend
python -m uvicorn server:app --reload --host 127.0.0.1 --port 8000
```
**Status:** ✅ Should be running

### Start Frontend
```powershell
cd frontend
npm start
```
**Starts on:** http://localhost:3000

---

## ✅ Phase 1: Dashboard Loading Tests

### Test: All Dashboards Load Without Errors

| Dashboard | URL | Expected Result | Status |
|-----------|-----|-----------------|--------|
| Login | http://localhost:3000/ | Login form appears | ⬜ |
| Owner | http://localhost:3000/dashboard | Financial KPIs, branch stats load | ⬜ |
| Finance | http://localhost:3000/finance/dashboard | Summary, transactions, approvals load | ⬜ |
| Manager | http://localhost:3000/manager/dashboard | Branch inventory, queue load | ⬜ |
| Sales | http://localhost:3000/sales/dashboard | Transactions, stock requests load | ⬜ |
| Admin | http://localhost:3000/admin/dashboard | System overview loads | ⬜ |
| StoreKeeper | http://localhost:3000/storekeeper/dashboard | Fulfillment queue loads | ⬜ |

**Check Browser Console (F12):**
- ⬜ No 404 errors
- ⬜ No 500 errors  
- ⬜ No CORS errors
- ⬜ All fetch requests return 200 OK

---

## ✅ Phase 2: Stock Request Workflow

### Complete End-to-End Stock Request

**Step 1: Sales Creates Request**
- ⬜ Login as Sales (select Sales role)
- ⬜ Navigate to "Create Stock Request"
- ⬜ Fill in:
  - Source Branch: Berhane
  - Destination Branch: (Sales office or another branch)
  - Product: Select from dropdown
  - Quantity: 10 packages
  - Reason: "Customer order"
- ⬜ Submit request
- ⬜ Verify status shows "Pending Admin Approval"
- ⬜ Note the request number (e.g., SR-20251011...)

**Step 2: Admin Approves**
- ⬜ Logout, login as Admin
- ⬜ Navigate to "Stock Request Approvals"
- ⬜ Find your request by number
- ⬜ Click "Approve"
- ⬜ Verify status changes to "Pending Manager Approval"
- ⬜ Verify "Inventory Reserved: Yes"

**Step 3: Manager Approves**
- ⬜ Logout, login as Manager
- ⬜ Navigate to "Stock Approvals" or "Approval Queue"
- ⬜ Find your request
- ⬜ Click "Approve"
- ⬜ Verify status changes to "Pending Fulfillment"

**Step 4: Store Keeper Fulfills**
- ⬜ Logout, login as Store Keeper
- ⬜ Navigate to "Fulfillment Queue"
- ⬜ Find your request
- ⬜ Click "Fulfill"
- ⬜ Verify status changes to "Ready for Pickup"
- ⬜ Verify inventory was deducted

**Step 5: Guard Verifies (if available)**
- ⬜ If guard screen exists, verify gate pass
- ⬜ Enter vehicle details
- ⬜ Verify status changes to "In Transit"

**Step 6: Sales Confirms Delivery**
- ⬜ Login back as Sales
- ⬜ Navigate to "Pending Deliveries"
- ⬜ Find your request
- ⬜ Click "Confirm Delivery"
- ⬜ Enter received quantity
- ⬜ Verify status changes to "Confirmed"
- ⬜ ✅ **WORKFLOW COMPLETE!**

---

## ✅ Phase 3: Purchase Requisition Workflow

**Step 1: Manager Creates Purchase Request**
- ⬜ Login as Manager
- ⬜ Navigate to "Purchase Requests" or "Create Request"
- ⬜ Fill in:
  - Description: "Office supplies"
  - Estimated Cost: 2,500
  - Supplier: "Office Mart"
  - Category: Supplies
- ⬜ Submit
- ⬜ Verify status: "Pending" or "Pending Manager Approval"

**Step 2: Admin Approves**
- ⬜ Login as Admin
- ⬜ Find request in approval queue
- ⬜ Approve
- ⬜ Verify status: "Admin Approved"

**Step 3: Owner Approves**
- ⬜ Login as Owner
- ⬜ Navigate to "Approvals" or "Fund Approvals"
- ⬜ Find request
- ⬜ Approve
- ⬜ Verify status: "Owner Approved"

**Step 4: Finance Processes Payment**
- ⬜ Login as Finance
- ⬜ Navigate to "Payment Processing" or "Pending Authorizations"
- ⬜ Find approved request
- ⬜ Enter payment details:
  - Payment Method: Bank Transfer
  - Bank Name: Commercial Bank of Ethiopia
  - Reference Number: REF123456
- ⬜ Click "Process Payment"
- ⬜ Verify status: "Completed"
- ⬜ ✅ **PAYMENT PROCESSED!**

---

## ✅ Phase 4: Production Workflow

**Step 1: Record Wheat Delivery**
- ⬜ Login as Manager (Berhane or Girmay)
- ⬜ Navigate to "Wheat Delivery" or "Record Delivery"
- ⬜ Fill in:
  - Quantity: 1,000 kg
  - Supplier: "Local Wheat Supplier"
  - Unit Cost: 25 Birr/kg
  - Delivery Date: Today
- ⬜ Submit
- ⬜ Check inventory - Raw Wheat should increase by 1,000kg

**Step 2: Create Milling Order**
- ⬜ Still logged in as Manager
- ⬜ Navigate to "Milling Orders" or "Create Order"
- ⬜ Fill in:
  - Raw Wheat Input: 500 kg
  - Output Product: Bread Flour (or select from dropdown)
  - Mill Operator: "Operator Name"
- ⬜ Submit
- ⬜ Verify order created with status "Pending"
- ⬜ Check inventory - Raw Wheat should decrease by 500kg

**Step 3: Complete Milling Order (if separate step)**
- ⬜ Navigate to "Pending Milling Orders"
- ⬜ Find your order
- ⬜ Click "Complete" or "Log Outputs"
- ⬜ Enter actual outputs:
  - Bread Flour: 325 kg
  - Fruska (bran): 100 kg
  - Fruskelo: 60 kg
- ⬜ Submit
- ⬜ Verify status: "Completed"
- ⬜ Check inventory - All flour products should increase

---

## ✅ Phase 5: Sales & Finance Integration

**Step 1: Cash Sale**
- ⬜ Login as Sales
- ⬜ Navigate to "POS" or "New Transaction"
- ⬜ Select products
- ⬜ Enter quantities
- ⬜ Select Payment Type: Cash
- ⬜ Complete sale
- ⬜ Verify transaction created
- ⬜ Check inventory - Products deducted

**Step 2: Loan/Credit Sale**
- ⬜ Still as Sales
- ⬜ Create new transaction
- ⬜ Select products
- ⬜ Select Payment Type: Loan
- ⬜ Enter customer details:
  - Name: "Test Customer"
  - Phone: "0911234567"
- ⬜ Complete sale
- ⬜ Verify transaction created
- ⬜ Verify loan created in system

**Step 3: Finance Views Transactions**
- ⬜ Login as Finance
- ⬜ Navigate to Finance Dashboard
- ⬜ Verify transactions appear
- ⬜ Verify loans appear in Accounts Receivable
- ⬜ Check total amounts match

**Step 4: Daily Reconciliation**
- ⬜ Still as Finance
- ⬜ Navigate to "Daily Reconciliation"
- ⬜ Select branch
- ⬜ Enter expected cash
- ⬜ Enter actual cash counted
- ⬜ System calculates variance
- ⬜ Add notes if variance exists
- ⬜ Submit reconciliation
- ⬜ Verify reconciliation saved

---

## ✅ Phase 6: Owner Dashboard Verification

**Test Owner Dashboard Features:**
- ⬜ Login as Owner
- ⬜ Dashboard loads with:
  - Cash in Bank (displays amount)
  - Today's Sales (displays amount)
  - Accounts Receivable (displays amount)
  - Pending Fund Requests (displays count)
  - Inventory Value (displays amount)
- ⬜ Branch Stats show both branches
- ⬜ Activity Feed updates (scroll to see recent activities)
- ⬜ Click "Refresh" button - data updates
- ⬜ Navigate to "Fund Approvals"
- ⬜ Navigate to "Financial Controls"
- ⬜ Navigate to "Inventory Valuation"

---

## ✅ Phase 7: Data Consistency Checks

### Test Real-Time Updates
1. ⬜ Open Owner Dashboard in one browser tab
2. ⬜ Open Manager Dashboard in another tab (different browser or incognito)
3. ⬜ As Manager: Create milling order
4. ⬜ Click refresh on Owner Dashboard
5. ⬜ Verify activity feed shows the new milling order

### Test Inventory Sync
1. ⬜ Open Sales Dashboard (Berhane)
2. ⬜ Open Manager Dashboard (Berhane)
3. ⬜ Both should show same inventory for Berhane
4. ⬜ Create a sale transaction
5. ⬜ Refresh Manager dashboard
6. ⬜ Verify inventory decreased

---

## 🐛 Common Issues to Check

**If Frontend Shows Errors:**
- ⬜ Check backend is still running
- ⬜ Check browser console for error details
- ⬜ Verify BACKEND_URL in frontend/.env is correct
- ⬜ Try hard refresh (Ctrl+Shift+R)

**If Data Doesn't Load:**
- ⬜ Check Network tab - requests should be 200 OK
- ⬜ Check if MongoDB is running
- ⬜ Verify backend logs for errors
- ⬜ Check if sample data was initialized

**If Login Doesn't Work:**
- ⬜ Any username/password should work (mock auth)
- ⬜ Make sure to select a role in step 2
- ⬜ Check if routing is configured

---

## 📊 Test Results Template

**Dashboard Loading:**
- Owner: ✅ / ❌
- Finance: ✅ / ❌
- Manager: ✅ / ❌
- Sales: ✅ / ❌
- Admin: ✅ / ❌
- StoreKeeper: ✅ / ❌

**Workflows:**
- Stock Request (6 stages): ✅ / ❌
- Purchase Request (4 stages): ✅ / ❌
- Production (3 steps): ✅ / ❌
- Sales & Finance: ✅ / ❌

**Console Errors:**
- 404 Errors: 0
- 500 Errors: 0
- CORS Errors: 0
- Other Errors: (list)

---

## ✅ Success Criteria

All checkboxes above should be checked (✅) for complete manual testing verification.

**Estimated Time:** 30-45 minutes

---

**Start Testing Now!**

1. Ensure backend is running
2. Start frontend: `cd frontend && npm start`
3. Open http://localhost:3000
4. Follow the checklist above

**Good luck! 🚀**

