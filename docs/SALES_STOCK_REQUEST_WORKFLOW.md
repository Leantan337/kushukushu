# Stock Request Workflow - Visual Guide

## Overview
This document provides a visual representation of the complete stock request workflow from initial request to final delivery confirmation.

---

## 🔄 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    STOCK REQUEST WORKFLOW                            │
└─────────────────────────────────────────────────────────────────────┘

STAGE 1: REQUEST INITIATION
┌──────────────┐
│   SALES      │  Creates stock request
│   PERSON     │  • Select product & quantity
└──────┬───────┘  • Specify reason
       │          • Submit request
       ↓
┌─────────────────────────────────────┐
│  Request Created                     │
│  Status: pending_admin_approval     │
│  Request #: SR-00001                │
│  Inventory: NOT YET RESERVED        │
└──────────────┬──────────────────────┘
               │
               ↓

STAGE 2: ADMIN/OWNER APPROVAL
┌──────────────┐
│ OWNER/ADMIN  │  Reviews request
└──────┬───────┘  • Check availability
       │          • Validate need
       │          • Approve or Reject
       ↓
   ┌───┴────┐
   │Decision│
   └───┬────┘
       │
    ┌──┴──┐
  Reject│  │Approve
    │   │  │
    ↓   │  ↓
  [END] │  ┌──────────────────────────────┐
        │  │ Status: admin_approved        │
        │  │ Inventory: RESERVED           │
        │  │ Reserved Qty: Locked in DB    │
        │  └────────────┬─────────────────┘
        │               │
        │               ↓

STAGE 3: MANAGER APPROVAL
                ┌──────────────┐
                │   MANAGER    │  Second-level review
                └──────┬───────┘  • Verify production capacity
                       │          • Check priority
                       │          • Approve or Reject
                       ↓
                   ┌───┴────┐
                   │Decision│
                   └───┬────┘
                       │
                    ┌──┴──┐
                  Reject│  │Approve
                    │   │  │
                    ↓   │  ↓
            [UNRESERVE] │  ┌──────────────────────────────┐
                  [END] │  │ Status: manager_approved      │
                        │  │ Inventory: STILL RESERVED     │
                        │  │ Next: Prepare for fulfillment │
                        │  └────────────┬─────────────────┘
                        │               │
                        │               ↓

STAGE 4: STOREKEEPER FULFILLMENT
                                ┌──────────────┐
                                │ STOREKEEPER  │  Physical preparation
                                └──────┬───────┘  • Pull items from warehouse
                                       │          • Package properly
                                       │          • Generate packing slip
                                       │          • Mark as ready
                                       ↓
                        ┌────────────────────────────────┐
                        │ Status: ready_for_pickup       │
                        │ Inventory: DEDUCTED            │
                        │ Physical Stock: Moved to staging│
                        │ Packing Slip: Generated        │
                        └────────────┬───────────────────┘
                                     │
                                     ↓

STAGE 5: GUARD GATE VERIFICATION
                                ┌──────────────┐
                                │    GUARD     │  Exit verification
                                └──────┬───────┘  • Check packing slip
                                       │          • Verify quantities
                                       │          • Check authorization
                                       │          • Issue gate pass
                                       ↓
                        ┌────────────────────────────────┐
                        │ Status: at_gate / in_transit   │
                        │ Gate Pass: Issued              │
                        │ Exit Time: Recorded            │
                        │ Vehicle/Carrier: Logged        │
                        └────────────┬───────────────────┘
                                     │
                                     ↓

STAGE 6: SALES DELIVERY CONFIRMATION
                                ┌──────────────┐
                                │ SALES PERSON │  Receipt confirmation
                                └──────┬───────┘  • Receive delivery
                                       │          • Verify quantities
                                       │          • Check condition
                                       │          • Confirm receipt
                                       ↓
                        ┌────────────────────────────────┐
                        │ Status: delivered_confirmed    │
                        │ Inventory: UPDATED             │
                        │ Transaction: COMPLETED         │
                        │ Sales Stock: INCREASED         │
                        └────────────┬───────────────────┘
                                     │
                                     ↓
                        ┌────────────────────────────────┐
                        │        WORKFLOW COMPLETE        │
                        │   ✓ Request fulfilled          │
                        │   ✓ Inventory updated          │
                        │   ✓ Audit trail recorded       │
                        └────────────────────────────────┘
