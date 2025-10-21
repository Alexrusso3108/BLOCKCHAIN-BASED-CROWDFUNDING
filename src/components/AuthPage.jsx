import React, { useState } from 'react';
import FaceRegister from './FaceRegister';
import FaceLogin from './FaceLogin';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WeCare</h1>
          <p className="text-gray-600">Secure Face Recognition Authentication</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setShowLogin(true)}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Login with Face
          </button>

          <button
            onClick={() => setShowRegister(true)}
            className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Register with Face
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Your face data is securely encrypted and stored</p>
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
