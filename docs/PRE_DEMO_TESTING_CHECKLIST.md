# ✅ PRE-DEMO TESTING CHECKLIST
**Complete this checklist 1-2 hours before client presentation**

---

## 🚀 SETUP PHASE (15 minutes)

### Database Preparation
- [ ] **MongoDB is running**
  ```bash
  # Check if MongoDB is running
  # Windows: Check Services or Task Manager
  # Mac/Linux: systemctl status mongod
  ```

- [ ] **Run product seeding script**
  ```bash
  cd backend
  python update_branch_products.py
  ```
  **Expected Output:** 14 products created (5 Berhane, 9 Girmay)

- [ ] **Run demo data seeding**
  ```bash
  python seed_demo_data.py
  ```
  **Expected Output:**
  - 3 customers created
  - 5 sales transactions
  - 2 active loans
  - 3 stock requests
  - 2 purchase requisitions
  - Finance transactions
  - Milling orders

### Backend Server
- [ ] **Start backend server**
  ```bash
  python server.py
  ```
  **Expected Output:**
  ```
  INFO:     Application startup complete.
  INFO:     Uvicorn running on http://127.0.0.1:8000
  ```
  
- [ ] **Test backend is running**
  - Open browser: `http://localhost:8000/docs`
  - Should see FastAPI documentation page

### Frontend Application
- [ ] **Start frontend**
  ```bash
  cd ../frontend
  npm start
  ```
  **Expected Output:**
  ```
  Compiled successfully!
  You can now view frontend in the browser.
  Local: http://localhost:3000
  ```

- [ ] **Check for errors**
  - Press F12 (Developer Tools)
  - Check Console tab - should have NO red errors
  - Yellow warnings are OK

---

## 🧪 FUNCTIONALITY TESTING (30 minutes)

### Test 1: Owner Dashboard ✅
- [ ] **Login**
  - Navigate to: `http://localhost:3000`
  - Username: `demo_owner`
  - Password: `demo123`
  - Role: Owner
  - Click Login

- [ ] **Verify Dashboard Loads**
  - Financial KPIs show numbers (not 0 or loading)
  - Activity feed has entries
  - Branch stats appear
  - No error messages

- [ ] **Test Navigation**
  - Click "Fund Approvals" button - loads page
  - Click "Financial Controls" button - loads page
  - Click "Approvals" button - loads page
  - Click back/home - returns to dashboard

- [ ] **Logout works**
  - Click Logout button
  - Returns to login screen

**✅ PASS if all items checked**

---

### Test 2: Sales POS & Loan Creation ✅
- [ ] **Login as Sales**
  - Username: `demo_sales`
  - Password: `demo123`
  - Role: Sales

- [ ] **Verify Sales Dashboard**
  - Dashboard shows 8 tabs
  - Recent activity or stats visible
  - No errors

- [ ] **Test POS**
  - Click "POS" tab
  - Branch selector appears (top-right)
  - Select "Berhane Branch"
  - Products appear (4-5 products)
  - Change to "Girmay Branch"
  - Different products appear (9 products)

- [ ] **Complete a Sale**
  - Select "Bread 50kg"
  - Click "Add to Cart"
  - Quantity: 2
  - Total calculates correctly
  - Payment type: "Cash"
  - Click "Complete Sale"
  - Success message appears
  - Cart clears

- [ ] **Create a Loan**
  - Add product to cart
  - Payment type: "Loan (Credit)"
  - Customer name: "Test Bakery Demo"
  - Customer phone: "+251-911-999999"
  - Click "Complete Sale"
  - Success message mentions loan creation
  - **CRITICAL: Remember this loan for Test 3**

- [ ] **Verify Loan Appears**
  - Click "Loans" tab
  - See the loan you just created
  - Shows customer name, amount, status "active"

**✅ PASS if all items checked**

---

### Test 3: Stock Request Workflow ✅
- [ ] **Still logged in as Sales**
  - If not, login as demo_sales

- [ ] **Create Stock Request**
  - Click "Stock" tab
  - Product: Select "1st Quality 50kg" (or any available)
  - Quantity: 5
  - Reason: "Demo test request"
  - Click "Submit"
  - Success message appears

- [ ] **Verify Request Created**
  - Click "Orders" tab OR check recent requests
  - See your request with status "pending_admin_approval"

- [ ] **Test Owner Approval**
  - Logout
  - Login as demo_owner
  - Navigate to Approvals or Stock Approvals
  - See pending request
  - Click Approve (or view details)
  - Verify approval works

**✅ PASS if all items checked**

---

### Test 4: Finance Module ✅
- [ ] **Login as Finance**
  - Logout from current session
  - Username: `demo_finance`
  - Password: `demo123`
  - Role: Finance

- [ ] **Verify Finance Dashboard**
  - KPIs show financial numbers
  - Pending payments or authorizations visible
  - No errors

- [ ] **Test Payment Processing**
  - Click "Process Payments" or "Payment Processing"
  - See pending purchase requisitions
  - View details of one payment
  - System shows approval status

- [ ] **Check Fund Requests (if any)**
  - Look for "Fund Requests" section
  - If none, that's OK (depends on purchase amounts)

**✅ PASS if all items checked**

---

### Test 5: Manager Dashboard ✅
- [ ] **Login as Manager**
  - Logout
  - Username: `demo_manager`
  - Password: `demo123`
  - Role: Manager
  - Branch: "Berhane Branch"

