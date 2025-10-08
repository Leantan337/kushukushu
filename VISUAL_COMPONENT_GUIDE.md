# Visual Component Guide - New Screens

## 🔐 Unified Login Screen

### Step 1: Credential Entry
```
┌─────────────────────────────────────────┐
│                                         │
│          ┌──────────┐                   │
│          │ Building │  (Slate-900 bg)   │
│          │   Icon   │                   │
│          └──────────┘                   │
│                                         │
│      Flour Factory ERP                  │
│   Wheat Flour Factory Management        │
│        System - Adigrat                 │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ 👤  Enter your username        │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ 🔒  Enter your password        │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │        Continue                 │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Step 2: Role Selection
```
┌─────────────────────────────────────────┐
│                                         │
│          ┌──────────┐                   │
│          │ Building │                   │
│          │   Icon   │                   │
│          └──────────┘                   │
│                                         │
│         Select Your Role                │
│      Choose your role to continue       │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ 👤  Choose your role...        ▼│   │
│   │                                 │   │
│   │  ├─ Owner                       │   │
│   │  ├─ Admin                       │   │
│   │  ├─ Finance                     │   │
│   │  ├─ Manager                     │   │
│   │  ├─ Sales                       │   │
│   │  └─ Store Keeper                │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌────────────┐  ┌─────────────────┐   │
│   │    Back    │  │      Login      │   │
│   └────────────┘  └─────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📊 Admin Dashboard Layout

