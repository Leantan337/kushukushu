export const mockData = {
  dashboard: {
    dailySales: "ETB 2,350,000",
    cashInBank: "ETB 45,230,000",
    grossProfit: "ETB 1,180,000",
    netProfit: "ETB 890,000",
    totalProduction: "8,500kg",
    activeStaff: "24",
    outstandingReceivables: "ETB 3,240,000",
    inventoryLevels: {
      rawWheat: "12,500kg",
      finishedFlour: "8,200kg",
      fruska: "2,300kg"
    },
    weeklyProduction: [
      { day: "Monday", amount: 850 },
      { day: "Tuesday", amount: 920 },
      { day: "Wednesday", amount: 780 },
      { day: "Thursday", amount: 890 },
      { day: "Friday", amount: 950 },
      { day: "Saturday", amount: 720 },
      { day: "Sunday", amount: 680 }
    ],
    branches: [
      {
        name: "Berhane Branch",
        status: "Active",
        production: "4,200kg",
        sales: "ETB 1,240,000",
        efficiency: "92%"
      },
      {
        name: "Girmay Branch", 
        status: "Active",
        production: "4,300kg",
        sales: "ETB 1,110,000",
        efficiency: "89%"
      }
    ]
  },
  
  ratioConfig: {
    branches: [
      { id: 1, name: "Berhane Branch" },
      { id: 2, name: "Girmay Branch" }
    ],
    products: [
      { id: 1, name: "1st Quality" },
      { id: 2, name: "Bread Flour" },
      { id: 3, name: "TDF (Traditional)" }
    ],
    currentRatios: {
      "Berhane-1st Quality": { flour: 70, fruska: 25, fruskelo: 5 },
      "Girmay-1st Quality": { flour: 72, fruska: 23, fruskelo: 5 },
      "Berhane-Bread Flour": { flour: 75, fruska: 20, fruskelo: 5 },
      "Girmay-Bread Flour": { flour: 74, fruska: 21, fruskelo: 5 }
    }
  },

  approvals: [
    {
      id: 1,
      type: "Payment",
      title: "Supplier Payment - Premium Wheat",
      amount: "ETB 8,500,000",
      requestedBy: "Finance Team",
      date: "2025-01-15",
      priority: "High",
      description: "Payment for 500 tons of premium wheat from Adigrat supplier"
    },
    {
      id: 2,
      type: "Purchase",
      title: "New Milling Equipment",
      amount: "ETB 25,000,000",
      requestedBy: "Manager - Berhane",
      date: "2025-01-14",
      priority: "Medium",
      description: "Replacement of aging milling machine at Berhane branch"
    },
    {
      id: 3,
      type: "Contract",
      title: "Bulk Sales Contract",
      amount: "ETB 15,200,000",
      requestedBy: "Sales Team",
      date: "2025-01-13",
      priority: "High",
      description: "6-month supply contract with major distributor in Tigray region"
    },
    {
      id: 4,
      type: "Expense",
      title: "Facility Maintenance",
      amount: "ETB 3,800,000",
      requestedBy: "Admin Team",
      date: "2025-01-12",
      priority: "Low",
      description: "Quarterly maintenance for both factory locations in Adigrat"
    }
  ],

  alerts: [
    {
      id: 1,
      type: "Data Mismatch",
      title: "Sales vs Cash Discrepancy",
      severity: "High",
      branch: "Girmay Branch",
      date: "2025-01-15",
      time: "14:30",
      description: "₦150,000 difference between reported sales and actual cash received",
      status: "New"
    },
    {
      id: 2,
      type: "Fraud Alert",
      title: "Unusual Transaction Pattern",
      severity: "Critical",
      branch: "Berhane Branch",
      date: "2025-01-15",
      time: "10:15",
      description: "Multiple high-value transactions by same sales person within 1 hour",
      status: "New"
    },
    {
      id: 3,
      type: "Inventory Alert",
      title: "Stock Level Mismatch",
      severity: "Medium",
      branch: "Berhane Branch",
      date: "2025-01-14",
      time: "16:45",
      description: "Physical count doesn't match digital inventory for 1st Quality flour",
      status: "Investigating"
    },
    {
      id: 4,
      type: "Production Alert",
      title: "Low Output Efficiency",
      severity: "Medium",
      branch: "Girmay Branch",
      date: "2025-01-14",
      time: "09:20",
      description: "Production efficiency dropped to 78% - below 85% threshold",
      status: "Resolved"
    },
    {
      id: 5,
      type: "Financial Alert",
      title: "Large Cash Withdrawal",
      severity: "High",
      branch: "Both Branches",
      date: "2025-01-13",
      time: "11:30",
      description: "₦2,000,000 cash withdrawal without prior owner approval",
      status: "Resolved"
    }
  ]
};