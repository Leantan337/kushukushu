#!/usr/bin/env python3
"""
Comprehensive Test Runner for KushuKushu ERP
Waits for backend to be ready, then runs all test files and generates a report
"""

import requests
import subprocess
import time
import sys
from datetime import datetime

BACKEND_URL = "http://localhost:8000"
MAX_WAIT_TIME = 60  # seconds
CHECK_INTERVAL = 2  # seconds

# ANSI Colors
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
BOLD = '\033[1m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BLUE}{BOLD}{'='*80}{RESET}")
    print(f"{BLUE}{BOLD}{text:^80}{RESET}")
    print(f"{BLUE}{BOLD}{'='*80}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✅ {text}{RESET}")

def print_error(text):
    print(f"{RED}❌ {text}{RESET}")

def print_info(text):
    print(f"{YELLOW}ℹ️  {text}{RESET}")

def wait_for_backend():
    """Wait for backend to be ready"""
    print_header("WAITING FOR BACKEND SERVER")
    print_info(f"Checking if backend is running at {BACKEND_URL}")
    print_info(f"Max wait time: {MAX_WAIT_TIME} seconds\n")
    
    elapsed = 0
    while elapsed < MAX_WAIT_TIME:
        try:
            response = requests.get(f"{BACKEND_URL}/api/health", timeout=2)
            if response.status_code == 200:
                print_success(f"Backend is ready! (took {elapsed} seconds)")
                return True
        except:
            pass
        
        if elapsed % 10 == 0 and elapsed > 0:
            print_info(f"Still waiting... ({elapsed}s elapsed)")
        
        time.sleep(CHECK_INTERVAL)
        elapsed += CHECK_INTERVAL
    
    print_error(f"Backend did not start within {MAX_WAIT_TIME} seconds")
    print_error("Please start the backend manually:")
    print(f"  cd backend")
    print(f"  python -m uvicorn server:app --reload --host 127.0.0.1 --port 8000")
    return False

def run_test_file(test_file, test_name):
    """Run a single test file and return results"""
    print_header(f"RUNNING: {test_name}")
    print_info(f"Executing: python {test_file}\n")
    
    try:
        result = subprocess.run(
            ["python", test_file],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        output = result.stdout + result.stderr
        success = result.returncode == 0
        
        # Print output
        print(output)
        
        # Determine pass/fail
        if "ALL TESTS PASSED" in output or result.returncode == 0:
            print_success(f"{test_name} - PASSED")
            return {"name": test_name, "file": test_file, "status": "PASS", "output": output}
        else:
            print_error(f"{test_name} - FAILED")
            return {"name": test_name, "file": test_file, "status": "FAIL", "output": output}
            
    except subprocess.TimeoutExpired:
        print_error(f"{test_name} - TIMEOUT (exceeded 120s)")
        return {"name": test_name, "file": test_file, "status": "TIMEOUT", "output": "Test exceeded 120 second timeout"}
    except Exception as e:
        print_error(f"{test_name} - ERROR: {str(e)}")
        return {"name": test_name, "file": test_file, "status": "ERROR", "output": str(e)}

def generate_report(test_results, start_time, end_time):
    """Generate markdown test report"""
    duration = (end_time - start_time).total_seconds()
    
    report = f"""# KushuKushu ERP - Automated Test Results

**Date:** {start_time.strftime('%Y-%m-%d %H:%M:%S')}  
**Duration:** {duration:.1f} seconds  
**Backend:** {BACKEND_URL}

---

## Summary

"""
    
    passed = sum(1 for r in test_results if r['status'] == 'PASS')
    failed = sum(1 for r in test_results if r['status'] == 'FAIL')
    errors = sum(1 for r in test_results if r['status'] in ['ERROR', 'TIMEOUT'])
    total = len(test_results)
    
    report += f"- **Total Tests:** {total}\n"
    report += f"- **Passed:** {passed} ✅\n"
    report += f"- **Failed:** {failed} ❌\n"
    report += f"- **Errors/Timeouts:** {errors} ⚠️\n\n"
    
    if passed == total:
        report += "## 🎉 ALL TESTS PASSED!\n\n"
    else:
        report += "## ⚠️ SOME TESTS FAILED\n\n"
    
    report += "---\n\n## Detailed Results\n\n"
    
    for result in test_results:
        status_icon = {
            'PASS': '✅',
            'FAIL': '❌',
            'ERROR': '⚠️',
            'TIMEOUT': '⏱️'
        }.get(result['status'], '❓')
        
        report += f"### {status_icon} {result['name']}\n\n"
        report += f"- **File:** `{result['file']}`\n"
        report += f"- **Status:** {result['status']}\n\n"
        
        if result['status'] != 'PASS':
            report += "**Output:**\n```\n"
            # Limit output to last 1000 chars to keep report readable
            output_snippet = result['output'][-1000:] if len(result['output']) > 1000 else result['output']
            report += output_snippet
            report += "\n```\n\n"
        
        report += "---\n\n"
    
    report += f"\n**Test completed at:** {end_time.strftime('%Y-%m-%d %H:%M:%S')}\n"
    
    return report

def main():
    print_header("KUSHUKUSHU ERP - COMPREHENSIVE TEST SUITE")
    print_info(f"Test execution started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Wait for backend
    if not wait_for_backend():
        sys.exit(1)
    
    # Define test suite
    test_suite = [
        ("test_approval_workflows.py", "Approval Workflows"),
        ("test_approval_and_milling.py", "Approval & Milling Integration"),
        ("test_role_interconnections.py", "Role Interconnections"),
        ("test_manager_branch_isolation.py", "Manager Branch Isolation"),
        ("test_manager_production_logging.py", "Production Logging"),
        ("test_shared_branch_inventory.py", "Shared Branch Inventory")
    ]
    
    start_time = datetime.now()
    results = []
    
    # Run each test
    for test_file, test_name in test_suite:
        result = run_test_file(test_file, test_name)
        results.append(result)
        time.sleep(1)  # Brief pause between tests
    
    end_time = datetime.now()
    
    # Generate and save report
    print_header("GENERATING TEST REPORT")
    report = generate_report(results, start_time, end_time)
    
    report_filename = f"docs/AUTOMATED_TEST_RESULTS_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    with open(report_filename, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print_success(f"Test report saved to: {report_filename}")
    
    # Print summary
    print_header("FINAL SUMMARY")
    passed = sum(1 for r in results if r['status'] == 'PASS')
    total = len(results)
    
    print(f"Tests Passed: {passed}/{total}")
    
    for result in results:
        status_icon = {
            'PASS': GREEN + '✅',
            'FAIL': RED + '❌',
            'ERROR': YELLOW + '⚠️',
            'TIMEOUT': YELLOW + '⏱️'
        }.get(result['status'], '❓')
        print(f"{status_icon} {result['name']}{RESET}")
    
    if passed == total:
        print(f"\n{GREEN}{BOLD}🎉 ALL TESTS PASSED! The ERP system is fully operational.{RESET}\n")
        sys.exit(0)
    else:
        print(f"\n{RED}{BOLD}⚠️  SOME TESTS FAILED. Review the report for details.{RESET}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()

