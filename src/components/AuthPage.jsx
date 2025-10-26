import React, { useState } from 'react';
import FaceRegister from './FaceRegister';
import FaceLogin from './FaceLogin';
import ProfileCard from './ProfileCard';

const AuthPage = ({ onAuthSuccess }) => {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    alert('Registration successful! You can now login with your face.');
  };

  const handleLoginSuccess = (userData) => {
    setShowLogin(false);
    if (onAuthSuccess) {
      onAuthSuccess(userData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 3D Cryptocurrency Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Bitcoin Symbols */}
        <div className="absolute top-20 left-16 w-28 h-28 bg-gradient-to-br from-orange-200/60 to-yellow-200/60 rounded-full flex items-center justify-center animate-float shadow-2xl backdrop-blur-sm border border-orange-300/30">
          <span className="text-5xl font-bold text-orange-600/80">₿</span>
        </div>
        <div className="absolute top-32 right-24 w-24 h-24 bg-gradient-to-br from-amber-200/60 to-orange-300/60 rounded-full flex items-center justify-center animate-float-delayed shadow-2xl backdrop-blur-sm border border-amber-300/30">
          <span className="text-4xl font-bold text-amber-700/80">₿</span>
        </div>
        <div className="absolute bottom-40 left-24 w-20 h-20 bg-gradient-to-br from-yellow-200/60 to-orange-200/60 rounded-full flex items-center justify-center animate-float-slow shadow-2xl backdrop-blur-sm border border-yellow-300/30">
          <span className="text-3xl font-bold text-orange-600/80">₿</span>
        </div>
        <div className="absolute bottom-1/4 right-16 w-24 h-24 bg-gradient-to-br from-orange-300/60 to-amber-200/60 rounded-full flex items-center justify-center animate-float shadow-2xl backdrop-blur-sm border border-orange-300/30">
          <span className="text-4xl font-bold text-orange-700/80">₿</span>
        </div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-amber-100/60 to-yellow-200/60 rounded-full flex items-center justify-center animate-float-delayed shadow-xl backdrop-blur-sm border border-amber-200/30">
          <span className="text-2xl font-bold text-amber-600/80">₿</span>
        </div>
        
        {/* Floating Ethereum Symbols */}
        <div className="absolute top-40 left-1/4 w-24 h-24 bg-gradient-to-br from-indigo-200/60 to-purple-200/60 rounded-full flex items-center justify-center animate-float-slow shadow-2xl backdrop-blur-sm border border-indigo-300/30">
          <span className="text-4xl font-bold text-indigo-600/80">Ξ</span>
        </div>
        <div className="absolute top-1/2 left-12 w-20 h-20 bg-gradient-to-br from-purple-200/60 to-indigo-300/60 rounded-full flex items-center justify-center animate-float shadow-2xl backdrop-blur-sm border border-purple-300/30">
          <span className="text-3xl font-bold text-purple-600/80">Ξ</span>
        </div>
        <div className="absolute bottom-32 right-32 w-28 h-28 bg-gradient-to-br from-blue-200/60 to-indigo-200/60 rounded-full flex items-center justify-center animate-float-delayed shadow-2xl backdrop-blur-sm border border-blue-300/30">
          <span className="text-5xl font-bold text-indigo-700/80">Ξ</span>
        </div>
        <div className="absolute bottom-1/2 right-12 w-20 h-20 bg-gradient-to-br from-indigo-300/60 to-blue-200/60 rounded-full flex items-center justify-center animate-float-slow shadow-2xl backdrop-blur-sm border border-indigo-300/30">
          <span className="text-3xl font-bold text-indigo-600/80">Ξ</span>
        </div>
        <div className="absolute top-2/3 left-1/3 w-16 h-16 bg-gradient-to-br from-purple-100/60 to-indigo-200/60 rounded-full flex items-center justify-center animate-float shadow-xl backdrop-blur-sm border border-purple-200/30">
          <span className="text-2xl font-bold text-purple-600/80">Ξ</span>
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 left-10 w-72 h-72 bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-full filter blur-3xl animate-pulse-slower"></div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(18deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(-12deg); }
          50% { transform: translateY(-25px) rotate(-18deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(-15px) rotate(50deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.08); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 10s ease-in-out infinite;
        }
      `}</style>

      <div className="relative z-10 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] max-w-md w-full p-10 border border-white/50">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <img src="/weCareLogo.png" alt="WeCare" className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-2 tracking-tight">
            WeCare
          </h1>
          <p className="text-slate-600 text-base font-medium">Blockchain Crowdfunding Platform</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
            <p className="text-sm text-slate-500">Secure Face Recognition Auth</p>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => setShowLogin(true)}
            className="group relative w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3.5 px-6 rounded-xl font-semibold text-base hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5"
          >
            <div className="relative flex items-center justify-center gap-2.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Login with Face</span>
            </div>
          </button>

          <button
            onClick={() => setShowRegister(true)}
            className="group relative w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3.5 px-6 rounded-xl font-semibold text-base hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-0.5"
          >
            <div className="relative flex items-center justify-center gap-2.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Register with Face</span>
            </div>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200/60 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Powered by blockchain technology • Your data stays yours
          </p>
        </div>
      </div>

      {showRegister && (
        <FaceRegister
          onSuccess={handleRegisterSuccess}
          onCancel={() => setShowRegister(false)}
        />
      )}

      {showLogin && (
        <FaceLogin
          onSuccess={handleLoginSuccess}
          onCancel={() => setShowLogin(false)}
        />
      )}
    </div>
  );
};

export default AuthPage;