### Overall Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: Logo + Title + Date + Notifications                       │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  KPI ROW: [Sales Today] [Production] [Approvals] [Staff Online]    │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  BRANCH COMPARISON:                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────┐        │
│  │  Berhane Branch          │  │  Girmay Branch           │        │
│  │  Sales | Production      │  │  Sales | Production      │        │
│  │  Inventory | Status      │  │  Inventory | Status      │        │
│  └──────────────────────────┘  └──────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────┬────────────────────────┐
│  RECENT ACTIVITY FEED                    │  QUICK NAVIGATION      │
│  ════════════════════════════════════    │  ═══════════════════   │
│  🔵 Production activity (2 min ago)      │  ┌──────────────────┐  │
│  🟢 Finance activity (15 min ago)        │  │  Manage Users    │  │
│  🟣 Sales activity (28 min ago)          │  └──────────────────┘  │
│  🟡 Inventory alert (45 min ago)         │  ┌──────────────────┐  │
│  🟢 Approval completed (1 hour ago)      │  │ Review Approvals │  │
│  🔵 Production target met (2 hours ago)  │  └──────────────────┘  │
│  🔴 New user registered (3 hours ago)    │  ┌──────────────────┐  │
│  🟢 Cash reconciled (4 hours ago)        │  │ Financial Reports│  │
│                                          │  └──────────────────┘  │
│  [Scrollable feed continues...]          │  ┌──────────────────┐  │
│                                          │  │ Production Logs  │  │
│                                          │  └──────────────────┘  │
│                                          │  ┌──────────────────┐  │
│                                          │  │ Monitor Sales    │  │
│                                          │  └──────────────────┘  │
│                                          │  ┌──────────────────┐  │
│                                          │  │System Settings   │  │
│                                          │  └──────────────────┘  │
└──────────────────────────────────────────┴────────────────────────┘
```

---

## 🎯 KPI Cards (Top Row)

### Individual KPI Card Design
```
┌────────────────────────────────────┐
│  Title: Total Sales Today          │
│                                    │
│  Br 2,350,000                      │
│                    ┌──────────┐    │
│                    │          │    │
│                    │  💰 Icon │    │
│                    │          │    │
│                    └──────────┘    │
└────────────────────────────────────┘
```

**4 KPI Cards:**
1. **Total Sales Today** (Green) - 💰 DollarSign icon
2. **Total Production Today** (Blue) - 📦 Package icon
3. **Pending Approvals** (Amber) - ⏰ Clock icon
4. **Active Staff Online** (Purple) - 👥 Users icon

---

## 🏢 Branch Performance Cards

### Side-by-Side Comparison
```
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│ 🏢 Berhane Branch     [Active]  │  │ 🏢 Girmay Branch      [Active]  │
│                                 │  │                                 │
│ ┌──────────┐  ┌──────────────┐ │  │ ┌──────────┐  ┌──────────────┐ │
│ │ Today's  │  │  Today's     │ │  │ │ Today's  │  │  Today's     │ │
│ │  Sales   │  │ Production   │ │  │ │  Sales   │  │ Production   │ │
│ │ Br 1.24M │  │   4,200kg    │ │  │ │ Br 1.11M │  │   4,300kg    │ │
│ └──────────┘  └──────────────┘ │  │ └──────────┘  └──────────────┘ │
│                                 │  │                                 │
│ ┌──────────┐  ┌──────────────┐ │  │ ┌──────────┐  ┌──────────────┐ │
│ │ Current  │  │  Operational │ │  │ │ Current  │  │  Operational │ │
│ │Inventory │  │    Status    │ │  │ │Inventory │  │    Status    │ │
│ │ 8,200kg  │  │    Active    │ │  │ │ 7,800kg  │  │    Active    │ │
│ └──────────┘  └──────────────┘ │  │ └──────────┘  └──────────────┘ │
└─────────────────────────────────┘  └─────────────────────────────────┘
```

**Color Coding:**
- **Today's Sales:** Blue background
- **Today's Production:** Green background
- **Current Inventory:** Purple background
- **Operational Status:** Amber background

---

## 📰 Recent Activity Feed

### Activity Item Structure
```
┌─────────────────────────────────────────────────────────────┐
│ 🔵  Manager (Berhane) started new milling order...          │
│     🏢 Berhane  •  ⏰ 2 minutes ago                          │
├─────────────────────────────────────────────────────────────┤
│ 🟢  Finance reconciled yesterday's sales reports            │
│     🏢 Both  •  ⏰ 15 minutes ago                            │
├─────────────────────────────────────────────────────────────┤
│ 🟣  New large 'Loan' sale created by Sales (Girmay)         │
│     🏢 Girmay  •  ⏰ 28 minutes ago                          │
├─────────────────────────────────────────────────────────────┤
│ 🟡  Store Keeper (Berhane) reported low stock...            │
│     🏢 Berhane  •  ⏰ 45 minutes ago                         │
└─────────────────────────────────────────────────────────────┘
```

**Activity Types with Icons:**
- 🔵 **Production** (Blue) - Package icon
- 🟢 **Finance** (Green) - DollarSign icon
- 🟣 **Sales** (Purple) - ShoppingCart icon
- 🟡 **Inventory** (Amber) - Boxes icon
- 🟢 **Approval** (Teal) - CheckCircle icon
- 🔴 **User** (Pink) - UserCheck icon

**Features:**
- Scrollable list
- Hover effect on each item
- Color-coded icon badges
- Branch information
- Relative timestamps
- Real-time updates

---

## 🚀 Quick Navigation Cards

### Navigation Button Grid
```
┌─────────────────────────────┐
│     👥                      │
│  Manage Users               │
│  (Slate-900 background)     │
└─────────────────────────────┘

┌─────────────────────────────┐
│     ✓                       │
│  Review Approvals           │
│  (Green-600 background)     │
└─────────────────────────────┘

┌─────────────────────────────┐
│     📄                      │
│  View Financial Reports     │
│  (Blue-600 background)      │
└─────────────────────────────┘

┌─────────────────────────────┐
│     📊                      │
│  See Full Production Logs   │
│  (Purple-600 background)    │
└─────────────────────────────┘

┌─────────────────────────────┐
│     🛒                      │
│  Monitor All Sales          │
│  (Orange-600 background)    │
└─────────────────────────────┘

┌─────────────────────────────┐
│     ⚙️                      │
│  System Settings            │
│  (Slate-700 background)     │
└─────────────────────────────┘
```

**Features:**
- Large, touch-friendly buttons
- Icon + Text label
- Color-coded by function
- Hover shadow effects
- Direct navigation to modules

---

## 🎨 Color Palette Reference

### Primary Colors
- **Slate-900:** `#0f172a` - Primary buttons, headers
- **Slate-800:** `#1e293b` - Hover states
- **Slate-700:** `#334155` - Secondary elements
- **Slate-600:** `#475569` - Body text
- **Slate-200:** `#e2e8f0` - Borders
- **Slate-50:** `#f8fafc` - Light backgrounds

