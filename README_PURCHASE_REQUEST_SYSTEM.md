# Purchase Request System - Complete Guide

## 🎯 Quick Start

Your purchase request system is now fully operational! Here's what you need to know:

---

## Organizational Structure

```
👑 OWNER
    ↓ (Approves > Br 50,000)
👤 ADMIN  
    ↓ (Approves ≤ Br 50,000)
💰 FINANCE
    ↓ (Processes all payments)
📊 SALES
    (Creates purchase requests)

🏭 MANAGER - Factory operations only, NOT in purchase chain!
```

---

## The Complete Workflow

### Creating a Purchase Request (Sales)

1. **Login as Sales**
2. Go to: Sales Dashboard → Purchase Request tab
3. Fill in:
   - Description
   - Item name
   - Quantity and unit
   - Estimated cost
   - Supplier name
   - Notes/reason

4. **Submit**

5. **System automatically routes:**
   - If amount ≤ Br 50,000 → Goes to ADMIN
   - If amount > Br 50,000 → Goes to OWNER

---

### Approving Requests (Admin)

**For requests ≤ Br 50,000**

1. **Login as Admin**
2. Go to: Admin Dashboard → "Purchase Approvals" button
   - Or directly: `http://localhost:3000/admin/purchase-approvals`
3. See all pending requests
4. Click "Review & Take Action"
5. Add notes (optional)
6. Click "Approve" or "Reject"
7. If approved → Goes to Finance queue

---

### Approving Requests (Owner)

**For requests > Br 50,000**

1. **Login as Owner**
2. Go to: Owner Dashboard → Approvals → "Other Approvals" tab
   - Or directly: `http://localhost:3000/approvals`
3. See high-value pending requests
4. Click "Approve" or "Reject"
5. If approved → Goes to Finance queue

---

### Processing Payments (Finance)

**For all approved requests**

1. **Login as Finance**
2. Finance Dashboard shows:
   - Pending Payments: Total amount
   - Number of items awaiting
3. Click "Pending Approvals" tab
4. See all requests with status:
   - "Admin Approved - Ready to Pay"
   - "Owner Approved - Ready to Pay"
5. Click "Process Payment" on any request
6. Complete payment processing
7. Status → "completed"

---

## Current Status

### Your System Right Now:

**Finance Queue:** 8 requests ready for payment
- Total: Br 61,200.98
- All admin-approved (amounts ≤ Br 50,000)
- Including your request: PR-20251012162505-c06a (Br 2,500) ✅

**Admin Queue:** 0 pending (all have been approved)

**Owner Queue:** 0 pending (no high-value requests)

---

## Quick Reference

### Admin Approval Threshold
**Default: Br 50,000**

- Admin can approve up to Br 50,000
- Above Br 50,000 requires Owner approval
- Can be configured in: Owner Dashboard → Financial Controls

### Status Values

| Status | Meaning | Who Sees It |
|--------|---------|-------------|
| `pending_admin_approval` | Awaiting admin | Admin |
| `pending_owner_approval` | Awaiting owner | Owner |
| `admin_approved` | Admin approved, ready for payment | Finance |
| `owner_approved` | Owner approved, ready for payment | Finance |
| `completed` | Payment processed | All (history) |
| `rejected` | Rejected | All (history) |

### Payment Sources

Sales can pay from:
1. **Daily Sales Revenue** - If enough cash from daily sales
2. **Company Finance** - Finance department processes payment

This is configured in the request or can be determined during payment processing.

---

## Testing the System

### Test 1: Small Purchase (Admin Path)
```bash
# Create request under Br 50,000
curl -X POST http://localhost:8000/api/purchase-requests \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Office Supplies Test",
    "item_name": "Stationery",
    "quantity": 10,
    "unit": "boxes",
    "estimated_cost": 5000,
    "supplier_name": "Office Mart",
    "requested_by": "Sales Person",
    "branch_id": "sales_branch"
  }'

# Check it went to Admin
curl "http://localhost:8000/api/purchase-requisitions?status=pending_admin_approval"

# Approve as Admin (replace {id})
curl -X PUT http://localhost:8000/api/purchase-requisitions/{id}/approve-admin \
  -H "Content-Type: application/json" \
  -d '{"approved_by": "Admin", "notes": "Approved"}'

# Check Finance queue
curl "http://localhost:8000/api/finance/pending-authorizations"
```

