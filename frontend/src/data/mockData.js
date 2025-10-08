export const mockData = {
  dashboard: {
    dailySales: "Br 2,350,000",
    cashInBank: "Br 45,230,000",
    grossProfit: "Br 1,180,000",
    netProfit: "Br 890,000",
    totalProduction: "8,500kg",
    activeStaff: "24",
    outstandingReceivables: "Br 3,240,000",
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
        sales: "Br 1,240,000",
        efficiency: "92%",
        inventory: "8,200kg"
      },
      {
        name: "Girmay Branch", 
        status: "Active",
        production: "4,300kg",
        sales: "Br 1,110,000",
        efficiency: "89%",
        inventory: "7,800kg"
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
      amount: "Br 8,500,000",
      requestedBy: "Finance Team",
      date: "2025-01-15",
      priority: "High",
      description: "Payment for 500 tons of premium wheat from Adigrat supplier"
    },
    {
      id: 2,
      type: "Purchase",
      title: "New Milling Equipment",
      amount: "Br 25,000,000",
      requestedBy: "Manager - Berhane",
      date: "2025-01-14",
      priority: "Medium",
      description: "Replacement of aging milling machine at Berhane branch"
    },
    {
      id: 3,
      type: "Contract",
      title: "Bulk Sales Contract",
      amount: "Br 15,200,000",
      requestedBy: "Sales Team",
      date: "2025-01-13",
      priority: "High",
      description: "6-month supply contract with major distributor in Tigray region"
    },
    {
      id: 4,
      type: "Expense",
      title: "Facility Maintenance",
      amount: "Br 3,800,000",
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
      description: "ETB 150,000 difference between reported sales and actual cash received",
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
      description: "ETB 2,000,000 cash withdrawal without prior owner approval",
      status: "Resolved"
    }
  ],

  // New mock data for reports
  reports: {
    salesTrends: [
      { month: "Jul 2024", sales: 52000000, target: 50000000 },
      { month: "Aug 2024", sales: 48000000, target: 52000000 },
      { month: "Sep 2024", sales: 55000000, target: 53000000 },
      { month: "Oct 2024", sales: 59000000, target: 55000000 },
      { month: "Nov 2024", sales: 62000000, target: 58000000 },
      { month: "Dec 2024", sales: 58000000, target: 60000000 }
    ],
    productionTrends: [
      { month: "Jul 2024", production: 180000, efficiency: 89 },
      { month: "Aug 2024", production: 175000, efficiency: 87 },
      { month: "Sep 2024", production: 190000, efficiency: 91 },
      { month: "Oct 2024", production: 195000, efficiency: 93 },
      { month: "Nov 2024", production: 200000, efficiency: 94 },
      { month: "Dec 2024", production: 185000, efficiency: 90 }
    ],
    profitLoss: [
      { month: "Jul 2024", revenue: 52000000, costs: 38000000, profit: 14000000 },
      { month: "Aug 2024", revenue: 48000000, costs: 36000000, profit: 12000000 },
      { month: "Sep 2024", revenue: 55000000, costs: 40000000, profit: 15000000 },
      { month: "Oct 2024", revenue: 59000000, costs: 42000000, profit: 17000000 },
      { month: "Nov 2024", revenue: 62000000, costs: 44000000, profit: 18000000 },
      { month: "Dec 2024", revenue: 58000000, costs: 41000000, profit: 17000000 }
    ],
    customerCredits: [
      { customer: "Habesha Bakery", amount: 850000, daysOverdue: 15 },
      { customer: "Mekelle Distribution", amount: 1200000, daysOverdue: 8 },
      { customer: "Tigray Wholesale", amount: 680000, daysOverdue: 22 },
      { customer: "Adigrat Retailers", amount: 510000, daysOverdue: 5 }
    ]
  },

  // Mock data for user management
  users: [
    {
      id: 1,
      name: "Tekle Gebremedhin",
      role: "Branch Manager",
      branch: "Berhane Branch",
      lastActivity: "2025-01-15 16:30",
      status: "Active"
    },
    {
      id: 2,
      name: "Hiwet Alem",
      role: "Sales Team Lead",
      branch: "Girmay Branch",
      lastActivity: "2025-01-15 17:15",
      status: "Active"
    },
    {
      id: 3,
      name: "Berhe Kidane",
      role: "Store Keeper",
      branch: "Berhane Branch",
      lastActivity: "2025-01-15 15:45",
      status: "Active"
    },
    {
      id: 4,
      name: "Marta Hailu",
      role: "Finance Officer",
      branch: "Both Branches",
      lastActivity: "2025-01-15 18:00",
      status: "Active"
    },
    {
      id: 5,
      name: "Gebre Yohannes",
      role: "Sales Person",
      branch: "Girmay Branch",
      lastActivity: "2025-01-14 14:20",
      status: "Inactive"
    },
    {
      id: 6,
      name: "Tsehay Meles",
      role: "Production Supervisor",
      branch: "Berhane Branch",
      lastActivity: "2025-01-15 16:50",
      status: "Active"
    }
  ]
};