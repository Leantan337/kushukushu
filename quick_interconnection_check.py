#!/usr/bin/env python3
"""
Quick Interconnection Check
Fast validation of role interconnections without creating test data
"""

import requests
import json
from datetime import datetime

BACKEND_URL = "http://localhost:8000/api"

# Colors
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'

def print_header(text):
    print(f"\n{BOLD}{BLUE}{'='*60}{RESET}")
    print(f"{BOLD}{BLUE}{text}{RESET}")
    print(f"{BOLD}{BLUE}{'='*60}{RESET}")

def print_section(text):
    print(f"\n{BOLD}{text}{RESET}")

def check_status(condition, message):
    if condition:
        print(f"{GREEN}[PASS]{RESET} {message}")
        return True
    else:
        print(f"{RED}[FAIL]{RESET} {message}")
        return False

def main():
    print_header("QUICK ROLE INTERCONNECTION CHECK")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Backend: {BACKEND_URL}")
    
    total_checks = 0
    passed_checks = 0
    
    # Check 1: Backend connection
    print_section("1. Backend Connection")
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=5)
        if check_status(response.status_code == 200, "Backend is running"):
            passed_checks += 1
        total_checks += 1
    except:
        check_status(False, "Backend is running")
        total_checks += 1
        print(f"\n{RED}Cannot proceed without backend. Please start: cd backend && python server.py{RESET}")
        return
    
    # Check 2: Stock Requests (Sales workflow)
    print_section("2. Stock Requests (Sales -> Admin -> Manager -> Storekeeper -> Guard)")
    try:
        response = requests.get(f"{BACKEND_URL}/stock-requests", timeout=5)
        if response.status_code == 200:
            requests_data = response.json()
            check_status(True, f"Stock requests API working ({len(requests_data)} requests)")
            total_checks += 1
            passed_checks += 1
            
            # Check for different statuses
            statuses = {}
            for req in requests_data:
                status = req.get('status', 'unknown')
                statuses[status] = statuses.get(status, 0) + 1
            
            if statuses:
                print(f"  Found requests in stages:")
                for status, count in statuses.items():
                    print(f"    - {status}: {count}")
                
                # Check if workflow is being used
                workflow_stages = [
                    'pending_admin_approval',
                    'admin_approved',
                    'pending_manager_approval',
                    'manager_approved',
                    'pending_fulfillment',
                    'ready_for_pickup',
                    'at_gate',
                    'in_transit',
                    'confirmed'
                ]
                
                active_stages = [s for s in workflow_stages if s in statuses]
                if len(active_stages) > 1:
                    check_status(True, f"Multi-role workflow active ({len(active_stages)} different stages)")
                    passed_checks += 1
                else:
                    check_status(False, "No multi-role workflow activity detected")
                total_checks += 1
            else:
                print(f"  {YELLOW}[INFO] No stock requests found - create one to test workflow{RESET}")
        else:
            check_status(False, "Stock requests API failed")
            total_checks += 1
    except Exception as e:
        check_status(False, f"Stock requests API error: {e}")
        total_checks += 1
    
    # Check 3: Purchase Requisitions (Manager -> Admin -> Owner -> Finance)
    print_section("3. Purchase Requisitions (Manager -> Admin -> Owner -> Finance)")
    try:
        response = requests.get(f"{BACKEND_URL}/purchase-requisitions", timeout=5)
        if response.status_code == 200:
            prs = response.json()
            check_status(True, f"Purchase requisitions API working ({len(prs)} requisitions)")
            total_checks += 1
            passed_checks += 1
            
            # Check for approval workflow
            pr_statuses = {}
            for pr in prs:
                status = pr.get('status', 'unknown')
                pr_statuses[status] = pr_statuses.get(status, 0) + 1
            
            if pr_statuses:
                print(f"  Found requisitions in stages:")
                for status, count in pr_statuses.items():
                    print(f"    - {status}: {count}")
                
                approval_stages = ['manager_approved', 'admin_approved', 'owner_approved', 'purchased']
                active_pr_stages = [s for s in approval_stages if s in pr_statuses]
                
                if len(active_pr_stages) > 1:
                    check_status(True, f"Multi-level approval workflow active ({len(active_pr_stages)} stages)")
                    passed_checks += 1
                else:
                    check_status(False, "No multi-level approval activity detected")
                total_checks += 1
            else:
                print(f"  {YELLOW}[INFO] No purchase requisitions found{RESET}")
        else:
            check_status(False, "Purchase requisitions API failed")
            total_checks += 1
    except Exception as e:
        check_status(False, f"Purchase requisitions API error: {e}")
        total_checks += 1
    
    # Check 4: Finance Integration (Sales -> Finance)
    print_section("4. Finance Integration (Sales -> Finance)")
    try:
        response = requests.get(f"{BACKEND_URL}/finance/transactions", timeout=5)
        if response.status_code == 200:
            transactions = response.json()
            check_status(True, f"Finance transactions API working ({len(transactions)} transactions)")
            total_checks += 1
            passed_checks += 1
            
            if transactions:
                # Check transaction types
                income_count = sum(1 for t in transactions if t.get('type') == 'income')
                expense_count = sum(1 for t in transactions if t.get('type') == 'expense')
                
                print(f"  Transaction breakdown:")
                print(f"    - Income transactions: {income_count}")
                print(f"    - Expense transactions: {expense_count}")
                
                if income_count > 0:
                    check_status(True, "Sales -> Finance integration working (income transactions)")
                    passed_checks += 1
                else:
                    check_status(False, "No sales transactions found")
                total_checks += 1
            else:
                print(f"  {YELLOW}[INFO] No finance transactions found{RESET}")
        else:
            check_status(False, "Finance transactions API failed")
            total_checks += 1
    except Exception as e:
        check_status(False, f"Finance transactions API error: {e}")
        total_checks += 1
    
    # Check 5: Loans (Sales -> Finance)
    print_section("5. Loan Management (Sales -> Finance)")
    try:
        response = requests.get(f"{BACKEND_URL}/loans", timeout=5)
        if response.status_code == 200:
            loans = response.json()
            check_status(True, f"Loans API working ({len(loans)} loans)")
            total_checks += 1
            passed_checks += 1
            
            if loans:
                active_loans = sum(1 for l in loans if l.get('status') == 'active')
                paid_loans = sum(1 for l in loans if l.get('status') == 'paid')
                
                print(f"  Loan breakdown:")
                print(f"    - Active loans: {active_loans}")
                print(f"    - Paid loans: {paid_loans}")
                
                if active_loans > 0 or paid_loans > 0:
                    check_status(True, "Credit system working (Sales <-> Finance)")
                    passed_checks += 1
                else:
                    check_status(False, "No loan activity detected")
                total_checks += 1
        else:
            check_status(False, "Loans API failed")
            total_checks += 1
    except Exception as e:
        check_status(False, f"Loans API error: {e}")
        total_checks += 1
    
    # Check 6: Customers (Sales creates, Finance uses)
    print_section("6. Customer Management (Sales -> Finance)")
    try:
        response = requests.get(f"{BACKEND_URL}/customers", timeout=5)
        if response.status_code == 200:
            customers = response.json()
            check_status(True, f"Customers API working ({len(customers)} customers)")
            total_checks += 1
            passed_checks += 1
        else:
            check_status(False, "Customers API failed")
            total_checks += 1
    except Exception as e:
        check_status(False, f"Customers API error: {e}")
        total_checks += 1
    
    # Check 7: Inventory (All roles interact)
    print_section("7. Inventory System (All Roles)")
    try:
        response = requests.get(f"{BACKEND_URL}/inventory", timeout=5)
        if response.status_code == 200:
            inventory = response.json()
            check_status(True, f"Inventory API working ({len(inventory)} products)")
            total_checks += 1
            passed_checks += 1
            
            # Check for branch-specific products
            branches = set()
            for item in inventory:
                branch = item.get('branch_id')
                if branch:
                    branches.add(branch)
            
            if branches:
                check_status(True, f"Branch-specific inventory active ({len(branches)} branches: {', '.join(branches)})")
                passed_checks += 1
            else:
                check_status(False, "No branch-specific inventory found")
            total_checks += 1
            
            # Check for transaction history
            items_with_transactions = sum(1 for item in inventory if item.get('transactions'))
            if items_with_transactions > 0:
                check_status(True, f"Inventory transactions recorded ({items_with_transactions} items with history)")
                passed_checks += 1
            else:
                check_status(False, "No inventory transaction history")
            total_checks += 1
        else:
            check_status(False, "Inventory API failed")
            total_checks += 1
    except Exception as e:
        check_status(False, f"Inventory API error: {e}")
        total_checks += 1
    
    # Check 8: Sales Transactions
    print_section("8. Sales Transactions (POS -> Finance)")
    try:
        response = requests.get(f"{BACKEND_URL}/sales-transactions", timeout=5)
        if response.status_code == 200:
            sales = response.json()
            check_status(True, f"Sales transactions API working ({len(sales)} sales)")
            total_checks += 1
            passed_checks += 1
            
            if sales:
                # Check payment types
                payment_types = {}
                for sale in sales:
                    ptype = sale.get('payment_type', 'unknown')
                    payment_types[ptype] = payment_types.get(ptype, 0) + 1
                
                print(f"  Payment types used:")
                for ptype, count in payment_types.items():
                    print(f"    - {ptype}: {count}")
                
                if 'loan' in payment_types:
                    check_status(True, "Loan sales working (auto-creates customers & loans)")
                    passed_checks += 1
                else:
                    check_status(False, "No loan sales detected")
                total_checks += 1
        else:
            check_status(False, "Sales transactions API failed")
            total_checks += 1
    except Exception as e:
        check_status(False, f"Sales transactions API error: {e}")
        total_checks += 1
    
    # Summary
    print_header("INTERCONNECTION CHECK SUMMARY")
    
    percentage = (passed_checks / total_checks * 100) if total_checks > 0 else 0
    
    print(f"Total Checks: {total_checks}")
    print(f"{GREEN}Passed: {passed_checks}{RESET}")
    print(f"{RED}Failed: {total_checks - passed_checks}{RESET}")
    print(f"Success Rate: {percentage:.1f}%")
    
    print(f"\n{BOLD}Role Interconnection Status:{RESET}")
    if percentage >= 90:
        print(f"{GREEN}[EXCELLENT] All major role interconnections working{RESET}")
    elif percentage >= 70:
        print(f"{YELLOW}[GOOD] Most interconnections working, some issues detected{RESET}")
    elif percentage >= 50:
        print(f"{YELLOW}[FAIR] Some interconnections working, needs attention{RESET}")
    else:
        print(f"{RED}[POOR] Major interconnection issues detected{RESET}")
    
    print(f"\n{BOLD}Next Steps:{RESET}")
    if percentage < 100:
        print("1. Review failed checks above")
        print("2. Run full test: python test_role_interconnections.py")
        print("3. Follow manual test guide: ROLE_INTERCONNECTION_TEST_GUIDE.md")
    else:
        print("1. All checks passed! System is fully interconnected")
        print("2. Run full workflow test: python test_role_interconnections.py")
        print("3. Perform manual testing with real users")
    
    print()

if __name__ == "__main__":
    main()

