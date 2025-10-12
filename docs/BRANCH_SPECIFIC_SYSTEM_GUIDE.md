# Branch-Specific Product System - Implementation Guide

**Date:** October 8, 2025  
**Status:** ✅ COMPLETE  
**System:** Integrated with Sales Module

---

## 🏭 Branch Overview

Your system now has **TWO production branches** with **unique product lines**:

### 📍 **BERHANE BRANCH**
**Products:**
1. Bread 50kg
2. Bread 25kg
3. Fruska (Bran - bulk)
4. Fruskelo Red (Bran - bulk)
5. **TDF Service Parts** (Special - tracking only, not for sale)

**Unique ID:** `berhane`

---

### 📍 **GIRMAY BRANCH**
**Products:**
1. 1st Quality 50kg
2. 1st Quality 25kg
3. 1st Quality 10kg
4. 1st Quality 5kg
5. Bread 50kg
6. Bread 25kg
7. Fruska (Bran - bulk)
8. Fruskelo Red (Bran - bulk)
9. Fruskelo White (Bran - bulk)

**Unique ID:** `girmay`

---

## 🎯 Key Concepts

### 1. **Unique Products Per Branch**
- Each product has a unique `branch_id`
- Same product name can exist in both branches (e.g., "Bread 50kg")
- Each is tracked separately with its own inventory

### 2. **Branch-Specific Production**
**Berhane Specializes In:**
- Bread Flour products
- Bran products
- TDF Service (non-sellable)

**Girmay Specializes In:**
- 1st Quality Flour (all sizes - ONLY Girmay produces this!)
- Bread Flour products (also produces)
- Bran products (wider variety)