### Accent Colors
- **Green-600:** `#16a34a` - Finance, success
- **Blue-600:** `#2563eb` - Production, info
- **Purple-600:** `#9333ea` - Inventory, secondary
- **Amber-600:** `#d97706` - Warnings, pending
- **Red-600:** `#dc2626` - Alerts, critical
- **Orange-600:** `#ea580c` - Sales, monitoring
- **Teal-600:** `#0d9488` - Approvals

### Background Tints
- **Green-50:** `#f0fdf4`
- **Blue-50:** `#eff6ff`
- **Purple-50:** `#faf5ff`
- **Amber-50:** `#fffbeb`

---

## 📐 Spacing & Sizing

### Card Sizes
- **KPI Cards:** `p-6` (24px padding)
- **Branch Cards:** `p-5` (20px padding)
- **Activity Items:** `p-3` (12px padding)

### Grid Gaps
- **KPI Row:** `gap-5` (20px)
- **Branch Grid:** `gap-5` (20px)
- **Main Content:** `gap-6` (24px)
- **Quick Nav:** `gap-3` (12px)

### Border Radius
- **Cards:** `rounded-xl` (12px)
- **Icons:** `rounded-2xl` (16px)
- **Small elements:** `rounded-lg` (8px)

### Icon Sizes
- **Header icons:** `w-8 h-8` (32px)
- **KPI icons:** `w-8 h-8` (32px)
- **Activity icons:** `w-5 h-5` (20px)
- **Quick nav icons:** `w-6 h-6` (24px)

---

## ✨ Interactive States

### Hover Effects
```
Card: shadow-md → shadow-lg
Button: opacity-100 → opacity-90
Border: border-slate-200 → border-slate-300
Background: bg-white → bg-slate-50
```

### Transitions
- **Duration:** `duration-200` (200ms) for most elements
- **Duration:** `duration-300` (300ms) for complex cards
- **Easing:** Default ease-in-out

### Active States
- **Selected role:** Slate-900 background, white text
- **Hover:** Increased shadow, subtle color shift
- **Disabled:** `opacity-50`, cursor-not-allowed

---

## 📱 Responsive Breakpoints

### Grid Behavior
- **Mobile (< 768px):** Single column layout
- **Tablet (768px - 1024px):** 2-column layout
- **Desktop (> 1024px):** Full 3-column layout for main grid

### KPI Cards
- **Mobile:** Stack vertically (1 column)
- **Tablet:** 2 columns
- **Desktop:** 4 columns across

### Branch Cards
- **Mobile:** Stack vertically
- **Desktop:** Side-by-side (2 columns)

---

## 🔤 Typography Scale

### Font Weights
- **Bold:** `font-bold` (700) - Headers, values
- **Semibold:** `font-semibold` (600) - Card titles
- **Medium:** `font-medium` (500) - Labels, descriptions

### Font Sizes
- **3xl:** `text-3xl` (30px) - Large values
- **2xl:** `text-2xl` (24px) - Main headers
- **xl:** `text-xl` (20px) - Section headers
- **lg:** `text-lg` (18px) - Card titles
- **sm:** `text-sm` (14px) - Body text
- **xs:** `text-xs` (12px) - Labels, meta info

---

## 🎯 Component Hierarchy

### Unified Login
```
UnifiedLogin
├── Card (Main container)
│   ├── CardHeader
│   │   ├── Icon (Building2)
│   │   ├── CardTitle
│   │   └── CardDescription
│   └── CardContent
│       ├── Credentials Form (Step 1)
│       │   ├── Input (Username)
│       │   └── Input (Password)
│       └── Role Selection (Step 2)
│           ├── Select (Dropdown)
│           └── Button Group (Back + Login)
```

### Admin Dashboard
```
AdminDashboard
├── Header Section
│   ├── Logo + Title
│   ├── Date Button
│   └── Notification Bell
├── KPI Row
│   ├── KPICard (Sales)
│   ├── KPICard (Production)
│   ├── KPICard (Approvals)
│   └── KPICard (Staff)
├── Branch Comparison
│   ├── BranchCard (Berhane)
│   └── BranchCard (Girmay)
└── Main Grid
    ├── Activity Feed (2 columns)
    │   └── ActivityItem (x8)
    └── Quick Navigation (1 column)
        └── QuickNavCard (x6)
```

---

This visual guide provides a complete reference for understanding the layout, structure, and design patterns used in the new screens.
