import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AppContext = createContext();

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Initial state with branch-separated inventory
const initialState = {
  // Current user session
  currentUser: null,
  
  // Inventory with branch_id
  inventory: [
    // Berhane Branch
    { id: 'INV-001', name: 'Raw Wheat', quantity: 12500, unit: 'kg', branch_id: 'berhane', low_threshold: 5000, critical_threshold: 2000, stock_level: 'ok' },
    { id: 'INV-002', name: '1st Quality Flour', quantity: 4200, unit: 'kg', branch_id: 'berhane', low_threshold: 3000, critical_threshold: 1000, stock_level: 'ok' },
    { id: 'INV-003', name: 'Bread Flour', quantity: 2800, unit: 'kg', branch_id: 'berhane', low_threshold: 2000, critical_threshold: 800, stock_level: 'ok' },
    { id: 'INV-004', name: 'Fruska (Bran)', quantity: 1300, unit: 'kg', branch_id: 'berhane', low_threshold: 1000, critical_threshold: 500, stock_level: 'ok' },
    
    // Girmay Branch
    { id: 'INV-005', name: 'Raw Wheat', quantity: 11800, unit: 'kg', branch_id: 'girmay', low_threshold: 5000, critical_threshold: 2000, stock_level: 'ok' },
    { id: 'INV-006', name: '1st Quality Flour', quantity: 3900, unit: 'kg', branch_id: 'girmay', low_threshold: 3000, critical_threshold: 1000, stock_level: 'ok' },
    { id: 'INV-007', name: 'Bread Flour', quantity: 2600, unit: 'kg', branch_id: 'girmay', low_threshold: 2000, critical_threshold: 800, stock_level: 'ok' },
    { id: 'INV-008', name: 'Fruska (Bran)', quantity: 1200, unit: 'kg', branch_id: 'girmay', low_threshold: 1000, critical_threshold: 500, stock_level: 'ok' },
  ],
  
  // Purchase Requisitions
  purchaseRequisitions: [
    {
      id: 'PR-00001',
      request_number: 'PR-00001',
      description: 'Premium Wheat - 500 tons',
      estimated_cost: 8500000,
      reason: 'Stock replenishment for both branches',
      requested_by: 'Manager - Berhane',
      requested_at: new Date('2025-01-10'),
      status: 'owner_approved', // pending, manager_approved, admin_approved, owner_approved, purchased, rejected
      branch_id: 'berhane',
      manager_approval: {
        approved_by: 'Tekle Gebremedhin',
        approved_at: new Date('2025-01-11'),
        notes: 'Urgent requirement for production'
      },
      admin_approval: {
        approved_by: 'Admin User',
        approved_at: new Date('2025-01-12'),
        notes: 'Verified with supplier quotation'
      },
      owner_approval: {
        approved_by: 'Owner',
        approved_at: new Date('2025-01-14'),
        notes: 'Approved for payment processing'
      }
    },
    {
      id: 'PR-00002',
      request_number: 'PR-00002',
      description: 'Equipment Maintenance - Milling Machines',
      estimated_cost: 3800000,
      reason: 'Quarterly maintenance both branches',
      requested_by: 'Admin Team',
      requested_at: new Date('2025-01-12'),
      status: 'owner_approved',
      branch_id: 'both',
      manager_approval: {
        approved_by: 'Tekle Gebremedhin',
        approved_at: new Date('2025-01-13'),
        notes: 'Required for optimal operation'
      },
      admin_approval: {
        approved_by: 'Admin User',
        approved_at: new Date('2025-01-13'),
        notes: 'Reviewed maintenance schedule'
      },
      owner_approval: {
        approved_by: 'Owner',
        approved_at: new Date('2025-01-15'),
        notes: 'Approved'
      }
    },
    {
      id: 'PR-00003',
      request_number: 'PR-00003',
      description: 'Packaging Materials - Flour Bags',
      estimated_cost: 1250000,
      reason: 'Stock running low on 50kg bags',
      requested_by: 'Store Keeper - Berhane',
      requested_at: new Date('2025-01-14'),
      status: 'admin_approved',
      branch_id: 'berhane',
      manager_approval: {
        approved_by: 'Tekle Gebremedhin',
        approved_at: new Date('2025-01-14'),
        notes: 'Verified current stock levels'
      },
      admin_approval: {
        approved_by: 'Admin User',
        approved_at: new Date('2025-01-15'),
        notes: 'Approved for procurement'
      }
    }
  ],
  
  // Internal Orders (Sales requesting inventory)
  internalOrders: [],
  
  // Sales Transactions
  salesTransactions: [],
  
  // Milling Orders (Production)
  millingOrders: [],
  
  // Daily Reconciliation
  reconciliation: {
    berhane: { reconciled: false, date: null, variance: 0 },
    girmay: { reconciled: false, date: null, variance: 0 }
  },
  
  // Accounts Receivable
  customers: [
    {
      id: 'CUST-001',
      name: 'Habesha Bakery',
      phone: '+251-911-234567',
      branch: 'berhane',
      totalOwed: 850000,
      creditLimit: 1000000,
      paymentHistory: 'good',
      transactions: [
        { id: 'TXN-000115', date: '2025-01-05', amount: 350000, daysOverdue: 15, status: 'overdue' },
        { id: 'TXN-000120', date: '2025-01-10', amount: 500000, daysOverdue: 10, status: 'overdue' }
      ]
    },
    {
      id: 'CUST-002',
      name: 'Mekelle Distribution Center',
      phone: '+251-914-567890',
      branch: 'girmay',
      totalOwed: 1200000,
      creditLimit: 2000000,
      paymentHistory: 'fair',
      transactions: [
        { id: 'TXN-000118', date: '2025-01-08', amount: 600000, daysOverdue: 12, status: 'overdue' },
        { id: 'TXN-000125', date: '2025-01-12', amount: 600000, daysOverdue: 8, status: 'overdue' }
      ]
    }
  ]
};