```

---

## 📊 State Transition Table

| Stage | Status | Actor | Actions | Next Status | Inventory State |
|-------|--------|-------|---------|-------------|-----------------|
| 1 | `pending_admin_approval` | Sales | Create request | `admin_approved` or `rejected` | Available |
| 2 | `admin_approved` | Admin/Owner | Review & approve | `manager_approved` or `rejected` | Reserved |
| 3 | `manager_approved` | Manager | Verify & approve | `ready_for_pickup` or `rejected` | Reserved |
| 4 | `ready_for_pickup` | Storekeeper | Prepare & package | `at_gate` | Deducted |
| 5 | `at_gate` | Guard | Verify & release | `in_transit` | Deducted |
| 6 | `in_transit` | - | In delivery | `delivered` | Deducted |
| 7 | `delivered` | Sales | Confirm receipt | `completed` | Transferred |

---

## 🔀 Alternative Paths

### Rejection at Admin Stage
```
pending_admin_approval → rejected
    ↓
Inventory: Remains available
Notification: Sent to sales
Status: Terminal (END)
```

### Rejection at Manager Stage
```
admin_approved → rejected
    ↓
Inventory: Unreserved (released back)
Notification: Sent to sales & admin
Status: Terminal (END)
```

### Partial Fulfillment
```
manager_approved → partial_fulfillment
    ↓
Split into:
  1. Fulfilled portion → Continue workflow
  2. Unfulfilled portion → New request or cancel
```

### Discrepancy at Gate
```
ready_for_pickup → discrepancy_found
    ↓
Investigation initiated
    ↓
Resolution:
  - Correct & continue
  - Return to storekeeper
  - Cancel request
```

---

## 📱 Notification Flow

```
Request Created
    ↓
    📧 → Admin/Owner: "New stock request awaiting approval"
    
Admin Approved
    ↓
    📧 → Manager: "Stock request needs your approval"
    📧 → Sales: "Your request was approved by admin"
    
Manager Approved
    ↓
    📧 → Storekeeper: "New fulfillment task assigned"
    📧 → Sales: "Your request was approved by manager"
    
Ready for Pickup
    ↓
    📧 → Guard: "Delivery ready for gate check"
    📧 → Sales: "Your order is ready for pickup"
    
At Gate
    ↓
    📧 → Sales: "Your delivery is in transit"
    
Delivered
    ↓
    📧 → Sales: "Please confirm receipt"
    
Confirmed
    ↓
    📧 → All: "Stock request SR-00001 completed"
