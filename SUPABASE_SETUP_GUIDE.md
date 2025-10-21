# Supabase Setup Guide - Step by Step

## 🎯 Overview
This guide will walk you through setting up your Supabase database for face recognition authentication.

## 📋 Prerequisites
- Supabase account (sign up at https://supabase.com)
- Your project is already created (URL: https://bnxwqomkrimztfohnyrb.supabase.co)

---

## Step 1: Access Your Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Select your project: **bnxwqomkrimztfohnyrb**

---

## Step 2: Enable Email Authentication

### 2.1 Navigate to Authentication Settings
1. In the left sidebar, click **Authentication**
2. Click **Providers**

### 2.2 Enable Email Provider
1. Find **Email** in the list of providers
2. Toggle it **ON** if not already enabled
3. Configure settings:
   - ✅ Enable Email provider
   - ✅ Confirm email: **Optional** (you can disable for testing)
   - ✅ Secure email change: **Recommended**
4. Click **Save**

### 2.3 Configure Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - Confirmation email
   - Password reset
   - Magic link
3. Click **Save** for each template

---

## Step 3: Create the Database Table

### 3.1 Open SQL Editor
1. In the left sidebar, click **SQL Editor**
2. Click **New query** button

### 3.2 Run the Setup Script
1. Open the file `supabase-setup.sql` in your project
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### 3.3 Verify Success
You should see:
```
Success. No rows returned
```

If you see errors, check:
- Table doesn't already exist
- You have proper permissions
- SQL syntax is correct

---

## Step 4: Verify Table Creation

### 4.1 Check Table Editor
1. In the left sidebar, click **Table Editor**
2. You should see a new table: **user_profiles**

### 4.2 Verify Table Structure
Click on **user_profiles** table and verify these columns:
- ✅ `id` (uuid, primary key)
- ✅ `user_id` (uuid, foreign key)
- ✅ `name` (text)
- ✅ `email` (text, unique)
- ✅ `face_descriptor` (float8[])
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)

### 4.3 Check Indexes
1. Click on the **user_profiles** table
2. Go to **Indexes** tab
3. Verify these indexes exist:
   - ✅ `idx_user_profiles_user_id`
   - ✅ `idx_user_profiles_email`

---

## Step 5: Verify Row Level Security (RLS)

### 5.1 Check RLS Status
1. In **Table Editor**, click **user_profiles**
2. Look for **RLS** badge (should show "Enabled")

### 5.2 View Policies
1. Click on **user_profiles** table
2. Go to **Policies** tab
3. Verify these policies exist:
   - ✅ "Users can view their own profile" (SELECT)
   - ✅ "Users can insert their own profile" (INSERT)
   - ✅ "Users can update their own profile" (UPDATE)
   - ✅ "Allow public read for face matching" (SELECT)

### 5.3 Understanding the Policies

**Policy 1: Users can view their own profile**
- Type: SELECT
- Condition: `auth.uid() = user_id`
- Purpose: Users can only see their own data

**Policy 2: Users can insert their own profile**
- Type: INSERT
- Condition: `auth.uid() = user_id`
- Purpose: Users can only create their own profile

**Policy 3: Users can update their own profile**
- Type: UPDATE
- Condition: `auth.uid() = user_id`
- Purpose: Users can only modify their own data

**Policy 4: Allow public read for face matching**
- Type: SELECT
- Condition: `true` (public)
- Purpose: Allows face comparison during login
- Note: Only face descriptors are exposed (mathematical data, not images)

---

## Step 6: Test Database Connection

### 6.1 Insert Test Data (Optional)
1. In **SQL Editor**, run this test query:
```sql
-- Check if table exists and is accessible
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

2. You should see all 7 columns listed

### 6.2 Test RLS Policies
1. Try to insert a test row (this should fail without auth):
```sql
-- This should fail due to RLS
INSERT INTO user_profiles (name, email, face_descriptor)
VALUES ('Test User', 'test@example.com', ARRAY[0.1, 0.2, 0.3]);
```

2. Expected result: **Error** (RLS is working!)

---

## Step 7: Configure API Keys (Already Done)

Your API keys are already configured in `src/supabaseClient.js`:

```javascript
const supabaseUrl = 'https://bnxwqomkrimztfohnyrb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 7.1 Verify Keys (Optional)
1. Go to **Settings** → **API**
2. Find your keys:
   - **Project URL**: Should match your configured URL
   - **anon/public key**: Should match your configured key
   - **service_role key**: Keep this secret (not used in frontend)

---

## Step 8: Test Authentication Flow

### 8.1 Test User Registration
1. Run your application: `npm run dev`
2. Click **"Register with Face"**
3. Fill in test details:
   - Name: Test User
   - Email: test@example.com
   - Password: TestPass123!
4. Complete face registration
5. Check Supabase:
   - Go to **Authentication** → **Users**
   - You should see the new user
   - Go to **Table Editor** → **user_profiles**
   - You should see the profile with face_descriptor

### 8.2 Test User Login
1. Click **"Login with Face"**
2. Position your face
3. Click **"Login"**
4. Should authenticate successfully

### 8.3 Verify Data in Supabase
1. Go to **Table Editor** → **user_profiles**
2. Click on your user row
3. Verify:
   - ✅ `name` is populated
   - ✅ `email` is populated
   - ✅ `face_descriptor` is an array of 128 numbers
   - ✅ `created_at` has timestamp
   - ✅ `updated_at` has timestamp

---

## Step 9: Monitor and Debug

### 9.1 View Logs
1. Go to **Logs** in the sidebar
2. Select **Database** logs
3. Monitor queries and errors

### 9.2 Check Auth Logs
1. Go to **Authentication** → **Logs**
2. View sign-up and sign-in events
3. Check for errors or issues

### 9.3 Query Logs
1. Go to **Logs** → **Postgres Logs**
2. View SQL queries
3. Check for slow queries or errors

---

## Step 10: Production Considerations

### 10.1 Email Confirmation
For production, enable email confirmation:
1. Go to **Authentication** → **Providers**
2. Enable **Confirm email**
3. Configure email templates
4. Set up custom SMTP (optional)

### 10.2 Rate Limiting
Configure rate limits:
1. Go to **Authentication** → **Rate Limits**
2. Set limits for:
   - Sign-ups per hour
   - Sign-ins per hour
   - Password resets per hour

### 10.3 Security
1. **Never expose service_role key** in frontend
2. Keep anon key in environment variables for production
3. Enable 2FA for your Supabase account
4. Regular backup your database
5. Monitor unusual activity

### 10.4 Performance
1. Monitor query performance in Logs
2. Add indexes if needed
3. Consider caching strategies
4. Optimize face descriptor storage

---

## 🎉 Setup Complete!

Your Supabase database is now ready for face recognition authentication!

### Quick Verification Checklist
- ✅ Email authentication enabled
- ✅ `user_profiles` table created
- ✅ All columns present
- ✅ Indexes created
- ✅ RLS enabled
- ✅ All policies active
- ✅ API keys configured
- ✅ Test user registered
- ✅ Test login successful

---

## 🔧 Troubleshooting

### Issue: Table creation failed
**Solution:** 
- Check if table already exists
- Drop existing table: `DROP TABLE IF EXISTS user_profiles CASCADE;`
- Run setup script again

### Issue: RLS blocking inserts
**Solution:**
- Verify user is authenticated
- Check policy conditions
- Test with service_role key (backend only)

### Issue: Face descriptor not storing
**Solution:**
- Verify column type is `FLOAT8[]`
- Check array length (should be 128)
- Ensure data is properly formatted

### Issue: Login not finding users
**Solution:**
- Verify "Allow public read" policy exists
- Check face_descriptor data exists
- Test face matching threshold

### Issue: Email not sending
**Solution:**
- Check email provider settings
- Verify email templates
- Configure custom SMTP
- Check spam folder

---

## 📚 Additional Resources

### Supabase Documentation
- Auth Guide: https://supabase.com/docs/guides/auth
- Database Guide: https://supabase.com/docs/guides/database
- RLS Guide: https://supabase.com/docs/guides/auth/row-level-security

### SQL Reference
- PostgreSQL Arrays: https://www.postgresql.org/docs/current/arrays.html
- RLS Policies: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

### Support
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs
3. Verify all steps completed
4. Review error messages carefully
5. Check documentation
6. Ask in Supabase Discord

**Happy coding! 🚀**