// Provider component
export const AppProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('erp_state');
    return saved ? JSON.parse(saved) : initialState;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('erp_state', JSON.stringify(state));
  }, [state]);

  // ==================== INVENTORY MANAGEMENT ====================
  
  const updateInventory = (itemId, quantity, type, reference, performedBy) => {
    setState(prev => {
      const inventory = [...prev.inventory];
      const itemIndex = inventory.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) return prev;
      
      const item = { ...inventory[itemIndex] };
      const oldQuantity = item.quantity;
      
      // Update quantity
      if (type === 'in') {
        item.quantity += quantity;
      } else if (type === 'out') {
        if (item.quantity < quantity) {
          alert(`Insufficient inventory for ${item.name}. Available: ${item.quantity}kg`);
          return prev;
        }
        item.quantity -= quantity;
      }
      
      // Update stock level
      if (item.quantity <= item.critical_threshold) {
        item.stock_level = 'critical';
      } else if (item.quantity <= item.low_threshold) {
        item.stock_level = 'low';
      } else {
        item.stock_level = 'ok';
      }
      
      inventory[itemIndex] = item;
      
      console.log(`✅ Inventory Updated: ${item.name} (${item.branch_id})`, {
        type,
        quantity,
        oldQuantity,
        newQuantity: item.quantity,
        reference,
        performedBy
      });
      
      return { ...prev, inventory };
    });
  };

  const getInventoryByBranch = (branchId) => {
    return state.inventory.filter(item => item.branch_id === branchId);
  };

  const getInventoryItem = (itemId) => {
    return state.inventory.find(item => item.id === itemId);
  };

  // ==================== PURCHASE REQUISITIONS ====================
  
  const createPurchaseRequisition = (data) => {
    const newPR = {
      id: `PR-${String(state.purchaseRequisitions.length + 1).padStart(5, '0')}`,
      request_number: `PR-${String(state.purchaseRequisitions.length + 1).padStart(5, '0')}`,
      status: 'pending',
      requested_at: new Date(),
      ...data
    };
    
    setState(prev => ({
      ...prev,
      purchaseRequisitions: [...prev.purchaseRequisitions, newPR]
    }));
    
    console.log('✅ Purchase Requisition Created:', newPR.request_number);
    return newPR;
  };

  const approvePurchaseRequisition = (prId, level, approvedBy, notes) => {
    setState(prev => {
      const prs = [...prev.purchaseRequisitions];
      const prIndex = prs.findIndex(pr => pr.id === prId);
      
      if (prIndex === -1) return prev;
      
      const pr = { ...prs[prIndex] };
      const approval = {
        approved_by: approvedBy,
        approved_at: new Date(),
        notes
      };
      
      if (level === 'manager') {
        pr.manager_approval = approval;
        pr.status = 'manager_approved';
      } else if (level === 'admin') {
        pr.admin_approval = approval;
        pr.status = 'admin_approved';
      } else if (level === 'owner') {
        pr.owner_approval = approval;
        pr.status = 'owner_approved';
      }
      
      prs[prIndex] = pr;
      
      console.log(`✅ Purchase Requisition ${level.toUpperCase()} Approved:`, pr.request_number);
      
      return { ...prev, purchaseRequisitions: prs };
    });
  };

  const processPurchasePayment = (prId, paymentDetails, processedBy) => {
    setState(prev => {
      const prs = [...prev.purchaseRequisitions];
      const prIndex = prs.findIndex(pr => pr.id === prId);
      
      if (prIndex === -1) return prev;
      
      const pr = { ...prs[prIndex] };
      pr.status = 'purchased';
      pr.purchased_at = new Date();
      pr.payment_details = paymentDetails;
      pr.processed_by = processedBy;
      
      prs[prIndex] = pr;
      
      console.log('✅ Payment Processed:', pr.request_number, paymentDetails);
      
      return { ...prev, purchaseRequisitions: prs };
    });
  };

  // ==================== SALES TRANSACTIONS ====================
  
  const createSalesTransaction = (items, paymentType, salesPerson, branchId, customer) => {
    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    const transaction = {
      id: `TXN-${String(state.salesTransactions.length + 1).padStart(6, '0')}`,
      transaction_number: `TXN-${String(state.salesTransactions.length + 1).padStart(6, '0')}`,
      items,
      totalAmount,
      paymentType,
      status: paymentType === 'loan' ? 'unpaid' : 'paid',
      salesPerson,
      branchId,
      customer,
      timestamp: new Date()
    };
    
    // Deduct from inventory
    items.forEach(item => {
      const inventoryItem = state.inventory.find(inv => 
        inv.name === item.productName && inv.branch_id === branchId
      );
      
      if (inventoryItem) {
        updateInventory(
          inventoryItem.id,
          item.quantity,
          'out',
          `Sales ${transaction.transaction_number}`,
          salesPerson
        );
      }
    });
    
    setState(prev => ({
      ...prev,
      salesTransactions: [...prev.salesTransactions, transaction]
    }));
    
    console.log('✅ Sales Transaction Created:', transaction.transaction_number);
    return transaction;
  };

  // ==================== MILLING ORDERS (PRODUCTION) ====================
  
  const createMillingOrder = (rawWheatKg, managerId, branchId) => {
    const rawWheatItem = state.inventory.find(item => 
      item.name === 'Raw Wheat' && item.branch_id === branchId
    );
    
    if (!rawWheatItem || rawWheatItem.quantity < rawWheatKg) {
      alert(`Insufficient Raw Wheat in ${branchId} branch`);
      return null;
    }
    
    const millingOrder = {
      id: `MO-${String(state.millingOrders.length + 1).padStart(5, '0')}`,
      rawWheatInput: rawWheatKg,
      managerId,
      branchId,
      status: 'pending',
      createdAt: new Date(),
      outputs: []
    };
    
    // Deduct raw wheat
    updateInventory(
      rawWheatItem.id,
      rawWheatKg,
      'out',
      `Milling Order ${millingOrder.id}`,
      managerId
    );
    
    setState(prev => ({
      ...prev,
      millingOrders: [...prev.millingOrders, millingOrder]
    }));
    
    console.log('✅ Milling Order Created:', millingOrder.id);
    return millingOrder;
  };

  const completeMillingOrder = (millingOrderId, outputs, managerId) => {
    setState(prev => {
      const orders = [...prev.millingOrders];
      const orderIndex = orders.findIndex(o => o.id === millingOrderId);
      
      if (orderIndex === -1) return prev;
      
      const order = { ...orders[orderIndex] };
      order.status = 'completed';
      order.completedAt = new Date();
      order.outputs = outputs;
      
      // Add outputs to inventory
      outputs.forEach(output => {
        const inventoryItem = state.inventory.find(item =>
          item.name === output.productName && item.branch_id === order.branchId
        );
        
        if (inventoryItem) {
          updateInventory(
            inventoryItem.id,
            output.quantity,
            'in',
            `Milling Order ${order.id} Output`,
            managerId
          );
        }
      });
      
      orders[orderIndex] = order;
      
      console.log('✅ Milling Order Completed:', order.id);
      
      return { ...prev, millingOrders: orders };
    });
  };

  // ==================== RECONCILIATION ====================
  
  const reconcileBranch = (branchId, actualCash, expectedCash, notes, reconciledBy) => {
    const variance = actualCash - expectedCash;
    
    setState(prev => ({
      ...prev,
      reconciliation: {
        ...prev.reconciliation,
        [branchId]: {
          reconciled: true,
          date: new Date(),
          expectedCash,
          actualCash,
          variance,
          notes,
          reconciledBy
        }
      }
    }));
    
    console.log(`✅ ${branchId.toUpperCase()} Reconciled:`, {
      expectedCash,
      actualCash,
      variance
    });
  };

  // ==================== USER SESSION ====================
  
  const login = (username, password, role) => {
    const user = {
      username,
      role,
      loginTime: new Date()
    };
    
    setState(prev => ({ ...prev, currentUser: user }));
    console.log('✅ User Logged In:', user);
    return user;
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    console.log('✅ User Logged Out');
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Inventory
    updateInventory,
    getInventoryByBranch,
    getInventoryItem,
    
    // Purchase Requisitions
    createPurchaseRequisition,
    approvePurchaseRequisition,
    processPurchasePayment,
    
    // Sales
    createSalesTransaction,
    
    // Production
    createMillingOrder,
    completeMillingOrder,
    
    // Reconciliation
    reconcileBranch,
    
    // User
    login,
    logout,
    
    // Helpers
    formatCurrency: (amount) => {
      // Handle undefined, null, or invalid values
      if (amount === undefined || amount === null || isNaN(amount)) {
        return 'Br 0';
      }
      return `Br ${Number(amount).toLocaleString()}`;
    },
    getBranchName: (branchId) => {
      return branchId === 'berhane' ? 'Berhane Branch' : 
             branchId === 'girmay' ? 'Girmay Branch' : 
             'Both Branches';
    }
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;

