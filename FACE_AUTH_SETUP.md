# Face Recognition Authentication Setup Guide

## Overview
This application now includes facial recognition authentication using face-api.js and Supabase for secure user registration and login.

## Prerequisites
1. Node.js and npm installed
2. Supabase account and project
3. Webcam/camera access

## Supabase Database Setup

### 1. Create the `user_profiles` table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  face_descriptor FLOAT8[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
```

### 2. Enable Email Authentication

1. Go to Authentication > Providers in Supabase Dashboard
2. Enable Email provider
3. Configure email templates if needed

## Face-api.js Models Setup

### Download Required Models

You need to download the face-api.js models and place them in the `public/models` directory:

1. Create a `models` folder in your `public` directory:
   ```bash
   mkdir public/models
   ```

2. Download the following model files from the [face-api.js models repository](https://github.com/justadudewhohacks/face-api.js/tree/master/weights):
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`
   - `face_recognition_model-shard2`
   - `face_expression_model-weights_manifest.json`
   - `face_expression_model-shard1`

3. Place all downloaded files in `public/models/`

**Quick Download Command (if you have curl):**
```bash
cd public/models

# Tiny Face Detector
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1

# Face Landmark 68
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1

# Face Recognition
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2

# Face Expression
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. The following packages have been added:
   - `@supabase/supabase-js` - Supabase client
   - `face-api.js` - Face recognition library

## Configuration

The Supabase configuration is already set up in `src/supabaseClient.js` with your provided credentials:
- Supabase URL: `https://bnxwqomkrimztfohnyrb.supabase.co`
- Anon Key: Already configured

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to the local development URL (usually `http://localhost:5173`)

## How It Works

### Registration Flow
1. User enters name, email, and password
2. User clicks "Start Camera" to activate webcam
3. System detects face and extracts facial features (128-dimensional descriptor)
4. User clicks "Register" to save:
   - User account in Supabase Auth
   - Profile data with face descriptor in `user_profiles` table

### Login Flow
1. User clicks "Start Camera" to activate webcam
2. System detects face and extracts facial features
3. System compares current face with all registered faces in database
4. If match found (Euclidean distance < 0.6), user is authenticated
5. User is logged in and redirected to main application

## Security Features

- Face descriptors are stored as 128-dimensional float arrays
- Supabase Row Level Security (RLS) ensures users can only access their own data
- Face comparison uses Euclidean distance with configurable threshold
- Camera access requires user permission

## Troubleshooting

### Camera Not Working
- Ensure browser has camera permissions
- Check if camera is being used by another application
- Try using HTTPS (some browsers require secure context for camera access)

### Models Not Loading
- Verify all model files are in `public/models/` directory
- Check browser console for 404 errors
- Ensure file names match exactly

### Face Not Detected
- Ensure good lighting conditions
- Position face clearly in frame
- Remove glasses or face coverings if possible
- Try adjusting camera angle

### Database Errors
- Verify Supabase table is created correctly
- Check RLS policies are enabled
- Ensure email authentication is enabled in Supabase

## File Structure

```
src/
├── components/
│   ├── AuthPage.jsx          # Main authentication page
│   ├── FaceRegister.jsx       # Registration component
│   ├── FaceLogin.jsx          # Login component
│   └── Header.jsx             # Updated with logout
├── contexts/
│   └── AuthContext.jsx        # Authentication context
├── utils/
│   └── faceRecognition.js     # Face recognition utilities
├── supabaseClient.js          # Supabase configuration
└── App.jsx                    # Updated with auth integration

public/
└── models/                    # Face-api.js model files (to be added)
```

## API Reference

### Face Recognition Utilities

- `loadModels()` - Load face-api.js models
- `detectFace(videoElement)` - Detect face and extract descriptor
- `compareFaces(descriptor1, descriptor2, threshold)` - Compare two face descriptors
- `startVideo(videoElement)` - Start webcam stream
- `stopVideo(videoElement)` - Stop webcam stream

### Supabase Client

- `supabase.auth.signUp()` - Register new user
- `supabase.auth.signOut()` - Logout user
- `supabase.from('user_profiles')` - Query user profiles table

## Future Enhancements

- Multi-factor authentication
- Face liveness detection
- Support for multiple face registrations per user
- Admin dashboard for user management
- Face recognition confidence score display

## Support

For issues or questions, please check:
1. Browser console for error messages
2. Supabase dashboard for database issues
3. Camera permissions in browser settings
