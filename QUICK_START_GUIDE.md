# Quick Start Guide - Sales Role Improvements

**Last Updated:** October 8, 2025  
**Status:** Phases 1-4 Complete (57%)

---

## 🚀 Getting Started (3 Steps)

### Step 1: Start Backend
```bash
cd backend
python server.py
```
✅ Backend running on `http://localhost:8001`

### Step 2: Add New Products (One-Time)
```bash
# In another terminal
cd backend
python add_new_products.py
```
✅ 9 new products added to database

### Step 3: Start Frontend
```bash
# In another terminal
cd frontend
npm start
```
✅ Frontend running on `http://localhost:3000`

---

## 🎯 What to Test

### 1. Dashboard (Phase 1)
- Navigate to `http://localhost:3000`
- Login as sales user
- **Check:** Recent Activity shows real data
- **Check:** Auto-refreshes every 30 seconds

### 2. POS - New Products (Phase 1)
- Click "POS" tab
- **Check:** See 9 new products
- Click "Flour" filter → See flour products
- Click "Bran" filter → See bran products
- Add items to cart
- Select payment type: "Loan"
- Enter customer name and phone
- Complete sale
- **Check:** Finance transaction created
- **Check:** Loan created automatically

### 3. Stock Request Workflow (Phase 2)
- Click "Stock" tab
- Fill out stock request form
- Submit
- **Check:** Request created with status "pending_admin_approval"

**To complete workflow:**
- Login as Admin → Approve (status → pending_manager_approval)
- Login as Manager → Approve (status → pending_fulfillment)
- Login as Storekeeper → Fulfill (status → ready_for_pickup, inventory deducted)
- Login as Guard → Verify (status → in_transit)
- Login as Sales → Confirm (status → confirmed, inventory added)

### 4. Purchase Requests (Phase 3)
- Click "Purchase" tab
- Select purchase type: "Material"
- Select category: "Raw Material"
- Fill form with vendor details
- Submit
- **Check:** Request created with categorization

### 5. Order Management (Phase 4)
- Click "Orders" tab
- **Check:** See all sales orders
- **Check:** See all stock requests
- **Check:** See all purchase requests
- Use search to find specific order
- Use filter to show only pending

### 6. Loan Management (Phase 4)
- Click "Loans" tab
- **Check:** See loan from earlier POS sale
- **Check:** See customer created
- Click "Record Payment" on active loan
- Enter payment amount
- Submit
- **Check:** Balance updated
- **Check:** Finance income transaction created

### 7. Pending Deliveries (Phase 2)
- Click "Deliveries" tab
- **Check:** See stock requests in "in_transit" status
- Click "Confirm Receipt"
- Enter received quantity
- Submit
- **Check:** Inventory added to your branch

---

## 📋 API Endpoints to Test

### Test Recent Activity
```bash
curl http://localhost:8001/api/recent-activity
```

### Test Finance Summary
```bash
curl http://localhost:8001/api/finance/summary
```

### Test Stock Requests
```bash
curl http://localhost:8001/api/stock-requests
```

### Test Loans
```bash
curl http://localhost:8001/api/loans
```

### Test Overdue Loans
```bash
curl http://localhost:8001/api/loans/overdue
```

### Test Loan Aging Report
```bash
curl http://localhost:8001/api/reports/loan-aging
```

---

## 🗄️ Database Queries

### Check Finance Transactions
```javascript
// In MongoDB shell
use flour_factory_erp
db.finance_transactions.find().pretty()
```

### Check New Products
```javascript
db.inventory.find({ category: { $exists: true } }).pretty()
```

### Check Stock Requests
```javascript
db.stock_requests.find().pretty()
```

### Check Customers
```javascript
db.customers.find().pretty()
```

### Check Loans
```javascript
db.loans.find().pretty()
```

---

## 🎓 Feature Tour

### For Sales Team

**1. Make a Regular Sale**
- POS tab → Add products → Select "Cash" → Complete

**2. Make a Loan Sale**
- POS tab → Add products → Select "Loan (Credit)"
- Enter customer name: "ABC Bakery"
- Enter customer phone: "+251-911-123456"
- Complete → Loan created automatically!

