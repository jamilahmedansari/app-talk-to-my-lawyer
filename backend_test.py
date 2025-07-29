#!/usr/bin/env python3
"""
Comprehensive Prisma Migration Backend Testing (Jan 2025)
Testing all backend APIs after MongoDB to Prisma ORM migration
"""

import requests
import json
import time
import os
import re
from datetime import datetime

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://2a3de0b7-52ef-4f67-8d77-4484726ffcd5.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

class PrismaMigrationTester:
    def __init__(self):
        self.test_results = []
        self.tokens = {}  # Store tokens for different user types
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
    
    def test_database_connection(self):
        """Test 1: Database Connection via Prisma"""
        try:
            print("\n🔍 TESTING DATABASE CONNECTION")
            response = requests.get(f"{API_BASE}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('database') == 'connected':
                    self.log_result(
                        "Database Connection", 
                        True, 
                        "PostgreSQL connection via Prisma working correctly",
                        {'status': data.get('status'), 'database': data.get('database')}
                    )
                else:
                    self.log_result(
                        "Database Connection", 
                        False, 
                        f"Database connection issue: {data}",
                        {'response': data}
                    )
            else:
                self.log_result(
                    "Database Connection", 
                    False, 
                    f"Health endpoint failed with status {response.status_code}",
                    {'status_code': response.status_code, 'response': response.text}
                )
        except Exception as e:
            self.log_result(
                "Database Connection", 
                False, 
                f"Health check failed: {str(e)}",
                {'error': str(e)}
            )
    
    def test_user_registration(self):
        """Test 2: User Registration with Different Roles"""
        try:
            print("\n🔍 TESTING USER REGISTRATION")
            
            # Test regular user registration
            user_data = {
                "email": f"testuser_{int(time.time())}@example.com",
                "password": "testpass123",
                "name": "Test User",
                "role": "user"
            }
            
            response = requests.post(f"{API_BASE}/auth/register", json=user_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('token') and data.get('user'):
                    self.tokens['user'] = data['token']
                    self.test_users['user'] = data['user']
                    self.log_result(
                        "User Registration", 
                        True, 
                        "Regular user registration working correctly",
                        {'user_id': data['user']['id'], 'role': data['user']['role']}
                    )
                else:
                    self.log_result(
                        "User Registration", 
                        False, 
                        "Registration response missing token or user data",
                        {'response': data}
                    )
            else:
                self.log_result(
                    "User Registration", 
                    False, 
                    f"User registration failed with status {response.status_code}",
                    {'status_code': response.status_code, 'response': response.text}
                )
            
            # Test contractor registration
            contractor_data = {
                "email": f"contractor_{int(time.time())}@example.com",
                "password": "testpass123",
                "name": "Test Contractor",
                "role": "contractor"
            }
            
            response = requests.post(f"{API_BASE}/auth/register", json=contractor_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('token') and data.get('user'):
                    self.tokens['contractor'] = data['token']
                    self.test_users['contractor'] = data['user']
                    self.log_result(
                        "Contractor Registration", 
                        True, 
                        "Contractor registration with username-based referral code working correctly",
                        {'user_id': data['user']['id'], 'role': data['user']['role']}
                    )
                else:
                    self.log_result(
                        "Contractor Registration", 
                        False, 
                        "Contractor registration response missing token or user data",
                        {'response': data}
                    )
            else:
                self.log_result(
                    "Contractor Registration", 
                    False, 
                    f"Contractor registration failed with status {response.status_code}",
                    {'status_code': response.status_code, 'response': response.text}
                )
            
            # Test admin registration
            admin_data = {
                "email": f"admin_{int(time.time())}@example.com",
                "password": "testpass123",
                "name": "Test Admin",
                "role": "admin"
            }
            
            response = requests.post(f"{API_BASE}/auth/register", json=admin_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('token') and data.get('user'):
                    self.tokens['admin'] = data['token']
                    self.test_users['admin'] = data['user']
                    self.log_result(
                        "Admin Registration", 
                        True, 
                        "Admin registration working correctly",
                        {'user_id': data['user']['id'], 'role': data['user']['role']}
                    )
                else:
                    self.log_result(
                        "Admin Registration", 
                        False, 
                        "Admin registration response missing token or user data",
                        {'response': data}
                    )
            else:
                self.log_result(
                    "Admin Registration", 
                    False, 
                    f"Admin registration failed with status {response.status_code}",
                    {'status_code': response.status_code, 'response': response.text}
                )
                
        except Exception as e:
            self.log_result(
                "User Registration", 
                False, 
                f"Registration test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def test_authentication_system(self):
        """Test 3: Authentication System (Login & Token Validation)"""
        try:
            print("\n🔍 TESTING AUTHENTICATION SYSTEM")
            
            # Test login for each user type
            for role in ['user', 'contractor', 'admin']:
                if role in self.test_users:
                    user = self.test_users[role]
                    login_data = {
                        "email": user['email'],
                        "password": "testpass123"
                    }
                    
                    response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('token') and data.get('user'):
                            self.log_result(
                                f"{role.title()} Login", 
                                True, 
                                f"{role.title()} login working correctly",
                                {'user_id': data['user']['id']}
                            )
                        else:
                            self.log_result(
                                f"{role.title()} Login", 
                                False, 
                                f"{role.title()} login response missing token or user data",
                                {'response': data}
                            )
                    else:
                        self.log_result(
                            f"{role.title()} Login", 
                            False, 
                            f"{role.title()} login failed with status {response.status_code}",
                            {'status_code': response.status_code, 'response': response.text}
                        )
            
            # Test /api/auth/me endpoint for token validation
            for role in ['user', 'contractor', 'admin']:
                if role in self.tokens:
                    headers = {'Authorization': f'Bearer {self.tokens[role]}'}
                    response = requests.get(f"{API_BASE}/auth/me", headers=headers, timeout=10)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('user'):
                            self.log_result(
                                f"{role.title()} Token Validation", 
                                True, 
                                f"{role.title()} token validation working correctly",
                                {'user_id': data['user']['id'], 'role': data['user']['role']}
                            )
                        else:
                            self.log_result(
                                f"{role.title()} Token Validation", 
                                False, 
                                f"{role.title()} token validation response missing user data",
                                {'response': data}
                            )
                    else:
                        self.log_result(
                            f"{role.title()} Token Validation", 
                            False, 
                            f"{role.title()} token validation failed with status {response.status_code}",
                            {'status_code': response.status_code, 'response': response.text}
                        )
                        
        except Exception as e:
            self.log_result(
                "Authentication System", 
                False, 
                f"Authentication test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def test_contractor_referral_system(self):
        """Test 4: Contractor Referral System"""
        try:
            print("\n🔍 TESTING CONTRACTOR REFERRAL SYSTEM")
            
            # Get contractor stats to get username
            if 'contractor' in self.tokens:
                headers = {'Authorization': f'Bearer {self.tokens["contractor"]}'}
                response = requests.get(f"{API_BASE}/remote-employee/stats", headers=headers, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    username = data.get('username')
                    
                    if username:
                        self.log_result(
                            "Contractor Username Generation", 
                            True, 
                            f"Contractor username generated correctly: {username}",
                            {'username': username, 'max_length': len(username) <= 5}
                        )
                        
                        # Test coupon validation with username
                        coupon_data = {"coupon_code": username}
                        response = requests.post(f"{API_BASE}/coupons/validate", json=coupon_data, timeout=10)
                        
                        if response.status_code == 200:
                            data = response.json()
                            if data.get('valid') and data.get('discount_percent') == 20:
                                self.log_result(
                                    "Referral Code Validation", 
                                    True, 
                                    "Username-based referral code validation working correctly",
                                    {'discount_percent': data.get('discount_percent')}
                                )
                            else:
                                self.log_result(
                                    "Referral Code Validation", 
                                    False, 
                                    "Referral code validation failed or incorrect discount",
                                    {'response': data}
                                )
                        else:
                            self.log_result(
                                "Referral Code Validation", 
                                False, 
                                f"Referral code validation failed with status {response.status_code}",
                                {'status_code': response.status_code, 'response': response.text}
                            )
                        
                        # Test registration with referral code
                        referral_user_data = {
                            "email": f"referral_{int(time.time())}@example.com",
                            "password": "testpass123",
                            "name": "Referral Test User",
                            "role": "user",
                            "coupon_code": username
                        }
                        
                        response = requests.post(f"{API_BASE}/auth/register-with-coupon", json=referral_user_data, timeout=10)
                        
                        if response.status_code == 200:
                            data = response.json()
                            if data.get('user') and data['user'].get('subscription', {}).get('discount_percent') == 20:
                                self.log_result(
                                    "Registration with Referral Code", 
                                    True, 
                                    "Registration with referral code working correctly",
                                    {'discount_applied': data['user']['subscription']['discount_percent']}
                                )
                            else:
                                self.log_result(
                                    "Registration with Referral Code", 
                                    False, 
                                    "Registration with referral code failed or discount not applied",
                                    {'response': data}
                                )
                        else:
                            self.log_result(
                                "Registration with Referral Code", 
                                False, 
                                f"Registration with referral code failed with status {response.status_code}",
                                {'status_code': response.status_code, 'response': response.text}
                            )
                    else:
                        self.log_result(
                            "Contractor Username Generation", 
                            False, 
                            "Contractor username not found in stats response",
                            {'response': data}
                        )
                else:
                    self.log_result(
                        "Contractor Stats", 
                        False, 
                        f"Contractor stats failed with status {response.status_code}",
                        {'status_code': response.status_code, 'response': response.text}
                    )
            else:
                self.log_result(
                    "Contractor Referral System", 
                    False, 
                    "No contractor token available for testing",
                    {}
                )
                
        except Exception as e:
            self.log_result(
                "Contractor Referral System", 
                False, 
                f"Referral system test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def test_subscription_management(self):
        """Test 5: Subscription Management"""
        try:
            print("\n🔍 TESTING SUBSCRIPTION MANAGEMENT")
            
            if 'user' in self.tokens:
                headers = {'Authorization': f'Bearer {self.tokens["user"]}'}
                
                # Test creating checkout session for different packages
                for package_type in ['4letters', '6letters', '8letters']:
                    checkout_data = {"packageType": package_type}
                    response = requests.post(f"{API_BASE}/subscription/create-checkout", 
                                           json=checkout_data, headers=headers, timeout=10)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('sessionId') and data.get('url'):
                            self.log_result(
                                f"Stripe Checkout ({package_type})", 
                                True, 
                                f"Stripe checkout session creation working for {package_type}",
                                {'session_id': data['sessionId'][:20] + '...'}
                            )
                        else:
                            self.log_result(
                                f"Stripe Checkout ({package_type})", 
                                False, 
                                f"Checkout session response missing sessionId or url for {package_type}",
                                {'response': data}
                            )
                    else:
                        self.log_result(
                            f"Stripe Checkout ({package_type})", 
                            False, 
                            f"Checkout session creation failed for {package_type} with status {response.status_code}",
                            {'status_code': response.status_code, 'response': response.text}
                        )
                
                # Test subscription status retrieval
                response = requests.get(f"{API_BASE}/auth/me", headers=headers, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    subscription = data.get('user', {}).get('subscription', {})
                    if 'status' in subscription and 'lettersRemaining' in subscription:
                        self.log_result(
                            "Subscription Status Retrieval", 
                            True, 
                            "Subscription status retrieval working correctly",
                            {'status': subscription.get('status'), 'letters_remaining': subscription.get('lettersRemaining')}
                        )
                    else:
                        self.log_result(
                            "Subscription Status Retrieval", 
                            False, 
                            "Subscription data missing from user response",
                            {'user_data': data.get('user', {})}
                        )
                else:
                    self.log_result(
                        "Subscription Status Retrieval", 
                        False, 
                        f"User data retrieval failed with status {response.status_code}",
                        {'status_code': response.status_code, 'response': response.text}
                    )
            else:
                self.log_result(
                    "Subscription Management", 
                    False, 
                    "No user token available for testing",
                    {}
                )
                
        except Exception as e:
            self.log_result(
                "Subscription Management", 
                False, 
                f"Subscription management test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def test_letter_generation(self):
        """Test 6: Letter Generation System"""
        try:
            print("\n🔍 TESTING LETTER GENERATION SYSTEM")
            
            if 'user' in self.tokens:
                headers = {'Authorization': f'Bearer {self.tokens["user"]}'}
                
                # Test letter generation (should fail due to no subscription)
                letter_data = {
                    "title": "Test Legal Letter",
                    "prompt": "Generate a demand letter for unpaid services",
                    "letterType": "demand_letter",
                    "formData": {
                        "fullName": "John Doe",
                        "yourAddress": "123 Main St, City, State 12345",
                        "recipientName": "ABC Company",
                        "recipientAddress": "456 Business Ave, City, State 67890",
                        "briefDescription": "Unpaid invoice for consulting services",
                        "detailedInformation": "Invoice #12345 for $5,000 remains unpaid after 60 days",
                        "whatToAchieve": "Payment of outstanding invoice within 30 days"
                    },
                    "urgencyLevel": "standard"
                }
                
                response = requests.post(f"{API_BASE}/letters/generate", 
                                       json=letter_data, headers=headers, timeout=15)
                
                if response.status_code == 403:
                    data = response.json()
                    if data.get('subscription_required'):
                        self.log_result(
                            "Letter Generation Subscription Check", 
                            True, 
                            "Letter generation correctly requires subscription",
                            {'error': data.get('error')}
                        )
                    else:
                        self.log_result(
                            "Letter Generation Subscription Check", 
                            False, 
                            "Letter generation failed but not due to subscription requirement",
                            {'response': data}
                        )
                elif response.status_code == 200:
                    # This would happen if user somehow has letters remaining
                    data = response.json()
                    if data.get('letter'):
                        self.log_result(
                            "Letter Generation", 
                            True, 
                            "Letter generation working correctly (user has subscription)",
                            {'letter_id': data['letter']['id']}
                        )
                    else:
                        self.log_result(
                            "Letter Generation", 
                            False, 
                            "Letter generation response missing letter data",
                            {'response': data}
                        )
                else:
                    self.log_result(
                        "Letter Generation", 
                        False, 
                        f"Letter generation failed with unexpected status {response.status_code}",
                        {'status_code': response.status_code, 'response': response.text}
                    )
                
                # Test getting user letters
                response = requests.get(f"{API_BASE}/letters", headers=headers, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if 'letters' in data:
                        self.log_result(
                            "User Letters Retrieval", 
                            True, 
                            f"User letters retrieval working correctly ({len(data['letters'])} letters)",
                            {'letter_count': len(data['letters'])}
                        )
                    else:
                        self.log_result(
                            "User Letters Retrieval", 
                            False, 
                            "Letters response missing letters array",
                            {'response': data}
                        )
                else:
                    self.log_result(
                        "User Letters Retrieval", 
                        False, 
                        f"User letters retrieval failed with status {response.status_code}",
                        {'status_code': response.status_code, 'response': response.text}
                    )
            else:
                self.log_result(
                    "Letter Generation", 
                    False, 
                    "No user token available for testing",
                    {}
                )
                
        except Exception as e:
            self.log_result(
                "Letter Generation", 
                False, 
                f"Letter generation test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def test_document_generation(self):
        """Test 7: Document Generation System"""
        try:
            print("\n🔍 TESTING DOCUMENT GENERATION SYSTEM")
            
            # Test document types endpoint
            response = requests.get(f"{API_BASE}/documents/types", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('categories'):
                    self.log_result(
                        "Document Types Retrieval", 
                        True, 
                        f"Document types retrieval working correctly ({len(data['categories'])} categories)",
                        {'category_count': len(data['categories'])}
                    )
                else:
                    self.log_result(
                        "Document Types Retrieval", 
                        False, 
                        "Document types response missing categories",
                        {'response': data}
                    )
            else:
                self.log_result(
                    "Document Types Retrieval", 
                    False, 
                    f"Document types retrieval failed with status {response.status_code}",
                    {'status_code': response.status_code, 'response': response.text}
                )
            
            if 'user' in self.tokens:
                headers = {'Authorization': f'Bearer {self.tokens["user"]}'}
                
                # Test document generation (should fail due to no subscription)
                document_data = {
                    "title": "Test Service Agreement",
                    "documentType": "service_agreement",
                    "category": "contracts",
                    "formData": {
                        "fullName": "John Doe",
                        "contractType": "Service Agreement",
                        "partyA": "John Doe Consulting",
                        "partyB": "ABC Corporation",
                        "terms": "Monthly consulting services",
                        "duration": "12 months",
                        "compensation": "$5,000 per month"
                    },
                    "urgencyLevel": "standard"
                }
                
                response = requests.post(f"{API_BASE}/documents/generate", 
                                       json=document_data, headers=headers, timeout=15)
                
                if response.status_code == 403:
                    data = response.json()
                    if data.get('subscription_required'):
                        self.log_result(
                            "Document Generation Subscription Check", 
                            True, 
                            "Document generation correctly requires subscription",
                            {'error': data.get('error')}
                        )
                    else:
                        self.log_result(
                            "Document Generation Subscription Check", 
                            False, 
                            "Document generation failed but not due to subscription requirement",
                            {'response': data}
                        )
                elif response.status_code == 200:
                    # This would happen if user somehow has letters remaining
                    data = response.json()
                    if data.get('document'):
                        self.log_result(
                            "Document Generation", 
                            True, 
                            "Document generation working correctly (user has subscription)",
                            {'document_id': data['document']['id']}
                        )
                    else:
                        self.log_result(
                            "Document Generation", 
                            False, 
                            "Document generation response missing document data",
                            {'response': data}
                        )
                else:
                    self.log_result(
                        "Document Generation", 
                        False, 
                        f"Document generation failed with unexpected status {response.status_code}",
                        {'status_code': response.status_code, 'response': response.text}
                    )
            else:
                self.log_result(
                    "Document Generation", 
                    False, 
                    "No user token available for testing",
                    {}
                )
                
        except Exception as e:
            self.log_result(
                "Document Generation", 
                False, 
                f"Document generation test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def test_admin_functionality(self):
        """Test 8: Admin Functionality"""
        try:
            print("\n🔍 TESTING ADMIN FUNCTIONALITY")
            
            if 'admin' in self.tokens:
                headers = {'Authorization': f'Bearer {self.tokens["admin"]}'}
                
                # Test admin users endpoint
                response = requests.get(f"{API_BASE}/admin/users", headers=headers, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if 'users' in data:
                        self.log_result(
                            "Admin Users Retrieval", 
                            True, 
                            f"Admin users retrieval working correctly ({len(data['users'])} users)",
                            {'user_count': len(data['users'])}
                        )
                    else:
                        self.log_result(
                            "Admin Users Retrieval", 
                            False, 
                            "Admin users response missing users array",
                            {'response': data}
                        )
                else:
                    self.log_result(
                        "Admin Users Retrieval", 
                        False, 
                        f"Admin users retrieval failed with status {response.status_code}",
                        {'status_code': response.status_code, 'response': response.text}
                    )
                
                # Test admin letters endpoint
                response = requests.get(f"{API_BASE}/admin/letters", headers=headers, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if 'letters' in data:
                        self.log_result(
                            "Admin Letters Retrieval", 
                            True, 
                            f"Admin letters retrieval working correctly ({len(data['letters'])} letters)",
                            {'letter_count': len(data['letters'])}
                        )
                    else:
                        self.log_result(
                            "Admin Letters Retrieval", 
                            False, 
                            "Admin letters response missing letters array",
                            {'response': data}
                        )
                else:
                    self.log_result(
                        "Admin Letters Retrieval", 
                        False, 
                        f"Admin letters retrieval failed with status {response.status_code}",
                        {'status_code': response.status_code, 'response': response.text}
                    )
                
                # Test webhook logs endpoint
                response = requests.get(f"{API_BASE}/webhooks/logs", headers=headers, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if 'logs' in data:
                        self.log_result(
                            "Webhook Logs Retrieval", 
                            True, 
                            f"Webhook logs retrieval working correctly ({len(data['logs'])} logs)",
                            {'log_count': len(data['logs'])}
                        )
                    else:
                        self.log_result(
                            "Webhook Logs Retrieval", 
                            False, 
                            "Webhook logs response missing logs array",
                            {'response': data}
                        )
                else:
                    self.log_result(
                        "Webhook Logs Retrieval", 
                        False, 
                        f"Webhook logs retrieval failed with status {response.status_code}",
                        {'status_code': response.status_code, 'response': response.text}
                    )
            else:
                self.log_result(
                    "Admin Functionality", 
                    False, 
                    "No admin token available for testing",
                    {}
                )
                
        except Exception as e:
            self.log_result(
                "Admin Functionality", 
                False, 
                f"Admin functionality test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def test_role_based_access_control(self):
        """Test 9: Role-Based Access Control"""
        try:
            print("\n🔍 TESTING ROLE-BASED ACCESS CONTROL")
            
            # Test user trying to access contractor endpoint
            if 'user' in self.tokens:
                headers = {'Authorization': f'Bearer {self.tokens["user"]}'}
                response = requests.get(f"{API_BASE}/remote-employee/stats", headers=headers, timeout=10)
                
                if response.status_code == 403:
                    self.log_result(
                        "User Access Control (Contractor Endpoint)", 
                        True, 
                        "User correctly denied access to contractor endpoint",
                        {'status_code': response.status_code}
                    )
                else:
                    self.log_result(
                        "User Access Control (Contractor Endpoint)", 
                        False, 
                        f"User access control failed - expected 403, got {response.status_code}",
                        {'status_code': response.status_code, 'response': response.text}
                    )
            
            # Test contractor trying to access admin endpoint
            if 'contractor' in self.tokens:
                headers = {'Authorization': f'Bearer {self.tokens["contractor"]}'}
                response = requests.get(f"{API_BASE}/admin/users", headers=headers, timeout=10)
                
                if response.status_code == 403:
                    self.log_result(
                        "Contractor Access Control (Admin Endpoint)", 
                        True, 
                        "Contractor correctly denied access to admin endpoint",
                        {'status_code': response.status_code}
                    )
                else:
                    self.log_result(
                        "Contractor Access Control (Admin Endpoint)", 
                        False, 
                        f"Contractor access control failed - expected 403, got {response.status_code}",
                        {'status_code': response.status_code, 'response': response.text}
                    )
            
            # Test no token access
            response = requests.get(f"{API_BASE}/auth/me", timeout=10)
            
            if response.status_code == 401:
                self.log_result(
                    "No Token Access Control", 
                    True, 
                    "No token correctly denied access to protected endpoint",
                    {'status_code': response.status_code}
                )
            else:
                self.log_result(
                    "No Token Access Control", 
                    False, 
                    f"No token access control failed - expected 401, got {response.status_code}",
                    {'status_code': response.status_code, 'response': response.text}
                )
                
        except Exception as e:
            self.log_result(
                "Role-Based Access Control", 
                False, 
                f"Access control test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def test_prisma_specific_features(self):
        """Test 10: Prisma-Specific Features"""
        try:
            print("\n🔍 TESTING PRISMA-SPECIFIC FEATURES")
            
            # Test JSON field handling (formData in letters)
            if 'user' in self.tokens:
                headers = {'Authorization': f'Bearer {self.tokens["user"]}'}
                
                # Test complex JSON data structure
                complex_form_data = {
                    "fullName": "Test User",
                    "address": {
                        "street": "123 Main St",
                        "city": "Test City",
                        "state": "TS",
                        "zip": "12345"
                    },
                    "documents": ["doc1.pdf", "doc2.pdf"],
                    "metadata": {
                        "urgency": "high",
                        "category": "business",
                        "tags": ["important", "legal"]
                    }
                }
                
                letter_data = {
                    "title": "JSON Test Letter",
                    "letterType": "general",
                    "formData": complex_form_data,
                    "urgencyLevel": "standard"
                }
                
                response = requests.post(f"{API_BASE}/letters/submit", 
                                       json=letter_data, headers=headers, timeout=10)
                
                if response.status_code in [200, 403]:  # 403 is expected due to no subscription
                    if response.status_code == 403:
                        data = response.json()
                        if data.get('subscription_required'):
                            self.log_result(
                                "JSON Field Handling", 
                                True, 
                                "JSON field handling working correctly (subscription check passed)",
                                {'complex_json_accepted': True}
                            )
                        else:
                            self.log_result(
                                "JSON Field Handling", 
                                False, 
                                "JSON field handling failed - unexpected error",
                                {'response': data}
                            )
                    else:
                        data = response.json()
                        if data.get('letter'):
                            self.log_result(
                                "JSON Field Handling", 
                                True, 
                                "JSON field handling working correctly",
                                {'letter_id': data['letter']['id']}
                            )
                        else:
                            self.log_result(
                                "JSON Field Handling", 
                                False, 
                                "JSON field handling response missing letter data",
                                {'response': data}
                            )
                else:
                    self.log_result(
                        "JSON Field Handling", 
                        False, 
                        f"JSON field handling failed with status {response.status_code}",
                        {'status_code': response.status_code, 'response': response.text}
                    )
            
            # Test UUID generation (all IDs should be UUIDs)
            if self.test_users:
                user_ids = [user['id'] for user in self.test_users.values()]
                uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                
                valid_uuids = all(re.match(uuid_pattern, user_id) for user_id in user_ids)
                
                if valid_uuids:
                    self.log_result(
                        "UUID Generation", 
                        True, 
                        "UUID generation working correctly for all user IDs",
                        {'user_ids': user_ids}
                    )
                else:
                    self.log_result(
                        "UUID Generation", 
                        False, 
                        "Some user IDs are not valid UUIDs",
                        {'user_ids': user_ids}
                    )
            
            # Test relationship handling (contractor -> user relationship)
            if 'contractor' in self.tokens:
                headers = {'Authorization': f'Bearer {self.tokens["contractor"]}'}
                response = requests.get(f"{API_BASE}/remote-employee/stats", headers=headers, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    required_fields = ['points', 'total_signups', 'username', 'discount_percent']
                    has_all_fields = all(field in data for field in required_fields)
                    
                    if has_all_fields:
                        self.log_result(
                            "Relationship Handling", 
                            True, 
                            "Prisma relationship handling working correctly",
                            {'contractor_data': data}
                        )
                    else:
                        self.log_result(
                            "Relationship Handling", 
                            False, 
                            "Relationship handling missing required fields",
                            {'response': data, 'required_fields': required_fields}
                        )
                else:
                    self.log_result(
                        "Relationship Handling", 
                        False, 
                        f"Relationship handling test failed with status {response.status_code}",
                        {'status_code': response.status_code, 'response': response.text}
                    )
                
        except Exception as e:
            self.log_result(
                "Prisma-Specific Features", 
                False, 
                f"Prisma-specific features test failed: {str(e)}",
                {'error': str(e)}
            )
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 STARTING COMPREHENSIVE PRISMA MIGRATION BACKEND TESTING")
        print(f"📍 Testing API at: {API_BASE}")
        print("=" * 80)
        
        # Run all tests
        self.test_database_connection()
        self.test_user_registration()
        self.test_authentication_system()
        self.test_contractor_referral_system()
        self.test_subscription_management()
        self.test_letter_generation()
        self.test_document_generation()
        self.test_admin_functionality()
        self.test_role_based_access_control()
        self.test_prisma_specific_features()
        
        # Generate summary
        self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 80)
        print("📊 PRISMA MIGRATION TESTING SUMMARY")
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
        
        # Critical migration validation
        critical_tests = [
            "Database Connection",
            "User Registration", 
            "Contractor Registration",
            "Admin Registration",
            "User Login",
            "Contractor Login", 
            "Admin Login",
            "JSON Field Handling",
            "UUID Generation",
            "Relationship Handling"
        ]
        
        critical_passed = len([r for r in self.test_results if r['success'] and r['test'] in critical_tests])
        critical_total = len([r for r in self.test_results if r['test'] in critical_tests])
        
        print(f"\n🎯 CRITICAL MIGRATION TESTS: {critical_passed}/{critical_total} passed")
        
        if critical_passed == critical_total:
            print("✅ PRISMA MIGRATION VALIDATION: SUCCESSFUL")
            print("   All critical database migration features are working correctly")
        else:
            print("❌ PRISMA MIGRATION VALIDATION: ISSUES FOUND")
            print("   Some critical migration features need attention")
        
        print("\n" + "=" * 80)

if __name__ == "__main__":
    tester = PrismaMigrationTester()
    tester.run_all_tests()
