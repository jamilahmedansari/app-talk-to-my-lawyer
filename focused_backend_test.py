#!/usr/bin/env python3
"""
Focused Backend API Testing for MongoDB Atlas Connection and Business Contractor Registration
Testing the specific issues mentioned in the review request
"""

import requests
import json
import time
import sys
import os
from datetime import datetime

# Configuration - Use local URL for testing since we're in the container
BASE_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"
HEADERS = {"Content-Type": "application/json"}

print(f"🔧 Testing Backend APIs at: {API_BASE}")
print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("🎯 FOCUS: MongoDB Atlas Connection & Business Contractor Registration")
print("🌐 NOTE: Testing locally to verify MongoDB Atlas connection and backend functionality")
print("=" * 80)

def log_test(test_name, status, message=""):
    """Log test results with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    print(f"[{timestamp}] {status_symbol} {test_name}: {message}")

def make_request(method, endpoint, data=None, headers=None, token=None):
    """Make HTTP request with error handling"""
    url = f"{API_BASE}{endpoint}"
    request_headers = HEADERS.copy()
    
    if headers:
        request_headers.update(headers)
    
    if token:
        request_headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=request_headers, timeout=30)
        elif method == "POST":
            response = requests.post(url, json=data, headers=request_headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return response
    except requests.exceptions.RequestException as e:
        log_test(f"Request Error", "FAIL", f"Network error: {str(e)}")
        return None

def test_mongodb_atlas_connection():
    """Test MongoDB Atlas connection via health endpoint"""
    log_test("MongoDB Atlas Connection Test", "INFO", "Testing database connection...")
    
    response = make_request("GET", "/health")
    if response and response.status_code == 200:
        data = response.json()
        if data.get("status") == "healthy" and data.get("database") == "connected":
            log_test("MongoDB Atlas Connection", "PASS", "Database connection is healthy")
            print(f"  📊 Database Status: {data.get('database')}")
            print(f"  🕐 Timestamp: {data.get('timestamp')}")
            return True
        else:
            log_test("MongoDB Atlas Connection", "FAIL", f"Database not healthy: {data}")
            return False
    else:
        status_code = response.status_code if response else "No response"
        log_test("MongoDB Atlas Connection", "FAIL", f"Health check failed: {status_code}")
        return False

def test_root_endpoint():
    """Test root API endpoint"""
    log_test("Root Endpoint Test", "INFO", "Testing API health check...")
    
    response = make_request("GET", "/")
    if response and response.status_code == 200:
        data = response.json()
        if "Talk To My Lawyer API is running!" in data.get("message", ""):
            log_test("Root Endpoint", "PASS", "API is running correctly")
            print(f"  📊 Message: {data.get('message')}")
            print(f"  🔢 Version: {data.get('version')}")
            return True
        else:
            log_test("Root Endpoint", "FAIL", f"Unexpected response: {data}")
            return False
    else:
        log_test("Root Endpoint", "FAIL", f"Status: {response.status_code if response else 'No response'}")
        return False

def test_business_contractor_registration():
    """Test Business Contractor registration - the main issue reported"""
    log_test("Business Contractor Registration Test", "INFO", "Testing contractor registration (main issue)...")
    
    # Generate unique test data
    timestamp = int(time.time())
    contractor_data = {
        "email": f"contractor_test_{timestamp}@example.com",
        "password": "securepass123",
        "name": "Test Business Contractor",
        "role": "contractor"
    }
    
    print(f"  👤 Registering contractor: {contractor_data['email']}")
    response = make_request("POST", "/auth/register", contractor_data)
    
    if response and response.status_code == 200:
        data = response.json()
        if data.get("token") and data.get("user") and data["user"].get("role") == "contractor":
            log_test("Business Contractor Registration", "PASS", "Contractor registration successful")
            print(f"  👤 User ID: {data['user'].get('id')}")
            print(f"  📧 Email: {data['user'].get('email')}")
            print(f"  🏷️  Role: {data['user'].get('role')}")
            print(f"  🔑 Token: {'Received' if data.get('token') else 'Missing'}")
            
            # Test contractor-specific functionality
            auth_headers = {'Authorization': f"Bearer {data['token']}"}
            stats_response = make_request("GET", "/remote-employee/stats", headers=auth_headers)
            
            if stats_response and stats_response.status_code == 200:
                stats_data = stats_response.json()
                print(f"  📊 Username: {stats_data.get('username')}")
                print(f"  🎯 Points: {stats_data.get('points')}")
                print(f"  💰 Discount: {stats_data.get('discount_percent')}%")
                log_test("Contractor Features", "PASS", "Contractor-specific features working")
                
                # Test referral code validation
                referral_code = stats_data.get('username')
                if referral_code:
                    validate_data = {"coupon_code": referral_code}
                    validate_response = make_request("POST", "/coupons/validate", validate_data)
                    
                    if validate_response and validate_response.status_code == 200:
                        validate_result = validate_response.json()
                        if validate_result.get("valid") and validate_result.get("discount_percent") == 20:
                            log_test("Referral Code Validation", "PASS", f"Referral code '{referral_code}' working")
                        else:
                            log_test("Referral Code Validation", "FAIL", f"Invalid referral response: {validate_result}")
                    else:
                        log_test("Referral Code Validation", "FAIL", "Referral code validation failed")
                
            else:
                log_test("Contractor Features", "FAIL", "Contractor stats endpoint failed")
            
            return True, data
        else:
            log_test("Business Contractor Registration", "FAIL", f"Missing required data: {data}")
            return False, None
    else:
        status_code = response.status_code if response else "No response"
        error_msg = ""
        if response:
            try:
                error_data = response.json()
                error_msg = error_data.get("error", "Unknown error")
            except:
                error_msg = response.text[:200]
        log_test("Business Contractor Registration", "FAIL", f"Status {status_code}: {error_msg}")
        return False, None

def test_authentication_flow(contractor_data):
    """Test authentication flow after registration"""
    if not contractor_data:
        log_test("Authentication Flow", "FAIL", "No contractor data available")
        return False
    
    log_test("Authentication Flow Test", "INFO", "Testing login after registration...")
    
    login_data = {
        "email": contractor_data["user"]["email"],
        "password": "securepass123"
    }
    
    response = make_request("POST", "/auth/login", login_data)
    
    if response and response.status_code == 200:
        data = response.json()
        if data.get("token") and data.get("user"):
            log_test("Contractor Login", "PASS", "Login successful")
            
            # Test token validation
            auth_headers = {'Authorization': f"Bearer {data['token']}"}
            me_response = make_request("GET", "/auth/me", headers=auth_headers)
            
            if me_response and me_response.status_code == 200:
                me_data = me_response.json()
                if me_data.get("user") and me_data["user"].get("role") == "contractor":
                    log_test("Token Validation", "PASS", "JWT token validation working")
                    return True
                else:
                    log_test("Token Validation", "FAIL", f"Invalid user data: {me_data}")
            else:
                log_test("Token Validation", "FAIL", "Token validation failed")
        else:
            log_test("Contractor Login", "FAIL", f"Missing token or user: {data}")
    else:
        status_code = response.status_code if response else "No response"
        error_msg = ""
        if response:
            try:
                error_data = response.json()
                error_msg = error_data.get("error", "Unknown error")
            except:
                error_msg = response.text[:200]
        log_test("Contractor Login", "FAIL", f"Status {status_code}: {error_msg}")
    
    return False

def run_focused_test():
    """Run focused tests for MongoDB Atlas and Business Contractor registration"""
    print("\n🎯 FOCUSED TESTING: MongoDB Atlas Connection & Business Contractor Registration")
    print("=" * 80)
    
    test_results = []
    contractor_data = None
    
    # Test 1: MongoDB Atlas Connection
    print("\n1️⃣ TESTING: MongoDB Atlas Connection")
    print("-" * 50)
    test_results.append(("MongoDB Atlas Connection", test_mongodb_atlas_connection()))
    
    # Test 2: Basic API Functionality
    print("\n2️⃣ TESTING: Basic API Functionality")
    print("-" * 50)
    test_results.append(("Root Endpoint", test_root_endpoint()))
    
    # Test 3: Business Contractor Registration (Main Issue)
    print("\n3️⃣ TESTING: Business Contractor Registration (Main Issue)")
    print("-" * 50)
    success, contractor_data = test_business_contractor_registration()
    test_results.append(("Business Contractor Registration", success))
    
    # Test 4: Authentication Flow
    print("\n4️⃣ TESTING: Authentication Flow")
    print("-" * 50)
    test_results.append(("Authentication Flow", test_authentication_flow(contractor_data)))
    
    # Summary
    print("\n" + "=" * 80)
    print("📋 TEST SUMMARY")
    print("=" * 80)
    
    passed_tests = 0
    total_tests = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed_tests += 1
    
    print(f"\nOVERALL RESULT: {passed_tests}/{total_tests} tests passed ({(passed_tests/total_tests)*100:.1f}%)")
    
    print("\n🎯 FOCUS: The main issue reported was 'Network Error' during Business Contractor signup on Netlify.")
    print("🔍 RESULT: If all tests above passed, the MongoDB Atlas connection and contractor registration are working correctly.")
    
    if passed_tests == total_tests:
        print("🎉 ALL CRITICAL TESTS PASSED - MongoDB Atlas and Contractor Registration are working!")
    elif passed_tests >= 3:
        print("⚠️  Most critical tests passed, minor issues may exist.")
    else:
        print("❌ Critical issues found that need immediate attention.")
    
    print("\n💡 NOTE: If tests are passing here but failing on Netlify, the issue might be:")
    print("   - Netlify environment variables not properly configured")
    print("   - CORS issues specific to Netlify deployment")
    print("   - Frontend-backend communication issues")
    print("   - Network connectivity issues from Netlify to MongoDB Atlas")
    
    print("=" * 80)
    
    return passed_tests, total_tests

if __name__ == "__main__":
    try:
        passed, total = run_focused_test()
        sys.exit(0 if passed == total else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nUnexpected error during testing: {str(e)}")
        sys.exit(1)
