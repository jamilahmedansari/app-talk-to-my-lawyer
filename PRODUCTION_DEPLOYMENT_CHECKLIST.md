# 🚀 Production Deployment Checklist

## ✅ **PRE-DEPLOYMENT CHECKS**

### **1. Environment Variables**
- [ ] Copy `.env.example` to `.env` and fill in all values
- [ ] Copy `.env.production.example` to `.env.production` for production
- [ ] Verify all required environment variables are set:
  - [ ] `MONGO_URL` - MongoDB Atlas connection string
  - [ ] `DB_NAME` - Database name
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
  - [ ] `OPENAI_API_KEY` - OpenAI API key
  - [ ] `STRIPE_SECRET_KEY` - Stripe secret key (production)
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (production)
  - [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
  - [ ] `RESEND_API_KEY` - Resend email API key
  - [ ] `JWT_SECRET` - Secure JWT secret (32+ characters)
  - [ ] `NEXT_PUBLIC_BASE_URL` - Your production domain

### **2. Database Setup**
- [ ] MongoDB Atlas cluster is running and accessible
- [ ] Database user has proper permissions
- [ ] Network access is configured (IP whitelist)
- [ ] Run `npm run db:push` to sync Prisma schema
- [ ] Verify database connection in production

### **3. Dependencies & Build**
- [ ] Run `npm install` to install all dependencies
- [ ] Run `npm run build` successfully
- [ ] No TypeScript or linting errors
- [ ] Prisma client is generated (`npm run postinstall`)

### **4. Security Configuration**
- [ ] JWT secret is cryptographically secure
- [ ] All API keys are production keys (not test keys)
- [ ] CORS is properly configured for production domain
- [ ] Security headers are enabled
- [ ] Rate limiting is configured

## 🔧 **DEPLOYMENT STEPS**

### **1. Netlify Deployment**
- [ ] Connect repository to Netlify
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `.next`
- [ ] Configure environment variables in Netlify dashboard
- [ ] Set `NODE_ENV=production`

### **2. Environment Variables in Netlify**
```bash
# Required Variables
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=letterdash_db
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
STRIPE_SECRET_KEY=sk_live_your-stripe-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
RESEND_API_KEY=re_your-resend-key
JWT_SECRET=your-secure-jwt-secret
NEXT_PUBLIC_BASE_URL=https://your-domain.netlify.app
NODE_ENV=production
```

### **3. Domain Configuration**
- [ ] Configure custom domain in Netlify
- [ ] Update DNS records
- [ ] Enable HTTPS/SSL
- [ ] Update `NEXT_PUBLIC_BASE_URL` to match custom domain

## 🧪 **POST-DEPLOYMENT TESTING**

### **1. Health Checks**
- [ ] Visit `/api/health` endpoint
- [ ] Verify database connection
- [ ] Check all API endpoints respond correctly

### **2. Authentication Flow**
- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens are generated correctly
- [ ] Protected routes are secure

### **3. Core Functionality**
- [ ] Letter generation with OpenAI
- [ ] Stripe payment processing
- [ ] Email sending with Resend
- [ ] Database operations work

### **4. Performance & Monitoring**
- [ ] Page load times are acceptable
- [ ] API response times are good
- [ ] Error logging is working
- [ ] Monitor for any runtime errors

## 🚨 **PRODUCTION MONITORING**

### **1. Error Tracking**
- [ ] Set up error monitoring (Sentry recommended)
- [ ] Configure error alerts
- [ ] Monitor application logs

### **2. Performance Monitoring**
- [ ] Set up performance monitoring
- [ ] Monitor database performance
- [ ] Track API usage and limits

### **3. Security Monitoring**
- [ ] Monitor for suspicious activities
- [ ] Set up security alerts
- [ ] Regular security audits

## 📋 **MAINTENANCE TASKS**

### **Weekly**
- [ ] Check application health
- [ ] Review error logs
- [ ] Monitor database performance
- [ ] Verify backup systems

### **Monthly**
- [ ] Update dependencies
- [ ] Review security settings
- [ ] Performance optimization
- [ ] Database maintenance

### **Quarterly**
- [ ] Security audit
- [ ] Performance review
- [ ] Feature planning
- [ ] Infrastructure review

## 🔒 **SECURITY CHECKLIST**

- [ ] All API keys are production keys
- [ ] JWT secret is secure and unique
- [ ] CORS is restricted to production domain
- [ ] Rate limiting is enabled
- [ ] Security headers are configured
- [ ] Database access is restricted
- [ ] HTTPS is enforced
- [ ] No sensitive data in client-side code
- [ ] Input validation is implemented
- [ ] SQL injection protection is active

## 📞 **EMERGENCY CONTACTS**

- **Database Admin**: [Contact Info]
- **DevOps Team**: [Contact Info]
- **Security Team**: [Contact Info]
- **Stakeholders**: [Contact Info]

---

**Last Updated**: [Date]
**Deployed By**: [Name]
**Version**: [Version Number]