```

---

## 🗂️ Data Flow

### Request Object Evolution

#### Stage 1: Created
```json
{
  "id": "SR-00001",
  "status": "pending_admin_approval",
  "product_id": "PROD-001",
  "product_name": "1st Quality Flour 50kg",
  "quantity": 100,
  "requested_by": "sales_user_01",
  "branch_id": "berhane",
  "source_branch": "main_warehouse",
  "created_at": "2025-01-20T08:00:00Z",
  "inventory_reserved": false,
  "inventory_deducted": false,
  "workflow_history": [
    {
      "stage": "created",
      "timestamp": "2025-01-20T08:00:00Z",
      "actor": "sales_user_01",
      "action": "Request created"
    }
  ]
}
```

#### Stage 2: Admin Approved
```json
{
  "status": "admin_approved",
  "inventory_reserved": true,
  "reserved_quantity": 100,
  "admin_approval": {
    "approved_by": "admin_user_01",
    "approved_at": "2025-01-20T09:15:00Z",
    "notes": "Approved - sufficient stock"
  },
  "workflow_history": [
    // ... previous
    {
      "stage": "admin_approval",
      "timestamp": "2025-01-20T09:15:00Z",
      "actor": "admin_user_01",
      "action": "Approved request"
    }
  ]
}
```

#### Stage 3: Manager Approved
```json
{
  "status": "manager_approved",
  "manager_approval": {
    "approved_by": "manager_user_01",
    "approved_at": "2025-01-20T10:30:00Z",
    "notes": "Verified priority, approved"
  },
  "workflow_history": [
    // ... previous
    {
      "stage": "manager_approval",
      "timestamp": "2025-01-20T10:30:00Z",
      "actor": "manager_user_01",
      "action": "Approved request"
    }
  ]
}
```

#### Stage 4: Fulfilled
```json
{
  "status": "ready_for_pickup",
  "inventory_deducted": true,
  "fulfillment": {
    "fulfilled_by": "storekeeper_01",
    "fulfilled_at": "2025-01-20T14:00:00Z",
    "packing_slip_number": "PS-00123",
    "actual_quantity": 100,
    "notes": "All items packaged and ready"
  },
  "workflow_history": [
    // ... previous
    {
      "stage": "fulfillment",
      "timestamp": "2025-01-20T14:00:00Z",
      "actor": "storekeeper_01",
      "action": "Items packaged and ready"
    }
  ]
}
```

#### Stage 5: Gate Verified
```json
{
  "status": "in_transit",
  "gate_verification": {
    "verified_by": "guard_01",
    "verified_at": "2025-01-20T15:00:00Z",
    "gate_pass_number": "GP-00456",
    "vehicle_number": "ET-123-ABC",
    "driver_name": "John Doe",
    "exit_time": "2025-01-20T15:05:00Z"
  },
  "workflow_history": [
    // ... previous
    {
      "stage": "gate_verification",
      "timestamp": "2025-01-20T15:00:00Z",
      "actor": "guard_01",
      "action": "Verified and released"
    }
  ]
}
```

#### Stage 6: Delivered & Confirmed
```json
{
  "status": "completed",
  "delivery_confirmation": {
    "confirmed_by": "sales_user_01",
    "confirmed_at": "2025-01-20T16:00:00Z",
    "received_quantity": 100,
    "condition": "good",
    "notes": "All items received in good condition"
  },
  "completed_at": "2025-01-20T16:00:00Z",
  "total_duration_hours": 8,
  "workflow_history": [
    // ... previous
    {
      "stage": "delivery_confirmation",
      "timestamp": "2025-01-20T16:00:00Z",
      "actor": "sales_user_01",
      "action": "Confirmed receipt"
    }
  ]
}
```

---

## 🏭 Branch-Specific Routing

### Product-Branch Mapping
```javascript
const productBranchMap = {
  // 1st Quality products → Main Warehouse (Berhane)
  "1st Quality Flour 50kg": "main_warehouse",
  "1st Quality Flour 25kg": "main_warehouse",
  "1st Quality Flour 15kg": "main_warehouse",
  "1st Quality Flour 5kg": "main_warehouse",
  
  // Bread Flour → Girmay Production
  "Bread Flour 50kg": "girmay_warehouse",
  "Bread Flour 25kg": "girmay_warehouse",
  
  // Bran products → Both (check availability)
  "White Fruskela": "available_branch",
  "Red Fruskela": "available_branch",
  "Furska": "available_branch"
};
```

### Routing Logic Flow
```
1. Sales creates request
     ↓
2. System checks product type
     ↓
3. Determines source branch from mapping
     ↓
4. Checks inventory at source branch
     ↓
5. If available → Route to source branch workflow
     ↓
6. If not available → Check alternate branch
     ↓
7. If nowhere available → Reject with reason
```

---

## 🔒 Inventory State Management

### State Transitions

```
AVAILABLE (Initial State)
  ↓ (Admin approves)
RESERVED (Quantity locked, not deducted)
  ↓ (Manager rejects) → Back to AVAILABLE
  ↓ (Manager approves)
ALLOCATED (Still reserved, awaiting fulfillment)
  ↓ (Storekeeper fulfills)
DEDUCTED (Removed from source inventory)
  ↓ (Sales confirms)
