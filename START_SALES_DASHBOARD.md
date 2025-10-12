# Quick Start Guide - Sales Dashboard

## Prerequisites
✅ Backend is running and verified
✅ MongoDB is running
✅ Frontend is built successfully

## Option 1: Development Mode (Recommended for Testing)

### Start Frontend Dev Server:
```bash
cd frontend
npm start
```

The app will open at `http://localhost:3000`

## Option 2: Production Build (Already Built)

### Serve the Production Build:
```bash
cd frontend
npx serve -s build
```

The app will be available at `http://localhost:3000`

## Testing the Sales Dashboard

1. **Navigate to Login Page**
   - Go to `http://localhost:3000`

2. **Login as Sales User**
   - Look for sales credentials in your system
   - Or login with demo sales user

3. **Navigate to Overview Tab**
   - Should land on Overview by default
   - Check all 4 stat cards:
     - Today's Sales
     - Transactions
     - Pending Requests
     - Stock Alerts

4. **Test Features**
   - ✅ Click "Refresh Data" button - should show loading spinners
   - ✅ Verify Recent Activity section shows activities with icons
   - ✅ Check that stats update correctly
   - ✅ Verify no console errors in browser DevTools (F12)

## Expected Behavior

### Stats Cards (as of test time):
- **Today's Sales**: Should show ETB amount (may be 0 if no sales today)
- **Transactions**: Should show count (may be 0 if no sales today)
- **Pending Requests**: Should show 19 (based on test data)
- **Stock Alerts**: Should show count of low stock items

### Recent Activity:
- Should display up to 10 recent activities
- Each activity should have:
  - Colored icon (green/orange/blue/red)
  - Description text
  - Time stamp (e.g., "5 minutes ago")
  - Branch badge (if applicable)

### Auto-Refresh:
- Dashboard automatically refreshes every 30 seconds
- Manual refresh available via "Refresh Data" button

## Troubleshooting

### If stats show as 0 but backend has data:
1. Open browser console (F12)
2. Look for console.log messages:
   - "Sales data fetched: X transactions"
   - "Today's sales: X Transactions: X"
   - etc.
3. Check if date filtering is working correctly
4. Today's sales will be 0 if no transactions were made today

### If Recent Activity is empty:
1. Generate new activity by:
   - Processing a POS transaction (POS tab)
   - Creating a stock request (Stock tab)
   - Submitting a purchase request (Purchase tab)
2. Wait for auto-refresh or click "Refresh Data"

### If nothing loads:
1. Verify backend is running: `http://localhost:8000/api/sales-transactions`
2. Check browser console for CORS or network errors
3. Verify MongoDB is running and has data

## Quick Test Commands

### Test Backend (from project root):
```bash
python test_sales_dashboard_api.py
```

### Check Frontend Build:
```bash
cd frontend
npm run build
```

### Start Everything (PowerShell):
```powershell
# Terminal 1 - Backend
cd backend
python server.py

# Terminal 2 - Frontend
cd frontend
npm start
```

---

## What Was Fixed

1. ✅ **Activity data transformation** - Backend data now properly formatted for display
2. ✅ **Loading states** - Visual feedback when loading data
3. ✅ **Error handling** - Better error logging and handling
4. ✅ **Manual refresh** - Added refresh button for user control
5. ✅ **Enhanced UI** - Better visual design with icons and badges
6. ✅ **Date handling** - Robust date parsing for different formats
7. ✅ **Status detection** - Multiple checks for pending requests and low stock

All changes are in: `frontend/src/components/sales/SalesDashboard.jsx`

---

*For detailed technical information, see `SALES_DASHBOARD_FIX_SUMMARY.md`*

