# Branch Products Quick Reference

## 🏭 BERHANE BRANCH

### Products (6 total)
| Product | Size | Stock | Notes |
|---------|------|-------|-------|
| Bread | 50kg | 2,000kg | ✓ |
| Bread | 25kg | 1,000kg | ✓ |
| Fruska | bulk | 1,500kg | ✓ |
| **Fruskelo Red** | bulk | 650kg | **ONLY BERHANE** |
| **TDF Bread** | 50kg | 1,500kg | **ONLY BERHANE** (TDF wheat) |
| **TDF Bread** | 25kg | 750kg | **ONLY BERHANE** (TDF wheat) |

### ❌ Does NOT Produce
- 1st Quality Flour (any size)
- Fruskelo White

### ℹ️ Special Notes
- **ONLY** branch that receives wheat from TDF (Tigray Defense Force)
- **ONLY** branch that produces Fruskelo Red
- Processes TDF wheat into TDF Bread products

---

## 🏭 GIRMAY BRANCH

### Products (8 total)
| Product | Size | Stock | Notes |
|---------|------|-------|-------|
| **1st Quality** | 50kg | 2,500kg | **ONLY GIRMAY** |
| **1st Quality** | 25kg | 1,250kg | **ONLY GIRMAY** |
| **1st Quality** | 10kg | 500kg | **ONLY GIRMAY** |
| **1st Quality** | 5kg | 250kg | **ONLY GIRMAY** |
| Bread | 50kg | 1,800kg | ✓ |
| Bread | 25kg | 900kg | ✓ |
| Fruska | bulk | 1,380kg | ✓ |
| **Fruskelo White** | bulk | 600kg | **ONLY GIRMAY** |

### ❌ Does NOT Produce
- TDF products (any TDF wheat-based products)
- Fruskelo Red

### ℹ️ Special Notes
- **ONLY** branch that produces 1st Quality Flour
- **ONLY** branch that produces Fruskelo White
- Does NOT receive TDF wheat

---

## 📊 Product Matrix

| Product | Berhane | Girmay | Package Sizes |
|---------|---------|--------|---------------|
| **1st Quality Flour** | ❌ | ✅ | 50kg, 25kg, 10kg, 5kg |
| **Bread Flour** | ✅ | ✅ | 50kg, 25kg |
| **TDF Bread** | ✅ | ❌ | 50kg, 25kg |
| **Fruska** | ✅ | ✅ | bulk |
| **Fruskelo Red** | ✅ | ❌ | bulk |
| **Fruskelo White** | ❌ | ✅ | bulk |

---

## 🔍 Quick Lookup

### "Where can I find 1st Quality Flour?"
**→ GIRMAY BRANCH ONLY** (4 sizes: 50kg, 25kg, 10kg, 5kg)

### "Where can I find TDF products?"
**→ BERHANE BRANCH ONLY** (TDF wheat from Tigray Defense Force)

### "Where can I find Red Fruskelo?"
**→ BERHANE BRANCH ONLY**

### "Where can I find White Fruskelo?"
**→ GIRMAY BRANCH ONLY**

### "Where can I find Bread Flour?"
**→ BOTH BRANCHES** (50kg and 25kg at both)

### "Where can I find Fruska?"
**→ BOTH BRANCHES**

---

## 🛠️ Verification Commands

```bash
# Check current inventory status
cd backend
python fix_branch_products.py

# Update/add products if needed
python update_branch_products.py

# Restart server
python server.py
```

---

## ⚠️ Critical Rules

1. **1st Quality = GIRMAY ONLY**
2. **TDF Products = BERHANE ONLY**
3. **Red Fruskelo = BERHANE ONLY**
4. **White Fruskelo = GIRMAY ONLY**
5. **Bread & Fruska = BOTH BRANCHES**

---

**Last Updated**: October 9, 2025  
**Status**: ✅ Verified & Implemented