TRANSFERRED (Added to destination inventory)
```

### Database Operations

#### On Admin Approval
```javascript
// Reserve inventory
await db.inventory.update(
  { id: product_id, branch: source_branch },
  { 
    $inc: { 
      available_quantity: -100,
      reserved_quantity: +100
    }
  }
);
```

#### On Manager Rejection
```javascript
// Unreserve inventory
await db.inventory.update(
  { id: product_id, branch: source_branch },
  { 
    $inc: { 
      available_quantity: +100,
      reserved_quantity: -100
    }
  }
);
```

#### On Storekeeper Fulfillment
```javascript
// Deduct from source
await db.inventory.update(
  { id: product_id, branch: source_branch },
  { 
    $inc: { 
      quantity: -100,
      reserved_quantity: -100
    },
    $push: {
      transactions: {
        type: "out",
        quantity: 100,
        reference: "SR-00001",
        timestamp: new Date()
      }
    }
  }
);
```

#### On Sales Confirmation
```javascript
// Add to destination
await db.inventory.update(
  { id: product_id, branch: destination_branch },
  { 
    $inc: { 
      quantity: +100,
      available_quantity: +100
    },
    $push: {
      transactions: {
        type: "in",
        quantity: 100,
        reference: "SR-00001",
        timestamp: new Date()
      }
    }
  }
);
```

---

## 📈 Performance Metrics

### Key Metrics to Track

| Metric | Calculation | Target |
|--------|-------------|--------|
| Average Approval Time | Time from creation to manager approval | < 4 hours |
| Fulfillment Time | Time from approval to ready for pickup | < 2 hours |
| Transit Time | Time from gate to delivery | < 1 hour |
| Total Cycle Time | Creation to confirmation | < 8 hours |
| Rejection Rate | Rejected / Total requests | < 5% |
| Accuracy Rate | Correct qty / Total qty | > 99% |

---

## 🚨 Error Handling

### Common Issues & Resolutions

#### Issue 1: Insufficient Inventory
```
Error: Inventory insufficient at source branch
Resolution:
  1. Check alternate branch
  2. If available → Route there
  3. If not → Suggest partial fulfillment
  4. If neither → Reject with ETA for restock
```

#### Issue 2: Approval Timeout
```
Error: Request pending for > 24 hours
Resolution:
  1. Send escalation notification
  2. Auto-assign to backup approver
  3. Log delay in audit trail
```

#### Issue 3: Quantity Mismatch at Gate
```
Error: Physical qty != Requested qty
Resolution:
  1. Guard creates discrepancy report
  2. Storekeeper investigates
  3. Options:
     - Correct and continue
     - Return to warehouse
     - Update request quantity
```

#### Issue 4: Lost in Transit
```
Error: Delivery not confirmed within expected time
Resolution:
  1. Auto-alert to all parties
  2. Track last known location
  3. Initiate investigation
  4. Temporary inventory hold
```

---

## 🔍 Audit & Compliance

### Audit Trail Requirements

Every workflow stage must record:
- **Who**: User ID and name
- **What**: Action performed
- **When**: Timestamp (ISO format)
- **Where**: Branch/location
- **Why**: Reason/notes (if applicable)
- **How**: Method (manual, automatic, API)

### Compliance Checklist

- [x] All transactions logged
- [x] Inventory changes tracked
- [x] Approvals documented
- [x] User actions traceable
- [x] Timestamps accurate
- [x] Data immutable (no deletion)
- [x] Access controls enforced
- [x] Regular backups

---

## 📝 SOP (Standard Operating Procedures)

### For Sales Person

1. **Creating Request**
   - Log into system
   - Navigate to "Stock Requests"
   - Click "New Request"
   - Select product and quantity
   - Enter reason
   - Submit

2. **Tracking Request**
   - View "My Requests"
   - Check status
   - View workflow history
   - Receive notifications

3. **Confirming Delivery**
   - When delivery arrives
   - Verify quantity and condition
   - Log into system
   - Click "Confirm Receipt"
   - Enter notes
   - Submit

### For Admin/Owner

1. **Reviewing Requests**
   - Log into admin panel
   - View "Pending Approvals"
   - Click on request
   - Review details
   - Check inventory availability
   - Approve or Reject with reason

### For Manager

1. **Approving Requests**
   - Access manager dashboard
   - View "Awaiting Manager Approval"
   - Review production capacity
   - Check priority
   - Approve or Reject

### For Storekeeper

1. **Fulfilling Orders**
   - View "Fulfillment Queue"
   - Gather items from warehouse
   - Package properly
   - Generate packing slip
   - Mark as "Ready for Pickup"

### For Guard

1. **Gate Verification**
   - Check packing slip
   - Verify against system
   - Count items (spot check)
   - Check authorization
   - Issue gate pass
   - Record exit

---

**Document Version:** 1.0  
**Last Updated:** October 8, 2025  
**Status:** Implementation Guide

