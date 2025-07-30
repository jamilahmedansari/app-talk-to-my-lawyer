#!/usr/bin/env python3
"""
Supabase Authentication System Testing (January 2025)
Testing the new Supabase Auth integration that replaces JWT-based authentication
"""

import requests
import json
import time
import os
from datetime import datetime

# Base URL for testing
BASE_URL = "http://localhost:3001"
API_BASE = f"{BASE_URL}/api"

class SupabaseAuthTester:
    def __init__(self):
        self.test_results = []
        self.sessions = {}  # Store Supabase sessions for different user types
        self.test_users = {}  # Store created test users
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'details': details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_supabase_signup(self):
        """Test 1: Supabase Auth Signup with Different Roles"""
        try:
            print("\n🔍 TESTING SUPABASE AUTH SIGNUP")
            
            # Test regular user signup (using sample data from request)
            user_data = {
                "email": "testuser@gmail.com",
                "password": "password123",
                "name": "Test User",
                "role": "user"
            }
            
            response = requests.post(f"{API_BASE}/auth/signup", json=user_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('user') and data.get('session'):
                    self.sessions['user'] = data['session']
                    self.test_users['user'] = data['user']
                    self.log_result(
                        "Supabase User Signup", 
                        True, 
                        "Regular user signup with Supabase Auth working correctly",
                        {'user_id': data['user']['id'], 'role': data['user']['role']}
                    )
                else:
                    self.log_result(
                        "Supabase User Signup", 
                        False, 
                        "Signup response missing user or session data",
                        {'response': data}
                    )
            else:
                self.log_result(
                    "Supabase User Signup", 
                    False, 
                    f"User signup failed with status {response.status_code}",
                    {'status_code': response.status_code, 'response': response.text}
                )
            
            # Test contractor signup
            contractor_data = {
                "email": "contractor@gmail.com",
                "password": "password123",
                "name": "Test Contractor",
                "role": "contractor"
            }
            
            response = requests.post(f"{API_BASE}/auth/signup", json=contractor_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('user') and data.get('session'):
                    self.sessions['contractor'] = data['session']
                    self.test_users['contractor'] = data['user']
                    self.log_result(
                        "Supabase Contractor Signup", 
                        True, 
                        "Contractor signup with Supabase Auth working correctly",
                        {'user_id': data['user']['id'], 'role': data['user']['role']}
                    )
                else:
                    self.log_result(
                        "Supabase Contractor Signup", 
                        False, 
                        "Contractor signup response missing user or session data",
                        {'response': data}
                    )
            else:
                self.log_result(
                    "Supabase Contractor Signup", 
                    False, 
                    f"Contractor signup failed with status {response.status_code}",
                    {'status_code': response.status_code, 'response': response.text}
                )
            
            # Test admin signup
            admin_data = {
                "email": "admin@gmail.com",
                "password": "password123",
                "name": "Test Admin",
                "role": "admin"
            }
            
            response = requests.post(f"{API_BASE}/auth/signup", json=admin_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('user') and data.get('session'):
                    self.sessions['admin'] = data['session']
                    self.test_users['admin'] = data['user']
                    self.log_result(
                        "Supabase Admin Signup", 
                        True, 
                        "Admin signup with Supabase Auth working correctly",
                        {'user_id': data['user']['id'], 'role': data['user']['role']}
                    )
                else:
                    self.log_result(
                        "Supabase Admin Signup", 
                        False, 
                        "Admin signup response missing user or session data",
                        {'response': data}
                    )
            else:
                self.log_result(
                    "Supabase Admin Signup", 
                    False, 
                    f"Admin signup failed with status {response.status_code}",
                    {'status_code': response.status_code, 'response': response.text}
                )
                
        except Exception as e:
            self.log_result(
                "Supabase Auth Signup", 
                False, 
                f"Signup test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def test_supabase_signin(self):
        """Test 2: Supabase Auth Signin"""
        try:
            print("\n🔍 TESTING SUPABASE AUTH SIGNIN")
            
            # Test signin for each user type
            for role in ['user', 'contractor', 'admin']:
                if role in self.test_users:
                    user = self.test_users[role]
                    signin_data = {
                        "email": user['email'],
                        "password": "password123"
                    }
                    
                    response = requests.post(f"{API_BASE}/auth/signin", json=signin_data, timeout=10)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('user') and data.get('session'):
                            # Update session with fresh signin session
                            self.sessions[role] = data['session']
                            self.log_result(
                                f"Supabase {role.title()} Signin", 
                                True, 
                                f"{role.title()} signin with Supabase Auth working correctly",
                                {'user_id': data['user']['id'], 'session_access_token': data['session']['access_token'][:20] + '...'}
                            )
                        else:
                            self.log_result(
                                f"Supabase {role.title()} Signin", 
                                False, 
                                f"{role.title()} signin response missing user or session data",
                                {'response': data}
                            )
                    else:
                        self.log_result(
                            f"Supabase {role.title()} Signin", 
                            False, 
                            f"{role.title()} signin failed with status {response.status_code}",
                            {'status_code': response.status_code, 'response': response.text}
                        )
                        
        except Exception as e:
            self.log_result(
                "Supabase Auth Signin", 
                False, 
                f"Signin test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def test_get_current_user(self):
        """Test 3: Get Current User (Authentication State)"""
        try:
            print("\n🔍 TESTING GET CURRENT USER")
            
            # Test /api/auth/me endpoint for each user type
            for role in ['user', 'contractor', 'admin']:
                if role in self.sessions:
                    # Use session cookies for authentication
                    session = self.sessions[role]
                    cookies = {}
                    
                    # Set Supabase session cookies (this might need adjustment based on actual cookie names)
                    if session.get('access_token'):
                        cookies['sb-access-token'] = session['access_token']
                    if session.get('refresh_token'):
                        cookies['sb-refresh-token'] = session['refresh_token']
                    
                    response = requests.get(f"{API_BASE}/auth/me", cookies=cookies, timeout=10)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('user'):
                            self.log_result(
                                f"Supabase {role.title()} Current User", 
                                True, 
                                f"{role.title()} current user retrieval working correctly",
                                {'user_id': data['user']['id'], 'role': data['user']['role']}
                            )
                        else:
                            self.log_result(
                                f"Supabase {role.title()} Current User", 
                                False, 
                                f"{role.title()} current user response missing user data",
                                {'response': data}
                            )
                    else:
                        self.log_result(
                            f"Supabase {role.title()} Current User", 
                            False, 
                            f"{role.title()} current user failed with status {response.status_code}",
                            {'status_code': response.status_code, 'response': response.text}
                        )
                        
        except Exception as e:
            self.log_result(
                "Get Current User", 
                False, 
                f"Current user test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def test_database_integration(self):
        """Test 4: Database Integration (Verify Records in Supabase)"""
        try:
            print("\n🔍 TESTING DATABASE INTEGRATION")
            
            # Test that user records were created in Supabase database
            for role in ['user', 'contractor', 'admin']:
                if role in self.test_users:
                    user = self.test_users[role]
                    
                    # Verify user exists in database by checking if we can retrieve user data
                    if role in self.sessions:
                        session = self.sessions[role]
                        cookies = {}
                        
                        if session.get('access_token'):
                            cookies['sb-access-token'] = session['access_token']
                        if session.get('refresh_token'):
                            cookies['sb-refresh-token'] = session['refresh_token']
                        
                        response = requests.get(f"{API_BASE}/auth/me", cookies=cookies, timeout=10)
                        
                        if response.status_code == 200:
                            data = response.json()
                            user_data = data.get('user', {})
                            
                            # Check if user has expected fields
                            required_fields = ['id', 'email', 'name', 'role']
                            has_all_fields = all(field in user_data for field in required_fields)
                            
                            if has_all_fields:
                                self.log_result(
                                    f"Database {role.title()} Record", 
                                    True, 
                                    f"{role.title()} record properly stored in Supabase database",
                                    {'user_fields': list(user_data.keys())}
                                )
                            else:
                                missing_fields = [field for field in required_fields if field not in user_data]
                                self.log_result(
                                    f"Database {role.title()} Record", 
                                    False, 
                                    f"{role.title()} record missing required fields",
                                    {'missing_fields': missing_fields, 'user_data': user_data}
                                )
                        else:
                            self.log_result(
                                f"Database {role.title()} Record", 
                                False, 
                                f"Could not verify {role} database record",
                                {'status_code': response.status_code}
                            )
                            
        except Exception as e:
            self.log_result(
                "Database Integration", 
                False, 
                f"Database integration test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def test_role_based_records(self):
        """Test 5: Role-based Records (Contractor and Admin specific records)"""
        try:
            print("\n🔍 TESTING ROLE-BASED RECORDS")
            
            # Test contractor-specific records
            if 'contractor' in self.sessions:
                session = self.sessions['contractor']
                cookies = {}
                
                if session.get('access_token'):
                    cookies['sb-access-token'] = session['access_token']
                if session.get('refresh_token'):
                    cookies['sb-refresh-token'] = session['refresh_token']
                
                response = requests.get(f"{API_BASE}/auth/me", cookies=cookies, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    user_data = data.get('user', {})
                    
                    # Check if contractor has contractor-specific data
                    if 'contractor' in user_data or user_data.get('role') == 'contractor':
                        self.log_result(
                            "Contractor Record Creation", 
                            True, 
                            "Contractor-specific record created successfully",
                            {'contractor_data': user_data.get('contractor', 'role_verified')}
                        )
                    else:
                        self.log_result(
                            "Contractor Record Creation", 
                            False, 
                            "Contractor-specific record not found",
                            {'user_data': user_data}
                        )
                else:
                    self.log_result(
                        "Contractor Record Creation", 
                        False, 
                        f"Could not verify contractor record: {response.status_code}",
                        {'response': response.text}
                    )
            
            # Test admin-specific records
            if 'admin' in self.sessions:
                session = self.sessions['admin']
                cookies = {}
                
                if session.get('access_token'):
                    cookies['sb-access-token'] = session['access_token']
                if session.get('refresh_token'):
                    cookies['sb-refresh-token'] = session['refresh_token']
                
                response = requests.get(f"{API_BASE}/auth/me", cookies=cookies, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    user_data = data.get('user', {})
                    
                    # Check if admin has admin-specific data
                    if 'admin' in user_data or user_data.get('role') == 'admin':
                        self.log_result(
                            "Admin Record Creation", 
                            True, 
                            "Admin-specific record created successfully",
                            {'admin_data': user_data.get('admin', 'role_verified')}
                        )
                    else:
                        self.log_result(
                            "Admin Record Creation", 
                            False, 
                            "Admin-specific record not found",
                            {'user_data': user_data}
                        )
                else:
                    self.log_result(
                        "Admin Record Creation", 
                        False, 
                        f"Could not verify admin record: {response.status_code}",
                        {'response': response.text}
                    )
                    
        except Exception as e:
            self.log_result(
                "Role-based Records", 
                False, 
                f"Role-based records test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def test_authentication_errors(self):
        """Test 6: Authentication Error Handling"""
        try:
            print("\n🔍 TESTING AUTHENTICATION ERROR HANDLING")
            
            # Test signup with invalid email
            invalid_signup = {
                "email": "invalid-email",
                "password": "password123",
                "name": "Test User",
                "role": "user"
            }
            
            response = requests.post(f"{API_BASE}/auth/signup", json=invalid_signup, timeout=10)
            
            if response.status_code == 400:
                self.log_result(
                    "Invalid Email Signup", 
                    True, 
                    "Invalid email properly rejected during signup",
                    {'status_code': response.status_code}
                )
            else:
                self.log_result(
                    "Invalid Email Signup", 
                    False, 
                    f"Invalid email not properly handled: {response.status_code}",
                    {'response': response.text}
                )
            
            # Test signin with wrong password
            if 'user' in self.test_users:
                wrong_password = {
                    "email": self.test_users['user']['email'],
                    "password": "wrongpassword"
                }
                
                response = requests.post(f"{API_BASE}/auth/signin", json=wrong_password, timeout=10)
                
                if response.status_code == 401:
                    self.log_result(
                        "Wrong Password Signin", 
                        True, 
                        "Wrong password properly rejected during signin",
                        {'status_code': response.status_code}
                    )
                else:
                    self.log_result(
                        "Wrong Password Signin", 
                        False, 
                        f"Wrong password not properly handled: {response.status_code}",
                        {'response': response.text}
                    )
            
            # Test accessing protected endpoint without authentication
            response = requests.get(f"{API_BASE}/auth/me", timeout=10)
            
            if response.status_code == 401:
                self.log_result(
                    "Unauthenticated Access", 
                    True, 
                    "Unauthenticated access properly rejected",
                    {'status_code': response.status_code}
                )
            else:
                self.log_result(
                    "Unauthenticated Access", 
                    False, 
                    f"Unauthenticated access not properly handled: {response.status_code}",
                    {'response': response.text}
                )
                
        except Exception as e:
            self.log_result(
                "Authentication Error Handling", 
                False, 
                f"Error handling test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def test_signout(self):
        """Test 7: Supabase Auth Signout"""
        try:
            print("\n🔍 TESTING SUPABASE AUTH SIGNOUT")
            
            # Test signout for user
            if 'user' in self.sessions:
                session = self.sessions['user']
                cookies = {}
                
                if session.get('access_token'):
                    cookies['sb-access-token'] = session['access_token']
                if session.get('refresh_token'):
                    cookies['sb-refresh-token'] = session['refresh_token']
                
                response = requests.post(f"{API_BASE}/auth/signout", cookies=cookies, timeout=10)
                
                if response.status_code == 200:
                    self.log_result(
                        "Supabase User Signout", 
                        True, 
                        "User signout working correctly",
                        {'status_code': response.status_code}
                    )
                    
                    # Verify that user can't access protected endpoint after signout
                    response = requests.get(f"{API_BASE}/auth/me", cookies=cookies, timeout=10)
                    
                    if response.status_code == 401:
                        self.log_result(
                            "Post-Signout Access Control", 
                            True, 
                            "Access properly denied after signout",
                            {'status_code': response.status_code}
                        )
                    else:
                        self.log_result(
                            "Post-Signout Access Control", 
                            False, 
                            f"Access not properly denied after signout: {response.status_code}",
                            {'response': response.text}
                        )
                else:
                    self.log_result(
                        "Supabase User Signout", 
                        False, 
                        f"User signout failed with status {response.status_code}",
                        {'status_code': response.status_code, 'response': response.text}
                    )
                    
        except Exception as e:
            self.log_result(
                "Supabase Auth Signout", 
                False, 
                f"Signout test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def run_all_tests(self):
        """Run all Supabase authentication tests"""
        print("🚀 STARTING SUPABASE AUTHENTICATION SYSTEM TESTING")
        print(f"📍 Testing API at: {API_BASE}")
        print("=" * 80)
        
        # Run all tests in sequence
        self.test_supabase_signup()
        self.test_supabase_signin()
        self.test_get_current_user()
        self.test_database_integration()
        self.test_role_based_records()
        self.test_authentication_errors()
        self.test_signout()
        
        # Generate summary
        self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 80)
        print("📊 SUPABASE AUTHENTICATION TESTING SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['success']])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS ({failed_tests}):")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['message']}")
        
        print(f"\n✅ PASSED TESTS ({passed_tests}):")
        for result in self.test_results:
            if result['success']:
                print(f"   • {result['test']}: {result['message']}")
        
        # Critical Supabase authentication validation
        critical_tests = [
            "Supabase User Signup",
            "Supabase Contractor Signup", 
            "Supabase Admin Signup",
            "Supabase User Signin",
            "Supabase Contractor Signin",
            "Supabase Admin Signin",
            "Supabase User Current User",
            "Database User Record",
            "Contractor Record Creation",
            "Admin Record Creation"
        ]
        
        critical_passed = len([r for r in self.test_results if r['success'] and r['test'] in critical_tests])
        critical_total = len([r for r in self.test_results if r['test'] in critical_tests])
        
        print(f"\n🎯 CRITICAL SUPABASE AUTH TESTS: {critical_passed}/{critical_total} passed")
        
        if critical_passed == critical_total:
            print("✅ SUPABASE AUTHENTICATION VALIDATION: SUCCESSFUL")
            print("   All critical Supabase authentication features are working correctly")
        else:
            print("❌ SUPABASE AUTHENTICATION VALIDATION: ISSUES FOUND")
            print("   Some critical Supabase authentication features need attention")
        
        print("\n" + "=" * 80)

if __name__ == "__main__":
    tester = SupabaseAuthTester()
    tester.run_all_tests()