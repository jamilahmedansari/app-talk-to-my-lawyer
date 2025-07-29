#!/usr/bin/env python3
"""
Netlify Deployment Authentication Endpoints Test
Focus: Testing the specific authentication endpoints mentioned in the review request
"""

import requests
import json
import time
import sys
import os
from datetime import datetime

# Configuration
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://2a3de0b7-52ef-4f67-8d77-4484726ffcd5.preview.emergentagent.com')
LOCAL_URL = "http://localhost:3000"
HEADERS = {"Content-Type": "application/json"}

print(f"🔧 NETLIFY DEPLOYMENT AUTHENTICATION ENDPOINTS TEST")
print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"🎯 FOCUS: Testing specific endpoints mentioned in review request")
print("=" * 80)

def log_test(test_name, status, message=""):
    """Log test results with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    print(f"[{timestamp}] {status_symbol} {test_name}: {message}")

def test_endpoint_accessibility(url, endpoint_name):
    """Test if an endpoint is accessible"""
    try:
        response = requests.get(f"{url}/api/", timeout=10)
        if response.status_code == 200:
            log_test(f"{endpoint_name} - Root API", "PASS", f"API accessible (Status: {response.status_code})")
            return True
        elif response.status_code == 502:
            log_test(f"{endpoint_name} - Root API", "FAIL", f"502 Bad Gateway - Backend service not responding")
            return False
        else:
            log_test(f"{endpoint_name} - Root API", "FAIL", f"Status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        log_test(f"{endpoint_name} - Root API", "FAIL", f"Network error: {str(e)}")
        return False

def test_specific_auth_endpoints(base_url, url_name):
    """Test the specific authentication endpoints mentioned in review"""
    log_test(f"Testing {url_name} Authentication Endpoints", "INFO", "")
    
    endpoints_to_test = [
        ("/api/auth/register", "POST", "User Registration"),
        ("/api/auth/register-with-coupon", "POST", "Registration with Coupon"),
        ("/api/coupons/validate", "POST", "Coupon Validation"),
        ("/api/auth/login", "POST", "User Login"),
        ("/api/auth/me", "GET", "Current User")
    ]
    
    results = []
    
    for endpoint, method, name in endpoints_to_test:
        try:
            url = f"{base_url}{endpoint}"
            
            if method == "GET":
                # Test GET endpoint without auth (should return 401)
                response = requests.get(url, headers=HEADERS, timeout=10)
            else:
                # Test POST endpoint with minimal data (should return 400 for missing data, not 404)
                test_data = {"test": "data"}
                response = requests.post(url, json=test_data, headers=HEADERS, timeout=10)
            
            if response.status_code in [400, 401]:  # Expected errors for invalid/missing data
                log_test(f"{name} ({method})", "PASS", f"Endpoint found (Status: {response.status_code})")
                results.append(True)
            elif response.status_code == 404:
                log_test(f"{name} ({method})", "FAIL", f"Endpoint not found (Status: 404)")
                results.append(False)
            elif response.status_code == 502:
                log_test(f"{name} ({method})", "FAIL", f"Backend service not responding (Status: 502)")
                results.append(False)
            else:
                log_test(f"{name} ({method})", "PASS", f"Endpoint accessible (Status: {response.status_code})")
                results.append(True)
                
        except requests.exceptions.RequestException as e:
            log_test(f"{name} ({method})", "FAIL", f"Network error: {str(e)}")
            results.append(False)
    
    return results

def run_netlify_deployment_test():
    """Run comprehensive test for Netlify deployment issues"""
    print("TESTING AUTHENTICATION ENDPOINTS FOR NETLIFY DEPLOYMENT ISSUE")
    print("=" * 80)
    
    # Test 1: Local API (should work)
    print("\n🏠 TESTING LOCAL API (localhost:3000)")
    print("-" * 50)
    local_accessible = test_endpoint_accessibility(LOCAL_URL, "Local")
    local_results = []
    if local_accessible:
        local_results = test_specific_auth_endpoints(LOCAL_URL, "Local")
    
    # Test 2: Production API (reported issue)
    print(f"\n🌐 TESTING PRODUCTION API ({BASE_URL})")
    print("-" * 50)
    prod_accessible = test_endpoint_accessibility(BASE_URL, "Production")
    prod_results = []
    if prod_accessible:
        prod_results = test_specific_auth_endpoints(BASE_URL, "Production")
    else:
        # Even if root fails, test specific endpoints
        prod_results = test_specific_auth_endpoints(BASE_URL, "Production")
    
    # Summary
    print("\n" + "=" * 80)
    print("NETLIFY DEPLOYMENT TEST SUMMARY")
    print("=" * 80)
    
    print(f"\n🏠 LOCAL API RESULTS:")
    if local_accessible:
        local_passed = sum(local_results) if local_results else 0
        local_total = len(local_results) if local_results else 0
        print(f"   ✅ API Accessible: YES")
        print(f"   📊 Endpoints: {local_passed}/{local_total} working")
    else:
        print(f"   ❌ API Accessible: NO")
    
    print(f"\n🌐 PRODUCTION API RESULTS:")
    if prod_accessible:
        prod_passed = sum(prod_results) if prod_results else 0
        prod_total = len(prod_results) if prod_results else 0
        print(f"   ✅ API Accessible: YES")
        print(f"   📊 Endpoints: {prod_passed}/{prod_total} working")
    else:
        prod_passed = sum(prod_results) if prod_results else 0
        prod_total = len(prod_results) if prod_results else 0
        print(f"   ❌ API Accessible: NO (502 Bad Gateway)")
        print(f"   📊 Endpoints: {prod_passed}/{prod_total} working")
    
    # Diagnosis
    print(f"\n🔍 DIAGNOSIS:")
    if local_accessible and not prod_accessible:
        print("   ❌ DEPLOYMENT ISSUE CONFIRMED")
        print("   📝 Local API works, Production API fails with 502 Bad Gateway")
        print("   🔧 Issue: Backend service not properly deployed or configured")
        print("   💡 Solution: Check Netlify function deployment and configuration")
    elif local_accessible and prod_accessible:
        print("   ✅ Both APIs accessible - No deployment issue")
    else:
        print("   ❌ Both APIs have issues - Check service configuration")
    
    print("\n" + "=" * 80)
    
    return local_accessible, prod_accessible, local_results, prod_results

if __name__ == "__main__":
    try:
        local_ok, prod_ok, local_res, prod_res = run_netlify_deployment_test()
        
        # Exit code based on production API status
        if prod_ok and prod_res and sum(prod_res) == len(prod_res):
            sys.exit(0)  # All production endpoints working
        else:
            sys.exit(1)  # Production has issues
            
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nUnexpected error during testing: {str(e)}")
        sys.exit(1)
