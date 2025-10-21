import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  loadModels, 
  detectFace, 
  startVideo, 
  stopVideo, 
  descriptorToArray 
} from '../utils/faceRecognition';

const FaceRegister = ({ onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const isCapturingRef = useRef(false);

  useEffect(() => {
    // Load models on component mount
    loadModels()
      .then(() => {
        setModelsLoaded(true);
        setStatus('Models loaded. Ready to capture face.');
      })
      .catch((error) => {
        setStatus('Error loading models: ' + error.message);
      });

    return () => {
      if (streamRef.current) {
        stopVideo(videoRef.current);
      }
    };
  }, []);

  const startCapture = async () => {
    if (!modelsLoaded) {
      setStatus('Please wait for models to load...');
      return;
    }

    try {
      setStatus('Starting camera...');
      streamRef.current = await startVideo(videoRef.current);
      setIsCapturing(true);
      isCapturingRef.current = true;
      setStatus('Camera started. Position your face in the frame.');
      
      // Wait for video to be ready before starting detection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Start detecting faces
      detectFaceLoop();
    } catch (error) {
      console.error('Start capture error:', error);
      setStatus('Error: ' + error.message);
    }
  };

  const detectFaceLoop = async () => {
    if (!videoRef.current || !isCapturingRef.current) {
      return;
    }

    // Check if video is ready
    if (videoRef.current.readyState !== 4) {
      setTimeout(detectFaceLoop, 100);
      return;
    }

    try {
      const detection = await detectFace(videoRef.current);
      
      if (detection) {
        setFaceDetected(true);
        setStatus('Face detected! Ready to register.');
      } else {
        setFaceDetected(false);
        setStatus('No face detected. Please position your face clearly.');
      }
    } catch (error) {
      console.error('Detection error:', error);
      setStatus('Detection error: ' + error.message);
    }

    // Continue loop
    if (isCapturingRef.current) {
      setTimeout(detectFaceLoop, 100);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setStatus('Please fill in all fields.');
      return;
    }

    // Client-side password policy: Supabase requires at least 6 characters by default.
    if (password.trim().length < 6) {
      setStatus('Password must be at least 6 characters.');
      return;
    }

    if (!faceDetected) {
      setStatus('No face detected. Please ensure your face is clearly visible.');
      return;
    }

    try {
      setStatus('Capturing face data...');
      
      // Detect face and get descriptor
      const detection = await detectFace(videoRef.current);
      
      if (!detection) {
        setStatus('Failed to detect face. Please try again.');
        return;
      }

      const faceDescriptor = descriptorToArray(detection.descriptor);
      
      setStatus('Registering user...');

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('supabase signUp response', { authData, authError });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setStatus('This email is already registered. Please use a different email or try logging in.');
        } else {
          setStatus('Registration error: ' + authError.message);
        }
        return;
      }

      // Ensure we have a user id from the auth response. supabase may return
      // data.user or leave it null if email confirmation is required.
      const userId = authData?.user?.id ?? authData?.id ?? null;
      if (!userId) {
        // If no user id, log full authData and show message to check email confirmation.
        console.error('No user id returned from signUp', authData);
        setStatus('Registration initiated. Please check your email to confirm your account before proceeding.');
        return;
      }

      // Store user profile with face data
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: userId,
            name,
            email,
            face_descriptor: faceDescriptor,
          },
        ]);

      console.log('profile insert response', { profileData, profileError });

      if (profileError) {
        if (profileError.code === '23505') {
          setStatus('This email is already registered. Please use a different email or try logging in.');
        } else {
          setStatus('Error saving profile: ' + profileError.message);
        }
        return;
      }

      setStatus('Registration successful!');
      stopVideo(videoRef.current);
      setIsCapturing(false);
      isCapturingRef.current = false;
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error) {
      setStatus('Error: ' + error.message);
      console.error('Registration error:', error);
    }
  };

  const handleCancel = () => {
    stopVideo(videoRef.current);
    setIsCapturing(false);
    isCapturingRef.current = false;
    if (onCancel) onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Register with Face Recognition</h2>
          
          {/* Form Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Video Preview */}
          <div className="mb-6">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {faceDetected && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Face Detected ✓
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`mb-4 p-3 rounded-lg ${
              status.includes('Error') || status.includes('Failed') 
                ? 'bg-red-100 text-red-700' 
                : status.includes('successful')
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {status}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isCapturing ? (
              <>
                <button
                  onClick={startCapture}
                  disabled={!modelsLoaded}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Start Camera
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleRegister}
                  disabled={!faceDetected}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Register
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRegister;
