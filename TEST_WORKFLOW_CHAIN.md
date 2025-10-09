# Test: Sales → Owner → Manager Workflow

**Purpose:** Verify the complete workflow chain works  
**Status:** Ready to test  
**Time:** ~5 minutes

---

## 🧪 Test Steps

### Step 1: Sales Creates Request

**Login as Sales:**
1. Go to Sales Dashboard
2. Click "Request Stock" tab (or inventory request)
3. Fill out the form:
   - Product: "Bread Flour" or "1st Quality Flour"
   - Package Size: "50kg"
   - Number of Packages: 10
   - Branch: "berhane" or "girmay"
   - Reason: "Need stock for customer orders"
4. Click "Submit Request"
5. ✅ Should see success message: "Request [number] submitted for approval"

**Verify in Database:**
```
Request created with status: PENDING_ADMIN_APPROVAL
```

---

### Step 2: Owner/Admin Approves ✅ **NEW FIX**

**Login as Owner:**
1. Go to Owner Dashboard
2. Click **"Approvals"** button (bottom section)
3. **IMPORTANT:** Switch to **"Stock Requests (Real Data)"** tab
   - You should see the tab at the top
   - First tab: "Stock Requests (Real Data)" ← Click this!
   - Second tab: "Other Approvals" (mock data)
4. You should see the request from Sales:
   - Product name
   - Quantity (10 packages)
   - Requested by: Sales User
   - Branch
5. Review the request
6. Enter optional notes
7. Click **"Approve"**
8. ✅ Should see success message: "Stock request approved successfully"
9. Request should disappear from the list

**Verify in Database:**
```
Request status changed to: PENDING_MANAGER_APPROVAL
```

---

### Step 3: Manager Approves

**Login as Manager (Berhane or Girmay):**
1. Go to Manager Dashboard
2. Click "Approvals Queue" tab (or Manager Stock Approvals)
3. **✅ You should NOW see the request** (this was broken before!)
4. Request details should show:
   - Product
   - Quantity
   - Requested by Sales
   - Already approved by Owner
5. Enter optional notes
6. Click **"Approve"**
7. ✅ Should see success message
8. Request moves to next stage

**Verify in Database:**
```
Request status changed to: MANAGER_APPROVED
```

---

### Step 4: Storekeeper Fulfills (Optional)

**Login as Storekeeper:**
1. Go to Storekeeper Dashboard
2. See request in fulfillment queue
3. Pick items and mark as delivered

---

## ✅ Success Criteria

| Step | What to Check | Expected Result |
|------|---------------|-----------------|
| Sales Creates | Success message shown | ✅ Request #XXX submitted |
| Owner Dashboard | Approvals button works | ✅ Opens approvals screen |
| **Owner Sees Request** | **Stock Requests tab** | **✅ Request appears (REAL DATA)** |
| Owner Approves | Approval succeeds | ✅ Success message, request disappears |
| **Manager Sees Request** | **Approvals queue** | **✅ Request appears (WAS BROKEN!)** |
| Manager Approves | Approval succeeds | ✅ Request moves forward |

---

## 🔍 What to Look For

### **BEFORE the fix:**
- ❌ Owner saw MOCK DATA in approvals
- ❌ Real sales requests were invisible to owner
- ❌ Manager NEVER saw the requests
- ❌ Workflow was broken

### **AFTER the fix:**
- ✅ Owner sees "Stock Requests (Real Data)" tab
- ✅ Real sales requests appear
- ✅ Owner can approve them
- ✅ **Manager NOW sees the requests!**
- ✅ Complete workflow works

---

## 🚨 Troubleshooting

### "I don't see the Stock Requests tab"
**Solution:** Make sure you're on the Approvals screen, not the main dashboard. Click the "Approvals" button from Owner Dashboard.

### "Stock Requests tab is empty"
**Possible causes:**
1. No sales requests have been created yet → Create one from Sales Dashboard
2. All requests already approved → Create a new request
3. Backend not running → Start backend server

### "Request doesn't appear in Manager queue"
**Check:**
1. Did Owner approve it? (Should see success message)
2. Is Manager logged in to correct branch? (Request goes to specific branch manager)
3. Check backend logs for errors

### "Tab says 'Real Data' but I see mock data"
**Solution:** Make sure you clicked the correct tab:
- Tab 1: "Stock Requests (Real Data)" ← THIS ONE
- Tab 2: "Other Approvals" (still mock) ← Not this one

---

## 📊 Visual Guide

```
Owner Dashboard
     ↓
[Approvals] button
     ↓
Approvals Screen
     ↓
┌─────────────────────────────────────────────┐
│ Tabs:                                       │
│                                             │
│ [Stock Requests (Real Data)] [Other Approvals] │
│  ↑                            ↑               │
│  THIS ONE!                    Mock data       │
└─────────────────────────────────────────────┘
     ↓
List of real stock requests
     ↓
[Approve] button
     ↓
Request moves to Manager ✅
```

---

## 🎯 Quick Test Script

```bash
# 1. Create request as Sales
# Login: sales / any branch
# Navigate: Sales Dashboard → Request Stock
# Fill: Bread Flour, 10 bags, berhane
# Submit

# 2. Approve as Owner
# Login: owner
# Navigate: Owner Dashboard → Approvals button
# Switch to: "Stock Requests (Real Data)" tab
# Verify: Request appears
# Click: Approve

# 3. Verify in Manager
# Login: manager, branch=berhane
# Navigate: Manager Dashboard → Approvals Queue
# Verify: Request appears ✅ (THIS IS THE FIX!)
# Click: Approve
```

---

## 📝 Test Results Template

```
Test Date: _______________
Tester: _______________

□ Step 1: Sales creates request - PASS/FAIL
  Notes: _________________________________

□ Step 2: Owner sees request in Stock Requests tab - PASS/FAIL
  Notes: _________________________________

□ Step 3: Owner approves request - PASS/FAIL
  Notes: _________________________________

□ Step 4: Manager sees request - PASS/FAIL ← CRITICAL!
  Notes: _________________________________

□ Step 5: Manager approves request - PASS/FAIL
  Notes: _________________________________

Overall: PASS/FAIL
Issues: _________________________________
```

---

## ✅ Expected Timeline

- Sales creates request: ~30 seconds
- Owner reviews and approves: ~1 minute
- Manager sees and approves: ~1 minute
- **Total workflow: ~3 minutes**

---

**Test This:** The main fix is that Manager NOW sees requests after Owner approves them.  
**Before:** Requests disappeared into the void.  
**After:** Complete chain works Sales → Owner → Manager ✅