### Test 2: Large Purchase (Owner Path)
```bash
# Create request over Br 50,000
curl -X POST http://localhost:8000/api/purchase-requests \
  -H "Content-Type: application/json" \
  -d '{
    "description": "New Equipment",
    "item_name": "Packaging Machine",
    "quantity": 1,
    "unit": "unit",
    "estimated_cost": 75000,
    "supplier_name": "Equipment Co",
    "requested_by": "Sales Person"
  }'

# Check it went to Owner
curl "http://localhost:8000/api/purchase-requisitions?status=pending_owner_approval"

# Approve as Owner (replace {id})
curl -X PUT http://localhost:8000/api/purchase-requisitions/{id}/approve-owner \
  -H "Content-Type: application/json" \
  -d '{"approved_by": "Owner", "notes": "Approved"}'

# Check Finance queue
curl "http://localhost:8000/api/finance/pending-authorizations"
```

---

## UI Screenshots of What You Should See

### Admin Purchase Approvals Screen
```
┌──────────────────────────────────────────────────────────┐
│ Purchase Request Approvals                               │
│ Review and approve purchase requests (up to Br 50,000)   │
│                                         [2 Pending] [Refresh] │
└──────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ PR-20251012-xxxx      [Pending Approval]           │
│ Office Supplies                                    │
│                                                    │
│ ┌─────────────┐  Amount: Br 2,500                 │
│ │  Br 2,500   │  Within admin approval limit      │
│ └─────────────┘                                    │
│                                                    │
│ Item: Office Supplies  |  Quantity: 1 pcs          │
│ Requested By: manager  |  Requested: 12/10/2025    │
│                                                    │
│ Supplier: Office Mart                              │
│                                                    │
│ [Review & Take Action]                             │
└────────────────────────────────────────────────────┘
```

### Finance Dashboard - Pending Approvals
```
┌──────────────────────────────────────────────────────────┐
│ Payments Awaiting Processing                            │
│ Approved purchase requisitions ready for payment        │
└──────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ Payment | Low | Admin Approved - Ready to Pay ✅  │
│ Pens, paper, folders, etc.                        │
│ Requested by: manager • 12/10/2025                │
│                                      Br 2,500     │
│ [Process Payment] [View Details]                  │
└────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Request Not Showing in Finance

**Check:**
1. Has it been approved by Admin or Owner?
   ```bash
   curl "http://localhost:8000/api/purchase-requisitions/{request-id}"
   ```
   Status should be "admin_approved" or "owner_approved"

2. Refresh Finance Dashboard (F5)

3. Check Finance endpoint:
   ```bash
   curl "http://localhost:8000/api/finance/pending-authorizations"
   ```

### Request Not Showing in Admin

**Check:**
1. Is amount ≤ Br 50,000?
2. Status should be "pending_admin_approval"
3. Check:
   ```bash
   curl "http://localhost:8000/api/purchase-requisitions?status=pending_admin_approval"
   ```

### Wrong Status Display

**Solution:** Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## Summary

✅ **All Systems Working:**
- Sales can create purchase requests
- System auto-routes based on amount
- Admin sees and approves requests ≤ Br 50,000
- Owner sees and approves requests > Br 50,000
- Finance sees ALL approved requests and can process payments
- Correct status badges everywhere
- Manager is NOT in the purchase approval chain

✅ **Your Request:**
- PR-20251012162505-c06a is in Finance queue
- Status: "admin_approved"
- Amount: Br 2,500
- Finance can process payment now!

✅ **Frontend:**
- All components created and working
- All routes configured
- UI showing correct information
- Built successfully

✅ **Backend:**
- All endpoints working
- Correct routing logic
- Threshold checks in place
- Both databases accessible

**Everything is complete and ready to use!** 🚀

---

*For detailed technical documentation, see COMPLETE_FIX_SUMMARY.md*
*For step-by-step fixes, see individual fix documentation files*