**3. Request Stock**
- Stock tab → Fill form → Submit
- Track progress in Deliveries tab
- Confirm when received

**4. Track Orders**
- Orders tab → See all your orders
- Search by number or customer
- Filter by status

**5. Manage Loans**
- Loans tab → See all loans
- Record payments
- Check overdue
- View customer credit

---

## 🏢 Feature Tour for Other Roles

### For Admin/Owner
Navigate to: Owner Dashboard → Stock Approvals
- See pending stock requests
- Approve or reject with notes
- Track workflow progress

### For Manager
Navigate to: Manager Dashboard → Stock Approvals
- See admin-approved requests
- Verify production capacity
- Approve for fulfillment

### For Storekeeper
Navigate to: Storekeeper Dashboard → Fulfillment Queue
- See approved requests
- Package items
- Generate packing slip
- Mark as fulfilled (auto-deducts inventory)

### For Guard
Navigate to: Guard Dashboard → Gate Verification
- See items ready for pickup
- Verify packing slip
- Issue gate pass
- Record vehicle details
- Release for transport

---

## 📊 Dashboard Navigation

### Sales Dashboard (8 Tabs)
```
Overview   → Dashboard & recent activity
POS        → Point of sale
Orders     → All order tracking
Loans      → Loan management
Deliveries → Pending stock deliveries
Stock      → Request stock from warehouse
Purchase   → Request purchases
Reports    → Sales analytics
```

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check if MongoDB is running
# Check .env file exists
# Check dependencies installed:
pip install -r requirements.txt
```

### Frontend Not Loading
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### Products Not Showing
```bash
# Run product seeding script
cd backend
python add_new_products.py
```

### Recent Activity Empty
```bash
# Make a sale first
# Wait 30 seconds for refresh
# Or refresh page
```

---

## 📞 Quick Reference

### Default Ports
- Backend: `http://localhost:8001`
- Frontend: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`

### Database Name
- `flour_factory_erp`

### Default Credit Limit
- 500,000 ETB (auto-assigned to new customers)

### Loan Due Date
- 30 days from issue date (configurable)

---

## ✅ Quick Validation

Before proceeding, verify:
- [ ] Backend running (check `http://localhost:8001/api/`)
- [ ] Frontend running (check `http://localhost:3000`)
- [ ] MongoDB connected
- [ ] Products seeded (run `add_new_products.py`)
- [ ] Can login to sales dashboard
- [ ] Recent activity showing
- [ ] POS shows 9 new products
- [ ] All tabs accessible

---

## 🎯 Success Indicators

You'll know it's working when:
- ✅ Dashboard shows real recent orders
- ✅ POS has category filters
- ✅ Loan sales create customers automatically
- ✅ Stock requests show workflow stages
- ✅ Finance transactions auto-created
- ✅ Loans appear in Loan Management
- ✅ Payments update balances
- ✅ Orders show in Order Management

---

## 📚 Documentation Quick Links

**Start Here:**
- `SALES_DOCUMENTATION_README.md` - Navigation guide

**Implementation:**
- `SALES_ROLE_IMPROVEMENT_PLAN.md` - Complete 11-week plan
- `OVERALL_PROGRESS_SUMMARY.md` - Current progress

**Phase Details:**
- `PHASE_1_COMPLETE.md` - Foundation features
- `PHASE_2_COMPLETE.md` - Stock workflow
- `PHASE_3_COMPLETE.md` - Purchase enhancement
- `PHASE_4_COMPLETE.md` - Orders & loans

**Workflows:**
- `SALES_STOCK_REQUEST_WORKFLOW.md` - Visual diagrams

**Quick Reference:**
- `SALES_IMPROVEMENT_QUICK_REFERENCE.md` - Quick guide
- `QUICK_START_GUIDE.md` - This file

---

## 🚀 You're Ready!

Everything is set up and ready to test. Start with the Sales Dashboard and explore all the new features!

**Next:** After testing Phases 1-4, we'll implement Phase 5 (Enhanced Reports)

---

**Document Version:** 1.0  
**For:** Testing & Validation  
**Status:** Ready to Use

