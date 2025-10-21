# Quick Start Guide - Face Recognition Authentication

## 🚀 Get Started in 3 Steps

### Step 1: Setup Supabase Database
1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-setup.sql`
4. Click **Run** to execute the SQL
5. Verify the `user_profiles` table was created in the **Table Editor**

### Step 2: Verify Models Downloaded
The face recognition models have already been downloaded to `public/models/`.

Verify these files exist:
- ✅ `public/models/tiny_face_detector_model-weights_manifest.json`
- ✅ `public/models/tiny_face_detector_model-shard1`
- ✅ `public/models/face_landmark_68_model-weights_manifest.json`
- ✅ `public/models/face_landmark_68_model-shard1`
- ✅ `public/models/face_recognition_model-weights_manifest.json`
- ✅ `public/models/face_recognition_model-shard1`
- ✅ `public/models/face_recognition_model-shard2`
- ✅ `public/models/face_expression_model-weights_manifest.json`
- ✅ `public/models/face_expression_model-shard1`

### Step 3: Run the Application
```bash
npm run dev
```

## 📱 Using the Application

### First Time User - Registration
1. Click **"Register with Face"**
2. Fill in your details:
   - Full Name
   - Email
   - Password
3. Click **"Start Camera"**
4. Position your face clearly in the frame
5. Wait for **"Face Detected ✓"** indicator
6. Click **"Register"**
7. Success! You can now login with your face

### Returning User - Login
1. Click **"Login with Face"**
2. Click **"Start Camera"**
3. Position your face clearly in the frame
4. Wait for **"Face Detected ✓"** indicator
5. Click **"Login"**
6. You'll be authenticated and redirected to the main app

## 🔧 Configuration Already Done

✅ **Dependencies Installed:**
- `@supabase/supabase-js` - Supabase client
- `face-api.js` - Face recognition

✅ **Supabase Configured:**
- URL: `https://bnxwqomkrimztfohnyrb.supabase.co`
- Anon Key: Already set in `src/supabaseClient.js`

✅ **Components Created:**
- `AuthPage.jsx` - Main authentication page
- `FaceRegister.jsx` - Registration with face capture
- `FaceLogin.jsx` - Login with face recognition
- `AuthContext.jsx` - Authentication state management

✅ **App Integration:**
- Authentication required before accessing main app
- User profile displayed in header
- Logout functionality added

## 🎯 Key Features

- **Secure Face Recognition** - Uses 128-dimensional face descriptors
- **Real-time Detection** - Live face detection feedback
- **Supabase Integration** - Secure cloud storage
- **Row Level Security** - User data protection
- **Modern UI** - Beautiful, responsive design

## 🐛 Troubleshooting

### Camera Not Working
- Grant camera permissions in your browser
- Ensure no other app is using the camera
- Use HTTPS or localhost (required by browsers)

### Models Not Loading
- Check browser console for errors
- Verify all 9 model files are in `public/models/`
- Clear browser cache and reload

### Face Not Detected
- Ensure good lighting
- Face the camera directly
- Remove glasses or masks if possible
- Move closer to the camera

### Database Errors
- Verify SQL script ran successfully in Supabase
- Check that email authentication is enabled
- Ensure RLS policies are active

## 📊 What's Stored in Supabase

**user_profiles table:**
- `id` - Unique profile ID
- `user_id` - Reference to auth.users
- `name` - User's full name
- `email` - User's email
- `face_descriptor` - 128-dimensional float array (mathematical representation of face)
- `created_at` - Registration timestamp
- `updated_at` - Last update timestamp

## 🔐 Security Notes

- Face descriptors are mathematical representations, not images
- Row Level Security ensures users can only access their own data
- Passwords are hashed by Supabase Auth
- Face matching uses Euclidean distance with 0.6 threshold
- All data is encrypted in transit and at rest

## 📚 Additional Resources

- Full documentation: `FACE_AUTH_SETUP.md`
- Supabase setup SQL: `supabase-setup.sql`
- Model download script: `download-models.ps1`

## ✨ Next Steps

1. **Test Registration**: Create a test account
2. **Test Login**: Login with your face
3. **Explore App**: Access the main WeCare application
4. **Customize**: Adjust face matching threshold in `src/utils/faceRecognition.js`

---

**Need Help?** Check the browser console for detailed error messages.