- [ ] **Verify Manager Dashboard**
  - Production metrics visible
  - Raw wheat stock shown
  - Milling orders section visible
  - No errors

- [ ] **Check Wheat Delivery**
  - Look for "Wheat Delivery" form or section
  - Form should be accessible

- [ ] **Check Milling Orders**
  - See milling orders list
  - At least one order visible from seed data

**✅ PASS if all items checked**

---

### Test 6: Demo Mode ✅
- [ ] **Test Demo Landing**
  - Logout (or open new tab)
  - Go to: `http://localhost:3000`
  - Click "Quick Demo Mode" button
  - Lands on demo landing page with 4 cards

- [ ] **Test Demo POS**
  - Click "Open Point of Sale (POS)"
  - Demo POS page loads
  - Products visible
  - Can add to cart

**✅ PASS if all items checked**

---

## 🎨 VISUAL INSPECTION (10 minutes)

### Overall UI/UX
- [ ] **No broken layouts**
  - All cards/buttons properly aligned
  - No overlapping text
  - No cut-off content

- [ ] **Colors are professional**
  - Consistent color scheme
  - Status badges clearly visible (green/red/yellow)
  - No jarring color combinations

- [ ] **Icons display correctly**
  - All icons loaded (not blank squares)
  - Icons match their function

- [ ] **Responsive design**
  - Resize browser window - layout adjusts
  - No horizontal scrollbar (except tables)

- [ ] **Loading states**
  - Brief loading indicators when switching pages
  - No indefinite loading spinners

---

## 🔧 BROWSER PREPARATION (5 minutes)

### Clean Up for Demo
- [ ] **Close unnecessary tabs**
  - Keep only: localhost:3000
  - Close all other tabs

- [ ] **Clear browser warnings**
  - Press F12
  - Clear console (trash icon)
  - Close developer tools

- [ ] **Full screen mode ready**
  - Press F11 to enter full screen
  - Practice pressing F11 to exit if needed

- [ ] **Zoom level correct**
  - Press Ctrl+0 to reset zoom to 100%

- [ ] **Bookmarks bar hidden**
  - Ctrl+Shift+B to toggle

---

## 📋 DATA VERIFICATION (5 minutes)

### Check Database Has Demo Data
Using MongoDB Compass or command line:

- [ ] **Check Inventory**
  ```javascript
  db.inventory.count()
  // Should be 14+
  ```

- [ ] **Check Customers**
  ```javascript
  db.customers.count()
  // Should be 3+
  ```

- [ ] **Check Loans**
  ```javascript
  db.loans.count()
  // Should be 2+
  ```

- [ ] **Check Sales Transactions**
  ```javascript
  db.sales_transactions.count()
  // Should be 5+
  ```

- [ ] **Check Stock Requests**
  ```javascript
  db.stock_requests.count()
  // Should be 3+
  ```

**If any count is 0, re-run `python seed_demo_data.py`**

---

## 🎯 FINAL CHECKS (5 minutes)

### Environment
- [ ] **Laptop fully charged** (or plugged in)
- [ ] **Internet connection stable** (for emergencies)
- [ ] **Notifications disabled**
  - Windows: Win+A, enable Focus Assist
  - Mac: Enable Do Not Disturb
- [ ] **Screen brightness appropriate**
- [ ] **Volume at reasonable level** (if audio)

### Backup Materials
- [ ] **Demo script printed** or on phone
- [ ] **This checklist accessible**
- [ ] **Screenshot of successful dashboard** (just in case)
- [ ] **Water nearby** 💧

### Mental Preparation
- [ ] **Deep breath** - you've got this!
- [ ] **Review demo script once**
- [ ] **Smile and confidence** 😊

---

## ⚠️ COMMON ISSUES & FIXES

### Issue: "Cannot connect to backend"
**Fix:**
```bash
# Check backend is running
# Should see "Uvicorn running on http://127.0.0.1:8000"
# If not, restart: python server.py
```

### Issue: "No products in POS"
**Fix:**
```bash
# Re-run product seeding
cd backend
python update_branch_products.py
```

### Issue: "Dashboard is empty"
**Fix:**
```bash
# Re-run demo data seeding
python seed_demo_data.py
```

### Issue: "Page keeps loading"
**Fix:**
- Press F12
- Check Console for errors
- Look for red error messages
- Usually backend is not running

### Issue: "Login doesn't work"
**Fix:**
- Use exact credentials:
  - demo_owner / demo123
  - demo_sales / demo123
  - demo_finance / demo123
  - demo_manager / demo123
- Check you selected a role
- Check you selected branch (for manager)

---

## 🎉 READY TO GO!

When all items are checked:
- ✅ Backend running
- ✅ Frontend running
- ✅ Database seeded
- ✅ All tests pass
- ✅ Browser prepared
- ✅ Backup ready
- ✅ Confidence high

**YOU ARE READY FOR THE DEMO! 🚀**

---

## 📞 Emergency Contacts

**If you need help during setup:**
- Technical issues: [Your tech contact]
- Questions: [Your mentor/colleague]

**Remember:**
- Stay calm
- Minor glitches are normal
- Focus on business value, not technical perfection
- Clients care about solutions, not perfect demos

---

**Good luck! You've prepared well! 🍀**

