// MongoDB Script to Fix Existing Purchase Requests
// Run this in MongoDB Compass or Shell

// Switch to the correct database
use kushukushu_erp

// Fix all pending requests based on their amount
print("\n=== Fixing Purchase Requests ===\n");

// Method 1: Update all "pending" requests at once
const result = db.purchase_requisitions.updateMany(
  { status: "pending" },
  [
    {
      $set: {
        status: {
          $cond: {
            if: { $lte: ["$estimated_cost", 50000] },
            then: "pending_admin_approval",
            else: "pending_owner_approval"
          }
        },
        routing: {
          $cond: {
            if: { $lte: ["$estimated_cost", 50000] },
            then: "admin",
            else: "owner"
          }
        },
        admin_threshold: 50000,
        updated_at: new Date()
      }
    }
  ]
);

print("Updated " + result.modifiedCount + " requests");
print("\nBreakdown:");

// Show what was updated
const adminRequests = db.purchase_requisitions.countDocuments({
  status: "pending_admin_approval"
});
const ownerRequests = db.purchase_requisitions.countDocuments({
  status: "pending_owner_approval"
});

print("- Routed to Admin: " + adminRequests);
print("- Routed to Owner: " + ownerRequests);

// Also remove any manager-related fields from all requests
db.purchase_requisitions.updateMany(
  {},
  {
    $unset: {
      manager_approved_at: "",
      manager_approved_by: "",
      manager_notes: ""
    }
  }
);

print("\n✅ Fixed! Purchase requests are now using the correct flow.");
print("\nAdmin can now see: " + adminRequests + " requests");
print("Owner can now see: " + ownerRequests + " requests");

