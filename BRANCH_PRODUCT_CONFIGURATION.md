# Branch-Specific Product Configuration

## Overview
This document outlines the specific products produced by each branch based on their actual production capabilities and wheat sources.

---

## 🏭 BERHANE BRANCH

### Products Produced
1. **Bread Flour**
   - Bread 50kg (2,000kg in stock)
   - Bread 25kg (1,000kg in stock)

2. **Bran Products**
   - Fruska (900kg in stock)
   - **Fruskelo Red** (650kg in stock) - **ONLY BERHANE produces this**

3. **TDF Products** (from Tigray Defense Force wheat)
   - TDF Bread 50kg (1,500kg in stock)
   - TDF Bread 25kg (750kg in stock)
   - **ONLY BERHANE** receives wheat from TDF and processes it

### Does NOT Produce
- ❌ **1st Quality Flour** (any size)
- ❌ **Fruskelo White**

### Special Characteristics
- **TDF Wheat Processing**: BERHANE is the ONLY branch that receives wheat from the Tigray Defense Force (TDF) and processes it into TDF Bread products
- **Red Fruskelo**: The red variant of Fruskelo is exclusively produced at BERHANE

---

## 🏭 GIRMAY BRANCH

### Products Produced
1. **1st Quality Flour** - **ONLY GIRMAY produces this**
   - 1st Quality 50kg (2,500kg in stock)
   - 1st Quality 25kg (1,250kg in stock)
   - 1st Quality 10kg (500kg in stock)
   - 1st Quality 5kg (250kg in stock)

2. **Bread Flour**
   - Bread 50kg (1,800kg in stock)
   - Bread 25kg (900kg in stock)

3. **Bran Products**
   - Fruska (850kg in stock)
   - **Fruskelo White** (600kg in stock) - **ONLY GIRMAY produces this**

### Does NOT Produce
- ❌ **TDF Products** (any TDF wheat-based products)
- ❌ **Fruskelo Red**

### Special Characteristics
- **1st Quality Flour**: GIRMAY is the ONLY branch that produces 1st Quality Flour in all package sizes
- **White Fruskelo**: The white variant of Fruskelo is exclusively produced at GIRMAY

---

## 📊 Product Comparison Table

| Product | Berhane | Girmay | Notes |
|---------|---------|--------|-------|
| **1st Quality Flour** | ❌ | ✅ | Only Girmay (4 sizes) |
| **Bread Flour** | ✅ | ✅ | Both branches (50kg, 25kg) |
| **TDF Bread** | ✅ | ❌ | Only Berhane (TDF wheat) |
| **Fruska** | ✅ | ✅ | Both branches |
| **Fruskelo Red** | ✅ | ❌ | Only Berhane |
| **Fruskelo White** | ❌ | ✅ | Only Girmay |

---

## 🔄 Inventory Management

### Database Schema
Each product in the inventory includes:
- `branch_id`: "berhane" or "girmay"
- `branch_name`: "Berhane Branch" or "Girmay Branch"
- `is_tdf`: Boolean flag for TDF products (Berhane only)
- `tdf_source`: "Tigray Defense Force" for TDF products
- `notes`: Special production notes

### Branch Isolation
- **POS System**: Shows only products from the user's assigned branch
- **Stock Requests**: Automatically route to the correct producing branch
- **Inventory**: Each branch maintains separate inventory records

### Product Routing Logic
The system uses `determine_source_branch()` function to route requests:

```python
# ONLY Girmay produces:
"1st Quality" → "girmay"
"Fruskelo White" → "girmay"

# ONLY Berhane produces:
"TDF" → "berhane"
"Fruskelo Red" → "berhane"

# Both branches produce:
"Bread" → "both" (routes to branch with higher stock)
"Fruska" → "both" (routes to branch with higher stock)
```

---

## 🛠️ Setup Instructions

### 1. Update Product Database
Run the branch product seeder script:
```bash
cd backend
python update_branch_products.py
```

This will:
- Add all Berhane-specific products (including TDF products)
- Add all Girmay-specific products (including 1st Quality and White Fruskelo)
- Skip duplicates if already exists
- Display summary of products per branch

### 2. Verify Configuration
Check the database to ensure:
- Berhane has: Bread (2), Fruska (1), Fruskelo Red (1), TDF Bread (2) = **6 products**
- Girmay has: 1st Quality (4), Bread (2), Fruska (1), Fruskelo White (1) = **8 products**

### 3. Test Branch Isolation
- Login to POS at Berhane → Should see only Berhane products
- Login to POS at Girmay → Should see only Girmay products (including 1st Quality)
- Stock requests for 1st Quality → Should route to Girmay
- Stock requests for TDF products → Should route to Berhane

---

## 📝 Implementation Files

### Backend Files
- `backend/update_branch_products.py` - Product seeder with branch-specific products
- `backend/server.py` - Contains `determine_source_branch()` routing logic
- `backend/seed_branch_inventory.py` - Raw materials inventory seeder

### Frontend Components
- `frontend/src/components/sales/POSTransaction.jsx` - Branch-filtered POS
- `frontend/src/components/sales/InventoryRequestForm.jsx` - Stock request routing
- All sales components use `branch_id` filtering

---

## ✅ Key Business Rules

1. **1st Quality Flour**: Exclusive to Girmay Branch
2. **TDF Products**: Exclusive to Berhane Branch (TDF wheat source)
3. **Fruskelo Red**: Exclusive to Berhane Branch
4. **Fruskelo White**: Exclusive to Girmay Branch
5. **Bread & Fruska**: Available at both branches
6. **Branch Isolation**: Users only see/sell products from their assigned branch

---

## 🔍 Troubleshooting

### Issue: Wrong products showing in POS
**Solution**: Verify user's `branch_id` matches product's `branch_id`

### Issue: Stock request routed to wrong branch
**Solution**: Check `determine_source_branch()` logic in server.py

### Issue: TDF products showing at Girmay
**Solution**: Re-run `update_branch_products.py` and verify TDF products only have `branch_id: "berhane"`

### Issue: 1st Quality showing at Berhane
**Solution**: Re-run `update_branch_products.py` and verify 1st Quality products only have `branch_id: "girmay"`

---

## 📞 Support

For questions about branch-specific product configuration, refer to:
- `BRANCH_SPECIFIC_SYSTEM_GUIDE.md` - General branch isolation guide
- `SALES_DOCUMENTATION_README.md` - Sales module documentation
- `INVENTORY_ARCHITECTURE_ANALYSIS.md` - Inventory system architecture

---

**Last Updated**: October 9, 2025
**Configuration Version**: 2.0 (Corrected branch-specific production)