### 3. **Automatic Routing**
When a stock request is created:
- **1st Quality** → Always routes to **Girmay** (they're the only producer)
- **Bread products** → Routes to branch with more stock
- **Fruska** → Routes to branch with more stock
- **Fruskelo Red** → Routes to branch with more stock
- **Fruskelo White** → Always routes to **Girmay** (only they produce it)

---

## 🔄 How It Works

### POS (Point of Sale)

**Branch Selector:**
- Top-right of POS has branch dropdown
- Select "Berhane Branch" → See Berhane products only
- Select "Girmay Branch" → See Girmay products only
- **Products shown are ONLY from that branch**
- Cannot sell products you don't have!

**Example:**
```
Sales user at Berhane POS:
- Can sell: Bread 50kg, Bread 25kg, Fruska, Fruskelo Red
- CANNOT see: 1st Quality products (those are only at Girmay)
```

---

### Stock Requests

**Smart Routing:**
- Sales can request ANY product
- System automatically determines source branch
- Routes request to correct warehouse
- Validates availability before accepting

**Example Flow:**
```
Sales Branch requests "1st Quality 50kg"
    ↓
System detects: "1st Quality" = Girmay only
    ↓
Request routes to: Girmay warehouse
    ↓
Approval workflow starts at Girmay
    ↓
Fulfilled from Girmay inventory
    ↓
Delivered to Sales Branch
```

---

### Inventory Management

**Each branch maintains separate inventory:**

```javascript
// Berhane Inventory
{
  "name": "Bread 50kg",
  "branch_id": "berhane",
  "quantity": 2000
}

// Girmay Inventory (separate record!)
{
  "name": "Bread 50kg",
  "branch_id": "girmay",
  "quantity": 1800
}
```

**Important:** These are TWO different inventory items!

---

## 🔒 TDF Service Tracking

### Special Feature for Berhane Branch

**TDF Service Parts:**
- Located in Berhane branch
- **NOT sellable** through POS
- Used for tracking service work for TDF
- Does not appear in sales POS
- Can be tracked separately

**Future Enhancement:**
- Add more organizations (like TDF)
- Track service work separately
- Generate service reports

**Database Structure:**
```javascript
{
  "name": "TDF Service Parts",
  "branch_id": "berhane",
  "category": "service",
  "is_sellable": false,      // Cannot sell in POS
  "is_service": true,
  "service_for": "TDF",
  "notes": "Service and spare parts for TDF"
}
```

---

## 📊 Product Matrix

| Product | Package | Berhane | Girmay | Notes |
|---------|---------|---------|--------|-------|
| **1st Quality** | 50kg | ❌ | ✅ | Girmay ONLY |
| **1st Quality** | 25kg | ❌ | ✅ | Girmay ONLY |
| **1st Quality** | 10kg | ❌ | ✅ | Girmay ONLY |
| **1st Quality** | 5kg | ❌ | ✅ | Girmay ONLY |
| **Bread** | 50kg | ✅ | ✅ | Both branches |
| **Bread** | 25kg | ✅ | ✅ | Both branches |
| **Fruska** | Bulk | ✅ | ✅ | Both branches |
| **Fruskelo Red** | Bulk | ✅ | ✅ | Both branches |
| **Fruskelo White** | Bulk | ❌ | ✅ | Girmay ONLY |
| **TDF Service** | Unit | ✅ | ❌ | Berhane ONLY (not sellable) |

---

## 🚀 Setup Instructions

### Step 1: Run Product Update Script
```bash
cd backend
python update_branch_products.py
```

**Expected Output:**
```
============================================================
ADDING ACTUAL BRANCH-SPECIFIC PRODUCTS
============================================================

📍 BERHANE BRANCH Products:
------------------------------------------------------------

📍 GIRMAY BRANCH Products:
------------------------------------------------------------

💾 Inserting Products...
------------------------------------------------------------
  ✓ Bread 50kg (Berhane Branch) - 2000.0kg
  ✓ Bread 25kg (Berhane Branch) - 1000.0kg
  ✓ Fruska (Berhane Branch) - 900.0kg
  ✓ Fruskelo Red (Berhane Branch) - 650.0kg
  ✓ TDF Service Parts (Berhane Branch) - 0.0kg [SERVICE ONLY]
  ✓ 1st Quality 50kg (Girmay Branch) - 2500.0kg
  ... (more products)
  
✅ COMPLETED!
```

---

### Step 2: Restart Backend
```bash
# Stop current backend (Ctrl+C)
python server.py
```

---

### Step 3: Test POS
```bash
# Frontend should already be running
# Navigate to: http://localhost:3000
# Login as sales
# Go to POS tab
```

**What You Should See:**
- Branch selector dropdown (top-right)
- Select "Berhane Branch" → See 4 products
- Select "Girmay Branch" → See 9 products
- TDF Service does NOT appear (not sellable)

---

## 🧪 Testing Scenarios

### Test 1: Branch-Specific POS
```
1. Go to POS tab
2. Select "Berhane Branch" from dropdown
3. Verify you see:
   - Bread 50kg
   - Bread 25kg
   - Fruska
   - Fruskelo Red
   
4. Select "Girmay Branch"
5. Verify you see:
   - 1st Quality 50kg, 25kg, 10kg, 5kg
   - Bread 50kg, 25kg
   - Fruska
   - Fruskelo Red
   - Fruskelo White
```

### Test 2: Auto Branch Routing
```
1. Go to Stock Requests tab
2. Select "1st Quality 50kg" 
3. Enter quantity: 10
4. Submit

Result:
- Request created
- System auto-routes to Girmay (only they produce it)
- source_branch = "girmay"
- Approval workflow starts
```

### Test 3: Bread Products (Both Branches)
```
1. Request "Bread 50kg"
2. System checks both branches
3. Routes to branch with MORE stock
4. If Berhane has 2000kg and Girmay has 1800kg
   → Routes to Berhane
```

### Test 4: TDF Service (Not Sellable)
```
1. Go to POS
2. TDF Service Parts should NOT appear
3. It's tracked in inventory but not sellable
4. Can be used for service tracking separately
```

---

## 💡 Business Rules

### Rule 1: Unique Inventory
Each branch maintains its own inventory counts:
- Berhane's "Bread 50kg" ≠ Girmay's "Bread 50kg"
- Separate stock levels
- Separate transactions
- Independent management

### Rule 2: Automatic Routing
Stock requests automatically route to:
- Source branch where product is produced
- For shared products (Bread, Fruska): branch with more stock
- No manual selection needed

### Rule 3: POS Restrictions
Sales can only sell products from their current branch:
- Prevents selling items you don't have
- Inventory deducted from correct branch
- Clear visibility of available stock

### Rule 4: Service Items
TDF Service and future service items:
- `is_sellable: false` flag
- Not shown in POS
- Can be tracked for service work
- Separate reporting possible

---

## 🔧 Configuration

### Adding New Organizations (Like TDF)

To add another organization service tracking:

```python
{
    "name": "[Organization Name] Service",
    "category": "service",
    "branch_id": "berhane",  # or "girmay"
    "is_sellable": False,
    "is_service": True,
    "service_for": "[Organization Name]",
    "notes": "Service description"
}
```

---

## 📋 Product Setup Checklist

When adding new products:
- [ ] Specify correct `branch_id` (berhane or girmay)
- [ ] Set `category` (flour, bran, service)
- [ ] Set `is_sellable` (true for normal products, false for services)
- [ ] Add `branch_name` for display purposes
- [ ] Set appropriate `unit_price`
- [ ] Configure `low_threshold` and `critical_threshold`
- [ ] Update branch routing if needed (in `determine_source_branch()`)

---

## 🎯 User Experience

### For Sales at Berhane
**What they see in POS:**
- Bread 50kg @ ETB 2,600
- Bread 25kg @ ETB 1,350
- Fruska @ ETB 12/kg
- Fruskelo Red @ ETB 18/kg

**What they can request:**
- Any product from any branch
- System auto-routes correctly

### For Sales at Girmay
**What they see in POS:**
- 1st Quality 50kg @ ETB 2,500
- 1st Quality 25kg @ ETB 1,300
- 1st Quality 10kg @ ETB 550
- 1st Quality 5kg @ ETB 280
- Bread 50kg @ ETB 2,600
- Bread 25kg @ ETB 1,350
- Fruska @ ETB 12/kg
- Fruskelo Red @ ETB 18/kg
- Fruskelo White @ ETB 16/kg

**What they can request:**
- Any product from any branch
- System auto-routes correctly

---

## 🔍 Technical Details

### Database Query for Branch Products
```javascript
// Get products for specific branch
db.inventory.find({ 
  branch_id: "berhane",
  is_sellable: { $ne: false },
  category: { $in: ["flour", "bran"] }
})
```

### POS Filtering Logic
```javascript
// Frontend filters products
const branchProducts = data.filter(item => 
  item.branch_id === currentBranch &&
  item.is_sellable !== false &&
  item.category !== "service"
);
```

### Stock Request Routing
```python
# Backend determines source automatically
async def determine_source_branch(product_name):
    if "1st Quality" in product_name:
        return "girmay"  # Only Girmay produces
    elif "Fruskelo White" in product_name:
        return "girmay"  # Only Girmay produces
    elif "Bread" in product_name:
        return "both"  # Check stock levels
    # ... etc
```

---

## 📊 Inventory Reports

### By Branch
```
Berhane Branch:
- Total Products: 5 (4 sellable + 1 service)
- Total Stock: ~4,550kg
- Categories: Flour (2), Bran (2), Service (1)

Girmay Branch:
- Total Products: 9 (all sellable)
- Total Stock: ~9,450kg
- Categories: Flour (6), Bran (3)
```

### By Product Type
```
1st Quality Flour:
- Only Girmay (4 sizes)
- Total: ~4,500kg

Bread Flour:
- Berhane (2 sizes): ~3,000kg
- Girmay (2 sizes): ~2,700kg
- Combined: ~5,700kg

Bran Products:
- Berhane (2 types): ~1,550kg
- Girmay (3 types): ~2,150kg
- Combined: ~3,700kg
```

---

## 🚨 Important Notes

### ⚠️ Branch Separation
- **Each branch's inventory is INDEPENDENT**
- Selling from one branch does NOT affect the other
- Stock requests TRANSFER inventory between branches
- Track movements with complete audit trail

### ⚠️ Service Items
- **TDF Service** is NOT sellable
- Will not appear in POS
- Tracked for service work only
- Can add more service organizations later

### ⚠️ Stock Requests
- **Auto-routing** determines source branch
- For products in both branches → routes to higher stock
- Validates availability before creating request
- Complete workflow from source to destination

---

## 🔜 Future Enhancements

### Phase 5: Add More Organizations
Easy to add more service organizations:
```python
{
    "name": "ABC Company Service",
    "category": "service",
    "branch_id": "berhane",
    "is_sellable": False,
    "service_for": "ABC Company"
}
```

### Phase 6: Branch-Specific Pricing
If needed, can add different prices per branch:
```javascript
{
    "name": "Bread 50kg",
    "branch_id": "berhane",
    "unit_price": 2600  // Berhane price
}

{
    "name": "Bread 50kg",
    "branch_id": "girmay",
    "unit_price": 2550  // Girmay price (if different)
}
```

### Phase 7: Inter-Branch Transfers
Stock requests already handle this:
- Request from Berhane → Fulfilled from Girmay
- Inventory moved properly
- Complete audit trail

---

## ✅ Implementation Checklist

- [x] Created `update_branch_products.py` script
- [x] Added Berhane branch products (5 items)
- [x] Added Girmay branch products (9 items)
- [x] Added TDF service tracking (not sellable)
- [x] Updated branch routing logic
- [x] Updated POS to show branch-specific products
- [x] Added branch selector to POS
- [x] Updated stock request auto-routing
- [x] Excluded service items from POS
- [x] Updated inventory request form
- [x] All products have unique branch_id
- [x] No linting errors

---

## 🧪 Quick Test Commands

### 1. Add Branch Products
```bash
cd backend
python update_branch_products.py
```

### 2. Verify in MongoDB
```javascript
// Check Berhane products
db.inventory.find({ branch_id: "berhane" }).pretty()

// Check Girmay products
db.inventory.find({ branch_id: "girmay" }).pretty()

// Check TDF service
db.inventory.find({ is_sellable: false }).pretty()
```

### 3. Test POS
```bash
# In browser: http://localhost:3000
# Login as sales
# Go to POS
# Switch between Berhane/Girmay
# See different products
```

---

## 📖 Example Scenarios

### Scenario 1: Berhane Sales Day
```
Morning:
- POS set to "Berhane Branch"
- Available: Bread, Fruska, Fruskelo Red
- Sell 20 bags of Bread 50kg
- Inventory deducted from Berhane

Running Low:
- Request "Bread 50kg" x 30 bags
- System checks both branches
- Routes to branch with more stock
- Workflow: Approval → Fulfillment → Delivery
- Inventory transferred from Girmay to Berhane
```

### Scenario 2: Girmay Sales Day
```
Morning:
- POS set to "Girmay Branch"
- Available: 1st Quality (all sizes), Bread, Bran
- Sell 1st Quality products (unique to Girmay!)
- Inventory deducted from Girmay

Customer Request:
- Customer wants "1st Quality 10kg" x 100 bags
- Only Girmay has this → Sell from Girmay
- Cannot fulfill from Berhane (they don't produce it)
```

### Scenario 3: TDF Service Work
```
Berhane receives TDF service request:
- Need to track parts used
- NOT a sale (no money exchange)
- Create internal tracking record
- Link to TDF Service Parts
- Generate service report
- (Future enhancement)
```

---

## 🎓 Training Points

### For Sales Team
1. **Know your branch** - You can only sell what you have
2. **Use branch selector** - Switch to see different inventories
3. **Stock requests are flexible** - Can request from any branch
4. **System handles routing** - No need to specify source

### For Managers
1. **Each branch is independent** - Separate inventories
2. **Stock transfers** - Through formal request workflow
3. **Production capacity** - Verify before approving
4. **Shared products** - Routes to higher stock automatically

### For Admins
1. **Branch-specific tracking** - All movements logged by branch
2. **Service items** - Special category, not sellable
3. **Adding organizations** - Easy to extend for more
4. **Reporting** - Can filter by branch

---

## 📈 Reporting by Branch

### Sales Reports
```
Filter by branch_id:
- Berhane sales
- Girmay sales
- Compare performance
```

### Inventory Reports
```
Show by branch:
- Berhane stock levels
- Girmay stock levels
- Transfer history between branches
```

### Finance Reports
```
Track by branch:
- Berhane revenue
- Girmay revenue
- Branch profitability
```

---

## ✨ Summary

**What You Now Have:**
- ✅ **2 Independent Branches** with separate inventories
- ✅ **14 Products** (5 Berhane + 9 Girmay)
- ✅ **Automatic Routing** for stock requests
- ✅ **Branch-Specific POS** - only show what you have
- ✅ **TDF Service Tracking** - non-sellable items
- ✅ **Flexible System** - easy to add more organizations

**How It Benefits You:**
- **Accurate Inventory** - Each branch tracked separately
- **Prevent Errors** - Can't sell what you don't have
- **Easy Transfers** - Stock request workflow handles it
- **Complete Visibility** - Know exactly where products are
- **Scalable** - Add more branches/organizations easily

---

**Next Steps:**
1. Run `python update_branch_products.py`
2. Restart backend
3. Test POS with both branches
4. Test stock requests with auto-routing
5. Verify TDF service is tracked but not sellable

---

**System Status:** ✅ READY  
**Branch Setup:** ✅ COMPLETE  
**Products:** ✅ 14 Total (Unique per branch)  
**Service Tracking:** ✅ TDF Implemented

---

*Last Updated: October 8, 2025*  
*Version: 1.0*  
*Status: Branch-Specific System Active*

