# WeCare - Blockchain Crowdfunding with Face Recognition Auth

A decentralized crowdfunding platform built on Ethereum blockchain with advanced facial recognition authentication.

## 🌟 Features

### Blockchain Features
- **Decentralized Campaigns** - Create and manage fundraising campaigns on blockchain
- **Transparent Donations** - All transactions recorded on-chain
- **Smart Contract Integration** - Secure fund management with Solidity contracts
- **MetaMask Integration** - Connect your Web3 wallet
- **Campaign Withdrawal** - Campaign owners can withdraw funds

### Face Recognition Authentication
- **Secure Registration** - Register using facial biometrics
- **Passwordless Login** - Login with your face
- **Real-time Detection** - Live face detection feedback
- **Supabase Backend** - Cloud storage for user profiles
- **Privacy First** - Only mathematical descriptors stored, not images

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MetaMask browser extension
- Webcam/camera for face authentication
- Supabase account

### Installation

1. **Clone and Install**
```bash
cd WeCare
npm install
```

2. **Setup Supabase Database**
   - Follow instructions in `SUPABASE_SETUP_GUIDE.md`
   - Or run the SQL in `supabase-setup.sql` in your Supabase SQL Editor

3. **Verify Models**
   - Face recognition models are already downloaded in `public/models/`
   - If missing, run: `powershell -ExecutionPolicy Bypass -File download-models.ps1`

4. **Run the Application**
```bash
npm run dev
```

5. **Open in Browser**
   - Navigate to `http://localhost:5173`
   - Grant camera permissions when prompted

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 3 steps
- **[SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md)** - Detailed Supabase setup
- **[FACE_AUTH_SETUP.md](FACE_AUTH_SETUP.md)** - Complete authentication guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## 🏗️ Project Structure

```
WeCare/
├── src/
│   ├── components/
│   │   ├── AuthPage.jsx              # Authentication landing page
│   │   ├── FaceRegister.jsx          # Face registration component
│   │   ├── FaceLogin.jsx             # Face login component
│   │   ├── Header.jsx                # App header with user profile
│   │   ├── CampaignList.jsx          # Display all campaigns
│   │   ├── CreateCampaignModal.jsx   # Create new campaign
│   │   └── ...                       # Other components
│   ├── contexts/
│   │   └── AuthContext.jsx           # Authentication context
│   ├── utils/
│   │   └── faceRecognition.js        # Face recognition utilities
│   ├── supabaseClient.js             # Supabase configuration
│   ├── web3.js                       # Web3 contract integration
│   ├── abi.js                        # Smart contract ABI
│   └── App.jsx                       # Main application
├── public/
│   └── models/                       # Face-api.js ML models
├── supabase-setup.sql                # Database setup script
├── download-models.ps1               # Model download script
└── README.md                         # This file
```

## 🔐 Authentication Flow

### Registration
1. User enters name, email, and password
2. Camera activates and detects face
3. System extracts 128-dimensional face descriptor
4. User account created in Supabase Auth
5. Profile with face data stored in database

### Login
1. Camera activates and detects face
2. System extracts face descriptor
3. Compares with all registered faces
4. Authenticates if match found (Euclidean distance < 0.6)
5. User logged in and redirected to app

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **face-api.js** - Face recognition
- **Web3.js** - Blockchain interaction
- **ethers.js** - Ethereum library

### Backend
- **Supabase** - Authentication and database
- **PostgreSQL** - Database (via Supabase)
- **Smart Contracts** - Solidity (Ethereum)

### ML Models
- **TinyFaceDetector** - Fast face detection
- **FaceLandmark68** - Facial landmark detection
- **FaceRecognition** - Face descriptor extraction
- **FaceExpression** - Expression analysis

## 🔧 Configuration

### Supabase Configuration
File: `src/supabaseClient.js`
```javascript
const supabaseUrl = 'https://bnxwqomkrimztfohnyrb.supabase.co';
const supabaseAnonKey = 'your-anon-key';
```

### Face Matching Threshold
File: `src/utils/faceRecognition.js`
```javascript
export const compareFaces = (descriptor1, descriptor2, threshold = 0.6) => {
  // Adjust threshold: 0.5 (strict) to 0.7 (lenient)
}
```

### Smart Contract
File: `src/web3.js`
- Update contract address
- Ensure ABI matches deployed contract

## 📊 Database Schema

### user_profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  face_descriptor FLOAT8[128] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔒 Security Features

- **Row Level Security (RLS)** - Database access control
- **Face Descriptors** - Mathematical data, not images
- **Encrypted Storage** - Data encrypted at rest
- **HTTPS Only** - Secure data transmission
- **JWT Tokens** - Secure session management
- **Camera Permissions** - User must grant access

## 🧪 Testing

### Test Registration
```bash
# Start the app
npm run dev

# In browser:
1. Click "Register with Face"
2. Enter test credentials
3. Complete face capture
4. Verify in Supabase Dashboard
```

### Test Login
```bash
# In browser:
1. Click "Login with Face"
2. Position face in camera
3. Click "Login"
4. Should authenticate successfully
```

## 🐛 Troubleshooting

### Camera Not Working
- Grant camera permissions in browser
- Ensure camera not in use by other apps
- Use HTTPS or localhost

### Models Not Loading
- Verify all 9 files in `public/models/`
- Check browser console for 404 errors
- Re-run `download-models.ps1`

### Face Not Detected
- Improve lighting conditions
- Face camera directly
- Remove glasses or masks
- Move closer to camera

### Database Errors
- Run `supabase-setup.sql` in Supabase
- Enable email authentication
- Check RLS policies are active

## 📈 Performance

- **Model Load Time:** 2-5 seconds (first time)
- **Face Detection:** ~10 FPS
- **Face Matching:** < 100ms per comparison
- **Total Models Size:** ~7.3 MB

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to Vercel, Netlify, etc.
```

### Environment Variables
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Production Checklist
- [ ] Enable email confirmation in Supabase
- [ ] Configure custom SMTP
- [ ] Set up rate limiting
- [ ] Enable 2FA on Supabase account
- [ ] Use environment variables
- [ ] Deploy smart contracts to mainnet
- [ ] Test all features in production

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **face-api.js** - Face recognition library
- **Supabase** - Backend infrastructure
- **Ethereum** - Blockchain platform
- **TensorFlow.js** - Machine learning framework

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review browser console
3. Check Supabase logs
4. Open an issue on GitHub

## 🎯 Roadmap

- [ ] Multi-factor authentication
- [ ] Liveness detection
- [ ] Mobile app version
- [ ] Admin dashboard
- [ ] Analytics integration
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Email notifications

---

**Built with ❤️ for the blockchain community**
